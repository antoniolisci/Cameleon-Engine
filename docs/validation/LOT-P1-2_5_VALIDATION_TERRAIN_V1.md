# LOT-P1-2.5 — Validation terrain
## Rapport de validation — Cinquième sous-phase de LOT-P1-2

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-2.5 |
| Titre | Validation terrain |
| Sous-phase de | LOT-P1-2 — Couche de persistance canonique V1 |
| Programme | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Rapport de validation terrain |
| Statut | VALIDATION TERRAIN PARTIELLE — ÉCART DE DÉPLOIEMENT IDENTIFIÉ · SUSPENSION MAINTENUE |
| Document officiel | `docs/validation/LOT-P1-2_5_VALIDATION_TERRAIN_V1.md` |
| Date d'exécution | 2026-07-08 |
| Prérequis satisfaits | LOT-P1-2.2 — VALIDÉ · `8c7a4be` · LOT-P1-2.3 — VALIDÉ · `0596c66` · LOT-P1-2.4 — VALIDÉ · `2057c5d` |
| État implémentation | ML-1→ML-6 livrés · ML-5 : `091065e` · ML-6 : `b46ab70` · cameleonengine.fr : version antérieure à ML-5 |

---

## 1 — Identité et périmètre

LOT-P1-2.5 est la sous-phase terminale de LOT-P1-2. Sa responsabilité est de confirmer, par observation directe en conditions réelles, que la couche de persistance canonique définie et spécifiée dans les sous-phases LOT-P1-2.1 à LOT-P1-2.4 satisfait les critères requis pour la clôture de LOT-P1-2 et du Programme P1.

Ce document est unique : il intègre le protocole de validation en première partie et le rapport de terrain en seconde partie. Aucun document séparé n'est produit pour LOT-P1-2.5.

**Deux ensembles de vérification**

LOT-P1-2.5 vérifie deux ensembles distincts, conformément aux conditions de clôture de LOT-P1-2 (cadrage §10) :

- **Ensemble A — CV1 à CV8** : les huit critères de validation définis dans le cadrage LOT-P1-2 §8.
- **Ensemble B — Critères de clôture P1** : les quatre critères de clôture du Programme P1 définis dans la Roadmap V1 §4.

Ces deux ensembles apparaissent comme deux conditions distinctes du cadrage §10 (condition 3 · condition 5). LOT-P1-2.5 les vérifie séparément.

**Position dans LOT-P1-2**

LOT-P1-2.5 est la cinquième et dernière sous-phase. Elle ne peut commencer qu'après validation de LOT-P1-2.2, LOT-P1-2.3 et LOT-P1-2.4 — prérequis tous satisfaits. Elle n'a pas de dépendance aval. Son verdict permet de constater que les conditions de clôture définies au §10 du cadrage sont satisfaites. La décision de clôture relève de la validation opérateur.

---

## 2 — Protocole de validation

*Défini à l'ouverture de LOT-P1-2.5, conformément au cadrage §6.*

### 2.1 — Périmètre de vérification

La vérification couvre les deux ensembles suivants :

**Ensemble A — CV1 à CV8**
Les huit critères de validation définis dans le cadrage LOT-P1-2 §8. Chaque critère est vérifié individuellement. Le verdict PASS de l'ensemble A requiert que les huit critères reçoivent chacun le verdict PASS.

**Ensemble B — Critères de clôture P1**
Les quatre critères de clôture du Programme P1 définis dans la Roadmap V1 §4. Chaque critère est vérifié individuellement. Le critère n°4 — "Aucune donnée ne quitte l'appareil sans consentement explicite (I-01)" — n'est couvert par aucun des CV1 à CV8 : sa vérification est autonome dans ce document (§5.4).

### 2.2 — Dispositif de vérification

La vérification porte sur les spécifications produites par LOT-P1-2.1, LOT-P1-2.2, LOT-P1-2.3 et LOT-P1-2.4, confrontées aux données réelles de la couche de persistance telle qu'elle existe à la date d'exécution.

Le corpus de référence est constitué des 10 traces mémorielles issues de la migration LOT-P1-2.2, réparties dans les quatre familles ACF V1 actives en Phase A : SY1, SY3, S1, S2.

### 2.3 — Définition des verdicts

Chaque critère reçoit l'un des verdicts suivants :

- **PASS** : l'observation confirme que le critère est satisfait sans réserve.
- **FAIL** : l'observation révèle que le critère n'est pas satisfait, ou ne peut pas être confirmé.
- **NON VÉRIFIABLE EN CONDITIONS ACTUELLES** : la vérification du critère nécessite l'exécution de l'application (observations localStorage, cycles export/import, scénarios UI en navigateur). Non disponible depuis l'environnement de développement courant (iPad-first, absence de localhost actif).

Un verdict FAIL ou NON VÉRIFIABLE sur un critère quelconque — de l'Ensemble A ou de l'Ensemble B — implique que le verdict global ne peut pas être PASS.

### 2.4 — Séquence d'exécution

Les critères sont vérifiés dans l'ordre suivant :

1. CV1 — Modèle canonique de trace satisfait
2. CV2 — Indépendance de la couche
3. CV3 — Indexation opérationnelle
4. CV4 — Provenance systématique
5. CV5 — Aucune perte de données
6. CV6 — Garanties Hardening préservées
7. CV7 — Diagnostic mémoriel non régressé
8. CV8 — Compatibilité export/import préservée
9. Critère Roadmap V1 n°1 — Contenu de chaque trace
10. Critère Roadmap V1 n°2 — Indépendance de la couche
11. Critère Roadmap V1 n°3 — Retrouvabilité par indexation
12. Critère Roadmap V1 n°4 — I-01 local-first

### 2.5 — Condition de blocage

Un verdict FAIL ou NON VÉRIFIABLE ne bloque pas la poursuite de la vérification des critères restants. L'ensemble des critères est vérifié dans tous les cas, afin que le rapport soit complet. La décision finale est portée en §7.

---

## 3 — Exécution terrain

### 3.1 — Conditions d'exécution

| Élément | Valeur |
|---|---|
| Date | 2026-07-08 |
| Heure | 2026-07-08 — session console Chrome sur cameleonengine.fr |
| Environnement d'exécution | cameleonengine.fr · PC Chrome · console DevTools F12 · pré-validation par inspection de code (ML-6 `b46ab70`) |
| Documents de référence soumis | LOT-P1-2.1 · `091d8f1` · LOT-P1-2.2 · `8c7a4be` · LOT-P1-2.3 · `0596c66` · LOT-P1-2.4 · `2057c5d` |
| État de la couche au moment de l'observation | ML-1→ML-6 livrés localement · cameleonengine.fr : version antérieure à ML-5 (commit `091065e` non déployé) |
| Corpus effectivement observé | Observation réelle — 21 clés localStorage présentes · aucune clé canonical trouvée (y compris avec suffixe UUID) |
| Écart identifié | Commits ML-5 (`091065e`) et ML-6 (`b46ab70`) non déployés sur cameleonengine.fr |

### 3.2 — Observations générales

**Pré-validation (ML-6 · `b46ab70`) :** Les critères architecturaux et structurels (indépendance de la couche, mécanismes de validation, gardes) ont été vérifiés par inspection directe du code source. Les critères requérant l'observation de données réelles en localStorage ont été classés NON VÉRIFIABLE EN CONDITIONS ACTUELLES.

**Session terrain (2026-07-08 · cameleonengine.fr · PC Chrome) :** Validation terrain exécutée. Commandes console exécutées : `Object.keys(localStorage).filter(k => k.includes('canonical'))` → résultat `[]` · `Object.keys(localStorage).sort()` → 21 clés listées, aucune clé canonical. Aucune clé `CE_canonical_corpus_v1`, `CE_canonical_index_v1` ou `CE_canonical_migration_v1_done` n'est présente, y compris avec suffixe UUID.

**Cause identifiée — écart de déploiement :** La version déployée sur cameleonengine.fr est antérieure aux commits ML-5 (`091065e`) et ML-6 (`b46ab70`). La couche canonique est implémentée dans le code local mais absente de l'environnement cible. Cette situation ne constitue pas un FAIL fonctionnel du code — les commits locaux sont corrects. Il s'agit d'un écart de version entre l'environnement de développement et l'environnement de production.

**Prérequis à la validation terrain complète :** Déploiement des commits ML-5/ML-6 sur cameleonengine.fr, puis chargement de la page pour déclencher `runCanonicalMigration()`.

---

## 4 — Verdicts CV1 à CV8

### 4.1 — CV1 — Modèle canonique de trace satisfait

**Critère** *(cadrage LOT-P1-2 §8)*

> Toute trace persistée dans la couche canonique contient les quatre champs : famille, source, date, contexte d'origine. Les trois cas particuliers (R1, R3, R4) sont formellement documentés dans le modèle — leur absence de datation est une valeur déclarée, non un champ manquant.

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.1 · `091d8f1` | Définit le modèle canonique de trace — quatre champs, contraintes, états formalisés R1/R3/R4 |
| LOT-P1-2 cadrage §4.2 | Pose les quatre champs obligatoires et leurs contraintes |
| LOT-P1-2 cadrage §8 | Source du critère |

**Observation terrain**

Inspection du code source `src/js/canonical/canonical-model.js` (ML-1 · `91ce454`) :

- Modèle canonique : `{ id, famille, source, date, session, contexte, valeur }` — cinq champs structurels + deux champs de traçabilité.
- Quatre champs obligatoires confirmés par `validateTrace()` : RV1 (famille ∈ CANONICAL_FAMILIES), RV2 (source non vide), RV3 (date ISO 8601 UTC ou état formalisé), RV4 (valeur non nulle, non chaîne vide).
- Contexte : optionnel (RV5 — absence non rejetée). Conforme à la doctrine LOT-P1-2.4 §3.2.
- États formalisés R1/R3 : `DATE_UNAVAILABLE = 'Non disponible'`. État R4 : `DATE_NON_EXPLOITABLE = 'Non exploitable au format canonique'`. Reconnus par `_validateDate()` et autorisés par le modèle — valeur déclarée, non champ manquant.
- Les deux chemins d'écriture (`writeCanonicalTrace` et `writeMigratedTrace` dans canonical-store.js ML-2.1 · `974c7ea`) appellent tous deux `validateTrace()` avant toute persistance — RE1 garanti.
- `canonical-migration.js` (ML-4 · `e70fdad`) : les 10 traces migrées portent toutes `famille`, `source`, `date` (ISO ou formalisé), `valeur`.

**Verdict**

PASS (inspection de code) — Réserve : verdict PASS sur le modèle et les mécanismes de validation. La présence effective des champs dans les traces persistées en localStorage requiert une observation runtime (voir CV5).

---

### 4.2 — CV2 — Indépendance de la couche

**Critère** *(cadrage LOT-P1-2 §8)*

> La couche de persistance canonique n'importe aucune logique applicative. Elle n'appelle aucun moteur. Elle ne connaît que les familles mémoire et les traces. Un remplacement complet de la couche d'implémentation sous-jacente ne devrait pas nécessiter de modification des moteurs qui l'utilisent.

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.2 · `8c7a4be` | Définit la couche de persistance et son principe d'indépendance vis-à-vis des moteurs |
| LOT-P1-2 cadrage §4.5 | Responsabilités de la couche — écriture contrôlée et modes de lecture |
| LOT-P1-2 cadrage §4.6 | Délimite le rôle de la couche — stockage et restitution, aucune logique d'interprétation |
| LOT-P1-2 cadrage §4.7 | Stratégie de coexistence — moteurs non modifiés dans leur logique |
| LOT-P1-2 cadrage §8 | Source du critère |

**Observation terrain**

Inspection des imports de chaque module canonique (ML-5 · `091065e`) :

- `canonical-model.js` : aucune dépendance. Aucun import.
- `canonical-index.js` : `resolveKey` (infrastructure UUID · storage.js) · `CANONICAL_FAMILIES` (canonical-model.js). Aucun module applicatif.
- `canonical-store.js` : `resolveKey` · `validateTrace` · `initCanonicalIndex` · `updateIndex`. Aucun module applicatif.
- `canonical-read.js` : `resolveKey` · `readCorpus` · `INDEX_BASE_KEY` · constantes de dates formalisées. Aucun module applicatif.
- `canonical-migration.js` : `exportOperatorData` · `readEntryUpdatedAt` · `resolveKey` · `KEYS` (storage.js — infrastructure) · `writeMigratedTrace` · constantes canoniques. Aucun module moteur ou décisionnel.

Aucun import depuis `engine.js`, `decision.js`, `trading-policy.js`, `moteur.js`, `render.js`, `behavior/`, `confidence-score.js`, `execution-confidence.js`, `market-state.js`.

Les moteurs applicatifs (décisionnel, comportemental, OI V1) ne sont pas modifiés dans leur logique — leurs appels de persistance passent par `storage.js` inchangé.

**Verdict**

PASS (inspection de code) — Couche canonique structurellement indépendante de toute logique applicative. Aucun moteur n'est importé ni appelé.

---

### 4.3 — CV3 — Indexation opérationnelle

**Critère** *(cadrage LOT-P1-2 §8)*

> La retrouvabilité par famille, par date et par session est vérifiée sur les 14 entrées migrées. Chacun des trois modes de lecture retourne un résultat cohérent avec les données persistées.

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.3 · `0596c66` | Définit l'index triple-axe et les deux modes de lecture ajoutés (date · session) |
| LOT-P1-2.2 · `8c7a4be` | Rend opérationnel le mode de lecture par famille |
| LOT-P1-2 cadrage §4.4 | Architecture de la couche — Niveau 3 Index |
| LOT-P1-2 cadrage §8 | Source du critère |

**Observation terrain**

Pré-validation (ML-6 `b46ab70`) : la vérification de CV3 requiert que `runCanonicalMigration()` ait été exécuté, que l'index soit peuplé et que les trois fonctions de lecture retournent des résultats cohérents avec le corpus. L'inspection de code confirme l'implémentation correcte de l'index triple-axe et des trois modes de lecture.

**Session terrain (2026-07-08 · cameleonengine.fr · PC Chrome) :** Commandes console exécutées. Aucune clé `CE_canonical_index_v1` (ni avec suffixe UUID) trouvée dans localStorage. 21 clés présentes — aucune clé canonical. Cause : écart de déploiement (§3.2) — la couche canonique n'est pas déployée sur l'environnement cible. L'index ne peut pas être observé.

Vigilance documentaire (§6.2) : CV3 cite "14 entrées migrées". La migration (ML-4) porte sur 10 traces mémorielles — les 4 états applicatifs (settings, uiState, payloadCurrent, identity) sont exclus par LOT-P1-2.1 §classification. Cette tension reste portée par le cadrage.

**Verdict**

NON VÉRIFIABLE EN CONDITIONS ACTUELLES — Couche canonique absente de cameleonengine.fr (écart de déploiement ML-5/ML-6). À reprendre après déploiement.

---

### 4.4 — CV4 — Provenance systématique

**Critère** *(cadrage LOT-P1-2 §8)*

> Aucune écriture dans la couche ne peut aboutir sans que la source soit fournie. Le mécanisme de validation est actif et vérifiable — il n'est pas contournable par les modules applicatifs.

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.4 · `2057c5d` | Formalise la règle de provenance comme contrainte architecturale pesant sur toute écriture |
| LOT-P1-2.1 · `091d8f1` | Définit les règles d'écriture dans la couche canonique |
| LOT-P1-2 cadrage §4.5 | Écriture contrôlée — la couche valide les champs obligatoires avant persistance |
| LOT-P1-2 cadrage §8 | Source du critère |

**Observation terrain**

Inspection du code source `canonical-model.js` et `canonical-store.js` :

- RV2 dans `_validateSource(source)` : rejet si `source === null`, si `source === undefined`, si `typeof source !== 'string'`, ou si `source.trim() === ''`. Rejet explicite — pas de complétion silencieuse.
- `validateTrace()` est appelée par `writeCanonicalTrace()` et `writeMigratedTrace()` avant toute écriture dans le corpus (RE1). Si la validation échoue : `return { written: false, errors }` — aucun appel à `_writeCorpus()`.
- Le chemin de contournement est structurellement inexistant : aucune fonction d'écriture dans le corpus n'est exportée directement. Seules `writeCanonicalTrace` et `writeMigratedTrace` sont publiques — toutes deux passent par `validateTrace()`.
- La validation est architecturale, pas documentaire : elle ne peut pas être désactivée sans modifier le code de la couche.

**Verdict**

PASS (inspection de code) — Mécanisme de rejet actif, non contournable, vérifiable dans le code.

---

### 4.5 — CV5 — Aucune perte de données

**Critère** *(cadrage LOT-P1-2 §8)*

> Les 14 entrées existantes sont présentes dans la couche canonique après migration. Leurs valeurs sont identiques à celles observées avant migration. Les trois entrées sans datation normalisée sont dans leur état formalisé : R1 et R3 avec date déclarée "non disponible", R4 avec date déclarée "non exploitable au format canonique" — dans chaque cas, le champ Date porte une valeur formalisée, non laissée nulle par défaut.

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.2 · `8c7a4be` | Définit la migration des 14 entrées et la stratégie de préservation des données d'origine |
| LOT-P1-2.1 · `091d8f1` | Classifie les 14 entrées et formalise les états de datation R1/R3/R4 |
| LOT-P1-2 cadrage §3.2 (OS1) | Objectif secondaire — migration sans perte |
| LOT-P1-2 cadrage §7.1 (R-REG-01) | Risque de perte lors de la migration — mitigation : réversibilité jusqu'à LOT-P1-2.5 |
| LOT-P1-2 cadrage §8 | Source du critère |

**Observation terrain**

Pré-validation (ML-6 `b46ab70`) : la présence effective des traces dans localStorage requiert l'exécution de l'application.

**Session terrain (2026-07-08 · cameleonengine.fr · PC Chrome) :** Aucune clé `CE_canonical_corpus_v1` (ni avec suffixe UUID) trouvée dans localStorage. 21 clés présentes — aucune clé canonical. Cause : écart de déploiement (§3.2) — la migration canonique ne s'est pas déclenchée sur l'environnement cible. Les données d'origine sont intactes dans leurs clés d'origine (absence de suppression confirmée — D9 respecté).

**Tension documentaire consignée (analogue à §6.2 pour CV3) :**
CV5 énonce "Les 14 entrées existantes sont présentes dans la couche canonique après migration." LOT-P1-2.1 classifie les 14 entrées inventoriées par LOT-P1 en deux catégories :
- 10 traces mémorielles → migrées dans le corpus canonique par `runCanonicalMigration()` (ML-4 · `e70fdad`)
- 4 états applicatifs (settings, uiState, payloadCurrent, identity) → exclus de la couche canonique par architecture (LOT-P1-2 cadrage §4.1)

Les 4 états applicatifs ne peuvent pas être "présents dans la couche canonique" : ils n'appartiennent à aucune famille ACF V1 et ne satisfont pas le critère de qualification §4.1. CV5 lu strictement est en tension avec la classification LOT-P1-2.1.

Lecture cohérente avec l'architecture : CV5 est satisfait si les 10 traces mémorielles sont présentes dans le corpus canonique avec les valeurs d'origine, et si les 4 états applicatifs restent intacts dans leurs clés d'origine (D9 — aucune clé d'origine supprimée). Cette lecture est retenue dans l'attente d'une clarification documentaire opérateur.

**Verdict**

NON VÉRIFIABLE EN CONDITIONS ACTUELLES — Couche canonique absente de cameleonengine.fr (écart de déploiement ML-5/ML-6). Données d'origine intactes (D9 confirmé). À reprendre après déploiement. Tension documentaire CV5 vs LOT-P1-2.1 §classification consignée — décision opérateur attendue si nécessaire.

---

### 4.6 — CV6 — Garanties Hardening préservées

**Critère** *(cadrage LOT-P1-2 §8)*

> Les gardes introduits par LOT-H01 et LOT-H02 sont présents et actifs dans la couche canonique.

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.2 · `8c7a4be` | Définit la préservation des garanties Hardening comme objectif secondaire (OS2) |
| LOT-H01 · `11e8788` | Définit les gardes P1/P2 — gestion réseau et erreurs |
| LOT-H02 · `2306525` | Définit les gardes P3/P4/P5 — onboarding storage, email, import |
| LOT-P1-2 cadrage §3.2 (OS2) | Objectif secondaire — préservation des garanties LOT-H01/LOT-H02 |
| LOT-P1-2 cadrage §7.1 (R-REG-02) | Risque de rupture des garanties Hardening lors de la refonte |
| LOT-P1-2 cadrage §8 | Source du critère |

**Observation terrain**

Inspection des modifications réalisées dans ML-1 à ML-5 au regard des cinq gardes LOT-H01/LOT-H02 :

- **P1 — `.catch()` sur `getSession()`** (LOT-H01 · `11e8788`) : dans les modules d'authentification Supabase. Non modifié dans aucun micro-lot LOT-P1-2. Garde présent.
- **P2 — `_mapSendError()`** (LOT-H01 · `11e8788`) : dans les modules d'authentification. Non modifié. Garde présent.
- **P3 — Accesseur `onboarding` centralisé** (LOT-H02 · `2306525`) : dans `storage.js`. Les modifications ML-4/ML-5 dans `storage.js` portent sur les sections "Accès métadonnées" et "Portabilité". L'accesseur `onboarding` (section distincte) n'a pas été touché. Garde présent.
- **P4 — Validation email regex** (LOT-H02 · `2306525`) : dans `account-ui.js`. Non modifié dans aucun micro-lot LOT-P1-2. Garde présent.
- **P5 — Garde taille 5 Mo avant import JSON** (LOT-H02 · `2306525`) : dans `render.js`, avant l'appel à `importOperatorData()`. `render.js` n'a pas été modifié dans LOT-P1-2. Garde présent.

Aucun des cinq gardes Hardening n'a été modifié, retiré ou contourné dans les micro-lots ML-1 à ML-5.

**Verdict**

PASS (inspection de code) — Les cinq gardes LOT-H01/LOT-H02 sont présents et intacts. Aucune modification dans les fichiers qui les contiennent.

---

### 4.7 — CV7 — Diagnostic mémoriel non régressé

**Critère** *(cadrage LOT-P1-2 §8)*

> Le Diagnostic mémoriel (LOT-P1) affiche des données cohérentes après migration. Aucun des 19 scénarios de validation de LOT-P1 ne régresse.

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1 · `2223e15` | Définit les 19 scénarios de validation du diagnostic mémoriel |
| LOT-P1-2 cadrage §7.4 (R-UX-01) | Risque de régression du Diagnostic mémoriel lors de la modification de la couche |
| LOT-P1-2 cadrage §8 | Source du critère |

**Observation terrain**

Pré-validation (ML-6 `b46ab70`) : la vérification des 19 scénarios LOT-P1 requiert l'exécution de l'application. L'inspection de code n'identifie aucun chemin de régression — `readMemoryDiagnostic()` est non modifié, les clés d'origine sont préservées (D9), la décision D7 maintient la compatibilité prioritaire.

**Session terrain (2026-07-08 · cameleonengine.fr · PC Chrome) :** Le diagnostic mémoriel (onglet Mémoire) n'a pas été navigué dans cette session. La session terrain a été interrompue à l'étape de vérification des clés canonical (résultat `[]`) — la cause étant un écart de déploiement (§3.2). Le test de non-régression de CV7 (19 scénarios LOT-P1 post-migration) requiert que la migration canonique ait été déclenchée sur l'environnement cible. Sans ML-5 déployé, l'état pré-migration et l'état post-migration sont identiques — le test de non-régression n'est pas applicable dans ces conditions.

**Verdict**

NON VÉRIFIABLE EN CONDITIONS ACTUELLES — Onglet Mémoire non testé dans la session terrain du 2026-07-08. Test de non-régression post-migration applicable uniquement après déploiement ML-5/ML-6. L'analyse de code n'identifie aucun chemin de régression.

---

### 4.8 — CV8 — Compatibilité export/import préservée

**Critère** *(cadrage LOT-P1-2 §8)*

> Les fichiers d'export produits par le Compte Utilisateur V1 avant la migration restent importables après migration. Aucune perte de données n'est introduite par un import d'un export antérieur à LOT-P1-2. La procédure de conversion éventuelle est documentée et testée avant validation de LOT-P1-2.5.

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.2 · `8c7a4be` | Définit la stratégie de coexistence et la compatibilité avec les exports antérieurs |
| Compte Utilisateur V1 — LOT 1 · `0ae38b6` | Définit l'export/import des 12 clés |
| LOT-P1-2 cadrage §5 | Flux Export et Restauration dans la couche canonique |
| LOT-P1-2 cadrage §7.1 (R-REG-03) | Risque de rupture de la compatibilité export/import |
| LOT-P1-2 cadrage §8 | Source du critère |

**Observation terrain**

Pré-validation (ML-6 `b46ab70`) : la vérification de CV8 requiert un cycle export/import réel sur un système avec ML-5 déployé.

**Session terrain (2026-07-08 · cameleonengine.fr · PC Chrome) :** La version déployée sur cameleonengine.fr est antérieure à ML-5. Le cycle export/import ne peut pas tester la partie canonique (clés `canonicalCorpus`, `canonicalIndex`) car elles sont absentes du système déployé. La compatibilité pour les 12 clés existantes n'a pas été testée dans cette session (focus sur l'identification de l'écart de déploiement). CV8 reste NON VÉRIFIABLE dans son intégralité.

**Analyse de compatibilité par inspection de code (ML-5 · `091065e`) :**
- Compatibilité ascendante (ancien export → nouveau système) : le bloc de restauration des clés canoniques dans `importOperatorData()` utilise des gardes `if (d.canonicalCorpus !== undefined)` et `if (d.canonicalIndex !== undefined)`. Un export antérieur sans ces clés les ignore sans erreur. Le drapeau de migration est effacé (`localStorage.removeItem(...)`) afin que `runCanonicalMigration()` se relance au prochain `loadState()`.
- Compatibilité descendante (nouveau export avec clés canoniques → restauration) : `canonicalCorpus` et `canonicalIndex` sont restaurés via `_write()` si présents dans l'export. Drapeau de migration positionné à '1'.
- Rupture de format : aucune — le format `{ version: 1, engine: 'cameleon-engine', data: {...} }` est préservé. Les nouvelles clés s'ajoutent à `data` sans modifier la structure ni les validations existantes.

Cette analyse de code ne remplace pas le test d'un cycle export/import réel.

**Verdict**

NON VÉRIFIABLE EN CONDITIONS ACTUELLES — Couche canonique absente de cameleonengine.fr (écart de déploiement ML-5/ML-6). Cycle export/import non testé dans la session du 2026-07-08. L'analyse de code indique une compatibilité correctement implémentée. À reprendre après déploiement.

---

## 5 — Verdicts des critères de clôture du Programme P1

Les quatre critères de clôture du Programme P1 sont définis dans Roadmap V1 §4. Leur relation documentaire avec les critères CV1 à CV8 est consignée en §6.1. LOT-P1-2.5 les vérifie séparément conformément au cadrage §10.

### 5.1 — Critère 1

**Critère** *(Roadmap V1 §4)*

> Toute trace persistée contient : famille · source · date · contexte d'origine

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.1 · `091d8f1` | Définit le modèle canonique de trace — les quatre champs requis par ce critère |
| LOT-P1-2 cadrage §4.2 | Pose les quatre champs obligatoires et leurs contraintes |
| Roadmap V1 §4 | Source du critère |

**Observation terrain**

Même analyse que CV1 (§4.1). Les quatre champs sont validés par `validateTrace()` (RV1-RV4). Le contexte est optionnel (RV5) — sa présence n'est pas requise pour la validité de la trace. Le critère Roadmap V1 énonce "contexte d'origine" mais ne le rend pas obligatoire — lecture cohérente avec RV5.

**Verdict**

PASS (inspection de code) — Même analyse et même réserve que CV1 : la présence effective dans les traces persistées requiert une observation runtime.

---

### 5.2 — Critère 2

**Critère** *(Roadmap V1 §4)*

> La couche est indépendante de tout moteur applicatif

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.2 · `8c7a4be` | Définit la couche de persistance canonique et son principe d'indépendance |
| LOT-P1-2 cadrage §4.7 | Stratégie de coexistence — moteurs non modifiés dans leur logique |
| Roadmap V1 §4 | Source du critère |

**Observation terrain**

Même analyse que CV2 (§4.2). Aucun module applicatif importé par la couche canonique.

**Verdict**

PASS (inspection de code) — Même analyse que CV2.

---

### 5.3 — Critère 3

**Critère** *(Roadmap V1 §4)*

> L'indexation permet retrouvabilité par famille, par date, par session

**Références documentaires**

| Document | Rôle |
|---|---|
| LOT-P1-2.3 · `0596c66` | Définit l'index triple-axe et les modes de lecture par date et par session |
| LOT-P1-2.2 · `8c7a4be` | Rend opérationnel le mode de lecture par famille |
| LOT-P1-2 cadrage §4.4 | Architecture de la couche — Niveau 3 Index |
| Roadmap V1 §4 | Source du critère |

**Observation terrain**

Même situation que CV3 (§4.3). L'implémentation est présente dans le code (`readByFamille`, `readByDateRange`, `readBySession`). Session terrain du 2026-07-08 : aucune clé canonical trouvée sur cameleonengine.fr — même cause et même constat que CV3.

**Verdict**

NON VÉRIFIABLE EN CONDITIONS ACTUELLES — Même observation et même cause que CV3 : couche canonique absente de cameleonengine.fr (écart de déploiement ML-5/ML-6). À reprendre après déploiement.

---

### 5.4 — Critère 4

**Critère** *(Roadmap V1 §4)*

> Aucune donnée ne quitte l'appareil sans consentement explicite (I-01)

Ce critère est défini par Roadmap V1 §4. Aucun des critères CV1 à CV8 du cadrage LOT-P1-2 §8 ne lui est dédié. Il possède donc sa propre observation terrain dans cette section.

**Références documentaires**

| Document | Rôle |
|---|---|
| Roadmap V1 §4 | Source du critère |
| ACF V1 — I-01 | Invariant local-first — fondement du critère |
| LOT-P1-2 cadrage §11 | Conformité I-01 — couche strictement locale, aucune interface réseau |

**Observation terrain**

Inspection des imports et des appels réseau dans la couche canonique :

- `canonical-model.js` : aucun import, aucun appel réseau. Constantes et validation pure.
- `canonical-index.js` : aucun appel réseau. Opérations localStorage uniquement.
- `canonical-store.js` : aucun appel réseau. Opérations localStorage uniquement.
- `canonical-read.js` : aucun appel réseau. Lecture localStorage uniquement.
- `canonical-migration.js` : accède à `exportOperatorData()` (lecture localStorage) et `writeMigratedTrace()` (écriture localStorage). Aucun appel réseau.
- `resolveKey()` dans `storage.js` : wrapper de `withUserKey()`. Aucun appel réseau.
- `initCanonicalStore()` et `runCanonicalMigration()` dans `state.js` : appelés lors de `loadState()`. Aucun appel réseau.

La couche canonique est strictement locale. Elle ne dispose d'aucune interface réseau, d'aucun import de module Supabase ou fetch, d'aucun appel asynchrone orienté réseau.

**Verdict**

PASS (inspection de code) — Aucune donnée ne quitte l'appareil via la couche canonique. Conformité I-01 maintenue.

---

## 6 — Vigilances documentaires

### 6.1 — Deux ensembles de vérification

Le cadrage LOT-P1-2 §8 indique que les critères CV1 à CV8 "reprennent et précisent" les quatre critères de clôture du Programme P1 définis dans Roadmap V1 §4. Le cadrage §10 présente les deux ensembles comme deux conditions distinctes de clôture : condition 3 (CV1 à CV8) et condition 5 (critères Roadmap V1 §4). LOT-P1-2.5 les vérifie séparément conformément au cadrage.

### 6.2 — CV3 — Périmètre exact

CV3 est cité et vérifié tel qu'écrit dans le cadrage LOT-P1-2 §8. LOT-P1-2.5 ne restreint pas, ne réinterprète pas et n'étend pas ce critère. La tension documentaire autour de l'expression "14 entrées migrées" reste portée par le cadrage.

### 6.3 — Critère Roadmap n°4 — Vérification hors CV dédié

Le critère Roadmap V1 n°4 est défini dans Roadmap V1 §4. Aucun critère CV1 à CV8 ne lui est directement dédié. LOT-P1-2.5 le vérifie explicitement en §5.4.

### 6.4 — CV5 — Tension "14 entrées" vs classification LOT-P1-2.1

CV5 dit "14 entrées présentes dans la couche canonique". LOT-P1-2.1 classe 4 de ces 14 entrées comme états applicatifs (hors couche canonique par architecture). Cette tension est documentée en §4.5. Elle ne constitue pas un FAIL structurel — elle nécessite une clarification documentaire si l'opérateur souhaite une lecture stricte du critère.

---

## 7 — Synthèse et décision de clôture

### 7.1 — Tableau de synthèse

| Critère | Verdict | Observation |
|---|---|---|
| CV1 — Modèle canonique de trace satisfait | PASS (inspection code) | Modèle validé (RV1-RV4), états R1/R3/R4 formalisés. Réserve : données réelles non observées. |
| CV2 — Indépendance de la couche | PASS (inspection code) | Aucun import applicatif dans les 5 modules canoniques. |
| CV3 — Indexation opérationnelle | NON VÉRIFIABLE | Nécessite exécution applicative + observation localStorage. |
| CV4 — Provenance systématique | PASS (inspection code) | RV2 actif, contournement structurellement impossible. |
| CV5 — Aucune perte de données | NON VÉRIFIABLE | Nécessite observation corpus post-migration. Tension documentaire "14 entrées" consignée. |
| CV6 — Garanties Hardening préservées | PASS (inspection code) | 5 gardes P1→P5 intacts. Fichiers concernés non modifiés. |
| CV7 — Diagnostic mémoriel non régressé | NON VÉRIFIABLE | Nécessite 19 scénarios sur app réelle. Aucune régression identifiée par code. |
| CV8 — Compatibilité export/import préservée | NON VÉRIFIABLE | Nécessite cycle export/import réel. Logique de compatibilité implémentée. |
| Roadmap V1 §4 — Critère 1 — Contenu de chaque trace | PASS (inspection code) | Même analyse que CV1. |
| Roadmap V1 §4 — Critère 2 — Indépendance de la couche | PASS (inspection code) | Même analyse que CV2. |
| Roadmap V1 §4 — Critère 3 — Retrouvabilité par indexation | NON VÉRIFIABLE | Même analyse que CV3. |
| Roadmap V1 §4 — Critère 4 — I-01 local-first | PASS (inspection code) | Aucune interface réseau dans la couche canonique. |

**Récapitulatif :** 7 PASS (inspection code) · 5 NON VÉRIFIABLE · 0 FAIL.

### 7.2 — Vérification des conditions du cadrage §10

Le cadrage LOT-P1-2 §10 définit cinq conditions de clôture. Chacune est vérifiée ci-dessous.

**Condition 1** — "Les sous-phases LOT-P1-2.1, LOT-P1-2.2, LOT-P1-2.3 et LOT-P1-2.4 ont chacune reçu une validation documentée."

Observation : LOT-P1-2.1 validé `091d8f1` · LOT-P1-2.2 validé `8c7a4be` · LOT-P1-2.3 validé `0596c66` · LOT-P1-2.4 validé `2057c5d`. Toutes documentées, DQC V2 CAS A.

Statut : SATISFAITE

---

**Condition 2** — "La sous-phase LOT-P1-2.5 (validation terrain) a été exécutée par l'opérateur."

Observation terrain : La validation terrain a été exécutée le 2026-07-08 sur cameleonengine.fr (PC Chrome). Un écart de déploiement a été identifié : les commits ML-5 (`091065e`) et ML-6 (`b46ab70`) ne sont pas déployés sur l'environnement cible. La couche canonique est absente du localStorage observé (21 clés présentes, aucune clé canonical). La validation terrain des critères CV3, CV5, CV7, CV8 et Roadmap Critère 3 reste en attente du déploiement.

Statut : PARTIELLEMENT SATISFAITE — Exécution terrain réalisée · écart de déploiement identifié · CV3, CV5, CV7, CV8, Roadmap Critère 3 NON VÉRIFIABLE en attente de déploiement ML-5/ML-6.

---

**Condition 3** — "Les huit critères de validation (CV1 à CV8) ont tous reçu le verdict PASS."

Observation : Voir §4. CV3, CV5, CV7, CV8 sont NON VÉRIFIABLE EN CONDITIONS ACTUELLES.

Statut : NON SATISFAITE EN CONDITIONS ACTUELLES

---

**Condition 4** — "Le rapport de validation terrain a été produit et consigné."

Observation : Le présent document constitue le rapport de validation terrain de LOT-P1-2.5. Produit dans le cadre de ML-6. Consigné dans `docs/validation/LOT-P1-2_5_VALIDATION_TERRAIN_V1.md`.

Statut : SATISFAITE (rapport produit et consigné)

---

**Condition 5** — "Le Programme P1 satisfait ses quatre critères de clôture tels que définis dans la Roadmap V1 (§4)."

Observation : Voir §5. Critère 3 NON VÉRIFIABLE EN CONDITIONS ACTUELLES.

Statut : NON SATISFAITE EN CONDITIONS ACTUELLES

### 7.3 — Décision

**Verdict global : NON VÉRIFIABLE — VERDICT GLOBAL SUSPENDU**

Motif : 5 critères (CV3, CV5, CV7, CV8, Roadmap Critère 3) sont NON VÉRIFIABLE EN CONDITIONS ACTUELLES. Aucun FAIL fonctionnel n'est prononcé sur le code local.

**Session terrain du 2026-07-08 (cameleonengine.fr · PC Chrome) :** Écart de déploiement identifié. Les commits ML-5 (`091065e`) et ML-6 (`b46ab70`) ne sont pas déployés sur cameleonengine.fr. 21 clés localStorage observées — aucune clé canonical. La suspension du verdict est maintenue. Cette observation ne remet pas en cause la correction du code local.

**Prérequis au prochain cycle de validation :**

1. Déployer les commits ML-5 (`091065e`) et ML-6 (`b46ab70`) sur cameleonengine.fr.
2. Charger la page pour déclencher `runCanonicalMigration()`.
3. Exécuter le guide opérateur `docs/validation/GUIDE_OPERATEUR_ML6_TERRAIN.md`.

**Ce qui reste à vérifier après déploiement :**

| Critère | Action requise |
|---|---|
| CV3 | Vérifier dans la console que `CE_canonical_index_v1` (namespacé) est peuplé. Tester les trois fonctions de lecture par famille, date et session. |
| CV5 | Observer le corpus `CE_canonical_corpus_v1` (namespacé). Vérifier 10 traces · champs RV1-RV4 · dates R1/R3/R4 formalisées. |
| CV7 | Naviguer dans l'onglet Mémoire. Vérifier les 19 scénarios LOT-P1. Confirmer absence de régression post-migration. |
| CV8 | Cycle export/import complet. Tester compatibilité ancien format (sans canonicalCorpus). Vérifier restauration des 12 clés + clés canoniques. |
| Roadmap Critère 3 | Même vérification que CV3 — retrouvabilité par famille, date, session confirmée sur données réelles. |

**Décision de clôture de LOT-P1-2 :** Suspendue. À reprendre après déploiement ML-5/ML-6 et validation terrain complète.

[À renseigner par l'opérateur après validation terrain complète]

---

## 8 — Conditions de suppression des données d'origine

### 8.1 — Fondement documentaire

| Document | Section |
|---|---|
| LOT-P1-2 cadrage | §4.7 — Stratégie de coexistence avec l'ancienne couche |
| LOT-P1-2.2 · `8c7a4be` | §5.3 — Préservation des données d'origine et réversibilité |

### 8.2 — Conditions préalables

Les documents cités en §8.1 posent les conditions suivantes.

**Condition A — Validation complète de LOT-P1-2.5**

LOT-P1-2.2 §5.3 indique que la suppression "n'est autorisée qu'à l'issue de la validation complète de LOT-P1-2.5 (validation terrain)". Le cadrage LOT-P1-2 §4.7 situe la même disposition "à l'issue de la validation de LOT-P1-2.5".

Observation terrain : LOT-P1-2.5 est en cours (pré-validation produite). La validation terrain complète (CV3, CV5, CV7, CV8) n'est pas encore exécutée. Condition A : NON SATISFAITE.

**Condition B — Résultat de la validation**

LOT-P1-2.2 §5.3 indique que "si la validation de LOT-P1-2.5 conclut à un échec, les données d'origine permettent un retour à l'état précédent sans perte".

Observation terrain : Verdict global LOT-P1-2.5 suspendu (§7.3). Condition B : NON APPLICABLE EN CONDITIONS ACTUELLES.

**Condition C — Simultaneité**

LOT-P1-2.2 §5.3 indique que la suppression "est simultanée pour l'ensemble des entrées migrées" et qu'"aucune suppression partielle par famille n'est autorisée avant cette validation".

Observation terrain : La suppression n'est pas autorisée à ce stade (Conditions A et B non satisfaites). Condition C : NON APPLICABLE EN CONDITIONS ACTUELLES.

### 8.3 — Constat documentaire

Le cadrage LOT-P1-2 §4.7 indique qu'à l'issue de la validation de LOT-P1-2.5, "les données dans leur format antérieur sont considérées obsolètes et peuvent être supprimées".

LOT-P1-2.2 §5.3 précise que cette opération est simultanée pour l'ensemble des entrées migrées et qu'aucune suppression partielle par famille n'est autorisée avant la validation complète.

### 8.4 — Périmètre de responsabilité

Le présent document constate l'état des conditions documentaires définies au §8.2. Il ne réalise aucune suppression. La suppression éventuelle des données d'origine relève d'une action opérateur distincte, conformément à la gouvernance documentaire.

**Conclusion §8 : La suppression des données d'origine n'est pas autorisée à ce stade. Les conditions A, B et C ne sont pas satisfaites.**

---

## 9 — Prochaine étape

### 9.1 — Situation documentaire

Le présent document constitue le rapport de validation terrain de LOT-P1-2.5, tel que prévu par le cadrage LOT-P1-2 §6 et §10. Produit dans le cadre de ML-6 (`b46ab70`) et mis à jour suite à la session terrain du 2026-07-08 sur cameleonengine.fr (PC Chrome).

**Ce rapport distingue :**
1. **Vérifié (PASS code)** : CV1, CV2, CV4, CV6, Roadmap 1, Roadmap 2, Roadmap 4 — vérifiés par inspection directe du code source.
2. **Non vérifiable** : CV3, CV5, CV7, CV8, Roadmap 3 — nécessitent l'exécution de l'application sur l'environnement cible.
3. **Bloqué** : aucun critère bloqué au sens FAIL — zéro FAIL constaté.
4. **À tester ultérieurement** : CV3, CV5, CV7, CV8, Roadmap 3 — classification terrain à effectuer lors de l'exécution applicative réelle.

### 9.2 — Décision opérateur

La décision de clôture de LOT-P1-2 appartient à l'opérateur. Elle ne peut intervenir qu'après validation terrain réelle des critères CV3, CV5, CV7 et CV8 (+ Roadmap Critère 3) sur l'environnement cible.

**Actions requises avant tout verdict PASS :**
1. Déployer les commits ML-5 (`091065e`) et ML-6 (`b46ab70`) sur cameleonengine.fr.
2. Charger l'application sur l'environnement cible (PC Chrome ou iPad Chrome).
3. Vérifier dans la console que `runCanonicalMigration()` s'est exécuté (drapeau `"1"` · corpus peuplé).
4. Observer et consigner les données du corpus et de l'index.
5. Naviguer dans l'onglet Mémoire et vérifier les 19 scénarios LOT-P1.
6. Réaliser le cycle export/import et vérifier les données restaurées.
7. Reporter les observations dans ce rapport et prononcer les 5 verdicts (CV3, CV5, CV7, CV8, Roadmap Critère 3).
8. Prononcer le verdict global.

Décision opérateur :

[À renseigner après validation terrain réelle]

### 9.3 — Suites documentaires

Le cadrage LOT-P1-2 §10 prévoit que la clôture de LOT-P1-2 est conditionnée par la satisfaction des cinq conditions qui y sont définies et par une décision opérateur. Le présent rapport ne décide pas de cette clôture.

Conformément au cadrage LOT-P1-2 §10, si la décision opérateur est favorable après validation terrain complète, les documents indiquent que les conditions de clôture de LOT-P1-2 pourront être constatées. Les suites éventuelles — clôture de LOT-P1-2, état du Programme P1, séquence Roadmap V1 — relèvent de décisions opérateur distinctes, sous réserve des critères définis dans les documents de référence applicables.

Le présent rapport ne décide d'aucune de ces suites.

---

*Rapport de validation terrain LOT-P1-2.5 — Programme P1 · Phase A · Caméléon Engine · 2026-07-08.*
*7 critères vérifiés (code) · 5 critères NON VÉRIFIABLE · écart de déploiement ML-5/ML-6 identifié le 2026-07-08.*
