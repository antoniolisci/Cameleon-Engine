# bugs_console — Historique des erreurs console

**Statut :** Actif

## Rôle

Mémoire des erreurs JS, erreurs 404, comportements anormaux et logs importants observés en développement ou en production. Chaque fiche documente un cas réel.

## Ce qu'on y met

- Erreurs JavaScript (TypeError, ReferenceError, etc.)
- Erreurs réseau (404 sur assets, scripts, vidéos)
- Stack traces significatives
- Comportements inattendus du moteur ou du rendu
- Cause identifiée + correctif appliqué
- Commit de résolution si disponible

## Ce qu'on n'y met pas

- Bugs d'import CSV/Excel (→ `imports_excel_csv/`)
- Problèmes de performance (→ `performance/`)
- Décisions d'architecture issues d'un bug (→ `architecture_decisions/`)
- Logs de débogage temporaires sans valeur documentaire

## Règles de nommage

```
BUG_NNN_description_courte.md
```
Exemples : `BUG_001_videos_supprimees_encore_appelees.md`, `BUG_002_render_undefined_posture.md`

## Exemple de fiche

```markdown
# BUG-002 — render.js : posture undefined au premier chargement

## Problème observé
TypeError: Cannot read properties of undefined (reading 'posture')
Console → render.js ligne 312

## Cause
buildPayload() appelé avant que le formulaire soit initialisé.

## Correctif appliqué
Ajout d'un guard `if (!state.posture) return;` en tête de renderDecision().

## Commit
abc1234 — fix(render): guard posture undefined on init

## Statut
Résolu
## Date
2025-XX
```

## Fichiers existants

| Fichier | Résumé |
|---|---|
| `BUG_001_videos_supprimees_encore_appelees.md` | Erreurs 404 sur anciennes vidéos — références obsolètes dans le mapping |

## Statut du dossier

Actif — alimenté à chaque bug significatif identifié.
