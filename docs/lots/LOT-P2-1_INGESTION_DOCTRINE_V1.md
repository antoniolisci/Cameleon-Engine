# LOT-P2-1 — Doctrine d'ingestion V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-1 |
| Intitulé | Doctrine d'ingestion V1 |
| Programme | P2 — Ingestion des données |
| Phase Roadmap V1 | A |
| Type | Doctrine |
| Document officiel | `docs/lots/LOT-P2-1_INGESTION_DOCTRINE_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-07-09 |
| Prérequis | Programme P1 — Fondation Mémoire & Persistance · GELÉ · 2026-07-09 |

---

## §1 Mission

LOT-P2-1 établit le socle doctrinal commun à toute ingestion de données dans Caméléon Engine.

Ce lot produit un document de doctrine — aucun code, aucune implémentation, aucun schéma technique. Il répond à une question unique : **selon quelles règles une donnée entrante est-elle classifiée, rattachée à une famille et acceptée dans la couche canonique ?**

La doctrine d'ingestion est le prérequis formel de tous les lots techniques du Programme P2. Elle définit le cadre conceptuel dans lequel les parsers, normalisateurs et écrivains canoniques de P2 devront opérer.

---

## §2 Prérequis

| Document | Rôle dans ce lot |
|---|---|
| Architecture Conceptuelle Fondatrice V1 (ACF V1) | Registre officiel des 13 familles mémorielles — source de vérité de la classification |
| LOT-P1-2.1 — Modèle canonique de trace V1 | Définit les 6 champs obligatoires de toute trace mémorielle |
| LOT-P1-2.4 — Doctrine de provenance V1 | Formalise la règle de provenance et les sources officielles par famille |
| Language System V1 | Contraint le vocabulaire utilisé dans ce document |
| Pattern Reflection Doctrine V1 | Interdit toute fusion de signaux inter-familles dans la doctrine |
| Constitution Intellectuelle V1 | Cadre doctrinal de niveau N2 — hiérarchie et compatibilité des doctrines |
| Roadmap V1 §4 P2 | Définit les livrables attendus du Programme P2 |

---

## §3 Périmètre

### §3.1 Inclus

- Règles de classification des données entrantes selon les familles ACF V1
- Critères de frontière entre familles (cas où une donnée pourrait appartenir à plusieurs familles)
- Exigences de provenance à l'ingestion (distinctions par famille si nécessaires)
- Protocole de traitement des cas limites (données non classifiables, données ambiguës, données partielles)
- Définition du concept d'ingestion dans Caméléon Engine

### §3.2 Exclus

- Schémas de fichiers sources S1→S5 (périmètre LOT-P2-2 à LOT-P2-6)
- Parsers et normalisateurs techniques (périmètre LOT-P2-3 à LOT-P2-6)
- Normalisation des formats de données (périmètre LOT-P2-7)
- Toute implémentation de couche d'écriture canonique
- Toute interface utilisateur d'ingestion
- Toute corrélation entre familles après ingestion

---

## §4 Livrables

LOT-P2-1 produit un livrable unique :

**D1 — Doctrine d'ingestion V1**

Document de doctrine composé de quatre composants indissociables :

| Composant | Identifiant | Contenu |
|---|---|---|
| Règles de classification | RF | Règles déterministes permettant d'affecter toute donnée entrante à une et une seule famille ACF V1 |
| Frontières inter-familles | FB | Critères explicites de résolution des cas d'ambiguïté inter-familles |
| Exigences de provenance | EP | Exigences de provenance à l'ingestion, par famille ou catégorie de famille |
| Protocole cas limites | CL | Traitement des données non classifiables, ambiguës ou partielles |

Ces quatre composants sont produits dans ce lot. Ils constituent ensemble la doctrine d'ingestion V1 et sont documentés dans le présent fichier.

---

## §5 Décisions à trancher (P2-1.B)

**Statut :** TRANCHÉES — 2026-07-09
**Base :** Recensement P2-1.A (§11) — 14 cas limites CL-A1→A7 · CL-B1→B2 · CL-C1→C4 · CL-D1→D4

Cinq décisions structurantes ont été tranchées avant la rédaction des composants RF · FB · EP · CL. Chaque décision est fondée exclusivement sur les cas limites du recensement.

---

### DI1 — Structure de la classification : Option A — Séquentielle

**Question :** La classification est-elle séquentielle (hiérarchie de règles) ou parallèle (critères indépendants évalués simultanément) ?

**Décision retenue : Option A — Séquentielle (ordre de priorité fixe)**

La classification d'une donnée entrante suit une hiérarchie de cinq critères, évalués dans l'ordre suivant. Dès qu'un critère produit une famille valide, l'évaluation s'arrête.

| Priorité | Critère | Famille produite |
|---|---|---|
| 1 | La donnée est-elle un état applicatif ? (fonctionnelle, contextuelle, sans valeur historique, sans écrivain actif) | Exclusion de la couche canonique |
| 2 | Un module écrivant interne identifié dispose-t-il d'une famille officielle pour cette donnée ? | Famille selon la table de provenance (LOT-P1-2.4 §4) |
| 3 | La donnée provient-elle d'une source visuelle (capture d'écran, image analysée) ? | S3 — Visuelle |
| 4 | La donnée provient-elle d'une annotation manuelle ou d'un journal de l'opérateur ? | S4 — Personnelle |
| 5 | La donnée provient-elle d'un fichier de données structurées ? La nature de son contenu tranche entre famille S1 (événement transactionnel) et S2 (état patrimonial) selon DI4 | S1 ou S2 |
| — | Aucun critère ne produit une famille valide | Rejet — DI2 |

**Cas limites fondateurs :**
- CL-A1 : R4 classé SY1 malgré contenu évocateur S1 → le module écrivant (priorité 2) prime sur le contenu. Sans hiérarchie séquentielle, l'ambiguïté serait indécidable.
- CL-A5 : S3 vs S1 après extraction d'image → la forme de la source (image, priorité 3) prime sur le contenu extrait. Sans ordre, le contenu transactionnel aurait pu l'emporter.
- CL-A6 : S4 vs SY1 → même logique que CL-A5 (priorité 4 prime sur contenu comportemental).
- CL-A3 / CL-A4 : critère d'état applicatif (priorité 1) — sans ce premier filtre, des snapshots fonctionnels seraient classés comme traces mémorielles.

**Option rejetée — Option B (Parallèle) :**
L'évaluation parallèle de critères indépendants produit des conflits non déterministes dès que deux critères désignent des familles différentes pour la même donnée (cas CL-A1, CL-A5, CL-A6). Sa résolution nécessiterait une règle de priorité — qui serait elle-même séquentielle. La parallèle ajoute de la complexité sans lever l'ambiguïté. Rejetée.

**Impact :**
- RF : structure la hiérarchie des règles de classification selon les 5 priorités
- FB : les frontières inter-familles s'inscrivent dans les nœuds de la hiérarchie (priorités 3→5)
- EP : les exigences de provenance s'appliquent après classification — la famille doit être connue
- CL : les cas limites sont localisés à chaque niveau de la hiérarchie (priorité 1 = CL-A3/A4, priorité 5 = CL-D4)

---

### DI2 — Traitement des données non classifiables : Option A — Rejet immédiat

**Question :** Une donnée non classifiable est-elle rejetée à l'entrée ou mise en quarantaine pour traitement différé ?

**Décision retenue : Option A — Rejet immédiat**

Toute donnée pour laquelle aucun critère de la hiérarchie DI1 ne produit une famille valide dans le registre ACF V1 est rejetée à l'entrée. Le rejet est explicite et tracé — la donnée n'est pas ingérée.

**Précision de périmètre — ce que DI2 ne couvre pas :**

DI2 s'applique exclusivement aux données pour lesquelles aucune famille ACF V1 n'est identifiable. Les situations suivantes ne relèvent pas de DI2 et ne déclenchent pas de rejet :
- Donnée avec date absente ou non conforme (CL-C1 / CL-C2 / CL-C3) : la donnée a une famille valide et est ingérée avec un état formalisé de date. Ce n'est pas un cas de non-classification.
- Donnée dont la famille est dans le registre mais inactive en Phase A (CL-B1) : la donnée a une famille ACF V1 valide. Son traitement relève du protocole CL, pas de DI2.

**Cas limites fondateurs :**
- CL-B2 : toute donnée dont la famille n'existe pas dans le registre ACF V1 → RV1 impose le rejet. Le registre est fermé (MI-5) ; la quarantaine présupposerait une doctrine future qui n'est pas décidée.
- CL-C1/C2/C3 (R1/R3/R4) : ces cas valident que la démarche de Caméléon Engine est d'ingérer avec dégradation contrôlée (état formalisé), pas de rejeter pour incomplétude de date. Ils ne contredisent pas DI2 car ils ont une famille.
- IG-I6 : "Le silence (rejet ou quarantaine) est préférable à une classification incorrecte" — le silence retenu est le rejet, plus honnête qu'une quarantaine sans protocole de résolution.

**Option rejetée — Option B (Quarantaine) :**
La quarantaine crée un accumulateur de données "en attente de doctrine" sans protocole de résolution défini. Elle présuppose que la doctrine évoluera pour les intégrer — ce qui est une décision de niveau N2, pas opérationnel. Elle viole MI-5 (registre fermé) en maintenant des données dans le système sans famille valide. Rejetée.

**Impact :**
- RF : la hiérarchie DI1 se clôt explicitement par "rejet si aucun critère satisfait"
- CL : le protocole cas limites distingue le rejet (DI2, famille inconnue) du traitement avec état formalisé (famille valide, date dégradée) et du traitement différé (famille inactive — CL-B1, hors DI2)
- EP : aucun impact direct — DI2 intervient avant l'application des exigences de provenance

---

### DI3 — Exigences de provenance : Option B — Différenciées

**Question :** Les exigences de provenance sont-elles identiques pour toutes les familles ou différenciées par famille ?

**Décision retenue : Option B — Différenciées**

La structure des exigences de provenance est uniforme pour toutes les familles (source obligatoire · date obligatoire sous forme ISO 8601 ou état formalisé · contexte optionnel). Le contenu acceptable, les états formalisés autorisés et les formats de contexte sont différenciés par famille ou groupe de familles.

**Résolution de la tension O4/RV5 (CL-D1) :**
La tension entre l'objectif O4 du cadrage LOT-P1-2 ("fournir source · date · contexte") et la règle formelle RV5 du modèle canonique ("contexte optionnel") est tranchée en faveur de RV5. La hiérarchie est : règle formelle du modèle > objectif de cadrage. Le contexte est optionnel pour toute famille et toute ingestion. La doctrine EP peut préciser pour quelles familles le contexte est fortement encouragé sans le rendre obligatoire.

**Cas limites fondateurs :**
- CL-A2 : SY1 regroupe deux modules sources distincts (comportemental et OI V1), avec des sessions différentes par module. Les exigences ne peuvent pas être uniformes au niveau intra-famille sans perdre la différenciation de session nécessaire.
- CL-D1 : la tension O4/RV5 est tranchée par la hiérarchie des règles doctrinales — RV5 est une règle formelle, O4 un objectif. RV5 l'emporte.
- CL-C1/C2/C3 : les états formalisés de date (R1/R3/R4) sont déjà spécifiques à chaque source — "Non disponible" pour R1 et R3, "Non exploitable au format canonique" pour R4. Cette différenciation préexistante confirme Option B.
- LOT-P1-2.4 §7 : les formats de contexte sont déjà différenciés par famille (SY1-comportemental, SY1-OI, SY3, S1, S2). La doctrine EP s'inscrit dans cette continuité.

**Option rejetée — Option A (Uniformes) :**
Une exigence uniforme ne peut pas couvrir les états formalisés de date (différents par source), les formats de contexte différents par famille, ni la différenciation de session intra-famille SY1. Elle forcerait soit une sur-contrainte (règles trop strictes pour certaines familles) soit une sous-contrainte (règles trop lâches pour d'autres). Rejetée.

**Impact :**
- EP : produit une table d'exigences par famille ou groupe de familles (SY1-comportemental · SY1-OI · SY3 · S1 · S2 · familles futures)
- RF : aucun impact direct sur les règles de classification
- FB : aucun impact direct
- CL : le protocole cas limites référence les exigences différenciées par famille pour les cas de date dégradée

---

### DI4 — Critères de frontière S1/S2 : Critère événement vs état

**Question :** Quels sont les critères de frontière entre la famille transactionnelle (S1) et la famille patrimoniale (S2) ?

**Décision retenue : Critère de nature de la donnée — événement vs état**

| Famille | Critère | Nature de la donnée |
|---|---|---|
| S1 — Transactionnelle | Événement ponctuel d'échange | La donnée représente une opération d'échange survenue à un instant précis : achat, vente, transfert, dépôt, retrait, exécution d'ordre |
| S2 — Patrimoniale | État de composition à un instant | La donnée représente l'état d'un patrimoine ou d'un portefeuille à un instant donné : composition, allocation, inventaire de positions, solde total |

**Règle de coexistence :** Un même fichier source peut produire des traces dans les deux familles. Le critère s'applique donnée par donnée, pas fichier par fichier.

**Cas limite fondateur :**
- CL-D4 : un fichier Wallet History Binance contient des lignes de trade (événements d'échange → S1) et des snapshots de composition (états patrimoniaux → S2). Sans critère explicite, le classement serait impossible. Le critère événement/état résout ce cas sans ambiguïté : chaque ligne est traitée indépendamment.

**Compléments doctrinaux issus du recensement :**
- S1 existant en Phase A : Registre des importations (entrée 9 LOT-P1-2.1) — chaque import est un événement transactionnel.
- S2 existant en Phase A : Portefeuille (entrée 10) — chaque mise à jour du portefeuille est un état patrimonial.
Ces deux exemples confirment le critère et en illustrent l'application.

**Impact :**
- FB : le critère événement/état est le composant central de la frontière S1/S2
- RF : la priorité 5 de la hiérarchie DI1 s'appuie sur ce critère pour trancher S1 vs S2
- EP : les exigences de provenance peuvent différer entre S1 (contexte = paramètres de l'opération) et S2 (contexte = composition du patrimoine)
- CL : CL-D4 (fichier mixte) est couvert par la règle de coexistence

---

### DI5 — Sources S3/S4 : Option B — Traitement spécifique

**Question :** Les données de sources annotées (S3) et de sources synthétiques (S4) requièrent-elles un traitement de classification particulier ?

**Décision retenue : Option B — Traitement spécifique**

S3 et S4 sont classifiées par la **forme de leur source originale**, indépendamment du contenu qu'elles exposent. Cette règle est positionnée aux priorités 3 et 4 de la hiérarchie séquentielle DI1, avant toute classification par contenu.

| Famille | Critère spécifique | Indépendant du contenu |
|---|---|---|
| S3 — Visuelle | Toute donnée issue de l'analyse d'une source visuelle (capture d'écran, image) | Même si le contenu extrait est transactionnel (S1) ou comportemental (SY1) |
| S4 — Personnelle | Toute donnée issue d'une annotation manuelle ou d'un journal de l'opérateur | Même si le contenu est comportemental (SY1) ou décisionnel (SY3) |

**Cas limites fondateurs :**
- CL-A5 : une capture d'écran d'un relevé de trading analysée par un module de reconnaissance visuelle → contenu extrait = transactions (S1 possible). Sans règle spécifique, le contenu extrait prendrait le dessus → erreur de classification. Avec Option B : la forme de la source (capture) prime → S3.
- CL-A6 : une note de journal de l'opérateur portant sur son propre comportement → contenu = réflexion comportementale (SY1 possible). Sans règle spécifique : risque de classification SY1. Avec Option B : la forme de la source (note manuelle) prime → S4.

**Cohérence avec DI1 :**
DI5 Option B est l'implémentation doctrinale des priorités 3 et 4 de la hiérarchie DI1. La règle "source > contenu" est appliquée avant la classification par contenu (priorité 5 = S1/S2 par DI4). La cohérence est totale.

**Option rejetée — Option A (Traitement standard) :**
Avec un traitement standard, S3 et S4 seraient classifiées uniquement par le contenu extrait. CL-A5 démontre qu'une image de relevé de trading serait classée S1 — famille incorrecte car la valeur mémorielle est la capture elle-même, pas les données extraites. CL-A6 démontre qu'une note comportementale serait classée SY1 — incorrect car c'est l'annotation de l'opérateur qui a une valeur, pas le module comportemental. Rejetée.

**Impact :**
- RF : S3 et S4 ont chacune une règle de classification spécifique basée sur la forme de la source
- FB : les frontières S3/S1 et S4/SY1 sont résolues par DI5 (source > contenu) — elles n'ont pas besoin d'un critère de contenu supplémentaire
- EP : les exigences de provenance pour S3 et S4 sont différenciées (DI3 Option B) — la source d'une trace S3 est le module de reconnaissance visuelle, pas le format de fichier
- CL : CL-A5 et CL-A6 sont couverts par DI5

---

### §5.1 — Tableau récapitulatif des décisions

| Décision | Question | Décision retenue | Base CL |
|---|---|---|---|
| DI1 | Structure de la classification | Option A — Séquentielle (5 priorités) | CL-A1 · CL-A3 · CL-A4 · CL-A5 · CL-A6 |
| DI2 | Traitement des données non classifiables | Option A — Rejet immédiat | CL-B2 · IG-I6 · MI-5 |
| DI3 | Exigences de provenance | Option B — Différenciées · RV5 > O4 | CL-A2 · CL-D1 · CL-C1/C2/C3 |
| DI4 | Frontière S1/S2 | Événement (S1) vs État (S2) | CL-D4 |
| DI5 | Sources S3/S4 | Option B — Traitement spécifique (forme source prime) | CL-A5 · CL-A6 |

---

## §6 Invariants

Les invariants suivants sont actifs dès l'ouverture de ce lot. Aucune règle de la doctrine d'ingestion ne peut les violer.

| Identifiant | Invariant |
|---|---|
| IG-I1 | **Conformité au modèle canonique** — toute donnée acceptée à l'ingestion doit être représentable comme une trace canonique conforme à LOT-P1-2.1 (6 champs : famille · source · date · valeur · contexte optionnel · session optionnelle) |
| IG-I2 | **Appartenance exclusive** — toute donnée appartient à une et une seule famille ACF V1. L'appartenance multiple est interdite |
| IG-I3 | **Classification par règle** — l'affectation à une famille résulte d'une règle déterministe, jamais d'une inférence probabiliste ou d'un jugement contextuel |
| IG-I4 | **Provenance obligatoire** — toute donnée ingérée doit avoir une source identifiable conforme à la doctrine de provenance LOT-P1-2.4. L'absence de source est un motif de rejet selon DI2 |
| IG-I5 | **Aucune corrélation à l'ingestion** — la couche d'ingestion ne corrèle pas les données entre familles. La signification relative des données est produite par les couches de lecture, jamais à l'ingestion |
| IG-I6 | **Silence structurel** — une donnée qui ne satisfait aucune règle de classification n'est pas ingérée de force. Le silence (rejet ou quarantaine) est préférable à une classification incorrecte |

---

## §7 Stratégie de développement

LOT-P2-1 est un lot de doctrine pure. Aucune ligne de code n'est produite dans ce lot.

La doctrine est construite en cinq étapes séquentielles :

| Étape | Contenu | Livrable |
|---|---|---|
| P2-1.A | Recensement des cas limites connus issus de LOT-P1 et LOT-P1-2 (données R1/R3/R4, ambiguïtés de famille observées) | Liste des cas à traiter |
| P2-1.B | Tranchée des décisions DI1 à DI5 | Décisions documentées dans §5 |
| P2-1.C | Rédaction des quatre composants RF · FB · EP · CL | Doctrine D1 dans §12 à §15 |
| P2-1.D | Validation terrain minimale (lecture critique de la doctrine sur le corpus canonique réel — 16 traces) | Vérification cohérence doctrine ↔ corpus |
| P2-1.E | DQC V2 + DQC V3 | Document certifié CAS A + PASS |

La validation terrain de LOT-P2-1 est documentaire, non logicielle : il s'agit de vérifier que les règles de classification produiraient les bonnes affectations sur le corpus canonique réel issu de LOT-P1-2.

---

## §8 Critères de validation

| Identifiant | Critère |
|---|---|
| CV1 | La doctrine couvre toutes les familles ACF V1 actives en Phase A (SY1 · SY3 · S1 · S2) |
| CV2 | Chaque règle de classification est déterministe : pour tout exemple de donnée, une et une seule famille est désignée sans ambiguïté |
| CV3 | Les frontières inter-familles sont documentées explicitement pour tous les couples de familles présentant un risque d'ambiguïté |
| CV4 | Les exigences de provenance à l'ingestion sont définies et cohérentes avec la doctrine LOT-P1-2.4 |
| CV5 | Le protocole de traitement des cas limites est opérationnel : pour chaque type de cas limite identifié en P2-1.A, une règle de traitement explicite est formulée |

---

## §9 Conformité doctrinale

| Doctrine | Exigence applicable | Conformité |
|---|---|---|
| ACF V1 | Registre des 13 familles fermé — aucune famille nouvelle sans décision de gouvernance | Satisfaite : ce lot n'ouvre aucune nouvelle famille |
| LOT-P1-2.1 | Classification par les 6 champs du modèle canonique | Satisfaite : la doctrine IG-I1 l'impose |
| LOT-P1-2.4 | Provenance obligatoire par famille | Satisfaite : la doctrine IG-I4 l'impose |
| Pattern Reflection Doctrine V1 | Aucune fusion de signaux inter-familles | Satisfaite : la doctrine IG-I5 l'interdit |
| Language System V1 | Vocabulaire contrôlé — pas de termes de suggestion ou de comportement | Satisfaite : document de doctrine, aucun texte UI |
| Constitution Intellectuelle V1 | Cohérence avec les doctrines de niveau N2 | Satisfaite : aucun conflit identifié |
| OI V1 | Aucune donnée ne quitte l'appareil sans consentement (I-01) | Hors périmètre : ce lot ne produit pas de code |
| Roadmap V1 §4 P2 | P2 produit les capacités d'ingestion pour toutes les sources S1→S5 | Satisfaite : ce lot établit le socle doctrinal requis |

---

## §10 Conditions de clôture

| Condition | Description |
|---|---|
| Condition 1 | Les quatre composants de D1 sont rédigés et complets (RF · FB · EP · CL) |
| Condition 2 | Les cinq critères CV1 à CV5 sont satisfaits |
| Condition 3 | Les cinq décisions DI1 à DI5 sont tranchées et documentées |
| Condition 4 | DQC V2 — document certifié CAS A (double revue indépendante) |
| Condition 5 | Décision opérateur explicite de clôture |

LOT-P2-1 peut être déclaré CLOS uniquement lorsque les cinq conditions sont satisfaites. La clôture déverrouille les lots techniques du Programme P2 (LOT-P2-2 et suivants).

---

## §11 Recensement des cas limites (P2-1.A)

**Statut :** COMPLÉTÉ — 2026-07-09
**Source :** LOT-P1 · LOT-P1-2.1 · LOT-P1-2.4 · LOT-P1-3 · Roadmap V1 §4 P2

Ce recensement constitue le livrable de l'étape P2-1.A. Il identifie l'ensemble des cas limites connus issus des lots précédents, et prépare les décisions DI1 à DI5 ainsi que les composants RF · FB · EP · CL de la doctrine.

---

### §11.1 Catégorie A — Ambiguïtés de famille

Ces cas produisent une incertitude sur la famille ACF V1 à affecter à une donnée.

**CL-A1 — Données de trading comportant des horodatages d'ordres (R4)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §6.4 · LOT-P1-2.4 §5.3 |
| Donnée concernée | Paramètres d'ordres récents |
| Ambiguïté | Le contenu (paramètres d'ordres de trading) évoque la famille S1 (Transactionnelle). La source (module comportemental) la rattache à SY1 (Comportementale). |
| Résolution LOT-P1-2.1 | Classée SY1 — la famille est déterminée par la nature mémorielle de la donnée et son module source, pas par son contenu évocateur |
| Signal pour DI1 | La règle de classification ne peut pas être le seul contenu. Un critère d'ordre de priorité (source > contenu) peut résoudre l'ambiguïté de façon déterministe — signal en faveur d'une classification séquentielle |
| Signal pour DI4 | Critère explicite S1/SY1 requis dans la doctrine |

**CL-A2 — Une même famille, deux modules sources distincts (SY1)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §4.2 · LOT-P1-2.4 §4.1 · §6.1 |
| Donnée concernée | Entrées 1–4 (module comportemental) et entrées 5–6 (module OI V1), toutes en SY1 |
| Ambiguïté | Les deux sous-groupes ont des rythmes d'activité indépendants, des identifiants de session distincts, des contextes différents — mais appartiennent à la même famille |
| Résolution LOT-P1-2.4 | Session définie par module écrivant, non par famille. La famille reste SY1 pour les deux sous-groupes |
| Signal pour DI3 | La provenance peut être différenciée au niveau du module écrivant sans différencier les exigences de famille — plaide pour DI3 Option B (différenciée) ou pour une nuance dans Option A |
| Signal pour RF | La règle de classification doit produire la même famille pour deux modules différents dont le contenu est de même nature mémorielle |

**CL-A3 — Slot structurellement préparé sans écrivain actif (entrée 11 "Paramètres")**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §3.3 |
| Donnée concernée | Paramètres (entrée 11) — slot export/import sans contenu ni écriture active |
| Ambiguïté | Slot structuré comme une donnée mémorielle (export, sync) mais sans valeur historique active. Classé état applicatif. Sa reclassification future est explicitement réservée |
| Résolution LOT-P1-2.1 | Critère décisif : absence d'écrivain actif ET absence de valeur historique ou réflexive → état applicatif |
| Signal pour RF | Le critère de classification trace/état doit inclure explicitement la condition "valeur historique ou réflexive pour le décideur". Un slot préparé mais vide ne qualifie pas |

**CL-A4 — Snapshot fonctionnel vs trace historique (entrée 14 "Instantané moteur")**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §4.6 · §3.2 entrées 8 et 14 |
| Donnée concernée | Instantané moteur (entrée 14) vs Sauvegardes moteur (entrée 8) — contenu similaire, statuts opposés |
| Ambiguïté | L'instantané et les sauvegardes capturent tous deux l'état du moteur. L'instantané sert la restauration de session courante (applicatif). Les sauvegardes sont des captures historiques intentionnelles (SY3) |
| Résolution LOT-P1-2.1 | L'intention de la donnée tranche : restauration courante → état applicatif · capture historique intentionnelle → trace mémorielle SY3 |
| Signal pour RF | La règle de classification doit intégrer l'intention fonctionnelle de la donnée, pas seulement son format ou son contenu |

**CL-A5 — S3 (Visuelle via capture) vs S1 (Transactionnelle) après extraction**

| Champ | Valeur |
|---|---|
| Source | Roadmap V1 §4 P2 — schémas S1 et S3 |
| Donnée concernée | Captures d'écran de relevés de trading analysées par GPT Vision |
| Ambiguïté | La source originale est une image (S3 — Visuelle). Le contenu extrait est transactionnel (serait S1). La famille est-elle déterminée par la source (S3) ou par le contenu extrait (S1) ? |
| Résolution | Non tranchée — à décider dans DI1/RF |
| Signal pour DI1 | Cas emblématique pour la classification séquentielle : si source > contenu, la donnée est S3. Si contenu > source, elle pourrait devenir S1 |
| Signal pour FB | Frontière S3/S1 à documenter explicitement |

**CL-A6 — S4 (Personnelle) vs SY1 (Comportementale)**

| Champ | Valeur |
|---|---|
| Source | Roadmap V1 §4 P2 |
| Donnée concernée | Notes/journal de l'opérateur portant sur son propre comportement de trading |
| Ambiguïté | Une réflexion de l'opérateur sur ses patterns comportementaux → S4 (Personnelle, car saisie manuelle) ou SY1 (Comportementale, car contenu comportemental) ? |
| Résolution | Non tranchée — à décider dans DI1/RF |
| Signal pour DI1 | Second cas emblématique pour la hiérarchie source > contenu |
| Signal pour FB | Frontière S4/SY1 à documenter |

**CL-A7 — SY3 (Décisionnelle) vs SY4 (future) — frontière décision/apprentissage**

| Champ | Valeur |
|---|---|
| Source | Roadmap V1 §4 P4 |
| Donnée concernée | Données de retour sur décision ("post-trade analysis") — non encore actives |
| Ambiguïté | SY4 n'est pas actif en Phase A. Lorsqu'il le sera, la frontière SY3 (décision prise) / SY4 (apprentissage extrait de la décision) devra être explicitement définie |
| Résolution | Non tranchée — à anticiper dans RF comme règle conditionnelle |
| Signal pour RF | La règle de classification doit comporter une note sur SY4 comme famille inactive dont l'activation future créera une frontière avec SY3 |

---

### §11.2 Catégorie B — Données non classifiables

Ces cas produisent une donnée sans famille valide dans le registre, ou dont la famille est dans le registre mais inactive.

**CL-B1 — Données correspondant à une famille ACF V1 inactive en Phase A**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §5.1 · §3.4 |
| Familles concernées | S3 · S4 · S5 · SY2 · SY4 · L1 · L2 · L3 · Référentiel (9 familles inactives en Phase A) |
| Situation | La couche canonique accepte techniquement des écritures dans ces familles. Aucun module ne les peuple actuellement. Si une donnée entrante appartient à l'une de ces familles, elle est classifiable (famille valide dans le registre) mais sans module source défini |
| Résolution | Non tranchée dans P1 — à traiter dans RF (règle d'activation) et CL (protocole) |
| Signal pour DI2 | Une donnée dans une famille inactive n'est pas "non classifiable" — elle a une famille. La question est : l'ingère-t-on ou la met-on en quarantaine jusqu'à l'activation du module source ? |
| Signal pour CL | Le protocole cas limites doit distinguer "famille inconnue" (hors registre) de "famille inactive" (dans le registre, sans module actif) |

**CL-B2 — Données hors du registre des 13 familles (famille inconnue)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §5.1 MI-5 · §10 |
| Situation | Une donnée dont aucune des 13 familles ACF V1 ne décrit la nature. Le registre est fermé — toute extension nécessite une décision doctrinale de niveau N2 |
| Résolution | LOT-P1-2.1 MI-5 : rejet implicite. La couche rejette toute trace avec famille invalide (RV1) |
| Signal pour DI2 | La donnée hors registre est rejetée par RV1 — pas de quarantaine possible dans l'état actuel du modèle. DI2 s'applique principalement aux données "inclassables parmi les familles actives" |
| Signal pour CL | Le protocole doit couvrir ce cas : donnée avec famille inconnue = rejet systématique + motif documenté |

---

### §11.3 Catégorie C — Données partielles

Ces cas produisent des traces valides mais incomplètes sur un ou plusieurs champs du modèle canonique.

**CL-C1 — Trace sans date disponible (R1 — Mémoire comportementale)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §6.2 · LOT-P1-2.4 §5.1 |
| Nature | L'information temporelle est structurellement absente — aucune enveloppe de datation dans la source |
| Traitement établi | Champ Date = "Non disponible" (état formalisé). Trace ingérée, non rejetée |
| Signal pour DI2 | R1 démontre qu'une donnée partiellement complète (sans date réelle) peut être ingérée avec un état formalisé — plaide contre le rejet systématique des données à date manquante |
| Signal pour EP | Les exigences de provenance à l'ingestion doivent prévoir les états formalisés de date pour les sources dont la datation est structurellement absente |

**CL-C2 — Trace avec date dans un format non standard non convertible (R3 — Niveau de garde)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §6.3 · LOT-P1-2.4 §5.2 |
| Nature | Information temporelle présente mais dans un format non conforme à ISO 8601. Non convertible directement |
| Traitement établi | Champ Date = "Non disponible" — même état formalisé que R1, raison différente |
| Distinction R1/R3 | Documentée dans LOT-P1-2.1 §6.3 : R1 = absence totale · R3 = présence dans format non conforme non convertible |
| Signal pour EP | La doctrine d'ingestion doit distinguer deux sous-cas de "Non disponible" afin d'orienter les parsers futurs vers des comportements corrects |

**CL-C3 — Trace avec date dans un format non standard convertible (R4 — Paramètres d'ordres récents)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §6.4 · LOT-P1-2.4 §5.3 |
| Nature | Information temporelle en epoch millisecondes — format non conforme mais techniquement convertible en ISO 8601 |
| Traitement établi | Champ Date = "Non exploitable au format canonique". Normalisation future réservée à un LOT ultérieur |
| Distinction R4 / R1-R3 | R4 est normalisable par conversion. R1 et R3 ne le sont pas — aucune information temporelle exploitable |
| Signal pour EP | La doctrine d'ingestion doit créer une troisième catégorie de date : "format non conforme mais convertible" → le parser peut choisir entre conversion immédiate (ISO 8601) ou état formalisé "Non exploitable au format canonique" selon sa capacité |
| Signal pour CL | Les données à date convertible constituent un cas limite spécifique distinct du "Non disponible" |

**CL-C4 — Trace sans contexte (cas général)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §5.4 · RV5 |
| Nature | Le contexte est facultatif pour toutes les familles en Phase A. Son absence est valide |
| Traitement établi | RV5 : contexte optionnel, non contraint. Trace ingérée sans contexte = trace valide |
| Signal pour EP | Ce n'est pas un cas limite bloquant pour l'ingestion. L'absence de contexte ne déclenche ni rejet ni état formalisé |

---

### §11.4 Catégorie D — Conflits source / famille / date / valeur

Ces cas produisent une tension entre les champs du modèle canonique ou entre les règles doctrinales.

**CL-D1 — Tension O4 vs RV5 (contexte obligatoire vs optionnel)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2 §3 O4 · LOT-P1-2.1 §8.1 RV5 · LOT-P1-2.4 §7 Note |
| Nature | O4 (objectif cadrage LOT-P1-2) : "fournir source · date · contexte". RV5 (règle modèle) : "contexte optionnel" |
| Résolution dans P1 | LOT-P1-2.4 applique RV5 sans trancher la tension — document non autorisé à le faire |
| Signal pour EP | La doctrine d'ingestion LOT-P2-1 doit trancher cette tension. Les exigences de provenance EP doivent soit confirmer RV5 (contexte optionnel pour toute ingestion), soit définir des familles pour lesquelles le contexte est obligatoire à l'ingestion |

**CL-D2 — Date imbriquée dans la valeur (données entrantes CSV/PDF)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.1 §6.4 (cas R4) · Roadmap V1 §4 P2 S1/S2 |
| Nature | Dans les fichiers sources entrants (CSV de trades, historiques Binance), la date d'une opération est dans le contenu du fichier, pas fournie comme métadonnée séparée. Le parser doit l'extraire |
| Cas identifiés | (a) date au format ISO-like → extraction directe · (b) date epoch ms → conversion ou état formalisé · (c) date absente → état "Non disponible" · (d) date dans un format propriétaire (ex. "Jan 12, 2025") → normalisation |
| Signal pour EP | Les exigences de provenance doivent spécifier comment la date est produite pour les données d'ingestion externe : fournie par la couche (nouvelles écritures internes) vs extraite du contenu (ingestion externe) |
| Signal pour CL | Les quatre sous-cas de date externe constituent des cas limites distincts à couvrir dans le protocole |

**CL-D3 — Provenance conflictuelle (deux modules revendiquent la même trace)**

| Champ | Valeur |
|---|---|
| Source | LOT-P1-2.4 §4 · LOT-P1-2.1 §5.2 |
| Nature | Cas hypothétique non encore rencontré en Phase A : deux modules distincts produisent une trace dont la famille est identique mais la source est différente, pour le même événement |
| Exemple potentiel | Module OI V1 et module comportemental écrivent tous deux une synthèse comportementale lors du même événement → deux traces SY1 distinctes ou une seule ? |
| Signal pour EP | La règle de provenance doit clarifier : une trace = une source. Si deux modules écrivent sur le même événement, ce sont deux traces distinctes — jamais une fusion |
| Signal pour IG-I2 | L'invariant d'appartenance exclusive s'applique par trace, non par événement |

**CL-D4 — Frontière S1 / S2 dans un fichier mixte (Wallet History)**

| Champ | Valeur |
|---|---|
| Source | Roadmap V1 §4 P2 · Architecture données utilisateur — Caméléon Engine |
| Nature | Un fichier Wallet History Binance contient à la fois des enregistrements de trades (S1 — Transactionnelle) et des états de composition du portefeuille (S2 — Patrimoniale) |
| Situation | Un seul fichier source → deux familles de destination différentes |
| Signal pour DI4 | Critère de frontière S1/S2 : une ligne de trade (exécution d'ordre) → S1 · un snapshot de composition wallet (état du portefeuille à un instant) → S2 |
| Signal pour FB | Frontière S1/S2 est le premier cas concret à documenter dans le composant FB |

---

### §11.5 Synthèse — Impact sur les décisions DI1 à DI5

| Décision | Signal dominant issu du recensement |
|---|---|
| DI1 — Séquentielle vs parallèle | CL-A1 · CL-A5 · CL-A6 plaident pour une hiérarchie de critères séquentielle : la source du module écrivant prime sur le contenu pour SY1 ; l'origine de la donnée prime sur le contenu extrait pour S3 vs S1 |
| DI2 — Rejet vs quarantaine | CL-C1 à CL-C3 montrent que P1 a toujours préféré ingérer avec état formalisé plutôt que rejeter — mais ces données ont une famille valide : DI2 ne s'applique pas à elles. CL-B1 suggère un traitement distinct pour famille inactive vs famille inconnue. **Tranchée dans §5/DI2 : Option A — Rejet immédiat.** |
| DI3 — Uniforme vs différenciée | CL-A2 et CL-D1 montrent que la provenance est déjà différenciée par module au sein d'une même famille (SY1). DI3 Option B (différenciée) est cohérente avec l'existant. La tension O4/RV5 doit être tranchée |
| DI4 — Frontière S1/S2 | CL-D4 fournit le critère concret : ligne de trade = S1 · snapshot de composition wallet = S2 |
| DI5 — S3/S4 standard vs spécifique | CL-A5 et CL-A6 montrent que S3 et S4 ont des ambiguïtés de classification propres à leur nature (contenu vs origine). Un traitement spécifique (DI5 Option B) semble requis pour éviter les faux positifs S3→S1 et S4→SY1 |

---

### §11.6 Liste consolidée des cas à couvrir par composant

| Composant | Cas à couvrir |
|---|---|
| RF — Règles de classification | CL-A1 · CL-A2 · CL-A3 · CL-A4 · CL-A5 · CL-A6 · CL-A7 · CL-B2 |
| FB — Frontières inter-familles | CL-A1 (SY1/S1) · CL-A5 (S3/S1) · CL-A6 (S4/SY1) · CL-A7 (SY3/SY4) · CL-D4 (S1/S2) |
| EP — Exigences de provenance | CL-C1 · CL-C2 · CL-C3 · CL-D1 (tension O4/RV5) · CL-D2 (date externe) · CL-D3 |
| CL — Protocole cas limites | CL-B1 · CL-B2 · CL-C1 · CL-C2 · CL-C3 · CL-D2 (sous-cas a→d) |

---

## §12 RF — Règles de classification

**Statut :** RÉDIGÉ — 2026-07-09
**Fondé sur :** DI1 (hiérarchie séquentielle) · DI5 (traitement spécifique S3/S4) · DI4 (frontière S1/S2) · DI2 (rejet) · recensement P2-1.A §11.1 et §11.2

---

### §12.1 Définition et portée

Dans Caméléon Engine, **classer une donnée** consiste à lui affecter exactement une famille du registre ACF V1, de façon déterministe, avant toute écriture dans la couche canonique.

Le composant RF établit les règles qui rendent ce classement possible. Une règle RF est valide si et seulement si elle est déterministe : pour toute donnée entrante, son application désigne une famille unique ou un rejet explicite, sans ambiguïté, sans jugement contextuel et sans inférence probabiliste (IG-I3).

Le composant RF s'applique à toute donnée, quel que soit son format d'origine, son volume ou son module producteur.

---

### §12.2 Hiérarchie séquentielle de classification

La classification d'une donnée suit une hiérarchie de cinq règles, évaluées dans l'ordre croissant de priorité. L'évaluation s'arrête dès qu'une règle produit une famille valide (DI1 — Option A).

| Priorité | Règle | Résultat |
|---|---|---|
| 1 | RF-R1 — État applicatif | Exclusion de la couche canonique |
| 2 | RF-R2 — Module écrivant interne | Famille officielle du module |
| 3 | RF-R3 — Source visuelle | S3 — Visuelle |
| 4 | RF-R4 — Source annotation manuelle | S4 — Personnelle |
| 5 | RF-R5 — Fichier structuré | S1 ou S2 selon DI4 |
| — | RF-R6 — Aucune règle satisfaite | Rejet |

La hiérarchie garantit l'appartenance exclusive (IG-I2) : une donnée satisfaisant une règle de priorité supérieure ne peut pas être classifiée par une règle de priorité inférieure.

---

### §12.3 Règles détaillées

#### RF-R1 — Priorité 1 : Exclusion des états applicatifs

Une donnée est un **état applicatif** si elle satisfait au moins l'un des critères suivants :

- Elle remplit une fonction technique de l'application (restauration de session, synchronisation, paramétrage d'interface) sans valeur historique pour le décideur
- Aucun module écrivant actif ne lui est associé
- Son contenu n'a pas de valeur réflexive, décisionnelle ou comportementale pour l'opérateur

**Résultat :** exclusion de la couche canonique. La donnée n'est pas ingérée et ne déclenche pas de rejet au sens de RF-R6 — elle est hors périmètre mémoriel.

**Cas limites couverts :** CL-A3 (slot "Paramètres" sans écrivain actif) · CL-A4 (instantané moteur pour restauration de session courante)

---

#### RF-R2 — Priorité 2 : Module écrivant interne identifié

Un **module écrivant interne** est un composant de Caméléon Engine dont la famille officielle est inscrite dans la table de provenance (LOT-P1-2.4 §4). Lorsqu'un tel module est identifié comme producteur de la donnée, la famille est celle du module — indépendamment du contenu de la donnée.

**Modules écrivants actifs en Phase A :**

| Module | Famille produite |
|---|---|
| Module comportemental | SY1 — Comportementale |
| Module OI V1 | SY1 — Comportementale |
| Moteur décisionnel | SY3 — Décisionnelle |

**Note :** plusieurs modules peuvent partager la même famille. Deux données issues de modules distincts peuvent appartenir à la même famille. Elles constituent deux traces distinctes avec des sources et des sessions différentes — jamais une fusion (IG-I2 par trace, non par événement).

**Cas limites couverts :** CL-A1 (R4 module comportemental → SY1, malgré contenu évocateur S1) · CL-A2 (module comportemental et module OI V1, tous deux → SY1)

---

#### RF-R3 — Priorité 3 : Source visuelle (DI5 — Option B)

Une donnée provient d'une **source visuelle** si son origine primaire est une image, une capture d'écran ou tout support graphique traité par un module d'analyse visuelle.

**Résultat :** S3 — Visuelle, indépendamment du contenu extrait.

**Principe (DI5) :** la valeur mémorielle est la donnée d'origine visuelle elle-même, non le contenu qui en est extrait. Un contenu transactionnel extrait d'une capture reste classifié S3.

**Cas limite couvert :** CL-A5 (capture d'écran d'un relevé de trading analysée → S3, non S1 malgré contenu transactionnel extrait)

---

#### RF-R4 — Priorité 4 : Source annotation manuelle ou journal (DI5 — Option B)

Une donnée provient d'une **source annotation manuelle** si son origine primaire est une saisie directe de l'opérateur : note, observation, entrée de journal, réflexion personnelle.

**Résultat :** S4 — Personnelle, indépendamment du contenu rédigé.

**Principe (DI5) :** la valeur mémorielle est la voix de l'opérateur elle-même, non le sujet traité dans la note. Un contenu comportemental rédigé par l'opérateur reste classifié S4 — la note n'est pas produite par le module comportemental.

**Cas limite couvert :** CL-A6 (note de journal portant sur les patterns comportementaux de l'opérateur → S4, non SY1 — absence de module écrivant interne)

---

#### RF-R5 — Priorité 5 : Fichier structuré (DI4)

Une donnée provient d'un **fichier structuré** si son origine est un fichier de données ne relevant pas des priorités 1 à 4. La famille est déterminée par la nature intrinsèque de la donnée selon le critère DI4 :

| Nature de la donnée | Famille | Exemples |
|---|---|---|
| Événement ponctuel d'échange | S1 — Transactionnelle | Achat, vente, transfert, dépôt, retrait, exécution d'ordre |
| État de composition à un instant | S2 — Patrimoniale | Composition de portefeuille, allocation, inventaire de positions, solde total |

**Règle de coexistence :** un même fichier source peut produire des données classifiées S1 et des données classifiées S2. Le critère s'applique donnée par donnée, non fichier par fichier.

**Cas limite couvert :** CL-D4 (fichier Wallet History — lignes de trade → S1, snapshots de composition → S2)

---

#### RF-R6 — Rejet : Aucune règle satisfaite (DI2 — Option A)

Si l'application successive de RF-R1 à RF-R5 ne produit aucune famille valide dans le registre ACF V1, la donnée est rejetée à l'entrée.

**Résultat :** rejet immédiat. La donnée n'est pas ingérée. Un motif de rejet est tracé.

**Périmètre :** RF-R6 s'applique exclusivement aux données dont aucune des 13 familles ACF V1 ne décrit la nature. Les données à date absente ou non conforme (CL-C1/C2/C3) ont une famille valide — elles ne déclenchent pas RF-R6.

**Cas limite couvert :** CL-B2 (donnée hors du registre des 13 familles ACF V1)

---

### §12.4 Règles structurelles complémentaires

**RF-RC1 — Appartenance exclusive**
Toute donnée appartient à une et une seule famille. La hiérarchie séquentielle garantit cette propriété : l'évaluation s'arrête au premier critère satisfait (IG-I2).

**RF-RC2 — Déterminisme absolu**
L'application de RF-R1 à RF-R6 dans l'ordre produit toujours un résultat unique pour toute donnée : une famille ou un rejet. Aucun résultat indéterminé n'est admis (IG-I3).

**RF-RC3 — Priorité exclusive**
Une donnée satisfaisant une règle de priorité supérieure est classifiée selon cette règle. Elle ne peut pas être reclassifiée par une règle de priorité inférieure, même si elle satisfait également cette règle inférieure.

**RF-RC4 — Familles sans règle active en Phase A**
Les familles S5 · SY2 · SY4 · L1 · L2 · L3 · Référentiel ne disposent d'aucune règle RF active en Phase A. Leur intégration dans RF nécessitera une mise à jour lors de leur activation. Cas particulier : toute donnée susceptible de relever de SY4 est classifiée SY3 par RF-R2 (module décisionnel) en Phase A — la frontière SY3/SY4 sera définie lors de l'activation de SY4 (CL-A7).

---

### §12.5 Couverture des cas limites par RF

| Cas limite | Règle appliquée | Résolution |
|---|---|---|
| CL-A1 — R4 SY1 vs contenu S1 | RF-R2 (priorité 2 prime sur priorité 5) | SY1 — famille du module écrivant prime sur le contenu |
| CL-A2 — SY1 comportemental et SY1 OI V1 | RF-R2 | SY1 pour les deux modules — deux traces distinctes, sessions différentes |
| CL-A3 — Paramètres sans écrivain actif | RF-R1 | Exclusion état applicatif — hors périmètre mémoriel |
| CL-A4 — Instantané moteur vs Sauvegarde moteur | RF-R1 / RF-R2 | Instantané → exclusion état applicatif (RF-R1) · Sauvegarde → SY3 par module décisionnel (RF-R2) |
| CL-A5 — Capture d'écran vs S1 | RF-R3 (priorité 3 prime sur priorité 5) | S3 — source visuelle prime sur le contenu transactionnel extrait |
| CL-A6 — Note comportementale vs SY1 | RF-R4 | S4 — source annotation manuelle (RF-R2 non applicable : absence de module écrivant interne) |
| CL-A7 — SY3 vs SY4 future | RF-RC4 | SY3 en Phase A · frontière SY4 à documenter lors de l'activation |
| CL-B2 — Famille inconnue | RF-R6 | Rejet immédiat |

---

## §13 FB — Frontières inter-familles

**Statut :** RÉDIGÉ — 2026-07-09
**Fondé sur :** DI1 (hiérarchie séquentielle) · DI4 (frontière S1/S2) · DI5 (source prime sur contenu) · RF validé (§12) · recensement P2-1.A §11.1 et §11.4

---

### §13.1 Définition et portée

Une **frontière inter-familles** est le point où une donnée entrante pourrait être rattachée à deux familles distinctes en l'absence de règle de résolution explicite. Le composant FB documente chacun de ces points d'ambiguïté et le critère qui les résout.

FB ne redéfinit pas les règles RF. Il explicite, pour chaque couple de familles à risque, le critère conceptuel que RF applique et la raison pour laquelle ce critère est déterministe.

Cinq frontières sont documentées en Phase A. Quatre sont opérationnelles (FB-F1 · FB-F2 · FB-F3 · FB-F5). Une frontière (FB-F4 — SY3/SY4) est documentée par anticipation : SY4 étant inactive en Phase A, la frontière ne peut pas être atteinte. Elles correspondent aux cinq couples identifiés dans le recensement P2-1.A §11.1 et §11.4.

---

### §13.2 Tableau des frontières documentées

| Identifiant | Couple de familles | Règle RF | Cas fondateur |
|---|---|---|---|
| FB-F1 | SY1 / S1 | RF-R2 (priorité 2) | CL-A1 |
| FB-F2 | S3 / S1 | RF-R3 (priorité 3) | CL-A5 |
| FB-F3 | S4 / SY1 | RF-R4 (priorité 4) | CL-A6 |
| FB-F4 | SY3 / SY4 | RF-RC4 (Phase A) | CL-A7 |
| FB-F5 | S1 / S2 | RF-R5 + DI4 | CL-D4 |

---

### §13.3 Frontières détaillées

#### FB-F1 — Frontière SY1 / S1

**Risque d'ambiguïté :** une donnée produite par le module comportemental peut contenir des paramètres d'ordres de trading (valeurs numériques, horodatages, prix d'exécution). Son contenu évoque la famille S1 (Transactionnelle). Sa source — le module comportemental — appartient à la famille SY1 (Comportementale).

**Critère de résolution :** l'identité du module écrivant prime sur la nature du contenu.

- Donnée produite par un module écrivant interne identifié → RF-R2 s'applique → famille officielle du module (SY1 pour le module comportemental)
- Donnée provenant d'un fichier structuré sans module écrivant interne → RF-R5 s'applique → S1 si événement transactionnel

**Principe :** la valeur mémorielle d'une donnée comportementale réside dans sa signification pour la lecture du comportement de l'opérateur, non dans la valeur transactionnelle qu'elle porte. Le module producteur détermine cette signification.

**Règle RF :** RF-R2 (priorité 2) précède RF-R5 (priorité 5). La frontière est résolue par l'ordre hiérarchique.

**Cas fondateur :** CL-A1 — paramètres d'ordres récents classés SY1 par le module comportemental, malgré un contenu de nature transactionnelle.

---

#### FB-F2 — Frontière S3 / S1

**Risque d'ambiguïté :** une donnée extraite d'une source visuelle (capture d'écran d'un relevé de trading) peut contenir des informations transactionnelles (dates, montants, paires). Son contenu extrait évoque la famille S1. Son origine — une image analysée — appartient à la famille S3 (Visuelle).

**Critère de résolution :** la nature de la source originale prime sur la nature du contenu extrait.

- Donnée provenant d'une source visuelle → RF-R3 s'applique → S3
- Donnée provenant d'un fichier structuré (export, CSV) → RF-R5 s'applique → S1 si événement transactionnel

**Principe (DI5) :** la valeur mémorielle d'une capture d'écran est d'avoir observé la réalité visuelle à un instant donné. Le contenu extrait par analyse est un artefact de ce processus d'observation — il n'est pas l'objet mémoriel.

**Règle RF :** RF-R3 (priorité 3) précède RF-R5 (priorité 5). La frontière est résolue par l'ordre hiérarchique.

**Cas fondateur :** CL-A5 — capture d'écran d'un relevé de trading analysée → S3, non S1.

---

#### FB-F3 — Frontière S4 / SY1

**Risque d'ambiguïté :** une note rédigée par l'opérateur sur ses propres patterns comportementaux porte un contenu comportemental. Ce contenu évoque la famille SY1 (Comportementale). Mais la donnée n'est pas produite par le module comportemental — elle est produite directement par l'opérateur.

**Critère de résolution :** l'identité du producteur prime sur la nature du contenu.

- Donnée produite par l'opérateur (note, journal, annotation manuelle) → RF-R4 s'applique → S4
- Donnée produite par le module comportemental → RF-R2 s'applique → SY1

**Précision sur l'ordre hiérarchique :** RF-R2 (priorité 2) est évalué avant RF-R4 (priorité 4). Pour une annotation manuelle, RF-R2 ne se déclenche pas — il n'existe pas de module écrivant interne associé à une saisie manuelle. L'évaluation descend naturellement à RF-R4 (priorité 4), qui capture la source annotation manuelle.

**Principe (DI5) :** la valeur mémorielle d'une note de l'opérateur est d'avoir documenté sa propre réflexion. L'objet mémoriel est la voix de l'opérateur — non l'analyse comportementale que le module aurait produite sur les mêmes observations.

**Règle RF :** RF-R4 (priorité 4), applicable après non-déclenchement de RF-R2 (absence de module écrivant interne).

**Cas fondateur :** CL-A6 — note de journal portant sur les patterns comportementaux de l'opérateur → S4, non SY1.

---

#### FB-F4 — Frontière SY3 / SY4

**Risque d'ambiguïté :** certaines données de retour sur décision peuvent porter sur une décision passée de l'opérateur. Elles pourraient appartenir à SY3 (Décisionnelle — la décision elle-même) ou à SY4 (apprentissage extrait de la décision — famille inactive en Phase A).

**État en Phase A :** SY4 est inactive. La frontière SY3/SY4 n'est pas opérationnelle. Toute donnée susceptible de relever de SY4 est classifiée SY3 par RF-R2 (module décisionnel), conformément à RF-RC4.

**Critère de résolution (futur — applicable à l'activation de SY4) :**

| Famille | Critère | Nature de la donnée |
|---|---|---|
| SY3 — Décisionnelle | La décision prise | Trace de ce qui a été décidé à un instant précis — posture, action, niveau d'engagement |
| SY4 — Apprentissage | L'apprentissage extrait | Synthèse de ce qu'une décision ou un ensemble de décisions enseigne sur le comportement futur |

**Principe :** SY3 trace ce qui s'est passé. SY4 synthétise ce qu'il faut en retenir. La frontière devient opérationnelle lorsqu'un module d'apprentissage produit des synthèses distinctes des décisions brutes.

**Règle RF en Phase A :** RF-RC4 — toute donnée susceptible de relever de SY4 est classifiée SY3 jusqu'à l'activation de SY4.

**Action requise à l'activation de SY4 :** mise à jour de RF (RF-R2, RF-RC4) et de FB (FB-F4) avec le critère définitif et le module écrivant associé.

**Cas fondateur :** CL-A7 — données de retour sur décision non encore actives en Phase A.

---

#### FB-F5 — Frontière S1 / S2

**Risque d'ambiguïté :** un fichier de données source peut contenir à la fois des enregistrements de transactions (événements ponctuels d'échange) et des états du patrimoine (états de composition à un instant). Sans critère d'application par donnée, la classification serait celle du fichier entier — incorrecte pour les données qui n'appartiennent pas à la famille dominante.

**Critère de résolution (DI4) :** la nature intrinsèque de chaque donnée — événement ponctuel d'échange vs état de composition à un instant.

| Nature | Famille | Test |
|---|---|---|
| Événement ponctuel d'échange | S1 — Transactionnelle | La donnée décrit-elle une opération survenue à un instant précis ? |
| État de composition à un instant | S2 — Patrimoniale | La donnée décrit-elle la situation d'un patrimoine à un instant donné ? |

**Règle de coexistence :** le critère s'applique donnée par donnée, non fichier par fichier. Un même fichier source peut produire des traces S1 et des traces S2.

**Règle RF :** RF-R5 (priorité 5), appliquant le critère DI4 à chaque donnée individuellement.

**Cas fondateur :** CL-D4 — fichier Wallet History Binance contenant des lignes de trade (→ S1) et des snapshots de composition de portefeuille (→ S2).

---

### §13.4 Couverture des cas limites par FB

| Cas limite | Frontière | Critère de résolution |
|---|---|---|
| CL-A1 — R4 SY1 vs S1 | FB-F1 | Module écrivant interne (SY1) prime sur le contenu transactionnel |
| CL-A5 — S3 vs S1 après extraction | FB-F2 | Source visuelle (S3) prime sur le contenu extrait transactionnel |
| CL-A6 — S4 vs SY1 | FB-F3 | Producteur opérateur (S4) — RF-R2 non déclenché, RF-R4 applicable |
| CL-A7 — SY3 vs SY4 future | FB-F4 | SY3 en Phase A · critère SY4 à définir lors de l'activation |
| CL-D4 — Fichier mixte S1/S2 | FB-F5 | Événement ponctuel (S1) vs état de composition (S2) — critère par donnée |

---

## §14 EP — Exigences de provenance

**Statut :** RÉDIGÉ — 2026-07-09
**Fondé sur :** DI3 (différenciées · RV5 > O4) · RF validé (§12) · FB validé (§13) · recensement P2-1.A §11.3 et §11.4

---

### §14.1 Définition et portée

Dans Caméléon Engine, la **provenance** d'une trace canonique est l'ensemble des informations qui permettent d'identifier son origine : son producteur (source), son horodatage (date), son contexte et son identifiant de session.

Le composant EP définit les exigences minimales de provenance à l'ingestion, par famille ou groupe de familles. EP s'appuie sur la décision DI3 (Option B — différenciées) : la structure des exigences est uniforme pour toutes les familles, mais le contenu acceptable, les états formalisés autorisés et les formats de contexte sont différenciés par famille ou groupe de familles.

EP résout également la tension O4/RV5 (CL-D1) : conformément à DI3, la règle formelle RV5 prime sur l'objectif de cadrage O4. Le contexte est optionnel pour toute famille et toute ingestion.

---

### §14.2 Structure uniforme des exigences

La structure suivante s'applique à toute donnée, quelle que soit sa famille.

| Champ | Obligation | Valeur admise |
|---|---|---|
| Source | Obligatoire | Identifiant du producteur conforme à la table de provenance (LOT-P1-2.4 §4) |
| Date | Obligatoire | ISO 8601 ou état formalisé (voir §14.3) |
| Contexte | Optionnel | Format différencié par famille (voir §14.4) · RV5 > O4 |
| Session | Optionnel | Identifiant de session du module écrivant (voir §14.4) |

**Conséquences de l'absence de champ obligatoire :**
- Source absente : motif de rejet selon IG-I4 · DI2
- Date absente ou non conforme : état formalisé selon §14.3 — la trace est ingérée

**Conséquences de l'absence de champ optionnel :**
- Contexte absent : aucune conséquence · trace valide · RV5 > O4 (EP-RC3)
- Session absente : aucune conséquence · trace valide

---

### §14.3 États formalisés de date

Trois états formalisés couvrent les situations où la date ne peut pas être fournie en ISO 8601. Ces états ne déclenchent pas RF-R6 : les données concernées ont une famille valide.

| État formalisé | Libellé | Situation | Cas limite |
|---|---|---|---|
| R1 | "Non disponible" | L'information temporelle est structurellement absente de la source — aucune donnée d'horodatage n'existe | CL-C1 |
| R3 | "Non disponible" | L'information temporelle est présente dans un format non conforme à ISO 8601 et non convertible | CL-C2 |
| R4 | "Non exploitable au format canonique" | L'information temporelle est présente dans un format non conforme mais techniquement convertible en ISO 8601 | CL-C3 |

**Distinction R1 / R3 :** R1 = absence totale d'information temporelle · R3 = présence d'information temporelle dans un format inutilisable · les deux produisent le libellé "Non disponible" mais pour des raisons différentes — distinction documentée pour orienter les parsers futurs.

**Distinction R4 / R1-R3 :** R4 est normalisable par conversion. La normalisation est réservée à un lot ultérieur — le parser peut anticiper la conversion si sa capacité le permet.

---

### §14.4 Exigences différenciées par famille

#### EP-SY1 — Famille comportementale (deux sous-groupes)

SY1 regroupe deux modules écrivants distincts aux rythmes d'activité et aux sessions indépendants. Les exigences sont différenciées au niveau du module écrivant, conformément à CL-A2.

| Exigence | Module comportemental | Module OI V1 |
|---|---|---|
| Source | Module comportemental | Module OI V1 |
| Date | État formalisé R1 — datation structurellement absente | ISO 8601 ou état formalisé selon disponibilité |
| Contexte | Optionnel — peut inclure le label comportemental de la session | Optionnel — peut inclure les paramètres OI de la session |
| Session | Identifiant de session comportementale | Identifiant de session OI V1 |

**Règle de séparation :** deux données SY1 de modules distincts ne partagent jamais la même session. La session est définie par le module écrivant, non par la famille (LOT-P1-2.4 §4 · CL-A2).

---

#### EP-SY3 — Famille décisionnelle

| Exigence | Valeur |
|---|---|
| Source | Moteur décisionnel |
| Date | ISO 8601 — date de la décision produite |
| Contexte | Optionnel — peut inclure la posture, le niveau d'engagement, l'état moteur au moment de la décision |
| Session | Identifiant de session moteur |

---

#### EP-S1 — Famille transactionnelle (données de fichier structuré)

| Exigence | Valeur |
|---|---|
| Source | Identifiant de la source externe — type de plateforme ou format d'export |
| Date | Extraite du contenu du fichier source selon EP-RC2 — ISO 8601 ou état formalisé R1/R3/R4 |
| Contexte | Optionnel — peut inclure les paramètres de l'opération (type d'ordre, quantité, paire) |
| Session | Non défini — données historiques sans module écrivant interne · champ optionnel |

---

#### EP-S2 — Famille patrimoniale (données de fichier structuré)

| Exigence | Valeur |
|---|---|
| Source | Identifiant de la source externe — type de plateforme ou format d'export |
| Date | Extraite du contenu du fichier source selon EP-RC2 — ISO 8601 ou état formalisé R1/R3/R4 |
| Contexte | Optionnel — peut inclure la composition du patrimoine ou l'inventaire de positions |
| Session | Non défini — données historiques sans module écrivant interne · champ optionnel |

---

#### Familles sans exigences EP actives en Phase A

Les familles S3 · S4 · S5 · SY2 · SY4 · L1 · L2 · L3 · Référentiel sont inactives en Phase A. Leurs exigences de provenance seront définies dans EP lors de l'activation de leur module écrivant ou de leur source d'ingestion respective.

---

### §14.5 Règles de provenance complémentaires

**EP-RC1 — Unicité de la source par trace**
Une trace canonique a exactement une source. Si deux modules produisent des données sur le même événement, ce sont deux traces distinctes avec des sources distinctes — jamais une fusion de sources (IG-I2 · CL-D3).

**EP-RC2 — Date pour les données d'ingestion externe (CL-D2)**
Pour les familles S1 et S2, la date est extraite du contenu du fichier source, non fournie comme métadonnée séparée. Quatre comportements selon le format trouvé dans le contenu :

| Format trouvé | Comportement | Valeur du champ Date |
|---|---|---|
| Conforme ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SSZ) | Extraction directe | ISO 8601 |
| Epoch millisecondes | État formalisé R4 — conversion future possible | "Non exploitable au format canonique" |
| Absent | État formalisé R1 | "Non disponible" |
| Format propriétaire non convertible | État formalisé R3 | "Non disponible" |

**EP-RC3 — Résolution O4/RV5 : contexte optionnel (CL-D1)**
Le contexte est optionnel pour toute famille et toute ingestion. La hiérarchie est : règle formelle du modèle (RV5) > objectif de cadrage (O4). Un contexte absent ne déclenche ni rejet, ni état formalisé, ni avertissement. EP peut préciser pour quelles familles le contexte est fortement encouragé sans le rendre obligatoire.

---

### §14.6 Couverture des cas limites par EP

| Cas limite | Règle EP | Résolution |
|---|---|---|
| CL-C1 — Date absente (R1) | §14.3 / R1 | État formalisé "Non disponible" — trace ingérée |
| CL-C2 — Date format non conforme non convertible (R3) | §14.3 / R3 | État formalisé "Non disponible" — trace ingérée |
| CL-C3 — Date epoch ms convertible (R4) | §14.3 / R4 | État formalisé "Non exploitable au format canonique" — conversion future réservée |
| CL-D1 — Tension O4/RV5 | EP-RC3 | RV5 prime sur O4 — contexte optionnel pour toute famille et toute ingestion |
| CL-D2 — Date imbriquée dans la valeur | EP-RC2 | Quatre comportements selon format extrait : ISO 8601 / R4 / R1 / R3 |
| CL-D3 — Provenance conflictuelle | EP-RC1 | Une trace = une source · deux modules → deux traces distinctes |

---

## §15 CL — Protocole cas limites

**Statut :** RÉDIGÉ — 2026-07-09
**Fondé sur :** RF validé (§12) · EP validé (§14) · FB validé (§13) · DI2 · DI4 · recensement P2-1.A §11.2 §11.3 §11.4

---

### §15.1 Définition et portée

Le composant CL établit les protocoles applicables aux situations où la classification ou l'ingestion d'une donnée ne suit pas le chemin nominal de RF. Il couvre quatre types de traitement distincts, selon la nature du cas limite rencontré.

CL est l'unique composant de D1 qui spécifie ce qu'il faut faire (verbe d'action) plutôt que ce qui doit être établi (règle ou exigence). RF · FB · EP définissent des règles. CL définit des protocoles d'action.

Les quatre protocoles sont mutuellement exclusifs : toute donnée en situation de cas limite relève d'exactement un protocole.

---

### §15.2 Tableau des quatre protocoles

| Protocole | Type | Situation déclenchante | Résultat |
|---|---|---|---|
| CL-P1 | Exclusion hors périmètre mémoriel | Donnée satisfaisant RF-R1 (état applicatif) | Non ingérée · Non rejetée · Exclusion silencieuse |
| CL-P2 | Rejet à l'entrée | Famille inconnue (RF-R6) ou source absente (IG-I4) | Non ingérée · Motif tracé |
| CL-P3 | Ingestion avec état formalisé | Date dégradée (R1/R3/R4) ou contexte absent | Ingérée avec champ dégradé ou vide |
| CL-P4 | Traitement différé | Famille inactive dans le registre ACF V1 (CL-B1) | Non ingérée · Documentée pour activation future |

---

### §15.3 Protocoles détaillés

#### CL-P1 — Exclusion hors périmètre mémoriel

**Déclencheur :** la donnée satisfait RF-R1 — elle remplit une fonction technique de l'application (restauration, synchronisation, paramétrage) sans valeur historique pour le décideur, ou sans module écrivant actif.

**Procédure :**
- La donnée n'est pas ingérée dans la couche canonique
- Elle n'est pas rejetée au sens de CL-P2 — elle n'est pas invalide, elle est hors périmètre
- L'exclusion est silencieuse : aucun motif n'est tracé dans la couche canonique
- La donnée continue à remplir sa fonction applicative normale sans perturbation

**Distinction CL-P1 / CL-P2 :** une exclusion (CL-P1) ne signifie pas un problème — la donnée n'avait pas vocation à être mémorielle. Un rejet (CL-P2) signifie un problème d'identité ou de provenance.

**Cas couverts :** CL-A3 (slot "Paramètres" sans écrivain actif) · CL-A4 (instantané moteur pour restauration de session courante)

---

#### CL-P2 — Rejet à l'entrée

**Déclencheur :** la donnée ne peut pas être ingérée car elle viole un prérequis fondamental de la couche canonique. Deux sous-cas distincts déclenchent CL-P2.

**Sous-cas A — Famille inconnue (RF-R6 · CL-B2)**

Situation : aucun critère de la hiérarchie RF-R1 à RF-R5 ne produit une famille valide dans le registre ACF V1.

Procédure :
- Rejet immédiat
- Motif tracé : "Famille non identifiable dans le registre ACF V1"
- La donnée n'est pas conservée

**Sous-cas B — Source absente (IG-I4 · §14.2)**

Situation : la donnée ne dispose d'aucun identifiant de producteur valide conforme à la table de provenance.

Procédure :
- Rejet immédiat
- Motif tracé : "Source absente — exigence de provenance non satisfaite"
- La donnée n'est pas conservée

**Principe commun :** dans les deux sous-cas, la donnée n'est pas ingérée et aucune rétention en quarantaine n'est effectuée (DI2 — Option A). Le motif de rejet est explicitement tracé afin de permettre une correction à la source.

**Distinction CL-P2 / CL-P4 :** CL-P2 s'applique quand la famille est hors registre (inconnue). CL-P4 s'applique quand la famille est dans le registre mais inactive. Ces deux situations ne produisent pas le même protocole.

**Cas couverts :** CL-B2 (famille inconnue) · Source absente

---

#### CL-P3 — Ingestion avec état formalisé

**Déclencheur :** la donnée a une famille valide et satisfait les exigences de provenance de source, mais un ou plusieurs champs optionnels ou dégradés ne sont pas fournis en format nominal. La donnée peut néanmoins être ingérée.

CL-P3 comporte deux variantes.

**Variante A — Date dégradée (CL-C1 · CL-C2 · CL-C3 · CL-D2)**

La date ne peut pas être fournie en ISO 8601. Un état formalisé est substitué conformément à EP §14.3.

| Situation | État formalisé | Libellé |
|---|---|---|
| Date structurellement absente (R1) | R1 | "Non disponible" |
| Date présente en format non conforme non convertible (R3) | R3 | "Non disponible" |
| Date présente en format non conforme convertible (R4) | R4 | "Non exploitable au format canonique" |

Procédure commune :
- La trace est ingérée avec le champ Date contenant l'état formalisé
- Tous les autres champs (source, valeur, contexte, session) sont vérifiés et traités normalement
- Aucune information n'est perdue — la raison de la dégradation est portée par le libellé

Pour les données d'ingestion externe (S1/S2) dont la date est imbriquée dans le contenu du fichier (CL-D2), les quatre comportements selon le format extrait sont définis dans EP-RC2 et se traitent selon la même variante A.

**Variante B — Contexte absent (CL-C4)**

Le contexte est optionnel pour toute famille (RV5 > O4 · EP-RC3). Son absence n'est pas un cas limite bloquant.

Procédure :
- Le champ Contexte reste vide
- La trace est ingérée sans conséquence
- Aucun état formalisé n'est appliqué — le champ vide est le résultat nominal

Cette variante est documentée ici pour confirmer explicitement l'absence de protocole spécifique pour un contexte absent.

---

#### CL-P4 — Traitement différé

**Déclencheur :** la donnée appartient à une famille valide dans le registre ACF V1, mais cette famille est inactive en Phase A — aucun module écrivant ni source d'ingestion n'est défini pour elle (CL-B1).

**Familles concernées en Phase A :** S3 · S4 · S5 · SY2 · SY4 · L1 · L2 · L3 · Référentiel (9 familles du registre sans module actif)

**Procédure :**
- La donnée n'est pas ingérée dans la couche canonique
- Son existence est documentée pour traitement futur — la famille identifiée lui est associée sans ingestion formelle
- L'ingestion effective sera déclenchée lors de l'activation du module écrivant ou de la source d'ingestion correspondante
- La famille identifiée ne peut pas être modifiée rétroactivement sans décision doctrinale de niveau N2

**Distinction CL-P4 / CL-P1 :** CL-P1 exclut silencieusement les données hors périmètre mémoriel. CL-P4 documente explicitement les données mémorielles dont l'ingestion est différée — elles ont une valeur mémorielle future reconnue.

**Distinction CL-P4 / CL-P2 :** CL-P4 s'applique aux familles dans le registre ACF V1 (valides mais inactives). CL-P2 s'applique aux familles hors registre (inconnues). La présence dans le registre est le critère discriminant.

**Cas couvert :** CL-B1 (données correspondant à une famille inactive en Phase A)

---

### §15.4 Protocole opérationnel pour fichiers mixtes

Un fichier structuré peut contenir des données relevant de plusieurs familles dans la même séquence — notamment des enregistrements S1 (événements de trading) et des états S2 (composition de portefeuille) entremêlés. La règle de coexistence (RF-R5 · DI4 · FB-F5) impose un traitement donnée par donnée.

**Procédure :**

1. Chaque unité de donnée du fichier est traitée de façon indépendante — le fichier n'est pas une unité de classification
2. Le critère DI4 est appliqué à chaque unité : événement ponctuel d'échange → S1 · état de composition à un instant → S2
3. Chaque unité produit une trace canonique distincte avec sa propre famille
4. Les traces S1 et les traces S2 issues du même fichier sont indépendantes entre elles — IG-I5 interdit toute corrélation à l'ingestion

**Résultat :** un fichier mixte produit *n* traces dans S1 et *m* traces dans S2, traitées de façon identique à *n + m* fichiers mono-famille distincts.

**Cas couvert :** CL-D4 (fichier Wallet History contenant lignes de trade et snapshots de composition)

---

### §15.5 Couverture complète des cas limites par CL

| Cas limite | Protocole | Résultat |
|---|---|---|
| CL-A3 — Paramètres sans écrivain actif | CL-P1 | Exclusion silencieuse — hors périmètre mémoriel |
| CL-A4 — Instantané moteur | CL-P1 | Exclusion silencieuse — restauration courante ≠ trace mémorielle |
| CL-B1 — Famille inactive | CL-P4 | Traitement différé — documentée pour activation future |
| CL-B2 — Famille inconnue | CL-P2 / Sous-cas A | Rejet · motif "Famille non identifiable" |
| CL-C1 — Date absente (R1) | CL-P3 / Variante A | Ingérée · Date = "Non disponible" |
| CL-C2 — Date format non conforme non convertible (R3) | CL-P3 / Variante A | Ingérée · Date = "Non disponible" |
| CL-C3 — Date epoch ms convertible (R4) | CL-P3 / Variante A | Ingérée · Date = "Non exploitable au format canonique" |
| CL-C4 — Contexte absent | CL-P3 / Variante B | Ingérée · Contexte vide — aucun état formalisé |
| CL-D2 — Date imbriquée dans la valeur | CL-P3 / Variante A + EP-RC2 | 4 comportements selon format extrait — ISO 8601 / R4 / R1 / R3 |
| CL-D4 — Fichier mixte S1/S2 | §15.4 | n traces S1 + m traces S2 — traitement donnée par donnée |
| Source absente | CL-P2 / Sous-cas B | Rejet · motif "Source absente" |

---

## §16 Validation terrain — P2-1.D

**Statut :** RÉDIGÉ — 2026-07-09
**Fondé sur :** Corpus LOT-P1-2.1 (14 entrées) · D1 complet §12→§15 · LOT-P1-2.4 §4 · LOT-P1-2.5 (corpus réel C0 = 16 traces)

---

### §16.1 Définition et portée

La validation terrain de P2-1.D est documentaire, non logicielle. Elle vérifie que les règles de classification de la doctrine D1 (§12→§15) produisent les bonnes affectations sur le corpus canonique réel issu de LOT-P1-2.

**Périmètre :** 14 types d'entrées documentés dans LOT-P1-2.1 — 10 traces mémorielles (entrées 1→10) et 4 états applicatifs (entrées 11→14). Le corpus canonique réel validé lors de LOT-P1-2.5 comptait 16 traces : les instances supplémentaires au-delà d'une instance par type suivent les mêmes règles de classification que leur type documenté.

**Convention de lecture :**
- **Famille RF** : famille attendue après application de la hiérarchie RF-R1→R6
- **Frontière FB** : frontière active éventuelle — identifiant FB-Fx et couple de familles concerné
- **Exigences EP** : source · date · contexte · session selon §14.4
- **Protocole CL** : protocole déclenché si le chemin n'est pas nominal
- **Verdict** : PASS (classification correcte · exigences EP satisfaites · CL cohérent) ou FAIL (écart bloquant)

---

### §16.2 Corpus de référence

| Entrée | Intitulé | Type |
|---|---|---|
| 1 | Sessions comportementales | Trace mémorielle |
| 2 | Mémoire comportementale (R1) | Trace mémorielle |
| 3 | Niveau de garde comportemental (R3) | Trace mémorielle |
| 4 | Paramètres d'ordres récents (R4) | Trace mémorielle |
| 5 | Mémoire opérateur | Trace mémorielle |
| 6 | Historique des analyses opérateur | Trace mémorielle |
| 7 | Journal des décisions moteur | Trace mémorielle |
| 8 | Sauvegardes moteur | Trace mémorielle |
| 9 | Registre des importations | Trace mémorielle |
| 10 | Portefeuille | Trace mémorielle |
| 11 | Paramètres | État applicatif |
| 12 | Identité locale | État applicatif |
| 13 | État de navigation | État applicatif |
| 14 | Instantané moteur | État applicatif |

---

### §16.3 Validation des traces mémorielles (entrées 1 à 10)

---

#### Entrée 1 — Sessions comportementales

| Champ | Valeur |
|---|---|
| Famille RF | SY1 — via RF-R2 (Module d'analyse comportementale · priorité 2) |
| Frontière FB | FB-F1 (SY1/S1) — le module écrivant prime sur tout contenu transactionnel éventuel · RF-R2 > RF-R5 |
| Exigences EP | Source : Module d'analyse comportementale · Date : ISO 8601 · Contexte : optionnel (label comportemental, score, fichier analysé) · Session : identifiant de session comportementale |
| Protocole CL | Aucun — chemin nominal |
| Verdict | **PASS** |
| Justification | RF-R2 s'applique sans ambiguïté : module écrivant interne identifié → SY1. Date et source disponibles. Aucun cas limite. |

---

#### Entrée 2 — Mémoire comportementale (R1)

| Champ | Valeur |
|---|---|
| Famille RF | SY1 — via RF-R2 (Module d'analyse comportementale · priorité 2) |
| Frontière FB | FB-F1 (SY1/S1) — résolue par RF-R2 |
| Exigences EP | Source : Module d'analyse comportementale · Date : R1 "Non disponible" (absence totale d'information temporelle — §14.3) · Contexte : optionnel · Session : identifiant session comportementale |
| Protocole CL | CL-P3 Variante A — date dégradée R1 · trace ingérée avec état formalisé |
| Verdict | **PASS** |
| Justification | RF-R2 → SY1. EP-SY1/Module comportemental prévoit R1 (§14.4). CL-P3/A conforme. Cohérence doctrine ↔ corpus confirmée. |

---

#### Entrée 3 — Niveau de garde comportemental (R3)

| Champ | Valeur |
|---|---|
| Famille RF | SY1 — via RF-R2 (Module d'analyse comportementale · priorité 2) |
| Frontière FB | FB-F1 (SY1/S1) — résolue par RF-R2 |
| Exigences EP | Source : Module d'analyse comportementale · Date : R3 "Non disponible" (information temporelle présente en format non conforme non convertible — §14.3) · Contexte : optionnel · Session : identifiant session comportementale |
| Protocole CL | CL-P3 Variante A — date dégradée R3 · trace ingérée avec état formalisé |
| Verdict | **PASS** |
| Justification | Classification SY1 identique à Entrée 2. Distinction R3/R1 : information temporelle présente mais non conforme (R3) vs absence totale (R1). La doctrine distingue les deux cas dans §14.3 et §15.3. Cohérence confirmée. |

---

#### Entrée 4 — Paramètres d'ordres récents (R4)

| Champ | Valeur |
|---|---|
| Famille RF | SY1 — via RF-R2 (Module d'enregistrement des ordres récents · priorité 2) |
| Frontière FB | FB-F1 (SY1/S1) active — CL-A1 est le cas fondateur : contenu transactionnel évident (paramètres d'ordres de trading) · RF-R2 prime sur RF-R5 · règle confirmée |
| Exigences EP | Source : Module d'enregistrement des ordres récents · Date : R4 "Non exploitable au format canonique" (epoch millisecondes — §14.3) · Contexte : optionnel · Session : une mise à jour des paramètres d'ordres récents |
| Protocole CL | CL-P3 Variante A — date dégradée R4 · trace ingérée · état "Non exploitable au format canonique" · conversion future réservée |
| Verdict | **PASS** |
| Justification | CL-A1 est le cas fondateur de RF-R2 et de FB-F1 — la doctrine le résout correctement : module écrivant SY1 prime sur contenu transactionnel S1. R4 géré par §14.3 et CL-P3/A. Cohérence parfaite. |

---

#### Entrée 5 — Mémoire opérateur

| Champ | Valeur |
|---|---|
| Famille RF | SY1 — via RF-R2 (Module OI V1 · priorité 2) |
| Frontière FB | Aucune frontière active — Module OI V1 est un module écrivant interne identifié · SY1 sans ambiguïté |
| Exigences EP | Source : Module OI V1 · Date : ISO 8601 ou état formalisé selon disponibilité (§14.4/EP-SY1) · Contexte : optionnel (indicateur OI évalué, période, score) · Session : identifiant session OI V1 |
| Protocole CL | Aucun — chemin nominal |
| Verdict | **PASS** |
| Justification | RF-R2 → SY1. CL-A2 (deux modules distincts au sein de SY1) : sessions différentes, famille identique — doctrine §12.3 RF-R2 note correcte. EP-SY1 conforme. |

---

#### Entrée 6 — Historique des analyses opérateur

| Champ | Valeur |
|---|---|
| Famille RF | SY1 — via RF-R2 (Module OI V1 · priorité 2) |
| Frontière FB | Aucune frontière active — identique à Entrée 5 |
| Exigences EP | Source : Module OI V1 · Date : ISO 8601 ou état formalisé selon disponibilité · Contexte : optionnel · Session : identifiant session OI V1 |
| Protocole CL | Aucun — chemin nominal |
| Verdict | **PASS** |
| Justification | Identique à Entrée 5 pour RF et EP. Entrées 5 et 6 partagent le Module OI V1 · sessions distinctes par analyse (LOT-P1-2.4 §6.1). |

---

#### Entrée 7 — Journal des décisions moteur

| Champ | Valeur |
|---|---|
| Famille RF | SY3 — via RF-R2 (Moteur décisionnel · priorité 2) |
| Frontière FB | FB-F4 (SY3/SY4) — SY4 inactive Phase A · RF-RC4 maintient SY3 · frontière opérationnelle seulement à l'activation de SY4 |
| Exigences EP | Source : Moteur décisionnel · Date : ISO 8601 · Contexte : optionnel (posture, état marché, niveau d'engagement) · Session : identifiant soumission formulaire décisionnel |
| Protocole CL | Aucun — chemin nominal |
| Verdict | **PASS** |
| Justification | RF-R2 → SY3. EP-SY3 conforme. FB-F4 documentée par anticipation — correctement gérée par RF-RC4 en Phase A. |

---

#### Entrée 8 — Sauvegardes moteur

| Champ | Valeur |
|---|---|
| Famille RF | SY3 — via RF-R2 (Moteur décisionnel · priorité 2) |
| Frontière FB | FB-F4 (SY3/SY4) — identique à Entrée 7 · RF-RC4 |
| Exigences EP | Source : Moteur décisionnel · Date : ISO 8601 · Contexte : optionnel · Session : identifiant soumission formulaire décisionnel — commun avec Entrée 7 pour une même soumission (LOT-P1-2.4 §6.2) |
| Protocole CL | Aucun — chemin nominal |
| Verdict | **PASS** |
| Justification | RF-R2 → SY3. Distinction critique avec Entrée 14 (Instantané moteur) : Entrée 8 = capture historique intentionnelle → SY3 · Entrée 14 = restauration session courante → RF-R1 état applicatif. Frontière CL-A4 correctement résolue. |

---

#### Entrée 9 — Registre des importations

| Champ | Valeur |
|---|---|
| Famille RF | S1 — via RF-R5 (priorité 5) — ⚠ voir ÉCART E1 §16.5 |
| Frontière FB | FB-F5 (S1/S2) — un événement d'import est un événement ponctuel · DI4 : S1, non S2 · aucune ambiguïté |
| Exigences EP | Source : Module d'import · Date : ISO 8601 · Contexte : optionnel (type fichier importé, nombre d'enregistrements, résultat) · Session : une opération d'import |
| Protocole CL | Aucun — chemin nominal |
| Verdict | **PASS** |
| Justification | Classification S1 correcte via RF-R5. DI4 : import = événement ponctuel → S1. ÉCART E1 documenté en §16.5 : Module d'import est dans LOT-P1-2.4 §4 (qualifie pour RF-R2) mais absent de la table RF-R2 §12.3. Résultat correct — chemin doctrinal à préciser. |

---

#### Entrée 10 — Portefeuille

| Champ | Valeur |
|---|---|
| Famille RF | S2 — via RF-R5 (priorité 5) — ⚠ voir ÉCART E1 §16.5 |
| Frontière FB | FB-F5 (S1/S2) — la mise à jour du portefeuille est un état de composition à un instant · DI4 : S2, non S1 · aucune ambiguïté |
| Exigences EP | Source : Module portefeuille · Date : ISO 8601 · Contexte : optionnel (composition, actifs, valeur totale) · Session : une mise à jour du portefeuille |
| Protocole CL | Aucun — chemin nominal |
| Verdict | **PASS** |
| Justification | Classification S2 correcte via RF-R5. DI4 : portefeuille = état de composition à un instant → S2. ÉCART E1 (même que Entrée 9) : Module portefeuille est dans LOT-P1-2.4 §4 mais absent de la table RF-R2 §12.3. |

---

### §16.4 Validation des états applicatifs (entrées 11 à 14)

---

#### Entrée 11 — Paramètres

| Champ | Valeur |
|---|---|
| RF appliqué | RF-R1 — état applicatif : slot préparé sans écrivain actif · sans valeur historique ou réflexive pour le décideur |
| Frontière FB | Aucune |
| Exigences EP | Non applicable — exclue de la couche canonique |
| Protocole CL | CL-P1 — Exclusion silencieuse |
| Verdict | **PASS** |
| Justification | CL-A3 est le cas fondateur : slot structuré sans module écrivant actif → RF-R1 → CL-P1. Exclusion silencieuse conforme. |

---

#### Entrée 12 — Identité locale

| Champ | Valeur |
|---|---|
| RF appliqué | RF-R1 — état applicatif : donnée d'authentification à valeur fonctionnelle uniquement · aucune valeur historique pour le décideur |
| Frontière FB | Aucune |
| Exigences EP | Non applicable |
| Protocole CL | CL-P1 — Exclusion silencieuse |
| Verdict | **PASS** |
| Justification | RF-R1 : aucune valeur réflexive ou décisionnelle. Aucun module écrivant mémoriel associé. CL-P1 conforme. |

---

#### Entrée 13 — État de navigation

| Champ | Valeur |
|---|---|
| RF appliqué | RF-R1 — état applicatif : état courant de l'interface (onglet actif, panneaux ouverts) · valeur contextuelle et transitoire |
| Frontière FB | Aucune |
| Exigences EP | Non applicable |
| Protocole CL | CL-P1 — Exclusion silencieuse |
| Verdict | **PASS** |
| Justification | RF-R1 : valeur fonctionnelle à un instant donné · aucune valeur historique. CL-P1 conforme. |

---

#### Entrée 14 — Instantané moteur

| Champ | Valeur |
|---|---|
| RF appliqué | RF-R1 — état applicatif : capture pour restauration de session courante · valeur contextuelle sans portée historique |
| Frontière FB | Aucune |
| Exigences EP | Non applicable |
| Protocole CL | CL-P1 — Exclusion silencieuse |
| Verdict | **PASS** |
| Justification | CL-A4 est le cas fondateur : même contenu que Sauvegardes moteur (Entrée 8), intention opposée. Entrée 14 = restauration session courante → RF-R1 état applicatif. Entrée 8 = capture historique intentionnelle → RF-R2 → SY3. Le critère décisif est l'intention de la donnée, documenté dans RF-R1 §12.3. CL-P1 conforme. |

---

### §16.5 Écart détecté

**ÉCART E1 — Table RF-R2 §12.3 incomplète**

| Champ | Valeur |
|---|---|
| Identifiant | E1 |
| Sévérité | Mineure — résultat de classification inchangé |
| Entrées concernées | Entrée 9 (Registre des importations) · Entrée 10 (Portefeuille) |
| Nature de l'écart | RF-R2 §12.3 définit un module écrivant interne comme "un composant de Caméléon Engine dont la famille officielle est inscrite dans la table de provenance (LOT-P1-2.4 §4)". LOT-P1-2.4 §4.3 inscrit Module d'import → S1. LOT-P1-2.4 §4.4 inscrit Module portefeuille → S2. Ces deux modules satisfont donc la définition de RF-R2. La table RF-R2 §12.3 ne les liste pas — elle ne couvre que Module comportemental · Module OI V1 · Moteur décisionnel. |
| Impact résultat | Aucun : la classification S1 (Entrée 9) et S2 (Entrée 10) est correcte via RF-R5. RF-R2 aurait produit le même résultat en priorité 2. |
| Impact doctrine | La table RF-R2 est incomplète. Un praticien appliquant la doctrine à la lettre ne détecte pas Module d'import et Module portefeuille comme modules RF-R2 et atteint RF-R5 par défaut. Le résultat reste déterministe et correct mais le niveau de priorité effectif (2 vs 5) diffère de ce que la doctrine devrait prescrire. |
| Correction proposée | Ajout de deux lignes dans la table RF-R2 §12.3 : Module d'import → S1 — Transactionnelle · Module portefeuille → S2 — Patrimoniale. |
| Statut | Documenté — correction soumise à validation opérateur · aucune modification sans décision explicite |

---

### §16.6 Synthèse globale

| Entrée | Famille attendue | Verdict | CL déclenché |
|---|---|---|---|
| 1 — Sessions comportementales | SY1 | PASS | Aucun |
| 2 — Mémoire comportementale (R1) | SY1 | PASS | CL-P3/A |
| 3 — Niveau de garde comportemental (R3) | SY1 | PASS | CL-P3/A |
| 4 — Paramètres d'ordres récents (R4) | SY1 | PASS | CL-P3/A |
| 5 — Mémoire opérateur | SY1 | PASS | Aucun |
| 6 — Historique des analyses opérateur | SY1 | PASS | Aucun |
| 7 — Journal des décisions moteur | SY3 | PASS | Aucun |
| 8 — Sauvegardes moteur | SY3 | PASS | Aucun |
| 9 — Registre des importations | S1 | PASS ⚠E1 | Aucun |
| 10 — Portefeuille | S2 | PASS ⚠E1 | Aucun |
| 11 — Paramètres | État applicatif | PASS | CL-P1 |
| 12 — Identité locale | État applicatif | PASS | CL-P1 |
| 13 — État de navigation | État applicatif | PASS | CL-P1 |
| 14 — Instantané moteur | État applicatif | PASS | CL-P1 |

**Résultat :** 14/14 PASS · 1 écart mineur documenté (E1) · aucun FAIL.

**Couverture CV1→CV5 :**

| Critère | Couverture sur ce corpus | Verdict |
|---|---|---|
| CV1 — Familles actives Phase A | SY1 (6 entrées) · SY3 (2 entrées) · S1 (1 entrée) · S2 (1 entrée) — toutes couvertes | ✓ |
| CV2 — Déterminisme | Aucune ambiguïté non résolue sur 14 entrées — un seul résultat par entrée | ✓ |
| CV3 — Frontières documentées | FB-F1 (SY1/S1) active — Entrée 4 · FB-F4 (SY3/SY4) documentée — Entrées 7·8 · FB-F5 (S1/S2) confirmée — Entrées 9·10 · FB-F2 (S3/S1) et FB-F3 (S4/SY1) non sollicitées sur ce corpus (S3·S4 inactives Phase A — aucune entrée concernée) | ✓ |
| CV4 — Exigences EP cohérentes | Sources officielles LOT-P1-2.4 §4 appliquées correctement · R1/R3/R4 traités selon §14.3 · RV5 > O4 respecté | ✓ |
| CV5 — Protocole CL opérationnel | CL-P1 déclenché (4 entrées) · CL-P3/A déclenché (3 entrées) · CL-P2 et CL-P4 non sollicités sur ce corpus (aucune famille inconnue ni inactive parmi les 14 entrées) | ✓ |

**Verdict P2-1.D :** VALIDÉ — doctrine D1 cohérente avec le corpus canonique réel · ÉCART E1 documenté pour décision opérateur · CV1→CV5 satisfaits.
