/**
 * ═══════════════════════════════════════════════════════════════
 *  CAMÉLÉON ENGINE — friction.js
 *
 *  Friction graduelle — ralentisseur cognitif.
 *
 *  Ce module ne bloque aucune action. Il introduit un délai
 *  temporel proportionnel au score de confiance d'exécution,
 *  juste assez pour que la conscience rattrape l'impulsion.
 *
 *  Règles absolues :
 *  - La callback s'exécute toujours, quel que soit le score
 *  - Aucun état global — la friction est stateless
 *  - Aucun accès au moteur, au scoring, au localStorage
 *  - Double-clic neutralisé par btn.disabled pendant le délai
 *
 *  Exports publics :
 *    FRICTION_DELAY(score)              → délai en ms (0 / 1500 / 3000 / 5000)
 *    getFrictionMessage(context, score) → string message factuel
 *    applyFriction(score, btn, messageContainerId, callback)
 * ═══════════════════════════════════════════════════════════════
 */

// ── Grille de délai par score ─────────────────────────────────────────────────

/**
 * @param {number} score — 0 à 100
 * @returns {number} délai en millisecondes
 */
export function FRICTION_DELAY(score) {
  if (score >= 80) return 0;
  if (score >= 55) return 1500;
  if (score >= 30) return 3000;
  return 5000;
}

// ── Messages factuels par contexte ───────────────────────────────────────────

const MESSAGES = {
  snapshot: {
    high:     null,  // score >= 80 — aucun message
    moderate: (s) => `Enregistrement dans un instant — confiance : ${s}%.`,
    low:      (s) => `Confiance réduite (${s}%) — état enregistré pour suivi comportemental.`,
    minimal:  (s) => `Confiance faible (${s}%) — enregistrement en cours.`,
    none:           `État hors condition enregistré.`,
  },
  offensive: {
    high:     null,
    moderate: (s) => `Mode offensif — confiance actuelle : ${s}%.`,
    low:      (s) => `Confiance réduite — posture offensive disponible. Prendre un moment.`,
    minimal:  (s) => `Confiance faible (${s}%) — panel disponible dans quelques secondes.`,
    none:           `Hors condition d'exécution — navigation en cours.`,
  },
};

function resolveTier(score) {
  if (score >= 80) return 'high';
  if (score >= 55) return 'moderate';
  if (score >= 30) return 'low';
  if (score >= 1)  return 'minimal';
  return 'none';
}

/**
 * @param {'snapshot'|'offensive'} context
 * @param {number} score
 * @returns {string|null}
 */
export function getFrictionMessage(context, score) {
  const tier = resolveTier(score);
  const entry = MESSAGES[context]?.[tier];
  if (!entry) return null;
  return typeof entry === 'function' ? entry(score) : entry;
}

// ── Application de la friction ────────────────────────────────────────────────

/**
 * @param {number}      score             — score de confiance 0–100
 * @param {HTMLElement} btn               — bouton déclencheur (sera disabled pendant le délai)
 * @param {string}      messageContainerId — ID du div.friction-message adjacent
 * @param {Function}    callback          — action à exécuter après le délai
 * @param {'snapshot'|'offensive'} context — contexte de friction pour le message
 */
export function applyFriction(score, btn, messageContainerId, callback, context) {
  const delay = FRICTION_DELAY(score);
  const msg   = getFrictionMessage(context, score);

  const container = document.getElementById(messageContainerId);

  // Afficher le message si présent
  if (container && msg) {
    container.textContent = msg;
    container.hidden = false;
  }

  if (delay === 0) {
    // Immédiat — aucune friction visuelle
    callback();
    if (container) { container.hidden = true; container.textContent = ''; }
    return;
  }

  // Délai — grise le bouton, maintient le focus
  if (btn) {
    btn.disabled = true;
    btn.dataset.frictionState = 'pending';
  }

  const timer = setTimeout(() => {
    callback();

    // Nettoyage
    if (btn) {
      btn.disabled = false;
      delete btn.dataset.frictionState;
      btn.focus();
    }
    if (container) {
      container.hidden = true;
      container.textContent = '';
    }
  }, delay);

  // Guard : si le bouton est retiré du DOM pendant le délai, annuler proprement
  if (btn) {
    btn._frictionTimer = timer;
  }
}
