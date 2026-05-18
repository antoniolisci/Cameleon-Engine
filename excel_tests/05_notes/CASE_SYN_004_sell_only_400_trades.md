# CASE_SYN_004 — Dataset SELL-only (400 trades) — Test robustesse logique BUY/SELL

**Date création :** 2026-05-18  
**Type :** Synthétique — 100% généré, aucune donnée réelle  
**Statut :** 🔲 À tester  
**Fichier :** `excel_tests/04_anonymized_samples/SYN_004_sell_only_400_trades.csv`  
**Phase :** ANALYTIC_STRESS_TEST_PLAN_001 — Phase 3 (patterns edge cases)

---

## Objectif analytique

Tester la robustesse logique du pipeline face à un dataset volontairement asymétrique : 400 SELL, 0 BUY.

Ce n'est pas un test de charge. C'est un test d'hypothèses implicites.

Questions ciblées :
1. Le pipeline produit-il un NaN ou une exception sur `buyCount = 0` ?
2. `dataQuality` déclenche-t-il correctement le bandeau LOW ?
3. Les patterns qui requièrent un BUY (revenge, rapid_reentry, loss_chasing) retournent-ils `null` proprement ?
4. L'affichage des métriques "Achats" et "Moy. achat" est-il cohérent (0, pas undefined) ?
5. `detectSizeInconsistency` et `detectOvertrading` fonctionnent-ils correctement sur SELL-only ?

---

## Spécifications du dataset

| Paramètre | Valeur |
|-----------|--------|
| Lignes totales | 401 (1 header + 400 trades) |
| Symbole | TAOUSDT |
| Répartition BUY/SELL | **0 BUY / 400 SELL** |
| Cadence | 1 trade toutes les 50 minutes |
| Durée couverte | 2025-06-01 00:00 → 2025-06-14 20:30 (~14 jours) |
| Prix | 265–287 USDT (dérive baissière douce −8 USDT + sinus + bruit, seed=77) |
| Executed | 0.08 à 0.20 TAOUSDT (cycle de 9 valeurs) |
| Amount | `price × executed` |
| Fee | `amount × 0.001` (0.1%) |
| Taille fichier | ~24 KB |

---

## Données personnelles

| Vérification | Résultat |
|-------------|---------|
| User_ID | ✅ Absent |
| Transaction réelle | ✅ Absent — données 100% synthétiques |
| Données financières réelles | ✅ Absent — prix générés (seed=77) |

---

## Analyse préalable des hypothèses implicites

Lecture complète du pipeline effectuée avant création du dataset.

### metrics.js

| Métrique | Comportement SELL-only | Risque |
|---------|----------------------|--------|
| `buyCount` | 0 | ✅ Aucun — valeur entière |
| `avgBuySize` | Guard `buyCount > 0 ? … : 0` → retourne 0 | ✅ Aucun — guard explicite |
| `avgDelayAfterBuy` | `computeAvgDelayAfter(sorted, 'BUY')` → `gaps=[]` → `null` | ✅ Aucun — retourne null |
| `dataQuality` | `buyCount === 0` → LOW, raison "SELL uniquement — 3 patterns sur 5 non évaluables" | ✅ Cas géré explicitement |
| Autres métriques | Travaillent sur tous les trades sans filtre side | ✅ Sains |

### patterns.js

| Pattern | Comportement SELL-only | Risque |
|---------|----------------------|--------|
| `detectRevenge` | Requiert `prev.side=SELL && curr.side=BUY` → jamais vrai → count=0 → null | ✅ Aucun |
| `detectRapidReentry` | Cherche `prevBuy` (BUY avant SELL) → null → continue → instances=[] | ✅ Aucun |
| `detectLossChasing` | Filtre `side=BUY` → `buysList=[]` → 0 itérations → null | ✅ Aucun |
| `detectSizeInconsistency` | Calcule CV sur tous les trades (400 SELL) — **non testé en SELL-only** | ⚠️ À observer |
| `detectOvertrading` | 1 trade/50min < seuil 5 trades/60min — probablement null | ⚠️ À confirmer |

### scoring.js

| Calcul | Comportement SELL-only | Risque |
|--------|----------------------|--------|
| `paceDelay` | `avgTimeBetweenSameSymbol ?? avgTimeBetween` → calculé sur tous les trades | ✅ Aucun |
| `patternPenalty` | Uniquement sur patterns détectés — 3 sur 5 attendus null | ✅ Aucun |
| Division implicite | Aucune division par `buyCount` ou `sellCount` dans scoring.js | ✅ Aucun |

### behavior-view.js (rendu)

| Élément | Comportement SELL-only | Risque |
|---------|----------------------|--------|
| `metric('Achats', m.buyCount)` | Affiche 0 | ✅ Entier — pas NaN |
| `metric('Moy. achat', m.avgBuySize + ' $')` | Affiche "0 $" | ✅ Acceptable — UX dégradée mais non cassée |
| `delayAfterBuy` ligne 669 | Guard `!== null` → affiche '—' | ✅ Guard explicite |
| Comparaison lignes 835-837 | Guard `m.avgDelayAfterBuy !== null` avant `* 0.5` | ✅ Guard explicite |
| `tagTrades` | Revenge/reentry/loss_chasing tags → jamais déclenchés | ✅ Map vide |

---

## Résultats attendus

| Critère | Valeur attendue | Justification |
|---------|----------------|---------------|
| Import | `ok: true`, 400 trades | Format Trade History valide |
| `dataQuality.level` | **LOW** | `buyCount === 0` → cas explicite |
| Bandeau LOW | Affiché — "X trades SELL uniquement — 3 patterns sur 5 non évaluables" | ✅ |
| Score | 100 (ou proche) | Aucun pattern BUY-dépendant possible ; overtrading improbable à 50min |
| `revenge_trading` | ❌ Absent | Requiert BUY |
| `rapid_reentry` | ❌ Absent | Requiert BUY |
| `loss_chasing` | ❌ Absent | Requiert BUY |
| `size_inconsistency` | À observer | CV sur 400 SELL — cycle 9 valeurs 0.08→0.20 (ratio 2.5×) |
| `overtrading` | ❌ Absent attendu | 1 trade/50min << seuil 5/60min |
| NaN / Infinity | ❌ Absent | Aucune division par buyCount dans le pipeline |
| Exception console | ❌ Absent | Tous les guards identifiés sont présents |
| Freeze UI | ❌ Absent | 400 trades — confort validé sur SYN-001 (200t) |
| `metric('Achats')` | 0 | Entier, pas undefined |
| `metric('Moy. achat')` | "0 $" | Concaténation string, pas NaN |
| `metric('Après achat')` | "—" | Guard `!== null` |

---

## Grille de validation (à remplir après test)

| Checkpoint | Attendu | Observé | OK ? |
|-----------|---------|---------|------|
| Import sans erreur | `ok: true`, 400 trades | — | — |
| `dataQuality.level` | LOW | — | — |
| Bandeau LOW affiché | "SELL uniquement — 3 patterns sur 5 non évaluables" | — | — |
| Score comportemental | 100 ou proche, non-NaN | — | — |
| `revenge_trading` | Absent | — | — |
| `rapid_reentry` | Absent | — | — |
| `loss_chasing` | Absent | — | — |
| `size_inconsistency` | Absent ou présent — noter le CV | — | — |
| `overtrading` | Absent | — | — |
| `metric('Achats')` | 0 (pas undefined) | — | — |
| `metric('Moy. achat')` | "0 $" (pas NaN) | — | — |
| `metric('Après achat')` | "—" (pas null affiché brut) | — | — |
| NaN / Infinity console | Absent | — | — |
| Exception console | Absente | — | — |
| Freeze UI | Absent | — | — |

---

## Protocole de validation

1. Importer `SYN_004_sell_only_400_trades.csv` dans l'onglet Comportement
2. Ouvrir DevTools → Console — noter toute erreur, warn inattendu, NaN
3. Vérifier visuellement :
   - Bandeau LOW présent avec texte correct
   - Section Résumé : "Achats: 0", "Moy. achat: 0 $", "Après achat: —"
   - Section Patterns : revenge/reentry/loss_chasing absents
4. Inspecter le score affiché — doit être 100 ou proche
5. Remplir la grille ci-dessus

---

## Risques résiduels identifiés

| Risque | Probabilité | Nature |
|--------|------------|--------|
| `size_inconsistency` déclenché sur SELL-only | Possible | Non bloquant — cycle 9 valeurs, CV potentiellement > 0.5 |
| Affichage "0 $" pour Moy. achat | Certain | UX dégradée, non cassée — acceptable V1 |
| Pattern inattendu non listé | Faible | À documenter si présent |
| Crash ou exception | Très faible | Tous les guards identifiés et présents |

---

## Statut

🔲 **Non testé** — dataset créé le 2026-05-18.
