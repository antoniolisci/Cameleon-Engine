# IMPORT_FIELD_TEST_SUMMARY_001 — Audit terrain imports Excel/CSV

**Date :** 2026-05-18  
**Contexte :** Audit post-test terrain — tous les fichiers disponibles testés dans Caméléon Engine.  
**Périmètre :** pipeline import uniquement (src/js/behavior/import/, normalize/, partiellement analytics/).  
**Aucune modification de code dans ce document.**

---

## 1. Formats testés et résultats

| Format | Fichier type | Résultat | CASE |
|--------|-------------|---------|------|
| Trade History CSV FR | Binance Spot export FR | ✅ accepté, analyse complète | — |
| Trade History XLSX FR | Binance Spot export FR | ✅ accepté, analyse complète | — |
| Order History XLSX FR | `11_4au11_5.xlsx` — 61 lignes, 30 FILLED | ✅ accepté après correction (voir CASE_001) | CASE_001 |
| Deposit History XLSX | Historique dépôts Binance | ✅ rejeté sainement — "headers détectés mais aucune ligne" | CASE_003 |
| Withdraw History CSV | Historique retraits Binance | ✅ rejeté sainement — NON_TRADING/unknown | CASE_002 |
| Wallet History CSV | Opérations de compte | ✅ redirigé vers pipeline wallet | — |
| Earn / Staking | Export épargne | ✅ rejeté avec message explicite | — |
| Archive ZIP | Tout format Binance zippé | ✅ rejeté avec instruction de décompression | — |

---

## 2. Bugs corrigés lors des tests terrain

### CASE_001 — Exécuté² (U+00B2) non normalisé
**Symptôme :** Order History FR importé, FILLED détectés dans statusCounts, 0 trades extraits.  
**Cause :** Binance dédoublonne deux colonnes "Exécuté" en ajoutant l'exposant typographique ² (U+00B2, SUPERSCRIPT TWO). U+00B2 n'est ni un diacritique (hors U+0300–U+036F) ni dans le set de remplacement de `normalizeKey()` → clé `"execute²"` inconnue de `ALIASES_QTY` → `qty = 0` → rejet.  
**Correction :** `.replace(/²/g, '2')` dans `normalizeKey()` + alias `'execute2'` dans `ALIASES_QTY`.  
**Fichier :** `src/js/behavior/normalize/mappers/binance_order.js`  
**Validation :** 30 FILLED importés, 31 ignorés (NEW + CANCELED).  
**Commit :** `a35916a`

### CASE_003 — Message "vide ou illisible" sur headers trouvés mais lignes vides
**Symptôme :** Fichier Deposit History XLSX → message d'erreur "Le fichier est vide ou son format n'a pas pu être lu" — trompeur car les headers étaient bien lus.  
**Cause :** Guard `rows.length === 0` partageait le même message que `!rows`.  
**Correction :** Séparation des deux guards avec messages distincts.  
**Fichier :** `src/js/behavior/import/uploader.js` lignes 265–269.

---

## 3. Fichiers hors périmètre — rejets documentés

| Format | Comportement | Message UX | Jugement |
|--------|-------------|-----------|---------|
| Withdraw History | NON_TRADING/unknown | "Colonnes non reconnues. Colonnes trouvées: …" | Correct — pas de trading |
| Deposit History | Headers détectés, 0 lignes données | "headers détectés mais aucune ligne présente" | Correct |
| Earn/Staking | NON_TRADING/earn | "Ce fichier correspond à un historique d'épargne" | Correct |
| Wallet | NON_TRADING/wallet | Pipeline wallet dédié → analyse financière | Correct |
| ZIP | Guard extension | "Décompressez l'archive…" | Correct |

---

## 4. Traces debug présentes en production

### 4.1 — `console.debug` dans format-detector.js (ligne 66)
```javascript
console.debug('[bhv:format] fee=%s status=%s orderId=%s | cols: %s',
  hasFee, hasStatus, hasOrderId, h.join(', '));
```
**Surface :** s'exécute à chaque import, expose la liste complète des colonnes normalisées dans la console DevTools, en permanence. Non conditionnel, pas de flag `DEBUG`.  
**Risque :** surface de debug non intentionnelle en production. Pas de risque de sécurité (données locales), mais bruit console non contrôlé.  
**Statut : P0 — à supprimer avant déploiement public.**

### 4.2 — Traces [ORDER VALIDATION REJECT] dans binance_order.js (lignes 114, 157–163)
```javascript
console.warn('[ORDER VALIDATION REJECT] timestamp null …')
console.warn('[ORDER VALIDATION REJECT] champ manquant …')
console.warn('[ORDER VALIDATION REJECT] bruts …')
```
**Surface :** s'exécute uniquement sur lignes rejetées (cas d'erreur réels).  
**Jugement :** intentionnel — ces warns sont les NR-012 conservés lors de l'audit IMPORT_AUDIT_003. Utiles pour diagnostic terrain futur. À conserver.

### 4.3 — Trace [ORDER_HISTORY] dans mapOrderRows (ligne 213)
```javascript
console.warn('[ORDER_HISTORY] Aucun ordre FILLED — statuts trouvés …')
```
**Jugement :** utile pour diagnostic. À conserver.

---

## 5. Code mort

### FILLED_STATUSES Set — binance_order.js ligne 79
```javascript
const FILLED_STATUSES = new Set(['FILLED', 'REMPLI', 'COMPLETED', 'COMPLETE', 'DONE']);
```
Déclaré, jamais référencé. La détection FILLED est assurée par `isFilledStatus()` (lignes 67–77) via normalisation NFD + comparaison string.  
Noté dans IMPORT_AUDIT_003 section 5 comme code mort confirmé.  
**Statut : P0 — à supprimer (aucun risque, réduction surface d'erreur de maintenance).**

---

## 6. Inconsistances entre normalizeKey() de binance_spot.js et binance_order.js

Les deux fichiers dupliquent intentionnellement `normalizeKey()` (module isolation, noté IMPORT_AUDIT_003). Mais depuis la correction CASE_001, ils divergent :

| Différence | binance_spot.js | binance_order.js |
|-----------|----------------|-----------------|
| Apostrophe `'` dans les séparateurs | ❌ absente | ✅ présente (`[\s_./'\\-]+`) |
| Exposant ² → 2 | ❌ absent | ✅ présent |

**Impact apostrophe :** si un Trade History FR a une colonne "Prix d'exécution" ou "Côté d'achat", binance_spot.js ne normalise pas l'apostrophe → clé avec apostrophe littérale → non matchée par les alias (qui eux sont écrits sans apostrophe, ex: `'prix d execution'`). Aucun cas terrain observé jusqu'ici.

**Impact exposant ²:** si un Trade History a une colonne avec ², binance_spot.js ne la normaliserait pas. Aucun cas terrain observé.

**Statut : P1 — aligner les deux normalizeKey() lors d'une passe dédiée.**

---

## 7. Couverture des alias FR/EN

### binance_order.js ALIASES_QTY
Couvre : `executed qty`, `filled qty`, `executed`, `filled`, `qty`, `quantity`, `base qty`, `base quantity`, `execute`, `execute2` (CASE_001), `quantite executee`, `volume execute`, `montant execute`.  
**Jugement :** exhaustif pour les variantes Binance connues.

### binance_order.js ALIASES_PRICE
Couvre : EN standard + FR complet (prix moyen, prix de l'ordre via apostrophe normalisée, prix moyen rempli, prix d'exécution moyen).  
**Jugement :** exhaustif.

### binance_spot.js ALIASES_QTY
Couvre plus de variantes que binance_order.js : inclut `amount`, `vol`, `qte`.  
Note : `execute2` absent (pas de cas terrain sur Trade History).

---

## 8. Robustesse sur cas extrêmes

| Scénario | Comportement | Guard |
|---------|-------------|-------|
| Fichier très volumineux (>5MB) | Chargé entièrement en mémoire — aucun avertissement | ❌ absent |
| 0 lignes de données (headers seuls) | Rejeté avec message distinct (CASE_003) | ✅ |
| Colonnes dupliquées | Dernière valeur retenue (comportement JS `row[h] = cells[j]`) | implicite |
| Encodage BOM UTF-8 | Strip automatique | ✅ |
| Date(UTC+N) avec timezone | Canonicalisée en date(utc) | ✅ |
| Séparateur CSV ambigu | Détection auto sur première ligne non-vide | ✅ |
| 50 sessions sauvegardées | Cap FIFO à 20, les anciennes sont purgées | ✅ |
| Valeurs numériques FR (`1.234,56`) | parseNum() gère les deux formats | ✅ |
| Exposant typographique ² dans colonne | Normalisé → ASCII 2 (binance_order.js uniquement) | ✅ partiel |
| Contenu XSS dans CSV | escHtml() sur tout affichage DOM | ✅ |

---

## 9. Cohérence des messages UX

### Messages d'erreur — jugement
- ✅ ZIP : message actionnable ("Décompressez")
- ✅ NO_HEADER_FOUND : message explicite ("30 premières lignes")
- ✅ Earn/Staking : message précis, pas de faux espoir
- ✅ Order History 0 FILLED : inclut la liste des statuts trouvés (`statusHint`)
- ✅ NON_TRADING unknown : inclut colonnes trouvées + checkmark diagnostic
- ⚠️ Wallet exception : message générique ("non exploitable") — acceptable en V1

### Bandeau fiabilité dataset (behavior-view.js)
Ajouté lors de cette session (commit `634a683`) :
- LOW : "Données insuffisantes — lecture indicative uniquement."
- PARTIAL : "Analyse partielle — contexte limité."
- HIGH : aucun bandeau

Intégré dans `buildAnalysis()` après `gridContextBanner`.

---

## 10. Comportement sur gros historiques

Aucun test terrain sur fichier >500 lignes documenté.  
Points d'attention théoriques :
- `groupGridTrades()` dans behavior-view.js : pas de cap interne → O(n²) potentiel sur très grands datasets
- `detectPatterns()` dans patterns.js : fenêtrage 60min/120min → linéaire
- `computeMetrics()` : linéaire
- Pas de web worker — tout se passe sur le thread principal → UI potentiellement bloquée sur >5000 lignes

---

## 11. Dette technique restante

| Item | Origine | Priorité | Fichier |
|------|---------|---------|---------|
| `console.debug` non conditionnel | Trace debug production | **P0** | format-detector.js L66 |
| `FILLED_STATUSES` Set mort | Code mort | **P0** | binance_order.js L79 |
| Apostrophe + ² absents de binance_spot.js normalizeKey | Divergence post-CASE_001 | **P1** | binance_spot.js |
| Limite taille fichier absente | Guard manquant | **P1** | uploader.js |
| 3 × normalizeKey dupliquées | Duplication intentionnelle (isolation module) | **P2** | binance_spot/order, format-detector |
| Patterns non-évaluables non annotés dans UI | V2 prévu ANALYTIC_RELIABILITY_ARCHITECTURE_001 | **P2** | patterns.js + behavior-view.js |
| cancelProfile Order History non affiché | Calculé dans order-analyzer.js, non exposé | **P2** | behavior-view.js |

---

## 12. Verdict global

**Pipeline import : ROBUSTE sur tous les cas terrain testés.**

- Formats reconnus correctement : Trade History, Order History, Wallet, Earn, ZIP, Unknown
- Deux bugs corrigés (CASE_001, CASE_003), un edge case documenté (CASE_002)
- Alias FR/EN exhaustifs pour les formats Binance observés
- XSS protégé, parsing quote-aware, normalisation NFD robuste
- Sessions capées à 20, FIFO appliqué
- Bandeau fiabilité dataset opérationnel (LOW/PARTIAL/HIGH)

**Points d'attention avant déploiement public :**
- ~~Surface debug `console.debug` dans format-detector.js~~ — soldé `9ad2974`
- ~~Code mort `FILLED_STATUSES`~~ — soldé `9ad2974`

---

## 13. Priorités d'amélioration

### P0 — Nécessaire avant public (2 items) ✅ soldés
1. ~~Supprimer `console.debug` dans format-detector.js ligne 66~~ — `9ad2974`
2. ~~Supprimer `FILLED_STATUSES` Set dead code dans binance_order.js ligne 79~~ — `9ad2974`

### P1 — Utile, non bloquant (2 items) ✅ soldés
3. ~~Aligner `normalizeKey()` de binance_spot.js sur binance_order.js (apostrophe + exposant ²)~~ — `ff56636`
4. ~~Ajouter un guard de taille fichier dans `importBinanceSpot()` (~5MB max, message "Fichier trop volumineux")~~ — `ff56636`

### P2 — Plus tard (3 items) — dette restante
5. Mutualiser normalizeKey en module partagé (si refacto planifiée)
6. Afficher les patterns non-évaluables dans l'UI Order History (prévu V2)
7. Exposer `cancelProfile` de order-analyzer.js dans behavior-view.js `buildOrderAnalysis()`

---

## 14. État après corrections

**Date :** 2026-05-18

| Priorité | Items | Statut | Commit |
|---------|-------|--------|--------|
| P0 | `console.debug` format-detector.js | ✅ soldé | `9ad2974` |
| P0 | `FILLED_STATUSES` code mort | ✅ soldé | `9ad2974` |
| P1 | `normalizeKey()` binance_spot.js aligné | ✅ soldé | `ff56636` |
| P1 | Guard taille fichier 5 MB | ✅ soldé | `ff56636` |
| P2 | normalizeKey mutualisé | 🔲 dette | — |
| P2 | Patterns non-évaluables UI | 🔲 dette | — |
| P2 | cancelProfile exposé | 🔲 dette | — |

Pipeline import considéré **production-ready** sur les cas terrain documentés. Dette P2 non bloquante.
