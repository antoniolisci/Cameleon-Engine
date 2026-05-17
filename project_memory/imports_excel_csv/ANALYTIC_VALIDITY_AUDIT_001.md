# ANALYTIC_VALIDITY_AUDIT_001 — Validité analytique minimale du pipeline comportemental

**Date :** 2026-05-17  
**Contexte déclencheur :** Import réel avec 2 trades SELL-only, fenêtre temporelle très courte.  
**Résultat observé :** score 100, profil "Discipliné", 0 pattern détecté.  
**Diagnostic :** lecture comportementale artificiellement propre sur un dataset insuffisant.

---

## 1. Analyse du cas déclencheur — pourquoi le score est 100

Avec 2 trades SELL-only :

### patterns.js
| Pattern | Condition bloquante | Résultat |
|---------|-------------------|---------|
| `overtrading` | ≥ 5 trades par symbole dans une fenêtre de 60 min | impossible avec 2 trades → `null` |
| `revenge_trading` | séquence SELL → BUY (même symbole) | impossible sans BUY → `null` |
| `rapid_reentry` | séquence BUY → SELL → BUY | impossible sans BUY → `null` |
| `size_inconsistency` | `sorted.length < SIZE_MIN_TRADES (5)` | guard explicite ligne 274 → `null` |
| `loss_chasing` | 3 BUYs consécutifs croissants | impossible sans BUY → `null` |

**Résultat : `patterns = []` — aucun pattern ne peut être déclenché.**

### scoring.js — computeScore
- `patternPenalty = 0` (pas de patterns)
- `oversizedTradesCount < 3` → pas de pénalité (avec 2 trades, impossible d'atteindre 3)
- `paceDelay` = `avgTimeBetweenSameSymbol ?? avgTimeBetween` → si les 2 SELLs sont sur des symboles différents, chaque symbole n'a qu'1 trade → `avgTimeBetweenSameSymbol = null`; si même symbole, délai calculé sur 1 gap — peut être court mais isolé
- **score = 100, profil = "Discipliné"**

### coaching.js — computeCoaching
- Aucun pattern → `orderedTypes = []` → `tips = []`
- Concentration horaire : `activeHours = 1` (2 trades dans le même créneau) → conseil "concentrer" déclenché si `activeHours <= 5`, mais ce conseil est cosmétique pour 2 trades

**Conclusion : le pipeline produit un résultat techniquement correct mais analytiquement vide. Il n'y a pas de bug — il n'y a pas de garde-fou sur la qualité du dataset.**

---

## 2. Seuils minimaux actuels dans le code (existants, non documentés)

Ces seuils existent mais sont des **seuils de déclenchement de patterns**, pas des **seuils de fiabilité globale**.

| Seuil | Fichier | Ligne | Valeur | Usage actuel |
|-------|---------|-------|--------|-------------|
| `detectPatterns` guard | `patterns.js` | 45 | `< 2 trades` | empêche tout calcul sous 2 trades |
| `SIZE_MIN_TRADES` | `patterns.js` | 33 | `5` | guard `size_inconsistency` |
| `OVERTRADING_MIN_TRADES` | `patterns.js` | 19 | `5` par fenêtre | seuil de déclenchement |
| `LC_MIN_SEQUENCE` | `patterns.js` | 38 | `3 BUYs` | loss_chasing minimum |
| `SIZE_MIN_TRADES_PER_SYMBOL` | `metrics.js` | 101 | `3` | CV par symbole |
| `computeMetrics` guard | `metrics.js` | 9 | `length === 0` | retourne null si vide |
| `computeScore` guard | `scoring.js` | 136 | `!metrics` | retourne null si metrics null |

**Aucun de ces seuils ne porte sur la qualité analytique globale du dataset.** Ils protègent contre les divisions par zéro ou les calculs sans sens statistique, mais ne signalent pas qu'une analyse sur 2 trades est non fiable.

---

## 3. Conditions minimales de fiabilité analytique — définition proposée

### 3.1 — Minimum trades

**Seuil plancher absolu : 5 trades**
- En dessous de 5 : `size_inconsistency` est structurellement silencieux (`SIZE_MIN_TRADES = 5`)
- En dessous de 5 : aucun pattern de timing (overtrading, rapid_reentry) ne peut s'activer de manière significative
- 5 trades = seuil déjà implicite dans le code pour le pattern le plus basic

**Seuil de fiabilité partielle : 10 trades**
- En dessous de 10 : `overtrading` (besoin de 5 par fenêtre × plusieurs fenêtres) ne peut produire qu'1–2 déclenchements
- `loss_chasing` nécessite 3 BUYs sur le même symbole dans 120 min : difficile sous 10 trades totaux sauf dataset mono-symbole très concentré
- Métriques de timing (avgTimeBetween, avgTimeBetweenSameSymbol) statistiquement fragiles

**Seuil de fiabilité complète : 20 trades**
- Tous les patterns peuvent s'activer
- CV de taille statistiquement robuste (≥ 3 trades par symbole pour plusieurs symboles)
- Métriques de délai représentatives
- Correspond approximativement à 1–2 jours de trading actif

### 3.2 — Minimum BUY/SELL

**Nécessité fonctionnelle de trades BUY :**
- `revenge_trading` : requiert un BUY après un SELL
- `rapid_reentry` : requiert BUY → SELL → BUY
- `loss_chasing` : requiert 3 BUYs consécutifs
- `size_inconsistency` : neutre (fonctionne sur tous les trades)
- `overtrading` : neutre (fonctionne sur tous les trades par symbole)

**Un dataset SELL-only neutralise 3 patterns sur 5 par construction.**

Seuil proposé : au moins 1 trade BUY pour que l'analyse ne soit pas structurellement borgne.  
Seuil de fiabilité : ratio BUY/(BUY+SELL) entre 0.25 et 0.75 pour une analyse équilibrée.

### 3.3 — Minimum période

**Période très courte (< 1 heure) :**
- `overtrading` : fenêtre de 60 min — avec une période totale < 1h, une seule fenêtre couvre tout le dataset ; le pattern se déclenche ou ne se déclenche pas globalement (pas de tendance)
- `loss_chasing` : fenêtre de 120 min — couverte entièrement par la période → pas de mesure temporelle réelle
- `avgTimeBetween`, `spanDays` : valeurs trop faibles pour être représentatives d'un comportement habituel

**Seuil plancher : spanDays >= 0.5 (12 heures)**
- En dessous : impossible de distinguer une session ponctuelle d'un comportement habituel
**Seuil de fiabilité : spanDays >= 3 jours**
- En dessous de 3 jours : les patterns sont présents ou absents par chance de dataset, pas par habitude réelle

### 3.4 — Minimum diversité temporelle

`activeHours` est déjà calculé dans `metrics.js` (heures UTC distinctes avec au moins 1 trade).  
Actuellement utilisé uniquement dans `coaching.js` ligne 113 pour un conseil mineur (`activeHours <= 5`).

**Seuil proposé pour la fiabilité :**
- `activeHours = 1` : session ultra-concentrée — profil temporel non représentatif
- `activeHours <= 2` : lecture comportementale temporelle impossible
- `activeHours >= 4` : diversité temporelle minimale acceptable

---

## 4. Points d'injection d'un score de fiabilité dataset

### 4.1 — `computeMetrics` (metrics.js)

**Localisation :** fin de la fonction, avant le `return`.  
**Rôle :** c'est ici que toutes les métriques brutes sont disponibles (totalTrades, buyCount, sellCount, spanDays, activeHours).  
**Action proposée :** calculer et inclure un objet `dataQuality` dans le retour de `computeMetrics`.

```javascript
// Proposition — non implémenté
return {
  // ... métriques existantes ...
  dataQuality: computeDataQuality(total, buyCount, sellCount, spanDays, activeHours)
};
```

### 4.2 — `computeScore` (scoring.js)

**Localisation :** début de la fonction, après le guard `!metrics`.  
**Rôle :** c'est le point de calcul du score — c'est ici que le résultat final est produit.  
**Action proposée :** retourner une propriété `reliability` dans le résultat (LOW / PARTIAL / HIGH), sans modifier le score calculé.

Deux approches possibles (voir section 5) :
- Approche A : garder score 100 mais marquer `reliability: 'LOW'` → l'UI affiche un avertissement
- Approche B : cap le score à 50 si `reliability: 'LOW'` → score neutre plutôt qu'artificiellement élevé

### 4.3 — `detectPatterns` (patterns.js)

**Localisation :** début de la fonction.  
**Rôle :** détection des patterns — point naturel pour une annotation de contexte.  
**Action proposée :** aucune modification du calcul, mais retourner un `analysisContext` indiquant quels patterns étaient structurellement inévaluables.

```javascript
// Proposition — non implémenté
return {
  patterns: detected,
  analysisContext: {
    buyOnlyDataset:   buyCount === 0,
    sellOnlyDataset:  sellCount === 0,
    insufficientSize: trades.length < 5,
    skippedPatterns:  [...] // liste des patterns non évaluables
  }
};
```

### 4.4 — `behavior-view.js` (UI)

**Non lu dans cet audit** — à vérifier.  
**Action probable :** afficher un bandeau "Données insuffisantes — analyse indicative uniquement" quand `reliability !== 'HIGH'`.

---

## 5. Logique "confidence / fiabilité dataset" — proposition d'architecture

### Objet `dataQuality` proposé

```javascript
// Calculé dans computeMetrics() ou en amont de computeScore()
{
  level:          'LOW' | 'PARTIAL' | 'HIGH',  // synthèse globale
  tradeCount:     2,                            // totalTrades
  hasBuys:        false,                        // buyCount > 0
  hasSells:       true,                         // sellCount > 0
  spanDays:       0.01,                         // durée totale en jours
  activeHours:    1,                            // heures UTC distinctes
  reasons: [                                    // liste des limitations actives
    'SELL_ONLY',        // aucun trade BUY → 3 patterns sur 5 inévaluables
    'TOO_FEW_TRADES',   // < 5 trades → size_inconsistency muet par construction
    'TOO_SHORT',        // spanDays < 0.5 → fenêtres temporelles non représentatives
    'CONCENTRATED',     // activeHours <= 2 → pas de diversité horaire
  ]
}
```

### Règles de calcul du niveau

| Condition | `level` |
|-----------|---------|
| `totalTrades >= 20` ET `hasBuys` ET `hasSells` ET `spanDays >= 3` ET `activeHours >= 4` | `HIGH` |
| `totalTrades >= 10` ET (`hasBuys` OU `hasSells`) ET `spanDays >= 1` | `PARTIAL` |
| Tout autre cas | `LOW` |

### Propagation dans le pipeline

```
computeMetrics()   → { ...métriques, dataQuality }
      ↓
computeScore()     → { score, profile, ..., dataQuality }   [transmis tel quel]
      ↓
computeCoaching()  → { priority, tips, ..., dataQuality }   [transmis tel quel]
      ↓
behavior-view.js   → affiche avertissement si dataQuality.level !== 'HIGH'
```

---

## 6. Les quatre états — définition et critères

### État 1 — Import valide
**Définition :** le fichier a été parsé sans erreur, des trades ont été extraits.  
**Critère :** `trades.length > 0` ET aucune erreur de parsing  
**État actuel du pipeline :** géré — c'est le résultat de `importBinanceSpot()` → `ok: true`  
**Aucune modification nécessaire à ce niveau.**

### État 2 — Analyse exploitable
**Définition :** le dataset est suffisamment riche pour que tous les patterns puissent s'activer.  
**Critères :**
- `totalTrades >= 20`
- `buyCount > 0` ET `sellCount > 0`
- `spanDays >= 3`
- `activeHours >= 4`

**Lien code :** tous les seuils internes de `patterns.js` sont franchissables.  
**Message UI proposé :** aucun avertissement — analyse affichée normalement.

### État 3 — Analyse partielle
**Définition :** le dataset permet d'évaluer certains patterns mais pas tous.  
**Critères :**
- `totalTrades >= 5` ET `totalTrades < 20`  
  OU `spanDays < 3`  
  OU `buyCount === 0` OU `sellCount === 0`

**Patterns structurellement inévaluables selon le cas :**
- SELL-only → revenge_trading, rapid_reentry, loss_chasing inévaluables
- BUY-only → revenge_trading, rapid_reentry inévaluables
- < 5 trades → size_inconsistency inévaluable
- < 5 trades par fenêtre → overtrading difficile à déclencher

**Message UI proposé :** "Analyse partielle — certains comportements ne peuvent pas être évalués sur ce dataset."

### État 4 — Analyse non fiable
**Définition :** le dataset est trop petit ou trop homogène pour produire un signal comportemental fiable.  
**Critères :**
- `totalTrades < 5`  
  OU `spanDays < 0.5`  
  ET (`buyCount === 0` OU `sellCount === 0`)

**Cas déclencheur de cet audit :** 2 trades SELL-only, fenêtre < 1 heure → État 4.  
**Message UI proposé :** "Données insuffisantes — le score affiché n'est pas représentatif."  
**Score :** à discuter — cap à 50 (neutre) ou conservation avec avertissement visible.

---

## 7. Cas du score 100 artificiel — deux approches de correction

### Approche A — Score conservé, indicateur de fiabilité ajouté (non intrusif)
- Le score 100 reste affiché
- Un bandeau ou badge "Fiabilité : faible — 2 trades SELL-only" est affiché
- Avantage : aucune modification de la logique de scoring
- Inconvénient : l'utilisateur peut ignorer le bandeau et retenir "100 / Discipliné"

### Approche B — Score neutralisé (cap à 50) si `dataQuality.level === 'LOW'`
- Le score est réduit à 50 (zone neutre Réactif/Impulsif) — ni récompensé ni pénalisé
- Le profil affiché : "Données insuffisantes" (nouveau profil synthétique) ou "Non évaluable"
- Avantage : impossibilité de lire "100 / Discipliné" sur 2 trades
- Inconvénient : modification de `computeScore()`, risque de casser des tests futurs

### Approche C — Résultat bloqué avant scoring
- `detectPatterns()` ou `computeScore()` retourne `null` si `dataQuality.level === 'LOW'`
- L'UI affiche uniquement "Dataset insuffisant pour l'analyse comportementale"
- Avantage : le plus propre — pas de score ambigu
- Inconvénient : perd les métriques factuelles (totalTrades, spanDays) qui pourraient être affichées

**Recommandation :** Approche A en priorité (non intrusif, découplé), Approche C si le résultat "100 / Discipliné" est jugé trop trompeur.

---

## 8. Tableau de synthèse — seuils proposés

| Dimension | Fiabilité LOW | Fiabilité PARTIAL | Fiabilité HIGH |
|-----------|--------------|-----------------|---------------|
| Nombre de trades | < 5 | 5–19 | ≥ 20 |
| Présence BUY | aucun | au moins 1 | ratio 0.25–0.75 |
| Présence SELL | aucun | au moins 1 | ratio 0.25–0.75 |
| Durée (spanDays) | < 0.5 | 0.5–2.9 | ≥ 3 |
| Diversité horaire (activeHours) | ≤ 2 | 3–3 | ≥ 4 |

> Ces seuils sont des propositions analytiques basées sur les gardes existants dans le code.
> Ils doivent être validés empiriquement sur des datasets réels avant implémentation.

---

## 9. Fichiers concernés par une future implémentation

| Fichier | Rôle dans l'implémentation | Priorité |
|---------|--------------------------|---------|
| `src/js/behavior/analytics/metrics.js` | Calculer `dataQuality` dans `computeMetrics()` | 1 |
| `src/js/behavior/analytics/scoring.js` | Transmettre `dataQuality` + optionnel : cap score | 2 |
| `src/js/behavior/analytics/patterns.js` | Annoter les patterns inévaluables (optionnel) | 3 |
| `src/js/behavior/ui/behavior-view.js` | Afficher avertissement selon `dataQuality.level` | 2 |
| `src/js/behavior/analytics/coaching.js` | Transmettre `dataQuality` (pass-through) | 4 |

---

## 10. Statut

**Audit documentaire uniquement — aucune modification du code.**  
Décisions de design et seuils à valider avant implémentation.  
Approche d'implémentation (A / B / C) à choisir.

---

## Commits liés

- Cet audit : à commiter séparément (docs only)
