import { ENGINE_MODE_LABELS, STATE_LABELS, STATUS_LABELS, TOKEN_LABELS, VALIDATION_TEXT } from "./data.js";
import { assessMarket } from "./market-state.js";

// ─── Mapping ancien état formulaire → state/modifier ──────────
// Séparé de assessMarket() — logique de traduction, pas logique métier.

function mapLegacyMarketState(marketValue) {
  const MAP = {
    range:       { state: "range",       modifier: "stable"   },
    compression: { state: "compression", modifier: "stable"   },
    expansion:   { state: "expansion",   modifier: "stable"   },
    defense:     { state: "defense",     modifier: "stable"   },
    riskoff:     { state: "defense",     modifier: "unstable" }
  };
  return MAP[String(marketValue || "range").toLowerCase()] || { state: "range", modifier: "stable" };
}

function tokenLabel(value) {
  return TOKEN_LABELS[value] || value;
}

function statusLabel(value) {
  return STATUS_LABELS[value] || value;
}

function engineModeLabel(value) {
  return ENGINE_MODE_LABELS[value] || value;
}

export function prefillConstellium(form) {
  const next = { ...form };
  if (form.market === "range") Object.assign(next, { ether: "stable", fire: "medium", air: "weak", earth: "stable", water: "weak" });
  else if (form.market === "compression") Object.assign(next, { ether: "stable", fire: "medium", air: "emerging", earth: "stable", water: "weak" });
  else if (form.market === "expansion") Object.assign(next, { ether: "strong", fire: "strong", air: "strong", earth: "stable", water: "risk" });
  else Object.assign(next, { ether: "strong", fire: "weak", air: "weak", earth: "strong", water: "weak" });
  return next;
}

export function computeScore(v) {
  let score = 50;
  if (v.market === "expansion") score += 20;
  if (v.market === "compression") score += 8;
  if (v.market === "defense") score -= 20;
  if (v.market === "riskoff") score -= 35;
  if (v.emotion === "calm") score += 10;
  if (v.emotion === "stress") score -= 20;
  if (v.emotion === "fomo") score -= 30;
  if (v.fire === "strong") score += 12;
  if (v.fire === "medium") score += 6;
  if (v.fire === "weak") score -= 4;
  if (v.air === "strong") score += 8;
  if (v.air === "emerging") score += 4;
  if (v.earth === "strong") score += 5;
  if (v.ether === "strong") score += 5;
  if (v.dxy === "up") score -= 10;
  if (v.dxy === "down") score += 5;
  if (v.btc === "strong") score += 8;
  if (v.btc === "weak") score -= 12;
  return Math.max(0, Math.min(100, score));
}

export function baseEngine(v) {
  const score = computeScore(v);
  let mode = "range";
  if (v.market === "compression") mode = "pre-breakout";
  if (v.market === "expansion") mode = "continuation";
  if (v.market === "defense") mode = "capital-protection";
  if (v.market === "riskoff") mode = "survival";

  const attackRaw = ((v.market === "compression" || v.market === "expansion") &&
    v.emotion === "calm" &&
    v.btc !== "weak" &&
    (v.fire === "medium" || v.fire === "strong" || v.air === "emerging" || v.air === "strong")) ? "ON" : "OFF";

  const sniperRaw = (
    v.structureSignal !== "none" &&
    v.momentumSignal !== "none" &&
    ["low_range", "high_range", "breakout_level"].includes(v.zoneSignal) &&
    v.emotion === "calm"
  ) ? "ON" : "OFF";

  return { score, mode, attackRaw, sniperRaw };
}

export function profileMatrix(profile, engine, v) {
  let core = "ON";
  let attack = "OFF";
  let sniper = "OFF";
  let tradingStatus = "CORE ONLY";
  let traffic = "Le socle reste prioritaire. On protège la structure avant toute initiative.";
  let reaction = "";

  if (profile === "PASSIVE") {
    reaction = "Profil passif structuré : priorité au socle, attaque rare, sniper très sélectif.";
    if (engine.sniperRaw === "ON" && v.needAction === "yes" && v.coreOrders !== "yes") {
      sniper = "ON";
      attack = "LIGHT";
      tradingStatus = "SNIPER LIGHT";
      traffic = "Fenêtre SNIPER légère, uniquement si l'action est réellement nécessaire et immédiatement défendable.";
    }
  }

  if (profile === "BALANCED") {
    reaction = "Profil équilibré : socle d'abord, attaque mesurée ensuite, sniper réservé aux configurations lisibles.";
    if (engine.sniperRaw === "ON") {
      sniper = "ON";
      attack = "ON";
      tradingStatus = "SNIPER READY";
      traffic = "La lecture autorise une fenêtre SNIPER, avec une taille disciplinée et une exécution nette.";
    } else if (engine.attackRaw === "ON") {
      attack = "LIGHT";
      tradingStatus = "TRADE LIGHT";
      traffic = "Une couche offensive légère peut être travaillée si le cadre reste propre.";
    }
  }

  if (profile === "ACTIVE") {
    reaction = "Profil actif discipliné : socle flexible, attaque assumée mais tenue, sniper engagé seulement sur lecture complète.";
    if (engine.sniperRaw === "ON") {
      sniper = "ON";
      attack = "ON";
      tradingStatus = "SNIPER READY";
      traffic = "Fenêtre offensive ouverte, à condition de conserver une exécution propre et réversible.";
    } else if (engine.attackRaw === "ON") {
      attack = "ON";
      tradingStatus = "TRADE OK";
      traffic = "Le contexte permet une offensive assumée, sans relâcher le contrôle du risque.";
    } else {
      tradingStatus = "WAIT";
      traffic = "Aucun avantage suffisant : l'attente reste plus qualitative qu'une exécution moyenne.";
    }
  }

  if (v.emotion === "stress" || v.emotion === "fomo") {
    attack = "OFF";
    sniper = "OFF";
    tradingStatus = "NO TRADE";
    traffic = "L'état émotionnel invalide l'offensive : aucune exécution discrétionnaire.";
  }

  return { core, attack, sniper, tradingStatus, traffic, reaction };
}

export function applyValidation(profileOut, v) {
  const result = { ...profileOut };
  let validationSummary = VALIDATION_TEXT[v.validationState];

  if (v.validationState === "rejected") {
    result.attack = "OFF";
    result.sniper = "OFF";
    result.tradingStatus = "VALIDATION BLOCK";
    result.traffic = "Validation refusée : toute exécution offensive est suspendue.";
  }

  if (v.validationState === "adjusted") {
    if (result.attack === "ON") result.attack = "LIGHT";
    if (result.sniper === "ON" && v.userProfile !== "ACTIVE") result.sniper = "OFF";
    if (result.tradingStatus !== "NO TRADE") result.tradingStatus = "ADJUSTED";
  }

  if (v.validationState === "pending" && (result.attack === "ON" || result.sniper === "ON")) {
    if (result.sniper === "ON") result.sniper = "WATCH";
    if (result.attack === "ON") result.attack = "LIGHT";
    result.tradingStatus = "WAIT VALIDATION";
    validationSummary = "Le setup est visible, mais la validation humaine manque encore pour ouvrir franchement la fenêtre.";
  }

  return { ...result, validationSummary };
}

export function detectInconsistencies(v, profileOut) {
  const issues = [];
  if (v.market === "expansion" && v.fire === "weak") issues.push("Expansion déclarée, mais FEU reste faible.");
  if (v.market === "range" && v.ether === "weak") issues.push("Range déclaré, mais ÉTHER reste faible.");
  if (v.userProfile === "PASSIVE" && profileOut.attack === "ON") issues.push("Profil passif, mais offensive finale encore trop agressive.");
  if ((profileOut.sniper === "ON" || profileOut.sniper === "WATCH") && v.zoneSignal === "middle") issues.push("Lecture SNIPER activée au milieu du range.");
  if (v.validationState === "accepted" && !v.validationNote.trim()) issues.push("Validation acceptée sans note de contexte.");
  return issues;
}

export function buildPayload(v, previousPayload = null) {
  const engine = baseEngine(v);
  const profiled = profileMatrix(v.userProfile, engine, v);
  const filtered = applyValidation(profiled, v);
  const { state: mState, modifier: mModifier } = mapLegacyMarketState(v.market);
  const marketReading = assessMarket(mState, mModifier);

  let alertLevel = "Faible";
  if (engine.score < 35 || v.emotion === "stress" || v.emotion === "fomo" || v.market === "riskoff") alertLevel = "Élevé";
  else if (engine.score < 60 || v.market === "compression" || v.dxy === "up" || filtered.sniper === "ON" || filtered.sniper === "WATCH") alertLevel = "Moyen";

  let alignment = "Bon";
  if (v.market === "expansion" && v.fire === "weak") alignment = "Fragile";
  if (v.market === "range" && v.ether === "weak") alignment = "Moyen";
  if (v.validationState === "rejected") alignment = "Veto humain";

  let action = "Le marché ne justifie pas d'initiative supplémentaire : on garde le socle et on refuse toute agitation inutile.";
  let summary = "Le moteur protège d'abord le socle. La décision finale reste filtrée par le profil, l'émotion et la validation humaine.";
  let tags = ["universel", v.userProfile.toLowerCase(), "core"];

  if (filtered.sniper === "ON") {
    action = "La fenêtre SNIPER est ouverte : l'opportunité existe, mais elle doit rester légère, propre et parfaitement tenue.";
    summary = "Le setup est suffisamment clair pour autoriser une lecture SNIPER alignée avec le profil et la validation.";
    tags = ["sniper", v.userProfile.toLowerCase(), "adaptatif"];
  } else if (filtered.sniper === "WATCH") {
    action = "Le setup mérite une veille SNIPER, sans déclenchement tant que la validation humaine n'a pas verrouillé le contexte.";
    summary = "La structure existe, mais l'exécution reste volontairement retenue jusqu'à confirmation humaine.";
    tags = ["sniper-watch", v.userProfile.toLowerCase(), "validation"];
  } else if (filtered.attack === "ON") {
    action = "Une offensive peut être travaillée : le contexte l'autorise, mais uniquement dans un cadre de risque strict.";
    summary = "Le moteur ouvre une couche offensive parce que le profil, la structure et la validation restent cohérents.";
    tags = ["attack", v.userProfile.toLowerCase(), "adaptatif"];
  } else if (filtered.attack === "LIGHT") {
    action = "Une offensive légère peut être envisagée, avec une exposition réduite et un niveau d'exigence inchangé.";
    summary = "Le moteur réduit volontairement l'agressivité pour rester aligné avec le profil, la structure et la validation.";
    tags = ["attack-light", v.userProfile.toLowerCase(), "filtre"];
  }

  const previousState = previousPayload ? previousPayload.market_state : null;
  const trigger = !previousPayload
    ? { level: "INIT", text: "Lecture initiale enregistrée", reasons: ["Première lecture de référence enregistrée."] }
    : previousState !== v.market || engine.attackRaw === "ON" || engine.sniperRaw === "ON" || v.emotion === "stress" || v.emotion === "fomo" || v.validationState !== "pending"
      ? { level: "OUI", text: "Réévaluation recommandée", reasons: ["Changement de contexte, de setup ou de validation détecté."] }
      : { level: "NON", text: "Cadre stable, pas de réévaluation forcée", reasons: ["Aucune rupture de structure significative."] };

  const why = [
    `Score système : ${engine.score}/100.`,
    `Lecture moteur : ${engineModeLabel(engine.mode)}.`,
    `ATTACK brut : ${statusLabel(engine.attackRaw)}.`,
    `SNIPER brut : ${statusLabel(engine.sniperRaw)}.`,
    `Réaction profil : ${profiled.reaction}`,
    `Validation humaine : ${tokenLabel(v.validationState)}.`,
    filtered.validationSummary
  ];

  return {
    version: "7.3.2e-shell + 4.5-engine",
    market_state: v.market,
    market_label: STATE_LABELS[v.market] || v.market,
    previous_state: previousState,
    score: engine.score,
    engine_mode: engine.mode,
    core_mode: filtered.core,
    attack_mode_raw: engine.attackRaw,
    sniper_mode_raw: engine.sniperRaw,
    attack_mode_final: filtered.attack,
    sniper_mode_final: filtered.sniper,
    trading_status: filtered.tradingStatus,
    trigger_level: alertLevel,
    traffic_light: filtered.traffic,
    alignment,
    btc_state: v.btc,
    dxy_state: v.dxy,
    emotion_state: v.emotion,
    user_profile: v.userProfile,
    core_orders: v.coreOrders,
    need_action: v.needAction,
    constellium: { ether: v.ether, fire: v.fire, air: v.air, earth: v.earth, water: v.water },
    setup_inputs: { structure_signal: v.structureSignal, momentum_signal: v.momentumSignal, zone_signal: v.zoneSignal },
    validation: { state: v.validationState, note: v.validationNote.trim(), summary: filtered.validationSummary },
    action_recommended: action,
    summary,
    profile_reaction: profiled.reaction,
    why,
    inconsistencies: detectInconsistencies(v, filtered),
    order_zones: {
      buy: "Zone d'achat du socle : bas de structure ou reprise validée sur un niveau lisible.",
      sell: "Zone d'allègement du socle : haut de structure, extension ou zone de respiration du mouvement.",
      risk:
        filtered.sniper === "ON" ? "SNIPER actif : taille légère, invalidation courte, discipline stricte." :
        filtered.attack === "ON" ? "Offensive active : taille contrôlée et exécution réversible." :
        filtered.attack === "LIGHT" ? "Offensive légère : exposition réduite et validation prioritaire." :
        "Offensive coupée : aucun ordre agressif supplémentaire."
    },
    trigger_intelligent: trigger,
    tags,
    updated_at: new Date().toISOString(),
    marketReading
  };
}

export function deriveUiModel(payload) {
  const offensive = payload.attack_mode_final === "ON" || payload.sniper_mode_final === "ON";
  const waiting = payload.trading_status.includes("WAIT") || payload.trading_status === "CORE ONLY";
  return {
    shellState: payload.market_state,
    journalMain: payload.action_recommended,
    journalSub: payload.summary,
    journalStructure: payload.setup_inputs.structure_signal.replaceAll("_", " "),
    journalRisk: payload.trigger_level,
    journalAction: payload.trading_status,
    signalPill: payload.trigger_intelligent.level,
    signalMain: offensive ? "Le moteur lit une fenêtre exploitable, mais elle reste filtrée par le profil et la tenue d'exécution." : "Le moteur préfère encore la clarté du cadre à la tentation de précipiter un geste moyen.",
    signalSub: payload.validation.summary,
    mantraPill: payload.validation.state.toUpperCase(),
    mantraMain: offensive ? "Exécuter léger, confirmer vite, sortir net si la structure se fissure." : "Préserver le socle, filtrer l'émotion, attendre la preuve qui mérite vraiment l'action.",
    structureAlert: payload.setup_inputs.structure_signal === "none" ? "À surveiller" : "Lisible",
    structureSub: payload.setup_inputs.structure_signal === "none" ? "Aucune structure offensive propre n'est encore installée." : "Le setup apporte une base lisible pour travailler la décision.",
    riskAlert: payload.trigger_level,
    riskSub: payload.traffic_light,
    opportunityAlert: offensive ? "Ouverte" : waiting ? "Patiente" : "Contrôlée",
    opportunitySub: payload.action_recommended,
    disciplineAlert: payload.validation.state === "rejected" ? "Blocage" : "Critique",
    disciplineSub: payload.validation.summary,
    agentName: payload.sniper_mode_final === "ON" ? "Sniper" : payload.attack_mode_final === "ON" ? "Attaque" : "Socle",
    agentDesc: payload.profile_reaction,
    allowedNow: offensive ? "Exécuter avec une taille contrôlée" : "Travailler le socle",
    blockedNow: payload.emotion_state === "stress" || payload.emotion_state === "fomo" ? "Toute initiative discrétionnaire" : "Entrer sans validation",
    watchNow: payload.trigger_intelligent.reasons[0],
    nextPriority: payload.validation.state === "pending" ? "Obtenir la validation humaine" : "Respecter la discipline d'exécution",
    decisionPanel: payload.action_recommended,
    ultraShortPanel: `${payload.market_label} · ${payload.trading_status}`,
    alignmentNote: payload.alignment === "Bon" ? "Le marché et la Constellium restent cohérents." : "Une friction interne impose davantage de retenue.",
    scoreSub: payload.score >= 70 ? "Contexte puissant" : payload.score >= 50 ? "Contexte exploitable" : "Contexte fragile"
  };
}
