# PDF_IMPORT_V1 — Clarification architecturale et doctrine d'intégration

**Statut :** Décisions architecturales validées · Prêt pour Session 1 d'implémentation
**Version :** 2.0 — 2026-06-04 (R1 — intégration diagnostic terrain b8.pdf / b3.pdf)
**Auteur :** Caméléon Engine Project
**Dépend de :** pdf-intelligence-system-v1.md · binance-multi-source-memory.md · binance-audits-synthesis-v1.md

---

## 1. Contexte et portée du document

Ce document fait suite à l'inventaire complet du corpus B1-B19 (19 fichiers Binance terrain réels, dont 9 PDF).

Il n'ouvre pas de chantier. Il ne modifie pas la roadmap ni les priorités. Il enregistre une découverte terrain qui corrige une hypothèse initiale et pose le périmètre officiel de PDF_IMPORT_V1 pour une implémentation future soumise à la planification normale du projet.

---

## 2. Signal terrain — ARCH-004 confirmé

Le corpus B1-B19 contient 9 fichiers PDF. L'inventaire révèle deux familles uniquement.

### 2.1 Famille A — Trade History Spot PDF

Colonnes observées : `Durée · Paire · Côté · Prix · Exécuté · Montant · Frais`

| Fichier | Pages | Période (UTC+2) | Identité |
|---------|-------|-----------------|----------|
| b8.pdf | 3 | 2026-04-30 → 2026-05-31 | Visible |
| b16.pdf | 3 | 2026-04-30 → 2026-05-30 | Masquée |
| b18.pdf | 20 | 2026-02-28 → 2026-05-30 | Masquée |

### 2.2 Famille B — Order History Spot PDF

Colonnes observées : `Durée · N° commande · Paire · Type · Côté · Prix ordre · Montant commande · Exécuté · Prix moyen · Trading total · Statut`

| Fichier | Pages | Période (UTC+2) | Identité |
|---------|-------|-----------------|----------|
| b3.pdf | 192 | 2025-05-30 → 2026-05-31 | Visible |
| b5.pdf | 37 | 2026-02-28 → 2026-05-31 | Visible |
| b7.pdf | 1 | 2026-04-30 → 2026-05-31 | Visible |
| b10.pdf | 88 | 2025-11-30 → 2026-05-30 | Masquée |
| b12.pdf | 37 | 2026-02-28 → 2026-05-30 | Masquée |
| b19.pdf | 192 | 2025-05-30 → 2026-05-30 | Masquée |

### 2.3 Observation sur les doublons visibles/masqués

Les versions "visible" (nom + adresse affichés) et "masquée" (données personnelles anonymisées) constituent des paires à 1 jour de décalage sur la date de fin — même volume de données, seule l'identité personnelle diffère. Ces paires ne constituent pas deux sources distinctes.

---

## 3. Correction de la doctrine BMSM P3

La doctrine BMSM P3 posait la condition suivante :

> *"PDF Binance = rapports fiscaux uniquement · Condition d'ouverture : demande terrain réelle d'import fiscal PDF que Binance ne propose pas en CSV."*

Cette hypothèse est partiellement invalidée par B1-B19.

Les PDF observés ne sont pas des rapports fiscaux. Ce sont des exports Trade History et Order History — les mêmes données que les CSV — exportés au format PDF par Binance. Les opérateurs les utilisent réellement.

La question d'activation n'est plus *"est-ce que le PDF apporte des données absentes du CSV ?"* mais *"est-ce que les opérateurs utilisent ce format ?"*. La réponse est oui.

**Règle révisée :** Trade History Spot PDF et Order History Spot PDF sont des sources officielles de PDF_IMPORT_V1, au même titre que leurs équivalents CSV.

**Ce qui reste valable dans BMSM P3 :** la condition d'ouverture pour les familles non encore observées (fiscal, Earn, Wallet, Futures…) reste inchangée — signal terrain réel requis.

---

## 4. Périmètre officiel de PDF_IMPORT_V1

### 4.1 Inclus en V1

- Trade History Spot PDF
- Order History Spot PDF

### 4.2 Exclus de V1 (intégration sur signal terrain uniquement)

- Rapports fiscaux PDF
- Earn History PDF
- Wallet / Transaction History PDF
- Futures, Margin, Funding PDF
- Tout autre export Binance non encore observé sur le terrain

---

## 5. Principe — B1-B19 n'est pas le périmètre final

B1-B19 représente le premier corpus terrain observé. Il ne définit pas la limite du produit.

La cible officielle de Caméléon Engine demeure :

> *"Accepter progressivement tous les exports Binance utiles (CSV, XLSX, PDF) au fur et à mesure de leur rencontre terrain, sans jamais compromettre la stabilité des pipelines existants."*

Familles potentielles futures (non à coder avant signal terrain) : Trade History · Order History · Wallet / Transaction History · Deposits · Withdrawals · Earn · Staking · Rewards · Funding · Fees · Statements · Tax Reports · Futures · Margin · autres exports officiels Binance.

---

## 6. Doctrine d'intégration progressive — règles permanentes

| # | Règle |
|---|-------|
| R1 | Aucune famille ne doit être codée avant d'avoir été rencontrée sur le terrain |
| R2 | Chaque nouvelle famille suit le cycle : Rencontre → Compréhension → Adaptation → Mémoire |
| R3 | Les pipelines existants (CSV, XLSX) ne doivent jamais être compromis |
| R4 | Une même source ne peut pas fusionner deux familles dans un schéma canonique commun |
| R5 | Documenter chaque découverte avant toute implémentation |
| R6 | Préserver l'extensibilité plutôt que les cas particuliers |

---

## 7. Ce que la version 1.0 ne faisait pas

- Elle n'ouvrait pas le chantier PDF_IMPORT_V1
- Elle ne définissait pas l'architecture technique du parseur PDF

La version 2.0 intègre les décisions architecturales issues du diagnostic terrain (2026-06-04).

---

## 8. Diagnostic terrain — résultats (2026-06-04)

**PDFs analysés :** b8.pdf (Trade History, 3 pages) · b3.pdf (Order History, 192 pages)  
**Outil :** PDF.js legacy build — extraction positionnelle réelle  
**Verdict :** B — Faisable avec ajustements

### Résultats clés

**Type de PDF :** Natifs (texte encodé). Aucun OCR requis. PDF.js extrait le texte directement.

**Stabilité des coordonnées X :**

| Famille | Colonnes | Variance X (données) |
|---|---|---|
| Trade History (b8.pdf) | 7 | 0.0 pt — parfaite |
| Order History (b3.pdf, pages 2+) | 12 | 0.0 pt — parfaite |

**Clustering Y=2pt :** Viable sur les deux familles. Reconstruit des lignes de 7 colonnes (Trade) et 12 colonnes (Order) sans anomalie sur les lignes de données.

**Statuts Order History observés :** `FILLED` · `NEW` · `CANCELED` — visibles, filtrage direct.

**Format date :** `YY-MM-DD HH:MM:SS` (2 chiffres pour l'année) — `26-05-24 07:01:57`.

**Valeurs numériques :** unité toujours présente — `"5.6583TAO"`, `"1579.23153USDC"`. `parseFloat()` natif résout automatiquement.

### Risques non identifiés dans le plan initial — tous résolus

| Risque découvert | Impact | Résolution |
|---|---|---|
| Format date `YY-MM-DD` | `new Date()` invalide | Préfixer `"20"` — trivial |
| En-têtes Order History fractionnés sur 2 lignes | Détection par string cassée | Mapping par coordonnées X (PDF-ARCH-02) |
| Bloc Commentaires page 1 Order History | Bruit clustering page 1 | Démarrer extraction page 2 (PDF-ARCH-03) |
| Unités dans toutes les valeurs numériques | Aucun — `parseFloat()` suffit | Documenter, pas de code supplémentaire |

---

## 9. Décisions architecturales R1 — référence avant Session 1

Ces quatre décisions sont la **référence officielle** pour toute l'implémentation PDF Import V1. Elles priment sur toute hypothèse antérieure du plan d'implémentation.

---

### PDF-ARCH-01 — Parser spécialisé Binance

**Décision :** PDF Import V1 ne cherche pas à devenir un moteur PDF universel. Le périmètre officiel est limité à Binance Spot Trade History PDF et Binance Spot Order History PDF uniquement.

**Conséquences :**
- Aucune abstraction prématurée pour d'autres plateformes
- Aucune gestion générique de tableaux PDF
- Aucune optimisation pour des PDF non Binance
- Le parser est volontairement spécialisé sur la structure observée du corpus B1-B19

**Principe :** *Optimiser pour le réel observé plutôt que pour des hypothèses futures.*

**Impact sur le plan :** Aucun changement de phase. Confirme que les positions X hardcodées (PDF-ARCH-02) ne sont pas un défaut de conception — elles sont la décision correcte pour ce périmètre.

---

### PDF-ARCH-02 — Mapping Order History par coordonnées X

**Constat :** Les en-têtes Order History sont fragmentés sur plusieurs lignes PDF. "Prix de l'ordre" et "Montant de la commande" sont découpés en fragments (`"Prix de l'ordr"` + `"e"`) à 10pt d'écart vertical. La reconstruction par string matching est fragile et non fiable.

**Décision :** Le mapping Order History est basé sur les coordonnées X observées. Le texte des en-têtes est un signal secondaire. Les coordonnées sont la source de vérité.

**Signature validée sur corpus B1-B19 :**

| x (pt) | Champ canonique |
|---|---|
| 38.8 | `created_at` |
| 117.9 | `order_id` |
| 208.3 | `symbol` |
| 264.8 | `order_type` |
| 321.3 | `side` |
| 377.7 | `order_price` |
| 434.2 | `order_amount` |
| 490.7 | `execution_time` |
| 569.8 | `executed_qty` |
| 626.3 | `average_price` |
| 682.8 | `trading_total` |
| 750.5 | `status` |

**Tolérance de matching :** ±3pt sur la coordonnée X pour absorber de minimes variations inter-versions de PDF Binance.

**Impact sur le plan — Phase 2 :**
- Tâche 2.2 : remplacer string matching par signature X pour Order History
- Tâche 2.3 : filtrage en-têtes répétés par pattern structurel (≥10 items correspondant à la signature X), pas par string

---

### PDF-ARCH-03 — Traitement spécial page 1 Order History

**Constat :** La page 1 de tout PDF Order History Binance contient un bloc "Commentaires" (footnotes ¹²³, texte de prose explicatif) positionné à droite de la page (x > 440, y < 460). Ce bloc n'existe que sur la page 1. Il crée du bruit dans le clustering Y.

**Décision :** Pour Order History, l'extraction opérationnelle démarre à la page 2. La page 1 n'est utilisée que pour détecter la famille du PDF (présence de `"Historique d'ordre Spot"` ou `"Numéro de commande"`).

**Option de secours** (si la famille doit être confirmée sur des données page 1) : filtrer les items `page === 1 AND x > 440 AND y < 460` avant clustering. Cette option n'est activée que si la détection de famille sur le texte de page 1 échoue.

**Règle permanente :** Pour Trade History, la page 1 est traitée normalement — elle ne contient pas de bloc parasite.

**Impact sur le plan — Phase 2 :**
- Nouvelle micro-tâche 2.0 : avant clustering, si famille = ORDER_HISTORY, démarrer l'itération à `page >= 2`

---

### PDF-ARCH-04 — Format date Binance PDF

**Constat :** Les PDFs Binance utilisent le format `YY-MM-DD HH:MM:SS` pour les dates dans les lignes de données (ex. `26-05-24 07:01:57`), et non `YYYY-MM-DD HH:MM:SS`. `new Date("26-05-24 07:01:57")` retourne `Invalid Date`.

**Décision :** Avant tout appel de parsing de date, préfixer automatiquement `"20"` :

```
"26-05-24 07:01:57"  →  "2026-05-24 07:01:57"  →  timestamp UTC ms
```

**Règle :** Aucun appel à `new Date()` ne doit être effectué sur le format brut Binance. Le préfixage est systématique et non conditionnel — il s'applique à toute date extraite des familles A et B.

**Offset UTC+2 :** Les dates Binance PDF sont en UTC+2 (confirmé par la métadonnée `Période(UTC+2)` de la page 1). Soustraction de 7 200 000 ms obligatoire pour obtenir UTC.

**Impact sur le plan — Phase 3 :**
- Tâche 3.1 : ajouter le préfixage `"20"` avant le parsing. L'offset UTC+2 reste inchangé.

---

## 10. Impact consolidé sur le plan d'implémentation

| Phase | Changement |
|---|---|
| Phase 0 | Aucun changement |
| Phase 1 | PDF-ARCH-04 : préfixage `"20"` dans la logique de parsing date |
| Phase 2 | PDF-ARCH-02 : mapping Order History par X · PDF-ARCH-03 : démarrer page 2 · filtrage en-têtes par pattern X |
| Phase 3 | Aucun changement majeur — unités gérées par `parseFloat()` natif |
| Phase 4 | Aucun changement |
| Phase 5 | Ajouter test : vérifier stabilité signature X sur ≥ 3 pages consécutives Order History |

---

*Ce document décrit ce qui existe et ce qui a été décidé. Pas ce qui est espéré.*
