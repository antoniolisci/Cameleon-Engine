# Étude de faisabilité — Caméléon Engine comme miroir comportemental

> Statut : étude de faisabilité produit. Aucune implémentation immédiate.
> Aucun chantier ouvert. Aucune modification de la roadmap officielle.
> À relire lors du chantier Mémoire opérateur et après les premiers utilisateurs réels.

---

## Diagnostic honnête

L'orientation est juste. La direction est bonne. Mais il y a un goulot
d'étranglement architectural qui rend la plupart des fonctionnalités du miroir
inaccessibles aujourd'hui — et ce n'est pas la logique de détection qui manque.
C'est la profondeur de données.

20 sessions FIFO. C'est la limite actuelle du stockage comportemental. 20 sessions
de trading représentent 4 à 6 semaines pour un trader actif. Sur cette fenêtre,
un "pattern" détecté 2 ou 3 fois n'est pas un pattern — c'est du bruit.

Le miroir comportemental suppose une mémoire longue.
La mémoire longue suppose une infrastructure qui ne plafonne pas à 20 entrées.

Tout le reste découle de ce constat.

---

## 1. Mémoire opérateur comme miroir

### Ce qui est possible maintenant

Le moteur comportemental stocke déjà des sessions avec score, label et patterns
détectés. Techniquement, on peut déjà répondre à *"tu as eu ce pattern N fois
dans tes 20 dernières sessions"*. La donnée est là. Elle n'est pas encore
surfacée comme miroir — elle est utilisée comme score.

Sans nouvelle infrastructure :
- Fréquence d'un pattern dans la fenêtre des 20 sessions
- Évolution du score sur les N dernières sessions
- Label le plus fréquent sur la période

### Ce qui manque

**Volume.** 20 sessions ne permettent pas de distinguer une tendance d'un
incident. Pour un miroir crédible, il faut probablement entre 50 et 100 sessions
(seuil indicatif, non validé terrain — dépend de la variance comportementale
de chaque utilisateur). En dessous, tout diagnostic est statistiquement fragile.

**Persistance long terme.** La dette FIFO 20 sessions est documentée dans le
projet. Mémoire opérateur est le chantier 2 de la roadmap. Tant que cette dette
n'est pas résolue, le miroir voit dans un rétroviseur très court.

**Ancrage temporel.** Pour dire *"cette configuration ressemble à ce que tu as
vécu le [date]"*, il faut un stockage daté et interrogeable — pas une file FIFO.

### Pourquoi la mémoire longue est nécessaire

Un miroir basé sur 20 sessions dira souvent des choses vraies par chance et
des choses fausses par manque de données. La confiance de l'utilisateur dans
le miroir s'établit sur la précision, pas sur la fréquence des messages.
Un miroir qui se trompe une fois sur cinq est un miroir qu'on arrête de consulter.

---

## 2. Détection des écarts — déclaré vs réel

### Ce qui est mesurable sans déclaration

Avec les exports actuels (Trade History + Order History) :

- Activité après perte — volume de trades dans l'heure suivant une perte
- Taille incohérente — CV de position par symbole (PS-01 déjà implémenté)
- Annulations fréquentes — ratio ordres annulés / exécutés
- Concentration des pertes — clustering temporel des trades négatifs
- Durée de session — faisable si timestamps présents dans les exports

Ces mesures ne requièrent aucune saisie utilisateur. Elles sont les plus robustes.

### Ce qui exige une déclaration utilisateur

La comparaison *"tu dis X, tu fais Y"* suppose de capturer ce que l'utilisateur
déclare. C'est le problème central. Ajouter un champ *"décris ton plan avant
cette session"* est tentant conceptuellement, mais c'est une UX risquée sur
un public large.

Nuance : les traders qui utilisent déjà des journaux de trading (Edgewonk,
Tradervue, Tradezella) remplissent effectivement des checklists avant session.
Ce profil est précisément proche du profil cible de Caméléon Engine. La
déclaration pré-session peut fonctionner — sur le bon profil, avec la bonne
forme. L'hypothèse "les traders ne remplissent pas de formulaires" est vraie
en général, pas universellement.

La forme réaliste à tester : 2 questions fermées binaires maximum avant session,
posées dans la logique du cockpit existant. *"As-tu un setup défini aujourd'hui ?"*
(oui / non). À valider en entretien utilisateur avant tout développement.

### Risque d'affirmer sans référentiel

Affirmer *"tu ne respectes pas ton plan"* sur la base de comportements mesurés
sans avoir capturé le plan est un diagnostic sans référentiel. C'est le cas
le plus dangereux psychologiquement — accuser sans preuve.

Règle : ne jamais inférer l'intention de l'utilisateur à partir du comportement
observable seul.

---

## 3. Patterns invisibles

### Patterns détectables maintenant

- Suractivité après perte — densité temporelle post-perte (déjà partiellement détecté)
- Taille augmentée après drawdown — comparaison size avant/après perte
- Annulations → contexte de décision modifié — séquence ordres annulés / trades suivants
- Pertes concentrées après gains — corrélation sessions consécutives

### Patterns qui exigent des données futures

- Heure / plage horaire — conditionnel à des timestamps fiables en heure locale
  (les exports Binance sont en UTC, la conversion exige une saisie du fuseau)
- Dérive comportementale sur plusieurs mois — impossible avec 20 sessions FIFO,
  requiert Mémoire opérateur débloquée
- Durée de session vs résultat — exige de définir les frontières d'une session,
  non trivial avec des imports CSV couvrant plusieurs semaines

### Règle des 5 occurrences minimum

Ne jamais afficher un diagnostic comportemental basé sur moins de 5 occurrences
confirmées. En dessous de ce seuil, le moteur se tait.

Le seuil de 5 est un point de départ, pas une vérité statistique. Il devra
être calibré sur données terrain réelles : certains comportements sont fiables
à 3 occurrences si la variance est faible ; d'autres restent bruités à 10.
Ce seuil est à traiter comme une hypothèse à tester, pas comme une règle figée.

Ce qui est figé : le principe. Le moteur se tait en dessous d'un seuil de
confiance. Le silence est une décision de design, pas un manque de données.

---

## 4. Moteur de friction

### Fondation actuelle

Le moteur de friction V2 existe. La chaîne tension → hiérarchie → exposition →
attention est implémentée. Le silence structurel est la règle par défaut.
C'est une fondation solide.

### Ce qui manque : l'ancrage historique

Le moteur actuel dit *"tu es dans un état fragile maintenant"*.
Le miroir dirait *"les dernières fois où tu étais dans cet état, voilà ce qui
s'est passé"*. Ce deuxième message est plus fort, plus crédible, et plus difficile
à ignorer — mais il exige de la mémoire longue.

### Règle centrale : décrire, ne pas juger

La différence entre un message utile et un message culpabilisant est dans la
structure linguistique, pas dans le contenu.

- "Tu es en train de revenge trader." → culpabilisant
- "Ton activité a augmenté après la dernière perte." → utile

- "Tu n'as pas respecté ton plan." → culpabilisant
- "Cette configuration sort de ton pattern habituel." → utile

- "C'est une mauvaise décision." → culpabilisant
- "Les 3 dernières situations similaires ont mené à des résultats négatifs." → utile

Le moteur rapporte des faits observés. L'utilisateur interprète et décide.
Dès que le message contient un jugement implicite, il cesse d'être un outil
et devient un juge.

### Éviter le paternalisme

Un moteur qui intervient souvent finit par être ignoré ou désactivé.
La fréquence d'exposition doit rester rare pour que chaque message ait du poids.
La doctrine du silence structurel déjà en place s'applique ici sans exception.

### Avertissement : la dérive vient des noms, pas des formulations

La règle "décrire, ne pas juger" protège les messages. Elle ne protège pas
les noms des comportements détectés. Si un pattern s'appelle "décision fragile",
"excès d'activité" ou "comportement impulsif", le jugement est dans l'ontologie
du moteur — pas dans la phrase qui l'affiche.

Avant toute implémentation du miroir, auditer la liste complète des noms de
patterns dans le moteur comportemental. Un nom de pattern est un message
permanent. Il doit être aussi neutre que les formulations d'exposition.

---

## 5. Trajectoire comportementale

### Ce qui est calculable maintenant

Avec les sessions existantes, on peut déjà calculer :
- Évolution du score moyen sur 5 / 10 / 20 sessions
- Fréquence de chaque label par période
- Fréquence d'apparition de chaque pattern dans le temps

Les données sont là. L'interface pour les afficher n'existe pas encore.

### Distribution plutôt qu'étiquette unique

Ne pas montrer une étiquette unique par utilisateur. Montrer une distribution.

*"Sur tes 20 dernières sessions : Discipliné 8 fois, Réactif 7 fois, Impulsif 5 fois"*
est plus utile et plus honnête que *"ton profil : Impulsif"*.

L'étiquette unique encourage la résignation.
La distribution encourage l'observation.

### Ne pas promettre de corrélation immédiate avec le PnL

Un utilisateur qui voit *"ton score comportemental progresse"* alors que son
compte régresse risque de conclure que le moteur ment. Le progrès comportemental
n'implique pas une amélioration immédiate du PnL. Ces deux variables sont liées
à long terme, pas à court terme.

Ce lien doit être explicitement nommé dans l'interface — ou la trajectoire
crée une fausse promesse.

---

## 6. Preuves terrain à collecter

### Verbatims prioritaires

Deux phrases à rechercher explicitement en entretien utilisateur :

> *"J'ai vu quelque chose que je ne voyais pas avant."*

> *"Ça m'a empêché de faire une connerie."*

Ces verbatims ne peuvent pas être instrumentés dans un dashboard. Ils s'obtiennent
uniquement par conversation directe, après au moins 4 à 6 semaines d'usage réel.

### Métriques d'usage pertinentes

- Consultation du panel comportemental pendant une session active (pas après)
- Fréquence d'import — un utilisateur qui importe toutes les semaines croit
  que le moteur lui montre quelque chose d'utile
- Retour après une mauvaise session — si l'utilisateur consulte le moteur après
  une perte, il cherche le miroir

### Signe de transformation comportementale réelle

Pas un score en hausse. Pas un PnL amélioré.

Un signe significatif : un changement dans la façon dont l'utilisateur parle
de lui-même. *"J'ai tendance à..."* au lieu de *"le marché m'a piégé"*.

Ce déplacement d'attribution — de l'externe vers l'interne — ne se mesure pas
avec des métriques. Il s'entend en entretien.

Nuance importante : l'attribution interne n'est pas la finalité en soi.
L'objectif est la lucidité, pas la culpabilité. Un utilisateur qui intériorise
toutes ses pertes comme une faute personnelle est aussi dysfonctionnel que celui
qui blâme systématiquement le marché. Le signal de transformation valide n'est
pas *"c'est ma faute"* — c'est *"j'observe que j'ai tendance à faire X dans
ces conditions"*. L'observation sans verdict.

---

## 7. Risques

### Risques produit

**Faux diagnostic à faible volume.**
Afficher un pattern basé sur 2 ou 3 occurrences produit un diagnostic non fiable
qui peut éroder la confiance de façon définitive. Un utilisateur à qui on dit
*"tu revenge trades"* sur la base de 2 sessions va soit rejeter le produit,
soit accepter une étiquette qui n'est pas la sienne.

**Miroir qui devient juge.**
La dérive est progressive et difficile à voir de l'intérieur. Chaque message
légèrement prescriptif rapproche le moteur d'un coach simpliste que le projet
veut explicitement éviter.

**Sur-ajustement aux early adopters.**
Les 10 premiers utilisateurs ne représentent pas l'ensemble du profil cible.
Construire le miroir sur leurs retours spécifiques risque de produire un outil
taillé pour un profil unique.

### Risques techniques

**20 sessions FIFO.**
Tout ce qui dépasse la fenêtre actuelle est architecturalement bloqué. Ce n'est
pas un détail — c'est la condition préalable à tout miroir sérieux. Ce chantier
est déjà dans la roadmap (Mémoire opérateur, position 2). Il doit rester en
position 2.

**Qualité des timestamps.**
L'analyse heure / plage horaire suppose des timestamps fiables en heure locale.
Les exports Binance sont en UTC. La conversion implique une saisie du fuseau
horaire par l'utilisateur — friction supplémentaire.

**Frontière de session floue.**
Avec des imports CSV couvrant plusieurs semaines, la délimitation des sessions
n'est pas triviale. Les patterns inter-sessions ne peuvent pas être calculés
sans cette frontière.

### Risques psychologiques et UX

**Anxiété plutôt que clarté.**
Un miroir qui montre systématiquement les moments difficiles peut devenir une
source de honte plutôt qu'un outil de progression. Le ton des messages est
critique — et il doit être testé en conditions réelles.

**Étiquetage figé.**
Si l'utilisateur se voit répéter les mêmes patterns pendant 6 mois, il risque
de les accepter comme une identité plutôt que comme un comportement modifiable.
La trajectoire doit toujours être orientée vers l'ouverture.

**Dépendance au miroir.**
Un outil comportemental réussi devrait rendre l'utilisateur progressivement
moins dépendant de lui — il intègre les apprentissages. Un miroir trop présent
peut créer une dépendance à la validation externe. La doctrine *"soutenir
l'autonomie plutôt que remplacer l'humain"* s'applique ici directement.

**Résistance sans changement.**
Le document suppose implicitement que l'utilisateur est réceptif à ce que le
miroir lui montre. Ce n'est pas garanti. Un utilisateur peut voir ses patterns,
les reconnaître, et continuer le même comportement — parce que modifier un
comportement de trading nécessite bien plus que de la conscience. Dans ce cas,
le miroir ne produit pas de transformation : il produit de la honte chronique
sans issue. Ce cas doit être anticipé dans la conception des messages, pas
traité comme un échec utilisateur.

**Biais de confirmation.**
Beaucoup de traders pensent déjà savoir ce que le miroir va leur montrer.
Pour eux, le miroir ne révèle rien — il confirme un narratif préexistant,
parfois négatif (*"je le savais, je suis impulsif"*). La confirmation d'une
identité dysfonctionnelle n'est pas une transformation. Le miroir doit montrer
ce que l'utilisateur ne voyait pas — pas valider ce qu'il croyait déjà voir.

---

## 8. Recommandations

### Prérequis avant toute implémentation du miroir

**Auditer les noms des patterns actuels.**
Avant d'afficher quoi que ce soit à l'utilisateur, auditer la liste complète
des noms de comportements détectés dans le moteur. La règle "décrire, ne pas
juger" s'applique aux noms autant qu'aux messages. Un pattern nommé "décision
fragile" ou "comportement impulsif" transmet un jugement indépendamment de la
formulation de la phrase qui l'affiche. Cet audit est un prérequis, pas une
tâche optionnelle.

### À intégrer dans la roadmap actuelle

**Surfacer la fréquence des patterns dans l'UI existante.**
Les données sont là. Le comptage *"tu as eu ce pattern N fois sur tes 20 dernières
sessions"* est faisable aujourd'hui, sans nouvelle infrastructure. C'est le
premier pas vers le miroir, avec le moindre risque.

**Trajectoire score — visualisation légère.**
Afficher l'évolution du score comportemental sur les N dernières sessions.
Données déjà stockées. Non-risqué si la contextualisation de l'incertitude
est présente dans l'interface.

**Règle des 5 occurrences minimum.**
Avant tout affichage de diagnostic comportemental, imposer un seuil minimum.
En dessous de 5, le moteur se tait. Ce n'est pas une fonctionnalité — c'est
une règle de design.

### À documenter pour plus tard

**Ancrage historique contextuel.**
*"Tu as déjà vécu ça — session du [date]."* Conditionnel à Mémoire opérateur
débloquée et à un stockage indexé par date. À documenter maintenant,
implémenter après le chantier 2.

**Détection d'écarts déclaré / réel.**
Faisable uniquement avec un mécanisme de déclaration minimaliste (2 questions
binaires max avant session). À prototyper en entretien utilisateur avant
toute implémentation.

**Patterns heure / plage horaire.**
Faisable sous conditions (timestamps UTC → heure locale, saisie fuseau).
À tester sur données personnelles, à différer en produit.

### À éviter

**Toute forme de diagnostic psychologique.**
*"Tu as un comportement impulsif"* est une affirmation que le moteur n'a pas
la légitimité de faire. Le moteur décrit des comportements observés dans des
données. Il ne diagnostique pas une personnalité.

**Miroir permanent à haute fréquence.**
Un miroir qui commente chaque session érode sa propre crédibilité. La rareté
des messages est une propriété de design, pas un manque d'ambition.

**Construction du miroir complet avant validation du miroir minimal.**
La trajectoire score + fréquence des patterns est le miroir minimal. Il faut
le mettre devant de vrais utilisateurs et évaluer si la direction crée de la
valeur réelle — avant d'ajouter l'ancrage historique, la déclaration utilisateur
et les patterns temporels.

---

## Règles doctrinales permanentes

Ces règles doivent être élevées au niveau du manifeste produit, pas maintenues
comme simples recommandations. Elles protègent la frontière entre miroir et juge.

**Règle MIR-01 — Décrire, ne pas juger.**
Le moteur rapporte des faits observés dans les données. Il n'évalue pas la
qualité d'une décision, d'un comportement ou d'une personnalité.
S'applique aux messages, aux noms de patterns, aux labels, aux titres d'interface.

**Règle MIR-02 — Ne jamais inférer l'intention à partir du comportement observable seul.**
Affirmer qu'un utilisateur n'a pas respecté son plan, qu'il a revenge tradé,
ou qu'il a manqué de discipline sans avoir capturé sa déclaration préalable
est un diagnostic sans référentiel. C'est interdit.

**Règle MIR-03 — Le moteur ne diagnostique pas une personnalité.**
*"Tu as un comportement impulsif"* est une affirmation clinique que le moteur
n'a pas la légitimité de faire. Le moteur décrit des comportements observés
dans des données à un moment donné. Il ne qualifie pas ce que l'utilisateur est.

**Règle MIR-04 — La rareté des messages est une propriété de design.**
Un miroir qui commente chaque session érode sa propre crédibilité et glisse
vers le coaching. La fréquence d'exposition doit rester rare. Le silence
structurel s'applique au miroir exactement comme aux tensions V2.

---

## Verdict

Le miroir comportemental est la bonne direction. Il est cohérent avec la
philosophie fondatrice, différenciant, et non-reproductible par les outils
de signaux.

Mais il est aujourd'hui sous-alimenté par une infrastructure à courte mémoire.
Le chantier qui débloque tout — Mémoire opérateur — est en position 2 de la
roadmap pour une bonne raison. C'est là que l'investissement doit aller en
premier, pas dans de nouvelles fonctionnalités de miroir construites sur
20 sessions.

La séquence juste :

1. Résoudre la mémoire longue (chantier Mémoire opérateur)
2. Tester le miroir minimal (trajectoire score + fréquence patterns)
3. Collecter les verbatims terrain
4. Décider des axes suivants sur la base du terrain, pas des hypothèses

L'objectif produit à valider sur le terrain reste :

> *"J'ai vu un comportement que je ne voyais pas avant."*
> *"Ça m'a empêché de faire une connerie."*

Ces deux phrases, dans la bouche d'un utilisateur réel, valident la direction
mieux que n'importe quelle étude de faisabilité.
