// Operator Intelligence V1 — Dimension Portefeuille
//
// Module pur, isolé. Ne lit rien depuis le moteur décisionnel.
// Ne modifie aucun repo (behavior-repo, memory-repo, session-repo).
// Ne déclenche aucun événement global.
//
// Entrée  : trades — tableau de trades canoniques FILLED (sortie de mapOrderRows)
// Sortie  : objet JSON structuré (voir docs/architecture/oi_v1_portefeuille_architecture.md §10)
//
// Export unique : computePortefeuille(trades)
//
// Référence : docs/architecture/oi_v1_portefeuille_architecture.md
// Doctrine  : docs/doctrine/operator_intelligence_v1.md

// ── Constantes ────────────────────────────────────────────────────────────────

// Ordonnés du plus long au plus court — évite les correspondances partielles
const QUOTE_ASSETS = ['FDUSD', 'BUSD', 'USDC', 'TUSD', 'USDT', 'DAI', 'BNB', 'ETH', 'BTC'];

// Base assets qui sont eux-mêmes des stablecoins — pour la détection stable/stable
const STABLE_BASES = new Set(['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD', 'DAI', 'UST', 'USDP']);

const SEUILS = {
  MIN_ORDRES:                   20,   // Garde 1 : volume insuffisant → Indisponible
  MIN_MOIS_ACTIFS:               2,   // Garde 2 : périodes insuffisantes → Indisponible
  RECURRENCE_NOYAU_SEUIL:     0.50,  // Part minimale de périodes actives pour appartenir au noyau
  SEUIL_TAILLE_NOYAU:            2,  // Nombre minimum de symboles noyau pour Ancré
  SEUIL_NOYAU_WEIGHT:          0.60, // Part minimale d'activité portée par le noyau pour Ancré
  SEUIL_EXPLORATION:           0.40, // Taux minimum de nouveaux symboles par période pour Explorateur
  SEUIL_NOYAU_MAX_EXPLORATEUR:   1,  // Nombre maximum de symboles noyau compatible avec Explorateur
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

// ── toYYYYMM ─────────────────────────────────────────────────────────────────
// Convertit un timestamp ms UTC en période calendaire UTC 'YYYY-MM'.

function toYYYYMM(timestamp) {
  const d = new Date(timestamp);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// ── buildPeriodesActives ──────────────────────────────────────────────────────
// Construit la liste triée des mois YYYY-MM distincts contenant ≥ 1 ordre FILLED.
// Les paires stable/stable sont incluses dans le comptage des ordres (nb_ordres_filled)
// mais exclues de l'univers de symboles — cohérent avec Capital V1.
//
// Retourne :
//   periodes       : Array<'YYYY-MM'> trié ASC
//   nb_ordres_filled : ordres hors stables (base du garde 1)

function buildPeriodesActives(trades) {
  const periodeSet = new Set();
  let nb_ordres_filled = 0;

  for (const t of trades) {
    if (t.timestamp == null) continue;
    const sym = String(t.symbol || '').toUpperCase().trim();
    if (isStablePair(sym)) continue;
    nb_ordres_filled++;
    periodeSet.add(toYYYYMM(t.timestamp));
  }

  const periodes = [...periodeSet].sort();
  return { periodes, nb_ordres_filled };
}

// ── buildSymbolPeriodeMap ─────────────────────────────────────────────────────
// Pour chaque base asset distinct (hors stable/stable), construit l'ensemble
// des périodes YYYY-MM dans lesquelles il apparaît.
//
// Retourne : Map<base_asset, Set<'YYYY-MM'>>

function buildSymbolPeriodeMap(trades) {
  const map = new Map();

  for (const t of trades) {
    if (t.timestamp == null) continue;
    const sym = String(t.symbol || '').toUpperCase().trim();
    if (isStablePair(sym)) continue;

    const base   = extractBaseAsset(sym);
    const period = toYYYYMM(t.timestamp);

    if (!map.has(base)) map.set(base, new Set());
    map.get(base).add(period);
  }

  return map;
}

// ── determineWeighting ────────────────────────────────────────────────────────
// Même règle que Capital V1 : si ≥ 50% des ordres FILLED (hors stable/stable)
// ont une quote_value non nulle → pondération quote_value, sinon order_count = 1.
//
// Retourne : 'quote_value' | 'order_count'

function determineWeighting(trades) {
  let tradable     = 0;
  let qv_disponible = 0;

  for (const t of trades) {
    const sym = String(t.symbol || '').toUpperCase().trim();
    if (isStablePair(sym)) continue;
    tradable++;
    if (Number(t.quote_value) > 0) qv_disponible++;
  }

  return (tradable > 0 && qv_disponible / tradable >= 0.50)
    ? 'quote_value'
    : 'order_count';
}

// ── computePeriodePresence ────────────────────────────────────────────────────
// M1 — Pour chaque symbole, calcule le ratio de périodes actives dans lesquelles
// il apparaît.
//
//   periode_presence(S) = |mois_avec_S| / nb_mois_actifs
//
// Retourne : Map<base_asset, ratio 0–1>

function computePeriodePresence(symbolPeriodeMap, nbMoisActifs) {
  const presence = new Map();
  if (nbMoisActifs === 0) return presence;

  for (const [symbol, periodes] of symbolPeriodeMap) {
    presence.set(symbol, Math.round((periodes.size / nbMoisActifs) * 10000) / 10000);
  }

  return presence;
}

// ── computeNoyau ──────────────────────────────────────────────────────────────
// M3 — Symboles présents dans ≥ RECURRENCE_NOYAU_SEUIL des périodes actives.
//
//   noyau_symbols = { S | periode_presence(S) ≥ RECURRENCE_NOYAU_SEUIL }
//
// Retourne : { noyau_symbols: Array<String>, taille_noyau: Number }

function computeNoyau(periodePresence) {
  const noyau_symbols = [];

  for (const [symbol, ratio] of periodePresence) {
    if (ratio >= SEUILS.RECURRENCE_NOYAU_SEUIL) {
      noyau_symbols.push(symbol);
    }
  }

  // Tri stablement par ratio décroissant pour une note lisible
  noyau_symbols.sort((a, b) => periodePresence.get(b) - periodePresence.get(a));

  return { noyau_symbols, taille_noyau: noyau_symbols.length };
}

// ── computeNoyauWeight ────────────────────────────────────────────────────────
// M4 — Part d'activité portée par les symboles du noyau.
//
//   noyau_weight = poids_noyau / poids_total
//
// Pondération : quote_value si useQuoteValue, sinon order_count = 1.
// Retourne : 0–1

function computeNoyauWeight(trades, noyauSymbols, useQuoteValue) {
  if (noyauSymbols.length === 0) return 0;

  const noyauSet = new Set(noyauSymbols);
  let poids_total = 0;
  let poids_noyau = 0;

  for (const t of trades) {
    const sym = String(t.symbol || '').toUpperCase().trim();
    if (isStablePair(sym)) continue;

    const base   = extractBaseAsset(sym);
    const weight = useQuoteValue ? Number(t.quote_value) : 1;

    poids_total += weight;
    if (noyauSet.has(base)) poids_noyau += weight;
  }

  if (poids_total === 0) return 0;
  return Math.round((poids_noyau / poids_total) * 10000) / 10000;
}

// ── computeRecurrenceRate ─────────────────────────────────────────────────────
// M2 — Taux de récurrence moyen : moyenne de periode_presence(S) sur tous les
// symboles distincts.
//
//   recurrence_rate = mean(periode_presence(S))
//
// Retourne : 0–1

function computeRecurrenceRate(periodePresence) {
  if (periodePresence.size === 0) return 0;

  const ratios = [...periodePresence.values()];
  const sum    = ratios.reduce((s, v) => s + v, 0);
  return Math.round((sum / ratios.length) * 10000) / 10000;
}

// ── computeExplorationRate ────────────────────────────────────────────────────
// M5 — Taux moyen de nouveaux symboles par période active.
//
// Pour chaque période Pk (k ≥ 2) :
//   univers_anterieur = union des symboles de P1..P(k-1)
//   nouveaux_Pk       = symboles de Pk absents de univers_anterieur
//   taux_nouveaux(Pk) = |nouveaux_Pk| / |symboles_Pk|
//
//   exploration_rate = mean(taux_nouveaux(Pk)) pour k = 2..N
//
// La première période est exclue (tous ses symboles sont "nouveaux" par définition).
// Retourne null si nb_mois_actifs < 2 (ne devrait pas arriver après les gardes).
// Retourne 0–1.

function computeExplorationRate(trades, periodes) {
  if (!periodes || periodes.length < 2) return null;

  // Construire un Map<periode, Set<base_asset>> depuis les trades
  const periodeSymbolsMap = new Map();
  for (const p of periodes) periodeSymbolsMap.set(p, new Set());

  for (const t of trades) {
    if (t.timestamp == null) continue;
    const sym = String(t.symbol || '').toUpperCase().trim();
    if (isStablePair(sym)) continue;

    const base   = extractBaseAsset(sym);
    const period = toYYYYMM(t.timestamp);

    if (periodeSymbolsMap.has(period)) {
      periodeSymbolsMap.get(period).add(base);
    }
  }

  // Calculer taux_nouveaux pour chaque période à partir de la deuxième
  const univers_cumulatif = new Set(periodeSymbolsMap.get(periodes[0]));
  const taux_par_periode  = [];

  for (let k = 1; k < periodes.length; k++) {
    const symboles_Pk = periodeSymbolsMap.get(periodes[k]);

    if (symboles_Pk.size === 0) {
      // Période active sans symbole non-stable — taux = 0 (cas improbable)
      taux_par_periode.push(0);
    } else {
      let nouveaux = 0;
      for (const s of symboles_Pk) {
        if (!univers_cumulatif.has(s)) nouveaux++;
      }
      taux_par_periode.push(nouveaux / symboles_Pk.size);
    }

    // Mettre à jour l'univers cumulatif avec les symboles de Pk
    for (const s of symboles_Pk) univers_cumulatif.add(s);
  }

  if (taux_par_periode.length === 0) return 0;

  const sum = taux_par_periode.reduce((s, v) => s + v, 0);
  return Math.round((sum / taux_par_periode.length) * 10000) / 10000;
}

// ── computeUniverseSize ───────────────────────────────────────────────────────
// M6 — Nombre de base assets distincts sur toute la période (hors stable/stable).
// Métrique contextuelle — utilisée dans la note, non utilisée dans la classification.

function computeUniverseSize(symbolPeriodeMap) {
  return symbolPeriodeMap.size;
}

// ── computeConfiance ─────────────────────────────────────────────────────────
// Niveau de confiance selon §9 du document d'architecture.
// Basé uniquement sur nb_mois_actifs — la robustesse de la classification
// dépend directement du nombre de périodes comparables.
//
//   Élevé  : nb_mois_actifs ≥ 6
//   Moyen  : nb_mois_actifs ∈ [3, 5]
//   Faible : nb_mois_actifs = 2

function computeConfiance(nb_mois_actifs) {
  if (nb_mois_actifs >= 6) return 'Élevé';
  if (nb_mois_actifs >= 3) return 'Moyen';
  return 'Faible';
}

// ── buildNote ─────────────────────────────────────────────────────────────────
// Produit la phrase de restitution française pour behavior-view.js.
// Respecte les règles E1–E5 (doctrine OI V1) :
//   - faits observables uniquement
//   - aucune inférence d'intention, de stratégie ou de qualité de décision
//   - jamais de jugement implicite ("bon", "risqué", "prudent")
//   - toujours les chiffres observés
//
// Retourne '' (chaîne vide) si etat === 'Indisponible' — silence structurel UI.

function buildNote(etat, confiance, metriques) {
  if (etat === 'Indisponible') return '';

  const {
    universe_size, nb_mois_actifs, noyau_symbols,
    noyau_weight, exploration_rate,
  } = metriques;

  const intro = `L'activité Order History couvre ${universe_size} actif${universe_size > 1 ? 's' : ''} distinct${universe_size > 1 ? 's' : ''} sur ${nb_mois_actifs} période${nb_mois_actifs > 1 ? 's' : ''} active${nb_mois_actifs > 1 ? 's' : ''}.`;

  if (etat === 'Ancré') {
    const noyauStr  = noyau_symbols.join(' · ');
    const weightPct = Math.round(noyau_weight * 100);
    return `${intro} ${noyauStr} sont présents dans au moins la moitié de ces périodes et concentrent ${weightPct}% des ordres exécutés. Structure de portefeuille : Ancré (confiance : ${confiance}).`;
  }

  if (etat === 'Explorateur') {
    const explorePct = Math.round(exploration_rate * 100);
    return `${intro} En moyenne, ${explorePct}% des actifs traités dans chaque période sont des actifs non présents dans les périodes précédentes. Aucun noyau stable d'actifs récurrents n'est identifié. Structure de portefeuille : Explorateur (confiance : ${confiance}).`;
  }

  if (etat === 'Opportuniste') {
    return `${intro} La distribution entre actifs récurrents et actifs nouveaux ne présente pas de structure dominante nette. Structure de portefeuille : Opportuniste (confiance : ${confiance}).`;
  }

  return `Structure de portefeuille : ${etat} (confiance : ${confiance}).`;
}

// ── computePortefeuille ───────────────────────────────────────────────────────
// Orchestrateur principal — export unique du module.
//
// trades : tableau de trades canoniques FILLED (sortie de mapOrderRows)
// Retourne l'objet JSON structuré défini en §10 du document d'architecture.

function computePortefeuille(trades) {
  // Guard : entrée vide ou invalide
  if (!trades || trades.length === 0) {
    return {
      dimension: 'Portefeuille',
      etat:      'Indisponible',
      note:      '',
      metriques: {
        universe_size:    0,
        nb_mois_actifs:   0,
        nb_ordres_filled: 0,
      },
    };
  }

  // ── Périodes actives et volume ────────────────────────────────────────────────
  const { periodes, nb_ordres_filled } = buildPeriodesActives(trades);
  const nb_mois_actifs = periodes.length;

  // ── Univers de symboles ───────────────────────────────────────────────────────
  const symbolPeriodeMap = buildSymbolPeriodeMap(trades);
  const universe_size    = computeUniverseSize(symbolPeriodeMap);

  // ── GARDE 1 — Volume insuffisant ─────────────────────────────────────────────
  if (nb_ordres_filled < SEUILS.MIN_ORDRES) {
    return {
      dimension: 'Portefeuille',
      etat:      'Indisponible',
      note:      '',
      metriques: { universe_size, nb_mois_actifs, nb_ordres_filled },
    };
  }

  // ── GARDE 2 — Période insuffisante ────────────────────────────────────────────
  if (nb_mois_actifs < SEUILS.MIN_MOIS_ACTIFS) {
    return {
      dimension: 'Portefeuille',
      etat:      'Indisponible',
      note:      '',
      metriques: { universe_size, nb_mois_actifs, nb_ordres_filled },
    };
  }

  // ── GARDE 3 — Univers mono-actif ──────────────────────────────────────────────
  if (universe_size < 2) {
    return {
      dimension: 'Portefeuille',
      etat:      'Indisponible',
      note:      '',
      metriques: { universe_size, nb_mois_actifs, nb_ordres_filled },
    };
  }

  // ── Métriques ─────────────────────────────────────────────────────────────────
  const periodePresence  = computePeriodePresence(symbolPeriodeMap, nb_mois_actifs);
  const recurrence_rate  = computeRecurrenceRate(periodePresence);
  const { noyau_symbols, taille_noyau } = computeNoyau(periodePresence);

  const ponderation      = determineWeighting(trades);
  const useQuoteValue    = ponderation === 'quote_value';
  const noyau_weight     = computeNoyauWeight(trades, noyau_symbols, useQuoteValue);

  const exploration_rate = computeExplorationRate(trades, periodes);

  // ── Classification §8 ─────────────────────────────────────────────────────────
  let etat;

  if (
    taille_noyau  >= SEUILS.SEUIL_TAILLE_NOYAU &&
    noyau_weight  >= SEUILS.SEUIL_NOYAU_WEIGHT
  ) {
    etat = 'Ancré';

  } else if (
    exploration_rate >= SEUILS.SEUIL_EXPLORATION &&
    taille_noyau     <= SEUILS.SEUIL_NOYAU_MAX_EXPLORATEUR
  ) {
    etat = 'Explorateur';

  } else {
    etat = 'Opportuniste';
  }

  // ── Confiance §9 ──────────────────────────────────────────────────────────────
  const confiance = computeConfiance(nb_mois_actifs);

  // ── Métriques de sortie ───────────────────────────────────────────────────────
  const metriques = {
    taille_noyau,
    noyau_weight,
    recurrence_rate,
    exploration_rate,
    universe_size,
    nb_mois_actifs,
    nb_ordres_filled,
    noyau_symbols,
  };

  // ── Note de restitution §11 ───────────────────────────────────────────────────
  const note = buildNote(etat, confiance, metriques);

  // ── Sortie §10 ────────────────────────────────────────────────────────────────
  return {
    dimension: 'Portefeuille',
    etat,
    confiance,
    note,
    metriques,
  };
}

export { computePortefeuille };
