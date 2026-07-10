// binance-s1-adapter.js — Adaptateur Binance S1 Phase A
// Fournisseur de données exclusif : traduit les formats Binance Phase A validés
// vers le contrat générique attendu par ingestion-core.js (P2-2.D §7.2).
//
// Périmètre Phase A : TRADE_HISTORY CSV · ORDER_HISTORY CSV ·
//                     TRADE_HISTORY PDF · ORDER_HISTORY PDF.
//
// Invariants Core first (I-D1→I-D4) :
//   - Ce module ne connaît pas le Core.
//   - Il ne crée aucune session, n'écrit pas dans le corpus ni le registre.
//   - Il ne dépend d'aucun module canonical ni d'aucun module comportemental.
//
// LOT-P2-2.B §6 · LOT-P2-2.A §3 · LOT-P2-2.D §7.2
// Décision DT-3 Option C : zéro dépendance vers src/js/behavior/.
// Dépendance dynamique unique autorisée : src/js/vendor/pdf.min.mjs (PDF uniquement).

// ── Constantes canoniques ─────────────────────────────────────────────────────

const DATE_UNAVAILABLE = 'Non disponible';
const DATE_NON_EXPLOIT = 'Non exploitable au format canonique';

// Plage calendaire EP-RC2 valide : 2000–2100 en epoch ms (P2-2.B §4.2 Test 2)
const EP_RC2_MIN_MS = 946684800000;   // 2000-01-01T00:00:00Z
const EP_RC2_MAX_MS = 4102444800000;  // 2100-01-01T00:00:00Z

// ── Normalisation d'en-tête ───────────────────────────────────────────────────
// Minuscules · suppression diacritiques · normalisation séparateurs.
// "Date(UTC+2)" → "date(utc+2)" · "Frais de transaction" → "frais de transaction"

function _normalizeHeader(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/[\u2019\s_./\\\-]+/g, ' ')
    .trim();
}

// ── Parsing numérique (FR et EN) ──────────────────────────────────────────────
// Utilisé pour CSV et PDF.
// "0,25" → 0.25 · "1.234,56" → 1234.56 · "1,234.56" → 1234.56
// "21 500" → 21500 · "5.6583TAO" → 5.6583 · "1 234,56" → 1234.56

function _parseNum(raw) {
  let str = String(raw || '').trim()
    .replace(/\s(?=\d)/g, '');  // "21 500" → "21500"

  const hasComma = str.includes(',');
  const hasDot   = str.includes('.');

  if (hasComma && hasDot) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // Format européen : "1.234,56" → "1234.56"
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Format US : "1,234.56" → "1234.56"
      str = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    str = /,\d{3}(?:\D|$)/.test(str)
      ? str.replace(/,/g, '')   // milliers : "1,234" → "1234"
      : str.replace(',', '.');  // décimal  : "0,25"  → "0.25"
  }
  // Point seul : parseFloat gère nativement

  const match = str.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

// ── EP-RC2 — Algorithme d'extraction de date (P2-2.B §4 + §6.6) ─────────────
// Tests séquentiels 1 → 2 → 3 → 3b → 4 → 5.
// Retourne : ISO 8601 UTC (état Standard) · DATE_UNAVAILABLE (R1/R3) ·
//            DATE_NON_EXPLOIT (R4).
//
// isSentinel : true si l'adaptateur signale que la valeur est une sentinelle
// d'absence (ex. "--" dans les PDF Binance ORDER_HISTORY).

function _applyEpRc2(v, isSentinel = false) {
  // Test 1 — absent, vide ou sentinelle (état R1)
  if (isSentinel || v === null || v === undefined) return DATE_UNAVAILABLE;
  const s = String(v).trim();
  if (s === '') return DATE_UNAVAILABLE;

  // Test 2 — Epoch ms 13 chiffres
  if (/^\d{13}$/.test(s)) {
    const ms = parseInt(s, 10);
    return (ms >= EP_RC2_MIN_MS && ms <= EP_RC2_MAX_MS)
      ? new Date(ms).toISOString()
      : DATE_NON_EXPLOIT;
  }

  // Test 3 — Epoch secondes 10 chiffres (état R4)
  if (/^\d{10}$/.test(s)) return DATE_NON_EXPLOIT;

  // Test Binance 3b — Formats PDF Binance UTC+2 (P2-2.B §6.6, amendement 0dd47a5)
  //   Variante 17 chars : "YY-MM-DD HH:MM:SS" → préfixer "20" → UTC via +02:00
  //   Variante 19 chars : "YYYY-MM-DD HH:MM:SS" → conserver l'année  → UTC via +02:00
  //   Placé avant Test 4 pour empêcher Test 4 de traiter la variante 19 chars
  //   comme date UTC directe (décalage de 2 heures).
  if (
    (s.length === 17 || s.length === 19) &&
    /^\d{2,4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)
  ) {
    const iso = (s.length === 17 ? '20' : '') + s.replace(' ', 'T');
    const d = new Date(iso + '+02:00');
    return !isNaN(d.getTime()) ? d.toISOString() : DATE_NON_EXPLOIT;
  }

  // Test 4 — ISO 8601 ou format proche
  const normalized = s.replace(' ', 'T');
  const suffix = (normalized.includes('Z') || /[+-]\d{2}:?\d{2}$/.test(normalized))
    ? '' : 'Z';
  const d = new Date(normalized + suffix);
  if (!isNaN(d.getTime())) return d.toISOString();

  // Test 5 — aucun pattern reconnu (état R3 — même libellé que R1)
  return DATE_UNAVAILABLE;
}

// ── Signaux de détection de format Binance ────────────────────────────────────

const SIG_FEE = [
  'fee', 'fee(usdt)', 'fee(bnb)', 'fee coin', 'commission',
  'frais', 'frais de transaction', 'cout transaction',
];
const SIG_STATUS   = ['status', 'statut', 'order status', 'statut ordre', 'etat'];
const SIG_ORDER_ID = ['order id', 'orderid', 'order no', 'order number', 'id ordre', 'numero ordre'];

function _matchSig(col, signals) {
  for (const sig of signals) {
    if (col === sig) return true;
    if (sig.length < 4) continue;
    if (
      col.startsWith(sig + ' ') ||
      col.endsWith(' ' + sig) ||
      col.includes(' ' + sig + ' ')
    ) return true;
  }
  return false;
}

// Retourne 'TRADE_HISTORY' | 'ORDER_HISTORY' | null
function _detectCsvFormat(headers) {
  const h = headers.map(_normalizeHeader);
  const hasFee     = h.some(c => _matchSig(c, SIG_FEE));
  const hasStatus  = h.some(c => _matchSig(c, SIG_STATUS));
  const hasOrderId = h.some(c => _matchSig(c, SIG_ORDER_ID));
  // ORDER_HISTORY prioritaire (P2-2.B §6.2)
  if (hasStatus || hasOrderId) return 'ORDER_HISTORY';
  if (hasFee)                  return 'TRADE_HISTORY';
  return null;
}

// ── CSV parser ────────────────────────────────────────────────────────────────

function _detectSeparator(line) {
  const tabs  = (line.split('\t').length - 1);
  const semis = (line.split(';').length  - 1);
  const coms  = (line.split(',').length  - 1);
  if (tabs >= semis && tabs >= coms) return '\t';
  if (semis > coms)                  return ';';
  return ',';
}

function _splitLine(line, sep) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === sep && !inQ) { result.push(cur); cur = ''; }
    else { cur += c; }
  }
  result.push(cur);
  return result;
}

function _parseCSV(text) {
  const clean = text.replace(/^\ufeff/, '');  // BOM UTF-8 (\ufeff — exports Binance FR)
  const lines = clean.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const sep     = _detectSeparator(lines[0]);
  const headers = _splitLine(lines[0], sep).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows    = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = _splitLine(line, sep);
    const row    = {};
    headers.forEach((h, j) => {
      row[h] = (values[j] !== undefined ? values[j] : '').replace(/^"|"$/g, '').trim();
    });
    rows.push(row);
  }
  return { headers, rows };
}

// ── Normalisation de ligne CSV ────────────────────────────────────────────────

function _buildNormRow(row) {
  const norm = {};
  for (const [k, v] of Object.entries(row)) {
    norm[_normalizeHeader(k)] = v;
  }
  // Canonicalise Date(UTC±N) → date(utc) (variantes timezone Binance)
  for (const key of Object.keys(norm)) {
    if (/^date\(utc[+-]\d+\)$/.test(key) && norm['date(utc)'] === undefined) {
      norm['date(utc)'] = norm[key];
    }
  }
  return norm;
}

function _get(norm, aliases) {
  for (const alias of aliases) {
    if (norm[alias] !== undefined && norm[alias] !== '') return norm[alias];
  }
  return '';
}

// ── Tables d'alias CSV ────────────────────────────────────────────────────────

const AL_DATE = [
  'date(utc)', 'date', 'utc time', 'utc_time', 'time', 'timestamp',
  'trade time', 'update time', 'open time', 'created at',
  'heure', 'date et heure', 'duree',
];
const AL_DATE_EXEC = [
  'update time', 'execution_time', 'executed time', 'date d execution',
  'date(utc)', 'date', 'time', 'heure', 'duree',
];
const AL_DATE_CREATE = [
  'created time', 'created at', 'open time', 'date de creation',
];
const AL_SYMBOL = [
  'pair', 'symbol', 'market', 'trading pair', 'base asset', 'ticker',
  'paire', 'paire de trading', 'asset',
];
const AL_SIDE = ['side', 'order side', 'direction', 'cote', 'sens'];
const AL_PRICE = [
  'price', 'avg price', 'avg. price', 'filled price', 'average price',
  'avgtrading price', 'execution price', 'deal price', 'order price',
  'prix', 'prix moyen', 'prix moyen rempli', 'prix d execution',
  'prix d execution moyen', 'prix de l ordre',
];
const AL_QTY = [
  'executed', 'qty', 'quantity', 'filled', 'base qty', 'base quantity',
  'filled qty', 'executed qty', 'base amount',
  'execute', 'quantite', 'qte', 'volume execute', 'quantite executee',
];
const AL_ORDER_QTY = [
  'order quantity', 'original qty', 'orig qty', 'quantite ordre',
  'quantite initiale', 'montant de la commande', 'quantite de la commande',
];
const AL_QUOTE = [
  'amount', 'total', 'quote qty', 'quote quantity', 'value', 'quote value',
  'deal value', 'montant', 'valeur totale', 'trading total', 'total trade',
  'montant total',
];
const AL_FEE = [
  'fee', 'commission', 'fee amount', 'transaction fee', 'trading fee',
  'maker fee', 'taker fee',
  'frais', 'cout transaction', 'frais de transaction',
];
const AL_STATUS   = ['status', 'statut', 'order status', 'statut ordre', 'etat'];
const AL_ORDER_ID = ['order id', 'orderid', 'order no', 'order number', 'id ordre'];

// ── Normalisation du côté (BUY/SELL) ─────────────────────────────────────────

function _normalizeSide(rawSide, norm) {
  let s = (rawSide || '').trim().toUpperCase();
  if (!s) {
    for (const col of ['type', 'trade type', 'order type']) {
      const val = (norm[col] || '').trim().toUpperCase();
      if (val.startsWith('BUY') || val.startsWith('SELL')) { s = val; break; }
    }
  }
  if (s === 'BUY'  || s.startsWith('BUY_')  || s === 'LONG'  || s === 'ACHAT') return 'BUY';
  if (s === 'SELL' || s.startsWith('SELL_') || s === 'SHORT' || s === 'VENTE') return 'SELL';
  return s;
}

// ── Reconnaissance du statut ORDER_HISTORY ────────────────────────────────────

function _normStatus(value) {
  return String(value || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function _isFilledStatus(value) {
  const n = _normStatus(value);
  return n === 'filled'    || n === 'rempli'    || n === 'complete' ||
         n === 'completed' || n === 'execute'   || n === 'executed' ||
         n === 'termine'   || n === 'done'      || n === 'closed'   ||
         n.startsWith('filled');
}

const _EXCL_STATUSES = new Set([
  'new', 'canceled', 'cancelled', 'annule', 'annule', 'ouvert', 'open',
  'partially filled', 'partiel', 'partielle',
]);

function _isExcludedStatus(value) {
  const n = _normStatus(value);
  return _EXCL_STATUSES.has(n) || n.startsWith('partially');
}

// ── processEvent CSV — TRADE_HISTORY ─────────────────────────────────────────

function _processTradeCsv(event) {
  const norm = _buildNormRow(event.raw);

  // Condition 3 — champs minimaux
  const symbol = _get(norm, AL_SYMBOL).trim().toUpperCase();
  const side   = _normalizeSide(_get(norm, AL_SIDE), norm);
  if (!symbol || !side) {
    const missing = [!symbol && 'paire', !side && 'côté'].filter(Boolean).join(', ');
    return { status: 'rejeté', motif: `RF-R6 : champs minimaux absents (${missing})`, code: 'RF-R6' };
  }

  // EP-RC2 — colonne date principale
  const date = _applyEpRc2(_get(norm, AL_DATE));

  // Champ valeur
  const prix    = _parseNum(_get(norm, AL_PRICE));
  const quantite = _parseNum(_get(norm, AL_QTY));
  const montantRaw = _parseNum(_get(norm, AL_QUOTE));
  const montant = montantRaw > 0 ? montantRaw : prix * quantite;

  return {
    status: 'qualifié',
    date,
    valeur: {
      executionTime: date,
      paire:         symbol,
      cote:          side,
      prix,
      quantite,
      montant,
      frais:         _parseNum(_get(norm, AL_FEE)),
    },
  };
}

// ── processEvent CSV — ORDER_HISTORY ─────────────────────────────────────────

function _processOrderCsv(event) {
  const norm = _buildNormRow(event.raw);

  // Condition 2 — statut exécuté
  const rawStatus = _get(norm, AL_STATUS).trim();
  if (!rawStatus) {
    return { status: 'exclu', motif: 'ORDER_HISTORY : statut absent — hors périmètre S1' };
  }
  if (_isFilledStatus(rawStatus)) {
    // → Condition 3
  } else if (_isExcludedStatus(rawStatus)) {
    return { status: 'exclu', motif: `ORDER_HISTORY : statut "${rawStatus}" — hors périmètre S1 (DI4)` };
  } else {
    console.warn('[ingestion] ORDER_HISTORY CSV statut non reconnu :', rawStatus);
    return { status: 'exclu', motif: `ORDER_HISTORY : statut non reconnu "${rawStatus}" — exclu par précaution` };
  }

  // Condition 3 — champs minimaux
  const symbol  = _get(norm, AL_SYMBOL).trim().toUpperCase();
  const side    = _normalizeSide(_get(norm, AL_SIDE), norm);
  const orderId = _get(norm, AL_ORDER_ID).trim();
  if (!symbol || !side || !orderId) {
    const missing = [!symbol && 'paire', !side && 'côté', !orderId && 'orderId'].filter(Boolean).join(', ');
    return { status: 'rejeté', motif: `RF-R6 : champs minimaux absents (${missing})`, code: 'RF-R6' };
  }

  // EP-RC2 — date d'exécution (trace date) + date de création
  const date      = _applyEpRc2(_get(norm, AL_DATE_EXEC));
  const rawCreate = _get(norm, AL_DATE_CREATE);
  const createdAt = rawCreate ? _applyEpRc2(rawCreate) : DATE_UNAVAILABLE;

  // Champ valeur
  const prixMoyen  = _parseNum(_get(norm, AL_PRICE));
  const quantite   = _parseNum(_get(norm, AL_QTY));
  const orderQty   = _parseNum(_get(norm, AL_ORDER_QTY)) || quantite;
  const montantRaw = _parseNum(_get(norm, AL_QUOTE));
  const montant    = montantRaw > 0 ? montantRaw : prixMoyen * quantite;
  const fillRate   = orderQty > 0 ? Math.min(quantite / orderQty, 1) : 1;

  return {
    status: 'qualifié',
    date,
    valeur: {
      orderId,
      createdAt,
      executionTime:    date,
      paire:            symbol,
      typeOrdre:        (_get(norm, ['type', 'order type', 'type d ordre']) || '').trim() || null,
      cote:             side,
      prixMoyen,
      quantite,
      montant,
      tauxRemplissage:  fillRate,
    },
  };
}

// ── PDF — Singleton PDF.js ────────────────────────────────────────────────────

let _pdfjsLib = null;

async function _getPdfjsLib() {
  if (_pdfjsLib) return _pdfjsLib;
  const mod = await import(new URL('../../../vendor/pdf.min.mjs', import.meta.url).href);
  mod.GlobalWorkerOptions.workerSrc = new URL('../../../vendor/pdf.worker.min.mjs', import.meta.url).href;
  _pdfjsLib = mod;
  return _pdfjsLib;
}

// Extraction des items texte du PDF
async function _loadPdfItems(data) {
  const pdfjsLib = await _getPdfjsLib();
  const buf = (data instanceof ArrayBuffer) ? data : await data.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise;
  const items  = [];
  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page    = await pdfDoc.getPage(p);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (typeof item.str !== 'string') continue;
      const [, , , , x, y] = item.transform;
      items.push({ str: item.str, x, y, page: p });
    }
  }
  return items;
}

// ── PDF — Clustering Y (tolérance 2pt) ───────────────────────────────────────

const Y_TOL = 2;

function _clusterByY(items) {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const cls = [];
  let cur = null;
  for (const item of sorted) {
    if (!cur || Math.abs(item.y - cur.yRef) > Y_TOL) {
      cur = { yRef: item.y, items: [item] };
      cls.push(cur);
    } else {
      cur.items.push(item);
    }
  }
  for (const cl of cls) cl.items.sort((a, b) => a.x - b.x);
  return cls;
}

// ── PDF — Normalisation de cellule ────────────────────────────────────────────

function _normCell(str) {
  return str.toLowerCase().replace(/\u2019/g, ' ').replace(/°/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

// Détection d'une cellule date Binance PDF (17 ou 19 chars)
function _isDateCell(str) {
  return /^\d{2,4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str.trim());
}

// ── PDF — Détection format TRADE_HISTORY / ORDER_HISTORY ─────────────────────

const TH_HEADER_TERMS = ['duree', 'paire', 'cote', 'prix', 'execute', 'montant', 'frais'];

function _isTradeHeader(cells) {
  const normed = cells.map(_normCell);
  return TH_HEADER_TERMS.filter(t => normed.some(c => c === t)).length >= 4;
}

const OH_HEADER_TERMS = [
  'date', 'duree', 'created time', 'date de creation', 'order id',
  'n commande', 'numero de commande', 'orderid', 'pair', 'paire', 'symbol',
  'type', 'order type', 'side', 'cote', 'price', 'prix', 'order price',
  'prix de l ordre', 'avg price', 'prix moyen', 'average price',
  'amount', 'montant', 'order amount', 'executed', 'execute', 'filled',
  'qty', 'execution time', 'temps d execution', 'total', 'trading total',
  'total echange', 'status', 'statut',
];

function _ohHeaderScore(cluster) {
  const normed = cluster.items.map(i => _normCell(i.str)).filter(s => s.length > 0);
  let score = 0;
  for (const t of OH_HEADER_TERMS) {
    if (normed.some(c => c === t || c.startsWith(t + ' ') || c.endsWith(' ' + t))) score++;
  }
  return score;
}

// Détection du format PDF depuis les libellés extraits (score TRADE vs ORDER)
function _detectPdfFormat(items) {
  const texts = items.map(i => _normCell(i.str));
  let thScore = 0, ohScore = 0;
  for (const t of texts) {
    if (['frais', 'fee', 'montant', 'paire', 'cote', 'execute'].includes(t)) thScore++;
    if (TH_HEADER_TERMS.includes(t)) thScore++;
    if (['statut', 'status', 'orderid', 'order id', 'n commande'].includes(t)) ohScore++;
    if (['execution time', 'temps d execution', 'trading total'].includes(t)) ohScore++;
  }
  if (ohScore > 0 && ohScore >= thScore) return 'ORDER_HISTORY';
  if (thScore > 0)                        return 'TRADE_HISTORY';
  return null;
}

// ── PDF — Signature X ORDER_HISTORY ──────────────────────────────────────────

const OH_X_STATIC = [38.8, 117.9, 208.3, 264.8, 321.3, 377.7, 434.2, 490.7, 569.8, 626.3, 682.8, 750.5];
const X_TOL_STATIC = 3;
const X_TOL_DYN    = 10;

function _detectOhXSig(clusters) {
  let bestIdx = -1, bestScore = 0;
  for (let i = 0; i < clusters.length; i++) {
    const s = _ohHeaderScore(clusters[i]);
    if (s > bestScore) { bestScore = s; bestIdx = i; }
  }
  if (bestIdx < 0 || bestScore < 4) {
    return { xSig: OH_X_STATIC, tol: X_TOL_STATIC };
  }

  const MAX_SKIP = 3, MAX_WIN = 10;
  const headerItems = [...clusters[bestIdx].items];
  let nextIdx = bestIdx + 1, skipped = 0;

  while (nextIdx < clusters.length && (nextIdx - bestIdx) <= MAX_WIN) {
    const cl = clusters[nextIdx];
    const sc = _ohHeaderScore(cl);
    const first = cl.items.map(i => i.str.trim()).find(s => s.length > 0) ?? '';
    if (_isDateCell(first)) break;
    if (sc >= 2) { headerItems.push(...cl.items); skipped = 0; }
    else {
      if (skipped >= MAX_SKIP) break;
      headerItems.push(...cl.items);
      skipped++;
    }
    nextIdx++;
  }

  const rawX = headerItems
    .filter(i => i.str.trim().length > 0)
    .map(i => i.x)
    .sort((a, b) => a - b);

  const xSig = rawX.reduce((acc, x) => {
    if (acc.length === 0 || x - acc[acc.length - 1] > 2) acc.push(x);
    return acc;
  }, []);

  if (xSig.length < 4) return { xSig: OH_X_STATIC, tol: X_TOL_STATIC };
  return { xSig, tol: X_TOL_DYN };
}

function _inSig(x, xSig, tol) {
  return xSig.some(sx => Math.abs(x - sx) <= tol);
}

function _assignToCols(items, xSig) {
  const buckets = xSig.map(() => []);
  for (const item of items) {
    const str = item.str.trim();
    if (!str) continue;
    let best = 0, bestD = Math.abs(item.x - xSig[0]);
    for (let i = 1; i < xSig.length; i++) {
      const d = Math.abs(item.x - xSig[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    buckets[best].push(str);
  }
  return buckets.map(parts => parts.join(' '));
}

// ── PDF — Extraction des lignes de données ────────────────────────────────────

function _extractPdfRows(items, format) {
  // ORDER_HISTORY : skip page 1 (bloc Commentaires — PDF-ARCH-03)
  const startPage = (format === 'ORDER_HISTORY') ? 2 : 1;
  const byPage = {};
  for (const item of items) {
    if (item.page < startPage) continue;
    (byPage[item.page] = byPage[item.page] || []).push(item);
  }

  const pages = Object.keys(byPage).map(Number).sort((a, b) => a - b);
  const rows  = [];
  let sig = null;

  if (format === 'ORDER_HISTORY' && pages.length > 0) {
    const firstClusters = _clusterByY(byPage[pages[0]] || []);
    sig = _detectOhXSig(firstClusters);
  }

  for (const p of pages) {
    const clusters = _clusterByY(byPage[p]);
    for (const cl of clusters) {
      if (format === 'TRADE_HISTORY') {
        const cells = cl.items.map(i => i.str.trim()).filter(s => s.length > 0);
        if (!cells.length) continue;
        if (_isDateCell(cells[0])) { rows.push(cells); continue; }
        // En-tête répété → ignoré
        if (_isTradeHeader(cells)) continue;
        // Autre contenu (pied de page, titre) → ignoré
      } else {
        // ORDER_HISTORY : filtrage par signature X
        const count = cl.items.filter(
          i => i.str.trim().length > 0 && _inSig(i.x, sig.xSig, sig.tol)
        ).length;
        if (count < 6) continue;
        const sigCells = _assignToCols(cl.items, sig.xSig);
        if (_isDateCell(sigCells[0])) rows.push(sigCells);
      }
    }
  }
  return rows;
}

// ── processEvent PDF — TRADE_HISTORY ─────────────────────────────────────────
// Colonnes : [0]date [1]paire [2]côté [3]prix [4]quantité [5]montant [6]frais

function _processTradePdf(event) {
  const row = event.raw;

  // Condition 3 — champs minimaux
  const paire   = (row[1] || '').trim().toUpperCase();
  const rawSide = (row[2] || '').trim().toUpperCase();
  const side    = (rawSide === 'BUY' || rawSide === 'ACHAT') ? 'BUY'
                : (rawSide === 'SELL' || rawSide === 'VENTE') ? 'SELL'
                : rawSide;

  if (!paire || !side) {
    const missing = [!paire && 'paire', !side && 'côté'].filter(Boolean).join(', ');
    return { status: 'rejeté', motif: `RF-R6 : champs minimaux absents (${missing})`, code: 'RF-R6' };
  }

  // EP-RC2 — position [0] — sentinelle "--" → R1
  const rawDate = (row[0] || '').trim();
  const date    = _applyEpRc2(rawDate, rawDate === '--');

  return {
    status: 'qualifié',
    date,
    valeur: {
      executionTime: date,
      paire,
      cote:     side,
      prix:     _parseNum(row[3]),
      quantite: _parseNum(row[4]),
      montant:  _parseNum(row[5]),
      frais:    _parseNum(row[6]),
    },
  };
}

// ── processEvent PDF — ORDER_HISTORY ─────────────────────────────────────────
// Colonnes : [0]created_at [1]orderId [2]symbol [3]type [4]side [5]order_price
//            [6]order_amount [7]execution_time [8]exec_qty [9]avg_price [10]total [11]status

function _processOrderPdf(event) {
  const row = event.raw;

  // Condition 2 — statut (nullable PDF-ARCH-05)
  const rawStatus = row[11] ? row[11].trim() : null;
  if (!rawStatus) {
    return { status: 'exclu', motif: 'ORDER_HISTORY PDF : statut absent (PDF-ARCH-05) — hors périmètre S1' };
  }
  if (_isFilledStatus(rawStatus)) {
    // → Condition 3
  } else if (_isExcludedStatus(rawStatus)) {
    return { status: 'exclu', motif: `ORDER_HISTORY PDF : statut "${rawStatus}" — hors périmètre S1 (DI4)` };
  } else {
    console.warn('[ingestion] ORDER_HISTORY PDF statut non reconnu :', rawStatus);
    return { status: 'exclu', motif: `ORDER_HISTORY PDF : statut non reconnu "${rawStatus}" — exclu par précaution` };
  }

  // Condition 3 — champs minimaux
  const symbol  = (row[2] || '').trim().toUpperCase();
  const rawSide = (row[4] || '').trim().toUpperCase();
  const side    = (rawSide === 'BUY' || rawSide === 'ACHAT') ? 'BUY'
                : (rawSide === 'SELL' || rawSide === 'VENTE') ? 'SELL'
                : rawSide;
  const orderId = (row[1] || '').trim();

  if (!symbol || !side || !orderId) {
    const missing = [!symbol && 'paire', !side && 'côté', !orderId && 'orderId'].filter(Boolean).join(', ');
    return { status: 'rejeté', motif: `RF-R6 : champs minimaux absents (${missing})`, code: 'RF-R6' };
  }

  // EP-RC2 — position [7] execution_time · sentinelle "--" → R1
  const rawExec   = (row[7] || '').trim();
  const rawCreate = (row[0] || '').trim();
  const date      = _applyEpRc2(rawExec,   rawExec   === '--');
  const createdAt = _applyEpRc2(rawCreate, rawCreate === '--');

  const prixMoyen = _parseNum(row[9]);
  const quantite  = _parseNum(row[8]);
  const orderQty  = _parseNum(row[6]) || quantite;
  const montant   = _parseNum(row[10]) || prixMoyen * quantite;
  const fillRate  = orderQty > 0 ? Math.min(quantite / orderQty, 1) : 1;

  return {
    status: 'qualifié',
    date,
    valeur: {
      orderId,
      createdAt,
      executionTime:   date,
      paire:           symbol,
      typeOrdre:       (row[3] || '').trim() || null,
      cote:            side,
      prixMoyen,
      quantite,
      montant,
      tauxRemplissage: fillRate,
    },
  };
}

// ── Cache PDF (évite la double extraction entre canHandle et extractEvents) ───
// WeakMap : la clé est l'objet descriptor — pas d'état global.
// Garantit que le même PDF n'est parsé qu'une fois par opération d'ingestion.

const _pdfCache = new WeakMap();

async function _getPdfData(descriptor) {
  if (_pdfCache.has(descriptor)) return _pdfCache.get(descriptor);
  const items  = await _loadPdfItems(descriptor.data);
  const format = _detectPdfFormat(items);
  const result = { items, format };
  _pdfCache.set(descriptor, result);
  return result;
}

// ════════════════════════════════════════════════════════════════════════════════
// Contrat générique — 6 capacités (P2-2.D §7.2)
// ════════════════════════════════════════════════════════════════════════════════

/** Famille canonique produite par cet adaptateur. */
export const famille = 'S1';

/**
 * Détermine si cet adaptateur peut traiter le descripteur de source.
 * Ne modifie aucun état.
 *
 * @param {{ type: string, data: string|ArrayBuffer, meta: { name: string } }} descriptor
 * @returns {Promise<boolean>}
 */
export async function canHandle(descriptor) {
  if (!descriptor?.data || !descriptor?.meta?.name) return false;
  const isPdf = /\.pdf$/i.test(descriptor.meta.name);

  if (isPdf) {
    try {
      const { format } = await _getPdfData(descriptor);
      return format === 'TRADE_HISTORY' || format === 'ORDER_HISTORY';
    } catch {
      return false;
    }
  }

  // CSV : détection sur les en-têtes
  try {
    const text = (typeof descriptor.data === 'string')
      ? descriptor.data
      : new TextDecoder().decode(descriptor.data);
    const { headers } = _parseCSV(text);
    return _detectCsvFormat(headers) !== null;
  } catch {
    return false;
  }
}

/**
 * Retourne l'identifiant stable de la source.
 * Phase A : nom du fichier fourni par l'opérateur (P2-2.C §4.3).
 *
 * @param {object} descriptor
 * @returns {string}
 */
export function getSourceId(descriptor) {
  return descriptor?.meta?.name ?? '';
}

/**
 * Calcule l'empreinte SHA-256 du contenu brut de la source.
 * Retourne une chaîne hexadécimale stable (DT-2 · P2-2.A §4).
 *
 * @param {object} descriptor
 * @returns {Promise<string>}
 */
export async function fingerprint(descriptor) {
  let data;
  if (descriptor.data instanceof ArrayBuffer) {
    data = descriptor.data;
  } else if (typeof descriptor.data === 'string') {
    data = new TextEncoder().encode(descriptor.data);
  } else {
    // File / Blob
    data = await descriptor.data.arrayBuffer();
  }
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Lit la source et retourne les événements bruts avec comptage et type.
 * Ne qualifie pas les événements — chaque ligne est retournée telle quelle.
 *
 * @param {object} descriptor
 * @returns {Promise<{ events: object[], total: number, sourceType: string }>}
 */
export async function extractEvents(descriptor) {
  const isPdf = /\.pdf$/i.test(descriptor.meta?.name ?? '');

  if (isPdf) {
    const { items, format } = await _getPdfData(descriptor);
    if (!format) return { events: [], total: 0, sourceType: 'INCONNU' };
    const sourceType = format + ' PDF';
    const rows   = _extractPdfRows(items, format);
    const events = rows.map(row => ({ type: sourceType, raw: row }));
    return { events, total: events.length, sourceType };
  }

  // CSV
  const text = (typeof descriptor.data === 'string')
    ? descriptor.data
    : new TextDecoder().decode(descriptor.data);
  const { headers, rows } = _parseCSV(text);
  const format = _detectCsvFormat(headers);
  if (!format) return { events: [], total: 0, sourceType: 'INCONNU' };
  const sourceType = format + ' CSV';
  const events = rows.map(row => ({ type: sourceType, raw: row }));
  return { events, total: events.length, sourceType };
}

/**
 * Traite un événement brut et retourne le résultat de qualification.
 *
 * @param {{ type: string, raw: object|string[] }} event
 * @returns {{ status: 'qualifié'|'exclu'|'rejeté', date?: string, valeur?: object, motif?: string, code?: string }}
 */
export function processEvent(event) {
  switch (event?.type) {
    case 'TRADE_HISTORY CSV': return _processTradeCsv(event);
    case 'ORDER_HISTORY CSV': return _processOrderCsv(event);
    case 'TRADE_HISTORY PDF': return _processTradePdf(event);
    case 'ORDER_HISTORY PDF': return _processOrderPdf(event);
    default:
      return {
        status: 'rejeté',
        motif:  `RF-R6 : type d'événement non reconnu "${event?.type ?? 'undefined'}"`,
        code:   'RF-R6',
      };
  }
}
