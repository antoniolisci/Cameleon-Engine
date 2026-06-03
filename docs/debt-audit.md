# Audit des dettes — Caméléon Engine

Dernière mise à jour : 2026-06-03 (session 6)

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

| | Avant session 1 | Après session 1 | Après session 2 |
|---|---|---|---|
| Total dettes | 21 | 17 | 16 |
| Haute priorité | 8 | 6 | 5 |
| Moyenne priorité | 5 | 3 | 3 |
| Faible priorité | 8 | 8 | 8 |

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
