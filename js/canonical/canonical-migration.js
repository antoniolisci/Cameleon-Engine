// canonical-migration.js — Migration idempotente vers la couche canonique V1
// Migre les 10 entrées mémorielles ACF V1 Phase A depuis l'ancienne couche (storage.js)
// vers la couche de persistance canonique (canonical-store.js).
// LOT-P1-2.2 §5 — LOT-P1-2.4 §4 — LOT-P1-2.1 §6 (R1, R3, R4)
// Dépendances : storage.js · canonical-store.js · canonical-model.js

import { exportOperatorData, readEntryUpdatedAt, resolveKey, KEYS } from '../storage.js';
import { writeMigratedTrace } from './canonical-store.js';
import { CANONICAL_FAMILIES, DATE_UNAVAILABLE, DATE_NON_EXPLOITABLE } from './canonical-model.js';

// ─── Clé d'idempotence ────────────────────────────────────────────────────────

// Clé de base du drapeau de migration (namespacing UUID via resolveKey — ML-5)
const _MIGRATION_FLAG_BASE = 'CE_canonical_migration_v1_done';

function _isMigrationDone() {
  try {
    return localStorage.getItem(resolveKey(_MIGRATION_FLAG_BASE)) === '1';
  } catch {
    return false;
  }
}

function _setMigrationDone() {
  try {
    localStorage.setItem(resolveKey(_MIGRATION_FLAG_BASE), '1');
  } catch {
    // Non bloquant — la migration sera relancée à la prochaine initialisation.
  }
}

// ─── Migration d'une trace ────────────────────────────────────────────────────

// Écrit une trace migrée et pousse l'erreur dans le tableau si l'écriture échoue.
// Retourne true si l'écriture a réussi, false sinon.
function _migrate(errors, entry) {
  const { written, errors: writeErrors } = writeMigratedTrace(entry);
  if (!written) {
    for (const e of writeErrors) errors.push(e);
  }
  return written;
}

// ─── Interface de migration ───────────────────────────────────────────────────

/**
 * Migre idempotentement les 10 entrées mémorielles ACF V1 Phase A vers la couche canonique.
 *
 * Idempotence : si le drapeau _MIGRATION_FLAG est présent, la fonction retourne immédiatement.
 * Le drapeau n'est positionné que si la migration se termine sans aucune erreur.
 * En cas d'erreur partielle, la migration peut être relancée (les traces déjà écrites
 * produiront des doublons — à corriger via reconcileIndex si nécessaire).
 *
 * Entrées couvertes (LOT-P1-2.4 §4) :
 *   SY1 — Sessions comportementales · Mémoire comportementale (R1) ·
 *          Niveau de garde comportemental (R3) · Paramètres d'ordres récents (R4) ·
 *          Mémoire opérateur · Historique des analyses opérateur
 *   SY3 — Journal des décisions moteur · Sauvegardes moteur
 *   S1  — Registre des importations
 *   S2  — Portefeuille
 *
 * Préservation (D9 — LOT-P1-2) :
 *   Les clés d'origine (storage.js) ne sont jamais supprimées par cette fonction.
 *   La suppression est une action opérateur manuelle après validation terrain ML-6 PASS global.
 *
 * Divergence D-01 :
 *   La clé réelle du Journal des décisions moteur est CE_journal_entries_v1 (KEYS.journalEntries).
 *   Le plan [PROP] indiquait incorrectement CE_journal_decisions_v1 — corrigé ici.
 *
 * D-ML4-01 :
 *   readEntryUpdatedAt() est utilisé pour récupérer la date d'origine des entrées enveloppées.
 *
 * D-ML4-02 :
 *   behaviorMemory est un tableau brut sans enveloppe _wrap. La date est DATE_UNAVAILABLE (R1).
 *   L'existence est vérifiée via d.behaviorMemory.length > 0.
 *
 * D-ML4-03 :
 *   operatorMemory.get() peut retourner null si le champ data est absent de l'enveloppe.
 *   L'entrée est ignorée si d.operatorMemory === null.
 *
 * @returns {{ migrated: boolean, skipped: boolean, errors: string[] }}
 *   migrated : true si la migration a été exécutée et complète (0 erreur)
 *   skipped  : true si la migration avait déjà été effectuée
 *   errors   : liste des erreurs d'écriture (vide si migrated ou skipped)
 */
export function runCanonicalMigration() {
  // Idempotence — ne pas réexécuter si déjà complète.
  if (_isMigrationDone()) {
    return { migrated: false, skipped: true, errors: [] };
  }

  // Lecture des données d'origine via l'interface de portabilité de storage.js.
  const exported = exportOperatorData();
  if (!exported || !exported.data) {
    return { migrated: false, skipped: false, errors: ['runCanonicalMigration : identité opérateur absente — migration impossible'] };
  }

  const d = exported.data;
  const errors = [];

  // ── Entrée 1 — Sessions comportementales (SY1) ───────────────────────────
  // Source : Module d'analyse comportementale (LOT-P1-2.4 §4.1)
  // Date   : updatedAt de l'enveloppe (ISO 8601 UTC) — null si absent → ignorée
  // D-ML4-01 : readEntryUpdatedAt utilisé pour la date d'origine.
  {
    const date = readEntryUpdatedAt(KEYS.behaviorSessions);
    if (date !== null) {
      _migrate(errors, {
        famille:  CANONICAL_FAMILIES.SY1,
        source:   "Module d'analyse comportementale",
        date,
        session:  null,
        contexte: null,
        valeur:   d.behaviorSessions,
      });
    }
  }

  // ── Entrée 2 — Mémoire comportementale (SY1, R1) ─────────────────────────
  // Source : Module d'analyse comportementale (LOT-P1-2.4 §4.1)
  // Date   : DATE_UNAVAILABLE (R1 — LOT-P1-2.1 §6.1 · LOT-P1-2.4 §5.1)
  // D-ML4-02 : tableau brut sans enveloppe _wrap — existence via .length
  if (Array.isArray(d.behaviorMemory) && d.behaviorMemory.length > 0) {
    _migrate(errors, {
      famille:  CANONICAL_FAMILIES.SY1,
      source:   "Module d'analyse comportementale",
      date:     DATE_UNAVAILABLE,
      session:  null,
      contexte: null,
      valeur:   d.behaviorMemory,
    });
  }

  // ── Entrée 3 — Niveau de garde comportemental (SY1, R3) ──────────────────
  // Source : Module d'analyse comportementale (LOT-P1-2.4 §4.1)
  // Date   : DATE_UNAVAILABLE (R3 — LOT-P1-2.1 §6.2 · LOT-P1-2.4 §5.2)
  if (d.guardLevel !== null && d.guardLevel !== undefined) {
    _migrate(errors, {
      famille:  CANONICAL_FAMILIES.SY1,
      source:   "Module d'analyse comportementale",
      date:     DATE_UNAVAILABLE,
      session:  null,
      contexte: null,
      valeur:   d.guardLevel,
    });
  }

  // ── Entrée 4 — Paramètres d'ordres récents (SY1, R4) ─────────────────────
  // Source : Module d'enregistrement des ordres récents (LOT-P1-2.4 §4.1 · §5.3 · Amendement R4)
  // Date   : DATE_NON_EXPLOITABLE (R4 — LOT-P1-2.1 §6.4 · LOT-P1-2.4 §5.3)
  if (d.orderStrategyProfile !== null && d.orderStrategyProfile !== undefined) {
    _migrate(errors, {
      famille:  CANONICAL_FAMILIES.SY1,
      source:   "Module d'enregistrement des ordres récents",
      date:     DATE_NON_EXPLOITABLE,
      session:  null,
      contexte: null,
      valeur:   d.orderStrategyProfile,
    });
  }

  // ── Entrée 5 — Mémoire opérateur (SY1) ───────────────────────────────────
  // Source : Module OI V1 (LOT-P1-2.4 §4.1)
  // Date   : updatedAt de l'enveloppe (ISO 8601 UTC) — null si absent → ignorée
  // D-ML4-03 : operatorMemory.get() peut retourner null
  {
    const date = readEntryUpdatedAt(KEYS.operatorMemory);
    if (date !== null && d.operatorMemory !== null && d.operatorMemory !== undefined) {
      _migrate(errors, {
        famille:  CANONICAL_FAMILIES.SY1,
        source:   'Module OI V1',
        date,
        session:  null,
        contexte: null,
        valeur:   d.operatorMemory,
      });
    }
  }

  // ── Entrée 6 — Historique des analyses opérateur (SY1) ───────────────────
  // Source : Module OI V1 (LOT-P1-2.4 §4.1)
  // Date   : updatedAt de l'enveloppe (ISO 8601 UTC) — null si absent → ignorée
  {
    const date = readEntryUpdatedAt(KEYS.oiHistory);
    if (date !== null) {
      _migrate(errors, {
        famille:  CANONICAL_FAMILIES.SY1,
        source:   'Module OI V1',
        date,
        session:  null,
        contexte: null,
        valeur:   d.oiHistory,
      });
    }
  }

  // ── Entrée 7 — Journal des décisions moteur (SY3) ────────────────────────
  // Source : Moteur décisionnel (LOT-P1-2.4 §4.2)
  // Date   : updatedAt de l'enveloppe (ISO 8601 UTC) — null si absent → ignorée
  // D-01 : clé réelle = CE_journal_entries_v1 (KEYS.journalEntries)
  {
    const date = readEntryUpdatedAt(KEYS.journalEntries);
    if (date !== null) {
      _migrate(errors, {
        famille:  CANONICAL_FAMILIES.SY3,
        source:   'Moteur décisionnel',
        date,
        session:  null,
        contexte: null,
        valeur:   d.journalEntries,
      });
    }
  }

  // ── Entrée 8 — Sauvegardes moteur (SY3) ──────────────────────────────────
  // Source : Moteur décisionnel (LOT-P1-2.4 §4.2)
  // Date   : updatedAt de l'enveloppe (ISO 8601 UTC) — null si absent → ignorée
  {
    const date = readEntryUpdatedAt(KEYS.backups);
    if (date !== null) {
      _migrate(errors, {
        famille:  CANONICAL_FAMILIES.SY3,
        source:   'Moteur décisionnel',
        date,
        session:  null,
        contexte: null,
        valeur:   d.backups,
      });
    }
  }

  // ── Entrée 9 — Registre des importations (S1) ─────────────────────────────
  // Source : Module d'import (LOT-P1-2.4 §4.3)
  // Date   : updatedAt de l'enveloppe (ISO 8601 UTC) — null si absent → ignorée
  {
    const date = readEntryUpdatedAt(KEYS.importRegistry);
    if (date !== null) {
      _migrate(errors, {
        famille:  CANONICAL_FAMILIES.S1,
        source:   "Module d'import",
        date,
        session:  null,
        contexte: null,
        valeur:   d.importRegistry,
      });
    }
  }

  // ── Entrée 10 — Portefeuille (S2) ─────────────────────────────────────────
  // Source : Module portefeuille (LOT-P1-2.4 §4.4)
  // Date   : updatedAt de l'enveloppe (ISO 8601 UTC) — null si absent → ignorée
  {
    const date = readEntryUpdatedAt(KEYS.portfolio);
    if (date !== null) {
      _migrate(errors, {
        famille:  CANONICAL_FAMILIES.S2,
        source:   'Module portefeuille',
        date,
        session:  null,
        contexte: null,
        valeur:   d.portfolio,
      });
    }
  }

  // ── Finalisation ─────────────────────────────────────────────────────────
  // Le drapeau n'est positionné que si aucune erreur n'est survenue.
  // Une migration partielle reste relançable.
  if (errors.length === 0) {
    _setMigrationDone();
    return { migrated: true, skipped: false, errors: [] };
  }

  return { migrated: false, skipped: false, errors };
}
