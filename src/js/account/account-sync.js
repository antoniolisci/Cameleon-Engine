// account-sync.js — Orchestrateur synchronisation cloud LOT 3
// Caméléon Engine · Compte Utilisateur V1 · LOT 3
//
// Ce module est un orchestrateur événementiel — il n'est PAS un module pur.
// Effets de bord intentionnels à l'import : subscription top-level à account:connected
// + check au démarrage pour les rechargements de page (utilisateur déjà connecté).
//
// Frontière LOT 2 / LOT 3 (D-LOT3-FILE-BOUNDARY-01) :
//   - Aucun import de account-service.js
//   - Le lien auth → sync passe par l'événement account:connected (première connexion)
//   - Le check au démarrage couvre le rechargement (CONNECTED non ré-émis par LOT 2)
//   - account-service.js reste LOT 2 / auth uniquement, inchangé
//
// Exports publics (appelés par account-ui.js) :
//   upload(serverUUID)            → FLUX A  — clic "Sauvegarder"
//   resolveLocal(serverUUID)      → S2-LOCAL — clic "Conserver mes données locales"
//   resolveCloud(cloudPayload)    → S2-CLOUD — clic "Conserver les données du compte"
//
// Invariant X = 2 :
//   Seuls upload() et resolveLocal() appellent executeUpload() → UPSERT operator_data.
//   resolveCloud() appelle applyCloudRestore() → localStorage uniquement.
//   _runDetection() ne déclenche jamais executeUpload().

import { on, emit, ACCOUNT_EVENTS }      from './account-events.js';
import { detectConflict, executeUpload,
         applyCloudRestore }             from './account-cloud.js';
import { getServerUUID }                 from './account-storage.js';

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

// ── _runDetection(serverUUID) — privé ─────────────────────────────────────────
// Cœur du FLUX B : détecte l'état de sync et émet le résultat.
// Phase 1 stricte — lecture seule (D-LOT3-CONFLICT-04).
// Appelé depuis la subscription CONNECTED et depuis le check au démarrage.

async function _runDetection(serverUUID) {
  _trace(`_runDetection START uuid=${serverUUID?.slice(0, 8)}…`); // [TEMP DEBUG]
  let result;
  try {
    _trace('detectConflict CALL →');                              // [TEMP DEBUG]
    result = await detectConflict(serverUUID);
    _trace(`detectConflict RETURNED state=${result?.state}`);    // [TEMP DEBUG]
  } catch (e) {
    _trace(`_runDetection CATCH: ${e?.message}`);                // [TEMP DEBUG]
    result = { state: 'OFFLINE_LOCAL', localEmpty: true, error: 'unexpected_exception' };
  }

  _trace(`EMIT SYNC_COMPLETE state=${result.state}`);            // [TEMP DEBUG]

  switch (result.state) {

    case 'INIT_EMPTY':
    case 'NO_OP':
    case 'KEEP_LOCAL':
      emit(ACCOUNT_EVENTS.SYNC_COMPLETE, { state: result.state });
      break;

    case 'OFFLINE_LOCAL':
      // D-LOT3-OFFLINE-01 — état dégradé assumé
      // OFFLINE_LOCAL ≠ NO_OP : cloud inconnu, RISK-SYNC-01 actif si upload depuis cet état
      emit(ACCOUNT_EVENTS.SYNC_COMPLETE, {
        state:      'OFFLINE_LOCAL',
        localEmpty: result.localEmpty ?? false,
      });
      break;

    case 'AUTO_RESTORE': {
      // FLUX C — restauration automatique cloud → localStorage
      // Pas d'UPSERT — X = 2 préservé
      const restoreResult = applyCloudRestore(result.cloudPayload);
      if (restoreResult.ok) {
        emit(ACCOUNT_EVENTS.SYNC_COMPLETE, { state: 'AUTO_RESTORE_DONE' });
      } else {
        emit(ACCOUNT_EVENTS.SYNC_ERROR, {
          step:  'restore',
          error: restoreResult.errors.join('; '),
        });
      }
      break;
    }

    case 'CONFLICT':
      emit(ACCOUNT_EVENTS.CONFLICT_DETECTED, {
        localPayload: result.localPayload,
        cloudPayload: result.cloudPayload,
      });
      break;
  }
}

// ── Subscription FLUX B — top-level ──────────────────────────────────────────
// Déclenchée à chaque account:connected (première connexion / magic link).
// account-init.js importe ce module AVANT d'appeler verifyMagicLink()
// → subscription active avant tout événement CONNECTED.

on(ACCOUNT_EVENTS.CONNECTED, async (e) => {
  const serverUUID = e.detail?.serverUUID;
  _trace(`CONNECTED event serverUUID=${serverUUID ? serverUUID.slice(0,8)+'…' : 'null'}`); // [TEMP DEBUG]
  if (!serverUUID) return;
  await _runDetection(serverUUID);
});

// ── Check au démarrage — rechargement de page ─────────────────────────────────
// Cas : utilisateur déjà connecté (CE_account_v1 + session Supabase présents).
// Dans ce cas, verifyMagicLink() (LOT 2) ne ré-émet PAS account:connected
// (condition ligne 186 account-service.js : session && !getAccountState() → false).
// Ce check supplée ce cas sans modifier account-service.js.
//
// setTimeout(0) : différé au prochain macrotask, après que tous les modules
// (y compris account-ui.js chargé après account-init.js) ont enregistré leurs listeners.

const _startupUUID = getServerUUID();
_trace(`startup check uuid=${_startupUUID ? _startupUUID.slice(0,8)+'…' : 'null'}`); // [TEMP DEBUG]
if (_startupUUID) {
  setTimeout(() => _runDetection(_startupUUID), 0);
}

// ── upload(serverUUID) ───────────────────────────────────────────────────────
// FLUX A — déclenché par clic "Sauvegarder" dans account-ui.js
// D-LOT3-SYNC-TRIGGER-01 : bouton explicite uniquement — pas de timer, pas de retry auto
// Invariant X = 2 — chemin n°1 : upload() → executeUpload() → UPSERT operator_data

export async function upload(serverUUID) {
  const result = await executeUpload(serverUUID);
  emit(ACCOUNT_EVENTS.SYNC_COMPLETE, {
    state: result.ok ? 'UPLOAD_SUCCESS' : 'UPLOAD_ERROR',
    error: result.error ?? null,
  });
}

// ── resolveLocal(serverUUID) ─────────────────────────────────────────────────
// S2-LOCAL — déclenché par clic "Conserver mes données locales" dans account-ui.js
// Invariant X = 2 — chemin n°2 : resolveLocal() → executeUpload() → UPSERT operator_data

export async function resolveLocal(serverUUID) {
  const result = await executeUpload(serverUUID);
  emit(ACCOUNT_EVENTS.SYNC_COMPLETE, {
    state: result.ok ? 'CONFLICT_RESOLVED' : 'S2_LOCAL_ERROR',
    error: result.error ?? null,
  });
}

// ── resolveCloud(cloudPayload) ───────────────────────────────────────────────
// S2-CLOUD — déclenché par clic "Conserver les données du compte" dans account-ui.js
// Écriture localStorage uniquement — pas d'UPSERT (X = 2 préservé)

export function resolveCloud(cloudPayload) {
  const result = applyCloudRestore(cloudPayload);
  emit(ACCOUNT_EVENTS.SYNC_COMPLETE, {
    state: result.ok ? 'CONFLICT_RESOLVED' : 'S2_CLOUD_ERROR',
    error: result.errors.length > 0 ? result.errors.join('; ') : null,
  });
}
