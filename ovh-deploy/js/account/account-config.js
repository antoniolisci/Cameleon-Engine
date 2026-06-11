// account-config.js — Client Supabase singleton + constantes module account/
// Caméléon Engine · Compte Utilisateur V1 · LOT 2
//
// Prérequis vendor :
//   Télécharger le bundle ESM Supabase JS v2 et le placer dans ovh-deploy/js/vendor/ :
//   URL : https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm
//   Fichier attendu : ovh-deploy/js/vendor/supabase.esm.js
//
// Clé anon uniquement côté client — jamais la service_role_key.
// La service_role_key reste hors repo (dashboard Supabase uniquement).

import { createClient } from '../vendor/supabase.esm.js';

// ── Coordonnées du projet Supabase (Settings > API) ──────────────────────────
// À remplir avec les valeurs réelles du projet.
// La clé anon est conçue pour être publique (RLS protège les données).
const SUPABASE_URL      = 'https://rxxkneevcdshxiwezzoe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AZOWIYxRY2d4CcpgBRD0IA_lKLh4pTX';

// ── Constantes module ─────────────────────────────────────────────────────────

// URL de redirection après clic sur le magic link.
// Doit correspondre exactement à la "Redirect URL" configurée dans Supabase Auth.
export const REDIRECT_URL = 'https://cameleonengine.fr';

// Valeur affichée à l'utilisateur (informative uniquement — TTL réel configuré dans Supabase).
export const MAGIC_LINK_TTL_DISPLAY = '15 minutes';

// ── Client Supabase — singleton ───────────────────────────────────────────────
// Une seule instance dans tout le module account/.
// Importée par account-service.js — jamais recréée.

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
