# Baseline V1 Officielle — Caméléon Engine

> Document d'architecture fondamental · 2026-06-10
> Statut : **RÉFÉRENCE — implémentation interdite tant que les conditions §10 ne sont pas intégrées à la roadmap**

---

## Sommaire

1. [Définition canonique](#1-définition-canonique)
2. [Frontières conceptuelles](#2-frontières-conceptuelles)
3. [Architecture — position dans le système](#3-architecture)
4. [Construction V1](#4-construction-v1)
5. [Double ancrage](#5-double-ancrage)
6. [Reconstruction de Baseline](#6-reconstruction)
7. [Baseline globale et régimes de marché](#7-baseline-globale-régimes)
8. [Relation avec la Calibration Personnelle Binance V1](#8-calibration-binance)
9. [Relation avec Constellium](#9-constellium)
10. [Conditions non négociables avant implémentation](#10-conditions-non-négociables)
11. [Éléments différés](#11-éléments-différés)
12. [Verdict](#12-verdict)

---

## 1. Définition canonique

### Définition officielle

> **La Baseline Personnelle est le centre de gravité comportemental d'un opérateur — l'état vers lequel son comportement tend à revenir en conditions de marché ordinaires, dérivé de ses propres sessions qualifiées, versionnée explicitement, et servant de référence relative uniquement en conjonction avec un ancrage absolu.**

Ce n'est pas ce que l'opérateur devrait faire. Ce n'est pas ce qu'il fait toujours. C'est ce qu'il fait en l'absence de déclencheurs extraordinaires — la signature comportementale stable qui persiste quand le marché n'est ni en crise ni en euphorie.

### Ce que la Baseline n'est pas

| Ce qu'on pourrait croire | Pourquoi c'est faux |
|---|---|
| **Un objectif** | La Baseline décrit ce qui est, pas ce qui devrait être. Une Baseline "Impulsif" ne prescrit pas l'impulsivité — elle la constate. |
| **Une norme** | "Normal" convoque un cadre clinique incompatible avec la philosophie du produit. Caméléon ne diagnostique pas. |
| **Un diagnostic** | La Baseline ne dit pas ce qui va ou ne va pas. Elle dit ce qui est récurrent. |
| **Une moyenne simple** | Un opérateur à 40% Discipliné et 40% Impulsif n'est pas "neutre" — il est volatile. La moyenne arithmétique efface précisément ce qui est informatif. |

### Formulation produit

La Baseline doit être présentée à l'opérateur avec ces précisions permanentes :

- Elle se compare à lui-même, pas à un idéal.
- Elle dit si quelque chose évolue — pas s'il est "arrivé quelque part".
- Elle est construite sur ses propres données passées, pas sur un modèle théorique.

**Formulations à proscrire :**
- "Tu es [profil]" — labellisation permanente
- "Ta nature comportementale est..." — essentialisation
- "Cela explique tes résultats" — causalité non établie
- "Bonne période / Amélioration" — jugement sans ancrage absolu

**Formulations recommandées :**
- "Sur les [N] périodes observées, ton comportement tend à revenir vers [profil] en conditions ordinaires."
- "Par rapport à ta référence personnelle (construite entre [dates]) : [comparaison sobre]."
- "Ta référence personnelle indique [X%] [profil] historiquement. Cette période : [Y%]."

## 2. Frontières conceptuelles

Ces quatre concepts circulent dans l'architecture de Caméléon Engine. Ils ne sont pas interchangeables. Confondre l'un avec l'autre produit des erreurs de design irréparables en aval.

| Concept | Nature | Horizon | Mutabilité | Question à laquelle il répond |
|---|---|---|---|---|
| **Profil** | Photographie instantanée | Instant T | Recalculé à chaque session | "Qui suis-je aujourd'hui ?" |
| **Baseline** | Centre de gravité historique | Période construite | Versionnée · reconstruction délibérée | "Vers quoi est-ce que je reviens en conditions ordinaires ?" |
| **Pattern** | Tendance récurrente cross-périodes | Multi-périodes | Invalidable par absence prolongée | "Que fais-je de façon répétée, indépendamment des conditions ?" |
| **Trajectoire** | Direction du changement entre Baselines | Long terme | Méta-analyse continue | "Vers où est-ce que j'évolue ?" |

### Hiérarchie d'abstraction

```
Profil       ← instantané (session individuelle)
  ↓
Baseline     ← centre de gravité (agrégat de sessions qualifiées)
  ↓
Pattern      ← récurrence cross-périodes (via Couche Fantôme)
  ↓
Trajectoire  ← direction du changement (méta-analyse longitudinale)
```

Chaque niveau est construit sur le précédent mais ne peut pas y être réduit. La Trajectoire n'est pas "beaucoup de Baselines alignées" — c'est la direction du changement entre Baselines successives. Un opérateur peut avoir une Trajectoire positive même si sa Baseline courante est en dessous d'une Baseline antérieure, si la direction est bonne.

### Frontière critique : Baseline ≠ Profil courant

Le Profil est recalculé à chaque session et ne mémorise pas son évolution. Il répond à "comment suis-je maintenant ?"

La Baseline est construite sur un corpus historique et stabilisée. Elle répond à "comment suis-je en général, en dehors des moments exceptionnels ?"

Confondre les deux produit le piège suivant : une période exceptionnellement bonne fait monter le Profil momentanément. Si ce Profil est pris comme référence sans distance temporelle, l'opérateur sera systématiquement "en dessous de sa norme" pour le reste de l'année.

## 3. Architecture — position dans le système

### La Baseline est une couche transversale

La Baseline n'est pas insérée verticalement dans la séquence Couche 1→4. Elle est **perpendiculaire** à cette séquence : construite depuis Couche 1, elle sert de référence à toutes les couches au-dessus sans faire partie de l'une d'elles.

```
╔══════════════════════════════════════════════════════════════════╗
║  COUCHE 1 — Sessions brutes                                      ║
║  Données comportementales · FIFO 50 sessions (local)             ║
║  Illimitées avec compte (MEM-V2 Catégorie A)                     ║
╚══════════════════════╦═══════════════════════════════════════════╝
                       ║ alimentation
                       ▼
╔══════════════════════════════════════════════════════════════════╗
║  BASELINE PERSONNELLE V1, V2, Vn                                 ║
║  Centre de gravité comportemental · couche transversale          ║
║  Construite sur corpus qualifié · versionnée · archivée          ║
╚═══════╦══════════════════════════════╦═══════════════════════════╝
        ║ référence de normalisation   ║ contexte de lecture
        ▼                              ▼
╔═══════════════════╗   ╔══════════════════════════════════════════╗
║  COUCHE 2         ║   ║  COUCHE 3 — Patterns stables             ║
║  Tendances        ║   ║  COUCHE 4 — Trajectoire                  ║
║  glissantes       ║   ║  (construites via Couche Fantôme)        ║
╚════════╦══════════╝   ╚══════════════════════════════════════════╝
         ║ cristallisation périodique
         ▼
╔══════════════════════════════════════════════════════════════════╗
║  COUCHE FANTÔME — Snapshots immuables versionnés                 ║
║  Portraits de périodes closes                                    ║
║  Chaque snapshot porte : version Baseline active + version algo  ║
╚══════════════════════════════════════════════════════════════════╝
```

### Règles de position

**La Baseline est construite depuis Couche 1 mais n'en fait pas partie.** Les sessions brutes alimentent la construction de la Baseline ; elles ne sont pas modifiées par elle.

**La Baseline référence Couche 2.** Sans Baseline, Couche 2 produit des valeurs absolues non interprétables. Avec Baseline, Couche 2 peut produire une comparaison normalisée ("au-dessus / dans ta norme / en dessous").

**La Baseline est attachée à la Couche Fantôme.** Chaque snapshot de la Couche Fantôme porte la version de Baseline qui était active lors de sa cristallisation. Couche 3 ne compare que des snapshots produits avec la même version de Baseline.

**La Baseline alimente Couche 3 et Couche 4 via la Couche Fantôme.** Elle ne les alimente pas directement.

### Le problème du bootstrapping

La Baseline requiert des sessions pour être construite. Mais les premières sessions sont produites sans Baseline existante.

**Résolution : mode pré-Baseline explicite.**

Les N premières sessions (sous le seuil de construction) opèrent en mode pré-Baseline. Ce mode n'est pas un état vide — c'est une expérience produit conçue :

- L'indicateur de progression est visible : "12/20 sessions — référence personnelle en construction"
- Couche 2 produit des valeurs descriptives uniquement, sans comparaison normalisée
- L'opérateur comprend pourquoi il n'y a pas encore de référence : parce qu'elle se construit à partir de lui

Le passage du mode pré-Baseline au mode Baseline active est un événement produit signalé, jamais une transition silencieuse.

## 4. Construction V1

### Conditions de construction

| Critère | Valeur V1 | Justification |
|---|---|---|
| Sessions minimum | 20 sessions qualifiées | En dessous de 10, le risque de concentration sur un régime unique est trop élevé. 20 sessions sur 8 semaines garantissent une diversité temporelle minimale. |
| Durée minimum | 8 semaines | La contrainte temporelle est plus importante que le nombre absolu de sessions. Elle force une couverture de différents jours, semaines, micro-cycles. |
| Régime de marché | Stocké en métadonnée — non exigé | La diversité de régimes n'est pas requise pour V1, mais chaque session doit porter son régime de marché comme donnée contextuelle pour permettre les Baselines par régime en V2/V3. |
| Pondération | Égale | La pondération différentielle (récence, qualité) est conceptuellement séduisante mais crée une dérive implicite et de l'opacité. L'exclusion binaire est plus transparente. |
| Reconstructions silencieuses | Interdites | Voir §6. |

### Sessions qualifiées — critères d'inclusion

Une session est incluse dans le corpus de construction de la Baseline si elle remplit toutes ces conditions :

- Elle contient des données comportementales suffisantes (seuil de qualité à définir lors de l'implémentation — ex. : import Trade History avec ≥10 trades)
- Elle n'est pas flagguée "exploration / test" par l'opérateur
- Elle ne se situe pas dans les 10 premières sessions suivant une reconstruction de Baseline déclarée (période de transition)
- Elle ne se situe pas dans les 10 premières sessions suivant une inactivité de >60 jours (la reprise peut ne pas être représentative)

### Sessions exclues

| Type de session | Raison d'exclusion |
|---|---|
| Sessions de test / exploration explicite | Ne représentent pas un comportement de trading réel |
| Sessions avec données comportementales insuffisantes | Import trop mince pour produire un profil fiable |
| Sessions post-inactivité longue (>60 jours) | Période de réadaptation — comportement potentiellement atypique |
| Sessions après reconstruction déclarée | Elles alimentent la Baseline suivante (V2), pas la courante |

### Données de session requises dès Couche 1

Ces métadonnées doivent être présentes sur chaque session depuis la première implémentation de Couche 1 :

- `regime_marche` : valeur macro (Expansif / Neutre / Contracté) au moment de la session
- `qualite_donnees` : indicateur de fiabilité de l'analyse comportementale (full / partial / insuffisant)
- `eligible_baseline` : boolean — calculé automatiquement selon les critères d'inclusion ci-dessus
- `baseline_version` : identifiant de la version de Baseline active au moment de la session (null en mode pré-Baseline)

**Ces champs sont non négociables dès V1.** Sans eux, toute Baseline future sera impossible à construire ou à décomposer par régime.

## 5. Double ancrage

### Règle architecturale — non négociable

> **Aucun affichage relatif à la Baseline ne peut exister sans affichage absolu co-localisé.**

Cette règle n'est pas une préférence UX. C'est une contrainte d'architecture. Si elle est implémentée comme préférence, elle disparaîtra lors d'une refonte d'interface. Si elle est inscrite comme contrainte, elle survivra aux évolutions.

### Le problème de la normalisation de la médiocrité

Sans ancrage absolu, le piège suivant est inévitable :

Un opérateur a une Baseline construite sur 60% de sessions Impulsif. Il produit une période à 45% Impulsif. Le moteur dit : "au-dessus de ta norme — amélioration relative."

Techniquement vrai. Productement dangereux. L'opérateur reçoit un signal positif alors qu'il reste dans une zone comportementale problématique en termes absolus. Il peut interpréter "amélioration relative" comme "je suis bien" — et prendre des décisions en conséquence.

### Définitions

**Ancrage absolu** = les données comportementales brutes observées sur la période, sans comparaison. Exemples :
- "42% de sessions Discipliné · 33% Réactif · 25% Impulsif/Agressif"
- "Sur 24 sessions (8 semaines)"

**Ancrage relatif** = la comparaison à la Baseline personnelle. Exemples :
- "Au-dessus de ta référence personnelle (+7 points vs baseline de 58)"
- "Profil dominant stable par rapport à ta baseline"

### Règle d'ordre d'affichage

**L'ancrage absolu apparaît en premier.** L'ancrage relatif suit, comme contexte d'interprétation.

Si l'ancrage relatif est affiché en premier ("amélioration !"), l'opérateur lit le titre et ne lit pas le sous-titre. Si les données brutes apparaissent en premier, l'opérateur voit sa réalité avant de voir comment elle se compare à sa norme.

### Formulation de garde-fou permanente

La phrase suivante, ou une équivalente, doit accompagner chaque affichage de comparaison relative :

> "Ta référence personnelle te compare à toi-même, pas à un idéal. Elle dit si tu évolues — pas si tu es arrivé."

Ce n'est pas un disclaimer légal. C'est un élément architectural de l'UX cognitive — il neutralise le risque d'interprétation abusive du signal relatif.

### Ce que le double ancrage interdit

- Afficher "Bonne période" ou "Progression" sans les données brutes correspondantes
- Afficher une icône de validation (✓, ↑) sans contexte absolu visible
- Séparer l'ancrage relatif et l'ancrage absolu sur des écrans ou sections différentes
- Utiliser l'ancrage relatif seul comme base d'une recommandation

## 6. Reconstruction de Baseline

### Doctrine officielle

**Une Baseline ne se reconstruit jamais silencieusement. Elle ne disparaît jamais.**

Toute Baseline reconstruite est archivée comme version historique (V1, V2, V3...). L'opérateur peut toujours consulter ses Baselines passées et voir l'évolution de son centre de gravité dans le temps. La reconstruction archive — elle n'efface pas.

### Modes de reconstruction

| Mode | Description | Statut |
|---|---|---|
| **Proposée** | Le moteur détecte un signal et propose une reconstruction. L'opérateur décide. | Mode primaire V1 |
| **Manuelle** | L'opérateur déclenche lui-même la reconstruction depuis l'interface. | Mode secondaire V1 |
| **Automatique silencieuse** | La Baseline se reconstruit sans information à l'opérateur. | **Proscrit — jamais** |

La reconstruction automatique silencieuse est proscrite pour trois raisons :
1. Elle invalide la référence de l'opérateur sans son consentement
2. Elle rend le changement de Baseline indiscernable d'un changement comportemental réel
3. À grande échelle, un changement de régime de marché peut déclencher des reconstructions en masse — interprétées à tort comme une vague de changements comportementaux collectifs

### Déclencheurs de reconstruction proposée

Le moteur peut proposer une reconstruction dans les situations suivantes :

**Déclencheur déclaratif (le plus fiable) :**
- L'opérateur signale explicitement un changement de stratégie
- L'opérateur signale un changement de marché (passage Spot → Futures, nouvel actif dominant, etc.)

**Déclencheur comportemental :**
- Score moyen des 15 dernières sessions s'écarte de la Baseline active de plus de 1,5 écart-type pendant 10+ sessions consécutives
- Profil dominant différent de la Baseline pendant 8+ sessions consécutives

**Déclencheur temporel :**
- Reprise d'activité après >90 jours d'inactivité, suivie de ≥10 nouvelles sessions montrant un profil cohérent mais différent de la Baseline courante

**Contrainte de fréquence :** une proposition automatique maximum tous les 30 jours. La multiplication de propositions crée de la fatigue décisionnelle et dilue la signification de chaque proposition.

### Processus de reconstruction

1. Le moteur détecte un signal et formule une proposition explicite : "Caméléon observe un changement durable depuis [date]. Veux-tu reconstruire ta référence personnelle ?"
2. L'opérateur peut accepter, refuser, ou différer
3. En cas d'acceptation : l'ancienne Baseline est archivée avec sa date et son corpus ; la nouvelle Baseline commence à se construire sur les sessions récentes
4. Les sessions post-reconstruction qui ont alimenté l'ancienne Baseline ne participent pas à la nouvelle

### Ce que la reconstruction ne fait pas

- Elle ne supprime pas l'ancienne Baseline
- Elle ne modifie pas les sessions de Couche 1
- Elle ne recalcule pas les snapshots de la Couche Fantôme antérieurs (ils restent associés à leur version de Baseline)

## 7. Baseline globale et régimes de marché

### Décision V1 : Baseline globale unique

La V1 utilise une Baseline globale unique — construite sur l'ensemble des sessions qualifiées, sans segmentation par régime de marché.

**Justification :**
- La Baseline globale est disponible dès 20 sessions, sans contrainte de densité par régime
- Elle constitue une référence disponible immédiatement, même si l'opérateur n'a traversé qu'un seul type de régime de marché
- Elle évite la complexité d'affichage de 2 ou 3 Baselines simultanées

**Limite explicite :** une Baseline globale construite à 80% en régime Expansif sera moins précise pour évaluer le comportement en régime Contracté. Cette limite est documentée et communiquée à l'opérateur via la métadonnée de composition de sa Baseline : "Référence construite sur 38 sessions — 74% en régime Expansif."

### Infrastructure pour les Baselines par régime (V2/V3)

Bien que les Baselines régime-spécifiques soient différées, l'infrastructure doit être prête dès V1 :

**Règle impérative :** chaque session de Couche 1 porte son régime de marché comme métadonnée dès le premier déploiement. Cette information ne peut pas être ajoutée rétroactivement de façon fiable.

Dès que cette métadonnée existe sur l'historique de sessions, les Baselines régime-spécifiques peuvent être calculées ultérieurement sans ré-implémentation de Couche 1.

### Conditions d'activation des Baselines régime-spécifiques

Les Baselines régime-spécifiques sont calculées et activées uniquement si :

- ≥10 sessions qualifiées dans ce régime spécifique
- Ces sessions couvrent ≥4 semaines distinctes dans ce régime
- La qualité des étiquettes de régime est suffisante (les saisies macro de l'opérateur sont cohérentes)

Si ces conditions ne sont pas réunies pour un régime, la Baseline globale reste la référence pour ce contexte — avec mention explicite.

### Règle de priorité (V2+)

Quand un régime de marché est identifié pour la session courante ET que la Baseline régime-spécifique correspondante est disponible (≥10 sessions) → utiliser la Baseline régime.

Si la Baseline régime n'est pas disponible → utiliser la Baseline globale + mention du contexte.

L'opérateur voit toujours quelle Baseline est utilisée pour la comparaison courante.

## 8. Relation avec la Calibration Personnelle Binance V1

### Deux concepts distincts

La Calibration Personnelle Binance V1 et la Baseline Personnelle répondent à des questions différentes, à partir de sources différentes.

| Dimension | Calibration Personnelle Binance V1 | Baseline Personnelle |
|---|---|---|
| Source | Imports Trade/Order History (données transactionnelles) | Sessions moteur (évaluations décisionnelles) |
| Ce qu'elle mesure | Comment l'opérateur trade — timing, sizing, fréquence, taux d'annulation | Comment l'opérateur évalue sa situation avant d'agir |
| Nature des données | Comportement observé post-hoc (ce qui s'est passé) | Comportement déclaré en temps réel (ce que l'opérateur pense de sa situation) |
| Biais inhérent | Aucun biais déclaratif — données objectives et mesurables | Biais de désirabilité possible (l'opérateur se déclare) |
| Prérequis | Import CSV / XLSX / PDF régulier | Usage régulier du moteur (sessions) |

**Document de référence :** `docs/architecture/calibration-personnelle-binance-v1.md`

### Pourquoi ne pas fusionner

Les deux systèmes ont des sources, des temporalités et des biais fondamentalement différents. Les fusionner produirait une "vérité composite" qui n'est ni l'une ni l'autre — et qui hérite des limites des deux sans les avantages de chacune.

La Calibration Personnelle révèle : "qu'est-ce que cet opérateur fait dans ses trades ?"
La Baseline Personnelle révèle : "comment cet opérateur évalue-t-il sa situation au moment de décider ?"

Ces deux questions sont orthogonales. Un opérateur peut avoir une Calibration montrant "fréquence élevée, positions petites" (comportement transactionnel réactif) et une Baseline montrant "profil dominant Discipliné" (auto-évaluation disciplinée). Cette divergence n'est pas une incohérence des systèmes — c'est une information.

### Le pont futur

Quand les deux architectures sont disponibles simultanément, le moteur peut construire une lecture croisée :

> "Ta référence sessions (Baseline) montre X. Ton comportement transactionnel (Calibration) montre Y. Écart entre déclaré et observé : [description sobre]."

L'écart entre le comportement décisionnel déclaré (Baseline) et le comportement transactionnel observé (Calibration) est l'une des données les plus précieuses que Caméléon puisse produire. Il suppose les deux architectures maintenues séparément et opérationnelles.

**Ce pont est différé.** Il ne peut être construit que lorsque les deux architectures sont stables et validées terrain indépendamment.

## 9. Relation avec Constellium

### Rappel de l'architecture officielle

Constellium est la **Couche 5 — Expression** de l'architecture produit officielle. Sa règle fondamentale : il exprime le moteur, il ne le commande pas. Il lit des données produites par le moteur ; il n'en écrit aucune.

Règle C1 de l'architecture Constellium : "Constellium exprime le moteur — il ne le pilote pas, ne le nourrit pas, et n'en modifie aucune donnée."

**Document de référence :** `docs/architecture/product_architecture_post_6c3f6fd.md`

### La Baseline peut-elle nourrir Constellium ?

**Oui — comme donnée de lecture.**

La Baseline est une sortie du moteur, au même titre que le score ou la posture. Si Constellium peut lire le score pour produire une narration contextuelle, il peut lire la Baseline pour enrichir cette narration.

Exemple sans Baseline : "Tu es en posture prudente."
Exemple avec Baseline : "Tu es en posture prudente — ce qui est au-dessus de ta norme habituelle sur les dernières semaines."

La deuxième formulation est plus précise et plus honnête. Elle ne change pas la décision du moteur — elle l'éclaire.

### Constellium peut-il influencer la Baseline ?

**Non. Jamais.**

Permettre à Constellium d'influencer la construction ou la reconstruction de la Baseline serait une inversion architecturale fondamentale. La narration modifierait la réalité qu'elle est censée décrire.

Plus précisément : si la narration Constellium influence le comportement de l'opérateur, qui influence les sessions, qui influencent la Baseline, qui influence la narration — on crée une boucle de rétroaction narrative non contrôlée. Ce scénario n'est pas hypothétique dans les systèmes de feedback cognitif.

### Statut actuel et préparation

Constellium est actuellement dormant (CSS `display: none`, HTML intact). La lecture de la Baseline par Constellium est une fonctionnalité de Constellium V2+, non de la Baseline V1.

**Ce qui doit être préparé maintenant :** la Baseline doit être un champ structuré et lisible dans le payload du moteur, documenté comme point d'accès futur pour Constellium. La structure précède l'usage.

### Règle permanente

> La Baseline est une donnée moteur. Constellium est une surface d'expression narrative. Le flux est à sens unique : moteur → Constellium. Jamais l'inverse.

## 10. Conditions non négociables avant implémentation

Ces conditions doivent être intégrées à la roadmap et satisfaites avant qu'une seule ligne de code liée à la Baseline soit écrite. Leur non-respect crée des dettes irréparables sans refactorisation majeure.

---

### Condition 1 — Schéma de session Couche 1 enrichi dès le premier déploiement

Chaque session doit porter ces métadonnées dès sa création :

| Champ | Type | Description |
|---|---|---|
| `regime_marche` | enum (Expansif / Neutre / Contracté) | Régime de marché déclaré par l'opérateur via la couche macro |
| `qualite_donnees` | enum (full / partial / insuffisant) | Fiabilité de l'analyse comportementale produite par cette session |
| `eligible_baseline` | boolean | Calculé automatiquement selon les critères d'inclusion §4 |
| `baseline_version` | string ou null | Identifiant de la version de Baseline active au moment de la session |

**Pourquoi non négociable :** ces champs ne peuvent pas être ajoutés rétroactivement de façon fiable sur des sessions existantes. Si la Couche 1 est déployée sans eux, toutes les sessions antérieures au correctif seront inutilisables pour les Baselines régime-spécifiques et pour la Couche Fantôme versionnée.

---

### Condition 2 — Le double ancrage comme contrainte d'architecture

Le principe du double ancrage (§5) doit être inscrit comme contrainte non négociable dans la spécification de l'interface Mémoire — pas comme recommandation UX.

Formulation contractuelle : "Toute valeur produite par comparaison à la Baseline doit être accompagnée des données brutes absolues correspondantes, affichées dans le même bloc visuel, avec les données brutes en position primaire."

**Pourquoi non négociable :** si ce principe est une préférence, il sera sacrifié lors d'une refonte d'interface pour des raisons de clarté visuelle ou d'espace. Si c'est une contrainte, il survivra.

---

### Condition 3 — Versionnement de Baseline défini avant construction

Le schéma de versionnement (V1, V2, Vn) doit être défini avec :
- Identifiant de version (chaîne ou timestamp)
- Date de début du corpus
- Date de fin du corpus
- Nombre de sessions contributrices
- Référence à la version algorithmique de scoring comportemental active
- Résumé statistique (score nominal, profil dominant, composition des régimes)

**Pourquoi non négociable :** sans versionnement, la Couche Fantôme ne peut pas garantir la comparabilité des snapshots. Sans versionnement algorithmique, un changement d'algorithme produit des faux patterns dans Couche 3.

---

### Condition 4 — Mode pré-Baseline comme expérience produit explicite

L'état "moins de 20 sessions qualifiées" ne doit pas être un état vide. Il doit être conçu comme une expérience :

- Indicateur de progression visible et compréhensible
- Message explicatif qui valorise l'accumulation plutôt que d'excuser l'absence de résultat
- Aucune valeur relative affichée — uniquement des valeurs descriptives absolues

**Pourquoi non négociable :** un onglet Mémoire vide ou incompréhensible pendant les 4 à 8 premières semaines est la principale cause de churn précoce pour une fonctionnalité mémoire.

---

### Condition 5 — Critères d'exclusion de session documentés avant implémentation

La liste des critères d'exclusion (§4) doit être formalisée et validée avant que la première Baseline soit calculée. Ces critères ne peuvent pas être ajustés a posteriori sans invalider les Baselines existantes.

Si les critères changent après que des Baselines ont été construites, les Baselines existantes deviennent incomparables avec les nouvelles — exactement le problème du versionnement algorithmique.

## 11. Éléments différés

Ces éléments sont architecturalement cohérents avec la V1 mais nécessitent soit des prérequis non encore satisfaits, soit une validation terrain intermédiaire.

| Élément | Pourquoi différé | Condition de déclenchement |
|---|---|---|
| **Baselines par régime de marché** | Nécessite ≥10 sessions par régime · dépend de la densité de l'historique | N≥10 sessions qualifiées par régime + 4 semaines distinctes dans ce régime |
| **Reconstruction automatique** | Risque de faux positifs en changement de régime systémique | Post-V0 terrain avec calibration des seuils de déclenchement |
| **Pont Calibration Binance ↔ Baseline** | Les deux architectures doivent être stables et validées indépendamment | Calibration Personnelle Binance V1 implémentée + Baseline V1 implémentée + signal terrain |
| **Lecture Baseline par Constellium** | Constellium est dormant · fonctionnalité V2+ | Constellium réactivé + Baseline V1 stabilisée |
| **Bibliothèque Vivante basée sur Baseline** | Nécessite N≥10 opérateurs avec opt-in + Baselines comparables (même algo) | MEM-V2 Phase D active + N≥10 opérateurs opt-in + versionnement algorithmique stable |
| **Pondération temporelle des sessions** | Introduit une dérive implicite si mal calibrée | Post-V0 terrain avec données suffisantes pour calibrer les coefficients |
| **Gamification-proofing avancé** | Détection de sessions "performatives" (opérateur construisant intentionnellement sa Baseline) | Post-bêta avec données comportementales réelles sur 12+ mois |

### Note sur les éléments différés

Le fait qu'un élément soit différé ne signifie pas qu'il ne doit pas être pensé maintenant. L'infrastructure technique (métadonnées de session, versionnement) doit préparer ces éléments dès V1, même s'ils ne sont pas activés.

## 12. Verdict

### Verdict officiel

**GO AVEC MODIFICATIONS — document fondateur validé.**

**Implémentation interdite tant que les 5 conditions du §10 ne sont pas intégrées à la roadmap.**

---

### Ce qui est solide

La définition comme "centre de gravité comportemental" est la bonne. Elle est non pathologisante, non prescriptive, et compatible avec la philosophie centrale du produit : Caméléon Engine est un miroir — il décrit, il ne diagnostique pas.

Le double ancrage est la décision de conception la plus protectrice du document. Sans lui, la Baseline devient un outil de confort narratif plutôt qu'un outil de lucidité. Avec lui, l'opérateur ne peut pas interpréter une amélioration relative sans voir sa position absolue.

La doctrine de reconstruction — proposée, jamais silencieuse, toujours archivée — est correcte. Elle transforme la reconstruction en acte conscient plutôt qu'en incident technique.

---

### Ce qui cassera dans 3 ans sans les conditions §10

**Sans Condition 1** (schéma de session enrichi) : les sessions préexistantes seront inutilisables pour les Baselines régime-spécifiques. Les premiers utilisateurs auront des Baselines structurellement inférieures à celles des utilisateurs tardifs — un écart injustifiable et permanent.

**Sans Condition 2** (double ancrage comme contrainte) : dans 18 mois, lors d'une refonte de l'onglet Mémoire, l'ancrage absolu sera "simplifié" pour des raisons visuelles. Des milliers d'opérateurs recevront des signaux d'amélioration relative sans contexte absolu. Certains prendront des décisions en conséquence. Le produit aura contribué à une illusion.

**Sans Condition 3** (versionnement) : une mise à jour de l'algorithme comportemental produira des snapshots de Couche Fantôme incomparables avec les anciens. Couche 3 détectera de faux patterns. Les premiers utilisateurs verront leur "trajectoire" changer à cause d'un changement algorithmique, pas d'un changement comportemental.

---

### Principe directeur final

> La Baseline ne doit jamais donner à l'opérateur l'impression de savoir qui il est.
> Elle doit lui donner l'impression de voir ce qu'il fait — et de comprendre dans quelle direction il va.

La différence entre ces deux formulations n'est pas rhétorique. La première enferme. La seconde libère.

---

*Référence roadmap : `docs/architecture/mem-v2-compte-memoire-persistante.md` · Séquence : Baseline V1 → Couche Fantôme → Mémoire Long Terme M1 → M2 → M3*
