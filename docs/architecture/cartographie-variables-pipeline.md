# Cartographie des variables — pipeline Caméléon Engine

## Métadonnées

**Statut** : Document de référence technique · Aucune implémentation immédiate
**Version** : 1.0 — 2026-05-24
**Dépendances** :
- `docs/architecture/couche-coherence-inter-modules.md`
- `docs/architecture/hierarchie-des-tensions.md`
- `docs/architecture/explicabilite-sobre.md`
- `docs/architecture/gestion-attention.md`
- `docs/architecture/instrumentation-debug-calibration.md`

---

## Point de départ

L'architecture V2 repose sur une circulation contrôlée des variables entre composants.
Chaque composant produit des outputs consommés par les suivants selon des contrats
d'interface explicites. Tant que ces contrats sont documentés, l'architecture est
prévisible. Quand ils ne le sont pas, des dépendances implicites apparaissent.

**Le problème des dépendances implicites** : une variable consommée par un composant
qui n'est pas son consommateur déclaré crée un couplage invisible. Ce couplage ne
casse pas le moteur immédiatement — il le fragilise silencieusement. Une modification
d'un module upstream affecte un module downstream sans que la dépendance soit visible
dans l'architecture documentée.

**La nécessité d'une source de vérité technique** : chaque variable doit avoir un
producteur unique et des consommateurs déclarés. Si une variable est modifiée par
deux modules distincts, il n'existe plus de source de vérité — le comportement du
système devient non déterministe selon l'ordre d'exécution.

**Architecture logique vs pipeline réel runtime** : ce document cartographie les flux
tels qu'ils doivent être structurés, pas nécessairement tels qu'ils sont implémentés
dans `render.js` à ce jour. L'implémentation actuelle est V1 — ce document prépare V2.
Les écarts entre la cartographie et le code existant constituent des dettes techniques
(voir § Dettes identifiées).

---

## Ce que cette cartographie n'est pas

**Pas une documentation ligne par ligne.** Ce document ne liste pas les variables
JavaScript de chaque fichier. Il cartographie les variables structurellement significatives
dans la pipeline — celles qui sont produites par un composant et consommées par un autre.

**Pas un dump de payload complet.** L'objet final produit par `buildPayload()` contient
de nombreux champs. Ce document ne les documente pas tous — uniquement ceux qui
participent aux flux V2 ou aux contrats d'interface des composants architecturaux.

**Pas une spec API.** Il n'existe pas d'API externe. Ce document ne définit pas de
contrat d'interface vers l'extérieur — uniquement les contrats internes entre composants.

**Pas un diagramme UML exhaustif.** La cartographie est textuelle et tabulaire.
Elle vise la lisibilité, pas l'exhaustivité formelle.

**Pas une documentation backend.** Le moteur est client-side uniquement. Il n'existe
pas de couche serveur à documenter.

**Pas une cartographie DOM/UI.** Ce document ne décrit pas la structure HTML,
les sélecteurs CSS, ni les éléments de rendu. Il décrit les données, pas leur
présentation.

---

## Principes structurels

**P1 — Source unique de vérité.**
Chaque variable est produite par exactement un composant. Aucune variable ne peut
être modifiée par deux composants distincts. Si une transformation est nécessaire,
elle produit une nouvelle variable — elle ne modifie pas la variable source.

**P2 — Transformations explicites uniquement.**
Un composant qui consomme une variable et en produit une dérivée doit documenter
cette transformation. Les transformations implicites (copie silencieuse, lecture
d'un état global) sont interdites dans l'architecture V2.

**P3 — Interdiction des dépendances implicites.**
Un composant ne peut consommer que des variables déclarées dans ses contrats d'entrée.
Lire un état global non déclaré, accéder à un localStorage sans contrat, ou référencer
une variable d'un autre module sans injection explicite constitue une dépendance implicite.

**P4 — Séparation cockpit / debug.**
Aucune variable de la couche debug ou de calibration ne peut apparaître dans le cockpit.
Aucune variable du cockpit ne peut dépendre d'un état debug. Les deux surfaces sont
architecturalement étanches.

**P5 — Séparation runtime / persisté.**
Les variables runtime (calculées à chaque soumission) et les variables persistées
(localStorage ou mémoire stable de session) ne peuvent pas être lues de façon
interchangeable. Une variable runtime ne doit pas être lue depuis un état persisté
du cycle précédent sauf si ce comportement est documenté comme intentionnel.

**P6 — Séparation moteur / UI.**
Les variables produites par le moteur sont consommées par l'UI. L'inverse est interdit :
l'UI ne produit pas de variables consommées par le moteur. Les inputs opérateur (formulaire)
sont l'unique point d'entrée du moteur depuis la surface utilisateur.

---

## Pipeline global V2

Vue macro de la pipeline complète V2, de la soumission opérateur au rendu cockpit.

```
[FORMULAIRE OPÉRATEUR]
  16 champs dont engagement_declared, MdS, QdR, DMU
  → état formulaire (state.js)

[PIPELINE MOTEUR V1]
  mapLegacyMarketState()     → state:modifier string
  baseEngine()               → baseScore (0–100) + signaux attack/sniper
  profileMatrix()            → posture (PASSIVE/BALANCED/ACTIVE)
  applyAdaptiveFilter()      → score modulé
  applyValidation()          → statut validation
  computeTradingPolicy()     → actions autorisées/interdites
  buildPayload()             → payload courant

[COUCHE COHÉRENCE INTER-MODULES]  ← V2
  lecture : confidence_score, posture, MdS, QdR, DMU,
            engagement_declared, profil comportemental (getter)
  produit : tensionMap { tensions[], active_exposed, noise_level }

[HIÉRARCHIE DES TENSIONS]  ← V2
  lecture : tensionMap
  produit : HierarchyResult { winner, absorbed[], silent[],
                              escalated[], deescalated[] }

[GESTION DE L'ATTENTION]  ← V2
  lecture : HierarchyResult.winner, AttentionState (interne)
  produit : AttentionResult { should_expose, attention_level,
                              suppressed_winner }
  met à jour : AttentionState (interne)

[COUCHE D'EXPLICABILITÉ SOBRE]  ← V2
  lecture : HierarchyResult.winner (si should_expose = true),
            TensionDetail
  produit : ExpositionResult { message, intention,
                               tension_id, severity, is_blocking }
            ou null

[PAYLOAD FINAL]
  buildPayload() enrichi : payload V1 + tensionMap + ExpositionResult

        ↓                           ↓
  [COCKPIT]                  [DEBUG / INSTRUMENTATION]
  message ExpositionResult   scores bruts, posture, confidence
  posture, actions           breakdown, tensionMap complet,
  aucune variable brute      AttentionState, CalibrationSnapshot

                                     ↓
                             [CALIBRATION BUFFER]
                             CalibrationSnapshot[]
                             export JSON ponctuel
```

**Points de bifurcation :**

- Après `HierarchyResult` : bifurcation gestion-attention (gate) vs debug (accès direct).
- Après `AttentionResult` : bifurcation explicabilité (si should_expose = true) vs null (silence).
- Après `ExpositionResult` : bifurcation cockpit (message uniquement) vs debug (tous champs).
- Après pipeline complète : capture CalibrationSnapshot (debug, invisible cockpit).

**Dépendances autorisées par étape :**

| Étape | Peut lire | Ne peut pas lire |
|---|---|---|
| Couche cohérence | Outputs moteur V1, inputs formulaire, getter comportemental | AttentionState, ExpositionResult, CalibrationSnapshot |
| Hiérarchie | tensionMap uniquement | Outputs moteur V1 directs, inputs formulaire |
| Gestion attention | HierarchyResult.winner, AttentionState interne | tensionMap, ExpositionResult |
| Explicabilité | HierarchyResult.winner (via AttentionResult) | AttentionState, tensionMap brut |
| Cockpit | ExpositionResult.message, payload V1 | tensionMap brut, AttentionState, CalibrationSnapshot |
| Debug | Tout — surface de lecture complète | Aucune restriction en lecture |

---

## Classification des variables

Les variables du pipeline appartiennent à dix familles selon leur rôle et leur cycle de vie.

| Famille | Description | Exemples |
|---|---|---|
| **Input opérateur** | Champs soumis via le formulaire — origine externe, non transformée par le moteur | `engagement_declared`, `MdS`, `QdR`, `DMU`, tendance, structure, volatilité |
| **Variables moteur runtime** | Produites par le pipeline V1 à chaque soumission — valeur uniquement pour le cycle courant | `baseScore`, `posture`, `confidence_score`, `tradingPolicy` |
| **Variables premium** | Qualificateurs premium déclarés par l'opérateur — subset des inputs opérateur | `MdS`, `QdR`, `DMU`, `RD` |
| **Variables tensions** | Produites par la couche de cohérence et la hiérarchie — existence uniquement en V2 | `tensionMap`, `TensionDetail`, `HierarchyResult`, `winner` |
| **Variables attention** | État interne et output de la gestion de l'attention — uniquement en mémoire de session | `AttentionState`, `AttentionResult`, `attention_level`, `should_expose` |
| **Variables explicabilité** | Output de la couche d'explicabilité sobre — seule forme autorisée en cockpit | `ExpositionResult`, `message`, `intention`, `severity`, `is_blocking` |
| **Variables cockpit** | Variables effectives visibles dans la surface opérateur | `posture` (label), `ExpositionResult.message`, actions autorisées/interdites |
| **Variables debug/calibration** | Variables visibles uniquement dans le panel Debug ou dans les exports | `baseScore` brut, `tensionMap`, `AttentionState`, `CalibrationSnapshot` |
| **Variables persistées** | Variables qui survivent au rechargement via localStorage | État formulaire, historique snapshots (cap 50), settings utilisateur |
| **Variables temporaires** | Variables de calcul intermédiaire disparaissant après le cycle | Scores d'axe confidence, `state:modifier`, variables locales pipeline |

---

## Source de vérité par famille

| Variable | Source unique | Consommateurs | Cockpit | Debug | Persistée |
|---|---|---|---|---|---|
| `confidence_score` | `confidence-score.js` | Couche cohérence (T1), payload, CalibrationSnapshot | Non — uniquement breakdown | Oui | Non |
| `posture` | `engine.js` → `profileMatrix()` | `computeTradingPolicy()`, couche cohérence (T2/T3), CalibrationSnapshot | Oui — label uniquement | Oui | Non |
| `engagement_declared` | Formulaire opérateur | Couche cohérence (T3 delta), CalibrationSnapshot | Non | Oui (via snapshot) | Oui (état formulaire) |
| `MdS` | Formulaire opérateur | Couche cohérence (T1, T4), CalibrationSnapshot | Non — sauf via message T1/T4 | Oui (via snapshot) | Oui (état formulaire) |
| `QdR` | Formulaire opérateur | Couche cohérence (T4), CalibrationSnapshot | Non — sauf via message T4 | Oui (via snapshot) | Oui (état formulaire) |
| `DMU` | Formulaire opérateur | Couche cohérence (T1), CalibrationSnapshot | Non — sauf via message T1 | Oui (via snapshot) | Oui (état formulaire) |
| `tensionMap` | Couche de cohérence inter-modules | Hiérarchie des tensions | Non | Oui | Non |
| `winner` | Hiérarchie → `HierarchyResult` | Gestion attention, explicabilité (si should_expose), CalibrationSnapshot | Non — jamais directement | Oui | Non |
| `attention_level` | Gestion de l'attention → `AttentionState` | `AttentionResult`, CalibrationSnapshot | Non | Oui | Non |
| `should_expose` | Gestion de l'attention → `AttentionResult` | Couche explicabilité (gate), CalibrationSnapshot | Non | Oui | Non |
| `ExpositionResult` | Couche d'explicabilité sobre | `render.js` (cockpit) | `message` uniquement | Tous champs | Non |
| `CalibrationSnapshot` | Couche d'instrumentation (post-pipeline) | `calibrationBuffer` (in-memory), export JSON | Jamais | Compteur + export | Non — in-memory |
| `baseScore` | `engine.js` → `baseEngine()` | `profileMatrix()`, `buildPayload()`, debug | Non | Oui | Non |
| `tradingPolicy` | `trading-policy.js` | `buildPayload()`, cockpit (actions) | Oui — listes autorisé/interdit | Oui | Non |
| `AttentionState` | Gestion de l'attention (interne) | Propre couche uniquement | Non | Oui | Non — in-memory |

---

## Variables runtime vs persistées

### Variables vivant uniquement en mémoire vive

Ces variables n'ont aucune persistance. Elles sont recalculées à chaque soumission
ou réinitialisées au rechargement de page.

| Variable | Raison de la non-persistance |
|---|---|
| `baseScore`, `posture`, `confidence_score` | Recalculés à chaque soumission — la persistance crée un état obsolète |
| `tensionMap`, `HierarchyResult`, `winner` | Valides uniquement pour le cycle courant |
| `AttentionState` | Réinitialisé au rechargement par conception (doctrine instrumentation) |
| `ExpositionResult` | Valide uniquement pour le cycle courant — disparition silencieuse si winner = null |
| `CalibrationSnapshot[]` | Buffer in-memory uniquement — export manuel comme seule persistance |
| `tradingPolicy` | Recalculée à chaque soumission |

### Variables pouvant être persistées

Ces variables ont une persistance légitime via localStorage ou état de session stable.

| Variable | Mécanisme | Justification |
|---|---|---|
| État formulaire complet (16 champs dont `MdS`, `QdR`, `DMU`, `engagement_declared`) | localStorage | Confort opérateur — reprise de session |
| Historique snapshots moteur (cap 50) | localStorage | Panneau Mémoire — traçabilité décisions |
| Settings utilisateur | localStorage | Préférences d'interface |
| Profil comportemental (module comportemental) | In-memory stable de session | Calculé une fois depuis CSV — ne change pas dans la session |

### Variables ne devant jamais être persistées

| Variable | Raison |
|---|---|
| `AttentionState` | Réinitialisation au rechargement = comportement intentionnel |
| `CalibrationSnapshot[]` | La persistance créerait une surveillance implicite — contraire à la doctrine |
| `tensionMap`, `HierarchyResult` | Données de cycle courant — sans valeur inter-session |
| `ExpositionResult` | Sans sens hors du cycle qui l'a produit |
| Tout état de la couche debug | Le debug est une surface auxiliaire temporaire |

---

## Variables cockpit

Le cockpit est la surface stabilisée visible par l'opérateur. Son contenu est contraint
par la doctrine du silence structurel et les principes P4 et P6.

### Ce qui peut apparaître dans le cockpit

| Élément | Source | Forme autorisée |
|---|---|---|
| Posture | `profileMatrix()` | Label catégoriel uniquement (PASSIVE / BALANCED / ACTIVE) |
| Actions autorisées / interdites | `tradingPolicy` | Liste de labels — pas de scores |
| Message de tension | `ExpositionResult.message` | Chaîne de caractères finalisée uniquement — pas les autres champs |
| Statut de validation | `applyValidation()` | Label statut uniquement |
| Historique décisions | localStorage cap 50 | Snapshots passés — pas d'état runtime courant |

### Ce qui ne doit jamais apparaître dans le cockpit

| Élément | Raison |
|---|---|
| `baseScore` numérique brut | Variable intermédiaire non contextualisée — viole P6 |
| `confidence_score` brut | Le breakdown est disponible dans le Debug — le chiffre brut sans contexte est ambigu |
| `tensionMap` ou `HierarchyResult` | Données internes non destinées à l'opérateur |
| `attention_level`, `should_expose` | Variables internes de la couche attention |
| `winner` ou tout `TensionId` | Toujours via `ExpositionResult.message` — jamais directement |
| Compteur de snapshots ou état du buffer | Variables de calibration — violation du contrat cockpit/debug |
| Scores de sous-modules (axes confidence) | Variables temporaires de calcul |

### Dépendances autorisées pour le cockpit

Le cockpit (`render.js`) peut lire :
- Le payload final produit par `buildPayload()`
- `ExpositionResult` (uniquement le champ `message` et `is_blocking`)
- L'historique localStorage (panneau Mémoire)

Le cockpit ne peut pas lire directement :
- `AttentionState`, `AttentionResult`
- `tensionMap`, `HierarchyResult`
- `calibrationBuffer`
- Tout état interne d'un module non exposé dans le payload

---

## Variables debug / calibration

Le panel Debug est la surface auxiliaire réservée au développeur et au calibrateur.
Son contenu est riche et non contraint par les règles du cockpit.

### Surfaces autorisées

Le panel Debug peut afficher toute variable produite par la pipeline, sans restriction
de forme. C'est sa fonction : exposition complète pour l'inspection technique.

### Variables visibles dans le panel Debug

| Variable | Forme | Finalité |
|---|---|---|
| `baseScore` | Numérique brut | Inspection score moteur |
| `confidence_score` + breakdown par axe | Numérique + décomposition | Calibration T1 |
| `posture` | Label + score intermédiaire | Inspection profileMatrix |
| `tensionMap` complet | Structure JSON | Inspection tensions détectées |
| `HierarchyResult` | Structure JSON | Inspection hiérarchie |
| `AttentionState` | Structure JSON | Inspection état attention |
| `AttentionResult` (dont `suppressed_winner`) | Structure JSON | Inspection gate |
| `ExpositionResult` complet (tous champs) | Structure JSON | Inspection formulation |
| Compteur `calibrationBuffer` | Numérique | État buffer calibration |
| Bouton export JSON | Action | Déclenchement export ponctuel |

### Variables cachées — non exposées même dans le Debug

| Variable | Raison |
|---|---|
| Identité ou identifiant opérateur | N'existe pas dans l'architecture |
| Données personnelles ou financières | Hors périmètre du moteur |
| Clés localStorage brutes non structurées | Accès direct localStorage hors contrat |

### Exportables

Uniquement `CalibrationSnapshot[]` via le bouton export JSON.
Aucune autre variable n'est exportable de façon structurée dans V0.
Les autres variables du panel Debug sont consultables à l'écran mais non exportées
automatiquement.

### Séparation cockpit / debug — rappel

Aucun état du panel Debug ne modifie le cockpit.
Fermer, ouvrir, ou supprimer le panel Debug ne change pas le comportement du moteur.
Le panel Debug est une fenêtre de lecture, pas un point de contrôle.

---

## Flux interdits

Ces flux sont interdits dans l'architecture V2. Leur présence dans une implémentation
constitue une violation architecturale à corriger.

| Flux interdit | Exemple de violation | Pourquoi interdit |
|---|---|---|
| **Cockpit → Debug** | `render.js` lit un compteur du panel Debug pour décider d'un affichage cockpit | Viole P4 — le cockpit ne dépend pas du debug |
| **Debug → Cockpit** | Le panel Debug écrit une variable qui modifie un rendu cockpit | Viole P4 — les surfaces sont étanches |
| **Tension brute → Cockpit** | `winner` ou `TensionId` affiché directement dans le cockpit sans passer par l'explicabilité | Viole la doctrine — toute exposition passe par la formulation sobre |
| **AttentionState → Cockpit** | `attention_level` ou `expositions_window` affiché dans le cockpit | Viole P4 — état interne de la couche attention invisible pour l'opérateur |
| **Calibration → Logique moteur** | `calibrationBuffer` lu par un module pour modifier un calcul | Viole P6 — l'instrumentation n'influence pas la pipeline |
| **Instrumentation → Pipeline** | La capture d'un snapshot provoque un recalcul ou modifie un état moteur | Viole P2 — l'observation ne transforme pas |
| **Module comportemental → Émission** | Le module comportemental émet un événement global consommé par un autre module | Viole le contrat d'isolation du module comportemental |
| **UI → Payload** | `render.js` modifie directement un champ du payload avant affichage | Viole P6 — le moteur produit le payload, l'UI le consomme |
| **Variable multi-source** | `posture` modifiée à la fois par `profileMatrix()` et par un filtre UI | Viole P1 — source unique de vérité |

---

## Points de capture instrumentation

Le `CalibrationSnapshot` est capturé à un point unique et précis dans la pipeline.

**Position de capture** : après l'exécution complète de tous les composants V2 disponibles,
avant le rendu cockpit.

```
buildPayload()                    ← toutes variables V1 disponibles
  + couche cohérence              ← tensionMap disponible
  + hiérarchie                    ← HierarchyResult disponible
  + gestion attention             ← AttentionResult disponible
  + explicabilité                 ← ExpositionResult disponible
  ↓
[CAPTURE CalibrationSnapshot]     ← ICI — toutes variables accessibles
  ↓
render.js (cockpit + debug)
```

**Pourquoi à ce point** :
- Toutes les variables du snapshot sont calculées et stables.
- Aucune transformation ultérieure ne modifie les valeurs.
- La capture est post-moteur, pré-rendu — elle n'affecte ni le calcul ni l'affichage.

**Contraintes d'ordre** :
- La capture ne peut pas être réalisée avant que `AttentionResult` soit disponible
  (`should_expose` serait absent ou incorrect).
- La capture ne peut pas être réalisée après le rendu — elle doit capturer l'état
  du cycle courant, pas un état potentiellement modifié par une interaction UI.

**Ce que la capture ne fait pas** :
- Elle ne modifie aucun état du moteur.
- Elle n'effectue aucun calcul supplémentaire.
- Elle ne déclenche aucun rendu.
- Elle ne lit aucune variable depuis localStorage.

---

## Contrats d'interface critiques

Ces contrats définissent le rôle, le producteur, les consommateurs et les contraintes
de chaque structure d'interface critique. Ils ne définissent pas l'implémentation.

### `buildPayload()`

**Rôle** : agrège les outputs du pipeline V1 en un objet de décision structuré.
**Producteur** : `engine.js`
**Consommateurs** : `render.js` (cockpit), couche cohérence (lecture des outputs V1)
**Contraintes** : ne modifie pas les valeurs — agrège uniquement. En V2, enrichi
avec `tensionMap` et `ExpositionResult` sans modifier les outputs V1.

### `HierarchyResult`

**Rôle** : output de la hiérarchie des tensions — winner sélectionné + tensions absorbées.
**Producteur** : hiérarchie des tensions
**Consommateurs** : gestion de l'attention (lecture `winner`), debug
**Contraintes** : immutable après production. La gestion de l'attention ne modifie
pas `HierarchyResult` — elle produit un `AttentionResult` séparé.

### `ExpositionResult`

**Rôle** : formulation finale de la tension à exposer — seule forme autorisée en cockpit.
**Producteur** : couche d'explicabilité sobre
**Consommateurs** : `render.js` (cockpit — `message` uniquement), debug (tous champs)
**Contraintes** : `render.js` ne peut lire que `message` et `is_blocking`. Les champs
`intention`, `severity`, `tension_id` sont réservés au debug et à la couche de rendering.

### `AttentionResult`

**Rôle** : décision gate de la gestion de l'attention — should_expose + état attention.
**Producteur** : gestion de l'attention
**Consommateurs** : couche explicabilité (gate `should_expose`), CalibrationSnapshot, debug
**Contraintes** : `suppressed_winner` n'est jamais transmis à l'explicabilité ni au cockpit.

### `CalibrationSnapshot`

**Rôle** : capture d'état post-pipeline pour la calibration terrain V0.
**Producteur** : couche d'instrumentation (post-pipeline, pré-rendu)
**Consommateurs** : `calibrationBuffer` (in-memory), export JSON
**Contraintes** : aucune dépendance vers le moteur — lecture uniquement. Jamais transmis
au cockpit. Jamais persisté en localStorage.

---

## Risques architecturaux

**Duplication de variable.**
Une même donnée calculée sous deux noms différents dans deux modules distincts.
Exemple : `confidence` dans un module, `confidenceScore` dans un autre, représentant
la même valeur. Les deux divergent progressivement.
Garde-fou : P1 (source unique). Toute variable doit avoir un nom canonique.
Les alias sont interdits sauf documentation explicite.

**Dérive de source de vérité.**
Un consommateur commence à lire une variable depuis un état mis en cache (localStorage,
variable globale) plutôt que depuis sa source déclarée. La valeur peut être obsolète
d'un cycle.
Garde-fou : P5. Distinguer explicitement runtime vs persisté. Les variables runtime
ne sont jamais lues depuis le persisté sauf contrat documenté.

**Fuite debug vers cockpit.**
Un développeur ajoute un affichage de debug "temporaire" dans le cockpit qui n'est
jamais retiré. La surface cockpit accumule des variables techniques non destinées
à l'opérateur.
Garde-fou : P4. Revue de code systématique sur toute modification de `render.js`
touchant aux sections cockpit (non-debug).

**Dépendance implicite.**
Un module lit `window.someState` ou une variable globale non déclarée dans ses inputs.
Ce couplage est invisible dans l'architecture documentée.
Garde-fou : P3 + D-MAP-01 (audit des dépendances implicites existantes dans `engine.js`).

**Variables zombie.**
Des variables calculées dans la pipeline V1 qui ne sont plus consommées mais qui
continuent d'être produites à chaque cycle. Elles alourdissent le payload sans valeur.
Garde-fou : D-MAP-02 (audit variables legacy). Chaque variable du payload doit avoir
au moins un consommateur documenté.

**Variables persistées abusivement.**
Des variables runtime persistées en localStorage par commodité — pour éviter un recalcul
au rechargement. Cela crée des états obsolètes non détectables.
Garde-fou : P5. Seules les variables explicitement listées comme "persistables" dans
ce document peuvent être écrites en localStorage.

**Couplage UI / moteur.**
`render.js` effectue un calcul qui devrait être dans le moteur, ou le moteur lit
un état DOM. Les deux couches deviennent interdépendantes.
Garde-fou : P6. `render.js` consomme uniquement le payload final. Aucun calcul
moteur dans le code de rendu.

---

## Dettes identifiées

| Référence | Nature | Bloquante ? |
|---|---|---|
| D-MAP-01 | Audit des dépendances implicites dans `engine.js` — variables globales, lectures localStorage non déclarées, couplages non documentés | Non — bloquant à l'implémentation V2 |
| D-MAP-02 | Variables legacy dans le payload V1 — certains champs de `buildPayload()` peuvent être des vestiges non consommés ; audit avant intégration V2 | Non |
| D-MAP-03 | Nomenclature incohérente — `confidence` vs `confidenceScore` vs `confidence_score` selon les modules ; unification avant implémentation V2 | Non — bloquant à l'implémentation |
| D-MAP-04 | Structure exacte du payload historique localStorage — les 50 snapshots cap stockent quels champs ? ; vérifier cohérence avec la cartographie | Non |
| D-MAP-05 | Divergence mobile / desktop éventuelle — si le moteur est utilisé sur mobile, des variables d'état peuvent se comporter différemment selon les capacités du navigateur | Non — post-V0 |
| D-MAP-06 | Cartographie future si backend introduit — l'architecture est client-side uniquement ; si un backend est ajouté après V0, la cartographie doit être révisée pour les variables transmises / reçues | Non — conditionnel |

---

## Statut

**Type** : Document de référence technique V2.
**Périmètre** : Cartographie des variables et des flux — pipeline complet.
**Aucune implémentation immédiate.**
**Aucune modification moteur.**

Ce document est une cartographie vivante. Il doit être maintenu synchronisé avec
toute évolution du pipeline — ajout d'un composant V2, modification d'un contrat
d'interface, résolution d'une dette D-MAP.

**Contraintes doctrinales absolues :**

Le cockpit reste une surface stabilisée — aucune variable brute non contextualisée
ne peut y apparaître. Toute exposition utilisateur d'une tension passe par
l'explicabilité sobre. Le debug reste une couche parasite contrôlée, invisible
pour l'opérateur. Une variable ne doit jamais avoir plusieurs sources de vérité —
toute ambiguïté sur la source d'une variable est une dette architecturale à traiter
avant l'implémentation.
