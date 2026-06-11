# Compte Utilisateur V1 — Plan d'implémentation

**Caméléon Engine · Document d'architecture**
**Date : 2026-06-11 · Statut : FINAL PRÉ-COMMIT — VERSION 2.1**

> Ce document est le plan d'implémentation officiel du Compte Utilisateur V1.
> Il intègre le plan initial, l'audit architectural critique, la restructuration V2.0,
> et les corrections post-audit V2.1.
>
> Aucun code. Aucun fichier src/. Planification uniquement.

---

## Historique

| Version | Date | Nature |
|---------|------|--------|
| V1.0 | 2026-06-11 | Plan initial — 10 lots |
| V1.1 | 2026-06-11 | Audit critique — 8 corrections identifiées |
| V2.0 | 2026-06-11 | Plan restructuré — 13 lots · décisions préalables fermées |
| V2.1 | 2026-06-11 | Corrections post-audit — B-01 à B-06 résolus · schéma aligné avec codebase |

---

## Documents connexes

- `user_account_v1_execution_architecture.md` — architecture d'exécution (GELÉE)
- `user_account_v1_pre_implementation_checklist.md` — checklist GO/NO GO 76 cases
- `freemium_matrix_v1.md` — frontière Gratuit/Premium Option B
- `uuid_migration_scope_v1.md` — migration UUID Option C progressive consentie
- `magic_link_ttl_v1.md` — TTL 15 min, usage unique, rate limiting 3/15 min
- `smtp_provider_v1.md` — Postmark, SES rejeté, Resend repli
- `server_provider_v1.md` — Supabase, Firebase rejeté, PocketBase repli

---

## Section 0 — Décisions préalables fermées

Trois décisions architecturales fermées avant tout premier commit. Elles ne peuvent pas être modifiées sans audit complet des lots qui en dépendent.

---

### D-PRE-01 — Mécanisme `isPremium()` *(FERMÉE — 2026-06-11)*

**Décision : champ `status` dans la table `accounts`.**

| Paramètre | Valeur |
|-----------|--------|
| Champ | `status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'premium', 'disabled'))` |
| Qui écrit | Admin uniquement, via service_role. Jamais depuis le client. |
| Qui lit | `account-service.js` au moment de `getAccount()` |
| Cache client | `CE_account_v1` (localStorage global, non namespacé) — champ `status` inclus |
| Invalidation | À chaque reconnexion (nouveau magic link → réécriture de `CE_account_v1`) |
| Changement en cours de session | Non pris en compte avant la prochaine reconnexion — acceptable V1, documenté dans Admin Bootstrap |

**Règle permanente :** `isPremium()` lit `CE_account_v1.status === 'premium'`. Si `CE_account_v1` est absent (utilisateur non connecté), `isPremium()` retourne `false`. Jamais d'appel réseau dans `isPremium()` — lecture locale synchrone uniquement.

**Comportement `status = 'disabled'` :** flag applicatif uniquement. Supabase Auth n'est pas désactivé — l'utilisateur peut recevoir un magic link et s'authentifier. Dans l'application, `isPremium()` retourne `false` ; l'outil fonctionne en mode gratuit. L'admin peut réactiver via `status = 'free'` ou `'premium'`. Blocage Supabase Auth = hors périmètre V1.

---

### D-PRE-02 — Multi-device V1 *(FERMÉE — 2026-06-11)*

**Décision : multi-device inclus en V1. Synchronisation bidirectionnelle différée V1.1.**

Ce que V1 couvre :
- Sessions loggées depuis n'importe quel appareil connecté → écrites côté serveur sous le même `account_id`
- Mémoire longue serveur lisible depuis n'importe quel appareil connecté (CU-05)
- Chaque appareil conserve son propre localStorage — aucune synchronisation entre locaux

Ce que V1 ne couvre pas :
- Sync automatique du localStorage de l'appareil A vers l'appareil B
- Résolution de conflits entre sessions locales de deux appareils

**Impact sur LOT 4B :** le logging serveur écrit sous `account_id` sans contrôle d'unicité d'appareil. `local_session_id` est le garde idempotent.

**Impact sur CU-05 :** connexion depuis nouvel appareil → localStorage vide → aucune proposition de migration → mémoire longue serveur accessible immédiatement.

---

### D-PRE-03 — Ordre d'initialisation *(FERMÉE — 2026-06-11)*

**Séquence d'initialisation exacte dans `index.html` :**

```
1. account-config.js   — client Supabase initialisé (synchrone, singleton)
2. account-service.js  — souscription onAuthStateChange active
                         → si token dans URL : verifyMagicLink() automatique
                         → écriture CE_account_v1
                         → émission account:connected ou account:error
3. [modules moteur — data.js, state.js, engine.js, ...]
4. render.js           — initialisation UI moteur
                         → écoute account:connected via account-events.js
                         → mise à jour indicateur connexion header uniquement
5. account-ui.js       — rendu panel compte
                         → lit CE_account_v1 pour afficher l'état courant
```

**Règle :** `render.js` n'importe jamais `account-service.js`. Il écoute uniquement `account-events.js`. Toute logique compte est dans `account-ui.js`.

**Traitement callback magic link :** Supabase Auth gère le token dans le fragment URL (`#access_token=...`) à l'initialisation du client. `account-service.js` souscrit à `onAuthStateChange` avant que `render.js` s'initialise — la détection du token est garantie avant tout rendu UI.

---

## Section 1 — Découpage final des lots

**13 lots. Ordre non négociable.**

---

### LOT 0 — Fondations infrastructure *(non-code)*

**Périmètre :**
- Domaine actif avec HTTPS valide (certificat non auto-signé)
- Projet Supabase créé : Auth activé, Magic Link configuré (TTL 15 min, usage unique)
- Compte Postmark créé, domaine d'envoi vérifié, template magic link rédigé
- Variables sensibles isolées hors repo (`service_role_key`, Postmark API key) — méthode d'injection documentée
- Documents légaux existants et accessibles publiquement (mentions légales, CGU, politique de confidentialité)

**Aucun fichier `.js` créé dans ce lot. Aucun commit de code.**

**Checklist couverte :** A1, A3, C1, C2, C3

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| `service_role_key` dans le repo | Critique | Vérifier `.gitignore` avant toute configuration |
| Domaine non vérifié côté Postmark | Élevé | Tester un envoi réel avant de clore le lot |
| HTTPS manquant | Élevé | Supabase Auth rejette les redirections non-HTTPS |

**Critères de validation :**
- Email magic link de test reçu en boîte en moins de 60 secondes
- HTTPS valide sur le domaine final
- `git log --all -- "*service_role*" "*postmark*"` → zéro résultat
- Les 3 documents légaux sont accessibles à des URLs publiques stables

---

### LOT 1A — Schéma minimal opérationnel *(premier commit de code)*

**Fichier :** `supabase/migrations/001_core_schema.sql`

**Table `accounts` :**
- `id UUID PRIMARY KEY` — **valeur fournie à l'INSERT depuis `auth.uid()`, pas de `DEFAULT gen_random_uuid()`** (correction B-01)
- `email TEXT UNIQUE NOT NULL`
- `local_uuid TEXT NOT NULL` — **pas de contrainte UNIQUE** (correction B-03) : `local_uuid` est un identifiant d'appareil (`CE_identity_v1`). Plusieurs comptes créés depuis le même navigateur partagent le même `local_uuid` — comportement attendu et supporté. Le bridge principal repose sur `accounts.id = auth.uid()`.
- `status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'premium', 'disabled'))` (correction A-01)
- `rgpd_consent BOOLEAN NOT NULL DEFAULT false`
- `created_at TIMESTAMPTZ DEFAULT now()`

**Table `sessions_moteur` :**
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `account_id UUID REFERENCES accounts(id) ON DELETE CASCADE`
- `local_session_id TEXT NOT NULL`
- `payload JSONB NOT NULL`
- `schema_version INTEGER NOT NULL DEFAULT 1`
- `created_at TIMESTAMPTZ DEFAULT now()`
- CONSTRAINT `UNIQUE (local_session_id, account_id)` — obligatoire pour l'idempotence

**Table `sessions_comportementales` :** structure identique à `sessions_moteur`.

**RLS policies — corrigées (B-01) :**
- `accounts` : `auth.uid() = id` — l'utilisateur accède uniquement à sa propre ligne
- `sessions_moteur` : `auth.uid() = account_id`
- `sessions_comportementales` : `auth.uid() = account_id`
- Admin via `service_role` bypass RLS sur toutes les tables

**Index de performance :**
- `sessions_moteur(account_id, created_at DESC)`
- `sessions_comportementales(account_id, created_at DESC)`

**Dépend de :** LOT 0 validé

**Checklist couverte :** C3, D1, D2, D3

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| `accounts.id` INSERT sans `auth.uid()` valide | Critique | Guard dans `_syncAccount()` : aborter si session nulle |
| RLS trop permissive → fuite inter-comptes | Critique | Test RLS : JWT compte A → 0 lignes pour compte B |
| `UNIQUE (local_session_id, account_id)` absent — point de non-retour | Critique | Déclarée dans la migration, testée avant clôture |
| Migration non idempotente | Moyen | Tester un rejeu à blanc |

**Critères de validation :**
- `INSERT INTO accounts (id, email, ...) VALUES (auth.uid(), ...)` fonctionne avec un JWT valide
- RLS : JWT compte A → 0 lignes sessions compte B (test explicite)
- INSERT avec `local_session_id` dupliqué → erreur de contrainte (comportement attendu)
- Migration SQL rejouée sans erreur (idempotente)
- Deux comptes créés depuis le même navigateur : deux lignes avec même `local_uuid`, deux `id` distincts — pas d'erreur (comportement attendu B-03)

---

### LOT 1B — Schéma RGPD

**Fichier :** `supabase/migrations/002_rgpd_schema.sql`

**Dépend de :** LOT 1A validé (FK vers `accounts`). Peut démarrer en parallèle de LOT 2.

**Table `rgpd_requests` :**
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `account_id UUID REFERENCES accounts(id) ON DELETE SET NULL` — **SET NULL, pas CASCADE** (correction R-04) : la demande de suppression persiste comme trace d'audit après suppression du compte
- `type TEXT NOT NULL CHECK (type IN ('export', 'delete'))`
- `status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed'))`
- `created_at TIMESTAMPTZ DEFAULT now()`
- `processed_at TIMESTAMPTZ`

**Table `admin_log` :**
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `account_id UUID` — **pas de FK** : l'entrée d'audit survit à toute suppression de compte
- `action TEXT NOT NULL`
- `operator TEXT NOT NULL`
- `created_at TIMESTAMPTZ DEFAULT now()`

**Fonction `export_user_data()` — corrigée (B-02) :**

```
SECURITY INVOKER — pas de paramètre p_account_id
Retourne les données de auth.uid() uniquement
Appelable depuis le client authentifié via supabase.rpc('export_user_data')
Appelable via service_role (bypass RLS) pour les opérations admin
```

Comportement côté client : `supabase.rpc('export_user_data')` avec JWT → données personnelles uniquement, isolation garantie par RLS.
Comportement côté admin : appel via service_role depuis le dashboard Supabase (SQL editor) — pas de fonction dédiée `admin_export_user_data()` en V1 (voir LOT 7).

**Fonction `delete_user_data(p_account_id UUID)` :**
- Exécutable via `service_role` uniquement (admin)
- Insère dans `admin_log` **avant** la suppression, dans la même transaction
- Suppression en cascade : `sessions_*` → `accounts`
- `rgpd_requests` : `account_id` mis à `NULL` (demande conservée comme trace)
- Idempotente : rejouable sans erreur si le compte n'existe plus

**Checklist couverte :** B (RGPD), E (pipeline admin), F2 (export serveur garanti)

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| `export_user_data()` incomplète si une table est ajoutée ultérieurement | Élevé | Vérifier la liste des tables dans la fonction avant chaque nouveau lot qui en crée une |
| `delete_user_data()` sans transaction → suppression partielle | Élevé | Wrapper dans `BEGIN; ... COMMIT;` avec rollback sur erreur |
| `admin_log` supprimée par erreur | Élevé | Pas de FK sur `admin_log.account_id` |

**Critères de validation :**
- `supabase.rpc('export_user_data')` avec JWT utilisateur A → données de A uniquement
- `supabase.rpc('export_user_data')` avec JWT utilisateur B → données de B uniquement (isolation)
- `delete_user_data(account_id)` : zéro ligne dans `accounts` et `sessions_*` · ligne `admin_log` présente · ligne `rgpd_requests` avec `account_id = NULL`
- `delete_user_data()` rejouée → aucune erreur

---

### LOT 2 — Module `account/` *(service layer)*

**Dossier :** `src/js/account/` — isolation stricte

**Règle fondatrice :** zéro import depuis `render.js`, `engine.js`, `decision.js`, `trading-policy.js`, `moteur.js`. Le module est autonome.

**Dépend de :** LOT 1A validé, D-PRE-01, D-PRE-02, D-PRE-03 fermées

---

**`account-config.js`**
- Client Supabase initialisé avec la clé anon et l'URL du projet (singleton)
- Constantes : URL de redirection après magic link, TTL affiché (15 min)
- Export du client Supabase — unique instance dans tout le module

**`account-events.js`**
- `emit(event, data)` — wrapper `CustomEvent` sur `document`
- Événements : `account:connected` · `account:disconnected` · `account:error` · `account:premium-changed`
- Aucun `window.*`, aucun global

**`account-storage.js`**
- Clé `CE_account_v1` — globale, non namespacée
- Exception à la convention namespacée documentée en commentaire : contient l'identité globale du compte, pas des données opérateur
- `getAccountState()` → `{ email, status, serverUUID, localUUID, rgpdConsent, connectedAt }` ou `null`
- `setAccountState(state)` · `clearAccountState()`
- `isPremium()` → `getAccountState()?.status === 'premium'` — synchrone, jamais réseau
- Si `CE_account_v1` absent (non connecté) ou `status = 'disabled'` → `isPremium()` retourne `false`
- `getServerUUID()` → `getAccountState()?.serverUUID` ou `null`
- `getLocalUUID()` → `identity.get()?.uuid` depuis `CE_identity_v1` via `identity` de `storage.js`

**`account-service.js`**

- `sendMagicLink(email)` → appel Supabase Auth · rate limiting client (3 envois / 15 min, timestamp stocké) · retourne `{ success, error }`
- `verifyMagicLink()` → souscription `onAuthStateChange` · si `SIGNED_IN` : appel `_syncAccount(session)` · émission `account:connected`
- `getAccount()` → lecture `CE_account_v1` (synchrone)
- `signOut()` → `supabase.auth.signOut()` · `clearAccountState()` · émission `account:disconnected`

**`_syncAccount(session)` — corrigée (B-01 + R-01) :**

```
Séquence :
1. local_uuid = getLocalUUID()  →  identity.get()?.uuid
2. Si local_uuid null ou absent → ABORT + émission account:error
   (circuit breaker : jamais de compte sans bridge)
3. INSERT INTO accounts (id, email, local_uuid, rgpd_consent)
   VALUES (session.user.id, session.user.email, local_uuid, true)
   ON CONFLICT (id) DO NOTHING
   — conflict sur PK (id = auth.uid()) = reconnexion du même utilisateur
4. SELECT fallback (R-01) :
   Si INSERT retourne une ligne → utiliser cette ligne
   Si INSERT ne retourne rien (conflit) → SELECT * FROM accounts WHERE id = $1
5. Écrire CE_account_v1 : { serverUUID: session.user.id, localUUID: local_uuid,
                             status, email, rgpdConsent, connectedAt }
```

**Note :** le conflit est sur `id` (PK = `auth.uid()`). La reconnexion déclenche le SELECT fallback. Le `local_uuid` stocké lors de la première création n'est pas réécrit sur reconnexion.

Toutes les opérations réseau : async, encapsulées dans try/catch — aucune exception non capturée.

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| `isPremium()` appelée avant `CE_account_v1` chargé | Moyen | Comportement attendu : retourne `false` si état absent |
| Client Supabase initialisé plusieurs fois | Élevé | `account-config.js` exporte un singleton |
| Race condition Auth valide / `accounts` INSERT échoué (R-02) | Élevé | Le logging échoue silencieusement (FK violation) — cohérent offline-first. La ligne `accounts` est créée à la prochaine connexion active. |

**Critères de validation :**
- `_syncAccount()` avec `local_uuid` null → `account:error` émis, aucune ligne dans `accounts`
- Reconnexion (même `auth.uid()`) → SELECT fallback fonctionne, `CE_account_v1` réécrit
- `isPremium()` retourne `false` si `CE_account_v1` absent
- `isPremium()` retourne `true` si `CE_account_v1.status === 'premium'` (injecté manuellement)
- `isPremium()` retourne `false` si `CE_account_v1.status === 'disabled'`
- `grep -r "from.*account" src/js/engine.js src/js/decision.js src/js/trading-policy.js src/js/moteur.js` → zéro résultat

---

### LOT 2.5 — Admin Bootstrap

**Raison d'existence :** sans visibilité sur les comptes créés, les LOT 3, 4A, 4B, 5 se déroulent à l'aveugle.

**Dépend de :** LOT 2 validé. Doit précéder LOT 3.

**Périmètre :**

Interface admin minimale — gate service_role, jamais exposée dans `index.html`.

- Liste des comptes : email · status · local_uuid · created_at — lecture seule
- Compteur comptes actifs
- Action désactiver / réactiver (écriture du champ `status`)
- Note visible dans l'interface : *"Désactiver un compte = flag applicatif uniquement. L'utilisateur peut toujours se connecter en mode gratuit. Le changement de statut est pris en compte à la prochaine reconnexion."* (R-03)

**Hors périmètre :** traitement RGPD, journal audit, suppression — différés à LOT 7.

**Contrainte :** l'interface admin ne dépend pas de `account-ui.js`. Outil indépendant.

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| Interface admin accessible sans auth forte | Critique | Gate service_role obligatoire avant toute mise en ligne |
| Action désactiver sans confirmation → erreur humaine | Moyen | Saisie email obligatoire avant écriture |

**Critères de validation :**
- Un compte créé en LOT 3 (test) est visible dans l'Admin Bootstrap
- Changement de statut `free` → `premium` et réciproquement : opérationnel
- JWT utilisateur normal → aucun accès à l'interface admin

---

### LOT 3 — Interface Magic Link *(UI compte)*

**Dépend de :** LOT 2.5 validé, D-PRE-03 confirmée.

**Périmètre :**

Nouveau panel dans `src/index.html` (section dédiée — jamais dans les tabs Moteur/Pilotage/Mémoire) + `src/js/account/account-ui.js`.

Éléments UI :
- Formulaire email + bouton "Recevoir mon lien de connexion"
- Checkbox RGPD consent obligatoire + lien CGU + lien politique de confidentialité (vérifiés en LOT 0)
- État d'attente : "Lien envoyé — valide 15 minutes" + bouton désactivé pendant rate limit
- État connecté : email · statut (Gratuit / Premium) · bouton déconnexion
- Message frontière freemium visible dès J0 : "Vos 50 dernières sessions sont conservées sur cet appareil. La mémoire longue au-delà de cet appareil est premium."
- Gestion callback URL : `account-service.js` détecte le token via `onAuthStateChange` · `account-ui.js` réagit à `account:connected`

**Règle :** `account-ui.js` appelle `account-service.js` et réagit à `account-events.js`. Zéro logique métier dans `account-ui.js`.

**Règle render.js :** écoute `account:connected` et `account:disconnected` uniquement pour un indicateur de connexion dans le header. Zéro logique compte dans `render.js`.

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| Callback magic link non intercepté si `render.js` précède `account-service.js` | Élevé | D-PRE-03 garantit l'ordre — vérifier à l'implémentation |
| Checkbox RGPD non enregistrée si réseau coupe entre création et INSERT | Moyen | `_syncAccount()` inclut `rgpd_consent: true` — comportement retry à la reconnexion |
| Panel compte en conflit avec tabs existants | Moyen | Section dédiée dans `index.html`, séparée des tabs |

**Critères de validation :**
- Parcours CU-02 complet : email → magic link → clic → connexion → affichage statut
- Checkbox RGPD obligatoire — formulaire bloqué sans elle
- `accounts.rgpd_consent = true` dans Supabase après création
- Rechargement de page → état connecté persisté
- Liens CGU et politique de confidentialité fonctionnels

---

### LOT 4A — Validation UUID Bridge *(risque primaire — bloque 4B, 5, 6)*

**Dépend de :** LOT 3 validé.

**Raison d'existence :** le bridge UUID est le point de non-retour le plus critique. Un bridge cassé produit des données orphelines sans erreur visible. Toute la mémoire longue (logging, migration, export, RGPD) dépend de sa fiabilité. Doit être validé isolément avant que la moindre session soit écrite côté serveur.

**Logique bridge dans `_syncAccount()` :**

```
1. getLocalUUID()  →  identity.get()?.uuid
2. Si local_uuid absent → ABORT + account:error (jamais silencieux)
3. INSERT INTO accounts (id, email, local_uuid, ...)
   VALUES (auth.uid(), ...) ON CONFLICT (id) DO NOTHING
   — ne réécrit pas local_uuid si le compte existe déjà
4. SELECT fallback si conflit (voir LOT 2)
5. Écriture CE_account_v1
```

**Scénarios à valider (tous obligatoires avant LOT 4B) :**

| Scénario | Comportement attendu | Méthode de test |
|----------|---------------------|-----------------|
| Création compte, appareil A | `accounts.id = auth.uid()` · `accounts.local_uuid = UUID_A` | Admin Bootstrap |
| Reconnexion, même appareil A | SELECT fallback · `CE_account_v1` réécrit · `accounts.local_uuid` inchangé | Déconnecter, reconnecter |
| Connexion depuis appareil B (CU-05) | `CE_account_v1.localUUID = UUID_B` · `accounts.local_uuid = UUID_A` (inchangé — ON CONFLICT DO NOTHING sur id) · comportement attendu et documenté | localStorage vide sur appareil B |
| `local_uuid` absent dans `CE_identity_v1` | Création bloquée · `account:error` émis · aucune ligne dans `accounts` | Supprimer `CE_identity_v1` avant test |
| Double compte même appareil (B-03) | Deux lignes dans `accounts` : **même `local_uuid`** (= UUID de l'appareil) · deux `id` distincts (deux `auth.uid()` différents) · pas d'erreur · comportement attendu | Créer deux comptes (emails différents) depuis le même navigateur |
| Cohérence (appareil d'origine) | `accounts.id = auth.uid()` pour le compte connecté | Requête via Admin Bootstrap |

**Note multi-device (CU-05) :** `local_uuid` est un identifiant d'appareil, non un identifiant de compte. Sur l'appareil B, `CE_account_v1.localUUID = UUID_B` ≠ `accounts.local_uuid = UUID_A`. Cette divergence est intentionnelle. Le bridge réel est `accounts.id = auth.uid()` — identique sur tous les appareils pour le même utilisateur.

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| Circuit breaker absent si `local_uuid` null | Primaire | Guard étape 2 : abort si `getLocalUUID()` retourne null |
| ON CONFLICT écrase `local_uuid` sur reconnexion | Élevé | `ON CONFLICT (id) DO NOTHING` — le `local_uuid` initial n'est jamais réécrit |

**Critères de validation :**
- 6 scénarios testés et résultats consignés
- Zéro compte créé sans `id` correspondant à un `auth.uid()` valide
- Double compte même appareil : deux lignes avec même `local_uuid`, deux `id` différents — pas d'erreur
- **LOT 4A validé avant toute écriture de session côté serveur — condition ferme**

---

### LOT 4B — Session Logging serveur *(uniquement après LOT 4A validé)*

**Dépend de :** LOT 4A validé (condition ferme).

**Périmètre :**

Hook post-session dans `session-repo.js` :
- Après écriture localStorage, si `isPremium()` → tentative d'écriture asynchrone côté serveur
- Guard préalable : si `getServerUUID() === null` → sauter silencieusement

Hook post-session comportemental dans `behavior-repo.js` : même logique.

**`local_session_id` par type de session :**

| Type | Source `local_session_id` |
|------|--------------------------|
| Session comportementale | `session.id` depuis `CE_behavior_sessions_v1` (format `bhv_${createdAt}_${random}`) |
| Snapshot moteur | UUID généré à l'instant du logging via `crypto.randomUUID()` |

Pour les snapshots moteur (`CE_backups_v1`), aucun identifiant stable n'existe dans les données locales. Le `local_session_id` est généré au moment du logging — unique par tentative. Le fire-and-forget (pas de retry) garantit qu'aucun doublon n'est créé par cette voie.

**Structure INSERT :**
```sql
INSERT INTO sessions_moteur (account_id, local_session_id, payload, schema_version)
VALUES (auth.uid(), $local_session_id, $payload, 1)
ON CONFLICT (local_session_id, account_id) DO NOTHING
```

**Règle offline-first :** si Supabase est indisponible, la session est écrite localement normalement. Aucun retry automatique. Aucun message d'erreur visible. Le moteur n'est jamais bloqué.

**Note race condition (R-02) :** si Supabase Auth émet un JWT valide mais que `_syncAccount()` a échoué (réseau coupé), la ligne `accounts` n'existe pas encore. Le logging serveur échoue sur FK violation — échec silencieux attendu. La ligne `accounts` est créée à la prochaine connexion active.

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| Hook bloquant → ralentissement moteur | Critique | Async obligatoire — jamais `await` dans le chemin synchrone |
| `getServerUUID()` null → logging sans `account_id` | Élevé | Guard préalable : sauter silencieusement si null |

**Critères de validation :**
- Session comportementale créée en tant que premium connecté → visible dans `sessions_comportementales`
- Supabase coupé manuellement → moteur fonctionne normalement, aucun message d'erreur
- Compte `'free'` → aucune écriture tentée côté serveur
- Même session envoyée deux fois → une seule ligne dans Supabase (idempotence)

---

### LOT 5 — Migration consentie

**Dépend de :** LOT 4B validé.

**Fichier :** `src/js/account/account-migration.js`

**Périmètre de migration V1 — Option A (B-04) :**

| Source locale | Migré en V1 | Raison |
|---------------|------------|--------|
| `CE_behavior_sessions_v1` | **Oui** | Sessions comportementales avec `id` stable — idempotence garantie |
| `CE_backups_v1` | **Non** | Snapshots moteur sans identifiant stable — idempotence impossible |
| `CE_journal_entries_v1` | **Non** | Historique formulaire — hors périmètre mémoire longue V1 |
| Autres clés locales | **Non** | Hors périmètre (uuid_migration_scope_v1.md) |

**Règles architecturales figées :**

1. **Idempotence par session** — pas de transaction globale. Chaque session insérée indépendamment. Une session invalide est ignorée, les autres continuent.
2. **Flag migration posé après succès** — jamais au clic. Si le réseau coupe à mi-migration : pas de flag posé, la proposition peut être représentée à la prochaine connexion.
3. **Rapport obligatoire à 4 compteurs** (A-03).
4. **Local inchangé** : le localStorage n'est jamais effacé ni modifié après migration.

**`validateLocalSession(session)` pour sessions comportementales (`CE_behavior_sessions_v1`) :**
- `session.id` présent et non vide → sera utilisé comme `local_session_id`
- `session.createdAt` présent (timestamp numérique)
- `session.trades` présent et tableau

**Note `schema_version` (A-04) :** les sessions comportementales individuelles n'ont pas de champ `schema_version` dans leur payload. La valeur `schema_version = 1` est injectée directement dans l'INSERT — elle représente la version du schéma storage V1 (`SCHEMA_VERSION = 1` dans `storage.js`). `validateLocalSession()` ne l'exige pas dans le payload.

**INSERT dans `sessions_comportementales` :**
```sql
INSERT INTO sessions_comportementales
  (account_id, local_session_id, payload, schema_version)
VALUES
  (auth.uid(), session.id, session, 1)
ON CONFLICT (local_session_id, account_id) DO NOTHING
```

**Rapport de migration — 4 compteurs distincts (A-03) :**
```
{
  migrated:          N,   -- sessions insérées avec succès
  already_migrated:  N,   -- ON CONFLICT DO NOTHING (déjà présentes)
  invalid_skipped:   N,   -- validateLocalSession() = false
  failed:            N    -- erreur réseau ou serveur sur cette session
}
```

`markMigrationCompleted()` est appelé uniquement après affichage du rapport. Pas de flag posé au clic.

**Fonctions :**

- `buildMigrationOffer()` → lit `CE_behavior_sessions_v1` uniquement · retourne `{ count, oldest_date, newest_date }`
- `validateLocalSession(session)` → vérifie `id`, `createdAt`, `trades` · retourne `{ valid, reason }`
- `runMigration()` → pour chaque session valide : INSERT idempotent → accumule le rapport à 4 compteurs → retourne le rapport
- `markMigrationCompleted()` → écrit `CE_migration_offer_v1 = 'completed'` après rapport affiché
- `markMigrationDeclined()` → écrit `CE_migration_offer_v1 = 'declined'`

**Note sur `CE_migration_offer_v1` :** clé globale, non namespacée — exception documentée. Elle enregistre la décision de migration, pas des données opérateur.

**Logique de proposition (dans `account-ui.js`) :**

1. À la première connexion : lire `CE_migration_offer_v1`
2. Si absent ET `buildMigrationOffer().count > 0` → afficher la proposition une seule fois
3. Si `'declined'` ou `'completed'` → ne pas proposer

**Traitement des cas utilisateur :**

| Cas | Traitement |
|-----|-----------|
| CU-01 — historique, accepte | Migration → rapport → `markMigrationCompleted()` |
| CU-03 — refus explicite | `markMigrationDeclined()` → jamais représentée |
| CU-04 — ignore | Comportement identique au refus |
| CU-07 — données corrompues | Sessions invalides → `invalid_skipped` · sessions valides migrées |
| CU-X — réseau coupe | Pas de flag posé → proposition représentée à la prochaine connexion |

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| `getServerUUID()` null → sessions orphelines | Primaire | Guard dans `runMigration()` : abort si null |
| `already_migrated` confondu avec `invalid_skipped` dans le rapport | Moyen | 4 compteurs distincts — résolu (A-03) |

**Critères de validation :**
- CU-01 : sessions `CE_behavior_sessions_v1` → toutes dans `sessions_comportementales` · local intact
- Aucune session de `CE_backups_v1` dans `sessions_moteur` après migration (= zéro, comportement attendu)
- CU-03 : refus → `CE_migration_offer_v1 = 'declined'` → proposition absente à la reconnexion
- CU-07 : rapport correct — `invalid_skipped` > 0 · sessions valides migrées
- `runMigration()` × 2 → rapport contient `already_migrated = N` · aucun doublon dans Supabase
- `CE_migration_offer_v1` absent après migration interrompue (réseau coupé)

---

### LOT 6 — Export serveur garanti

**Développement :** peut démarrer dès LOT 4B validé (code écrit sans données à exporter).
**Tests :** exigent des données serveur → après LOT 4B ou LOT 5.
**Dépend de :** LOT 1B (fonctions SQL), LOT 4B ou LOT 5 (données à exporter pour les tests).

**Fichier :** `src/js/account/account-export.js`

**`exportServerData()` — aligné avec B-02 :**

```js
async function exportServerData() {
  const { data, error } = await supabase.rpc('export_user_data');
  // Pas de paramètre — la fonction utilise auth.uid() en interne (SECURITY INVOKER)
  // Retourne uniquement les données de l'utilisateur connecté
  if (error) return { success: false, error };
  // Déclencher le téléchargement JSON
}
```

**`requestRGPDDeletion()` :** INSERT dans `rgpd_requests (type: 'delete')` → confirmation à l'utilisateur.

**Interface dans le panel compte :**
- Bouton "Exporter mes données serveur" — disponible pour tous les comptes, indépendamment du statut premium ou de l'état du compte
- Bouton "Supprimer mon compte" → modale de confirmation → `requestRGPDDeletion()`

**Règle :** l'export serveur est un droit RGPD, pas une fonctionnalité premium. Accessible même si l'abonnement est expiré ou le compte désactivé.

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| `export_user_data()` incomplète si nouvelle table ajoutée | Élevé | Vérifier la liste des tables dans la fonction SQL avant chaque nouveau lot qui en crée une |
| Suppression sans export préalable → perte de données | Moyen | Proposer l'export avant la confirmation de suppression |

**Critères de validation :**
- `supabase.rpc('export_user_data')` avec JWT → JSON contient sessions loggées + sessions migrées
- Après `requestRGPDDeletion()` : une ligne dans `rgpd_requests` avec `status = 'pending'`
- Export fonctionnel depuis un compte `'free'`
- Export fonctionnel depuis un compte `'disabled'`

---

### LOT 7 — Admin V1 complet

**Dépend de :** LOT 2.5 (extension) + **LOT 6 validé** (correction B-06).

**Périmètre :**

Extension de LOT 2.5. Ajout des fonctionnalités RGPD.

- Liste `rgpd_requests` en attente (type · status · created_at)
- Action "Exporter et envoyer" : l'admin appelle `export_user_data()` via le dashboard Supabase (SQL editor avec `service_role`) ou via requête directe sur les tables. **Aucune fonction dédiée `admin_export_user_data()` n'est requise en V1** — le dashboard Supabase est suffisant pour le volume attendu.
- Action "Supprimer" → saisie email obligatoire → appel `delete_user_data(account_id)` → ligne dans `admin_log`
- Journal `admin_log` en lecture seule — aucune modification possible depuis l'interface

**Périmètre strict :** aucune lecture des sessions comportementales ni du payload moteur par l'admin. L'admin sait que l'opérateur existe — il ne sait pas comment il opère.

| Risque | Criticité | Mitigation |
|--------|-----------|------------|
| Bouton "Supprimer" sans confirmation robuste | Élevé | Saisie email obligatoire — bouton désactivé tant que l'email ne correspond pas |
| `delete_user_data()` appelée sans ligne `admin_log` | Élevé | La fonction SQL insère dans `admin_log` avant suppression (même transaction) |

**Critères de validation :**
- Traitement d'une demande RGPD delete de bout en bout : request → delete → vérification Supabase → ligne `admin_log`
- `admin_log` inaltérable depuis l'interface
- Un compte supprimé reste visible dans `admin_log` (account_id = NULL, ligne préservée)

---

### LOT 8 — Légal + Freemium cohérence

**Nature :** vérification finale de cohérence — pas d'implémentation nouvelle.

**Dépend de :** LOT 5, LOT 6, LOT 7 validés.

**Vérifications :**

| Point | Vérification |
|-------|-------------|
| Documents légaux | Accessibles depuis le panel compte — liens fonctionnels (présents depuis LOT 3) |
| Consent RGPD | `accounts.rgpd_consent = true` pour tous les comptes créés depuis LOT 3 |
| Souveraineté moteur | `grep -r "from.*account" src/js/engine.js src/js/decision.js src/js/trading-policy.js src/js/moteur.js` → zéro résultat |
| Message frontière freemium | Visible sans connexion et avec connexion compte `'free'` |
| Fonctionnalités moteur | Score, posture, actions, coaching identiques : compte `'free'` · compte `'premium'` · sans compte |
| Clé `CE_account_v1` | Documentée comme exception namespacée dans un commentaire dans `account-storage.js` |
| Clé `CE_migration_offer_v1` | Documentée comme clé globale dans `account-migration.js` |

**Critères de validation :**
- Test moteur : connecté premium vs non connecté → score identique sur mêmes inputs
- grep souveraineté → zéro résultat

---

### LOT 9 — Validation finale

**Dépend de :** LOT 8 validé.

**Parcours exhaustif de la checklist pré-implémentation (76 cases, blocs A→G).**

**Tests obligatoires :**

| Test | Scénarios |
|------|-----------|
| Magic Link | CU-02 (nouvel utilisateur) |
| Bridge | 6 scénarios LOT 4A rejoués |
| Logging | CU-05 (nouvel appareil) · CU-06 (nouvelles sessions locales post-migration — restent locales, non synchées automatiquement) |
| Migration | CU-01 · CU-03 · CU-04 · CU-07 |
| RGPD pipeline | Création → logging → migration → export → vérification JSON → suppression → vérification absence |
| Offline-first | Supabase coupé → moteur fonctionne sans erreur visible |
| Non-régression moteur | 10 inputs identiques → score/posture/actions identiques avant/après introduction du compte |
| Souveraineté moteur (structurel) | `grep -r "from.*account" src/js/engine.js src/js/decision.js src/js/trading-policy.js src/js/moteur.js` → zéro résultat |
| Idempotence migration | `runMigration()` × 2 → `already_migrated = N` · aucun doublon Supabase |
| Migration périmètre | `CE_backups_v1` → 0 ligne dans `sessions_moteur` après migration (comportement attendu) |

**Note CU-06 :** un utilisateur connecté ayant migré ses sessions accumule de nouvelles sessions locales. Ces nouvelles sessions locales ne sont pas synchronisées automatiquement vers le serveur. Les sessions créées post-connexion sont loggées directement côté serveur via le hook LOT 4B (si premium). Les sessions créées localement sans connexion active restent locales — cohérent avec la doctrine local-first.

**Critères de sortie :**
- 76/76 cases cochées dans la checklist officielle
- Zéro régression moteur
- Pipeline RGPD testé de bout en bout
- grep souveraineté → zéro résultat
- Tous les tests CU listés : passés et résultats consignés

---

## Section 2 — Ordre d'exécution et dépendances

```
LOT 0     Infrastructure (non-code)
  │
  └─► LOT 1A   Schéma minimal (accounts + sessions + RLS)
        │
        ├─► LOT 1B   Schéma RGPD (fonctions export/delete + tables admin)
        │
        └─► LOT 2    Module account/ (service layer)
              │
              └─► LOT 2.5  Admin Bootstrap
                    │
                    └─► LOT 3    Interface Magic Link
                          │
                          └─► LOT 4A   Validation UUID Bridge [risque primaire]
                                │
                                └─► LOT 4B   Session Logging serveur
                                      │
                                      ├─► LOT 5    Migration consentie (CE_behavior_sessions_v1)
                                      │
                                      └─► LOT 6    Export serveur
                                            │ (dev en parallèle de LOT 5)
                                            │ (tests après LOT 4B ou LOT 5)
                                            │
                                            └─► LOT 7    Admin V1 complet
                                                  │
                                          LOT 5 + LOT 6 + LOT 7 validés
                                                  │
                                                  └─► LOT 8    Légal + Freemium cohérence
                                                        │
                                                        └─► LOT 9    Validation finale
```

**Parallélisation possible :**
- LOT 1B peut démarrer dès LOT 1A validé
- LOT 6 (code) peut être écrit pendant LOT 5 — testé après LOT 4B ou LOT 5

---

## Section 3 — Récapitulatif des risques

| Rang | Risque | Lot | Criticité |
|------|--------|-----|-----------|
| 1 | Bridge UUID cassé silencieusement → données orphelines | LOT 4A | **Primaire** |
| 2 | Circuit breaker absent si `local_uuid` null → compte sans bridge | LOT 4A | **Critique** |
| 3 | RLS mal configurée → fuite inter-comptes | LOT 1A | **Critique** |
| 4 | `UNIQUE (local_session_id, account_id)` absent → doublons migration | LOT 1A | **Critique** |
| 5 | `service_role_key` dans le repo | LOT 0 | **Critique** |
| 6 | `export_user_data()` incomplète après ajout d'une table | LOT 1B + LOT 6 | **Élevé** |
| 7 | Hook session logging bloquant → moteur ralenti | LOT 4B | **Élevé** |
| 8 | `accounts` INSERT échoué (race condition Auth) → FK violation logging | LOT 4B | **Élevé** (offline-first — échec silencieux attendu) |
| 9 | Ordre init `account-service.js` vs `render.js` → token callback manqué | LOT 3 | **Élevé** |
| 10 | `delete_user_data()` sans transaction → suppression partielle | LOT 1B | **Élevé** |
| 11 | Admin accessible sans auth forte | LOT 2.5 + LOT 7 | **Élevé** |
| 12 | `isPremium()` utilisée dans un fichier moteur | LOT 8 | **Moyen** (détectable par grep) |

---

## Section 4 — Points de non-retour architecturaux

| # | Point de non-retour | Lot | Nature |
|---|--------------------|----|--------|
| PNR-1 | `accounts.id = auth.uid()` — format du bridge | LOT 1A | Changer après mise en production = migrer toutes les lignes + ré-linker toutes les sessions |
| PNR-2 | Schéma des tables `sessions_*` | LOT 1A | Ajouter une colonne `NOT NULL` sans défaut après données existantes = migration destructive |
| PNR-3 | Mécanisme `isPremium()` (champ `status`) | LOT 2 | Changer le mécanisme = réauditer toutes les sessions loggées rétrospectivement |
| PNR-4 | Contrainte `UNIQUE (local_session_id, account_id)` | LOT 1A | Ajouter après des doublons existants = crash de migration |
| PNR-5 | RLS policies | LOT 1A | Une RLS trop permissive en production exige un audit de ce qui a été lu |

---

## Section 5 — Premier lot réellement codable

**LOT 1A — Schéma minimal opérationnel.**

Un seul fichier : `supabase/migrations/001_core_schema.sql`.

Raison : tout dépend du schéma de données. Le module `account/`, la migration, l'export RGPD, l'admin — tous construits sur les tables et contraintes de LOT 1A. Le coût de correction d'un schéma mal conçu en LOT 1A est zéro. Le coût de le corriger en LOT 5 est maximal.

Prérequis au premier commit :
- LOT 0 validé (HTTPS actif, Supabase configuré, email de test envoyé, documents légaux accessibles)
- D-PRE-01 fermée ✅
- D-PRE-02 fermée ✅
- D-PRE-03 fermée ✅

---

## Section 6 — Verdict final

**GO conditionnel — une condition restante avant LOT 1A.**

| Condition | Statut |
|-----------|--------|
| D-PRE-01 — `isPremium()` mécanisme | ✅ FERMÉE |
| D-PRE-02 — Multi-device V1 | ✅ FERMÉE |
| D-PRE-03 — Ordre d'initialisation | ✅ FERMÉE |
| LOT 0 — Infrastructure active | ⬜ À valider |

**Condition unique restante :** LOT 0 validé (HTTPS actif, Supabase opérationnel, email de test reçu, documents légaux en ligne).

**Une fois LOT 0 validé :**

> **GO — premier commit : `supabase/migrations/001_core_schema.sql`**

---

## Contraintes permanentes

Ces contraintes s'appliquent à chaque lot sans exception :

1. **Moteur souverain** : aucun import vers `account/` dans `engine.js`, `decision.js`, `trading-policy.js`, `moteur.js`
2. **Local-first** : Supabase n'est jamais sur le chemin critique d'exécution du moteur
3. **render.js** : zéro logique compte — uniquement écoute d'événements `account-events.js`
4. **Frontière freemium** : `isPremium()` ne conditionne que la persistance serveur, jamais les fonctionnalités moteur
5. **Migration** : jamais silencieuse, jamais destructive du localStorage local
6. **RGPD** : aucun compte en production sans portabilité complète des données serveur (LOT 6 bloquant)

---

*Caméléon Engine — Architecture Produit · 2026-06-11*
*Documents connexes : `user_account_v1_execution_architecture.md` · `user_account_v1_pre_implementation_checklist.md` · `freemium_matrix_v1.md` · `uuid_migration_scope_v1.md` · `magic_link_ttl_v1.md` · `smtp_provider_v1.md` · `server_provider_v1.md`*
