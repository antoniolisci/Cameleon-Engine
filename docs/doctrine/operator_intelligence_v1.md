# CAMÉLÉON ENGINE — OPERATOR INTELLIGENCE V1

*Document doctrinal. Version 1.0. Niveau N2.*
*Créé : 2026-06-19 · Statut : Référence active*

---

## Préambule

Ce document répond à une seule question, posée avec précision :

> **Qu'est-ce qu'un moteur peut légitimement dire d'un opérateur humain à partir de ses comportements observables ?**

Cette question n'est pas analytique. Elle est épistémique. Elle définit ce que le moteur a le droit de produire, ce qu'il doit refuser de produire, et comment il doit nommer ce qu'il produit.

Operator Intelligence V1 n'est pas un classificateur de stratégies. Ce n'est pas un profil psychologique. Ce n'est pas un système d'évaluation. C'est un moteur de description comportementale : il observe des patterns dans des données d'ordres et les restitue à l'opérateur sous une forme qui lui permet de se lire lui-même.

Ce document est une contrainte architecturale permanente. Il précède toute décision technique.

---

## I. Mission d'Operator Intelligence V1

**Rendre l'opérateur lisible à lui-même à partir de ses comportements observables.**

Cette mission se distingue explicitement de trois missions adjacentes que le moteur n'a pas :

| Ce que le moteur fait | Ce que le moteur ne fait pas |
|---|---|
| Décrit un style d'exécution observable | N'évalue pas la qualité de l'exécution |
| Identifie des patterns stables dans le temps | N'explique pas pourquoi ces patterns existent |
| Restitue une description multidimensionnelle | Ne produit pas un profil psychologique |
| Calcule des niveaux de confiance par dimension | N'assigne pas un profil unique global |
| Parle du passé observable | Ne prédit pas le comportement futur |

La mission est une extension directe du principe fondateur de Caméléon Engine : *rendre la décision lisible sans la prendre*. Operator Intelligence V1 l'applique à l'opérateur lui-même : rendre l'opérateur lisible à lui-même sans lui dire ce qu'il est.

---

## II. Ce que le moteur observe

Le moteur opère exclusivement sur des données d'ordres. Ses observations sont mécaniques et directes.

**Observables à confiance élevée :**

- **Type d'exécution** — ratio limit/market sur les ordres exécutés (FILLED)
- **Taux d'annulation** — proportion d'ordres annulés sur le total posé
- **Fragmentation des positions** — distribution des tailles d'ordres par actif
- **Concentration du capital** — répartition des montants (quote) par symbole sur la période
- **Couverture symbolique** — nombre et diversité des actifs tradés
- **Cadence d'activité** — distribution temporelle des ordres (continue / burst / périodique)
- **Pattern cancel-replace** — séquences d'annulation suivies d'un nouvel ordre sur le même actif à un prix proche

**Observables à confiance conditionnelle** (nécessitent une période ou un volume suffisant) :

- **Cohérence thématique** — concentration des actifs autour de familles sectorielles identifiées
- **Rotation du portefeuille** — vitesse d'entrée et de sortie des actifs dans l'activité
- **Directionnalité** — biais achat/vente par actif sur la période
- **Évolution de la taille moyenne** — tendance à l'augmentation, à la réduction, ou à la stabilité des montants

---

## III. Ce que le moteur n'observe pas

Ces dimensions sont structurellement hors portée d'un moteur qui lit des ordres. Les nommer explicitement est une contrainte de doctrine, pas une limite technique provisoire.

**Invisibles par nature :**

- **Les intentions** — un ordre ne révèle pas pourquoi il a été posé. Un cancel n'est pas une hésitation. Un achat n'est pas une conviction.
- **Les émotions** — un burst d'activité peut être de la peur, de l'excitation, ou une opportunité rationnellement identifiée. Le moteur ne distingue pas.
- **La discipline** — la cohérence entre intention et comportement est impossible à mesurer sans connaître l'intention.
- **La conviction** — la concentration du capital sur un actif peut signifier haute conviction ou absence de diversification connue. Ces deux réalités produisent les mêmes données.
- **La qualité des décisions** — un cancel rate élevé n'est ni bon ni mauvais. C'est un style d'exécution. Le juger serait une erreur de catégorie.
- **Le capital total** — un montant de 500 USDC par ordre est petit pour un portefeuille d'un million, grand pour un portefeuille de 2 000. Le moteur ne connaît pas le capital total.
- **Le contexte de vie** — un opérateur peu actif peut être un professionnel concentré ou un opérateur qui manque de temps. Ces deux réalités sont indiscernables.
- **La psychologie profonde** — le moteur produit des descriptions comportementales, jamais des inférences psychologiques.

---

## IV. Frontières épistémiques

Ces frontières définissent ce que le moteur peut affirmer, à quel degré de certitude, et ce qu'il doit refuser d'affirmer.

### Règle E1 — De l'observable à la description, jamais à l'explication

Le moteur observe des patterns. Il les décrit. Il ne les explique pas causalement.

*Autorisé :* "Le taux d'annulation est de 59% sur la période."
*Interdit :* "Le taux d'annulation élevé suggère une hésitation face au marché."

### Règle E2 — De la description au style, jamais au jugement

Le moteur identifie un style. Il ne l'évalue pas.

*Autorisé :* "L'exécution est orientée limit avec recherche de niveaux."
*Interdit :* "Cette approche est prudente et bien adaptée à un marché volatile."

### Règle E3 — Du pattern à la tendance, jamais à la prédiction

Le moteur décrit ce qui s'est passé. Il ne prédit pas ce qui va se passer.

*Autorisé :* "Sur les 6 derniers mois, la concentration sectorielle est stable."
*Interdit :* "Ce profil suggère que l'opérateur continuera à privilégier les actifs IA."

### Règle E4 — Du comportement au style, jamais à l'identité

Le moteur décrit comment un opérateur agit. Il ne dit pas ce qu'il est.

*Autorisé :* "L'activité se concentre sur des actifs du secteur IA et DePIN."
*Interdit :* "Vous êtes un investisseur thématique."

### Règle E5 — La confiance est explicite, jamais implicite

Chaque dimension produite par le moteur est accompagnée de son niveau de confiance. Une dimension sans niveau de confiance déclaré ne peut pas être restituée à l'opérateur.

---

## V. Principes fondateurs

**P1 — L'objet du moteur est le style opérateur, pas la stratégie.**

La stratégie est dans la tête de l'opérateur. Elle précède les ordres. Elle n'est pas dans les données. Le moteur observe des comportements récurrents — c'est le style — et ne reconstitue pas rétrospectivement une stratégie qui n'a peut-être jamais été formulée explicitement.

**P2 — La description est multidimensionnelle. La présentation est humaine.**

L'architecture interne calcule des dimensions indépendantes avec des niveaux de confiance distincts. La surface produit traduit ces dimensions en langage naturel, par dimension. Aucune étiquette de profil unique global n'est produite. Le profil unique est une compression qui détruit l'information et produit des fourre-tout du type "mixte".

**P3 — Le moteur décrit. Il ne juge pas. Il ne prescrit pas.**

Operator Intelligence V1 est un miroir, pas un coach. Il rend l'opérateur lisible à lui-même. Ce que l'opérateur fait de cette lecture appartient à la couche "Décision humaine" — hors portée du moteur par doctrine.

**P4 — Les données d'ordres sont une vue partielle.**

Un historique d'ordres Binance ne couvre pas l'ensemble de l'activité de l'opérateur. D'autres plateformes, d'autres formats, d'autres périodes peuvent exister. Le moteur décrit ce qu'il voit — pas ce qu'il ne voit pas. Il ne généralise pas au-delà de la période et de la source disponibles.

**P5 — Le volume de données conditionne la légitimité de la description.**

Une description comportementale produite sur 50 ordres n'a pas la même valeur qu'une description sur 1 000 ordres sur 12 mois. Ce seuil est une contrainte de doctrine. En dessous d'un volume minimal, le moteur peut calculer mais ne doit pas présenter ses résultats comme représentatifs.

---

## VI. Dimensions officielles

Operator Intelligence V1 organise sa lecture autour de quatre dimensions indépendantes. Chaque dimension est calculée séparément. Aucune dimension ne dépend d'une autre. Leur combinaison forme la description du style opérateur.

---

### Dimension 1 — Exécution

*Question :* Comment l'opérateur entre-t-il dans le marché ?

| État | Signal principal | Signal secondaire |
|---|---|---|
| **Patiente** | Ratio limit > 75% · cancel rate > 40% | Pattern cancel-replace présent |
| **Réactive** | Ratio market > 40% · cancel rate < 20% | Activité concentrée sur burst |
| **Mixte** | Aucun signal dominant | États alternés selon l'actif |

*Seuil de confiance minimal :* ≥ 100 ordres FILLED sur la période analysée.

---

### Dimension 2 — Capital

*Question :* Comment l'opérateur répartit-il son capital entre les actifs ?

| État | Signal principal | Signal secondaire |
|---|---|---|
| **Concentré** | ≤ 3 actifs représentant > 70% du volume quote | Stabilité des actifs dominants dans le temps |
| **Diversifié** | > 6 actifs avec répartition relativement homogène | Faible turnover symbolique |
| **Rotatif** | Montants stables · actifs changeants | Durée médiane de présence par actif < 60 jours |

*Seuil de confiance minimal :* ≥ 6 mois de données · ≥ 5 actifs distincts.

---

### Dimension 3 — Portefeuille

*Question :* Comment l'opérateur choisit-il ses actifs ?

| État | Signal principal | Signal secondaire |
|---|---|---|
| **Thématique** | ≥ 70% des montants dans 1-2 clusters sectoriels identifiés | Stabilité sectorielle sur la durée |
| **Opportuniste** | Forte rotation symbolique · faible cohérence sectorielle | Bursts d'activité sur des actifs non récurrents |
| **Multi-actifs sans thème** | Présence large · cohérence sectorielle faible | Aucun cluster dominant |

*Dépendance :* cette dimension requiert une table de correspondance symbole → secteur maintenue manuellement. En l'absence de cette table, la dimension Portefeuille ne peut pas être calculée.

*Seuil de confiance minimal :* ≥ 5 actifs distincts · table de correspondance couvrant ≥ 80% des actifs présents.

---

### Dimension 4 — Cadence

*Question :* Quand l'opérateur est-il actif ?

| État | Signal principal | Signal secondaire |
|---|---|---|
| **Continue** | Distribution temporelle homogène · faible variance inter-ordre | Activité régulière quelle que soit la volatilité |
| **Burst** | 80% des ordres concentrés dans 20% des sessions · variance inter-ordre élevée | Long silence entre les pics |
| **Périodique** | Régularité calendaire détectable (semaine, mois) | Indépendance partielle vis-à-vis de la volatilité |

*Seuil de confiance minimal :* ≥ 3 mois de données · timestamps disponibles à la résolution journalière.

---

## VII. Niveaux de confiance

Chaque dimension est accompagnée d'un niveau de confiance explicite. Ce niveau est calculé à partir du volume de données, de la cohérence du signal, et de la durée de la période analysée.

| Niveau | Signification | Condition de production |
|---|---|---|
| **Élevé** | Le signal est stable et cohérent sur la période | Volume suffisant · signal homogène sur ≥ 2 sous-périodes |
| **Moyen** | Le signal est présent mais peut être amplifié par la période | Volume suffisant · signal présent sur 1 seule sous-période ou volatil |
| **Faible** | Le signal est détecté mais peu représentatif | Volume insuffisant · ou période trop courte |
| **Indisponible** | La dimension ne peut pas être calculée | Données manquantes · ou table de correspondance absente (Dim. 3) |

**Règle de seuil absolu :** une dimension à confiance Faible peut être calculée en interne mais ne doit pas être présentée à l'opérateur comme une caractéristique de son style. Elle peut apparaître avec la mention explicite que les données sont insuffisantes.

---

## VIII. Règles linguistiques

Ces règles gouvernent tout texte produit par Operator Intelligence V1 à destination de l'opérateur. Elles sont complémentaires au Language System V1 et à la doctrine Lecture ≠ Action.

### Règle L1 — Décrire, ne pas qualifier

*Autorisé :* "L'exécution est orientée limit avec un taux d'annulation de 59%."
*Interdit :* "L'exécution est prudente et réfléchie."

Les adjectifs évaluatifs (prudent, réfléchi, agressif, discipliné) appartiennent au jugement. Ils sont interdits.

### Règle L2 — Le passé observable, pas le futur inféré

*Autorisé :* "Sur les 6 derniers mois, l'activité s'est concentrée sur des actifs du secteur IA."
*Interdit :* "Vous semblez avoir une préférence durable pour le secteur IA."

### Règle L3 — La dimension, pas l'identité

*Autorisé :* "La dimension Exécution indique un style patient."
*Interdit :* "Vous êtes un opérateur patient."

La formulation "vous êtes" assigne une identité. La formulation "la dimension indique" décrit un signal observable.

### Règle L4 — La confiance est nommée explicitement

*Autorisé :* "Dimension Capital : concentré (confiance moyenne — 4 mois de données)."
*Interdit :* "Votre capital est concentré sur BTC et ETH."

L'absence de niveau de confiance dans la restitution est une violation de doctrine.

### Règle L5 — Aucun impératif, aucune recommandation

*Autorisé :* "Le taux d'annulation est élevé par rapport au volume d'ordres exécutés."
*Interdit :* "Réduire le nombre d'annulations améliorerait l'efficacité d'exécution."

La recommandation appartient à la couche de décision humaine. Le moteur ne la franchit pas.

### Règle L6 — La source est déclarée

Toute description produite par Operator Intelligence V1 doit indiquer la source des données (format, période, volume d'ordres) sur laquelle elle repose. Une description sans source est une description sans ancrage.

---

## IX. Relation avec Mémoire Opérateur

La Mémoire Opérateur (`cameleon_behavior_memory_v1`) est la couche de persistance longitudinale. Operator Intelligence V1 est la couche d'analyse ponctuelle.

**La relation est unidirectionnelle :**
Operator Intelligence V1 produit des descriptions à partir d'un import. La Mémoire Opérateur accumule ces descriptions session après session. La Mémoire ne réécrit pas l'analyse — elle l'agrège.

**Ce que la Mémoire peut faire avec les résultats d'Operator Intelligence V1 :**
- Retenir le style observé session après session
- Comparer les dimensions entre sessions (évolution, stabilité)
- Signaler une divergence entre le style habituel et le style de la session courante

**Ce que la Mémoire ne peut pas faire :**
- Fusionner les résultats d'Operator Intelligence avec la lecture du moteur décisionnel
- Produire un verdict global "comportement amélioré / dégradé" basé sur le style opérateur
- Remplacer une description à faible confiance par une description mémorisée à confiance élevée

La Mémoire hérite des règles linguistiques d'Operator Intelligence V1. Un résultat mémorisé ne peut pas être restitué avec plus d'autorité que lors de sa production initiale.

---

## X. Relation avec Trade History

Trade History contient les ordres exécutés avec leur résultat (fills, fees). C'est la source primaire de l'analyse comportementale de Caméléon Engine depuis V4.

**Ce que Trade History apporte à Operator Intelligence V1 :**
- L'exécution réelle (fills confirmés)
- Le timing précis des exécutions
- Les montants réels tradés
- La base des patterns comportementaux (overtrading, rapid_reentry, etc.)

**Limite structurelle :**
Trade History ne contient pas les ordres non exécutés. Il ne révèle pas la patience d'entrée — seulement le résultat des entrées. Un opérateur qui annule 60% de ses ordres avant exécution est invisible dans Trade History.

Pour cette raison, Trade History alimente le scoring comportemental existant (Discipliné / Réactif / Impulsif / Agressif) mais ne suffit pas à calculer les dimensions Exécution et Capital avec un niveau de confiance élevé.

---

## XI. Relation avec Order History

Order History contient l'ensemble des ordres posés, exécutés ou non. C'est la source principale d'Operator Intelligence V1.

**Ce que Order History apporte :**
- La vision complète de l'exécution (cancel rate réel, pattern cancel-replace)
- La fragmentation intentionnelle (ordres posés mais non exécutés révèlent la logique de placement)
- La distribution de prix visée (zones de niveaux recherchés)
- La concentration symbolique sur la totalité de l'activité

**Relation avec Trade History :**
Order History révèle l'intention de placement. Trade History révèle le résultat. Ces deux sources sont complémentaires et non substituables. Une analyse complète du style opérateur requiert les deux.

En V1, Operator Intelligence opère sur Order History seul lorsque Trade History n't est pas disponible, avec déclaration explicite de cette limite dans la restitution.

**Contrainte architecturale :**
Order History contextualise — il n'écrase pas. Si Trade History a produit un scoring comportemental, Order History ne le remplace pas. Il l'enrichit via le pont `orderStrategyProfile` (ADR-010 · unidirectionnel défensif).

---

## XII. Relation avec le scoring comportemental

Le scoring comportemental existant (`behavior/analytics/scoring.js`) produit un score 0-100 et un profil parmi : Discipliné / Réactif / Impulsif / Agressif. Il opère sur Trade History.

**Operator Intelligence V1 et le scoring comportemental sont deux systèmes distincts.**

| Scoring comportemental | Operator Intelligence V1 |
|---|---|
| Source : Trade History (fills) | Source : Order History (intentions) |
| Mesure : comportement de trading en session | Mesure : style opérateur sur la durée |
| Produit : score 0-100 + profil 4 labels | Produit : 4 dimensions + niveaux de confiance |
| Fenêtre : court terme (session à quelques semaines) | Fenêtre : moyen terme (mois) |
| Orientation : décision en cours de session | Orientation : compréhension de soi entre sessions |

Ces deux systèmes ne se substituent pas. Ils se lisent en parallèle. Un opérateur peut être "Réactif" sur le scoring comportemental (Trade History : entrées rapides) et "Patient" sur la dimension Exécution d'Operator Intelligence V1 (Order History : cancel rate élevé, recherche de niveaux). Ces deux lectures sont cohérentes — elles décrivent des couches différentes du comportement.

**Règle de non-fusion :** aucune synthèse globale ne doit jamais fusionner le score comportemental et les dimensions d'Operator Intelligence en un seul verdict. Ces deux lectures ont des fenêtres, des sources et des objets différents.

---

## XIII. Anti-dérives à long terme

Ces dérives sont documentées ici parce qu'elles sont prévisibles. Elles surviennent naturellement dans l'évolution d'un moteur de description comportementale. Leur prévention est une contrainte de doctrine, pas une vigilance ponctuelle.

### Dérive A — La classification rampante

*Description :* le moteur commence à produire des étiquettes de profil unique global ("Investisseur thématique", "Accumulateur", etc.) pour simplifier la restitution.

*Pourquoi c'est une dérive :* un profil unique est une compression qui détruit l'information et force les cas atypiques dans des cases inadaptées. La validation terrain de cette doctrine en est la preuve directe : un historique d'ordres multi-actifs thématiques avec cancel rate élevé et 9 actifs AI/DePIN/RWA produit "mixte" — techniquement correct, humainement nul.

*Règle de protection :* aucun profil unique global ne peut être produit. Les dimensions sont restituées séparément. Une synthèse narrative est autorisée si elle traduit les dimensions en langage naturel sans les fusionner en étiquette.

### Dérive B — Le glissement vers le conseil

*Description :* le moteur commence à produire des recommandations déguisées en observations ("Un cancel rate de 59% peut indiquer une opportunité d'amélioration de la précision d'entrée").

*Pourquoi c'est une dérive :* le moteur décrit. Il ne prescrit pas. Cette frontière est la même que dans le moteur décisionnel (Lecture ≠ Action). Elle s'applique ici avec une contrainte supplémentaire : parler à l'opérateur de lui-même crée un risque de prescription personnalisée encore plus direct.

*Règle de protection :* toute phrase qui, lue par un opérateur, pourrait déclencher une action de modification de son comportement est une phrase prescriptive. Elle est interdite.

### Dérive C — L'expansion du périmètre des sources

*Description :* le moteur commence à intégrer des inférences sur des données non disponibles ("Au vu de votre profil, votre activité sur d'autres plateformes suit probablement le même pattern").

*Pourquoi c'est une dérive :* le moteur ne peut décrire que ce qu'il observe. L'extrapolation à des sources non disponibles est une violation de la frontière épistémique.

*Règle de protection :* toute description est ancrée à une source explicite et une période déclarée. Hors de cet ancrage, le moteur ne parle pas.

### Dérive D — L'autorité excessive du style mémorisé

*Description :* après plusieurs sessions, le style mémorisé devient une vérité acquise. Le moteur présente des descriptions issues de la mémoire avec la même autorité que des descriptions fraîchement calculées.

*Pourquoi c'est une dérive :* le style opérateur peut changer. Une mémoire de 6 mois ne décrit pas nécessairement l'opérateur aujourd'hui. La date et la période source de chaque description doivent être préservées et restituées.

*Règle de protection :* un résultat mémorisé doit indiquer sa date de production. Sa niveau de confiance ne peut pas être supérieur à celui de la description initiale. Il ne peut pas être présenté sans sa date.

### Dérive E — La fusion avec le moteur décisionnel

*Description :* Operator Intelligence V1 commence à alimenter le pipeline décisionnel (`buildPayload()`), produisant des verdicts comme "votre style Exécution patiente est cohérent avec l'attente du signal en cours".

*Pourquoi c'est une dérive :* Operator Intelligence V1 opère sur le temps long (historique). Le moteur décisionnel opère sur l'instant (session courante). La fusion de ces deux horizons crée une confusion entre la description d'un style passé et l'autorisation d'une action présente.

*Règle de protection :* Operator Intelligence V1 n'alimente jamais `buildPayload()`. Il ne produit jamais d'input pour le moteur décisionnel. Il est une couche de lecture parallèle, non intégrée au pipeline principal.

---

## XIV. Doctrine finale

Trois propositions condensent l'ensemble de ce document. Elles s'appliquent sans exception.

---

**PROPOSITION 1 — Operator Intelligence V1 décrit un style. Il ne classe pas une stratégie.**

Un style est un pattern comportemental observable. Une stratégie est une intention. Le moteur a accès au premier. Il n'a pas accès à la seconde. Cette distinction n'est pas une limite à surmonter — c'est le périmètre légitime du moteur.

---

**PROPOSITION 2 — La précision est multidimensionnelle. La communication est humaine.**

Produire une étiquette unique est plus simple. C'est aussi moins vrai. Operator Intelligence V1 calcule des dimensions indépendantes avec des niveaux de confiance distincts, et les traduit en langage naturel par dimension. La complexité reste interne. La restitution reste lisible. Ces deux exigences ne s'annulent pas — elles définissent la qualité du moteur.

---

**PROPOSITION 3 — Caméléon Engine ne dit pas à l'opérateur ce qu'il est. Il lui montre comment il agit.**

"Vous êtes un investisseur thématique" est une identité assignée. "Votre activité sur les 6 derniers mois s'est concentrée à 78% sur des actifs AI et DePIN, avec un style d'exécution patient (cancel rate 59%, ratio limit 94%)" est une description observable. La première ferme la réflexion. La seconde l'ouvre.

Caméléon Engine est un miroir. Operator Intelligence V1 en est la couche la plus profonde.

---

*Document fondateur. Version 1.0.*
*Référence croisée : `docs/doctrine/lecture_not_equal_action.md` · `docs/doctrine/memory_doctrine_v1.md` · `docs/doctrine/cameleon_engine_language_system_v1.md`*
*ADR associée : ADR-010 (bridge Order History → Trade History · unidirectionnel défensif)*
*Chemin : `docs/doctrine/operator_intelligence_v1.md`*
