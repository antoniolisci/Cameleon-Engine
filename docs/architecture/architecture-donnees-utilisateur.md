# Architecture données utilisateur — Caméléon Engine

> Document d'architecture · En cours · 2026-06-07 · ADU-01 ✅ `c69b15a` · ADU-02 ✅ `2ac2835` · ADU-03 ✅ ARCH-N1 figée

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
| **Source de vérité** | Clé localStorage dédiée — **inexistante aujourd'hui, à créer**. |

Contenu minimal : identifiant unique · nom optionnel · profil de trading · date de création.

C'est la seule entité nouvelle à créer en V1. Toutes les autres entités existent déjà ou dérivent d'elle.

---

### 2.3 Session moteur

| | |
|---|---|
| **Rôle** | Un instant de décision. La capture de "j'ai analysé ça, à ce moment, dans ces conditions". |
| **Responsabilité** | Enregistrer l'état marché + état opérateur + décision produite. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | FIFO 50 — les plus anciennes sont écrasées, sans TTL explicite. |
| **Source de vérité** | `CE_journal_entries_v1` |

Dans le code actuel, Session moteur et Historique partagent le même stockage. Ce sont deux concepts distincts qui coexistent dans le même objet — dette ARCH-S1, résolue conceptuellement.

---

### 2.4 Session comportementale

| | |
|---|---|
| **Rôle** | Une fenêtre d'observation sur le comportement passé de l'opérateur. |
| **Responsabilité** | Contenir les trades normalisés d'une période + les patterns qui en découlent. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | FIFO 20 · decay 7 jours — goulot d'étranglement documenté. |
| **Source de vérité** | `CE_behavior_sessions_v1` |

Le cap FIFO 20 est une contrainte arbitraire héritée. Sa valeur de remplacement est une décision ouverte (§6).

---

### 2.5 Historique

| | |
|---|---|
| **Rôle** | Log chronologique passif des sessions moteur. |
| **Responsabilité** | Traçabilité — l'opérateur peut consulter ses décisions passées. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | FIFO 50 (même stockage que Sessions moteur). |
| **Source de vérité** | `CE_journal_entries_v1` (partagé avec Sessions moteur) |

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
| **Durée de vie** | Indéfini, pas de cap. |
| **Source de vérité** | `CE_import_registry_v1` |

Chaque entrée ne connaît pas son propriétaire (`user_id` absent). Inutilisable comme fondation de Mémoire opérateur sans ajout du lien identité — dette ARCH-N2.

---

### 2.9 Portefeuille

| | |
|---|---|
| **Rôle** | L'exposition réelle de l'opérateur et son évolution dans le temps. |
| **Responsabilité** | Révéler l'écart entre ce que l'opérateur croit faire et ce qu'il fait vraiment financièrement. |
| **Propriétaire** | Identité locale. |
| **Durée de vie** | Long terme. |
| **Source de vérité** | **N'existe pas encore.** `wallet_analyzer.js` présent mais orphelin — dette ARCH-N5. |

Prérequis : Architecture données + Identité locale (pour rattacher l'exposition à un opérateur).

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
├── possède ──→ [Portefeuille]               — futur
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

[PORTEFEUILLE]
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
| Sessions comportementales | `CE_behavior_sessions_v1` | 20 FIFO · 7j decay | Cap trop bas pour Mémoire opérateur |
| Signal comportemental courant | `cameleon_behavior_memory_v1` | — | ✅ PRIV-01 résolu — centralisé dans `storage.js` (`c69b15a`) |
| Import Registry | `CE_import_registry_v1` | — | Pas de `user_id` par entrée |
| Paramètres | `CE_settings_v1` | — | Non namespacé par opérateur |
| Backups moteur | `CE_backups_v1` | 50 FIFO | Non namespacé par opérateur |
| Guard level overtrading | `cameleon.behavior.v1.guardLevel` | 1 valeur · 7j TTL | Non namespacé |
| **Identité locale** | *inexistante* | — | **À créer** |

### État cible post-Architecture données

| Entité | Clé cible | Nature du changement |
|---|---|---|
| **Identité locale** | `CE_identity_v1` | Nouvelle — fondation de tout le système |
| Sessions moteur | Namespacée sous `user_id` | Migration |
| Sessions comportementales | Namespacée + cap redéfini | Migration + décision cap (§6) |
| Signal comportemental courant | Intégrée dans `storage.js` | Résolution PRIV-01 |
| Import Registry | `user_id` ajouté à chaque entrée | Migration |
| Paramètres | Namespacés sous `user_id` | Migration |
| Backups | Namespacés sous `user_id` | Migration |

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

**Prochain verrou :** le format exact des clés namespacées doit être décidé avant tout code (ex. `CE_{key}_v1_{uuid}` ou autre convention). Cette décision appartient à ADU-03.

**Statut : BLOQUANTE** — le format des clés reste à décider, mais la stratégie de migration est figée.

---

### ARCH-N2 — Import Registry sans user_id

Chaque entrée du registre trace un import mais ne connaît pas son propriétaire.

**Impact :** Le registre ne peut pas servir de fondation à la Mémoire opérateur sans `user_id`. On construirait une mémoire sans sujet.

**Statut : OUVERTE** — `user_id` à ajouter à la structure lors de la migration.

---

### ARCH-N3 — Cap FIFO 20 sessions comportementales non redéfini

Le cap FIFO 20 est documenté comme goulot d'étranglement (faisabilité miroir comportemental). Sa valeur de remplacement n'a jamais été décidée.

**Impact :** Si non redéfini ici, le chantier Mémoire opérateur héritera d'une contrainte arbitraire. Le changer plus tard rouvre une décision d'architecture.

**Statut : OUVERTE** — nouveau cap à décider dans ce chantier (§6).

---

### ARCH-N4 — Pas de mécanisme d'export JSON en V1

En local-first, l'export est le seul mécanisme de backup. Sans export : perte localStorage = perte totale et irrécupérable.

**Impact :** Risque UX majeur + risque RGPD (droit à la portabilité des données). Si non prévu en V1, le chantier Compte utilisateur devra le construire sous contrainte.

**Statut : OUVERTE** — périmètre exact de l'export à décider (§6).

---

### ARCH-N5 — wallet_analyzer.js orphelin

`src/js/behavior/wallet/wallet_analyzer.js` est présent, fonctionne en isolation, mais n'est connecté à aucune interface, aucun pipeline, aucune clé de stockage.

**Impact :** Non bloquant pour ce chantier. Risque de redécouverte et re-implémentation lors du chantier Portefeuille.

**Statut : NON BLOQUANTE** — à documenter comme "présent, non actif, périmètre Portefeuille".

## 6. Décisions ouvertes

Ces décisions doivent être tranchées dans le chantier d'implémentation, pas avant. Elles ne peuvent pas être décidées sur le papier sans signal terrain ou contrainte technique réelle.

| # | Décision | Enjeu | Impact si non tranchée |
|---|---|---|---|
| DO-01 | Nouveau cap FIFO sessions comportementales | 50 ? 100 ? quota dynamique ? | Bloque Mémoire opérateur |
| DO-02 | Renommage officiel "Mémoire comportementale" → "Signal comportemental courant" | Clarté documentaire + code | Confusion persistante avec Mémoire opérateur |
| ~~DO-03~~ | ~~Stratégie de migration des clés existantes~~ | **FIGÉE** — Migration propre avec session de grâce (§6.5) | ✅ Décidée |
| DO-04 | Multi-opérateur sur même navigateur — use case V1 ? | Complexité interface identité | Choix de l'UUID implicite vs sélection explicite |
| DO-05 | Périmètre exact de l'export JSON V1 | Tout le profil ? Sessions comportementales ? Import Registry ? | Portabilité incomplète ou scope trop large |

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
`CE_journal_entries_v1` · `CE_behavior_sessions_v1` · `CE_import_registry_v1` · `CE_backups_v1` · `CE_settings_v1` · `cameleon_behavior_memory_v1` · `cameleon.behavior.v1.guardLevel` · `cameleon.behavior.v1.guardLevelUpdatedAt` · `cameleon.behavior.v1.orderStrategyProfile`

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
| `CE_migration_uuid_v1_done` | Flag migration `CE_*` → namespacé (à créer en ADU-04) |

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

4. → ADU-04 : Créer `CE_identity_v1` + `runUUIDMigration()` + namer toutes les clés

5. Décider nouveau cap FIFO (DO-01)

6. Ajouter user_id à Import Registry (ARCH-N2)

7. Définir périmètre export JSON V1 (DO-04 + DO-05)
```

---

### Prochain chantier : ADU-04

PRIV-01 ✅ · DO-03 ✅ · ARCH-N1 ✅ — tous les verrous conceptuels sont levés. ADU-04 est le premier chantier d'implémentation réelle : `CE_identity_v1`, `runUUIDMigration()`, namespacing complet de toutes les clés opérateur.

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

*Ce document est une référence d'architecture pré-implémentation.*
*Il doit être relu avant toute ouverture de chantier dans la chaîne :*
*Identité locale → Compte → Mémoire opérateur → Portefeuille → Corrélations.*
