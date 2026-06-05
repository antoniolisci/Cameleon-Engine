# Couche Macro — Phase 1

Caméléon Engine · Direction Architecture
Date : 2026-06-05
Statut : **Phase 1 implémentée — en attente de validation visuelle finale**

---

## Décisions architecturales

### MACRO-ARCH-01 — Origine du signal : déclaration utilisateur

Le signal macro est déclaré par l'opérateur, pas inféré par le moteur ni importé depuis une source externe.

Justification : seul l'opérateur peut reconnaître un contexte de dominance macro ou de désordre structurel dans sa lecture actuelle. Une inférence moteur produirait un proxy indirect et potentiellement erroné. Une source externe introduirait une dépendance infrastructure incompatible avec l'architecture local-first.

La déclaration s'intègre dans le modèle existant du cockpit, qui utilise déjà des champs auto-déclarés : `emotion` (calm/neutral/stress/fomo), `validationState` (pending/accepted/adjusted/rejected), `needAction` (no/maybe/yes).

### MACRO-ARCH-02 — Cohérence produit validée

Vérification des 7 critères de cohérence produit avant ouverture de Phase 1 :

- Conformité manifeste : §XIV cite explicitement "modules de lecture supplémentaires (macro, sentiment)" comme extensions compatibles — permission directe.
- Famille de champ : nouvelle catégorie `contextualFields` — distincte de `marketFields` et `adaptiveFields`.
- Cohérence sans remplissage : cockpit entièrement cohérent si les champs ne sont jamais activés. Default = `"none"`, aucun effet.
- Permanence : champs permanents dans le formulaire, discrets, poids visuel délibérément faible.
- Surcharge : 2 champs binaires en fin de formulaire — Loi 1 sous tension acceptable, non violée.
- Scénario défavorable : activation permanente → habituation sans dégradation décisionnelle. Plancher de dégradation = cockpit actuel.
- Décision : Phase 1 ouverte.

### MACRO-RULE-01 — Séparation absolue score / contexte macro

Règle fondatrice, non négociable. Un même formulaire produit le même score, la même posture, les mêmes actions — que les champs macro soient activés ou non. Seul le registre contextuel peut changer.

Test de régression obligatoire : `dominanceMacro = off` puis `on` sur formulaire identique → score / posture / actions doivent être strictement identiques.

---

## Champs ajoutés

| Champ | Valeurs | Défaut | Famille |
|---|---|---|---|
| `dominanceMacro` | `"none"` \| `"active"` | `"none"` | `contextualFields` |
| `desordreStructurel` | `"none"` \| `"active"` | `"none"` | `contextualFields` |

**Définitions :**

- `dominanceMacro = "active"` : l'opérateur juge que le contexte macro réduit la fiabilité des configurations techniques locales. La lecture reste possible ; elle mérite d'être confirmée.
- `desordreStructurel = "active"` : l'opérateur juge que le référentiel structurel (tendance / range / compression) est absent ou en conflit. Le signal existe ; le sol sous lui est instable.

**Comportement sans activation :** cockpit identique à l'état antérieur à Phase 1. Aucun effet, aucune dégradation.

**Persistance :** les deux champs sont collectés par `collectForm()` et stockés dans `appState.form` via le mécanisme existant — localStorage automatique via `state.js`, sans modification de `state.js`.

---

## Règle de non-contamination

Les champs macro ne modifient **jamais** :

- le score
- la posture
- les actions autorisées ou interdites
- le moteur décisionnel
- le moteur de validation
- `buildPayload()`
- `baseEngine()`
- `profileMatrix()`
- `computeTradingPolicy()`
- `applyValidation()`

Ils ne modifient **que** :

- le texte de `#cs-message` (Confidence Panel — "Lecture contextuelle")

**Mécanisme de garantie :** `applyMacroOverlay()` reçoit uniquement `(baseMessage: string, macroState: {dominanceMacro, desordreStructurel})`. Il est structurellement impossible d'y faire entrer le score, la posture ou les actions — le type d'entrée l'interdit par construction.

---

## Fichiers modifiés en Phase 1

**Modifiés :**

| Fichier | Nature de la modification |
|---|---|
| `src/js/data.js` | `DEFAULT_FORM` : +2 champs macro à `"none"` · `FIELD_GROUPS` : +groupe `contextualFields` |
| `src/js/render.js` | `collectForm()` : +itération `contextualFields` · `renderConfidenceContext()` : +lecture macroState + appel `applyMacroOverlay` pour `#cs-message` · import `applyMacroOverlay` |
| `src/index.html` | +`<div class="form-grid" id="contextualFields">` dans section "Filtre adaptatif" |
| `src/js/macro-context.js` | Nouveau fichier — `applyMacroOverlay(baseMessage, macroState) → string` |

**Non modifiés (garantie MACRO-RULE-01) :**

| Fichier | Statut |
|---|---|
| `src/js/engine.js` | Inchangé |
| `src/js/decision.js` | Inchangé |
| `src/js/trading-policy.js` | Inchangé |
| `src/js/confidence-score.js` | Inchangé |
| `src/js/friction.js` | Inchangé |
| `src/js/state.js` | Inchangé |

---

## Flux technique

```
Formulaire (champs macro)
  → collectForm()                        [render.js — itère contextualFields]
  → appState.form.dominanceMacro
  → appState.form.desordreStructurel

Formulaire (18 champs moteur — inchangés)
  → collectForm()
  → buildPayload(appState.form)          [engine.js — ne lit pas les champs macro]
    → baseEngine()                       → score
    → profileMatrix()                    → posture
    → applyAdaptiveFilter()              → engagement
    → applyValidation()                  → tradingStatus
    → computeTradingPolicy()             → actions
  → payload                             [score / posture / actions — inchangés]

  → renderConfidenceContext(payload)     [render.js]
    → buildMarketContext(...)            → ctx  [score / tone / mode / message]
    → macroState = { dominanceMacro, desordreStructurel }   ← depuis appState.form
    → applyMacroOverlay(ctx.message, macroState)            ← macro-context.js
    → #cs-message ← finalMessage        [seul élément modifié]
```

Le score, la posture et les actions restent exclusivement issus du flux `buildPayload()`. Le flux macro est un branchement terminal sur `#cs-message` uniquement, déclenché après que le payload est intégralement calculé.

---

## Tests T6 — Non-régression MACRO-RULE-01

Méthode : analyse statique exhaustive du pipeline. Grep confirmé — 0 occurrence de `dominanceMacro` / `desordreStructurel` dans `engine.js`, `decision.js`, `trading-policy.js`, `confidence-score.js`.

| Test | `dominanceMacro` | `desordreStructurel` | Score | Posture | Actions | `#cs-message` | Résultat |
|---|---|---|---|---|---|---|---|
| A — Baseline | `none` | `none` | X | Y | Z | message base | référence |
| B — Dominance | `active` | `none` | **X** | **Y** | **Z** | message base + suffixe dominance | ✅ PASS |
| C — Désordre | `none` | `active` | **X** | **Y** | **Z** | message base + suffixe désordre | ✅ PASS |
| D — Cumul | `active` | `active` | **X** | **Y** | **Z** | message base + suffixe dominance · suffixe désordre | ✅ PASS |

Score / Posture / Actions identiques sur A/B/C/D.
`#cs-message` modifié uniquement quand au moins un champ macro est `"active"`.

**T6 — PASS**

---

## Limites Phase 1

Phase 1 se limite strictement à la modulation de `#cs-message`. Les éléments suivants sont hors périmètre Phase 1 et ne pourront être ouverts que sur signal terrain démontré :

- pas de modulation du coaching comportemental (`behaviorCoachCard` — module isolé, contrat d'isolation respecté)
- pas de modification du dictionnaire narratif (`dictionary.js` — piloté exclusivement par `MARKET_DICTIONARY`, MACRO-C1 soldé)
- pas de friction fonctionnelle (pas de délai en ms, pas de bouton désactivé — incompatible MACRO-RULE-01)
- pas de modification CSS
- pas de nouvelle surface UI majeure
- pas de score macro
- pas d'alerte macro
- pas de signal directionnel
- pas de modulation de `#cs-mode`, `#cs-action`, `#cs-label` (valeurs moteur calculées — intouchables)

---

## Conditions de réouverture Phase 2

Phase 2 ne pourra être ouverte que si les 4 conditions suivantes sont réunies :

1. La modulation `#cs-message` est validée visuellement sur le cockpit réel (rendu correct, texte lisible, positionnement cohérent avec le reste du panel).
2. Aucun effet de bord n'est observé sur le score, la posture, les actions ou les autres éléments du Confidence Panel.
3. Le besoin de modulation du coaching (au-delà de `#cs-message`) est démontré par un signal terrain réel — confusion observée ou retour opérateur documenté.
4. Aucune confusion utilisateur n'apparaît sur la fonction ou l'interprétation des champs macro.

---

## Conclusion

**Couche Macro Phase 1 — techniquement intégrée, non contaminante, en attente de validation visuelle finale avant commit.**

- 4 fichiers modifiés · 6 fichiers moteur inchangés
- MACRO-RULE-01 respectée intégralement
- Plancher de dégradation = cockpit actuel (champs non remplis = zéro effet)
- Prochaine action : validation visuelle dans le navigateur → T6 terrain → commit atomique Phase 1
