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
3. **Comment S5 s'intègre-t-elle dans la doctrine d'ingestion V1 ?** — règle RF-S5 dans la hiérarchie DI1, exigences de provenance EP-S5, mise à jour de RF-RC4.

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
| S2 ≠ S5 | LOT-P2-3 §6 | Une trace S5 décrit un état de marché, jamais un état patrimonial |

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

RF-S5 est une nouvelle règle nommée destinée à être insérée entre RF-R3 (source visuelle → S3) et RF-R4 (annotation manuelle → S4) dans la hiérarchie DI1. RF-R1 à RF-R6 conservent leurs libellés, leurs textes et leurs positions relatives entre elles. L'intégration opérationnelle de RF-S5 dans DI1 fait l'objet de DT-S5-2 (P2-4.A — non encore exécutée).

**Décisions débloquées par DT-S5-1 :** DT-S5-2 · DT-S5-3 · DT-S5-6 (et par chaîne : DT-S5-4 · DT-S5-5).

---

## §6 Décisions à trancher

| ID | Question | Options | Dépend de |
|---|---|---|---|
| DT-S5-1 | **Frontière S4/S5** : critère de distinction entre donnée personnelle (S4) et donnée contextuelle de marché (S5) lorsque les deux peuvent être saisies par l'opérateur | **TRANCHÉE** — Conditions A+B · §5.4 · 2026-08-12 | Aucune — décision fondatrice |
| DT-S5-2 | **Intégration dans DI1** : comment RF-S5 s'insère-t-elle dans la hiérarchie RF-R1→RF-R6 sans modifier les règles figées ? Nouvelle priorité après RF-R5 ? RF-R2 via module écrivant ? | Selon DT-S5-1 | DT-S5-1 |
| DT-S5-3 | **Grain de la trace S5** : une trace S5 représente-t-elle (A) un état de marché à un instant (session moteur), (B) un événement macro ponctuel, ou (C) les deux dans deux sous-types distincts ? | A · B · C | DT-S5-1 |
| DT-S5-4 | **Périmètre Phase A** : quelles données S5 sont activables sans source externe ? Les champs du formulaire moteur ? Un sous-ensemble ? Un protocole de saisie structurée à définir ? | À définir | DT-S5-1 · DT-S5-3 |
| DT-S5-5 | **Statut des sessions moteur existantes** : les sessions capturées en localStorage constituent-elles des données S5 rétroactivement, ou S5 ne concerne que les ingestions futures ? | A (rétroactif) · B (prospectif) | DT-S5-3 · DT-S5-4 |
| DT-S5-6 | **Valeur canonique d'une trace S5** : structure exacte du champ `valeur` — objet structuré avec champs bornés ? texte libre enrichi de métadonnées ? valeur de référence + descripteurs libres ? | À définir | DT-S5-1 · DT-S5-3 |

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

La règle RF-S5 produite dans P2-4.A devra s'insérer dans la hiérarchie DI1 de LOT-P2-1 **sans modifier** les règles RF-R1 à RF-R6 existantes. Toute modification de ces règles constituerait une violation des invariants de LOT-P2-1 et est interdite.

---

## §8 Critères de validation

### §8.1 Critères de complétude documentaire

| CV | Critère | Condition |
|---|---|---|
| CV-1 | Frontière S4/S5 tranchée | DT-S5-1 résolu · règle déterministe · aucun cas limite non couvert |
| CV-2 | RF-S5 intégrée dans DI1 | RF-S5 insérée dans la hiérarchie séquentielle · RF-R1→RF-R6 inchangées |
| CV-3 | Schéma canonique S5 complet | Tous les champs définis · types · contraintes · valeurs admises |
| CV-4 | EP-S5 définie | Exigences de provenance S5 conformes à DI3 (différenciées) |
| CV-5 | Périmètre Phase A borné | Sources S5 actives Phase A délimitées · exclusions exhaustives |
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
