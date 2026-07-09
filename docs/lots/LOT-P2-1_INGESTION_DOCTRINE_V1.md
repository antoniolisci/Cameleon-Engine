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

Les décisions DI1 à DI3 et DI5 sont tranchées par les options ci-dessus ou par la rédaction de la doctrine dans §11 à §14. La décision DI4 est résolue par le composant FB (frontières inter-familles).

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
| P2-1.C | Rédaction des quatre composants RF · FB · EP · CL | Doctrine D1 dans §11 à §14 |
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
