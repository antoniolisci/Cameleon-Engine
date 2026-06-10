/**
 * ═══════════════════════════════════════════════════════════════
 *  CAMÉLÉON ENGINE — Module logique V4.5
 *  Fichier : moteur.js
 *
 *  API simplifiée, plug & play.
 *  Ne modifie rien. Ne touche pas au HTML/CSS.
 *  Se branche sur l'engine existant via buildPayload() si disponible.
 *
 *  Exports publics :
 *    getMarketState(data)         → "RANGE" | "BREAKOUT" | "REBOUND" | "TREND" | "CHAOS"
 *    getUserProfile(raw?)         → "PRUDENT" | "NORMAL" | "AGRESSIF"
 *    getDecision(state, profile)  → { market_state, posture, actions, interdictions, confidence }
 *    runMoteur(data, profile?)    → même format, entrée unique
 *    fromPayload(enginePayload)   → convertit un payload engine V7 en sortie V4.5
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Matrice des états ────────────────────────────────────────

const STATE_MATRIX = {
  RANGE: {
    posture: "Travailler le range",
    actions: [
      "Placer achat bas de range",
      "Placer vente haut de range",
      "Attendre confirmation de direction"
    ],
    interdictions: [
      "Ne pas FOMO sur fausse cassure",
      "Ne pas entrer au milieu du range",
      "Ne pas surcharger la position"
    ],
    confidence_base: "Moyen"
  },

  BREAKOUT: {
    posture: "Accompagner le mouvement",
    actions: [
      "Entrer avec confirmation de cassure",
      "Prendre profit partiel au prochain niveau",
      "Serrer le stop sous la zone de reclaim"
    ],
    interdictions: [
      "Ne pas acheter le breakout tardif sans reclaim",
      "Ne pas FOMO sur volume excessif",
      "Ne pas ajouter sans confirmation"
    ],
    confidence_base: "Fort"
  },

  REBOUND: {
    posture: "Scalp technique",
    actions: [
      "Scalp sur niveau de support validé",
      "Prendre profit rapidement",
      "Attendre le retest avant de re-entrer"
    ],
    interdictions: [
      "Ne pas tenir une position de rebond trop longtemps",
      "Ne pas vendre le creux sans signal",
      "Ne pas surcharger sur un rebond technique"
    ],
    confidence_base: "Moyen"
  },

  TREND: {
    posture: "Suivre la direction",
    actions: [
      "Entrer sur retracement propre",
      "Laisser courir la position principale",
      "Ajouter sur confirmation de continuation"
    ],
    interdictions: [
      "Ne pas trader contre la tendance dominante",
      "Ne pas sortir trop tôt par impatience",
      "Ne pas FOMO au sommet de l'impulsion"
    ],
    confidence_base: "Fort"
  },

  CHAOS: {
    posture: "Protéger le capital",
    actions: [
      "Réduire l'exposition globale",
      "Annuler les ordres en attente",
      "Attendre la stabilisation du contexte"
    ],
    interdictions: [
      "Ne pas ouvrir de nouvelles positions",
      "Ne pas moyenner à la baisse",
      "Ne pas FOMO sur un rebond volatil"
    ],
    confidence_base: "Faible"
  }
};

// ─── Matrice des profils ──────────────────────────────────────

const PROFILE_MATRIX = {
  PRUDENT: {
    label: "Prudent",
    // En CHAOS : blocage total même pour l'agressif prudent
    blockChaos: true,
    // Dégrade la confiance haute
    downgradeHigh: true,
    // Limite à 2 actions maximum
    maxActions: 2,
    // Interdiction supplémentaire systématique
    extraInterdiction: "Ne pas dépasser 1 % de risque par trade"
  },
  NORMAL: {
    label: "Normal",
    blockChaos: true,
    downgradeHigh: false,
    maxActions: 3,
    extraInterdiction: null
  },
  AGRESSIF: {
    label: "Agressif",
    // AGRESSIF peut agir en CHAOS mais avec contrainte forte
    blockChaos: false,
    downgradeHigh: false,
    maxActions: 3,
    extraInterdiction: null,
    chaosInterdiction: "Taille maximale divisée par deux en contexte instable"
  }
};

// ─── Mapping vers l'engine existant ───────────────────────────

/** Convertit un profil V4.5 en profil engine V7 */
export const PROFILE_TO_ENGINE = {
  PRUDENT:  "PASSIVE",
  NORMAL:   "BALANCED",
  AGRESSIF: "ACTIVE"
};

/** Convertit un profil engine V7 en profil V4.5 */
const ENGINE_TO_PROFILE = {
  PASSIVE:  "PRUDENT",
  BALANCED: "NORMAL",
  ACTIVE:   "AGRESSIF"
};

/** Convertit un état engine V7 en état V4.5 de base */
const ENGINE_TO_STATE = {
  range:       "RANGE",
  compression: "RANGE",
  expansion:   "TREND",   // raffiné par detectBreakout()
  defense:     "CHAOS",
  riskoff:     "CHAOS"
};

// ─── Helpers internes ─────────────────────────────────────────

function scoreToConfidence(score) {
  if (score >= 68) return "Fort";
  if (score >= 42) return "Moyen";
  return "Faible";
}

function detectBreakout(data) {
  return (
    data.structureSignal === "compression_breakout" ||
    data.structureSignal === "real_breakout"        ||
    data.zoneSignal       === "breakout_level"
  );
}

function detectRebound(data) {
  // Rebond technique = sweep_reclaim OU (bas de range + momentum confirmé)
  return (
    data.structureSignal === "sweep_reclaim" ||
    (data.zoneSignal === "low_range" && data.momentumSignal !== "none")
  );
}

// ─── getMarketState ──────────────────────────────────────────

/**
 * Analyse le contexte et détermine l'état de marché V4.5.
 *
 * Priorité de détection :
 *   1. Conditions de CHAOS (surcharge émotionnelle, risque systémique)
 *   2. BREAKOUT (cassure validée sur expansion)
 *   3. TREND (expansion sans cassure directionnelle)
 *   4. REBOUND (signal technique sur range/compression)
 *   5. RANGE (par défaut)
 *
 * @param {Object} data - Champs du formulaire (market, btc, emotion, signals…)
 * @returns {"RANGE"|"BREAKOUT"|"REBOUND"|"TREND"|"CHAOS"}
 */
export function getMarketState(data = {}) {
  if (!data || typeof data !== "object") return "RANGE";

  const market  = String(data.market  || "range").toLowerCase();
  const emotion = String(data.emotion || "neutral").toLowerCase();

  // ── CHAOS : conditions non négociables ─────────────────────
  if (market === "riskoff" || market === "defense") return "CHAOS";
  if (emotion === "stress" || emotion === "fomo")   return "CHAOS";

  // Confluence négative : BTC + Feu + Éther tous faibles
  const confluenceNegative =
    data.btc   === "weak" &&
    data.fire  === "weak" &&
    data.ether === "weak";
  if (confluenceNegative) return "CHAOS";

  // ── EXPANSION : BREAKOUT ou TREND ─────────────────────────
  if (market === "expansion") {
    return detectBreakout(data) ? "BREAKOUT" : "TREND";
  }

  // ── RANGE / COMPRESSION : REBOUND ou RANGE ────────────────
  if (market === "range" || market === "compression") {
    if (detectRebound(data)) return "REBOUND";
    return "RANGE";
  }

  // Fallback depuis mapping engine
  return ENGINE_TO_STATE[market] || "RANGE";
}

// ─── getUserProfile ──────────────────────────────────────────

/**
 * Retourne le profil utilisateur V4.5.
 * Accepte un profil V4.5 direct (PRUDENT/NORMAL/AGRESSIF)
 * ou un profil engine V7 (PASSIVE/BALANCED/ACTIVE).
 * Si rien n'est passé, tente de lire #userProfile dans le DOM.
 *
 * @param {string} [raw] - Valeur brute du profil
 * @returns {"PRUDENT"|"NORMAL"|"AGRESSIF"}
 */
export function getUserProfile(raw) {
  // Lecture DOM si aucun argument
  if (!raw) {
    try {
      const el = document.getElementById("userProfile");
      if (el && el.value) raw = el.value;
    } catch {
      // Environnement non-browser (tests, Node) : silencieux
    }
  }

  const p = String(raw || "NORMAL").toUpperCase().trim();

  // Profil V4.5 direct
  if (p === "PRUDENT" || p === "NORMAL" || p === "AGRESSIF") return p;

  // Profil engine V7
  if (ENGINE_TO_PROFILE[p]) return ENGINE_TO_PROFILE[p];

  return "NORMAL";
}

// ─── getDecision ─────────────────────────────────────────────

/**
 * Génère la décision Caméléon V4.5.
 *
 * @param {"RANGE"|"BREAKOUT"|"REBOUND"|"TREND"|"CHAOS"} state
 * @param {"PRUDENT"|"NORMAL"|"AGRESSIF"} profile
 * @param {Object} [ctx]         - Contexte optionnel
 * @param {number} [ctx.score]   - Score engine (0–100) pour calibrer la confiance
 * @returns {{ market_state: string, posture: string, actions: string[], interdictions: string[], confidence: string }}
 */
export function getDecision(state, profile, ctx = {}) {
  const stateKey   = String(state   || "RANGE").toUpperCase();
  const profileKey = getUserProfile(profile);

  const sc = STATE_MATRIX[stateKey]    || STATE_MATRIX.RANGE;
  const pc = PROFILE_MATRIX[profileKey] || PROFILE_MATRIX.NORMAL;

  // CHAOS + profil qui bloque → actions réduites au minimum
  const hardBlocked = pc.blockChaos && stateKey === "CHAOS";

  // ── Actions ────────────────────────────────────────────────
  const actions = hardBlocked
    ? ["Ne rien faire", "Protéger le capital"]
    : sc.actions.slice(0, pc.maxActions);

  // ── Interdictions ─────────────────────────────────────────
  const interdictions = [...sc.interdictions];

  if (pc.extraInterdiction) {
    interdictions.push(pc.extraInterdiction);
  }
  if (!pc.blockChaos && stateKey === "CHAOS" && pc.chaosInterdiction) {
    interdictions.push(pc.chaosInterdiction);
  }

  // ── Confiance ─────────────────────────────────────────────
  let confidence;

  if (ctx.score !== undefined) {
    // Score fourni par l'engine → conversion directe
    confidence = scoreToConfidence(ctx.score);
  } else {
    confidence = sc.confidence_base;
    // PRUDENT dégrade Fort → Moyen
    if (pc.downgradeHigh && confidence === "Fort") {
      confidence = "Moyen";
    }
  }

  if (hardBlocked) confidence = "Faible";

  // ── Posture ───────────────────────────────────────────────
  const posture = hardBlocked ? "Protéger le capital" : sc.posture;

  return {
    market_state:  stateKey,
    posture,
    actions,
    interdictions,
    confidence
  };
}

// ─── runMoteur ────────────────────────────────────────────────

/**
 * Point d'entrée unique.
 * Analyse les données brutes, détermine état + profil, retourne la décision.
 *
 * Usage minimal :
 *   import { runMoteur } from "./moteur.js";
 *   const result = runMoteur(formData);
 *
 * Usage avec score engine :
 *   const result = runMoteur({ ...formData, _score: enginePayload.score });
 *
 * @param {Object} data             - Données de marché (champs du formulaire)
 * @param {string} [rawProfile]     - Profil brut (prioritaire sur data.userProfile)
 * @returns {{ market_state, posture, actions, interdictions, confidence }}
 */
export function runMoteur(data = {}, rawProfile) {
  const state   = getMarketState(data);
  const profile = getUserProfile(rawProfile || data.userProfile);
  return getDecision(state, profile, {
    score: typeof data._score === "number" ? data._score : undefined
  });
}

// ─── fromPayload ─────────────────────────────────────────────

/**
 * Convertit un payload engine V7 (buildPayload) en sortie V4.5.
 * Permet de brancher le moteur V4.5 sur une lecture engine existante.
 *
 * Usage :
 *   import { buildPayload } from "./engine.js";
 *   import { fromPayload }  from "./moteur.js";
 *
 *   const enginePayload = buildPayload(formValues);
 *   const decision      = fromPayload(enginePayload);
 *
 * @param {Object} payload - Sortie de buildPayload()
 * @returns {{ market_state, posture, actions, interdictions, confidence }}
 */
export function fromPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return getDecision("RANGE", "NORMAL");
  }

  // Reconstituer un data-like depuis le payload
  const syntheticData = {
    market:          payload.market_state,
    btc:             payload.btc_state,
    emotion:         payload.emotion_state,
    structureSignal: payload.setup_inputs?.structure_signal || "none",
    momentumSignal:  payload.setup_inputs?.momentum_signal  || "none",
    zoneSignal:      payload.setup_inputs?.zone_signal      || "middle",
    userProfile:     payload.user_profile,
    fire:            payload.constellium?.fire  || "medium",
    ether:           payload.constellium?.ether || "stable"
  };

  const state   = getMarketState(syntheticData);
  const profile = getUserProfile(payload.user_profile);

  return getDecision(state, profile, { score: payload.score });
}
