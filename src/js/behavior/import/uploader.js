// Orchestrates file reading, parsing, mapping and validation for trade CSV or XLSX files.
// Architecture extensible : le pipeline traduit tout fichier externe vers le modèle interne
// { timestamp, symbol, side, price, quantity, fee } — indépendamment de la plateforme source.

import { parseCSV, detectSeparator, splitLine } from './parser.js';
import { mapBinanceSpotRow } from '../normalize/mappers/binance_spot.js';
import { mapOrderRows } from '../normalize/mappers/binance_order.js';
import { isValidTrade } from '../normalize/validator.js';
import { validateTrades } from '../normalize/trade-validator.js';
import { analyzeWallet } from '../wallet/wallet_analyzer.js';
import { detectFormat } from './format-detector.js';
import { analyzeOrders } from '../analytics/order-analyzer.js';

console.info('[BEHAVIOR IMPORT VERSION] 52cab1a Binance FR fix loaded');

// ── Normalisation des en-têtes ────────────────────────────────────────────────
// Minuscules + suppression diacritiques + normalisation séparateurs.
// "Côté" → "cote"  ·  "Avg. Price" → "avg price"  ·  "Date(UTC)" → "date(utc)"
function normalizeHeader(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')      // supprime diacritiques (accents, cédilles…)
    .replace(/[\s_./\\()+\-]+/g, ' ')    // normalise séparateurs + parenthèses et +
                                          // "Date(UTC+2)" → "date utc 2"
                                          // "Date(UTC)"   → "date utc"
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
// 'type' inclus ici pour la CLASSIFICATION uniquement (pas pour le mapping).
// Un export avec une colonne "Type" contenant BUY/SELL est un fichier trading valide.
// La distinction LIMIT/MARKET vs BUY/SELL est gérée par le fallback dans normalizeTrade.
const DETECT_SIDE   = ['side', 'direction', 'cote', 'sens', 'type'];
const DETECT_PRICE  = ['price', 'avg price', 'filled price', 'average price',
                       'execution price', 'deal price', 'order price', 'prix', 'prix moyen'];
const DETECT_QTY    = ['executed', 'qty', 'quantity', 'filled', 'execute', 'quantite', 'qte', 'vol'];

// ── Détection de la vraie ligne d'en-têtes ────────────────────────────────────
// Certains exports Binance XLSX (et parfois CSV) commencent par des lignes de titre
// ("Historique d'ordre Spot"), de métadonnées (Nom, E-mail…) avant le vrai tableau.
// On scanne jusqu'à 30 lignes et on retourne l'index de la première qui contient
// au moins 3 groupes de signaux distincts (date, paire, côté, prix, quantité, montant…).

const HDR_GROUPS = [
  ['date', 'duree', 'time', 'timestamp', 'heure', 'utc time', 'trade time',
   'open time', 'created time', 'update time', 'created at'],
  ['pair', 'paire', 'symbol', 'market', 'ticker', 'trading pair'],
  ['side', 'cote', 'direction', 'sens', 'type'],
  ['price', 'prix', 'avg price', 'prix moyen', 'deal price', 'order price'],
  ['executed', 'execute', 'filled', 'qty', 'quantity', 'quantite', 'vol'],
  ['amount', 'montant', 'total', 'value', 'valeur'],
  ['fee', 'frais', 'commission', 'status', 'statut', 'order id', 'orderid'],
];

// cells : string[] — valeurs brutes d'une ligne (pas encore normalisées).
function isHeaderRow(cells) {
  const norm = cells.map(c => normalizeHeader(String(c || '')));
  let matched = 0;
  for (const group of HDR_GROUPS) {
    if (norm.some(cell => matchesField(cell, group))) {
      if (++matched >= 3) return true;
    }
  }
  return false;
}

// rows2d : string[][] — toutes les lignes du fichier sous forme de tableaux de cellules.
// Retourne l'index de la première ligne reconnue comme en-têtes, ou -1.
function findHeaderRowIndex(rows2d) {
  const limit = Math.min(30, rows2d.length);
  for (let i = 0; i < limit; i++) {
    if (isHeaderRow(rows2d[i])) return i;
  }
  return -1;
}

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

// Charge SheetJS depuis le vendor local (src/js/vendor/xlsx.full.min.js).
// Pas de dépendance CDN — fonctionne hors-ligne, local-first.
function loadXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const script  = document.createElement('script');
    script.src    = new URL('../../vendor/xlsx.full.min.js', import.meta.url).href;
    script.onload  = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Impossible de charger le module xlsx local. Vérifiez que src/js/vendor/xlsx.full.min.js est présent.'));
    document.head.appendChild(script);
  });
}

// Lit un fichier .xlsx et retourne un tableau de row-objects (première feuille).
// Utilise le mode array brut ({ header: 1 }) pour détecter la vraie ligne d'en-têtes,
// même si le fichier commence par des lignes de titre ou de métadonnées Binance.
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

  // Lecture en tableau 2D pour scanner librement les lignes d'en-têtes.
  const raw2d = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });

  const headerIdx = findHeaderRowIndex(raw2d);
  console.log('[IMPORT DEBUG] XLSX headerRowIndex =', headerIdx,
    headerIdx >= 0 ? `| ligne : ${JSON.stringify(raw2d[headerIdx])}` : '| introuvable');

  if (headerIdx === -1) {
    throw new Error('NO_HEADER_FOUND');
  }

  const headers = raw2d[headerIdx].map(h => String(h || '').trim());
  console.log('[IMPORT DEBUG] XLSX detectedHeaderRow =', headers);

  const rows = [];
  for (let i = headerIdx + 1; i < raw2d.length; i++) {
    const cells = raw2d[i];
    // Sauter les lignes entièrement vides
    if (!cells || cells.every(c => c === '' || c === null || c === undefined)) continue;
    const row = {};
    headers.forEach((h, j) => {
      row[h] = (cells[j] !== undefined && cells[j] !== null) ? String(cells[j]).trim() : '';
    });
    rows.push(row);
  }
  return rows;
}

// ── Import pipeline ───────────────────────────────────────────────────────────

async function importBinanceSpot(file) {
  const ext    = file.name.split('.').pop().toLowerCase();

  // ── Garde ZIP ────────────────────────────────────────────────────────────────
  // Binance propose parfois des exports zippés. Sans décompression, le fichier
  // n'est pas lisible — on indique clairement quoi faire plutôt que de planter.
  if (ext === 'zip') {
    return {
      ok:    false,
      error: 'Format ZIP non supporté. Décompressez l\'archive et importez directement le fichier CSV ou Excel qu\'elle contient.',
      trades: []
    };
  }

  const isXLSX = ext === 'xlsx' || ext === 'xls';
  console.log('[bhv:import] fichier : "%s" · extension : %s · type lu : %s',
    file.name, ext, isXLSX ? 'xlsx/xls (SheetJS)' : 'texte (CSV)');

  // ── Collecte des données brutes pour le diagnostic ───────────────────────────
  let rawText    = null;
  let rawLines   = null;
  let rawSep     = null;
  let hasBOM     = false;

  let rows;
  try {
    if (isXLSX) {
      rows = await readFileAsXLSX(file);
    } else {
      const text = await readFileAsText(file);
      hasBOM   = text.startsWith('\ufeff');
      rawText  = text;
      const clean = text.replace(/^\ufeff/, '');
      rawLines = clean.trim().split(/\r?\n/);

      // Détection du séparateur sur la première ligne non-vide
      const firstNonEmpty = rawLines.find(l => l.trim().length > 0) || '';
      rawSep = detectSeparator(firstNonEmpty);

      // Scanner les 30 premières lignes pour trouver la vraie ligne d'en-têtes.
      // Chaque ligne est découpée avec quote-handling pour éviter les faux négatifs.
      const lines2d    = rawLines.map(l => splitLine(l, rawSep).map(c => c.replace(/^"|"$/g, '').trim()));
      const csvHdrIdx  = findHeaderRowIndex(lines2d);
      const startLine  = csvHdrIdx >= 0 ? csvHdrIdx : 0;  // fallback 0 : comportement antérieur
      console.log('[IMPORT DEBUG] CSV headerRowIndex =', startLine,
        csvHdrIdx >= 0 ? `| ligne : ${JSON.stringify(rawLines[startLine])}` : '| non trouvé, ligne 0 utilisée');

      // Re-détecter le séparateur depuis la vraie ligne d'en-têtes (plus fiable)
      rawSep = detectSeparator(rawLines[startLine] || '');
      rows   = parseCSV(text, { startLine });
    }
  } catch (err) {
    const msg = err.message === 'NO_HEADER_FOUND'
      ? 'Aucune ligne d\'en-têtes Binance trouvée dans les 30 premières lignes. Vérifiez que le fichier est un export Binance valide.'
      : 'Impossible de lire le fichier. Vérifiez qu\'il n\'est pas corrompu.';
    return { ok: false, error: msg, trades: [] };
  }

  if (!rows || rows.length === 0) {
    return { ok: false, error: 'Le fichier est vide ou son format n\'a pas pu être lu.', trades: [] };
  }

  const headers        = Object.keys(rows[0]);
  const headersNorm    = headers.map(normalizeHeader);

  // ── Diagnostic console ────────────────────────────────────────────────────────
  console.group('[IMPORT DEBUG]');
  console.log('Fichier       :', file.name);
  console.log('Extension     :', ext);
  console.log('Taille        :', file.size, 'octets');
  if (!isXLSX) {
    console.log('BOM UTF-8     :', hasBOM ? 'OUI \\ufeff détecté et supprimé' : 'non');
    console.log('Lignes brutes :', rawLines?.length ?? '?');
    console.log('Séparateur    :', JSON.stringify(rawSep));
    console.log('1ère ligne    :', rawLines?.[0] ?? '?');
  }
  console.log('Headers bruts :', headers);
  console.log('Headers norm  :', headersNorm);
  // Échantillon de 3 lignes brutes (clés + valeurs réelles)
  console.group('Échantillon rows bruts (3 premières)');
  rows.slice(0, 3).forEach((r, i) => console.log(`Row ${i}:`, r));
  console.groupEnd();
  console.groupEnd();

  console.log('[bhv:import] colonnes trouvées (%d) : %s', headers.length, headers.join(' | '));

  const classification = classifyFile(headers);
  const { level, subtype } = classification;
  const fileFormat     = detectFormat(headers);

  // ── Complément diagnostic : signaux de classification ────────────────────────
  {
    const h = headersNorm;
    const signals = {
      date:   h.some(c => matchesField(c, DETECT_DATE))   ? '✅' : '❌',
      symbol: h.some(c => matchesField(c, DETECT_SYMBOL)) ? '✅' : '❌',
      side:   h.some(c => matchesField(c, DETECT_SIDE))   ? '✅' : '❌',
      price:  h.some(c => matchesField(c, DETECT_PRICE))  ? '✅' : '❌',
      qty:    h.some(c => matchesField(c, DETECT_QTY))    ? '✅' : '❌',
    };
    console.group('[IMPORT DEBUG] Classification');
    console.log('Signaux trading :', signals);
    console.log('Level / Subtype :', level, '/', subtype);
    console.log('Format détecté  :', fileFormat);
    console.groupEnd();
  }

  console.log('[bhv:import] classification → %s/%s · format → %s', level, subtype, fileFormat);

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

  // NON_TRADING / unknown → message avec colonnes pour faciliter le diagnostic
  if (level === 'NON_TRADING') {
    const colPreview = headers.length > 0
      ? headers.slice(0, 10).join(', ') + (headers.length > 10 ? ` … (${headers.length} colonnes au total)` : '')
      : '(aucune colonne détectée)';
    console.warn('[bhv:import] fichier refusé — colonnes non reconnues : %s', headers.join(' | '));
    // Message spécifique si le nom du fichier ressemble à un export Binance officiel
    const looksLikeBinance = /^binance/i.test(file.name);
    const errorMsg = looksLikeBinance
      ? `Export Binance détecté mais colonnes non mappées. Colonnes trouvées : ${colPreview}`
      : `Colonnes non reconnues. Colonnes trouvées : ${colPreview}`;
    const h = headersNorm;
    const diagLines = [
      `Bloqué en : NON_TRADING (classification)`,
      `date:${h.some(c => matchesField(c, DETECT_DATE)) ? '✅' : '❌'} symbol:${h.some(c => matchesField(c, DETECT_SYMBOL)) ? '✅' : '❌'} side:${h.some(c => matchesField(c, DETECT_SIDE)) ? '✅' : '❌'} price:${h.some(c => matchesField(c, DETECT_PRICE)) ? '✅' : '❌'} qty:${h.some(c => matchesField(c, DETECT_QTY)) ? '✅' : '❌'}`,
      `Colonnes normalisées : ${headersNorm.join(' | ')}`,
    ];
    return { ok: false, error: errorMsg, diagnostic: diagLines.join('\n'), trades: [] };
  }

  // FORMAT B — Order History → pipeline ordres dédié
  if (fileFormat === 'ORDER_HISTORY' && (level === 'FULL_TRADING' || level === 'PARTIAL_TRADING')) {
    console.debug('[bhv:import] Order History détecté — branchement pipeline ordres');
    const sessionId = `session_${Date.now()}`;
    const { trades: orderTrades, skipped: orderSkipped, statusCounts } = mapOrderRows(rows, sessionId);

    if (orderTrades.length === 0) {
      const statusList = Object.keys(statusCounts || {});
      const statusHint = statusList.length > 0
        ? ` Statuts détectés : ${statusList.join(', ')}.`
        : '';
      return {
        ok:    false,
        error: `Order History importé mais aucun ordre exécuté (FILLED) trouvé.${statusHint}`,
        diagnostic: statusList.length > 0
          ? `Statuts trouvés dans le fichier :\n${Object.entries(statusCounts).map(([k,v]) => `  ${k} × ${v}`).join('\n')}`
          : 'Aucune colonne Statut/Status reconnue.',
        trades: []
      };
    }

    const orderAnalysis = analyzeOrders(orderTrades, rows.length);

    return {
      ok:           true,
      type:         'order_history',
      trades:       orderTrades,
      skipped:      orderSkipped,
      sessionId,
      analysisQuality: level === 'PARTIAL_TRADING' ? 'partial' : 'full',
      orderAnalysis
    };
  }

  // FULL_TRADING ou PARTIAL_TRADING → pipeline trades (les deux niveaux sont acceptés)
  const sessionId = `session_${Date.now()}`;
  const trades  = [];
  let   skipped = 0;

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
    return { ok: false, error: hint, diagnostic: `Bloqué en : 0 trades extraits (mapping/validation)\nColonnes normalisées : ${headersNorm.join(' | ')}`, trades: [] };
  }

  const analysisQuality = level === 'PARTIAL_TRADING' ? 'partial' : 'full';

  const validation = validateTrades(trades);

  return { ok: true, type: 'trades', trades, skipped, sessionId, analysisQuality,
           validationWarning: !validation.isValid, validationWarnings: validation.warnings };
}

export { importBinanceSpot };
