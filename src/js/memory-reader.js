// memory-reader.js — Lecteur de mémoire minimal V1
// Périmètre : Refléter le motif (boucle mémoire étape 4).
// Doctrine de référence : memory_doctrine_v1.md · pattern_reflection_doctrine_v1.md
//
// Ce module lit exclusivement CE_journal_entries_v1 via journalEntries.getAll().
// Il ne lit pas cameleon_behavior_memory_v1.
// Il ne lit pas behavior-bridge.js.
// Il ne lit aucune donnée marché.
// Il ne produit aucun texte. Il ne touche aucun DOM.
//
// Fonctions exportées :
//   extractBehaviorSeries()                          — Tâche 1 : extraction et validation
//   computeTransitionPairs(series)                   — Tâche 2 : calcul des paires de transition
//   detectPatterns(pairs)                            — Tâche 3 : comptage et filtrage
//   formatPatternDescriptions(result, seriesInfo)    — Tâche 4 : production des descriptions

import { journalEntries } from './storage.js';
import { OVERTRADING_DICT } from './overtrading-dictionary.js';

// ── Décisions N5 gelées ───────────────────────────────────────
// R-P07 — seuil minimal de snapshots valides pour opérer.
// Valeur provisoire V1. Ne pas modifier sans décision architecturale explicite.
const MEMORY_MIN_SNAPSHOTS = 5;

// Occurrences minimales d'une paire pour être déclarée comme motif.
// Valeur provisoire V1. Ne pas modifier sans décision architecturale explicite.
const MEMORY_MIN_OCCURRENCES = 2;

// Seuil minimal de snapshots par fenêtre pour "Certifier le changement".
// Valeur provisoire V1. Ne pas modifier sans décision architecturale explicite.
// Seuil total requis = CERTIFICATION_MIN_SNAPSHOTS_PER_WINDOW * 2.
const CERTIFICATION_MIN_SNAPSHOTS_PER_WINDOW = 5;

// ── Extraction et validation ──────────────────────────────────

/**
 * Lit CE_journal_entries_v1, extrait les snapshots comportementaux valides
 * et retourne une série chronologique prête pour Tâche 2 (calcul des paires).
 *
 * Retourne :
 *   { state: 'INSUFFICIENT', count: N }
 *     — données en dessous du seuil R-P07. Le Lecteur doit afficher le message
 *       d'insuffisance. Aucune opération de motif ne peut être lancée.
 *
 *   { state: 'READY', series: [{ overtradingLevel, timestamp }, ...], bounds: { first, last } }
 *     — série valide. series est ordonnée du plus ancien au plus récent.
 *       bounds contient les timestamps ISO du premier et du dernier snapshot.
 */
export function extractBehaviorSeries() {
  const entries = journalEntries.getAll();

  // Filtre : conserver uniquement les entrées avec overtradingLevel valide (1–5).
  // Les snapshots antérieurs au commit 8d8e315 n'ont pas ce champ —
  // ils sont exclus silencieusement sans erreur.
  const valid = entries
    .filter(e => {
      const lvl = e?.behavior?.overtradingLevel;
      return Number.isInteger(lvl) && lvl >= 1 && lvl <= 5;
    })
    .sort((a, b) => {
      // Tri chronologique ascendant par timestamp.
      // updated_at est une chaîne ISO 8601 — comparaison lexicographique valide.
      const ta = a.updated_at ?? '';
      const tb = b.updated_at ?? '';
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    })
    .map(e => ({
      overtradingLevel: e.behavior.overtradingLevel,
      timestamp:        e.updated_at,
    }));

  if (valid.length < MEMORY_MIN_SNAPSHOTS) {
    return { state: 'INSUFFICIENT', count: valid.length };
  }

  return {
    state:  'READY',
    series: valid,
    bounds: {
      first: valid[0].timestamp,
      last:  valid[valid.length - 1].timestamp,
    },
  };
}

// ── Calcul des paires de transition ──────────────────────────

/**
 * Calcule les paires de transition consécutives depuis une série valide.
 * Décision N5 : unité de comparaison = overtradingLevel entier 1–5.
 *
 * Entrée  : series — tableau [{ overtradingLevel, timestamp }, ...]
 *           ordonné chronologiquement, longueur ≥ MEMORY_MIN_SNAPSHOTS.
 * Sortie  : tableau [{ levelA, levelB }, ...]
 *           longueur = series.length - 1 (invariant garanti).
 *
 * Règle   : paire N = series[N] → series[N+1].
 *           Aucun saut. Aucun filtrage. Aucun comptage.
 *           (3,4) ≠ (4,3). (3,3) est valide.
 */
export function computeTransitionPairs(series) {
  const pairs = [];
  for (let i = 0; i < series.length - 1; i++) {
    pairs.push({
      levelA: series[i].overtradingLevel,
      levelB: series[i + 1].overtradingLevel,
    });
  }
  return pairs;
}

// ── Comptage et filtrage ──────────────────────────────────────

/**
 * Compte les occurrences de chaque paire distincte et retient celles
 * atteignant le seuil MEMORY_MIN_OCCURRENCES.
 *
 * Entrée  : pairs — tableau [{ levelA, levelB }, ...]
 *           issu de computeTransitionPairs(), longueur ≥ MEMORY_MIN_SNAPSHOTS - 1.
 * Sortie  :
 *   { state: 'NO_PATTERN' }
 *     — aucune paire n'atteint MEMORY_MIN_OCCURRENCES occurrences.
 *
 *   { state: 'PATTERNS_FOUND', patterns: [{ levelA, levelB, count }, ...] }
 *     — patterns est ordonné par première apparition dans la série (chronologique).
 *       Aucun tri par fréquence — interdit (verdict implicite, PRD V1 §VI).
 *
 * Clé interne : "${levelA}-${levelB}" — usage de groupement uniquement,
 * jamais transmise ni affichée.
 */
export function detectPatterns(pairs) {
  // counts : clé → nombre d'occurrences.
  // order  : clé → index d'ordre de première apparition (préserve l'ordre chronologique).
  const counts = {};
  const order  = {};

  for (const { levelA, levelB } of pairs) {
    const key = `${levelA}-${levelB}`;
    if (counts[key] === undefined) {
      counts[key] = 0;
      order[key]  = Object.keys(order).length;
    }
    counts[key]++;
  }

  const qualifying = Object.keys(counts)
    .filter(key => counts[key] >= MEMORY_MIN_OCCURRENCES)
    .sort((a, b) => order[a] - order[b])
    .map(key => {
      const [levelA, levelB] = key.split('-').map(Number);
      return { levelA, levelB, count: counts[key] };
    });

  if (qualifying.length === 0) {
    return { state: 'NO_PATTERN' };
  }

  return { state: 'PATTERNS_FOUND', patterns: qualifying };
}

// ── Production des descriptions conformes ────────────────────

// Résout le label canonique depuis OVERTRADING_DICT.
// Fallback : "Niveau N" si le niveau est absent du dictionnaire.
function _label(level) {
  return OVERTRADING_DICT[level]?.etat ?? `Niveau ${level}`;
}

// Formate un timestamp ISO 8601 en JJ/MM/AAAA.
// Retourne '—' si le timestamp est absent ou invalide.
function _formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Produit les descriptions textuelles conformes à PRD V1 §VI et Language System V1.
 *
 * Entrée :
 *   result     — sortie de detectPatterns() : { state, patterns? }
 *   seriesInfo — { count: number, bounds: { first, last } | null }
 *                count  = nombre de snapshots valides dans la série
 *                bounds = timestamps ISO du premier et dernier snapshot (null si INSUFFICIENT)
 *
 * Sortie : string[] — tableau de phrases.
 *   INSUFFICIENT   → 1 phrase (R-P07)
 *   NO_PATTERN     → 1 phrase
 *   PATTERNS_FOUND → 1 phrase par paire qualifiante (ordre de première apparition)
 *
 * Cette fonction ne lit aucune source externe.
 * Elle ne touche aucun DOM.
 */
export function formatPatternDescriptions(result, seriesInfo) {
  const { count, bounds } = seriesInfo;

  // ── État insuffisance de données (R-P07) ──────────────────
  if (result.state === 'INSUFFICIENT') {
    return [
      `Données insuffisantes pour identifier des motifs de transition` +
      ` (${count} snapshot${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}` +
      ` — seuil minimal : ${MEMORY_MIN_SNAPSHOTS}).`
    ];
  }

  const dateFirst = _formatDate(bounds?.first);
  const dateLast  = _formatDate(bounds?.last);
  const fenetre   = `fenêtre ${dateFirst} — ${dateLast}`;

  // ── État absence de transition répétée ───────────────────
  if (result.state === 'NO_PATTERN') {
    return [
      `Aucune transition répétée n'a été observée` +
      ` dans les ${count} snapshots disponibles` +
      ` (${fenetre}).`
    ];
  }

  // ── État motifs détectés ──────────────────────────────────
  // Garde défensive : état inconnu ou patterns absent → tableau vide, pas de TypeError.
  if (result.state !== 'PATTERNS_FOUND' || !Array.isArray(result.patterns)) {
    return [];
  }

  // Une phrase par paire qualifiante. Ordre de première apparition (Tâche 3).
  // Aucun tri par fréquence. Aucun superlatif. Aucune paire désignée dominante.
  return result.patterns.map(({ levelA, levelB, count: c }) => {
    const labelA = _label(levelA);
    const labelB = _label(levelB);
    return (
      `La transition ${labelA} (${levelA}) → ${labelB} (${levelB})` +
      ` a été observée ${c} fois` +
      ` dans les ${count} snapshots disponibles` +
      ` (${fenetre}).`
    );
  });
}

// ── Certification du changement (boucle mémoire étape 5) ─────
// Doctrine de référence : pattern_reflection_doctrine_v1.md §III, §V, §VI, R-P01–R-P08.
//
// Fonctions exportées :
//   splitSeriesIntoWindows(series)              — divise la série en W1 (antérieure) et W2 (récente)
//   computeWindowDistribution(windowData)       — moyenne + comptage par niveau pour une fenêtre
//   formatCertificationDescriptions(w1, w2)     — produit les phrases conformes à PRD V1

/**
 * Divise la série en deux fenêtres consécutives non chevauchantes.
 * W1 = première moitié (antérieure). W2 = seconde moitié (récente).
 * Règle : split au milieu (floor). W2 contient les snapshots les plus récents.
 *
 * Entrée  : series — tableau [{ overtradingLevel, timestamp }, ...], ordonné chronologiquement,
 *           issu de extractBehaviorSeries() avec state === 'READY'.
 *
 * Sortie :
 *   { state: 'INSUFFICIENT_FOR_CERTIFICATION', total: N }
 *     — série totale < CERTIFICATION_MIN_SNAPSHOTS_PER_WINDOW * 2.
 *       Aucune certification possible.
 *
 *   { state: 'READY', w1: WindowData, w2: WindowData }
 *     — W1 et W2 prêtes pour computeWindowDistribution().
 *
 * WindowData : { snapshots, bounds: { first, last }, count }
 */
export function splitSeriesIntoWindows(series) {
  const total    = series.length;
  const minTotal = CERTIFICATION_MIN_SNAPSHOTS_PER_WINDOW * 2;

  if (total < minTotal) {
    return { state: 'INSUFFICIENT_FOR_CERTIFICATION', total };
  }

  const midpoint = Math.floor(total / 2);
  const w1Snaps  = series.slice(0, midpoint);
  const w2Snaps  = series.slice(midpoint);

  return {
    state: 'READY',
    w1: {
      snapshots: w1Snaps,
      bounds:    { first: w1Snaps[0].timestamp, last: w1Snaps[w1Snaps.length - 1].timestamp },
      count:     w1Snaps.length,
    },
    w2: {
      snapshots: w2Snaps,
      bounds:    { first: w2Snaps[0].timestamp, last: w2Snaps[w2Snaps.length - 1].timestamp },
      count:     w2Snaps.length,
    },
  };
}

/**
 * Calcule la distribution par niveau et la moyenne pour une fenêtre.
 *
 * Entrée  : windowData — { snapshots, bounds, count } issu de splitSeriesIntoWindows().
 * Sortie  : { count, mean, levelCounts, bounds }
 *   count       = nombre de snapshots dans la fenêtre
 *   mean        = niveau moyen arrondi à 1 décimale (Math.round(x*10)/10)
 *   levelCounts = { [level: number]: occurrences } — uniquement les niveaux présents
 *   bounds      = { first, last } timestamps ISO
 *
 * Aucune évaluation normative. Aucun delta. Aucun tri par fréquence.
 */
export function computeWindowDistribution(windowData) {
  const { snapshots, bounds, count } = windowData;
  const levelCounts = {};
  let sum = 0;

  for (const { overtradingLevel } of snapshots) {
    levelCounts[overtradingLevel] = (levelCounts[overtradingLevel] ?? 0) + 1;
    sum += overtradingLevel;
  }

  return {
    count,
    mean:        Math.round((sum / count) * 10) / 10,
    levelCounts,
    bounds,
  };
}

/**
 * Produit les descriptions textuelles conformes à PRD V1 §VI et R-P01–R-P08.
 *
 * Entrée :
 *   w1Dist — sortie de computeWindowDistribution() pour W1
 *   w2Dist — sortie de computeWindowDistribution() pour W2
 *
 * Sortie : string[] — tableau de phrases.
 *   2 phrases de moyenne (W1 puis W2)
 *   2 phrases par niveau présent dans W1 ou W2 (W1 puis W2, ordre ascendant 1→5)
 *
 * Contraintes doctrinales appliquées :
 *   R-P01 — sujet = la fenêtre / le niveau, jamais l'opérateur
 *   R-P04 — aucune évaluation normative (mieux, moins bien, progrès, régression)
 *   R-P05 — bornes toujours explicites (dates JJ/MM/AAAA)
 *   PRD V1 §VI — aucun superlatif, aucun delta directionnel, aucune conclusion
 *
 * Cette fonction ne lit aucune source externe. Elle ne touche aucun DOM.
 */
export function formatCertificationDescriptions(w1Dist, w2Dist) {
  const w1d1 = _formatDate(w1Dist.bounds.first);
  const w1d2 = _formatDate(w1Dist.bounds.last);
  const w2d1 = _formatDate(w2Dist.bounds.first);
  const w2d2 = _formatDate(w2Dist.bounds.last);

  const lines = [];

  // ── Moyennes ──────────────────────────────────────────────
  lines.push(
    `Dans W1 (du ${w1d1} au ${w1d2}), le niveau moyen observé était ${w1Dist.mean}.`
  );
  lines.push(
    `Dans W2 (du ${w2d1} au ${w2d2}), le niveau moyen observé était ${w2Dist.mean}.`
  );

  // ── Distribution par niveau ───────────────────────────────
  // Union des niveaux présents dans W1 ou W2, triés par ordre croissant (1→5).
  // Aucun tri par fréquence. Aucun niveau désigné dominant.
  const allLevels = new Set([
    ...Object.keys(w1Dist.levelCounts).map(Number),
    ...Object.keys(w2Dist.levelCounts).map(Number),
  ]);
  const sortedLevels = [...allLevels].sort((a, b) => a - b);

  for (const level of sortedLevels) {
    const label   = _label(level);
    const c1      = w1Dist.levelCounts[level] ?? 0;
    const c2      = w2Dist.levelCounts[level] ?? 0;
    const occ     = n => `${n} occurrence${n !== 1 ? 's' : ''}`;

    lines.push(
      `Dans W1 (${w1Dist.count} snapshots), le niveau ${level} (${label}) représentait ${occ(c1)} sur ${w1Dist.count}.`
    );
    lines.push(
      `Dans W2 (${w2Dist.count} snapshots), le niveau ${level} (${label}) représentait ${occ(c2)} sur ${w2Dist.count}.`
    );
  }

  return lines;
}
