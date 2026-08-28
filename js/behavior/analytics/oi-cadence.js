// Operator Intelligence V1 — Dimension Cadence
// Module pur. Export unique : computeCadence(trades)
// Référence : docs/architecture/oi_v1_cadence_architecture.md

const SEUILS = {
  MIN_ORDRES_FILLED:         20,
  MIN_MOIS:                   3,
  MIN_JOURS_ACTIFS:           5,
  ACTIVE_DAY_RATE_CONTINUE: 0.50,
  BURST_RATIO_CONTINUE:     0.55,
  BURST_RATIO_BURST:        0.70,
  ACTIVE_DAY_RATE_BURST:    0.20,
  PERIODICITY_SCORE_SEUIL:  12,
  CHI2_MIN_ORDRES:          35,
  MEDIAN_GAP_PERIODIQUE:    14,
  BREAK_LONG_SEUIL:         45,
  BOT_DENSITY_SEUIL:        50,
};

// ── toUTCDay ──────────────────────────────────────────────────────────────────
// Convertit un timestamp ms UTC en date calendaire UTC 'YYYY-MM-DD'.

function toUTCDay(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

// ── buildDayMap ───────────────────────────────────────────────────────────────
// Construit une Map<'YYYY-MM-DD', nb_ordres> depuis les timestamps des trades.

function buildDayMap(trades) {
  const dayMap = new Map();
  for (const t of trades) {
    if (t.timestamp == null) continue;
    const day = toUTCDay(t.timestamp);
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
  }
  return dayMap;
}

// ── computeMoisCouverts ───────────────────────────────────────────────────────
// Nombre de mois couverts entre deux timestamps (inclusif, même formule que oi-capital.js).

function computeMoisCouverts(ts_debut, ts_fin) {
  if (!ts_debut || !ts_fin) return 0;
  const d1 = new Date(ts_debut);
  const d2 = new Date(ts_fin);
  return (d2.getUTCFullYear() - d1.getUTCFullYear()) * 12
       + (d2.getUTCMonth()    - d1.getUTCMonth())
       + 1;
}

// ── computeActiveDayRate ──────────────────────────────────────────────────────
// Taux de jours actifs = nb_jours_actifs / nb_jours_periode.

function computeActiveDayRate(nb_jours_actifs, nb_jours_periode) {
  if (nb_jours_periode <= 0) return 0;
  return nb_jours_actifs / nb_jours_periode;
}

// ── computeBurstRatio ─────────────────────────────────────────────────────────
// Proportion d'ordres dans les 20% de jours actifs les plus denses.
// top_20pct = max(1, ceil(nb_jours_actifs × 0.20))

function computeBurstRatio(dayMap) {
  if (!dayMap || dayMap.size === 0) return 0;
  const counts    = [...dayMap.values()].sort((a, b) => b - a);
  const top_20pct = Math.max(1, Math.ceil(counts.length * 0.20));
  const top_sum   = counts.slice(0, top_20pct).reduce((s, v) => s + v, 0);
  const total     = counts.reduce((s, v) => s + v, 0);
  return total > 0 ? top_sum / total : 0;
}

// ── computeGaps ───────────────────────────────────────────────────────────────
// Intervalles entre jours actifs consécutifs (jours calendaires UTC).
// Retourne median_gap, variance_gap (variance de population), max_gap.

function computeGaps(sortedDays) {
  if (!sortedDays || sortedDays.length < 2) {
    return { median_gap: 0, variance_gap: 0, max_gap: 0 };
  }
  const gaps = [];
  for (let i = 0; i < sortedDays.length - 1; i++) {
    const t1 = new Date(sortedDays[i]     + 'T00:00:00Z').getTime();
    const t2 = new Date(sortedDays[i + 1] + 'T00:00:00Z').getTime();
    gaps.push(Math.round((t2 - t1) / 86400000));
  }
  const sorted   = [...gaps].sort((a, b) => a - b);
  const mid      = Math.floor(sorted.length / 2);
  const median   = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
  const mean_gap = gaps.reduce((s, v) => s + v, 0) / gaps.length;
  const variance = gaps.reduce((s, v) => s + (v - mean_gap) ** 2, 0) / gaps.length;
  const max_gap  = sorted[sorted.length - 1];
  return {
    median_gap:   Math.round(median   * 100) / 100,
    variance_gap: Math.round(variance * 100) / 100,
    max_gap,
  };
}

// ── computePeriodicityScore ───────────────────────────────────────────────────
// Chi2 sur la distribution hebdomadaire des ordres (6 degrés de liberté).
// getUTCDay() → 0=dimanche … 6=samedi (7 buckets stables).
// Non utilisé pour la classification si ordres_filled < CHI2_MIN_ORDRES (§3).

function computePeriodicityScore(trades) {
  const n_par_jour = new Array(7).fill(0);
  let total = 0;
  for (const t of trades) {
    if (t.timestamp == null) continue;
    n_par_jour[new Date(t.timestamp).getUTCDay()]++;
    total++;
  }
  if (total === 0) return 0;
  const n_attendu = total / 7;
  return Math.round(
    n_par_jour.reduce((s, n) => s + (n - n_attendu) ** 2 / n_attendu, 0) * 100
  ) / 100;
}

// ── computeCvDaily ────────────────────────────────────────────────────────────
// Coefficient de variation journalier = écart-type / moyenne sur jours actifs.

function computeCvDaily(dayMap) {
  if (!dayMap || dayMap.size === 0) return 0;
  const counts = [...dayMap.values()];
  const mean   = counts.reduce((s, v) => s + v, 0) / counts.length;
  if (mean === 0) return 0;
  const variance = counts.reduce((s, v) => s + (v - mean) ** 2, 0) / counts.length;
  return Math.round((Math.sqrt(variance) / mean) * 100) / 100;
}

// ── computeWeeksCoveredWithOrders ─────────────────────────────────────────────
// Semaines ISO (lun–dim UTC) contenant au moins 1 ordre.
// Utilisé pour le modificateur de confiance Périodique (§5).

function computeWeeksCoveredWithOrders(trades) {
  const weekSet = new Set();
  for (const t of trades) {
    if (t.timestamp == null) continue;
    const d        = new Date(t.timestamp);
    const dow      = d.getUTCDay();                          // 0=dim, 1=lun …
    const daysBack = dow === 0 ? 6 : dow - 1;              // jours jusqu'au lundi
    const monday   = new Date(d.getTime() - daysBack * 86400000);
    weekSet.add(monday.toISOString().slice(0, 10));
  }
  return weekSet.size;
}

// ── computeConfidence ─────────────────────────────────────────────────────────
// Niveau de confiance selon §5 du document d'architecture.
//
// stats = { mois_couverts, nb_jours_actifs, ordres_filled }
// meta  = { zone_ambigue, etat, semaines_avec_ordres }

function computeConfidence(stats, meta = {}) {
  const { mois_couverts, nb_jours_actifs, ordres_filled } = stats;
  const { zone_ambigue = false, etat = '', semaines_avec_ordres = 0 } = meta;

  // Garde Indisponible (§5 — condition OR)
  if (
    mois_couverts   < SEUILS.MIN_MOIS         ||
    nb_jours_actifs < SEUILS.MIN_JOURS_ACTIFS ||
    ordres_filled   < SEUILS.MIN_ORDRES_FILLED
  ) return 'Indisponible';

  // Niveau de base
  let niveau;
  if (
    mois_couverts   >= 6   &&
    nb_jours_actifs >= 30  &&
    ordres_filled   >= 100
  ) {
    niveau = 'Élevé';
  } else if (
    mois_couverts   === 3  ||
    nb_jours_actifs < 10   ||
    ordres_filled   < 50
  ) {
    niveau = 'Faible';
  } else {
    niveau = 'Moyen';
  }

  // Modificateur Périodique : < 6 semaines avec ordres → −1 niveau
  if (etat === 'Périodique' && semaines_avec_ordres < 6) {
    if      (niveau === 'Élevé') niveau = 'Moyen';
    else if (niveau === 'Moyen') niveau = 'Faible';
  }

  // Modificateur zone ambiguë → −1 niveau
  if (zone_ambigue) {
    if      (niveau === 'Élevé') niveau = 'Moyen';
    else if (niveau === 'Moyen') niveau = 'Faible';
  }

  return niveau;
}

// ── buildNote ─────────────────────────────────────────────────────────────────
// Restitution française — respecte E1–E5 et L1–L6 (doctrine OI V1) :
// uniquement des faits observables chiffrés, aucun jugement, aucune intention.
//
// metriques = { active_day_rate, burst_ratio, periodicity_score,
//               nb_jours_actifs, nb_jours_periode, max_gap }
// periode   = { mois_couverts }
// meta      = { zone_ambigue, nb_ordres_max_jour }

function buildNote(etat, confiance, metriques, periode, meta = {}) {
  const {
    active_day_rate, burst_ratio, periodicity_score,
    nb_jours_actifs, nb_jours_periode, max_gap,
  } = metriques;
  const { mois_couverts }                       = periode;
  const { zone_ambigue = false, nb_ordres_max_jour = 0 } = meta;

  if (etat === 'Indisponible') {
    return `Période de ${mois_couverts} mois et ${nb_jours_actifs} jour(s) actif(s) — `
      + `Dimension Cadence non calculable (données insuffisantes : confiance Indisponible).`;
  }

  // Mention break long (§6 — décision Q2)
  let break_mention = '';
  if (max_gap > SEUILS.BREAK_LONG_SEUIL) {
    break_mention = `Un arrêt d'activité de ${max_gap} jours a été détecté sur la période. `
      + `Les métriques sont calculées sur l'ensemble de la période sans segmentation. `;
  }

  // Mention densité élevée (§9 — CL4)
  let bot_mention = '';
  if (nb_ordres_max_jour > SEUILS.BOT_DENSITY_SEUIL) {
    bot_mention = ` Certains jours présentent une densité d'ordres élevée `
      + `(> ${SEUILS.BOT_DENSITY_SEUIL} ordres). `
      + `Les métriques de Cadence intègrent ces jours sans distinction d'origine.`;
  }

  const ratepct  = `${Math.round(active_day_rate * 100)}%`;
  const burstpct = `${Math.round(burst_ratio * 100)}%`;
  const top_n    = Math.max(1, Math.ceil(nb_jours_actifs * 0.20));

  let corps;

  if (etat === 'Continue') {
    corps = `L'activité est distribuée sur ${ratepct} des jours de la période `
      + `(${nb_jours_actifs} jours actifs sur ${nb_jours_periode}). `
      + `Aucune concentration extrême détectée — `
      + `style Cadence : Continue (confiance : ${confiance}).`;

  } else if (etat === 'Périodique') {
    const score_str = String(Math.round(periodicity_score * 10) / 10);
    corps = `L'activité présente une régularité hebdomadaire détectable : `
      + `certains jours de la semaine concentrent significativement plus d'ordres que les autres `
      + `(score : ${score_str}). `
      + `${nb_jours_actifs} jours actifs sur ${nb_jours_periode} — `
      + `style Cadence : Périodique (confiance : ${confiance}).`;

  } else if (etat === 'Burst') {
    if (zone_ambigue) {
      corps = `L'activité est présente sur ${ratepct} des jours `
        + `(${nb_jours_actifs} jours actifs sur ${nb_jours_periode}). `
        + `Les signaux de concentration (ratio : ${burstpct}) ne permettent pas de conclure nettement — `
        + `présomption Burst (confiance : ${confiance}).`;
    } else {
      corps = `L'activité est présente sur ${ratepct} des jours de la période `
        + `(${nb_jours_actifs} jours actifs sur ${nb_jours_periode}). `
        + `La majorité des ordres (${burstpct}) se concentre sur les ${top_n} jour(s) les plus actifs — `
        + `style Cadence : Burst (confiance : ${confiance}).`;
    }

  } else if (etat === 'Irrégulier') {
    corps = `L'activité est présente sur ${ratepct} des jours `
      + `(${nb_jours_actifs} jours actifs sur ${nb_jours_periode}). `
      + `Les signaux ne permettent pas d'identifier un profil de cadence net — `
      + `style Cadence : Irrégulier (confiance : ${confiance}).`;

  } else {
    corps = `Style Cadence : ${etat} (confiance : ${confiance}).`;
  }

  return break_mention + corps + bot_mention;
}

// ── computeCadence ────────────────────────────────────────────────────────────
// Orchestrateur principal — export unique du module.
//
// trades : tableau de trades canoniques FILLED (sortie de mapOrderRows)
// Retourne l'objet JSON structuré défini en §7 du document d'architecture.

function computeCadence(trades) {
  // Guard : entrée vide ou invalide
  if (!trades || trades.length === 0) {
    return {
      dimension: 'Cadence',
      etat:      'Indisponible',
      confiance: 'Indisponible',
      metriques: {
        active_day_rate:   0,
        burst_ratio:       0,
        median_gap:        0,
        variance_gap:      0,
        periodicity_score: 0,
        cv_daily:          0,
        nb_jours_actifs:   0,
        nb_jours_periode:  0,
        max_gap:           0,
      },
      periode: { debut: null, fin: null, mois_couverts: 0, ordres_filled: 0 },
      note: 'Aucun ordre exécuté fourni — Dimension Cadence non calculable.',
    };
  }

  // ── Timestamps valides ───────────────────────────────────────────────────────
  const timestamps    = trades.map(t => t.timestamp).filter(ts => ts != null).sort((a, b) => a - b);
  const ordres_filled = timestamps.length;

  if (ordres_filled === 0) {
    return {
      dimension: 'Cadence',
      etat:      'Indisponible',
      confiance: 'Indisponible',
      metriques: {
        active_day_rate:   0,
        burst_ratio:       0,
        median_gap:        0,
        variance_gap:      0,
        periodicity_score: 0,
        cv_daily:          0,
        nb_jours_actifs:   0,
        nb_jours_periode:  0,
        max_gap:           0,
      },
      periode: { debut: null, fin: null, mois_couverts: 0, ordres_filled: 0 },
      note: 'Aucun timestamp valide fourni — Dimension Cadence non calculable.',
    };
  }

  const ts_debut = timestamps[0];
  const ts_fin   = timestamps[timestamps.length - 1];
  const debut    = toUTCDay(ts_debut);
  const fin      = toUTCDay(ts_fin);

  // ── Période ──────────────────────────────────────────────────────────────────
  const mois_couverts = computeMoisCouverts(ts_debut, ts_fin);

  // ── Distribution journalière ──────────────────────────────────────────────────
  const dayMap           = buildDayMap(trades);
  const sortedDays       = [...dayMap.keys()].sort();
  const nb_jours_actifs  = sortedDays.length;

  // nb_jours_periode : étendue calendaire du premier au dernier jour (inclusif)
  const t_first          = new Date(debut + 'T00:00:00Z').getTime();
  const t_last           = new Date(fin   + 'T00:00:00Z').getTime();
  const nb_jours_periode = Math.round((t_last - t_first) / 86400000) + 1;

  // ── Métriques ─────────────────────────────────────────────────────────────────
  const active_day_rate = Math.round(
    computeActiveDayRate(nb_jours_actifs, nb_jours_periode) * 10000
  ) / 10000;

  const burst_ratio = Math.round(computeBurstRatio(dayMap) * 10000) / 10000;

  const { median_gap, variance_gap, max_gap } = computeGaps(sortedDays);

  const periodicity_score    = computePeriodicityScore(trades);
  const cv_daily             = computeCvDaily(dayMap);
  const chi2_valide          = ordres_filled >= SEUILS.CHI2_MIN_ORDRES;
  const nb_ordres_max_jour   = Math.max(...dayMap.values());
  const semaines_avec_ordres = computeWeeksCoveredWithOrders(trades);

  // ── Classification §4 ─────────────────────────────────────────────────────────
  let etat;
  let zone_ambigue = false;

  if (
    mois_couverts   < SEUILS.MIN_MOIS          ||
    ordres_filled   < SEUILS.MIN_ORDRES_FILLED  ||
    nb_jours_actifs < SEUILS.MIN_JOURS_ACTIFS
  ) {
    etat = 'Indisponible';

  } else if (
    active_day_rate >= SEUILS.ACTIVE_DAY_RATE_CONTINUE &&
    burst_ratio     <= SEUILS.BURST_RATIO_CONTINUE
  ) {
    etat = 'Continue';

  } else if (
    chi2_valide                                         &&
    periodicity_score > SEUILS.PERIODICITY_SCORE_SEUIL &&
    median_gap        <= SEUILS.MEDIAN_GAP_PERIODIQUE   &&
    variance_gap      <= median_gap
  ) {
    etat = 'Périodique';

  } else if (
    burst_ratio     >= SEUILS.BURST_RATIO_BURST ||
    active_day_rate <= SEUILS.ACTIVE_DAY_RATE_BURST
  ) {
    etat = 'Burst';

  } else {
    etat         = 'Irrégulier';
    zone_ambigue = true;
  }

  // ── Confiance §5 ──────────────────────────────────────────────────────────────
  const confiance = computeConfidence(
    { mois_couverts, nb_jours_actifs, ordres_filled },
    { zone_ambigue, etat, semaines_avec_ordres }
  );

  // ── Note de restitution §8 ────────────────────────────────────────────────────
  const note = buildNote(
    etat,
    confiance,
    { active_day_rate, burst_ratio, periodicity_score, nb_jours_actifs, nb_jours_periode, max_gap },
    { mois_couverts },
    { zone_ambigue, nb_ordres_max_jour }
  );

  // ── Sortie §7 ─────────────────────────────────────────────────────────────────
  return {
    dimension: 'Cadence',
    etat,
    confiance,
    metriques: {
      active_day_rate,
      burst_ratio,
      median_gap,
      variance_gap,
      periodicity_score,
      cv_daily,
      nb_jours_actifs,
      nb_jours_periode,
      max_gap,
    },
    periode: {
      debut,
      fin,
      mois_couverts,
      ordres_filled,
    },
    note,
  };
}

export { computeCadence };
