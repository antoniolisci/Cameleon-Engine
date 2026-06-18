# Transitions opératoires et dérive progressive

**Chantier Constellium — Architecture comportementale**
**Statut : document fondateur — socle doctrinal — non implémentable**
**Date : 2026-05-25**
**Dépendances directes :** `audit-indicateurs-comportementaux.md` · `profils-operateurs-constellium.md`

---

> Les dérives apparaissent souvent dans les transitions.
> Le moteur doit distinguer adaptation et désintégration de structure.
> La calibration adapte l'interprétation. Elle ne blanchit jamais les dérives.

---

## 1. Pourquoi les profils seuls sont insuffisants

Un profil opératoire est une photographie. Une photographie ne suffit pas à comprendre un comportement vivant.

### Un opérateur n'est jamais statique

Le profil Range/Grid décrit un régime. Il ne décrit pas un opérateur figé dans ce régime. Un même opérateur peut traverser plusieurs profils au cours d'un mois selon les conditions de marché, son état cognitif, et les résultats accumulés. Cette mobilité est normale. Ce n'est pas une incohérence à corriger — c'est une réalité à lire.

Le problème commence quand cette mobilité devient invisible à l'opérateur lui-même.

### Un profil figé devient faux

Si le moteur attribue un profil et le stabilise sans le questionner, il produit une lecture de plus en plus déconnectée de la réalité comportementale. L'opérateur continue à être lu comme "Range/Grid" alors qu'il opère depuis trois semaines comme "Momentum/Expansion" sans l'assumer. Le profil devient un masque. Le moteur devient un miroir déformant.

### La dérive apparaît souvent dans les transitions

Les comportements les plus dangereux ne sont pas nécessairement les plus intenses. Ils sont souvent les plus progressifs. Un opérateur ne bascule pas du jour au lendemain dans un état d'impulsivité chronique. Il glisse. Il étend légèrement ses seuils. Il rationalise chaque écart isolément. Il maintient une cohérence de façade jusqu'au moment où le glissement devient structurel.

Ce glissement se passe dans les transitions — pas dans les états stables.

### La stabilité d'un profil est une information. L'instabilité aussi.

Un opérateur qui maintient un profil Défensif/Conservation de manière constante sur six mois transmet une information utile : soit une discipline réelle, soit une rigidité figée. Un opérateur dont le profil oscille toutes les deux semaines entre Range et Momentum transmet une autre information : soit une adaptabilité réelle, soit une instabilité opératoire.

Le moteur doit lire ces deux dimensions. Il ne doit pas valoriser automatiquement l'une plutôt que l'autre.

---

## 2. Typologie des transitions opératoires

Toutes les transitions ne sont pas des dérives. Certaines sont attendues, saines, nécessaires. La cartographie suivante distingue trois catégories.

### Transitions saines

Une transition saine est une adaptation cohérente à un changement de contexte lisible. Elle est articulable. L'opérateur peut expliquer pourquoi il a changé de posture.

**Exemples :**

- Passage temporaire en régime Défensif/Conservation lors d'un régime de marché hostile identifié — réduction d'exposition volontaire, fréquence basse, attente de clarté.
- Passage en Momentum/Expansion lors d'une expansion de volatilité directionnelle clairement établie — augmentation de fréquence cohérente avec la dynamique.
- Réduction volontaire d'activité après une série de pertes — pas une paralysie, mais un recalibrage délibéré.
- Adaptation à une réduction temporaire du capital disponible — tailles revues à la baisse, cohérence maintenue.
- Transition Range → Grid structuré lors d'une consolidation prolongée — extension naturelle du même régime.

Ce qui caractérise la transition saine : elle est proportionnée, lisible, et cohérente avec les conditions externes et internes. Elle ne produit pas de rupture de cohérence interne.

### Transitions neutres

Une transition neutre est un mouvement de faible amplitude qui ne constitue ni un signal positif ni un signal d'alerte.

**Exemples :**

- Expérimentation contrôlée d'une nouvelle méthode sur une faible allocation.
- Variation légère du rythme d'activité sans changement de structure.
- Rotation de paires tradées sans modification de la logique opératoire.
- Pause temporaire sans signal d'arrêt forcé.

Ce qui caractérise la transition neutre : elle ne modifie pas la structure opératoire de fond. Le profil dominant reste lisible.

### Transitions dangereuses

Une transition dangereuse est un glissement qui compromet la cohérence interne du profil sans que l'opérateur en ait nécessairement conscience.

**Cartographie des glissements dangereux :**

| Profil d'origine | Transition vers | Signal de glissement |
|---|---|---|
| Swing / Patience | FOMO — entrées impulsives | Réduction soudaine des fenêtres de décision |
| Range / Grid | Directionnel agressif | Extension des bandes sans recognition du changement de régime |
| Défensif / Conservation | Paralysie chronique | Absence totale d'activité sur des opportunités lisibles |
| Défensif / Conservation | Pari unique concentré | Accumulation progressive sur une seule conviction |
| Opportuniste / Rotation | Dispersion structurelle | Fragmentation sans logique de contexte articulable |
| Momentum / Expansion | Euphorie — surexposition | Augmentation d'exposition continue sans signal de continuation |
| Tout profil | Revenge trading masqué | Réentrée rapide après perte sur profil Swing ou Défensif |
| Tout profil | Évitement chronique | Activité en dehors du segment de compétence réel |

**La dérive n'est pas toujours un comportement isolé. Elle peut être une trajectoire.**

Un unique écart ne constitue pas une transition dangereuse. Trois écarts du même type sur une fenêtre courte commencent à en dessiner une. Cinq écarts cohérents en établissent une.

---

## 3. Dérive progressive

La dérive progressive est le phénomène le plus difficile à détecter, et le plus coûteux à ignorer.

### Comment une dérive devient "normale" statistiquement

Un opérateur qui élargit progressivement ses seuils d'entrée de 10% par semaine sur cinq semaines a, au terme de cette période, des seuils 50% plus larges que son niveau initial. À chaque étape, l'écart par rapport à la semaine précédente est faible. La calibration glissante le lira comme "le comportement habituel de cet opérateur."

C'est exactement le problème.

Un moteur adaptatif qui recalibre ses fenêtres de référence sur les données les plus récentes va progressivement normaliser la dérive. Il va apprendre que cet opérateur a des seuils larges — et s'y adapter. La dérive devient la nouvelle baseline. La dérive n'est plus détectable.

C'est le mécanisme central que l'architecture Constellium doit empêcher.

### Comment le moteur pourrait devenir aveugle

Trois mécanismes d'aveuglement progressif :

**Mécanisme 1 — La fenêtre glissante courte.** Si le moteur compare le comportement de l'opérateur à ses 30 dernières sessions, il compare la dérive à la dérive. La dérive récente devient la norme récente. Les écarts disparaissent.

**Mécanisme 2 — L'atténuation par fréquence.** Si un comportement est détecté fréquemment mais atténué parce que "c'est le style de cet opérateur", le moteur absorbe lentement les signaux. Ce qui déclenchait un warning au premier mois ne déclenche plus rien au sixième.

**Mécanisme 3 — La rationalisation contextuelle.** Si le moteur apprend à associer certains comportements à certains régimes de marché, il peut finir par attribuer une dérive à "un régime de marché difficile" plutôt qu'à une dégradation comportementale. Le contexte externe devient un alibi structural.

### Pourquoi les fenêtres longues sont importantes

La dérive progressive n'est visible qu'avec une référence distante. Si l'opérateur est comparé à son comportement de trois mois ago, les glissements deviennent mesurables. Si la comparaison est limitée aux deux dernières semaines, la dérive est invisible.

La mémoire comportementale du moteur doit maintenir des ancres temporelles longues — non pour punir le passé, mais pour rendre visible ce que la fenêtre courte efface.

### Déplacement silencieux du niveau de base

Le concept de déplacement silencieux de baseline est central.

Un opérateur dont le niveau de base comportemental se déplace progressivement sans rupture visible est dans un état de dérive structurelle. Il n'a pas "sauté" vers un comportement problématique. Il y est arrivé par accumulation d'ajustements infimes, chacun rationalisable isolément, tous cohérents dans leur trajectoire.

Le moteur doit maintenir un "niveau de base historique" distinct du "comportement récent". L'écart entre les deux est une information structurelle de premier ordre.

---

## 4. Stabilité opératoire

La stabilité d'un profil est une variable à lire, pas une valeur à maximiser.

### Ce qu'est un profil stable

Un profil stable est un ensemble de comportements qui se répètent avec une cohérence interne identifiable sur une fenêtre temporelle significative. Fréquence, taille de position, durée de détention, choix d'actifs — ces variables restent dans une plage cohérente.

La stabilité permet au moteur de construire une référence. Elle rend les écarts lisibles. Elle donne un sens à l'alerte.

### Ce qu'est une stabilité saine

Une stabilité saine est une cohérence qui reflète une approche opératoire consciente et adaptable. L'opérateur est stable parce qu'il a développé une méthode, pas parce qu'il est figé. Il peut justifier sa stabilité en termes de régime de marché et de contexte personnel.

La stabilité saine tolère des variations légères sans perdre sa structure.

### Ce qu'est une rigidité malsaine

Une rigidité malsaine est une stabilité maintenue par inertie ou par peur, indépendamment des conditions de marché. L'opérateur continue d'opérer dans son profil habituel même quand les conditions l'invalident. La stabilité devient une prison opératoire.

Un Swing/Patience qui refuse d'adapter sa fréquence lors d'un régime d'expansion brutale ne fait pas preuve de discipline. Il fait preuve d'inflexibilité. La distinction est importante.

### Ce qu'est une instabilité saine

Une instabilité saine est une variabilité qui reflète une adaptabilité consciente. L'opérateur change de posture parce que le marché change. Les transitions sont articulables. La variabilité est cohérente avec les conditions externes.

L'Opportuniste/Rotation est structurellement instable dans son profil — c'est son mode opératoire. Cette instabilité n'est pas un problème. Elle devient un problème si les transitions ne sont plus articulables.

### Ce qu'est une instabilité dangereuse

Une instabilité dangereuse est une variabilité qui ne reflète pas une adaptabilité mais une absence de structure. Les transitions ne sont pas cohérentes avec les conditions de marché. Elles sont cohérentes avec l'état émotionnel ou avec les résultats récents.

L'opérateur passe de Range à Momentum parce qu'il a eu trois pertes en range — pas parce que le marché est entré en expansion.

**Le moteur ne doit pas valoriser automatiquement la stabilité. Ni le changement. Les deux peuvent être sains ou problématiques selon le contexte.**

---

## 5. Mémoire comportementale

La mémoire comportementale est un des sujets les plus complexes de l'architecture Constellium. Elle est aussi un des plus dangereux si elle est mal construite.

### Ce que le moteur doit mémoriser

**Éléments structurels :**
- Distribution historique des fréquences d'activité par période de marché.
- Distribution historique des tailles de position par régime.
- Profil dominant sur différentes fenêtres temporelles (court / moyen / long).
- Patterns détectés et leur fréquence historique.
- Transitions de profil observées.

**Événements significatifs :**
- Ruptures comportementales datées (changements brusques de fréquence, taille, ou profil).
- Périodes de stress identifiables (drawdown, volatilité extrême).
- Périodes d'activité atypique (suractivité, sous-activité, concentration inhabituelle).
- Séquences de patterns multiples co-occurrents.

### Ce que le moteur doit oublier

Le moteur ne doit pas mémoriser :
- Les erreurs isolées sans signal de répétition.
- Les périodes atypiques dont la cause externe est identifiée et close.
- Les expérimentations contrôlées bornées dans le temps.
- Les variations mineures sans pattern de tendance.

Un moteur qui retient tout retient le bruit. Le bruit masque le signal.

### Ce qu'il doit pondérer

La mémoire comportementale n'est pas un registre uniforme. Elle pondère :

- **Récence :** les comportements récents ont un poids supérieur pour la lecture du régime actuel.
- **Répétition :** les patterns répétés ont un poids supérieur aux occurrences isolées.
- **Amplitude :** les événements extrêmes ont un poids différent des variations normales.
- **Contexte :** un comportement en régime de marché hostile est lu différemment du même comportement en régime favorable.

### Ce qu'il doit considérer comme structurel

Un comportement est structurel quand il dépasse le seuil de répétition et d'amplitude sur une fenêtre temporelle suffisante. Il ne reflète plus une décision ponctuelle — il reflète une approche.

La distinction entre structurel et exceptionnel est une des fonctions critiques de la mémoire comportementale.

### Les trois couches temporelles

**Mémoire courte (< 2 semaines) :**
Lecture du régime actuel. Détection des patterns en cours. Contexte immédiat. Sert à l'alerte temps réel et à la lecture de l'état opératoire présent.

**Mémoire moyenne (2 semaines — 3 mois) :**
Lecture de la dynamique de profil. Détection des transitions. Comparaison régime actuel / régime récent. Sert à détecter les glissements progressifs et les transitions dangereuses.

**Mémoire longue (> 3 mois) :**
Lecture du profil structurel de l'opérateur. Ancre historique. Référence pour détecter le déplacement silencieux de baseline. Sert à rendre visible ce que la mémoire courte efface.

### Le traitement des ruptures comportementales

Une rupture comportementale est un changement de niveau qui dépasse les variations normales du profil. Elle doit être traitée différemment d'une variation ordinaire.

Deux types de rupture :

**Rupture externe :** déclenché par un événement de marché identifiable (krach, volatilité extrême, changement de conditions). La rupture est réactive. Sa lecture dépend de la cohérence entre la rupture et l'événement déclencheur.

**Rupture interne :** aucun déclencheur externe identifiable. La rupture vient de l'opérateur. C'est le signal le plus important — et le plus difficile à distinguer d'une adaptation légitimement endogène.

### Le traitement des périodes atypiques

Certaines périodes doivent être marquées et pondérées différemment : congés, événements de vie, stress exceptionnel, test d'une nouvelle stratégie. Ces périodes ne doivent pas contaminer la baseline comportementale normale.

La difficulté : le moteur ne peut pas toujours distinguer une période atypique d'une dérive progressive. L'atypique est court et contextuel. La dérive est long et structurel. La fenêtre temporelle est le premier discriminant.

**Le moteur ne doit pas être amnésique. Il ne doit pas non plus être prisonnier du passé.**

---

## 6. Profil déclaré vs profil observé

L'écart entre l'identité opératoire déclarée et le comportement réel est un des phénomènes les plus courants et les plus coûteux en trading.

### L'auto-perception fausse

Un opérateur se déclare "Swing/Patience". Il entre deux fois par semaine, tient ses positions deux à trois jours, se dit sélectif. En pratique, ses données montrent quarante entrées sur le mois, des durées de détention inférieures à quatre heures, et une réentrée systématique après chaque sortie.

Il n'opère pas en Swing. Il opère en Momentum/Expansion avec une narration Swing.

Ce n'est pas de la malhonnêteté. C'est une auto-perception construite sur l'intention, pas sur l'observation.

### La rationalisation

Chaque écart entre l'intention et le comportement est rationalisé isolément. "C'était un cas particulier." "Le marché ne me donnait pas d'autre option." "J'ai adapté ma méthode." La rationalisation est un mécanisme cognitif normal et légitime. Elle devient problématique quand elle masque un pattern systématique.

### Le style fantasmé vs le style réel

Le style fantasmé est l'image que l'opérateur a de lui-même. Il est construit sur ses meilleures sessions, ses décisions les plus réussies, et ses valeurs opératoires déclarées. Il est souvent un Swing patient, un Défensif discipliné, un Momentum lucide.

Le style réel est lisible dans les données. Il est construit sur la distribution statistique des comportements réels, incluant les pires sessions et les moments de stress.

L'écart entre les deux n'est pas une faute. C'est une information.

### Ce que le moteur doit faire avec cet écart

Le moteur ne doit pas corriger agressivement l'opérateur. Il ne doit pas lui dire "tu n'es pas ce que tu crois être". Il doit :

- Observer l'écart sans jugement.
- Contextualiser le comportement réel dans le profil observé.
- Signaler les incohérences quand elles dépassent un seuil structurel.
- Permettre à l'opérateur de construire une image plus précise de son propre style.

La précision est utile. Le jugement ne l'est pas.

---

## 7. Risque de prison comportementale

Le profil opératoire est un outil de lecture. Il ne doit jamais devenir une étiquette permanente.

### Le danger d'enfermer un opérateur dans un profil

Si le moteur décide qu'un opérateur "est" Range/Grid et commence à lire tous ses comportements à travers ce prisme, il devient aveugle aux transitions. Une exploration légitime du régime Momentum sera lue comme une anomalie à corriger plutôt que comme une adaptation à contextualiser. Le moteur devient prescriptif.

### Le danger de considérer qu'un opérateur "est" un style

Un opérateur n'est pas son style. Il a un style dominant à un moment donné. Ce style peut évoluer, se modifier, se reconstruire. Un Swing qui travaille à développer un régime Range ne fait pas une erreur — il s'étend. Le moteur doit lire cette extension comme une information, pas comme une déviation.

### Le danger de rigidifier la lecture

Un moteur qui a "appris" le profil d'un opérateur peut développer une inertie de lecture. Il continue à voir ce qu'il a toujours vu, même quand le comportement a changé. La rigidité de la lecture est plus dangereuse que l'absence de profil — elle donne une illusion de précision qui masque le glissement.

### Le danger d'empêcher l'évolution

Un moteur ne doit pas pénaliser l'évolution légitime. Un opérateur qui décide de changer d'approche opératoire après un travail réflexif approfondi ne doit pas se retrouver face à un moteur qui l'interprète constamment à travers son ancien profil.

**Le moteur doit permettre l'évolution, les cycles, les adaptations, et les reconstructions.**

Ce qui distingue une évolution légitime d'une dérive : l'articulabilité. L'opérateur peut-il expliquer pourquoi son style évolue ? L'évolution est-elle cohérente avec des conditions de marché ou un travail intentionnel ? Ou est-elle produite par des résultats récents et un état émotionnel non reconnu ?

---

## 8. Resets comportementaux

Le reset comportemental est un outil architectural, pas un outil moral.

### Le reset léger

Un reset léger recalibre la fenêtre de référence courte sans effacer la mémoire long terme. Il est déclenché par une période atypique identifiée et close. Il dit : "La période récente n'est pas représentative du profil structurel. La lecture reprend sur une base plus longue."

**Usage :** après une période de stress exceptionnel, d'expérimentation bornée, ou d'événement de vie documenté.

### Le reset profond

Un reset profond marque une rupture intentionnelle entre un cycle opératoire passé et un nouveau cycle. Il conserve la mémoire longue en tant qu'archive, mais reconstruit les références de lecture sur le cycle nouveau.

Il ne supprime pas les dérives passées. Il les archive. Elles restent accessibles comme trace historique, non comme baseline active.

**Usage :** après un changement de méthode intentionnel et documenté, une reconstruction opératoire consciente, ou une période longue d'inactivité volontaire.

### Le warning de reset

Avant tout reset, le moteur doit signaler explicitement ce qui est en train de se passer. L'opérateur doit comprendre que la lecture va changer — et pourquoi. Un reset silencieux est une amnésie opaque.

### Ce que le reset ne doit jamais être

Le reset ne doit pas être une suppression morale. Il ne doit pas permettre à l'opérateur d'effacer une dérive reconnue comme si elle n'avait pas existé. La dérive est archivée. Elle est lisible. Elle peut informer la construction du nouveau cycle.

Un reset profond ne dit pas "tu redeviens propre." Il dit : "tu construis un nouveau cycle de lecture, à partir d'une conscience de ce que l'ancien cycle a produit."

**La distinction est architecturale, pas rhétorique.**

---

## 9. Garde-fous anti-complaisance

Certains signaux ne doivent jamais être absorbés par l'adaptation, quelle que soit la fréquence, le profil, ou le contexte.

### Principe fondateur

La calibration adapte l'interprétation. Elle ne blanchit jamais les dérives.

Un comportement fréquent n'est pas forcément un comportement sain. Un moteur qui apprend à ne plus signaler un comportement parce qu'il est devenu habituel a cessé de protéger — il documente.

### Ce qui ne doit jamais être absorbé

**Garde-fous non calibrables, non atténuables, non contextualisables :**

| Comportement | Seuil d'alerte | Raison de non-absorption |
|---|---|---|
| Revenge trading répété | ≥ 3 occurrences sur fenêtre courte | Signal émotionnel fort, risque cumulatif |
| Augmentation d'exposition après pertes | Toute séquence identifiable | Mécanisme de creusement de drawdown |
| Co-occurrence loss chasing + revenge | Toute détection simultanée | Cumul de mécanismes de surexposition |
| Dérive accélérée de fréquence | Doublement de fréquence en < 5 jours | Signal d'état émotionnel, pas d'opportunité |
| Explosion de dispersion d'actifs | Multi-actifs sans historique | Fuite de régime non articulée |
| Rupture comportementale brutale sans contexte | Tout changement > 3σ | Signal fort de désalignement |

### Ce qui doit toujours rester visible

Même si un comportement est présent dans le profil historique de l'opérateur, les alertes suivantes ne doivent pas être supprimées :

- Augmentation de taille en période de drawdown actif.
- Réentrée < 20 minutes après une perte sur un profil Défensif ou Swing.
- Dispersion d'actifs en accélération sur un profil Range ou Swing.
- Inversion de corrélation entre résultats et taille (les pertes augmentent la taille).

Ces signaux restent actifs même si fréquents. La fréquence n'est pas un alibi structurel.

### Ce qui doit déclencher une alerte même si "normal pour ce profil"

Certains comportements sont normaux pour un profil — jusqu'à un niveau. Au-delà de ce niveau, ils deviennent des signaux même dans leur profil d'origine :

- L'Opportuniste/Rotation : rotation toutes les 15 minutes n'est plus de la rotation, c'est de la dispersion.
- Le Range/Grid : bands extension > 2× sans recognition du changement de régime.
- Le Momentum/Expansion : taille × 3 sur continuation sans signal de confirmation.
- Le Swing/Patience : hold infini sur une thèse clairement invalidée par le marché.

Le profil contextualise. Il ne supprime pas les limites.

---

## 10. Architecture philosophique de Caméléon Engine

Ce document serait incomplet sans une formulation explicite de ce que Caméléon Engine cherche à construire — et de ce qu'il refuse d'être.

### Ce que le moteur ne cherche pas

**Caméléon Engine ne cherche pas à juger.** Il n'évalue pas la valeur d'un opérateur. Il n'attribue pas de bonne ou mauvaise note à un style de vie, une approche philosophique, ou une ambition.

**Caméléon Engine ne cherche pas à normaliser.** Il n'existe pas un "bon trader" à qui tous les opérateurs devraient ressembler. Les profils sont des régimes — pas des normes. La diversité opératoire est réelle et légitime.

**Caméléon Engine ne cherche pas à moraliser.** Les comportements sont lus pour leur cohérence opératoire, pas pour leur conformité à une éthique du trading. Il n'y a pas de comportement "honteux" dans ce moteur.

**Caméléon Engine ne cherche pas à imposer un trader moyen.** La calibration n'est pas une normalisation vers une moyenne empirique. Elle est une adaptation à la structure opératoire réelle d'un opérateur spécifique.

### Ce que le moteur cherche

**Observer des cohérences.** Le moteur cherche à lire si un comportement est cohérent avec le régime déclaré, le régime observé, et les conditions de marché actuelles. Il cherche la cohérence interne — pas la conformité externe.

**Détecter des dérives.** Le moteur cherche à rendre visibles les glissements progressifs que l'opérateur ne peut pas voir lui-même parce qu'il les vit de l'intérieur, session par session.

**Contextualiser les comportements.** Un comportement n'a pas de valeur absolue. Il a une valeur dans un contexte. Le moteur cherche à produire une lecture contextuelle — non pour atténuer les alertes, mais pour les rendre plus précises.

**Protéger contre les glissements invisibles.**

> Le moteur ne protège pas contre les erreurs isolées.
> Il protège contre les dérives qui deviennent invisibles à l'opérateur lui-même.

C'est la fonction centrale. L'erreur isolée est visible. Elle fait mal, on l'identifie, on apprend. La dérive progressive est silencieuse. Elle s'installe progressivement, se rationalise à chaque étape, et devient le nouveau niveau de base avant qu'on la reconnaisse.

Caméléon Engine construit une mémoire et une lecture qui rendent ces dérives visibles avant qu'elles deviennent structurelles.

### Ce que le cockpit doit incarner

Le cockpit n'est pas un tableau de bord de performance. Ce n'est pas un système de scoring. C'est un espace de lecture comportementale.

Il doit produire :
- une lecture sobre et précise du régime en cours ;
- une contextualisation des patterns détectés ;
- un signal clair sur les glissements identifiés ;
- une friction intelligente sur les comportements à risque ;
- et le silence structurel sur tout ce qui ne mérite pas d'être signalé.

Le cockpit doit incarner la doctrine du moteur : **observer, contextualiser, signaler, protéger — sans juger, sans moraliser, sans devenir complaisant.**

---

## 11. Questions ouvertes futures

Ce document définit l'architecture conceptuelle des transitions et de la mémoire comportementale. Il ne propose pas d'implémentation. Les questions suivantes restent ouvertes pour les phases futures du chantier.

### Limites architecturales actuelles

**Q11 — Granularité temporelle du moteur actuel.**
Le moteur de scoring actuel travaille sur des sessions et des patterns détectés. Il n'a pas de mémoire inter-sessions. Toute architecture de transition et de mémoire comportementale suppose une infrastructure de persistance inter-sessions qui n'existe pas encore. Comment cette infrastructure est-elle construite sans compromis sur la vie privée et sans complexité inutile ?

**Q12 — Définition opérationnelle d'une "transition".**
À quel seuil de changement comportemental détecte-t-on une transition plutôt qu'une variation normale ? Cette définition ne peut pas être universelle — elle dépend du profil de référence. La question reste ouverte sans données terrain.

**Q13 — Ancres temporelles de la mémoire longue.**
Trois mois, six mois, un an ? La fenêtre de mémoire longue détermine ce qui est considéré comme "baseline historique". Une fenêtre trop courte normalise la dérive. Une fenêtre trop longue rend la lecture insensible à une évolution légitime. Ce calibrage ne peut pas être théorique — il nécessite des données terrain réelles.

**Q14 — Traitement des périodes d'inactivité.**
Une absence d'activité longue (mois, années) doit-elle être lue comme une pause dans la continuité du profil, ou comme une rupture entre deux cycles distincts ? Le moteur doit distinguer ces deux cas — mais la distinction est contextuelle et difficile à automatiser.

**Q15 — Risque de manipulation.**
Un opérateur qui comprend la logique du moteur peut-il adapter artificiellement son comportement pour éviter les alertes sans corriger les dérives sous-jacentes ? Ce risque est réel. Il doit être anticipé architecturalement — notamment via des indicateurs qui ne sont pas directement lisibles par l'opérateur.

### Risques d'implémentation

**RQ-01 — Sur-ajustement de la mémoire.**
Plus la mémoire est précise, plus le risque d'absorption de dérive est élevé. L'architecture de mémoire doit intégrer un mécanisme actif de résistance à l'absorption — distinct du mécanisme de calibration.

**RQ-02 — Complexité de lecture pour l'opérateur.**
Un système qui lit les transitions, la mémoire longue, le profil déclaré vs observé, et les garde-fous universels risque de produire une lecture trop complexe pour être utile en conditions réelles. La simplification de l'interface est un problème d'architecture UX critique.

**RQ-03 — Risque de sur-confiance dans le moteur.**
Un opérateur qui délègue sa lecture comportementale au moteur sans développer sa propre conscience opératoire court un risque inverse : dépendance au système. Le moteur doit être conçu pour renforcer la capacité de lecture de l'opérateur, pas la remplacer.

**RQ-04 — Risque de fausse sécurité.**
Un moteur qui ne signale pas de dérive peut être lu comme "tout va bien." Cette lecture est potentiellement dangereuse si le moteur est lui-même dans un état d'absorption progressive. L'absence d'alerte n'est pas une garantie — c'est une observation temporaire.

**RQ-05 — Dépendance aux données Binance.**
La mémoire comportementale suppose des données fiables et continues. Les exports Binance sont des photographies. Ils ne capturent pas l'intention, le contexte décisionnel, ni l'état cognitif au moment du trade. La mémoire comportementale construite sur ces données seule sera toujours une mémoire partielle.

**RQ-06 — Risque d'opacité du moteur adaptatif.**
Un moteur adaptatif qui évolue avec l'opérateur risque de devenir progressivement opaque — même à ses concepteurs. Les règles de lecture doivent rester explicables et auditables. L'adaptation ne doit jamais produire une boîte noire.

---

*Document fondateur du chantier Constellium — troisième socle doctrinal.*
*Non implémentable dans l'état actuel. Fondation conceptuelle du futur moteur adaptatif.*
*Prochaine étape : classification formelle des indicateurs (universel / semi-adaptatif / contextuel) ou architecture anti-sur-ajustement.*
*Définition opérationnelle V1 du Constellium (étoiles, liens, UX) : `constellium_v1_definition.md`*
