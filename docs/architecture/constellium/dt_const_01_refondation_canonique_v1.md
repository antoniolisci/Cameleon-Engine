# DT-CONST-01 — Refondation Canonique du Constellium · Décision Architecturale V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | DT-CONST-01 |
| Intitulé | Refondation Canonique du Constellium |
| Type | Décision Architecturale — niveau système |
| Statut | **ADOPTÉE** |
| Date d'adoption | 2026-08-14 |
| Contexte de production | LOT-P2-4 — Schéma canonique S5 · Audit AUDIT-CONSTELLIUM-01 |
| Verdict de préparation | CONST-FINAL-B — Prête pour adoption avec dette non bloquante explicite |
| Acte d'adoption | Décision opérateur — 2026-08-14 |
| Document officiel | `docs/architecture/constellium/dt_const_01_refondation_canonique_v1.md` |

---

## §1 Contexte de refondation

### §1.1 Situation à l'ouverture

Au moment de l'ouverture de LOT-P2-4 (2026-08-11), le terme "Constellium" désignait plusieurs réalités architecturalement distinctes dans le corpus documentaire de Caméléon Engine.

**Sens A — Héritage technique :** les cinq variables de scoring `ether`, `fire`, `air`, `earth`, `water`, présentes dans `computeScore()` et groupées sous la clé `payload.constellium` dans `buildPayload()`. Ces variables sont actives depuis le premier commit du moteur (2026-04-06). Elles sont documentées comme Couche 1 Moteur et Couche 5 Expression, avec la dette `CST-NAME` reconnue dans `constellium_code_audit_2026.md`.

**Sens B — Définition produit V1 :** "Le Constellium est la visualisation des liens entre les traces du décideur." Adopté 2026-06-18, documenté dans `constellium_v1_definition.md`, gelé dans `CONSTELLIUM_V1_CLOSURE.md`.

La coexistence de ces deux sens sans définition canonique unifiée constituait une ambiguïté architecturale identifiée sous `CST-NAME`. Cette ambiguïté bloquait partiellement la résolution de DT-S5-4 (périmètre Phase A de LOT-P2-4), dont certains champs formulaire recoupaient le périmètre Sens A.

### §1.2 Processus de refondation

La refondation a été conduite en cinq phases successives :

1. **AUDIT-CONSTELLIUM-01** — Généalogie factuelle : contexte de chaque sens, chronologie, sujet canonique des cinq forces. Conclusion : FORCE-SUBJECT-C — sujet canonique ambigu, non résolu.
2. **DQC Correctif AUDIT-CONSTELLIUM-01** — Correction d'une anomalie méthodologique : substitution d'hypothèses dans le rapport initial. Hypothèses H-CONST-01/02/03 retestées exactement comme formulées.
3. **DT-CONST-01 Rapport contradictoire** — Instruction de la direction candidate : "CE = moteur d'intelligence, Constellium = espace relationnel de représentation". Verdict : CONST-REF-B.
4. **Passe normative finale** — Audit de six frontières critiques. Corrections appliquées sur la validation humaine, les recherches vs découvertes analytiques, la propriété des relations, la non-rétroactivité des cinq forces, la distinction connaissance vs compréhension. Verdict : CONST-NORM-B.
5. **Fermeture normative** — Résolution des trois résidus (connaissance externe non canonique, prescription visuelle, souveraineté de la validation humaine). Production du candidat normatif complet à treize invariants. Verdict : CONST-FINAL-B.

### §1.3 Principe de continuité historique

Le terme "Constellium" a historiquement été appliqué à plusieurs réalités distinctes.

DT-CONST-01 fixe désormais le sens canonique utilisé pour l'architecture future de Caméléon Engine.

Les usages techniques historiques restent documentés comme héritage du système.

---

## §2 Paragraphe fondateur

> **Le Constellium est l'espace relationnel de représentation et de navigation des traces, connaissances et relations produites, structurées ou qualifiées par Caméléon Engine.**
>
> Il ne produit pas de vérité analytique autonome.
>
> Il révèle des connexions, contextualise par la provenance et les niveaux de confiance, rend les structures intelligibles, et permet à l'opérateur de naviguer dans l'histoire de sa compréhension.
>
> La compréhension émerge de l'humain — le Constellium n'en est pas l'auteur.
>
> La décision reste humaine.
>
> La direction de flux est strictement Caméléon Engine → Constellium → Humain.

---

## §3 Frontière canonique CE / Constellium / Humain

### §3.1 Ce que fait Caméléon Engine

Caméléon Engine :

- acquiert ;
- structure ;
- analyse ;
- qualifie épistémiquement ;
- calcule ;
- dérive ;
- corrèle ;
- persiste ;
- enregistre techniquement les validations humaines.

### §3.2 Ce que fait le Constellium

Le Constellium :

- représente ;
- relie ;
- contextualise ;
- expose la provenance ;
- expose les niveaux de confiance ;
- permet la navigation ;
- expose les contradictions ;
- permet la comparaison temporelle ;
- rend les structures intelligibles.

### §3.3 Ce que fait l'Humain

L'Humain :

- comprend ;
- juge ;
- valide ;
- décide.

### §3.4 La validation — acte humain souverain

La validation est un acte humain.

Caméléon Engine peut préparer le contexte, présenter un verdict, enregistrer et appliquer techniquement la validation.

Le Constellium peut en représenter la trace.

Ni Caméléon Engine ni le Constellium ne peuvent décider cette validation à la place de l'opérateur.

---

## §4 Invariants fondateurs — CONST-I1 → CONST-I13

Ces treize invariants constituent le socle normatif de DT-CONST-01. Ils sont non négociables pour toute implémentation future du Constellium.

---

**CONST-I1**

Le Constellium ne produit pas de vérité analytique autonome. Il représente et met en relation les objets épistémiques produits, structurés ou qualifiés par Caméléon Engine afin de permettre l'émergence d'une compréhension humaine.

---

**CONST-I2**

Toute relation visible dans le Constellium est ancrée dans des données réelles traçables. Une relation non prouvée porte explicitement le statut "HYPOTHÈSE" ou "DÉCLARATION OPÉRATEUR". Aucune relation implicite. Le Constellium peut référencer des objets externes non ingérés par Caméléon Engine, à condition que leur statut "NON CANONIQUE" et leur provenance externe soient explicitement visibles. Ces objets ne peuvent jamais être assimilés à des objets produits, structurés ou qualifiés par CE. Leur canonisation éventuelle relève exclusivement du pipeline d'ingestion de Caméléon Engine.

---

**CONST-I3**

Une corrélation ne devient jamais une causalité dans le Constellium. Le statut épistémique de toute relation — corrélation, hypothèse, dérivation, déclaration opérateur — doit être visible au moment de la navigation.

---

**CONST-I4**

Une hypothèse reste une hypothèse jusqu'à validation explicite par l'opérateur. Elle ne change pas de statut automatiquement.

---

**CONST-I5**

Une contradiction peut rester visible sans être résolue artificiellement. Résoudre une contradiction sans preuve est une falsification de l'histoire de compréhension.

---

**CONST-I6**

La provenance de tout nœud et de toute relation doit rester accessible. Aucun objet sans origine connue n'est présenté comme un fait établi.

---

**CONST-I7**

Le niveau de confiance d'une relation est distinct de sa nature. Un lien affiché avec force graphique n'est pas plus réel — il est plus visible.

---

**CONST-I8**

Le Constellium ne masque jamais l'incertitude sous une représentation visuelle convaincante.

---

**CONST-I9**

Le Constellium ne recommande pas, ne prescrit pas, ne décide pas.

---

**CONST-I10**

La direction de flux est strictement Caméléon Engine → Constellium. Le Constellium ne commande jamais le moteur.

---

**CONST-I11**

Le Constellium ne duplique pas les objets canoniques dont Caméléon Engine est la source de vérité analytique. L'architecture technique de stockage des relations ne relève pas du présent document.

---

**CONST-I12**

La décision de validation appartient exclusivement à l'humain. Caméléon Engine peut préparer le contexte, présenter un verdict, enregistrer et appliquer techniquement la validation ; le Constellium peut en représenter la trace. Ni Caméléon Engine ni le Constellium ne peuvent accepter, ajuster, rejeter ou substituer automatiquement cette validation à la place de l'opérateur.

---

**CONST-I13**

Le Constellium ne doit jamais utiliser la représentation visuelle pour transformer une information, une relation, un niveau de confiance ou une incertitude en signal implicite d'action. La hiérarchie visuelle peut exprimer la structure, la provenance, la nature ou la confiance d'une information, mais jamais son opportunité d'action, son caractère désirable ou une recommandation de conduite. Les règles concrètes de représentation relèvent d'une future extension visuelle du Language System.

---

## §5 Statut des cinq forces historiques

### §5.1 Principe

Les champs `ether`, `fire`, `air`, `earth`, `water` sont des variables de scoring historiques de Caméléon Engine.

Ils ne définissent pas le Constellium dans son sens canonique adopté par DT-CONST-01.

DT-CONST-01 ne se prononce pas sur leur classification dans la doctrine d'ingestion.

**FORCE-SUBJECT-C reste ouverte** : le sujet canonique des cinq forces demeure ambigu.

La classification S4/S5/autre appartient à DT-S5-4 et à LOT-P2-1.

### §5.2 Ce qui est conservé sans modification

La clé technique `payload.constellium` reste techniquement inchangée dans cette passe.

Aucun renommage.
Aucune migration.
Aucune suppression.

### §5.3 Références historiques

Les cinq forces sont documentées comme identifiants moteur dans :

- `docs/architecture/constellium_code_audit_2026.md` — audit du code réel, dette CST-NAME
- `docs/architecture/macro-layer-strategic-architecture.md` §10 — ce que chaque force mesure et ne mesure pas
- `docs/architecture/constellium_position_audit.md` — règle C2, coexistence des deux sens

---

## §6 Ce que DT-CONST-01 tranche

| Élément tranché | Décision |
|---|---|
| Sens canonique du terme "Constellium" pour l'architecture future | Paragraphe fondateur §2 — espace relationnel de représentation et navigation |
| Frontière CE / Constellium / Humain | §3 — responsabilités distinctes et non interchangeables |
| Treize invariants normatifs | CONST-I1 → CONST-I13 — §4 |
| Production de vérité analytique autonome | Interdite (CONST-I1) |
| Traçabilité des relations visibles | Obligatoire — statut HYPOTHÈSE ou DÉCLARATION OPÉRATEUR si non prouvé (CONST-I2) |
| Corrélation vs causalité | Une corrélation ne devient jamais une causalité (CONST-I3) |
| Statut automatique des hypothèses | Interdit — validation explicite opérateur requise (CONST-I4) |
| Résolution artificielle des contradictions | Interdite (CONST-I5) |
| Accessibilité de la provenance | Obligatoire pour tout nœud et toute relation (CONST-I6) |
| Confusion force graphique / réalité | Interdite (CONST-I7) |
| Masquage de l'incertitude | Interdit (CONST-I8) |
| Recommandation, prescription, décision | Interdites (CONST-I9) |
| Commande du moteur par le Constellium | Interdite (CONST-I10) |
| Duplication des objets canoniques CE | Interdite (CONST-I11) |
| Souveraineté de la validation humaine | Absolue (CONST-I12) |
| Prescription visuelle implicite d'action | Interdite (CONST-I13) |
| Références externes non canoniques (EXT-B) | Admissibles sous conditions de visibilité explicite (CONST-I2) |
| Statut des cinq forces vis-à-vis du Constellium canonique | Ne définissent pas le Constellium canonique — FORCE-SUBJECT-C ouverte (§5) |

---

## §7 Ce que DT-CONST-01 ne tranche pas

| Élément non tranché | Renvoi |
|---|---|
| Classification S4/S5/autre des cinq forces | DT-S5-4 · LOT-P2-1 |
| Sujet canonique des cinq forces (FORCE-SUBJECT-C) | DT-FORCES-01 |
| Destin technique des cinq forces — maintien, renommage, dépréciation, suppression | DT-FORCES-01 |
| Architecture produit finale du Constellium | Chantier futur — conditions §13 CONSTELLIUM_V1_CLOSURE |
| Architecture technique de stockage des relations | Non figée — CONST-I11 |
| Voix du Constellium (niveaux L1/L2) | Chantier futur Language System extension |
| Règles concrètes de représentation visuelle | Future extension visuelle du Language System — CONST-I13 |
| Définition formelle de "connaissance consolidée" | Chantier futur |
| Persistance des relations déclarées par l'opérateur | Chantier futur |
| Gestion à grande échelle des objets externes NON CANONIQUES | Chantier futur |

---

## §8 Dettes non bloquantes documentées

| Dette | Description | Chantier de résolution |
|---|---|---|
| Language System visuel | Règles concrètes de représentation visuelle — CONST-I13 renvoie à une future extension | Future extension Language System V2 |
| Architecture technique de stockage | L'architecture de stockage des relations n'est pas figée par DT-CONST-01 | Chantier implémentation Constellium futur |
| Voix du Constellium | Les niveaux de langage L1/L2 ne sont pas tranchés | Chantier Language System + Constellium |
| Architecture produit finale | Le choix d'architecture produit n'est pas tranché | Post-conditions §13 CONSTELLIUM_V1_CLOSURE |
| Définition formelle "connaissance consolidée" | La limite entre relation navigable et connaissance consolidée n'est pas formalisée | Chantier futur Constellium |
| Persistance des relations opérateur | La doctrine de persistance des relations déclarées par l'opérateur n'est pas fixée | Chantier futur Constellium |
| Gestion des objets externes NON CANONIQUES | La doctrine de gestion à grande échelle des objets EXT-B n'est pas fixée | Chantier futur Constellium |
| Destin technique des cinq forces | `ether`, `fire`, `air`, `earth`, `water` — statut technique non tranché | DT-FORCES-01 |

---

## §9 Impact sur DT-S5-4

DT-S5-4 reste suspendue pendant cette passe.

DT-CONST-01 ne pré-classe aucun des cinq champs historiques dans la doctrine d'ingestion S4/S5.

La suspension partielle de DT-S5-4 est maintenue pour les champs dont la classification dépend de FORCE-SUBJECT-C. Les champs du formulaire moteur sans lien avec les cinq forces peuvent reprendre sur décision opérateur.

La reprise complète de DT-S5-4 interviendra après décision opérateur sur l'ordre exact des chantiers DT-FORCES-01 et DT-S5-4.

---

## §10 Chantier suivant recommandé — DT-FORCES-01

**DT-FORCES-01 — Destin des cinq forces historiques de Caméléon Engine**

Déterminer séparément pour chacun des cinq champs `ether`, `fire`, `air`, `earth`, `water` :

- maintien en l'état ;
- renommage sémantique ;
- dépréciation progressive ;
- suppression ;
- rôle analytique réel dans `computeScore()` et `buildPayload()` ;
- redondances éventuelles avec d'autres champs ;
- dépendances techniques existantes ;
- compatibilité avec les sessions historiques ;
- coût de migration par option retenue.

DT-FORCES-01 ne s'exécute pas dans la présente passe. Son ouverture est conditionnée à la décision opérateur sur l'ordre des chantiers.

---

## §11 Références documentaires

| Document | Rôle vis-à-vis de DT-CONST-01 |
|---|---|
| `docs/architecture/constellium/constellium_v1_definition.md` | Définition produit V1 (Sens B) — source historique |
| `docs/architecture/constellium/CONSTELLIUM_V1_CLOSURE.md` | Conditions de réactivation du chantier Constellium — DT-CONST-01 produite hors conditions §13 |
| `docs/architecture/constellium_position_audit.md` | Position architecturale Sens A/Sens B · C1/C2/C3 · CST-NAME |
| `docs/architecture/constellium_code_audit_2026.md` | Audit du code réel 2026 — `payload.constellium` · `prefillConstellium()` · CST-NARR · CST-ASSETS |
| `docs/architecture/macro-layer-strategic-architecture.md` | §10 — ce que chaque force mesure et ne mesure pas |
| `docs/lots/LOT-P2-4_SCHEMA_S5_V1.md` | Lot dans le contexte duquel DT-CONST-01 a été produite |
| `docs/lots/LOT-P2-1_INGESTION_DOCTRINE_V1.md` | RF-R4 figée · DI1 · DI5 — invariants que RF-S5 ne peut contredire |

---

*Caméléon Engine · DT-CONST-01 · Adoptée 2026-08-14*
