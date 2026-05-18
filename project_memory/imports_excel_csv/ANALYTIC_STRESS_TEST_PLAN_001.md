# ANALYTIC_STRESS_TEST_PLAN_001 — Plan de stress test analytique sur grands datasets

**Date :** 2026-05-18  
**Contexte :** Post-audit IMPORT_FIELD_TEST_SUMMARY_001 — pipeline import validé sur cas terrain réels (30–61 trades). Aucun test réel au-delà de ~60 trades. Ce document planifie les tests analytiques sur volumes 200+/500+/1000+ avant déploiement public.  
**Périmètre :** Pipeline analytique comportemental uniquement — `metrics.js`, `patterns.js`, `scoring.js`, `behavior-view.js`. Pas le pipeline d'import (déjà audité).  
**Aucune modification de code dans ce document.**

---

## 1. Objectif du stress test analytique

### 1.1 — Pourquoi tester au-delà de 60 trades

L'audit terrain (IMPORT_FIELD_TEST_SUMMARY_001) a validé le pipeline sur des fichiers de 30 à 61 lignes. Mais le moteur analytique n'a aucun cap interne sur le volume traité :

- `groupGridTrades()` dans `behavior-view.js` — O(n²) potentiel
- Tout s'exécute sur le thread principal — UI bloquante sur grands volumes
- `detectPatterns()` avec fenêtres 60min/120min — comportement non observé sur dense histories
- Le bandeau `dataQuality` peut produire HIGH sur 200+ trades — il faut vérifier que l'analyse reste cohérente

### 1.2 — Objectifs mesurables

| Objectif | Critère de succès |
|----------|-----------------|
| Absence de blocage UI | Analyse complète < 2s sur 500 trades (thread principal) |
| Cohérence analytique | Scores et patterns stables sur datasets synthétiques connus |
| Pas de crash silencieux | Aucune exception non catchée, aucun score `NaN` |
| dataQuality correct sur gros volumes | HIGH confirmé sur ≥20 trades, ≥72h, BUY+SELL |
| Rendu DOM complet | Aucun élément manquant ou tronqué sur affichage 500+ trades |

---

## 2. Types de datasets à tester

### 2.1 — Datasets synthétiques (à construire manuellement en CSV)

| ID | Description | Taille | Caractéristiques |
|----|-------------|--------|-----------------|
| SYN-001 | Historique neutre équilibré | 200 trades | 50% BUY / 50% SELL, 1 trade/heure, 8 jours, prix stable |
| SYN-002 | Historique dense court | 500 trades | 50/50, ~4 trades/heure, 5 jours, prix volatil |
| SYN-003 | Historique long espacé | 1000 trades | 50/50, 1 trade/2h, 90 jours |
| SYN-004 | SELL-only | 300 trades | 0 BUY — dataQuality LOW attendu, patterns partiels |
| SYN-005 | Overtrading simulé | 500 trades | Rafales de 15+ trades en <60min, répétées |
| SYN-006 | Grid trading simulé | 400 trades | Séquences BUY/SELL alternées, même symbol, écarts <2% |
| SYN-007 | Multi-symboles | 600 trades | 5 paires différentes, répartition inégale |

### 2.2 — Datasets réels anonymisés (si disponibles)

- Export Binance Trade History >200 lignes, anonymisé (prix offsets, timestamps décalés)
- Export Binance Order History >100 FILLED, anonymisé
- Format cible : dossier `excel_tests/04_anonymized/` avec fiche CASE correspondante

### 2.3 — Datasets de régression

À conserver après chaque run de stress test pour détecter des régressions futures :
- Un dataset SYN représentatif de chaque niveau de dataQuality (LOW / PARTIAL / HIGH)
- Un dataset avec overtrading clair → vérification pattern detection stable

---

## 3. Risques analytiques possibles

### 3.1 — Performance (thread principal)

**Risque principal : blocage UI**

`groupGridTrades()` dans `behavior-view.js` itère sur toutes les paires consécutives pour détecter les séquences grid. Sur N trades, la complexité est O(n) dans le meilleur cas mais peut dégénérer si la logique interne imbrique des boucles.

- Seuil observé théorique : sur 1000 trades, si chaque trade est comparé aux N suivants → 500 000 opérations
- Risque concret : sur mobile ou machine lente, UI gelée 3–10s

**Autres hotspots potentiels :**
- `detectPatterns()` : fenêtres temporelles glissantes (60min/120min) — linéaire mais constant élevé
- `computeMetrics()` : linéaire, probablement sûr
- Rendu DOM `buildAnalysis()` : injection HTML complète à chaque import — pas de virtual DOM

### 3.2 — Cohérence analytique

**Score NaN :** Si un dataset produit `price = 0` ou `qty = 0` sur toutes les lignes (ex : mapping cassé), les métriques dérivées (`avgPrice`, `totalVolume`) peuvent devenir `NaN` ou `Infinity`. Le score comportemental propagera ce NaN sans message d'erreur.

**Patterns faux positifs sur grand volume :** Un historique de 1000 trades peut déclencher des patterns qui n'ont pas été observés sur les datasets de 30–60 trades. Notamment :
- `overtrading` — seuil sensible au débit → peut être déclenché par des périodes normales à fort volume
- `revenge_trading` — détection sur pertes consécutives → sensible à la séquence exacte de calcul P&L
- `grid_trading` — `groupGridTrades()` peut sur-détecter sur un grand historique dense

**dataQuality HIGH sans revue :** Sur 200+ trades HIGH, le bandeau disparaît mais l'analyse sous-jacente n'a pas été validée sur ces volumes. Risque : score biaisé mais présenté sans mise en garde.

### 3.3 — Mémoire

Pas de cap sur la taille des tableaux intermédiaires dans le pipeline analytique. Sur 5000 trades (hypothétique), l'objet `trades[]` + métriques intermédiaires pourraient dépasser 50MB en RAM. Pas critique sur desktop, potentiellement bloquant sur mobile.

### 3.4 — Edge cases spécifiques aux grands volumes

| Scénario | Risque |
|---------|--------|
| Tous les trades sur 1 seul symbole | `symbolBreakdown` biaisé — 1 entrée à 100% |
| Timestamps identiques sur lignes consécutives | Tri indéfini → patterns temporels instables |
| Prix constant sur 1000 trades | Calcul de volatilité → division par 0 ou NaN |
| Fee = 0 sur tout le dataset | Pas de crash attendu, mais score fee inutilisé |
| Trades sur 10+ paires différentes | Rendu tableau multi-symboles non testé au-delà de 3–4 paires |

---

## 4. Métriques à observer

### 4.1 — Performance

| Métrique | Outil de mesure | Seuil acceptable |
|---------|----------------|-----------------|
| Temps total `mount()` → DOM complet | `console.time('bhv:mount')` wrapping | < 500ms pour 200 trades ; < 2s pour 500 trades |
| Temps `groupGridTrades()` | `console.time('bhv:grid')` | < 200ms pour 500 trades |
| Temps `detectPatterns()` | `console.time('bhv:patterns')` | < 300ms pour 500 trades |
| Mémoire JS heap (DevTools) | Chrome DevTools Memory snapshot | < 100MB pour 1000 trades |
| Frame drop pendant analyse | Performance tab — timeline | Pas de frame > 50ms hors analyse initiale |

### 4.2 — Exactitude analytique

| Métrique | Vérification |
|---------|-------------|
| `dataQuality.level` | HIGH sur SYN-001 (200t, 8j, 50/50) ; LOW sur SYN-004 (SELL-only) |
| Score comportemental | Non-NaN, entre 0 et 100 inclus |
| `overtrading` pattern | Déclenché sur SYN-005, absent sur SYN-001 |
| `grid_trading` pattern | Déclenché sur SYN-006, absent sur SYN-001 |
| `revenge_trading` | Non déclenché sur SYN-001 (historique neutre) |
| Ratio BUY/SELL dans métriques | ±1 trade de l'attendu sur datasets synthétiques connus |
| `cancelProfile` | Toujours `'none'` sur Trade History (champ absent) |

### 4.3 — Rendu DOM

| Élément | Vérification |
|---------|-------------|
| Bandeau `dataQuality` | Affiché LOW/PARTIAL ; absent pour HIGH |
| Bandeau `gridContextBanner` | Affiché si grid détecté ; absent sinon |
| Tableau de patterns | Toutes les lignes présentes, aucun `undefined` affiché |
| Score principal | Affiché, classe CSS cohérente (Discipliné / Réactif / Impulsif / Agressif) |
| Métriques numériques | Pas de `NaN`, pas de `Infinity`, pas de valeur vide inattendue |

---

## 5. Plan de validation

### 5.1 — Séquence d'exécution recommandée

```
Phase 1 — Baseline (datasets SYN-001 à SYN-004)
  → Valider que les seuils dataQuality sont corrects
  → Mesurer les temps de base sur 200 trades

Phase 2 — Montée en charge (SYN-002, SYN-003, SYN-007)
  → 500 trades → mesurer performance
  → 1000 trades → mesurer performance
  → Vérifier absence de blocage UI et de NaN

Phase 3 — Patterns edge cases (SYN-005, SYN-006)
  → Vérifier détection patterns sur données synthétiques intentionnelles
  → Vérifier absence de faux positifs sur SYN-001

Phase 4 — Datasets réels anonymisés (si disponibles)
  → Valider que les scores restent cohérents vs observation terrain
```

### 5.2 — Grille de validation par dataset

Pour chaque dataset :

| Checkpoint | Résultat attendu | Résultat observé | OK ? |
|-----------|-----------------|-----------------|------|
| Import sans erreur | `ok: true`, trades > 0 | — | — |
| `dataQuality.level` | Voir §2.1 | — | — |
| Score comportemental | 0–100, non-NaN | — | — |
| Temps analyse | < seuils §4.1 | — | — |
| DOM complet | Aucun undefined | — | — |
| Patterns attendus | Voir §4.2 | — | — |
| Patterns inattendus | Aucun | — | — |

### 5.3 — Critères de blocage (stop-go)

Un résultat bloquant pour déploiement public :

- Score `NaN` ou hors [0, 100] sur n'importe quel dataset
- Exception non catchée dans la console (pas un warn, une vraie exception)
- Blocage UI > 5s sur 500 trades (Chrome, machine de développement)
- Pattern faux positif reproductible sur dataset neutre SYN-001
- Bandeau `dataQuality` absent sur un cas LOW confirmé

Un résultat non bloquant mais à documenter :

- Temps > 2s sur 1000 trades (acceptable V1, recommandation web worker V2)
- Score légèrement différent entre deux runs sur le même dataset (non-déterminisme acceptable)
- Rendu visuel dégradé sur petit écran (non prioritaire)

---

## 6. Recommandations futures

### 6.1 — Si blocage UI confirmé sur 500+ trades : Web Worker

Déplacer le pipeline analytique (`computeMetrics` + `detectPatterns` + `computeScore`) dans un Worker séparé.  
**Contraintes :** les Workers ne peuvent pas manipuler le DOM — `buildAnalysis()` reste sur le thread principal. Seul le calcul est déplacé.  
**Complexité :** moyenne — nécessite une interface message `postMessage(trades)` / `onmessage(result)`.  
**Référence architecture :** `ANALYTIC_RELIABILITY_ARCHITECTURE_001.md` section Worker.

### 6.2 — Si `groupGridTrades()` est O(n²) confirmé : cap interne

Ajouter un cap de sécurité dans `groupGridTrades()` : si `trades.length > 2000`, traiter uniquement les 2000 trades les plus récents avec un bandeau informatif.  
**Alternative :** refactorer l'algorithme en O(n) si la logique le permet.

### 6.3 — Pagination du rendu DOM

Pour 1000+ trades, le tableau de résultats pourrait bénéficier d'une pagination (20 trades/page) ou d'un scroll virtuel.  
**Non bloquant V1** — le tableau affiché est un résumé agrégé, pas les trades bruts. À réévaluer si de nouveaux éléments de rendu par trade sont ajoutés.

### 6.4 — Limite dataset configurable dans l'UI

Avertissement dans l'UI si le fichier contient > N trades, avec suggestion d'exporter une période plus courte.  
Analogue au guard de taille fichier (5MB) mais orienté nombre de lignes.  
**Seuil suggéré :** 2000 trades → warning ; 5000 trades → reject avec message explicite.

### 6.5 — Fichiers de test synthétiques versionned

Créer les datasets SYN-001 à SYN-007 en CSV minimal et les committer dans `excel_tests/03_edge/` (anonymisés par construction — données 100% synthétiques).  
Cela permet des tests de non-régression reproductibles sans dépendre de fichiers terrain externes.

---

## 7. État du plan

**Date création :** 2026-05-18  
**Statut :** 🔲 En attente — aucun test exécuté  
**Prochaine étape :** Construire SYN-001 (200 trades, neutre) et exécuter Phase 1

| Phase | Statut |
|-------|--------|
| Phase 1 — Baseline 200 trades | 🔲 Non démarré |
| Phase 2 — Montée en charge 500–1000 trades | 🔲 Non démarré |
| Phase 3 — Patterns edge cases | 🔲 Non démarré |
| Phase 4 — Datasets réels anonymisés | 🔲 Non démarré |
