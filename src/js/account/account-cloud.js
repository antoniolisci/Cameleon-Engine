// account-cloud.js — Fonctions I/O cloud pures — LOT 3
// Caméléon Engine · Compte Utilisateur V1 · LOT 3
//
// Module pur : aucun événement, aucun état global, aucun effet de bord à l'import.
// Seul fichier autorisé à lire/écrire operator_data dans Supabase.
//
// API publique :
//   buildLocalPayload()               → object | null
//   detectConflict(serverUUID)        → { state, localPayload?, cloudPayload?, localEmpty? }
//   executeUpload(serverUUID)         → { ok, error }
//   applyCloudRestore(cloudPayload)   → { ok, errors }
//
// Invariant X = 2 :
//   executeUpload() est le seul point d'UPSERT vers operator_data.
//   detectConflict() = SELECT uniquement (Phase 1 — D-LOT3-CONFLICT-04).
//   applyCloudRestore() = localStorage uniquement, aucun UPSERT.

import { supabase }                                                from './account-config.js';
import { journalEntries, operatorMemory, oiHistory,
         portfolio, settings }                                     from '../storage.js';

// ── [TEMP DEBUG] _trace — à supprimer après diagnostic ───────────────────────
function _trace(msg) {
  try {
    const ts = new Date().toISOString().slice(11, 23);
    const entries = JSON.parse(localStorage.getItem('CE_debug_trace_v1') || '[]');
    entries.push(`${ts} ${msg}`);
    if (entries.length > 40) entries.splice(0, entries.length - 40);
    localStorage.setItem('CE_debug_trace_v1', JSON.stringify(entries));
  } catch {}
}

// ── buildLocalPayload() ──────────────────────────────────────────────────────
// Lit les 5 clés Groupe A depuis localStorage via les accesseurs storage.js.
// Exclut importedFingerprints de CE_operator_memory_v1 (D-LOT3-PAYLOAD-01).
// Retourne null si toutes les clés sont absentes → EMPTY_PAYLOAD.
// Ordre des clés stable — requis pour la comparaison JSON.stringify dans detectConflict.

export function buildLocalPayload() {
  const rawMemory = operatorMemory.get();
  let memoryClean = null;
  if (rawMemory !== null) {
    // D-LOT3-PAYLOAD-01 : importedFingerprints exclu — guard anti-doublon par appareil uniquement
    const { importedFingerprints: _excluded, ...rest } = rawMemory;
    memoryClean = Object.keys(rest).length > 0 ? rest : null;
  }

  const je = journalEntries.getAll();
  const oi = oiHistory.getAll();
  const pf = portfolio.getAll();
  const st = settings.get();

  // D-LOT3-DETECT-02 : clé absente = null — jamais {} ni []
  const journalVal  = je.length              > 0 ? { entries: je }   : null;
  const oiVal       = oi.length              > 0 ? { entries: oi }   : null;
  const pfVal       = pf.length              > 0 ? { snapshots: pf } : null;
  const settingsVal = Object.keys(st).length > 0 ? st                : null;

  if (!journalVal && !memoryClean && !oiVal && !pfVal && !settingsVal) return null;

  // Ordre stable obligatoire (D-LOT3-DETECT-02 — garantie JSON.stringify)
  return {
    version:                 1,
    CE_journal_entries_v1:   journalVal,
    CE_operator_memory_v1:   memoryClean,
    CE_oi_history_v1:        oiVal,
    CE_portfolio_v1:         pfVal,
    CE_settings_v1:          settingsVal,
  };
}

// ── _normalizeCloud(raw) — privé ─────────────────────────────────────────────
// Reconstruit un payload cloud dans le même ordre stable que buildLocalPayload().
// Nécessaire pour que JSON.stringify(local) === JSON.stringify(cloud) soit fiable.
// Retourne null si le payload est invalide (version manquante ou ≠ 1).

function _normalizeCloud(raw) {
  if (!raw || raw.version !== 1) return null;
  return {
    version:                 raw.version,
    CE_journal_entries_v1:   raw.CE_journal_entries_v1  ?? null,
    CE_operator_memory_v1:   raw.CE_operator_memory_v1  ?? null,
    CE_oi_history_v1:        raw.CE_oi_history_v1       ?? null,
    CE_portfolio_v1:         raw.CE_portfolio_v1         ?? null,
    CE_settings_v1:          raw.CE_settings_v1          ?? null,
  };
}

// ── detectConflict(serverUUID) ───────────────────────────────────────────────
// Phase 1 stricte — lecture seule (D-LOT3-CONFLICT-04).
// Ne déclenche jamais executeUpload() ni applyCloudRestore().
//
// États retournés :
//   INIT_EMPTY    — cloud absent + local absent → rien à synchroniser
//   KEEP_LOCAL    — cloud absent + local présent → première sauvegarde possible
//   AUTO_RESTORE  — cloud présent + local absent → restauration automatique (FLUX C)
//   NO_OP         — cloud == local (JSON.stringify identique) → rien à faire
//   CONFLICT      — cloud ≠ local → modale de décision requise
//   OFFLINE_LOCAL — erreur réseau → état dégradé (D-LOT3-OFFLINE-01)
//                   OFFLINE_LOCAL ≠ NO_OP : cloud inconnu, RISK-SYNC-01 actif

export async function detectConflict(serverUUID) {
  _trace('detectConflict ENTER');                                 // [TEMP DEBUG]
  const localPayload = buildLocalPayload();
  _trace(`buildLocalPayload DONE local=${localPayload !== null}`); // [TEMP DEBUG]

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => {
    _trace('AbortController FIRED (15s timeout)');                // [TEMP DEBUG]
    controller.abort();
  }, 15000);
  _trace('AbortController ARMED');                               // [TEMP DEBUG]

  try {
    _trace('SUPABASE QUERY START');                              // [TEMP DEBUG]
    const { data: rows, error } = await supabase
      .from('operator_data')
      .select('payload, updated_at')
      .eq('id', serverUUID)
      .abortSignal(controller.signal);

    _trace(`SUPABASE QUERY DONE error=${!!error}`);              // [TEMP DEBUG]
    if (error) throw error;

    const cloudRow = rows?.[0] ?? null;

    // Cloud absent
    if (!cloudRow) {
      return localPayload === null
        ? { state: 'INIT_EMPTY' }
        : { state: 'KEEP_LOCAL', localPayload };
    }

    // Cloud présent + local absent → FLUX C
    if (localPayload === null) {
      return { state: 'AUTO_RESTORE', cloudPayload: cloudRow.payload };
    }

    // Cloud présent + local présent → comparer
    const normalizedCloud = _normalizeCloud(cloudRow.payload);
    const identical = normalizedCloud !== null
      && JSON.stringify(localPayload) === JSON.stringify(normalizedCloud);

    return identical
      ? { state: 'NO_OP' }
      : { state: 'CONFLICT', localPayload, cloudPayload: cloudRow.payload };

  } catch (err) {
    _trace(`detectConflict CATCH: ${err?.name} ${err?.message?.slice(0, 40)}`); // [TEMP DEBUG]
    // D-LOT3-OFFLINE-01 — erreur réseau : OFFLINE_LOCAL ≠ NO_OP
    // Cloud inconnu — ne pas assimiler à NO_OP (RISK-SYNC-01)
    return {
      state:      'OFFLINE_LOCAL',
      localEmpty: localPayload === null,
      error:      err?.message ?? 'network_error',
    };
  } finally {
    // Nettoyage garanti — tous chemins : succès, erreur, AbortError, exception inattendue.
    clearTimeout(timeoutId);
  }
}

// ── executeUpload(serverUUID) ────────────────────────────────────────────────
// Seul point d'UPSERT vers operator_data dans tout le module account/.
// Inconditionnel : tout gatekeeping est dans account-ui.js (D-LOT3-UPLOAD-GUARD-01).
// Défense en profondeur : retourne { ok: false } si payload serait null (EMPTY_PAYLOAD).
//
// Invariant X = 2 : les deux seuls appelants autorisés sont upload() et resolveLocal()
// dans account-sync.js.

export async function executeUpload(serverUUID) {
  const payload = buildLocalPayload();
  if (!payload) return { ok: false, error: 'empty_payload' };

  try {
    const { error } = await supabase
      .from('operator_data')
      .upsert(
        { id: serverUUID, payload, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );

    return error
      ? { ok: false, error: error.message }
      : { ok: true,  error: null };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'network_error' };
  }
}

// ── applyCloudRestore(cloudPayload) ─────────────────────────────────────────
// Écrit le payload cloud dans localStorage via les accesseurs storage.js.
// Direction : cloud → localStorage. Aucun UPSERT vers operator_data.
// Clés null dans le payload → ignorées (pas d'effacement de données existantes).
// Erreurs par clé accumulées sans interruption — retourne le bilan complet.

export function applyCloudRestore(cloudPayload) {
  const errors = [];

  const tryWrite = (key, fn) => {
    try {
      if (fn() === false) errors.push(`${key}: write_failed`);
    } catch (e) {
      errors.push(`${key}: ${e?.message ?? 'exception'}`);
    }
  };

  if (cloudPayload.CE_journal_entries_v1 !== null && cloudPayload.CE_journal_entries_v1 !== undefined) {
    tryWrite('CE_journal_entries_v1', () =>
      journalEntries.setAll(cloudPayload.CE_journal_entries_v1?.entries ?? [])
    );
  }

  if (cloudPayload.CE_operator_memory_v1 !== null && cloudPayload.CE_operator_memory_v1 !== undefined) {
    tryWrite('CE_operator_memory_v1', () =>
      operatorMemory.set(cloudPayload.CE_operator_memory_v1)
    );
  }

  if (cloudPayload.CE_oi_history_v1 !== null && cloudPayload.CE_oi_history_v1 !== undefined) {
    tryWrite('CE_oi_history_v1', () =>
      oiHistory.setAll(cloudPayload.CE_oi_history_v1?.entries ?? [])
    );
  }

  if (cloudPayload.CE_portfolio_v1 !== null && cloudPayload.CE_portfolio_v1 !== undefined) {
    tryWrite('CE_portfolio_v1', () =>
      portfolio.setAll(cloudPayload.CE_portfolio_v1?.snapshots ?? [])
    );
  }

  if (cloudPayload.CE_settings_v1 !== null && cloudPayload.CE_settings_v1 !== undefined) {
    tryWrite('CE_settings_v1', () =>
      settings.set(cloudPayload.CE_settings_v1)
    );
  }

  return { ok: errors.length === 0, errors };
}
