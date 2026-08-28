// account-storage.js — Persistance locale du compte utilisateur
// Caméléon Engine · Compte Utilisateur V1 · LOT 2
//
// Clé CE_account_v1 : globale, intentionnellement non namespacée.
// Exception à la convention uuid-namespacée de storage.js :
//   Cette clé contient l'identité du compte Supabase (serverUUID = auth.uid()),
//   pas des données opérateur. Elle est partagée au niveau du navigateur,
//   indépendamment de l'appareil. L'exception est documentée ici.
//
// Schéma CE_account_v1 :
//   { serverUUID, localUUID, email, status, rgpdConsent, connectedAt }

import { identity } from '../storage.js';

const ACCOUNT_KEY = 'CE_account_v1';

// getAccountState() → objet état du compte ou null (non connecté / absent).
export function getAccountState() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// setAccountState(state) → true si écriture réussie.
export function setAccountState(state) {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// clearAccountState() → supprime CE_account_v1 (déconnexion / signOut).
export function clearAccountState() {
  try {
    localStorage.removeItem(ACCOUNT_KEY);
    return true;
  } catch {
    return false;
  }
}

// isPremium() — lecture locale synchrone. Jamais de réseau.
// Retourne false si CE_account_v1 absent (non connecté).
// Retourne false si status === 'disabled' (flag applicatif, accès mode gratuit).
// Retourne true uniquement si status === 'premium'.
export function isPremium() {
  return getAccountState()?.status === 'premium';
}

// getServerUUID() → auth.uid() stocké à la connexion, ou null.
// Utilisé par LOT 4B (session logging) comme guard de sécurité.
export function getServerUUID() {
  return getAccountState()?.serverUUID ?? null;
}

// getLocalUUID() — lit CE_identity_v1 via identity.get() de storage.js.
// Retourne null si l'identité locale est absente (appareil vierge non initialisé).
// Ne crée jamais l'identité — identity.ensure() appartient à storage.js.
export function getLocalUUID() {
  return identity.get()?.uuid ?? null;
}
