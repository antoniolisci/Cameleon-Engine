# PDF-ARCH-02 — Signature X Order History

**Couche concernée :** Extraction (`pdf-table-extractor.js`)  
**Décision :** Filtrage des lignes de tableau par correspondance de coordonnées X fixes

---

## Problème

Order History Binance PDF contient, sur chaque page, du texte libre qui n'appartient pas
au tableau de données :

- Numéros de page (`"Page 1 / 192"`)
- Titres de section répétés
- Métadonnées d'export (dates de plage, nom de compte)
- Bloc Commentaires (page 1 uniquement — voir PDF-ARCH-03)

Après clustering Y, ces éléments forment des clusters valides (ils ont une coordonnée Y cohérente)
mais leurs colonnes X ne correspondent pas à la grille du tableau. Un filtrage par contenu
(par exemple, chercher une date en première cellule) ne suffit pas : ces lignes parasites peuvent
ne contenir aucun mot-clé identifiable.

---

## Signal terrain observé

Sur `b3.pdf` (Order History, 192 pages) :

- Chaque page contient du texte hors-tableau à des positions X variables.
- Les colonnes de données ont des coordonnées X stables page après page : la grille PDF est fixe.
- Mesure sur corpus : variance des positions X par colonne = 0.0 pt sur b3.pdf.

Les 12 colonnes Order History ont les coordonnées X suivantes (validées sur b3.pdf) :

| Colonne | X (pt) |
|---|---|
| created_at (Durée) | 38.8 |
| order_id (N° commande) | 117.9 |
| symbol (Paire) | 208.3 |
| order_type (Type) | 264.8 |
| side (Côté) | 321.3 |
| order_price (Prix ordre) | 377.7 |
| order_amount (Montant) | 434.2 |
| execution_time (Exécuté le) | 490.7 |
| executed_qty (Exécuté) | 569.8 |
| average_price (Prix moyen) | 626.3 |
| trading_total (Trading total) | 682.8 |
| status (Statut) | 750.5 |

---

## Solution retenue

Constante `ORDER_X_SIGNATURE` dans `pdf-table-extractor.js` :

```js
const ORDER_X_SIGNATURE = [
  38.8, 117.9, 208.3, 264.8, 321.3, 377.7,
  434.2, 490.7, 569.8, 626.3, 682.8, 750.5,
];
const X_TOLERANCE = 3; // pt
```

Règle d'admission d'un cluster :

```
sigCount = items dont X est dans ORDER_X_SIGNATURE ± 3pt
si sigCount < 6 → cluster rejeté (bruit)
```

Seuil 6 : conservateur — un cluster de données valide a toujours ≥ 6 colonnes renseignées
(même les ordres partiels CANCELED ont date, id, symbol, side, price, amount).

---

## Justification

- Les coordonnées X PDF sont déterministes : elles dépendent du layout du template PDF Binance,
  pas du contenu. Elles sont stables à travers toutes les pages et tous les exports du même format.
- La tolérance ±3pt absorbe les variations de rendu PDF.js sans laisser passer de faux positifs.
- Le seuil ≥ 6 est plus robuste qu'une comparaison de contenu : il fonctionne même si les
  valeurs des cellules sont numériques, vides, ou dans une langue inconnue.
- Alternative rejetée : clustering par contenu (chercher une date) — échoue sur les en-têtes
  partiels (lignes avec 6–8 mots-clés de colonne mais sans date).

---

## Preuves de validation

| Test | Résultat | Assertion |
|---|---|---|
| Toutes rows b3.pdf entre 11 et 12 cellules | ✅ PASS | G01 |
| Distribution 11/12 cohérente (somme = total rows) | ✅ PASS | G02 |
| 0 row hors [11, 12] | ✅ PASS | G01 |
| 2476 rows normalisées = 2476 rows extraites | ✅ PASS | E02 |

Commit de référence : `2221d5a` (Session 3) — extraction Order History validée b3.pdf.

---

## Conséquences futures

- Si Binance modifie la mise en page de Order History (nouveau template, nouvelles colonnes),
  `ORDER_X_SIGNATURE` doit être recalibrée sur le nouveau corpus terrain.
- Toute nouvelle famille PDF Binance avec tableau structuré doit avoir sa propre signature X
  calibrée avant implémentation.
- La tolérance X_TOLERANCE = 3pt est empirique sur b3.pdf. Ne pas l'augmenter sans vérifier
  que cela ne laisse pas passer de faux positifs sur le corpus étendu.
- Le seuil ≥ 6 peut être abaissé si une famille future a des lignes systématiquement courtes,
  mais doit rester documenté avec justification terrain.

