// account-events.js — Événements du module account/
// Caméléon Engine · Compte Utilisateur V1 · LOT 2 / LOT 3
//
// Règle d'isolation : émission sur document uniquement.
// Aucun window.*, aucune variable globale.
// render.js écoute uniquement ces événements — zéro import account-service.js depuis render.js.

export const ACCOUNT_EVENTS = {
  // LOT 2 — authentification
  CONNECTED:          'account:connected',
  DISCONNECTED:       'account:disconnected',
  ERROR:              'account:error',
  PREMIUM_CHANGED:    'account:premium-changed',
  // LOT 3 — synchronisation cloud
  // SYNC_COMPLETE  : { state: string, localEmpty?: boolean, error?: string }
  // SYNC_ERROR     : { step: 'detect'|'restore', error: string }
  // CONFLICT_DETECTED : { localPayload: object, cloudPayload: object }
  SYNC_COMPLETE:      'account:sync-complete',
  SYNC_ERROR:         'account:sync-error',
  CONFLICT_DETECTED:  'account:conflict-detected',
};

// emit(event, data) — émet un CustomEvent sur document.
// data : objet quelconque, transmis dans event.detail.
export function emit(event, data = {}) {
  document.dispatchEvent(new CustomEvent(event, { detail: data }));
}

// on(event, handler) — souscrit à un événement account.
// handler reçoit l'événement natif ; accéder aux données via event.detail.
export function on(event, handler) {
  document.addEventListener(event, handler);
}

// off(event, handler) — désabonnement.
export function off(event, handler) {
  document.removeEventListener(event, handler);
}
