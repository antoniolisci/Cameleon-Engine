# LOT-P1 — Diagnostic mémoriel V1
## Cadrage officiel — Premier LOT issu de la Roadmap V1

---

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1 |
| Titre | Diagnostic mémoriel V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Observabilité |
| Statut | CADRAGE VALIDÉ — GO |
| Ancrage GPD V1 | Partie VIII (blancs P1) · Partie IX (dépendances) · Partie XIII (terrain Roadmap) |
| Date de cadrage | 2026-07-06 |
| Commit de référence (Roadmap V1) | `f83bb0c` |

---

## 1 — Contexte et ancrage Roadmap V1

La Roadmap V1 (gelée `f83bb0c`) place le Programme P1 — **Fondation Mémoire & Persistance** en tête de Phase A. C'est le programme zéro prérequis, celui dont tous les autres dépendent.

Avant d'engager la construction de P1, une première étape s'impose : **rendre visible ce qui existe déjà**. Le Grand Plan Directeur V1 (Partie VIII) a cartographié les blancs de P1 — mais le terrain opérationnel n'a jamais été posé comme un objet d'observation structuré. C'est l'objet de ce LOT.

LOT-P1 est le **premier LOT officiel issu de la Roadmap V1**. Il inaugure la famille **LOT-Pxx** (Programme).

---

## 2 — Objectif architectural

Produire une **surface de diagnostic mémoriel** permettant à l'opérateur de lire l'état courant de la couche de persistance sans modifier cette couche.

Le diagnostic doit répondre à quatre questions :

1. Quelles familles mémoire sont actives ?
2. Quel volume occupent-elles ?
3. Quelle est leur date de dernière écriture ?
4. La couche de persistance est-elle dans un état sain ?

Le diagnostic est **lecture seule**. Il ne produit aucune transformation, aucun calcul nouveau, aucune entrée dans la couche de persistance.

---

## 3 — Périmètre

Le LOT-P1 est décomposé en cinq livrables architecturaux.

### LOT-P1.1 — Inventaire des familles mémoire actives

Rendre visible l'ensemble des familles mémoire présentes dans la couche de persistance au moment de l'accès. Le diagnostic liste chaque famille connue, son état (présente / absente / vide) et son statut de validité structurelle.

### LOT-P1.2 — Métrologie de la couche de persistance

Exposer les indicateurs de capacité et d'occupation de la couche de persistance : volume total occupé, niveau de saturation, volume par famille. Les métriques utilisent exclusivement les interfaces d'estimation déjà disponibles dans la couche de persistance — aucun calcul nouveau n'est introduit.

### LOT-P1.3 — Traçabilité temporelle des entrées

Exposer la date de dernière écriture de chaque famille mémoire présente. Ce livrable est confiné à son périmètre : il lit les métadonnées de datation déjà attachées aux entrées par la couche de persistance existante. Il ne calcule pas de dérivée temporelle, ne produit pas de score d'activité, ne tire aucune conclusion de comportement.

### LOT-P1.4 — Surface de présentation opérateur

Définir la zone d'interface dans laquelle le diagnostic mémoriel est rendu accessible à l'opérateur. La surface de présentation utilise exclusivement la couche de présentation existante. Aucun nouveau composant graphique autonome n'est créé — le diagnostic s'insère dans une zone identifiée et cohérente avec l'architecture UI en place.

### LOT-P1.5 — Validation terrain

Confirmer, par observation directe en conditions réelles, que le diagnostic mémoriel :
- affiche des données cohérentes avec l'état réel de la couche de persistance ;
- ne produit aucun effet de bord sur les familles mémoire observées ;
- est lisible et non ambigu pour l'opérateur.

---

## 4 — Ce que ce LOT NE fait PAS

Ce LOT n'introduit aucun des éléments suivants :

- **Aucune nouvelle famille mémoire** — le diagnostic observe l'existant, il ne crée pas de structure de persistance nouvelle.
- **Aucun calcul nouveau** — toutes les métriques utilisées sont déjà produites par la couche de persistance existante.
- **Aucune écriture dans la couche de persistance** — pas d'écriture, pas de purge, pas de migration, pas de réparation automatique.
- **Aucun accès cloud** — le diagnostic est local uniquement. La couche cloud (LOT 3 Compte Utilisateur V1) est hors périmètre.
- **Aucune décision automatisée** — le diagnostic informe l'opérateur, il ne déclenche aucune action sans intervention humaine explicite.
- **Aucune modification de l'architecture existante** — interfaces, couche de présentation, couche de persistance : tout reste inchangé en sortie de LOT.

---

## 5 — Prérequis et dépendances

**Prérequis Programme P1 :** aucun (Phase A, premier programme).

**Prérequis techniques :** la couche de persistance doit exposer des interfaces d'estimation de volume et de lecture des métadonnées de datation. Ces interfaces existent dans la base de code actuelle — elles ont été identifiées lors du cadrage et validées comme suffisantes pour LOT-P1.1 à LOT-P1.3.

**Dépendances aval :** LOT-P1 est un prérequis informationnel pour les LOT suivants du Programme P1. Le diagnostic mémoriel V1 produit la cartographie de terrain nécessaire à toute décision d'architecture sur la couche de persistance.

---

## 6 — Critères de réussite

### Ce que l'opérateur voit

1. Le diagnostic mémoriel est accessible depuis l'interface sans manipulation technique.
2. Chaque famille mémoire connue apparaît dans le diagnostic avec son état (présente / absente / vide).
3. Le volume occupé par chaque famille est lisible.
4. Le volume total de la couche de persistance est affiché avec son niveau de saturation.
5. La date de dernière écriture est visible pour chaque famille présente.
6. Une famille absente ou vide est distinguée visuellement d'une famille présente.
7. Le diagnostic est cohérent avec l'état réel de la couche de persistance — aucun écart observé entre le diagnostic affiché et les données effectivement stockées.
8. La lecture du diagnostic ne produit aucun changement observable dans l'interface ou dans la couche de persistance.

### Ce qui ne s'est pas produit

9. Aucune nouvelle famille mémoire n'a été créée dans la couche de persistance.
10. Aucun nouveau calcul n'a été introduit — les métriques exposées sont exclusivement celles déjà produites par les interfaces existantes.
11. Aucune écriture n'a été effectuée dans la couche de persistance lors de l'accès au diagnostic.
12. Aucune action automatique n'a été déclenchée sans intervention explicite de l'opérateur.
13. Aucune donnée de la couche cloud n'a été lue ni écrite.
14. Aucune interface existante (persistance, présentation, moteur) n'a été modifiée dans son comportement.
15. Aucun nouveau composant graphique autonome n'a été introduit hors de la zone de présentation identifiée.

### Qualité du cadrage

16. Le cadrage est valide indépendamment de l'implémentation technique — il reste applicable si la couche de persistance est remplacée par une technologie différente dans cinq ans.
17. Chaque livrable (LOT-P1.1 à LOT-P1.5) est vérifiable séparément.
18. Aucun terme d'implémentation (nom de fichier, API spécifique, clé de stockage) n'apparaît dans ce cadrage.

---

## 7 — Livrables attendus

| Livrable | Nature | Forme |
|---|---|---|
| LOT-P1.1 | Inventaire des familles actives | Rendu dans l'interface |
| LOT-P1.2 | Métrologie de la couche de persistance | Rendu dans l'interface |
| LOT-P1.3 | Traçabilité temporelle | Rendu dans l'interface |
| LOT-P1.4 | Surface de présentation opérateur | Zone UI identifiée et intégrée |
| LOT-P1.5 | Validation terrain | Rapport de validation (document ou note de validation) |

---

## 8 — Ressources disponibles

La couche de persistance existante expose des interfaces suffisantes pour l'ensemble des livrables LOT-P1.1 à LOT-P1.3 :

- **Estimation du volume** par famille et total : interface disponible.
- **Niveau de saturation** de la couche : interface disponible (états distincts : nominal / attention / critique).
- **Métadonnées de datation** (`updatedAt`) attachées aux entrées par la couche de persistance lors de chaque écriture : disponibles sur les familles gérées par le wrapper centralisé.
- **Inventaire des familles connues** : défini dans la couche de persistance, accessible en lecture.

Aucune de ces ressources ne doit être modifiée pour servir LOT-P1.

---

## 9 — Points de vigilance architecturaux

Ces points ne bloquent pas l'ouverture du LOT. Ils doivent être intégrés dans les décisions de conception de LOT-P1.2 et LOT-P1.4.

**⚠ I-04 — Silence structurel** : le diagnostic ne doit pas afficher une donnée absente comme une erreur. Une famille mémoire absente ou vide est un état normal — le diagnostic le rend visible sans jugement, sans alerte implicite. Toute formulation suggérant une anomalie en l'absence de donnée viole I-04.

**⚠ I-08 — Provenance traçable** : les métriques affichées dans le diagnostic doivent être traçables jusqu'à leur source dans la couche de persistance. Si une métrique est une estimation (non une valeur exacte), la nature estimée doit être explicite dans la présentation.

**⚠ Language System V1** : les étiquettes et formulations du diagnostic sont soumises au Language System V1. Le diagnostic ne doit pas introduire de terminologie nouvelle non validée. Les termes décrivant l'état mémoriel (famille, persistance, saturation, traçabilité) sont conformes au dictionnaire officiel.

---

## 10 — Conformité doctrinale

| Référentiel | Statut | Note |
|---|---|---|
| ACF V1 — I-01 (local-first) | Conforme | Diagnostic local uniquement |
| ACF V1 — I-02 (autorité humaine) | Conforme | Aucune action automatique |
| ACF V1 — I-03 (Lecture ≠ Action) | Conforme | Le diagnostic lit, n'agit pas |
| ACF V1 — I-04 (silence structurel) | ⚠ Vigilance | Voir §9 |
| ACF V1 — I-05 (mémoire comme cœur) | Conforme | LOT centré sur la couche mémoire |
| ACF V1 — I-06 (profil interdit) | Conforme | Aucune classification opérateur |
| ACF V1 — I-07 (corrélation non imposée) | Conforme | Aucune corrélation produite |
| ACF V1 — I-08 (provenance traçable) | ⚠ Vigilance | Voir §9 |
| ACF V1 — I-09 (dégradation gracieuse) | Conforme | Famille absente = état affiché, pas d'erreur |
| ACF V1 — I-10 (valeur temporelle) | Conforme | Datation exposée comme donnée brute |
| Language System V1 | ⚠ Vigilance | Voir §9 |
| Roadmap V1 — I-TR-01 | Conforme | Ancrage GPD V1 documenté en §1 |
| Doctrine de Gouvernance V1 | Conforme | Cadrage avant toute implémentation |

**Blocages identifiés :** Aucun bloquant. Les trois points de vigilance (I-04 · I-08 · LS V1) sont des points de conception à traiter en LOT-P1.2 et LOT-P1.4 — ils ne bloquent pas l'ouverture du LOT.

---

## 11 — Statut et décision de gel

| Champ | Valeur |
|---|---|
| Statut | CADRAGE VALIDÉ — GO |
| Audit Phase 5 | CAS A — accordé sans réserve |
| Date de validation | 2026-07-06 |
| Conditions de réouverture | Régression constatée · ou décision explicite de l'opérateur |

Ce cadrage est valide jusqu'à clôture du LOT ou décision explicite de révision. Il ne prescrit aucun délai, aucun outil, aucune technologie. Il définit uniquement ce que LOT-P1 doit accomplir et dans quelles limites architecturales.

---

*Premier LOT officiel issu de la Roadmap V1 — Programme P1 · Phase A · Caméléon Engine · 2026-07-06.*
