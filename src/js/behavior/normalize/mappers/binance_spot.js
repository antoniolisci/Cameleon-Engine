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
                        'heure', 'date et heure',
                        // Export Binance FR — certains fichiers utilisent "Durée" comme première
                        // colonne (libellé ambigu, mais contient parfois le timestamp de transaction).
                        // À valider via les logs [RAW ROW] : si la valeur est un datetime → correct.
                        'duree',
                        // Exports Binance FR avec timezone locale : Date(UTC+2), Date(UTC+8)…
                        // La clé normalisée "date(utc+2)" → canonicalisée en "date(utc)" ci-dessous
                        // Ces alias sont insérés dynamiquement dans normalizeTrade — pas besoin de les lister
                       ];
const ALIASES_SYMBOL = ['pair', 'symbol', 'market', 'trading pair', 'base asset', 'ticker',
                        'paire', 'paire de trading', 'asset'];
const ALIASES_SIDE   = ['side', 'order side', 'direction', 'cote', 'sens'];
// 'type' et 'trade type' sont intentionnellement absents : sur certains exports Binance,
// ces colonnes contiennent le type d'ordre (LIMIT / MARKET), pas le côté (BUY / SELL).
// Elles sont traitées séparément dans normalizeTrade avec vérification du préfixe BUY/SELL.
const ALIASES_PRICE  = ['price', 'avg price', 'avg. price', 'filled price', 'average price',
                        'avgtrading price', 'execution price', 'deal price', 'order price',
                        'prix', 'prix moyen', 'prix moyen rempli', 'prix d execution',
                        'prix d execution moyen'];       // Binance FR : "Prix d'exécution moyen"
const ALIASES_QTY    = ['executed', 'qty', 'quantity', 'filled', 'base qty', 'base quantity',
                        'filled qty', 'executed qty', 'base amount', 'amount', 'vol',
                        'execute', 'quantite', 'qte', 'volume execute', 'montant execute',
                        'quantite executee'];            // Binance FR : "Quantité exécutée"
const ALIASES_QUOTE  = ['amount', 'total', 'quote qty', 'quote quantity', 'value', 'quote value',
                        'quote asset', 'deal value', 'deal amount', 'turnover',
                        'montant', 'valeur totale', 'valeur'];
const ALIASES_FEE    = ['fee', 'commission', 'fee amount', 'transaction fee', 'trading fee',
                        'maker fee', 'taker fee',
                        'frais', 'cout transaction', 'frais de transaction'];

// ── normalizeTrade ─────────────────────────────────────────────────────────────
// Pipeline unique : row quelconque → trade canonique, ou null si invalide.
// Retourne : { timestamp, symbol, side, price, quantity, quote_value, fee }

function normalizeTrade(row) {
  const norm = {};
  for (const [k, v] of Object.entries(row)) {
    norm[normalizeKey(k)] = v;   // normalisation accent-safe : "Côté" → "cote", "Exécuté" → "execute"
  }

  // Canonicalise les variantes de timezone sur la colonne date.
  // Binance FR exporte parfois "Date(UTC+2)", "Date(UTC+8)"… selon la locale.
  // normalizeKey conserve les parenthèses → "date(utc+2)" ≠ "date(utc)" dans ALIASES_DATE.
  // Ce pass ajoute "date(utc)" dans norm si une clé UTC±N est présente,
  // sans modifier la clé originale (préservation idempotente).
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

  const rawDate = get(ALIASES_DATE);
  const timestamp = parseDate(rawDate);
  if (!timestamp) {
    console.warn('[bhv:map] ❌ timestamp null — clés norm:', Object.keys(norm).join(', '));
    console.warn('[bhv:map]    valeur date brute:', JSON.stringify(rawDate) || '(aucune clé date matchée)');
    return null;
  }

  const symbol = get(ALIASES_SYMBOL).trim().toUpperCase();

  // Résolution du côté en deux temps :
  //   1. Colonnes explicitement dédiées au côté (side, direction, cote…)
  //   2. Fallback sur 'type' / 'trade type' uniquement si la valeur commence par BUY ou SELL
  //      (ex : "BUY_LIMIT" → OK ; "LIMIT" ou "MARKET" → ignoré — c'est un type d'ordre)
  let rawSide = get(ALIASES_SIDE).trim().toUpperCase();
  if (!rawSide) {
    for (const col of ['type', 'trade type']) {
      const val = (norm[col] || '').trim().toUpperCase();
      if (val.startsWith('BUY') || val.startsWith('SELL')) { rawSide = val; break; }
    }
  }

  // Variantes FR (ACHAT/VENTE) + types composés Binance (BUY_LIMIT, SELL_MARKET, etc.)
  const side = (rawSide === 'BUY'  || rawSide.startsWith('BUY_')  || rawSide === 'LONG'  || rawSide === 'ACHAT') ? 'BUY'
             : (rawSide === 'SELL' || rawSide.startsWith('SELL_') || rawSide === 'SHORT' || rawSide === 'VENTE') ? 'SELL'
             : rawSide;

  const price = parseNum(get(ALIASES_PRICE));
  const fee   = parseNum(get(ALIASES_FEE));

  // Quantité base asset.
  // Cas Binance réel : Amount = base qty, Total = quote value.
  // Si les colonnes qty standard sont absentes mais Amount + Total coexistent,
  // le fallback Amount → qty est appliqué uniquement si Total / Amount ≈ price (±10%).
  // Cela confirme que Amount est bien la quantité base (pas la valeur quote) :
  //   qty_base × price ≈ total  →  total / amount ≈ price
  // Sans cette vérification, un export où Amount = valeur USDT produirait une qty fausse.
  let qty = parseNum(get(ALIASES_QTY));
  const amountVal = parseNum(get(['amount']));
  const totalVal  = parseNum(get(['total']));
  if (qty === 0 && amountVal > 0 && totalVal > 0 && price > 0) {
    const impliedPrice = totalVal / amountVal;
    if (impliedPrice >= price * 0.9 && impliedPrice <= price * 1.1) {
      qty = amountVal;
    }
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

  if (!symbol || !side || !price || !qty) {
    console.warn('[bhv:map] ❌ champ manquant — symbol=%s side=%s price=%s qty=%s',
      symbol || '(vide)', side || '(vide)', price, qty);
    console.warn('[bhv:map]    bruts → date=%s sym=%s side=%s price=%s qty=%s fee=%s',
      JSON.stringify(rawDate),
      JSON.stringify(get(ALIASES_SYMBOL)),
      JSON.stringify(get(ALIASES_SIDE)),
      JSON.stringify(get(ALIASES_PRICE)),
      JSON.stringify(get(ALIASES_QTY)),
      JSON.stringify(get(ALIASES_FEE)));
    return null;
  }

  console.log('[MAPPED TRADE]', { timestamp, symbol, side, price, quantity: qty, quote_value, fee });
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

// Extrait la valeur numérique d'une chaîne — formats FR et EN supportés.
//
// Formats reconnus :
//   "0,25"        → 0.25    (virgule décimale FR)
//   "42000,50"    → 42000.5 (virgule décimale FR)
//   "1.234,56"    → 1234.56 (milliers point + décimale virgule — FR)
//   "1,234.56"    → 1234.56 (milliers virgule + décimale point — EN)
//   "21 500"      → 21500   (espace comme séparateur de milliers)
//   "0.001 BTC"   → 0.001   (suffixe asset ignoré)
function parseNum(raw) {
  let str = String(raw || '').trim()
    .replace(/\s(?=\d)/g, '');   // espaces milliers : "21 500" → "21500"

  const hasComma = str.includes(',');
  const hasDot   = str.includes('.');

  if (hasComma && hasDot) {
    // Les deux séparateurs présents — le dernier en position est le décimal.
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // Format européen : "1.234,56" → "1234.56"
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Format US/standard : "1,234.56" → "1234.56"
      str = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Virgule seule.
    // Si exactement 3 chiffres après la virgule (puis non-chiffre ou fin) → milliers.
    // Sinon → décimale FR : "0,25" → "0.25".
    if (/,\d{3}(?:\D|$)/.test(str)) {
      str = str.replace(/,/g, '');   // milliers : "1,234" → "1234"
    } else {
      str = str.replace(',', '.');   // décimal  : "0,25"  → "0.25"
    }
  }
  // Point seul → traitement standard (parseFloat natif gère "0.25", "1.234")

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

  // Format année sur 2 chiffres : "26-04-12 16:42:05" → "2026-04-12T16:42:05"
  const shortYear = str.match(/^(\d{2})-(\d{2})-(\d{2})\s(\d{2}:\d{2}:\d{2})$/);
  if (shortYear) {
    const iso = `20${shortYear[1]}-${shortYear[2]}-${shortYear[3]}T${shortYear[4]}Z`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  // Format texte : "2023-01-15 10:30:00" ou ISO
  const normalized = str.replace(' ', 'T');
  const suffix = (normalized.includes('Z') || normalized.includes('+')) ? '' : 'Z';
  const d = new Date(normalized + suffix);
  return isNaN(d.getTime()) ? null : d.getTime();
}

export { normalizeTrade, mapBinanceSpotRow };
