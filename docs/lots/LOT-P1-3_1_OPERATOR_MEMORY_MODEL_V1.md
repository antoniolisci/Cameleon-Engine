# LOT-P1-3.1 — Modèle de mémoire opérateur V1
## Spécification officielle — Première sous-phase de LOT-P1-3

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-3.1 |
| Titre | Modèle de mémoire opérateur V1 |
| Lot parent | LOT-P1-3 — Mémoire Opérateur V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Spécification |
| Statut | EN COURS |
| Prérequis satisfaits | LOT-P1-3 cadrage officiel · `a3054fe` |
| Date de spécification | 2026-07-08 |

---

## 1 — Mission de cette sous-phase

LOT-P1-3.1 définit le modèle de mémoire opérateur V1 : les objets, leur sémantique, leurs relations avec le corpus canonique, et les invariants qui garantissent l'intégrité de la couche de lecture.

Cette spécification est le prérequis formel de LOT-P1-3.2. L'interface de lecture opérateur ne peut pas être conçue sans un modèle validé, de la même façon que la couche canonique (LOT-P1-2.2) ne pouvait pas être conçue sans le modèle de trace (LOT-P1-2.1).

LOT-P1-3.1 produit exclusivement des définitions conceptuelles et architecturales. Il ne produit aucun code, aucun pseudo-code et aucun choix d'implémentation. Il tranche les cinq décisions architecturales ouvertes (D1–D5) du cadrage LOT-P1-3.

---

## 2 — Prérequis

### 2.1 — Documents de référence obligatoires

| Document | Rôle dans LOT-P1-3.1 |
|---|---|
| LOT-P1-2.1 — Modèle canonique de trace V1 | Définit les objets source (traces) et les invariants MI-1→MI-7 |
| LOT-P1-2.3 — Indexation V1 | Définit les primitives de lecture consommées |
| LOT-P1-2.4 — Doctrine de provenance V1 | Définit les sources officielles par famille |
| LOT-P1-3 — Cadrage officiel | Définit le périmètre, les décisions ouvertes D1–D5 et les critères de validation |

### 2.2 — Invariants hérités (LOT-P1-2.1)

Les sept invariants MI-1 à MI-7 du modèle canonique de trace sont contraignants pour LOT-P1-3.1. Aucune définition du modèle de mémoire opérateur ne peut les contredire.

| Invariant | Énoncé |
|---|---|
| MI-1 | Unicité de la famille — chaque trace appartient à exactement une famille ACF V1 |
| MI-2 | Immutabilité — une trace canonique persistée n'est jamais modifiée ni supprimée par les couches supérieures |
| MI-3 | Date jamais nulle — toute trace porte une date, ISO 8601 UTC ou état formalisé reconnu |
| MI-4 | Source jamais nulle — toute trace porte une source non vide |
| MI-5 | Registre fermé — seules les familles définies par l'ACF V1 sont valides |
| MI-6 | Indépendance des familles — les données d'une famille n'appartiennent pas à une autre |
| MI-7 | Ordre chronologique — les traces à date formalisée sont ordonnées par ordre d'écriture |

---

## 3 — Objets manipulés

LOT-P1-3.1 introduit une hiérarchie de trois nouveaux objets au-dessus de la trace canonique.

### 3.1 — Trace canonique (héritage LOT-P1-2)

La trace canonique est l'objet persisté dans le corpus canonique (LOT-P1-2). Elle sert de source exclusive à la couche de lecture opérateur. Elle n'est pas modifiable par cette couche.

| Champ | Sémantique | Contrainte |
|---|---|---|
| id | Identifiant technique de la trace | Unique · opaque · usage interne uniquement |
| famille | Famille ACF V1 d'appartenance | Valeur du registre fermé ACF V1 |
| source | Module ou opération à l'origine de l'écriture | Non nulle · non vide |
| date | Horodatage d'écriture | ISO 8601 UTC · ou état formalisé DATE_UNAVAILABLE / DATE_NON_EXPLOITABLE |
| contenu | Valeur mémorielle de la trace | Préservé intégralement |
| session | Identifiant de session d'écriture | Peut être null |

### 3.2 — Unité mémorielle

L'unité mémorielle est la projection opérateur d'une trace canonique. Elle est construite à la demande depuis la trace source. Elle n'est pas persistée.

L'unité mémorielle se distingue de la trace canonique par l'absence de l'identifiant technique (id) et par la représentation opérateur de la date.

| Champ | Sémantique | Relation à la trace source |
|---|---|---|
| famille | Famille ACF V1 d'appartenance | Identique à trace.famille |
| source | Module ou opération à l'origine de l'écriture | Identique à trace.source |
| date | Représentation opérateur de la date d'écriture | Voir §6.1 — Projection des dates |
| contenu | Valeur mémorielle | Identique à trace.contenu · aucune transformation |
| session | Identifiant de session | Identique à trace.session · null si absent |

**Champ absent :** le champ id n'est pas présent dans l'unité mémorielle. Il appartient au domaine technique de la couche canonique, non au domaine opérateur (invariant OM-I4).

### 3.3 — Compartiment mémoriel

Le compartiment mémoriel est l'ensemble ordonné des unités mémorielles d'une famille donnée. Il représente l'historique mémoriel de l'opérateur pour une famille ACF V1.

| Attribut | Sémantique |
|---|---|
| famille | Identifiant de la famille ACF V1 du compartiment |
| unités | Séquence ordonnée des unités mémorielles (ordre d'écriture) |
| vide | Vrai si la séquence ne contient aucune unité |

Un compartiment mémoriel est toujours présent dans l'état de mémoire opérateur, même si sa séquence d'unités est vide (décision D3 — voir §7).

### 3.4 — État de mémoire opérateur

L'état de mémoire opérateur est la projection complète du corpus canonique sur les quatre familles actives en Phase A. Il est la réponse à la question : "Quelle est la mémoire de l'opérateur à cet instant ?"

L'état de mémoire opérateur est composé de quatre compartiments fixes :

| Compartiment | Famille | Sémantique opérateur |
|---|---|---|
| Mémoire comportementale | SY1 | Historique des observations et analyses comportementales de l'opérateur |
| Mémoire décisionnelle | SY3 | Historique des décisions moteur et des sauvegardes |
| Mémoire transactionnelle | S1 | Historique des importations de données |
| Mémoire patrimoniale | S2 | Historique des états de portefeuille |

L'état de mémoire opérateur n'est pas persisté. Il est construit à la demande depuis le corpus canonique (invariant OM-I6).

---

## 4 — Modèle conceptuel

### 4.1 — Position dans l'architecture

```
Corpus canonique (LOT-P1-2)
  Objet : Trace canonique
  Champs : id · famille · source · date · contenu · session
        │
        │  Construction à la demande
        │  Projection (§6)
        ▼
Couche mémoire opérateur (LOT-P1-3)
  Objet : Unité mémorielle
  Champs : famille · source · date (opérateur) · contenu · session
        │
        │  Regroupement par famille
        ▼
  Objet : Compartiment mémoriel
  Attributs : famille · unités[] · vide
        │
        │  Agrégation des 4 compartiments actifs
        ▼
  Objet : État de mémoire opérateur
  Composition : [SY1] · [SY3] · [S1] · [S2]
```

### 4.2 — Construction de l'état

L'état de mémoire opérateur est construit selon la séquence suivante :

1. Appel de la primitive de lecture par famille pour chacun des quatre compartiments (SY1 · SY3 · S1 · S2).
2. Projection de chaque trace canonique reçue en unité mémorielle (suppression de id · transformation de la date selon §6.1).
3. Construction du compartiment mémoriel correspondant à chaque famille : unités dans l'ordre de la primitive · vide = true si séquence vide.
4. Agrégation des quatre compartiments en état de mémoire opérateur.

Cette construction est stateless. Elle produit le même résultat pour un corpus donné à un instant donné, sans dépendre d'un état interne.

---

## 5 — Relations avec le corpus canonique

### 5.1 — Lien de dépendance

La couche de lecture opérateur dépend du corpus canonique. Ce lien est unilatéral et non modifiable :
- La couche opérateur lit le corpus. Le corpus ignore la couche opérateur.
- Toute modification du modèle de trace canonique peut nécessiter une révision du modèle d'unité mémorielle (contrainte C2).
- L'inverse est impossible : le modèle d'unité mémorielle n'a aucune influence sur le corpus.

### 5.2 — Primitives consommées

La couche de lecture opérateur utilise exclusivement les primitives de lecture définies par LOT-P1-2 :

| Primitive | Usage dans LOT-P1-3 |
|---|---|
| Lecture par famille | Construction de chaque compartiment mémoriel (séquence principale) |
| Lecture par plage de dates | Construction d'une vue temporelle d'un compartiment |
| Lecture par session | Construction d'une vue contextuelle (Phase A : résultat vide attendu) |

### 5.3 — Accès indirect obligatoire

La couche de lecture opérateur n'accède jamais directement au stockage local (contrainte C1). Elle passe exclusivement par les primitives ci-dessus. Ce principe garantit que toute modification de la couche de persistance est transparente pour la couche opérateur, du moment que les primitives restent stables.

---

## 6 — Projections opérateur

### 6.1 — Projection des dates (décision D4 — tranchée)

La représentation de la date dans une unité mémorielle dépend de la valeur du champ date de la trace source :

| Valeur dans la trace canonique | Représentation dans l'unité mémorielle |
|---|---|
| Date ISO 8601 UTC | Conservée telle quelle — la mise en forme visuelle est du ressort de LOT-P1-3.3 |
| DATE_UNAVAILABLE | Libellé opérateur : "Date non disponible" |
| DATE_NON_EXPLOITABLE | Libellé opérateur : "Date non exploitable au format canonique" |

Les traces à date formalisée sont visibles dans l'état de mémoire opérateur. Elles ne sont ni exclues ni masquées (décision D4 — Option A). Le libellé opérateur les distingue des traces à date ISO 8601 (invariant OM-I5).

### 6.2 — Projection des identifiants techniques

Le champ id de la trace canonique est exclu de l'unité mémorielle (décision D1 — Option B). Il s'agit d'un identifiant interne à la couche canonique, sans signification dans le domaine opérateur.

### 6.3 — Non-transformation du contenu

Le champ contenu de la trace canonique est reproduit intégralement dans l'unité mémorielle, sans transformation, résumé ni enrichissement (contrainte C4). La couche de lecture opérateur lit et expose, elle ne transforme pas le fond.

### 6.4 — Projection des sessions

Le champ session de la trace canonique est reproduit tel quel dans l'unité mémorielle — y compris si sa valeur est null (contrainte C5). La valeur null est un état valide qui signifie "aucune session associée" — elle n'est pas remplacée par une valeur par défaut.

---

## 7 — Structure de l'état de mémoire opérateur (décision D2 — tranchée)

L'état de mémoire opérateur est une structure par compartiment, non un tableau plat (décision D2 — Option B).

Cette décision est cohérente avec le modèle sémantique défini en §3.4 : l'opérateur a quatre types de mémoire distincts. Les regrouper dans une structure par compartiment rend explicite cette distinction. Un tableau plat mélangerait des traces de familles différentes sans séparation sémantique.

**Structure de l'état :**

```
État de mémoire opérateur
  SY1 — Mémoire comportementale
    vide : booléen
    unités : [unité mémorielle · unité mémorielle · ...]
  SY3 — Mémoire décisionnelle
    vide : booléen
    unités : [unité mémorielle · ...]
  S1 — Mémoire transactionnelle
    vide : booléen
    unités : [unité mémorielle · ...]
  S2 — Mémoire patrimoniale
    vide : booléen
    unités : [unité mémorielle · ...]
```

Les quatre compartiments sont toujours présents (décision D3 — Option B). Un compartiment dont la séquence est vide a l'attribut vide = true. Il est présent dans l'état avec une séquence vide, non absent.

**Fondement de D3 (Option B) :** un compartiment absent forcerait le code appelant à distinguer "famille sans trace" de "famille non définie" — ambiguïté sans bénéfice. Les quatre familles actives Phase A sont des constantes du modèle, toujours présentes. Cette décision est cohérente avec le comportement de l'index LOT-P1-2 qui pré-peuple les 13 familles ACF V1, y compris les vides.

---

## 8 — Limite de volume (décision D5 — tranchée)

La couche de lecture opérateur expose la totalité du corpus d'une famille (décision D5 — Option A). Aucune limite supplémentaire n'est introduite à ce niveau.

**Fondement :** Le volume de la Phase A est dimensionné et assumé par LOT-P1-2 (R-TECH-02). L'introduction d'une limite configurable serait une complexité sans justification pour le volume actuel. Cette décision sera révisée si les conditions de la Phase A changent, avant le Programme P6.

---

## 9 — Invariants du modèle de mémoire opérateur

Les invariants suivants s'appliquent à l'ensemble de la couche de lecture opérateur. Ils complètent les invariants MI-1→MI-7 hérités du modèle canonique.

**OM-I1 — Complétude des compartiments**
L'état de mémoire opérateur contient toujours exactement quatre compartiments (SY1 · SY3 · S1 · S2). Un compartiment absent de la réponse est une violation de cet invariant.

**OM-I2 — Ordre invariant des unités**
Les unités mémorielles d'un compartiment sont exposées dans l'ordre fourni par la primitive de lecture par famille. Cet ordre reflète l'ordre d'écriture dans le corpus canonique. Il n'est pas modifié par la couche de lecture opérateur.

**OM-I3 — Non-modification du corpus**
La couche de lecture opérateur ne crée, ne modifie et ne supprime aucune trace canonique. Elle est une couche de lecture pure.

**OM-I4 — Opacité de l'identifiant technique**
Le champ id de la trace canonique n'est pas exposé dans une unité mémorielle. Il appartient exclusivement au domaine interne de la couche canonique.

**OM-I5 — Distinction des dates formalisées**
Les unités mémorielles dont la date source est formalisée (DATE_UNAVAILABLE · DATE_NON_EXPLOITABLE) sont représentées avec le libellé opérateur défini en §6.1. Elles sont visibles dans l'état de mémoire opérateur et distinguées des unités à date ISO 8601.

**OM-I6 — Non-persistance de l'état**
L'état de mémoire opérateur n'est pas mis en cache et n'est pas persisté. Il est construit à la demande depuis le corpus canonique au moment de chaque appel. Il n'y a pas d'état résiduel entre deux constructions.

**OM-I7 — Intégrité read-only**
La couche de lecture opérateur ne produit aucune écriture dans le corpus canonique ni dans l'index, y compris en cas d'erreur de lecture ou de corpus vide.

---

## 10 — Contraintes

**C1 — Accès indirect obligatoire**
La couche de lecture opérateur n'accède jamais directement au stockage local. Elle passe exclusivement par les primitives de lecture canoniques (lecture par famille · lecture par plage de dates · lecture par session). Toute modification de la couche de persistance sous-jacente est transparente pour la couche opérateur, du moment que les primitives restent stables.

**C2 — Dépendance unilatérale**
Le modèle d'unité mémorielle dépend du modèle de trace canonique. Toute évolution du modèle de trace (ajout de champ, modification de sémantique) peut nécessiter une révision de cette spécification. L'inverse est impossible : la couche de lecture opérateur n'a aucune influence sur le corpus.

**C3 — Registre fermé des familles**
Un compartiment mémoriel ne peut être associé qu'à une famille définie par l'ACF V1. Aucune famille hors registre ne peut apparaître dans un état de mémoire opérateur.

**C4 — Intégrité du contenu**
Le contenu d'une unité mémorielle est reproduit intégralement depuis la trace canonique source. Aucune transformation, résumé, troncature ni enrichissement du contenu n'est autorisé dans cette couche. La transformation du contenu appartient aux couches supérieures (Programme P8 — synthèse).

**C5 — Fidélité de la session**
La valeur du champ session d'une unité mémorielle est identique à celle du champ session de la trace canonique source. Si session est null dans la trace, null est préservé dans l'unité mémorielle — sans substitution par une valeur par défaut.

---

## 11 — Décisions architecturales tranchées

Les cinq décisions ouvertes du cadrage LOT-P1-3 (§8) sont tranchées dans cette spécification.

### D1 — Projection : Option B (projection partielle) — TRANCHÉE

**Décision :** L'unité mémorielle est une projection partielle de la trace canonique. Elle exclut le champ id et représente la date selon les libellés définis en §6.1.

**Fondement :** L'identifiant technique (id) est un UUID interne sans signification pour l'opérateur. Les valeurs de date formalisées (DATE_UNAVAILABLE · DATE_NON_EXPLOITABLE) ne sont pas lisibles directement. Une projection minimale est nécessaire pour que la couche de lecture soit utile à l'opérateur. Cette projection ne transforme pas le contenu — elle se limite aux métadonnées techniques.

### D2 — Structure de l'état mémoire : Option B (structure par compartiment) — TRANCHÉE

**Décision :** L'état de mémoire opérateur est une structure par compartiment (famille → unités[]), non un tableau plat.

**Fondement :** Les quatre familles actives Phase A ont des sémantiques distinctes (comportementale · décisionnelle · transactionnelle · patrimoniale). Un tableau plat efface cette distinction et force le code appelant à re-grouper les données. La structure par compartiment reflète directement le modèle sémantique et facilite l'accès ciblé à une famille.

### D3 — Comportement pour famille vide : Option B (compartiment présent avec séquence vide) — TRANCHÉE

**Décision :** Un compartiment mémoriel est toujours présent dans l'état de mémoire opérateur, même si sa séquence d'unités est vide.

**Fondement :** Les quatre compartiments sont des constantes du modèle Phase A. Leur absence crée une ambiguïté entre "famille vide" et "famille non supportée". Leur présence systématique garantit la déterminisme de l'état et simplifie les appelants.

### D4 — Traitement des dates formalisées : Option A (libellé opérateur explicite) — TRANCHÉE

**Décision :** Les unités mémorielles dont la date source est DATE_UNAVAILABLE ou DATE_NON_EXPLOITABLE sont exposées dans l'état de mémoire opérateur avec les libellés définis en §6.1. Elles ne sont pas exclues.

**Fondement :** Ces traces sont des données réelles de l'historique de l'opérateur. Les masquer réduirait la fidélité de la mémoire sans justification. Les libellés opérateur rendent la situation compréhensible sans nécessiter de connaître les constantes techniques internes.

### D5 — Limite de volume : Option A (exposition totale) — TRANCHÉE

**Décision :** La couche de lecture opérateur expose la totalité du corpus d'une famille, sans limite de volume.

**Fondement :** Le volume Phase A est dimensionné et assumé par LOT-P1-2. L'introduction d'une limite configurable est une complexité non justifiée pour le volume actuel. Cette décision est révisable si le volume croît au-delà des limites Phase A.

---

## 12 — Critères de validation de LOT-P1-3.1

La validation de LOT-P1-3.1 est documentaire. Aucun test terrain n'est requis à ce stade.

**V1 — Complétude des objets**
Le modèle définit formellement les quatre objets (trace canonique · unité mémorielle · compartiment mémoriel · état de mémoire opérateur) avec leurs champs, leur sémantique et leur mode de construction.

**V2 — Couverture des invariants**
Les invariants OM-I1 à OM-I7 sont définis, non contradictoires, et couvrent l'ensemble des garanties énoncées dans le cadrage LOT-P1-3 (§6, §7, §10 CV6).

**V3 — Décisions D1–D5 tranchées et documentées**
Les cinq décisions architecturales ouvertes du cadrage sont tranchées dans ce document, avec leur fondement explicite. Aucune décision n'est renvoyée à une sous-phase ultérieure.

**V4 — Cohérence des contraintes**
Les contraintes C1 à C5 sont complètes, non contradictoires, et suffisantes pour garantir le comportement read-only strict de la couche (CV6 du cadrage LOT-P1-3).

**V5 — Neutralité architecturale**
Le document ne contient aucun détail d'implémentation, aucun nom de fichier, aucune structure de données interne, aucun langage de programmation, aucun pseudo-code.

**V6 — Conformité aux invariants hérités**
Le modèle d'unité mémorielle et ses contraintes ne contredisent aucun des invariants MI-1 à MI-7 du modèle canonique de trace (LOT-P1-2.1). En particulier : l'immutabilité (MI-2) est respectée par OM-I3, le registre fermé (MI-5) est respecté par C3.

**V7 — Conformité doctrinale**
- ACF V1 : les quatre familles actives (SY1 · SY3 · S1 · S2) correspondent au registre ACF V1 Phase A.
- Roadmap V1 §4 : le modèle reste dans le périmètre P1 Phase A — aucune corrélation, aucune synthèse.
- Gouvernance V1 : le niveau spécification est respecté — aucune anticipation de l'implémentation.
- GPD V1 Partie VIII §8.1 + Partie XIII §13.5 : la couche de lecture est la réponse directe au blanc B1 (infrastructure absente désormais comblée) et au nœud multiplicateur §13.5 (retrouvabilité).
