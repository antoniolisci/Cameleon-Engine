/**
 * ═══════════════════════════════════════════════════════════════
 *  CAMÉLÉON ENGINE — decision.js
 *
 *  Module de décision comportementale.
 *  Prend en entrée la lecture de marché (sortie de assessMarket)
 *  et retourne une décision principale + des alternatives.
 *
 *  Ne modifie pas assessMarket. Ne connaît pas le formulaire.
 *
 *  Export public :
 *    getDecision(market) → { primary, alternatives }
 *      primary      : { posture, actions, riskLevel }
 *      alternatives : [{ posture, actions, riskLevel }, ...]
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Table de décision principale ────────────────────────────
// Clé : "state:modifier"
// Note : "expansion" = breakout/tendance dans la nomenclature du moteur

const DECISION_TABLE = {
  "range:stable":        { posture: "ACTIVE",    actions: "buy low sell high", riskLevel: "MEDIUM" },
  "range:unstable":      { posture: "PRUDENCE",  actions: "reduce size",       riskLevel: "HIGH"   },
  "expansion:stable":    { posture: "AGRESSIVE", actions: "follow move",       riskLevel: "MEDIUM" },
  "expansion:unstable":  { posture: "WAIT",      actions: "no trade",          riskLevel: "HIGH"   },
  "compression:stable":  { posture: "WAIT",      actions: "prepare orders",    riskLevel: "LOW"    },
  "compression:unstable":{ posture: "WAIT",      actions: "prepare orders",    riskLevel: "MEDIUM" },
  "defense:stable":      { posture: "PROTECT",   actions: "reduce exposure",   riskLevel: "HIGH"   },
  "defense:unstable":    { posture: "PROTECT",   actions: "reduce exposure",   riskLevel: "HIGH"   }
};

// ─── Table des alternatives par état ─────────────────────────
// Clé : state (indépendant du modifier)

const ALTERNATIVES_TABLE = {
  defense: [
    { posture: "WAIT",           actions: "no trade",           riskLevel: "MEDIUM", score: 80 },
    { posture: "REDUCE_PARTIAL", actions: "close half position", riskLevel: "HIGH",   score: 60 }
  ],
  range: [
    { posture: "WAIT",           actions: "no trade",           riskLevel: "LOW",    score: 75 },
    { posture: "SCALP",          actions: "quick scalp only",   riskLevel: "MEDIUM", score: 50 }
  ],
  expansion: [
    { posture: "HOLD",                actions: "hold current position", riskLevel: "MEDIUM", score: 85 },
    { posture: "PARTIAL_TAKE_PROFIT", actions: "take partial profit",   riskLevel: "LOW",    score: 70 }
  ],
  compression: [
    { posture: "WAIT",           actions: "prepare orders",     riskLevel: "LOW",    score: 90 }
  ]
};

// ─── Fallback ─────────────────────────────────────────────────

const DECISION_FALLBACK = {
  primary:      { posture: "WAIT", actions: "no trade", riskLevel: "MEDIUM" },
  alternatives: []
};

// ─── getDecision ─────────────────────────────────────────────

/**
 * Retourne la décision comportementale à partir de la lecture de marché.
 *
 * @param {{ state: string, modifier: string }} market — sortie de assessMarket()
 * @returns {{ primary: { posture, actions, riskLevel }, alternatives: Array }}
 */
export function getDecision(market) {
  if (!market || typeof market !== "object") return { ...DECISION_FALLBACK };

  const key   = `${market.state || "range"}:${market.modifier || "stable"}`;
  const state = market.state || "range";

  const primary      = DECISION_TABLE[key]      ? { ...DECISION_TABLE[key] }                        : { ...DECISION_FALLBACK.primary };
  const alternatives = ALTERNATIVES_TABLE[state]
    ? ALTERNATIVES_TABLE[state].map(a => ({ ...a })).sort((a, b) => b.score - a.score)
    : [];

  return { primary, alternatives };
}
