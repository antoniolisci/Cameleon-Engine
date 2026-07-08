# LOT-P1-2.2 — Couche de persistance locale structurée V1
## Spécification de migration — Deuxième sous-phase de LOT-P1-2

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-2.2 |
| Titre | Couche de persistance locale structurée V1 |
| Sous-phase de | LOT-P1-2 — Couche de persistance canonique V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Spécification de migration |
| Statut | SPÉCIFICATION EN COURS |
| Prérequis satisfaits | LOT-P1-2.1 — VALIDÉ · `091d8f1` |
| Cadrage de référence | `docs/lots/LOT-P1-2_CANONICAL_PERSISTENCE_V1.md` · `7b6c7cd` |
| Modèle de référence | `docs/lots/LOT-P1-2_1_CANONICAL_TRACE_MODEL_V1.md` · `091d8f1` |
| Date de rédaction | 2026-07-07 |

---

## 1 — Mission

LOT-P1-2.2 produit la spécification de la migration de la couche de persistance existante vers la couche de persistance canonique structurée.

Cette sous-phase a trois livrables attendus, définis par le cadrage LOT-P1-2 (§6) :

1. La couche de persistance est opérationnelle — structurée par famille mémorielle, avec isolation des compartiments et interface d'écriture contrôlée.
2. Les 14 entrées inventoriées par LOT-P1 sont traitées conformément à la classification validée par LOT-P1-2.1 : 10 traces mémorielles intégrées dans la couche canonique, 4 états applicatifs maintenus hors de cette couche.
3. L'interface d'écriture est exposée aux modules applicatifs en remplacement transparent de l'ancienne couche.

Ce document ne prescrit aucune implémentation. Il spécifie les règles de migration — ce qui migre, dans quel état, sous quelles garanties, dans quel ordre logique, avec quelles conditions de réversibilité.

LOT-P1-2.2 ne couvre pas l'indexation par date et par session, réservée à LOT-P1-2.3. Il ne couvre pas la doctrine de provenance, réservée à LOT-P1-2.4. Il ne couvre pas la validation terrain, réservée à LOT-P1-2.5.

---

## 2 — Relation aux documents de référence

### 2.1 — Ce que le cadrage LOT-P1-2 établit

Le cadrage LOT-P1-2 (`7b6c7cd`) établit les éléments suivants, que la présente spécification applique sans les redoubler :

- Le principe fondateur de la frontière trace mémorielle / état applicatif et son critère de qualification (§4.1)
- Le modèle canonique de trace — les quatre champs et leurs contraintes générales (§4.2)
- Les trois cas de datation formalisés R1, R3, R4 et leur traitement dans le modèle (§4.3)
- La structure cible de la couche en trois niveaux : familles, traces, index (§4.4)
- Les responsabilités de la couche et ce qu'elle ne fait pas (§4.5, §4.6)
- La stratégie de coexistence et de remplacement transparent (§4.7)
- La définition de l'axe session (§4.8)
- Les risques de régression identifiés : R-REG-01, R-REG-02, R-REG-03, R-UX-01 (§7)
- Les huit critères de validation CV1-CV8 (§8)

### 2.2 — Ce que LOT-P1-2.1 spécifie

La spécification LOT-P1-2.1 (`091d8f1`) spécifie les éléments suivants, que la présente spécification applique comme référence de conformité :

- La classification définitive des 14 entrées — 10 traces mémorielles et 4 états applicatifs, avec la famille ACF V1 de chacune (§3)
- La formalisation détaillée des cas R1, R3 et R4 pour la migration : état du champ Date, traitement du contenu, distinction entre données historiques et nouvelles écritures (§6)
- Les propositions d'unités de session par famille, destinées à LOT-P1-2.4 (§7)
- Les règles de validation d'une trace (RV1-RV5) et les règles d'écriture (RE1-RE3) (§8)
- Les invariants MI-1 à MI-7 du modèle canonique (§9)

### 2.3 — Ce que ce document ajoute

La présente spécification ajoute, en complément des deux documents précédents :

- La description de la structure cible opérationnelle de la couche : organisation par famille, interface d'écriture contrôlée, modes de lecture de base, périmètre exclu (§4)
- Le plan de migration explicite par famille active, avec les règles spécifiques à chaque famille et à ses cas particuliers (§5.2)
- La spécification de la stratégie de coexistence : ordre de remplacement, préservation des données d'origine, condition de suppression (§5.1, §5.3)
- Les règles de préservation des garanties existantes : Hardening, Compte Utilisateur V1, Diagnostic mémoriel (§6)

---

## 3 — Périmètre de la migration

### 3.1 — Traces mémorielles à migrer (10 entrées)

Les 10 entrées classifiées comme traces mémorielles par LOT-P1-2.1 (§3.2) sont migrées vers la couche canonique. Elles sont regroupées par famille ACF V1 cible.

**SY1 — Comportementale (6 entrées)**

| # | Entrée | Famille LOT-P1 |
|---|---|---|
| 1 | Sessions comportementales | F1 |
| 2 | Mémoire comportementale | F1 |
| 3 | Niveau de garde comportemental | F1 |
| 4 | Paramètres d'ordres récents | F1 |
| 5 | Mémoire opérateur | F2 |
| 6 | Historique des analyses opérateur | F2 |

**SY3 — Décisionnelle (2 entrées)**

| # | Entrée | Famille LOT-P1 |
|---|---|---|
| 7 | Journal des décisions moteur | F3 |
| 8 | Sauvegardes moteur | F3 |

**S1 — Transactionnelle (1 entrée)**

| # | Entrée | Famille LOT-P1 |
|---|---|---|
| 9 | Registre des importations | F4 |

**S2 — Patrimoniale (1 entrée)**

| # | Entrée | Famille LOT-P1 |
|---|---|---|
| 10 | Portefeuille | F4 |

Ces 10 entrées constituent l'intégralité du périmètre de migration de LOT-P1-2.2. Aucune autre entrée n'entre dans la couche canonique.

### 3.2 — États applicatifs exclus (4 entrées)

Les 4 entrées classifiées comme états applicatifs par LOT-P1-2.1 (§3.2) restent hors de la couche canonique. Elles ne font l'objet d'aucune migration dans LOT-P1-2.2.

| # | Entrée | Famille LOT-P1 | Raison de l'exclusion |
|---|---|---|---|
| 11 | Paramètres | F4 | Réserve de configuration applicative sans contenu comportemental ni écriture active (LOT-P1-2.1 §3.3) |
| 12 | Identité locale | F5 | Donnée d'authentification à valeur fonctionnelle, non historique |
| 13 | État de navigation | F5 | État courant de l'interface, transitoire et non historique |
| 14 | Instantané moteur | F5 | Capture de l'état courant destinée à la restauration de session — les sauvegardes historiques sont couvertes par l'entrée 8 |

Ces quatre entrées continuent d'être gérées par l'infrastructure de persistance existante, sans modification. Leur coexistence avec la couche canonique ne nécessite aucun traitement particulier : elles appartiennent à un espace distinct, non régi par le modèle canonique.

### 3.3 — Traitement des cas R1, R3, R4

Les trois cas de datation particuliers, formalisés par LOT-P1-2.1 (§6), reçoivent un traitement spécifique lors de la migration. Ce traitement est établi par le cadrage LOT-P1-2 (§4.3) et précisé par LOT-P1-2.1 (§6.2, §6.3, §6.4).

**Cas R1 — Mémoire comportementale (entrée 2)**

Le champ Date reçoit la valeur formalisée "Non disponible". Le contenu de la mémoire comportementale est préservé intégralement. L'état "Non disponible" est propre aux données antérieures à LOT-P1-2.2.

**Cas R3 — Niveau de garde comportemental (entrée 3)**

Le champ Date reçoit la valeur formalisée "Non disponible". Le contenu du niveau de garde comportemental est préservé intégralement. La distinction entre R1 et R3 est documentaire — les deux cas reçoivent le même état formalisé, mais pour des raisons structurelles distinctes : R1 ne dispose d'aucune enveloppe de datation, R3 dispose d'une information temporelle dans un format non standard. Cette distinction est maintenue dans la présente spécification pour la traçabilité de migration.

**Cas R4 — Paramètres d'ordres récents (entrée 4)**

Le champ Date reçoit la valeur formalisée "Non exploitable au format canonique". Ce cas diffère de R1 et R3 : l'information temporelle existe mais n'est pas conforme au format ISO 8601 UTC requis par le modèle canonique. Le contenu des paramètres d'ordres récents est préservé intégralement. La valeur temporelle originale peut être conservée comme métadonnée de migration à titre documentaire, sans valeur canonique. Une normalisation future de R4 vers ISO 8601 est réservée à un LOT ultérieur non encore défini — elle ne nécessite pas de modifier la structure du modèle canonique.

**Règle commune R1, R3, R4**

Dans les trois cas, le champ Date porte une valeur formalisée reconnue par le modèle — il n'est jamais laissé nul. Cette règle est un invariant du modèle canonique (MI-3, LOT-P1-2.1 §9). La date de migration peut être conservée comme métadonnée de migration distincte — elle ne constitue pas la date canonique de la trace. Toute nouvelle écriture dans l'une de ces entrées après la migration produit un horodatage ISO 8601 UTC fourni par la couche.

---

## 4 — Architecture de la couche cible

### 4.1 — Organisation par famille

La couche cible organise les traces mémorielles par famille ACF V1. Chaque famille constitue un compartiment isolé. Les opérations sur un compartiment n'affectent pas les autres (invariant MI-6, LOT-P1-2.1 §9).

Les quatre familles actives en Phase A sont : SY1 — Comportementale, SY3 — Décisionnelle, S1 — Transactionnelle, S2 — Patrimoniale.

Les neuf familles ACF V1 sans entrée à migrer en Phase A (S3, S4, S5, SY2, SY4, L1, L2, L3, Référentiel) sont présentes dans le registre des familles de la couche. Elles sont architecturalement disponibles mais vides. Leur présence dans le registre satisfait l'invariant MI-5 (registre des familles fermé) et le principe de dégradation gracieuse (I-09 de l'ACF V1).

À l'intérieur de chaque compartiment, les traces sont ordonnées chronologiquement par date d'écriture. Cet ordre est l'ordre naturel de lecture.

### 4.2 — Interface d'écriture et validation

La couche expose une interface d'écriture unique. Toute trace mémorielle entre dans la couche exclusivement par cette interface. Aucune écriture directe contournant l'interface n'est autorisée.

L'interface valide, avant toute persistance, les conditions suivantes :

- La présence du champ Famille et sa conformité au registre des familles ACF V1 (règle RV1, LOT-P1-2.1 §8)
- La présence du champ Source, non vide (règle RV2, LOT-P1-2.1 §8)
- La présence du champ Date — horodatage ISO 8601 UTC ou état formalisé reconnu (règle RV3, LOT-P1-2.1 §8)
- La présence d'une valeur non vide portée par la trace — la donnée qu'elle stocke (règle RV4, LOT-P1-2.1 §8). Une valeur absente ou sémantiquement vide est traitée comme une valeur absente : le rejet s'applique selon les mêmes règles qu'une valeur absente. Une chaîne vide ne constitue pas une valeur valide. La couche ne substitue pas silencieusement une valeur par défaut.

Toute écriture ne satisfaisant pas l'une de ces conditions est rejetée avant toute persistance. La couche ne complète pas silencieusement les champs manquants. Le rejet est explicite (§8.3, LOT-P1-2.1).

L'écriture est atomique : la trace est écrite dans son intégralité ou n'est pas écrite (règle RE1, LOT-P1-2.1 §8). Une écriture partielle n'est pas un état valide de la couche.

Une trace persistée est immutable. La couche ne connaît pas l'opération de mise à jour — une correction s'opère par l'écriture d'une nouvelle trace, l'ancienne étant conservée (invariant MI-2, règle RE3, LOT-P1-2.1 §8-9).

### 4.3 — Modes de lecture

La couche expose, à l'issue de LOT-P1-2.2, un mode de lecture de base : la lecture par famille. Ce mode retourne l'ensemble des traces d'une famille dans l'ordre chronologique de leur écriture.

Si une famille est absente ou vide, la lecture retourne un ensemble vide — jamais une erreur bloquante (ACF V1 I-09, cadrage LOT-P1-2 §4.5).

La couche ne filtre pas, ne trie pas au-delà de la chronologie, ne produit pas d'agrégat. L'interprétation des traces retournées appartient à la couche appelante.

### 4.4 — Périmètre exclu de LOT-P1-2.2

Les éléments suivants n'appartiennent pas au livrable de LOT-P1-2.2 :

- **L'index triple-axe** (famille, date, session) — construit dans LOT-P1-2.3. La retrouvabilité par date et par session n'est pas opérationnelle à l'issue de LOT-P1-2.2. LOT-P1-2.3 construit l'index sur le corpus déjà présent dans la couche canonique — les traces issues de la migration sont incluses dans ce corpus. Aucune trace migrée n'est destinée à rester hors index (cadrage LOT-P1-2 §6, LOT-P1-2.3).
- **La doctrine de provenance** — formalisée dans LOT-P1-2.4. Les unités de session proposées dans LOT-P1-2.1 (§7) ne sont pas encore arrêtées.
- **La validation terrain** — conduite dans LOT-P1-2.5.
- **Toute interface visible opérateur** — la couche canonique est une infrastructure. Elle ne produit aucun texte, aucun affichage, aucun composant accessible à l'opérateur.

---

## 5 — Stratégie de migration et coexistence

### 5.1 — Remplacement transparent

La couche canonique remplace l'ancienne infrastructure comme contrat d'écriture unique pour les traces mémorielles. Elle ne lui est pas parallèle durablement — elle la remplace.

Le remplacement est transparent pour les modules applicatifs. Les modules décisionnel, comportemental et OI V1 ne sont pas modifiés dans leur logique. Ils continuent d'appeler les mêmes accesseurs de persistance. C'est la couche d'infrastructure qui reçoit ces appels qui est restructurée pour router les traces mémorielles à travers l'interface canonique.

Les états applicatifs (entrées 11 à 14) ne transitent pas par la couche canonique. Ils continuent d'être gérés par l'infrastructure existante, sans modification.

Cette frontière est invariante : la classification des entrées est établie par LOT-P1-2.1 et s'impose à tous les modules. Aucun module applicatif ne peut décider unilatéralement qu'une donnée qu'il produit est une trace mémorielle.

### 5.2 — Plan de migration par famille active

Les 10 traces mémorielles sont migrées vers leur compartiment de famille ACF V1 respectif. L'ordre de migration entre familles n'est pas contraint logiquement — chaque famille peut être migrée indépendamment. La migration de la couche entière doit être complète avant la validation de LOT-P1-2.2 : aucune famille ne reste partiellement migrée à l'issue de la sous-phase.

**SY1 — Comportementale**

Six entrées migrent vers le compartiment SY1 : Sessions comportementales (entrée 1), Mémoire comportementale (entrée 2), Niveau de garde comportemental (entrée 3), Paramètres d'ordres récents (entrée 4), Mémoire opérateur (entrée 5), Historique des analyses opérateur (entrée 6).

Les entrées 2 et 3 font l'objet du traitement R1 et R3 respectivement (§3.3). L'entrée 4 fait l'objet du traitement R4 (§3.3). Les entrées 1, 5 et 6 disposent d'une datation disponible au format standard.

**SY3 — Décisionnelle**

Deux entrées migrent vers le compartiment SY3 : Journal des décisions moteur (entrée 7) et Sauvegardes moteur (entrée 8). Toutes deux disposent d'une datation disponible au format standard.

**S1 — Transactionnelle**

Une entrée migre vers le compartiment S1 : Registre des importations (entrée 9). Elle dispose d'une datation disponible au format standard.

**S2 — Patrimoniale**

Une entrée migre vers le compartiment S2 : Portefeuille (entrée 10). Elle dispose d'une datation disponible au format standard.

**Règle commune à toutes les familles**

Pour chaque entrée migrée :

- Le contenu est préservé intégralement — aucune donnée n'est transformée ni tronquée lors de la migration.
- Le champ Date reçoit l'horodatage ISO 8601 UTC extrait des métadonnées d'origine si disponible au format standard, ou la valeur formalisée correspondante pour R1, R3 et R4 (§3.3).
- La date de migration n'est jamais substituée à la date canonique de la trace. Elle peut être conservée comme métadonnée de migration distincte à titre documentaire.
- Le champ Contexte est optionnel. S'il est reconstructible depuis les données d'origine au moment de la migration, il peut être fourni. Il ne peut pas être inventé.

### 5.3 — Préservation des données d'origine et réversibilité

Pendant toute la durée de LOT-P1-2.2, les données d'origine sont préservées dans leur format actuel, en parallèle des données migrées dans la couche canonique. Cette préservation constitue le mécanisme de réversibilité défini par le cadrage LOT-P1-2 (§4.7, risque R-REG-01). Ce mécanisme est actif à tout moment de la migration — y compris en cas de défaillance partielle survenant entre deux familles.

La suppression des données d'origine n'est autorisée qu'à l'issue de la validation complète de LOT-P1-2.5 (validation terrain). Elle est simultanée pour l'ensemble des entrées migrées — aucune suppression partielle par famille n'est autorisée avant cette validation. Si la validation de LOT-P1-2.5 conclut à un échec, les données d'origine permettent un retour à l'état précédent sans perte.

---

## 6 — Points de vigilance

### 6.1 — Garanties Hardening (LOT-H01 / LOT-H02)

Les lots LOT-H01 et LOT-H02 ont introduit des gardes contre des conditions de défaillance identifiées. Ces gardes doivent être présents et actifs dans la couche canonique à l'issue de la migration.

Les gardes concernés sont :

- Protection contre le dépassement de capacité de la couche de persistance (LOT-H02)
- Gestion des conditions d'erreur lors des opérations de lecture et d'écriture (LOT-H01)
- Validation des données entrantes — rejet des données corrompues ou hors format à l'import (LOT-H02)

La migration ne peut pas réduire, contourner ou supprimer ces gardes. Chaque garde existant doit faire l'objet d'une vérification explicite dans le cadre de LOT-P1-2.2. Cette vérification est un prérequis à la validation de la sous-phase.

Ce point constitue le risque R-REG-02 du cadrage LOT-P1-2 (§7.1) et le critère de validation CV6 (§8 du présent document).

### 6.2 — Compatibilité Compte Utilisateur V1

Le Compte Utilisateur V1 exporte et importe un ensemble défini d'entrées de la couche de persistance. La migration vers la couche canonique ne doit pas rompre cette compatibilité.

Deux conditions doivent être satisfaites à l'issue de LOT-P1-2.2 :

1. Les exports produits avant la migration restent importables après migration. Un export produit dans l'ancienne structure peut être réintégré sans perte dans la couche canonique.
2. Les exports produits après la migration par la couche canonique sont importables par le Compte Utilisateur V1 existant.

Si une procédure de conversion est nécessaire pour satisfaire l'une ou l'autre de ces conditions, elle doit être définie et documentée dans LOT-P1-2.2 avant la validation terrain.

Ce point constitue le risque R-REG-03 du cadrage LOT-P1-2 (§7.1) et le critère de validation CV8 (§8 du présent document).

### 6.3 — Cohérence Diagnostic mémoriel (LOT-P1)

Le Diagnostic mémoriel produit par LOT-P1 lit la couche de persistance. Si la migration modifie la structure des données sans adapter la couche de lecture du diagnostic, les valeurs affichées peuvent devenir incohérentes ou vides.

Le principe de remplacement transparent (§5.1) répond structurellement à ce risque : les modules applicatifs, dont le Diagnostic mémoriel, continuent d'utiliser la même interface de lecture — seule la couche interne est restructurée. La cohérence du Diagnostic est préservée si et seulement si ce remplacement est effectivement transparent.

La migration inclut une vérification de la cohérence du Diagnostic mémoriel après chaque famille migrée. Les 19 scénarios de validation de LOT-P1 (rapport `2223e15`) constituent la référence de non-régression.

Ce point constitue le risque R-UX-01 du cadrage LOT-P1-2 (§7.4) et le critère de validation CV7 (§8 du présent document).

---

## 7 — Conformité doctrinale

| Référentiel | Champ vérifié | Statut |
|---|---|---|
| ACF V1 — I-01 (local-first) | La couche canonique est strictement locale — aucune interface réseau | Conforme |
| ACF V1 — I-02 (autorité humaine) | La couche stocke et restitue — elle ne décide pas | Conforme |
| ACF V1 — I-03 (Lecture ≠ Action) | La couche est infrastructure — elle n'émet aucun message à l'opérateur | Conforme |
| ACF V1 — I-04 (silence structurel) | Une famille absente retourne un ensemble vide — jamais une erreur | Conforme |
| ACF V1 — I-05 (mémoire comme cœur) | La migration place les 10 traces mémorielles au cœur de la couche | Conforme |
| ACF V1 — I-06 (profil interdit) | La couche stocke des traces atomiques — elle n'agrège pas de profil | Conforme |
| ACF V1 — I-07 (corrélation non imposée) | La couche stocke et restitue — elle ne corrèle pas | Conforme |
| ACF V1 — I-08 (provenance traçable) | Champs Source et Date obligatoires — rejet de toute écriture sans source | Conforme — objectif central |
| ACF V1 — I-09 (dégradation gracieuse) | Famille absente ou vide = ensemble vide, pas d'erreur bloquante | Conforme |
| ACF V1 — I-10 (valeur temporelle) | Le champ Date, présent sur chaque trace, fonde la lecture chronologique | Conforme |
| Language System V1 | Aucun terme visible opérateur n'est défini ou modifié dans ce document | Conforme |
| Memory Doctrine V1 | La migration formalise les traces mémorielles identifiées par LOT-P1 dans la couche mémorielle | Conforme |
| Pattern Reflection Doctrine V1 | La couche trace des événements — elle ne produit pas de patterns | Conforme |
| Operator Intelligence V1 | Les données OI V1 (entrées 5 et 6) migrent vers SY1 — cohérent avec leur nature comportementale | Conforme |
| Doctrine de Gouvernance V1 | Spécification de migration produite avant toute implémentation — niveau correct dans la hiérarchie | Conforme |
| Roadmap V1 | LOT-P1-2.2 est la deuxième sous-phase du premier livrable P1 Phase A | Conforme |

---

## 8 — Critères de validation

Les critères suivants sont applicables à LOT-P1-2.2. Ils sont extraits des critères CV1-CV8 du cadrage LOT-P1-2 (§8) et appliqués au périmètre de cette sous-phase.

**CV1 — Modèle canonique satisfait**
Chaque trace migrée porte les quatre champs du modèle canonique : famille, source, date, contexte si disponible. Les trois cas particuliers R1, R3, R4 portent leur état formalisé dans le champ Date — ce champ n'est jamais nul dans une trace persistée.

**CV2 — Indépendance de la couche**
La couche de persistance canonique n'importe aucune logique applicative. Elle n'appelle aucun moteur. Elle ne connaît que les familles mémoire et les traces. Un remplacement de la couche sous-jacente ne devrait pas nécessiter de modification des modules qui l'utilisent.

**CV4 — Provenance systématique**
Aucune écriture dans la couche ne peut aboutir sans que la source soit fournie. Le mécanisme de rejet est actif pour toute écriture sans source. Il n'est pas contournable.

**CV5 — Aucune perte de données**
Les 10 traces mémorielles sont présentes dans la couche canonique après migration, leurs valeurs identiques à celles observées avant migration. Les entrées R1, R3 et R4 portent leur état formalisé dans le champ Date. Les 4 états applicatifs restent présents et accessibles dans l'infrastructure existante.

**CV6 — Garanties Hardening préservées**
Les gardes introduits par LOT-H01 et LOT-H02 sont présents et actifs dans la couche canonique. Chaque garde a fait l'objet d'une vérification explicite avant validation de la sous-phase.

**CV7 — Diagnostic mémoriel non régressé**
Le Diagnostic mémoriel (LOT-P1) affiche des données cohérentes après migration. Aucun des 19 scénarios de validation de LOT-P1 ne régresse.

**CV8 — Compatibilité export/import préservée**
Les exports produits avant la migration restent importables après migration. Les exports produits par la couche canonique sont importables par le Compte Utilisateur V1 existant. Toute procédure de conversion est documentée avant la validation terrain.

**Note :** CV3 (indexation opérationnelle par date et par session) relève de LOT-P1-2.3. Il n'est pas attendu à l'issue de LOT-P1-2.2.

---

*Spécification officielle LOT-P1-2.2 — Couche de persistance locale structurée V1 — Programme P1 · Phase A · Caméléon Engine · 2026-07-07.*
