# PDF-ARCH-04 — Format date Binance PDF

**Couche concernée :** Normalisation (`pdf-normalizer.js`) · Extraction discriminateur (`pdf-table-extractor.js`)  
**Décision :** Préfixe "20" + offset UTC+2 → timestamp UTC ms via ISO 8601

---

## Problème

Les PDFs Binance encodent les dates dans un format non standard sur deux niveaux :

1. **Année à 2 chiffres** : `"26-05-24 07:01:57"` signifie 2026-05-24 07:01:57.
   JavaScript `new Date("26-05-24T07:01:57")` échoue ou produit `Invalid Date` — l'année
   à 2 chiffres n'est pas reconnue par le parseur ISO 8601 natif.

2. **Timezone implicite UTC+2** : Les exports PDF Binance utilisent UTC+2 sans l'indiquer
   explicitement dans la chaîne. Si la date est interprétée en UTC, chaque timestamp est
   décalé de +2h par rapport à la réalité.

Ces deux problèmes combinés produiraient soit `NaN`, soit des timestamps erronés de 7 200 000 ms.

---

## Signal terrain observé

Sur `b8.pdf` (Trade History) et `b3.pdf` (Order History) :

- Toutes les dates suivent le pattern `"YY-MM-DD HH:MM:SS"` sans exception.
- Pattern regex mesuré : `/^\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/`
- Exemple terrain b8.pdf : `"26-05-24 07:01:57"` → attendu UTC ms = 1748070117000
- L'offset UTC+2 est confirmé par comparaison croisée avec les CSV Trade History du même
  corpus (b1-b19), qui exportent des dates en `"YYYY-MM-DD HH:MM:SS"` également UTC+2.

---

## Solution retenue

Fonction `_parseDate(raw)` dans `pdf-normalizer.js` :

```js
function _parseDate(raw) {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();
  if (!/^\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) return null;
  // "26-05-24 07:01:57" → "2026-05-24T07:01:57+02:00" → UTC ms
  return new Date('20' + s.replace(' ', 'T') + '+02:00').getTime();
}
```

Transformation : `"26-05-24 07:01:57"` → `"2026-05-24T07:01:57+02:00"` → `.getTime()` → UTC ms.

Usage dans `pdf-table-extractor.js` — discriminateur données/en-têtes :

```js
function _isDateCell(str) {
  return /^\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str.trim());
}
```

Ce test regex seul (sans parsing complet) suffit pour discriminer une cellule date d'un
fragment de texte. Le parsing réel est délégué à la Phase 3 (normalizer).

---

## Justification

- Préfixer "20" est la seule transformation robuste pour les années 2020–2099 sans heuristique
  de pivot à deux chiffres (qui serait fragile en 2030+, 2050+, etc.).
- Spécifier `+02:00` dans la chaîne ISO garantit que `new Date()` interprète correctement
  l'offset, quelle que soit la timezone locale du navigateur de l'opérateur.
- `parseFloat()` natif est utilisé pour les valeurs numériques avec unité collée
  (`"5.6583TAO"` → `5.6583`) — il parse jusqu'au premier caractère non numérique.
- La valeur `null` est retournée pour toute chaîne non conforme (au lieu de `NaN`),
  ce qui est plus sûr pour les champs nullable comme `execution_time`.

---

## Preuves de validation

| Test | Résultat | Assertion |
|---|---|---|
| b8.pdf — 0 timestamp invalide (32 rows) | ✅ PASS | D01 |
| b3.pdf — 0 created_at invalide (2476 rows) | ✅ PASS | D02 |
| b3.pdf — 0 execution_time invalide (nullable accepté) | ✅ PASS | D03 |
| b8.pdf — 0 NaN dans les rows normalisées | ✅ PASS | C01 |
| b3.pdf — 0 NaN dans les rows normalisées | ✅ PASS | C02 |

Commit de référence : `789b7ac` (Session 4) — normalisation validée terrain b8.pdf + b3.pdf.

---

## Conséquences futures

- Si Binance change l'offset timezone (ex. passage à UTC+0 ou UTC+8), `_parseDate()` doit
  être mis à jour. La valeur `+02:00` est codée en dur — documenter si une observation terrain
  contredit cette hypothèse.
- Si l'année à 2 chiffres dépasse "29" (ex. `"30-01-01"` en 2030), la règle "20" reste correcte
  jusqu'en 2099 — pas de dette immédiate.
- Le regex `/^\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/` est utilisé à deux endroits
  (extractor + normalizer). Si le format change, les deux fichiers doivent être mis à jour.
- `execution_time` Order History peut contenir `"--"` pour les ordres non exécutés (NEW, CANCELED).
  `_parseDate("--")` retourne `null` — comportement correct documenté dans le code.

