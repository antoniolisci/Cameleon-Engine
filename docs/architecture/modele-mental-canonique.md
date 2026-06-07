# Modèle mental canonique — Caméléon Engine

> Document fondateur · Audit conceptuel · 2026-06-07

---

## 1. Modèle fondamental

Caméléon Engine n'est pas un pipeline d'analyse. C'est une **boucle de réflexivité**.

```
L'opérateur agit
       ↓
  Sa trace devient visible
       ↓
  Le miroir lui renvoie ce qu'il ne voyait pas
       ↓
  La compréhension transforme la décision suivante
       ↓
  L'opérateur agit différemment
       ↓
  (la boucle recommence)
```

L'opérateur n'est pas au début d'un pipeline. Il est à l'intérieur d'une boucle d'apprentissage sur lui-même. La valeur du système s'accumule à chaque tour de boucle — pas à chaque analyse isolée.

### Formulation canonique

> Caméléon Engine est un miroir comportemental.
> Il ne dit pas quoi faire. Il rend visible ce que l'opérateur ne voit pas seul.
> La valeur est proportionnelle à la profondeur du miroir — pas à la richesse des données.

### Ce que ce modèle exclut

- **Pipeline A → Données → Analyse** : traite l'opérateur comme une source de données. Ignore la temporalité et la transformation.
- **Pipeline B → Sessions → Mémoire → Analyse** : capte l'accumulation mais reste linéaire. Ne décrit pas un apprentissage.
- **Pipeline C → Expériences → Mémoire → Corrélations → Décision** : plus proche, mais séquentiel. Implique que la décision vient après les corrélations — ce qui n'est pas le cas dès le premier jour d'usage.

## 2. Les quatre profondeurs de miroir

Chaque profondeur est utile et complète en elle-même. Elles ne peuvent pas être sautées — chacune est le prérequis de la suivante.

```
PROFONDEUR 1 — Miroir de l'instant
  L'opérateur se voit dans la décision présente.
  Question : "Que se passe-t-il maintenant ?"
  Outil    : moteur (16 champs → décision)
  Prérequis : aucun — disponible dès le premier usage

PROFONDEUR 2 — Miroir de la période
  L'opérateur se voit dans ses trades récents.
  Question : "Comment ai-je agi dans cette période ?"
  Outil    : module comportemental (import → patterns)
  Prérequis : données à importer (CSV / XLSX)

PROFONDEUR 3 — Miroir de la durée
  L'opérateur se voit dans ses tendances stables.
  Question : "Qu'est-ce qui se répète chez moi ?"
  Outil    : mémoire opérateur (patterns persistants dans le temps)
  Prérequis : sessions suffisantes pour distinguer tendance et bruit

PROFONDEUR 4 — Miroir de l'identité
  L'opérateur voit qui il est dans le marché.
  Question : "Qui suis-je comme opérateur ?"
  Outil    : corrélations personnelles + empreinte opérateur
  Prérequis : mémoire opérateur fonctionnelle + portefeuille
```

La valeur s'accumule de bas en haut — elle est proportionnelle à l'histoire disponible. Un opérateur peut entrer par n'importe quelle profondeur. Mais les profondeurs supérieures sont vides sans les fondations inférieures.

## 3. Glossaire canonique — 9 concepts

### Utilisateur

**Définition :** L'opérateur qui apprend — pas un compte technique, pas une source de données.
Il est défini par sa trajectoire dans le temps, pas par ses données.

**Appartient au concept :** identité persistante · profil de trading · préférences conscientes · trajectoire dans le temps.

**N'appartient pas :** les décisions elles-mêmes (ce sont des moments) · les patterns (ce sont des dérivés) · les données de marché (c'est du contexte).

**Frontière critique :** L'utilisateur précède tout le reste. Mais le système est aujourd'hui entièrement anonyme par design — il n'existe pas encore formellement.

---

### Session moteur

**Définition :** Un instant de décision. La saisie de 16 champs + la production d'un payload. Durée : quelques secondes.

**Appartient au concept :** l'état du marché au moment de la décision · l'état de l'opérateur · la décision produite · l'horodatage.

**N'appartient pas :** ce qui s'est passé avant (historique) · les trades réels (session comportementale) · ce qui se répète (mémoire).

**Ambiguïté à surveiller :** le mot "session" suggère une durée. Une session moteur est un instant, pas une session de trading. Si on construit la mémoire opérateur sur des sessions moteur, on construit sur des instants — pas sur des expériences.

---

### Session comportementale

**Définition :** Une fenêtre d'observation sur le comportement passé. Un batch de trades analysés ensemble, défini par les bornes d'un fichier importé.

**Appartient au concept :** un corpus de trades cohérent · les patterns détectés · la période couverte.

**N'appartient pas :** la décision prise après analyse · le contexte de marché au moment de l'import · l'état émotionnel pendant les trades.

**Ambiguïté à surveiller :** une session de 1 800 trades sur 18 mois et une session de 40 trades sur une après-midi sont traitées de façon identique. Ce ne sont pas le même objet. La frontière est définie par le fichier d'export, pas par la logique de trading.

---

### Historique

**Définition :** La trace chronologique des décisions moteur passées. Un log passif.

**Appartient au concept :** "j'ai analysé ça, à ce moment, dans ces conditions".

**N'appartient pas :** ce que ces décisions révèlent sur l'opérateur · ce qu'il a fait sur le marché après · ce qui se répète.

**Frontière critique avec Mémoire :** l'historique est un log passif. La mémoire est un substrat actif. 10 000 décisions dans l'historique ne produisent pas de mémoire si rien n'est analysé.

---

### Mémoire comportementale

**Définition :** L'état comportemental courant de l'opérateur, calculé à partir des sessions récentes. Horizon : 7 jours. Disparaît au-delà.

**Appartient au concept :** le signal comportemental récent transporté entre sessions · la "température" comportementale aujourd'hui.

**N'appartient pas :** les patterns stables de l'opérateur · ses tendances sur 6 mois.

**Distinction critique :** Une mémoire qui oublie après 7 jours n'est pas une mémoire — c'est un état courant. C'est la différence entre se souvenir et être encore sous l'effet.

---

### Mémoire opérateur

**Définition :** Le profil construit de l'opérateur à partir de ses tendances stables, observées sur une durée suffisante.

**Appartient au concept :** ce que l'opérateur fait systématiquement · ses tendances réelles (observées, pas déclarées) · son profil au sens longitudinal.

**N'appartient pas :** ce qu'il a fait la semaine dernière spécifiquement · la décision d'aujourd'hui · le contexte de marché.

**Question non résolue :** la mémoire opérateur est-elle une *accumulation* (plus de sessions stockées) ou une *distillation* (patterns stables extraits des sessions) ? Ces deux réponses produisent des systèmes fondamentalement différents.

**Frontière critique avec Mémoire comportementale :** même nom, horizons et natures radicalement différents. La mémoire comportementale est un état courant (7j). La mémoire opérateur est un profil construit (long terme). C'est la source de confusion la plus dangereuse du système.

---

### Contexte

**Définition :** Le cadre dans lequel une décision est prise. Instantané. Aujourd'hui entièrement déclaratif (l'opérateur dit comment il se voit).

**Appartient au concept :** l'état du marché maintenant · l'état émotionnel de l'opérateur · les signaux techniques présents.

**N'appartient pas :** l'historique des décisions passées · les patterns de l'opérateur · le portefeuille.

**Évolution future :** la mémoire opérateur permettrait un contexte *observé*, pas seulement déclaré. "Je me déclare discipliné" ≠ "le moteur observe que je suis discipliné". Cette distinction est conceptuellement majeure.

---

### Corrélation personnelle

**Définition :** Un lien révélé entre deux dimensions du comportement de l'opérateur, visible uniquement sur une durée suffisante.

**Appartient au concept :** les liens entre comportement et conditions de marché · entre état émotionnel et prise de risque · entre patterns et résultats.

**N'appartient pas :** les corrélations statistiques entre actifs (analyse de marché) · les patterns intra-session (mémoire comportementale) · les corrélations sur données insuffisantes (bruit).

**Dépendance stricte :** les corrélations personnelles ne peuvent exister sans mémoire opérateur. La chaîne est séquentielle et ne peut pas être sautée.

**Distinction de valeur :** "Tu trades plus gros quand le BTC monte" est une corrélation. "Tu prends plus de risques quand tu es en gain" est une révélation. Ce sont deux niveaux de lecture différents.

---

### Portefeuille utilisateur

**Définition :** Le lien entre ce que l'opérateur croit faire et ce qu'il fait vraiment. Son exposition réelle et son évolution dans le temps.

**Appartient au concept :** l'exposition réelle à un moment donné · son évolution · la relation entre ce que l'opérateur possède et ce qu'il décide.

**N'appartient pas :** les patterns de trading (mémoire comportementale) · les décisions de session (moteur) · les performances absolues en gains/pertes.

**Valeur spécifique :** révèle l'écart entre intention et réalité. Un opérateur peut se déclarer prudent et avoir un portefeuille concentré à 90% sur un actif. Le portefeuille révèle ce que le comportement seul ne montre pas.

## 4. La question bloquante

Avant tout chantier de données, une seule question doit recevoir une réponse définitive :

> **Qu'est-ce qu'une session dans le modèle de Caméléon Engine ?**

Pas techniquement. Conceptuellement.

### Réponse canonique

Une session = **une occasion de se voir agir**.

Pas un import. Pas une soumission de formulaire. Pas un fichier. Une occasion de se voir agir — qu'elle prenne la forme d'une décision moteur, d'un import de trades, ou d'une lecture rétrospective.

### Pourquoi cette définition est structurante

Si une session est définie comme "un import de fichier" :
→ la mémoire opérateur = accumulation de fichiers
→ le problème à résoudre = lever le FIFO 20
→ la solution = stocker plus

Si une session est définie comme "une occasion de se voir agir" :
→ la mémoire opérateur = distillation d'apprentissages
→ le problème à résoudre = extraire ce qui est stable au-delà des occasions
→ la solution = filtrer, pas accumuler

Ces deux réponses produisent des architectures, des interfaces et des valeurs pour l'opérateur qui n'ont rien en commun.

## 5. Implications pour les chantiers futurs

### Ce qui doit être résolu avant Architecture données utilisateur

**1. Trancher la définition de "session"**
La définition canonique est posée ici. Elle doit être adoptée explicitement avant d'écrire le moindre schéma de données. Si elle n'est pas tranchée, les noms de structures, de clés et de relations hériteront de l'ambiguïté actuelle — quasi-impossible à corriger sans migration.

**2. Distinguer formellement Mémoire comportementale et Mémoire opérateur**
Deux noms différents, deux documents séparés, deux cycles de vie documentés. Tant que ce n'est pas fait, tout chantier "Mémoire" risque de construire par-dessus une couche existante sans le savoir.

**3. Définir l'entité Utilisateur**
Le système est aujourd'hui anonyme par design. Introduire un Utilisateur = décider si c'est un compte technique, une identité locale, ou une notion purement conceptuelle sans persistance propre. Cette décision conditionne l'architecture entière.

**4. Résoudre la tension ZERO CLOUD vs Compte utilisateur**
La doctrine privacy-local-first interdit toute donnée hors du navigateur. Un compte utilisateur implique une identité persistante. Ces deux contraintes ne sont pas incompatibles — mais leur réconciliation doit être explicite, pas implicite.

### Ce qui risque d'être construit deux fois sans cette clarification

- La mémoire comportementale (`cameleon_behavior_memory_v1`) et le futur chantier Mémoire opérateur
- Le registre d'imports et le futur système lié au compte
- Le module wallet orphelin (`wallet_analyzer.js`) et le futur chantier Portefeuille

### Séquence juste

```
1. Glossaire canonique adopté (ce document)
2. Entité Utilisateur définie
3. Tension cloud/local résolue
4. Architecture données utilisateur
5. Compte utilisateur
6. Mémoire opérateur (après résolution FIFO)
7. Portefeuille
```

---

*Ce document est une fondation conceptuelle. Il ne prescrit aucune implémentation.*
*Il doit être relu avant l'ouverture de tout chantier appartenant à la chaîne Utilisateur → Sessions → Mémoire → Corrélations.*
