# LOT-P2-2 — Parser S1 · Fichiers transactionnels V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-2 |
| Intitulé | Parser S1 · Fichiers transactionnels V1 |
| Programme | P2 — Ingestion des données |
| Phase Roadmap V1 | A |
| Type | Technique — Parser d'ingestion |
| Document officiel | `docs/lots/LOT-P2-2_PARSER_S1_V1.md` |
| Statut | EN COURS — Cadrage V1 |
| Date d'ouverture | 2026-07-09 |
| Prérequis | LOT-P2-1 CLOS · LOT-P1-2 CLOS |

---

## §1 Mission

LOT-P2-2 implémente le premier parser d'ingestion canonique de Caméléon Engine : **transformer un fichier transactionnel structuré en traces S1 persistées dans la couche canonique**, conformément à la doctrine LOT-P2-1.

Ce lot couvre exclusivement les fichiers Binance spot déjà validés (TRADE_HISTORY et ORDER_HISTORY, formats CSV et PDF), qui constituent le seul périmètre S1 formellement documenté en Phase A. Il ne produit aucune analyse comportementale, aucune corrélation inter-familles, aucune interface de consultation du corpus.

LOT-P2-2 est la première implémentation technique du Programme P2. Son livrable unique est un module d'ingestion capable d'écrire des traces S1 valides dans la couche canonique à partir d'un fichier importé.

---

## §2 Prérequis

| Document | Rôle dans ce lot |
|---|---|
| LOT-P2-1 — Doctrine d'ingestion V1 | Règles RF-R5 (classification fichier structuré → S1/S2) · FB-F5 (frontière S1/S2 par ligne) · EP-S1 (exigences de provenance S1) · CL-P3 (cas date formalisé) · DI4 (S1 = événement ponctuel) |
| LOT-P1-2.1 — Modèle canonique de trace V1 | Structure des 4 champs obligatoires d'une trace S1 : famille · source · date · contexte |
| LOT-P1-2.2 — Couche de persistance locale V1 | Couche d'écriture canonique (`canonical-store.js`) utilisée par le parser S1 |
| LOT-P1-2.3 — Indexation par famille, date et session | Index triple-axe utilisé pour retrouver les traces S1 après ingestion |
| LOT-P1-2.4 — Doctrine de provenance V1 | Source officielle S1 = "Module d'import" · session S1 = une opération d'import · contexte S1 = type de fichier · nombre d'enregistrements · résultat |
| PDF Import V1 (module comportemental) | Formats Binance validés : CSV TRADE_HISTORY (7 colonnes) · CSV ORDER_HISTORY (12 colonnes) · PDF TRADE_HISTORY · PDF ORDER_HISTORY — référence documentaire sur les structures de fichiers |

---

## §3 Périmètre S1 — Phase A

### §3.1 Définition S1 applicable

Selon DI4 (LOT-P2-1 §5) : **S1 = événement ponctuel d'échange**. Une trace S1 représente un fait transactionnel discret : un trade exécuté, un ordre rempli à une date précise. Elle n'exprime pas un état composé ni une vue agrégée du patrimoine.

### §3.2 Sources incluses

| Source | Format | Critère d'inclusion S1 |
|---|---|---|
| Binance TRADE_HISTORY | CSV · PDF | Chaque ligne = un trade exécuté → une trace S1 |
| Binance ORDER_HISTORY | CSV · PDF | Chaque ligne dont le statut est FILLED = un ordre exécuté → une trace S1 |

### §3.3 Sources exclues

| Source | Raison d'exclusion |
|---|---|
| ORDER_HISTORY — lignes NEW | Ordre non exécuté : aucun événement transactionnel réalisé. Hors périmètre S1 par définition (DI4). Exclu sans écriture canonique. |
| ORDER_HISTORY — lignes CANCELED | Ordre annulé avant exécution : aucun événement transactionnel réalisé. Hors périmètre S1 par définition (DI4). Exclu sans écriture canonique. |
| Dépôts / retraits / transferts Binance | Format non validé en Phase A. Aucun parser existant. Périmètre Phase B+. |
| Snapshot patrimonial / portefeuille | Famille S2, pas S1. Frontière FB-F5 (DI4). Couvert par LOT-P2-3. |
| Tout fichier de format non reconnu | RF-R6 : rejet immédiat — aucune règle de classification applicable. |

### §3.4 Frontière S1 / S2

Un fichier TRADE_HISTORY produit uniquement des traces S1 — chaque ligne est un événement ponctuel. Le critère S1 est appliqué **ligne par ligne**, conformément à FB-F5 (LOT-P2-1 §13). Un fichier qui contiendrait à la fois des données S1 et des données S2 traiterait chaque ligne selon son critère propre.

---

## §4 Décisions

### §4.1 Décisions tranchées par la doctrine

| ID | Question | Décision | Source |
|---|---|---|---|
| DT-1 | Granularité de la trace S1 : une trace par ligne importée ou une trace d'import agrégée par fichier ? | **Tranchée — Option A : une trace S1 par ligne transactionnelle exécutée.** DI4 pose S1 = événement ponctuel. Une trace agrégée par fichier constituerait une trace S2 de nature ou une violation directe de DI4. Aucune délibération requise. | LOT-P2-1 DI4 · RF-R5 |

### §4.2 Décisions à trancher dans ce lot

| ID | Question | Options | Enjeu |
|---|---|---|---|
| DT-2 | Déduplication : comment éviter qu'un même fichier importé deux fois produise deux fois les mêmes traces S1 ? | A — Empreinte par ligne (hash des champs clés) / B — Empreinte par fichier (hash du contenu total) / C — Aucune déduplication en Phase A | Intégrité du corpus S1 |
| DT-3 | Relation avec l'infrastructure comportementale existante (parser.js, binance_spot.js, format-detector.js, pdf-normalizer.js) : le parser S1 la réutilise-t-il ou est-il indépendant ? | A — Réutilisation directe des fonctions existantes / B — Couche d'adaptateur au-dessus / C — Implémentation indépendante dans le module d'ingestion | Couplage architectural · isolation du module d'ingestion |
| DT-4 | Interface de déclenchement : le parser S1 est-il accessible depuis une interface dédiée ou déclenché depuis l'UI existante d'import Binance ? | A — Réutilise l'UI existante (onglet Comportement) / B — Nouvelle interface dans l'onglet Mémoire / C — Déclenchement automatique après import comportemental | UX · séparation des responsabilités |
| DT-5 | Date de la trace d'import S1 (champ Date de la trace — Entrée 9) : date d'exécution de l'opération d'import ou valeur extraite des données du fichier ? | A — Date d'import (now) / B — Plage min/max des dates du fichier / C — Date du dernier enregistrement importé | Cohérence EP-S1 · alignement LOT-P1-2.1 Entrée 9 |
| DT-C1 | Point d'entrée de persistance pour les traces S1 : `writeCanonicalTrace` ne permet pas de fournir la date extraite per EP-RC2 (DT-5) · `writeMigratedTrace` l'autorise mais est restreinte à la migration — quelle solution retenir ? | A — Utiliser `writeMigratedTrace` en levant la restriction documentaire / B — Créer une nouvelle fonction `writeIngestedTrace(entry)` dans `canonical-store.js` / C — Modifier `writeCanonicalTrace` pour accepter une date optionnelle | Cohérence DT-5 · clarté sémantique migration / ingestion · stabilité du contrat de la couche canonique |

---

## §5 Invariants

Ces règles sont non négociables. Elles découlent directement de la doctrine LOT-P2-1 et des fondations LOT-P1-2. Aucune implémentation ne peut les contredire.

| Invariant | Source | Règle |
|---|---|---|
| INV-1 | RF-R5 · DI4 | Chaque ligne TRADE_HISTORY exécutée constitue un événement S1 distinct. Pas d'agrégation. |
| INV-2 | RF-R6 | Toute ligne non classifiable S1 est rejetée immédiatement. Pas d'ingestion silencieuse. |
| INV-3 | FB-F5 | Le critère S1 est appliqué ligne par ligne, pas au fichier. |
| INV-4 | EP-S1 | Chaque trace S1 contient : famille = S1 · source = identifiant externe du fichier · date = extraite du contenu per EP-RC2 · session = identifiant unique de l'opération d'import. |
| INV-5 | EP-RC2 | Quatre comportements de date formalisés : ISO 8601 direct / R4 "Non exploitable au format canonique" / R1 "Non disponible" (absent) / R3 "Non disponible" (non conforme). Aucun cas intermédiaire admis. |
| INV-6 | CL-P3 Variante A | Une trace dont la date est R1, R3 ou R4 est ingérée avec l'état formalisé — elle n'est pas rejetée pour cause de date manquante. |
| INV-7 | RF-R2 · LOT-P1-2.4 §4.3 | Source de la trace = "Module d'import" (module écrivant officiel Phase A pour S1). |
| INV-8 | LOT-P1-2.4 §7.4 | Contexte optionnel de la trace : type de fichier importé · nombre d'enregistrements · résultat de l'import. |
| INV-9 | LOT-P1-2.4 §6.3 · DT-2 | Chaque ingestion autorisée produit une session distincte. Une source déjà enregistrée dans le registre d'ingestion est bloquée avant création d'une nouvelle session. |

---

## §6 Stratégie de développement

### §6.1 Séquençage des micro-lots

| Micro-lot | Type | Mission |
|---|---|---|
| **P2-2.A** — Modèle de trace S1 | Contrat | Définir la structure exacte d'une trace S1 : 6 dimensions · valeurs concrètes par format (TRADE_HISTORY CSV · ORDER_HISTORY CSV · TRADE_HISTORY PDF · ORDER_HISTORY PDF). Trancher DT-2 et DT-5. |
| **P2-2.B** — Logique de classification et d'extraction | Contrat | Définir les règles d'exécution selon l'architecture S1 Core / Adaptateur : qualification générique (3 conditions) · algorithme EP-RC2 (5 tests) · règle RF-R6 · mapping Binance Phase A. Trancher DT-3. |
| **P2-2.C** — Persistance dans la couche canonique | Contrat | Définir le contrat de persistance entre le parser S1 et la couche canonique : `writeIngestedTrace` · registre `CE_ingestion_registry_v1` · séquence de session · rapport. Trancher DT-C1. |
| **P2-2.D** — Interface de déclenchement | Contrat | Définir le pipeline d'ingestion et l'interface de déclenchement : `ingest(descriptor)` · registre des adaptateurs · contrat générique (6 capacités) · séquence d'orchestration 11 étapes. Trancher DT-4. |
| **P2-2.E** — Implémentation technique des contrats A–D | Implémentation | Implémenter les contrats A–D dans le module d'ingestion : `writeIngestedTrace` dans la couche canonique · Core `ingest(descriptor)` · registre des adaptateurs · Adaptateur Binance Phase A · registre `CE_ingestion_registry_v1` · interface opérateur dans l'onglet Mémoire. |
| **P2-2.F** — Validation terrain | Validation | Protocole de validation complet sur fichiers réels Binance (CSV + PDF · TRADE_HISTORY + ORDER_HISTORY). Vérification des traces S1 dans le corpus · des rejets · des états de date. Tests de régression LOT-P1-2 et module comportemental. |

### §6.2 Contrainte architecturale

Le parser S1 appartient au **module d'ingestion**, distinct du module comportemental. Son périmètre est exclusivement de produire des traces canoniques S1. Il ne calcule pas de scores comportementaux, ne produit pas d'analyses, ne modifie pas l'état du moteur décisionnel.

L'isolation est symétrique à celle du module comportemental : le parser S1 écrit dans la couche canonique et n'émet aucun signal vers les autres modules.

### §6.3 Rapport à l'infrastructure comportementale existante

L'infrastructure du module comportemental (parser.js · binance_spot.js · format-detector.js · pdf-normalizer.js) a été conçue pour produire des objets de trade destinés au scoring comportemental. Elle constitue une **référence documentaire** sur les formats Binance valides en Phase A, pas un prérequis technique du parser S1. La décision DT-3 tranche si et comment cette infrastructure est réutilisée dans le module d'ingestion.

---

## §7 Critères de validation

### §7.1 Critères fonctionnels

| CV | Critère | Condition de satisfaction |
|---|---|---|
| CV-1 | Import CSV TRADE_HISTORY Binance | Chaque ligne produit une trace S1 valide avec les 4 champs canoniques correctement renseignés. |
| CV-2 | Import CSV ORDER_HISTORY Binance | Seules les lignes FILLED produisent une trace S1. Les lignes NEW et CANCELED sont exclues avec journal. |
| CV-3 | Import PDF TRADE_HISTORY | Comportement identique au CSV — même nombre de traces S1 produites pour un fichier équivalent. |
| CV-4 | Import PDF ORDER_HISTORY | Comportement identique au CSV — FILLED uniquement. |
| CV-5 | Extraction de date EP-RC2 | Les 4 cas de date (ISO 8601 / R4 / R1 / R3) produisent l'état formalisé correct dans la trace. |
| CV-6 | Rejet RF-R6 | Tout fichier de format non reconnu est rejeté sans écriture canonique (niveau fichier). Toute ligne ne satisfaisant pas les conditions minimales produit un rejet documenté, pas une ingestion silencieuse (niveau ligne). |
| CV-7 | Persistance canonique | Les traces S1 apparaissent dans le corpus canonique après import et sont consultables par famille · session. |
| CV-8 | Déduplication et session | Premier import : une session est créée · les traces S1 sont écrites · la source est enregistrée dans le registre. Second import du même fichier : l'import est bloqué par déduplication · aucune session créée · aucune trace écrite · registre inchangé. |

### §7.2 Critères de robustesse

| CB | Critère | Condition de satisfaction |
|---|---|---|
| CB-1 | Zéro régression LOT-P1-2 | Les traces SY1 · SY3 · S2 existantes restent intactes après un import S1. |
| CB-2 | Zéro régression module comportemental | L'import comportemental existant reste fonctionnel et indépendant du parser S1. |
| CB-3 | Fichier vide ou format inconnu | Aucune trace écrite. Retour d'erreur explicite. Aucune exception non gérée. |

---

## §8 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | Tous les micro-lots P2-2.A à P2-2.F validés |
| Condition 2 | CV-1 à CV-8 satisfaits en test terrain sur fichiers réels |
| Condition 3 | CB-1 à CB-3 satisfaits |
| Condition 4 | Toutes les décisions structurantes du lot tranchées et documentées : DT-2 · DT-3 · DT-4 · DT-5 · DT-C1 |
| Condition 5 | DQC V2 CAS A sur le document de lot |
| Condition 6 | Décision opérateur explicite de clôture |
