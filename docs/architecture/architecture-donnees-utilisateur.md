# Architecture données utilisateur — Caméléon Engine

> Document d'architecture · **Clôturé** · 2026-06-07 · ADU-01 ✅ `c69b15a` · ADU-02 ✅ `2ac2835` · ADU-03 ✅ ARCH-N1 figée · ADU-04 ✅ `7118244` · ADU-05 ✅ `1b0f51b` · ADU-06 ✅ `7468940` · Portefeuille V1 ✅ T1–T5 `9275466`→`2d6d635`

---

## 1. Décisions figées

Ces décisions sont actées. Elles ne sont pas remises en question dans ce document ni dans le chantier d'implémentation.

| # | Décision | Contenu |
|---|---|---|
| D-01 | Modèle d'identité V1 | UUID local généré silencieusement à la première visite — aucun serveur, aucun email |
| D-02 | Données comportementales | Local-first permanent — jamais hébergées côté serveur par défaut |
| D-03 | Portabilité V1 | Export JSON — seul mécanisme de backup compatible ZERO CLOUD |
| D-04 | Compte serveur | V2 optionnel post-mise en ligne — périmètre : identité + facturation, pas données de trading |
| D-05 | Définition de "session" | Une occasion de se voir agir — pas un fichier, pas une soumission de formulaire |
| D-06 | Session moteur ≠ Session comportementale | Deux entités distinctes, deux rôles distincts, deux stockages distincts |

## 2. Cartographie des entités

Onze entités. Pour chacune : rôle · responsabilité · propriétaire · durée de vie · source de vérité actuelle.

---

### 2.1 Opérateur

| | |
|---|---|
| **Rôle** | Le sujet du système. L'être humain qui trade, qui apprend, qui se voit dans le miroir. |
| **Responsabilité** | Prendre des décisions, importer des données, déclarer son état. |
| **Propriétaire** | Personne — c'est le propriétaire, pas une entité possédée. |
| **Durée de vie** | Infinie. Précède et survit au système. |
| **Source de vérité** | L'être humain lui-même. |

L'Opérateur n'est pas une table. C'est le sujet autour duquel toutes les autres entités s'organisent. Le confondre avec "Compte" produit un système qui modélise un accès plutôt qu'un être humain en apprentissage.

---

### 2.2 Identité locale

| | |
|---|---|
| **Rôle** | Représentation technique de l'Opérateur dans le navigateur. |
| **Responsabilité** | Nommer, distinguer et regrouper les données d'un opérateur sur un appareil donné. |
| **Propriétaire** | L'Opérateur. |
| **Durée de vie** | Tant que le localStorage n'est pas effacé — ou que l'opérateur a exporté et réimporté son profil. |
| **Source de vérité** | `CE_identity_v1` — ✅ créée ADU-04A · `358d9b2`. |

Contenu minimal : identifiant unique · nom optionnel · profil de trading · date de création.

C'est la seule entité nouvelle à créer en V1. Toutes les autres entités existent déjà ou dérivent d'elle.

---

### 2.3 Session moteur

| | |
|---|---|
| **Rôle** | Un instant de décision. La capture de "j'ai analysé ça, à ce moment, dans ces conditions". |
| **Responsabilité** | Enregistrer l'état marché + état opérateur + décision produite. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | FIFO 200 — les plus anciennes sont écrasées, sans TTL explicite. (HISTORY_LIMIT · MEM-01B Bloc A · `abed3b4`) |
| **Source de vérité** | `CE_journal_entries_v1__{uuid}` |

Dans le code actuel, Session moteur et Historique partagent le même stockage. Ce sont deux concepts distincts qui coexistent dans le même objet — dette ARCH-S1, résolue conceptuellement.

---

### 2.4 Session comportementale

| | |
|---|---|
| **Rôle** | Une fenêtre d'observation sur le comportement passé de l'opérateur. |
| **Responsabilité** | Contenir les trades normalisés d'une période + les patterns qui en découlent. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | FIFO 50 — cap relevé MEM-01B Bloc A · `abed3b4`. |
| **Source de vérité** | `CE_behavior_sessions_v1__{uuid}` |

Le cap FIFO 50 a été décidé et implémenté (MEM-01B Bloc A · `abed3b4`). La contrainte résiduelle ARCH-N3 (QuotaExceededError silencieux) est différée — attendre données terrain.

---

### 2.5 Historique

| | |
|---|---|
| **Rôle** | Log chronologique passif des sessions moteur. |
| **Responsabilité** | Traçabilité — l'opérateur peut consulter ses décisions passées. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | FIFO 200 (même stockage que Sessions moteur · HISTORY_LIMIT · MEM-01B Bloc A · `abed3b4`). |
| **Source de vérité** | `CE_journal_entries_v1__{uuid}` (partagé avec Sessions moteur) |

L'Historique est un log passif. Il répond à "qu'ai-je décidé ?". La Mémoire répond à "qu'est-ce que ça révèle sur moi ?". Ces deux questions ne doivent pas partager le même objet technique à terme.

---

### 2.6 Signal comportemental courant

*Anciennement désigné "Mémoire comportementale" — renommage proposé, décision ouverte en §6.*

| | |
|---|---|
| **Rôle** | État comportemental courant transporté entre sessions. |
| **Responsabilité** | Informer le moteur du niveau d'overtrading récent, indépendamment de la session en cours. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | 7 jours TTL — disparaît au-delà. |
| **Source de vérité** | `cameleon_behavior_memory_v1` — ✅ PRIV-01 résolu (`c69b15a`) · centralisé dans `storage.js` · `behaviorMemory.getAll/setAll/clear` |

Ce n'est pas une mémoire au sens fort — c'est un état courant avec expiration. Le nom "Mémoire comportementale" est trompeur car il suggère une persistance longue. Cf. dette ARCH-M1.

---

### 2.7 Mémoire opérateur

| | |
|---|---|
| **Rôle** | Profil construit de l'opérateur à partir de ses tendances stables sur la durée. |
| **Responsabilité** | Rendre visible ce qui se répète, au-delà du FIFO 20 et du bruit court terme. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | Long terme — pas de TTL. |
| **Source de vérité** | **N'existe pas encore.** Chantier futur (position 3 roadmap officielle). |

Prérequis bloquants : cap FIFO relevé · sessions suffisantes (indicatif : 50–100) · question non résolue : accumulation ou distillation ?

---

### 2.8 Import Registry

| | |
|---|---|
| **Rôle** | Registre des fichiers importés — trace des sources de données. |
| **Responsabilité** | Savoir quoi a été importé, quand, en quel format, combien de trades. |
| **Propriétaire** | Identité locale — mais aujourd'hui : **personne** (anonyme). |
| **Durée de vie** | FIFO 100 — IMPORT_REGISTRY_LIMIT · MEM-01B Bloc D · `1b0f51b`. |
| **Source de vérité** | `CE_import_registry_v1__{uuid}` |

Chaque entrée est namespacée sous UUID opérateur via `withUserKey()`. **ARCH-N2 ✅ SOLDÉE** (`1b0f51b`) — registre activé et capé, 13 champs V1 par entrée (`schemaVersion`, `importedAt`, `source`, `format`, `importType`, `fileName`, `rowsRead`, `rowsKept`, `rowsIgnored`, `analysisQuality`, `pdfQuality`, `sessionId`).

---

### 2.9 Portefeuille

| | |
|---|---|
| **Rôle** | L'exposition réelle de l'opérateur et son évolution dans le temps. |
| **Responsabilité** | Révéler l'écart entre ce que l'opérateur croit faire et ce qu'il fait vraiment financièrement. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | Long terme. |
| **Source de vérité** | `CE_portfolio_v1__{uuid}` — ✅ **Portefeuille V1 implémenté** · FIFO 50 snapshots · T4-prérequis `9275466` · T1 `a574209` · T2 `3e46c6c` · T3 `fa17e6d` · T4 `88c2edd` · T5 `2d6d635` |

Portefeuille V1 capture la composition du wallet à chaque import Wallet History (netQuantity par symbole, catégorie, firstSeenAt/lastSeenAt, métriques). Pas de valorisation, pas d'API prix, pas de recommandation d'investissement. Snapshots indexés dans l'onglet Comportement (section Mémoire).

---

### 2.10 Contexte

| | |
|---|---|
| **Rôle** | Le cadre instantané d'une décision — état marché + état opérateur au moment de l'analyse. |
| **Responsabilité** | Décrire les conditions dans lesquelles la décision est prise. |
| **Propriétaire** | Session moteur (propriété d'une session, pas de l'opérateur directement). |
| **Durée de vie** | Celle de la session moteur à laquelle il appartient. |
| **Source de vérité** | Les 16 champs du formulaire. Entièrement déclaratif en V1. |

Le Contexte n'a pas de stockage propre — il est une composante du payload de Session moteur. La Mémoire opérateur permettra à terme un contexte observé en complément du déclaratif.

---

### 2.11 Corrélations personnelles

| | |
|---|---|
| **Rôle** | Liens révélés entre dimensions du comportement de l'opérateur, visibles uniquement sur la durée. |
| **Responsabilité** | Rendre visible ce que l'opérateur ne peut pas voir seul dans l'instant. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | Long terme. |
| **Source de vérité** | **N'existe pas encore.** Entièrement future. |

Prérequis stricts : Mémoire opérateur fonctionnelle + Portefeuille. La chaîne est séquentielle et ne peut pas être sautée.

## 3. Relations et dépendances

### Point d'ancrage : l'Identité locale

Toutes les entités appartiennent à l'Identité locale. Sans elle, les données n'ont pas de propriétaire, les relations n'ont pas de point d'ancrage, et les chantiers Mémoire / Portefeuille / Corrélations n'ont pas de sujet.

```
IDENTITÉ LOCALE
│
├── possède ──→ Sessions moteur (historique décisions)
├── possède ──→ Sessions comportementales (imports)
├── possède ──→ Import Registry
├── possède ──→ Signal comportemental courant (état 7j)
├── possède ──→ [Mémoire opérateur]          — futur
├── possède ──→ Portefeuille                 — ✅ V1 implémenté
└── possède ──→ [Corrélations personnelles]  — futur

SESSION MOTEUR
├── contient ──→ Contexte (16 champs déclaratifs)
├── contient ──→ Décision produite
└── contribue ──→ Historique (lecture)

SESSION COMPORTEMENTALE
├── contient ──→ Trades normalisés       — stockés, source de vérité
├── produit  ──→ Métriques              — calculées, non stockées comme source
├── produit  ──→ Patterns               — calculés, non stockés comme source
└── alimente ──→ Signal comportemental courant (fenêtre 7j)

SIGNAL COMPORTEMENTAL COURANT
└── informe  ──→ Session moteur (via getBehaviorState())

[MÉMOIRE OPÉRATEUR]
├── distillée de ──→ Sessions comportementales (long terme)
└── prérequis de ──→ Corrélations personnelles

PORTEFEUILLE (V1)
├── alimenté par ──→ Wallet History imports
└── prérequis de ──→ Corrélations personnelles

[CORRÉLATIONS PERSONNELLES]
├── dérivées de ──→ Mémoire opérateur
└── dérivées de ──→ Portefeuille
```

### Ordre de débloquage

```
Identité locale
  → Architecture données (namespacing, migration)
    → Compte utilisateur (V2 optionnel)
  → Sessions comportementales avec user_id
    → Import Registry avec user_id
      → Mémoire opérateur (cap FIFO relevé)
        → Corrélations personnelles
  → Portefeuille avec user_id
    → Corrélations personnelles
```

## 4. Sources de vérité

### État actuel du localStorage

| Entité | Clé localStorage | Cap | Problème identifié |
|---|---|---|---|
| Sessions moteur / Historique | `CE_journal_entries_v1` | 50 FIFO | Deux concepts, un seul stockage |
| Sessions comportementales | `CE_behavior_sessions_v1__{uuid}` | **50 FIFO** | Namespacé · cap relevé MEM-01B Bloc A · `abed3b4` |
| Signal comportemental courant | `cameleon_behavior_memory_v1__{uuid}` | — | ✅ PRIV-01 résolu (`c69b15a`) · namespacé ADU-04 |
| Import Registry | `CE_import_registry_v1__{uuid}` | **100 FIFO** | Namespacé · activé MEM-01B Bloc D · `1b0f51b` |
| Portefeuille V1 | `CE_portfolio_v1__{uuid}` | **50 FIFO** | ✅ Portefeuille V1 · `fa17e6d` · snapshots wallet |
| Paramètres | `CE_settings_v1__{uuid}` | — | ✅ Namespacé ADU-04 |
| Backups moteur | `CE_backups_v1__{uuid}` | 50 FIFO | ✅ Namespacé ADU-04 · schema enrichi MEM-01B Bloc B |
| Guard level overtrading | `cameleon.behavior.v1.guardLevel__{uuid}` | 1 valeur · 7j TTL | ✅ Namespacé ADU-04 |
| **Identité locale** | `CE_identity_v1` | — | ✅ **Créée ADU-04A** · `358d9b2` |

### État atteint — post-ADU-04/05/06 (2026-06-07)

Toutes les cibles ci-dessous sont opérationnelles. La migration est automatique au premier lancement.

| Entité | Clé opérationnelle | Statut |
|---|---|---|
| **Identité locale** | `CE_identity_v1` | ✅ ADU-04A · `358d9b2` |
| Sessions moteur / Historique | `CE_journal_entries_v1__{uuid}` | ✅ ADU-04A/B · migration active |
| Sessions comportementales | `CE_behavior_sessions_v1__{uuid}` | ✅ ADU-04A/B · cap 50 |
| Signal comportemental courant | `cameleon_behavior_memory_v1__{uuid}` | ✅ ADU-04C · PRIV-01 résolu |
| Import Registry | `CE_import_registry_v1__{uuid}` | ✅ ADU-05 / MEM-01B Bloc D · `1b0f51b` |
| Portefeuille V1 | `CE_portfolio_v1__{uuid}` | ✅ Portefeuille V1 · T3 `fa17e6d` · 50 FIFO |
| Paramètres | `CE_settings_v1__{uuid}` | ✅ ADU-04A/B |
| Backups | `CE_backups_v1__{uuid}` | ✅ ADU-04A/B · schema enrichi MEM-01B Bloc B |

### Ce qui est stocké vs calculé vs jamais stocké

**Stocké — source de vérité, ne se recalcule pas :**
- UUID identité locale · profil opérateur · nom optionnel
- Trades normalisés (dans sessions comportementales)
- Snapshots décisions moteur (payload complet)
- Métadonnées imports (Import Registry)

**Calculé — dérivé des sources, jamais source de vérité :**
- Score comportemental (dérivé des trades)
- Patterns détectés (dérivés des métriques)
- Métriques agrégées (dérivées des trades)
- Niveau overtrading et guard level (dérivés des patterns)
- Overlay macro (dérivé des champs contextuels)
- Corrélations personnelles (dérivées de mémoire + portefeuille)
- Decay de confiance par âge de session (calculé à la volée)

**Jamais stocké — interdit par doctrine privacy-local-first :**
- Fichiers bruts originaux (CSV / XLSX / PDF)
- Montants absolus (balances, soldes, PnL réel)
- User_ID Binance, adresses de retrait, email Binance
- Toute donnée personnellement identifiable (PII) présente dans les exports

## 5. Dettes restantes

### PRIV-01 — Signal comportemental courant hors storage.js

**✅ RÉSOLUE — commit `c69b15a` — 2026-06-07**

`cameleon_behavior_memory_v1` est désormais centralisée dans `storage.js` via l'export `behaviorMemory` (`getAll / setAll / clear`). Les appels `localStorage.setItem/getItem` bruts ont été supprimés de `render.js`. Format tableau brut préservé — aucune migration de données nécessaire.

**Statut : RÉSOLUE**

---

### ARCH-M1 — Deux "Mémoires" avec le même nom

"Mémoire comportementale" (état courant 7j) et "Mémoire opérateur" (profil long terme) partagent le mot "mémoire" dans toute la documentation et le code.

**Impact :** Risque de construction double lors du chantier Mémoire opérateur. On pourrait étendre la mémoire courte croyant construire la mémoire longue.

**Résolution proposée :** Renommer "Mémoire comportementale" → **Signal comportemental courant (SCO)**. Nom précis, horizon temporel explicite, non ambigu.

**Statut : OUVERTE** — décision de renommage à trancher (§6).

---

### ARCH-N1 — Clés localStorage globales, sans namespacing utilisateur

Toutes les clés actuelles (`CE_*`) sont globales. Aucune ne contient de `user_id`.

**Impact :** Bloquant. L'introduction de l'Identité locale exige une stratégie de migration explicite. Sans elle, les données historiques d'un opérateur existent mais n'appartiennent à personne.

**Stratégie décidée (DO-03 figée) :** migration propre avec session de grâce. Règles détaillées en §6.5.

Le format exact a été décidé en ADU-03 (§6.6) et implémenté en ADU-04A/B/C.

**Statut : ✅ RÉSOLUE** — Implémentée ADU-04A/B/C · commits `358d9b2` / `b4eb8d2` / `7118244`. Suffix `__` opérationnel, 9 clés namespacées, migration automatique active (`runUUIDMigration()` → `runUUIDCleanup()`).

---

### ARCH-N2 — Import Registry sans user_id

Chaque entrée du registre trace un import mais ne connaît pas son propriétaire.

**Impact :** Le registre ne peut pas servir de fondation à la Mémoire opérateur sans `user_id`. On construirait une mémoire sans sujet.

**Statut : ✅ SOLDÉE** — MEM-01B Bloc D · `1b0f51b`. `importRegistry.append()` actif, cap 100, namespacing UUID via `withUserKey()`, 13 champs V1 par entrée.

---

### ARCH-N3 — Cap FIFO 20 sessions comportementales non redéfini

Le cap FIFO 20 est documenté comme goulot d'étranglement (faisabilité miroir comportemental). Sa valeur de remplacement n'a jamais été décidée.

**Impact :** Si non redéfini ici, le chantier Mémoire opérateur héritera d'une contrainte arbitraire. Le changer plus tard rouvre une décision d'architecture.

**Statut : CAP DÉCIDÉ (50) · ARCH-N3 DIFFÉRÉE** — SESSION_LIMIT = 50 implémenté (MEM-01B Bloc A · `abed3b4`). Risque résiduel : QuotaExceededError silencieux — attendre données terrain avant décision complémentaire.

---

### ARCH-N4 — Pas de mécanisme d'export JSON en V1

En local-first, l'export est le seul mécanisme de backup. Sans export : perte localStorage = perte totale et irrécupérable.

**Impact :** Risque UX majeur + risque RGPD (droit à la portabilité des données). Si non prévu en V1, le chantier Compte utilisateur devra le construire sous contrainte.

**Statut : ✅ CLÔTURÉE** — ADU-06 · `exportOperatorData()` + `downloadOperatorData()` + bouton UI · commits `4741612` / `c98953a` / `7468940`. Périmètre : toutes les entités opérateur namespacées.

---

### ARCH-N5 — wallet_analyzer.js orphelin

`src/js/behavior/wallet/wallet_analyzer.js` est présent, fonctionne en isolation, mais n'est connecté à aucune interface, aucun pipeline, aucune clé de stockage.

**Impact :** Non bloquant pour ce chantier. Risque de redécouverte et re-implémentation lors du chantier Portefeuille.

**Statut : ✅ CADUQUE** — `wallet_analyzer.js` n'est pas orphelin : importé par `uploader.js`, branché pipeline NON_TRADING/wallet, rendu `behavior-view.js`. Module connecté, données éphémères non persistées. Chantier Portefeuille différé après signal terrain.

## 6. Décisions ouvertes

Ces décisions doivent être tranchées dans le chantier d'implémentation, pas avant. Elles ne peuvent pas être décidées sur le papier sans signal terrain ou contrainte technique réelle.

| # | Décision | Enjeu | Impact si non tranchée |
|---|---|---|---|
| ~~DO-01~~ | ~~Nouveau cap FIFO sessions comportementales~~ | **DÉCIDÉ : 50** (SESSION_LIMIT · MEM-01B Bloc A · `abed3b4`) | ✅ Résolu |
| DO-02 | Renommage officiel "Mémoire comportementale" → "Signal comportemental courant" | Clarté documentaire + code | Confusion persistante avec Mémoire opérateur |
| ~~DO-03~~ | ~~Stratégie de migration des clés existantes~~ | **FIGÉE** — Migration propre avec session de grâce (§6.5) | ✅ Décidée |
| DO-04 | Multi-opérateur sur même navigateur — use case V1 ? | Complexité interface identité | Différé V2+ — contournement : profils navigateur |
| ~~DO-05~~ | ~~Périmètre exact de l'export JSON V1~~ | **RÉSOLU** — `exportOperatorData()` inclut toutes les entités opérateur (ADU-06 · `7468940`) | ✅ Résolu |

## 6.5 Décision DO-03 — Migration propre avec session de grâce

**Décision figée — 2026-06-07**

### Règles validées

1. La migration est déclenchée au premier lancement où `CE_identity_v1` est créé.
2. Toutes les clés opérateur sont copiées vers leurs équivalentes namespacées sous le UUID généré.
3. Les clés UI/éphémères (`CE_ui_state_v1`, `CE_payload_current_v1`) restent globales — pas de namespacing.
4. Le flag de migration est posé **après** que toutes les nouvelles clés sont écrites.
5. Session de grâce : si une clé namespacée est vide au lancement suivant la migration, le système lit la clé legacy correspondante en fallback silencieux.
6. Les clés legacy opérateur sont supprimées au deuxième lancement post-migration (flag présent + nouvelles clés non vides).
7. La migration est idempotente : si le flag est absent, elle se relance sans erreur.

### Classification des clés

**Migrer vers UUID (données opérateur) :**
`CE_journal_entries_v1` · `CE_behavior_sessions_v1` · `CE_import_registry_v1` · `CE_backups_v1` · `CE_settings_v1` · `CE_portfolio_v1` · `cameleon_behavior_memory_v1` · `cameleon.behavior.v1.guardLevel` · `cameleon.behavior.v1.guardLevelUpdatedAt` · `cameleon.behavior.v1.orderStrategyProfile`

**Laisser globales (état navigateur / éphémère) :**
`CE_ui_state_v1` · `CE_payload_current_v1`

### Règle de distinction

Une clé doit être rattachée au UUID si et seulement si sa perte constitue une perte de connaissance sur l'opérateur. Les clés UI/éphémères peuvent disparaître sans affecter le miroir comportemental.

### Ce qui reste ouvert (ADU-03)

~~Le format exact des clés namespacées n'est pas défini ici.~~ ✅ Décidé — voir §6.6.

---

## 6.6 Décision ARCH-N1 — Format exact des clés namespacées

**Décision figée — 2026-06-07**

### Convention officielle

```
{nom_clé_logique_existant}__{uuid_rfc4122}
```

Le double underscore `__` est le séparateur entre le nom logique de la clé et le discriminant opérateur.

### Règles de nommage

1. `__` est réservé comme séparateur UUID — jamais utilisé dans les noms logiques de clés.
2. Les clés globales n'ont jamais de `__` dans leur nom.
3. Le UUID est le format complet RFC 4122 avec tirets — 36 caractères. Ex. : `550e8400-e29b-41d4-a716-446655440000`.
4. `CE_identity_v1` est globale — elle contient le UUID, elle ne le porte pas dans son nom.
5. Filtre canonique export/suppression : `Object.keys(localStorage).filter(k => k.endsWith('__' + uuid))`

### Liste complète des clés cibles après migration

| Clé actuelle | Clé cible |
|---|---|
| `CE_journal_entries_v1` | `CE_journal_entries_v1__{uuid}` |
| `CE_behavior_sessions_v1` | `CE_behavior_sessions_v1__{uuid}` |
| `CE_import_registry_v1` | `CE_import_registry_v1__{uuid}` |
| `CE_backups_v1` | `CE_backups_v1__{uuid}` |
| `CE_settings_v1` | `CE_settings_v1__{uuid}` |
| `CE_portfolio_v1` | `CE_portfolio_v1__{uuid}` |
| `cameleon_behavior_memory_v1` | `cameleon_behavior_memory_v1__{uuid}` |
| `cameleon.behavior.v1.guardLevel` | `cameleon.behavior.v1.guardLevel__{uuid}` |
| `cameleon.behavior.v1.guardLevelUpdatedAt` | `cameleon.behavior.v1.guardLevelUpdatedAt__{uuid}` |
| `cameleon.behavior.v1.orderStrategyProfile` | `cameleon.behavior.v1.orderStrategyProfile__{uuid}` |

### Clés globales — inchangées

| Clé | Rôle |
|---|---|
| `CE_ui_state_v1` | État UI navigateur — pas de propriétaire opérateur |
| `CE_payload_current_v1` | Dernier payload moteur — éphémère, recalculable |
| `CE_identity_v1` | Identité locale — contient le UUID, est la source du UUID |
| `CE_migration_v1_done` | Flag migration legacy → `CE_*` (existant) |
| `CE_migration_uuid_v1_done` | Flag migration `CE_*` → namespacé ✅ opérationnel (ADU-04A · `358d9b2`) |

---

## 7. Verdict

### État d'avancement

| Verrou | Statut | Commit |
|---|---|---|
| PRIV-01 — `cameleon_behavior_memory_v1` hors `storage.js` | ✅ RÉSOLU | `c69b15a` |
| DO-03 — Stratégie de migration | ✅ FIGÉE | Migration propre avec session de grâce (§6.5) |
| ARCH-N1 — Format exact des clés namespacées | ✅ FIGÉE | Suffix `__{uuid}` · 5 règles · liste clés cibles (§6.6) |

---

### Séquence juste

```
1. ✅ Résoudre PRIV-01
   → cameleon_behavior_memory_v1 intégrée dans storage.js (c69b15a)

2. ✅ Décider stratégie de migration (DO-03)
   → Migration propre avec session de grâce (§6.5)

3. ✅ Décider format exact des clés namespacées (ARCH-N1)
   → Suffix `__{uuid}` · filtre `endsWith('__' + uuid)` (§6.6)

4. ✅ ADU-04 : `CE_identity_v1` + `runUUIDMigration()` + `runUUIDCleanup()` · commits `358d9b2` / `b4eb8d2` / `7118244`

5. ✅ DO-01 résolu : SESSION_LIMIT = 50 (MEM-01B Bloc A · `abed3b4`)

6. ✅ ARCH-N2 soldée : Import Registry namespacé + activé (MEM-01B Bloc D · `1b0f51b`)

7. ✅ ARCH-N4 clôturée : Export JSON V1 (`exportOperatorData()` · ADU-06 · `7468940`)
```

---

### ADU-04, ADU-05, ADU-06 — tous clôturés (2026-06-07)

Architecture données utilisateur entièrement implémentée. Prochain chantier dans cette chaîne : **Mémoire opérateur** (roadmap position #2), sur signal terrain après validation bêta.

---

### Aucun plan de code dans ce document

Ce document définit *quoi* construire et *dans quel ordre décider*. Le *comment* — les clés exactes, les fonctions, les migrations pas à pas — appartient à un plan d'implémentation atomique séparé, ouvert uniquement après validation de ce document.

---

### Prochain chantier logique après implémentation

**Compte utilisateur** — mais seulement après :
- Architecture données stable en production
- Premiers utilisateurs réels validés terrain
- Signal explicite que cross-device ou récupération de compte est demandé

---

*Ce document est une référence d'architecture — décisions initiales et état post-clôture.*
*Il doit être relu avant toute ouverture de chantier dans la chaîne :*
*Identité locale → Compte → Mémoire opérateur → Portefeuille → Corrélations.*

---

## 8. État actuel canonique — 2026-06-07

Cette section décrit l'état réel du système après clôture complète de la chaîne ADU-04/05/06 et MEM-01B. Elle est la référence pour tout nouvel intervenant.

### Caps mémoire opérationnels

| Constante | Valeur | Fichier source | Commit |
|---|---|---|---|
| `SESSION_LIMIT` | **50** | `session-repo.js` | `abed3b4` (MEM-01B Bloc A) |
| `HISTORY_LIMIT` | **200** | `data.js` (source unique) | `abed3b4` (MEM-01B Bloc A) |
| `BACKUPS_LIMIT` | **50** | `storage.js` | inchangé |
| `IMPORT_REGISTRY_LIMIT` | **100** | `storage.js` | `1b0f51b` (MEM-01B Bloc D) |
| `PORTFOLIO_SNAPSHOTS_LIMIT` | **50** | `storage.js` | `fa17e6d` (Portefeuille V1 T3) |

### Clés localStorage opérationnelles

**10 clés opérateur — namespacées `__{uuid}` :**

| Clé | Cap | Notes |
|---|---|---|
| `CE_journal_entries_v1__{uuid}` | 200 FIFO | Sessions moteur + historique |
| `CE_behavior_sessions_v1__{uuid}` | 50 FIFO | Sessions comportementales avec snapshot analytique |
| `CE_import_registry_v1__{uuid}` | 100 FIFO | Registre imports — 13 champs V1 |
| `CE_backups_v1__{uuid}` | 50 FIFO | Snapshots moteur — schema enrichi (MEM-01B Bloc B) |
| `CE_settings_v1__{uuid}` | — | Paramètres opérateur |
| `CE_portfolio_v1__{uuid}` | 50 FIFO | Snapshots portefeuille — Portefeuille V1 · `fa17e6d` |
| `cameleon_behavior_memory_v1__{uuid}` | — | Signal comportemental courant (7j TTL) |
| `cameleon.behavior.v1.guardLevel__{uuid}` | 1 valeur | Guard level overtrading |
| `cameleon.behavior.v1.guardLevelUpdatedAt__{uuid}` | 1 valeur | Timestamp guard level |
| `cameleon.behavior.v1.orderStrategyProfile__{uuid}` | 1 valeur | Profil stratégie ordre |

**Clés globales — inchangées :**

| Clé | Rôle |
|---|---|
| `CE_identity_v1` | UUID opérateur — source de vérité identité |
| `CE_ui_state_v1` | État UI navigateur — éphémère |
| `CE_payload_current_v1` | Dernier payload moteur — recalculable |
| `CE_migration_v1_done` | Flag migration legacy → `CE_*` |
| `CE_migration_uuid_v1_done` | Flag migration `CE_*` → namespacé |
| `CE_migration_uuid_cleanup_done` | Flag suppression clés legacy post-migration |

### Pipeline de migration au lancement

```
runMigration()           — migration legacy → CE_* (existant)
  → runUUIDMigration()   — copie CE_* → CE_*__{uuid} (ADU-04B)
    → runUUIDCleanup()   — suppression legacy au 2e lancement (ADU-04B)
```

Session de grâce : si flag migration absent, `withUserKey()` retourne la clé legacy — aucune perte de données.

### Fonctionnalités opérationnelles

| Fonctionnalité | Statut | Commit |
|---|---|---|
| UUID local généré silencieusement | ✅ | `358d9b2` |
| Namespacing 9 clés opérateur | ✅ | `7118244` |
| Migration automatique legacy → UUID | ✅ | `b4eb8d2` |
| Nettoyage clés legacy (2e lancement) | ✅ | `b4eb8d2` |
| Import Registry activé (13 champs) | ✅ | `1b0f51b` |
| Export JSON opérateur complet | ✅ | `7468940` |
| Schema backup enrichi (profil, score, macro) | ✅ | `11019c7` |
| Snapshot analytique session comportementale | ✅ | `b6ec361` |
| Portefeuille V1 — snapshots wallet persistés | ✅ | `88c2edd` (T4) · `2d6d635` (T5 UI) |

### Dettes résiduelles actives

| Dette | Nature | Décision |
|---|---|---|
| ARCH-N3 | QuotaExceededError silencieux sur sessions FIFO | Différée — attendre données terrain |
| DO-02 | Renommage "Mémoire comportementale" → "Signal comportemental courant" | Différée — aucun impact fonctionnel immédiat |
| DO-04 | Multi-opérateur sur même navigateur | Différée V2+ — contournement : profils navigateur |

### Ce qui reste à construire (hors périmètre ADU)

| Entité | Statut | Débloquant |
|---|---|---|
| Mémoire opérateur | Non démarré | Signal terrain post-bêta |
| Portefeuille V1 | ✅ Implémenté | T1–T5 `9275466`→`2d6d635` · snapshots + UI |
| Portefeuille V2+ (valorisation, API) | Différé | Post-mise en ligne |
| Corrélations personnelles | Non démarré | Mémoire opérateur + Portefeuille |
| Compte utilisateur (V2) | Différé | Post-mise en ligne |
