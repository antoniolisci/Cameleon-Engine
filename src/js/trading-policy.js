/**
 * ═══════════════════════════════════════════════════════════════
 *  CAMÉLÉON ENGINE — trading-policy.js
 *
 *  Sous-moteur de protection comportementale.
 *  Calcule les actions ALLOWED et FORBIDDEN à partir de :
 *    - la posture décidée par le Decision Engine
 *    - le marketState courant
 *    - le score de confiance
 *
 *  Pipeline d'appel :
 *    score → posture → action → agent → [allowed / forbidden]
 *
 *  Règle de fusion : en cas de conflit, la prudence prime toujours.
 *  Si une action est dans allowed ET forbidden → elle va en forbidden.
 *
 *  Export public :
 *    computeTradingPolicy(posture, marketState, score)
 *      → { allowed: string[], forbidden: string[], rationale: string }
 * ═══════════════════════════════════════════════════════════════
 */
// ─── Politique par DecisionState — desk-grade ────────────────
// Source d'autorité unique : l'état haut niveau du moteur.
// Chaque état définit exactement ce qui est autorisé ou interdit.
// Règle absolue : forbidden gagne toujours sur allowed.

const DECISION_STATE_POLICY = {

  BLOCKED: {
    allowed:   [
      "Observe",
      "Step Back",
      "Review Context"
    ],
    forbidden: [
      "Buy",
      "Sell",
      "Enter",
      "Add Size",
      "Scale In",
      "Aggressive Entry",
      "Revenge Trade",
      "FOMO Entry",
      "Override Rules"
    ],
    message: "Validation rejected or risk unacceptable. No execution allowed."
  },

  PROTECT: {
    allowed:   [
      "Reduce Risk",
      "Exit Partial",
      "Protect Capital",
      "Tighten Risk",
      "Hedge",
      "Stay Flat"
    ],
    forbidden: [
      "Buy",
      "Aggressive Entry",
      "Add Size",
      "Full Risk",
      "Scale In",
      "FOMO Entry",
      "Overtrade"
    ],
    message: "Defensive context. Capital preservation takes priority."
  },

  WAIT: {
    allowed:   [
      "Observe",
      "Wait Setup",
      "Prepare",
      "Define Levels",
      "Update Watchlist"
    ],
    forbidden: [
      "Buy",
      "Impulsive Sell",
      "Aggressive Entry",
      "Forced Entry",
      "FOMO Entry",
      "Overtrade",
      "Chase Move"
    ],
    message: "No clean execution window yet."
  },

  TENSION: {
    allowed:   [
      "Observe",
      "Reduce Size",
      "Partial Exit",
      "Prepare Entry",
      "Set Alert",
      "Wait Confirmation"
    ],
    forbidden: [
      "Full Position",
      "Aggressive Entry",
      "Add Size",
      "Oversize",
      "Revenge Trade",
      "Blind Entry"
    ],
    message: "Context is becoming actionable, but still incomplete."
  },

  READY: {
    allowed:   [
      "Prepare Entry",
      "Set Alert",
      "Define Entry",
      "Wait Confirmation",
      "Build Plan",
      "Pre-Position Light"
    ],
    forbidden: [
      "Execute Now",
      "FOMO Entry",
      "Oversize",
      "Overtrade",
      "Aggressive Add Size",
      "Blind Market Order"
    ],
    message: "Favorable setup detected. Wait for confirmation before execution."
  },

  ALIGNED: {
    allowed:   [
      "Buy",
      "Sell",
      "Execute Trade",
      "Scale In",
      "Manage Position",
      "Manage Winner",
      "Take Partial Profit",
      "Trail Risk"
    ],
    forbidden: [
      "Revenge Trade",
      "Oversize",
      "FOMO Entry",
      "Late Entry",
      "Full Risk Without Plan"
    ],
    message: "Context validated. Controlled execution allowed."
  }

};

/**
 * Retourne la politique allowed/forbidden à partir du DecisionState.
 *
 * @param {string} decisionState — "BLOCKED" | "PROTECT" | "WAIT" | "READY" | "ALIGNED" | "TENSION"
 * @returns {{ allowed: string[], forbidden: string[] }}
 */
export function getTradingPolicy(decisionState) {
  return DECISION_STATE_POLICY[decisionState] || DECISION_STATE_POLICY.WAIT;
}

/**
 * Vérifie si une action est autorisée selon la politique active.
 * Règle : forbidden prime sur allowed.
 *
 * @param {string} action
 * @param {{ allowed: string[], forbidden: string[] }} policy
 * @returns {boolean}
 */
export function canExecuteAction(action, policy) {
  const a = action.toLowerCase();
  if (policy.forbidden.some(f => a.includes(f.toLowerCase()))) return false;
  if (policy.allowed.some(al => a.includes(al.toLowerCase())))  return true;
  return false;
}

