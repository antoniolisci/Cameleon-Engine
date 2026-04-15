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

  const avgBuySize  = buyCount  > 0 ? avg(buys.map(t  => tradeSize(t))) : 0;
  const avgSellSize = sellCount > 0 ? avg(sells.map(t => tradeSize(t))) : 0;

  // ── Taille globale moyenne ───────────────────────────────────────────────────
  // tradeSize() : utilise quote_quantity si disponible, sinon price * quantity.
  // Évite que les trades avec Amount manquant (quote_quantity = 0) faussent la moyenne.
  const avgSize = avg(sorted.map(t => tradeSize(t)));

  // ── Trades surdimensionnés (> 2× la moyenne) ─────────────────────────────────
  const OVERSIZE_FACTOR = 2;
  const oversizedTradesCount = sorted.filter(
    t => tradeSize(t) > avgSize * OVERSIZE_FACTOR
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

  // ── Délai moyen par symbole ───────────────────────────────────────────────────
  // v3 : le délai global (avgTimeBetween) ne reflète pas le rythme réel du trader
  // quand il opère sur plusieurs paires en parallèle. On calcule le délai par symbole
  // et on retourne le minimum (le symbole où le trader va le plus vite).
  const avgTimeBetweenSameSymbol = computeAvgTimeBetweenSameSymbol(sorted);

  // ── CV de taille par symbole ──────────────────────────────────────────────────
  // v3 : un trader qui met 200$ sur BTC et 50$ sur un altcoin a un CV global élevé
  // par design (allocation différente par actif). On calcule le CV par symbole
  // et on retourne le plus élevé parmi ceux ayant assez de trades.
  const maxSizeCVBySymbol = computeMaxSizeCVBySymbol(sorted, SIZE_MIN_TRADES_PER_SYMBOL);

  return {
    // existants
    totalTrades:    total,
    hourDist,
    avgSize:        round2(avgSize),
    avgTimeBetween,
    spanDays,
    firstTs,
    lastTs,
    // nouveaux (v2)
    buyCount,
    sellCount,
    avgBuySize:            round2(avgBuySize),
    avgSellSize:           round2(avgSellSize),
    avgDelayAfterBuy,
    avgDelayAfterSell,
    oversizedTradesCount,
    activeHours,
    // nouveaux (v3) — métriques par symbole
    avgTimeBetweenSameSymbol,
    maxSizeCVBySymbol
  };
}

// ── Constantes ────────────────────────────────────────────────────────────────

// Nombre minimum de trades sur un symbole pour que le CV de ce symbole soit significatif.
const SIZE_MIN_TRADES_PER_SYMBOL = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────

// Taille réelle d'un trade en valeur monétaire (quote asset, ex : USDT).
// Utilise systématiquement price × quantity — cohérent avec l'affichage du journal.
// quote_quantity n'est pas utilisé : sur certains exports, il contient la quantité
// base asset au lieu de la valeur USDT, ce qui fausse les moyennes.
function tradeSize(t) {
  return (t.price || 0) * (t.quantity || 0);
}

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

// v3 : délai moyen entre trades consécutifs sur le MÊME symbole.
// Retourne le minimum parmi tous les symboles (le rythme le plus rapide du trader).
// null si aucun symbole n'a au moins 2 trades.
function computeAvgTimeBetweenSameSymbol(sorted) {
  const bySymbol = {};
  sorted.forEach(t => {
    if (!bySymbol[t.symbol]) bySymbol[t.symbol] = [];
    bySymbol[t.symbol].push(t);
  });

  let minDelay = null;
  for (const trades of Object.values(bySymbol)) {
    if (trades.length < 2) continue;
    const delay = Math.round(sumGaps(trades) / (trades.length - 1) / 60000);
    if (minDelay === null || delay < minDelay) minDelay = delay;
  }
  return minDelay;
}

// v3 : coefficient de variation de taille calculé par symbole.
// Retourne le CV le plus élevé parmi les symboles ayant au moins minTrades trades.
// null si aucun symbole n'atteint le seuil minimum.
function computeMaxSizeCVBySymbol(sorted, minTrades) {
  const bySymbol = {};
  sorted.forEach(t => {
    if (!bySymbol[t.symbol]) bySymbol[t.symbol] = [];
    // tradeSize() pour cohérence avec avgSize et les autres métriques de taille
    bySymbol[t.symbol].push(tradeSize(t));
  });

  let maxCV = null;
  for (const sizes of Object.values(bySymbol)) {
    if (sizes.length < minTrades) continue;
    const mean = avg(sizes);
    if (mean === 0) continue;
    const variance = sizes.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / sizes.length;
    const cv = Math.sqrt(variance) / mean;
    if (maxCV === null || cv > maxCV) maxCV = Math.round(cv * 100) / 100;
  }
  return maxCV;
}

export { computeMetrics, tradeSize };
