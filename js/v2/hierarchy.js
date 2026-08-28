// src/js/v2/hierarchy.js
// Hiérarchie des tensions — V2
// Phase 2 (T2-01) : sélection du winner par priorité T3 > T1 > T2 > T4

import { V2_FLAGS } from './flags.js';

/** Ordre de priorité décroissante — PRIORITY_ORDER est un contrat irréversible */
const PRIORITY_ORDER = ['T3', 'T1', 'T2', 'T4'];

/**
 * Sélectionne la tension la plus prioritaire parmi celles détectées.
 * Les tensions non sélectionnées sont absorbées silencieusement.
 *
 * Comportements garantis :
 *   - tensionMap null ou absente   → { winner: null, absorbed: [], silent: [], escalated: [], deescalated: [] }
 *   - aucune tension active        → même résultat
 *   - une seule tension            → winner = cette tension, absorbed = []
 *   - tensions multiples           → winner = première selon PRIORITY_ORDER, absorbed = le reste
 *   - tension inconnue (id hors ordre) → traitée en dernier (indexOf = -1 → position 0 après sort)
 *   - tensionMap invalide          → aucun crash, retour objet vide stable
 *
 * @param {import('./types.js').TensionMap|null} tensionMap
 * @returns {import('./types.js').HierarchyResult|null}
 */
export function computeHierarchy(tensionMap) {
  if (!V2_FLAGS.V2_HIERARCHY) return null;

  // Résultat vide stable — aucun crash sur entrée invalide
  const empty = { winner: null, absorbed: [], silent: [], escalated: [], deescalated: [] };

  if (!tensionMap
    || typeof tensionMap !== 'object'
    || !Array.isArray(tensionMap.tensions)
    || tensionMap.tensions.length === 0) {
    return empty;
  }

  // Trier les tensions par ordre de priorité T3 > T1 > T2 > T4
  // Les tensions avec id inconnu reçoivent indexOf = -1, traitées en dernier après sort descendant
  const sorted = [...tensionMap.tensions].sort((a, b) => {
    const ia = PRIORITY_ORDER.indexOf(a.id);
    const ib = PRIORITY_ORDER.indexOf(b.id);
    // indexOf -1 (inconnu) → position finale (après T4)
    const pa = ia === -1 ? PRIORITY_ORDER.length : ia;
    const pb = ib === -1 ? PRIORITY_ORDER.length : ib;
    return pa - pb;
  });

  const winner   = sorted[0];
  const absorbed = sorted.slice(1);

  return {
    winner,
    absorbed,
    silent:       [],  // silence intentionnel — aucune autre tension non classée
    escalated:    [],  // escalade/désescalade — Phase 2 : non implémenté (D-HIE-02/03)
    deescalated:  [],
  };
}
