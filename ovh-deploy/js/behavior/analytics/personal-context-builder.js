// Transformation de la mémoire opérateur en PersonalContext.
// Objet éphémère — calculé à la demande, jamais persisté.
//
// Retourne null si les données sont insuffisantes (< 3 sessions) ou absentes.
// Retourne un PersonalContext avec hasEnoughData:true sinon.
//
// PersonalContext est injecté comme paramètre optionnel dans scoring.js
// et coaching.js (étapes 5 et 6 du chantier Mémoire Opérateur V1).
//
// Structure retournée :
//   hasEnoughData       : true
//   sessionCount        : number
//   allTimeAvgScore     : number         — moyenne all-time des scores
//   dominantPatterns    : string[]       — patterns présents dans ≥ 30% des sessions
//   isRecurringPattern  : { [key]: bool }— true si pattern présent dans ≥ 25% des sessions
//   window10            : { avgScore, trend, profileDistribution } | null
//   certifications      : string[]       — clés des certifications obtenues

// ── Seuils ────────────────────────────────────────────────────

const MIN_SESSIONS         = 3;    // nb sessions minimum pour activer le contexte
const RECURRING_THRESHOLD  = 0.25; // 25% des sessions → pattern récurrent
const DOMINANT_THRESHOLD   = 0.30; // 30% des sessions → pattern dominant
const TREND_MIN_WINDOW     = 6;    // taille minimale window10 pour calculer une tendance
const TREND_DELTA          = 5;    // delta absolu minimum pour basculer de 'stable'

// ── Calcul principal ──────────────────────────────────────────

function buildPersonalContext(memory) {
  // Guards — données absentes ou insuffisantes
  if (memory === null || memory === undefined)                return null;
  if (typeof memory.sessionCount !== 'number')               return null;
  if (memory.sessionCount < MIN_SESSIONS)                    return null;
  if (!memory.allTime || memory.allTime.scoreSessions === 0) return null;

  const { allTime, window10, certifications, sessionCount } = memory;

  // ── All-time average score ─────────────────────────────────
  const allTimeAvgScore = allTime.scoreSum / allTime.scoreSessions;

  // ── Patterns — fréquences relatives ───────────────────────
  // Base de calcul : sessionCount (pas scoreSessions) — cohérence avec
  // le fait qu'un pattern absent d'une session ne génère pas d'entrée.
  const freq             = allTime.patternFrequency ?? {};
  const dominantPatterns = [];
  const isRecurringPattern = {};

  for (const [key, count] of Object.entries(freq)) {
    const ratio = typeof count === 'number' ? count / sessionCount : 0;
    isRecurringPattern[key] = ratio >= RECURRING_THRESHOLD;
    if (ratio >= DOMINANT_THRESHOLD) dominantPatterns.push(key);
  }

  // ── window10 — statistiques sur la fenêtre glissante ──────
  let window10Stats = null;
  if (Array.isArray(window10) && window10.length > 0) {
    const scores   = window10.map(w => w.score).filter(s => typeof s === 'number');
    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    // Tendance : compare la moitié récente vs la moitié ancienne
    // Nécessite au moins TREND_MIN_WINDOW (6) entrées pour être fiable.
    let trend = 'stable';
    if (window10.length >= TREND_MIN_WINDOW) {
      const half      = Math.floor(window10.length / 2);
      const recent    = window10.slice(0, half);      // plus récent en tête (FIFO)
      const older     = window10.slice(half);
      const avgRecent = recent.reduce((a, b) => a + (b.score ?? 0), 0) / recent.length;
      const avgOlder  = older.reduce((a, b)  => a + (b.score ?? 0), 0) / older.length;
      const delta     = avgRecent - avgOlder;
      if      (delta >=  TREND_DELTA) trend = 'improving';
      else if (delta <= -TREND_DELTA) trend = 'declining';
    }

    // Distribution des profils dans la fenêtre
    const profileDistribution = { Discipliné: 0, Réactif: 0, Impulsif: 0, Agressif: 0 };
    for (const w of window10) {
      if (w.profile && w.profile in profileDistribution) {
        profileDistribution[w.profile]++;
      }
    }

    window10Stats = { avgScore, trend, profileDistribution };
  }

  // ── Certifications — clés uniquement ──────────────────────
  const certificationKeys = Array.isArray(certifications)
    ? certifications.map(c => c.key).filter(Boolean)
    : [];

  return {
    hasEnoughData:       true,
    sessionCount,
    allTimeAvgScore,
    dominantPatterns,
    isRecurringPattern,
    window10:            window10Stats,
    certifications:      certificationKeys,
  };
}

export { buildPersonalContext };
