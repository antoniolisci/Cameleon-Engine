# CASE_SYN_001 — Dataset synthétique neutre équilibré (200 trades)

**Date création :** 2026-05-18  
**Type :** Synthétique — 100% généré, aucune donnée réelle  
**Statut :** 🔲 À tester  
**Fichier :** `excel_tests/04_anonymized_samples/SYN_001_neutral_balanced_200_trades.csv`

---

## Objectif

Dataset de référence (baseline) pour le stress test analytique Phase 1.  
Doit valider que le pipeline analytique se comporte correctement sur un historique volumineux, équilibré, et sans pattern problématique.

Référence : `project_memory/imports_excel_csv/ANALYTIC_STRESS_TEST_PLAN_001.md` § Phase 1.

---

## Spécifications du dataset

| Paramètre | Valeur |
|-----------|--------|
| Lignes totales | 201 (1 header + 200 trades) |
| Symbole | TAOUSDT |
| Répartition BUY/SELL | 100 BUY / 100 SELL (50/50 exact) |
| Cadence | 1 trade par heure |
| Durée couverte | 2025-01-01 00:00 → 2025-01-09 07:00 (~8.3 jours) |
| Prix | Base 300, variation sinusoïdale douce ±8 USDT (sin(i × 0.13)) |
| Executed | 0.10 à 0.20 TAOUSDT (cycle de 11 valeurs) |
| Amount | `price × executed` (arrondi 4 décimales) |
| Fee | `amount × 0.001` (0.1% — taux Binance standard) |
| Encodage | UTF-8, séparateur virgule, pas de BOM |

### Colonnes CSV
```
Date(UTC),Pair,Side,Price,Executed,Amount,Fee
```

---

## Données personnelles

| Vérification | Résultat |
|-------------|---------|
| User_ID | ✅ Absent |
| Adresse réelle | ✅ Absent |
| Transaction réelle | ✅ Absent — données 100% synthétiques |
| Données financières réelles | ✅ Absent — prix et quantités générés |
| Symbole fictif | ✅ TAOUSDT — symbole réel mais opérations inventées |

**Ce fichier peut être commité sans restriction.**

---

## Résultats attendus après import

| Critère | Valeur attendue |
|---------|----------------|
| Import | `ok: true`, 200 trades extraits |
| `dataQuality.level` | `HIGH` (200 trades, ≥72h, BUY+SELL) |
| Score comportemental | Entre 0 et 100, non-NaN |
| Profil comportemental | Discipliné ou Réactif (historique neutre) |
| Pattern `overtrading` | ❌ Absent — 1 trade/heure, pas de rafale |
| Pattern `revenge_trading` | ❌ Absent — alternance BUY/SELL régulière |
| Pattern `rapid_reentry` | ❌ Absent — espacement horaire constant |
| Pattern `escalade agressive` | ❌ Absent — quantités stables |
| Pattern `grid_trading` | ❌ Absent ou marginal — écarts de prix non répétitifs |
| Bandeau fiabilité | Absent (HIGH → aucun bandeau) |
| Bandeau grid context | ❌ Absent attendu |

---

## Grille de validation (à remplir après test)

| Checkpoint | Attendu | Observé | OK ? |
|-----------|---------|---------|------|
| Import sans erreur | `ok: true`, 200 trades | — | — |
| `dataQuality.level` | HIGH | — | — |
| Score comportemental | 0–100, non-NaN | — | — |
| Profil | Discipliné ou Réactif | — | — |
| Overtrading | Absent | — | — |
| Revenge trading | Absent | — | — |
| Grid trading | Absent | — | — |
| Temps analyse | < 500ms | — | — |
| DOM complet | Aucun undefined | — | — |
| Bandeau dataQuality | Absent (HIGH) | — | — |

---

## Statut

🔲 **Non testé** — dataset créé le 2026-05-18, en attente de run Phase 1.
