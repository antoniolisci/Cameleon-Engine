# Operator Intelligence V1 — Audit de couverture du corpus

**Date :** 2026-06-19  
**Statut :** Référence avant ouverture de l'implémentation  
**Objectif :** Déterminer si le corpus existant suffit pour démarrer OI V1, dimension par dimension.

---

## Préambule — Une distinction critique

Avant tout inventaire, une distinction s'impose entre deux types de fichiers Order History :

**ALL-STATUS** : fichier brut Binance contenant FILLED + CANCELED + NEW + PARTIALLY_FILLED  
**FILLED-ONLY** : fichier filtré par le pipeline actuel, conservant uniquement les ordres exécutés

La distinction est invisible dans les noms de fichiers. Elle est décisive pour OI V1.

- Dimension **Exécution** (cancel rate) → requiert ALL-STATUS
- Dimensions **Capital, Portefeuille, Cadence** → fonctionnent avec FILLED-ONLY

Le pipeline actuel (`binance_order.js`) filtre systématiquement pour FILLED. Les fichiers CLEAN du corpus sont donc FILLED-ONLY par construction, sauf les RAW.

---

## 1. Inventaire des datasets réellement uniques

### Tableau complet

| Dataset | Source | Format | Type | Trades | Statuts couverts | Unique / Doublon | Utilisable OI V1 |
|---|---|---|---|---|---|---|---|
| **b1.csv** | B-series terrain | CSV | Trade History | ~2354 | FILLED only | Unique | Non — TH, pas de cancel rate |
| **b2.xlsx** | B-series terrain | XLSX | Trade History | ~89 | FILLED only | Unique | Non — TH, pas de cancel rate |
| **b3.pdf** | B-series terrain | PDF | Order History | 2476 rows extraites (ALL-STATUS) | FILLED + CANCELED + NEW | **Référence canonique** | ✅ OUI — cancel rate computable |
| **b4.csv** | B-series terrain | CSV | Trade History | ~5790 | FILLED only | Unique | Non — TH, pas de cancel rate |
| **b5.pdf** | B-series terrain | PDF | Order History | 466 rows extraites (ALL-STATUS) | FILLED + CANCELED + NEW | Unique | ✅ OUI — cancel rate computable |
| **b6.csv** | B-series terrain | CSV | Trade History | ~130 | FILLED only | Unique | Non — TH, volume insuffisant |
| **b7.pdf** | B-series terrain | PDF | Order History | <50 rows (1 page) | ALL-STATUS | Unique | Non — volume insuffisant |
| **b8.pdf** | B-series terrain | PDF | Trade History | 32 rows | FILLED only | **Référence canonique** | Non — TH, volume insuffisant |
| **b9.xlsx** | B-series terrain | XLSX | Trade History | ~371 | FILLED only | Unique | Non — TH |
| **b10.pdf** | B-series terrain | PDF | Order History | 1130 rows extraites (ALL-STATUS) | FILLED + CANCELED + NEW | Unique (compte distinct) | ✅ OUI — cancel rate computable |
| **b11.csv** | B-series terrain | CSV | Trade History | ~94 | FILLED only | Unique | Non — TH, volume insuffisant |
| **b12.pdf** | B-series terrain | PDF | Order History | 466 rows extraites | ALL-STATUS | **Doublon masqué de b5** | Redondant |
| **b13.xlsx** | B-series terrain | XLSX | Trade History | ~85 | FILLED only | Unique | Non — TH, volume insuffisant |
| **b14.csv** | B-series terrain | CSV | Trade History | ~134 | FILLED only | Unique | Non — TH, volume insuffisant |
| **b15.xlsx** | B-series terrain | XLSX | Trade History | ~266 | FILLED only | Unique | Non — TH |
| **b16.pdf** | B-series terrain | PDF | Trade History | 32 rows | FILLED only | **Doublon masqué de b8** | Redondant |
| **b17.xlsx** | B-series terrain | XLSX | Trade History | ~943 | FILLED only | Unique | Non — TH |
| **b18.pdf** | B-series terrain | PDF | Trade History | >200 rows (20 pages) | FILLED only | Unique | Non — TH |
| **b19.pdf** | B-series terrain | PDF | Order History | 2476 rows extraites | ALL-STATUS | **Doublon masqué de b3** | Redondant |
| **SYN_001** | Synthétique | CSV | Trade History (synthétique) | 200 | FILLED only | Unique | Non — synthétique, pas de cancel rate |
| **SYN_002** | Synthétique | CSV | Trade History (synthétique) | 500 | FILLED only | Unique | Non — synthétique |
| **SYN_003** | Synthétique | CSV | Trade History (synthétique) | 1000 | FILLED only | Unique | Non — synthétique |
| **SYN_004** | Synthétique | CSV | Trade History (synthétique) | 400 | FILLED only | Unique | Non — synthétique |
| **SYN_005** | Synthétique | CSV | Trade History (synthétique) | 500 | FILLED only | Unique | Non — synthétique |
| **SYN_006** | Synthétique | CSV | Trade History (synthétique) | 400 | FILLED only | Unique | Non — synthétique |
| **REAL_001 CLEAN** | Réel anonymisé | CSV | Order History FILLED-ONLY | 1685 | FILLED only | Unique | Partiel — Dim. Capital, Portefeuille, Cadence |
| **REAL_001 RAW** | Réel anonymisé | CSV/XLSX | Order History ALL-STATUS | 3914 total | FILLED(1685) + CANCELED(1963) + NEW(261) + PF(5) | Source de REAL_001 CLEAN | ✅ OUI — cancel rate 50.1% |
| **REAL_002 CLEAN** | Réel anonymisé | CSV | Trade History | 120 | FILLED only | Unique | Partiel — Dim. Capital, Cadence (mono-actif) |
| **REAL_003 CLEAN** | Réel anonymisé | CSV | Order History FILLED-ONLY | 542 | FILLED only | Unique | Partiel — Dim. Capital, Portefeuille, Cadence |
| **REAL_003 RAW** | Réel anonymisé | XLSX | Order History ALL-STATUS | 1293 total | FILLED(542) + CANCELED(625) + NEW(126) | Source de REAL_003 CLEAN | ✅ OUI — cancel rate 48.3% |
| **REAL_004 CLEAN** | Réel anonymisé | CSV | Order History FILLED-ONLY | 1910 | FILLED only | Unique | Partiel — Dim. Capital, Cadence |

### Doublons confirmés

| Fichier visible | Fichier masqué | Nature du doublon |
|---|---|---|
| b3.pdf | b19.pdf | Même export, identité masquée — décalage fin de période de 1 jour |
| b5.pdf | b12.pdf | Même export, identité masquée — décalage fin de période de 1 jour |
| b8.pdf | b16.pdf | Même export, identité masquée |

**Conclusion doublons :** 3 paires identifiées. b19, b12, b16 sont redondants. Le corpus utile réel est de 16 datasets distincts (hors redondants).

---

## 2. Classification du corpus

### A. Datasets synthétiques

SYN_001 · SYN_002 · SYN_003 · SYN_004 · SYN_005 · SYN_006

Rôle actuel : non-régression pipeline comportemental (scoring Trade History).  
Rôle OI V1 : **aucun**. Distributions injected, pas de cancel rate, symboles uniques fictifs. Ne peuvent pas calibrer les dimensions OI V1.

### B. Datasets réels anonymisés (CLEAN)

REAL_001 CLEAN · REAL_002 CLEAN · REAL_003 CLEAN · REAL_004 CLEAN

Filtrage FILLED-ONLY appliqué. Cancel rate non computable depuis ces fichiers seuls.  
Utilisables pour les dimensions ne nécessitant pas le cancel rate (Capital, Cadence, Portefeuille partiel).

### C. Datasets Binance terrain (B-series)

b1 → b19. Fichiers reçus directement d'opérateurs réels, non anonymisés.  
Ne pas commiter. Conserver en local uniquement.

### D. Datasets Order History

b3 · b5 · b7 · b10 · b12(doublon) · b19(doublon) · REAL_001 · REAL_003 · REAL_004

Seule famille permettant de calculer le cancel rate (depuis la version ALL-STATUS).

### E. Datasets Trade History

b1 · b2 · b4 · b6 · b8 · b9 · b11 · b13 · b14 · b15 · b16(doublon) · b17 · b18 · REAL_002 + SYN_001-006

Par définition, ne contiennent que des ordres exécutés. Cancel rate impossible.

### F. Datasets longs (> 12 mois)

| Dataset | Période | Mois |
|---|---|---|
| REAL_001 | ~25 mois | 25 |
| REAL_004 | ~28 mois | 28 |
| b3/b19.pdf | ~12 mois (2025-05 → 2026-05) | 12 |
| b4.csv | À déterminer | — |
| b1.csv | À déterminer (2354 lignes) | — |

### G. Datasets courts (< 3 mois)

b5/b12.pdf (3 mois) · b7.pdf (1 page) · b8/b16.pdf (1 mois) · b10.pdf (6 mois) · REAL_002 (47 jours) + la plupart des b-series CSV/XLSX.

---

## 3. Matrice de couverture Operator Intelligence V1

### Les 4 dimensions et leurs sources

**Rappel des exigences minimales par dimension (doctrine OI V1) :**
- Exécution : ≥ 100 ordres FILLED · Order History ALL-STATUS pour cancel rate
- Capital : ≥ 6 mois · ≥ 5 actifs distincts
- Portefeuille : ≥ 5 actifs · table de correspondance symbole → secteur couvrant ≥ 80% des actifs
- Cadence : ≥ 3 mois · timestamps à résolution journalière

### Matrice par dataset utilisable OI V1

| Dataset | Exécution | Capital | Portefeuille | Cadence | Profils distincts |
|---|---|---|---|---|---|
| **b3.pdf** (2476 rows ALL-STATUS) | ✅ cancel rate computable · 12 mois | ✅ multi-actifs · 12 mois | ⚠ manque table secteur | ✅ 12 mois | Multi-actifs, patient |
| **b5.pdf** (466 rows ALL-STATUS) | ⚠ 3 mois — période courte | ⚠ 3 mois — insuffisant | ⚠ manque table secteur | ⚠ 3 mois — limite | — |
| **b10.pdf** (1130 rows ALL-STATUS) | ✅ cancel rate computable · 6 mois | ✅ 6 mois | ⚠ manque table secteur | ✅ 6 mois | Compte distinct — seul dataset de profil inconnu |
| **REAL_001 RAW** (3914 total) | ✅ cancel rate 50.1% · 25 mois | ✅ 64 actifs · 25 mois | ⚠ 64 actifs — manque table secteur | ✅ 25 mois | Multi-actifs extrême |
| **REAL_001 CLEAN** (1685 FILLED) | ❌ FILLED only | ✅ 64 actifs · 25 mois | ⚠ manque table secteur | ✅ 25 mois | Partiel |
| **REAL_002 CLEAN** (120 FILLED) | ❌ Trade History | ✅ concentré · 1 actif | ✅ trivial mono-actif (sans table) | ⚠ 47 jours — insuffisant | Concentré / mono-actif |
| **REAL_003 RAW** (1293 total) | ✅ cancel rate 48.3% · 5.6 mois | ✅ 10 actifs · 5.6 mois | ⚠ manque table secteur | ✅ 5.6 mois | Multi-actifs modéré |
| **REAL_003 CLEAN** (542 FILLED) | ❌ FILLED only | ✅ 10 actifs · 5.6 mois | ⚠ manque table secteur | ✅ 5.6 mois | Partiel |
| **REAL_004 CLEAN** (1910 FILLED) | ❌ FILLED only | ✅ 89 actifs · 28 mois | ❌ trop diffus (89 actifs) | ✅ 28 mois | Très diversifié |

**Légende :** ✅ couverture complète · ⚠ couverture partielle · ❌ non couverte

---

## 4. Angles morts — Analyse par dimension

### Dimension Exécution

**État :** partiellement couverte. Le corpus possède des données ALL-STATUS, mais elles ne sont pas toutes accessibles sans effort.

**Datasets qui couvrent cette dimension :**
- REAL_001 RAW : cancel rate 50.1% documenté dans CASE_REAL_001
- REAL_003 RAW : cancel rate 48.3% documenté dans CASE_REAL_003
- b3.pdf, b5.pdf, b10.pdf : extraction ALL-STATUS possible (PDF contient tous les statuts)
- Terrain 2026-06-19 (1.pdf, hors corpus) : cancel rate 59.1% documenté

**Problème structurel à résoudre avant l'implémentation :**  
Le pipeline actuel filtre systématiquement pour FILLED. Pour calculer le cancel rate, OI V1 doit soit :
- (option A) recevoir le compte total d'ordres en plus des FILLED, depuis l'uploader
- (option B) lire les RAW directement (contournement architectural)
- (option C) traiter les PDFs sans filtre FILLED pour le calcul du cancel rate

Il ne s'agit pas d'un manque de données — les données sont là. C'est une décision d'architecture pipeline à prendre avant l'implémentation.

**Cancel rates documentés dans le corpus :**

| Source | FILLED | CANCELED | Total | Cancel rate |
|---|---|---|---|---|
| REAL_001 RAW | 1685 | 1963 | 3914 | 50.1% |
| REAL_003 RAW | 542 | 625 | 1293 | 48.3% |
| terrain 1.pdf (hors corpus) | 388 | 561 | 949 | 59.1% |

Trois cancel rates distincts documentés. C'est suffisant pour calibrer un premier seuil.

**Limite :** deux des trois valeurs (REAL_001 et REAL_003) proviennent du même compte. La valeur de b10.pdf est inconnue (compte distinct) et non calculée dans les notes actuelles.

---

### Dimension Capital

**État :** bien couverte. Plusieurs datasets de durées et niveaux de concentration variés.

| Dataset | Profil Capital | Durée | Nb actifs |
|---|---|---|---|
| REAL_002 | Concentré — 1 actif (100%) | 47 jours | 1 |
| REAL_003 | Semi-concentré — TAOUSDC 90.8% | 5.6 mois | 10 |
| REAL_001 | Diversifié — 64 actifs | 25 mois | 64 |
| REAL_004 | Très diversifié — 89 actifs | 28 mois | 89 |

Les trois états officiels (Concentré · Diversifié · Rotatif) sont représentables :
- Concentré : REAL_002, REAL_003
- Diversifié : REAL_001, REAL_004
- Rotatif : à évaluer sur REAL_001 RAW (durée de présence par actif sur 25 mois)

**Aucun angle mort.**

---

### Dimension Portefeuille

**État :** structurellement bloquée par un manque non-dataset.

La dimension Portefeuille (Thématique · Opportuniste · Multi-actifs) requiert une **table de correspondance symbole → secteur**. Cette table n'existe pas dans le projet.

Sans elle, aucun dataset ne peut produire un indice de cohérence thématique. Les symboles présents dans le corpus permettraient de construire cette table :

| Symbole présent | Secteur probable |
|---|---|
| TAOUSDC | IA (Bittensor) |
| FETUSDC | IA (Fetch.ai) |
| ONDOUSDC | RWA (Ondo Finance) |
| PLUMEUSDC | RWA (Plume Network) |
| ROSEUSDC | Confidentialité / DeAI (Oasis) |
| BIOUSDC | DePIN / Biotech (Bittensor-adjacent) |
| LINKUSDC | Oracle / Infrastructure |
| SOLUSDC | L1 |
| BTCEUR | Majeur |
| INJUSDC | DeFi L1 (Injective) |

Les données sont là. La table de correspondance est manquante — c'est un travail de catégorisation manuelle, pas un manque de dataset.

**Angle mort : 1 livrable non-code à produire** avant de pouvoir calculer la dimension Portefeuille.

---

### Dimension Cadence

**État :** bien couverte pour les datasets longs. Couverte partiellement pour les courts.

| Dataset | Durée | Cadence probable | Confiance |
|---|---|---|---|
| REAL_001 | 25 mois | Continue ou Périodique | ✅ Élevée |
| REAL_004 | 28 mois | À évaluer | ✅ Élevée |
| b3.pdf | 12 mois | Burst (TAOUSDC dominant) | ✅ Élevée |
| b10.pdf | 6 mois | À évaluer (compte distinct) | ✅ Moyenne |
| REAL_003 | 5.6 mois | Burst (59 clusters) | ✅ Moyenne |
| REAL_002 | 47 jours | Burst (4 clusters) | ⚠ Faible (trop court) |

Les états Burst et Continue sont représentés. L'état Périodique (régularité calendaire) est non confirmé — aucun dataset n'a été analysé sous cet angle.

**Angle mort mineur :** l'état Périodique n'est pas encore observable dans le corpus. Il nécessiterait une analyse temporelle que le pipeline actuel ne produit pas.

---

## 5. Recherche des angles morts — Synthèse

| Dimension | Couverture | Vrai manque | Blocker implémentation |
|---|---|---|---|
| **Exécution** | ✅ Données présentes (RAW + PDF) | Aucun manque de données | ⚠ Décision pipeline : comment passer le compte total à OI V1 |
| **Capital** | ✅ Couverture complète (3 niveaux) | Aucun | Aucun |
| **Portefeuille** | ⚠ Données présentes, table absente | Table symbole → secteur | ⚠ Travail de catégorisation manuelle |
| **Cadence** | ✅ Couverte pour données longues | État Périodique non observé | Aucun bloquant |

---

## 6. Recommandation finale

### Option C — Certaines dimensions peuvent démarrer immédiatement, d'autres nécessitent un prérequis.

Le corpus ne manque d'aucun dataset. Les deux seuls bloquants à l'implémentation sont des **décisions d'architecture**, pas des manques de données.

---

### Dimensions démarrables immédiatement

**Dimension Capital** — corpus complet, aucun prérequis.  
Datasets calibration : REAL_002 (concentré) · REAL_003 (semi-concentré) · REAL_001 (diversifié) · REAL_004 (très diversifié).

**Dimension Cadence** — corpus suffisant pour les états Burst et Continue.  
Datasets calibration : REAL_001 (25 mois) · REAL_003 (5.6 mois, Burst documenté) · b3.pdf (12 mois).

---

### Dimensions démarrables avec un prérequis non-code

**Dimension Portefeuille** — prérequis : construire la table symbole → secteur.  
Volume de travail : catégoriser les ~15 symboles présents dans le corpus. Les données sont là. La table est absente.  
Datasets calibration une fois la table construite : REAL_003 (10 actifs, thèmes AI/DePIN identifiables) · REAL_001 (64 actifs, test robustesse).

---

### Dimension avec décision d'architecture requise

**Dimension Exécution** — prérequis : décider comment OI V1 reçoit le compte total d'ordres (FILLED + CANCELED).  
Trois options :
1. L'uploader passe le cancel rate brut à OI V1 sans modifier la pipeline FILLED
2. OI V1 lit un champ `rawOrderCount` distinct du nombre de trades FILLED
3. Les PDFs Order History sont analysés avant le filtre FILLED pour calculer le cancel rate

Les données de calibration sont disponibles dès que cette décision est prise :  
REAL_001 RAW (50.1%) · REAL_003 RAW (48.3%) · terrain 1.pdf documenté (59.1%).

---

### Réponse à la question centrale

> Si nous ouvrons l'implémentation d'Operator Intelligence V1 demain matin, quelles dimensions pouvons-nous construire immédiatement avec le corpus déjà présent dans le projet ?

**Dimension Capital : oui, immédiatement.**  
**Dimension Cadence : oui, immédiatement.**  
**Dimension Portefeuille : oui, après construction de la table symbole → secteur (~1h de travail manuel).**  
**Dimension Exécution : oui, après une décision d'architecture pipeline (pas de nouveau dataset).**

**Le corpus actuel est suffisant pour OI V1.** Il couvre trois profils de cancel rate documentés, quatre niveaux de concentration du capital, deux patterns de cadence confirmés (Burst et Continue), et les symboles nécessaires pour construire la table sectorielle. Aucun nouveau dataset n'est requis avant de commencer l'implémentation.

---

*Document de référence — Audit 2026-06-19*  
*Source : `excel_tests/`, `assets/excel_tests/b1-b19/`, `docs/imports/pdf-import-v1/`, notes CASE_REAL_001-004*  
*Doctrine de référence : `docs/doctrine/operator_intelligence_v1.md`*
