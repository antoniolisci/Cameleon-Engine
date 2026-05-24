// src/js/v2/attention.js
// Gestion de l'attention — V2
// SQUELETTE Phase 0 — logique active en Phase 3

/** @returns {import('./types.js').AttentionState} */
export function createInitialAttentionState() {
  return { expositions_window: [], last_exposed_id: null, consecutive_silent: 0 };
}

/**
 * @param {import('./types.js').TensionDetail|null} winner
 * @param {import('./types.js').AttentionState} state
 * @returns {{ result: import('./types.js').AttentionResult|null, nextState: import('./types.js').AttentionState }}
 */
export function applyAttentionGate(winner, state) {
  // TODO Phase 3 — implémenter le gate et la fenêtre glissante WINDOW_SIZE=5
  return { result: null, nextState: state };
}
