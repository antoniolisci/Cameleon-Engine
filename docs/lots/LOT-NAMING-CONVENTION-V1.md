# Convention de nommage des LOT V1
## Document de gouvernance opérationnelle

---

## Statut

| Champ | Valeur |
|---|---|
| Statut | **OFFICIEL — gouvernance active** |
| Date de validation | 2026-07-07 |
| Niveau hiérarchique | N5 — sous Roadmap V1, même niveau que les LOT |
| Dépend de | Roadmap V1 (`f83bb0c`) · Foundations Index §16 |

---

## 1 — Mission

Ce document fixe la convention officielle de nommage des LOT de Caméléon Engine.

Il résout une ambiguïté identifiée après la clôture de LOT-P1 : l'identifiant `LOT-Pxx` inauguré dans le cadrage de LOT-P1 ne définissait pas la grammaire de `xx`. Ce vide rendait l'identifiant du prochain LOT indéterminable sans risque de confusion avec les noms de programmes de la Roadmap V1.

Cette convention s'applique à tous les nouveaux LOT. Elle ne renomme aucun LOT existant.

---

## 2 — Convention officielle

**Format :** `LOT-[famille]-[numéro de programme]-[numéro de lot dans le programme]`

Pour la famille Programme (famille principale) :

```
LOT-P[x]-[n]
```

où :
- `P` désigne la famille Programme
- `[x]` est le numéro du programme dans la Roadmap V1 (P1 → P8)
- `[n]` est le numéro séquentiel du lot à l'intérieur de ce programme, en commençant à 1

**Exemples de forme canonique :**

| Identifiant | Signification |
|---|---|
| `LOT-P1-2` | Deuxième lot du Programme P1 |
| `LOT-P1-3` | Troisième lot du Programme P1 |
| `LOT-P2-1` | Premier lot du Programme P2 |
| `LOT-P3-1` | Premier lot du Programme P3 |

*Note : le premier lot du Programme P1 est `LOT-P1` (exception historique — voir §3). La forme `LOT-P1-1` n'est pas utilisée comme identifiant actif.*

---

## 3 — Exception historique — LOT-P1

**LOT-P1 constitue une exception historique.**

Ce lot a été ouvert avant que la convention ne soit formalisée. Son identifiant — `LOT-P1` sans suffixe numérique — est conservé dans tous les documents existants sans modification.

| Champ | Valeur |
|---|---|
| Identifiant canonique | `LOT-P1` |
| Forme conventionnelle équivalente | `LOT-P1-1` |
| Raison du maintien | Traçabilité documentaire — commits, validation terrain, MEMORY.md, Notion |
| Renommage | Interdit — préserve la traçabilité |

Cette exception ne crée aucune ambiguïté : `LOT-P1` désigne sans équivoque le premier lot du Programme P1 dans tout document antérieur à cette convention. Tous les lots suivants du Programme P1 portent le suffixe numérique : `LOT-P1-2`, `LOT-P1-3`, etc.

---

## 4 — Règles de nommage

**Règle 1 — Numéro de programme.**
Le numéro de programme `[x]` correspond toujours à l'un des 8 programmes définis dans la Roadmap V1 (P1 à P8). Aucun numéro hors de cet espace n'est valide pour la famille Programme.

**Règle 2 — Numérotation séquentielle par programme.**
La numérotation de `[n]` repart à 1 pour chaque programme. `LOT-P1-2` et `LOT-P2-2` sont deux lots dans deux programmes distincts — leur numéro `2` est indépendant.

**Règle 3 — Exception LOT-P1 strictement bornée.**
L'absence de suffixe numérique est réservée à `LOT-P1`. Tout autre premier lot d'un programme porte obligatoirement le suffixe `-1` : `LOT-P2-1`, `LOT-P3-1`, etc.

**Règle 4 — Sous-phases internes.**
Les étapes internes d'un LOT utilisent la notation point : `LOT-P1-2.1`, `LOT-P1-2.2`, etc. Ce suffixe point ne crée pas de nouveau LOT — il désigne une phase de travail à l'intérieur du LOT parent.

**Règle 5 — Indépendance des familles.**
Les conventions propres aux autres familles de LOT (exemple : famille Hardening) sont indépendantes de cette convention. Elles ne sont ni modifiées ni contraintes par ce document.

---

## 5 — Autres familles de LOT

La famille Hardening utilise la convention `LOT-H[nn]` (numérotation séquentielle à deux chiffres, indépendante des programmes). Cette convention est fixée par la pratique existante (LOT-H01, LOT-H02) et n'est pas couverte par le présent document.

Toute nouvelle famille de LOT devra définir sa propre convention par un document équivalent avant l'ouverture du premier lot de cette famille.

---

## 6 — Exemples

| Situation | Identifiant correct |
|---|---|
| Premier lot du Programme P1 (historique) | `LOT-P1` |
| Deuxième lot du Programme P1 | `LOT-P1-2` |
| Troisième lot du Programme P1 | `LOT-P1-3` |
| Premier lot du Programme P2 | `LOT-P2-1` |
| Première phase interne du deuxième lot du Programme P1 | `LOT-P1-2.1` |
| Deuxième phase interne du deuxième lot du Programme P1 | `LOT-P1-2.2` |

---

## 7 — Conditions de révision

Cette convention peut être révisée si :

- un nouveau type de programme est introduit ne correspondant pas à l'espace P1–P8 de la Roadmap V1 ;
- une ambiguïté non couverte par les règles actuelles est identifiée en situation réelle ;
- la Roadmap V1 est révisée en V2 et modifie la numérotation des programmes.

Une révision produit un document `LOT-NAMING-CONVENTION-V2.md` et n'annule pas V1 tant que des lots nommés selon V1 restent actifs.

---

*Convention de nommage des LOT V1 — Gouvernance opérationnelle · Caméléon Engine · 2026-07-07.*
