# Checklist d'implémentation — Phase 1 : Shadow mode cohérence

## Métadonnées

**Statut** : Checklist opérationnelle · Phase 1 uniquement
**Version** : 1.0 — 2026-05-24
**Prérequis** : Phase 0 entièrement validée (tous critères de fin Phase 0 verts)
**Dépendances** :
- `docs/architecture/checklist-implementation-phase-0.md` — Phase 0 référence
- `docs/architecture/plan-implementation-v2-phase-1.md` — plan de référence
- `docs/architecture/couche-coherence-inter-modules.md` — spec T1–T4
- `docs/architecture/calibration-terrain.md` — seuils D-COH-01 provisoires

**Usage :** Ce document s'exécute ligne par ligne lors de l'implémentation réelle.
Ne pas démarrer Phase 1 sans Phase 0 validée. Cocher chaque item après vérification physique.

---

## Objectif de Phase 1

Activer la couche de cohérence inter-modules (`coherence.js`) en **shadow mode** :
les tensions T1–T4 sont calculées à chaque soumission, leurs résultats sont visibles
dans le panel Debug, et **aucune tension n'est exposée dans le cockpit**.

À l'issue de Phase 1 :
- `V2_ENABLED: true` et `V2_COHERENCE: true` dans `flags.js`
- `computeTensionMap()` produit un `TensionMap` réel à chaque soumission
- `payload.v2.tensionMap` est visible dans le panel Debug
- Le cockpit est **strictement identique** à l'état Phase 0
- Aucune autre composante V2 n'est active (hiérarchie, attention, explicabilité = OFF)
- Aucun impact sur les décisions du moteur V1

**Ce document ne couvre pas :**
- L'activation de `hierarchy.js` (Phase 2)
- L'activation de `attention.js` ou `exposition.js` (Phases 3–4)
- L'affichage de tensions dans le cockpit (Phase 5)
- L'instrumentation calibration (Phase 6)

---

## Prérequis — vérifications avant Phase 1

**Ne pas démarrer Phase 1 si l'un de ces items est rouge.**

### Prérequis Phase 0

- [ ] `git log --oneline -8` : les commits T0-01→T0-08 sont présents
- [ ] `ls src/js/v2/` : 8 fichiers présents
- [ ] `grep -n "true" src/js/v2/flags.js` : zéro résultat
- [ ] Application rechargée sans erreur console en état Phase 0
- [ ] Snapshots A/B/C Phase 0 documentés (valeurs de référence disponibles)

### Prérequis git

```bash
git status
```
- [ ] Working tree clean (aucun fichier non commité)
- [ ] Hash du dernier commit noté : `________________` (référence rollback Phase 1)

### Prérequis connaissance

Avant d'implémenter `coherence.js`, lire :
- [ ] `docs/architecture/couche-coherence-inter-modules.md` (spec complète T1–T4)
- [ ] Section "Seuils provisoires D-COH-01" dans `docs/architecture/calibration-terrain.md`

Seuils provisoires à utiliser en Phase 1 :
- **T1** : `confidence_score < X` (X=65) ET (`MdS > Y` OU `DMU > Y`) (Y=2)
- **T2** : surcharge structurelle — niveau "haut" ou "très haut" (ordinal)
- **T3** : posture ACTIVE ET engagement_declared = "faible" ou équivalent
- **T4** : (`MdS > X` ET `QdR > X`) ET `confidence_score > Y` (X=3, Y=2 provisoire)

Ces seuils sont provisoires — ils seront calibrés via le test V0.

---

## Snapshots de référence Phase 1

Les snapshots A/B/C de Phase 0 sont réutilisés comme référence de non-régression.
Compléter avec 2 snapshots supplémentaires ciblant les tensions T1 et T3.

### Snapshot D — T1 attendu (confidence faible + premium élevé)

Inputs cibles :
- `confidence_score` : inférieur au seuil X=65 (choisir des inputs qui produisent ce score)
- `MdS` : supérieur à 2 (ou `DMU` supérieur à 2)
- Autres champs : neutres

| Champ | Valeur utilisée |
|---|---|
| (à remplir lors de l'exécution) | |

Résultat V1 attendu (inchangé) :
- Posture : `________________`
- confidence_score : `________________`

Résultat V2 attendu (debug) :
- `tensionMap.tensions` doit contenir T1

### Snapshot E — T3 attendu (posture ACTIVE + engagement faible)

Inputs cibles :
- Posture résultante : ACTIVE (inputs score élevé)
- `engagement_declared` : "faible" ou valeur équivalente

| Champ | Valeur utilisée |
|---|---|
| (à remplir lors de l'exécution) | |

Résultat V2 attendu (debug) :
- `tensionMap.tensions` doit contenir T3

### Snapshot F — aucune tension (inputs équilibrés)

Inputs cibles : tous les indicateurs dans leurs plages neutres. Ni confidence faible,
ni premium élevé, ni posture/engagement incohérents.

Résultat V2 attendu (debug) :
- `tensionMap.tensions` vide ou `tensionMap` null
- **Aucune T4 ne doit se déclencher** (validation faux positifs)

### Checklist snapshots Phase 1

- [ ] Snapshots A/B/C Phase 0 disponibles (valeurs de référence)
- [ ] Snapshot D construit (T1 attendu)
- [ ] Snapshot E construit (T3 attendu)
- [ ] Snapshot F construit (équilibré — zéro tension)

---

## Ordre d'exécution — Phase 1

```
T1-01 → T1-02 → T1-03 → T1-04
  ↓        ↓        ↓        ↓
implém.  activer  Debug    validat.
coher.   flags    display  terrain
(commit) (commit) (commit) (pas de
                            commit)
```

**T1-01** : implémenter la logique réelle de `coherence.js` — fonction `computeTensionMap()`
**T1-02** : décommenter l'import dans `moteur.js` + activer `V2_ENABLED/V2_COHERENCE: true`
**T1-03** : étendre le panel Debug pour afficher `tensionMap` (render.js, section Debug uniquement)
**T1-04** : validation terrain — 10 sessions, vérifications faux positifs et non-régression

**Rappel des contraintes d'ordre :**
- T1-02 ne peut démarrer qu'après T1-01 testé unitairement (cohérence.js fonctionnel)
- T1-03 ne peut démarrer qu'après T1-02 (le Debug doit afficher des données réelles)
- T1-04 ne peut démarrer qu'après T1-03 (les données debug doivent être lisibles)

---

## T1-01 — Implémentation de `coherence.js`

**Fichier à modifier :** `src/js/v2/coherence.js` (squelette Phase 0 → logique réelle).
**Lire avant de coder :** `docs/architecture/couche-coherence-inter-modules.md` intégralement.

### Logique à implémenter

```javascript
// src/js/v2/coherence.js — Phase 1

import { V2_FLAGS } from './flags.js';

/**
 * @param {object} payload - Payload V1 produit par buildPayload()
 * @param {Function|null} behaviorGetter - Getter profil comportemental (peut être null)
 * @returns {import('./types.js').TensionMap|null}
 */
export function computeTensionMap(payload, behaviorGetter) {
  if (!V2_FLAGS.V2_COHERENCE) return null;

  const tensions = [];

  // T1 — Cohérence confidence / premium
  // Condition : confidence_score < X ET (MdS > Y OU DMU > Y)
  // Seuils provisoires D-COH-01 : X=65, Y=2
  const cs = payload.confidence_score ?? payload.confidenceScore ?? null;
  const MdS = payload.MdS ?? null;
  const DMU = payload.DMU ?? null;
  if (cs !== null && cs < 65 && (MdS > 2 || DMU > 2)) {
    tensions.push({
      id: 'T1',
      type: 'coherence_confidence_premium',
      severity: cs < 40 ? 'high' : 'medium',
      payload: { confidence_score: cs, MdS, DMU },
    });
  }

  // T2 — Surcharge structurelle
  // Condition : niveau ordinal "haut" ou "très haut"
  // Adapter selon le nom exact du champ dans le payload V1 (à vérifier)
  const structureLevel = payload.structureLevel ?? payload.structure_level ?? null;
  if (structureLevel === 'haut' || structureLevel === 'tres_haut' || structureLevel === 'high' || structureLevel === 'very_high') {
    tensions.push({
      id: 'T2',
      type: 'surcharge_structurelle',
      severity: structureLevel === 'tres_haut' || structureLevel === 'very_high' ? 'high' : 'medium',
      payload: { structureLevel },
    });
  }

  // T3 — Delta engagement / posture
  // Condition binaire : posture ACTIVE ET engagement_declared "faible"
  const posture = payload.posture ?? null;
  const engagement = payload.engagement_declared ?? payload.engagementDeclared ?? null;
  if (posture === 'ACTIVE' && (engagement === 'faible' || engagement === 'low' || engagement === 'bas')) {
    tensions.push({
      id: 'T3',
      type: 'delta_engagement_posture',
      severity: 'high',
      payload: { posture, engagement },
    });
  }

  // T4 — Surqualification technique
  // Condition : MdS > X ET QdR > X ET confidence_score > Y
  // Seuils provisoires D-COH-01 : X=3, Y=2 (très laxiste — à calibrer)
  const QdR = payload.QdR ?? null;
  if (MdS !== null && QdR !== null && cs !== null && MdS > 3 && QdR > 3 && cs > 2) {
    tensions.push({
      id: 'T4',
      type: 'surqualification_technique',
      severity: 'low',
      payload: { MdS, QdR, confidence_score: cs },
    });
  }

  if (tensions.length === 0) return null;

  return {
    tensions,
    active_exposed: 0,
    noise_level: tensions.length >= 3 ? 'high' : tensions.length === 2 ? 'medium' : 'low',
  };
}
```

### Points d'attention

**Nomenclature des champs payload V1 :** les noms exacts des champs (`confidence_score`,
`structureLevel`, `engagement_declared`) doivent être vérifiés contre le payload réel
produit par `buildPayload()` dans `engine.js`. Adapter les accès si les noms diffèrent.

**T4 — seuil très laxiste intentionnel :** les seuils D-COH-01 T4 sont provisoires
et très bas (X=3, Y=2). T4 pourrait se déclencher fréquemment. L'objectif en Phase 1
est de détecter si T4 déclenche des faux positifs massifs, pas de la calibrer précisément.

### Vérification unitaire (sans activation flags)

Avant T1-02, tester `computeTensionMap()` directement dans la console navigateur :

```javascript
// Test T1 — doit retourner TensionMap avec T1
computeTensionMap({ confidence_score: 45, MdS: 3, DMU: 1, posture: 'BALANCED', engagement_declared: 'moyen' }, null)

// Test T3 — doit retourner TensionMap avec T3
computeTensionMap({ confidence_score: 80, posture: 'ACTIVE', engagement_declared: 'faible', MdS: 1, QdR: 1, DMU: 1 }, null)

// Test équilibré — doit retourner null
computeTensionMap({ confidence_score: 72, posture: 'BALANCED', engagement_declared: 'moyen', MdS: 1, QdR: 1, DMU: 1 }, null)
```

### Commit

```bash
git add src/js/v2/coherence.js
git commit -m "feat(v2/coherence): implement tensionMap detection T1-T4"
```

### Checklist T1-01

- [ ] `coherence.js` modifié : logique T1–T4 implémentée
- [ ] Noms de champs payload vérifiés contre `buildPayload()` réel
- [ ] Test T1 console : TensionMap avec T1 retourné sur inputs sous-seuil
- [ ] Test T3 console : TensionMap avec T3 retourné sur ACTIVE + engagement faible
- [ ] Test équilibré console : `null` retourné sur inputs neutres
- [ ] `V2_FLAGS.V2_COHERENCE` est encore `false` (pas encore activé)
- [ ] Aucun autre fichier modifié
- [ ] Commit effectué

---

## T1-02 — Activation flags + décommentage import

**Deux modifications dans deux fichiers distincts.**

### Modification 1 — `src/js/v2/flags.js`

Passer `V2_ENABLED` et `V2_COHERENCE` à `true` :

```javascript
export const V2_FLAGS = {
  V2_ENABLED: true,      // ← true (était false)
  V2_COHERENCE: true,    // ← true (était false)
  V2_HIERARCHY: false,
  V2_ATTENTION: false,
  V2_EXPOSITION: false,
  V2_COCKPIT_MESSAGE: false,
  V2_CALIBRATION: false,
};
```

### Modification 2 — `src/js/moteur.js`

Décommenter l'import de `pipeline-v2.js` et l'appel `runV2()` dans le branchement.

**Avant (Phase 0 — inerte) :**
```javascript
// import { runV2 } from './v2/pipeline-v2.js';
const _v2Result = null; // runV2(payload);
```

**Après (Phase 1 — actif) :**
```javascript
import { runV2 } from './v2/pipeline-v2.js';
const _v2Result = runV2(payload);
```

### Modification 3 — `src/js/v2/pipeline-v2.js`

Décommenter le bloc Phase 1 dans `runV2()` et retirer le `return null` de Phase 0 :

```javascript
import { V2_FLAGS } from './flags.js';
import { computeTensionMap } from './coherence.js'; // ← décommenter

export function runV2(payloadV1, behaviorGetter = null) {
  if (!V2_FLAGS.V2_ENABLED) return null;

  // Phase 1 — Couche cohérence
  if (!V2_FLAGS.V2_COHERENCE) return null;
  const tensionMap = computeTensionMap(payloadV1, behaviorGetter);

  // Phases 2–4 : non encore actives
  return { tensionMap, hierarchyResult: null, attentionResult: null, expositionResult: null };
}
```

### Vérification immédiate après activation

Recharger l'application et soumettre le Snapshot D (T1 attendu) :

```bash
git diff src/js/moteur.js src/js/v2/flags.js src/js/v2/pipeline-v2.js
```

- [ ] diff confirme uniquement les modifications attendues (3 fichiers, lignes ciblées)

Dans la console navigateur (ou Debug panel) :
- [ ] `payload.v2` est présent dans la réponse
- [ ] `payload.v2.tensionMap` est non null sur Snapshot D
- [ ] `payload.v2.tensionMap.tensions` contient T1 sur Snapshot D
- [ ] Console : zéro erreur JavaScript
- [ ] Cockpit : **aucun changement visible**

### Commit

```bash
git add src/js/v2/flags.js src/js/moteur.js src/js/v2/pipeline-v2.js
git commit -m "feat(v2): enable coherence layer shadow mode (V2_COHERENCE: true)"
```

### Checklist T1-02

- [ ] `flags.js` : `V2_ENABLED: true`, `V2_COHERENCE: true`, 5 autres flags `false`
- [ ] `moteur.js` : import décommenté, `runV2(payload)` appelé
- [ ] `pipeline-v2.js` : bloc Phase 1 actif, `return null` Phase 0 retiré
- [ ] `payload.v2.tensionMap` non null sur Snapshot D (console/Debug)
- [ ] Console : zéro erreur
- [ ] Cockpit visuellement inchangé
- [ ] Commit effectué

---

## T1-03 — Extension Debug panel pour `tensionMap`

**Fichier à modifier :** `src/js/render.js` — section Debug uniquement.
**Lire avant de modifier :** la section Debug de `render.js` pour identifier où insérer
le nouveau bloc d'affichage.

### Règles d'insertion dans `render.js`

1. Insérer dans la **section Debug existante** uniquement — jamais dans les sections cockpit
2. Utiliser **optional chaining** : `payload.v2?.tensionMap`
3. Le bloc Debug V2 est conditionnel : n'afficher que si `payload.v2?.tensionMap` est non null
4. **Aucune logique de calcul** dans render.js — afficher uniquement ce que V2 a produit

### Pattern d'insertion recommandé

Localiser dans `render.js` le bloc Debug existant (celui qui affiche `baseScore`,
`posture`, `confidence breakdown`). Ajouter à la fin de ce bloc :

```javascript
// Debug V2 — shadow mode Phase 1
if (payload.v2?.tensionMap) {
  const tm = payload.v2.tensionMap;
  // Ajouter un bloc HTML dans le panel Debug
  // Exemple (adapter au style existant du Debug panel) :
  debugHtml += `
    <div class="debug-section debug-v2">
      <h4>V2 — tensionMap (shadow)</h4>
      <div>Tensions détectées : ${tm.tensions.length}</div>
      ${tm.tensions.map(t => `<div>${t.id} [${t.severity}] — ${t.type}</div>`).join('')}
      <div>noise_level : ${tm.noise_level}</div>
    </div>
  `;
}
```

**Note :** adapter `debugHtml +=` au pattern réel de construction du Debug panel dans
`render.js`. Le pattern exact dépend de l'implémentation existante (innerHTML, template,
ou autre). Ne pas casser le rendu Debug V1 existant.

### Vérification

Après modification :

**Dans le navigateur :**
- [ ] Debug panel ouvert : bloc "V2 — tensionMap" visible après une soumission Snapshot D
- [ ] Tensions T1 listées dans le bloc V2 sur Snapshot D
- [ ] Bloc V2 **absent** après Snapshot F (équilibré — tensionMap null)
- [ ] Les sections Debug V1 existantes (baseScore, posture, confidence) sont **intactes**

**Dans le cockpit :**
- [ ] Aucun nouveau élément visible dans les 3 tabs
- [ ] Le message de posture est inchangé
- [ ] Les actions autorisées/interdites sont inchangées

**Dans la console :**
- [ ] Zéro erreur JavaScript
- [ ] Zéro warning

```bash
# Vérification : render.js ne lit pas de données V2 hors de la section Debug
grep -n "payload.v2\|tensionMap\|v2\." src/js/render.js | grep -v "debug\|Debug\|//"
```
- [ ] Résultat : zéro ligne hors section Debug (toutes les références V2 sont dans le bloc debug)

### Commit

```bash
git add src/js/render.js
git commit -m "feat(render): display tensionMap in debug panel (V2 shadow mode)"
```

### Checklist T1-03

- [ ] `render.js` modifié : bloc V2 debug inséré dans section Debug uniquement
- [ ] Optional chaining utilisé (`payload.v2?.tensionMap`)
- [ ] Bloc V2 visible dans Debug sur Snapshot D (T1 présent)
- [ ] Bloc V2 absent dans Debug sur Snapshot F (tensionMap null)
- [ ] Sections Debug V1 intactes
- [ ] Cockpit inchangé (3 tabs)
- [ ] grep render.js V2 hors Debug : zéro ligne active
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T1-04 — Validation terrain

**Pas de commit.** Cette tâche est une phase d'observation, pas de modification.

### Objectif

Accumuler 10 sessions de soumission réelles avec le shadow mode cohérence actif.
Observer les tensions détectées, noter les anomalies, documenter les résultats.

### Protocole de session

Pour chaque session (1 à 10) :
1. Remplir le formulaire avec des inputs représentatifs d'une situation réelle de trading
2. Soumettre
3. Ouvrir le Debug panel
4. Noter ce qui est affiché dans le bloc V2 tensionMap

### Grille d'observation

| Session | Posture V1 | confidence_score V1 | Tensions détectées V2 | Anomalie ? |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |

### Critères d'observation

- [ ] Au moins 5 sessions sur 10 produisent un `tensionMap` non null
- [ ] T1 détecté au moins 1 fois sur des inputs à confidence < 65 avec premium élevé
- [ ] T3 détecté au moins 1 fois sur inputs ACTIVE + engagement faible
- [ ] Aucun crash sur aucune session
- [ ] Console : zéro erreur sur toutes les sessions

---

## Validation fréquence des tensions

Cette validation porte sur la **fréquence de déclenchement** de chaque type de tension
sur les 10 sessions terrain. Des taux anormaux signalent un problème de seuil ou de logique.

### Taux attendus (estimations provisoires)

| Type | Taux attendu | Taux préoccupant |
|---|---|---|
| T1 | 20–50% des sessions | > 70% ou < 5% |
| T2 | 10–30% des sessions | > 60% (surcharge partout = seuil trop bas) |
| T3 | 10–30% des sessions | > 60% (engagement faible omniprésent = mapping incorrect) |
| T4 | 5–20% des sessions | > 40% (seuil D-COH-01 T4 trop laxiste — attendu en Phase 1) |

**Note sur T4 :** les seuils provisoires T4 (X=3, Y=2) sont volontairement laxistes.
Un taux élevé de T4 en Phase 1 est attendu et documenté — il signale que la calibration
post-V0 sera nécessaire, pas un bug.

### Vérification de la détection

**Vérification T1 :**
```javascript
// Dans la console — après soumission avec confidence < 65 et MdS > 2
payload.v2.tensionMap?.tensions.find(t => t.id === 'T1')
// Attendu : objet TensionDetail T1
```

**Vérification T3 :**
```javascript
// Dans la console — après soumission avec posture ACTIVE et engagement faible
payload.v2.tensionMap?.tensions.find(t => t.id === 'T3')
// Attendu : objet TensionDetail T3
```

**Vérification absence (inputs équilibrés) :**
```javascript
// Dans la console — après Snapshot F
payload.v2.tensionMap
// Attendu : null
```

### Checklist validation fréquence

- [ ] T1 détecté au moins 1 fois sur 10 sessions
- [ ] T3 détecté au moins 1 fois sur 10 sessions
- [ ] Taux T1 dans la plage attendue (ou anomalie documentée)
- [ ] Taux T4 noté (peut être élevé — attendu avec seuils provisoires)
- [ ] Zéro crash sur toutes les sessions

---

## Validation faux positifs

Un faux positif est une tension détectée alors que les conditions de déclenchement
ne sont pas réunies. En Phase 1, les faux positifs sont le signal d'erreur le plus
probable — ils indiquent soit un bug dans `coherence.js`, soit un mauvais mapping
des champs du payload.

### Définition des faux positifs par type

| Type | Faux positif = |
|---|---|
| T1 | Tension T1 présente alors que `confidence_score ≥ 65` ET (`MdS ≤ 2` ET `DMU ≤ 2`) |
| T2 | Tension T2 présente alors que le niveau structurel n'est pas "haut" ou "très haut" |
| T3 | Tension T3 présente alors que posture ≠ ACTIVE ou engagement_declared ≠ "faible" |
| T4 | Tension T4 présente sur une session équilibrée (tous indicateurs neutres) |

### Protocole de vérification faux positifs

**Étape 1 — Snapshot F (équilibré)**

Soumettre le Snapshot F 3 fois consécutives :
- [ ] `tensionMap` est `null` ou `tensions` est vide sur les 3 soumissions

**Étape 2 — Vérification T1 sur confidence élevée**

Soumettre un formulaire avec `confidence_score > 70` (inputs qui produisent un score élevé)
et `MdS = 1`, `DMU = 1` :
- [ ] T1 est absent du tensionMap

**Étape 3 — Vérification T3 sur posture PASSIVE**

Soumettre un formulaire produisant posture PASSIVE avec engagement_declared = "faible" :
- [ ] T3 est absent (T3 nécessite posture ACTIVE, pas PASSIVE)

**Étape 4 — Bilan**

| Vérification | Résultat | Faux positif ? |
|---|---|---|
| Snapshot F × 3 | | |
| T1 sur confidence > 70 | | |
| T3 sur posture PASSIVE | | |

### Seuil d'alerte faux positifs

Si plus de **30% des sessions** produisent une tension sur des inputs qui ne devraient
pas en déclencher → signal d'alerte → investigation `coherence.js` avant de continuer.

### Cas particulier T4

T4 avec seuils X=3, Y=2 est extrêmement laxiste. Si T4 se déclenche sur des sessions
équilibrées, ce n'est pas nécessairement un faux positif logique — c'est un signal
que les seuils provisoires sont trop bas. **Documenter sans bloquer.**

### Checklist faux positifs

- [ ] Snapshot F × 3 : tensionMap null sur chaque soumission
- [ ] T1 absent sur confidence > 70 + MdS=1 + DMU=1
- [ ] T3 absent sur posture PASSIVE + engagement faible
- [ ] Taux faux positifs < 30% sur 10 sessions
- [ ] T4 éventuels documentés (pas bloquant en Phase 1)

---

## Validation non-régression moteur V1

Cette validation vérifie que les outputs V1 du moteur sont strictement inchangés
après activation du shadow mode cohérence.

### Matrice de régression Phase 1 — moteur

Repasser les snapshots A/B/C de référence Phase 0 avec `V2_COHERENCE: true` actif :

| Snapshot | Champ | Valeur Phase 0 | Valeur Phase 1 | Identique ? |
|---|---|---|---|---|
| A (PASSIVE) | posture | | | ☐ |
| A (PASSIVE) | confidence_score | | | ☐ |
| A (PASSIVE) | actions autorisées | | | ☐ |
| A (PASSIVE) | actions interdites | | | ☐ |
| B (ACTIVE) | posture | | | ☐ |
| B (ACTIVE) | confidence_score | | | ☐ |
| B (ACTIVE) | actions autorisées | | | ☐ |
| C (BALANCED) | posture | | | ☐ |
| C (BALANCED) | confidence_score | | | ☐ |
| C (BALANCED) | actions interdites | | | ☐ |

**Règle :** si **une seule valeur diffère** → arrêt immédiat, investigation, rollback T1-02 si nécessaire.

### Vérification de l'isolation V2 → V1

```javascript
// Console — vérifier que V2 n'a pas modifié les champs V1 du payload
const p = /* dernier payload soumis */;
// Les champs suivants doivent avoir les valeurs V1 habituelles :
p.posture       // 'PASSIVE' | 'BALANCED' | 'ACTIVE'
p.tradingPolicy // objet avec allowed/forbidden
p.confidence_score // nombre 0–100
// Le champ V2 est additionnel uniquement :
p.v2?.tensionMap  // peut être non null — normal
```

- [ ] `p.posture` inchangé
- [ ] `p.tradingPolicy` inchangé
- [ ] `p.confidence_score` inchangé (V2 ne recalcule pas le score)
- [ ] `p.v2` présent mais ne modifie aucun champ V1

### Vérification du branchement spread

Confirmer que le spread `{ ...payload, v2: v2Result }` dans `moteur.js` ne remplace
pas de champs V1 existants.

```javascript
// Si v2Result contient un champ portant le même nom qu'un champ V1, il l'écraserait.
// Vérifier que les champs de v2Result sont uniquement : tensionMap, hierarchyResult,
// attentionResult, expositionResult — aucun conflit avec les champs V1.
```

- [ ] Aucun champ V1 n'est écrasé par le spread V2

### Checklist non-régression moteur

- [ ] Snapshot A : posture, confidence_score, actions identiques à Phase 0
- [ ] Snapshot B : posture, confidence_score, actions identiques à Phase 0
- [ ] Snapshot C : posture, confidence_score, actions identiques à Phase 0
- [ ] Champs V1 du payload inchangés
- [ ] Spread V2 sans conflit de noms

---

## Validation non-régression UX

Cette validation vérifie que l'interface utilisateur est strictement identique à
l'état Phase 0 du point de vue de l'opérateur.

### Checklist visuelle — Tab Moteur

- [ ] Formulaire : tous les champs présents, aucun champ nouveau, aucun champ manquant
- [ ] Bouton de soumission : fonctionnel, libellé inchangé
- [ ] Zone de résultat : posture affichée normalement
- [ ] Actions autorisées/interdites : listes inchangées
- [ ] Aucun texte V2 visible (tension, score, message explicatif)
- [ ] Aucun indicateur de chargement ou d'état V2

### Checklist visuelle — Tab Pilotage

- [ ] Contenu identique à Phase 0
- [ ] Aucun nouveau bloc ou section

### Checklist visuelle — Tab Mémoire

- [ ] Les snapshots existants s'affichent normalement
- [ ] Les nouveaux snapshots Post-Phase 1 s'enregistrent
- [ ] Aucune propriété `v2` affichée dans les snapshots du Tab Mémoire
- [ ] Aucune erreur d'affichage sur anciens snapshots (D-IMPL-02 vérifié)

### Checklist Debug panel

- [ ] Le toggle Debug fonctionne (ouvre/ferme)
- [ ] Les sections Debug V1 sont présentes et correctes
- [ ] Le bloc V2 `tensionMap` est visible **uniquement** dans le Debug
- [ ] Aucun texte V2 dans les sections cockpit du Debug

### Vérification aucune dépendance render.js → V2 hors Debug

```bash
grep -n "payload\.v2\|tensionMap\|HierarchyResult\|AttentionState\|ExpositionResult\|should_expose" src/js/render.js | grep -v "debug\|Debug\|//"
```

- [ ] Résultat : zéro ligne active hors section Debug

### Checklist non-régression UX

- [ ] Tab Moteur : visuellement identique à Phase 0
- [ ] Tab Pilotage : visuellement identique à Phase 0
- [ ] Tab Mémoire : fonctionnel, sans propriété V2 visible
- [ ] Debug panel : bloc V2 présent, cockpit inchangé
- [ ] Aucune dépendance render.js → V2 hors Debug
- [ ] Console : zéro erreur, zéro warning

---

## Critères de sortie du shadow mode

Le shadow mode Phase 1 est terminé quand les critères suivants sont tous verts.
La sortie du shadow mode Phase 1 n'est pas l'activation cockpit — c'est simplement
la validation que la couche cohérence fonctionne correctement en shadow mode,
et que Phase 2 (hiérarchie) peut être implémentée.

### Critères de sortie

| Critère | Condition | Statut |
|---|---|---|
| Volume sessions | 10 sessions complètes réalisées | ☐ |
| T1 détecté | Au moins 1 fois sur des inputs sous-seuil | ☐ |
| T3 détecté | Au moins 1 fois sur ACTIVE + engagement faible | ☐ |
| Faux positifs | Taux < 30% sur sessions équilibrées | ☐ |
| Snapshot F × 3 | tensionMap null sur inputs neutres | ☐ |
| Non-régression moteur | A/B/C identiques à Phase 0 | ☐ |
| Non-régression UX | Cockpit visuellement inchangé | ☐ |
| Console propre | Zéro erreur, zéro warning | ☐ |
| Aucune dépendance V2 hors Debug | grep render.js = 0 ligne active | ☐ |

### Ce que "sortie shadow mode Phase 1" ne signifie pas

- Ce n'est pas l'activation cockpit (Phase 5)
- Ce n'est pas la fin de toute calibration (D-COH-01 reste provisoire)
- Ce n'est pas la validation des seuils T1/T4 (test V0 requis)
- Ce n'est pas la décision de passer à la production

### Prochaine étape après sortie shadow mode Phase 1

Ouvrir `docs/architecture/checklist-implementation-phase-2.md` (à créer) pour
l'implémentation de `hierarchy.js` et l'activation du shadow mode hiérarchie.

---

## Rollback shadow mode

### Rollback par désactivation de flags (rollback normal)

```javascript
// flags.js — rollback Phase 1 immédiat
V2_ENABLED: false,
V2_COHERENCE: false,
```

Recharger la page. Le moteur revient au comportement Phase 0 exact. Aucun commit requis
pour un rollback temporaire d'investigation.

### Rollback T1-03 (affichage Debug)

Si le bloc Debug V2 cause un problème d'affichage :

```bash
git revert <hash-T1-03>
```

Le panel Debug revient à son état Phase 0. Les flags restent actifs — le tensionMap
continue d'être calculé mais n'est plus affiché.

### Rollback T1-02 (activation flags + import)

```bash
git revert <hash-T1-02>
```

Cela remet `flags.js` avec tous les flags à `false` et `moteur.js` avec l'import commenté.

### Rollback T1-01 (coherence.js)

```bash
git revert <hash-T1-01>
```

`coherence.js` revient au squelette retournant `null`. Phase 1 est entièrement annulée.

### Rollback total Phase 1

```bash
git revert <hash-T1-03>
git revert <hash-T1-02>
git revert <hash-T1-01>
```

État final = état Phase 0 exact. Les flags sont remis à `false`, les imports
sont commentés, `coherence.js` retourne `null`.

### Vérification post-rollback total

```bash
grep -n "V2_ENABLED\|V2_COHERENCE" src/js/v2/flags.js
```
- [ ] `V2_ENABLED: false`
- [ ] `V2_COHERENCE: false`

```bash
grep -n "import.*runV2\|runV2(payload)" src/js/moteur.js | grep -v "//"
```
- [ ] Résultat : zéro ligne active (import commenté)

---

## Signaux d'arrêt — calibration et sécurité

Ces situations déclenchent un arrêt et une investigation. Elles sont spécifiques à
Phase 1 (shadow mode cohérence).

| Signal | Seuil | Action |
|---|---|---|
| Régression V1 détectée | Toute valeur posture/score/action différente entre A/B/C Phase 0 et Phase 1 | Rollback T1-02 immédiat |
| Erreur JavaScript | Toute erreur non capturée | Rollback dernière tâche + investigation |
| Élément V2 dans cockpit | Tout texte ou bloc lié à V2 hors Debug panel | Rollback T1-03 + vérification render.js |
| T4 sur inputs totalement neutres | T4 présente sur Snapshot F | Investigation seuils `coherence.js` |
| Taux faux positifs > 60% | Plus de 6 sessions sur 10 avec tension sur inputs neutres | Arrêt — révision logique T2/T3/T4 |
| `payload.v2` modifie un champ V1 | Champ `posture` ou `confidence_score` écrasé | Arrêt — investigation spread `moteur.js` |
| render.js importe un module V2 hors Debug | grep détecte référence V2 active hors section debug | Rollback T1-03 |
| Flag `V2_COCKPIT_MESSAGE` activé accidentellement | grep `V2_COCKPIT_MESSAGE: true` | Correction immédiate |

### Signaux spécifiques calibration (non bloquants mais à documenter)

Ces signaux ne bloquent pas Phase 1 mais doivent être notés pour la calibration V0 :

| Signal | Signification |
|---|---|
| T1 > 50% des sessions | Seuil X=65 peut être trop haut — à ajuster en post-V0 |
| T4 présente sur toutes les sessions premium élevé | Seuil T4 trop laxiste — confirmation que D-COH-01 doit être calibré |
| T3 présente < 5% malgré des postures ACTIVE fréquentes | Mapping `engagement_declared` peut être incorrect dans le payload |
| tensionMap toujours null | Problème de noms de champs — les accès payload ne lisent pas les bonnes clés |

---

## Critères de fin Phase 1

Phase 1 est déclarée terminée quand **tous** les critères suivants sont verts.

### Critères implémentation

| Critère | Vérification | Statut |
|---|---|---|
| `coherence.js` logique T1–T4 implémentée | T1 et T3 détectés en console sur inputs cibles | ☐ |
| `V2_ENABLED: true`, `V2_COHERENCE: true` | grep flags.js | ☐ |
| 5 autres flags restent `false` | grep true flags.js = 2 lignes exactement | ☐ |
| `pipeline-v2.js` bloc Phase 1 actif | runV2() retourne `{ tensionMap, null, null, null }` | ☐ |
| Debug panel affiche `tensionMap` | Bloc V2 visible sur Snapshot D | ☐ |

### Critères non-régression

| Critère | Vérification | Statut |
|---|---|---|
| Snapshot A — identique | posture + score + actions = Phase 0 | ☐ |
| Snapshot B — identique | posture + score + actions = Phase 0 | ☐ |
| Snapshot C — identique | posture + score + actions = Phase 0 | ☐ |
| Aucun champ V1 écrasé | spread moteur.js sans conflit | ☐ |

### Critères UX

| Critère | Vérification | Statut |
|---|---|---|
| Cockpit inchangé (3 tabs) | Inspection visuelle | ☐ |
| Aucune tension visible cockpit | Tab Moteur sans texte V2 | ☐ |
| Debug bloc V2 dans section debug uniquement | grep render.js V2 hors debug = 0 | ☐ |
| Console propre | Zéro erreur, zéro warning | ☐ |

### Critères terrain

| Critère | Vérification | Statut |
|---|---|---|
| 10 sessions réalisées | Grille T1-04 remplie | ☐ |
| T1 détecté ≥ 1 fois | Grille sessions | ☐ |
| T3 détecté ≥ 1 fois | Grille sessions | ☐ |
| Faux positifs < 30% | Snapshot F × 3 = null | ☐ |
| Zéro crash toutes sessions | Console propre × 10 | ☐ |

### Décision

- **Tous les critères verts** → Phase 1 terminée · Passer à checklist Phase 2 (hiérarchie)
- **Un critère rouge** → Investigation · Rollback si nécessaire · Ne pas passer à Phase 2

---

## Statut

**Type** : Checklist opérationnelle d'exécution.
**Périmètre** : Phase 1 uniquement — shadow mode couche cohérence.
**Aucune tension visible dans le cockpit à l'issue de cette checklist.**
**Aucun impact décision moteur.**

**Résumé Phase 1 :**
- `coherence.js` logique T1–T4 implémentée (seuils provisoires D-COH-01)
- Shadow mode actif : tensions calculées et visibles Debug, cockpit inchangé
- `V2_ENABLED: true`, `V2_COHERENCE: true`, 5 autres flags `false`
- 10 sessions terrain avec grille d'observation
- Critères de fin en 4 tableaux (implémentation / non-régression / UX / terrain)

**Prochain document :** `checklist-implementation-phase-2.md` — shadow mode hiérarchie
des tensions + gestion de l'attention (à créer après Phase 1 validée).
