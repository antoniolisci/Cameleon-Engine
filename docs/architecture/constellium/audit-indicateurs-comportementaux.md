# Audit des indicateurs comportementaux — Caméléon Engine

## Métadonnées

**Statut** : Document fondateur · Chantier Constellium · Aucune implémentation
**Version** : 1.0 — 2026-05-25
**Périmètre** : 5 patterns existants — `patterns.js` + `scoring.js`
**Objet** : Audit architectural des indicateurs comportementaux actuels —
limites structurelles, hypothèses implicites, dépendances au style et au régime
**Ce document ne produit pas** : seuils · calibrations · profils complets · code

**Phrase fondatrice :**
> La calibration adapte l'interprétation. Elle ne blanchit jamais les dérives.

---

## Préambule — pourquoi cet audit

Les cinq patterns comportementaux actuels ont été construits dans une logique de
détection générique : identifier des traces qui, dans une population de traders
indifférenciée, signalent statistiquement un comportement problématique.

Cette logique est correcte comme point de départ. Elle devient insuffisante dès que
l'on considère que les opérateurs ont des styles structurellement différents, que les
marchés traversent des régimes distincts, et que le moteur doit rester pertinent
dans les deux cas.

Cet audit ne cherche pas à démontrer que les indicateurs sont mauvais. Il cherche à
cartographier précisément ce qu'ils mesurent réellement, ce qu'ils supposent
implicitement, et dans quels contextes ils peuvent tromper. Cette cartographie est le
prérequis à toute architecture adaptative cohérente.

**Structure commune à chaque indicateur :**

1. Fonction réelle
2. Hypothèse implicite
3. Validité contextuelle
4. Faux positifs possibles
5. Faux négatifs possibles
6. Dépendance au style opérateur
7. Dépendance au régime de marché
8. Calibrabilité
9. Garde-fous universels
10. Risque de sur-ajustement

---

## Note sur les seuils actuels

Les valeurs ci-dessous sont les seuils réels de l'implémentation, relevés depuis
`patterns.js` et `scoring.js`. Ils sont cités pour ancrer l'audit dans la réalité
du code — pas pour être modifiés.

| Pattern | Seuil principal | Fenêtre | Poids scoring |
|---|---|---|---|
| overtrading | ≥ 5 trades / symbole | 60 min | 15 |
| revenge_trading | < 30 min SELL→BUY + taille > 1.5× moy | — | 20 |
| rapid_reentry | BUY→SELL < 20 min → BUY < 45 min | — | 15 |
| size_inconsistency | CV global > 0.5 | — | 20 |
| loss_chasing | 3 BUYs croissants + 3e > 1.8× 1er | 120 min | 25 |

---

# Indicateur 1 — Overtrading

## 1. Fonction réelle

L'overtrading cherche à détecter une densité d'activité anormalement élevée sur un
même actif dans un temps court. L'hypothèse opératoire est que, au-delà d'un certain
seuil de fréquence, les trades cessent d'être produits par des analyses distinctes
et commencent à être produits par une urgence psychologique — impatience, refus
d'accepter un mouvement manqué, besoin de "faire quelque chose".

Dans la logique comportementale du moteur, l'overtrading est le signal d'une rupture
entre la cadence de marché et la cadence décisionnelle de l'opérateur. Le marché
n'a pas produit cinq opportunités distinctes en une heure sur le même actif —
l'opérateur en a construit cinq à partir d'une seule ou d'aucune.

L'indicateur joue un rôle de détection précoce dans la chaîne comportementale :
il peut apparaître seul, avant que d'autres patterns plus graves (revenge, loss chasing)
ne se manifestent. Une activité dense et cohérente peut être saine. Une activité dense
et accompagnée d'autres signaux d'agitation (rapid_reentry, tailles incohérentes) devient
le marqueur d'un état psychologique instable.

Le moteur a déjà intégré cette distinction : l'overtrading isolé est traité différemment
de l'overtrading combiné à d'autres patterns. C'est une décision architecturale juste.

## 2. Hypothèse implicite

L'indicateur suppose qu'un opérateur "normal" ne trade pas 5 fois ou plus sur le même
actif dans une fenêtre d'une heure. Cette norme invisible encode un style implicite :
swing trader ou position trader, travaillant sur des horizons de plusieurs heures à
plusieurs jours, prenant une à trois décisions distinctes par session.

Ce profil implicite n'est pas universel. Il exclut structurellement :

- Le range trader actif, qui entre et sort plusieurs fois sur le même actif au cours
  d'une journée de range dense, avec une logique de bande de prix définie
- Le scalper, qui opère sur des dizaines de transactions par heure avec des règles
  d'entrée/sortie strictes
- Le trader sur grille, dont la stratégie produit mécaniquement plusieurs ordres
  simultanés ou successifs sur le même actif

L'hypothèse implicite est également temporelle : une fenêtre de 60 minutes suppose que
l'unité de temps pertinente d'une décision est l'heure. Sur des actifs très volatils
(TAOUSDC en range fort, BTC lors d'un push impulsif), 60 minutes peut couvrir plusieurs
structures de prix distinctes et légitimer plusieurs entrées.

Enfin, l'indicateur suppose que la fréquence d'activité est corrélée à l'état psychologique.
Ce n'est pas toujours vrai : un trader discipliné peut être très actif sur un actif
qu'il connaît parfaitement, et très peu actif sur les mêmes plages horaires une semaine
plus tard sans que son état psychologique ait changé.

## 3. Validité contextuelle

**Contextes où l'indicateur est pertinent :**

L'overtrading est pertinent lorsque l'activité élevée n'est pas explicable par la
structure du marché ou la stratégie déclarée. Un opérateur qui normalement trade peu,
et qui soudainement place 8 ordres en une heure après une perte, manifeste un signal
réel. L'activité dense coïncidant avec d'autres patterns (rapid_reentry, revenge,
tailles incohérentes) renforce la signification comportementale.

Il est également pertinent sur des marchés à faible volatilité où les opportunités
réelles sont rares : une densité d'activité élevée sur un marché calme signale
presque toujours une recherche d'action plutôt qu'une réponse à des opportunités.

**Contextes où l'indicateur devient fragile :**

En régime de volatilité élevée (push impulsif, expansion forte), la structure de prix
peut produire plusieurs niveaux d'entrée légitimes en une heure. L'indicateur ne peut
pas distinguer "5 trades sur une même tendance bien gérée" de "5 trades sous l'effet
d'un FOMO de volatilité".

**Contextes où l'indicateur devient trompeur :**

En range trading structuré et en trading sur grille, l'overtrading est une trace
mécanique de la stratégie, pas un symptôme psychologique. Le moteur a partiellement
adressé ce cas via le grid-grouper (absorption des groupes grille en trades synthétiques)
et via la contextualisation GRID dans le scoring. Mais la contextualisation GRID n'est
active que si un profil Order History récent (< 7 jours) est disponible. Un range trader
sans Order History récent reste exposé au signal overtrading.

## 4. Faux positifs possibles

**FP-OT-1 — Range trading dense non absorbé par le grid-grouper**

Un opérateur range qui place 6 ordres en 60 minutes sur TAOUSDC, mais dont les ordres
ne présentent pas la structure régulière d'une grille formelle, ne sera pas absorbé
par le grid-grouper. Il sera détecté comme overtrading malgré une stratégie cohérente.

**FP-OT-2 — Journée d'accumulation planifiée**

Un opérateur qui planifie une accumulation par tranches (DCA sur 2–3 heures, 5–6 ordres)
sur un actif en zone de support sera flagué. Pourtant, la stratégie est défensive par
nature — l'accumulation graduelle est précisément la réponse opposée à l'impulsivité.

**FP-OT-3 — Réaction structurelle à un mouvement de prix fort**

Lors d'un push impulsif sur BTC ou un altcoin, plusieurs niveaux de prix distincts
peuvent se présenter en 30–60 minutes. Un opérateur qui prend 3 positions d'achat
à des prix différents, avec des stop-loss distincts, sur une séquence de confirmation
réelle, sera potentiellement flagué.

**FP-OT-4 — Rythme naturel sur actifs à forte volatilité intrinsèque**

Sur des actifs comme les perps ou les micro-caps en phase d'activité, la fréquence
"normale" d'un opérateur discipliné peut dépasser structurellement 5 trades/heure.
Le seuil de 5 trades en 60 minutes suppose une volatilité implicite modérée.

## 5. Faux négatifs possibles

**FN-OT-1 — Overtrading lent**

Un opérateur qui place 4 trades en 70 minutes, 4 trades en 75 minutes, 4 trades en
90 minutes n'est pas détecté. Pourtant, une cadence de 4 ordres par heure sur
plusieurs heures consécutives peut signaler une agitation réelle. L'indicateur ne
voit que les fenêtres ponctuelles, pas la densité cumulée sur une session.

**FN-OT-2 — Overtrading multi-actifs**

Un opérateur qui place 3 trades sur BTC, 3 trades sur ETH, 3 trades sur TAO en
60 minutes n'est pas détecté : le filtre par symbole empêche la détection inter-paires.
Pourtant, 9 trades en une heure sur 3 actifs différents peut signaler une agitation
généralisée, pas une stratégie planifiée sur chaque actif.

**FN-OT-3 — Style "actif mais cohérent" masquant une dérive progressive**

La contextualisation GRID peut atténuer la pénalité jusqu'à 35% de la pénalité de base.
Un opérateur qui dérive progressivement de la grille vers l'impulsivité, sans que d'autres
patterns explicites apparaissent, bénéficiera de l'atténuation même si son comportement
a changé de nature.

## 6. Dépendance au style opérateur

**Classification : fortement contextuel**

L'overtrading est l'indicateur le plus dépendant du style. Sa signification varie
radicalement selon le profil opérateur :

| Style | Signification de l'overtrading |
|---|---|
| Range / Grid | Signal structurellement produit par la stratégie — faible signification pathologique |
| Scalper | Norme opératoire — non applicable |
| Swing / Patience | Signal fort — un swing trader dense est en rupture de style |
| Position trader | Signal très fort — toute densité élevée est anormale |
| Opportuniste | Ambigu — dépend de la qualité des opportunités sur la période |

La contextualisation GRID dans le scoring actuel est une première réponse correcte à
cette dépendance. Elle reste incomplète car elle ne couvre que le style Grid, pas les
autres styles à haute fréquence légitime.

## 7. Dépendance au régime de marché

| Régime | Impact sur l'indicateur |
|---|---|
| Range serré | Faux positifs élevés — stratégies légitimes d'oscillation denses |
| Expansion forte | Signal ambigu — fréquence élevée peut être réponse structurée à la tendance |
| Compression (faible volatilité) | Signal fort — peu de raisons légitimes d'une activité dense |
| Volatilité extrême (news, cascade) | Non représentatif — comportement de crise, interprétation spécifique requise |
| Euphorie de marché | Signal fort — sur-activité en euphorie est pathologique même chez les traders expérimentés |

## 8. Calibrabilité

**Ce qui peut être ajusté :**
- La fenêtre temporelle (60 min) — peut être rendue dépendante du style détecté
- Le seuil minimum (5 trades) — peut varier selon le type d'actif (volatilité intrinsèque)
- L'atténuation GRID — peut être étendue à d'autres styles haute fréquence légitimes

**Ce qui ne doit pas être calibré individuellement :**
- L'existence du signal lui-même — toute activité dense reste un signal
- La combinaison overtrading + autres patterns — la co-occurrence doit toujours produire
  une pénalité non atténuée, quel que soit le style

**Ce qui nécessite une session cockpit réelle :**
- Le seuil perçu comme "trop sensible" ou "jamais déclenché" ne peut être validé que
  par observation terrain

## 9. Garde-fous universels

- **L'overtrading combiné à loss_chasing ou revenge_trading est toujours grave.**
  Aucune contextualisation de style ne doit atténuer cette co-occurrence.
  Le moteur l'implémente déjà : contextualisation GRID désactivée si autre pattern présent.

- **L'overtrading en période de pertes consécutives est toujours un signal fort.**
  Le moteur ne peut pas le détecter directement (pas de P&L), mais la co-occurrence
  avec size_inconsistency ou loss_chasing le révèle indirectement.

- **La fréquence habituelle ne blanchit pas la dérive.**
  Un range trader qui double sa fréquence habituelle n'est pas "en train de faire ce
  qu'il fait toujours" — il est en train de dépasser son propre régime normal.

## 10. Risque de sur-ajustement

**Risque principal : absoudre le style Range/Grid de tout signal.**

Si la calibration adapte les seuils pour un opérateur Range/Grid, elle peut rendre
le moteur aveugle à une véritable dépendance à l'activité chez cet opérateur.
La frontière entre "stratégie range dense" et "besoin compulsif d'être dans le marché"
est réelle et ne peut pas être résolue par la fréquence seule.

**Risque secondaire : sur-personnalisation du seuil de fréquence.**

Si un opérateur trade habituellement 6–8 fois par heure et que le seuil est ajusté à
10, un épisode à 12 fois par heure (potentiellement pathologique) passera inaperçu
alors qu'il représente une rupture claire par rapport au style normal.

**Protection conceptuelle :** le seuil absolu de déclenchement doit rester fixe.
La calibration ne doit agir que sur l'interprétation et la pondération, jamais sur
la visibilité du signal lui-même.

---

# Indicateur 2 — Revenge Trading

## 1. Fonction réelle

Le revenge trading cherche à détecter une réaction émotionnelle à une vente :
l'opérateur sort d'une position, puis entre à nouveau rapidement sur le même actif
avec une taille supérieure à sa moyenne habituelle. La logique implicite est que
cette séquence traduit un refus d'accepter la sortie — le trader "revient" sur le marché
pour récupérer ce qu'il a perdu ou refaire ce qu'il aurait dû faire.

La détection repose sur trois critères simultanés : même symbole (v3), délai court
(< 30 minutes), taille augmentée (> 1.5× la taille moyenne globale).

Dans la chaîne comportementale, le revenge trading est considéré comme un signal
d'alerte modérément grave (poids 20, second après loss_chasing). Sa dangerosité vient
de la combinaison entre la précipitation (délai court) et l'escalade de taille
(engagement plus élevé sur une décision moins réfléchie).

## 2. Hypothèse implicite

L'indicateur suppose que la vente qui précède le BUY rapide est une sortie de position
à perte ou à profit décevant. C'est l'hypothèse centrale — et elle est invérifiable.

Le moteur n'a pas accès au P&L par trade. Il ne sait pas si la vente était :
- une prise de profit (sortie gagnante)
- un stop-loss déclenché (sortie perdante)
- une sortie partielle de position (prise de profit sur une jambe)
- une rotation tactique (sortir A pour entrer B, puis revenir sur A)

La même séquence comportementale (SELL → BUY rapide + taille augmentée) peut décrire
deux réalités opposées : la précipitation émotionnelle d'un opérateur qui "remet"
sa mise, ou la décision structurée d'un opérateur qui prend un profit et renforce
une position qu'il juge toujours valide.

L'indicateur suppose également que la taille augmentée est un signe d'escalade
émotionnelle. Mais une taille augmentée peut être une expression de conviction
renforcée — l'opérateur sort, réévalue, et décide de rentrer avec plus de conviction.

## 3. Validité contextuelle

**Contextes où l'indicateur est pertinent :**

Le revenge trading est pertinent lorsque la vente précédente est clairement une sortie
sous pression (stop-loss déclenché, position défensive). L'opérateur qui sort à perte
et ré-entre immédiatement avec plus de capital expose un mécanisme émotionnel réel.

Il est également pertinent lorsque la séquence est répétée : deux ou trois instances
sur la même session signalent un pattern installé, pas une décision isolée.

**Contextes où l'indicateur devient fragile :**

En range trading, SELL suivi d'un BUY rapide est une séquence normale : l'opérateur
sort au haut de la bande, observe brièvement, et ré-entre au bas de la bande. Le
délai de 30 minutes peut englober un cycle complet de range sur actifs liquides.

**Contextes où l'indicateur devient trompeur :**

Lors d'une accumulation planifiée par tranches, un opérateur peut "tester" une entrée
(achat léger), sortir rapidement si le niveau ne tient pas, puis ré-entrer avec la
taille initiale prévue. La taille de la deuxième entrée sera supérieure à la première
(le "test" était délibérément petit) — le moteur l'interprète comme escalade émotionnelle.

## 4. Faux positifs possibles

**FP-RV-1 — Re-entry sur setup toujours valide après sortie profitable**

L'opérateur prend un profit partiel sur TAOUSDC, le prix reste au niveau d'entrée,
il réentre avec une taille légèrement plus élevée pour compenser la position réduite.
Le moteur voit : SELL → BUY 28 min plus tard + taille > 1.5× moy → revenge trading.

**FP-RV-2 — Sortie défensive suivie d'une entrée agressive planifiée**

L'opérateur sort prudemment d'une position (petite taille, SELL défensif), observe
20 minutes, et rentre sur un niveau de prix qu'il considérait comme cible. Sa "grande
entrée" prévue semble être une escalade par rapport à la petite sortie défensive.

**FP-RV-3 — Stratégie de split d'entrée**

L'opérateur entre avec 30% de sa position prévue pour tester, sort rapidement
(20 min) car le niveau ne se confirme pas, puis réentre avec 100% de la position
prévue dès la confirmation. La taille de la deuxième entrée est 3× la première —
exactement le comportement d'accumulation par étapes prévu.

**FP-RV-4 — Taille de référence biaisée par la multi-actifs**

`metrics.avgSize` est la moyenne globale de toutes les positions sur tous les actifs.
Si l'opérateur trade majoritairement de petits altcoins (50$/trade en moyenne),
une entrée "normale" sur BTC (500$/trade) sera interprétée comme taille > 1.5× moy.
Toute sortie BTC suivie d'une ré-entrée BTC normale sera potentiellement flagée.

## 5. Faux négatifs possibles

**FN-RV-1 — Revenge trading lent (> 30 min)**

Un opérateur qui prend 45 minutes pour se "calmer" avant de réentrer sur le même
actif avec une taille plus élevée n'est pas détecté. Le délai de 30 minutes est
une frontière arbitraire — la dérive émotionnelle peut s'exprimer sur un horizon
plus long.

**FN-RV-2 — Revenge trading inter-symboles**

L'opérateur perd sur BTCUSDT, ne réentre pas sur BTC mais se retourne immédiatement
sur ETHUSDT avec une taille surdimensionnée. La contrainte "même symbole" (v3) fait
passer cette dérive sous le radar. C'est un vrai revenge trading dissimulé par un
changement d'actif — comportement parfois délibéré pour "éviter" mentalement le
symbole perdant.

**FN-RV-3 — Revenge trading à taille stable**

Un opérateur discipliné sur le sizing mais émotionnellement perturbé peut réentrer
rapidement à taille égale. La précipitation est réelle mais la taille reste dans la
norme — pas de signal revenge trading, alors que l'état psychologique est problématique.

## 6. Dépendance au style opérateur

**Classification : semi-adaptatif**

La signification varie selon le style, mais moins que pour l'overtrading :

| Style | Signification du revenge trading |
|---|---|
| Range / Grid | Faux positifs élevés — séquences SELL→BUY rapide sont structurelles |
| Swing | Signal pertinent — la cadence naturelle du swing est plus lente |
| Position trader | Signal fort — tout SELL→BUY rapide sur un actif long terme est anormal |
| Scalper | Non applicable — l'intégralité du style produit ce signal |
| Momentum | Ambigu — un momentum trader peut sciemment "rechasser" un mouvement manqué |

La calibration pertinente ici porte sur la référence de taille (avgSize globale → avgSize
par symbole) plutôt que sur le délai de 30 minutes, qui reste un proxy défendable.

## 7. Dépendance au régime de marché

| Régime | Impact |
|---|---|
| Range dense | Faux positifs élevés — cycles SELL/BUY rapides sont normaux |
| Tendance forte | Signal pertinent — les re-entries rapides en tendance sont souvent du FOMO |
| Marché en capitulation | Ambigu — vendre et réacheter rapidement peut être une erreur ou une récupération |
| Volatilité élevée | Fenêtre de 30 min peut couvrir un cycle entier — interprétation délicate |

## 8. Calibrabilité

**Ce qui peut être ajusté :**
- La référence de taille : `avgSize` global → `avgSize` par symbole (correction structurelle
  importante, non encore implémentée)
- Le facteur de taille (1.5×) : peut être augmenté légèrement pour éviter les faux positifs
  sur des opérateurs dont le sizing évolue naturellement

**Ce qui ne doit pas être calibré individuellement :**
- Le délai de 30 minutes : réduire ce seuil rend le signal trop rare ; l'augmenter noie
  la distinction entre décision rapide et décision réfléchie
- La co-occurrence avec loss_chasing : une re-entry rapide + taille augmentée + escalade
  de position reste grave quel que soit le style

**Ce qui est structurellement incomplet :**
- Sans P&L par trade, la distinction entre revenge réel et re-entry légitime reste
  fondamentalement imparfaite. C'est une limite de conception, pas un problème de seuil.

## 9. Garde-fous universels

- **Le revenge trading répété (≥ 3 instances) est toujours grave.**
  Quel que soit le style, une séquence répétée révèle un mécanisme installé.

- **La combinaison revenge + loss_chasing est le signal le plus grave du moteur.**
  Ces deux patterns ensemble décrivent un opérateur qui perd, réentre vite avec plus,
  et réescalade. Aucune contextualisation de style ne peut atténuer cette co-occurrence.

- **La taille > 1.5× la moyenne reste une anomalie même chez les opérateurs actifs.**
  Un opérateur qui size très irrégulièrement (style conviction-based) doit être
  traité via size_inconsistency, pas via une tolérance accrue sur le revenge trading.

## 10. Risque de sur-ajustement

**Risque principal : normaliser les re-entries rapides chez les opérateurs actifs.**

Si la calibration observe qu'un opérateur range fait souvent des SELL→BUY rapides
et décide d'augmenter le délai de détection à 60 minutes pour lui, elle risque de
rendre le moteur aveugle à un revenge trading réel qui surviendrait dans cette fenêtre.

**Risque secondaire : reference de taille personnalisée.**

Si `avgSize` est remplacée par une moyenne "par opérateur", une dérive progressive
du sizing (opérateur qui augmente graduellement ses tailles après une période de succès)
ne produira jamais de signal — la moyenne suit la dérive.

**Protection conceptuelle :** la référence de taille doit être calculée sur une fenêtre
glissante de comparaison (ex. moyenne des 30 derniers jours) plutôt que sur la totalité
de l'historique disponible. Cela permet de détecter les ruptures par rapport au
comportement récent, pas par rapport à un comportement ancien potentiellement atypique.

---

# Indicateur 3 — Rapid Reentry

## 1. Fonction réelle

La réentrée rapide détecte une incapacité à rester hors du marché après une sortie.
La séquence : entrer (BUY), sortir rapidement (SELL en < 20 min), ré-entrer (BUY en
< 45 min sur le même symbole). Le signal décrit un opérateur qui ne peut pas accepter
sa propre décision de sortie, ou qui entre sans conviction suffisante pour tenir
la position.

Psychologiquement, la réentrée rapide révèle une friction entre le comportement
déclaré (sortir, observer, décider) et le comportement réel (sortir, attendre peu,
réentrer par inconfort de ne pas être dans le marché). C'est moins grave que le
revenge trading (pas de taille augmentée requise) mais révèle une instabilité de
la posture décisionnelle.

Dans la chaîne de pénalité, le poids est identique à l'overtrading (15) — c'est le
signal le moins grave des cinq, mais il peut être amplificateur : combiné à l'overtrading
et au revenge trading, il dessine un profil d'agitation caractérisée.

## 2. Hypothèse implicite

L'indicateur suppose que 20 minutes est un horizon de détention minimum raisonnable.
En dessous, la sortie est "trop rapide" pour être stratégique. De même, 45 minutes
est le délai minimum "raisonnable" entre une sortie et une nouvelle entrée.

Ces deux seuils supposent un style de trading intraday, sur des horizons de quelques
heures. Pour un scalper, 20 minutes est une éternité. Pour un swing trader, 45 minutes
est un clin d'œil.

L'indicateur suppose aussi que la sortie et la ré-entrée sont de même nature. Il ne
différencie pas :
- sortie d'une position longue → ré-entrée plus basse (re-entry sur support)
- sortie d'une position longue → ré-entrée plus haute (poursuite de tendance)

Ces deux comportements sont complètement différents psychologiquement, mais la
détection les traite de façon identique.

## 3. Validité contextuelle

**Contextes où l'indicateur est pertinent :**

La réentrée rapide est pertinente lorsque l'opérateur montre par ailleurs des signes
d'instabilité (overtrading, revenge trading). Une instance isolée peut être du bruit ;
des instances répétées révèlent un mode opératoire.

L'indicateur est également pertinent sur des actifs à faible volatilité où 20 minutes
représente effectivement une durée de position courte et anormale.

**Contextes où l'indicateur devient fragile :**

En scalping ou intraday tight range, BUY→SELL→BUY en moins d'une heure est le cœur
du style. Les seuils de 20 min et 45 min n'ont pas de sens dans ce contexte.

En cas de faux départ sur un niveau technique (entrée, stop rapide, ré-entrée sur
confirmation), la séquence BUY→SELL rapide→BUY rapide est une bonne gestion du risque,
pas un symptôme psychologique.

## 4. Faux positifs possibles

**FP-RR-1 — Gestion du risque sur faux départ**

L'opérateur entre sur un niveau de support, le niveau se brise (stop déclenché en
15 min), il attend le retour au-dessus du niveau (40 min plus tard), réentre.
Séquence : BUY→SELL 15 min→BUY 40 min — détecté comme rapid reentry.

**FP-RR-2 — Prise de profit rapide suivie d'un DCA**

L'opérateur entre, prend un profit rapide sur un spike (SELL en 10 min),
puis réentre plus bas sur le pullback immédiat (25 min plus tard).
Cette gestion est sophistiquée — sortir sur force, rentrer sur faiblesse —
mais elle génère exactement la signature de la rapid reentry.

**FP-RR-3 — Scalping intraday planifié**

Tout opérateur qui scalpe consciemment avec des horizons de 10–30 minutes par
position génère des dizaines de signaux rapid reentry par session. Le signal
n'a aucune signification pathologique dans ce contexte.

**FP-RR-4 — Sortie partielle et re-entry pour compléter**

L'opérateur détient 100 unités, en vend 50 (SELL partiel, 8 min), puis rachète
25 unités sur un pullback (35 min plus tard) pour revenir à 75 unités. Techniquement
une rapid reentry — psychologiquement une gestion sophistiquée de position.

## 5. Faux négatifs possibles

**FN-RR-1 — Réentrée lente mais systématique**

Un opérateur qui sort toujours après 25 minutes et réentre toujours après 50 minutes
ne sera jamais détecté (les deux délais dépassent les seuils de 20 et 45 minutes).
Pourtant, si ce pattern est systématique et combiné à d'autres signaux, il révèle
une incapacité à rester hors du marché.

**FN-RR-2 — Réentrée inter-symboles (rotation compulsive)**

L'opérateur sort de BTC (SELL), puis entre immédiatement sur ETH ou SOL.
La contrainte "même symbole" fait passer cette rotation rapide sous le radar.
Or, une rotation compulsive multi-actifs révèle le même mécanisme psychologique
que la rapid reentry mono-actif.

**FN-RR-3 — Réentrée à taille réduite (sous le radar revenge)**

Un opérateur anxieux sort rapidement et réentre à taille identique ou réduite.
Il ne déclenche ni revenge (pas de taille augmentée) ni rapid reentry si les délais
sont légèrement au-dessus des seuils. Pourtant, la fréquence de la séquence révèle
une instabilité réelle.

## 6. Dépendance au style opérateur

**Classification : fortement contextuel**

| Style | Signification |
|---|---|
| Scalper | Non applicable — signal permanent et non informationnel |
| Range tight | Faux positifs élevés — cycles naturels en dessous des seuils |
| Intraday swing | Partiellement applicable — selon la cadence réelle du style |
| Swing multi-jours | Signal fort — toute sortie et re-entry en < 1h est anormale |
| Position long terme | Signal très fort — anomalie majeure |

## 7. Dépendance au régime de marché

| Régime | Impact |
|---|---|
| Volatilité élevée | Cycles rapides sont normaux — signal souvent faux positif |
| Range serré | Signal ambigu — cycles naturels peuvent coïncider avec les seuils |
| Expansion lente | Signal pertinent — rythme lent → détentions courtes = anormal |
| Marché en panique | Signal non informatif — comportement de crise, non représentatif |

## 8. Calibrabilité

**Ce qui peut être recontextualisé selon le style :**
- Les seuils de 20 min et 45 min peuvent être modulés selon le style déclaré
  (scalper vs swing) — mais cette modulation nécessite que le style soit connu
  avant l'analyse, ce que le moteur ne fait pas encore

**Ce qui est structurellement déficient et ne peut être "calibré" :**
- L'absence de distinction entre re-entry haute (poursuite) et re-entry basse (pullback)
  est une limite architecturale. Elle nécessiterait un accès aux prix de sortie et de
  ré-entrée, ce qui complexifie le calcul sans garantir de fiabilité.

**Ce qui ne doit pas être calibré :**
- La répétition (≥ 3 instances) reste grave quel que soit le style

## 9. Garde-fous universels

- **La répétition est le vrai signal, pas l'instance isolée.**
  Une instance peut être une bonne décision mal chronométrée.
  Trois instances révèlent un mécanisme.

- **La rapid reentry combinée au revenge trading est toujours pathologique.**
  Cette combinaison décrit une séquence : sortir, réentrer vite avec plus,
  sortir vite, réentrer. Elle est incompatible avec toute stratégie réfléchie.

## 10. Risque de sur-ajustement

**Risque principal : invalider le signal pour tous les opérateurs actifs.**

Si l'observation terrain révèle que beaucoup d'opérateurs actifs ont des rapid
reentry régulières sans comportement pathologique associé, la tentation est de
supprimer ou minimiser ce signal pour les profils "actifs". Ce serait une erreur :
le signal porte une information sur la stabilité de la posture décisionnelle, pas
sur la vitesse du trading.

**Protection conceptuelle :** la rapid reentry ne doit jamais être calibrée en
isolation. Son interprétation dépend des patterns co-présents. Seule ou avec
des patterns légers, elle peut être pondérée. Combinée avec d'autres signaux, elle
amplifie et ne doit jamais être atténuée.

---

# Indicateur 4 — Size Inconsistency

## 1. Fonction réelle

La taille incohérente cherche à détecter une absence de règle de sizing : l'opérateur
ne gère pas ses positions selon un principe cohérent, mais selon son état émotionnel
ou son niveau de conviction ponctuel sans discipline structurant.

Le coefficient de variation (CV) mesure la dispersion relative des tailles : si les
positions varient fortement autour de la moyenne (CV > 0.5, soit un écart-type
supérieur à 50% de la moyenne), le sizing n'est pas gouverné par une règle stable.

Dans la chaîne comportementale, le size inconsistency est le signal de fond : il
n'est pas spectaculaire (pas de séquence dramatique comme le loss chasing), mais
révèle une fragilité structurelle de la gestion du risque. Un opérateur sans règle
de sizing est exposé à des pertes disproportionnées dès qu'un trade défavorable
coïncide avec une grosse position.

## 2. Hypothèse implicite

L'indicateur suppose que la "bonne" pratique de sizing est la consistance — des
positions de taille similaire ou régulée. Cette hypothèse encode implicitement
un modèle de money management uniforme (risque fixe par trade, ou taille fixe
en valeur nominale).

Ce modèle n'est pas universel. Il exclut :

**Le sizing par conviction** : l'opérateur place des positions plus grandes sur ses
setups les plus forts. Ce modèle (Kelly-like, position sizing par qualité du setup)
produit structurellement un CV élevé — les "grandes" convictions génèrent de grands
trades, les setups secondaires de petits trades.

**L'allocation différenciée par actif** : un opérateur qui alloue 5% de son capital
sur BTC et 1% sur un altcoin a des tailles radicalement différentes par construction.
Ce n'est pas de l'incohérence — c'est une politique d'allocation délibérée.

**Le sizing défensif adaptatif** : après une série de pertes, un opérateur discipliné
réduit délibérément ses tailles pour protéger le capital. Ce comportement protecteur
augmente le CV (alternance de grandes et petites positions) mais est exactement
le comportement souhaitable.

## 3. Validité contextuelle

**Contextes où l'indicateur est pertinent :**

Le size inconsistency est pertinent lorsque les variations de taille ne s'expliquent
pas par une logique de conviction ou d'allocation et semblent corrélées à l'état
émotionnel. Une taille qui monte après une victoire (sur-confiance) et descend
après une perte (peur) révèle un sizing gouverné par l'émotion récente.

Il est également pertinent sur des historiques mono-actif : sur un seul symbole,
les variations de taille sont plus difficilement justifiables par l'allocation.

**Contextes où l'indicateur devient trompeur :**

Sur des historiques multi-actifs, le CV global est structurellement élevé par
l'allocation différenciée. C'est la limite la plus importante de l'implémentation actuelle.

**Anomalie d'implémentation documentée :**

`detectSizeInconsistency` utilise `metrics.avgSize` (moyenne globale de TOUS les trades)
et calcule le CV sur l'ensemble des positions. La version v3 de `metrics.js` a ajouté
`maxSizeCVBySymbol` (CV par symbole, plus pertinent pour le multi-actifs) mais cette
métrique n'est pas utilisée dans `detectSizeInconsistency`. Il existe donc une
incohérence structurelle entre ce que le moteur mesure et ce qu'il devrait mesurer
pour les opérateurs multi-actifs.

## 4. Faux positifs possibles

**FP-SI-1 — Multi-actifs avec allocation différenciée (cas le plus fréquent)**

Un opérateur trade BTC à 500$/position et TAOUSDC à 50$/position. CV = très élevé
par construction. Le moteur voit une incohérence de sizing qui n'en est pas une.

Ce faux positif est documenté et confirmé sur REAL_001/REAL_004. Il est la cause
principale du score plancher ~15 observé sur les historiques multi-actifs longs.

**FP-SI-2 — Sizing par conviction légitime**

L'opérateur a un setup "A+" qu'il trade à 300$ et des setups secondaires à 100$.
CV = 1.0+. Le moteur diagnostique une absence de règle de sizing alors que la règle
existe : proportionner la taille à la qualité du setup.

**FP-SI-3 — Sizing défensif post-drawdown**

L'opérateur réduit ses tailles de 50% après une série de pertes (de 200$ à 100$),
puis les remonte progressivement. Le CV sur la période de transition est élevé.
Mais ce comportement est exactement ce qu'un opérateur discipliné doit faire.

**FP-SI-4 — Découverte progressive d'un actif**

L'opérateur entre sur un nouvel actif avec des petites positions de découverte
(50$, 50$, 30$) puis, à mesure qu'il comprend la dynamique, monte ses positions
(150$, 200$). Le CV est élevé sur cette phase de montée en puissance, mais le
processus est structuré et délibéré.

## 5. Faux négatifs possibles

**FN-SI-1 — Opérateur avec sizing émotionnel mais tailles absolues stables**

Un opérateur qui trade toujours à 200$ mais choisit ses moments d'entrée sous
l'influence de l'émotion aura un CV faible — le sizing semble cohérent. Pourtant,
sa gestion est émotionnelle si les entrées sont déterminées par la peur de manquer
ou la frustration plutôt que par l'analyse.

**FN-SI-2 — Sur-concentration progressive masquée par l'historique**

Un opérateur qui augmente graduellement sa taille sur un seul actif (de 100$ à 500$
sur 6 mois) présente un CV faible si l'augmentation est régulière. Mais la
sur-concentration finale est un risque réel qui n'est pas visible dans le signal.

## 6. Dépendance au style opérateur

**Classification : semi-adaptatif à calcul global, universel à calcul par symbole**

La version actuelle (CV global) est fortement contextuelle et produit des faux positifs
structurels pour les multi-actifs. Une version par symbole serait semi-adaptive —
pertinente pour la plupart des styles, mais nécessitant toujours une interprétation
sur le sizing par conviction.

| Style | CV global | CV par symbole (si implémenté) |
|---|---|---|
| Mono-actif strict | Pertinent | Pertinent |
| Multi-actifs allocation fixe | Faux positif systématique | Pertinent |
| Multi-actifs conviction-based | Faux positif modéré | Semi-adaptatif |
| Grid / Range | Pertinent (positions régulières par design) | Pertinent |

## 7. Dépendance au régime de marché

Le size inconsistency est relativement indépendant du régime de marché dans sa
détection brute. Cependant, la signification des variations de taille change selon le régime :

| Régime | Signification d'un CV élevé |
|---|---|
| Bull fort | CV élevé peut refléter l'escalade dans une tendance gagnante |
| Bear / capitulation | CV élevé peut refléter la panique — signal pathologique |
| Range | CV élevé suspect — l'opérateur range devrait avoir un sizing régulier |
| Transitions de régime | CV transitoirement élevé lors de l'adaptation de stratégie |

## 8. Calibrabilité

**Correction structurelle prioritaire (non calibration, mais correction d'implémentation) :**

Passer la détection du CV global au CV par symbole (utiliser `maxSizeCVBySymbol`
déjà calculé dans `metrics.js`) élimine la principale source de faux positifs
multi-actifs. C'est une correction architecturale, pas une calibration de seuil.

**Ce qui peut être recontextualisé :**
- La tolérance au CV selon le style déclaré (un sizing par conviction a structurellement
  un CV plus élevé qu'un sizing fixe)

**Ce qui ne doit pas être calibré :**
- Un CV intra-actif très élevé (> 1.5 sur le même symbole) reste problématique
  quel que soit le style
- La combinaison size_inconsistency + loss_chasing reste grave — une escalade de taille
  accompagnée d'une incohérence globale décrit un opérateur sans règle de risque

## 9. Garde-fous universels

- **Un CV très élevé intra-actif (> 1.2 sur le même symbole) ne peut pas être normalisé.**
  Sur un seul actif, des variations de taille de 100% autour de la moyenne révèlent
  une absence de règle de sizing, quel que soit le style.

- **La combinaison size_inconsistency + loss_chasing est le deuxième signal le plus grave.**
  Un opérateur qui escalade ses positions et dont le sizing est incohérent par ailleurs
  est exposé à une perte catastrophique dès le premier drawdown sévère.

## 10. Risque de sur-ajustement

**Risque principal : personnaliser le seuil de CV pour chaque opérateur.**

Si l'observation terrain révèle qu'un opérateur a toujours un CV de 0.9 (style
conviction-based) et que le moteur ajuste le seuil à 1.0 "pour lui", toute dérive
vers un CV de 1.1 passera inaperçue — alors qu'elle représente une rupture réelle
par rapport à son propre style.

**Risque secondaire : absoudre les multi-actifs du signal.**

Si la correction per-symbole est implémentée, le risque inverse apparaît : l'opérateur
multi-actifs n'est jamais signalé pour sizing incohérent parce que chaque actif,
pris individuellement, semble cohérent. Mais la cohérence par actif ne garantit pas
la cohérence globale de la gestion du risque.

**Protection conceptuelle :** maintenir à la fois un signal CV par symbole ET un
signal de surexposition globale (`oversizedTradesCount` existe déjà dans le moteur)
comme deux signaux complémentaires — l'un sur la cohérence locale, l'autre sur
l'exposition absolue.

---

# Indicateur 5 — Loss Chasing

## 1. Fonction réelle

Le loss chasing détecte une escalade progressive d'exposition sur un même actif en
un temps court : l'opérateur réalise trois achats consécutifs dont les tailles
augmentent de manière significative (le troisième achat dépasse 1.8× la taille du
premier), sur une fenêtre de 2 heures.

C'est le signal le plus grave du moteur (poids 25, pénalité jusqu'à 25 points).
Il décrit un comportement de type "martingale" — ajouter à une position perdante
avec des montants croissants dans l'espoir de récupérer l'ensemble en un seul mouvement.

La logique comportementale est claire : plus l'opérateur ajoute à une position en
difficulté, plus son exposition augmente dans le pire contexte possible (prix qui
continue dans la mauvaise direction). Le loss chasing transforme une perte contrôlée
en risque de perte catastrophique.

## 2. Hypothèse implicite

L'indicateur suppose que trois achats consécutifs avec taille croissante sur 2 heures
sont une réaction à une position perdante. Cette hypothèse est centrale — et elle
est partiellement invérifiable.

Le moteur compare les tailles de position (quote_quantity) entre trois achats consécutifs.
Il ne compare pas les prix. Il ne sait donc pas si :

- Les prix des trois achats sont identiques (DCA sur un niveau fixe)
- Les prix descendent (averaging down réel — le vrai loss chasing)
- Les prix montent (pyramiding into a winner — une stratégie valide)

La même séquence (BUY 100$ → BUY 150$ → BUY 200$ en 90 min) peut décrire :
- Un opérateur qui double sa mise à mesure que le prix baisse (loss chasing réel)
- Un opérateur qui renforce une position gagnante à mesure que le prix monte (pyramiding)

Le facteur de 1.8× (v3) a été introduit pour filtrer les DCA légers (100→110→120$)
qui sont des stratégies planifiées. C'est un progrès réel. Mais le problème structurel
de l'absence de comparaison de prix reste entier.

## 3. Validité contextuelle

**Contextes où l'indicateur est pertinent :**

Le loss chasing est pertinent lorsque l'escalade de taille survient dans un contexte
de mouvement de prix défavorable. C'est le pattern le plus dangereux existant — une
position qui s'aggrave progressivement jusqu'à dépasser les capacités de l'opérateur.

Il est également pertinent lorsque la séquence est répétée (plusieurs instances dans
l'historique) — signe d'un comportement installé, pas d'une erreur isolée.

**Contextes où l'indicateur devient trompeur :**

En accumulation planifiée sur un niveau technique fort, trois achats croissants sur
2 heures sont une stratégie valide. L'opérateur entre d'abord prudemment, confirme
le niveau, puis renforce. La taille croissante reflète la confirmation progressive,
pas la panique.

En pyramiding sur une tendance forte, renforcer une position gagnante avec des
tailles croissantes est une stratégie avancée et disciplinée. Elle génère exactement
la signature du loss chasing sans en avoir la pathologie.

## 4. Faux positifs possibles

**FP-LC-1 — Pyramiding dans une tendance haussière forte**

L'opérateur entre sur BTC à 65000$ (100$), ajoute à 66000$ (150$), renforce
à 67500$ (200$) alors que le prix monte. Taille croissante sur 90 min — détecté comme
loss chasing. Psychologiquement, c'est le comportement inverse : discipliné, suivant
la tendance, renforçant sur la confirmation.

**FP-LC-2 — Accumulation planifiée sur zone de support**

L'opérateur identifie une zone de support large (ex. 60000–62000$ sur BTC). Il programme
trois achats échelonnés sur la zone : 100$ à 62000$, 150$ à 61000$, 200$ à 60000$.
Il exécute ce plan sur 2 heures. Détecté comme loss chasing — en réalité une stratégie
DCA ciblée sur un niveau.

**FP-LC-3 — Rattrapage d'une taille cible manquée**

L'opérateur voulait acheter 400$ sur un actif. Il entre à 100$ (test), confirme le
niveau (20 min plus tard entre à 150$), puis complète sa position cible (30 min plus
tard entre à 180$). Son intention était 400$ au total — la progression des tailles
reflète l'exécution par étapes d'une décision unique.

**FP-LC-4 — DCA agressif planifié sur range défensif**

Sur un actif range, l'opérateur planifie 3 niveaux d'achat avec des tailles croissantes
pour maximiser l'exposition au bas de la bande (où il a le plus de conviction).
Tailles : 50$ au niveau 1, 100$ au niveau 2, 100$× 1.8 = 180$ au niveau 3.
Exactement au seuil du facteur d'escalade.

## 5. Faux négatifs possibles

**FN-LC-1 — Loss chasing lent (> 120 min)**

Un opérateur qui moyenne sa position à la baisse sur 3 heures (3 achats croissants
en 3h20) n'est pas détecté. La fenêtre de 120 min est arbitraire — un loss chasing
"méthodique" peut s'étaler sur une demi-journée.

**FN-LC-2 — Escalade de taille stable (x1.5 seulement)**

Trois achats : 100$, 130$, 155$ (l'escalade est réelle, le 3e fait 1.55× le 1er).
Le seuil de 1.8× n'est pas atteint — pas de détection. Pourtant, la logique
d'escalade est présente, surtout si répétée sur d'autres séquences.

**FN-LC-3 — Loss chasing inter-actifs**

L'opérateur perd sur BTC, ne rachète pas BTC (il a conscience du signal) mais
se retourne sur ETH avec une taille disproportionnée. Le loss chasing change
d'actif — le filtre par symbole le rend invisible. Ce comportement est psychologiquement
identique au loss chasing mono-actif.

**FN-LC-4 — Loss chasing sur SELL (short averaging down)**

Un opérateur qui short un actif et escalade sa position short avec des tailles
croissantes n'est pas détecté (le moteur ne regarde que les BUYs consécutifs).
Ce cas est plus rare sur spot mais réel sur les marchés avec positions courtes.

## 6. Dépendance au style opérateur

**Classification : semi-adaptatif**

Le loss chasing est le pattern le moins dépendant du style en termes de pathologie
réelle — une escalade de position dans le mauvais sens est problématique quel que
soit le style. Mais les faux positifs varient selon le style :

| Style | Risque de faux positif |
|---|---|
| Pyramiding (tendance) | Élevé — renforcement dans la bonne direction non distingué |
| DCA ciblé (range) | Modéré — accumulation planifiée peut déclencher le signal |
| Scalper | Faible — les fenêtres de temps sont trop courtes |
| Position trader | Faible — trois BUYs en 2h sur un actif long terme est anormal |
| Revenge accumulatif | Nul — le comportement est réellement pathologique |

La distinction critique qui manque est la direction du prix : pyramiding vs averaging down.
Sans cette information, le signal reste semi-adaptatif malgré sa pertinence doctrinale.

## 7. Dépendance au régime de marché

| Régime | Impact |
|---|---|
| Tendance haussière forte | Faux positifs importants (pyramiding légitime) |
| Tendance baissière | Signal très pertinent — escalade à la baisse = loss chasing réel |
| Range | Ambiguité — DCA sur support vs averaging down difficile à distinguer |
| Capitulation | Signal fort — les escalades en capitulation sont presque toujours pathologiques |
| Rebond technique | Ambigu — accumulation sur rebond peut être légitimement croissante |

## 8. Calibrabilité

**Ce qui peut être amélioré sans changer le seuil :**

L'accès au prix des trois BUYs permettrait de distinguer pyramiding (prix montant)
de loss chasing réel (prix baissant). Cette information est dans les données. C'est
une amélioration architecturale, pas une calibration de seuil.

**Ce qui peut être ajusté :**
- La fenêtre de 120 min — peut être étendue pour capturer le loss chasing lent
- Le facteur d'escalade (1.8×) — peut être légèrement réduit (1.5×) pour capturer
  les escalades moins agressives, au prix d'un risque de faux positifs sur DCA léger

**Ce qui ne doit jamais être calibré individuellement :**
- La détection elle-même — le loss chasing est le signal le plus dangereux et
  sa désactivation ou forte atténuation pour un style particulier est une erreur doctrinale

## 9. Garde-fous universels

- **Le loss chasing est le seul pattern qui peut être universellement dangereux
  quel que soit le style.** Même un opérateur discipliné peut connaître une séquence
  de loss chasing sous l'effet d'un stress exceptionnel.

- **La répétition du loss chasing est un signal critique.**
  Deux séquences de loss chasing dans un même historique révèlent un mécanisme
  comportemental installé, pas une erreur isolée.

- **Le loss chasing + revenge trading est la combinaison la plus dangereuse.**
  Elle décrit un opérateur qui sort sous pression, réentre vite avec plus,
  et escalade à mesure que la position empire. C'est la trajectoire vers la
  perte catastrophique.

- **Aucune contextualisation de style ne doit atténuer le loss chasing répété.**
  Même un pyramider peut avoir une séquence de loss chasing — les deux comportements
  ont des signatures différentes (direction du prix) que le moteur ne distingue pas encore.
  En l'absence de cette distinction, le signal doit rester grave.

## 10. Risque de sur-ajustement

**Risque principal : adapter le seuil d'escalade pour les accumulateurs.**

Si la calibration observe qu'un opérateur DCA utilise souvent des progressions 1.6×–1.8×
et décide de relever le seuil à 2.2× "pour lui", toute séquence de loss chasing réel
à 2.0× passera sous le radar alors qu'elle représente une dérive claire.

**Risque secondaire : créer une exception "style pyramiding".**

Si le moteur apprend à distinguer le pyramiding (prix monte) du loss chasing (prix
baisse), le risque existe que l'opérateur déclare mentalement ses escalades comme
"pyramiding" même lorsque le prix descend légèrement (déni de la direction).

**Protection conceptuelle :** la distinction pyramiding/loss chasing, si elle est
implémentée, doit utiliser des données objectives (comparaison de prix) et non
des données déclaratives. Elle ne doit jamais reposer sur ce que l'opérateur
"dit faire" mais sur ce que les prix confirment.

---

## Synthèse de l'audit

### Classification des indicateurs

| Indicateur | Classification | Pertinence universelle |
|---|---|---|
| overtrading | Fortement contextuel | Faible isolé / Forte co-occurrence |
| revenge_trading | Semi-adaptatif | Moyenne (P&L non observable) |
| rapid_reentry | Fortement contextuel | Faible isolé / Forte en série |
| size_inconsistency | Semi-adaptatif (CV global déficient) | Forte intra-actif / Faible multi-actifs |
| loss_chasing | Semi-adaptatif (direction de prix manquante) | Forte — signal le plus universel |

### Problèmes structurels identifiés

| Code | Indicateur | Problème | Nature |
|---|---|---|---|
| PS-01 | size_inconsistency | CV global calculé au lieu de CV par symbole | Incohérence d'implémentation — métrique existante non utilisée |
| PS-02 | loss_chasing | Absence de comparaison de prix (pyramiding vs averaging down) | Limitation architecturale — information disponible mais non exploitée |
| PS-03 | revenge_trading | P&L non observable — SELL gagnant/perdant indiscernables | Limitation fondamentale — non résolvable sans enrichissement des données |
| PS-04 | rapid_reentry | Direction de re-entry non observée (re-entry haute vs basse) | Limitation architecturale — partiellement résolvable |
| PS-05 | overtrading | Multi-actifs simultané non détecté (inter-paires) | Décision de design discutable — FN-OT-2 |
| PS-06 | revenge_trading | avgSize globale comme référence de taille | Biais multi-actifs — même problème que PS-01 |

### Garde-fous universels consolidés

Les comportements suivants doivent rester non calibrables, non atténuables,
quel que soit le profil opérateur ou le style déclaré :

1. **Loss chasing répété (≥ 2 séquences)** — signal critique universel
2. **Revenge trading répété (≥ 3 instances)** — mécanisme installé
3. **Co-occurrence loss_chasing + revenge_trading** — trajectoire vers perte catastrophique
4. **Co-occurrence overtrading + autres patterns** — contextualisation GRID désactivée (déjà implémenté)
5. **CV intra-actif > 1.2** — absence de règle de sizing sur le même actif, non normalisable
6. **Accélération d'exposition en période de pertes** — même si les données P&L directes manquent,
   la co-occurrence de loss_chasing + size_inconsistency + revenge révèle ce pattern

### Hiérarchie de danger révisée

La hiérarchie actuelle (poids de scoring) est globalement correcte. L'audit
suggère les nuances suivantes :

| Pattern | Poids actuel | Nuance |
|---|---|---|
| loss_chasing | 25 | Correct — signal le plus universel |
| revenge_trading | 20 | Correct — mais fortement affaibli par l'absence de P&L |
| size_inconsistency | 20 | Sur-estimé en version CV global multi-actifs |
| overtrading | 15 | Correct en co-occurrence / Sous-signifiant isolé |
| rapid_reentry | 15 | Correct en série / Trop signifiant isolé |

### Questions ouvertes pour la future architecture Constellium

Les questions suivantes ne peuvent pas être résolues par cet audit. Elles sont le
point de départ du prochain chantier (construction des profils opérateurs) :

**Q1.** Comment définir formellement le "style opérateur" d'une façon que le moteur
peut détecter depuis les données de trades, sans déclaration explicite ?

**Q2.** Quel est le seuil minimal de données (nombre de trades, durée de l'historique)
pour qu'un profil opérateur soit fiable ? En dessous de ce seuil, le moteur doit-il
se déclarer "non calibré" plutôt que de produire un profil potentiellement biaisé ?

**Q3.** Comment distinguer un comportement fréquent (statistiquement normal chez
cet opérateur) d'un comportement sain (cohérent avec un profil discipliné) ?
La fréquence ne suffit pas. Quelle est la structure complémentaire ?

**Q4.** Comment le moteur peut-il détecter une rupture de style — l'opérateur qui
dévie de son propre pattern habituel — sans avoir accès à un historique long ?

**Q5.** La notion de "régime de marché" doit-elle être déclarée par l'opérateur,
inférée depuis les données de trades, ou les deux ?

---

## Statut

**Type** : Document fondateur · Chantier Constellium
**Code modifié** : zéro
**Flags modifiés** : zéro
**Seuils modifiés** : zéro
**Implémentation** : aucune

Ce document est le premier socle du système de calibration adaptative Constellium.
Il ne produit pas de code. Il produit de la clarté.

---

*Audit des indicateurs comportementaux — Version 1.0 — 2026-05-25*
