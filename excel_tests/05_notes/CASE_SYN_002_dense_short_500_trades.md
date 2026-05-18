# CASE_SYN_002 — Dataset synthétique dense court (500 trades)

**Date création :** 2026-05-18  
**Type :** Synthétique — 100% généré, aucune donnée réelle  
**Statut :** 🔲 À tester  
**Fichier :** `excel_tests/04_anonymized_samples/SYN_002_dense_short_500_trades.csv`  
**Phase :** ANALYTIC_STRESS_TEST_PLAN_001 — Phase 2 (montée en charge 500 trades)

---

## Objectif analytique

Valider le comportement du pipeline sur un historique dense (4 trades/heure) avec structure de marché non neutre : phases distinctes (range, impulsion, retracement, range dense).

Deux questions principales :
1. **Performance** : le pipeline reste-t-il sous 2s sur 500 trades ? `groupGridTrades` reste-t-il sous 200ms ?
2. **Cohérence analytique** : les phases de marché sont-elles reflétées dans le score sans faux positifs ?

---

## Spécifications du dataset

| Paramètre | Valeur |
|-----------|--------|
| Lignes totales | 501 (1 header + 500 trades) |
| Symbole | TAOUSDT |
| Répartition BUY/SELL | 250 BUY / 250 SELL (50/50 exact) |
| Cadence | 1 trade toutes les 15 minutes (~4/heure) |
| Durée couverte | 2025-02-01 00:00 → 2025-02-06 04:45 (~5.2 jours) |
| Prix | 295–334 USDT (variation par phase, bruit aléatoire seed=42) |
| Executed | 0.05 à 0.20 TAOUSDT (cycle de 13 valeurs) |
| Amount | `price × executed` (arrondi 4 décimales) |
| Fee | `amount × 0.001` (0.1%) |
| Encodage | UTF-8, séparateur virgule, pas de BOM |

### Structure des phases

| Trades | Heures | Phase | Prix |
|--------|--------|-------|------|
| 0–99 | 0–24.75h | Range calme | ~300 ±5 |
| 100–199 | 25–49.75h | Impulsion haussière | 300 → 334 |
| 200–299 | 50–74.75h | Retracement | 334 → 310 |
| 300–499 | 75–124.75h | Range dense | ~310 ±12 |

---

## Données personnelles

| Vérification | Résultat |
|-------------|---------|
| User_ID | ✅ Absent |
| Adresse réelle | ✅ Absent |
| Transaction réelle | ✅ Absent — données 100% synthétiques |
| Données financières réelles | ✅ Absent — prix et quantités générés (seed=42) |

**Ce fichier peut être commité sans restriction.**

---

## Résultats attendus après import

| Critère | Valeur attendue | Justification |
|---------|----------------|---------------|
| Import | `ok: true`, 500 trades | Format compatible Trade History |
| `dataQuality.level` | `HIGH` | 500 trades, 5.2j, BUY+SELL |
| Score comportemental | 0–100, non-NaN | — |
| Pattern `overtrading` | Possible sur phase range dense (300–499) | 4 trades/heure peut déclencher le seuil |
| Pattern `revenge_trading` | ❌ Absent | Alternance stricte, pas de séquences pertes |
| Pattern `rapid_reentry` | Possible | Espacement 15min — sous le seuil 60min |
| Pattern `grid_trading` | Possible sur phase range dense | BUY/SELL alternés, écarts prix faibles |
| Bandeau fiabilité | Absent (HIGH) | — |

### Notes sur les patterns attendus

- **Overtrading** : 4 trades/heure = 1 toutes les 15min. Selon le seuil interne de `detectPatterns`, cela peut ou non déclencher `overtrading`. Si déclenché, ce n'est pas un faux positif — c'est une conséquence du rythme dense choisi. À noter et documenter.
- **Grid** : `groupGridTrades()` peut consolider des séquences BUY/SELL alternées avec écarts de prix <2% sur la phase range. À observer.
- **Rapid reentry** : fenêtre 60min contient 4 trades dans ce dataset — comportement du seuil à vérifier.

---

## Section performance

Timers à observer dans DevTools Console après import :

| Timer | Seuil acceptable | Bloquant si > |
|-------|-----------------|--------------|
| `bhv:grid` | < 200ms | 1000ms |
| `bhv:patterns` | < 300ms | 1000ms |
| `bhv:mount` | < 500ms | 2000ms |

**Instrumentation :** `console.time` wrappers ajoutés temporairement dans `behavior-view.js` (commit Phase 2). À supprimer après audit.

### Protocole de mesure

1. Ouvrir DevTools → Console (filtre : "bhv:")
2. Importer `SYN_002_dense_short_500_trades.csv`
3. Lire les trois valeurs affichées
4. Répéter 3 fois, noter min/max/moyen
5. Tester sur un onglet vide (pas d'autres scripts actifs)

---

## Section rendu DOM

| Élément | Vérification |
|---------|-------------|
| Bandeau dataQuality | Absent (HIGH) |
| Score principal | Affiché, classe CSS cohérente |
| Patterns détectés | Liste complète, aucun `undefined` |
| Métriques numériques | Non-NaN, non-vide |
| Journal de trades | 500 entrées rendues sans freeze |

---

## Grille de validation (à remplir après test)

| Checkpoint | Attendu | Observé | OK ? |
|-----------|---------|---------|------|
| Import sans erreur | `ok: true`, 500 trades | — | — |
| `dataQuality.level` | HIGH | — | — |
| Score comportemental | 0–100, non-NaN | — | — |
| `bhv:grid` | < 200ms | — | — |
| `bhv:patterns` | < 300ms | — | — |
| `bhv:mount` | < 500ms | — | — |
| DOM complet | Aucun undefined | — | — |
| Revenge trading | Absent | — | — |
| Grid / overtrading | Documenter si présent | — | — |

---

## Risques spécifiques

| Risque | Probabilité | Impact |
|--------|------------|--------|
| `groupGridTrades()` lent sur 500 trades | Faible (linéaire attendu) | Bloquant si > 1s |
| Faux positif overtrading | Moyen (4 trades/h) | Non bloquant — à documenter |
| Score NaN (prix phase transition) | Faible | Bloquant |
| DOM freeze sur journal 500 trades | Faible | Non bloquant V1 |

---

## Statut

🔲 **Non testé** — dataset créé le 2026-05-18, instrumentation ajoutée, en attente de run Phase 2.
