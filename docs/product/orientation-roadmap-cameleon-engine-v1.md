# Caméléon Engine — Orientation Roadmap V1

**Date :** 2026-05-19
**Statut :** document d'orientation stratégique — non prescriptif sur les délais,
non substituable à la doctrine produit existante.

> Ce document dit où le projet en est réellement, comment il peut évoluer,
> et ce qui ne doit pas encore être fait. Il n'est pas une feuille de route
> de sprint. Il est une carte de maturité.

---

## 1. Ce qu'est réellement Caméléon Engine

### Ce que ce n'est pas

Caméléon Engine n'est pas un bot. Il ne génère pas d'ordres, n'exécute pas,
ne pilote rien à la place de l'utilisateur.

Ce n'est pas un système de signaux. Il ne dit pas d'acheter ou de vendre.
Il ne produit pas d'alertes actionnables sur les prix.

Ce n'est pas un dashboard de trading classique. Il ne juxtapose pas des dizaines
d'indicateurs simultanés en attente d'être lus. Il ne cherche pas à tout afficher.

Ce n'est pas un produit de croissance. Il n'est pas conçu pour maximiser
l'engagement, le temps passé, les sessions actives, ou la viralité.

Ce n'est pas une plateforme. Il n'a pas vocation à agréger des services tiers,
à s'intégrer à des exchanges, ou à traiter des ordres en live.

### Ce que c'est

Caméléon Engine est un cockpit cognitif. Son rôle est de rendre lisible
la situation décisionnelle d'un trader — contexte de marché, état comportemental,
confiance d'exécution — dans un espace calme et stable.

C'est un moteur de lecture comportementale. Il analyse l'historique d'import
pour produire une lecture des patterns comportementaux de l'utilisateur :
fréquence, discipline, consistance de taille, biais récurrents.

C'est un environnement opérationnel calme. L'interface ne s'agite pas.
Elle pose. Le silence y est une information comme les autres. La friction y est
intentionnelle, graduelle, jamais punitive.

C'est une structure de support à la décision. Le trader reste l'autorité finale.
Le cockpit fournit les instruments — jamais le verdict.

C'est un système comportemental de longue durée. Sa valeur ne se révèle pas
en une session. Elle se construit sur des semaines d'usage, par accumulation
de lecture et de conscience décisionnelle.

### Les trois principes architecturaux qui le définissent

**Friction intelligente.** L'interface rend l'action coûteuse en conscience,
jamais impossible. Un délai proportionnel à la confiance d'exécution. Toujours
contournable. Jamais un blocage.

**Présence calme.** Le cockpit habite l'écran sans s'agiter, sans crier, sans
réclamer l'attention. Le silence est une feature protégée. L'inversion d'intensité
est sa signature : quand le marché s'agite, le cockpit ralentit.

**Réduction avant accumulation.** La valeur vient de ce que le produit refuse
d'afficher, pas de ce qu'il accumule. Chaque version peut ajouter de la profondeur
analytique sans ajouter de surface visible. L'interface maigrit pendant que
le moteur grossit.

---

## 2. État réel du projet

### Phase actuelle : PHASE 0 — Fondation cognitive et stabilisation V1

Le projet est en Phase 0. C'est une phase productive et avancée sur le plan
de la doctrine et de l'architecture interne. Ce n'est pas encore un produit
déployé, confronté à des utilisateurs réels, ou économiquement actif.

La confusion entre "doctrine avancée" et "produit terminé" est le premier
risque de dispersion. Ce document l'adresse explicitement.

### Ce qui existe

**Doctrine et identité**
- Manifeste produit complet (`docs/manifesto-cameleon-engine.md`) —
  15 sections couvrant philosophie, voix, posture, économie, extension
- Doctrine opérationnelle (`docs/product/doctrine-cameleon-profondeur-viabilite.md`) —
  7 lois, interdits absolus, garde-fous, 13 questions avant chaque release
- Audit de cohérence doctrinale (`docs/product/audit-coherence-doctrinale-2026-05-19.md`) —
  contradictions identifiées, tensions documentées

**Architecture et moteur**
- Pipeline moteur complet : `buildPayload()` → `computeUXState()` → rendu DOM
- 6 états décisionnels : BLOCKED / PROTECT / WAIT / READY / TENSION / ALIGNED
- Confiance d'exécution (`execution-confidence.js`) : score 0–100,
  gradient friction × behavioral state × engagement level
- Friction graduelle (`friction.js`) : 0 / 1500 / 3000 / 5000ms, stateless,
  toujours bypassable
- Module comportemental V4.5 (`src/js/behavior/`) : pipeline Trade History
  et Order History, 5 patterns, 4 profils, bridge contextuel
- Pipeline d'import CSV/XLSX V4 : format-detector, grid-grouper, binance_order,
  order-analyzer, SheetJS vendorisé
- Structure payload complète : ~40 clés, source de vérité unique

**Infrastructure locale**
- Repository GitHub : `antoniolisci/Cameleon-Engine`
- Zéro dépendances npm, zéro build step, ES modules natifs
- Serveur local via `serve-local.ps1`
- localStorage structuré via `storage.js` (15 clés, 0 données sensibles)
- Hardening sécurité partiel : git-filter-repo, innerHTML 0 élévation,
  setHtml() supprimé, debug surface réduite

**Documentation et tests**
- Écosystème de documentation complet : manifeste, doctrine, architecture,
  audit produit, plans V1→V4, validation terrain
- Phase 4 complète : 4157 trades réels validés, 0 crash, 0 NaN, 0 freeze
- Stress tests SYN-001→SYN-006 validés
- 4 datasets réels anonymisés REAL_001→REAL_004 documentés

**Identité visuelle et UX**
- Direction UX établie : 4 zones narratives, un seul point de vérité visuel
- Réduction V1 complète : 13 patches appliqués, cockpit épuré
- Grammaire visuelle définie : palette, mouvement, typographie
- Vocabulaire interdit documenté, voix du cockpit stabilisée

### Ce qui n'existe pas encore

**Le produit public**
- Aucun onboarding utilisateur. Aucun parcours de découverte.
- Aucune landing page. Aucune présence publique.
- Aucun utilisateur extérieur actif.
- Aucun test réel avec des traders indépendants.

**L'infrastructure**
- Aucun backend. Architecture localStorage uniquement.
- Aucune authentification. Aucune gestion d'utilisateurs.
- Aucune persistance distante. L'historique disparaît avec le navigateur.
- Aucune télémétrie. La santé du produit est immesurable.
- Aucun système de sauvegarde externe.

**Le modèle économique opérationnel**
- Aucun système de paiement intégré.
- Aucune version premium définie fonctionnellement.
- Aucune infrastructure de facturation.
- Aucun processus d'upgrade défini.

**La mémoire comportementale longue durée**
- Le cap FIFO à 50 sessions détruit l'historique que V2 nécessitera.
- Aucune segmentation temporelle. Aucune lecture multi-périodes.
- Le plancher analytique LS-1→LS-4 non corrigé limite la profondeur V2.

**L'écosystème**
- Les satellites (TAO Atlas, Macro Engine) n'existent pas.
- Aucune communauté. Aucun canal de feedback structuré.
- Aucun système d'acquisition, même minimal.

---

## 3. Phases officielles du projet

Les phases qui suivent sont hiérarchiques. Une phase ne s'ouvre pas avant que
la précédente soit suffisamment stable. Aucune phase n'a de délai fixé —
elles ont des critères de maturité.

---

### PHASE 0 — Fondation cognitive
*Phase actuelle*

**Objectif :** établir une base doctrinale, architecturale, et analytique
suffisamment solide pour que le reste du projet s'y construise sans la détruire.

**Pourquoi elle existe :** un produit déployé sans doctrine claire finit par
être piloté par les demandes utilisateurs, les métriques de vanité, et les
opportunités perçues. La Phase 0 est le moment où ces pressions ne s'appliquent
pas encore — et c'est la seule fenêtre pour construire l'ossature.

**Ce qui appartient ici :**
- stabilisation du manifeste et de la doctrine opérationnelle
- réduction UX et épuration de l'interface
- pipeline comportemental et d'import validés sur données réelles
- documentation interne cohérente et maintenue
- identification des contradictions doctrinales avant qu'elles se matérialisent

**Ce qui ne doit pas encore arriver :**
- ouverture à des utilisateurs extérieurs
- optimisation de conversion ou d'acquisition
- développement de l'infrastructure distante
- construction des features V2 (segmentation, mémoire comportementale)
- définition d'un plan de lancement

---

### PHASE 1 — Cockpit V1 stable
*Prochaine phase*

**Objectif :** un cockpit utilisable par quelques traders sérieux, stable,
cohérent, lisible — sans être public, sans être scalable, sans être optimisé
pour la croissance.

**Pourquoi elle existe :** avant de montrer le produit à des utilisateurs
extérieurs, il doit fonctionner de façon fiable sur ses propres fondations.
La Phase 1 résout les problèmes de finition sans ajouter de complexité.

**Ce qui appartient ici :**
- première session utilisateur claire et sans friction technique
- rendu comportemental lisible sans connaissance de l'architecture interne
- confiance d'exécution visible et interprétable
- journal fonctionnel et exploitable
- couche de sécurité minimale viable (CSP, MIME, debug conditionné)
- résolution des contradictions critiques identifiées dans l'audit (C1, C3)
- mise à jour de CLAUDE.md pour refléter la persistance TTL V4.2

**Ce qui ne doit pas encore arriver :**
- backend ou infrastructure distante
- système de paiement ou de premium
- ouverture publique
- recrutement d'utilisateurs à grande échelle
- features de segmentation temporelle V2

---

### PHASE 2 — Infrastructure réelle

**Objectif :** quitter l'architecture localStorage-only pour une infrastructure
minimale qui rend le produit utilisable hors d'un ordinateur local et qui permet
de mesurer sa propre santé.

**Pourquoi elle existe :** le produit ne peut pas rester sur une architecture
qui détruit son propre historique, qui ne peut pas mesurer la rétention,
et qui ne survit pas à un changement de machine.

**Ce qui appartient ici :**
- externalisation via mini-PC ou hébergement léger
- backend minimal : authentification, persistance, sauvegardes
- architecture serveur légère et souveraine (priorité : contrôle, pas échelle)
- sécurité de base sur les données persistées
- télémétrie minimale pour mesurer la rétention à 12 mois
- intégrations N8N/API si utiles à la fonction principale — pas pour l'écosystème

**Ce que cette phase ne fait pas :**
- scalabilité. L'infrastructure supporte le cockpit, pas le contraire.
- communauté ou réseau social.
- monétisation avant que le produit soit stable sur cette infrastructure.

---

### PHASE 3 — Test réel contrôlé

**Objectif :** confronter le produit à 20–30 traders sérieux pendant 60 jours.
Observer ce qui se transmet, ce qui se comprend, ce qui produit de la valeur,
ce qui ne survit pas au contact du réel.

**Pourquoi elle existe :** la doctrine est construite en chambre. Elle n'a pas
été confrontée à des utilisateurs indépendants. Cette phase est la première
validation externe — pas un lancement.

**Ce qui appartient ici :**
- sélection par invitation directe : traders actifs, profil praticien
- zéro communication publique pendant le test
- observation structurée : compréhension, retour volontaire, valeur perçue,
  points de décrochage, demandes récurrentes
- documentation honnête des résultats, y compris les échecs
- confrontation des observations à la doctrine — pas l'inverse

**Ce que cette phase n'est pas :**
- un lancement. Un test.
- une validation de croissance. Une lecture de la transmission.
- une occasion d'itérer rapidement sur les demandes utilisateurs.

**Signal de réussite :** des utilisateurs reviennent sans push, nomment
spontanément une transformation dans leur façon de travailler, et ne demandent
pas majoritairement ce que le produit refuse d'être.

**Signal d'échec :** personne ne comprend le produit sans aide externe,
le calme est perçu comme du vide, toutes les demandes poussent vers la dilution.

---

### PHASE 4 — Doctrine de transmission finale

**Objectif :** après confrontation au réel, définir une doctrine de transmission
canonique et une présence publique cohérente avec ce qui a été observé.

**Pourquoi elle n'est pas avant :** la doctrine de transmission actuelle est
provisoire par construction. Elle ne peut devenir canonique que si les observations
terrain la confirment — ou doit être révisée si elles la contredisent.

**Ce qui appartient ici :**
- révision et finalisation de la doctrine de transmission
- structure de landing ou de présentation publique minimale
- stratégie éditoriale cohérente avec la doctrine (pas de contenu dopamine,
  pas de promesse de performance)
- clarification publique du premium : ce qu'il approfondit, pas ce qu'il accumule
- wording public stabilisé et conforme à la grammaire du cockpit

**Ce qui ne doit pas encore arriver ici :**
- acquisition payante
- optimisation de conversion à grande échelle
- ouverture communautaire

---

### PHASE 5 — Produit vivant à long terme

**Objectif :** une évolution lente, cohérente, durable sur plusieurs années.
Pas une croissance. Un approfondissement.

**Ce qui appartient ici :**
- mémoire comportementale longue durée (après correction des LS-1 à LS-4)
- segmentation temporelle des lectures comportementales
- lecture de trajectoire comportementale multi-périodes
- infrastructure progressive : sauvegardes, résilience, souveraineté des données
- premium clarifié et opérationnel
- protection de la doctrine sur la durée : chaque release passe les 13 questions
- confiance utilisateur accumulée sur plusieurs années d'usage

**Ce que cette phase n'est pas :**
- une hypercroissance. Une présence stable.
- un pivot. Un approfondissement.
- un écosystème saturé. Un produit qui reste lui-même.

---

## 4. Ce qui ne doit pas arriver maintenant

### Scaling prématuré

Le produit n'a pas d'utilisateurs réels. Optimiser pour la croissance avant
de comprendre ce qui fonctionne est une consommation de ressources sans signal
de retour. Le scaling prématuré ne fait pas croître un produit — il amplifie
ses problèmes non résolus.

### Paid acquisition

Amener des utilisateurs via de la publicité payante avant que la Phase 3 ait
confirmé ce que le produit transmet et à qui il parle est une dépense aveugle.
Le résultat probable est un taux de décrochage élevé sur des utilisateurs
mal qualifiés et une pression pour modifier le produit dans leur direction.

### Infrastructure complexe trop tôt

Construire un backend robuste, une architecture distribuée, ou des intégrations
API avancées avant que le produit soit stable en Phase 1 inverse la priorité.
L'infrastructure doit servir le cockpit — pas le précéder. Une infrastructure
sans produit clair finit en complexité sans valeur.

### Accumulation de features

Chaque feature ajoutée avant que les fondations soient stables augmente la dette
de cohérence. Les demandes raisonnables s'accumulent. Chaque ajout semble justifié
isolément. La somme produit un produit qui ne ressemble plus à rien. La Phase 0
est précisément le moment où il faut refuser — pas céder.

### Lancement public

Ouvrir le produit au public avant la Phase 3 signifie confronter un produit
non testé à des utilisateurs non sélectionnés dans un espace non contrôlé.
Le résultat probable est des demandes incompatibles avec la doctrine, une pression
pour modifier l'identité, et une réputation construite sur une version immature.

### Construction de communauté

Une communauté sans produit stable devient le produit. Elle crée des attentes,
des comparaisons, des dynamiques sociales qui contredisent directement le principe
de miroir individuel. La communauté ne peut être envisagée qu'après que le produit
ait prouvé sa valeur individuelle — pas avant.

### Sur-conceptualisation doctrinale

Produire des documents de doctrine, d'audit, d'orientation au-delà du nécessaire
est elle-même une forme de dispersion. Ce document est le dernier document
stratégique justifié avant l'entrée en Phase 1. Au-delà, le travail est dans
le produit — pas dans la documentation.

---

## 5. Actifs réels du projet

La valeur du projet n'est pas uniquement dans le code. Elle est dans un ensemble
d'actifs qui ne sont pas copiables rapidement — et qui se renforcent mutuellement
avec le temps.

**La doctrine.** Un corpus cohérent qui contraint les décisions futures et protège
le produit contre sa propre dilution. Rare dans les outils de trading.

**La grammaire comportementale.** Un vocabulaire précis et stable pour nommer
les états du trader, les états du marché, et leur synthèse. Ce vocabulaire est
un actif de communication autant qu'un actif technique.

**La structure payload.** Une source de vérité unique (~40 clés) qui organise
toute la logique décisionnelle. Solide, testée, extensible sans réécriture.

**La friction intelligente.** Un concept rare, cohérent à tous les niveaux —
philosophique, architectural, numérique. Difficile à copier sans le substrat
doctrinal complet.

**La philosophie de réduction.** Un principe actif qui s'oppose à la tentation
permanente d'ajouter. Dans un marché où tous les produits s'épaississent,
la réduction est une position défendable et différenciante.

**La cohérence d'identité.** Le concept de "présence calme" traverse tous les
documents, toutes les décisions, toute l'architecture. Cette cohérence
cross-couche est exceptionnellement rare dans des produits à ce stade de maturité.

**La qualité d'écriture.** Le cockpit a une voix précise et stable. Cette voix
est un actif — elle produit de la confiance et de la reconnaissance sur le long
terme, et elle est difficile à imiter sans la doctrine qui la sous-tend.

Ces actifs ne disparaissent pas avec un pivot ou une réorientation technique.
Ils s'accumulent et se renforcent avec chaque décision cohérente.

---

## 6. Risques réels du projet

### Dispersion

C'est le risque le plus immédiat. Le projet peut simultanément travailler sur
la doctrine, l'architecture, l'infrastructure, les satellites, la communauté,
la monétisation — et ne rien terminer. La dispersion ne se présente pas comme
un problème. Elle se présente comme des opportunités raisonnables en parallèle.

### Conceptualisation sans fin

Produire des documents fondateurs est productif jusqu'à un certain point.
Au-delà, c'est une substitution au travail concret. Le projet peut rester en Phase 0
indéfiniment en continuant à affiner la doctrine au lieu de confronter le produit
au réel.

### Scaling prématuré

Si des utilisateurs arrivent trop tôt, avant que la Phase 1 soit stable,
les retours créeront une pression pour modifier le produit dans des directions
incompatibles avec la doctrine. Plus les utilisateurs sont nombreux et peu qualifiés,
plus la pression est forte.

### Dilution doctrinale

Chaque décision raisonnable qui s'écarte légèrement de la doctrine est un précédent.
Les précédents s'accumulent. Six mois plus tard, le produit a changé de nature
par accumulation de décisions raisonnables. La doctrine existe précisément pour
résister à cette accumulation — mais sa résistance dépend de son application
systématique.

### Complexité analytique sans interprétabilité

Le module comportemental est techniquement sophistiqué. Mais les résultats sur
données réelles incluent des artefacts structurels (LS-1 à LS-4) que l'utilisateur
ne peut pas distinguer de signaux comportementaux réels. Un score de 15 est présenté
sans le contexte qui permettrait de savoir s'il est bon, mauvais, ou un plancher
déterministe. La sophistication sans interprétabilité produit de la confusion,
pas de la valeur.

### Pression économique tardive

Si le produit entre en Phase 3 ou 4 sans avoir résolu la mesurabilité de sa santé
économique, toute pression de conversion deviendra une urgence. Les urgences
produisent des décisions incompatibles avec la doctrine.

### Fatigue

Un produit construit sur une longue durée, sans retour extérieur régulier,
produit de la fatigue de jugement. La fatigue rend les décisions de court terme
plus attractives que les décisions de long terme cohérentes.

### Perte de la voix auteur

La voix du cockpit est un actif. Elle peut se diluer par accumulation de rédactions
pressées, de wording emprunté à d'autres registres, ou de concessions sur la
grammaire définie. La voix se protège par relecture active — pas seulement
par définition en amont.

### Produit trop contemplatif

Le silence est une feature protégée. Mais un produit qui ne communique pas sa valeur
à un utilisateur qui le découvre pour la première fois ne transmet pas — il attend.
L'équilibre entre présence calme et intelligibilité immédiate est une tension
active qui demande une attention continue.

---

## 7. Horizon réaliste à long terme

### Ce que Caméléon n'est probablement pas

Caméléon n'est probablement pas un projet de capital-risque. Son architecture
de valeur — réduction, profondeur, présence calme, relation longue durée —
est fondamentalement incompatible avec les critères de croissance rapide
que le capital-risque exige.

Ce n'est probablement pas un produit grand public. Sa proposition de valeur
nécessite un utilisateur qui sait déjà ce qu'est la lecture comportementale,
qui comprend que la friction n'est pas un bug, et qui n'attend pas de signaux.
Ce profil est rare par définition.

Ce n'est pas un produit à hypercroissance. La confiance se construit lentement.
La rétention longue durée ne se crée pas en quelques semaines.

### Ce que Caméléon peut réalistement devenir

Un produit indépendant durable. Avec une base d'utilisateurs petite,
fidèle, et qui nomme une valeur précise — "je vois mieux qu'avant."

Un outil comportemental rare dans un marché saturé d'outils indifférenciés.
La différenciation par la réduction est tenable à long terme si elle est maintenue.

Un logiciel artisanal rentable sur une petite échelle. Quelques centaines
d'utilisateurs payants durablement, une infrastructure légère, une doctrine
qui protège la cohérence — c'est un modèle viable et rare.

Un environnement cognitif défendable. La friction intelligente, le bridge
Order→Trade History, la cohérence cross-document — ces actifs composent
un avantage concurrentiel réel si ils sont maintenus.

### Le modèle probable

Croissance lente. Rétention haute. Échelle limitée. Cohérence forte.

Ce n'est pas un défaut de modèle. C'est une conséquence directe de ce que
le produit est — et un choix cohérent avec sa doctrine.

---

## 8. Règle d'orientation finale

**Le produit d'abord.** Aucune décision d'infrastructure, d'acquisition, ou
de monétisation avant que Phase 1 soit stable.

**L'infrastructure au service du cockpit.** Jamais l'inverse. Jamais une
architecture qui précède et contraint le produit.

**La transmission après confrontation au réel.** La doctrine de transmission
ne devient canonique qu'après Phase 3. Pas avant.

**La croissance uniquement si la doctrine survit.** Si une décision de croissance
exige une dérogation à un interdit absolu, c'est la décision de croissance
qui est rejetée — pas l'interdit.

**La réduction avant l'expansion.** Toute phase de consolidation est préférable
à une phase d'expansion prématurée. Un produit plus petit et plus cohérent
vaut plus qu'un produit plus large et plus dilué.

**La cohérence avant l'opportunité.** Les opportunités qui nécessitent un
compromis doctrinal ne sont pas des opportunités pour ce produit. Elles sont
des occasions de vérifier que la doctrine tient.

---

*Créé le 2026-05-19. Document d'orientation — à relire avant toute décision
de phase suivante.*
*Références : `docs/manifesto-cameleon-engine.md`,
`docs/product/doctrine-cameleon-profondeur-viabilite.md`,
`docs/product/audit-coherence-doctrinale-2026-05-19.md`*
