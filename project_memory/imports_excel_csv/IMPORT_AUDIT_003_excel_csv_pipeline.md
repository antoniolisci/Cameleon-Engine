# IMPORT_AUDIT_003 — Audit pipeline import CSV / Excel

**Date :** 2026-05-17  
**Périmètre :** Pipeline d'import comportemental — `src/js/behavior/import/` + `src/js/behavior/normalize/` + `src/js/behavior/analytics/` (surface import uniquement)  
**Statut :** Audit documentaire uniquement — aucune modification appliquée

---

## 1. Cartographie des fichiers audités

| Fichier | Rôle | Lignes |
|---------|------|--------|
| `import/uploader.js` | Orchestrateur principal — lecture, classification, routage | ~383 |
| `import/format-detector.js` | Détection Format A (Trade History) vs Format B (Order History) | ~80 |
| `import/parser.js` | Parser CSV — BOM, séparateur, découpe quote-aware | ~100 |
| `normalize/canonical.js` | Définition du format canonique + re-export binance_spot | 15 |
| `normalize/validator.js` | Validation unitaire d'un trade canonique (`isValidTrade`) | 13 |
| `normalize/trade-validator.js` | Validation métier post-mapping (`validateTrades`) | 48 |
| `normalize/mappers/binance_spot.js` | Mapping Format A → canonique | ~244 |
| `normalize/mappers/binance_order.js` | Mapping Format B → canonique (FILLED uniquement) | ~259 |
| `wallet/wallet_analyzer.js` | Pipeline wallet (mouvements de compte) — branche NON_TRADING | ~100+ |
| `analytics/order-analyzer.js` | Analyse comportementale spécialisée Format B | ~197 |
| `analytics/metrics.js` | Métriques quantitatives à partir des trades canoniques | ~184 |
| `analytics/patterns.js` | Détection de patterns comportementaux (5 types) | ~200+ |

---

## 2. Pipeline complet — flux de données

```
Fichier utilisateur (CSV / XLSX / ZIP)
  │
  ├─ [Guard ZIP]  → retour erreur friendly si .zip
  │
  ├─ [readFileAsText / readFileAsXLSX]
  │     XLSX : SheetJS vendor local → sheet_to_json({ header:1 }) → raw2d
  │     CSV  : FileReader UTF-8 → BOM strip → splitLine par ligne
  │
  ├─ [findHeaderRowIndex]
  │     Scan 30 premières lignes → isHeaderRow (≥3 groupes sur 7)
  │     Résultat : headerIdx → startLine pour CSV / index pour XLSX
  │
  ├─ [classifyFile(headers)]
  │     Scores : tradingSignals (0–5) / walletSignals (0–3) / earnSignals (0–2)
  │     ├─ NON_TRADING/earn     → message d'erreur dédié
  │     ├─ NON_TRADING/wallet   → analyzeWallet()
  │     ├─ NON_TRADING/unknown  → erreur + colPreview + diagnostic checkmark
  │     ├─ FULL_TRADING (≥4)    → pipeline trading
  │     └─ PARTIAL_TRADING (2–3)→ pipeline trading (analysisQuality: 'partial')
  │
  ├─ [detectFormat(headers)]   → ORDER_HISTORY | TRADE_HISTORY | UNKNOWN
  │
  ├─ Route A — TRADE_HISTORY (Format A)
  │     mapBinanceSpotRow() × n lignes
  │       normalizeTrade() → normalizeKey → ALIASES_* → parseDate / parseNum
  │     isValidTrade() filtre les trades invalides
  │     validateTrades() → warnings métier (taille, BUY/SELL, cohérence price×qty)
  │     → { ok, type:'trades', trades, skipped, sessionId, analysisQuality,
  │          validationWarning, validationWarnings }
  │
  └─ Route B — ORDER_HISTORY (Format B)
        mapOrderRows() × n lignes
          normalizeOrderRow() → normalizeKey → ALIASES_* → isFilledStatus
          Filtre : FILLED uniquement (status obligatoire)
        analyzeOrders() → { metrics, profile, summary, confidence, symbols }
        → { ok, type:'order_history', trades, skipped, sessionId,
             analysisQuality, orderAnalysis }
```

---

## 3. Audit par composant

### 3.1 — `parser.js` — Parsing CSV

**Points forts :**
- Suppression BOM `\ufeff` en entrée → robustesse UTF-8 BOM (Excel Windows)
- `detectSeparator()` : vote majoritaire sur virgule / point-virgule / tabulation
- `splitLine()` : découpe quote-aware, support des valeurs encadrées entre guillemets
- Mode lenient : colonnes surnuméraires ignorées, colonnes manquantes → `''` — pas de rejet
- `startLine` : offset configurable pour sauter les lignes de titre avant l'en-tête réel

**Points à noter :**
- `detectSeparator()` agit sur la première ligne non-vide → si le titre occupe toute la ligne avec des espaces, le séparateur peut être mal détecté. Mitigation : `uploader.js` recalcule le séparateur depuis la vraie ligne d'en-têtes après `findHeaderRowIndex`.
- Aucune limite de taille de fichier — un CSV très volumineux est lu entièrement en mémoire (pas de stream). Acceptable local-first.

---

### 3.2 — `uploader.js` — Header detection

**`normalizeHeader(str)`**
- Minuscules + NFD + suppression diacritiques + normalisation séparateurs (`[\s_./\\()+\-]+`)
- Couvre : `"Côté"→"cote"`, `"Date(UTC+2)"→"date utc 2"`, `"Avg. Price"→"avg price"`
- Note : les parenthèses sont incluses dans les séparateurs → `"date(utc+2)"` devient `"date utc 2"`, mais `"date(utc)"` est géré explicitement via canonicalisation UTC±N dans les mappers.

**`matchesField(col, signals)`**
- 4 règles ordonnées : exact → préfixe → suffixe → token intérieur
- Protection anti-collision : signaux < 4 caractères = exact uniquement
- Bien conçu — évite les faux positifs sur les noms de colonnes courts

**`findHeaderRowIndex(rows2d)`**
- Scan 30 lignes maximum — cohérent entre chemin CSV et chemin XLSX
- `HDR_GROUPS` : 7 groupes sémantiques — ≥3 matches → ligne reconnue
- Permet d'absorber les exports Binance avec lignes de titre ou métadonnées initiales

---

### 3.3 — `uploader.js` — Classification fichier

**`classifyFile(headers)`**

Ordre de priorité :
1. `earnSignals >= 1 && tradingSignals < 3` → NON_TRADING/earn
2. `walletSignals >= 2 && tradingSignals < 3` → NON_TRADING/wallet
3. `tradingSignals >= 4` → FULL_TRADING
4. `tradingSignals >= 2` → PARTIAL_TRADING
5. défaut → NON_TRADING/unknown

**Points forts :**
- `PARTIAL_TRADING` (2–3 signaux) est accepté → résistance aux exports partiels ou non-standard
- Earn détecté via `_EMPTY_` headers (SheetJS sur cellules fusionnées) + termes APY/APR/interest
- Wallet détecté via Operation + Coin/Asset + Change — très spécifique aux exports Binance Account History

**Points à noter :**
- `'type'` est inclus dans `DETECT_SIDE` pour la classification (colonne BUY/SELL valide un export trading), mais intentionnellement absent de `ALIASES_SIDE` dans les mappers (car "LIMIT"/"MARKET" ne sont pas des côtés). Ce découplage est documenté dans les commentaires — conception correcte.
- Si un fichier earn a `tradingSignals >= 3`, il passera en trading. Cas edge improbable mais non protégé.

---

### 3.4 — `format-detector.js` — Détection format A vs B

**Points forts :**
- Signaux distincts par format : fee → TRADE_HISTORY ; status/statut + orderId → ORDER_HISTORY
- Précédence : ORDER_HISTORY si hasStatus **ou** hasOrderId (union, pas intersection)
- Signaux EN + FR pour les deux formats

**Point à noter :**
- `console.debug` aux lignes 66–67 (classé NR-012 dans DEBUG_SURFACE_AUDIT_001) — conservé intentionnellement lors du dernier audit, mais invisible par défaut dans DevTools.

---

### 3.5 — `binance_spot.js` — Mapper Format A

**Points forts :**
- `normalizeKey()` accent-safe (NFD) — gère Binance FR/EN/accents
- Canonicalisation UTC±N : `"date(utc+2)"` → `"date(utc)"` avant lookup
- `ALIASES_*` : tables exhaustives FR/EN pour les 6 champs (date, symbol, side, price, qty, quote, fee)
- Fallback `type`/`trade type` → BUY/SELL uniquement si préfixe BUY/SELL (protection LIMIT/MARKET)
- Variantes FR : ACHAT/VENTE, BUY_LIMIT, SELL_MARKET
- `parseNum()` : formats FR (virgule décimale) + EN + espaces milliers + suffixes asset
- `parseDate()` : Unix 10/13 digits + année 2 chiffres + ISO 8601
- Fallback Amount/Total : vérifie que `total/amount ≈ price` (±10%) avant d'utiliser Amount comme qty — évite une inversion qty/valeur

**Points à noter :**
- `quote_quantity` et `quote_value` sont deux noms pour la même donnée (compat aliases). `mapBinanceSpotRow()` ajoute `quote_quantity: trade.quote_value` explicitement.
- `metrics.js` utilise `price × quantity` (pas `quote_quantity`) pour `tradeSize()` — choix documenté (comment dans le fichier : évite les exports où quote_quantity contient la quantité base).

---

### 3.6 — `binance_order.js` — Mapper Format B

**Points forts :**
- `isFilledStatus()` : normalise via NFD + lowercase avant comparaison → couvre "Complété", "Exécuté", "Terminé" sans dépendre de la casse ou des accents
- `normalizeOrderRow()` : même pattern que binance_spot.js (normalizeKey → canonicalise UTC±N → ALIASES_*)
- `ALIASES_*` augmentées pour le contexte Order History : prix de l'ordre, montant de la commande, quantite initiale, trading total
- `fillRate` calculé : `qty_executed / order_qty` (avec `Math.min(..., 1)` pour les exécutions partielles)
- `mapOrderRows()` : collecte `statusCounts` pour diagnostic si 0 FILLED — retourné à l'appelant
- `FILLED_STATUSES` Set (ligne 75) : **déclaré mais non utilisé** — `isFilledStatus()` est la fonction active

**Points à noter :**
- `FILLED_STATUSES` Set est du code mort. Ne crée pas de risque mais peut induire en erreur lors d'une maintenance future.
- `parseNum()` et `parseDate()` sont copiées depuis `binance_spot.js` — implémentation identique, dupliquée pour préserver l'isolation des modules.

---

### 3.7 — `validator.js` + `trade-validator.js`

**`isValidTrade(trade)` (validator.js) :**
- Validation unitaire minimale : timestamp > 0, symbol string non-vide, side BUY|SELL, price > 0, quantity > 0
- Appliquée row-par-row dans le pipeline Format A (pas Format B — `mapOrderRows` rejette en amont via `normalizeOrderRow`)

**`validateTrades(trades)` (trade-validator.js) :**
- Validation métier sur l'ensemble du dataset
- 3 checks : taille moyenne > 10 000$ / déséquilibre BUY-SELL / cohérence price×qty vs quote_quantity (±5%)
- Retourne `{ isValid, warnings }` — n'est **pas** un bloquant (le résultat est transmis comme `validationWarning` dans la réponse, mais l'import passe quand même)

---

### 3.8 — `order-analyzer.js`

**Métriques Format B :**
- `fillRate` moyen (taux d'exécution)
- `gridSpacing` : écart relatif moyen entre prix consécutifs (par symbol+side) + coefficient de variation
- `directionalRatio` : fraction dans le sens majoritaire
- `avgHoldMin` : durée moyenne BUY→SELL appariés (par symbole)
- `cancelProfile` : inféré depuis `rawCount` (total lignes brutes) si disponible

**Profils déduits :** `grid` / `dca` / `opportuniste` / `mixte`

**`gridConfidence`** : métrique de confiance calculée uniquement pour `profile === 'grid'` :
- `0.7 × regularity + 0.3 × coverage` → 0–1

**Point à noter :**
- `rawCount` transmis depuis `uploader.js` : `rows.length` (total lignes brutes y compris non-FILLED) → `cancelProfile` est une estimation approximative.

---

### 3.9 — `canonical.js`

Fichier de 15 lignes — définit le format canonique via un commentaire JSDoc, puis re-exporte uniquement `mapBinanceSpotRow` depuis `binance_spot.js`.

**Point à noter :**
- Le fichier sert de documentation du format canonique mais n'est pas utilisé comme point d'entrée unique dans le pipeline (`uploader.js` importe directement depuis `binance_spot.js` et `binance_order.js`). Cohérence structurelle légèrement incomplète, sans impact fonctionnel.

---

## 4. Duplications identifiées

| Élément dupliqué | Localisation | Nature |
|-----------------|--------------|--------|
| `normalizeKey()` | `uploader.js` + `binance_spot.js` + `binance_order.js` | Même fonction, regex légèrement différentes (uploader inclut `()+`) |
| `parseNum()` | `binance_spot.js` + `binance_order.js` | Implémentations identiques |
| `parseDate()` | `binance_spot.js` + `binance_order.js` | Implémentations identiques |

**Évaluation :** Ces duplications sont intentionnelles pour préserver l'isolation des modules (principe "pas de dépendances transverses" dans le sous-module behavior). Elles constituent un risque de désynchronisation lors d'évolutions futures (ex : nouveau format de date), mais ne sont pas un problème aujourd'hui.

**Différence dans `normalizeKey` :** `uploader.js` inclut `()+` dans les séparateurs normalisés → `"date(utc+2)"` devient `"date utc 2"`. Les mappers n'incluent pas `()` → conservent `"date(utc)"` comme tel, ce qui permet la canonicalisation UTC±N. **Comportement cohérent par conception.**

---

## 5. Code mort identifié

| Élément | Fichier | Ligne approx. | Impact |
|---------|---------|---------------|--------|
| `FILLED_STATUSES` Set | `binance_order.js` | 75 | Nul — `isFilledStatus()` est la fonction active |

---

## 6. Traces de debug restantes dans le pipeline

| ID | Fichier | Nature | Statut |
|----|---------|--------|--------|
| NR-012 | `format-detector.js:66-67` | `console.debug('[bhv:format]', ...)` | NEED REVIEW conservé intentionnellement |
| KEEP | `binance_spot.js:91` | `console.warn('[bhv:map] ❌ timestamp null')` | KEEP — validation reject log |
| KEEP | `binance_spot.js:147` | `console.warn('[bhv:map] ❌ champ manquant')` | KEEP — validation reject log |
| KEEP | `binance_order.js:110` | `console.warn('[ORDER VALIDATION REJECT] timestamp null')` | KEEP |
| KEEP | `binance_order.js:153` | `console.warn('[ORDER VALIDATION REJECT] champ manquant')` | KEEP |
| KEEP | `binance_order.js:209` | `console.warn('[ORDER_HISTORY] Aucun ordre FILLED')` | KEEP — diagnostic critique |
| KEEP | `uploader.js:282` | `console.warn('[bhv:import] analyzeWallet() a levé une exception')` | KEEP — guard d'erreur |
| KEEP | `uploader.js:305` | `console.warn('[bhv:import] fichier refusé — colonnes non reconnues')` | KEEP — diagnostic utile |
| KEEP | `patterns.js:13-14` | `const DEBUG = false` + wrapper conditionnel | KEEP — flag désactivé |

---

## 7. Formats supportés

| Format | Extension | Détection | Pipeline |
|--------|-----------|-----------|---------|
| Binance Spot Trade History (EN/FR) | .csv, .xlsx | FULL_TRADING + TRADE_HISTORY | `mapBinanceSpotRow` |
| Binance Order History (EN/FR) | .csv, .xlsx | FULL_TRADING + ORDER_HISTORY | `mapOrderRows` + `analyzeOrders` |
| Binance Account History (wallet) | .csv | NON_TRADING/wallet | `analyzeWallet` |
| Exports Épargne / Earn / Staking | .csv, .xlsx | NON_TRADING/earn | Rejeté avec message dédié |
| Export non reconnu | .csv, .xlsx | NON_TRADING/unknown | Rejeté avec diagnostic colonnes |
| Archive compressée | .zip | Guard extension | Rejeté avec instruction décompression |

**Non supportés (aucun mapper) :** Bybit, OKX, Kraken, Coinbase, tout autre exchange.

---

## 8. Robustesse UX — Messages d'erreur

| Scénario | Message retourné | Niveau de détail |
|----------|-----------------|-----------------|
| Fichier ZIP | "Format ZIP non supporté. Décompressez..." | Clair + actionnable |
| Aucun en-tête trouvé (30 lignes) | "Aucune ligne d'en-têtes Binance trouvée..." | Clair |
| Fichier vide | "Le fichier est vide ou son format n'a pas pu être lu." | Minimal |
| NON_TRADING/earn | "Ce fichier correspond à un historique d'épargne (Earn / Staking)." | Clair |
| NON_TRADING/unknown | Colonnes brutes + diagnostic checkmark date/symbol/side/price/qty | Excellent debug |
| 0 trades FULL_TRADING | Texte selon analysisQuality + colonnes normalisées | Bon |
| Order History 0 FILLED | Statuts détectés listés (ex: CANCELED × 15) | Très bon |
| Fichier wallet KO | "Fichier wallet détecté mais non exploitable." | Acceptable |

---

## 9. Limites et risques résiduels

### RISK-001 — Désynchronisation des fonctions dupliquées
**Niveau :** Faible — maintenance uniquement  
**Détail :** `parseNum`, `parseDate`, `normalizeKey` dupliquées dans 2–3 fichiers. Un bug fixé dans l'une peut ne pas être reporté dans les autres.  
**Recommandation :** Centraliser dans un utilitaire partagé `behavior/utils/parse.js` lors d'une refactorisation.

### RISK-002 — Pas de déduplication inter-sessions
**Niveau :** Faible  
**Détail :** Importer le même fichier deux fois crée deux sessions avec les mêmes trades. Pas de contrôle de doublon sur le contenu.  
**Recommandation :** Aucune action urgente — comportement attendu dans le contexte local-first.

### RISK-003 — `FILLED_STATUSES` Set mort dans `binance_order.js`
**Niveau :** Cosmétique  
**Détail :** Set déclaré ligne 75 mais jamais utilisé. `isFilledStatus()` est la fonction active.  
**Recommandation :** Supprimer lors d'une prochaine passe de nettoyage.

### RISK-004 — Aucun support multi-exchange
**Niveau :** Connu / hors scope  
**Détail :** Pipeline ciblé Binance. Un utilisateur Bybit/OKX recevra NON_TRADING/unknown.  
**Recommandation :** Documenter explicitement dans l'UX si le produit évolue vers un support multi-exchange.

### RISK-005 — `validateTrades()` non-bloquant
**Niveau :** Connu / délibéré  
**Détail :** Les warnings (taille > 10k$, déséquilibre BUY/SELL, incohérence price×qty) ne bloquent pas l'import. Transmis comme `validationWarning` dans la réponse.  
**Recommandation :** Comportement correct — l'utilisateur est informé sans être bloqué.

---

## 10. Résumé synthétique

| Dimension | Évaluation |
|-----------|-----------|
| Robustesse parsing | ✅ Excellente — BOM, séparateurs, lignes de titre, lenient mode |
| Coverage FR/EN | ✅ Très bonne — ALIASES exhaustifs, NFD normalization, accents |
| Gestion des erreurs | ✅ Bonne — messages clairs, diagnostics colonnes, guard ZIP |
| Architecture | ✅ Saine — pipeline linéaire, isolation respectée, pas de global state |
| Tests unitaires | ❌ Absents — aucun test automatisé sur les parsers/mappers |
| Multi-exchange | ❌ Non supporté — Binance uniquement (scope actuel) |
| Code mort | ⚠️ 1 élément mineur (`FILLED_STATUSES` Set) |
| Duplications | ⚠️ 3 fonctions utilitaires dupliquées — risque maintenance |
| Sécurité import | ✅ Aucun innerHTML non-échappé — données CSV ne transitent pas vers le DOM sans escHtml() |

**Verdict global :** Pipeline bien construit pour le périmètre actuel (local-first, Binance uniquement). Les limites identifiées (duplications, absence de tests, mono-exchange) sont toutes connues ou hors-scope V1. Aucun correctif urgent requis.

---

## Références

- `project_memory/imports_excel_csv/IMPORT_001_FILLED_detecte_mais_non_reconnu.md` — bug historique isFilledStatus (résolu)
- `project_memory/imports_excel_csv/IMPORT_002_sheetjs_vendorisation.md` — vendorisation SheetJS CDN → local
- `project_memory/known_limitations/SECURITY_AUDIT_002_innerHTML_2026-05-17.md` — audit innerHTML (escHtml validé)
- `project_memory/known_limitations/DEBUG_SURFACE_AUDIT_001.md` — traces debug (NR-012 conservé)
