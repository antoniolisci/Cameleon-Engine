// portfolio-extractor.js — extracts portfolio composition from raw Wallet History rows.
//
// Input  : rows[] — raw row-objects from uploader.js (result.rawRows)
// Output : { assets: [Asset] }
//
// No external imports. No API calls. No pricing. No persistence. Pure extraction.
// Companion to wallet_analyzer.js — does not replace or modify it.

// ── Static classification lists ───────────────────────────────────────────────

const STABLECOINS = new Set(['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'FDUSD', 'USDS']);
const MAJORS      = new Set(['BTC', 'ETH', 'BNB']);

// ── classifyAsset ─────────────────────────────────────────────────────────────
// Returns 'stablecoin' | 'major' | 'altcoin' for a given symbol string.
// Expects uppercase input — safe if called with any case (toUpperCase applied internally).

export function classifyAsset(symbol) {
  if (!symbol) return 'altcoin';
  const s = String(symbol).toUpperCase().trim();
  if (STABLECOINS.has(s) || s.endsWith('USD') || s.endsWith('EUR')) return 'stablecoin';
  if (MAJORS.has(s)) return 'major';
  return 'altcoin';
}

// ── parseQuantity ─────────────────────────────────────────────────────────────
// Parses a raw Change value to a JS number.
// Handles : JS numbers · strings with comma or point decimal separator · leading spaces.
// Returns NaN if the value is absent or not parsable.

export function parseQuantity(value) {
  if (value === null || value === undefined || value === '') return NaN;
  if (typeof value === 'number') return isNaN(value) ? NaN : value;
  const str = String(value).trim().replace(/\s/g, '').replace(/,/g, '.');
  return parseFloat(str);
}

// ── parseDate ─────────────────────────────────────────────────────────────────
// Parses a raw date string to an ISO 8601 string (UTC).
// Handles : Unix timestamp (10 or 13 digits) · "YYYY-MM-DD HH:MM:SS" · ISO strings.
// Returns null if the value is absent or not parsable.

export function parseDate(value) {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value).trim();
  if (!str) return null;

  // Unix timestamp — 10 digits (seconds) or 13 digits (milliseconds)
  if (/^\d{10}$/.test(str)) return new Date(parseInt(str, 10) * 1000).toISOString();
  if (/^\d{13}$/.test(str)) return new Date(parseInt(str, 10)).toISOString();

  // Text date : "2026-01-01 10:00:00" → "2026-01-01T10:00:00Z"
  const normalized = str.replace(' ', 'T');
  const suffix     = (normalized.includes('Z') || normalized.includes('+')) ? '' : 'Z';
  const d          = new Date(normalized + suffix);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ── _get ──────────────────────────────────────────────────────────────────────
// Returns the first defined, non-empty value among the given keys in a normalized row.

function _get(row, ...keys) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

// ── extract ───────────────────────────────────────────────────────────────────
// Main export. Extracts asset composition from raw Wallet History rows.
//
// Rules (from portfolio-v1-impl.md §6) :
//   - rows not an array → { assets: [] }
//   - Read symbol from Coin or Asset (alias-tolerant, case-insensitive key lookup)
//   - Lines without a symbol are ignored
//   - Change accumulated algebraically per symbol
//   - If Change is absent or NaN → skip for netQuantity, count operation anyway
//   - Assets with netQuantity = 0 or negative are included
//   - firstSeenAt = oldest parsable date in the file for that symbol
//   - lastSeenAt  = newest parsable date in the file for that symbol
//   - Output sorted alphabetically by symbol for stability

export function extract(rows) {
  if (!Array.isArray(rows)) return { assets: [] };

  // Accumulator : symbol → { netQuantity, firstTs, lastTs, operationCount }
  const acc = {};

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;

    // Normalize row keys to lowercase + trimmed for alias tolerance
    // (mirrors the approach in wallet_analyzer.js)
    const norm = {};
    for (const [k, v] of Object.entries(row)) {
      norm[k.toLowerCase().trim()] = v;
    }

    // Symbol — read from Coin or Asset alias
    const rawSymbol = _get(norm, 'coin', 'asset');
    if (!rawSymbol) continue;
    const symbol = String(rawSymbol).toUpperCase().trim();
    if (!symbol) continue;

    // Initialize accumulator entry for this symbol
    if (!acc[symbol]) {
      acc[symbol] = { netQuantity: 0, firstTs: null, lastTs: null, operationCount: 0 };
    }
    acc[symbol].operationCount++;

    // Quantity — accumulate Change algebraically
    const qty = parseQuantity(_get(norm, 'change'));
    if (!isNaN(qty)) {
      acc[symbol].netQuantity += qty;
    }

    // Date — track first and last timestamp per symbol
    const iso = parseDate(_get(norm, 'utc_time', 'date', 'time', 'timestamp', 'date(utc)'));
    if (iso) {
      const ts = new Date(iso).getTime();
      if (acc[symbol].firstTs === null || ts < acc[symbol].firstTs) acc[symbol].firstTs = ts;
      if (acc[symbol].lastTs  === null || ts > acc[symbol].lastTs)  acc[symbol].lastTs  = ts;
    }
  }

  // Build final assets array
  const assets = Object.entries(acc)
    .map(([symbol, data]) => ({
      symbol,
      category:       classifyAsset(symbol),
      netQuantity:    Math.round(data.netQuantity * 1e10) / 1e10,  // floating-point guard (10 dp)
      firstSeenAt:    data.firstTs !== null ? new Date(data.firstTs).toISOString() : null,
      lastSeenAt:     data.lastTs  !== null ? new Date(data.lastTs).toISOString()  : null,
      operationCount: data.operationCount,
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));  // alphabetical for stability

  return { assets };
}
