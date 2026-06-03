# Caméléon Engine — Architecture Produit Officielle

**Commit de référence :** `6c3f6fd` — 2026-06-03
**Nomenclature états comportementaux :** `aacfad1` — 2026-06-03
**Statut :** document doctrinal produit · aucun code · aucun design

---

## 0. Ordre de construction

L'ordre est définitif. Aucune couche supérieure ne commande une couche inférieure.

```
1. Moteur       — calculer
2. Référents    — nommer
3. Observabilité — lire dans le temps
4. Surfaces     — rendre accessible
5. Expression   — traduire en sensoriel
6. Narration    — donner du sens
```

Un chantier appartenant à une couche supérieure (ex. Expression) ne peut pas être ouvert avant que les couches inférieures concernées soient stables et validées terrain.

## 1. État réel du moteur

Source de vérité : `docs/architecture/canonical_motor_state_2026.md` (commit `6c3f6fd`).

### Stable et en production

- Pipeline 8 étapes : Form Input → `mapLegacyMarketState` → `baseEngine` → `profileMatrix` → `applyAdaptiveFilter` → `applyValidation` → `computeTradingPolicy` → `buildPayload` → `render.js`
- 5 états comportementaux alignés (`aacfad1`) : **Ancré / Veille Active / Friction / Dérive / Rupture**
- Guard instantané avec effets réels sur payload (niveaux 4 et 5)
- Pipeline V2 actif, T3 visible en cockpit (6 flags — `V2_CALIBRATION: false`)
- Import CSV/XLSX comportemental (`behavior/`)
- `friction.js` : mécanisme UX stateless sur 3 boutons

### Connecté

| Composant | Chemin réel | Nature de la connexion |
|-----------|-------------|----------------------|
| Guard instantané | `engine.js` → `payload.behavior.overtradingLevel` → `render.js` | Effets moteur + affichage |
| V2 T3 | `buildPayload()` → `pipeline-v2.js` → `payload.v2.expositionResult` → `#v2MessageBlock` | Affichage cockpit |
| Historical guard | `behavior-view.js` → localStorage → `render.js` Math.max | Affichage uniquement — pas d'effets moteur |
| `friction.js` | `render.js:29` import → boutons snapshot / attack / sniper | UX délai cognitif |

### Existe mais isolé

- `behavior-bridge.js` : pont structuré prêt, commentaire `FUTURE INTEGRATION`, non transmis à `buildPayload()`
- `ux-state.js` : produit `CALM / TENSION / DRIFT / DANGER` — système parallèle à l'échelle 1–5, non unifié
- `detectBehaviorDrift()` (`render.js:2330`) : troisième système de lecture comportementale, parallèle aux deux autres
- `behavior-matrix.js` : dictionnaire complet, non appelé en production
- V2 T1 / T2 / T4 : calculés en shadow mode, filtrés, non visibles

### Futur uniquement

- `behavior-bridge` → `buildPayload()` merge (décision architecture + terrain V0)
- V2 Phase 3 (≥ 10 opérateurs réels)
- Unification des trois systèmes comportementaux parallèles

### Ce qui ne doit pas être considéré comme réel

- Le Constellium comme couche commandant le moteur
- Les images et vidéos comme référents d'état moteur
- Les archétypes visuels comme états calculés
- Toute couche narrative comme input du pipeline

## 2. Architecture en 6 couches

### Couche 1 — Moteur (souverain)

**Rôle :** calculer une décision structurée à partir d'observations formalisées. Produire un payload.

**Contenu réel :** `engine.js` · `decision.js` · `trading-policy.js` · `market-state.js` · `confidence-score.js` · `moteur.js`

**Ne doit jamais :**
- recevoir un input depuis une couche supérieure
- être conditionné par un archétype visuel ou une intention narrative
- avoir sa logique dans `render.js`

**Dépendances :** consulte la Couche 2 pour les étiquettes de référents. Aucune autre dépendance descendante.

---

### Couche 2 — Référents

**Rôle :** donner un nom stable et canonique à ce que le moteur produit. Constituer le vocabulaire partagé de tout le système.

**Contenu réel :** `overtrading-dictionary.js` (5 états canoniques) · `data.js` (constantes, labels, presets) · `decision.js` (table state:modifier → posture + actions) · `behavior-matrix.js` (patterns analytiques par niveau)

**Ne doit jamais :**
- être modifié pour s'aligner sur des archétypes visuels ou des décisions esthétiques
- accueillir de nouveaux états sans signal terrain confirmé
- diverger entre `overtrading-dictionary.js` et `behavior-matrix.js`

**Dépendances :** alimentée par Couche 1, consultée par Couches 3 et 4. Couche 5 lit ses niveaux entiers — ne les réécrit pas.

---

### Couche 3 — Observabilité

**Rôle :** lire dans le temps ce que le moteur a produit. Détecter les patterns. Produire des lectures longitudinales.

**Contenu réel :** `behavior/` (pipeline historique) · `behavior-bridge.js` · `v2/` (coherence, hierarchy, attention, exposition) · `ux-state.js` · `storage.js` · `session-repo.js` · `behavior-repo.js`

**Ne doit jamais :**
- modifier les calculs de la Couche 1
- produire des états contredisant l'échelle canonique (Couche 2)
- être confondue avec la Couche 1 (l'observabilité lit le moteur, elle ne l'est pas)

**Dépendances :** lit la sortie de Couche 1 (payload + localStorage). Alimente Couche 4 en lecture. Trois systèmes parallèles non unifiés aujourd'hui — différé intentionnellement.

---

### Couche 4 — Surfaces produit

**Rôle :** rendre les lectures du moteur accessibles et utilisables. L'opérateur interagit ici.

**Contenu réel :** `render.js` · `index.html` (onglets Moteur / Pilotage / Mémoire + sidebar Comportement) · `behavior-view.js` · `uploader.js`

**Ne doit jamais :**
- contenir de la logique métier (point d'attention : `computeDecisionState()` dans `render.js`)
- piloter le moteur
- être la source de vérité d'un état

**Dépendances :** consomme Couches 1 (payload), 2 (labels), 3 (lectures historiques). Peut appeler Couche 5 pour décoration par niveau entier.

---

### Couche 5 — Expression / Constellium

**Rôle :** traduire les lectures du moteur en langage sensoriel et visuel. Donner une présence incarnée à ce que le moteur calcule.

**Contenu réel :** images overtrading dans `OVERTRADING_DICT` (`imageChameleon`, `imageTrading`) · 6 images Constellium (`assets/images/CONSTELLIUM_VISUALS_Images/`) · 6 vidéos Constellium (`assets/video/CONSTELLIUM_VISUALS_Video/`)

**Ne doit jamais :**
- conditionner le moteur
- nommer les états du moteur
- devenir la source de vérité d'une lecture
- être présentée à l'opérateur comme une instruction analytique

**Dépendances :** lit les niveaux entiers de Couche 2 comme clés d'association. Ne remonte jamais vers Couche 1 ou 2. Sa suppression ne doit jamais casser le moteur — **Couche 5 est toujours optionnelle pour Couche 1**.

---

### Couche 6 — Narration

**Rôle :** donner du sens à l'ensemble. Articuler le pourquoi. Constituer la mémoire doctrinale.

**Contenu réel :** `docs/manifesto-cameleon-engine.md` · onglet Manifeste dans `index.html` · `docs/cognitive/` · `docs/product/` · `docs/architecture/`

**Ne doit jamais :**
- être présentée à l'opérateur comme une instruction moteur
- devenir un input du pipeline
- être confondue avec une spécification technique

**Dépendances :** aucune dépendance vers les couches inférieures. Elle décrit — elle ne commande pas.

## 3. Surfaces produit

### Cockpit / Moteur
**Référents :** posture · actions autorisées/interdites · engagement level · score confiance · état comportemental instantané (Ancré→Rupture) · message V2 T3
**Fonctions moteur :** pipeline complet, `buildPayload()`
**Statut :** réelle aujourd'hui — onglet Moteur (`index.html`)
**Couche :** 4 — produit opérationnel

### Import / Analyse comportementale
**Référents :** score 0–100 · profil (Discipliné / Réactif / Impulsif / Agressif) · patterns détectés · coaching
**Fonctions moteur :** `behavior/` pipeline + `behavior-view.js`
**Statut :** réelle aujourd'hui — sidebar Comportement
**Couche :** 3+4 — observabilité + surface

### Historique / Mémoire
**Référents :** snapshots décisions · évolution du guard comportemental
**Fonctions moteur :** localStorage (50 snapshots) · history panel `render.js`
**Statut :** réelle aujourd'hui — onglets Pilotage / Mémoire
**Couche :** 3+4 — observabilité + surface

### Debug Brain
**Référents :** payload brut · état moteur complet · V2 tensionMap · confidence breakdown
**Fonctions moteur :** lecture directe payload
**Statut :** réel aujourd'hui — panneau togglable, usage interne
**Couche :** 3 — observabilité interne, pas une surface opérateur finale

### Constellium (surface autonome)
**Statut :** prématurée. La couche Expression (images + vidéos) existe dans `assets/`. Il n'y a pas de surface produit autonome pour les accueillir construite depuis les couches inférieures. Ne pas créer avant validation terrain couches 1–4.
**Couche :** 5 — Expression. Pas encore une surface opérationnelle.

### Manifeste
**Contenu :** texte statique dans `index.html` onglet Manifeste
**Statut :** réel aujourd'hui, statique, non interactif
**Couche :** 6 — Narration

## 4. Place du Constellium

### Ce qu'il est

Le Constellium est la **Couche 5 — Expression**. Il traduit des états calculés en présence sensorielle. Il donne une incarnation visuelle à ce que le moteur a déjà dit. Il est en aval du moteur dans la chaîne de causalité — même s'il peut l'entourer visuellement dans la présentation finale.

### Ce qu'il n'est pas

Il n'est pas une couche de commande. Il n'est pas un input du pipeline. Il ne définit pas les états comportementaux — il les illustre après qu'ils aient été calculés. Il n'est pas une surface produit opérationnelle aujourd'hui.

### Où vivent les 6 images et 6 vidéos validées

Dans `assets/images/CONSTELLIUM_VISUALS_Images/` et `assets/video/CONSTELLIUM_VISUALS_Video/`. Sans branchement moteur actif. Sans page autonome. Sans fonction conditionnelle. Leur existence dans le dépôt ne crée pas d'obligation de les intégrer prématurément.

### Trois règles empêchant le Constellium de commander le moteur

**Règle C1 — Les images sont appelées par niveau entier, jamais par état textuel.**
`OVERTRADING_DICT[3].imageChameleon` est correct. Toute référence du type `if (etat === "Friction") { loadImage(...) }` est une violation architecturale. Le moteur produit un entier. Cet entier appelle optionnellement une image.

**Règle C2 — Aucune clé du moteur ne peut être nommée d'après un archétype visuel.**
La direction est toujours : moteur → référent textuel → expression visuelle. Jamais l'inverse. Les noms des 5 états comportementaux (`Ancré`, `Veille Active`, `Friction`, `Dérive`, `Rupture`) ont été établis depuis le moteur réel et la doctrine — pas depuis les images.

**Règle C3 — La suppression de Couche 5 ne doit jamais casser le moteur.**
Couche 5 est toujours optionnelle pour Couche 1. Si toutes les images sont supprimées, le pipeline `buildPayload()` continue de fonctionner sans modification.

### Comment les images et vidéos restent utiles sans devenir des fonctions

Elles accompagnent les lectures comportementales comme renforcement sensoriel. Elles décorent un état calculé. Elles n'ajoutent aucune information que le moteur n'a pas déjà produite. Leur valeur est émotionnelle et mémorielle — pas analytique.

## 5. Priorités

### À faire — moteur

Le moteur est stable. La seule action ouverte est le merge `behavior-bridge` → `buildPayload()`, conditionné par une décision architecture explicite **et** du terrain V0 réel. V2 Phase 3 attend ≥ 10 opérateurs. Ne pas simuler, ne pas forcer.

### À faire — documentation

- Formaliser l'architecture en couches dans ce document ✓
- Mettre à jour la mémoire projet pour clarifier Constellium = Couche 5 Expression
- Documenter les règles C1 / C2 / C3 (Constellium) comme contraintes permanentes

### À faire — UX / surface

Rien de structurel avant signal terrain. Import PDF : priorité B, attend ≥ 5 exports réels. Debug Brain peut exposer les données V2 (dette `V2-DBG`, basse, sans prérequis terrain).

### À faire — Expression / Constellium

Positionner formellement dans la mémoire comme Couche 5. Les 6 images et 6 vidéos restent dans `assets/` sans nouveau branchement. Ne pas créer de page Constellium autonome avant validation terrain couches 1–4.

### À ne pas faire maintenant

- Merger `behavior-bridge` sans données terrain V0
- Activer V2 T1 / T2 / T4 sans calibration V0 (≥ 10 opérateurs)
- Créer de nouvelles surfaces (Macro, Portefeuille, PDF) avant validation des surfaces actuelles
- Positionner le Constellium comme couche de commande du moteur
- Nommer des états moteur d'après des archétypes visuels
- Réintroduire images ou vidéos comme référents de Couche 2
- Ouvrir un chantier code Constellium

## 6. Décisions figées D1–D8

**D1 — Ordre de construction définitif**
Moteur → Référents → Observabilité → Surfaces → Expression → Narration. Aucune couche supérieure ne commande une couche inférieure. Cette règle est architecturale, pas esthétique. Elle s'applique aux chantiers comme aux décisions de nomenclature.

**D2 — Souveraineté de `buildPayload()`**
`buildPayload()` est l'unique source de vérité du moteur. Ni les images, ni les vidéos, ni les archétypes, ni les intentions narratives ne conditionnent son output. Toute modification de la logique moteur passe par `engine.js`, `decision.js` ou `trading-policy.js` — jamais par `render.js`.

**D3 — Constellium = Couche 5, Expression**
Le Constellium exprime le moteur. Il ne le commande pas. Il ne lui précède pas dans la chaîne de causalité. Sa valeur est sensorielle et narrative — pas analytique. Il n'a pas de fonction dans le pipeline. Il devient une surface produit uniquement après validation terrain des couches 1–4.

**D4 — Les 5 états sont les référents canoniques permanents**
`Ancré / Veille Active / Friction / Dérive / Rupture` (commit `aacfad1`). Toute surface, toute expression, toute communication externe s'aligne sur eux. Jamais l'inverse. Aucun archétype visuel ne peut modifier leur nom.

**D5 — Images appelées par niveau entier, jamais par état textuel**
Les images sont associées aux entiers 1–5 dans `OVERTRADING_DICT`. Toute logique conditionnant une image sur un état textuel est une violation architecturale. Règle C1 du §4.

**D6 — `behavior-bridge` merge = décision architecture explicite documentée**
Le merge entre le guardLevel historique et `buildPayload()` n'est pas une optimisation silencieuse. Quand le moment vient, la stratégie (max / weighted average / champ séparé) doit être documentée et validée avant tout commit. Commentaire `FUTURE INTEGRATION` dans `behavior-bridge.js` et `behavior/README.md`.

**D7 — V2 Phase 3 conditionné terrain, non négociable**
Aucun commit sur T1 / T2 / T4 sans données V0 réelles (≥ 10 opérateurs). Les seuils provisoires (`WINDOW_SIZE=5`, `DECLINE_FAST=2`, `DECLINE_FULL=4`) ne deviennent définitifs qu'après mesure terrain.

**D8 — Distinction Friction / friction.js figée**
`Friction` = état comportemental niveau 3 (`overtrading-dictionary.js`). `friction.js` = mécanisme UX de délai cognitif stateless (`src/js/friction.js`). Deux objets distincts, aucun conflit d'exécution, distinction documentée dans `canonical_motor_state_2026.md`. Cette distinction ne sera pas rouverte.

---

*Ce document fige l'architecture produit à partir du moteur réel. Aucune intention. Aucune vision non implémentée.*
