// src/js/v2/pipeline-v2.js
// Orchestrateur V2 — Phase 1 + Phase 2 actifs
// Chaîne les composants V2 au fur et à mesure de leur activation

import { V2_FLAGS } from './flags.js';
import { computeTensionMap } from './coherence.js';     // Phase 1 — actif
import { computeHierarchy } from './hierarchy.js';      // Phase 2 (T2-01) — actif
// import { createInitialAttentionState, applyAttentionGate } from './attention.js'; // Phase 3
// import { buildExpositionResult } from './exposition.js';                           // Phase 4
// import { captureSnapshot } from './calibration.js';                                // Phase 6

/** @type {import('./types.js').AttentionState|null} */
let _attentionState = null;

/**
 * Exécute la pipeline V2 sur le payload V1.
 * Retourne null si V2 désactivé.
 *
 * Phase 1 : tensionMap calculé, visible Debug uniquement
 * Phase 2 (T2-01) : hierarchyResult calculé, visible Debug uniquement
 * Phase 3–4 : inertes (null)
 *
 * @param {object} payloadV1 - Payload produit par buildPayload()
 * @param {Function|null} [behaviorGetter=null] - Getter profil comportemental
 * @returns {{ tensionMap, hierarchyResult, attentionResult, expositionResult }|null}
 */
export function runV2(payloadV1, behaviorGetter = null) {
  if (!V2_FLAGS.V2_ENABLED) return null;

  // ── Phase 1 — Couche cohérence ────────────────────────────────────────────
  if (!V2_FLAGS.V2_COHERENCE) return null;
  const tensionMap = computeTensionMap(payloadV1, behaviorGetter);

  // ── Phase 2 — Hiérarchie ─────────────────────────────────────────────────
  if (!V2_FLAGS.V2_HIERARCHY) {
    return { tensionMap, hierarchyResult: null, attentionResult: null, expositionResult: null };
  }
  const hierarchyResult = computeHierarchy(tensionMap);

  // ── Phase 3 — Attention (inerte) ─────────────────────────────────────────
  // if (!_attentionState) _attentionState = createInitialAttentionState();
  // if (!V2_FLAGS.V2_ATTENTION) {
  //   return { tensionMap, hierarchyResult, attentionResult: null, expositionResult: null };
  // }
  // const { result: attentionResult, nextState } = applyAttentionGate(
  //   hierarchyResult?.winner ?? null, _attentionState
  // );
  // _attentionState = nextState;

  // ── Phase 4 — Explicabilité (inerte) ─────────────────────────────────────
  // if (!V2_FLAGS.V2_EXPOSITION) {
  //   return { tensionMap, hierarchyResult, attentionResult, expositionResult: null };
  // }
  // const expositionResult = buildExpositionResult(
  //   hierarchyResult?.winner ?? null, attentionResult?.should_expose ?? false
  // );
  // return { tensionMap, hierarchyResult, attentionResult, expositionResult };

  return {
    tensionMap,
    hierarchyResult,
    attentionResult: null,
    expositionResult: null,
  };
}

/**
 * Réinitialise l'état de session (à appeler au rechargement).
 */
export function resetV2SessionState() {
  _attentionState = null;
}
