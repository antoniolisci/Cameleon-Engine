# Snapshots Phase 3 — Référence de non-régression

## Métadonnées

**Statut** : Document préparatoire · Phase 3 non commencée
**Version** : 1.0 — 2026-05-25
**Prérequis** : Phase 2 validée (commit b5e7815) · T3 cockpit actif
**Usage** : Référence de non-régression avant calibration terrain V0.
Ne pas utiliser comme substitut au test V0.
**Dépendances** :
- `docs/architecture/checklist-implementation-phase-3.md`
- `docs/architecture/calibration-terrain.md`
- `src/js/v2/coherence.js` — seuils provisoires D-COH-01
- `src/js/v2/hierarchy.js` — PRIORITY_ORDER
- `src/js/v2/attention.js` — gate WINDOW_SIZE=5
- `src/js/v2/exposition.js` — templates T1–T4

---

## Seuils provisoires D-COH-01 (état actuel coherence.js)

Ces valeurs sont provisoires. Elles ne seront validées qu'après le test V0 terrain.
Ne pas les modifier avant T3-01 (calibration seuils T1).

### T1 — Cohérence confidence / premium

```
confidence_score < 65
ET ( MdS > 2 OU DMU > 2 )
```

- Seuil X (confidence_score) : **65** (provisoire)
- Seuil Y (MdS) : **2** (provisoire — "MdS > 2" = MdS ≥ 3)
- Fallback DMU : si DMU > 2, T1 se déclenche même sans MdS
- Severity : `'high'` si cs < 40, sinon `'medium'`
- Type V2 : `'coherence_confidence_premium'`

**Limite actuelle** : MdS et DMU ne sont pas dans le payload V1. T1 ne peut pas se
déclencher en production sans extension de `buildPayload()`. Les snapshots ci-dessous
l'injectent manuellement dans le payload synthétique.

### T2 — Surcharge structurelle

```
structureLevel === 'haut' OU 'tres_haut' OU 'high' OU 'very_high'
```

- Severity : `'high'` si très haut, `'medium'` si haut
- Type V2 : `'surcharge_structurelle'`

**Anomalie documentée** : `calibration-terrain.md` définit T2 comme
`posture = ACTIVE ET profil ∈ {Impulsif, Agressif}` (binaire, sans seuil continu).
`coherence.js` implémente T2 sur `structureLevel`, qui n'est pas exposé dans le payload
V1 actuel. `exposition.js` produit un message `"Posture ACTIVE · profil non chargé"`
qui ne correspond pas au déclencheur `structureLevel`. Cette incohérence entre
définition (calibration-terrain.md), implémentation (coherence.js) et template
(exposition.js) doit être résolue avant T3-04 (calibration seuils T2).
Elle n'est pas traitée dans ce document.

### T3 — Delta engagement / posture

```
posture === 'ACTIVE'
ET engagement === 'faible' (proxy : need_action === 'no')
```

- Severity : `'high'` (fixe)
- Type V2 : `'delta_engagement_posture'`
- Delta : non calculé par coherence.js — exposition.js utilise fallback `delta = 1`

**Statut** : T3 est le seul type exposé dans le cockpit (Phase 2). Ses seuils sont
binaires — pas de calibration numérique requise (confirmé dans calibration-terrain.md).

### T4 — Surqualification technique

```
MdS > 3 ET QdR > 3 ET confidence_score > 2
```

- Seuil MdS : **3** (provisoire — "MdS > 3" = MdS ≥ 4 sur échelle 1–4)
- Seuil QdR : **3** (provisoire — "QdR > 3" = QdR ≥ 4 sur échelle 1–4)
- Severity : `'low'` (fixe)
- Type V2 : `'surqualification_technique'`

**Observation** : avec `MdS > 3` sur une échelle 1–4, T4 ne se déclenche que si MdS = 4.
Idem pour QdR. La co-occurrence MdS=4 + QdR=4 est probablement rare — cohérent avec
l'objectif de rareté T4 ≤ 10%.

---

## Comportement du gate attention sur les types actuels

**Point critique** : aucun des types V2 actuels (`coherence_confidence_premium`,
`surcharge_structurelle`, `delta_engagement_posture`, `surqualification_technique`)
n'est dans `HIGH_PASS_TYPES = ['structural', 'critical', 'blocking']`.

Conséquence directe :
- Au niveau `normal` → tout winner passe (should_expose = true)
- Au niveau `high` → tout winner est supprimé silencieusement (should_expose = false)
- Au niveau `elevated` → tout winner est supprimé (sauf is_blocking = true)

Seule l'exception absolue `winner.is_blocking === true` passe quelle que soit le niveau.

Les snapshots ci-dessous utilisent un état d'attention initial frais (`level = 'normal'`)
pour garantir `should_expose = true`. En session longue, le gate peut supprimer
n'importe quel type si le niveau monte.

---

## Snapshot J — T1 seul

**Objectif** : vérifier que T1 est détecté, sélectionné comme winner, et produit
un ExpositionResult — sans que le cockpit l'affiche (render.js filtre T3 uniquement).

### Payload synthétique

```javascript
{
  score: 50,            // confidence_score = 50 (< 65 → T1 potentiel)
  user_profile: 'BALANCED', // posture BALANCED → T3 non déclenché
  need_action: 'no',    // engagement faible, mais posture BALANCED → T3 n/a
  MdS: 3,               // MdS > 2 → condition T1 remplie
  QdR: 1,               // QdR ≤ 3 → T4 non déclenché
  // DMU absent → null par défaut
  // structureLevel absent → T2 non déclenché
}
```

### Tensions attendues

| Tension | Déclenchée ? | Raison |
|---|---|---|
| T1 | **Oui** | cs=50 < 65 ET MdS=3 > 2 |
| T2 | Non | structureLevel absent |
| T3 | Non | posture = BALANCED (≠ ACTIVE) |
| T4 | Non | QdR=1 ≤ 3 |

```
tensionMap.tensions = [{ id:'T1', type:'coherence_confidence_premium', severity:'medium',
                         payload:{ confidence_score:50, MdS:3, DMU:null } }]
tensionMap.active_exposed = 0
tensionMap.noise_level = 'low'
```

### HierarchyResult attendu

```
winner   = { id:'T1', type:'coherence_confidence_premium', severity:'medium', ... }
absorbed = []
```

### AttentionResult attendu (état initial frais)

```
État entrant : { expositions_window:0, attention_level:'normal', cycles_since_last_exposition:0 }
should_expose = true  (level='normal' → tout passe)
attention_level = 'normal'
suppressed_winner = null

État sortant : { expositions_window:1, attention_level:'normal', cycles_since_last_exposition:0 }
```

### ExpositionResult attendu

```javascript
{
  message:    'Lisibilité freeware non confirmée par la structure.',
  intention:  'expliquer',
  tension_id: 'T1',
  severity:   'medium',
  is_blocking: false,
}
```

Note : `winner.payload.module` est absent (coherence.js ne le popule pas) → fallback `'la structure'`.
Le module réel (ex. "MdS" ou "DMU") devra être injecté dans `winner.payload.module`
lors d'une future évolution de coherence.js.

### Rendu cockpit attendu

**Aucun message visible.** render.js contient la garde :
```javascript
expResult.tension_id === 'T3'
```
T1 ne passe pas cette garde. Le bloc `#v2MessageBlock` reste caché (`v2-message--hidden`).

### Vérification Debug panel

Après soumission du payload J, le panel Debug V2 doit afficher :
```
tensionMap:      { tensions:[T1], noise_level:'low' }
hierarchyResult: { winner:T1, absorbed:[] }
attentionResult: { should_expose:true, attention_level:'normal' }
expositionResult:{ tension_id:'T1', message:'Lisibilité freeware non confirmée par la structure.' }
```

### Risques et limites

- MdS n'est pas dans le payload V1 en production. Ce snapshot ne peut être
  reproduit qu'en injectant MdS manuellement dans la console ou via un payload
  de test direct à `runV2()`.
- Le message `'Lisibilité freeware non confirmée par la structure.'` utilise le
  fallback `'la structure'` — il sera mis à jour quand coherence.js populera
  `winner.payload.module`.
- Ce snapshot ne valide pas la fréquence de déclenchement T1 en conditions réelles.

---

## Snapshot K — T1 + T3

**Objectif** : vérifier que la hiérarchie T3 > T1 fonctionne. T3 doit gagner,
T1 doit être absorbé silencieusement. Le cockpit affiche T3 (car render.js
autorise T3).

### Payload synthétique

```javascript
{
  score: 50,            // confidence_score = 50 (< 65 → T1 potentiel)
  user_profile: 'ACTIVE', // posture ACTIVE → T3 potentiel
  need_action: 'no',    // engagement faible → T3 déclenché
  MdS: 3,               // MdS > 2 → T1 déclenché
  QdR: 1,               // QdR ≤ 3 → T4 non déclenché
  // structureLevel absent → T2 non déclenché
}
```

### Tensions attendues

| Tension | Déclenchée ? | Raison |
|---|---|---|
| T1 | **Oui** | cs=50 < 65 ET MdS=3 > 2 |
| T2 | Non | structureLevel absent |
| T3 | **Oui** | posture=ACTIVE ET engagement=faible |
| T4 | Non | QdR=1 ≤ 3 |

```
tensionMap.tensions = [
  { id:'T1', type:'coherence_confidence_premium', severity:'medium', ... },
  { id:'T3', type:'delta_engagement_posture',     severity:'high',   ... }
]
tensionMap.noise_level = 'medium'
```

### HierarchyResult attendu

PRIORITY_ORDER = ['T3','T1','T2','T4'] → T3 (index 0) > T1 (index 1)

```
winner   = { id:'T3', type:'delta_engagement_posture', severity:'high', ... }
absorbed = [{ id:'T1', type:'coherence_confidence_premium', severity:'medium', ... }]
```

### AttentionResult attendu (état initial frais)

```
État entrant : { expositions_window:0, attention_level:'normal', cycles_since_last_exposition:0 }
winner = T3, type='delta_engagement_posture', level='normal' → should_expose = true
suppressed_winner = null  (T1 absorbé par hierarchy — pas par attention)

État sortant : { expositions_window:1, attention_level:'normal', cycles_since_last_exposition:0 }
```

### ExpositionResult attendu

```javascript
{
  message:    'Distance posture/engagement : +1 cran.',
  intention:  'expliquer',
  tension_id: 'T3',
  severity:   'high',
  is_blocking: false,
}
```

Note : delta = 1 (fallback — coherence.js ne calcule pas delta pour T3).

### Rendu cockpit attendu

**Message T3 visible.** La garde render.js `expResult.tension_id === 'T3'` est satisfaite.
Le bloc `#v2MessageBlock` affiche :

```
Distance posture/engagement : +1 cran.
```

T1 est absorbé par la hiérarchie. Aucune trace de T1 dans le cockpit.
Seul le Debug panel révèle `absorbed = [T1]`.

### Vérification Debug panel

```
tensionMap:      { tensions:[T1, T3], noise_level:'medium' }
hierarchyResult: { winner:T3, absorbed:[T1] }
attentionResult: { should_expose:true, attention_level:'normal', suppressed_winner:null }
expositionResult:{ tension_id:'T3', message:'Distance posture/engagement : +1 cran.' }
```

Ce snapshot valide que la hiérarchie T3 > T1 est effective : même quand T1 est
détecté et légitime, T3 le couvre silencieusement. L'opérateur ne voit que T3.

### Risques et limites

- État d'attention frais (première exposition de la session). Si la session a
  déjà exposé 2 tensions, le level est `high` et T3 sera supprimé (type
  `delta_engagement_posture` non dans HIGH_PASS_TYPES).
- T1 est absorbé par la hiérarchie, non par le gate attention.
  `attentionResult.suppressed_winner` = null. L'absorption de T1 n'est visible
  qu'en Debug (`absorbed`), jamais dans le cockpit.
- Le message T3 utilise le fallback delta=1. Cela sera corrigé quand coherence.js
  calculera le delta réel.

---

## Snapshot L — T2 seul

**Objectif** : vérifier que T2 est détecté et produit un ExpositionResult —
sans que le cockpit l'affiche.

### Payload synthétique

```javascript
{
  score: 70,                 // confidence_score = 70 (≥ 65 → T1 non déclenché)
  user_profile: 'BALANCED',  // posture BALANCED → T3 non déclenché
  need_action: 'yes',        // engagement non faible → T3 non déclenché (sécurité)
  structureLevel: 'haut',    // → T2 déclenché
  // MdS/QdR absents → T4 non déclenché
}
```

### Tensions attendues

| Tension | Déclenchée ? | Raison |
|---|---|---|
| T1 | Non | cs=70 ≥ 65 |
| T2 | **Oui** | structureLevel='haut' |
| T3 | Non | posture=BALANCED |
| T4 | Non | MdS absent |

```
tensionMap.tensions = [{ id:'T2', type:'surcharge_structurelle', severity:'medium',
                         payload:{ structureLevel:'haut' } }]
tensionMap.noise_level = 'low'
```

### HierarchyResult attendu

```
winner   = { id:'T2', type:'surcharge_structurelle', severity:'medium', ... }
absorbed = []
```

### AttentionResult attendu (état initial frais)

```
État entrant : { expositions_window:0, attention_level:'normal', cycles_since_last_exposition:0 }
winner = T2, type='surcharge_structurelle', level='normal' → should_expose = true
suppressed_winner = null

État sortant : { expositions_window:1, attention_level:'normal', cycles_since_last_exposition:0 }
```

### ExpositionResult attendu

```javascript
{
  message:    'Posture ACTIVE · profil non chargé — tension détectée.',
  intention:  'expliquer',
  tension_id: 'T2',
  severity:   'medium',
  is_blocking: false,
}
```

**Incohérence connue** : T2 est déclenché par `structureLevel` (surcharge structurelle),
mais le template d'exposition dit "Posture ACTIVE · profil non chargé" — langage
emprunté à la définition T2 de `calibration-terrain.md` (profil comportemental ×
posture). Le message ne correspond pas au déclencheur réel. À résoudre en T3-04
avant toute activation cockpit T2.

### Rendu cockpit attendu

**Aucun message visible.** render.js garde `expResult.tension_id === 'T3'`.
T2 ne passe pas. `#v2MessageBlock` reste caché.

### Vérification Debug panel

```
tensionMap:      { tensions:[T2], noise_level:'low' }
hierarchyResult: { winner:T2, absorbed:[] }
attentionResult: { should_expose:true, attention_level:'normal' }
expositionResult:{ tension_id:'T2', message:'Posture ACTIVE · profil non chargé — tension détectée.' }
```

### Risques et limites

- `structureLevel` n'est pas dans le payload V1 en production. T2 ne peut pas
  se déclencher sans extension de `buildPayload()`. Ce snapshot est uniquement
  vérifiable via injection directe à `runV2()`.
- Le message de T2 est architecturalement incohérent (voir § Anomalie documentée
  dans les seuils). Ne pas activer T2 cockpit avant résolution de cette incohérence.
- Snapshot L ne constitue pas une validation de T2 — il confirme uniquement
  que le pipeline V2 ne plante pas sur T2.

---

## Snapshot M — T1 + T2 + T3

**Objectif** : vérifier la hiérarchie sur trois tensions simultanées.
T3 doit gagner. T1 et T2 doivent être absorbés. Un seul message possible.

### Payload synthétique

```javascript
{
  score: 50,               // confidence_score = 50 (< 65 → T1 potentiel)
  user_profile: 'ACTIVE',  // posture ACTIVE → T3 déclenché
  need_action: 'no',       // engagement faible → T3 déclenché
  MdS: 3,                  // MdS > 2 → T1 déclenché ; MdS ≤ 3 → T4 non déclenché
  QdR: 1,                  // QdR ≤ 3 → T4 non déclenché
  structureLevel: 'haut',  // → T2 déclenché
}
```

### Tensions attendues

| Tension | Déclenchée ? | Raison |
|---|---|---|
| T1 | **Oui** | cs=50 < 65 ET MdS=3 > 2 |
| T2 | **Oui** | structureLevel='haut' |
| T3 | **Oui** | posture=ACTIVE ET engagement=faible |
| T4 | Non | QdR=1 ≤ 3 |

```
tensionMap.tensions = [
  { id:'T1', type:'coherence_confidence_premium', severity:'medium', ... },
  { id:'T2', type:'surcharge_structurelle',       severity:'medium', ... },
  { id:'T3', type:'delta_engagement_posture',     severity:'high',   ... }
]
tensionMap.noise_level = 'high'  (tensions.length >= 3)
```

### HierarchyResult attendu

PRIORITY_ORDER = ['T3','T1','T2','T4']
Sort : T3 (idx 0) → T1 (idx 1) → T2 (idx 2)

```
winner   = { id:'T3', type:'delta_engagement_posture', severity:'high', ... }
absorbed = [
  { id:'T1', type:'coherence_confidence_premium', severity:'medium', ... },
  { id:'T2', type:'surcharge_structurelle',       severity:'medium', ... }
]
```

### AttentionResult attendu (état initial frais)

```
État entrant : { expositions_window:0, attention_level:'normal', cycles_since_last_exposition:0 }
winner = T3, level='normal' → should_expose = true
suppressed_winner = null

État sortant : { expositions_window:1, attention_level:'normal', cycles_since_last_exposition:0 }
```

### ExpositionResult attendu

```javascript
{
  message:    'Distance posture/engagement : +1 cran.',
  intention:  'expliquer',
  tension_id: 'T3',
  severity:   'high',
  is_blocking: false,
}
```

### Rendu cockpit attendu

**Un seul message T3 visible.** `active_exposed ≤ 1` — invariant respecté.

```
Distance posture/engagement : +1 cran.
```

T1 et T2 sont absorbés sans laisser de trace cockpit. Seul le Debug panel
révèle `absorbed = [T1, T2]`.

### Vérification Debug panel

```
tensionMap:      { tensions:[T1, T2, T3], noise_level:'high' }
hierarchyResult: { winner:T3, absorbed:[T1, T2] }
attentionResult: { should_expose:true, attention_level:'normal', suppressed_winner:null }
expositionResult:{ tension_id:'T3', message:'Distance posture/engagement : +1 cran.' }
```

Ce snapshot est le stress test hiérarchique de référence. Il valide que
T3 > T1 > T2 fonctionne sur trois tensions simultanées, et que `active_exposed`
ne dépasse jamais 1.

### Risques et limites

- Dépend de MdS et structureLevel dans le payload — non disponibles en V1 production.
- L'absorption de T1 et T2 n'est vérifiable qu'en Debug. Aucune trace visuelle.
- Ce snapshot ne teste pas le cas où T3 est supprimé par le gate attention
  (session longue, niveau `high`). Dans ce cas, T1 et T2 seraient également
  supprimés (non dans HIGH_PASS_TYPES), et le cockpit resterait silencieux.

---

## Ce que ces snapshots ne prouvent pas

Les quatre snapshots J–M sont des cas construits, non des sessions réelles.
Ils vérifient que le pipeline V2 ne plante pas et produit les outputs attendus
dans des conditions idéales (état d'attention frais, payload manuel). Ils ne
remplacent en aucun cas le test V0 terrain.

### Ils ne valident pas les seuils

Les seuils T1 (cs < 65, MdS > 2) et T4 (MdS > 3, QdR > 3) sont provisoires.
Ces snapshots n'apportent aucune information sur leur pertinence en conditions réelles.
Un seuil T1 trop bas génèrera des faux positifs que ces snapshots ne peuvent pas
révéler. La calibration (T3-01) requiert des distributions réelles de `confidence_score`
et de `MdS` sur des sessions opérateur.

### Ils ne valident pas la fréquence réelle

La fréquence de déclenchement T3 (objectif ≤ 30%), T1 (objectif ≤ 15%),
T2 (≤ 10%), T4 (≤ 10%) ne peut pas être estimée depuis des snapshots synthétiques.
Elle dépend de la distribution réelle des inputs dans les sessions opérateur.

### Ils ne valident pas les faux positifs

Un faux positif T1 ne peut être identifié que si l'opérateur peut confirmer
que sa lisibilité était réellement élevée et que les indicateurs premium ne
signalaient pas réellement de contradiction. Cette information n'existe pas
dans les snapshots construits.

### Ils ne valident pas le gate attention en conditions longues

Les quatre snapshots utilisent un état d'attention initial frais. Ils ne testent
pas les suppression en session longue (niveau `high` ou `elevated`), ni le
comportement du déclin après cycles silencieux.

### Ils ne débloquent pas T3-01

T3-01 est conditionné à des données terrain V0 réelles (≥ 20 opérateurs,
≥ 10 sessions chacun). Ces snapshots ne constituent pas un substitut.
T3-01 reste non exécutable tant que le test V0 n'a pas produit ses données.

---

## Anomalies et dettes pré-Phase 3

Les éléments suivants sont documentés ici pour référence. Ils ne doivent pas
être corrigés avant T3-01 sans décision explicite.

### A1 — T1 : champ `module` absent dans coherence.js

`coherence.js` ne popule pas `winner.payload.module`. `exposition.js` utilise
le fallback `'la structure'`. Le message T1 en production sera toujours
`"Lisibilité freeware non confirmée par la structure."` jusqu'à correction.
Cette dette est acceptable en shadow mode. À corriger avant T3-02 (activation T1 cockpit).

### A2 — T2 : incohérence définition / implémentation / template

Trois sources divergent sur la définition de T2 :
- `calibration-terrain.md` : T2 = `posture=ACTIVE AND profil∈{Impulsif,Agressif}`
- `coherence.js` : T2 = `structureLevel === 'haut'/'tres_haut'`
- `exposition.js` : template T2 = `"Posture ACTIVE · profil {profil}"`

Aucune des trois n'est cohérente avec les deux autres. `structureLevel` n'est pas
exposé dans le payload V1 actuel. À résoudre en T3-04 (calibration seuils T2)
avant toute activation cockpit T2. Ne pas corriger dans ce document.

### A3 — T3 : delta absent dans coherence.js

`coherence.js` ne calcule pas le delta engagement/posture. Le fallback `delta=1`
dans `exposition.js` produit toujours `"Distance posture/engagement : +1 cran."`
en production actuelle. L'échelle `delta≥2 / delta≥3` de l'exposition est
architecturalement présente mais inaccessible. À traiter si le delta devient
calculable dans le pipeline.

### A4 — T4 : seuil MdS > 3 sur échelle 1–4

Avec `MdS > 3`, T4 exige MdS = 4 (seule valeur strictement supérieure à 3 sur
l'échelle 1–4). Idem pour QdR. La co-occurrence MdS=4 + QdR=4 peut être
structurellement très rare ou impossible selon les données réelles. À confirmer
en T3-07 (calibration seuils T4). Le seuil peut être trop restrictif ou inexistant.

---

## Utilisation future

### Référence de non-régression avant Phase 3 réelle

Avant d'exécuter T3-02 (activation T1 cockpit), vérifier que ces quatre snapshots
produisent toujours les résultats documentés. Toute divergence signale une régression
dans la pipeline V2.

| Snapshot | Test de non-régression |
|---|---|
| J | T1 détecté · winner T1 · expositionResult tension_id='T1' · cockpit caché |
| K | T3 winner · absorbed contient T1 · cockpit affiche T3 |
| L | T2 détecté · winner T2 · expositionResult tension_id='T2' · cockpit caché |
| M | T3 winner · absorbed=[T1,T2] · un seul message cockpit |

### Base pour tests console

Ces payloads peuvent être soumis directement à `runV2()` depuis la console
navigateur ou depuis Node.js :

```javascript
import { runV2, resetV2SessionState } from './src/js/v2/pipeline-v2.js';

// Snapshot J — T1 seul
resetV2SessionState();
const j = runV2({ score:50, user_profile:'BALANCED', need_action:'no', MdS:3, QdR:1 });
console.log('J winner:', j.hierarchyResult?.winner?.id); // 'T1'
console.log('J exposition:', j.expositionResult?.tension_id); // 'T1'

// Snapshot K — T1+T3 → T3 gagne
resetV2SessionState();
const k = runV2({ score:50, user_profile:'ACTIVE', need_action:'no', MdS:3, QdR:1 });
console.log('K winner:', k.hierarchyResult?.winner?.id); // 'T3'
console.log('K absorbed:', k.hierarchyResult?.absorbed?.map(t=>t.id)); // ['T1']

// Snapshot L — T2 seul
resetV2SessionState();
const l = runV2({ score:70, user_profile:'BALANCED', need_action:'yes', structureLevel:'haut' });
console.log('L winner:', l.hierarchyResult?.winner?.id); // 'T2'

// Snapshot M — T1+T2+T3 → T3 gagne
resetV2SessionState();
const m = runV2({ score:50, user_profile:'ACTIVE', need_action:'no', MdS:3, QdR:1, structureLevel:'haut' });
console.log('M winner:', m.hierarchyResult?.winner?.id); // 'T3'
console.log('M absorbed:', m.hierarchyResult?.absorbed?.map(t=>t.id)); // ['T1','T2']
```

### Support de vérification après calibration

Après T3-01 (calibration seuils T1), mettre à jour le Snapshot J avec les seuils
calibrés retenus. Si X passe de 65 à 60, le payload J devra ajuster `score`
pour rester sous le seuil. Les payloads synthétiques doivent refléter les seuils
en vigueur — ils ne sont pas figés.

---

## Statut du document

**Type** : Référence préparatoire Phase 3 · Version 1.0 · 2026-05-25
**Snapshots inclus** : J · K · L · M
**Code modifié** : aucun
**Flags modifiés** : aucun (V2_CALIBRATION reste false)
**Cockpit T1/T2/T4** : non activé

Ce document sera mis à jour :
- Après T3-01 : ajuster les payloads des snapshots J et M si les seuils T1 changent
- Après T3-04 : ajuster le payload du Snapshot L si les seuils/définition T2 changent
- Après T3-07 : ajouter un Snapshot N pour T4 seul

---

*Snapshots Phase 3 — Version 1.0 — 2026-05-25*
