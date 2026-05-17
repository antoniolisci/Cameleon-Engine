# excel_tests — Fichiers de test import CSV / XLSX

**Statut :** Actif  
**Gitignore :** Les fichiers CSV/XLSX réels ne sont JAMAIS commités — seuls les `.md` de `05_notes/` sont trackés.

---

## Structure

```
excel_tests/
  01_working/           ← fichiers qui passent correctement
  02_broken/            ← fichiers qui échouent (0 trades, parsing KO, diagnostic contradictoire)
  03_edge_cases/        ← fichiers ambigus (wallet, earn, headers décalés, formats rares)
  04_anonymized_samples/← futurs fichiers anonymisés — ne rien commiter sans validation explicite
  05_notes/             ← fiches markdown de cas (commités si pas de données sensibles)
```

---

## Rôle des dossiers

### `01_working/`
Fichiers qui passent correctement : trades détectés, sessions sauvegardées, analyse exploitable.  
→ Servent de référence et de non-régression.

### `02_broken/`
Fichiers qui échouent : 0 trades extraits, parsing impossible, statut détecté mais lignes rejetées, erreur UI ou diagnostic contradictoire.  
→ Chaque fichier cassé doit avoir une fiche correspondante dans `05_notes/`.

### `03_edge_cases/`
Fichiers ambigus : wallet / earn, exports partiels, headers décalés, formats rares, fichiers très courts, exports Binance atypiques.  
→ Ni working ni broken — comportement à préciser.

### `04_anonymized_samples/`
Réservé aux fichiers dont les données sensibles ont été supprimées ou remplacées, et qui pourraient éventuellement être versionnés.  
→ **Ne rien commiter sans validation explicite.**

### `05_notes/`
Fiches markdown documentant chaque cas terrain (working, broken, edge).  
→ Utiliser `CASE_TEMPLATE.md` pour créer chaque fiche.  
→ Ces fichiers **peuvent être commités** s'ils ne contiennent aucune donnée sensible (pas de User_ID, pas de valeurs financières réelles, pas d'adresses).

---

## Règles absolues

- **Ne jamais commiter de fichiers CSV ou XLSX** (quel que soit le dossier).
- **Ne jamais commiter de fichiers contenant un User_ID, adresse ou données financières réelles.**
- **Toujours classer un fichier cassé dans `02_broken/`** et créer une fiche dans `05_notes/`.
- **Toujours créer une fiche `05_notes/CASE_XXX.md`** avant de corriger un bug lié à un fichier terrain.
- **Ne jamais corriger le pipeline sans cas reproductible documenté.**

---

## Workflow

```
1. Fichier reçu ou bug observé
   → classer dans 01_working/, 02_broken/ ou 03_edge_cases/
   → créer excel_tests/05_notes/CASE_XXX.md (copier CASE_TEMPLATE.md)

2. Si bug confirmé
   → remplir la fiche : symptôme, headers, statuts, hypothèse
   → référencer dans project_memory/imports_excel_csv/ si décision structurante

3. Si correction appliquée
   → mettre à jour la fiche : statut → corrigé / validé
   → commiter uniquement la fiche .md
```

---

## Gitignore

Règles actives dans `.gitignore` :
```
excel_tests/**
!excel_tests/README.md
!excel_tests/05_notes/*.md
```

Les CSV, XLSX et tout autre fichier binaire restent exclusivement locaux.

---

## Lien avec la mémoire projet

Les décisions structurantes issues des cas terrain sont documentées dans :
→ `project_memory/imports_excel_csv/`
