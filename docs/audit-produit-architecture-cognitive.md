# Audit produit — Caméléon Engine
## Architecture cognitive du cockpit décisionnel

> Audit produit de référence.
> Ce document sert à guider les futurs arbitrages UX, wording, hiérarchie cognitive et architecture narrative du cockpit.
> Il ne déclenche aucune modification automatique du code.

---

## Le diagnostic profond

Le problème que tu décris n'est pas un problème d'interface. C'est un problème de modèle mental incohérent. L'utilisateur reçoit deux récits parallèles qui ne se parlent pas :

- Le récit marché : "voilà ce qui se passe dehors"
- Le récit comportement : "voilà ce que tu n'as pas le droit de faire"

Ces deux récits sont sur le même plan visuel, avec la même intensité, le même statut perceptuel. Le cerveau de l'utilisateur tente de les fusionner en une seule réalité — et n'y arrive pas. D'où la sensation de produit cassé.

La vérité profonde : ce ne sont pas deux informations contradictoires. Ce sont deux couches d'une même décision. Le cockpit ne les a pas hiérarchisées comme telles. Il les juxtapose comme des verdicts concurrents.

Un trader expérimenté lit naturellement : contexte marché → contexte personnel → décision finale. Le cockpit doit reproduire cette séquence, pas afficher un tableau de scores parallèles.

---

## La hiérarchie cognitive à reconstruire

Le cockpit doit fonctionner en trois couches narratives empilées, jamais juxtaposées :

**Couche 1 — Lecture du monde (l'extérieur)**
Ce que fait le marché. Factuel, neutre, descriptif. Cette couche n'autorise rien et n'interdit rien. Elle décrit. C'est la météo.

**Couche 2 — Lecture de soi (l'intérieur)**
L'état comportemental, la capacité d'exécution actuelle, l'historique récent. Cette couche ne juge pas le marché. Elle lit l'utilisateur.

**Couche 3 — Synthèse de confiance (la rencontre)**
La seule couche qui produit un verdict. Elle s'exprime en niveau de confiance d'exécution, pas en autorisation/blocage. C'est le résultat de la rencontre entre la couche 1 et la couche 2.

**L'erreur actuelle :** les couches 1 et 2 produisent chacune leur propre verdict visuel. Il faut qu'elles soient des inputs lisibles d'un seul verdict de synthèse.

---

## La séparation visuelle nécessaire

Trois zones, trois statuts perceptuels distincts :

**Zone Observation** — typographie sobre, ton descriptif, aucune charge émotionnelle. C'est un journal de bord, pas une alarme. Le marché est cassé à la hausse : ce n'est ni bien ni mal, c'est un fait.

**Zone Conscience** — visuellement plus intime, presque un miroir. C'est ici que vit le caméléon (les cinq états). Cette zone parle à la première personne implicite : "tu es en friction", pas "accès suspendu". Ce n'est pas un système de sécurité, c'est un reflet.

**Zone Décision** — la plus importante visuellement, mais paradoxalement la plus calme. Elle exprime un curseur de confiance, pas un feu rouge/vert. Elle synthétise les deux zones précédentes en un seul indicateur graduel.

**La règle absolue :** jamais deux verdicts forts simultanés à l'écran. Un seul point de vérité visuel. Les autres zones nourrissent ce point.

---

## Le wording qui détruit la confiance

Voici les registres qui transforment un copilote en gardien de prison :

**Registre carcéral** — "accès suspendu", "verrouillé", "interdit", "bloqué", "refusé". Ces mots positionnent le produit comme une autorité externe qui punit. Mortel pour un cockpit premium.

**Registre médical d'urgence** — "stop", "alerte", "danger", "protection active". Le trader se sent malade ou incompétent. Ces mots sont conçus pour des situations où l'utilisateur ne sait pas ce qu'il fait. Or l'utilisateur sait.

**Registre paternaliste** — "pour ton bien", "ne fais pas", "attention". Infantilisant. Le trader pro fuit ce registre.

**Registre contradictoire** — "opportunité détectée" + "exécution interdite" sur le même écran. C'est ici que naît la sensation de produit cassé. Le cerveau lit "le produit dit oui et non en même temps".

**Le registre à adopter :**

- Lecture : "le marché présente une expansion validée"
- Conscience : "tu sors d'une séquence de friction, ta lucidité est partielle"
- Synthèse : "confiance d'exécution réduite — 40%"

Aucune contradiction. Trois faits empilés qui produisent une nuance, pas un blocage.

---

## Du blocage à la friction intelligente

C'est le cœur philosophique du repositionnement. Le passage à effectuer :

- Avant : le cockpit décide pour l'utilisateur (interdit/autorise).
- Après : le cockpit augmente la conscience de l'utilisateur, qui décide.

Concrètement, trois mécanismes remplacent le blocage :

**Le niveau de confiance d'exécution** — un curseur de 0 à 100%. Ce n'est pas une autorisation. C'est une lecture. À 30%, le trader voit qu'il est en zone basse. À lui de décider s'il prend quand même. Le cockpit n'est pas son patron, c'est son miroir lucide.

**La friction graduelle** — plus la confiance baisse, plus l'action exige de gestes conscients. À haute confiance : un clic. À basse confiance : une confirmation explicite, peut-être un délai de quelques secondes, peut-être la lecture d'une phrase qui résume le contexte. Pas de blocage. Un ralentissement du geste impulsif juste assez pour que la conscience rattrape la pulsion.

**La contextualisation narrative** — quand la confiance est basse, le cockpit explique pourquoi, en une phrase, factuellement. "Trois pertes consécutives sur les 4 dernières heures, momentum personnel dégradé." Pas de jugement. Une lecture.

La différence philosophique : le blocage retire le pouvoir, la friction le rend coûteux en conscience. Un trader pro accepte le second, jamais le premier.

---

## Comment éviter le ressenti "moteur cassé"

Le ressenti "cassé" naît quand l'utilisateur ne peut pas expliquer la cohérence du système avec ses propres mots. Trois leviers :

**La traçabilité narrative** — chaque état affiché doit pouvoir être expliqué par une phrase courte que l'utilisateur peut produire lui-même. Si on voit "confiance 35%", on doit pouvoir dire à voix haute "ah oui, parce que je sors d'une série de pertes". Si ce n'est pas possible, le système est opaque, donc cassé.

**L'unicité du verdict** — un seul indicateur de synthèse à l'écran. Toutes les autres données sont des éléments de lecture, visuellement subordonnés. Le cerveau humain tolère mille données, mais un seul verdict.

**La cohérence temporelle** — les états ne doivent pas sauter. Passer de "ancré" à "rupture" en un instant casse la confiance. Les transitions doivent être lisibles, presque géologiques. Le caméléon change de couleur progressivement, pas par flash.

**Le respect de l'intelligence du trader** — ne jamais cacher la donnée brute. Le marché va bien ? Le dire. L'état d'exécution est dégradé ? Le dire aussi. Mais montrer que ce sont deux choses différentes. C'est la métaconscience du produit qui rassure.

---

## Le modèle mental idéal

Le cockpit doit fonctionner comme un second cerveau lucide qui chuchote, pas qui hurle.

Trois métaphores justes :

**Le copilote d'avion** — il ne pilote pas, il lit les instruments à voix haute. Il dit "vent de travers, 15 nœuds, piste 24". Il ne dit pas "interdit d'atterrir". Le pilote décide. Mais le copilote rend la décision informée.

**Le sparring partner expérimenté** — il ne te bat pas, il révèle les angles morts. Il dit "tu baisses ta garde après trois coups". Il ne retire pas les gants.

**Le carnet de bord du marin** — il consigne les états du ciel, de la mer, de l'équipage. Le capitaine lit, synthétise, décide. Le carnet ne décide jamais.

Ces trois métaphores ont une chose en commun : l'autorité finale reste à l'utilisateur. Le système est augmentation cognitive, jamais substitution décisionnelle. C'est ça qui justifie un prix premium : pas la prise de décision, mais l'élargissement de la conscience décisionnelle.

---

## La présentation premium des quatre couches

Architecture narrative recommandée, en termes de présence et de poids :

**Marché** — présence permanente, ton neutre, faible charge émotionnelle. C'est le décor. Toujours là, jamais criant. "Expansion. Volume +30%. Cassure validée à 14h22."

**Setup** — présence conditionnelle, factuelle. Apparaît quand un setup est lu, disparaît sinon. Ne crie pas "opportunité". Dit simplement "setup type A identifié — alignement 4/5 critères". Le mot "opportunité" est un mot de vendeur, pas de cockpit pro.

**Risque comportemental** — présence permanente mais discrète. C'est le miroir. Le caméléon vit ici. Les cinq états sont des lectures de soi, pas des sanctions. "En veille active" est un état, pas une punition.

**Confiance d'exécution** — c'est le point focal du cockpit. Visuellement le plus présent, mais paradoxalement le plus calme. Un curseur, un pourcentage, une nuance. Pas de feu rouge. Pas de cadenas. Une température de confiance.

**La règle de composition :** aucune de ces quatre couches ne doit jamais contredire une autre. Elles doivent converger vers le curseur de confiance, qui est la seule synthèse autorisée à parler fort.

---

## La contradiction profonde à résoudre

Si ce cockpit doit incarner une seule chose, en une phrase :

> Le marché peut être parfait sans que ce soit le bon moment pour l'utilisateur — et ce n'est pas une contradiction, c'est une lecture mature de la réalité du trading.

Le rôle du cockpit n'est pas de réconcilier ces deux faits artificiellement. Son rôle est de les présenter comme deux dimensions distinctes d'une même réalité, et de produire une troisième information — la confiance d'exécution — qui est leur synthèse honnête.

**L'erreur produit actuelle :** "le marché dit oui" et "le comportement dit non" sont sur le même plan visuel. Le cerveau lit ça comme un bug.

**La cible :** "le marché dit ceci, l'état est celui-là, donc la confiance d'exécution est à ce niveau". Trois propositions enchaînées, pas deux propositions contradictoires.

C'est ce passage de la juxtaposition à la séquence narrative qui transforme un dashboard décoratif en cockpit décisionnel premium.
