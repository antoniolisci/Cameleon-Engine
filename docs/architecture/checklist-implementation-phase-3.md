# Checklist d'implémentation — Phase 3 : Activation progressive T1/T2/T4

## Métadonnées

**Statut** : Checklist opérationnelle · Phase 3 uniquement
**Version** : 1.0 — 2026-05-24
**Prérequis** : Phase 2 entièrement validée (critères de fin Phase 2 tous verts)
**Dépendances** :
- `docs/architecture/checklist-implementation-phase-2.md` — Phase 2 référence
- `docs/architecture/couche-coherence-inter-modules.md` — seuils D-COH-01 calibrés
- `docs/architecture/hierarchie-des-tensions.md` — ordre T3>T1>T2>T4
- `docs/architecture/gestion-attention.md` — gate attention, D-ATT-01
- `docs/architecture/explicabilite-sobre.md` — templates T1–T4, 7 règles
- `docs/architecture/doctrine-silence-structurel.md` — absorption par défaut (invariant)
- `docs/architecture/calibration-terrain.md` — protocole V0, seuils provisoires

**Usage :** Ce document s'exécute après validation complète Phase 2 et calibration V0 terrain.
Ne pas activer T1 cockpit sans les critères d'activation T1 remplis (documentés en Phase 2).

---

## Objectif de Phase 3

Phase 3 complète l'activation cockpit de la couche V2. Là où Phase 2 exposait
uniquement T3 (conditions binaires, sans seuil numérique), Phase 3 active
progressivement T1, T2 puis T4 — chacun après calibration terrain validée.

À l'issue de Phase 3 :
- **T1 cockpit** : incohérence confiance/premium — seuils D-COH-01 calibrés
- **T2 cockpit** : surcharge structurelle — définition formelle niveau haut
- **T4 cockpit** : surqualification technique — seuils resserrés post-V0
- **Hiérarchie réelle testée** : conflits multi-tensions sur sessions longues
- **Gate attention calibrée** : N=5 provisoire confirmé ou ajusté
- **Surface calme préservée** : `active_exposed ≤ 1` · fréquence totale ≤ 40%
- **Doctrine silence structurel** : invariante — absorption par défaut non modifiée

**Ce document ne couvre pas :**
- La CalibrationSnapshot (Phase 6)
- L'escalade/désescalade de tensions (D-HIE-02/03) — réservée aux phases suivantes
- Les modifications de `buildPayload()` ou du pipeline V1 — zones de stabilité

**Condition de démarrage :** les critères d'activation T1 (Phase 2, § Critères activation
future T1/T2/T4) doivent être remplis avant de démarrer T3-01. T2 et T4 suivent
le même principe — chacun ne démarre que quand ses propres critères sont remplis.

---

## Prérequis — vérifications avant Phase 3

**Ne pas démarrer Phase 3 si l'un de ces items est rouge.**

### Prérequis Phase 2

- [ ] Critères de fin Phase 2 tous verts (4 tableaux)
- [ ] `V2_COCKPIT_MESSAGE: true` confirmé dans `flags.js`
- [ ] T3 cockpit validé terrain (lisibilité ≥ 4/5, fréquence ≤ 30%)
- [ ] `active_exposed ≤ 1` confirmé sur sessions Phase 2
- [ ] Aucun signal d'arrêt Phase 2 actif (S2-01 à S2-05)

### Prérequis calibration V0

- [ ] Test V0 terrain complété (≥ 20 opérateurs, ≥ 10 sessions chacun)
- [ ] Données `CalibrationSnapshot` exportées et analysées
- [ ] Seuils D-COH-01 T1 : taux vrais positifs > 70% sur données V0
- [ ] Faux positifs T1 Phase 1 shadow : < 20% sur ≥ 50 sessions

### Prérequis git

```bash
git status
```
- [ ] Working tree clean
- [ ] Hash du dernier commit noté : `________________`

### Prérequis connaissance

Avant d'implémenter Phase 3, relire :
- [ ] `docs/architecture/calibration-terrain.md` — seuils à jour après V0
- [ ] `docs/architecture/couche-coherence-inter-modules.md` — D-COH-01 calibrés
- [ ] `docs/architecture/doctrine-silence-structurel.md` — invariant à ne pas rompre
- [ ] Critères d'activation T1/T2/T4 de `checklist-implementation-phase-2.md`

### Prérequis philosophique

Phase 3 augmente la surface cockpit. Le risque n'est plus la "première impression"
(Phase 2), mais l'**accumulation** : plusieurs types de tensions actifs simultanément,
un opérateur qui voit T1 un jour et T3 le lendemain.

**La règle cardinale reste :** un seul message à la fois, rare, factuel, sobre.
L'ajout de T1/T2/T4 ne change pas cette règle — il la teste.

---

## Philosophie — activation progressive sans surcharge

### Le paradoxe de l'activation progressive

En Phase 2, T3 était seul. L'opérateur ne pouvait voir qu'une tension à la fois —
non pas parce que la règle `active_exposed ≤ 1` l'interdisait, mais parce qu'il n'y
avait qu'un type exposable.

En Phase 3, plusieurs types sont potentiellement actifs. La règle `active_exposed ≤ 1`
devient opérationnel : la hiérarchie choisit un winner, les autres sont absorbés.
La question n'est plus "voit-on quelque chose ?", mais "ce qu'on voit est-il le bon ?"

### Principe d'activation progressive Phase 3

**Règle :** activer T1 d'abord. Valider. Puis T2. Valider. Puis T4.

**Jamais :** activer T1+T2 en même temps. La validation croisée est impossible
et les signaux terrain se contaminent.

**Pourquoi cet ordre ?**
- T1 (confiance/premium) — le plus actionnable, seuils les plus stables
- T2 (surcharge structurelle) — contextuel, dépend de la définition de "haut"
- T4 (surqualification) — le plus laxiste, risque de banalisation élevé

### Ce que "activation progressive" signifie concrètement

| Étape | Flags | Visible cockpit |
|---|---|---|
| Entrée Phase 3 | V2_COCKPIT_MESSAGE:true | T3 uniquement |
| Après T3-02 | V2_COCKPIT_MESSAGE:true | T3 + T1 (hiérarchie décide) |
| Après T3-05 | V2_COCKPIT_MESSAGE:true | T3 + T1 + T2 (hiérarchie décide) |
| Après T3-08 | V2_COCKPIT_MESSAGE:true | T3 + T1 + T2 + T4 (hiérarchie décide) |

À chaque étape, `active_exposed ≤ 1` — la hiérarchie sélectionne un winner,
les autres sont absorbés silencieusement.

### Fréquence totale acceptable Phase 3

Avec plusieurs types actifs, la fréquence cumulée augmente. Objectif :
- T3 seul : ≤ 30%
- T3 + T1 : fréquence totale cockpit ≤ 35%
- T3 + T1 + T2 : fréquence totale cockpit ≤ 40%
- T3 + T1 + T2 + T4 : fréquence totale cockpit ≤ 40% (T4 très rare, < 10%)

**Si la fréquence totale dépasse 40%**, le cockpit devient trop chargé.
Resserrer les seuils ou reporter l'activation du type suivant.

### Invariant doctrine silence structurel

La doctrine silence structurel (`docs/architecture/doctrine-silence-structurel.md`)
n'est **jamais modifiée** par Phase 3. Toute modification de cette doctrine pour
"laisser passer plus de tensions" est une rupture architecturale.

Les seuils (D-COH-01) peuvent être ajustés. La doctrine ne l'est pas.

---

## Snapshots de référence Phase 3

Reprendre les snapshots Phase 2 (A–I) comme référence de non-régression.
Ajouter 4 snapshots spécifiques Phase 3.

### Snapshot J — T1 cockpit attendu

Inputs : confidence_score < 65 + MdS > 2 (T1 seul, sans T3).
Résultat attendu :
- Cockpit : message T1 visible (sobre, une phrase)
- Debug : tensionMap T1 + HierarchyResult winner=T1 + ExpositionResult tension_id='T1'
- Aucun message T3 (conditions T3 non remplies)

| Champ | Valeur utilisée |
|---|---|
| (à remplir lors de l'exécution) | |

Message attendu : `________________`

### Snapshot K — T1 + T3 simultanés (hiérarchie réelle)

Inputs : confidence_score < 65 + MdS > 2 (T1) ET posture ACTIVE + engagement faible (T3).
Résultat attendu :
- Cockpit : message T3 uniquement (T3 > T1)
- Debug : winner=T3, absorbed=[T1]
- T1 absorbé silencieusement

Ce snapshot valide que la hiérarchie T3>T1 fonctionne en conditions réelles.

### Snapshot L — T2 seul

Inputs : niveau structurel "haut" ou "très haut" (T2 seul, sans T1 ni T3).
Résultat attendu :
- Cockpit : message T2 visible après activation T2
- Debug : tensionMap T2 + winner=T2

Message attendu : `________________`

### Snapshot M — T1 + T2 + T3 simultanés (stress test hiérarchie)

Inputs combinés déclenchant T1, T2 et T3 simultanément.
Résultat attendu :
- Cockpit : **un seul message** — T3 winner (T3 > T1 > T2)
- Debug : absorbed=[T1, T2]

Ce snapshot valide la hiérarchie sur 3 tensions simultanées.

### Checklist snapshots Phase 3

- [ ] Snapshots A–I Phase 2 disponibles (non-régression)
- [ ] Snapshot J construit (T1 cockpit attendu)
- [ ] Snapshot K construit (T1+T3 — T3 gagne)
- [ ] Snapshot L construit (T2 cockpit attendu)
- [ ] Snapshot M construit (T1+T2+T3 — T3 gagne)

---

## Ordre d'exécution — Phase 3

```
T3-01 → T3-02 → T3-03 → T3-04 → T3-05 → T3-06 → T3-07 → T3-08 → T3-09
  ↓        ↓        ↓        ↓        ↓        ↓        ↓        ↓        ↓
calib.  activer  valid.  calib.  activer  valid.  calib.  activer  valid.
T1      T1       FP T1   T2      T2       FP T2   T4      T4       FP T4
seuils  cockpit          seuils  cockpit          seuils  cockpit
```

**Contraintes d'ordre :**
- T3-01 avant T3-02 : les seuils T1 doivent être calibrés avant l'activation cockpit
- T3-02 avant T3-03 : validation faux positifs après activation, pas avant
- T3-03 validé avant de démarrer T3-04 (pas de T2 avant T1 validé)
- T3-06 validé avant de démarrer T3-07 (pas de T4 avant T2 validé)

**Résumé par type :**

| Type | Tâches | Condition de départ |
|---|---|---|
| T1 | T3-01 → T3-02 → T3-03 | Critères activation T1 (Phase 2) remplis |
| T2 | T3-04 → T3-05 → T3-06 | T3-03 validé (T1 stabilisé) |
| T4 | T3-07 → T3-08 → T3-09 | T3-06 validé (T2 stabilisé) |

---

## T3-01 — Calibration seuils T1 (D-COH-01)

**Prérequis :** données terrain V0 exportées, seuils D-COH-01 provisoires analysés.
**Fichier concerné :** `src/js/v2/coherence.js` — seuils X et Y dans les conditions T1.

### Seuils T1 provisoires (Phase 1)

En Phase 1, les seuils T1 étaient :
```javascript
// T1 provisoire Phase 1 :
confidence_score < 65 ET (MdS > 2 OU DMU > 2)
```

### Calibration depuis les données V0

Analyser les `CalibrationSnapshot` exportés du test V0 :

1. Extraire toutes les sessions où T1 était détecté en shadow
2. Croiser avec le retour opérateur : l'incohérence était-elle réelle ?
3. Calculer taux vrais positifs et faux positifs aux seuils actuels

| Seuil testé | TP% | FP% | Observations |
|---|---|---|---|
| X=65, Y=2 (provisoire) | | | |
| X=60, Y=2 | | | |
| X=65, Y=3 | | | |
| Seuil retenu | | | |

**Critère de validation :**
- [ ] Seuil retenu : TP > 70% + FP < 20%
- [ ] Seuil documenté dans `calibration-terrain.md`

### Modification `coherence.js`

Si les seuils provisoires sont confirmés ou ajustés, modifier `coherence.js` :

```javascript
// T1 — seuil calibré (remplacer les valeurs provisoires)
const T1_CONFIDENCE_THRESHOLD = ___; // X retenu
const T1_PREMIUM_THRESHOLD = ___; // Y retenu
```

### Commit

```bash
git add src/js/v2/coherence.js
git commit -m "fix(v2/coherence): calibrate T1 thresholds from V0 data"
```

### Checklist T3-01

- [ ] Données V0 analysées (≥ 50 sessions shadow T1)
- [ ] Taux TP/FP calculés pour ≥ 2 seuils
- [ ] Seuil retenu documenté dans `calibration-terrain.md`
- [ ] `coherence.js` mis à jour si seuils modifiés
- [ ] Commit effectué (si modification)
- [ ] Console : zéro erreur

---

## T3-02 — Activation T1 cockpit

**Prérequis :** T3-01 validé (seuils T1 calibrés).
**Objectif :** permettre à T1 d'apparaître dans le cockpit quand il gagne la hiérarchie.

### Modification render.js

En Phase 2, render.js filtre explicitement `tension_id === 'T3'`. En Phase 3,
ce filtre est étendu pour inclure T1 :

```javascript
// Avant (Phase 2)
if (v2Msg && payload.v2?.expositionResult?.tension_id === 'T3' && V2_FLAGS.V2_COCKPIT_MESSAGE) {

// Après (Phase 3 — T1 ajouté)
const COCKPIT_TYPES = ['T3', 'T1'];
if (v2Msg && COCKPIT_TYPES.includes(payload.v2?.expositionResult?.tension_id) && V2_FLAGS.V2_COCKPIT_MESSAGE) {
```

**Règle :** aucun autre changement dans render.js. Un seul point de modification.

### Vérification Snapshot J

Soumettre Snapshot J (T1 seul) :
- [ ] Message T1 visible dans le cockpit
- [ ] Style sobre (même classe `.v2-message` que T3)
- [ ] Message court (≤ 15 mots)

### Vérification Snapshot K

Soumettre Snapshot K (T1 + T3 simultanés) :
- [ ] Un seul message cockpit — T3 (T3 > T1)
- [ ] T1 absorbé en Debug

### Vérification Snapshot A

Soumettre Snapshot A (PASSIVE, aucune tension) :
- [ ] Aucun message cockpit

### Commit

```bash
git add src/js/render.js
git commit -m "feat(render): extend cockpit message to T1 (Phase 3)"
```

### Checklist T3-02

- [ ] render.js : filtre étendu T3+T1
- [ ] Optional chaining + `escapeHtml()` préservés
- [ ] Snapshot J : message T1 visible
- [ ] Snapshot K : T3 gagne sur T1 (hiérarchie réelle)
- [ ] Snapshot A : aucun message
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T3-03 — Validation faux positifs T1

**Prérequis :** T3-02 activé et déployé sur sessions terrain.
**Objectif :** confirmer que T1 cockpit produit un taux de vrais positifs acceptable
et que les faux positifs ne dégradent pas la confiance de l'opérateur dans le moteur.

### Définition d'un faux positif T1 cockpit

Un faux positif T1 est observé quand :
- Le message T1 apparaît ("Confiance faible avec indicateurs premium élevés.")
- L'opérateur a réellement une confiance lecture élevée sur cette session
- Ou les indicateurs premium ne sont pas réellement "élevés" du point de vue opérateur

**Note :** la définition de "vrais positifs" nécessite un retour opérateur explicite —
pas uniquement une analyse des inputs.

### Grille de validation T1 — 10 sessions terrain

| Session | Message T1 visible ? | Contexte réel T1 ? | TP / FP | Note opérateur |
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

Taux faux positifs T1 cockpit : `__/10`

- [ ] FP T1 cockpit ≤ 20% (≤ 2/10 sessions)

### Validation lisibilité message T1

Le message T1 par défaut est : **"Confiance faible avec indicateurs premium élevés."**

- [ ] ≥ 4/5 opérateurs comprennent immédiatement sans explication
- [ ] 0/5 opérateurs ressentent un jugement ou une pression
- [ ] Message reformulé si lisibilité insuffisante (avant de valider T3-03)

### Vérification coexistence T1/T3

Sur sessions où T1 et T3 sont détectés simultanément :
- [ ] T3 gagne toujours (Snapshot K)
- [ ] T1 n'apparaît jamais en même temps que T3 dans le cockpit
- [ ] `document.querySelectorAll('.v2-message').length` ≤ 1 systématiquement

### Critère de passage T3-04

T3-03 validé si :
- [ ] FP T1 ≤ 20%
- [ ] Lisibilité T1 ≥ 4/5
- [ ] Fréquence T1+T3 cockpit cumulée ≤ 35%
- [ ] Aucun signal d'arrêt actif

**Si T3-03 non validé :** recalibrer seuils T1 (T3-01), reformuler message,
re-valider. Ne pas passer à T3-04 avant T3-03 vert.

---

## T3-04 — Calibration seuils T2

**Prérequis :** T3-03 validé (T1 cockpit stable).
**Fichier concerné :** `src/js/v2/coherence.js` — seuils T2 dans les conditions.

### Seuils T2 provisoires (Phase 1)

En Phase 1, la condition T2 était :
```javascript
// T2 provisoire Phase 1 :
niveau structurel "haut" ou "très haut"
```

### Définition formelle "niveau structurel haut"

T2 dépend d'une notion de "niveau structurel" qui doit être formellement ancrée
dans les states Caméléon existants. Avant de calibrer, vérifier dans `decision.js` :

- [ ] Identifier les states qui correspondent à "structure chargée" (lecture `decision.js`)
- [ ] Confirmer que ces states sont distincts de la posture ACTIVE (pas de confusion T2/T3)
- [ ] Documenter la correspondance `state → niveau structurel haut` dans `calibration-terrain.md`

### Analyse données V0 pour T2

Extraire des `CalibrationSnapshot` les sessions où T2 était détecté en shadow :

| Seuil testé | TP% | FP% | Observations |
|---|---|---|---|
| Niveau "haut" seul | | | |
| Niveau "très haut" seul | | | |
| Haut OU très haut | | | |
| Seuil retenu | | | |

- [ ] Seuil T2 retenu : TP > 70% + FP < 20%
- [ ] Corrélation T2 / T3 vérifiée (taux de coexistence accepté)

### Modification `coherence.js`

```javascript
// T2 — seuil calibré
const T2_STRUCTURAL_LEVELS = ['___', '___']; // niveaux retenus
```

### Commit

```bash
git add src/js/v2/coherence.js
git commit -m "fix(v2/coherence): calibrate T2 thresholds from V0 data"
```

### Checklist T3-04

- [ ] Définition formelle niveau structurel haut documentée
- [ ] Données V0 T2 analysées
- [ ] Seuil retenu documenté dans `calibration-terrain.md`
- [ ] `coherence.js` mis à jour si nécessaire
- [ ] Commit effectué
- [ ] Console : zéro erreur

---

## T3-05 — Activation T2 cockpit

**Prérequis :** T3-04 validé (seuils T2 calibrés).
**Objectif :** étendre le filtre cockpit render.js pour inclure T2.

### Modification render.js

```javascript
// Phase 3 après T3-05 — T2 ajouté
const COCKPIT_TYPES = ['T3', 'T1', 'T2'];
```

**Un seul point de modification.** Aucun autre changement.

### Vérification Snapshot L

Soumettre Snapshot L (T2 seul) :
- [ ] Message T2 visible dans le cockpit
- [ ] Style sobre (classe `.v2-message`)
- [ ] Message court (≤ 15 mots)

### Vérification Snapshot M

Soumettre Snapshot M (T1 + T2 + T3 simultanés) :
- [ ] Un seul message cockpit — T3 gagne
- [ ] Debug : absorbed=[T1, T2]

### Vérification hiérarchie T1 > T2

Inputs : conditions T1 et T2, sans T3.
- [ ] T1 apparaît dans le cockpit (pas T2)
- [ ] Debug : winner=T1, absorbed=[T2]

### Commit

```bash
git add src/js/render.js
git commit -m "feat(render): extend cockpit message to T2 (Phase 3)"
```

### Checklist T3-05

- [ ] render.js : filtre étendu T3+T1+T2
- [ ] Snapshot L : message T2 visible
- [ ] Snapshot M : T3 gagne sur T1+T2
- [ ] T1 > T2 confirmé en hiérarchie réelle
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T3-06 — Validation faux positifs T2

**Prérequis :** T3-05 activé et déployé sur sessions terrain.
**Miroir de T3-03 — même protocole, appliqué à T2.**

### Grille de validation T2 — 10 sessions terrain

| Session | Message T2 visible ? | Contexte réel T2 ? | TP / FP | Note opérateur |
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

Taux faux positifs T2 cockpit : `__/10`

- [ ] FP T2 cockpit ≤ 20%

### Validation lisibilité message T2

Le message T2 par défaut est : **"Structure chargée — conditions de lecture difficiles."**

- [ ] ≥ 4/5 opérateurs comprennent immédiatement
- [ ] 0/5 opérateurs interprètent "structure chargée" comme une erreur du moteur
- [ ] Message reformulé si confusion ("structure" peut renvoyer à l'architecture logicielle)

### Vérification fréquence cumulée T3+T1+T2

- [ ] Fréquence totale cockpit (T3 + T1 + T2 cumulés) ≤ 40% sur 10 sessions

### Critère de passage T3-07

- [ ] FP T2 ≤ 20%
- [ ] Lisibilité T2 ≥ 4/5
- [ ] Fréquence cumulée ≤ 40%
- [ ] Aucun signal d'arrêt actif

---

## T3-07 — Calibration seuils T4

**Prérequis :** T3-06 validé (T2 cockpit stable).
**T4 est la tension la plus laxiste — ses seuils Phase 1 étaient délibérément larges.**

### Seuils T4 provisoires (Phase 1)

En Phase 1, la condition T4 était :
```javascript
// T4 provisoire Phase 1 (très laxiste — attendu) :
MdS > 3 ET QdR > 3 ET confidence_score > 2
```

Ce seuil est volontairement laxiste pour maximiser la détection shadow. En Phase 3,
les seuils T4 doivent être resserrés pour que T4 soit **rare** (objectif : ≤ 10% des sessions).

### Analyse données V0 pour T4

| Seuil testé | Fréquence détection | TP% | FP% | Observations |
|---|---|---|---|---|
| MdS > 3, QdR > 3, cs > 2 (provisoire) | | | | Trop fréquent attendu |
| MdS > 4, QdR > 4, cs > 20 | | | | |
| MdS > 3, QdR > 4, cs > 30 | | | | |
| Seuil retenu | | | | Fréquence ≤ 10% |

**Critère principal T4 :** la fréquence de détection ≤ 10% est aussi importante que le TP%.
T4 ne doit pas banaliser le cockpit.

- [ ] Seuil T4 retenu : fréquence ≤ 10% ET FP < 15%
- [ ] Seuil documenté dans `calibration-terrain.md`

### Risque de confusion T4

Le message T4 par défaut est : **"Indicateurs techniques saturés."**

Risque identifié en Phase 2 : l'opérateur peut croire que le moteur lui-même est
saturé (problème logiciel). Avant d'activer T4, tester ce message sur 3 opérateurs :

- [ ] 0/3 opérateurs interprètent "saturés" comme un bug ou une surcharge du moteur
- [ ] Si confusion détectée : reformuler avant T3-08

### Modification `coherence.js`

```javascript
// T4 — seuils resserrés
const T4_MDS_THRESHOLD = ___; // MdS retenu
const T4_QDR_THRESHOLD = ___; // QdR retenu
const T4_CONFIDENCE_MIN = ___; // confidence_score minimum
```

### Commit

```bash
git add src/js/v2/coherence.js
git commit -m "fix(v2/coherence): tighten T4 thresholds from V0 data"
```

### Checklist T3-07

- [ ] Données V0 T4 analysées (fréquence + TP/FP)
- [ ] Seuil T4 retenu : fréquence ≤ 10%
- [ ] Confusion message "saturés" non observée (ou message reformulé)
- [ ] `coherence.js` mis à jour
- [ ] Commit effectué
- [ ] Console : zéro erreur

---

## T3-08 — Activation T4 cockpit

**Prérequis :** T3-07 validé (seuils T4 resserrés, confusion message non observée).
**Objectif :** T4 devient le dernier type activé — la chaîne V2 cockpit est complète.

### Modification render.js

```javascript
// Phase 3 après T3-08 — T4 ajouté (chaîne complète)
const COCKPIT_TYPES = ['T3', 'T1', 'T2', 'T4'];
```

**Remarque :** T4 étant très rare (≤ 10%), son activation ne devrait pas modifier
sensiblement le comportement observé du cockpit. Si elle le modifie, les seuils T4
sont encore trop larges — retourner en T3-07.

### Vérification T4 seul

Construire des inputs déclenchant T4 seul (MdS et QdR aux seuils retenus, sans T3/T1/T2) :
- [ ] Message T4 visible dans le cockpit
- [ ] Style sobre identique aux autres types
- [ ] Message ≤ 15 mots

### Vérification hiérarchie complète

Inputs déclenchant T1 + T4 simultanément (sans T3 ni T2) :
- [ ] T1 gagne (T1 > T4)
- [ ] Debug : absorbed=[T4]

### Commit

```bash
git add src/js/render.js
git commit -m "feat(render): extend cockpit message to T4 — V2 cockpit complete (Phase 3)"
```

### Checklist T3-08

- [ ] render.js : filtre complet T3+T1+T2+T4
- [ ] T4 visible cockpit dans conditions de test
- [ ] T1 > T4 confirmé en hiérarchie
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T3-09 — Validation faux positifs T4

**Prérequis :** T3-08 activé et déployé sur sessions terrain.
**Objectif :** confirmer que T4 est rare, lisible, et non confusant.

### Grille de validation T4 — 20 sessions terrain (seuil étendu)

T4 étant rare (objectif ≤ 10%), 10 sessions peuvent ne jamais le déclencher.
Étendre à 20 sessions pour avoir au moins 1–2 apparitions observables.

| Session | Message T4 visible ? | Contexte réel T4 ? | TP / FP | Note opérateur |
|---|---|---|---|---|
| 1–20 | (à remplir) | | | |

Apparitions T4 : `__/20` · Taux : `__%`

- [ ] Fréquence T4 ≤ 10% (≤ 2/20 sessions)
- [ ] FP T4 ≤ 15%

### Validation lisibilité message T4

- [ ] ≥ 4/5 opérateurs comprennent immédiatement (si observé)
- [ ] 0/5 opérateurs interprètent "saturés" comme un bug moteur
- [ ] Message reformulé si confusion persistante

### Vérification rareté — objectif principal T4

T4 ne doit pas banaliser le cockpit. Sa rareté est sa valeur.

- [ ] Sur 20 sessions, T4 apparaît ≤ 2 fois
- [ ] Si T4 apparaît > 4 fois sur 20 sessions : resserrer seuils (retour T3-07)

### Validation finale chaîne cockpit complète

Après T3-09, la chaîne V2 cockpit est complète. Vérification finale :

```javascript
// Console — après 5 soumissions variées
document.querySelectorAll('.v2-message').length
// Résultat attendu systématiquement : ≤ 1
```

- [ ] `active_exposed ≤ 1` confirmé sur toutes les soumissions T3-09
- [ ] Fréquence totale cumulée (T3+T1+T2+T4) ≤ 40% sur 20 sessions

---

## Validation hiérarchie réelle — conflicts multi-tensions

La hiérarchie T3>T1>T2>T4 doit être validée non pas sur des snapshots construits,
mais sur des sessions terrain réelles où plusieurs tensions coexistent organiquement.

### Matrice de coexistence

Sur les sessions Phase 3 terrain, enregistrer les coexistences observées :

| Tensions coexistant | Winner attendu | Winner observé | Conforme ? |
|---|---|---|---|
| T3 + T1 | T3 | | ☐ |
| T3 + T2 | T3 | | ☐ |
| T3 + T4 | T3 | | ☐ |
| T1 + T2 | T1 | | ☐ |
| T1 + T4 | T1 | | ☐ |
| T2 + T4 | T2 | | ☐ |
| T3 + T1 + T2 | T3 | | ☐ |
| T3 + T1 + T4 | T3 | | ☐ |
| T1 + T2 + T4 | T1 | | ☐ |
| T3 + T1 + T2 + T4 | T3 | | ☐ |

- [ ] Toutes les combinaisons observées : winner conforme à PRIORITY_ORDER
- [ ] Aucun cas de winner inattendu détecté

### Vérification unicité absolue

Sur toutes les sessions Phase 3 :
```javascript
// Après chaque soumission avec tensions multiples détectées
document.querySelectorAll('.v2-message').length
```
- [ ] Résultat : **jamais > 1** sur toutes les soumissions

### Vérification absorbed silencieux

Les tensions absorbées ne doivent laisser aucune trace cockpit :
- [ ] Aucun élément DOM lié à T1/T2/T4 quand T3 est winner
- [ ] Aucune indication visuelle "d'autres tensions présentes"
- [ ] Seul le Debug panel révèle les tensions absorbées

---

## Validation winner réel — stress test sessions longues

Les sessions longues (> 30 soumissions consécutives) testent des comportements
inaccessibles en session courte : accumulation attention, transitions de winner,
déclin fenêtre glissante réel.

### Protocole stress test — 1 session longue par type

Construire 4 sessions longues (≥ 30 soumissions) centrées chacune sur un type :

**Session A-longue — T3 majoritaire**
- Inputs répétant Snapshot G × 30
- Observer : déclin attention (after N=5), recovery (after 20min window)
- [ ] T3 winner confirmé sur les soumissions où should_expose=true
- [ ] Suppression silencieuse observée aux soumissions > N=5
- [ ] Recovery observé si interval > 20min

**Session B-longue — T1 + T3 alternés**
- Soumissions alternant Snapshot J (T1 seul) et Snapshot K (T1+T3)
- [ ] Winner correct à chaque soumission
- [ ] Gate attention gère les deux types indépendamment

**Session C-longue — T1 > T2 en conditions réelles**
- Inputs maintenant T1 et T2 actifs simultanément sans T3
- [ ] T1 gagne systématiquement (≥ 30 soumissions)
- [ ] Aucune inversion T2 > T1 observée

**Session D-longue — toutes tensions actives**
- Inputs déclenchant T3 + T1 + T2 simultanément × 30
- [ ] T3 gagne systématiquement
- [ ] Debug : absorbed contient T1+T2 à chaque soumission
- [ ] `active_exposed` = 1 systématiquement

### Vérification winner stable

Sur les 4 sessions longues :
- [ ] Aucun winner inattendu détecté
- [ ] PRIORITY_ORDER respectée à chaque cycle
- [ ] Aucune régression moteur V1 sur les 120+ soumissions cumulées

---

## Validation starvation T1/T2/T4

La starvation est le cas où une tension est systématiquement absorbée par une tension
de priorité supérieure, sans jamais être exposée dans le cockpit — même quand elle
représente l'information la plus pertinente pour l'opérateur.

**Exemple de starvation :** T1 est toujours présent avec T3. T3 gagne toujours.
T1 n'est jamais vu par l'opérateur, même sur 50 sessions.

### Ce que la starvation n'est pas

La starvation est un problème **uniquement si T1 (ou T2/T4) porte une information
que T3 ne couvre pas, et que cette information est actionnable**.

Si T3 gagne et que le message T3 contient déjà l'information essentielle pour
l'opérateur, la starvation de T1 est **correcte** — c'est le rôle de la hiérarchie.

### Protocole de détection starvation

Sur 30 sessions terrain Phase 3, analyser en Debug :

| Type | Fois détecté (shadow) | Fois winner | Fois absorbé | Taux absorption |
|---|---|---|---|---|
| T3 | | | | |
| T1 | | | | |
| T2 | | | | |
| T4 | | | | |

**Signal de starvation problématique :** T1 ou T2 absorbé > 80% des fois où il est
détecté, **ET** ces sessions ne bénéficient pas du message T3 (T3 absent ces sessions-là).

Ce serait le signe que T1/T2 porte une information que T3 ne couvre pas et que la
hiérarchie écrase une information pertinente.

- [ ] T1 starvation problématique : non observée
- [ ] T2 starvation problématique : non observée
- [ ] T4 starvation admise (T4 très rare, absorption normale)

### Action si starvation problématique détectée

La starvation ne se résout **pas** en modifiant la hiérarchie.
Elle se résout en reformulant le message du winner pour inclure implicitement
l'information de la tension absorbée — ou en acceptant que cette information
n'est pas critique pour l'opérateur.

**Ne jamais modifier PRIORITY_ORDER pour résoudre une starvation.**

---

## Validation rareté T4

T4 est la tension la plus laxiste en Phase 1 (seuils très larges). En Phase 3,
sa rareté après resserrement des seuils est une propriété à valider explicitement.

**T4 doit être suffisamment rare pour rester informatif.** Un T4 trop fréquent
perd sa valeur (banalisation) et alourdit le cockpit sans apporter de signal réel.

### Objectif de rareté T4

- **Cible :** T4 ≤ 10% des sessions opérateur
- **Maximum acceptable :** T4 ≤ 15% (au-delà : resserrer les seuils)
- **Plancher acceptable :** T4 ≥ 1% sur 100 sessions (si 0%, les seuils sont trop restrictifs)

### Grille de rareté — 50 sessions minimum

50 sessions pour un taux T4 statistiquement fiable :

| Plage de sessions | Apparitions T4 | Taux |
|---|---|---|
| Sessions 1–10 | | |
| Sessions 11–20 | | |
| Sessions 21–30 | | |
| Sessions 31–50 | | |
| **Total** | | |

- [ ] Taux T4 sur 50 sessions : entre 1% et 10%
- [ ] Si taux > 15% : retour T3-07 (resserrer seuils)
- [ ] Si taux = 0% sur 50 sessions : vérifier que les conditions T4 sont atteignables

### Vérification valeur informationnelle T4

Quand T4 apparaît, demander à l'opérateur : "Ce message était-il pertinent ?"

| Apparition | Pertinent pour l'opérateur ? |
|---|---|
| 1 | ☐ Oui ☐ Non |
| 2 | ☐ Oui ☐ Non |
| 3 | ☐ Oui ☐ Non |

- [ ] ≥ 2/3 apparitions évaluées comme pertinentes
- [ ] Si 0/3 : T4 ne porte pas d'information actionnable — reporter activation T4

---

## Calibration attention multi-types

En Phase 2, la fenêtre glissante d'attention (WINDOW_SIZE=5, 20min) était provisoire.
En Phase 3, avec plusieurs types actifs, le gate attention gère des tensions
hétérogènes. La calibration doit confirmer que N=5 reste pertinent.

### Ce que le gate attention fait en Phase 3

Le gate `applyAttentionGate()` travaille sur le **winner** — pas sur le type.
T3 winner et T1 winner sont traités identiquement par le gate.

**Effet Phase 3 :** si T3 est winner pendant 3 cycles puis T1 pendant 2 cycles,
la fenêtre comptabilise 5 expositions consécutives (quelle que soit la nature du type).
Le gate peut supprimer un T1 légitime simplement parce que T3 a saturé la fenêtre.

Ce comportement est **intentionnel** (pas de distinction par type dans le gate).
Mais il doit être validé comme acceptable.

### Validation WINDOW_SIZE=5 multi-types

Sur sessions longues Phase 3 :

| Observation | Résultat |
|---|---|
| T3×3 puis T1×2 → 5 expositions → gate high | Cockpit calme (normal) |
| Pause 20min → T1 re-exposable | Recovery confirmé |
| T3×5 → T1 supprimé malgré conditions réelles T1 | Acceptable ? ☐ Oui ☐ Non |

- [ ] Le comportement WINDOW_SIZE=5 multi-types est jugé acceptable sur les données terrain

### Si WINDOW_SIZE=5 jugé trop strict en multi-types

Option A : augmenter à N=7 (plus de tolérance)
Option B : gérer la fenêtre par type (D-ATT-01 — dette architecturale)

**Règle :** ne pas modifier WINDOW_SIZE sans valider l'impact sur la fréquence totale.
Un N=7 peut faire passer la fréquence totale au-dessus de 40%.

- [ ] WINDOW_SIZE retenu : N=`___` (5 par défaut, ajusté si nécessaire)
- [ ] Si modifié : `attention.js` mis à jour + commit + re-validation fréquence totale

### Vérification déclin DECLINE_FAST/DECLINE_FULL

Les constantes `DECLINE_FAST=2` et `DECLINE_FULL=4` sont aussi provisoires.
Vérifier qu'elles correspondent au comportement souhaité en Phase 3 :

- [ ] DECLINE_FAST=2 : premier signal de déclin après 2 cycles silencieux (observé)
- [ ] DECLINE_FULL=4 : reset complet après 4 cycles silencieux (observé)

---

## Exposition critique vs contextuelle

Les 4 tensions V2 n'ont pas toutes le même niveau d'actionabilité. Cette section
formalise la distinction entre **exposition critique** (T3 — actionnable immédiatement)
et **exposition contextuelle** (T1/T2/T4 — informatif, pas urgent).

### Définition

| Type | Catégorie | Actionabilité | Fréquence cible |
|---|---|---|---|
| T3 | Critique | Immédiate — posture/engagement incohérents | ≤ 30% |
| T1 | Contextuel | Court terme — ajuster la lecture de confiance | ≤ 15% |
| T2 | Contextuel | Moyen terme — prudence en structure chargée | ≤ 10% |
| T4 | Contextuel | Informatif — prise de conscience technique | ≤ 10% |

### Règles d'exposition par catégorie

**Critique (T3) :**
- Doit être vu — si le gate supprime T3 trop souvent, reconsidérer WINDOW_SIZE
- Le message doit être factuel ET actionnable en moins de 5 secondes

**Contextuel (T1/T2/T4) :**
- Peut être supprimé par le gate sans problème — l'information restera disponible en Debug
- Le message est informatif, pas urgent — l'opérateur ne doit pas modifier son comportement immédiatement
- Si T1/T2/T4 est systématiquement supprimé par T3, c'est normal (T3 prioritaire)

### Vérification de non-confusion critique/contextuel

- [ ] Le message T3 génère une action ou une prise de décision dans ≥ 3/5 cas observés
- [ ] Les messages T1/T2/T4 ne génèrent pas d'urgence — opérateur "prend note" sans se précipiter
- [ ] Aucun opérateur ne traite T1/T2/T4 avec la même urgence que T3

### Conséquence sur le rendu

Le rendu CSS Phase 2 (`.v2-message` sobre, uniforme) est maintenu pour tous les types.
Aucune différentiation visuelle par niveau d'urgence.

**Interdit :** créer une classe `.v2-message--critical` ou `.v2-message--warning`
pour T3 vs T1/T2/T4. Cela réintroduirait la hiérarchie visuelle alarme/information
que la doctrine silence structurel interdit.

- [ ] Un seul style `.v2-message` pour tous les types — confirmé après Phase 3

---

## Validation silence structurel final

À l'issue de Phase 3, la couche V2 est entièrement active dans le cockpit
(T3+T1+T2+T4). C'est le moment de valider que la doctrine silence structurel
n'a pas été érodée au fil des phases.

### Invariants de la doctrine

Relire `docs/architecture/doctrine-silence-structurel.md` et vérifier chaque invariant :

| Invariant | Formulation doctrine | Respecté Phase 3 ? |
|---|---|---|
| Absorption par défaut | Les tensions non exposées sont silencieuses — pas de trace cockpit | ☐ |
| Exposition = exception | Le cockpit sans message est l'état normal | ☐ |
| Unicité | `active_exposed ≤ 1` à tout moment | ☐ |
| Indépendance | Cockpit ne dépend pas du panel Debug | ☐ |
| Non-jugement | Aucun message ne juge le comportement de l'opérateur | ☐ |
| Non-instruction | Aucun message ne dicte une action | ☐ |

### Test de silence structurel final

Soumettre 5 sessions avec inputs neutres (scores moyens, pas de tensions extrêmes) :
- [ ] ≥ 3/5 sessions : **aucun message V2** dans le cockpit
- [ ] Les 2 sessions avec message : message sobre, court, factuel

**Lecture inverse :** si le cockpit affiche un message dans chaque session, la couche V2
est trop sensible ou les seuils sont trop larges. La surface calme est dégradée.

### Vérification de non-pollution du cockpit V1

Le cockpit V1 (posture, actions autorisées/interdites, confiance) doit être visuellement
identifiable comme la couche principale. V2 doit être discret.

- [ ] L'œil va naturellement vers la posture/actions principale, pas vers `.v2-message`
- [ ] La présence de `.v2-message` ne modifie pas le temps de lecture du cockpit V1
- [ ] L'absence de `.v2-message` n'est pas remarquée (silence invisible)

### Verdict silence structurel

- [ ] Doctrine silence structurel intégralement respectée après Phase 3 complète
- [ ] Fréquence totale cockpit (tous types) ≤ 40% sur 20 sessions terrain

---

## Sortie progressive shadow mode — critères pré-production V2

À l'issue de Phase 3, la couche V2 n'est plus en shadow mode — tous les composants
sont actifs et visibles dans le cockpit. La "sortie du shadow mode" est un état
de fait, pas une action. Cette section documente les critères qui confirment
que le moteur est prêt pour une utilisation pré-production.

### Définition pré-production V2

Pré-production V2 signifie : le moteur peut être utilisé par des opérateurs réels
dans des conditions normales, avec la couche V2 active, sans supervision directe
de l'implémenteur.

**Pré-production ≠ production publique.** Le test V0 reste le cadre d'utilisation.

### Critères pré-production V2 — liste exhaustive

**Critères techniques :**
- [ ] Tous les flags V2 actifs : V2_ENABLED, V2_COHERENCE, V2_HIERARCHY, V2_ATTENTION, V2_EXPOSITION, V2_COCKPIT_MESSAGE
- [ ] V2_CALIBRATION reste false (Phase 6)
- [ ] Zéro erreur JavaScript console sur sessions normales
- [ ] localStorage : aucune clé V2 persistée
- [ ] `buildPayload()` non modifié — pipe V1 intact

**Critères UX :**
- [ ] Fréquence totale messages cockpit ≤ 40%
- [ ] `active_exposed ≤ 1` systématique (0 exception détectée)
- [ ] Surface calme : cockpit sans message dans ≥ 60% des sessions
- [ ] Aucun message > 15 mots observé en production

**Critères calibration :**
- [ ] Seuils T1, T2, T4 calibrés depuis données V0 réelles (pas provisoires)
- [ ] WINDOW_SIZE retenu documenté dans `calibration-terrain.md`
- [ ] Faux positifs < 20% pour T1/T2, < 15% pour T4

**Critères doctrine :**
- [ ] Doctrine silence structurel invariante (non modifiée)
- [ ] Aucune logique punitive introduite
- [ ] Aucune différentiation CSS par urgence entre types
- [ ] Module comportement isolation stricte préservée

### État final des flags en pré-production V2

```javascript
// src/js/v2/flags.js — état pré-production Phase 3
export const V2_FLAGS = {
  V2_ENABLED: true,
  V2_COHERENCE: true,
  V2_HIERARCHY: true,
  V2_ATTENTION: true,
  V2_EXPOSITION: true,
  V2_COCKPIT_MESSAGE: true,
  V2_CALIBRATION: false,  // Phase 6 — non encore activé
};
```

---

## Validation non-régression Phase 3

Phase 3 ne modifie que `coherence.js` (seuils) et `render.js` (filtre étendu).
La non-régression est vérifiée sur les mêmes périmètres que Phase 2.

### Tableau non-régression moteur V1

| Test | Référence Phase 2 | Phase 3 | Statut |
|---|---|---|---|
| R-01 à R-08 | Scores et postures V1 identiques Phase 2 | Identiques | ☐ |
| buildPayload() | Tous champs V1 présents | Inchangé | ☐ |
| Snapshots A–I | Comportement Phase 2 | Identiques | ☐ |

### Tableau non-régression UX Phase 3

| Composant | Comportement attendu | Vérifié |
|---|---|---|
| T3 cockpit | Identique Phase 2 | ☐ |
| Formulaire 16 champs | Aucun blocage | ☐ |
| Module comportement | Isolation stricte préservée | ☐ |
| localStorage | Aucune clé V2 | ☐ |
| Debug panel | Tous champs V2 affichés (4 résultats) | ☐ |

### Tableau non-régression CSS

| Élément | Phase 2 | Phase 3 | Statut |
|---|---|---|---|
| `.v2-message` | Style sobre | Identique pour T1/T2/T4 | ☐ |
| Layout cockpit | Normal | Inchangé | ☐ |
| Styles existants | Intacts | Aucune collision | ☐ |

- [ ] Tous les tableaux non-régression Phase 3 verts

---

## Rollback Phase 3

Les rollbacks Phase 3 suivent la même logique que Phase 2, avec un niveau supplémentaire
pour les seuils de calibration.

### Niveau 1 — Rollback render.js (T3-08 ou T3-05 ou T3-02)

Annule l'extension du filtre cockpit pour le type le plus récemment ajouté.

```bash
git revert <hash-T3-08>   # retire T4
# ou
git revert <hash-T3-05>   # retire T2+T4
# ou
git revert <hash-T3-02>   # retire T1+T2+T4
```

### Niveau 2 — Rollback seuils calibration (T3-07/T3-04/T3-01)

Revenir aux seuils provisoires si les seuils calibrés produisent des FP inattendus.

```bash
git revert <hash-T3-07>   # revenir aux seuils T4 provisoires
# ou
git revert <hash-T3-04>   # revenir aux seuils T2 provisoires
# ou
git revert <hash-T3-01>   # revenir aux seuils T1 Phase 1
```

**Après rollback seuils :** recommencer la calibration avec un dataset V0 plus large
ou des critères TP/FP reconsidérés.

### Niveau 3 — Rollback total Phase 3

Retour à l'état Phase 2 validée (T3 cockpit seul, seuils Phase 1).

```javascript
// src/js/v2/flags.js
// Flags Phase 2 inchangés — seuls coherence.js et render.js sont revertés
```

```bash
git revert <hash-T3-01>..<hash-T3-09>  # si commits consécutifs
```

### Niveau 4 — Rollback total V2

Retour à Phase 0 stable (V2 inerte, aucun composant actif).
Voir § Rollback Phase 2, Niveau 4 — même procédure.

### Matrice décision rollback Phase 3

| Situation | Niveau recommandé |
|---|---|
| T4 trop fréquent | N1 (revert T3-08) + N2 (resserrer seuils) |
| T1 FP > 20% | N1 (revert T3-02) + N2 (recalibrer T1) |
| Starvation problématique | Analyser sans rollback — reformuler message winner |
| Régression moteur V1 | N3 immédiat + investiguer |
| Fréquence totale > 40% | N1 (retirer dernier type activé) + recalibrer |

---

## Signaux d'arrêt Phase 3

### Signaux bloquants — arrêt immédiat

| # | Signal | Gravité | Action |
|---|---|---|---|
| S3-01 | Régression moteur V1 (score ou posture modifiés par extension V2) | Critique | Rollback N3 · investiguer render.js/coherence.js |
| S3-02 | Deux messages cockpit simultanés (`active_exposed > 1`) | Critique | Rollback N1 · vérifier render.js filtre |
| S3-03 | Faux positif confirmé T1/T2/T4 > 20% sur 10 sessions | Bloquant | Rollback N1 + N2 · recalibrer seuils |
| S3-04 | Winner incorrect observé (ex. T4 > T3) | Critique | Rollback N1 · vérifier PRIORITY_ORDER dans `hierarchy.js` |
| S3-05 | Erreur JavaScript console liée V2 | Bloquant | Corriger avant de poursuivre |
| S3-06 | Starvation problématique T1 ou T2 (> 80% absorption sans couverture T3) | Bloquant | Analyser · reformuler message winner · ne pas modifier hiérarchie |

### Signaux de calibration — pause et révision

| # | Signal | Action |
|---|---|---|
| S3-07 | Fréquence totale cockpit > 40% | Resserrer seuils du type le plus récent · retirer si nécessaire |
| S3-08 | ≥ 2 opérateurs expriment gêne ou surveillance Phase 3 | Revoir messages T1/T2/T4 · fréquence à réduire |
| S3-09 | T4 apparaît > 15% des sessions | Retirer T4 (revert T3-08) · resserrer seuils T4 (T3-07) |
| S3-10 | WINDOW_SIZE=5 supprime trop souvent T1 en présence de T3 | Recalibrer WINDOW_SIZE · D-ATT-01 à réévaluer |

### Signaux de vigilance

| # | Signal | Observation |
|---|---|---|
| S3-11 | T4 jamais observé sur 50 sessions (taux 0%) | Vérifier conditions T4 atteignables avec le profil opérateur |
| S3-12 | Opérateurs ignorent systématiquement T1/T2/T4 après 5 sessions | Signal de bruit — évaluer valeur informationnelle réelle |

---

## Critères de fin Phase 3

**Phase 3 est validée quand les 5 tableaux ci-dessous sont entièrement verts.**

### Tableau 1 — Calibration et implémentation

| Item | Critère | Statut |
|---|---|---|
| T3-01 | Seuils T1 calibrés depuis V0 · documentés | ☐ |
| T3-02 | T1 cockpit activé · Snapshot J validé | ☐ |
| T3-03 | FP T1 ≤ 20% · lisibilité ≥ 4/5 | ☐ |
| T3-04 | Seuils T2 calibrés · définition formelle niveau haut | ☐ |
| T3-05 | T2 cockpit activé · Snapshot L validé | ☐ |
| T3-06 | FP T2 ≤ 20% · lisibilité ≥ 4/5 | ☐ |
| T3-07 | Seuils T4 resserrés · confusion message non observée | ☐ |
| T3-08 | T4 cockpit activé · chaîne complète T3+T1+T2+T4 | ☐ |
| T3-09 | T4 rareté ≤ 10% · FP T4 ≤ 15% | ☐ |

### Tableau 2 — Non-régression moteur et UX

| Item | Critère | Statut |
|---|---|---|
| Moteur V1 | R-01 à R-08 identiques Phase 2 | ☐ |
| Snapshots A–I | Comportement Phase 2 préservé | ☐ |
| Module comportement | Isolation stricte | ☐ |
| localStorage | Aucune clé V2 | ☐ |

### Tableau 3 — Surface calme Phase 3

| Item | Critère | Statut |
|---|---|---|
| active_exposed | ≤ 1 systématique (0 exception) | ☐ |
| Fréquence totale | ≤ 40% sur 20 sessions | ☐ |
| Style uniforme | Un seul style `.v2-message` pour tous les types | ☐ |
| Aucune logique punitive | Aucun blocage, aucune modification moteur | ☐ |

### Tableau 4 — Hiérarchie réelle

| Item | Critère | Statut |
|---|---|---|
| Matrice coexistence | Toutes combinaisons observées conformes à PRIORITY_ORDER | ☐ |
| Stress test sessions longues | Winner stable sur ≥ 120 soumissions cumulées | ☐ |
| Starvation | Pas de starvation problématique T1 ou T2 | ☐ |

### Tableau 5 — Doctrine silence structurel

| Item | Critère | Statut |
|---|---|---|
| Silence par défaut | ≥ 60% sessions sans message cockpit | ☐ |
| Invariants doctrine | 6/6 invariants respectés | ☐ |
| Non-pollution V1 | Cockpit V1 reste layer principal perçu | ☐ |
| Critères pré-production | Tous remplis (voir § Sortie shadow mode) | ☐ |

### Condition de passage Phase 4 (si applicable)

Phase 4 couvrirait la CalibrationSnapshot (V2_CALIBRATION:true) et l'escalade
de tensions (D-HIE-02/03). Elle ne doit démarrer que si :
- [ ] Les 5 tableaux Phase 3 sont entièrement verts
- [ ] Le test V0 terrain confirme la valeur de la couche V2 pour les opérateurs
- [ ] Une décision produit explicite justifie d'aller plus loin

---

## Statut et suite

**Statut de ce document :** Checklist opérationnelle · Version 1.0 · Non commencée

Ce document couvre Phase 3 intégralement : calibration des seuils T1/T2/T4 depuis
les données V0, activation progressive dans le cockpit, validation hiérarchie réelle
sur sessions longues, et sortie formelle du shadow mode avec critères pré-production V2.

### Ce que Phase 3 complète

À l'issue de Phase 3, le moteur Caméléon est dans l'état suivant :
- **Chaîne V2 cockpit complète :** T3 + T1 + T2 + T4 exposables (hiérarchie décide)
- **Seuils calibrés :** D-COH-01 confirmés ou ajustés depuis données V0 réelles
- **Gate attention calibré :** WINDOW_SIZE retenu et documenté
- **Surface calme vérifiée :** fréquence totale ≤ 40%, `active_exposed ≤ 1`
- **Doctrine silence structurel intacte :** invariants vérifiés post-activation complète
- **Pré-production V2 :** critères remplis pour usage sans supervision

### Ce que Phase 3 ne couvre pas

- CalibrationSnapshot actif (V2_CALIBRATION:true) — Phase 6
- Escalade/désescalade de tensions D-HIE-02/03 — phases suivantes si décision produit
- Export automatique de données de calibration — hors périmètre V1

### Position dans la chaîne V2

```
Phase 0 (infra) → Phase 1 (cohérence shadow) → Phase 2 (T3 cockpit)
  → Phase 3 (T1+T2+T4 cockpit · calibration · pré-production)
    → Phase 4+ (CalibrationSnapshot · escalade · décision produit)
```

**Phase 3 est la dernière phase documentée à ce stade.**
La suite dépend du retour du test V0 terrain et d'une décision produit explicite.

---

*Checklist Phase 3 — Version 1.0 — 2026-05-24*
