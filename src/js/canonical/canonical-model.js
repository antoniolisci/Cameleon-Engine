// canonical-model.js — Modèle canonique de trace V1
// Registre des familles ACF V1, constantes d'états formalisés,
// et fonctions de validation RV1-RV4.
// LOT-P1-2.1 §3, §5, §8 — LOT-P1-2.2 §4.2
// Aucune dépendance externe. Aucune écriture localStorage.

// ─── Registre des familles ACF V1 (MI-5 — registre fermé) ───────────────────
// Les 13 familles ACF V1 sont toutes présentes dans ce registre.
// Seules SY1, SY3, S1 et S2 reçoivent des traces en Phase A (LOT-P1-2.1 §3.4).
// Les neuf autres sont architecturalement présentes mais vides en Phase A.

export const CANONICAL_FAMILIES = Object.freeze({
  SY1: 'SY1',          // Comportementale   — active Phase A
  SY3: 'SY3',          // Décisionnelle     — active Phase A
  S1:  'S1',           // Transactionnelle  — active Phase A
  S2:  'S2',           // Patrimoniale      — active Phase A
  S3:  'S3',           // Réserve Phase A
  S4:  'S4',           // Réserve Phase A
  S5:  'S5',           // Réserve Phase A
  SY2: 'SY2',          // Réserve Phase A
  SY4: 'SY4',          // Réserve Phase A
  L1:  'L1',           // Réserve Phase A
  L2:  'L2',           // Réserve Phase A
  L3:  'L3',           // Réserve Phase A
  REF: 'Référentiel',  // Réserve Phase A
});

// Familles ayant des traces à migrer en Phase A (LOT-P1-2.1 §3.4)
export const PHASE_A_ACTIVE_FAMILIES = Object.freeze(['SY1', 'SY3', 'S1', 'S2']);

// ─── États formalisés du champ Date (LOT-P1-2.1 §5.3, §6) ───────────────────
// Appliqués à la migration des données antérieures à LOT-P1-2.2.
// Après migration, toute nouvelle écriture produit un horodatage ISO 8601 UTC.

// R1 (Mémoire comportementale) et R3 (Niveau de garde comportemental)
export const DATE_UNAVAILABLE = 'Non disponible';

// R4 (Paramètres d'ordres récents)
export const DATE_NON_EXPLOITABLE = 'Non exploitable au format canonique';

// ─── Ensembles de référence (usage interne) ───────────────────────────────────

const _VALID_FAMILY_VALUES = new Set(Object.values(CANONICAL_FAMILIES));
const _VALID_DATE_STATES   = new Set([DATE_UNAVAILABLE, DATE_NON_EXPLOITABLE]);

// ─── Validateurs internes (RV1-RV4) ──────────────────────────────────────────

// RV1 — Famille présente et appartenant au registre ACF V1 (LOT-P1-2.1 §8.1)
function _validateFamille(famille) {
  if (!famille || typeof famille !== 'string') {
    return 'RV1 : champ famille absent';
  }
  if (!_VALID_FAMILY_VALUES.has(famille)) {
    return `RV1 : famille "${famille}" absente du registre ACF V1`;
  }
  return null;
}

// RV2 — Source présente et non vide (LOT-P1-2.1 §8.1)
// La couche valide uniquement la présence — pas la conformité à la liste officielle.
// D4 Option A retenue dans le plan d'implémentation LOT-P1-2.
function _validateSource(source) {
  if (source === null || source === undefined) {
    return 'RV2 : champ source absent';
  }
  if (typeof source !== 'string' || source.trim() === '') {
    return 'RV2 : champ source vide';
  }
  return null;
}

// RV3 — Date renseignée : ISO 8601 UTC ou état formalisé reconnu (LOT-P1-2.1 §8.1)
// Horodatage attendu : YYYY-MM-DDTHH:MM:SS[.mmm]Z (suffixe Z obligatoire)
function _validateDate(date) {
  if (date === null || date === undefined || date === '') {
    return 'RV3 : champ date absent';
  }
  if (typeof date !== 'string') {
    return 'RV3 : champ date invalide (string attendu)';
  }
  if (_VALID_DATE_STATES.has(date)) {
    return null; // état formalisé reconnu (R1, R3 ou R4)
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(date)) {
    return null; // horodatage ISO 8601 UTC valide
  }
  return `RV3 : date "${date}" non conforme — ISO 8601 UTC attendu ou état formalisé reconnu`;
}

// RV4 — Valeur présente et non vide (LOT-P1-2.1 §8.1, LOT-P1-2.2 §4.2)
// Une chaîne vide ne constitue pas une valeur valide (LOT-P1-2.2 §4.2).
// La couche ne substitue pas silencieusement une valeur par défaut.
function _validateValeur(valeur) {
  if (valeur === null || valeur === undefined) {
    return 'RV4 : champ valeur absent';
  }
  if (typeof valeur === 'string' && valeur === '') {
    return 'RV4 : valeur vide (chaîne vide non acceptée)';
  }
  return null;
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Structure d'une trace canonique (LOT-P1-2.1 §4, §5) :
 * {
 *   famille:  string  — famille ACF V1 (RV1, obligatoire)
 *   source:   string  — module écrivant (RV2, obligatoire)
 *   date:     string  — ISO 8601 UTC ou état formalisé (RV3, obligatoire)
 *   contexte: any     — contexte enrichi (RV5, optionnel)
 *   valeur:   any     — contenu de la trace (RV4, obligatoire, chaîne vide rejetée)
 * }
 */

/**
 * Valide une trace canonique selon RV1-RV4.
 * RV5 (contexte optionnel) n'est pas contrôlé — son absence n'est pas une violation.
 * Retourne { valid, errors } — errors est toujours un tableau, vide si valid est true.
 * Le rejet est explicite : la couche ne complète pas silencieusement les champs manquants.
 * LOT-P1-2.1 §8.1-§8.3
 *
 * @param {object} trace
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTrace(trace) {
  if (!trace || typeof trace !== 'object' || Array.isArray(trace)) {
    return { valid: false, errors: ['trace : objet attendu'] };
  }
  const errors = [
    _validateFamille(trace.famille),
    _validateSource(trace.source),
    _validateDate(trace.date),
    _validateValeur(trace.valeur),
  ].filter(Boolean);
  return { valid: errors.length === 0, errors };
}
