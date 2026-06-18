# Profils opérateurs Constellium — Caméléon Engine

## Métadonnées

**Statut** : Document fondateur · Chantier Constellium · Aucune implémentation
**Version** : 1.0 — 2026-05-25
**Prérequis** : `audit-indicateurs-comportementaux.md` (validé)
**Objet** : Définition des 5 régimes opératoires — structure de lecture contextuelle
des indicateurs comportementaux
**Ce document ne produit pas** : seuils · scores · algorithmes · flags · code

**Phrase fondatrice :**
> La calibration adapte l'interprétation. Elle ne blanchit jamais les dérives.

---

## Préambule — ce que sont les profils Constellium

Les profils Constellium ne sont pas des catégories marketing. Ils ne sont pas
des personas psychologiques. Ils ne sont pas des labels destinés à classifier
les utilisateurs dans des boîtes.

Ce sont des **régimes opératoires** — des structures cohérentes de comportement
de trading, caractérisées par une logique interne propre, un rapport spécifique
au marché et au timing, et une lecture particulière des signaux.

Un régime opératoire n'est pas une identité. Un opérateur peut travailler en mode
Range sur un actif et en mode Swing sur un autre. Il peut passer du mode Défensif
au mode Momentum selon le contexte de marché. Les profils sont des lectures
d'un état courant, pas des diagnostics permanents.

**Ce que les profils permettent au moteur :**

Relire les mêmes comportements observables (fréquence, taille, timing) avec une
grille d'interprétation contextuelle plutôt qu'une grille de seuils absolus.
Un comportement qui signale une dérive chez un Swing est normal chez un Range.
Un comportement qui signale la discipline chez un Momentum peut signaler une prise de
risque excessive chez un Défensif.

**Ce que les profils ne permettent pas :**

Absoudre les comportements pathologiques. Un opérateur Range qui fait du loss chasing
n'est pas "en train de pratiquer son style" — il est en train de dériver. Les garde-fous
universels s'appliquent à tous les profils sans exception.

**La tension fondamentale que les profils doivent résoudre :**

Un comportement fréquent n'est pas forcément un comportement sain.
Un comportement intense n'est pas forcément un comportement impulsif.

Les deux vérités sont nécessaires simultanément. Elles ne peuvent pas être résolues par
un seuil unique. Elles nécessitent une lecture opératoire.

---

## Note sur la perméabilité des profils

Les profils sont perméables par conception. Un opérateur peut être en transition entre
deux régimes opératoires. Il peut adopter temporairement un régime différent du sien.
Il peut évoluer durablement d'un profil vers un autre.

Le moteur ne doit pas figer un opérateur dans un profil. Il doit observer :
- la cohérence interne du comportement courant
- la distance entre le comportement courant et le régime apparent
- les transitions de régime, qui peuvent être stratégiques ou symptomatiques

Une transition de régime stratégique (l'opérateur Swing qui passe délibérément en mode
Défensif pendant une période de haute incertitude) est une décision disciplinée.
Une transition de régime symptomatique (l'opérateur Range qui glisse vers la direction
à mesure qu'il accumule des pertes sur sa grille) est une dérive à signaler.

Le moteur doit distinguer les deux. Les profils fournissent la grille de lecture
pour faire cette distinction. Mais c'est le cockpit — la relation vivante à la décision,
pas la trace statistique — qui peut révéler l'intention.

---

# Profil 1 — Range / Grid

## 1. Description opératoire

L'opérateur Range/Grid travaille à l'intérieur de bandes de prix définies. Sa logique
dominante est l'oscillation : le marché revient sur ses niveaux, l'opérateur achète
bas et vend haut dans une structure répétitive.

Ce régime opératoire peut être entièrement mécanique (grille d'ordres automatisée sur
une plateforme) ou semi-manuel (l'opérateur pose ses ordres sur les niveaux de la bande
en fonction de son analyse du moment). Dans les deux cas, la structure sous-jacente est
la même : des niveaux de prix définis, une fréquence d'activité élevée par design,
une logique sans biais directionnel fort.

Le rapport au marché est local et non prévisionnel : l'opérateur Range ne cherche pas
à prédire la direction future du marché. Il cherche à capturer l'oscillation présente.
Sa thèse est que le marché reste dans la bande — pas qu'il montera ou baissera.

Le rapport au timing est court et récurrent : l'entrée et la sortie sont définies par
des niveaux de prix, pas par des horizons temporels. La durée de détention est une
conséquence du mouvement de marché, pas une décision de l'opérateur.

Le rapport à la fréquence est élevé et structurel : l'activité dense n'est pas un
symptôme, c'est le mécanisme d'extraction de valeur du régime.

## 2. Activité saine typique

**Fréquence :** élevée à très élevée sur les actifs range. Plusieurs entrées et sorties
sur le même actif dans la même journée sont normales. L'activité peut s'arrêter
entièrement si le marché sort de la bande.

**Durée de détention :** courte à très courte. La durée dépend de l'amplitude de la
bande et de la vitesse d'oscillation. Des positions tenues de quelques minutes à
quelques heures sont normales.

**Re-entry :** fréquente et structurelle. Après une sortie au haut de la bande, l'opérateur
attend le retour au bas de la bande pour ré-entrer. Cette ré-entrée est planifiée,
pas réactionnelle.

**Fragmentation :** les positions peuvent être fragmentées en plusieurs ordres pour
optimiser le fill sur la bande. Ce n'est pas de l'indécision — c'est de la précision.

**Rotation :** limitée. L'opérateur Range/Grid tend à se concentrer sur les actifs
qu'il connaît et dont il maîtrise les bandes historiques. La rotation vers de nouveaux
actifs est lente et délibérée.

**Concentration :** souvent élevée sur un ou deux actifs maîtrisés. La concentration
est une forme de connaissance, pas de paris.

**Exposition :** contrôlée par la structure de la grille. Les positions individuelles
sont petites ; c'est la somme des positions qui peut constituer une exposition significative.

**Pacing :** dicté par le marché, pas par l'opérateur. Pendant un range dense, l'activité
s'accélère. Pendant une consolidation sans amplitude, l'activité se réduit.

## 3. Activité malsaine typique

**La grille devient directionnelle sans reconnaissance.**
L'opérateur observe que ses ordres BUY sont régulièrement touchés mais que ses ordres
SELL ne l'ont pas été depuis plusieurs cycles. Plutôt que de reconnaître que le marché
a changé de régime (breakout à la baisse), il ajoute des niveaux inférieurs à sa grille.
Sa structure range est devenue un averaging down silencieux.

**L'extension des bandes face à la pression.**
Lorsque le prix approche de la limite inférieure de la grille, l'opérateur déplace
la limite encore plus bas pour ne pas "être arrêté". La bande s'étend indéfiniment.
Ce comportement transforme une stratégie limitée en une exposition illimitée.

**La dépendance psychologique à l'activité.**
L'opérateur Range peut développer une intolérance à l'inactivité. Si le marché est
en tendance et que la grille ne se déclenche pas, l'opérateur invente des raisons
de trader plutôt que d'attendre la restauration du régime. Il sort du Range sans
le reconnaître.

**La grille comme mécanisme d'évitement de la perte comptable.**
L'opérateur garde des ordres BUY ouverts à des niveaux défavorables parce que "les
ordres se récupèrent" à terme dans un range. Cette logique est valide si le range
est réel. Elle est une forme de déni si le marché a breakouté durablement.

## 4. Faux positifs typiques des indicateurs

**Overtrading (systématique) :** le profil Range/Grid produit mécaniquement le signal
overtrading. Ce faux positif est documenté et partiellement adressé dans l'implémentation
via le grid-grouper et la contextualisation GRID. Mais ces mécanismes ne couvrent pas
tous les cas de range trading non formalisé en grille stricte.

**Rapid reentry (structurel) :** la ré-entrée après un cycle range complet (SELL au haut,
BUY au bas peu après) déclenche le signal de rapid reentry. Pourtant, c'est exactement
le comportement attendu du régime.

**Revenge trading (partiel) :** un cycle SELL→BUY rapide avec une taille légèrement
supérieure peut déclencher le signal si la taille varie selon le niveau de la bande
(l'opérateur achète plus au bas de la bande, considérant que c'est le meilleur niveau).

## 5. Faux négatifs typiques

**Le breakout de range non reconnu.**
L'opérateur continue sa grille alors que le marché a quitté le range. Ses achats successifs
au bas de la grille produisent un pattern de loss chasing si les prix descendent,
mais les montants peuvent rester dans les limites du seuil d'escalade (1.8×) si
l'extension est graduelle.

**La dérive directionnelle masquée par la cohérence des tailles.**
La grille peut rester cohérente en sizing tout en devenant progressivement
directionnelle. Le size_inconsistency ne détecte rien si les tailles restent
régulières — mais l'accumulation nette devient un pari directionnel.

**L'overexposition cumulative invisible.**
Une grille avec 12 niveaux d'achat peut paraître "raisonnable" par taille individuelle
et pourtant représenter une surexposition significative à la position totale cumulée.
Aucun indicateur individuel ne capture l'exposition totale cumulée d'une grille.

## 6. Relation aux régimes de marché

**Range :** environnement naturel du profil. L'activité est productive, les signaux
comportementaux sont des faux positifs structurels. Le moteur doit lire l'activité
dense comme normale dans ce contexte.

**Expansion (tendance forte) :** régime hostile. La grille ne se recycle pas — les
ordres BUY sont touchés mais les ordres SELL restent ouverts à des niveaux inférieurs
au prix actuel. Risque de sur-accumulation si l'opérateur ne reconnaît pas le changement
de régime. C'est la zone de dérive la plus dangereuse pour ce profil.

**Compression (volatilité faible) :** range étroit qui peut sembler favorable mais
dont l'amplitude réduit la rentabilité. L'opérateur peut tenter d'augmenter les tailles
pour compenser la faible amplitude — signal potentiel de size_inconsistency.

**Volatilité extrême :** les niveaux de la grille sont traversés très rapidement.
Les ordres peuvent être executés en cascade dans les deux sens. L'activité est
très élevée et peut sembler chaotique sans l'être. Le grid-grouper aide à absorber
ces séquences mais pas toujours.

**Euphorie :** le marché monte au-dessus de toutes les bandes définies. L'opérateur
Range a vendu tôt et observé le mouvement. Risque de FOMO — sortir du Range pour
"participer" à la tendance.

**Capitulation :** le marché descend sous les limites de la grille. C'est le moment
de risque maximal — tentation d'étendre la grille vers le bas indéfiniment.

## 7. Garde-fous universels

- **L'extension de bande sous pression de perte reste toujours un signal fort.**
  Peu importe que l'opérateur soit en profil Range. Reculer ses niveaux de stop
  ou d'extension de grille après une série de pertes décrit un refus d'accepter
  le changement de régime.

- **L'accumulation nette croissante reste un signal.**
  Une grille qui produit systématiquement plus de BUYs que de SELLs sur une période
  prolongée décrit une position nette qui croît — exposure increasing sans décision
  explicite. Ce n'est pas neutre.

- **L'intolérance à l'inactivité reste un signal.**
  Si l'activité range cesse parce que le marché a changé de régime, l'incapacité
  à accepter cette pause est un signal comportemental. Le Range doit savoir attendre.

## 8. Risque de sur-ajustement

**Risque principal : absoudre toute densité d'activité au nom du style.**

Si le moteur apprend que l'opérateur est en profil Range et décide de ne jamais
déclencher d'overtrading pour lui, il perd la capacité de détecter une véritable
escalade d'activité émotionnelle. L'opérateur Range peut aussi avoir des sessions
d'agitation qui ne sont pas des cycles range normaux.

**Risque secondaire : normaliser la dérive directionnelle progressive.**

La grille qui s'étend graduellement vers le bas peut sembler cohérente si chaque
extension individuelle est petite. La normalisation de ce comportement sur une
longue période conduit à une exposition massive non reconnue.

**Protection conceptuelle :** le moteur doit surveiller la symétrie de la grille
(le ratio BUY/SELL doit être approximativement équilibré sur un range réel) et la
stabilité des niveaux de la grille. Une grille qui évolue constamment n'est plus
une grille — c'est un averaging down déguisé.

## 9. Relation au cockpit

**Ce que le CSV Binance peut observer :**
- La structure des cycles BUY/SELL (symétrie, régularité)
- La stabilité des tailles de position dans la grille
- La fréquence de l'activité et sa relation aux actifs concentrés
- L'évolution de l'exposition nette sur la période
- La présence ou l'absence de groupes grille réguliers

**Ce que seule une session cockpit peut révéler :**
- L'opérateur reconnaît-il que le régime a changé ?
- Sa posture déclarée (ACTIVE/BALANCED) est-elle cohérente avec l'activité range ?
- Sa perception du risque est-elle calibrée à son exposition cumulée réelle ?
- Ressent-il une pression à "récupérer" via des entrées supplémentaires ?

## 10. Phrase Caméléon Engine

> Ton activité est cohérente avec un régime de range actif. Vérifie que le marché
> reste dans la bande que tu as définie et que ton exposition cumulée reste
> dans les limites de ta gestion du risque.

---

# Profil 2 — Swing / Patience

## 1. Description opératoire

L'opérateur Swing/Patience travaille sur des horizons de plusieurs jours à plusieurs
semaines. Sa logique dominante est la sélection : il cherche des setups à forte
asymétrie risque/rendement, attend la confirmation, entre avec conviction, et
accepte la durée comme condition de l'opportunité.

Ce régime opératoire est caractérisé par sa lenteur relative et sa sélectivité.
L'opérateur Swing ne cherche pas à "toujours être dans le marché" — il cherche à
n'être dans le marché que lorsque les conditions sont clairement favorables.

Le rapport au marché est structurel et prévisionnel : l'opérateur Swing analyse des
structures de prix (niveaux, tendances, cycles) pour formuler une thèse à moyen terme.
Il entre sur la base d'une lecture, pas sur la base d'un signal court terme.

Le rapport au timing est lent et délibéré : l'entrée est préparée, parfois attendue
plusieurs jours. La sortie est prédéfinie (cible de prise de profit, niveau d'invalidation).

Le rapport à la fréquence est faible par design : l'opérateur Swing peut ne pas trader
plusieurs jours d'affilée. Cette inactivité est une caractéristique de la discipline,
pas un symptôme d'absence.

## 2. Activité saine typique

**Fréquence :** faible. Quelques trades par semaine au maximum. Des périodes
d'observation totale sans trade pendant plusieurs jours sont normales et souhaitables.

**Durée de détention :** longue à très longue. Des positions tenues plusieurs jours,
semaines ou mois sont caractéristiques du style. La détention longue reflète la
patience, pas la passivité.

**Re-entry :** rare et calculée. L'opérateur Swing ne réentre pas rapidement après
une sortie. Il réobserve, reformule une thèse, et attend le prochain setup qualifié.

**Fragmentation :** possible sur les entrées (tranche initiale + renforcement sur
confirmation), mais rarement sur les sorties.

**Rotation :** lente. Changer d'actif demande une nouvelle analyse. L'opérateur Swing
ne pivote pas rapidement d'un actif à l'autre.

**Concentration :** naturellement élevée. Avoir une ou deux positions actives est normal.
La concentration reflète la conviction de la thèse, pas le manque de diversification.

**Exposition :** significative par position (le Swing mise sur ses convictions), mais
limitée en nombre de positions simultanées.

**Pacing :** dicté par la formation des setups, pas par le passage du temps. L'opérateur
Swing peut rester inactif pendant une compression et devenir plus actif lorsque
plusieurs setups se forment simultanément.

## 3. Activité malsaine typique

**La patience devient de la paralysie.**
L'opérateur attend le "setup parfait" qui n'arrive jamais. Sa sélectivité se transforme
en inaction systématique. Il passe à côté de séries entières d'opportunités en attendant
une certitude qui ne peut pas exister dans le trading. La paralysie est souvent masquée
par la rationalisation ("le marché n'est pas clair").

**La conviction devient de l'entêtement.**
L'opérateur tient une position dont la thèse initiale a été invalidée par le marché.
Il ajoute à la position ou refuse de sortir parce qu'il "sait" que le marché finira
par lui donner raison. La conviction légitime et l'entêtement pathologique ont la même
apparence externe (non-réaction aux signaux adverses). Seule l'analyse de la cohérence
entre la thèse initiale et les développements de marché les distingue.

**L'averaging down silencieux.**
L'opérateur Swing qui ajoute à une position perdante "parce que le niveau est encore
meilleur" glisse vers un comportement de loss chasing sans le reconnaître. La durée
de sa détention (caractéristique saine du style) masque la nature problématique de
l'escalade progressive.

**Les "boredom trades".**
Entre deux setups qualifiés, l'opérateur s'ennuie. Il place un trade "pour tester"
ou "pour rester actif", en dehors de ses critères habituels. Ce trade sort du régime
Swing sans que l'opérateur le reconnaisse comme tel. Sa trace dans l'historique est
incohérente avec le reste du profil.

## 4. Faux positifs typiques des indicateurs

**Size inconsistency (sur la trade de conviction) :** l'opérateur Swing peut avoir
une grande position sur son meilleur setup et des positions beaucoup plus petites
sur les setups secondaires. Le CV est naturellement élevé — mais cette variation
reflète une politique de conviction différenciée, pas un défaut de gestion du risque.

**Rapid reentry (sur correction de thèse) :** si l'opérateur sort une position (stop
déclenché) et identifie immédiatement que le mouvement est un faux signal, il peut
ré-entrer dans les 45 minutes avec la même thèse et une taille identique. La rapid
reentry est ici une gestion rigoureuse, pas de l'impatience.

## 5. Faux négatifs typiques

**L'averaging down lent (hors fenêtre des indicateurs) :**
Un opérateur Swing qui ajoute à une position perdante une fois par semaine pendant
3 semaines ne déclenche aucun indicateur (les fenêtres de 120 minutes et 60 minutes
ne couvrent pas cette temporalité). Pourtant, il aura multiplié son exposition sur
une thèse qui se dégrade.

**La conviction comme déni.**
Un opérateur qui tient une position perdante depuis 4 semaines "par conviction" peut
sembler parfaitement discipliné vu de l'extérieur de l'historique de trades. Il n'a
pas trader de façon anormale — il a juste refusé de sortir. Aucun indicateur ne
capte ce type de dérive silencieuse.

**Le "boredom trade" isolé.**
Un seul boredom trade dans un historique Swing sera statistiquement invisible —
trop peu fréquent pour déclencher un pattern. Mais répété sur plusieurs périodes,
il révèle une incapacité à tolérer l'inactivité qui peut précéder une dérive plus grave.

## 6. Relation aux régimes de marché

**Range :** période d'inconfort pour le Swing. Les setups sont ambigus, les tendances
ne se forment pas. L'opérateur Swing doit accepter l'inactivité ou adapter temporairement
son style. Le risque est de forcer des setups qui n'existent pas.

**Expansion :** environnement naturel du Swing. Les tendances forment des structures
claires, les entrées sont visibles, la durée de détention est récompensée. L'opérateur
Swing est en phase avec le marché.

**Compression :** période de patience. L'opérateur Swing attend la résolution de la
compression (breakout ou retour en range). Son inactivité est intentionnelle.

**Volatilité forte :** les stops sont souvent déclenchés. L'opérateur Swing doit
gérer la frustration des sorties prématurées sans surréagir. Le risque est l'élargissement
progressif des stops pour "tenir" les positions.

**Euphorie :** les objectifs de prix sont dépassés rapidement. L'opérateur doit
décider s'il sort ou laisse courir. Le risque est de transformer une position Swing
gagnante en une position qu'il ne sait plus comment gérer.

**Capitulation :** les setups d'achat deviennent très attractifs en termes de prix.
Le risque est d'entrer trop tôt (attraper le couteau) et de voir la position s'aggraver
avant la stabilisation.

## 7. Garde-fous universels

- **L'averaging down reste toujours problématique, même si la temporalité est lente.**
  Un opérateur Swing qui ajoute à une position perdante toutes les semaines pratique
  du loss chasing "lent" — qui est en dehors des fenêtres de détection actuelles.
  La doctrine dit : la thèse initiale doit être réévaluée à chaque ajout.

- **La détention longue ne blanchit pas l'entêtement.**
  "Je tiens parce que j'y crois" et "je tiens parce que je refuse d'accepter la perte"
  ont la même apparence. La distinction nécessite l'évaluation de la cohérence entre
  la thèse initiale et les développements de marché — pas uniquement la durée.

- **Le boredom trade isolé doit être reconnu comme une rupture de style.**
  Même ponctuel, un trade hors des critères habituels révèle une incapacité à tenir
  la discipline du style. Répété, c'est un signal d'évolution de profil à surveiller.

## 8. Risque de sur-ajustement

**Risque principal : interpréter toute longue détention comme de la discipline.**

Si le moteur apprend que l'opérateur est en profil Swing et décide de ne jamais
signaler les longues détentions comme problématiques, il perd la capacité de distinguer
la patience disciplinée de l'entêtement pathologique.

**Risque secondaire : accepter toute inactivité comme normale.**

L'inactivité est saine chez le Swing dans les conditions appropriées. Mais une inactivité
totale prolongée peut aussi décrire un opérateur paralysé, trop éloigné du marché pour
maintenir une lecture opérationnelle, ou qui évite consciemment de prendre des positions
pour ne pas risquer de pertes.

## 9. Relation au cockpit

**Ce que le CSV Binance peut observer :**
- La fréquence réelle par période (cohérence avec le style déclaré)
- La durée de détention effective
- La présence ou l'absence de boredom trades (patterns isolés incohérents)
- L'évolution des tailles (signal d'averaging down progressif)

**Ce que seule une session cockpit peut révéler :**
- La thèse de la position actuelle est-elle toujours valide ?
- La patience est-elle stratégique ou masque-t-elle une hésitation ?
- La posture déclarée (BALANCED vs ACTIVE) reflète-t-elle l'état réel de l'opérateur ?
- L'opérateur sent-il "qu'il doit agir" alors qu'il n'y a pas de setup qualifié ?

## 10. Phrase Caméléon Engine

> Ton rythme d'activité est cohérent avec un régime d'engagement sélectif. Vérifie
> que chaque position active repose sur une thèse que le marché n'a pas encore
> invalidée.

---

# Profil 3 — Momentum / Expansion

## 1. Description opératoire

L'opérateur Momentum/Expansion suit les mouvements directionnels forts. Sa logique
dominante est la participation : entrer sur un marché qui montre une force ou une
faiblesse claire, accompagner le mouvement, et sortir lorsque la dynamique s'épuise.

Ce régime opératoire est réactif par nature, non prévisionnel. L'opérateur Momentum
ne prédit pas que le marché montera — il observe que le marché monte et décide de
participer. L'entrée vient après la confirmation, pas avant.

Le rapport au marché est dynamique et directionnel : l'opérateur Momentum travaille
dans le sens du mouvement. Il n'achète pas les points bas — il achète la force.
Il ne vend pas les sommets — il vend la faiblesse.

Le rapport au timing est rapide sur l'entrée (il faut agir quand la dynamique est là)
et discipliné sur la sortie (reconnaître quand la dynamique s'arrête).

Le rapport à la fréquence est variable : élevé pendant les phases d'expansion marquée,
très bas pendant les phases de range ou de compression.

## 2. Activité saine typique

**Fréquence :** variable selon le régime de marché. Élevée en expansion, faible en range.
L'opérateur Momentum accepte les périodes d'inactivité forcée quand le marché n'offre
pas de dynamiques claires.

**Durée de détention :** variable. Peut être courte (momentum intraday sur un push)
ou longue (tendance multi-semaines accompagnée jusqu'à l'épuisement). La durée est
déterminée par la dynamique, pas par un horizon prédéfini.

**Re-entry :** possible et rationnelle après un pullback dans la tendance. L'opérateur
Momentum peut sortir sur un pullback, observer, et ré-entrer sur la reprise du momentum.

**Pyramiding :** caractéristique saine du profil. Renforcer une position gagnante
à mesure que la tendance se confirme produit des tailles croissantes — signature qui
peut être confondue avec du loss chasing.

**Rotation :** active. L'opérateur Momentum peut changer d'actif pour suivre le
momentum là où il se trouve. Cette rotation est une lecture du marché, pas de l'agitation.

**Concentration :** sélective. L'opérateur Momentum se concentre sur les actifs
qui montrent la dynamique la plus claire. Il évite les actifs sans mouvement.

**Pacing :** dicté par la vélocité du marché. Un marché qui accélère appelle une
réponse rapide ; un marché qui ralentit appelle une sortie et l'attente du prochain cycle.

## 3. Activité malsaine typique

**Le FOMO — entrer après l'exhaustion du mouvement.**
L'opérateur entre sur un actif qui a déjà effectué l'essentiel de son mouvement,
attiré par l'ampleur du déplacement affiché. Il entre alors que le momentum réel
commence à s'épuiser. Il ne suit pas la dynamique — il la chasse.

**Le refus de sortie sur retournement de momentum.**
La conviction que le mouvement va reprendre conduit à tenir une position alors que
les signaux de retournement sont clairs. L'opérateur confond la permanence de la thèse
directionnelle avec la persistance de la dynamique. Ces deux choses peuvent diverger.

**La multiplication des positions sans sélectivité.**
L'opérateur en mode FOMO géographique prend des positions sur plusieurs actifs
simultanément, espérant que l'un d'eux continuera le mouvement. Il perd la sélectivité
caractéristique du style et accumule des positions dont il ne peut pas gérer
la complexité en temps réel.

**Le momentum appliqué au mauvais régime.**
L'opérateur applique ses critères d'entrée momentum à un marché en range ou en
compression. Les signaux de force qu'il observe sont des rebonds de range, pas des
initiations de tendance. Le comportement semble identique ; le contexte rend le risque
radicalement différent.

## 4. Faux positifs typiques des indicateurs

**Loss chasing (pour le pyramiding) :** c'est le faux positif le plus grave pour ce profil.
Un opérateur qui renforce sa position sur un actif en hausse (BUY 100$ → BUY 150$ →
BUY 200$) produit exactement la signature du loss chasing détectée par le moteur.
Pourtant, le pyramiding dans la bonne direction est l'une des pratiques les plus
recommandées en trading momentum. L'indicateur ne peut pas distinguer les deux sans
la comparaison de la direction des prix.

**Rapid reentry (sur pullback dans la tendance) :** l'opérateur sort sur un pullback
(SELL), attend la stabilisation (30–40 min), et ré-entre sur la reprise. C'est une
gestion rigoureuse du point d'entrée dans la tendance — pas une réentrée impulsive.

**Overtrading (en expansion forte) :** pendant un push impulsif fort, plusieurs niveaux
de prix distincts peuvent se présenter en moins d'une heure. L'opérateur momentum
peut prendre plusieurs entrées légitimes sur différents niveaux du même actif.

## 5. Faux négatifs typiques

**Le FOMO détectable uniquement via la chronologie du prix.**
Un opérateur qui entre systématiquement après les sommets de mouvement (quand le
momentum a déjà commencé à s'épuiser) pratique un faux momentum. Ce comportement
est invisible dans les indicateurs de fréquence ou de taille — il nécessiterait
une comparaison entre le prix d'entrée et le point d'exhaustion du mouvement.

**La multiplication des positions simultanées.**
Si l'opérateur prend 4 positions sur 4 actifs différents en 30 minutes (rotation rapide),
aucun indicateur par symbole ne détecte la densité globale de l'engagement.

**Le momentum appliqué en range (faux départ).**
L'opérateur entre sur un signal de breakout qui échoue et produit un simple rebond.
Il sort rapidement (stop), réentre sur le prochain "signal". Ce comportement peut
produire plusieurs rapid reentry ou revenge trading sans que le problème réel
(application d'un style momentum dans un marché sans momentum) soit capturé.

## 6. Relation aux régimes de marché

**Expansion forte :** environnement naturel. L'opérateur est en phase avec le marché.
L'activité est justifiée, le pyramiding est légitime, la durée de détention est
récompensée.

**Range :** régime hostile. L'opérateur doit accepter de ne pas trader. Le risque
de FOMO ou d'application des critères momentum à des signaux range est maximal.

**Compression :** attente. La compression précède souvent un mouvement fort — l'opérateur
Momentum est en veille, prêt à réagir. L'inactivité est stratégique.

**Volatilité extrême :** régime ambivalent. Les mouvements sont forts mais erratiques.
Les faux signaux de momentum sont fréquents. L'opérateur peut soit capturer des mouvements
exceptionnels soit accumuler une série de stops rapides.

**Euphorie :** zone de risque élevé. Les signaux de momentum existent mais peuvent
conduire à entrer tardivement sur des mouvements d'épuisement. La discipline de sortie
est particulièrement critique.

**Capitulation :** zone de signal fort en sens inverse. L'opérateur Momentum peut
trouver des dynamiques baissières claires. Mais les rebonds techniques sont fréquents
et peuvent piéger les entrées short prématurées.

## 7. Garde-fous universels

- **L'entrée après l'exhaustion d'un mouvement reste un signal quel que soit le style.**
  Même un momentum trader discipliné peut être tenté par un mouvement déjà avancé.
  Le cockpit peut révéler cette tentation via la posture déclarée.

- **La taille croissante sur un marché baissier reste du loss chasing.**
  Le pyramiding est légitime en direction de la tendance. Renforcer une position
  perdante parce que "la tendance va reprendre" est du averaging down — pas du pyramiding.

- **La multiplication des positions simultanées sans sélectivité reste une alerte.**
  Même si chaque position individuelle semble justifiée, la gestion d'un portefeuille
  de 6 positions momentum simultanées dépasse la capacité cognitive et de gestion
  du risque de la plupart des opérateurs.

## 8. Risque de sur-ajustement

**Risque principal : accepter toute escalade de taille comme "pyramiding".**

Si le moteur apprend que l'opérateur est en profil Momentum et décide de tolérer
les séquences de tailles croissantes comme légitimes, il perd la capacité de détecter
un averaging down déguisé en pyramiding. La distinction nécessite la direction du prix —
information qui n'est pas encore utilisée dans l'implémentation actuelle.

**Protection conceptuelle :** tant que la direction du prix n'est pas prise en compte
dans la détection du loss chasing, aucune tolérance au pyramiding ne peut être
accordée sans risque de complicité dans un averaging down.

## 9. Relation au cockpit

**Ce que le CSV Binance peut observer :**
- La corrélation entre les phases d'activité et les régimes de marché (via les dates)
- La cohérence des tailles dans les séquences de renforcement
- La fréquence des entrées après les mouvements vs pendant les mouvements
- La symétrie des positions (le Momentum entre et sort, il n'accumule pas indéfiniment)

**Ce que seule une session cockpit peut révéler :**
- L'opérateur identifie-t-il un momentum réel ou ressent-il de la pression à "ne pas rater" ?
- Sa posture (ACTIVE) est-elle cohérente avec un momentum clair ou avec une agitation ?
- Le need_action déclaré traduit-il une opportunité réelle ou une urgence émotionnelle ?

## 10. Phrase Caméléon Engine

> Ton engagement est orienté dans le sens du mouvement actuel. Vérifie que la
> dynamique que tu suis est encore active et que ton exposition correspond
> à la phase du mouvement, pas à son souvenir.

---

# Profil 4 — Défensif / Conservation

## 1. Description opératoire

L'opérateur Défensif/Conservation place la protection du capital au sommet de sa
hiérarchie de priorités. Sa logique dominante est l'asymétrie : il n'entre que lorsque
les conditions lui paraissent offrir un rapport risque/rendement clairement favorable,
et il sort dès que l'incertitude dépasse son seuil de tolérance.

Ce régime opératoire est caractérisé par une exigence élevée avant l'engagement.
L'opérateur Défensif peut passer de longues périodes entièrement en dehors du marché
ou avec des positions minimales. Cette inactivité est une décision active de non-
engagement, pas un manque d'attention.

Le rapport au marché est prudent et asymétrique : l'opérateur Défensif cherche des
situations où le downside est clairement limité avant de s'exposer à l'upside.
Il préfère rater des opportunités plutôt que de prendre des risques non maîtrisés.

Le rapport au timing est lent et conditionnel : l'entrée requiert de multiples
confirmations. La sortie est rapide dès que le niveau d'incertitude augmente.

Le rapport à la fréquence est très faible : peu de trades, sélectionnés avec rigueur.

## 2. Activité saine typique

**Fréquence :** très faible. Des semaines sans trades sont normales et souhaitables.
L'activité se concentre sur les fenêtres où les conditions sont clairement favorables.

**Durée de détention :** variable mais jamais forcée. L'opérateur Défensif sort
dès que sa thèse de protection est compromise, même si la durée de détention est courte.

**Re-entry :** rare et très conditionnelle. Après une sortie, le Défensif réobserve
longtemps avant de réengager.

**Taille :** petite à modérée. L'opérateur Défensif préfère des tailles qui permettent
de "survivre" à une erreur plutôt que des tailles qui maximisent le gain sur une bonne lecture.

**Concentration :** limitée. Peu de positions simultanées pour maintenir la clarté
décisionnelle et limiter l'exposition globale.

**Stop discipline :** stricte. L'opérateur Défensif ne déplace pas ses stops.
Sortir vite sur une erreur est une caractéristique fondamentale du style.

**Pacing :** extrêmement lent. L'opérateur Défensif ne ressent pas de pression à agir.
L'absence de position est considérée comme une position à part entière.

## 3. Activité malsaine typique

**La paralysie — exigence de certitude impossible.**
L'opérateur devient incapable d'entrer sur un marché parce qu'aucun setup n'est
jamais "assez clair". Son niveau d'exigence dépasse ce que le marché peut offrir.
Il ne trade plus — pas par discipline, mais par incapacité à tolérer l'incertitude
inhérente au trading. La paralysie protège le capital à court terme mais érode
progressivement la compétence opératoire.

**Le "grand pari" unique.**
Après une longue période de conservation, l'opérateur peut concentrer une exposition
disproportionnée sur un setup qui lui semble "évident". Ce pari unique compense
psychologiquement l'inactivité prolongée. Il viole profondément le principe de
protection du capital qu'il défend par ailleurs.

**L'accumulation de petites pertes systématiques.**
L'opérateur Défensif peut entrer avec des petites positions et sortir rapidement
(stop strict). Si ce cycle se répète souvent (beaucoup de petits stops), la somme
des petites pertes peut éroder significativement le capital. L'attention au drawdown
cumulatif est moins visible que le drawdown par position individuelle.

**La dérive vers la conservation permanente.**
La peur de perdre peut conduire à une aversion au risque si forte que l'opérateur
cesse de capitaliser sur les opportunités réelles. La conservation n'est plus un
choix stratégique — elle devient une posture défensive permanente décorrélée
de l'état réel du marché.

## 4. Faux positifs typiques des indicateurs

**Size inconsistency (sur le grand pari unique) :** si l'opérateur Défensif place
majoritairement de petites positions puis engage une position significativement plus
grande sur un setup "évident", le CV sera élevé. Mais cet écart peut être la dérive
pathologique elle-même (le grand pari unique) plutôt qu'un faux positif.

**Rapid reentry (sur correction de stop) :** l'opérateur est stoppé rapidement sur
un niveau (sa rigueur du stop strict), observe que c'était un faux signal, et réentre.
Ce comportement discipliné déclenche le signal de rapid reentry.

## 5. Faux négatifs typiques

**Le grand pari unique.**
L'opérateur fait une seule grande position sur un historique majoritairement défensif.
Cette position est suffisamment isolée pour ne pas déclencher de size_inconsistency
sur un historique long. Pourtant, elle représente le comportement le plus problématique
du profil.

**L'accumulation invisible de petits stops.**
Des dizaines de petites positions stoppées rapidement produisent des stops très courts
(rapid reentry si l'opérateur essaie à nouveau) et une perte cumulée significative.
Chaque trade individuel peut sembler discipliné ; la série révèle un problème.

**La paralysie.**
L'opérateur qui ne trade jamais ne génère aucun signal comportemental depuis ses
historiques. La paralysie est invisible dans les données — elle n'est visible que
dans l'absence de données.

## 6. Relation aux régimes de marché

**Range :** régime confortable. L'opérateur Défensif apprécie la prévisibilité
du range. Il peut y trouver des setups à asymétrie claire (achat bas de range,
stop sous la bande).

**Expansion forte :** régime inconfortable. Les mouvements forts peuvent sembler
risqués pour le Défensif. Il peut rater des tendances claires par excès de prudence.

**Compression :** régime naturel. L'opérateur Défensif attend la résolution de la
compression en dehors du marché. Pas de pression à agir.

**Volatilité extrême :** l'opérateur Défensif sort ou ne rentre pas. C'est une
décision cohérente avec le style. La tentation de "trouver l'opportunité dans le chaos"
est une dérive contraire au style.

**Euphorie :** zone d'inconfort. Le Défensif observe des mouvements massifs sans y
participer (ou avec une exposition minimale). La pression psychologique de ne pas
"profiter" de l'euphorie est réelle et peut conduire au grand pari unique.

**Capitulation :** zone d'opportunité pour le Défensif. Les prix bas avec une
asymétrie claire peuvent justifier un engagement. Mais "attraper le couteau" est
exactement ce que le Défensif doit éviter — la patience supplémentaire après la
capitulation est de la discipline, pas de la paralysie.

## 7. Garde-fous universels

- **Le grand pari unique reste toujours un signal fort, même pour un Défensif.**
  Une taille disproportionnée après une longue période de positions minimales révèle
  une rupture du style de conservation — pas une décision de conviction disciplinée.

- **L'inactivité chronique mérite surveillance.**
  Une inactivité totale prolongée dans un marché avec des opportunités claires peut
  signaler une paralysie qui n'est pas de la discipline. Le cockpit peut révéler
  si cette inactivité est choisie ou subie.

- **Le stop déplacé reste une violation grave quel que soit le style.**
  L'opérateur Défensif qui commence à déplacer ses stops (pour éviter d'être stoppé)
  trahit la logique fondamentale de son style. Il n'est plus défensif — il est
  en déni de perte.

## 8. Risque de sur-ajustement

**Risque principal : valider toute inactivité comme discipline.**

Si le moteur apprend que l'opérateur est en profil Défensif et décide que son
inactivité est toujours un signe de rigueur, il ne peut pas détecter la paralysie
pathologique. L'inactivité disciplinée et la paralysie ont la même trace externe.

**Protection conceptuelle :** l'inactivité du Défensif doit être évaluée en relation
avec les conditions de marché. Une inactivité pendant une phase de haute incertitude
est cohérente ; une inactivité pendant une phase de setups clairs mérite une observation.

## 9. Relation au cockpit

**Ce que le CSV Binance peut observer :**
- La fréquence réelle (très faible = cohérent avec le style)
- La discipline des stops (sorties rapides = signal positif pour ce profil)
- La présence ou l'absence d'un grand pari isolé
- L'évolution des tailles dans le temps

**Ce que seule une session cockpit peut révéler :**
- L'opérateur ressent-il une pression à "faire quelque chose" malgré l'absence de setup ?
- Sa posture déclarée est-elle cohérente avec une approche défensive réelle ?
- La sélectivité est-elle stratégique ou reflète-t-elle une aversion à la perte ?

## 10. Phrase Caméléon Engine

> Ton niveau d'engagement est faible et cohérent avec une approche sélective.
> Vérifie que cette sélectivité découle de l'analyse des conditions actuelles
> et non d'une réticence générale au risque.

---

# Profil 5 — Opportuniste / Rotation

## 1. Description opératoire

L'opérateur Opportuniste/Rotation ne s'attache pas à un style fixe. Sa logique
dominante est l'adaptation : il lit le régime de marché courant et ajuste son
comportement opératoire en conséquence. Il peut être en mode Range sur un actif,
en mode Momentum sur un autre, et en mode Défensif sur un troisième au cours de
la même période.

Ce régime opératoire est le plus complexe à lire pour le moteur, précisément parce
qu'il n'a pas de signature comportementale fixe. Sa cohérence n'est pas dans la
répétition d'un pattern — elle est dans la pertinence de l'adaptation au contexte.

Le rapport au marché est holistique et contextuel : l'opérateur Opportuniste lit
l'état global du marché avant de décider de son mode d'opération. Il cherche à être
"dans le bon régime" plutôt que "dans le bon trade".

Le rapport au timing est variable par définition. Il peut être rapide en Momentum,
lent en Swing, dense en Range, selon la période.

Le rapport à la fréquence est le plus variable des cinq profils — il est entièrement
dicté par les opportunités et les régimes perçus.

## 2. Activité saine typique

**Fréquence :** très variable. Élevée pendant les phases d'opportunité multi-actifs,
faible pendant les phases de compression ou d'incertitude.

**Durée de détention :** variable selon l'opportunité. Positions courtes sur momentum,
longues sur swing, récurrentes sur range.

**Re-entry :** contextuelle. Rapide si le régime le justifie (momentum), lente si
le régime le demande (swing).

**Rotation :** active et intentionnelle. L'opérateur Opportuniste se déplace entre
les actifs et les styles en fonction des opportunités. Ce déplacement est une lecture,
pas de l'agitation.

**Concentration :** variable. Concentré sur quelques actifs clairs, dispersé sur
plusieurs opportunités simultanées selon le contexte.

**Adaptation explicite :** l'opérateur Opportuniste doit être capable d'articuler
pourquoi il est dans quel régime à quel moment. Une rotation sans raison articulable
n'est pas de l'adaptation — c'est du noise.

## 3. Activité malsaine typique

**La rotation comme mécanisme d'évitement.**
L'opérateur quitte un actif après une perte et entre immédiatement sur un autre —
non pas parce qu'une opportunité existe sur le nouvel actif, mais pour "se rattraper"
ailleurs. La rotation n'est plus une lecture du marché — c'est une fuite de la
responsabilité de la perte.

**L'"opportunisme" comme absence de cadre.**
L'opérateur dit qu'il "saisit les opportunités" mais en réalité n'a pas de critères
d'entrée stables. Il réagit à tout ce qui bouge. Ce comportement produit une activité
élevée, un sizing incohérent, et des pertes distribuées sur de nombreux actifs sans
logique d'ensemble.

**La confusion de régime.**
L'opérateur applique des critères Momentum à un marché en Range, des critères Défensifs
à un marché en Expansion, des critères Range à un marché en capitulation. Il change
de style sans lire le changement de régime — son adaptation est décalée, pas pertinente.

**L'hyper-rotation compulsive.**
L'opérateur change d'actif à une fréquence excessive, sans laisser le temps aux
positions de se développer. Cette rotation reflète une intolérance à l'attente,
pas une lecture d'opportunité. Elle produit des frais élevés, une dispersion cognitive,
et une incapacité à capitaliser sur les vrais mouvements.

## 4. Faux positifs typiques des indicateurs

**Size inconsistency (systématique) :** l'opérateur Opportuniste a des allocations
radicalement différentes selon les actifs et les styles. Son CV global sera
structurellement très élevé — ce n'est pas un défaut de gestion du risque, c'est
la conséquence mécanique d'une adaptation contextuelle.

**Overtrading (pendant les phases multi-actifs) :** plusieurs actifs peuvent être
touchés rapidement pendant une phase d'opportunité multi-directionnelle. Le filtre
par symbole limite les faux positifs, mais la densité globale de l'activité peut rester
élevée.

**Rapid reentry inter-actifs (invisible mais réel) :** l'opérateur sort d'un actif
et entre immédiatement sur un autre. La contrainte "même symbole" de l'indicateur
rend cette rotation invisible — mais elle peut être soit saine (lecture d'une
nouvelle opportunité) soit pathologique (évitement via rotation).

## 5. Faux négatifs typiques

**La rotation comme évitement de perte.**
L'opérateur sort d'un actif perdant et entre sur un autre — comportement invisible
pour tous les indicateurs qui opèrent par symbole. Pourtant, ce pattern de
"déménagement de la perte" est l'une des dérives les plus caractéristiques du
profil Opportuniste pathologique.

**L'absence de cadre masquée par la variabilité.**
Un opérateur sans critères stables mais avec une activité modérée peut ne déclencher
aucun indicateur. Sa variabilité semble être de l'adaptation — en réalité, il ne
fait que réagir au dernier signal sans structure sous-jacente.

**La diversification comme excuse à l'exposure totale.**
L'opérateur Opportuniste peut avoir 8 positions simultanées de taille modérée,
chacune en dessous des seuils de signalement. Mais leur somme représente une
exposition totale significative qui n'est pas capturée par les indicateurs par symbole.

## 6. Relation aux régimes de marché

**Range :** l'Opportuniste peut trouver des sous-marchés en range pendant que d'autres
actifs sont en tendance. Sa lecture contextuelle est un avantage si elle est réelle.

**Expansion :** zone naturelle d'opportunité. Plusieurs actifs en expansion simultanée
offrent des setups multiples. Le risque est la dispersion excessive.

**Compression :** régime difficile. L'Opportuniste peut chercher à créer des
opportunités là où il n'y en a pas, par intolérance à l'inactivité.

**Volatilité forte :** zone à deux visages. Beaucoup de signaux (risque de sur-réaction),
mais aussi de vraies opportunités pour un opérateur qui lit bien les régimes.

**Euphorie :** zone de risque élevé. La multiplicité des "opportunités" apparent est
maximale en euphorie. L'Opportuniste peut disperser son capital sur de nombreuses
positions FOMO simultanées.

**Capitulation :** zone de lecture difficile. L'opérateur doit distinguer les
opportunités réelles (actifs structurellement solides en solde temporaire) des
pièges de rebond.

## 7. Garde-fous universels

- **La rotation après perte reste toujours un signal potentiel.**
  Même si l'opérateur a de bonnes raisons pour la rotation, la co-occurrence
  systématique sortie-sous-pression / nouvelle-entrée-rapide est un pattern à surveiller.

- **L'exposition totale cumulée reste un signal.**
  La dispersion entre actifs ne dilue pas le risque total — elle peut l'amplifier.
  Un opérateur avec 10 petites positions est exposé à la somme des risques de ces 10 positions.

- **L'absence de cadre articulable reste toujours une alerte.**
  Un opérateur Opportuniste sain peut toujours expliquer pourquoi il est sur cet actif
  dans ce style à ce moment. Un opérateur Opportuniste pathologique ne peut pas
  articuler sa logique — il réagit, il ne lit pas.

## 8. Risque de sur-ajustement

**Risque principal : accepter toute rotation comme une lecture légitime.**

Si le moteur apprend que l'opérateur est "adaptatif par style" et décide de ne jamais
signaler les rotations comme problématiques, il perd la capacité de détecter la rotation
comme mécanisme d'évitement. Ces deux rotations (stratégique vs symptomatique) sont
indiscernables depuis les données de trades seules.

**Risque secondaire : normaliser la variabilité totale du profil.**

Si la variabilité de fréquence, de taille et de durée est normalisée pour l'Opportuniste,
le moteur ne peut plus détecter une dérive vers le chaos opératoire. "Il fait toujours
plein de choses différentes" devient une excuse pour ne rien signaler.

**Protection conceptuelle :** la clé du profil Opportuniste est la cohérence entre
les choix et le contexte de marché — pas la cohérence des choix entre eux. Le moteur
doit évaluer si l'activité est explicable par les régimes de marché de la période,
pas si elle ressemble à la semaine précédente.

## 9. Relation au cockpit

**Ce que le CSV Binance peut observer :**
- La corrélation entre les phases d'activité et les régimes de marché (visible avec les dates)
- La cohérence des transitions (sortie d'un actif → entrée sur un autre avec logique apparente)
- La distribution des profils comportementaux selon les périodes
- L'exposition totale cumulée (somme des positions simultanées)

**Ce que seule une session cockpit peut révéler :**
- L'opérateur peut-il articuler le régime opératoire qu'il croit être en train de suivre ?
- Sa posture déclarée est-elle cohérente avec l'activité observée sur le cockpit ?
- Y a-t-il une pression à agir sur plusieurs actifs simultanément, ou une lecture claire ?
- La rotation qu'il envisage est-elle déclenchée par une opportunité ou par un inconfort ?

## 10. Phrase Caméléon Engine

> Ton activité est diverse et contextuelle. Vérifie que chaque engagement repose
> sur une lecture de régime articulable et que ton exposition totale reste dans
> les limites de ta gestion du risque.

---

## Synthèse des profils

### Tableau de classification croisée

| Profil | Fréquence typique | Durée détention | Indicateur le plus trompeur | Garde-fou principal |
|---|---|---|---|---|
| Range / Grid | Très élevée | Courte | Overtrading (faux positif) | Extension de bande sous pression |
| Swing / Patience | Très faible | Longue | Size inconsistency (conviction) | Averaging down lent invisible |
| Momentum / Expansion | Variable | Variable | Loss chasing (vs pyramiding) | Taille croissante sens inverse |
| Défensif / Conservation | Très faible | Variable | Rapid reentry (sur stop corrigé) | Grand pari unique |
| Opportuniste / Rotation | Très variable | Très variable | Size inconsistency (allocation) | Rotation comme évitement |

### Ce que les profils ne résolvent pas

Les profils Constellium fournissent une grille de lecture contextuelle. Ils ne résolvent
pas les limitations structurelles documentées dans l'audit des indicateurs. En particulier :

**PS-02 (loss chasing vs pyramiding) :** la distinction entre pyramiding légitime
(profil Momentum) et loss chasing reste impossible sans comparaison des prix d'achat.
La classification du profil Momentum ne peut pas seule excuser les séquences de tailles
croissantes.

**PS-03 (P&L non observable) :** le revenge trading reste difficile à distinguer
d'une re-entry légitime quel que soit le profil, faute d'accès au P&L.

**PS-01 (CV global) :** le profil Opportuniste/Rotation confirme que le CV global
multi-actifs est un faux positif structurel pour plusieurs profils. La correction
vers le CV par symbole reste une priorité architecturale, indépendante des profils.

### Ce que les profils apportent

**Une grille de lecture contextuelle des indicateurs.**
Le même comportement (SELL → BUY rapide avec taille augmentée) est lu différemment
selon qu'il s'inscrit dans un cycle Range (faux positif probable) ou dans un contexte
Swing (signal à investiguer).

**Une classification des garde-fous selon leur universalité.**
Certains garde-fous s'appliquent à tous les profils (loss chasing répété, averaging down
sous pression). D'autres sont spécifiques (extension de bande pour le Range, grand pari
unique pour le Défensif).

**Une base pour la future calibration adaptative.**
Les profils définissent les contextes dans lesquels les seuils peuvent être recontextualisés
sans être supprimés. Ils ne permettent jamais de supprimer un signal — ils permettent
de l'interpréter avec plus de précision.

**Une protection contre la complaisance systématique.**
En nommant explicitement les dérives typiques de chaque profil, le document évite que
la reconnaissance d'un style devienne une immunité contre les alertes. Le moteur
comprend le style sans y être complaisant.

---

## Questions ouvertes pour la suite du chantier

Ces questions découlent des profils et prépareront les prochains documents :

**Q6.** Comment le moteur peut-il détecter qu'un opérateur est en transition de régime ?
(Ex. : un Range qui glisse vers le directionnel, un Swing qui développe des boredom trades)

**Q7.** La détection du profil courant doit-elle être statique (basée sur l'historique
total) ou dynamique (basée sur une fenêtre glissante récente) ? Ces deux lectures
peuvent diverger et donner des informations différentes.

**Q8.** Comment traiter les opérateurs qui ont un profil hybride stable (ex. : Range
sur un actif, Swing sur un autre, en permanence) ? Ce n'est pas une transition de régime
— c'est un profil multi-mode structurel.

**Q9.** La distinction entre "comportement fréquent" et "comportement sain" nécessite
un référentiel de cohérence. Quel est ce référentiel ? La thèse déclarée par l'opérateur
(nécessite un cockpit) ? La cohérence avec le régime de marché (nécessite les dates) ?
La cohérence interne de l'historique (nécessite une fenêtre suffisante) ?

**Q10.** Un profil Opportuniste/Rotation peut-il être officiellement reconnu comme
tel, ou est-il toujours préférable de décomposer son comportement en régimes distincts ?
La flexibilité du profil est-elle une lecture ou une absence de lecture ?

---

## Statut

**Type** : Document fondateur · Chantier Constellium
**Code modifié** : zéro
**Flags modifiés** : zéro
**Seuils modifiés** : zéro
**Implémentation** : aucune

Les profils Constellium sont des régimes opératoires, pas des labels.
Ils permettent de relire les comportements avec précision.
Ils ne blanchissent jamais les dérives.

---

*Profils opérateurs Constellium — Version 1.0 — 2026-05-25*
*Définition opérationnelle V1 du Constellium (étoiles, liens, UX) : `constellium_v1_definition.md`*
