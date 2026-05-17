# prompts — Bibliothèque de prompts IA

**Statut :** Actif

## Rôle

Conserve les prompts IA réutilisables pour le développement, le débogage, la génération d'assets et la conception de Caméléon Engine. Évite de reformuler des instructions complexes à chaque session.

## Ce qu'on y met

- Prompts de développement (Claude, Codex)
- Prompts de génération visuelle (Midjourney, DALL-E, Sora)
- Prompts de génération vidéo (Runway, Kling, etc.)
- Prompts d'architecture et de review de code
- Prompts de branding et de naming
- Variantes et itérations utiles d'un même prompt

## Ce qu'on n'y met pas

- Prompts génériques non liés au projet
- Sorties de prompts (résultats) — sauf si elles documentent un cas utile
- Prompts temporaires de session sans valeur de réutilisation

## Règles de nommage

```
PROMPT_NNN_type_sujet.md
```
Exemples : `PROMPT_001_video_comportementale_alignement.md`, `PROMPT_002_review_moteur_scoring.md`

## Catégories recommandées

| Préfixe | Usage |
|---|---|
| `PROMPT_VIDEO_` | Génération vidéo (Runway, Kling, Sora) |
| `PROMPT_IMG_` | Génération image (Midjourney, DALL-E) |
| `PROMPT_CODE_` | Développement (Claude, Codex) |
| `PROMPT_ARCHI_` | Architecture et review |
| `PROMPT_BRAND_` | Branding, naming, copywriting |

## Exemple de fiche

```markdown
# PROMPT-001 — Vidéo comportementale : alignement

## Outil
Runway Gen-3 / Kling

## Prompt
"Slow morphing of a chameleon skin pattern, subtle color shift from gold to deep teal,
looping seamlessly, dark background, cinematic, 4 seconds, no text"

## Résultat
Utilisé pour video_comportementale/alignement.mp4

## Notes
Ajouter "looping seamlessly" est essentiel pour la fluidité en lecture auto.

## Statut
Validé — en production
## Date
2025-XX
```

## Statut du dossier

Actif — alimenté à chaque prompt réutilisable identifié.
