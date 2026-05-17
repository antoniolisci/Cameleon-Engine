# ANALYTIC_RELIABILITY_ARCHITECTURE_001 — Architecture fiabilité analytique dataset

**Date :** 2026-05-17  
**Contexte :** Audit ANALYTIC_VALIDITY_AUDIT_001 établit le problème (score 100 artificiel sur dataset insuffisant).  
**Objectif :** proposition d'implémentation minimaliste — décision de design et points d'injection précis.  
**Statut :** proposition validée à implémenter — aucune modification de code dans ce fichier.

---

## 1. Principe directeur

**Un seul calcul, une seule propagation, un seul affichage.**

- `dataQuality` est calculé **une fois** dans `computeMetrics()`
- Il est **transmis en pass-through** sans logique ajoutée jusqu'à la vue
- `behavior-view.js` **l'affiche** sous forme de bandeau conditionnel
- Le score n'est **pas modifié** — le moteur reste intact

Aucune duplication. Aucun nouveau module. Aucun impact sur le moteur principal.

---

## 2. Les 4 fichiers concernés — audit des points d'injection

### 2.1 — `metrics.js` ✅ Point d'injection principal

**Rôle :** calcule toutes les métriques brutes. C'est ici que `totalTrades`, `buyCount`, `sellCount`, `spanDays` et `activeHours` sont disponibles simultanément.

**Ce qui existe déjà :**
```javascript
return {
  totalTrades, hourDist, avgSize, avgTimeBetween, spanDays, firstTs, lastTs,
  buyCount, sellCount, avgBuySize, avgSellSize, avgDelayAfterBuy, avgDelayAfterSell,
  oversizedTradesCount, activeHours, avgTimeBetweenSameSymbol, maxSizeCVBySymbol
};
```

**Point d'injection :** avant le `return`, ajouter `dataQuality: computeDataQuality(...)`.  
**Dépendances :** zéro — utilise uniquement les variables déjà calculées dans la même fonction.  
**Modification : +1 helper pur + 1 ligne dans le return.**

---

### 2.2 — `scoring.js` — Pass-through uniquement

**Rôle :** calcule le score comportemental. Reçoit `metrics` en paramètre.

**Ce qui existe :**
```javascript
function computeScore(patterns, metrics, gridContext = null) {
  // ...
  return { score, profile, dominantRisk, interpretation, gridContextApplied };
}
```

**Point d'injection :** ajouter `dataQuality: metrics.dataQuality ?? null` dans le return.  
**Aucune logique de scoring modifiée. Aucune condition ajoutée.**  
**Modification : +1 propriété dans le return.**

Résultat : `behavior-view.js` peut lire `score.dataQuality` directement.

---

### 2.3 — `patterns.js` — Aucune modification en V1

**Rôle :** détecte les patterns comportementaux.

**Ce qui existe :** guard `trades.length < 2` (ligne 45).

**Constat :** les guards de détection individuels (SIZE_MIN_TRADES = 5, LC_MIN_SEQUENCE = 3, etc.) font déjà le travail de ne pas produire de faux positifs. Annoter les patterns "non évaluables" est utile mais non critique pour V1.

**Décision :** pas de modification en V1.  
**Évolution future possible :** retourner `{ patterns, unevaluable: ['revenge_trading', 'rapid_reentry', 'loss_chasing'] }` quand `buyCount === 0` — utile pour un affichage détaillé en V2.

---

### 2.4 — `behavior-view.js` — Point d'affichage

**Rôle :** orchestre le rendu HTML. C'est ici que le bandeau doit apparaître.

**Ce qui existe — pattern identique déjà en place :**
```javascript
// behavior-view.js ligne 339 — validationWarning banner
const warningBanner = state.validationWarning
  ? `<div class="bhv-msg bhv-msg--warn">⚠️ Analyse potentiellement non fiable — format non standard</div>`
  : '';

// behavior-view.js ligne 354 — gridContext banner
const gridContextBanner = score?.gridContextApplied
  ? `<div class="bhv-msg bhv-msg--grid-context">Profil grille récent détecté...</div>`
  : '';
```

**Point d'injection :** dans `buildAnalysis()`, ajouter un `reliabilityBanner` du même type, injecté entre `gridContextBanner` et `buildScoreCard()`.

**Modification : +1 helper `buildReliabilityBanner()` + 2 lignes dans `buildAnalysis()`.**

---

## 3. Architecture cible — flux de données

```
computeMetrics(trades)
    ↓ calcule totalTrades, buyCount, sellCount, spanDays, activeHours
    ↓ [NOUVEAU] computeDataQuality() → { level, reasons, ... }
    ↓ return { ...métriques, dataQuality }

computeScore(patterns, metrics, gridContext)
    ↓ [NOUVEAU] transmet metrics.dataQuality dans le return
    ↓ return { score, profile, ..., dataQuality }     ← pass-through pur

behavior-view.js — mount()
    ↓ score = computeScore(...)                        ← score.dataQuality disponible
    ↓ render(root, { ..., score })

behavior-view.js — buildAnalysis()
    ↓ [NOUVEAU] const reliabilityBanner = buildReliabilityBanner(score?.dataQuality)
    ↓ injection avant buildScoreCard()
```

**coaching.js** : non modifié. Il reçoit `scoreData` mais n'a pas besoin de `dataQuality` en V1.  
**behavior-analyzer.js** : non modifié. Les sessions sauvegardées héritent naturellement du `dataQuality` calculé à l'import.

---

## 4. Spécification de `computeDataQuality()`

### Entrées
Toutes disponibles dans `computeMetrics()` après leur calcul :
- `total` (= totalTrades)
- `buyCount`
- `sellCount`
- `spanDays`
- `activeHours`

### Logique de niveau

| Condition | `level` |
|-----------|---------|
| Aucune raison + `total >= 20` + `spanDays >= 3` + `activeHours >= 4` | `'HIGH'` |
| `total < 5` OU (`sellCount === 0` ET `buyCount === 0`) | `'LOW'` |
| Raison présente mais `total >= 5` ET au moins un côté présent | `'PARTIAL'` |

En pratique, `level` se résout ainsi :
```
LOW    → total < 5, OU période < 0.5j ET côté manquant
PARTIAL → au moins une raison, mais dataset utilisable partiellement
HIGH   → toutes les conditions de fiabilité remplies
```

### Raisons disponibles
```
'TOO_FEW_TRADES'   total < 5          → size_inconsistency muet + tous les patterns affaiblis
'SELL_ONLY'        buyCount === 0     → revenge, rapid_reentry, loss_chasing inévaluables (3/5)
'BUY_ONLY'         sellCount === 0    → revenge, rapid_reentry inévaluables (2/5)
'TOO_SHORT'        spanDays < 0.5     → fenêtres temporelles non représentatives
'CONCENTRATED'     activeHours <= 2   → session ultra-concentrée, pas de diversité horaire
```

### Objet retourné
```javascript
{
  level:       'LOW' | 'PARTIAL' | 'HIGH',
  reasons:     string[],   // liste des raisons actives (peut être vide si HIGH)
  tradeCount:  number,
  spanDays:    number,
  activeHours: number
}
```

---

## 5. Spécification de `buildReliabilityBanner(dataQuality)`

### Règle d'affichage
- `level === 'HIGH'` → retourne `''` (aucun bandeau)
- `level === 'LOW'`  → bandeau orange/warn — lecture non fiable
- `level === 'PARTIAL'` → bandeau neutre/info — analyse partielle

### CSS — zéro nouvelle classe nécessaire

Réutilisation des classes existantes :
- `bhv-msg--warn` (jaune) pour `LOW` — aligné avec `validationWarning`
- `bhv-msg--info` ou `bhv-msg--grid-context` (neutre) pour `PARTIAL`

Si une classe dédiée est souhaitée pour l'identité visuelle (`bhv-msg--reliability`), elle peut hériter visuellement de `--info`.

### Messages UX

**LOW — Données insuffisantes :**
```
"Données insuffisantes — lecture indicative uniquement (2 trades · 0h)."
```

**LOW — SELL-only + peu de trades :**
```
"Données insuffisantes — lecture indicative uniquement (2 trades SELL · 12 min)."
```

**PARTIAL — SELL-only :**
```
"Analyse partielle — aucun achat détecté, 3 patterns sur 5 non évaluables."
```

**PARTIAL — Trop peu de trades :**
```
"Analyse partielle — 8 trades · certains patterns nécessitent un historique plus long."
```

**PARTIAL — Période trop courte :**
```
"Analyse partielle — fenêtre courte (4 h) · les fenêtres temporelles peuvent être incomplètes."
```

**PARTIAL — Plusieurs raisons :**
```
"Analyse partielle — 7 trades SELL uniquement · lecture comportementale limitée."
```

### Principe de formulation

- Toujours commencer par **"Données insuffisantes"** (LOW) ou **"Analyse partielle"** (PARTIAL)
- Toujours donner **un fait mesurable** entre parenthèses ou après tiret
- Jamais de majuscules sur le contenu, jamais de ponctuation finale forcée
- Pas de jugement comportemental dans le bandeau — uniquement un constat factuel sur le dataset
- Le score reste visible en dessous — le bandeau avertit, il ne cache pas

---

## 6. Trois états distincts — définition V1

### État 1 — Import valide
**Définition :** le fichier a été parsé, des trades ont été extraits.  
**Indicateur :** `trades.length > 0`, pas d'`importError`.  
**Affiché :** `importInfo` → "N trades importés" dans la carte import.  
**Déjà géré.** Aucune modification nécessaire.

---

### État 2 — Analyse partielle
**Définition :** dataset utilisable mais incomplet sur une ou plusieurs dimensions.  
**Indicateur :** `dataQuality.level === 'PARTIAL'`  
**Triggers :** SELL-only / BUY-only / < 20 trades / spanDays < 3 / activeHours <= 2  
**Affiché :** bandeau neutre au-dessus du score card (`bhv-msg--info` ou dédié).  
**Le score reste visible.** Les patterns détectés sont affichés normalement.  
**Message :** "Analyse partielle — [raison principale mesurable]."

---

### État 3 — Analyse fiable
**Définition :** toutes les conditions de fiabilité minimales sont remplies.  
**Indicateur :** `dataQuality.level === 'HIGH'`  
**Triggers :** ≥ 20 trades, BUY + SELL, ≥ 3 jours, ≥ 4 heures actives  
**Affiché :** aucun bandeau de fiabilité — analyse affichée sans avertissement.

> Note : État 1 (import valide) et État 2/3 (analyse) sont orthogonaux.  
> Un import valide peut produire une analyse partielle ou fiable selon le contenu.

---

## 7. Ce qui NE change PAS

| Composant | Statut |
|-----------|--------|
| Score 0–100 | **inchangé** — la formule de calcul reste identique |
| Profils (Discipliné / Réactif / Impulsif / Agressif) | **inchangés** |
| Seuils de détection patterns | **inchangés** |
| Logique coaching | **inchangée** |
| Moteur principal (engine.js, decision.js, etc.) | **non impacté** |
| Bridge comportemental (behavior-bridge.js) | **non modifié** |
| Sessions sauvegardées | **non impactées** (pas de rétroactivité) |
| Isolation contract behavior module | **respecté** |

---

## 8. Estimation de l'implémentation

| Fichier | Changements | Lignes estimées |
|---------|------------|-----------------|
| `metrics.js` | +1 helper `computeDataQuality()` + 1 ligne return | ~25 lignes |
| `scoring.js` | +1 propriété dans return | 1 ligne |
| `behavior-view.js` | +1 helper `buildReliabilityBanner()` + 2 lignes dans `buildAnalysis()` | ~30 lignes |
| `behavior.css` | optionnel — 0 si réutilisation CSS existant | 0–10 lignes |

**Total : ~55 lignes de code net. Zéro régression possible sur le moteur.**

---

## 9. Cas d'usage validés par cette architecture

| Dataset | `dataQuality.level` | Bandeau affiché |
|---------|-------------------|----------------|
| 2 trades SELL-only, 12 min | `LOW` | "Données insuffisantes — lecture indicative uniquement (2 trades SELL · 12 min)." |
| 8 trades SELL-only, 2h | `LOW` | "Données insuffisantes — lecture indicative uniquement (8 trades SELL · 2h)." |
| 15 trades BUY+SELL, 1j | `PARTIAL` | "Analyse partielle — 15 trades · certains patterns nécessitent un historique plus long." |
| 50 trades SELL-only, 10j | `PARTIAL` | "Analyse partielle — aucun achat détecté, 3 patterns sur 5 non évaluables." |
| 25 trades BUY+SELL, 5j, 6h actives | `HIGH` | Aucun bandeau |

---

## 10. Recommandation finale

**Approche retenue : Approche A (bandeau informatif, score conservé)**

Raisons :
- Le score reste visible et comparé entre sessions — le modifier créerait des incohérences dans `buildSessionsSynthesis()`
- Le bandeau suit exactement le pattern déjà établi pour `validationWarning` et `gridContextBanner`
- Zéro impact sur le moteur de scoring — la fiabilité est une couche d'information, pas une pénalité
- Cohérent avec la philosophie local-first : l'utilisateur voit tout, l'outil avertit sans cacher

**Prochaine étape :** implémenter `computeDataQuality()` dans `metrics.js`, puis `buildReliabilityBanner()` dans `behavior-view.js`.

---

## Commits liés

- Cet audit : commit docs séparé
- Implémentation : à commiter en un seul commit groupé (`feat(behavior): add dataset reliability indicator`)
