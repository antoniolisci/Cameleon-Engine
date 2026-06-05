# PERC-01 — Calibration perceptive cockpit production

Caméléon Engine · Direction UX
Date : 2026-06-05
Statut : **Clôturé**

---

## Objectif

Adapter les principes de calibration perceptive validés sur le prototype V1-R1A au cockpit de production réel, sans migration directe des sélecteurs du prototype.

Le cockpit de production utilise une architecture de cartes empilées, incompatible avec le flux linéaire séquentiel du prototype. PERC-01 est une calibration originale — non une migration.

## Décision architecturale

**Prototype V1-R1A :** flux linéaire séquentiel (`.section-bloc` → `.section-coherence` → `.section-signaux` → `.section-systeme`). L'espacement entre sections crée le rythme cognitif. Aucun de ces sélecteurs n'existe en production.

**Production :** architecture de cartes autonomes dans `.moteur-flow { display: grid; gap: 24px }`. Gap uniforme entre toutes les cartes — aucune hiérarchie spatiale.

**Conséquence :** migration 1:1 déclarée impossible lors de l'audit de lancement. PERC-01 applique les principes — espacement différentiel, respiration des items, récession système — aux sélecteurs de production existants.

**Scope final :** `src/css/style.css` uniquement · 3 règles CSS · aucune modification HTML · aucune modification `render.js`.

## Leviers appliqués

### A1 — Pause cognitive avant synthèse

**But :** créer une respiration perceptible entre la zone de décision (`.verdict-shell`) et la zone de justification (`.pourquoi-shell`). Signaler implicitement au cerveau un changement de nature — de "directive" à "explication".

**Application :**
```css
.moteur-flow > .pourquoi-shell { margin-top: 16px; }
```
Gap visuel avant `.pourquoi-shell` : 24px (gap grille) + 16px (margin) = **40px**.

**Résultat :** A1 — VALIDÉ. Pause ressentie. La carte "Pourquoi cette décision" est perçue comme distincte du bloc verdict, pas comme une continuation immédiate.

### A2 — Récession zone système

**But :** séparer visuellement la zone de métadonnées système (`.navigation-shell` : Mode / CORE / SNIPER / Score) du flux décisionnel. Signaler que ce qui suit n'est pas une zone de décision.

**Application :**
```css
.moteur-flow > .navigation-shell { margin-top: 20px; }
```
Gap visuel avant `.navigation-shell` : 24px (gap grille) + 20px (margin) = **44px**.

**Résultat :** A2 — VALIDÉ. Le bloc KPI est perçu comme une zone de fond distincte, pas comme une carte parmi d'autres dans le flux décisionnel.

### B — Respiration des items

**But :** permettre la lecture individuelle des 4 lignes de justification (Marché / Risque / Comportement / Action). Chaque ligne doit être lue, pas scannée.

**Application :**
```css
/* valeur portée de 10px à 14px */
.why-decision-item { padding: 14px 0; }
```
Respiration par item : 10px → **14px** (+40%).

**Résultat :** B — VALIDÉ. Les 4 items sont individuellement lisibles. La synthèse décisionnelle respire sans allonger visuellement la carte.

## Validation terrain

**Observations recueillies :**

- Lecture plus naturelle du flux décisionnel global
- Séparation verdict / justification renforcée — le cerveau perçoit deux zones distinctes
- KPI système relégués au second plan comme zone de fond, non comme zone active
- Items décisionnels (Marché / Risque / Comportement / Action) mieux individualisés

| Levier | Statut |
|---|---|
| A1 — Pause cognitive avant synthèse | ✅ VALIDÉ |
| A2 — Récession zone système | ✅ VALIDÉ |
| B — Respiration des items | ✅ VALIDÉ |

## Impact utilisateur

Le cockpit produit désormais une hiérarchie perceptive dans son flux principal :

```
.verdict-shell       ← zone de décision (poids fort, ancrage)
  [40px]             ← pause respiratoire — signal de transition
.pourquoi-shell      ← zone de justification (poids moyen, résolution)
  [24px]
.master-card         ← zone de contexte (informationnel)
  [24px + publications]
  [44px]             ← espace large — sortie du flux décisionnel
.navigation-shell    ← zone de fond (métadonnées, décrochage voulu)
```

Avant PERC-01, les 6 éléments du `.moteur-flow` étaient espacés uniformément (24px). Le cerveau ne recevait aucun signal de hiérarchie — toutes les cartes existaient au même niveau perceptif.

Après PERC-01, deux pauses respiratoires différenciées créent une narration lisible sans lecture complète : verdict → justification → fond système.

## Risques

Aucun risque de régression observé.

Risque théorique identifié lors de l'audit et infirmé à l'usage : `margin-top` sur `.pourquoi-shell` quand `display: none` (onglet non actif) — le margin ne s'applique pas, comportement CSS standard confirmé.

## Dette restante

Aucune dette active liée à PERC-01.

Levier D (pivot typographique — `.pourquoi-shell .card-title { color: var(--state-text) }`) intentionnellement différé. Il n'est pas une dette — sa valeur ajoutée n'est pas démontrée. Conditions de réouverture : signal terrain de confusion visuelle sur la zone de justification.

## Décision finale

**Statut : PERC-01 — CLÔTURÉ**

Justification : les 3 leviers validés (A1 / A2 / B) produisent les effets cognitifs attendus sans régression. Le scope CSS-only a été respecté intégralement. 3 règles CSS dans `src/css/style.css`. Aucune modification HTML ni JS.

Conditions de réouverture :
1. Signal terrain documenté de confusion visuelle dans le flux décisionnel.
2. Modification architecturale du `.moteur-flow` qui invalide les marges actuelles.
3. Activation du levier D sur preuve d'utilité démontrée.

En dehors de ces conditions, le chantier reste clôturé.
