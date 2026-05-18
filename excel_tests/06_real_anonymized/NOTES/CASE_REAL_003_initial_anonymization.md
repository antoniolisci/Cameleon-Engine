# CASE_REAL_003 — Binance Order History mixte 10 actifs (542 trades) — VALIDÉ terrain

**Date création :** 2026-05-18  
**Date clôture :** 2026-05-18  
**Phase :** 4 — Datasets réels anonymisés  
**Statut :** ✅ VALIDATED — terrain complété, pipeline confirmé

---

## 1. Source

| Champ | Valeur |
|-------|--------|
| Fichier RAW | `Binance-Historique-d'ordre-Spot-202605181002(UTC+2)_dc72567d.xlsx` |
| Format | Binance **Order History** XLSX (même format que REAL_001) |
| Exporté le | 2026-05-18 à 10:02 UTC+2 |
| Période brute (métadonnées XLSX) | 2025-11-18 → 2026-05-18 (~6 mois) |
| Période réelle des données FILLED | 2025-11-17 → 2026-05-03 (~168 jours, 5.6 mois) |
| Total lignes brutes | 1293 lignes de données |
| FILLED | **542** |
| CANCELED | 625 |
| NEW | 126 |
| Taux de fill | 542 / 1293 = **41.9 %** (comparable à REAL_001 : 43%) |
| Différence vs REAL_001 | Même format Order History — période plus courte (5.6 mois vs 25 mois), moins d'actifs (10 vs 64) |
| Différence vs REAL_002 | Format Order History (vs Trade History) — plus long (5.6 mois vs 47 jours), multi-actifs (10 vs 1) |

---

## 2. Structure XLSX brute

| Ligne | Contenu |
|-------|---------|
| 1 | Vide |
| 2 | `www.binance.com` |
| 3 | `Historique d'ordre Spot` |
| 4 | Vide |
| 5 | `Nom: ANTONIO LISCI` · `E-mail: antonio.lisci@gmail.com` · `Adresse: 449 rue du Perron` |
| 6 | `ID utilisateur: 478192933` · `Période(UTC+2): 2025-11-18 to 2026-05-18` |
| 7–9 | Vides |
| 10 | **Headers** : `Durée` · `Numéro de commande` · `Paire` · `Typeᵒ` · `Côté` · `Prix de l'ordre` · `Montant de la commande` · `Durée` · `Exécuté` · `Prix moyen` · `Trading totalᵒ` · `Statut` |
| 11+ | Données ordres |

**Particularités structurelles :**
- Deux colonnes `Durée` : col B (heure d'ouverture de l'ordre) et col I (heure d'exécution). La première est utilisée pour le timestamp — la seconde est renommée `Date_execution` dans le CLEAN pour éviter les doublons de clé.
- `Typeᵒ` et `Trading totalᵒ` portent un suffixe `ᵒ` (U+00BA, ordinal masculin espagnol). Contrairement au `²` de CASE_001, ce caractère n'est pas présent dans `normalizeKey()`. Ces colonnes sont renommées sans le suffixe dans le CLEAN (`Type`, `Total`).
- Tous les ordres sont de type `Limit` — pas de Market orders dans ce dataset.

---

## 3. Colonnes supprimées (PII)

| Élément supprimé | Raison |
|-----------------|--------|
| Lignes 1–9 du XLSX (méta-en-tête Binance) | PII directe : Nom, E-mail, Adresse, User ID |
| Colonne `Numéro de commande` | Order ID — identifiant traçable Binance |

**PII supprimée :**

| Élément | Valeur brute |
|---------|-------------|
| Nom | ANTONIO LISCI |
| E-mail | antonio.lisci@gmail.com |
| Adresse | 449 rue du Perron |
| User ID | 478192933 |

---

## 4. Colonnes conservées et noms CSV CLEAN

| Colonne source (XLSX) | Nom CSV CLEAN | `normalizeKey()` | Alias matché |
|-----------------------|---------------|------------------|--------------|
| Durée (col B — ouverture) | `Duree` | `duree` | `ALIASES_DATE['duree']` ✅ |
| Paire | `Paire` | `paire` | `ALIASES_SYMBOL['paire']` ✅ |
| Typeᵒ | `Type` | `type` | [UNUSED — côté via `Cote`] |
| Côté | `Cote` | `cote` | `ALIASES_SIDE['cote']` ✅ |
| Prix de l'ordre | `Prix_ordre` | `prix ordre` | [UNUSED — prix via `Prix_moyen`] |
| Montant de la commande | `Montant` | `montant` | `ALIASES_QUOTE['montant']` (secondaire) |
| Durée (col I — exécution) | `Date_execution` | `date execution` | [UNUSED — timestamp déjà extrait de `Duree`] |
| Exécuté | `Execute` | `execute` | `ALIASES_QTY['execute']` ✅ |
| Prix moyen | `Prix_moyen` | `prix moyen` | `ALIASES_PRICE['prix moyen']` ✅ |
| Trading totalᵒ | `Total` | `total` | `ALIASES_QUOTE['total']` ✅ (prioritaire sur `montant`) |
| Statut | `Statut` | `statut` | `ALIASES_STATUS['statut']` ✅ |

**7 champs critiques mappés, 0 blocage.** Mapping identique à REAL_001 CLEAN — aucune correction nécessaire.

---

## 5. Transformations d'anonymisation appliquées

| Transformation | Valeur | Raison |
|----------------|--------|--------|
| Décalage temporel | +60 jours (uniforme) | Cohérence avec REAL_001 et REAL_002 |
| Offset prix | Aucun | Préserve cohérence analytique `price × quantity = total` |
| Facteur quantité | Aucun | Préserve CV, avgSize, métriques comportementales |
| Encodage sortie | UTF-8 BOM | Compatibilité Excel / moteur |
| Filtrage statuts | FILLED uniquement | Seules les exécutions réelles sont importées |

**Période anonymisée :** 2026-01-16 06:01:29 → 2026-07-02 17:18:12 (+60j)

---

## 6. Vérification PII post-génération

| Terme recherché | Résultat |
|----------------|----------|
| ANTONIO / LISCI | Non trouvé |
| antonio.lisci | Non trouvé |
| 478192933 (User ID) | Non trouvé |
| 449 rue du Perron | Non trouvé |
| Numéro de commande | Colonne absente du CLEAN |

**Conclusion PII :** CLEAN — aucun identifiant direct résiduel.

---

## 7. Profil du dataset CLEAN

| Dimension | Valeur |
|-----------|--------|
| Fichier CLEAN | `REAL_003_binance_order_history_mixed_542_trades.csv` |
| Période anonymisée | 2026-01-16 → 2026-07-02 (~168 jours, 5.6 mois) |
| Trades | **542** |
| BUY | 269 (49.6%) |
| SELL | 273 (50.4%) |
| Symboles | **10 distincts** |
| Dominant | TAOUSDC : **492 / 542 (90.8%)** |

### Répartition par actif

| Symbole | BUY | SELL | Total | % du dataset |
|---------|-----|------|-------|-------------|
| TAOUSDC | 253 | 239 | 492 | 90.8% |
| FETUSDC | 10 | 13 | 23 | 4.2% |
| ONDOUSDC | 1 | 11 | 12 | 2.2% |
| SOLUSDC | 2 | 2 | 4 | 0.7% |
| ROSEUSDC | 2 | 2 | 4 | 0.7% |
| PLUMEUSDC | 1 | 2 | 3 | 0.6% |
| BIOUSDC | 0 | 1 | 1 | 0.2% |
| LINKUSDC | 0 | 1 | 1 | 0.2% |
| BTCEUR | 0 | 1 | 1 | 0.2% |
| INJUSDC | 0 | 1 | 1 | 0.2% |

**Observation comportementale :** ONDOUSDC à 1 BUY / 11 SELL indique une sortie de position (accumulation probable hors Binance ou depuis un autre format, liquidation progressive sur Binance). FET, SOL, ROSE sont des positions secondaires modestes. BIO, LINK, BTC, INJ = trades ponctuels ou tests.

### Métriques analytiques prédites (pre-grouper)

| Métrique | Valeur | Interprétation |
|----------|--------|----------------|
| `avgSize` (quote_value) | **42.07 USDC** | Positions modestes — comparable à REAL_002 |
| `stdev(tradeSize)` | **44.50** | Forte dispersion — variance élevée des tailles |
| **CV tradeSize** | **1.058** | `size_inconsistency` probable (> seuil ~0.5) |
| `oversizedTradesCount` (> 2×avg=84.14) | **67** (12.4%) | Pénalité métrique −10 quasi-certaine |
| `avg quote_value` | 42.07 USDC | validateTrades OK (seuil 10 000) |
| BUY / SELL | 269 / 273 | dataQuality HIGH attendu |
| Gaps ≤ 3min (all trades) | **228 / 541 (42.1%)** | Activité burst dense — grouper fortement actif |
| Gaps ≤ 3min same-side TAOUSDC | **195 / 491 (39.7%)** | Taux identique à REAL_001 TAOUSDC (~39%) |
| min quote_value | 5.52 USDC | Petites positions réelles |
| max quote_value | 411.98 USDC | Positions outliers significatives (4.9× la moyenne) |

**Alerte grouper :** le taux de 39.7% de gaps ≤ 3min same-side sur TAOUSDC est identique à REAL_001. Sur 492 trades TAOUSDC, le nombre de groupes créés pourrait être comparable à REAL_001 (71 groupes sur 1685 trades, soit ~4.2%). Estimation : **20–50 groupes** attendus.

---

## 8. Audit pipeline statique (2026-05-18)

### Méthodologie

Simulation complète en Python du pipeline JS : `classifyFile()` → `detectFormat()` → `normalizeOrderRow()` × 542. Chaque étape reproduite depuis `uploader.js`, `format-detector.js`, `binance_order.js`.

### `classifyFile()` — détection format

| Signal | Clé normalisée | Résultat |
|--------|---------------|---------|
| date | `duree` | ❌ absent de `DETECT_DATE` uploader (asymétrie connue, sans impact) |
| symbol | `paire` | ✅ |
| side | `cote` | ✅ |
| price | `prix moyen` | ✅ |
| qty | `execute` | ✅ |
| status | `statut` | ✅ |
| → | **FULL_TRADING (5/5 hors date)** | Import accepté |

### `detectFormat()` — Order vs Trade History

| Signal | Résultat |
|--------|---------|
| `Statut` → `normalizeH('Statut')` → `'statut'` → dans `SIGNALS_STATUS` | `hasStatus = true` |
| `Frais` absent (Order History n'a pas de fee) | `hasFee = false` |
| → **ORDER_HISTORY** ✅ | Pipeline `mapOrderRows()` activé |

### `normalizeOrderRow()` — audit de mapping

| Champ canonique | Clé normalisée | Alias matché | Valeur exemple |
|----------------|---------------|--------------|----------------|
| timestamp | `duree` | `ALIASES_DATE['duree']` | `'26-07-02 17:18:12'` → 1751464692000 ✅ |
| symbol | `paire` | `ALIASES_SYMBOL['paire']` | `'TAOUSDC'` ✅ |
| side | `cote` | `ALIASES_SIDE['cote']` | `'SELL'` ✅ |
| price | `prix moyen` | `ALIASES_PRICE['prix moyen']` | `'290.2'` → 290.2 ✅ |
| qty | `execute` | `ALIASES_QTY['execute']` | `'0.111TAO'` → 0.111 ✅ |
| quote_value | `total` | `ALIASES_QUOTE['total']` | `'32.2122USDC'` → 32.2122 ✅ |
| status | `statut` | `ALIASES_STATUS['statut']` | `'FILLED'` → isFilledStatus ✅ |

**Priorité price :** `Prix_moyen` → `'prix moyen'` est prioritaire sur `Prix_ordre` → `'prix ordre'` dans `ALIASES_PRICE`. La valeur extraite est toujours le prix d'exécution réel.

**Priorité quote :** `Total` → `'total'` est en position 1 dans `ALIASES_QUOTE`, donc prioritaire sur `Montant` → `'montant'` (position 7). La valeur extraite est le `Trading total` (montant réellement échangé).

**Format date :** `'26-07-02 17:18:12'` → regex `^(\d{2})-(\d{2})-(\d{2})\s(\d{2}:\d{2}:\d{2})$` → `'2026-07-02T17:18:12Z'` → timestamp valide ✅

**Format qty :** `'0.111TAO'` → `parseNum()` → regex `^([\d.]+)` → 0.111 ✅ (suffixe actif ignoré)

### Simulation complète

| Métrique | Valeur |
|----------|--------|
| Lignes FILLED acceptées | **542 / 542 (100%)** |
| Rejets timestamp null | 0 |
| Rejets champ manquant | 0 |
| price = 0 | 0 |
| qty = 0 | 0 |
| quote_value = 0 | 0 |
| Incohérences price × qty > 5% | 0 |

**Résultat : 0 rejet, 0 NaN, 0 risque crash.** Le fichier est directement importable sans correction.

### Anomalie BTCEUR

1 trade BTCEUR (SELL, 2026-02-15, 0.00256 BTC, prix 74825.58 EUR, total 191.55 EUR).

- `parseNum('191.5534848EUR')` → 191.55 ✅ (pas de crash)
- La `quote_value` de 191.55 est en EUR, mélangée avec les valeurs USDC des autres trades
- Impact : légère distorsion sur `avgSize` et `CV` (~0.3 USDC de delta sur la moyenne globale — négligeable)
- Type : **Observ.** — trade réel, aucun patch nécessaire

---

## 9. Analyse comparative REAL_001 / REAL_002 / REAL_003

### Caractéristiques générales

| Dimension | REAL_001 | REAL_002 | **REAL_003** |
|-----------|---------|---------|------------|
| Format source | Order History | Trade History | **Order History** |
| Durée historique | 25 mois | 47 jours | **5.6 mois** |
| Trades | 1685 | 120 | **542** |
| Symboles | 64 | 1 | **10** |
| Dominant | TAOUSDC (35.8%) | TAOUSDC (100%) | **TAOUSDC (90.8%)** |
| Fee disponible | Non | Oui | **Non** |
| Correction parser nécessaire | Oui (`Date_ouverture` → `Duree`) | Non | **Non (0 correction)** |
| Pipeline activé | `mapOrderRows()` | `mapBinanceSpotRow()` | **`mapOrderRows()`** |

### Métriques analytiques comparées

| Métrique | REAL_001 | REAL_002 | **REAL_003** |
|----------|---------|---------|------------|
| CV tradeSize | 2.478 | 1.007 | **1.058** |
| oversizedTradesCount | 188 | 15 | **67** |
| BUY / SELL | 880 / 805 | 63 / 57 | **269 / 273** |
| dataQuality attendu | HIGH | HIGH | **HIGH** |
| Gaps ≤ 3min same-side (TAOUSDC) | ~39% | 22.7% | **39.7%** |
| Durée comportementale | Multi-phases (25 mois) | Mono-phase (47j) | **Pluriel-modéré (5.6 mois)** |
| Lisibilité comportementale attendue | Faible | Haute | **Intermédiaire** |

### Positionnement dans le spectre Phase 4

REAL_003 occupe la position intermédiaire entre REAL_001 (chaos structurel maximum) et REAL_002 (homogénéité lisible) :

```
REAL_001 ──────────── REAL_003 ──────────── REAL_002
[chaos structurel]  [transition]      [homogénéité lisible]
64 actifs           10 actifs          1 actif
25 mois             5.6 mois           47 jours
CV 2.478            CV 1.058           CV 1.007
score 15            score prédit 15-25  score 37
```

**Hypothèse transition :** REAL_003 représente une période de transition comportementale — l'utilisateur explore de nouveaux actifs (FET, ONDO, SOL, etc.) tout en maintenant une activité dominante sur TAOUSDC. La concentration croissante sur TAOUSDC (90.8%) préfigure la dynamique REAL_002 (100% TAOUSDC sur une période plus récente).

---

## 10. Anomalies connues (avant terrain)

| Anomalie | Type | Description |
|----------|------|-------------|
| CV=1.058 | BC/LS | Mix de variabilité comportementale réelle (tailles hétérogènes sur TAOUSDC) + légère inflation multi-actifs (10 paires). Moins structurel que REAL_001 (CV=2.478), comparable à REAL_002 (CV=1.007). Interprétation à confirmer terrain. |
| oversizedTradesCount=67 | BC/LS | 67 trades > 2×avgSize (84 USDC). Sur 10 actifs avec TAOUSDC dominant, l'hétérogénéité est partiellement comportementale (grosses positions sur TAOUSDC) et partiellement structurelle. |
| Gaps ≤ 3min same-side TAOUSDC = 39.7% | AG/BC | Taux identique à REAL_001 → grouper très actif attendu. Amplification post-grouper (LS-3) probable : 20–50 groupes estimés. Impact métriques significatif. |
| ONDOUSDC : 1 BUY / 11 SELL | Observ. | Asymétrie forte — liquidation progressive d'une position. Signal comportemental réel (exit strategy ou désengagement). Sans impact sur dataQuality (équilibre global OK). |
| BTCEUR (EUR quote) | Observ. | 1 trade BTCEUR avec total en EUR — mélangé avec USDC dans les métriques. Impact minimal (~0.3 USDC sur la moyenne globale). Pas de crash. |
| `Trading totalᵒ` suffixe ᵒ | Observ. | Caractère U+00BA non géré par `normalizeKey()`. Renommé `Total` dans le CLEAN — sans impact sur la normalisation. |
| 5.6 mois de données | LS-4 | Période multi-phases modérée. Pas aussi sévère que REAL_001 (25 mois) mais couvre potentiellement des périodes de comportement hétérogènes sur TAOUSDC. |

---

## 11. Limites LS applicables à REAL_003

| Limite | Applicabilité sur REAL_003 |
|--------|---------------------------|
| LS-1 — CV multi-actifs | **PARTIELLE.** CV=1.058 est proche de REAL_002 (1.007, signal réel). Avec 10 actifs dont TAOUSDC à 90.8%, l'inflation structurelle est faible mais présente. Le signal de `size_inconsistency` est une combinaison de comportement réel + légère distorsion multi-actifs. |
| LS-2 — oversizedTradesCount | **PARTIELLE.** 67 oversized sur 542 trades. Sur TAOUSDC dominant, les grosses positions sont en partie des décisions réelles (pas uniquement du au croisement inter-actifs). Moins structurel que REAL_001 (188 oversized sur 64 actifs). |
| LS-3 — Amplification post-grouper | **ACTIVE.** Taux gap 39.7% = niveau REAL_001. Le grouper créera des groupes synthétiques aux `quote_quantity = Σ membres` → amplification CV et oversized post-grouper. Impact potentiellement similaire à REAL_001. |
| LS-4 — Score multi-phases | **MODÉRÉE.** 5.6 mois : ni aussi homogène que REAL_002 (47j) ni aussi hétérogène que REAL_001 (25 mois). Couvre probablement 2–3 phases comportementales distinctes. |

---

## 12. Hypothèses analytiques pré-terrain

| Pattern | Probabilité | Raisonnement |
|---------|------------|-------------|
| `size_inconsistency` | **Haute** | CV=1.058 > seuil, 67 oversized — pattern quasi-certain |
| `oversizing` (métrique) | **Haute** | 67 > seuil 3 → pénalité −10 quasi-certaine |
| `grid_trading` / consolidation grouper | **Très haute** | 195 gaps ≤ 3min same-side TAOUSDC → grouper très actif |
| `rapid_reentry` | **Haute** | Activité dense TAOUSDC avec alternance BUY/SELL rapide plausible |
| `loss_chasing` / escalade | **Moyenne** | Dépend des séquences de prix — TAOUSDC en baisse sur certaines périodes |
| `overtrading` | **Haute** | 42.1% de gaps ≤ 3min global — densité supérieure à REAL_002 |

**Score prédit : 15–28**

Fourchette basse : grouper très actif (40+ groupes) → amplification LS-3 massive → score proche de REAL_001 (15).  
Fourchette haute : dominance TAOUSDC atténue LS-1, période plus courte atténue LS-4 → lisibilité supérieure à REAL_001.

**Note de calibration :** REAL_001 avait 71 groupes (taux gap identique) → score 15. REAL_003 a un quart des trades mais un taux de gap similaire → peut-être 20–40 groupes. Avec moins de distorsion structurelle (10 actifs vs 64), le score devrait être légèrement supérieur à REAL_001.

---

## 13. Checklist terrain

- [x] Serveur local démarré (`serve-local.ps1`)
- [x] Console DevTools ouverte — filtre **Verbose** activé
- [x] Fichier importé : `CLEAN/REAL_003_binance_order_history_mixed_542_trades.csv`
- [x] Import réussi — 542 trades, 0 ignorés, aucune erreur UI
- [x] Score noté : **25 / 100**
- [x] Patterns listés : Irrégulier / profil Mixte
- [x] Logs `[bhv:grid]` : `542 → 390 (groupes: 59, absorbés: 211)`
- [x] Aucun crash / NaN / freeze
- [x] Résultats terrain complétés (§14)

---

## 14. Résultats terrain — REAL_003 (2026-05-18)

Test exécuté via UI Caméléon Engine. Fichier importé : `CLEAN/REAL_003_binance_order_history_mixed_542_trades.csv`.

| Champ | Prédit | Observé |
|-------|--------|---------|
| Import réussi | ✅ | ✅ |
| Trades importés | 542 | **542** |
| Lignes ignorées | 0 | **0** |
| Parser Order History | ✅ (statique) | ✅ **validé runtime** |
| Trades analysés (UI) | 542 | **542** |
| Log `[bhv:grid]` | 20–50 groupes | **542 → 390 (groupes: 59, absorbés: 211)** |
| dataQuality | HIGH | **100% — taux d'exécution 100%** |
| Score | 15–28 | **25 / 100** ✅ dans la fourchette |
| Profil détecté | — | **Mixte** |
| Ratio directionnel | ~50% | **50% — sens dominant SELL** |
| Espacement grille | — | **3%** |
| Durée moyenne détention | — | **55.4 h** |
| Lecture comportementale | — | **Irrégulier — alternance discipline / impulsivité** |
| Crash / NaN / freeze | Aucun | **Aucun** |

### Résumé comportemental UI

- Profil mixte sans stratégie dominante claire
- Alternance discipline / impulsivité
- Lecture "Irrégulier"
- Activité burst dense (59 clusters grid)
- Espacement grille 3% — structure de carnet présente mais non dominante
- Durée moyenne 55.4h — détention intermédiaire (entre le scalping REAL_002 et le swing REAL_001)

---

## 15. Analyse runtime — groupGridTrades() et écart prédiction / terrain

### groupGridTrades()

```
[bhv:grid] 542 trades → 390 (groupes: 59, absorbés: 211)
```

| Métrique grouper | Valeur |
|-----------------|--------|
| Trades entrants | 542 |
| Trades sortants | 390 |
| Groupes créés | **59** |
| Trades absorbés | **211** |
| Taux d'absorption | **38.9%** |

### Comparaison grouper Phase 4

| Dataset | Trades in | Trades out | Groupes | Absorbés | Taux absorption |
|---------|-----------|------------|---------|----------|----------------|
| REAL_001 | 1685 | 1501 | 71 | 255 | 15.1% |
| REAL_002 | 120 | 108 | 4 | 16 | 13.3% |
| **REAL_003** | **542** | **390** | **59** | **211** | **38.9%** |

**Observation critique :** REAL_003 a un taux d'absorption de **38.9%** — plus de 2× supérieur à REAL_001 (15.1%) et REAL_002 (13.3%). Avec seulement 542 trades entrants, 59 groupes sont créés, soit un ratio groupes/trades de **10.9%** (vs 4.2% pour REAL_001). Cela confirme que les 542 trades REAL_003 sont concentrés en clusters denses plutôt que distribués régulièrement dans le temps.

La prévision de 20–50 groupes était proche — 59 groupes observés dépasse légèrement la borne haute. La forte densité burst de TAOUSDC (39.7% de gaps ≤ 3min same-side en pré-terrain) était le bon indicateur.

### Analyse de l'écart prédiction / terrain

**Prédit : 15–28 — Observé : 25**

Score dans la fourchette. L'écart entre la borne haute (28) et l'observé (25) s'explique par :

| Facteur | Contribution estimée |
|---------|---------------------|
| `size_inconsistency` (CV=1.058) | Pénalité — confirmé par profil Mixte |
| `oversizedTradesCount` (67 pre-grouper) | Pénalité −10 hors cap — amplifiée post-grouper |
| Amplification post-grouper LS-3 | 59 groupes → CV et oversized recalculés sur 390 trades avec groupes Σ-value |
| Multi-actifs modéré LS-1 | Contribution partielle au CV |
| 5.6 mois LS-4 | Score moyen sur période modérément hétérogène |
| Burst TAOUSDC (overtrading local) | Pénalité liée à la densité des clusters |

Le score de 25 (fourchette basse) plutôt que 28 (borne haute) s'explique par l'impact grouper plus fort que prévu (59 groupes vs estimation 20–50), amplifiée par les effets LS-3 post-consolidation.

---

## 16. Anomalies et classifications finales

| Anomalie | Type | Décision |
|----------|------|---------|
| CV=1.058 → `size_inconsistency` | BC/LS-1 | Mix signal réel (tailles hétérogènes TAOUSDC) + légère distorsion multi-actifs. Moins structurel que REAL_001, comparable à REAL_002 — partiellement comportemental |
| oversizedTradesCount=67 | BC/LS-2 | Partiellement comportemental (grosses positions sur TAOUSDC) + partiellement structurel (multi-actifs). Amplification post-grouper attendue |
| 59 groupes / 211 absorbés (38.9%) | AG/LS-3 | Amplification post-grouper active — contribution principale au score 25 vs 28. Taux d'absorption 2.5× REAL_001 malgré 3× moins de trades |
| Profil Mixte / Irrégulier | BC | Lecture comportementale cohérente avec un historique multi-actifs 5.6 mois sans stratégie dominante stabilisée |
| Durée détention 55.4h | Observ. | Intermédiaire entre REAL_002 (scalping court) et REAL_001 (~65h swing) — cohérent avec un comportement de transition |
| Espacement grille 3% | BC | Structure de carnet présente mais non dominante — cohérent avec le profil Mixte (vs Range/Carnet REAL_002) |
| ONDOUSDC 1 BUY / 11 SELL | BC | Exit progressive confirmée. Sans impact sur les métriques globales |
| BTCEUR 1 trade EUR | Observ. | Aucun impact terrain observable |

---

## 17. Conclusion finale — REAL_003

### Pipeline

**Le parser Order History est validé une deuxième fois sur données réelles.** Format détecté sans ambiguïté (`Statut` → ORDER_HISTORY), `mapOrderRows()` activé, 542/542 trades importés sans correction. REAL_003 confirme la stabilité du pipeline Order History sur un dataset multi-actifs de période intermédiaire.

### groupGridTrades()

**59 groupes créés, 211 trades absorbés (38.9%).** C'est le taux d'absorption le plus élevé observé en Phase 4 — 2.5× REAL_001 et 3× REAL_002. Cela révèle une caractéristique comportementale forte de ce dataset : les 542 trades TAOUSDC sont structurés en clusters denses plutôt qu'en activité régulière. Le grouper est ici l'opérateur analytique le plus actif du pipeline — son impact sur les métriques post-grouper est central.

### Scoring et lisibilité comportementale

**Le score de 25/100 est analytiquement cohérent.** Il confirme la position intermédiaire prédite de REAL_003 entre REAL_001 (score 15, chaos multi-actifs) et REAL_002 (score 37, mono-actif lisible). Le profil "Mixte / Irrégulier" reflète fidèlement un historique de 5.6 mois sur 10 actifs sans stratégie dominante stabilisée.

**Le spectre Phase 4 est maintenant documenté sur 3 points :**

| Dataset | Score | Profil | Grouper | Lisibilité |
|---------|-------|--------|---------|-----------|
| REAL_001 | 15 | Mixte / Irrégulière | 71 groupes / 15.1% | Faible |
| **REAL_003** | **25** | **Mixte / Irrégulier** | **59 groupes / 38.9%** | **Intermédiaire** |
| REAL_002 | 37 | Range / Carnet d'ordres | 4 groupes / 13.3% | Haute |

**Règle dégagée :** le taux d'absorption grouper (et non le nombre absolu de groupes) est un meilleur prédicteur de la distorsion métriques. REAL_003 (38.9%) est plus distordu que REAL_001 (15.1%) en termes d'impact relatif sur les métriques, malgré un score légèrement supérieur (25 vs 15) — l'atténuation des LS-1 (10 actifs) et LS-4 (5.6 mois) compense partiellement la distorsion grouper.

### Validation des limites LS

| Limite | Statut après REAL_003 |
|--------|-----------------------|
| LS-1 — CV multi-actifs | **Partielle.** CV=1.058 sur 10 actifs — moins sévère que REAL_001 (2.478/64 actifs). Mix signal réel + légère distorsion structurelle. |
| LS-2 — oversizedTradesCount | **Partielle.** 67 oversized pré-grouper, amplifiés post-grouper. Partiellement comportemental. |
| LS-3 — Amplification post-grouper | **Confirmée et renforcée.** Taux 38.9% est le maximum observé — révèle que le taux d'absorption est un meilleur indicateur que le nombre de groupes. |
| LS-4 — Score multi-phases | **Confirmée modérée.** 5.6 mois = profil Mixte, lecture "Irrégulier" — comportement moins homogène que REAL_002 (47j), plus lisible que REAL_001 (25 mois). |

### Continuité comportementale Phase 4

REAL_003 établit qu'il existe une **continuité analytique crédible** entre les trois datasets réels :

- Plus le dataset est homogène (mono-actif, courte période) → plus la lecture comportementale est directe
- Plus le dataset est multi-actifs / burst dense → plus le score se dégrade structurellement via LS-1, LS-3, LS-4
- Cette continuité est prédictible à partir des métriques pré-terrain (CV, taux gap, nombre d'actifs, durée)

**Le pipeline Binance est maintenant validé terrain sur :**
- Trade History ✅ (REAL_002)
- Order History ✅ (REAL_001, REAL_003)
- Mono-actif ✅ (REAL_002)
- Multi-actifs modéré ✅ (REAL_003)
- Multi-actifs extrême ✅ (REAL_001)
- Courte période ✅ (REAL_002)
- Période intermédiaire ✅ (REAL_003)
- Longue période ✅ (REAL_001)
- Forte densité grouper ✅ (REAL_001, REAL_003)

### Décision finale

**→ REAL_003 : VALIDATED**

| Critère | Résultat |
|---------|---------|
| Import sans erreur | ✅ |
| Parser Order History validé terrain (2ème confirmation) | ✅ |
| groupGridTrades() validé (59 groupes) | ✅ |
| Stabilité UI (no crash, no NaN, no freeze) | ✅ |
| Score dans la fourchette prédite (25 dans 15–28) | ✅ |
| Profil comportemental cohérent avec les données | ✅ |
| Limites LS contextualisées (LS-3 renforcée) | ✅ |
| Position intermédiaire Phase 4 confirmée | ✅ |
| Dataset utilisable comme référence Phase 4 | ✅ |

REAL_003 est accepté comme **troisième dataset de référence Phase 4** et **dataset intermédiaire officiel**. Il établit le lien analytique entre le chaos multi-actifs (REAL_001) et l'homogénéité lisible (REAL_002), et fournit la première mesure du taux d'absorption grouper comme indicateur de distorsion métriques.
