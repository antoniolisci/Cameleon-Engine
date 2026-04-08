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

// ─── Règles par posture ───────────────────────────────────────
// Postures issues de decision.js : ACTIVE, PRUDENCE, AGRESSIVE, WAIT, PROTECT
// + alternatives : REDUCE_PARTIAL, SCALP, HOLD, PARTIAL_TAKE_PROFIT

function getPosturePolicy(posture) {
  switch (posture) {

    case "WAIT":
      return {
        allowed:   ["Observe", "Wait Setup"],
        forbidden: ["Buy", "Sell", "Aggressive Entry", "FOMO Entry", "Overtrade"]
      };

    case "PRUDENCE":
      return {
        allowed:   ["Observe", "Wait Setup", "Reduce Size"],
        forbidden: ["Aggressive Entry", "FOMO Entry", "Overtrade", "Oversize"]
      };

    case "ACTIVE":
      return {
        allowed:   ["Buy", "Sell", "Scale In", "Manage Position"],
        forbidden: ["Revenge Trade", "Oversize"]
      };

    case "AGRESSIVE":
      return {
        allowed:   ["Execute Trade", "Scale In", "Manage Winner"],
        forbidden: ["Oversize", "Revenge Trade", "Late Entry"]
      };

    case "PROTECT":
      return {
        allowed:   ["Reduce Risk", "Exit Partial", "Protect Capital", "Hedge"],
        forbidden: ["Buy", "Sell", "Aggressive Entry", "Full Risk", "Add Size"]
      };

    case "REDUCE_PARTIAL":
      return {
        allowed:   ["Exit Partial", "Reduce Risk"],
        forbidden: ["Buy", "Aggressive Entry", "Add Size"]
      };

    case "SCALP":
      return {
        allowed:   ["Quick Scalp", "Take Partial Profit"],
        forbidden: ["Oversize", "FOMO Entry", "Hold Through Noise"]
      };

    case "HOLD":
      return {
        allowed:   ["Hold Position", "Manage Winner"],
        forbidden: ["Aggressive Entry", "Add Size", "FOMO Entry"]
      };

    case "PARTIAL_TAKE_PROFIT":
      return {
        allowed:   ["Take Partial Profit", "Manage Position"],
        forbidden: ["Add Size", "Aggressive Entry"]
      };

    default:
      return {
        allowed:   ["Observe"],
        forbidden: ["Any Trade"]
      };
  }
}

// ─── Règles par marketState ───────────────────────────────────
// États issus du moteur : range, expansion, compression, defense (+ riskoff)

function getMarketPolicy(marketState) {
  switch ((marketState || "").toLowerCase()) {

    case "compression":
      return {
        allowed:   ["Observe", "Wait Breakout", "Prepare"],
        forbidden: ["Forced Entry", "Chase Move"]
      };

    case "expansion":
      return {
        allowed:   ["Execute Trade", "Manage Winner", "Scale In"],
        forbidden: ["Late Entry", "FOMO Entry"]
      };

    case "defense":
    case "riskoff":
      return {
        allowed:   ["Reduce Risk", "Protect Capital", "Exit Partial"],
        forbidden: ["Buy", "Aggressive Entry", "Increase Risk"]
      };

    case "range":
      return {
        allowed:   ["Observe", "Range Trade", "Take Partial Profit"],
        forbidden: ["Breakout Chase", "Oversize"]
      };

    default:
      return {
        allowed:   ["Observe"],
        forbidden: ["Aggressive Entry"]
      };
  }
}

// ─── Fusion des politiques ────────────────────────────────────
// Règle absolue : si une action est dans allowed ET forbidden,
// elle finit dans forbidden (la prudence prime).

function mergePolicies(posturePolicy, marketPolicy) {
  const rawAllowed   = [...new Set([...posturePolicy.allowed,   ...marketPolicy.allowed])];
  const rawForbidden = [...new Set([...posturePolicy.forbidden, ...marketPolicy.forbidden])];

  const hasConflict  = rawAllowed.some(a => rawForbidden.includes(a));
  const finalAllowed = rawAllowed.filter(a => !rawForbidden.includes(a));

  const rationale = hasConflict
    ? "Protective priority applied — market context overrides posture"
    : "Posture and market state aligned";

  return { allowed: finalAllowed, forbidden: rawForbidden, rationale };
}

// ─── Point d'entrée public ────────────────────────────────────

/**
 * Calcule la politique de trading (allowed / forbidden) à partir
 * de la posture, du marketState et du score de confiance.
 *
 * @param {string} posture     — ex: "ACTIVE", "PROTECT", "WAIT"
 * @param {string} marketState — ex: "range", "defense", "compression"
 * @param {number} score       — 0 à 100
 * @returns {{ allowed: string[], forbidden: string[], rationale: string }}
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

// ─── Budget risque recommandé par état ───────────────────────
// Indicateur interne. Non affiché en UI par défaut.
// Disponible pour tout affichage futur ou logique de sizing.

export const STATE_RISK_BUDGET = {
  BLOCKED:  "0%",
  PROTECT:  "0–10%",
  WAIT:     "0%",
  TENSION:  "10–25%",
  READY:    "15–35%",
  ALIGNED:  "35–100%"
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

// ─── Point d'entrée public (posture + marketState) ───────────
export function computeTradingPolicy(posture, marketState, score = 50) {
  const posturePolicy = getPosturePolicy(posture);
  const marketPolicy  = getMarketPolicy(marketState);
  const merged        = mergePolicies(posturePolicy, marketPolicy);
  const state         = (marketState || "").toLowerCase();

  // Score très faible (< 35) : restriction au strict minimum défensif
  if (score < 35) {
    const safeActions = ["Observe", "Protect Capital", "Reduce Risk", "Exit Partial", "Wait Setup"];
    merged.allowed    = merged.allowed.filter(a => safeActions.includes(a));
    if (merged.allowed.length === 0) merged.allowed = ["Observe"];
    merged.rationale  = "Low confidence — actions restricted to capital protection";
    return merged;
  }

  // Rationale contextuelle, lisible pour un trader
  if (state === "defense" || state === "riskoff") {
    merged.rationale = "Defense mode — risk exposure reduced";
  } else if (state === "compression") {
    merged.rationale = "Compression phase — standby, prepare orders only";
  } else if (state === "expansion" && (posture === "ACTIVE" || posture === "AGRESSIVE")) {
    merged.rationale = "Expansion detected — controlled execution allowed";
  } else if (state === "expansion") {
    merged.rationale = "Expansion phase — posture limits full exposure";
  } else if (posture === "PROTECT" || posture === "REDUCE_PARTIAL") {
    merged.rationale = "Protection mode — capital preservation is the priority";
  } else if (posture === "WAIT") {
    merged.rationale = "No valid setup — observation only";
  } else if (posture === "PRUDENCE") {
    merged.rationale = "Caution required — reduced size, no aggressive entry";
  } else if (merged.rationale === "Protective priority applied — market context overrides posture") {
    merged.rationale = "Market context overrides posture — protective priority applied";
  }
  // else: "Posture and market state aligned" (set by mergePolicies)

  return merged;
}
