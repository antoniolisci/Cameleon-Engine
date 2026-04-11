// Canonical trade format for the behavior module.
//
// Required fields:
//   timestamp     — UTC ms since epoch
//   symbol        — e.g. "BTCUSDT"
//   side          — "BUY" | "SELL"
//   price         — float
//   quantity      — float (base asset)
//   quote_quantity — float (quote asset, e.g. USDT)
//   fee           — float
//   session_id    — string, identifies the import batch
//   tags          — string[], patterns detected on this trade

export { mapBinanceSpotRow } from './mappers/binance_spot.js';
