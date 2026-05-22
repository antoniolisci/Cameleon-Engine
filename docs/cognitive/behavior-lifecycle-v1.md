# Behavioral Lifecycle V1 — Séquences cause-effet du moteur comportemental

**Statut :** document d'architecture — référence pour l'implémentation des séquences D4.
**Date :** 2026-05-22
**Dépend de :** implementation-debts-cognitive-corpus.md · behavior-engine-mapping-v1.md
**Usage :** formaliser comment le moteur gère les relations temporelles entre causes,
accumulations et comportements observables. Ce document ne code rien. Il contraint
les décisions d'implémentation futures.

---

## 1. Préambule

### 1.1 État indépendant vs séquence comportementale

Le moteur comportemental actuel traite chaque pattern comme un état indépendant.
`overtrading` est détecté. `size_inconsistency` est détecté. Chaque détection produit
une modulation sans regard pour ce qui l'a précédée ou ce qui l'a produite.

Ce modèle est correct pour les comportements qui n'ont pas de précurseur détectable.
Il est insuffisant pour les paires où le corpus documente explicitement une relation
causale temporelle — c'est-à-dire les trois paires de la dette D4.

Une **séquence comportementale** est une paire (cause, effet) où :
- la cause peut être présente sans que l'effet soit visible
- l'effet ne peut pas être présent sans que la cause ait précédé
- la modulation appropriée diffère selon qu'on est en phase cause ou en phase effet

Traiter une séquence comme deux états indépendants produit soit une double modulation
incohérente, soit une modulation au mauvais moment.

### 1.2 Pourquoi D4 change l'architecture moteur

Les dettes D1, D3, D5, D6 sont des distinctions non détectables — le moteur fusionne
des concepts adjacents faute de marqueurs différenciants. Ce sont des limitations
d'inférence, pas des erreurs d'architecture.

D4 est différent. Les trois paires documentées ne demandent pas de distinguer deux
concepts similaires. Elles demandent de traiter le **temps** dans la détection :
détecter une cause avant son effet, et moduler différemment selon la phase active.

Sans cette gestion temporelle, le moteur peut :
- activer simultanément la modulation de la cause et celle de l'effet (redondance incohérente)
- activer la modulation de l'effet sans avoir tenté la modulation préventive de la cause
- rater la fenêtre préventive en attendant que l'effet soit mesurable

Ces trois erreurs ont des conséquences directes sur la pertinence du coaching produit.

---

## 2. Principe général des séquences

Chaque séquence documentée dans ce fichier suit la même structure de phases.

### 2.1 Phase : Cause

La cause est présente. L'effet comportemental n'est pas encore mesurable dans les trades.
C'est la fenêtre préventive.

**Signal moteur :** proxy de la cause détecté — signal faible ou moyen.
**Modulation :** friction légère, coaching interrogatif sur le précurseur.
**Objectif :** interrompre l'accumulation avant que l'effet se manifeste.

### 2.2 Phase : Accumulation

La cause s'intensifie. Des signaux précurseurs de l'effet apparaissent dans les données
mais le seuil de déclenchement du pattern effet n'est pas encore atteint.

**Signal moteur :** proxy cause + signal précoce de l'effet (sous-seuil).
**Modulation :** friction intermédiaire, coaching sur la transition imminente.
**Objectif :** signaler la progression sans anticiper faussement l'effet.

### 2.3 Phase : Comportement observable

L'effet est détecté. La cause est implicitement active (elle précède l'effet par définition).
C'est la fenêtre corrective.

**Signal moteur :** pattern effet détecté au seuil nominal.
**Modulation :** friction forte, coaching correctif sur le comportement observable.
**Objectif :** corriger le comportement, nommer son caractère systémique.

### 2.4 Phase : Correction

L'effet était détecté. Il n'est plus actif sur la période récente.
La cause peut être toujours présente (risque de rechute) ou dissipée.

**Signal moteur :** pattern effet absent sur fenêtre récente.
**Modulation :** coaching de consolidation, mention du précurseur potentiel.
**Objectif :** éviter la rechute sans surcharger un opérateur qui a corrigé.

### 2.5 Phase : Aggravation

L'effet est actif et produit à son tour un état secondaire (effet de l'effet).
Les modulations de base ne suffisent plus.

**Signal moteur :** pattern effet + pattern secondaire co-actifs.
**Modulation :** friction maximale, coaching sur la rupture de cycle.
**Objectif :** nommer l'aggravation, pas seulement additionner deux modulations.

---

## 3. Séquence 1 — Besoin d'action → Overtrading

**Relation source :** besoin-action.md — "L'overtrading est le régime qui résulte
d'entrées répétées sur des contextes non lisibles. Le besoin d'action est la pression
interne qui précède et produit ce régime. C'est la cause, pas la conséquence."

### 3.1 Structure de la séquence

```
[CAUSE]             besoin-action        — pression vers l'entrée, inaction inconfortable
      ↓
[ACCUMULATION]      seuil d'entrée abaissé — entrées sur contextes marginaux, pas encore en rafale
      ↓
[EFFET OBSERVABLE]  overtrading          — fréquence déconnectée de la lisibilité détectée
      ↓
[AGGRAVATION]       overtrading + rapid_reentry ou loss_chasing
```

### 3.2 État préventif (cause détectée, effet absent)

**Condition :** période d'inactivité anormalement longue suivie d'une reprise d'activité.
Proxy V1 : gap important entre la fin d'une période calme et la première fenêtre
d'overtrading détectée sur la même session ou période.

**Modulation :** friction légère. Coaching interrogatif sur la qualité du contexte
qui a motivé la reprise d'activité — pas sur la fréquence encore absente.

**Limite V1 :** sans découpage en sessions, la détection du gap préventif repose
sur l'analyse de la distribution temporelle des trades dans la série complète.
Un gap significatif peut être une nuit de sommeil, pas une inactivité de session.
Le proxy est faible. La modulation préventive doit être proportionnellement prudente.

### 3.3 État correctif (effet détecté)

**Condition :** `overtrading` détecté (count ≥ 1).

**Modulation :** friction forte. Coaching correctif centré sur la sélectivité des entrées.
La cause (besoin-action) est mentionnable en coaching contextuel comme mécanisme sous-jacent
possible — jamais comme diagnostic.

**Règle d'exclusion :** si l'état correctif est actif, l'état préventif est désactivé.
Un opérateur en phase overtrading ne reçoit pas de coaching préventif sur l'inaction —
le comportement problématique est déjà présent.

### 3.4 État aggravé

**Condition :** `overtrading` + `rapid_reentry` co-actifs, ou `overtrading` + `loss_chasing`.

**Modulation :** friction maximale. Coaching sur la rupture du cycle, pas la somme
des deux modulations individuelles. L'aggravation est nommée comme telle.

### 3.5 Conditions de coexistence

| État | Peut coexister avec | Ne peut pas coexister avec |
|---|---|---|
| Préventif (cause) | Aucun état de cette séquence | Correctif, Aggravé |
| Correctif (effet) | États d'autres séquences | Préventif |
| Aggravé | États d'autres séquences | Préventif |

### 3.6 Signaux disponibles en V1

| Signal | Source | Utilisation |
|---|---|---|
| `overtrading.count` | patterns.js | Déclencheur état correctif / aggravé |
| `avgTimeBetween` | metrics.js | Proxy gap préventif (bruité) |
| `rapid_reentry.count` | patterns.js | Indicateur aggravation |
| `loss_chasing.count` | patterns.js | Indicateur aggravation |
| `hourDist` | metrics.js | Distribution temporelle — gap inter-session approximatif |

### 3.7 Signaux absents

- **Découpage en sessions** : impossible de distinguer inactivité nuit / inactivité
  de session. Le proxy gap est structurellement bruité.
- **Qualité du contexte à l'entrée** : l'overtrading au sens corpus (entrées sur
  contextes non lisibles) ne peut être vérifié. La fréquence est le seul proxy.
- **Intention de l'opérateur** : le besoin d'action ne peut pas être confirmé
  comme cause — il peut être évoqué en coaching, pas diagnostiqué.

---

## 4. Séquence 2 — Surcharge contextuelle → Dispersion attentionnelle

**Relation source :** dispersion-attentionnelle.md — "La surcharge contextuelle désigne
la cause — trop de flux d'information simultanés entre lesquels l'attention est divisée.
La dispersion attentionnelle désigne l'effet."

### 4.1 Structure de la séquence

```
[CAUSE]             surcharge contextuelle  — trop de contextes/actifs suivis simultanément
      ↓
[ACCUMULATION]      profondeur de lecture réduite par actif — pas encore visible dans les trades
      ↓
[EFFET OBSERVABLE]  dispersion attentionnelle — trades interleaved multi-symboles, sur-fréquence
      ↓
[AGGRAVATION]       surcharge + dispersion + size_inconsistency (boucle d'aggravation)
```

### 4.2 État préventif (cause détectée, effet absent)

**Condition :** nombre élevé de symboles distincts actifs sur la période, sans
overtrading multi-symboles détecté.

Proxy V1 : `symbols.length` dans le flux de trades > seuil N (à calibrer sur données réelles).
La surcharge structurelle est détectable avant la dispersion comportementale.

**Modulation :** annotation contextuelle sur le périmètre de surveillance.
Coaching sur la réduction du nombre de contextes actifs simultanément.
Friction légère — la cause est présente, l'effet ne l'est pas encore.

### 4.3 État correctif (effet détecté)

**Condition :** `overtrading` détecté sur plusieurs symboles distincts
(`triggeredSymbols.size` ≥ 2 dans patterns.js).

La dispersion est inférée de l'overtrading multi-symboles — proxy direct disponible
dans le moteur actuel (`overtrading.symbols`).

**Modulation :** friction forte. Coaching correctif sur la profondeur de lecture par actif.
La cause (surcharge) est mentionnée comme contexte structurel ayant produit la dispersion.

**Règle d'exclusion :** si l'état correctif est actif, l'état préventif est désactivé.

### 4.4 État aggravé

**Condition :** overtrading multi-symboles + `size_inconsistency` co-actifs.

La boucle d'aggravation mutuelle documentée dans la dette D8/2B est active :
surcharge → dispersion → incohérence de sizing sur chaque actif sous-analysé.
La modulation est plus forte que la somme des deux modulations individuelles.

**Modulation :** friction maximale. Coaching sur la réduction du périmètre
avant toute correction du sizing — cause structurelle avant symptôme.

### 4.5 Conditions de coexistence

| État | Peut coexister avec | Ne peut pas coexister avec |
|---|---|---|
| Préventif (cause) | États d'autres séquences | Correctif, Aggravé de cette séquence |
| Correctif (effet) | États d'autres séquences | Préventif |
| Aggravé | États d'autres séquences | Préventif |

### 4.6 Signaux disponibles en V1

| Signal | Source | Utilisation |
|---|---|---|
| `symbols` (liste distincte) | canonical.js / trades | Proxy surcharge structurelle |
| `overtrading.symbols` | patterns.js | Proxy dispersion — symboles en sur-fréquence |
| `overtrading.count` | patterns.js | Intensité de la dispersion |
| `size_inconsistency.cv` | patterns.js | Signal aggravation |

### 4.7 Signaux absents

- **Profondeur de lecture par actif** : la dispersion au sens corpus (analyse superficielle
  sur chaque contexte) ne peut pas être mesurée. La sur-fréquence multi-symboles est le seul proxy.
- **Sources d'information externes** : réseaux sociaux, alertes, corrélations — absents
  du payload. La surcharge peut venir de là sans être visible dans les trades.
- **Nombre de positions ouvertes simultanées** : payload historique uniquement,
  pas de snapshot de position en cours.

---

## 5. Séquence 3 — Aversion à la perte → Invalidation refusée

**Relation source :** aversion-perte.md — "L'invalidation refusée est le comportement
observable ; l'aversion à la perte est le mécanisme sous-jacent qui peut le produire."

### 5.1 Structure de la séquence

```
[CAUSE]             aversion à la perte     — asymétrie perceptuelle gain/perte
      ↓
[ACCUMULATION]      position perdante tenue  — espoir de retour, seuil d'inconfort croissant
      ↓
[EFFET OBSERVABLE]  invalidation refusée     — maintien de position après que la thèse cesse de tenir
      ↓
[AGGRAVATION]       escalade d'engagement    — ajouts successifs pour moyenner à la baisse
```

### 5.2 État préventif — limite V1

**Proxy disponible :** asymétrie entre `avgDelayAfterSell` et `avgDelayAfterBuy`.
Un `avgDelayAfterSell` significativement plus court que `avgDelayAfterBuy` peut indiquer
une tendance à fermer les positions rapidement dès un retrait — proxy indirect de l'aversion.

**Limite de ce proxy :** sans P&L par trade, il est impossible de déterminer si une
fermeture rapide suit une position gagnante (profit pris tôt = aversion probable)
ou une position perdante (stop rapide = discipline probable). Le signal est non différenciable.

**Décision V1 :** la détection préventive de l'aversion à la perte par le payload
actuel n'est pas fiable. Elle ne peut pas déclencher une modulation autonome.
Elle peut être évoquée en coaching contextuel dans `revenge_trading` uniquement,
comme mécanisme possible.

### 5.3 État correctif (effet détecté) — non détectable V1

**Condition requise :** état d'une position ouverte + évaluation de la validité actuelle
de la thèse d'entrée.

Ces deux données sont **structurellement absentes** du payload comportemental V1 :
- Le payload est un historique de trades terminés — pas d'état en cours de position.
- La thèse d'entrée n'est pas enregistrée.
- La validité de la thèse au moment du maintien ne peut pas être évaluée.

**L'invalidation refusée n'est pas détectable en V1. Cette séquence est reportée à V2.**

### 5.4 Condition de réouverture V2

Cette séquence peut être rouverte si le payload dispose de :
- P&L par trade (pour distinguer fermetures gagnantes et perdantes)
- Durée de tenue par trade (pour comparer positions gagnantes vs perdantes)
- Ou : intégration d'un module de positions ouvertes en temps réel

Sans au moins P&L par trade, aucune implémentation partielle n'est justifiée.

### 5.5 Ce que V1 peut faire sur cette séquence

`revenge_trading` est le seul proxy comportemental adjacent à l'aversion à la perte
disponible en V1. Il détecte la réaction à une vente — qui peut (pas nécessairement)
suivre une position fermée en perte. Le coaching de `revenge_trading` peut mentionner
l'aversion à la perte comme mécanisme sous-jacent possible.

Ce n'est pas une détection de la séquence. C'est du coaching contextuel sur un pattern
adjacent.

### 5.6 Signaux disponibles en V1

| Signal | Source | Utilisation |
|---|---|---|
| `avgDelayAfterSell` | metrics.js | Proxy très faible — non différenciable sans P&L |
| `revenge_trading.count` | patterns.js | Pattern adjacent — coaching contextuel uniquement |

### 5.7 Signaux absents

- **P&L par trade** : requis pour distinguer fermetures gagnantes / perdantes.
- **Durée de tenue par trade** : requis pour comparer profils gain/perte.
- **État des positions ouvertes** : requis pour détecter le maintien en cours.
- **Thèse d'entrée** : requise pour évaluer l'invalidation.

---

## 6. Règles de coexistence

### 6.1 Ce qui peut coexister

Ces états appartiennent à des séquences différentes et ne s'excluent pas :

| État A | État B | Relation |
|---|---|---|
| Seq1 correctif (overtrading) | Seq2 correctif (dispersion) | Coexistence possible — coaching cumulatif |
| Seq1 aggravé | Seq2 correctif | Coexistence possible — friction maximale |
| Seq1 correctif | Seq3 coaching contextuel | Coexistence possible |
| Seq2 préventif | Seq1 préventif | Coexistence possible |

### 6.2 Ce qui ne doit jamais être actif simultanément

Au sein d'une même séquence, les phases préventive et corrective s'excluent :

| Interdit | Raison |
|---|---|
| Seq1 préventif + Seq1 correctif | L'effet est détecté → la cause a produit l'effet → préventif obsolète |
| Seq2 préventif + Seq2 correctif | Même logique |
| Seq1 préventif + Seq1 aggravé | L'aggravation implique l'effet actif → préventif obsolète |
| Seq2 préventif + Seq2 aggravé | Même logique |

### 6.3 Ce qui remplace un état précédent

La transition de phase suit une direction unique dans la séquence :

```
Préventif → Correctif → Aggravé      (progression)
Aggravé → Correctif → Correction     (résolution)
```

Le moteur ne peut pas revenir à Préventif depuis Correctif ou Aggravé dans la même
fenêtre d'analyse. Le retour à Préventif n'est possible que si l'effet n'est plus
détecté sur la fenêtre récente et qu'un signal cause est à nouveau présent.

### 6.4 Ce qui constitue une aggravation

Une aggravation est détectée quand l'effet d'une séquence produit le déclencheur
d'une autre séquence, ou quand un pattern secondaire confirme que l'effet s'intensifie.

| Séquence | Déclencheur aggravation |
|---|---|
| Seq1 | overtrading + rapid_reentry co-actifs |
| Seq1 | overtrading + loss_chasing co-actifs |
| Seq2 | overtrading multi-symboles + size_inconsistency co-actifs |
| Seq3 | non applicable V1 — séquence non détectable |

---

## 7. Principe de modulation par phase

Ces principes s'appliquent à toutes les séquences. Ils définissent le registre,
pas le contenu précis du coaching.

### 7.1 Modulation préventive

- **Friction :** légère — ne pas pénaliser un comportement qui n'est pas encore problématique
- **Coaching :** interrogatif sur la cause — poser la question, pas nommer l'état
- **Ton :** contextuel, pas diagnostique

### 7.2 Modulation corrective

- **Friction :** forte — le comportement problématique est présent et mesurable
- **Coaching :** descriptif sur l'effet observable, non moralisateur
- **Ton :** factuel, centré sur ce que les données montrent

### 7.3 Modulation aggravée

- **Friction :** maximale
- **Coaching :** sur la rupture du cycle, pas l'accumulation des fautes individuelles
- **Ton :** direct, sans redondance avec les modulations individuelles
- **Règle :** la modulation aggravée remplace les modulations individuelles des deux
  patterns co-actifs. Elle ne les additionne pas.

---

## 8. Contraintes V1 et leurs conséquences sur le lifecycle

### 8.1 Absence de P&L par trade

**Conséquence directe :**
- La Séquence 3 (aversion-perte → invalidation-refusée) est intégralement reportée à V2.
- La distinction positions gagnantes / perdantes tenues longtemps est impossible.
- L'aversion à la perte ne peut pas déclencher de modulation autonome.

### 8.2 Absence de market state feed

**Conséquence directe :**
- La qualité des contextes d'entrée ne peut pas être évaluée.
- L'overtrading au sens corpus (entrées sur contextes non lisibles) ne peut pas être
  vérifié — seule la fréquence est mesurable.
- Les séquences qui requièrent la structure de marché restent hors périmètre V1.

### 8.3 Absence de découpage en sessions

**Conséquence directe :**
- La détection préventive de besoin-action repose sur un proxy de gap temporel
  dans une série continue — bruité, non fiable.
- La progression intra-session (cause → accumulation → effet dans une même session)
  n'est pas observable.
- Les séquences sont détectées sur la période totale du dataset, pas session par session.

### 8.4 Absence de raisonnement opérateur

**Conséquence directe :**
- Aucune cause ne peut être confirmée comme telle — seulement inférée via proxy.
- Le coaching sur la cause reste systématiquement dans le registre interrogatif,
  jamais diagnostique.
- La distinction besoin-action / FOMO / impulsivité / anticipation-compulsive
  n'est pas possible dans une entrée précipitée individuelle.

---

## 9. Récapitulatif — Tableau de détectabilité des séquences

| Séquence | Phase | Détectable V1 | Proxy disponible | Fiabilité |
|---|---|---|---|---|
| Seq1 besoin-action → overtrading | Cause (préventif) | Partiellement | Gap inactivité + overtrading | FAIBLE |
| Seq1 besoin-action → overtrading | Accumulation | Non | — | — |
| Seq1 besoin-action → overtrading | Effet (correctif) | Oui | `overtrading` pattern | ÉLEVÉE |
| Seq1 besoin-action → overtrading | Aggravation | Oui | overtrading + rapid_reentry / loss_chasing | ÉLEVÉE |
| Seq2 surcharge → dispersion | Cause (préventif) | Partiellement | `symbols.length` élevé | MOYENNE |
| Seq2 surcharge → dispersion | Accumulation | Non | — | — |
| Seq2 surcharge → dispersion | Effet (correctif) | Partiellement | overtrading multi-symboles | MOYENNE |
| Seq2 surcharge → dispersion | Aggravation | Oui | overtrading multi-sym + size_inconsistency | ÉLEVÉE |
| Seq3 aversion-perte → invalidation | Cause (préventif) | Non | avgDelayAfterSell non différenciable | — |
| Seq3 aversion-perte → invalidation | Accumulation | Non | — | — |
| Seq3 aversion-perte → invalidation | Effet (correctif) | Non | Positions ouvertes absentes du payload | — |
| Seq3 aversion-perte → invalidation | Aggravation | Non | — | — |

**Bilan V1 :**
- Séquence 1 : partiellement implémentable (phase corrective et aggravée en priorité)
- Séquence 2 : partiellement implémentable (phase corrective et aggravée en priorité)
- Séquence 3 : reportée intégralement à V2

---

## 10. Contraintes de ce document

- Aucun concept nouveau.
- Aucune implémentation JS.
- Aucun scoring inventé.
- Aucune modification du corpus ni des fiches existantes.
- Ce document est relu avant toute implémentation des séquences D4.
- Il est révisé en V2 quand P&L par trade et découpage sessions sont disponibles.

---

*Corpus stable à 52 concepts — 2026-05-22.*
*Ce document traite la dette D4 comme contrainte d'architecture, pas comme feature.*
