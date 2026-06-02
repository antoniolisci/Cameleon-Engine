# Audit des dettes — Caméléon Engine

Dernière mise à jour : 2026-06-02

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
("DEUX SYSTÈMES COEXISTENT") désormais obsolète — hors périmètre TEC-01.

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

---

## État global post-session

| | Avant | Après |
|---|---|---|
| Total dettes | 21 | 17 |
| Haute priorité | 8 | 6 |
| Moyenne priorité | 5 | 3 |
| Faible priorité | 8 | 8 |

---

## Prochaine dette débloquante non conditionnée

**UX-04 — NAR-C1** : décision doctrinale Mantra absolu vs contextuel.
Prérequis de toute ouverture du chantier dictionnaire V1.2 (NAR-BK, NAR-RO, NAR-IN, NAR-CO).
Effort : décision doctrinale uniquement — aucun code.
