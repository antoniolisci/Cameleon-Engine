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
