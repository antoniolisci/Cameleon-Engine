# CASE_SYN_005 — Dataset overtrading intentionnel (500 trades)

**Date création :** 2026-05-18  
**Type :** Synthétique — 100% généré, aucune donnée réelle  
**Statut :** 🔲 À tester  
**Fichier :** `excel_tests/04_anonymized_samples/SYN_005_overtrading_500_trades.csv`  
**Phase :** ANALYTIC_STRESS_TEST_PLAN_001 — Phase 3 (patterns edge cases)

---

## Objectif analytique

Déclencher volontairement le pattern `overtrading` pour valider :
1. Que `detectOvertrading()` identifie correctement les rafales denses
2. Que `dataQuality` reste HIGH (500 trades, 9.7j, BUY+SELL)
3. Que le score produit est cohérent et non-NaN
4. Qu'aucun faux positif secondaire n'est introduit
5. Observer l'effet de la modulation du score par `paceDelay` global

---

## Spécifications du dataset

| Paramètre | Valeur |
|-----------|--------|
| Lignes totales | 501 (1 header + 500 trades) |
| Symbole | TAOUSDT |
| Répartition BUY/SELL | 250 BUY / 250 SELL (50/50 exact) |
| Durée couverte | 2025-07-01 00:10 → 2025-07-10 16:55 (~9.7 jours) |
| Prix | 290–310 USDT (variation sinusoïdale + bruit, seed=55) |
| Executed | Cycle 5 valeurs : 0.10 / 0.1125 / 0.125 / 0.1375 / 0.15 |
| CV executed (size_inconsistency) | 0.141 — bien sous seuil 0.5 |
| Taille fichier | ~30 KB |

---

## Structure du dataset

### 8 rafales overtrading

| Rafale | Heure départ | Trades | Intervalle | Durée totale |
|--------|-------------|--------|-----------|-------------|
| Burst 1 | Jour 1, 10h00 | 15 | 3 min | 42 min |
| Burst 2 | Jour 2, 10h00 | 15 | 3 min | 42 min |
| Burst 3 | Jour 3, 10h00 | 15 | 3 min | 42 min |
| Burst 4 | Jour 4, 10h00 | 15 | 3 min | 42 min |
| Burst 5 | Jour 5, 10h00 | 15 | 3 min | 42 min |
| Burst 6 | Jour 6, 10h00 | 15 | 3 min | 42 min |
| Burst 7 | Jour 7, 10h00 | 15 | 3 min | 42 min |
| Burst 8 | Jour 8, 10h00 | 15 | 3 min | 42 min |

Total burst : 120 trades / 500  
Trades normaux : 380, espacés de ~35 min, hors fenêtres ±45 min des rafales

### Calibration du trigger overtrading

Seuil `detectOvertrading` : **5 trades en 60 min sur même symbole**

Pour chaque rafale de 15 trades × 3 min :
- Le trade à t+0 voit 15 trades dans sa fenêtre 60min → **trigger**
- Le trade à t+30 voit 5 trades dans sa fenêtre 60min → **trigger limite**
- Le trade à t+33 voit 4 trades → pas de trigger
- Chaque rafale génère ~11 triggers individuels

**Triggers simulés : 102** → `count = 102 >> 5` → **severity HIGH**

---

## Données personnelles

| Vérification | Résultat |
|-------------|---------|
| User_ID | ✅ Absent |
| Transaction réelle | ✅ Absent — données 100% synthétiques |
| Données financières réelles | ✅ Absent — prix générés (seed=55) |

---

## Analyse préalable — modulation du score

Le pipeline `scoring.js` module la pénalité overtrading par `paceDelay` :

```
paceDelay = avgTimeBetweenSameSymbol   // moyenne globale sur tous les trades
          ≈ durée_totale / (N-1) trades
          ≈ 13 965 min / 499
          ≈ 28 min
```

Avec `paceDelay = 28 min >= 10` → base overtrading **divisée par 2** :
- `n = 102 > 5` → base = 20 → après pace : 10 → isIsolated × 0.7 → 7 pts

**Score prévu : ~93 / 100 → profil Discipliné**

Cela révèle une propriété importante du moteur : l'overtrading est détecté avec severity HIGH, mais le score reste élevé car le `paceDelay` est mesuré sur la **moyenne globale** (28 min, douce) et non sur le rythme des rafales (3 min, intense). Les longues périodes calmes entre les rafales diluent la pénalité.

Ce comportement est documenté ici pour référence — il ne constitue pas un bug, c'est une règle de contextualisation intentionnelle.

---

## Résultats attendus

| Critère | Valeur attendue | Justification |
|---------|----------------|---------------|
| Import | `ok: true`, 500 trades | Format Trade History valide |
| `dataQuality.level` | **HIGH** | 500 trades, 9.7j, BUY+SELL |
| `overtrading` | ✅ **Déclenché** — severity HIGH | 102 triggers simulés |
| `revenge_trading` | ❌ Absent | BUY après SELL > 30 min en moyenne |
| `rapid_reentry` | ❌ Absent | Pas de BUY → SELL < 20 min → BUY < 45 min |
| `loss_chasing` | ❌ Absent | Pas de séquence 3 BUY croissants sur même symbole |
| `size_inconsistency` | ❌ Absent | CV = 0.141 << seuil 0.5 |
| Score | ~90–95, non-NaN | Modulation paceDelay global 28 min |
| Bandeau fiabilité | Absent (HIGH) | — |
| NaN / Infinity | ❌ Absent | Aucune hypothèse BUY/SELL cassée |
| Freeze UI | ❌ Absent | 500 trades — validé SYN-002 |

---

## Faux positifs secondaires possibles

| Pattern | Risque | Cause potentielle | Nature |
|---------|--------|-----------------|--------|
| `rapid_reentry` | Faible | Dans les rafales, SELL→BUY consécutifs avec intervalle 3 min — si un BUY précédent existe dans la fenêtre 20min | Non bloquant |
| `revenge_trading` | Très faible | SELL→BUY en 3 min dans les rafales, si la taille dépasse 1.5× la moyenne | À noter |
| `size_inconsistency` | Aucun | CV=0.141, conçu en dessous du seuil | — |

### Analyse détaillée rapid_reentry dans les rafales

La détection `rapid_reentry` requiert :
- `prevBuy` → `sell` en < 20 min (RR_HOLD_MAX_MIN)
- `sell` → `nextBuy` en < 45 min (RR_REENTRY_MAX_MIN)

Dans les rafales (BUY/SELL alternés toutes les 3 min) :
- BUY à t=0, SELL à t=3 : délai 3 min < 20 min → condition hold OK
- SELL à t=3, BUY suivant à t=6 : délai 3 min < 45 min → condition reentry OK
- **Verdict : `rapid_reentry` probablement déclenché dans les rafales**

Si déclenché : non bloquant, cohérent avec la nature du dataset. À documenter.

---

## Grille de validation (à remplir après test)

| Checkpoint | Attendu | Observé | OK ? |
|-----------|---------|---------|------|
| Import sans erreur | `ok: true`, 500 trades | — | — |
| `dataQuality.level` | HIGH | — | — |
| `overtrading` | Déclenché, severity HIGH | — | — |
| Score comportemental | 90–95, non-NaN | — | — |
| `revenge_trading` | Absent | — | — |
| `rapid_reentry` | Absent ou présent — noter | — | — |
| `loss_chasing` | Absent | — | — |
| `size_inconsistency` | Absent | — | — |
| NaN / Infinity | Absent | — | — |
| Exception console | Absente | — | — |
| Freeze UI | Absent | — | — |
| Bandeau HIGH | Absent (dataQuality HIGH) | — | — |

---

## Statut

🔲 **Non testé** — dataset créé le 2026-05-18.
