> **ARCHIVÉ**
>
> Ce document décrit un plan désormais implémenté.
>
> Il est conservé comme trace historique du développement de Caméléon Engine.
>
> Pour l'état actuel du système, consulter :
> `docs/architecture/canonical_motor_state_2026.md`
>
> Statut : Implémenté et clôturé.
>
> Ne plus utiliser ce document comme référence d'architecture active.

# Plan V2 — Caméléon Engine
## Reconstruction cognitive : curseur de confiance + séquence narrative

> Document opérationnel. Chaque patch est séquencé par niveau de risque croissant.
> Aucune logique moteur modifiée. CSS hors scope sauf ajout minimal pour le curseur.
> Friction graduelle → V3.

---

## Principe directeur V2

V1 a supprimé le bruit. V2 construit le signal.

La cible : remplacer le modèle binaire (autorisé/interdit) par un modèle graduel
(confiance d'exécution 0–100%) et structurer le flux en trois couches narratives
enchaînées — Observation → Conscience → Décision.

---

## V2-PATCH-1 — `computeExecutionConfidence(payload)` *(risque : faible)*

**Scope :** Nouveau fichier `src/js/execution-confidence.js`.
Fonction pure, sans effet de bord DOM. Exportée et importée dans `render.js`.

**Algorithme :**

Base depuis `decisionState.state` :
- ALIGNED  → 90
- TENSION  → 65
- READY    → 50
- WAIT     → 30
- PROTECT  → 15
- BLOCKED  → 0

Modulation `engagement_level` (multiplicateur) :
- FULL     → ×1.0
- NEUTRAL  → ×0.9
- REDUCED  → ×0.7
- MINIMAL  → ×0.4
- NONE     → ×0.0

Modulation behavioral (soustraction post-multiplicateur) :
- Discipliné → +5 (bonus plafonné à 100)
- Réactif    → 0
- Impulsif   → −15
- Agressif   → −25

Résultat : `Math.max(0, Math.min(100, Math.round(base × multiplier + bhvDelta)))`

**Output :** `{ score: Number, label: String, tone: String }`

Labels selon score :
- 80–100 → label: "Confiance élevée",    tone: "high"
- 55–79  → label: "Confiance partielle", tone: "moderate"
- 30–54  → label: "Confiance réduite",   tone: "low"
- 1–29   → label: "Confiance faible",    tone: "minimal"
- 0      → label: "Hors condition",      tone: "none"

**Test de validation :**
- ALIGNED × FULL × Discipliné → score ≥ 90
- BLOCKED × any → score = 0
- ALIGNED × NONE → score = 0
- WAIT × NEUTRAL × Impulsif → score ≈ 12

---

## V2-PATCH-2 — Display confiance d'exécution *(risque : faible)*

**Scope :** `src/index.html` + `src/js/render.js`

Remplacer le bloc `#execPermission` (label texte binaire) par un bloc graduel :

```html
<div class="exec-confidence-block" id="execConfidenceBlock">
  <div class="tiny-label">Confiance d'exécution</div>
  <div class="exec-confidence-score" id="execConfidenceScore">—</div>
  <div class="exec-confidence-bar">
    <div class="exec-confidence-fill" id="execConfidenceFill"></div>
  </div>
  <div class="exec-confidence-label" id="execConfidenceLabel">—</div>
  <p class="exec-confidence-phrase" id="execConfidencePhrase"></p>
</div>
```

`renderExecutionLevel()` écrit :
- `#execConfidenceScore` → `"${score}%"`
- `#execConfidenceFill` → `style.width = "${score}%"`
- `#execConfidenceLabel` → label textuel
- `#execConfidencePhrase` → phrase narrative factuelle (1 ligne)

Phrases narratives par état :
- BLOCKED             → "Conditions non réunies — aucun engagement recommandé."
- PROTECT             → "Contexte défensif — réduire l'exposition en priorité."
- WAIT × MINIMAL      → "Structure en formation — observation active uniquement."
- WAIT × NEUTRAL      → "Attente active — préparer sans anticiper."
- READY               → "Setup proche — entrée possible sous confirmation."
- TENSION             → "Fenêtre ouverte avec friction — discipline requise."
- ALIGNED × REDUCED   → "Conditions réunies, engagement partiel recommandé."
- ALIGNED × FULL      → "Lecture claire — conditions optimales d'exécution."

**Test de validation :** 5 états moteur, vérifier barre + score + phrase cohérents.

---

## V2-PATCH-3 — Wording : élimination registre carcéral/binaire *(risque : faible)*

**Scope :** `src/js/render.js` uniquement. Substitutions textuelles ciblées.

| Avant | Après | Contexte |
|---|---|---|
| `"Hors exécution"` | `"Hors condition"` | execPermission / getExecutionLevel |
| `"Cadre verrouillé"` | `"Contexte non favorable"` | getHeroCopy() |
| `"STOP"` (pdv-label) | `"PAUSE"` | premium decision block label |
| `"Protection active"` (behavioral) | `"Présence réduite"` | finalDecision labels |
| `"Bloqué"` (état visible) | `"En protection"` | STATE_LABELS affichés |
| `"Validation refusée. Ne pas entrer."` | `"Setup non retenu — attendre conditions claires."` | action label |

**Règle :** ne changer que les strings affichés à l'utilisateur.
Ne pas renommer les constantes internes (`BLOCKED`, `displayMode: 'stop'`, etc.).

**Test de validation :** grep sur les 6 strings "avant" — aucun résultat dans les chemins texte utilisateur.

---

## V2-PATCH-4 — Architecture 3 couches narratives *(risque : modéré)*

**Scope :** `src/index.html` — réorganisation DOM du flux moteur (colonne gauche).

Cible : trois sections enchaînées visuellement, jamais juxtaposées :

**Zone 1 — Observation (marché)**
Contenu actuel : `hero-decision-grid` (Verdict, Agent, Action, Risque)
Action : renommer le bloc en `zone-observation`, simplifier à 2 chips (Régime + Verdict marché).
Ton : sobre, factuel, aucune charge émotionnelle.

**Zone 2 — Conscience (soi)**
Contenu actuel : `bhv-influence-panel` (discret, bas de page)
Action : remonter dans le flux moteur, juste après Zone 1.
Titre : "État d'exécution" (pas "Influence comportementale").
Affichage : état caméléon (5 labels) + niveau d'influence en une ligne.

**Zone 3 — Décision (synthèse)**
Contenu actuel : `Verdict moteur` (section principale)
Action : aucun déplacement — c'est le point focal. Ajouter le bloc confiance (V2-PATCH-2).
Règle : seule zone à "parler fort". Zones 1 et 2 sont visuellement subordonnées.

**Test de validation :**
- La séquence se lit de haut en bas : marché → soi → verdict
- Aucune information en double entre les trois zones
- Zone 3 reste le seul point de décision visible immédiatement

---

## Séquençage et risques

| Patch | Risque | Nature | Mitigation |
|---|---|---|---|
| V2-PATCH-1 | Faible | Fonction pure, pas de DOM | Tester les 4 cas limites |
| V2-PATCH-2 | Faible | Nouveau bloc DOM, ID fresh | Vérifier 5 états moteur |
| V2-PATCH-3 | Faible | Texte seulement | Grep post-patch pour vérifier |
| V2-PATCH-4 | Modéré | Déplacement DOM + renommage sémantique | Lire CSS avant toucher |

---

## Hors scope V2

- Friction graduelle (confirmation explicite, délai) → V3
- Modifications CSS profondes → hors scope
- Logique moteur (engine.js, decision.js) → intouchable
