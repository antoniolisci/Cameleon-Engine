// Maps a parsed Binance Spot CSV row to the canonical trade format.
//
// Expected Binance Spot CSV columns:
//   Date(UTC), Pair, Side, Price, Executed, Amount, Fee
//
// "Executed" and "Amount" may include the asset name (e.g. "0.001 BTC", "21.50 USDT").
// This mapper strips non-numeric suffixes before parsing.

function mapBinanceSpotRow(row, sessionId) {
  const timestamp = parseDate(row['Date(UTC)'] || row['Date'] || '');
  if (!timestamp) return null;

  const symbol = (row['Pair'] || row['Symbol'] || '').trim().toUpperCase();
  const side   = (row['Side'] || '').trim().toUpperCase();
  const price  = parseNum(row['Price']);
  const qty    = parseNum(row['Executed'] || row['Qty']);
  const quoteQty = parseNum(row['Amount'] || row['QuoteQty']);
  const fee    = parseNum(row['Fee']);

  if (!symbol || !side || !price || !qty) return null;

  return {
    timestamp,
    symbol,
    side,
    price,
    quantity: qty,
    quote_quantity: quoteQty,
    fee,
    session_id: sessionId,
    tags: []
  };
}

// Parses numeric values that may have an asset suffix ("0.001 BTC" → 0.001).
function parseNum(raw) {
  const match = String(raw || '').trim().match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

// Parses "2023-01-15 10:30:00" or ISO variants to a UTC timestamp.
function parseDate(str) {
  if (!str) return null;
  const normalized = str.trim().replace(' ', 'T');
  const suffix = normalized.includes('Z') || normalized.includes('+') ? '' : 'Z';
  const d = new Date(normalized + suffix);
  return isNaN(d.getTime()) ? null : d.getTime();
}

export { mapBinanceSpotRow };
