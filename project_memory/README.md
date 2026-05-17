# project_memory — Mémoire du projet Caméléon Engine

**Statut :** Actif

## Rôle

Mémoire évolutive du projet. Conserve les décisions, erreurs, solutions et observations utiles pour les futures sessions de développement. Complète le code source sans le remplacer.

## Ce qu'on y met

- Décisions d'architecture et leurs raisons
- Bugs identifiés et correctifs appliqués
- Problèmes d'import réels avec données réelles
- Observations comportementales et décisionnelles
- Notes d'intégration entre modules
- Limitations connues documentées
- Snapshots d'état système

## Ce qu'on n'y met pas

- Code source (→ `src/`)
- Données sensibles ou credentials
- Fichiers de test bruts (→ `excel_tests/`)
- Documentation générique sans lien avec un cas réel

## Structure des sous-dossiers

| Dossier | Contenu |
|---|---|
| `architecture_decisions/` | Décisions structurelles validées ou abandonnées |
| `archives/` | Systèmes et versions obsolètes conservés |
| `bugs_console/` | Erreurs JS, 404, stack traces |
| `comportemental/` | Module comportemental — profils, scoring, patterns |
| `imports_excel_csv/` | Cas d'import Binance/CSV — parsing, normalisation |
| `integration_notes/` | Notes de connexion entre modules |
| `known_limitations/` | Limites connues et non bloquantes |
| `mapping_systems/` | Correspondances état/vidéo/label/action |
| `moteur_decision/` | Règles moteur, scoring, filtres |
| `performance/` | Observations de performance et optimisations |
| `prompts/` | Bibliothèque de prompts IA réutilisables |
| `responsive/` | Comportement multi-device |
| `state_snapshots/` | Captures d'état système à un instant T |
| `test_protocols/` | Protocoles de test reproductibles |
| `ui_layout/` | Décisions UI/UX et hiérarchie visuelle |
| `videos_assets/` | Mapping vidéo, formats, associations moteur |

## Règles de nommage

```
DOMAINE_NNN_description_courte.md
```
Exemples : `BUG_001_404_video_manquante.md`, `IMPORT_003_csv_virgule_decimale.md`

## Règles fondamentales

- Ne jamais supprimer un cas documenté — archiver si obsolète
- Documenter la solution finale, pas seulement le problème
- Un fichier = un cas précis
- Référencer le commit ou la date quand c'est pertinent
