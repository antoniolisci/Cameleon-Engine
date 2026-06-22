// account-service.js — Service layer Compte Utilisateur V1
// Caméléon Engine · Compte Utilisateur V1 · LOT 2
//
// Initialisation : verifyMagicLink() doit être appelé avant render.js (D-PRE-03).
// Le module est un singleton ES module — account-service.js est importé une seule fois.
// Toutes les opérations réseau sont async et encapsulées dans try/catch.
// Aucune exception non capturée ne doit remonter dans le moteur.

import { supabase, REDIRECT_URL }                                        from './account-config.js';
import { emit, ACCOUNT_EVENTS }                                         from './account-events.js';
import { getAccountState, setAccountState, clearAccountState,
         getLocalUUID }                                                  from './account-storage.js';
import { KEYS }                                                          from '../storage.js';

// ── Rate limiting — magic link ────────────────────────────────────────────────
// Clé globale (non namespacée) : stocke la fenêtre glissante de 15 min.
// Protection côté client uniquement — Supabase applique son propre rate limiting.

const _RATE_LIMIT_KEY    = KEYS.magicLinkRateLimit;
const _RATE_LIMIT_MAX    = 3;
const _RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 min en ms

function _getRateLimit() {
  try {
    const raw = localStorage.getItem(_RATE_LIMIT_KEY);
    return raw ? JSON.parse(raw) : { count: 0, windowStart: 0 };
  } catch {
    return { count: 0, windowStart: 0 };
  }
}

function _setRateLimit(data) {
  try { localStorage.setItem(_RATE_LIMIT_KEY, JSON.stringify(data)); } catch {}
}

// Retourne true si l'envoi est autorisé dans la fenêtre courante.
function _checkRateLimit() {
  const { count, windowStart } = _getRateLimit();
  if (Date.now() - windowStart > _RATE_LIMIT_WINDOW) return true; // fenêtre expirée
  return count < _RATE_LIMIT_MAX;
}

function _incrementRateLimit() {
  const { count, windowStart } = _getRateLimit();
  const now = Date.now();
  if (now - windowStart > _RATE_LIMIT_WINDOW) {
    _setRateLimit({ count: 1, windowStart: now });
  } else {
    _setRateLimit({ count: count + 1, windowStart });
  }
}

// ── sendMagicLink(email) ──────────────────────────────────────────────────────
// Envoie un magic link via Supabase Auth (signInWithOtp).
// Retourne { success: boolean, error: string|null }
// error 'rate_limited' : fenêtre client dépassée (ne contacte pas Supabase).

export async function sendMagicLink(email) {
  if (!_checkRateLimit()) {
    return { success: false, error: 'rate_limited' };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: REDIRECT_URL,
      },
    });

    if (error) return { success: false, error: error.message };

    _incrementRateLimit();
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err?.message ?? 'network_error' };
  }
}

// ── _syncAccount(session) — privé ─────────────────────────────────────────────
// Synchronise la table accounts avec la session Supabase Auth active.
//
// Séquence (plan LOT 2 + correction B-01) :
//   1. local_uuid = getLocalUUID()  →  identity.get()?.uuid
//   2. Si null → ABORT + account:error { reason: 'local_uuid_missing' }
//      Circuit breaker : jamais de compte sans bridge UUID local.
//   3. UPSERT ON CONFLICT (id) DO NOTHING (ignoreDuplicates: true)
//      Conflit PK = reconnexion du même compte → 0 lignes retournées, pas d'erreur.
//   4. SELECT fallback si 0 lignes (conflit = compte existant).
//   5. Écriture CE_account_v1 + émission account:connected.
//
// accounts.id = session.user.id = auth.uid() → RLS opérationnelle.
// local_uuid n'est pas réécrit sur reconnexion (ON CONFLICT DO NOTHING).

async function _syncAccount(session) {
  const local_uuid = getLocalUUID();

  if (!local_uuid) {
    emit(ACCOUNT_EVENTS.ERROR, { reason: 'local_uuid_missing' });
    return;
  }

  try {
    // Upsert avec ignoreDuplicates : INSERT ON CONFLICT (id) DO NOTHING
    // Retourne la ligne insérée, ou 0 lignes si conflit (reconnexion).
    const { data: upsertedRows } = await supabase
      .from('accounts')
      .upsert(
        {
          id:           session.user.id,
          email:        session.user.email,
          local_uuid,
          rgpd_consent: true,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )
      .select();

    let row = upsertedRows?.[0] ?? null;

    // SELECT fallback : compte existant, DO NOTHING → 0 lignes retournées
    if (!row) {
      const { data: selected, error: selectError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (selectError || !selected) {
        emit(ACCOUNT_EVENTS.ERROR, {
          reason: 'sync_failed',
          detail: selectError?.message ?? 'select_returned_nothing',
        });
        return;
      }

      row = selected;
    }

    // Écriture CE_account_v1
    setAccountState({
      serverUUID:  row.id,
      localUUID:   local_uuid,
      email:       row.email,
      status:      row.status,
      rgpdConsent: row.rgpd_consent,
      connectedAt: new Date().toISOString(),
    });

    emit(ACCOUNT_EVENTS.CONNECTED, {
      email:      row.email,
      status:     row.status,
      serverUUID: row.id,
    });

  } catch (err) {
    emit(ACCOUNT_EVENTS.ERROR, {
      reason: 'sync_exception',
      detail: err?.message ?? 'unknown',
    });
  }
}

// ── verifyMagicLink() ─────────────────────────────────────────────────────────
// Souscrit à onAuthStateChange. Doit être appelé une seule fois au démarrage,
// avant render.js (D-PRE-03). Détecte automatiquement le token dans le fragment URL.
// SIGNED_IN  → _syncAccount() → account:connected (ou account:error)
// SIGNED_OUT → clearAccountState() → account:disconnected

export function verifyMagicLink() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      await _syncAccount(session);
    } else if (event === 'SIGNED_OUT') {
      clearAccountState();
      emit(ACCOUNT_EVENTS.DISCONNECTED, {});
    }
  });

  // Supabase v2 : après rechargement post-magic-link, le SDK émet INITIAL_SESSION
  // et non SIGNED_IN — _syncAccount() n'est pas appelé par le listener ci-dessus.
  // Vérification explicite au chargement : si session active et CE_account_v1 absent,
  // on déclenche _syncAccount() directement.
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session && !getAccountState()) {
      _syncAccount(session);
    } else if (!session && getAccountState()) {    // P1-A : état local périmé
      clearAccountState();
      emit(ACCOUNT_EVENTS.DISCONNECTED, {});
    }
  });

  // P1-B — validation au focus navigateur
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (!getAccountState()) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        clearAccountState();
        emit(ACCOUNT_EVENTS.DISCONNECTED, {});
      }
    });
  });
}

// ── getAccount() ──────────────────────────────────────────────────────────────
// Lecture synchrone de CE_account_v1. Retourne null si non connecté.
export function getAccount() {
  return getAccountState();
}

// ── signOut() ─────────────────────────────────────────────────────────────────
// Déconnexion locale immédiate + invalidation serveur best-effort.
// Ordre intentionnel : nettoyage local d'abord, réseau ensuite.
// Garantit que l'UI passe à 'disconnected' même si supabase.auth.signOut()
// est lent (lock interne SDK, latence réseau mobile).
export async function signOut() {
  clearAccountState();
  emit(ACCOUNT_EVENTS.DISCONNECTED, {});
  try {
    await supabase.auth.signOut();
  } catch {}
}
