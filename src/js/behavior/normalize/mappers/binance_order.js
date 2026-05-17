// Normalise une ligne d'Order History Binance vers le format canonique interne.
//
// Format B — Order History : contient Order ID + Status/Statut.
// Seuls les ordres FILLED sont extraits pour l'analyse comportementale.
// Les ordres NEW, CANCELED, PARTIALLY_FILLED sont ignorés (pas d'exécution réelle).
//
// Canonical output :
//   { timestamp, symbol, side, price, quantity, quote_value, fee,
//     orderId, status, fillRate }
//
// fillRate : fraction exécutée (0–1), utile pour l'analyse de fill rate.

// ── Normalisation de clé ───────────────────────────────────────────────────────
// L'apostrophe est ajoutée aux séparateurs pour gérer les colonnes FR comme
// "Prix de l'ordre" → "prix de l ordre" (sans apostrophe littérale dans la clé).
function normalizeKey(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_./'\\-]+/g, ' ')   // ' inclus : "l'ordre" → "l ordre"
    .trim();
}

// ── Tables d'alias ────────────────────────────────────────────────────────────

const ALIASES_DATE     = ['date(utc)', 'date', 'utc time', 'time', 'timestamp',
                          'created time', 'update time', 'open time', 'created at',
                          'order time', 'trade time', 'heure', 'date et heure',
                          'duree'];
const ALIASES_SYMBOL   = ['pair', 'symbol', 'market', 'trading pair', 'ticker', 'paire', 'asset'];
const ALIASES_SIDE     = ['side', 'order side', 'direction', 'cote', 'sens'];
const ALIASES_PRICE    = ['price', 'avg price', 'avg. price', 'filled price', 'average price',
                          'execution price', 'deal price', 'order price', 'last price',
                          'prix', 'prix moyen', 'prix d execution',
                          // Binance FR : "Prix moyen" ou "Prix de l'ordre" (apostrophe → espace via normalizeKey)
                          'prix de l ordre', 'prix moyen rempli', 'prix d execution moyen'];
const ALIASES_QTY      = ['executed qty', 'filled qty', 'executed', 'filled', 'qty', 'quantity',
                          'base qty', 'base quantity', 'execute', 'quantite',
                          // Binance FR : "Exécuté", "Quantité exécutée"
                          'quantite executee', 'volume execute', 'montant execute'];
const ALIASES_ORDER_QTY = ['order quantity', 'original qty', 'orig qty', 'quantite ordre',
                            'quantite initiale',
                            // Binance FR : "Montant de la commande"
                            'montant de la commande', 'quantite de la commande',
                            'volume de la commande', 'ordre quantite'];
const ALIASES_QUOTE    = ['total', 'quote qty', 'quote quantity', 'value', 'deal value',
                          'montant', 'valeur totale',
                          // Binance FR : "Trading Total"
                          'trading total', 'total trade', 'montant total', 'valeur totale echangee'];
const ALIASES_FEE      = ['fee', 'commission', 'fee amount', 'transaction fee', 'trading fee',
                          'frais', 'frais de transaction'];
const ALIASES_STATUS   = ['status', 'statut', 'order status', 'statut ordre', 'etat'];
const ALIASES_ORDER_ID = ['order id', 'orderid', 'order no', 'order number', 'id ordre'];

// ── Statuts reconnus comme "exécuté" ─────────────────────────────────────────
// isFilledStatus normalise la valeur brute (lowercase + suppression diacritiques)
// avant comparaison → couvre toutes les variantes FR/EN accentuées ou non.
//
// FR : Complété, Exécuté, Terminé, Rempli, Complete, Execute, Termine
// EN : FILLED, Filled, EXECUTED, COMPLETED, COMPLETE, DONE

function isFilledStatus(value) {
  const norm = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');   // "Complété" → "complete", "Exécuté" → "execute"
  return norm === 'filled'    || norm === 'rempli'   || norm === 'complete'  ||
         norm === 'completed' || norm === 'execute'  || norm === 'executed'  ||
         norm === 'termine'   || norm === 'done'     || norm === 'closed'    ||
         norm.startsWith('filled');
}

const FILLED_STATUSES = new Set(['FILLED', 'REMPLI', 'COMPLETED', 'COMPLETE', 'DONE']);

// ── normalizeOrderRow ─────────────────────────────────────────────────────────
// row : objet brut (clés brutes du CSV/XLSX)
// Retourne un objet canonique ou null si l'ordre n'est pas exécuté.

function normalizeOrderRow(row) {
  const norm = {};
  for (const [k, v] of Object.entries(row)) {
    norm[normalizeKey(k)] = v;
  }

  // Canonicalise Date(UTC±N) → date(utc) (même logique que binance_spot.js).
  for (const key of Object.keys(norm)) {
    if (/^date\(utc[+-]\d+\)$/.test(key) && norm['date(utc)'] === undefined) {
      norm['date(utc)'] = norm[key];
    }
  }

  const get = (aliases) => {
    for (const alias of aliases) {
      if (norm[alias] !== undefined && norm[alias] !== '') return norm[alias];
    }
    return '';
  };

  // ── Statut — filtre les ordres non exécutés ───────────────────────────────
  const rawStatus = String(get(ALIASES_STATUS)).trim();
  if (!rawStatus) return null;   // pas de statut → format inattendu
  if (!isFilledStatus(rawStatus)) return null;

  // ── Timestamp ─────────────────────────────────────────────────────────────
  const rawDate   = get(ALIASES_DATE);
  const timestamp = parseDate(rawDate);
  if (!timestamp) {
    console.warn('[ORDER VALIDATION REJECT] timestamp null — clés norm:', Object.keys(norm).join(', '));
    console.warn('[ORDER VALIDATION REJECT] valeur date brute:', JSON.stringify(rawDate) || '(aucune)');
    return null;
  }

  // ── Symbole ───────────────────────────────────────────────────────────────
  const symbol = get(ALIASES_SYMBOL).trim().toUpperCase();

  // ── Côté ──────────────────────────────────────────────────────────────────
  let rawSide = get(ALIASES_SIDE).trim().toUpperCase();
  if (!rawSide) {
    for (const col of ['type', 'trade type', 'order type']) {
      const val = (norm[col] || '').trim().toUpperCase();
      if (val.startsWith('BUY') || val.startsWith('SELL')) { rawSide = val; break; }
    }
  }
  const side = (rawSide === 'BUY'  || rawSide.startsWith('BUY_')  || rawSide === 'LONG'  || rawSide === 'ACHAT') ? 'BUY'
             : (rawSide === 'SELL' || rawSide.startsWith('SELL_') || rawSide === 'SHORT' || rawSide === 'VENTE') ? 'SELL'
             : rawSide;

  // ── Prix ──────────────────────────────────────────────────────────────────
  // Priorité : "Prix moyen" (prix d'exécution réel) > "Prix de l'ordre" (prix limite posé)
  const price = parseNum(get(ALIASES_PRICE));

  // ── Quantité exécutée ─────────────────────────────────────────────────────
  // Priorité : colonnes d'exécution (Exécuté, execute…) > colonnes de commande (Montant…)
  let qty = parseNum(get(ALIASES_QTY));

  // ── Quantité initiale (pour fill rate) ────────────────────────────────────
  const orderQty = parseNum(get(ALIASES_ORDER_QTY)) || qty;

  // ── Quote value ───────────────────────────────────────────────────────────
  const totalVal    = parseNum(get(ALIASES_QUOTE));
  const quote_value = totalVal > 0 ? totalVal : price * qty;

  // ── Frais ─────────────────────────────────────────────────────────────────
  const fee = parseNum(get(ALIASES_FEE));

  // ── Order ID ──────────────────────────────────────────────────────────────
  const orderId = get(ALIASES_ORDER_ID) || null;

  // ── Validation finale ─────────────────────────────────────────────────────
  if (!symbol || !side || !price || !qty) {
    console.warn('[ORDER VALIDATION REJECT] champ manquant:',
      { symbol: symbol || '(vide)', side: side || '(vide)', price, qty });
    console.warn('[ORDER VALIDATION REJECT] bruts:',
      { date: JSON.stringify(rawDate),
        sym:   JSON.stringify(get(ALIASES_SYMBOL)),
        side:  JSON.stringify(get(ALIASES_SIDE)),
        price: JSON.stringify(get(ALIASES_PRICE)),
        qty:   JSON.stringify(get(ALIASES_QTY)) });
    return null;
  }

  const mapped = {
    timestamp,
    symbol,
    side,
    price,
    quantity:      qty,
    quote_value,
    quote_quantity: quote_value,
    fee,
    orderId,
    status:        rawStatus,
    fillRate:      orderQty > 0 ? Math.min(qty / orderQty, 1) : 1
  };
  return mapped;
}

// ── mapOrderRows ──────────────────────────────────────────────────────────────
// Convertit un tableau de lignes brutes en trades canoniques filtrés (FILLED seulement).
// sessionId : identifiant de session

function mapOrderRows(rows, sessionId) {
  const trades       = [];
  let   skipped      = 0;
  const statusCounts = {};   // { rawStatus: count } — pour diagnostic si 0 FILLED

  for (const row of rows) {
    // Collecter les statuts bruts pour diagnostic (avant filtre)
    const stKey  = Object.keys(row).find(k => {
      const n = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return n.includes('status') || n.includes('statut') || n.includes('etat');
    });
    if (stKey) {
      const stVal = String(row[stKey]).trim();
      if (stVal) statusCounts[stVal] = (statusCounts[stVal] || 0) + 1;
    }

    const t = normalizeOrderRow(row);
    if (t) {
      trades.push({ ...t, session_id: sessionId, tags: [] });
    } else {
      skipped++;
    }
  }

  if (trades.length === 0 && Object.keys(statusCounts).length > 0) {
    console.warn('[ORDER_HISTORY] Aucun ordre FILLED — statuts trouvés :', statusCounts);
  }

  return { trades, skipped, statusCounts };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Même logique que parseNum dans binance_spot.js : formats FR et EN supportés.
// "0,25" → 0.25 · "1.234,56" → 1234.56 · "1,234.56" → 1234.56 · "21 500" → 21500
function parseNum(raw) {
  let str = String(raw || '').trim()
    .replace(/\s(?=\d)/g, '');   // espaces milliers

  const hasComma = str.includes(',');
  const hasDot   = str.includes('.');

  if (hasComma && hasDot) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');   // "1.234,56" → "1234.56"
    } else {
      str = str.replace(/,/g, '');                      // "1,234.56" → "1234.56"
    }
  } else if (hasComma) {
    str = /,\d{3}(?:\D|$)/.test(str)
      ? str.replace(/,/g, '')    // milliers : "1,234" → "1234"
      : str.replace(',', '.');   // décimal  : "0,25"  → "0.25"
  }

  const match = str.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseDate(str) {
  if (!str) return null;
  str = str.trim();
  if (/^\d{10}$/.test(str)) return parseInt(str, 10) * 1000;
  if (/^\d{13}$/.test(str)) return parseInt(str, 10);
  const shortYear = str.match(/^(\d{2})-(\d{2})-(\d{2})\s(\d{2}:\d{2}:\d{2})$/);
  if (shortYear) {
    const iso = `20${shortYear[1]}-${shortYear[2]}-${shortYear[3]}T${shortYear[4]}Z`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d.getTime();
  }
  const normalized = str.replace(' ', 'T');
  const suffix = (normalized.includes('Z') || normalized.includes('+')) ? '' : 'Z';
  const d = new Date(normalized + suffix);
  return isNaN(d.getTime()) ? null : d.getTime();
}

export { normalizeOrderRow, mapOrderRows, FILLED_STATUSES };
