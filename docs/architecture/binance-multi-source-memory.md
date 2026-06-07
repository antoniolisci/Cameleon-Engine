# Binance Multi-Source Memory — Architecture et chantier

**Statut :** Doctrinal — Non démarré
**Date :** 2026-05-31
**Domaine :** Architecture produit · Pipeline comportemental · Import de données

---

## 1. Préambule

Le pipeline comportemental actuel de Caméléon Engine repose sur deux sources : Order History et Trade History. Ces deux sources couvrent l'intention déclarée (ordres) et l'exécution réelle (trades). Elles ne couvrent pas le capital engagé, les flux entrants et sortants, ni les revenus passifs.

Binance produit quatre exports CSV distincts. Ensemble, ils reconstituent le cycle complet d'un opérateur :

| Source | Signal principal | Couche analytique |
|---|---|---|
| Order History | Intention | Ce que l'opérateur voulait faire |
| Trade History | Exécution | Ce qu'il a réellement fait |
| Transaction History | Capital | Ce qu'il a engagé, retiré, déplacé |
| Earn History | Réserve | Ce qu'il a mis en attente passive |

L'objectif du chantier Binance Multi-Source Memory (BMSM) est d'intégrer ces quatre sources dans un pipeline unifié, capable de produire une trajectoire comportementale multi-périodes et une lecture complète de l'opérateur.

## 2. Les cinq sources

### Order History

Contient tous les ordres passés — exécutés, annulés, partiellement remplis. C'est la couche de l'**intention déclarée** : ce que l'opérateur a voulu faire, à quel prix, dans quel sens.

Statut pipeline : **Production — actif**

Champs analytiquement pertinents : `Date`, `Pair`, `Side`, `Type`, `Price`, `Qty`, `Status`
Champs PII à supprimer : `User_ID` (header PDF), `Order_ID` (après réconciliation uniquement)

### Trade History

Contient les exécutions réelles. Un ordre peut produire zéro, un ou plusieurs trades. C'est la couche de l'**exécution réelle** : ce qui s'est passé en marché.

Statut pipeline : **Production — actif**

Champs analytiquement pertinents : `Date`, `Pair`, `Side`, `Price`, `Qty`, `Fee`, `Fee Coin`
Champs PII à supprimer : `User_ID` (header PDF), `Trade_ID` (après analyse)

### Transaction History

Contient tous les mouvements de capital hors trading : dépôts, retraits, transferts internes, conversions. C'est la couche du **capital engagé** : ce que l'opérateur a mis à disposition du système.

Statut pipeline : **En conception — chantier BMSM P1**

Champs analytiquement pertinents : `Date`, `Operation`, `Coin`, `Change`
Champs PII à supprimer : `Adresse de retrait`, `Account_ID`, `UID`, `Email`, `Remark` (sauf si pertinent analytiquement)

### Earn History

Contient les revenus de staking, flexible earn, locked earn. C'est la couche de la **réserve passive** : capital placé hors marché actif, génère des flux réguliers.

Statut pipeline : **En conception — chantier BMSM P2**

Champs analytiquement pertinents : `Date`, `Product`, `Asset`, `Amount`, `APY`
Champs PII à supprimer : `User_ID`, `Account_ID`

### PDF Binance (états de compte, relevés fiscaux)

Documents textuels générés par Binance. Contiennent les mêmes données que les CSV mais dans un format non structuré. Headers de page contiennent systématiquement `User_ID` et souvent l'email.

Statut pipeline : **Doctrinal — en attente signal terrain**

Condition d'activation : première demande réelle d'import fiscal PDF par un opérateur terrain.

## 3. Le croisement des sources

Le croisement Order×Trade est déjà opérationnel dans le pipeline actuel. Le chantier BMSM étend ce croisement à quatre dimensions.

### Croisement Order × Trade (existant)

Un ordre exprime une intention. Le trade correspondant révèle si cette intention a été réalisée, à quel prix, avec quelle friction. L'écart entre les deux mesure la **qualité d'exécution**.

Signal produit : `intention_gap` — ratio ordres annulés / ordres exécutés par période.

### Croisement Transaction × Trade (BMSM P1)

Les dépôts et retraits contextualisent les sessions de trading. Un retrait massif avant une période d'activité intense révèle une contrainte de capital. Un dépôt précédant une session de prise de risque élevée révèle un pattern de rechargement.

Signal produit : `capital_flow_context` — corrélation flux capital / intensité trading par période.

### Croisement Earn × Trade (BMSM P2)

La réserve passive change la lecture du risque pris en trading actif. Un opérateur qui garde 60% de son capital en earn et trade avec 40% a un profil de risque différent de celui qui trade avec 100%.

Signal produit : `reserve_ratio` — part du capital en attente passive vs capital actif.

### Trajectoire multi-périodes (BMSM P2)

Combinaison des quatre sources sur plusieurs périodes temporelles. Révèle l'évolution de l'opérateur : concentration progressive sur des actifs spécifiques, changement de style (scalp → swing), modification du rapport réserve / actif.

Signal produit : `behavioral_trajectory` — séquence temporelle de profils comportementaux.

## 4. Architecture modulaire

Le chantier BMSM s'intègre dans le pipeline comportemental existant (`src/js/behavior/`) sans modifier l'architecture de base. L'isolation contract reste intact.

### Principe d'intégration

Chaque nouvelle source suit le même pipeline que les sources existantes :

```
CSV source → parser_[source].js → canonical_[source].js → metrics_[source].js
                                                               ↓
                                                     multi-source-merger.js
                                                               ↓
                                                     metrics.js (enrichi)
```

Le `multi-source-merger.js` est le composant central du chantier BMSM. Il reçoit les données normalisées de chaque source et produit les signaux croisés.

### Contrat d'isolation (inchangé)

- Aucun accès au payload du moteur principal
- Aucun événement global, aucune propriété `window.*`
- Persistance uniquement via `session-repo.js` — cap FIFO 50 sessions (MEM-01B Bloc A · `abed3b4`)
- Réseau silencieux pendant et après l'analyse

### Règles de suppression PII (par source)

Chaque parser doit supprimer les PII **avant** transmission à `canonical_[source].js`. Le moteur analytique ne reçoit jamais ces champs. Cette règle est non négociable et permanente.

Référence complète : `docs/architecture/privacy-local-first-imports.md`

## 5. Les trois phases (P1 / P2 / P3)

### P1 — Transaction History CSV (condition d'ouverture : aucune)

Normalisation du CSV Transaction History. Extension du pipeline existant. Aucune dépendance sur P2 ou P3.

| Composant | Rôle |
|---|---|
| `parser_transaction.js` | Lecture CSV, suppression PII, normalisation |
| `canonical_transaction.js` | Structure normalisée par opération |
| `metrics_transaction.js` | Capital Flow : dépôts, retraits, net par période |

Signaux produits : fréquence des dépôts, ratio retrait/dépôt, net capital par mois, contexte capital avant/après sessions intenses.

Condition de fermeture : Transaction History normalisé, signaux validés sur dataset terrain réel.

### P2 — Capital Flow + Earn History + Intention Gap (condition d'ouverture : P1 stable)

Extension des signaux croisés. Nécessite que P1 soit stable et validé.

| Composant | Rôle |
|---|---|
| `parser_earn.js` | Lecture CSV Earn, suppression PII, normalisation |
| `canonical_earn.js` | Structure normalisée par produit d'earn |
| `metrics_earn.js` | Reserve Ratio : part passive vs active |
| `multi-source-merger.js` | Croisement Transaction × Trade × Earn |

Signaux produits : `reserve_ratio`, `capital_flow_context`, `behavioral_trajectory` multi-périodes.

Condition de fermeture : croisements validés sur ≥3 datasets terrain avec Earn History non vide.

### P3 — PDF Binance (condition d'ouverture : signal terrain réel)

Parsing PDF.js des relevés Binance. N'est pas justifié tant que l'équivalent CSV existe et est disponible.

**Condition d'ouverture unique :** un opérateur terrain fait une demande réelle d'import d'un document fiscal ou de compte au format PDF que Binance ne propose pas en CSV.

Tant que cette condition n'est pas remplie, P3 reste en statut doctrinal. Aucune implémentation ne doit être démarrée.

Référence architecture PDF : `docs/architecture/pdf-intelligence-system-v1.md`

## 6. Valeur produit

Le pipeline actuel (Order History + Trade History) permet de lire **comment** l'opérateur trade. Le chantier BMSM permet de lire **dans quel contexte de capital** il trade, et **comment ce contexte évolue dans le temps**.

### Ce que BMSM ajoute

**P1 — Transaction History :**
- Détection des rechargements compulsifs (dépôt immédiat après perte)
- Détection des retraits de protection (sortie partielle du système en période de stress)
- Corrélation capital disponible / intensité de l'activité

**P2 — Earn History + croisements :**
- Profil de risque réel : part du capital exposée vs mise en réserve passive
- Trajectoire comportementale : l'opérateur concentre-t-il ses actifs ? Change-t-il de style ?
- Lecture de l'évolution sur 6, 12, 24 mois

### Ce que BMSM ne remplace pas

Le pipeline BMSM ne remplace pas l'analyse comportementale actuelle. Il la contextualise. Le score comportemental reste le signal principal. Les signaux BMSM sont des couches de lecture supplémentaires, pas des correcteurs du score.

### Alignement doctrine

Le chantier BMSM s'inscrit dans l'Étage 2 — Le miroir Caméléon. Il est optionnel, conditionnel à la décision de l'opérateur d'importer ses données, et ne constitue pas une condition d'entrée dans le produit.

Référence : `docs/product/doctrine-confiance-importation-v1.md`

## 7. Hors périmètre

Ces éléments sont explicitement exclus du chantier BMSM, quelle que soit la phase.

| Élément | Raison d'exclusion |
|---|---|
| Autres exchanges (Bybit, OKX, Kraken…) | Formats non standardisés — chantier distinct si signal terrain |
| Connexion API exchange | Données quittent le navigateur — violation ZERO CLOUD |
| Soldes absolus en temps réel | PII financière — violation PRIVACY-FIRST |
| Montants exacts en localStorage | Violation Règle 4 — seuls ratios et métriques agrégées |
| Identification de l'utilisateur | Violation principe fondamental — le moteur ne sait jamais qui trade |
| Analyse fiscale | Hors périmètre produit — outil de lecture comportementale, pas fiscal |
| Recommandation d'allocation | Hors périmètre — Caméléon lit, ne prescrit pas |

## 8. BMSM_DEBT_REGISTER

Dettes architecturales identifiées au stade doctrinal. Non bloquantes — aucune implémentation n'est démarrée. À instruire avant ouverture de chaque phase.

| ID | Dette | Phase concernée | Priorité |
|---|---|---|---|
| BMSM-01 | Définir la granularité temporelle des croisements Transaction × Trade | P1 | Haute |
| BMSM-02 | Spécifier le comportement en cas d'absence d'une source (Order sans Transaction) | P1 | Haute |
| BMSM-03 | Définir le seuil de confiance minimale pour `capital_flow_context` | P1 | Moyenne |
| BMSM-04 | Spécifier comment `reserve_ratio` interagit avec le score comportemental existant | P2 | Haute |
| BMSM-05 | Définir le format de `behavioral_trajectory` dans le stockage localStorage | P2 | Moyenne |
| BMSM-06 | Valider que PDF.js 3.x fonctionne entièrement en browser sans dépendance Node.js | P3 | Haute |
| BMSM-07 | Définir la stratégie de suppression des PII dans les headers PDF Binance | P3 | Haute |

## 9. Position roadmap

### Statut actuel

**Non démarré — Priorité B**

Le chantier BMSM est enregistré comme chantier futur. Il n'est pas actif. Aucune implémentation ne doit être démarrée avant que les conditions d'ouverture soient réunies.

### Conditions d'ouverture P1

- V0-A terrain terminé (Binance exports analysés)
- V0-B cockpit observation stable (≥50 sessions, ≥10 opérateurs)
- Aucun chantier actif concurrent sur le pipeline comportemental

### Dépendances documentaires

| Document | Relation |
|---|---|
| `docs/architecture/privacy-local-first-imports.md` | Règles privacy applicables à toutes les sources BMSM |
| `docs/architecture/pdf-intelligence-system-v1.md` | Architecture PDF — référence pour P3 |
| `docs/product/doctrine-confiance-importation-v1.md` | Cadre doctrinal — imports = portes de profondeur |
| `docs/roadmap/roadmap-realignment-post-constellium.md` | Enregistrement roadmap du chantier |
| `docs/architecture/v0-personal-calibration-binance.md` | Table des sources supportées — ✅ mise à jour (commit 5130332) |

### Règle de garde

> **Ne pas ouvrir ce chantier parce qu'il est architecturalement prêt. L'ouvrir uniquement lorsque le terrain produit un signal qui justifie son existence.**

---

*Binance Multi-Source Memory — 2026-05-31*
*Référence : docs/architecture/binance-multi-source-memory.md*
*Ne déclenche aucune implémentation. Aucun code.*
