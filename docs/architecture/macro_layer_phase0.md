# Couche Macro — Audit Phase 0

**Caméléon Engine · Direction Architecture**
**Date : 2026-06-10**
**Statut : Document de référence Phase 0 — architecture et doctrine**

---

## Sommaire

1. [Mission](#1-mission)
2. [Frontière avec Pilotage](#2-frontière-avec-pilotage)
3. [Entrées](#3-entrées)
4. [Sorties](#4-sorties)
5. [Impact moteur](#5-impact-moteur)
6. [Visibilité utilisateur](#6-visibilité-utilisateur)
7. [Tri du corpus existant](#7-tri-du-corpus-existant)
8. [Risques](#8-risques)
9. [Architecture cible](#9-architecture-cible)
10. [Recommandation finale](#10-recommandation-finale)

---

## 1. Mission

### Pourquoi la Couche Macro existe-t-elle ?

Le moteur local analyse le signal de marché tel que l'opérateur le lit. Il ne connaît pas le contexte de validité de ce signal.

Un même breakout technique, lu identiquement par le moteur, ne signifie pas la même chose dans un marché structurellement expansif à levier faible et dans un marché en contraction violente. Le moteur les traite de façon identique. Ce plafond est définitif sans couche macro.

**La mission fondamentale de la Couche Macro est une seule question :**

> "Dans quel environnement l'opérateur est-il en train de prendre ses décisions ?"

Ce n'est pas une question sur le marché. C'est une question sur l'opérateur dans le marché.

### Ce qu'elle apporte que le Pilotage n'apporte pas

Le Pilotage décrit ce que l'opérateur observe localement (sa lecture technique, son état émotionnel, ses contraintes personnelles). Il gouverne le cadre individuel de la décision.

La Couche Macro décrit le contexte systémique dans lequel cette observation s'inscrit. Elle n'interroge pas "qu'est-ce que tu vois ?" — elle pose "dans quel climat tes observations ont-elles de la valeur ?"

Ce passage du local au systémique est infranchissable par le Pilotage seul. C'est là que la Couche Macro devient structurellement nécessaire.

### Ce qu'elle n'est pas

La Couche Macro n'est pas :
- un système de signaux
- un outil de prédiction de marché
- un remplaçant de l'analyse opérateur
- un dashboard de données externes

Elle ne répond pas à "que va-t-il se passer ?" Elle répond à "dans quel contexte décides-tu ?"

---

## 2. Frontière avec Pilotage

### Le Pilotage en place

Le Pilotage couvre deux groupes de champs :

**Groupe 1 — Lecture du marché** (ce que l'opérateur observe)
État de marché, bitcoin, dxy, éther, feu, air, terre, eau.
→ Observations techniques et de structure, subjectives et déclaratives.

**Groupe 2 — Cadre opérateur** (ce que l'opérateur décide)
Validation humaine, profil opérateur, filtre adaptatif.
→ Gouvernance personnelle : jusqu'où le moteur est autorisé à aller.

### Ce que la Couche Macro apporte en plus

| Dimension | Pilotage | Couche Macro |
|---|---|---|
| Sujet | L'opérateur dans sa lecture | Le marché systémique comme contexte |
| Nature | Subjectif, déclaratif | Contextuel, environnemental |
| Temporalité | Immédiate (session en cours) | Régimique (état dominant sur période) |
| Question | "Qu'est-ce que je vois ?" | "Dans quel climat suis-je en train de décider ?" |
| Impact moteur | Gouvernance directe | Registre narratif uniquement |

### Ce que la Couche Macro ne doit pas faire

Elle ne doit pas :
- dupliquer les champs d'observation du Pilotage
- se substituer à la validation humaine
- modifier le score, la posture ou les actions autorisées
- introduire une dépendance à des données en temps réel permanentes
- prétendre calculer des états qui requièrent de l'historique depuis un snapshot

### Où passe la frontière

**Pilotage :** ce que l'opérateur pense de sa situation.
**Couche Macro :** ce que le marché systémique fait au contexte dans lequel l'opérateur pense.

La frontière est entre le subjectif gouverné et le systémique contextualisé.

---

## 3. Entrées

### Familles d'informations à considérer

Aucun indicateur n'est listé ici. Ce niveau travaille sur les familles conceptuelles.

**Famille A — Direction du capital**
Où va le capital dans l'écosystème ? Se concentre-t-il sur les actifs de réserve ou se distribue-t-il vers les altcoins ? Cette dimension capture le mouvement de fond du risque agrégé.

**Famille B — Pression du levier**
Le marché est-il structurellement endetté ? Quel est le niveau de levier systémique ? Cette dimension révèle la fragilité ou la solidité de la structure sous les prix.

**Famille C — Coût cognitif du marché**
Quelle est l'amplitude des mouvements ? Un marché violent impose un coût cognitif direct à l'opérateur, indépendamment de son analyse technique. Cette dimension est la seule qui soit directement calculable depuis les données opérateur.

**Famille D — Psychologie populationnelle**
Comment les opérateurs se comportent-ils collectivement dans ce contexte ? Cette famille n'est pas un indicateur de marché — c'est une lecture comportementale populationnelle. Elle appartient au registre narratif, pas au calcul.

**Ce qui est hors périmètre pour les familles d'entrée :**
- Tout ce qui requiert de l'historique multi-cycles pour être discernable (accumulation, distribution)
- Tout ce qui requiert de l'information propriétaire non accessible localement
- Tout ce qui capture le bruit plutôt que le régime

### Règle de sélection des entrées

Trois dimensions orthogonales suffisent pour un contexte défendable. Toute famille supplémentaire doit apporter une information que les trois premières ne couvrent pas. La redondance assumée entre familles qui se confirment mutuellement est acceptable — la redondance pure ne l'est pas.

---

## 4. Sorties

### Types de sortie possibles — analyse

La Couche Macro doit transmettre quelque chose de simple au moteur. Voici les options.

---

**Option — État**

Un état discret parmi un ensemble borné.
Exemple : Expansif / Neutre / Contracté

Avantages :
- Lisible immédiatement par l'opérateur
- Transmissible au registre narratif sans ambiguïté
- Défendable opérationnellement : l'opérateur peut valider ou contester l'état décrit
- Stable dans le temps (pas de variation à chaque mise à jour mineure)

Inconvénients :
- Peut donner l'illusion d'une précision qu'il ne possède pas
- Risque d'interprétation directive ("Expansif = acheter") — à combattre explicitement dans le registre de langage

**Verdict : c'est le format retenu. Un état discret, défendable, avec règle anti-prescription obligatoire.**

---

**Option — Régime**

Une caractérisation plus large (Risk-On, Risk-Off, Euphorie, Capitulation).

Avantages :
- Vocabulaire connu des traders
- Capture mieux les phases extrêmes

Inconvénients :
- Nombre d'états plus élevé → plus complexe à maintenir
- Certains régimes (accumulation, distribution) sont indiscernables sans price context historique — fausse précision structurelle
- Vocabulaire émotionnellement chargé → risque directif plus élevé

**Verdict : utile comme registre narratif secondaire, pas comme sortie principale. Certains états (Risk-On/Off) peuvent alimenter la description de l'état principal.**

---

**Option — Contexte**

Un label de contexte combiné (ex: "Dominance BTC active + Levier faible").

Avantages :
- Transparence de la composition
- Facile à contester par l'opérateur

Inconvénients :
- Trop technique en surface principale
- Crée un espace de lecture trop détaillé pour le cockpit principal

**Verdict : appartient au Niveau 2 (accès volontaire), pas à la surface principale.**

---

**Option — Température**

Une métaphore de chaleur (froid / tempéré / chaud / surchauffé).

Avantages :
- Intuitif
- Peu d'ambiguïté directive

Inconvénients :
- Moins précis qu'un état
- Ne distingue pas les régimes de direction (Risk-On chaud ≠ Risk-Off chaud)

**Verdict : utile comme couche de description dans le registre narratif, pas comme sortie principale.**

---

**Option — Phase**

Un positionnement dans un cycle (début / milieu / fin).

Avantages :
- Donne du recul temporel

Inconvénients :
- Requiert des données historiques que le moteur ne possède pas
- Fausse précision structurelle pour V1

**Verdict : hors périmètre V1. Réservé à une version future avec historique suffisant.**

---

### Sortie retenue

**Un état discret parmi trois valeurs : Expansif / Neutre / Contracté**

Règles de production de cet état :
- Aucun signal unique ne produit un état — confirmation multiple obligatoire
- Neutre si les signaux se contredisent — jamais considéré comme un échec
- Neutre si les données dépassent un seuil de fraîcheur maximum — Macro_State mensonger vaut moins que Neutre honnête
- Les états décrivent un environnement de décision, jamais une recommandation d'action

Anti-prescription obligatoire :
- Expansif ≠ Acheter
- Contracté ≠ Vendre
- Neutre ≠ Attendre

---

## 5. Impact moteur

### Principe fondateur — MACRO-RULE-01

La Couche Macro ne modifie jamais :
- le score
- la posture
- les actions autorisées ou interdites
- la validation humaine
- le moteur décisionnel

Un même formulaire produit exactement le même score, la même posture, les mêmes actions — que le contexte macro soit activé ou non.

Ce n'est pas une limitation. C'est une décision architecturale centrale.

> Un contexte macro peut rendre une lecture plus prudente. Il ne peut jamais rendre une décision automatiquement meilleure ou pire.

### Ce que la Couche Macro peut influencer

**Registre narratif** — La manière dont le cockpit décrit la situation peut changer.
Un même score de 72 en contexte Expansif ne se lit pas comme un score de 72 en contexte Contracté. L'état est identique. La façon de le raconter diffère.

**Texte de coaching** — La couche de coaching comportemental peut être nuancée selon le contexte systémique. "Dans ce contexte, les opérateurs ont tendance à..." est une lecture populationnelle, pas une prescription.

**Friction contextuelle** — Une mise en garde peut être ajoutée dans le Confidence Panel (`#cs-message`) pour signaler que le contexte systémique mérite d'être pris en compte. Cette friction est informative, jamais bloquante.

**Tonalité** — Le registre de langage général peut être légèrement modulé selon l'état (plus sobre en Contracté, plus direct en Expansif).

### Ce que la Couche Macro ne peut jamais faire

- Modifier `baseEngine()`, `profileMatrix()`, `computeTradingPolicy()`, `applyValidation()`, `buildPayload()`
- Ajouter des actions interdites supplémentaires
- Réduire l'engagement calculé par le moteur
- Bloquer une décision que le moteur valide

Test de régression obligatoire : pour un même formulaire, activer ou désactiver le contexte macro doit produire des résultats strictement identiques sur score / posture / actions.

---

## 6. Visibilité utilisateur

### Option A — Invisible

Le moteur utilise le contexte macro mais l'opérateur ne le voit pas.

Avantages :
- Aucune complexité UI
- Aucun risque d'interprétation erronée par l'opérateur
- Moteur simple en surface

Inconvénients :
- L'opérateur ne peut pas valider ou contester la lecture
- La valeur pédagogique est nulle
- La corrélation comportement × régime reste opaque pour l'opérateur
- Impossible de construire la couche de maturité progressive

**Verdict : à rejeter. La valeur produit principale de la Couche Macro requiert que l'opérateur la voie et y contribue.**

---

### Option B — Zone dédiée visible

Une nouvelle section dans le cockpit affiche les données macro de façon explicite.

Avantages :
- Transparence totale
- L'opérateur comprend d'où vient le contexte
- Comparabilité directe avec le score

Inconvénients :
- Risque de lecture causale : l'opérateur voit "Contexte : Contracté" et "Score : 72" côte à côte et en infère une relation de causalité
- Violation potentielle de MACRO-RULE-01 par la présentation, même si respectée techniquement
- Complexité visuelle ajoutée au cockpit principal
- Le cockpit est un outil de décision sobre — une zone macro visible dégrade la lisibilité

**Verdict : à rejeter comme architecture principale. Acceptable uniquement pour le Niveau 3 (mode expert).**

---

### Option C — Semi-visible (recommandée)

L'opérateur voit uniquement les conséquences. L'accès à la composition est volontaire.

Architecture en trois niveaux :

**Niveau 1 — Affichage permanent minimal**
```
Contexte : Contracté  (données du 10/06)
```
Deux informations : l'état, la fraîcheur. Aucune donnée brute. Aucun indicateur.
Séparation visuelle obligatoire avec le score pour éviter toute lecture causale.

**Niveau 2 — Accessible volontairement**
Déclenché par l'opérateur (clic / expansion).
- Lecture contextuelle : "Le capital se concentre vers Bitcoin. Le levier systémique est modéré."
- Lecture comportementale populationnelle : "Dans ce contexte, les opérateurs ont tendance à réduire leur fréquence d'intervention."
- Si historique suffisant : "Ce contexte a été enregistré N fois dans tes sessions."

**Niveau 3 — Mode expert uniquement**
Sources, fraîcheur détaillée, valeurs numériques. Hors cockpit principal.

**Verdict : Option C est la seule architecture cohérente avec le principe "présence calme qui rend la décision lisible sans la prendre".**

**Règle de séparation visuelle :** l'état macro ne doit jamais apparaître dans la même zone que le score ou l'engagement. La proximité visuelle crée la causalité perçue.

---

## 7. Tri du corpus existant

### A — À intégrer au moteur (V1)

**Expansion / Compression**
Ce sont les états de sortie. Ils décrivent la dynamique du capital dans l'écosystème. "Expansif" traduit une phase d'expansion des risques. "Contracté" traduit une phase de compression. Ce sont les labels officiels de la sortie Couche Macro.
→ Intégrer comme vocabulaire d'état principal.

**Risk On / Risk Off**
Ces concepts sont la colonne vertébrale de la lecture systémique. Ils alimentent la définition des états (Expansif ≈ Risk-On dominé, Contracté ≈ Risk-Off dominé). Ils ne sont pas des sorties en eux-mêmes — ils contribuent à produire la sortie.
→ Intégrer comme logique interne de classification d'état.

**Liquidité**
La liquidité comme dimension systémique (pression du levier, profondeur du marché) est une famille d'entrée légitime. Elle est orthogonale aux deux autres familles et apporte une information non redondante.
→ Intégrer comme famille d'entrée dans l'architecture conceptuelle.

**Température du marché**
Métaphore utile pour le registre narratif. Un marché "chaud" décrit un contexte de levier élevé et d'engagement fort. Un marché "froid" décrit le retrait du risque.
→ Intégrer comme registre de langage dans les textes Niveau 2, pas comme dimension technique.

### B — À conserver comme documentation

**Psychologie collective**
Le concept est juste — les biais collectifs influencent le contexte dans lequel l'opérateur décide. Mais la psychologie collective ne peut pas être calculée depuis des indicateurs de marché. Elle peut être décrite dans le registre narratif populationnel.
→ Conserver dans la documentation comme fond conceptuel des textes de Niveau 2.

**États collectifs**
Recouvre largement la psychologie collective. L'euphorie collective, la panique, l'apathie sont des états réels qui conditionnent le contexte décisionnel. Comme pour la psychologie collective, ils alimentent le registre narratif, pas un calcul.
→ Conserver dans la documentation. Ne pas tenter de les "mesurer".

### C — À repousser à une version future

**Narratifs**
Le concept de "narratif dominant" (AI narrative, RWA narrative, etc.) est réel et influence le marché. Mais son intégration requiert soit une curation manuelle permanente (coût éditorial élevé), soit du traitement automatique du langage (hors périmètre local-first). Le risque de devenir un agrégateur d'opinions est direct.
→ Repousser à V2+. Condition d'ouverture : trouver une source stable, locale, sans curation permanente.

**Cycles de marché complets**
L'identification de la phase d'un cycle (accumulation, distribution, markup, markdown) requiert des données historiques multi-cycles et une lookback window que la Couche Macro V1 ne peut pas calculer depuis un snapshot.
→ Hors périmètre V1 définitif. Fausse précision structurelle si tentée avant.

---

## 8. Risques

### Risques techniques

**Fraîcheur des données**
Le contexte macro évolue. Des données de 5 jours dans un marché qui a bougé produisent un Macro_State mensonger. L'architecture doit prévoir un horodatage visible et un signal de dégradation progressive.

**Conflit fraîcheur / local-first**
Certaines dimensions (levier) changent quotidiennement. L'import manuel hebdomadaire produit un Macro_State périmé pour ces dimensions précisément. Ce conflit doit être résolu dans l'architecture d'acquisition avant d'ouvrir le chantier.

**Extension de périmètre progressive**
Une Couche Macro qui commence à "juste afficher un état" peut dériver vers un dashboard complet en 3 itérations. La règle de non-contamination doit être documentée et défendue activement, pas seulement posée.

### Risques UX

**Lecture causale involontaire**
Si l'état macro apparaît dans la même zone visuelle que le score, l'opérateur conclura que l'état macro a produit le score. Cette inference est fausse et viole MACRO-RULE-01 par la présentation.

**Dépendance au contexte**
Si le cockpit montre en permanence un état macro, l'opérateur peut développer une dépendance : "je ne décide que si le contexte est Expansif". Ce comportement est exactement ce que le produit cherche à désamorcer.

**Gamification de la maturité**
Les niveaux de corrélation personnelle peuvent être vécus comme des récompenses si leur progression est rendue visible de façon stimulante. Anti-gamification = règle absolue.

### Risques cognitifs

**Inversion représentation / réalité**
Le danger central identifié : la couche macro devient ce que l'opérateur suit, et le moteur local devient une confirmation. La hiérarchie s'inverse. La règle de séparation visuelle est la première défense.

**Fausse précision**
Un état "Contracté" calculé depuis des données insuffisantes ou périmées est plus dangereux qu'une absence d'état. L'opérateur qui croit avoir un contexte fiable prend des décisions fondées sur du vent.

**Surcharge contextuelle**
Chaque information contextuelle supplémentaire consomme de l'attention. La Couche Macro ajoutée maladroitement peut dégrader la qualité des décisions en ajoutant de la complexité à un moment qui requiert de la clarté.

### Risques produit

**Devenir un agrégateur de données**
Le produit risque de dériver de "moteur cognitif" vers "dashboard macro" si les données deviennent le centre de gravité. La valeur de la Couche Macro n'est pas dans les données — c'est dans la corrélation comportement personnel × régime systémique.

**Valeur derrière un mur temporel**
La valeur principale de la Couche Macro (corrélations personnelles émergentes) n'est accessible qu'après plusieurs mois d'usage avec logging actif. Déployer la Couche Macro avant d'avoir une base utilisateurs réelle, c'est construire dans le vide.

**Maintenance éditoriale non prévue**
Les textes de Niveau 2 (lectures populationnelles) doivent rester pertinents selon l'état du marché. Si le corpus textuel est statique et que le marché change de régime, les formulations deviennent inexactes.

---

## 9. Architecture cible

### Vue conceptuelle

```
MISSION
─────────────────────────────────────────────────────────────
Contextualiser l'environnement systémique dans lequel
l'opérateur prend ses décisions.
Jamais : prédire, signaler, recommander, automatiser.

ENTRÉES
─────────────────────────────────────────────────────────────
[Famille A]  Direction du capital dans l'écosystème
[Famille B]  Pression du levier systémique
[Famille C]  Coût cognitif du marché (amplitude des mouvements)

Source : déclaration opérateur ou import ponctuel daté
Contrainte absolue : chaque entrée est horodatée
Règle : Neutre si données trop anciennes

TRANSFORMATION
─────────────────────────────────────────────────────────────
Règles de composition multi-dimensions :
  - Confirmation multiple obligatoire
  - Aucun signal unique ne produit un état
  - Neutre si signaux contradictoires (jamais forçage)
  - Maximum 3–4 états discrets défendables

Règles de validation :
  - "Deux opérateurs avec les mêmes données et les mêmes règles
     doivent produire le même état."
  - Si ce test échoue : l'état n'est pas défendable

SORTIE
─────────────────────────────────────────────────────────────
Un état discret parmi trois :
  Expansif | Neutre | Contracté

Horodatage de fraîcheur obligatoire.
Neutre si données dégradées — transparent.

IMPACT MOTEUR
─────────────────────────────────────────────────────────────
Ce qui change  :  registre narratif · texte coaching · tonalité
                  Niveau 1 affichage · Niveau 2 description
Ce qui ne change jamais :  score · posture · actions · validation

VALEUR ÉMERGENTE (moyen terme)
─────────────────────────────────────────────────────────────
Session × Macro_State × Comportement opérateur
→ Corrélations personnelles progressives
→ "Comment tu décides dans ce régime précis"
→ Intelligence inaccessible sans les deux flux coexistant
```

### Contraintes d'architecture immuables

1. **MACRO-RULE-01** — Séparation absolue score / contexte. Non négociable. Test de régression à chaque modification.

2. **Séparation visuelle** — L'état macro ne partage jamais la zone visuelle du score ou de l'engagement.

3. **Local-first** — Aucune dépendance API permanente. Données importées ponctuellement, horodatées, dégradées explicitement.

4. **Pas de proxy Constellium** — Les champs Constellium (ether, feu, air, terre, eau) sont des identifiants de la Couche 5 Expression. Ils ne sont pas des capteurs macro objectifs. Interdiction permanente.

5. **Anti-prescription** — Chaque texte produit par la Couche Macro passe le test : "est-ce que cette phrase décrit ce qui se passe, ou dit-elle ce que l'opérateur devrait faire ?" Si la seconde : reformuler.

6. **Logging obligatoire dès le premier jour** — Chaque session doit enregistrer son Macro_State associé. Une session sans logging est une session perdue pour les corrélations futures. Cette règle n'est pas rétroactive.

---

## 10. Recommandation finale

### Faut-il créer cette Couche Macro ?

**Oui.**

Pas parce que le corpus conceptuel est riche — mais parce qu'elle répond à un besoin structurel réel que le Pilotage ne peut pas couvrir. Le moteur local est aveugle au contexte de validité de ses propres outputs. Cette cécité a un plafond définitif. La Couche Macro est la seule architecture qui le lève.

La valeur de différenciation produit — la corrélation comportement personnel × régime systémique sur durée — n'existe nulle part ailleurs. C'est un espace produit exclusif.

### Pourquoi ouvrir ce chantier ?

Parce que le logging doit démarrer au plus tôt. La valeur principale est derrière un mur temporel. Chaque session enregistrée sans Macro_State est une session perdue définitivement. L'infrastructure logistique doit être en place dès le lancement, même si la couche n'est pas visible en surface.

### Quel doit être son périmètre V1 ?

**Ce qui appartient à V1 :**

1. Architecture d'acquisition résolue — modèle d'import local, ponctuel, daté, sans API permanente
2. Trois familles d'entrée : direction du capital, pression du levier, coût cognitif
3. Un état discret parmi trois : Expansif / Neutre / Contracté
4. Règles de composition : confirmation multiple, Neutre par défaut si signaux contradictoires ou données dégradées
5. Affichage Niveau 1 : état + fraîcheur, séparé visuellement du score
6. Accès Niveau 2 volontaire : lectures contextuelles populationnelles
7. Logging session × Macro_State actif dès le premier commit
8. MACRO-RULE-01 étendue et testée à chaque modification

**Ce qui n'appartient pas à V1 :**

- Narratifs de marché (curation ou NLP requis)
- Cycles complets (lookback historique requis)
- Corrélations personnelles exploitables (mur temporel de plusieurs mois minimum)
- Phase du cycle (Accumulation / Distribution — fausse précision structurelle)
- Affichage Niveau 3 (mode expert — différé à V1.5)
- Seuils de maturité des corrélations personnelles (calibration terrain obligatoire)

### Ce qui conditionne l'ouverture du chantier

1. **Mise en ligne effective** — ouvrir la Couche Macro avant d'avoir des utilisateurs réels, c'est construire dans le vide
2. **Acquisition résolue** — le modèle d'import (quelle source, quelle fréquence, quel seuil de fraîcheur) doit être documenté avant le premier commit
3. **Séparation visuelle documentée** — le design du Niveau 1 doit être validé pour éliminer le risque de lecture causale avant implémentation

Ces trois conditions ne sont pas des recommandations. Ce sont des conditions bloquantes.

### Phrase de test de cohérence pour toute évolution future

Avant d'intégrer toute nouvelle direction dans la Couche Macro, poser la question suivante :

> "Est-ce que cette évolution renforce le pont entre marché, psychologie et expérience vécue de l'opérateur — ou est-ce qu'elle déplace le centre de gravité du produit vers les données ?"

Si la seconde : refuser.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
