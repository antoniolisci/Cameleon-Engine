# PDF-ARCH-05 — Status nullable Order History

**Couche concernée :** Normalisation (`pdf-normalizer.js`) · Extraction (`pdf-table-extractor.js`)  
**Décision :** Le champ `status` est nullable — aucune ligne rejetée pour absence de statut

---

## Problème

Le normalizer Order History s'attend à 12 colonnes par row (les 12 champs du tableau Binance).
Si une row n'a que 11 colonnes, `row[11]` est `undefined`. Sans traitement explicite,
ce cas produit soit une erreur, soit une string `"undefined"` dans le champ status,
soit un rejet silencieux de la ligne.

Un rejet de ligne pour cause de structure incomplète serait une perte de donnée non justifiée :
l'ordre existe, son statut est simplement absent de ce row particulier.

---

## Signal terrain observé

Sur `b3.pdf` (Order History, 2476 rows) :

- **1 row sur 2476** présente 11 colonnes au lieu de 12.
- La colonne manquante est systématiquement `status` (la dernière, colonne X = 750.5 pt).
- Les 11 premières colonnes de cette row sont complètes et valides (date, order_id, symbol, etc.).
- Cause probable : pour certains ordres dans un état intermédiaire, Binance omet la cellule
  status dans le rendu PDF (la cellule existe dans la source mais est vide à l'export).
- La signature X filtre les items non vides (`i.str.trim().length > 0`) — une cellule status
  vide ne produit aucun item, donc la row arrive avec 11 éléments après filtrage.

---

## Solution retenue

Dans `normalizeOrderHistoryRows()` (`pdf-normalizer.js`) :

```js
status: row[11] ? row[11].trim() : null,  // PDF-ARCH-05
```

Dans `extractPdfTableRows()` (`pdf-table-extractor.js`) :

Le seuil d'admission est ≥ 6 matches signature X (PDF-ARCH-02), pas ≥ 12.
Une row à 11 colonnes passe le filtrage et arrive au normalizer avec 11 éléments.

---

## Justification

- Un ordre sans statut explicite dans le PDF n'est pas un ordre invalide — c'est une anomalie
  de rendu. Rejeter la ligne serait plus dommageable que l'accepter avec `status = null`.
- `null` est un signal clair et testable pour le downstream : `row.status !== 'FILLED'` reste
  correct (null !== 'FILLED' → l'ordre est ignoré pour les trades exportés, ce qui est sûr).
- Alternative rejetée : assigner un status par défaut (`'UNKNOWN'`) — ajouterait de la sémantique
  non observée terrain, ce qui est contraire à la doctrine d'intégration progressive.
- La règle `status nullable` est documentée dans le code avec une référence explicite à PDF-ARCH-05.

---

## Preuves de validation

| Test | Résultat | Assertion |
|---|---|---|
| b3.pdf — au moins 1 row avec status null | ✅ PASS | E01 |
| b3.pdf — toutes rows extraites normalisées (11 ou 12 col acceptées) | ✅ PASS | E02 |
| b3.pdf — 2476 rows normalisées = 2476 rows extraites | ✅ PASS | E02 / B02 |

Commit de référence : `789b7ac` (Session 4) — nullable validé, aucune rejection.

---

## Conséquences futures

- Si le nombre de rows 11-colonnes augmente significativement dans un nouveau corpus,
  investiguer si c'est un changement de format Binance ou une anomalie d'export spécifique.
- Le filtre FILLED dans `importBinancePDF()` (`uploader.js`) est robuste : `row.status !== 'FILLED'`
  rejette les rows avec `status = null` sans erreur — les données ne sont pas perdues dans le pipeline,
  elles sont comptées dans `skipped`.
- Si une future famille PDF a un champ nullable différent, appliquer la même pattern :
  `row[N] ? row[N].trim() : null` avec référence à la décision architecturale correspondante.

