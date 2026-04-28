/**
 * behavior-bridge.js
 *
 * Translation layer between the historical Behavior Analysis module
 * (src/js/behavior/) and the instant Behavior Guard scale used in engine.js.
 *
 * ISOLATION CONTRACT:
 * - This file does NOT import from engine.js
 * - This file does NOT import from render.js
 * - This file does NOT overwrite payload.behavior.overtradingLevel
 * - This file is a read-only translation layer — it produces a derived value only
 *
 * FUTURE INTEGRATION:
 * When the historical module is connected to the main engine, the merge point
 * is engine.js → buildPayload() → behavior: { ... }.
 * The merge strategy (max, weighted average, separate field) must be defined
 * explicitly at that point. This bridge must never bypass that decision.
 * See: src/js/behavior/README.md
 */

// ── Scale reference ────────────────────────────────────────────────────────
//
//  Historical module output  │  Guard level  │  Instant Guard label
//  ─────────────────────────┼───────────────┼──────────────────────
//  score >= 85              │       1       │  Calme
//  score >= 70              │       2       │  Veille active
//  score >= 55              │       3       │  Fixation
//  score >= 40              │       4       │  Sur-engagement
//  score <  40              │       5       │  Rupture
//
// ──────────────────────────────────────────────────────────────────────────

/**
 * Converts a historical behavior score (0–100) into a Behavior Guard level (1–5).
 *
 * The historical score is produced by scoring.js → computeScore().
 * The guard level matches the scale used by engine.js → buildPayload() →
 * payload.behavior.overtradingLevel and OVERTRADING_DICT in overtrading-dictionary.js.
 *
 * @param {number} score  — Raw score from computeScore(), expected range 0–100.
 * @returns {number}      — Integer in [1, 5].
 */
export function mapBehaviorScoreToGuardLevel(score) {
  // Guard invalid inputs — default to level 1 (Calme / no signal)
  if (typeof score !== 'number' || isNaN(score)) return 1;

  // Clamp out-of-range values before mapping
  if (score > 100) return 1;
  if (score < 0)   return 5;

  if (score >= 85) return 1;
  if (score >= 70) return 2;
  if (score >= 55) return 3;
  if (score >= 40) return 4;
  return 5;
}

/**
 * Builds a structured bridge output from the historical score result.
 *
 * Input is the object returned by computeScore() in analytics/scoring.js:
 * {
 *   score:          number (0–100),
 *   profile:        { key, label, min, color },
 *   dominantRisk:   string | null,
 *   interpretation: string[]
 * }
 *
 * Output is a self-contained descriptor ready to be read by a future merge
 * strategy in engine.js. It does NOT modify any existing payload field.
 *
 * @param {object} scoreResult  — Return value of computeScore().
 * @returns {object}            — Bridge output descriptor.
 */
export function buildBehaviorBridgeOutput(scoreResult) {
  const score = scoreResult?.score;
  const guardLevel = mapBehaviorScoreToGuardLevel(score);

  return {
    // Raw 0–100 score from the historical analysis pipeline
    historicalScore: typeof score === 'number' && !isNaN(score) ? score : null,

    // Translated level on the 1–5 Behavior Guard scale
    // NOTE: this does NOT overwrite payload.behavior.overtradingLevel
    // A merge strategy must be applied explicitly before any integration
    guardLevel,

    // Dominant pattern identified by the historical module (string or null)
    dominantRisk: scoreResult?.dominantRisk ?? null,

    // Identifies the origin of this value for traceability in any future merge
    source: 'historical_behavior_analysis'
  };
}
