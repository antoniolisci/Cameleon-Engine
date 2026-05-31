# Architecture technique — Caméléon Engine
## Document de transmission · Agent IA · Lecture codebase réelle

> Ce document décrit uniquement ce qui existe dans le codebase au moment de sa rédaction.
> Branche de référence : `feature/allowed-engine` — post V1/V2/V3.
> Aucune spécification future. Aucune prose. Faits techniques uniquement.

---

## 1. Vision technique du projet

**Type :** Application web client-side, single-page, zéro dépendances.
**Stack :** HTML5 + ES modules natifs + CSS custom properties. Pas de framework, pas de bundler, pas de npm.
**Environnement d'exécution :** Navigateur uniquement. Requiert un serveur HTTP local (CORS bloque `file:///`).
**Démarrage :** `powershell -ExecutionPolicy Bypass -File .\serve-local.ps1 -Port 8000` puis `http://localhost:8000/src/index.html`.
**Persistance :** `localStorage` uniquement. Pas de backend, pas d'API, pas de base de données.
**Langue du code :** Français (UI labels, noms de variables, commentaires). Pas de couche i18n.
**Version payload :** `"7.3.2e-shell + 4.5-engine"` (string littérale dans `buildPayload()`).

---

## 2. Architecture runtime

```
src/index.html          — shell HTML unique, 3 tabs + sidebar comportement
src/js/render.js        — (~4800+ lignes) init, bindings, rendu DOM, animations
src/js/engine.js        — pipeline de scoring et buildPayload()
src/js/decision.js      — table de décision state:modifier → posture/actions
src/js/market-state.js  — assessMarket() — lecture structurée du marché
src/js/trading-policy.js — getTradingPolicy() — allowed/forbidden par DecisionState
src/js/moteur.js        — API secondaire V4.5 (wrapper simplifié, pas pipeline principal)
src/js/confidence-score.js — score de lisibilité marché (4 facteurs)
src/js/execution-confidence.js — [V2] curseur confiance d'exécution 0–100
src/js/friction.js      — [V3] ralentisseur cognitif temporel
src/js/ux-state.js      — computeUXState() — dérive le DecisionState depuis le payload
src/js/state.js         — loadState() / saveState() — API état application
src/js/storage.js       — couche localStorage centralisée (toutes les clés)
src/js/data.js          — constantes, labels, presets, FIELD_GROUPS, DEFAULT_FORM
src/js/behavior/        — module comportemental isolé (voir Section 11)
src/css/style.css       — thème principal
src/css/behavior.css    — styles module comportemental (préfixe .bhv-)
```

**Chargement :** `render.js` est le point d'entrée via `<script type="module">`. Il importe tous les autres modules JS. Pas de lazy loading. Tout est chargé au démarrage.

---

## 3. Pipeline moteur

Entrée : 16 champs de formulaire (`FIELD_GROUPS` dans `data.js`).
Sortie : objet payload complet (`buildPayload()` dans `engine.js`).

### 3.1 Champs d'entrée

**Groupe marketFields (9 champs) :**

| ID | Type | Valeurs |
|---|---|---|
| `market` | select | range / compression / expansion / defense / riskoff |
| `btc` | select | stable / strong / weak |
| `dxy` | select | neutral / up / down |
| `emotion` | select | calm / neutral / stress / fomo |
| `ether` | select | stable / strong / weak |
| `fire` | select | weak / medium / strong |
| `air` | select | weak / emerging / strong |
| `earth` | select | weak / stable / strong |
| `water` | select | weak / risk / explosive |

**Groupe adaptiveFields (7 champs + 2 textareas) :**

| ID | Type | Valeurs |
|---|---|---|
| `userProfile` | select | PASSIVE / BALANCED / ACTIVE |
| `coreOrders` | select | yes / partial / no |
| `needAction` | select | no / maybe / yes |
| `structureSignal` | select | none / compression_breakout / real_breakout / sweep_reclaim |
| `momentumSignal` | select | none / clean / strong |
| `zoneSignal` | select | middle / low_range / high_range / breakout_level |
| `validationState` | select | pending / accepted / adjusted / rejected |
| `validationNote` | textarea | texte libre |
| `journalNote` | textarea | texte libre |

### 3.2 Séquence d'exécution dans buildPayload()

```
1. mapLegacyMarketState(v.market)
      market value → { state, modifier }
      Ex: "riskoff" → { state: "defense", modifier: "unstable" }

2. baseEngine(v)
      → score (0–100, somme pondérée des 16 champs)
      → mode (range / pre-breakout / continuation / capital-protection / survival)
      → attackRaw (ON / OFF)
      → sniperRaw (ON / OFF)

3. profileMatrix(v.userProfile, engine, v)
      Filtre par profil PASSIVE / BALANCED / ACTIVE
      → core, attack, sniper, tradingStatus, traffic, reaction

4. applyAdaptiveFilter(profiled, v)
      needAction × coreOrders → engagement_level (FULL / NEUTRAL / REDUCED / MINIMAL / NONE)
      → sizing_factor (0.0 / 0.25 / 0.5 / 0.75 / 1.0)

5. applyValidation(adaptive, v)
      validationState → VALIDATION BLOCK / ADJUSTED / WAIT VALIDATION
      Semi-verrou : accepted sans note → sniper passe en WATCH

6. Overtrading guard (dans buildPayload, inline)
      overtradingLevel (1–5) calculé depuis score + signaux
      Niveau ≥4 → engagement_level forcé REDUCED, attack → LIGHT
      Niveau 5 → attack OFF, sniper OFF, tradingStatus → NO TRADE

7. assessMarket(state, modifier) via market-state.js
      → objet marketReading structuré

8. getDecision(marketReading) via decision.js
      state:modifier key → { primary, alternatives }

9. Calcul alertLevel, alignment, trigger, why[], tags[]

10. Assemblage du payload final (objet ~40 clés)
```

### 3.3 Valeurs de tradingStatus possibles

`CORE ONLY` / `SNIPER LIGHT` / `SNIPER READY` / `SNIPER WATCH` / `TRADE LIGHT` / `TRADE OK` / `WAIT` / `NO TRADE` / `VALIDATION BLOCK` / `ADJUSTED` / `WAIT VALIDATION`

### 3.4 Valeurs d'engagement_level

`FULL` / `NEUTRAL` / `REDUCED` / `MINIMAL` / `NONE`

### 3.5 Calcul du score brut (computeScore)

Score initial = 50. Ajustements additifs :
- market expansion : +20 / compression : +8 / defense : -20 / riskoff : -35
- emotion calm : +10 / stress : -20 / fomo : -30
- fire strong : +12 / medium : +6 / weak : -4
- air strong : +8 / emerging : +4
- earth strong : +5
- ether strong : +5
- dxy up : -10 / down : +5
- btc strong : +8 / weak : -12
- water explosive : -10 / risk : -5

Résultat clamped 0–100. Pas de normalisation ni de pondération relative.

---

## 4. Pipeline render

`render.js` est le seul fichier qui touche le DOM. Tous les autres modules sont purs (pas d'accès DOM direct, sauf `moteur.js` qui lit `#userProfile` en fallback, et `confidence-score.js` qui écrit dans `.confidence-panel`).

### 4.1 Cycle de rendu principal

```
Événement (clic Calculer / changement de champ)
  → buildPayload(formValues, previousPayload)
  → currentPayload = payload
  → computeUXState(payload) → decisionState (BLOCKED/PROTECT/WAIT/READY/TENSION/ALIGNED)
  → payload.decisionState = decisionState   [injection dans le payload]

Rendu :
  → renderExecutionLevel(payload)        [V2 — curseur confiance d'exécution]
  → renderBehaviorInfluence(payload)     [zone conscience]
  → renderVerdict(payload)               [verdict principal]
  → renderWhyNarrative(payload)          [zone pourquoi]
  → renderMasterCard(payload)            [master-card]
  → renderActionMode(payload)            [boutons de mode]
  → renderScenarios(payload)             [pilotage — scénarios]
  → renderTraderMemory(payload)          [mémoire]
  → renderTraderSignature(payload)
  → renderBehaviorProfile(payload)
  → renderDebugPanel(payload)            [debug brain]
  → saveState(appState)
```

### 4.2 setText() — fonction clé

```javascript
function setText(id, value)
```

Écrit dans `#id` quel que soit l'onglet actif. Tab-agnostique. Les IDs peuvent migrer dans le DOM sans modifier les appels render. C'est le pattern principal d'injection de contenu.

### 4.3 getBehaviorState(payload)

Fonction locale à render.js, non exportée. Source de vérité unique pour l'état comportemental effectif.

Priorité : OVERTRADING > FOMO > STRESS > NEUTRE > CALME.

Sources fusionnées :
1. `payload.behavior.overtradingLevel` — calcul instantané de buildPayload()
2. `behaviorGuard.readHistoricalLevel()` — niveau historique CSV/XLS (TTL 7 jours, namespace `cameleon.behavior.v1.*`)
3. `getAdaptiveTone()` — tone decay-aware depuis behavior.js
4. `payload.emotion_state` — état émotionnel déclaré

### 4.4 renderExecutionLevel(payload)

```javascript
function renderExecutionLevel(payload) {
  const bhvState = getBehaviorState(payload);
  const result   = computeExecutionConfidence(payload, bhvState);
  setText("execConfidenceScore", `${result.score}%`);
  setText("execConfidenceLabel", result.label);
  setText("execConfidencePhrase", result.phrase);
  // met à jour fill width + data-tone
}
```

---

## 5. Modules JS détaillés

### engine.js

- `computeScore(v)` — score brut 0–100
- `baseEngine(v)` — score + mode + attackRaw + sniperRaw
- `profileMatrix(profile, engine, v)` — filtre profil
- `applyAdaptiveFilter(result, v)` — engagement_level + sizing_factor
- `applyValidation(profileOut, v)` — filtre validation humaine
- `detectInconsistencies(v, profileOut)` — retourne string[] d'alertes
- `buildPayload(v, previousPayload)` — assemblage complet
- `deriveUiModel(payload)` — modèle UI dérivé (shellState, journalMain, etc.)
- `prefillConstellium(form)` — preset Constellium par état de marché

**Import :** `data.js`, `market-state.js`, `decision.js`

---

### decision.js

- `getDecision(market)` — entrée `{ state, modifier }`, sortie `{ primary, alternatives }`
- Table `DECISION_TABLE` : 8 clés `state:modifier` → `{ posture, actions, riskLevel }`
- Table `ALTERNATIVES_TABLE` : alternatives classées par score décroissant

**Postures possibles :** ACTIVE / PRUDENCE / AGRESSIVE / WAIT / PROTECT

---

### market-state.js

- `assessMarket(state, modifier)` — objet structuré complet
- `computeRiskLevel(state, modifier)` → `"low" | "medium" | "high"`
- `formatReading({ state, modifier })` → string
- États reconnus : range / compression / expansion / defense
- Modificateurs : stable / unstable

---

### trading-policy.js

- `getTradingPolicy(decisionState)` → `{ allowed: string[], forbidden: string[], message: string }`
- `canExecuteAction(decisionState, action)` → boolean
- Table `DECISION_STATE_POLICY` : 6 états → listes allowed/forbidden

**6 DecisionStates :**

| État | Résumé |
|---|---|
| BLOCKED | Aucune exécution. Observe / Review Context uniquement. |
| PROTECT | Réduction exposition uniquement. Aucune entrée. |
| WAIT | Observation + préparation uniquement. Pas d'entrée. |
| TENSION | Réduit + partiel uniquement. Pas de full position. |
| READY | Préparer uniquement. Attendre confirmation. |
| ALIGNED | Exécution autorisée. Pas d'oversize ni de FOMO Entry. |

**Règle de fusion :** si une action est dans `allowed` ET `forbidden` → elle va en `forbidden`. La prudence prime toujours.

---

### ux-state.js

- `computeUXState(payload)` — dérive le `decisionState` depuis le payload
- C'est ce module qui produit BLOCKED / PROTECT / WAIT / READY / TENSION / ALIGNED
- Le résultat est injecté dans `payload.decisionState` par render.js avant le rendu

---

### execution-confidence.js (V2)

- `computeExecutionConfidence(payload, bhvState)` → `{ score, label, tone, phrase }`
- Fonction pure — reçoit le bhvState résolu par l'appelant (render.js via getBehaviorState)

**Matrices :**

```
BASE_SCORE :         ALIGNED=90  TENSION=65  READY=50  WAIT=30  PROTECT=15  BLOCKED=0
ENGAGEMENT_MULTIPLIER: FULL=1.0  NEUTRAL=0.9  REDUCED=0.7  MINIMAL=0.4  NONE=0.0
BHV_DELTA :          CALME=+5  NEUTRE=0  STRESS=-10  FOMO=-15  OVERTRADING=-25

score = clamp(0, 100, round(BASE × MULTIPLIER + DELTA))
```

**Labels par score :**
- ≥80 : "Confiance élevée" (tone: high)
- ≥55 : "Confiance partielle" (tone: moderate)
- ≥30 : "Confiance réduite" (tone: low)
- ≥1 : "Confiance faible" (tone: minimal)
- 0 : "Hors condition" (tone: none)

---

### friction.js (V3)

- `FRICTION_DELAY(score)` → 0 / 1500 / 3000 / 5000 ms
- `getFrictionMessage(context, score)` → string | null
- `applyFriction(score, btn, messageContainerId, callback, context)` → void

**Grille de délai :**
- score ≥80 : 0ms (immédiat)
- score ≥55 : 1500ms
- score ≥30 : 3000ms
- score <30 : 5000ms

**Règles absolues :**
- La callback s'exécute toujours, quelle que soit la valeur du score
- `btn.disabled = true` pendant le délai uniquement
- Stateless — aucun état global de friction
- Nettoyage automatique (btn.disabled, message, focus) après exécution

**Contextes :** `"snapshot"` | `"offensive"`

---

### confidence-score.js

Module de lisibilité de marché — **différent de execution-confidence.js**.

- `computeConfidenceScore(inputs)` — score de lisibilité marché (pas de signal directionnel)
- `buildMarketContext(inputs, marketState)` — point d'entrée unifié
- `resolveMode({ score, marketState })` → `{ mode: WAIT|CAUTION|ACTIVE, action, message }`
- `getExecutionPolicy(result)` → `{ allowed: boolean, reason: string }`
- `renderConfidencePanel(inputs, marketState)` — injecte dans `.confidence-panel` (optionnel)

**Pondérations :**
- trend : 30%
- structure : 30%
- volatility : 25% (via scoreVolatility — pénalise les extrêmes)
- volume : 15%

**Ce score est distinct** du score brut de baseEngine() et du score d'execution-confidence.js.
Il est appelé depuis render.js via `buildMarketContext()`.

---

### moteur.js

API wrapper V4.5 — **pas le pipeline principal**.

- `getMarketState(data)` → `RANGE | BREAKOUT | REBOUND | TREND | CHAOS`
- `getUserProfile(raw?)` → `PRUDENT | NORMAL | AGRESSIF`
- `getDecision(state, profile, ctx)` → actions, interdictions, confiance
- `runMoteur(data, rawProfile)` — point d'entrée unique
- `fromPayload(enginePayload)` — convertit un payload V7 en sortie V4.5

**Mapping profils :**
- PASSIVE → PRUDENT / BALANCED → NORMAL / ACTIVE → AGRESSIF

**Usage :** API secondaire ou simplifiée. Le pipeline principal reste `buildPayload()` dans engine.js.

---

### state.js

- `loadState()` — lit depuis storage.js (uiState + journalEntries + payloadCurrent) + migrationCheck
- `saveState(state)` — écrit uiState + journalEntries + payloadCurrent
- `createInitialState()` — état par défaut depuis DEFAULT_FORM
- `estimateStateSize()` — taille localStorage en KB

**Shape de l'état application :**
```javascript
{
  form: { ...DEFAULT_FORM },  // 16 champs
  history: [],                // snapshots (max HISTORY_LIMIT = 50)
  lastPayload: null,          // dernier buildPayload() complet
  activeTab: "moteur",
  lastSaved: null
}
```

---

### data.js

Contient tous les constants :
- `FIELD_GROUPS` — définition des 16 champs + leurs options
- `DEFAULT_FORM` — valeurs par défaut du formulaire
- `STATE_LABELS`, `STATUS_LABELS`, `TOKEN_LABELS`, `ENGINE_MODE_LABELS`
- `PROFILE_LABELS`, `VALIDATION_TEXT`
- `AUTO_FILL_PRESETS`, `PUBLICATIONS_SECTION`, `PUBLICATION_CATEGORY_SUMMARIES`
- `HISTORY_LIMIT = 50`, `DEFAULT_TAB = "moteur"`
- `getActionModeConfig()`, `getMarketStateConfig()`, `getArticlesForMarketState()`

---

### storage.js

Couche localStorage centralisée. **Tous les accès localStorage passent par ce module.**

**Clés :**

| Clé | Contenu | Limite |
|---|---|---|
| `CE_settings_v1` | Paramètres utilisateur | — |
| `CE_payload_current_v1` | Dernier payload buildPayload() | — |
| `CE_journal_entries_v1` | Historique journal | 50 entrées |
| `CE_behavior_sessions_v1` | Sessions comportementales CSV/XLS | — |
| `CE_import_registry_v1` | Registre des imports | — |
| `CE_ui_state_v1` | État UI (onglet actif, form) | — |
| `CE_backups_v1` | Snapshots moteur manuels | 50 entrées |
| `cameleon.behavior.v1.guardLevel` | Niveau comportemental historique | TTL 7 jours |
| `cameleon.behavior.v1.guardLevelUpdatedAt` | Timestamp du guardLevel | — |

**Objets exportés :** `settings`, `payloadCurrent`, `journalEntries`, `behaviorSessions`, `importRegistry`, `uiState`, `backups`, `behaviorGuard`

**Note :** les clés `cameleon.behavior.v1.*` sont écrites par `behavior-repo.js` et lues par `render.js` via `behaviorGuard.readHistoricalLevel()`. Pas d'écriture via storage.js côté behavior.

---

## 6. Structure HTML du cockpit

### 6.1 Tabs principaux

```
Tab Moteur   (data-tab="moteur")
Tab Pilotage (data-tab="pilotage")
Tab Mémoire  (data-tab="memoire")
Sidebar comportement (behaviorTabBtn → behavior-root)
```

### 6.2 Structure interne — Tab Moteur

Ordre d'affichage (CSS flexbox order) :

```
[order:0] section.zone-conscience      — État d'exécution (bhvInfluencePanel)
           #bhvInfluenceLevel           — label comportemental
           #bhvInfluenceText            — phrase contextuelle

[order:1] section.verdict-shell        — Verdict principal
           div.exec-confidence-block   — [V2] Curseur confiance d'exécution
             #execConfidenceScore      — score numérique (ex: "72%")
             .exec-confidence-bar > #execConfidenceFill — barre
             #execConfidenceLabel      — label (ex: "Confiance partielle")
             #execConfidencePhrase     — phrase factuelle
           [verdict content...]

[order:2] section.pourquoi-shell       — Zone narrative (pourquoi)

[order:3] section.master-card          — Master card
```

### 6.3 Conteneurs friction (V3)

```html
<div id="snapshotFrictionMsg" class="friction-message" hidden></div>
<div id="attackFrictionMsg"   class="friction-message" hidden></div>
<div id="sniperFrictionMsg"   class="friction-message" hidden></div>
```

Adjacents aux boutons correspondants. Vides par défaut. Peuplés dynamiquement par applyFriction(), nettoyés après exécution.

### 6.4 Boutons de mode

```
#modeCoreBtn    → activateTab("pilotage") + focusPanel("coreText")
#modeAttackBtn  → [V3 frictionné] activateTab("pilotage") + focusPanel("action")
#modeSniperBtn  → [V3 frictionné] activateTab("pilotage") + focusPanel("triggerBox")
#modeWaitBtn    → activateTab("moteur") + focusPanel("lectureDayMain")
```

**Important :** ces boutons sont purement navigationnels. Ils n'écrivent aucun état moteur. L'état `active` est imposé par `setActionMode(payload)` dans le cycle de rendu.

### 6.5 Bouton snapshot

```
#saveSnapshotBtn → [V3 frictionné] handleManualSnapshot() → saveSnapshot()
                   → backups.prepend(snapshot) [localStorage write]
```

### 6.6 Debug Brain

Panel latéral togglé depuis l'UI. Affiche : raw engine state, posture, confidence breakdown, allowed/forbidden lists. Rendu dans render.js via `renderDebugPanel(payload)`.

---

## 7. Structure CSS importante

### 7.1 Fichiers

- `src/css/style.css` — thème principal, header, sidebar, shells, panels, debug brain
- `src/css/behavior.css` — styles module comportemental (préfixe `.bhv-`)

### 7.2 Système CSS order (moteur-flow)

```css
.moteur-flow > .zone-conscience { order: 0; }
/* verdict-shell : order: 1 (implicite ou déclaré) */
/* pourquoi-shell : order: 2 */
/* master-card : order: 3 */
```

### 7.3 exec-confidence-block (V2)

```css
[data-tone="high"]     → couleur verte
[data-tone="moderate"] → couleur jaune
[data-tone="low"]      → couleur orange
[data-tone="minimal"]  → couleur rouge
[data-tone="none"]     → couleur neutre/grise
```

Le `data-tone` est posé sur `.exec-confidence-fill` ET sur `.exec-confidence-block`.

### 7.4 friction-message (V3)

```css
.friction-message {
  /* texte sobre, petit, calme */
  /* hidden par défaut */
}
[data-friction-state="pending"] {
  /* style bouton grisé pendant le délai */
}
```

---

## 8. V1 — Réduction structurelle

### Zones supprimées de index.html

| Patch | Zone supprimée | Raison |
|---|---|---|
| PATCH-7 | `section.side-card` "Niveau d'exécution" | Redondance avec le verdict |
| PATCH-8 | Section Risk/MM | Redondance avec Gestion de position |
| PATCH-9 | Section Trade Setup + Suivi de trade | Précision simulée, pas utilisée |
| PATCH-10 | `div.agent-grid` | Redondant avec verdict + pourquoi |
| PATCH-11 | Centre de décision réduit à `#decisionSummaryHeadline` | 6 textes redondants supprimés |
| PATCH-12 | `div.hero-kpi-grid` + `div.hero-bar` | Micro-données non actionnables |
| PATCH-13 | `div.master-grid` + `div.micro-summary-panel` | Doublon master-card |

### Appels render.js supprimés

PATCH-9 : `renderTradeSetup()` + `renderLiveTradeManagement()` retirés du cycle.
PATCH-10 : 8 appels `setText` retirés (executionFrame, allowedActions, profileReaction, blockedActions, postureActions, priorityActions, _bhvBlocked dict).
PATCH-11 : 6 appels `setText` retirés (decisionSummaryText, decisionAgentText, decisionAvoidText, alertLevel, trafficLight, ultraShortPanel).
PATCH-12 : constante `shortMarketLabel` + 9 appels `setText` retirés.
PATCH-13 : `setText("microUltraShortText", ...)` retiré.

---

## 9. V2 — Confiance d'exécution

### Nouveau fichier

`src/js/execution-confidence.js` — module pur, aucun accès DOM.

### Nouveau bloc DOM (remplace #execPermission)

```html
<div class="exec-confidence-block" id="execConfidenceBlock">
  <div class="tiny-label">Confiance d'exécution</div>
  <div class="exec-confidence-score" id="execConfidenceScore">—</div>
  <div class="exec-confidence-bar">
    <div class="exec-confidence-fill" id="execConfidenceFill" style="width:0%"></div>
  </div>
  <div class="exec-confidence-label" id="execConfidenceLabel">—</div>
  <p class="exec-confidence-phrase" id="execConfidencePhrase"></p>
</div>
```

### Zone Conscience (bhvInfluencePanel)

`section.card.zone-conscience` ajoutée avant verdict-shell dans `div.moteur-flow`.
`id="bhvInfluencePanel"` sur la section elle-même (pour show/hide via `renderBehaviorInfluence()`).
`display:none` par défaut — visible uniquement si données comportementales disponibles.

### Wording modifié dans render.js

| Ancien | Nouveau |
|---|---|
| "Hors exécution" | "Hors condition" |
| "Cadre verrouillé" | "Contexte non favorable" |
| "STOP" | "PAUSE" |
| "Protection active" | "Présence réduite" |
| "Validation refusée…" | "Setup non retenu…" |
| "Bloqué" | "En protection" |

---

## 10. V3 — Friction graduelle

### Nouveau fichier

`src/js/friction.js` — module pur, aucun accès au moteur, au scoring, au localStorage.

### Points d'injection dans render.js

**Snapshot** (`#saveSnapshotBtn`) :
```javascript
btn.addEventListener("click", () => {
  if (!latestSnapshotContext) return;
  const score = computeExecutionConfidence(
    currentPayload, getBehaviorState(currentPayload)
  ).score;
  applyFriction(score, btn, "snapshotFrictionMsg", () => {
    handleManualSnapshot(...)
  }, "snapshot");
});
```

**Mode ATTACK** (`#modeAttackBtn`) — wrappé dans applyFriction, context: "offensive".
**Mode SNIPER** (`#modeSniperBtn`) — wrappé dans applyFriction, context: "offensive".
**Mode CORE** (`#modeCoreBtn`) — **non frictionné** (posture défensive).
**Mode WAIT** (`#modeWaitBtn`) — **non frictionné** (posture neutre).

### Registre de messages de friction

Contexte `"snapshot"` :
- tier moderate (55–79) : `"Enregistrement dans un instant — confiance : ${score}%."`
- tier low (30–54) : `"Confiance réduite (${score}%) — état enregistré pour suivi comportemental."`
- tier minimal (1–29) : `"Confiance faible (${score}%) — enregistrement en cours."`
- tier none (0) : `"État hors condition enregistré."`

Contexte `"offensive"` :
- tier moderate : `"Mode offensif — confiance actuelle : ${score}%."`
- tier low : `"Confiance réduite — posture offensive disponible. Prendre un moment."`
- tier minimal : `"Confiance faible (${score}%) — panel disponible dans quelques secondes."`
- tier none : `"Hors condition d'exécution — navigation en cours."`

---

## 11. Module comportemental

### Localisation

`src/js/behavior/` — submodule isolé.

### Isolation contract (strict)

- Lit **aucune** donnée du moteur principal
- Émet **aucun** événement global
- Pose **aucune** propriété `window.*`
- Se désactive proprement quand un onglet moteur est cliqué
- Toutes les données comportementales sont **in-memory** pendant la session

### Pipeline

```
uploader.js          — drag & drop / file input
  → parser.js        — CSV parser (détection séparateur auto: tab / ; / ,)
  → canonical.js     — normalisation en format trade canonique
  → validator.js     — trade-validator.js + validator.js
  → metrics.js       — computeMetrics() — statistiques de comportement
  → patterns.js      — detectPatterns() — 5 patterns : loss_chasing / revenge_trading /
                        size_inconsistency / overtrading / rapid_reentry
  → scoring.js       — score 0–100, profil, risque dominant
  → coaching.js      — messages adaptatifs
  → behavior-view.js — injection DOM dans #behavior-root
```

### Profil comportemental (4 labels)

`Discipliné` / `Réactif` / `Impulsif` / `Agressif`

### Poids des patterns (scoring.js)

| Pattern | Poids |
|---|---|
| loss_chasing | 25 |
| revenge_trading | 20 |
| size_inconsistency | 20 |
| overtrading | 15 |
| rapid_reentry | 15 |

### Lien avec le moteur principal

Le module comportemental **n'injecte pas** directement dans buildPayload().
Il écrit dans localStorage sous le namespace `cameleon.behavior.v1.*` :
- `cameleon.behavior.v1.guardLevel` — niveau 1–5
- `cameleon.behavior.v1.guardLevelUpdatedAt` — timestamp UNIX

`render.js` lit ce niveau via `behaviorGuard.readHistoricalLevel()` (TTL 7 jours) et le fusionne dans `getBehaviorState()` avec `overtradingLevel` instantané.

**Le comportemental influence le score de confiance d'exécution (V2) via getBehaviorState → BHV_DELTA. Il n'influence pas buildPayload() directement.**

### Fichiers complémentaires

- `behavior-matrix.js` — `getBehaviorMatrixEntry()`, `getDisciplineImage()`
- `behavior-bridge.js` — pont optionnel
- `style.js` — style analytique
- `wallet/wallet_analyzer.js` — analyse wallet (expérimental)
- `storage/behavior-repo.js` — écriture localStorage namespace behavior
- `storage/session-repo.js` — sessions
- `normalize/mappers/binance_spot.js` — mapping format Binance Spot

---

## 12. Import Excel/CSV

### Point d'entrée

`src/js/behavior/import/uploader.js` — gère drag & drop et `<input type="file">`.

### Parser CSV

`src/js/behavior/import/parser.js`

- Détection automatique du séparateur (tab / ; / ,) sur la première ligne
- Gestion des champs entre guillemets
- Tolérance sur le nombre de colonnes (colonnes manquantes → chaîne vide)
- Compatibilité : exports Binance Spot (+ mapping dédié `normalize/mappers/binance_spot.js`)

### Pas de support XLSX natif

Aucune dépendance XLSX dans le codebase. L'import Excel requiert une conversion préalable en CSV côté utilisateur, ou un parser XLS distinct non présent actuellement.

### Registre d'imports

Chaque import est logué dans `CE_import_registry_v1` via `importRegistry.append(entry)`.

---

## 13. localStorage et persistance

### Architecture de persistance

```
Toutes les lectures/écritures → storage.js (sauf behavior-repo.js)
Pas de sessionStorage
Pas d'IndexedDB
Pas de cookies
```

### Ce qui est persisté

| Clé | Persisté | Éphémère |
|---|---|---|
| Form state | ✓ CE_ui_state_v1 | |
| Dernier payload complet | ✓ CE_payload_current_v1 | |
| Historique journal | ✓ CE_journal_entries_v1 (max 50) | |
| Snapshots manuels | ✓ CE_backups_v1 (max 50) | |
| Sessions comportementales | ✓ CE_behavior_sessions_v1 | |
| Registre imports | ✓ CE_import_registry_v1 | |
| Analyse comportementale | | ✓ in-memory uniquement |
| decisionHistory | | ✓ variable module render.js |
| overtradingStreak | | ✓ variable module render.js |

### Limite et guard

Limite journal : `JOURNAL_LIMIT = 50` dans storage.js.
Limite backups : `BACKUPS_LIMIT = 50` dans storage.js.
Limite history dans state.js : `HISTORY_LIMIT = 50` dans data.js.

`canUseStorage()` — probe write/remove avant tout accès réel.

### Migration

`runMigration()` est appelé dans `loadState()` avant lecture. Gère les changements de schéma de clés localStorage.

---

## 14. Dette technique connue

### Dette certifiée

**render.js (~4800+ lignes)** — fichier monolithique. Contient : init, bindings, tous les renderers, animations, historique, debug panel. Pas de découpage en sous-modules.

**getBehaviorState() non exportée** — `computeExecutionConfidence()` ne peut pas être testé de manière autonome sans mocker getBehaviorState. L'appelant (render.js) doit résoudre et passer bhvState.

**computeUXState() dans ux-state.js** — importé dans render.js. L'injection de `decisionState` dans le payload se fait dans render.js, pas dans buildPayload(). Le payload produit par buildPayload() ne contient pas decisionState nativement.

**Score brut vs score confiance vs score lisibilité** — trois scores distincts dans le codebase :
1. `buildPayload().score` — score brut moteur 0–100
2. `computeExecutionConfidence().score` — confiance d'exécution 0–100
3. `computeConfidenceScore().score` — lisibilité de marché 0–100

Aucun de ces scores n'est unifié. Ils sont calculés indépendamment à chaque rendu.

**Overtrading guard inline dans buildPayload()** — logique embarquée dans la fonction d'assemblage plutôt que dans une fonction dédiée.

**confidence-score.js** — module complet avec renderConfidencePanel() et renderConfidenceScore() qui accèdent au DOM directement, contrairement à tous les autres modules. Peut provoquer des side effects silencieux si le DOM ne contient pas les IDs attendus.

**moteur.js** — API V4.5 parallèle à engine.js V7. Deux systèmes de décision coexistent. La relation d'autorité entre les deux n'est pas formalisée dans le code.

---

## 15. Zones expérimentales

**wallet_analyzer.js** — `src/js/behavior/wallet/wallet_analyzer.js`. Présent dans le codebase, non intégré dans le pipeline comportemental actuel. Chantier d'extension multi-source documenté : `docs/architecture/binance-multi-source-memory.md` (BMSM P1).

**behavior-bridge.js** — pont optionnel entre module comportemental et moteur principal. Non activé dans la version actuelle.

**confidence-score.js / renderConfidencePanel()** — fonctions DOM-aware dans un module qui devrait être pur. Les IDs attendus (`.confidence-panel`, `#cs-score`, etc.) peuvent ne pas exister dans le DOM actuel post-V1.

---

## 16. Modules supprimés

Ces éléments n'existent plus dans le codebase post-V1. Ils ne doivent pas être recréés.

**Zones HTML supprimées :**
- `section.side-card` contenant "Niveau d'exécution" avec `#execPermission` (remplacé par `.exec-confidence-block` en V2)
- Section Risk / Money Management
- Section Trade Setup (champs de setup individuels)
- Section Suivi de trade (live trade management)
- `div.agent-grid` (grille d'agents)
- `div.hero-kpi-grid` (micro-KPIs)
- `div.hero-bar` (barre résumé)
- `div.master-grid` dans master-card
- `div.micro-summary-panel` dans master-card

**IDs retirés (ne plus cibler dans setText) :**
- `decisionSummaryText`, `decisionAgentText`, `decisionAvoidText`
- `alertLevel`, `trafficLight`, `ultraShortPanel`, `microUltraShortText`
- `executionFrame`, `allowedActions`, `profileReaction`, `blockedActions`
- `postureActions`, `priorityActions`
- `execPermission` (remplacé par `execConfidenceBlock`)

**Renderers supprimés de render.js :**
- `renderTradeSetup()`
- `renderLiveTradeManagement()`
- 8 appels setText liés à agent-grid

---

## 17. Risques actuels

**Couplage render.js / engine.js :** render.js importe directement buildPayload et injecte decisionState dans le payload après coup. Tout changement de la shape du payload dans engine.js peut casser render.js silencieusement.

**Deux scores de confiance dans le même rendu :** `computeConfidenceScore()` (lisibilité marché) et `computeExecutionConfidence()` (confiance d'exécution) sont tous deux appelés dans render.js et affichés dans la même vue. Un utilisateur ou développeur peut confondre les deux.

**Friction et timer non nettoyé sur unmount :** `applyFriction()` pose un `setTimeout` et stocke le timer sur `btn._frictionTimer`. Si le bouton est retiré du DOM pendant le délai, le timer ne se nettoie pas automatiquement (le guard est en place mais sans `clearTimeout` explicite sur cleanup externe).

**behaviorGuard TTL 7 jours :** un niveau comportemental historique élevé peut persister 7 jours et influencer le score de confiance d'exécution même après une amélioration comportementale réelle de l'utilisateur.

**confidence-score.js DOM access :** `renderConfidencePanel()` cherche `.confidence-panel` dans le DOM. Si ce sélecteur n'existe pas (post-V1 réduction), la fonction sort silencieusement avec un `console.warn`. Pas d'erreur visible.

---

## 18. Priorités futures probables

Ce document ne propose rien. Il liste ce qui ressort comme incomplet ou fragile à la lecture du codebase.

- Découpage render.js en sous-modules par domaine fonctionnel
- Unification ou clarification des trois scores (brut / exécution / lisibilité)
- Export de getBehaviorState() pour permettre les tests unitaires de computeExecutionConfidence()
- Intégration formelle de wallet_analyzer.js dans le pipeline BMSM ou suppression — voir `docs/architecture/binance-multi-source-memory.md`
- Clarification du rôle de moteur.js V4.5 vs engine.js V7 (hiérarchie d'autorité)
- Nettoyage des IDs orphelins dans render.js (IDs encore ciblés par setText mais absents du DOM)

---

## 19. Ce qu'un nouvel agent NE DOIT PAS casser

**Règles absolues issues du codebase et de la doctrine :**

1. **La callback d'applyFriction() doit toujours s'exécuter.** Jamais de veto dans friction.js.

2. **Ne pas modifier buildPayload() sans vérifier l'impact sur render.js.** Les deux sont couplés par la shape du payload. Toute clé ajoutée ou renommée dans buildPayload() doit être tracée dans render.js.

3. **Ne pas toucher au module behavior/ depuis engine.js ou render.js directement.** L'isolation contract du module comportemental est intentionnelle et documentée.

4. **Ne pas poser d'accès localStorage raw hors de storage.js.** Toute persistance passe par storage.js (sauf behavior-repo.js qui a son propre namespace).

5. **Ne pas recréer les zones supprimées en V1.** Les IDs listés en Section 16 ne doivent pas réapparaître dans le DOM.

6. **setText() est tab-agnostique par design.** Ne pas ajouter de logique de tab-check dans setText(). Les IDs doivent rester uniques globalement dans index.html.

7. **Ne pas frictionner les boutons CORE et WAIT.** La friction est réservée aux postures offensives (ATTACK, SNIPER) et au snapshot. Frictionner CORE ou WAIT contredit la doctrine.

8. **Ne pas introduire de dépendances npm, bundler ou build step.** Le projet est zero-dependency par design.

9. **decisionState n'est pas produit par buildPayload().** Il est produit par computeUXState() et injecté dans le payload par render.js après buildPayload(). Ne pas inverser ce flux.

10. **Le module confidence-score.js est distinct d'execution-confidence.js.** Ils mesurent des choses différentes et ne doivent pas être fusionnés sans audit complet des consommateurs.

---

## 20. Glossaire technique Caméléon

| Terme | Définition technique |
|---|---|
| `buildPayload(v, prev)` | Fonction principale — assemblage complet du payload moteur depuis 16 champs form |
| `decisionState` | État haut niveau dérivé par computeUXState() — BLOCKED/PROTECT/WAIT/READY/TENSION/ALIGNED |
| `engagement_level` | Niveau d'engagement calculé par applyAdaptiveFilter() — FULL/NEUTRAL/REDUCED/MINIMAL/NONE |
| `sizing_factor` | Facteur de sizing dérivé de coreOrders × needAction — 0.0/0.25/0.5/0.75/1.0 |
| `overtradingLevel` | Niveau garde comportemental instantané (1–5) calculé dans buildPayload() |
| `guardLevel` | Niveau comportemental historique (1–5) issu de l'analyse CSV/XLS, TTL 7 jours |
| `bhvState` | État comportemental effectif résolu par getBehaviorState() — CALME/NEUTRE/STRESS/FOMO/OVERTRADING |
| `attackRaw` / `sniperRaw` | Signaux bruts produits par baseEngine(), avant filtres profil/validation |
| `attack_mode_final` / `sniper_mode_final` | Signaux finaux après profileMatrix + applyAdaptiveFilter + applyValidation |
| `tradingStatus` | Label synthétique du statut de trading — CORE ONLY / NO TRADE / SNIPER READY / etc. |
| `validationState` | Validation humaine saisie dans le formulaire — pending/accepted/adjusted/rejected |
| `applyFriction()` | Ralentisseur cognitif temporel — délai proportionnel au score, callback toujours exécutée |
| `computeExecutionConfidence()` | Score 0–100 combinant decisionState × engagement_level × bhvState |
| `computeConfidenceScore()` | Score 0–100 de lisibilité de marché — trend+structure+volatility+volume |
| `computeScore()` | Score brut 0–100 de baseEngine() — somme algébrique des 16 inputs |
| `setText(id, value)` | Injecteur DOM tab-agnostique — trouve #id quel que soit l'onglet actif |
| `assessMarket(state, modifier)` | Lecture structurée de marché — objet complet depuis state:modifier |
| `getTradingPolicy(decisionState)` | Retourne allowed[] et forbidden[] pour un DecisionState donné |
| `mapLegacyMarketState(market)` | Traduit la valeur form en { state, modifier } pour assessMarket() |
| `profil PASSIVE/BALANCED/ACTIVE` | Profil opérateur du formulaire — influe profileMatrix() directement |
| `Constellium` | Groupe des 5 éléments (ether, fire, air, earth, water) — facteurs de marché symboliques |
| `snapshot` | Sauvegarde manuelle de l'état moteur dans CE_backups_v1 via #saveSnapshotBtn |
| `moteur-flow` | Conteneur flex du tab Moteur — ordonne zone-conscience, verdict, pourquoi, master-card |
| `zone-conscience` | Section order:0 — état d'exécution comportemental (bhvInfluencePanel) |
| `behavior isolation contract` | Règle architecturale : src/js/behavior/ ne lit ni n'écrit dans le moteur principal |

---

*Document généré depuis lecture directe du codebase — branche `feature/allowed-engine`.*
*Référence de commit : `acafce7` (dernier commit au moment de la rédaction).*
