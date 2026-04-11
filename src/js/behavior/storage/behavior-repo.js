// Isolated storage wrapper for the behavior module.
// Namespace: cameleon.behavior.v1.*
// DO NOT use localStorage.clear() — only clear keys belonging to this module.

const NS = 'cameleon.behavior.v1.';

const behaviorRepo = {
  get(key) {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value));
    } catch {
      // Quota exceeded or unavailable — fail silently.
    }
  },

  clear() {
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith(NS));
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
};

export { behaviorRepo };
