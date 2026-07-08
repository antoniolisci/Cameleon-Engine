// canonical-store.js — Interface d'écriture contrôlée V1
// Interface d'écriture unique de la couche canonique.
// Toute trace mémorielle entre dans la couche exclusivement par cette interface.
// LOT-P1-2.2 §4.2 — LOT-P1-2.1 §8.2 (RE1, RE2, RE3)
// Dépendance : canonical-model.js · canonical-index.js

import { validateTrace } from './canonical-model.js';
import { initCanonicalIndex, updateIndex } from './canonical-index.js';

// Clé de stockage du corpus canonique [PROP — namespacing UUID appliqué en ML-5]
const _CORPUS_KEY = 'CE_canonical_corpus_v1';

// ─── Identifiant de trace ────────────────────────────────────────────────────
// Identifiant opaque généré par la couche. Le module appelant ne le fournit pas.
// Patron identique à storage.js (_generateUUID) pour cohérence codebase.

function _generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC 4122 v4.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ─── Corpus — lecture / écriture ─────────────────────────────────────────────

function _readCorpus() {
  try {
    const raw = localStorage.getItem(_CORPUS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function _writeCorpus(corpus) {
  try {
    localStorage.setItem(_CORPUS_KEY, JSON.stringify(corpus));
    return true;
  } catch {
    return false;
  }
}

// ─── Initialisation ───────────────────────────────────────────────────────────

/**
 * Initialise la couche canonique.
 * Doit être appelé à l'initialisation de l'application,
 * après runUUIDMigration() (R-T7 du plan d'implémentation LOT-P1-2).
 * Intégration avec storage.js et state.js réalisée dans ML-5.
 */
export function initCanonicalStore() {
  initCanonicalIndex();
}

// ─── Interface d'écriture ─────────────────────────────────────────────────────

/**
 * Écrit une trace mémorielle dans la couche canonique.
 *
 * La date est produite par la couche (ISO 8601 UTC) — jamais fournie par le
 * module appelant (LOT-P1-2.4, doctrine de provenance).
 * L'identifiant est généré par la couche — opaque pour le module appelant.
 *
 * RE1 — Atomicité de l'écriture (LOT-P1-2.1 §8.2) :
 *   La trace est écrite dans son intégralité ou n'est pas écrite.
 *   La validation (RV1-RV4) précède toute persistance.
 *   Rejet explicite si la validation échoue — aucun champ complété silencieusement.
 *
 * RE2 — Ordre d'écriture (LOT-P1-2.1 §8.2) :
 *   La trace est écrite dans le corpus avant la mise à jour de l'index.
 *   En cas d'interruption : trace présente, index potentiellement en retard.
 *
 * RE3 — Immutabilité (LOT-P1-2.1 §8.2) :
 *   Une trace écrite ne peut pas être modifiée.
 *   Le corpus est en ajout uniquement — aucune mise à jour.
 *
 * @param {{ famille: string, source: string, session?: string|null, contexte?: any, valeur: any }} entry
 * @returns {{ written: boolean, errors: string[] }}
 */
export function writeCanonicalTrace(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return { written: false, errors: ['writeCanonicalTrace : entrée invalide'] };
  }

  // La couche produit la date et l'identifiant (LOT-P1-2.4)
  const trace = {
    id:       _generateId(),
    famille:  entry.famille,
    source:   entry.source,
    date:     new Date().toISOString(),
    session:  entry.session !== undefined ? entry.session : null,
    contexte: entry.contexte !== undefined ? entry.contexte : null,
    valeur:   entry.valeur,
  };

  // RE1 — Validation RV1-RV4 avant toute persistance
  const { valid, errors } = validateTrace(trace);
  if (!valid) {
    return { written: false, errors };
  }

  // RE2 — La trace est écrite dans le corpus avant la mise à jour de l'index
  const corpus = _readCorpus();
  const persisted = _writeCorpus([...corpus, trace]);
  if (!persisted) {
    return { written: false, errors: ['RE1 : écriture dans le corpus impossible (stockage)'] };
  }

  // RE2 — Mise à jour de l'index après écriture de la trace
  // (indexation triple-axe complétée dans ML-3)
  updateIndex(trace);

  return { written: true, errors: [] };
}

// ─── Interface de migration ───────────────────────────────────────────────────

/**
 * Écrit une trace migrée dans la couche canonique.
 * Réservée à canonical-migration.js — ne doit pas être utilisée pour les nouvelles écritures.
 *
 * Contrairement à writeCanonicalTrace, la date est fournie par le module appelant
 * (état formalisé R1/R3/R4 ou horodatage ISO 8601 UTC d'origine).
 * La couche valide RV3 sur la date fournie et rejette tout ce qui ne se conforme pas.
 * Un champ migratedAt (ISO 8601 UTC) est ajouté pour traçabilité.
 *
 * RE1 — Atomicité de l'écriture : validation RV1-RV4 avant toute persistance.
 * RE2 — Ordre d'écriture : corpus écrit avant mise à jour de l'index.
 * RE3 — Immutabilité : ajout uniquement, aucune modification.
 *
 * @param {{ famille: string, source: string, session?: string|null, contexte?: any, valeur: any, date: string }} entry
 * @returns {{ written: boolean, errors: string[] }}
 */
export function writeMigratedTrace(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return { written: false, errors: ['writeMigratedTrace : entrée invalide'] };
  }

  // La date est fournie par le module appelant (état formalisé ou horodatage d'origine)
  const trace = {
    id:         _generateId(),
    famille:    entry.famille,
    source:     entry.source,
    date:       entry.date,
    session:    entry.session !== undefined ? entry.session : null,
    contexte:   entry.contexte !== undefined ? entry.contexte : null,
    valeur:     entry.valeur,
    migratedAt: new Date().toISOString(),
  };

  // RE1 — Validation RV1-RV4 avant toute persistance (inclut RV3 sur date fournie)
  const { valid, errors } = validateTrace(trace);
  if (!valid) {
    return { written: false, errors };
  }

  // RE2 — La trace est écrite dans le corpus avant la mise à jour de l'index
  const corpus = _readCorpus();
  const persisted = _writeCorpus([...corpus, trace]);
  if (!persisted) {
    return { written: false, errors: ['RE1 : écriture dans le corpus impossible (stockage)'] };
  }

  // RE2 — Mise à jour de l'index après écriture de la trace
  updateIndex(trace);

  return { written: true, errors: [] };
}
