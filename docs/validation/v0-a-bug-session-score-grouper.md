# V0-A — Bug : score moyen sessions incohérent avec score live

**Date :** 2026-05-25  
**Découvert pendant :** Phase 3 — Validation terrain V0-A  
**Statut :** diagnostiqué — correction différée après observation des 5 périodes  
**Priorité :** haute — fausse la lecture multi-sessions

---

## 1. Symptôme observé

Après sauvegarde de deux sessions :

| Session | Score affiché live | Trades |
|---------|-------------------|--------|
| 1_an | 25 / 100 | 1 435 |
| 1_semaine | 90 / 100 | 26 |

**Score moyen affiché dans la synthèse sessions : 28**  
**Score moyen attendu (moyenne des scores live) : 57,5 → 58**

Lecture comportementale affichée : "Instable — Ton comportement est dominé par des réactions."  
Alors que la session récente (1_semaine) est à 90 / 100, état Discipliné.

---

## 2. Cause racine

`analyzeSessions` ne passe pas les trades dans le grid-grouper avant de les scorer.

### Pipeline live — `behavior-view.js` lignes 105–114

```javascript
const tradesForAnalysis = groupGridTrades(trades);   // ← grouper appliqué
gridContext = readGridContext();
metrics  = computeMetrics(tradesForAnalysis);
patterns = detectPatterns(tradesForAnalysis, metrics);
score    = computeScore(patterns, metrics, gridContext);
```

### Pipeline sessions — `behavior-analyzer.js` lignes 20–22

```javascript
const metrics  = computeMetrics(s.trades);           // ← trades bruts, sans grouper
const patterns = detectPatterns(s.trades, metrics);
const result   = computeScore(patterns, metrics);    // ← sans gridContext non plus
```

### Ce qui est stocké à la sauvegarde

`saveSession(behaviorRepo.get('trades'))` — les **trades bruts** sont sauvegardés.  
Le grid-grouper tourne à l'affichage mais son résultat n'est pas persisté.  
`analyzeSessions` rescale donc chaque session sur les trades bruts sans grouper.

---

## 3. Impact par session

| Session | Trades stockés | Score live (groupés) | Score session (bruts, sans grouper) |
|---------|----------------|---------------------|-------------------------------------|
| 1_an | 1 435 bruts | 25 (sur 1 000 groupés) | ~25 (peu d'écart — absorption 38 %) |
| 1_semaine | 26 bruts | 90 (sur 5 groupés) | ~31 estimé (absorption 96 % — écart majeur) |

La session 1_semaine est la plus impactée : le grouper absorbait 25 des 26 trades (96 %). Sans grouper, le pipeline nu voit probablement de l'overtrading sur les 26 trades bruts concentrés en 3 jours sur un seul symbole. Le score chute de 90 à ~31.

Moyenne affichée : `round((~25 + ~31) / 2) ≈ 28` — cohérent avec l'observation.

---

## 4. Trois problèmes distincts

### Problème 1 — Dissociation display score / session score (principal)

Le score que l'utilisateur voit pendant l'import et le score utilisé dans `analyzeSessions` proviennent du même jeu de trades mais de pipelines différents. Ce ne sont pas les mêmes valeurs. L'interface ne l'indique pas. L'utilisateur ne peut pas le deviner.

**Fichiers concernés :**
- `src/js/behavior/analytics/behavior-analyzer.js` — ligne 20 : `computeMetrics(s.trades)` sans grouper préalable
- `src/js/behavior/ui/behavior-view.js` — ligne 105 : `groupGridTrades(trades)` présent uniquement ici

### Problème 2 — `gridContext` absent dans `analyzeSessions` (secondaire)

`computeScore(patterns, metrics, gridContext)` reçoit `null` pour `gridContext` dans `analyzeSessions`, même si un profil Order History est actif. Effet mineur comparé au problème 1.

**Fichier concerné :**
- `src/js/behavior/analytics/behavior-analyzer.js` — ligne 22 : `computeScore(patterns, metrics)` sans `gridContext`

### Problème 3 — Moyenne non pondérée par nombre de trades (choix discutable)

```javascript
// behavior-analyzer.js ligne 51
const avgScore = Math.round(scored.reduce((sum, s) => sum + s.score, 0) / scored.length);
```

Moyenne arithmétique simple — une session 1_an (1 435 trades) a le même poids qu'une session 1_semaine (26 trades). Ce comportement peut être intentionnel (chaque session = un moment, indépendamment de sa taille). Décision produit à trancher séparément.

---

## 5. Risque produit

Un utilisateur qui progresse réellement peut rester figé psychologiquement dans une ancienne lecture comportementale.

Le score moyen de 28 avec la lecture "Instable" n'est pas juste. La session 1_semaine à 90 / 100 n'existe pas dans `analyzeSessions` sous cette forme — elle y est rescorée à ~31 sur ses 26 trades bruts. L'amélioration réelle est effacée avant même d'être agrégée.

---

## 6. Correction minimale identifiée

Appliquer `groupGridTrades(s.trades)` dans `analyzeSessions` avant `computeMetrics`.

```javascript
// behavior-analyzer.js — correction ligne 20
const grouped  = groupGridTrades(s.trades);   // ← ajouter
const metrics  = computeMetrics(grouped);     // ← remplacer s.trades par grouped
const patterns = detectPatterns(grouped, metrics);
const result   = computeScore(patterns, metrics);
```

Une seule ligne ajoutée + un remplacement. Requiert l'import de `groupGridTrades` dans `behavior-analyzer.js`.

Cette correction n'est pas appliquée maintenant — le protocole d'observation V0-A (comparaison des 5 périodes) est prioritaire. La correction interviendra après le diagnostic complet.

---

## 7. Classification

| Problème | Type | Priorité correction |
|----------|------|---------------------|
| Grid-grouper absent dans `analyzeSessions` | Bug architectural | Haute — après V0-A |
| `gridContext` absent dans `analyzeSessions` | Incohérence mineure | Basse |
| Moyenne non pondérée par trades | Décision produit à trancher | Non urgente |
| Score moyen vs score live non expliqué à l'utilisateur | Problème UX | Après correction bug |

---

*Découvert pendant la session V0-A Phase 3 — 2026-05-25.*  
*Correction différée — observer d'abord, corriger après comparaison des 5 périodes.*
