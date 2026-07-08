# LOT-P1-2.4 — Doctrine de provenance
## Spécification — Quatrième sous-phase de LOT-P1-2

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-2.4 |
| Titre | Doctrine de provenance |
| Sous-phase de | LOT-P1-2 — Couche de persistance canonique V1 |
| Programme | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Doctrine architecturale |
| Statut | EN RÉDACTION |
| Prérequis satisfaits | LOT-P1-2.2 — VALIDÉ · `8c7a4be` |
| Document officiel | `docs/lots/LOT-P1-2_4_PROVENANCE_DOCTRINE_V1.md` |
| Date | 2026-07-08 |

---

## 1 — Identité et périmètre

LOT-P1-2.4 a une responsabilité unique : formaliser la règle de provenance comme contrainte architecturale pesant sur toute écriture dans la couche de persistance canonique, et en dériver les trois décisions concrètes que cette contrainte appelle pour les familles actives en Phase A.

Ces trois décisions sont :

1. Les valeurs officielles de source par famille active — déléguées explicitement par LOT-P1-2.1 §5.2.
2. Les unités de session officielles par famille active — soumises à proposition par LOT-P1-2.1 §7 et appelant les trois points ouverts de §7.3.
3. Le format du contexte par famille active — délégué explicitement par LOT-P1-2.1 §5.4.

LOT-P1-2.4 ne redéfinit pas le modèle canonique de trace — il est établi par LOT-P1-2.1. Il ne construit pas la couche de persistance — elle est établie par LOT-P1-2.2. Il ne construit pas l'index — il est établi par LOT-P1-2.3. Il ne valide pas le terrain — c'est la mission de LOT-P1-2.5.

Ce document s'adresse exclusivement aux familles ACF V1 actives en Phase A : SY1, SY3, S1 et S2. Les familles inactives en Phase A sont hors périmètre jusqu'à leur activation dans un LOT ultérieur.

---

## 2 — Prérequis et position dans LOT-P1-2

### 2.1 — Prérequis bloquant

LOT-P1-2.4 ne peut pas commencer sans que LOT-P1-2.2 soit validé. La doctrine de provenance porte sur une couche de persistance concrète et opérationnelle. Sans couche canonique en place, les sources et les unités de session qu'elle formalise n'ont pas de point d'ancrage réel.

### 2.2 — Position dans la séquence

LOT-P1-2.4 est la quatrième sous-phase de LOT-P1-2. Il peut avancer en parallèle avec LOT-P1-2.3 — les deux sous-phases n'ont pas de dépendance directe entre elles.

LOT-P1-2.5 (validation terrain) ne peut pas commencer tant que LOT-P1-2.3 et LOT-P1-2.4 ne sont pas tous deux validés.

### 2.3 — Absence d'ouverture automatique

La validation de LOT-P1-2.4 n'ouvre pas automatiquement LOT-P1-2.5. L'ouverture requiert une décision opérateur explicite.

---

## 3 — La règle de provenance comme contrainte architecturale

### 3.1 — Fondement de la règle

La règle de provenance est établie par le cadrage LOT-P1-2 à deux niveaux.

Au niveau des objectifs (§3 O4) : "Formaliser la règle selon laquelle toute écriture dans la couche de persistance doit fournir la source, la date et le contexte de la trace."

Au niveau des responsabilités de la couche (§4.5) : "Toute écriture passe par l'interface de la couche. Aucune écriture directe n'est autorisée. La couche valide la présence des champs obligatoires avant persistance."

Elle est également fondée sur l'invariant I-08 de l'Architecture Conceptuelle Fondatrice V1, qui impose que "chaque trace conserve source · date · contexte". Le cadrage LOT-P1-2 §11 identifie I-08 comme "objectif central" de ce LOT.

### 3.2 — Ce que la règle impose

La règle de provenance distingue trois comportements selon les champs de provenance :

**Source — obligatoire.** Toute écriture dans la couche doit fournir la source de la trace. Le module écrivant identifie la source au moment de l'écriture. L'absence de source entraîne le rejet de l'écriture par la couche. Cette exigence est formalisée par RV2 (LOT-P1-2.1 §8.1) et par MI-4 (LOT-P1-2.1 §9).

**Date — produite par la couche.** La date n'est pas fournie par le module écrivant pour les nouvelles écritures. Elle est horodatée par la couche au moment de l'écriture (horodatage ISO 8601 UTC). Pour les traces migrées depuis l'ancienne couche, le modèle canonique reconnaît des états formalisés (LOT-P1-2.1 §5.3 et §6). Cette distinction est établie par le cadrage §4.2 et ne relève pas de la doctrine de provenance.

**Contexte — optionnel.** Le champ Contexte est facultatif. Son absence ne constitue pas une violation du modèle ni de la doctrine de provenance. Cette règle est établie par RV5 (LOT-P1-2.1 §8.1) : "Le champ Contexte est optionnel. Son absence ne constitue pas une violation du modèle." La doctrine de provenance définit le format du contexte par famille (§7) sans en rendre la fourniture obligatoire.

### 3.3 — Ce que la règle ne fait pas

La règle de provenance est une contrainte sur l'écriture — elle ne produit aucune corrélation, aucune synthèse, aucune recommandation. Elle garantit que chaque trace peut être retracée jusqu'à son module d'origine. Elle ne garantit pas que chaque trace sera effectivement contextualisée.

La doctrine de provenance n'est pas une recommandation : elle est le mécanisme par lequel la contrainte R-DOC-01 (cadrage §7.2) est satisfaite. Sans mécanisme de validation architecturalement contraignant, les modules applicatifs peuvent continuer à écrire des traces sans source. La règle de provenance supprime cette possibilité pour la source — le rejet est explicite, non silencieux.

---

## 4 — Sources officielles par famille active

LOT-P1-2.1 §5.2 délègue explicitement à LOT-P1-2.4 la fixation des valeurs officielles de source pour chaque famille : "Cette liste constitue le référentiel de sources actives en Phase A. Elle n'est pas exhaustive — LOT-P1-2.4 (Doctrine de provenance) fixera les valeurs officielles de source pour chaque famille."

### 4.1 — SY1 — Comportementale

La famille SY1 regroupe six traces issues de deux modules distincts aux rythmes d'activité indépendants.

| Entrée | Source officielle |
|---|---|
| Sessions comportementales | Module d'analyse comportementale |
| Mémoire comportementale (R1) | Module d'analyse comportementale |
| Niveau de garde comportemental (R3) | Module d'analyse comportementale |
| Paramètres d'ordres récents (R4) | Module d'enregistrement des ordres récents |
| Mémoire opérateur | Module OI V1 |
| Historique des analyses opérateur | Module OI V1 |

### 4.2 — SY3 — Décisionnelle

| Entrée | Source officielle |
|---|---|
| Journal des décisions moteur | Moteur décisionnel |
| Sauvegardes moteur | Moteur décisionnel |

### 4.3 — S1 — Transactionnelle

| Entrée | Source officielle |
|---|---|
| Registre des importations | Module d'import |

### 4.4 — S2 — Patrimoniale

| Entrée | Source officielle |
|---|---|
| Portefeuille | Module portefeuille |

### 4.5 — Portée de ce référentiel

Ce référentiel couvre les quatre familles actives en Phase A. Il ne couvre pas les familles inactives (S3, S4, S5, SY2, SY4, L1, L2, L3, Référentiel) — leurs sources seront définies dans leur doctrine de provenance respective, au moment de leur activation.

---

## 5 — Traitement des cas particuliers R1, R3, R4 dans la doctrine

Les cas R1, R3 et R4 sont formellement définis par le modèle canonique (LOT-P1-2.1 §6). La doctrine de provenance ne redéfinit pas ces cas — elle précise ce que le module écrivant doit fournir au moment de l'écriture pour chacun d'eux.

### 5.1 — Cas R1 — Mémoire comportementale

**Source à fournir.** Le module d'analyse comportementale fournit la valeur "Module d'analyse comportementale" comme source.

**Date.** Le champ Date est en état formalisé "Non disponible" pour les données migrées depuis l'ancienne couche. Pour toute nouvelle écriture produite par le module après la migration, la couche horodate au moment de l'écriture (ISO 8601 UTC). Le module ne fournit pas la date.

**Contexte.** Le module peut enrichir la trace avec un contexte décrivant la session d'analyse comportementale qui a produit la synthèse. Le contexte est optionnel — son absence ne constitue pas une violation de la doctrine.

### 5.2 — Cas R3 — Niveau de garde comportemental

**Source à fournir.** Le module d'analyse comportementale fournit la valeur "Module d'analyse comportementale" comme source.

**Date.** Traitement identique à R1 pour les données migrées : état formalisé "Non disponible". Pour les nouvelles écritures : horodatage ISO 8601 UTC produit par la couche.

**Contexte.** Le module peut enrichir la trace avec un contexte. Le contexte est optionnel.

### 5.3 — Cas R4 — Paramètres d'ordres récents

**Source à fournir.** Le module d'enregistrement des ordres récents fournit la valeur "Module d'enregistrement des ordres récents" comme source.

**Date.** Pour les données migrées : état formalisé "Non exploitable au format canonique". Pour les nouvelles écritures : horodatage ISO 8601 UTC produit par la couche. Une normalisation future des horodatages epoch millisecondes existants vers ISO 8601 UTC est techniquement réalisable et réservée à un LOT ultérieur non encore défini (LOT-P1-2.1 §6.4).

**Contexte.** Le module peut enrichir la trace avec un contexte décrivant les paramètres d'ordres au moment de l'écriture. Le contexte est optionnel.

### 5.4 — Continuité doctrinale pour les nouvelles écritures

Pour R1, R3 et R4, les données migrées portent un état formalisé de date établi par LOT-P1-2.1. Ces états sont légitimes et permanents pour l'historique migré. Toute nouvelle écriture produite après la migration reçoit un horodatage ISO 8601 UTC de la couche — les états formalisés sont propres à l'historique antérieur à LOT-P1-2.2 et ne s'appliquent pas aux nouvelles traces.

---

## 6 — Unités de session officielles par famille active

Le cadrage LOT-P1-2 §4.8 définit la session comme "un identifiant opaque fourni par le module écrivant au moment de l'écriture d'une trace". La couche n'impose aucune sémantique à cet identifiant. L'identifiant de session est un champ optionnel — une trace sans identifiant de session est valide.

Cette section traite les trois points ouverts identifiés par LOT-P1-2.1 §7.3 et formalise les unités de session officielles pour les quatre familles actives en Phase A.

### 6.1 — SY1 — Comportementale

**Point ouvert 1 — Granularité de session SY1.** LOT-P1-2.1 §7.3 pose la question suivante : la session SY1 est-elle définie par module écrivant, ou de façon globale pour l'ensemble de la famille ?

**Décision.** La session SY1 est définie par module écrivant. Chaque module fournit son propre identifiant de session indépendamment de l'autre. Cette décision est cohérente avec l'indépendance des rythmes d'activité des deux modules et préserve la capacité de retrouvabilité propre à chaque sous-groupe.

**Point ouvert 2 — Session de Paramètres d'ordres récents (R4).** LOT-P1-2.1 §7.3 signale que l'unité naturelle de session pour R4 n'est pas évidente à partir des données disponibles.

**Décision.** L'unité de session pour R4 est une mise à jour des paramètres d'ordres récents. Chaque écriture dans cette entrée correspond à une session distincte.

| Entrée | Unité de session officielle |
|---|---|
| Sessions comportementales | Une session d'analyse comportementale (un fichier source analysé) |
| Mémoire comportementale (R1) | L'identifiant de la session d'analyse comportementale qui a produit la synthèse |
| Niveau de garde comportemental (R3) | L'identifiant de la session d'analyse comportementale qui a produit la mise à jour |
| Paramètres d'ordres récents (R4) | Une mise à jour des paramètres d'ordres récents |
| Mémoire opérateur | Une session d'analyse OI V1 |
| Historique des analyses opérateur | Une session d'analyse OI V1 |

### 6.2 — SY3 — Décisionnelle

**Point ouvert 3 — Alignement des sessions SY3.** LOT-P1-2.1 §7.3 demande de confirmer que le Journal des décisions moteur et les Sauvegardes moteur partagent le même identifiant de session afin de permettre leur corrélation par l'axe session.

**Décision.** Les deux entrées de SY3 reçoivent le même identifiant de session lors de chaque soumission du formulaire décisionnel. L'identifiant est produit par le moteur décisionnel et fourni à la couche pour les deux écritures. Cette unité commune permet la retrouvabilité conjointe des décisions et des sauvegardes d'une même soumission.

| Entrée | Unité de session officielle |
|---|---|
| Journal des décisions moteur | Une soumission du formulaire décisionnel — identifiant commun aux deux entrées SY3 |
| Sauvegardes moteur | Une soumission du formulaire décisionnel — identifiant commun aux deux entrées SY3 |

### 6.3 — S1 — Transactionnelle

| Entrée | Unité de session officielle |
|---|---|
| Registre des importations | Une opération d'import de fichier source |

### 6.4 — S2 — Patrimoniale

| Entrée | Unité de session officielle |
|---|---|
| Portefeuille | Une mise à jour du portefeuille par l'opérateur |

---

## 7 — Format du contexte par famille

LOT-P1-2.1 §5.4 délègue explicitement à la doctrine de provenance la définition du format du contexte par famille : "Le format du contexte n'est pas contraint par le modèle canonique — il est défini par chaque famille dans sa doctrine de provenance."

Le contexte est optionnel (RV5 — LOT-P1-2.1 §8.1). Les formats ci-dessous s'appliquent lorsque le module choisit de fournir un contexte. Leur absence ne constitue pas une violation du modèle ni de la présente doctrine.

**Note de vigilance documentaire.** Le cadrage LOT-P1-2 §3 O4 énonce l'objectif de fournir "la source, la date et le contexte". Le cadrage §4.2 précise cependant que le contexte est "Facultatif mais encouragé". La règle formelle du modèle canonique est établie par RV5 (LOT-P1-2.1 §8.1) : le contexte est optionnel, son absence n'est pas une violation. La présente doctrine applique RV5 et ne rend pas le contexte obligatoire. Cette tension entre l'énoncé de l'objectif O4 et la règle RV5 ne fait l'objet d'aucune règle de priorité dans les documents parents. Le présent document applique RV5 et n'est pas autorisé à trancher ce point.

### 7.1 — SY1 — Comportementale (module d'analyse comportementale)

Lorsque le module d'analyse comportementale fournit un contexte, celui-ci peut inclure : le fichier source analysé, le score comportemental produit, le label comportemental obtenu (Discipliné / Réactif / Impulsif / Agressif), le nombre d'ordres analysés.

### 7.2 — SY1 — Comportementale (module OI V1)

Lorsque le module OI V1 fournit un contexte, celui-ci peut inclure : l'indicateur OI évalué (Capital, Cadence, Portefeuille), la période couverte par l'analyse, le score OI produit.

### 7.3 — SY3 — Décisionnelle

Lorsque le moteur décisionnel fournit un contexte, celui-ci peut inclure : la posture décisionnelle, l'état marché au moment de la soumission, le niveau d'engagement produit, les actions autorisées ou interdites.

### 7.4 — S1 — Transactionnelle

Lorsque le module d'import fournit un contexte, celui-ci peut inclure : le type de fichier importé, le nombre d'enregistrements traités, le résultat de l'import.

### 7.5 — S2 — Patrimoniale

Lorsque le module portefeuille fournit un contexte, celui-ci peut inclure : la composition du portefeuille au moment de la mise à jour, les actifs présents, la valeur totale si disponible.

---

## 8 — Exclusions de périmètre

Les responsabilités suivantes sont explicitement hors du périmètre de LOT-P1-2.4 :

| Exclusion | Délégation |
|---|---|
| Définition des quatre champs du modèle canonique | LOT-P1-2.1 — non redéfinis |
| Formalisation des cas R1, R3, R4 dans le modèle | LOT-P1-2.1 §6 — non redéfinis |
| Règles de validation RV1 à RV5 | LOT-P1-2.1 §8.1 — non redéfinies |
| Construction de la couche de persistance | LOT-P1-2.2 |
| Construction de l'index triple-axe | LOT-P1-2.3 |
| Validation terrain de CV4 | LOT-P1-2.5 |
| Normalisation des horodatages epoch R4 vers ISO 8601 | LOT à définir (LOT-P1-2.1 §6.4) |
| Sources et unités de session des familles inactives en Phase A | LOT d'activation de chaque famille |
| Extension des familles ACF V1 | Décision doctrinale de niveau N2 (LOT-P1-2.1 §10) |
| Interface visible par l'opérateur | Hors périmètre LOT-P1-2 |

---

## 9 — Critère de validation (CV4)

Le critère de validation applicable à LOT-P1-2.4 est CV4, tel que défini dans le cadrage LOT-P1-2 §8 :

> **CV4 — Provenance systématique**
> Aucune écriture dans la couche ne peut aboutir sans que la source soit fournie. Le mécanisme de validation est actif et vérifiable — il n'est pas contournable par les modules applicatifs.

La satisfaction de CV4 est constatée lors de la validation terrain LOT-P1-2.5. LOT-P1-2.4 pose les conditions doctrinales nécessaires à cette vérification — il ne la réalise pas.

---

## 10 — Conformité doctrinale

| Référentiel | Champ vérifié | Statut |
|---|---|---|
| ACF V1 — I-01 (local-first) | Cette doctrine ne prescrit aucune écriture hors appareil | Conforme |
| ACF V1 — I-02 (autorité humaine) | La doctrine formalise une contrainte d'écriture — elle ne décide pas | Conforme |
| ACF V1 — I-03 (Lecture ≠ Action) | Ce document ne produit aucun message à l'opérateur | Conforme |
| ACF V1 — I-04 (silence structurel) | Le rejet d'une écriture sans source est explicite, non silencieux — conforme au principe | Conforme |
| ACF V1 — I-05 (mémoire comme cœur) | La doctrine renforce la traçabilité de chaque trace mémorielle | Conforme |
| ACF V1 — I-06 (profil interdit) | La doctrine formalise des métadonnées de trace — elle n'agrège pas de profil | Conforme |
| ACF V1 — I-07 (corrélation non imposée) | La doctrine ne produit aucune corrélation | Conforme |
| ACF V1 — I-08 (provenance traçable) | Objectif central — source obligatoire, date produite par la couche, contexte optionnel | Conforme — objectif satisfait |
| ACF V1 — I-09 (dégradation gracieuse) | Aucune modification du comportement de lecture — non concerné | Conforme |
| ACF V1 — I-10 (valeur temporelle) | La doctrine n'affecte pas l'indexation chronologique | Conforme |
| Language System V1 | Aucun terme visible opérateur n'est défini dans ce document | Conforme |
| Memory Doctrine V1 | La doctrine de provenance renforce la traçabilité des traces mémorielles | Conforme |
| Pattern Reflection Doctrine V1 | Ce document ne produit pas de patterns | Conforme |
| Operator Intelligence V1 | Les sources OI V1 sont formalisées en §4.1 | Conforme |
| Doctrine de Gouvernance V1 | Doctrine produite avant toute implémentation — niveau correct dans la hiérarchie | Conforme |
| Roadmap V1 | LOT-P1-2.4 est la quatrième sous-phase du premier livrable P1 Phase A | Conforme |

---

## 11 — Prochaine étape

À l'issue de la validation de LOT-P1-2.4, une sous-phase peut être avancée :

- **LOT-P1-2.5** (Validation terrain) — peut être ouvert uniquement lorsque LOT-P1-2.3 et LOT-P1-2.4 sont tous deux validés. Si LOT-P1-2.3 n'est pas encore validé au moment de la validation de LOT-P1-2.4, LOT-P1-2.5 reste bloqué jusqu'à la validation de LOT-P1-2.3.

Aucune ouverture automatique.

---

*Spécification LOT-P1-2.4 — Programme P1 · Phase A · Caméléon Engine · 2026-07-08.*
