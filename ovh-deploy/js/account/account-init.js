// account-init.js — Initialisation du service compte
// Caméléon Engine · Compte Utilisateur V1 · LOT 3
//
// Doit être chargé AVANT render.js (D-PRE-03) :
//   verifyMagicLink() souscrit à onAuthStateChange AVANT que render.js s'initialise.
//   Garantit que le token magic link dans l'URL est intercepté au premier chargement.

import { verifyMagicLink } from './account-service.js';

verifyMagicLink();
