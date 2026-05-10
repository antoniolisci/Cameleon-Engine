# Audit connexions modules — Caméléon Engine
## Architecture cognitive du cockpit décisionnel — Cartographie structurelle complète

> Document d'observation pure.
> Ce document cartographie les connexions réelles entre les modules du cockpit.
> Il ne déclenche aucune modification automatique du code.
> À consulter avant toute décision architecturale future.

---

## Résumé exécutif

Caméléon Engine est un **système de décision à trois flux parallèles** qui convergent au moment du rendu via une hiérarchie de priorité. Bien que complet dans sa couverture, il présente :

1. **Opacité** : les décisions comportementales s'appliquent silencieusement — score comportemental invisible
2. **Redondance** : plusieurs formules de confiance coexistent, matrices de politique inexploitées, code mort
3. **Contradictions** : émotion comme filtre à 4 chemins, hiérarchie validation/émotion asymétrique
4. **Liens manquants** : aucun retour engine→behavior ni behavior→engine ; confiance non intégrée aux décisions
5. **Variables mortes** : métriques comportementales calculées mais jamais exposées ni expliquées

Le module comportemental agit à la fois comme **couche de lecture et bloqueur caché**, créant un système où l'utilisateur subit des restrictions sans en comprendre la source.

---

## Section 1 — Architecture du pipeline

### 1.1 Flux d'entrée

```
Formulaire → collectForm() → buildPayload() → computeDecisionState() → computeFinalDecision() → renderDecision()
                   ↓
             engine.js ← market state, emotion, profile, needs, validation
                   ↓
           score (0-100) calculé
                   ↓
   baseEngine() → profileMatrix() → applyAdaptiveFilter() → applyValidation()
```

**Étapes de traitement :**
1. **Collecte formulaire** (render.js l.1086) : `collectForm()` lit tous les champs
2. **Exécution moteur** (engine.js l.235–383) : `buildPayload()` enchaîne 4 fonctions :
   - `baseEngine()` — score brut + signaux ATTACK + SNIPER
   - `profileMatrix()` — overrides par profil
   - `applyAdaptiveFilter()` — ajustement engagement selon needAction × coreOrders
   - `applyValidation()` — contraintes validation humaine
3. **Calcul decisionState** (render.js l.1353–1493) : convertit les sorties moteur → 6 états
4. **Décision finale** (render.js l.1499–1588) : fusionne decisionState + behaviorState → verdict unique
5. **Rendu** (render.js l.171–357) : écrit les valeurs finales dans le DOM

### 1.2 Trois flux parallèles

**FLUX A — Marché (engine.js)**
- Source : market_state, emotion, constellium, DXY, BTC
- Traitement : baseEngine() → score (seuils fixes)
- Sortie : engine.score, engine.mode, attackRaw, sniperRaw
- Portée : payload.score, action labels, verdictNext, plan d'action

**FLUX B — Comportemental (behavior.js + render.js)**
- Source : fréquence soumissions formulaire, historique émotions, répétition validation
- Traitement : updateBehavior() → getRiskScore() → getAdaptiveTone() → getBehaviorState()
- Signaux détectés :
  - `_detectRepetition()` : même état 2× = +20 points
  - `_detectMisalignment()` : WAIT_STATE avec répétition = +25 points
  - `_detectDegradation()` : émotion se dégrade = +30 points
  - `_detectImpulse()` : <8s entre soumissions = +25 points
  - Décroissance : -10 points toutes les 2 min d'inactivité
- Sortie : 5 états (CALME, NEUTRE, STRESS, FOMO, OVERTRADING)

**FLUX C — Validation humaine (engine.js applyValidation)**
- Source : validationState (pending/accepted/adjusted/rejected), validationNote
- Traitement : applyValidation() — 4 branches
- Sortie : modes attack/sniper modifiés, validationSummary

### 1.3 Convergence : computeFinalDecision()

**Ordre de priorité** (l.1499–1588) :
1. **État comportemental (OVERTRADING/FOMO/STRESS)** — priorité maximale si non-neutre
   - Non validé : verdict = BLOCKED, isSilenced = true
   - Setup validé : verdict = PROTECT, isSilenced = false
2. **DecisionState (BLOCKED/PROTECT/WAIT/READY/TENSION/ALIGNED)** — si comportement neutre/calme

**Sortie `finalDecision` :**
```javascript
{
  verdict: "BLOCKED" | "PROTECT" | "WAIT" | "READY" | "TENSION" | "ALIGNED",
  source: "behavioral" | "engine",
  displayMode: "stop" | "protect" | "wait" | "observe" | "execute",
  isSilenced: boolean,
  label: string,
  message: string,
  behaviorState: "OVERTRADING" | "FOMO" | "STRESS" | "NEUTRE" | "CALME"
}
```

---

## Section 2 — Trace variable par variable

### MARKET_STATE / État marché

**Où lu :** render.js l.1355, engine.js l.42–45, l.68–71, moteur.js l.197–224

**Modification du score :**
```javascript
if (market === "expansion")   score += 20
if (market === "compression") score += 8
if (market === "defense")     score -= 20
if (market === "riskoff")     score -= 35
```

**Portée payload :** market_state, market_label, engine_mode, previous_state

**Impact UI :** decisionSummaryHeadline, structureAlert, tone hero, decisionState gates (PROTECT/READY/ALIGNED)

**Classification : FORTE INFLUENCE**
Déterministe sur 6 transitions decisionState. Composant score : -35 à +20.
Note : market_state est lu-seul dans le module comportemental.

---

### EMOTION_STATE / Émotion

**Où lu :** engine.js l.46–48, l.82–83, l.137–142, l.278–279 ; render.js l.1363, l.1367–1382, l.54–74

**Modification du score :**
```javascript
if (emotion === "calm")   score += 10
if (emotion === "stress") score -= 20
if (emotion === "fomo")   score -= 30
```

**Blocage pipeline :**
```javascript
// engine.js l.137-142
if (emotion === "stress" || emotion === "fomo") {
  attack = "OFF", sniper = "OFF"
  tradingStatus = "NO TRADE"
}
```

**Portée payload :** emotion_state, trading_status, behavior.overtradingLevel

**Impact UI :** override decisionState → BLOCKED (FOMO) ou PROTECT (STRESS) avec priorité absolue, heroPriorityDetail, lectureDayMain, body.dataset.behaviorState, workingPayload.engagement_level = NONE

**Classification : INFLUENCE MAXIMALE**
Court-circuite profileMatrix, override decisionState, bloque l'exécution indépendamment de l'opportunité marché.
Note : l'émotion filtre 4 chemins indépendants sans réconciliation — risque de double filtrage.

---

### OPERATOR_PROFILE / Profil opérateur

**Où lu :** engine.js l.88 (profileMatrix), render.js l.172–174, moteur.js l.237–257

**Modification moteur :**
```javascript
// engine.js l.96-135 : 3 branches
PASSIVE  → sniper si conditions strictes ; attack toujours OFF
BALANCED → sniper + attack si conditions alignées
ACTIVE   → sniper + attack permis ; seul profil gardant sniper sur validation "adjusted"
```

**Portée payload :** user_profile, attack_mode_final, sniper_mode_final, trading_status, profile_reaction

**Impact UI :** agentName selection (Sniper/Attaque/Socle), tone décision, profile_reaction text

**Classification : FORTE INFLUENCE**
Conditionne la disponibilité sniper dans profileMatrix. Même score moteur → sorties différentes selon profil.
Note : ne modifie pas la détection comportementale.

---

### HAS_CORE / Socle déjà en place (coreOrders)

**Où lu :** engine.js l.98 (gate PASSIVE sniper), l.163–165 (sizing_factor), l.168

**Modification moteur :**
```javascript
coreOrders === "yes"      → sizing_factor = 1.0
coreOrders === "partial"  → sizing_factor = 0.75
coreOrders absent         → sizing_factor = 0.5

// Combo spécial
if (needAction=no && coreOrders=no) {
  sizing_factor = 0.25
  engagement_level = MINIMAL
}
```

**Portée payload :** core_orders, sizing_factor (0.0–1.0), engagement_level

**Impact UI :** panels opérationnels de gestion de position — PAS affiché dans le texte décisionnel

**Classification : INFLUENCE MODÉRÉE — Couche exécution uniquement**
Module uniquement la taille, pas la décision. Invisible en narration. Peu de conséquence opérationnelle si l'UI ne le reflète pas.

---

### NEED_ACTION / Nécessité d'agir

**Où lu :** engine.js l.151–160, l.250 ; render.js l.1439

**Modification moteur :**
```javascript
needAction === "no"    → attack LIGHT, sniper WATCH, engagement_level = REDUCED
needAction === "maybe" → engagement_level = NEUTRAL
needAction === "yes"   → engagement_level = FULL

// Combo spécial l.168-170
if (needAction=no && coreOrders=no) → sizing_factor = 0.25, engagement_level = MINIMAL
```

**Portée payload :** need_action, engagement_level, behavior.overtradingLevel (+1 si "yes")

**Impact UI :** marqueur traffic_light, gating opérationnel

**Classification : INFLUENCE MODÉRÉE — Couche filtrage**
Dégrade sans bloquer. Combo avec coreOrders crée cas spécial MINIMAL. Peu de conséquence narrative visible.

---

### MOMENTUM_CONFIRMED / Confirmation d'élan

**Où lu :** engine.js l.80–82, l.253 ; moteur.js l.172–176

**Modification moteur :**
```javascript
// Co-condition sniper (TOUTES requises)
sniperRaw = (
  structureSignal !== "none" &&
  momentumSignal !== "none" &&
  zoneSignal in [low_range, high_range, breakout_level] &&
  emotion === "calm"
) ? "ON" : "OFF"

// Malus overtrading si absent
if (momentumSignal === "none") overtradingAdj += 1
```

**Portée payload :** momentum_signal, sniper_mode_raw (conditionnel), behavior.score (marginal)

**Impact UI :** invisible sauf si sniper activé. journalRisk peut mentionner l'absence.

**Classification : FAIBLE INFLUENCE**
Condition de déclenchement uniquement. Doit se combiner avec structure + zone + émotion pour effet. Impact overtrading minimal (1 point).

---

### VALIDATION / Validation humaine

**Où lu :** engine.js l.195–224, render.js l.1504, l.1386–1393

**Modification moteur :**
```javascript
rejected  → attack OFF, sniper OFF, tradingStatus = "VALIDATION BLOCK"
adjusted  → attack LIGHT, sniper OFF si profil non ACTIVE
pending + (attack/sniper ON) → sniper WATCH, attack LIGHT
accepted + !note → sniper WATCH (semi-lock)
```

**Portée payload :** validation.state/note/summary, attack/sniper_final, traffic_light, finalAction

**Impact UI :** safety valve FOMO/OVERTRADING (CRITICAL), hero overlay, LDC override, no-trade block

**Classification : FORTE INFLUENCE (avec nuance)**
Bloqueur dur (rejected). Contrôleur conditionnel (adjusted/pending). Activateur du safety valve (accepted + structure présente).
Note : la validation ne peut pas lever le veto émotionnel — hiérarchie asymétrique.

---

### STRUCTURE_SIGNAL / Signal de structure

**Où lu :** engine.js l.79–82, l.230, l.252 ; render.js l.81–84, moteur.js l.165–169

**Modification moteur :**
```javascript
// Co-condition sniper (requise)
sniperRaw = (structureSignal !== "none" && ...) ? "ON" : "OFF"

// Malus overtrading si absent
if (structureSignal === "none") overtradingAdj += 1

// Safety valve (CRITIQUE)
_isValidatedSetup = validationState === "accepted" && !!structure && structure !== "none"
```

**Portée payload :** structure_signal, sniper_mode_raw, _isValidatedSetup (critique)

**Impact UI :** structureAlert text, activation ou non du safety valve comportemental

**Classification : FORTE INFLUENCE — Enabler safety valve**
La présence/absence de structure détermine si le safety valve FOMO/OVERTRADING peut s'activer. Variable pivot peu visible mais décisive.

---

### TRADING_ZONE / Zone de travail

**Où lu :** engine.js l.81, l.230 ; moteur.js l.167

**Modification moteur :**
```javascript
zoneSignal in ["low_range", "high_range", "breakout_level"]  // co-condition sniper
// Si middle + sniper ON → inconsistency push
```

**Portée payload :** zone_signal, inconsistencies[]

**Impact UI :** invisible sauf incohérence détectée (diagnostic uniquement)

**Classification : FAIBLE INFLUENCE**
Détection d'incohérence uniquement. Invisible si cohérent.

---

### SCORE (calculé)

**Où calculé :** engine.js l.40–63 (computeScore)

**Utilisé dans :**
- baseEngine() l.65–86
- overtrading guard : base 1–5 selon plages de score
- decisionState (render.js) : gates à >=55 (READY) et >=65 (ALIGNED)
- confidence display, premiumInfoLine

**Portée payload :** score, trigger_level, why[], engine_mode

**Impact UI :** scoreSub text, decisionState gates, premiumInfoLine (si non silencié)

**Classification : FORTE INFLUENCE (Fondationnelle)**
Déterministe depuis la formule pondérée. Alimente overtrading et les seuils decisionState. Non immune aux overrides émotion/validation.

---

### ENGAGEMENT_LEVEL

**Où calculé :** engine.js l.155–185, render.js l.373–376

**Utilisé dans :** panels opérationnels (renderExecutionLevel, renderPositionManagement, renderTradeScenarios)

**Classification : INFLUENCE MODÉRÉE — Gating exécution**
Filtre les scénarios opérationnels montrés à l'utilisateur. Pas d'impact sur le texte décisionnel. Appliqué au moment du rendu.

---

## Section 3 — Audit du module comportemental

### 3.1 Couche de lecture ou bloqueur caché ?

**Résultat : HYBRIDE**, créant de l'opacité.

**Comme couche de lecture :**
- Détecte les patterns de soumission formulaire
- Suit l'historique émotionnel
- Calcule un score de risque (0–100) avec décroissance

**Comme bloqueur caché :**
- getBehaviorState() outputs appliqués dans renderDecision() l.196–241
- Aucune explication ni journal des restrictions appliquées
- Utilisateur ne voit pas le score comportemental, ne peut pas le contester
- Impossible de désactiver ou d'accuser réception de la restriction

### 3.2 Flux de données comportemental

```
Soumission formulaire
    ↓
updateBehavior() (behavior.js)
  - _detectRepetition()   → +20 pts
  - _detectMisalignment() → +25 pts
  - _detectDegradation()  → +30 pts
  - _detectImpulse()      → +25 pts
  - _applyDecay()         → -10 pts / 2 min
    ↓
_s.score (0–100, état interne)
    ↓
getRiskScore() → getAdaptiveTone()
    ↓
getBehaviorState() (render.js l.54-74)
  émotion + tone + niveau historique → 5 états
    ↓
renderDecision() (render.js l.171)
  overrides si FOMO/OVERTRADING/STRESS
    ↓
DOM (labels action modifiés, LDC override, hero overlay)
```

### 3.3 Variables mortes du module comportemental

| Variable | Calculée | Exposée | Impact |
|----------|----------|---------|--------|
| `_s.score` (0–100) | oui | **NON** | invisible, décisions opaques |
| `getAdaptiveTone()` | oui | **NON** | intermédiaire uniquement |
| `_s.emotionHistory[]` | oui | **NON** | détection dégradation uniquement |
| `_s.timestamps[]` | oui | **NON** | détection impulsion uniquement |
| `_s.sameStateCount` | oui | **NON** | répétition/désalignement uniquement |

Aucune trace, aucun audit trail des décisions comportementales.

### 3.4 Contradictions du module comportemental

**Contradiction A — Double chemin émotion**
L'émotion issue du formulaire agit sur :
1. computeScore() : -30 FOMO, -20 stress
2. profileMatrix() : hard OFF attack/sniper
3. computeDecisionState() : guard override
4. getBehaviorState() : état comportemental

Résultat : un seul champ formulaire active 4 chemins de contrôle indépendants sans validation croisée.

**Contradiction B — Score instantané vs historique 7 jours**
- behavior.js : calcul instantané (une soumission)
- behaviorGuard.readHistoricalLevel() : niveau stocké localStorage 7 jours
- Fusion par max() dans getBehaviorState() l.56–57 sans explication
- Niveau historique JAMAIS expliqué à l'utilisateur

**Contradiction C — Granularité binaire des signaux**
- 3 répétitions = 20 points (idem que 2)
- Impulsion à 8.1s = 25 points (idem que 10s)
- Aucune pondération par âge du signal ou importance relative

**Contradiction D — Décroissance gelée en inactivité**
- Décroissance appliquée à chaque appel getRiskScore()
- En inactivité : getRiskScore() jamais appelé → score figé
- Résultat : utilisateur qui reprend après pause est pénalisé par un score non décru

### 3.5 Points d'intégration comportementale

| Où | Fonction | Impact |
|----|----------|--------|
| render.js l.54–74 | getBehaviorState() | 5 états de sortie |
| render.js l.196–241 | renderDecision() | override _BHV (action, allowed, heroPrio) |
| render.js l.366–385 | renderOperational() | workingPayload.engagement_level forcé |
| render.js l.99–160 | renderBehaviorCard() | affichage état (après renderDecision) |
| render.js l.1499–1588 | computeFinalDecision() | priorité maximale dans hiérarchie |

**Angles morts :**
- Module comportemental ne communique pas avec confidence-score.js
- Module comportemental ne communique pas avec trading-policy.js
- Signaux comportementaux (score, tone) non exportés, non stockés
- Aucune explication générée pour les restrictions comportementales au-delà des messages pré-rédigés

---

## Section 4 — Analyse du flux cognitif

### 4.1 Le flux suit-il : extérieur → intérieur → synthèse ?

**NON.** Le flux réel est **parallèle puis séquentiel** :

```
EXTÉRIEUR (Signaux marché)          INTÉRIEUR (Comportement)         VALIDATION (Humain)
├─ market_state                      ├─ fréquence soumissions          └─ validationState
├─ emotion                           ├─ historique émotions                    ↓
├─ structure/momentum/zone           └─ répétition validation           applyValidation()
        ↓                                      ↓
   engine.js (FLUX A)               behavior.js (FLUX B)

                        CONVERGENCE (render.js)
              buildCurrentPayload() →
              1. computeDecisionState()
              2. getBehaviorState()
              3. computeFinalDecision()
              4. renderDecision() → DOM
```

Les trois flux sont calculés indépendamment et fusionnent uniquement au moment du rendu. Aucun retour itératif, aucune étape ne voit la sortie des étapes précédentes.

### 4.2 Verdicts parallèles encore présents ?

**OUI — deux points :**

1. **Émotion et score coexistent comme verdicts indépendants.** Score fort + émotion FOMO → le score est ignoré, FOMO prime. L'utilisateur ne comprend pas pourquoi un score élevé ne produit pas d'exécution.

2. **Confiance et décision sont découplées.** Le score de confiance est affiché mais ne conditionne aucune décision. C'est un verdict narratif sans conséquence mécanique.

---

## Section 5 — Modules actifs, redondants, morts

### 5.1 Audit des modules

| Module | Rôle réel | Rôle prévu | Statut |
|--------|----------|-----------|--------|
| engine.js | Scoring + sélection mode | ✓ | **ACTIF** |
| decision.js | Table de décision | ✓ (minimal, souvent hardcodé) | **ACTIF** |
| trading-policy.js | Matrice politique actions autorisées/interdites | Squelette | **IMPORTÉ, NON UTILISÉ** |
| market-state.js | Évaluation état marché | ✓ | **ACTIF** |
| confidence-score.js | Calcul confiance (formule V1) | Legacy | **IMPORTÉ, NON INTÉGRÉ** |
| behavior.js | Détection patterns comportementaux | ✓ + bloqueur opaque | **ACTIF mais opaque** |
| moteur.js | Couche compatibilité V4.5 | Legacy | **IMPORTÉ, NON APPELÉ** |
| state.js | Persistance état formulaire | ✓ | **ACTIF** |
| render.js | Rendu + orchestration décisions | ✓ (surdimensionné) | **ACTIF** |

### 5.2 Variables mortes — Payload

| Champ payload | Calculé | Utilisé | Affiché | Classification |
|---------------|---------|---------|---------|----------------|
| previous_state | oui | trigger logic uniquement | non | mort partiel |
| bestAlternative | oui | extrait | jamais rendu | mort |
| inconsistencies[] | oui | console uniquement | non | mort |
| order_zones | oui | pré-rédigé | non | mort |
| marketReading | oui | non utilisé en aval | non | mort |
| decision.alternatives[] | oui | seul best extrait | non | mort partiel |

### 5.3 Dualité de confiance (critique)

Deux formules de confiance coexistent :

**Formule A — confidence-score.js :**
- trend (30%) + structure (30%) + volatility (25%) + volume (15%)
- Exportée mais non intégrée au pipeline principal

**Formule B — computeConfidence() dans render.js :**
- structure (35%) + alignment (30%) + volatility (variable) + risk (-40%)
- Formule active réellement utilisée

Même input → sorties différentes. La "vérité" de confiance n'est pas définie.

---

## Section 6 — Contradictions et chaînes brisées

### 6.1 Contradiction A — Émotion à 4 chemins

L'émotion module 4 systèmes indépendants :
1. Score : -30 (FOMO), -20 (stress) — pondération directe
2. Hard OFF : attack + sniper désactivés dans profileMatrix
3. Guard override : BLOCKED/PROTECT dans computeDecisionState
4. Behavioral state : input getBehaviorState()

Risque : comportement apparent du système semble aléatoire. Même émotion produit des effets à 4 endroits non connectés.

### 6.2 Contradiction B — Asymétrie validation/émotion

- Émotion = veto absolu (ne peut pas être levé par la validation)
- Validation = permission conditionnelle (peut modifier les restrictions comportementales FOMO/OVERTRADING si setup validé)
- Résultat : émotion > validation dans la hiérarchie, mais c'est non-explicite et contre-intuitif

### 6.3 Contradiction C — Safety valve et structure

- Le safety valve (downgrade FOMO → PROTECT au lieu de BLOCKED) nécessite `_isValidatedSetup`
- `_isValidatedSetup` = `validationState === "accepted" && structure !== "none"`
- Mais `applyValidation()` s'applique indépendamment de la valeur de structure
- Résultat : utilisateur peut avoir validé un structure="none", sans déclencher le safety valve, sans comprendre pourquoi

### 6.4 Liens manquants

| Lien | Status |
|------|--------|
| Engine score → module comportemental | **ABSENT** |
| Module comportemental → engine | **ABSENT** |
| Confiance → décision (gating) | **ABSENT** |
| trading-policy.js → logique décision | **ABSENT** |
| Note de validation → coaching narratif | **ABSENT** |

---

## Section 7 — Classification complète des influences

| Variable / Module | Classification | Justification |
|-------------------|----------------|---------------|
| market_state | **FORTE** | Composant score déterministe ; gates decisionState |
| emotion_state | **MAXIMALE** | 4-chemins de filtrage indépendants ; veto absolu |
| operator_profile | **FORTE** | Gate attack/sniper ; exception ACTIVE adjusted |
| validation | **FORTE** | Bloqueur dur + activateur safety valve |
| structure_signal | **FORTE** | Co-gate sniper ; enabler safety valve (pivot critique) |
| score | **FORTE** | Base overtrading ; gates decisionState >=55/>=65 |
| has_core | **MODÉRÉE** | Levier taille uniquement ; non affiché en narration |
| need_action | **MODÉRÉE** | Dégrade sans bloquer ; combo MINIMAL avec coreOrders |
| engagement_level | **MODÉRÉE** | Gating scénarios opérationnels ; pas d'impact texte décision |
| momentum_confirmed | **FAIBLE** | Co-condition sniper ; impact overtrading marginal |
| trading_zone | **FAIBLE** | Détection incohérence uniquement ; invisible si cohérent |
| Module comportemental | **FORTE mais OPAQUE** | Overrides puissants (BLOCKED) ; raisonnement invisible |
| confidence-score.js | **DÉCORATIVE** | Calculée, non intégrée aux décisions |
| trading-policy.js | **REDONDANTE** | Exportée, jamais consommée |
| moteur.js V4.5 | **VESTIGIALE** | Couche compatibilité legacy, non appelée |

---

## Section 8 — Flux cognitifs : état réel

### Le pipeline suit-il extérieur → intérieur → synthèse ?

**Non.** Le flux est **parallèle puis convergent en fin de chaîne.**

```
Extérieur (marché) ───────────────────────────────────────────────┐
  market_state, score, modes                                       │
                                                                   ▼
Intérieur (comportement) ─────────────────────────────── computeFinalDecision()
  getBehaviorState(), 5 états                                      │
                                                                   ▼
Validation (humain) ──────────────────────────────────── renderDecision()
  attack/sniper modes                                              │
                                                                   ▼
                                                              DOM (UI finale)
```

Aucune itération, aucun retour entre flux. Ils se rencontrent uniquement au moment du rendu.

### Modules qui parlent sans conséquence réelle

| Module | Parle | Conséquence |
|--------|-------|-------------|
| confidence-score.js | affichage score | aucune gate décisionnelle |
| trading-policy.js | matrice BLOCKED/PROTECT/etc. | jamais consultée |
| inconsistencies[] | problèmes détectés | console uniquement |
| behavioral score 0–100 | calculé | jamais exposé |
| bestAlternative | extrait du payload | jamais rendu |

---

## Section 9 — Verdict architectural

### Forces

1. Séparation claire des préoccupations (marché, comportement, validation comme flux distincts)
2. Gates forts sur l'émotion (bloqueur dur dans profileMatrix + computeDecisionState)
3. Safety valve validation pour setups validés (nuance sophistiquée)
4. Payload bien documenté (chaque champ nommé et décrit)
5. Couches de fallback multiples (decisionState → finalDecision → renderDecision)

### Faiblesses

1. **Opacité** : module comportemental opère silencieusement ; score et raisonnement invisibles
2. **Redondance** : deux formules de confiance coexistent ; policy matrix inexploitée
3. **Code mort** : moteur.js, trading-policy.js, confidence-score.js importés mais non utilisés
4. **Contradiction** : émotion filtre 4 chemins sans réconciliation
5. **Liens manquants** : engine et behavior calculés en silo, aucun retour croisé
6. **Décroissance gelée** : score comportemental figé en inactivité, pénalisant à la reprise
7. **Dualité confiance** : deux sources, une seule vérité non définie

---

## Recommandations architecturales (futures phases)

**Priorité haute :**
- Exposer le score comportemental (panel avec explication)
- Fusionner les deux formules de confiance ; choisir une vérité
- Intégrer trading-policy.js dans la logique de décision ou supprimer
- Corriger le modèle de décroissance comportementale (appliquer en inactivité)
- Documenter les signaux comportementaux (pourquoi FOMO ?)

**Priorité moyenne :**
- Ajouter retour behavior → engine (recalculer sur risque comportemental élevé)
- Réconcilier les chemins émotion ; pondération hiérarchique plutôt que 4 filtres indépendants
- Supprimer ou archiver les modules non utilisés

**Priorité basse :**
- Afficher le score de confiance de façon proéminente
- Implémenter les actions trading-policy dans les panels opérationnels
- Journaliser les décisions comportementales pour apprentissage utilisateur
