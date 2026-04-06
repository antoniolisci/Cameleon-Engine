import { MARKET_DICTIONARY } from "./dictionary.js";
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
import { canUseStorage, estimateStateSize, loadState, saveState, getMarketState, updateMarketState } from "./state.js";

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let appState = loadState();
let currentPayload = null;
let initialized = false;
let fieldEventsBound = false;
let controlEventsBound = false;
let clockTimer = null;
const STATIC_HERO_VISUAL = "../assets/images/cameleon-logo.png";
const VALID_TABS = new Set(["moteur", "pilotage", "memoire"]);
const SNAPSHOT_KEY = "cameleon_history";
const SNAPSHOT_MAX = 50;
const TAB_FOCUS_TARGETS = {
  moteur: "marketStateText",
  pilotage: "marketFields",
  memoire: "historyList"
};

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = repairMojibake(value ?? "");
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
  ACTIVE:    "Active",
  AGRESSIVE: "Agressive",
  WAIT:      "Attente",
  PROTECT:   "Protection",
  PRUDENCE:  "Prudence"
};

const BRAIN_STATE_LABELS_FR = {
  RANGE:       "Range",
  COMPRESSION: "Compression",
  EXPANSION:   "Expansion",
  DEFENSE:     "Défense",
  RISKOFF:     "Instable"
};

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
  RANGE:       "Marché calme → aucune action",
  COMPRESSION: "Pression latente → attendre confirmation",
  BREAKOUT:    "Impulsion → opportunité exploitable",
  TREND:       "Tendance confirmée → suivre le mouvement",
  CHAOS:       "Volatilité extrême → réduction immédiate",
  DEFENSE:     "Risque contrôlé → protéger le capital",
  UNKNOWN:     "Lecture floue → observer sans agir"
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
    title: "Aucune entrée",
    subtitle: "Le marché reste bloqué tant qu'aucune structure propre n'apparaît."
  },
  COMPRESSION: {
    title: "Attente obligatoire",
    subtitle: "Le mouvement se prépare, mais aucune entrée n'est encore validée."
  },
  BREAKOUT: {
    title: "Validation requise",
    subtitle: "La cassure démarre, mais l'exécution attend encore une confirmation."
  },
  TREND: {
    title: "Tendance exploitable",
    subtitle: "La direction est lisible, mais l'entrée doit rester sélective."
  },
  CHAOS: {
    title: "Marché inexploitable",
    subtitle: "Le contexte reste instable, aucune entrée prudente n'existe."
  },
  DEFENSE: {
    title: "Exposition réduite",
    subtitle: "Le capital prime, rester léger jusqu'à validation complète."
  },
  UNKNOWN: {
    title: "Lecture incomplète",
    subtitle: "Le contexte manque encore de clarté pour décider."
  }
};

function getHeroCopy(payload) {
  const cockpit = getCockpitModel(payload);
  const marketKey = cockpit.marketKey;
  const validationState = payload.validation?.state;
  const emotionState = payload.emotion_state;

  if (validationState === "rejected") {
    return {
      title: "Entrée interdite",
      subtitle: "La validation finale bloque toute exécution offensive."
    };
  }

  if (emotionState === "stress" || emotionState === "fomo") {
    return {
      title: "Risque émotionnel",
      subtitle: "L'état émotionnel impose une pause avant toute entrée."
    };
  }

  if ((marketKey === "BREAKOUT" || marketKey === "TREND") && validationState === "adjusted") {
    return {
      title: "Entrée réduite",
      subtitle: "Le signal existe, mais l'exposition doit rester strictement réduite."
    };
  }

  if (marketKey === "BREAKOUT" && validationState === "accepted") {
    return {
      title: "Entrée validée",
      subtitle: "La cassure est confirmée, agir uniquement sur déclenchement propre."
    };
  }

  if (marketKey === "TREND" && validationState === "accepted") {
    return {
      title: "Tendance confirmée",
      subtitle: "La direction tient, privilégier un point d'entrée propre et discipliné."
    };
  }

  return HERO_COPY_MAP[marketKey] || HERO_COPY_MAP.UNKNOWN;
}

const DECISION_COPY_MAP = {
  RANGE: {
    title: "Attends confirmation",
    subtitle: "Le prix tourne sans direction claire."
  },
  COMPRESSION: {
    title: "Prépare-toi",
    subtitle: "Un mouvement se prépare, mais aucun signal n'est validé."
  },
  BREAKOUT: {
    title: "Entre avec confirmation",
    subtitle: "Le prix sort d'une zone, mais le signal doit être confirmé."
  },
  TREND: {
    title: "Opportunité en cours",
    subtitle: "Le prix suit une direction claire."
  },
  CHAOS: {
    title: "Aucune position à prendre",
    subtitle: "Le contexte reste trop flou pour agir."
  },
  DEFENSE: {
    title: "Risque trop élevé",
    subtitle: "Le contexte ne permet pas une entrée propre."
  },
  UNKNOWN: {
    title: "Aucune position à prendre",
    subtitle: "Le contexte reste trop flou pour agir."
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

// ── P3 ── tension indicator ───────────────────────────────
function getHeroState(cockpit, tradingStatus) {
  const decision = tradingStatus.toLowerCase();
  const favorable = typeof cockpit.market.exploitable === "boolean"
    ? cockpit.market.exploitable
    : (() => {
        const v = (cockpit.market.verdict || "").toLowerCase();
        return v.includes("exploitable") || v.includes("sortie") ||
          v.includes("tendance") || v.includes("confirmé") || v.includes("expansion");
      })();

  if (favorable && decision === "attaque") return "ALIGNED";
  if (favorable && decision !== "attaque") return "TENSION";
  return "BLOCK";
}

// ── P4 ── snapshot history ────────────────────────────────
function saveSnapshot(snapshot) {
  const history = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "[]");
  const last = history[0];
  if (last &&
      last.regime    === snapshot.regime &&
      last.verdict   === snapshot.verdict &&
      last.decision  === snapshot.decision &&
      last.state     === snapshot.state) return;
  history.unshift(snapshot);
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(history.slice(0, SNAPSHOT_MAX)));
}

function renderSnapshotHistory() {
  const target = $("history");
  if (!target) return;
  const history = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "[]");
  if (!history.length) {
    target.innerHTML = "<div style=\"opacity:.3; font-size:12px;\">Aucun historique</div>";
    return;
  }
  target.innerHTML = history.map((h) => {
    const d = new Date(h.timestamp);
    const date = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return `<div style="display:flex;gap:12px;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);">`
      + `<span style="opacity:.4;min-width:90px;">${date} ${time}</span>`
      + `<span>${h.regime}</span>`
      + `<span style="opacity:.5;">→</span>`
      + `<span>${h.decision}</span>`
      + `<span style="margin-left:auto;" class="status-${h.state.toLowerCase()}">${h.state}</span>`
      + `</div>`;
  }).join("");
}

function clearSnapshotHistory() {
  if (!confirm("Supprimer tout l'historique moteur ?")) return;
  localStorage.removeItem(SNAPSHOT_KEY);
  renderSnapshotHistory();
  renderHistoryInsight();
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

  const blockRate   = (counts.BLOCK   || 0) / total;
  const tensionRate = (counts.TENSION || 0) / total;
  const alignedRate = (counts.ALIGNED || 0) / total;

  if (blockRate   >= 0.5) return { status: "BLOCK",       message: "Marché bloqué" };
  if (tensionRate >= 0.5) return { status: "TENSION",     message: "Marché sous tension" };
  if (alignedRate <= 0.2) return { status: "LOW_ALIGNED", message: "Peu d'opportunités claires" };
  return { status: "NORMAL", message: "Conditions normales" };
}

function renderHistoryInsight() {
  const el = $("history-insight");
  if (!el) return;
  const history = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "[]");
  const result = analyzeHistory(history);
  el.textContent = result.message;
  const colors = { BLOCK: "#ff4444", TENSION: "#ffaa00", LOW_ALIGNED: "#888", NORMAL: "#00ff88", INSUFFICIENT: "#555" };
  el.style.color = colors[result.status] || "#555";
}

function renderHeader(payload) {
  const cockpit = getCockpitModel(payload);
  setText("headerState", cockpit.market.label);
  setText("headerMode", cockpit.actionMode.label);
}

function renderHero(payload) {
  const heroCopy = getHeroCopy(payload);
  const cockpit = getCockpitModel(payload);

  applyMarketVisual(payload);

  setText("lectureDayMain", heroCopy.title);
  setText("lectureDaySub", heroCopy.subtitle);

  // P1 — Verdict shell
  setText("verdictImmediate", formatStatus(payload.trading_status));
  setText("verdictAllowed",   cockpit.market.posture);
  setText("verdictNext",      cockpit.market.action);
  setText("verdictBlocked",   cockpit.market.avoid);
  setText("verdictWatch",     cockpit.market.decision);

  // P2 — Hero KPI grid
  setText("heroMarketStrong", cockpit.market.label);
  setText("heroVerdictValue", cockpit.market.verdict);
  setText("heroPostureValue", cockpit.market.posture);
  setText("heroAvoidValue",   cockpit.market.avoid);

  // Hero bar
  setText("heroBarMarket",  cockpit.market.label);
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

  const heroState = getHeroState(cockpit, tradingStatusFormatted);
  const heroStatusEl = $("hero-status");
  if (heroStatusEl) {
    heroStatusEl.className = "hero-status";
    const stateMap = { ALIGNED: ["ALIGNÉ", "status-aligned"], TENSION: ["TENSION", "status-tension"], BLOCK: ["BLOCAGE", "status-block"] };
    const [label, cls] = stateMap[heroState] || ["–", ""];
    heroStatusEl.textContent = label;
    if (cls) heroStatusEl.classList.add(cls);
  }

  // P4 — sauvegarde snapshot
  saveSnapshot({
    timestamp: new Date().toISOString(),
    regime:   cockpit.market.label,
    verdict:  cockpit.market.verdict,
    decision: tradingStatusFormatted,
    state:    heroState
  });
  renderSnapshotHistory();
  renderHistoryInsight();
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
  setText("marketStateTinyLabel", `Ton contexte : ${STATE_LABELS[payload.market_state] || payload.market_state}`);
  setText("marketStateText", `Lecture moteur : ${cockpit.market.label}`);
  setText("marketStateNote", "Le moteur intègre l'ensemble des variables.");
  setText("microConfidence", `${payload.score}/100`);
  setText("microRisk", `Risque ${payload.trigger_level.toLowerCase()}`);
  setText("agentName", payload.sniper_mode_final === "ON" ? "Sniper" : payload.attack_mode_final === "ON" ? "Attaque" : "Socle");
  setText("agentAlert", formatStatus(payload.trading_status));
  setText("agentDesc", simplifyText(payload.profile_reaction));
  setText("agentModeBadge", `Mode : ${cockpit.actionMode.label.toLowerCase()}`);
  setText("scoreValue", String(payload.score));
  setText("scoreSub", payload.score >= 70 ? "Contexte puissant" : payload.score >= 50 ? "Contexte exploitable" : "Contexte fragile");
  setWidth("scoreBar", `${payload.score}%`);
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
  setText("coreText", "Socle : on protège le capital avant tout.");
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
  setText("decisionSummaryHeadline", dictDecision);
  setText("decisionSummaryText", dictRaison);
  setText("decisionAgentText", getActiveAgent(payload.decision));
  setText("decisionAvoidText", cockpit.market.avoid);
  setText("alertLevel", cockpit.market.label);
  setText("trafficLight", `Validation ${cockpit.validation}`);
  setText("decisionPanel", dictDecision);
  setText("ultraShortPanel", dictRaison);

  setQueryText(".structured-shell .card-desc", "Trois repères pour cadrer l'écran sans relire la décision.");
  setQueryText(".master-card .card-desc", "Le cadre utile seulement : état, risque, mode et validation.");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(1) .card-desc", "Lecture courte des signaux qui imposent une réévaluation.");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(2) .card-desc", "Le profil, la validation et le contexte modulent la lecture opérateur.");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(4) .card-title", "Incohérences");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(4) .card-desc", "Détection des frottements entre setup, régime et validation.");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(5) .card-title", "Validation opérationnelle");
  setQueryText(".tab-panel[data-tab-panel='pilotage'] .diagnostic-grid .side-card:nth-child(5) .card-desc", "Statut de validation et rappel court avant exécution.");
  setQueryText(".side-panel .side-card:first-child .card-desc", "Résumé structuré unique de la décision, de la posture et du risque.");
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
  const ms = getMarketState();
  setText("market-regime",  ms.state);
  setText("market-score",   String(ms.confidence));
  setText("market-context", ms.volatility);
}

function renderDebugBrain() {
  const ms = getMarketState();
  setText("db-state",      BRAIN_STATE_LABELS_FR[ms.state] || ms.state);
  setText("db-confidence", String(ms.confidence));
  setText("db-volatility", ms.volatility);
  setText("db-trend",      ms.trend);
  if (currentPayload?.marketReading) {
    setText("db-reading", `${currentPayload.marketReading.state}:${currentPayload.marketReading.modifier} [${currentPayload.marketReading.risk}]`);
  }
  if (currentPayload?.decision) {
    const d = currentPayload.decision.primary || currentPayload.decision;
    setText("db-posture",    d.posture);
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
  DEFENDER: "Réduire le risque / protéger le capital",
  ATTACKER: "Augmenter l'exposition / entrées agressives",
  EXECUTE:  "Suivre le signal / entrer avec confirmation",
  OBSERVER: "Attendre / aucune action"
};

function getAgentAction(agent) {
  return AGENT_ACTION_MAP[agent] || "Attendre / aucune action";
}

function renderActiveAgent() {
  const marketKey = currentPayload ? getCockpitModel(currentPayload).marketKey : "UNKNOWN";
  const agent  = getStateAgent(marketKey);
  const action = getAgentAction(agent);
  setText("active-agent",        AGENT_LABELS_FR[agent] || agent);
  setText("active-agent-action", action);
  setText("cerveau-synthesis",   getStateSynthesis(marketKey));
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
  const marketKey = currentPayload ? getCockpitModel(currentPayload).marketKey : "UNKNOWN";
  const agent = getStateAgent(marketKey);
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
}

function renderAgentRules() {
  const agent = getActiveAgent(currentPayload?.decision);
  const rules = getAgentRules(agent);
  setText("rules-allowed",   rules.allowed.join(", "));
  setText("rules-forbidden", rules.forbidden.join(", "));
}

function renderDecisionPanel() {
  const dec = currentPayload?.decision;
  if (!dec) return;
  const posture = dec.primary?.posture || "";
  setText("dp-primary",  POSTURE_LABELS_FR[posture] || posture || "—");
  setText("dp-best-alt", dec.bestAlternative?.posture  || "—");
}

function render() {
  if (!currentPayload) {
    appState.form = collectForm();
    currentPayload = buildPayload(appState.form, appState.lastPayload);
    appState.lastPayload = currentPayload;
  }

  warnMissingPayloadData(currentPayload);
  document.body.dataset.shellState = getCockpitModel(currentPayload).marketKey.toLowerCase();

  renderMarketStateBrain();
  renderDebugBrain();
  renderDecisionPanel();
  renderActiveAgent();
  renderAgentRules();
  renderCerveauAgent();
  renderHeader(currentPayload);
  renderHero(currentPayload);
  renderLightContext(currentPayload);
  renderStructuredReading(currentPayload);
  renderNavigation(currentPayload);
  renderPublications(currentPayload);
  renderPilotage(currentPayload);
  renderRightRail(currentPayload);
  renderHistory();
  renderDiagnostics();
  sanitizeVisibleText();
}

function buildCurrentPayload() {
  appState.form = collectForm();
  const payload = buildPayload(appState.form, appState.lastPayload);
  currentPayload = payload;
  appState.lastPayload = payload;
  try {
    localStorage.setItem("cameleon-engine-bridge-v45-to-v732e", JSON.stringify({
      market_state: payload.market_state,
      setup_inputs: payload.setup_inputs,
      validation: payload.validation
    }));
  } catch (e) {}

  // Sync cerveau marché avec le payload courant
  const volatilityMap = { "Faible": "low", "Moyen": "medium", "Élevé": "high" };
  const trendMap = { "range": "neutral", "pre-breakout": "neutral", "continuation": "bullish", "capital-protection": "defensive", "survival": "bearish" };
  updateMarketState({
    state:      (payload.market_state || "range").toUpperCase(),
    confidence: payload.score ?? 50,
    volatility: volatilityMap[payload.trigger_level] || "low",
    trend:      trendMap[payload.engine_mode] || "neutral"
  });

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
  $("helpBtn")?.addEventListener("click", () => $("helpDialog")?.showModal());
  $("helpCloseBtn")?.addEventListener("click", () => $("helpDialog")?.close());
  $("helpDialog")?.addEventListener("click", (event) => {
    if (event.target === $("helpDialog")) $("helpDialog")?.close();
  });

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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
