// Operator Intelligence V1 — Dimension Capital
//
// Module pur, isolé. Ne lit rien depuis le moteur décisionnel.
// Ne modifie aucun repo (behavior-repo, memory-repo, session-repo).
// Ne déclenche aucun événement global.
//
// Entrée  : trades — tableau de trades canoniques FILLED (sortie de mapOrderRows)
// Sortie  : objet JSON structuré (voir docs/architecture/oi_v1_capital_architecture.md §8)
//
// Export unique : computeCapital(trades)
//
// Référence : docs/architecture/oi_v1_capital_architecture.md
// Doctrine  : docs/doctrine/operator_intelligence_v1.md

// ── Constantes ────────────────────────────────────────────────────────────────

// Ordonnés du plus long au plus court — évite les correspondances partielles
// (FDUSD avant USDT, BNB avant BTC, etc.)
const QUOTE_ASSETS = ['FDUSD', 'BUSD', 'USDC', 'TUSD', 'USDT', 'DAI', 'BNB', 'ETH', 'BTC'];

// Base assets qui sont eux-mêmes des stablecoins — pour la détection stable/stable
const STABLE_BASES = new Set(['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD', 'DAI', 'UST', 'USDP']);

const SEUILS = {
  CR3_CONCENTRATION:    0.65,  // CR3 ≥ seuil → Concentré ou Rotatif
  CR3_DIVERSIFICATION:  0.40,  // CR3 < seuil → Diversifié
  ROTATION_SEUIL:       0.45,  // rotation_score ≥ seuil → Rotatif
  MIN_VOLUME_ACTIF:     0.01,  // part du volume_total en-dessous de laquelle un actif est "marginal"
  MIN_ORDRES_FENETRE:   5,     // fenêtre mensuelle < N ordres → ignorée pour rotation
  MIN_ORDRES_FILLED:    20,    // en-dessous → Indisponible
  MIN_MOIS:             2,     // en-dessous → Indisponible
  MIN_SYMBOLES:         2,     // en-dessous → Indisponible
};

// ── extractBaseAsset ──────────────────────────────────────────────────────────
// Extrait l'actif de base depuis une paire de trading Binance.
// "BTCUSDT" → "BTC"  ·  "ETHBUSD" → "ETH"  ·  "TAOUSDT" → "TAO"
// Retourne le symbole tel quel si aucun quote connu n'est détecté.

function extractBaseAsset(symbol) {
  const s = String(symbol || '').toUpperCase().trim();
  for (const q of QUOTE_ASSETS) {
    if (s.endsWith(q) && s.length > q.length) {
      const base = s.slice(0, s.length - q.length);
      if (base.length >= 2) return base;
    }
  }
  return s;
}

// ── isStablePair ──────────────────────────────────────────────────────────────
// Détecte les paires stable/stable (BUSDUSDT, TUSDUSDT, etc.).
// Ces paires représentent des conversions, pas des positions sur actifs.
// Retourne true si la base extraite est elle-même un stablecoin.

function isStablePair(symbol) {
  return STABLE_BASES.has(extractBaseAsset(String(symbol || '').toUpperCase().trim()));
}

// ── groupByBase ───────────────────────────────────────────────────────────────
// Agrège les trades par actif de base.
//
// Deux passes :
//   Passe 1 — déterminer si quote_value est exploitable sur ≥ 50% des trades
//   Passe 2 — agréger avec quote_value (valeur monétaire) ou 1 par ordre (order_count)
//
// quantity n'est jamais utilisé comme poids : comparer des quantités de BTC,
// TAO ou FET n'a aucun sens inter-symboles.
//
// Retourne :
//   volumeMap      : Map<base_asset, { volume, count }>
//   ponderation    : "quote_value" | "order_count"
//   stables_exclus : ordres stable/stable exclus du volume (inclus dans ordres_total)
//   ordres_total   : tous les ordres reçus

function groupByBase(trades) {
  // Passe 1 — évaluer la disponibilité de quote_value
  let qv_disponible = 0;
  let tradable      = 0;

  for (const t of trades) {
    const sym = String(t.symbol || '').toUpperCase().trim();
    if (isStablePair(sym)) continue;
    tradable++;
    if (Number(t.quote_value) > 0) qv_disponible++;
  }

  const ponderation = (tradable > 0 && qv_disponible / tradable >= 0.50)
    ? 'quote_value'
    : 'order_count';

  // Passe 2 — agrégation
  const volumeMap    = new Map();
  let stables_exclus = 0;
  let ordres_total   = 0;

  for (const t of trades) {
    ordres_total++;
    const sym = String(t.symbol || '').toUpperCase().trim();

    if (isStablePair(sym)) {
      stables_exclus++;
      continue;
    }

    const base   = extractBaseAsset(sym);
    const weight = ponderation === 'quote_value'
      ? Number(t.quote_value)
      : 1;   // order_count : chaque ordre pèse 1, indépendamment du token

    if (!volumeMap.has(base)) volumeMap.set(base, { volume: 0, count: 0 });
    const entry = volumeMap.get(base);
    entry.volume += weight;
    entry.count  += 1;
  }

  return { volumeMap, ponderation, stables_exclus, ordres_total };
}

// ── computeCR3 ────────────────────────────────────────────────────────────────
// Calcule le taux de concentration des 3 premiers actifs (CR3).
// Signal primaire de classification.
//
// Retourne :
//   cr3             : 0–1
//   top3_symboles   : ['BTC', 'ETH', 'SOL']
//   volume_total    : somme des volumes (unité dépend du mode de pondération)
//   symboles_actifs : actifs avec ≥ MIN_VOLUME_ACTIF du total

function computeCR3(volumeMap) {
  if (!volumeMap || volumeMap.size === 0) {
    return { cr3: 0, top3_symboles: [], volume_total: 0, symboles_actifs: 0 };
  }

  const sorted = [...volumeMap.entries()]
    .sort((a, b) => b[1].volume - a[1].volume);

  const volume_total = sorted.reduce((s, [, e]) => s + e.volume, 0);

  if (volume_total === 0) {
    return { cr3: 0, top3_symboles: [], volume_total: 0, symboles_actifs: 0 };
  }

  const top3        = sorted.slice(0, 3);
  const top3_volume = top3.reduce((s, [, e]) => s + e.volume, 0);
  const cr3         = top3_volume / volume_total;

  const seuil_actif     = volume_total * SEUILS.MIN_VOLUME_ACTIF;
  const symboles_actifs = sorted.filter(([, e]) => e.volume >= seuil_actif).length;

  return {
    cr3:           Math.round(cr3 * 10000) / 10000,
    top3_symboles: top3.map(([base]) => base),
    volume_total:  Math.round(volume_total * 100) / 100,
    symboles_actifs,
  };
}

// ── computeHHI ────────────────────────────────────────────────────────────────
// Calcule l'indice de Herfindahl-Hirschman (signal de vérification secondaire).
// HHI = Σ(si²) où si = volume_i / volume_total

function computeHHI(volumeMap) {
  if (!volumeMap || volumeMap.size === 0) return 0;

  const volumes      = [...volumeMap.values()].map(e => e.volume);
  const volume_total = volumes.reduce((s, v) => s + v, 0);
  if (volume_total === 0) return 0;

  const hhi = volumes.reduce((s, v) => {
    const share = v / volume_total;
    return s + share * share;
  }, 0);

  return Math.round(hhi * 10000) / 10000;
}

// ── computeRotation ───────────────────────────────────────────────────────────
// Découpe la période en fenêtres mensuelles et calcule la rotation du top-3.
// Utilise la similarité de Jaccard entre fenêtres consécutives.
//
// Pondération : toujours order_count = 1 par ordre.
// La rotation mesure la fréquence (quels actifs sont tradés), pas le volume.
// Cela la rend indépendante du mode de pondération de groupByBase().
//
// Retourne :
//   rotation_score  : 0–1 (null si période ou données insuffisantes)
//   fenetres_valides: fenêtres retenues (≥ MIN_ORDRES_FENETRE)
//   fenetres_total  : total des fenêtres mensuelles détectées
//   partiel         : true si > 30% des fenêtres ont été ignorées
//   raison          : motif si rotation_score est null

function computeRotation(trades) {
  if (!trades || trades.length === 0) {
    return { rotation_score: null, fenetres_valides: 0, fenetres_total: 0, partiel: false, raison: 'aucun_trade' };
  }

  // Regrouper par fenêtre mensuelle YYYY-MM (UTC — évite les décalages de timezone)
  const fenetreMap = new Map();
  for (const t of trades) {
    const sym = String(t.symbol || '').toUpperCase().trim();
    if (isStablePair(sym)) continue;

    const d   = new Date(t.timestamp);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

    if (!fenetreMap.has(key)) fenetreMap.set(key, []);
    fenetreMap.get(key).push(t);
  }

  const fenetres_total = fenetreMap.size;

  if (fenetres_total < 3) {
    return { rotation_score: null, fenetres_valides: 0, fenetres_total, partiel: false, raison: 'periode_insuffisante' };
  }

  // Calculer le top-3 par fenêtre (order_count = 1 — fréquence, pas volume)
  const tops = [];
  const keys = [...fenetreMap.keys()].sort();

  for (const key of keys) {
    const ftrades = fenetreMap.get(key);
    if (ftrades.length < SEUILS.MIN_ORDRES_FENETRE) continue;

    const countMap = new Map();
    for (const t of ftrades) {
      const base = extractBaseAsset(String(t.symbol || '').toUpperCase().trim());
      countMap.set(base, (countMap.get(base) || 0) + 1);
    }

    const top3 = new Set(
      [...countMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([base]) => base)
    );

    tops.push(top3);
  }

  const fenetres_valides = tops.length;
  const partiel = fenetres_total > 0 &&
    (fenetres_total - fenetres_valides) / fenetres_total > 0.30;

  if (fenetres_valides < 2) {
    return { rotation_score: null, fenetres_valides, fenetres_total, partiel, raison: 'fenetres_insuffisantes' };
  }

  // Similarité de Jaccard entre fenêtres consécutives
  let jaccard_sum = 0;
  for (let i = 0; i < tops.length - 1; i++) {
    const A            = tops[i];
    const B            = tops[i + 1];
    const intersection = [...A].filter(x => B.has(x)).length;
    const union        = new Set([...A, ...B]).size;
    jaccard_sum       += union > 0 ? intersection / union : 1;
  }

  const avg_jaccard    = jaccard_sum / (tops.length - 1);
  const rotation_score = Math.round((1 - avg_jaccard) * 10000) / 10000;

  return { rotation_score, fenetres_valides, fenetres_total, partiel, raison: null };
}

// ── computeConfidence ─────────────────────────────────────────────────────────
// Calcule le niveau de confiance selon les règles §6 du document d'architecture.
//
// stats = { mois_couverts, symboles_actifs, ordres_filled }
// meta  = { rotation_indetectable, zone_ambigue }

function computeConfidence(stats, meta = {}) {
  const { mois_couverts, symboles_actifs, ordres_filled } = stats;
  const { rotation_indetectable = false, zone_ambigue = false } = meta;

  if (
    mois_couverts   < SEUILS.MIN_MOIS          ||
    symboles_actifs < SEUILS.MIN_SYMBOLES       ||
    ordres_filled   < SEUILS.MIN_ORDRES_FILLED
  ) return 'Indisponible';

  let niveau;

  if (mois_couverts >= 6 && symboles_actifs >= 5 && ordres_filled >= 100) {
    niveau = 'Élevé';
  } else if (mois_couverts < 3 || symboles_actifs < 3 || ordres_filled < 50) {
    niveau = 'Faible';
  } else {
    niveau = 'Moyen';
  }

  // Modificateurs descendants
  if (rotation_indetectable) {
    if (niveau === 'Élevé') niveau = 'Moyen';
    else if (niveau === 'Moyen') niveau = 'Faible';
  }
  if (zone_ambigue && niveau === 'Élevé') niveau = 'Moyen';

  return niveau;
}

// ── buildNote ─────────────────────────────────────────────────────────────────
// Produit la phrase de restitution française pour behavior-view.js.
// Respecte les règles linguistiques L1–L6 (doctrine OI V1) :
//   - comportement observable uniquement
//   - jamais d'intention, de conviction, ni d'identité
//   - toujours les chiffres observés

function buildNote(etat, confiance, metriques, periode) {
  const { cr3, top3_symboles, symboles_actifs, rotation_score, zone_ambigue } = metriques;
  const { mois_couverts, ordres_filled }                                       = periode;

  const cr3pct  = `${Math.round(cr3 * 100)}%`;
  const top3str = top3_symboles.length > 0 ? top3_symboles.join(' · ') : '—';

  if (etat === 'Indisponible') {
    return `Données insuffisantes pour calculer la Dimension Capital : ` +
      `${ordres_filled} ordre(s), ${symboles_actifs} actif(s) distinct(s), ` +
      `${mois_couverts} mois — confiance : Indisponible.`;
  }

  if (etat === 'Concentré') {
    if (rotation_score === null) {
      return `Le top-3 (${top3str}) représente ${cr3pct} du volume sur ${mois_couverts} mois. ` +
        `Période insuffisante pour détecter une rotation — ` +
        `style Capital : Concentré (confiance : ${confiance}).`;
    }
    return `Le top-3 (${top3str}) représente ${cr3pct} du volume sur ${mois_couverts} mois. ` +
      `La composition du top-3 reste stable d'un mois à l'autre — ` +
      `style Capital : Concentré (confiance : ${confiance}).`;
  }

  if (etat === 'Rotatif') {
    const rotpct = rotation_score !== null
      ? ` (score de rotation : ${Math.round(rotation_score * 100)}%)`
      : '';
    return `Concentration élevée (CR3 : ${cr3pct}) mais actifs dominants changeants ` +
      `sur ${mois_couverts} mois${rotpct} — ` +
      `style Capital : Rotatif (confiance : ${confiance}).`;
  }

  if (etat === 'Diversifié') {
    if (zone_ambigue) {
      return `Concentration modérée : le top-3 (${top3str}) représente ${cr3pct} du volume ` +
        `sur ${mois_couverts} mois. Activité distribuée sur ${symboles_actifs} actif(s) — ` +
        `style Capital : Diversifié (confiance : ${confiance}).`;
    }
    return `Activité distribuée sur ${symboles_actifs} actif(s) distinct(s). ` +
      `Aucun cluster de 3 symboles ne dépasse ${cr3pct} du volume sur ${mois_couverts} mois — ` +
      `style Capital : Diversifié (confiance : ${confiance}).`;
  }

  return `Style Capital : ${etat} (confiance : ${confiance}).`;
}

// ── computeCapital ────────────────────────────────────────────────────────────
// Orchestrateur principal — export unique du module.
//
// trades : tableau de trades canoniques FILLED (sortie de mapOrderRows)
// Retourne l'objet JSON structuré défini en §8 du document d'architecture.

function computeCapital(trades) {
  // Guard : entrée vide ou invalide
  if (!trades || trades.length === 0) {
    return {
      dimension: 'Capital',
      etat:      'Indisponible',
      confiance: 'Indisponible',
      metriques: {
        symboles_actifs: 0,
        cr3:             0,
        hhi:             0,
        rotation_score:  null,
        top3_symboles:   [],
        ponderation:     'quote_value',
      },
      periode: {
        debut:             null,
        fin:               null,
        mois_couverts:     0,
        ordres_filled:     0,
        fenetres_rotation: 0,
      },
      seuils_appliques: {
        cr3_concentration:   SEUILS.CR3_CONCENTRATION,
        cr3_diversification: SEUILS.CR3_DIVERSIFICATION,
        rotation_seuil:      SEUILS.ROTATION_SEUIL,
      },
      note: 'Aucun ordre exécuté fourni — Dimension Capital non calculable.',
    };
  }

  // ── Période ──────────────────────────────────────────────────────────────────
  const timestamps = trades.map(t => t.timestamp).filter(Boolean).sort((a, b) => a - b);
  const ts_debut   = timestamps[0]                     || null;
  const ts_fin     = timestamps[timestamps.length - 1] || null;

  let mois_couverts = 0;
  if (ts_debut && ts_fin) {
    const d1 = new Date(ts_debut);
    const d2 = new Date(ts_fin);
    mois_couverts = (d2.getUTCFullYear() - d1.getUTCFullYear()) * 12
                  + (d2.getUTCMonth()    - d1.getUTCMonth())
                  + 1;   // +1 : le mois de début est inclus
  }

  const debut = ts_debut ? new Date(ts_debut).toISOString().slice(0, 10) : null;
  const fin   = ts_fin   ? new Date(ts_fin).toISOString().slice(0, 10)   : null;

  // ── Agrégation par base asset ─────────────────────────────────────────────────
  const { volumeMap, ponderation, stables_exclus, ordres_total } = groupByBase(trades);
  const ordres_filled = ordres_total - stables_exclus;

  // ── Métriques de concentration ────────────────────────────────────────────────
  const { cr3, top3_symboles, symboles_actifs } = computeCR3(volumeMap);
  const hhi = computeHHI(volumeMap);

  // ── Rotation ──────────────────────────────────────────────────────────────────
  const { rotation_score, fenetres_valides } = computeRotation(trades);

  // ── Classification ────────────────────────────────────────────────────────────
  let etat;
  let rotation_indetectable = false;
  let zone_ambigue           = false;

  if (
    mois_couverts   < SEUILS.MIN_MOIS          ||
    symboles_actifs < SEUILS.MIN_SYMBOLES       ||
    ordres_filled   < SEUILS.MIN_ORDRES_FILLED
  ) {
    etat = 'Indisponible';

  } else if (cr3 >= SEUILS.CR3_CONCENTRATION) {
    if (rotation_score === null) {
      etat = 'Concentré';
      rotation_indetectable = true;
    } else if (rotation_score >= SEUILS.ROTATION_SEUIL) {
      etat = 'Rotatif';
    } else {
      etat = 'Concentré';
    }

  } else if (cr3 < SEUILS.CR3_DIVERSIFICATION) {
    etat = 'Diversifié';

  } else {
    // Zone ambiguë : 0.40 ≤ CR3 < 0.65
    etat         = 'Diversifié';
    zone_ambigue = true;
  }

  // ── Confiance ─────────────────────────────────────────────────────────────────
  const confiance = computeConfidence(
    { mois_couverts, symboles_actifs, ordres_filled },
    { rotation_indetectable, zone_ambigue }
  );

  // ── Note de restitution ───────────────────────────────────────────────────────
  const note = buildNote(
    etat,
    confiance,
    { cr3, top3_symboles, symboles_actifs, rotation_score, zone_ambigue },
    { mois_couverts, ordres_filled }
  );

  // ── Sortie ────────────────────────────────────────────────────────────────────
  return {
    dimension: 'Capital',
    etat,
    confiance,
    metriques: {
      symboles_actifs,
      cr3,
      hhi,
      rotation_score,
      top3_symboles,
      ponderation,
    },
    periode: {
      debut,
      fin,
      mois_couverts,
      ordres_filled,
      fenetres_rotation: fenetres_valides,
    },
    seuils_appliques: {
      cr3_concentration:   SEUILS.CR3_CONCENTRATION,
      cr3_diversification: SEUILS.CR3_DIVERSIFICATION,
      rotation_seuil:      SEUILS.ROTATION_SEUIL,
    },
    note,
  };
}

export { computeCapital };
