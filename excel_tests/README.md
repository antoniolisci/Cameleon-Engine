# excel_tests — Fichiers de test import CSV / XLSX

**Statut :** Actif

## Rôle

Répertoire des fichiers réels utilisés pour tester et déboguer le système d'import de Caméléon Engine. Ces fichiers sont des exports Binance authentiques ou des variantes préparées pour couvrir des cas limites.

## Ce qu'on y met

- Fichiers CSV/XLSX exportés depuis Binance (Order History, Spot Trade, Dépôts, Retraits)
- Fichiers de sources alternatives (Bitstack, etc.)
- Variantes préparées pour tester des cas limites (encodage, séparateur décimal, lignes de titre)
- Fichiers anciens conservés pour comparaison dans `anciens_fichiers_excel/`

## Ce qu'on n'y met pas

- Données sensibles ou identifiantes (vérifier avant commit)
- Fichiers JSON ou formats non supportés par l'import
- Fichiers dupliqués sans différence fonctionnelle

## Structure

```
excel_tests/
  *.csv / *.xlsx              ← fichiers de test courants
  anciens_fichiers_excel/     ← versions antérieures conservées pour référence
```

## Règles

- Ne jamais committer de fichiers contenant un User_ID ou des données personnelles
- Ce dossier est dans .gitignore — seuls les README sont trackés
- Référencer le fichier dans une fiche `imports_excel_csv/` si un problème a été trouvé dessus
- Les UUIDs dans les noms de fichiers correspondent aux exports Binance natifs — ne pas renommer

## Lien avec la mémoire

Les cas problématiques identifiés sur ces fichiers sont documentés dans :
→ `project_memory/imports_excel_csv/`

## Statut du dossier

Actif — alimenté à chaque nouveau format ou source d'import à tester.
