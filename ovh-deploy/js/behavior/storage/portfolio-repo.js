// portfolio-repo.js — persistence layer for Portfolio V1 snapshots.
//
// Manages CE_portfolio_v1__{uuid} in localStorage.
// Pattern mirrors behavior-repo.js and importRegistry in storage.js.
//
// withUserKey() is internal to storage.js (not exported).
// Key resolution is reproduced locally using identity.get() — same approach as behavior-repo.js.
//
// No external API calls. No UI. No extraction logic.

import { identity } from '../../storage.js';

const STORAGE_KEY               = 'CE_portfolio_v1';
const PORTFOLIO_SNAPSHOTS_LIMIT = 50;
const SCHEMA_VERSION            = 1;

// ── Key resolution ─────────────────────────────────────────────────────────────
// CE_portfolio_v1__{uuid} when identity is present.
// CE_portfolio_v1 as grace fallback (mirrors withUserKey() behavior in storage.js).

function _resolveKey() {
  const id = identity.get();
  return id ? `${STORAGE_KEY}__${id.uuid}` : STORAGE_KEY;
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

function _now() {
  return new Date().toISOString();
}

// crypto.randomUUID() with RFC 4122 v4 fallback for older browsers.
function _generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function _read() {
  try {
    const raw = localStorage.getItem(_resolveKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function _write(data) {
  try {
    localStorage.setItem(_resolveKey(), JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// wallet_analyzer.js returns uniqueCoins as a sorted array in result.metrics.
// This helper handles both array (current) and number (defensive) gracefully.
function _getUniqueCoinsCount(metrics) {
  if (!metrics) return 0;
  const uc = metrics.uniqueCoins;
  if (Array.isArray(uc))       return uc.length;
  if (typeof uc === 'number')  return uc;
  return 0;
}

// ── getAll ─────────────────────────────────────────────────────────────────────
// Reads CE_portfolio_v1__{uuid} and returns the snapshots array.
// Returns [] if the key is absent, JSON is invalid, or snapshots is not an array.

export function getAll() {
  const data = _read();
  if (!data)                          return [];
  if (!Array.isArray(data.snapshots)) return [];
  return data.snapshots;
}

// ── append ─────────────────────────────────────────────────────────────────────
// Prepends snapshot to the existing list, applies FIFO 50, and writes to localStorage.
// Returns true on success, false if snapshot is invalid or write fails.

export function append(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const snapshots = getAll();
  snapshots.unshift(snapshot);
  return _write({
    version:   SCHEMA_VERSION,
    updatedAt: _now(),
    snapshots: snapshots.slice(0, PORTFOLIO_SNAPSHOTS_LIMIT),
  });
}

// ── clear ──────────────────────────────────────────────────────────────────────
// Resets the portfolio key to an empty snapshots list.
// Returns true on success, false on write failure.

export function clear() {
  return _write({
    version:   SCHEMA_VERSION,
    updatedAt: _now(),
    snapshots: [],
  });
}

// ── buildSnapshot ──────────────────────────────────────────────────────────────
// Constructs a PortfolioSnapshot object conforming to §3 of portfolio-v1-impl.md.
//
// result          : wallet import result from uploader.js
//                   { type:'wallet', metrics:{...}, summary:{activityLevel, feeIntensity, ...} }
// file            : File object (file.name, file.size)
// assets          : Asset[] from portfolio-extractor.js extract()
// duplicateWarning: boolean — true if doublon criteria were met (§7)
//
// Note on activityLevel / feeIntensity :
//   wallet_analyzer.js places these on result.summary, not result.metrics.
//   Both paths are checked defensively to remain correct if the schema evolves.

export function buildSnapshot(result, file, assets, duplicateWarning = false) {
  const now = _now();
  const m   = result?.metrics ?? {};
  const s   = result?.summary ?? {};

  return {
    snapshotId:    _generateUUID(),
    schemaVersion: SCHEMA_VERSION,
    createdAt:     now,
    importRef: {
      fileName:   file?.name ?? null,
      fileSize:   file?.size ?? 0,
      importedAt: now,
    },
    assets: Array.isArray(assets) ? assets : [],
    metrics: {
      totalOperations:  m.totalOperations  ?? 0,
      uniqueCoinsCount: _getUniqueCoinsCount(m),
      activityLevel:    m.activityLevel    ?? s.activityLevel ?? null,
      feeIntensity:     m.feeIntensity     ?? s.feeIntensity  ?? null,
    },
    duplicateWarning: Boolean(duplicateWarning),
  };
}
