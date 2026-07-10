// ingestion-registry.js — Registre générique d'ingestion V1
// Appartient exclusivement au Core d'ingestion (src/js/ingestion/).
// Maintient la liste des sources déjà ingérées pour garantir la déduplication (DT-2).
// Appelé uniquement par ingestion-core.js — jamais par les adaptateurs directement.
// LOT-P2-2.C §4 · LOT-P2-2.E §6
// Dépendance : storage.js (resolveKey)

import { resolveKey } from '../storage.js';

// Clé de base du registre d'ingestion (namespacing UUID via resolveKey)
const _REGISTRY_BASE_KEY = 'CE_ingestion_registry_v1';

// ─── Registre — lecture / écriture interne ────────────────────────────────────

function _readRegistry() {
  try {
    const raw = localStorage.getItem(resolveKey(_REGISTRY_BASE_KEY));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function _writeRegistry(registry) {
  try {
    localStorage.setItem(resolveKey(_REGISTRY_BASE_KEY), JSON.stringify(registry));
    return true;
  } catch {
    return false;
  }
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Retourne le registre d'ingestion complet.
 * Retourne un tableau vide si le registre est absent ou invalide.
 *
 * @returns {object[]}
 */
export function readRegistry() {
  return _readRegistry();
}

/**
 * Recherche une entrée par empreinte exacte.
 * Retourne l'entrée si trouvée, null sinon.
 *
 * @param {string} fingerprint
 * @returns {object | null}
 */
export function findByFingerprint(fingerprint) {
  if (typeof fingerprint !== 'string' || fingerprint.length === 0) return null;
  const registry = _readRegistry();
  return registry.find(e => e.fingerprint === fingerprint) ?? null;
}

/**
 * Ajoute une entrée valide dans le registre d'ingestion.
 * Le champ importedAt est généré par cette fonction (ISO 8601 UTC).
 * Le champ filename est interdit — utiliser sourceId.
 *
 * Validation défensive :
 *   - entrée absente ou non-objet → rejet
 *   - fingerprint absent ou non-string → rejet
 *   - sessionId absent ou non-string → rejet
 *   - sourceId absent ou non-string → rejet
 *   - traceCount absent, non entier ou négatif → rejet
 *   - fingerprint déjà présent dans le registre → rejet (DT-2)
 *
 * Immutabilité (RE3) : aucune entrée ne peut être modifiée ou supprimée.
 *
 * @param {{ fingerprint: string, sessionId: string, sourceId: string, traceCount: number }} entry
 * @returns {{ added: boolean, errors: string[] }}
 */
export function addEntry(entry) {
  // Validation : entrée absente ou invalide
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return { added: false, errors: ['addEntry : entrée invalide'] };
  }

  const errors = [];

  if (typeof entry.fingerprint !== 'string' || entry.fingerprint.length === 0) {
    errors.push('addEntry : fingerprint absent ou invalide');
  }
  if (typeof entry.sessionId !== 'string' || entry.sessionId.length === 0) {
    errors.push('addEntry : sessionId absent ou invalide');
  }
  if (typeof entry.sourceId !== 'string' || entry.sourceId.length === 0) {
    errors.push('addEntry : sourceId absent ou invalide');
  }
  if (
    typeof entry.traceCount !== 'number' ||
    !Number.isInteger(entry.traceCount) ||
    entry.traceCount < 0
  ) {
    errors.push('addEntry : traceCount absent, non entier ou négatif');
  }

  if (errors.length > 0) {
    return { added: false, errors };
  }

  // Déduplication : fingerprint déjà présent → rejet (DT-2)
  if (findByFingerprint(entry.fingerprint) !== null) {
    return { added: false, errors: ['REG-DUPLICATE : fingerprint déjà présent dans le registre'] };
  }

  // Construction de l'entrée persistée (importedAt généré par le registre)
  const persisted = {
    fingerprint: entry.fingerprint,
    sessionId:   entry.sessionId,
    sourceId:    entry.sourceId,
    importedAt:  new Date().toISOString(),
    traceCount:  entry.traceCount,
  };

  const registry = _readRegistry();
  const written = _writeRegistry([...registry, persisted]);

  if (!written) {
    return { added: false, errors: ['REG-WRITE-FAILED : écriture dans le registre impossible (stockage)'] };
  }

  return { added: true, errors: [] };
}
