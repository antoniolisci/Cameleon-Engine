# CASE_001 — Order History : FILLED détectés, 0 trades extraits

## Statut
broken

## Fichier source local
**INCONNU — fichier réel non retrouvé.**
Le bug a été observé en session mais le fichier source n'a pas été conservé ou identifié.
Reproduction non garantie tant que le fichier réel n'est pas retrouvé et placé dans `02_broken/`.

## Type supposé
Order History (Format B — colonnes Status/Order ID détectées)

## Symptôme observé
Message UI exact :

> "Order History importé mais aucun ordre exécuté (FILLED) trouvé. Statuts détectés : FILLED, NEW, CANCELED."

Bloc de diagnostic affiché :
- FILLED × 30
- NEW × 14
- CANCELED × 17

## Ce que le système détecte
- format : ORDER_HISTORY (`detectFormat()` a reconnu les colonnes Status/Order ID)
- statuts collectés par `mapOrderRows()` : FILLED, NEW, CANCELED (confirmés dans `statusCounts`)
- headers : inconnus — fichier source manquant
- nombre de lignes brutes : 61 (30 + 14 + 17)
- nombre de trades extraits : **0**

## Contradiction centrale
`mapOrderRows()` collecte les statuts bruts (preuve que les lignes sont lues), puis `normalizeOrderRow()` retourne `null` pour chaque ligne FILLED malgré un `isFilledStatus()` qui devrait les accepter.

Le statut "FILLED" est dans la liste blanche de `isFilledStatus()` :
```javascript
norm === 'filled'  // ← devrait matcher
```
→ La rupture se situe donc **après** la détection du statut, ou le champ Status n'est pas résolu correctement par `get(ALIASES_STATUS)`.

---

## Hypothèses prioritaires

Classées par probabilité décroissante.

### H1 — Casse ou espaces dans la valeur du statut
La valeur brute n'est peut-être pas `"FILLED"` mais `" FILLED"`, `"Filled "`, `"filled\r"` ou une variante avec caractère invisible.
`isFilledStatus()` applique `.trim()` + `.toLowerCase()` + NFD — mais un `\r` résiduel passerait le `.trim()` si ce n'est qu'un retour chariot sans espace.

### H2 — Colonne Status non résolue par ALIASES_STATUS
La colonne pourrait avoir un nom non couvert : `"Etat"`, `"State"`, `"Statut de l'ordre"` (apostrophe), `"Order State"`, `"Fill Status"`.
`normalizeKey()` dans `binance_order.js` inclut `'` dans les séparateurs → `"l'ordre"` → `"l ordre"`.
Si le nom de colonne n'est pas dans `ALIASES_STATUS`, `get(ALIASES_STATUS)` retourne `''` → `rawStatus` vide → `return null` immédiat (avant même `isFilledStatus()`).

### H3 — Timestamp null sur les lignes FILLED
`normalizeOrderRow()` retourne `null` si `parseDate()` échoue, **après** le filtre `isFilledStatus()`.
Si la colonne date a un format non reconnu (ex : `"2024/01/15 10:30"` avec slash, ou timezone `UTC+8` non canonicalisée), toutes les lignes FILLED seraient rejetées avec un `console.warn` silencieux.
Ce chemin est logué : `[ORDER VALIDATION REJECT] timestamp null`.

### H4 — Champ qty ou prix null sur toutes les lignes FILLED
`normalizeOrderRow()` retourne `null` si `!symbol || !side || !price || !qty`.
Un format Binance atypique (colonnes `"Montant de la commande"` sans colonne qty explicite, ou `"Prix de l'ordre"` non couvert) produirait `price = 0` ou `qty = 0` → rejet.
Ce chemin est logué : `[ORDER VALIDATION REJECT] champ manquant`.

### H5 — Export hybride Binance avec lignes FILLED partiellement exécutées
Certains exports incluent des lignes FILLED avec `fillRate < 1` (partiellement exécutées).
Si `qty_executed = 0` (pas de colonne "Exécuté" et `ALIASES_QTY` non résolu), `qty = 0` → rejet même pour statut FILLED.

### H6 — Colonne Status présente mais avec nom ambigu partagé
Ex : une colonne nommée `"Type"` contenant à la fois `"BUY"/"SELL"` et `"FILLED"/"CANCELED"` selon les lignes.
`ALIASES_STATUS` ne contient pas `"type"` → non résolu.
Ou à l'inverse, `"type"` résout le side mais écrase la valeur statut.

### H7 — Format de date avec timezone non canonicalisée
`binance_order.js` canonicalise `date(utc±N)` → `date(utc)` via regex `/^date\(utc[+-]\d+\)$/`.
Un format `"Date (UTC+2)"` avec espace avant la parenthèse ne matcherait pas le regex → colonne date non résolue → timestamp null → rejet.

---

## Prochaine action terrain

**Priorité : retrouver ou reproduire le fichier source.**

1. **Retrouver le fichier réel** — chercher dans les téléchargements ou exports Binance récents.
2. **Le placer dans `excel_tests/02_broken/`.**
3. **Relancer l'import** dans le navigateur (DevTools ouvert, niveau Verbose activé pour voir les `console.warn`).
4. **Capturer dans la console :**
   - `[ORDER VALIDATION REJECT] timestamp null` → H3 confirmée
   - `[ORDER VALIDATION REJECT] champ manquant` → H4 confirmée
   - `[ORDER_HISTORY] Aucun ordre FILLED` → `statusCounts` dump → vérifier valeur brute exacte du statut
5. **Capturer les headers exacts** (copier la première ligne du fichier).
6. **Comparer avec un fichier `01_working/`** — identifier la différence de colonne ou de valeur.
7. **Mettre à jour cette fiche** avec les infos capturées.

---

## Résultat attendu
30 trades FILLED extraits, session comportementale créée, analyse disponible.

## Résultat obtenu
0 trades extraits. Message "aucun ordre exécuté (FILLED) trouvé" malgré 30 FILLED détectés dans `statusCounts`.

## Statut de correction
**non traité** — fichier source manquant, reproduction non garantie.

## Notes
- `IMPORT_001_FILLED_detecte_mais_non_reconnu.md` dans `project_memory/imports_excel_csv/` documente un bug similaire antérieur (résolu). Vérifier si régression ou nouveau cas.
- Les `console.warn` de rejet dans `binance_order.js` (NR-001 à NR-006 conservés intentionnellement) sont les premiers logs à lire lors de la reproduction.
- Ne pas modifier `isFilledStatus()` ni les ALIASES avant d'avoir les headers réels.
