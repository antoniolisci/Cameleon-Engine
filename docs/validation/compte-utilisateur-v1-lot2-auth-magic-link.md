# Compte Utilisateur V1 — LOT 2 : Authentification Magic Link Supabase

## 1. Périmètre LOT 2

LOT 2 couvre uniquement l'authentification utilisateur via Supabase Magic Link. Aucune synchronisation cloud des données opérateur. Aucun Supabase Storage.

| Fonctionnalité | Statut |
|---|---|
| Envoi Magic Link (email) | Livré |
| Réception et clic Magic Link | Livré |
| Synchronisation table `accounts` (UPSERT + SELECT fallback) | Livré |
| Affichage état connecté / non connecté dans UI | Livré |
| Déconnexion `signOut()` | Livré + correctif `437de9f` |
| Persistence session après reload | Livré |

**Hors périmètre LOT 2 (reporté) :**
- Supabase Storage / sync cloud données opérateur (LOT 3+)
- Chiffrement transport données (LOT 4B)
- Détection cross-device automatique (LOT 3)
- Template email Supabase en français (dette EMAIL-FR-01)

## 2. Fichiers livrés

| Fichier | Rôle |
|---|---|
| `src/js/account/account-config.js` | URL Supabase, anon key, REDIRECT_URL |
| `src/js/account/account-service.js` | sendMagicLink, verifyMagicLink, signOut, _syncAccount |
| `src/js/account/account-storage.js` | getAccountState, setAccountState, clearAccountState, getLocalUUID |
| `src/js/account/account-events.js` | ACCOUNT_EVENTS, emit, on, off |
| `src/js/account/account-ui.js` | Rendu UI : formulaire / pending / connecté, gestion onglet Compte |
| `src/js/account/account-init.js` | Point d'entrée : appelle verifyMagicLink() avant render.js (D-PRE-03) |
| `src/js/vendor/supabase.esm.js` | SDK Supabase bundlé (vendorisé, sans npm) |

Les fichiers `src/` et `ovh-deploy/` sont identiques pour chaque module. La synchronisation est manuelle — toute modification de `src/` doit être répercutée dans `ovh-deploy/`.

## 3. Architecture technique

### 3.1 Flux Magic Link

```
sendMagicLink(email)
  → supabase.auth.signInWithOtp({ email, shouldCreateUser: true, emailRedirectTo })
  → email reçu → clic lien → retour cameleonengine.fr avec token URL fragment
  → SDK détecte token → onAuthStateChange(SIGNED_IN, session)
  → _syncAccount(session)
      → getLocalUUID()              [CE_identity_v1.uuid]
      → UPSERT accounts ON CONFLICT (id) DO NOTHING
      → SELECT fallback si 0 lignes  [reconnexion compte existant]
      → setAccountState(CE_account_v1)
      → emit(account:connected)
  → account-ui.js : _uiState = 'connected' → render()
```

### 3.2 Flux déconnexion

```
signOut()                                [account-service.js]
  → clearAccountState()                  // CE_account_v1 supprimé immédiatement
  → emit(ACCOUNT_EVENTS.DISCONNECTED)   // UI passe à 'disconnected' immédiatement
  → await supabase.auth.signOut()       // invalidation serveur — best-effort, try/catch silencieux
```

Ordre intentionnel : nettoyage local en premier, réseau ensuite. Détail du bug et du correctif en §4.

### 3.3 Persistence session (reload)

`verifyMagicLink()` appelle `supabase.auth.getSession()` au chargement de la page :

| Condition | Comportement |
|---|---|
| Session active + `CE_account_v1` absent | `_syncAccount()` → réécrit l'état (P1-A) |
| Session absente + `CE_account_v1` présent | `clearAccountState()` + `emit(DISCONNECTED)` — état périmé (P1-A) |
| Changement de visibilité (retour onglet) | `getSession()` → si session absente → déconnexion (P1-B) |

### 3.4 Bridge local_uuid ↔ Supabase

`CE_identity_v1.uuid` (UUID local généré au premier boot de l'appareil) est écrit dans `accounts.local_uuid` à la première connexion. Il n'est jamais réécrit sur les reconnexions suivantes (`ON CONFLICT (id) DO NOTHING`).

Ce bridge constitue le lien permanent entre l'identité locale de l'appareil et le compte Supabase Auth.

### 3.5 RLS Supabase

| Opération | Policy | Résultat observé |
|---|---|---|
| SELECT non authentifié | `auth.uid() = id` | Retourne `[]` — accès refusé ✓ |
| INSERT authentifié | `auth.uid() = id` | Ligne créée ✓ |
| SELECT authentifié (fallback reconnexion) | `auth.uid() = id` | Ligne retournée ✓ |

### 3.6 Rate limiting Magic Link

`CE_magic_link_rl_v1` — clé globale (non namespacée) : fenêtre glissante 15 min / 3 envois max. Protection client uniquement. Supabase applique son propre rate limiting côté serveur indépendamment.

## 4. Correctif LOT 2 — signOut()

**Commit :** `437de9f`

**Symptôme terrain :** Clic "Déconnexion" sans effet visible. UI reste bloquée sur "Connecté" (observé PC Chrome, iPad Chrome).

**Cause :** Dans `account-service.js`, `clearAccountState()` et `emit(ACCOUNT_EVENTS.DISCONNECTED)` étaient positionnés après `await supabase.auth.signOut()`. Le SDK Supabase acquiert un lock interne avant tout appel réseau. Si ce lock est retardé ou si la latence réseau est élevée, le `await` bloque indéfiniment — `clearAccountState()` et `emit(DISCONNECTED)` ne sont jamais atteints.

**Code avant correctif :**
```javascript
export async function signOut() {
  try {
    await supabase.auth.signOut();   // bloquant
  } catch {}
  clearAccountState();               // jamais atteint si await hang
  emit(ACCOUNT_EVENTS.DISCONNECTED, {});
}
```

**Code après correctif :**
```javascript
export async function signOut() {
  clearAccountState();                    // CE_account_v1 supprimé immédiatement
  emit(ACCOUNT_EVENTS.DISCONNECTED, {}); // UI passe à 'disconnected' immédiatement
  try {
    await supabase.auth.signOut();        // best-effort réseau, silencieux si échoue
  } catch {}
}
```

**Fichiers modifiés :** `src/js/account/account-service.js` + `ovh-deploy/js/account/account-service.js` (identiques).

## 5. Validation terrain — PC Chrome (2026-06-22)

**Environnement :** PC portable, navigateur Chrome, site cameleonengine.fr (CDN Fastly via gh-pages).

### 5.1 Connexion initiale

| Étape | Résultat |
|---|---|
| Ouverture cameleonengine.fr | Panneau Compte affiche "Connecté" (session existante) |
| Email affiché | antonio.lisci@gmail.com |
| Badge statut | GRATUIT |

### 5.2 Déconnexion

| Étape | Résultat |
|---|---|
| Clic "Déconnexion" | UI passe immédiatement au formulaire "NON CONNECTÉ" |
| Délai observé | Immédiat (< 200 ms) |
| F5 × 5 après déconnexion | État reste "NON CONNECTÉ" à chaque reload |

### 5.3 Reconnexion

| Étape | Résultat |
|---|---|
| Saisie email + acceptation CGU/confidentialité | Bouton "Recevoir mon lien de connexion" actif |
| Clic envoi | État "Lien envoyé ✓" affiché |
| Email reçu | Magic link reçu en boîte mail |
| Clic "Sign in" dans email | Redirection vers cameleonengine.fr |
| État après retour | "Connecté", email affiché, badge GRATUIT |
| F5 × 5 après reconnexion | État reste "CONNECTÉ" à chaque reload |

### 5.4 Infrastructure Supabase (audit)

| Élément | Résultat |
|---|---|
| Table `accounts` | Ligne présente : id, email, local_uuid, rgpd_consent ✓ |
| RLS SELECT non authentifié | Retourne `[]` — accès refusé ✓ |
| Bridge `local_uuid` | Colonne renseignée dans `accounts` ✓ |

## 6. Limites connues

| Référence | Description | Impact | Priorité |
|---|---|---|---|
| EMAIL-FR-01 | Template email Supabase en anglais ("Sign in", "Confirm your signup") | UX/brand — lien cliquable et fonctionnel | Basse |
| CSS-AC-01 | Classes `ac-*` absentes de `style.css` — layout navigateur par défaut | Visuel — UI fonctionnelle sans styles dédiés | Optionnelle |
| TTL-CHECK-01 | Durée "15 minutes" affichée dans l'UI non cross-vérifiée avec la config Supabase Dashboard | Informatif — pas d'impact fonctionnel connu | Basse |

**Navigateur testé :** Chrome uniquement (PC portable). Safari iOS non testé sur ce LOT.

## 7. Commits LOT 2

| Commit | Message |
|---|---|
| *(pré-existants avant ouverture LOT 2)* | account-config.js · account-service.js · account-storage.js · account-events.js · account-ui.js · account-init.js · vendor/supabase.esm.js intégrés dans src/ et ovh-deploy/ |
| `437de9f` | fix(account): signOut — déconnexion locale immédiate avant appel réseau Supabase |

## 8. Décisions architecturales

| Décision | Justification |
|---|---|
| LOT 2 = authentification uniquement (DO-LOT2-02) | Périmètre minimal — sync cloud données opérateur reportée, pas de dépendance Supabase Storage |
| Nettoyage local avant appel réseau dans `signOut()` | UI réactive indépendamment du réseau — invalidation serveur best-effort |
| `CE_account_v1` non namespacée par UUID | Clé d'identité navigateur partagée indépendamment de l'UUID opérateur — exception documentée dans account-storage.js |
| `ON CONFLICT (id) DO NOTHING` + SELECT fallback | Reconnexion propre sans doublon — `local_uuid` jamais réécrit sur reconnexion |
| `shouldCreateUser: true` dans `signInWithOtp` | Création automatique du compte Supabase à la première connexion — pas d'étape d'inscription séparée |
| `account-init.js` chargé avant `render.js` (D-PRE-03) | `verifyMagicLink()` doit souscrire à `onAuthStateChange` avant que render.js s'initialise — garantit l'interception du token magic link au premier chargement |
