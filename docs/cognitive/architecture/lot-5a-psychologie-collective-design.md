# Lot 5A — Psychologie collective du marché
## Document d'architecture — avant construction

**Statut :** design validé — aucun concept rédigé, aucune fiche produite.
**Date :** 2026-05-19
**Contexte :** produit après audit taxonomique des 40 concepts (lots 1–4).

---

## Périmètre de la famille

Cette famille documente les états psychologiques et les dynamiques narratives qui émergent
au niveau collectif des participants de marché — et qui créent un contexte ambiant que le
trader individuel navigue, souvent sans en être conscient.

**Formulation de référence :**
Un trader peut être parfaitement aligné individuellement — bonne lecture, bon sizing, bonne
posture — et rester entièrement capturé par un état collectif. La psychologie collective ne
corrompt pas le raisonnement du trader : elle modifie la définition de ce qui semble évident,
légitime, ou lisible dans le contexte.

**Analogie d'architecture :**
Les familles existantes (Behavior, Biais cognitifs, Régimes émotionnels) décrivent ce qui se
passe à l'intérieur du trader. Cette famille décrit la température et le courant de l'eau
dans laquelle il nage.

**Test d'appartenance :**
Le concept décrit-il quelque chose qui n'existe que lorsque plusieurs traders partagent
simultanément le même état ou la même lecture ? Si le phénomène peut être décrit avec un
trader seul, il appartient aux familles existantes.

---

## Ce que cette famille ne couvre pas

| Hors périmètre | Raison |
|---|---|
| La réaction individuelle à la foule | FOMO, validation sociale individuelle — familles existantes |
| L'analyse macro directionnelle | La famille lit des états collectifs, pas des conditions économiques |
| Les indicateurs de sentiment (Fear & Greed, etc.) | Ce sont des outils, pas des concepts comportementaux |
| La sociologie ou l'économie comportementale académique | Cadres externes — hors doctrine Caméléon |
| Les opinions sur la direction du marché | Cette famille décrit des états, jamais des thèses directionnelles |
| "La foule a tort" | Aucun jugement de valeur sur le collectif — règle identique à l'individuel |

---

## Frontières taxonomiques

**vs FOMO**
FOMO = réaction intérieure d'un trader face à un mouvement en cours (individuel).
Cette famille = état ambiant qui rend le FOMO structurellement plus probable (collectif).
Le FOMO est l'effet visible ; cette famille documente le champ qui le produit.

**vs Macro Climates**
Macro Climates = événements externes programmés comme modificateurs de lisibilité.
Psychologie collective = états émotionnels et narratifs partagés entre participants, qui ont
leur propre dynamique indépendamment des événements macro.
Le macro peut déclencher des états collectifs — il n'en est pas synonyme.

**vs Biais cognitifs**
Biais cognitifs = distorsions de traitement d'un individu.
Psychologie collective = champ ambiant qui rend certains biais individuels plus actifs.
L'un est dans la tête du trader, l'autre est dans l'air qu'il respire.

**vs Behavior**
Behavior = mécanismes psychologiques individuels.
Psychologie collective = propriétés émergentes qui n'existent qu'au niveau agrégé — ce qui
disparaît si l'on retire tous les autres participants.

**vs Structures de marché**
Structures de marché = configurations de prix comme contextes de lisibilité.
Psychologie collective = couche de sens que les participants projettent collectivement sur
ces structures.

**vs Temporalité**
La temporalité couvre le rapport individuel au temps. La psychologie collective a une dimension
temporelle (les états collectifs ont une durée et un cycle de vie) mais son axe principal
est social, pas temporel.

---

## Risques de dérive

**Dérive 1 — Sociologie de marché**
Citer des théories de bulle spéculative, de cycle de crédit, d'irrationalité collective.
Signal d'alerte : un concept qui exige de savoir si le marché est "en bulle" pour être applicable.

**Dérive 2 — Analyse réseaux sociaux**
Référencer ce qui "se dit" sur Twitter ou les forums. Les réseaux sont un symptôme,
pas le phénomène.
Signal d'alerte : un concept dont la définition nécessite l'existence d'une plateforme sociale.

**Dérive 3 — Dédoublement des concepts individuels**
Créer des versions "collectives" de concepts existants — FOMO collectif, surconfiance
collective — qui sont les mêmes mécanismes juste mis à l'échelle.
Signal d'alerte : un concept compréhensible en imaginant un trader seul face à son écran.

**Dérive 4 — Jugement de valeur**
Laisser entendre que le lecteur voit ce que "la foule" ne voit pas.
Signal d'alerte : un concept qui donne un avantage informationnel à celui qui le connaît.

**Dérive 5 — Prédiction**
Suggérer que l'identification d'un état collectif prédit la direction du marché.
Signal d'alerte : "quand X état collectif est présent, le retournement est proche."

---

## Axes structurels identifiés

Cinq axes solides. Ce ne sont pas des fiches — ce sont des directions de construction.

**A — Narratif dominant**
Un récit de marché qui s'est répandu au point de fonctionner comme contexte présupposé —
ce que "tout le monde sait" et traite comme arrière-plan de sa lecture. Il n'est pas adopté
consciemment. Il s'installe par exposition répétée.

**B — Consensus apparent**
La convergence visible de l'opinion de marché autour d'une thèse unique, qui crée l'illusion
que cette thèse est plus robuste qu'elle ne l'est — souvent parce qu'elle est construite
depuis les mêmes quelques sources ou signaux répétés sous plusieurs formes.

**C — Contamination narrative**
Le processus par lequel un état collectif dominant pénètre la lecture individuelle sans que
le trader l'ait délibérément adopté. Distinct du biais de confirmation : le trader n'a pas
cherché à confirmer une thèse — il a absorbé un cadre de lecture par exposition.

**D — États collectifs stables (euphorie / fatigue)**
Les états émotionnels agrégés qui modifient ce qui semble évident à lire. En phase d'euphorie
collective, les contextes dégradés semblent lisibles. En phase de fatigue collective, même
les contextes clairs semblent ambigus. L'état individuel s'y ancre sans que le trader le réalise.

**E — Validation sociale**
Le besoin de trouver confirmation de sa lecture dans le comportement observable d'autres
participants — pas dans l'information (biais de confirmation) mais dans l'action d'autrui
comme proxy de légitimité. "Si tout le monde entre, c'est que c'est lisible."

---

## Concepts à éviter — trop proches de l'existant

| Concept à ne pas créer | Raison |
|---|---|
| FOMO collectif | FOMO existe — son contexte collectif n'est pas un nouveau concept |
| Biais de confirmation collectif | Mécanisme individuel, seul le déclencheur serait collectif |
| Transfert de confiance inter-actif | Transfert de confiance couvre déjà ce mécanisme |
| Effet de halo collectif | L'halo peut venir du collectif, mais le mécanisme reste individuel |
| Surconfiance de marché | Version agrégée de surconfiance — pas de gain taxonomique |
| Sentiment de marché | Trop proche des outils techniques — pas un concept comportemental |

---

## Règles de ton et de langage

**Éviter :**
- "la foule", "le retail", "les mains faibles/fortes" — vocabulaire hiérarchisant
- "le marché pense / croit / veut" — anthropomorphisme opinionnel
- "l'irrationalité collective" — jugement de valeur implicite
- Toute référence à des plateformes spécifiques (Twitter, Reddit, Telegram)

**Préférer :**
- "la lecture dominante", "l'état collectif ambiant", "la narrative partagée"
- "le contexte ambiant", "le champ de lecture"
- Les formulations qui font reconnaître une expérience vécue, pas analyser autrui

**Test de ton :**
Le trader qui lit un concept de cette famille doit se reconnaître dedans — pas reconnaître
les autres. Si la formulation donne l'impression de regarder la foule de l'extérieur,
elle est incorrecte.

---

## Résumé d'architecture

| Dimension | Décision |
|---|---|
| Ce que la famille couvre | États et dynamiques psychologiques émergents au niveau collectif |
| Axe central | Le champ ambiant collectif qui modifie la lisibilité individuelle |
| Ce qu'elle ne couvre pas | Réactions individuelles, analyse macro, sociologie, outils sentiment |
| Axes solides identifiés | 5 : narratif dominant, consensus apparent, contamination narrative, états collectifs, validation sociale |
| Concepts à éviter | 6 — tous des décalques collectifs de concepts individuels existants |
| Risque principal | Jugement ("la foule a tort") ou dérive outillage ("analyse sentiment") |
| Ancrage de ton | Le lecteur se reconnaît — il ne regarde pas les autres |
| Nombre de concepts cibles | À définir en construction — probablement 8–10 pour un lot complet |

---

*Document d'architecture uniquement. Aucun concept rédigé. Construction à initier en session suivante.*
