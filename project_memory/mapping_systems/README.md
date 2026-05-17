# mapping_systems — Systèmes de correspondance

**Statut :** Actif

## Rôle

Documente les tables de correspondance utilisées dans le moteur : état → vidéo, état → label, posture → actions, score → niveau de risque. Centralise la logique de mapping pour en garder une trace claire hors du code.

## Ce qu'on y met

- Mapping état moteur → fichier vidéo
- Mapping posture → actions autorisées / interdites
- Mapping score → niveau de risque
- Mapping state:modifier → décision comportementale
- Évolutions des tables de correspondance (avant / après)
- Notes sur les anomalies de mapping

## Ce qu'on n'y met pas

- Code source des tables (→ `src/js/data.js`, `src/js/decision.js`)
- Bugs liés à un mapping incorrect (→ `bugs_console/`)
- Décisions d'architecture sur le système de mapping (→ `architecture_decisions/`)

## Règles de nommage

```
MAP_NNN_type_mapping.md
```
Exemples : `MAP_001_etat_video.md`, `MAP_002_posture_actions.md`, `MAP_003_score_risque.md`

## Exemple de fiche

```markdown
# MAP-001 — Mapping état moteur → vidéo

## Objectif
Associer chaque état moteur à un fichier vidéo dans assets/video/.

## Table (extrait)

| État moteur | Fichier vidéo |
|---|---|
| coherence | video_structurelle/coherence.mp4 |
| transformation | video_structurelle/transformation.mp4 |
| alignement | video_comportementale/alignement.mp4 |
| exces | video_comportementale/exces.mp4 |

## Source
`src/js/render.js` — section videoMapping

## Statut
À documenter complètement
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté lors de modifications ou d'extensions des tables de correspondance.
