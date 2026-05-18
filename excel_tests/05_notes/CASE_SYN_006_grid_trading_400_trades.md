# CASE_SYN_006 — Dataset grid trading (400 trades)

**Date création :** 2026-05-18  
**Type :** Synthétique — 100% généré, aucune donnée réelle  
**Statut :** ✅ En attente de validation terrain  
**Fichier :** `excel_tests/04_anonymized_samples/SYN_006_grid_trading_400_trades.csv`  
**Phase :** ANALYTIC_STRESS_TEST_PLAN_001 — Phase 3 (patterns edge cases)

---

## Objectif analytique

Valider le comportement de `groupGridTrades()` (grid-grouper.js) sur un dataset conçu pour déclencher systématiquement le regroupement :

1. Le grouper identifie et consolide correctement les 20 clusters en trades synthétiques
2. Après grouping : 320 trades effectifs (20 groupes + 300 normaux) — aucun faux overtrading
3. `dataQuality` reste HIGH (400 trades bruts, 13 jours, BUY+SELL équilibrés)
4. Score cohérent et non-NaN — aucun pattern comportemental négatif attendu sur trades normaux
5. Le `console.debug` `[bhv:grid]` confirme l'activation du grouper

---

## Spécifications du dataset

| Paramètre | Valeur |
|-----------|--------|
| Lignes totales | 401 (1 header + 400 trades) |
| Symbole | TAOUSDT |
| Répartition BUY/SELL | 200 BUY / 200 SELL (50/50 exact) |
| Durée couverte | 2025-08-01 00:02 → 2025-08-14 08:20 (~13.3 jours) |
| Prix | 285–310 USDT (sinusoïde + bruit, seed=66) |
| CV executed | 0.218 — sous seuil 0.5 (size_inconsistency inactif) |
| Taille fichier | ~27 KB |

---

## Structure du dataset

### 20 clusters grid

| Cluster | Heure départ | Side | Trades | Gap | Fenêtre |
|---------|-------------|------|--------|-----|---------|
| 1 | 2025-08-01 01:00 | BUY  | 5 | 2 min | 8 min |
| 2 | 2025-08-01 17:48 | SELL | 5 | 2 min | 8 min |
| 3 | 2025-08-02 10:36 | BUY  | 5 | 2 min | 8 min |
| 4 | 2025-08-03 03:24 | SELL | 5 | 2 min | 8 min |
| 5 | 2025-08-03 20:12 | BUY  | 5 | 2 min | 8 min |
| 6 | 2025-08-04 13:00 | SELL | 5 | 2 min | 8 min |
| 7 | 2025-08-05 05:48 | BUY  | 5 | 2 min | 8 min |
| 8 | 2025-08-05 22:36 | SELL | 5 | 2 min | 8 min |
| 9 | 2025-08-06 15:24 | BUY  | 5 | 2 min | 8 min |
| 10 | 2025-08-07 08:12 | SELL | 5 | 2 min | 8 min |
| 11 | 2025-08-08 01:00 | BUY  | 5 | 2 min | 8 min |
| 12 | 2025-08-08 17:48 | SELL | 5 | 2 min | 8 min |
| 13 | 2025-08-09 10:36 | BUY  | 5 | 2 min | 8 min |
| 14 | 2025-08-10 03:24 | SELL | 5 | 2 min | 8 min |
| 15 | 2025-08-10 20:12 | BUY  | 5 | 2 min | 8 min |
| 16 | 2025-08-11 13:00 | SELL | 5 | 2 min | 8 min |
| 17 | 2025-08-12 05:48 | BUY  | 5 | 2 min | 8 min |
| 18 | 2025-08-12 22:36 | SELL | 5 | 2 min | 8 min |
| 19 | 2025-08-13 15:24 | BUY  | 5 | 2 min | 8 min |
| 20 | 2025-08-14 08:12 | SELL | 5 | 2 min | 8 min |

Clusters espacés de ~1008 min (16h48) — alternant BUY/SELL.

**Total cluster trades : 100** (20 × 5)  
**Total normal trades : 300** (150 BUY + 150 SELL, espacement moyen ~64 min)

### Prix dans les clusters

- Variation en escalier ±0.3% par rapport au prix de base du cluster (seed 66)
- BUY : prix décroissants (ordres limites sur support, achats de plus en plus bas)
- SELL : prix croissants (ordres limites sur résistance, ventes de plus en plus haut)
- Authentifie la structure d'une grille à ordres limites adjacents

---

## Calibration du trigger groupGridTrades()

Seuils de `grid-grouper.js` :

| Seuil | Valeur | Dataset |
|-------|--------|---------|
| `GRID_GROUP_GAP_MIN` | 3 min | gap=2 min ✓ |
| `GRID_GROUP_MAX_WINDOW_MIN` | 30 min | window=8 min ✓ |
| `GRID_GROUP_MIN_MEMBERS` | 3 | taille=5 ✓ |
| `GRID_GROUP_MAX_TRADES` | 10 | taille=5 ✓ |

**Simulation Python préalable (groupGridTrades logic) :**
- Groupes détectés : **20**
- Trades absorbés : **100**
- Trades effectifs après grouping : **320** (20 synthétiques + 300 normaux)

---

## Données personnelles

| Vérification | Résultat |
|-------------|---------|
| User_ID | ✅ Absent |
| Transaction réelle | ✅ Absent — données 100% synthétiques |
| Données financières réelles | ✅ Absent — prix générés (seed=66) |

---

## Analyse préalable

### groupGridTrades() — comportement attendu

Chaque cluster de 5 trades (gap 2 min, window 8 min, même symbole, même side) satisfait tous les critères de groupement. Le grouper les consolide en 1 trade synthétique `_isGridGroup = true` avec :
- `timestamp` = premier trade du cluster
- `_lastTimestamp` = dernier trade du cluster
- `price` = VWAP (prix moyen pondéré par quantité)
- `quantity` = somme des quantités
- `_groupSize` = 5

Log console attendu : `[bhv:grid] 400 trades → 320 (groupes: 20, absorbés: 100)`

### Overtrading — comportement attendu

`detectOvertrading()` s'applique sur les **trades groupés** (320 effectifs), pas sur les 400 bruts.

Après grouping :
- Les 20 clusters grid deviennent 20 trades synthétiques espacés de ~1008 min (16.8h)
- Les 300 trades normaux sont espacés de ~64 min en moyenne
- Aucune fenêtre de 60 min ne contient 5 trades → **overtrading absent**

### Score attendu

Aucun pattern comportemental négatif sur les trades normaux. Les clusters grid sont condensés → no overtrading, no rapid_reentry, no revenge_trading.

Score attendu : **95–100 / 100** — comportement discipliné.

**Note :** Le `gridContextBanner` ("Profil grille récent détecté — Order History") **ne s'affichera pas**. Ce bandeau nécessite un `orderStrategyProfile = 'grid'` stocké dans `behaviorRepo` via un import Order History préalable — non chargé dans ce test.

---

## Résultats attendus

| Critère | Valeur attendue | Justification |
|---------|----------------|---------------|
| Import | `ok: true`, 400 trades | Format Trade History valide |
| `groupGridTrades()` | 20 groupes, 100 absorbés, 320 effectifs | Simulation Python confirmée |
| `[bhv:grid]` console | "400 trades → 320 (groupes: 20, absorbés: 100)" | Log debug grid-grouper.js |
| `dataQuality.level` | **HIGH** | 400 trades, 13.3j, BUY+SELL |
| `overtrading` | ❌ Absent | Trades groupés espacés ~1008 min entre clusters |
| `rapid_reentry` | ❌ Absent attendu | Normal trades à 64 min, clusters condensés |
| `revenge_trading` | ❌ Absent | Trades normaux alternés, pas de séquence SELL→BUY rapide après perte |
| `loss_chasing` | ❌ Absent | Pas de séquence 3 BUY croissants sur même symbole |
| `size_inconsistency` | ❌ Absent | CV=0.218 << seuil 0.5 |
| Score | **95–100** non-NaN | Aucun pattern actif |
| `gridContextBanner` | ❌ Absent | Requiert orderStrategyProfile='grid' (Order History non chargé) |
| NaN / Infinity | ❌ Absent | Pipeline robuste sur groupes synthétiques |
| Freeze UI | ❌ Absent | 320 trades effectifs — validé SYN-002 (500t) |

---

## Faux positifs possibles

| Pattern | Risque | Cause |
|---------|--------|-------|
| `rapid_reentry` | Faible | Si un groupe BUY synthétique est suivi d'un SELL normal en <20 min, puis d'un BUY normal en <45 min — possible selon position des normaux. Non bloquant. |
| `overtrading` | Très faible | Si des trades normaux se concentrent par hasard dans une fenêtre 60 min (espacement moyen 64 min, variance possible). À noter si observé. |

---

## Grille de validation — Résultats terrain

| Checkpoint | Attendu | Observé | OK ? |
|-----------|---------|---------|------|
| Import sans erreur | `ok: true`, 400 trades | — | — |
| `[bhv:grid]` console log | "400 → 320, groupes: 20, absorbés: 100" | — | — |
| `dataQuality.level` | HIGH | — | — |
| Score comportemental | 95–100, non-NaN | — | — |
| `overtrading` | Absent | — | — |
| `rapid_reentry` | Absent (ou présent, non bloquant) | — | — |
| `revenge_trading` | Absent | — | — |
| `loss_chasing` | Absent | — | — |
| `size_inconsistency` | Absent (CV=0.218) | — | — |
| `gridContextBanner` | Absent (no Order History) | — | — |
| NaN / Infinity console | Absent | — | — |
| Exception console | Absente | — | — |
| Freeze UI | Absent | — | — |
| Session créée | Oui | — | — |

---

## Protocole de validation

1. Importer `SYN_006_grid_trading_400_trades.csv` dans l'onglet Comportement
2. Ouvrir DevTools → Console
3. Vérifier le log `[bhv:grid]` : doit afficher "400 trades → 320 (groupes: 20, absorbés: 100)"
4. Vérifier : dataQuality HIGH, score 95–100, aucun pattern bloquant
5. Vérifier absence de NaN, exception, freeze
6. Remplir la grille ci-dessus
