// Synthèse comportementale : score, profil, risque dominant, interprétation.
//
// Entrées : patterns[] (issu de detectPatterns) + metrics{} (issu de computeMetrics)
// Sortie  : { score, profile, dominantRisk, interpretation }
//
// Principe :
//   - score initial = 100
//   - pénalités graduées selon l'intensité réelle (count ou cv)
//   - risque dominant = weight × intensity, le plus fort l'emporte
//   - profil déduit du score final

// ── Poids de base par pattern ─────────────────────────────────────────────────
// Reflètent la dangerosité intrinsèque du comportement, indépendamment de l'intensité.

const PATTERN_WEIGHTS = {
  loss_chasing:       25,
  revenge_trading:    20,
  size_inconsistency: 20,
  overtrading:        15,
  rapid_reentry:      15
};

// ── Paliers de pénalité ────────────────────────────────────────────────────────
// Une seule occurrence = signal. Plusieurs = habitude. La pénalité croît en conséquence.

function getPenalty(pattern) {
  const n  = pattern.count || 1;
  const cv = pattern.cv    || 0;

  switch (pattern.type) {

    case 'overtrading':
      // 1–2 fenêtres : activation ponctuelle
      // 3–5 : tendance réelle
      // >5  : comportement ancré
      if (n > 5)  return 20;
      if (n >= 3) return 15;
      return 10;

    case 'revenge_trading':
      // 1–2 : signal émotionnel
      // 3–5 : pattern installé
      // >5  : comportement systématique
      if (n > 5)  return 25;
      if (n >= 3) return 20;
      return 12;

    case 'rapid_reentry':
      // 1–2 : impulsivité occasionnelle
      // ≥3  : réflexe établi
      if (n >= 3) return 15;
      return 10;

    case 'size_inconsistency':
      // Basé sur le coefficient de variation (cv), pas sur un count
      // cv 0.5–0.79 : sizing instable mais discret
      // cv 0.8–1.19 : forte variabilité
      // cv ≥ 1.2    : absence totale de règle
      if (cv >= 1.2) return 25;
      if (cv >= 0.8) return 20;
      return 10;

    case 'loss_chasing':
      // 1 séquence : signal d'alerte
      // ≥2          : comportement récurrent à haut risque
      if (n >= 2) return 25;
      return 15;

    default: return 0;
  }
}

// ── Profils ───────────────────────────────────────────────────────────────────
// Ordonnés du plus élevé au plus bas — find() s'arrête au premier match.

const PROFILES = [
  { key: 'disciplined', label: 'Discipliné', min: 80, color: 'ok'     },
  { key: 'reactive',    label: 'Réactif',    min: 60, color: 'gold'   },
  { key: 'impulsive',   label: 'Impulsif',   min: 40, color: 'warn'   },
  { key: 'aggressive',  label: 'Agressif',   min: 0,  color: 'danger' }
];

// ── Fonction principale ────────────────────────────────────────────────────────

function computeScore(patterns, metrics) {
  if (!metrics) return null;
  const pats = patterns || [];

  // 1. Score avec pénalités graduées
  let score = 100;
  pats.forEach(p => { score -= getPenalty(p); });
  if (metrics.oversizedTradesCount >= 3)                               score -= 10;
  if (metrics.avgTimeBetween !== null && metrics.avgTimeBetween < 15)  score -= 10;
  score = Math.max(0, Math.min(100, score));

  // 2. Profil
  const profile = PROFILES.find(p => score >= p.min) || PROFILES[PROFILES.length - 1];

  // 3. Risque dominant (pondéré par intensité)
  const dominantRisk = computeDominantRisk(pats, metrics);

  // 4. Interprétation
  const types = new Set(pats.map(p => p.type));
  const interpretation = buildInterpretation(profile.key, dominantRisk, types);

  return { score, profile, dominantRisk, interpretation };
}

// ── Risque dominant ────────────────────────────────────────────────────────────
// score_risque = weight × intensity
// → le signal le plus lourd l'emporte, quelle que soit la priorité arbitraire

function computeDominantRisk(pats, metrics) {
  const candidates = [];

  pats.forEach(p => {
    const weight    = PATTERN_WEIGHTS[p.type] || 0;
    // size_inconsistency : cv comme intensité (ex: cv=0.9 → weight × 0.9)
    // autres patterns    : count comme intensité (ex: count=3 → weight × 3)
    const intensity = p.type === 'size_inconsistency'
      ? (p.cv    || 0.5)
      : (p.count || 1);
    candidates.push({ label: p.label, score: weight * intensity });
  });

  // Signaux métriques (intensité = 1, ils sont binaires)
  if (metrics.oversizedTradesCount >= 3) {
    candidates.push({ label: 'Surexposition ponctuelle', score: 10 });
  }
  if (metrics.avgTimeBetween !== null && metrics.avgTimeBetween < 15) {
    candidates.push({ label: 'Rythme trop rapide', score: 10 });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].label;
}

// ── Interprétation ────────────────────────────────────────────────────────────
// Règles explicites, pas de concaténation dynamique opaque.
// Chaque cas est lisible directement dans le code.

function buildInterpretation(profileKey, dominantRisk, types) {
  const lines = [];

  // Phrase d'ouverture selon le profil
  const opening = {
    disciplined: 'Ton comportement est globalement structuré sur cette période.',
    reactive:    'Ton comportement montre quelques signaux d\'impulsivité.',
    impulsive:   'Plusieurs comportements problématiques ont été détectés.',
    aggressive:  'Ton comportement expose le capital à un risque inutile.'
  };
  lines.push(opening[profileKey] || opening.reactive);

  // Risque dominant nommé explicitement
  if (dominantRisk) {
    lines.push(`Risque principal identifié : ${dominantRisk}.`);
  }

  // Conseil ciblé sur le pattern le plus grave présent
  if (types.has('loss_chasing')) {
    lines.push('Augmenter la taille de ses positions sur une courte séquence de trades est un comportement à fort risque.');
  } else if (types.has('revenge_trading')) {
    lines.push('Enchaîner rapidement un achat après une vente, avec une taille supérieure à la moyenne, est un signal de précipitation.');
  } else if (types.has('size_inconsistency')) {
    lines.push('Des tailles de position cohérentes sont la base d\'un money management efficace.');
  } else if (types.has('overtrading')) {
    lines.push('Un trade bien sélectionné vaut plus que cinq trades pris par réflexe.');
  } else if (types.has('rapid_reentry')) {
    lines.push('Chaque sortie mérite un temps d\'observation avant toute nouvelle entrée.');
  }

  // Fermeture pour les profils agressifs uniquement
  if (profileKey === 'aggressive') {
    lines.push('Une pause active et une révision des règles d\'engagement sont recommandées.');
  }

  return lines.slice(0, 4);
}

export { computeScore };
