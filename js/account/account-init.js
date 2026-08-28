// account-init.js — Initialisation du service compte
// Caméléon Engine · Compte Utilisateur V1 · LOT 2 / LOT 3
//
// Doit être chargé AVANT render.js (D-PRE-03) :
//   verifyMagicLink() souscrit à onAuthStateChange AVANT que render.js s'initialise.
//   Garantit que le token magic link dans l'URL est intercepté au premier chargement.
//
// LOT 3 — ordre d'import obligatoire :
//   account-sync.js est importé AVANT verifyMagicLink() pour garantir que la
//   souscription top-level à account:connected est active avant tout événement CONNECTED.
//   verifyMagicLink() déclenche des opérations async — le premier CONNECTED ne peut pas
//   arriver avant que l'import synchrone de account-sync.js soit terminé.

import './account-sync.js';              // LOT 3 — orchestre la sync après connexion
import { verifyMagicLink } from './account-service.js';

verifyMagicLink();
