# Plan d'implémentation V2 — Phase 1 : Infrastructure

## Métadonnées

**Statut** : Plan d'implémentation opérationnel · Phase 1 uniquement
**Version** : 1.0 — 2026-05-24
**Dépendances** :
- `docs/architecture/strategie-implementation-v2.md` — stratégie globale
- `docs/architecture/cartographie-variables-pipeline.md` — P1–P6, D-MAP-01/03
- `docs/architecture/couche-coherence-inter-modules.md` — spec composant Phase 1
- `docs/architecture/hierarchie-des-tensions.md` — spec composant Phase 2 (préparation)

**Portée :** Phase 0 (infrastructure) + Phase 1 (couche cohérence) uniquement.
Les phases 2–5 ne sont pas couvertes ici — elles feront l'objet de plans séparés.

---

## Périmètre

### Ce que ce plan couvre

- Création du répertoire `src/js/v2/` et de ses fichiers squelettes
- Implémentation de `flags.js` (feature flags, tous à `false`)
- Implémentation des interfaces minimales (structures de données V2)
- Implémentation de `pipeline-v2.js` (orchestrateur inerte — passthrough)
- Branchement inerte dans `moteur.js` (Point 1) — aucun comportement nouveau
- Vérification de l'ordre d'import dans `src/index.html` (D-IMPL-05)
- Résolution préalable D-MAP-03 (nomenclature `confidence_score`)
- Snapshots de référence avant et après chaque modification

### Ce que ce plan ne couvre pas

- L'implémentation de `coherence.js` (logique tensionMap) — Phase 1 fonctionnelle
- L'implémentation de `hierarchy.js`, `attention.js`, `exposition.js` — Phases 2–4
- L'implémentation de `calibration.js` — Phase 6
- Toute activation d'un composant V2 (tous les flags restent `false`)
- Toute modification visible dans le cockpit ou le panel Debug

---

## Contraintes absolues

Ces contraintes s'appliquent à l'intégralité de ce plan. Toute violation invalide la phase.

| Contrainte | Vérification |
|---|---|
| Aucun changement UX | Le cockpit est visuellement et fonctionnellement identique à V1 |
| Aucun changement cockpit | Aucun nouvel élément affiché dans les 3 tabs |
| Aucun changement payload existant | Les champs V1 de `buildPayload()` sont inchangés en valeur et en type |
| Aucun changement render visible | `render.js` ne reçoit pas de données V2 en Phase 1 |
| Aucune tension visible | Le panel Debug n'affiche aucune tension V2 en Phase 1 |
| Aucune activation V2 | Tous les flags `V2_FLAGS` restent `false` après Phase 1 |
| Aucune modification des fichiers de la zone de stabilité | engine.js, decision.js, trading-policy.js, confidence-score.js, market-state.js, data.js, state.js |

**Seuls fichiers autorisés à être modifiés :**
1. `src/js/moteur.js` — ajout du branchement inerte (3 lignes max)
2. `src/index.html` — ajout des balises `<script>` pour les fichiers V2 (si requis)

**Seuls fichiers autorisés à être créés :**
- `src/js/v2/flags.js`
- `src/js/v2/types.js`
- `src/js/v2/coherence.js` (squelette vide — pas de logique)
- `src/js/v2/hierarchy.js` (squelette vide)
- `src/js/v2/attention.js` (squelette vide)
- `src/js/v2/exposition.js` (squelette vide)
- `src/js/v2/calibration.js` (squelette vide)
- `src/js/v2/pipeline-v2.js` (orchestrateur inerte)

---

## État initial à vérifier avant de commencer

Avant toute modification, vérifier l'état réel du code. Ces vérifications préviennent
des surprises lors de l'intégration.

### Vérifications obligatoires

**V-INIT-01 — Nomenclature `confidence_score` (D-MAP-03)**

Vérifier la cohérence du nom de la variable dans tous les fichiers concernés :

```bash
grep -r "confidence" src/js/ --include="*.js" -n
```

Si plusieurs noms coexistent (`confidence`, `confidenceScore`, `confidence_score`),
résoudre D-MAP-03 avant de commencer la Phase 0. La couche cohérence lit cette variable
— une incohérence de nom provoquera un bug silencieux (valeur `undefined`).

**V-INIT-02 — Ordre d'imports dans `index.html` (D-IMPL-05)**

Identifier où `moteur.js` est chargé dans `index.html`. Les fichiers V2 devront être
chargés après `moteur.js` et avant toute initialisation qui appelle `runMoteur()`.

**V-INIT-03 — Type de module ES actuel**

Vérifier si les scripts existants utilisent `type="module"` ou sont des scripts classiques.
Les fichiers V2 utilisent `export` / `import` — le mode doit être compatible.

**V-INIT-04 — Variables globales dans `engine.js`**

Audit rapide D-MAP-01 : identifier toute lecture de `window.*` ou `localStorage` non
déclarée dans `engine.js` avant d'y ajouter un branchement.

**V-INIT-05 — Snapshot de référence**

Prendre 3 snapshots de référence via le panneau Mémoire avant toute modification.
Ces snapshots seront utilisés pour le test de non-régression post-Phase 1.

---

## Tâches Phase 0 — Infrastructure

Chaque tâche est atomique. Elle est exécutée, testée, et committée individuellement
avant de passer à la suivante.

### T0-01 — Résolution D-MAP-03 (prérequis bloquant)

**Action :** auditer et unifier la nomenclature `confidence_score` dans tous les modules.

**Fichiers à lire :** `engine.js`, `confidence-score.js`, `moteur.js`, `render.js`
(sections confidence uniquement).

**Règle :** choisir un nom canonique unique. Nom recommandé : `confidence_score`
(cohérent avec le CalibrationSnapshot documenté). Remplacer les variantes dans les
modules concernés.

**Critère de passage :** `grep -r "confidence" src/js/` retourne uniquement le nom
canonique choisi dans les contextes de variable (pas dans les commentaires ou labels UI).

**Commit :** `refactor(engine): unify confidence_score nomenclature (D-MAP-03)`

---

### T0-02 — Vérification ordre imports `index.html` (D-IMPL-05)

**Action :** lire `src/index.html`, identifier l'emplacement de chargement de `moteur.js`.
Déterminer si les fichiers V2 peuvent être ajoutés sans conflits.

**Critère de passage :** emplacement identifié, type de module confirmé (ES module ou classique).

**Aucun commit requis** — c'est une vérification, pas une modification.

---

### T0-03 — Création du répertoire `src/js/v2/`

**Action :** créer le répertoire. Sous Windows, il n'existe pas encore — vérifier avant création.

**Critère de passage :** `src/js/v2/` visible dans l'explorateur de fichiers.

**Aucun commit requis** — le répertoire vide n'est pas tracké par Git.

---

### T0-04 — Création de `src/js/v2/flags.js`

**Contenu :**
```javascript
// src/js/v2/flags.js
// Feature flags V2 — tous désactivés par défaut
// Ne pas persister en localStorage
export const V2_FLAGS = {
  V2_ENABLED: false,
  V2_COHERENCE: false,
  V2_HIERARCHY: false,
  V2_ATTENTION: false,
  V2_EXPOSITION: false,
  V2_COCKPIT_MESSAGE: false,
  V2_CALIBRATION: false,
};
```

**Critère de passage :** fichier créé, aucune modification d'autres fichiers.

**Commit :** `feat(v2): add V2_FLAGS feature flags (all disabled)`

---

### T0-05 — Création de `src/js/v2/types.js`

Définit les structures de données V2 via JSDoc pour la documentation et l'outillage.
Aucune logique — uniquement des commentaires JSDoc `@typedef`.

**Structures à documenter :**
- `TensionDetail` : `{ id, type, severity, payload }`
- `TensionMap` : `{ tensions: TensionDetail[], active_exposed: number, noise_level: string }`
- `HierarchyResult` : `{ winner: TensionDetail|null, absorbed: TensionDetail[], silent: TensionDetail[], escalated: string[], deescalated: string[] }`
- `AttentionState` : `{ expositions_window: number[], last_exposed_id: string|null, consecutive_silent: number }`
- `AttentionResult` : `{ should_expose: boolean, attention_level: string, suppressed_winner: TensionDetail|null }`
- `ExpositionResult` : `{ message: string, intention: string, tension_id: string, severity: string, is_blocking: boolean }`
- `CalibrationSnapshot` : `{ timestamp, confidence_score, posture, MdS, QdR, DMU, engagement_declared, winner, attention_level, should_expose }`

**Critère de passage :** fichier créé, aucune logique JavaScript — uniquement JSDoc.

**Commit :** `feat(v2): add V2 type definitions (JSDoc)`

---

### T0-06 — Création des squelettes de composants V2

Créer 6 fichiers squelettes : `coherence.js`, `hierarchy.js`, `attention.js`,
`exposition.js`, `calibration.js`, `pipeline-v2.js`.

Chaque squelette suit le pattern :

```javascript
// src/js/v2/coherence.js
// Couche cohérence inter-modules — V2
// IMPLÉMENTATION PHASE 1 — non fonctionnel

/**
 * @param {object} payload - Payload V1 produit par buildPayload()
 * @param {Function} behaviorGetter - Getter profil comportemental
 * @returns {TensionMap|null}
 */
export function computeTensionMap(payload, behaviorGetter) {
  // TODO Phase 1 — implémentation couche cohérence
  return null;
}
```

**Critère de passage :** 6 fichiers créés, tous retournent `null` ou ne font rien.

**Commit :** `feat(v2): add V2 component skeletons (all no-ops)`

---

### T0-07 — Création de `src/js/v2/pipeline-v2.js` (orchestrateur inerte)

```javascript
// src/js/v2/pipeline-v2.js
// Orchestrateur V2 — Phase 0 : inerte
import { V2_FLAGS } from './flags.js';

/**
 * Exécute la pipeline V2 sur le payload V1.
 * Phase 0 : passthrough — retourne null si V2 désactivé.
 * @param {object} payloadV1
 * @returns {{ tensionMap, hierarchyResult, attentionResult, expositionResult }|null}
 */
export function runV2(payloadV1) {
  if (!V2_FLAGS.V2_ENABLED) return null;
  // TODO : chaîner les composants V2 au fur et à mesure des phases
  return null;
}
```

**Critère de passage :** fichier créé, `runV2()` retourne toujours `null` en Phase 0.

**Commit :** inclus dans le commit T0-06 ou séparé selon préférence.

---

### T0-08 — Branchement inerte dans `moteur.js`

**C'est la seule modification d'un fichier existant en Phase 0.**

Localiser la fonction `runMoteur()` dans `moteur.js`. Après l'appel à `buildPayload()`,
ajouter le branchement :

```javascript
// Branchement V2 — inerte en Phase 0 (V2_ENABLED = false)
// import { runV2 } from './v2/pipeline-v2.js'; // décommenter lors de l'intégration
const v2Result = null; // runV2(payload);
if (v2Result !== null) {
  payload = { ...payload, v2: v2Result };
}
```

**Note :** l'import est commenté pour ne pas charger les modules V2 tant qu'ils
ne sont pas prêts. Il sera décommenté en Phase 1 fonctionnelle.

**Critère de passage :** `runMoteur()` retourne exactement le même payload qu'avant
sur les 3 snapshots de référence.

**Commit :** `feat(v2): add inert V2 branch in moteur.js (Phase 0)`

---

## Tâches Phase 1 — Couche cohérence (shadow mode)

Phase 1 implémente la logique de `coherence.js` et active le composant en shadow mode.
Aucune exposition cockpit — les tensions sont visibles uniquement dans le Debug.

**Prérequis Phase 1 :**
- Phase 0 complète et validée (critères "safe to continue" remplis)
- D-MAP-01 audité (dépendances implicites engine.js documentées ou résolues)

---

### T1-01 — Implémentation `coherence.js`

Implémenter `computeTensionMap()` selon la spec de `couche-coherence-inter-modules.md`.

**Logique à implémenter :**
- Lecture des inputs : `confidence_score`, `posture`, `MdS`, `QdR`, `DMU`, `engagement_declared`, getter comportemental
- Détection T1 (cohérence confidence/premium) : seuils provisoires D-COH-01 (X=65, Y=2)
- Détection T2 (surcharge structurelle) : seuil ordinal — haut/très haut uniquement
- Détection T3 (delta engagement/posture) : binaire — posture ACTIVE + engagement bas
- Détection T4 (surqualification technique) : seuils provisoires D-COH-01 (X=3, Y=2)
- Production de `TensionMap` : `{ tensions[], active_exposed: 0, noise_level }`

**Critère de passage :**
- `computeTensionMap()` retourne un objet `TensionMap` valide sur inputs connus
- `TensionMap` est `null` sur un payload sans tension détectable
- Aucun crash sur inputs incomplets

**Commit :** `feat(v2/coherence): implement tensionMap detection T1-T4`

---

### T1-02 — Décommentage import et activation shadow mode

**Action :**
1. Décommenter l'import de `pipeline-v2.js` dans `moteur.js`
2. Dans `pipeline-v2.js`, brancher `computeTensionMap()` si `V2_FLAGS.V2_COHERENCE`
3. Activer `V2_FLAGS.V2_ENABLED: true` et `V2_FLAGS.V2_COHERENCE: true` dans `flags.js`
4. Vérifier que `payload.v2.tensionMap` est peuplé après soumission

**Aucune modification de `render.js`** — le debug affichant tensionMap sera ajouté
séparément dans T1-03.

**Critère de passage :** payload enrichi avec `payload.v2.tensionMap` non null sur
au moins une soumission terrain.

**Commit :** `feat(v2): enable coherence layer shadow mode (V2_COHERENCE: true)`

---

### T1-03 — Extension du panel Debug pour tensionMap

**Action :** dans `render.js`, dans la section Debug existante, ajouter l'affichage
de `payload.v2?.tensionMap` si présent.

**Contraintes :**
- Optional chaining obligatoire — si `payload.v2` est absent, pas d'erreur
- Affichage en JSON.stringify ou section dédiée — au choix du développeur
- Aucune modification des sections cockpit de render.js

**Critère de passage :** `tensionMap` visible dans le Debug après soumission avec V2 actif.
Le cockpit reste identique.

**Commit :** `feat(render): display tensionMap in debug panel (V2 shadow mode)`

---

### T1-04 — Validation terrain Phase 1

Avant de déclarer Phase 1 complète :

1. Soumettre 10 sessions distinctes avec des inputs variés
2. Vérifier que tensionMap est non null sur au moins 5 sessions
3. Vérifier que T1 est détecté au moins une fois sur une session à confidence < seuil
4. Vérifier qu'aucune T4 n'est déclenchée sur une session équilibrée (tous indicateurs neutres)
5. Repasser les 3 snapshots de référence Phase 0 — posture, confidence_score, actions inchangées

**Critère de passage Phase 1 :** 10/10 soumissions sans crash, 5+ tensionMap non null,
zéro faux positif T4 sur sessions équilibrées.

---

## Structure cible des fichiers après Phase 0

```
src/
└── js/
    ├── engine.js              ← INCHANGÉ
    ├── decision.js            ← INCHANGÉ
    ├── trading-policy.js      ← INCHANGÉ
    ├── confidence-score.js    ← INCHANGÉ (sauf D-MAP-03 si nécessaire)
    ├── market-state.js        ← INCHANGÉ
    ├── moteur.js              ← MODIFIÉ : +3 lignes branchement inerte
    ├── data.js                ← INCHANGÉ
    ├── state.js               ← INCHANGÉ
    ├── render.js              ← INCHANGÉ en Phase 0
    └── v2/                    ← NOUVEAU RÉPERTOIRE
        ├── flags.js           ← V2_FLAGS (tous false)
        ├── types.js           ← JSDoc @typedef uniquement
        ├── coherence.js       ← squelette retournant null
        ├── hierarchy.js       ← squelette retournant null
        ├── attention.js       ← squelette retournant null
        ├── exposition.js      ← squelette retournant null
        ├── calibration.js     ← squelette retournant null
        └── pipeline-v2.js     ← orchestrateur inerte (retourne null)

src/index.html                 ← MODIFIÉ si nécessaire : +balises <script> pour v2/
```

**Delta Phase 0 vs état actuel :**
- 1 répertoire créé
- 8 fichiers créés (dont 6 squelettes inertes)
- 1 fichier modifié (moteur.js, +3 lignes commentées)
- 1 fichier potentiellement modifié (index.html, imports)
- 0 comportement changé

---

## État des flags par phase

| Flag | Phase 0 | Phase 1 | Phase 2+ |
|---|---|---|---|
| `V2_ENABLED` | `false` | `true` | `true` |
| `V2_COHERENCE` | `false` | `true` | `true` |
| `V2_HIERARCHY` | `false` | `false` | Phase 2 |
| `V2_ATTENTION` | `false` | `false` | Phase 3 |
| `V2_EXPOSITION` | `false` | `false` | Phase 4 |
| `V2_COCKPIT_MESSAGE` | `false` | `false` | Phase 5 |
| `V2_CALIBRATION` | `false` | `false` | Phase 6 |

En Phase 0, tous les flags restent `false`. Aucun composant V2 ne s'exécute.

En Phase 1, `V2_ENABLED` et `V2_COHERENCE` passent à `true`. Les autres restent `false`.
L'orchestrateur `pipeline-v2.js` appelle uniquement `computeTensionMap()`.

**Règle de modification des flags :** les flags sont modifiés dans `flags.js` uniquement.
Aucun flag ne doit être modifié depuis `render.js`, `moteur.js`, ou tout autre fichier.

---

## Branchement inerte — détail d'implémentation

Le branchement dans `moteur.js` est conçu pour être chirurgical et réversible.
Il ne modifie pas la signature de `runMoteur()` et ne change pas le payload V1 retourné
tant que `V2_ENABLED` est `false`.

### Avant (état V1 actuel)

```javascript
// moteur.js — état V1 actuel (schématique)
export function runMoteur(state) {
  // ... pipeline V1 ...
  const payload = buildPayload(/* ... */);
  return payload;
}
```

### Après Phase 0 (branchement inerte)

```javascript
// moteur.js — après Phase 0
// import { runV2 } from './v2/pipeline-v2.js'; // décommenter Phase 1

export function runMoteur(state) {
  // ... pipeline V1 inchangée ...
  let payload = buildPayload(/* ... */);

  // Branchement V2 — inerte Phase 0 (import commenté, v2Result = null)
  const v2Result = null; // V2_FLAGS.V2_ENABLED ? runV2(payload) : null;
  if (v2Result !== null) {
    payload = { ...payload, v2: v2Result };
  }

  return payload;
}
```

### Après Phase 1 (branchement actif)

```javascript
// moteur.js — Phase 1 (import décommenté)
import { runV2 } from './v2/pipeline-v2.js';

export function runMoteur(state) {
  // ... pipeline V1 inchangée ...
  let payload = buildPayload(/* ... */);

  const v2Result = runV2(payload);
  if (v2Result !== null) {
    payload = { ...payload, v2: v2Result };
  }

  return payload;
}
```

### Garanties du branchement

- Si `v2Result === null`, le payload retourné est le payload V1 **exact** — aucune propriété ajoutée
- Si `v2Result !== null`, le payload retourné est `{ ...payloadV1, v2: v2Result }` — les champs V1 sont inchangés
- L'ajout du spread `{ ...payload }` ne modifie pas les valeurs — c'est une copie superficielle des champs existants

---

## Zones interdites — rappel opérationnel

Ces interactions sont interdites dans ce plan. Si une tâche semble les nécessiter,
c'est un signal d'erreur de conception — arrêter et réévaluer.

| Interaction interdite | Signal d'alerte |
|---|---|
| Lire `payload.v2.*` dans le cockpit (sections non-Debug de render.js) | On cherche à afficher une donnée V2 dans le cockpit |
| Écrire en localStorage depuis un fichier `src/js/v2/*.js` | On cherche à persister un état V2 |
| Importer un fichier V2 depuis `engine.js`, `decision.js`, etc. | On cherche à faire dépendre V1 de V2 |
| Modifier un champ existant du payload V1 depuis `pipeline-v2.js` | On cherche à corriger V1 depuis V2 (la bonne correction est dans V1) |
| Ajouter `window.*` dans un fichier V2 | On cherche à partager un état global V2 |
| Passer `AttentionState` à `coherence.js` ou `hierarchy.js` | Violation de l'ordre de dépendance des composants |
| Appeler `computeTensionMap()` depuis `render.js` | V2 ne peut être appelé que par l'orchestrateur via moteur.js |

---

## Snapshots avant/après

### Snapshots de référence — avant Phase 0 (V-INIT-05)

Prendre 3 snapshots représentatifs via le panneau Mémoire :
- 1 snapshot posture PASSIVE (confidence faible, signaux conservateurs)
- 1 snapshot posture ACTIVE (confidence élevée, signaux agressifs)
- 1 snapshot posture BALANCED (état intermédiaire)

Pour chaque snapshot, noter :
- Valeurs exactes des 16 champs de formulaire
- Posture retournée
- `confidence_score` retourné
- Liste des actions autorisées
- Liste des actions interdites

### Protocole de vérification post-Phase 0

Après T0-08 (branchement inerte) :

1. Ouvrir l'application via le serveur local
2. Ressaisir exactement les 3 ensembles de valeurs des snapshots de référence
3. Vérifier que posture, confidence_score, et listes d'actions sont **bit-à-bit identiques**
4. Vérifier que le panneau Mémoire ne contient pas de nouveaux champs inattendus
5. Vérifier que le panel Debug n'affiche rien de nouveau (V2 inerte)

### Protocole de vérification post-Phase 1

Après T1-02 (shadow mode cohérence actif) :

1. Repasser les mêmes 3 snapshots de référence
2. Vérifier que posture, confidence_score, actions sont inchangés
3. Vérifier que `payload.v2.tensionMap` est visible dans le Debug pour au moins 1 snapshot
4. Vérifier que le cockpit ne montre aucune différence

---

## Tests de non-régression

### Matrice de régression Phase 0

| Test | Inputs | Expected | Pass if |
|---|---|---|---|
| R-01 | Snapshot PASSIVE | Posture PASSIVE | Posture identique |
| R-02 | Snapshot PASSIVE | confidence_score X | Score identique (±0) |
| R-03 | Snapshot ACTIVE | Posture ACTIVE | Posture identique |
| R-04 | Snapshot ACTIVE | Actions autorisées = liste Y | Liste identique |
| R-05 | Snapshot BALANCED | Actions interdites = liste Z | Liste identique |
| R-06 | Tout input | Panel Debug inchangé | Aucun nouveau bloc Debug |
| R-07 | Tout input | Cockpit inchangé | Zéro nouveau élément visuel |
| R-08 | Tout input | Console JS | Zéro erreur, zéro warning |

### Matrice de régression Phase 1 (shadow mode actif)

| Test | Inputs | Expected | Pass if |
|---|---|---|---|
| R-09 | Snapshot PASSIVE | Posture, score, actions inchangés | Identique à R-01/02 |
| R-10 | Snapshot ACTIVE | Posture, score, actions inchangés | Identique à R-03/04 |
| R-11 | Snapshot BALANCED | payload.v2.tensionMap | TensionMap non null OU null selon inputs |
| R-12 | Inputs T1 (confidence < 65, MdS > 2) | tensionMap contient T1 | T1 dans tensions[] |
| R-13 | Inputs équilibrés (tous neutres) | tensionMap = null OU tensions[] vide | Pas de T4 déclenché |
| R-14 | Tout input | Cockpit inchangé | Zéro nouveau élément visuel |
| R-15 | Tout input | Console JS | Zéro erreur, zéro warning |

---

## Règles de commit

Chaque tâche est committée individuellement après validation. Les commits sont atomiques :
un commit = une tâche = un critère de passage vérifié.

### Messages de commit recommandés

| Tâche | Message |
|---|---|
| T0-01 | `refactor(engine): unify confidence_score nomenclature (D-MAP-03)` |
| T0-04 | `feat(v2): add V2_FLAGS feature flags (all disabled)` |
| T0-05 | `feat(v2): add V2 type definitions (JSDoc)` |
| T0-06 + T0-07 | `feat(v2): add V2 component skeletons (all no-ops)` |
| T0-08 | `feat(v2): add inert V2 branch in moteur.js (Phase 0)` |
| T1-01 | `feat(v2/coherence): implement tensionMap detection T1-T4` |
| T1-02 | `feat(v2): enable coherence layer shadow mode (V2_COHERENCE: true)` |
| T1-03 | `feat(render): display tensionMap in debug panel (V2 shadow mode)` |

### Règles générales

- Pas de Co-Authored-By, pas de mention IA (règle permanente)
- Messages courts et sobres
- Un seul fichier principal par commit de préférence
- Ne pas grouper T0-08 avec d'autres tâches — le branchement moteur.js est à part

---

## Procédures de rollback

### Rollback Phase 0 complet

Si une anomalie est détectée après T0-08 :

```bash
# Option 1 — annuler uniquement T0-08
git revert <hash-commit-T0-08>

# Option 2 — rollback total Phase 0
git revert <hash-T0-08> <hash-T0-07> ...
# (dans l'ordre inverse des commits)
```

Le rollback Phase 0 remet le code à son état V1 exact. Les fichiers `src/js/v2/`
créés peuvent rester — ils sont inertes sans l'import dans `moteur.js`.

### Rollback Phase 1 — par flag

Si une anomalie est détectée après T1-02 (shadow mode actif) :

```javascript
// flags.js — rollback Phase 1
V2_ENABLED: false,    // ← remettre à false
V2_COHERENCE: false,  // ← remettre à false
```

Le rollback par flag est instantané au rechargement. Aucun commit requis pour un
rollback temporaire d'investigation.

### Rollback Phase 1 — par revert git

Si le problème vient du code de `coherence.js` lui-même :

```bash
git revert <hash-T1-01>
```

Les flags sont remis à `false` dans le même commit de revert.

### Signal d'alerte — rollback obligatoire

Les situations suivantes déclenchent un rollback immédiat sans investigation préalable :

- Une valeur de posture différente entre V1 et post-Phase 0/1 sur le même input
- Une erreur JavaScript non capturée dans la console
- Un élément visuel nouveau dans le cockpit
- Un message d'erreur dans le panel Debug de source inconnue

---

## Protocole de validation Phase 1

La validation Phase 1 est une procédure séquentielle. Chaque étape doit passer
avant de passer à la suivante. En cas d'échec, arrêter et investiguer.

### Étape V-1 : validation silencieuse Phase 0

**Avant** d'activer quoi que ce soit :
- [ ] D-MAP-03 résolu (nomenclature confidence_score unifiée)
- [ ] D-IMPL-05 vérifié (ordre imports index.html)
- [ ] Snapshots de référence pris (3 min)
- [ ] Tous les fichiers `src/js/v2/*.js` créés
- [ ] `moteur.js` modifié avec branchement inerte (import commenté)
- [ ] Application rechargée sans erreur console
- [ ] Tests R-01 à R-08 passés

**Critère :** 8/8 tests verts → Phase 0 validée, passer à Phase 1.

### Étape V-2 : validation shadow mode Phase 1

**Après** activation `V2_COHERENCE: true` :
- [ ] Application rechargée sans erreur console
- [ ] Tests R-09 à R-10 (régression) passés
- [ ] `payload.v2.tensionMap` visible dans Debug sur au moins 1 soumission
- [ ] Tests R-11 à R-13 (comportement cohérence) passés
- [ ] Tests R-14 à R-15 (cockpit inchangé, pas d'erreur) passés
- [ ] 10 sessions terrain réalisées, résultats notés
- [ ] T1 détecté au moins 1 fois sur inputs à confidence < seuil
- [ ] Zéro crash sur inputs incomplets ou extrêmes

**Critère :** tous les points cochés → Phase 1 validée, prochaine étape = Phase 2.

---

## Critères "safe to continue"

Ces critères définissent l'état requis pour déclarer une phase sûre et passer à la suivante.
Ils ne sont pas négociables.

### Safe to continue — Phase 0 → Phase 1

| Critère | Vérification |
|---|---|
| Zéro régression payload | R-01 à R-08 verts |
| Zéro erreur console | Console navigateur propre |
| Branchement inerte confirmé | `payload.v2` absent du payload retourné (V2_ENABLED false) |
| Fichiers V2 créés | 8 fichiers présents dans `src/js/v2/` |
| D-MAP-03 résolu | Nomenclature unifiée dans tous les modules |

### Safe to continue — Phase 1 → Phase 2

| Critère | Vérification |
|---|---|
| Zéro régression payload | R-09 à R-10 verts |
| Zéro erreur console | Console propre avec V2_COHERENCE actif |
| TensionMap produit | R-11 vert sur au moins 1 snapshot |
| Comportement T1 correct | T1 détecté sur inputs sous seuil, absent sur inputs neutres |
| Pas de faux positif T4 | R-13 vert (sessions équilibrées sans T4) |
| Cockpit inchangé | R-14 vert |
| 10 sessions terrain | Volume minimal atteint |

### Critères d'arrêt — ne pas continuer

Ces situations bloquent le passage à la phase suivante sans résolution :

- Une valeur V1 (posture, score, actions) diffère entre snapshots avant/après
- Une erreur JavaScript non capturée en console
- Un composant V2 crashe sur des inputs valides
- Une tension V2 est visible dans le cockpit (violation de contrat)
- Les tests terrain montrent des faux positifs systématiques (>30% des sessions)

---

## Dettes identifiées

| Référence | Nature | Impact sur ce plan |
|---|---|---|
| D-MAP-01 | Audit dépendances implicites `engine.js` | À documenter avant T1-01 — la couche cohérence lit des variables engine.js |
| D-MAP-03 | Nomenclature confidence — bloquant Phase 1 | À résoudre en T0-01 |
| D-IMPL-03 | Idem D-MAP-03 | Même tâche |
| D-IMPL-05 | Ordre imports `index.html` | À vérifier en V-INIT-02 |
| D-IMPL-02 | Snapshots localStorage V1 — compatibilité avec payload enrichi | À vérifier après T1-02 : les anciens snapshots Mémoire doivent s'afficher sans erreur |
| D-COH-01 | Seuils T1/T4 provisoires (X=65/Y=2 et X=3/Y=2) | Les seuils provisoires sont utilisés en Phase 1 — calibration post-V0 |

---

## Statut

**Type** : Plan d'implémentation opérationnel.
**Périmètre** : Phase 0 (infrastructure) + Phase 1 (couche cohérence shadow mode).
**Aucune implémentation immédiate** — ce document est le plan, pas l'exécution.
**Aucune modification moteur ni cockpit** dans ce plan.

**Résumé des décisions :**
- Phase 0 crée 8 fichiers inertes + 1 modification chirurgicale `moteur.js`
- Phase 1 implémente la logique tensionMap et l'active en shadow mode Debug uniquement
- L'orchestrateur `pipeline-v2.js` gère la chaîne — `moteur.js` l'appelle uniquement
- Shadow mode = actif mais invisible cockpit (V2_COCKPIT_MESSAGE reste false)
- Critères "safe to continue" bloquants — aucun shortcut

**Prochain plan :** `plan-implementation-v2-phase-2.md` — hiérarchie des tensions et gestion de l'attention (après Phase 1 validée terrain).
