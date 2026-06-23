// storage.js — Centralized localStorage API for Caméléon Engine.
// All persistence goes through this module. No raw localStorage calls elsewhere.

import { HISTORY_LIMIT } from './data.js';

export const KEYS = {
  identity: 'CE_identity_v1',
  settings: 'CE_settings_v1',
  payloadCurrent: 'CE_payload_current_v1',
  journalEntries: 'CE_journal_entries_v1',
  behaviorSessions: 'CE_behavior_sessions_v1',
  importRegistry: 'CE_import_registry_v1',
  uiState: 'CE_ui_state_v1',
  backups: 'CE_backups_v1',
  behaviorMemory: 'cameleon_behavior_memory_v1',
  portfolio: 'CE_portfolio_v1',
  operatorMemory: 'CE_operator_memory_v1',
  oiHistory: 'CE_oi_history_v1',
  // Clé globale appareil — intentionnellement exclue de withUserKey et _OPERATOR_KEYS.
  // Ne jamais synchroniser avec le compte utilisateur.
  // État UI de première visite : affiché une seule fois par navigateur.
  // onboarding-init.js (script <head> pré-modules) lit cette clé via localStorage direct —
  // contrainte architecturale immuable, ne pas tenter de centraliser ce script.
  onboarding: 'CE_onboarding_v1',
  // Rate limit magic link — clé globale appareil, non namespacée, éphémère.
  // Fenêtre glissante 15 min · max 3 envois · protection client uniquement.
  // Intentionnellement exclue de _OPERATOR_KEYS : jamais exportée, jamais migrée.
  magicLinkRateLimit: 'CE_magic_link_rl_v1',
};

const SCHEMA_VERSION = 1;
const BACKUPS_LIMIT              = 50;
const IMPORT_REGISTRY_LIMIT      = 100;
const PORTFOLIO_SNAPSHOTS_LIMIT  = 50;

// ── Core I/O ──────────────────────────────────────────────────

function _generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC 4122 v4 pour navigateurs anciens.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function _now() {
  return new Date().toISOString();
}

function _read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function _readRawJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function _write(key, payload) {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

function _remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function _wrap(data, extra = {}) {
  return {
    version: SCHEMA_VERSION,
    updatedAt: _now(),
    ...extra,
    ...data,
  };
}

// ── Settings ──────────────────────────────────────────────────

export const settings = {
  get() {
    return _read(withUserKey(KEYS.settings))?.data ?? {};
  },
  set(data) {
    return _write(withUserKey(KEYS.settings), _wrap({ data }));
  },
};

// ── Current payload ───────────────────────────────────────────

export const payloadCurrent = {
  get() {
    return _read(KEYS.payloadCurrent)?.data ?? null;
  },
  set(payload) {
    return _write(KEYS.payloadCurrent, _wrap({ data: payload }));
  },
  clear() {
    return _remove(KEYS.payloadCurrent);
  },
};

// ── Journal entries ───────────────────────────────────────────

export const journalEntries = {
  getAll() {
    return _read(withUserKey(KEYS.journalEntries))?.entries ?? [];
  },
  setAll(arr) {
    return _write(
      withUserKey(KEYS.journalEntries),
      _wrap({ entries: arr.slice(-HISTORY_LIMIT) })
    );
  },
  clear() {
    return _write(withUserKey(KEYS.journalEntries), _wrap({ entries: [] }));
  },
};

// ── Behavior sessions ─────────────────────────────────────────

export const behaviorSessions = {
  getAll() {
    return _read(withUserKey(KEYS.behaviorSessions))?.sessions ?? [];
  },
  setAll(sessions) {
    return _write(withUserKey(KEYS.behaviorSessions), _wrap({ sessions }));
  },
  clear() {
    return _write(withUserKey(KEYS.behaviorSessions), _wrap({ sessions: [] }));
  },
};

// ── Import registry ───────────────────────────────────────────

export const importRegistry = {
  getAll() {
    return _read(withUserKey(KEYS.importRegistry))?.imports ?? [];
  },
  append(entry) {
    const imports = this.getAll();
    imports.unshift(entry);
    return _write(withUserKey(KEYS.importRegistry), _wrap({ imports: imports.slice(0, IMPORT_REGISTRY_LIMIT) }));
  },
  clear() {
    return _write(withUserKey(KEYS.importRegistry), _wrap({ imports: [] }));
  },
};

// ── Portfolio V1 snapshots ────────────────────────────────────

export const portfolio = {
  getAll() {
    const data = _read(withUserKey(KEYS.portfolio));
    if (!data)                          return [];
    if (!Array.isArray(data.snapshots)) return [];
    return data.snapshots;
  },
  append(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;
    const snapshots = this.getAll();
    snapshots.unshift(snapshot);
    return _write(withUserKey(KEYS.portfolio), _wrap({ snapshots: snapshots.slice(0, PORTFOLIO_SNAPSHOTS_LIMIT) }));
  },
  setAll(arr) {
    return _write(withUserKey(KEYS.portfolio), _wrap({ snapshots: Array.isArray(arr) ? arr.slice(0, PORTFOLIO_SNAPSHOTS_LIMIT) : [] }));
  },
  clear() {
    return _write(withUserKey(KEYS.portfolio), _wrap({ snapshots: [] }));
  },
};

// ── UI state ──────────────────────────────────────────────────

export const uiState = {
  get() {
    return _read(KEYS.uiState)?.data ?? null;
  },
  set(data) {
    return _write(KEYS.uiState, _wrap({ data }));
  },
};

// ── Backups / engine snapshot history ────────────────────────

export const backups = {
  getAll() {
    return _read(withUserKey(KEYS.backups))?.snapshots ?? [];
  },
  prepend(snap) {
    const snapshots = this.getAll();
    snapshots.unshift(snap);
    return _write(
      withUserKey(KEYS.backups),
      _wrap({ snapshots: snapshots.slice(0, BACKUPS_LIMIT) })
    );
  },
  clear() {
    return _remove(withUserKey(KEYS.backups));
  },
};

// ── Operator memory — mémoire comportementale long-terme ─────
// Structurée (sessionCount, allTime, window10, certifications).
// Accès via withUserKey — namespacing UUID identique aux autres clés opérateur.

export const operatorMemory = {
  get() {
    return _read(withUserKey(KEYS.operatorMemory))?.data ?? null;
  },
  set(data) {
    return _write(withUserKey(KEYS.operatorMemory), _wrap({ data }));
  },
  clear() {
    return _remove(withUserKey(KEYS.operatorMemory));
  },
};

// ── OI V1 history — profils opérateur longitudinaux ──────────
// FIFO 50 entrées — schemaVersion + oiVersion par entrée.
// Accès via withUserKey — namespacing UUID identique aux autres clés opérateur.

export const oiHistory = {
  getAll() {
    return _read(withUserKey(KEYS.oiHistory))?.entries ?? [];
  },
  append(entry) {
    if (!entry || typeof entry !== 'object') return false;
    const entries = this.getAll();
    entries.unshift(entry);
    return _write(withUserKey(KEYS.oiHistory), _wrap({ entries: entries.slice(0, 50) }));
  },
  setAll(arr) {
    return _write(withUserKey(KEYS.oiHistory), _wrap({ entries: Array.isArray(arr) ? arr.slice(0, 50) : [] }));
  },
  clear() {
    return _write(withUserKey(KEYS.oiHistory), _wrap({ entries: [] }));
  },
};

// ── Behavior memory — signal comportemental courant ──────────
// Format : tableau brut JSON (pas de _wrap) — compatibilité données existantes.
// Écriture centralisée ici ; render.js ne doit plus appeler localStorage directement.

export const behaviorMemory = {
  getAll() {
    try {
      const raw = localStorage.getItem(withUserKey(KEYS.behaviorMemory));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  setAll(entries) {
    try {
      localStorage.setItem(withUserKey(KEYS.behaviorMemory), JSON.stringify(entries));
      return true;
    } catch {
      return false;
    }
  },
  clear() {
    return _remove(withUserKey(KEYS.behaviorMemory));
  },
};

// ── Identité locale ───────────────────────────────────────────
// Clé globale (pas de namespacing). Contient le UUID — ne le porte pas dans son nom.
// Format : { uuid: string (RFC 4122), createdAt: number (ms) }

export const identity = {
  get() {
    return _read(KEYS.identity)?.data ?? null;
  },
  ensure() {
    const existing = this.get();
    if (existing) return existing;
    const data = { uuid: _generateUUID(), createdAt: Date.now() };
    _write(KEYS.identity, _wrap({ data }));
    return data;
  },
  clear() {
    return _remove(KEYS.identity);
  },
};

// ── Helper namespacing — clé suffixée par UUID ────────────────
// Usage interne uniquement — non exporté.
// Gate : CE_migration_uuid_v1_done doit être posé (toutes les copies confirmées).
// Si flag absent → retourne baseKey (session de grâce).
// Si flag présent → retourne baseKey__{uuid} (UUID nécessairement présent si flag posé).
// Activé dans ADU-04C — les exports basculent vers withUserKey().

function withUserKey(baseKey) { // eslint-disable-line no-unused-vars
  if (localStorage.getItem(_UUID_MIGRATION_FLAG) !== '1') return baseKey;
  const id = identity.get();
  return id ? `${baseKey}__${id.uuid}` : baseKey; // défensif : uuid absent = grâce
}

// ── Behavior guard — helpers lecture cross-module ─────────────
// Ces clés sont écrites par behavior-repo.js (namespace cameleon.behavior.v1.*).
// Ces helpers permettent à render.js de les lire sans appel localStorage brut.
// Ne pas écrire via ces helpers — écriture réservée au module behavior.

const _BHV_NS  = 'cameleon.behavior.v1.';
const _BHV_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours

export const behaviorGuard = {
  /**
   * Retourne le niveau historique (1–5) si présent et non expiré (< 7 jours).
   * Retourne null si absent, invalide ou expiré.
   */
  readHistoricalLevel() {
    try {
      const rawLevel = localStorage.getItem(withUserKey(_BHV_NS + 'guardLevel'));
      const rawTs    = localStorage.getItem(withUserKey(_BHV_NS + 'guardLevelUpdatedAt'));
      const level    = rawLevel !== null ? JSON.parse(rawLevel) : null;
      const ts       = rawTs    !== null ? JSON.parse(rawTs)    : null;
      if (typeof level !== 'number' || level < 1 || level > 5)          return null;
      if (typeof ts    !== 'number' || (Date.now() - ts) >= _BHV_TTL)   return null;
      return level;
    } catch {
      return null;
    }
  },

  // Retourne le niveau de cohérence comportemental brut écrit par behavior-view.js.
  // Clé éphémère globale — pas de withUserKey, pas de TTL.
  // Validation métier (liste des valeurs acceptées) à la charge de l'appelant.
  readCoherenceLevel() {
    return _readRawJSON(_BHV_NS + 'coherenceLevel', null);
  },

  // Retourne le risque dominant brut et son timestamp écrits par behavior-view.js.
  // Clés éphémères globales — pas de withUserKey, pas de TTL.
  // Validation métier (liste patterns, expiry 7 jours) à la charge de l'appelant.
  readDominantRisk() {
    return {
      pattern:   _readRawJSON(_BHV_NS + 'dominantRisk',          null),
      updatedAt: _readRawJSON(_BHV_NS + 'dominantRiskUpdatedAt', null),
    };
  },
};

// ── Storage health ────────────────────────────────────────────

export function canUseStorage() {
  try {
    const k = '__ce_probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function estimateTotalSize() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (!key.startsWith('CE_') && !key.startsWith('cameleon')) continue;
    const raw = localStorage.getItem(key);
    if (raw) total += new Blob([raw]).size;
  }
  return total;
}

export function getStorageLevel() {
  const bytes   = estimateTotalSize();
  const limit   = 5 * 1024 * 1024;
  const percent = Math.min(100, Math.round((bytes / limit) * 100));
  const level   = percent >= 90 ? 'critique'
                : percent >= 70 ? 'vigilance'
                : 'normal';
  return { bytes, kb: (bytes / 1024).toFixed(1), percent, level };
}

export function estimateKeySize(key) {
  const raw = localStorage.getItem(key);
  return `${(raw ? new Blob([raw]).size / 1024 : 0).toFixed(1)} KB`;
}

// ── Portabilité — export données opérateur ───────────────────
// Retourne un objet JSON structuré contenant toutes les données opérateur.
// Ne crée jamais d'identité — retourne null si identity absente.
// Lecture uniquement — aucun effet de bord.

export function exportOperatorData() {
  const id = identity.get();
  if (!id) return null;

  try {
    return {
      version:      1,
      exportedAt:   new Date().toISOString(),
      engine:       'cameleon-engine',
      identityType: 'local',
      operator: {
        uuid:      id.uuid,
        createdAt: id.createdAt,
      },
      data: {
        journalEntries:       journalEntries.getAll(),
        behaviorSessions:     behaviorSessions.getAll(),
        backups:              backups.getAll(),
        settings:             settings.get(),
        behaviorMemory:       behaviorMemory.getAll(),
        guardLevel:           _readRawJSON(withUserKey(_BHV_NS + 'guardLevel')),
        guardLevelUpdatedAt:  _readRawJSON(withUserKey(_BHV_NS + 'guardLevelUpdatedAt')),
        orderStrategyProfile: _readRawJSON(withUserKey(_BHV_NS + 'orderStrategyProfile')),
        importRegistry:       importRegistry.getAll(),
        uiState:              uiState.get(),
        portfolio:            portfolio.getAll(),
        operatorMemory:       operatorMemory.get(),
        oiHistory:            oiHistory.getAll(),
      },
    };
  } catch {
    return null;
  }
}

// Déclenche le téléchargement des données opérateur au format JSON.
// Retourne true si le téléchargement a été initié, false si identity absente ou erreur.
export function downloadOperatorData() {
  try {
    const data = exportOperatorData();
    if (data === null) return false;

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);

    const d        = new Date();
    const yyyy     = d.getFullYear();
    const mm       = String(d.getMonth() + 1).padStart(2, '0');
    const dd       = String(d.getDate()).padStart(2, '0');
    const filename = `cameleon-data-${yyyy}-${mm}-${dd}.json`;

    const a      = document.createElement('a');
    a.href       = url;
    a.download   = filename;
    a.click();

    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

// ── Portabilité — import données opérateur ───────────────────
// Restaure les données opérateur depuis un export JSON produit par exportOperatorData().
//
// Préconditions obligatoires :
//   P1 — CE_migration_uuid_v1_done === '1' : withUserKey() doit être actif avant toute écriture.
//         Sans ce flag, withUserKey() retourne la clé legacy — l'import écrirait dans l'espace
//         non-namespacé, créant un conflit lors de la prochaine runUUIDMigration().
//   P2 — Format valide : version === 1, engine === 'cameleon-engine', data objet non null.
//
// Stratégie d'écriture : chaque clé utilise son propre format de stockage (voir ci-dessous).
// Pas de JSON.stringify(value) générique — chaque clé a son enveloppe attendue par son getter.
// Pas de rollback : si une écriture échoue (quota), les clés déjà écrites restent.
//
// Clés intentionnellement exclues de l'import :
//   uiState (CE_ui_state_v1)          — état UI device-spécifique
//   CE_onboarding_v1                  — état appareil, 1 fois par navigateur
//   CE_identity_v1                    — UUID local, concept local
//   CE_account_v1                     — cache Supabase
//   CE_magic_link_rl_v1              — rate limit éphémère

export function importOperatorData(data) {
  // P1 — Migration UUID obligatoire avant toute écriture.
  if (localStorage.getItem(_UUID_MIGRATION_FLAG) !== '1') {
    return { ok: false, error: 'migration_incomplete' };
  }

  // P2 — Validation format.
  if (
    !data ||
    data.version !== 1 ||
    data.engine !== 'cameleon-engine' ||
    !data.data ||
    typeof data.data !== 'object' ||
    Array.isArray(data.data)
  ) {
    return { ok: false, error: 'invalid_format' };
  }

  const d = data.data;
  let imported = 0;
  const errors = [];

  function _tryWrite(label, fn) {
    try {
      const result = fn();
      if (result === false) {
        errors.push({ key: label, error: 'write_failed' });
      } else {
        imported++;
      }
    } catch (err) {
      errors.push({ key: label, error: err?.message ?? 'write_failed' });
    }
  }

  // ── Stores enveloppés avec _wrap ─────────────────────────────
  // Le getter lit `_read(key)?.entries` (ou .sessions, .imports, .snapshots).
  // L'import doit restaurer la même enveloppe — sinon le getter retourne le fallback vide.

  if (d.journalEntries !== undefined) {
    _tryWrite('CE_journal_entries_v1', () =>
      _write(withUserKey(KEYS.journalEntries), _wrap({ entries: Array.isArray(d.journalEntries) ? d.journalEntries : [] }))
    );
  }

  if (d.behaviorSessions !== undefined) {
    _tryWrite('CE_behavior_sessions_v1', () =>
      _write(withUserKey(KEYS.behaviorSessions), _wrap({ sessions: Array.isArray(d.behaviorSessions) ? d.behaviorSessions : [] }))
    );
  }

  if (d.importRegistry !== undefined) {
    _tryWrite('CE_import_registry_v1', () =>
      _write(withUserKey(KEYS.importRegistry), _wrap({ imports: Array.isArray(d.importRegistry) ? d.importRegistry : [] }))
    );
  }

  if (d.backups !== undefined) {
    _tryWrite('CE_backups_v1', () =>
      _write(withUserKey(KEYS.backups), _wrap({ snapshots: Array.isArray(d.backups) ? d.backups : [] }))
    );
  }

  if (d.portfolio !== undefined) {
    _tryWrite('CE_portfolio_v1', () =>
      _write(withUserKey(KEYS.portfolio), _wrap({ snapshots: Array.isArray(d.portfolio) ? d.portfolio : [] }))
    );
  }

  if (d.oiHistory !== undefined) {
    _tryWrite('CE_oi_history_v1', () =>
      _write(withUserKey(KEYS.oiHistory), _wrap({ entries: Array.isArray(d.oiHistory) ? d.oiHistory : [] }))
    );
  }

  // ── Stores avec API setter — format géré par l'API ──────────
  // settings.set() et operatorMemory.set() écrivent _wrap({ data: v }) en interne.
  // behaviorMemory.setAll() écrit le tableau brut sans enveloppe (format spécifique).

  if (d.settings !== undefined) {
    _tryWrite('CE_settings_v1', () => settings.set(d.settings));
  }

  if (d.operatorMemory !== undefined) {
    _tryWrite('CE_operator_memory_v1', () => operatorMemory.set(d.operatorMemory));
  }

  if (d.behaviorMemory !== undefined) {
    _tryWrite('cameleon_behavior_memory_v1', () =>
      behaviorMemory.setAll(Array.isArray(d.behaviorMemory) ? d.behaviorMemory : [])
    );
  }

  // ── Scalaires raw JSON — behavior namespace ──────────────────
  // Ces clés sont écrites par behavior-repo.js sans _wrap : localStorage.setItem(key, JSON.stringify(val)).
  // _readRawJSON() les lit en JSON.parse brut — JSON.stringify(v) est donc le format exact attendu.

  if (d.guardLevel !== undefined) {
    _tryWrite('cameleon.behavior.v1.guardLevel', () =>
      localStorage.setItem(withUserKey(_BHV_NS + 'guardLevel'), JSON.stringify(d.guardLevel))
    );
  }

  if (d.guardLevelUpdatedAt !== undefined) {
    _tryWrite('cameleon.behavior.v1.guardLevelUpdatedAt', () =>
      localStorage.setItem(withUserKey(_BHV_NS + 'guardLevelUpdatedAt'), JSON.stringify(d.guardLevelUpdatedAt))
    );
  }

  if (d.orderStrategyProfile !== undefined) {
    _tryWrite('cameleon.behavior.v1.orderStrategyProfile', () =>
      localStorage.setItem(withUserKey(_BHV_NS + 'orderStrategyProfile'), JSON.stringify(d.orderStrategyProfile))
    );
  }

  return { ok: true, imported, errors };
}

// ── Portabilité — purge données opérateur ────────────────────
// Supprime les 12 clés opérateur de _OPERATOR_KEYS via withUserKey().
// Clés intentionnellement préservées :
//   CE_identity_v1          — UUID local, nécessaire au fonctionnement
//   CE_onboarding_v1        — état appareil
//   CE_account_v1           — cache session Supabase
//   CE_magic_link_rl_v1    — rate limit éphémère
//   CE_migration_uuid_v1_done + CE_migration_uuid_cleanup_done — flags système
//
// Retourne { ok: true, cleared: N, errors: [] }.
// Pas de rollback : suppression clé par clé, try/catch individuel.

export function clearOperatorData() {
  let cleared = 0;
  const errors = [];

  for (const baseKey of _OPERATOR_KEYS) {
    try {
      localStorage.removeItem(withUserKey(baseKey));
      cleared++;
    } catch (err) {
      errors.push({ key: baseKey, error: err?.message ?? 'remove_failed' });
    }
  }

  return { ok: true, cleared, errors };
}

// ── Migration ─────────────────────────────────────────────────

const _LEGACY = {
  main: 'cameleon-engine-modular-v732e-v45',
  history: 'cameleon_history',
  sessions: 'bhv_sessions',
};

const _MIGRATION_FLAG = 'CE_migration_v1_done';

export function runMigration() {
  if (localStorage.getItem(_MIGRATION_FLAG) === '1') return false;

  try {
    const main = JSON.parse(localStorage.getItem(_LEGACY.main) || 'null');

    if (main) {
      if (!uiState.get()) {
        const { activeTab = 'moteur', form = {}, lastSaved = null } = main;
        uiState.set({ activeTab, form, lastSaved });
      }

      if (
        !journalEntries.getAll().length &&
        Array.isArray(main.history) &&
        main.history.length
      ) {
        journalEntries.setAll(main.history);
      }

      if (!payloadCurrent.get() && main.lastPayload) {
        payloadCurrent.set(main.lastPayload);
      }
    }

    const hist = JSON.parse(localStorage.getItem(_LEGACY.history) || 'null');

    if (Array.isArray(hist) && hist.length && !backups.getAll().length) {
      _write(
        KEYS.backups,
        _wrap({ snapshots: hist.slice(0, BACKUPS_LIMIT) })
      );
    }

    const sess = JSON.parse(localStorage.getItem(_LEGACY.sessions) || 'null');

    if (
      Array.isArray(sess) &&
      sess.length &&
      !behaviorSessions.getAll().length
    ) {
      behaviorSessions.setAll(sess);
    }
  } catch {}

  localStorage.setItem(_MIGRATION_FLAG, '1');
  return true;
}

// ── Migration UUID ────────────────────────────────────────────
// Copie les 9 clés opérateur vers leurs équivalents namespacés baseKey__{uuid}.
// Prévue pour être appelée ultérieurement par state.js en ADU-04C — non appelée dans ADU-04B.
// runUUIDMigration() : copie + flag.
// runUUIDCleanup()   : suppression legacy au 2e lancement si clés namespacées sûres.

const _UUID_MIGRATION_FLAG = 'CE_migration_uuid_v1_done';
const _UUID_CLEANUP_FLAG   = 'CE_migration_uuid_cleanup_done';

// Liste canonique des clés opérateur à migrer (ARCH-N1).
// Clés globales exclues : CE_ui_state_v1, CE_payload_current_v1, CE_identity_v1, flags.
const _OPERATOR_KEYS = [
  'CE_journal_entries_v1',
  'CE_behavior_sessions_v1',
  'CE_import_registry_v1',
  'CE_backups_v1',
  'CE_settings_v1',
  'CE_portfolio_v1',
  'cameleon_behavior_memory_v1',
  'CE_operator_memory_v1',
  'cameleon.behavior.v1.guardLevel',
  'cameleon.behavior.v1.guardLevelUpdatedAt',
  'cameleon.behavior.v1.orderStrategyProfile',
  'CE_oi_history_v1',
];

// Copie la valeur brute de baseKey vers baseKey__{uuid}.
// Préserve le format exact (pas de parse/re-sérialisation).
// Si baseKey absent → retourne true (rien à copier, opération triviale).
function _copyLegacyKeyToUserKey(baseKey, uuid) {
  try {
    const raw = localStorage.getItem(baseKey);
    if (raw === null) return true;
    localStorage.setItem(`${baseKey}__${uuid}`, raw);
    return true;
  } catch {
    return false;
  }
}

// Retourne true si la clé namespacée baseKey__{uuid} existe en localStorage.
function _hasNamespacedValue(baseKey, uuid) {
  return localStorage.getItem(`${baseKey}__${uuid}`) !== null;
}

// Supprime les 9 clés opérateur legacy sans vérification.
// Appelé uniquement depuis runUUIDCleanup() après validation complète.
function _removeLegacyOperatorKeys() {
  for (const key of _OPERATOR_KEYS) {
    try { localStorage.removeItem(key); } catch {}
  }
}

// Copie les données opérateur vers les clés namespacées.
// Idempotente : relançable si flag absent.
// Appelle identity.ensure() — crée l'identité si absente.
// Ne pose le flag que si toutes les copies ont réussi.
// Retourne true si la migration s'est exécutée, false si déjà faite ou erreur.
export function runUUIDMigration() {
  if (localStorage.getItem(_UUID_MIGRATION_FLAG) === '1') return false;

  const { uuid } = identity.ensure();

  for (const key of _OPERATOR_KEYS) {
    const ok = _copyLegacyKeyToUserKey(key, uuid);
    if (!ok) return false; // copie échouée — flag non posé, relançable
  }

  try {
    localStorage.setItem(_UUID_MIGRATION_FLAG, '1');
  } catch {
    return false; // copies effectuées mais flag non posé — relançable
  }
  return true;
}

// Supprime les clés legacy au 2e lancement post-migration.
// Conditions (toutes requises) :
//   1. runUUIDMigration() exécuté (flag présent)
//   2. runUUIDCleanup() pas encore exécuté
//   3. Pour chaque clé opérateur : namespacée présente OU legacy absente
// Retourne true si les clés ont été supprimées, false sinon.
export function runUUIDCleanup() {
  if (localStorage.getItem(_UUID_MIGRATION_FLAG) !== '1') return false;
  if (localStorage.getItem(_UUID_CLEANUP_FLAG)   === '1') return false;

  const id = identity.get();
  if (!id) return false; // identité absente — cas théoriquement impossible post-migration

  const { uuid } = id;

  for (const key of _OPERATOR_KEYS) {
    const legacyExists     = localStorage.getItem(key) !== null;
    const namespacedExists = _hasNamespacedValue(key, uuid);
    if (legacyExists && !namespacedExists) return false; // données sans couverture — abort
  }

  _removeLegacyOperatorKeys();
  localStorage.setItem(_UUID_CLEANUP_FLAG, '1');
  return true;
}
