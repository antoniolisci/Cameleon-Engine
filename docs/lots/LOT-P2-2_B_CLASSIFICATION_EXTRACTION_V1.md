# LOT-P2-2.B — Logique de classification et d'extraction V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-2.B |
| Intitulé | Logique de classification et d'extraction V1 |
| Micro-lot parent | LOT-P2-2 — Parser S1 · Fichiers transactionnels V1 |
| Programme | P2 — Ingestion des données |
| Phase Roadmap V1 | A |
| Type | Modèle — Règles d'exécution |
| Document officiel | `docs/lots/LOT-P2-2_B_CLASSIFICATION_EXTRACTION_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-07-09 |

---

## §1 Mission

LOT-P2-2.B formalise les règles d'exécution du parser S1 selon une **architecture en deux niveaux** :

- **S1 Core** — règles génériques, plateforme-agnostiques : qualification d'un événement transactionnel · algorithme d'extraction de date EP-RC2 · règle de rejet RF-R6.
- **Adaptateur Binance Phase A** — mapping spécifique : colonnes Binance TRADE_HISTORY / ORDER_HISTORY vers le modèle S1 Core.

Cette séparation est un invariant architectural. Le S1 Core doit rester valide pour toute plateforme future. Binance Spot est le premier adaptateur, pas la définition de S1.

Ce micro-lot tranche également la décision DT-3 (isolation architecturale du module d'ingestion). Aucun code, aucune persistance.

---

## §2 Prérequis

| Document | Rôle dans ce micro-lot |
|---|---|
| LOT-P2-2 — Cadrage V1 | Invariants INV-1→9 · DT-3 à trancher ici |
| LOT-P2-2.A — Modèle de trace S1 V1 | 6 dimensions validées · états de date EP-RC2 · DT-2 et DT-5 tranchées |
| LOT-P2-1 §12 RF-R5 · RF-R6 · DI4 | RF-R5 : critère S1 par ligne · RF-R6 : rejet si non classifiable · DI4 : S1 = événement ponctuel |
| LOT-P2-1 §13 FB-F5 | Frontière S1/S2 par ligne |
| LOT-P2-1 §14 EP-RC2 | Quatre comportements de date formalisés |
| LOT-P2-1 §15 CL-P3 Variante A | Ingestion avec état de date formalisé — pas de rejet pour date manquante |

---

## §3 S1 Core — Qualification d'un événement transactionnel

### §3.1 Principe général

RF-R5 et DI4 imposent que le critère S1 soit appliqué **ligne par ligne**. Une ligne est qualifiée S1 si et seulement si elle satisfait les trois conditions suivantes :

**Condition 1** — Le fichier source est reconnu par un adaptateur enregistré.
**Condition 2** — La ligne représente un événement transactionnel réellement exécuté.
**Condition 3** — La ligne contient les champs d'identification minimaux.

Ces trois conditions sont génériques. Leur application concrète à un format de fichier donné est la responsabilité de l'adaptateur (§6 pour Binance Phase A).

### §3.2 Condition 1 — Format reconnu

Un fichier source est recevable si un adaptateur enregistré est capable de l'identifier et d'en extraire des événements transactionnels. Si aucun adaptateur ne reconnaît le fichier, le fichier entier est rejeté per RF-R6 avant traitement de toute ligne.

### §3.3 Condition 2 — Événement exécuté

Seules les lignes représentant un événement transactionnel **effectivement exécuté** sont qualifiées S1. Les événements en attente, annulés ou partiels sont hors périmètre S1 par définition (DI4 : S1 = événement ponctuel réalisé).

Ces lignes hors périmètre sont **exclues**, pas rejetées per RF-R6. L'exclusion est comptabilisée dans le contexte de session (champ "lignes exclues"). Les critères concrets de qualification "exécuté" sont définis par chaque adaptateur.

### §3.4 Condition 3 — Champs identifiables minimaux

Une ligne qualifiée doit contenir au minimum :
- Un **identifiant d'instrument** (quelle valeur a été échangée)
- Une **direction de transaction** (BUY ou SELL, ou équivalent sémantique)

L'absence de date n'est pas une cause d'exclusion : une ligne sans date produit une trace avec état R1, conformément à CL-P3 Variante A et INV-6.

Si les champs minimaux sont absents ou vides, la ligne est **rejetée per RF-R6**. Les champs concrets correspondant à ces deux concepts sont définis par chaque adaptateur.

---

## §4 S1 Core — Algorithme d'extraction de date EP-RC2

### §4.1 Principe

EP-RC2 formalise quatre états de date pour les traces S1. L'algorithme d'extraction est générique : il opère sur une valeur brute `v` fournie par l'adaptateur. L'adaptateur est responsable de localiser et d'extraire `v` depuis la source.

### §4.2 Tests de classification EP-RC2 (séquentiels)

Pour chaque ligne qualifiée, `v` désigne la valeur brute de la colonne date, telle que fournie par l'adaptateur. Les tests sont appliqués dans l'ordre suivant :

**Test 1 — Valeur absente ou vide**
Si `v` est absent, vide, ou une valeur sentinelle signalant l'absence de date (définie par l'adaptateur) : **état R1 — Non disponible**.

**Test 2 — Epoch ms (13 chiffres)**
Si `v` est une séquence de 13 chiffres : convertir en UTC ms. Vérifier que la valeur est dans la plage calendaire valide (année 2000–2100 : 946 684 800 000 ms – 4 102 444 800 000 ms). Si dans la plage : **état Standard**. Si hors plage : **état R4 — Non exploitable**.

**Test 3 — Epoch secondes (10 chiffres)**
Si `v` est une séquence de 10 chiffres : epoch en secondes, non convertible en UTC ms sans ambiguïté de portée. **État R4 — Non exploitable**.

**Test 4 — Format ISO long**
Si `v` contient un pattern ISO 8601 ou proche (YYYY-MM-DD HH:MM:SS · YYYY-MM-DDTHH:MM:SSZ · YYYY/MM/DD HH:MM:SS…) : extraire et convertir en UTC ms. **État Standard**.

**Test 5 — Aucun pattern reconnu**
Si aucun test précédent n'a conclu : valeur présente mais non conforme. **État R3 — Non disponible**.

Des tests supplémentaires peuvent être insérés entre Test 3 et Test 4 par un adaptateur pour gérer des formats de date spécifiques à une plateforme. Ces extensions ne modifient pas la séquence des tests génériques.

### §4.3 Comportement d'ingestion par état

| État EP-RC2 | Date dans la trace S1 | Comportement |
|---|---|---|
| Standard | UTC ms extrait | Trace ingérée · date renseignée |
| R4 — Non exploitable | "Non exploitable au format canonique" | Trace ingérée · état formalisé · CL-P3 Variante A |
| R1 — Non disponible | "Non disponible" | Trace ingérée · état formalisé · CL-P3 Variante A |
| R3 — Non disponible | "Non disponible" | Trace ingérée · état formalisé · CL-P3 Variante A |

**Dans tous les cas, la trace est ingérée.** Un état de date non standard n'est jamais une cause de rejet RF-R6.

---

## §5 S1 Core — Règle de rejet RF-R6

### §5.1 Principe

RF-R6 pose qu'une donnée sans règle de classification applicable est rejetée immédiatement. Le rejet est documenté, jamais silencieux.

### §5.2 Causes génériques de rejet

| Cause | Périmètre | Comptabilisation |
|---|---|---|
| Aucun adaptateur ne reconnaît le fichier | Rejet du fichier entier · avant traitement des lignes | Retour d'erreur · aucune session créée · aucune trace écrite |
| Champs identifiables minimaux absents ou vides (§3.4) | Rejet de la ligne · après filtrage par statut d'exécution | Ligne comptée dans "lignes rejetées" du contexte |

### §5.3 Comportement de rejet

**Rejet fichier entier** : aucune trace S1 écrite. L'opération d'import échoue avec un retour d'information explicite. Aucune session S1 créée.

**Rejet ligne** : la ligne ne produit aucune trace S1. Elle est comptabilisée dans les "lignes rejetées". Les autres lignes qualifiées du même fichier continuent d'être traitées. Un rejet de ligne n'interrompt pas et n'efface pas les traces déjà ingérées dans la session.

---

## §6 Adaptateur Binance Phase A

### §6.1 Rôle et portée

L'adaptateur Binance Phase A est responsable de traduire les fichiers Binance Spot (TRADE_HISTORY et ORDER_HISTORY, CSV et PDF) vers le modèle S1 Core. Il implémente les Conditions 1, 2 et 3 de §3 pour ces formats spécifiques, et fournit la valeur brute `v` à l'algorithme EP-RC2 de §4.

Toute règle énoncée dans cette section est spécifique à Binance Spot Phase A. Elle ne constitue pas une règle S1 générique.

### §6.2 Condition 1 — Détection du format Binance

| Signal de détection | Format Binance identifié |
|---|---|
| Présence d'une colonne frais ou fee (insensible à la casse, sans diacritiques) | TRADE_HISTORY |
| Présence d'une colonne statut ou status ET d'une colonne order id ou orderid | ORDER_HISTORY |
| Aucun signal Binance détecté · signaux contradictoires | Format non reconnu → RF-R6 (fichier entier) |

La détection ORDER_HISTORY est prioritaire sur TRADE_HISTORY si les deux signaux sont simultanément présents.

Pour les fichiers PDF Binance, la détection est fondée sur une analyse de score des libellés du document (signaux forts TRADE_HISTORY vs signaux forts ORDER_HISTORY), per le protocole validé dans PDF Import V1.

### §6.3 Condition 2 — Qualification "exécuté" Binance

**TRADE_HISTORY** : toutes les lignes sont présupposées exécutées. Chaque ligne passe directement à la Condition 3. Aucun filtrage par statut.

**ORDER_HISTORY** : la colonne statut détermine le traitement.

| Valeur du statut (insensible à la casse) | Traitement |
|---|---|
| FILLED · Filled · Complété · Exécuté · complete · done · closed | Ligne transmise à la Condition 3 |
| NEW · CANCELED · CANCELLED · Annulé · Ouvert | Ligne exclue · hors périmètre S1 (DI4) · comptée dans "lignes exclues" |
| Colonne statut présente mais valeur vide | Ligne exclue |
| Valeur non reconnue | Ligne exclue · signal de journalisation |

L'exclusion n'est pas un rejet RF-R6. Ces lignes représentent des ordres non exécutés, hors périmètre S1 par définition (DI4). Elles ne comptent pas dans les "lignes rejetées".

### §6.4 Condition 3 — Champs minimaux Binance

**TRADE_HISTORY**

| Concept générique | Colonne Binance |
|---|---|
| Identifiant d'instrument | Paire / Symbol (alias : pair, symbol, paire, paire de trading…) |
| Direction | Côté / Side (alias : side, direction, cote, sens…) |

**ORDER_HISTORY FILLED**

| Concept générique | Colonne Binance |
|---|---|
| Identifiant d'instrument | Paire / Symbol |
| Direction | Côté / Side |
| Identifiant d'ordre | Order Id / OrderId (requis pour distinguer l'ordre dans la session) |

Si au moins un champ minimal est absent ou vide : rejet RF-R6 de la ligne.

### §6.5 Localisation de la colonne date Binance

L'adaptateur fournit la valeur brute `v` à l'algorithme EP-RC2 (§4). La localisation de `v` par format est la suivante.

| Format Binance | Colonne date principale | Colonne date de création |
|---|---|---|
| TRADE_HISTORY CSV | Colonne date principale · alias : Date, Date(UTC), Date(UTC+2…N), utc time, heure, timestamp… | — |
| ORDER_HISTORY FILLED CSV | Colonne date d'exécution · alias : execution_time, Date d'exécution, executed time… | Colonne created_at, Date de création |
| TRADE_HISTORY PDF | Position [0] — libellé Durée | — |
| ORDER_HISTORY FILLED PDF | Position [7] — libellé execution_time | Position [0] — libellé created_at |

Pour les fichiers CSV Binance, les alias sont normalisés (minuscules, sans diacritiques). Les variantes de timezone Binance (Date(UTC+2), Date(UTC+8)…) sont canonicalisées avant aliasing.

### §6.6 Extensions EP-RC2 spécifiques Binance

L'adaptateur Binance insère un test supplémentaire entre Test 3 et Test 4 de l'algorithme générique (§4.2) :

**Test Binance 3b — Format court PDF ("YY-MM-DD HH:MM:SS")**
Si `v` correspond au pattern "YY-MM-DD HH:MM:SS" (longueur 17, séparateurs en positions fixes, année sur 2 chiffres) : préfixer l'année avec "20" → "YYYY-MM-DD HH:MM:SS", appliquer le décalage +02:00 → UTC ms. **État Standard**.

Ce test est propre à l'export PDF Binance. Il ne modifie pas l'algorithme EP-RC2 générique.

L'adaptateur Binance signale également la sentinelle "--" comme valeur absente pour les colonnes positionnelles PDF (ORDER_HISTORY PDF execution_time) → Test 1 → **état R1**.

---

## §7 Résolution DT-3 — Isolation du module d'ingestion

### §7.1 Problème

L'infrastructure comportementale existante (parser.js · format-detector.js · binance_spot.js · binance_order.js · pdf-normalizer.js) contient des fonctions de parsing et de normalisation de fichiers Binance déjà validées. La question est de savoir si le module d'ingestion S1 peut ou doit les réutiliser.

### §7.2 Incompatibilité fonctionnelle constatée

L'analyse de la fonction de normalisation comportementale (`normalizeTrade` dans `binance_spot.js`) révèle une incompatibilité directe avec les exigences de l'ingestion S1 :

| Comportement comportemental | Exigence S1 Core |
|---|---|
| Retourne `null` si le timestamp est absent ou non parseable | Ingère la ligne avec état R1/R3/R4 per CL-P3 Variante A |
| Retourne `null` si symbol, side, price ou qty sont absents | Rejette uniquement si champs minimaux (instrument · direction) absents — RF-R6 |
| Produit un objet de trade pour le scoring comportemental | Produit une trace canonique S1 |

### §7.3 Décision

**Option C — Implémentation indépendante dans le module d'ingestion.**

Le module d'ingestion S1 (S1 Core + adaptateur Binance Phase A) implémente ses propres fonctions. Il ne dépend d'aucune fonction du module comportemental.

### §7.4 Justification

| Critère | Évaluation |
|---|---|
| Compatibilité fonctionnelle | Options A et B incompatibles avec CL-P3 Variante A (rejet sur timestamp null) |
| Isolation architecturale | Option C préserve l'isolation des deux modules · aucune dépendance croisée |
| Complexité d'implémentation | Fonctions à implémenter courtes · les tables d'alias et règles de date sont documentées dans §6 |
| Risque de régression | Option C : aucun risque · chaque module évolue indépendamment |

### §7.5 Éléments réutilisables comme référence documentaire

Le module comportemental constitue une **référence documentaire** pour les formats Binance Phase A. Les tables d'alias, la logique de canonicalisation timezone, les formats de date reconnus et le comportement des sentinelles PDF sont intégrés aux règles de §6. Le module d'ingestion les réimplémente avec la sémantique S1 propre à son périmètre.

---

## §8 Critères de validation

| CV | Critère | Condition de satisfaction |
|---|---|---|
| CV-B1 | Qualification TRADE_HISTORY | Toutes les lignes d'un fichier TRADE_HISTORY Binance valide passent les 3 conditions et sont qualifiées S1 |
| CV-B2 | Qualification ORDER_HISTORY | Seules les lignes FILLED passent la Condition 2 · les autres sont exclues avec comptabilisation |
| CV-B3 | EP-RC2 — état Standard | Lignes avec date ISO 8601 ou epoch ms valide → état Standard · date UTC ms renseignée |
| CV-B4 | EP-RC2 — états R1/R3/R4 | Lignes avec date absente (R1) · non conforme (R3) · non exploitable (R4) → trace ingérée avec état formalisé |
| CV-B5 | Rejet RF-R6 fichier | Fichier de format non reconnu → rejet total · aucune trace · retour explicite |
| CV-B6 | Rejet RF-R6 ligne | Ligne avec champs minimaux absents → rejet ligne · comptabilisation · traitement des autres lignes non interrompu |
| CV-B7 | Séparation S1 Core / Adaptateur | Le S1 Core (§3→§5) ne contient aucune règle Binance-spécifique · l'adaptateur (§6) est la seule section à référencer Binance |

---

## §9 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | CV-B1 à CV-B7 satisfaits |
| Condition 2 | DQC V2 CAS A sur ce document |
| Condition 3 | Validation opérateur explicite |
