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

  // 4. Génération des conseils + plan d'action
  // Pré-résoudre le type de délai à conserver si les deux sont présents.
  const keepDelayType = resolveDelayType(pats);
  const tips          = [];
  const plan          = [];
  let   planPatCount  = 0;   // max 2 patterns contribuent au plan

  for (const type of orderedTypes) {
    if (tips.length >= 5) break;

    // Dédup explicite : si revenge_trading et rapid_reentry sont tous les deux détectés,
    // conserver uniquement le plus sévère (décidé par resolveDelayType).
    if ((type === 'revenge_trading' || type === 'rapid_reentry') && type !== keepDelayType) continue;

    const pat = pats.find(p => p.type === type);
    const tip = getPatternTip(type, metrics, pat);
    if (!tip) continue;

    tips.push(tip);

    // Plan : les 2 premiers patterns actifs contribuent, cap à 5 étapes au total
    if (planPatCount < 2 && plan.length < 5) {
      const steps = getPatternPlan(type, metrics, pat);
      if (steps) {
        steps.forEach(s => { if (plan.length < 5) plan.push(s); });
        planPatCount++;
      }
    }
  }

  // 5. Conseils complémentaires basés sur les métriques (pas de contribution au plan)
  // Cadence globale — seulement si aucun conseil de délai pattern n'a déjà été ajouté
  // (keepDelayType !== null = au moins un type délai était présent et son conseil a été émis)
  // v3 : même logique que scoring.js — délai par symbole en priorité
  const paceDelay = metrics.avgTimeBetweenSameSymbol ?? metrics.avgTimeBetween;
  if (tips.length < 5 && keepDelayType === null && paceDelay !== null && paceDelay < 15) {
    tips.push('Ralentis ton rythme : impose un délai minimum de 15 minutes entre deux trades sur le même symbole.');
  }

  // Trades surdimensionnés
  if (tips.length < 5 && metrics.oversizedTradesCount >= 3) {
    tips.push('Évite les positions supérieures à 2x ta taille moyenne.');
  }

  // Concentration horaire excessive
  if (tips.length < 5 && metrics.activeHours !== undefined && metrics.activeHours <= 5) {
    tips.push('Évite de concentrer toute ton activité sur une fenêtre trop courte.');
  }

  return { priority, tips, plan };
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
// Trois niveaux d'intensité par pattern :
//   overtrading       : count < 5 / >= 5 / >= 10
//   loss_chasing      : count < 3 / >= 3
//   size_inconsistency: cv < 0.5 (défensif) / 0.5–1 / >= 1
//   revenge_trading, rapid_reentry : conseil fixe (délai post-sortie)

function getPatternTip(type, metrics, pat) {
  const count = pat?.count ?? 0;
  const cv    = pat?.cv    ?? 0;

  switch (type) {
    case 'overtrading':
      if (count >= 10) return 'Stoppe temporairement ton activité — rythme excessif détecté.';
      if (count >= 5)  return 'Réduis fortement ton nombre de trades : pas plus de 3 par heure.';
      return 'Limite ton nombre de trades à 3 maximum par heure.';

    case 'revenge_trading':
      return 'Après une vente, impose un délai minimum de 20 minutes avant toute nouvelle entrée.';

    case 'rapid_reentry':
      return 'Après une sortie, attends au moins 30 minutes avant de reprendre position.';

    case 'size_inconsistency':
      // cv < 0.5 : défensif — le pattern ne peut être détecté en dessous de ce seuil
      if (cv < 0.5) return null;
      if (cv >= 1)  return `Stabilise strictement ta taille autour de ta moyenne (${metrics.avgSize}$ ±20%).`;
      return `Fixe une taille de position proche de ta moyenne (${metrics.avgSize}$ ±20%).`;

    case 'loss_chasing':
      if (count >= 3) return 'Interdis toute augmentation de taille sur 3 trades consécutifs.';
      return 'Évite d\'augmenter ta taille sur des trades rapprochés.';

    default:
      return null;
  }
}

// ── Plan d'action par type ────────────────────────────────────────────────────
// Retourne 2–3 étapes concrètes et exécutables, adaptées à l'intensité réelle.
// Basé uniquement sur des données observables — zéro psychologie, zéro P&L.

function getPatternPlan(type, metrics, pat) {
  const count = pat?.count ?? 0;
  const cv    = pat?.cv    ?? 0;

  switch (type) {
    case 'overtrading':
      if (count >= 10) return [
        'Aujourd\'hui : zéro trade.',
        'Reprendre demain avec une limite stricte de 3 trades maximum.',
        'Respecter un délai de 20 minutes minimum entre chaque trade.',
      ];
      if (count >= 5) return [
        'Maximum 3 trades par heure, sans exception.',
        'Poser un minuteur de 20 minutes après chaque trade exécuté.',
        'Stopper la session dès que la limite horaire est atteinte.',
      ];
      return [
        'Maximum 3 trades par heure.',
        'Attendre au moins 15 minutes entre deux trades.',
      ];

    case 'revenge_trading':
      return [
        'Après chaque vente, imposer un délai minimum de 20 minutes avant toute nouvelle entrée.',
        'Ne pas dépasser ta taille moyenne sur le trade suivant une vente.',
      ];

    case 'rapid_reentry':
      return [
        'Après une sortie, attendre au moins 30 minutes avant toute nouvelle entrée.',
        'Vérifier la configuration du marché avant de réintégrer la même paire.',
      ];

    case 'size_inconsistency':
      if (cv >= 1) return [
        `Taille fixe : ${metrics.avgSize}$ par trade, ±20% maximum.`,
        'Ne pas exécuter un trade dont la taille s\'écarte de ce cadre.',
        'Vérifier la taille avant chaque entrée en position.',
      ];
      return [
        `Taille cible : ${metrics.avgSize}$ par trade.`,
        'Vérifier la taille avant chaque entrée.',
      ];

    case 'loss_chasing':
      if (count >= 3) return [
        'Même taille ou taille inférieure sur chaque nouveau trade — jamais supérieure.',
        'Interdire toute augmentation de taille sur 3 trades consécutifs.',
        'Réinitialiser la taille à ta moyenne dès la fin d\'une séquence rapprochée.',
      ];
      return [
        'Maintenir une taille constante sur les séquences de trades rapprochés.',
        'Règle : taille identique ou inférieure sur le trade suivant.',
      ];

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
