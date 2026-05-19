# Doctrine Caméléon — Profondeur sans densité, viabilité sans bruit

**Document de référence produit. Statut : canonique.**

> Ce document contraint les décisions futures. Il ne les inspire pas.
> En cas de conflit avec une opportunité business, une demande utilisateur,
> une optimisation UX ou une métrique de croissance — ce document prévaut.

---

## Statut et portée

Ce document est distinct du Manifeste Caméléon Engine
(`docs/manifesto-cameleon-engine.md`).
Le manifeste dit *ce qu'est* Caméléon.
Ce document dit *comment on le construit* et *pourquoi certaines décisions
sont interdites*.

Il s'applique à :

- toute nouvelle fonctionnalité
- tout changement de modèle économique
- toute décision de communication
- tout arbitrage entre valeur perçue et valeur réelle

Il ne s'applique pas aux corrections de bugs ni aux décisions techniques
sans impact perceptif ou économique.

---

## Principe central

> **Caméléon est un artisanat distribué par logiciel.**

La valeur ne vient pas de ce que le logiciel fait, mais de *comment* il le fait,
et de *ce qu'il refuse de faire*. Un artisanat ne se dilue pas pour croître.
Il se distribue plus largement en restant fidèle à sa nature.
L'échelle ne se construit pas par abandon du soin — elle se construit malgré lui.

---

## I. Doctrine produit

### Loi 1 — Le moteur grossit, l'interface maigrit

Chaque version peut légitimement ajouter de la profondeur analytique,
de la précision de lecture, de la fiabilité algorithmique.
La sophistication interne est autorisée, bienvenue, encouragée.

L'interface ne s'épaissit pas. Ce que l'utilisateur perçoit reste sobre,
dense, stable. La sophistication interne se traduit en signal plus fiable —
pas en surface supplémentaire.

*Corollaire :* une feature invisible à l'interface qui améliore la qualité
du signal est toujours préférable à une feature visible qui l'augmente en taille.

### Loi 2 — Le freeware incarne l'identité

La version gratuite n'est pas une version dégradée.
C'est la version qui définit le produit aux yeux du monde.
Elle doit être représentative de l'identité de Caméléon : sobre, sérieuse,
complète dans ses fondements.

Toute restriction en version gratuite est de l'ordre de la *profondeur*
(moins de couches analytiques), jamais de la *dégradation*
(expérience rendue frustrante, fonctions manquées ostensiblement).

*Corollaire :* si la version gratuite provoque de la frustration intentionnelle,
c'est un bug de doctrine.

### Loi 3 — Le premium approfondit, il n'accumule pas

La version payante se distingue par une lecture plus profonde,
une contextualisation plus fine, une réponse plus précise à des situations
plus complexes. Pas par un plus grand nombre de fonctionnalités.

Ajouter dix indicateurs supplémentaires derrière un paywall viole cette loi.
Permettre une lecture comportementale multi-périodes derrière un paywall
est conforme à cette loi.

### Loi 4 — La relation prime sur l'engagement

Le produit est optimisé pour des années de confiance tranquille,
pas pour des semaines d'engagement intense. Ces deux objectifs sont souvent
antagonistes. Quand ils le sont, la confiance tranquille gagne.

Un utilisateur qui revient après six mois parce que le produit lui manque
est plus précieux qu'un utilisateur qui ouvre l'app tous les jours parce
qu'une notification le rappelle.

### Loi 5 — Le silence est une feature protégée

Le silence de l'interface — absence de signal, de message, de mouvement —
est une valeur en soi. Il ne doit jamais être comblé par commodité
ou par peur du vide.

Tout ajout qui réduit le silence doit être justifié par une valeur réelle
et proportionnelle. La justification "ça remplit le vide" est une raison
de rejeter, pas d'accepter.

### Loi 6 — La conversion n'est jamais pilotée

Le passage de gratuit à payant ne se déclenche jamais par une mécanique push :
pas de pop-up de conversion, pas de limite artificielle atteinte avec message
d'upgrade, pas d'email de relance, pas de discount avec compte à rebours.

Le passage se produit quand l'utilisateur décide que la valeur reçue mérite
le prix. Cette décision lui appartient entièrement.

*Corollaire :* le taux de conversion n'est pas un KPI de santé produit.
Il est un sous-produit de la valeur perçue.

### Loi 7 — Toute croissance doit préserver la présence calme

La croissance en utilisateurs, fonctionnalités, marchés ou revenus ne justifie
aucun compromis sur la présence calme du produit. Si une décision de croissance
nécessite d'agiter l'interface, d'ajouter de l'urgence, ou de réduire le silence,
cette décision est incompatible.

---

## II. Doctrine perceptive

### La densité sans surcharge

Caméléon est dense en information et sobre en signal.
La densité se mesure à la précision de ce qui est dit.
La sobriété se mesure à ce qui n'est pas dit.
Ces deux axes s'évaluent séparément.

### L'interface comme espace habité

L'interface n'est pas une page. C'est un espace que le trader habite
pendant des heures. Chaque élément a une place fixe, une signification stable,
une présence discrète. Quand un nouvel élément est ajouté, la question n'est pas
"est-ce utile ?" mais "est-ce qu'il mérite de vivre ici ?"

### La lisibilité comme acte de respect

L'information est présentée de façon à pouvoir être lue en un seul regard orienté.
Pas de décryptage. Pas de recherche. L'utilisateur qui sait où regarder
voit immédiatement ce qu'il cherche.

Cette lisibilité présuppose que l'utilisateur a mieux à faire
que de chercher ses instruments.

### La grammaire visuelle

Aucune couleur ne déclenche une émotion plus forte que la lecture rationnelle
qu'elle accompagne. La couleur soutient le texte, elle ne le remplace jamais.

Aucune animation ne décore. Le mouvement signale, toujours.

Plus la situation devient intense, plus l'interface ralentit.
L'inversion d'intensité est la signature mature du produit.

---

## III. Doctrine économique

### Le prix comme signal de sérieux

Le prix n'est jamais une excuse pour dégrader la version gratuite,
jamais un levier de manipulation, jamais un signal de valeur gonflée.
Il est un signal de sérieux : ce produit coûte parce qu'il vaut.

### Aucune monétisation dans l'interface

L'interface du cockpit ne contient aucun élément de monétisation :
pas de bannière, pas de suggestion d'upgrade contextuelle,
pas de badge "premium" sur les fonctions payantes.
Ces éléments transforment le cockpit en catalogue.
Le cockpit n'est pas un catalogue.

### La viabilité par la valeur, pas par le volume

Un nombre restreint d'utilisateurs qui paient durablement est préférable
à un grand nombre d'utilisateurs qui convertissent rapidement et abandonnent.

*Corollaire :* les métriques de vanité (téléchargements, inscriptions, DAU/MAU)
ne mesurent pas la santé de Caméléon. La durée de la relation et le taux de
rétention à 12 mois sont les seuls indicateurs pertinents.

---

## IV. Ce que Caméléon n'est pas

*Ce qui suit distingue Caméléon des catégories auxquelles il pourrait être
comparé à tort. Chaque item délimite un périmètre d'identité, pas un défaut.*

**Caméléon n'est pas un screener.**
Il ne filtre pas les marchés pour identifier des opportunités.
Il ne génère pas de listes. Il ne classe pas.

**Caméléon n'est pas un système de signaux.**
Il ne dit jamais d'acheter ou de vendre.
Il ne produit pas d'alertes actionnables.

**Caméléon n'est pas un journal de trading.**
Il n'enregistre pas les trades, ne calcule pas la performance historique,
ne produit pas de reporting.

**Caméléon n'est pas un outil d'analyse technique.**
Il n'affiche pas de graphiques, ne dessine pas de niveaux,
ne place pas d'indicateurs sur des prix.

**Caméléon n'est pas un coach.**
Il ne prescrit pas de comportements, ne félicite pas, ne corrige pas,
ne guide pas vers une "bonne décision".

**Caméléon n'est pas un produit communautaire.**
Il ne compare pas les utilisateurs entre eux, ne produit pas de classements,
ne valorise pas la validation sociale.

**Caméléon n'est pas un SaaS de croissance.**
Son architecture économique ne cherche pas la viralité,
l'acquisition massive, ou le rachat stratégique.

**Caméléon n'est pas un dashboard.**
Il ne présente pas de métriques simultanées en attente d'être lues.
Il produit des lectures séquentielles.

---

## V. Anti-dérives

*Les dérives suivantes commencent toutes par une décision raisonnable isolée.
L'accumulation de décisions raisonnables mais incohérentes produit la dilution.*

### Dérive par accumulation

Ajouter une feature parce qu'un utilisateur l'a demandée.
Puis une autre. Puis une autre. Chaque ajout semble raisonnable.
La somme produit un produit surchargé.

**Garde-fou :** chaque feature est évaluée dans l'ensemble de ce qui existe déjà.
La question n'est pas "est-ce utile ?" mais "est-ce que la somme reste Caméléon ?"

### Dérive par urgence commerciale

Un ralentissement des conversions pousse à ajouter un mécanisme de relance,
une offre limitée dans le temps, un pop-up de bienvenue.
Chaque élément isolé semble temporaire. La somme produit un produit
qui ressemble à ce qu'il ne doit pas être.

**Garde-fou :** aucun mécanisme de conversion ajouté sous pression.
La pression commerciale n'est jamais une raison suffisante pour violer la Loi 6.

### Dérive par socialisation

Ajouter un score visible, un leaderboard discret,
une comparaison entre sessions.
Ces éléments produisent de l'engagement à court terme
et détruisent la relation à long terme.

**Garde-fou :** aucun élément qui se compare à autre chose
qu'à soi-même dans le temps.

### Dérive par gamification

Badges, streaks, niveaux, récompenses pour des comportements d'usage.
Ces mécaniques créent de la dépendance comportementale, pas de la valeur réelle.

**Garde-fou :** aucun mécanisme de récompense.
La seule récompense est la qualité de la lecture.

### Dérive par notification

Commencer par une notification critique (urgence réelle),
puis ajouter une notification de suivi (raisonnablement utile),
puis une notification de réactivation (commercialement justifiée).
Le chemin de la notification vers le spam est court et pente douce.

**Garde-fou :** zéro notification par défaut.
Toute notification est opt-in et justifiée par une valeur fonctionnelle
irremplaçable.

### Dérive par internationalisation prématurée

Adapter le produit à des marchés différents en ajoutant des couches
de localisation, de personnalisation, de modes alternatifs.
La somme produit un produit générique.

**Garde-fou :** l'internationalisation suit la doctrine, elle ne la précède pas.
Un marché qui exige une dérive n'est pas un marché pour Caméléon.

---

## VI. Garde-fous structurels

*Ces règles s'appliquent quelle que soit la pression, quelle que soit
l'opportunité, quelle que soit l'évidence apparente de l'exception.*

**G1 — Aucun mécanisme de notification push par défaut.**
Zéro push par défaut. Opt-in uniquement.
Toute notification non fonctionnelle est interdite.

**G2 — Aucune fonctionnalité de comparaison sociale.**
Pas de classements, pas de scores partagés,
pas de comparaisons inter-utilisateurs.

**G3 — Aucun élément d'urgence commerciale.**
Pas de compte à rebours, pas d'"offre limitée",
pas de pop-up de conversion, pas de relance automatisée.

**G4 — Aucune dégradation artificielle de la version gratuite.**
La version gratuite offre moins de profondeur, jamais moins de dignité.

**G5 — Aucun dashboard agrégé.**
Le produit produit des lectures séquentielles.
Un tableau de bord avec plusieurs indicateurs simultanés n'est pas Caméléon.

**G6 — Aucune fonctionnalité qui retire de l'autonomie à l'utilisateur.**
Pas de verrou, pas de blocage punitif,
pas de restriction conditionnelle à un comportement passé.
La friction est toujours contournable.

**G7 — L'interface ne s'agite pas.**
Aucune animation décorative. Aucun élément qui réclame l'attention
sans raison fonctionnelle. Aucune transition rapide en condition de tension.

---

## VII. Interdits non négociables

*Ces éléments ne peuvent pas être introduits dans le produit,
quelle que soit la justification. Ils ne sont pas soumis à arbitrage.*

| Élément interdit | Raison fondamentale |
|---|---|
| Notifications push non fonctionnelles | Détruisent la présence calme |
| Score composite global visible | Réduit la lecture à un chiffre sans contexte |
| Urgence commerciale dans l'interface | Transforme le cockpit en vitrine |
| Gamification sous toute forme | Dépendance comportementale, pas de valeur |
| Preuve sociale / classement | Contredit la posture de miroir individuel |
| Dashboard analytique agrégé | Contredit la lecture séquentielle |
| Relance utilisateur automatisée | Viole Loi 4 et Loi 6 |
| Frustration artificielle de freemium | Viole Loi 2 |
| Couleurs feu de circulation (vert/rouge dur) | Réponse émotionnelle primaire incompatible |
| Exclamation ou majuscule d'emphase | Rupture de tonalité constitutive |

---

## VIII. Signaux de dilution du produit

*Leur présence individuelle n'est pas nécessairement critique.
Leur accumulation signale une dérive.*

- Le nombre de clics pour atteindre l'information principale augmente.
- Le nombre d'éléments visibles simultanément augmente.
- Une feature a été ajoutée pour "couvrir un cas utilisateur"
  sans question de doctrine préalable.
- Une métrique de croissance a orienté une décision d'interface.
- La version gratuite contient un élément qui provoque de la frustration visible.
- Un texte d'interface contient une formule qui qualifie de "call to action".
- Une couleur ou animation a été ajoutée pour "rendre vivant"
  un écran perçu comme trop calme.
- Un élément de l'interface communique indirectement une performance ou un résultat.
- Le mot "engagement" a été utilisé comme argument positif
  dans une décision produit.
- Un utilisateur influent a demandé quelque chose
  et la réponse a été "on verra" sans arbitrage de doctrine.

---

## IX. Test de compatibilité feature

*À appliquer avant toute validation d'une nouvelle fonctionnalité,
d'un nouveau message, ou d'un nouveau mécanisme.*

**Question 1 — Profondeur sans densité visible**
Est-ce que cette feature augmente la profondeur analytique ou perceptive
sans augmenter la surface visible de l'interface ?
Si elle augmente les deux, l'arbitrage est-il justifié ?

**Question 2 — Cohérence avec les 7 lois**
Est-ce que cette feature est compatible avec chacune des 7 lois ?
Une incompatibilité avec une seule loi est suffisante pour rejeter.

**Question 3 — Impact sur le silence**
Est-ce que cette feature réduit le silence de l'interface ?
Si oui, est-ce que la valeur apportée justifie cette réduction ?

**Question 4 — Longue durée**
Est-ce que cette feature produit de la valeur après deux ans d'usage,
ou seulement lors des premières semaines ?

**Question 5 — Autonomie préservée**
Est-ce que l'utilisateur peut ne pas utiliser cette feature
sans que l'expérience globale soit dégradée ?

**Question 6 — Résistance à la pression**
Est-ce que la justification tient si on retire la pression commerciale
ou la demande utilisateur qui l'a initiée ?
Si la feature n'existe que sous pression, elle est suspecte.

---

## X. Questions à se poser avant chaque release

### Sur le produit

1. Le produit tel qu'il sera livré est-il plus sobre ou moins sobre qu'avant ?
2. Un nouveau texte ou label a-t-il été ajouté qui ne passerait pas
   le test du vocabulaire banni ?
3. Une animation ou transition a-t-elle été ajoutée ?
   Est-elle signifiante ou décorative ?
4. Le silence de l'interface a-t-il été réduit ? Si oui, pourquoi,
   et est-ce justifié ?

### Sur l'économie

5. Cette release ajoute-t-elle un mécanisme qui rapproche du modèle
   d'un produit que Caméléon ne veut pas être ?
6. La version gratuite reste-t-elle honnête et représentative
   après cette release ?
7. La version payante approfondit-elle davantage
   ou accumule-t-elle davantage après cette release ?

### Sur la relation

8. Cette release change-t-elle la nature de la relation
   entre le produit et l'utilisateur ?
9. Le produit après release respecte-t-il autant l'autonomie
   de l'utilisateur qu'avant ?
10. Le produit après release est-il aussi calme qu'avant
    dans ses moments de tension ?

### Sur la doctrine

11. L'un des dix interdits absolus a-t-il été introduit,
    même partiellement ?
12. Un signal de dilution parmi ceux listés est-il présent
    après cette release ?
13. Cette release aurait-elle été approuvée par la version
    de ce document en vigueur au moment où le produit a été fondé ?

*Si l'une de ces 13 questions reçoit une réponse problématique,
la release mérite d'être revue avant publication.*

---

## Postface

Ce document n'est pas un idéal. C'est un contrat.

La pression vers la dilution est constante et légitime en surface :
les utilisateurs demandent des choses, les concurrents ajoutent des fonctionnalités,
les métriques pointent des lacunes.
Chaque pression isolée a une justification raisonnable.
La doctrine existe pour que la somme des réponses reste cohérente.

Un produit qui respecte ce document sur dix ans sera plus reconnaissable
qu'un produit qui ne le respecte pas sur deux ans.

---

*Créé le 2026-05-19. Document canonique.*
*Ne pas modifier sans arbitrage explicite de doctrine.*
*Document complémentaire : `docs/manifesto-cameleon-engine.md`*
