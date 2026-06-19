// Persistance de la mémoire opérateur long-terme.
// Stockage : CE_operator_memory_v1 (via storage.js → operatorMemory)
//
// Structure canonique (cf. initMemory) :
//   sessionCount      : number — total sessions analysées
//   allTime.scoreSum  : number — somme des scores (pour moyenne)
//   allTime.scoreSessions : number — sessions avec score valide
//   allTime.patternFrequency : { overtrading, revenge_trading, ... } — compteurs
//   allTime.profileHistory   : string[] — historique profils, cap 200
//   window10          : SessionEntry[] — 10 dernières sessions (FIFO)
//   certifications    : { key: string, awardedAt: number }[]

import { operatorMemory } from '../../storage.js';

// ── Structure initiale ────────────────────────────────────────

function initMemory() {
  return {
    sessionCount: 0,
    allTime: {
      scoreSum:         0,
      scoreSessions:    0,
      patternFrequency: {
        overtrading:        0,
        revenge_trading:    0,
        rapid_reentry:      0,
        size_inconsistency: 0,
        loss_chasing:       0,
      },
      profileHistory: [],
    },
    window10:             [],
    certifications:       [],
    importedFingerprints: [],
  };
}

// ── Guard intégrité ───────────────────────────────────────────
// Vérifie que l'objet lu depuis localStorage a la forme minimale attendue.
// En cas de corruption partielle → on repart d'une structure vide.

function _isValidMemory(m) {
  return (
    m !== null &&
    typeof m === 'object' &&
    typeof m.sessionCount === 'number' &&
    typeof m.allTime === 'object' &&
    m.allTime !== null &&
    typeof m.allTime.scoreSum === 'number' &&
    typeof m.allTime.scoreSessions === 'number' &&
    typeof m.allTime.patternFrequency === 'object' &&
    m.allTime.patternFrequency !== null &&
    Array.isArray(m.allTime.profileHistory) &&
    Array.isArray(m.window10) &&
    Array.isArray(m.certifications)
  );
}

// ── API publique ──────────────────────────────────────────────

// Retourne toujours un objet valide — jamais null.
// Si la donnée stockée est absente ou corrompue → initMemory().
// Normalisation backward-compat : les mémoires antérieures à V1.1 n'ont pas
// importedFingerprints — on l'ajoute à la volée sans réécriture en localStorage.
function getMemory() {
  const stored = operatorMemory.get();
  if (_isValidMemory(stored)) {
    if (!Array.isArray(stored.importedFingerprints)) {
      return { ...stored, importedFingerprints: [] };
    }
    return stored;
  }
  return initMemory();
}

// Persiste la mémoire mise à jour.
function saveMemory(memory) {
  return operatorMemory.set(memory);
}

// Supprime la mémoire (réinitialisation complète).
// Le prochain appel à getMemory() retournera initMemory().
function resetMemory() {
  return operatorMemory.clear();
}

export { initMemory, getMemory, saveMemory, resetMemory };
