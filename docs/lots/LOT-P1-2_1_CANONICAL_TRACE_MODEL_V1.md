# LOT-P1-2.1 — Modèle canonique de trace V1
## Spécification officielle — Première sous-phase de LOT-P1-2

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-2.1 |
| Titre | Modèle canonique de trace V1 |
| Sous-phase de | LOT-P1-2 — Couche de persistance canonique V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Spécification |
| Statut | SPÉCIFICATION EN COURS |
| Prérequis satisfaits | LOT-P1 — CLOS · `2223e15` |
| Cadrage de référence | `docs/lots/LOT-P1-2_CANONICAL_PERSISTENCE_V1.md` · `7b6c7cd` |
| Date de rédaction | 2026-07-07 |

---

## 1 — Mission

LOT-P1-2.1 produit la spécification du modèle canonique de trace.

Cette spécification est le prérequis formel de LOT-P1-2.2 — la couche de persistance ne peut pas être construite sans un modèle validé. Elle est le document de référence auquel LOT-P1-2.2 doit se conformer pour chaque décision de migration.

La mission de ce document est triple :

1. Établir la classification définitive des 14 entrées inventoriées par LOT-P1 — chaque entrée est soit une trace mémorielle (et reçoit une famille ACF V1), soit un état applicatif (et reste hors de la couche canonique).

2. Valider le modèle canonique de trace — ses quatre champs, leurs contraintes, et leurs états formalisés — contre chacune des 14 entrées de l'inventaire.

3. Proposer les unités de session pour chaque famille active, destinées à être formalisées dans LOT-P1-2.4 (Doctrine de provenance).

Ce document ne prescrit aucune implémentation. Il ne décrit ni clé de stockage, ni structure de données, ni technologie de persistance. Il définit le modèle — pas comment le réaliser.

---

## 2 — Relation au cadrage LOT-P1-2

Le cadrage LOT-P1-2 (`7b6c7cd`) établit le modèle canonique de trace dans ses grandes lignes. Cette spécification complète le cadrage sur les points qu'il laisse ouverts intentionnellement. Elle ne modifie aucun élément du cadrage.

**Ce que le cadrage établit et que cette spécification ne redouble pas :**

- Les quatre champs du modèle canonique (famille, source, date, contexte) et leurs contraintes générales (cadrage §4.2)
- La frontière entre traces mémorielles et états applicatifs, et son critère de qualification (cadrage §4.1)
- Les trois cas de datation formalisés : R1 (non disponible), R3 (non disponible), R4 (non exploitable au format canonique) (cadrage §4.3)
- La définition de l'axe session comme identifiant opaque fourni par le module écrivant (cadrage §4.8)
- Les risques, les critères de validation CV1-CV8 et les conditions de clôture (cadrage §7, §8, §10)

**Ce que cette spécification ajoute :**

- La classification explicite de chacune des 14 entrées LOT-P1 (§3)
- La validation des quatre champs du modèle contre chacune des 14 entrées (§4 et §5)
- La formalisation détaillée des trois cas particuliers (§6)
- La proposition concrète d'unités de session par famille active (§7)
- Les règles formelles de validation d'une trace (§8)
- Les invariants propres au modèle canonique de trace (§9)
- Les critères de compatibilité pour l'ajout d'une nouvelle famille (§10)

---

## 3 — Classification des 14 entrées LOT-P1

### 3.1 — Critère de classification

Une entrée est une **trace mémorielle** si et seulement si elle peut être assignée à l'une des 13 familles définies par l'Architecture Conceptuelle Fondatrice V1 (S1 à S5, SY1 à SY4, L1 à L3, Référentiel). L'assignation est obligatoire et explicite — aucune trace n'entre dans la couche canonique sans famille déclarée.

Une entrée est un **état applicatif** si sa valeur est fonctionnelle et contextuelle pour l'application à un instant donné — elle sert le fonctionnement courant de l'application mais ne possède pas de valeur historique ou réflexive pour le décideur.

Ce critère est établi par le cadrage LOT-P1-2 §4.1. Il s'applique à chacune des 14 entrées inventoriées par LOT-P1.

### 3.2 — Table de classification

Les familles de diagnostic LOT-P1 (F1 à F5) et les familles ACF V1 sont deux niveaux distincts. La colonne "Famille LOT-P1" indique l'organisation du diagnostic mémoriel. La colonne "Famille ACF V1" indique la classification dans la couche canonique.

| # | Entrée | Famille LOT-P1 | Classification | Famille ACF V1 |
|---|---|---|---|---|
| 1 | Sessions comportementales | F1 | Trace mémorielle | SY1 — Comportementale |
| 2 | Mémoire comportementale | F1 | Trace mémorielle | SY1 — Comportementale |
| 3 | Niveau de garde comportemental | F1 | Trace mémorielle | SY1 — Comportementale |
| 4 | Paramètres d'ordres récents | F1 | Trace mémorielle | SY1 — Comportementale |
| 5 | Mémoire opérateur | F2 | Trace mémorielle | SY1 — Comportementale |
| 6 | Historique des analyses opérateur | F2 | Trace mémorielle | SY1 — Comportementale |
| 7 | Journal des décisions moteur | F3 | Trace mémorielle | SY3 — Décisionnelle |
| 8 | Sauvegardes moteur | F3 | Trace mémorielle | SY3 — Décisionnelle |
| 9 | Registre des importations | F4 | Trace mémorielle | S1 — Transactionnelle |
| 10 | Portefeuille | F4 | Trace mémorielle | S2 — Patrimoniale |
| 11 | Paramètres | F4 | État applicatif | — |
| 12 | Identité locale | F5 | État applicatif | — |
| 13 | État de navigation | F5 | État applicatif | — |
| 14 | Instantané moteur | F5 | État applicatif | — |

### 3.3 — Note sur l'entrée "Paramètres" (entrée 11)

L'entrée "Paramètres" (F4 — Données opérateur) est classée **état applicatif** à l'issue d'une analyse du code existant et d'une décision opérateur.

**Fondements de la décision.** L'analyse du système révèle que cette entrée est structurellement préparée (incluse dans l'export et la synchronisation) mais ne reçoit aucune écriture lors du fonctionnement normal de l'application : aucun module ne lui fournit de données comportementales ou de valeur historique. Aucune interface ni aucun moteur ne la lit à des fins fonctionnelles. Son contenu actuel est nul. Sa sémantique correspond à une réserve de préférences applicatives, non à une trace mémorielle.

**Conséquence.** L'entrée 11 reste hors de la couche canonique en Phase A. Aucune migration n'est requise dans LOT-P1-2.2. Si une version future du système popule ce slot avec des données de valeur comportementale ou historique, la reclassification sera traitée dans le LOT concerné.

### 3.4 — Familles ACF V1 actives en Phase A

À l'issue de la classification, les familles ACF V1 effectivement présentes dans la couche canonique en Phase A sont :

| Famille ACF V1 | Entrées classifiées |
|---|---|
| SY1 — Comportementale | Sessions comportementales · Mémoire comportementale · Niveau de garde comportemental · Paramètres d'ordres récents · Mémoire opérateur · Historique des analyses opérateur |
| SY3 — Décisionnelle | Journal des décisions moteur · Sauvegardes moteur |
| S1 — Transactionnelle | Registre des importations |
| S2 — Patrimoniale | Portefeuille |

Les familles S3, S4, S5, SY2, SY4, L1, L2, L3 et Référentiel ne reçoivent aucune entrée des 14 inventoriées. Elles sont architecturalement présentes dans le registre des familles de la couche canonique, mais n'ont pas de trace à migrer en Phase A.

---

## 4 — Validation du modèle canonique sur chacune des 14 entrées

### 4.1 — Structure de la validation

Pour chaque trace mémorielle, les quatre champs du modèle canonique sont validés :

- **Famille** : famille ACF V1 assignée (issue de §3)
- **Source** : module ou opération à l'origine de l'écriture
- **Date** : état de disponibilité selon la classification LOT-P1.3
- **Contexte** : niveau d'enrichissement contextuel disponible

Pour les états applicatifs, la validation confirme leur exclusion de la couche canonique et précise la raison.

### 4.2 — F1 — Mémoire comportementale

**Entrée 1 — Sessions comportementales**

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | SY1 — Comportementale |
| Source | Module d'analyse comportementale |
| Date | Disponible — datation standard (LOT-P1.3 §2.1) |
| Contexte | Enrichissable — la session comportementale fournit un contexte naturel (fichier analysé, score comportemental, label obtenu) |

**Entrée 2 — Mémoire comportementale** (R1)

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | SY1 — Comportementale |
| Source | Module d'analyse comportementale |
| Date | Non disponible — état formalisé (voir §6, cas R1) |
| Contexte | Enrichissable — le contexte de la synthèse comportementale peut être documenté au moment de l'écriture |

**Entrée 3 — Niveau de garde comportemental** (R3)

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | SY1 — Comportementale |
| Source | Module d'analyse comportementale |
| Date | Non disponible — état formalisé (voir §6, cas R3) |
| Contexte | Enrichissable |

**Entrée 4 — Paramètres d'ordres récents** (R4)

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | SY1 — Comportementale |
| Source | Module d'enregistrement des ordres récents |
| Date | Non exploitable au format canonique — état formalisé (voir §6, cas R4) |
| Contexte | Enrichissable — les paramètres d'ordres contiennent implicitement un contexte d'activité |

### 4.3 — F2 — Mémoire opérateur

**Entrée 5 — Mémoire opérateur**

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | SY1 — Comportementale |
| Source | Module OI V1 (Operator Intelligence) |
| Date | Disponible — datation standard (LOT-P1.3 §2.1) |
| Contexte | Enrichissable — le contexte de l'analyse OI (indicateur évalué, période couverte) peut être documenté |

**Entrée 6 — Historique des analyses opérateur**

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | SY1 — Comportementale |
| Source | Module OI V1 (Operator Intelligence) |
| Date | Disponible — datation standard (LOT-P1.3 §2.1) |
| Contexte | Enrichissable — chaque analyse OI est contextualisée par les indicateurs évalués et la période couverte |

### 4.4 — F3 — Mémoire décisionnelle

**Entrée 7 — Journal des décisions moteur**

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | SY3 — Décisionnelle |
| Source | Moteur décisionnel |
| Date | Disponible — datation standard (LOT-P1.3 §2.1) |
| Contexte | Naturellement riche — chaque décision moteur est produite dans un contexte de marché documenté (posture, état marché, niveau d'engagement) |

**Entrée 8 — Sauvegardes moteur**

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | SY3 — Décisionnelle |
| Source | Moteur décisionnel |
| Date | Disponible — datation standard (LOT-P1.3 §2.1) |
| Contexte | Enrichissable — chaque sauvegarde capte l'état complet du moteur à un instant donné, fournissant un contexte décisionnel dense |

### 4.5 — F4 — Données opérateur

**Entrée 9 — Registre des importations**

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | S1 — Transactionnelle |
| Source | Module d'import |
| Date | Disponible — datation standard (LOT-P1.3 §2.1) |
| Contexte | Enrichissable — type de fichier importé, nombre d'enregistrements, résultat de l'import |

**Entrée 10 — Portefeuille**

| Champ | Valeur dans le modèle canonique |
|---|---|
| Famille | S2 — Patrimoniale |
| Source | Module portefeuille |
| Date | Disponible — datation standard (LOT-P1.3 §2.1) |
| Contexte | Enrichissable — composition du portefeuille, actifs présents, date de la mise à jour |

**Entrée 11 — Paramètres**

État applicatif (§3.3). Cette entrée est une réserve de configuration applicative sans contenu comportemental ni écriture active. Elle ne possède pas de famille ACF V1. Exclusion confirmée.

### 4.6 — F5 — Système local

Les trois entrées de F5 sont des états applicatifs. Elles ne satisfont pas le critère de qualification d'une trace mémorielle (§3.1). Elles restent hors de la couche canonique.

**Entrée 12 — Identité locale**

Donnée d'authentification et d'identité de compte. Sa valeur est fonctionnelle (permettre à l'application d'identifier l'opérateur) et non historique. Elle ne possède pas de famille ACF V1. Exclusion confirmée.

**Entrée 13 — État de navigation**

État courant de l'interface (onglet actif, état des panneaux). Sa valeur est contextuelle et transitoire — elle sert l'expérience utilisateur à un instant donné. Elle ne possède pas de valeur historique pour le décideur. Exclusion confirmée.

**Entrée 14 — Instantané moteur**

Capture de l'état courant du moteur décisionnel, destinée à la restauration de l'interface lors du rechargement de la page. Sa valeur est contextuelle — elle restitue l'état de la session en cours, pas un historique. Les sauvegardes historiques du moteur sont couvertes par l'entrée 8 (Sauvegardes moteur). Exclusion confirmée.

---

## 5 — Validation des quatre champs du modèle canonique

### 5.1 — Champ Famille

**Règle.** Le champ Famille doit contenir une valeur issue de l'ensemble ACF V1 : S1 à S5, SY1 à SY4, L1 à L3, Référentiel. Aucune valeur hors de cet ensemble n'est valide. L'ensemble est fermé — toute extension nécessite une décision doctrinale (voir §10).

**Validation.** Les 10 traces mémorielles classifiées reçoivent une famille valide : SY1 (6 entrées), SY3 (2 entrées), S1 (1 entrée), S2 (1 entrée). Les entrées 11, 12, 13 et 14 sont exclues — l'absence de famille ACF V1 confirme leur statut d'état applicatif.

**Couverture Phase A.** Quatre familles reçoivent des traces en Phase A : SY1, SY3, S1, S2. Les neuf familles restantes (S3, S4, S5, SY2, SY4, L1, L2, L3, Référentiel) sont architecturalement présentes dans le registre mais vides en Phase A.

### 5.2 — Champ Source

**Règle.** Le champ Source doit être non nul. Toute écriture dans la couche canonique sans source identifiée est rejetée. La source est le module ou l'opération qui produit la trace — elle est fournie par le module écrivant au moment de l'écriture.

**Validation des 10 traces mémorielles :**

| Entrée | Source identifiée |
|---|---|
| Sessions comportementales | Module d'analyse comportementale |
| Mémoire comportementale | Module d'analyse comportementale |
| Niveau de garde comportemental | Module d'analyse comportementale |
| Paramètres d'ordres récents | Module d'enregistrement des ordres récents |
| Mémoire opérateur | Module OI V1 |
| Historique des analyses opérateur | Module OI V1 |
| Journal des décisions moteur | Moteur décisionnel |
| Sauvegardes moteur | Moteur décisionnel |
| Registre des importations | Module d'import |
| Portefeuille | Module portefeuille |

Toutes les sources sont identifiables. Cette liste constitue le référentiel de sources actives en Phase A. Elle n'est pas exhaustive — LOT-P1-2.4 (Doctrine de provenance) fixera les valeurs officielles de source pour chaque famille.

### 5.3 — Champ Date

**Règle.** Le champ Date porte obligatoirement une valeur. Cette valeur est soit un horodatage ISO 8601 UTC, soit un état formalisé parmi les états reconnus par le modèle. Le champ Date ne peut jamais être nul ou non renseigné.

**États formalisés reconnus par le modèle :**

| État | Signification | Entrées concernées |
|---|---|---|
| Non disponible | La structure actuelle de cette entrée ne contient aucune métadonnée de datation lisible | Mémoire comportementale (R1) · Niveau de garde comportemental (R3) |
| Non exploitable au format canonique | Une information temporelle est présente, mais dans un format non conforme à ISO 8601 UTC | Paramètres d'ordres récents (R4) |

**Validation.** Sur les 10 traces mémorielles : 7 ont une date disponible au format standard, 2 ont l'état formalisé "Non disponible", 1 a l'état formalisé "Non exploitable au format canonique". Tous les cas sont couverts. Aucun cas non formalisé n'est identifié.

### 5.4 — Champ Contexte

**Règle.** Le champ Contexte est facultatif. Son absence ne constitue pas une violation du modèle. Sa présence enrichit la valeur de la trace pour les couches L2 (Corrélateur) et L3 (Assistant Mémoire). Le format du contexte n'est pas contraint par le modèle canonique — il est défini par chaque famille dans sa doctrine de provenance.

**Validation.** Toutes les 10 traces mémorielles peuvent recevoir un contexte. La richesse du contexte disponible varie selon l'entrée. Aucune entrée n'est structurellement incompatible avec le champ Contexte.

---

## 6 — Formalisation définitive des cas R1, R3, R4

### 6.1 — Statut des trois cas dans le modèle

R1, R3 et R4 sont trois états légitimes du champ Date dans le modèle canonique de trace. Ils ne sont pas des anomalies ou des exceptions à traiter — ils sont des états formellement déclarés. Le cadrage LOT-P1-2 (§4.3) les reconnaît explicitement. Cette section formalise chaque cas dans le détail requis par LOT-P1-2.2 pour la migration.

### 6.2 — Cas R1 — Mémoire comportementale

**Désignation dans le modèle :** Date = "Non disponible"

**Nature du cas.** La structure dans laquelle est stockée la mémoire comportementale synthétisée ne contient pas de métadonnée de datation. L'information temporelle n'est pas accessible. Cette caractéristique a été établie et confirmée par LOT-P1 (scénario V7, verdict PASS) et documentée dans LOT-P1.3 §2.2 : "Structure brute sans enveloppe de datation".

**Traitement à la migration.** Lors de la migration de cette entrée vers la couche canonique, le champ Date reçoit la valeur formalisée "Non disponible". Le contenu (la mémoire comportementale) est préservé intégralement. La date de migration elle-même peut être conservée comme métadonnée de migration distincte, conformément au cadrage §4.2 — elle ne constitue pas la date canonique de la trace.

**Traitement lors des nouvelles écritures.** Après la migration, toute nouvelle écriture dans cette entrée produit un horodatage ISO 8601 UTC fourni par la couche au moment de l'écriture. L'état "Non disponible" est propre aux données antérieures à LOT-P1-2.2. Les nouvelles données seront datées normalement.

**Chemin de normalisation future.** Aucun LOT n'est défini pour normaliser rétrospectivement les dates "Non disponible" de l'historique existant. Cette normalisation rétroactive n'est pas un objectif de la Phase A.

### 6.3 — Cas R3 — Niveau de garde comportemental

**Désignation dans le modèle :** Date = "Non disponible"

**Nature du cas.** Le niveau de garde comportemental expose une information temporelle, mais dans un format non standard — non conforme à l'enveloppe de datation. Cette information ne peut pas être utilisée comme source de datation canonique. Ce cas a été établi et confirmé par LOT-P1 (scénario V8, verdict PASS) et documenté dans LOT-P1.3 §2.3 : "Information temporelle disponible dans un format non standard, non conforme à l'enveloppe de datation".

**Traitement à la migration.** Identique à R1 — le champ Date reçoit la valeur formalisée "Non disponible". Le contenu est préservé intégralement. La date de migration peut être conservée comme métadonnée distincte.

**Traitement lors des nouvelles écritures.** Après la migration, toute nouvelle écriture produit un horodatage ISO 8601 UTC.

**Distinction R1 / R3.** Les deux cas partagent l'état formalisé "Non disponible", mais pour des raisons structurelles distinctes : R1 ne dispose d'aucune enveloppe de datation, R3 dispose d'une information temporelle dans un format non standard. Cette distinction est documentée dans LOT-P1.3 §2.2 et §2.3 respectivement. Elle ne produit pas d'état formalisé différent dans le modèle canonique — les deux reçoivent "Non disponible" — mais elle est maintenue dans la documentation de migration de LOT-P1-2.2 pour la traçabilité.

### 6.4 — Cas R4 — Paramètres d'ordres récents

**Désignation dans le modèle :** Date = "Non exploitable au format canonique"

**Nature du cas.** Les paramètres d'ordres récents exposent une information temporelle sous forme d'horodatage en millisecondes d'époque. Ce format n'est pas conforme au format ISO 8601 UTC requis par le champ Date du modèle canonique. L'information temporelle existe mais ne peut pas être utilisée directement. Ce cas a été établi par LOT-P1 (amendement R4, `77cb7c3`) et documenté dans LOT-P1.3 §2.3 : "Information temporelle présente sous forme epoch millisecondes, non conforme à l'enveloppe ISO 8601 autorisée".

**Traitement à la migration.** Lors de la migration, le champ Date reçoit la valeur formalisée "Non exploitable au format canonique". Le contenu (les paramètres d'ordres) est préservé intégralement. La date de migration peut être conservée comme métadonnée distincte. La valeur epoch millisecondes originale peut également être conservée comme métadonnée de migration à titre documentaire, sans valeur canonique.

**Traitement lors des nouvelles écritures.** Après la migration, toute nouvelle écriture produit un horodatage ISO 8601 UTC.

**Chemin de normalisation future.** Une normalisation des horodatages epoch millisecondes en ISO 8601 UTC est techniquement réalisable pour R4, contrairement à R1 et R3. Le cadrage LOT-P1-2 §4.3 réserve cette normalisation à un LOT ultérieur non encore défini. Elle ne nécessite pas de modifier la structure du modèle canonique — elle remplace la valeur formalisée par un horodatage ISO 8601 pour les traces concernées.

**Distinction R4 / R1-R3.** R4 possède une information temporelle réelle (epoch millisecondes) alors que R1 et R3 n'en ont pas de directement exploitable. C'est pourquoi R4 reçoit un état formalisé distinct : "Non exploitable au format canonique" vs "Non disponible". Cette distinction anticipe la possibilité de normalisation future : R4 peut être normalisé par conversion de format, R1 et R3 ne peuvent pas l'être sans écriture active de nouvelles données.

---

## 7 — Proposition des unités de session par famille active

### 7.1 — Cadre de la proposition

Le cadrage LOT-P1-2 §4.8 définit la session comme un identifiant opaque fourni par le module écrivant au moment de l'écriture. La couche n'impose aucune sémantique à cet identifiant — elle indexe sur la valeur fournie.

La définition des unités de session officielles par famille relève de LOT-P1-2.4 (Doctrine de provenance). Cette section propose les unités naturelles identifiables à partir de l'inventaire LOT-P1 et de la nature des données. Ces propositions sont soumises à validation dans LOT-P1-2.4.

### 7.2 — Propositions par famille active

**SY1 — Comportementale**

Six entrées appartiennent à SY1, issues de deux modules distincts : le module d'analyse comportementale (entrées 1 à 4) et le module OI V1 (entrées 5 et 6). Ces modules ont des rythmes d'activité indépendants. La proposition distingue donc les deux sous-groupes.

| Entrée | Unité de session proposée |
|---|---|
| Sessions comportementales | Une session d'analyse comportementale (un import de fichier source analysé) |
| Mémoire comportementale | L'identifiant de la session d'analyse comportementale qui a produit la synthèse |
| Niveau de garde comportemental | L'identifiant de la session d'analyse comportementale qui a produit la mise à jour |
| Paramètres d'ordres récents | Non définie à ce stade — à traiter en priorité dans LOT-P1-2.4 |
| Mémoire opérateur | Une session d'analyse OI V1 |
| Historique des analyses opérateur | Une session d'analyse OI V1 |

**SY3 — Décisionnelle**

Deux entrées appartiennent à SY3, toutes deux produites par le moteur décisionnel au moment de la soumission du formulaire.

| Entrée | Unité de session proposée |
|---|---|
| Journal des décisions moteur | Une soumission du formulaire décisionnel |
| Sauvegardes moteur | Une soumission du formulaire décisionnel |

**S1 — Transactionnelle**

| Entrée | Unité de session proposée |
|---|---|
| Registre des importations | Une opération d'import de fichier source |

**S2 — Patrimoniale**

| Entrée | Unité de session proposée |
|---|---|
| Portefeuille | Une mise à jour du portefeuille par l'opérateur |

### 7.3 — Points à traiter dans LOT-P1-2.4

Trois points nécessitent une décision dans la doctrine de provenance :

1. **Granularité de session SY1.** La famille SY1 regroupe des données de deux modules distincts. La doctrine de provenance doit décider si la session SY1 est définie par module écrivant (un identifiant par module et par exécution) ou de façon globale (un identifiant couvrant les deux modules).

2. **Session de "Paramètres d'ordres récents".** L'unité naturelle de session pour R4 n'est pas évidente à partir des données disponibles. La doctrine de provenance doit la définir explicitement.

3. **Alignement des sessions SY3.** Le Journal des décisions moteur et les Sauvegardes moteur partagent la même unité de session proposée. La doctrine de provenance doit confirmer que l'identifiant de session est identique pour les deux, afin de permettre leur corrélation par l'axe session.

---

## 8 — Règles de validation du modèle

### 8.1 — Règles de validation d'une trace

**RV1 — Famille présente et valide**
Le champ Famille est renseigné et sa valeur appartient à l'ensemble des familles ACF V1. Une trace sans famille est rejetée. Une trace avec une famille non reconnue est rejetée.

**RV2 — Source présente**
Le champ Source est renseigné et non vide. Une trace sans source est rejetée.

**RV3 — Date formalisée**
Le champ Date est renseigné. Sa valeur est soit un horodatage ISO 8601 UTC, soit un état formalisé reconnu : "Non disponible" ou "Non exploitable au format canonique". Un champ Date nul ou vide entraîne le rejet de la trace.

**RV4 — Valeur présente**
La trace porte une valeur — la donnée qu'elle stocke. La politique vis-à-vis des valeurs vides est définie par LOT-P1-2.2.

**RV5 — Contexte optionnel, non contraint**
Le champ Contexte est optionnel. Son absence ne constitue pas une violation du modèle.

### 8.2 — Règles d'écriture

**RE1 — Atomicité de l'écriture**
Une trace est écrite dans son intégralité ou n'est pas écrite. Si l'un des champs obligatoires (Famille, Source, Date) manque, la couche rejette l'écriture avant toute persistance. Aucune écriture partielle n'est autorisée.

**RE2 — Ordre d'écriture**
La trace est écrite avant que l'index ne soit mis à jour. Cet ordre est invariant et conforme au cadrage §5 (Persistance). En cas d'interruption entre les deux opérations, la trace est persistée et l'index peut être en retard — les données ne sont jamais perdues.

**RE3 — Immutabilité**
Une trace écrite ne peut pas être modifiée. Une correction s'opère par l'écriture d'une nouvelle trace — l'ancienne est conservée.

### 8.3 — Règle de rejet

Toute tentative d'écriture ne satisfaisant pas RV1, RV2 ou RV3 est rejetée par la couche avant toute persistance. Le rejet est explicite — la couche ne complète pas silencieusement les champs manquants.

---

## 9 — Invariants du modèle canonique

Les invariants ci-dessous sont propres au modèle canonique de trace. Ils complètent les invariants ACF V1 (I-01 à I-10) sans les répéter.

**MI-1 — Unicité de famille par trace**
Chaque trace appartient à exactement une famille ACF V1. Aucune trace ne peut appartenir à plusieurs familles simultanément. Une donnée couvrant plusieurs familles est décomposée en autant de traces distinctes avant persistance.

**MI-2 — Immutabilité des traces**
Une trace persistée ne peut plus être modifiée. Elle peut être supersédée par une trace plus récente — l'ancienne trace est conservée. Le modèle ne connaît pas l'opération de mise à jour.

**MI-3 — Date jamais nulle**
Le champ Date d'une trace persistée est toujours renseigné. Il ne peut pas être nul ou non défini. Si un horodatage ISO 8601 UTC n'est pas disponible, la trace reçoit un état formalisé reconnu par le modèle.

**MI-4 — Source jamais nulle**
Le champ Source d'une trace persistée est toujours renseigné. Il ne peut pas être nul ou non défini.

**MI-5 — Registre des familles fermé**
L'ensemble des familles ACF V1 est fermé. Aucune famille ne peut être ajoutée à la couche canonique sans décision doctrinale explicite (voir §10). Le modèle canonique ne peut pas être étendu par une décision d'implémentation.

**MI-6 — Indépendance des familles**
Les traces d'une famille sont isolées des traces des autres familles. Une opération sur la famille SY1 ne peut pas modifier les traces de la famille SY3. Cette isolation est garantie par la couche.

**MI-7 — Ordre chronologique de lecture**
Les traces d'une famille sont lues dans l'ordre chronologique de leur écriture. Si deux traces portent un état formalisé ("Non disponible" ou "Non exploitable au format canonique"), leur ordre relatif est celui de leur écriture dans la couche — soit leur ordre de migration lors de LOT-P1-2.2.

---

## 10 — Critères de compatibilité d'une nouvelle famille

### 10.1 — Principe

L'ensemble des familles ACF V1 est fermé (MI-5). L'ajout d'une nouvelle famille à la couche canonique ne peut pas résulter d'une décision d'implémentation — il doit être précédé d'une décision doctrinale formelle. Cette section définit les critères qu'une nouvelle famille doit satisfaire pour être compatible avec le modèle canonique.

### 10.2 — Critères de compatibilité

**CC-1 — Appartenance au référentiel ACF V1**
La famille doit être formellement définie dans l'ACF V1 ou dans une révision formelle de ce document. Elle ne peut pas être définie ad hoc dans la couche canonique. La décision d'extension de l'ACF V1 est un acte de niveau doctrinal (N2 dans la hiérarchie de gouvernance).

**CC-2 — Nature mémorielle confirmée**
Les données de la famille doivent posséder une valeur historique et réflexive pour le décideur. Les données fonctionnelles et contextuelles sont des états applicatifs — elles ne peuvent pas être promues en familles canoniques.

**CC-3 — Source identifiable**
La famille doit avoir au moins une source identifiée. Une famille sans source d'écriture connue ne peut pas être activée dans la couche canonique.

**CC-4 — Comportement de date défini**
La famille doit définir son comportement pour le champ Date : soit la date est disponible (horodatage ISO 8601 UTC produit par la couche), soit elle fait l'objet d'un état formalisé reconnu. Le champ Date ne peut pas être laissé indéfini.

**CC-5 — Session documentée ou absence déclarée**
La doctrine de provenance doit définir l'unité de session de la famille, ou déclarer formellement qu'aucune session ne s'applique. Une famille sans documentation de session ne peut pas être activée.

**CC-6 — Non-recouvrement**
La famille ne doit pas recouvrir une famille existante. Si les données qu'elle contient pourraient appartenir à une famille déjà définie, le conflit doit être résolu au niveau doctrinal avant activation.

### 10.3 — Procédure d'activation d'une nouvelle famille

1. Décision doctrinale formelle (niveau N2) : la famille est ajoutée à l'ACF V1 ou à une révision formelle.
2. Classification des entrées existantes susceptibles d'appartenir à cette famille.
3. Définition du comportement de date et de la source dans la doctrine de provenance.
4. Définition de l'unité de session dans la doctrine de provenance.
5. Validation opérateur avant activation dans la couche canonique.

---

## 11 — Conformité doctrinale

| Référentiel | Champ vérifié | Statut |
|---|---|---|
| ACF V1 — I-01 (local-first) | Cette spécification ne prescrit aucune écriture hors appareil | Conforme |
| ACF V1 — I-02 (autorité humaine) | Le modèle canonique stocke et restitue — il ne décide pas | Conforme |
| ACF V1 — I-03 (Lecture ≠ Action) | La spécification ne produit aucun message à l'opérateur | Conforme |
| ACF V1 — I-04 (silence structurel) | L'absence de date est un état formalisé, pas un signal d'erreur | Conforme |
| ACF V1 — I-05 (mémoire comme cœur) | Chaque trace mémorielle identifiée enrichit une famille mémoire | Conforme |
| ACF V1 — I-06 (profil interdit) | Le modèle trace des données atomiques — il n'agrège pas de profil | Conforme |
| ACF V1 — I-07 (corrélation non imposée) | Le modèle stocke et restitue — il ne corrèle pas | Conforme |
| ACF V1 — I-08 (provenance traçable) | Champs Source et Date obligatoires — la provenance est structurellement garantie | Conforme — objectif central |
| ACF V1 — I-09 (dégradation gracieuse) | Une famille vide ou absente retourne un ensemble vide, pas une erreur | Conforme |
| ACF V1 — I-10 (valeur temporelle) | L'indexation chronologique repose sur le champ Date formalisé par ce modèle | Conforme |
| Language System V1 | Aucun terme visible opérateur n'est défini dans ce document | Conforme |
| Memory Doctrine V1 | Classification des 14 entrées conforme aux principes de la doctrine mémorielle | Conforme |
| Pattern Reflection Doctrine V1 | Le modèle trace des événements — il ne produit pas de patterns | Conforme |
| Operator Intelligence V1 | Les données OI V1 (entrées 5 et 6) sont classifiées comme traces mémorielles SY1 — leur nature comportementale est cohérente avec la doctrine OI V1 | Conforme |
| Doctrine de Gouvernance V1 | Spécification produite avant toute implémentation — niveau correct dans la hiérarchie | Conforme |
| Roadmap V1 | LOT-P1-2.1 est la première sous-phase du premier livrable P1 Phase A | Conforme |

---

*Spécification officielle LOT-P1-2.1 — Modèle canonique de trace V1 — Programme P1 · Phase A · Caméléon Engine · 2026-07-07.*
