# imports_excel_csv — Cas d'import CSV / Excel

**Statut :** Actif

## Rôle

Mémoire des problèmes rencontrés lors de l'import de fichiers Binance et autres sources (CSV, XLSX). Documente les cas réels, les erreurs de parsing, les solutions de normalisation appliquées.

## Contexte

Caméléon Engine importe des historiques de trades (Order History, Spot Trade History, dépôts/retraits) depuis Binance. Les formats varient selon la plateforme, la langue d'export, la version de l'interface. Les cas limites sont nombreux.

## Ce qu'on y met

- Problèmes de détection de colonnes ou de header row
- Erreurs de normalisation des statuts (FILLED, Exécuté, etc.)
- Problèmes de décodage (virgule décimale FR, encodage UTF-8/BOM)
- Cas de fichiers avec lignes de titre avant le vrai header
- Comportements inattendus sur des fichiers réels utilisateurs
- Solutions de normalisation validées
- Cas limites à garder en mémoire pour les évolutions futures

## Ce qu'on n'y met pas

- Les fichiers CSV/XLSX eux-mêmes (→ `excel_tests/`)
- Bugs JS non liés à l'import (→ `bugs_console/`)
- Décisions d'architecture du parser (→ `architecture_decisions/`)

## Règles de nommage

```
IMPORT_NNN_description_courte.md
```
Exemples : `IMPORT_001_FILLED_detecte_mais_non_reconnu.md`, `IMPORT_002_virgule_decimale_FR.md`

## Exemple de fiche

```markdown
# IMPORT-002 — Virgule décimale française dans CSV Binance

## Fichier source
`binance_spot_trade_1month.xlsx` — export FR

## Problème observé
Prix et quantités parsés à 0 ou NaN. Les valeurs utilisent "," comme séparateur décimal.

## Cause
parseFloat() natif ne reconnaît pas la virgule FR — renvoie NaN.

## Correctif appliqué
Fonction `parseNum()` : remplace "," par "." avant parseFloat().

## Commit
89101b2 — fix(import): French decimal comma

## Statut
Résolu
## Date
2025-XX
```

## Fichiers existants

| Fichier | Résumé |
|---|---|
| `IMPORT_001_FILLED_detecte_mais_non_reconnu.md` | Statut FILLED présent mais filtré — mismatch normalisation |

## Statut du dossier

Actif — alimenté à chaque nouveau cas d'import problématique.
