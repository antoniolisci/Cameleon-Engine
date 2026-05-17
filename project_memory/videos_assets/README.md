# videos_assets — Assets vidéo

**Statut :** Actif

## Rôle

Mémoire des assets vidéo du projet : mapping état/vidéo, formats, codecs, comportements de rendu, et décisions liées à l'intégration des vidéos dans l'interface.

## Structure des vidéos

```
assets/video/
  video_comportementale/    ← états comportementaux (alignement, exces, defense...)
  video_structurelle/       ← états structurels (coherence, transformation, mystere...)
  video_supprimee/          ← archives vidéo — ne pas référencer dans le code
```

## Ce qu'on y met

- Mapping état moteur → fichier vidéo (voir aussi `mapping_systems/`)
- Spécifications de format (codec, résolution, durée, ratio)
- Comportements de rendu observés (autoplay, loop, preload)
- Problèmes de codec ou de compatibilité navigateur
- Décisions sur les vidéos supprimées / remplacées
- Notes sur les vidéos générées par IA (prompt source si connu)

## Ce qu'on n'y met pas

- Les fichiers vidéo eux-mêmes (→ `assets/video/`)
- Prompts de génération vidéo (→ `prompts/`)
- Bugs 404 sur des vidéos manquantes (→ `bugs_console/`)

## Règles de nommage

```
VID_NNN_description.md
```
Exemples : `VID_001_mapping_complet_etats.md`, `VID_002_format_codec_recommande.md`

## Exemple de fiche

```markdown
# VID-001 — Mapping complet états moteur → vidéos

## Vidéos comportementales

| État | Fichier |
|---|---|
| alignement | video_comportementale/alignement.mp4 |
| assechement | video_comportementale/assechement.mp4 |
| defense | video_comportementale/defense.mp4 |
| degradation | video_comportementale/degradation.mp4 |
| exces | video_comportementale/exces.mp4 |
| execute | video_comportementale/execute.mp4 |
| inflexion | video_comportementale/inflexion.mp4 |
| observation | video_comportementale/observation.mp4 |
| piege | video_comportementale/piege.mp4 |
| prudence | video_comportementale/prudence.mp4 |
| retenue | video_comportementale/retenue.mp4 |

## Vidéos structurelles

| État | Fichier |
|---|---|
| coherence | video_structurelle/coherence.mp4 |
| introspection | video_structurelle/introspection.mp4 |
| mystere | video_structurelle/mystere.mp4 |
| mystere_silencieuse | video_structurelle/mystere_silencieuse.mp4 |
| ralentissement | video_structurelle/ralentissement.mp4 |
| respiration_systeme | video_structurelle/respiration_systeme.mp4 |
| transformation | video_structurelle/transformation.mp4 |

## Statut
À valider contre le code render.js
## Date
2026-05-17
```

## Bug connu

`BUG_001` — Des anciennes vidéos (supprimées) sont encore référencées dans le code. Voir `bugs_console/BUG_001_videos_supprimees_encore_appelees.md`.

## Statut du dossier

Actif — alimenté lors de tout ajout, suppression ou modification d'asset vidéo.
