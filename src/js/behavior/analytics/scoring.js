// Synthèse comportementale : score, profil, risque dominant, interprétation.
//
// Entrées : patterns[] (issu de detectPatterns) + metrics{} (issu de computeMetrics)
// Sortie  : { score, profile, dominantRisk, interpretation }
//
// Principe :
//   - score initial = 100
//   - pénalités graduées selon l'intensité réelle (count ou cv)
//   - overtrading modulé par le rythme réel (paceDelay) et le contexte global
//   - pénalités patterns plafonnées à 65 pts pour éviter l'effondrement brutal
//   - risque dominant = weight × intensity, le plus fort l'emporte
//   - profil déduit du score final

// ── Debug contextualisation GRID ──────────────────────────────────────────────
// Passer DEBUG_GRID à true pour tracer toutes les décisions de contextualisation.
// Raisons loguées : no_symbols · symbol_mismatch · aggressive_patterns.
// La confidence affichée est post-decay (calculée dans behavior-view.js).
const DEBUG_GRID = false;
const dbgGrid = (...args) => { if (DEBUG_GRID) console.debug('[bhv:grid-ctx]', ...args); };

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
//
// ctx (optionnel, pour overtrading uniquement) :
//   paceDelay   — délai moyen entre trades sur le même symbole (minutes)
//   isIsolated  — true si overtrading est le seul pattern détecté

function getPenalty(pattern, ctx) {
  const n  = pattern.count || 1;
  const cv = pattern.cv    || 0;

  switch (pattern.type) {

    case 'overtrading': {
      // Base selon la fréquence des fenêtres déclenchées
      // 1–2 fenêtres : activation ponctuelle
      // 3–5 : tendance réelle
      // >5  : comportement ancré
      let base = n > 5 ? 20 : n >= 3 ? 15 : 10;

      // Modulation par le rythme réel sur le même symbole.
      // Un délai ≥ 10 min entre trades = activité élevée mais pas frénétique.
      // La fréquence seule ne suffit pas à qualifier d'impulsivité.
      if (ctx?.paceDelay != null && ctx.paceDelay >= 10) {
        base = Math.ceil(base * 0.5);
      }

      // Signal isolé : overtrading sans aucun autre pattern associé.
      // L'activité est élevée, mais sizing et comportement restent cohérents.
      // Si un profil GRID récent est présent (Order History < 7 jours), la
      // fréquence élevée peut être expliquée par une stratégie planifiée.
      // Condition stricte : overtrading SEUL — dès qu'un autre pattern agressif
      // est présent (rapid_reentry, loss_chasing…), la pénalité normale s'applique.
      //
      // V4.3 — atténuation pondérée par la confiance du profil GRID (0–1) :
      //   factor = 0.60 − confidence × 0.25
      //   confidence = 0.0  → factor = 0.60  (grille peu fiable, bénéfice minimal)
      //   confidence = 0.5  → factor = 0.475 (grille modérément régulière)
      //   confidence = 1.0  → factor = 0.35  (grille dense et régulière, atténuation max)
      // Fallback si confidence absente : 0.5 (comportement V4.2 ≈ 0.4, légèrement plus conservateur)
      if (ctx?.isIsolated) {
        if (ctx?.hasGridProfile) {
          const conf   = typeof ctx.gridConfidence === 'number' ? ctx.gridConfidence : 0.5;
          const factor = 0.60 - conf * 0.25;
          base = Math.ceil(base * factor);
          dbgGrid('pénalité modulée — conf(decayed)=%s · factor=%s · base→%d', conf.toFixed(2), factor.toFixed(3), base);
        } else {
          base = Math.ceil(base * 0.7);  // overtrading seul sans grille → atténuation légère
        }
      }

      return base;
    }

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

// gridContext : objet optionnel issu de readGridContext() dans behavior-view.js.
// { hasGridProfile: true, gridProfileFresh: true, symbols: [], confidence: 0–1 }
// Transmis depuis l'Order History via behaviorRepo.orderStrategyProfile.
// N'est actif que si profil GRID détecté dans les 7 derniers jours.
function computeScore(patterns, metrics, gridContext = null) {
  if (!metrics) return null;
  const pats = patterns || [];

  // Délai de rythme : par symbole en priorité (v3), fallback global
  const paceDelay = metrics.avgTimeBetweenSameSymbol ?? metrics.avgTimeBetween;

  // Overtrading est-il le seul pattern ? Si oui, contexte "actif mais cohérent".
  const hasOtherPatterns = pats.some(p => p.type !== 'overtrading');

  // ── Garde-fou patterns agressifs ─────────────────────────────────────────────
  // La contextualisation GRID est désactivée dès qu'un autre pattern est présent.
  // rapid_reentry, loss_chasing, revenge_trading ou size_inconsistency combinés à
  // un overtrading signalent un comportement réellement agressif — pas une grille.
  // Un trader grille ne bénéficie d'aucune immunité : la contextualisation module
  // uniquement quand l'overtrading est le seul signal et la grille est cohérente.
  const gridActive = gridContext?.hasGridProfile && !hasOtherPatterns;
  if (DEBUG_GRID) {
    dbgGrid('gridActive=%s · hasGridProfile=%s · hasOtherPatterns=%s · confidence=%s',
      gridActive, gridContext?.hasGridProfile ?? false, hasOtherPatterns,
      gridContext?.confidence ?? 'n/a');
    if (hasOtherPatterns && gridContext?.hasGridProfile) {
      dbgGrid('contextualisation OFF — raison: aggressive_patterns (%s)',
        pats.filter(p => p.type !== 'overtrading').map(p => p.type).join(', '));
    }
  }

  // 1. Pénalités patterns avec contexte
  let patternPenalty = 0;
  let anyGridApplied = false;   // tracé pour score.gridContextApplied

  pats.forEach(p => {
    // ── Corrélation symbole GRID ──────────────────────────────────────────────
    // Le contexte grille ne s'applique que si les symboles ayant déclenché
    // l'overtrading correspondent aux symboles du profil GRID (Order History).
    //
    // Règle symbols=[] : gridContext.symbols vide = profil sans symboles fiables.
    // Contextualiser "tout par défaut" serait trop permissif — contextualisation OFF.
    // p.symbols = [] = pattern sans info symbole = backward compat, laissé passer.
    let gridSymbolsMatch = false;
    if (p.type === 'overtrading' && gridActive) {
      const gridSyms  = gridContext?.symbols || [];
      const tradeSyms = p.symbols            || [];

      if (gridSyms.length === 0) {
        dbgGrid('contextualisation OFF — raison: no_symbols (gridContext.symbols vide)');
      } else {
        gridSymbolsMatch = tradeSyms.length === 0 || tradeSyms.some(s => gridSyms.includes(s));
        if (DEBUG_GRID && !gridSymbolsMatch) {
          dbgGrid('contextualisation OFF — raison: symbol_mismatch · grid=%o · trade=%o', gridSyms, tradeSyms);
        }
      }
    }

    const hasGridForPattern = p.type === 'overtrading' && gridActive && gridSymbolsMatch;
    if (hasGridForPattern) {
      anyGridApplied = true;
      dbgGrid('CAS 1 actif — confidence(post-decay)=%s · grid=%o · trade=%o',
        gridContext?.confidence ?? 'null→fallback 0.5', gridContext?.symbols, p.symbols);
    }

    const ctx = {
      paceDelay,
      isIsolated:      p.type === 'overtrading' && !hasOtherPatterns,
      hasGridProfile:  hasGridForPattern,
      // gridConfidence : null si corrélation symbole échoue → pénalité normale.
      gridConfidence:  hasGridForPattern ? (gridContext?.confidence ?? null) : null
    };
    patternPenalty += getPenalty(p, ctx);
  });

  // Plafond à 65 pts de pénalités patterns : empêche l'effondrement brutal du score
  // quand plusieurs patterns modérés s'accumulent. Un score ≥ 35 reste atteignable
  // sans patterns graves dominants. Les cas extrêmes (loss_chasing + revenge élevés)
  // atteignent naturellement ce plafond et tombent en zone Agressif.
  patternPenalty = Math.min(patternPenalty, 65);

  let score = 100 - patternPenalty;

  // 2. Pénalités métriques (sur-exposition, rythme)
  if (metrics.oversizedTradesCount >= 3) score -= 10;

  // Rythme gradué : une cadence rapide mais non frénétique (10–14 min) est moins
  // pénalisante qu'un rythme très court (< 5 min). Remplace le palier binaire < 15 → -10.
  if (paceDelay !== null) {
    if      (paceDelay < 5)  score -= 10;
    else if (paceDelay < 10) score -= 7;
    else if (paceDelay < 15) score -= 4;
  }

  score = Math.max(0, Math.min(100, score));

  // 2. Profil
  const profile = PROFILES.find(p => score >= p.min) || PROFILES[PROFILES.length - 1];

  // 3. Risque dominant (pondéré par intensité)
  const dominantRisk = computeDominantRisk(pats, metrics);

  // 4. Interprétation
  const types = new Set(pats.map(p => p.type));
  const interpretation = buildInterpretation(profile.key, dominantRisk, types);

  // Annotation contexte grille — true uniquement si la corrélation symbole a réussi.
  // Permet à behavior-view.js d'afficher la notice sans recalculer la condition.
  // V4.4 : false si Order History GRID ne couvre pas les symboles de l'overtrading.
  const gridContextApplied = anyGridApplied;

  return { score, profile, dominantRisk, interpretation, gridContextApplied, dataQuality: metrics.dataQuality ?? null };
}

// ── Risque dominant ────────────────────────────────────────────────────────────
// score_risque = weight × intensity
// → le signal le plus lourd l'emporte, quelle que soit la priorité arbitraire

function computeDominantRisk(pats, metrics) {
  const paceDelay = metrics.avgTimeBetweenSameSymbol ?? metrics.avgTimeBetween;
  const candidates = [];

  pats.forEach(p => {
    const weight    = PATTERN_WEIGHTS[p.type] || 0;
    // size_inconsistency : cv comme intensité (ex: cv=0.9 → weight × 0.9)
    // autres patterns    : count comme intensité (ex: count=3 → weight × 3)
    const intensity = p.type === 'size_inconsistency'
      ? (p.cv    || 0.5)
      : (p.count || 1);

    // Overtrading : ne peut être dominant global que si le rythme global est réellement dense.
    // paceDelay >= 30 min → activité globale espacée → exclu de la sélection dominante.
    // paceDelay >= 10 min → élevé mais pas frénétique → poids réduit de moitié.
    let effectiveWeight = weight;
    if (p.type === 'overtrading') {
      if (paceDelay != null && paceDelay >= 30) return;  // exclu — pas un comportement dominant global
      if (paceDelay != null && paceDelay >= 10) effectiveWeight = Math.ceil(weight * 0.5);
    }

    candidates.push({ label: p.label, score: effectiveWeight * intensity });
  });

  // Signaux métriques
  if (metrics.oversizedTradesCount >= 3) {
    candidates.push({ label: 'Surexposition ponctuelle', score: 10 });
  }
  // Rythme gradué — score proportionnel à la sévérité (cohérent avec computeScore)
  if (paceDelay !== null && paceDelay < 15) {
    const paceScore = paceDelay < 5 ? 10 : paceDelay < 10 ? 7 : 4;
    candidates.push({ label: 'Rythme trop rapide', score: paceScore });
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
