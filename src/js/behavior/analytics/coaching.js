// Coaching comportemental automatique — Niveau 3.
//
// Entrées : patterns[] (detectPatterns), metrics{} (computeMetrics), scoreData{} (computeScore)
// Sortie  : { priority: string, tips: string[] }
//
// Logique :
//   1. Résolution du type dominant (label scoreData → mapping → fallback poids × intensité)
//   2. Génération de conseils : dominant en premier, puis autres patterns par poids décroissant
//   3. Déduplication : revenge_trading et rapid_reentry produisent le même type de conseil
//      (délai post-sortie) — seul le premier dans l'ordre de priorité est conservé
//   4. Conseils complémentaires métriques si des slots restent disponibles
//   5. Plafond à 5 conseils maximum

// ── Label → type mapping ───────────────────────────────────────────────────────
// Miroir exact des labels produits par patterns.js et scoring.js.
// Permet de retrouver le type interne à partir du dominantRisk string de scoreData.

const LABEL_TO_TYPE = {
  'Overtrading':              'overtrading',
  'Revenge trading':          'revenge_trading',
  'Réentrée rapide':          'rapid_reentry',
  'Tailles incohérentes':     'size_inconsistency',
  'Escalade de position':     'loss_chasing',
  'Surexposition ponctuelle': 'metric_oversize',
  'Rythme trop rapide':       'metric_pace',
};

// ── Labels de priorité (affichage utilisateur) ─────────────────────────────────

const TYPE_TO_PRIORITY = {
  overtrading:        'Suractivité',
  revenge_trading:    'Réentrée impulsive',
  rapid_reentry:      'Réentrée impulsive',
  size_inconsistency: 'Sizing instable',
  loss_chasing:       'Escalade de position',
  metric_oversize:    'Sizing instable',
  metric_pace:        'Suractivité',
};

// ── Poids par pattern (identiques à scoring.js pour un classement cohérent) ───

const PATTERN_WEIGHTS = {
  loss_chasing:       25,
  revenge_trading:    20,
  size_inconsistency: 20,
  overtrading:        15,
  rapid_reentry:      15,
};

// ── Fonction principale ────────────────────────────────────────────────────────

function computeCoaching(patterns, metrics, scoreData) {
  if (!metrics) return { priority: 'Aucun risque dominant clair', tips: [] };

  const pats = patterns || [];

  // 1. Type dominant
  const dominantType = resolveDominantType(scoreData?.dominantRisk, pats);

  // 2. Label de priorité
  const priority = dominantType
    ? (TYPE_TO_PRIORITY[dominantType] || 'Aucun risque dominant clair')
    : 'Aucun risque dominant clair';

  // 3. Ordre de traitement : dominant en tête, puis par poids × intensité décroissant
  const orderedTypes = buildOrderedTypes(dominantType, pats);

  // 4. Génération des conseils
  // Pré-résoudre le type de délai à conserver si les deux sont présents.
  const keepDelayType = resolveDelayType(pats);
  const tips          = [];

  for (const type of orderedTypes) {
    if (tips.length >= 5) break;

    // Dédup explicite : si revenge_trading et rapid_reentry sont tous les deux détectés,
    // conserver uniquement le plus sévère (décidé par resolveDelayType).
    if ((type === 'revenge_trading' || type === 'rapid_reentry') && type !== keepDelayType) continue;

    const pat = pats.find(p => p.type === type);
    const tip = getPatternTip(type, metrics, pat);
    if (!tip) continue;

    tips.push(tip);
  }

  // 5. Conseils complémentaires basés sur les métriques
  // Cadence globale — seulement si aucun conseil de délai pattern n'a déjà été ajouté
  // (keepDelayType !== null = au moins un type délai était présent et son conseil a été émis)
  if (tips.length < 5 && keepDelayType === null && metrics.avgTimeBetween !== null && metrics.avgTimeBetween < 15) {
    tips.push('Ralentis ton rythme : impose un délai minimum de 15 minutes entre deux trades.');
  }

  // Trades surdimensionnés
  if (tips.length < 5 && metrics.oversizedTradesCount >= 3) {
    tips.push('Évite les positions supérieures à 2x ta taille moyenne.');
  }

  // Concentration horaire excessive
  if (tips.length < 5 && metrics.activeHours !== undefined && metrics.activeHours <= 5) {
    tips.push('Évite de concentrer toute ton activité sur une fenêtre trop courte.');
  }

  return { priority, tips };
}

// ── Résolution du type dominant ────────────────────────────────────────────────
// Étape 1 : mapping label → type (via LABEL_TO_TYPE), en vérifiant que le pattern
//           correspondant est effectivement présent dans la liste détectée.
// Étape 2 : fallback — pattern avec le score poids × intensité le plus élevé.

function resolveDominantType(dominantRisk, pats) {
  // Étape 1 : mapping
  if (dominantRisk) {
    const mapped = LABEL_TO_TYPE[dominantRisk];
    if (mapped) {
      const isPatternType = Object.prototype.hasOwnProperty.call(PATTERN_WEIGHTS, mapped);

      // Types métriques (metric_oversize, metric_pace) : acceptés sans vérification dans pats
      if (!isPatternType) return mapped;

      // Types pattern : vérifier qu'il est bien présent dans les patterns détectés
      if (pats.some(p => p.type === mapped)) return mapped;
    }
  }

  // Étape 2 : fallback — poids × intensité maximal
  if (!pats.length) return null;

  let best      = null;
  let bestScore = -1;

  for (const p of pats) {
    const weight    = PATTERN_WEIGHTS[p.type] || 0;
    const intensity = p.type === 'size_inconsistency' ? (p.cv || 0.5) : (p.count || 1);
    const s         = weight * intensity;
    if (s > bestScore) { bestScore = s; best = p.type; }
  }

  return best;
}

// ── Ordre des types à traiter ──────────────────────────────────────────────────
// Le type dominant passe en tête.
// Les autres patterns sont triés par poids × intensité décroissant.

function buildOrderedTypes(dominantType, pats) {
  const PATTERN_TYPES = new Set(Object.keys(PATTERN_WEIGHTS));

  const scored = pats
    .map(p => {
      const weight    = PATTERN_WEIGHTS[p.type] || 0;
      const intensity = p.type === 'size_inconsistency' ? (p.cv || 0.5) : (p.count || 1);
      return { type: p.type, score: weight * intensity };
    })
    .sort((a, b) => b.score - a.score);

  const ordered = [];

  // Dominant en tête (uniquement pour les types patterns, pas métriques)
  if (dominantType && PATTERN_TYPES.has(dominantType)) {
    ordered.push(dominantType);
  }

  // Reste des patterns dans l'ordre pondéré
  for (const { type } of scored) {
    if (!ordered.includes(type)) ordered.push(type);
  }

  return ordered;
}

// ── Texte du conseil par type ──────────────────────────────────────────────────
// Le pattern `pat` est passé pour permettre l'ajustement selon l'intensité :
//   - overtrading       : count >= 5 → ton renforcé
//   - size_inconsistency: cv >= 1    → ton renforcé

function getPatternTip(type, metrics, pat) {
  switch (type) {
    case 'overtrading':
      return (pat?.count ?? 0) >= 5
        ? 'Réduis fortement ton nombre de trades : pas plus de 3 par heure.'
        : 'Limite ton nombre de trades à 3 maximum par heure.';
    case 'revenge_trading':
      return 'Après une vente, impose un délai minimum de 20 minutes avant toute nouvelle entrée.';
    case 'rapid_reentry':
      return 'Après une sortie, attends au moins 30 minutes avant de reprendre position.';
    case 'size_inconsistency':
      return (pat?.cv ?? 0) >= 1
        ? `Stabilise strictement ta taille autour de ta moyenne (${metrics.avgSize}$ ±20%).`
        : `Fixe une taille de position proche de ta moyenne (${metrics.avgSize}$ ±20%).`;
    case 'loss_chasing':
      return 'Interdis toute augmentation de taille sur 3 trades consécutifs.';
    default:
      return null;
  }
}

// ── Résolution du type de délai dominant ──────────────────────────────────────
// Si revenge_trading et rapid_reentry sont tous deux détectés,
// conserver uniquement celui avec le score poids × count le plus élevé.
// revenge_trading : poids 20 — rapid_reentry : poids 15 (cohérent avec scoring.js)

function resolveDelayType(pats) {
  const revenge = pats.find(p => p.type === 'revenge_trading');
  const reentry = pats.find(p => p.type === 'rapid_reentry');

  if (!revenge && !reentry) return null;
  if (!revenge)             return 'rapid_reentry';
  if (!reentry)             return 'revenge_trading';

  // Les deux sont présents : comparer poids × intensité
  const scoreRevenge = 20 * (revenge.count || 1);
  const scoreReentry = 15 * (reentry.count  || 1);

  return scoreRevenge >= scoreReentry ? 'revenge_trading' : 'rapid_reentry';
}

export { computeCoaching };
