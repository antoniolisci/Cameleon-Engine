export const STORAGE_KEY = "cameleon-engine-modular-v732e-v45";
export const HISTORY_LIMIT = 50;
export const DEFAULT_TAB = "moteur";

export const FIELD_GROUPS = {
  marketFields: [
    { id: "market", label: "État de marché", type: "select", options: [["range", "Range"], ["compression", "Compression"], ["expansion", "Breakout / Tendance"], ["defense", "Mode défensif"], ["riskoff", "Instable"]] },
    { id: "btc", label: "Bitcoin", type: "select", options: [["stable", "Stable"], ["strong", "Fort"], ["weak", "Faible"]] },
    { id: "dxy", label: "Dollar index (DXY)", type: "select", options: [["neutral", "Neutre"], ["up", "En hausse"], ["down", "En baisse"]] },
    { id: "emotion", label: "État émotionnel", type: "select", options: [["calm", "Calme"], ["neutral", "Neutre"], ["stress", "Sous tension"], ["fomo", "FOMO"]] },
    { id: "ether", label: "Éther", type: "select", options: [["stable", "Stable"], ["strong", "Fort"], ["weak", "Faible"]] },
    { id: "fire", label: "Feu", type: "select", options: [["weak", "Faible"], ["medium", "Moyen"], ["strong", "Fort"]] },
    { id: "air", label: "Air", type: "select", options: [["weak", "Faible"], ["emerging", "Émergent"], ["strong", "Fort"]] },
    { id: "earth", label: "Terre", type: "select", options: [["weak", "Faible"], ["stable", "Stable"], ["strong", "Fort"]] },
    { id: "water", label: "Eau", type: "select", options: [["weak", "Faible"], ["risk", "Sous risque"], ["explosive", "Explosive"]] }
  ],
  adaptiveFields: [
    { id: "userProfile", label: "Profil opérateur", type: "select", options: [["PASSIVE", "Passif structuré"], ["BALANCED", "Équilibré"], ["ACTIVE", "Actif discipliné"]] },
    { id: "coreOrders", label: "Socle déjà en place", type: "select", options: [["yes", "Oui"], ["partial", "Partiellement"], ["no", "Non"]] },
    { id: "needAction", label: "Nécessité réelle d'agir", type: "select", options: [["no", "Non"], ["maybe", "À confirmer"], ["yes", "Oui"]] },
    { id: "structureSignal", label: "Signal de structure", type: "select", options: [["none", "Aucun"], ["compression_breakout", "Sortie de compression"], ["real_breakout", "Cassure validée"], ["sweep_reclaim", "Sweep puis reprise"]] },
    { id: "momentumSignal", label: "Confirmation d'élan", type: "select", options: [["none", "Aucune"], ["clean", "Bougie propre"], ["strong", "Volume et impulsion"]] },
    { id: "zoneSignal", label: "Zone de travail", type: "select", options: [["middle", "Milieu de range"], ["low_range", "Bas de range"], ["high_range", "Haut de range"], ["breakout_level", "Niveau de cassure"]] },
    { id: "validationState", label: "Validation humaine", type: "select", options: [["pending", "En attente"], ["accepted", "Validée"], ["adjusted", "Validée sous contrainte"], ["rejected", "Refusée"]] },
    { id: "validationNote", label: "Note de validation", type: "textarea", placeholder: "Ex. Cassure propre, mais taille réduite tant que le reclaim n'est pas confirmé." },
    { id: "journalNote", label: "Note de session", type: "textarea", placeholder: "Ex. Je protège le socle et je n'ouvre rien tant que la zone n'est pas parfaitement reprise." }
  ]
};

export const MARKET_STATES = {
  RANGE: {
    label: "Range",
    description: "Le prix tourne sans direction claire.",
    verdict: "Neutre",
    posture: "Attente",
    action: "Ne rien faire",
    avoid: "Entrée non valide",
    decision: "Marché en attente — pas de signal exploitable"
  },
  COMPRESSION: {
    label: "Compression",
    description: "Le marché se resserre. Un mouvement arrive.",
    verdict: "Attente",
    posture: "Patience",
    action: "Surveiller la cassure",
    avoid: "Entrée non valide",
    decision: "Un mouvement se prépare, mais aucune entrée n'est encore valide."
  },
  BREAKOUT: {
    label: "Breakout",
    description: "Le prix sort clairement d'une zone.",
    verdict: "Opportunité",
    posture: "Momentum",
    action: "Entrer avec confirmation",
    avoid: "Entrée non valide",
    decision: "Le marché démarre un mouvement exploitable."
  },
  TREND: {
    label: "Tendance",
    description: "Le prix suit une direction claire.",
    verdict: "Tendance active",
    posture: "Alignement",
    action: "Entrer sur retracement",
    avoid: "Risque trop élevé",
    decision: "Le marché avance clairement dans une direction."
  },
  CHAOS: {
    label: "Instable",
    description: "Le marché est imprévisible.",
    verdict: "Risque élevé",
    posture: "Défense",
    action: "Réduire fortement l'exposition",
    avoid: "Entrée non valide",
    decision: "Risque trop élevé"
  },
  DEFENSE: {
    label: "Mode défensif",
    description: "Les conditions sont risquées.",
    verdict: "Protection",
    posture: "Prudence",
    action: "Réduire l'exposition",
    avoid: "Risque trop élevé",
    decision: "Ce n'est pas un moment pour prendre des risques."
  },
  UNKNOWN: {
    label: "Marché flou",
    description: "Le contexte n'est pas clair.",
    verdict: "Incertain",
    posture: "Observation",
    action: "Ne rien faire",
    avoid: "Entrée non valide",
    decision: "Tu n'as pas assez d'informations pour agir."
  }
};

export const ACTION_MODES = {
  SOCLE: {
    label: "Socle",
    description: "On protège le capital avant tout."
  },
  ATTAQUE: {
    label: "Attaque",
    description: "On profite d'un mouvement clair."
  },
  SNIPER: {
    label: "Sniper",
    description: "On agit seulement sur signal parfait."
  },
  ATTENTE: {
    label: "Attente",
    description: "Ne rien faire est la meilleure décision."
  }
};

export const DEFAULT_FORM = {
  market: "range",
  btc: "stable",
  dxy: "neutral",
  emotion: "neutral",
  ether: "stable",
  fire: "medium",
  air: "weak",
  earth: "stable",
  water: "weak",
  userProfile: "PASSIVE",
  coreOrders: "yes",
  needAction: "no",
  structureSignal: "none",
  momentumSignal: "none",
  zoneSignal: "middle",
  validationState: "pending",
  validationNote: "",
  journalNote: ""
};

export const STATE_LABELS = {
  range: "Range",
  compression: "Compression",
  expansion: "Breakout / Tendance",
  defense: "Mode défensif",
  riskoff: "Instable"
};

export const VALIDATION_TEXT = {
  pending: "La lecture moteur est prête, mais la validation humaine reste en attente.",
  accepted: "La proposition moteur est validée sans réserve.",
  adjusted: "La proposition moteur est validée, avec un cadre d'exécution resserré.",
  rejected: "La validation humaine bloque toute exécution offensive."
};

export const TOKEN_LABELS = {
  none: "Aucun",
  compression_breakout: "Sortie de compression",
  real_breakout: "Cassure validée",
  sweep_reclaim: "Sweep puis reprise",
  clean: "Bougie propre",
  strong: "Fort",
  low_range: "Bas de range",
  high_range: "Haut de range",
  breakout_level: "Niveau de cassure",
  calm: "Calme",
  neutral: "Neutre",
  stress: "Sous tension",
  fomo: "FOMO",
  yes: "Oui",
  no: "Non",
  maybe: "À confirmer",
  pending: "En attente",
  accepted: "Validée",
  adjusted: "Validée sous contrainte",
  rejected: "Refusée",
  partial: "Partiellement"
};

export const STATUS_LABELS = {
  "CORE ONLY": "Socle",
  "SNIPER LIGHT": "Sniper",
  "SNIPER READY": "Sniper",
  "TRADE LIGHT": "Attaque",
  "TRADE OK": "Attaque",
  WAIT: "Attente",
  "NO TRADE": "Protection",
  "VALIDATION BLOCK": "Protection",
  ADJUSTED: "Protection",
  "WAIT VALIDATION": "Attente",
  ON: "Actif",
  OFF: "Inactif",
  LIGHT: "Léger",
  WATCH: "Surveille"
};

export const ENGINE_MODE_LABELS = {
  range: "Range",
  "pre-breakout": "Compression",
  continuation: "Tendance",
  "capital-protection": "Protection",
  survival: "Instable"
};

export const PROFILE_LABELS = {
  PASSIVE: "Passif structuré",
  BALANCED: "Équilibré",
  ACTIVE: "Actif discipliné"
};

export const PUBLICATIONS_SECTION = {
  title: "Publications Paragraph",
  description: "Une bibliothèque éditoriale pour prolonger le verdict moteur avec des lectures Caméléon alignées sur le contexte du jour."
};

export const PUBLICATION_CATEGORY_SUMMARIES = {
  core_range: "Une lecture de méthode pour travailler un marché latéral avec patience, respiration et protection du socle.",
  discipline: "Une lecture de discipline intérieure pour préserver la lucidité, l'énergie décisionnelle et la tenue mentale.",
  lecture_marche: "Une lecture de structure pour observer le prix sans récit excessif ni surinterprétation du contexte.",
  execution_risque: "Une lecture d'exécution sur la taille, la perte, la réduction d'exposition et la protection du futur.",
  execution_ordres: "Une lecture opératoire sur les ordres, l'attente, le déplacement et la construction patiente d'une position.",
  doctrine: "Une lecture de doctrine sur la méthode Caméléon, la constance et la transformation du rôle de l'opérateur."
};

const HERO_VISUAL_IMAGE = "../assets/images/cameleon-logo.png";

export const MARKET_VISUALS = {
  RANGE: {
    key: "range",
    image: HERO_VISUAL_IMAGE,
    alt: "Range - le prix tourne sans direction claire",
    label: "Range",
    bias: "Le prix tourne sans direction claire.",
    decisionTone: "Attends une sortie claire avant d'agir.",
    overlayStrength: 0.58,
    blurLevel: 1,
    imageOpacity: 0.24,
    imagePosition: "center center",
    fallbackGradient: "radial-gradient(circle at 18% 20%, rgba(214, 186, 110, 0.24), transparent 26%), radial-gradient(circle at 78% 24%, rgba(110, 136, 168, 0.18), transparent 28%), linear-gradient(145deg, rgba(29, 32, 36, 0.98), rgba(11, 13, 16, 0.94))",
    accentGradient: "linear-gradient(180deg, rgba(226, 194, 124, 0.18), rgba(226, 194, 124, 0.02))"
  },
  COMPRESSION: {
    key: "compression",
    image: HERO_VISUAL_IMAGE,
    alt: "Compression - le marché se resserre",
    label: "Compression",
    bias: "Le marché se resserre. Un mouvement arrive.",
    decisionTone: "Attends le déclenchement avant d'agir.",
    overlayStrength: 0.54,
    blurLevel: 1,
    imageOpacity: 0.26,
    imagePosition: "54% center",
    fallbackGradient: "radial-gradient(circle at 22% 22%, rgba(144, 186, 255, 0.24), transparent 26%), radial-gradient(circle at 76% 18%, rgba(188, 208, 255, 0.18), transparent 24%), linear-gradient(145deg, rgba(18, 24, 34, 0.98), rgba(10, 14, 20, 0.94))",
    accentGradient: "linear-gradient(180deg, rgba(170, 190, 255, 0.18), rgba(170, 190, 255, 0.03))"
  },
  BREAKOUT: {
    key: "breakout",
    image: HERO_VISUAL_IMAGE,
    alt: "Breakout - le prix sort clairement d'une zone",
    label: "Breakout",
    bias: "Le prix sort clairement d'une zone.",
    decisionTone: "Entre seulement avec confirmation.",
    overlayStrength: 0.56,
    blurLevel: 1,
    imageOpacity: 0.26,
    imagePosition: "58% center",
    fallbackGradient: "radial-gradient(circle at 24% 22%, rgba(156, 170, 214, 0.24), transparent 26%), radial-gradient(circle at 74% 18%, rgba(216, 188, 132, 0.18), transparent 22%), linear-gradient(145deg, rgba(18, 22, 30, 0.98), rgba(10, 12, 18, 0.94))",
    accentGradient: "linear-gradient(180deg, rgba(170, 190, 255, 0.2), rgba(170, 190, 255, 0.03))"
  },
  TREND: {
    key: "trend",
    image: HERO_VISUAL_IMAGE,
    alt: "Tendance - le prix suit une direction claire",
    label: "Tendance",
    bias: "Le prix suit une direction claire.",
    decisionTone: "Tendance exploitable — opportunité en cours.",
    overlayStrength: 0.54,
    blurLevel: 1,
    imageOpacity: 0.25,
    imagePosition: "center center",
    fallbackGradient: "radial-gradient(circle at 24% 24%, rgba(108, 186, 155, 0.24), transparent 28%), radial-gradient(circle at 80% 34%, rgba(84, 132, 142, 0.18), transparent 30%), linear-gradient(155deg, rgba(14, 23, 24, 0.98), rgba(8, 13, 18, 0.94))",
    accentGradient: "linear-gradient(180deg, rgba(115, 203, 167, 0.18), rgba(115, 203, 167, 0.03))"
  },
  CHAOS: {
    key: "chaos",
    image: HERO_VISUAL_IMAGE,
    alt: "Instable - le marché est imprévisible",
    label: "Instable",
    bias: "Le marché est imprévisible.",
    decisionTone: "Aucune position à prendre tant que le risque reste trop élevé.",
    overlayStrength: 0.62,
    blurLevel: 1,
    imageOpacity: 0.22,
    imagePosition: "center center",
    fallbackGradient: "radial-gradient(circle at 18% 24%, rgba(168, 82, 82, 0.24), transparent 28%), radial-gradient(circle at 82% 72%, rgba(105, 122, 144, 0.14), transparent 26%), linear-gradient(150deg, rgba(24, 13, 15, 0.98), rgba(10, 10, 14, 0.96))",
    accentGradient: "linear-gradient(180deg, rgba(191, 108, 108, 0.18), rgba(191, 108, 108, 0.03))"
  },
  DEFENSE: {
    key: "defense",
    image: HERO_VISUAL_IMAGE,
    alt: "Mode défensif - les conditions sont risquées",
    label: "Mode défensif",
    bias: "Les conditions sont risquées.",
    decisionTone: "Réduis le risque avant toute nouvelle exposition.",
    overlayStrength: 0.58,
    blurLevel: 1,
    imageOpacity: 0.22,
    imagePosition: "center center",
    fallbackGradient: "radial-gradient(circle at 20% 18%, rgba(182, 143, 85, 0.18), transparent 24%), radial-gradient(circle at 72% 24%, rgba(74, 88, 108, 0.18), transparent 32%), linear-gradient(150deg, rgba(18, 21, 26, 0.98), rgba(8, 10, 14, 0.96))",
    accentGradient: "linear-gradient(180deg, rgba(170, 137, 86, 0.18), rgba(170, 137, 86, 0.02))"
  },
  UNKNOWN: {
    key: "unknown",
    image: HERO_VISUAL_IMAGE,
    alt: "Marché flou - le contexte n'est pas clair",
    label: "Marché flou",
    bias: "Le contexte n'est pas clair.",
    decisionTone: "Observe jusqu'à avoir assez d'informations.",
    overlayStrength: 0.58,
    blurLevel: 1,
    imageOpacity: 0.2,
    imagePosition: "center center",
    fallbackGradient: "radial-gradient(circle at 18% 20%, rgba(214, 186, 110, 0.18), transparent 26%), linear-gradient(145deg, rgba(18, 18, 20, 0.98), rgba(10, 10, 12, 0.96))",
    accentGradient: "linear-gradient(180deg, rgba(226, 194, 124, 0.14), rgba(226, 194, 124, 0.02))"
  }
};

export const PARAGRAPH_LIBRARY = {
  core_range: [
    "https://paragraph.com/@cameleon/travailler-un-marche-plutot-que-le-predire",
    "https://paragraph.com/@cameleon/la-patience-nest-pas-de-linaction",
    "https://paragraph.com/@cameleon/attendre-est-une-action-complete",
    "https://paragraph.com/@cameleon/le-marche-recompense-rarement-limpatience",
    "https://paragraph.com/@cameleon/loi-n%C2%B01-%E2%80%94-la-respiration-du-range",
    "https://paragraph.com/@cameleon/loi-n%C2%B02-%E2%80%94-lintangibilite-de-la-zone-de-travail",
    "https://paragraph.com/@cameleon/loi-n%C2%B03-%E2%80%94-la-loi-du-socle-protege",
    "https://paragraph.com/@cameleon/loi-x-%E2%80%94-survivre-au-range-est-plus-difficile-que-survivre-au-crash"
  ],
  discipline: [
    "https://paragraph.com/@cameleon/rien-a-prouver-au-marche",
    "https://paragraph.com/@cameleon/la-discipline-nest-pas-une-contrainte",
    "https://paragraph.com/@cameleon/le-confort-mental-est-lennemi-silencieux",
    "https://paragraph.com/@cameleon/la-fatigue-emotionnelle-le-vrai-signal-ignore",
    "https://paragraph.com/@cameleon/pourquoi-un-bon-trader-doute-toujours",
    "https://paragraph.com/@cameleon/le-capital-mental-est-plus-rare-que-le-capital-financier",
    "https://paragraph.com/@cameleon/quand-arreter-de-trader-est-une-decision-saine",
    "https://paragraph.com/@cameleon/etre-actif-vs-etre-agite"
  ],
  lecture_marche: [
    "https://paragraph.com/@cameleon/les-lois-invisibles-du-marche",
    "https://paragraph.com/@cameleon/la-respiration-du-marche",
    "https://paragraph.com/@cameleon/pourquoi-le-schema-du-market-cycle-piege-plus-de-traders-quil-nen-aide",
    "https://paragraph.com/@cameleon/lire-le-marche-sans-raconter-dhistoire",
    "https://paragraph.com/@cameleon/pourquoi-le-prix-ment-moins-que-les-indicateurs",
    "https://paragraph.com/@cameleon/la-fausse-securite-des-confluences",
    "https://paragraph.com/@cameleon/quand-ne-rien-comprendre-est-une-information",
    "https://paragraph.com/@cameleon/la-volatilite-comme-langage"
  ],
  execution_risque: [
    "https://paragraph.com/@cameleon/pourquoi-chercher-le-bottom-est-une-perte-de-temps",
    "https://paragraph.com/@cameleon/pourquoi-entrer-trop-petit-est-une-force",
    "https://paragraph.com/@cameleon/pourquoi-le-stop-loss-mal-compris-fait-des-degats",
    "https://paragraph.com/@cameleon/perdre-petit-est-une-competence",
    "https://paragraph.com/@cameleon/une-position-que-tu-surveilles-trop-est-deja-dangereuse",
    "https://paragraph.com/@cameleon/pourquoi-une-bonne-perte-protege-le-futur",
    "https://paragraph.com/@cameleon/reduire-lexposition-comme-acte-offensif",
    "https://paragraph.com/@cameleon/le-timing-nexiste-pas-la-preparation-oui"
  ],
  execution_ordres: [
    "https://paragraph.com/@cameleon/un-ordre-nest-pas-une-decision",
    "https://paragraph.com/@cameleon/deplacer-un-ordre-vs-lannuler",
    "https://paragraph.com/@cameleon/le-carnet-dordres-comme-extension-du-cerveau",
    "https://paragraph.com/@cameleon/pourquoi-les-ordres-passifs-creent-de-la-patience",
    "https://paragraph.com/@cameleon/les-petites-lignes-construisent-les-grandes-positions",
    "https://paragraph.com/@cameleon/ce-que-signifie-vraiment-laisser-courir",
    "https://paragraph.com/@cameleon/le-temps-comme-levier-cache"
  ],
  doctrine: [
    "https://paragraph.com/@cameleon/la-naissance-du-cameleon",
    "https://paragraph.com/@cameleon/le-marche-est-devenu-darwinien",
    "https://paragraph.com/@cameleon/du-trader-%E2%86%92-au-gestionnaire-de-position",
    "https://paragraph.com/@cameleon/quand-le-marche-devient-un-partenaire",
    "https://paragraph.com/@cameleon/ce-que-signifie-devenir-constant",
    "https://paragraph.com/@cameleon/construire-une-methode-qui-te-ressemble",
    "https://paragraph.com/@cameleon/pourquoi-copier-une-strategie-ne-dure-jamais",
    "https://paragraph.com/@cameleon/le-trading-comme-discipline-personnelle"
  ]
};

const MARKET_ARTICLE_CATEGORIES = {
  RANGE: ["core_range", "execution_ordres"],
  COMPRESSION: ["execution_ordres", "lecture_marche"],
  BREAKOUT: ["execution_risque", "lecture_marche"],
  TREND: ["lecture_marche", "discipline"],
  CHAOS: ["discipline", "execution_risque"],
  UNKNOWN: ["core_range"]
};

export function deriveMarketStateKey(payload) {
  if (!payload) return "UNKNOWN";

  const market = String(payload.market_state || "").toLowerCase();
  const structureSignal = String(payload.setup_inputs?.structure_signal || "");
  const zoneSignal = String(payload.setup_inputs?.zone_signal || "");

  if (market === "range") return "RANGE";
  if (market === "compression") return "COMPRESSION";
  if (market === "defense") return "DEFENSE";
  if (market === "riskoff") return "CHAOS";
  if (market === "expansion") {
    if (structureSignal === "compression_breakout" || structureSignal === "real_breakout" || zoneSignal === "breakout_level") {
      return "BREAKOUT";
    }
    return "TREND";
  }

  return "UNKNOWN";
}

export function getMarketStateConfig(payload) {
  const key = typeof payload === "string" ? payload : deriveMarketStateKey(payload);
  return MARKET_STATES[key] || MARKET_STATES.UNKNOWN;
}

export function deriveActionModeKey(payload) {
  if (!payload) return "ATTENTE";

  if (payload.validation?.state === "rejected" || payload.trading_status === "NO TRADE" || payload.trading_status === "VALIDATION BLOCK") {
    return "ATTENTE";
  }

  if (payload.sniper_mode_final === "ON" || payload.sniper_mode_final === "WATCH") {
    return "SNIPER";
  }

  if (payload.attack_mode_final === "ON" || payload.attack_mode_final === "LIGHT") {
    return "ATTAQUE";
  }

  if (payload.market_state === "defense" || payload.market_state === "riskoff") {
    return "ATTENTE";
  }

  return "SOCLE";
}

export function getActionModeConfig(payload) {
  const key = typeof payload === "string" ? payload : deriveActionModeKey(payload);
  return ACTION_MODES[key] || ACTION_MODES.ATTENTE;
}

function normalizeArticleMarketState(state) {
  if (!state) return "UNKNOWN";
  const normalized = String(state).toUpperCase();
  if (normalized === "RANGE") return "RANGE";
  if (normalized === "COMPRESSION") return "COMPRESSION";
  if (normalized === "BREAKOUT") return "BREAKOUT";
  if (normalized === "TREND" || normalized === "EXPANSION") return "TREND";
  if (normalized === "CHAOS" || normalized === "DEFENSE" || normalized === "RISKOFF") return "CHAOS";
  return "UNKNOWN";
}

export function normalizeVisualMarketState(state) {
  if (!state) return "UNKNOWN";
  const normalized = String(state).toLowerCase();
  if (normalized === "range") return "RANGE";
  if (normalized === "compression") return "COMPRESSION";
  if (normalized === "breakout") return "BREAKOUT";
  if (normalized === "expansion" || normalized === "trend") return "TREND";
  if (normalized === "defense") return "DEFENSE";
  if (normalized === "riskoff" || normalized === "chaos") return "CHAOS";
  return "UNKNOWN";
}

export function getMarketVisual(state) {
  const key = normalizeVisualMarketState(state);
  return MARKET_VISUALS[key] || MARKET_VISUALS.UNKNOWN;
}

function selectArticles(categories, limit = 4) {
  const queues = categories.map((category) => ({
    category,
    urls: [...(PARAGRAPH_LIBRARY[category] || [])]
  }));
  const picked = [];

  while (picked.length < limit && queues.some((queue) => queue.urls.length)) {
    queues.forEach((queue) => {
      if (picked.length >= limit || !queue.urls.length) return;
      const url = queue.urls.shift();
      if (!url || picked.some((item) => item.url === url)) return;
      picked.push({ category: queue.category, url });
    });
  }

  return picked;
}

export function getArticlesForMarketState(state) {
  const marketState = normalizeArticleMarketState(state);
  const categories = MARKET_ARTICLE_CATEGORIES[marketState] || MARKET_ARTICLE_CATEGORIES.UNKNOWN;
  return selectArticles(categories, 4);
}

export const AUTO_FILL_PRESETS = {
  range: {
    btc: "stable",
    ether: "stable",
    fire: "weak",
    air: "emerging",
    earth: "stable",
    water: "weak",
    needAction: "no",
    structureSignal: "none",
    momentumSignal: "none",
    zoneSignal: "middle",
    validationState: "pending"
  },
  compression: {
    btc: "stable",
    ether: "stable",
    fire: "medium",
    air: "emerging",
    earth: "stable",
    water: "weak",
    needAction: "no",
    structureSignal: "compression_breakout",
    momentumSignal: "none",
    zoneSignal: "middle",
    validationState: "pending"
  },
  expansion: {
    btc: "strong",
    ether: "strong",
    fire: "strong",
    air: "emerging",
    earth: "stable",
    water: "weak",
    needAction: "yes",
    structureSignal: "real_breakout",
    momentumSignal: "clean",
    zoneSignal: "breakout_level",
    validationState: "pending"
  },
  defense: {
    btc: "weak",
    ether: "weak",
    fire: "weak",
    air: "weak",
    earth: "stable",
    water: "risk",
    needAction: "no",
    structureSignal: "none",
    momentumSignal: "none",
    zoneSignal: "middle",
    validationState: "pending"
  },
  riskoff: {
    btc: "weak",
    ether: "strong",
    fire: "medium",
    air: "weak",
    earth: "weak",
    water: "weak",
    needAction: "no",
    structureSignal: "none",
    momentumSignal: "none",
    zoneSignal: "middle",
    validationState: "pending"
  }
};
