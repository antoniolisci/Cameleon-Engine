// Isolated storage wrapper for the behavior module.
// Namespace: cameleon.behavior.v1.*
// DO NOT use localStorage.clear() — only clear keys belonging to this module.
//
// ADU-04C : les 3 clés persistantes (guardLevel, guardLevelUpdatedAt, orderStrategyProfile)
// sont écrites et lues avec le suffix __{uuid} via identity.get().
// Les clés éphémères restent globales (NS + key, sans suffix).

import { identity } from '../../storage.js';

const NS = 'cameleon.behavior.v1.';

// Clés dont les données appartiennent à l'opérateur — namespacées par UUID.
const PERSISTENT_KEYS = new Set([
  'guardLevel',
  'guardLevelUpdatedAt',
  'orderStrategyProfile',
]);

// Retourne la clé localStorage résolue :
//   - clé persistante + UUID présent  → NS + key + '__' + uuid
//   - clé persistante + UUID absent   → NS + key (session de grâce)
//   - clé éphémère                    → NS + key (global, inchangé)
function _resolveKey(key) {
  if (!PERSISTENT_KEYS.has(key)) return NS + key;
  const id = identity.get();
  return id ? `${NS}${key}__${id.uuid}` : NS + key;
}

const behaviorRepo = {
  get(key) {
    try {
      const raw = localStorage.getItem(_resolveKey(key));
      return raw !== null ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(_resolveKey(key), JSON.stringify(value));
    } catch {
      // Quota exceeded or unavailable — fail silently.
    }
  },

  clear() {
    // startsWith(NS) capture les clés globales ET les clés namespacées
    // (cameleon.behavior.v1.guardLevel__{uuid} commence par cameleon.behavior.v1.).
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith(NS));
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
};

export { behaviorRepo };
