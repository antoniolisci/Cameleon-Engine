# Couche Macro — Logging Session × Macro_State (Phase 5)

**Caméléon Engine · Direction Architecture**
**Date : 2026-06-10**
**Statut : Document décisionnel Phase 5 — doctrine de logging uniquement**
**Prérequis : Phases 0 à 4 validées**

---

## 1. Mission

Définir la mémoire minimale à conserver aujourd'hui pour que Caméléon Engine puisse apprendre quelque chose dans 6 à 24 mois.

Pas d'implémentation. Pas d'UI. Pas de code.

Une seule question : que faut-il enregistrer maintenant pour que l'intelligence future soit possible ?

**Rappel de doctrine :**
La Couche Macro existe pour enrichir la compréhension du comportement dans un contexte donné. Elle n'existe pas pour améliorer les prédictions de marché.

---

## 2. Unité de logging

### Pourquoi une seule unité est nécessaire

Plusieurs candidats sont possibles : snapshot, lecture, observation, session. Une seule doit être retenue pour éviter l'ambiguïté sur ce qui constitue un point de données exploitable.

**Snapshot** — trop ponctuel, sans contexte décisionnel.
**Lecture** — ambigu entre lecture marché et lecture moteur.
**Observation** — trop passif, ne capture pas l'engagement de l'opérateur.
**Session** — correspond à un cycle complet d'utilisation : l'opérateur entre, pilote, lit le verdict, décide. C'est le seul niveau qui contient à la fois le contexte et l'intention décisionnelle.

### Unité retenue : la Session

**Définition :** une session commence quand l'opérateur engage le Pilotage et se termine quand il a lu le verdict moteur. Elle constitue un acte décisionnel complet.

Ce qui n'est pas une session : un rechargement de page, une consultation de la Mémoire sans saisie, une mise à jour macro sans utilisation du Moteur.

---

## 3. Champs minimaux

### Philosophie de sélection

Chaque champ retenu doit répondre à une future question sur le comportement dans un contexte. Chaque champ rejeté doit être rejeté parce qu'il capture la performance, pas le comportement.

---

**Champs obligatoires**

| Champ | Rôle | Utilité future | Obligatoire |
|---|---|---|---|
| `session_id` | Identifiant unique de la session | Clé de jointure entre modules | Oui |
| `timestamp` | Moment de la session | Chronologie · fréquence · patterns temporels | Oui |
| `macro_state` | État macro au moment de la session | Corrélations comportement × régime | Oui |
| `macro_data_date` | Fraîcheur des données macro utilisées | Qualifier la fiabilité du macro_state loggé | Oui |
| `macro_completeness` | Familles disponibles (A, B, C, partiel, absent) | Pondérer les corrélations futures selon la qualité du contexte | Oui |
| `emotion_state` | État émotionnel déclaré (calm / neutral / stress / fomo) | Corrélation FOMO × Macro_State · dégradation comportementale | Oui |
| `validation_state` | Validation humaine (accepted / pending / adjusted / rejected) | Corrélation rigueur de validation × contexte macro | Oui |
| `need_action` | Besoin d'action déclaré (no / maybe / yes) | Suractivité × Macro_State · pression à agir | Oui |
| `operator_profile` | Profil actif (PASSIVE / BALANCED / ACTIVE) | Cohérence du cadre × régime | Oui |
| `market_posture` | Posture moteur (DÉFENSE / NEUTRE / ATTAQUE ou équivalent) | Alignement posture × Macro_State | Oui |

---

**Champs optionnels**

| Champ | Rôle | Utilité future | Obligatoire |
|---|---|---|---|
| `market_state_label` | État de marché déclaré (tendance / range / compression…) | Contexte technique au moment de la décision | Non |
| `adaptive_filter` | Filtre adaptatif actif | Cohérence du cadre opérateur × régime macro | Non |
| `session_duration_class` | Court / Moyen / Long (qualitatif, pas en secondes) | Engagement × régime · réflexion vs impulsivité | Non |

---

**Ce qui n'est jamais enregistré**

- Montants, tailles de positions, capitaux engagés
- PnL, résultats de trades, performance
- Historique de portefeuille
- Prix d'entrée ou de sortie
- Données personnelles identifiantes
- Valeurs numériques brutes des indicateurs macro (BTC dominance %, funding rate %)

**Pourquoi les valeurs numériques brutes sont exclues du log**
Ces valeurs ont une durée de validité limitée et ne sont pas interprétables hors contexte. Ce qui compte pour la corrélation future n'est pas que BTC.D était à 56.3% — c'est que le Macro_State était CONTRACTÉ. L'état est l'information stable. La valeur numérique est le détail technique qui l'a produit.

---

## 4. Lien Session × Pilotage × Macro_State × Moteur

### La session comme pont entre quatre sources

```
Pilotage (cadre opérateur)
  → Macro_State (contexte systémique)
  → Moteur (verdict local)
  → Décision (validation humaine)
        ↓
    Session loggée
```

Chaque session capture la rencontre entre ce que l'opérateur a décidé de faire (Pilotage), dans quel environnement il a décidé (Macro_State), ce que le moteur en a conclu (posture), et comment l'opérateur a accueilli cette conclusion (validation).

C'est la juxtaposition de ces quatre dimensions sur une même unité temporelle qui crée la valeur future. Aucune des quatre dimensions seule ne suffit.

### Ce que cette jonction rend possible

Sur suffisamment de sessions, il devient possible de répondre à des questions du type :
- L'opérateur valide-t-il plus facilement les verdicts ATTAQUE en contexte EXPANSIF ?
- Sa fréquence de changement de profil change-t-elle selon le Macro_State ?
- Son état FOMO est-il corrélé à un régime Macro particulier ?
- La qualité de sa validation (accepted vs adjusted) varie-t-elle selon le contexte systémique ?

---

## 5. Ce qui est perdu sans logging

### Irrecouvrabilité

Certaines informations peuvent être partiellement reconstruites après coup. D'autres sont perdues définitivement si elles ne sont pas capturées au moment exact.

**Peut être partiellement reconstruit**
- L'état de marché approximatif (données prix historiques publiques)
- Le Macro_State approximatif (si les données historiques macro sont disponibles et que les règles de calcul n'ont pas changé)

**Perdu définitivement**
- L'état émotionnel de l'opérateur à ce moment précis
- La validation humaine qu'il a choisie ce jour-là
- Son besoin d'action ressenti
- Le profil qu'il avait activé
- La combinaison exacte de ces dimensions dans ce contexte spécifique

La combinaison est irreconstruible. Même si les données macro peuvent être retrouvées, le comportement de l'opérateur dans ce contexte à ce moment précis est unique. C'est exactement cet enregistrement qui constitue la matière première des corrélations futures.

**Conséquence opérationnelle**
Une session non loggée est une session perdue pour toujours. Même si l'opérateur se souvient de son état émotionnel ce jour-là, la reconstruction rétrospective est biaisée. Seul l'enregistrement en temps réel est fiable.

---

## 6. Politique de conservation

### Tension avec l'architecture actuelle

L'architecture mémoire actuelle (MEM-01B) plafonne l'historique des sessions comportementales à 50 entrées FIFO. Ce plafond est insuffisant pour produire des corrélations comportement × régime macro exploitables.

Les corrélations nécessitent :
- Suffisamment de sessions par régime pour être statistiquement défendables
- Une couverture temporelle permettant de voir les mêmes régimes se répéter
- Les estimations terrain suggèrent un minimum de 20 à 30 sessions par régime — soit 60 à 90 sessions minimum pour trois régimes couverts

**Le plafond actuel de 50 sessions est une contrainte à résoudre avant l'activation des corrélations personnelles.**

### Trois horizons de conservation

**Court terme (0–3 mois)**
Toutes les sessions sont conservées intégralement. Aucune purge. Cette période constitue la base de données initiale.
Objectif : accumuler les premières sessions par régime sans chercher de corrélations prématurées.

**Moyen terme (3–12 mois)**
Les sessions les plus anciennes peuvent être agrégées si le volume dépasse la capacité de stockage local.
Règle d'agrégation : ne jamais agréger deux sessions de Macro_State différents. Les régimes doivent rester distincts dans l'historique.

**Long terme (12 mois+)**
Les corrélations personnelles deviennent exploitables si les seuils de volume par régime sont atteints.
Les sessions individuelles de plus de 24 mois peuvent être archivées en format réduit (macro_state + emotion_state + validation_state uniquement).

---

## 7. Corrélations futures possibles

Ces corrélations ne nécessitent pas de calcul statistique complexe. Des tableaux de contingence simples suffisent.

**FOMO × Macro_State**
L'opérateur déclare-t-il FOMO plus fréquemment dans un Macro_State particulier ? Si oui, son comportement en contexte EXPANSIF est peut-être contaminé par un biais d'excitation systémique. Ce pattern est invisible sans le croisement des deux dimensions.

**Suractivité × Macro_State**
La fréquence des sessions augmente-t-elle dans un régime donné ? Un opérateur qui triple sa fréquence en EXPANSIF présente un comportement identifiable — et potentiellement problématique.

**Validation humaine × Macro_State**
L'opérateur ajuste-t-il ou rejette-t-il plus souvent les verdicts moteur dans un régime particulier ? Ce pattern révèle si le contexte macro induit une déférence excessive ou une résistance systématique.

**Changements de profil × Macro_State**
L'opérateur change-t-il de profil (PASSIVE → ACTIVE) corrélativement à un changement de Macro_State ? Si oui, il adapte son cadre au climat — comportement à qualifier selon le sens de la corrélation.

**Stress × Macro_State**
L'état stress est-il plus fréquent en CONTRACTÉ ? Ce pattern permettrait de distinguer le stress comme réaction au contexte (normal) du stress comme état chronique (signal d'alarme comportemental).

**Alignement posture × Macro_State**
La posture moteur (ATTAQUE) coïncide-t-elle fréquemment avec un Macro_State CONTRACTÉ ? Cette configuration révèle une potentielle opposition entre l'analyse locale et le contexte systémique — non bloquante, mais utile à observer.

---

## 8. Risques cognitifs du logging

**Biais de présentation**
L'opérateur sait que ses sessions sont loggées. Il peut adapter inconsciemment son comportement déclaré pour "paraître cohérent". L'état émotionnel déclaré perd sa valeur si l'opérateur le filtre.
Protection : le logging doit être suffisamment discret pour ne pas être perçu comme une évaluation. Les données ne sont jamais présentées comme un score de cohérence.

**Sur-interprétation précoce**
Avec 10 sessions, aucune corrélation n'est fiable. L'opérateur qui voit "3 fois FOMO en EXPANSIF" peut en conclure une règle qui n'existe pas.
Protection : les corrélations personnelles ne sont affichées qu'à partir d'un seuil de volume validé. Sous ce seuil, aucune lecture personnelle n'est proposée.

**Rétroactivité biaisée**
L'opérateur consulte son historique et réinterprète ses sessions passées à la lumière de ce qu'il sait maintenant. Ce n'est pas du logging — c'est de la rationalisation.
Protection : le logging capture l'état au moment de la session. Les sessions ne sont jamais modifiables après enregistrement.

**Dépendance aux statistiques**
L'opérateur commence à trader selon ses propres corrélations plutôt qu'à analyser. "Je ne trade pas en CONTRACTÉ parce que mes stats sont mauvaises dans ce régime."
Protection : les corrélations sont présentées comme des observations, jamais comme des règles. Le registre narratif s'applique aussi aux lectures personnelles.

---

## 9. Pourquoi le logging est la vraie fondation

Les phases 0 à 4 définissent la doctrine, l'acquisition, le format, le calcul et le langage. Elles sont intellectuellement indispensables.

Mais si le logging n'est pas actif dès le premier commit de la Couche Macro, tout ce travail produit un moteur sans mémoire.

Le Macro_State affiché chaque jour sans être enregistré est une information consommée et perdue. L'opérateur voit le contexte. Le système ne l'apprend pas. Dans 12 mois, la Couche Macro est exactement ce qu'elle était au premier jour.

Le logging transforme la Couche Macro de descripteur en mémoire vivante. C'est la différence entre un miroir qui montre l'image présente et un journal qui construit la connaissance de soi dans le temps.

---

## 10. V1 / V2 / Rejeté

**V1**
- Unité : Session
- 10 champs obligatoires (timestamp · macro_state · macro_data_date · macro_completeness · emotion_state · validation_state · need_action · operator_profile · market_posture · session_id)
- 3 champs optionnels (market_state_label · adaptive_filter · session_duration_class)
- Conservation intégrale sans purge en V1
- Logging actif dès le premier commit du chantier

**V2**
- Politique d'agrégation des sessions anciennes
- Affichage des premières corrélations personnelles (sous condition de volume)
- Résolution du plafond 50 sessions → plafond adapté aux besoins des corrélations
- Archivage sessions > 24 mois en format réduit

**Rejeté**
- Logging de montants, PnL, tailles de positions
- Logging des valeurs numériques brutes des indicateurs macro
- Logging modifiable après coup
- Logging des données personnelles identifiantes
- Corrélations présentées comme des règles de trading

---

## 11. Verdict Phase 5

**Pourquoi cette phase est la véritable fondation**

Les phases 0 à 4 décrivent ce que la Couche Macro est, comment elle acquiert ses données, et comment elle parle. La Phase 5 décrit pourquoi tout cela a de la valeur dans le temps.

Sans logging, la Couche Macro est un descripteur jetable. Elle produit un état, l'affiche, et l'oublie. L'opérateur voit où il est — le système n'apprend jamais où il a été.

Avec logging, chaque session devient un point dans une carte comportementale personnelle. Sur 12 à 24 mois, cette carte répond à des questions que ni l'opérateur ni aucun autre outil ne peut produire : comment cet opérateur spécifique se comporte-t-il dans ce régime macro précis ?

C'est cette question — et seulement cette question — qui justifie l'existence de la Couche Macro.

---

## Résumé exécutif

**Décision la plus importante**
Le logging doit être actif dès le premier commit. Une session non loggée est perdue définitivement. Il n'existe pas de reconstruction rétrospective fiable du comportement.

**Risque principal**
Le plafond actuel de 50 sessions (MEM-01B) est insuffisant pour produire des corrélations exploitables. Ce plafond est une contrainte à résoudre avant l'activation des lectures personnelles.

**Ce qui est définitivement perdu sans logging**
L'état émotionnel de l'opérateur, sa validation humaine, son besoin d'action, et leur combinaison exacte avec le Macro_State du moment. Ces données ne sont pas reconstruibles.

**Ce qui devient possible après 6 mois**
Les premières observations de patterns : FOMO plus fréquent dans un régime ? Suractivité corrélée à EXPANSIF ? Ces lectures restent fragiles — utiles comme hypothèses, pas comme certitudes.

**Ce qui devient possible après 24 mois**
Des corrélations comportement × régime personnelles robustes et comparables entre régimes. "Dans les contextes CONTRACTÉS, tu doubles historiquement ta fréquence d'ajustement." Intelligence inaccessible sans les deux flux coexistant sur durée.

**Condition bloquante avant implémentation**
Résoudre le plafond de conservation des sessions avant d'activer les corrélations personnelles. Activer le logging sans résoudre ce plafond, c'est construire une fondation destinée à être démolie dans 3 mois.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
