// Analyse comportementale spécialisée pour le Format B — Order History.
//
// Métriques calculées à partir des ordres FILLED uniquement :
//
//   fillRate          : taux d'exécution moyen (0–1) — si disponible dans les données
//   gridSpacing       : écart relatif moyen entre prix d'ordres consécutifs (même symbole/côté)
//   directionalRatio  : fraction des ordres dans le sens majoritaire (BUY ou SELL)
//   avgHoldMin        : durée moyenne entre BUY et SELL (en minutes, approx.)
//   cancelProfile     : 'none' | 'light' | 'moderate' | 'heavy' — évaluation des annulations
//                       (inféré uniquement si le total d'ordres bruts est disponible via rawCount)
//
// Profil comportemental déduit :
//   'grid'            : espacement régulier + directionalRatio > 0.6
//   'dca'             : directional dominant (≥0.8) + espacement régulier
//   'opportuniste'    : pas d'espacement régulier, alternance BUY/SELL rapide
//   'mixte'           : défaut

// ── analyzeOrders ─────────────────────────────────────────────────────────────
// trades   : tableau de trades canoniques issus de mapOrderRows() (FILLED seulement)
// rawCount : nombre total de lignes brutes (FILLED + NON_FILLED) — optionnel, pour cancel profile
// Retourne un objet { metrics, profile, summary }

function analyzeOrders(trades, rawCount = null) {
  if (!trades || trades.length === 0) {
    return { metrics: null, profile: 'inconnu', summary: 'Aucun ordre exécuté trouvé.' };
  }

  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  // ── Fill rate ─────────────────────────────────────────────────────────────
  const fillRates = sorted.map(t => t.fillRate).filter(r => r != null && r > 0);
  const avgFillRate = fillRates.length > 0
    ? fillRates.reduce((s, r) => s + r, 0) / fillRates.length
    : null;

  // ── Espacement de grille (grid spacing) ───────────────────────────────────
  // Pour chaque symbole + côté, calcule l'écart relatif entre prix consécutifs.
  const gridSpacing = computeGridSpacing(sorted);

  // ── Ratio directionnel ────────────────────────────────────────────────────
  const buys  = sorted.filter(t => t.side === 'BUY').length;
  const sells = sorted.filter(t => t.side === 'SELL').length;
  const total = sorted.length;
  const directionalRatio = total > 0 ? Math.max(buys, sells) / total : 0.5;
  const majorSide = buys >= sells ? 'BUY' : 'SELL';

  // ── Durée moyenne de détention (approx. BUY→SELL sur même symbole) ────────
  const avgHoldMin = computeAvgHold(sorted);

  // ── Profil d'annulation ───────────────────────────────────────────────────
  let cancelProfile = 'none';
  if (rawCount !== null && rawCount > 0) {
    const cancelRate = 1 - (sorted.length / rawCount);
    if      (cancelRate >= 0.5) cancelProfile = 'heavy';
    else if (cancelRate >= 0.3) cancelProfile = 'moderate';
    else if (cancelRate >= 0.1) cancelProfile = 'light';
  }

  // ── Déduction du profil comportemental ───────────────────────────────────
  const isRegularGrid  = gridSpacing !== null && gridSpacing.cv < 0.3 && gridSpacing.count >= 4;
  const isDominantDir  = directionalRatio >= 0.75;
  const isAlternating  = !isDominantDir && avgHoldMin !== null && avgHoldMin < 60;

  let profile;
  if (isRegularGrid && directionalRatio >= 0.55) {
    profile = 'grid';
  } else if (isDominantDir && isRegularGrid) {
    profile = 'dca';
  } else if (isAlternating) {
    profile = 'opportuniste';
  } else {
    profile = 'mixte';
  }

  // ── Résumé lisible ─────────────────────────────────────────────────────────
  const summary = buildSummary({ profile, sorted, avgFillRate, gridSpacing, directionalRatio, majorSide, avgHoldMin, cancelProfile });

  const metrics = {
    tradeCount:       sorted.length,
    fillRate:         avgFillRate,
    gridSpacing:      gridSpacing ? gridSpacing.mean : null,
    gridSpacingCv:    gridSpacing ? gridSpacing.cv   : null,
    directionalRatio,
    majorSide,
    avgHoldMin,
    cancelProfile
  };

  return { metrics, profile, summary };
}

// ── computeGridSpacing ────────────────────────────────────────────────────────
// Calcule l'écart relatif moyen entre prix d'ordres consécutifs.
// Regroupe par (symbol, side) pour isoler les séquences homogènes.
// Retourne { mean, cv, count } ou null si données insuffisantes.

function computeGridSpacing(sorted) {
  const groups = new Map();
  for (const t of sorted) {
    const key = `${t.symbol}|${t.side}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t.price);
  }

  const gaps = [];
  for (const prices of groups.values()) {
    if (prices.length < 2) continue;
    for (let i = 1; i < prices.length; i++) {
      const base = prices[i - 1];
      if (base > 0) gaps.push(Math.abs(prices[i] - base) / base);
    }
  }

  if (gaps.length < 3) return null;

  const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const variance = gaps.reduce((s, g) => s + (g - mean) ** 2, 0) / gaps.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 999;

  return { mean, cv, count: gaps.length };
}

// ── computeAvgHold ────────────────────────────────────────────────────────────
// Apparie chaque BUY avec le SELL suivant (même symbole) pour estimer la durée.
// Retourne la durée moyenne en minutes, ou null si insuffisant.

function computeAvgHold(sorted) {
  const holds = [];
  const lastBuy = new Map();   // symbol → timestamp du dernier BUY non apparié

  for (const t of sorted) {
    if (t.side === 'BUY') {
      lastBuy.set(t.symbol, t.timestamp);
    } else if (t.side === 'SELL' && lastBuy.has(t.symbol)) {
      holds.push((t.timestamp - lastBuy.get(t.symbol)) / 60000);
      lastBuy.delete(t.symbol);
    }
  }

  if (holds.length < 2) return null;
  return holds.reduce((s, h) => s + h, 0) / holds.length;
}

// ── buildSummary ──────────────────────────────────────────────────────────────

function buildSummary({ profile, sorted, avgFillRate, gridSpacing, directionalRatio, majorSide, avgHoldMin, cancelProfile }) {
  const lines = [];

  lines.push(`${sorted.length} ordre${sorted.length > 1 ? 's' : ''} exécuté${sorted.length > 1 ? 's' : ''} analysé${sorted.length > 1 ? 's' : ''}.`);

  if (profile === 'grid') {
    lines.push('Stratégie grille détectée : ordres régulièrement espacés.');
  } else if (profile === 'dca') {
    lines.push(`DCA détecté : accumulation ${majorSide === 'BUY' ? 'longue' : 'courte'} progressive.`);
  } else if (profile === 'opportuniste') {
    lines.push('Profil opportuniste : alternance rapide BUY/SELL.');
  } else {
    lines.push('Profil mixte : pas de stratégie dominante identifiée.');
  }

  if (avgFillRate !== null) {
    lines.push(`Taux d'exécution moyen : ${Math.round(avgFillRate * 100)} %.`);
  }

  if (avgHoldMin !== null) {
    const h = avgHoldMin < 60
      ? `${Math.round(avgHoldMin)} min`
      : `${(avgHoldMin / 60).toFixed(1)} h`;
    lines.push(`Durée moyenne de détention : ${h}.`);
  }

  if (cancelProfile === 'heavy') {
    lines.push('Taux d\'annulation élevé (> 50 %) : discipline d\'exécution perfectible.');
  } else if (cancelProfile === 'moderate') {
    lines.push('Taux d\'annulation modéré (30–50 %).');
  }

  return lines.join(' ');
}

export { analyzeOrders };
