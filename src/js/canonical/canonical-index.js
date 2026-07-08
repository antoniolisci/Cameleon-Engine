// canonical-index.js — Index triple-axe · Initialisation (ML-2)
// Initialise la structure de l'index canonique en stockage.
// L'indexation complète par famille, date et session est définie dans ML-3.
// LOT-P1-2.3 — LOT-P1-2.1 §9 (MI-7)
// Aucune dépendance externe.

// Clé de stockage de l'index [PROP — namespacing UUID appliqué en ML-5]
export const INDEX_KEY = 'CE_canonical_index_v1';

// Structure de l'index vide.
// Triple axe : byFamille · byDate · bySession (LOT-P1-2.3).
// ML-3 définit l'initialisation complète de byFamille (13 familles ACF V1).
const _EMPTY_INDEX = Object.freeze({
  byFamille: {},
  byDate:    {},
  bySession: {},
});

// ─── Initialisation ───────────────────────────────────────────────────────────

/**
 * Initialise l'index canonique si absent du stockage.
 * Crée la structure vide — ne remplace pas un index existant.
 * LOT-P1-2.3
 */
export function initCanonicalIndex() {
  try {
    const existing = localStorage.getItem(INDEX_KEY);
    if (!existing) {
      localStorage.setItem(INDEX_KEY, JSON.stringify(_EMPTY_INDEX));
    }
  } catch {
    // Défaillance non bloquante — l'index sera absent, la réconciliation
    // conditionnelle peut le reconstruire à l'initialisation (LOT-P1-2.3).
  }
}

// ─── Mise à jour de l'index ───────────────────────────────────────────────────

/**
 * Met à jour l'index après écriture d'une trace (RE2 — LOT-P1-2.1 §8.2).
 * Implémentation complète dans ML-3 : indexation par famille, date et session.
 * ML-2 : aucune opération — la trace est déjà persistée dans le corpus.
 *
 * @param {object} _trace — trace canonique persistée
 */
export function updateIndex(_trace) {
  // ML-3 : indexation triple-axe (famille · date · session)
}
