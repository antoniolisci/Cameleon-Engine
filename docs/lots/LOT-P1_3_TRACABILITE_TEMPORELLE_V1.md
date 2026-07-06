# LOT-P1.3 — Traçabilité temporelle des familles mémorielles

**Statut : CADRAGE**

---

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1.3 |
| Titre | Traçabilité temporelle des familles mémorielles |
| LOT parent | LOT-P1 — Diagnostic mémoriel V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Observabilité |
| Statut | CADRAGE |
| Date de cadrage | 2026-07-06 |
| Prérequis | LOT-P1.1 validé · LOT-P1.2 validé `e03edec` |

---

## 1 — Définition de la traçabilité temporelle

La traçabilité temporelle d'une famille mémorielle désigne la capacité du diagnostic à lire et à présenter, pour cette famille, la date de sa dernière écriture dans la couche de persistance.

Une famille est temporellement traçable si et seulement si elle expose une métadonnée de datation directement lisible, au format standard défini par la couche de persistance, attachée automatiquement lors de chaque écriture.

### 1.1 — Quatre cas de datation

| Cas | Définition |
|---|---|
| Date directement disponible | La famille expose une métadonnée de datation dans l'enveloppe standard au format ISO 8601. La date est lue sans transformation, sans calcul, sans déduction. |
| Date absente | La famille ne contient aucune métadonnée de datation dans sa structure. Aucune date ne peut être lue. |
| Date non exploitable | La famille expose une information temporelle, mais dans un format non standard ou via un mécanisme non conforme à l'enveloppe de datation. Cette information ne peut pas être utilisée comme source. |
| Date inconnue | La famille est absente de la couche de persistance. Aucune information de datation n'est accessible. |

### 1.2 — Principe fondamental

Le diagnostic lit la datation. Il ne calcule pas de datation. Il ne déduit pas de datation. Il ne comble pas l'absence de datation.

Si la datation n'est pas directement disponible dans l'enveloppe standard, le diagnostic déclare l'état "datation non disponible" — sans exception, sans substitution, sans approximation.

---

## 2 — Classification des familles mémorielles

La classification est établie exclusivement à partir de l'inventaire LOT-P1.1. Elle couvre toutes les familles de la couche de persistance, y compris celles exclues du diagnostic LOT-P1.2.

### 2.1 — Familles datables

Familles dont la datation est directement disponible dans l'enveloppe standard au format ISO 8601. Le diagnostic peut afficher leur date de dernière écriture.

| Famille mémorielle | Famille dans le diagnostic |
|---|---|
| Sessions comportementales | F1 |
| Paramètres d'ordres récents | F1 |
| Mémoire opérateur | F2 |
| Historique des analyses opérateur | F2 |
| Journal des décisions moteur | F3 |
| Sauvegardes moteur | F3 |
| Registre des importations | F4 |
| Portefeuille | F4 |
| Paramètres | F4 |
| Identité locale | F5 |
| État de navigation | F5 |
| Instantané moteur | F5 |

**Douze familles datables.** Toutes sont présentes dans le diagnostic LOT-P1.2.

### 2.2 — Familles non datables

Familles dont la structure ne contient aucune métadonnée de datation. La date de dernière écriture ne peut pas être lue.

| Famille mémorielle | Famille dans le diagnostic | Raison |
|---|---|---|
| Mémoire comportementale | F1 | Structure brute sans enveloppe de datation |

**Une famille non datable** dans le périmètre du diagnostic.

### 2.3 — Familles à datation non exploitable

Familles qui exposent une information temporelle, mais dans un format non conforme à l'enveloppe standard. Cette information ne peut pas être utilisée comme source de datation.

| Famille mémorielle | Famille dans le diagnostic | Raison |
|---|---|---|
| Niveau de garde comportemental | F1 | Information temporelle disponible dans un format non standard, non conforme à l'enveloppe de datation |

**Une famille à datation non exploitable** dans le périmètre du diagnostic.

### 2.4 — Familles hors périmètre du diagnostic

Familles inventoriées en LOT-P1.1 mais exclues du diagnostic LOT-P1.2. Leur classification est documentée pour exhaustivité.

| Famille mémorielle | Raison d'exclusion | Cas de datation |
|---|---|---|
| Clé d'embarquement initial | Valeur primitive, hors domaine mémoriel opérateur | Date absente |
| Clé de limitation temporelle d'accès | Éphémère | Date absente |
| Marqueurs de migration | Internes, non opérationnels | Non applicable |

Ces familles n'appartiennent pas au périmètre actif de la traçabilité temporelle dans LOT-P1.

---

## 3 — Source de datation autorisée

Une seule source de datation est autorisée dans le diagnostic mémoriel :

**La métadonnée de datation attachée automatiquement par la couche de persistance lors de chaque écriture, exprimée au format ISO 8601, présente dans l'enveloppe standard de chaque entrée.**

Pour être une source autorisée, une métadonnée doit satisfaire les quatre conditions suivantes :

1. **Produite automatiquement** lors de chaque écriture par la couche de persistance — sans intervention manuelle ni calcul externe.
2. **Attachée à l'entrée** dans une enveloppe de format stable — présente dans la structure même de l'entrée, pas dans une ressource adjacente.
3. **Exprimée au format ISO 8601** — directement lisible sans conversion de format.
4. **Directement lisible** — sans transformation, sans calcul, sans déduction.

Toute source ne satisfaisant pas l'une de ces quatre conditions est une source interdite.

---

## 4 — Sources de datation interdites

Les sources suivantes ne peuvent pas être utilisées dans le périmètre de LOT-P1.

| Source interdite | Raison |
|---|---|
| Information temporelle en format non standard (millisecondes, epoch, horodatage propriétaire) | Nécessite une transformation de format — viole la condition de lecture directe |
| Estimation de date | Viole I-08 — la provenance n'est pas directement traçable |
| Déduction à partir du contenu de l'entrée | Viole I-08 — la date serait calculée, pas lue |
| Position d'un élément dans un tableau ou une liste | Aucune garantie d'ordre chronologique d'écriture |
| Volume ou espace utilisé de l'entrée | Aucune corrélation avec la date d'écriture |
| Ordre d'apparition dans la couche de persistance | Non défini, non stable, non garanti |
| Métadonnée d'une ressource système externe | Hors couche de persistance, hors périmètre LOT-P1 |
| Hypothèse sur la fréquence d'écriture | Viole I-08 et I-04 — introduit une interprétation |
| Date d'une entrée voisine ou d'une famille liée | Aucune relation de datation garantie entre entrées distinctes |

Dans le périmètre de LOT-P1, ces sources sont interdites sans exception. Si la seule information temporelle disponible est une source interdite, le comportement prescrit est "datation non disponible".

---

## 5 — Règles d'affichage de la datation

### 5.1 — Quand afficher la date

La date est affichée si et seulement si les trois conditions suivantes sont simultanément réunies :

1. La famille est dans l'état Présente (au sens de LOT-P1.2 §4).
2. La métadonnée de datation est présente dans l'enveloppe standard de l'entrée.
3. La métadonnée est au format ISO 8601 directement lisible.

**Format d'affichage :** "Mis à jour le JJ/MM/AAAA" — date seule, sans l'heure.

### 5.2 — Quand afficher "datation non disponible"

La mention "datation non disponible" est affichée dans les cas suivants :

- La famille est dans l'état Présente ou Vide, et sa structure ne contient pas de métadonnée de datation dans l'enveloppe standard.
- La famille est dans l'état Présente ou Vide, et une information temporelle existe mais dans un format non conforme à l'enveloppe standard.

Dans les deux cas, le comportement d'affichage est identique. La raison de l'indisponibilité n'est pas exposée à l'opérateur.

### 5.3 — Quand n'afficher aucune datation

Aucune date et aucune mention de datation ne sont affichées si la famille est dans l'état Absente.

### 5.4 — Famille vide avec datation disponible

Si une famille est dans l'état Vide et qu'une métadonnée de datation standard est présente dans l'enveloppe de l'entrée au format ISO 8601, cette date est affichée conformément aux règles du §5.1.

---

## 6 — Cas particuliers documentés

### 6.1 — R1 — Mémoire comportementale (non datable)

La famille de mémoire comportementale synthétisée est stockée dans la couche de persistance sous une forme structurelle brute, sans enveloppe de datation. Aucune métadonnée de datation n'est produite lors des écritures dans cette famille. La date de dernière écriture ne peut pas être lue.

**Comportement prescrit :** afficher "datation non disponible".

**Interdit :** déduire une date à partir du contenu, de la taille, ou de la position des éléments dans la structure.

**Impact sur le diagnostic :** la famille R1 apparaît dans le diagnostic (F1) avec son espace utilisé. Aucune date n'est affichée.

**Nature du cas :** absence structurelle. La couche de persistance n'a pas été conçue pour attacher une métadonnée de datation à cette famille. Ce n'est pas une anomalie du diagnostic — c'est une limite connue, documentée, traitée conformément au §5.2.

### 6.2 — R2 — Clé d'embarquement initial (hors périmètre du diagnostic)

La clé d'embarquement initial est stockée comme valeur primitive, sans enveloppe. Elle est exclue du diagnostic LOT-P1.2 pour raison de domaine (hors domaine mémoriel opérateur). Sa classification de datation est "Date absente".

**Impact sur le diagnostic :** aucun. La famille est exclue du périmètre — sa traçabilité temporelle ne constitue pas un cas actif pour LOT-P1.

### 6.3 — R3 — Niveau de garde comportemental (datation non exploitable)

La famille de niveau de garde comportemental est stockée sans enveloppe de datation standard. Une information temporelle complémentaire est présente dans la couche de persistance pour cette famille, mais dans un format non standard (non ISO 8601, non conforme à l'enveloppe). Cette information ne constitue pas une source autorisée au sens du §3.

L'utiliser nécessiterait une transformation de format — ce qui viole la condition de lecture directe (§3, condition 4) et le principe fondamental du §1.2.

**Comportement prescrit :** afficher "datation non disponible".

**Interdit :** convertir, transformer ou interpréter l'information temporelle complémentaire pour en déduire une date affichable.

**Impact sur le diagnostic :** la famille R3 apparaît dans le diagnostic (F1) avec son espace utilisé. Aucune date n'est affichée.

**Note architecturale :** la distinction entre R1 (absence structurelle de datation) et R3 (présence non conforme d'une information temporelle) est documentée pour précision. Elle ne change pas le comportement d'affichage prescrit, qui est identique dans les deux cas.

---

## 7 — Neutralité doctrinale

### 7.1 — Conformité ACF V1

| Invariant | Application dans LOT-P1.3 |
|---|---|
| I-02 (autorité humaine) | Aucune décision automatique. Le diagnostic lit et expose — l'interprétation appartient à l'opérateur. |
| I-03 (Lecture ≠ Action) | La traçabilité temporelle lit des métadonnées existantes. Elle ne modifie aucune donnée, ne répare aucune absence, ne normalise aucun format. |
| I-04 (Silence structurel) | L'absence de datation est un état normal. "Datation non disponible" est une description factuelle de l'état observé. Les familles R1 et R3 sont des états connus, non des défauts. |
| I-08 (Provenance traçable) | Seules les métadonnées directement lisibles dans l'enveloppe standard sont autorisées. Toute date affichée est traçable jusqu'à sa source. Toute absence est explicitement signalée. Aucune date implicite, estimée ou déduite n'est présentée. |

### 7.2 — Conformité Language System V1

| Terme | Statut |
|---|---|
| "Mis à jour le JJ/MM/AAAA" | Conforme — factuel, neutre |
| "Datation non disponible" | Conforme — descriptif de l'état, non alarmant |
| Datable / Non datable / À datation non exploitable | Conforme — classification structurelle, non qualitative |
| "Limite connue", "état observé" | Conforme — neutre, non prescriptif |
| ~~"Erreur de datation"~~ | Interdit — qualificatif négatif, viole I-04 |
| ~~"Donnée corrompue"~~ | Interdit — interprétation non justifiée |
| ~~"Manque de datation"~~ | Interdit — suggère un défaut là où il y a un état normal |
| ~~"Doit être corrigé"~~ | Interdit — prescription, viole I-03 |

---

## 8 — Critères de validation avant LOT-P1.4

LOT-P1.3 est validé et LOT-P1.4 peut être ouvert si et seulement si :

1. La définition des quatre cas de datation (§1.1) est approuvée par l'opérateur.
2. Le principe fondamental (§1.2 — lecture sans calcul ni déduction) est approuvé sans réserve.
3. La classification complète des familles (§2 — douze datables, une non datable, une à datation non exploitable) est approuvée.
4. L'unicité de la source autorisée (§3) et ses quatre conditions cumulatives sont approuvées.
5. La liste des sources interdites (§4) est approuvée sans réserve, y compris l'interdiction de transformer l'information temporelle de R3.
6. Les règles d'affichage (§5) sont jugées complètes et cohérentes avec LOT-P1.2.
7. Les comportements prescrits pour R1, R2 et R3 (§6) sont approuvés.
8. Aucun élément de ce cadrage ne propose, n'implique ni n'anticipe de modification de la couche de persistance, de ses formats, de ses structures ou de ses mécanismes d'écriture.

Ces critères sont vérifiables sans code. La validation est une décision de l'opérateur sur le cadrage, pas un test technique.

---

*Traçabilité temporelle des familles mémorielles — LOT-P1.3 · Programme P1 · Phase A · Caméléon Engine · 2026-07-06.*
