// storage.js — Centralized localStorage API for Caméléon Engine.
// All persistence goes through this module. No raw localStorage calls elsewhere.

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
};

const SCHEMA_VERSION = 1;
const JOURNAL_LIMIT = 50;
const BACKUPS_LIMIT = 50;

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
      _wrap({ entries: arr.slice(-JOURNAL_LIMIT) })
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
    return _write(withUserKey(KEYS.importRegistry), _wrap({ imports }));
  },
  clear() {
    return _write(withUserKey(KEYS.importRegistry), _wrap({ imports: [] }));
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
  return Object.values(KEYS).reduce((acc, key) => {
    const raw = localStorage.getItem(key);
    return acc + (raw ? new Blob([raw]).size : 0);
  }, 0);
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

// Liste canonique des 9 clés opérateur à migrer (ARCH-N1).
// Clés globales exclues : CE_ui_state_v1, CE_payload_current_v1, CE_identity_v1, flags.
const _OPERATOR_KEYS = [
  'CE_journal_entries_v1',
  'CE_behavior_sessions_v1',
  'CE_import_registry_v1',
  'CE_backups_v1',
  'CE_settings_v1',
  'cameleon_behavior_memory_v1',
  'cameleon.behavior.v1.guardLevel',
  'cameleon.behavior.v1.guardLevelUpdatedAt',
  'cameleon.behavior.v1.orderStrategyProfile',
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
