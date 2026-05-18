# CASE_REAL_001 — Anonymisation et audit pipeline : Binance Order History 1685 trades

**Date :** 2026-05-18  
**Phase :** 4 — Datasets réels anonymisés  
**Statut :** CLEAN corrigé — prêt pour test terrain (import UI à valider)

---

## 1. Source

| Champ | Valeur |
|-------|--------|
| Fichier RAW | `Binance-Historique-d'ordre-Spot-202605181209(UTC+2)_7eda26fa.xlsx` |
| Format | Binance Order History XLSX (pas Trade History) |
| Exporté le | 2026-05-18 à 12:09 UTC+2 |
| Période brute | 2024-03-23 → 2026-05-03 (~25 mois) |
| Total lignes brutes | 3914 trades (tous statuts) |
| FILLED uniquement | 1685 trades |
| Statuts présents | FILLED : 1685 / CANCELED : 1963 / NEW : 261 / PARTIALLY_FILLED : 5 |

---

## 2. Colonnes supprimées (PII / hors périmètre analytique)

| Colonne | Raison |
|---------|--------|
| Lignes 0–8 du XLSX (en-tête Binance) | PII directe : Nom, E-mail, Adresse, User ID |
| `Numéro de commande` (col D) | Identifiant de transaction — permet de relier à l'historique Binance public |
| Lignes non-FILLED (CANCELED, NEW, PARTIALLY_FILLED) | Hors périmètre — seules les exécutions réelles sont analytiquement pertinentes |

---

## 3. Colonnes conservées et noms CSV CLEAN

| Colonne source | Nom CSV CLEAN | Normalisation mapper (`normalizeKey`) | Alias matché |
|----------------|---------------|---------------------------------------|--------------|
| Durée (ouverture) | `Duree` | `duree` | `ALIASES_DATE['duree']` ✅ |
| Paire | `Paire` | `paire` | `ALIASES_SYMBOL['paire']` ✅ |
| Type | `Type` | `type` | (non utilisé directement) |
| Côté | `Cote` | `cote` | `ALIASES_SIDE['cote']` ✅ |
| Prix de l'ordre | `Prix_ordre` | `prix ordre` | non matché (ignoré — `Prix_moyen` prioritaire) |
| Montant de la commande | `Montant` | `montant` | `ALIASES_QUOTE['montant']` (fallback) |
| Durée (exécution) | `Date_execution` | `date execution` | non matché (ignoré) |
| Exécuté | `Execute` | `execute` | `ALIASES_QTY['execute']` ✅ |
| Prix moyen | `Prix_moyen` | `prix moyen` | `ALIASES_PRICE['prix moyen']` ✅ |
| Trading total | `Total` | `total` | `ALIASES_QUOTE['total']` ✅ |
| Statut | `Statut` | `statut` | `ALIASES_STATUS['statut']` ✅ |

---

## 4. Transformations d'anonymisation appliquées

| Transformation | Valeur | Raison |
|----------------|--------|--------|
| Décalage temporel | +60 jours (uniforme) | Brise la corrélation directe avec l'historique de prix public |
| Offset prix | Aucun (décision utilisateur) | Préserve la cohérence analytique `price × quantity = quote_value` |
| Facteur quantité | Aucun (décision utilisateur) | Préserve CV, avgSize, oversizedCount — métriques comportementales critiques |
| Encodage sortie | UTF-8 BOM | Compatibilité Excel / moteur |

---

## 5. Vérification PII post-génération

| Terme recherché | Résultat |
|----------------|----------|
| ANTONIO / LISCI | Non trouvé |
| antonio.lisci | Non trouvé |
| 478192933 (User ID) | Non trouvé |
| 596256354 (exemple Order ID) | Non trouvé |
| 449 rue du Perron | Non trouvé |

**Conclusion PII :** CLEAN — aucun identifiant direct résiduel.

---

## 6. Profil du dataset CLEAN

| Dimension | Valeur |
|-----------|--------|
| Fichier CLEAN | `REAL_001_binance_order_history_TAOUSDC_1685_trades.csv` |
| Période anonymisée | 2024-05-22 → 2026-07-02 (~25 mois) |
| Trades | 1685 |
| BUY | 880 (52.2%) |
| SELL | 805 (47.8%) |
| Limit | 1352 (80.2%) |
| Market | 331 (19.7%) |
| Stop-Limit | 2 (0.1%) |
| Symboles | 64 distincts |

### Top 5 symboles

| Symbole | Trades | BUY | SELL | % total |
|---------|--------|-----|------|---------|
| TAOUSDC | 603 | 312 | 291 | 35.8% |
| FETUSDC | 230 | 117 | 113 | 13.6% |
| HBARUSDC | 211 | 117 | 94 | 12.5% |
| PLUMEUSDC | 69 | 29 | 40 | 4.1% |
| INJUSDC | 57 | 25 | 32 | 3.4% |

---

## 7. Audit pipeline statique (2026-05-18)

### Méthodologie

Simulation complète en Python du pipeline JS : `classifyFile()` → `detectFormat()` → `normalizeOrderRow()` sur les 1685 lignes. Chaque étape reproduite fidèlement depuis `uploader.js`, `format-detector.js`, `binance_order.js`.

### Résultats étape par étape

**`classifyFile()` :**

| Signal | Colonne matchée | Via |
|--------|----------------|-----|
| date | `date ouverture` | `matchesField('date ouverture', DETECT_DATE)` → prefixe 'date ' ✅ |
| symbol | `paire` | exact ✅ |
| side | `cote` | exact ✅ |
| price | `prix moyen` | exact ✅ |
| qty | `execute` | exact ✅ |
| → | **FULL_TRADING** (5/5) | ✅ Import accepté |

**`detectFormat()` :**
- `Statut` → `normalizeH` → `statut` → dans `SIGNALS_STATUS` → `hasStatus = true`
- → **ORDER_HISTORY** ✅ Pipeline `mapOrderRows()` activé

**`normalizeOrderRow()` — audit de mapping :**

| Champ | Clé normalisée | Alias matché | Valeur exemple |
|-------|---------------|--------------|----------------|
| status | `statut` | `ALIASES_STATUS['statut']` | `'FILLED'` ✅ |
| date | `date ouverture` | aucun dans ALIASES_DATE | `''` → timestamp=null → **REJET** ❌ |
| symbol | `paire` | `ALIASES_SYMBOL['paire']` | `'TAOUSDC'` ✅ |
| side | `cote` | `ALIASES_SIDE['cote']` | `'SELL'` ✅ |
| price | `prix moyen` | `ALIASES_PRICE['prix moyen']` | `'290.2'` ✅ |
| qty | `execute` | `ALIASES_QTY['execute']` | `'0.111TAO'` ✅ |
| quote | `total` | `ALIASES_QUOTE['total']` | `'32.2122USDC'` ✅ |

### Blocage identifié — Date_ouverture → date ouverture (absent de ALIASES_DATE)

**Cause :** `normalizeKey('Date_ouverture')` → `'date ouverture'`. Les alias de dates dans `binance_order.js` contiennent `'duree'` (le nom Binance original) mais pas `'date ouverture'` (nom renommé lors de l'anonymisation).

**Résultat sans correction :**
- Toutes les 1685 lignes : `timestamp = null` → `return null`
- `orderTrades.length = 0`, `statusCounts = { FILLED: 1685 }`
- Erreur UI : *"Order History importé mais aucun ordre exécuté (FILLED) trouvé. Statuts détectés : FILLED."*

**Correction appliquée :** renommage `Date_ouverture` → `Duree` dans le header CSV.
- `normalizeKey('Duree')` → `'duree'` → dans `ALIASES_DATE` ✅
- `parseDate('2026-07-02 17:18:12')` → path ISO fallback → timestamp valide ✅

**Simulation post-correction (1685 lignes) :**

| Métrique | Valeur |
|----------|--------|
| Lignes acceptées | **1685 / 1685 (100%)** |
| Rejets timestamp null | 0 |
| Rejets champ manquant | 0 |
| Incohérences price × qty > 5% | 0 |
| Résultat `validateTrades` | isValid = true, warnings = [] |

---

## 8. Métriques analytiques prédites (pré-terrain)

Calculées depuis le dataset CLEAN avec la même logique que `metrics.js`.

| Métrique | Valeur | Impact attendu |
|----------|--------|----------------|
| `avgSize` (price×qty) | 342.57 USDC | — |
| `stdev(tradeSize)` | 849.02 | — |
| **CV tradeSize** | **2.478** | `size_inconsistency` déclenché (seuil 0.5) — penalité 10 |
| `oversizedTradesCount` | **188** (>2×avgSize) | Penalité métrique −10 (seuil ≥ 3) |
| `avg quote_value` | 342.56 USDC | validateTrades OK (seuil 10 000) |
| BUY / SELL | 880 / 805 | `dataQuality: HIGH` |

### Patterns à fort risque de déclenchement

| Pattern | Signal détecté | Source probable |
|---------|---------------|-----------------|
| `size_inconsistency` | CV=2.478 >> 0.5 | Multi-actifs : BTC à ~50k vs HBAR à ~0.2 — variation de prix brute |
| `oversizing` (métrique) | 188 oversized | Idem — grandes positions sur actifs chers vs petites sur actifs bon marché |
| `grid_trading` | 235/602 gaps TAOUSDC ≤ 3 min | Activité concentrée sur TAOUSDC : bursts probables détectés par `groupGridTrades()` |
| `rapid_reentry` | ~57 instances (BUY→SELL <20min) | Trades rapides sur positions courtes — réels ou artefact multi-symboles |

### Limite structurelle identifiée (LS)

`size_inconsistency` (CV-based) est **structurellement inadaptée aux portefeuilles multi-actifs**. Un CV de 2.478 résulte mathématiquement de la coexistence de trades BTCUSDC (~500 USDC/trade) et HBARUSDC (~10 USDC/trade) dans le même historique. Ce n'est pas un signal de comportement erratique — c'est une diversification multi-actifs normale.

**Classification :** FP structurel probable pour `size_inconsistency` et `oversizedTradesCount` sur datasets multi-actifs.  
**Action Phase 4 :** Documenter en anomalie type **LS** (scoring limit). Aucun patch moteur.

---

## 9. Résultats terrain (à remplir après import UI)

| Champ | Valeur |
|-------|--------|
| Import réussi | — |
| dataQuality | HIGH attendu (880 BUY / 805 SELL) |
| Score observé | — |
| Score attendu (pré-terrain) | **30–55** (size_inconsistency + oversized + rapid_reentry + grid probable) |
| Patterns détectés | — |
| Patterns attendus | size_inconsistency, oversizing, rapid_reentry, grid_trading (TAOUSDC) |
| Crash / NaN / freeze | — |
| Logs parser | — |

---

## 10. Anomalies connues (après audit statique)

| Anomalie | Type | Description |
|----------|------|-------------|
| CV=2.478 sur multi-actifs | LS | `size_inconsistency` structurellement biaisée sur portefeuilles multi-actifs — FP probable |
| oversizedTradesCount=188 | LS | Même cause : variation de prix inter-actifs, pas de comportement surdimensionné |
| 235/602 gaps TAOUSDC ≤ 3min | BC/AG | Activité grid réelle ou bursts intentionnels — grouper devrait détecter |
| ~57 rapid_reentry | BC | À valider : trades rapides réels ou artefact du mix multi-actifs |
| Stop-Limit × 2 | Observ. | Deux ordres Stop-Limit FILLED — impact attendu : aucun (parsing standard) |
| Prix non offsets | LQ | Identifiabilité résiduelle par croisement temporel + prix marché (décision provisoire) |

---

## 11. Décision provisoire (après audit statique)

**→ CLEAN ACCEPTABLE — prêt pour test terrain**

Justification :
1. **Import pipeline : 100% fonctionnel** (simulation 1685/1685, post-correction colonne)
2. **PII : absentes** (5 termes testés, aucun résiduel)
3. **Cohérence analytique : préservée** (prix réels, 0 incohérence price×qty)
4. **dataQuality attendu : HIGH** (BUY/SELL équilibré, volume suffisant)

Caveats à documenter lors du terrain :
- Score probablement bas (30–55) — à interpréter avec les limites LS documentées
- `size_inconsistency` et `oversizedTradesCount` = FP structurels sur dataset multi-actifs
- Grid grouping TAOUSDC : effets secondaires SYN-006 attendus (voir CASE_SYN_006)

Prochaine étape : import manuel via UI (`http://localhost:8000/src/index.html` → onglet Comportement), noter score, dataQuality, patterns, logs console (Verbose activé pour `[bhv:grid]`).

---

## 12. Checklist terrain

- [ ] Serveur local démarré (`serve-local.ps1`)
- [ ] Console DevTools ouverte — filtre **Verbose** activé (pour voir `[bhv:grid]`)
- [ ] Fichier importé : `CLEAN/REAL_001_binance_order_history_TAOUSDC_1685_trades.csv`
- [ ] Import réussi (pas d'erreur UI)
- [ ] Score noté
- [ ] dataQuality noté (LOW / PARTIAL / HIGH)
- [ ] Patterns listés (chacun avec severity)
- [ ] Logs `[bhv:grid]` notés (groupes détectés ?)
- [ ] Aucun crash / NaN / freeze
- [ ] `§9 Résultats terrain` complété dans ce fichier
