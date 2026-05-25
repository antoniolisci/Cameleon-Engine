# PS-01 — Correction : mesure des tailles incohérentes par symbole

**Date :** 2026-05-25  
**Phase :** Phase 3 — Validation terrain  
**Fichier modifié :** `src/js/behavior/analytics/patterns.js`  
**Fonction :** `detectSizeInconsistency()`

---

## 1. Contexte V0-A

Le protocole V0-A a importé cinq exports Binance Spot Trade History réels sur le même opérateur. Sur la période 3_mois (255 trades bruts → 212 post-grouper, 8 symboles), le moteur a produit un CV de 380 % et déclenché le pattern "Tailles incohérentes" en sévérité `high`. Ce pattern était absent sur 1_semaine et 1_mois (mono-actif ou quasi mono-actif).

La suspicion terrain : le CV 380 % reflétait la diversité d'allocation entre actifs (TAOUSDC principal, 7 autres actifs mineurs), pas une incohérence de sizing réelle sur chaque actif pris individuellement.

---

## 2. Problème

### Mesure actuelle (avant correction)

`detectSizeInconsistency()` calculait un CV global en mélangeant tous les trades, tous symboles confondus :

```javascript
const sizes = sorted.map(t => tradeSize(t)).filter(q => q > 0);  // TOUS symboles
const mean = metrics.avgSize;  // moyenne globale
const variance = sizes.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / sizes.length;
const cv = Math.sqrt(variance) / mean;  // CV global multi-actifs
```

### Défaut exact

Le CV global mélange deux phénomènes distincts :

1. **Variabilité inter-symboles** — un trader alloue 200 $ sur BTC et 50 $ sur un altcoin. Ce n'est pas de l'incohérence : c'est une règle d'allocation différenciée par actif. La variance entre ces deux tailles est mécanique, pas comportementale.

2. **Variabilité intra-symbole** — sur un même actif, le trader achète parfois 200 $, parfois 50 $, sans règle discernable. C'est l'incohérence réelle qui mérite d'être signalée.

Le CV global confond les deux. Plus le trader est diversifié (nombreux actifs, tailles d'allocation différentes), plus le CV global est élevé — indépendamment de sa discipline sur chaque actif.

### Conséquence sur V0-A

- **3_mois** : 8 symboles actifs, allocation concentrée sur TAOUSDC + 7 actifs mineurs → CV global ~380% → `size_inconsistency` high → pénalité 25 pts dans le scoring.
- **6_mois** : même effet probable (même opérateur, profil multi-actifs).
- Sur **1_semaine** et **1_mois** (quasi mono-actif), le CV global ≈ CV intra-symbole → pas de biais.

### Pourquoi c'est fragile

Le CV global est une mesure de dispersion statistique, pas de cohérence comportementale. Il croît mécaniquement avec :
- le nombre de symboles distincts ;
- l'écart d'allocation entre actifs (légitimes si intentionnels) ;
- les changements de prix d'un actif dans le temps (un même trade en USDT peut valoir 50 $ ou 200 $ selon le moment).

Un trader multi-actifs discipliné peut produire un CV global de 300–500 % simplement parce qu'il applique des règles d'allocation différenciées. Le pattern devient un faux positif structurel sur tout dataset multi-actifs.

---

## 3. Solution existante dans le code

`metrics.js` (v3) calculait déjà `maxSizeCVBySymbol` via `computeMaxSizeCVBySymbol()` :

```javascript
// v3 : un trader qui met 200$ sur BTC et 50$ sur un altcoin a un CV global élevé
// par design (allocation différente par actif). On calcule le CV par symbole
// et on retourne le plus élevé parmi ceux ayant assez de trades.
const maxSizeCVBySymbol = computeMaxSizeCVBySymbol(sorted, SIZE_MIN_TRADES_PER_SYMBOL);
```

Cette métrique :
- calcule le CV de taille **pour chaque symbole** séparément ;
- exige un minimum de 3 trades par symbole pour être significative ;
- retourne le **maximum** parmi tous les symboles éligibles (le pire cas intra-symbole) ;
- retourne `null` si aucun symbole n'atteint le seuil minimum.

Elle était calculée, retournée dans l'objet `metrics`, mais **ignorée** par `detectSizeInconsistency()`.

---

## 4. Correction appliquée

**Fichier :** `src/js/behavior/analytics/patterns.js`  
**Fonction :** `detectSizeInconsistency()`

Avant :
```javascript
const sizes = sorted.map(t => tradeSize(t)).filter(q => q > 0);
if (sizes.length < SIZE_MIN_TRADES) return null;
const mean = metrics.avgSize;
if (mean === 0) return null;
const variance = sizes.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / sizes.length;
const cv = Math.sqrt(variance) / mean;
```

Après :
```javascript
let cv;
if (metrics.maxSizeCVBySymbol != null) {
  cv = metrics.maxSizeCVBySymbol;
} else {
  // Fallback CV global (datasets mono-actif à faible volume ou très dispersés)
  const sizes = sorted.map(t => tradeSize(t)).filter(q => q > 0);
  if (sizes.length < SIZE_MIN_TRADES) return null;
  const mean = metrics.avgSize;
  if (mean === 0) return null;
  const variance = sizes.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / sizes.length;
  cv = Math.sqrt(variance) / mean;
}
```

**Périmètre :** 4 lignes remplacées par une branche conditionnelle. Aucun autre pattern modifié. Aucune logique de scoring modifiée. Interface utilisateur inchangée.

---

## 5. Impact attendu

### Règle générale

| Configuration dataset | Avant | Après |
|----------------------|-------|-------|
| Mono-actif, ≥3 trades | CV global = CV symbole → même résultat | Même résultat |
| Multi-actifs, ≥3 trades par symbole principal | CV global élevé (inflation inter-symboles) | CV max intra-symbole (mesure juste) |
| Multi-actifs, <3 trades par symbole | CV global | CV global (fallback) |

### Datasets V0-A — estimations

| Période | CV avant | CV après estimé | Pattern attendu |
|---------|----------|-----------------|-----------------|
| 1_semaine | ~64% (TAOUSDC only) | ~64% (identique) | Inchangé |
| 1_mois | ~150% | ~similaire (peu de diversification) | Inchangé ou réduit |
| 3_mois | ~380% | à mesurer (CV TAOUSDC seul) | Probablement supprimé ou réduit |
| 6_mois | à mesurer | à mesurer | À observer |
| 1_an | à mesurer | à mesurer | À observer |

Les valeurs "après" seront renseignées après test terrain.

---

## 6. Limites de la mesure par symbole

**Ce que le correctif résout :**
- Faux positifs sur datasets multi-actifs avec allocations différenciées.
- Confusion entre règle d'allocation intentionnelle et dérive de sizing.

**Ce que le correctif ne résout pas :**
- Si un trader est incohérent sur *tous* ses symboles simultanément, `maxSizeCVBySymbol` sera élevé et le pattern se déclenchera correctement.
- Si un trader a un seul symbole principal avec CV interne élevé (vraie incohérence), le pattern se déclenchera correctement.
- Pas de seuil de confiance statistique : un CV calculé sur 3 trades reste fragile. C'est la limite `SIZE_MIN_TRADES_PER_SYMBOL = 3` dans metrics.js — une dette séparée.
- Le descriptif UI ("autour de ta moyenne X $") réfère toujours à la moyenne globale, pas à la moyenne par symbole. Acceptable pour V1.

**Phrase de référence :**  
*Le moteur doit distinguer diversité normale et dérive comportementale réelle.*  
Ce correctif implémente exactement cette distinction pour le pattern "Tailles incohérentes".

---

## 7. Résultats avant/après — terrain

*À compléter après import des 5 datasets V0-A.*

| Période | Score avant PS-01 | Score après PS-01 | size_inconsistency avant | size_inconsistency après | CV avant | CV après |
|---------|------------------|------------------|--------------------------|--------------------------|----------|----------|
| 1_semaine | 90 | | | | | |
| 1_mois | 65 | | | | | |
| 3_mois | 15 | | | | | |
| 6_mois | 30 | | | | | |
| 1_an | 25 | | | | | |

---

## 8. Décision finale

*À compléter après validation terrain.*

Le correctif sera conservé si :
- le pattern "Tailles incohérentes" disparaît ou se réduit sur 3_mois et 6_mois ;
- les datasets mono-actifs (1_semaine, 1_mois) ne changent pas significativement ;
- aucune erreur console n'apparaît ;
- le pattern se déclenche toujours correctement sur des datasets avec variabilité intra-symbole réelle.

---

*Document de validation Phase 3 — PS-01 — 2026-05-25*
