# Couche Macro — Architecture Stratégique

Caméléon Engine · Direction Architecture
Date : 2026-06-05
Statut : **Réflexion stratégique figée — aucune implémentation immédiate**

---

## 1. Problème central

Caméléon Engine sait analyser aujourd'hui :

- l'état local du marché (range / compression / expansion / defense / riskoff)
- le comportement de l'opérateur (discipline, impulsivité, sizing, timing)
- les patterns d'exécution (historique de sessions, profil comportemental)
- les configurations locales (structure, momentum, zone, validation humaine)
- les signaux structurels locaux (cassure, sweep, reclaim)

Ce qu'il ne sait pas encore : **le contexte global dans lequel ces signaux apparaissent.**

Un breakout validé dans un marché en phase d'accumulation à levier faible n'est pas le même objet analytique qu'un breakout identique dans un marché en phase de distribution à funding extrême. Le moteur les traite de manière identique. Il est structurellement aveugle à cette distinction.

**Le problème n'est pas le signal.**
**Le problème est le contexte de validité du signal.**

Sans connaissance du contexte global, Caméléon Engine produit des analyses qui supposent implicitement des conditions "moyennes" de marché. Il peut calculer un score. Il ne peut pas qualifier ce score selon les conditions de son environnement de production. Ce plafond est définitif sans couche macro.

---

## 2. Limite actuelle — Couche Macro Phase 1

La Couche Macro Phase 1 (commits `877d678` + `78d2455`, validation terrain 2026-06-05) est techniquement propre. MACRO-RULE-01 est respectée : les champs macro ne contaminent ni le score, ni la posture, ni les actions. L'architecture de non-contamination du moteur est correcte.

Mais elle est **produitement incomplète**, pour une raison fondamentale :

| Ce qu'elle construit | Ce qu'elle ne construit pas |
|---|---|
| Le récepteur (emplacement UI, groupe de champs, overlay narratif) | L'émetteur (source de données, analyse, calcul d'état) |
| La mécanique d'injection dans le cockpit | La donnée à injecter |
| La séparation architecturale narrative / moteur | L'intelligence macro elle-même |

La Phase 1 repose sur une **déclaration utilisateur**. L'opérateur doit avoir fait son analyse macro de manière indépendante, externe au cockpit, avant de pouvoir renseigner les champs. Le cockpit lui renvoie ensuite ce qu'il vient de lui dire, sous forme de suffixe narratif. La chaîne de valeur est circulaire.

Ce n'est pas un défaut d'implémentation. C'est une limite de périmètre. La Phase 1 a été construite avant que l'émetteur n'existe.

**La Phase 1 ne doit pas être considérée comme la fonctionnalité macro finale.**
Elle est reclassifiée à la section 9.

---

## 3. Vision cible

La vision cible n'est pas d'enrichir le moteur local. C'est d'ajouter une couche d'intelligence indépendante qui change la profondeur de lecture du cockpit.

**Pipeline macro cible :**

```
Sources macro automatisées
  → Analyse macro (calcul d'états)
  → États macro (régime / levier / liquidité / dominance / phase de cycle)
  → Cockpit (contextualisation des outputs existants)
  → Analyse croisée : comportement opérateur × régime macro
    → Intelligence nouvelle : "cet opérateur dans ce régime"
```

**Sources potentielles :**

| Source | Ce qu'elle mesure |
|---|---|
| BTC Dominance | Flux de capital vers la sécurité vs l'exposition altcoin |
| Stablecoin Dominance | Réserve de liquidité en attente / retrait vers la sécurité |
| TOTAL | Capitalisation totale crypto — phase de cycle globale |
| TOTAL2 | Capitalisation hors BTC — santé du marché altcoin |
| Open Interest | Levier systémique agrégé — fragilité structurelle |
| Funding Rates | Pression directionnelle du levier — biais dominant |
| DXY | Corrélation macro externe — appétit au risque global |
| Volatilité | Amplitude des mouvements — coût cognitif de la lecture |
| Liquidité globale | M2 / conditions de crédit — contexte macro profond |
| Flux ETF | Positionnement institutionnel — validation ou divergence |

Ces sources ne sont pas équivalentes. Certaines mesurent le régime (TOTAL, BTC.D). D'autres mesurent la fragilité (OI, Funding). D'autres mesurent le contexte externe (DXY, liquidité globale). Leur combinaison produit une lecture que chaque source seule est incapable de fournir.

---

## 4. Usages prioritaires — classement par valeur produit

### 1 — Fiabilité environnementale du signal *(valeur maximale)*

Le score produit par le moteur local est calibré sur des conditions moyennes. Il ne sait pas si ces conditions sont actuellement réunies. Un score de 72 dans un environnement de levier faible, liquidité abondante et régime d'accumulation n'est pas le même que 72 dans un environnement de funding extrême, OI record et distribution active.

La couche macro permettrait de qualifier chaque output du moteur par son environnement de production — sans modifier le score, en contextualisant sa portée. C'est l'usage le plus immédiatement utile : il enrichit chaque session sans nécessiter de nouveau module.

### 2 — Régime de marché global *(valeur haute)*

Le cockpit situe l'opérateur dans l'espace local (état du marché analysé). Il ne sait pas où se trouve le marché crypto dans son cycle. Accumulation, expansion, euphorie, distribution, capitulation : ces phases changent la signification de chaque signal local. Un breakout en phase de distribution a des probabilités de continuation radicalement différentes du même breakout en phase d'accumulation.

La couche macro ajouterait une seconde coordonnée : où sommes-nous dans le cycle global ? L'analyse locale resterait inchangée — elle serait simplement positionnée dans son contexte réel.

### 3 — Comportement opérateur × régime macro *(valeur unique, exclusive à Caméléon Engine)*

C'est l'usage le plus différenciateur. Aucun outil d'analyse technique, aucun agrégateur macro ne peut répondre à la question : **comment cet opérateur spécifique se comporte-t-il lorsque le marché est dans cet état spécifique ?**

Cette question n'est accessible que si le profil comportemental de la personne et le régime macro au moment de chaque session coexistent dans le même système. C'est une corrélation temporelle entre deux flux de données. Son résultat est une intelligence personnelle en contexte systémique — ni signal de trading, ni analyse comportementale seule.

### 4 — Psychologie collective comme filtre cognitif *(valeur haute)*

En marché euphorique, même les opérateurs disciplinés dérivent. En marché de capitulation, même les opérateurs préparés freezent ou vengent. Ces dégradations ne sont pas des faiblesses individuelles — elles sont des réponses à des stimuli collectifs. La couche macro permettrait à Caméléon de contextualiser l'état comportemental de l'opérateur : cette dégradation est-elle personnelle ou systémique ?

### 5 — Environnement de liquidité et risque systémique *(valeur haute)*

OI + Funding + flux stablecoins mesurent le levier systémique et les conditions de liquidité. Dans un environnement de funding extrême, même les setups techniquement valides échouent à des taux anormaux sous l'effet de liquidations forcées et de cascades de margin call indépendantes de l'analyse locale. La couche macro permettrait de signaler ces conditions sans toucher au moteur.

### 6 — Lecture des cycles pour calibration des attentes *(valeur structurelle)*

Les phases de cycle affectent les taux de réussite de base de toutes les configurations. En bull market, les signaux directionnels ont une prime de continuation. En bear market, le bruit est plus élevé et les faux signaux plus fréquents. Cette calibration systémique enrichit la lecture narrative du cockpit sans modifier le calcul du score.

---

## 5. Ce qui est structurellement impossible sans couche macro

Ces limitations ne sont pas des lacunes corrigeables par une amélioration du moteur local ou du module comportemental. Elles sont structurelles : elles disparaissent uniquement avec une source de données macro réelle.

**Impossible 1 — Fiabilité environnementale**

Le cockpit ne peut jamais qualifier ses propres outputs selon les conditions de leur environnement de production. "Score 72, configuration valide" signifie la même chose par temps calme et par tempête systémique. Ce plafond est définitif.

**Impossible 2 — Détection de divergence systémique**

BTC dominance en hausse forte pendant que l'opérateur analyse un setup altcoin : le capital se réalloue systémiquement vers le BTC, créant un vent contraire structurel. Le cockpit ne peut pas le détecter. Il analyse l'actif sans savoir que le marché global se repositionne contre sa direction.

**Impossible 3 — Corrélation comportement personnel × régime**

Le module comportemental accumule une histoire des patterns de l'opérateur. Mais il ne peut pas répondre : dans quel environnement cet opérateur se dégrade-t-il ? Quand est-il le plus discipliné ? Quand est-il le plus exposé au FOMO systémique ? Pour répondre à ces questions, il faut disposer des données comportementales ET des données macro au même moment, sur une durée suffisante pour que les corrélations émergent. Ce calcul est impossible tant que les deux flux ne coexistent pas dans le système.

**Impossible 4 — Détection de biais de confirmation macro-induit**

En euphorie, les opérateurs cherchent inconsciemment à confirmer leur exposition existante. Ils sur-interprètent les signaux favorables et sous-pondèrent les signaux contraires. Le cockpit peut voir "l'opérateur invalide peu de setups en ce moment" mais ne peut pas attribuer ce comportement à un biais de confirmation systémique provoqué par le régime. Il voit le comportement. Il ne peut pas voir sa cause externe.

---

## 6. Comportement opérateur × régime macro

Les comportements d'un opérateur changent selon le régime macro. Ce n'est pas une hypothèse — c'est une réalité documentée dans la littérature de finance comportementale et observable dans les données d'exécution.

**Même opérateur, trois régimes — manifestations observables :**

*Régime euphorique :*
Le sizing augmente progressivement, justifié rationnellement ("le momentum est fort"). Le délai entre les setups diminue ("je ne veux pas rater les mouvements"). Les critères de validation se relâchent ("c'est presque parfait, suffisant"). L'opérateur se dit toujours discipliné — il suit ses règles formelles — mais les règles elles-mêmes dérivent vers plus de permissivité. C'est la dégradation la plus dangereuse parce qu'elle est invisible de l'intérieur.

*Régime de range sans tendance :*
Deux réponses opposées sont possibles selon le profil. Certains opérateurs deviennent hyper-disciplinés parce que les opportunités sont rares — ils attendent. D'autres forcent des setups pour rester actifs — ils s'ennuient dans l'inaction. Laquelle de ces deux réponses décrit un opérateur donné est précisément le genre de signature individuelle que Caméléon Engine pourrait apprendre à reconnaître.

*Régime de capitulation :*
Le gel (paralysie décisionnelle), la revanche (risque excessif pour compenser les pertes récentes), ou paradoxalement une lucidité accrue chez certains profils qui fonctionnent mieux sous pression. Ces réponses sont profondément individuelles. Mais elles ne peuvent être observées et corrélées qu'avec des données qui indiquent que le marché était en capitulation au moment de la session.

**Comment Caméléon Engine apprendrait cela :**

Par accumulation silencieuse sur durée. À chaque session, le système enregistrerait simultanément : l'état comportemental de l'opérateur (scores, patterns, anomalies) et l'état macro du marché (régime, levier, dominance, funding). Après N sessions, des corrélations émergeraient sans avoir été programmées.

Exemples de lectures obtenues par corrélation :
- "Quand le funding dépasse X% pendant plus de Y jours, le score d'impulsivité de cet opérateur augmente de Z%."
- "Cet opérateur valide 30% moins de setups en phase de distribution qu'en phase d'accumulation."
- "Le sizing de cet opérateur est statistiquement plus discipliné dans les environnements de faible OI."

Ces lectures ne sont pas génériques. Elles sont des portraits personnels en contexte systémique. Ni signal de trading, ni analyse comportementale seule : l'intersection des deux.

---

## 7. Statut stratégique

**Décision : la macro n'est pas un chantier secondaire. La macro est un futur pilier du produit.**

Sous une condition : elle ne doit pas rester un enrichissement narratif. Elle doit devenir une couche indépendante, au même niveau architectural que le moteur comportemental.

| Positionnement | Résultat |
|---|---|
| Enrichissement narratif (option A) | Valeur partielle, toujours secondaire, toujours optionnelle |
| Moteur central de contextualisation (option B) | Risque de contamination de la neutralité du signal local |
| Couche indépendante au même niveau (option C) | Valeur pleine, intersections productives avec les autres couches |

**Pourquoi option C :**

Le module comportemental a sa propre architecture — données, pipeline, états, persistance. Il enrichit le cockpit sans le commander. Il produit des lectures indépendantes. La couche macro doit avoir exactement la même structure. Sa propre source de données, son propre pipeline d'analyse, ses propres états, sa propre persistance. Elle ne commande ni le moteur local ni le module comportemental.

L'architecture de l'égalité entre les trois couches produit une intelligence émergente que chaque couche seule est incapable de produire : moteur local + module comportemental + couche macro → l'intersection de ces trois lectures est le différenciateur absolu du produit.

---

## 8. Architecture conceptuelle

```
SOURCES
│
├── Données macro                    Données opérateur               Session en cours
│   BTC.D · Stablecoin.D            Trade History                   États cognitifs
│   TOTAL · TOTAL2                  Order History                   Validation
│   OI · Funding · DXY              Wallet History                  Émotion
│   Volatilité · ETF Flows          (imports CSV / PDF)             Formulaire cockpit
│   Liquidité globale
│
          ↓                                  ↓                              ↓
│
ANALYSES
│
├── Analyse macro                    Analyse comportementale         Analyse locale
│   Détection de régime              Patterns d'exécution            Scoring moteur
│   Environnement de levier          Discipline / Impulsivité        Posture
│   Qualité de liquidité             Sizing · Timing                 Actions
│   Dynamique de dominance           Profil comportemental           Policy
│   Phase de cycle
│
└── ANALYSE CROISÉE (couche émergente)
    Comportement opérateur × régime macro
    → corrélations personnelles sur durée
    → "cet opérateur dans ce régime"
│
          ↓                                  ↓                              ↓
│
ÉTATS
│
├── Régime macro global              État comportemental             Payload moteur
│   accumulation / expansion /       discipliné / réactif /          score / posture /
│   euphorie / distribution /        impulsif / agressif             actions / policy
│   capitulation
│
├── Environnement de risque          Signature individuelle
│   sain / tendu / extrême           × régime macro
│
└── Fiabilité environnementale du signal
    → qualifie le payload moteur sans le modifier
    → enrichit le registre narratif
│
          ↓
│
COCKPIT
│
├── Lecture locale                   (moteur — inchangé)
├── Lecture comportementale          (module comportemental — inchangé)
├── Lecture macro                    (couche macro — à construire)
└── Lecture croisée                  (intersection émergente — à construire)
    "Cet opérateur, dans ce régime, dans cette configuration locale"
```

Les trois couches coexistent au même niveau. Aucune ne commande les deux autres. Leurs intersections produisent des lectures qu'aucune couche seule ne peut générer.

---

## 9. Relation avec la Couche Macro Phase 1

La Couche Macro Phase 1 reste dans le produit. Elle n'est pas supprimée.

**Ce qu'elle apporte :**
- Le slot UI : l'emplacement dans le formulaire est établi
- La famille `contextualFields` : l'architecture de séparation des champs déclaratifs est posée
- `applyMacroOverlay()` : la mécanique d'injection narrative dans `#cs-message` est construite et testée
- MACRO-RULE-01 : la règle de non-contamination du moteur est documentée, testée et validée terrain

**Ce qu'elle est réellement :**

Infrastructure préparatoire en attente d'une source macro automatisée.

Elle a construit le récepteur. Elle n'a pas construit l'émetteur. Quand une source macro automatisée existera, les champs déclaratifs manuels seront remplacés par des états calculés. La mécanique d'injection (`applyMacroOverlay`, `renderConfidenceContext`, `contextualFields`) sera réutilisée ou évoluera.

**Ce qu'elle n'est pas :**

La fonctionnalité macro finale. Elle ne doit pas être présentée comme telle à l'utilisateur. Un opérateur qui voit "Dominance macro" et "Désordre structurel" sans définitions opérationnelles précises, sans seuils, sans guidage analytique, est livré à sa propre subjectivité. La valeur dépend entièrement de sa capacité à faire l'analyse macro de manière indépendante avant d'ouvrir le cockpit.

---

## 10. Décision doctrinale — Pas de proxy Constellium

**Décision figée. Non négociable.**

### Ce qui a été rejeté

Une direction a été explorée puis abandonnée : calculer `dominanceMacro` et `desordreStructurel` automatiquement à partir des champs existants du formulaire, en particulier les champs Constellium — `water`, `ether`, `fire`, `air`, `earth`.

Cette direction a été rejetée formellement. Elle ne doit pas être rouverte.

### Pourquoi les champs Constellium ne sont pas des capteurs macro

Les champs `ether`, `fire`, `air`, `earth`, `water` sont des **identifiants de la Couche 5 Expression — Constellium**. Ils décrivent l'état de lecture de l'opérateur selon un référentiel symbolique interne au produit. Ils ne mesurent pas de données de marché objectivement calculables.

| Champ Constellium | Ce qu'il représente réellement | Ce qu'il ne mesure pas |
|---|---|---|
| `water` | Liquidité perçue du carnet local | OI agrégé / Liquidité M2 / ETF flows |
| `ether` | Contexte de momentum / émotion marché | BTC Dominance / Stablecoin Dominance |
| `fire` | Intensité directionnelle locale | Funding Rates systémiques |
| `air` | Légèreté structurelle / compression | Volatilité réalisée multi-actifs |
| `earth` | Ancrage structurel / support | Cycle TOTAL / TOTAL2 |

Utiliser ces champs comme proxy macro produirait une **fausse précision** : l'apparence d'un calcul objectif sur des données qui sont des jugements subjectifs d'opérateur, non des mesures instrumentales.

### La doctrine fondatrice : pas d'approximation

Caméléon Engine ne mesure pas approximativement. Il mesure précisément ce qu'il mesure, ou il ne mesure pas. Un proxy construit sur des données inadéquates n'est pas une fonctionnalité macro — c'est un artefact analytique qui fausse la lecture sans que l'opérateur en soit conscient.

**La règle :**

> **Pas de macro calculée depuis le Constellium.**
> **Pas de proxy.**
> **Pas de fausse précision.**

### Ce que cela implique pour la Phase 1

La Couche Macro Phase 1 reste dans son périmètre actuel — déclaration manuelle par l'opérateur, modulation narrative de `#cs-message` uniquement. Elle ne doit pas être étendue par un mécanisme de calcul automatique fondé sur les champs Constellium.

La Phase 1 restera infrastructure préparatoire jusqu'à ce qu'une **source de données macro objective** existe dans le système.

### Sources macro objectives requises pour ouvrir la vraie Couche Macro

La vraie Couche Macro ne s'ouvre que lorsqu'au moins une de ces sources est disponible de manière fiable et objective :

- BTC Dominance (%)
- Stablecoin Dominance (%)
- TOTAL / TOTAL2 (capitalisations calculées)
- Open Interest agrégé (données exchanges)
- Funding Rates (données exchanges)
- DXY réel (cours de marché)
- Volatilité réalisée (calcul sur séries temporelles)
- Flux ETF (données institutionnelles)

Ces données sont **instrumentales** — elles se calculent indépendamment de la lecture de l'opérateur. C'est la différence fondamentale avec les champs Constellium, qui sont des jugements contextuels.

---

## 11. Conditions d'ouverture d'un vrai chantier macro

**Ne pas ouvrir maintenant.** Ce document est une réflexion stratégique figée, pas une feuille de route d'implémentation.

Conditions futures à réunir avant d'ouvrir ce chantier :

1. **Choix des sources macro** — quelles données, quelle fréquence de mise à jour, quelle méthode d'acquisition (import manuel, API, calcul local). Chaque source a des implications de maintenance et de fiabilité différentes.

2. **Définition des états macro** — quels états calculés, quels seuils, quelle granularité. Les états doivent être opérationnels (actionables par le cockpit) et non redondants avec l'analyse locale.

3. **Stratégie d'acquisition des données** — local-first implique que les données macro soient disponibles sans dépendance infrastructure externe permanente. Cette contrainte est non négociable à ce stade du produit.

4. **Règle de non-contamination du moteur** — étendre MACRO-RULE-01 au chantier complet : les états macro calculés ne modifient jamais le score, la posture, les actions ni le moteur décisionnel. Seul le registre narratif et la couche d'analyse croisée sont autorisés.

5. **Décision sur le stockage historique** — la corrélation comportement × régime nécessite un historique de sessions avec état macro associé. Quel format, quelle persistance, quelle fenêtre temporelle ?

6. **Lien avec le module comportemental** — définir précisément comment les deux flux (comportemental + macro) se rejoignent pour produire la lecture croisée. Ce lien est le cœur de la valeur produit.

7. **Utilité cockpit démontrée** — au moins un cas d'usage terrain documenté montrant que la lecture croisée comportement × régime a produit une information utile que l'opérateur n'aurait pas produite seul.

---

## 12. Conclusion

La macro n'est pas un chantier secondaire.
La macro n'est pas simplement un chantier important.
**La macro est un futur pilier du produit** — sous la condition qu'elle devienne une couche indépendante corrélée avec le module comportemental, et non un simple enrichissement narratif.

Caméléon Engine ne sera peut-être jamais le meilleur outil d'analyse technique. Il ne sera peut-être jamais le meilleur agrégateur de données macro.

Mais il peut devenir le seul outil capable de répondre à cette question :

> **"Comment cet opérateur spécifique se comporte-t-il lorsque le marché global est dans cet état précis ?"**

Cette question n'est posée par aucun autre outil. Elle est à la fois personnelle — ce n'est pas une statistique agrégée sur des milliers d'opérateurs — et systémique — ce n'est pas une introspection sans contexte externe. Elle nécessite les deux flux simultanément, un historique de sessions suffisant pour que les corrélations émergent, et un système conçu dès le départ pour les accueillir.

Caméléon Engine est ce système. La couche macro, construite correctement, en sera le deuxième pilier.
