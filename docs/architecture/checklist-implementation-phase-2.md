# Checklist d'implémentation — Phase 2 : Première activation cockpit

## Métadonnées

**Statut** : Checklist opérationnelle · Phase 2 uniquement
**Version** : 1.0 — 2026-05-24
**Prérequis** : Phase 1 entièrement validée (critères de fin Phase 1 tous verts)
**Dépendances** :
- `docs/architecture/checklist-implementation-phase-1.md` — Phase 1 référence
- `docs/architecture/hierarchie-des-tensions.md` — spec hiérarchie T3>T1>T2>T4
- `docs/architecture/gestion-attention.md` — spec gate should_expose
- `docs/architecture/explicabilite-sobre.md` — spec templates T1–T4
- `docs/architecture/doctrine-silence-structurel.md` — absorption par défaut
- `docs/architecture/strategie-implementation-v2.md` — ordre T1→T3→T2→T4 cockpit

**Usage :** Ce document s'exécute ligne par ligne. Ne pas démarrer Phase 2 sans Phase 1 validée.

---

## Objectif de Phase 2

Phase 2 franchit le seuil entre shadow mode et première activation cockpit.
Elle active en séquence la hiérarchie des tensions, la gestion de l'attention,
et l'explicabilité sobre — puis expose **T3 uniquement** dans le cockpit.

T3 est choisi comme premier type cockpit parce que :
- Ses conditions sont binaires (pas de seuil numérique à calibrer)
- Il est actionnable immédiatement (posture/engagement incohérents)
- Il représente le cas le moins ambigu pour l'opérateur
- Sa détection n'est pas sensible aux seuils D-COH-01 non calibrés

À l'issue de Phase 2 :
- `hierarchy.js`, `attention.js`, `exposition.js` sont actifs
- `V2_COCKPIT_MESSAGE: true` (limité à T3)
- T3 peut apparaître dans le cockpit sous forme de message sobre
- T1, T2, T4 restent invisibles cockpit (shadow mode Debug uniquement)
- `active_exposed ≤ 1` à tout moment (jamais deux messages simultanés)
- Le cockpit reste calme — aucune surcharge cognitive

**Ce document ne couvre pas :**
- L'activation cockpit de T1, T2 ou T4 (dépend calibration V0)
- La calibration des seuils D-COH-01 (test V0)
- L'instrumentation CalibrationSnapshot (Phase 6)

---

## Prérequis — vérifications avant Phase 2

**Ne pas démarrer Phase 2 si l'un de ces items est rouge.**

### Prérequis Phase 1

- [ ] Critères de fin Phase 1 tous verts (4 tableaux)
- [ ] `V2_COHERENCE: true` confirmé dans `flags.js`
- [ ] `V2_COCKPIT_MESSAGE: false` confirmé (pas encore activé)
- [ ] T1 et T3 détectés au moins 1 fois lors des sessions terrain Phase 1
- [ ] Faux positifs Phase 1 < 30%

### Prérequis git

```bash
git status
```
- [ ] Working tree clean
- [ ] Hash du dernier commit noté : `________________`

### Prérequis connaissance

Avant d'implémenter Phase 2, lire :
- [ ] `docs/architecture/hierarchie-des-tensions.md` — ordre T3>T1>T2>T4, escalade/désescalade
- [ ] `docs/architecture/gestion-attention.md` — gate should_expose, fenêtre glissante N=5 (provisoire), déclin 2+4 cycles
- [ ] `docs/architecture/explicabilite-sobre.md` — 4 intentions, 7 règles formulation, templates T1–T4

### Prérequis philosophique

Phase 2 est la première fois qu'un message V2 apparaît dans le cockpit opérateur.
**La règle cardinale :** le cockpit doit rester perçu comme un outil, pas comme un
système d'alerte. Un opérateur ne doit jamais se sentir surveillé, jugé, ou pressé
par un message V2. Si c'est le cas, le message est mal formulé ou trop fréquent.

---

## Philosophie — surface calme protégée

Phase 2 introduit la première modification visible du cockpit depuis V1. Cette modification
doit respecter des règles de présentation strictes, indépendamment des seuils de contenu.

### Ce que la surface calme signifie

**Un message V2 dans le cockpit est :**
- Court — 1 phrase, 10–15 mots maximum
- Factuel — décrit une observation structurelle, pas une intention
- Sobre — aucune couleur d'alarme, aucune animation, aucun emoji stress
- Rare — apparaît moins de 30% des sessions (objectif Phase 2)
- Disparaît silencieusement — aucune notification de fermeture

**Un message V2 dans le cockpit n'est pas :**
- Une alerte (pas de rouge, pas de warning)
- Un jugement comportemental (pas de "vous avez mal géré")
- Une instruction (pas de "vous devez")
- Un diagnostic (pas de "votre comportement est")
- Un compte-rendu de toutes les tensions détectées

### Règles de rendu minimal — non-négociables

| Règle | Interdit |
|---|---|
| Couleur | Rouge, orange vif, jaune alarme — uniquement neutre ou légèrement accentué |
| Typographie | Gras excessif, taille augmentée, clignotant |
| Animation | Fade-in agressif, bounce, vibration |
| Multiplicité | Plus d'un message simultané (`active_exposed ≤ 1`) |
| Persistance | Message figé indéfiniment — doit pouvoir disparaître au cycle suivant |
| Logique punitive | Bloquer une action, désactiver un bouton, modifier le score affiché |
| Dépendance Debug | Message dont le contenu dépend d'un état du panel Debug |

### Règle de silence par défaut

Si aucune tension T3 n'est active, le cockpit ne montre aucun bloc message V2.
L'absence de message est l'état normal. La présence d'un message est l'exception.

---

## Snapshots de référence Phase 2

Reprendre les snapshots Phase 1 (A–F) comme référence de non-régression.
Ajouter 2 snapshots spécifiques Phase 2.

### Snapshot G — T3 cockpit attendu

Inputs : posture ACTIVE + engagement_declared "faible".
Résultat attendu :
- Cockpit : message T3 visible (sobre, une phrase)
- Debug : tensionMap T3 + HierarchyResult winner=T3 + ExpositionResult non null
- Aucun autre message simultané

| Champ | Valeur utilisée |
|---|---|
| (à remplir lors de l'exécution) | |

Message attendu dans le cockpit : `________________`

### Snapshot H — T3 supprimé par gate attention

Inputs identiques à G, mais soumis en cycle N+1 après une session G (T3 déjà exposé).
Résultat attendu :
- Cockpit : **aucun message** (gate should_expose = false)
- Debug : tensionMap T3 présent + AttentionResult.should_expose = false + suppressed_winner = T3

Ce snapshot valide la suppression silencieuse de l'attention.

### Snapshot I — T1 + T3 simultanés

Inputs : confidence < 65 + MdS > 2 (T1) ET posture ACTIVE + engagement faible (T3).
Résultat attendu :
- Cockpit : **un seul message** (T3 gagne sur T1 selon hiérarchie T3>T1)
- Debug : tensionMap avec T1+T3, HierarchyResult winner=T3, absorbed=[T1]

Ce snapshot valide l'exposition unique (`active_exposed ≤ 1`).

### Checklist snapshots Phase 2

- [ ] Snapshots A–F Phase 1 disponibles (non-régression)
- [ ] Snapshot G construit (T3 cockpit attendu)
- [ ] Snapshot H construit (T3 supprimé attention)
- [ ] Snapshot I construit (T1+T3 — un seul message cockpit)

---

## Ordre d'exécution — Phase 2

```
T2-01 → T2-02 → T2-03 → T2-04 → T2-05
  ↓        ↓        ↓        ↓        ↓
hiérar-  attent. exposi-  activer  render
chie.js  .js     tion.js  flags    .js
shadow   shadow  shadow   +T3 only cockpit
(commit) (commit)(commit) (commit) (commit)
```

**Ordre contraint :**
- T2-01 avant T2-02 : la hiérarchie sélectionne le winner avant que l'attention décide
- T2-02 avant T2-03 : l'attention produit `should_expose` avant l'explicabilité
- T2-03 avant T2-04 : les templates doivent être testés en shadow avant activation cockpit
- T2-04 avant T2-05 : les flags cockpit s'activent avant le rendu cockpit

**T2-01 à T2-03 sont des shadow mode étendus.** Aucune tension n'est encore visible
dans le cockpit. Chaque composant est testé Debug-only avant que T2-04 active l'exposition.

---

## T2-01 — Implémentation de `hierarchy.js` (shadow mode)

**Fichier à modifier :** `src/js/v2/hierarchy.js`
**Lire avant de coder :** `docs/architecture/hierarchie-des-tensions.md` intégralement.

### Logique à implémenter

```javascript
// src/js/v2/hierarchy.js — Phase 2

import { V2_FLAGS } from './flags.js';

/** Ordre de priorité décroissante */
const PRIORITY_ORDER = ['T3', 'T1', 'T2', 'T4'];

/**
 * @param {import('./types.js').TensionMap|null} tensionMap
 * @returns {import('./types.js').HierarchyResult|null}
 */
export function computeHierarchy(tensionMap) {
  if (!V2_FLAGS.V2_HIERARCHY) return null;
  if (!tensionMap || tensionMap.tensions.length === 0) {
    return { winner: null, absorbed: [], silent: [], escalated: [], deescalated: [] };
  }

  // Trier les tensions par ordre de priorité T3 > T1 > T2 > T4
  const sorted = [...tensionMap.tensions].sort((a, b) => {
    return PRIORITY_ORDER.indexOf(a.id) - PRIORITY_ORDER.indexOf(b.id);
  });

  const winner = sorted[0];
  const absorbed = sorted.slice(1);

  return {
    winner,
    absorbed,
    silent: [],        // silence intentionnel — pas d'autres tensions non classées
    escalated: [],     // escalade/désescalade — Phase 2 : non implémenté (D-HIE-02/03)
    deescalated: [],
  };
}
```

### Activation shadow mode dans `pipeline-v2.js`

Décommenter le bloc Phase 2 dans `pipeline-v2.js` :

```javascript
import { computeHierarchy } from './hierarchy.js'; // ← décommenter

// Dans runV2() :
if (!V2_FLAGS.V2_HIERARCHY) return { tensionMap, hierarchyResult: null, attentionResult: null, expositionResult: null };
const hierarchyResult = computeHierarchy(tensionMap);
```

### Activation flag dans `flags.js`

```javascript
V2_HIERARCHY: true,   // ← true (était false)
```

### Vérification Debug

Après activation, soumettre Snapshot I (T1+T3) :
- [ ] `payload.v2.hierarchyResult.winner.id === 'T3'` (T3 prioritaire)
- [ ] `payload.v2.hierarchyResult.absorbed` contient T1
- [ ] Cockpit : **aucun changement** (`V2_COCKPIT_MESSAGE` encore false)

### Commit

```bash
git add src/js/v2/hierarchy.js src/js/v2/pipeline-v2.js src/js/v2/flags.js
git commit -m "feat(v2/hierarchy): implement tension hierarchy shadow mode"
```

### Checklist T2-01

- [ ] `hierarchy.js` logique T3>T1>T2>T4 implémentée
- [ ] `V2_HIERARCHY: true` dans `flags.js`
- [ ] Bloc Phase 2 décommenté dans `pipeline-v2.js`
- [ ] Snapshot I : winner=T3, absorbed=[T1] confirmé en Debug
- [ ] Cockpit inchangé
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T2-02 — Implémentation de `attention.js` (shadow mode)

**Fichier à modifier :** `src/js/v2/attention.js`
**Lire avant de coder :** `docs/architecture/gestion-attention.md` intégralement.

### Logique à implémenter

```javascript
// src/js/v2/attention.js — Phase 2

import { V2_FLAGS } from './flags.js';

const WINDOW_SIZE = 5;      // N=5 provisoire (D-ATT-01)
const DECLINE_FAST = 2;     // cycles avant début déclin
const DECLINE_FULL = 4;     // cycles avant suppression totale

/**
 * @param {import('./types.js').TensionDetail|null} winner
 * @param {import('./types.js').AttentionState} state
 * @returns {{ result: import('./types.js').AttentionResult, nextState: import('./types.js').AttentionState }}
 */
export function applyAttentionGate(winner, state) {
  if (!V2_FLAGS.V2_ATTENTION) {
    return { result: { should_expose: false, attention_level: 'normal', suppressed_winner: null }, nextState: state };
  }

  // Pas de winner → silence, incrémenter cycles silencieux
  if (!winner) {
    const nextState = {
      ...state,
      consecutive_silent: state.consecutive_silent + 1,
      last_exposed_id: state.consecutive_silent >= DECLINE_FULL ? null : state.last_exposed_id,
    };
    return {
      result: { should_expose: false, attention_level: 'normal', suppressed_winner: null },
      nextState,
    };
  }

  // Compter les expositions récentes dans la fenêtre
  const now = Date.now();
  const recentWindow = state.expositions_window.filter(t => now - t < 20 * 60 * 1000); // 20 min

  // Déterminer le niveau d'attention
  let attention_level = 'normal';
  if (recentWindow.length >= WINDOW_SIZE) attention_level = 'high';
  else if (recentWindow.length >= Math.floor(WINDOW_SIZE / 2)) attention_level = 'elevated';

  // Gate : bloquer si trop d'expositions récentes
  if (attention_level === 'high') {
    return {
      result: { should_expose: false, attention_level, suppressed_winner: winner },
      nextState: { ...state, consecutive_silent: state.consecutive_silent + 1 },
    };
  }

  // Exposer
  const nextState = {
    expositions_window: [...recentWindow, now],
    last_exposed_id: winner.id,
    consecutive_silent: 0,
  };
  return {
    result: { should_expose: true, attention_level, suppressed_winner: null },
    nextState,
  };
}
```

### Activation dans `pipeline-v2.js`

Le cycle de vie de `AttentionState` est géré par `pipeline-v2.js` (variable `_attentionState`).
Décommenter le bloc Phase 3 (attention) dans `pipeline-v2.js` :

```javascript
import { createInitialAttentionState, applyAttentionGate } from './attention.js';

// Dans runV2() :
if (!_attentionState) _attentionState = createInitialAttentionState();
if (!V2_FLAGS.V2_ATTENTION) return { tensionMap, hierarchyResult, attentionResult: null, expositionResult: null };
const { result: attentionResult, nextState } = applyAttentionGate(hierarchyResult?.winner ?? null, _attentionState);
_attentionState = nextState;
```

### Activation flag

```javascript
V2_ATTENTION: true,   // ← true (était false)
```

### Vérification Debug

Snapshot G (T3 attendu) :
- [ ] `payload.v2.attentionResult.should_expose === true` (première exposition)

Snapshot H (T3 soumis en cycle N+1 après G) :
- [ ] `payload.v2.attentionResult.should_expose === false`
- [ ] `payload.v2.attentionResult.suppressed_winner.id === 'T3'`

### Commit

```bash
git add src/js/v2/attention.js src/js/v2/pipeline-v2.js src/js/v2/flags.js
git commit -m "feat(v2/attention): implement attention gate shadow mode"
```

### Checklist T2-02

- [ ] `attention.js` logique gate + fenêtre glissante implémentée
- [ ] `V2_ATTENTION: true` dans `flags.js`
- [ ] Bloc attention décommenté dans `pipeline-v2.js`
- [ ] Snapshot G : should_expose = true (première exposition)
- [ ] Snapshot H : should_expose = false (suppression silencieuse)
- [ ] Cockpit inchangé
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T2-03 — Implémentation de `exposition.js` (shadow mode)

**Fichier à modifier :** `src/js/v2/exposition.js`
**Lire avant de coder :** `docs/architecture/explicabilite-sobre.md` intégralement — templates T1–T4 et 7 règles.

### Logique à implémenter — T3 uniquement en Phase 2

Phase 2 n'active que T3 dans le cockpit. Les templates T1, T2, T4 sont implémentés
mais retournent `null` si `V2_COCKPIT_MESSAGE` est false (ils seront activés progressivement).

```javascript
// src/js/v2/exposition.js — Phase 2

import { V2_FLAGS } from './flags.js';

/**
 * @param {import('./types.js').TensionDetail|null} winner
 * @param {boolean} shouldExpose
 * @returns {import('./types.js').ExpositionResult|null}
 */
export function buildExpositionResult(winner, shouldExpose) {
  if (!V2_FLAGS.V2_EXPOSITION) return null;
  if (!shouldExpose || !winner) return null;

  // En Phase 2, seul T3 est exposé dans le cockpit
  // Les autres types sont formulés mais filtrés si V2_COCKPIT_MESSAGE est restrictif
  const result = buildTemplate(winner);
  if (!result) return null;

  // Filtrage par type : uniquement T3 visible cockpit en Phase 2
  // T1, T2, T4 : formulés pour le Debug, mais marqués non-bloquants
  // Note : le filtrage T3-only est géré via V2_COCKPIT_MESSAGE dans render.js (T2-05)
  return result;
}

/**
 * @param {import('./types.js').TensionDetail} tension
 * @returns {import('./types.js').ExpositionResult|null}
 */
function buildTemplate(tension) {
  switch (tension.id) {
    case 'T3':
      return {
        message: buildT3Message(tension),
        intention: 'alignement_engagement_posture',
        tension_id: 'T3',
        severity: tension.severity,
        is_blocking: false,
      };
    case 'T1':
      return {
        message: buildT1Message(tension),
        intention: 'coherence_confiance_premium',
        tension_id: 'T1',
        severity: tension.severity,
        is_blocking: false,
      };
    case 'T2':
      return {
        message: buildT2Message(tension),
        intention: 'surcharge_structurelle',
        tension_id: 'T2',
        severity: tension.severity,
        is_blocking: false,
      };
    case 'T4':
      return {
        message: buildT4Message(tension),
        intention: 'surqualification_technique',
        tension_id: 'T4',
        severity: tension.severity,
        is_blocking: false,
      };
    default:
      return null;
  }
}

function buildT3Message(tension) {
  // Template T3 : delta engagement / posture
  // Règle : factuel, pas de jugement, 10–15 mots max
  return 'Posture active — engagement déclaré faible.';
}

function buildT1Message(tension) {
  // Template T1 : cohérence confidence / premium
  return 'Confiance faible avec indicateurs premium élevés.';
}

function buildT2Message(tension) {
  // Template T2 : surcharge structurelle
  return 'Structure chargée — conditions de lecture difficiles.';
}

function buildT4Message(tension) {
  // Template T4 : surqualification technique
  return 'Indicateurs techniques saturés.';
}
```

### Activation dans `pipeline-v2.js`

Décommenter le bloc Phase 4 (explicabilité) :

```javascript
import { buildExpositionResult } from './exposition.js';

// Dans runV2() :
if (!V2_FLAGS.V2_EXPOSITION) return { tensionMap, hierarchyResult, attentionResult, expositionResult: null };
const expositionResult = buildExpositionResult(hierarchyResult?.winner ?? null, attentionResult?.should_expose ?? false);
return { tensionMap, hierarchyResult, attentionResult, expositionResult };
```

### Activation flag

```javascript
V2_EXPOSITION: true,   // ← true (était false)
```

### Vérification shadow mode

Snapshot G (T3, should_expose = true) :
- [ ] `payload.v2.expositionResult.message` contient le message T3
- [ ] `payload.v2.expositionResult.tension_id === 'T3'`
- [ ] `payload.v2.expositionResult.is_blocking === false`
- [ ] Cockpit : **aucun message** encore (`V2_COCKPIT_MESSAGE` encore false)

### Commit

```bash
git add src/js/v2/exposition.js src/js/v2/pipeline-v2.js src/js/v2/flags.js
git commit -m "feat(v2/exposition): implement exposition templates shadow mode"
```

### Checklist T2-03

- [ ] `exposition.js` templates T1–T4 implémentés
- [ ] Messages T3 sobre, factuel, ≤ 15 mots
- [ ] `V2_EXPOSITION: true` dans `flags.js`
- [ ] Bloc exposition décommenté dans `pipeline-v2.js`
- [ ] Snapshot G : ExpositionResult.message visible en Debug
- [ ] Cockpit inchangé (`V2_COCKPIT_MESSAGE` encore false)
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T2-04 — Activation cockpit T3 uniquement (flags)

**Cette tâche active la première exposition cockpit réelle.**
**Lire la section § Philosophie — surface calme avant d'exécuter.**

### Modification — `flags.js`

```javascript
V2_COCKPIT_MESSAGE: true,   // ← true (était false) — activer T3 cockpit
```

**Tous les autres flags restent inchangés.**

### Vérification immédiate

Recharger l'application. **Avant** de soumettre quoi que ce soit, inspecter le cockpit :
- [ ] Le cockpit est **identique** à Phase 1 (aucun message affiché à froid)
- [ ] Console : zéro erreur

Soumettre le Snapshot G (T3 attendu) :
- [ ] Un message sobre apparaît dans le cockpit
- [ ] Le message est sobre (pas d'alarme, pas de rouge)
- [ ] Le message est court (≤ 15 mots)
- [ ] Aucun autre message simultané

Soumettre le Snapshot A (PASSIVE — T3 non attendu) :
- [ ] **Aucun message** dans le cockpit

Soumettre le Snapshot H (T3 supprimé gate) :
- [ ] **Aucun message** dans le cockpit (gate should_expose = false)

### Commit

```bash
git add src/js/v2/flags.js
git commit -m "feat(v2): activate T3 cockpit message (V2_COCKPIT_MESSAGE: true)"
```

### Checklist T2-04

- [ ] `V2_COCKPIT_MESSAGE: true` dans `flags.js`
- [ ] Snapshot G : message T3 visible cockpit
- [ ] Snapshot A : aucun message cockpit
- [ ] Snapshot H : aucun message cockpit (gate)
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T2-05 — Rendu cockpit minimal (render.js)

**Fichier à modifier :** `src/js/render.js` — ajout d'un bloc de rendu conditionnel.
**Lire la section render.js concernée avant de modifier.**

### Règles de modification render.js Phase 2

1. **Un seul point d'insertion** dans render.js — après le rendu de la posture/actions
2. **Optional chaining obligatoire** — `payload.v2?.expositionResult?.message`
3. **Filtrage T3 uniquement** — vérifier `payload.v2?.expositionResult?.tension_id === 'T3'`
4. **Aucun calcul** — render.js lit et affiche, ne décide pas
5. **Aucune couleur d'alarme** — style sobre uniquement

### Pattern de rendu minimal

```javascript
// Dans la fonction de rendu principale — après le bloc posture/actions
// Ajout conditionnel message V2 (T3 uniquement en Phase 2)
const v2Msg = payload.v2?.expositionResult;
if (v2Msg && payload.v2?.expositionResult?.tension_id === 'T3' && V2_FLAGS.V2_COCKPIT_MESSAGE) {
  // Insérer un élément sobre dans le cockpit
  // Style : classe CSS neutre, aucune couleur alarme
  // Exemple (adapter au DOM réel) :
  cockpitElement.insertAdjacentHTML('beforeend', `
    <div class="v2-message v2-message--t3" role="note">
      ${escapeHtml(v2Msg.message)}
    </div>
  `);
}
```

**Important :**
- `escapeHtml()` ou équivalent obligatoire — le message vient d'une fonction interne
  mais la règle de sécurité s'applique pour toute injection HTML
- La classe CSS `v2-message` doit être ajoutée dans `style.css` avec un style sobre
- Aucune condition sur `v2Msg.is_blocking` pour modifier le comportement du moteur

### Ajout CSS dans `style.css`

```css
/* Message V2 Phase 2 — sobre, non-alarme */
.v2-message {
  font-size: 0.85rem;
  color: var(--text-secondary, #666);
  padding: 4px 8px;
  border-left: 2px solid var(--border-light, #ccc);
  margin-top: 8px;
  opacity: 0.9;
}
```

**Aucune animation, aucun rouge, aucun orange vif.**

### Vérification

Snapshot G :
- [ ] Bloc `.v2-message` présent dans le DOM après soumission
- [ ] Texte du message sobre et court
- [ ] Style neutre (pas de rouge, pas d'animation)
- [ ] Aucun autre message simultané

Snapshot A (T3 non attendu) :
- [ ] Aucun bloc `.v2-message` dans le DOM

Snapshot I (T1+T3) :
- [ ] Un seul bloc `.v2-message` (T3 uniquement, T1 absorbé)

### Commit

```bash
git add src/js/render.js src/css/style.css
git commit -m "feat(render): add T3 cockpit message rendering (Phase 2)"
```

### Checklist T2-05

- [ ] `render.js` modifié : bloc rendu conditionnel T3 ajouté
- [ ] Optional chaining + filtre `tension_id === 'T3'` en place
- [ ] `escapeHtml()` utilisé
- [ ] CSS `.v2-message` sobre ajouté dans `style.css`
- [ ] Snapshot G : message visible, style sobre
- [ ] Snapshot A : aucun message
- [ ] Snapshot I : un seul message (T3)
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## Rendu minimal — règles de vérification

Ces règles s'appliquent au rendu du message T3 dans le cockpit. Vérifier après T2-05.

### Vérification visuelle du message

| Règle | Test | Résultat |
|---|---|---|
| Longueur message | Compter les mots du message affiché | ≤ 15 mots |
| Couleur texte | Inspecter CSS computed color | Gris/neutre, pas rouge |
| Couleur fond | Inspecter CSS background | Aucun fond coloré alarme |
| Animation | Observer 3 secondes | Aucune animation, aucun clignotement |
| Position | Observer l'emplacement | Discret, pas en surimpression centrale |
| Persistance | Soumettre sans T3 en cycle suivant | Message disparaît (pas d'état figé) |

### Vérification d'unicité

```javascript
// Console — après Snapshot I (T1+T3)
document.querySelectorAll('.v2-message').length
```
- [ ] Résultat : **1** (jamais 2 ou plus)

### Vérification disparition silencieuse

Après une soumission avec T3 visible :
1. Soumettre un Snapshot A (PASSIVE, pas de T3)
2. Observer le cockpit
- [ ] Le message T3 a disparu sans notification
- [ ] Aucune animation de fermeture
- [ ] Aucun message de type "tension résolue"

---

## Surface calme — protocole de protection

La surface calme est l'état par défaut du cockpit en Phase 2. Ce protocole vérifie
qu'elle n'est pas dégradée par l'introduction de T3.

### Fréquence maximale acceptable

En Phase 2, T3 ne doit pas apparaître dans plus de **30% des sessions opérateur**.
Un taux plus élevé signifie soit que le seuil T3 est trop sensible, soit que le
panel opérateur ne correspond pas au profil cible.

Pour mesurer : sur 10 sessions terrain, compter les sessions avec message T3 visible.

| Session | Message T3 visible ? |
|---|---|
| 1–10 | (à remplir) |
| Taux | __/10 |

- [ ] Taux T3 cockpit ≤ 30% sur 10 sessions

### Absence de multi-message

À aucun moment deux messages ne doivent apparaître simultanément dans le cockpit.

```javascript
// Après chaque soumission en Phase 2
document.querySelectorAll('.v2-message').length <= 1
```
- [ ] Vérifié sur 10 sessions consécutives

### Absence de logique punitive

Le message T3 ne doit pas :
- [ ] Désactiver un bouton ou une option
- [ ] Modifier le score de confiance affiché
- [ ] Changer la couleur de la posture affichée
- [ ] Déclencher une popup ou une modale

### Absence de dépendance Debug → cockpit

Ouvrir le Debug panel puis soumettre une session avec T3 :
- [ ] Le message T3 apparaît normalement
Fermer le Debug panel puis soumettre la même session :
- [ ] Le message T3 apparaît identiquement (le cockpit ne dépend pas du Debug)

---

## Exposition unique — validation `active_exposed ≤ 1`

Cette validation vérifie le respect de la règle d'exposition unique : jamais deux
messages simultanément dans le cockpit.

### Cas de test coexistence

**Cas 1 — T3 + T1 simultanés (Snapshot I)**

Inputs : posture ACTIVE + engagement faible (T3) + confidence < 65 + MdS > 2 (T1).

Comportement attendu :
- `tensionMap.tensions` : [T3, T1]
- `hierarchyResult.winner` : T3 (T3 > T1)
- `hierarchyResult.absorbed` : [T1]
- `attentionResult.should_expose` : true (si fenêtre not saturée)
- `expositionResult.tension_id` : 'T3'
- Cockpit : **un seul message** (T3)

- [ ] Snapshot I : un seul message cockpit · winner=T3 · T1 absorbé

**Cas 2 — T3 + T2 + T4 simultanés (hypothétique)**

Créer des inputs qui déclenchent T3, T2 et T4 simultanément (si possible).

Comportement attendu :
- winner = T3 (T3 prioritaire)
- absorbed = [T2, T4]
- Cockpit : un seul message (T3)

- [ ] Cockpit : un seul message maximum quelle que soit la combinaison de tensions

### Vérification `active_exposed`

```javascript
// Dans la console après Snapshot I
payload.v2?.tensionMap?.active_exposed
```
- [ ] Résultat : `1` après une exposition (jamais 2 ou plus)
- [ ] Résultat : `0` si should_expose = false

---

## Suppression silencieuse — validation détaillée

La suppression silencieuse est le comportement attendu lorsque le gate attention
décide de ne pas exposer un winner. Elle doit être **totalement invisible** côté cockpit :
aucune notification, aucune trace visuelle, aucun log dans l'interface.

### Ce que "silencieux" signifie

| Composant | Comportement attendu |
|---|---|
| Cockpit | Aucun bloc `.v2-message` — comme si aucune tension n'existait |
| Titre posture | Inchangé — aucune indication de suppression |
| Score confiance | Inchangé |
| Boutons actions | Inchangés |
| Animations | Aucune animation de "rétention" ou de "blocage" |
| Console JS | Aucun message de type "T3 suppressed" visible opérateur |

**Seul le Debug panel affiche la suppression.** Le cockpit ne sait pas que quelque chose
a été supprimé.

### Procédure de validation suppression silencieuse

**Étape 1 — Provoquer une exposition T3**
1. Soumettre Snapshot G (posture ACTIVE + engagement faible)
2. Vérifier : message T3 visible dans le cockpit
3. Enregistrer timestamp : `________________`

**Étape 2 — Provoquer la suppression**
4. Soumettre à nouveau Snapshot G (mêmes inputs, cycle suivant)
5. Observer le cockpit :
   - [ ] **Aucun** bloc `.v2-message` visible
   - [ ] Aucune animation de disparition agressive
   - [ ] Cockpit identique à un cycle sans T3

**Étape 3 — Confirmer en Debug**
6. Ouvrir le Debug panel
7. Vérifier :
   - [ ] `attentionResult.should_expose === false`
   - [ ] `attentionResult.suppressed_winner.id === 'T3'`
   - [ ] `attentionResult.attention_level` : `'elevated'` ou `'high'` selon le nombre d'expositions

**Étape 4 — Vérifier l'absence de trace**
8. Inspecter le DOM après l'étape 5 :
```javascript
document.querySelectorAll('.v2-message').length
// Résultat attendu : 0
```
- [ ] Aucun élément `.v2-message` dans le DOM

### Validation déclin progressif

Le gate attention suit un déclin progressif : `normal → elevated → high`.
À `attention_level = 'high'`, la suppression est totale.

Pour valider le déclin :
1. Soumettre Snapshot G 5 fois consécutivement
2. Observer `attention_level` en Debug à chaque soumission :

| Soumission | attention_level attendu |
|---|---|
| 1 | `normal` |
| 2 | `normal` ou `elevated` |
| 3 | `elevated` |
| 4 | `elevated` ou `high` |
| 5 | `high` (suppression active) |

- [ ] Déclin progressif confirmé sur 5 soumissions
- [ ] Cockpit silencieux à la 5ème soumission (attention_level = high)

### Vérification de la fenêtre glissante (20 min)

Après une série d'expositions, attendre > 20 minutes, puis soumettre Snapshot G :
- [ ] `attention_level` retombe à `normal`
- [ ] `should_expose === true` (fenêtre réinitialisée)
- [ ] Message T3 visible à nouveau dans le cockpit

**Note :** Ce test peut être simulé en modifiant temporairement `WINDOW_SIZE` ou en
utilisant le Debug pour inspecter `expositions_window`.

---

## Validation lisibilité — messages cockpit

La lisibilité d'un message V2 est distincte de sa correction technique.
Un message peut être syntaxiquement correct et pourtant mal lu en contexte opérateur.
Ce protocole teste la lisibilité réelle, pas la conformité formelle.

### Critères de lisibilité V2

| Critère | Seuil Phase 2 | Description |
|---|---|---|
| Temps de lecture | ≤ 2 secondes | Lu sans relire, sans hésitation |
| Compréhension | Immédiate | Pas besoin d'interpréter |
| Ton | Factuel, non-judgmental | Aucun sentiment de surveillance ou de reproche |
| Longueur | ≤ 15 mots | Comptable en un regard |
| Vocabulaire | Trader natif | Pas de jargon informatique ni de termes engine internes |

### Test de lisibilité terrain — 5 sessions

Pour chaque session terrain Phase 2 avec message T3 visible, demander à l'opérateur :

> "Que comprenez-vous de ce message ?"  
> (Pas d'explication préalable — lecture à froid)

Enregistrer la réponse spontanée :

| Session | Message affiché | Réponse opérateur | Compris en ≤ 2s ? |
|---|---|---|---|
| 1 | | | ☐ Oui ☐ Non |
| 2 | | | ☐ Oui ☐ Non |
| 3 | | | ☐ Oui ☐ Non |
| 4 | | | ☐ Oui ☐ Non |
| 5 | | | ☐ Oui ☐ Non |

- [ ] ≥ 4/5 sessions : compréhension immédiate sans explication
- [ ] 0/5 sessions : réaction de surveillance ou de jugement ("il me surveille")
- [ ] 0/5 sessions : confusion sur le sens du message ("ça veut dire quoi ?")

### Vérification formelle du message T3

Le message T3 par défaut est : **"Posture active — engagement déclaré faible."**

Vérifier que ce message respecte les 7 règles de formulation (docs/architecture/explicabilite-sobre.md) :

- [ ] Règle 1 — Factuel : décrit un état observable, pas une intention supposée
- [ ] Règle 2 — Non-prescriptif : aucun "vous devez", "il faut", "attention"
- [ ] Règle 3 — Non-punitif : ne sous-entend pas une erreur de l'opérateur
- [ ] Règle 4 — Court : 7 mots — dans les ≤ 15 mots requis
- [ ] Règle 5 — Vocabulaire opérateur : "Posture" et "engagement" sont des termes natifs Caméléon
- [ ] Règle 6 — Sans emoji : aucun caractère décoratif
- [ ] Règle 7 — Pas d'urgence : aucun terme alarmiste ("critique", "dangereux", "urgent")

### Signal de révision du message

Déclencher une révision du message T3 si l'un des signaux suivants est observé :

- [ ] ≥ 2 opérateurs décrivent le message comme "un avertissement" ou "une alerte"
- [ ] ≥ 1 opérateur exprime un sentiment de surveillance ou de pression
- [ ] ≥ 3 opérateurs sur 5 ne comprennent pas sans explication

**Si révision déclenchée :** reformuler dans `exposition.js / buildT3Message()` puis re-valider.
Ne pas valider Phase 2 avant que le message soit lisible pour ≥ 4/5 opérateurs.

---

## Validation surcharge cognitive

L'objectif de Phase 2 est d'enrichir le cockpit sans l'alourdir. La surcharge cognitive
est détectable avant que les opérateurs la verbalisent — par des signaux comportementaux
et des métriques de surface.

### Définition de la surcharge cognitive Phase 2

Il y a surcharge si l'un des cas suivants est observé :
- L'opérateur ignore systématiquement le message T3 après 3 sessions (signal de bruit)
- L'opérateur demande comment "enlever" les messages (signal de gêne)
- L'opérateur modifie son comportement pour "éviter" de déclencher T3 (signal punitif)
- Le message T3 apparaît dans ≥ 30% des sessions (fréquence trop haute)
- Deux messages sont visibles simultanément (rupture du contrat `active_exposed ≤ 1`)

### Tests de non-surcharge

**Test 1 — Fréquence d'apparition**

Sur 10 sessions terrain :

| Session | Message T3 visible ? | Commentaire opérateur |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| 6 | | |
| 7 | | |
| 8 | | |
| 9 | | |
| 10 | | |

Taux d'apparition : `__/10`

- [ ] Taux ≤ 30% (≤ 3/10 sessions)

**Test 2 — Poids visuel total**

Inspecter visuellement le cockpit après une soumission avec T3 visible :
- [ ] Le message T3 occupe < 10% de la surface cockpit visible
- [ ] L'œil va naturellement vers la posture/actions principale, pas vers le message T3
- [ ] Le message T3 est moins saillant que la posture principale

**Test 3 — Absence de multi-message**

```javascript
// Après chaque soumission sur 10 sessions
document.querySelectorAll('.v2-message').length
```
- [ ] Résultat ≤ 1 sur toutes les soumissions testées

**Test 4 — Charge perçue (retour terrain)**

Poser la question suivante à 5 opérateurs après 3 sessions avec T3 :

> "Avez-vous l'impression que l'interface est plus chargée ou plus complexe qu'avant ?"

Enregistrer les réponses :

| Opérateur | Réponse | Signal de surcharge ? |
|---|---|---|
| 1 | | ☐ Oui ☐ Non |
| 2 | | ☐ Oui ☐ Non |
| 3 | | ☐ Oui ☐ Non |
| 4 | | ☐ Oui ☐ Non |
| 5 | | ☐ Oui ☐ Non |

- [ ] ≤ 1/5 opérateurs perçoivent une surcharge

### Seuil de déclenchement révision d'urgence

Si l'un des cas suivants est observé, **arrêter Phase 2 immédiatement** et revoir :
- [ ] 2 opérateurs expriment une gêne face au message T3
- [ ] Taux T3 cockpit > 50% sur 10 sessions
- [ ] Un message T3 apparaît sans inputs cohérents avec T3 (faux positif)

---

## Validation non-régression Phase 2

Phase 2 modifie deux fichiers existants (render.js + style.css) et active 4 flags V2.
La non-régression doit être vérifiée sur trois périmètres : moteur V1, UX principale,
et isolation comportementale.

### Tableau non-régression moteur V1

| Test | Avant Phase 2 | Après T2-05 | Statut |
|---|---|---|---|
| R-01 Score PASSIVE (all low) | Score ≤ 20 | Identique | ☐ |
| R-02 Score BALANCED (all medium) | Score ~50 | Identique | ☐ |
| R-03 Score ACTIVE (optimum) | Score ≥ 80 | Identique | ☐ |
| R-04 Snapshot A : posture PASSIVE | PASSIVE affiché | Identique | ☐ |
| R-05 Snapshot B : posture ACTIVE | ACTIVE affiché | Identique | ☐ |
| R-06 buildPayload() retourne le payload V1 complet | Tous champs V1 présents | Identique | ☐ |
| R-07 Confidence score calcul | Score 0–100 | Identique | ☐ |
| R-08 Allowed/forbidden actions | Liste cohérente avec profil | Identique | ☐ |

**Tous verts requis** avant de valider Phase 2.

### Tableau non-régression UX principale

| Composant | Comportement attendu | Vérifié |
|---|---|---|
| Formulaire 16 champs | Saisie normale, aucun blocage | ☐ |
| Bouton soumettre | Actif, aucune interférence V2 | ☐ |
| Affichage posture | Inchangé — T3 ne modifie pas la couleur posture | ☐ |
| Onglet Pilotage | Fonctionne normalement | ☐ |
| Onglet Mémoire | Fonctionne normalement | ☐ |
| Module comportement | Isolation stricte préservée — V2 n'y touche pas | ☐ |
| Historique | 50 snapshots max, aucun champ V2 stocké en localStorage | ☐ |
| Debug panel | tensionMap + HierarchyResult + AttentionResult + ExpositionResult affichés | ☐ |
| Snapshot A (PASSIVE) | Cockpit sans message V2 | ☐ |
| Snapshot B–F (Phase 1) | Identiques Phase 1 | ☐ |

### Tableau non-régression CSS

| Élément CSS | Avant Phase 2 | Après ajout `.v2-message` | Statut |
|---|---|---|---|
| Layout cockpit principal | Normal | Inchangé | ☐ |
| Couleurs existantes | Palette intacte | `.v2-message` ne surcharge pas `--text-primary` | ☐ |
| Responsive / mobile | Correct | `.v2-message` ne déborde pas | ☐ |
| Sidebar comportement | Isolation CSS `.bhv-` | Aucune collision avec `.v2-message` | ☐ |

### Vérification isolation module comportement

Le module comportement (`src/js/behavior/`) ne doit pas être affecté par Phase 2.

```javascript
// Ouvrir l'onglet Comportement, charger un CSV
// Vérifier :
// - Parsing intact
// - Score affiché normalement
// - Aucune variable V2 n'interfère
```
- [ ] Module comportement opérationnel après T2-05

### Vérification localStorage

Phase 2 ne doit pas écrire de données V2 dans localStorage :

```javascript
// Dans la console, après 5 soumissions Phase 2
Object.keys(localStorage).filter(k => k.includes('v2'))
// Résultat attendu : [] (tableau vide)
```
- [ ] Aucune clé V2 dans localStorage

---

## Critères d'activation future — T1, T2, T4 cockpit

T1, T2 et T4 restent en shadow mode (Debug uniquement) à l'issue de Phase 2.
Cette section documente les conditions nécessaires pour les activer dans le cockpit,
afin que la décision ne soit pas prise arbitrairement lors d'une session future.

**Ces critères sont non-négociables.** Activer T1/T2/T4 sans les valider
reviendrait à exposer des signaux non calibrés dans le cockpit opérateur.

### T1 — Critères d'activation cockpit

T1 détecte une incohérence entre la confiance (confidence_score) et les indicateurs
premium actifs. Ses seuils D-COH-01 sont provisoires.

**Conditions requises avant activation T1 cockpit :**

- [ ] Seuils D-COH-01 (X=65, Y=2) validés sur données terrain V0 réelles
  — confirmer que ces seuils produisent un taux de vrais positifs > 70%
- [ ] Taux de faux positifs T1 < 20% sur ≥ 50 sessions V0
- [ ] Message T1 ("Confiance faible avec indicateurs premium élevés.") testé lisibilité terrain
  — ≥ 4/5 opérateurs comprennent immédiatement
- [ ] Fréquence d'apparition T1 estimée ≤ 20% des sessions (en dessous du seuil T3)
- [ ] Validation spécifique : T1 ne doit pas coexister avec un message T3 simultané
  (T3 gagne toujours, T1 absorbé — validé en Snapshot I)

### T2 — Critères d'activation cockpit

T2 détecte une surcharge structurelle (niveau de structure "haut" ou "très haut").
C'est le signal le plus contextuel — sa définition exacte dépend de la cartographie
des states Caméléon.

**Conditions requises avant activation T2 cockpit :**

- [ ] Définition formelle de "niveau structurel haut" dans `decision.js` — alignée sur
  les states réellement encodés (pas provisoire)
- [ ] Taux de faux positifs T2 < 20% sur ≥ 50 sessions V0
- [ ] Message T2 ("Structure chargée — conditions de lecture difficiles.") validé terrain
- [ ] Vérification que T2 n'apparaît pas simultanément avec T3 dans les cas normaux
  (si coexistence fréquente, revoir les seuils)
- [ ] Fréquence T2 estimée ≤ 15% des sessions

### T4 — Critères d'activation cockpit

T4 est la tension la plus laxiste (MdS > 3, QdR > 3, confidence > 2).
Elle représente la "surqualification technique" — cas où l'opérateur cherche trop
de confirmation avant d'agir.

**Conditions requises avant activation T4 cockpit :**

- [ ] Seuils T4 (actuellement très laxistes — D-COH-01) resserrés après calibration V0
  — objectif : T4 n'apparaît que dans ≤ 10% des sessions
- [ ] Message T4 ("Indicateurs techniques saturés.") validé — risque de confusion avec
  le moteur lui-même (l'opérateur peut croire que le moteur est saturé)
  — si confusion observée, reformuler avant activation
- [ ] Confirmation que T4 ne génère aucun sentiment de pression ou d'urgence
- [ ] Taux de faux positifs T4 < 15% sur ≥ 50 sessions V0

### Ordre d'activation recommandé

Si toutes les conditions sont remplies, l'ordre d'activation cockpit recommandé est :

```
T3 (Phase 2 — actif)
  → T1 (Phase 3 — après calibration seuils D-COH-01)
    → T2 (Phase 4 — après validation structurelle)
      → T4 (Phase 5 — seuils resserrés uniquement)
```

**Aucune activation sans validation des critères ci-dessus.**

### Note sur la décision d'activation

L'activation d'un type cockpit est une décision produit, pas une décision technique.
Les critères ci-dessus sont nécessaires mais pas suffisants : si le test V0 révèle
que le cockpit est déjà trop chargé avec T3 seul, les phases suivantes seront retardées
ou annulées. La surface calme prime sur la complétude de la couche V2.

---

## Rollback cockpit — procédures Phase 2

Phase 2 peut être annulée à tout moment. Il existe quatre niveaux de rollback,
du plus ciblé au plus total.

### Niveau 1 — Rollback message cockpit uniquement (T2-05)

Annule le rendu cockpit sans toucher aux composants V2.

```bash
git revert HEAD  # si T2-05 est le dernier commit
# ou
git revert <hash-commit-T2-05>
```

**Résultat :** le message T3 disparaît du cockpit. Les composants hierarchy/attention/exposition
continuent de fonctionner en shadow mode (Debug uniquement). Utilisé si le message
pose un problème de présentation mais pas d'architecture.

Vérification :
- [ ] Cockpit identique à Phase 1 après revert
- [ ] Debug panel : ExpositionResult toujours présent
- [ ] Console : zéro erreur

### Niveau 2 — Rollback flag cockpit (T2-04)

Désactive `V2_COCKPIT_MESSAGE` sans modifier render.js.

```javascript
// src/js/v2/flags.js
V2_COCKPIT_MESSAGE: false,  // ← false (était true)
```

**Résultat :** aucun message visible dans le cockpit. Tous les composants V2 restent
actifs en shadow. Utilisé si la décision est temporaire ("revenir au shadow mode
le temps de recalibrer").

Vérification :
- [ ] Snapshot G : cockpit sans message, ExpositionResult présent en Debug
- [ ] Commit : `fix(v2): disable cockpit message pending recalibration`

### Niveau 3 — Rollback exposition (T2-03)

Désactive `V2_EXPOSITION` — plus d'ExpositionResult produit.

```javascript
V2_EXPOSITION: false,   // ← false
```

**Résultat :** `expositionResult = null` dans le payload. La hiérarchie et l'attention
continuent de fonctionner (Debug). Utilisé si les templates posent un problème.

Vérification :
- [ ] `payload.v2?.expositionResult === null` en Debug
- [ ] Cockpit inchangé

### Niveau 4 — Rollback total Phase 2

Désactive tous les flags V2 activés en Phase 2, revenant à l'état Phase 1 validée.

```javascript
// src/js/v2/flags.js
V2_HIERARCHY: false,
V2_ATTENTION: false,
V2_EXPOSITION: false,
V2_COCKPIT_MESSAGE: false,
```

**Résultat :** `runV2()` retourne après la cohérence seulement (Phase 1). Tous les
composants Phase 2 sont inertes.

Vérification :
- [ ] Snapshot A–F Phase 1 : comportement identique Phase 1
- [ ] Debug : tensionMap présent, hierarchyResult = null
- [ ] Cockpit : aucun message V2

**Alternative via git :**
```bash
git revert <hash-T2-01>..<hash-T2-05>  # si tous les commits Phase 2 sont consécutifs
```

### Procédure de décision de rollback

Rollback si l'un des signaux d'arrêt est observé (voir § Signaux d'arrêt).

| Situation | Niveau rollback recommandé |
|---|---|
| Message trop fréquent (> 30%) | Niveau 2 (flag cockpit off) |
| Message mal compris, reformuler | Niveau 1 (revert render.js, reformuler, réappliquer) |
| Faux positif T3 confirmé | Niveau 4 (investigation seuils avant réouverture) |
| Régression moteur V1 | Niveau 4 + investiguer render.js |
| Sensation de surveillance opérateur | Niveau 2 + reformuler message |

---

## Signaux d'arrêt Phase 2

**À tout moment, si l'un de ces signaux est observé, arrêter Phase 2 immédiatement.**
Ne pas continuer vers la validation finale. Diagnostiquer et corriger d'abord.

### Signaux bloquants — arrêt immédiat

| # | Signal | Gravité | Action |
|---|---|---|---|
| S2-01 | Régression moteur V1 — score ou posture modifiés par V2 | Critique | Rollback niveau 4 · investiguer interaction render.js/engine.js |
| S2-02 | Deux messages `.v2-message` simultanément dans le cockpit | Critique | Rollback niveau 1 · corriger hiérarchie ou render.js |
| S2-03 | Message T3 apparaît sans inputs cohérents (faux positif confirmé) | Critique | Rollback niveau 2 · investiguer seuils T3 dans `decision.js` |
| S2-04 | Erreur JavaScript console liée à render.js ou à un composant V2 | Bloquant | Corriger avant de poursuivre · ne pas valider avec erreurs JS |
| S2-05 | Logique punitive détectée — bouton bloqué, score modifié, popup déclenchée | Critique | Rollback niveau 4 · le composant V2 ne doit jamais bloquer le moteur |

### Signaux de calibration — pause et révision

Ces signaux n'imposent pas un rollback immédiat mais bloquent la validation Phase 2
jusqu'à résolution.

| # | Signal | Action |
|---|---|---|
| S2-06 | Fréquence T3 cockpit > 30% sur 10 sessions | Analyser les sessions · recalibrer seuils T3 si nécessaire |
| S2-07 | ≥ 2 opérateurs expriment une gêne, un sentiment de surveillance ou une confusion | Reformuler le message dans `exposition.js` · re-valider lisibilité |
| S2-08 | `attention_level` ne décline pas après expositions répétées (fenêtre toujours `normal`) | Vérifier implémentation `applyAttentionGate()` · variable `_attentionState` bien persistée dans `pipeline-v2.js` |

### Signaux de vigilance — observer sans arrêter

| # | Signal | Observation |
|---|---|---|
| S2-09 | T3 n'apparaît jamais sur 20 sessions terrain (taux 0%) | Vérifier que les conditions T3 sont réalistement déclenchables avec le profil opérateur test |
| S2-10 | Le message T3 est ignoré systématiquement après 3 sessions | Signal de bruit — évaluer si T3 apporte de la valeur ou du bruit de fond |

### Matrice décision signal → action

```
Signal critique (S2-01 à S2-05) → Rollback immédiat → Investiguer → Corriger → Reprendre Phase 2
Signal calibration (S2-06/07/08) → Pause → Analyser → Corriger → Re-valider section concernée
Signal vigilance (S2-09/10) → Logger → Décision produit lors du bilan Phase 2
```

---

## Critères de fin Phase 2

**Phase 2 est validée quand les 4 tableaux ci-dessous sont entièrement verts.**
Aucun item rouge ni en attente ne permet de passer à Phase 3.

### Tableau 1 — Implémentation technique

| Item | Critère | Statut |
|---|---|---|
| T2-01 | `hierarchy.js` implémenté, PRIORITY_ORDER=['T3','T1','T2','T4'], V2_HIERARCHY:true | ☐ |
| T2-02 | `attention.js` implémenté, gate fenêtre glissante, V2_ATTENTION:true | ☐ |
| T2-03 | `exposition.js` templates T1–T4 implémentés, V2_EXPOSITION:true | ☐ |
| T2-04 | V2_COCKPIT_MESSAGE:true, vérifications G/A/H passées | ☐ |
| T2-05 | render.js bloc T3 ajouté, CSS sobre, escapeHtml() utilisé | ☐ |
| Commits | 5 commits atomiques — un par tâche | ☐ |
| Console | Zéro erreur JavaScript après T2-05 | ☐ |
| localStorage | Aucune clé V2 dans localStorage | ☐ |

### Tableau 2 — Non-régression moteur et UX

| Item | Critère | Statut |
|---|---|---|
| R-01 à R-08 | Scores et postures V1 identiques | ☐ |
| Module comportement | Isolation stricte préservée | ☐ |
| Snapshots A–F | Comportement identique Phase 1 | ☐ |
| CSS | Aucune collision `.v2-message` avec styles existants | ☐ |

### Tableau 3 — Surface calme et UX Phase 2

| Item | Critère | Statut |
|---|---|---|
| Exposition unique | Jamais deux messages simultanés (`active_exposed ≤ 1`) | ☐ |
| Rendu minimal | Message sobre : aucun rouge, aucune animation | ☐ |
| Suppression silencieuse | Cockpit silencieux quand gate = false | ☐ |
| Fréquence | Taux T3 cockpit ≤ 30% sur 10 sessions | ☐ |
| Logique punitive | Aucun blocage, aucune modification moteur | ☐ |
| Dépendance Debug | Cockpit identique Debug ouvert ou fermé | ☐ |

### Tableau 4 — Validation terrain

| Item | Critère | Statut |
|---|---|---|
| Lisibilité | ≥ 4/5 opérateurs comprennent T3 immédiatement | ☐ |
| Surcharge perçue | ≤ 1/5 opérateurs signalent une surcharge cognitive | ☐ |
| Ton | 0/5 opérateurs ressentent surveillance ou pression | ☐ |
| Snapshots G/H/I | 3 snapshots construits et validés terrain | ☐ |
| Sessions terrain | ≥ 10 sessions terrain Phase 2 complétées | ☐ |

### Condition de passage Phase 3

Phase 3 peut démarrer uniquement si :
1. Les 4 tableaux ci-dessus sont entièrement verts
2. Aucun signal d'arrêt actif (S2-01 à S2-05)
3. Décision explicite de continuer vers T1 cockpit (critères d'activation T1 validés)

**Si Phase 3 n'est pas encore justifiée** (seuils D-COH-01 non calibrés, V0 insuffisant) :
Phase 2 reste l'état stable indéfiniment. Il n'y a pas d'obligation de continuer.

---

## Statut et suite

**Statut de ce document :** Checklist opérationnelle · Version 1.0 · Non commencée

Ce document couvre Phase 2 intégralement : de la philosophie de surface calme
à la validation terrain, en passant par les 5 tâches d'implémentation et les
procédures de rollback.

### Ce que Phase 2 apporte

À l'issue de Phase 2, le moteur Caméléon est dans l'état suivant :
- **4 composants V2 actifs :** cohérence (Phase 1) + hiérarchie + attention + explicabilité
- **1 tension visible cockpit :** T3 uniquement, sobre, factuel, ≤ 15 mots
- **Surface calme préservée :** `active_exposed ≤ 1`, fréquence ≤ 30%, aucune animation
- **T1/T2/T4 en shadow :** Debug uniquement, en attente de calibration V0

### Ce que Phase 2 ne résout pas

- La calibration des seuils D-COH-01 — dépend du test V0 terrain
- L'activation T1/T2/T4 cockpit — critères documentés mais non remplis
- La CalibrationSnapshot (Phase 6) — instrumentation séparée
- L'escalade/désescalade de tensions (D-HIE-02/03) — réservée aux phases futures

### Document suivant

Une fois Phase 2 validée (4 tableaux verts) et les critères d'activation T1 remplis
(seuils D-COH-01 calibrés, faux positifs < 20%), le prochain document sera :

**`docs/architecture/checklist-implementation-phase-3.md`**

Phase 3 activera T1 dans le cockpit selon l'ordre établi :
`T3 cockpit (Phase 2) → T1 cockpit (Phase 3) → T2 cockpit (Phase 4) → T4 cockpit (Phase 5)`

**Phase 3 ne doit pas être planifiée avant que Phase 2 soit entièrement validée.**
La checklist Phase 3 sera créée uniquement quand les critères d'activation T1 sont remplis.

---

*Checklist Phase 2 — Version 1.0 — 2026-05-24*
