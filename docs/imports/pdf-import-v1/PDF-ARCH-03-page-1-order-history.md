# PDF-ARCH-03 — Page 1 Order History

**Couche concernée :** Extraction (`pdf-table-extractor.js`)  
**Décision :** Ignorer la page 1 des PDFs Order History lors de l'extraction de tableau

---

## Problème

La page 1 de tout export Order History Binance PDF contient un bloc de texte libre intitulé
`"Commentaires"`. Ce bloc est positionné à des coordonnées spécifiques (x > 440, y < 460)
et contient du texte multi-lignes expliquant le format de l'export.

Ce bloc pollue le clustering Y de deux façons :

1. **Faux clusters de données** : les items du bloc Commentaires se regroupent en clusters Y
   valides (chaque ligne de texte forme une ligne visuelle), mais leurs cellules ne correspondent
   pas à des données de trades.

2. **Collision avec la signature X** : certains mots du bloc Commentaires peuvent par accident
   correspondre à des positions X proches de la signature Order History, passant le filtre PDF-ARCH-02
   avec un score borderline.

3. **En-têtes parasites** : la page 1 contient aussi l'en-tête de colonne complet, qui serait
   détecté comme ligne de données si la première cellule ressemble à une date.

---

## Signal terrain observé

Sur `b3.pdf` (192 pages) :

- La page 1 contient le bloc Commentaires visible à l'œil nu dans le PDF.
- Sans exclusion de la page 1, le clustering produisait des clusters avec des fragments de texte
  explicatif (ex. `"Les ordres sont présentés dans l'ordre chronologique inverse"`) qui
  passaient partiellement le filtre signature X.
- La page 2 commence directement avec l'en-tête de colonne suivi des données — structure propre.
- Signal de détection complémentaire : `"commentaires"` est dans `STRONG_ORDER` comme signal fort.
  Sa présence unique en page 1 le rend à la fois utile pour la détection famille ET signal
  de la nécessité d'ignorer cette page.

---

## Solution retenue

Variable `startPage` dans `extractPdfTableRows()` :

```js
const startPage = family === 'ORDER_HISTORY' ? 2 : 1;

for (const item of items) {
  if (item.page < startPage) continue;
  // ...
}
```

Simple, directe, sans heuristique fragile. La page 1 est entièrement ignorée pour Order History.

---

## Justification

- La structure de l'export Order History Binance est déterministe : page 1 = header + Commentaires,
  pages 2+ = données pures. Cette règle est valable pour tout export Order History Spot.
- Trade History n'a pas de bloc Commentaires en page 1 — le même traitement ne s'applique pas.
- Alternative rejetée : filtrage par coordonnées (x > 440, y < 460) — fragile si Binance modifie
  la mise en page. La règle `startPage = 2` est plus lisible et plus robuste.

---

## Preuves de validation

| Test | Résultat | Assertion |
|---|---|---|
| b3.pdf — première page traitée = 2 | ✅ PASS | H01 |
| b3.pdf — dernière page traitée = 192 | ✅ PASS | H02 |
| b3.pdf — 191 pages traitées (192 - page 1) | ✅ PASS | H03 |
| b8.pdf — première page traitée = 1 (Trade History traite page 1) | ✅ PASS | H04 |

Commit de référence : `2221d5a` (Session 3) — extraction validée, page 1 ignorée confirmée.

---

## Conséquences futures

- Si une future famille Order History présente les données dès la page 1 (hypothèse unlikely),
  la règle `startPage = 2` devra être conditionnée par une sous-famille ou un flag terrain.
- Si le bloc Commentaires disparaît dans une version future de l'export, la règle reste
  inoffensive : ignorer une page sans données ne produit aucun résultat incorrect.
- Pour toute nouvelle famille PDF, auditer le contenu de la page 1 avant de décider `startPage`.
- Le signal `'commentaires'` dans `STRONG_ORDER` est lié à cette décision : si Binance supprime
  le bloc Commentaires, ce signal disparaît et le score ORDER sera légèrement réduit. Documenter
  si cela provoque une détection incorrecte.

