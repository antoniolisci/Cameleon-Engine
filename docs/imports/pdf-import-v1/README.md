# PDF Import V1 — Documentation canonique

## Objectif

Permettre à l'opérateur d'importer ses exports PDF Binance (Trade History et Order History Spot)
via le même point d'entrée que les CSV et XLSX — `importBinanceSpot(file)` dans `uploader.js`.

Le pipeline lit les coordonnées positionnelles brutes du PDF, reconstruit les lignes de tableau,
normalise les champs vers le format canonique interne, puis livre des objets trades directement
exploitables par le moteur comportemental.

---

## Périmètre V1

**Inclus :**
- Trade History Spot PDF (Binance)
- Order History Spot PDF (Binance)

**Exclus volontairement :**
- Tout autre format PDF (fiscal, Earn, Wallet, Futures, Margin, etc.)
- Ces familles seront intégrées sur signal terrain uniquement, selon la doctrine d'intégration progressive.

---

## Familles supportées

| Famille | Colonnes | Fichier terrain |
|---|---|---|
| `TRADE_HISTORY` | Durée · Paire · Côté · Prix · Exécuté · Montant · Frais | b8.pdf (32 rows) |
| `ORDER_HISTORY` | Durée · N° commande · Paire · Type · Côté · Prix ordre · Montant · Exécuté · Prix moyen · Trading total · Statut | b3.pdf (2476 rows) |

---

## Pipeline complet

```
File (PDF)
  → loadPdfTextItems()        [pdf-loader.js]       — ArrayBuffer → items positionnels {str,x,y,page}
  → detectPdfFamily()         [pdf-family-detector.js] — signaux forts → TRADE_HISTORY | ORDER_HISTORY | UNKNOWN
  → extractPdfTableRows()     [pdf-table-extractor.js] — clustering Y=2pt · filtrage en-têtes · signature X
  → normalizePdfRows()        [pdf-normalizer.js]    — parsing dates/nombres → objets domaine
  → _adaptTradeHistoryPdf()
    _adaptFilledOrderPdf()    [uploader.js]          — renommage vers format canonique · filtre FILLED
  → importBinancePDF()        [uploader.js]          — orchestration · gardes qualité/famille
  → importBinanceSpot()       [uploader.js]          — point d'entrée unique — branche ext === 'pdf'
```

---

## Corpus de référence

| Fichier | Famille | Pages | Rows extraites | Commit validation |
|---|---|---|---|---|
| `b8.pdf` | TRADE_HISTORY | 2 | 32 | `19e9e10` (Session 5) |
| `b3.pdf` | ORDER_HISTORY | 192 | 2476 (dont ~1 status null) | `19e9e10` (Session 5) |

Localisation : `assets/excel_tests/b1-b19/`

Ces fichiers constituent le corpus de référence figé. Les tests automatisés y font référence
par count absolu (32 et 2476). Ne pas remplacer ces fichiers sans recalibrer les assertions.

---

## Architecture des couches

### Couche 1 — Chargement (`pdf-loader.js`)

Responsabilité unique : convertir un `File | Blob | URL` en tableau d'items positionnels bruts.

- PDF.js chargé en singleton lazy (import dynamique `pdf.min.mjs`)
- Worker configuré via `pdf.worker.min.mjs` (vendor local, CSP `worker-src 'self' blob:`)
- Sortie : `{ pages, items[], rawText, quality }`
- Items : `{ str, x, y, width, height, page }` — coordonnées brutes PDF.js (origine bas-gauche)
- Contrat strict : aucune reconstruction de lignes, aucune interprétation de colonnes
- Qualité détectée : `NATIVE | DEGRADED | SCANNED | UNREADABLE`

### Couche 2 — Détection famille (`pdf-family-detector.js`)

Responsabilité unique : identifier la famille à partir du texte brut concaténé.

- Signaux forts uniquement (poids 3) — colonnes partagées exclues
- Normalisation spécialisée : U+2019 → espace · U+00B0 → supprimé · NFD diacritiques
- Comptage statuts d'ordre (FILLED/CANCELED ≥ 3 → score ORDER)
- Sortie : `'TRADE_HISTORY' | 'ORDER_HISTORY' | 'UNKNOWN'`
- Décision : `orderScore > tradeScore` → ORDER · `tradeScore > 0` → TRADE · sinon UNKNOWN

### Couche 3 — Extraction (`pdf-table-extractor.js`)

Responsabilité unique : reconstruire les lignes de tableau à partir des items positionnels.

- Clustering Y=2pt : regroupe les items par proximité verticale (lignes visuelles)
- Trade History : discriminateur date (première cellule = format `YY-MM-DD HH:MM:SS`)
- Order History : signature X ±3pt (12 positions attendues) · seuil ≥ 6 matches
- PDF-ARCH-02 : filtrage bruit par signature X
- PDF-ARCH-03 : page 1 Order History ignorée (`startPage = 2`)
- Sortie : `{ family, rows[], skippedHeaderRows[], pagesProcessed[], diagnostics }`

### Couche 4 — Normalisation (`pdf-normalizer.js`)

Responsabilité unique : parser les cellules texte brutes vers des types métier.

- PDF-ARCH-04 : dates `"YY-MM-DD HH:MM:SS"` → préfixe "20" → ISO +02:00 → timestamp UTC ms
- Valeurs numériques avec unité collée : `"5.6583TAO"` → `parseFloat()` natif → `5.6583`
- PDF-ARCH-05 : `status` nullable si row 11 colonnes au lieu de 12
- Sortie Trade : `{ timestamp, symbol, side, price, quantity, quote_quantity, fee }`
- Sortie Order : `{ created_at, order_id, symbol, order_type, side, order_price, order_amount, execution_time, executed_qty, average_price, trading_total, status }`

### Couche 5 — Intégration (`uploader.js`)

Responsabilité unique : adapter les objets domaine vers le format canonique interne.

- `_adaptTradeHistoryPdf()` : spread + `quote_value` (alias `quote_quantity`) + `session_id` + `tags`
- `_adaptFilledOrderPdf()` : renommage complet + `fee = 0` + `fillRate` + `session_id` + `tags`
- `importBinancePDF()` : orchestration complète avec gardes qualité et famille
- Branche `ext === 'pdf'` insérée avant le garde taille 5MB (PDF.js = ArrayBuffer asynchrone)
- Filtre FILLED uniquement pour Order History (parité avec `binance_order.js` CSV/XLSX)

---

## Décisions architecturales

| Référence | Sujet | Fichier |
|---|---|---|
| PDF-ARCH-01 | Parser spécialisé Binance — encodage et normalisation | [PDF-ARCH-01-parser-specialise-binance.md](PDF-ARCH-01-parser-specialise-binance.md) |
| PDF-ARCH-02 | Signature X Order History — filtrage bruit par position | [PDF-ARCH-02-signature-x-order-history.md](PDF-ARCH-02-signature-x-order-history.md) |
| PDF-ARCH-03 | Page 1 Order History — exclusion bloc Commentaires | [PDF-ARCH-03-page-1-order-history.md](PDF-ARCH-03-page-1-order-history.md) |
| PDF-ARCH-04 | Format date Binance PDF — parsing et offset UTC+2 | [PDF-ARCH-04-dates-binance-pdf.md](PDF-ARCH-04-dates-binance-pdf.md) |
| PDF-ARCH-05 | Status nullable Order History — tolérance 11 colonnes | [PDF-ARCH-05-status-nullable.md](PDF-ARCH-05-status-nullable.md) |

---

## Réflexions stratégiques PDF

Documents de doctrine produit et architecture long terme — aucun code.

| Document | Sujet |
|---|---|
| [D-PDF-04](D-PDF-04-role-architectural-pdf.md) | Rôle architectural du PDF — nature, comparaison CSV/XLSX/PDF, options stratégiques, recommandation Option C |
| [D-PDF-05](D-PDF-05-positionnement-strategique-pdf.md) | Positionnement stratégique — porte d'entrée, calibration, hiérarchie des sources, "invitation pas destination" |
| [D-PDF-06](D-PDF-06-maintenance-long-terme-pdf.md) | Maintenance long terme — vieillissement, 5 types de rupture, doctrine d'expansion, gouvernance en 5 critères |

---

## Dettes restantes

| Dette | Sujet | Statut |
|---|---|---|
| D-PDF-01 | Intégration uploader | ✅ Soldée — Session 6 · commit `3d4e923` |
| D-PDF-02 | Pipeline comportemental (connexion behavior engine) | ✅ Soldée — Session 7 · commit `073e868` |
| D-PDF-03 | UI import PDF (loading indicator, dead code, labels PDF) | ✅ Soldée — commit `6a166c6` |
| D-PDF-04 | Corpus étendu (b5, b10, b12, b19) | ✅ Soldée — Session 9 · 4/4 PASS · b5(466) b10(1130) b12(466) b19(2476) · 0 rejet · 0 NaN |

