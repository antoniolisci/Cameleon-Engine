# CAMÉLÉON ENGINE — LECTURE ≠ ACTION

*Document doctrinal. Version 1.0. Complément du Language System V1.*

---

## Préambule

Ce document répond à une seule question, posée avec précision :

> **Pourquoi le fait de voir un signal n'autorise-t-il jamais à agir ?**

Cette question n'est pas rhétorique. Elle décrit une erreur réelle, fréquente, et cognitivement naturelle. Caméléon Engine peut afficher simultanément "Signal disponible, structure forte, engagement actif" et "Aucune entrée autorisée". Ce n'est pas une contradiction technique. C'est une distinction fondamentale entre quatre niveaux de réalité qui coexistent dans l'outil.

Ce document formalise cette distinction. Il n'est pas un guide pratique. Il est une contrainte architecturale permanente.

---

## Les quatre niveaux de réalité du moteur

Avant de répondre aux sept questions, il est nécessaire de nommer les quatre réalités que le moteur gère simultanément. Elles ne sont pas séquentielles. Elles coexistent à chaque instant.

| Niveau | Nom | Question qu'il répond | Qui décide |
|---|---|---|---|
| 1 | Ce que le moteur **voit** | Qu'est-ce qui se passe sur le marché ? | Le marché |
| 2 | Ce que le moteur **comprend** | Le signal est-il lisible ? | L'algorithme |
| 3 | Ce que le moteur **autorise** | Quelle action est dans le périmètre règlementaire ? | La politique interne |
| 4 | Ce que l'utilisateur **décide** | Est-ce que j'entre ? | L'humain |

Ces quatre niveaux ne se substituent jamais l'un à l'autre. Un signal visible (niveau 1) ne devient pas compréhensible (niveau 2) automatiquement. Un signal compréhensible (niveau 2) ne devient pas autorisé (niveau 3) automatiquement. Une action autorisée (niveau 3) n'est pas une action décidée (niveau 4) automatiquement.

Le glissement Lecture → Action est la confusion entre ces niveaux. Il n'est jamais la faute de l'utilisateur. Il est la faute du message qui a présenté le niveau 1 comme si c'était le niveau 3.

---

## Question 1 — Pourquoi un signal visible n'est pas une entrée

Un signal est une information de marché. Il dit : *ce pattern existe à cet instant*. Il ne dit pas : *tu peux agir*.

Entre la présence d'un signal et la légitimité d'une action, il existe au moins cinq conditions indépendantes qui doivent être remplies :

1. **Le signal est lisible.** La structure le supporte, la volatilité est cohérente, le volume confirme. (→ Couche Confiance)
2. **Le contexte de validation est actif.** L'opérateur a reconnu et accepté le setup. (→ Couche Validation)
3. **L'action est dans le périmètre autorisé.** La politique du moteur ne la bloque pas. (→ Couche Policy)
4. **Le verdict final est prescriptif.** La Final Decision dit explicitement que l'entrée est permise. (→ Couche Final Decision)
5. **L'opérateur décide d'agir.** Aucun moteur ne remplace cette décision. (→ Niveau 4, hors moteur)

La présence d'un signal valide la condition zéro — une condition nécessaire mais largement insuffisante. Présenter un signal visible sans mentionner les quatre conditions suivantes, c'est créer implicitement l'illusion qu'elles sont remplies.

**Règle de doctrine :** un message de Lecture qui évoque la présence d'un signal ne peut jamais, par son vocabulaire ou sa mise en forme, laisser entendre que les conditions 2, 3, 4 et 5 sont remplies.

---

## Question 2 — Pourquoi une lecture forte n'est pas une autorisation

La force d'une lecture décrit l'intensité d'un phénomène de marché. Elle ne dit rien de la pertinence de ce phénomène pour l'opérateur à cet instant.

Un marché peut être en expansion forte (+score 90), structure nette, volume confirmé — et l'action peut être totalement interdite pour l'opérateur parce que :

- il tient déjà une position (positionContext = HOLDING)
- sa validation est en attente (validationState = pending)
- son profil limite l'engagement (PASSIVE)
- son état comportemental est dégradé (guardLevel élevé)
- la session est en dehors des plages autorisées

La lecture forte est une description du marché. Elle ne connaît pas l'opérateur. Elle ne connaît pas son état. Elle ne connaît pas ses positions. Elle ne connaît pas sa validation.

Présenter une lecture forte comme si elle impliquait une autorisation revient à dire que le marché décide pour l'opérateur. C'est l'inverse exact du rôle de Caméléon Engine.

**Règle de doctrine :** la puissance d'un signal est une information neutre. Elle ne crée aucune permission implicite. Le qualificatif "fort" décrit le marché, pas l'action.

---

## Question 3 — Pourquoi la compréhension du marché ne doit pas créer une impulsion d'action

La compréhension est un état cognitif. L'action est un comportement moteur. Entre les deux, il y a une frontière qui, si elle est franchie inconsciemment, produit le trading impulsif.

Caméléon Engine est précisément conçu pour maintenir cette frontière ouverte — pour forcer une pause entre la compréhension et l'action. Son architecture en couches est une architecture de friction cognitive intentionnelle.

Le problème survient quand l'outil lui-même supprime cette friction en présentant la compréhension du marché comme une invitation à agir. Exemples de suppressions de friction :

- "Le signal SNIPER est actif" → l'utilisateur lit "actif" et sent qu'il doit agir maintenant
- "La fenêtre est ouverte" → l'utilisateur lit "ouverte" et sent que c'est le moment
- "Engagement favorable" → l'utilisateur lit "favorable" et amorce mentalement une entrée

Dans ces cas, le moteur a court-circuité sa propre architecture. La friction cognitive entre comprendre et agir a été supprimée par le langage avant même que la Validation, la Policy ou la Final Decision aient été consultées.

**Règle de doctrine :** une phrase de compréhension ne peut pas contenir de signal d'urgence temporelle, de fenêtre, de disponibilité, ou de toute formulation qui crée l'idée que "maintenant" est le bon moment. Le "maintenant" appartient exclusivement à la Final Decision.

---

## Question 4 — Comment empêcher cognitivement le glissement Lecture → Action

Le glissement Lecture → Action est un biais de représentation. L'utilisateur construit une représentation mentale de la situation à partir des messages de Lecture — et cette représentation l'amène à prendre une décision avant que les couches décisionnelles aient pu s'exprimer.

Ce glissement est renforcé par cinq mécanismes cognitifs qu'il faut identifier pour pouvoir les neutraliser :

### 4.1 — La représentation précoce

Le cerveau construit une image complète à partir d'informations partielles. Si la Lecture dit "signal fort", le cerveau anticipe "signal → entrée". Il comble le vide entre ce qu'il voit et ce qu'il suppose.

**Contre-mesure :** la Lecture doit décrire sans qualifier. Pas de "fort", "favorable", "actif" — mais "présent", "observé", "visible". Des termes qui décrivent sans induire de valeur.

### 4.2 — L'urgence implicite

Les fenêtres de trading sont temporelles. Le cerveau est conditionné à agir vite dès qu'il perçoit une opportunité temporaire. Un message qui contient "ouvert", "disponible", "actif" déclenche ce conditionnement même si le message n'est qu'une description.

**Contre-mesure :** bannir tout vocabulaire temporel de la Lecture et de la Confiance. L'urgence temporelle est le monopole de la Final Decision.

### 4.3 — La contamination par la couleur

Une couleur verte dans la zone de Lecture crée une association directe avec l'autorisation avant que l'utilisateur ait lu le texte. Le cerveau lit les couleurs avant les mots.

**Contre-mesure :** le vert saturé est réservé exclusivement au verdict ALIGNED. Aucune autre couche ne peut l'utiliser, même pour un signal positif. (Règle déjà posée dans Language System V1, Partie 3.)

### 4.4 — La hiérarchie visuelle inversée

Si la Lecture est affichée plus haut, plus grande ou plus visible que la Final Decision, l'utilisateur la traite cognitivement comme la couche principale. Il intègre les informations de Lecture avant les informations de décision.

**Contre-mesure :** la Final Decision doit être la couche la plus saillante visuellement — en position, en typographie, en poids visuel. Elle est la conclusion, elle doit se lire comme telle.

### 4.5 — La narration progressive

Si les messages de Lecture, Confiance, Validation et Policy sont présentés comme une histoire qui "monte" vers un climax d'action, l'utilisateur anticipe le climax avant d'y arriver. Il complète mentalement la narration.

**Contre-mesure :** les couches ne racontent pas une histoire qui conduit à l'action. Elles existent en parallèle. La Lecture décrit. La Confiance qualifie. La Validation reflète. La Policy encadre. Aucune ne prépare l'utilisateur à l'action — seule la Final Decision peut le faire.

---

## Question 5 — Éléments UI, couleurs, icônes, mots et positions qui créent le glissement

Cette section catalogue les vecteurs de glissement Lecture → Action identifiés dans le moteur et dans sa représentation visuelle.

### 5.1 — Mots à risque élevé de glissement

Ces mots apparaissent naturellement dans des descriptions de marché mais transportent implicitement une prescription d'action.

| Mot | Contexte risqué | Raison du glissement | Substitut doctrinal |
|---|---|---|---|
| **actif** | "Signal actif", "Engagement actif" | Implique que quelque chose est en train de se faire — invite à rejoindre | "présent", "observé", "visible" |
| **ouvert** | "La fenêtre est ouverte", "Sniper ouvert" | Fenêtre = moment limité = urgence implicite | "Signal sniper détecté", "conditions sniper présentes" |
| **disponible** | "Entrée disponible", "Signal disponible" | Disponible pour qui ? Pour moi, maintenant — action imminente | "Signal identifié", "conditions réunies côté marché" |
| **favorable** | "Contexte favorable", "Setup favorable" | Favorable pour quoi ? Pour entrer — prescription implicite | "Contexte lisible", "structure présente" |
| **exploitable** | "Signal exploitable", "Niveau exploitable" | Exploitable = à exploiter — prescription directe | "Signal lisible", "niveau identifié" |
| **fort** | "Signal fort", "Engagement fort" | Fort → significatif → agir — inférence de légitimité | "Signal de niveau élevé", "score supérieur à X" |
| **activé** | "Mode sniper activé" | Activé = en service = maintenant = agir | "Conditions sniper présentes" |
| **engagement** | "Engagement actif" | L'engagement est une action, pas une description | "Niveau de signal élevé" |

### 5.2 — Icônes à risque élevé de glissement

| Icône | Usage risqué | Raison | Substitut |
|---|---|---|---|
| ✅ (coche verte) | Confirmé dans la zone Lecture | Le cerveau lit "autorisé" avant de lire le texte | Icône neutre, descriptive |
| 🟢 (cercle vert) | Signal présent | Associé à "feu vert" — action autorisée | Cercle gris ou bleu neutre |
| ⚡ (éclair) | Signal fort ou actif | Urgence, énergie — incite à agir | Icône statique et froide |
| 🎯 (cible) | Mode sniper actif | La cible appelle à viser — prescription implicite | Description textuelle uniquement |
| 🔓 (cadenas ouvert) | Condition remplie | Ouvert = accès autorisé — action implicite | Icône neutre ou absente |

### 5.3 — Positions visuelles à risque élevé de glissement

| Position | Risque | Raison | Règle corrective |
|---|---|---|---|
| Lecture affichée en premier (haut de page) | Élevé | Le cerveau traite les premières informations comme les plus importantes | La Final Decision doit être visuellement dominante |
| Lecture et Final Decision à même taille typographique | Élevé | Aucune hiérarchie perçue — l'utilisateur les traite comme équivalentes | Final Decision : 140-160%, Extra-bold |
| Couleur identique entre Lecture positive et verdict ALIGNED | Critique | Le cerveau établit l'association "signal positif = autorisé" | Palettes strictement séparées |
| Message de Lecture immédiatement adjacent à la liste d'actions | Élevé | Proximité visuelle → association causale | Séparation visuelle explicite entre couches |
| Score de confiance affiché sans contexte de validation | Modéré | "78% de confiance" → l'utilisateur infère "78% d'autorisation" | Le score doit toujours coexister avec l'état de validation |

### 5.4 — Structures narratives à risque élevé de glissement

| Structure | Exemple | Risque |
|---|---|---|
| Enumération ascendante | "Signal ✅ → Confiance ✅ → Validation ✅ → Entrer ?" | Chaque ✅ renforce l'anticipation de l'action finale |
| Résumé consolidé | "Tout est en place pour entrer" | Synthèse prescriptive déguisée en constat |
| Question rhétorique | "Le marché est prêt ?" | La question appelle une réponse d'action |
| Narration temporelle | "Le signal vient de s'activer" | "Vient de" crée une urgence temporelle artificielle |

---

## Question 6 — Comment le Language System V1 protège cette frontière

Le Language System V1 est la réponse architecturale à la confusion Lecture → Action. Ses mécanismes de protection sont au nombre de cinq.

### 6.1 — Le cloisonnement épistémique des couches

Chaque couche a une épistémologie définie : elle sait ce qu'elle sait, et elle ignore ce qu'elle ignore. La Lecture ne sait pas que la Validation est acceptée. La Confiance ne sait pas ce que la Policy autorise. Ce cloisonnement est une contrainte cognitive : une couche qui ne sait pas qu'une action est autorisée ne peut pas, même accidentellement, laisser entendre qu'elle l'est.

> Règle R01 du Language System V1 : *"Chaque couche ne parle que de ce qu'elle sait."*

### 6.2 — La prohibition absolue du vocabulaire prescriptif hors Final Decision

Les mots "ouvrir", "saisir", "exploitable", "favorable", "actif", "disponible", "possible" sont bannis de toutes les couches sauf Final Decision. Ce n'est pas une recommandation stylistique — c'est une interdiction de doctrine. Un message de Lecture qui contient l'un de ces mots viole le Language System V1, indépendamment de son intention.

> Règle R06 : *"Un mot prescriptif dans une couche de lecture est une violation de doctrine, même si le contexte semble l'innocenter."*

### 6.3 — Le monopole de l'impératif

L'impératif est la forme grammaticale de la prescription : "entre", "attends", "réduis", "protège". Ces formes appartiennent exclusivement à la Final Decision. Une couche de Lecture ne peut pas utiliser l'impératif, même implicitement. "Le marché attend une cassure" est autorisé. "Attendre la cassure" ne l'est pas.

> Règle R15 : *"Une couche de Lecture ne peut pas utiliser l'impératif."*

### 6.4 — La réserve absolue du vert saturé

La couleur verte à haute saturation (#4CAF50) est réservée exclusivement au verdict ALIGNED. Ce n'est pas une convention visuelle — c'est une règle cognitive. Le vert vif est la seule couleur que le cerveau humain associe universellement à "go". En le réservant à l'unique état où l'entrée est réellement autorisée, le Language System V1 supprime toute ambiguïté chromatique.

> Règle R09 : *"Le vert saturé (#4CAF50) est exclusivement réservé à la Final Decision avec verdict ALIGNED."*

### 6.5 — La domination visuelle de la Final Decision

La Final Decision est la couche la plus grande, la plus grasse, la plus saillante. Elle est conçue pour être lue en premier, même si elle apparaît en dernier dans l'écran. Sa typographie (140-160%, Extra-bold) la distingue de toutes les autres couches. L'utilisateur ne peut pas confondre une information de Lecture avec la décision finale si elles ont des poids visuels radicalement différents.

> Règle R12 : *"La Final Decision est la couche visuellement dominante. Sa typographie est incomparable avec les autres couches."*

---

## Question 7 — Tests de conformité Lecture ≠ Action

Ces tests permettent de vérifier, lors de toute modification du moteur ou de l'interface, que la frontière Lecture ≠ Action n'a pas été franchie. Ils s'appliquent à chaque release, chaque refactoring narratif, chaque ajout de couche ou de message.

---

### TEST 01 — Test du vocabulaire prescriptif en zone de Lecture

**Procédure :** lire tous les messages générés par les couches Lecture (couche 1) et Confiance (couche 2) dans les 6 états du marché (expansion, range, compression, defense, riskoff, indéfini).

**Critère de conformité :** aucun des messages ne contient les mots suivants : *ouvrir, saisir, exploitable, favorable (sens autorisation), actif (sens engagement), disponible (sens pour toi maintenant), possible (seul), entrer, agir, maintenant, opportunité (sens invitation)*.

**Violation détectée si :** au moins un de ces mots apparaît dans un message de couche 1 ou 2.

---

### TEST 02 — Test de la couleur verte en dehors de ALIGNED

**Procédure :** inspecter visuellement et par inspection du CSS toutes les couleurs utilisées dans les couches 1, 2, 3 et 4.

**Critère de conformité :** aucune couleur de la famille verte saturée (entre `#3C8F40` et `#6FCF70`, luminosité > 40%, saturation > 50%) n'apparaît dans ces couches.

**Violation détectée si :** une teinte verte vive est utilisée pour indiquer un signal positif, une validation acceptée (hors contexte spécifique), ou une confiance élevée.

---

### TEST 03 — Test de la domination visuelle de la Final Decision

**Procédure :** ouvrir le moteur avec n'importe quel scénario. Sans lire les textes, identifier visuellement quelle zone attire l'œil en premier.

**Critère de conformité :** la Final Decision est identifiable en moins de 2 secondes comme la zone principale, par son poids typographique ou sa position.

**Violation détectée si :** un bloc de Lecture ou de Confiance capte l'attention avant la Final Decision.

---

### TEST 04 — Test du scénario contradictoire

**Procédure :** configurer le moteur dans un état où la Lecture est forte (score > 75, signal présent, expansion active) mais la Final Decision est BLOCKED ou WAIT (validation absente, comportement dégradé, profil PASSIVE).

**Critère de conformité :** les messages de Lecture décrivent le marché sans créer d'attente d'action. Le verdict BLOCKED ou WAIT est la seule voix prescriptive. L'utilisateur qui lit uniquement la Final Decision a toutes les informations nécessaires pour ne pas agir.

**Violation détectée si :** un message de Lecture dit "le signal est prêt" ou équivalent alors que la Final Decision dit BLOCKED — créant une contradiction narrative non résolue.

---

### TEST 05 — Test de l'impératif hors Final Decision

**Procédure :** lire tous les messages de toutes les couches sur l'ensemble des états possibles.

**Critère de conformité :** aucun impératif (verbe conjugué à l'impératif, injonction directe) n'apparaît dans les couches 1, 2, 3 et 4.

**Violation détectée si :** une phrase comme "Attendre la validation", "Observer le niveau X", "Réduire l'exposition" apparaît dans une couche autre que la Final Decision.

---

### TEST 06 — Test de l'autosuffisance de la Final Decision

**Procédure :** masquer visuellement toutes les couches sauf la Final Decision. Lire uniquement le verdict et son message.

**Critère de conformité :** l'opérateur sait exactement quoi faire sans avoir besoin de lire les autres couches. Le verdict est complet, non ambigu, non conditionnel implicitement.

**Violation détectée si :** la Final Decision contient des références à d'autres couches ("comme indiqué ci-dessus", "voir le signal", "si le marché continue") sans préciser explicitement la condition.

---

### TEST 07 — Test de l'icône sans légende

**Procédure :** masquer tous les textes. Observer uniquement les icônes et leurs couleurs associées dans les zones de Lecture et Confiance.

**Critère de conformité :** aucune icône ne crée implicitement une invitation à agir (pas de coche verte, pas de feu vert, pas d'éclair, pas de cible, pas de cadenas ouvert).

**Violation détectée si :** un utilisateur qui voit uniquement l'icône — sans texte — peut raisonnablement en déduire qu'une action est autorisée.

---

### TEST 08 — Test du premier regard (heat map cognitif)

**Procédure :** montrer l'interface à une personne n'ayant jamais vu le moteur pendant 5 secondes. Lui demander : "Que vous dit cet écran ?" et "Seriez-vous prêt à agir ?"

**Critère de conformité :** la personne identifie la zone principale comme une zone de décision (Final Decision), pas une zone d'information positive qui invite à agir.

**Violation détectée si :** la personne dit "je vois que c'est le moment d'entrer" en se basant sur des éléments de Lecture ou de Confiance.

---

### TEST 09 — Test de non-narration ascendante

**Procédure :** lire les messages de toutes les couches dans l'ordre d'affichage. Vérifier s'ils créent une progression narrative vers un climax d'action.

**Critère de conformité :** les couches sont parallèles, pas séquentielles. Aucune couche ne "mène" à la suivante. La Lecture ne prépare pas à la Confiance. La Confiance ne prépare pas à la Validation. Chaque couche est autonome.

**Violation détectée si :** lues dans l'ordre, les couches donnent l'impression d'une narration "montante" qui culminerait naturellement dans une action.

---

### TEST 10 — Test de stabilité sémantique inter-versions

**Procédure :** lors de chaque modification de `render.js`, `trading-policy.js` ou `data.js`, comparer les messages avant/après modification pour les scénarios suivants :
- Expansion forte + validation absente (doit rester WAIT)
- Range + validation acceptée + profil PASSIVE (doit rester READY au maximum)
- Signal fort + comportement dégradé (doit rester BLOCKED ou PROTECT)

**Critère de conformité :** aucun de ces scénarios ne produit un message de Lecture ou Confiance plus prescriptif après la modification qu'avant.

**Violation détectée si :** une modification introduit dans un message de Lecture un mot qui n'y était pas avant — même si la modification portait sur un autre aspect du moteur.

---

## Synthèse — Les quatre règles absolues de cette doctrine

Ces quatre règles condensent l'ensemble du document. Elles s'appliquent sans exception.

---

**RÈGLE ABSOLUE 1 — La visibilité n'est pas la permission**

Un signal visible dans la couche Lecture n'est jamais une autorisation d'agir. Ces deux réalités coexistent sans implication causale. Le moteur peut les afficher simultanément sans contradiction — à condition que leur langage, leur couleur et leur position ne créent pas d'implication artificielle.

---

**RÈGLE ABSOLUE 2 — Seule la Final Decision peut prescrire**

Aucune autre couche n'a le droit d'utiliser le vocabulaire de l'action, de l'urgence, ou de la permission. Toute phrase qui, dans les couches 1 à 4, crée l'idée qu'une action est disponible ou recommandée viole cette règle.

---

**RÈGLE ABSOLUE 3 — L'utilisateur ne doit jamais combler le vide**

Si un message laisse un vide entre "je vois" et "donc j'agis", l'utilisateur comblera ce vide lui-même — et ce comblement sera toujours en faveur de l'action. La doctrine Lecture ≠ Action impose que ce vide ne soit jamais laissé ouvert : la Final Decision le comble explicitement, ou le vide est signifié comme une attente délibérée.

---

**RÈGLE ABSOLUE 4 — La hiérarchie cognitive est une responsabilité du moteur**

Il ne revient pas à l'utilisateur de distinguer ce qui est une description et ce qui est une prescription. C'est au moteur de rendre cette distinction évidente — par le vocabulaire, par la couleur, par la typographie, par la position. Si un utilisateur confond Lecture et Action, c'est le moteur qui a échoué, pas l'utilisateur.

---

## Articulation avec le Language System V1

Ce document est un complément au Language System V1, non un remplacement. Il l'approfondit sur un point précis : la nature et les mécanismes du glissement cognitif entre la description et la prescription.

| Language System V1 | Lecture ≠ Action |
|---|---|
| Définit les règles de chaque couche | Explique pourquoi ces règles existent |
| Liste les mots bannis | Explique le mécanisme cognitif de chaque mot banni |
| Définit la palette de couleurs | Explique pourquoi la couleur précède la cognition |
| Pose R01–R20 comme contraintes | Pose les tests qui vérifient que ces contraintes tiennent |

Ces deux documents forment le socle doctrinal du moteur langagier de Caméléon Engine. Aucune modification narrative ne peut être considérée comme valide si elle n'est pas compatible avec ces deux documents.

---

*Document fondateur. Version 1.0.*
*Référence : Language System V1 — docs/doctrine/cameleon_engine_language_system_v1.md*
*Application Constellium de ce principe (observer sans prescrire) : `docs/architecture/constellium/constellium_v1_definition.md` (§1 Définition négative · §7 Langage autorisé)*
