# PATTERN REFLECTION DOCTRINE V1

**Niveau :** N2 — Doctrine de couche
**Date :** 2026-06-16
**Statut :** Référence active
**Corpus de référence :** `memory_doctrine_v1.md` · `lecture_not_equal_action.md` · `IDENTITY_V1.md` · `cameleon_engine_language_system_v1.md`

---

## PRÉAMBULE — STATUT ET AUTORISATION

Ce document est une extension de `memory_doctrine_v1.md`. Il ne le remplace pas. Il développe deux opérations qui dérivent de *Comparer* et *Décrire* — telles que définies dans memory_doctrine_v1.md §I — et les spécialise pour la couche longitudinale de la boucle mémoire.

**Relation aux trois opérations autorisées (memory_doctrine_v1.md §I) :**

| Opération memory_doctrine V1 | Forme spécialisée dans PRD V1 |
|---|---|
| Retenir | Inchangée — conserver les états déclarés |
| Comparer | Étendue → *Refléter le motif* (comparaison structurelle sur une fenêtre) · *Certifier le changement* (comparaison entre deux fenêtres) |
| Décrire | Étendue → description de configurations récurrentes et de différences inter-fenêtres |

Ces extensions sont compatibles avec N0 (*"rendre la décision lisible sans la prendre"*) et N1 (*"conservateur de mémoire déclarative"*). Elles ne créent aucune opération de prescription, de résolution, ou de fusion de sources.

**PRD V1 entre en vigueur à sa création. La mise à jour de memory_doctrine_v1.md §IV est une tâche de synchronisation du corpus, non une condition préalable à la validité de ce document.**

Ce document doit être référencé dans memory_doctrine_v1.md §IV comme extension autorisée lors de sa prochaine mise à jour.

---

## I. DÉFINITIONS CANONIQUES

### Les cinq concepts à distinguer

**Événement**

Occurrence singulière, ponctuelle, non répétée.

> *"Au snapshot N, l'opérateur était en FOMO."*

Un événement est localisé dans le temps. Il ne peut pas être réfléchi comme motif. Il peut être décrit (Décrire) et conservé (Retenir).

---

**État**

Condition comportementale déclarée à un moment précis. Unité atomique de la boucle mémoire.

> *"overtradingLevel = 4 (Dérive) — snapshot 2026-06-15 14h32"*

Un état est une lecture instantanée. Il n'implique aucune durée, aucune tendance, aucune cause. Il décrit ce qui a été déclaré, au moment où cela a été déclaré.

---

**Séquence**

Ordonnancement temporel d'états consécutifs. La séquence décrit l'ordre sans identifier de structure récurrente.

> *"Snapshot N : Friction (3) → Snapshot N+1 : Dérive (4) → Snapshot N+2 : Dérive (4)"*

Une séquence est observable et descriptible. Elle n'est pas encore un motif — elle peut en être une instance, ou une occurrence isolée.

---

**Motif**

Régularité structurelle observable dans plusieurs séquences distinctes, dépassant la probabilité d'une occurrence aléatoire.

Un motif requiert trois conditions simultanées :

1. **Récurrence** — la même configuration d'états a été observée dans plusieurs séquences distinctes, en nombre suffisant pour dépasser une occurrence aléatoire probable. Le seuil minimal est un paramètre d'implémentation (N5) — mais le principe est N2 : le moteur ne déclare aucun motif en dessous du seuil.
2. **Critère de similarité défini a priori** — ce qui compte comme "la même configuration" est défini avant l'observation, pas sélectionné après pour maximiser la saillance du résultat.
3. **Fenêtre temporelle explicite** — la récurrence est comptée dans une fenêtre définie, avec des bornes déclarées.

> *"La transition Friction (3) → Dérive (4) a été observée 4 fois dans les 30 derniers snapshots."*

**Ce qu'un motif est :** une structure récurrente dans des données temporellement bornées.

**Ce qu'un motif n'est pas :**
- Une cause. Le motif décrit une structure récurrente — pas pourquoi elle existe.
- Un trait de caractère. Le motif appartient aux données de la fenêtre — pas à l'identité de l'opérateur.
- Un verdict. Le motif n'implique pas ce que l'opérateur doit faire.

---

**Changement**

Différence structurelle observable entre les propriétés d'une série dans deux fenêtres temporelles distinctes.

Un changement requiert :

1. **Deux fenêtres définies a priori** — W1 (fenêtre antérieure) et W2 (fenêtre récente). Les bornes sont fixées avant la comparaison, pas après. W2 doit contenir les snapshots les plus récents de la série disponible si l'objectif est de certifier un changement en lien avec l'état comportemental récent de l'opérateur.
2. **Un critère de différence défini a priori** — ce qui constitue une différence structurelle significative est défini avant la comparaison.
3. **Un seuil d'observation minimum dans chaque fenêtre** — le moteur ne certifie aucun changement si l'une ou l'autre des fenêtres est en dessous du seuil minimal de snapshots.

**Ce qu'un changement n'est pas :** une amélioration. La direction normative de l'échelle (Ancré = bas, Rupture = haut) existe. Le moteur ne l'utilise pas pour qualifier le changement. Il constate la différence de distribution. L'opérateur décide de ce qu'elle signifie pour lui.

---

## II. L'OPÉRATION "REFLÉTER LE MOTIF"

### Définition

Refléter le motif est une forme spécialisée de *Comparer* et *Décrire* (memory_doctrine_v1.md §I) appliquée à la dimension longitudinale de la série comportementale.

Le moteur :
1. Parcourt la série de snapshots dans la fenêtre définie.
2. Identifie les configurations d'états récurrentes selon le critère de similarité structurelle défini a priori.
3. Compte les occurrences de chaque configuration dans la fenêtre.
4. Produit une description factuelle de chaque configuration et de sa fréquence.

C'est tout. Ces quatre étapes constituent l'opération complète.

**Ces opérations s'appliquent exclusivement aux données comportementales déclarées. Elles ne peuvent pas être combinées avec des données de lecture marché : score, état marché, niveau d'engagement. Référence : memory_doctrine_v1.md §II — Fusionner les sources.**

### Ce que le moteur produit

- La configuration structurelle identifiée (niveaux et labels, sans qualification de la configuration elle-même).
- Le nombre d'occurrences dans la fenêtre.
- La fenêtre temporelle de l'observation (bornes explicites).

### Ce que le moteur ne produit jamais

- Une explication de la configuration.
- Une évaluation de la configuration.
- Un nom pour la configuration au-delà de sa description structurelle.
- Une recommandation dérivée de la configuration.
- Une prédiction de récurrence future.
- Une caractérisation de l'opérateur dérivée de la configuration.
- Une correction proposée à partir du motif identifié.

---

## III. L'OPÉRATION "CERTIFIER LE CHANGEMENT"

### Définition

Certifier le changement est une forme spécialisée de *Comparer* (memory_doctrine_v1.md §I) appliquée à deux fenêtres temporelles distinctes.

Elle compare les propriétés de distribution de la série comportementale entre W1 (fenêtre antérieure) et W2 (fenêtre récente) et produit une description factuelle de la différence observée.

La certification ne juge pas le changement. Elle le constate.

**Ces opérations s'appliquent exclusivement aux données comportementales déclarées. Elles ne peuvent pas être combinées avec des données de lecture marché : score, état marché, niveau d'engagement. Référence : memory_doctrine_v1.md §II — Fusionner les sources.**

### Définition de W1 et W2

**W1 — fenêtre antérieure :** ensemble de snapshots précédant W2, avec des bornes définies a priori.

**W2 — fenêtre récente :** ensemble de snapshots plus récents que W1. Si l'objectif est de certifier un changement en lien avec l'état comportemental récent, W2 doit inclure les snapshots les plus récents de la série disponible. W2 est une fenêtre du passé — elle n'est pas "le présent" mais elle en est la meilleure approximation dans la série historique.

### Ce que le moteur produit

Description factuelle de la différence de distribution entre W1 et W2, niveau par niveau.

### Ce que le moteur ne produit jamais

- Une évaluation du changement (mieux, moins bien, encourageant, préoccupant).
- Une explication du changement.
- Une prédiction de persistance du changement.
- Une recommandation basée sur le changement.

---

## IV. FRONTIÈRE : REFLÉTER ≠ EXPLIQUER

| | Refléter | Expliquer |
|---|---|---|
| Sujet de la phrase | La configuration · la transition · le niveau | L'opérateur · le marché · la cause |
| Verbe caractéristique | "a été observée", "représentait", "a été constatée" | "indique", "suggère", "révèle que", "est dû à" |
| Ce qu'il produit | Un fait daté et quantifié | Une inférence ou une attribution causale |
| Test | Vérifiable directement dans les données ? | Requiert une hypothèse extérieure aux données ? |

Un reflet est vrai ou faux uniquement en regardant les données. Une explication nécessite une hypothèse sur une cause extérieure. Le moteur ne produit que des reflets.

---

## V. FRONTIÈRE : CERTIFIER ≠ ÉVALUER

| | Certifier le changement | Évaluer l'amélioration |
|---|---|---|
| Objet | La série de données entre W1 et W2 | Le progrès de l'opérateur |
| Direction normative | Absente — la différence est constatée | Présente — une direction "mieux" est présupposée |
| Ce qu'il produit | Une différence structurelle observable | Un verdict sur la trajectoire de l'opérateur |
| Risque doctrinal | Fuite vers narration progressive | Violation directe R-M05 |

La présupposition normative est le critère de distinction central. *"Quelque chose a changé"* — certification autorisée. *"Tu as progressé"* — évaluation interdite.

---

## VI. FORMULATIONS — AUTORISÉES, LIMITES, INTERDITES

### Principe invariant

La formulation autorisée suit cette structure :

```
[Configuration décrite en termes de niveaux et labels, sans qualification]
a été observée [N] fois
dans [M] snapshots
de la fenêtre [bornes explicites].
```

Aucune clause causale. Aucune clause normative. Aucune clause de conséquence. Temps : passé de constat.

### Position sur les superlatifs

**Les superlatifs sont supprimés du périmètre V1.**

La formulation *"la configuration la plus fréquente"* constitue une hiérarchisation implicite des configurations — une forme de verdict que le moteur n'a pas autorité à produire en V1. La distribution brute des occurrences est présentée sans désigner de configuration dominante. L'opérateur observe la distribution et identifie lui-même ce qui lui paraît saillant.

---

### Exemples conformes

```
✅ "La transition Friction (3) → Dérive (4) a été observée 4 fois
   dans les 30 derniers snapshots (fenêtre 2026-06-01 — 2026-06-15)."

✅ "Le niveau 1 (Ancré) représentait 8 des 15 snapshots
   de la fenêtre 2026-06-01 au 2026-06-15."

✅ "Les niveaux 4 et 5 (Dérive, Rupture) n'ont pas été observés
   dans les 12 derniers snapshots."

✅ "La transition Veille Active (2) → Friction (3) a été observée 3 fois
   dans les 25 derniers snapshots."

✅ [Certification de changement]
   "Dans W1 (snapshots 1–20), le niveau 4 (Dérive) représentait
   6 occurrences sur 20.
   Dans W2 (snapshots 21–40), le niveau 4 représentait
   1 occurrence sur 20."
   Note : les deux fenêtres sont décrites au passé —
   elles sont toutes deux antérieures au moment de lecture.
```

### Exemples limites

```
⚠️  "Un motif a été identifié dans les données : la transition
    Friction (3) → Dérive (4) a été observée 4 fois sur 30 snapshots."
    → Le mot "motif" est utilisé comme descripteur de l'opération,
      pas comme propriété de l'opérateur.
      Acceptable si "motif" désigne la structure dans les données.
      Inacceptable si "motif" précède ou suit une caractérisation
      de l'opérateur ("votre motif", "ce motif vous concerne").

⚠️  "La distribution comportementale a changé entre W1 et W2."
    → "A changé" est directionnel mais non évaluatif.
      Acceptable uniquement si immédiatement suivi des données
      chiffrées qui décrivent le changement niveau par niveau.
      Inacceptable comme énoncé isolé.
```

### Exemples non conformes

```
❌ "Ce motif indique une tendance à la dérive sous pression."
    → "Indique" = inférence causale. "Tendance" = caractérisation.
      "Sous pression" = explication causale. Triple violation.

❌ "La configuration la plus fréquente sur cette période est
    Friction → Dérive."
    → Superlatif — supprimé en V1. Hiérarchisation implicite.

❌ "Une glissade vers la Dérive a été observée à plusieurs reprises."
    → "Glissade vers" = formulation directionnelle qualifiée. Interdit.
      Formulation neutre requise :
      "La transition vers le niveau 4 a été observée N fois."

❌ "La bascule Friction → Dérive représente un point de fragilité."
    → "Bascule" = qualification directionnelle.
      "Point de fragilité" = verdict diagnostic. Double violation.

❌ "Vous avez progressé entre W1 et W2."
    → Évaluation. Interdit.

❌ "Le motif Friction → Dérive mérite attention."
    → "Mérite attention" = prescription implicite.

❌ "Ces données suggèrent une difficulté récurrente en conditions
    de marché actif."
    → "Suggèrent" = inférence. "Difficulté récurrente" = diagnostic.
      "En conditions de marché actif" = causalité implicite.
      Triple violation, dont fusion avec lecture marché.

❌ "Votre motif comportemental dominant sur cette période est
    la dérive progressive."
    → "Votre motif" = propriété de l'opérateur. Interdit par R-P06.
      "Dominant" = superlatif évaluatif. Interdit en V1.
      "Dérive progressive" = caractérisation qualitative. Interdit.
```

---

## VII. FRONTIÈRES DU REFLET — QUAND IL DEVIENT VERDICT OU CONSEIL

### Quatre lignes à ne pas franchir

**Ligne 1 — Valeur assignée à la configuration**
Le moteur qualifie la configuration au-delà de sa description structurelle.
*"Cette transition est préoccupante"* → verdict. *"Cette transition a été observée 4 fois"* → reflet.

**Ligne 2 — Sujet grammatical = l'opérateur**
La phrase cesse de parler des données pour parler de l'opérateur.
*"Vous avez tendance à..."* → caractérisation. *"La transition X a été observée N fois"* → reflet.

**Ligne 3 — Clause d'implication**
La phrase contient une implication normative, même faible.
*"Cette configuration mérite attention"* → prescription implicite. *"Cette configuration a été observée"* → reflet.

**Ligne 4 — Synthèse**
Le moteur tire une conclusion à partir de plusieurs données.
*"L'ensemble de ces motifs indique..."* → verdict synthétique. *"Motif A : N fois. Motif B : M fois."* → reflets parallèles.

### Fuites vers Lecture → Action

**Fuite 1 — Fréquence élevée comme signal d'urgence**
*"7 fois sur 10"* est factuel. L'opérateur construit *"c'est presque systématique — je dois agir."*
Mitigation : pas de mise en forme différenciée selon la fréquence. Aucun seuil qualifié de "significatif."

**Fuite 2 — Charge normative des niveaux 4–5**
Toute configuration impliquant Dérive (4) ou Rupture (5) transportera une charge normative irréductible malgré un vocabulaire neutre. Cette fuite est de Catégorie 3 — inférence naturelle de l'opérateur, hors responsabilité du moteur.
Mitigation partielle : ancrage temporel systématique.

**Fuite 3 — Comparaison W1/W2 comme narration d'amélioration ou de dégradation**
Tout affichage avant/après crée une narration temporelle que l'opérateur interprète normativement.
Mitigation : présentation parallèle et non-ascendante des deux fenêtres. Aucune mise en forme qui oriente la lecture dans un sens.

**Fuite 4 — Descriptions de transitions comme mécanisme**
*"La transition Friction → Dérive"* décrit une direction de séquence. L'opérateur peut lire cette direction comme un mécanisme. Mitigation via R-P03 : les formulations directionnelles qualifiées sont interdites.

---

## VIII. RELATION AU PRINCIPE "DYNAMIQUES, PAS PROFILS"

`README_FOUNDATIONS §4` : *"Refus de l'identité utilisateur — le moteur lit des dynamiques, pas des profils."*

**Condition 1 — Le sujet est toujours la donnée (R-P01)**
Un profil caractérise l'opérateur. Un motif décrit les données de la fenêtre. La distinction est architecturale : le moteur ne parle jamais de l'opérateur — il parle des données que l'opérateur a produites.

**Condition 2 — La fenêtre est toujours explicite (R-P05)**
Un profil est une caractérisation stable et durable. Un motif est une observation bornée dans le temps. La fenêtre explicite maintient la distinction : ce qui est observé dans une fenêtre n'est pas une propriété permanente de l'opérateur.

Si R-P01 et R-P05 sont strictement respectés, la détection de motifs reste dans le domaine des dynamiques observables. Ces deux règles sont la protection architecturale contre la dérive vers le profil.

---

## IX. RÈGLES CANONIQUES — R-P01 À R-P08

### R-P01 — Le sujet est toujours la donnée, jamais l'opérateur

Toute phrase dont le sujet grammatical est l'opérateur viole cette règle. *"Vous avez...", "l'opérateur tend à...", "votre comportement montre..."* sont interdits. Le sujet est toujours la configuration, la transition, le niveau, la distribution, la fenêtre.

---

### R-P02 — Aucun verbe d'inférence

*Indiquer, suggérer, montrer que, révèler, témoigner de, démontrer* sont des verbes d'inférence interdits à l'étape Refléter le motif et à l'étape Certifier le changement. Le moteur observe — il n'infère pas.

---

### R-P03 — Aucune clause causale ni formulation directionnelle qualifiée

**Clauses causales interdites :** *parce que, en raison de, à cause de, sous l'effet de, dans des conditions de, lorsque* (quand il relie un état comportemental à un facteur externe).

**Formulations directionnelles qualifiées interdites :** *glissade vers, détérioration vers, bascule, fragilité, dérive progressive.* Ces formulations qualifient la direction de la transition au lieu de la décrire.

**Formulations directionnelles neutres autorisées :** *la transition de [A] vers [B], le passage du niveau [N] au niveau [M].* Ces formulations décrivent la séquence sans la qualifier.

---

### R-P04 — Aucune évaluation normative du changement

*Amélioration, dégradation, progrès, régression, encourageant, préoccupant, mieux, moins bien* sont interdits dans la certification. Le moteur dit *"différent"* — jamais *"mieux"* ou *"pire."*

---

### R-P05 — La fenêtre est toujours explicite

Toute description de motif ou de changement mentionne la fenêtre temporelle sur laquelle elle est calculée. Bornes déclarées (dates ou numéros de session). Un motif sans ancrage temporel explicite est une caractérisation — pas une observation.

---

### R-P06 — Interdiction de nommer les motifs au-delà de leur description structurelle

Le moteur ne donne pas de nom propre à une configuration récurrente. *"Le motif pré-dérive", "la séquence de surexposition"* sont interdits. Ces nommages transforment une observation temporelle en catégorie diagnostique permanente.

Le terme "motif" peut être utilisé dans la description de l'opération (*"un motif a été identifié dans les données"*) à condition qu'il ne soit jamais attaché à l'opérateur. *"Votre motif", "votre pattern", "ce motif vous caractérise", "votre motif comportemental"* sont interdits sans exception.

---

### R-P07 — Principe de seuil minimal d'observation

Le moteur ne réfléchit aucun motif et ne certifie aucun changement si le nombre de snapshots dans la fenêtre concernée est inférieur à un seuil minimal. Ce seuil est un paramètre d'implémentation (N5) — sa valeur est définie lors de l'architecture technique. Le principe est N2 : en dessous du seuil, le moteur ne produit aucune description de motif ni aucune certification. Il indique uniquement que les données disponibles sont insuffisantes pour l'opération. Aucune valeur de seuil n'est fixée dans ce document.

---

### R-P08 — Interdiction de proposer une correction

Le moteur identifie la configuration récurrente. Il ne propose pas de correction comportementale dérivée de cette identification. *"Examiner les conditions de ces sessions", "envisager de modifier l'approche"* sont interdits — même formulés comme suggestions neutres. La prescription appartient exclusivement à l'opérateur.

---

## X. LA VALEUR DIFFÉRENCIANTE — FORMULATION CANONIQUE

### Propriétés réelles du système

**Propriété 1 — Invisibilité au moment de la déclaration**
L'opérateur qui a déclaré "Friction (3)" à 10h et "Dérive (4)" à 14h ne savait pas qu'il reproduisait une séquence déjà observée. La récurrence n'était pas visible dans l'instant. Elle est visible dans la série.

**Propriété 2 — Immunité à la réécriture rétrospective**
Les snapshots sont des états datés et immutables. L'opérateur ne peut pas réécrire ce qu'il a déclaré au moment de la décision. Cette immunité est réelle mais conditionnelle : elle suppose que les captures sont régulières et non-sélectives. Un opérateur qui snapshote uniquement ses sessions favorables introduit un biais de sélection à la capture que le moteur ne peut pas corriger.

**Propriété 3 — Homogénéité du vocabulaire sur la durée**
Le moteur force un vocabulaire contrôlé. "Friction (3)" en mars désigne la même configuration que "Friction (3)" en juin. La comparaison computationnelle est possible sur un vocabulaire contrôlé. Elle ne l'est pas sur un vocabulaire libre.

### La plus petite phrase autorisée — formulation canonique

```
"La transition [Label A (N)] → [Label B (M)] a été observée [X] fois
 dans les [Y] derniers snapshots
 (fenêtre [bornes explicites])."
```

---

## XI. TABLEAU DE SYNTHÈSE

| Opération | Ce que le moteur fait | Ce que le moteur ne fait jamais |
|---|---|---|
| **Retenir** | Persiste les états déclarés avec horodatage | Interprète, évalue, synthétise |
| **Mettre en tension** | Détecte les anomalies de séquence dans la fenêtre courante | Explique les anomalies, recommande des corrections |
| **Refléter le motif** | Décrit les configurations récurrentes — données comportementales uniquement | Nomme les configurations, caractérise l'opérateur, explique les causes, fusionne avec données marché, propose une correction |
| **Certifier le changement** | Compare les distributions entre W1 et W2 niveau par niveau — données comportementales uniquement | Évalue si le changement est une amélioration, prédit la persistance, fusionne avec données marché, recommande un comportement |

---

*PATTERN REFLECTION DOCTRINE V1*
*Document N2. Extension de memory_doctrine_v1.md.*
*Chemin : `docs/doctrine/pattern_reflection_doctrine_v1.md`*
*Aucun code. Aucune implémentation. Aucune UI.*
