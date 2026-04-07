/**
 * ═══════════════════════════════════════════════════════════════
 *  CAMÉLÉON ENGINE — confidence-score.js
 *
 *  Module "Confidence Score" — thermomètre de lisibilité du marché.
 *  Mesure la qualité du contexte, pas la direction du prix.
 *
 *  Ce score NE donne PAS de signal d'achat ou de vente.
 *  Il indique uniquement si le marché est lisible ou dangereux.
 *  Utilisation recommandée : filtre d'entrée (ignorer si score < 50).
 *
 *  Facteurs et pondérations :
 *    trend      30% — force directionnelle (ex: pente EMA, ADX normalisé)
 *    structure  30% — clarté structure (HH/HL, LH/LL, rupture propre)
 *    volatility 25% — zone idéale paramétrable (ni trop calme, ni chaotique)
 *    volume     15% — volume relatif (confirmation du mouvement)
 *
 *  Exports publics :
 *    DEFAULT_VOLATILITY_CONFIG              — config volatilité par défaut
 *    scoreVolatility(v, config)             → 0–100
 *    computeConfidenceScore(inputs, config) → { score, label, actionBias, tone, breakdown }
 *    interpretScore(score)                  → { label, actionBias, tone }
 *    getScoreTone(score)                    → "danger"|"warning"|"prudence"|"favorable"
 *    getAllowedActions(mode)                 → string[]
 *    resolveMode({ score, marketState })    → { mode, action, message }
 *    buildMarketContext(inputs, state)      → objet unifié complet
 *    getExecutionPolicy(result)             → { allowed, reason }
 *    renderConfidencePanel(inputs, state)   → injecte dans le DOM
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Configuration de volatilité par défaut ───────────────────
// Zone idéale : entre 30 et 70 (sur une échelle 0–100 normalisée).
// En dehors de cette zone, le score décroit linéairement.
// Paramétrable selon le timeframe ou l'actif.

export const DEFAULT_VOLATILITY_CONFIG = {
  idealMin: 30,   // volatilité minimale acceptable
  idealMax: 70,   // volatilité maximale acceptable
};

// ─── Pondérations ─────────────────────────────────────────────

const WEIGHTS = {
  trend:      0.30,
  structure:  0.30,
  volatility: 0.25,
  volume:     0.15,
};

// ─── Seuils d'interprétation ──────────────────────────────────

const THRESHOLDS = [
  { min: 80,  max: 100, label: "Setup favorable",  actionBias: "favorable", tone: "favorable" },
  { min: 60,  max: 80,  label: "Setup acceptable", actionBias: "prudence",  tone: "prudence"  },
  { min: 40,  max: 60,  label: "Attente",          actionBias: "wait",      tone: "warning"   },
  { min: 0,   max: 40,  label: "Danger",           actionBias: "stand-by",  tone: "danger"    },
];

// ─── Fallback ─────────────────────────────────────────────────

const SCORE_FALLBACK = {
  score:      0,
  label:      "Danger",
  actionBias: "stand-by",
  tone:       "danger",
  breakdown:  { trend: 0, structure: 0, volatility: 0, volume: 0 },
};

// ─── Utilitaires internes ─────────────────────────────────────

/**
 * Clamp une valeur entre min et max.
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Arrondit à l'entier le plus proche.
 * @param {number} v
 * @returns {number}
 */
function round(v) {
  return Math.round(v);
}

// ─── scoreVolatility ──────────────────────────────────────────

/**
 * Transforme une valeur brute de volatilité (0–100) en score de qualité (0–100).
 *
 * Logique :
 *   - Dans [idealMin, idealMax]       → score = 100  (zone idéale)
 *   - En dessous de idealMin          → décroissance linéaire vers 0
 *   - Au dessus de idealMax           → décroissance linéaire vers 0
 *
 * Exemples avec config par défaut { idealMin: 30, idealMax: 70 } :
 *   volatility = 0   → 0    (marché endormi)
 *   volatility = 15  → 50   (trop calme)
 *   volatility = 50  → 100  (zone idéale)
 *   volatility = 85  → 50   (trop chaotique)
 *   volatility = 100 → 0    (chaos total)
 *
 * @param {number} v            — valeur brute de volatilité (0–100)
 * @param {object} config       — { idealMin, idealMax }
 * @returns {number}            — score de qualité (0–100, entier)
 */
export function scoreVolatility(v, config = DEFAULT_VOLATILITY_CONFIG) {
  const raw      = clamp(v);
  const { idealMin, idealMax } = config;

  if (raw >= idealMin && raw <= idealMax) return 100;
  if (raw < idealMin)  return round((raw / idealMin) * 100);
  return round(((100 - raw) / (100 - idealMax)) * 100);
}

// ─── interpretScore ───────────────────────────────────────────

/**
 * Retourne le label, actionBias et tone pour un score donné.
 *
 * @param {number} score — 0 à 100
 * @returns {{ label: string, actionBias: string, tone: string }}
 */
export function interpretScore(score) {
  const s = clamp(score);
  const threshold = THRESHOLDS.find(t => s >= t.min && s < t.max)
    ?? THRESHOLDS[THRESHOLDS.length - 1];
  return {
    label:      threshold.label,
    actionBias: threshold.actionBias,
    tone:       threshold.tone,
  };
}

// ─── getScoreTone ─────────────────────────────────────────────

/**
 * Retourne uniquement le ton associé au score.
 * Utile pour piloter la couleur ou le style d'un élément UI.
 *
 * @param {number} score — 0 à 100
 * @returns {"danger" | "warning" | "prudence" | "favorable"}
 */
export function getScoreTone(score) {
  return interpretScore(score).tone;
}

// ─── computeConfidenceScore ───────────────────────────────────

/**
 * Calcule le Confidence Score à partir des 4 facteurs du marché.
 *
 * Chaque facteur est une valeur normalisée entre 0 et 100.
 * La volatilité est transformée via scoreVolatility() avant pondération
 * afin de pénaliser les extrêmes (trop calme ou trop chaotique).
 *
 * @param {{
 *   trend:      number,  — force directionnelle      (0 = aucune, 100 = forte)
 *   structure:  number,  — clarté structure HH/HL    (0 = absente, 100 = parfaite)
 *   volatility: number,  — volatilité brute normalisée (0 = calme total, 100 = chaos)
 *   volume:     number,  — volume relatif             (0 = absent, 100 = fort)
 * }} inputs
 *
 * @param {object} [volatilityConfig] — { idealMin, idealMax }, défaut { 30, 70 }
 *
 * @returns {{
 *   score:      number,
 *   label:      string,
 *   actionBias: string,
 *   tone:       string,
 *   breakdown:  { trend: number, structure: number, volatility: number, volume: number }
 * }}
 */
export function computeConfidenceScore(inputs, volatilityConfig = DEFAULT_VOLATILITY_CONFIG) {
  if (!inputs || typeof inputs !== "object") return { ...SCORE_FALLBACK };

  const trendScore      = clamp(inputs.trend      ?? 0);
  const structureScore  = clamp(inputs.structure  ?? 0);
  const volScore        = scoreVolatility(clamp(inputs.volatility ?? 0), volatilityConfig);
  const volumeScore     = clamp(inputs.volume     ?? 0);

  const raw =
    trendScore     * WEIGHTS.trend     +
    structureScore * WEIGHTS.structure +
    volScore       * WEIGHTS.volatility +
    volumeScore    * WEIGHTS.volume;

  const score       = round(clamp(raw));
  const interpreted = interpretScore(score);

  return {
    score,
    label:      interpreted.label,
    actionBias: interpreted.actionBias,
    tone:       interpreted.tone,
    breakdown: {
      trend:      round(trendScore),
      structure:  round(structureScore),
      volatility: round(volScore),
      volume:     round(volumeScore),
    },
  };
}

// ─── renderConfidenceScore ────────────────────────────────────

/**
 * Injecte le Confidence Score dans le DOM du cockpit.
 *
 * Attend les éléments suivants dans le HTML :
 *   .confidence-panel   — conteneur principal (data-tone cible)
 *   #cs-score           — affichage du score numérique
 *   #cs-label           — affichage du label texte
 *   #cs-bar             — barre de progression (width en %)
 *
 * Sort proprement sans erreur si le panel est absent du DOM.
 *
 * @param {object} inputs — même shape que computeConfidenceScore()
 * @param {object} [volatilityConfig] — config optionnelle de volatilité
 * @returns {{ score, label, actionBias, tone, breakdown } | undefined}
 */
export function renderConfidenceScore(inputs, volatilityConfig = DEFAULT_VOLATILITY_CONFIG) {
  const panel = document.querySelector(".confidence-panel");
  if (!panel) return;

  const result = computeConfidenceScore(inputs, volatilityConfig);

  const elScore = document.getElementById("cs-score");
  const elLabel = document.getElementById("cs-label");
  const elBar   = document.getElementById("cs-bar");

  if (elScore) elScore.textContent = result.score;
  if (elLabel) elLabel.textContent = result.label;
  if (elBar)   elBar.style.width   = `${result.score}%`;

  panel.dataset.tone = result.tone;

  if (result.score < 50) {
    console.warn("[ConfidenceScore] Contexte trop faible — setup ignoré.");
  }

  return result;
}

// ─── Action mapping ───────────────────────────────────────────

const MODE_ACTION = {
  WAIT:    "NO_TRADE",
  CAUTION: "LIMITED_ENTRIES",
  ACTIVE:  "FULL_SETUP",
};

// ─── resolveMode ──────────────────────────────────────────────

/**
 * Résout le mode opérationnel à partir du score et de l'état de marché.
 *
 * États reconnus : "chaos", "range", "compression", "expansion",
 *                  "defense", "riskoff", "trend", "breakout"
 * États chaotiques/défensifs : chaos, defense, riskoff → toujours WAIT
 * Incohérence détectée (état dangereux + score élevé) → CAUTION
 *
 * @param {{ score: number, marketState: string }} params
 * @returns {{ mode: "WAIT"|"CAUTION"|"ACTIVE", action: string, message: string }}
 */
export function resolveMode({ score, marketState }) {
  const s     = clamp(score);
  const state = String(marketState || "").toLowerCase();

  const CHAOTIC_STATES = new Set(["chaos", "defense", "riskoff"]);
  const TREND_STATES   = new Set(["trend", "expansion", "breakout"]);

  /** @param {"WAIT"|"CAUTION"|"ACTIVE"} mode @param {string} message */
  const out = (mode, message) => ({ mode, action: MODE_ACTION[mode], message });

  if (CHAOTIC_STATES.has(state)) {
    if (s > 70) return out("CAUTION", "Score élevé mais marché instable — contexte incohérent, rester prudent.");
    return out("WAIT", "Marché en mode défensif — aucune initiative.");
  }

  if (state === "range") {
    if (s >= 60) return out("CAUTION", "Range lisible — setup possible, rester sélectif.");
    return out("WAIT", "Range + contexte faible — pas d'avantage clair.");
  }

  if (state === "compression") {
    if (s >= 60) return out("CAUTION", "Compression lisible — attendre la cassure.");
    return out("WAIT", "Compression + contexte faible — trop tôt.");
  }

  if (TREND_STATES.has(state)) {
    if (s >= 70) return out("ACTIVE",  "Contexte directionnel clair — setup exploitable.");
    if (s >= 50) return out("CAUTION", "Tendance présente mais contexte fragile — taille réduite.");
    return out("WAIT", "Tendance déclarée mais contexte insuffisant — attendre.");
  }

  return out("WAIT", "État de marché non reconnu — pas d'initiative.");
}

// ─── getAllowedActions ────────────────────────────────────────

/**
 * Retourne les actions autorisées selon le mode opérationnel.
 *
 * WAIT    → []                              — aucune initiative
 * CAUTION → ["LIMITED_ENTRY"]              — entrée réduite uniquement
 * ACTIVE  → ["ENTRY", "ADD", "PARTIAL_EXIT"] — setup exploitable
 *
 * @param {"WAIT"|"CAUTION"|"ACTIVE"|string} mode
 * @returns {string[]}
 */
export function getAllowedActions(mode) {
  const MAP = {
    WAIT:    [],
    CAUTION: ["LIMITED_ENTRY"],
    ACTIVE:  ["ENTRY", "ADD", "PARTIAL_EXIT"],
  };
  return MAP[mode] ?? [];
}

// ─── buildMarketContext ───────────────────────────────────────

/**
 * Point d'entrée unifié : combine score + interprétation + mode + action.
 * C'est la fonction principale à brancher dans le cockpit.
 *
 * @param {{
 *   trend:      number,
 *   structure:  number,
 *   volatility: number,
 *   volume:     number,
 * }} inputs
 * @param {string} marketState — ex: "expansion", "range", "chaos"
 * @param {object} [volatilityConfig]
 * @returns {{
 *   score: number, label: string, actionBias: string, tone: string,
 *   breakdown: object, mode: string, action: string, message: string,
 *   allowedActions: string[]
 * }}
 */
export function buildMarketContext(inputs, marketState, volatilityConfig = DEFAULT_VOLATILITY_CONFIG) {
  const scoreResult = computeConfidenceScore(inputs, volatilityConfig);
  const modeResult  = resolveMode({ score: scoreResult.score, marketState });

  return {
    score:          scoreResult.score,
    label:          scoreResult.label,
    actionBias:     scoreResult.actionBias,
    tone:           scoreResult.tone,
    breakdown:      scoreResult.breakdown,
    mode:           modeResult.mode,
    action:         modeResult.action,
    message:        modeResult.message,
    allowedActions: getAllowedActions(modeResult.mode),
  };
}

// ─── getExecutionPolicy ───────────────────────────────────────

/**
 * Retourne la politique d'exécution à partir d'un résultat buildMarketContext.
 * Sert de filtre opérationnel avant toute décision d'entrée.
 *
 * @param {{ score: number, mode: string }} result
 * @returns {{ allowed: boolean, reason: string }}
 */
export function getExecutionPolicy(result) {
  if (!result || result.score < 50) {
    return { allowed: false, reason: "Score trop faible — contexte non exploitable." };
  }
  if (result.mode === "WAIT") {
    return { allowed: false, reason: "Mode WAIT — aucune entrée autorisée." };
  }
  if (result.mode === "CAUTION") {
    return { allowed: true, reason: "Mode CAUTION — entrées limitées, taille réduite." };
  }
  return { allowed: true, reason: "Mode ACTIVE — setup exploitable, risque maîtrisé." };
}

// ─── renderConfidencePanel ────────────────────────────────────

/**
 * Injecte le contexte complet (score + mode + action) dans le DOM.
 * Remplace renderConfidenceScore — gère le marketState en plus.
 *
 * Éléments DOM attendus (tous optionnels — sortie silencieuse si absents) :
 *   .confidence-panel  — conteneur (reçoit data-tone et data-mode)
 *   #cs-score          — score numérique
 *   #cs-label          — label texte
 *   #cs-bar            — barre de progression (width %)
 *   #cs-mode           — mode opératoire (WAIT / CAUTION / ACTIVE)
 *   #cs-action         — action (NO_TRADE / LIMITED_ENTRIES / FULL_SETUP)
 *   #cs-message        — message contextuel
 *
 * @param {object} inputs       — shape computeConfidenceScore
 * @param {string} marketState  — ex: "expansion", "range"
 * @param {object} [volatilityConfig]
 * @returns {object|undefined}  — résultat buildMarketContext, ou undefined si panel absent
 */
export function renderConfidencePanel(inputs, marketState, volatilityConfig = DEFAULT_VOLATILITY_CONFIG) {
  const panel = document.querySelector(".confidence-panel");
  if (!panel) {
    console.warn("[ConfidenceScore] Panel introuvable.");
    return;
  }

  const ctx = buildMarketContext(inputs, marketState, volatilityConfig);
  if (!ctx || typeof ctx.score !== "number") {
    console.warn("[ConfidenceScore] Contexte invalide pour scoring UI.");
    return;
  }

  const rawScore  = Number(ctx.score);
  const safeScore = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, rawScore)) : 0;
  const strength  = safeScore >= 70 ? "strong" : safeScore >= 50 ? "medium" : "weak";

  const el = (id) => document.getElementById(id) || null;

  const elScore   = el("cs-score");
  const elLabel   = el("cs-label");
  const elBar     = el("cs-bar");
  const elMode    = el("cs-mode");
  const elAction  = el("cs-action");
  const elMessage = el("cs-message");

  if (elScore)   elScore.textContent   = safeScore;
  if (elLabel)   elLabel.textContent   = ctx.label;
  if (elBar)     elBar.style.width     = `${safeScore}%`;
  if (elMode)    elMode.textContent    = ctx.mode;
  if (elAction)  elAction.textContent  = ctx.action;
  if (elMessage) elMessage.textContent = ctx.message;

  if (panel.dataset) {
    panel.dataset.tone     = ctx.tone     || "neutral";
    panel.dataset.mode     = (ctx.mode    || "unknown").toLowerCase();
    panel.dataset.strength = strength;
    panel.dataset.score    = safeScore;
  }

  if (strength === "strong") panel.classList.add("pulse-strong");
  else                       panel.classList.remove("pulse-strong");

  return ctx;
}
