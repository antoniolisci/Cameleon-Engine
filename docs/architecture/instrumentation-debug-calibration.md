# Instrumentation debug / calibration — Caméléon Engine

**Statut** : Document d'architecture V0 · Couche auxiliaire · Aucune implémentation immédiate
**Version** : 1.0 — 2026-05-24
**Dépendances** :
- `docs/architecture/calibration-terrain.md`
- `docs/architecture/gestion-attention.md`
- `docs/architecture/doctrine-silence-structurel.md`

---

## Point de départ

Le protocole de calibration terrain (`calibration-terrain.md`) a identifié huit variables
à collecter pendant le test V0 : `confidence_score`, `posture`, `MdS`, `QdR`, `DMU`,
`engagement_declared`, `attention_level`, `should_expose`. Ces variables permettront
de valider les seuils provisoires de T1, T4 et la fenêtre glissante N.

Problème structurel : le moteur Caméléon est client-side uniquement, sans backend, sans
télémétrie native. Les données de calibration doivent être collectées dans le navigateur,
pendant une session réelle, sans perturber l'opérateur.

**La tension centrale** est entre deux contraintes opposées :

La doctrine du silence structurel exige un cockpit calme — l'opérateur ne doit pas
percevoir le travail interne du moteur. Toute surface d'information supplémentaire
dans le cockpit viole cette doctrine.

La calibration terrain exige l'observation — des données structurées doivent être
accessibles pour valider les seuils. Sans données, la calibration est impossible.

La résolution de cette tension est la séparation stricte des surfaces : le cockpit
reste silencieux même pendant l'observation. La couche d'instrumentation est
architecturalement invisible pour l'opérateur. Elle n'existe que dans le panel Debug,
accessible uniquement au développeur/calibrateur.

---

## Ce que cette couche n'est pas

**Pas une télémétrie produit SaaS.** La couche ne transmet aucune donnée à un serveur,
à un service analytics, ou à une infrastructure externe. Tout reste dans la mémoire vive
du navigateur jusqu'à l'export manuel.

**Pas un système d'analytics utilisateur.** Elle ne mesure pas les comportements de
navigation, les clics, le temps passé sur un champ, ni aucune métrique d'engagement
produit. Elle capture uniquement des outputs structurels du moteur.

**Pas un backend de tracking.** Il n'existe pas de base de données, pas d'identifiant
de session persistant, pas d'identifiant opérateur. Chaque session est anonyme et
indépendante.

**Pas un monitoring temps réel.** Les données ne sont pas agrégées, affichées en
tableau de bord, ni consultables en direct pendant le test V0. Elles sont exportées
manuellement, analysées hors ligne, après la session.

**Pas une persistance multi-session.** L'état de la couche est en mémoire vive uniquement.
Il est réinitialisé à chaque rechargement de page. Il n'y a pas d'accumulation silencieuse
entre sessions.

---

## Deux populations séparées

La couche d'instrumentation sert deux populations dont les besoins sont incompatibles
si les surfaces d'information ne sont pas strictement séparées.

### Opérateur V0

**Besoin** : utiliser le moteur normalement, prendre des décisions sur le marché,
évaluer la valeur de l'outil.

**Ce qu'il voit** : le cockpit standard — posture, actions autorisées/interdites,
tension exposée le cas échéant. Rien de plus.

**Ce qu'il ne doit jamais voir** : les snapshots de calibration, les compteurs internes,
les niveaux d'attention, les scores bruts de la hiérarchie des tensions. Ces éléments
biaiseraient son comportement et invalideraient les données collectées.

**Règle** : l'existence de la couche d'instrumentation est architecturalement invisible
pour l'opérateur. Le cockpit ne révèle pas que des données sont collectées.

### Développeur / calibrateur

**Besoin** : accéder aux snapshots collectés, exporter les données, analyser les
distributions pour valider ou ajuster les seuils.

**Ce qu'il utilise** : le panel Debug, accessible par un toggle dans l'UI existante.
C'est la seule surface où les données de calibration sont visibles.

**Accès pendant le test V0** : le développeur/calibrateur n'est pas l'opérateur.
L'export est réalisé soit sur la propre machine du calibrateur (si le test est supervisé),
soit par un export que l'opérateur déclenche manuellement à la fin de sa session
(sans avoir vu les données pendant la session).

**Règle d'isolation** : toute donnée visible dans le panel Debug doit être absente
du cockpit. Toute donnée visible dans le cockpit ne doit pas dépendre d'une variable
du panel Debug.

---

## État actuel du panel Debug

Le panel Debug existe dans l'implémentation courante. Il est rendu dans `src/js/render.js`
(~3600 lignes) et togglé depuis l'UI. Il expose actuellement :

- **Score brut** : output numérique de `baseEngine()`
- **Posture** : output de `profileMatrix()` — PASSIVE / BALANCED / ACTIVE
- **Breakdown confidence** : décomposition du score de lisibilité par axe (trend 30 %, structure 30 %, volatilité 25 %, volume 15 %)
- **Actions autorisées / interdites** : output de `computeTradingPolicy()` sous forme de listes

**Limites actuelles** :
- Les variables de calibration V0 qui ne sont pas encore implémentées (composants V2 :
  `attention_level`, `should_expose`, `winner`) ne sont pas exposées.
- Les qualificateurs premium (`MdS`, `QdR`, `DMU`) ne sont pas affichés si le formulaire
  ne les expose pas déjà comme inputs structurés.
- Il n'existe pas de mécanisme de snapshot ni d'export.

**Pourquoi ce panel est la surface naturelle** : il est déjà conçu pour le développeur,
déjà séparé du cockpit opérateur, déjà togglé indépendamment. L'ajouter de nouveaux
éléments de calibration n'ajoute pas de concept nouveau — cela étend un mécanisme existant
dans son périmètre naturel. Modifier le cockpit pour les mêmes fins serait une violation
architecturale.

---

## Inventaire des variables à instrumenter

| Variable | Source dans le code | Disponible dans Debug | Ajout nécessaire |
|---|---|---|---|
| `confidence_score` | `src/js/confidence-score.js` → output numérique 0–100 | Oui — breakdown déjà affiché | Non — lecture directe du score suffisante |
| `posture` | `src/js/engine.js` → `profileMatrix()` | Oui — déjà affiché | Non |
| `MdS` | Input formulaire (qualificateur premium déclaré) | Non | Oui — lire depuis l'état formulaire |
| `QdR` | Input formulaire (qualificateur premium déclaré) | Non | Oui — lire depuis l'état formulaire |
| `DMU` | Input formulaire (qualificateur premium déclaré) | Non | Oui — lire depuis l'état formulaire |
| `engagement_declared` | Input formulaire (niveau d'engagement déclaré) | Non | Oui — lire depuis l'état formulaire |
| `winner` | `HierarchyResult` — composant V2, non implémenté | Non | Oui — à brancher lors de l'implémentation V2 |
| `attention_level` | `AttentionState` — composant V2, non implémenté | Non | Oui — à brancher lors de l'implémentation V2 |
| `should_expose` | `AttentionResult` — composant V2, non implémenté | Non | Oui — à brancher lors de l'implémentation V2 |

**Lecture de la table :**

Trois variables sont disponibles aujourd'hui sans modification (`confidence_score`, `posture`
via le panel Debug existant). Trois variables sont accessibles depuis l'état formulaire sans
modification moteur (`MdS`, `QdR`, `DMU`, `engagement_declared`). Trois variables dépendent
de l'implémentation V2 et ne peuvent pas être instrumentées avant celle-ci (`winner`,
`attention_level`, `should_expose`).

**Conséquence pour le test V0** : la calibration de T1 et T4 peut démarrer avec les
variables actuellement disponibles. La calibration de D-ATT-01 nécessite l'implémentation
de la couche de gestion de l'attention.

---

## Structure CalibrationSnapshot

À chaque soumission du formulaire, la couche d'instrumentation capture un snapshot
de l'état pertinent pour la calibration.

```
CalibrationSnapshot {
  timestamp: number,              // Date.now() au moment de la soumission
  confidence_score: number,       // score 0–100 produit par confidence-score.js
  posture: string,                // "PASSIVE" | "BALANCED" | "ACTIVE"
  MdS: number | null,             // valeur ordinale 1–4, null si non soumis
  QdR: number | null,             // valeur ordinale 1–4, null si non soumis
  DMU: boolean | null,            // actif ou non, null si non soumis
  engagement_declared: number | null, // 1–3, null si non soumis
  winner: TensionId | null,       // tension exposée — null avant implémentation V2
  attention_level: string,        // "normal" | "high" | "elevated" — null avant V2
  should_expose: boolean          // décision gate final — false avant V2
}
```

**Règles de capture :**
- Le snapshot est capturé une seule fois par soumission, après l'exécution complète
  de la pipeline moteur et des composants V2 disponibles.
- Les champs `winner`, `attention_level` et `should_expose` valent respectivement
  `null`, `"normal"` et `false` tant que les composants V2 ne sont pas implémentés.
  La structure est identique — seul le contenu évolue.
- Aucun snapshot n'est capturé au démarrage de la page ni lors de la navigation
  entre onglets.

**Ce que le snapshot ne contient pas :**
- L'identité ou tout identifiant de l'opérateur.
- Les inputs bruts du formulaire au-delà des variables de calibration listées.
- L'historique des sessions précédentes.
- Toute donnée susceptible d'identifier indirectement l'opérateur (actif tradé, heure, etc.).

---

## Buffer mémoire V0

Les snapshots sont accumulés dans un tableau en mémoire vive :

```
calibrationBuffer: CalibrationSnapshot[]
```

**Propriétés du buffer :**

- **Stockage** : mémoire vive uniquement. Aucun localStorage, aucune IndexedDB,
  aucune session storage.
- **Reset** : le buffer est vidé à chaque rechargement de page. C'est intentionnel —
  les sessions sont indépendantes.
- **Limite** : le buffer est plafonné à **200 snapshots**. Ce plafond correspond à
  environ 25–50 sessions de 4–8 soumissions chacune — suffisant pour une séquence
  de test V0 intra-session longue.
- **Comportement sur overflow** : si le buffer atteint 200 entrées, les nouvelles
  soumissions ne sont plus capturées et un avertissement discret apparaît dans le
  panel Debug uniquement ("Buffer calibration plein — exporter avant de continuer").
  Le moteur continue de fonctionner normalement. Aucun avertissement dans le cockpit.
- **Initialisation** : tableau vide à l'ouverture de la page.

**Ce que le buffer ne fait pas :**
- Il ne se vide pas automatiquement après export — l'opérateur peut continuer
  d'accumuler après un premier export.
- Il ne déduplique pas les snapshots — chaque soumission produit une entrée,
  même si les inputs sont identiques.
- Il ne déclenche aucune action automatique à l'overflow autre que l'avertissement Debug.

---

## Export ponctuel

L'export est l'unique mécanisme de persistance des données de calibration. Il est
toujours manuel, toujours volontaire, jamais automatique.

**Déclenchement** : un bouton "Exporter calibration (JSON)" est présent dans le panel
Debug uniquement. Il n'est pas accessible depuis le cockpit, pas accessible depuis les
autres onglets, pas référencé dans l'UI opérateur.

**Format prioritaire — JSON :**
```json
{
  "exported_at": 1716556800000,
  "session_count": 47,
  "snapshots": [
    {
      "timestamp": 1716556789123,
      "confidence_score": 71,
      "posture": "ACTIVE",
      "MdS": 2,
      "QdR": 3,
      "DMU": false,
      "engagement_declared": 3,
      "winner": null,
      "attention_level": "normal",
      "should_expose": false
    }
  ]
}
```

**Format optionnel — CSV** : export tabulaire avec une ligne d'en-tête, une ligne
par snapshot. Utile pour l'analyse dans un tableur. Le format CSV est secondaire —
le JSON est la référence pour l'analyse programmatique.

**Règles d'export :**
- L'export génère un fichier téléchargé localement via l'API `Blob` + `URL.createObjectURL`.
  Aucune requête réseau, aucune synchronisation distante.
- L'export ne vide pas le buffer — l'opérateur peut continuer d'accumuler des snapshots
  après export et exporter à nouveau.
- Le fichier exporté est nommé `cameleon-calibration-{timestamp}.json`.
- Si le buffer est vide au moment de l'export, le bouton est désactivé ou affiche
  un message "Aucune donnée à exporter" dans le panel Debug.

---

## Contrat cockpit / debug

Les règles suivantes sont absolues et ne souffrent pas d'exception dans l'implémentation V0.

**R1 — Aucune donnée de calibration dans le cockpit.**
Le cockpit (onglet Moteur, sections posture/décision/tension) ne doit jamais afficher
de variable issue de la couche d'instrumentation : pas de compteur de snapshots, pas
d'indicateur de collecte active, pas d'état du buffer.

**R2 — Aucune donnée cockpit dépendante du debug.**
La décision moteur, la tension exposée, le message de l'explicabilité sobre — aucun
de ces éléments ne peut dépendre d'un état du panel Debug ou du buffer de calibration.
Si le panel Debug est désactivé ou supprimé, le cockpit doit fonctionner identiquement.

**R3 — La suppression de la couche debug ne casse jamais le cockpit.**
La couche d'instrumentation est architecturalement optionnelle. Le moteur ne doit pas
avoir de dépendance fonctionnelle vers le buffer de calibration. Si le buffer est plein
ou absent, la pipeline moteur continue.

**R4 — Le debug est une surface parasite autorisée hors UX opérateur.**
Le panel Debug peut être visuellement chargé — tableaux, valeurs brutes, boutons d'export.
Cette charge est acceptable parce qu'elle est réservée au contexte développeur. Elle ne
représente pas un idéal de design — elle représente un outil d'inspection temporaire pour
le test V0.

**R5 — Aucun état partagé entre cockpit et debug.**
Les variables d'état du cockpit (`currentDecision`, `currentTension`, etc.) et les
variables du buffer (`calibrationBuffer`, `expositions_window`, etc.) ne doivent pas
être dans le même espace de noms ni se référencer mutuellement.

---

## Accès opérateur V0

**Option B retenue** : le panel Debug est hors du flux opérateur normal pendant le test V0.

**État par défaut** : le panel Debug est fermé au chargement de la page. Il n'est pas
mentionné dans les instructions transmises aux opérateurs V0.

**Découverte** : un opérateur qui explore l'interface peut trouver le toggle du panel Debug
de façon autonome. Ce n'est pas interdit. Il ne verra pas de données sensibles — uniquement
les variables techniques du moteur déjà accessibles dans le panel existant, plus le compteur
de snapshots et le bouton d'export.

**Biais comportemental** : si un opérateur voit le panel Debug pendant sa session, il peut
adapter son comportement (changer ses inputs pour "tester" les valeurs). Les snapshots de
cette session sont marqués comme potentiellement biaisés dans l'analyse. Ce risque est
documenté dans § Risques architecturaux.

**Export en fin de session** : le protocole V0 peut demander à l'opérateur de déclencher
un export manuel à la fin de sa session ("à la fin de votre session, appuyez sur ce bouton
dans l'interface — vous n'avez pas besoin de comprendre ce qu'il fait"). Cette approche
permet de collecter les données sans que l'opérateur ait eu accès aux données pendant la
session. La formulation de la demande ne mentionne pas la calibration.

**Règle absolue** : aucun feedback de calibration n'est visible pendant la session — pas
d'indicateur "données enregistrées", pas de confirmation de snapshot, pas de jauge de buffer.

---

## Contraintes sans backend

L'absence de backend détermine plusieurs contraintes non négociables pour V0.

**Pas d'agrégation multi-opérateurs automatique.** Les fichiers JSON exportés par chaque
opérateur sont des fichiers indépendants. L'agrégation est réalisée hors ligne par le
calibrateur, après collecte de tous les exports. Il n'existe pas de tableau de bord
temps réel ni de base centralisée pendant le test.

**Pas de métriques globales temps réel.** Il n'est pas possible de connaître la distribution
des `confidence_score` pendant que le test est en cours. L'analyse commence quand les exports
sont collectés, pas avant.

**Pas d'historique inter-session.** Chaque rechargement réinitialise le buffer. Si un
opérateur effectue 5 sessions sur 5 jours, chaque session produit un export séparé.
L'opérateur doit exporter à la fin de chaque session — pas uniquement à la fin du test.
Cette contrainte doit être communiquée dans le protocole V0.

**Calibration manuelle post-export.** Le calibrateur analyse les fichiers JSON exportés
avec les outils de son choix (tableur, script Python, R, etc.). L'architecture de la
couche d'instrumentation ne préjuge pas de l'outil d'analyse utilisé — elle garantit
uniquement que les données sont dans un format exploitable (JSON structuré, CSV optionnel).

**Conséquence opérationnelle** : le test V0 produit un ensemble de fichiers JSON à traiter
manuellement. C'est le coût de l'absence de backend. Ce coût est acceptable pour V0 —
20–30 opérateurs sur 2–4 semaines produisent un volume de données gérable manuellement.

---

## Risques architecturaux

**Pollution UX.**
Si la couche d'instrumentation génère le moindre artefact visible dans le cockpit
(ralentissement perceptible, modification d'un rendu, apparition d'un indicateur),
elle viole la doctrine du silence structurel et biaise les données collectées simultanément.
Garde-fou : la capture de snapshot est synchrone et légère (copie de valeurs scalaires
déjà calculées). Elle n'effectue aucun calcul supplémentaire, aucune requête réseau,
aucune opération DOM.

**Biais comportemental.**
Un opérateur qui découvre le panel Debug ou comprend qu'il est observé peut modifier ses
inputs pour "tester" le système plutôt que pour prendre de vraies décisions. Les données
de ces sessions ne sont pas représentatives.
Garde-fou : documenter dans chaque export si le panel Debug était ouvert pendant la session
(détectable via un flag dans `CalibrationSnapshot` ou dans les métadonnées d'export).
Les sessions avec panel Debug ouvert sont analysées séparément ou exclues.

**Over-instrumentation.**
Ajouter trop de variables au `CalibrationSnapshot` crée un overhead de maintenance et
dilue les données pertinentes. Chaque ajout futur doit répondre à une question de
calibration explicite, pas à une curiosité générale sur le comportement du moteur.
Garde-fou : toute extension du snapshot doit être justifiée par une dette de calibration
nommée dans `calibration-terrain.md`.

**Dérive SaaS analytics.**
Le panel Debug enrichi peut être perçu comme un point d'entrée vers une couche analytics
complète — heatmaps, funnel analysis, rétention. Ce glissement détournerait l'architecture
de son objectif de calibration ponctuelle vers une infrastructure produit permanente.
Garde-fou : la couche d'instrumentation est documentée comme temporaire et spécifique au
test V0. Elle ne devient pas une couche permanente de l'architecture.

**Dépendance future au backend.**
La limitation "pas d'agrégation multi-opérateurs" peut créer une pression à introduire
un backend après V0 pour faciliter l'analyse. Ce n'est pas architecturalement interdit,
mais ce n'est pas une décision à prendre sans évaluer l'impact sur la doctrine locale-first.
Garde-fou : toute décision d'introduire un backend est une révision architecturale majeure,
documentée séparément, non déclenchée par le seul besoin de calibration.

---

## Dettes identifiées

| Référence | Nature | Bloquante ? |
|---|---|---|
| D-DBG-01 | Format d'export final — JSON retenu comme prioritaire, CSV optionnel ; décision définitive avant implémentation | Non |
| D-DBG-02 | Stratégie d'anonymisation éventuelle — les snapshots ne contiennent pas d'identifiant direct, mais la combinaison timestamp + actif + profil pourrait être indirectement identifiante ; à évaluer avant test V0 | Non |
| D-DBG-03 | Limite du buffer mémoire — valeur provisoire 200 snapshots ; à ajuster si les sessions V0 sont plus longues que prévu | Non |
| D-DBG-04 | Agrégation future multi-sessions / multi-opérateurs — la contrainte "pas de backend" est acceptable pour V0 ; une infrastructure légère (fichier CSV consolidé, script d'agrégation) sera nécessaire pour l'analyse post-V0 | Non — post-V0 |
| D-DBG-05 | Instrumentation mobile — si des opérateurs V0 utilisent le moteur sur mobile, le panel Debug et le bouton d'export sont peu ergonomiques sur petit écran ; comportement à définir | Non |

---

## Statut

**Type** : Document d'architecture V0 · Couche auxiliaire.
**Périmètre** : Instrumentation debug et collecte de calibration — V0 uniquement.
**Aucune implémentation immédiate.**
**Aucune modification du cockpit.**
**Aucun nouveau corpus d'indicateurs.**

La couche d'instrumentation est une couche auxiliaire hors doctrine UX principale.
Elle n'est pas un composant V2 — elle ne fait pas partie de la chaîne
cohérence → hiérarchie → explicabilité → attention. Elle est parallèle, invisible
pour l'opérateur, et temporaire dans sa forme V0.

Ce document produit :
- La séparation formelle des deux populations (opérateur / calibrateur) et de leurs surfaces.
- L'inventaire des variables à instrumenter avec leur disponibilité actuelle.
- La structure `CalibrationSnapshot` et les règles de capture.
- Le buffer mémoire V0 avec limite et comportement sur overflow.
- Le mécanisme d'export ponctuel (JSON prioritaire, bouton Debug uniquement).
- Le contrat cockpit / debug en cinq règles absolues.
- Les contraintes sans backend et leurs conséquences opérationnelles.
- L'inventaire des risques avec garde-fous.
- Les dettes D-DBG-01 à 05.

La prochaine étape après ce document est l'implémentation effective de la couche,
conditionnée à la stabilisation de l'architecture V2.
