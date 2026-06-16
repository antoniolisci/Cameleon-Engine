# Caméléon Engine — État Canonique du Moteur (2026)

**Commit de référence :** `aacfad1` — 2026-06-03
**Périmètre :** code source uniquement. Aucune intention, aucune vision future.

> **Révision 2026-06-16**
> Le §2 initial décrivait un `overtradingLevel` calculé dans `buildPayload()` avec 4 ajustements formulaire (`needAction`, `validationState`, `structureSignal`, `momentumSignal`). Ce calcul **n'existe plus dans le code actuel**. `buildPayload()` assigne `behavior.riskLevel = 1` (neutre, fixe). La pression comportementale instantanée est exposée via `payload.market.pressureLevel`. §2 et §6 ont été mis à jour.

---

## 1. Pipeline principal

Le pipeline s'exécute intégralement côté client à chaque appel de `runMoteur()` dans `src/js/moteur.js`.

```
Form Input (16 champs)
  → mapLegacyMarketState()     src/js/market-state.js   — valeurs formulaire → state:modifier
  → baseEngine()               src/js/engine.js          — score brut 0–100 + signaux attack/sniper
  → profileMatrix()            src/js/engine.js          — filtre par profil PASSIVE / BALANCED / ACTIVE
  → applyAdaptiveFilter()      src/js/engine.js          — modulation needAction × coreOrders
  → applyValidation()          src/js/engine.js          — verrou humain : accepted/pending/adjusted/rejected
  → computeTradingPolicy()     src/js/trading-policy.js  — actions autorisées / interdites
  → buildPayload()             src/js/engine.js          — objet décision final
  → render.js                  src/js/render.js          — injection DOM + mise à jour historique
```

Le `buildPayload()` expose également `payload.market.pressureLevel` et `payload.behavior.riskLevel` (voir §2) et le pipeline V2 (voir §4).

**Persistance :** état formulaire + historique (max 50 snapshots) en `localStorage` via `src/js/state.js` et `src/js/storage.js`.

## 2. États comportementaux officiels

### Échelle à 5 niveaux — nomenclature canonique post-`aacfad1`

| Niveau | État | Effets moteur réels |
|--------|------|---------------------|
| 1 | **Ancré** | Aucun |
| 2 | **Veille Active** | Aucun |
| 3 | **Friction** | Aucun |
| 4 | **Dérive** | `engagement_level = REDUCED` · `attack = LIGHT` si attack était ON |
| 5 | **Rupture** | `attack = OFF` · `sniper = OFF` · `tradingStatus = NO TRADE` · `engagement_level = NONE` |

**Fichiers sources :** `src/js/overtrading-dictionary.js` (définitions) · `src/js/behavior/behavior-matrix.js` (patterns analytiques) · `src/js/behavior/behavior-bridge.js` (référence d'échelle)

---

### Pression marché instantanée — `engine.js` · `buildPayload()`

Depuis la refactorisation de juin 2026, `buildPayload()` expose deux champs distincts. Aucun `overtradingLevel` composite n'est calculé.

**`payload.market.pressureLevel`** — pression marché pure, dérivée de `engine.score` (5 seuils, aucun ajustement formulaire) :

```
engine.score > 85  →  5
engine.score > 70  →  4
engine.score > 50  →  3
engine.score >= 30 →  2
engine.score < 30  →  1
```

**`payload.behavior.riskLevel`** — toujours `1` (neutre, fixe). Valeur déclarée, non calculée. Neutre jusqu'à la connexion effective du module comportemental historique (voir §5).

Le niveau effectif affiché dans la carte comportementale est calculé dans `render.js` par merge :
`effectiveLevel = Math.max(payload.behavior.riskLevel, behaviorGuard.readHistoricalLevel())`
avec cap émotionnel (`calm → Math.min(level, 2)`).

**Note sur les sens d'échelle :** `engine.score` élevé = marché actif/risqué → `pressureLevel` élevé. Le score comportemental historique (§5) est sur l'échelle inverse : score élevé = discipliné → `guardLevel` faible dans `behavior-bridge.js`.

---

### Guard historique — lecture dans `render.js`

`render.js:56–64` lit le `guardLevel` stocké en `localStorage` (TTL 7 jours, écrit par `behavior-view.js` après import CSV/XLSX). Le niveau effectif affiché est `Math.max(instantLevel, historicalLevel)`. Ce merge de lecture n'affecte **pas** les effets moteur (engagement REDUCED, attack OFF, etc.) — ceux-ci sont déterminés uniquement par l'`effectiveLevel` calculé dans `render.js` (merge de `riskLevel` et du niveau historique).

## 3. Distinction Friction / friction.js

Deux objets distincts portent le mot "friction". Aucun conflit d'exécution. Confusion documentaire possible.

| | **Friction** | **friction.js** |
|---|---|---|
| Nature | État comportemental niveau 3 | Module UX stateless |
| Fichier | `overtrading-dictionary.js` | `src/js/friction.js` |
| Rôle | Étiquette qualitative : résistance cognitive naissante, biais début | Délai temporel sur boutons d'action proportionnel au score de confiance |
| Effets moteur | Aucun (niveau 3 ne déclenche pas de modification payload) | Aucun — la callback s'exécute toujours, quel que soit le score |
| Déclenchement | Atteint si `effectiveLevel = 3` dans `render.js` (merge `riskLevel` + historique) | Appelé dans `render.js` sur clic snapshot / attack / sniper |
| Grille de délai | — | score ≥ 80 → 0 ms · score ≥ 55 → 1 500 ms · score ≥ 30 → 3 000 ms · score < 30 → 5 000 ms |
| Accès localStorage | — | Aucun (contrat explicite dans le fichier) |

## 4. Ce qui est connecté aujourd'hui

### Pression marché → payload → render

```
engine.js buildPayload()
  → payload.behavior.riskLevel = 1     (fixe, neutre)
  → payload.market.pressureLevel       (entier 1–5, dérivé engine.score)
  → render.js getBehaviorState()       instantLevel = riskLevel ?? 1 · Math.max avec historical
  → renderBehaviorCard()               affichage carte comportementale
  → OVERTRADING_DICT[effectiveLevel]   données texte / images
```

Les effets moteur (engagement, attack, sniper, tradingStatus) sont appliqués dans `buildPayload()` directement, avant que render.js ne soit appelé.

---

### Pipeline V2 — T3 actif en cockpit

```
engine.js buildPayload()
  → src/js/v2/pipeline-v2.js runV2()
      coherence.js   → payload.v2.tensionMap
      hierarchy.js   → payload.v2.hierarchyResult   (winner / absorbed)
      attention.js   → payload.v2.attentionResult   (should_expose / level / suppressed_winner)
      exposition.js  → payload.v2.expositionResult  (message / intention / tension_id / severity)
  → render.js        → #v2MessageBlock              (T3 uniquement, filtre tension_id === 'T3')
```

**Flags actifs — `src/js/v2/flags.js` :**

```
V2_ENABLED:         true
V2_COHERENCE:       true   shadow mode Phase 1
V2_HIERARCHY:       true   shadow mode Phase 2
V2_ATTENTION:       true   shadow mode Phase 2
V2_EXPOSITION:      true   shadow mode Phase 2
V2_COCKPIT_MESSAGE: true   affichage cockpit T3
V2_CALIBRATION:     false  ne pas activer (Phase 6)
```

T1 / T2 / T4 : calculés en shadow mode, filtrés dans `render.js`. Non visibles en cockpit.

---

### friction.js → render.js

`applyFriction()` importé dans `render.js:29`. Appelé sur trois boutons : snapshot (`snapshotFrictionMsg`), attack (`attackFrictionMsg`), sniper (`sniperFrictionMsg`). Utilise le score de confiance d'exécution comme paramètre d'entrée.

## 5. Ce qui existe mais n'est pas connecté

### Module d'analyse comportementale historique — `src/js/behavior/`

Pipeline complet et fonctionnel, isolé du moteur principal par contrat :

```
CSV / XLSX import
  → parser.js → canonical.js → metrics.js → patterns.js
  → scoring.js      → score 0–100 (échelle inverse : haut = discipliné)
  → behavior-bridge.js → mapBehaviorScoreToGuardLevel() → guardLevel 1–5
  → behavior-view.js → localStorage : guardLevel + guardLevelUpdatedAt (TTL 7 jours)
```

Ce guardLevel est **lu** par `render.js` (§4) pour le merge d'affichage, mais il n'entre **pas** dans `buildPayload()`. Les effets moteur (engagement REDUCED, attack OFF, etc.) ne sont donc pas influencés par l'historique comportemental.

---

### behavior-bridge.js — pont prêt, non branché

`src/js/behavior/behavior-bridge.js` expose `buildBehaviorBridgeOutput()` qui produit un descripteur structuré (historicalScore, guardLevel, dominantRisk, source). Ce descripteur n'est pas transmis à `buildPayload()`.

Commentaire explicite dans le fichier :

> "When the historical module is connected to the main engine, the merge point is engine.js → buildPayload() → behavior: { ... }. The merge strategy (max, weighted average, separate field) must be defined explicitly at that point."

La connexion n'est pas implémentée. Aucun merge dans `buildPayload()`.

## 6. Fragmentations connues

Trois systèmes distincts produisent des lectures comportementales. Ils coexistent sans unification.

| Système | Fichier | Calcul | Sortie | Affiché où |
|---------|---------|--------|--------|-----------|
| Pression marché | `engine.js` | engine.score seul (5 seuils) | `pressureLevel` 1–5 dans `payload.market` | Carte comportementale (merge avec historique dans `render.js`) |
| UX State | `ux-state.js` | Historique snapshots session (émotion, décision, marché) | `CALM / TENSION / DRIFT / DANGER` | `.behavior-block` dans actionPlan |
| Drift detection | `render.js:2330` | Comptage FOMO / tension / blocages / attentes sur 20 derniers snapshots localStorage | Alerte contextuelle | `#behaviorAlertCard` / `#preBehaviorAlertCard` |

**L'état "Dérive" (niveau 4) et le `DRIFT` de `ux-state.js`** partagent la même intuition (perte de cap) mais sont calculés indépendamment sur des sources différentes. Aucun de ces trois systèmes ne lit le résultat des deux autres.

## 7. Dettes ouvertes liées à l'état moteur

| ID | Description | Condition de déclenchement |
|----|-------------|---------------------------|
| — | `behavior-bridge` → `buildPayload()` non connecté. Le merge historique n'affecte pas les effets moteur. | Décision architecture explicite requise (max / weighted / champ séparé). Documenté `FUTURE INTEGRATION` dans `behavior-bridge.js` et `behavior/README.md`. |
| `V2-T1T4` | MdS / QdR / DMU absents du payload V1. T1 et T4 ne peuvent pas être calibrés même après V0 terrain. | Exposition de ces champs dans `buildPayload()`. |
| `V2-PH3` | Phase 3 V2 non démarrée. T1/T2/T4 bloqués en shadow mode. | ≥ 50 sessions V0, ≥ 10 opérateurs réels. |
| — | Fragmentations §6 non unifiées. `DRIFT` UX, drift detection, `Dérive` niveau 4 : trois objets distincts. | Aucune condition définie — différé intentionnellement jusqu'à signal terrain. |

---

*Ce document décrit ce qui existe. Pas ce qui est espéré.*
