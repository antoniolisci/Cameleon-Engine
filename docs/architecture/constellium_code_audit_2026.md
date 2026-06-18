# Constellium — Audit du Code Réel (2026)

**Date d'audit :** 2026-06-03
**Commit de référence :** `14f3b62`
**Périmètre :** tout ce qui porte le nom "constellium" ou les forces ether/fire/air/earth/water dans le dépôt

---

## 1. Inventaire réel

### 1.1 Variables forces — couche moteur active

Les cinq forces Constellium sont des **champs de formulaire officiels** déclarés dans la couche moteur.

| Variable | Fichier | Rôle |
|----------|---------|------|
| `ether` | `src/js/data.js` lignes 10–14 | Champ formulaire officiel — FORM_FIELDS |
| `fire` | `src/js/data.js` lignes 10–14 | Champ formulaire officiel — FORM_FIELDS |
| `air` | `src/js/data.js` lignes 10–14 | Champ formulaire officiel — FORM_FIELDS |
| `earth` | `src/js/data.js` lignes 10–14 | Champ formulaire officiel — FORM_FIELDS |
| `water` | `src/js/data.js` lignes 10–14 | Champ formulaire officiel — FORM_FIELDS |
| ether/fire/air/earth/water | `src/js/data.js` lignes 119–123 | Valeurs par défaut + présents dans tous les PRESETS |
| ether/fire/air/earth/water | `src/js/engine.js` `computeScore()` | **Inputs de scoring direct** — fire strong→+12, medium→+6, weak→−4 ; air strong→+8, emerging→+4 ; earth strong→+5 ; ether strong→+5 |
| ether/fire/air/earth/water | `src/js/engine.js` ligne 351 | `payload.constellium = {ether, fire, air, earth, water}` dans `buildPayload()` |
| `prefillConstellium(form)` | `src/js/engine.js` lignes 33–40 | Mappe l'état marché vers des valeurs prédéfinies des forces |
| `payload.constellium?.fire` | `src/js/moteur.js` lignes 378–379 | Lu pour recalcul sniper |
| `payload.constellium?.fire` | `src/js/render.js` ligne 612 | `FIRE_MAP[payload.constellium?.fire]` → score volatilité UX |
| `payload.constellium?.earth` | `src/js/render.js` ligne 615 | `.earth === "strong"` → `_earthBonus` |
| `payload.constellium?.fire` | `src/js/render.js` ligne 4623 | Présent dans UX action score |

### 1.2 alignmentNote — narratif dans le moteur

Dans `src/js/engine.js` ligne 425, `buildPayload()` produit :

```js
alignmentNote: "Le marché et la Constellium restent cohérents."
```

Cette chaîne est une formulation narrative générée dans la Couche 1 (Moteur). Elle appartient sémantiquement à la Couche 6 (Narration). Elle est présente dans le payload de sortie.

### 1.3 Navigation et panneau — Couche 4 Surfaces

| Fichier | Localisation | Contenu |
|---------|-------------|---------|
| `src/index.html` | ligne 543 | `constelliumNavBtn` — bouton de navigation |
| `src/index.html` | ligne 1181 | `constelliumPanel` — panneau explicatif des 5 forces (masqué par défaut) |
| `src/js/render.js` | lignes 5019–5073 | Gestion `constelliumNavBtn` + bouton `prefillBtn` |

### 1.4 Page guide — Couche 6 Narration (propre)

| Fichier | Statut | Contenu |
|---------|--------|---------|
| `src/constellium.html` | Commité | Page standalone 202 lignes — guide des 5 forces — aucune logique moteur |
| `src/css/constellium.css` | Commité | Styles dédiés à `constellium.html` |
| `assets/images/constellium-main.png` | Commité | Image principale — utilisée uniquement par `constellium.html` |
| `assets/images/constellium-guide.png` | Commité | Image guide forces — utilisée uniquement par `constellium.html` |

`constellium.html` contient un lien "← Retour au moteur" vers `index.html`. Elle ne lit aucune donnée du moteur.

### 1.5 Assets visuels — non commités, non branchés

| Chemin | Fichiers | Statut |
|--------|----------|--------|
| `assets/images/CONSTELLIUM_VISUALS_Images/` | AIR_1.png, EAU_1.png, ETHER_1.png, FEU_1.png, TERRE_1.png | Non commités — non appelés dans le code |
| `assets/video/CONSTELLIUM_VISUALS_Video/` | AIR_1.mp4, EAU_1.mp4, ETHER_1.mp4, FEU_1.mp4, TERRE_1.mp4 | Non commités — non appelés dans le code |

Ces 10 fichiers n'ont aucun consommateur dans le dépôt actuel.

## 2. Verdict

**Constellium partiellement intégré — dette de nommage latente — pas dangereux en runtime.**

### Ce qui est sain

- `constellium.html` est propre : Couche 6, aucune logique moteur, aucune lecture de payload
- Les assets visuels PNG/MP4 sont entièrement déconnectés du pipeline
- C1 est respectée : aucun asset n'est appelé par niveau via le moteur
- C3 est techniquement tenue : supprimer les PNG/MP4/constellium.html ne casse pas le moteur

### Ce qui est une dette architecturale

Les forces ether/fire/air/earth/water occupent simultanément deux espaces :

1. **Identifiants Couche 1 (Moteur)** — variables de scoring avec impact quantitatif direct sur `engine.score`
2. **Archétypes Couche 5 (Expression)** — noms symboliques de la cosmologie Constellium

La règle C2 est tenue dans la direction de flux (le moteur ne lit pas d'assets visuels, il produit des valeurs). Mais la **fusion sémantique des espaces de nommage** fragilise C2 sur le plan doctrinal : les termes d'expression sont devenus les identifiants de la couche souveraine.

Conséquence : tout futur intervenant qui lit `fire`, `air`, `earth` dans `engine.js` verra des archétypes là où il doit voir des variables de mesure.

### Ce qui est orphelin

Les 5 PNG + 5 MP4 non commités n'ont pas de consommateur. Leur statut (intégration future vs suppression) n'est pas décidé.

## 3. Décision doctrinale

### ether/fire/air/earth/water sont des identifiants moteur historiques figés

Ces cinq termes ont une double origine : ils sont nés de la cosmologie Constellium et ont été implémentés directement comme variables de scoring dans le moteur. Cette fusion est l'état fondateur du code. Elle est documentée ici, pas corrigée.

**Conséquences de cette décision :**

- Les identifiants `ether`, `fire`, `air`, `earth`, `water` dans `data.js`, `engine.js`, `moteur.js`, et `render.js` **ne seront pas renommés**.
- Leur présence dans le moteur **ne constitue pas une preuve que le Constellium commande le moteur**. Ce sont des mesures de conditions de marché encodées sous des noms symboliques.
- Leur origine symbolique est documentaire. Leur rôle technique est exclusivement de scoring.
- Toute future discussion sur "ce que signifie fire fort" doit partir du code (`computeScore()`) et non de la cosmologie Constellium.

### alignmentNote est reconnu comme anomalie de couche

La chaîne `alignmentNote: "Le marché et la Constellium restent cohérents."` dans `buildPayload()` est une formulation narrative générée par le moteur. Elle sera traitée dans la dette CST-NARR. Aucune correction immédiate.

### Les assets visuels ne commandent pas le moteur — le gel est confirmatoire

Le gel C3 s'applique : supprimer les PNG/MP4 ne casse pas le moteur. Cette propriété doit être préservée dans toute future intégration des assets.

## 4. Dettes ouvertes

| ID | Description | Sévérité | Condition de déclenchement |
|----|-------------|----------|---------------------------|
| `CST-NAME` | Collision sémantique : les forces ether/fire/air/earth/water sont simultanément identifiants moteur (Couche 1) et archétypes Constellium (Couche 5). Pas de conflit runtime. Fragilise C2 sur le plan doctrinal. | Documentaire | Déclenchement si introduction d'une nouvelle variable moteur nommée d'après un archétype visuel, ou si un futur audit signale confusion opérateur. |
| `CST-NARR` | `alignmentNote` dans `buildPayload()` (engine.js:425) génère une chaîne narrative dans la sortie Couche 1. Appartient sémantiquement à Couche 6. Aucun impact fonctionnel connu. | Mineure | Déclenchement si `alignmentNote` est affiché dans l'UI principale ou transmis à un système d'export. |
| `CST-ASSETS` | 5 PNG + 5 MP4 dans `assets/CONSTELLIUM_VISUALS_*/` sont non commités et n'ont aucun consommateur dans le code. Leur statut est indéfini : intégration future Couche 5 ou suppression. | Organisation | Déclenchement à l'ouverture du chantier Couche 5 Expression ou à la prochaine revue assets. |

## 5. Règles permanentes

Ces règles s'appliquent à tout futur chantier touchant le Constellium ou les forces ether/fire/air/earth/water.

**R1 — Aucun asset visuel ne doit être appelé par le moteur.**
`engine.js`, `moteur.js`, et le pipeline V2 ne lisent jamais un fichier PNG, MP4, ou une URL d'asset Constellium. Cette propriété est non négociable.

**R2 — Aucune nouvelle logique moteur ne doit utiliser un archétype visuel comme clé.**
Les identifiants `fire`, `air`, `earth`, `ether`, `water` sont figés. Tout nouveau champ de scoring doit porter un nom technique neutre, sans référence à la cosmologie Constellium.

**R3 — Toute future page Constellium appartient à la Couche 5 Expression.**
Elle ne lit pas le payload moteur directement. Elle peut recevoir des données via une surface Couche 4 dédiée si nécessaire, jamais en accédant à `buildPayload()` ou à `engine.js`.

**R4 — La suppression des assets visuels Constellium ne doit jamais casser le moteur.**
Propriété C3 à maintenir. Toute dépendance qui briserait cette propriété est une violation architecturale immédiate.

**R5 — Les forces restent des identifiants de mesure, pas des identités symboliques dans le code.**
Un commentaire dans `engine.js` peut documenter leur origine. Leur usage dans `computeScore()` reste celui de variables de condition de marché.

---

*Ce document décrit ce qui existe. Pas ce qui est espéré.*

*Documents connexes : `constellium_position_audit.md` (position officielle, §13 conditions de déclenchement) · `constellium/constellium_v1_definition.md` (définition opérationnelle V1 — étoiles, liens, UX)*
