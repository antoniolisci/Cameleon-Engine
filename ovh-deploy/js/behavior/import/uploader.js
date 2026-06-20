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
import { computeCapital       } from '../analytics/oi-capital.js';
import { computeCadence      } from '../analytics/oi-cadence.js';
import { computePortefeuille } from '../analytics/oi-portefeuille.js';
import { loadPdfTextItems }    from './pdf-loader.js';
import { detectPdfFamily }     from './pdf-family-detector.js';
import { extractPdfTableRows } from './pdf-table-extractor.js';
import { normalizePdfRows }    from './pdf-normalizer.js';

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

  if (headerIdx === -1) {
    throw new Error('NO_HEADER_FOUND');
  }

  const headers = raw2d[headerIdx].map(h => String(h || '').trim());

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

  // ── Branche PDF ──────────────────────────────────────────────────────────────
  // PDF.js lit un ArrayBuffer asynchrone — contournement du garde taille synchrone.
  if (ext === 'pdf') return importBinancePDF(file);

  // ── Garde taille ─────────────────────────────────────────────────────────────
  // Limite à 5 MB — au-delà, le chargement mémoire synchrone peut bloquer l'UI.
  // Binance exporte rarement plus de 10 000 lignes par fichier ; 5 MB couvre
  // plusieurs années de trading actif. Privilégier des exports par période courte.
  const MAX_FILE_SIZE = 5 * 1024 * 1024;   // 5 MB
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok:    false,
      error: 'Fichier trop volumineux pour l\'import local-first. Exportez une période plus courte.',
      trades: []
    };
  }

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

  if (!rows) {
    return { ok: false, error: 'Le fichier est vide ou son format n\'a pas pu être lu.', trades: [] };
  }
  if (rows.length === 0) {
    return { ok: false, error: 'Le fichier ne contient aucune donnée exploitable (headers détectés mais aucune ligne présente).', trades: [] };
  }

  const headers        = Object.keys(rows[0]);
  const headersNorm    = headers.map(normalizeHeader);

  const classification = classifyFile(headers);
  const { level, subtype } = classification;
  const fileFormat     = detectFormat(headers);

  // NON_TRADING / wallet → pipeline wallet dédié
  if (level === 'NON_TRADING' && subtype === 'wallet') {
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
      ...walletResult,
      rawRows: rows
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

    const orderAnalysis     = analyzeOrders(orderTrades, rows.length);
    const capitalResult     = computeCapital(orderTrades);
    const cadenceResult     = computeCadence(orderTrades);
    const portefeuilleResult = computePortefeuille(orderTrades);

    return {
      ok:           true,
      type:         'order_history',
      trades:       orderTrades,
      skipped:      orderSkipped,
      sessionId,
      analysisQuality: level === 'PARTIAL_TRADING' ? 'partial' : 'full',
      orderAnalysis,
      capitalResult,
      cadenceResult,
      portefeuilleResult
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
    return { ok: false, error: hint, diagnostic: `Bloqué en : 0 trades extraits (mapping/validation)\nColonnes normalisées : ${headersNorm.join(' | ')}`, trades: [] };
  }

  const analysisQuality = level === 'PARTIAL_TRADING' ? 'partial' : 'full';

  const validation = validateTrades(trades);

  return { ok: true, type: 'trades', trades, skipped, sessionId, analysisQuality,
           validationWarning: !validation.isValid, validationWarnings: validation.warnings };
}

// ── PDF Import ────────────────────────────────────────────────────────────────
// Adaptateur Trade History PDF → format canonique interne.
// quote_value est un alias de quote_quantity (même valeur, deux noms pour compatibilité downstream).
function _adaptTradeHistoryPdf(normalized, sessionId) {
  return normalized.map(row => ({
    ...row,
    quote_value: row.quote_quantity,
    session_id:  sessionId,
    tags:        [],
  }));
}

// Adaptateur Order History PDF → format canonique interne (une row FILLED).
// fee = 0 : absent du PDF Order History Binance.
// fillRate = executed_qty / order_amount, plafonné à 1.
function _adaptFilledOrderPdf(row, sessionId) {
  const qty      = row.executed_qty;
  const orderQty = row.order_amount || qty;
  return {
    timestamp:      row.created_at,
    symbol:         row.symbol,
    side:           row.side,
    price:          row.average_price,
    quantity:       qty,
    quote_value:    row.trading_total,
    quote_quantity: row.trading_total,
    fee:            0,
    orderId:        row.order_id,
    status:         row.status,
    fillRate:       orderQty > 0 ? Math.min(qty / orderQty, 1) : 1,
    session_id:     sessionId,
    tags:           [],
  };
}

async function importBinancePDF(file) {
  let pdfResult;
  try {
    pdfResult = await loadPdfTextItems(file);
  } catch (err) {
    return { ok: false, error: 'Impossible de lire le fichier PDF. Vérifiez qu\'il n\'est pas corrompu.', trades: [] };
  }

  // DEBUG-IPAD — retirer après diagnostic
  const _dbgPdf = {
    quality: pdfResult.quality,
    pages:   pdfResult.pages,
    items:   pdfResult.items.length,
    chars:   (pdfResult.rawText || '').replace(/\s+/g, '').length,
    extrait: (pdfResult.rawText || '').slice(0, 200),
    family:          null,
    rowsExtracted:   null,
    rowsNormalized:  null,
    statuts:         null,
  };
  console.warn('[DEBUG-IPAD] pdfResult', _dbgPdf);
  // FIN DEBUG-IPAD

  if (pdfResult.quality === 'UNREADABLE' || pdfResult.quality === 'SCANNED') {
    return {
      ok: false,
      error: `PDF non lisible (qualité : ${pdfResult.quality}). Seuls les PDFs Binance natifs (texte encodé) sont supportés.`,
      diagnostic: `Qualité : ${pdfResult.quality}\nPages : ${pdfResult.pages}\nItems extraits : ${pdfResult.items.length}\nCaractères utiles : ${(pdfResult.rawText || '').replace(/\s+/g, '').length}\nExtrait (150c) : ${(pdfResult.rawText || '').slice(0, 150) || '(vide)'}`,
      _debugPdf: _dbgPdf,  // DEBUG-IPAD
      trades: []
    };
  }

  const family = detectPdfFamily(pdfResult.rawText, pdfResult.items);
  // DEBUG-IPAD
  _dbgPdf.family = family;
  console.warn('[DEBUG-IPAD] famille détectée :', family);
  // FIN DEBUG-IPAD
  if (family === 'UNKNOWN') {
    return {
      ok: false,
      error: 'Format PDF non reconnu. Seuls les exports Binance Trade History et Order History Spot sont supportés.',
      diagnostic: `Famille : UNKNOWN\nQualité : ${pdfResult.quality}\nPages : ${pdfResult.pages}\nItems : ${pdfResult.items.length}\nExtrait brut (200c) :\n${(pdfResult.rawText || '').slice(0, 200) || '(vide)'}`,
      _debugPdf: _dbgPdf,  // DEBUG-IPAD
      trades: []
    };
  }

  const extracted  = extractPdfTableRows(pdfResult, family);
  const normalized = normalizePdfRows(extracted.rows, family);
  // DEBUG-IPAD
  _dbgPdf.rowsExtracted   = extracted.rows.length;
  _dbgPdf.rowsNormalized  = normalized.length;
  _dbgPdf.statuts         = [...new Set(normalized.map(r => r.status || '?'))].slice(0, 8).join(', ') || '(aucun)';
  _dbgPdf.debugExtract    = extracted.diagnostics?._debugExtract ?? null;
  // Audit mapping status : longueur réelle des rows brutes, contenu de row[11], row normalisée
  _dbgPdf.rawRowLengths   = extracted.rows.slice(0, 5).map(r => r.length);
  _dbgPdf.rawRowSample    = extracted.rows.slice(0, 3).map(r => r.map(c => String(c).slice(0, 20)));
  _dbgPdf.normalizedSample = normalized.slice(0, 3).map((r, i) => ({
    row_length:   extracted.rows[i]?.length ?? '?',
    row11_raw:    extracted.rows[i]?.[11]   ?? '(absent)',
    created_at:   r.created_at,
    symbol:       r.symbol,
    side:         r.side,
    status:       r.status,
    executed_qty: r.executed_qty,
  }));
  console.warn('[DEBUG-IPAD] extraction', {
    rowsExtracted: _dbgPdf.rowsExtracted,
    rowsNormalized: _dbgPdf.rowsNormalized,
    statuts: _dbgPdf.statuts,
    rawRowLengths: _dbgPdf.rawRowLengths,
    normalizedSample: _dbgPdf.normalizedSample,
  });
  // FIN DEBUG-IPAD
  const sessionId  = `session_${Date.now()}`;

  if (family === 'TRADE_HISTORY') {
    const adapted = _adaptTradeHistoryPdf(normalized, sessionId);
    const trades  = [];
    let skipped   = 0;
    for (const t of adapted) {
      if (isValidTrade(t)) trades.push(t);
      else skipped++;
    }
    if (trades.length === 0) {
      return { ok: false, error: 'PDF Trade History importé mais aucun trade valide trouvé.', _debugPdf: _dbgPdf, trades: [] };  // DEBUG-IPAD
    }
    const validation = validateTrades(trades);
    return {
      ok: true, type: 'trades', trades, skipped, sessionId,
      analysisQuality: pdfResult.quality === 'DEGRADED' ? 'partial' : 'full',
      pdfQuality: pdfResult.quality,
      _debugPdf: _dbgPdf,  // DEBUG-IPAD
      validationWarning: !validation.isValid, validationWarnings: validation.warnings
    };
  }

  // ORDER_HISTORY — filtre FILLED uniquement (même comportement que binance_order.js CSV/XLSX)
  const trades = [];
  let skipped  = 0;
  for (const row of normalized) {
    if (row.status !== 'FILLED') { skipped++; continue; }
    const t = _adaptFilledOrderPdf(row, sessionId);
    if (isValidTrade(t)) trades.push(t);
    else skipped++;
  }
  if (trades.length === 0) {
    return { ok: false, error: 'Order History PDF importé mais aucun ordre FILLED trouvé.', _debugPdf: _dbgPdf, trades: [] };  // DEBUG-IPAD
  }
  const capitalResult      = computeCapital(trades);
  const cadenceResult      = computeCadence(trades);
  const portefeuilleResult = computePortefeuille(trades);
  return {
    ok: true, type: 'order_history', trades, skipped, sessionId,
    analysisQuality: pdfResult.quality === 'DEGRADED' ? 'partial' : 'full',
    pdfQuality: pdfResult.quality,
    _debugPdf: _dbgPdf,  // DEBUG-IPAD
    orderAnalysis: analyzeOrders(trades, normalized.length),
    capitalResult,
    cadenceResult,
    portefeuilleResult
  };
}

export { importBinanceSpot };
