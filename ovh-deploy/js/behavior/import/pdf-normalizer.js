// PDF_IMPORT_V1 — Phase 3 : normalisation vers les structures exploitables
// Référence architecturale : docs/architecture/pdf-import-v1-architecture.md
//
// PDF-ARCH-04 — Format date Binance PDF
//   Entrée  : "YY-MM-DD HH:MM:SS" (ex. "26-05-24 07:01:57")
//   Règle   : préfixer "20" → ISO 8601 avec offset +02:00 → timestamp UTC ms
//
// PDF-ARCH-05 — status nullable Order History (terrain b3.pdf 2026-06-04)
//   Observation : 1 ligne sur 2476 n'a pas de cellule status (11 col au lieu de 12).
//   Décision    : status est nullable. Aucune ligne rejetée pour ce motif.

// ── Utilitaires de parsing ─────────────────────────────────────────────────

// PDF-ARCH-04 : parse la date Binance PDF → timestamp UTC ms
// Retourne null si la chaîne n'est pas au format attendu.
function _parseDate(raw) {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();
  if (!/^\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) return null;
  // "26-05-24 07:01:57" → "2026-05-24T07:01:57+02:00" → UTC ms
  return new Date('20' + s.replace(' ', 'T') + '+02:00').getTime();
}

// Extrait la valeur numérique d'une cellule avec unité optionnelle.
// "5.6583TAO" → 5.6583 · "1579.23153USDC" → 1579.23153 · "279.1" → 279.1
// parseFloat() natif résout les unités collées (PDF-ARCH-04 §Valeurs numériques).
function _parseNum(raw) {
  if (!raw) return NaN;
  return parseFloat(raw);
}

// ── TRADE HISTORY ──────────────────────────────────────────────────────────
// Colonnes b8.pdf (ordre X croissant) :
//   [0] Durée         → timestamp    (PDF-ARCH-04)
//   [1] Paire         → symbol
//   [2] Côté          → side         (BUY | SELL)
//   [3] Prix          → price
//   [4] Exécuté       → quantity     (valeur avec unité : "5.6583TAO")
//   [5] Montant       → quote_quantity (valeur avec unité : "1579.23153USDC")
//   [6] Frais         → fee          (valeur avec unité : "0.0056583TAO")

function normalizeTradeHistoryRows(rows) {
  const out = [];
  for (const row of rows) {
    out.push({
      timestamp:      _parseDate(row[0]),
      symbol:         (row[1] || '').trim(),
      side:           (row[2] || '').trim().toUpperCase(),
      price:          _parseNum(row[3]),
      quantity:       _parseNum(row[4]),
      quote_quantity: _parseNum(row[5]),
      fee:            _parseNum(row[6]),
    });
  }
  return out;
}

// ── ORDER HISTORY ──────────────────────────────────────────────────────────
// Colonnes b3.pdf (signature X PDF-ARCH-02) :
//   [0]  created_at    → timestamp UTC ms         (PDF-ARCH-04)
//   [1]  order_id      → string
//   [2]  symbol
//   [3]  order_type    → "Limit" | "Market" | …
//   [4]  side          → "BUY" | "SELL"
//   [5]  order_price   → number
//   [6]  order_amount  → number
//   [7]  execution_time → timestamp UTC ms | null  (PDF-ARCH-04, nullable)
//   [8]  executed_qty  → number
//   [9]  average_price → number
//   [10] trading_total → number
//   [11] status        → "FILLED" | "NEW" | "CANCELED" | null  (PDF-ARCH-05)
//
// Cas particuliers documentés :
//   FILLED  : toutes les colonnes renseignées · execution_time = date d'exécution
//   NEW     : ordre ouvert non exécuté · execution_time possible en "--" → null
//   CANCELED: ordre annulé · execution_time possible en "--" → null
//   11 col  : status absent → null (PDF-ARCH-05)

function normalizeOrderHistoryRows(rows) {
  const out = [];
  for (const row of rows) {
    out.push({
      created_at:     _parseDate(row[0]),
      order_id:       (row[1] || '').trim(),
      symbol:         (row[2] || '').trim(),
      order_type:     (row[3] || '').trim(),
      side:           (row[4] || '').trim().toUpperCase(),
      order_price:    _parseNum(row[5]),
      order_amount:   _parseNum(row[6]),
      execution_time: _parseDate(row[7]),   // null pour NEW/CANCELED non exécutés
      executed_qty:   _parseNum(row[8]),
      average_price:  _parseNum(row[9]),
      trading_total:  _parseNum(row[10]),
      status:         row[11] ? row[11].trim() : null,  // PDF-ARCH-05
    });
  }
  return out;
}

// ── API publique ───────────────────────────────────────────────────────────
// normalizePdfRows(rows, family)
//   rows   : tableau de rows brutes issu de extractPdfTableRows()
//   family : 'TRADE_HISTORY' | 'ORDER_HISTORY'
//   Retourne : tableau d'objets normalisés
//   Lance    : Error si family = 'UNKNOWN'

function normalizePdfRows(rows, family) {
  if (family === 'TRADE_HISTORY')  return normalizeTradeHistoryRows(rows);
  if (family === 'ORDER_HISTORY')  return normalizeOrderHistoryRows(rows);
  throw new Error(`normalizePdfRows: famille inconnue "${family}"`);
}

export { normalizePdfRows, normalizeTradeHistoryRows, normalizeOrderHistoryRows };
