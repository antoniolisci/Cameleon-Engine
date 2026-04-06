/**
 * ═══════════════════════════════════════════════════════════════
 *  CAMÉLÉON ENGINE — market-state.js
 *
 *  Module métier indépendant.
 *  Décrit l'état de marché de manière structurée.
 *  Ne connaît pas le formulaire. Ne fait pas de mapping.
 *  Ne prend aucune décision.
 *
 *  Exports publics :
 *    MARKET_STATE                    — constantes d'état
 *    MARKET_MODIFIER                 — constantes de modificateur
 *    computeRiskLevel(state, modifier) → "low" | "medium" | "high"
 *    assessMarket(state, modifier)   → objet structuré complet
 *    formatReading({ state, modifier }) → string
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Constantes ───────────────────────────────────────────────

export const MARKET_STATE = {
  RANGE:       "range",
  COMPRESSION: "compression",
  EXPANSION:   "expansion",
  DEFENSE:     "defense"
};

export const MARKET_MODIFIER = {
  STABLE:   "stable",
  UNSTABLE: "unstable"
};

// ─── Métadonnées par état ─────────────────────────────────────

const STATE_META = {
  range: {
    label:       "Range",
    description: "Le marché oscille dans une zone définie, sans direction dominante."
  },
  compression: {
    label:       "Compression",
    description: "Le marché se comprime avant une décision directionnelle."
  },
  expansion: {
    label:       "Expansion",
    description: "Le marché est en mouvement directionnel, breakout ou tendance."
  },
  defense: {
    label:       "Défense",
    description: "Le marché est en mode défensif ou instable, capital prioritaire."
  }
};

// ─── computeRiskLevel ─────────────────────────────────────────

/**
 * Calcule le niveau de risque à partir de l'état et du modificateur.
 * 3 niveaux stricts : "low" | "medium" | "high"
 *
 * @param {string} state    — valeur de MARKET_STATE
 * @param {string} modifier — valeur de MARKET_MODIFIER
 * @returns {"low"|"medium"|"high"}
 */
export function computeRiskLevel(state, modifier) {
  if (state === "range"       && modifier === "stable")   return "low";
  if (state === "range"       && modifier === "unstable") return "medium";
  if (state === "compression" && modifier === "stable")   return "medium";
  if (state === "compression" && modifier === "unstable") return "high";
  if (state === "expansion"   && modifier === "stable")   return "medium";
  if (state === "expansion"   && modifier === "unstable") return "high";
  if (state === "defense")                                return "high";
  return "low";
}

// ─── assessMarket ─────────────────────────────────────────────

/**
 * Retourne une lecture structurée de l'état de marché.
 * Fonction pure — entrée : state + modifier, sortie : objet complet.
 *
 * @param {string} state    — valeur de MARKET_STATE
 * @param {string} modifier — valeur de MARKET_MODIFIER
 * @returns {{ state, stateLabel, stateDescription, modifier, risk, timestamp }}
 */
export function assessMarket(state, modifier) {
  const s    = state    || MARKET_STATE.RANGE;
  const m    = modifier || MARKET_MODIFIER.STABLE;
  const meta = STATE_META[s] || STATE_META.range;

  return {
    state:            s,
    stateLabel:       meta.label,
    stateDescription: meta.description,
    modifier:         m,
    risk:             computeRiskLevel(s, m),
    timestamp:        new Date().toISOString()
  };
}

// ─── formatReading ────────────────────────────────────────────

/**
 * Retourne une représentation lisible de la lecture de marché.
 *
 * @param {{ state: string, modifier: string }} reading
 * @returns {string}
 */
export function formatReading({ state, modifier } = {}) {
  if (!state) return "range:stable";
  return `${state}:${modifier || "stable"}`;
}
