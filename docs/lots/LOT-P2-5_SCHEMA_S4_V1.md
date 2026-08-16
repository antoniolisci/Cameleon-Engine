# LOT-P2-5 — Schéma canonique S4 · Famille Personnelle V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-5 |
| Intitulé | Schéma canonique S4 · Famille Personnelle V1 |
| Programme | P2 — Doctrine des Sources & Schémas d'Ingestion |
| Phase Roadmap V1 | A |
| Type | Doctrine — Schéma canonique |
| Document officiel | `docs/lots/LOT-P2-5_SCHEMA_S4_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-08-15 |
| Date de clôture | — |
| Prérequis | LOT-P2-1 CLOS · LOT-P2-4 CLOS |

---

## §1 Mission

LOT-P2-5 définit le **schéma canonique de la trace S4 Personnelle** : la structure, la sémantique, les règles de classification et les exigences de provenance pour les données issues de l'annotation manuelle, du journal et des réflexions rédigées de l'opérateur.

Ce lot produit un document de doctrine pure — aucun code, aucune implémentation. Il répond à trois questions indissociables :

1. **Qu'est-ce qu'une donnée S4 ?** — définition ontologique de la famille Personnelle, distincte de S5 (Contextuelle) selon DT-S5-1 et de SY1 (Comportementale) selon FB-F3.
2. **Comment une trace S4 est-elle structurée ?** — schéma canonique : champs obligatoires, types, valeurs, contraintes.
3. **Comment S4 s'intègre-t-elle dans la doctrine d'ingestion V1 ?** — règle RF-R4 figée dans la hiérarchie DI1, exigences de provenance EP-S4, position Phase A.

LOT-P2-5 constitue le quatrième schéma source du Programme P2, après S1 (LOT-P2-2), S2 (LOT-P2-3) et S5 (LOT-P2-4). La règle de classification RF-R4 est figée depuis LOT-P2-1 — ce lot ne la modifie pas. Il définit la structure interne de la trace S4, précise le périmètre opérationnel de RF-R4, et documente les conditions d'activation de S4.

---

## §2 Sources doctrinales

| Document | Rôle dans ce lot |
|---|---|
| LOT-P2-1 — Doctrine d'ingestion V1 | Source d'autorité pour RF · FB · EP · CL · DI1→DI5 — aucune de ces règles ne peut être modifiée |
| LOT-P1-2.1 — Modèle canonique de trace V1 | Structure des 6 champs de toute trace : famille · source · date · valeur · contexte optionnel · session optionnelle |
| LOT-P1-2.4 — Doctrine de provenance V1 | Règles de provenance — S4 hors périmètre Phase A (§4.5) — EP-S4 différée à activation |
| LOT-P2-4 — Schéma canonique S5 V1 | DT-S5-1 TRANCHÉE — frontière S4/S5 consommable par ce lot |
| Architecture Conceptuelle Fondatrice V1 | Registre officiel des 13 familles — S4 = Personnelle |
| Memory Doctrine V1 | Doctrine N2 de la mémoire comportementale et de son affichage — contraintes sur les couches d'usage futures, non sur le schéma |
| Pattern Reflection Doctrine V1 | Interdiction de fusion inter-sources — contrainte transversale via IG-I5 |
| Roadmap V1 §4 P2 | Livrable L4 : Schéma canonique S4 (Personnelle — journal/annotations) |
| Language System V1 | Contrôle du vocabulaire introduit par ce lot |

---

## §3 Périmètre

### §3.1 Inclus

- Définition ontologique de la famille S4 Personnelle (ce qu'elle est, ce qu'elle n'est pas)
- Frontière S4/S5 — consommation de DT-S5-1 (TRANCHÉE · LOT-P2-4 §5.4) comme fondement normatif
- Frontière S4/SY1 — consommation de FB-F3 (figée · LOT-P2-1 §13.3) comme règle de résolution
- Précision du périmètre opérationnel de RF-R4 — sans modification de son texte figé
- Schéma canonique d'une trace S4 : champs, types, contraintes, valeurs admises
- Exigences de provenance EP-S4 — définies dans ce lot en anticipation de l'activation (DT-S4-5)
- Position Phase A de S4 — tranchée dans ce lot
- Audit de la frontière S4/SY3 si nécessaire (P2-5.B)

### §3.2 Exclus

- Implémentation technique du module d'ingestion S4 (périmètre Programme P3)
- Normalisation inter-familles (périmètre LOT-P2-7)
- Doctrine des Corrélations (périmètre LOT-P2-8)
- Schéma S3 Visuelle (périmètre LOT-P2-6)
- Doctrine d'usage de S4 — analyse, synthèse, affichage des données S4 (périmètre Doctrine de la Mémoire Personnelle · non encore rédigée)
- Forces Constellium (DT-FORCES-01 — instruit, non décidé — exclusion provisoire : leur nature familiale reste indéterminée)
- Toute modification des règles DI1→DI5 figées dans LOT-P2-1
- Toute modification du texte figé de RF-R4, DI5 ou FB-F3
- Toute modification des contrats S1 (LOT-P2-2), S2 (LOT-P2-3), S5 (LOT-P2-4)

---

## §4 Invariants hérités — non négociables

Ces règles sont figées par les lots antérieurs. LOT-P2-5 ne peut pas les modifier.

### §4.1 Invariants LOT-P2-1 directement contraignants pour S4

| Invariant | Source | Règle |
|---|---|---|
| IG-I1 | LOT-P2-1 §6 | Toute trace S4 est conforme au modèle canonique LOT-P1-2.1 (6 champs) |
| IG-I2 | LOT-P2-1 §6 | Une donnée appartient à une et une seule famille — S4 exclut toute appartenance simultanée à SY1 ou S5 |
| IG-I3 | LOT-P2-1 §6 | La classification est déterministe — RF-R4 produit un résultat unique pour tout input qualifiant |
| IG-I4 | LOT-P2-1 §6 | Toute trace S4 a une source identifiable conforme à LOT-P1-2.4 |
| IG-I5 | LOT-P2-1 §6 | Aucune corrélation à l'ingestion — une trace S4 ne fusionne pas avec d'autres familles |
| IG-I6 | LOT-P2-1 §6 | Silence structurel — une donnée non classifiable comme S4 n'est pas forcée dans cette famille |
| DI1 | LOT-P2-1 §5 | Hiérarchie séquentielle RF-R1→RF-R6 : RF-R4 occupe la priorité 4 (après RF-S5, avant RF-R5) |
| DI5 | LOT-P2-1 §5 | **Figé** : S4 = toute donnée issue d'une annotation manuelle ou d'un journal de l'opérateur — la forme source prime sur le contenu |
| RF-R4 | LOT-P2-1 §12.3 | **Figée** : "annotation manuelle ou journal de l'opérateur → S4, indépendamment du contenu rédigé" — valeur mémorielle = voix de l'opérateur, non le sujet traité |
| FB-F3 | LOT-P2-1 §13.3 | **Figée** : S4/SY1 — l'identité du producteur prime sur la nature du contenu — absence de module écrivant interne → RF-R4 → S4 |
| RF-RC4 | LOT-P2-1 §12 | S4 inactive Phase A — exigences EP différées à l'activation |

### §4.2 Invariant LOT-P2-4 consommable — Frontière S4/S5

| Invariant | Source | Règle |
|---|---|---|
| DT-S5-1 Condition A | LOT-P2-4 §5.4 | **Fondement normatif de la frontière S4/S5.** Un type est admissible dans le référentiel canonique S5 si son sujet canonique est un fait ou état de l'environnement externe indépendant de l'opérateur. "Le sujet n'est pas l'opérateur lui-même, ni ses perceptions rédigées librement, ni ses états internes, ni ses réflexions, ni ses jugements librement exprimés." Une donnée dont le sujet est l'opérateur lui-même n'est pas admissible S5. RF-R4 la classifie S4 si — et seulement si — sa forme est une annotation manuelle ou un journal de l'opérateur. Une exclusion de S5 ne produit pas automatiquement S4 : la forme source reste le critère déterminant (RF-R4). |

### §4.3 Memory Doctrine V1 — portée sur ce lot

Memory Doctrine V1 est une doctrine de la mémoire comportementale et de son affichage. Par §IV, ses règles s'appliquent à tout affichage mémoire. Elle ne définit pas la structure canonique de S4.

Elle produit des contraintes sur les **couches d'usage et d'affichage futures** de S4 :

- Interdiction de prescription ("Tu devrais faire...")
- Interdiction de prédiction ("Tu vas probablement...")
- Interdiction d'explication causale ("C'est parce que tu as...")
- Interdiction de fusion — mémoire comportementale et lecture marché (§II · aussi capturée par IG-I5)

Ces interdictions ne contraignent pas la structure du schéma S4. Elles contraindront les couches qui exploiteront les données S4 une fois activées. La Doctrine de la Mémoire Personnelle (non encore rédigée) établira la gouvernance d'usage spécifique à S4.

---

## §5 Tensions à instruire

### §5.1 État de la question à l'ouverture

LOT-P2-1 a figé RF-R4 et FB-F3, mais n'a pas défini la structure interne d'une trace S4 ni précisé le périmètre exact du terme "annotation manuelle ou journal de l'opérateur". LOT-P2-4 a tranché DT-S5-1 — la frontière S4/S5 est résolue côté S5. Ce lot doit définir S4 par sa propre ontologie, complémentaire à RF-R4.

**Ce que les lots précédents ont figé :**

- RF-R4 : forme source → S4, indépendamment du contenu (LOT-P2-1 §12.3). Exemples donnés : "note, observation, entrée de journal, réflexion personnelle"
- DI5 : la valeur mémorielle est la voix de l'opérateur, non le sujet traité (LOT-P2-1 §5)
- FB-F3 : producteur prime sur contenu — absence de module écrivant interne → RF-R4 → S4 (LOT-P2-1 §13.3)
- CL-A6 fondateur : note de journal portant sur les patterns comportementaux → S4, non SY1 (LOT-P2-1 §11.3)
- DT-S5-1 Condition A : fondement de la frontière S4/S5 (LOT-P2-4 §5.4)

**Ce que les lots précédents n'ont pas tranché :**

- La définition précise de "annotation manuelle ou journal" (LOT-P2-4 §5.1, rappel explicite) : s'étend-elle à toute saisie directe de l'opérateur, ou seulement aux saisies de nature personnelle et réflexive ?
- La structure interne du champ `valeur` d'une trace S4 : texte libre brut, objet typé, ou forme hybride ?
- La position Phase A de S4 : silence total (comme S5 Position Gamma) ou activation conditionnelle sans infrastructure externe ?
- Les exigences EP-S4 différenciées

### §5.2 Tension principale — Périmètre de RF-R4

RF-R4 nomme quatre formes sources : note · observation · entrée de journal · réflexion personnelle. Ce lot doit trancher :

| Axe | Question ouverte |
|---|---|
| Liste illustrative ou fermée | Les quatre formes nommées par RF-R4 sont-elles exhaustives ou illustratives ? Existe-t-il d'autres formes qualifiantes ? |
| Périmètre de "annotation" | Une annotation est-elle nécessairement personnelle et réflexive, ou couvre-t-elle toute saisie textuelle libre de l'opérateur ? |
| Périmètre de "journal" | Journal = série d'entrées chronologiques structurées ? Ou toute note datée, même ponctuelle ? Les deux termes désignent-ils des formes distinctes ou un même objet ? |
| Champ texte formulaire | Une saisie dans un champ texte libre du formulaire moteur qualifie-t-elle comme "saisie directe" sous RF-R4 (→ S4), ou est-elle déjà capturée par RF-S5 si son contenu instancie un champ du référentiel canonique S5 ? Ce cas est partiellement résolu par DT-S5-1 Condition B — l'instrumentation de DT-S4-1 doit confirmer la complémentarité sans contradiction. |

### §5.3 Tension secondaire — Frontières

**S4/S5** — DT-S5-1 TRANCHÉE (LOT-P2-4 §5.4) fournit le fondement normatif. La frontière opérationnelle s'établit par l'articulation de Condition A (côté S5) et de RF-R4 (côté S4) : une donnée dont le sujet est l'opérateur lui-même et dont la forme est une annotation manuelle → S4 par RF-R4, non S5. L'instrumentation de DT-S4-1 doit confirmer cette articulation sans rouvrir DT-S5-1.

**S4/SY1** — FB-F3 FIGÉE (LOT-P2-1 §13.3) : producteur prime sur contenu. Pas de DT spécifique nécessaire pour cette frontière — elle est déjà résolue.

**S4/SY3** — risque identifié si l'opérateur rédige un commentaire libre associé à une décision moteur. Ce cas sera audité en P2-5.B si des cas limites non couverts par FB-F3 sont identifiés.

### §5.4 Exclusion provisoire — DT-FORCES-01

Les forces Constellium (Feu · Air · Terre · Eau · Éther) font l'objet de DT-FORCES-01 — instruit, non décidé, Q-1→Q-5 ouvertes. Leur nature familiale est indéterminée. Elles sont exclues provisoirement du périmètre de ce lot — même pattern que LOT-P2-4 §5.8. Aucune décision produite dans ce lot ne les concerne.

---

### §5.5 DT-S4-1 — Décision adoptée (2026-08-15)

**Décision opérateur :** DT-S4-1 est adoptée définitivement selon la formulation ci-dessous, issue du contrôle contradictoire de P2-5.A (2026-08-15). Verdict : **TRANCHÉE AVEC BORNE EXPLICITE** (BORNE-S4-1).

---

#### Niveau 1 — Ce qui est hérité et certain (invariants figés — non décidés par DT-S4-1)

RF-R4 (figée · LOT-P2-1 §12.3) : *"son origine primaire est une saisie directe de l'opérateur : note, observation, entrée de journal, réflexion personnelle"* → S4 Personnelle, indépendamment du contenu rédigé.

DI5 (figé · LOT-P2-1 §5) : la forme de la source prime sur le contenu. La valeur mémorielle est la voix de l'opérateur, non le sujet traité dans la note.

FB-F3 (figée · LOT-P2-1 §13.3) : l'identité du producteur prime sur la nature du contenu — absence de module écrivant interne → RF-R4 s'applique. Cas fondateur CL-A6 et CL-8 : commentaire de l'opérateur, y compris associé à une décision moteur, → S4, trace distincte et indépendante de la trace SY3.

DI1 (figé · LOT-P2-1 §12.2) : RF-R4 est évaluée uniquement après non-déclenchement de RF-R1 · RF-R2 · RF-R3 · RF-S5. Les saisies dans un champ du référentiel canonique S5 atteignent RF-S5 avant RF-R4 et n'y parviennent pas (DT-S5-1 Condition B · LOT-P2-4 §5.4).

---

#### Niveau 2 — Ce qui est décidé par DT-S4-1

**(D1) La liste des formes sources citées par RF-R4 (note · observation · entrée de journal · réflexion personnelle) est déclarée illustrative et non fermée.**

DT-S4-1 décide — non comme déduction normative nécessaire du texte, mais comme décision explicite de ce lot — que ces quatre formes illustrent le critère *"saisie directe de l'opérateur"* sans l'épuiser. D'autres formes de saisie directe de l'opérateur peuvent satisfaire RF-R4 si elles répondent au critère normatif de RF-R4, sans être réductibles aux quatre formes nommées.

Quel que soit le **sujet traité** dans le contenu rédigé (DI5 — *"indépendamment du contenu rédigé"*), le résultat est S4 Personnelle.

Le caractère illustratif de la liste est une décision portant sur les **formes sources**. Il ne préjuge pas et ne tranche pas la question de l'authorship du contenu — celle-ci est enregistrée séparément comme BORNE-S4-1 (Niveau 4).

**Justification :** une liste fermée à quatre formes créerait une lacune de classification pour des formes légitimes d'expression personnelle de l'opérateur non encore nommées. Elle forcerait RF-R6 (rejet) pour des données dont aucune autre règle ne produit de famille valide — résultat contraire à l'esprit de DI5.

---

#### Niveau 3 — Ce qui résulte de l'architecture DI1 actuelle (observation, non critère normatif de RF-R4)

Dans DI1 tel qu'établi par LOT-P2-1 et amendé par LOT-P2-4, RF-S5 (priorité 3.5) capture les saisies de l'opérateur instanciées dans un champ du référentiel canonique S5 avant que RF-R4 ne soit évaluée. Ce qui atteint RF-R4 dans l'architecture actuelle est de fait composé de *"saisies directes de l'opérateur sous forme libre"* (LOT-P2-4 §5.4).

Cette observation décrit le périmètre résiduel actuel de RF-R4 dans DI1. Elle n'est pas une condition normative supplémentaire de RF-R4 et ne peut pas être invoquée pour exclure des formes d'entrée non encore définies.

---

#### Niveau 4 — BORNE-S4-1 (point non déterminé — différé à l'activation de S4)

Les sources normatives ne permettent pas de trancher le cas suivant :

*Saisie dont l'opérateur est l'agent de l'acte d'entrée (saisie directe au sens de RF-R4), mais dont le contenu est entièrement issu d'une source externe sans contribution personnelle de l'opérateur — texte copié-collé d'une source tierce sans commentaire ni modification ajouté par l'opérateur.*

Le terme *"origine primaire"* dans RF-R4 ne précise pas si l'origine primaire désigne l'acteur de l'acte de saisie ou l'auteur du contenu. DI5 crée une tension non résolue : *"la voix de l'opérateur"* (favorise le critère d'authorship) contre *"indépendamment du contenu rédigé"* (favorise le critère d'acte). Les sources ne tranchent pas cette tension.

**BORNE-S4-1 est enregistrée.** Ce point devra être tranché avant toute activation opérationnelle du module d'ingestion S4. En Phase A (S4 inactive), BORNE-S4-1 est sans conséquence pratique mais l'indétermination est documentée.

---

### §5.6 DT-S4-2 — Décision adoptée (2026-08-15)

**Décision opérateur :** DT-S4-2 est adoptée définitivement selon la formulation ci-dessous, issue du contrôle contradictoire de P2-5.B (2026-08-15). Verdict : **TRANCHÉE AVEC BORNE — Option A · grain = contribution personnelle distincte · BORNE-S4-2 enregistrée.**

---

#### Formulation normative D2

Une trace S4 représente une **contribution personnelle distincte** de l'opérateur — une entrée de nature personnelle, constituée comme unité indépendante, non agrégée avec une autre contribution.

Plusieurs contributions réalisées au cours d'une même session constituent des traces canoniques distinctes, reliables par le champ `session` optionnel du modèle canonique (LOT-P1-2.1). La session est un lien entre des grains distincts — elle n'est pas le grain.

Cette décision porte sur le grain uniquement. Elle ne définit pas la structure du champ `valeur`, réservée à DT-S4-3. Elle ne décide pas de la politique d'immutabilité des traces, déjà établie par RE3 et MI-2 (LOT-P1-2.1) pour toutes les familles.

La frontière opérationnelle permettant de reconnaître deux contributions comme distinctes dans les cas de saisie continue est enregistrée comme BORNE-S4-2, non déterminée, différée avant activation S4.

---

#### Nature de la décision

Option A est une **décision architecturale motivée**, non une nécessité normative textuelle. Aucune doctrine ne mandate textuellement que chaque acte de saisie constitue une trace distincte. Le choix résulte de la convergence des arguments suivants — dont les statuts sont explicitement distingués :

| Argument | Source | Statut exact |
|---|---|---|
| IG-I3 — Déterminisme | LOT-P2-1 §6 | **Signal d'indétermination architecturale** · Aucune règle déterministe de clôture d'un bloc S4 n'existe dans les doctrines actuelles. Option B nécessiterait une décision doctrinale supplémentaire avant d'être opérationnalisable. Laisser cette frontière à l'implémentation sans règle préalable introduirait une indétermination incompatible avec l'exigence générale de déterminisme portée par l'architecture d'ingestion. IG-I3 n'interdit pas textuellement une telle règle. En revanche, l'opérationnalisation d'Option B nécessiterait qu'une règle déterministe de clôture soit préalablement définie afin de ne pas laisser cette frontière à une décision arbitraire d'implémentation. |
| RE3 / MI-2 — Immutabilité | LOT-P1-2.1 §8.2 · §9 | **Normatif partiel** · RE3 et MI-2 invalident les variantes évolutives ou mutables de l'agrégation (un bloc qui s'enrichit après écriture). Ils n'interdisent pas à eux seuls un bloc clos constitué une seule fois. L'argument est décisif contre les variantes mutables d'Option B, non contre toute agrégation. |
| EP-RC1 — Unicité de source | LOT-P2-1 §14.5 | **Argument de cohérence, non démonstration d'atomicité intra-source** · EP-RC1 interdit la fusion de sources distinctes (deux modules → une seule trace). Il ne prohibe pas qu'une source unique groupe plusieurs éléments, la source S4 restant l'opérateur dans tous les cas. |
| DT-S5-3 — Précédent S5 | LOT-P2-4 | **Précédent architectural, pas norme transférable** · S5 a adopté le grain atomique. Cette décision est un signal de cohérence de design — elle n'impose pas à S4 le même grain. |
| Constitution Intellectuelle V1 | CAMELEON_INTELLECTUAL_CONSTITUTION_V1.md | **Appui de cohérence architecturale, non interdiction normative directe** · L'atomicité maximise la capacité des couches de lecture à appliquer les doctrines de traçabilité et de réfutabilité. La Constitution ne contient pas de clause prohibant toute agrégation à l'ingestion. |
| Préemption de DT-S4-3 | Périmètre DT-S4-2 | **Risque architectural et séquentiel** · Option B contraindrait prématurément la structure du champ `valeur` alors que DT-S4-3 est explicitement réservée à la décision suivante. Option A préserve l'indépendance de DT-S4-3. |
| Champ `session` existant | LOT-P1-2.1 | Le modèle canonique couvre déjà le besoin de regroupement fonctionnel sans forcer la fusion physique. Option B ne crée aucune valeur que Option A ne satisfait pas déjà via ce champ. |

---

#### Ce que DT-S4-2 ne tranche pas

- **BORNE-S4-1** — inchangée. DT-S4-2 ne touche pas à la question de l'authorship du contenu (copy-paste externe sans contribution personnelle).
- **BORNE-S4-2** — non déterminée. La frontière opérationnelle permettant de distinguer deux contributions dans une saisie continue (journal rédigé sans interruption vs. en plusieurs fois) n'est pas définie par les doctrines actuelles. Ce point devra être tranché avant activation S4.
- **Structure du champ `valeur`** — tranchée par DT-S4-3 (§5.7). DT-S4-2 définit le grain ; DT-S4-3 définit le format du contenu de ce grain.
- **Politique de modification des traces** — déjà établie par RE3 / MI-2 (LOT-P1-2.1), applicables à toutes les familles, indépendamment du grain. Ce n'est pas une conséquence de DT-S4-2.

---

### §5.7 DT-S4-3 — Décision adoptée (2026-08-15)

**Décision opérateur :** DT-S4-3 est adoptée définitivement selon la formulation ci-dessous. Verdict : **TRANCHÉE — décision architecturale motivée · contenu textuel libre · sans structuration sémantique imposée.**

---

#### Formulation normative D3

Le champ `valeur` d'une trace S4 contient l'expression personnelle de l'opérateur — un contenu textuel libre préservant la contribution telle que formulée, sans structuration sémantique imposée.

Aucun format structuré, aucun champ de catégorie, aucune métadonnée interne n'est requis dans `valeur`. L'expression de l'opérateur est le contenu — pas une représentation dérivée ou catégorisée de ce contenu.

DT-S4-3 n'intègre aucune métadonnée supplémentaire dans `valeur`. Le statut de toute métadonnée éventuelle associée à la contribution reste à instruire dans le périmètre compétent.

Les valeurs absentes ou sémantiquement vides sont rejetées selon la politique établie par LOT-P1-2.2 §5.2.

---

#### Nature de la décision

DT-S4-3 est une **décision architecturale motivée**, non une nécessité normative textuelle. Les doctrines figées ne mandatent pas un format string — elles convergent avec ce choix sans l'imposer. Une enveloppe neutre telle que `{contenu: "<texte original>"}` serait normativement compatible avec les acquis figés, mais aucune doctrine actuelle ne justifie son introduction.

| Argument | Source | Statut exact |
|---|---|---|
| DI5 — Forme source prime | LOT-P2-1 §5 | **Forte convergence** · DI5 établit que la valeur mémorielle est l'expression de l'opérateur elle-même, préservée sans transformation de sens. Cette convergence favorise un contenu textuel libre. DI5 ne mandate pas textuellement un format string — il exige que l'expression soit fidèlement conservée. Un objet neutre préservant le texte intégralement serait compatible avec DI5. |
| RF-R4 — Classification | LOT-P2-1 §12.3 | **Signal contextuel, non règle de format** · RF-R4 définit quand une donnée appartient à S4. Ses exemples (note, observation, journal, réflexion) sont cohérents avec du contenu textuel. RF-R4 ne définit pas le format de stockage de `valeur`. |
| DT-S4-1 D1 — Liste illustrative | §5.5 | **Pertinence indirecte** · D1 déclare illustrative la liste des formes sources RF-R4. DT-S4-3 ne doit pas reconstruire indirectement une taxonomie fermée via un champ de catégorie obligatoire dans `valeur`. |
| Parcimonie architecturale | Principe design | **Décision de design** · Aucune doctrine ne justifie l'introduction d'une enveloppe structurée. Toute structure ajoutée sans fondement doctrinal est une décision d'implémentation anticipée sans nécessité. |
| Non-préemption de DT-S4-5 | Périmètre DT-S4-3 | **Contrainte de séquençage** · DT-S4-3 n'intègre pas de métadonnées dans `valeur` afin de ne pas contraindre la définition du champ `contexte`, dont le format et le contenu relèvent de DT-S4-5. |
| LOT-P1-2.2 §5.2 — Valeurs vides | LOT-P1-2.2 | **Règle existante** · Les valeurs absentes ou sémantiquement vides sont rejetées par la politique générale de LOT-P1-2.2. Aucune borne résiduelle sur ce point. |

---

#### Ce que DT-S4-3 ne décide pas

- **Format de `contexte`** — le contenu et le format de `contexte` restent à définir par DT-S4-5. DT-S4-3 décide seulement de ne pas anticiper de métadonnées dans `valeur`. Elle n'attribue pas les métadonnées au champ `contexte` — elle les laisse hors décision.
- **Propriétés techniques** — longueur maximale, encodage, normalisation, trim, sanitation : aucune de ces propriétés n'est décidée par DT-S4-3. Elles relèvent de l'implémentation lors de l'activation S4.
- **BORNE-S4-1** — inchangée. DT-S4-3 ne touche pas à la question de l'authorship du contenu.
- **BORNE-S4-2** — inchangée. DT-S4-3 ne touche pas à la frontière entre contributions distinctes dans une saisie continue.
- **Grain** — DT-S4-2 D2 reste intacte. DT-S4-3 définit uniquement le format du contenu d'une contribution, non le grain.
- **Politique d'immutabilité** — RE3 / MI-2 (LOT-P1-2.1) s'appliquent indépendamment du format de `valeur`.

---

### §5.8 DT-S4-4 — Décision adoptée (2026-08-15)

**Décision opérateur :** DT-S4-4 est adoptée définitivement selon la formulation ci-dessous, issue du contrôle contradictoire de P2-5.C (2026-08-15). Verdict : **TRANCHÉE — décision architecturale motivée · Option A · S4 silencieuse en Phase A.**

---

#### Formulation normative D4

S4 est silencieuse en Phase A. Aucune trace S4 n'est produite tant que S4 n'a pas fait l'objet d'une décision formelle d'activation conforme à la gouvernance applicable.

L'existence ontologique de S4, la définition de son grain (D2) et la définition du format de son champ `valeur` (D3) constituent les prérequis doctrinaux de toute activation future — ils ne constituent pas l'activation elle-même.

Cette décision est de nature architecturale motivée. Elle s'appuie principalement sur la convergence de RF-RC4 ("S4 inactive Phase A — exigences EP différées à activation") et de LOT-P2-1 §14.4 ("S4 inactive Phase A — exigences de provenance définies lors de l'activation"). Ces deux textes déclarent S4 inactive en Phase A sans définir ce terme comme une prohibition littérale de production de trace — c'est précisément ce que DT-S4-4 décide : cette inactivité déclarée est traduite en silence total, par décision architecturale. IG-I4, qui exige une source identifiable conforme à la doctrine de provenance, constitue un signal normatif fort en faveur d'un séquençage prudent, sans constituer pour autant une démonstration textuelle que toute production de trace S4 est impossible sans EP-S4 formellement définie. DT-S5-4 amendée constitue un précédent de discipline de séquençage (définition ontologique ≠ activation), applicable indépendamment des différences de mécanisme d'acquisition entre S4 et S5.

IG-I6 n'est pas utilisé comme fondement du silence de S4. La saisie directe de l'opérateur peut constituer un mécanisme d'acquisition reproductible au sens de IG-I6. Option B n'est donc pas normativement absurde — elle est écartée par décision architecturale motivée, fondée sur la convergence normative des textes et la discipline de séquençage, non sur une impossibilité technique ou une prohibition textuelle absolue.

Une activation future de S4 nécessite au minimum que soient satisfaites les trois conditions suivantes :
1. Les exigences de provenance nécessaires à l'activation de S4 sont définies dans le périmètre compétent.
2. BORNE-S4-1 et BORNE-S4-2 sont soit tranchées, soit explicitement exclues du sous-périmètre activé avec documentation de cette exclusion.
3. Une décision formelle d'activation est prise selon la gouvernance applicable.

---

#### Nature de la décision

DT-S4-4 est une **décision architecturale motivée**. La hiérarchie des arguments est la suivante :

| Niveau | Argument | Source | Statut exact |
|---|---|---|---|
| 1 — Convergence normative | RF-RC4 + LOT-P2-1 §14.4 | LOT-P2-1 §12 · §14.4 | **Ancrage principal** · Deux textes concordants déclarant S4 inactive Phase A. Le terme "inactive" n'est pas défini comme prohibition littérale — DT-S4-4 traduit cette inactivité en silence total. |
| 1 — Signal normatif fort | IG-I4 — source identifiable conforme à LOT-P1-2.4 | LOT-P2-1 §6 | **Signal normatif fort** · Plaide pour un séquençage prudent. Ne constitue pas une démonstration textuelle d'impossibilité sans EP-S4 formellement définie. |
| 2 — Précédent architectural | DT-S5-4 amendée / Position Gamma | LOT-P2-4 | **Précédent de séquençage uniquement** · Définition ontologique ≠ activation. Applicable indépendamment des différences de mécanisme d'acquisition entre S4 et S5. |
| 3 — Compatible avec Option B | IG-I6 — mécanisme reproductible | LOT-P2-1 §6 | **Argument non décisif pour le silence** · La saisie directe opérateur peut être reproductible au sens de IG-I6. Option B n'est pas normativement absurde — elle est écartée architecturalement. |
| 4 — Préférence de design | Parcimonie | Principe design | **Niveau inférieur, non normatif** · Ne pas activer une famille simplement parce qu'elle paraît techniquement acquérable. |

---

#### Ce que DT-S4-4 ne tranche pas

- **BORNE-S4-1** — inchangée. La question de l'authorship du copy-paste externe reste NON DÉTERMINÉE.
- **BORNE-S4-2** — inchangée. La frontière entre contributions dans une saisie continue reste NON DÉTERMINÉE.
- **BORNE-S4-4** — aucune. DT-S4-4 ne produit pas de borne résiduelle.
- **EP-S4** — le contenu, le format et les champs des exigences de provenance S4 restent entièrement à définir par DT-S4-5.
- **Forme de la décision formelle d'activation** — relève de la gouvernance applicable (Gouvernance V1), non du schéma S4.

---

### §5.9 DT-S4-5 — Décision adoptée (2026-08-15)

**Décision opérateur :** DT-S4-5 est adoptée définitivement selon la formulation ci-dessous, issue du contrôle contradictoire final de P2-5.C (2026-08-15). Verdict : **TRANCHÉE — décision architecturale motivée · EP-S4 définie en anticipation de l'activation.**

---

#### Formulation normative D5

Les exigences de provenance de la famille S4 Personnelle sont définies comme suit, conformément à la structure uniforme établie par EP (§14.2 · DI3 Option B). La présente définition satisfait la condition 1 de D4 (§5.8) — elle anticipe l'activation future sans la déclencher. Le LOT d'activation opérationnelle de S4 sera distinct de LOT-P2-5.

| Champ | Obligation | Valeur S4 |
|---|---|---|
| Source | Obligatoire | "Opérateur" — désigne l'opérateur comme producteur de la saisie directe S4. Valeur fixée par DT-S4-5. Toute modification de cette valeur requiert une révision doctrinale dans le LOT d'activation. |
| Date | Obligatoire | ISO 8601 UTC produite par la couche au moment de l'ingestion, conformément à la règle générale (LOT-P1-2.4 §3.2). Pour les nouvelles traces S4 produites par saisie directe opérateur, les états formalisés R1/R3/R4 n'ont pas de cas d'application identifié. |
| Contexte | Optionnel | Format suggéré — décision propre de DT-S4-5 exerçant l'autorité de LOT-P1-2.1 §5.4 : peut inclure la date de référence de la note si différente de la date d'ingestion. Absence de contexte = trace valide (RV5 > O4). |
| Session | Optionnel | Identifiant de session opaque ; mécanisme de production et unité définis dans le périmètre d'activation. La session relie des grains S4 distincts (D2) sans définir leur frontière et sans résoudre BORNE-S4-2. |

La valeur de source "Opérateur" est une décision architecturale motivée de DT-S4-5. Elle satisfait IG-I4 (source identifiable) et est cohérente avec la nature de la famille Personnelle (DI5 · RF-R4). Elle désigne l'opération productrice de la trace en l'absence de module écrivant nommé.

La date canonique est l'horodatage d'ingestion produit par la couche. Si la note porte sur un événement ou une période antérieure, la date de référence peut figurer dans `contexte` — cette suggestion est une décision propre de DT-S4-5, non une règle héritée. Elle n'affecte pas le champ `date` canonique.

Ces exigences ne lèvent pas la condition 2 (bornes délimitées ou exclues) ni la condition 3 (décision formelle d'activation) définies par D4.

---

#### Nature de la décision

DT-S4-5 est une **décision architecturale motivée** pour la valeur de source et le format suggéré de contexte. Les statuts d'obligation des champs sont textuellement établis par la structure uniforme EP.

| Argument | Source | Statut exact |
|---|---|---|
| Structure uniforme EP — 4 champs (Source / Date / Contexte / Session) | LOT-P2-1 §14.2 · DI3 Option B | **Textuel** · s'applique à S4 sans adaptation |
| Source obligatoire — rejet si absente | IG-I4 · LOT-P1-2.4 §3.2 · LOT-P1-2.1 §5.2 | **Textuel** |
| Date obligatoire — couche horodate ISO 8601 UTC | LOT-P1-2.4 §3.2 · LOT-P1-2.1 §5.3 | **Textuel — règle générale** |
| Contexte optionnel (RV5 > O4) | LOT-P1-2.1 §5.4 · EP-RC3 · LOT-P2-1 §14.2 | **Textuel** |
| Session optionnelle | LOT-P1-2.4 §6 · LOT-P2-1 §14.2 | **Textuel** |
| Valeur "Opérateur" pour la source | IG-I4 · DI5 · RF-R4 · LOT-P1-2.1 §5.2 | **Décision architecturale de DT-S4-5** · satisfait IG-I4 · cohérente avec DI5 et RF-R4 |
| Suggestion "date de référence" dans contexte | LOT-P1-2.1 §5.4 — autorité déléguée à la famille | **Décision propre de DT-S4-5** · non règle héritée |
| EP-S4 définie maintenant, activation future distincte | LOT-P1-2.4 §4.5 · §8 · D4 condition 1 (§5.8) | **Décision de séquençage** · LOT-P2-5 ≠ LOT d'activation opérationnelle |

---

#### Ce que DT-S4-5 ne tranche pas

- **BORNE-S4-1** — inchangée. La valeur source "Opérateur" désigne l'agent de la saisie directe — elle ne tranche pas la question de l'authorship du contenu de `valeur`. Statut : NON DÉTERMINÉ.
- **BORNE-S4-2** — inchangée. La session relie des grains déjà distincts (D2) sans définir leur frontière. Statut : NON DÉTERMINÉ.
- **Activation opérationnelle de S4** — les conditions 2 et 3 de D4 restent non satisfaites. L'activation requiert un LOT distinct de LOT-P2-5.
- **Unité exacte de session** — déléguée au périmètre d'activation, non définie par DT-S4-5.
- **Format de contexte étendu** — seule la date de référence éventuelle est suggérée par DT-S4-5. Tout enrichissement supplémentaire devra être défini dans le périmètre doctrinal compétent avant utilisation — DT-S4-5 ne lui attribue pas par avance une doctrine particulière.

---

## §6 Décisions à trancher

| ID | Question ouverte | Statut | Prérequis |
|---|---|---|---|
| DT-S4-1 | Périmètre opérationnel de RF-R4 — liste illustrative · BORNE-S4-1 enregistrée | **TRANCHÉE AVEC BORNE** · §5.5 · 2026-08-15 | Ouverture lot |
| DT-S4-2 | Quel est le grain canonique d'une trace S4 ? Une trace représente-t-elle une entrée atomique (note unique) ou peut-elle agréger plusieurs entrées d'une même session ? | **TRANCHÉE AVEC BORNE** · §5.6 · 2026-08-15 | DT-S4-1 |
| DT-S4-3 | Quelle est la structure du champ `valeur` d'une trace S4 ? Texte libre brut · objet typé · forme hybride ? | **TRANCHÉE** · §5.7 · 2026-08-15 | DT-S4-1 · DT-S4-2 |
| DT-S4-4 | Quelle est la position de S4 en Phase A ? Silence total (aucune trace produite) ou activation conditionnelle sans infrastructure externe ? Cohérence requise avec RF-RC4 et LOT-P2-1 §14.4 | **TRANCHÉE** · §5.8 · 2026-08-15 | DT-S4-1 · DT-S4-3 |
| DT-S4-5 | Quelles sont les exigences de provenance EP-S4 ? Source · date · contexte · session — différenciés ou uniformes ? Cohérence avec DI3 (différenciées) et LOT-P1-2.4 §4.5 | **TRANCHÉE** · §5.9 · 2026-08-15 | DT-S4-4 |

---

## §7 Stratégie de développement

### §7.1 Séquençage des micro-lots

LOT-P2-5 est un lot de doctrine pure. Ses micro-lots correspondent aux étapes de résolution des décisions et à la rédaction du schéma.

| Micro-lot | Mission | Décisions tranchées | Prérequis |
|---|---|---|---|
| **P2-5.A** — Ontologie S4 & frontières | Définir le périmètre de RF-R4 (DT-S4-1) · confirmer frontière S4/S5 (DT-S5-1) · confirmer frontière S4/SY1 (FB-F3) · auditer S4/SY3 si nécessaire | DT-S4-1 **TRANCHÉE** · BORNE-S4-1 enregistrée · FB-F3 confirme S4/SY3 (CL-8) | Ouverture lot |
| **P2-5.B** — Grain et structure canonique | Définir le grain de trace S4 (DT-S4-2) · définir la valeur canonique S4 (DT-S4-3) · schéma complet | DT-S4-2 **TRANCHÉE AVEC BORNE** · BORNE-S4-2 enregistrée · DT-S4-3 **TRANCHÉE** | P2-5.A VALIDÉ |
| **P2-5.C** — Périmètre Phase A & provenance | Trancher la position Phase A (DT-S4-4) · rédiger EP-S4 (DT-S4-5) | DT-S4-4 **TRANCHÉE** · DT-S4-5 **TRANCHÉE** | P2-5.B VALIDÉ |
| **P2-5.D** — Validation documentaire | Vérifier la cohérence globale · CV-1→CV-9 · DQC V2 CAS A | CV-1→CV-9 PASS · DQC V2 CAS A | P2-5.C VALIDÉ |

### §7.2 Contrainte architecturale

Ce lot produit un schéma doctrinal pur. Il ne génère aucun code, aucun module, aucune interface.

RF-R4 est figée dans la hiérarchie DI1 de LOT-P2-1 (priorité 4, après RF-S5, avant RF-R5). Ce lot précise le périmètre opérationnel de RF-R4 sans modifier son texte. Toute modification du texte figé de RF-R4 constituerait une violation des invariants de LOT-P2-1 et est interdite.

---

## §8 Critères de validation

| CV | Critère | Condition |
|---|---|---|
| CV-1 | DT-S4-1 tranchée — périmètre opérationnel de RF-R4 défini sans ambiguïté | DT-S4-1 adoptée |
| CV-2 | Frontière S4/S5 documentée — DT-S5-1 consommée sans contradiction ni réouverture | DT-S4-1 · DT-S5-1 |
| CV-3 | Frontière S4/SY1 documentée — FB-F3 consommée · cas limite SY3 audité | DT-S4-1 · FB-F3 |
| CV-4 | RF-R4 non modifiée — précision du périmètre uniquement | DT-S4-1 |
| CV-5 | Schéma canonique S4 complet — DT-S4-2 et DT-S4-3 tranchées · tous champs définis | DT-S4-2 · DT-S4-3 |
| CV-6 | Position Phase A tranchée — DT-S4-4 cohérente avec RF-RC4 et LOT-P2-1 §14.4 | DT-S4-4 |
| CV-7 | EP-S4 rédigée ou différée — DT-S4-5 cohérente avec DI3 et LOT-P1-2.4 §4.5 | DT-S4-5 |
| CV-8 | Aucune contradiction avec les invariants P2-1 — IG-I1→IG-I6 · DI1→DI5 · RF-R4 · FB-F3 | Contrôle global |
| CV-9 | DQC V2 CAS A — double revue indépendante | P2-5.D |

---

## §9 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | Micro-lots P2-5.A à P2-5.D validés (présent document complet et cohérent) |
| Condition 2 | CV-1 à CV-9 satisfaits |
| Condition 3 | DT-S4-1 à DT-S4-5 documentées, adoptées et non contradictoires entre elles |
| Condition 4 | Aucune violation des invariants LOT-P2-1 détectée |
| Condition 5 | DQC V2 CAS A |
| Condition 6 | DQC V3 PASS |
| Condition 7 | Décision opérateur explicite de clôture |

---

*P2-5.A — DT-S4-1 TRANCHÉE AVEC BORNE · BORNE-S4-1 enregistrée · frontières S4/S5 et S4/SY1 confirmées.*
*P2-5.B VALIDÉ — DT-S4-2 TRANCHÉE AVEC BORNE · Option A · grain = contribution personnelle distincte · BORNE-S4-2 enregistrée · DT-S4-3 TRANCHÉE · contenu textuel libre · sans structuration imposée.*
*P2-5.C VALIDÉ — DT-S4-4 TRANCHÉE · Option A · S4 silencieuse Phase A · décision architecturale motivée · DT-S4-5 TRANCHÉE · EP-S4 définie en anticipation de l'activation.*
*P2-5.D VALIDÉ — DQC V2 CAS A · CV-1→CV-9 PASS · deux revues indépendantes (§3.1 · orthographe) · document propre.*
