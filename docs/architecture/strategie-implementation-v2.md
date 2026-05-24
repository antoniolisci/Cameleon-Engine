# Stratégie d'implémentation V2 — Caméléon Engine

## Métadonnées

**Statut** : Document de stratégie technique · Aucune implémentation immédiate
**Version** : 1.0 — 2026-05-24
**Dépendances** :
- `docs/architecture/cartographie-variables-pipeline.md`
- `docs/architecture/couche-coherence-inter-modules.md`
- `docs/architecture/hierarchie-des-tensions.md`
- `docs/architecture/gestion-attention.md`
- `docs/architecture/explicabilite-sobre.md`
- `docs/architecture/instrumentation-debug-calibration.md`

---

## Contexte et contraintes

L'architecture V2 introduit quatre composants nouveaux dans la pipeline d'un moteur
qui fonctionne en production V1. L'implémentation ne peut pas être une réécriture
complète : elle doit être incrémentale, réversible, et sans régression observable
pour l'opérateur.

**Ce que V1 doit continuer à faire exactement :**
Le moteur V1 produit un payload via `buildPayload()`. Ce payload alimente `render.js`
qui l'affiche dans le cockpit. Ce flux est stable, testé par des sessions réelles,
et ne doit pas être modifié en V2 — uniquement enrichi.

**Ce que V2 ajoute sans remplacer :**
- Une couche de détection de tensions (couche cohérence inter-modules)
- Une hiérarchie de priorité sur ces tensions (hiérarchie des tensions)
- Un gate d'exposition contrôlé (gestion de l'attention)
- Une formulation contextuelle de la tension retenue (explicabilité sobre)

**Le principe directeur :** V2 est une couche qui se branche *après* le pipeline V1,
pas une réécriture de ce pipeline. Si V2 est désactivée, le moteur se comporte
exactement comme en V1.

**Ce document ne couvre pas :**
- La logique interne de chaque composant V2 (couverte dans leurs documents respectifs)
- Les seuils de calibration (couverts dans `calibration-terrain.md`)
- L'instrumentation de collecte (couverte dans `instrumentation-debug-calibration.md`)

---

## Principes d'implémentation

**Principe I — Aucune régression V1.**
Le comportement du moteur V1 ne doit pas changer. Posture, actions autorisées/interdites,
score de confiance, labels cockpit : identiques avant et après l'intégration de V2.
La régression zéro est non négociable — si un composant V2 modifie un output V1,
l'implémentation est incorrecte.

**Principe II — Activation progressive.**
Chaque composant V2 peut être activé ou désactivé indépendamment via un feature flag.
L'activation se fait composant par composant, dans l'ordre documenté. Il n'existe pas
d'état "V2 activé globalement" — uniquement des états partiels cumulatifs.

**Principe III — Isolation stricte.**
Chaque composant V2 est un module isolé. Il ne modifie pas les modules existants.
Il reçoit des inputs en lecture seule et produit des outputs dans une structure dédiée.
Aucune modification de `engine.js`, `decision.js`, `trading-policy.js`, `confidence-score.js`
n'est nécessaire pour intégrer V2.

**Principe IV — Branchement unique dans le pipeline.**
V2 se branche à un seul point dans la pipeline existante : après `buildPayload()`,
avant `render.js`. Ce branchement unique est le seul point de contact entre V1 et V2.

**Principe V — Rollback par désactivation.**
Désactiver tous les feature flags V2 doit rétablir un comportement V1 exact, sans
laisser de traces dans l'état de l'application. Le rollback n'est pas une procédure
d'urgence — c'est un mode d'opération normal lors du déploiement progressif.

**Principe VI — Test avant activation.**
Chaque composant V2 est testé en shadow mode (exécution sans exposition) avant d'être
activé avec exposition cockpit. Le shadow mode produit des logs debug sans modifier
le cockpit opérateur.

---

## Zones de stabilité et zones de travail

### Zones interdites — aucune modification

Ces fichiers et modules sont en zone de stabilité absolue. Toute modification lors
de l'intégration V2 est une violation du Principe I.

| Zone | Fichier | Raison |
|---|---|---|
| Score moteur | `src/js/engine.js` | Produit baseScore, posture — source de vérité V1 |
| Table de décision | `src/js/decision.js` | Produit les actions autorisées/interdites |
| Policy trading | `src/js/trading-policy.js` | Dérive les actions depuis posture + état marché |
| Score de confiance | `src/js/confidence-score.js` | Produit confidence_score — source de vérité calibration |
| État marché | `src/js/market-state.js` | Évaluation de l'état marché |
| Payload builder | `src/js/engine.js → buildPayload()` | Agrège les outputs V1 — ne pas modifier la signature |
| Moteur consolidé | `src/js/moteur.js` | API unifiée — seul point d'entrée V2 autorisé |
| Données / constantes | `src/js/data.js` | Constantes partagées — toute modification est globale |
| State / persistance | `src/js/state.js` | Gère localStorage — ne pas ajouter de clés V2 ici |

### Zones de travail — nouveaux fichiers uniquement

V2 est implémentée dans de **nouveaux fichiers**. Aucun fichier existant n'est modifié
sauf les deux points de branchement documentés (voir § Points de branchement sûrs).

| Zone | Nouveaux fichiers | Responsabilité |
|---|---|---|
| Couche cohérence | `src/js/v2/coherence.js` | Produit tensionMap depuis payload V1 |
| Hiérarchie | `src/js/v2/hierarchy.js` | Produit HierarchyResult depuis tensionMap |
| Gestion attention | `src/js/v2/attention.js` | Produit AttentionResult depuis HierarchyResult |
| Explicabilité | `src/js/v2/exposition.js` | Produit ExpositionResult depuis AttentionResult |
| Orchestrateur V2 | `src/js/v2/pipeline-v2.js` | Chaîne les 4 composants, expose `runV2()` |
| Feature flags | `src/js/v2/flags.js` | Configuration activation/désactivation |
| Instrumentation | `src/js/v2/calibration.js` | CalibrationSnapshot, buffer, export |

### Points de branchement sûrs

Deux points de modification dans le code existant sont autorisés et suffisants :

**Point 1 — `src/js/moteur.js`** : après `buildPayload()`, appeler `runV2(payload)` si
le flag V2 est actif. Le résultat enrichit le payload retourné. Si le flag est inactif,
`runMoteur()` retourne le payload V1 inchangé.

**Point 2 — `src/js/render.js`** : dans la fonction de rendu principale, lire
`payload.v2.ExpositionResult?.message` si présent. Aucune autre modification de
la logique de rendu n'est nécessaire pour l'intégration V2 de base.

Ces deux points de branchement sont les seules modifications de fichiers existants
autorisées lors de l'intégration V2.

---

## Ordre d'implémentation

L'ordre est contraint par les dépendances entre composants. Chaque composant ne peut
être implémenté qu'après que ses dépendances sont stables et testées.

```
Phase 0 — Infrastructure V2
  ├── Créer src/js/v2/ (répertoire)
  ├── Implémenter flags.js (feature flags)
  └── Implémenter les structures de types (interfaces TypeScript ou JSDoc)

Phase 1 — Couche cohérence inter-modules
  ├── Implémenter coherence.js
  ├── Tests unitaires : tensionMap produit depuis un payload V1 fixe
  ├── Shadow mode : exécution sans exposition, logs debug uniquement
  └── Critère de passage : T1–T4 détectables sur 10 sessions réelles

Phase 2 — Hiérarchie des tensions
  ├── Dépend de : Phase 1 stable
  ├── Implémenter hierarchy.js
  ├── Tests unitaires : winner déterministe depuis tensionMap fixe
  ├── Shadow mode : HierarchyResult dans debug, rien dans cockpit
  └── Critère de passage : ordre T3>T1>T2>T4 vérifié sur données réelles

Phase 3 — Gestion de l'attention
  ├── Dépend de : Phase 2 stable
  ├── Implémenter attention.js (incluant AttentionState in-memory)
  ├── Tests unitaires : gate should_expose sur scénarios de séquence
  ├── Shadow mode : AttentionResult visible debug, cockpit inchangé
  └── Critère de passage : suppressions silencieuses vérifiées (cycle N+1 après exposition)

Phase 4 — Couche d'explicabilité sobre
  ├── Dépend de : Phase 3 stable
  ├── Implémenter exposition.js (templates T1–T4, règles formulation)
  ├── Tests unitaires : ExpositionResult.message pour chaque type de tension
  ├── Shadow mode : ExpositionResult dans debug, message non encore cockpit
  └── Critère de passage : lisibilité messages sur 5 sessions réelles (test qualitatif)

Phase 5 — Activation cockpit
  ├── Dépend de : Phase 4 stable + critères calibration T1/T4 disponibles
  ├── Modifier render.js (Point 2) pour lire ExpositionResult.message
  ├── Activation progressive : 1 type de tension à la fois
  └── Critère d'activation : voir § Critères d'activation production

Phase 6 — Instrumentation calibration
  ├── Peut démarrer en parallèle de Phase 3 (dépend de Phase 2)
  ├── Implémenter calibration.js (CalibrationSnapshot, buffer, export)
  └── Critère de passage : export JSON complet sur session test interne
```

**Note sur le parallélisme :** La Phase 6 (instrumentation) peut être développée en
parallèle des Phases 3–4. Elle ne dépend que de la Phase 2 (HierarchyResult disponible).

---

## Feature flags

Les feature flags contrôlent l'activation de chaque composant V2 de façon indépendante.
Ils sont définis dans `src/js/v2/flags.js` et lus au démarrage.

### Structure proposée

```javascript
// src/js/v2/flags.js
export const V2_FLAGS = {
  // Activation globale V2 — si false, runV2() est un no-op
  V2_ENABLED: false,

  // Composants individuels
  V2_COHERENCE: false,      // Couche cohérence inter-modules
  V2_HIERARCHY: false,      // Hiérarchie des tensions
  V2_ATTENTION: false,      // Gestion de l'attention
  V2_EXPOSITION: false,     // Explicabilité sobre

  // Exposition cockpit
  V2_COCKPIT_MESSAGE: false, // Affichage ExpositionResult.message dans cockpit

  // Instrumentation
  V2_CALIBRATION: false,    // CalibrationSnapshot + buffer
};
```

### Règles d'activation

Un composant ne peut être activé que si ses dépendances sont actives :

| Flag | Dépend de |
|---|---|
| `V2_COHERENCE` | `V2_ENABLED` |
| `V2_HIERARCHY` | `V2_COHERENCE` |
| `V2_ATTENTION` | `V2_HIERARCHY` |
| `V2_EXPOSITION` | `V2_ATTENTION` |
| `V2_COCKPIT_MESSAGE` | `V2_EXPOSITION` |
| `V2_CALIBRATION` | `V2_HIERARCHY` (besoin de winner) |

Activer un flag sans que ses dépendances soient actives est une erreur silencieuse
que l'orchestrateur `pipeline-v2.js` doit détecter et logger (jamais crasher).

### Persistance des flags

Les feature flags ne sont **pas** persistés en localStorage. Ils sont des constantes
de build modifiées manuellement par le développeur. Cette contrainte est intentionnelle :
l'opérateur n'a pas accès aux flags et ne doit pas les percevoir comme une option.

### Shadow mode vs activation cockpit

La combinaison `V2_ATTENTION: true` + `V2_COCKPIT_MESSAGE: false` réalise le shadow mode :
tous les composants s'exécutent, leurs outputs sont visibles dans le debug, mais
aucun message n'apparaît dans le cockpit. C'est le mode de test recommandé avant
toute activation cockpit.

---

## Isolation des composants V2

Chaque composant V2 est un module ES pur respectant le contrat suivant :

### Contrat d'isolation commun

```
Input  : objet immuable reçu en paramètre (jamais de lecture globale)
Output : nouvel objet structuré (jamais de mutation de l'input)
Effets : aucun (pas d'écriture localStorage, pas d'événement DOM, pas de window.*)
```

### Contrats spécifiques par composant

**`coherence.js`**
```
Input  : { payload: PayloadV1, behaviorGetter: () => ProfilComportemental | null }
Output : TensionMap
Effets : aucun
Note   : behaviorGetter est une fonction — le module comportemental n'est pas importé
         directement, il est injecté. Cela préserve l'isolation du module comportemental.
```

**`hierarchy.js`**
```
Input  : TensionMap
Output : HierarchyResult
Effets : aucun
```

**`attention.js`**
```
Input  : { winner: TensionDetail | null, state: AttentionState }
Output : { result: AttentionResult, nextState: AttentionState }
Effets : aucun (l'appelant est responsable de mettre à jour l'état)
Note   : attention.js ne détient pas l'état — il le transforme. L'orchestrateur
         pipeline-v2.js est responsable du cycle de vie de AttentionState.
```

**`exposition.js`**
```
Input  : { winner: TensionDetail | null, should_expose: boolean }
Output : ExpositionResult | null
Effets : aucun
```

**`calibration.js`**
```
Input  : { payload: PayloadV1, tensionMap: TensionMap, attentionResult: AttentionResult,
           expositionResult: ExpositionResult | null }
Output : CalibrationSnapshot (pour ajout au buffer)
Effets : ajout au buffer in-memory calibrationBuffer[] (seul effet de bord autorisé)
Note   : calibration.js gère le buffer FIFO (cap 200). Le bouton export est dans
         le panel Debug de render.js — il appelle calibration.getBuffer().
```

### Répertoire cible

```
src/js/v2/
  ├── flags.js          — feature flags
  ├── coherence.js      — tensionMap
  ├── hierarchy.js      — HierarchyResult
  ├── attention.js      — AttentionResult (stateless, transforme l'état)
  ├── exposition.js     — ExpositionResult
  ├── calibration.js    — CalibrationSnapshot + buffer + export
  └── pipeline-v2.js    — orchestrateur : chaîne les composants, gère AttentionState
```

Le répertoire `src/js/v2/` ne contient que du code V2. Aucun import depuis ce
répertoire ne modifie le comportement des modules existants.

---

## Protection de `buildPayload()`

`buildPayload()` dans `engine.js` est la frontière entre V1 et V2. Elle doit rester
inchangée dans sa signature et ses outputs V1.

### Ce que V2 peut faire

V2 enrichit le payload **après** que `buildPayload()` ait retourné son objet.
L'enrichissement se fait dans `pipeline-v2.js` et `moteur.js`, pas dans `engine.js`.

**Pattern autorisé :**
```javascript
// Dans moteur.js
const payloadV1 = buildPayload(state);
if (V2_FLAGS.V2_ENABLED) {
  const v2Result = runV2(payloadV1);
  return { ...payloadV1, v2: v2Result };
}
return payloadV1;
```

**Pattern interdit :**
```javascript
// INTERDIT — modification de buildPayload() dans engine.js
function buildPayload(state) {
  const result = { ...existing... };
  result.tensionMap = computeTensionMap(result); // ← V2 dans engine.js = INTERDIT
  return result;
}
```

### Contrat de la signature V1

La signature actuelle de `buildPayload()` et tous ses champs de sortie existants
sont garantis inchangés. Aucune propriété existante du payload ne doit être renommée,
supprimée, ou dont le type change.

### Namespace V2 dans le payload enrichi

Tous les outputs V2 sont regroupés dans une propriété `v2` du payload enrichi :
```javascript
payload.v2 = {
  tensionMap,        // TensionMap | null
  hierarchyResult,   // HierarchyResult | null
  attentionResult,   // AttentionResult | null
  expositionResult,  // ExpositionResult | null
};
```

Si V2 est désactivé, `payload.v2` est absent ou `null`. Le code de rendu doit
traiter cette absence gracieusement (optional chaining).

### Dette D-MAP-01 — bloquante avant implémentation

Avant de brancher V2 dans `moteur.js`, résoudre D-MAP-01 : auditer les variables
globales et lectures localStorage non déclarées dans `engine.js`. Si des dépendances
implicites existent, elles doivent être documentées ou supprimées avant l'intégration
V2 pour éviter des interactions non prédictibles.

---

## Protection de `render.js`

`render.js` est le fichier le plus volumineux du projet (~3600 lignes) et le plus
risqué à modifier. La stratégie V2 minimise les modifications de ce fichier au strict
nécessaire.

### Modification autorisée — unique point de contact

La seule modification autorisée de `render.js` pour l'intégration V2 de base est
la lecture de `payload.v2?.expositionResult?.message` dans la fonction de rendu
principale, pour afficher le message de tension dans le cockpit.

Ce point de contact doit respecter trois contraintes :

1. **Optional chaining obligatoire.** Si `payload.v2` est absent, le rendu cockpit
   ne change pas. La modification est un ajout conditionnel, pas une substitution.

2. **Aucun calcul dans render.js.** Si `ExpositionResult` contient `is_blocking`,
   render.js peut lire ce champ pour adapter le style du message. Mais il ne calcule
   pas si le message est bloquant — il lit uniquement ce que V2 a décidé.

3. **Section Debug séparée.** Le panel Debug existant dans `render.js` peut être
   étendu pour afficher les outputs V2 complets (tensionMap, HierarchyResult,
   AttentionState, ExpositionResult complet). Cette extension va dans la section
   Debug existante — elle n'affecte pas les sections cockpit.

### Ce qui est interdit dans render.js

| Modification interdite | Raison |
|---|---|
| Recalcul d'une variable V2 depuis des données V1 | P6 : render.js consomme, ne calcule pas |
| Lecture directe de `tensionMap` ou `HierarchyResult` pour le cockpit | Flux interdit (cartographie) |
| Affichage d'une variable brute V2 sans passer par ExpositionResult | Doctrine du silence structurel |
| Dépendance conditionnelle sur l'état du Debug pour le cockpit | P4 : surfaces étanches |

### Taille et risque de render.js

`render.js` à ~3600 lignes présente un risque de régression élevé pour toute
modification. Les règles suivantes s'appliquent :

- Toute modification est précédée d'une lecture de la section concernée.
- Les modifications sont chirurgicales — une ligne ou un bloc, pas des sections entières.
- Après chaque modification, vérifier les 3 tabs (Moteur / Pilotage / Mémoire)
  et le panel Debug via le serveur local.

---

## Intégration progressive des composants V2

### T1–T4 : ordre d'activation dans le cockpit

Les quatre types de tensions ne sont pas activés simultanément dans le cockpit.
L'activation cockpit se fait type par type, après observation en shadow mode.

| Ordre | Type | Prérequis cockpit |
|---|---|---|
| 1 | T1 — Cohérence confidence / premium | Seuils D-COH-01 calibrés (X et Y post-V0) |
| 2 | T3 — Delta engagement/posture | Binaire — pas de seuil ; activer après T1 stable |
| 3 | T2 — Surcharge structurelle | Ordinal — activer après T3 stable |
| 4 | T4 — Surqualification technique | Seuils D-COH-01 calibrés ; activer en dernier |

**Justification de l'ordre :**
T1 est la tension la plus fréquente et la plus actionnable — elle bénéficie du plus
long shadow mode. T3 et T2 ont des seuils binaires/ordinaux sans calibration numérique
requise. T4 est la plus rare et la plus tardive à calibrer.

### Intégration de la hiérarchie des tensions

La hiérarchie (ordre T3>T1>T2>T4) est active dès que deux types de tensions ou plus
sont activés. En shadow mode, elle trie sans exposer. En mode actif cockpit, elle
garantit qu'une seule tension est exposée par cycle.

L'escalade et la désescalade (D-HIE-02/03) sont activées après 3+ sessions de
validation en shadow mode sur chaque type de tension concerné.

### Intégration de la gestion de l'attention

Le gate d'attention (`should_expose`) est activé dès la Phase 3. Il opère
silencieusement même avant l'activation cockpit : une tension peut être winner
dans HierarchyResult mais supprimée par le gate. Cette suppression est visible
dans le Debug, pas dans le cockpit.

Le seuil D-ATT-01 (N=5 expositions par fenêtre de 20 cycles provisoire) est
calibré via le test V0. L'activation cockpit de la gestion de l'attention est
conditionnée à la disponibilité de données D-ATT-01 calibrées.

### Activation progressive de l'explicabilité

L'explicabilité s'active en deux temps :

**Temps 1 — Templates actifs, exposition zéro :** tous les templates T1–T4 sont
implémentés et testés. ExpositionResult est produit à chaque cycle. Visible dans
Debug uniquement. Cockpit inchangé.

**Temps 2 — Exposition cockpit type par type :** selon l'ordre T1 → T3 → T2 → T4,
activer `V2_COCKPIT_MESSAGE` pour chaque type après shadow mode validé.

---

## Stratégie shadow mode V0

Le shadow mode est la période d'exécution des composants V2 sans exposition cockpit.
C'est le mode par défaut lors du test V0.

### Définition opérationnelle

**Shadow mode = V2_ENABLED: true + V2_COCKPIT_MESSAGE: false**

Les composants V2 s'exécutent à chaque soumission. Leurs outputs sont calculés,
loggés dans le Debug, et capturés dans le CalibrationSnapshot. Le cockpit reste
strictement identique à V1.

### Données produites en shadow mode

À chaque soumission opérateur en shadow mode, le système calcule et stocke :

```
tensionMap        — quelles tensions ont été détectées
HierarchyResult   — quelle tension aurait gagné
AttentionResult   — si la tension aurait été exposée (gate)
ExpositionResult  — quel message aurait été affiché
CalibrationSnapshot — capture complète pour export
```

Ces données permettent de calibrer T1/T4 et D-ATT-01 *sans perturber* les sessions
opérateur. C'est la condition fondamentale du test V0 (Option B retenue).

### Durée du shadow mode

La durée minimale du shadow mode n'est pas fixée en temps absolu — elle est fixée
en volume de données :

- **Couche cohérence :** 10 sessions réelles avec tensionMap non null avant activation
- **Hiérarchie :** 10 sessions avec HierarchyResult winner non null
- **Gestion attention :** 20 cycles consécutifs pour valider le comportement de la fenêtre
- **Explicabilité :** 5 lectures qualitatives de messages produits par des tensions réelles

Ces volumes sont des minimums. Si les données semblent aberrantes, le shadow mode
est prolongé jusqu'à stabilisation.

### Sortie du shadow mode

La sortie du shadow mode vers l'activation cockpit est déclenchée par les critères
d'activation production (voir section suivante). Elle ne peut pas être déclenchée
par une décision unilatérale sans données de shadow mode validées.

---

## Tests de non-régression

### Ce qu'il faut protéger

Le moteur V1 a été validé sur des données réelles (REAL_001–004, Phase 4 complète).
Les outputs suivants doivent rester identiques après intégration V2 :

| Output à protéger | Source | Test |
|---|---|---|
| `posture` (PASSIVE/BALANCED/ACTIVE) | `profileMatrix()` | Même payload → même posture |
| `confidence_score` | `confidence-score.js` | Même inputs → même score (± 0) |
| Actions autorisées / interdites | `trading-policy.js` | Même payload → mêmes listes |
| Statut de validation | `applyValidation()` | Même inputs → même statut |
| Score de base `baseScore` | `baseEngine()` | Même inputs → même score |

### Protocole de régression minimal

Avant chaque activation d'un feature flag V2 :

1. Prendre 3 snapshots de référence depuis le panneau Mémoire (sessions V1 existantes).
2. Activer le flag V2 cible.
3. Soumettre exactement les mêmes valeurs de formulaire que les 3 snapshots de référence.
4. Vérifier que posture, confidence_score, et actions autorisées/interdites sont identiques.
5. Si une valeur diffère → rollback immédiat + investigation.

### Absence de test automatisé

Le moteur est client-side, sans environnement de test automatisé. Le protocole
de régression est donc manuel et documenté dans ce fichier. Cela constitue une
limite de la stratégie V0 — D-IMPL-01 (dette ouverte, voir § Dettes).

---

## Rollback

### Rollback par désactivation de flag (rollback normal)

Le rollback standard ne nécessite pas de modification de code — uniquement de remettre
les feature flags à `false`.

```javascript
// rollback total V2 — une ligne dans flags.js
V2_ENABLED: false,
```

Ce rollback est instantané au prochain rechargement de page. Il n'affecte pas :
- Les données localStorage existantes
- L'historique des snapshots V1
- Le comportement du moteur V1

### Rollback par suppression du branchement (rollback d'urgence)

Si une corruption de l'état de l'application est suspectée et que le flag seul
ne suffit pas, le rollback d'urgence consiste à retirer les deux lignes de
branchement ajoutées dans `moteur.js` et `render.js`.

Ce rollback ramène le code à son état V1 exact, sans aucune trace de V2 dans
l'exécution.

### Ce que le rollback ne fait pas

Le rollback ne supprime pas le répertoire `src/js/v2/`. Les fichiers restent
présents mais inactifs. Aucune donnée opérateur n'est perdue.

Le rollback ne vide pas le buffer `calibrationBuffer` si celui-ci est actif —
les snapshots en mémoire restent jusqu'au rechargement.

### Rollback partiel

Il est possible de désactiver uniquement un composant V2 tout en gardant les
autres actifs. Exemple : désactiver `V2_COCKPIT_MESSAGE` sans désactiver
`V2_CALIBRATION` continue de capturer des snapshots en shadow mode.

---

## Critères d'activation production

Un composant V2 passe en "activation cockpit" quand tous les critères suivants
sont remplis simultanément.

### Critères globaux (tout composant)

| Critère | Condition |
|---|---|
| Zéro régression V1 | Protocole de régression passé sur 3 snapshots de référence |
| Shadow mode validé | Volume minimal de sessions shadow mode atteint (voir § shadow mode) |
| Pas de cascade de bugs ouverts | Aucune anomalie non résolue sur les composants dépendants |

### Critères spécifiques par composant

**Couche cohérence — activation shadow mode (Phase 1)**
- TensionMap non null sur au moins 5 soumissions terrain distinctes
- T1 détecté au moins une fois sur données réelles
- Aucune T4 déclenchée à tort sur des sessions équilibrées

**Hiérarchie — activation shadow mode (Phase 2)**
- HierarchyResult winner déterministe sur les mêmes inputs (idempotence)
- Ordre T3>T1>T2>T4 vérifié sur un cas de coexistence réel

**Gestion de l'attention — activation shadow mode (Phase 3)**
- Gate should_expose fonctionne : une tension exposée en cycle N est supprimée en N+1
- AttentionState se réinitialise correctement au rechargement de page

**Explicabilité — activation shadow mode (Phase 4)**
- Templates T1–T4 produisent des messages cohérents sur données réelles
- Aucun message vide ou tronqué
- Lisibilité qualitative validée par lecture directe des messages dans le Debug

**Activation cockpit (Phase 5) — par type de tension**

| Type | Critère spécifique |
|---|---|
| T1 | Seuils X et Y calibrés via test V0 (D-COH-01 résolu) |
| T3 | 10 sessions shadow mode sans faux positif observé |
| T2 | T1 et T3 stables en cockpit depuis 5 sessions minimum |
| T4 | Seuils T4 calibrés via test V0 (D-COH-01 résolu) + T1/T2/T3 stables |

### Critère de blocage absolu

Si le test V0 identifie que le cockpit est **perçu comme perturbant** par les
opérateurs (critère d'arrêt protocole V0), l'activation cockpit est suspendue
indépendamment de l'état des autres critères. Aucun message V2 ne doit modifier
la confiance opérateur dans l'outil.

---

## Dettes identifiées

| Référence | Nature | Bloquante ? |
|---|---|---|
| D-IMPL-01 | Absence de tests automatisés — protocole régression manuel uniquement ; risk : régression non détectée | Non — bloquant à production à grande échelle |
| D-IMPL-02 | Compatibilité payload localStorage — les 50 snapshots historiques ne contiennent pas de champs V2 ; la lecture des anciens snapshots dans le panneau Mémoire doit être gracieuse si V2 est actif | Non — bloquant à activation cockpit |
| D-IMPL-03 | Nomenclature D-MAP-03 — `confidence` vs `confidence_score` doit être résolue avant implémentation V2 pour éviter les bugs silencieux dans la couche cohérence | Non — bloquant à Phase 1 |
| D-IMPL-04 | Mobile — l'architecture V2 suppose un navigateur desktop ; AttentionState (in-memory) peut se comporter différemment selon la gestion des onglets mobiles | Non — post-V0 |
| D-IMPL-05 | Ordre d'exécution JavaScript — l'orchestrateur pipeline-v2.js doit être chargé après moteur.js ; l'ordre des imports dans index.html doit être validé | Non — bloquant à Phase 0 |
| D-IMPL-06 | Format de log Debug V2 — les outputs V2 dans le Debug doivent être affichés de façon lisible sans surcharger l'affichage existant ; format à définir lors de l'implémentation | Non |

---

## Statut

**Type** : Document de stratégie technique V2.
**Périmètre** : Migration incrémentale, feature flags, ordre d'implémentation, protection V1.
**Aucune implémentation immédiate.**
**Aucune modification moteur.**

Ce document est la référence opérationnelle avant toute implémentation V2. Il doit
être relu avant chaque phase d'implémentation. Les critères d'activation sont
contraignants — aucun raccourci ne justifie de passer une phase en activation
cockpit sans avoir rempli les critères documentés.

**Résumé des décisions structurelles :**
- V2 se branche à un seul point : après `buildPayload()`, avant `render.js`
- Deux modifications de fichiers existants uniquement : `moteur.js` + `render.js` (chirurgicales)
- Feature flags indépendants par composant — rollback = désactiver les flags
- Shadow mode obligatoire avant toute activation cockpit
- Activation cockpit par type de tension (T1 → T3 → T2 → T4), pas en bloc
- Zéro régression V1 = condition non négociable à chaque phase
