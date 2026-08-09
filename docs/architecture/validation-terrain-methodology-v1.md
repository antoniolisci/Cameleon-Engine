# Méthodologie de validation terrain V1 — Caméléon Engine

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | VALIDATION-TERRAIN-V1 |
| Intitulé | Méthodologie de validation terrain V1 |
| Type | Document d'architecture transversal |
| Statut | ACTIF |
| Version | V1 |
| Date | 2026-08-09 |
| Corpus fondateur | LOT-P2-2.F — campagne de validation août 2026 |
| Niveau hiérarchique | N4 — sous Roadmap V1, au-dessus des documents de lot |

---

## §1 Objet et portée

### §1.1 Objet

Ce document formalise la méthodologie de validation terrain applicable à tous les lots de Caméléon Engine. Il extrait les principes transférables d'une campagne réelle et les érige en référence officielle du projet.

Il répond à une question unique :

> **Comment démontrer, de façon reproductible et opposable, qu'un lot satisfait ses critères de clôture sur le comportement réel du système ?**

### §1.2 Portée

Ce document s'applique à tout lot comportant une phase de validation terrain : lots d'ingestion, de persistance, d'interface, de moteur, de mémoire, d'intelligence.

Il ne remplace pas et ne redéfinit pas :
- le contrat du lot (responsabilité du document de cadrage) ;
- les critères de qualité documentaire DQC V2 / DQC V3 (responsabilité de CLAUDE.md) ;
- la doctrine d'ingestion ou toute autre doctrine de domaine.

Il gouverne exclusivement la façon dont la validation terrain est conduite et documentée.

### §1.3 Ce que ce document n'est pas

- Un rapport de lot.
- Une procédure spécifique à un module ou à un format de données.
- Une liste de commandes d'inspection à usage unique.
- Un substitut à la décision opérateur de clôture.

---

## §2 Principes fondamentaux

### PF-1 — Séparation contrat / test / observation

Trois objets distincts structurent toute campagne de validation :

| Objet | Définition | Responsable |
|---|---|---|
| **Contrat** | Ce que le lot s'est engagé à livrer — critères CV et CB | Document de cadrage du lot |
| **Test** | Ce qu'une exécution cherche à démontrer — objectif et conditions | Protocole terrain |
| **Observation** | Ce qui est effectivement constaté pendant l'exécution | Rapport terrain |

Ces trois objets ne se substituent pas. Une observation ne remplace pas un critère contractuel. Un critère contractuel ne préjuge pas du résultat d'un test. Toute confusion entre les trois produit des verdicts non fondés.

**Règle :** Ne jamais transformer une hypothèse en verdict. Toute conclusion doit s'appuyer sur une observation mesurée, pas sur une attente.

### PF-2 — Six états de résultat

Un test produit exactement l'un des six états suivants. Ces états sont exclusifs.

| État | Définition |
|---|---|
| **PASS** | Le comportement observé satisfait le critère contractuel de façon complète et mesurable. |
| **FAIL PRODUIT** | Le comportement observé diffère du critère contractuel — le système ne fait pas ce qu'il doit faire. |
| **FAIL TEST / FIXTURE** | Le test ou la fixture utilisée est incorrecte — la cause ne provient pas du système. |
| **FAIL PROCÉDURE OPÉRATEUR** | L'exécution a produit une erreur de manipulation ou d'interprétation — le système n'est pas en cause. |
| **FAIL OUTILLAGE / ENVIRONNEMENT** | L'erreur provient de l'environnement d'exécution (cache, version, état résiduel, outil d'inspection) — ni le système ni la procédure ne sont en cause. |
| **RÉSULTAT NON CONCLUANT** | L'exécution n'a pas permis d'observer le comportement ciblé — ni PASS ni FAIL ne peuvent être prononcés. |

**Règle :** La catégorie du résultat doit être établie AVANT toute décision de correction. Un FAIL PROCÉDURE OPÉRATEUR ne déclenche pas de correction produit. Un RÉSULTAT NON CONCLUANT déclenche une re-préparation, pas un patch.

### PF-3 — Mesure des deltas, pas des absolus

La validation terrain mesure des variations, pas des états absolus. La valeur d'un compteur après un test n'a de sens que comparée à sa valeur avant.

**Règle :** Toute observation doit être exprimée comme un delta : `valeur_avant → valeur_après = delta_attendu`.

### PF-4 — Isolation des effets

Chaque test doit permettre de démontrer simultanément deux propriétés :
1. Ce qui devait changer a changé.
2. Ce qui ne devait pas changer est resté invariant.

La seconde propriété est aussi importante que la première. Un système qui produit le bon résultat tout en altérant ce qu'il n'aurait pas dû toucher n'est pas validé.

**Règle :** Pour chaque test, définir explicitement ce qui doit changer ET ce qui doit rester invariant.

### PF-5 — Reproductibilité minimale

Un PASS qui ne peut pas être reproduit n'est pas un PASS — c'est une coïncidence. Un FAIL qui ne peut pas être reproduit n'est pas un FAIL — c'est un artefact.

**Règle :** Toute observation doit être accompagnée des éléments minimaux permettant sa reproduction (état initial, action, environnement).

### PF-6 — Clôture par preuves

Un lot ne peut pas être déclaré PASS sur la base d'une impression. La chaîne de clôture est obligatoire :

```
Contrat du lot
  → Critères (CV · CB)
    → Tests définis
      → Exécutions documentées
        → Observations mesurées
          → Verdicts par critère
            → Verdict global
              → Contrôle qualité documentaire (DQC V2)
                → Décision opérateur explicite
                  → Commit de clôture
                    → DQC V3
```

Aucune étape ne peut être sautée. La décision opérateur est une étape obligatoire, pas une formalité.

---

## §3 Préparation d'une campagne

### §3.1 Checklist pré-campagne

Avant toute exécution, les éléments suivants doivent être établis et documentés.

| # | Vérification | Critère de satisfaction |
|---|---|---|
| P1 | Contrat du lot gelé | Le document de cadrage est figé — aucune modification pendante |
| P2 | Critères CV et CB listés | Chaque critère est explicite, mesurable, non ambigu |
| P3 | Fixtures identifiées et qualifiées | Chaque fichier ou jeu de données de test est préqualifié (voir §4) |
| P4 | État initial capturé | Les baselines de référence sont documentées avant la première exécution (voir §5) |
| P5 | Environnement vérifié | La version du code correspond au lot testé · rechargement forcé effectué si nécessaire |
| P6 | Outils d'inspection identifiés | Les commandes ou procédures permettant d'inspecter les états internes sont préparées |
| P7 | Prérequis satisfaits | Les préconditions bloquantes sont vérifiées et documentées |

**Règle :** Une précondition bloquante non satisfaite interdit l'exécution des tests qui en dépendent. L'exécution forcée produit des résultats non exploitables.

### §3.2 Hiérarchie des blocages

Toutes les préconditions ne sont pas équivalentes. Certaines bloquent l'intégralité de la campagne, d'autres uniquement les tests qui en dépendent.

Pour chaque campagne, documenter explicitement :
- les préconditions dont le non-respect bloque l'ensemble de la campagne ;
- les préconditions dont le non-respect bloque uniquement un sous-ensemble de tests.

Cette hiérarchie permet d'exécuter partiellement une campagne même si certains prérequis ne sont pas satisfaits.

### §3.3 Environnement d'exécution

Documenter systématiquement :
- la date d'exécution ;
- l'environnement (navigateur, serveur local, version) ;
- tout rechargement effectué entre les tests (notamment rechargement forcé de cache).

---

## §4 Qualification des fixtures

### §4.1 Définition

Une fixture est tout fichier, donnée, ou jeu d'entrées utilisé comme input d'un test. Une fixture non qualifiée peut produire un résultat qui reflète la fixture, pas le système.

### §4.2 Fiche de qualification d'une fixture

Avant d'utiliser une fixture dans un test, renseigner les champs suivants :

| Champ | Contenu attendu |
|---|---|
| **Identifiant** | Nom du fichier ou identifiant unique de la fixture |
| **Format** | Type de fichier, structure, encodage si pertinent |
| **Contenu déclaré** | Nombre d'enregistrements, cas couverts |
| **Cas représenté** | Quel scénario cette fixture est censée représenter (scénario positif, négatif, limite) |
| **Provenance** | Origine de la fixture (fichier réel, fichier synthétique, fichier généré) |
| **Transformations** | Toute modification appliquée à la source originale |
| **Adéquation au critère** | Confirmation que cette fixture est adaptée au critère testé |
| **Préqualification** | Résultat d'un test préalable confirmant que la fixture produit le comportement attendu pour le scénario visé |

### §4.3 Règles de qualification

**Règle FQ-1 :** Une fixture destinée à un scénario d'ingestion positive doit être préqualifiée comme reconnue par le système avant d'être désignée comme fixture de référence pour ce scénario.

**Règle FQ-2 :** Une fixture utilisée pour un test négatif (rejet attendu) doit être confirmée comme effectivement rejetée par le système avant d'être utilisée pour valider le mécanisme de rejet.

**Règle FQ-3 :** Une mauvaise fixture ne produit pas un FAIL PRODUIT — elle produit un FAIL TEST / FIXTURE. La distinction doit être établie avant toute correction.

---

## §5 Baselines et invariants

### §5.1 Principe de la baseline

La baseline est l'état de référence mesuré avant toute action. Elle permet de calculer le delta produit par chaque exécution.

**Pour chaque campagne, capturer la baseline sur les dimensions pertinentes :**

| Dimension | Exemples génériques |
|---|---|
| Volume du corpus | Nombre de traces par famille mémorielle |
| État du registre | Nombre d'entrées, empreintes présentes |
| État de l'index | Cohérence des axes d'indexation |
| Sessions existantes | Nombre et contenu des sessions actives |
| État mémoire / persistance locale (ex. localStorage) | Clés présentes, taille |
| État de l'interface | Sections visibles, messages affichés |
| Erreurs console | Présence ou absence d'erreurs préexistantes |

**Règle B-1 :** Documenter la baseline AVANT toute exécution. Une baseline capturée après une exécution n'est pas une baseline — c'est un état intermédiaire.

### §5.2 Définition des invariants

Pour chaque test, définir explicitement :

1. **Ce qui doit changer** — et la valeur attendue après l'exécution.
2. **Ce qui ne doit pas changer** — les invariants qui doivent rester stables.

| Exemple générique | Dimension | Invariant ou variation |
|---|---|---|
| Import d'un fichier avec N enregistrements | Corpus famille X | Augmente de N |
| Import d'un fichier avec N enregistrements | Corpus famille Y | Invariant |
| Import réussi | Registre | Augmente d'une entrée |
| Rejet à la détection | Registre | Invariant |
| Clôture normale | Console | Aucune exception nouvelle |

### §5.3 Vérification de la cohérence initiale

Avant toute campagne, vérifier l'absence d'anomalie préexistante dans les structures internes (index incohérent, données malformées, orphelins). Une anomalie préexistante invalide la campagne — les résultats ne pourraient pas être attribués avec certitude aux actions des tests.

**Règle B-2 :** Si une anomalie préexistante est détectée, la campagne est suspendue jusqu'à résolution. Documenter l'anomalie et sa cause.

---

## §6 Exécution et collecte des preuves

### §6.1 Principe d'action contrôlée

Chaque test exécute une seule action à la fois. Un test qui exécute plusieurs actions simultanées ne permet pas d'isoler la cause d'un résultat.

**Séquence d'exécution standard :**

```
1. Capturer la baseline (état avant)
2. Exécuter une seule action contrôlée
3. Mesurer les deltas (état après - état avant)
4. Comparer les deltas aux invariants attendus
5. Produire le verdict : PASS / catégorie de FAIL
6. Documenter les preuves
```

### §6.2 Types de preuves acceptables

| Type de preuve | Exemple générique |
|---|---|
| Valeur d'un compteur avant/après | Nombre de traces : 100 → 142 (delta = 42) |
| Contenu d'un registre avant/après | Entrées : 2 → 3 (entrée ajoutée : {fingerprint, sessionId}) |
| Message affiché dans l'interface | `result = "succès"` · `written = 42` |
| Absence d'exception | Console : aucune erreur nouvelle |
| Vérification structurelle | Cohérence index ↔ corpus : 0 orphelin |
| Comportement après rechargement | Traces toujours présentes après reload |

### §6.3 Règles d'exécution

**Règle EX-1 :** Si un script d'inspection est utilisé (console, outil de développement), il doit être autonome, réexécutable et indépendant de l'état lexical d'une session précédente.

**Règle EX-2 :** Une erreur de syntaxe dans un script d'inspection n'est pas une anomalie produit. Elle signale uniquement une erreur de script.

**Règle EX-3 :** Avant tout accès à une structure de données persistée, vérifier explicitement le type de la structure (tableau, objet, Map) et la forme réelle des identifiants. Une incompatibilité de types produit un résultat non concluant, pas un FAIL PRODUIT.

**Règle EX-4 :** Un résultat symétrique (N erreurs dans les deux sens pour une structure de N éléments) signale une incompatibilité de types d'identifiants, pas une corruption des données.

---

## §7 Classification des incidents et des FAIL

### §7.1 Taxonomie officielle

Tout écart entre le comportement observé et le comportement attendu appartient à l'une des cinq catégories suivantes. Cette classification doit être établie avant toute décision de correction.

| Catégorie | Définition | Déclencheur de correction |
|---|---|---|
| **FAIL PRODUIT** | Le système ne fait pas ce qu'il doit faire selon le contrat. | Correction du code produit après analyse de la cause. |
| **FAIL TEST / FIXTURE** | La fixture ou le cas de test est incorrect ou inadapté au scénario. | Correction ou remplacement de la fixture. Pas de correction produit. |
| **FAIL PROCÉDURE OPÉRATEUR** | L'erreur provient de la manipulation ou de l'interprétation de l'opérateur. | Correction de la procédure. Pas de correction produit. |
| **FAIL OUTILLAGE / ENVIRONNEMENT** | L'erreur provient de l'environnement d'exécution (cache, version, conflit d'état). | Correction de l'environnement. Pas de correction produit. |
| **RÉSULTAT NON CONCLUANT** | L'exécution n'a pas permis d'observer le comportement ciblé. | Re-préparation (fixture, procédure, environnement). Pas de correction produit. |

### §7.2 Règle d'arbitrage

**Règle INC-1 :** Avant de catégoriser un écart comme FAIL PRODUIT, vérifier successivement :
1. La fixture est-elle correcte et préqualifiée ?
2. La procédure d'exécution a-t-elle été respectée exactement ?
3. L'environnement est-il dans un état attendu (cache vidé, version correcte, pas d'état résiduel) ?
4. Le script d'inspection produit-il le bon type d'identifiant ?

Seulement si les quatre questions reçoivent une réponse positive, la catégorie FAIL PRODUIT est justifiée.

**Règle INC-2 :** Une correction produit ne doit jamais être initiée tant que la catégorie de l'incident n'est pas établie.

**Règle INC-3 :** Tout incident doit être documenté dans le rapport terrain avec : symptôme · cause · type · correction appliquée · règle permanente déduite.

### §7.3 Incidents fondateurs (corpus LOT-P2-2.F)

Ces trois incidents, survenus lors de la campagne fondatrice, illustrent les catégories principales. Ils servent de référence historique, pas de règle universelle.

| Incident | Catégorie | Enseignement générique |
|---|---|---|
| Redéclaration de variables dans la console après une session précédente | FAIL OUTILLAGE / ENVIRONNEMENT | Un script d'inspection doit être autonome et indépendant de l'état lexical de la session DevTools |
| Utilisation d'une fixture non reconnue pour un scénario d'ingestion positive | FAIL TEST / FIXTURE | Toute fixture de scénario positif doit être préqualifiée avant usage |
| Application de `Object.keys()` à un tableau au lieu de `Object.values().map(t => t.id)` | FAIL PROCÉDURE OPÉRATEUR | Vérifier le type d'une structure persistée avant d'accéder à ses identifiants |

---

## §8 Tests négatifs, non-écriture et récupération

### §8.1 Importance des tests négatifs

Un système n'est pas validé uniquement parce que les cas nominaux fonctionnent. Les comportements de rejet, de silence et de récupération sont des propriétés contractuelles aussi importantes que les comportements positifs.

Inclure systématiquement dans toute campagne les cas suivants lorsqu'ils sont pertinents au contrat du lot :

| Cas | Comportement attendu générique |
|---|---|
| Fichier vide | Retour explicite · zéro mutation · pas d'exception |
| Structure reconnue mais sans données | Retour explicite · zéro écriture · retour d'état clair |
| Format non reconnu | Rejet immédiat · zéro écriture · pas d'ingestion silencieuse |
| Données malformées | Rejet documenté · état inchangé · pas d'exception |
| Doublon · re-soumission identique | Blocage · rapport explicite · état intact |
| Données exclues contractuellement | Exclusion sans écriture · journal de l'exclusion |
| Re-soumission après rejet légitime | Traitement normal · pas de verrou fantôme |

### §8.2 La non-écriture comme propriété testable

L'absence de mutation est une propriété vérifiable, au même titre que la présence d'une mutation. Formaliser explicitement dans le contrat du test ce qui ne doit pas changer et le vérifier avec la même rigueur que ce qui doit changer.

**Invariants typiques de non-écriture :**

- Registre inchangé (même nombre d'entrées, même contenu)
- Corpus inchangé (même cardinal par famille mémorielle)
- Index inchangé (mêmes sessions, mêmes identifiants)
- Aucune session créée pour l'action testée

**Règle NEG-1 :** Un test négatif dont le résultat est `écrit = 0` et `registre inchangé` doit vérifier les deux propriétés — pas seulement l'une des deux.

### §8.3 Récupération après rejet

Après un rejet légitime, vérifier que le système est dans un état propre permettant une utilisation normale :

- pas de verrou fantôme bloquant la re-soumission ;
- pas de doublon fantôme enregistré pour une action qui n'a pas abouti ;
- pas d'état intermédiaire persisté sans correspondance dans le contrat ;
- re-soumission possible immédiatement si le contrat l'autorise.

**Règle NEG-2 :** Le test de récupération est obligatoire lorsque le contrat du lot spécifie des cas de rejet. Il ne peut pas être omis sous prétexte que le rejet lui-même fonctionne.

---

## §9 Verdict, DQC et clôture

### §9.1 Verdict terrain

Le verdict terrain d'un lot est la synthèse des verdicts par critère. Il ne peut être PASS que si toutes les conditions suivantes sont satisfaites simultanément :

1. Toutes les préconditions bloquantes sont satisfaites.
2. Tous les cas de test contractuels sont PASS.
3. Tous les cas de robustesse contractuels sont PASS.
4. Aucun FAIL PRODUIT non résolu ne subsiste.
5. Tous les incidents documentés ont reçu une classification et une correction (si applicable).

Le verdict terrain est FAIL si l'une quelconque de ces conditions n'est pas satisfaite.

**Règle V-1 :** Le verdict terrain PASS n'autorise pas la clôture du lot — il satisfait uniquement la condition de validation fonctionnelle. Les étapes DQC et décision opérateur sont obligatoires.

### §9.2 Articulation validation terrain / DQC

La validation terrain et le DQC sont deux contrôles complémentaires avec des périmètres strictement distincts.

| Contrôle | Périmètre | Moment d'exécution |
|---|---|---|
| **Validation terrain** | Comportement réel du système sur des données réelles ou représentatives | Avant le commit de clôture |
| **DQC V2** | Qualité intrinsèque du document de rapport terrain (structure, cohérence, doublons, neutralité) | Avant le commit de clôture |
| **DQC V3** | Intégration du document dans l'écosystème documentaire global | Après le commit de clôture |

Ces contrôles ne se substituent pas. Un rapport de validation terrain parfait n'est pas un DQC. Un DQC V2 CAS A n'implique pas un comportement système correct.

### §9.3 Séquence de clôture

La séquence officielle de clôture d'un lot est :

```
1. Contrat du lot figé
2. Préparation de la campagne (P1→P7 satisfaits)
3. Exécution terrain
4. Résolution des incidents et des FAIL PRODUIT
5. Verdict terrain PASS
6. DQC V2 CAS A sur le rapport terrain et le document de cadrage
7. Décision opérateur explicite de clôture
8. Commit de clôture
9. DQC V3
10. Synchronisation mémoire et documentation externe
```

**Règle CL-1 :** La décision opérateur (étape 7) est une étape active, pas une formalité. L'opérateur valide explicitement que le contrat est satisfait et prononce la clôture.

**Règle CL-2 :** Aucune synchronisation de mémoire ou de documentation externe (MEMORY.md, Notion) n'est réalisée avant le DQC V3 (étape 9).

---

## §10 Capitalisation et réutilisation future

### §10.1 Capitalisation des incidents

Tout incident de campagne, même non bloquant, doit être documenté dans le rapport terrain. Pour chaque incident :

| Champ | Contenu |
|---|---|
| Identifiant | INC-XX (numérotation dans la campagne) |
| Phase | Quel test, quelle étape |
| Symptôme | Ce qui a été observé |
| Cause | Pourquoi c'est arrivé |
| Interprétation erronée possible | Ce qu'on aurait pu conclure à tort |
| Réalité confirmée | Ce qui est réellement vrai |
| Type | Catégorie selon §7.1 |
| Correction appliquée | Ce qui a été fait |
| Règle permanente | Ce que les futures campagnes doivent retenir |

### §10.2 Réutilisabilité

Ce document est conçu pour s'appliquer sans modification à tout lot de la Roadmap V1. Pour l'utiliser sur un nouveau lot :

1. Identifier les critères CV et CB contractuels.
2. Définir les baselines pertinentes pour ce lot.
3. Qualifier les fixtures nécessaires.
4. Appliquer les règles de §7.1 pour classifier tout incident.
5. Vérifier les tests négatifs applicables au domaine du lot.
6. Respecter la séquence de clôture §9.3.

Les exemples du corpus fondateur (LOT-P2-2.F) peuvent être utilisés comme références historiques. Ils ne définissent pas les règles universelles — ce document le fait.

### §10.3 Évolution de ce document

Ce document évolue par version (V2, V3…) lorsqu'une campagne réelle produit des enseignements qui le contredisent ou l'étendent. Chaque évolution nécessite :
- une décision opérateur explicite ;
- une justification par un corpus d'expérience réelle ;
- un DQC V2 CAS A sur la nouvelle version.

Un incident isolé sur un lot ne justifie pas une évolution de ce document. Plusieurs incidents convergents sur des lots distincts le justifient.

---

## Annexe A — Glossaire

| Terme | Définition dans ce document |
|---|---|
| **Baseline** | État mesuré avant une exécution, servant de référence pour calculer les deltas |
| **Delta** | Différence entre état après et état avant une exécution |
| **Fixture** | Fichier, donnée ou jeu d'entrées utilisé comme input d'un test |
| **Invariant** | Propriété qui ne doit pas changer lors d'une exécution donnée |
| **Campagne** | Ensemble des exécutions terrain couvrant un lot complet |
| **Précondition** | Condition à satisfaire avant de pouvoir exécuter un test |
| **Verdict terrain** | Synthèse des résultats d'une campagne : PASS ou FAIL |
| **Test négatif** | Test dont le résultat attendu est un rejet ou une absence de mutation |
| **FAIL PRODUIT** | Écart dont la cause est dans le code du système |
| **FAIL TEST / FIXTURE** | Écart dont la cause est dans le test ou la fixture utilisée |
| **FAIL PROCÉDURE OPÉRATEUR** | Écart dont la cause est dans la manipulation ou l'interprétation de l'opérateur — le système n'est pas en cause |
| **FAIL OUTILLAGE / ENVIRONNEMENT** | Écart dont la cause est dans l'environnement d'exécution (cache, version, état résiduel, outil d'inspection) — ni le système ni la procédure ne sont en cause |
| **RÉSULTAT NON CONCLUANT** | Exécution n'ayant pas permis d'observer le comportement ciblé — ni PASS ni FAIL ne peuvent être prononcés |

---

## Annexe B — Modèle générique de fiche de test

```
FICHE DE TEST — [IDENTIFIANT]

Objectif          :
Critère contractuel :
Préconditions     :

Fixtures utilisées :
  - [ID fixture] — [cas représenté] — [préqualifiée : OUI/NON]

Baseline (avant)  :
  - [Dimension 1] : [valeur]
  - [Dimension 2] : [valeur]

Action exécutée   :

Observations (après) :
  - [Dimension 1] : [valeur] → delta = [valeur]
  - [Dimension 2] : [valeur] → delta = [valeur]

Invariants vérifiés :
  - [Dimension X] : [valeur attendue] / [valeur observée] → OK / ÉCART

Verdict           : PASS / FAIL [catégorie]

Preuves           :
  - [type de preuve] : [valeur ou référence]

Incidents détectés : [INC-XX si applicable / Aucun]
```

---

## Annexe C — Checklist de clôture de campagne

Avant de prononcer le verdict terrain PASS :

- [ ] Toutes les préconditions bloquantes étaient satisfaites avant le démarrage.
- [ ] Chaque critère contractuel (CV + CB) a produit un verdict explicite.
- [ ] Chaque FAIL détecté a reçu une classification selon §7.1.
- [ ] Aucun FAIL PRODUIT ne subsiste sans correction documentée.
- [ ] Les tests négatifs et de récupération applicables ont été exécutés.
- [ ] Les baselines et deltas sont documentés pour chaque dimension mesurée.
- [ ] Les invariants ont été vérifiés (ce qui ne devait pas changer est inchangé).
- [ ] Tous les incidents sont documentés avec leur type et leur règle permanente.
- [ ] Le rapport terrain est suffisamment détaillé pour permettre un re-test.
- [ ] La décision opérateur peut s'appuyer sur les preuves documentées.
