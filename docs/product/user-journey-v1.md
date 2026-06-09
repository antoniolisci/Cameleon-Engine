# USER-JOURNEY-V1 — Parcours utilisateur Caméléon Engine

> Document produit · Non implémentable · 2026-06-09
> Référence : audit-cameleon-engine-v1-inventory.md · commit d463388
> Statut : DRAFT — en attente de validation

---

## 1. Diagnostic d'entrée

### Pourquoi l'utilisateur actuel peut être perdu

Caméléon Engine expose simultanément sa totalité au premier écran. Le header affiche 5 chips. La sidebar propose 5 onglets de navigation. Le module Debug Brain est visible en permanence. Le hero section contient 6 blocs distincts. L'onglet Comportement ouvre un panneau latéral qui pousse le reste. L'onglet Manifeste présente 16 sections doctrinales.

**Ce n'est pas un défaut de conception.** C'est le résultat d'une construction par couches successives correctement architecturées : chaque module a été ajouté avec une logique interne solide, des doctines cohérentes, une isolation stricte. Le produit a été construit de l'intérieur. Il n'a pas encore été construit pour quelqu'un qui arrive de l'extérieur.

Un utilisateur qui ouvre le produit pour la première fois ne voit pas un outil — il voit une surface de décision à laquelle il ne comprend pas encore les règles.

### Pourquoi la valeur est présente mais prématurée

La valeur existe. Elle est réelle et calibrée :
- Un moteur de décision qui produit un verdict structuré à partir de 16 variables contextuelles.
- Un module comportemental qui lit des données réelles et produit un miroir de 5 patterns.
- Une mémoire qui accumule les sessions et commence à montrer une trajectoire.
- Un export JSON complet qui donne la propriété des données à l'opérateur.

Mais toute cette valeur suppose que l'utilisateur sache déjà ce qu'il cherche. Le verdict moteur ne signifie rien si l'utilisateur ne comprend pas pourquoi il doit remplir 16 champs. Le profil comportemental ne crée pas d'émotion si l'utilisateur n'a pas encore importé un seul fichier. La mémoire ne compte pas si l'utilisateur n'a pas encore vécu une première session mémorable.

**Le produit est prêt à donner de la valeur. L'utilisateur n'est pas encore prêt à la recevoir.**

### Pourquoi le produit est construit de l'intérieur vers l'extérieur

La construction de Caméléon Engine a suivi une logique de profondeur d'abord : doctrine → architecture → moteur → mémoire → comportement → expression. Chaque couche a été posée sur la précédente avec rigueur. C'est la bonne façon de construire un moteur — ça n'est pas la bonne façon de concevoir une entrée utilisateur.

Le résultat est une interface qui ressemble à la carte interne du produit, pas à la porte d'entrée d'un utilisateur. Un trader qui arrive ne connaît pas les 8 couches architecturales. Il ne sait pas ce qu'est le V2 pipeline. Il ne sait pas ce que signifie "Sniper Ready". Il a une question simple : "Est-ce que ça peut m'aider aujourd'hui ?"

### Pourquoi le parcours doit inverser cette logique

Le parcours utilisateur V1 doit être conçu à rebours : à partir de la valeur que l'utilisateur peut ressentir, et remonter vers les conditions minimales pour y accéder.

La question n'est pas "comment lui expliquer notre architecture ?" mais "quel est le chemin le plus court entre son arrivée et son premier moment de clarté ?"

Ce document construit ce chemin.

## 2. Promesse centrale

### Hypothèse de départ

> "Caméléon Engine ne te dit pas quoi trader. Il te montre dans quel état tu es avant que tu agisses."

Cette phrase est le point de départ, pas la version finale. Elle peut être ajustée après les premiers retours terrain. Ce qui ne change pas : la promesse porte sur l'état de l'opérateur, pas sur les signaux du marché.

### Ce que le produit fait

- Lire le contexte marché à travers 16 variables pour produire un verdict structuré : posture, actions autorisées, actions interdites.
- Analyser les patterns comportementaux sur des données d'historique réelles (trades, ordres, mouvements de fonds).
- Croiser les deux lectures pour produire un message adaptatif : ce que le contexte impose, ce que ton comportement passé modifie.
- Mémoriser les sessions pour montrer une trajectoire dans le temps.

### Ce que le produit ne fait pas

- Il ne dit pas quoi acheter ni quoi vendre.
- Il ne prédit pas le marché.
- Il ne remplace pas la décision humaine.
- Il ne génère pas de signaux d'entrée ou de sortie.
- Il n'automatise aucune action.
- Il ne gère pas de compte trading.
- Il ne se connecte à aucun exchange.

### Ce que l'utilisateur doit comprendre en 10 secondes

**"Avant d'agir sur le marché, il faut savoir si c'est le bon moment — pour le marché, et pour toi."**

Caméléon Engine répond aux deux questions simultanément. Il te dit si le contexte est lisible et si tu es dans un état mental propice à une décision. Il ne décide pas à ta place. Il te donne les conditions pour décider toi-même.

### Formulations selon le profil

| Version | Texte |
|---|---|
| **Phrase courte** | "Caméléon Engine te dit dans quel état tu es avant d'agir." |
| **Phrase longue** | "Avant chaque décision de trading, Caméléon Engine lit le contexte marché et ton historique comportemental. Il ne te dit pas quoi faire. Il te montre si les conditions sont réunies pour décider avec lucidité." |
| **Pour non-trader** | "C'est un outil qui te dit si c'est un bon moment pour toi de prendre une décision financière — en regardant à la fois le marché et ton comportement passé." |
| **Pour trader** | "Un moteur contextuel qui croise la lisibilité du setup et ton profil comportemental réel pour produire une posture — pas un signal, une posture." |

## 3. Les profils d'entrée

### Profil A — Non-trader intelligent / regard produit

Un curieux, un créateur, quelqu'un qui s'intéresse aux outils de décision ou de conscience de soi sans nécessairement trader activement.

| | |
|---|---|
| **Comprend vite** | La logique "miroir comportemental" — l'idée de se voir agir avant d'agir |
| **Ne comprend pas** | Le vocabulaire trader (ATTACK, SNIPER, posture, setup, RR) |
| **Cherche** | La cohérence de la promesse — est-ce que c'est vraiment différent d'un signal bot ? |
| **Ce qui le fait partir** | Trop de jargon dès la première page. Une interface qui ressemble à un terminal Bloomberg. |
| **Ce qui le convainc** | La clarté de la doctrine (ce que le produit ne fait pas). La phrase courte. L'absence de promesse de gain. |

---

### Profil B — Trader débutant

Quelqu'un qui a commencé à trader depuis moins d'un an, connaît les bases (long/short, stop-loss, take-profit) mais n'a pas encore de méthode structurée.

| | |
|---|---|
| **Comprend vite** | L'idée de "context" — un bon moment vs un mauvais moment pour trader |
| **Ne comprend pas** | La différence entre le score marché et la confiance d'exécution. Le rôle de la validation humaine obligatoire. |
| **Cherche** | Un guide. Une réponse à "est-ce que je peux entrer maintenant ?" |
| **Ce qui le fait partir** | Trop de champs à remplir sans comprendre pourquoi. Un verdict trop nuancé qui ne répond pas directement. |
| **Ce qui le convainc** | Un premier verdict compréhensible. L'impression que le produit lui permet de mieux se connaître. |

---

### Profil C — Trader intermédiaire

Quelqu'un avec 2–4 ans d'expérience, une méthode, des patterns récurrents, et une conscience de ses propres biais (même s'il n'arrive pas toujours à les corriger).

| | |
|---|---|
| **Comprend vite** | La logique des 16 champs — il reconnaît les variables qu'il évalue déjà intuitivement |
| **Ne comprend pas** | Pourquoi il devrait importer ses données Binance si le moteur fonctionne déjà |
| **Cherche** | Un outil qui structure ce qu'il fait déjà, pas un outil qui le remplace |
| **Ce qui le fait partir** | Impression que c'est trop simple (moteur) ou trop compliqué (comportement). Verdict pas assez calibré pour son niveau. |
| **Ce qui le convainc** | Le profil comportemental sur ses vraies données. La reconnaissance de patterns qu'il avait niés. |

---

### Profil D — Trader expérimenté

Quelqu'un avec 5+ ans, une méthode solide, des règles internes, et une gestion active de son biais comportemental. Il sera sceptique en premier lieu.

| | |
|---|---|
| **Comprend vite** | L'architecture générale — il reconnaît les catégories (décision, contexte, comportement, mémoire) |
| **Ne comprend pas** | Pourquoi il aurait besoin d'un outil pour ce qu'il fait déjà dans sa tête |
| **Cherche** | Un éclairage qu'il n'a pas lui-même. Quelque chose qu'il n'aurait pas vu. |
| **Ce qui le fait partir** | Verdict trop générique. Scores non expliqués. Impression que c'est fait pour des débutants. |
| **Ce qui le convainc** | Le croisement comportemental sur une période longue. Une incohérence que le moteur détecte là où il se croyait discipliné. |

---

### Profil E — Builder / créateur / utilisateur Claude Code

Quelqu'un qui construit des outils, intéressé par l'architecture et la doctrine du produit autant que par son usage.

| | |
|---|---|
| **Comprend vite** | L'architecture pipeline, les décisions techniques, la logique de local-first |
| **Ne comprend pas** | Pourquoi l'interface est aussi chargée si la doctrine est aussi claire |
| **Cherche** | La cohérence entre la doctrine et l'implémentation. Les tensions non résolues. |
| **Ce qui le fait partir** | Violations doctrinales visibles (emojis, Constellium exposé, manifeste en onglet principal). Manque d'une entrée évidente. |
| **Ce qui le convainc** | La rigueur du moteur. La doctrine écrite. La séparation stricte comportement / moteur. L'absence de tracking. |

## 4. Parcours utilisateur V1 — séquence complète

### Étape 0 — Avant l'arrivée

L'utilisateur entend parler de Caméléon Engine via une invitation directe (bêta fermée). Il reçoit un message court, un lien, une phrase. Il ne cherche pas le produit — il y est amené par quelqu'un en qui il a confiance.

**Ce qui doit être vrai avant l'arrivée :**
- Le message d'invitation ne dit pas "un outil de trading". Il dit quelque chose de plus précis.
- La personne qui invite peut expliquer en une phrase ce que l'outil fait.
- L'URL est simple et mémorable : `cameleonengine.app`.

**Ce qui peut rater à cette étape :**
- Message d'invitation trop technique ou trop vague.
- Réputation "bot de trading" qui précède l'arrivée.
- Absence de contexte : l'utilisateur arrive sans savoir à quoi s'attendre.

---

### Étape 1 — Première ouverture

L'utilisateur ouvre `cameleonengine.app`. Il a 5 à 10 secondes pour décider si ça vaut la peine de rester.

**Ce qu'il voit actuellement (état de l'interface) :**
Un header dense, une sidebar avec 5 onglets, un Debug Brain permanent, un hero section surchargé. Trop d'informations simultanées.

**Ce qu'il doit comprendre :**
- Le nom et la nature du produit (ce n'est pas un signal bot).
- Une phrase d'accroche qui pose la promesse.
- Un point d'entrée évident : une action principale.

**Ce qu'il ne faut surtout pas lui montrer à cette étape :**
- Le Debug Brain (libellé "Moteur Brut / Lecture système").
- Les boutons Constellium.
- Le Manifeste (onglet de navigation au même niveau que Moteur).
- Les 4 scores simultanés sans hiérarchie.
- Le payload brut JSON.
- Les 16 champs de formulaire sans contexte.

---

### Étape 2 — Première action simple

L'utilisateur doit pouvoir accomplir une première action sans :
- Créer un compte.
- Importer un fichier.
- Comprendre l'architecture.
- Lire une documentation.

**L'action la plus simple disponible aujourd'hui :** remplir les champs du moteur et lancer une analyse.

**Problème actuel :** 16 champs sans explication de leur rôle, sans contexte sur ce qu'ils produisent. L'utilisateur ne sait pas si remplir "tendance haussière" + "volatilité forte" va lui donner quelque chose d'utile ou une réponse générique.

**Ce que l'étape 2 doit garantir :**
- L'utilisateur remplit au moins les champs minimaux.
- Il reçoit un retour visible, lisible, non technique.
- Il comprend qu'il vient de produire quelque chose à partir de sa situation réelle.

---

### Étape 3 — Premier verdict compris

Le moteur produit un verdict : posture, actions autorisées/interdites, message adaptatif.

**Ce que l'utilisateur doit comprendre :**
- "Le produit me lit quelque chose sur le contexte marché actuel."
- "Il me dit ce que je peux faire et ce que je ne devrais pas faire dans ce contexte."
- "Il ne me dit pas quoi acheter."

**Ce qui peut bloquer la compréhension :**
- Vocabulaire non défini : "SNIPER READY", "ATTACK", "Core Only".
- 4 scores affichés sans hiérarchie — lequel est le plus important ?
- Message cs-message trop court sans explication de son origine.
- Verdict trop nuancé pour une première lecture.

**Ce que le premier verdict réussi doit créer :**
Pas de l'enthousiasme — de la curiosité. "C'est intéressant. Et si je changeais un champ ?"

---

### Étape 4 — Invitation à l'import

Le moteur a donné un verdict basé sur les variables que l'utilisateur a saisies. C'est la lecture externe : contexte marché, profil de trading, état général.

**La transition naturelle :** "Et si le système pouvait aussi lire ton historique réel de trades ?"

**Comment présenter l'import sans faire peur :**
- L'import est présenté comme une lecture complémentaire, pas comme une étape obligatoire.
- L'utilisateur comprend qu'il donne accès à ses données passées pour obtenir un miroir de ses comportements.
- La phrase n'est pas "importe ton CSV". Elle est : "Montre-lui tes trades passés — il te dira ce qu'il y voit."
- Le produit ne stocke rien en dehors de l'appareil de l'utilisateur. C'est un argument clé à ce stade.

**Moment déclencheur de l'import :**
L'invitation à importer devient naturelle après qu'un utilisateur a vu un verdict qui lui a semblé juste — ou au contraire incomplet. Il veut aller plus loin.

---

### Étape 5 — Premier import

L'utilisateur importe un fichier CSV, XLSX ou PDF depuis Binance.

**Ce qui doit se passer :**
- Le fichier est reconnu automatiquement (format détecté).
- Un retour immédiat apparaît : nombre de trades lus, qualité des données, message de confirmation.
- Une analyse est produite : score comportemental, profil, patterns détectés.
- Le résultat est présenté de façon lisible, pas sous forme de tableau de données.

**Ce qui doit être expliqué :**
- "Ce score représente ton niveau de discipline comportementale sur la période analysée."
- "Ces patterns indiquent des comportements récurrents dans tes données réelles."
- Ce que chaque pattern signifie concrètement (loss chasing, revenge trading, size inconsistency).

**Ce qui peut faire fuir :**
- Un message d'erreur sans explication si le format n'est pas reconnu.
- Un résultat chiffré sans contexte : "Score : 37" ne signifie rien sans référence.
- Une interface d'import trop technique (boutons, options, toggles).

---

### Étape 6 — Premier "aha"

C'est le moment où l'utilisateur comprend : "Cet outil me montre quelque chose sur moi."

**Scénario aha moteur :**
L'utilisateur remplit les champs, obtient un verdict "Attente" alors qu'il pensait que le marché était favorable. Il voit que 3 des 16 variables pointent vers un contexte risqué qu'il avait ignoré. Le moteur ne l'a pas trompé — il a mis en évidence un aveuglement.

**Scénario aha comportemental :**
L'utilisateur importe son historique de trades. Le profil revient "Impulsif". Le pattern "loss_chasing" est détecté. Il regarde les trades concernés et reconnaît une période où il avait "rattrapé" des pertes. Ce n'est plus une donnée abstraite — c'est un miroir.

**Ce qui crée le aha :**
Pas la technologie — la reconnaissance. L'utilisateur voit dans les données quelque chose qu'il savait mais n'avait jamais quantifié.

---

### Étape 7 — Première mémoire

L'utilisateur revient 2 ou 3 jours plus tard. Il relance une analyse.

**Pourquoi revenir :**
- Le contexte marché a changé — il veut voir si le verdict a changé.
- Il a fait un trade depuis la première session — il veut comparer.
- Il se souvient du profil comportemental obtenu — il veut savoir s'il a changé.

**Ce que l'utilisateur retrouve :**
- L'historique de ses sessions moteur (onglet Mémoire).
- Son profil comportemental précédent.
- L'évolution entre deux sessions si suffisamment de temps a passé.

**Ce qui change après plusieurs sessions :**
- Les 5 états cognitifs (Ancré / En Veille Active / Friction / Dérive / Rupture) commencent à avoir du sens.
- L'utilisateur ne consulte plus le moteur par curiosité — il consulte pour aligner une décision.

---

### Étape 8 — Usage régulier

L'utilisateur intègre Caméléon Engine à sa routine de trading.

**Pattern d'usage régulier :**
- Avant chaque session de trading : lancer l'analyse moteur (5 minutes).
- Après chaque semaine ou chaque mois : importer les données comportementales et relire le profil.
- Avant une décision importante : comparer l'état actuel avec les dernières sessions mémorisées.

**Ce que l'utilisateur ressent à ce stade :**
Ce n'est plus un outil de découverte. C'est un outil de recul. La valeur n'est plus dans le verdict unique — elle est dans la comparaison dans le temps : "J'étais en mode Attente la semaine dernière, aujourd'hui je suis en mode Sniper. Qu'est-ce qui a changé ?"

---

### Étape 9 — Appartenance / contribution

L'utilisateur est dans la bêta fermée. Il peut contribuer.

**Formes de contribution :**
- Bug report : signaler un bug terrain (scroll, overflow, 404, import non reconnu).
- Feedback produit : dire ce qui est utile, ce qui est confus, ce qui manque.
- Pass bêta : inviter un trader de confiance avec un mot de présentation.

**Ce que le statut bêta fondateur implique :**
- Accès anticipé aux fonctionnalités futures (compte utilisateur, historique cloud, analytics avancées).
- Contribution directe à la calibration des seuils comportementaux.
- Données terrain qui permettent d'ajuster le produit avant ouverture publique.

**Ce qui ne doit pas être promis à cette étape :**
Aucun gain financier. Aucune récompense monétaire. Aucun "early adopter discount" qui créerait une attente commerciale.

## 5. Le moment Aha

### Aha moteur

**Définition :** L'utilisateur remplit les champs, obtient un verdict, et reconnaît dans ce verdict quelque chose de juste qu'il n'avait pas formulé lui-même.

**Exemple :** Il pensait que le marché était favorable. Le moteur sort "ATTENTE". En regardant les raisons, il voit que 2 variables qu'il avait ignorées (sentiment et validation humaine) pèsent sur le verdict. Il comprend qu'il était en train de rationaliser une envie d'entrer plutôt que de lire le marché.

**Ce qui déclenche ce aha :** Le verdict doit être légèrement contre-intuitif par rapport à l'attente de l'utilisateur. Si le moteur confirme systématiquement ce que l'utilisateur pense, il ne sert à rien.

---

### Aha comportemental

**Définition :** L'utilisateur voit un pattern dans ses données réelles qu'il connaissait vaguement mais n'avait jamais quantifié.

**Exemple :** Le profil revient "Réactif" avec un pattern `revenge_trading` détecté sur 8 occurrences. L'utilisateur identifie visuellement les trades concernés et reconnaît une période difficile de son historique. Le mot "revenge trading" lui colle — pas parce que c'est un terme technique, mais parce que c'est exact.

**Ce qui déclenche ce aha :** La reconnaissance dans des données réelles, pas dans une définition abstraite. La date, le symbole, l'ampleur — ce sont les détails qui transforment un résultat en miroir.

---

### Aha mémoire

**Définition :** L'utilisateur revient pour la troisième ou quatrième session et commence à voir une évolution.

**Exemple :** Il était "Impulsif" à son premier import. Trois semaines plus tard, il revient avec un nouveau fichier. Le score est passé à "Réactif". Il n'est pas encore "Discipliné" — mais il voit que quelque chose a changé. Le changement est quantifié, pas seulement ressenti.

**Ce qui déclenche ce aha :** La comparaison temporelle. Le produit ne prédit pas — il trace. La valeur de la mémoire n'est lisible que dans la durée.

---

### Aha long terme

**Définition :** L'utilisateur comprend que Caméléon Engine n'est pas un outil pour une décision — c'est un compagnon de lucidité dans le temps.

**Ce que ça signifie concrètement :** Il ne consulte plus le moteur parce qu'il cherche un signal. Il consulte parce qu'il veut savoir dans quel état il est avant d'agir. La différence est fondamentale — c'est la différence entre dépendance à un outil et acquisition d'une méthode.

---

### Lequel est le plus important pour la bêta ?

**Le aha comportemental est le plus important.**

Pour deux raisons :
1. Il est le plus différenciant. Un verdict moteur contextuel, d'autres outils en approchent. Un miroir comportemental sur données réelles — personne ne fait ça de la même façon.
2. Il crée la rétention. L'utilisateur qui a vu son profil comportemental reconnu dans ses propres données a une raison personnelle de revenir. Le verdict moteur peut être refait à chaud ; le miroir comportemental se construit dans le temps.

**Conséquence produit :** le parcours V1 doit conduire aussi vite que possible à l'étape 5 (import) pour que le aha comportemental soit accessible dans la première session ou la deuxième au plus tard.

## 6. Hiérarchie d'information

### Niveaux de visibilité

| Niveau | Définition | Critère |
|---|---|---|
| **A — Visible immédiatement** | Présent sans action de l'utilisateur, au premier écran | Nécessaire à la compréhension de la promesse ou à la première action |
| **B — Accessible en un clic** | Accessible facilement mais pas exposé par défaut | Utile après la première compréhension |
| **C — Mode expert** | Visible uniquement si l'utilisateur l'active explicitement | Valeur forte mais réservée à un profil avancé |
| **D — Après import** | Non visible avant qu'un fichier ait été importé | Dépend de données réelles |
| **E — Après plusieurs sessions** | Non visible avant 3+ sessions mémorisées | Dépend de l'accumulation temporelle |
| **F — Dormant** | Présent dans le code, non exposé dans l'interface | En attente de condition produit non atteinte |

---

### Classement de chaque élément

| Élément | Niveau recommandé | Justification |
|---|---|---|
| **Verdict moteur (posture + actions)** | A | Valeur principale — doit être visible sans scroll |
| **Plan d'action** | A | Synthèse opérationnelle directe — 2–3 points lisibles |
| **Message narratif (cs-message)** | A | Signal principal V2 — doit être compréhensible immédiatement |
| **Mode d'emploi (dialog)** | A | 4 règles suffisantes pour démarrer — bouton visible |
| **Score marché 0–100** | B | Utile mais secondaire — accessible depuis le verdict |
| **Confiance d'exécution** | B | Valeur pour trader intermédiaire+ — pas en premier écran |
| **Scénarios SI→ALORS** | B | Puissants pour expert — accessibles après premier verdict |
| **Analyse comportementale (résultat)** | D | Nécessite import — non visible avant |
| **Invitation à l'import** | B→D | Proposée après premier verdict — pas au premier écran |
| **Portefeuille V1** | D | Nécessite Wallet History — non visible avant |
| **Historique sessions** | E | Valeur lisible après 3+ sessions |
| **Debug Brain** | C | Valeur interne — accessible en mode expert, masqué par défaut |
| **Payload brut JSON** | C | Technique — mode expert ou Debug Brain uniquement |
| **Journal de décision (8 champs)** | C | Trace technique — mode expert |
| **Constellium (boutons, panel)** | F | D3 dormant — ne pas exposer en V1 |
| **Manifeste** | B | Accessible depuis un lien discret — pas en onglet principal |
| **Export JSON** | B | Disponible dans Mémoire — pas en premier écran |
| **Publications Paragraph** | B | Contextuel — accessible, pas prioritaire |
| **Macro (dominance/désordre)** | B→C | Fonctionnel mais non expliqué — contextualiser ou cacher |
| **Lien Notion (Lois du Caméléon)** | B | Hors sidebar principale — accessible depuis Manifeste |
| **Onglet Comportement (entrée)** | B | Accessible clairement mais pas en premier plan |
| **V2 pipeline complet** | F | Shadow mode correct — ne pas exposer |

## 7. Première session idéale

**Objectif :** en 5 minutes, l'utilisateur comprend ce que le produit fait, obtient une valeur, et a envie de revenir.

---

### Minute 0–1 — Arrivée et orientation

L'utilisateur ouvre le produit. Il voit :
- Une phrase courte qui pose la promesse (pas un slogan — une description).
- Un seul point d'entrée visible : une action principale ("Analyser mon contexte" ou équivalent).
- Aucune donnée technique, aucun score, aucun formulaire encore.

À la fin de cette minute, il sait qu'il s'agit d'un outil de recul avant de trader — pas d'un signal bot.

---

### Minute 1–2 — Première saisie

L'utilisateur remplit les champs du moteur. Pas nécessairement les 16 — mais les plus importants d'abord.

Il comprend que chaque champ décrit sa situation réelle aujourd'hui : la tendance qu'il observe, la volatilité du marché, son profil de trading, son état émotionnel, sa validation interne.

Les champs sont guidés — pas seulement des listes déroulantes. Chacun a une phrase courte qui explique pourquoi il compte.

---

### Minute 2–3 — Premier verdict

Le moteur produit un verdict. L'utilisateur voit :
- Une posture principale (Attaque / Sniper / Socle / Attente / Protection).
- Un plan d'action en 2–3 points clairs.
- Un message adaptatif (cs-message) qui lit son contexte spécifique.

Il comprend sans avoir besoin de lire un manuel. Le verdict est nuancé mais lisible. Il peut ne pas être d'accord — c'est prévu. La validation humaine lui rappelle qu'il décide.

---

### Minute 3–4 — Exploration

L'utilisateur explore :
- Il change un champ pour voir l'effet sur le verdict.
- Il ouvre le mode d'emploi pour comprendre une règle qu'il n'a pas saisie.
- Il regarde les actions autorisées et interdites — et reconnaît des situations passées.

À ce stade, il n'est pas encore convaincu. Il est curieux. C'est suffisant.

---

### Minute 4–5 — Invitation

Le produit propose naturellement la prochaine étape : "Tu veux voir ce que ton historique dit ?"

L'utilisateur comprend qu'il peut aller plus loin en important ses données. Cette proposition doit :
- Être formulée clairement (pas un bouton "importer CSV" sans contexte).
- Garantir que les données restent sur son appareil.
- Indiquer ce qu'il obtiendra (son profil comportemental réel).

Il n'importe pas nécessairement dans les 5 premières minutes. Mais il sait que c'est la prochaine étape logique.

---

**Résultat attendu à la fin des 5 minutes :**
L'utilisateur a compris la promesse. Il a produit un verdict sur son contexte réel. Il sait qu'il peut aller plus loin. Il n'a pas besoin d'aide pour revenir.

## 8. Retour J+7

### Pourquoi il revient

Il a fait des trades depuis sa première session. Il veut comparer. Soit le verdict du produit a été validé par le marché, soit il ne l'a pas suivi et se demande ce que ça aurait donné. Dans les deux cas, il est motivé à revenir.

Deuxième raison possible : il a importé ses données comportementales lors de la première session. Il a obtenu un profil. Il veut voir si ça a changé après une semaine supplémentaire de trades.

### Ce qu'il doit voir

- Son historique de sessions moteur dans l'onglet Mémoire.
- La date et le verdict de sa dernière session.
- Si un import comportemental a été fait : son profil précédent.

Il ne doit pas avoir à reconstruire son contexte de zéro. Le produit doit lui montrer immédiatement où il en était.

### Ce que la mémoire commence à lui montrer

Après 3–5 sessions :
- Une variation dans les verdicts selon les conditions de marché.
- Un profil comportemental qui se stabilise ou évolue.
- Une corrélation possible entre l'état moteur au moment de la décision et le résultat réel.

Ce n'est pas encore une trajectoire claire — c'est le début d'une lecture personnelle.

### Quelle valeur nouvelle apparaît

La valeur J+7 n'est pas le verdict lui-même — c'est la **comparaison**. "La semaine dernière j'étais en mode Attente. Aujourd'hui je suis en mode Socle. Le marché n'a pas beaucoup changé. Qu'est-ce qui a changé en moi ?"

Cette question est le moteur de la rétention long terme.

## 9. Retour J+30

### Ce que l'utilisateur doit avoir compris

- Ce que signifient concrètement ses 4–5 patterns comportementaux les plus fréquents.
- La différence entre son état moteur favorable et défavorable.
- À quel moment de la journée ou de la semaine il est le plus en mode "Attaque" vs "Attente".
- Que le produit ne lui dit pas quoi faire — il lui montre dans quel état il se trouve avant de décider.

### Quelle progression il doit percevoir

Un utilisateur actif J+30 doit pouvoir dire :
- "Mon profil est passé de Réactif à Discipliné sur les 30 derniers jours."
- "J'ai arrêté de trader en mode Dérive — je le vois dans mes données."
- "Le moteur a sorti Attente les 3 fois où j'ai eu mes pires trades de la semaine."

Il n'est pas obligé de dire quelque chose de positif. Mais il doit avoir quelque chose de spécifique à dire. Si après 30 jours l'utilisateur ne peut pas citer une chose concrète que l'outil lui a montrée, le parcours a échoué.

### Comment la mémoire devient une valeur forte

J+30 est le moment où l'historique commence à avoir une masse critique :
- 10–20 sessions moteur accumulées.
- 2–3 imports comportementaux couvrant 4 semaines différentes.
- Un portefeuille V1 si les Wallet History ont été importés.

L'utilisateur peut maintenant voir une trajectoire — pas une tendance provisoire sur 3 sessions.

### À quel moment le premium peut devenir compréhensible

J+30 est trop tôt pour proposer du premium. L'utilisateur doit d'abord avoir eu un moment où la limite de l'outil actuel est visible par lui-même :
- "Je ne peux voir l'historique que sur cet appareil."
- "Si je réinstalle mon navigateur, je perds tout."
- "Je veux partager mes analyses avec quelqu'un d'autre."

Ces frictions doivent émerger naturellement, pas être créées artificiellement. Le premium doit répondre à un besoin ressenti, pas à une incitation marketing.

## 10. Risques UX majeurs

| Risque | Gravité | Symptôme observable | Mitigation produit |
|---|---|---|---|
| **Trop d'informations au premier écran** | Critique | "Je ne sais pas où regarder" — retour terrain confirmé | Hiérarchie A/B/C : masquer D/E/F par défaut, un seul point d'entrée visible |
| **Jargon non défini** | Élevée | "SNIPER READY, ATTACK — je ne comprends pas" | Infobulles discrètes ou lexique accessible en B. Pas de traduction forcée — juste une définition disponible. |
| **Première action floue** | Élevée | L'utilisateur ne sait pas quoi faire en premier | Un seul CTA principal au premier écran. Les 16 champs guidés avec contexte minimal. |
| **Import trop tôt dans le parcours** | Élevée | Friction avant la valeur — l'utilisateur part avant d'avoir vu un verdict | L'import n'est proposé qu'après le premier verdict compris (Étape 4). |
| **Absence de feedback après import** | Élevée | L'utilisateur importe un fichier et ne sait pas si ça a fonctionné | Confirmation visible immédiate : "X trades lus, qualité Y, analyse prête" |
| **Complexité visuelle** | Élevée | Interface perçue comme "outil de développeur" | Masquer Debug Brain, Payload brut, Journal technique par défaut |
| **Confusion moteur / comportement** | Moyenne | "C'est quoi la différence entre les deux analyses ?" | Nommer les deux lectures distinctement. Moteur = état contextuel. Comportement = état personnel. |
| **Confusion outil / signal trading** | Critique | "C'est un bot qui me dit quoi acheter ?" | La promesse doit être non ambiguë dès le premier écran. Ni dans le nom, ni dans les boutons, ni dans les verdicts. |
| **Verdicts trop nuancés** | Moyenne | "Ça dit 'peut-être' dans tous les cas — ça sert à rien" | Le verdict principal doit être clair (Attaque / Attente / Protection). Les nuances sont en B. |
| **Données silencieusement perdues** | Élevée | Utilisateur perd ses sessions sans avertissement (QuotaExceeded, changement domaine) | Indicateur de saturation ARCH-N3 existant. Alerte proactive à prévoir avant QuotaExceeded. |

## 11. Décisions de parcours

Ces décisions doivent être figées avant d'ouvrir tout chantier d'implémentation UX. Chacune a des conséquences directes sur la structure de l'interface.

---

**D1 — Le premier écran doit-il être une synthèse ?**

Recommandation : **Oui.** Le premier écran doit montrer le verdict le plus récent (ou un état vide explicite "Aucune analyse en cours") avec un seul CTA principal. Pas un formulaire, pas une liste d'onglets.

*À trancher : quelle est la forme exacte du premier écran ? Dashboard résumé vs formulaire de saisie guidé ?*

---

**D2 — L'import doit-il être proposé dès le début ou après première lecture ?**

Recommandation : **Après première lecture.** L'import est une couche de profondeur, pas une condition d'accès. Le proposer au premier écran crée une friction inutile et une impression d'obligation.

*À trancher : à quel endroit exact dans le parcours l'invitation à l'import apparaît-elle ? Après le verdict ? Dans un bandeau ? Dans Mémoire ?*

---

**D3 — Le Debug Brain doit-il être masqué par défaut ?**

Recommandation : **Oui, masqué par défaut.** Accessible via un raccourci discret (toggle, raccourci clavier ou lien en footer). Son libellé actuel ("Moteur Brut / Lecture système") est incompréhensible pour un utilisateur non technique.

*À trancher : quel mécanisme d'accès ? Toggle sidebar ? Raccourci clavier ? Menu "mode expert" ?*

---

**D4 — Le Manifeste doit-il rester dans la navigation principale ?**

Recommandation : **Non.** Le Manifeste n'est pas un outil — c'est un document fondateur. Sa place est dans un footer discret, une page dédiée accessible via lien, ou un modal. Pas au même niveau de navigation que "Moteur" et "Comportement".

*À trancher : où se trouve le lien vers le Manifeste dans la nouvelle navigation ?*

---

**D5 — Constellium doit-il disparaître totalement de V1 visible ?**

Recommandation : **Oui, totalement masqué.** Les boutons "Tester une lecture Constellium" et "Lire le Constellium" dans Pilotage créent une confusion sur l'identité du produit. D3 (condition de déverrouillage Constellium) n'est pas atteinte.

*À trancher : simple masquage CSS conditionnel ou suppression de l'HTML visible ?*

---

**D6 — Combien d'onglets maximum pour un nouvel utilisateur ?**

Recommandation : **3 onglets visibles par défaut.** Moteur / Comportement / Mémoire. Le Manifeste sort du niveau de navigation principale. Pilotage peut être intégré à Moteur ou accessible en B.

*À trancher : quelle est la navigation cible exacte ? Noms des 3 onglets principaux ?*

---

**D7 — Quel est le bouton principal de la première session ?**

Recommandation : **Un seul CTA visible au premier écran.** Sa formulation doit répondre à la question que se pose l'utilisateur : "Qu'est-ce que je fais maintenant ?" — pas décrire une fonction technique.

Formulations candidates : "Analyser ma situation" / "Lire mon contexte" / "Commencer l'analyse".

*À trancher : formulation exacte du CTA principal.*

## 12. Recommandation finale

### Quel parcours V1 est recommandé

Le parcours minimal viable pour la bêta est celui qui conduit l'utilisateur au aha comportemental (Étape 6) dans les 2 premières sessions.

Séquence cible :
1. Premier écran → promesse + CTA unique.
2. Formulaire guidé → premier verdict.
3. Invitation à l'import → premier profil comportemental.
4. Mémoire visible → retour J+7 motivé.

Tout le reste (portefeuille, historique long, macro, export) est accessible mais pas promu.

---

### Quelle priorité avant bêta

Rappel de l'ordre issu de l'addendum à l'audit V1 :

| Priorité | Action |
|---|---|
| 1 | Bugs terrain factuels (scroll iPad, overflow textes, lien 404) |
| 2 | Parcours Utilisateur V1 — ce document, validé |
| 3 | Modifications d'interface dérivées de ce parcours |
| 4 | Invitation bêta testeurs |
| 5 | Positionnement différenciant court |

Ce document est la Priorité 2. Il doit être validé avant d'ouvrir tout chantier d'implémentation UX.

---

### Quelles modifications d'interface devront probablement découler de ce parcours

Ces modifications sont probables mais ne doivent pas être codées avant validation de ce document :

- Masquage du Debug Brain par défaut (D3).
- Suppression des boutons Constellium de l'interface visible (D5).
- Réduction de la navigation principale à 3 onglets (D6).
- Repositionnement du Manifeste hors navigation principale (D4).
- Reformulation du CTA principal (D7).
- Ajout d'un texte d'orientation au premier écran.
- Contexte minimal pour chaque champ du formulaire moteur.
- Message de confirmation visible après import.

Aucune de ces modifications n'est une refonte. Ce sont des ajustements ciblés qui découlent directement du parcours défini.

---

### Ce qu'il ne faut surtout pas coder tant que ce document n'est pas validé

- Toute modification de la navigation ou de la structure des onglets.
- Tout ajout ou suppression d'un bloc au premier écran.
- Toute reformulation du CTA principal.
- Toute décision sur la visibilité par défaut du Debug Brain.
- Tout repositionnement du Manifeste.
- Tout masquage de Constellium.

Ces modifications doivent être dérivées du parcours, pas anticipées avant lui. Une modification prématurée devra probablement être défaite ou corrigée après validation — coût inutile.

---

*Ce document est un document produit — il ne déclenche aucune implémentation.*
*Toute ouverture de chantier UX doit référencer et avoir validé ce document.*
