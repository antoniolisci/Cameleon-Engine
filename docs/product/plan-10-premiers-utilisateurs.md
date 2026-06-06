# Plan — 10 premiers utilisateurs actifs

> Ce document décrit une stratégie d'apprentissage produit.
> Son objectif n'est pas de maximiser le nombre d'utilisateurs.
> Son objectif est de comprendre si Caméléon Engine crée une valeur réelle
> pour un petit nombre d'utilisateurs qualifiés.
>
> La vraie contrainte n'est pas l'acquisition. La vraie contrainte est la sélection.
>
> Statut : hypothèse de validation terrain. Aucun chantier ouvert.
> À réviser après les premiers utilisateurs réels.
> Aucune garantie de résultat. Les retours terrain réels ont priorité sur ce document.

---

## Préambule honnête

Il faut distinguer 10 inscrits et 10 utilisateurs actifs. Obtenir 10 inscriptions
prend une semaine. Obtenir 10 personnes qui importent leurs données, reviennent,
et utilisent le moteur de friction sur plusieurs sessions — c'est 3 à 6 mois,
pas 90 jours, si on est honnête sur la nature du produit.

Caméléon Engine demande quelque chose de rare : un trader conscient de ses propres
biais, capable d'exporter ses données, et prêt à faire du travail d'introspection.
Ce profil représente peut-être 3 à 5 % de la population trading. Le trouver
prend du temps. Le filtrer aussi.

La difficulté n'est pas technique. Elle est comportementale : trouver des personnes
dont les attentes sont compatibles avec ce que le produit fait réellement.

---

## 1. Acquisition — canaux classés par probabilité réelle

### Tier 1 — Probabilité haute (à faire en premier)

**Réseau personnel direct**
Le canal le plus efficace pour les 5 premiers utilisateurs. Pas besoin de pitch,
pas de friction d'acquisition. Si des traders sérieux sont connus personnellement,
c'est là que ça commence. Avantage clé : leur feedback est honnête parce qu'ils
respectent assez pour ne pas mentir.
Cible : 3 à 5 personnes max. Qualité > quantité.

**Communautés trading psychology / journaling**
Public pré-qualifié. Les personnes qui utilisent déjà Edgewonk, Tradervue,
Tradezella ou qui tiennent un journal de trading ont déjà validé le comportement
que Caméléon Engine exige. Elles croient à l'analyse comportementale.
Elles cherchent peut-être un outil plus complet ou mieux adapté à Binance.
Cible : forums Discord dédiés au journaling, pas aux signaux.

### Tier 2 — Probabilité moyenne (après les 5 premiers)

**X / Twitter — approche indirecte**
Pas en mode "voici mon outil". En mode contribution. Partager des observations
sur le comportement des traders (pas des signaux), poster une analyse comportementale
réelle, documenter le développement sobrement. L'audience qui répondra positivement
sera auto-sélectionnée. C'est lent mais propre.
Erreur à éviter : poster "bêta ouverte" sans avoir construit une audience d'abord.

**Discord trading — sélection rigoureuse**
Pas les gros serveurs signaux — trop de bruit, mauvais profil. Chercher les petits
serveurs où des traders discutent de process, gestion du risque, psychologie.
Ces serveurs existent mais sont rares.
Cible : 2 ou 3 serveurs max, participation authentique pendant 2 à 3 semaines
avant de mentionner le projet.

### Tier 3 — Probabilité faible (à éviter au début)

**Binance Square**
L'audience est orientée signaux, alpha, performance. Le positionnement anti-signaux
de Caméléon Engine sera incompris ou ignoré. Potentiellement contre-productif
si les premiers utilisateurs attendent des signaux et sont déçus.

**Reddit**
Signal/bruit trop élevé. Peut fonctionner sur r/trading ou r/Daytrading mais
avec une contribution authentique préalable de plusieurs semaines.

**Product Hunt / launches publiques**
Trop tôt. Ces canaux génèrent du trafic curieux, pas des traders sérieux avec
6 mois d'historique à importer.

---

## 2. Portrait du premier utilisateur

### Profil idéal

Trader actif depuis au moins 12 mois. Pas un débutant — il a assez d'historique
pour que les patterns comportementaux soient visibles. Il trade sur Binance ou
une plateforme qui exporte en CSV. Il a connu au moins une perte significative
qu'il n'a pas réussi à expliquer rationnellement après coup. Il a l'habitude de
garder des notes, un journal, ou a essayé un outil de journaling et l'a abandonné
faute de temps.

Ce qui le caractérise le mieux : il est frustré par lui-même plus que par le marché.
Il ne cherche pas un saint graal. Il cherche une forme de clarté sur ce qu'il
fait vraiment.

### Profil à éviter

Il n'est pas un trader haute fréquence (trop de volume, patterns difficiles à
analyser). Il n'est pas quelqu'un qui attend des signaux déguisés en "analyse".
Il n'est pas un débutant qui n'a pas encore de comportements à analyser. Il n'est
pas quelqu'un qui blâme uniquement le marché — celui-là ne trouvera aucune valeur
dans un outil centré sur ses propres patterns.

### Signal d'incompatibilité fondamentale

Toute personne qui pose la question "est-ce que ça m'indique quand acheter ?"
dans les 5 premières minutes. Cette question signale une incompatibilité
fondamentale avec la proposition de valeur. L'intégrer serait une erreur
coûteuse en temps et en moral.

Toute personne qui cherche des signaux — même après explication du positionnement —
est un faux positif d'acquisition. Elle ne deviendra pas un utilisateur du
produit réel. Mieux vaut la laisser partir vite.

---

## 3. Métriques de validation — hiérarchie réelle

### Niveau 1 — Preuves de base (nécessaires mais insuffisantes)

- Import réalisé (l'utilisateur a chargé ses données)
- Score comportemental généré et consulté
- Retour dans les 7 jours suivant le premier import

Ces métriques disent que le produit fonctionne techniquement.
Elles ne disent pas qu'il a de la valeur.

### Niveau 2 — Preuves d'engagement réel

- Deuxième import (l'utilisateur revient avec plus de données)
- Consultation du moteur de friction pendant une session de trading active
- Utilisation sur 3 semaines consécutives ou plus

Ces métriques disent que l'utilisateur intègre l'outil dans sa pratique.
C'est le seuil minimum de validation produit.

### Niveau 3 — Preuves de valeur (ce qui compte vraiment)

- L'utilisateur décrit un moment où il a changé une décision à cause de ce que
  le moteur lui a montré
- L'utilisateur importe spontanément plusieurs sources de données (CSV + PDF)
- L'utilisateur revient après une période d'absence (il manque quelque chose
  quand il ne l'utilise pas)
- L'utilisateur recommande le produit à un autre trader sans y être invité

Ces métriques valident la proposition de valeur fondamentale. Un seul utilisateur
de niveau 3 vaut plus que 50 inscrits de niveau 1.

### Preuve de transformation

La preuve de valeur supérieure n'est pas qu'un utilisateur consulte le moteur.
C'est qu'il modifie progressivement sa manière de décider.

Caméléon Engine est un outil comportemental. Mesurer uniquement l'usage (imports,
sessions, retours) sans mesurer le changement de comportement réel revient à
mesurer la lecture d'un livre sans mesurer ce qu'on en a retenu.

Les signaux de transformation à observer :

- Réduction des entrées impulsives sur des configurations non validées
- Diminution du revenge trading après une perte
- Meilleure patience avant exécution — attente des conditions définies à l'avance
- Utilisation volontaire de la friction comme filtre, et non comme obstacle
- Meilleure cohérence entre le plan annoncé et les décisions réellement prises

Ces signaux ne se mesurent pas avec des dashboards. Ils s'observent en entretien,
dans les verbatims, dans les exports successifs comparés dans le temps.

Un gain ponctuel peut être dû au hasard. Un changement durable de comportement
est beaucoup plus difficile à obtenir — et constitue une preuve de valeur supérieure.

### La question de référence

Demander à chaque utilisateur actif :

> *"Si Caméléon Engine disparaissait demain, est-ce que ça changerait quelque
> chose à ta façon de trader ?"*

Si la réponse est non ou hésitante, le produit n'a pas encore trouvé sa valeur
réelle pour cette personne. Ce n'est pas un jugement — c'est une information.

---

## 4. Plan J0 → J90

Ce plan suppose que le produit est déployable. Si des étapes de la roadmap
technique manquent, décaler le plan proportionnellement. Ne pas chercher des
utilisateurs pour un produit incomplet — premières impressions gâchées, temps
perdu.

Principe directeur : peu d'utilisateurs, beaucoup d'observation.

### J0–J14 — Préparer avant d'inviter

Pas d'acquisition. Préparer le terrain.

- Rédiger un message d'invitation court, honnête, direct. Une phrase sur ce que
  le produit fait. Une phrase sur ce qu'il ne fait pas. Une invitation.
- Identifier 5 personnes dans le réseau personnel qui correspondent au profil.
  Pas plus. La qualité prime.
- Créer un canal de feedback minimal : email dédié ou accès direct pour les
  bêta testeurs. Pas de formulaire complexe — on veut qu'ils parlent.
- Définir ce qui sera observé pendant les 30 premiers jours. Pas de dashboard
  analytique — des notes qualitatives après chaque conversation.

### J15–J45 — Première vague : réseau personnel

Objectif : 3 à 5 utilisateurs actifs.

- Contacter 5 personnes directement, individuellement, sans message générique.
- Proposition : accès gratuit, feedback demandé, engagement sur 30 jours.
- Organiser un appel de 30 minutes avec chacun après leur premier import.
  Objectif : comprendre ce qu'ils ont ressenti, pas corriger le produit immédiatement.
- Documenter chaque session. Pas des statistiques — des verbatims.

Signal d'arrêt : si aucun des 5 n'importe ses données dans les 2 premières semaines,
le problème est soit le produit soit le ciblage. Diagnostiquer avant de continuer.

### J46–J75 — Deuxième vague : communautés sélectionnées

Objectif : 5 utilisateurs supplémentaires issus d'une communauté externe.

- Choisir 1 ou 2 communautés Discord trading psychology / journaling.
  Y contribuer pendant 2 semaines avant de mentionner le projet.
- Partager 1 ou 2 observations tirées des données réelles collectées lors de
  la première vague (anonymisées). Pas un pitch — une démonstration de ce que
  le moteur voit.
- Inviter directement les personnes qui réagissent. Pas de lien public
  d'inscription — invitation directe.
- Même protocole que la première vague : appel post-import, documentation qualitative.

### J76–J90 — Bilan et décision

Pas d'acquisition. Synthèse.

- Combien d'utilisateurs ont importé leurs données ?
- Combien sont revenus au moins 3 fois ?
- Combien peuvent décrire un moment de valeur réelle ?
- Qu'est-ce que le produit ne fait pas encore que les utilisateurs cherchent ?
- Quelle fonctionnalité a surpris positivement ? Laquelle a déçu ?

Ce bilan est plus précieux que 100 utilisateurs supplémentaires. Il détermine
les 90 jours suivants.

---

## 5. Erreurs à éviter

**Acquérir des utilisateurs curieux plutôt que qualifiés**
La curiosité ne suffit pas. Un trader curieux qui s'inscrit, ne charge pas ses
données, et disparaît en une semaine ne valide rien. Il consomme du temps en
support et fausse les métriques. Mieux vaut 3 utilisateurs actifs que 30
inscriptions fantômes.

**Lancer une bêta publique trop tôt**
Un lien public d'inscription distribué largement amène un public non qualifié.
Le résultat : des feedbacks sur des attentes que le produit n'est pas censé
satisfaire. Le premier cercle doit être entièrement contrôlé.

**Mesurer les mauvaises métriques**
Nombre d'inscriptions, nombre de visites, temps passé sur le site — ces métriques
sont dangereuses parce qu'elles donnent l'illusion de traction. La seule métrique
qui compte au stade de 10 utilisateurs : est-ce qu'ils reviennent ?

**Construire des features pendant la phase d'acquisition**
Le réflexe de tout fondateur est de coder quand le feedback arrive. Il faut
résister. Si un utilisateur dit "il manque X", noter, remercier, ne pas coder
immédiatement. Attendre que 3 utilisateurs disent la même chose. Sinon, on
optimise pour un cas particulier, pas pour une tendance réelle.

**Essayer de convaincre quelqu'un que le produit lui est utile**
Si un utilisateur ne comprend pas la valeur en 10 minutes d'usage, ce n'est pas
un problème d'explication — c'est un signal de mauvais profil ou de mauvais
produit. L'énergie dépensée à convaincre est de l'énergie volée à l'observation.

**Ignorer le signal d'incompatibilité fondamentale**
Tout utilisateur qui reformule Caméléon Engine comme un outil de signaux — même
après explication — est un faux positif d'acquisition. Le laisser partir vite.

---

## 6. Ce qu'un investisseur early-stage voudrait voir

Un investisseur intelligent dans ce domaine ne sera pas convaincu par des courbes.
Il sera convaincu par des preuves que le produit crée un comportement que les
utilisateurs ne veulent plus perdre.

### Preuves réelles — par ordre de valeur

**Le cas d'usage documenté**
Un seul utilisateur qui décrit précisément : "j'ai vu ce pattern dans mes données,
j'ai modifié mon comportement, voilà ce que ça a changé." Pas besoin de 10 —
un cas documenté rigoureusement vaut plus qu'une cohorte vague.

**Le taux de retour à 60 jours**
Sur 10 utilisateurs actifs, combien utilisent encore le produit après 60 jours ?
Si ce chiffre est supérieur à 50 %, c'est exceptionnel pour un outil de ce type.
C'est une preuve de rétention réelle, pas de curiosité.

**La référence spontanée**
Au moins un utilisateur a parlé du produit à un autre trader sans y être invité.
C'est le seul signal d'adéquation produit-marché qui ne peut pas être fabriqué.

**L'usage en conditions réelles**
Des données montrant que des utilisateurs ont consulté le moteur de friction
pendant une session de trading active — pas seulement après coup. C'est la
différence entre un outil d'analyse rétrospective et un outil de décision.

### Métriques de vanité — à ne pas confondre avec des preuves

- Nombre total d'inscriptions
- Nombre de visites
- Temps passé sur le site
- Nombre de pages vues

Ces métriques sont dangereuses à ce stade parce qu'elles mesurent l'intérêt,
pas la valeur. Un produit "intéressant" que les gens utilisent une fois et
oublient n'a pas trouvé sa proposition de valeur.

---

## Conclusion

La vraie contrainte n'est pas l'acquisition. C'est la sélection.

Caméléon Engine a un profil utilisateur très précis. Trouver 10 personnes qui
correspondent n'est pas un problème de marketing — c'est un problème de filtrage.
Le canal le moins glamour (réseau personnel direct) est le plus efficace parce
qu'il permet le meilleur filtrage.

10 utilisateurs actifs, documentés, interviewés et récurrents valent davantage
que 100 utilisateurs passifs. Ils permettent de savoir si le produit tient ses
promesses. C'est la seule chose qui compte à ce stade.

---

## Statut

Hypothèse de validation terrain. Aucun chantier ouvert.

À réviser après les premiers utilisateurs réels. Les retours terrain réels
ont priorité sur les hypothèses de ce document.

Ce document ne modifie pas la roadmap officielle en vigueur :

1. Portefeuille utilisateur interne
2. Mémoire opérateur
3. PDF Import V1
4. Compte utilisateur
5. Paiement
6. Mise en ligne
7. Validation terrain
