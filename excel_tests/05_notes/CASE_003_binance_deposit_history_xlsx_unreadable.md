# CASE_003 — Binance historique dépôts XLSX : "fichier vide ou illisible"

## Statut
broken

## Fichier source local
`Binance-Rapport-d'historique-des-dépôts-2026-05-16.xlsx`  
À placer dans `excel_tests/02_broken/` pour reproduction.

## Type supposé
NON_TRADING — export de flux financiers (dépôts). Hors périmètre trading V1.  
Mais le pipeline **ne devrait pas** retourner "vide" si le workbook est lisible.

## Symptôme observé
Message UI exact :

> "Le fichier est vide ou son format n'a pas pu être lu."

Différence avec CASE_002 (retraits) :
- CASE_002 : arrivait jusqu'à `classifyFile()` → message "Export Binance détecté mais colonnes non mappées"
- CASE_003 : bloque **avant** `classifyFile()` → `rows.length === 0` après `readFileAsXLSX()`

## Ce que le système détecte
- format : non atteint (rows vide)
- statuts : sans objet
- headers : inconnus au moment du rapport
- nombre de lignes brutes : inconnu
- nombre de trades extraits : 0

---

## Analyse du pipeline — où ça casse

Le message "Le fichier est vide ou son format n'a pas pu être lu." vient de `uploader.js:264` :

```javascript
if (!rows || rows.length === 0) {
  return { ok: false, error: 'Le fichier est vide ou son format n\'a pas pu être lu.', trades: [] };
}
```

Ce chemin est atteint **après** le `try/catch` — donc `readFileAsXLSX()` n'a pas levé d'exception.  
L'exception `NO_HEADER_FOUND` aurait produit "Aucune ligne d'en-têtes Binance trouvée...".  
Une exception générique aurait produit "Impossible de lire le fichier. Vérifiez qu'il n'est pas corrompu."

**Conclusion : `readFileAsXLSX()` a réussi mais retourné `rows = []`.**

Séquence probable :
1. `XLSX.read()` → workbook valide ✅ (pas d'exception)
2. `workbook.Sheets[SheetNames[0]]` → sheet lue
3. `sheet_to_json()` → `raw2d` produit
4. `findHeaderRowIndex(raw2d)` → **soit -1 (NO_HEADER_FOUND) soit un index valide**
5. Si header trouvé → toutes les lignes de données sont vides → `rows = []`
6. → message "vide"

---

## Hypothèses prioritaires

### H1 — Feuille de résumé ou couverture sur Sheet 1
**La plus probable.** Binance structure parfois ses exports XLSX avec une première feuille "résumé" ou "métadonnées" (totaux, période, compte) et les données réelles sur Sheet 2.
`readFileAsXLSX()` lit uniquement `SheetNames[0]` → si Sheet 1 est une page de garde, `raw2d` est soit vide soit sans lignes de données après l'en-tête.

### H2 — Cellules fusionnées sur la feuille de données
L'export dépôts peut utiliser des cellules fusionnées (merged cells) pour les en-têtes ou les données groupées.
SheetJS avec `{ raw: false, defval: '' }` remplit les cellules fusionnées avec `''` sauf la cellule supérieure gauche → lignes détectées comme vides → toutes sautées.

### H3 — `headerIdx` valide mais 0 ligne de données
L'en-tête est trouvé (ex : ligne 3) mais le fichier ne contient qu'une seule ligne de dépôt, elle-même détectée comme vide (cellules toutes `''`).
Peu probable pour un export réel avec des transactions.

### H4 — Feuille protégée ou chiffrée
SheetJS ouvre le workbook mais retourne des cellules vides pour une feuille protégée.
Peu probable pour un export Binance standard.

### H5 — `headerIdx === -1` → exception → catch → mauvais message
Si `findHeaderRowIndex()` retourne -1, `readFileAsXLSX()` lance `NO_HEADER_FOUND`.
Le catch retournerait "Aucune ligne d'en-têtes Binance trouvée..." — pas le message observé.
**Cette hypothèse est exclue** — le message observé n'est pas ce texte.

---

## Traces diagnostiques temporaires ajoutées

**Fichier modifié : `src/js/behavior/import/uploader.js`**  
**Ces traces doivent être supprimées après diagnostic — NE PAS COMMITER.**

```javascript
// [DIAG CASE_003] dans readFileAsXLSX()
console.log('[DIAG CASE_003] SheetNames:', workbook.SheetNames);
console.log('[DIAG CASE_003] Sheet utilisée:', workbook.SheetNames[0]);
console.log('[DIAG CASE_003] raw2d.length:', raw2d.length);
console.log('[DIAG CASE_003] raw2d[0]:', raw2d[0]);
console.log('[DIAG CASE_003] raw2d[1]:', raw2d[1]);
console.log('[DIAG CASE_003] raw2d[2]:', raw2d[2]);
console.log('[DIAG CASE_003] headerIdx:', headerIdx);
console.log('[DIAG CASE_003] rows.length final:', rows.length);
```

**Lecture des traces :**

| Trace | Ce qu'elle révèle |
|-------|------------------|
| `SheetNames` | Combien de feuilles, noms → H1 confirmée si plusieurs sheets |
| `Sheet utilisée` | Nom de la feuille lue (ex: "Résumé", "Cover", "Sheet1") |
| `raw2d.length` | Nombre total de lignes lues par SheetJS (0 = feuille vide) |
| `raw2d[0/1/2]` | Contenu des 3 premières lignes → structure réelle du fichier |
| `headerIdx` | -1 = pas d'en-tête trouvé ; ≥0 = index de la ligne d'en-têtes |
| `rows.length final` | 0 = toutes les lignes de données étaient vides |

---

## Prochaine action terrain

1. **Activer le niveau "Verbose" dans DevTools** (Console → filtre Default → passer à Verbose).
2. **Placer le fichier dans `excel_tests/02_broken/`.**
3. **Importer le fichier** dans l'onglet Comportement.
4. **Capturer toutes les lignes `[DIAG CASE_003]`** dans la console.
5. **Reporter ici** :
   - valeur de `SheetNames`
   - valeur de `raw2d.length`
   - contenu de `raw2d[0]`, `raw2d[1]`, `raw2d[2]`
   - valeur de `headerIdx`
   - valeur de `rows.length final`
6. **Mettre à jour le statut** et l'hypothèse confirmée.
7. **Supprimer les traces** de `uploader.js` après diagnostic.

---

## Résultat attendu
Message clair "hors périmètre" (comme CASE_002) ou, si le workbook a plusieurs feuilles, lecture de la bonne feuille.

## Résultat obtenu
"Le fichier est vide ou son format n'a pas pu être lu." — pipeline bloqué avant `classifyFile()`.

## Statut de correction
**en cours de diagnostic** — traces ajoutées dans `uploader.js`, en attente de reproduction avec le fichier réel.

## Notes
- Différence clé avec CASE_002 (retraits) : ce fichier ne passe pas `classifyFile()` → le problème est en amont dans `readFileAsXLSX()`.
- Si H1 confirmée (plusieurs sheets) : correction possible = scanner toutes les feuilles jusqu'à trouver un header valide, ou utiliser la dernière feuille.
- Ne pas corriger avant d'avoir les logs de diagnostic.
- Ne pas commiter les traces de debug (`[DIAG CASE_003]`).
