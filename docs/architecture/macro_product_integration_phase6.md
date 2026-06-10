# Couche Macro — Intégration Produit (Phase 6)

**Caméléon Engine · Direction Architecture**
**Date : 2026-06-10**
**Statut : Document décisionnel Phase 6 — intégration produit uniquement**
**Prérequis : Phases 0 à 5 validées**

---

## 1. Mission

Répondre à une seule question : où la Couche Macro vit-elle dans Caméléon Engine sans casser le produit ?

Pas d'implémentation. Pas d'UI. Pas de maquette.

Architecture produit et doctrine uniquement.

---

## 2. Positionnement produit

### Analyse des options

**Couche invisible** — Le moteur l'utilise, l'utilisateur ne la voit pas. Rejetée : la valeur pédagogique est nulle, l'opérateur ne peut pas valider ni contester, et le logging perd son sens si l'opérateur ne sait pas ce qui est enregistré.

**Couche secondaire** — Visible mais subordonnée. Partiellement juste mais insuffisant comme positionnement — "secondaire" ne dit pas comment elle se relate aux quatre couches existantes.

**Couche parallèle** — Indépendante et au même niveau que le Moteur. Rejetée : crée un deuxième centre d'attention qui entre en compétition avec le verdict principal.

**Couche transversale** — Traverse toutes les couches sans appartenir à aucune. Enrichit chaque couche différemment sans les remplacer. Cela décrit exactement son rôle.

**Couche de contexte** — Correct mais trop vague comme catégorie de positionnement.

### Positionnement retenu : couche de contexte transversale

La Couche Macro n'est pas une cinquième couche qui s'ajoute à Pilotage / Moteur / Mémoire / Comportement. Elle est une dimension contextuelle qui traverse les quatre et les enrichit chacune différemment.

```
Pilotage  ←── Couche Macro enrichit la gouvernance (contexte de validité du cadre)
Moteur    ←── Couche Macro enrichit le registre narratif (pas le calcul)
Mémoire   ←── Couche Macro accompagne les sessions (Macro_State loggé)
Comportement ←── Couche Macro révèle les corrélations (valeur émergente)
```

Elle ne remplace aucune couche. Elle n'en concurrence aucune. Elle contextualise ce que les quatre couches produisent déjà.

---

## 3. Relation avec Pilotage

### La frontière définitive

Le Pilotage répond à : "Qu'est-ce que je vois et dans quel cadre je décide ?"

La Macro répond à : "Dans quel climat systémique je suis en train de voir ?"

Ces deux questions sont complémentaires et non-redondantes. Le Pilotage est subjectif et gouverné par l'opérateur. La Macro est systémique et décrite par les données.

### Coexistence sans chevauchement

Le Pilotage contient déjà des champs d'observation (état de marché, bitcoin, DXY, indicateurs Constellium). Ces champs capturent la lecture technique locale de l'opérateur. Ils ne capturent pas le régime systémique global.

Un opérateur peut voir une belle configuration technique locale (Pilotage → bonne lecture) dans un contexte systémique très dégradé (Macro → CONTRACTÉ). Ce n'est pas une contradiction — c'est une information complémentaire.

**Règle de non-duplication :** aucun champ macro ne doit dupliquer un champ Pilotage existant. Si l'opérateur déclare déjà BTC dans le Pilotage, la Macro ne demande pas une deuxième saisie de BTC. Elle demande BTC Dominance (part relative dans l'écosystème), qui est une information différente.

---

## 4. Relation avec le Moteur

### Ce que la Macro peut influencer

Uniquement le registre contextuel : les textes qui accompagnent le verdict, la tonalité du coaching, la friction narrative dans le Confidence Panel.

Un score de 72 en contexte EXPANSIF peut être présenté différemment d'un score de 72 en contexte CONTRACTÉ. L'état est identique. Le contexte dans lequel il est produit est différent. La Macro autorise cette nuance dans le langage.

### Ce que la Macro ne peut jamais influencer

Le score. La posture. Les actions autorisées ou interdites. La validation humaine. Le moteur décisionnel dans son ensemble.

**MACRO-RULE-01 est la règle la plus importante de toute la Couche Macro.** Elle n'est pas une contrainte technique — c'est la garantie que le produit reste un moteur cognitif et ne devient pas un système de signaux déguisé.

Test de régression obligatoire sur tout code macro futur : un même formulaire doit produire exactement le même score, la même posture, les mêmes actions — contexte macro activé ou non. Si ce test échoue, le code viole le Manifeste.

### Pourquoi ne pas permettre à la Macro d'influencer le score ?

Parce que le score mesure la cohérence de la décision locale de l'opérateur. Introduire un contexte systémique dans ce calcul transformerait le score en quelque chose que l'opérateur ne contrôle pas. Il obtiendrait un score différent pour la même analyse selon le régime macro — et perdrait le sens de ce que le score mesure.

La Macro et le Moteur mesurent des choses différentes. Les garder séparés est une décision de cohérence sémantique, pas seulement technique.

---

## 5. Relation avec la Mémoire

### Où le Macro_State est conservé

Le Macro_State accompagne chaque session dans l'historique. Il est un champ de la session, pas une section séparée. La Mémoire ne change pas de structure — elle s'enrichit d'un champ contextuel par entrée.

### Comment il enrichit la Mémoire

Une session dans l'historique contient aujourd'hui : le verdict, la posture, les signaux clés, l'état émotionnel, la date. Avec la Couche Macro, elle contient en plus : le régime systémique au moment de cette session.

L'opérateur qui consulte sa Mémoire dans 6 mois peut voir non seulement ce qu'il a décidé, mais dans quel contexte systémique il a décidé. Cette dimension temporelle du contexte est nouvelle.

### Ce qu'il ne doit pas remplacer

La Mémoire ne doit pas devenir une liste de Macro_States. Elle reste une liste de sessions décisionnelles. Le Macro_State est un attribut de ces sessions — il n'en est pas le sujet central.

---

## 6. Relation avec Comportement

### Pourquoi c'est le point le plus important

La Couche Comportement analyse les CSV et XLSX d'historique de trades pour révéler les patterns comportementaux de l'opérateur. La Couche Macro décrit le régime systémique dans lequel ces patterns se produisent.

Séparément, les deux couches produisent des lectures utiles mais limitées :
- Comportement seul : "Tu surtrading les semaines de forte volatilité."
- Macro seul : "Le contexte est EXPANSIF."

Ensemble, elles produisent quelque chose d'unique : "Dans les contextes EXPANSIFS, ton taux de suractivité augmente de façon significative."

Cette lecture n'existe nulle part ailleurs. Aucun outil de trading ne croise le régime systémique avec le comportement individuel sur durée. C'est l'intelligence exclusive de Caméléon Engine.

### Ce qui devient possible

Sur 12 à 24 mois de logging :
- Identifier les régimes dans lesquels l'opérateur se dégrade comportementalement
- Distinguer la dégradation personnelle de la dégradation systémique (tous les opérateurs se dégradent en CONTRACTÉ ? ou seulement cet opérateur ?)
- Produire des lectures personnelles régime-spécifiques : "Ton profil en EXPANSIF est différent de ton profil en NEUTRE"

### Ce qui reste impossible

- Les corrélations avant d'avoir un volume suffisant de sessions par régime
- La comparaison inter-régimes avant d'avoir traversé chaque régime plusieurs fois
- Les prédictions de comportement futur (hors doctrine)

### Ce qui doit attendre

La liaison technique entre le module Comportement et la Couche Macro (le pont Session × Comportement × Macro_State) est un chantier distinct. Il n'existe pas encore. Il ne peut pas être construit avant que les deux flux coexistent avec un volume suffisant.

**Ordre de réalisation :**
1. Logging Macro_State actif dès le premier commit
2. Accumulation des sessions sur 6 à 12 mois
3. Conception du pont Comportement × Macro
4. Activation des corrélations personnelles

---

## 7. Visibilité dans l'interface

### Analyse des options

**Option A — Invisible**
Rejetée. L'opérateur ne peut pas valider ni contester. La valeur pédagogique est nulle. Le logging perd son sens si l'opérateur ne sait pas ce qui est enregistré.

**Option B — Mention discrète (recommandée V1)**
Une ligne de contexte, discrète, séparée visuellement du score.
```
Contexte : Contracté  (données du 10/06)
```
Avantages : présente sans imposer, transparente, validable par l'opérateur, ne détourne pas l'attention du verdict moteur.
Risques : opérateur peut l'ignorer complètement → acceptable en V1.

**Option C — Carte dédiée**
Une section visible dans l'interface avec état + texte contextuel.
Avantages : lisible, contextuelle.
Risques : crée un deuxième centre d'attention. L'opérateur peut regarder la carte Macro avant le verdict moteur. Inversion de la hiérarchie cognitive.
**Rejetée en V1.** Possible en V2 si l'expérience terrain confirme que la mention discrète est insuffisante.

**Option D — Zone experte**
Accessible uniquement depuis le Debug Brain ou un mode avancé.
Avantages : ne pollue pas le cockpit principal.
Risques : trop invisible pour produire de la valeur pédagogique.
**Réservée au Niveau 3 (V2+)** pour les valeurs brutes et le détail des familles.

### Recommandation V1 : Option B

La mention discrète est le seul format compatible avec la phrase fondatrice du Manifeste. "Présence calme" implique que la Macro est là sans s'imposer. Elle informe sans diriger le regard.

**Règle de positionnement visuel :** la mention macro doit apparaître après le verdict moteur dans la hiérarchie visuelle. Jamais au-dessus. Jamais à côté. En dessous ou en dehors de la zone centrale du cockpit.

---

## 8. Risques produit

**Dérive dashboard**
La Couche Macro commence comme une ligne de contexte et devient un tableau de bord complet en 3 itérations. Chaque indicateur ajouté est présenté comme "juste un champ de plus".
Protection : règle d'or — tout ajout à la Couche Macro passe le filtre des 5 principes directeurs Phase 1. Aucune exception. Tout ajout doit être documenté comme décision explicite.

**Effet météo**
L'opérateur consulte le Macro_State comme il consulte la météo avant de sortir — pour décider si c'est "le bon moment". La Macro devient une permission ou une interdiction informelle.
Protection : le Macro_State ne commente jamais la pertinence d'une décision. Il décrit uniquement l'environnement. La formulation "ce contexte décrit l'environnement dans lequel vous décidez — pas la qualité de votre décision" doit apparaître dans l'onboarding.

**Dépendance psychologique**
"Je ne trade que si le Macro est EXPANSIF." L'opérateur développe une règle personnelle basée sur l'état macro, indépendamment de son analyse.
Protection : Macro_State et verdict moteur présentés visuellement comme indépendants. L'un n'influence pas l'autre — visuellement et architecturalement.

**Confusion avec le score**
L'opérateur interprète "EXPANSIF" comme un score élevé ou une permission du système.
Protection : séparation visuelle absolue. Les deux ne partagent jamais la même zone d'affichage. Libellés distincts (ne jamais appeler le Macro_State "score" ou "niveau").

**Inflation d'indicateurs**
Chaque nouvelle source macro est une tentation. "Et si on ajoutait le DXY ? Et TOTAL3 ? Et le sentiment ?"
Protection : la liste des sources est figée en V1. Toute modification nécessite une décision documentée de niveau architecture. Le manifeste interdit l'inflation.

**Surcharge cognitive**
La Couche Macro ajoute de l'information à un moment qui requiert déjà de la clarté.
Protection : Option B (mention discrète) minimise la charge. L'accès au détail est volontaire. Le cockpit principal reste inchangé.

---

## 9. Compatibilité Manifeste

### La phrase fondatrice

> "Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre."

### La Couche Macro renforce-t-elle cette phrase ?

**Oui, sous conditions strictes.**

"Présence calme" → La Macro est une mention discrète. Elle n'appelle pas l'attention. Elle est là si on cherche, invisible si on ne cherche pas.

"Rend la décision lisible" → La Macro enrichit la lisibilité en ajoutant le contexte systémique. La décision est mieux située dans son environnement. L'opérateur qui connaît le régime dans lequel il décide a une lecture plus complète.

"Sans la prendre" → Grâce à MACRO-RULE-01 et au vocabulaire interdit, la Macro ne prescrit jamais. Elle décrit. La décision reste entièrement à l'opérateur.

### Quand la Couche Macro affaiblit-elle cette phrase ?

Si l'une de ces conditions est violée :
- Le Macro_State apparaît avant ou au même niveau visuel que le verdict moteur
- Les textes narratifs contiennent un mot du vocabulaire interdit
- Le Macro_State influence le score, la posture ou les actions
- La Couche Macro devient un dashboard visible qui détourne l'attention

La Couche Macro telle que définie dans les phases 0 à 5 est compatible avec le Manifeste. La dérive l'en éloignerait.

---

## 10. Conditions avant implémentation

Checklist des conditions restantes. Chaque condition est bloquante.

**Conditions déjà formalisées (Phases 0–5)**
- ✅ Mission et doctrine figées (Phase 0)
- ✅ Modèle d'acquisition retenu — import ponctuel guidé (Phase 1)
- ✅ Format d'import défini — 6 champs, saisie UI (Phase 2)
- ✅ Règles de calcul Macro_State — consensus 3 familles (Phase 3)
- ✅ Registre narratif — vocabulaire interdit, test anti-prescription (Phase 4)
- ✅ Doctrine de logging — Session, 10 champs, conservation (Phase 5)

**Conditions restantes avant implémentation**

- ☐ Seuils qualitatifs calibrés avec un trader réel (à quel niveau BTC.D est-il "en concentration" ?)
- ☐ Labels des champs de saisie validés par un trader non-développeur
- ☐ Séparation visuelle documentée dans l'UI (zones distinctes Macro / Score)
- ☐ Plafond de conservation des sessions résolu (> 50 sessions)
- ☐ Mise en ligne effective (la Couche Macro n'a pas de valeur sans utilisateurs réels)
- ☐ Pont Comportement × Macro conçu (chantier distinct, post-logging)

---

## 11. Verdict Phase 6

**Où vit la Couche Macro ?**
Partout et nulle part. Elle est une couche de contexte transversale — elle enrichit chacune des quatre couches sans appartenir à aucune.

**Quel est son rôle réel ?**
Contextualiser l'environnement systémique dans lequel l'opérateur décide. Pas plus. Pas moins.

**Quelle est sa valeur produit ?**
À court terme : contextualisation narrative du verdict. À long terme : corrélation comportement personnel × régime systémique. C'est cette deuxième valeur — émergente, exclusive, irremplaçable — qui justifie son existence.

**Quelle est sa limite ?**
Elle ne sait pas ce que l'opérateur va faire. Elle ne sait pas si son analyse est bonne. Elle décrit l'environnement. Elle n'évalue pas la décision.

**Pourquoi ne doit-elle jamais devenir un deuxième moteur ?**
Parce que le Moteur mesure la cohérence de la décision locale. La Macro mesure le régime systémique. Fusionner les deux produirait un score que l'opérateur ne contrôle pas et ne comprend pas. Ce qui est clair et explicable séparément devient opaque ensemble.

---

## Résumé exécutif

**Décision la plus importante**
La Couche Macro est une couche de contexte transversale — elle n'est pas une cinquième couche, pas un deuxième moteur, pas un dashboard. Elle enrichit les quatre couches existantes sans en remplacer aucune.

**Risque principal**
Dérive dashboard : chaque ajout d'indicateur est présenté comme mineur jusqu'à ce que la Macro devienne le centre de gravité du produit. Filtre des 5 principes directeurs à appliquer sur tout ajout futur.

**Place de la Macro dans le produit**
Couche de contexte discrète, transversale, subordonnée au verdict Moteur dans la hiérarchie visuelle et cognitive.

**Valeur réelle**
À court terme : contextualisation narrative. À long terme (12–24 mois) : corrélation comportement × régime — intelligence exclusive inaccessible sans les deux flux coexistant sur durée.

**Limite fondamentale**
MACRO-RULE-01 : score, posture, actions intouchables. La Macro décrit l'environnement — elle n'évalue jamais la décision.

**Condition bloquante restante**
Mise en ligne effective + seuils qualitatifs calibrés terrain + séparation visuelle documentée + plafond sessions résolu. Aucune de ces conditions n'est optionnelle.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
