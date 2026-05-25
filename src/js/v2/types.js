// src/js/v2/types.js
// Définitions de types V2 — JSDoc uniquement, aucune logique

/**
 * @typedef {'T1'|'T2'|'T3'|'T4'} TensionId
 * T1 = cohérence confidence/premium
 * T2 = surcharge structurelle
 * T3 = delta engagement/posture
 * T4 = surqualification technique
 */

/**
 * @typedef {object} TensionDetail
 * @property {TensionId} id
 * @property {string} type
 * @property {'low'|'medium'|'high'} severity
 * @property {object} payload - données contextuelles de la tension
 * @property {boolean} [is_blocking] - si true, exception absolue : passe le gate attention
 */

/**
 * @typedef {object} TensionMap
 * @property {TensionDetail[]} tensions
 * @property {number} active_exposed - nombre de tensions actives exposées
 * @property {'low'|'medium'|'high'} noise_level
 */

/**
 * @typedef {object} HierarchyResult
 * @property {TensionDetail|null} winner - tension prioritaire sélectionnée
 * @property {TensionDetail[]} absorbed - tensions absorbées silencieusement
 * @property {TensionDetail[]} silent - tensions présentes non exposées
 * @property {TensionId[]} escalated - tensions dont la sévérité a monté
 * @property {TensionId[]} deescalated - tensions dont la sévérité a baissé
 */

/**
 * @typedef {object} AttentionState
 * @property {number} expositions_session - total expositions depuis début de session
 * @property {number} expositions_window - expositions dans les N dernières soumissions
 * @property {'normal'|'high'|'elevated'} attention_level - niveau courant
 * @property {number} cycles_since_last_exposition - soumissions sans exposition (mécanisme de déclin)
 */

/**
 * @typedef {object} AttentionResult
 * @property {boolean} should_expose - gate final : la tension doit-elle être exposée ?
 * @property {'normal'|'elevated'|'high'} attention_level - niveau d'attention courant
 * @property {TensionDetail|null} suppressed_winner - winner supprimé par le gate (debug only)
 */

/**
 * @typedef {object} ExpositionResult
 * @property {string} message - message final destiné au cockpit
 * @property {string} intention - intention du message (T1–T4)
 * @property {TensionId} tension_id
 * @property {'low'|'medium'|'high'} severity
 * @property {boolean} is_blocking - la tension bloque-t-elle une action ?
 */

/**
 * @typedef {object} CalibrationSnapshot
 * @property {number} timestamp
 * @property {number|null} confidence_score
 * @property {string} posture
 * @property {number|null} MdS
 * @property {number|null} QdR
 * @property {number|null} DMU
 * @property {string} engagement_declared
 * @property {TensionId|null} winner
 * @property {string} attention_level
 * @property {boolean} should_expose
 */
