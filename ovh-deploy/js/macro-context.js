/**
 * ═══════════════════════════════════════════════════════════════
 *  CAMÉLÉON ENGINE — macro-context.js
 *
 *  Module Couche Macro — modulation narrative contextuelle.
 *
 *  Contrat strict (MACRO-RULE-01) :
 *  - Ne reçoit jamais le score, la posture, les actions, le payload.
 *  - Ne modifie aucune donnée. Retourne uniquement un string.
 *  - Si aucun contexte macro actif → retourne baseMessage intact.
 *  - L'effet est exclusivement narratif : suffixe conditionnel.
 *
 *  Export public :
 *    applyMacroOverlay(baseMessage, macroState) → string
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Applique une modulation narrative contextuelle au message du Confidence Panel.
 *
 * @param {string} baseMessage
 *   Message produit par resolveMode() — inchangé si aucun contexte macro actif.
 *
 * @param {{ dominanceMacro?: "none"|"active", desordreStructurel?: "none"|"active" }} macroState
 *   État des deux champs contextuels. Valeur absente ou "none" = inactif.
 *
 * @returns {string}
 *   Message original suivi d'un suffixe contextuel, ou message original si aucun contexte actif.
 */
export function applyMacroOverlay(baseMessage, macroState = {}) {
  const dominance = macroState.dominanceMacro     === "active";
  const desordre  = macroState.desordreStructurel === "active";

  if (!dominance && !desordre) return baseMessage;

  const suffixes = [];

  if (dominance) {
    suffixes.push("contexte macro dominant — lecture locale à confirmer");
  }

  if (desordre) {
    suffixes.push("référentiel structurel instable — confirmer la lecture avant d'agir");
  }

  return `${baseMessage} — ${suffixes.join(" · ")}`;
}
