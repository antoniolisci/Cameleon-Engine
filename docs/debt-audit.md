# Audit des dettes — Caméléon Engine

Dernière mise à jour : 2026-06-07 (session 9)

---

## Dettes soldées — session 2026-06-03

### SEC-B3 — Bloc `<style>` inline dans `constellium.html` · FERMÉ

**Commit :** `c5856ec`

La totalité de la feuille de style de `constellium.html` (361 lignes) était embarquée
dans un bloc `<style>` inline dans le `<head>`. Blocant pour la CSP Phase 3
(`style-src 'self'` sans `'unsafe-inline'`).

**Résolution :** extraction vers `src/css/constellium.css` + remplacement du bloc
`<style>` par `<link rel="stylesheet" href="./css/constellium.css">`.

**Impact :** `constellium.html` réduit de 563 à 202 lignes. Aucun changement de rendu.

---

### SEC-B4 — Attributs `style=""` inline dans `index.html` · FERMÉ

**Commits :** `b5aabbe` (14/16) · `bce0e74` (16/16)

16 attributs `style=""` statiques dans `index.html` bloquaient la CSP Phase 3.

**Résolution : 16/16 migrés.**

| Groupe | Éléments | Migration |
|---|---|---|
| A — `display:none` simple | guidanceCard · behaviorRepetitionCard · traderSignatureCard · behaviorProfileCard · traderMemoryCard · psychProfileCard · behaviorCoachCard · mentalResetCard (8 éléments) | Règles CSS par ID dans style.css |
| B — `width:0%` | execConfidenceFill · cs-bar (2 éléments) | `width:0` ajouté à règle existante / déjà présent |
| C — `margin-top:0.5rem` | `.confidence-panel .mode-panel` · `.confidence-panel > p.text-soft` (2 éléments) | Sélecteurs contextuels |
| D — styles composés | behaviorAlertCard · preBehaviorAlertCard (2 éléments) | `display:none` + `font-size:13px` + `opacity` par ID |
| E — exceptions render.js | bhvInfluencePanel · prudenceExpertBlock (2 éléments) | `style=""` supprimé · `style.display = ''` → `'block'` dans render.js |

**Technique pour le Groupe E :** `render.js` utilisait `style.display = ''` (vide) pour
afficher ces éléments — ce qui dépend de l'absence de règle CSS `display:none`. Corrigé
en remplaçant par `style.display = 'block'` explicite, ce qui rend la migration
indépendante de la cascade CSS. Aucun risque de FOUC : `init()` masque ces éléments
synchroniquement avant le premier paint navigateur.

**Zéro attribut `style=""` restant dans `index.html`.**

**Aucune régression observée.**

---

## Dettes soldées — session 2026-06-02

### TEC-01 — Dualité des systèmes de confidence · FERMÉ

**Commit :** `cd39382`

Deux formules coexistaient pour le même concept :
- Système A `computeConfidence()` — alimentait `scoreBar`, `scoreValue`, `premiumInfoLine`
- Système B `buildMarketContext()` — alimentait `cs-score`, `cs-bar`

**Résolution :** extraction de `buildConfidenceInputs(payload)` (fonction pure) centralisant
les pondérations. Les cinq zones UI utilisent désormais
`buildMarketContext(buildConfidenceInputs(payload), payload.market_state)` comme source unique.

**Zones unifiées :** `scoreBar` · `scoreValue` · `premiumInfoLine` · `cs-score` · `cs-bar`

**Conservé intentionnellement :**
- `computeConfidence()` — legacy, zéro appel actif, non supprimée
- `extractConfidenceCtx()` — toujours nécessaire pour `_ctx.marketState` (posture / action / agent)

**Dette documentaire résiduelle :** commentaire bloc `render.js:526–538`
("DEUX SYSTÈMES COEXISTENT") désormais obsolète — soldée en R-02 (`d78c3d1`).

### TEC-02 — console.log temporaire · FERMÉ

**Commit :** `927941e`

`console.log('[bhv:ui] handleImport appelé', file?.name)` supprimé de `behavior-view.js:1173`.

### DOC-01 — README.md persistence incorrect · FERMÉ

**Commit :** `927941e`

`src/js/behavior/README.md` indiquait "Persists nothing (in-memory only)" en deux endroits.
Corrigé pour refléter la storage bridge V3 (`cameleon.behavior.v1.*` namespace).

### UX-01 — Hiérarchie typographique Moteur Narratif · FERMÉ

**Commit :** `5d9203a`

Inversion CSS-01 corrigée dans `style.css` :
- `.engine-journal-main` : 22px → 24px
- `.signal-narratif-main` : 24px → 22px
- `.mantra-operationnel-main` : 20px (inchangé)

Hiérarchie rétablie : Journal (24) > Signal (22) > Mantra (20).

### UX-04 — NAR-C1 · Décision doctrinale Mantra · FERMÉ

**Décision :** Mantra absolu par état de marché (Option A).

- Le Mantra opérationnel est une **loi d'état**, pas une instruction de profil.
- Il reste piloté exclusivement par `MARKET_DICTIONARY` (7 phrases, une par état).
- Aucun branchement profil / mode opérateur n'est autorisé dans `.mantra-operationnel-main`.
- `engine.js:408` `mantraMain` n'est pas un Mantra opérationnel — c'est un rappel tactique
  distinct, non branché, à traiter séparément si pertinent.

**NAR-C1 n'est plus un prérequis bloquant pour les chantiers NAR-BK, NAR-RO, NAR-IN et NAR-CO.**

### R-02 — Commentaire confidence obsolète · FERMÉ

**Commit :** `d78c3d1`

Commentaire `render.js:525–538` rendu obsolète par TEC-01. Dette créée par TEC-01,
non comptabilisée dans le stock des 16 dettes restantes.

**Ancien contenu :**
- affirmait que deux systèmes de confidence coexistaient ;
- présentait `computeConfidence()` comme encore utilisé ;
- mentionnait un TODO (Phase 2) déjà réalisé.

**Correction :**
- score UI unifié via `buildMarketContext(buildConfidenceInputs(payload), payload.market_state)` ;
- `computeConfidence()` conservée en legacy non appelée ;
- `extractConfidenceCtx()` conservée uniquement pour fournir `marketState` aux fonctions de vocabulaire.

**Nature :** dette documentaire — aucun changement de logique.

---

## Dettes soldées — sessions 2026-06-07 (sessions 7–9)

### ADU-04A — UUID identity locale · CLÔTURÉ

**Commit :** `358d9b2` · 2026-06-07

Création de `CE_identity_v1` dans `KEYS` (storage.js), implémentation de `identity.get()` / `identity.ensure()` / `identity.clear()`, et `withUserKey()` (dormant à ce stade).

**Résolution :** fondation de l'identité locale UUID V1 — RFC 4122, généré silencieusement, aucun serveur, aucun email.

---

### ADU-04B — Migration UUID + namespacing 9 clés · CLÔTURÉ

**Commit :** `b4eb8d2` · 2026-06-07

Implémentation de `runUUIDMigration()` et `runUUIDCleanup()`, liste `_OPERATOR_KEYS` (9 clés), helpers privés de migration, session de grâce (withUserKey retourne clé legacy si flag absent).

**Résolution :** 9 clés opérateur namespacées `__{uuid}` · migration automatique au lancement · nettoyage legacy au 2e lancement · idempotente.

---

### ADU-04C — Corrections audit + activation behaviorGuard · CLÔTURÉ

**Commit :** `7118244` · 2026-06-07

Corrections post-audit : flag try/catch migration + gate withUserKey. Activation 6 exports. `behavior-repo.js` : 3 clés persistantes namespacées via `_resolveKey()`. Branchement `state.js`.

**Résolution :** namespacing transparent pour tous les appelants — storage.js route automatiquement.

---

### ARCH-N2 / ADU-05 — Import Registry activé · SOLDÉE

**Commit :** `1b0f51b` · 2026-06-07

`importRegistry.append()` était une API morte depuis la création. Activation complète : `IMPORT_REGISTRY_LIMIT = 100`, appel après chaque import réussi, `buildRegistryEntry()` 13 champs V1, namespacing UUID via `withUserKey()`.

**Résolution :** registre actif, capé, namespacé. `exportOperatorData()` inclut déjà `importRegistry.getAll()` — aucune modification supplémentaire nécessaire.

**Cas wallet :** `rowsRead = rowsKept = metrics.totalOperations` (pas `trades.length`, inexistant pour wallet).

---

### ARCH-N4 / ADU-06 — Export JSON V1 · CLÔTURÉE

**Commits :** `4741612` / `c98953a` / `7468940` · 2026-06-07

| Bloc | Commit | Contenu |
|---|---|---|
| A | `4741612` | `_readRawJSON()` + `exportOperatorData()` dans `storage.js` |
| B | `c98953a` | `downloadOperatorData()` dans `storage.js` |
| C | `7468940` | Bouton `#exportDataBtn` onglet Mémoire + listener `render.js` |

**Résolution :** Onglet Mémoire → "Exporter mes données" → `cameleon-data-YYYY-MM-DD.json`. 11 sources de données. Schéma V1 figé. Retourne null si identité absente. Restauration hors périmètre V1.

---

### ARCH-N5 — Module portefeuille orphelin · CADUQUE

**Date :** 2026-06-07 · Aucun commit dédié

`wallet_analyzer.js` était documenté comme orphelin. Audit de code effectué : le module est importé par `uploader.js`, branché dans le pipeline NON_TRADING/wallet, et rendu par `behavior-view.js`.

**Résolution :** dette devenue caduque après raccordement effectif du module portefeuille. Les données wallet restent éphémères (non persistées). Chantier Portefeuille différé après signal terrain.

---

### ARCH-N6 / ADU-06 — Accès localStorage directs dans render.js · CLÔTURÉE

**Commits :** `ae68be0` / `87578f3` · 2026-06-07

| Bloc | Commit | Contenu |
|---|---|---|
| A | `ae68be0` | `readCoherenceLevel()` + `readDominantRisk()` ajoutés à `behaviorGuard` dans `storage.js` |
| B | `87578f3` | 3 appels `localStorage.getItem()` directs supprimés de `render.js` → helpers `behaviorGuard` |

**Résolution :** aucun accès raw localStorage sur clés behavior dans `render.js`. Exception permanente : `CE_onboarding_v1` (lignes 5129/5133), lu synchroniquement avant chargement ES modules — exclusion architecturale volontaire.

---

### MEM-01B Bloc A — Caps mémoire · CLÔTURÉ

**Commit :** `abed3b4` · 2026-06-07

| Constante | Avant | Après | Fichier |
|---|---|---|---|
| `SESSION_LIMIT` | 20 | **50** | `session-repo.js` |
| `HISTORY_LIMIT` | 50 | **200** | `data.js` (source unique) |
| `JOURNAL_LIMIT` | 50 (privé) | **supprimé** | `storage.js` → importe `HISTORY_LIMIT` |

**Résolution :** source unique pour `HISTORY_LIMIT` dans `data.js`. `JOURNAL_LIMIT` privé supprimé. `BACKUPS_LIMIT = 50` inchangé.

---

### MEM-01B Bloc B — Enrichissement schema backups · CLÔTURÉ

**Commit :** `11019c7` · 2026-06-07

`handleManualSnapshot()` dans `render.js` — nouveaux champs dans chaque snapshot `CE_backups_v1` : `schemaVersion`, `profile`, `confidenceScore`, `macroContext: null`, `v2State: null`.

**Résolution :** compatibilité ascendante totale — lecteurs existants n'utilisent que les champs pré-existants.

---

### MEM-01B Bloc C — Snapshot analytique sessions comportementales · CLÔTURÉ

**Commit :** `b6ec361` · 2026-06-07

Signature `session-repo.save()` migrée vers objet options `save(trades, { snapshot = null, name = null } = {})`. `buildSessionSnapshot(state)` dans `behavior-view.js` — 13 champs figés au moment du clic "Sauvegarder session". `behavior-analyzer.js` recompute toujours depuis `s.trades` — ne lit jamais `s.snapshot`.

**Résolution :** snapshot analytique immutable par session. Signature object options évite collision avec positional params futurs.

---

### MEM-01B Bloc D — importRegistry activé · CLÔTURÉ

**Commit :** `1b0f51b` · 2026-06-07

`IMPORT_REGISTRY_LIMIT = 100` dans `storage.js`. `importRegistry.append()` appelé après chaque import réussi dans `behavior-view.js`. `buildRegistryEntry(result, file)` — 13 champs V1. Cas wallet : `metrics.totalOperations` pour `rowsRead`/`rowsKept`.

**Résolution :** importRegistry n'est plus une API morte. Voir aussi ARCH-N2 soldée.

---

### GUIDE-01B — Guide Opérateur V1 · CLÔTURÉ

**Commit :** `2061162` · 2026-06-07

`docs/operator-guide/guide-operateur-v1.md` — 7 sections, 210 lignes. Premier document d'accueil opérationnel pour les testeurs bêta.

Sections : Ce que fait le moteur · Ce qu'il ne fait pas · Pilotage (entrée) · Moteur (sortie) · Interpréter la décision · Profil opérateur · 5 erreurs fréquentes (dont Guard Level et Validation = input).

Aucune promesse de performance. Aucun conseil financier.

---

### DOC-ALIGN-01→04 — Cohérence documentaire · CLÔTURÉ

**Commits :** `f0ef658` / `e15a2ea` / `55eef76` / `7ce0b5a` · 2026-06-07

| Chantier | Commit | Contenu |
|---|---|---|
| DOC-ALIGN-01 | `f0ef658` | Audit global — ~191 fichiers · 6 types d'écarts · 7 chantiers |
| DOC-ALIGN-02 | `e15a2ea` | Valeurs périmées corrigées (HISTORY_LIMIT, JOURNAL_LIMIT, branche) |
| DOC-ALIGN-03 | `55eef76` | Guide Opérateur référencé dans README.md + README_FOUNDATIONS.md |
| DOC-ALIGN-04 | `7ce0b5a` | `architecture-donnees-utilisateur.md` aligné post-ADU/MEM-01B |

---

## Dettes soldées — session 2026-06-07 (Portefeuille V1)

### Portfolio V1 — persistance snapshots wallet · CLÔTURÉ

**Commits :** `9275466` / `a574209` / `3e46c6c` / `fa17e6d` / `88c2edd` / `2d6d635`

Premier chantier produit post-DOC-ALIGN. Objectif : capturer la composition wallet après chaque import Wallet History et l'afficher dans l'onglet Comportement.

| Tâche | Commit | Contenu |
|---|---|---|
| T4-prérequis — `rawRows` exposé dans `uploader.js` (branche wallet uniquement) | `9275466` | 1 ligne — `rawRows: rows` dans l'objet retourné |
| T1 — `portfolio-extractor.js` | `a574209` | Module pur : `extract(rows)` → `{ assets[] }` · classification statique stablecoin/major/altcoin · `parseQuantity()` · `parseDate()` |
| T2 — `portfolio-repo.js` | `3e46c6c` | Repo isolation : `getAll()` / `append()` / `clear()` / `buildSnapshot()` · clé `CE_portfolio_v1__{uuid}` |
| T3 — `storage.js` | `fa17e6d` | `KEYS.portfolio` · `PORTFOLIO_SNAPSHOTS_LIMIT=50` · `portfolio` API centrale · `_OPERATOR_KEYS` · `exportOperatorData()` |
| T4 — branchement `behavior-view.js` | `88c2edd` | `persistPortfolioSnapshot()` · injection post-import wallet · détection doublon (fileName + fileSize + 24h) |
| T5 — UI `buildPortfolioSection()` | `2d6d635` | Affichage dernier snapshot — 20 actifs max · métriques · warning doublon · `escHtml()` sur toutes les valeurs utilisateur |
| T6 — Vérification export | — | Audit lecture : `portfolio: portfolio.getAll()` présent ligne 368 `storage.js` · aucun code à modifier |

**10 décisions validées :** D1 valorisation import-only · D2 Wallet History uniquement · D3 snapshot à chaque import · D4 stablecoins inclus · D5 actifs externes différés · D6 clé namespacée · D7 FIFO 50 · D8 append only · D9 doublon non-bloquant · D10 UI section onglet Mémoire

**Dettes résiduelles du chantier :**

| Dette | Nature | Décision |
|---|---|---|
| `portfolio-repo.js` inutilisé | T2 créé mais supplanté par `storage.portfolio` en T4 — deux implémentations du même repo | Suppression différée post-T7 · non urgente |
| CSS `bhv-portfolio-*` sans style propre | Classes présentes dans behavior-view.js, non déclarées dans behavior.css | Différée — aucun impact fonctionnel, héritage `.bhv-card` suffisant |

---

## Dettes à statut conditionnel

### NAR-IN — Collision narrative cluster Range / Instable · CONDITIONNEL

**Audit :** session 2026-06-02

**Anomalie constatée :**
- `range.signal.main` = `"Aucun signal"` — identique à `instable.signal.main`
- `range.mantra` = `"Pas de signal. Pas de trade."` — même patron syntaxique
  que `instable.mantra` = `"Pas de structure. Pas de trade."`

| Catégorie | Verdict |
|---|---|
| Anomalie constatée | OUI — répétition textuelle confirmée |
| Risque théorique | OUI — confusion Range ↔ Instable par habituation possible |
| Problème utilisateur démontré | NON — aucun retour terrain, aucun opérateur externe |

La dette n'est ni fermée (l'anomalie existe dans le corpus),
ni ouverte (aucun impact démontré), ni reportée (une condition précise la déclenche).

**Condition de déclenchement — bascule automatique vers OUVERT si :**
- V0 Transmission activée (≥ 10 opérateurs réels) ; ou
- Premier retour terrain documentant une confusion Range ↔ Instable.

---

## État global post-session

| | Avant session 1 | Après session 1 | Après session 2 | Après session 9 | Post-Portfolio V1 |
|---|---|---|---|---|---|
| Total dettes | 21 | 17 | 16 | 5 différées / conditionnelles | 7 différées / conditionnelles |
| Haute priorité | 8 | 6 | 5 | 0 | 0 |
| Moyenne priorité | 5 | 3 | 3 | 0 | 0 |
| Faible priorité | 8 | 8 | 8 | 0 | 0 |
| Différées / conditionnelles | — | — | — | 5 | 7 (2 nouvelles du chantier Portfolio) |

---

## État du cluster NAR post-audit

| Dette | Périmètre | Résultat audit | Statut |
|---|---|---|---|
| NAR-BK | breakout | Aucune collision détectée | Pas de dette |
| NAR-RO | riskoff | Aucune collision détectée | Pas de dette |
| NAR-IN | instable / range | Collision textuelle confirmée, impact non démontré | CONDITIONNEL |
| NAR-CO | compression / range | Redondances M1/M3 identifiées | Non audité formellement |

NAR-CO reste la prochaine dette narrative active non conditionnée.
Condition de traitement : retour terrain cockpit.

---

> Ce tableau distingue les dettes clôturées, différées, conditionnelles et post-lancement. Une dette différée n'est pas considérée comme un blocage produit.

## Tableau de synthèse — état au 2026-06-07

### Dettes clôturées ou caduques

| Dette | Statut | Commit(s) | Date |
|---|---|---|---|
| TEC-01 — Dualité systèmes confidence | ✅ FERMÉ | `cd39382` | 2026-06-02 |
| TEC-02 — console.log temporaire | ✅ FERMÉ | `927941e` | 2026-06-02 |
| DOC-01 — README.md persistence incorrect | ✅ FERMÉ | `927941e` | 2026-06-02 |
| UX-01 — Hiérarchie typographique Moteur Narratif | ✅ FERMÉ | `5d9203a` | 2026-06-02 |
| UX-04 — NAR-C1 décision doctrinale Mantra | ✅ FERMÉ | décision | 2026-06-02 |
| R-02 — Commentaire confidence obsolète | ✅ FERMÉ | `d78c3d1` | 2026-06-02 |
| SEC-B3 — style inline constellium.html | ✅ FERMÉ | `c5856ec` | 2026-06-03 |
| SEC-B4 — attributs style="" index.html | ✅ FERMÉ | `b5aabbe` / `bce0e74` | 2026-06-03 |
| ADU-04A — UUID identity locale | ✅ CLÔTURÉ | `358d9b2` | 2026-06-07 |
| ADU-04B — Migration UUID + 9 clés | ✅ CLÔTURÉ | `b4eb8d2` | 2026-06-07 |
| ADU-04C — Audit corrections + behaviorGuard | ✅ CLÔTURÉ | `7118244` | 2026-06-07 |
| ARCH-N2 / ADU-05 — Import Registry activé | ✅ SOLDÉE | `1b0f51b` | 2026-06-07 |
| ARCH-N4 / ADU-06 — Export JSON V1 | ✅ CLÔTURÉE | `4741612` / `c98953a` / `7468940` | 2026-06-07 |
| ARCH-N5 — Module portefeuille orphelin | ✅ CADUQUE | — (audit) | 2026-06-07 |
| ARCH-N6 / ADU-06 — localStorage directs render.js | ✅ CLÔTURÉE | `ae68be0` / `87578f3` | 2026-06-07 |
| MEM-01B Bloc A — Caps mémoire | ✅ CLÔTURÉ | `abed3b4` | 2026-06-07 |
| MEM-01B Bloc B — Schema backups enrichi | ✅ CLÔTURÉ | `11019c7` | 2026-06-07 |
| MEM-01B Bloc C — Snapshot sessions comportementales | ✅ CLÔTURÉ | `b6ec361` | 2026-06-07 |
| MEM-01B Bloc D — importRegistry activé | ✅ CLÔTURÉ | `1b0f51b` | 2026-06-07 |
| GUIDE-01B — Guide Opérateur V1 | ✅ CLÔTURÉ | `2061162` | 2026-06-07 |
| DOC-ALIGN-01→04 — Cohérence documentaire | ✅ CLÔTURÉ | `f0ef658`→`7ce0b5a` | 2026-06-07 |
| Portfolio V1 — persistance snapshots wallet (T1–T5) | ✅ CLÔTURÉ | `9275466`→`2d6d635` | 2026-06-07 |

### Dettes différées, conditionnelles ou post-lancement

| Dette | Statut | Condition de déclenchement |
|---|---|---|
| NAR-IN — Collision narrative Range/Instable | CONDITIONNEL | ≥10 opérateurs réels ou confusion terrain documentée |
| NAR-CO — Compression/Range | NON AUDITÉ | Retour terrain cockpit |
| ARCH-N3 — QuotaExceededError silencieux sessions FIFO | DIFFÉRÉE | Données terrain post-bêta |
| DO-02 — Renommage "Mémoire comportementale" → "SCO" | DIFFÉRÉE | Aucun impact fonctionnel immédiat |
| DO-04 — Multi-opérateur même navigateur | DIFFÉRÉE V2+ | Signal utilisateur ou mise en ligne |
| Security M1–M4 | NON URGENT | Post-mise en ligne |
| FA-01/02/03 — CGU, politique confidentialité, mentions | POST-LANCEMENT | Avant mise en ligne publique |

### Résumé

- **Dettes clôturées ou caduques :** 22
- **Dettes ouvertes critiques : 0**
- **Dettes conditionnelles :** 2 (NAR-IN · NAR-CO)
- **Dettes différées :** 5 (ARCH-N3 · DO-02 · DO-04 · portfolio-repo.js inutilisé · CSS bhv-portfolio-*)
- **Dettes post-lancement :** 2 groupes (Security M1–M4 · FA-01/02/03)
