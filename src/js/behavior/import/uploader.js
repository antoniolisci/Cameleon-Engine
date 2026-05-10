// Orchestrates file reading, parsing, mapping and validation for trade CSV or XLSX files.
// Architecture extensible : le pipeline traduit tout fichier externe vers le modèle interne
// { timestamp, symbol, side, price, quantity, fee } — indépendamment de la plateforme source.

import { parseCSV } from './parser.js';
import { mapBinanceSpotRow, enableTradeDebug } from '../normalize/mappers/binance_spot.js';
import { isValidTrade } from '../normalize/validator.js';
import { validateTrades } from '../normalize/trade-validator.js';
import { analyzeWallet } from '../wallet/wallet_analyzer.js';

// ── Normalisation des en-têtes ────────────────────────────────────────────────
// Minuscules + suppression diacritiques + normalisation séparateurs.
// "Côté" → "cote"  ·  "Avg. Price" → "avg price"  ·  "Date(UTC)" → "date(utc)"
function normalizeHeader(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // supprime diacritiques (accents, cédilles…)
    .replace(/[\s_./\\-]+/g, ' ')      // normalise séparateurs variés en espace simple
    .trim();
}

// ── Matching de champ tolérant mais contrôlé ──────────────────────────────────
// col     : header normalisé du fichier  ("executed qty", "trading pair", "date utc"…)
// signals : liste de signaux normalisés  (['executed', 'qty', 'quantity'…])
//
// Règles appliquées dans l'ordre (première match gagne) :
//   1. Correspondance exacte            —  "qty" === "qty"
//   2. Signal = préfixe complet du col  —  "date" dans "date utc"
//   3. Signal = suffixe complet du col  —  "qty" dans "executed qty"
//   4. Signal = token intérieur du col  —  "filled" dans "avg filled price"
//
// Protection anti-collision : signaux < 4 caractères → règle 1 uniquement (exact).
function matchesField(col, signals) {
  for (const sig of signals) {
    if (col === sig)                       return true;   // exact
    if (sig.length < 4)                    continue;      // trop court → exact seulement
    if (col.startsWith(sig + ' '))         return true;   // préfixe  : "date utc"
    if (col.endsWith(' ' + sig))           return true;   // suffixe  : "executed qty"
    if (col.includes(' ' + sig + ' '))     return true;   // intérieur : "avg filled price"
  }
  return false;
}

// ── Signaux de détection des 5 champs du modèle interne ──────────────────────
// Formes normalisées (sortie de normalizeHeader).
// Utilisés uniquement pour la classification — pas pour le mapping final des données.
const DETECT_DATE   = ['date(utc)', 'date', 'utc time', 'time', 'timestamp', 'trade time',
                       'heure', 'date et heure', 'created time', 'open time', 'update time', 'created at'];
const DETECT_SYMBOL = ['pair', 'symbol', 'market', 'paire'];
const DETECT_SIDE   = ['side', 'direction', 'cote', 'sens'];
const DETECT_PRICE  = ['price', 'avg price', 'filled price', 'average price',
                       'execution price', 'deal price', 'order price', 'prix', 'prix moyen'];
const DETECT_QTY    = ['executed', 'qty', 'quantity', 'filled', 'execute', 'quantite', 'qte', 'vol'];

// ── Classification du fichier ─────────────────────────────────────────────────
// Retourne : { level: 'FULL_TRADING' | 'PARTIAL_TRADING' | 'NON_TRADING', subtype }
//
// Comportement :
//   FULL_TRADING    (≥ 4 signaux / 5) → import accepté, analyse complète
//   PARTIAL_TRADING (2–3 signaux)     → import accepté, analyse indicative (flag partial)
//   NON_TRADING                       → import refusé pour l'analyse trading
//     ↳ wallet  → pipeline wallet dédié si disponible
//     ↳ earn    → message propre
//     ↳ unknown → message propre

function classifyFile(headers) {
  const raw = headers.map(h => String(h).toLowerCase().trim());
  const h   = headers.map(normalizeHeader);

  const tradingSignals =
    (h.some(c => matchesField(c, DETECT_DATE))   ? 1 : 0) +
    (h.some(c => matchesField(c, DETECT_SYMBOL)) ? 1 : 0) +
    (h.some(c => matchesField(c, DETECT_SIDE))   ? 1 : 0) +
    (h.some(c => matchesField(c, DETECT_PRICE))  ? 1 : 0) +
    (h.some(c => matchesField(c, DETECT_QTY))    ? 1 : 0);

  // Signaux wallet : historique de mouvements de compte (dépôts / retraits / transferts)
  const walletSignals =
    (raw.some(c => c === 'operation' || c.startsWith('operation ')) ? 1 : 0) +
    (raw.some(c => c === 'coin' || c === 'asset')                   ? 1 : 0) +
    (raw.some(c => c === 'change')                                   ? 1 : 0);

  // Signaux earn : colonnes _EMPTY_ = SheetJS sur fichier épargne aux headers fusionnés,
  // ou colonnes explicites d'intérêts / staking.
  const emptyCount = raw.filter(c => c.startsWith('_empty') || c === '' || c.startsWith('unnamed:')).length;
  const earnSignals =
    (emptyCount >= 2 && emptyCount / headers.length >= 0.2                                           ? 1 : 0) +
    (h.some(c => ['interest', 'apy', 'apr', 'accrued interest', 'annual interest rate'].includes(c)) ? 1 : 0);

  console.debug('[bhv:classify] signals → trading:%d wallet:%d earn:%d | colonnes: %s',
    tradingSignals, walletSignals, earnSignals, headers.join(', '));

  if (earnSignals  >= 1 && tradingSignals < 3) return { level: 'NON_TRADING',     subtype: 'earn'    };
  if (walletSignals >= 2 && tradingSignals < 3) return { level: 'NON_TRADING',     subtype: 'wallet'  };
  if (tradingSignals >= 4)                      return { level: 'FULL_TRADING',    subtype: 'trade'   };
  if (tradingSignals >= 2)                      return { level: 'PARTIAL_TRADING', subtype: 'trade'   };
  return                                               { level: 'NON_TRADING',     subtype: 'unknown' };
}

// ── File readers ──────────────────────────────────────────────────────────────

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.readAsText(file, 'UTF-8');
  });
}

// Charge SheetJS depuis CDN si pas déjà disponible, retourne l'objet XLSX global.
function loadXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const script  = document.createElement('script');
    script.src    = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
    script.onload  = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Impossible de charger le module xlsx. Utilisez un fichier CSV.'));
    document.head.appendChild(script);
  });
}

// Lit un fichier .xlsx et retourne un tableau de row-objects (première feuille).
async function readFileAsXLSX(file) {
  const XLSX   = await loadXLSX();
  const buffer = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.readAsArrayBuffer(file);
  });
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' });
}

// ── Import pipeline ───────────────────────────────────────────────────────────

async function importBinanceSpot(file) {
  const ext    = file.name.split('.').pop().toLowerCase();
  const isXLSX = ext === 'xlsx' || ext === 'xls';

  // [DEBUG TEMPORAIRE]
  console.log('[bhv:file]', { name: file.name, type: file.type, size: file.size });
  console.log('[bhv:file] isXLSX:', isXLSX);
  console.log('[bhv:file] branch:', isXLSX ? 'XLSX' : 'CSV');

  let rows;
  try {
    if (isXLSX) {
      rows = await readFileAsXLSX(file);
    } else {
      const text = await readFileAsText(file);
      rows = parseCSV(text);
      // [DEBUG TEMPORAIRE]
      if (!rows || rows.length === 0) {
        console.warn('[bhv:csv] aucune ligne parsée');
      } else {
        console.log('[bhv:csv] rows count:', rows.length);
        console.log('[bhv:csv] first row:', rows[0]);
      }
    }
  } catch (err) {
    return { ok: false, error: 'Impossible de lire le fichier. Vérifiez qu\'il n\'est pas corrompu.', trades: [] };
  }

  if (!rows || rows.length === 0) {
    return { ok: false, error: 'Le fichier est vide ou son format n\'a pas pu être lu.', trades: [] };
  }

  const headers        = Object.keys(rows[0]);
  const classification = classifyFile(headers);
  const { level, subtype } = classification;

  // NON_TRADING / wallet → pipeline wallet dédié
  if (level === 'NON_TRADING' && subtype === 'wallet') {
    console.debug('[bhv:import] fichier wallet — branchement analyzeWallet()');
    let walletResult;
    try {
      walletResult = analyzeWallet(rows);
    } catch (err) {
      console.warn('[bhv:import] analyzeWallet() a levé une exception:', err);
      return { ok: false, error: 'Fichier wallet détecté mais non exploitable. Vérifiez l\'export.', trades: [] };
    }
    return {
      ok:      true,
      message: 'Fichier wallet détecté — analyse comportementale financière appliquée.',
      ...walletResult
    };
  }

  // NON_TRADING / earn → message clair, pas d'analyse trading
  if (level === 'NON_TRADING' && subtype === 'earn') {
    return {
      ok:    false,
      error: 'Ce fichier correspond à un historique d\'épargne (Earn / Staking). L\'analyse trading n\'est pas applicable.',
      trades: []
    };
  }

  // NON_TRADING / unknown → message clair
  if (level === 'NON_TRADING') {
    return {
      ok:    false,
      error: 'Format de fichier non reconnu. Vérifiez que l\'import provient d\'un historique de trades exécutés.',
      trades: []
    };
  }

  // FULL_TRADING ou PARTIAL_TRADING → pipeline trades (les deux niveaux sont acceptés)
  const sessionId = `session_${Date.now()}`;
  const trades  = [];
  let   skipped = 0;

  enableTradeDebug();   // [DEBUG TEMPORAIRE] — active le log sur la 1re ligne uniquement
  for (const row of rows) {
    const trade = mapBinanceSpotRow(row, sessionId);
    if (trade && isValidTrade(trade)) {
      trades.push(trade);
    } else {
      skipped++;
    }
  }

  if (trades.length === 0) {
    const hint = level === 'PARTIAL_TRADING'
      ? 'Certaines colonnes ont été détectées mais aucun trade valide n\'a pu être extrait. Les données sont peut-être dans un format non supporté.'
      : 'Aucun trade valide trouvé. Vérifiez que l\'export correspond à des ordres exécutés (pas annulés ou en attente).';
    console.debug('[bhv:import] 0 trades extraits | level=%s | colonnes=%s', level, headers.join(', '));
    return { ok: false, error: hint, trades: [] };
  }

  const analysisQuality = level === 'PARTIAL_TRADING' ? 'partial' : 'full';

  const validation = validateTrades(trades);

  return { ok: true, type: 'trades', trades, skipped, sessionId, analysisQuality,
           validationWarning: !validation.isValid, validationWarnings: validation.warnings };
}

export { importBinanceSpot };
