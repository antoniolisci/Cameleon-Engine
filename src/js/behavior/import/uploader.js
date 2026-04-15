// Orchestrates file reading, parsing, mapping and validation for a Binance Spot CSV or XLSX.

import { parseCSV } from './parser.js';
import { mapBinanceSpotRow } from '../normalize/mappers/binance_spot.js';
import { isValidTrade } from '../normalize/validator.js';
import { analyzeWallet } from '../wallet/wallet_analyzer.js';

// ── File type detection ───────────────────────────────────────────────────────
// Identifies the file type from its column headers before any trade parsing.
// Returns: "trade" | "operation" | "unknown"

function detectFileType(headers) {
  const h = headers.map(c => c.toLowerCase().trim());

  // Score "trade" : chaque signal indépendant vaut +1
  // Seuil ≥ 2 → tolérant aux exports sans toutes les colonnes standards
  let tradeScore = 0;
  if (h.some(c => ['price', 'avg price', 'avg. price', 'filled price'].includes(c)))           tradeScore++;
  if (h.some(c => ['executed', 'qty', 'quantity', 'filled', 'base qty'].includes(c)))          tradeScore++;
  if (h.some(c => ['pair', 'symbol', 'market', 'trading pair'].includes(c)))                   tradeScore++;
  if (h.some(c => ['side', 'type', 'order side', 'direction'].includes(c)))                    tradeScore++;

  // Score "operation" : historique wallet Binance (dépôts / retraits / transferts)
  let operationScore = 0;
  if (h.some(c => c === 'operation' || c.startsWith('operation')))  operationScore++;
  if (h.some(c => c === 'coin' || c === 'asset'))                   operationScore++;
  if (h.some(c => c === 'change'))                                   operationScore++;

  console.debug('[bhv:import] scores → trade:', tradeScore, '/ operation:', operationScore);

  if (tradeScore >= 2)     return 'trade';
  if (operationScore >= 2) return 'operation';
  return 'unknown';
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

  let rows;
  try {
    if (isXLSX) {
      rows = await readFileAsXLSX(file);
    } else {
      const text = await readFileAsText(file);
      rows = parseCSV(text);
    }
  } catch (err) {
    return { ok: false, error: err.message || 'Impossible de lire le fichier.', trades: [] };
  }

  if (!rows || rows.length === 0) {
    return { ok: false, error: 'Fichier vide ou format non reconnu.', trades: [] };
  }

  // Détection du type de fichier à partir des colonnes (avant tout parsing métier)
  const headers  = Object.keys(rows[0]);
  const fileType = detectFileType(headers);

  // Log diagnostic : type détecté + colonnes ayant conduit à la décision
  const keySignals = headers.filter(h => {
    const l = h.toLowerCase().trim();
    return ['price', 'executed', 'qty', 'quantity', 'pair', 'symbol', 'market',
            'operation', 'coin', 'asset', 'change'].includes(l);
  });
  console.debug('[bhv:import] type détecté :', fileType, '· colonnes clés :', keySignals.join(', ') || '(aucune)');

  // Routage selon le type détecté
  // "unknown" → aucun signal exploitable, blocage immédiat (le mapper n'a rien à lire)
  if (fileType === 'unknown') {
    const headerList = headers.filter(Boolean).map(h => `"${h}"`).join(', ');
    return {
      ok: false,
      error: `Format de fichier non reconnu.\nColonnes détectées : ${headerList}.\nColonnes attendues : Date, Paire, Côté, Prix, Quantité exécutée.`,
      trades: []
    };
  }

  // "operation" → pipeline wallet dédié (pas de price/pair/side exploitables)
  if (fileType === 'operation') {
    console.debug('[bhv:import] fichier wallet — branchement analyzeWallet()');
    const result = analyzeWallet(rows);
    return {
      ok:      true,
      message: 'Fichier wallet détecté — analyse comportementale financière appliquée',
      ...result
    };
  }

  // Pipeline de parsing trades
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
    const headerList = headers.filter(Boolean).map(h => `"${h}"`).join(', ');
    return {
      ok:    false,
      error: `Aucun trade valide trouvé.\nColonnes : ${headerList}.\nColonnes attendues : Date, Paire, Côté, Prix, Quantité exécutée.`,
      trades: []
    };
  }

  return { ok: true, type: 'trades', trades, skipped, sessionId };
}

export { importBinanceSpot };
