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

## §5 Décisions à trancher

Cinq décisions structurantes doivent être tranchées dans ce lot avant que la doctrine puisse être rédigée.

| Identifiant | Question | Options |
|---|---|---|
| DI1 | La classification est-elle séquentielle (hiérarchie de règles) ou parallèle (critères indépendants évalués simultanément) ? | A — Séquentielle (ordre de priorité fixe) · B — Parallèle (ensemble de critères, résolution en cas de conflit) |
| DI2 | Une donnée non classifiable est-elle rejetée à l'entrée ou mise en quarantaine pour traitement différé ? | A — Rejet immédiat (donnée ignorée) · B — Quarantaine (donnée préservée, traitement différé) |
| DI3 | Les exigences de provenance sont-elles identiques pour toutes les familles ou différenciées par famille ? | A — Uniformes (même règle pour toutes les familles) · B — Différenciées (règles propres par famille ou groupe de familles) |
| DI4 | Quels sont les critères de frontière entre la famille transactionnelle (S1) et la famille patrimoniale (S2) ? | À définir lors de la rédaction de la doctrine |
| DI5 | Les données de sources annotées (S3 — annotation manuelle) et de sources synthétiques (S4 — synthèse externe) requièrent-elles un traitement de classification particulier ? | A — Traitement standard (mêmes règles que S1/S2) · B — Traitement spécifique (règles complémentaires pour S3/S4) |

Les décisions DI1 à DI3 et DI5 sont tranchées par les options ci-dessus ou par la rédaction de la doctrine dans §12 à §15. La décision DI4 est résolue par le composant FB (frontières inter-familles).

---

## §6 Invariants

Les invariants suivants sont actifs dès l'ouverture de ce lot. Aucune règle de la doctrine d'ingestion ne peut les violer.

| Identifiant | Invariant |
|---|---|
| IG-I1 | **Conformité au modèle canonique** — toute donnée acceptée à l'ingestion doit être représentable comme une trace canonique conforme à LOT-P1-2.1 (6 champs : famille · source · date · valeur · contexte optionnel · session optionnelle) |
| IG-I2 | **Appartenance exclusive** — toute donnée appartient à une et une seule famille ACF V1. L'appartenance multiple est interdite |
| IG-I3 | **Classification par règle** — l'affectation à une famille résulte d'une règle déterministe, jamais d'une inférence probabiliste ou d'un jugement contextuel |
| IG-I4 | **Provenance obligatoire** — toute donnée ingérée doit avoir une source identifiable conforme à la doctrine de provenance LOT-P1-2.4. L'absence de source est un motif de rejet ou de quarantaine selon DI2 |
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
| DI2 — Rejet vs quarantaine | CL-C1 à CL-C3 montrent que P1 a toujours préféré ingérer avec état formalisé plutôt que rejeter. CL-B1 suggère un traitement distinct pour famille inactive (quarantaine possible) vs famille inconnue (rejet RV1). Une politique mixte est probable |
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
