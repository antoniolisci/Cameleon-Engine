// Détecte le format d'un export Binance à partir des en-têtes.
//
// Format A — Trade History (historique de trades exécutés)
//   Signaux : Fee / Frais présents, pas de Status / Statut
//   Résultat : 'TRADE_HISTORY'
//
// Format B — Order History (historique d'ordres)
//   Signaux : Order ID présent OU Status / Statut présent
//   Résultat : 'ORDER_HISTORY'
//
// Format inconnu → 'UNKNOWN'

// ── Normalisation d'en-tête ────────────────────────────────────────────────────
// Identique à normalizeHeader dans uploader.js — dupliquée pour rester module isolé.
function normalizeH(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_./\\()+\-]+/g, ' ')   // aligné sur normalizeHeader — "Fee(USDT)" → "fee usdt"
    .trim();
}

// ── Signaux de format ─────────────────────────────────────────────────────────

// Format A : Trade History — frais de transaction présents
const SIGNALS_FEE = [
  'fee', 'fee(usdt)', 'fee(bnb)', 'fee coin', 'commission',
  'frais', 'frais de transaction', 'cout transaction'
];

// Format B : Order History — champ statut d'ordre
const SIGNALS_STATUS = [
  'status', 'statut', 'order status', 'statut ordre', 'etat'
];

// Format B : Order History — identifiant d'ordre
const SIGNALS_ORDER_ID = [
  'order id', 'orderid', 'order no', 'order number', 'id ordre', 'numero ordre'
];

// ── Matching exact ou préfixe/suffixe (même logique que matchesField dans uploader.js) ─

function matchSig(col, signals) {
  for (const sig of signals) {
    if (col === sig)                   return true;
    if (sig.length < 4)               continue;
    if (col.startsWith(sig + ' '))    return true;
    if (col.endsWith(' ' + sig))      return true;
    if (col.includes(' ' + sig + ' ')) return true;
  }
  return false;
}

// ── detectFormat ──────────────────────────────────────────────────────────────
// headers : string[] — en-têtes bruts du fichier
// Retourne : 'TRADE_HISTORY' | 'ORDER_HISTORY' | 'UNKNOWN'

function detectFormat(headers) {
  const h = headers.map(normalizeH);

  const hasFee      = h.some(c => matchSig(c, SIGNALS_FEE));
  const hasStatus   = h.some(c => matchSig(c, SIGNALS_STATUS));
  const hasOrderId  = h.some(c => matchSig(c, SIGNALS_ORDER_ID));

  console.debug('[bhv:format] fee=%s status=%s orderId=%s | cols: %s',
    hasFee, hasStatus, hasOrderId, h.join(', '));

  if (hasStatus || hasOrderId) return 'ORDER_HISTORY';
  if (hasFee)                  return 'TRADE_HISTORY';
  return 'UNKNOWN';
}

export { detectFormat };
