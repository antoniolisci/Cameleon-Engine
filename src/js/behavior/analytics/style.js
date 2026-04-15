// Détection du style de trading à partir des trades et métriques.
// Entrées : trades[] (canoniques), metrics{} (computeMetrics)
// Sortie  : { key, label, description }

function detectStyle(trades, metrics) {
  if (!trades || trades.length < 5 || !metrics) {
    return { key: 'unknown', label: 'Inconnu', description: 'Données insuffisantes pour déterminer le style.' };
  }

  const paceDelay    = metrics.avgTimeBetweenSameSymbol ?? metrics.avgTimeBetween;
  const tradesPerDay = metrics.spanDays > 0 ? metrics.totalTrades / metrics.spanDays : metrics.totalTrades;
  const buyRatio     = metrics.totalTrades > 0 ? metrics.buyCount / metrics.totalTrades : 0;

  const symbolCounts = {};
  trades.forEach(t => { symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1; });
  const maxSymbolCount      = Math.max(...Object.values(symbolCounts));
  const dominantSymbolRatio = maxSymbolCount / metrics.totalTrades;

  if (paceDelay !== null && paceDelay < 15 && tradesPerDay > 8) {
    return { key: 'scalping', label: 'Scalping', description: 'Rythme rapide et forte densité d\'activité journalière.' };
  }

  if (buyRatio > 0.75 && metrics.avgTimeBetween !== null && metrics.avgTimeBetween > 60) {
    return { key: 'dca', label: 'DCA / Accumulation', description: 'Achats récurrents et espacés, ventes rares.' };
  }

  if (tradesPerDay < 1 && metrics.avgTimeBetween !== null && metrics.avgTimeBetween > 240) {
    return { key: 'swing', label: 'Swing trading', description: 'Peu de trades, activité très espacée sur la période.' };
  }

  if (
    dominantSymbolRatio >= 0.5 &&
    buyRatio >= 0.35 && buyRatio <= 0.65 &&
    metrics.totalTrades >= 20 &&
    (metrics.avgTimeBetween === null || metrics.avgTimeBetween > 30)
  ) {
    return { key: 'range_orderbook', label: 'Range / Carnet d\'ordres', description: 'Activité concentrée sur un symbole, achats et ventes équilibrés.' };
  }

  if (metrics.totalTrades >= 15) {
    return { key: 'mixed', label: 'Mixte', description: 'Aucun style dominant clairement identifiable sur cet historique.' };
  }

  return { key: 'unknown', label: 'Inconnu', description: 'Données insuffisantes pour déterminer le style de trading.' };
}

// ── Détection de style par fenêtre (allégée) ──────────────────────────────────
// Calcule un style approximatif sur un sous-ensemble de trades.
// Pas d'appel à computeMetrics — les 3 signaux clés sont calculés inline.

function detectWindowStyle(windowTrades) {
  const total    = windowTrades.length;
  const buyCount = windowTrades.filter(t => t.side === 'BUY').length;
  const buyRatio = buyCount / total;

  const symbolCounts = {};
  windowTrades.forEach(t => { symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1; });
  const maxCount      = Math.max(...Object.values(symbolCounts));
  const dominantRatio = maxCount / total;

  const sorted  = [...windowTrades].sort((a, b) => a.timestamp - b.timestamp);
  const spanMs  = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
  const paceMin = sorted.length > 1 ? Math.round(spanMs / (sorted.length - 1) / 60000) : null;

  if (paceMin !== null && paceMin < 15)                           return 'scalping';
  if (buyRatio > 0.75)                                            return 'dca';
  if (dominantRatio >= 0.5 && buyRatio >= 0.35 && buyRatio <= 0.65) return 'range_orderbook';
  return 'mixed';
}

// ── Détection des transitions de style ────────────────────────────────────────
// Découpe les trades en fenêtres glissantes (15 trades, pas de 5),
// détecte le style local de chaque fenêtre et compte les changements.
//
// Sortie : { globalStyle, localStyles, transitionsCount, dominantShift, isStable }

const WINDOW_SIZE = 15;
const WINDOW_STEP = 5;

// Ordre d'agressivité relatif pour qualifier le dominantShift
const AGGRESSION = { scalping: 3, range_orderbook: 2, swing: 1, dca: 1, mixed: 0, unknown: 0 };

function detectStyleTransitions(trades, globalStyleKey) {
  const fallback = { globalStyle: globalStyleKey, localStyles: [], transitionsCount: 0, dominantShift: null, isStable: true };
  if (!trades || trades.length < WINDOW_SIZE) return fallback;

  const sorted     = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const localStyles = [];

  for (let i = 0; i + WINDOW_SIZE <= sorted.length; i += WINDOW_STEP) {
    localStyles.push(detectWindowStyle(sorted.slice(i, i + WINDOW_SIZE)));
  }

  // Transitions : changements de style entre fenêtres consécutives
  let transitionsCount = 0;
  for (let i = 1; i < localStyles.length; i++) {
    if (localStyles[i] !== localStyles[i - 1]) transitionsCount++;
  }

  // Style déviant le plus fréquent (hors style global)
  const freq = {};
  localStyles.forEach(s => { if (s !== globalStyleKey) freq[s] = (freq[s] || 0) + 1; });
  const dominantShift = Object.keys(freq).length > 0
    ? Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return {
    globalStyle:      globalStyleKey,
    localStyles,
    transitionsCount,
    dominantShift,
    isStable:         transitionsCount === 0
  };
}

// Retourne true si dominantShift est plus agressif que le style global
function isShiftMoreAggressive(dominantShift, globalStyleKey) {
  return (AGGRESSION[dominantShift] || 0) > (AGGRESSION[globalStyleKey] || 0);
}

export { detectStyle, detectStyleTransitions, isShiftMoreAggressive };
