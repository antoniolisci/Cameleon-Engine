# LOT-P1-2.3 — Indexation par famille, date et session
## Spécification — Troisième sous-phase de LOT-P1-2

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-2.3 |
| Titre | Indexation par famille, date et session |
| Sous-phase de | LOT-P1-2 — Couche de persistance canonique V1 |
| Programme | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Spécification d'indexation |
| Statut | EN RÉDACTION |
| Prérequis satisfaits | LOT-P1-2.2 — VALIDÉ · `8c7a4be` |
| Document officiel | `docs/lots/LOT-P1-2_3_INDEXATION_V1.md` |
| Date | 2026-07-08 |

---

## 1 — Identité et périmètre

LOT-P1-2.3 a une responsabilité unique : construire l'index transversal permettant la retrouvabilité des traces selon trois axes — famille, date, session — et définir les deux modes de lecture que cet index rend possibles.

L'index est maintenu automatiquement par la couche à chaque écriture. Il ne produit aucune corrélation, aucune synthèse, aucune interface visible pour l'opérateur. Il est une infrastructure de retrouvabilité, interne à la couche de persistance.

Ce document complète LOT-P1-2.2 sur le point qu'il exclut explicitement (§4.4) : la construction de l'index triple-axe et les modes de lecture par date et par session. Il ne redéfinit aucune règle déjà établie par LOT-P1-2.1 ou LOT-P1-2.2.

---

## 2 — Prérequis et position dans LOT-P1-2

### 2.1 — Prérequis bloquant

LOT-P1-2.3 ne peut pas commencer sans que LOT-P1-2.2 soit validé. L'index est construit sur le corpus de traces déjà présent dans la couche canonique. Sans couche canonique opérationnelle, il n'existe pas de corpus à indexer.

### 2.2 — Position dans la séquence

LOT-P1-2.3 est la troisième sous-phase de LOT-P1-2. Il peut avancer en parallèle avec LOT-P1-2.4 (doctrine de provenance) — les deux sous-phases n'ont pas de dépendance directe entre elles.

LOT-P1-2.5 (validation terrain) ne peut pas commencer tant que LOT-P1-2.3 et LOT-P1-2.4 ne sont pas tous deux validés.

### 2.3 — Absence d'ouverture automatique

La validation de LOT-P1-2.3 n'ouvre pas automatiquement LOT-P1-2.4 ni LOT-P1-2.5. Chaque ouverture requiert une décision opérateur explicite.

---

## 3 — Corpus cible

L'index est construit sur le corpus constitué par les traces issues de la migration effectuée par LOT-P1-2.2. Ce corpus comprend les 10 traces mémorielles réparties dans les quatre familles ACF V1 actives en Phase A :

| Famille | Entrées indexées |
|---|---|
| SY1 — Comportementale | Sessions comportementales · Mémoire comportementale (R1) · Niveau de garde comportemental (R3) · Paramètres d'ordres récents (R4) · Mémoire opérateur · Historique analyses opérateur |
| SY3 — Décisionnelle | Journal des décisions moteur · Sauvegardes moteur |
| S1 — Transactionnelle | Registre des importations |
| S2 — Patrimoniale | Portefeuille |

Les familles ACF V1 présentes dans le registre mais sans trace active en Phase A sont incluses dans la structure de l'index avec un ensemble vide. Leur présence dans le registre est conforme à l'architecture définie par LOT-P1-2 §4.4.

Toute trace écrite dans la couche après la migration est automatiquement indexée au moment de son écriture. Aucune trace présente dans la couche n'est destinée à rester hors index.

---

## 4 — Structure de l'index triple-axe

L'index transversal est maintenu par la couche elle-même. Il opère sur trois axes :

**Axe famille** — permet la retrouvabilité de toutes les traces appartenant à une famille mémorielle donnée. Le mode de lecture par famille est opérationnel depuis LOT-P1-2.2. LOT-P1-2.3 intègre cet axe formellement dans la structure de l'index triple-axe.

**Axe date** — permet la retrouvabilité des traces dont la date d'écriture est comprise dans une plage donnée. La date utilisée par cet axe est celle du champ Date de la trace canonique, tel que défini par LOT-P1-2.1.

**Axe session** — permet la retrouvabilité de toutes les traces associées à un identifiant de session donné. L'identifiant de session est un champ optionnel de la trace. La couche indexe la valeur fournie sans en valider la sémantique.

L'index n'est jamais interrogé directement par les moteurs applicatifs. L'accès aux traces se fait exclusivement par l'interface de la couche.

---

## 5 — Intégration à la couche de persistance

### 5.1 — Ordre trace-avant-index (RE2)

À chaque écriture, la trace est persistée dans le compartiment de la famille correspondante avant que l'index soit mis à jour. Cet ordre est un invariant : l'écriture de la trace précède toujours la mise à jour de l'index.

Cet invariant est formalisé par RE2 (LOT-P1-2.1 §8.2). Il garantit que, quelle que soit la situation, les données mémorielles ne sont jamais sacrifiées au profit de la cohérence de l'index.

### 5.2 — Cohérence trace-index

La persistance vise une cohérence maximale entre la trace et l'index. En l'absence de mécanisme transactionnel natif dans le support de persistance cible, l'ordre trace-avant-index est fixe et préservé à chaque opération d'écriture.

En cas d'interruption survenant entre l'écriture de la trace et la mise à jour de l'index, l'index peut être en retard sur les données — mais les données ne sont jamais perdues. Une trace non encore reflétée dans l'index reste accessible par lecture directe de la famille concernée.

### 5.3 — Mécanisme de réconciliation

Un mécanisme de réconciliation de l'index peut être activé à l'initialisation de la couche. Lorsqu'il est activé, il détecte les divergences entre le corpus de traces présent dans la couche et l'état de l'index, puis corrige ces divergences.

Ce mécanisme est une capacité offerte par la couche. Il n'est pas activé de façon systématique à chaque initialisation. Son déclenchement n'est pas une obligation permanente — il intervient selon les conditions d'initialisation rencontrées.

---

## 6 — Modes de lecture ajoutés par LOT-P1-2.3

LOT-P1-2.2 a défini et rendu opérationnel le mode de lecture par famille. LOT-P1-2.3 ajoute deux modes complémentaires, rendus possibles par l'index triple-axe.

### 6.1 — Lecture par plage de date

La couche retourne l'ensemble des traces dont le champ Date est compris dans une plage de dates fournie. Les traces sont retournées dans l'ordre chronologique.

Si aucune trace ne correspond à la plage fournie, la couche retourne un ensemble vide — jamais une erreur bloquante (I-09).

### 6.2 — Lecture par session

La couche retourne l'ensemble des traces associées à un identifiant de session fourni. Les traces sont retournées dans l'ordre chronologique.

L'identifiant de session est traité comme une valeur opaque par la couche. Elle n'en valide pas la cohérence sémantique entre familles — elle indexe et restitue sur la valeur fournie.

Si aucune trace ne correspond à l'identifiant fourni, la couche retourne un ensemble vide — jamais une erreur bloquante (I-09).

La définition de ce qui constitue une session pour chaque famille active est de la responsabilité de la doctrine de provenance (LOT-P1-2.4). LOT-P1-2.3 ne définit pas ces unités.

---

## 7 — Traitement des dates formalisées dans l'index (MI-7)

Trois entrées du corpus migré par LOT-P1-2.2 portent une date formalisée non ISO 8601 :

| Entrée | Date formalisée |
|---|---|
| R1 — Mémoire comportementale | "Non disponible" |
| R3 — Niveau de garde comportemental | "Non disponible" |
| R4 — Paramètres d'ordres récents | "Non exploitable au format canonique" |

Ces états sont légitimes et formellement déclarés dans le modèle canonique (LOT-P1-2.1). Leur présence dans la couche ne constitue pas une anomalie.

Dans l'index, ces traces sont ordonnées selon leur ordre d'écriture dans la couche, conformément à l'invariant MI-7 (LOT-P1-2.1 §9). Elles ne sont pas exclues de l'index. Elles ne sont pas positionnées arbitrairement. Leur position relative dans l'axe date est celle qu'établit leur ordre d'écriture lors de la migration LOT-P1-2.2.

---

## 8 — Dimensionnement et limite Phase A

L'index triple-axe est dimensionné pour la volumétrie de la Phase A : familles SY1, SY3, S1 et S2 actives, corpus de l'ordre de quelques milliers de traces.

L'index est maintenu à chaque écriture. Ce mécanisme introduit un coût à chaque opération de persistance (R-TECH-02, LOT-P1-2 §7.3). Ce coût est assumé pour la Phase A. Son impact est à surveiller à mesure que les familles additionnelles deviennent actives.

À partir du Programme P6 (Corrélateur cross-familles), les requêtes sur de grandes volumétries exigeront une révision de l'architecture de l'index. Cette limite est documentée et assumée dans le cadrage LOT-P1-2 §4.4. LOT-P1-2.3 ne résout pas cette limite — il la borne explicitement.

---

## 9 — Exclusions de périmètre

Les responsabilités suivantes sont explicitement hors du périmètre de LOT-P1-2.3 :

| Exclusion | Délégation |
|---|---|
| Définition des unités de session par famille | LOT-P1-2.4 |
| Doctrine de provenance (source, date, contexte obligatoires) | LOT-P1-2.4 |
| Validation terrain de CV3 | LOT-P1-2.5 |
| Interface visible par l'opérateur | Hors périmètre LOT-P1-2 |
| Définition des règles de validation RV1→RV4 | LOT-P1-2.2 §4.2 — non redéfinies |
| Mode de lecture par famille | LOT-P1-2.2 — non redéfini |
| Corrélation entre familles | Programme P6 |

---

## 10 — Critère de validation (CV3)

Le critère de validation applicable à LOT-P1-2.3 est CV3, tel que défini dans le cadrage LOT-P1-2 §8 :

> **CV3 — Indexation opérationnelle**
> La retrouvabilité par famille, par date et par session est vérifiée sur les 14 entrées migrées. Chacun des trois modes de lecture retourne un résultat cohérent avec les données persistées.

La satisfaction de CV3 est constatée lors de la validation terrain LOT-P1-2.5. LOT-P1-2.3 pose les conditions nécessaires à cette vérification — il ne la réalise pas.

---

## 11 — Prochaine étape

À l'issue de la validation de LOT-P1-2.3, deux sous-phases peuvent être avancées :

- **LOT-P1-2.4** (Doctrine de provenance) — peut être ouvert en parallèle avec LOT-P1-2.3 ou après sa validation. Les deux sous-phases n'ont pas de dépendance directe.
- **LOT-P1-2.5** (Validation terrain) — ne peut commencer que lorsque LOT-P1-2.3 et LOT-P1-2.4 sont tous deux validés.

Aucune ouverture automatique.

---

*Spécification LOT-P1-2.3 — Programme P1 · Phase A · Caméléon Engine · 2026-07-08.*
