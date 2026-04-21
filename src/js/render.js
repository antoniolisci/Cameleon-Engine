import { MARKET_DICTIONARY } from "./dictionary.js";
import { OVERTRADING_DICT } from "./overtrading-dictionary.js";
import { updateBehavior } from "./behavior.js";
import { getAdaptiveMessage } from "./tone.js";
import {
  AUTO_FILL_PRESETS,
  deriveActionModeKey,
  deriveMarketStateKey,
  ENGINE_MODE_LABELS,
  FIELD_GROUPS,
  HISTORY_LIMIT,
  PROFILE_LABELS,
  PUBLICATIONS_SECTION,
  PUBLICATION_CATEGORY_SUMMARIES,
  STATE_LABELS,
  STATUS_LABELS,
  TOKEN_LABELS,
  getActionModeConfig,
  getArticlesForMarketState,
  getMarketStateConfig
} from "./data.js";
import { buildPayload, prefillConstellium } from "./engine.js";
import { canUseStorage, estimateStateSize, loadState, saveState } from "./state.js";
import { backups } from "./storage.js";
import { getTradingPolicy, canExecuteAction } from "./trading-policy.js";
import { buildMarketContext } from "./confidence-score.js";

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let appState = loadState();
let currentPayload = null;
let initialized = false;
let decisionHistory = [];
let overtradingStreak = { level: 0, count: 0 };
let fieldEventsBound = false;
let controlEventsBound = false;
let clockTimer = null;
const STATIC_HERO_VISUAL = "../assets/images/cameleon-logo.png";
const VALID_TABS = new Set(["moteur", "pilotage", "memoire"]);
const TAB_FOCUS_TARGETS = {
  moteur: "marketStateText",
  pilotage: "marketFields",
  memoire: "historyList"
};

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = repairMojibake(value ?? "");
}

function setTextTwoLines(id, value, riskClass = "") {
  const element = $(id);
  if (!element) return;
  const clean = repairMojibake(value ?? "");
  const parts = clean.split(" — ");
  if (parts.length < 2) {
    element.textContent = clean;
    return;
  }
  element.textContent = "";
  const first = document.createTextNode(parts[0]);
  const br    = document.createElement("br");
  const second = document.createElement("span");
  const secondText = parts.slice(1).join(" — ");
  second.className = "secondary-line" + (riskClass ? " " + riskClass : "");
  second.textContent = secondText.charAt(0).toUpperCase() + secondText.slice(1);
  element.appendChild(first);
  element.appendChild(br);
  element.appendChild(second);
}

function setHtml(id, value) {
  const element = $(id);
  if (element) element.innerHTML = repairMojibake(value ?? "");
}

function setQueryText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = repairMojibake(value ?? "");
}

function setWidth(id, value) {
  const element = $(id);
  if (element) element.style.width = value;
}

// ─── Score animation ──────────────────────────────────────────

let _scoreAnimTimer = null;

function animateScore(el, to, duration = 600) {
  if (!el) return;
  const from  = parseInt(el.textContent, 10) || 0;
  if (from === to) return;
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ─── Confidence Score — moteur de calcul ─────────────────────

/**
 * Calcule le Confidence Score à partir du contexte moteur.
 * Formule : structure(35%) + alignment(30%) + volatility(variable) - risk(40%)
 * + bonus/malus par état de marché.
 */
function computeConfidence({ marketState, volatility, structure, risk, alignment }) {
  let base = 0;
  base += structure  * 0.35;
  base += alignment  * 0.30;
  if (marketState === "Expansion") {
    base += volatility * 0.20;
  } else if (marketState === "Compression") {
    base += volatility * 0.10;
  } else {
    base += volatility * 0.15;
  }
  base -= risk * 0.40;
  if (marketState === "Defense") base -= 10;
  if (marketState === "Expansion") base += 5;
  return Math.max(0, Math.min(100, Math.round(base)));
}

function mapStrength(score) {
  if (score >= 70) return "strong";
  if (score >= 40) return "medium";
  return "weak";
}

function mapFlag(score) {
  if (score >= 70) return "Confiance élevée";
  if (score >= 40) return "Confiance modérée";
  return "Confiance faible";
}

function computePosture(score, marketState) {
  if (marketState === "Defense") return "Protection du capital";
  if (score < 30) return "Hors marché";
  if (score < 50) return "Patience";
  if (score < 70) return "Observation active";
  return "Exécution";
}

function computeAction(score, marketState) {
  if (marketState === "Defense") return "Reduce Risk";
  if (score < 30) return "Do Nothing";
  if (score < 50) return "Wait Setup";
  if (score < 70) return "Monitor";
  return "Execute Trade";
}

function computeAgent(score, marketState) {
  if (marketState === "Compression") return "Sniper";
  if (marketState === "Expansion")   return "Suiveur";
  if (marketState === "Defense")     return "Gardien";
  if (score < 50)                    return "Observateur";
  return "Exécuteur";
}

/**
 * Extrait et normalise les inputs de confiance depuis le payload moteur.
 * Chaque variable du payload est convertie en valeur 0–100.
 */
function extractConfidenceCtx(payload) {
  const STATE_MAP = {
    range: "Range", compression: "Compression",
    expansion: "Expansion", defense: "Defense", riskoff: "Defense"
  };
  const FIRE_MAP      = { strong: 80, medium: 50, weak: 20 };
  const STRUCTURE_MAP = {
    hh_hl: 85, lh_ll: 75, breakout: 70, retest: 75,
    high_range: 60, low_range: 60, breakout_level: 65, middle: 30, none: 10
  };
  const RISK_MAP      = { "Élevé": 80, "Moyen": 50, "Faible": 20 };
  const ALIGNMENT_MAP = { "Bon": 85, "Moyen": 55, "Fragile": 35, "Veto humain": 10 };

  const marketState = STATE_MAP[payload.market_state]                        ?? "Range";
  const volatility  = FIRE_MAP[payload.constellium?.fire]                    ?? 40;
  const structure   = STRUCTURE_MAP[payload.setup_inputs?.structure_signal]  ?? 30;
  const risk        = RISK_MAP[payload.trigger_level]                        ?? 50;
  const alignment   = ALIGNMENT_MAP[payload.alignment]                       ?? 40;

  return { marketState, volatility, structure, risk, alignment };
}

function setHidden(target, hidden) {
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (element) element.hidden = Boolean(hidden);
}

function setMarketStateClass(target, state) {
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (!element) return;

  [...element.classList]
    .filter((className) => className.startsWith("market-"))
    .forEach((className) => element.classList.remove(className));

  if (state) element.classList.add(`market-${state}`);
}

function repairMojibake(value) {
  let text = String(value ?? "");

  const decodeLatin1Utf8 = (input) => {
    try {
      const bytes = Uint8Array.from(Array.from(input, (char) => char.charCodeAt(0)));
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return input;
    }
  };

  for (let pass = 0; pass < 2; pass += 1) {
    if (!/[ÃÂâ]/.test(text)) break;
    const decoded = decodeLatin1Utf8(text);
    if (!decoded || decoded === text || decoded.includes("\uFFFD")) break;
    text = decoded;
  }

  return text
    .replaceAll("Â°", "°")
    .replaceAll("Â·", "·")
    .replaceAll("â€™", "’")
    .replaceAll("â€˜", "‘")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("â€¦", "…")
    .replaceAll("Å“", "œ")
    .replaceAll("Â ", " ")
    .replaceAll("nÂ°", "n°");
}

function asCleanText(value) {
  if (value === null || value === undefined) return "";
  return repairMojibake(String(value)).replace(/\s+/g, " ").trim();
}

function meaningfulItems(...values) {
  return values.flatMap((value) => {
    if (Array.isArray(value)) return meaningfulItems(...value);
    const text = asCleanText(value);
    return text ? [text] : [];
  });
}

function firstMeaningful(...values) {
  return meaningfulItems(...values)[0] || "";
}

function formatToken(value) {
  if (value === null || value === undefined || value === "") return "Aucune donnée";
  return TOKEN_LABELS[value] || asCleanText(String(value).replaceAll("_", " "));
}

function formatStatus(value) {
  if (value === null || value === undefined || value === "") return "Aucune donnée";
  return STATUS_LABELS[value] || asCleanText(value);
}

function formatEngineMode(value) {
  if (value === null || value === undefined || value === "") return "Aucune donnée";
  return ENGINE_MODE_LABELS[value] || asCleanText(value);
}

const HERO_MODE_READING = {
  RANGE:       "Marché calme",
  COMPRESSION: "Pression latente",
  BREAKOUT:    "Impulsion",
  TREND:       "Tendance confirmée",
  CHAOS:       "Volatilité extrême",
  DEFENSE:     "Risque contrôlé",
  UNKNOWN:     "Lecture floue"
};

function formatHeroModeReading(marketKey) {
  return HERO_MODE_READING[marketKey] || "—";
}

// ─── Labels FR pour affichage panneau brut ────────────────────

const AGENT_LABELS_FR = {
  EXECUTE:  "Exécution",
  DEFENDER: "Défense",
  ATTACKER: "Attaque",
  OBSERVER: "Observation"
};

const POSTURE_LABELS_FR = {
  ACTIVE:    "Engagement actif",
  AGRESSIVE: "Engagement agressif",
  WAIT:      "Attente structurée",
  PROTECT:   "Protection du capital",
  PRUDENCE:  "Prudence structurée"
};

const BRAIN_STATE_LABELS_FR = {
  RANGE:       "Range (équilibre marché)",
  COMPRESSION: "Compression (pré-mouvement)",
  EXPANSION:   "Expansion en cours",
  DEFENSE:     "Mode défensif",
  RISKOFF:     "Marché instable"
};

// ─── Override labels venant de data.js ───────────────────────
// data.js est hors scope — on intercepte ici pour l'affichage uniquement.

const MARKET_LABEL_OVERRIDE_FR = {
  "Breakout":    "Cassure en cours",
  "Range":       "Range (équilibre marché)",
  "Compression": "Compression (pré-mouvement)",
  "Instable":    "Marché instable"
};

const MARKET_DECISION_OVERRIDE_FR = {
  "Marché en attente — pas de signal exploitable": "Aucun signal exploitable — rester en observation active"
};

// ─── Labels FR confidence panel ───────────────────────────────
// Traduit les valeurs internes de confidence-score.js pour l'affichage uniquement.
// Les valeurs du payload et de ctx ne sont jamais modifiées.

const CONFIDENCE_MODE_FR = {
  WAIT:    "Attente structurée",
  CAUTION: "Prudence structurée",
  ACTIVE:  "Engagement actif"
};

const CONFIDENCE_ACTION_FR = {
  NO_TRADE:        "Aucune initiative",
  LIMITED_ENTRIES: "Entrées limitées",
  FULL_SETUP:      "Setup exploitable"
};

function translateMode(mode) {
  return CONFIDENCE_MODE_FR[mode] || mode;
}

function translateAction(action) {
  return CONFIDENCE_ACTION_FR[action] || action;
}

// ─── Labels FR actions trading policy ────────────────────────
// Traduit les actions allowed/forbidden pour l'affichage uniquement.
// Les valeurs internes de trading-policy.js restent inchangées.
// Fallback : valeur brute si action inconnue.

const POLICY_ACTION_FR = {
  // ── Actions autorisées ────────────────────────────────────
  "Observe":              "Observer",
  "Wait Setup":           "Attendre setup",
  "Prepare":              "Préparer",
  "Define Levels":        "Définir les niveaux",
  "Update Watchlist":     "Actualiser watchlist",
  "Buy":                  "Entrée acheteuse",
  "Sell":                 "Entrée vendeuse",
  "Scale In":             "Renforcer progressivement",
  "Manage Position":      "Gérer position active",
  "Execute Trade":        "Exécuter trade",
  "Manage Winner":        "Gérer position gagnante",
  "Reduce Size":          "Réduire taille",
  "Reduce Risk":          "Réduire exposition",
  "Exit Partial":         "Alléger position",
  "Partial Exit":         "Alléger position",
  "Protect Capital":      "Protéger capital",
  "Tighten Risk":         "Resserrer risque",
  "Hedge":                "Couvrir position",
  "Stay Flat":            "Rester hors marché",
  "Quick Scalp":          "Scalp rapide",
  "Take Partial Profit":  "Sécuriser gains partiels",
  "Hold Position":        "Tenir position",
  "Range Trade":          "Trader le range",
  "Step Back":            "Prendre recul",
  "Review Context":       "Réévaluer contexte",
  "Prepare Entry":        "Préparer entrée",
  "Set Alert":            "Poser alerte",
  "Wait Confirmation":    "Attendre confirmation",
  "Define Entry":         "Définir entrée",
  "Build Plan":           "Construire plan",
  "Pre-Position Light":   "Pré-positionner léger",
  "Wait Breakout":        "Attendre cassure",
  "Trail Risk":           "Trailing actif",
  // ── Actions interdites ────────────────────────────────────
  "Impulsive Sell":         "Vente impulsive",
  "Aggressive Entry":       "Entrée agressive",
  "Forced Entry":           "Entrée forcée",
  "FOMO Entry":             "Entrée FOMO",
  "Overtrade":              "Sur-trading",
  "Chase Move":             "Poursuite mouvement",
  "Add Size":               "Augmenter taille",
  "Full Risk":              "Risque maximal",
  "Oversize":               "Sur-exposition",
  "Revenge Trade":          "Trade de revanche",
  "Late Entry":             "Entrée tardive",
  "Increase Risk":          "Augmenter risque",
  "Hold Through Noise":     "Tenir malgré bruit",
  "Breakout Chase":         "Poursuite cassure",
  "Any Trade":              "Tout trade",
  "Enter":                  "Entrer",
  "Override Rules":         "Ignorer règles",
  "Full Position":          "Position complète",
  "Blind Entry":            "Entrée non validée",
  "Execute Now":            "Exécuter immédiatement",
  "Aggressive Add Size":    "Renforcement agressif",
  "Blind Market Order":     "Ordre aveugle",
  "Full Risk Without Plan": "Risque sans plan",
  // ── Depuis computeAction (score-action) ───────────────────
  "Do Nothing":   "Ne rien faire",
  "Monitor":      "Observer marché"
};

function translatePolicyAction(action) {
  return POLICY_ACTION_FR[action] || action;
}

// ─── Labels FR messages de policy ────────────────────────────
// policy.message est en anglais dans trading-policy.js (hors scope).
// Traduction ici pour #policy-message uniquement.

const POLICY_MESSAGE_FR = {
  "Validation rejected or risk unacceptable. No execution allowed.":  "Validation refusée. Ne pas entrer. Le capital passe avant tout.",
  "Defensive context. Capital preservation takes priority.":          "Contexte défensif. Le risque impose de réduire l'exposition. Aucune nouvelle entrée.",
  "No clean execution window yet.":                                   "Pas de fenêtre exploitable. Attendre est souvent la meilleure décision.",
  "Context is becoming actionable, but still incomplete.":            "Setup incomplet. Attendre confirmation évite de forcer une position.",
  "Favorable setup detected. Wait for confirmation before execution.":"Setup favorable. Une opportunité n'existe que si elle est validée.",
  "Context validated. Controlled execution allowed.":                 "Contexte validé. L'exécution est autorisée dans le cadre défini."
};

const VOLATILITY_FR = { low: "Faible", medium: "Moyen", high: "Élevé" };

const VOLATILITY_MAP = { "Faible": "low", "Moyen": "medium", "Élevé": "high" };
const TREND_MAP = { "range": "neutral", "pre-breakout": "neutral", "continuation": "bullish", "capital-protection": "defensive", "survival": "bearish" };

// ─── Agent par état marché ────────────────────────────────────

const AGENT_BY_STATE = {
  RANGE:       "OBSERVER",
  COMPRESSION: "OBSERVER",
  BREAKOUT:    "EXECUTE",
  TREND:       "EXECUTE",
  DEFENSE:     "DEFENDER",
  CHAOS:       "DEFENDER",
  UNKNOWN:     "OBSERVER"
};

function getStateAgent(marketKey) {
  return AGENT_BY_STATE[marketKey] || "OBSERVER";
}

// ─── Synthèse automatique ─────────────────────────────────────

const STATE_SYNTHESIS = {
  RANGE:       "Range → aucune action",
  COMPRESSION: "Compression → attendre signal",
  BREAKOUT:    "Impulsion → opportunité exploitable",
  TREND:       "Tendance → suivre le mouvement",
  CHAOS:       "Chaos → rester hors marché",
  DEFENSE:     "Défense → protéger capital",
  UNKNOWN:     "Lecture floue → observer"
};

function getStateSynthesis(marketKey) {
  return STATE_SYNTHESIS[marketKey] || "—";
}

function formatProfile(value) {
  if (value === null || value === undefined || value === "") return "Aucune donnée";
  return PROFILE_LABELS[value] || asCleanText(value);
}

function formatTag(value) {
  const tagMap = {
    universel: "Lecture moteur",
    core: "Socle",
    adaptatif: "Adaptatif",
    validation: "Validation",
    filtre: "Filtre",
    "attack-light": "Attaque légère",
    attack: "Attaque",
    sniper: "Sniper",
    "sniper-watch": "Veille sniper",
    passive: "Passif",
    balanced: "Équilibré",
    active: "Actif"
  };
  return tagMap[value] || asCleanText(value).replaceAll("-", " ");
}

function simplifyText(value) {
  return asCleanText(value)
    .replaceAll("CORE", "socle")
    .replaceAll("SNIPER", "sniper")
    .replaceAll("ATTACK", "attaque")
    .replaceAll("WAIT", "attente");
}

function getValidationLabel(payload) {
  if (payload.validation?.state === "accepted") return "Validée";
  if (payload.validation?.state === "adjusted") return "Ajustée";
  if (payload.validation?.state === "rejected") return "Bloquée";
  return "En attente";
}

function getDictKey(marketKey) {
  const map = { TREND: "expansion", CHAOS: "riskoff" };
  return map[marketKey] || String(marketKey || "").toLowerCase();
}

function getCockpitModel(payload) {
  const marketKey = deriveMarketStateKey(payload);
  const actionKey = deriveActionModeKey(payload);
  const market = { ...getMarketStateConfig(payload) };
  const actionMode = getActionModeConfig(payload);

  // Correction d'affichage : data.js hors scope — overrides label et decision ici uniquement
  market.label    = MARKET_LABEL_OVERRIDE_FR[market.label] || market.label;
  market.decision = MARKET_DECISION_OVERRIDE_FR[market.decision] || market.decision;

  // P6 — signal moteur propre
  const v = (market.verdict || "").toLowerCase();
  market.exploitable = v.includes("exploitable") || v.includes("sortie") ||
    v.includes("tendance") || v.includes("confirmé") || v.includes("expansion");

  return {
    marketKey,
    actionKey,
    market,
    actionMode,
    validation: getValidationLabel(payload),
    risk: payload.trigger_level || "Faible"
  };
}

function warnMissingPayloadData(payload) {
  if (!payload) {
    console.warn("Missing payload");
    return;
  }

  const cockpit = getCockpitModel(payload);
  const criticalFields = [
    ["payload.market_state", payload.market_state],
    ["payload.trigger_level", payload.trigger_level],
    ["payload.validation.state", payload.validation?.state],
    ["market.verdict", cockpit.market?.verdict],
    ["market.action", cockpit.market?.action],
    ["market.decision", cockpit.market?.decision]
  ];

  criticalFields.forEach(([label, value]) => {
    if (value === 0) return;
    if (!asCleanText(value)) console.warn(`Missing ${label} in payload`);
  });
}

function formatArticleCategory(value) {
  const labels = {
    core_range: "Doctrine du range",
    discipline: "Discipline",
    lecture_marche: "Lecture de marché",
    execution_risque: "Risque & exécution",
    execution_ordres: "Exécution des ordres",
    doctrine: "Doctrine"
  };
  return labels[value] || "Publication";
}

function capitalize(text) {
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function extractArticleTitle(url) {
  let slug = String(url || "").split("/").filter(Boolean).pop() || "";

  try {
    slug = decodeURIComponent(slug);
  } catch {
    // Keep the raw slug when decoding fails.
  }

  slug = repairMojibake(slug)
    .replaceAll("n°1", "n°1")
    .replaceAll("n°2", "n°2")
    .replaceAll("n°3", "n°3");

  const replacements = {
    marche: "marché",
    plutot: "plutôt",
    predire: "prédire",
    nest: "n’est",
    linaction: "l’inaction",
    complete: "complète",
    limpatience: "l’impatience",
    lintangibilite: "l’intangibilité",
    protege: "protégé",
    lennemi: "l’ennemi",
    emotionnelle: "émotionnelle",
    ignore: "ignoré",
    arreter: "arrêter",
    decision: "décision",
    etre: "être",
    agite: "agité",
    schema: "schéma",
    quil: "qu’il",
    nen: "n’en",
    dhistoire: "d’histoire",
    securite: "sécurité",
    volatilite: "volatilité",
    degats: "dégâts",
    competence: "compétence",
    deja: "déjà",
    lexposition: "l’exposition",
    nexiste: "n’existe",
    lannuler: "l’annuler",
    dordres: "d’ordres",
    creent: "créent",
    methode: "méthode",
    cameleon: "Caméléon",
    strategie: "stratégie"
  };
  const minorWords = new Set(["de", "du", "des", "la", "le", "les", "au", "aux", "et", "ou", "vs"]);

  const words = slug
    .split("-")
    .filter(Boolean)
    .map((token, index, tokens) => {
      const lower = token.toLowerCase();

      if (["n°1", "n°2", "n°3"].includes(lower)) return lower.toUpperCase();
      if (lower === "—" || lower === "→" || lower === "vs") return lower;
      if (lower === "x" && tokens[index - 1]?.toLowerCase() === "loi") return "X";

      const next = replacements[lower] || lower;
      if (minorWords.has(next) && index > 0) return next;
      return capitalize(next);
    });

  return repairMojibake(words.join(" ").replace(/\s+/g, " ").trim()) || "Publication Paragraph";
}

function getPublicationSummary(article) {
  return PUBLICATION_CATEGORY_SUMMARIES[article.category] || "Lecture éditoriale directement liée au contexte moteur du jour.";
}

function getPublicationReadingTime(url) {
  const slug = String(url || "").split("/").filter(Boolean).pop() || "";
  const words = slug.split("-").filter(Boolean).length;
  const minutes = Math.max(3, Math.min(6, Math.round(words / 3)));
  return `${minutes} min`;
}

function renderField(field) {
  const wrapper = document.createElement("div");
  wrapper.className = "field-group";

  const label = document.createElement("label");
  label.htmlFor = field.id;
  label.textContent = repairMojibake(field.label);

  const element = document.createElement(field.type === "textarea" ? "textarea" : "select");
  element.id = field.id;

  if (field.placeholder) element.placeholder = repairMojibake(field.placeholder);

  if (field.type === "select") {
    field.options.forEach(([value, text]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = repairMojibake(text);
      element.appendChild(option);
    });
  }

  wrapper.append(label, element);
  return wrapper;
}

function mountFields() {
  Object.entries(FIELD_GROUPS).forEach(([targetId, fields]) => {
    const target = $(targetId);
    if (!target) return;
    target.innerHTML = "";
    fields.forEach((field) => target.appendChild(renderField(field)));
  });
}

function fillForm(form) {
  Object.entries(form).forEach(([key, value]) => {
    const element = $(key);
    if (element) element.value = value ?? "";
  });
}

function collectForm() {
  const next = {};
  [...FIELD_GROUPS.marketFields, ...FIELD_GROUPS.adaptiveFields].forEach((field) => {
    const element = $(field.id);
    next[field.id] = element ? element.value : "";
  });
  return next;
}

function renderList(id, items) {
  const target = $(id);
  if (!target) return;

  const values = meaningfulItems(items);
  target.innerHTML = "";

  values.forEach((item) => {
    const node = document.createElement("div");
    node.className = "action-item";
    node.textContent = item;
    target.appendChild(node);
  });

  const card = target.closest(".action-box");
  if (card) card.hidden = values.length === 0;
}

function renderTagRow(id, items) {
  const target = $(id);
  if (!target) return;

  const tags = meaningfulItems(items);
  target.innerHTML = "";

  tags.forEach((tag) => {
    const node = document.createElement("span");
    node.className = "tag";
    node.textContent = formatTag(tag);
    target.appendChild(node);
  });
}

function describeStructure(payload) {
  const cockpit = getCockpitModel(payload);
  return { value: cockpit.market.label, sub: cockpit.market.description };
}

function describeRisk(payload) {
  const validation = getValidationLabel(payload);
  if (payload.validation.state === "rejected") return { value: "Élevé", sub: "La validation bloque toute action." };
  if (payload.emotion_state === "stress" || payload.emotion_state === "fomo") return { value: "Élevé", sub: "L'état émotionnel impose de ne rien faire." };
  return { value: payload.trigger_level || "Faible", sub: `Validation : ${validation}.` };
}

function describeOpportunity(payload) {
  const cockpit = getCockpitModel(payload);
  return { value: cockpit.actionMode.label, sub: cockpit.actionMode.description };
}

function describeDiscipline(payload) {
  return { value: getValidationLabel(payload), sub: simplifyText(payload.validation.summary) || "Tu attends tant que ce n'est pas clair." };
}

const HERO_COPY_MAP = {
  RANGE: {
    title: "⛔ Aucune entrée",
    subtitle: "Sans direction. Attendre structure propre."
  },
  COMPRESSION: {
    title: "Attente structurée",
    subtitle: "Setup en cours. Ne pas anticiper."
  },
  BREAKOUT: {
    title: "Confirmation requise",
    subtitle: "Cassure détectée. Attendre signal propre."
  },
  TREND: {
    title: "✅ Tendance exploitable",
    subtitle: "Direction lisible. Entrée sélective."
  },
  CHAOS: {
    title: "⛔ Aucune entrée",
    subtitle: "Marché instable. Rester hors marché."
  },
  DEFENSE: {
    title: "⚠️ Réduire immédiatement",
    subtitle: "Capital prioritaire. Rester léger."
  },
  UNKNOWN: {
    title: "Lecture incomplète",
    subtitle: "Insuffisant. Observer sans agir."
  }
};

// ── LDC : normalisation des inputs canoniques ────────────────────────────────
function normalizeLdcInputs(payload) {
  return {
    marketState:     deriveMarketStateKey(payload),
    validationState: payload.validation?.state      || "pending",
    emotionState:    payload.emotion_state          || "stable"
  };
}

const RULE_OF_DAY_MAP = {
  RANGE:       "Ne pas forcer une direction. Attendre la structure avant d'engager.",
  COMPRESSION: "La patience prime. Anticiper coûte plus qu'attendre le signal.",
  BREAKOUT:    "Confirmation avant entrée. Le momentum se valide, il ne s'anticipe pas.",
  TREND:       "Suivre, ne pas devancer. Entrer sur retracement propre uniquement.",
  CHAOS:       "Capital d'abord. Aucun trade ne vaut un drawdown non maîtrisé.",
  DEFENSE:     "Réduire l'exposition, pas l'attention. Rester en observation active.",
  UNKNOWN:     "Sans lecture claire, l'abstention est une décision à part entière."
};

// ── LDC : résolution de la règle du jour ─────────────────────────────────────
// V2 : inputs accueillera zoneState pour un branchement plus fin sans changer les appelants
function getLdcRule(inputs) {
  const { marketState } = inputs;
  return RULE_OF_DAY_MAP[marketState] ?? RULE_OF_DAY_MAP["UNKNOWN"];
}

// ── getHeroCopy : couche narrative pure ──────────────────────────────────────
// Source principale : payload.decisionState.
// Exception UX : BLOCKED → affinage via emotion_state (couche présentation uniquement).
function getHeroCopy(payload) {
  const ds = payload.decisionState ?? computeDecisionState(payload);

  if (ds.state === "BLOCKED") {
    const emotion = (payload.emotion_state || "").toLowerCase();
    switch (emotion) {
      case "fomo":
        return { title: "⛔ Pause obligatoire",   subtitle: "FOMO détecté — aucune exécution autorisée." };
      case "revenge":
        return { title: "⛔ Exécution interdite",        subtitle: "Comportement agressif détecté." };
      case "overtrading":
        return { title: "⛔ Ralentissement obligatoire", subtitle: "Saturation détectée — réduire l'activité immédiatement." };
      case "tilt":
        return { title: "⛔ Arrêt immédiat",             subtitle: "Perte de contrôle détectée — pause obligatoire." };
      default:
        return { title: "⛔ Exécution bloquée",   subtitle: "Aucune entrée autorisée." };
    }
  }

  switch (ds.state) {
    case "PROTECT":
      return { title: "⚠️ Mode défensif",       subtitle: "Capital prioritaire." };
    case "WAIT":
      return { title: "⏸️ Attente",             subtitle: "Pas de setup clair." };
    case "ALIGNED":
      return { title: "✅ Exécution",            subtitle: "Conditions validées." };
    case "READY":
      return { title: "Setup prêt",              subtitle: "Signal favorable. Attendre confirmation." };
    case "TENSION":
      return { title: "Tension active",          subtitle: "Contexte fragile. Rester discipliné." };
    default:
      return { title: "—",                      subtitle: "" };
  }
}

const DECISION_COPY_MAP = {
  RANGE: {
    title: "Attendre confirmation",
    subtitle: "Pas de direction."
  },
  COMPRESSION: {
    title: "Setup en cours",
    subtitle: "Signal pas validé. Ne pas anticiper."
  },
  BREAKOUT: {
    title: "Entrée sur confirmation",
    subtitle: "Cassure en cours. Confirmer signal."
  },
  TREND: {
    title: "✅ Opportunité en cours",
    subtitle: "Direction claire. Entrée sélective."
  },
  CHAOS: {
    title: "⛔ Aucune position",
    subtitle: "Marché instable. Rester hors marché."
  },
  DEFENSE: {
    title: "⚠️ Réduire le risque",
    subtitle: "Défensif. Aucune entrée propre."
  },
  UNKNOWN: {
    title: "⛔ Aucune position",
    subtitle: "Insuffisant. Décision impossible."
  }
};

function getDecisionCopy(payload) {
  const cockpit = getCockpitModel(payload);
  return DECISION_COPY_MAP[cockpit.marketKey] || DECISION_COPY_MAP.UNKNOWN;
}

function getBlockedPrimary(payload) {
  return getCockpitModel(payload).market.avoid;
}

function getAllowedPrimary(payload) {
  return getCockpitModel(payload).market.action;
}

function getPriorityLine(payload) {
  return getCockpitModel(payload).market.decision;
}

function getVisualSupportLine(payload, visual) {
  const cockpit = getCockpitModel(payload);
  return `${cockpit.actionMode.description} Validation : ${getValidationLabel(payload)}.`;
}

function getDecisionHeadline(payload) {
  return getCockpitModel(payload).market.decision;
}

function applyMarketVisual(payload) {
  const frame = document.querySelector(".hero-logo .hero-visual-frame");
  const image = frame?.querySelector("img");
  const cockpit = getCockpitModel(payload);
  const marketState = cockpit.marketKey.toLowerCase();

  setMarketStateClass(document.querySelector(".hero"), marketState);

  if (!frame) return;

  frame.removeAttribute("aria-hidden");
  frame.dataset.visualKey = "static";
  frame.dataset.visualLabel = "Cameleon Engine";
  frame.dataset.visualBias = cockpit.market.label;
  frame.dataset.visualTone = cockpit.market.decision;
  frame.setAttribute("aria-label", `Cameleon Engine. ${cockpit.market.label}. ${cockpit.market.decision}`);
  frame.style.setProperty("--visual-gradient", "none");
  frame.style.setProperty("--visual-accent-gradient", "none");
  frame.style.setProperty("--visual-overlay-strength", "0.9");
  frame.style.setProperty("--visual-image-opacity", "0.14");
  frame.style.setProperty("--visual-image-position", "right center");
  frame.style.setProperty("--visual-image-blur", "0px");

  if (image) {
    image.src = STATIC_HERO_VISUAL;
    image.alt = "Cameleon Engine";
    image.hidden = false;
  }

}

// ── P3 ── decision state ─────────────────────────────────
//
// Distingue 5 états mutuellement exclusifs :
//   BLOCKED  — veto réel (validation refusée, NO TRADE)
//   PROTECT  — défense cohérente (defense, riskoff, posture PROTECT)
//   WAIT     — attente structurée (compression, WAIT, PRUDENCE)
//   ALIGNED  — offensive active et favorable
//   TENSION  — favorable mais non offensif
//
// Règle de priorité : BLOCKED > PROTECT > WAIT > ALIGNED > TENSION

// ── Helpers décision ─────────────────────────────────────────
function isProtectContext(state)  { return state === "defense" || state === "riskoff"; }
function isExpansionContext(state){ return state === "expansion"; }
function isCompressionContext(s)  { return s === "compression"; }
function isAcceptedValidation(v)  { return v === "accepted"; }

function computeDecisionState(payload) {
  const status  = (payload.trading_status || "").toUpperCase();
  const state   = (payload.market_state   || "").toLowerCase();
  const posture = (payload.decision?.primary?.posture || "").toUpperCase();
  const valid   = (payload.validation?.state || "").toLowerCase();
  const score   = payload.score ?? 50;

  const defensive  = isProtectContext(state);
  const expansion  = isExpansionContext(state);
  const accepted   = isAcceptedValidation(valid);
  const emotion    = (payload.emotion_state || "").toLowerCase();

  // ── 0. GARDE-FOU ÉMOTIONNEL — priorité absolue ───────────────
  // Surpasse score, validation, posture et trading_status.
  if (emotion === "fomo") {
    return {
      state:   "BLOCKED",
      label:   "BLOCAGE",
      cls:     "status-block",
      message: "⛔ FOMO détecté — aucune exécution autorisée"
    };
  }
  if (emotion === "stress") {
    return {
      state:   "PROTECT",
      label:   "PROTECTION",
      cls:     "status-protect",
      message: "⚠️ Sous tension — réduire et ne pas ouvrir"
    };
  }

  // ── 1. BLOCKED ───────────────────────────────────────────────
  // Veto humain explicite uniquement.
  if (valid === "rejected") {
    return {
      state:   "BLOCKED",
      label:   "BLOCAGE",
      cls:     "status-block",
      message: "⛔ Validation refusée — aucune exécution"
    };
  }

  // ── 2. PROTECT ───────────────────────────────────────────────
  // Réservé aux marchés structurellement défensifs.
  // score faible, NO TRADE, VALIDATION BLOCK → WAIT (pas PROTECT).
  if (defensive || posture === "PROTECT" || posture === "REDUCE_PARTIAL") {
    return {
      state:   "PROTECT",
      label:   "PROTECTION",
      cls:     "status-protect",
      message: "⚠️ Contexte risqué — réduire immédiatement"
    };
  }

  // ── 3. READY ─────────────────────────────────────────────────
  // Expansion favorable + score suffisant + validation non encore confirmée.
  // Priorité sur WAIT : le signal marché prime sur le statut profil.
  if (expansion && score >= 55 && !accepted) {
    return {
      state:   "READY",
      label:   "SETUP PRÊT",
      cls:     "status-ready",
      message: "👀 Setup favorable — attendre confirmation"
    };
  }

  // ── 4. ALIGNED ───────────────────────────────────────────────
  // Expansion + validé + score fort → exécution autorisée.
  if (expansion && accepted && score >= 65) {
    return {
      state:   "ALIGNED",
      label:   "ALIGNÉ",
      cls:     "status-aligned",
      message: "✅ Exécution autorisée"
    };
  }

  // ── 5. WAIT ──────────────────────────────────────────────────
  // Attente structurée : compression, score faible, contraintes profil/émotion.
  // Absorbe NO TRADE et VALIDATION BLOCK en contexte non-défensif.
  const isWait =
    isCompressionContext(state)    ||
    score   <  35                  ||
    status.includes("WAIT")        ||
    status  === "CORE ONLY"        ||
    status  === "NO TRADE"         ||
    status  === "VALIDATION BLOCK" ||
    posture === "WAIT"             ||
    posture === "PRUDENCE";

  if (isWait) {
    const msg = isCompressionContext(state)
      ? "👀 Compression — attendre la cassure"
      : score < 35
        ? "Score insuffisant — observation uniquement"
        : "Setup non confirmé";
    return {
      state:   "WAIT",
      label:   "ATTENTE",
      cls:     "status-wait",
      message: msg
    };
  }

  // ── 6. TENSION / ALIGNED (marchés non-expansion) ─────────────
  // Pour les contextes favorables restants (range actif, breakout partiel).
  const cockpit   = getCockpitModel(payload);
  const verdict   = (cockpit.market.verdict || "").toLowerCase();
  const favorable = cockpit.market.exploitable ??
    (verdict.includes("exploitable") || verdict.includes("sortie") ||
     verdict.includes("tendance")    || verdict.includes("confirmé") ||
     verdict.includes("expansion"));

  const isOffensive = status === "TRADE OK" || status === "SNIPER READY";

  if (isOffensive && score >= 65 && favorable) {
    return {
      state:   "ALIGNED",
      label:   "ALIGNÉ",
      cls:     "status-aligned",
      message: "✅ Exécution autorisée"
    };
  }

  if (favorable || score >= 45) {
    return {
      state:   "TENSION",
      label:   "TENSION",
      cls:     "status-tension",
      message: "Opportunité visible — exposition limitée"
    };
  }

  // Fallback
  return {
    state:   "WAIT",
    label:   "ATTENTE",
    cls:     "status-wait",
    message: "Lecture insuffisante — observer sans agir"
  };
}

// Conservé pour compatibilité snapshot history
function getHeroState(cockpit, tradingStatus) {
  const decision = tradingStatus.toLowerCase();
  const favorable = cockpit.market.exploitable ??
    (() => {
      const v = (cockpit.market.verdict || "").toLowerCase();
      return v.includes("exploitable") || v.includes("sortie") ||
        v.includes("tendance") || v.includes("confirmé") || v.includes("expansion");
    })();
  if (favorable && decision === "attaque") return "ALIGNED";
  if (favorable && decision !== "attaque") return "TENSION";
  return "BLOCK";
}

// ── P4 ── snapshot history ────────────────────────────────
const SNAP_MARKET_MAP = {
  range: "Range", compression: "Compression", expansion: "Expansion",
  defense: "Défense", chaos: "Chaos", unknown: "—"
};
const SNAP_EMOTION_MAP = {
  fomo: "FOMO", stress: "Tension", tension: "Tension",
  neutral: "Calme", calm: "Calme", unknown: "—"
};
const SNAP_STATE_MAP = {
  WAIT: "Attente", BLOCKED: "Bloqué", PROTECT: "Protection",
  ACTIVE: "Actif", ALIGNED: "Aligné", READY: "Prêt", TENSION: "Tension"
};

let latestSnapshotContext = null;
let saveSnapshotFeedbackTimer = null;
const SNAPSHOT_BTN_LABEL = "Mémoriser cet état";
const SNAPSHOT_BTN_CONFIRM = "État mémorisé";

function saveSnapshot(snapshot) {
  const last = backups.getAll()[0];
  const sig = (s) => `${s.market_state}|${s.emotion_state}|${s.state}`;
  if (last && sig(last) === sig(snapshot)) return;
  backups.prepend(snapshot);
}

function computeSnapshotQuality({ state, emotion_state, score }) {
  const emo = (emotion_state || "").toLowerCase();

  if (state === "BLOCKED") return "bad";
  if (emo === "fomo") return "bad";
  if (["tension", "stress"].includes(emo) && score !== null && score < 40) return "bad";

  if (state === "WAIT") return "medium";
  if (["tension", "stress"].includes(emo)) return "medium";

  if (
    ["ALIGNED", "READY", "ACTIVE"].includes(state) &&
    ["calm", "neutral"].includes(emo) &&
    (score === null || score >= 60)
  ) {
    return "good";
  }

  return "medium";
}

const SNAP_QUALITY_MAP = {
  good:   "🟢",
  medium: "🟡",
  bad:    "🔴"
};

function handleManualSnapshot(payload, cockpit, decisionState, tradingStatusFormatted) {
  const quality = computeSnapshotQuality({
    state:         decisionState.state,
    emotion_state: payload.emotion_state,
    score:         payload.score ?? null
  });
  saveSnapshot({
    timestamp:     new Date().toISOString(),
    regime:        cockpit.market.label,
    verdict:       cockpit.market.verdict,
    decision:      tradingStatusFormatted,
    state:         decisionState.state,
    market_state:  payload.market_state  || "unknown",
    emotion_state: payload.emotion_state || "unknown",
    score:         payload.score ?? null,
    quality:       quality
  });
  renderSnapshotHistory();
  renderHistoryInsight();
  renderSnapshotBehaviorAlert();
  renderPreBehaviorAlert();
}

function renderSnapshotHistory() {
  const target = $("history");
  if (!target) return;
  const history = backups.getAll().slice(0, 5);
  if (!history.length) {
    target.innerHTML = "<div style=\"opacity:.3; font-size:12px;\">Aucun historique</div>";
    return;
  }
  target.innerHTML = history.map((h, i) => {
    const time    = new Date(h.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const mkt     = SNAP_MARKET_MAP[(h.market_state  || "").toLowerCase()] ?? "—";
    const emo     = SNAP_EMOTION_MAP[(h.emotion_state || "").toLowerCase()] ?? "—";
    const dec     = SNAP_STATE_MAP[h.state]                                 ?? "—";
    const q       = SNAP_QUALITY_MAP[h.quality]                              ?? "";
    const qualityClass =
      h.quality === "bad"    ? "snapshot-quality-bad"    :
      h.quality === "medium" ? "snapshot-quality-medium" :
      h.quality === "good"   ? "snapshot-quality-good"   :
      "";
    const isFirst = i === 0;
    const rowStyle = isFirst
      ? "display:flex;gap:8px;font-size:12px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);opacity:1;"
      : "display:flex;gap:8px;font-size:12px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);opacity:0.5;";
    return `<div style="${rowStyle}" class="${qualityClass}">`
      + `<span style="opacity:.55;min-width:38px;">${time}</span>`
      + `<span>${mkt}</span>`
      + `<span style="opacity:.35;">/</span>`
      + `<span>${emo}</span>`
      + `<span style="opacity:.35;">/</span>`
      + `<span style="font-weight:${isFirst ? 600 : 400};">${dec}</span>`
      + `<span style="margin-left:auto;">${q}</span>`
      + `</div>`;
  }).join("");
}

function clearSnapshotHistory() {
  if (!confirm("Supprimer tout l'historique moteur ?")) return;
  backups.clear();
  renderSnapshotHistory();
  renderHistoryInsight();
  renderSnapshotBehaviorAlert();
  renderPreBehaviorAlert();
}

// ── P5 ── intelligent insight ─────────────────────────────
function analyzeHistory(history) {
  const last = history.slice(0, 20);
  const total = last.length;
  if (total < 5) return { status: "INSUFFICIENT", message: "Pas assez de données" };

  const counts = last.reduce((acc, h) => {
    acc[h.state] = (acc[h.state] || 0) + 1;
    return acc;
  }, {});

  // Compat: anciens snapshots "BLOCK", nouveaux "BLOCKED" / "PROTECT" / "WAIT"
  const blockRate   = ((counts.BLOCK || 0) + (counts.BLOCKED || 0)) / total;
  const waitRate    = ((counts.WAIT  || 0) + (counts.PROTECT || 0)) / total;
  const tensionRate = (counts.TENSION || 0) / total;
  const alignedRate = (counts.ALIGNED || 0) / total;

  if (blockRate   >= 0.5) return { status: "BLOCK",       message: "Marché bloqué" };
  if (waitRate    >= 0.6) return { status: "TENSION",     message: "Phase d'attente prolongée" };
  if (tensionRate >= 0.5) return { status: "TENSION",     message: "Marché sous tension" };
  if (alignedRate <= 0.2) return { status: "LOW_ALIGNED", message: "Peu d'opportunités claires" };
  return { status: "NORMAL", message: "Conditions normales" };
}

function renderHistoryInsight() {
  const el = $("history-insight");
  if (!el) return;
  const history = backups.getAll();
  const result = analyzeHistory(history);
  const colors = { BLOCK: "#ff4444", TENSION: "#ffaa00", LOW_ALIGNED: "#888", NORMAL: "#00ff88", INSUFFICIENT: "#555" };
  const insightColor = colors[result.status] || "#555";

  const pattern = detectSnapshotQualityPattern(history);
  const QUALITY_COLORS = { danger: "#ff4444", warning: "#ffaa00", good: "#00ff88" };
  const QUALITY_EMOJI  = { danger: "🔴", warning: "🟡", good: "🟢" };
  const patternLine = pattern
    ? `<div style="margin-top:4px;color:${QUALITY_COLORS[pattern.type]};">${QUALITY_EMOJI[pattern.type]} ${pattern.message}</div>`
    : "";

  el.innerHTML = `<span style="color:${insightColor};">${result.message}</span>${patternLine}`;
}

// ── P5b ── behavior drift detection ──────────────────────────────────────
function detectBehaviorDrift(history) {
  const fomoCount    = history.filter(h => (h.emotion_state || "").toLowerCase() === "fomo").length;
  const tensionCount = history.filter(h => ["tension", "stress"].includes((h.emotion_state || "").toLowerCase())).length;
  const blockedCount = history.filter(h => h.state === "BLOCKED").length;
  const waitCount    = history.filter(h => h.state === "WAIT").length;

  if (fomoCount    >= 3) return { type: "warning", message: "FOMO répété — ralentir avant d'agir" };
  if (tensionCount >= 3) return { type: "warning", message: "Tension élevée — réduire l'exposition" };
  if (blockedCount >= 4) return { type: "warning", message: "Blocages fréquents — éviter toute entrée" };
  if (waitCount    >= 5) return { type: "warning", message: "Attente prolongée — marché peu lisible" };
  return null;
}

function detectSnapshotQualityPattern(history) {
  const last = history.slice(0, 5);
  if (last.length < 3) return null;

  const counts = { good: 0, medium: 0, bad: 0 };
  last.forEach(h => {
    if (h.quality && counts[h.quality] !== undefined) counts[h.quality]++;
  });

  if (counts.bad    >= 3) return { type: "danger",  message: "Dérive détectée — coupe immédiatement" };
  if (counts.medium >= 3) return { type: "warning", message: "Instabilité — ralentis" };
  if (counts.good   >= 3) return { type: "good",    message: "Alignement — état propre" };

  return null;
}

function renderSnapshotBehaviorAlert() {
  const card = $("behaviorAlertCard");
  if (!card) return;
  const alert = detectBehaviorDrift(backups.getAll().slice(0, 20));
  if (!alert) {
    card.style.display = "none";
    card.textContent = "";
    return;
  }
  card.style.display = "block";
  card.textContent = alert.message;
}

function detectPreBehaviorDrift(history) {
  const fomoCount    = history.filter(h => (h.emotion_state || "").toLowerCase() === "fomo").length;
  const tensionCount = history.filter(h => ["tension", "stress"].includes((h.emotion_state || "").toLowerCase())).length;
  const waitCount    = history.filter(h => h.state === "WAIT").length;

  const scores    = history.map(h => h.score).filter(s => s !== null && s !== undefined);
  const scoreDrop = scores.length >= 3 && scores[0] < scores[1] && scores[1] < scores[2];

  if (fomoCount    >= 2)                return { type: "soft-warning", message: "Attention orientée — tu commences à chercher une opportunité" };
  if (tensionCount >= 2)                return { type: "soft-warning", message: "Tension montante — ralentis avant de forcer" };
  if (scoreDrop)                        return { type: "soft-warning", message: "Clarté en baisse — ne force pas" };
  if (waitCount >= 1 && fomoCount >= 1) return { type: "soft-warning", message: "Patience fragile — risque de forcer une entrée" };
  return null;
}

function renderPreBehaviorAlert() {
  const card = $("preBehaviorAlertCard");
  if (!card) return;
  const shortHistory  = backups.getAll().slice(0, 8);
  const strongHistory = backups.getAll().slice(0, 20);
  if (detectBehaviorDrift(strongHistory)) {
    card.style.display = "none";
    card.textContent = "";
    return;
  }
  const alert = detectPreBehaviorDrift(shortHistory);
  if (!alert) {
    card.style.display = "none";
    card.textContent = "";
    return;
  }
  card.style.display = "block";
  card.textContent = alert.message;
}

function renderHeader(payload) {
  const cockpit = getCockpitModel(payload);
  setText("headerState", cockpit.market.label);
  setText("headerMode", cockpit.actionMode.label);
}

const OFFENSIVE_BLOCKING_STATES = new Set(["compression", "defense", "riskoff"]);

function resolveVerdictLabel(payload) {
  const raw = formatStatus(payload.trading_status);
  const stateKey = (payload.market_state || "").toLowerCase();
  if (raw === "Attaque" && OFFENSIVE_BLOCKING_STATES.has(stateKey)) {
    return getCockpitModel(payload).market.verdict;
  }
  return raw;
}

function renderHero(payload) {
  const ldcInputs = normalizeLdcInputs(payload);
  const heroCopy  = getHeroCopy(payload);
  const cockpit   = getCockpitModel(payload);

  applyMarketVisual(payload);

  setText("lectureDayMain", heroCopy.title);
  setText("lectureDaySub",  heroCopy.subtitle);
  setText("lectureDayRule", getLdcRule(ldcInputs));

  // État visuel LDC — source unique : payload.decisionState.state
  const ldcCard = document.querySelector(".hero-bottom-zone > .lecture-day-card");
  if (ldcCard) {
    const ds = payload.decisionState?.state || "WAIT";
    const LDC_STATE_MAP = {
      BLOCKED: "blocked",
      PROTECT: "protect",
      WAIT:    "wait",
      READY:   "ready",
      ALIGNED: "aligned",
      TENSION: "tension"
    };
    ldcCard.dataset.ldcState = LDC_STATE_MAP[ds] || "wait";
  }

  // P1 — Verdict shell
  setText("verdictImmediate", resolveVerdictLabel(payload));
  setText("verdictAllowed",   cockpit.market.posture);
  setText("verdictNext",      cockpit.market.action);
  setText("verdictBlocked",   cockpit.market.avoid);
  setText("verdictWatch",     cockpit.market.decision);

  // P2 — Hero KPI grid
  const shortMarketLabel = (cockpit.market.label || "").split("(")[0].trim() || cockpit.market.label;
  setText("heroMarketStrong", shortMarketLabel);
  setText("heroVerdictValue", cockpit.market.verdict);
  setText("heroPostureValue", cockpit.market.posture);
  setText("heroAvoidValue",   cockpit.market.avoid);

  // Hero bar
  setText("heroBarMarket",  shortMarketLabel);
  setText("heroBarScore",   String(payload.score));
  setText("heroBarMode",    formatHeroModeReading(cockpit.marketKey));
  setText("heroBarPosture", cockpit.market.posture);
  setText("heroBarCount",   String(Array.isArray(appState.history) ? appState.history.length : 0));

  // Hero decision grid
  setText("heroDecisionVerdict", cockpit.market.verdict);
  setText("heroDecisionAgent",   AGENT_LABELS_FR[getStateAgent(cockpit.marketKey)] || getStateAgent(cockpit.marketKey));
  setText("heroDecisionAction",  cockpit.market.action);
  setText("heroDecisionAvoid",   cockpit.market.avoid);

  // P3 — hero split analyse vs décision
  const tradingStatusFormatted = formatStatus(payload.trading_status);
  setText("market-regime",  cockpit.market.label);
  setText("market-score",   String(payload.score));
  setText("market-verdict", cockpit.market.verdict);
  setText("market-context", cockpit.market.description || "-");
  setText("decision-status",     tradingStatusFormatted);
  setText("decision-posture",    cockpit.market.posture);
  setText("decision-action",     cockpit.market.action);
  setText("decision-risk",       cockpit.market.avoid);
  setText("decision-validation", getValidationLabel(payload));

  const decisionState = payload.decisionState ?? computeDecisionState(payload);

  console.log("[DecisionState]", {
    marketState:     payload.market_state,
    score:           payload.score,
    posture:         payload.decision?.primary?.posture,
    validationState: payload.validation?.state,
    tradingStatus:   payload.trading_status,
    result:          decisionState.state
  });

  const heroStatusEl = $("hero-status");
  if (heroStatusEl) {
    heroStatusEl.className = `hero-status ${decisionState.cls}`;
    heroStatusEl.textContent = decisionState.label;
  }

  // hero h1 dynamique selon decisionState
  const heroH1Titles = {
    ALIGNED:  "Le cockpit qui tranche avant d'exécuter",
    BLOCKED:  "Le cockpit qui te protège de toi-même",
    PROTECT:  "Le cockpit qui te protège de toi-même",
    WAIT:     "Le cockpit qui t'empêche d'entrer trop tôt",
    READY:    "Le cockpit qui t'empêche d'entrer trop tôt",
    TENSION:  "Le cockpit qui t'empêche d'entrer trop tôt"
  };
  const heroH1Text = heroH1Titles[decisionState.state] || "Le cockpit qui tranche avant d'exécuter";
  setText("hero-h1", heroH1Text);

  // micro-interaction : hero-warning sur états risqués
  const heroSection = $("hero-section");
  if (heroSection) {
    const isWarning = ["BLOCKED", "PROTECT", "TENSION"].includes(decisionState.state);
    heroSection.classList.toggle("hero-warning", isWarning);
  }

  // P4 — contexte snapshotable mis à jour (enregistrement manuel uniquement)
  latestSnapshotContext = { payload, cockpit, decisionState, tradingStatusFormatted };
}

function renderLightContext(payload) {
  const cockpit = getCockpitModel(payload);
  const structure = describeStructure(payload);
  const risk = describeRisk(payload);
  const discipline = describeDiscipline(payload);
  const structureSignal = formatToken(payload.setup_inputs?.structure_signal || "none");
  const zoneSignal = formatToken(payload.setup_inputs?.zone_signal || "none");
  const validationSummary = simplifyText(payload.validation?.summary) || "Validation en cours.";
  const journalLine = structureSignal === "Aucun"
    ? cockpit.market.decision
    : `${structureSignal} · ${zoneSignal}`;

  setText("statePill", cockpit.market.label);
  setText("alertStructureValue", structure.value);
  setText("alertStructureSub", structure.sub);
  setText("alertRiskValue", risk.value);
  setText("alertRiskSub", validationSummary);
  setText("alertOpportunityValue", structureSignal);
  setText("alertOpportunitySub", journalLine);
  setText("alertDisciplineValue", discipline.value);
  setText("alertDisciplineSub", validationSummary);
  setText("engineJournalMain", journalLine);
  setText("microUltraShortText", `${cockpit.market.label} · ${cockpit.actionMode.label}`);
}

function renderStructuredReading(payload) {
  const cockpit = getCockpitModel(payload);
  const structureSignal = formatToken(payload.setup_inputs?.structure_signal || "none");
  const zoneSignal = formatToken(payload.setup_inputs?.zone_signal || "none");
  const validationSummary = simplifyText(payload.validation?.summary) || cockpit.market.description;
  setText("structuredMarketText", cockpit.market.description);
  setText("journalMiniStructure", structureSignal === "Aucun" ? cockpit.market.label : structureSignal);
  setText("structuredProfileText", cockpit.market.posture);
  setText("signalNarratifMain", structureSignal === "Aucun" ? cockpit.market.decision : `${structureSignal} sur ${zoneSignal}`);
  setText("structuredValidationText", validationSummary);
  setText("engineJournalStatus", `Validation ${cockpit.validation}`);
  setText("mantraOperationnelMain", cockpit.market.action);
}

function renderNavigation(payload) {
  const cockpit = getCockpitModel(payload);

  syncTabs(appState.activeTab || "moteur");
  const _stateDisplayFR = { expansion: "Cassure / Tendance" };
  setText("marketStateTinyLabel", `Ton contexte : ${_stateDisplayFR[payload.market_state] || STATE_LABELS[payload.market_state] || payload.market_state}`);
  setText("marketStateText", `Lecture moteur : ${cockpit.market.label}`);
  setText("marketStateNote", "Lecture moteur intégrée.");
  setText("microConfidence", `${payload.score}/100`);
  setText("microRisk", `Risque ${payload.trigger_level.toLowerCase()}`);
  setText("agentName", payload.sniper_mode_final === "ON" ? "Sniper" : payload.attack_mode_final === "ON" ? "Attaque" : "Socle");
  setText("agentAlert", formatStatus(payload.trading_status));
  setText("agentDesc", simplifyText(payload.profile_reaction));
  setText("agentModeBadge", `Mode : ${cockpit.actionMode.label.toLowerCase()}`);
  const _ctx      = extractConfidenceCtx(payload);
  const _safeScore = computeConfidence(_ctx);
  const _strength  = mapStrength(_safeScore);
  const _flag      = mapFlag(_safeScore);

  const _posture = computePosture(_safeScore, _ctx.marketState);
  const _action  = computeAction(_safeScore, _ctx.marketState);
  const _agent   = computeAgent(_safeScore, _ctx.marketState);

  console.log("[ConfidenceScore]", { score: _safeScore, posture: _posture, action: _action, agent: _agent, ..._ctx });

  // Mises à jour immédiates
  setWidth("scoreBar", `${_safeScore}%`);
  setText("scoreSub",       _safeScore >= 70 ? "Contexte puissant" : _safeScore >= 40 ? "Contexte exploitable" : "Contexte fragile");
  setText("confidenceFlag", _flag);
  setText("score-posture",  _posture);
  setText("score-action",   translatePolicyAction(_action));
  setText("score-agent",    _agent);

  // Score animé — debounce 150ms pour absorber les updates rapides
  clearTimeout(_scoreAnimTimer);
  _scoreAnimTimer = setTimeout(() => animateScore($("scoreValue"), _safeScore), 150);

  const _scoreCard = document.getElementById("scoreCard");
  if (_scoreCard) {
    const _prev = _scoreCard.dataset.strength || "";
    if (_prev !== _strength) {
      _scoreCard.classList.remove("strength-pulse");
      void _scoreCard.offsetWidth;
      _scoreCard.classList.add("strength-pulse");
      clearTimeout(_scoreCard._pulseTimer);
      _scoreCard._pulseTimer = setTimeout(() => {
        _scoreCard.classList.remove("strength-pulse");
      }, 420);
    }
    _scoreCard.dataset.strength = _strength;
  }
  setText("engineMode", formatEngineMode(payload.engine_mode));
  setText("engineModeSub", cockpit.market.description);
  setText("attackStatus", formatStatus(payload.attack_mode_final));
  setText("attackSub", payload.attack_mode_final === "OFF"
    ? "Aucune offensive ouverte."
    : simplifyText(payload.action_recommended));
  setText("sniperMode", formatStatus(payload.sniper_mode_final));
  setText("sniperSub", payload.sniper_mode_final === "OFF"
    ? "Aucune entrée précise validée."
    : simplifyText(payload.validation?.summary));
  setText("tradingStatus", formatStatus(payload.trading_status));
  setText("tradingStatusNote", cockpit.market.action);
  const navDict = MARKET_DICTIONARY[getDictKey(cockpit.marketKey)] || {};
  setText("validationBadge", navDict.posture || cockpit.market.posture);
  setText("validationSummary", simplifyText(payload.validation?.summary));
  setText("alignmentScore", navDict.decision?.centrale || cockpit.market.decision);
  setText("alignmentNote", payload.alignment === "Bon"
    ? "Lecture cohérente."
    : `Alignement : ${payload.alignment}.`);
  setText("profileReaction", simplifyText(payload.profile_reaction));
  setText("executionFrame", simplifyText(payload.action_recommended));
  renderList("allowedActions", [cockpit.market.action, payload.action_recommended]);
  renderList("blockedActions", [cockpit.market.avoid]);
  renderList("postureActions", [cockpit.market.posture, payload.validation?.summary]);
  renderList("priorityActions", [cockpit.market.decision, ...(payload.trigger_intelligent?.reasons || [])]);
  setText("tableMiniSummary", simplifyText(payload.summary));
  setText("autoMarket", cockpit.market.label);
  setText("autoScore", `${payload.score}/100`);
  setText("autoMode", formatEngineMode(payload.engine_mode));
  setText("autoAttack", formatStatus(payload.attack_mode_raw));
  setText("autoSniper", formatStatus(payload.sniper_mode_raw));
  setText("profileFiltered", formatStatus(payload.trading_status));
  setActionMode(payload);
}

function renderPilotage(payload) {
  const cockpit = getCockpitModel(payload);
  const whyItems = meaningfulItems(
    ...(Array.isArray(payload.why) && payload.why.length
      ? payload.why
      : [
          `État : ${cockpit.market.label}.`,
          `Verdict : ${cockpit.market.verdict}.`,
          `Posture : ${cockpit.market.posture}.`,
          `Action : ${cockpit.market.action}.`,
          `Risque : ${cockpit.market.avoid}.`,
          `Mode : ${cockpit.actionMode.label}.`,
          `Validation : ${cockpit.validation}.`,
          `Score : ${payload.score}/100.`
        ])
  );
  const inconsistencies = meaningfulItems((payload.inconsistencies || []).map((item) => simplifyText(item)));
  const triggerReasons = meaningfulItems(payload.trigger_intelligent?.reasons || []);
  const triggerFallback = `${cockpit.market.description} Validation ${cockpit.validation.toLowerCase()}.`;

  setText("triggerBox", `Risque ${payload.trigger_level}`);
  setText("triggerReason", triggerReasons.join(" · ") || triggerFallback);
  renderTagRow("actionTags", payload.tags);

  setText("profileFilterBox", formatStatus(payload.trading_status));
  setText(
    "profileFilterReason",
    `${simplifyText(payload.profile_reaction)} Besoin d'action : ${formatToken(payload.need_action)} · Socle déjà en place : ${formatToken(payload.core_orders)}.`
  );

  renderList("whyBlock", whyItems);
  renderList("inconsistencyBlock", inconsistencies.length ? inconsistencies : ["Aucune incohérence critique détectée."]);

  setText("action", simplifyText(payload.action_recommended) || cockpit.market.action);
  setText("summary", simplifyText(payload.summary) || simplifyText(payload.validation?.summary) || cockpit.market.description);
  setText("coreText", "Priorité à la préservation du capital — engagement limité.");
  setText("attackText", `Filtre adaptatif : ${cockpit.actionMode.description}`);
  setText("buyZone", simplifyText(payload.order_zones.buy));
  setText("sellZone", simplifyText(payload.order_zones.sell));
  setText("riskZone", simplifyText(payload.order_zones.risk) || `Risque : ${payload.trigger_level}`);
  setText("jsonOutput", JSON.stringify(payload, null, 2));
}

function renderRightRail(payload) {
  const cockpit = getCockpitModel(payload);
  const decisionCopy = getDecisionCopy(payload);
  const dict = MARKET_DICTIONARY[getDictKey(cockpit.marketKey)] || {};
  const dictDecision = dict.decision?.centrale || decisionCopy.title;
  const toneMsg = getAdaptiveMessage(payload.market_state, payload.emotion_state);
  const dictRaison = toneMsg || dict.decision?.raison || decisionCopy.subtitle;
  const dictPosture = dict.posture || cockpit.market.posture;
  const INTENT_CLASS_MAP = {
    RANGE:       "intent-neutral",
    COMPRESSION: "intent-wait",
    BREAKOUT:    "intent-wait",
    TREND:       "intent-wait",
    DEFENSE:     "intent-danger",
    CHAOS:       "intent-danger",
    UNKNOWN:     "intent-neutral"
  };
  const intentClass = INTENT_CLASS_MAP[cockpit.marketKey] || "intent-neutral";
  setTextTwoLines("decisionSummaryHeadline", dictDecision, intentClass);
  setText("decisionSummaryText", dictRaison);
  setText("decisionAgentText", getActiveAgent(payload.decision));
  setText("decisionAvoidText", cockpit.market.avoid);
  setText("alertLevel", cockpit.market.label);
  setText("trafficLight", `Validation ${cockpit.validation}`);
  setTextTwoLines("decisionPanel", dictDecision, intentClass);
  setText("ultraShortPanel", dictRaison);

  setQueryText(".structured-shell .card-desc", "Trois repères. Lecture immédiate.");
  setQueryText(".master-card .card-desc", "État, risque, mode, validation.");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(1) .card-desc", "Signaux imposant réévaluation.");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(2) .card-desc", "Profil et validation modulés.");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(4) .card-title", "Incohérences");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(4) .card-desc", "Frottements setup / régime / validation.");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(5) .card-title", "Validation opérationnelle");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(5) .card-desc", "Statut avant exécution.");
  setQueryText(".side-panel .side-card:first-child .card-desc", "Décision. Posture. Risque.");
  setQueryText(".side-panel .side-card:first-child .decision-summary-card .tiny-label", "Décision centrale");
  setQueryText(".side-panel .side-card:first-child .history-item:nth-child(1) strong", "Régime");
  setQueryText(".side-panel .side-card:first-child .history-item:nth-child(2) strong", "Validation");
  setQueryText(".side-panel .side-card:first-child .history-item:nth-child(3) strong", "Décision");
  setQueryText(".side-panel .side-card:first-child .history-item:nth-child(4) strong", "Raison");
}

function renderPublications(payload) {
  const cockpit = getCockpitModel(payload);
  const shell = document.querySelector(".publications-shell");
  const grid = $("publicationsGrid");
  if (!grid || !shell) return;

  const articles = getArticlesForMarketState(cockpit.marketKey)
    .filter((article) => typeof article?.url === "string" && article.url.trim())
    .slice(0, 4);

  shell.hidden = (appState.activeTab || "moteur") !== "moteur" || articles.length === 0;
  if (!articles.length) return;

  setText("publicationsTitle", PUBLICATIONS_SECTION.title);
  setText("publicationsDescription", "Lectures complémentaires pour approfondir le contexte sans brouiller la décision.");
  setText("publicationsState", `${cockpit.market.label} · ${articles.length} lecture${articles.length > 1 ? "s" : ""}`);

  grid.innerHTML = "";
  articles.forEach((article, index) => {
    const title = extractArticleTitle(article.url);
    const card = document.createElement("a");
    card.className = "publication-card";
    card.href = article.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("aria-label", `Lire ${title} sur Paragraph`);

    const topRow = document.createElement("div");
    topRow.className = "publication-top-row";

    const number = document.createElement("div");
    number.className = "publication-index";
    number.textContent = String(index + 1).padStart(2, "0");

    const readingTime = document.createElement("div");
    readingTime.className = "publication-reading-time";
    readingTime.textContent = getPublicationReadingTime(article.url);

    topRow.append(number, readingTime);

    const badge = document.createElement("div");
    badge.className = "publication-badge";
    badge.textContent = formatArticleCategory(article.category);

    const heading = document.createElement("h3");
    heading.className = "publication-title";
    heading.textContent = title;

    const excerpt = document.createElement("p");
    excerpt.className = "publication-excerpt";
    excerpt.textContent = getPublicationSummary(article);

    const context = document.createElement("div");
    context.className = "publication-context";
    context.textContent = repairMojibake(`${cockpit.market.label} · ${formatProfile(payload.user_profile)} · ${cockpit.actionMode.label}`);

    const actions = document.createElement("div");
    actions.className = "publication-actions";

    const meta = document.createElement("div");
    meta.className = "publication-meta";
    meta.textContent = "Bibliothèque Paragraph";

    const cta = document.createElement("span");
    cta.className = "publication-link";
    cta.textContent = "Lire sur Paragraph";
    actions.append(meta, cta);
    card.append(topRow, badge, heading, excerpt, context, actions);
    grid.appendChild(card);
  });
}

function renderHistory() {
  const target = $("historyList");
  if (!target) return;

  const items = Array.isArray(appState.history) ? appState.history.slice(-HISTORY_LIMIT).reverse() : [];
  target.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "memory-box";
    empty.textContent = "Aucune lecture sauvegardée pour l'instant.";
    target.appendChild(empty);
  } else {
    items.forEach((item) => {
      const cockpit = getCockpitModel(item);
      const card = document.createElement("article");
      card.className = "memory-box memory-entry";
      const detailItems = [
        ["Verdict", cockpit.market.verdict],
        ["Posture", cockpit.market.posture],
        ["Action", cockpit.market.action],
        ["Blocage", cockpit.market.avoid]
      ];
      card.innerHTML = `
        <div class="memory-entry-head">
          <div>
            <div class="tiny-label">${asCleanText(item.updated_at || "")}</div>
            <div class="memory-entry-title">${cockpit.market.label}</div>
          </div>
          <div class="state-pill">${cockpit.validation}</div>
        </div>
        <div class="memory-entry-summary">${cockpit.market.decision}</div>
        <details class="memory-entry-detail">
          <summary>Détail</summary>
          <div class="memory-entry-grid">
            ${detailItems.map(([label, value]) => `<div class="memory-entry-item"><span>${label}</span><strong>${value}</strong></div>`).join("")}
          </div>
        </details>
      `;
      target.appendChild(card);
    });
  }

  document.querySelectorAll(".memory-entry-detail summary").forEach((summary) => {
    summary.textContent = "Détail";
  });

  setText("snapshotCount", String(items.length));
  setText("snapshotCountHero", String(items.length));
}

function renderDiagnostics() {
  setText("storageStatus", canUseStorage() ? "Disponible" : "Mémoire locale");
  setText("storageSize", estimateStateSize(appState));
  setText("lastSaved", appState.lastSaved ? new Date(appState.lastSaved).toLocaleString("fr-FR") : "Aucune");
  setText("snapshotCount", String(appState.history.length));
}

function sanitizeVisibleText(root = document.body) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => {
    const repaired = repairMojibake(node.nodeValue);
    if (repaired !== node.nodeValue) node.nodeValue = repaired;
  });
}

function renderMarketStateBrain() {
  const state      = (currentPayload?.market_state || "range").toUpperCase();
  const confidence = String(currentPayload?.score ?? 50);
  const volatility = VOLATILITY_MAP[currentPayload?.trigger_level] || "low";
  setText("market-regime",  BRAIN_STATE_LABELS_FR[state] || state);
  setText("market-score",   confidence);
  setText("market-context", VOLATILITY_FR[volatility] || volatility);
}

function renderDebugBrain() {
  const state      = (currentPayload?.market_state || "range").toUpperCase();
  const confidence = String(currentPayload?.score ?? 50);
  const volatility = VOLATILITY_MAP[currentPayload?.trigger_level] || "low";
  const trend      = TREND_MAP[currentPayload?.engine_mode] || "neutral";
  setText("db-state",      BRAIN_STATE_LABELS_FR[state] || state);
  setText("db-confidence", confidence);
  setText("db-volatility", volatility);
  setText("db-trend",      trend);
  if (currentPayload?.marketReading) {
    setText("db-reading", `${currentPayload.marketReading.state}:${currentPayload.marketReading.modifier} [${currentPayload.marketReading.risk}]`);
  }
  if (currentPayload?.decision) {
    const d = currentPayload.decision.primary || currentPayload.decision;
    setText("db-posture",    POSTURE_LABELS_FR[d.posture] || d.posture || "—");
    setText("db-actions",    d.actions);
    setText("db-risk-level", d.riskLevel);
  }
}

function getActiveAgent(decision) {
  const posture = decision?.primary?.posture || "";
  const MAP = {
    PROTECT: "DEFENDER",
    ATTACK:  "ATTACKER",
    WAIT:    "OBSERVER"
  };
  return MAP[posture] || "OBSERVER";
}

const AGENT_ACTION_MAP = {
  DEFENDER: "Le risque doit être réduit sans délai.",
  ATTACKER: "Une opportunité n'existe que si elle est validée.",
  EXECUTE:  "L'exécution suit le signal, jamais l'inverse.",
  OBSERVER: "L'absence de signal est une information."
};

function getAgentAction(agent) {
  return AGENT_ACTION_MAP[agent] || "Attendre / aucune action";
}

function renderActiveAgent() {
  const agent  = currentPayload ? getActiveAgent(currentPayload.decision) : "OBSERVER";
  const action = getAgentAction(agent);
  setText("active-agent",        AGENT_LABELS_FR[agent] || agent);
  setText("active-agent-action", action);
  setText("cerveau-synthesis",   getStateSynthesis(getCockpitModel(currentPayload)?.marketKey || "UNKNOWN"));
}

const RULES_MAP = {
  DEFENDER: {
    allowed:   ["réduire la position", "protéger le capital"],
    forbidden: ["nouvelles entrées", "augmenter le risque"]
  },
  ATTACKER: {
    allowed:   ["entrer en position", "augmenter l'exposition"],
    forbidden: ["vente panique"]
  },
  EXECUTE: {
    allowed:   ["entrer avec confirmation", "suivre le signal"],
    forbidden: ["contre-tendance", "entrer sans confirmation"]
  },
  OBSERVER: {
    allowed:   ["attendre"],
    forbidden: ["tout trade"]
  }
};

function getAgentRules(agent) {
  return RULES_MAP[agent] || { allowed: ["wait"], forbidden: ["any trade"] };
}

function renderCerveauAgent() {
  const agent = currentPayload ? getActiveAgent(currentPayload.decision) : "OBSERVER";
  const el = document.getElementById("debug-brain");
  if (!el) return;
  el.classList.remove("cerveau--defender", "cerveau--attacker", "cerveau--observer", "cerveau--execute");
  const CLASS_MAP = {
    DEFENDER: "cerveau--defender",
    ATTACKER: "cerveau--attacker",
    EXECUTE:  "cerveau--execute",
    OBSERVER: "cerveau--observer"
  };
  el.classList.add(CLASS_MAP[agent] || "cerveau--observer");

  el.classList.remove("intent-neutral", "intent-wait", "intent-danger");
  const marketKey = currentPayload ? getCockpitModel(currentPayload).marketKey : "UNKNOWN";
  const INTENT_MAP = {
    RANGE:       "intent-neutral",
    COMPRESSION: "intent-wait",
    BREAKOUT:    "intent-wait",
    TREND:       "intent-wait",
    DEFENSE:     "intent-danger",
    CHAOS:       "intent-danger",
    UNKNOWN:     "intent-neutral"
  };
  el.classList.add(INTENT_MAP[marketKey] || "intent-neutral");
}

// Applique la policy aux boutons [data-action] du cockpit.
// Indique visuellement les actions autorisées / interdites.
// Ne désactive jamais les boutons : ce sont des contrôles de navigation.
function applyPolicyToUI(policy) {
  document.querySelectorAll("[data-action]").forEach(btn => {
    const action  = btn.dataset.action || "";
    const allowed = canExecuteAction(action, policy);

    btn.style.opacity  = allowed ? "1" : "0.45";
    btn.style.cursor   = "pointer";

    btn.classList.remove("policy-action-allowed", "policy-action-forbidden");
    btn.classList.add(allowed ? "policy-action-allowed" : "policy-action-forbidden");
  });
}

// Injecte le message de la policy dans #policy-message.
function renderPolicyMessage(policy) {
  const el = document.getElementById("policy-message");
  if (!el) return;
  el.textContent = POLICY_MESSAGE_FR[policy.message] || policy.message || "";
}

function renderAgentRules() {
  // Source d'autorité : DecisionState (pas posture seule)
  const decisionState = currentPayload?.decisionState ?? { state: "WAIT", message: "" };
  const policy        = getTradingPolicy(decisionState.state);

  setText("rules-allowed",   policy.allowed.map(translatePolicyAction).join(", "));
  setText("rules-forbidden", policy.forbidden.map(translatePolicyAction).join(", "));
  if (decisionState.message) setText("cerveau-synthesis", decisionState.message);

  applyPolicyToUI(policy);
  renderPolicyMessage(policy);
}

function renderDecisionPanel() {
  const dec = currentPayload?.decision;
  if (!dec) return;
  const posture = dec.primary?.posture || "";
  setText("dp-primary",  POSTURE_LABELS_FR[posture] || posture || "—");
  setText("dp-best-alt", dec.bestAlternative?.posture  || "—");
}

function buildWhyReasons(payload) {
  const candidates = [];

  if (payload.validation?.state === "rejected")
    candidates.push({ key: "validation", priority: 100, text: "Validation refusée. Aucune entrée n'est méritée." });

  const alignment = payload.alignment || "";
  if (alignment === "Veto humain")
    candidates.push({ key: "veto", priority: 95, text: "Veto humain actif. La décision revient au trader." });

  const stateLabels = {
    range:       "Pas de signal exploitable. Rester en dehors évite un risque inutile.",
    compression: "Le marché se construit. Attendre est parfois la meilleure décision.",
    expansion:   "Momentum présent. Entrer uniquement sur signal propre et validé.",
    defense:     "Contexte risqué. Le risque impose une réduction d'exposition immédiate.",
    riskoff:     "Marché hostile. Le capital doit être protégé en priorité."
  };
  const stateKey = (payload.market_state || "range").toLowerCase();
  if (stateLabels[stateKey])
    candidates.push({ key: "state", priority: 80, text: stateLabels[stateKey] });

  const risk = payload.trigger_level || "";
  if (risk === "Élevé")
    candidates.push({ key: "risk", priority: 70, text: "Risque élevé. L'exposition doit être réduite, pas augmentée." });
  else if (risk === "Moyen")
    candidates.push({ key: "risk", priority: 60, text: "Risque moyen. Taille normale, aucune prise de risque supplémentaire." });

  const score = payload.score ?? 50;
  if (score < 30)
    candidates.push({ key: "score", priority: 55, text: "Score insuffisant. Sans signal clair, aucune entrée n'est justifiée." });
  else if (score < 50)
    candidates.push({ key: "score", priority: 50, text: "Confiance modérée. Forcer une position augmente le risque inutilement." });
  else if (score < 70)
    candidates.push({ key: "score", priority: 45, text: "Score acceptable. Observer sans précipiter la décision." });
  else
    candidates.push({ key: "score", priority: 40, text: "Score solide. Le contexte mérite une décision structurée." });

  const emotion = payload.emotion_state || "";
  if (emotion === "stress")
    candidates.push({ key: "emotion", priority: 35, text: "État de stress. Agir sous pression augmente le risque d'erreur." });
  else if (emotion === "fomo")
    candidates.push({ key: "emotion", priority: 35, text: "FOMO détecté. Forcer une entrée émotionnelle est risqué." });
  else if (emotion === "calm")
    candidates.push({ key: "emotion", priority: 10, text: "État calme. Le filtre émotionnel est validé." });

  if (alignment === "Fragile")
    candidates.push({ key: "alignment", priority: 30, text: "Alignement fragile. Signal peu fiable, observer seulement." });

  const fire = payload.constellium?.fire || "";
  if (fire === "weak")
    candidates.push({ key: "btc", priority: 20, text: "Constellium faible. La confirmation est insuffisante pour agir." });

  return candidates.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

function renderWhyDecision(payload) {
  const primary   = $("whyDecisionPrimary");
  const secondary = $("whyDecisionSecondary");
  if (!primary || !secondary) return;

  primary.textContent = "";
  secondary.innerHTML = "";

  const reasons = buildWhyReasons(payload);
  if (!reasons.length) return;

  primary.textContent = reasons[0].text;

  reasons.slice(1).forEach((r) => {
    const li = document.createElement("li");
    li.className = "why-decision-item";
    li.textContent = r.text;
    secondary.appendChild(li);
  });
}

function getDecisionAwareActionPlan(payload) {
  const ds = computeDecisionState(payload);

  if (ds.state === "BLOCKED" || ds.state === "PROTECT") {
    return {
      tone: "danger",
      now: [
        "Réduire l'exposition",
        "Protéger le capital",
        "Pas de nouvelle position"
      ],
      prepare: [
        "Identifier zones de support",
        "Préparer position défensive",
        "Attendre stabilisation"
      ]
    };
  }

  if (ds.state === "WAIT") {
    return {
      tone: "wait",
      now: [
        "Observer sans forcer",
        "Ne pas anticiper"
      ],
      prepare: [
        "Identifier zones clés",
        "Préparer les niveaux",
        "Attendre signal clair"
      ]
    };
  }

  if (ds.state === "READY" || ds.state === "TENSION") {
    return {
      tone: "wait",
      now: [
        "Attendre confirmation",
        "Ne pas anticiper"
      ],
      prepare: [
        "Préparer l'entrée",
        "Préparer scénario de validation",
        "Définir stop et taille"
      ]
    };
  }

  return {
    tone: "active",
    now: [
      "Exécuter sur signal valide",
      "Gérer risque dès entrée"
    ],
    prepare: [
      "Préparer allègement partiel",
      "Préparer scénario suivant"
    ]
  };
}

// Single source of truth for action plan
// Source : payload.decisionState.state + payload.emotion_state — format 3 lignes fixe
function getActionPlan(payload) {
  const state   = payload.decisionState?.state;
  const emotion = (payload.emotion_state || "").toLowerCase();

  if (state === "BLOCKED") {
    switch (emotion) {
      case "fomo":
        return [
          "Maintenant → Stop immédiat",
          "Préparer → Couper écran / attendre reset",
          "Interdit → Toute entrée"
        ];
      case "revenge":
        return [
          "Maintenant → Stop immédiat",
          "Préparer → Revenir au plan strict",
          "Interdit → Augmenter taille / forcer trade"
        ];
      case "overtrading":
        return [
          "Maintenant → Ralentir fortement",
          "Préparer → Réduire fréquence",
          "Interdit → Multiplier les entrées"
        ];
      case "tilt":
        return [
          "Maintenant → Arrêt immédiat",
          "Préparer → Quitter session",
          "Interdit → Toute activité trading"
        ];
      default:
        return [
          "Maintenant → Stop immédiat",
          "Préparer → Revenir au plan",
          "Interdit → Forcer une entrée"
        ];
    }
  }

  if (state === "PROTECT") {
    return [
      "Maintenant → Réduire exposition",
      "Préparer → Nettoyer positions fragiles",
      "Interdit → Augmenter taille"
    ];
  }

  if (state === "NEUTRAL" || state === "WAIT") {
    return [
      "Maintenant → Observer",
      "Préparer → Identifier niveau clé",
      "Interdit → Entrée impulsive"
    ];
  }

  if (state === "ALIGNED") {
    return [
      "Maintenant → Exécuter propre",
      "Préparer → Plan de sortie",
      "Interdit → Sur-engagement"
    ];
  }

  return [
    "Maintenant → —",
    "Préparer → —",
    "Interdit → —"
  ];
}

const PLAN_TONE_MAP = {
  BLOCKED: "danger",
  PROTECT: "wait",
  WAIT:    "wait",
  READY:   "wait",
  TENSION: "wait",
  ALIGNED: "active"
};

function renderActionPlan(payload) {
  const container = $("actionPlan");
  if (!container) return;

  const lines = getActionPlan(payload);
  const tone  = PLAN_TONE_MAP[payload.decisionState?.state] || "neutral";

  setPlanCardState(tone);

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "action-plan";
  lines.forEach((text) => {
    const d = document.createElement("div");
    d.textContent = text;
    wrap.appendChild(d);
  });
  container.appendChild(wrap);
}

function applyFocusState(payload) {
  const ds   = payload.decisionState ?? computeDecisionState(payload);
  const root = document.querySelector("#app") || document.body;

  root.querySelectorAll(".focus-primary, .focus-secondary").forEach(el => {
    el.classList.remove("focus-primary", "focus-secondary");
  });

  const lectureDay    = document.querySelector(".lecture-day-card");
  const actionPlan    = document.querySelector("#actionPlanCard");
  const signalNarratif = document.querySelector(".signal-narratif");

  [lectureDay, actionPlan, signalNarratif].forEach(el => {
    if (el) el.classList.add("focus-secondary");
  });

  switch (ds?.state) {
    case "BLOCKED":
      if (lectureDay) lectureDay.classList.add("focus-primary");
      break;
    case "PROTECT":
      if (lectureDay) lectureDay.classList.add("focus-primary");
      if (actionPlan) actionPlan.classList.add("focus-primary");
      break;
    case "WAIT":
    case "READY":
    case "ALIGNED":
      if (actionPlan) actionPlan.classList.add("focus-primary");
      break;
    case "TENSION":
      if (signalNarratif) signalNarratif.classList.add("focus-primary");
      break;
    default:
      if (lectureDay) lectureDay.classList.add("focus-primary");
  }
}

function getMentalReset(payload) {
  const emotion = (payload.emotion_state || "").toLowerCase();
  if (emotion === "fomo") {
    return ["FOMO détecté.", "Coupe l'écran.", "Reviens au calme."];
  }
  if (emotion === "stress" || emotion === "tension") {
    return ["Tension détectée.", "Réduis l'exposition.", "Ne force rien."];
  }
  return null;
}

function renderMentalReset(payload) {
  const card      = $("mentalResetCard");
  const container = $("mentalReset");
  if (!card || !container) return;

  const lines = getMentalReset(payload);

  if (!lines || lines.length === 0) {
    card.style.display = "none";
    container.innerHTML = "";
    return;
  }

  card.style.display = "block";
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "mental-reset";
  lines.forEach((text) => {
    const d = document.createElement("div");
    d.textContent = text;
    wrap.appendChild(d);
  });
  container.appendChild(wrap);
}

function setPlanCardState(tone) {
  const el = $("actionPlanCard");
  if (!el) return;
  el.classList.remove("plan-neutral", "plan-wait", "plan-danger", "plan-active");
  const PLAN_CLASS_MAP = {
    neutral: "plan-neutral",
    wait:    "plan-wait",
    danger:  "plan-danger",
    active:  "plan-active"
  };
  el.classList.add(PLAN_CLASS_MAP[tone] || "plan-neutral");
}

function getExecutionLevel(payload) {
  const ds = payload.decisionState;

  if (ds.state === "BLOCKED") return {
    permission: "❌ Bloqué",
    actionType: "Aucune exécution",
    intensity:  "Nulle",
    risk:       "Élevé"
  };

  if (ds.state === "PROTECT") return {
    permission: "Protéger",
    actionType: "Réduire l'exposition",
    intensity:  "Faible",
    risk:       "Élevé"
  };

  if (ds.state === "WAIT") return {
    permission: "Attendre",
    actionType: "Observer et préparer",
    intensity:  "Faible",
    risk:       "Moyen"
  };

  if (ds.state === "READY" || ds.state === "TENSION") return {
    permission: "Préparer",
    actionType: "Surveiller l'entrée",
    intensity:  "Mesurée",
    risk:       "Moyen"
  };

  return {
    permission: "Agir",
    actionType: "Entrer et gérer",
    intensity:  "Active",
    risk:       "Contrôlé"
  };
}

function renderExecutionLevel(payload) {
  // PRIORITÉ ABSOLUE — verrou décisionnel
  if (payload.decisionState?.state === "BLOCKED") {
    setText("execPermission", "❌ Bloqué");
    setText("execActionType", "Aucune exécution");
    setText("execIntensity",  "Nulle");
    setText("execRisk",       "Élevé");
    return;
  }

  // Base depuis decisionState
  const level = getExecutionLevel(payload);

  // Modulation par engagement_level — wording + intensité uniquement (jamais en hausse)
  const el = payload.engagement_level;
  if (el === "NONE" || el === "MINIMAL") {
    level.permission = el === "NONE" ? "❌ Suspendu" : "⚠️ Observer";
    level.actionType = "Observer";
    level.intensity  = "Nulle";
  } else if (el === "REDUCED") {
    level.permission = "⚠️ Réduit";
  }
  // NEUTRAL, FULL : base decisionState conservée

  setText("execPermission", level.permission);
  setText("execActionType", level.actionType);
  setText("execIntensity",  level.intensity);
  setText("execRisk",       level.risk);
}

function getPositionManagement(payload) {
  const ds = payload.decisionState;

  if (ds.state === "BLOCKED") return {
    size:    "0%",
    mode:    "Flat uniquement",
    entry:   "Aucune entrée",
    exit:    "Aucune gestion active",
    maxRisk: "Élevé",
    status:  "Marché bloqué"
  };

  if (ds.state === "PROTECT") return {
    size:    "Très faible",
    mode:    "Défensif",
    entry:   "Pas de nouvelle position",
    exit:    "Réduire ou protéger",
    maxRisk: "Élevé",
    status:  "Protection du capital"
  };

  if (ds.state === "WAIT") return {
    size:    "Faible",
    mode:    "Observation active",
    entry:   "Attendre signal",
    exit:    "Conserver position",
    maxRisk: "Moyen",
    status:  "Préparation uniquement"
  };

  if (ds.state === "READY") return {
    size:    "Légère",
    mode:    "Sous condition",
    entry:   "Sur validation",
    exit:    "Préparer sortie partielle",
    maxRisk: "Moyen",
    status:  "Setup proche"
  };

  if (ds.state === "TENSION") return {
    size:    "Mesurée",
    mode:    "Exécution surveillée",
    entry:   "Entrée disciplinée",
    exit:    "Couper si rejet",
    maxRisk: "Moyen",
    status:  "Fenêtre fragile"
  };

  return {
    size:    "Normale",
    mode:    "Gestion active",
    entry:   "Entrée autorisée",
    exit:    "Allègement progressif",
    maxRisk: "Contrôlé",
    status:  "Fenêtre ouverte"
  };
}

function renderPositionManagement(payload) {
  // PRIORITÉ ABSOLUE — validation rejetée ou engagement nul
  if (payload.decisionState?.state === "BLOCKED" || payload.engagement_level === "NONE") {
    setText("pmSize",    "0%");
    setText("pmMode",    "Flat uniquement");
    setText("pmEntry",   "Aucune entrée");
    setText("pmExit",    "Aucune gestion active");
    setText("pmMaxRisk", "Élevé");
    setText("pmStatus",  "Marché bloqué");
    return;
  }

  // Engagement minimal : aligner avec Niveau d'exécution (observation uniquement)
  if (payload.engagement_level === "MINIMAL") {
    setText("pmSize",    "Faible");
    setText("pmMode",    "Observation active");
    setText("pmEntry",   "Attendre signal");
    setText("pmExit",    "Conserver position");
    setText("pmMaxRisk", "Moyen");
    setText("pmStatus",  "Préparation uniquement");
    return;
  }

  const pm = getPositionManagement(payload);

  // Suffixe adaptatif selon sizing_factor
  const sf = payload.sizing_factor;
  let suffix = "";
  if      (sf === 0.75) suffix = " (léger ajustement)";
  else if (sf === 0.5)  suffix = " (réduit)";
  else if (sf === 0.25) suffix = " (minimal)";

  // Applique le suffixe sur les champs modulables uniquement (guard sur valeurs nulles)
  const addSuffix = (base) => (sf != null && base !== "0" && base !== "0%") ? base + suffix : base;

  setText("pmSize",    addSuffix(pm.size));
  setText("pmMode",    addSuffix(pm.mode));
  setText("pmEntry",   addSuffix(pm.entry));
  setText("pmExit",    addSuffix(pm.exit));
  setText("pmMaxRisk", pm.maxRisk);
  setText("pmStatus",  pm.status);
}

function getTradeScenarios(payload) {
  const ds = computeDecisionState(payload);

  if (ds.state === "BLOCKED") return {
    ifValidation: "Aucune action tant que le blocage n'est pas levé",
    ifRejection:  "Rester hors marché",
    ifStagnation: "Observer uniquement"
  };

  if (ds.state === "PROTECT") return {
    ifValidation: "Allègement ou protection prioritaire",
    ifRejection:  "Réduire encore si nécessaire",
    ifStagnation: "Ne pas relancer de position"
  };

  if (ds.state === "WAIT") return {
    ifValidation: "Préparer une entrée légère si confirmation",
    ifRejection:  "Rester en observation",
    ifStagnation: "Continuer à attendre sans anticiper"
  };

  if (ds.state === "READY") return {
    ifValidation: "Entrée possible sous condition",
    ifRejection:  "Annuler l'idée d'entrée",
    ifStagnation: "Conserver le plan sans forcer"
  };

  if (ds.state === "TENSION") return {
    ifValidation: "Exécution possible avec discipline",
    ifRejection:  "Sortie rapide ou retour en attente",
    ifStagnation: "Ne pas sur-engager"
  };

  return {
    ifValidation: "Laisser vivre le setup et gérer la position",
    ifRejection:  "Réduire ou couper rapidement",
    ifStagnation: "Gérer sans sur-ajouter"
  };
}

function renderTradeScenarios(payload) {
  // PRIORITÉ ABSOLUE — validation rejetée
  if (payload.validation?.state === "rejected") {
    setText("scIfValidation", "Aucune entrée • Éviter toute exposition");
    setText("scIfRejection",  "Couper rapidement • Protéger le capital");
    setText("scIfStagnation", "Rester flat • Attendre nouveau signal");
    return;
  }

  // PRIORITÉ 2 — engagement_level (filtre adaptatif)
  const ENGAGEMENT_SCENARIOS = {
    NONE: {
      ifValidation: "Ne pas intervenir • Laisser passer",
      ifRejection:  "Ignorer le mouvement • Aucun impact",
      ifStagnation: "Observer uniquement"
    },
    MINIMAL: {
      ifValidation: "Observation active • Pas d'entrée immédiate",
      ifRejection:  "Rester en dehors • Confirmer faiblesse",
      ifStagnation: "Attendre confirmation"
    },
    REDUCED: {
      ifValidation: "Entrée légère possible • Tester le mouvement",
      ifRejection:  "Réduire rapidement • Limiter perte",
      ifStagnation: "Réduire exposition"
    },
    NEUTRAL: {
      ifValidation: "Attendre confirmation • Préparer entrée",
      ifRejection:  "Sortie partielle • Réévaluer",
      ifStagnation: "Maintenir sans renforcer"
    },
    FULL: {
      ifValidation: "Renforcer position • Suivre le momentum",
      ifRejection:  "Sortie rapide • Protéger gains",
      ifStagnation: "Alléger partiellement"
    }
  };

  // FALLBACK — engagement_level absent ou inconnu : comportement actuel conservé
  const sc = ENGAGEMENT_SCENARIOS[payload.engagement_level] ?? getTradeScenarios(payload);
  setText("scIfValidation", sc.ifValidation);
  setText("scIfRejection",  sc.ifRejection);
  setText("scIfStagnation", sc.ifStagnation);
}

function getRiskManagement(payload) {
  const ds = computeDecisionState(payload);

  if (ds.state === "BLOCKED") return {
    riskPerTrade: "0%",
    positionSize: "0",
    maxExposure:  "0",
    rrMinimum:    "N/A"
  };

  if (ds.state === "PROTECT") return {
    riskPerTrade: "0.25%",
    positionSize: "Très faible",
    maxExposure:  "Minimale",
    rrMinimum:    "Élevé uniquement"
  };

  if (ds.state === "WAIT") return {
    riskPerTrade: "0.5%",
    positionSize: "Faible",
    maxExposure:  "Contrôlée",
    rrMinimum:    "≥ 2"
  };

  if (ds.state === "READY") return {
    riskPerTrade: "1%",
    positionSize: "Normale",
    maxExposure:  "Standard",
    rrMinimum:    "≥ 2"
  };

  if (ds.state === "TENSION") return {
    riskPerTrade: "0.75%",
    positionSize: "Modérée",
    maxExposure:  "Prudente",
    rrMinimum:    "≥ 2.5"
  };

  return {
    riskPerTrade: "1% - 2%",
    positionSize: "Active",
    maxExposure:  "Optimisée",
    rrMinimum:    "≥ 3"
  };
}

function renderRiskManagement(payload) {
  // PRIORITÉ ABSOLUE — engagement nul
  if (payload.engagement_level === "NONE") {
    setText("rmRiskPerTrade", "0%");
    setText("rmPositionSize", "0 — aucun engagement");
    setText("rmMaxExposure",  "0% — aucun engagement");
    setText("rmRrMinimum",    "N/A");
    return;
  }

  const rm = getRiskManagement(payload);

  // Suffixe adaptatif selon sizing_factor
  const sf = payload.sizing_factor;
  let suffix = "";
  if      (sf === 0.75) suffix = " (léger ajustement)";
  else if (sf === 0.5)  suffix = " (réduit)";
  else if (sf === 0.25) suffix = " (minimal)";

  // Applique le suffixe uniquement si sizing_factor présent et valeur non nulle
  const addSuffix = (base) => (sf != null && base !== "0") ? base + suffix : base;

  setText("rmRiskPerTrade", rm.riskPerTrade);
  setText("rmPositionSize", addSuffix(rm.positionSize));
  setText("rmMaxExposure",  addSuffix(rm.maxExposure));
  setText("rmRrMinimum",    rm.rrMinimum);
}

function getTradeSetup(payload) {
  const ds = computeDecisionState(payload);

  if (ds.state === "BLOCKED") return {
    entryPoint:          "Aucune entrée",
    validationCondition: "Blocage à lever",
    invalidation:        "Marché non tradable",
    timing:              "Aucun timing actif"
  };

  if (ds.state === "PROTECT") return {
    entryPoint:          "Pas de nouvelle entrée",
    validationCondition: "Retour d'un contexte plus propre",
    invalidation:        "Nouvelle dégradation",
    timing:              "Défensif"
  };

  if (ds.state === "WAIT") return {
    entryPoint:          "Zone à préparer",
    validationCondition: "Confirmation propre",
    invalidation:        "Absence de signal",
    timing:              "Patience"
  };

  if (ds.state === "READY") return {
    entryPoint:          "Entrée sous condition",
    validationCondition: "Validation du setup",
    invalidation:        "Rejet immédiat",
    timing:              "Pré-exécution"
  };

  if (ds.state === "TENSION") return {
    entryPoint:          "Entrée possible mais surveillée",
    validationCondition: "Signal net sans ambiguïté",
    invalidation:        "Reprise contraire rapide",
    timing:              "Fenêtre fragile"
  };

  return {
    entryPoint:          "Entrée autorisée",
    validationCondition: "Structure confirmée",
    invalidation:        "Cassure invalide / rejet",
    timing:              "Exécution active"
  };
}

function renderTradeSetup(payload) {
  // PRIORITÉ ABSOLUE — validation rejetée
  if (payload.validation?.state === "rejected") {
    setText("tsEntryPoint",          "Aucune entrée");
    setText("tsValidationCondition", "Blocage à lever");
    setText("tsInvalidation",        "Marché non tradable");
    setText("tsTiming",              "Aucun timing actif");
    return;
  }

  // PRIORITÉ 2 — engagement_level (filtre adaptatif)
  const ENGAGEMENT_SETUP = {
    NONE: {
      entryPoint:          "Aucune entrée",
      validationCondition: "Pas de setup exploitable",
      invalidation:        "Contexte insuffisant",
      timing:              "Attente passive"
    },
    MINIMAL: {
      entryPoint:          "Zone à observer",
      validationCondition: "Confirmation nette requise",
      invalidation:        "Signal trop faible",
      timing:              "Patience"
    },
    REDUCED: {
      entryPoint:          "Entrée prudente possible",
      validationCondition: "Setup propre mais réduit",
      invalidation:        "Rejet rapide",
      timing:              "Fenêtre courte"
    },
    NEUTRAL: {
      entryPoint:          "Entrée sous condition",
      validationCondition: "Confirmation structurelle",
      invalidation:        "Absence de suivi",
      timing:              "Pré-exécution"
    },
    FULL: {
      entryPoint:          "Entrée autorisée",
      validationCondition: "Structure confirmée",
      invalidation:        "Cassure invalide / rejet",
      timing:              "Exécution active"
    }
  };

  // FALLBACK — engagement_level absent ou inconnu : comportement actuel conservé
  const ts = ENGAGEMENT_SETUP[payload.engagement_level] ?? getTradeSetup(payload);
  setText("tsEntryPoint",          ts.entryPoint);
  setText("tsValidationCondition", ts.validationCondition);
  setText("tsInvalidation",        ts.invalidation);
  setText("tsTiming",              ts.timing);
}

function getLiveTradeManagement(payload) {
  const ds = computeDecisionState(payload);

  if (ds.state === "BLOCKED") return {
    tradeStatus:     "Hors trade",
    immediateAction: "Aucune action",
    ifContinuation:  "Ne pas poursuivre",
    ifRejection:     "Rester flat",
    protection:      "Maximale",
    gainManagement:  "Non concerné"
  };

  if (ds.state === "PROTECT") return {
    tradeStatus:     "Position défensive",
    immediateAction: "Réduire / protéger",
    ifContinuation:  "Ne pas recharger agressivement",
    ifRejection:     "Couper encore si nécessaire",
    protection:      "Prioritaire",
    gainManagement:  "Sécuriser ce qui peut l'être"
  };

  if (ds.state === "WAIT") return {
    tradeStatus:     "Attente active",
    immediateAction: "Observer seulement",
    ifContinuation:  "Ne pas chasser le mouvement",
    ifRejection:     "Rester neutre",
    protection:      "Aucun engagement inutile",
    gainManagement:  "Non concerné"
  };

  if (ds.state === "READY") return {
    tradeStatus:     "Setup proche",
    immediateAction: "Surveiller le déclenchement",
    ifContinuation:  "Entrer seulement si validation",
    ifRejection:     "Annuler l'idée",
    protection:      "Engagement léger",
    gainManagement:  "Préparer un allègement"
  };

  if (ds.state === "TENSION") return {
    tradeStatus:     "Trade fragile",
    immediateAction: "Gérer serré",
    ifContinuation:  "Laisser vivre sans surcharger",
    ifRejection:     "Sortie rapide",
    protection:      "Rapprochée",
    gainManagement:  "Prendre partiel vite si nécessaire"
  };

  return {
    tradeStatus:     "Trade actif",
    immediateAction: "Accompagner le mouvement",
    ifContinuation:  "Laisser courir proprement",
    ifRejection:     "Alléger ou couper selon violence",
    protection:      "Remonter la sécurité",
    gainManagement:  "Allègement progressif possible"
  };
}

function renderLiveTradeManagement(payload) {
  // PRIORITÉ ABSOLUE — validation rejetée
  if (payload.validation?.state === "rejected") {
    setText("ltTradeStatus",     "Hors trade");
    setText("ltImmediateAction", "Aucune action");
    setText("ltIfContinuation",  "Ne pas poursuivre");
    setText("ltIfRejection",     "Rester flat");
    setText("ltProtection",      "Maximale");
    setText("ltGainManagement",  "Non concerné");
    return;
  }

  // PRIORITÉ 2 — engagement_level (filtre adaptatif)
  const ENGAGEMENT_LIVE = {
    NONE: {
      tradeStatus:     "Hors trade",
      immediateAction: "Ne pas intervenir",
      ifContinuation:  "Laisser passer",
      ifRejection:     "Aucun impact",
      protection:      "Aucune exposition",
      gainManagement:  "Non concerné"
    },
    MINIMAL: {
      tradeStatus:     "Observation active",
      immediateAction: "Observer seulement",
      ifContinuation:  "Ne pas chasser",
      ifRejection:     "Rester dehors",
      protection:      "Très prudente",
      gainManagement:  "Non concerné"
    },
    REDUCED: {
      tradeStatus:     "Trade léger",
      immediateAction: "Entrée prudente",
      ifContinuation:  "Accompagner sans surcharger",
      ifRejection:     "Réduire vite",
      protection:      "Serrée",
      gainManagement:  "Prendre partiel vite"
    },
    NEUTRAL: {
      tradeStatus:     "Trade préparatoire",
      immediateAction: "Attendre validation claire",
      ifContinuation:  "Entrer si confirmation",
      ifRejection:     "Réévaluer",
      protection:      "Contrôlée",
      gainManagement:  "Préparer allègement"
    },
    FULL: {
      tradeStatus:     "Trade actif",
      immediateAction: "Accompagner le mouvement",
      ifContinuation:  "Laisser courir proprement",
      ifRejection:     "Alléger ou couper",
      protection:      "Remonter la sécurité",
      gainManagement:  "Allègement progressif"
    }
  };

  // FALLBACK — engagement_level absent ou inconnu : comportement actuel conservé
  const lt = ENGAGEMENT_LIVE[payload.engagement_level] ?? getLiveTradeManagement(payload);
  setText("ltTradeStatus",     lt.tradeStatus);
  setText("ltImmediateAction", lt.immediateAction);
  setText("ltIfContinuation",  lt.ifContinuation);
  setText("ltIfRejection",     lt.ifRejection);
  setText("ltProtection",      lt.protection);
  setText("ltGainManagement",  lt.gainManagement);
}

function pushDecisionSnapshot(payload) {
  const snapshot = {
    time:           new Date().toLocaleTimeString(),
    status:         payload.trading_status,
    engagement:     payload.engagement_level,
    sizing:         payload.sizing_factor,
    validation:     payload.validation?.state,
    validationNote: payload.validation?.note || "",
    journalNote:    appState.form?.journalNote || ""
  };

  // Ne push que si la décision a changé
  const key = (s) => `${s.status}|${s.engagement}|${s.sizing}|${s.validation}`;
  if (decisionHistory.length > 0 && key(decisionHistory[0]) === key(snapshot)) return;

  decisionHistory.unshift(snapshot);
  if (decisionHistory.length > 5) decisionHistory.pop();
}

function renderDecisionHistory() {
  const container = document.getElementById("jdHistory");
  if (!container) return;
  container.innerHTML = decisionHistory.map(d =>
    `<div class="history-item">
       <strong>${d.time}</strong>
       <div class="muted">${d.status} · ${d.engagement} · ${d.sizing}</div>
     </div>`
  ).join("");
}

function computeDecisionPattern() {
  if (decisionHistory.length < 3) return "Pas assez de données";

  const last   = decisionHistory.slice(0, 3);
  const states = last.map(d => (d.engagement || "").toUpperCase());

  if (states.every(s => s === "NONE" || s === "MINIMAL"))
    return "Tu hésites — aucune décision claire sur les 3 derniers états";

  if (states[0] === "NONE" && states[1] === "REDUCED" && states[2] === "FULL")
    return "Tu réduis progressivement ton engagement";

  if (states[0] === "FULL" && states[1] === "FULL")
    return "Engagement fort maintenu";

  return "Comportement neutre";
}

function computeDecisionScore() {
  if (decisionHistory.length === 0) return 0;

  const scoreMap = { "FULL": 2, "REDUCED": 1, "NEUTRAL": 0, "MINIMAL": 0, "NONE": 0 };

  let total = 0;
  decisionHistory.forEach(d => {
    const engagement = (d.engagement || "").toUpperCase();
    const validation = (d.validation || "").toUpperCase();
    let base = scoreMap[engagement] ?? 0;
    if (validation === "REJECTED") base -= 1;
    total += base;
  });

  return (total / decisionHistory.length).toFixed(1);
}

function renderDecisionInsights() {
  setText("jdPattern", computeDecisionPattern());
  setText("jdScore",   computeDecisionScore());
}

function computeBehaviorAlert() {
  if (decisionHistory.length < 3) return "";

  const last   = decisionHistory.slice(0, 3);
  const states = last.map(d => (d.engagement || "").toUpperCase());

  // 1. Sur-réaction (priorité max)
  if (states[0] === "FULL" && states[1] === "NONE" && states[2] === "FULL")
    return "⚠️ Tu sur-réagis — instabilité forte";

  // 2. Hésitation
  if (states.every(s => s === "NONE" || s === "MINIMAL"))
    return "⚠️ Tu hésites trop — aucune décision claire";

  // 3. Instabilité simple
  if (new Set(states).size >= 3)
    return "⚠️ Instabilité décisionnelle";

  return "";
}

function renderBehaviorAlert() {
  setText("jdAlert", computeBehaviorAlert() || "Aucune alerte");
}

function renderBehaviorInfluence() {
  const BHV_KEY = 'cameleon.behavior.v1.coherenceLevel';
  let level = null;
  try { level = JSON.parse(localStorage.getItem(BHV_KEY)); } catch {}
  const TEXT = {
    'Élevée':  'Cadre respecté. Aucune influence comportementale particulière.',
    'Bonne':   'Discipline correcte. Éviter d\'accélérer inutilement.',
    'Moyenne': 'Vigilance : ralentir légèrement et revenir au cadre habituel.',
    'Faible':  'Prudence renforcée : risque de dérive comportementale.'
  };
  const panel = $('bhvInfluencePanel');
  if (!panel) return;
  if (!level || !TEXT[level]) { panel.style.display = 'none'; return; }
  panel.style.display = '';
  setText('bhvInfluenceLevel', level);
  setText('bhvInfluenceText',  TEXT[level]);
}

function computeAlertStats() {
  const stats = { hesitation: 0, overreaction: 0, instability: 0 };

  decisionHistory.forEach(d => {
    const e = (d.engagement || "").toUpperCase();
    if (e === "NONE" || e === "MINIMAL") stats.hesitation++;
  });

  for (let i = 0; i < decisionHistory.length - 2; i++) {
    const s1 = (decisionHistory[i].engagement   || "").toUpperCase();
    const s2 = (decisionHistory[i+1].engagement || "").toUpperCase();
    const s3 = (decisionHistory[i+2].engagement || "").toUpperCase();
    if (s1 === "FULL" && s2 === "NONE" && s3 === "FULL") stats.overreaction++;
    if (new Set([s1, s2, s3]).size >= 3) stats.instability++;
  }

  return stats;
}

function computeMetaMessage(stats) {
  if (stats.overreaction >= 2) return "⚠️ Tu sur-réagis régulièrement";
  if (stats.hesitation   >= 3) return "⚠️ Tu hésites souvent";
  if (stats.instability  >= 2) return "⚠️ Comportement instable";
  return "Comportement global stable";
}

function computeBehaviorBadge(stats) {
  const total = stats.hesitation + stats.overreaction + stats.instability;
  if (total <= 1) return "🟢 Stable";
  if (total <= 3) return "🟡 À surveiller";
  return "🔴 Instable";
}

function renderMetaLayer() {
  const stats = computeAlertStats();
  setText("jdMetaMessage", computeMetaMessage(stats));
  setText("jdMetaBadge",   computeBehaviorBadge(stats));
}

function renderJournalDecision(payload) {
  const STATE_LABELS = {
    pending:  "En attente",
    accepted: "Validée",
    adjusted: "Validée sous contrainte",
    rejected: "Refusée"
  };

  // Validation state traduit
  setText("jdValidationState", STATE_LABELS[payload.validation?.state] || "—");

  // Note de validation (depuis le payload)
  const note = (payload.validation?.note || "").trim();
  setText("jdValidationNote", note || "Aucune note saisie");

  // Note de session (depuis le formulaire — hors moteur)
  const journal = (appState.form?.journalNote || "").trim();
  setText("jdJournalNote", journal || "Aucune note de session");

  // Résumé moteur court
  const status = payload.trading_status   || "—";
  const el     = payload.engagement_level || "—";
  const sf     = payload.sizing_factor != null ? payload.sizing_factor : "—";
  setText("jdMoteurSummary", `${status} · engagement ${el} · sizing ${sf}`);
}

function renderConfidenceContext(payload) {
  const panel = document.querySelector(".confidence-panel");
  if (!panel) return;

  const qual = (v) => v === "strong" ? 80 : v === "medium" ? 50 : v === "weak" ? 20 : 50;

  const inputs = {
    trend: Math.min(100, Math.max(0,
      (payload.market_state === "expansion"   ? 75 :
       payload.market_state === "compression" ? 50 :
       payload.market_state === "defense"     ? 15 :
       payload.market_state === "riskoff"     ? 5  : 40)
      + (payload.btc_state === "strong" ? 10 : payload.btc_state === "weak" ? -10 : 0)
      + (qual(payload.constellium?.fire) - 50) * 0.3
    )),

    structure: payload.setup_inputs?.structure_signal === "compression_breakout" ? 90 :
               payload.setup_inputs?.structure_signal === "real_breakout"         ? 90 :
               payload.setup_inputs?.structure_signal === "sweep_reclaim"         ? 70 :
               payload.setup_inputs?.structure_signal === "none"                  ? 20 : 50,

    volatility: payload.market_state === "riskoff"     ? 90 :
                payload.market_state === "defense"     ? 80 :
                payload.market_state === "expansion"   ? 65 :
                payload.market_state === "compression" ? 45 : 40,

    volume: payload.setup_inputs?.momentum_signal === "none" ? 20 :
            payload.btc_state === "strong"                   ? 75 :
            payload.btc_state === "weak"                     ? 30 : 50,
  };

  const ctx = buildMarketContext(inputs, payload.market_state);
  if (!ctx || typeof ctx.score !== "number") return;

  const safeScore = Math.max(0, Math.min(100, ctx.score));
  const strength  = safeScore >= 70 ? "strong" : safeScore >= 50 ? "medium" : "weak";
  const el        = (id) => document.getElementById(id);

  // Affichage — valeurs internes jamais modifiées, traduction à l'écriture DOM uniquement
  const elScore   = el("cs-score");
  const elLabel   = el("cs-label");
  const elBar     = el("cs-bar");
  const elMode    = el("cs-mode");
  const elAction  = el("cs-action");
  const elMessage = el("cs-message");

  if (elScore)   elScore.textContent   = safeScore;
  if (elLabel)   elLabel.textContent   = ctx.label;
  if (elBar)     elBar.style.width     = `${safeScore}%`;
  if (elMode)    elMode.textContent    = translateMode(ctx.mode);
  if (elAction)  elAction.textContent  = translateAction(ctx.action);
  if (elMessage) elMessage.textContent = ctx.message;

  panel.dataset.tone     = ctx.tone  || "neutral";
  panel.dataset.mode     = (ctx.mode || "unknown").toLowerCase();
  panel.dataset.strength = strength;
  panel.dataset.score    = safeScore;

  if (strength === "strong") panel.classList.add("pulse-strong");
  else                       panel.classList.remove("pulse-strong");
}

function render() {
  if (!currentPayload) {
    appState.form = collectForm();
    currentPayload = buildPayload(appState.form, appState.lastPayload);
    appState.lastPayload = currentPayload;
  }

  pushDecisionSnapshot(currentPayload);

  warnMissingPayloadData(currentPayload);
  document.body.dataset.shellState = getCockpitModel(currentPayload).marketKey.toLowerCase();

  // Liaison visuelle globale — source : decisionState
  const _ds = currentPayload.decisionState ?? computeDecisionState(currentPayload);
  const _root = document.querySelector("#app") || document.body;
  if (_ds?.state) _root.dataset.decisionState = _ds.state.toLowerCase();

  renderMarketStateBrain();
  renderDebugBrain();
  renderDecisionPanel();
  renderActiveAgent();
  renderAgentRules();
  renderCerveauAgent();
  renderHeader(currentPayload);
  renderHero(currentPayload);
  renderConfidenceContext(currentPayload);
  renderWhyDecision(currentPayload);
  renderLightContext(currentPayload);
  renderStructuredReading(currentPayload);
  renderNavigation(currentPayload);
  renderPublications(currentPayload);
  renderPilotage(currentPayload);
  renderRightRail(currentPayload);
  renderActionPlan(currentPayload);
  renderMentalReset(currentPayload);
  applyFocusState(currentPayload);
  renderExecutionLevel(currentPayload);
  renderPositionManagement(currentPayload);
  renderTradeScenarios(currentPayload);
  renderRiskManagement(currentPayload);
  renderTradeSetup(currentPayload);
  renderLiveTradeManagement(currentPayload);
  renderJournalDecision(currentPayload);
  renderDecisionHistory();
  renderDecisionInsights();
  renderBehaviorAlert();
  renderBehaviorInfluence();
  renderMetaLayer();
  renderHistory();
  renderDiagnostics();
  sanitizeVisibleText();

  const level = currentPayload?.behavior?.overtradingLevel || 1;
  const data = OVERTRADING_DICT[level];

  if (!data) return;

  // ── Streak update ─────────────────────────────────────────────
  if (level === overtradingStreak.level) {
    overtradingStreak.count++;
  } else if (level < overtradingStreak.level) {
    overtradingStreak.level = level;
    overtradingStreak.count = Math.max(1, Math.floor(overtradingStreak.count / 2));
  } else {
    overtradingStreak.level = level;
    overtradingStreak.count = 1;
  }

  const streakCount  = overtradingStreak.count;
  const isIntense    = streakCount >= 3 && level >= 3;
  const isCritical   = (streakCount >= 5 && level >= 4) || (level === 5 && streakCount >= 3);
  // ─────────────────────────────────────────────────────────────

  // severity class sur le bloc
  const block = document.getElementById("overtrading-block");
  if (block) {
    block.dataset.otLevel = level;
    block.classList.remove("ot-warning", "ot-alerte", "ot-danger", "ot-intense", "ot-critical");
    if (level <= 2)       block.classList.add("ot-warning");
    else if (level === 3) block.classList.add("ot-alerte");
    else                  block.classList.add("ot-danger");
    if (isCritical)       block.classList.add("ot-critical");
    else if (isIntense)   block.classList.add("ot-intense");
  }

  // badge — signal + streak si intensité active
  const badge = document.getElementById("overtrading-badge");
  if (badge) {
    badge.textContent = isIntense
      ? `${data.signal || ""} · ${streakCount}×`
      : (data.signal || "");
  }

  // image
  const img = document.getElementById("overtrading-img");
  if (img && data.imageTrading) {
    img.src = data.imageTrading;
  }

  // etat
  const etat = document.getElementById("overtrading-etat");
  if (etat && data.etat) {
    etat.textContent = data.etat;
  }

  // message
  const message = document.getElementById("overtrading-message");
  if (message && data.message) {
    message.textContent = data.message;
  }

  // risque
  const risque = document.getElementById("overtrading-risque");
  if (risque && data.risque) {
    risque.textContent = `Risque : ${data.risque}`;
  }

  // action — escalade vers reaction si intensité active
  const action = document.getElementById("overtrading-action");
  if (action) {
    const actionText = isIntense
      ? (data.reaction?.[0] || data.action?.[0] || "")
      : (data.action?.[0] || "");
    action.textContent = actionText;
  }
}

function buildCurrentPayload() {
  appState.form = collectForm();
  const payload = buildPayload(appState.form, appState.lastPayload);
  currentPayload = payload;
  appState.lastPayload = payload;
  payload.decisionState = computeDecisionState(payload);

  return payload;
}

function refresh() {
  buildCurrentPayload();
  updateBehavior({
    marketState: currentPayload.market_state,
    emotionState: currentPayload.emotion_state,
    validationState: currentPayload.validation?.state
  });
  saveState(appState);
  render();
}

function saveDay() {
  buildCurrentPayload();
  currentPayload.note = appState.form.journalNote.trim();
  appState.lastSaved = currentPayload.updated_at;
  appState.history = [...appState.history, currentPayload].slice(-HISTORY_LIMIT);
  saveState(appState);
  render();
}

function clearHistory() {
  appState.history = [];
  appState.lastSaved = null;
  saveState(appState);
  render();
}

function focusPanel(id) {
  const element = $(id);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function syncTabs(activeTab) {
  const nextTab = VALID_TABS.has(activeTab) ? activeTab : "moteur";
  appState.activeTab = nextTab;

  $$("[data-tab-panel]").forEach((panel) => {
    const active = panel.dataset.tabPanel === nextTab;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
    panel.setAttribute("aria-hidden", String(!active));
  });

  $$("[data-tab-target]").forEach((button) => {
    const active = button.dataset.tabTarget === nextTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  setText("sideStateMoteur", nextTab === "moteur" ? "Actif" : "Prêt");
  setText("sideStatePilotage", nextTab === "pilotage" ? "Actif" : "Prêt");
  setText("sideStateMemoire", nextTab === "memoire" ? "Actif" : "Prêt");
}

function activateTab(tab) {
  if (!tab) return;
  syncTabs(tab);
  saveState(appState);
  render();
  focusPanel(TAB_FOCUS_TARGETS[tab] || TAB_FOCUS_TARGETS.moteur);
}

function setActionMode(payload) {
  const activeMode = deriveActionModeKey(payload);
  const states = {
    modeCoreBtn: activeMode === "SOCLE",
    modeAttackBtn: activeMode === "ATTAQUE",
    modeSniperBtn: activeMode === "SNIPER",
    modeWaitBtn: activeMode === "ATTENTE"
  };

  Object.entries(states).forEach(([id, active]) => {
    const button = $(id);
    if (!button) return;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function applyPresetToForm(preset) {
  Object.entries(preset).forEach(([key, value]) => {
    const el = $(key);
    if (el) el.value = value;
  });
}

function showPresetIndicator() {
  let indicator = $("presetIndicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "presetIndicator";
    indicator.className = "preset-indicator";
    indicator.textContent = "Pré-rempli automatiquement";
    const marketGroup = $("market")?.closest(".field-group");
    if (marketGroup) marketGroup.appendChild(indicator);
  }
  indicator.hidden = false;
  clearTimeout(indicator._hideTimer);
  indicator._hideTimer = setTimeout(() => { indicator.hidden = true; }, 3000);
}

function mountPresetResetButton() {
  if ($("presetResetBtn")) return;
  const marketGroup = $("market")?.closest(".field-group");
  if (!marketGroup) return;
  const btn = document.createElement("button");
  btn.id = "presetResetBtn";
  btn.type = "button";
  btn.className = "preset-reset-btn";
  btn.textContent = "Réinitialiser au preset";
  btn.addEventListener("click", () => {
    const preset = AUTO_FILL_PRESETS[$("market")?.value];
    if (!preset) return;
    applyPresetToForm(preset);
    appState.form = collectForm();
    showPresetIndicator();
    refresh();
  });
  marketGroup.appendChild(btn);
}

function bindFieldEvents() {
  if (fieldEventsBound) return;

  const marketEl = $("market");
  if (marketEl) {
    marketEl.addEventListener("change", () => {
      const preset = AUTO_FILL_PRESETS[marketEl.value];
      if (preset) {
        applyPresetToForm(preset);
        showPresetIndicator();
      }
    });
  }

  [...FIELD_GROUPS.marketFields, ...FIELD_GROUPS.adaptiveFields].forEach((field) => {
    const element = $(field.id);
    if (!element) return;
    element.addEventListener(field.type === "textarea" ? "input" : "change", refresh);
  });

  fieldEventsBound = true;
}

function bindControls() {
  if (controlEventsBound) return;

  $$("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tabTarget));
  });

  $("prefillBtn")?.addEventListener("click", () => {
    appState.form = prefillConstellium(collectForm());
    appState.activeTab = "pilotage";
    fillForm(appState.form);
    refresh();
    focusPanel("marketFields");
  });

  $("saveBtn")?.addEventListener("click", saveDay);
  $("clearBtn")?.addEventListener("click", clearHistory);
  $("clearSnapshotBtn")?.addEventListener("click", clearSnapshotHistory);
  $("saveSnapshotBtn")?.addEventListener("click", () => {
    if (!latestSnapshotContext) return;
    handleManualSnapshot(
      latestSnapshotContext.payload,
      latestSnapshotContext.cockpit,
      latestSnapshotContext.decisionState,
      latestSnapshotContext.tradingStatusFormatted
    );
    const btn = $("saveSnapshotBtn");
    const label = btn?.querySelector(".mode-btn-title");
    if (btn && label) {
      clearTimeout(saveSnapshotFeedbackTimer);
      label.textContent = SNAPSHOT_BTN_CONFIRM;
      btn.classList.add("snapshot-confirm");
      btn.disabled = true;
      saveSnapshotFeedbackTimer = setTimeout(() => {
        label.textContent = SNAPSHOT_BTN_LABEL;
        btn.classList.remove("snapshot-confirm");
        btn.disabled = false;
        saveSnapshotFeedbackTimer = null;
      }, 1000);
    }
  });
  $("helpBtn")?.addEventListener("click", () => $("helpDialog")?.showModal());
  $("helpCloseBtn")?.addEventListener("click", () => $("helpDialog")?.close());
  $("helpDialog")?.addEventListener("click", (event) => {
    if (event.target === $("helpDialog")) $("helpDialog")?.close();
  });

  // ── Onboarding — affiché une seule fois ──────────────────────────────────
  const ONBOARDING_KEY = "CE_onboarding_v1";
  const onboardingOverlay = $("onboardingOverlay");
  if (onboardingOverlay) {
    if (localStorage.getItem(ONBOARDING_KEY)) {
      onboardingOverlay.classList.add("hidden");
    }
    $("onboardingBtn")?.addEventListener("click", () => {
      localStorage.setItem(ONBOARDING_KEY, "1");
      onboardingOverlay.classList.add("hidden");
    });
  }

  $("modeCoreBtn")?.addEventListener("click", () => {
    activateTab("pilotage");
    focusPanel("coreText");
  });

  $("modeAttackBtn")?.addEventListener("click", () => {
    activateTab("pilotage");
    focusPanel("action");
  });

  $("modeSniperBtn")?.addEventListener("click", () => {
    activateTab("pilotage");
    focusPanel("triggerBox");
  });

  $("modeWaitBtn")?.addEventListener("click", () => {
    activateTab("moteur");
    focusPanel("lectureDayMain");
  });

  controlEventsBound = true;
}

function updateClock() {
  const time = new Date().toLocaleTimeString("fr-FR");
  setText("liveClock", time);
  setText("liveClockHeader", time);
}

function init() {
  if (initialized) return;
  initialized = true;

  mountFields();
  fillForm(appState.form);
  bindFieldEvents();
  mountPresetResetButton();
  bindControls();

  if (!clockTimer) {
    updateClock();
    clockTimer = window.setInterval(updateClock, 1000);
  }

  buildCurrentPayload();
  saveState(appState);
  render();
  renderSnapshotHistory();
  renderHistoryInsight();
  renderSnapshotBehaviorAlert();
  renderPreBehaviorAlert();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

const data = OVERTRADING_DICT[1];
console.log("DATA UI :", data);
