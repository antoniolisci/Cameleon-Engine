// storage.js — Centralized localStorage API for Caméléon Engine.
// All persistence goes through this module. No raw localStorage calls elsewhere.

export const KEYS = {
  settings: 'CE_settings_v1',
  payloadCurrent: 'CE_payload_current_v1',
  journalEntries: 'CE_journal_entries_v1',
  behaviorSessions: 'CE_behavior_sessions_v1',
  importRegistry: 'CE_import_registry_v1',
  uiState: 'CE_ui_state_v1',
  backups: 'CE_backups_v1',
};

const SCHEMA_VERSION = 1;
const JOURNAL_LIMIT = 50;
const BACKUPS_LIMIT = 50;

// ── Core I/O ──────────────────────────────────────────────────

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
    return _read(KEYS.settings)?.data ?? {};
  },
  set(data) {
    return _write(KEYS.settings, _wrap({ data }));
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
    return _read(KEYS.journalEntries)?.entries ?? [];
  },
  setAll(arr) {
    return _write(
      KEYS.journalEntries,
      _wrap({ entries: arr.slice(-JOURNAL_LIMIT) })
    );
  },
  clear() {
    return _write(KEYS.journalEntries, _wrap({ entries: [] }));
  },
};

// ── Behavior sessions ─────────────────────────────────────────

export const behaviorSessions = {
  getAll() {
    return _read(KEYS.behaviorSessions)?.sessions ?? [];
  },
  setAll(sessions) {
    return _write(KEYS.behaviorSessions, _wrap({ sessions }));
  },
  clear() {
    return _write(KEYS.behaviorSessions, _wrap({ sessions: [] }));
  },
};

// ── Import registry ───────────────────────────────────────────

export const importRegistry = {
  getAll() {
    return _read(KEYS.importRegistry)?.imports ?? [];
  },
  append(entry) {
    const imports = this.getAll();
    imports.unshift(entry);
    return _write(KEYS.importRegistry, _wrap({ imports }));
  },
  clear() {
    return _write(KEYS.importRegistry, _wrap({ imports: [] }));
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
    return _read(KEYS.backups)?.snapshots ?? [];
  },
  prepend(snap) {
    const snapshots = this.getAll();
    snapshots.unshift(snap);
    return _write(
      KEYS.backups,
      _wrap({ snapshots: snapshots.slice(0, BACKUPS_LIMIT) })
    );
  },
  clear() {
    return _remove(KEYS.backups);
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
