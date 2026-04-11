// Computes quantitative metrics from a list of canonical trades.
//
// Note : winRate, maxWinStreak, maxLossStreak ne sont PAS calculés ici.
// Un CSV Binance Spot ne contient pas de P&L par trade — les calculer
// demanderait de matcher BUY/SELL par paire, ce qui introduirait une logique
// fragile non justifiée en V2.

function computeMetrics(trades) {
  if (!trades || trades.length === 0) return null;

  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const total  = sorted.length;

  // ── Volume par côté ──────────────────────────────────────────────────────────
  const buys  = sorted.filter(t => t.side === 'BUY');
  const sells = sorted.filter(t => t.side === 'SELL');

  const buyCount  = buys.length;
  const sellCount = sells.length;

  const avgBuySize  = buyCount  > 0 ? avg(buys.map(t  => t.quote_quantity)) : 0;
  const avgSellSize = sellCount > 0 ? avg(sells.map(t => t.quote_quantity)) : 0;

  // ── Taille globale moyenne ───────────────────────────────────────────────────
  const avgSize = avg(sorted.map(t => t.quote_quantity || 0));

  // ── Trades surdimensionnés (> 2× la moyenne) ─────────────────────────────────
  const OVERSIZE_FACTOR = 2;
  const oversizedTradesCount = sorted.filter(
    t => t.quote_quantity > avgSize * OVERSIZE_FACTOR
  ).length;

  // ── Distribution horaire UTC (0–23) ──────────────────────────────────────────
  const hourDist = new Array(24).fill(0);
  sorted.forEach(t => {
    hourDist[new Date(t.timestamp).getUTCHours()]++;
  });

  // Nombre d'heures distinctes avec au moins 1 trade
  const activeHours = hourDist.filter(n => n > 0).length;

  // ── Délai moyen entre trades consécutifs (toutes paires) ─────────────────────
  let avgTimeBetween = null;
  if (sorted.length > 1) {
    avgTimeBetween = Math.round(
      sumGaps(sorted) / (sorted.length - 1) / 60000
    );
  }

  // ── Délai moyen du trade suivant après un BUY ─────────────────────────────────
  // "Combien de temps s'écoule en moyenne avant que tu rejoues après un achat ?"
  const avgDelayAfterBuy  = computeAvgDelayAfter(sorted, 'BUY');
  const avgDelayAfterSell = computeAvgDelayAfter(sorted, 'SELL');

  // ── Période ──────────────────────────────────────────────────────────────────
  const firstTs  = sorted[0].timestamp;
  const lastTs   = sorted[sorted.length - 1].timestamp;
  const spanDays = Math.round(((lastTs - firstTs) / 86400000) * 10) / 10;

  return {
    // existants
    totalTrades:    total,
    hourDist,
    avgSize:        round2(avgSize),
    avgTimeBetween,
    spanDays,
    firstTs,
    lastTs,
    // nouveaux
    buyCount,
    sellCount,
    avgBuySize:            round2(avgBuySize),
    avgSellSize:           round2(avgSellSize),
    avgDelayAfterBuy,
    avgDelayAfterSell,
    oversizedTradesCount,
    activeHours
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function sumGaps(sorted) {
  let total = 0;
  for (let i = 1; i < sorted.length; i++) {
    total += sorted[i].timestamp - sorted[i - 1].timestamp;
  }
  return total;
}

// Temps moyen (minutes) entre un trade de `side` et le trade suivant.
function computeAvgDelayAfter(sorted, side) {
  const gaps = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].side === side) {
      gaps.push(sorted[i + 1].timestamp - sorted[i].timestamp);
    }
  }
  if (!gaps.length) return null;
  return Math.round(avg(gaps) / 60000);
}

export { computeMetrics };
