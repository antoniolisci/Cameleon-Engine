# DEBUG_SURFACE_AUDIT_001 — Debug / Dev Traces / Console Noise / Surface Inutile

**Statut :** Documenté — aucun code modifié  
**Date :** 2026-05-17  
**Périmètre :** `src/` intégral (42 fichiers JS + 1 HTML)  
**Méthode :** Audit statique exhaustif — lecture des sources, grep multi-catégories, vérification de contexte

---

## Résumé exécutif

| Catégorie | SAFE TO REMOVE | NEED REVIEW | KEEP | Total |
|-----------|---------------|-------------|------|-------|
| console.log | 14 | 3 | 0 | 17 |
| console.warn | 0 | 9 | 5 | 14 |
| console.info | 1 | 0 | 0 | 1 |
| console.debug (flagged) | 0 | 0 | 6 | 6 |
| console.group | 3 | 0 | 0 | 3 |
| TODO comments | 0 | 1 | 0 | 1 |
| DEBUG flags | 0 | 0 | 4 | 4 |
| window.* | 0 | 0 | 1 | 1 |
| performance.* | 0 | 0 | 1 | 1 |
| silent catch | 0 | 0 | 1 | 1 |
| **Total** | **18** | **13** | **18** | **49** |

**Aucun `debugger`, aucun `fetch`, aucun `XMLHttpRequest`, aucun `navigator.sendBeacon` trouvé.**

---

## SAFE TO REMOVE

Traces sans valeur en production. Suppression sans risque fonctionnel.

---

### STR-001 — `render.js:5115` — Data dump module-level (CRITIQUE)

**Ligne :**
```javascript
const data = OVERTRADING_DICT[1];
console.log("DATA UI :", data);
```
**Contexte :** Ligne 5114–5115, après le bloc `init()` — au niveau module. S'exécute à chaque chargement de page, inconditionnellement.  
**Impact potentiel :** Dump d'une entrée du dictionnaire OVERTRADING en console à chaque load. Expose la structure interne de `OVERTRADING_DICT`. Bruit permanent.  
**Risque suppression :** Nul. `data` n'est utilisé nulle part. Variable orpheline.  
**Recommandation :** Supprimer les deux lignes.

---

### STR-002 — `render.js:2626-2633` — DecisionState dump sur chaque render

**Lignes :**
```javascript
console.log("[DecisionState]", {
  marketState:     payload.market_state,
  score:           payload.score,
  posture:         payload.decision?.primary?.posture,
  validationState: payload.validation?.state,
  tradingStatus:   payload.trading_status,
  result:          decisionState.state
});
```
**Contexte :** Dans la fonction principale de rendu — s'exécute à chaque modification du formulaire.  
**Impact potentiel :** Log haute fréquence exposant l'état interne complet du payload à chaque cycle de rendu.  
**Risque suppression :** Nul. Aucune logique conditionnée sur ce log.  
**Recommandation :** Supprimer.

---

### STR-003 — `render.js:2716` — ConfidenceScore dump sur chaque calcul

**Ligne :**
```javascript
console.log("[ConfidenceScore]", { score: _safeScore, posture: _posture, action: _action, agent: _agent, ..._ctx });
```
**Contexte :** Dans la fonction de rendu du score de confiance — s'exécute à chaque changement d'état.  
**Impact potentiel :** Spread de `_ctx` expose toutes les valeurs du contexte moteur à chaque cycle.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer.

---

### STR-004 — `uploader.js:14` — Version tag avec commit hash (SÉCURITÉ)

**Ligne :**
```javascript
console.info('[BEHAVIOR IMPORT VERSION] 52cab1a Binance FR fix loaded');
```
**Contexte :** Niveau module — s'exécute au chargement de `uploader.js`, inconditionnellement.  
**Impact potentiel :** Expose un hash de commit interne dans la console de tout navigateur. En déploiement public, ce hash permet à un attaquant de corréler la version déployée avec l'historique Git public pour identifier des vulnérabilités non encore patchées.  
**Risque suppression :** Nul fonctionnel.  
**Recommandation :** Supprimer. Ne pas remplacer par un autre tag de version visible en console.

---

### STR-005 — `uploader.js:284-300` — Bloc diagnostic IMPORT DEBUG (groupe console)

**Lignes :**
```javascript
console.group('[IMPORT DEBUG]');
console.log('Fichier       :', file.name);
console.log('Extension     :', ext);
console.log('Taille        :', file.size, 'octets');
// ... 6 lignes supplémentaires ...
console.group('Échantillon rows bruts (3 premières)');
rows.slice(0, 3).forEach((r, i) => console.log(`Row ${i}:`, r));
console.groupEnd();
console.groupEnd();
```
**Contexte :** Bloc diagnostique explicitement délimité par `console.group('[IMPORT DEBUG]')`. Dump du nom du fichier utilisateur, extension, taille, lignes brutes, headers, et 3 premières lignes de données.  
**Impact potentiel :** Expose les données brutes de l'import utilisateur (headers CSV réels, premières lignes de trades) dans la console. En déploiement public, n'importe qui ayant accès à la console du navigateur voit ces données.  
**Risque suppression :** Faible. Ces logs ont été ajoutés lors du débogage du parsing Binance (commits récents). La logique de détection sous-jacente est stable.  
**Recommandation :** Supprimer le bloc entier (lignes 283–300). Conserver `console.group` au maximum conditionné à un flag `DEBUG_IMPORT` si future investigation nécessaire.

---

### STR-006 — `uploader.js:302` — Log colonnes post-diagnostic

**Ligne :**
```javascript
console.log('[bhv:import] colonnes trouvées (%d) : %s', headers.length, headers.join(' | '));
```
**Contexte :** Immédiatement après le bloc STR-005. Fait partie du même bloc diagnostique.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer avec STR-005.

---

### STR-007 — `uploader.js:318-323` — Bloc diagnostic Classification (groupe console)

**Lignes :**
```javascript
console.group('[IMPORT DEBUG] Classification');
console.log('Signaux trading :', signals);
console.log('Level / Subtype :', level, '/', subtype);
console.log('Format détecté  :', fileFormat);
console.groupEnd();
```
**Contexte :** Second groupe debug dans le même pipeline d'import. Expose les signaux de classification interne.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer avec STR-005 et STR-006.

---

### STR-008 — `uploader.js:325` — Log classification résumé

**Ligne :**
```javascript
console.log('[bhv:import] classification → %s/%s · format → %s', level, subtype, fileFormat);
```
**Contexte :** Résumé post-classification. Redondant avec STR-007.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer.

---

### STR-009 — `binance_order.js:103` — Log statut sur chaque ligne (HAUT VOLUME)

**Ligne :**
```javascript
console.log('[ORDER STATUS]', JSON.stringify(rawStatus));
```
**Contexte :** Dans `mapOrderRow()` — s'exécute pour chaque ligne du fichier Order History. Un fichier de 500 ordres produit 500 logs.  
**Impact potentiel :** Pollution console à haut volume. Expose chaque valeur brute de statut.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer.

---

### STR-010 — `binance_order.js:108-109` — Log ligne FILLED brute (HAUT VOLUME + DONNÉES)

**Lignes :**
```javascript
console.log('[FILLED ROW]', row);
console.log('[FILLED ROW] clés normalisées :', Object.keys(norm));
```
**Contexte :** S'exécute pour chaque ordre FILLED — dump de la ligne brute complète de l'historique.  
**Impact potentiel :** Expose l'intégralité de chaque ligne de trade en console (prix, quantité, symbole, timestamp, frais). Données financières visibles à tout utilisateur avec DevTools ouverts.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer impérativement. Plus prioritaire que STR-009.

---

### STR-011 — `binance_order.js:182` — Log trade mappé (HAUT VOLUME + DONNÉES)

**Ligne :**
```javascript
console.log('[ORDER MAPPED]', mapped);
```
**Contexte :** Dump de l'objet mappé complet à chaque trade traité.  
**Impact potentiel :** Identique à STR-010 — expose prix, quantité, symbole, fee à chaque itération.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer.

---

### STR-012 — `binance_spot.js:159` — Log trade mappé spot (HAUT VOLUME + DONNÉES)

**Ligne :**
```javascript
console.log('[MAPPED TRADE]', { timestamp, symbol, side, price, quantity: qty, quote_value, fee });
```
**Contexte :** Dans `normalizeTrade()` — dump complet de chaque trade spot mappé.  
**Impact potentiel :** Identique à STR-010/011.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer.

---

### STR-013 — `behavior-view.js:1041` — Log événement input (explicitement temporaire)

**Ligne :**
```javascript
console.log('[bhv:ui] input change déclenché');  // [DEBUG TEMPORAIRE]
```
**Contexte :** L'auteur a lui-même annoté `// [DEBUG TEMPORAIRE]`. Dans le listener de l'input fichier.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer (annotation le confirme).

---

### STR-014 — `behavior-view.js:1058` — Log événement drop (explicitement temporaire)

**Ligne :**
```javascript
console.log('[bhv:ui] drop déclenché');  // [DEBUG TEMPORAIRE]
```
**Contexte :** Idem — `// [DEBUG TEMPORAIRE]` explicite. Dans le listener du drop zone.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer.

---

### STR-015 — `uploader.js:233` — Log classification fichier

**Ligne :**
```javascript
console.log('[bhv:import] fichier : "%s" · extension : %s · type lu : %s', ...);
```
**Contexte :** Log de début de traitement — expose le nom du fichier et son type.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer avec les autres traces import.

---

### STR-016 — `binance_order.js:214` — Log total rows Order History

**Ligne :**
```javascript
console.log('[ORDER_HISTORY] rows total =', rows.length, ...);
```
**Contexte :** Dans `mapOrderRows()` — log de début de traitement.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer.

---

### STR-017 — `uploader.js:192-200` — Logs XLSX headerRowIndex / detectedHeaderRow

**Lignes :**
```javascript
console.log('[IMPORT DEBUG] XLSX headerRowIndex =', headerIdx, ...);
console.log('[IMPORT DEBUG] XLSX detectedHeaderRow =', headers);
```
**Contexte :** Diagnostics de la détection de l'en-tête dans les fichiers XLSX avec lignes de titre. Ajoutés lors du débogage des imports Binance XLSX.  
**Risque suppression :** Faible. La logique de détection est stable.  
**Recommandation :** Supprimer.

---

### STR-018 — `uploader.js:262` — Log CSV headerRowIndex

**Ligne :**
```javascript
console.log('[IMPORT DEBUG] CSV headerRowIndex =', startLine, ...);
```
**Contexte :** Pendant le débogage des imports CSV avec lignes de titre.  
**Risque suppression :** Nul.  
**Recommandation :** Supprimer.

---

## NEED REVIEW

Traces potentiellement utiles mais à évaluer avant suppression.

---

### NR-001 — `binance_order.js:115-116` — Warn rejection timestamp null

**Lignes :**
```javascript
console.warn('[ORDER VALIDATION REJECT] timestamp null — clés norm:', Object.keys(norm).join(', '));
console.warn('[ORDER VALIDATION REJECT] valeur date brute:', JSON.stringify(rawDate) || '(aucune)');
```
**Contexte :** Rejection de ligne lors de la validation — timestamp non parseable.  
**Valeur :** Utile pour diagnostiquer les imports avec formats de date non reconnus. Expose les clés normalisées (noms de colonnes) mais pas de données financières.  
**Risque suppression :** Moyen. Perd la traçabilité des rejections silencieuses lors d'imports problématiques.  
**Recommandation :** Conserver dans un premier temps. À conditionner à un `DEBUG_IMPORT` flag si le bruit devient gênant. Ne pas supprimer sans ajouter un compteur de rejections visible dans l'UI.

---

### NR-002 — `binance_order.js:158-160` — Warn rejection champ manquant

**Lignes :**
```javascript
console.warn('[ORDER VALIDATION REJECT] champ manquant:', ...);
console.warn('[ORDER VALIDATION REJECT] bruts:', ...);
```
**Contexte :** Rejection de ligne avec dump des valeurs brutes des champs manquants.  
**Valeur :** Même évaluation que NR-001. Le dump "bruts" expose des valeurs de trade.  
**Recommandation :** Même traitement que NR-001. La ligne "bruts" est la plus sensible — à supprimer en priorité si conditionné.

---

### NR-003 — `binance_order.js:218` — Warn aucun ordre FILLED

**Ligne :**
```javascript
console.warn('[ORDER_HISTORY] Aucun ordre FILLED — statuts trouvés :', ...);
```
**Contexte :** Warn de fin de pipeline si aucun ordre FILLED extrait.  
**Valeur :** Utile — aide à diagnostiquer un fichier refusé sans message utilisateur visible.  
**Recommandation :** Conserver. Envisager d'en faire un message visible dans l'UI plutôt qu'un warn console.

---

### NR-004 — `binance_spot.js:91-92` — Warn timestamp null spot

**Lignes :**
```javascript
console.warn('[bhv:map] ❌ timestamp null — clés norm:', Object.keys(norm).join(', '));
console.warn('[bhv:map]    valeur date brute:', JSON.stringify(rawDate) || '(aucune clé date matchée)');
```
**Même évaluation que NR-001.**  
**Recommandation :** Conserver ou conditionner à flag DEBUG_IMPORT.

---

### NR-005 — `binance_spot.js:147-149` — Warn champ manquant spot

**Lignes :**
```javascript
console.warn('[bhv:map] ❌ champ manquant — symbol=%s side=%s price=%s qty=%s', ...);
console.warn('[bhv:map]    bruts → date=%s sym=%s side=%s price=%s qty=%s fee=%s', ...);
```
**Même évaluation que NR-002.**  
**Recommandation :** La ligne `bruts` expose les valeurs de champ — à supprimer en priorité si conditionné.

---

### NR-006 — `behavior-view.js:1136` — Warn exception import catch

**Ligne :**
```javascript
console.warn('[bhv:import] exception non catchée dans importBinanceSpot:', err);
```
**Contexte :** Dans un catch de `handleImport()` — capture les erreurs inattendues du pipeline.  
**Valeur :** Utile — c'est un catch-level guard pour les exceptions non anticipées.  
**Recommandation :** Conserver. C'est de la surveillance d'erreur, pas du debug.

---

### NR-007 — `confidence-score.js:245` — Warn score < 50 (BRUIT NORMAL)

**Ligne :**
```javascript
console.warn("[ConfidenceScore] Contexte trop faible — setup ignoré.");
```
**Contexte :** S'exécute chaque fois que le score est inférieur à 50 — c'est-à-dire très fréquemment en usage normal.  
**Impact :** Produit un warn à chaque rendu d'un état de marché faible. En usage courant, ce warn est attendu et non actionnable — c'est donc du bruit.  
**Recommandation :** Supprimer ou descendre en `console.debug`. Ce n'est pas une erreur.

---

### NR-008 — `confidence-score.js:409` — Warn panel introuvable

**Ligne :**
```javascript
console.warn("[ConfidenceScore] Panel introuvable.");
```
**Contexte :** Guard structurel — si `.confidence-panel` absent du DOM.  
**Valeur :** Utile en développement pour détecter une régression DOM.  
**Recommandation :** Conserver. Guard légitime.

---

### NR-009 — `confidence-score.js:415` — Warn contexte invalide

**Ligne :**
```javascript
console.warn("[ConfidenceScore] Contexte invalide pour scoring UI.");
```
**Contexte :** Guard structurel — si `buildMarketContext()` retourne null/invalid.  
**Valeur :** Utile en développement.  
**Recommandation :** Conserver. Guard légitime.

---

### NR-010 — `render.js:910 + 926` — Warn missing payload / missing field

**Lignes :**
```javascript
console.warn("Missing payload");
console.warn(`Missing ${label} in payload`);
```
**Contexte :** Dans `warnMissingPayloadData()` — validateur structurel appelé à chaque rendu.  
**Valeur :** Détecte les régressions de structure payload en développement. En production, ces warns peuvent apparaître lors des premiers cycles de rendu avant que le formulaire soit rempli.  
**Recommandation :** Conserver la fonction. Évaluer si les warns sont trop précoces lors des premières interactions utilisateur.

---

### NR-011 — `uploader.js:329 + 375 + 425` — `console.debug` branchements pipeline (non flaggés)

**Lignes :**
```javascript
console.debug('[bhv:import] fichier wallet — branchement analyzeWallet()');
console.debug('[bhv:import] Order History détecté — branchement pipeline ordres');
console.debug('[bhv:import] 0 trades extraits | level=%s | colonnes=%s', ...);
```
**Contexte :** Ces `console.debug` sont directement dans le code, sans passer par un flag `DEBUG`. Contrairement aux autres modules (grid-grouper, patterns, scoring) qui utilisent `const DEBUG = false` + wrapper, ceux-ci s'exécutent inconditionnellement.  
**Impact :** Inconsistance avec le pattern de debug du reste du module comportemental.  
**Recommandation :** Supprimer ou passer par un flag `DEBUG_IMPORT = false` + wrapper, cohérent avec le reste.

---

### NR-012 — `format-detector.js:66` — `console.debug` non flaggé

**Ligne :**
```javascript
console.debug('[bhv:format] fee=%s status=%s orderId=%s | cols: %s', ...);
```
**Contexte :** Dans `detectFormat()` — s'exécute sur chaque détection de format. Pas de flag `DEBUG`.  
**Recommandation :** Même traitement que NR-011.

---

### NR-013 — `uploader.js:140` — `console.debug` classification non flaggé

**Ligne :**
```javascript
console.debug('[bhv:classify] signals → trading:%d wallet:%d earn:%d | colonnes: %s', ...);
```
**Contexte :** Dans `classifyFile()`. Pas de flag `DEBUG`.  
**Recommandation :** Même traitement que NR-011.

---

## KEEP

Éléments à conserver — fonctionnels, légitimes ou correctement gardés.

---

### K-001 — `grid-grouper.js:60-61` — Flag DEBUG pattern (correct)

```javascript
const DEBUG = false;
const dbg = (...args) => { if (DEBUG) console.debug('[bhv:grid]', ...args); };
```
**Raison :** Pattern de debug correctement implémenté. Flag à `false`, wrapper conditionnel. Activable sans modifier autre chose. À conserver tel quel.

---

### K-002 — `patterns.js:13-14` — Flag DEBUG pattern (correct)

```javascript
const DEBUG = false;
const dbg = (...args) => { if (DEBUG) console.debug('[bhv:patterns]', ...args); };
```
**Raison :** Même évaluation que K-001.

---

### K-003 — `scoring.js:18-19` — Flag DEBUG_GRID pattern (correct)

```javascript
const DEBUG_GRID = false;
const dbgGrid = (...args) => { if (DEBUG_GRID) console.debug('[bhv:grid-ctx]', ...args); };
```
**Raison :** Même évaluation. Documenté avec les cas couverts dans le commentaire au-dessus.

---

### K-004 — `behavior-view.js:34-35` — Flag DEBUG_GRID_CTX pattern (correct)

```javascript
const DEBUG_GRID_CTX = false;
const dbgCtx = (...args) => { if (DEBUG_GRID_CTX) console.debug('[bhv:grid-ctx]', ...args); };
```
**Raison :** Même évaluation.

---

### K-005 — `render.js:442` — `performance.now()` animation

```javascript
const start = performance.now();
```
**Contexte :** Dans la fonction d'animation du score (easeOutCubic via `requestAnimationFrame`). Usage fonctionnel et correct — calcul de progression temporelle pour l'animation.  
**Raison :** Ce n'est pas un log de performance ni une trace dev. C'est un usage API standard pour le rendu animé. Conserver.

---

### K-006 — `uploader.js:164` — `window.XLSX` check

```javascript
if (window.XLSX) return Promise.resolve(window.XLSX);
```
**Contexte :** SheetJS s'auto-expose comme global `window.XLSX` lorsqu'il est chargé via `<script>`. La vérification est nécessaire pour éviter un double chargement.  
**Raison :** Fonctionnel et requis. Pas une exposition de global — c'est une consommation d'un global produit par la bibliothèque.

---

### K-007 — `index.html:10` — Silent catch localStorage onboarding

```javascript
try{if(localStorage.getItem("CE_onboarding_v1"))document.documentElement.classList.add("onboarding-seen");}catch(e){}
```
**Contexte :** Inline dans `<head>` — avant le chargement des modules. S'exécute en mode synchrone bloquant.  
**Raison :** Le catch silencieux est intentionnel et correct ici : si `localStorage` est indisponible (navigation privée stricte, quota dépassé), l'application doit se charger normalement sans crash. L'absence de `onboarding-seen` est le comportement de repli acceptable.  
**Note :** C'est l'un des rares cas où un `catch(e){}` vide est défendable.

---

### K-008 — `confidence-score.js:409 + 415` — Guards structurels (KEEP)

Déjà listés en NR-008/009. Confirmé KEEP.

---

### K-009 — `behavior-view.js:1136` — Catch import exception (KEEP)

Déjà listé en NR-006. Confirmé KEEP.

---

### K-010 — `TODO render.js:469` — Dette technique documentée

```javascript
//   TODO (Phase 2) : unifier sur confidence-score.js et supprimer computeConfidence().
```
**Contexte :** Deux formules de confidence coexistent (`confidence-score.js` et `computeConfidence()` local dans `render.js`) avec des pondérations différentes pour des usages différents. Le TODO documente la dette technique réelle.  
**Raison :** À conserver — c'est une note d'architecture, pas un oubli. Ne pas supprimer sans traiter la refactorisation.

---

## Synthèse opérationnelle

### Priorité 1 — Supprimer immédiatement (sans risque)

| Ref | Fichier | Ligne(s) | Raison |
|-----|---------|----------|--------|
| STR-001 | render.js | 5114–5115 | Data dump orphelin — s'exécute à chaque load |
| STR-002 | render.js | 2626–2633 | Payload dump à chaque rendu |
| STR-003 | render.js | 2716 | Context dump à chaque calcul confidence |
| STR-004 | uploader.js | 14 | Hash commit exposé en console |
| STR-010 | binance_order.js | 108–109 | Données financières brutes en console |
| STR-011 | binance_order.js | 182 | Trade mappé complet en console |
| STR-012 | binance_spot.js | 159 | Trade spot complet en console |
| STR-013 | behavior-view.js | 1041 | Annoté `[DEBUG TEMPORAIRE]` par l'auteur |
| STR-014 | behavior-view.js | 1058 | Annoté `[DEBUG TEMPORAIRE]` par l'auteur |

### Priorité 2 — Supprimer avec le bloc (cohérence)

| Ref | Fichier | Ligne(s) | Raison |
|-----|---------|----------|--------|
| STR-005 | uploader.js | 283–300 | Bloc diagnostic entier, inclut données brutes |
| STR-006 | uploader.js | 302 | Fait partie du même bloc |
| STR-007 | uploader.js | 318–323 | Second groupe debug |
| STR-008 | uploader.js | 325 | Résumé post-classification |
| STR-009 | binance_order.js | 103 | Log haut volume statut |
| STR-015 | uploader.js | 233 | Log classification fichier |
| STR-016 | binance_order.js | 214 | Log total rows |
| STR-017 | uploader.js | 192–200 | Diagnostics header XLSX |
| STR-018 | uploader.js | 262 | Diagnostic header CSV |

### Priorité 3 — Évaluer (NEED REVIEW)

| Ref | Action recommandée |
|-----|--------------------|
| NR-001 à NR-005 | Conserver pour l'instant. Conditionner à `DEBUG_IMPORT = false` si le volume devient gênant. |
| NR-006 | Conserver — catch guard légitime. |
| NR-007 | Descendre en `console.debug` ou supprimer — warn intempestif sur état normal. |
| NR-008, NR-009 | Conserver — guards structurels. |
| NR-010 | Conserver — surveiller si prématuré au premier rendu. |
| NR-011 à NR-013 | Passer sous flag `DEBUG_IMPORT = false` pour cohérence avec le reste du module. |

---

## Observations transversales

**Pattern debug inconsistant dans le module import**

Le module `behavior/analytics/` (grid-grouper, patterns, scoring, behavior-view) utilise correctement le pattern `const DEBUG = false` + wrapper conditionnel. Le module `behavior/import/` (uploader, format-detector) utilise des `console.debug` directs sans flag. Cette inconsistance devrait être unifiée vers un flag `DEBUG_IMPORT = false` centralisé.

**Aucune `debugger` statement — propre**

**Aucun `fetch` / `XHR` / `sendBeacon` — conforme architecture local-first**

**0 blocs de code commenté (≥5 lignes) — propre**

**window.XLSX est la seule exposition globale — légitime (SheetJS)**

---

*Audit statique — aucun code modifié. Aucun commit. Aucun push.*
