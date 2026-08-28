/**
 * Couche comportementale — Caméléon Engine
 *
 * Détecte les patterns de risque à partir des actions utilisateur.
 * Calcule un score (0–100) et dérive un ton adaptatif.
 *
 * Indépendant du moteur. Branché sur refresh() dans render.js.
 *
 * Signaux détectés :
 *   RÉPÉTITION     — même état + même validation plusieurs fois   → +20
 *   DÉSALIGNEMENT  — état "attente" mais l'utilisateur insiste    → +25
 *   DÉGRADATION    — l'émotion empire entre deux appels           → +30
 *   IMPULSIVITÉ    — interactions trop rapprochées (<8s)          → +25
 *
 * Decay : -10 pts toutes les 2 minutes d'inactivité (max 20 min → 0)
 *
 * Score → Ton :
 *   0–29  → calm
 *   30–59 → hesitation
 *   60–79 → tension
 *   80–100 → tilt
 */

// États de marché qui imposent l'attente
const WAIT_STATES = new Set(["range", "compression", "defense", "riskoff", "instable"]);

// Sévérité émotionnelle (pour détecter la dégradation)
const EMOTION_SEVERITY = { calm: 0, neutral: 1, stress: 2, fomo: 3 };

// Seuils de détection
const IMPULSE_THRESHOLD_MS = 8000;  // < 8s entre deux interactions = impulsif
const DECAY_INTERVAL_MS    = 120000; // decay toutes les 2 minutes
const DECAY_AMOUNT         = 10;     // points perdus par intervalle

// Poids des signaux
const SIGNAL_WEIGHTS = {
  repetition:    20,
  misalignment:  25,
  degradation:   30,
  impulse:       25
};

// État interne du module (singleton)
let _s = {
  marketState:     null,
  validationState: null,
  sameStateCount:  0,
  emotionHistory:  [],  // dernières émotions (max 3)
  timestamps:      [],  // derniers appels (max 5)
  score:           0,
  lastDecayAt:     Date.now()
};

// --- Decay ---

function _applyDecay() {
  const now = Date.now();
  const ticks = Math.floor((now - _s.lastDecayAt) / DECAY_INTERVAL_MS);
  if (ticks <= 0) return;
  _s.score = Math.max(0, _s.score - ticks * DECAY_AMOUNT);
  _s.lastDecayAt = now + (ticks * DECAY_INTERVAL_MS) - (now - _s.lastDecayAt);
}

// --- Détection des signaux ---

function _detectRepetition(marketState, validationState) {
  if (marketState === _s.marketState && validationState === _s.validationState) {
    _s.sameStateCount++;
  } else {
    _s.sameStateCount = 0;
  }
  return _s.sameStateCount >= 2 ? SIGNAL_WEIGHTS.repetition : 0;
}

function _detectMisalignment(marketState) {
  if (WAIT_STATES.has(marketState) && _s.sameStateCount >= 1) {
    return SIGNAL_WEIGHTS.misalignment;
  }
  return 0;
}

function _detectDegradation(emotionState) {
  _s.emotionHistory.push(emotionState);
  if (_s.emotionHistory.length > 3) _s.emotionHistory.shift();

  if (_s.emotionHistory.length < 2) return 0;

  const prev = EMOTION_SEVERITY[_s.emotionHistory[_s.emotionHistory.length - 2]] ?? 0;
  const curr = EMOTION_SEVERITY[emotionState] ?? 0;
  return curr > prev ? SIGNAL_WEIGHTS.degradation : 0;
}

function _detectImpulse() {
  const now = Date.now();
  _s.timestamps.push(now);
  if (_s.timestamps.length > 5) _s.timestamps.shift();

  if (_s.timestamps.length < 2) return 0;

  const gap = now - _s.timestamps[_s.timestamps.length - 2];
  return gap < IMPULSE_THRESHOLD_MS ? SIGNAL_WEIGHTS.impulse : 0;
}

// --- API publique ---

/**
 * À appeler à chaque refresh() avec les données du payload courant.
 *
 * @param {object} snapshot
 * @param {string} snapshot.marketState    — payload.market_state
 * @param {string} snapshot.emotionState   — payload.emotion_state
 * @param {string} snapshot.validationState — payload.validation?.state
 */
export function updateBehavior({ marketState, emotionState, validationState }) {
  _applyDecay();

  const delta =
    _detectImpulse() +
    _detectRepetition(marketState, validationState) +
    _detectMisalignment(marketState) +
    _detectDegradation(emotionState);

  _s.score        = Math.min(100, _s.score + delta);
  _s.marketState  = marketState;
  _s.validationState = validationState;
}

/**
 * Retourne le score de risque comportemental (0–100), avec decay appliqué.
 */
export function getRiskScore() {
  _applyDecay();
  return _s.score;
}

/**
 * Retourne le ton adaptatif dérivé du score comportemental.
 * Prioritaire sur l'emotion_state déclaré.
 *
 * @returns {"calm"|"hesitation"|"tension"|"tilt"}
 */
export function getAdaptiveTone() {
  const score = getRiskScore();
  if (score >= 80) return "tilt";
  if (score >= 60) return "tension";
  if (score >= 30) return "hesitation";
  return "calm";
}

/**
 * Remet le comportement à zéro (ex: après une pause explicite).
 */
export function resetBehavior() {
  _s = {
    marketState:     null,
    validationState: null,
    sameStateCount:  0,
    emotionHistory:  [],
    timestamps:      [],
    score:           0,
    lastDecayAt:     Date.now()
  };
}
