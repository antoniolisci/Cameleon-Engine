# LOT-P2-4 — Schéma canonique S5 · Données contextuelles & événements de marché V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-4 |
| Intitulé | Schéma canonique S5 · Données contextuelles & événements de marché V1 |
| Programme | P2 — Doctrine des Sources & Schémas d'Ingestion |
| Phase Roadmap V1 | A |
| Type | Doctrine — Schéma canonique |
| Document officiel | `docs/lots/LOT-P2-4_SCHEMA_S5_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-08-11 |
| Date de clôture | — |
| Prérequis | LOT-P2-1 CLOS · LOT-P2-2 CLOS · LOT-P2-3 CLOS |

---

## §1 Mission

LOT-P2-4 définit le **schéma canonique de la trace S5 Contextuelle** : la structure, la sémantique, les règles de classification et les exigences de provenance pour les données décrivant le contexte de marché global et les événements macro.

Ce lot produit un document de doctrine pure — aucun code, aucune implémentation. Il répond à trois questions indissociables :

1. **Qu'est-ce qu'une donnée S5 ?** — définition ontologique de la famille Contextuelle, distincte de S4 (Personnelle) selon les invariants figés de LOT-P2-1.
2. **Comment une trace S5 est-elle structurée ?** — schéma canonique : champs obligatoires, types, valeurs, contraintes.
3. **Comment S5 s'intègre-t-elle dans la doctrine d'ingestion V1 ?** — règle RF-S5 dans la hiérarchie DI1, exigences de provenance EP-S5, constat documentaire de l'évolution de RF-RC4 lors de l'activation de S5.

LOT-P2-4 constitue le troisième schéma source du Programme P2, après S1 (LOT-P2-2) et S2 (LOT-P2-3). Il débloque, avec les futurs LOT-P2-5 (S4) et LOT-P2-6 (S3), la définition de la normalisation inter-familles (L6) et de la Doctrine des Corrélations (L7).

---

## §2 Sources doctrinales

| Document | Rôle dans ce lot |
|---|---|
| LOT-P2-1 — Doctrine d'ingestion V1 | Source d'autorité pour RF · FB · EP · CL · DI1→DI5 — aucune de ces règles ne peut être modifiée |
| LOT-P1-2.1 — Modèle canonique de trace V1 | Structure des 6 champs obligatoires de toute trace : famille · source · date · valeur · contexte optionnel · session optionnelle |
| LOT-P1-2.4 — Doctrine de provenance V1 | Règles de provenance applicables aux nouvelles familles sources |
| LOT-P2-3 — Schéma canonique S2 V1 | Précédent doctrinal direct : approche schéma avant implémentation (§9.4) |
| Architecture Conceptuelle Fondatrice V1 | Registre officiel des 13 familles mémorielles — S5 = Contextuelle |
| Roadmap V1 §4 P2 | Livrable L5 : Schéma canonique S5 (Contextuelle — marché global/événements) |
| Pattern Reflection Doctrine V1 | Interdiction de fusion marché · interdiction de profil figé — contrainte transversale S5 |
| Language System V1 | Contrôle du vocabulaire introduit par ce lot |

---

## §3 Périmètre

### §3.1 Inclus

- Définition ontologique de la famille S5 Contextuelle (ce qu'elle est, ce qu'elle n'est pas)
- Critère de distinction S4/S5 — arbitrage de la frontière non résolue par LOT-P2-1
- Schéma canonique d'une trace S5 : champs, types, contraintes, valeurs admises
- Règle de classification RF-S5 : insertion dans la hiérarchie RF-R1→RF-R6 de LOT-P2-1 sans modification des règles figées
- Exigences de provenance EP-S5 : source, date, contexte pour la famille Contextuelle
- Périmètre Phase A : définition des données S5 activables sans infrastructure externe
- Frontières FB-F6 (S5/S4) et FB-F7 (S5/SY3) si nécessaire
- Statut des données de contexte marché déjà capturées par le moteur existant

### §3.2 Exclus

- Implémentation technique du module d'ingestion S5 (périmètre Programme P3)
- Normalisation inter-familles (périmètre LOT-P2-7)
- Doctrine des Corrélations (périmètre LOT-P2-8)
- Schémas S4 et S3 (périmètres LOT-P2-5 et LOT-P2-6)
- Feeds de données marché externes, API macro, sources temps réel (Phase B+)
- Toute modification des règles DI1→DI5 figées dans LOT-P2-1
- Toute modification de l'identité canonique S2 (assetId · ACTIF/POSITION/LIEU)
- Toute modification des contrats S1 (LOT-P2-2) ou S2 (LOT-P2-3)
- Scoring, décision, recommandation — le schéma S5 décrit un état observable, pas une interprétation

---

## §4 Invariants hérités — non négociables

Ces règles sont figées par les lots P2 antérieurs. LOT-P2-4 ne peut pas les modifier.

### §4.1 Invariants LOT-P2-1 directement contraignants pour S5

| Invariant | Source | Règle |
|---|---|---|
| IG-I1 | LOT-P2-1 §6 | Toute trace S5 est conforme au modèle canonique LOT-P1-2.1 (6 champs) |
| IG-I2 | LOT-P2-1 §6 | Une donnée appartient à une et une seule famille — S5 exclut toute appartenance simultanée S4 |
| IG-I3 | LOT-P2-1 §6 | La classification est déterministe — la règle RF-S5 doit produire un résultat unique |
| IG-I4 | LOT-P2-1 §6 | Toute trace S5 a une source identifiable conforme à LOT-P1-2.4 |
| IG-I5 | LOT-P2-1 §6 | Aucune corrélation à l'ingestion — une trace S5 ne fusionne pas avec d'autres familles |
| IG-I6 | LOT-P2-1 §6 | Silence structurel — une donnée non classifiable comme S5 n'est pas forcée dans cette famille |
| DI1 | LOT-P2-1 §5 | Hiérarchie séquentielle RF-R1→RF-R6 : S5 s'y insère sans modifier les priorités 1→5 existantes |
| DI2 | LOT-P2-1 §5 | Rejet immédiat si aucune règle RF ne produit de famille valide |
| DI3 | LOT-P2-1 §5 | Exigences de provenance différenciées — EP-S5 à définir dans ce lot |
| DI5 | LOT-P2-1 §5 | S4 = source annotation manuelle ou journal opérateur (RF-R4) — cette règle est figée |
| RF-R4 | LOT-P2-1 §12 | **Figée** : toute donnée issue d'une annotation manuelle ou d'un journal de l'opérateur → S4, indépendamment du contenu |
| RF-RC4 | LOT-P2-1 §12 | S5 est inactive en Phase A — LOT-P2-4 définit sa règle d'activation (RF-S5) |

### §4.2 Invariants LOT-P2-2 et LOT-P2-3 pertinents

| Invariant | Source | Règle |
|---|---|---|
| DT-7 | LOT-P2-3 §4 | ACTIF ≠ POSITION ≠ LIEU — non pertinent pour S5 (S5 ne décrit pas un patrimoine) |
| Architecture C | LOT-P2-3 §7.2 | Adaptateur classifie/décompose · Core accumule — patron applicable à S5 Phase A+ |
| S2 ≠ S5 | LOT-P2-3 §6 | Une trace S5 décrit un état ou événement contextuel externe, jamais un état patrimonial |

---

## §5 Question architecturale centrale — Frontière S4/S5

### §5.1 État de la question à l'ouverture

LOT-P2-1 a figé les règles de classification des familles actives en Phase A. S5 était inactive — sa règle de classification (RF-S5) était explicitement différée à son lot d'activation (RF-RC4).

La tension apparente est la suivante : certaines données décrivant le contexte de marché **peuvent être saisies manuellement par l'opérateur**. RF-R4 (figée) classe toute "annotation manuelle ou journal de l'opérateur" en S4. La question est donc : une observation structurée de marché saisie par l'opérateur est-elle une "annotation manuelle" au sens de RF-R4, ou relève-t-elle d'une catégorie distincte couverte par RF-S5 ?

**Ce que LOT-P2-1 a figé :**
- RF-R4 : "annotation manuelle ou journal de l'opérateur → S4, **indépendamment du contenu rédigé**"
- Principe DI5 : "la valeur mémorielle est la voix de l'opérateur elle-même, non le sujet traité"
- CL-A6 fondateur : une note comportementale de l'opérateur → S4, non SY1

**Ce que LOT-P2-1 n'a pas tranché :**
- RF-RC4 : S5 inactive, règle RF-S5 différée à ce lot
- La définition précise d'"annotation manuelle ou journal" : s'étend-elle à toute saisie manuelle, ou seulement aux annotations de nature personnelle/réflexive ?
- La frontière S4/S5 lorsque les deux familles sont actives simultanément

### §5.2 Tension à instruire

| Élément | S4 — Personnelle | S5 — Contextuelle |
|---|---|---|
| Sujet de la donnée | L'opérateur lui-même (ses états, ses réflexions, son journal) | L'environnement externe (le marché, les événements macro) |
| Producteur | Toujours l'opérateur (saisie manuelle) | Opérateur (Phase A) ou source externe (Phase B+) |
| Valeur mémorielle | La voix de l'opérateur (DI5 figé) | L'état observable du marché |
| Exemples DI5/RF-R4 | "Je me sens impulsif" · "Mauvaise exécution hier" · "Objectif semaine" | "Régime : distribution haute" · "Volatilité compressée" · "Event macro : FOMC jeudi" |
| Point de tension | Une observation de marché rédigée par l'opérateur est-elle son "journal" (→ S4) ou une donnée contextuelle (→ S5) ? | Une donnée contextuelle peut-elle être saisie manuellement sans devenir S4 par RF-R4 ? |

### §5.3 Cas à trancher — DT-S5-1

Le moteur Caméléon Engine capture actuellement des données de contexte marché via ses champs de formulaire (régime de volatilité, tendance, structure de marché, etc.). Ces saisies opérateur constituent-elles des traces S4 (annotation manuelle) ou des traces S5 (contexte de marché) ?

**Option A — Critère de sujet** : la distinction S4/S5 repose sur le **sujet** de la donnée :
- S4 = donnée dont l'opérateur est le sujet (ses états, ses intentions, ses réflexions)
- S5 = donnée dont le marché est le sujet (état observable externe, indépendant de l'opérateur)
- Conséquence : "Régime de volatilité = compressé" → S5 même si saisi manuellement (le marché est le sujet). "Je perçois le marché comme dangereux" → S4 (l'opérateur est le sujet de son propre état perceptif).

**Option B — Critère de forme de saisie** : la distinction S4/S5 repose sur la **forme de la saisie** :
- S4 = saisie libre, non structurée (note, journal, annotation ouverte)
- S5 = saisie structurée selon un schéma défini (formulaire à champs bornés, valeurs contrôlées)
- Conséquence : les 16 champs à valeurs discrètes du formulaire moteur → S5. Une zone de texte libre → S4.

**Option C — Critère de référent** : la distinction S4/S5 repose sur le **référent** :
- S4 = donnée qui disparaît si l'opérateur change (subjective, contextuelle à l'individu)
- S5 = donnée vérifiable par un tiers indépendant de l'opérateur (objective ou intersubjective)
- Conséquence : "le régime est une distribution haute" → S5 si vérifiable sur chart. "Je vois une distribution" → S4 si perception personnelle non vérifiable.

**Option D — Critère de module écrivant** :
- Si une session moteur est le producteur officiel → RF-R2 s'applique · famille selon module écrivant
- Si le module moteur devient le module écrivant S5 (priorité 2) → les saisies moteur sont S5 par RF-R2, pas par RF-S5
- Conséquence : S5 via module écrivant n'exige pas de modifier RF-R4 · la hiérarchie DI1 est préservée intacte

DT-S5-1 est adoptée définitivement — décision opérateur 2026-08-12. La formulation normative est documentée en §5.4.

---

### §5.4 DT-S5-1 — Décision adoptée (2026-08-12)

**Décision opérateur :** DT-S5-1 est adoptée définitivement selon la formulation normative ci-dessous, issue de l'audit contradictoire de P2-4.A (2026-08-12).

---

#### Niveau 1 — Gouvernance du référentiel canonique S5

**Condition A — Sujet canonique contextuel externe**
*(Règle sémantique de gouvernance — appliquée lors de la définition et de la maintenance du référentiel, non trace par trace)*

Un type de donnée, champ ou objet est admissible dans le référentiel canonique S5 si son sujet canonique est un fait ou état appartenant à l'environnement externe dans lequel l'opérateur agit — marché, régime de prix, structure de liquidité, indicateur structurel, événement macro-économique —, dont l'existence est indépendante de l'opérateur qui l'observe ou le saisit.

Le sujet n'est pas l'opérateur lui-même, ni ses perceptions rédigées librement, ni ses états internes, ni ses réflexions, ni ses jugements librement exprimés.

Le **référentiel canonique S5** est une liste opérationnelle dérivée de Condition A. Condition A gouverne son admission. Le référentiel ne participe pas à la définition de Condition A et ne constitue pas une source autonome de vérité doctrinale.

---

#### Niveau 2A — Exécution RF-S5

À l'exécution, RF-S5 vérifie uniquement :

**Condition B — Instance du référentiel canonique S5**

La trace est-elle une instance d'un champ ou objet admis dans le référentiel canonique S5 ?

La conformité à Condition A est héritée de la gouvernance du référentiel — elle n'est pas recalculée trace par trace.

**Résultat :** S5 — Contextuelle

**Sources couvertes par cette route :**
- Saisie manuelle de l'opérateur instanciée dans un champ du référentiel S5
- Donnée externe ou API normalisée vers une instance du référentiel S5
- Toute source future non déjà capturée par RF-R1, RF-R2 ou RF-R3

**Valeur mémorielle S5 :** une représentation structurée d'un état contextuel externe, et non la voix libre de l'opérateur. La famille S5 qualifie la nature de la trace, non son exactitude factuelle.

---

#### Précision de périmètre RF-R4

Les traces satisfaisant Condition B n'atteignent pas RF-R4.

RF-R4 continue de couvrir les saisies directes de l'opérateur sous forme libre — notes, annotations, entrées de journal, réflexions personnelles rédigées — qui ne sont pas des instances du référentiel canonique S5.

Le terme « observation » dans RF-R4 vise les remarques observationnelles rédigées librement, et non les saisies d'instances du référentiel canonique S5.

Il s'agit d'une précision du périmètre pratique de RF-R4 résultant de la priorité de RF-S5, et non d'une modification du texte figé de RF-R4.

---

#### Niveau 2B — Route RF-R2

Les sorties d'un module interne officiellement qualifié et inscrit dans la table de provenance avec famille officielle S5 sont classifiées directement S5 par RF-R2 (priorité 2). RF-S5 et Condition B ne sont alors pas évalués.

La qualification préalable d'un module S5 relève de la gouvernance documentaire. Elle doit vérifier que le périmètre de production prévu pour ce module est conforme aux principes de DT-S5-1. Une fois le module officiellement inscrit, RF-R2 reste absolu pour ses sorties conformément à RF-RC3.

---

#### Position doctrinale future dans DI1

RF-S5 est une nouvelle règle nommée destinée à être insérée entre RF-R3 (source visuelle → S3) et RF-R4 (annotation manuelle → S4) dans la hiérarchie DI1. RF-R1 à RF-R6 conservent leurs libellés, leurs textes et leurs positions relatives entre elles. L'intégration opérationnelle de RF-S5 dans DI1 a été tranchée par DT-S5-2 (P2-4.A — adoptée · §5.5 · 2026-08-12).

**Décisions débloquées par DT-S5-1 :** DT-S5-2 · DT-S5-3 · DT-S5-6 (et par chaîne : DT-S5-4 · DT-S5-5).

---

### §5.5 DT-S5-2 — Décision adoptée (2026-08-12)

**Décision opérateur :** DT-S5-2 est adoptée définitivement selon la formulation normative ci-dessous, issue de l'audit contradictoire de P2-4.A (2026-08-12).

---

#### Position canonique de RF-S5 dans DI1

RF-S5 s'insère dans la hiérarchie séquentielle DI1 **après RF-R3 (source visuelle → S3) et avant RF-R4 (annotation manuelle → S4)**.

Cette position est la seule compatible avec les invariants de LOT-P2-1 : elle garantit que les sources visuelles sont capturées par RF-R3 avant d'atteindre RF-S5, et que les saisies libres non instanciées dans le référentiel canonique S5 continuent vers RF-R4.

---

#### Hiérarchie DI1 enrichie — Architecture post-DT-S5-2

| Position | Règle | Résultat |
|---|---|---|
| 1 | RF-R1 — État applicatif | Exclusion de la couche canonique |
| 2 | RF-R2 — Module écrivant interne | Famille officielle du module |
| 3 | RF-R3 — Source visuelle | S3 — Visuelle |
| après RF-R3 | **RF-S5 — Instance du référentiel canonique S5** | **S5 — Contextuelle** |
| 4 | RF-R4 — Source annotation manuelle | S4 — Personnelle |
| 5 | RF-R5 — Fichier structuré | S1 ou S2 selon DI4 |
| — | RF-R6 — Aucune règle satisfaite | Rejet |

**Absence de renumérotation :** RF-R1 à RF-R6 conservent leurs libellés, leurs textes, leurs positions relatives et leurs numéros de priorité 1→5 tels que documentés dans LOT-P2-1. RF-S5 ne reçoit pas de numéro entier concurrent. Sa position est désignée textuellement : « après RF-R3, avant RF-R4 ».

---

#### Règle RF-S5

**RF-S5 — Position : après RF-R3, avant RF-R4**

Une donnée est classifiée S5 — Contextuelle si elle satisfait **Condition B** (DT-S5-1 §5.4) : elle est une instance d'un champ ou objet admis dans le référentiel canonique S5, tel que gouverné par Condition A.

La conformité à Condition A est héritée de la gouvernance du référentiel — elle n'est pas recalculée trace par trace.

**Résultat :** S5 — Contextuelle · évaluation s'arrête.

Si Condition B n'est pas satisfaite, l'évaluation continue vers RF-R4.

---

#### Architecture deux routes — RF-R2 et RF-S5

La classification S5 suit deux routes exclusives et ordonnées :

**Route A — Module écrivant S5 officiellement inscrit**

Un module interne dont la famille officielle S5 est inscrite dans la table de provenance (LOT-P1-2.4 §4) est capturé par RF-R2 (priorité 2). La donnée est classifiée S5 directement. RF-S5 et Condition B ne sont pas évalués. RF-RC3 interdit toute reclassification descendante.

**Route B — Donnée non capturée par RF-R1, RF-R2, RF-R3**

La donnée atteint RF-S5. Condition B est évaluée. Si l'instance appartient au référentiel canonique S5 → S5 — évaluation s'arrête. Sinon → continuation vers RF-R4, RF-R5, RF-R6.

Les deux routes sont structurellement disjointes. RF-R2 (priorité 2) intercepte toujours les modules inscrits avant que RF-S5 ne soit atteint. Aucune double classification n'est possible.

---

#### Précédence absolue de RF-R3 sur RF-S5

RF-R3 (priorité 3) s'applique avant RF-S5. Une donnée d'origine visuelle est classifiée S3 indépendamment de son contenu, même si ce contenu représente une information de marché compatible avec le référentiel canonique S5 (DI5 figé : « la valeur mémorielle est la donnée d'origine visuelle elle-même »).

Cas distinct relevant de RF-R2 : si un module interne officiellement inscrit avec famille S5 produit la trace, RF-R2 la capture en priorité 2 avant l'évaluation de RF-R3. Il ne s'agit pas d'une exception à RF-R3, mais de l'application normale de la hiérarchie DI1.

---

#### Relation RF-S5 / RF-R4

RF-S5 est évaluée avant RF-R4. Cette position matérialise opérationnellement la précision de périmètre de DT-S5-1 (§5.4) :

- Saisie de l'opérateur instanciée dans un champ du référentiel canonique S5 → Condition B satisfaite → RF-S5 → S5. RF-R4 n'est pas atteint.
- Saisie libre, annotation personnelle, note non instanciée dans le référentiel → Condition B non satisfaite → RF-R4 → S4.
- Note mixte contenant à la fois un contenu S5 potentiel et un état opérateur, rédigée en forme libre → prise dans sa globalité comme saisie libre → Condition B non satisfaite → RF-R4 → S4. Aucune sous-trace S5 n'est extraite automatiquement d'une saisie libre.

RF-R4 conserve son texte figé. DT-S5-2 ne réécrit pas RF-R4.

---

#### État enrichi de RF-RC4 — Constat post-DT-S5-2

**Note documentaire :** LOT-P2-1 est figé. LOT-P2-4 ne peut pas modifier son texte. Le constat ci-dessous est la lecture de RF-RC4 dans l'architecture enrichie issue de DT-S5-2 — il ne constitue pas une modification rétroactive de LOT-P2-1.

Texte original figé de RF-RC4 dans LOT-P2-1 §12.4 : *« Les familles S5 · SY2 · SY4 · L1 · L2 · L3 · Référentiel ne disposent d'aucune règle RF active en Phase A. Leur intégration dans RF nécessitera une mise à jour lors de leur activation. »*

**Constat post-DT-S5-2 :** LOT-P2-4 définit désormais RF-S5 comme règle RF nommée et l'intègre architecturalement à DI1. Cette évolution matérialise l'activation doctrinale de S5 prévue par RF-RC4 (« mise à jour lors de leur activation »), sans signifier que RF-S5 est déjà pleinement applicable en Phase A : son exécution déterministe dépend encore de l'existence d'un référentiel canonique S5 suffisamment défini pour permettre l'évaluation de Condition B.

La manière de matérialiser ultérieurement cette évolution dans la documentation canonique historique de RF-RC4 n'est pas tranchée par DT-S5-2. LOT-P2-1 reste inchangé.

---

#### Dépendance au référentiel canonique S5

RF-S5 est architecturalement intégrée à DI1 par DT-S5-2. L'application effective de RF-S5 dépend de l'existence d'un référentiel canonique S5 suffisamment défini pour permettre l'évaluation déterministe de Condition B. Les décisions encore ouvertes de LOT-P2-4, notamment DT-S5-3 et DT-S5-6, contribueront à préciser les éléments nécessaires à ce référentiel sans que DT-S5-2 n'anticipe leur résultat.

---

#### Gap Phase B+ — Fichiers structurés S5 externes

L'ingestion de fichiers structurés S5 issus de sources externes (données macro historiques, feeds de marché) non portés par un module S5 officiellement inscrit constitue un cas non résolu en Phase A. Sans inscription d'un module dans la table de provenance (route RF-R2), ces données peuvent atteindre RF-R5 et être classifiées S1 ou S2 si RF-S5 ne peut pas évaluer Condition B de manière déterministe sur leur format.

La résolution en Phase B+ requiert selon le cas :
- un module S5 officiellement inscrit dans la table de provenance → route RF-R2 ;
- un adaptateur garantissant la production d'instances conformes au référentiel canonique S5 avant évaluation par RF-S5.

Ce gap est documenté sans résolution dans DT-S5-2. Sa résolution ne sera pas anticipée dans ce lot.

---

### §5.6 DT-S5-3 — Décision adoptée (2026-08-14)

**Décision opérateur :** DT-S5-3 est adoptée définitivement selon la formulation normative ci-dessous, issue du rapport contradictoire et de la passe normative finale de P2-4.B (2026-08-14).

---

#### Option C — Deux natures canoniques S5

Une trace S5 relève de l'une des deux natures contextuelles suivantes :

**S5-État**

Condition contextuelle observable caractérisant une période ou un instant. Un S5-État décrit une condition qui peut être vraie pendant une durée.

Exemples illustratifs non constitutifs du référentiel : régime de marché · niveau de dominance · état d'une session de marché · niveau de volatilité.

**S5-Événement**

Fait contextuel discret dont l'occurrence est identifiable. Un S5-Événement décrit quelque chose qui se produit, distingué d'un état par sa nature discrète et non continue.

Exemples illustratifs non constitutifs du référentiel : décision macroéconomique · publication d'indicateur · liquidation en cascade · rupture structurelle.

Ces deux natures présentent des sémantiques distinctes et non substituables. Leur coexistence dans le corpus S5 est architecturalement nécessaire — ni l'une ni l'autre ne peut représenter l'ensemble des données contextuelles utiles.

---

#### Règle de grain S5 *(règle nouvelle, propre à LOT-P2-4)*

Une trace S5 porte une et une seule observation relevant d'une entrée du référentiel canonique S5. Cette entrée relève d'une seule nature : État ou Événement.

Un événement et l'état contextuel qui lui succède constituent deux traces S5 distinctes.

La nature d'une entrée — État ou Événement — est déterminée lors de la construction et de la gouvernance du référentiel canonique S5. Elle n'est pas recalculée trace par trace.

---

#### Renvois ouverts

Le mécanisme permettant de représenter la nature (État / Événement) dans le modèle canonique à 6 champs n'est pas décidé par DT-S5-3. Il relève de DT-S5-6.

L'admissibilité des événements dont l'occurrence est future ou planifiée en Phase A relève de DT-S5-4.

**Décisions directement débloquées par DT-S5-3 :** DT-S5-4 · DT-S5-6. Décision débloquée par chaîne après DT-S5-4 : DT-S5-5.

---

### §5.7 DT-S5-6 — Décision adoptée (2026-08-15)

**Décision opérateur :** DT-S5-6 est adoptée définitivement selon la formulation normative ci-dessous, issue de la décision opérateur du 2026-08-15.

---

#### Option C — Valeur canonique et description facultative strictement séparées

Le champ `valeur` d'une trace S5 est un objet structuré composé de quatre éléments :

```
{
  nature: "État" | "Événement",
  type: <entrée_référentiel_S5>,
  ref: <valeur_canonique_bornée>,
  description?: <texte_libre>
}
```

---

#### Champs obligatoires

**`nature`**

Obligatoire. Valeur bornée parmi deux valeurs exactes : `"État"` ou `"Événement"`, au sens de DT-S5-3 (§5.6).

**`type`**

Obligatoire. Identifie l'entrée du référentiel canonique S5 dont `ref` est une instance. Doit appartenir au référentiel canonique S5 correspondant à la nature de la trace.

**`ref`**

Obligatoire. Constitue la seule valeur canonique de la trace. Doit être une valeur bornée par le référentiel associé au `type`. Permet l'évaluation déterministe de RF-S5 et de Condition B (DT-S5-1 §5.4).

---

#### Champ facultatif

**`description`**

Facultatif. Texte libre. Purement descriptif. Sans autorité canonique.

`description` ne participe jamais :
- à l'évaluation de RF-S5 ;
- à l'évaluation de Condition B ;
- à la classification canonique ;
- à un score, une décision, ou une règle moteur ;
- à la détermination de `nature`, `type` ou `ref`.

Une trace S5 sans `description` est valide, classifiable, comparable et exploitable mécaniquement.

---

#### Principe de séparation canonique / descriptif

**CANONIQUE :** `nature` + `type` + `ref`

**DESCRIPTIF :** `description` (facultatif)

Le descriptif ne peut jamais acquérir silencieusement une autorité canonique. Si une information nécessite une valeur canonique pour le fonctionnement de S5, elle doit être modélisée explicitement dans le référentiel — elle ne peut pas être portée par `description`.

---

#### Règle de gestion des contradictions

En cas de contradiction entre `ref` et `description` :
- la valeur canonique `ref` prévaut sans exception ;
- aucune correction silencieuse de `ref` à partir de `description` n'est admise ;
- la contradiction doit être visible et signalable.

---

#### Compatibilité S5-État / S5-Événement

La structure {`nature`, `type`, `ref`, `description?`} couvre les deux natures canoniques définies par DT-S5-3 sans mécanisme structurel différencié. Le champ `nature` suffit à les distinguer. Aucun sous-type structurel supplémentaire n'est requis.

---

#### Relation au modèle canonique LOT-P1-2.1

DT-S5-6 définit le contenu du champ `valeur` pour la famille S5, dans le cadre des 6 champs obligatoires du modèle canonique LOT-P1-2.1 (famille · source · date · valeur · contexte optionnel · session optionnelle). Les 6 champs restent inchangés. DT-S5-6 ne modifie ni le modèle canonique ni les invariants de LOT-P1-2.1.

---

#### Décision débloquée par DT-S5-6

DT-S5-6 complète P2-4.B avec DT-S5-3. La clôture de P2-4.B débloque P2-4.C (DT-S5-4 · DT-S5-5 · EP-S5).

---

### §5.8 DT-S5-4 — Décision adoptée (2026-08-15) · Amendée (2026-08-15)

**Décision initiale :** Option B — Sous-ensemble minimal défini (2026-08-15).

**Amendement :** Position Gamma — S5 silencieuse Phase A (2026-08-15), suite à l'audit correctif sur la validité de la saisie manuelle comme S5.

---

#### Décision initiale — Option B (conservée en trace documentaire)

La décision initiale avait retenu market · btc · dxy comme données S5 admissibles en Phase A via observation déclarative manuelle. Les critères retenus étaient : satisfaction de Condition A (sujet externe) · valeurs bornées structurellement déterministes · provenance identifiable.

---

#### Fragilisation identifiée — Audit correctif (2026-08-15)

L'audit correctif a établi que la décision initiale confondait deux niveaux de déterminisme :

| Niveau | DT-S5-4 initiale | Position Gamma |
|---|---|---|
| Déterminisme de classification (IG-I3) | Satisfait — le borning contraint le stockage ✓ | Inchangé ✓ |
| Déterminisme d'observation | Non garanti — le borning ne contraint pas l'assignation du label | Reconnu explicitement |

**Principes établis par l'audit :**
- UN TYPE PEUT ÊTRE CANONIQUE SANS ÊTRE ENCORE ACTIVABLE.
- LE SUJET EXTERNE D'UNE DÉCLARATION NE SUFFIT PAS À RENDRE LA DÉCLARATION ELLE-MÊME EXTERNE.

Les champs market · btc · dxy ont bien des phénomènes externes pour sujets (Condition A satisfaite au niveau du type). Mais l'assignation des labels en Phase A repose sur une appréciation humaine sans protocole d'observation reproductible. Deux opérateurs observant le même marché peuvent légitimement produire des refs différentes. Le borning rend la structure de stockage déterministe — pas l'observation.

---

#### Amendement adopté — Position Gamma

Aucune trace S5 n'est produite en Phase A.

Le silence structurel (IG-I6) s'applique : l'absence de trace S5 ne signifie pas l'absence du phénomène. Elle signifie l'absence d'un mécanisme d'acquisition suffisamment reproductible pour canoniser la connaissance S5.

---

#### Types admis au référentiel S5 — non activés Phase A

Ces types sont doctrinalement définis et admis dans le référentiel S5 (Condition A satisfaite au niveau du type). Leur activation pour ingestion est différée à l'existence d'un mécanisme d'acquisition suffisamment reproductible.

##### `market` — Régime de marché

| Attribut | Valeur |
|---|---|
| Nature S5 | S5-État |
| Type canonique | `regime-marche` |
| Ref bornée | {range, compression, expansion, defense, riskoff} |
| Phénomène observé | État courant du marché — indépendant de l'opérateur |
| Statut Phase A | ADMIS AU RÉFÉRENTIEL · non activé pour ingestion · silence structurel |

##### `btc` — Comportement de Bitcoin

| Attribut | Valeur |
|---|---|
| Nature S5 | S5-État |
| Type canonique | `comportement-btc` |
| Ref bornée | {stable, strong, weak} |
| Phénomène observé | Comportement directionnel de Bitcoin dans l'environnement de marché |
| Statut Phase A | ADMIS AU RÉFÉRENTIEL · non activé pour ingestion · silence structurel |

**Frontière S2 / S5 :** Bitcoin comme actif détenu = S2 (patrimoniale) · Bitcoin comme comportement de marché = S5 (contextuelle) · deux familles distinctes sans fusion (IG-I2 · IG-I5).

##### `dxy` — Direction du Dollar index

| Attribut | Valeur |
|---|---|
| Nature S5 | S5-État |
| Type canonique | `direction-dxy` |
| Ref bornée | {neutral, up, down} |
| Phénomène observé | Direction courante de l'indice DXY — indicateur macroéconomique externe |
| Statut Phase A | ADMIS AU RÉFÉRENTIEL · non activé pour ingestion · silence structurel |

**Limite connue :** la fenêtre temporelle de lecture n'est pas définie dans les valeurs bornées. Cette ambiguïté contribuait à la fragilité de la décision initiale.

---

#### Données exclues du référentiel S5

| Champ(s) | Motif d'exclusion |
|---|---|
| fire · air · earth · water · ether | DT-FORCES-01 non résolu — aucune canonisation indirecte via S5 tant que ce chantier n'est pas clos |
| emotion | Sujet = état interne de l'opérateur — S4 |
| userProfile · coreOrders · needAction | Sujet = configuration ou intention de l'opérateur — S4 |
| validationState · validationNote · journalNote | S4 (état décisionnel / texte libre) ou SY3 |
| momentumSignal · desordreStructurel | Déterminisme insuffisant pour IG-I3 |

---

#### Statut des champs à admissibilité différée

| Champ | Statut | Motif du report |
|---|---|---|
| `structureSignal` | ADMISSIBILITÉ DIFFÉRÉE | Nature ambiguë (S5-État / S5-Événement mixte) · définition des valeurs insuffisante pour IG-I3 |
| `zoneSignal` | ADMISSIBILITÉ DIFFÉRÉE | Dépendance à une structure de marché préalablement identifiée par l'opérateur · ambiguïté Condition A |
| `dominanceMacro` | ADMISSIBILITÉ DIFFÉRÉE | Concept S5-compatible en principe · binarité {none/active} insuffisante sans critères d'activation définis |

Réévaluation possible dans un chantier ultérieur si leurs critères d'activation deviennent normatifs et reproductibles.

---

#### Condition d'activation future

Un type admis au référentiel S5 peut commencer à produire des traces canoniques lorsqu'un mécanisme d'acquisition satisfait une exigence de reproductibilité suffisante. Les formes possibles incluent sans s'y limiter :
- source instrumentale identifiable (API, feed de marché, index calculé) ;
- transformation déterministe documentée appliquée à des données observables brutes ;
- import structuré avec provenance vérifiable.

La forme exacte du mécanisme d'activation n'est pas figée. Elle sera définie dans le lot d'activation Phase B+. EP-S5 (§5.10) définit les exigences générales de provenance applicables à toute activation future.

---

#### Principe : usage moteur ≠ famille canonique

Les champs market · btc · dxy restent des inputs du formulaire moteur sans que cela crée de traces S5. La nature d'une donnée est déterminée par ce qu'elle représente et par son mode d'acquisition canonique — non par ses consommateurs. En Phase A, l'absence de mécanisme d'acquisition S5 est la raison du silence structurel, indépendamment de l'usage moteur.

---

#### Décision débloquée par DT-S5-4 amendée

DT-S5-4 amendée est cohérente avec DT-S5-5 (prospectif — aucune reclassification des sessions existantes · S5 silencieux en Phase A). Elle débloque EP-S5 (§5.10) sous la contrainte Position Gamma : définir les exigences de provenance pour une activation future, non pour une ingestion Phase A.

---

### §5.9 DT-S5-5 — Décision adoptée (2026-08-15)

**Décision opérateur :** DT-S5-5 est adoptée définitivement selon la formulation normative ci-dessous, issue de la décision opérateur du 2026-08-15.

---

#### Option B — Prospectif

L'activation du contrat S5 Phase A est strictement prospective. Les traces produites ou ingérées avant l'activation formelle de RF-S5 et du contrat S5 Phase A conservent leur famille, leur contrat et leur provenance d'origine sans modification.

**Principe fondateur :** UNE ONTOLOGIE NOUVELLE NE RÉÉCRIT PAS LE PASSÉ.

---

#### Règles normatives

**P5-1 — Intangibilité de l'historique**

Aucune session moteur existante, aucune trace capturée avant l'activation formelle de S5, ne fait l'objet d'une reclassification automatique vers la famille S5.

**P5-2 — Intégrité de provenance**

La provenance d'une trace historique ne peut pas être réécrite. Toute donnée produite ou ingérée avant l'activation de RF-S5 conserve la provenance déclarée au moment de sa production.

**P5-3 — Interdiction de migration**

Aucune opération de migration des sessions existantes vers S5 n'est admise, indépendamment de la ressemblance de leur contenu avec un type du référentiel canonique S5.

**P5-4 — Interdiction d'anachronisme sémantique**

Une trace historique ne devient pas S5 parce que son contenu ressemble à un type S5 défini ultérieurement. La classification est déterminée au moment de l'ingestion selon les règles en vigueur à cette date.

**P5-5 — Lecture sans reclassification**

Les sessions et traces existantes peuvent continuer d'être lues, référencées ou comparées par les couches qui les consomment. Cette lecture ne modifie ni leur famille canonique, ni leur provenance, ni leur contrat d'origine.

---

#### Conditions d'activation de S5

Toute ingestion future qualifiée comme S5 doit satisfaire simultanément :
- DT-S5-1 (Conditions A et B) ;
- DT-S5-3 (nature S5-État ou S5-Événement) ;
- DT-S5-4 amendée — type appartenant au référentiel canonique S5 (§5.8) ;
- DT-S5-6 (structure {nature, type, ref, description?}) ;
- EP-S5-R1 — mécanisme d'acquisition à reproductibilité suffisante (§5.10) ;
- RF-S5 (évaluation dans la hiérarchie DI1 post-DT-S5-2).

---

#### Justification

L'option prospective protège cinq propriétés fondamentales du corpus mémoriel :

| Propriété | Protection |
|---|---|
| Provenance | Aucune trace ne se voit attribuer une provenance qu'elle n'avait pas au moment de sa production |
| Intégrité historique | Le corpus existant reste stable et reproductible indépendamment des évolutions doctrinales |
| Reproductibilité | Une trace relue demain produit la même famille qu'aujourd'hui |
| Absence d'anachronisme | La sémantique d'une donnée est celle en vigueur à sa date de production |
| Stabilité | Le corpus canonique existant n'est pas perturbé par l'activation de S5 |

---

#### Décision débloquée par DT-S5-5

DT-S5-5 adoptée complète le périmètre décisionnel de P2-4.C avec DT-S5-4 amendée. La clôture de P2-4.C requiert EP-S5 (§5.10), définie ci-dessous.

---

### §5.10 EP-S5 — Exigences de provenance S5 (2026-08-15)

**Fondement :** DI3 (différenciées · LOT-P2-1 §156) · DT-S5-4 amendée (Position Gamma) · DT-S5-5 (prospectif) · LOT-P1-2.4 §4.5.

---

#### Portée et contrainte Phase A

EP-S5 définit les exigences minimales de provenance applicables à toute trace S5 future. En Phase A, S5 est silencieux (DT-S5-4 amendée) — aucune trace S5 n'est produite, aucune source S5 n'est active.

EP-S5 ne définit pas de source Phase A. Les identifiants de source concrets sont laissés à chaque module d'activation Phase B+. EP-S5 définit uniquement les exigences auxquelles tout mécanisme d'activation devra se conformer.

Cette section remplit l'obligation de LOT-P2-1 §14.4 : "Les familles inactives en Phase A... leurs exigences de provenance seront définies dans EP lors de l'activation de leur module écrivant ou de leur source d'ingestion respective."

---

#### Structure minimale commune (conforme à DI3)

Toute trace S5 produite lors d'une activation future respecte la structure minimale de DI3 :

| Champ | Obligation | Règle |
|---|---|---|
| Source | Obligatoire | Identifiant du mécanisme d'acquisition — conforme à la table de provenance (LOT-P1-2.4 §4) |
| Date | Obligatoire | ISO 8601 UTC ou état formalisé |
| Contexte | Optionnel | Format S5 différencié (§ ci-dessous) |
| Session | Optionnel | Identifiant de session du mécanisme d'acquisition |

---

#### Exigences différenciées S5

**EP-S5-R1 — Source : mécanisme d'acquisition à reproductibilité suffisante**

La source d'une trace S5 est un mécanisme d'acquisition dont la reproductibilité est suffisante pour que deux instances du même mécanisme appliquées au même phénomène produisent la même ref. Cette exigence découle de DT-S5-4 amendée (Position Gamma).

En Phase A : aucun mécanisme ne satisfait cette exigence — silence structurel (IG-I6).

En Phase B+ : le mécanisme est officiellement inscrit dans la table de provenance (LOT-P1-2.4) avec famille officielle S5. Sa reproductibilité est vérifiée lors de sa qualification documentaire. L'opérateur humain seul, sans protocole d'observation documenté et validé, ne constitue pas un mécanisme d'acquisition S5 suffisant.

**EP-S5-R2 — Date : ingestion canonique + phénomène optionnel**

Le champ `date` canonique porte la date d'ingestion ISO 8601 UTC produite par la couche. Si la date du phénomène observé est identifiée et diffère de la date d'ingestion, elle peut être portée dans `contexte.date_phenomene` (optionnel, ISO 8601 UTC). Son absence ne constitue pas une violation (RV5 · DI3).

**EP-S5-R3 — Unicité de source par trace**

Conforme à EP-RC1 (LOT-P2-1 §14.5) : une trace S5 a exactement une source. Si deux mécanismes produisent des traces pour le même phénomène, ce sont deux traces distinctes — jamais une fusion de sources.

**EP-S5-R4 — Interdiction d'inférence de source**

La source ne peut jamais être inférée à partir du contenu de la trace (type, ref, description). Absence de source identifiable → rejet immédiat (IG-I4 · DI2).

---

#### Format du contexte S5

Lorsque le mécanisme d'activation fournit un contexte, le format recommandé pour S5 inclut :

```
{
  date_phenomene?:     <ISO 8601 UTC>,
  session_moteur?:     <identifiant>,
  fenetre_temporelle?: <texte>
}
```

L'absence de contexte est valide (RV5). Le format est défini ici pour permettre l'exploitation par les couches L2/L3 lors des activations futures.

---

#### Unité de session S5

L'unité de session est définie par chaque module d'activation lors de son inscription dans la table de provenance (LOT-P1-2.4). Elle n'est pas fixée par EP-S5 — elle dépend de la granularité du mécanisme d'acquisition.

---

#### Gaps documentés — non résolus en Phase A

| Gap | Résolution attendue |
|---|---|
| Fenêtre temporelle pour `direction-dxy` | Protocole d'activation Phase B+ |
| Critères de déclenchement pour `comportement-btc` | Protocole d'activation Phase B+ |
| Import S5 depuis source documentaire externe | LOT d'activation Phase B+ — module d'import S5 |
| Contradiction inter-sources S5 simultanées | EP-RC1 s'applique — deux traces distinctes, pas de fusion |

---

## §6 Décisions à trancher

| ID | Question | Options | Dépend de |
|---|---|---|---|
| DT-S5-1 | **Frontière S4/S5** : critère de distinction entre donnée personnelle (S4) et donnée contextuelle de marché (S5) lorsque les deux peuvent être saisies par l'opérateur | **TRANCHÉE** — Conditions A+B · §5.4 · 2026-08-12 | Aucune — décision fondatrice |
| DT-S5-2 | **Intégration dans DI1** : comment RF-S5 s'insère-t-elle dans la hiérarchie RF-R1→RF-R6 sans modifier les règles figées ? | **TRANCHÉE** — RF-S5 après RF-R3, avant RF-R4 · §5.5 · 2026-08-12 | DT-S5-1 |
| DT-S5-3 | **Grain de la trace S5** : une trace S5 représente-t-elle (A) un état de marché à un instant (session moteur), (B) un événement macro ponctuel, ou (C) les deux dans deux sous-types distincts ? | **TRANCHÉE** — Option C · §5.6 · 2026-08-14 | DT-S5-1 |
| DT-S5-4 | **Périmètre Phase A** : quelles données S5 sont activables sans source externe ? Les champs du formulaire moteur ? Un sous-ensemble ? Un protocole de saisie structurée à définir ? | **TRANCHÉE + AMENDÉE** — Position Gamma · S5 silencieuse Phase A · §5.8 · 2026-08-15 | DT-S5-1 · DT-S5-3 |
| DT-S5-5 | **Statut des sessions moteur existantes** : les sessions capturées en localStorage constituent-elles des données S5 rétroactivement, ou S5 ne concerne que les ingestions futures ? | **TRANCHÉE** — Option B · §5.9 · 2026-08-15 | DT-S5-3 · DT-S5-4 |
| DT-S5-6 | **Valeur canonique d'une trace S5** : structure exacte du champ `valeur` — objet structuré avec champs bornés ? texte libre enrichi de métadonnées ? valeur de référence + descripteurs libres ? | **TRANCHÉE** — Option C · §5.7 · 2026-08-15 | DT-S5-1 · DT-S5-3 |

---

## §7 Stratégie de développement

### §7.1 Séquençage des micro-lots

LOT-P2-4 est un lot de doctrine pure. Ses micro-lots correspondent aux étapes de résolution des décisions et à la rédaction du schéma.

| Micro-lot | Mission | Décisions tranchées | Prérequis |
|---|---|---|---|
| **P2-4.A** — Ontologie S5 & frontière S4/S5 | Définir ce qu'est S5 · trancher DT-S5-1 · intégrer RF-S5 dans DI1 (DT-S5-2) · résoudre FB-F6 (S5/S4) | DT-S5-1 · DT-S5-2 | Ouverture lot |
| **P2-4.B** — Grain et structure canonique | Définir le grain de trace S5 (DT-S5-3) · schéma canonique complet des champs (DT-S5-6) | DT-S5-3 · DT-S5-6 | P2-4.A VALIDÉ |
| **P2-4.C** — Périmètre Phase A & provenance | Délimiter Phase A (DT-S5-4) · statut données existantes (DT-S5-5) · exigences EP-S5 | DT-S5-4 · DT-S5-5 | P2-4.B VALIDÉ |
| **P2-4.D** — Validation documentaire | Vérifier cohérence globale · CV-1→CV-N · DQC V2 CAS A | — | P2-4.C VALIDÉ |

### §7.2 Contrainte architecturale

Ce lot produit un schéma doctrinal pur. Il ne génère aucun code, aucun module, aucune interface.

La règle RF-S5 produite dans P2-4.A s'insère dans la hiérarchie DI1 de LOT-P2-1 après RF-R3 et avant RF-R4, sans modifier les règles RF-R1 à RF-R6 existantes (DT-S5-2 — §5.5). Toute modification de ces règles constituerait une violation des invariants de LOT-P2-1 et est interdite.

---

## §8 Critères de validation

### §8.1 Critères de complétude documentaire

| CV | Critère | Condition |
|---|---|---|
| CV-1 | Frontière S4/S5 tranchée | DT-S5-1 résolu · règle déterministe · aucun cas limite non couvert |
| CV-2 | RF-S5 intégrée dans DI1 | RF-S5 insérée dans la hiérarchie séquentielle · RF-R1→RF-R6 inchangées |
| CV-3 | Schéma canonique S5 complet | Tous les champs définis · types · contraintes · valeurs admises |
| CV-4 | EP-S5 définie | Exigences de provenance S5 conformes à DI3 (différenciées) |
| CV-5 | Périmètre S5 Phase A délimité | S5 silencieux Phase A · référentiel défini (§5.8) · types admis/exclus/différés documentés · condition d'activation future définie (EP-S5-R1 §5.10) |
| CV-6 | Aucune contradiction avec invariants P2-1 | Contrôle explicite RF-R4 · DI1 · DI5 · IG-I1→IG-I6 |
| CV-7 | Test de généralité PASS | Chaque règle S5 reste valide si le marché spécifique disparaît — aucune règle Binance-spécifique |
| CV-8 | Pattern Reflection Doctrine V1 respectée | Aucune fusion S5×SY1 · aucun profil figé extrait de S5 |
| CV-9 | Language System V1 vérifié | Tout nouveau terme introduit conforme au vocabulaire officiel |

---

## §9 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | Micro-lots P2-4.A à P2-4.D validés (présent document complet et cohérent) |
| Condition 2 | CV-1 à CV-9 satisfaits |
| Condition 3 | Décisions DT-S5-1 à DT-S5-6 toutes documentées et non contradictoires |
| Condition 4 | Test de généralité PASS sur l'ensemble du schéma S5 |
| Condition 5 | DQC V2 CAS A |
| Condition 6 | DQC V3 PASS |
| Condition 7 | Décision opérateur explicite de clôture |
