# PDF Import V1 — Changelog des sessions

Historique complet des 6 sessions d'implémentation (2026-06-04).  
Chaque session est atomique : aucun code de la session N+1 n'est introduit dans la session N.

---

## Session 1 — Infrastructure · commit `3ad2177`

**Date :** 2026-06-04  
**Périmètre :** Zéro logique métier — infrastructure de base uniquement.

**Livraisons :**
- `src/js/vendor/pdf.min.mjs` (345 Ko) + `pdf.worker.min.mjs` (1,4 Mo) — pdfjs-dist v4.10.38 vendorisé en local
- 4 stubs créés : `pdf-loader.js` · `pdf-family-detector.js` · `pdf-table-extractor.js` · `pdf-normalizer.js` — `export {}` uniquement
- CSP `worker-src 'self' blob:` ajoutée à `index.html`
- `serve-local.ps1` corrigé : MIME type `.mjs` → `application/javascript`

**Validation :** `pdfjsLib version: 4.10.38` confirmé en console navigateur · aucune erreur CSP ni worker.

---

## Session 2 — Détection famille · commit `fa82980`

**Date :** 2026-06-04  
**Périmètre :** Chargement PDF + détection de la famille.

**Livraisons :**
- `pdf-loader.js` : `loadPdfTextItems()` — singleton PDF.js, extraction items positionnels `{str, x, y, width, height, page}`, qualité `NATIVE | DEGRADED | SCANNED | UNREADABLE`
- `pdf-family-detector.js` : `detectPdfFamily()` — signaux forts uniquement (poids 3), normalisation U+2019 + ° + NFD, comptage FILLED/CANCELED

**Décision clé — PDF-ARCH-01 :** U+2019 (apostrophe typographique Binance) normalisé → espace avant matching. Sans ce correctif, `ORDER_HISTORY` n'était pas détecté sur b3.pdf.

**Validation terrain :**
- `b8.pdf` → `NATIVE` + `TRADE_HISTORY` ✅
- `b3.pdf` → `NATIVE` + `ORDER_HISTORY` ✅

---

## Session 3 — Extraction · commit `2221d5a`

**Date :** 2026-06-04  
**Périmètre :** Reconstruction des lignes de tableau à partir des items positionnels.

**Livraisons :**
- `pdf-table-extractor.js` : `extractPdfTableRows(pdfResult, family)` — clustering Y=2pt, filtrage bruit, détection en-têtes, extraction cellules brutes
- Trade History : toutes pages · détection en-têtes par ≥ 4 termes colonne · discriminateur date première cellule · 7 colonnes
- Order History : pages 2+ (PDF-ARCH-03) · filtrage bruit par signature X ±3pt (PDF-ARCH-02) · 12 colonnes · 191 en-têtes ignorés sur b3.pdf

**Décision clé — PDF-ARCH-02 :** Signature X à 12 positions. Seuil ≥ 6 matches pour admission d'un cluster. Variance X mesurée = 0.0 pt sur b3.pdf.

**Décision clé — PDF-ARCH-03 :** `startPage = 2` pour Order History. Bloc Commentaires page 1 éliminé.

**Validation terrain :**
- `b8.pdf` → 32 rows · 7 colonnes ✅
- `b3.pdf` → 2476 rows · 12 colonnes · page 1 ignorée ✅

---

## Session 4 — Normalisation · commit `789b7ac`

**Date :** 2026-06-04  
**Périmètre :** Parsing des cellules texte vers des types métier.

**Livraisons :**
- `pdf-normalizer.js` : `normalizeTradeHistoryRows()` · `normalizeOrderHistoryRows()` · `normalizePdfRows()` (API publique)
- Parsing date PDF-ARCH-04 : préfixe "20" + offset UTC+2 → timestamp UTC ms via ISO 8601 +02:00
- Parsing valeurs numériques avec unité collée : `"5.6583TAO"` → `parseFloat()` → `5.6583`
- Status nullable PDF-ARCH-05 : 1 row sur 2476 sans colonne status → `null`, aucune rejection

**Décision clé — PDF-ARCH-04 :** `"26-05-24 07:01:57"` → `"2026-05-24T07:01:57+02:00"` → UTC ms. Aucun NaN sur 32 + 2476 timestamps.

**Décision clé — PDF-ARCH-05 :** `status = row[11] ? row[11].trim() : null`. Tolérance 11 ou 12 colonnes.

**Validation terrain :**
- `b8.pdf` → 0 NaN · tous timestamps valides ✅
- `b3.pdf` → 0 NaN · FILLED / NEW / CANCELED · `execution_time null` pour ordres non exécutés ✅

---

## Session 5 — Tests automatisés · commit `19e9e10`

**Date :** 2026-06-04  
**Périmètre :** Suite de tests automatisés — zéro code métier, zéro modification fonctionnelle.

**Livraisons :**
- `src/tests/pdf-import-v1.test.html` : 22 assertions · 8 suites (A–H) · framework autonome (pas de dépendance externe)

**Suites de tests :**

| Suite | Sujet | Assertions |
|---|---|---|
| A | Famille & Qualité | A01–A04 |
| B | Nombre de rows (32 / 2476) | B01–B02 |
| C | Intégrité numérique (0 NaN) | C01–C02 |
| D | Timestamps (PDF-ARCH-04) | D01–D03 |
| E | PDF-ARCH-05 status null | E01–E02 |
| F | Clustering Y | F01–F03 |
| G | Mapping X (PDF-ARCH-02) | G01–G02 |
| H | PDF-ARCH-03 page 1 | H01–H04 |

**Résultat :** 22/22 PASS · Robustesse 8.5/10  
**Corpus figé :** `b8.pdf = 32 rows` · `b3.pdf = 2476 rows`

---

## Session 6 — Intégration uploader · commit `3d4e923`

**Date :** 2026-06-04  
**Périmètre :** Connexion du pipeline PDF au flux d'import réel — D-PDF-01 soldée.

**Fichier modifié :** `src/js/behavior/import/uploader.js` uniquement · 1 fichier · 108 lignes ajoutées.

**Livraisons :**
- 4 imports statiques PDF en tête de `uploader.js`
- `if (ext === 'pdf') return importBinancePDF(file)` — early return avant garde taille 5MB
- `_adaptTradeHistoryPdf(normalized, sessionId)` — spread + `quote_value` alias + `session_id` + `tags`
- `_adaptFilledOrderPdf(row, sessionId)` — renommage complet vers format canonique + `fee = 0` + `fillRate`
- `importBinancePDF(file)` — orchestration complète : garde qualité, garde famille, pipeline, retour canonique
- Filtre FILLED uniquement pour Order History (parité avec `binance_order.js` CSV/XLSX)

**Décisions clés :**
- Early return avant 5MB : PDF.js lit un `ArrayBuffer` asynchrone — le garde taille synchrone ne s'applique pas.
- `fee = 0` : absent du format PDF Order History Binance — valeur numérique propre, non NaN.
- `quote_value = quote_quantity` : alias nécessaire pour les modules downstream qui attendent `quote_value`.
- `fillRate = executed_qty / order_amount` plafonné à 1 : parité comportementale avec `binance_order.js`.

**Validation :**
- 22/22 tests automatisés PASS (aucune régression)
- `b8.pdf` Trade History : `ok: true` · `type: 'trades'` · 32 trades · format canonique ✅
- `b3.pdf` Order History : `ok: true` · `type: 'order_history'` · FILLED filtrés · `fee: 0` · `fillRate` calculé ✅

**Dettes soldées :** D-PDF-01  
**Dettes restantes :** D-PDF-02 · D-PDF-03 · D-PDF-04

