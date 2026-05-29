# PDF Intelligence System V1 — Architecture et doctrine

**Statut :** Document doctrinal · Aucune implémentation · Aucun code
**Version :** 1.0 — 2026-05-29
**Auteur :** Caméléon Engine Project
**Dépend de :** manifesto-cameleon-engine.md · doctrine-cameleon-profondeur-viabilite.md · behavior-engine-mapping-v1.md

---

## Préambule

Ce document répond à une question fondamentale :

> **Les documents PDF représentent-ils un nouveau pilier stratégique de Caméléon Engine, ou simplement une nouvelle source de données ?**

La réponse n'est pas binaire. Elle dépend de la famille de PDF, du niveau de lecture envisagé, et de l'usage attendu dans le cockpit. Ce document cartographie le territoire, identifie les frontières, et pose les principes architecturaux qui devront guider toute implémentation future.

Il ne définit pas comment lire un PDF. Il définit **pourquoi** le lire, **quoi** en extraire, et **où** le résultat doit aller.

---

## Partie 1 — Pourquoi ce système existe

### 1.1 Le problème de la donnée manquante

Le pipeline comportemental actuel de Caméléon Engine repose sur une source unique : les exports CSV/XLSX de Binance. Cette source est précise, structurée, exhaustive sur ce qu'elle contient. Elle a aussi une limite absolue : elle ne contient que ce que l'exchange a décidé d'enregistrer.

Ce que l'exchange n'enregistre pas :

- Le **contexte décisionnel** dans lequel les trades ont eu lieu
- L'**état psychologique** de l'opérateur pendant la session
- Le **raisonnement** qui a précédé une entrée ou une sortie
- Les **événements macro** qui ont influencé la lecture du marché
- Les **règles personnelles** que l'opérateur s'était fixé et a violées ou respectées

Ces données n'existent nulle part en format structuré. Elles existent dans les documents que le trader produit lui-même — journaux, notes, rapports — ou dans les documents qu'il consulte — analyses, rapports macro, publications institutionnelles. Ces documents sont presque toujours des PDF.

### 1.2 La distinction fondamentale : document / donnée / information / signal

Ces quatre termes ne sont pas interchangeables. Leur confusion est la principale source d'erreur architecturale dans les systèmes d'analyse.

**Document**
Un document est un objet organisé autour d'une intention communicative. Il a une structure narrative, un auteur, un destinataire, une temporalité. Un PDF est un document. Il peut contenir des données, des analyses, des opinions, des contradictions — parfois simultanément. Sa valeur ne se réduit pas à son contenu extractible.

**Donnée**
Une donnée est une unité mesurable, isolable, adressable. `42.50 USDT`, `2026-05-15T14:32:00Z`, `BUY`. Une donnée n'a pas d'ambiguïté sur ce qu'elle est. Elle peut être incorrecte, mais elle ne peut pas être floue. Les exports Binance contiennent des données.

**Information**
Une information est une donnée interpretée dans un contexte. `"L'opérateur a ouvert 3 positions en 12 minutes après une perte de 8%"` — c'est une information. Elle combine des données (timestamps, tailles) avec un contexte (la perte précédente). Une information a une valeur cognitive : elle modifie la compréhension d'un état.

**Signal**
Un signal est une information actionnable avec une direction. `"Comportement de revenge trading détecté"` est un signal. Il suppose un seuil, une règle, une conséquence comportementale. Un signal implique une réponse possible dans le cockpit.

**Pourquoi cette distinction est critique pour les PDF :**

Un PDF ne contient jamais directement des signaux. Il contient un document, qui peut contenir des données, qui peuvent, après extraction et interprétation, produire des informations, qui peuvent, si elles répondent à des critères architecturalement définis, devenir des signaux.

Le chemin document → signal comporte quatre étapes. Chaque étape est une source d'erreur potentielle. L'architecture PDF Intelligence doit traiter chaque étape séparément, avec ses propres garde-fous.

### 1.3 La valeur produit

Caméléon Engine est un cockpit cognitif. Sa fonction est d'augmenter la **lucidité de lecture** de l'opérateur. Le pipeline comportemental actuel analyse *ce que l'opérateur a fait*. La couche PDF permettrait d'analyser *dans quel contexte il l'a fait*.

Ce n'est pas une extension de la même chose. C'est une couche d'information différente.

Exemples de valeur réelle :

- Un rapport fiscal PDF révèle un ratio win/loss que le trader ne calculait pas — information structurée manquante
- Un journal personnel PDF révèle qu'une série de pertes coïncide avec des sessions post-14h — information comportementale invisible dans les timestamps seuls
- Une analyse macro PDF décrit un contexte de marché que le cockpit n'a aucun moyen de connaître autrement

Dans tous ces cas, la valeur n'est pas le PDF lui-même. La valeur est ce que Caméléon Engine peut faire avec ce qu'il en extrait — en respectant sa doctrine : ni oracle, ni thérapeute, ni dashboard.

---

## Partie 2 — Cartographie des PDF

### 2.1 Famille Binance — Documents officiels de l'exchange

| Sous-famille | Exemples | Intérêt | Difficulté | Valeur potentielle |
|---|---|---|---|---|
| Rapports fiscaux | Annual Tax Report, P&L Statement | Métriques agrégées annuelles non disponibles dans CSV | Structure semi-standardisée, mais variable par région | Haute — données absentes ailleurs |
| Relevés de compte | Account Statement PDF | Soldes, historique de dépôts/retraits | Souvent tables scannées ou HTML-to-PDF | Moyenne — partiellement redondant avec CSV |
| Rapports de performance | Monthly Performance Report | Vue synthétique sur une période | Format propriétaire, change entre versions | Haute si stable, Basse si format instable |
| Exports historiques PDF | Trades filtrés exportés en PDF | Alternative aux CSV pour certains marchés | Redondant avec CSV — faible justification | Basse — privilégier CSV systématiquement |

**Diagnostic famille Binance :** Valeur concentrée sur les rapports fiscaux et de performance — données agrégées non exportables en CSV. Pas de justification pour créer un pipeline PDF si l'équivalent CSV existe.

---

### 2.2 Famille Trading — Documents tiers et plateformes

| Sous-famille | Exemples | Intérêt | Difficulté | Valeur potentielle |
|---|---|---|---|---|
| Rapports de performance broker | Relevés IBKR, rapport MT4/5 | Métriques de risque (Sharpe, DD, etc.) | Formats très hétérogènes | Haute si normalisable |
| Rapports fiscaux trading | Déclaration plus-values, IFU | Agrégats annuels réels | Formats légaux variables par pays | Haute — données fiscales réelles |
| Journaux PDF exportés | Export trading journal (Edgewonk, Tradervue) | Annotations manuelles + données trades | Semi-structuré mais souvent riche | Très haute — contient raisonnement + données |
| Relevés multi-exchange | Rapport consolidé PF | Vue unifiée | Formats propriétaires | Moyenne — dépend de la standardisation |

**Diagnostic famille Trading :** Valeur la plus haute sur les journaux PDF exportés depuis des outils tiers — ils contiennent à la fois des données de trades ET le raisonnement associé. C'est une famille à fort potentiel comportemental.

---

### 2.3 Famille Recherche — Documents analytiques externes

| Sous-famille | Exemples | Intérêt | Difficulté | Valeur potentielle |
|---|---|---|---|---|
| Analyses on-chain | Glassnode, CryptoQuant reports | Contexte marché externe | Texte libre + graphiques non extractibles | Basse pour les données, Haute pour le contexte |
| Rapports institutionnels | Binance Research, Messari, Coindesk | Cadrage macro | Très long, structure variable | Moyenne — contexte narratif uniquement |
| Rapports macro | Fed, BCE, publications économiques | Contexte macro-économique | Haute densité textuelle, peu de données structurées | Haute si Caméléon V2 intègre dimension macro |
| Analyses techniques (tiers) | Rapports d'analystes | Opinions externes | Subjectif, non vérifiable | Faible — risque de contamination décisionnelle |

**Diagnostic famille Recherche :** Valeur élevée pour le **contexte**, mais difficile à transformer en signal. Le risque de sur-interprétation est maximal dans cette famille. L'analyse technique tierce est particulièrement dangereuse — elle représente une opinion externe, pas une donnée. Caméléon Engine n'est pas un agrégateur d'opinions.

---

### 2.4 Famille Utilisateur — Documents personnels

| Sous-famille | Exemples | Intérêt | Difficulté | Valeur potentielle |
|---|---|---|---|---|
| Journal de trading | Notes session par session | Contient le raisonnement réel, les émotions, les violations de règles | Non structuré — format personnel libre | **Maximale** — source de données comportementales unique |
| Notes post-session | Réflexions après une journée | Patterns cognitifs récurrents | Très libre, nécessite extraction sémantique | Haute avec niveau de lecture 3-4 |
| Règles personnelles | "Mon plan de trading" | Référentiel de comportement déclaré vs observé | Court, structuré, stable | Haute — base pour mesurer l'écart déclaré/réel |
| Réflexions périodiques | Bilans mensuels, post-mortem | Évolution de l'état mental sur la durée | Semi-structuré | Haute — dimension temporelle comportementale |

**Diagnostic famille Utilisateur :** C'est la famille **la plus stratégique**. Elle est la seule source de données comportementales qualitatives disponible. Les exports Binance montrent ce que le trader a fait. Le journal montre pourquoi il l'a fait — ou ce qu'il pensait faire avant de le faire différemment. C'est la couche manquante du miroir lucide.

---

### 2.5 Synthèse de la cartographie

| Famille | Priorité stratégique | Type de valeur |
|---|---|---|
| Utilisateur (journaux, règles) | **Haute** | Nouveau pilier comportemental |
| Trading (journaux exportés, fiscaux) | **Haute** | Extension du pipeline actuel |
| Binance (fiscaux, performance) | Moyenne | Complément données structurées |
| Recherche (macro, institutionnel) | Basse | Contexte uniquement, risque élevé |

---

## Partie 3 — Niveaux de lecture

### 3.1 Architecture des niveaux

Les quatre niveaux ne sont pas des options alternatives. Ils sont des couches cumulatives : chaque niveau présuppose le précédent.

```
NIVEAU 1 — LECTURE BRUTE
PDF → Texte
Extraction du contenu textuel brut.
Aucune interprétation. Aucune structuration.
Préserve les erreurs, les artefacts, les ambiguïtés.

NIVEAU 2 — EXTRACTION STRUCTURÉE
PDF → Données
Identification et isolation des unités mesurables :
dates, montants, pourcentages, entités nommées.
Structuration en tuples ou tables.
Aucune interprétation du sens.

NIVEAU 3 — ANALYSE
PDF → Information
Mise en relation des données extraites avec un contexte.
Détection de patterns, de tendances, d'anomalies.
Interprétation partielle avec marge d'erreur explicite.

NIVEAU 4 — LECTURE CAMÉLÉON
PDF → Comportement / Rythme / Pression / Structure / Signal
Transformation des informations en lectures compatibles
avec le cockpit cognitif.
Ce que Caméléon Engine voit dans le document.
```

### 3.2 Ce que chaque niveau exige et produit

**Niveau 1 — Lecture brute**

Ce niveau est purement mécanique. Un PDF natif (texte encodé) peut être lu sans aucune transformation sémantique. Un PDF scanné (image) nécessite une reconnaissance de caractères (OCR). La qualité du niveau 1 conditionne tous les niveaux suivants.

*Ce niveau produit :* une chaîne de caractères. Rien d'autre.
*Ce niveau ne produit pas :* de structure, de sens, de hiérarchie.

**Niveau 2 — Extraction structurée**

Ce niveau identifie les données dans le texte brut. Il utilise des règles (expressions régulières, patterns de format) ou une compréhension sémantique légère. Il produit des tuples : `(date, montant, symbole)`, `(période, P&L, win_rate)`.

*Ce niveau produit :* des données isolées, structurées, adressables.
*Ce niveau ne produit pas :* le contexte de ces données, leur signification relative.
*Risque principal :* faux positifs sur les données numériques (confondre un numéro de page avec un montant, une note avec un score).

**Niveau 3 — Analyse**

Ce niveau met les données extraites en relation avec un contexte connu. Il détecte des patterns (`3 sessions perdantes consécutives`), des tendances (`win_rate en déclin sur 6 mois`), des anomalies (`position 5× la taille habituelle le jour d'une news macro`).

*Ce niveau produit :* des informations contextualisées avec un niveau de confiance.
*Ce niveau ne produit pas :* de signal directement actionnable pour le cockpit.
*Risque principal :* sur-interprétation des patterns. Un pattern dans un document est une corrélation narrative, pas une causalité.

**Niveau 4 — Lecture Caméléon**

Ce niveau est le seul qui ait une valeur directe pour le cockpit. Il transforme des informations en lectures compatibles avec la doctrine du produit : comportement, rythme, pression, structure, signal.

*Ce que ce niveau lit :*

- **Comportement** : l'opérateur décrit-il des patterns qui correspondent aux patterns détectés par le moteur comportemental ? Y a-t-il un écart entre le comportement déclaré et le comportement observé ?
- **Rythme** : le rythme des sessions documentées correspond-il au rythme des trades ? Y a-t-il des sessions non documentées (trous dans le journal) qui coïncident avec des performances dégradées ?
- **Pression** : le document révèle-t-il des sources de pression externe (obligations financières, objectifs de performance, comparaison sociale) qui pourraient expliquer des comportements déviants ?
- **Structure** : le trader a-t-il un cadre de décision documenté ? Respecte-t-il ses propres règles ? L'écart entre règle déclarée et comportement observé est une information comportementale majeure.
- **Signal** : y a-t-il dans le document des marqueurs qui, croisés avec les données comportementales existantes, élèvent le niveau d'alerte ou modifient la lecture du moteur ?

*Ce niveau ne produit pas :* de certitude. Toute lecture Caméléon d'un document est probabiliste, partielle, et explicitement datée.

### 3.3 Ce qui relève de Caméléon Engine

Caméléon Engine intervient **uniquement au Niveau 4**.

Les niveaux 1, 2 et 3 sont des problèmes génériques d'extraction documentaire. Ils peuvent être traités par des composants techniques standards. Leur résultat — texte brut, données structurées, informations contextualisées — est une *entrée* pour Caméléon Engine, pas une *sortie*.

Caméléon Engine ne lit pas des PDF. Il lit le **comportement d'un opérateur** tel qu'il se révèle dans des données comportementales — y compris celles extraites d'un PDF.

Cette distinction est architecturalement fondamentale. Elle détermine où le module PDF s'arrête et où le moteur Caméléon commence.

---

## Partie 4 — Architectures possibles

### 4.1 Option A — PDF directement vers Behavior

```
PDF → [Behavior Engine]
```

**Description :** Le document PDF est traité comme une source de données comportementales directe, en parallèle ou en remplacement des CSV/XLSX.

**Avantages :**
- Architecture minimale — pas de nouveau module
- Réutilise l'infrastructure existante (session-repo.js, metrics.js)

**Risques :**
- Le moteur comportemental actuel est conçu pour des données structurées (trades atomiques). Un PDF est un document. Les confondre produit des artefacts.
- Les métriques actuelles (`overtrading`, `revenge_trading`, `size_inconsistency`) sont calculées sur des séquences d'ordres horodatés. Elles ne s'appliquent pas à du texte.
- Contamination architecturale : le comportement behavior module perdrait sa propriété d'isolation — il devrait désormais gérer deux types d'entrée fondamentalement différents.
- **Violation du contrat d'isolation** : le module behavior est défini comme lisant uniquement des CSV structurés. L'élargir à des PDF change sa nature.

**Impact sur l'architecture actuelle :** Élevé. Modification de parser.js, canonical.js, metrics.js. Risque de régression sur le pipeline existant.

**Verdict : Rejeté.** La différence de nature entre un trade CSV et un document PDF est insurmontable dans une architecture commune.

---

### 4.2 Option B — PDF vers Intelligence documentaire, puis vers Behavior

```
PDF → [Intelligence Documentaire] → [Behavior Engine]
```

**Description :** Un composant intermédiaire extrait et transforme le PDF en données compatibles avec le format behavior existant, avant de les injecter dans le pipeline standard.

**Avantages :**
- Le behavior engine reste inchangé
- L'intelligence documentaire est isolée — un seul composant à maintenir
- Les données comportementales extraites du PDF et du CSV peuvent être comparées dans un référentiel commun

**Risques :**
- La transformation PDF → format behavior est une normalisation forcée. Elle efface les informations du niveau 4 (rythme, pression, structure qualitative) qui ne rentrent pas dans les métriques quantitatives actuelles.
- Le composant d'intelligence documentaire devient un traducteur — et toute traduction perdra de l'information.
- Le behavior engine recevrait des données dont il ne connaît pas l'origine (CSV ou PDF) — ce qui compromet la fiabilité des patterns détectés.

**Impact sur l'architecture actuelle :** Moyen. Le behavior engine est préservé. L'intelligence documentaire est un nouveau composant, mais il crée une dépendance au pipeline behavior.

**Verdict : Acceptable pour les données structurées** (familles Binance et Trading), **insuffisant pour les données qualitatives** (famille Utilisateur). Ne couvre pas les niveaux 3 et 4.

---

### 4.3 Option C — PDF vers Intelligence documentaire, vers Module Documents autonome

```
PDF → [Intelligence Documentaire] → [Module Documents]
                                          ↓
                              [Behavior] [Narrative] [Moteur]
                                  (interfaces définies, pas de fusion)
```

**Description :** Un module autonome, isolé du pipeline behavior existant, traite les documents PDF selon ses propres règles. Il produit des sorties structurées qui peuvent être consommées par d'autres composants via des interfaces définies — mais il ne fusionne avec aucun d'eux.

**Avantages :**
- Isolation complète — aucun risque de contamination du pipeline existant
- Séparation nette des responsabilités : le module Documents lit les documents, le behavior engine lit les trades, le moteur narratif lit l'état du marché
- Permet une évolution indépendante : le module Documents peut implémenter les niveaux 1 à 4 sans contraindre les autres modules
- Cohérent avec le contrat d'isolation déjà appliqué au module behavior
- Supporte nativement la famille Utilisateur (journaux qualitatifs) que les Options A et B ne peuvent pas traiter

**Risques :**
- Plus de surface architecturale à maintenir
- Les interfaces entre le Module Documents et les autres composants doivent être formellement définies — risque de créer des couplages implicites si mal conçu
- Le module Documents est plus complexe que les Options A et B — il doit gérer les 4 niveaux de lecture de façon indépendante

**Impact sur l'architecture actuelle :** Faible sur l'existant, significatif sur la surface totale. Aucune modification des composants existants.

**Verdict : Architecture recommandée.** Elle est la seule qui respecte simultanément la doctrine d'isolation, la différence de nature entre document et donnée, et la séparation des responsabilités entre behavior, narration et moteur.

---

### 4.4 Recommandation architecturale

**Adopter l'Option C.**

Le Module Documents est un nouveau composant autonome, de même nature que le module Behavior actuel : il a ses propres sources de données (PDF), ses propres règles de traitement (niveaux 1 à 4), et des interfaces formellement définies vers les autres composants.

Son contrat d'isolation :

- Lit des PDF uniquement
- N'accède pas au payload du moteur principal
- N'émet pas d'événements globaux
- Expose ses sorties uniquement via des interfaces définies
- Ses données ne contaminent pas les métriques behavior existantes

---

## Partie 5 — Intégration Caméléon

### 5.1 Avec le module Behavior

**Type d'interface :** Comparatif, pas additif.

Le module Documents ne remplace pas et n'augmente pas les données behavior existantes. Il crée une **lecture parallèle** qui peut être confrontée aux patterns behavior.

Exemple d'interaction valide :

> Le behavior engine détecte `revenge_trading` sur 3 sessions consécutives.
> Le module Documents lit dans le journal de l'opérateur pour les mêmes dates : *"Je suis en dessous de mon objectif mensuel, je dois rattraper."*
> La confrontation des deux lectures produit une information de niveau 4 : pression de résultat documentée + comportement de revenge trading observé = confirmation d'une dynamique identifiée.

**Ce que cette interface ne fait pas :** le module Documents n'augmente pas le score behavior. Il contextualise une lecture, il ne la chiffre pas.

### 5.2 Avec le Moteur Narratif

**Type d'interface :** Contexte, pas voix supplémentaire.

Le moteur narratif (4 voix : Journal, Signal, Mantra, Décision) s'exprime sur l'état du marché. Le module Documents pourrait enrichir le **contexte** dans lequel les voix s'expriment — mais jamais devenir une voix lui-même.

Exemple d'interaction valide :

> Le module Documents a extrait d'une analyse macro récente : régime risk-off confirmé par plusieurs institutionnels.
> Le moteur narratif est en état `riskoff`.
> La congruence entre lecture documentaire externe et état marché détecté est une information de contexte — elle peut renforcer la certitude de la voix Signal, mais elle ne la crée pas.

**Ce que cette interface ne fait pas :** les documents PDF ne modifient pas le dictionnaire narratif. Ils ne créent pas de nouvelles voix. Ils ne surpassent pas la lecture du moteur sur le marché en cours.

### 5.3 Avec le Motion System

**Type d'interface :** Nulle dans la version actuelle.

Le Motion System est une couche atmosphérique visuelle. Il n'a pas de sémantique documentaire. Aucune connexion directe entre le module Documents et le Motion System n'est justifiée à ce stade.

*Exception future possible :* si un état comportemental issu de la lecture de documents produit un état cockpit spécifique (état "réflexion", état "post-analyse"), le Motion System pourrait avoir une vidéo associée — mais c'est un chantier de Motion V2, pas de PDF V1.

### 5.4 Avec V2

**Type d'interface :** Alimentation potentielle de la couche de cohérence.

V2 introduit une couche de cohérence inter-modules qui détecte les tensions entre les lectures des différents composants. Le module Documents pourrait alimenter cette couche avec des tensions de type **T5** (hypothétique) : tension entre comportement déclaré (journal) et comportement observé (behavior).

Cette interface n'est pas à concevoir maintenant. Elle est mentionnée pour anticiper sa place dans la cartographie des variables V2.

**Règle de garde pour l'intégration :**

> Aucune intégration du module Documents avec les autres composants ne doit créer une dépendance directionnelle. Les interfaces sont toujours des flux de lecture — jamais des flux de modification.

---

## Partie 6 — Risques

### 6.1 Faux positifs documentaires

**Définition :** Une information extraite du PDF qui semble cohérente mais est factuellement incorrecte (mauvaise extraction, confusion de champs, artefact de mise en page).

**Exemple :** Un montant de `12,345.67` lu comme `12.345,67` selon la locale — le système détecte une position de 12 fois la taille normale alors qu'elle est normale.

**Garde-fou :** Tout champ numérique extrait doit être accompagné d'un niveau de confiance explicite. En dessous d'un seuil, la donnée est écartée, pas estimée.

### 6.2 Hallucinations documentaires

**Définition :** Lorsqu'un composant sémantique (extraction NLP/LLM) est utilisé au niveau 3 ou 4, il peut produire des interprétations plausibles mais inventées — des connexions entre des passages qui n'existent pas réellement.

**Exemple :** Un système d'extraction sémantique lit *"j'ai été trop impulsif"* dans un journal et crée une entrée `impulsivite_score: 0.87` sans que l'opérateur ait décrit un pattern réel d'impulsivité dans ce passage.

**Garde-fou :** Au niveau 4, toute lecture Caméléon doit être attachée à une citation textuelle précise, vérifiable dans le document source. Pas de score sans ancre textuelle. Le module Documents ne produit jamais de synthèses sans source.

### 6.3 PDF mal structurés

**Définition :** Les PDF scannés, multi-colonnes, tableaux en image, PDF protégés ou PDF produits par conversion HTML approximative produisent des extractions de niveau 1 très dégradées. Tout ce qui suit est compromis.

**Exemple :** Un relevé Binance converti en PDF depuis leur interface web peut contenir des tableaux dont les colonnes sont mélangées à l'extraction. `USDT` devient la colonne de gauche, les montants se retrouvent dans la colonne symbole.

**Garde-fou :** Le module Documents doit classifier la qualité du PDF avant toute extraction (natif / hybride / scanné / non lisible). Les PDF non lisibles doivent être rejetés explicitement, pas silencieusement dégradés.

### 6.4 Documents incomplets

**Définition :** Un journal PDF couvrant janvier-mars puis juillet-septembre n'est pas un journal continu. Si le module Documents l'analyse comme tel, les patterns détectés sur les mois manquants sont des artefacts de l'absence de données.

**Garde-fou :** Toute analyse temporelle sur des documents doit détecter et signaler les lacunes temporelles. Une lacune n'est pas une absence de comportement — c'est une absence de données. La distinction est critique.

### 6.5 Sur-interprétation

**Définition :** Le système attribue une signification comportementale à un passage qui n'en a pas réellement, ou amplifie une mention anodine en signal fort.

**Exemple :** L'opérateur écrit *"le marché était difficile aujourd'hui"* — le système détecte une tension psychologique et crée un signal de fatigue décisionnelle. Mais l'opérateur décrivait simplement une volatilité élevée, pas son état mental.

**Garde-fou :** Les signaux de niveau 4 issus de documents textuels doivent être **corroborés** par au moins une donnée comportementale observable (issue du pipeline CSV/XLSX) avant d'être exposés dans le cockpit. Un signal documentaire seul ne doit jamais atteindre le cockpit — il nourrit un contexte, il ne le crée pas.

### 6.6 Contamination décisionnelle

**Définition :** Les analyses macro ou techniques extraites de documents externes (rapports institutionnels) peuvent introduire des biais de confirmation dans le cockpit. Si Caméléon Engine lit un rapport bullish sur BTC et qu'il l'intègre dans sa lecture, il cesse d'être un miroir et devient un propagateur d'opinion externe.

**Garde-fou :** Les documents de la famille Recherche (analyses, rapports macro) ne doivent **jamais** alimenter directement la lecture du moteur de décision ou le dictionnaire narratif. Ils peuvent, au maximum, enrichir un contexte lisible par l'opérateur — ils ne doivent pas modifier la lecture de Caméléon Engine sur l'état du marché.

> Caméléon Engine ne lit pas le marché à travers ce que les autres pensent du marché.

---

## Partie 7 — Roadmap

### 7.1 PDF V1 — Capacité minimale utile

**Objectif :** Permettre à l'opérateur d'importer un PDF structuré (rapport fiscal, relevé de performance) et d'en extraire des données numériques propres.

**Périmètre :**
- Niveaux 1 et 2 uniquement
- Familles ciblées : Binance (fiscaux, performance), Trading (journaux structurés exportés)
- Données extraites : métriques agrégées (win_rate, P&L total, nombre de trades sur période)
- Pas d'analyse comportementale — extraction de données uniquement
- Présentation : données brutes lisibles, avec niveau de confiance visible

**Ce que V1 n'est pas :**
- Un lecteur de journaux (texte libre)
- Un système de détection de patterns
- Une couche de signal

**Condition de déclenchement :** Stabilisation V2 cockpit + au moins une demande terrain réelle d'import de rapport fiscal PDF.

---

### 7.2 PDF V2 — Intelligence documentaire

**Objectif :** Extraire des informations structurées depuis des documents semi-structurés, y compris des journaux de trading exportés avec des annotations.

**Périmètre :**
- Niveaux 1, 2 et 3
- Familles ciblées : Trading (journaux exportés), Utilisateur (règles personnelles structurées)
- Capacités ajoutées : extraction de texte avec classification sémantique légère, détection de règles déclarées, identification de patterns comportementaux textuels
- Confrontation possible (pas automatique) avec les données behavior existantes

**Ce que V2 n'est pas :**
- Un système de coaching
- Une IA conversationnelle sur le document
- Un agrégateur de signaux documentaires

**Condition de déclenchement :** PDF V1 validé terrain + au moins une session d'usage terrain de journal exporté.

---

### 7.3 PDF V3 — Lecture comportementale avancée

**Objectif :** Atteindre le niveau 4 sur les journaux personnels. Produire des lectures comportementales issues de documents textuels libres, corroborées par les données behavior existantes.

**Périmètre :**
- Niveau 4 complet
- Famille Utilisateur uniquement (journaux personnels, notes post-session, bilans)
- Lecture de l'écart entre comportement déclaré et comportement observé
- Interface formelle avec V2 couche de cohérence inter-modules

**Ce que V3 n'est pas :**
- Un outil de psychologie
- Un thérapeute cognitif
- Un système d'évaluation des capacités du trader

**Condition de déclenchement :** PDF V2 validé + V2 moteur stable + au moins 30 sessions d'usage réel du journal PDF.

---

### 7.4 Ce qui est hors périmètre (définitif)

- Lecture de PDF de recherche externe pour alimenter le moteur de décision
- Génération de contenu à partir de PDF (résumés, synthèses)
- Comparaison entre plusieurs traders via leurs PDF
- Import de PDF depuis des sources en ligne
- Analyse d'images ou de graphiques dans les PDF

---

## Partie 8 — Dette potentielle — PDF_DEBT_REGISTER préliminaire

### Vision du registre

Le registre PDF_DEBT_REGISTER n'existe pas encore. Ce document en pose les fondements. Les dettes listées ici sont **anticipées**, pas observées — elles sont le résultat de la réflexion architecturale ci-dessus.

Elles ne doivent pas être ouvertes avant que PDF V1 soit en cours de développement.

---

**PDF-01 — Qualité OCR variable**
Type : Risque · Priorité : Haute
Relevance : V1

Les PDF scannés (photos de documents papier) produisent une extraction de niveau 1 fortement dégradée. La reconnaissance de caractères introduit des erreurs qui contaminent tous les niveaux suivants. Il n'existe pas de solution universelle — la qualité dépend de la résolution, de la mise en page, du contraste, de la langue.

*Dette :* Définir un protocole de classification qualité PDF (natif / hybride / scanné / illisible) et les seuils de rejet avant tout traitement.

---

**PDF-02 — Normalisation locale des nombres**

Type : Risque · Priorité : Haute
Relevance : V1

`1,234.56` (anglais) et `1.234,56` (français/allemand) représentent le même nombre. Les PDF fiscaux utilisent la locale du pays de l'utilisateur. Sans normalisation explicite, les montants extraits peuvent être erronés d'un facteur 1000.

*Dette :* Définir un protocole de détection de locale numérique avant toute extraction de montants.

---

**PDF-03 — Extraction de tables multi-colonnes**

Type : Lacune · Priorité : Haute
Relevance : V1

Les tableaux dans les PDF ne sont pas des tableaux HTML. Leur structure est définie par la position spatiale des caractères. Une extraction naïve produit des colonnes mélangées. Ce problème est particulièrement sévère pour les relevés Binance et les rapports fiscaux.

*Dette :* Définir une stratégie d'extraction tabulaire avec validation de cohérence (nombre de colonnes, types attendus, valeurs sentinelles).

---

**PDF-04 — Ambiguïté sémantique niveau 3**

Type : Risque · Priorité : Moyenne
Relevance : V2

L'extraction sémantique peut confondre des termes proches mais distincts. *"J'ai été discipliné aujourd'hui"* et *"Je n'ai pas respecté ma discipline"* ont des sémantiques opposées mais partagent le champ lexical de la discipline. Une extraction naïve pourrait les traiter identiquement.

*Dette :* Définir des règles de négation et de contexte phrase pour toute extraction sémantique comportementale.

---

**PDF-05 — Lacunes temporelles non détectées**

Type : Risque · Priorité : Moyenne
Relevance : V2

Un journal incomplet analysé comme un journal continu produit des artefacts de patterns (absence de données = comportement fictif sur la période manquante). La détection des lacunes temporelles n'est pas triviale si le journal ne contient pas de dates explicites pour chaque entrée.

*Dette :* Définir un protocole de détection de continuité temporelle dans les documents journaux avant toute analyse de patterns.

---

**PDF-06 — Confidentialité et stockage**

Type : Risque · Priorité : Haute
Relevance : V1

Les PDF fiscaux et les journaux personnels contiennent des données très sensibles : revenus réels, identité, informations financières personnelles. Si le module Documents stocke du contenu PDF en localStorage (même partiellement), la surface de risque augmente significativement.

*Dette :* Définir une politique explicite : le module Documents ne stocke **jamais** le contenu du PDF. Il peut stocker uniquement les données structurées extraites, après confirmation que le stockage est doctrinal.

---

**PDF-07 — Formats propriétaires instables**

Type : Lacune · Priorité : Moyenne
Relevance : V1

Les rapports Binance changent de format entre versions et régions. Un extracteur calibré sur le format 2025 peut produire des données mal interprétées sans erreur visible sur le format 2026. Les rapports de performance des brokers tiers sont encore plus hétérogènes.

*Dette :* Tout extracteur de PDF formaté doit inclure une version attendue et un mécanisme de détection de divergence de format (pas de parsing silencieux en cas d'anomalie structurelle).

---

**PDF-08 — Écart déclaré/observé non validé terrain**

Type : Question ouverte · Priorité : Basse
Relevance : V3

L'hypothèse centrale de PDF V3 est que le journal personnel de l'opérateur contient des informations comportementales exploitables qui peuvent être confrontées aux patterns behavior. Cette hypothèse n'a pas encore été validée sur des données réelles. Il est possible que la plupart des journaux de trading soient trop vagues, trop rares, ou trop biaisés pour produire des lectures fiables.

*Dette :* PDF V3 ne peut être conçu que si au moins 10 journaux réels ont été analysés manuellement et ont produit des informations comportementales vérifiables et non redondantes avec les patterns CSV.

---

## Conclusion — Nouveau pilier ou nouvelle source de données ?

La question posée en préambule mérite une réponse nuancée.

**Pour les familles Binance et Trading structuré :** les PDF sont une **nouvelle source de données** — un format alternatif qui apporte des agrégats non disponibles dans les CSV. Ils ne justifient pas un pilier architectural dédié, mais ils justifient un composant de traitement documentaire spécialisé.

**Pour la famille Recherche :** les PDF sont une **source de contexte**, pas de signal. Leur intégration dans le cockpit est limitée, risquée, et hors périmètre du cockpit cognitif tel que défini par le Manifeste. Caméléon Engine ne lit pas le marché à travers les opinions d'autres analystes.

**Pour la famille Utilisateur — journaux, notes, règles personnelles :** les PDF représentent un **nouveau pilier stratégique**. Ils sont la seule source disponible de données comportementales qualitatives — le raisonnement, la déclaration, l'intention. Croisées avec les données comportementales quantitatives (CSV), elles permettent de répondre à la question que le pipeline actuel ne peut pas poser :

> *Le trader sait-il ce qu'il fait réellement ?*

Ce n'est pas la même question que *"qu'est-ce que le trader fait ?"*. C'est la question d'un cockpit cognitif, pas d'un outil d'analyse de performance. C'est pourquoi, pour cette famille spécifique, les PDF ne sont pas une fonctionnalité. Ils sont une extension de la proposition de valeur fondamentale du produit.

---

## Règle de garde finale

> **"Un PDF ne devient une source pour Caméléon Engine que lorsque ce qu'on en extrait répond à une question que le moteur ne peut pas poser sans lui. Si la même information existe dans un CSV, le CSV prime."**
