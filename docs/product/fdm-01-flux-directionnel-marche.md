# FDM-01 — Flux Directionnel du Marché

Caméléon Engine · Réflexion stratégique figée  
Date : 2026-06-04  
Statut : **Réflexion figée — aucune implémentation autorisée**

---

## Conditions de réouverture

Deux conditions doivent être réunies avant toute reprise de ce chantier :

**Condition 1 — Source de données**  
Identifier une source de données cohérente avec la doctrine Caméléon Engine permettant de calculer ou d'inférer le flux sans saisie manuelle de l'opérateur.

**Condition 2 — Effet cockpit irréductible**  
Démontrer un effet cockpit que les Market States actuels (range / compression / expansion / defense) ne produisent pas déjà — et qui modifie réellement la lecture ou la décision de l'opérateur.

En l'absence de ces deux conditions, FDM-01 reste un actif conceptuel non actionnable.

---

## A. Définition

### Qu'est-ce qu'un flux directionnel ?

Un flux directionnel est un vecteur de déplacement net du marché qui persiste dans le temps. Ce n'est pas une lecture ponctuelle — c'est une trajectoire. Le flux ne décrit pas ce que le marché fait à cet instant, mais ce vers quoi il se déplace sur une durée de plusieurs sessions, jours ou semaines.

Sa propriété fondamentale est la **persistance orientée**. Un flux existe quand une direction domine assez longtemps pour que les corrections ne l'effacent pas. Il n'est pas défini par l'amplitude des mouvements, mais par leur résultante dans le temps.

### Tendance vs Flux

La tendance est structurelle. Elle est définie par la géographie des prix : succession de plus-hauts croissants, de plus-bas croissants, ou leur inverse. Elle décrit où les prix sont allés. Elle se lit comme une séquence de points sur un graphe.

Le flux est énergétique. Il décrit la force derrière le mouvement, pas la trace qu'il laisse. Une tendance peut exister dans un flux faible — prix qui montent, mais lentement, sans conviction. Un flux peut exister avant qu'une tendance soit formellement identifiable — marché en range qui dérive progressivement dans une direction sans casser de structure.

La tendance dit : "les prix ont monté."  
Le flux dit : "avec quelle force, depuis combien de temps, et est-ce que cette force s'intensifie ou se dissipe."

### Impulsion vs Flux

Une impulsion est bornée. Elle a un départ, une extension, une fin. Elle se produit généralement sur un horizon court (M15 à H4) et constitue un moment discret dans le temps.

Le flux est le contexte dans lequel les impulsions s'inscrivent. Plusieurs impulsions dans la même direction composent progressivement un flux. Une impulsion peut aller contre le flux — correction dans un flux baissier — sans l'invalider.

L'impulsion est un événement. Le flux est un état durable.

### Volatilité vs Flux

La volatilité mesure l'amplitude des oscillations, sans direction. Un marché à haute volatilité peut osciller également dans les deux sens, produisant un flux net nul. Un marché à faible volatilité peut dériver silencieusement dans une direction pendant des semaines, produisant un flux fort.

La volatilité et le flux sont orthogonaux. Ils ne se substituent pas. Un flux intense peut coexister avec une faible volatilité — marché calme mais orienté. Une forte volatilité peut masquer un flux nul — marché agité sans direction nette.

Volatilité = amplitude d'oscillation.  
Flux = déplacement net orienté dans le temps.

---

## B. Variables identifiées

**Direction**  
Haussier / Baissier / Neutre. La direction du flux n'est pas équivalente à l'état du marché instantané — elle porte une durée implicite. Un marché en `range:stable` peut s'inscrire dans un flux baissier multi-semaines.

**Intensité**  
Le rapport entre déplacement net et amplitude totale sur la période. Un flux intense produit un déplacement important relativement aux oscillations. Un flux faible produit un déplacement marginal malgré une activité de marché visible. L'intensité qualifie la résistance rencontrée — un marché qui avance contre des ventes massives produit un flux intense, pas seulement rapide.

**Durée**  
Une durée courte (quelques heures) = impulsion. Une durée moyenne (quelques jours) = flux en formation. Une durée longue (semaines) = flux établi. La durée conditionne le poids qu'on peut lui accorder — un flux de 2 jours est différent d'un flux de 3 semaines, même d'intensité comparable.

**Accélération**  
Le flux se renforce — chaque unité de temps produit plus de déplacement que la précédente. Signal d'un flux qui mûrit ou qui entre en phase terminale de puissance.

**Ralentissement**  
Le flux s'affaiblit — déplacement par unité de temps décroissant, sans inversion de direction. La zone où les décisions prises en présumant la continuation ont les taux d'échec les plus élevés.

**Essoufflement**  
Cas extrême du ralentissement : le flux a perdu presque toute vélocité sans s'inverser encore. Le marché semble stable, mais c'est la stabilité d'un corps qui a épuisé son élan. Variable la plus dangereuse cognitivement — elle crée une impression de sécurité là où la transition est imminente.

**Inversion**  
Changement de direction du flux. Peut être brusque — rupture structurelle — ou progressif — glissement sur plusieurs sessions. L'inversion confirme que le flux précédent est clos. Elle ne crée pas automatiquement un nouveau flux : il peut y avoir une période neutre entre deux flux.

---

## C. Relations avec Caméléon Engine

### Market States

Les quatre états actuels (range / compression / expansion / defense) sont des lectures instantanées. Ils capturent la structure du marché à un moment donné, dans une session, sur un ou plusieurs timeframes.

Le flux directionnel est une couche temporelle différente. Elle ne remplace pas les Market States — elle les contextualise.

Exemple : `expansion:stable` aujourd'hui + flux baissier fort depuis 10 jours → l'expansion est probablement une correction dans le flux dominant, pas un renversement. `compression:stable` + flux baissier qui ralentit → la compression pourrait signaler une transition.

La relation n'est pas une substitution. C'est une lecture à deux résolutions : la session (Market States) et la période (flux).

L'incongruence entre les deux est potentiellement le signal le plus informatif — quand l'état instantané contredit le flux établi, on entre dans une zone à pression décisionnelle élevée.

### Comportement

C'est le lien le plus irréductible identifié dans cette réflexion.

Le module comportemental actuel lit les patterns d'exécution — impulsif, réactif, discipliné, agressif — sans savoir si ces patterns ont été générés dans un contexte favorable ou hostile. Un opérateur qui prend 10 trades à contre-sens dans un flux baissier fort est différent d'un opérateur qui prend 10 trades identiques dans un marché neutre.

Le FDM-01 permettrait de qualifier le contexte de marché dans lequel les comportements se sont produits. Ce n'est pas un score de performance — c'est une lecture de cohérence entre le comportement observé et le flux actif au moment des décisions.

Sans cette couche, le moteur comportemental évalue les décisions hors contexte. Il dit "tu as tradé de manière impulsive." Il ne dit pas "tu as tradé de manière impulsive contre un flux intense."

### Guard states et cockpit

Les 5 états (Ancré → Rupture) sont calculés à partir du score moteur instantané. Le flux n'y a aucune influence aujourd'hui.

Le lien potentiel est indirect : un opérateur dont le score moteur est en Dérive (niveau 4) dans un flux fort contre lui a une lecture différente d'un opérateur au même niveau dans un marché neutre. La Dérive est plus risquée dans le premier cas.

Cette connexion ne nécessite pas de modifier les guard states eux-mêmes — elle s'exprimerait dans la lecture du cockpit, pas dans le moteur.

### Lecture du risque

Le niveau de risque actuel (low / medium / high) est une fonction de `state × modifier`. Il est par construction aveugle au flux.

Une `compression:stable` — actuellement risque LOW — dans un flux baissier prolongé et intense n'est pas la même chose qu'une `compression:stable` dans un marché neutre. La compression peut être une pause avant continuation, pas avant inversion.

Le flux modulerait la lecture du risque sans la remplacer — il ajouterait un qualificateur contextuel.

---

## D. Risques conceptuels

**Confusion avec les tendances classiques**  
C'est le risque dominant. "Flux directionnel" peut être entendu comme "tendance" — terme saturé, surinterprété, omniprésent dans l'analyse technique. Si FDM-01 se résume à "le marché est haussier ou baissier sur plusieurs jours", il ne produit rien de nouveau et risque de contaminer le vocabulaire de Caméléon Engine avec des catégories déjà freeware. La protection passe par une définition centrée sur la dimension énergétique — intensité, durée, essoufflement — et la relation comportementale, pas la structure de prix brute.

**Redondance avec l'état expansion**  
L'état `expansion` décrit déjà un marché en mouvement directionnel. La question légitime : le flux n'est-il pas simplement un `expansion` mesuré sur une durée plus longue ? La réponse est non. Un flux baissier de 15 jours contient des sessions `expansion:stable` (accélération), `range:stable` (consolidation), `compression:stable` (pause avant continuation). L'état varie ; le flux est stable. Si le FDM-01 ne peut exister que dans des sessions `expansion`, il est redondant.

**Complexité inutile**  
Si le FDM-01 exige que l'opérateur évalue lui-même la direction, l'intensité et la durée du flux avant chaque session, il ajoute un formulaire à un moteur qui travaille à réduire la charge cognitive. C'est une contradiction doctrinale directe. Ce risque est insoluble tant que le FDM-01 n'a pas de source de données identifiable.

**Faux signal narratif**  
Un cockpit qui formule "le flux est baissier et intense" oriente la lecture du trader. C'est une pente glissante vers le signal directionnel — ce que Caméléon Engine refuse par doctrine. La description du flux doit être une lecture de contexte, pas une recommandation. La ligne de partage est fine et peut se rompre dans l'implémentation. Le risque n'est pas conceptuel — il est de formulation.

---

## E. Conclusion

### FDM-01 est-il un pilier structurel ou une reformulation ?

Ce n'est pas une reformulation. Les concepts existants ne couvrent pas la temporalité soutenue du flux, ni sa relation avec le comportement de l'opérateur dans un contexte de marché orienté. La distinction tendance / état / flux est réelle et opérationnellement pertinente.

Ce n'est pas encore un pilier structurel. Les deux conditions de réouverture documentées en tête de ce fichier restent à satisfaire.

### Verdict

FDM-01 est un concept légitime et non redondant dans la mesure où il est défini comme une couche temporelle contextualisant les sessions — pas comme un indicateur directionnel. Il mérite d'être conservé comme actif conceptuel.

La question ouverte qui conditionne tout : d'où vient le flux ? Répondre à cette question transformera FDM-01 d'une hypothèse conceptuelle en un chantier réel.
