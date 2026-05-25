// src/js/v2/attention.js
// Gestion de l'attention — V2
// T2-02 — actif en shadow mode

// D-ATT-01 provisoire — à calibrer terrain (test réel V0)
const WINDOW_SIZE   = 5; // fenêtre glissante : N dernières soumissions
const DECLINE_FAST  = 2; // cycles sans exposition → elevated → high
const DECLINE_FULL  = 4; // cycles sans exposition → high → normal

/**
 * Détermine attention_level depuis expositions_window.
 * Table d'élévation spec § Règles d'élévation.
 * @param {number} w
 * @returns {'normal'|'high'|'elevated'}
 */
function levelFromWindow(w) {
  if (w >= 3) return 'elevated';
  if (w >= 2) return 'high';
  return 'normal';
}

/** @returns {import('./types.js').AttentionState} */
export function createInitialAttentionState() {
  return {
    expositions_session: 0,
    expositions_window: 0,
    attention_level: 'normal',
    cycles_since_last_exposition: 0,
  };
}

/**
 * Gate final V2 — contrôle le bruit séquentiel.
 *
 * Séquence garantie par cycle (spec § Garde-fou anti-oscillation) :
 *   1. Déclin éventuel (attention_level + expositions_window ensemble)
 *   2. Lecture du niveau courant
 *   3. Décision should_expose
 *   4. Mise à jour des compteurs
 *
 * Exception absolue : winner.is_blocking === true → should_expose = true
 * quelles que soient les conditions (spec § Position dans la pipeline).
 *
 * Near-misses (tensions absorbées par la hiérarchie) ne comptent pas —
 * seules les expositions effectives incrémentent expositions_window (D-ATT-02).
 *
 * @param {import('./types.js').TensionDetail|null} winner
 * @param {import('./types.js').AttentionState} state
 * @returns {{ result: import('./types.js').AttentionResult, nextState: import('./types.js').AttentionState }}
 */
export function applyAttentionGate(winner, state) {
  let {
    expositions_session,
    expositions_window,
    attention_level,
    cycles_since_last_exposition: cycles,
  } = state;

  // ── 1. Déclin ────────────────────────────────────────────────────────────
  // Les deux conditions sont évaluées séquentiellement — une seule descente
  // par cycle (garde-fou anti-oscillation).
  // expositions_window est capé au seuil correspondant pour rester synchronisé
  // avec attention_level.
  if (attention_level === 'elevated' && cycles >= DECLINE_FAST) {
    attention_level   = 'high';
    expositions_window = Math.min(expositions_window, 2);
  }
  if (attention_level === 'high' && cycles >= DECLINE_FULL) {
    attention_level   = 'normal';
    expositions_window = Math.min(expositions_window, 1);
  }

  // ── 2. Niveau courant (déjà dans attention_level après déclin) ───────────

  // ── 3. Décision should_expose ────────────────────────────────────────────
  let should_expose;

  if (winner === null) {
    // Aucune tension produite par la hiérarchie
    should_expose = false;
  } else if (winner.is_blocking === true) {
    // Exception absolue — contradiction bloquante passe toujours (D-ATT hors table)
    should_expose = true;
  } else if (attention_level === 'normal') {
    // Toutes les tensions validées passent
    should_expose = true;
  } else if (attention_level === 'high') {
    // Critère primaire : winner.type (spec § Règles d'élévation)
    //   structural / critical / blocking → passent
    //   contextual ou tout autre type explicite → supprimé silencieusement
    // Fallback : winner.type absent → severity === 'high' (tensions non encore typées)
    const HIGH_PASS_TYPES = ['structural', 'critical', 'blocking'];
    if (!winner.type) {
      should_expose = (winner.severity === 'high'); // fallback type absent
    } else {
      should_expose = HIGH_PASS_TYPES.includes(winner.type);
    }
  } else {
    // elevated — seule is_blocking passe (déjà traité ci-dessus)
    should_expose = false;
  }

  // ── 4. Mise à jour des compteurs ─────────────────────────────────────────
  // suppressed_winner : disponible dans le panel Debug uniquement (D-ATT-04)
  const suppressed_winner = (!should_expose && winner !== null) ? winner : null;

  if (should_expose) {
    expositions_window = Math.min(expositions_window + 1, WINDOW_SIZE);
    expositions_session += 1;
    cycles = 0;
    // Réévaluation du niveau après élévation
    attention_level = levelFromWindow(expositions_window);
  } else {
    cycles += 1;
    // expositions_window inchangé — near-misses ne comptent pas (D-ATT-02)
  }

  return {
    result: {
      attention_level,
      should_expose,
      suppressed_winner,
    },
    nextState: {
      expositions_session,
      expositions_window,
      attention_level,
      cycles_since_last_exposition: cycles,
    },
  };
}
