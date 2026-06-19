// Calcul incrémental de la mémoire opérateur après chaque session.
//
// Principe :
//   - Aucun effet de bord — ne lit pas et n'écrit pas localStorage
//   - Ne mute jamais l'objet memory d'entrée — retourne un nouvel objet
//   - Toutes les couches sont reconstruites par spread explicite
//
// Entrées :
//   memory        : objet issu de memoryRepo.getMemory()
//   sessionResult : { patterns[], metrics{}, scoreData{}, coaching{} }
//
// Sortie : nouvel objet memory mis à jour

const PROFILE_HISTORY_CAP = 200;
const WINDOW_SIZE          = 10;

const ALL_PATTERN_KEYS = [
  'overtrading',
  'revenge_trading',
  'rapid_reentry',
  'size_inconsistency',
  'loss_chasing',
];

// ── Mise à jour principale ────────────────────────────────────

function updateMemory(memory, sessionResult) {
  const { patterns = [], scoreData = null } = sessionResult;

  // Sécurité : session invalide (pas de score) → mémoire inchangée
  if (!scoreData || typeof scoreData.score !== 'number') return memory;

  const score   = scoreData.score;
  // scoreData.profile est un objet { key, label, min, color } retourné par scoring.js,
  // jamais une string — on extrait le label lisible.
  const profile = scoreData.profile?.label ?? 'Agressif';

  // Clés des patterns actifs dans cette session
  // patterns.js produit { type: string } — fallback sur .key pour robustesse
  const activeKeys = patterns
    .map(p => p.type ?? p.key)
    .filter(k => ALL_PATTERN_KEYS.includes(k));

  // ── 1. allTime — mise à jour fréquences et historique profil ─
  const prevFreq = memory.allTime.patternFrequency;
  const newFreq  = { ...prevFreq };
  for (const key of activeKeys) {
    newFreq[key] = (newFreq[key] ?? 0) + 1;
  }

  const newProfileHistory = [
    ...memory.allTime.profileHistory,
    profile,
  ].slice(-PROFILE_HISTORY_CAP);

  const newAllTime = {
    scoreSum:         memory.allTime.scoreSum + score,
    scoreSessions:    memory.allTime.scoreSessions + 1,
    patternFrequency: newFreq,
    profileHistory:   newProfileHistory,
  };

  // ── 2. window10 — FIFO 10 entrées ────────────────────────────
  const windowEntry = {
    score,
    profile,
    patterns:  activeKeys,
    createdAt: Date.now(),
  };
  const newWindow10 = [windowEntry, ...memory.window10].slice(0, WINDOW_SIZE);

  // ── 3. sessionCount ───────────────────────────────────────────
  const newSessionCount = memory.sessionCount + 1;

  // ── 4. Certifications ─────────────────────────────────────────
  // consistent_discipline : 10 sessions consécutives toutes ≥ 80 dans window10.
  // Accordée une seule fois — non révoquée si le score chute ensuite.
  const newCertifications = [...memory.certifications];
  const alreadyHasDiscipline = newCertifications.some(c => c.key === 'consistent_discipline');
  if (!alreadyHasDiscipline && newWindow10.length === WINDOW_SIZE) {
    const allAbove80 = newWindow10.every(w => w.score >= 80);
    if (allAbove80) {
      newCertifications.push({ key: 'consistent_discipline', awardedAt: Date.now() });
    }
  }

  return {
    sessionCount:   newSessionCount,
    allTime:        newAllTime,
    window10:       newWindow10,
    certifications: newCertifications,
  };
}

export { updateMemory };
