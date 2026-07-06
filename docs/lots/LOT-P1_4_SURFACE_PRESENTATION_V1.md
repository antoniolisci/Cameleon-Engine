# LOT-P1.4 — Surface de présentation opérateur

**Statut : CADRAGE**

---

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1.4 |
| Titre | Surface de présentation opérateur |
| LOT parent | LOT-P1 — Diagnostic mémoriel V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Observabilité |
| Statut | CADRAGE |
| Date de cadrage | 2026-07-06 |
| Prérequis | LOT-P1.1 validé · LOT-P1.2 validé `e03edec` · LOT-P1.3 validé `1894d70` |

---

## 1 — Principes de présentation

### 1.1 — Ordre d'affichage

Le diagnostic mémoriel est présenté dans l'ordre suivant :

1. Introduction du composant — texte d'ancrage doctrinal, toujours visible.
2. Total de la couche de persistance — espace global, pourcentage, niveau d'occupation.
3. F1 — Mémoire comportementale — quatre entrées.
4. F2 — Mémoire opérateur — deux entrées.
5. F3 — Mémoire décisionnelle — deux entrées.
6. F4 — Données opérateur — trois entrées.
7. F5 — Système local — trois entrées, dans une zone visuellement distincte et secondaire.

Cet ordre est fixe. Il ne varie pas en fonction de l'état des familles.

### 1.2 — Ordre des entrées au sein d'une famille

Au sein de chaque famille mémorielle, les entrées sont présentées dans l'ordre défini en LOT-P1.2 §2 :

| Famille mémorielle | Ordre d'affichage des entrées |
|---|---|
| F1 — Mémoire comportementale | Sessions comportementales · Mémoire comportementale · Niveau de garde comportemental · Paramètres d'ordres récents |
| F2 — Mémoire opérateur | Mémoire opérateur · Historique des analyses opérateur |
| F3 — Mémoire décisionnelle | Journal des décisions moteur · Sauvegardes moteur |
| F4 — Données opérateur | Registre des importations · Portefeuille · Paramètres |
| F5 — Système local | Identité locale · État de navigation · Instantané moteur |

Cet ordre est fixe au sein de chaque famille.

### 1.3 — Hiérarchie visuelle

Le diagnostic distingue deux niveaux de priorité visuelle :

- **Niveau principal (F1→F4)** : familles à valeur opérationnelle directe. Affichées en pleine visibilité, sans distinction entre elles.
- **Niveau secondaire (F5)** : entrées de nature système, à faible valeur opérationnelle directe. Présentées dans une zone visuellement distincte et de moindre prominence, sans être masquées.

Cette distinction est de présentation uniquement. Elle ne modifie pas la définition ni le statut des familles dans le diagnostic.

### 1.4 — Niveau de détail

Chaque entrée du diagnostic présente, dans l'ordre :

1. Le nom de l'entrée (libellé opérateur).
2. Le message d'état le cas échéant.
3. L'espace utilisé.
4. La datation.
5. La provenance (étiquette discrète).

Aucun autre élément n'est affiché. Aucune information technique n'est exposée à l'opérateur.

### 1.5 — Neutralité de présentation

Aucun élément de présentation ne doit :

- créer une urgence perçue ;
- induire une hiérarchie émotionnelle entre les états ;
- suggérer qu'un état est préférable à un autre ;
- inviter à une action.

Le diagnostic décrit l'état observé. L'interprétation et les décisions appartiennent à l'opérateur.

---

## 2 — Règles d'affichage par élément

### 2.1 — Introduction du composant

Texte fixe, toujours visible, en tête du diagnostic, avant tout autre contenu :

> "Le diagnostic mémoriel lit l'état actuel des données enregistrées sur cet appareil. Il ne modifie aucune donnée, ne produit aucune recommandation et ne déclenche aucune action. Une famille absente ou vide est un état normal."

Ce texte est défini en LOT-P1.2 §1. Il n'est pas modifiable dans le périmètre de LOT-P1.

### 2.2 — Total de la couche de persistance

Affiché après l'introduction, avant les familles mémorielles.

| Élément affiché | Format |
|---|---|
| Espace total utilisé | "X,X Ko utilisés" |
| Pourcentage d'occupation | "X %" |
| Niveau d'occupation | "Nominal" · "Élevé" · "Saturé" |

Le niveau d'occupation est affiché en texte factuel. Aucun niveau ne reçoit une mise en valeur visuelle qui le distinguerait comme plus urgent que les autres.

### 2.3 — En-tête de famille mémorielle

Chaque famille est introduite par son nom et son étiquette de provenance.

| Élément affiché | Format |
|---|---|
| Nom de la famille | "F1 — Mémoire comportementale" · "F2 — Mémoire opérateur" · "F3 — Mémoire décisionnelle" · "F4 — Données opérateur" · "F5 — Système local" |
| Provenance | Étiquette discrète définie en LOT-P1.2 §3 |

### 2.4 — Éléments d'une ligne d'entrée

Chaque entrée présente les éléments suivants, dans l'ordre :

1. **Nom** — libellé opérateur défini en LOT-P1.2 §2.
2. **Message d'état** — présent uniquement pour les états Vide et Absente. Voir §5.
3. **Espace utilisé** — selon les règles de LOT-P1.2 §6. Voir §5 pour le détail par état.
4. **Datation** — selon les règles de LOT-P1.3 §5. Voir §5 pour le détail par état.
5. **Provenance** — étiquette discrète correspondant à la famille mémorielle, définie en LOT-P1.2 §3.

---

## 3 — Hiérarchie de lecture

### 3.1 — Éléments toujours visibles

Les éléments suivants sont visibles sans interaction de l'opérateur, en permanence :

- Texte d'introduction du composant.
- Total de la couche de persistance (espace, pourcentage, niveau d'occupation).
- En-têtes des familles F1 à F4.
- Toutes les entrées de F1 à F4 : nom, message d'état, espace utilisé, datation, provenance.

### 3.2 — Éléments secondaires

Les éléments suivants sont présents et lisibles sans interaction, mais de moindre prominence visuelle :

- Étiquettes de provenance de chaque famille.
- Niveau d'occupation dans le total.
- Zone F5 — Système local et ses trois entrées.

### 3.3 — Éléments repliables

La zone F5 — Système local est repliable par l'opérateur. Son état par défaut est visible : les trois entrées sont affichées dès l'ouverture du diagnostic. L'opérateur peut réduire la zone F5 sans que les données ne soient supprimées. Le repli est réversible.

Aucune autre zone du diagnostic n'est repliable.

### 3.4 — Message d'état vide global

Affiché à la place de l'ensemble des familles, uniquement si toutes les entrées du diagnostic sont absentes ou vides :

> "Aucune donnée opérateur n'est enregistrée sur cet appareil."

Dès qu'au moins une entrée est présente, le message global disparaît et chaque famille affiche ses entrées avec leur état respectif.

---

## 4 — Principes de présentation UX

### 4.1 — Aucune urgence visuelle

Le diagnostic ne produit aucun signal d'urgence. Les niveaux d'occupation "Élevé" et "Saturé" sont des descriptions factuelles. Ils ne sont pas mis en valeur par rapport à "Nominal". La présentation de ces trois niveaux est visuellement équivalente.

### 4.2 — Aucune hiérarchie émotionnelle entre états

Les états Présente, Vide, Absente et Non datée sont présentés sur le même plan de neutralité. Aucun état n'est affiché de façon à paraître plus grave, plus souhaitable ou plus urgent que les autres. L'introduction du composant (§2.1) pose explicitement ce principe avant que l'opérateur ne lise les données.

### 4.3 — Lecture linéaire et passive

Le diagnostic se lit de haut en bas : introduction → total → F1 → F2 → F3 → F4 → F5. Aucune interaction n'est requise pour lire les informations principales. La lecture est passive — elle ne déclenche aucun événement, ne modifie aucune donnée.

### 4.4 — Aucune invitation à l'action

Aucun élément du diagnostic ne constitue une invitation à agir. Le diagnostic ne contient ni formulation directive, ni appel à corriger un état. L'opérateur qui agit sur sa couche de persistance le fait depuis d'autres zones de l'interface, jamais depuis le diagnostic mémoriel.

---

## 5 — Présentation des états

### 5.1 — État Présente

| Élément | Affichage |
|---|---|
| Nom | Libellé opérateur |
| Espace utilisé | "X,X Ko" |
| Datation | "Mis à jour le JJ/MM/AAAA" |
| Provenance | Étiquette discrète de la famille |

### 5.2 — État Vide

| Élément | Affichage |
|---|---|
| Nom | Libellé opérateur |
| Message d'état | "Aucune donnée enregistrée" |
| Espace utilisé | Volume réel de l'enveloppe — "0,X Ko" |
| Datation | "Mis à jour le JJ/MM/AAAA" si métadonnée disponible · "— datation non disponible" sinon |
| Provenance | Étiquette discrète de la famille |

### 5.3 — État Absente

| Élément | Affichage |
|---|---|
| Nom | Libellé opérateur |
| Message d'état | "Non enregistrée" |
| Espace utilisé | "—" |
| Datation | *(aucun affichage)* |
| Provenance | Étiquette discrète de la famille |

### 5.4 — État Non datée (R1, R3)

| Élément | Affichage |
|---|---|
| Nom | Libellé opérateur |
| Espace utilisé | "X,X Ko" |
| Datation | "— datation non disponible" |
| Provenance | Étiquette discrète de la famille |

---

## 6 — Cohérence documentaire

LOT-P1.4 ne modifie, n'étend ni ne restreint aucune définition issue des lots précédents.

### 6.1 — Décisions déléguées reçues et tranchées

| Décision déléguée par | Décision prise en LOT-P1.4 |
|---|---|
| LOT-P1.2 §2 — Note sur F5 : "La hiérarchisation visuelle de F5 est une décision de LOT-P1.4" | F5 est présenté dans une zone visuellement secondaire, après F1→F4, visible par défaut, repliable par l'opérateur. |
| LOT-P1.2 §1 — Introduction du composant | Positionnée en tête du diagnostic, toujours visible, avant le total et les familles. |

### 6.2 — Vérification de cohérence avec LOT-P1.1

| Point de vérification | Résultat |
|---|---|
| Les 14 entrées présentes dans le diagnostic correspondent à l'inventaire LOT-P1.1 | Conforme |
| Les familles exclues (embarquement initial, limitation d'accès, marqueurs migration) n'apparaissent pas dans la présentation | Conforme |

### 6.3 — Vérification de cohérence avec LOT-P1.2

| Point de vérification | Résultat |
|---|---|
| Organisation F1→F5 préservée | Conforme |
| Libellés opérateur des entrées préservés | Conforme |
| États (Présente / Vide / Absente / Non datée) préservés sans modification | Conforme |
| Règles d'espace utilisé (LOT-P1.2 §6) reprises en §5 sans modification | Conforme |
| Étiquettes de provenance (LOT-P1.2 §3) reprises en §2.3 sans modification | Conforme |
| Introduction du composant (LOT-P1.2 §1) reprise mot pour mot en §2.1 | Conforme |
| Message vide global (LOT-P1.2 §7) repris en §3.4 sans modification | Conforme |

### 6.4 — Vérification de cohérence avec LOT-P1.3

| Point de vérification | Résultat |
|---|---|
| Règle §5.1 (afficher la date) reprise en §5.1 et §5.2 | Conforme |
| Règle §5.2 (datation non disponible) reprise en §5.2 et §5.4 | Conforme |
| Règle §5.3 (aucun affichage si absente) reprise en §5.3 | Conforme |
| Règle §5.4 (vide avec datation disponible) reprise en §5.2 | Conforme |
| Comportement prescrit R1 ("— datation non disponible") respecté en §5.4 | Conforme |
| Comportement prescrit R3 ("— datation non disponible") respecté en §5.4 | Conforme |

---

## 7 — Critères de validation avant LOT-P1.5

LOT-P1.4 est validé et LOT-P1.5 peut être ouvert si et seulement si :

1. L'ordre d'affichage (introduction → total → F1→F4 → F5) est approuvé par l'opérateur.
2. L'ordre des entrées au sein de chaque famille (§1.2) est approuvé.
3. La hiérarchie de lecture — F1→F4 en niveau principal, F5 en zone secondaire repliable — est approuvée.
4. Les règles d'affichage par état (§5.1 à §5.4) sont jugées complètes et cohérentes avec LOT-P1.2 et LOT-P1.3.
5. L'absence d'invitation à l'action (§4.4) est respectée dans chaque élément du diagnostic.
6. Le traitement de F5 (visible par défaut, repliable par l'opérateur) est approuvé.
7. Les vérifications de cohérence §6.2, §6.3 et §6.4 sont approuvées sans réserve.
8. Aucun terme du présent cadrage n'introduit de vocabulaire prescriptif, d'urgence ou d'interprétation émotionnelle.

Ces critères sont vérifiables sans code. La validation est une décision de l'opérateur sur le cadrage, pas un test technique.

---

*Surface de présentation opérateur — LOT-P1.4 · Programme P1 · Phase A · Caméléon Engine · 2026-07-06.*
