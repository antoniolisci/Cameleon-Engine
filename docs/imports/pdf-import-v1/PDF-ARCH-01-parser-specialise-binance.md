# PDF-ARCH-01 — Parser spécialisé Binance

**Couche concernée :** Détection famille (`pdf-family-detector.js`) · Extraction (`pdf-table-extractor.js`)  
**Décision :** Normalisation spécialisée des caractères avant tout matching textuel

---

## Problème

Les exports PDF Binance contiennent plusieurs variantes d'encodage qui rendent les comparaisons
de chaînes naïves non fiables :

1. **U+2019 (apostrophe typographique)** — Binance utilise `'` (RIGHT SINGLE QUOTATION MARK) là où
   un texte standard attendrait `'` (ASCII 0x27). Exemple : `"Historique d'ordre Spot"` contient U+2019.

2. **U+00B0 (signe degré)** — Le symbole `°` apparaît dans `"N° commande"`. Une comparaison
   directe échoue si le signal attendu ne contient pas ce caractère.

3. **Diacritiques NFD** — Les accents peuvent être encodés en forme décomposée NFD ou composée NFC
   selon le générateur PDF. `"Côté"` peut arriver comme `Co\u0302te\u0301` ou `Côté`.

4. **Casse variable** — Titres de section et noms de colonnes mélangent majuscules et minuscules
   selon la page et la version de l'export.

Sans normalisation, les signaux de détection ratent des familles valides et produisent `UNKNOWN`.

---

## Signal terrain observé

Sur `b3.pdf` (Order History, corpus B1-B19) :

- Le titre de section contient `"Historique d'ordre Spot"` avec U+2019.
- La colonne `"N° commande"` contient U+00B0.
- Sans correction U+2019, le signal `'historique d ordre spot'` ne trouve pas de match dans le texte brut.
- Sans correction U+00B0, le signal `'n commande'` ne trouve pas de match.

Ces deux signaux sont parmi les plus discriminants pour ORDER_HISTORY. Leur absence silencieuse
produisait une détection incorrecte ou `UNKNOWN` avant la correction.

---

## Solution retenue

Fonction `_norm(str)` dans `pdf-family-detector.js` et `_normCell(str)` dans `pdf-table-extractor.js` :

```js
function _norm(str) {
  return str
    .toLowerCase()
    .replace(/\u2019/g, ' ')          // apostrophe typographique → espace
    .replace(/°/g, '')                // signe degré → supprimé
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // diacritiques → supprimés
    .replace(/\s+/g, ' ')
    .trim();
}
```

Application : `rawText` entier normalisé avant matching des signaux forts.

Les signaux dans `STRONG_ORDER` sont écrits dans leur forme normalisée attendue :
- `'historique d ordre spot'` (U+2019 → espace, accents supprimés)
- `'n commande'` (° supprimé, accent supprimé)
- `'numero de commande'` (accent supprimé)

---

## Justification

- La normalisation est sans perte de sens : aucun signal discriminant ne repose sur U+2019 ou U+00B0.
- Appliquer la même transformation au texte source et aux signaux garantit que la comparaison est symétrique.
- NFD + suppression diacritiques est la forme la plus robuste pour le français typographique.
- Préférer normaliser que multiplier des variantes dans `STRONG_ORDER` — évite la maintenance de doublons.

---

## Preuves de validation

| Test | Résultat | Assertion |
|---|---|---|
| `b8.pdf` → `TRADE_HISTORY` | ✅ PASS | A01 |
| `b3.pdf` → `ORDER_HISTORY` | ✅ PASS | A02 |
| `b8.pdf` quality → `NATIVE` | ✅ PASS | A03 |
| `b3.pdf` quality → `NATIVE` | ✅ PASS | A04 |

Commit de référence : `2221d5a` (Session 2) — détection validée terrain b8.pdf + b3.pdf.

---

## Conséquences futures

- Toute nouvelle famille PDF Binance doit passer par la même normalisation `_norm()` avant matching.
- Si Binance change ses encodages (ex. passage U+2018, guillemets, etc.), `_norm()` est le seul
  point de correction — ne pas dupliquer la logique ailleurs.
- Les signaux forts dans `STRONG_TRADE` et `STRONG_ORDER` doivent toujours être écrits
  dans la forme post-normalisation (lowercase, sans accents, sans U+2019/°).
- Les colonnes partagées entre familles (Paire, Côté, Exécuté) restent volontairement exclues
  des signaux — elles ne discriminent pas et augmenteraient le taux de faux positifs.

