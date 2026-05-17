# ui_layout — Décisions UI / UX

**Statut :** Actif

## Rôle

Mémoire des décisions de mise en page, de hiérarchie visuelle et d'organisation des blocs de l'interface. Documente les choix UI et leur justification pour éviter les régressions lors des évolutions.

## Rappel de structure

L'interface comporte 3 onglets principaux :
- **Moteur** — formulaire 16 champs + panneau décision
- **Pilotage** — import CSV/Excel + historique de trades
- **Mémoire** — historique des 50 derniers snapshots

Plus une sidebar **Comportement** (module isolé) et un panneau **Debug Brain** (optionnel).

## Ce qu'on y met

- Organisation des zones et des blocs
- Hiérarchie visuelle et logique de lecture
- Décisions sur l'ordre d'affichage des informations
- Cohérence cognitive entre sections
- Choix typographiques et d'espacement ayant un impact UX
- Décisions sur les animations et transitions

## Ce qu'on n'y met pas

- CSS brut (→ `src/css/`)
- Comportement responsive (→ `responsive/`)
- Bugs de rendu (→ `bugs_console/`)
- Décisions d'architecture (→ `architecture_decisions/`)

## Règles de nommage

```
UI_NNN_zone_sujet.md
```
Exemples : `UI_001_panneau_decision_hierarchie.md`, `UI_002_sidebar_comportement_position.md`

## Exemple de fiche

```markdown
# UI-001 — Panneau décision : hiérarchie d'affichage

## Zone
Onglet Moteur — résultat de l'analyse

## Hiérarchie retenue
1. Posture (label dominant — grande typographie)
2. Score + niveau de risque
3. Actions autorisées (liste verte)
4. Actions interdites (liste rouge)
5. Coaching adaptatif (texte secondaire)

## Raison
L'opérateur doit voir la posture en premier coup d'œil, sans avoir à chercher.
Le reste est contextuel.

## Statut
Validé — en production
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté lors de chaque modification significative de l'organisation visuelle.
