# Checklist d'implémentation — Phase 0 : Infrastructure V2

## Métadonnées

**Statut** : Checklist opérationnelle · Phase 0 uniquement
**Version** : 1.0 — 2026-05-24
**Dépendances** :
- `docs/architecture/plan-implementation-v2-phase-1.md` — plan de référence
- `docs/architecture/strategie-implementation-v2.md` — principes I–VI
- `docs/architecture/cartographie-variables-pipeline.md` — D-MAP-01/03

**Usage :** Ce document s'exécute ligne par ligne lors de l'implémentation réelle.
Cocher chaque item après vérification physique. Ne pas anticiper, ne pas regrouper.

---

## Objectif de Phase 0

Créer l'infrastructure V2 dans `src/js/v2/` sans modifier le comportement du moteur.
À l'issue de Phase 0 :
- Le moteur V1 se comporte exactement comme avant
- Le répertoire `src/js/v2/` existe avec 8 fichiers inertes
- `moteur.js` contient un branchement commenté (3 lignes, sans effet)
- Aucune tension n'est calculée
- Aucun flag V2 n'est actif
- Le cockpit est visuellement et fonctionnellement identique

**Ce document ne couvre pas Phase 1 (activation coherence.js).** Phase 1 fait l'objet
d'une checklist séparée à exécuter uniquement après Phase 0 entièrement validée.

---

## Prérequis Git

Vérifier l'état du dépôt avant de commencer. Ne pas démarrer si l'état n'est pas propre.

```bash
# Vérifier état du working tree
git status

# Vérifier la branche courante
git branch --show-current

# Vérifier les derniers commits (repère avant modification)
git log --oneline -5
```

### Checklist prérequis Git

- [ ] `git status` retourne **working tree clean** (aucun fichier modifié non commité)
- [ ] Branche courante : `main` (ou branche de travail dédiée Phase 0)
- [ ] Hash du dernier commit noté : `________________` (référence de rollback)

### Branche recommandée

Phase 0 peut être exécutée directement sur `main` — les modifications sont inertes
et réversibles par revert individuel. Si une branche dédiée est préférée :

```bash
git checkout -b feat/v2-phase-0-infrastructure
```

Dans ce cas, merger sur `main` après validation Phase 0 complète.

---

## Snapshot obligatoire — avant toute modification

**Cette étape est bloquante.** Ne pas modifier un seul fichier avant d'avoir pris
les snapshots de référence.

### Action

1. Démarrer le serveur local :
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\serve-local.ps1 -Port 8000
   ```
2. Ouvrir `http://localhost:8000/src/index.html`
3. Prendre 3 soumissions de référence avec des inputs distincts

### Snapshot A — posture PASSIVE

Inputs : confidence faible, structure faible, volatilité haute, posture historique conservative.

| Champ | Valeur utilisée |
|---|---|
| (à remplir lors de l'exécution) | |

Résultats attendus :
- Posture : `________________`
- confidence_score : `________________`
- Actions autorisées : `________________`
- Actions interdites : `________________`

### Snapshot B — posture ACTIVE

Inputs : confidence élevée, tendance claire, faible volatilité, signaux favorables.

| Champ | Valeur utilisée |
|---|---|
| (à remplir lors de l'exécution) | |

Résultats attendus :
- Posture : `________________`
- confidence_score : `________________`
- Actions autorisées : `________________`
- Actions interdites : `________________`

### Snapshot C — posture BALANCED

Inputs : situation intermédiaire, signaux mixtes.

| Champ | Valeur utilisée |
|---|---|
| (à remplir lors de l'exécution) | |

Résultats attendus :
- Posture : `________________`
- confidence_score : `________________`
- Actions autorisées : `________________`
- Actions interdites : `________________`

### Checklist snapshot

- [ ] Snapshot A pris et valeurs notées
- [ ] Snapshot B pris et valeurs notées
- [ ] Snapshot C pris et valeurs notées
- [ ] Console navigateur : **zéro erreur, zéro warning**
- [ ] Panel Debug ouvert : état V1 visible, aucun bloc V2

---

## Ordre d'exécution — Phase 0

Les tâches s'exécutent dans cet ordre strict. Chaque tâche est validée avant de
passer à la suivante. Ne pas paralléliser.

```
T0-01 → T0-02 → T0-03 → T0-04 → T0-05 → T0-06 → T0-07 → T0-08
  ↓        ↓        ↓        ↓        ↓        ↓        ↓        ↓
résoudre  vérifier créer    flags.js types.js  squel.  pipel.  branch.
D-MAP-03  imports  src/js/v2          JSDoc     V2      inerte  moteur.js
(commit)  (lecture)(pas      (commit) (commit) (commit)(commit) (commit)
          seule)   commit)
```

**T0-01 est bloquant** : si D-MAP-03 (nomenclature confidence) n'est pas résolu,
la couche cohérence Phase 1 ne fonctionnera pas. Résoudre avant tout autre fichier V2.

**T0-08 est le seul risque** : c'est la seule modification d'un fichier existant
(moteur.js). Les 7 tâches précédentes sont sans risque (nouveaux fichiers uniquement).

---

## T0-01 — Résolution D-MAP-03 : nomenclature `confidence_score`

**Prérequis :** snapshots de référence pris.
**Fichiers à lire :** `src/js/engine.js`, `src/js/confidence-score.js`, `src/js/moteur.js`, `src/js/render.js` (grep uniquement).

### Étapes

**Étape 1 — Audit**

Lancer dans le terminal (depuis la racine du projet) :
```bash
grep -rn "confidence" src/js/ --include="*.js" | grep -v "//\|#\|\*"
```

Lister tous les noms de variable trouvés :
- `________________`
- `________________`
- `________________`

**Étape 2 — Choisir le nom canonique**

Nom canonique retenu : `confidence_score` (cohérent avec CalibrationSnapshot).

Si un seul nom est utilisé partout → D-MAP-03 déjà résolu, passer à T0-02 (pas de commit).
Si plusieurs noms → procéder à l'unification.

**Étape 3 — Unification (si nécessaire)**

Remplacer les variantes (`confidence`, `confidenceScore`) par `confidence_score` dans
les fichiers concernés. Vérifier chaque remplacement — ne pas faire de replace-all aveugle
sur `render.js` (les labels UI peuvent contenir le mot "confidence" en français).

**Étape 4 — Vérification**

```bash
grep -rn "confidence" src/js/ --include="*.js" | grep -v "//\|#\|\*\|label\|text\|Confiance"
```

Résultat attendu : uniquement `confidence_score` comme nom de variable.

**Étape 5 — Test de régression**

Recharger l'application. Repasser Snapshot A, B, C. Vérifier que les valeurs sont identiques.

**Étape 6 — Commit (si modification effectuée)**

```bash
git add src/js/engine.js src/js/confidence-score.js src/js/moteur.js  # fichiers modifiés
git commit -m "refactor(engine): unify confidence_score nomenclature (D-MAP-03)"
```

### Checklist T0-01

- [ ] Audit grep effectué, variantes listées
- [ ] Nom canonique confirmé : `confidence_score`
- [ ] Unification effectuée (ou D-MAP-03 déjà résolu)
- [ ] Grep post-unification : zéro variante résiduelle
- [ ] Snapshots A/B/C repropassés : valeurs identiques
- [ ] Console : zéro erreur
- [ ] Commit effectué (si modification) ou étape skippée (si déjà unifié)

---

## T0-02 — Vérification ordre imports `index.html` (D-IMPL-05)

**Pas de modification — lecture uniquement.**

### Étapes

**Étape 1 — Localiser moteur.js dans index.html**

```bash
grep -n "moteur\|engine\|script" src/index.html
```

Noter la ligne où `moteur.js` est chargé : `________________`

**Étape 2 — Identifier le type de module**

Les scripts sont-ils déclarés avec `type="module"` ?
- [ ] Oui — les fichiers V2 peuvent utiliser `export/import` nativement
- [ ] Non — vérifier si des scripts ES modules coexistent avec des scripts classiques

**Étape 3 — Identifier l'emplacement d'insertion**

Les fichiers V2 (`src/js/v2/*.js`) devront être chargés **après** `moteur.js` et
**avant** tout script d'initialisation qui appelle `runMoteur()`.

Emplacement d'insertion identifié : ligne `________________` de `index.html`

**Étape 4 — Documenter**

Si `type="module"` : l'import de `pipeline-v2.js` dans `moteur.js` suffira —
pas besoin de balises `<script>` supplémentaires dans `index.html`.

Si scripts classiques : noter les balises à ajouter pour chaque fichier V2.

### Checklist T0-02

- [ ] Ligne de chargement `moteur.js` identifiée
- [ ] Type de module déterminé (ES module ou classique)
- [ ] Emplacement d'insertion V2 dans `index.html` noté
- [ ] Aucune modification effectuée

---

## T0-03 — Création du répertoire `src/js/v2/`

**Pas de commit — répertoire vide non tracké par Git.**

### Étapes

**Étape 1 — Vérifier que le répertoire n'existe pas**

```bash
ls src/js/
```

Si `v2/` est déjà présent → vérifier son contenu avant de continuer.

**Étape 2 — Créer le répertoire**

```bash
mkdir src/js/v2
```

**Étape 3 — Vérifier**

```bash
ls src/js/v2/
```

Résultat attendu : répertoire vide (ou inexistant jusqu'à T0-04).

### Checklist T0-03

- [ ] Répertoire `src/js/v2/` inexistant avant création
- [ ] Répertoire créé
- [ ] Aucun fichier inattendu dans ce répertoire

---

## T0-04 — Création de `src/js/v2/flags.js`

### Contenu exact à créer

```javascript
// src/js/v2/flags.js
// Feature flags V2 — tous désactivés par défaut
// Ne jamais persister en localStorage
// Modifier uniquement dans ce fichier

export const V2_FLAGS = {
  // Activation globale — si false, runV2() est un no-op
  V2_ENABLED: false,

  // Composants individuels (activation dans l'ordre documenté)
  V2_COHERENCE: false,       // Phase 1 — couche cohérence inter-modules
  V2_HIERARCHY: false,       // Phase 2 — hiérarchie des tensions
  V2_ATTENTION: false,       // Phase 3 — gestion de l'attention
  V2_EXPOSITION: false,      // Phase 4 — explicabilité sobre

  // Exposition cockpit (activer uniquement après shadow mode validé)
  V2_COCKPIT_MESSAGE: false, // Phase 5 — affichage ExpositionResult.message

  // Instrumentation calibration
  V2_CALIBRATION: false,     // Phase 6 — CalibrationSnapshot + buffer
};
```

### Vérification

Après création :
```bash
grep -n "true" src/js/v2/flags.js
```
Résultat attendu : **aucune ligne** (tous les flags sont `false`).

### Commit

```bash
git add src/js/v2/flags.js
git commit -m "feat(v2): add V2_FLAGS feature flags (all disabled)"
```

### Checklist T0-04

- [ ] Fichier `src/js/v2/flags.js` créé
- [ ] Tous les 7 flags sont `false`
- [ ] Grep `true` retourne zéro résultat dans ce fichier
- [ ] Aucun autre fichier modifié
- [ ] Commit effectué

---

## T0-05 — Création de `src/js/v2/types.js`

Uniquement des commentaires JSDoc `@typedef`. **Aucune logique JavaScript.**

### Contenu exact à créer

```javascript
// src/js/v2/types.js
// Définitions de types V2 — JSDoc uniquement, aucune logique

/**
 * @typedef {'T1'|'T2'|'T3'|'T4'} TensionId
 * T1 = cohérence confidence/premium
 * T2 = surcharge structurelle
 * T3 = delta engagement/posture
 * T4 = surqualification technique
 */

/**
 * @typedef {object} TensionDetail
 * @property {TensionId} id
 * @property {string} type
 * @property {'low'|'medium'|'high'} severity
 * @property {object} payload - données contextuelles de la tension
 */

/**
 * @typedef {object} TensionMap
 * @property {TensionDetail[]} tensions
 * @property {number} active_exposed - nombre de tensions actives exposées
 * @property {'low'|'medium'|'high'} noise_level
 */

/**
 * @typedef {object} HierarchyResult
 * @property {TensionDetail|null} winner - tension prioritaire sélectionnée
 * @property {TensionDetail[]} absorbed - tensions absorbées silencieusement
 * @property {TensionDetail[]} silent - tensions présentes non exposées
 * @property {TensionId[]} escalated - tensions dont la sévérité a monté
 * @property {TensionId[]} deescalated - tensions dont la sévérité a baissé
 */

/**
 * @typedef {object} AttentionState
 * @property {number[]} expositions_window - fenêtre glissante des dernières expositions
 * @property {string|null} last_exposed_id - id de la dernière tension exposée
 * @property {number} consecutive_silent - nombre de cycles silencieux consécutifs
 */

/**
 * @typedef {object} AttentionResult
 * @property {boolean} should_expose - gate final : la tension doit-elle être exposée ?
 * @property {'normal'|'elevated'|'high'} attention_level - niveau d'attention courant
 * @property {TensionDetail|null} suppressed_winner - winner supprimé par le gate (debug only)
 */

/**
 * @typedef {object} ExpositionResult
 * @property {string} message - message final destiné au cockpit
 * @property {string} intention - intention du message (T1–T4)
 * @property {TensionId} tension_id
 * @property {'low'|'medium'|'high'} severity
 * @property {boolean} is_blocking - la tension bloque-t-elle une action ?
 */

/**
 * @typedef {object} CalibrationSnapshot
 * @property {number} timestamp
 * @property {number} confidence_score
 * @property {string} posture
 * @property {number|null} MdS
 * @property {number|null} QdR
 * @property {number|null} DMU
 * @property {string} engagement_declared
 * @property {TensionId|null} winner
 * @property {string} attention_level
 * @property {boolean} should_expose
 */
```

### Vérification

```bash
grep -n "function\|=>\|const\|let\|var\|if\|for\|while\|return" src/js/v2/types.js
```
Résultat attendu : **aucune ligne** (pas de logique).

### Commit

```bash
git add src/js/v2/types.js
git commit -m "feat(v2): add V2 type definitions (JSDoc)"
```

### Checklist T0-05

- [ ] Fichier `src/js/v2/types.js` créé
- [ ] Zéro ligne de logique JavaScript (grep confirme)
- [ ] 7 typedefs présents (TensionId, TensionDetail, TensionMap, HierarchyResult, AttentionState, AttentionResult, ExpositionResult, CalibrationSnapshot)
- [ ] Aucun autre fichier modifié
- [ ] Commit effectué

---

## T0-06 — Création des squelettes de composants V2

Créer 5 fichiers squelettes : `coherence.js`, `hierarchy.js`, `attention.js`,
`exposition.js`, `calibration.js`. Chaque fichier exporte une ou deux fonctions
qui retournent `null` — aucune logique.

### Contenu exact — `src/js/v2/coherence.js`

```javascript
// src/js/v2/coherence.js
// Couche cohérence inter-modules — V2
// SQUELETTE Phase 0 — aucune logique active

/** @param {object} payload @param {Function} behaviorGetter @returns {import('./types.js').TensionMap|null} */
export function computeTensionMap(payload, behaviorGetter) {
  // TODO Phase 1 — implémenter la détection T1–T4
  return null;
}
```

### Contenu exact — `src/js/v2/hierarchy.js`

```javascript
// src/js/v2/hierarchy.js
// Hiérarchie des tensions — V2
// SQUELETTE Phase 0 — aucune logique active

/** @param {import('./types.js').TensionMap|null} tensionMap @returns {import('./types.js').HierarchyResult|null} */
export function computeHierarchy(tensionMap) {
  // TODO Phase 2 — implémenter l'ordre T3>T1>T2>T4
  return null;
}
```

### Contenu exact — `src/js/v2/attention.js`

```javascript
// src/js/v2/attention.js
// Gestion de l'attention — V2
// SQUELETTE Phase 0 — aucune logique active

/** @returns {import('./types.js').AttentionState} */
export function createInitialAttentionState() {
  return { expositions_window: [], last_exposed_id: null, consecutive_silent: 0 };
}

/**
 * @param {import('./types.js').TensionDetail|null} winner
 * @param {import('./types.js').AttentionState} state
 * @returns {{ result: import('./types.js').AttentionResult|null, nextState: import('./types.js').AttentionState }}
 */
export function applyAttentionGate(winner, state) {
  // TODO Phase 3 — implémenter le gate et la fenêtre glissante
  return { result: null, nextState: state };
}
```

### Contenu exact — `src/js/v2/exposition.js`

```javascript
// src/js/v2/exposition.js
// Couche d'explicabilité sobre — V2
// SQUELETTE Phase 0 — aucune logique active

/**
 * @param {import('./types.js').TensionDetail|null} winner
 * @param {boolean} shouldExpose
 * @returns {import('./types.js').ExpositionResult|null}
 */
export function buildExpositionResult(winner, shouldExpose) {
  // TODO Phase 4 — implémenter les templates T1–T4
  return null;
}
```

### Contenu exact — `src/js/v2/calibration.js`

```javascript
// src/js/v2/calibration.js
// Instrumentation calibration — V2
// SQUELETTE Phase 0 — aucune logique active

const BUFFER_MAX = 200;
/** @type {import('./types.js').CalibrationSnapshot[]} */
const calibrationBuffer = [];

/**
 * @param {object} data
 * @returns {void}
 */
export function captureSnapshot(data) {
  // TODO Phase 6 — implémenter la capture CalibrationSnapshot
}

/** @returns {import('./types.js').CalibrationSnapshot[]} */
export function getBuffer() {
  return [...calibrationBuffer];
}

export function clearBuffer() {
  calibrationBuffer.length = 0;
}
```

### Vérification

```bash
grep -n "TODO" src/js/v2/coherence.js src/js/v2/hierarchy.js src/js/v2/attention.js src/js/v2/exposition.js src/js/v2/calibration.js
```
Résultat attendu : 1 ligne TODO par fichier (aucun TODO résolu, logique absente).

```bash
grep -rn "tensionMap\|HierarchyResult\|AttentionResult\|ExpositionResult" src/js/ --include="*.js" | grep -v "v2/"
```
Résultat attendu : **aucune ligne** — les types V2 ne sont pas encore référencés hors de `src/js/v2/`.

### Commit

```bash
git add src/js/v2/coherence.js src/js/v2/hierarchy.js src/js/v2/attention.js src/js/v2/exposition.js src/js/v2/calibration.js
git commit -m "feat(v2): add V2 component skeletons (all no-ops)"
```

### Checklist T0-06

- [ ] `coherence.js` créé — `computeTensionMap()` retourne `null`
- [ ] `hierarchy.js` créé — `computeHierarchy()` retourne `null`
- [ ] `attention.js` créé — `applyAttentionGate()` retourne `{ result: null, nextState: state }`
- [ ] `exposition.js` créé — `buildExpositionResult()` retourne `null`
- [ ] `calibration.js` créé — `captureSnapshot()` ne fait rien, `getBuffer()` retourne `[]`
- [ ] Grep types V2 hors `src/js/v2/` : zéro résultat
- [ ] Aucun fichier existant modifié
- [ ] Commit effectué

---

## T0-07 — Création de `src/js/v2/pipeline-v2.js` (orchestrateur inerte)

L'orchestrateur chaînera les composants V2 au fur et à mesure des phases.
En Phase 0, il retourne toujours `null`.

### Contenu exact à créer

```javascript
// src/js/v2/pipeline-v2.js
// Orchestrateur V2 — Phase 0 : inerte
// Chaîne les composants V2 au fur et à mesure de leur activation

import { V2_FLAGS } from './flags.js';
// Les imports de composants seront décommentés phase par phase :
// import { computeTensionMap } from './coherence.js';     // Phase 1
// import { computeHierarchy } from './hierarchy.js';      // Phase 2
// import { createInitialAttentionState, applyAttentionGate } from './attention.js'; // Phase 3
// import { buildExpositionResult } from './exposition.js'; // Phase 4
// import { captureSnapshot } from './calibration.js';     // Phase 6

/** @type {import('./types.js').AttentionState|null} */
let _attentionState = null;

/**
 * Exécute la pipeline V2 sur le payload V1.
 * Retourne null si V2 désactivé ou si aucun composant actif.
 * @param {object} payloadV1 - Payload produit par buildPayload()
 * @param {Function|null} [behaviorGetter=null] - Getter profil comportemental
 * @returns {{ tensionMap, hierarchyResult, attentionResult, expositionResult }|null}
 */
export function runV2(payloadV1, behaviorGetter = null) {
  if (!V2_FLAGS.V2_ENABLED) return null;

  // Phase 0 : aucun composant actif — passthrough
  // Les blocs ci-dessous seront décommentés phase par phase

  /* Phase 1 — Couche cohérence
  if (!V2_FLAGS.V2_COHERENCE) return null;
  const tensionMap = computeTensionMap(payloadV1, behaviorGetter);
  */

  /* Phase 2 — Hiérarchie
  if (!V2_FLAGS.V2_HIERARCHY) return { tensionMap, hierarchyResult: null, attentionResult: null, expositionResult: null };
  const hierarchyResult = computeHierarchy(tensionMap);
  */

  /* Phase 3 — Attention
  if (!_attentionState) _attentionState = createInitialAttentionState();
  if (!V2_FLAGS.V2_ATTENTION) return { tensionMap, hierarchyResult, attentionResult: null, expositionResult: null };
  const { result: attentionResult, nextState } = applyAttentionGate(hierarchyResult?.winner ?? null, _attentionState);
  _attentionState = nextState;
  */

  /* Phase 4 — Explicabilité
  if (!V2_FLAGS.V2_EXPOSITION) return { tensionMap, hierarchyResult, attentionResult, expositionResult: null };
  const expositionResult = buildExpositionResult(hierarchyResult?.winner ?? null, attentionResult?.should_expose ?? false);
  return { tensionMap, hierarchyResult, attentionResult, expositionResult };
  */

  return null; // Phase 0 — retirer cette ligne à Phase 1
}

/**
 * Réinitialise l'état de session (à appeler au rechargement).
 */
export function resetV2SessionState() {
  _attentionState = null;
}
```

### Vérification

```bash
grep -n "return null" src/js/v2/pipeline-v2.js
```
Résultat attendu : au moins 1 ligne `return null` active (Phase 0 passthrough).

```bash
node -e "import('./src/js/v2/pipeline-v2.js').then(m => console.log(m.runV2({}))).catch(e => console.log('ES module — ok'))"
```
Alternativement, vérifier dans le navigateur après chargement que `runV2({})` retourne `null` sans erreur.

### Commit

```bash
git add src/js/v2/pipeline-v2.js
git commit -m "feat(v2): add inert V2 orchestrator pipeline-v2.js (Phase 0)"
```

### Checklist T0-07

- [ ] Fichier `src/js/v2/pipeline-v2.js` créé
- [ ] `runV2()` retourne `null` si `V2_ENABLED: false`
- [ ] `runV2()` retourne `null` en Phase 0 (ligne `return null` active)
- [ ] Tous les blocs Phase 1–4 sont commentés
- [ ] `resetV2SessionState()` exportée
- [ ] Aucun fichier existant modifié
- [ ] Commit effectué

---

## T0-08 — Branchement inerte dans `src/js/moteur.js`

**C'est la seule modification d'un fichier existant en Phase 0.**
**Lire `moteur.js` en entier avant de modifier quoi que ce soit.**

### Étape 1 — Lire `moteur.js`

Identifier :
- La fonction principale exportée (probablement `runMoteur()`)
- L'emplacement exact de l'appel à `buildPayload()` ou l'endroit où le payload final est assemblé
- La ligne `return` qui retourne le payload

Note la ligne de retour du payload : `________________`

### Étape 2 — Ajouter le branchement commenté

Insérer **après** la ligne qui assemble le payload final, **avant** le `return` :

```javascript
// --- Branchement V2 — inerte Phase 0 ---
// Décommenter l'import en haut du fichier lors de Phase 1 :
// import { runV2, resetV2SessionState } from './v2/pipeline-v2.js';
const _v2Result = null; // V2_FLAGS.V2_ENABLED ? runV2(payload) : null;
let payload = /* résultat buildPayload */ payloadLocal; // renommer si nécessaire
if (_v2Result !== null) {
  payload = { ...payload, v2: _v2Result };
}
// --- Fin branchement V2 ---
```

**Important :** adapter les noms de variables au code réel de `moteur.js`. Le schéma
ci-dessus est indicatif — ne pas le copier-coller sans lecture préalable.

**Ce qui ne doit pas changer :**
- La signature de `runMoteur()` (mêmes paramètres, même type de retour)
- Les champs du payload V1 retourné
- Tout calcul existant au-dessus de l'insertion

### Étape 3 — Vérification immédiate

Recharger l'application **immédiatement** après modification.

```bash
# Dans le terminal
git diff src/js/moteur.js
```

Vérifier que le diff contient uniquement les 5–8 lignes du branchement inerte,
aucune autre modification.

### Étape 4 — Test de régression post-branchement

Repasser les 3 snapshots de référence. **Critère strict :**

| Snapshot | Posture | confidence_score | Actions autorisées | Actions interdites |
|---|---|---|---|---|
| A (PASSIVE) | identique | identique | identique | identique |
| B (ACTIVE) | identique | identique | identique | identique |
| C (BALANCED) | identique | identique | identique | identique |

Si **une seule valeur diffère** → rollback immédiat (voir § Rollback).

### Étape 5 — Vérification console

- [ ] Console navigateur : **zéro erreur JavaScript**
- [ ] Console navigateur : **zéro warning**
- [ ] Pas de message `undefined` lié à V2 dans la console

### Étape 6 — Vérification `payload.v2` absent

Ouvrir le Debug panel. Vérifier que `payload.v2` n'apparaît pas (le branchement
est inerte — `_v2Result` est `null`, donc la propriété `v2` n'est pas ajoutée).

### Commit

```bash
git add src/js/moteur.js
git commit -m "feat(v2): add inert V2 branch in moteur.js (Phase 0)"
```

### Checklist T0-08

- [ ] `moteur.js` lu intégralement avant modification
- [ ] Branchement inséré après assemblage payload, avant `return`
- [ ] Import `runV2` en commentaire (pas actif)
- [ ] `_v2Result` initialisé à `null` (pas d'appel réel)
- [ ] `git diff` confirme uniquement les lignes du branchement
- [ ] Snapshot A repropassé : posture, score, actions identiques
- [ ] Snapshot B repropassé : posture, score, actions identiques
- [ ] Snapshot C repropassé : posture, score, actions identiques
- [ ] Console : zéro erreur, zéro warning
- [ ] `payload.v2` absent du Debug panel
- [ ] Commit effectué

---

## Validation globale Phase 0

À exécuter après T0-08. Cette validation est la porte de sortie de Phase 0.
**Ne pas déclarer Phase 0 terminée sans avoir passé tous les items.**

### État attendu du répertoire

```bash
ls src/js/v2/
```

Résultat attendu :
```
attention.js
calibration.js
coherence.js
exposition.js
flags.js
hierarchy.js
pipeline-v2.js
types.js
```

- [ ] 8 fichiers présents, pas plus, pas moins

### État attendu des commits

```bash
git log --oneline -8
```

Commits Phase 0 attendus (dans l'ordre inverse) :
```
feat(v2): add inert V2 branch in moteur.js (Phase 0)
feat(v2): add inert V2 orchestrator pipeline-v2.js (Phase 0)
feat(v2): add V2 component skeletons (all no-ops)
feat(v2): add V2 type definitions (JSDoc)
feat(v2): add V2_FLAGS feature flags (all disabled)
refactor(engine): unify confidence_score nomenclature (D-MAP-03)  ← si applicable
```

- [ ] Tous les commits Phase 0 présents dans l'historique

### État attendu des flags

```bash
grep -n "true" src/js/v2/flags.js
```

- [ ] Résultat : **aucune ligne** (tous les flags `false`)

### État attendu du comportement moteur

- [ ] Snapshot A : posture, confidence_score, actions **identiques** à l'état pré-Phase 0
- [ ] Snapshot B : posture, confidence_score, actions **identiques** à l'état pré-Phase 0
- [ ] Snapshot C : posture, confidence_score, actions **identiques** à l'état pré-Phase 0

### État attendu du cockpit

- [ ] Tab Moteur : aucun nouveau élément visuel
- [ ] Tab Pilotage : aucun nouveau élément visuel
- [ ] Tab Mémoire : les anciens snapshots s'affichent sans erreur
- [ ] Sidebar Comportement : inchangée

### État attendu de la console

- [ ] Zéro erreur JavaScript
- [ ] Zéro warning
- [ ] Zéro message lié à V2 ou `undefined`

---

## Protocole de vérification — cockpit identique

Ce protocole vérifie que le cockpit opérateur est visuellement et fonctionnellement
inchangé. Il s'exécute après T0-08 et lors de la validation globale.

### Vérification visuelle

Ouvrir `http://localhost:8000/src/index.html` et inspecter chaque surface :

**Tab Moteur**
- [ ] Formulaire : tous les champs présents, aucun champ nouveau
- [ ] Bouton de soumission : fonctionnel
- [ ] Zone de résultat : posture, actions affichées normalement
- [ ] Aucun texte ou bloc supplémentaire visible

**Tab Pilotage**
- [ ] Contenu identique à l'état pré-Phase 0
- [ ] Aucun élément nouveau

**Tab Mémoire**
- [ ] Historique visible et scrollable
- [ ] Les snapshots existants s'affichent sans erreur
- [ ] Aucune propriété `v2` visible dans les snapshots affichés

**Panel Debug (sidebar)**
- [ ] Sections existantes présentes (score brut, posture, confidence breakdown)
- [ ] Aucune section V2 (tensionMap, HierarchyResult, AttentionState, etc.)
- [ ] Bouton debug fonctionne (ouvre/ferme)

### Vérification fonctionnelle

Soumettre le Snapshot B (posture ACTIVE) :
- [ ] La posture affichée est correcte
- [ ] Les actions autorisées sont affichées
- [ ] Le panel Debug affiche les mêmes valeurs qu'avant Phase 0

### Vérification d'absence de fuite V2

```bash
grep -n "v2\|tensionMap\|HierarchyResult\|winner\|should_expose\|AttentionState" src/js/render.js | grep -v "//\|#"
```

- [ ] Résultat : **aucune ligne** (render.js ne référence pas encore les types V2)

---

## Protocole de vérification — payload existant inchangé

Ce protocole vérifie que les champs V1 du payload retourné par `runMoteur()` sont
strictement inchangés après l'ajout du branchement inerte.

### Méthode de vérification

La méthode la plus directe est d'inspecter le payload dans la console navigateur.

**Étape 1 — Avant Phase 0 (référence)**

Si possible, noter les champs du payload V1 depuis le panel Debug avant d'appliquer T0-08.
Alternativement, utiliser les snapshots de référence comme proxy.

**Étape 2 — Après T0-08**

Dans la console navigateur (F12) :

```javascript
// Après une soumission, inspecter le payload courant
// Le payload est visible dans le Debug panel ou accessible selon l'implémentation
```

Vérifier que :
- [ ] Les champs V1 attendus sont présents (`posture`, `tradingPolicy`, `confidence_score`, etc.)
- [ ] Aucun champ `v2` n'est présent dans le payload (branchement inerte = `_v2Result` null)
- [ ] Aucun champ existant n'a changé de type ou de valeur

**Étape 3 — Vérification via le panneau Mémoire**

Soumettre une session et l'observer dans le Tab Mémoire :
- [ ] Le snapshot s'enregistre normalement
- [ ] Aucune propriété `v2` dans le snapshot sauvegardé en localStorage

```javascript
// Vérification dans la console
JSON.parse(localStorage.getItem('cameleon_history') || '[]').slice(-1)
```

- [ ] Le dernier snapshot ne contient pas de clé `v2`

### Vérification D-IMPL-02 (compatibilité anciens snapshots)

Les snapshots existants en localStorage (produits avant Phase 0) doivent continuer
à s'afficher sans erreur dans le Tab Mémoire.

- [ ] Ouvrir le Tab Mémoire
- [ ] Les snapshots pré-Phase 0 s'affichent normalement
- [ ] Aucune erreur console liée à des champs manquants

---

## Protocole de vérification — panel Debug inchangé

Le panel Debug en Phase 0 doit être identique à son état V1. Aucune section V2
ne doit apparaître — les fichiers squelettes n'émettent rien.

### Vérification du contenu Debug

Ouvrir le panel Debug (toggle sidebar) après une soumission :

**Sections attendues (V1 existantes)**
- [ ] Score brut `baseScore` visible
- [ ] Posture visible avec valeur catégorielle
- [ ] Breakdown confidence (axes)
- [ ] Allowed/Forbidden rules list
- [ ] Toute autre section présente avant Phase 0

**Sections qui ne doivent PAS apparaître**
- [ ] `tensionMap` : absent
- [ ] `HierarchyResult` ou `winner` : absent
- [ ] `AttentionState` ou `attention_level` : absent
- [ ] `ExpositionResult` : absent
- [ ] `calibrationBuffer` ou compteur snapshot : absent
- [ ] Tout bloc libellé "V2" : absent

### Vérification du comportement du toggle Debug

- [ ] Le bouton de toggle Debug ouvre et ferme le panel normalement
- [ ] Aucune erreur console lors de l'ouverture
- [ ] Le panel affiche les bonnes valeurs après chaque soumission

### Vérification de l'absence d'imports V2 actifs dans render.js

```bash
grep -n "v2\|pipeline-v2\|coherence\|hierarchy\|attention\|exposition\|calibration" src/js/render.js | grep -v "//"
```

- [ ] Résultat : **aucune ligne active** — render.js n'importe pas encore de modules V2

---

## Signaux d'arrêt immédiat

Ces situations déclenchent un arrêt immédiat et un rollback sans investigation approfondie.
Ne pas tenter de continuer si l'un de ces signaux est présent.

| Signal | Action |
|---|---|
| Une valeur de posture diffère entre snapshot pré et post-Phase 0 | Rollback T0-08 immédiat |
| Une erreur JavaScript non capturée dans la console | Rollback de la dernière tâche + investigation |
| Un élément visuel nouveau dans le cockpit (texte, bloc, icône) | Rollback T0-08 + vérification render.js |
| `payload.v2` présent dans le payload retourné (`_v2Result !== null`) | Rollback T0-08 — le branchement n'est pas inerte |
| Un flag `V2_*` est `true` dans `flags.js` | Correction immédiate — remettre à `false` |
| Un fichier de la zone de stabilité a été modifié accidentellement | `git checkout src/js/<fichier>.js` |
| Le Tab Mémoire affiche une erreur sur les anciens snapshots | Rollback T0-08 + investigation localStorage |
| `grep -n "true" src/js/v2/flags.js` retourne une ligne | Correction immédiate |

### Procédure d'arrêt

1. **Ne pas commiter l'état actuel si quelque chose est anormal.**
2. Identifier la dernière tâche effectuée.
3. Appliquer le rollback correspondant (voir § Rollback).
4. Revérifier avec les snapshots de référence.
5. Ne reprendre qu'après confirmation que l'état est propre.

---

## Commandes de rollback

### Rollback T0-08 (branchement moteur.js)

Le rollback le plus fréquent. Annule uniquement la modification de `moteur.js`.

```bash
# Option 1 — revert du commit T0-08
git revert HEAD   # si T0-08 est le dernier commit
# ou
git revert <hash-commit-T0-08>

# Option 2 — restauration directe si pas encore commité
git checkout src/js/moteur.js
```

Vérification post-rollback :
```bash
grep -n "runV2\|pipeline-v2\|_v2Result" src/js/moteur.js
```
Résultat attendu : **aucune ligne** (le branchement est retiré).

---

### Rollback T0-07 (pipeline-v2.js)

```bash
# Supprimer le fichier (pas encore commité)
rm src/js/v2/pipeline-v2.js

# Ou revert si déjà commité
git revert <hash-commit-T0-07>
```

---

### Rollback T0-06 (squelettes composants)

```bash
# Supprimer les squelettes (pas encore commités)
rm src/js/v2/coherence.js src/js/v2/hierarchy.js src/js/v2/attention.js src/js/v2/exposition.js src/js/v2/calibration.js

# Ou revert si déjà commités
git revert <hash-commit-T0-06>
```

---

### Rollback T0-05 (types.js)

```bash
rm src/js/v2/types.js
# ou git revert <hash>
```

---

### Rollback T0-04 (flags.js)

```bash
rm src/js/v2/flags.js
# ou git revert <hash>
```

---

### Rollback T0-01 (D-MAP-03)

```bash
# Revert du commit D-MAP-03
git revert <hash-commit-T0-01>
```

Vérifier après revert que les snapshots A/B/C retournent les valeurs de référence.

---

### Rollback total Phase 0

Pour annuler l'intégralité de Phase 0 et revenir à l'état V1 exact :

```bash
# Lister les commits Phase 0 depuis le point de départ
git log --oneline <hash-avant-phase0>..HEAD

# Revert dans l'ordre inverse (du plus récent au plus ancien)
git revert <hash-T0-08>
git revert <hash-T0-07>
git revert <hash-T0-06>
git revert <hash-T0-05>
git revert <hash-T0-04>
git revert <hash-T0-01>  # si applicable
```

Le répertoire `src/js/v2/` peut rester vide après le rollback total — les fichiers
supprimés par revert disparaissent, mais le répertoire peut subsister.
C'est acceptable : un répertoire vide n'affecte pas le comportement.

---

## Critères de fin Phase 0

Phase 0 est déclarée terminée quand **tous** les critères suivants sont verts.
Aucun critère n'est optionnel.

### Critères structurels

| Critère | Vérification | Statut |
|---|---|---|
| Répertoire `src/js/v2/` existe | `ls src/js/v2/` retourne 8 fichiers | ☐ |
| `flags.js` présent | grep `true` retourne zéro résultat | ☐ |
| `types.js` présent | grep logique retourne zéro résultat | ☐ |
| 5 squelettes présents | coherence, hierarchy, attention, exposition, calibration | ☐ |
| `pipeline-v2.js` présent | `runV2()` retourne null | ☐ |
| `moteur.js` branchement inerte | diff = +3 à +8 lignes uniquement | ☐ |

### Critères de non-régression

| Critère | Vérification | Statut |
|---|---|---|
| Snapshot A — posture | identique à la référence | ☐ |
| Snapshot A — confidence_score | identique à la référence | ☐ |
| Snapshot A — actions autorisées | identiques à la référence | ☐ |
| Snapshot B — posture | identique à la référence | ☐ |
| Snapshot B — confidence_score | identique à la référence | ☐ |
| Snapshot B ��� actions autorisées | identiques à la référence | ☐ |
| Snapshot C — posture | identique à la référence | ☐ |
| Snapshot C — confidence_score | identique à la référence | ☐ |
| Snapshot C — actions interdites | identiques à la référence | ☐ |

### Critères cockpit / debug

| Critère | Vérification | Statut |
|---|---|---|
| Cockpit visuellement identique | Inspection visuelle 3 tabs | ☐ |
| Debug Panel inchangé | Aucune section V2 visible | ☐ |
| `payload.v2` absent | Debug panel + console | ☐ |
| Console propre | Zéro erreur, zéro warning | ☐ |
| Anciens snapshots Mémoire OK | Tab Mémoire sans erreur | ☐ |

### Critères Git

| Critère | Vérification | Statut |
|---|---|---|
| Commits Phase 0 dans l'historique | `git log --oneline -8` | ☐ |
| Working tree clean | `git status` | ☐ |
| Aucune modification dans la zone de stabilité | `git diff engine.js decision.js trading-policy.js` | ☐ |

### Décision

- **Tous les critères verts** → Phase 0 terminée · Passer à la checklist Phase 1
- **Un critère rouge** → Investigation + rollback si nécessaire · Ne pas passer à Phase 1

---

## Statut

**Type** : Checklist opérationnelle d'exécution.
**Périmètre** : Phase 0 uniquement — infrastructure V2 inerte.
**Aucune logique V2 active à l'issue de cette checklist.**
**Aucun changement comportemental moteur.**

**Résumé Phase 0 :**
- 8 fichiers créés dans `src/js/v2/`
- 1 modification chirurgicale de `moteur.js` (branchement commenté)
- Zéro modification de la zone de stabilité (engine.js, decision.js, etc.)
- Zéro activation de flag V2
- Zéro tension calculée
- Zéro élément nouveau dans le cockpit

**Prochain document :** `checklist-implementation-phase-1.md` — activation de la
couche cohérence en shadow mode (à exécuter uniquement après Phase 0 entièrement validée).
