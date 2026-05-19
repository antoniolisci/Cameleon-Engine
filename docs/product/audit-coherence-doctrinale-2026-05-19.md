# Audit de cohérence doctrinale — Caméléon Engine

**Date :** 2026-05-19
**Statut :** document d'audit ponctuel — non canonique, non prescriptif.
*Ce document identifie des contradictions et tensions. Il ne les résout pas.
Les résolutions requièrent un arbitrage explicite.*

**Documents analysés :**
- `docs/manifesto-cameleon-engine.md` (philosophique, fondateur)
- `docs/product/doctrine-cameleon-profondeur-viabilite.md` (opérationnel, contraignant)
- `docs/audit-produit-architecture-cognitive.md` (UX/cognitif, V1)
- `docs/plan-reduction-v1.md` (technique, 13 patches)
- `docs/plan-v2.md` (implémentation confiance d'exécution)
- `CLAUDE.md` (contrat de développement)
- Résultats Phase 4 / Architecture V4.5

---

## 1. Contradictions directes

### C1 — "Éphémère par design" vs. persistance V4

**CLAUDE.md :** *"The behavioral analysis module is explicitly ephemeral — no persistence by design."*

**Architecture V4.2 :** `orderStrategyProfile` persist avec TTL 7 jours dans `behaviorRepo`.
`guardLevel` + `guardLevelUpdatedAt` persistent dans localStorage.
**Plan V2 :** `BHV_DELTA` modifie la confiance d'exécution basé sur l'état comportemental passé.

C'est une contradiction de contrat, pas de degré. Le document de développement dit
"rien ne persiste." L'implémentation persiste deux clés critiques avec effet moteur.
Aucun document n'a été mis à jour pour reconnaître ce changement.
Le CLAUDE.md est techniquement faux depuis V4.2.

---

### C2 — "Le miroir, jamais le juge" vs. les labels comportementaux

**Manifeste (VI) :** *"La zone comportementale est un miroir, pas un tribunal.
Elle restitue ce qu'elle voit, sans évaluation morale."*

**Implémentation :** les quatre profils sont **Discipliné / Réactif / Impulsif / Agressif**.

"Impulsif" et "Agressif" ne sont pas des descripteurs neutres en français.
Ils portent une valence morale. Un miroir reflète sans nommer — il ne dit pas
"tu es agressif." Le système fait précisément l'inverse : il nomme avec des mots
qui contiennent un jugement implicite. Ni la doctrine ni le manifeste
ne reconnaissent cet écart.

---

### C3 — "VALIDATION BLOCK" vs. vocabulaire interdit

**Manifeste (VIII) :** *"Le cockpit ne dit jamais : interdit, bloqué, suspendu,
verrouillé, refusé."*

**Moteur :** `tradingStatus` peut valoir `VALIDATION BLOCK`.

Le terme "BLOCK" figure dans la liste explicite du vocabulaire à bannir.
Il est utilisé dans le système interne. Même s'il n'est pas visible dans l'UI finale,
il existe dans le payload et dans la logique. Un futur développeur qui lit le payload
voit "VALIDATION BLOCK" et repart avec une lecture qui contredit le manifeste.

---

### C4 — "Relation de longue durée" vs. cap FIFO à 50 sessions

**Manifeste (IV) :** *"Le produit est conçu pour des relations de plusieurs années."*

**Storage :** `CE_journal_entries_v1` plafonné à 50 entrées, FIFO.
`CE_backups_v1` plafonné à 50 snapshots.

Un utilisateur de 3 ans perd ses sessions les plus anciennes en continu.
Le modèle de stockage détruit activement l'historique qui donnerait un sens
à "relation de longue durée." Le roadmap V2 prévoit une "mémoire comportementale"
— mais la donnée que cette mémoire devrait exploiter est effacée par le cap.

---

### C5 — "Un seul point de vérité visuel" vs. 4 zones à présence permanente

**Audit produit :** *"La règle absolue : jamais deux verdicts forts simultanés
à l'écran. Un seul point de vérité visuel."*

**Audit produit, même document :** *"Zone Observation — présence permanente"*
et *"Zone Conscience — présence permanente mais discrète."*

"Présence permanente" de deux zones simultanées n'est pas compatible avec
"un seul point de vérité." La tentative de réconciliation ("mais discrète")
ne résout pas la contradiction — elle la nomme. "Discrète" n'a aucun seuil
définissable dans le document.

---

## 2. Tensions silencieuses

### T1 — La santé économique est unmeasurable avec l'architecture actuelle

**Doctrine (III) :** *"le taux de rétention à 12 mois [est le] seul indicateur pertinent."*

**Architecture :** local-only, zéro backend, zéro télémétrie, localStorage uniquement.

Le produit ne peut pas mesurer son propre indicateur de santé. Il n'y a aucune façon
de savoir combien d'utilisateurs sont actifs à 12 mois avec une architecture sans serveur.
La doctrine dit "mesure ça." L'architecture dit "tu ne peux pas." Cette tension est
silencieuse parce que la question de comment mesurer a été éludée en posant la métrique
sans l'instrument.

---

### T2 — "Interface maigrit" vs. valeur premium invisible

La combinaison de :
- Loi 1 (interface maigrit)
- Loi 5 (silence protégé)
- G5 (pas de dashboard)
- Loi 2 (freeware incarne l'identité)

...signifie que la version payante doit être plus profonde sans être visuellement
différente de la version gratuite. Un utilisateur qui évalue s'il doit payer 19€/mois
ne peut pas percevoir ce qu'il paie. La doctrine interdit tous les mécanismes
traditionnels de démonstration de valeur premium.

Ce n'est pas incohérent en soi — c'est une stratégie de conversion par expérience.
Mais cette stratégie n'est jamais nommée comme telle.

---

### T3 — Plafond analytique Phase 4 vs. roadmap V2

**Phase 4 :** *"score plancher ~15 est déterministe sur profil multi-actifs CV > 2
longue période — pas diagnostique."* Les LS-1 à LS-4 sont des propriétés structurelles
du moteur V1.

**Roadmap V2 :** "Segmentation temporelle — scoring par fenêtre glissante,"
"Mémoire comportementale — empreintes par période."

La segmentation temporelle sans corriger LS-1 à LS-4 produira plusieurs périodes
scorant chacune ~15-25. Ce n'est pas plus de profondeur — c'est la même profondeur
plafonnée, présentée en tranches. Loi 3 dit que le premium approfondit. Mais si
l'approfondissement se heurte à un plafond structurel, on accumule des artefacts,
pas de l'insight.

---

### T4 — Conversion sans acquisition

Doctrine Loi 6 : aucun mécanisme push, aucune relance, aucun pop-up.
La conversion se produit quand l'utilisateur décide.

Aucun document ne traite de comment les utilisateurs trouvent le produit.
L'anti-conversion doctrine gère la transition gratuit→payant. Elle présuppose
silencieusement que l'acquisition est résolue. C'est un angle mort total
dans le corpus doctrinal.

---

## 3. Ambiguïtés dangereuses

### A1 — "Profondeur" n'est jamais définie opérationnellement

Loi 3 : "le premium approfondit, il n'accumule pas." C'est le principe central
de la distinction gratuit/payant. Mais "profondeur" n'est définie nulle part.

Qu'est-ce qui qualifie comme "plus profond" ?
- Plus de périodes temporelles ? (Phase 4 montre un plafond structurel)
- Plus de patterns détectés ? (Ce pourrait être de l'accumulation)
- Plus de précision sur les mêmes données ? (Défendable)
- Plus de types de données ? (Horizontal, pas vertical)

Sans définition opérationnelle, n'importe quelle feature peut être argumentée
"profondeur" ou "accumulation" selon qui parle. C'est l'ambiguïté qui sera
exploitée en premier lors du design premium.

---

### A2 — Le seuil du "silence" n'est pas mesurable

Loi 5 : "Tout ajout qui réduit le silence doit être justifié par une valeur
réelle et proportionnelle."

La section "Signaux de dilution" liste "le nombre d'éléments visibles simultanément
augmente" — mais ne donne pas le nombre actuel, pas de valeur maximale acceptable,
pas de méthode de mesure. Le silence est protégé sans être défini.
On ne peut pas détecter sa dégradation progressive.

---

### A3 — La hiérarchie entre manifeste et doctrine n'est pas établie

**Manifeste (XIV) :** *"Toute nouvelle fonctionnalité [...] peut être validée
contre ce manifeste."*

**Doctrine (Statut) :** *"ce document prévaut."*

Les deux documents revendiquent l'autorité finale. Ils divergent sur :
- Les satellites (manifeste : les accepte avec doctrine commune ; doctrine : ne les mentionne pas)
- La précision économique (manifeste cite 19€/mois ; doctrine ne cite aucun prix)
- Le niveau d'abstraction des interdictions

Quand les deux sont cités dans un arbitrage, aucun mécanisme de résolution n'existe.

---

### A4 — "Friction toujours contournable" vs. 5 secondes en trading

G6 : "La friction est toujours contournable."

Implémentation : 5000ms de délai à confiance minimale.

5 secondes dans un contexte de trading spot peut être la différence entre une entrée
exécutée et une entrée manquée. Si la friction est calibrée pour faire manquer
l'entrée impulsive, elle atteint le même résultat pratique qu'un blocage sans en
avoir le nom. La doctrine dit "jamais de blocage." L'implémentation peut produire
un blocage de facto sans le nommer. Ce seuil n'est jamais discuté.

---

### A5 — Les satellites ne sont pas couverts par la doctrine

**Manifeste (XIV) :** *"Les deux satellites [...] suivent la même doctrine que le cœur."*

La doctrine ne mentionne pas les satellites. TAO Atlas est une tool d'analyse
de blockchain. Une analyse de blockchain sans données comparatives de portefeuilles
n'est pas très utile. Or "comparaison inter-utilisateurs" est un interdit absolu (G2).
TAO Atlas ne peut pas fonctionner normalement dans les contraintes de G2.

Ce n'est pas encore un problème — les satellites n'existent pas. Mais dès que
TAO Atlas sera développé, cette collision se matérialisera.

---

## 4. Risques futurs de collision

### R1 — H1 (CSP bloquant) × SheetJS

La roadmap sécurité liste H1 (implémentation CSP) comme bloquant. SheetJS parse
du XLSX — un format binaire. Certaines versions de SheetJS utilisent `eval()` ou
`new Function()` en interne, bloqués par CSP sans `unsafe-eval`. Si SheetJS
nécessite `unsafe-eval`, le choix devient : CSP strict sans XLSX, ou XLSX avec
CSP dégradée. Cette collision n'est documentée nulle part.

### R2 — Cap localStorage × mémoire comportementale V2

La roadmap V2 prévoit "mémoire comportementale — empreintes par période."
Cette feature nécessite l'historique des sessions. L'architecture actuelle efface
les sessions au-delà de 50 avec un cap FIFO. V2 behavioral memory ne peut pas
être construite sur une base de données qui se détruit elle-même.
Sans backend, cette collision est structurelle.

### R3 — "Score plancher ~15" × V2 temporal segmentation

Phase 4 montre que le plancher ~15 est déterministe sur multi-actifs longue période.
La segmentation temporelle V2 sans corriger LS-1 à LS-4 produira des segments
qui scoreront tous ~15-25. Plus de données, pas plus d'insight.
Loi 3 ("le premium approfondit") sera violée dans la réalité même si respectée
dans la forme.

### R4 — Anti-comparaison sociale × communauté potentielle

Le manifeste (XIV) mentionne "une dimension communautaire qui respecte la posture
mature" comme extension naturelle. G2 interdit "toute comparaison inter-utilisateurs."
Une communauté sans comparaison n'a pas de mécanique fonctionnelle évidente.
Ces deux positions sont en collision structurelle si la communauté est jamais
développée.

---

## 5. Doubles doctrines

### D1 — Deux modèles de croissance implicites

**Doctrine (Loi 7) :** croissance verticale — plus de profondeur sur les mêmes données.

**Manifeste (XIV) :** croissance horizontale — satellites (TAO Atlas, Macro Engine),
"modules de lecture supplémentaires (macro, sentiment)."

La croissance verticale et horizontale requièrent des architectures produit différentes.
Ces deux logiques coexistent sans réconciliation.

### D2 — Deux visions de la persistance comportementale

CLAUDE.md : éphémère. V4.2+ : persistent avec TTL. Les deux documents restent
canoniques dans leurs domaines respectifs sans que l'un ait explicitement remplacé
l'autre.

### D3 — Deux définitions du "verdict"

**Manifeste (V) :** le cockpit produit des "lectures," pas des verdicts.

**Moteur :** `NO TRADE`, `CORE ONLY`, `SNIPER READY`, `WAIT` — ce sont des directives,
pas des lectures. Ils disent quoi faire, pas ce qui est observé. "NO TRADE" n'est
pas une lecture. C'est un verdict.

### D4 — Deux précisions du modèle économique

**Manifeste (XIII) :** cite "19€/mois" et "accès gratuit limité."

**Doctrine (III) :** "le premium approfondit" — framing additif, sans prix cité.

Ces deux formulations ont des implications opérationnelles différentes. Sans update
protocol entre les deux documents, les divergences s'accumuleront.

---

## 6. Ce qui doit être hiérarchisé explicitement

La hiérarchie actuelle est implicite :

1. Manifeste (fondateur, philosophique)
2. Doctrine (opérationnel, contraignant)
3. Documents techniques (audit, plans)
4. CLAUDE.md (développement)

**Ce qui doit être décidé :**

- Si manifeste et doctrine se contredisent, lequel prévaut ? La doctrine est plus
  récente et plus stricte. Le manifeste est plus permissif sur les extensions. Aucun
  des deux ne le dit.
- Si une pression économique menace la viabilité, la doctrine dit-elle "mourir plutôt
  que diluer" ? Ni l'un ni l'autre ne tranche les conditions d'exception existentielles.
- Si CLAUDE.md dit "éphémère" et l'architecture dit "persistant avec TTL," lequel
  a priorité pour les décisions futures ? Non établi.

---

## 7. Ce qui nécessite intervention

**Fusionner ou désambiguïser :**
- "Ce que Caméléon n'est pas" existe dans le manifeste (II) et la doctrine (IV).
  Un seul document devrait l'avoir, avec renvoi depuis l'autre.
- Le modèle économique figure dans manifeste (XIII) et doctrine (III) avec
  formulations légèrement différentes. Sans update protocol, les divergences
  s'accumulent.

**Clarifier :**
- "Profondeur" : définir avec au moins 3 exemples concrets de ce qui qualifie
  et 3 exemples de ce qui ne qualifie pas.
- Le contrat de persistance comportementale : mettre à jour CLAUDE.md pour
  documenter que V4.2 a introduit une persistance TTL défensive et pourquoi.
- La hiérarchie manifeste/doctrine : un paragraphe dans la doctrine suffirait.

**Archiver et marquer :**
- `plan-reduction-v1.md` : les 13 patches sont tous exécutés. Sans marqueur
  "complété", il apparaît comme roadmap active.
- `audit-produit-architecture-cognitive.md` : écrit pré-V2, certaines recommandations
  sont implémentées, d'autres dépassées par V3/V4. Nécessite un état explicite
  par section.
- `archive/ROADMAP_CAMELON_ENGINE_backup.md` : l'archivage physique ne suffit pas —
  sa grammaire (urgence, émojis, majuscules) est incompatible avec la doctrine et
  peut contaminer le vocabulaire de futurs contributeurs.

---

## 8. Risques structurels de dérive produit

**Trop contemplatif**

Silence protégé + zéro CTA + interface maigrit + conversion jamais pilotée = produit
qui ne s'explique pas aux nouveaux utilisateurs. L'onboarding est inexistant par
doctrine. Si le produit ne peut pas démontrer sa valeur lors du premier contact,
la friction d'acquisition devient la barrière principale. Ce n'est pas incohérent
— c'est un pari sur le bouche-à-oreille — mais ce pari n'est jamais nommé comme tel.

**Analytiquement sophistiqué, interprétativement opaque**

Le module comportemental (V4.5) accumule de la sophistication. Mais Phase 4 a
montré que les résultats sur données réelles sont souvent des artefacts structurels
(LS-1 à LS-4) que l'utilisateur ne peut pas distinguer de signaux comportementaux
réels. Un score de 15 est présenté sans le contexte qui permettrait de savoir s'il
est bon, mauvais, ou un plancher déterministe. La sophistication analytique sans
cadre interprétatif accessible produit de la confusion, pas de la profondeur.

**Économiquement fragile par cécité instrumentale**

La doctrine définit les bons indicateurs de santé (rétention 12 mois) mais
l'architecture rend ces indicateurs immesurables. Un produit peut respecter toute
sa doctrine et mourir sans le savoir — parce que l'unique métrique qui compte
ne peut pas être lue avec l'architecture actuelle.

---

## 9. Ce qui est solide

### La friction intelligente

C'est le concept le plus cohérent du corpus. Fondé philosophiquement (autonomie
préservée), architecturalement (toujours bypassable), numériquement (0/1500/3000/5000ms
lié à la confiance). Rare dans le marché des trading tools. Difficile à copier sans
le substrat philosophique et l'implémentation précise. Moat réel.

### Le bridge Order→Trade History

"Order History révèle l'intention, Trade History observe les conséquences" est une
distinction analytiquement juste et architecturalement défendable. L'implémentation
(unidirectionnelle, défensive, TTL-based) est documentée, bornée, et cohérente avec
"contextualise, ne réécrit pas." Pas de concurrent connu avec cette distinction.

### La cohérence cross-document de "présence calme"

Ce concept traverse tous les documents : manifeste, doctrine, audit produit, plan
de réduction, architecture. Peu de produits atteignent ce niveau de cohérence
d'identité de la philosophie jusqu'à l'implémentation. C'est la vraie différenciation
de positionnement — mais fragile : un seul élément discordant (une notification,
un pop-up, un dashboard ajouté "temporairement") suffit à briser la perception.

### La posture anti-dashboard dans un marché qui va dans l'autre sens

Le marché des outils trading converge vers plus de dashboards, plus d'indicateurs
simultanés. Caméléon va dans la direction exactement opposée. Le contraste est une
position défendable tant qu'elle est tenue. La question n'est pas si cette position
est bonne — elle l'est. La question est si elle peut être défendue sous pression
continue.

---

## 10. Conclusion sévère

### Ce qui casse

Le module comportemental V2 (segmentation temporelle, mémoire par période) sera
construit sur un plancher analytique structurel non résolu. Les features deepening
de V2 vont multiplier les artefacts LS-1 à LS-4 au lieu de les dépasser.
L'utilisateur paiera pour plus de profondeur et recevra plus de données sans plus
d'insight. C'est le scénario où Loi 3 ("le premium approfondit") est respectée
dans la lettre mais violée dans la réalité.

La conversion reste impossible à optimiser sans telemetry. Le produit opérera avec
la métrique "rétention 12 mois" qu'il ne peut pas lire.

Le contrat CLAUDE.md ("éphémère par design") non mis à jour crée une désinformation
pour tout futur développeur qui lit la codebase sans connaître V4.2.

### Ce qui tient

La friction intelligente est robuste si les seuils sont maintenus. L'identité
"présence calme" est tenue si les guardrails de la doctrine sont appliqués
mécaniquement. Le bridge Order→Trade est un actif analytique réel si les LS sont
documentées pour l'utilisateur final.

### Le risque systémique central

La doctrine dit "la viabilité par la valeur, pas par le volume." C'est correct.
Mais la valeur perçue par un utilisateur existant ne se transforme en viabilité
économique que si :

1. Les utilisateurs restent (mesurable seulement avec un backend)
2. Les utilisateurs payent (mesurable seulement avec un backend)
3. De nouveaux utilisateurs trouvent le produit (non adressé par aucun document)

Les trois conditions de viabilité reposent sur une infrastructure qui n'existe pas,
ou sur des mécanismes que la doctrine interdit.

### La question que les documents n'adressent pas

Comment un produit qui ne se vante pas, ne push pas, ne compare pas, ne notifie pas,
ne se montre pas en version premium, ne mesure pas sa propre santé — comment ce
produit trouve-t-il et garde-t-il assez d'utilisateurs pour exister dans 36 mois ?

Ce n'est pas une critique de la doctrine. C'est le gap qu'elle laisse ouvert.

---

*Produit le 2026-05-19. Audit ponctuel — non canonique.*
*Ne modifie aucun document existant. Aucune résolution proposée ici.*
*Les arbitrages sont à traiter séparément, décision par décision.*
