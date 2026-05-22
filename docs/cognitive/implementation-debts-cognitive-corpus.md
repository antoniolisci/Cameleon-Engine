# Dettes d'architecture — Corpus cognitif vs implémentation

**Statut :** document de référence — implémentation comportementale.
**Date :** 2026-05-22
**Usage :** pont entre corpus conceptuel stabilisé (52 concepts) et futur moteur comportemental.
Ce document ne modifie aucune fiche. Il documente les zones où la précision
conceptuelle du corpus dépasse la capacité de détection actuelle du payload.

---

## Principe

Le corpus conceptuel fait des distinctions fines entre des états proches.
L'implémentation comportementale ne peut détecter que ce que le payload expose.
Ces deux niveaux ne seront pas alignés d'emblée.

Ce document cartographie les écarts prévisibles — sans les résoudre,
sans modifier le corpus, sans créer de nouveaux concepts.
Il prépare les décisions d'implémentation sans les anticiper prématurément.

---

## 1. Distinctions potentiellement non détectables par payload

Ces couples ou clusters sont conceptuellement distincts dans le corpus.
Leur distinction repose sur le mécanisme interne à l'opérateur —
que le payload comportemental ne capture pas directement.

---

### 1A — Inertie de lecture / Rigidité de thèse

**Distinction conceptuelle réelle**

| | Inertie de lecture | Rigidité de thèse |
|---|---|---|
| Niveau | Perception (amont) | Intégration (aval) |
| Mécanisme | Le changement structurel n'a pas été capté | Le changement est capté mais la thèse ne se met pas à jour |
| Conscience | Nul — lit sincèrement ce qu'il voit | Nul — perçoit mais ne traite pas comme invalidant |
| Résultat observable | Lecture en retard sur la structure | Maintien de thèse malgré informations contradictoires |

**Pourquoi l'implémentation risque de les fusionner**

Les deux produisent le même comportement mesurable dans le payload :
l'opérateur maintient une lecture qui ne correspond plus au contexte actuel.
Sans accès au processus cognitif interne, le moteur voit la même chose —
une lecture devenue obsolète — sans pouvoir distinguer pourquoi.

**Marqueurs comportementaux qui pourraient les distinguer**

- Inertie : l'opérateur n'a pas consulté les données récentes qui signalent le changement.
  Marqueur potentiel : absence de réévaluation du contexte après un mouvement significatif.
  L'historique ne montre pas de consultation d'un timeframe supérieur ou d'une structure adjacente.
- Rigidité : l'opérateur a consulté les données contradictoires mais a maintenu la thèse.
  Marqueur potentiel : présence de positions prises dans la direction de la thèse
  malgré des éléments récents qui auraient dû invalider.

Ces marqueurs nécessitent des données d'activité fine (logs de navigation, séquences de lecture)
qui ne sont peut-être pas dans le payload actuel.

**Niveau de criticité : MODÉRÉ**

La fusion des deux en implémentation n'est pas catastrophique — les deux états
méritent une modulation similaire (ralentissement, coaching sur le référentiel).
Mais la nuance du coaching devrait différer :
inertie → inviter à regarder ce qui a changé ;
rigidité → inviter à reconstruire la thèse sur ce qui est vu maintenant.

---

### 1B — Illusion de contrôle / Transfert de confiance

**Distinction conceptuelle réelle**

| | Illusion de contrôle | Transfert de confiance |
|---|---|---|
| Source | Exposition prolongée à UN contexte spécifique | Compétence construite dans un AUTRE contexte |
| Direction | Même contexte → lecture bypassée | Contexte A → compétence appliquée à contexte B |
| Durée | Chronique (s'installe avec le temps) | Structurel (traverse les contextes) |
| Signal | Analyse raccourcie sur actif familier | Analyse raccourcie sur actif nouveau |

**Pourquoi l'implémentation risque de les fusionner**

Les deux produisent le même output comportemental : analyse raccourcie,
certitude élevée sur un contexte qui ne la justifie pas.
Un trader BTC passant à ETH sur une structure similaire peut être dans l'un ou l'autre.
Le payload ne contient pas la distinction 'même contexte / contexte différent'
si les deux actifs ont des patterns structurels apparentés.

**Marqueurs comportementaux qui pourraient les distinguer**

- Illusion de contrôle : corrélée à la durée d'exposition à UN actif.
  Marqueur : historique de trading dense sur l'actif concerné.
  L'analyse est raccourcie sur l'actif habituel.
- Transfert de confiance : corrélée à un changement de contexte.
  Marqueur : analyse raccourcie sur un actif ou structure peu fréquentés,
  combinée à un historique solide sur un autre actif.

**Niveau de criticité : FAIBLE**

Les deux méritent un coaching similaire (ralentissement sur la lecture, vérification
de l'indépendance de la compétence vis-à-vis du contexte actuel).
La distinction fine n'est utile que si le coaching doit être spécialisé par actif.

---

### 1C — Cluster entrée précipitée (4 concepts)

**Les quatre concepts et leur distinction**

| Concept | Mécanisme | Temporalité | Processus interne |
|---|---|---|---|
| Impulsivité | Aucun processus décisionnel | Immédiat | Absent |
| Besoin d'action | Inconfort générique de l'inaction | Chronique | Présent, contourné |
| Anticipation compulsive | Arrêt avant validation structurelle | Prospectif | Présent, incomplet |
| FOMO | Urgence face à mouvement observé | Rétrospectif | Présent, orienté |

**Pourquoi l'implémentation risque de les fusionner**

Les quatre produisent le même output mesurable : entrée sur contexte insuffisamment validé.
Le moteur comportemental voit une entrée rapide ou prématurée.
Il ne voit pas si l'opérateur n'avait aucun processus (impulsivité),
un processus interrompu (anticipation), un processus orienté par un mouvement (FOMO),
ou une pression de fond vers l'acte (besoin d'action).

**Marqueurs comportementaux qui pourraient les distinguer**

- Impulsivité : délai quasi-nul entre observation et exécution.
  Marqueur : timestamp d'entrée < quelques secondes après un mouvement.
- Besoin d'action : entrées survenant après une période prolongée sans position.
  Marqueur : durée d'inactivité anormalement longue avant l'entrée.
- Anticipation compulsive : entrée avant cassure ou confirmation.
  Marqueur : entrée sur contexte en formation, dans la direction anticipée,
  avant événement structurel (cassure, clôture de bougie, etc.).
- FOMO : entrée sur mouvement déjà avancé, sizing normal ou supérieur.
  Marqueur : prix d'entrée significativement éloigné du déclencheur structurel.

**Niveau de criticité : MODÉRÉ**

Le coaching différencié (temporel, prospectif, réactif, chronique) requiert
la distinction. Un moteur qui fusionnerait les quatre délivrerait un coaching
générique sur 'l'entrée précipitée' — utile, mais moins précis.

---

### 1D — Surconfiance / Illusion de contrôle / Effet de halo

**Distinction conceptuelle réelle**

| | Surconfiance | Illusion de contrôle | Effet de halo |
|---|---|---|---|
| Portée | Global (toute lecture) | Local (un contexte familier) | Local (contexte suivant un bon trade) |
| Temporalité | Session (série gagnante) | Chronique (exposition longue) | Momentané (événement déclencheur) |
| Dissipation | Résultat adverse significatif | Rupture de la maîtrise supposée | Premier trade décevant |

**Pourquoi l'implémentation risque de les fusionner**

Les trois produisent : analyse raccourcie, sizing supérieur ou normal,
certitude élevée non justifiée par le contexte. Le payload ne contient pas
la durée d'exposition ni la temporalité de la confiance.

**Marqueurs comportementaux qui pourraient les distinguer**

- Effet de halo : sizing ou vitesse d'analyse anormaux sur LE trade suivant un bon trade.
  Marqueur : corrélation temporelle directe avec le trade précédent.
- Illusion de contrôle : pattern récurrent sur UN actif spécifique sur longue période.
  Marqueur : analyses raccourcies systématiquement sur le même actif.
- Surconfiance : élévation globale du sizing sur plusieurs actifs sur une série.
  Marqueur : variation de sizing sur toute la session ou période.

**Niveau de criticité : FAIBLE**

Le coaching de premier niveau (ralentissement de l'analyse) est identique.
La distinction devient utile pour le coaching avancé et la détection de patterns.

---

## 2. Interactions entre concepts simultanés

Ces cas documentent des états émergents produits par deux concepts actifs simultanément.
Ils ne constituent pas de nouveaux concepts — ils constituent des zones de vigilance
pour le moteur comportemental.

---

### 2A — Inertie de lecture + Désordre structurel

**État émergent**

L'opérateur maintient une lecture héritée d'une structure passée (inertie)
dans un marché dont le référentiel structurel est lui-même absent (désordre).
Il lit avec un retard, dans un contexte qui n'a plus de sol.

**Ce que ni l'un ni l'autre ne capture seul**

L'inertie de lecture suppose qu'il existait une structure lisible et qu'elle a changé.
Le désordre structurel dit que la structure est indéfinie.
Ensemble, ils produisent une lecture qui croit s'appuyer sur quelque chose
qui n'existe plus et qui n'a peut-être jamais existé de façon stable.
Le risque est maximal : certitude sur un référentiel doublement invalide.

**Signal pour le moteur :** si les deux modulations sont actives simultanément,
l'effet sur la texture de lecture devrait être additif, non indépendant.
Un ralentissement + coaching interrogatif sur le référentiel + friction.

---

### 2B — Surcharge contextuelle + Dispersion attentionnelle

**État émergent**

Cas particulier car les deux sont déjà dans une relation cause-effet documentée.
L'état émergent n'est pas la coexistence — c'est leur intensification mutuelle.
La surcharge produit la dispersion, qui augmente l'effort de surveillance,
qui renforce la surcharge. Un feedback loop auto-entretenu.

**Ce que ni l'un ni l'autre ne capture seul**

La boucle d'aggravation mutuelle. Chaque fiche décrit un état stable.
Leur interaction est un état dynamique : plus d'objets → moins de profondeur sur chacun
→ incertitude → surveillance accrue → plus d'objets à surveiller.

**Signal pour le moteur :** détecter la coactivation des deux comme un signal
d'aggravation active, pas simplement de cumul. La modulation devrait être
plus forte que la somme des deux modulations individuelles.

---

### 2C — Besoin d'action + Dominance macro sur le local

**État émergent**

L'opérateur ressent un inconfort d'inaction (besoin d'action)
dans un marché où les configurations locales sont opérationnellement moins fiables
sans que cette réduction de fiabilité soit visible (dominance macro).
Il est poussé à agir au moment précis où l'action est la moins robuste.

**Ce que ni l'un ni l'autre ne capture seul**

Besoin d'action seul : la pression vers l'entrée est documentée.
Dominance macro seul : la fiabilité réduite est documentée.
Ensemble : une pression vers l'entrée dans un terrain dont la fiabilité est réduite.
La conjonction crée un risque opérationnel plus élevé que chacun isolément.

**Signal pour le moteur :** la coactivation des deux devrait renforcer le coaching
sur la robustesse du contexte — non pas la décision en elle-même.

---

### 2D — Inertie de lecture + Narratif dominant

**État émergent**

L'inertie maintient une lecture structurelle héritée du passé.
Le narratif dominant confirme cette lecture en tant qu'arrière-plan collectif.
L'opérateur ne voit pas que la structure a changé (inertie),
et le contexte collectif lui dit qu'il n'y a rien à reconsidérer (narratif).
Deux systèmes de renforcement mutuels — individuel et collectif.

**Signal pour le moteur :** coactivation d'un mécanisme individuel (inertie)
et d'un mécanisme collectif (narratif) — coaching sur l'origine de la conviction.

---

### 2E — Fatigue décisionnelle + Désordre structurel

**État émergent**

La fatigue réduit la tolérance à l'incertitude et simplifie les contextes ambigus.
Le désordre structurel produit justement une ambiguïté du référentiel.
Ensemble : l'opérateur fatigué simplifie un contexte qui ne se simplifie pas.
Il perçoit une clarté qui n'existe pas, dans une direction déterminée
par la direction la plus récente — non par la structure.

**Signal pour le moteur :** coactivation des deux = risque élevé de lecture
artificiellement simplifiée sur terrain structurellement indéfini.

---

## 3. Ambiguïtés taxonomiques

---

### 3A — Calme trompeur : inconsistance de cross-référence

**État du corpus**

La fiche `calme-trompeur.md` définit un concept individuel/comportemental :
calme apparent de l'opérateur masquant un état interne dégradé.
(revenge non reconnu, FOMO supprimé, surconfiance silencieuse).

**Inconsistance détectée**

Dans `desordre-structurel.md`, section Relations :
> "Le calme trompeur décrit une lisibilité apparente liée à une faible volatilité."

Cette description ne correspond pas à la fiche source.
calme-trompeur est un concept OPÉRATEUR (calme comportemental masquant état dégradé).
La cross-référence le traite comme un concept MARCHÉ (basse volatilité → fausse lisibilité).

**Risque**

Un futur lecteur qui consulte la cross-référence avant la fiche source
construira une compréhension erronée de calme-trompeur.
Il pourrait l'activer dans des contextes de basse volatilité marché
alors qu'il doit être activé sur des marqueurs comportementaux opérateur.

**Action corrective (chirurgicale, non urgente)**

Dans `desordre-structurel.md`, remplacer :
> "Le calme trompeur décrit une lisibilité apparente liée à une faible volatilité."
par :
> "Le calme trompeur décrit un état comportemental de l'opérateur —
> calme apparent masquant un état interne dégradé — sans lien avec la volatilité."

---

### 3B — Calme trompeur dans le cluster configurations de marché

**Ambiguïté de classement**

compression.md et range-long.md décrivent des états du MARCHÉ.
calme-trompeur.md décrit un état de l'OPÉRATEUR.
Ces trois concepts sont dans le même lot, mais ils n'appartiennent pas
à la même famille sémantique.

**Impact actuel**

Nul — les fiches sont cohérentes en elles-mêmes.
Le risque est futur : si le moteur implémente une détection par famille,
calme-trompeur sera activé avec des signaux de marché (volatilité basse)
alors qu'il doit être activé avec des signaux comportementaux (sizing, timing, cohérence).

**Signal pour le moteur**

Lors de l'implémentation, calme-trompeur doit être branché sur les détecteurs
de comportement opérateur (alignement, désalignement, cohérence décisionnelle),
non sur les détecteurs de configuration de marché.

---

## 4. Dépendances cause → effet

Trois paires dans le corpus documentent explicitement une relation causale.
L'implémentation doit traiter ces paires comme des séquences, non des états indépendants.

---

### 4A — Besoin d'action → Overtrading

**Relation documentée dans les fiches**

besoin-action : "L'overtrading est le régime qui résulte d'entrées répétées
sur des contextes non lisibles. Le besoin d'action est la pression interne
qui précède et produit ce régime. C'est la cause, pas la conséquence."

**Implication pour le moteur**

- Besoin d'action est détectable à l'état d'accumulation (avant les entrées).
  Marqueur : durée d'inactivité + pattern comportemental antérieur à la session.
- Overtrading est détectable après les entrées (fréquence vs contextes lisibles).
- Idéalement : détecter besoin-action tôt permet d'anticiper l'overtrading
  avant qu'il se produise.

**Séquence d'implémentation recommandée**

Besoin d'action (détection préventive) → friction augmentée, coaching sur l'inaction →
si non résolu → overtrading (détection corrective) → friction forte, coaching sur la sélectivité.

Les deux modulations ne doivent pas s'activer simultanément — l'une précède l'autre.

---

### 4B — Aversion à la perte → Invalidation refusée

**Relation documentée dans les fiches**

aversion-perte : "L'invalidation refusée est le comportement observable ;
l'aversion à la perte est le mécanisme sous-jacent qui peut le produire."

**Implication pour le moteur**

- Aversion à la perte est un état perceptuel (asymétrie gain/perte) — difficile
  à détecter directement, mais reconnaissable dans les patterns de sortie
  (positions perdantes tenues plus longtemps que gagnantes).
- Invalidation refusée est le comportement observable : position maintenue
  après que la thèse a cessé de tenir.
- Les deux méritent des modulations différentes :
  aversion → coaching sur la symétrie de traitement gain/perte ;
  invalidation → coaching sur la validité actuelle de la thèse.

**Séquence d'implémentation recommandée**

Aversion à la perte (détectable via historique de sortie) → coaching préventif sur la symétrie →
si non résolu + thèse invalide → invalidation refusée (détectable en cours de position) →
coaching direct sur la thèse.

---

### 4C — Surcharge contextuelle → Dispersion attentionnelle

**Relation documentée dans les fiches**

dispersion-attentionnelle : "La surcharge contextuelle désigne la cause —
trop de flux d'information simultanés entre lesquels l'attention est divisée.
La dispersion attentionnelle désigne l'effet."

**Implication pour le moteur**

- Surcharge est détectable structurellement : nombre de contextes/actifs suivis.
  Marqueur : multi-actifs actifs, nombreuses positions simultanées.
- Dispersion est détectable qualitativement : profondeur de lecture sur chaque actif.
  Marqueur : décisions cross-positions, entrées/sorties inter-contextes.
- Potentiellement : surcharge est détectable AVANT dispersion,
  ce qui permet une modulation préventive.

**Séquence d'implémentation recommandée**

Surcharge (détection structurelle, préventive) → coaching sur la réduction du périmètre →
si non résolu → dispersion (détection qualitative, corrective) →
coaching sur la profondeur de lecture par position.

---

## Récapitulatif des dettes par priorité

| # | Dette | Type | Priorité |
|---|---|---|---|
| D1 | inertie-lecture / rigidite-these | Distinction non détectable | MODÉRÉE |
| D2 | calme-trompeur cross-référence dans desordre-structurel | Inconsistance corpus | ✅ SOLDÉE — 2026-05-22 |
| D3 | cluster entrée précipitée (4 concepts) | Distinction non détectable | MODÉRÉE |
| D4 | paires cause-effet : séquence d'activation | Dépendance causale | HAUTE |
| D5 | illusion-controle / transfert-confiance | Distinction non détectable | FAIBLE |
| D6 | cluster confiance déformée (5 concepts) | Marqueurs à différencier | FAIBLE |
| D7 | calme-trompeur dans cluster marché | Ambiguïté de branchement | SIGNALER |
| D8 | interactions simultanées (5 cas) | États émergents | À ADRESSER EN IMPLÉMENTATION |

---

## Contraintes de ce document

- Aucun concept nouveau.
- Aucune modification de fiche.
- Aucun nouveau lot.
- Les dettes documentées ici ne sont pas des erreurs du corpus —
  elles sont des limites prévisibles de la traduction corpus → moteur.
- Ce document est relu avant tout chantier d'implémentation comportementale.

---

*Corpus conceptuel stable à 52 concepts — 2026-05-22.*
*Ce document est le seul pont autorisé entre le corpus et l'implémentation.*