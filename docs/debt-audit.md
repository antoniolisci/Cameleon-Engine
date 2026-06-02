# Audit des dettes — Caméléon Engine

Dernière mise à jour : 2026-06-02 (session 2)

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

### UX-04 — NAR-C1 · Décision doctrinale Mantra · FERMÉ

**Décision :** Mantra absolu par état de marché (Option A).

- Le Mantra opérationnel est une **loi d'état**, pas une instruction de profil.
- Il reste piloté exclusivement par `MARKET_DICTIONARY` (7 phrases, une par état).
- Aucun branchement profil / mode opérateur n'est autorisé dans `.mantra-operationnel-main`.
- `engine.js:408` `mantraMain` n'est pas un Mantra opérationnel — c'est un rappel tactique
  distinct, non branché, à traiter séparément si pertinent.

**NAR-C1 n'est plus un prérequis bloquant pour les chantiers NAR-BK, NAR-RO, NAR-IN et NAR-CO.**

---

## État global post-session

| | Avant session 1 | Après session 1 | Après session 2 |
|---|---|---|---|
| Total dettes | 21 | 17 | 16 |
| Haute priorité | 8 | 6 | 5 |
| Moyenne priorité | 5 | 3 | 3 |
| Faible priorité | 8 | 8 | 8 |

---

## Prochaine dette débloquante non conditionnée

**NAR-BK / NAR-RO / NAR-IN / NAR-CO** : collisions narratives breakout / riskoff / instable.
Condition maintenant satisfaite : NAR-C1 fermé.
Effort : chantier dictionnaire V1.2 — condition de déclenchement : retour terrain cockpit.
