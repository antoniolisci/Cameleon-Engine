# performance — Observations de performance

**Statut :** Actif

## Rôle

Documente les observations liées aux performances du système : temps de rendu, fluidité UI, consommation mémoire, chargement des assets. Utile pour anticiper les dégradations sur des configurations moins puissantes.

## Ce qu'on y met

- Observations de lenteur ou de saccades UI
- Temps de chargement des assets vidéo
- Consommation mémoire localStorage (taille des snapshots)
- Optimisations appliquées et leur effet mesuré
- Problèmes de rendu DOM sur render.js (~3600 lignes)
- Comportements sur appareils lents ou navigateurs anciens

## Ce qu'on n'y met pas

- Bugs fonctionnels (→ `bugs_console/`)
- Problèmes responsive (→ `responsive/`)
- Décisions d'architecture motivées par la performance (→ `architecture_decisions/`)

## Règles de nommage

```
PERF_NNN_description_courte.md
```
Exemples : `PERF_001_rendu_historique_lent_50_entrees.md`, `PERF_002_video_preload_comportement.md`

## Exemple de fiche

```markdown
# PERF-001 — Ralentissement rendu historique > 30 entrées

## Observation
Délai visible (~200ms) lors du rendu du panneau Mémoire avec 40+ snapshots.

## Cause probable
Boucle DOM dans render.js reconstruit l'intégralité du panneau à chaque update.

## Optimisation envisagée
Rendu différentiel ou virtualisation de la liste.

## Impact actuel
Faible — acceptable en usage normal (cap 50 entrées).

## Statut
En observation
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté dès qu'un comportement de performance mérite d'être noté.
