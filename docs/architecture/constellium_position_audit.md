# Constellium — Audit de position officielle

**Caméléon Engine · Document d'architecture**
**Date : 2026-06-10 · Statut : RÉFÉRENCE OFFICIELLE**

> Ce document répond à une seule question : quelle est la place exacte du Constellium dans Caméléon Engine ?
> Il ne contient aucun code, aucune UI, aucune implémentation. C'est un audit de position.

> **Mise à jour 2026-06-18** — La définition opérationnelle V1 est maintenant figée :
> *"Le Constellium est la visualisation des liens entre les traces du décideur."*
> Référence : `docs/architecture/constellium/constellium_v1_definition.md`
> Ce document (audit de position) reste la référence pour la place du Constellium dans l'architecture code.
> La définition V1 répond à la question complémentaire : *que voit l'opérateur quand il accède au Constellium ?*

---

## 1. Mission du document

La réalité du Constellium dans le dépôt est fragmentée en plusieurs couches temporelles. Certaines décisions datent de 2025 (origin du code), d'autres de 2026-06-03 (audit architectural), d'autres sont encore ouvertes. Cette superposition produit une ambiguïté qui fragilise les prochains chantiers.

Ce document tranche l'ambiguïté. Il :

- Décrit les deux sens du mot "Constellium" dans le projet
- Documente les relations avec chacune des couches et piliers du moteur
- Évalue les options d'intégration et leurs risques
- Émet une recommandation officielle avec conditions de déclenchement

**Portée :** document d'audit et de position. Non implémentable en l'état.

---

## 2. Définition — Ce qu'est le Constellium

Le mot "Constellium" désigne deux réalités distinctes dans le projet. La confusion entre les deux est la source principale de l'ambiguïté.

### 2.1 Sens A — Identifiants moteur historiques (actif aujourd'hui)

Cinq variables de scoring — `ether`, `fire`, `air`, `earth`, `water` — sont des champs officiels de formulaire déclarés dans `data.js` et utilisés directement dans `computeScore()` (engine.js). Elles produisent des impacts quantitatifs sur le score brut :

- `fire strong` → +12 pts ; `fire medium` → +6 pts ; `fire weak` → −4 pts
- `air strong` → +8 pts ; `air emerging` → +4 pts
- `earth strong` → +5 pts
- `ether strong` → +5 pts

Ces cinq variables **sont nées de la cosmologie Constellium** mais elles **fonctionnent comme des mesures de conditions de marché**. Leur nom est symbolique. Leur rôle est technique.

**Décision figée (2026-06-03) :** ces identifiants ne seront pas renommés. Leur présence dans le moteur ne prouve pas que le Constellium commande le moteur. Ils mesurent des conditions encodées sous des noms symboliques.

### 2.2 Sens B — Application principale future (vision long terme)

Le produit final s'appelle **Le Constellium**. Caméléon Engine devient le moteur cognitif interne de cette application.

```
Le Constellium       ← espace global de l'opérateur
  ├─ Caméléon Engine    ← moteur cognitif / décisionnel
  ├─ Couche Macro        ← contexte systémique
  ├─ Mémoire Opérateur   ← historique comportemental
  ├─ Portefeuille        ← exposition
  ├─ Bibliothèque Vivante ← trajectoire
  └─ Empreinte Opérateur™ ← synthèse identitaire
```

**Décision figée (2026-06-03) :** cette décision est produit / vision. Aucun chantier code maintenant. Aucun renommage. Aucune page index Constellium maintenant.

---

## 3. Ce qu'il n'est pas

- **Pas une couche technique supplémentaire** — le Constellium Sens B est une vision produit, pas un module à implémenter
- **Pas un module de scoring** — les forces ether/fire/air/earth/water mesurent des conditions, elles ne définissent pas une "couche Constellium" dans le pipeline
- **Pas un système de signaux** — le Constellium n'émet pas de verdicts, ne produit pas de postures
- **Pas un proxy macro** — les champs Constellium (éther, feu, air, terre, eau) sont des identifiants de la Couche 5 Expression, jamais des capteurs de l'environnement systémique (§10, décision immuable)
- **Pas un dashboard** — ni en Sens A (variables de scoring) ni en Sens B (vision produit)
- **Pas un outil prédictif** — le Constellium décrit, jamais ne prédit
- **Pas commandant** — la direction de flux est immuable : moteur → référent → expression. Jamais l'inverse

---

## 4. Relation avec la Couche 1 — Moteur (Pilier technique souverain)

C'est la relation la plus complexe, et la seule qui soit active aujourd'hui.

**Ce qui existe :**

Les cinq forces sont des inputs de `computeScore()`. Elles entrent dans le calcul du score brut au même titre que les variables de marché. Le payload de sortie de `buildPayload()` les porte dans `payload.constellium = {ether, fire, air, earth, water}`.

De plus, `alignmentNote` dans `buildPayload()` produit une chaîne narrative : `"Le marché et la Constellium restent cohérents."` Cette chaîne appartient sémantiquement à la Couche 6 Narration. C'est la dette **CST-NARR**.

**La règle souveraine — MACRO-RULE-01 :**

Le Moteur est souverain. Aucune couche supérieure ne commande `baseEngine()`, `profileMatrix()`, `computeTradingPolicy()`, `applyValidation()`, ni `buildPayload()`. Le Constellium Sens B — l'application future — ne commandera jamais ces fonctions.

**La fusion sémantique :**

Les identifiants `fire`, `air`, `earth`, `ether`, `water` occupent simultanément deux espaces : Couche 1 Moteur (variables de mesure) et Couche 5 Expression (archétypes symboliques). Cette fusion est l'état fondateur du code. Elle n'est pas corrigée, elle est documentée. C'est la dette **CST-NAME**.

**Règle R5 (permanente) :** les forces restent des identifiants de mesure dans le code. Leur usage dans `computeScore()` reste celui de variables de condition de marché, pas d'identités symboliques.

---

## 5. Relation avec la Couche 2 — Référents

`data.js` porte les déclarations des cinq forces (FORM_FIELDS, valeurs par défaut, présence dans tous les PRESETS). La Couche 2 est saine : elle définit les constantes, elle ne produit pas de logique.

**Règle R2 (permanente) :** tout nouveau champ de scoring doit porter un nom technique neutre, sans référence à la cosmologie Constellium.

---

## 6. Relation avec la Couche 4 — Surfaces produit (Pilier utilisateur)

**Deux surfaces existent :**

1. `constelliumNavBtn` + `constelliumPanel` dans `index.html` — bouton de navigation et panneau explicatif des 5 forces (masqué par défaut). Géré dans `render.js`. C'est une surface d'explication, pas de pilotage.

2. `src/constellium.html` — page standalone (202 lignes), guide pédagogique des 5 forces. Aucune logique moteur. Aucune lecture de payload. Propre architecturalement.

**Ce qui est sain :** la règle C1 est respectée. La règle C3 est tenue : supprimer le panel Constellium dans `index.html` ou supprimer `constellium.html` ne casse pas le moteur.

---

## 7. Relation avec la Couche 5 — Expression (position officielle)

Dans l'architecture officielle à 6 couches (commit `14f3b62`), le Constellium est la **Couche 5 Expression**.

```
Couche 5 — Expression / Constellium : images + vidéos assets/ — optionnel pour Couche 1
```

**Les trois règles immuables de la Couche 5 :**

| Règle | Formulation |
|-------|-------------|
| C1 | Images appelées par niveau entier (1–5), jamais par état textuel |
| C2 | Direction toujours moteur → référent textuel → expression visuelle, jamais l'inverse |
| C3 | Suppression Couche 5 ne casse jamais le moteur |

**État actuel de la Couche 5 :**

Les assets visuels haute résolution (5 PNG + 5 MP4 dans `assets/CONSTELLIUM_VISUALS_*/`) sont non commités et n'ont aucun consommateur dans le code. Leur statut est indéfini : intégration future Couche 5 ou suppression. C'est la dette **CST-ASSETS**.

---

## 8. Relation avec la Couche Macro

La relation Constellium × Macro est un cas de frontière à solidifier.

**La décision immuable :** le proxy Constellium est **rejeté définitivement** (§10, commit `2ccb73f`).

Formulation exacte : les champs Constellium (éther, feu, air, terre, eau) sont des identifiants de la Couche 5 Expression, pas des capteurs macro. Il est interdit de les utiliser pour inférer un état de marché, un régime systémique, ou toute variable d'entrée de la Couche Macro.

**Pourquoi ce rejet est structurel :**

Les forces Constellium mesurent des conditions de marché techniques encodées sous des noms symboliques. La Couche Macro mesure un environnement systémique par consensus entre trois familles distinctes (BTC.D / Funding Rate / Volatilité). Les deux systèmes mesurent des choses différentes avec des granularités différentes. Une corrélation n'est pas une équivalence.

**Risque de confusion :** un futur intervenant pourrait être tenté d'utiliser `fire` ou `ether` comme proxy de la famille A (direction du capital) ou C (coût cognitif). Cette tentation doit être anticipée et bloquée par cette documentation.

---

## 9. Relation avec les piliers comportementaux

**Pilotage :** le Constellium Sens A (variables moteur) entre dans le calcul de cadrage opérateur via `prefillConstellium()` — mappe l'état marché vers des valeurs prédéfinies des forces. Relation directe, active, saine.

**Mémoire :** les sessions loggées dans `CE_behavior_sessions_v1` portent `payload.constellium` dans leur enregistrement. Le Constellium Sens A est donc implicitement archivé avec chaque session. Ce champ n'est pas encore exploité pour des corrélations. Aucune dette active.

**Comportement :** le module comportemental (Isolated Submodule) ne lit aucune donnée du moteur. Il n'interagit pas avec les forces Constellium. Relation = nulle. Propriété à préserver.

---

## 10. Options d'intégration — évaluation

Cinq options sont évaluées pour la présence future du Constellium dans le produit.

### Option A — Invisible (statu quo étendu)

Les forces restent des variables internes de scoring. Aucune surface ne les mentionne explicitement sous leur nom symbolique. Le Constellium Sens B reste dans les docs et la vision produit uniquement.

**Avantages :** simplicité maximale, zéro risque de contamination, moteur souverain incontesté.
**Risques :** perd la valeur symbolique comme levier d'engagement. La cosmologie Constellium reste dans le code sans narration utilisateur.
**Verdict :** option défensive valide. Recommandée jusqu'à validation terrain couches 1–4.

### Option B — Pédagogique (état actuel amélioré)

`constellium.html` + le panel explicatif dans `index.html` constituent déjà cette option. L'opérateur peut comprendre ce que signifient les forces au moment de la saisie, sans que le moteur ne soit modifié.

**Avantages :** architecture propre, C1/C2/C3 respectées, valeur éducative réelle, déjà implémentée.
**Risques :** risque de dérive si le texte pédagogique devient prescriptif (test anti-prescription à appliquer).
**Verdict :** option retenue et active aujourd'hui. À maintenir, pas à étendre en V1.

### Option C — Portefeuille symbolique (expression opérateur)

Utiliser les assets visuels (PNG/MP4) pour exprimer visuellement l'état de l'opérateur en fonction des forces dominantes dans le dernier formulaire soumis.

**Avantages :** levier d'engagement émotionnel fort, différenciation visuelle, ancre mémorielle.
**Risques :**
- Risque de confusion score/expression : l'opérateur peut interpréter l'image comme un verdict
- Risque dashboard : la visualisation peut devenir une surface de pilotage non intentionnelle
- Dépend de la résolution de la dette CST-NAME (qui est EXPANSIF vs qui est CONTRACTÉ dans la symbolique forces ?)
- Nécessite une décision sur les 10 assets non commités (intégration ou suppression)

**Verdict :** valide architecturalement SI C1/C2/C3 sont maintenues. Non ouvrable avant mise en ligne et résolution CST-NAME.

### Option D — Couche premium future

Le Constellium Sens B (application principale) devient une offre premium distincte. Caméléon Engine est l'offre de base. "Le Constellium" est l'espace enrichi avec Macro, Mémoire longue, Empreinte Opérateur™, etc.

**Avantages :** modèle économique naturel (profondeur = valeur = prix), cohérent avec la doctrine de maturation progressive.
**Risques :**
- Risque de fragmentation produit prématurée
- Nécessite l'architecture données utilisateur complète (ADU), le Compte utilisateur, et une matrice Gratuit/Premium décidée
- Ne peut s'ouvrir avant la Phase Fondations complète

**Verdict :** option valide long terme. Non ouvrable avant Phase Produit (post-mise en ligne, post-Compte utilisateur).

### Option E — Application séparée (extérieure au dépôt)

Le Constellium devient un produit distinct, avec son propre dépôt, son propre cycle de développement, consommant Caméléon Engine comme API ou service.

**Avantages :** séparation nette des périmètres, évolutivité maximale.
**Risques :**
- Complexité d'intégration prématurée
- Risque de double développement
- Prématuré avant stabilisation des couches 1–4

**Verdict :** option architecturalement légitime. Prématurée. À reconsidérer si le produit atteint une taille critique qui justifie la séparation.

---

## 11. Risques identifiés

### R-CST-01 — Confusion proxy macro

**Risque :** un futur intervenant utilise les forces Constellium comme proxy des familles Macro (BTC.D → `air`, Funding Rate → `fire`, etc.).
**Probabilité :** élevée (les noms symboliques évoquent des conditions de marché).
**Mitigation :** ce document + §10 de la doctrine Macro V1 + règle R2 du code audit. Rappel obligatoire dans tout futur brief Macro ou Constellium.

### R-CST-02 — Dérive expression → direction

**Risque :** une future surface Constellium (image, animation) est interprétée comme un signal de pilotage par l'opérateur.
**Probabilité :** moyenne à élevée (psychologie de l'image).
**Mitigation :** règle C2 permanente. Test Manifeste obligatoire sur tout ajout visuel. Hiérarchie visuelle : expression toujours subordonnée au verdict Moteur.

### R-CST-03 — Inflation identitaire

**Risque :** le nom "Constellium" envahit progressivement le vocabulaire produit avant d'avoir une implémentation réelle, créant une promesse non tenue.
**Probabilité :** moyenne.
**Mitigation :** nommer n'autorise pas (doctrine écosystème). "Constellium" dans les communications produit = conditionnel à la mise en ligne de la Phase Produit.

### R-CST-04 — CST-NAME non documentée pour les futurs intervenants

**Risque :** un futur contributeur renomme les forces ou crée une "Couche Constellium" en Couche 1 en pensant clarifier la sémantique.
**Probabilité :** faible aujourd'hui, croissante avec le temps.
**Mitigation :** ce document + le code audit 2026 + règle R5 permanente dans le code.

---

## 12. Recommandation officielle

### Position active (aujourd'hui)

**Le Constellium occupe deux espaces distincts :**

1. **Couche 1 Moteur** — via les cinq forces comme variables de scoring historiques figées. Position : stable, saine, permanente. Aucune action.

2. **Couche 4 Surfaces (pédagogie)** — via `constellium.html` et le panel explicatif dans `index.html`. Position : propre, architecturalement saine. À maintenir sans extension en V1.

3. **Couche 5 Expression** — position officielle dans l'architecture à 6 couches. Assets visuels non intégrés (CST-ASSETS ouverte). Chantier différé.

### Position future (post-mise en ligne)

Le Constellium Sens B (application principale) est la vision produit validée. Son implémentation suit la séquence officielle : mise en ligne → validation terrain → Compte utilisateur → Phase Intelligence. Elle ne peut pas être anticipée.

### Ce qui est décidé et figé

| Décision | Statut |
|----------|--------|
| ether/fire/air/earth/water = identifiants moteur historiques | Figé — ne pas renommer |
| Constellium = Couche 5 Expression dans l'architecture officielle | Figé |
| Proxy Constellium → Macro : interdit | Immuable |
| C1/C2/C3 : direction moteur → expression, jamais l'inverse | Immuables |
| Pas de chantier code Constellium maintenant | Figé jusqu'à signal |
| Option B pédagogique : active et maintenue | Décision active |
| CST-NAME / CST-NARR / CST-ASSETS : ouvertes, non urgentes | Gelées |
| Définition opérationnelle V1 figée (2026-06-18) | `constellium/constellium_v1_definition.md` |

---

## 13. Conditions avant ouverture d'un chantier Constellium

Aucun chantier Constellium (Couche 5 Expression, Option C ou D) ne s'ouvre avant :

- ☐ Mise en ligne effective et validation terrain (≥10 opérateurs actifs)
- ☐ Architecture données utilisateur complète (ADU-01→06 soldées)
- ☐ Compte utilisateur actif (magic link ou équivalent)
- ☐ Matrice Gratuit/Premium décidée
- ☐ Résolution CST-NAME — décision documentée sur la double sémantique des forces avant toute extension visuelle
- ☐ CST-ASSETS tranchée — décision intégration ou suppression des 5 PNG + 5 MP4
- ☐ Test C1/C2/C3 passé sur toute nouvelle surface Constellium

---

## Résumé exécutif

Le Constellium désigne deux réalités : (A) cinq variables de scoring historiques figées dans le moteur — noms symboliques, rôle technique — et (B) le produit final "Le Constellium", vision long terme dans laquelle Caméléon Engine devient le moteur interne. Ces deux sens coexistent sans conflit si la règle C2 est maintenue : la direction de flux est toujours moteur → expression, jamais l'inverse.

Position officielle aujourd'hui : Couche 5 Expression dans l'architecture à 6 couches. Actif en Couche 1 (variables de scoring) et en Couche 4 (pédagogie via `constellium.html`). Inactif en Couche 5 (assets non intégrés). Chantier Constellium Sens B : différé après mise en ligne, Compte utilisateur, et résolution des 3 dettes actives (CST-NAME / CST-NARR / CST-ASSETS). Une seule règle permanente non négociable : aucune couche supérieure ne commande le moteur souverain.

---

*Caméléon Engine — Architecture Produit · 2026-06-10 · Mise à jour 2026-06-18*
*Documents connexes : `product_architecture_post_6c3f6fd.md` · `constellium_code_audit_2026.md` · `macro_layer_doctrine_v1.md` · `constellium/constellium_v1_definition.md`*
