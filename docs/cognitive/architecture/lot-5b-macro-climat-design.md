# Lot 5B — Macro comme climat
## Document d’architecture — avant construction

**Statut :** architecture validée — aucune fiche construite.
**Date :** 2026-05-22
**Contexte :** ouvert après finalisation du Lot 5A (50 concepts, corpus complet).
Stress-test doctrinal effectué — 2 concepts retenus sur 3 candidats initiaux.

---

## Position dans le modèle deux-couches

Cette famille décrit la **Couche 1 (marché) vue comme environnement structurel**,
pas comme configuration technique. Elle ne lit pas des prix ou des patterns.
Elle documente des états du contexte macro qui modifient la fiabilité opérationnelle
de tout ce que le trader lit par ailleurs.

**Distinction fondamentale avec le Lot 5A :**
Lot 5A (Psychologie collective) — le phénomène existe parce que des participants
le font exister. Retirez les participants : l’état collectif disparaît.
Lot 5B (Macro comme climat) — le phénomène existe dans la structure de l’environnement.
Retirez n’importe quel participant : le climat reste. Il est indépendant des lecteurs.

> Un état collectif se construit entre les traders.
> Un climat macro existe avant qu’ils regardent leur écran.

**Principe d’intégration cockpit :**
Cette famille produit des **modulations de fiabilité contextuelle** sur les éléments
existants du cockpit — pas des alertes directionnelles, pas de nouveaux panneaux.
Le cockpit ne dit pas « le macro est contre toi ». Il ajuste la texture de certitude
qui entoure ce qu’il produit.

---

## Périmètre de la famille

Cette famille documente les états structurels du contexte macro qui rendent une
session de trading opérationnellement différente — sans que le trader ait à prendre
position sur la direction. Ce ne sont pas des catalyseurs événementiels (FOMC à 14h30).
Ce sont des états du terrain : le sol a changé de nature, indépendamment du pas.

**Formulation de référence :**
Un trader peut avoir une lecture techniquement irréprochable — bon signal, bonne
structure, bonne posture — et opérer dans un contexte où cette lecture est
structurellement moins fiable. Le macro comme climat ne contredit pas la lecture.
Il modifie ce que vaut la certitude qu’elle produit.

**Test d’appartenance :**
Le phénomène persiste-t-il si l’on retire tous les participants du marché ?
Si oui — si l’état existe dans la structure de l’environnement, pas dans les
comportements agrégés des traders — il appartient à cette famille.

---

## Ce que cette famille ne couvre pas

| Hors périmètre | Raison |
|---|---|
| L’analyse macro directionnelle | Cette famille décrit des états de lisibilité, pas des thèses de marché |
| Les événements programmés comme déclencheurs | FOMC, CPI : catalyseurs ponctuels, pas des états structurels durables |
| L’opinion sur la politique monétaire | Aucune thèse économique — règle identique à toutes les familles |
| La volatilité comme indicateur technique | La volatilité peut accompagner un désordre structurel, elle n’en est pas synonyme |
| Les régimes macro au sens quantitatif | Pas de modèles, pas de définitions statistiques — états qualitatifs uniquement |
| Les états collectifs liés à l’actualité | Si l’état dépend de ce que les traders pensent de l’actualité → Lot 5A |

---

## Frontières taxonomiques

**vs Lot 5A — Psychologie collective**
Lot 5A = états émotionnels et narratifs construits entre les participants.
Lot 5B = états structurels indépendants des participants.
Test : le phénomène survivrait-il dans un marché entièrement algorithmique sans
aucun participant humain ? Lot 5A non. Lot 5B oui.

**vs Biais cognitifs / Behavior**
Biais = distorsions individuelles de traitement.
Macro comme climat = modification objective du terrain dans lequel ce traitement opère.
L’un est dans la tête du trader. L’autre est sous ses pieds.

**vs Structures de marché**
Structures de marché = configurations de prix lisibles techniquement.
Macro comme climat = contexte qui modifie la fiabilité de ces configurations.
Le désordre structurel n’est pas une structure dégradée — c’est l’absence de référentiel.

**vs Régimes de volatilité**
La volatilité est un symptôme mesurable. Le désordre structurel est une propriété
qualitative du contexte : les couches structurelles (trend, range, consolidation)
sont en conflit ou indéfinies — pas simplement « agitées ».

**vs Temporalité**
La temporalité couvre le rapport individuel au temps (urgence, horizon, cycle).
Macro comme climat couvre l’état objectif du terrain dans une fenêtre de temps,
indépendamment de qui le perçoit.

---

## Risques de dérive

**Dérive 1 — Thèse directionnelle masquée**
Décrire un état macro comme signal que « quelque chose va se passer ».
Signal d’alerte : un concept qui devient plus utile si l’on sait ce que le macro
va produire comme mouvement.

**Dérive 2 — Encyclopédie économique**
Expliquer le fonctionnement du cycle de taux, de l’inflation, de la politique monétaire.
Signal d’alerte : un concept qui nécessite des prérequis macro-économiques pour être
compris, pas juste reconnu.

**Dérive 3 — Événement ponctuel confondu avec état structurel**
Traiter une publication de données comme un état de terrain durable.
Signal d’alerte : un concept dont l’état disparaît 30 minutes après la donnée.

**Dérive 4 — Contamination Lot 5A**
Créer un état collectif rebaptisé « macro » — la clarté apparente, l’euphorie de contexte.
Signal d’alerte : si l’état disparaît quand les participants changent d’avis,
c’est du Lot 5A, pas du Lot 5B.

**Dérive 5 — Prescriptif déguisé**
Laisser entendre que l’identification d’un état macro justifie de ne pas trader.
Signal d’alerte : « en présence de X, éviter de prendre position. »

---

## Axes structurels retenus

Deux axes. Résultat du stress-test doctrinal effectué le 2026-05-22.
Un troisième axe candidat (Clarté apparente) a été éliminé : son effet cockpit
était identique à celui du Lot 5A « états collectifs stables / euphorie collective ».
La différence de mécanisme ne suffit pas — l’output devait être distinct.

**A — Dominance macro sur le local**
Un contexte macro (publications majeures à venir, régime de taux actif, événement
géopolitique structurant) qui rend les configurations techniques locales opérationnellement
moins fiables — non parce qu’elles sont techniquement invalides, mais parce que le
terrain dans lequel elles s’inscrivent est gouverné par une force d’un ordre de grandeur
supérieur. La structure est lisible. Sa fiabilité est réduite.

*Modulation cockpit :* La texture de certitude qui entoure le score de confiance
s’assouplit. Le chiffre ne change pas. Ce qui l’habille porte une réserve contextuelle
silencieuse — non directive, non alarmiste. Le registre du coaching devient légèrement
plus conditionnel sur la robustesse de la lecture, pas sur la décision.

**B — Désordre structurel**
L’état dans lequel les couches structurelles du marché (trend, consolidation, range,
transition) sont en conflit ouvert ou indéfinies — de sorte que le référentiel de lecture
lui-même est incertain. Ce n’est pas un mauvais setup dans un référentiel clair.
C’est l’absence de référentiel.

*Modulation cockpit :* La friction augmente — non par le score d’exécution, mais
par l’indétermination structurelle. Le cockpit ralentit légèrement avant les points
de validation. Le coaching devient plus interrogatif sur le référentiel lui-même,
pas sur la décision dans ce référentiel. La densité visuelle de lecture s’épaissit
discrètement sans warning ajouté.

---

## Concept éliminé — trace documentaire

**Clarté apparente** (éliminé le 2026-05-22)

Décrivait l’état dans lequel le contexte semble exceptionnellement lisible — signaux
alignés, absence de friction — créant une fausse certitude opérationnelle.

**Raison d’élimination :** effet cockpit identique à « états collectifs stables / euphorie collective » (Lot 5A). Dans les deux cas : le seuil de clarté perçue est silencieusement abaissé, sans que le score change. La cause diffère mais la modulation cockpit produite est indiscernable. Deux causes différentes ne justifient pas deux fiches si l’output est le même.

Loi 2 : unicité de l’effet comme condition d’existence.

---

## Structure d’une fiche — trois questions obligatoires

Chaque concept de ce lot doit répondre à trois questions, dans cet ordre :

1. **Définition** — quel est cet état structurel du contexte ? (test d’appartenance inclus)
2. **Test d’appartenance** — ce phénomène persiste-t-il indépendamment des participants ?
3. **Modulation cockpit** — quelle texture, quelle densité, quel rythme, quelle réserve
   cet état produit-il dans les éléments existants du cockpit ?

La troisième question est le point d’ancrage produit. Sans elle, le concept reste orphelin.

---

## Règles de ton et de langage

**Éviter :**
- « le macro va provoquer », « attendre que le macro se stabilise » — prescriptif et prédictif
- « contexte difficile / favorable » — jugement directionnel implicite
- Toute référence à des actifs, des paires, des marchés spécifiques
- « risque macro » comme synonyme de danger — le corpus décrit, ne juge pas

**Préférer :**
- « état structurel », « contexte de lisibilité », « fiabilité opérationnelle »
- « le terrain dans lequel s’inscrit la lecture »
- Les formulations qui décrivent une propriété du contexte, pas une cause de décision

**Test de ton :**
Le trader qui lit une fiche de cette famille doit reconnaître un état qu’il a déjà vécu
sans pouvoir le nommer — pas apprendre une thèse macro. Si la formulation exige de savoir
ce que le macro va faire, elle est incorrecte.

---

## Résumé d’architecture

| Dimension | Décision |
|---|---|
| Ce que la famille couvre | États structurels du contexte macro modifiant la fiabilité de lecture |
| Axe central | Le terrain objectif dans lequel s’inscrit la lecture — indépendant des participants |
| Distinction Lot 5A | Lot 5A disparaît sans participants ; Lot 5B persiste — c’est le test |
| Ce qu’elle ne couvre pas | Thèses directionnelles, événements ponctuels, encyclopédie macro, états collectifs |
| Axes retenus | 2 : dominance macro sur le local, désordre structurel |
| Concept éliminé | Clarté apparente — effet cockpit identique à Lot 5A euphorie collective (Loi 2) |
| Risque principal | Dérive directionnelle ou contamination Lot 5A |
| Intégration cockpit | Modulation de fiabilité contextuelle — aucune surface UI nouvelle |
| Nombre de concepts cibles | 2 — espace délibérément contraint |

---

*Document d’architecture produit le 2026-05-22. Aucune fiche construite.*
*Relire principes-architecture-cognitive.md et lot-5a-psychologie-collective-design.md avant construction.*
