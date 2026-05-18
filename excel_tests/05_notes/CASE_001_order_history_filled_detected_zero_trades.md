# CASE_001 — Order History : FILLED détectés, 0 trades extraits

## Statut
**corrigé** — 2026-05-18

## Fichier source
`11_4au11_5.xlsx` — Order History Binance Spot (avril–mai, période non précisée)
Placé dans `02_broken/` pendant le diagnostic, non commité.

## Type
Order History (Format B — colonnes Status/Order ID détectées)

## Symptôme observé
Message UI :

> "Order History importé mais aucun ordre exécuté (FILLED) trouvé. Statuts détectés : FILLED, NEW, CANCELED."

Bloc diagnostic :
- FILLED × 30
- NEW × 14
- CANCELED × 17

## Ce que le système détectait
- format : ORDER_HISTORY
- statuts dans `statusCounts` : FILLED, NEW, CANCELED
- trades extraits : **0**

## Cause réelle — identifiée par traces DIAG

La colonne "Exécuté" du fichier XLSX Binance FR porte un **exposant typographique `²`** (U+00B2, SUPERSCRIPT TWO) dans son nom, produit par Binance pour dédoublonner deux colonnes homonymes lors de l'export.

Chaîne de normalisation avant correction :

```
"Exécuté²"
  → toLowerCase()            → "exécuté²"
  → normalize('NFD')         → "exe\u0301cute\u0301²"
  → strip [\u0300-\u036f]    → "execute²"   ← U+00B2 passe, n'est pas un diacritique
  → replace separators       → "execute²"   ← ² non dans le set de remplacement
```

Résultat : clé `norm["execute²"]` non couverte par `ALIASES_QTY` → `get(ALIASES_QTY)` retourne `''` → `parseNum('') = 0` → `!qty` vrai → ligne FILLED rejetée.

Logs observés :
```
[ORDER VALIDATION REJECT] champ manquant: { symbol: "BTCUSDT", side: "BUY", price: 43210, qty: 0 }
Toutes les clés normalisées disponibles: ... execute² ...
```

## Correction appliquée

**Fichier :** `src/js/behavior/normalize/mappers/binance_order.js`

### 1. `normalizeKey()` — normalisation de l'exposant U+00B2

```javascript
.replace(/²/g, '2')   // exposant typographique U+00B2 → chiffre ASCII
```

Ajouté après le strip diacritiques, avant le replace séparateurs.
Résultat : `"Exécuté²"` → `normalizeKey` → `"execute2"`.

### 2. `ALIASES_QTY` — ajout de `'execute2'`

```javascript
'execute', 'execute2',
```

Couvre la clé produite après normalisation de l'exposant.
Résultat : `get(ALIASES_QTY)` résout correctement vers la valeur de la colonne.

## Validation terrain

- 30 ordres FILLED importés ✓
- 31 lignes ignorées (NEW + CANCELED) ✓
- Order History analysé, session sauvegardable ✓
- Aucun scoring modifié ✓
- Aucune UI modifiée ✓

## Hypothèses de la fiche initiale

| Hypothèse | Verdict |
|-----------|---------|
| H1 — casse/espaces dans statut | ✗ — statut résolu correctement |
| H2 — colonne Status non résolue | ✗ — ALIASES_STATUS OK |
| H3 — timestamp null | ✗ — timestamp résolu correctement |
| H4 — qty null (colonne non mappée) | ✓ — **cause confirmée**, variante `²` non couverte |
| H5 — fillRate < 1 | ✗ — non pertinent |
| H6 — colonne ambiguë | ✗ |
| H7 — timezone non canonicalisée | ✗ |

## Commit

`fix(import): handle Binance FR executed quantity superscript column`
