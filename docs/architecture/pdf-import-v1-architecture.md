# PDF_IMPORT_V1 — Clarification architecturale et doctrine d'intégration

**Statut :** Clarification architecturale · Aucune implémentation · Aucun code
**Version :** 1.0 — 2026-06-01
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

## 7. Ce que ce document ne fait pas

- Il n'ouvre pas le chantier PDF_IMPORT_V1
- Il ne modifie pas les priorités de la roadmap
- Il ne définit pas l'architecture technique du parseur PDF
- Il ne change pas l'ordre des chantiers actifs

Son seul rôle : conserver la découverte terrain et poser les règles d'intégration futures.
