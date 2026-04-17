// Maps a parsed row to the canonical trade format.
//
// normalizeTrade(row) — pipeline de transformation unique.
// mapBinanceSpotRow() — adaptateur pour le pipeline trading :
//   appelle normalizeTrade et ajoute session_id, tags, quote_quantity
//   (field attendu par les modules analytics existants).
//
// Canonical output of normalizeTrade:
//   timestamp, symbol, side, price, quantity, quote_value, fee

// ── Normalisation des clés de colonnes ────────────────────────────────────────
// Minuscules + suppression diacritiques + normalisation séparateurs.
// "Côté" → "cote"  ·  "Exécuté" → "execute"  ·  "Prix" → "prix"
// Identique à normalizeHeader() dans uploader.js — dupliquée pour rester module isolé.
function normalizeKey(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // supprime diacritiques
    .replace(/[\s_./\\-]+/g, ' ')      // normalise séparateurs en espace
    .trim();
}

// ── Tables d'alias ────────────────────────────────────────────────────────────
// Toutes les clés en forme normalisée (résultat de normalizeKey). Premier match gagne.
// Inclut variantes FR (prix, paire, cote, execute, frais…) et formats alternatifs Binance.

const ALIASES_DATE   = ['date(utc)', 'date', 'utc time', 'utc_time', 'time', 'timestamp',
                        'trade time', 'created time', 'update time', 'open time', 'created at',
                        'heure', 'date et heure'];
const ALIASES_SYMBOL = ['pair', 'symbol', 'market', 'trading pair', 'base asset', 'ticker',
                        'paire', 'paire de trading', 'asset'];
const ALIASES_SIDE   = ['side', 'order side', 'direction', 'cote', 'sens',
                        'type', 'trade type', 'bs flag', 'achat vente'];
const ALIASES_PRICE  = ['price', 'avg price', 'avg. price', 'filled price', 'average price',
                        'avgtrading price', 'execution price', 'deal price', 'order price',
                        'prix', 'prix moyen', 'prix moyen rempli', 'prix d execution'];
const ALIASES_QTY    = ['executed', 'qty', 'quantity', 'filled', 'base qty', 'base quantity',
                        'filled qty', 'executed qty', 'base amount', 'vol',
                        'execute', 'quantite', 'qte', 'volume execute', 'montant execute'];
const ALIASES_QUOTE  = ['amount', 'total', 'quote qty', 'quote quantity', 'value', 'quote value',
                        'quote asset', 'deal value', 'deal amount', 'turnover',
                        'montant', 'valeur totale', 'valeur'];
const ALIASES_FEE    = ['fee', 'commission', 'fee amount', 'transaction fee', 'trading fee',
                        'maker fee', 'taker fee',
                        'frais', 'cout transaction', 'frais de transaction'];

// ── normalizeTrade ─────────────────────────────────────────────────────────────
// Pipeline unique : row quelconque → trade canonique, ou null si invalide.
// Retourne : { timestamp, symbol, side, price, quantity, quote_value, fee }

// [DEBUG TEMPORAIRE] — flag pour logger seulement la 1re ligne du fichier importé
let _debugNormalize = false;
export function enableTradeDebug() { _debugNormalize = true; }

function normalizeTrade(row) {
  const norm = {};
  for (const [k, v] of Object.entries(row)) {
    norm[normalizeKey(k)] = v;   // normalisation accent-safe : "Côté" → "cote", "Exécuté" → "execute"
  }

  const get = (aliases) => {
    for (const alias of aliases) {
      if (norm[alias] !== undefined && norm[alias] !== '') return norm[alias];
    }
    return '';
  };

  const timestamp = parseDate(get(ALIASES_DATE));
  if (!timestamp) return null;

  const symbol  = get(ALIASES_SYMBOL).trim().toUpperCase();
  const rawSide = get(ALIASES_SIDE).trim().toUpperCase();

  // Variantes FR (ACHAT/VENTE) + types composés Binance (BUY_LIMIT, SELL_MARKET, etc.)
  const side = (rawSide === 'BUY'  || rawSide.startsWith('BUY_')  || rawSide === 'LONG'  || rawSide === 'ACHAT') ? 'BUY'
             : (rawSide === 'SELL' || rawSide.startsWith('SELL_') || rawSide === 'SHORT' || rawSide === 'VENTE') ? 'SELL'
             : rawSide;

  const price = parseNum(get(ALIASES_PRICE));
  const fee   = parseNum(get(ALIASES_FEE));

  // Quantité base asset.
  // Cas Binance réel : Amount = base qty, Total = quote value.
  // Si les colonnes qty standard sont absentes mais Amount + Total coexistent,
  // Amount est la quantité (pas la valeur quote).
  let qty = parseNum(get(ALIASES_QTY));
  const amountVal = parseNum(get(['amount']));
  const totalVal  = parseNum(get(['total']));
  if (qty === 0 && amountVal > 0 && totalVal > 0) {
    qty = amountVal;
  }

  // quote_value : valeur monétaire en quote asset (ex : USDT).
  // Priorité à Total si présent ; sinon ancienne logique ALIASES_QUOTE.
  let quote_value;
  if (totalVal > 0) {
    quote_value = totalVal;
  } else {
    const rawAmount = parseNum(get(ALIASES_QUOTE));
    const computed  = price * qty;
    quote_value = (rawAmount > 0 && rawAmount >= computed * 0.5) ? rawAmount : computed;
  }

  // [DEBUG TEMPORAIRE] — à retirer après diagnostic binance_spot_trade_recent.csv
  if (_debugNormalize) {
    const reason = !symbol ? 'symbol vide'
                 : !side   ? `side non reconnu ("${rawSide}")`
                 : !price  ? 'price = 0'
                 : !qty    ? 'qty = 0'
                 : 'ok';
    console.debug('[bhv:norm] clés norm:', Object.keys(norm).join(', '));
    console.debug('[bhv:norm] extrait → date:%s sym:%s side:%s(%s) price:%s qty:%s | %s',
      get(ALIASES_DATE), symbol, side, rawSide, price, qty, reason);
    _debugNormalize = false;  // log seulement la 1re ligne, pas le flood
  }

  if (!symbol || !side || !price || !qty) return null;

  return { timestamp, symbol, side, price, quantity: qty, quote_value, fee };
}

// ── mapBinanceSpotRow ─────────────────────────────────────────────────────────
// Adaptateur pour le pipeline trading.
// Ajoute quote_quantity (compat analytics), session_id et tags.

function mapBinanceSpotRow(row, sessionId) {
  const trade = normalizeTrade(row);
  if (!trade) return null;
  return {
    ...trade,
    quote_quantity: trade.quote_value,
    session_id:     sessionId,
    tags:           []
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Extrait la valeur numérique d'une chaîne pouvant contenir un suffixe asset.
// "0.001 BTC" → 0.001 · "21.50 USDT" → 21.50 · "21,500" → 21500 (virgule milliers)
function parseNum(raw) {
  const str = String(raw || '').trim()
    // Supprimer les espaces comme séparateurs de milliers ("21 500" → "21500")
    .replace(/\s(?=\d)/g, '')
    // Virgule comme séparateur de milliers si suivie de 3 chiffres et d'un autre séparateur
    // ou en fin : "21,500" → "21500" (mais "21,50" reste "21,50" → traité comme décimal)
    .replace(/,(\d{3})(?=[,.\s]|$)/g, '$1');

  const match = str.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

// Parse une date texte ou un timestamp numérique vers un timestamp UTC en ms.
function parseDate(str) {
  if (!str) return null;
  str = str.trim();

  // Timestamp Unix numérique (secondes ou millisecondes)
  if (/^\d{10}$/.test(str)) return parseInt(str, 10) * 1000;
  if (/^\d{13}$/.test(str)) return parseInt(str, 10);

  // Format texte : "2023-01-15 10:30:00" ou ISO
  const normalized = str.replace(' ', 'T');
  const suffix = (normalized.includes('Z') || normalized.includes('+')) ? '' : 'Z';
  const d = new Date(normalized + suffix);
  return isNaN(d.getTime()) ? null : d.getTime();
}

export { normalizeTrade, mapBinanceSpotRow };
