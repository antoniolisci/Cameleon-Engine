/**
 * ═══════════════════════════════════════════════════════════════
 *  CAMÉLÉON ENGINE — execution-confidence.js
 *
 *  Curseur de confiance d'exécution (0–100).
 *
 *  Ce score NE modifie PAS la décision moteur.
 *  Il lit l'état décisionnel et comportemental pour produire
 *  un niveau de confiance graduel — alternative aux labels binaires.
 *
 *  Inputs  : payload (decisionState + engagement_level)
 *            bhvState (string — résolu par l'appelant via getBehaviorState)
 *
 *  Output  : { score: Number, label: String, tone: String, phrase: String }
 *
 *  Exports publics :
 *    computeExecutionConfidence(payload, bhvState) → ConfidenceResult
 * ═══════════════════════════════════════════════════════════════
 */

// ── Base par decisionState ────────────────────────────────────────────────────

const BASE_SCORE = {
  ALIGNED: 90,
  TENSION: 65,
  READY:   50,
  WAIT:    30,
  PROTECT: 15,
  BLOCKED:  0,
};

// ── Multiplicateur par engagement_level ───────────────────────────────────────

const ENGAGEMENT_MULTIPLIER = {
  FULL:    1.0,
  NEUTRAL: 0.9,
  REDUCED: 0.7,
  MINIMAL: 0.4,
  NONE:    0.0,
};

// ── Delta comportemental ──────────────────────────────────────────────────────

const BHV_DELTA = {
  CALME:       +5,
  NEUTRE:       0,
  STRESS:     -10,
  FOMO:       -15,
  OVERTRADING:-25,
};

// ── Labels selon score ────────────────────────────────────────────────────────

function resolveLabel(score) {
  if (score >= 80) return "Confiance élevée";
  if (score >= 55) return "Confiance partielle";
  if (score >= 30) return "Confiance réduite";
  if (score >= 1)  return "Confiance faible";
  return "Hors condition";
}

// ── Tone selon score (data-attribute CSS) ─────────────────────────────────────

function resolveTone(score) {
  if (score >= 80) return "high";
  if (score >= 55) return "moderate";
  if (score >= 30) return "low";
  if (score >= 1)  return "minimal";
  return "none";
}

// ── Phrase narrative factuelle ────────────────────────────────────────────────

function resolvePhrase(state, engagementLevel, score) {
  if (state === "BLOCKED")                            return "Conditions non réunies — aucun engagement recommandé.";
  if (state === "PROTECT")                            return "Contexte défensif — réduire l'exposition en priorité.";
  if (state === "WAIT" && engagementLevel === "MINIMAL") return "Structure en formation — observation active uniquement.";
  if (state === "WAIT")                               return "Attente active — préparer sans anticiper.";
  if (state === "READY")                              return "Setup proche — entrée possible sous confirmation.";
  if (state === "TENSION")                            return "Fenêtre ouverte avec friction — discipline requise.";
  if (state === "ALIGNED" && engagementLevel === "REDUCED") return "Conditions réunies, engagement partiel recommandé.";
  if (state === "ALIGNED")                            return "Lecture claire — conditions optimales d'exécution.";
  return "En attente de lecture complète.";
}

// ── Calcul principal ──────────────────────────────────────────────────────────

/**
 * @param {Object} payload      — payload moteur complet
 * @param {string} bhvState     — état behavioral résolu par l'appelant (CALME/NEUTRE/STRESS/FOMO/OVERTRADING)
 * @returns {{ score: number, label: string, tone: string, phrase: string }}
 */
export function computeExecutionConfidence(payload, bhvState) {
  const state = payload?.decisionState?.state ?? "WAIT";
  const el    = payload?.engagement_level     ?? "NEUTRAL";

  const base       = BASE_SCORE[state]              ?? 30;
  const multiplier = ENGAGEMENT_MULTIPLIER[el]      ?? 0.9;
  const bhvDelta   = BHV_DELTA[bhvState]            ?? 0;

  const raw   = base * multiplier + bhvDelta;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    score,
    label:  resolveLabel(score),
    tone:   resolveTone(score),
    phrase: resolvePhrase(state, el, score),
  };
}
