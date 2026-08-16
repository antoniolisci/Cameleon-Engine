# LOT-P2-6 — Schéma canonique S3 · Famille Visuelle V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-6 |
| Intitulé | Schéma canonique S3 · Famille Visuelle V1 |
| Programme | P2 — Doctrine des Sources & Schémas d'Ingestion |
| Phase Roadmap V1 | A |
| Type | Doctrine — Schéma canonique |
| Document officiel | `docs/lots/LOT-P2-6_SCHEMA_S3_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-08-16 |
| Date de clôture | — |
| Prérequis | LOT-P2-1 CLOS · LOT-P2-5 CLOS |

---

## §1 Mission

LOT-P2-6 définit le **schéma canonique de la trace S3 Visuelle** : la structure, la sémantique, les règles de classification et les exigences de provenance pour les données issues de l'analyse de supports visuels par le module d'analyse visuelle de Caméléon Engine.

Ce lot produit un document de doctrine pure — aucun code, aucune implémentation. Il répond à trois questions indissociables :

1. **Qu'est-ce qu'une donnée S3 ?** — définition ontologique de la famille Visuelle, distincte de S1 (Transactionnelle) selon FB-F2 et de toute autre famille selon les règles de priorité de DI1.
2. **Comment une trace S3 est-elle structurée ?** — schéma canonique : champs obligatoires, types, valeurs, contraintes, résultat de l'analyse visuelle.
3. **Comment S3 s'intègre-t-elle dans la doctrine d'ingestion V1 ?** — règle RF-R3 figée à priorité 3 dans la hiérarchie DI1, exigences de provenance EP-S3, position Phase A.

LOT-P2-6 constitue le cinquième schéma source du Programme P2, après S1 (LOT-P2-2), S2 (LOT-P2-3), S5 (LOT-P2-4) et S4 (LOT-P2-5). La règle de classification RF-R3 est figée depuis LOT-P2-1 — ce lot ne la modifie pas. Il définit la structure interne de la trace S3, précise le périmètre opérationnel de RF-R3, et documente les conditions d'activation de S3.

LOT-P2-6 est explicitement identifié comme le lot schéma S3 dans LOT-P2-4. Il est distinct de tout LOT d'activation opérationnelle de S3.

---

## §2 Sources doctrinales

| Document | Rôle dans ce lot |
|---|---|
| LOT-P2-1 — Doctrine d'ingestion V1 | Source d'autorité pour RF · FB · EP · CL · DI1→DI5 — aucune de ces règles ne peut être modifiée |
| LOT-P1-2.1 — Modèle canonique de trace V1 | Structure des 6 champs de toute trace : famille · source · date · valeur · contexte optionnel · session optionnelle |
| LOT-P1-2.4 — Doctrine de provenance V1 | Règles de provenance — EP-S3 différées à activation (§4.5) selon CL-P4 |
| LOT-P2-5 — Schéma canonique S4 V1 | Précédent de schéma doctrinal pur · pattern DT-S4-1→DT-S4-5 · traitement des bornes · précédent DT-S4-5 (EP définie en anticipation) |
| LOT-P2-4 — Schéma canonique S5 V1 | Précédent de décision Phase A (DT-S5-4 amendée / Position Gamma) · LOT-P2-6 explicitement nommé · DI1 amendé (RF-S5 à priorité 3.5) |
| GPD V1 §8.4 | Doctrine de la Mémoire Visuelle — absence identifiée comme blanc documentaire B3 · prérequis d'activation S3 · risque architectural I-01 |
| Architecture Conceptuelle Fondatrice V1 | Registre officiel des 13 familles — S3 = Visuelle |
| Roadmap V1 §4 P2 | Livrable L5 : Schéma canonique S3 (Visuelle — captures d'écran via GPT Vision) |
| Language System V1 | Contrôle du vocabulaire introduit par ce lot |

---

## §3 Périmètre

### §3.1 Inclus

- Définition ontologique de la famille S3 Visuelle (ce qu'elle est, ce qu'elle n'est pas)
- Frontière S3/S1 — consommation de FB-F2 (figée · LOT-P2-1 §13) et de CL-A5 (fondateur) comme fondement normatif
- Frontière S3/S2 — audit de la priorité RF-R3 (3) sur RF-R5 (5) dans le contexte des captures patrimoniales · mécanisme de dérivation éventuel
- Frontière S3/S5 — audit de la priorité RF-R3 (3) sur RF-S5 (3.5) dans le contexte des captures contextuelles · mécanisme de dérivation éventuel
- Précision du périmètre opérationnel de RF-R3 — sans modification de son texte figé (DT-S3-1)
- Grain canonique d'une trace S3 (DT-S3-2)
- Structure du champ `valeur` d'une trace S3 (DT-S3-3)
- Position Phase A de S3 (DT-S3-4)
- Exigences de provenance EP-S3 — mode anticipation ou différée (DT-S3-5)
- Documentation de la question ouverte structurelle I-01 sans décision d'infrastructure

### §3.2 Exclus

- Implémentation technique du module d'analyse visuelle (périmètre Programme P3)
- Rédaction de la Doctrine de la Mémoire Visuelle (GPD V1 §8.4 — condition d'activation future, non condition de schéma)
- Décision d'infrastructure vision (cloud GPT Vision vs local-first) — décision de niveau Architecture/Roadmap, non de niveau schéma
- Normalisation inter-familles (périmètre LOT-P2-7)
- Doctrine des Corrélations (périmètre LOT-P2-8)
- Schéma S4 Personnelle (périmètre LOT-P2-5 — CLOS)
- Schéma S2 Patrimoniale (périmètre LOT-P2-3 — CLOS)
- Forces Constellium (DT-FORCES-01 — instruit, non décidé — exclusion provisoire : nature familiale indéterminée)
- Toute modification des règles DI1→DI5 figées dans LOT-P2-1
- Toute modification du texte figé de RF-R3, DI5, FB-F2 ou CL-A5

---

## §4 Invariants hérités — non négociables

Ces règles sont figées par les lots antérieurs. LOT-P2-6 ne peut pas les modifier.

### §4.1 Invariants LOT-P2-1 directement contraignants pour S3

| Invariant | Source | Règle |
|---|---|---|
| IG-I1 | LOT-P2-1 §6 | Toute trace S3 est conforme au modèle canonique LOT-P1-2.1 (6 champs) |
| IG-I2 | LOT-P2-1 §6 | Une donnée appartient à une et une seule famille — S3 exclut toute appartenance simultanée à S1, S2 ou S5 |
| IG-I3 | LOT-P2-1 §6 | La classification est déterministe — RF-R3 produit un résultat unique pour tout input qualifiant |
| IG-I4 | LOT-P2-1 §6 | Toute trace S3 a une source identifiable conforme à LOT-P1-2.4 |
| IG-I5 | LOT-P2-1 §6 | Aucune corrélation à l'ingestion — une trace S3 ne fusionne pas avec d'autres familles |
| IG-I6 | LOT-P2-1 §6 | Silence structurel — une donnée non classifiable comme S3 n'est pas forcée dans cette famille |
| DI1 | LOT-P2-1 §5 · amendé LOT-P2-4 | Hiérarchie séquentielle : RF-R1 · RF-R2 · **RF-R3** · RF-S5 · RF-R4 · RF-R5 · RF-R6 — RF-R3 occupe la priorité 3, avant RF-S5 (3.5) et RF-R4 (4) |
| DI5 | LOT-P2-1 §5 | **Figé** : S3 = toute donnée issue d'un support visuel analysé — la forme de la source prime sur le contenu extrait |
| RF-R3 | LOT-P2-1 §12 | **Figée** : "Une donnée provient d'une source visuelle si son origine primaire est une image, une capture d'écran ou tout support graphique traité par un module d'analyse visuelle. Résultat : S3 — Visuelle, indépendamment du contenu extrait." |
| FB-F2 | LOT-P2-1 §13 | **Figée** : S3/S1 — RF-R3 (priorité 3) précède RF-R5 (priorité 5) · CL-A5 fondateur : capture d'écran de relevé de trading analysée → S3, non S1 |
| CL-A5 | LOT-P2-1 §11 | **Fondateur** : capture d'écran de relevé de trading analysée → S3, non S1 — cas de référence de la frontière S3/S1 |
| CL-P4 | LOT-P2-1 §14 | S3 inactive Phase A — aucune ingestion — EP-S3 différées à activation |

### §4.2 Position de RF-R3 dans DI1 — portée sur ce lot

**Note préalable :** DI1 détermine la priorité d'évaluation des règles après déclenchement de RF-R3 — il ne tranche pas les conditions de déclenchement elles-mêmes. Ces conditions (notamment la condition "traité par un module d'analyse visuelle") restent à définir par DT-S3-1. Les observations ci-dessous valent uniquement si RF-R3 produit un résultat pour le support considéré.

**Frontière S3/S5 (conditionnelle) :** si RF-R3 produit un résultat pour un support visuel, DI1 garantit que RF-S5 (priorité 3.5) n'est pas évaluée. Le contenu contextuel visible dans ce support n'atteint pas RF-S5. DT-S3-1 détermine les conditions dans lesquelles RF-R3 se déclenche.

**Frontière S3/S4 (conditionnelle) :** si RF-R3 produit un résultat, RF-R4 (priorité 4) n'est pas évaluée. Aucune frontière directe S3/S4 à définir dans ce lot sous cette condition. DT-S3-1 détermine les conditions de déclenchement.

**Frontière S3/S2 (conditionnelle) :** si RF-R3 produit un résultat, RF-R5 (priorité 5) n'est pas évaluée. Une capture d'écran patrimoniale atteint S3 si RF-R3 se déclenche — FB-F2 et CL-A5 figent ce résultat une fois RF-R3 déclenchée. DT-S3-1 détermine les conditions de déclenchement.

### §4.3 Memory Doctrine V1 et Pattern Reflection Doctrine V1 — portée sur ce lot

Ces doctrines produisent des contraintes sur les **couches d'usage et d'affichage futures** de S3. Elles ne définissent pas la structure canonique de S3 et ne contraignent pas le schéma produit par ce lot.

En particulier : interdiction de fusion inter-sources (IG-I5 · Pattern Reflection Doctrine V1) et interdictions de prescription, prédiction, explication causale à partir de données S3 (Memory Doctrine V1 §IV) s'appliqueront aux couches d'exploitation lors de l'activation.

---

## §5 Tensions à instruire

### §5.1 État de la question à l'ouverture

LOT-P2-1 a figé RF-R3, FB-F2, CL-A5 et CL-P4, mais n'a pas défini la structure interne d'une trace S3 ni le périmètre exact du terme "support graphique traité par un module d'analyse visuelle". Ce lot doit définir S3 par sa propre ontologie, complémentaire à RF-R3.

**Ce que les lots précédents ont figé :**

- RF-R3 : source visuelle → S3, indépendamment du contenu extrait (LOT-P2-1 §12)
- DI5 : la forme de la source prime sur le contenu extrait — la classification ne dépend pas de ce que l'analyse visuelle produit (LOT-P2-1 §5)
- FB-F2 : S3/S1 → RF-R3 (p3) > RF-R5 (p5) · CL-A5 fondateur (LOT-P2-1 §13)
- CL-P4 : S3 inactive Phase A — aucune ingestion, EP-S3 différées à activation (LOT-P2-1 §14)
- DI1 : RF-R3 en position 3, avant RF-S5 (3.5) et RF-R4 (4) — amendé par LOT-P2-4

**Ce que les lots précédents n'ont pas tranché :**

- La condition "traité par un module d'analyse visuelle" dans RF-R3 : condition infrastructurelle d'activation ou description ontologique du classifieur ?
- La liste des types de supports visuels : exhaustive (image · capture d'écran · support graphique) ou illustrative ?
- La structure interne du champ `valeur` d'une trace S3 : résultat brut de l'analyse, objet structuré, ou enveloppe déléguant le format au module ?
- Le grain d'une trace S3 : une trace par image analysée, ou une trace par datum extrait ?
- La position Phase A de S3 : nature exacte du silence (CL-P4 déclare l'inactivité sans préciser la forme du silence)
- Les exigences EP-S3 : différées à activation (CL-P4) ou définies en anticipation (modèle DT-S4-5 de LOT-P2-5)

### §5.2 Tension principale — Périmètre de RF-R3 (DT-S3-1)

RF-R3 cite trois types de supports : image · capture d'écran · support graphique. La formulation "traité par un module d'analyse visuelle" introduit une ambiguïté structurelle. Ce lot doit trancher :

| Axe | Question ouverte |
|---|---|
| Condition "traité par un module" | RF-R3 stipule "traité par un module d'analyse visuelle". Est-ce une condition d'activation du classifieur S3 (le module doit exister et avoir traité l'image) ou une description du contexte attendu (l'image est destinée à un tel traitement) ? Si condition stricte : aucune trace S3 possible sans module opérationnel. Si description ontologique : le périmètre de RF-R3 est indépendant de l'infrastructure. |
| Liste exhaustive ou illustrative | Les trois formes nommées (image · capture d'écran · support graphique) sont-elles exhaustives ou illustratives ? Un document scanné ou une visualisation générée constituent-ils des supports S3 ? |
| Résultat nul d'analyse | Une image soumise à analyse mais dont l'analyse ne produit aucun contenu exploitable qualifie-t-elle comme source S3 ? RF-R3 dit "indépendamment du contenu extrait" — un résultat vide est-il une trace S3 valide ? |
| Ontologie vs. infrastructure | DT-S3-1 doit trancher si le périmètre ontologique de RF-R3 est indépendant de l'infrastructure d'analyse ou conditionné par son existence opérationnelle. Cette distinction impacte directement DT-S3-4 (Phase A) et I-01. |

### §5.3 Tensions secondaires

**Grain (DT-S3-2) :** S3 pose une question de grain inédite dans le Programme P2. Pour S1, S2, S4, S5, le grain est naturellement défini par l'objet source (transaction, position, contribution personnelle, état ou événement contextuel). Pour S3, la source est le support visuel — mais l'analyse peut produire plusieurs éléments indépendants depuis un seul support. Une capture d'écran d'un relevé de trading peut contenir dix lignes de positions. DT-S3-2 doit trancher : une trace par image analysée (grain image), ou une trace par datum extrait de l'image (grain datum).

**Valeur (DT-S3-3) :** La structure du champ `valeur` d'une trace S3 est structurellement différente des familles précédentes. Pour S1/S2, la valeur est un ensemble de champs numériques structurés. Pour S4, la valeur est un texte libre préservant la voix de l'opérateur. Pour S5, la valeur est `{nature, type, ref, description?}`. Pour S3, la valeur est **le résultat d'une analyse visuelle** — dont la forme dépend du module d'analyse et de la décision de grain. DT-S3-3 doit trancher si la valeur est la représentation brute extraite, une structure normalisée définie par ce lot, ou une enveloppe déléguant le format au module d'activation (comme DT-S4-5 a délégué l'unité de session au périmètre d'activation).

**Frontières par dérivation (DT-S3-1) :** Les données extraites d'une capture S3 peuvent contenir des informations patrimoniales (S2) ou contextuelles (S5). Par DI5 et DI1, la capture elle-même est classifiée S3 si RF-R3 se déclenche. Mais les données extraites peuvent-elles alimenter des traces S2 ou S5 distinctes via un mécanisme de dérivation secondaire ? Ce mécanisme éventuel doit être audité en P2-6.A sans modifier RF-R3, DI5 ni DI1.

### §5.4 Question ouverte structurelle — I-01 : Infrastructure d'analyse visuelle

LOT-P2-6 est un lot de schéma doctrinal pur. Il ne décide pas de l'infrastructure. Cependant, I-01 affecte les conditions d'activation de S3 et doit être documenté comme élément de contexte structurel.

**I-01 — Conflit architectural :** GPD V1 §8.4 identifie la nécessité d'une Doctrine de la Mémoire Visuelle (blanc documentaire B3). Cette doctrine devra trancher :

- **Option cloud** : GPT Vision (OpenAI) — analyse de haute qualité, mais dépendance à un service externe, transfert de données hors périmètre local-first, questions de consentement et de confidentialité des captures d'écran opérateur
- **Option local-first** : module d'analyse visuelle local — conforme à l'architecture local-first de Caméléon Engine, mais qualité et disponibilité d'un tel module non établies à ce jour

Ce conflit n'est pas tranché par LOT-P2-6. Il est signalé comme condition nécessaire à l'activation future de S3, dont la résolution relève de la Doctrine de la Mémoire Visuelle — non encore rédigée, périmètre GPD V1 §8.4.

**Impact sur ce lot :** DT-S3-4 (position Phase A) et DT-S3-5 (EP-S3) doivent tenir compte de l'existence de I-01 sans le résoudre. Les décisions produites dans ce lot ne doivent pas contraindre l'une ou l'autre option d'infrastructure.

### §5.5 Exclusion provisoire — DT-FORCES-01

Les forces Constellium (Feu · Air · Terre · Eau · Éther) font l'objet de DT-FORCES-01 — instruit, non décidé, Q-1→Q-5 ouvertes. Leur nature familiale est indéterminée. Elles sont exclues provisoirement du périmètre de ce lot — même pattern que LOT-P2-4 §5.8 et LOT-P2-5 §5.4. Aucune décision produite dans ce lot ne les concerne.

### §5.6 DT-S3-1 — Périmètre opérationnel de RF-R3 · TRANCHÉE AVEC BORNE · 2026-08-16

**Question :** Périmètre opérationnel de RF-R3 — condition "traité par un module d'analyse visuelle" · liste illustrative ou fermée · frontières S3/S1, S3/S2, S3/S5 · mécanisme de dérivation.

**Statut :** TRANCHÉE AVEC BORNE — 2026-08-16

#### D1a — Condition ontologique

Le syntagme "traité par un module d'analyse visuelle" est une **condition ontologique** portant sur l'origine du datum : une donnée est S3 si et seulement si elle a été produite par l'analyse d'un support visuel par un module d'analyse visuelle. Cette condition qualifie le datum — elle est infrastructure-neutre. Tout datum produit par l'analyse d'un support visuel par un module satisfaisant ce critère fonctionnel est classifié S3, quelle que soit la nature technique de ce module. L'inactivité de S3 en Phase A (CL-P4) résulte de l'absence de module activé, non d'une inapplicabilité de RF-R3.

**Nature de D1a — décision architecturale motivée :**
La formulation ontologique retenue par D1a est une décision de DT-S3-1 construite à partir de la convergence de RF-R3, DI5 et CL-P4. Aucun de ces textes ne formule littéralement à lui seul l'équivalence complète retenue par D1a. D1a précise donc le sens opérationnel du corpus sans modifier le texte figé de RF-R3. Elle ne doit pas être citée ultérieurement comme une exigence textuelle directement énoncée par RF-R3.

#### D1b — Liste illustrative

Les trois formes citées par RF-R3 (image · capture d'écran · tout support graphique) constituent une **liste illustrative et non fermée**. La condition discriminante est l'origine visuelle primaire combinée au traitement par analyse visuelle. "Tout support graphique" est textuellement un quantificateur universel, non un troisième item d'une liste close.

#### D1c — Frontières conditionnelles

Les frontières suivantes sont conditionnelles au déclenchement de RF-R3. Elles décrivent le résultat du mécanisme DI1 lorsque RF-R3 produit un résultat — elles ne définissent pas la mise en œuvre technique de la condition ontologique établie par D1a, qui sera déterminée dans le périmètre d'activation.

**Frontière S3/S1 :** RF-R3 (priorité 3) précède RF-R5 (priorité 5). Si RF-R3 produit un résultat pour le datum considéré, RF-R5 — qui produit S1 pour un événement transactionnel via DI4 — n'est pas évaluée pour ce même datum ; celui-ci n'est donc pas simultanément classifié S1 par RF-R5. **Fondement :** FB-F2 (LOT-P2-1 §13.3) · CL-A5 (LOT-P2-1 §11.1).

**Frontière S3/S2 :** RF-R3 (priorité 3) précède RF-R5 (priorité 5). RF-R5 couvre également S2 pour un état de composition patrimoniale via DI4. Si RF-R3 produit un résultat pour le datum considéré, RF-R5 n'est pas évaluée pour ce même datum ; celui-ci n'est donc pas simultanément classifié S2 par RF-R5. **Fondement :** DI1 hiérarchie (LOT-P2-1 §12.2). Aucun FB nommé pour la frontière S3/S2 — la hiérarchie DI1 suffit.

**Frontière S3/S5 :** RF-R3 (priorité 3) précède RF-S5 (priorité 3.5). Si RF-R3 produit un résultat pour le datum considéré, RF-S5 n'est pas évaluée pour ce même datum. **Fondement :** DI1 amendé par LOT-P2-4 · DT-S5-2.

#### D1d — Portée exacte de "indépendamment du contenu extrait"

La clause "indépendamment du contenu extrait" gouverne le critère de classification lorsqu'un datum a été produit depuis une source visuelle analysée : la **nature** du contenu n'affecte pas la famille S3. Elle ne se prononce pas sur le cas où l'analyse ne produit aucun contenu. La question de l'existence d'un datum S3 en l'absence de contenu extrait est non résolue par RF-R3 seul — elle dépend de DT-S3-2 et DT-S3-3. DT-S3-1 ne tranche pas ce cas.

#### BORNE-S3-1 — Dérivation secondaire · NON DÉTERMINÉ

La doctrine actuelle (IG-I2 · IG-I5 · EP-RC1) ne définit pas si la sortie extraite ou transformée par le module d'analyse visuelle depuis un support S3 constitue : (a) la même donnée que la trace S3, (b) une représentation de cette donnée, (c) un nouveau datum canonique susceptible d'une classification indépendante par DI1. En l'absence de cette définition, IG-I2 (unicité de famille par datum) ne suffit ni à autoriser ni à interdire une classification secondaire de cet output en S2 ou S5 — la règle s'applique à un datum dont la nature est déterminée, non à un objet dont le statut canonique est indéfini. IG-I5 et EP-RC1 ne suffisent pas davantage à résoudre cette question : leur portée ne définit pas le statut canonique d'une éventuelle sortie extraite ou transformée au regard des trois possibilités (a), (b) et (c). Cette indétermination est enregistrée. Son traitement sera déterminé dans le périmètre compétent.

### §5.7 DT-S3-2 — Grain canonique d'une trace S3 · TRANCHÉE AVEC BORNE · 2026-08-16

**Question :** Quel est le grain canonique d'une trace S3 ? Une trace par image analysée (grain image = support visuel) ou une trace par datum extrait de l'image (grain datum = élément d'analyse) ?

**Statut :** TRANCHÉE AVEC BORNE — 2026-08-16

#### D2a — Grain canonique (décision architecturale motivée)

Le grain canonique d'une trace S3 est le **support visuel** : le support visuel constitue l'unité canonique d'une trace S3, indépendamment du nombre d'éléments contenus dans ce support ou détectés par l'analyse. Cette décision est fondée sur DI5 (LOT-P2-1 §5) dont la formulation — "la valeur mémorielle est la capture elle-même, pas les données extraites" — identifie le support comme l'objet canonique mémoriel, par opposition aux éléments qu'il contient.

**Nature de D2a — décision architecturale motivée :**
DI5 ne formule pas une règle de grain explicite ; la formulation "la valeur mémorielle est la capture elle-même, pas les données extraites" est une règle sémantique de classification établissant la primauté de la forme de source sur le contenu extrait. D2a tire de cette règle la conséquence canonique de grain la plus cohérente avec l'ensemble DI5 + RF-R3. D2a est une décision architecturale motivée — elle ne doit pas être citée comme une règle de grain textuelle directement énoncée par DI5 ou RF-R3. L'option grain datum (grain = datum extrait) est écartée comme architecturalement incompatible avec l'interprétation retenue de DI5 : elle ferait des "données extraites" l'unité canonique, en contradiction directe avec le principe "la valeur mémorielle est la capture elle-même, pas les données extraites". Cette incompatibilité est une conséquence de la décision architecturale D2a, non une prohibition textuelle directe de DI5.

#### D2b — Non-préemption de DT-S3-3

La structure du champ `valeur` d'une trace S3 — y compris ce que ce champ représente (le support lui-même, son analyse, ou une forme dérivée) — est déterminée par DT-S3-3. DT-S3-2 fixe uniquement l'unité canonique de la trace sans préjuger de la sémantique, de la structure ou du contenu de `valeur`.

#### D2c — Portée partielle sur le cas zéro contenu

Le grain identifie le support visuel comme l'unité canonique retenue pour S3. Cette décision ne détermine pas à elle seule si une trace S3 existe ou peut être persistée lorsque l'analyse ne produit aucun contenu exploitable. La question reste dépendante de DT-S3-3 et des règles de validité applicables (RV4 · LOT-P1-2.2). DT-S3-2 ne tranche pas le cas zéro contenu.

#### BORNE-S3-2 — Supports visuels multiples ou identiques · NON DÉTERMINÉ

La doctrine canonique actuelle ne définit pas : (1) le critère d'identité ou d'équivalence entre deux supports visuels (même fichier · copie identique · même contenu dans un format différent · même capture recompressée ou recadrée) ; (2) la relation canonique à appliquer lorsque plusieurs opérations d'analyse concernent des supports dont l'identité ou l'équivalence n'est pas établie. En l'absence de ces définitions, DT-S3-2 ne peut pas statuer sur le comportement canonique dans ces situations. Cette indétermination est enregistrée. Son traitement sera déterminé dans le périmètre compétent.

*(Cette borne est indépendante de BORNE-S3-1, qui porte sur le statut canonique d'une éventuelle sortie extraite ou transformée depuis un support S3.)*

### §5.8 DT-S3-3 — Structure du champ `valeur` d'une trace S3 · TRANCHÉE AVEC BORNE · 2026-08-16

**Question :** Quelle est la structure canonique du champ `valeur` d'une trace S3 ? Résultat brut · objet structuré · enveloppe · autre ?

**Statut :** TRANCHÉE AVEC BORNE — 2026-08-16

#### D3a — Contraintes minimales du champ `valeur` (fondement textuel)

Toute trace S3 possède un champ `valeur` conformément au modèle canonique de trace (IG-I1 · LOT-P1-2.1 §5). Ce champ doit satisfaire la règle RV4 (LOT-P1-2.1 §8.1) : la trace porte une valeur non absente. Une valeur absente ou sémantiquement vide est invalide et entraîne le rejet de la trace à l'ingestion (LOT-P1-2.2 §4.2).

DT-S3-3 n'établit aucune contrainte additionnelle sur ce que le champ `valeur` représente.

#### D3b — Non-détermination sémantique et structurelle

DT-S3-3 ne dispose pas d'un fondement doctrinal suffisant pour fixer :

- ce que le champ `valeur` d'une trace S3 représente sémantiquement ;
- sa structure (texte libre · objet · enveloppe · scalaire · ou autre) ;
- son format ou sa représentation technique ;
- ses éventuels champs internes ;
- la définition opérationnelle de « sémantiquement vide » pour une trace S3.

Cette non-détermination n'est pas une lacune : elle reflète l'état actuel du corpus canonique, qui ne fonde pas ces choix à ce stade. Son traitement sera déterminé dans le périmètre compétent.

#### D3c — DI5 / FB-F2 : tension d'interprétation à préserver

DI5 (LOT-P2-1 §5) formule : « la valeur mémorielle est la capture elle-même, pas les données extraites ». FB-F2 (LOT-P2-1 §13.3) précise : « le contenu extrait par analyse est un artefact de ce processus d'observation — il n'est pas l'objet mémoriel ».

Ces formulations créent une tension d'interprétation sur la nature de ce que le champ `valeur` devrait représenter pour une trace S3. DT-S3-3 ne tranche pas cette tension. Elle devra être prise en compte et résolue lors du traitement de BORNE-S3-3, sans modification des textes de DI5 et de FB-F2.

#### D3d — Portée sur D2c / cas zéro contenu

D2c (§5.7) avait délégué la question de la persistabilité d'une trace S3 en l'absence de contenu exploitable à DT-S3-3 et aux règles de validité applicables.

DT-S3-3 ne résout pas D2c. Aucune équivalence n'est établie entre zéro contenu et valeur vide. La règle RV4 s'appliquera une fois la sémantique du champ `valeur` déterminée — c'est dans ce périmètre que D2c pourra être instruite. D2c reste ouverte.

#### BORNE-S3-3 — Nature, structure et format du champ `valeur` · NON DÉTERMINÉ

La doctrine canonique actuelle ne détermine pas :

(a) ce que le champ `valeur` d'une trace S3 représente sémantiquement — résultat analytique, représentation du support, observation, sortie brute, ou toute autre nature ;
(b) sa structure (texte · objet structuré · enveloppe · scalaire · autre) ;
(c) son format et sa représentation technique ;
(d) ses éventuels champs internes ;
(e) la définition opérationnelle de « sémantiquement vide » pour une trace S3 ;
(f) la résolution de la tension introduite par DI5 et FB-F2 sur la nature de l'objet mémoriel S3 — cette tension contraint la résolution future sans la préempter.

Aucune des possibilités ouvertes n'est fermée ou favorisée par DT-S3-3. Son traitement sera déterminé dans le périmètre compétent.

*(Cette borne est indépendante de BORNE-S3-1, qui porte sur le statut canonique d'une éventuelle sortie extraite ou transformée depuis un support S3, et de BORNE-S3-2, qui porte sur l'identité des supports et la relation entre plusieurs analyses.)*

### §5.9 DT-S3-4 — Position de S3 en Phase A · TRANCHÉE · 2026-08-16

**Question :** Quelle est la position de S3 en Phase A ? Silence total · ou autre forme ? Cohérence requise avec CL-P4 et I-01 documenté.

**Statut :** TRANCHÉE — 2026-08-16

#### D4a — Position de S3 en Phase A (décision architecturale motivée)

S3 est silencieuse en Phase A. Aucune trace S3 n'est produite tant que S3 n'a pas été formellement activée dans le périmètre compétent.

L'existence ontologique de S3 (DT-S3-1), la définition de son grain (DT-S3-2) et l'état canonique actuel du champ `valeur` (DT-S3-3) décrivent l'état doctrinal actuel de S3 ; ils ne constituent pas son activation.

Cette décision est fondée sur la convergence des éléments suivants, dont les statuts sont explicitement distingués :

| Argument | Source | Statut exact |
|---|---|---|
| CL-P4 — "S3 inactive Phase A · aucune ingestion" | LOT-P2-1 §14 | **Ancrage principal · textuel** — formulation la plus explicite du corpus. DT-S3-4 traduit "aucune ingestion" en silence total sans reformulation. |
| D1a — inactivité S3 = absence de module activé | DT-S3-1 §5.6 | **Convergence architecturale** — l'ontologie de S3 est infrastructure-neutre, mais l'acquisition exige un module opérationnel activé. |
| IG-I6 — silence structurel si mécanisme absent | LOT-P2-1 §6 | **Signal normatif fort** — sans module d'analyse visuelle activé, aucun mécanisme d'acquisition S3 reproductible n'existe. |
| I-01 — conflit architectural non tranché | §5.4 | **Contexte structurel · non fondement principal** — la nature du futur module (cloud / local-first) n'est pas décidée. La décision de silence tient sans I-01 : CL-P4 seul suffit. I-01 reste entièrement ouvert. |
| DT-S4-4 Option A · DT-S5-4 Position Gamma | LOT-P2-5 · LOT-P2-4 | **Précédent de séquençage** — définition ontologique ≠ activation, applicable à S3 indépendamment des différences de mécanisme d'acquisition. |

#### D4b — Activation future

Les conditions nécessaires à une activation future de S3 restent à déterminer dans le périmètre compétent. DT-S3-4 ne les établit pas. DT-S3-5 tranchera la question d'EP-S3. La question de I-01 et de la Doctrine de la Mémoire Visuelle (GPD V1 §8.4) relève de périmètres distincts non résolus dans ce lot.

#### D4c — Ce que DT-S3-4 ne tranche pas

- I-01 reste non tranché.
- BORNE-S3-1, BORNE-S3-2 et BORNE-S3-3 restent ouvertes.
- D2c reste ouverte.
- Le contenu d'EP-S3 est délégué à DT-S3-5.
- DT-S3-4 ne produit aucune borne résiduelle.

### §5.10 DT-S3-5 — Exigences de provenance EP-S3 · TRANCHÉE · 2026-08-16

**Question :** Quelles sont les exigences de provenance EP-S3 ? Différées à activation (CL-P4) ou définies en anticipation (modèle DT-S4-5) ? Compatibilité avec I-01 requise.

**Statut :** TRANCHÉE — 2026-08-16

#### D5a — EP-S3 formellement différée (décision fondée textuellement)

Les exigences de provenance de la famille S3 sont formellement différées à l'activation du module d'analyse visuelle correspondant. Aucun contenu opérationnel d'EP-S3 n'est défini dans ce lot.

Cette décision est fondée sur deux textes concourants, dont les formulations sont explicites :

| Source | Texte exact | Statut |
|---|---|---|
| LOT-P2-1 §14.4 | "Les familles S3 · [etc.] sont inactives en Phase A. Leurs exigences de provenance seront définies dans EP lors de l'activation de leur module écrivant ou de leur source d'ingestion respective." | **Ancrage principal · textuel** |
| LOT-P1-2.4 §4.5 | "Il ne couvre pas les familles inactives (S3, S4, S5, ...) — leurs sources seront définies dans leur doctrine de provenance respective, au moment de leur activation." | **Confirmant · textuel** |

La compatibilité avec CL-P4 et DT-S3-4 (§5.9) est totale : le silence Phase A et la différée EP procèdent du même ancrage — l'absence de module d'analyse visuelle activé.

#### D5b — Cadre documentaire connu applicable à EP-S3

Les éléments suivants sont déjà établis par le corpus applicable. Ils constituent le cadre documentaire connu auquel la future EP-S3 devra être confrontée lors de son activation, sans que DT-S3-5 n'en définisse ici le contenu opérationnel propre à S3.

| Champ EP | Obligation | Fondement textuel |
|---|---|---|
| Source | Obligatoire | IG-I4 · LOT-P1-2.4 §3.2 · LOT-P1-2.1 §5.2 |
| Date | Obligatoire — ISO 8601 UTC produite par la couche | LOT-P1-2.4 §3.2 · LOT-P1-2.1 §5.3 |
| Contexte | Optionnel (RV5 > O4) | LOT-P1-2.1 §5.4 · EP-RC3 · LOT-P2-1 §14.2 |
| Session | Optionnelle | LOT-P1-2.4 §6 · LOT-P2-1 §14.2 |

**Caractérisation fonctionnelle de la source :** DI5 (LOT-P2-1 §5 — impact EP) établit que "la source d'une trace S3 est le module de reconnaissance visuelle, pas le format de fichier". La valeur précise du champ Source reste à définir dans le LOT d'activation, en cohérence avec la résolution de I-01.

La structure applicable est la structure uniforme DI3 Option B (LOT-P2-1 §14.2). Le contenu différencié propre à S3 est à définir à l'activation.

#### D5c — Pourquoi l'anticipation (modèle DT-S4-5) n'est pas fondée pour S3

Pour DT-S4-5, la valeur "Opérateur" pour le champ Source était directement déductible de RF-R4 ("annotation manuelle ou journal de l'opérateur") et DI5 — le producteur de la trace S4 est l'opérateur, identifiable indépendamment de toute infrastructure externe. Cette déductibilité propre à S4 n'existe pas pour S3 : la valeur du champ Source dépend de l'identité du module d'analyse visuelle, non encore décidée (I-01 ouvert). Toute anticipation de contenu opérationnel d'EP-S3 constituerait une nouvelle décision architecturale sans fondement canonique à ce stade et risquerait de contraindre la résolution de I-01.

#### D5d — Ce que DT-S3-5 ne tranche pas

- I-01 reste non tranché.
- La valeur précise du champ Source de la trace S3 reste à définir à l'activation.
- Le contenu du champ Contexte pour S3 reste à définir à l'activation.
- La définition opérationnelle de Session pour S3 reste à définir à l'activation.
- BORNE-S3-1, BORNE-S3-2 et BORNE-S3-3 restent ouvertes.
- D2c reste ouverte.
- DT-S3-5 ne produit aucune borne résiduelle.

---

## §6 Décisions à trancher

| ID | Question ouverte | Statut | Prérequis |
|---|---|---|---|
| DT-S3-1 | Périmètre opérationnel de RF-R3 — condition "traité par un module" · liste illustrative ou fermée · frontières S3/S2 et S3/S5 par dérivation | **TRANCHÉE AVEC BORNE · §5.6 · 2026-08-16** | Ouverture lot |
| DT-S3-2 | Quel est le grain canonique d'une trace S3 ? Une trace par image analysée ou une trace par datum extrait ? | **TRANCHÉE AVEC BORNE · §5.7 · 2026-08-16** | DT-S3-1 |
| DT-S3-3 | Quelle est la structure du champ `valeur` d'une trace S3 ? Résultat brut · objet structuré · enveloppe déléguant au module ? | **TRANCHÉE AVEC BORNE · §5.8 · 2026-08-16** | DT-S3-1 · DT-S3-2 |
| DT-S3-4 | Quelle est la position de S3 en Phase A ? Silence total · ou autre forme ? Cohérence requise avec CL-P4 et I-01 documenté | **TRANCHÉE · §5.9 · 2026-08-16** | DT-S3-1 · DT-S3-3 |
| DT-S3-5 | Quelles sont les exigences de provenance EP-S3 ? Différées à activation (CL-P4) ou définies en anticipation (modèle DT-S4-5) ? Compatibilité avec I-01 requise | **TRANCHÉE · §5.10 · 2026-08-16** | DT-S3-4 |

---

## §7 Stratégie de développement

### §7.1 Séquençage des micro-lots

LOT-P2-6 est un lot de doctrine pure. Ses micro-lots correspondent aux étapes de résolution des décisions et à la rédaction du schéma.

| Micro-lot | Mission | Décisions tranchées | Prérequis | Statut |
|---|---|---|---|---|
| **P2-6.A** — Ontologie S3 & frontières | Définir le périmètre de RF-R3 (DT-S3-1) · confirmer frontières S3/S1, S3/S2, S3/S5 · auditer mécanisme de dérivation éventuel | DT-S3-1 | Ouverture lot | **VALIDÉ** |
| **P2-6.B** — Grain et structure canonique | Définir le grain de trace S3 (DT-S3-2) · définir la valeur canonique S3 (DT-S3-3) · schéma complet | DT-S3-2 **TRANCHÉE AVEC BORNE** · BORNE-S3-2 enregistrée · DT-S3-3 **TRANCHÉE AVEC BORNE** · BORNE-S3-3 enregistrée | P2-6.A VALIDÉ | **VALIDÉ** |
| **P2-6.C** — Périmètre Phase A & provenance | Trancher la position Phase A (DT-S3-4) · rédiger ou différer EP-S3 (DT-S3-5) | DT-S3-4 **TRANCHÉE** · S3 silencieuse Phase A · DT-S3-5 **TRANCHÉE** · EP-S3 différée à activation · cadre DI3 documenté | P2-6.B VALIDÉ | **VALIDÉ** |
| **P2-6.D** — Validation documentaire | Vérifier la cohérence globale · CV-1→CV-9 · DQC V2 CAS A | — | P2-6.C VALIDÉ | **VALIDÉ** |

### §7.2 Contrainte architecturale

Ce lot produit un schéma doctrinal pur. Il ne génère aucun code, aucun module, aucune interface.

RF-R3 est figée dans la hiérarchie DI1 de LOT-P2-1 (priorité 3, avant RF-S5, avant RF-R4). Ce lot précise le périmètre opérationnel de RF-R3 sans modifier son texte. Toute modification du texte figé de RF-R3 constituerait une violation des invariants de LOT-P2-1 et est interdite.

La Doctrine de la Mémoire Visuelle (GPD V1 §8.4) n'est pas produite par ce lot. Ce lot documente sa nécessité comme condition d'activation future de S3 — il ne l'écrit pas.

---

## §8 Critères de validation

| CV | Critère | Condition |
|---|---|---|
| CV-1 | DT-S3-1 tranchée — périmètre opérationnel de RF-R3 défini sans ambiguïté | DT-S3-1 adoptée |
| CV-2 | Frontière S3/S1 documentée — FB-F2 et CL-A5 consommés sans contradiction ni réouverture | DT-S3-1 · FB-F2 · CL-A5 |
| CV-3 | Frontières S3/S2 et S3/S5 documentées — architecture DI1 confirmée · mécanisme de dérivation audité | DT-S3-1 |
| CV-4 | RF-R3 non modifiée — précision du périmètre uniquement | DT-S3-1 |
| CV-5 | Schéma canonique S3 complet — DT-S3-2 et DT-S3-3 tranchées · tous champs définis | DT-S3-2 · DT-S3-3 |
| CV-6 | Position Phase A tranchée — DT-S3-4 cohérente avec CL-P4 · I-01 documenté non résolu | DT-S3-4 |
| CV-7 | EP-S3 rédigée ou différée — DT-S3-5 cohérente avec DI3, LOT-P1-2.4 §4.5 et I-01 | DT-S3-5 |
| CV-8 | Aucune contradiction avec les invariants P2-1 — IG-I1→IG-I6 · DI1→DI5 · RF-R3 · FB-F2 | Contrôle global |
| CV-9 | DQC V2 CAS A — double revue indépendante | P2-6.D |

---

## §9 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | Micro-lots P2-6.A à P2-6.D validés (présent document complet et cohérent) |
| Condition 2 | CV-1 à CV-9 satisfaits |
| Condition 3 | DT-S3-1 à DT-S3-5 documentées, adoptées et non contradictoires entre elles |
| Condition 4 | Aucune violation des invariants LOT-P2-1 détectée |
| Condition 5 | DQC V2 CAS A |
| Condition 6 | DQC V3 PASS |
| Condition 7 | Décision opérateur explicite de clôture |

---

*P2-6 EN COURS — P2-6.A VALIDÉ · P2-6.B VALIDÉ · P2-6.C VALIDÉ · P2-6.D VALIDÉ · DT-S3-1 TRANCHÉE AVEC BORNE · DT-S3-2 TRANCHÉE AVEC BORNE · DT-S3-3 TRANCHÉE AVEC BORNE · DT-S3-4 TRANCHÉE · DT-S3-5 TRANCHÉE.*
*P2-6.B VALIDÉ — DT-S3-2 TRANCHÉE AVEC BORNE · grain canonique S3 = support visuel · BORNE-S3-2 enregistrée · DT-S3-3 TRANCHÉE AVEC BORNE · champ `valeur` non surspécifié · contrainte minimale RV4 · BORNE-S3-3 enregistrée · D2c reste ouverte.*
*DT-S3-4 TRANCHÉE — S3 silencieuse Phase A · ancrage CL-P4 · I-01 non tranché · BORNE-S3-1/S3-2/S3-3 ouvertes · D2c ouverte.*
*DT-S3-5 TRANCHÉE — EP-S3 formellement différée à activation · cadre DI3 Option B documenté · source = module de reconnaissance visuelle (DI5) · valeur Source non fixée · I-01 non tranché · BORNE-S3-1/S3-2/S3-3 ouvertes · D2c ouverte.*
*P2-6.C VALIDÉ — DT-S3-4 TRANCHÉE · S3 silencieuse Phase A · ancrage CL-P4 · DT-S3-5 TRANCHÉE · EP-S3 différée à activation · cadre DI3 Option B documenté · I-01 non tranché · BORNE-S3-1/S3-2/S3-3 ouvertes · D2c ouverte.*
*P2-6.D VALIDÉ — CV-1→CV-9 PASS · DQC V2 CAS A · double revue indépendante · BORNE-S3-1/S3-2/S3-3 ouvertes · D2c ouverte · I-01 non tranché.*
