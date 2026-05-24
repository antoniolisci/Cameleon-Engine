# Gestion de l'attention — Caméléon Engine

**Statut** : Document d'architecture V2 · Chantier ouvert · Aucune implémentation immédiate
**Version** : 1.0 — 2026-05-24
**Composant V2** : 4/4 — suite de `docs/architecture/explicabilite-sobre.md`
**Doctrine de référence** : `docs/architecture/doctrine-silence-structurel.md`

---

## Point de départ

Les trois composants précédents ont produit une architecture qui sait :
détecter une tension (couche de cohérence inter-modules), la classer et sélectionner
un winner (hiérarchie des tensions), la formuler sobrement (couche d'explicabilité sobre).

La contrainte `active_exposed ≤ 1` garantit qu'une seule tension est visible à la fois.
Ce qu'elle ne garantit pas : le bruit temporel séquentiel.

Problème concret : une session longue peut exposer une tension, puis une autre, puis une
autre. Chaque exposition est individuellement légitime au regard des règles de routage.
Le cumul ne l'est plus. L'opérateur perçoit un moteur nerveux. Le cockpit qui était calme
devient anxieux — non pas parce qu'une règle a été violée, mais parce que les règles
locales ne contrôlent pas l'effet global dans le temps.

Ce composant traite le bruit séquentiel, pas le bruit simultané.
Il est le gate final de la chaîne V2.

---

## Ce que cette couche n'est pas

**Pas un scoring global d'attention.** La couche ne produit pas d'indice psychologique,
pas de score de fatigue cognitive, pas de mesure d'état émotionnel de l'opérateur.
Elle compte des événements observables (expositions), pas des états intérieurs.

**Pas un modificateur de tensions.** Elle ne recalcule pas la sévérité, ne change pas
le winner produit par la hiérarchie, ne touche à aucun module. Son seul output est
`should_expose: boolean`.

**Pas un filtre de qualité.** Elle ne juge pas si la tension était pertinente. Si elle
supprime un winner, ce n'est pas parce que la tension était mauvaise — c'est parce que
le cockpit a déjà trop travaillé dans cette fenêtre temporelle.

**Pas un système d'alerte inversée.** Elle ne signale pas sa propre activation. L'opérateur
ne voit pas "tension supprimée pour préserver la surface calme". Il voit simplement un
cockpit calme. La suppression est architecturalement invisible.

**Pas persistante au-delà de la session.** Aucun localStorage, aucune session storage.
L'état d'attention ne survit pas à la fermeture de l'onglet.

---

## Position dans la pipeline

La couche s'insère entre la hiérarchie des tensions et la couche d'explicabilité sobre :

```
[COUCHE COHÉRENCE]       → tensionMap
[HIÉRARCHIE]             → HierarchyResult { winner, absorbed[], escalated[], ... }
[GESTION DE L'ATTENTION] → AttentionResult { should_expose, attention_level, ... }
[EXPLICABILITÉ SOBRE]    → ExpositionResult | null
```

**Flux nominal :**
1. La hiérarchie produit `winner`.
2. La couche d'attention reçoit `winner` + `is_blocking` + son propre état (`AttentionState`).
3. Elle produit `AttentionResult`.
4. Si `should_expose = true` → la couche d'explicabilité traite `winner` normalement.
5. Si `should_expose = false` → la couche d'explicabilité reçoit un winner `null`. Rien n'est affiché.

**Exception absolue :** si `is_blocking = true`, la couche d'attention ne peut pas
supprimer. `should_expose` est forcé à `true` indépendamment de `attention_level`.
Une contradiction bloquante passe toujours.

---

## Structure de données

### AttentionState — état interne de la couche

```
AttentionState {
  expositions_session: number,              // total depuis le début de la session
  expositions_window: number,               // dans les N dernières soumissions (fenêtre glissante)
  attention_level: "normal" | "high" | "elevated",
  cycles_since_last_exposition: number      // soumissions consécutives sans exposition
}
```

`expositions_session` est un compteur absolu, incrémenté à chaque fois que `should_expose = true`.
Il ne détermine pas directement `attention_level` — c'est `expositions_window` qui gouverne.

`cycles_since_last_exposition` est le mécanisme de déclin. Réinitialisé à 0 à chaque
exposition effective. Incrémenté à chaque cycle sans exposition.

### AttentionResult — output produit à chaque cycle

```
AttentionResult {
  attention_level: "normal" | "high" | "elevated",  // état après évaluation du cycle courant
  should_expose: boolean,
  suppressed_winner: TensionId | null                // winner supprimé, si applicable
}
```

`suppressed_winner` est renseigné uniquement si `should_expose = false` et que le winner
de la hiérarchie était non nul. Il n'est jamais transmis à la couche d'explicabilité —
il est disponible uniquement dans le panel Debug.

---

## Règles d'élévation

L'élévation est déterminée par `expositions_window` — le nombre d'expositions effectives
dans la fenêtre glissante courante.

| `expositions_window` | `attention_level` | Tensions autorisées à passer |
|---|---|---|
| 0–1 | normal | Toutes — standard |
| 2 | high | `structural` + `critical` + `blocking` uniquement |
| 3+ | elevated | `blocking` uniquement |

**Lecture de la table :**
- En `normal`, toutes les tensions validées par la hiérarchie peuvent passer le gate.
- En `high`, les tensions `contextual` (sévérité 1–2, actionabilité faible) sont supprimées.
  Les tensions structurelles et critiques passent encore — elles justifient le coût d'interruption.
- En `elevated`, seule une contradiction bloquante passe. Tout le reste est supprimé silencieusement.

**Application :**
```
if (is_blocking) → should_expose = true  // exception absolue, hors table
if (attention_level = "normal") → should_expose = (winner ≠ null)
if (attention_level = "high")   → should_expose = (winner.type ∈ { structural, critical, blocking })
if (attention_level = "elevated") → should_expose = (winner.type = "blocking")
```

---

## Règles de déclin et garde-fous

### Règle de déclin

L'attention ne reste pas élevée indéfiniment. Après des cycles sans exposition,
elle redescend progressivement.

| `cycles_since_last_exposition` | Effet |
|---|---|
| < 2 | Aucun déclin — niveau maintenu |
| 2 | `elevated` → `high` |
| 4 | `high` → `normal` |

Le déclin est calculé à chaque cycle, avant l'évaluation de la tension courante.
Si le cycle courant produit une exposition, `cycles_since_last_exposition` repasse à 0
et aucun déclin ne se produit ce cycle.

### Garde-fou anti-oscillation

Une tension ne peut pas provoquer une élévation puis une suppression dans le même cycle.
L'élévation est évaluée sur l'état **avant** le cycle courant. L'état **après** le cycle
(incluant la nouvelle exposition éventuelle) ne s'applique qu'au cycle suivant.

Séquence garantie par cycle :
1. Déclin éventuel (si `cycles_since_last_exposition` atteint le seuil)
2. Lecture de `attention_level` courant
3. Décision `should_expose`
4. Si `should_expose = true` : incrément `expositions_window`, `expositions_session`, reset `cycles_since_last_exposition`
5. Si `should_expose = false` : incrément `cycles_since_last_exposition` uniquement

### Garde-fou anti-starvation

T1, T2 et T4 ont une actionabilité plus faible que T3. En `attention_level = high`,
elles sont filtrées. Si une session entière se déroule en niveau `high` ou `elevated`,
ces tensions ne passent jamais.

Constat : ce n'est pas un dysfonctionnement — c'est le comportement attendu. Une session
qui génère suffisamment de bruit pour maintenir un niveau élevé est une session où l'ajout
de tensions T1/T2/T4 aggraverait la situation. La starvation est une protection, pas une
erreur. Elle sera documentée comme comportement nominal (D-ATT-05).

---

## Comportement sur sessions longues et sans localStorage

### Sessions longues

`expositions_session` croît sans limite dans une session longue. Il ne gouverne pas
directement `attention_level` — c'est délibéré. Une session de 3 heures avec 20
expositions au total mais seulement 1 dans les 5 dernières soumissions est en niveau
`normal`. L'historique global n'est pas un critère de routage — c'est la densité
récente qui compte.

`expositions_session` est disponible dans le panel Debug comme indicateur de session.
Il n'est jamais affiché dans le cockpit.

### Sans localStorage

L'état `AttentionState` est en mémoire vive uniquement. Il est initialisé à l'ouverture
de la page et réinitialisé à chaque rechargement :

```
AttentionState initial {
  expositions_session: 0,
  expositions_window: 0,
  attention_level: "normal",
  cycles_since_last_exposition: 0
}
```

**Conséquence** : un rechargement de page remet le niveau à `normal`, même si la session
précédente avait atteint `elevated`. C'est un choix architectural, pas un oubli.
Justification : l'opérateur qui recharge la page effectue une réinitialisation implicite
de son contexte. Lui imposer un niveau `elevated` hérité d'une session qu'il a
délibérément fermée serait une friction non justifiée.

### Taille de la fenêtre glissante

La fenêtre glissante compare les expositions dans les **N dernières soumissions**.
La valeur de N est une dette de calibration (D-ATT-01). Valeur provisoire recommandée
pour l'implémentation : **N = 5**.

Logique : une session typique traite 3–8 soumissions par analyse. Une fenêtre de 5
couvre un demi-bloc de travail sans être si large qu'elle rendrait le déclin illusoire.
Cette valeur doit être validée terrain avant d'être figée.

---

## Questions ouvertes

**D-ATT-01 — Taille de la fenêtre glissante.**
Valeur provisoire N = 5. Doit être validée sur des sessions terrain réelles (REAL_001–004
peuvent servir de proxy si le nombre de soumissions par session est connu). Non bloquant
pour la conception — bloquant pour l'implémentation.

**D-ATT-02 — Near-misses : les tensions absorbées par la hiérarchie comptent-elles ?**
Argument pour : le moteur était dans un état tendu même si l'opérateur ne l'a pas vu.
Argument contre : l'opérateur n'a pas vécu de bruit — comptabiliser des suppressions
invisibles pénaliserait une session sans raison perçue.

Décision provisoire : **les near-misses ne comptent pas.** Seules les expositions effectives
(`should_expose = true`) incrémentent `expositions_window`. La couche d'attention mesure
le bruit perçu par l'opérateur, pas l'activité interne du moteur.

**D-ATT-03 — Persistance in-memory uniquement.**
Confirmé : aucun localStorage. Réinitialisé à chaque rechargement. Comportement documenté
comme nominal au § Comportement sur sessions longues.

**D-ATT-04 — Suppression totalement silencieuse vs indicateur passif optionnel.**
Décision provisoire : **suppression silencieuse.** Le cockpit calme doit sembler naturellement
calme, pas artificiellement censuré. Un indicateur passif (point discret, sans contenu)
risque de créer une frustration UX inverse — l'opérateur sait qu'une information lui a été
retenue et cherche à savoir laquelle. Cela contredit la doctrine.

La variante indicateur passif est documentée comme extension future optionnelle (D-ATT-04).
Elle pourrait être activée uniquement dans une version avancée où l'opérateur a explicitement
choisi un mode "transparent". Pas dans V2.

---

## Risques architecturaux

**Over-suppression.**
Si les seuils d'élévation sont trop bas (ex. N = 2 déclenche `elevated`), les tensions
critiques ne passent jamais dans les sessions actives. La surface calme est protégée mais
la valeur informative du moteur disparaît. Garde-fou : la table d'élévation doit être
calibrée terrain avant d'être figée (D-ATT-01). Valeur provisoire N = 5 vise une protection
sans over-suppression.

**Déclin trop rapide.**
Si l'attention redescend après 1 cycle sans exposition, deux tensions en rafale rapide
(soumissions successives) peuvent toutes deux passer — l'effet de protection est illusoire.
Garde-fou : le déclin minimal est de 2 cycles (`elevated` → `high`) puis 2 cycles
supplémentaires (`high` → `normal`). Soit 4 cycles sans exposition pour revenir au normal
depuis `elevated`.

**Conflit hiérarchie ↔ attention.**
La hiérarchie a escaladé une tension à "critical" selon des règles formelles. La couche
d'attention peut la supprimer. Ces deux jugements sont orthogonaux : la hiérarchie dit
"cette tension mérite d'être exposée", l'attention dit "pas maintenant — le cockpit a
déjà trop travaillé". Ce conflit est intentionnel et sain. Il n'y a pas de contradiction
architecturale.

**Cockpit artificiellement silencieux.**
Une session `elevated` prolongée crée un cockpit calme même en présence de tensions réelles.
L'opérateur pourrait prendre des décisions dans un faux sentiment de sécurité. Garde-fou :
l'exception absolue `is_blocking` garantit que les contradictions irréductibles passent
toujours. Les tensions non bloquantes supprimées sont, par définition, des tensions dont
l'absence n'empêche pas une décision raisonnable.

**Starvation de T1, T2 et T4.**
En `attention_level = high` ou `elevated`, T1, T2 et T4 ne passent jamais. Dans une session
longue et active, ces tensions pourraient ne jamais être exposées. Garde-fou documentaire :
ce comportement est nominal (voir § Règles de déclin — garde-fou anti-starvation). La
starvation est une protection, pas une perte d'information. Les tensions T1/T2/T4 passent
en niveau `normal` — si le niveau ne redescend jamais, c'est que la session génère
suffisamment de bruit pour que leur ajout soit contre-productif.

---

## Ce que cette couche produit

- La **structure `AttentionState`** : état interne avec compteurs de session, fenêtre glissante, niveau, cycles depuis dernière exposition.
- La **structure `AttentionResult`** : output par cycle avec `should_expose`, `attention_level`, `suppressed_winner`.
- La **table d'élévation** : normal / high / elevated selon `expositions_window`, avec tensions autorisées à chaque niveau.
- Les **règles de déclin** : paliers à 2 et 4 cycles sans exposition, garde-fou anti-oscillation, séquence garantie par cycle.
- Le **garde-fou anti-starvation** : documentation du comportement nominal pour T1/T2/T4 en niveaux élevés.
- Le **comportement sur sessions longues et sans localStorage** : distinction session/fenêtre, réinitialisation au rechargement, justification.
- Les **décisions provisoires sur D-ATT-01 à 04** : N = 5, near-misses exclus, pas de localStorage, suppression silencieuse.
- L'**inventaire des risques** avec garde-fous explicites : over-suppression, déclin trop rapide, conflit hiérarchie/attention, cockpit artificiel, starvation.
- L'**inventaire des dettes** D-ATT-01 à 05.

---

## Dettes identifiées

| Référence | Nature | Bloquante ? |
|---|---|---|
| D-ATT-01 | Taille de la fenêtre glissante — valeur provisoire N = 5, à valider terrain | Non — bloquant à l'implémentation |
| D-ATT-02 | Near-misses — décision provisoire : exclus. À réévaluer si l'observation terrain révèle des patterns inattendus | Non |
| D-ATT-03 | Persistance in-memory confirmée — comportement de rechargement documenté comme nominal | Non — clos provisoirement |
| D-ATT-04 | Indicateur passif optionnel — suppression silencieuse retenue pour V2, variante passive réservée à une version future | Non |
| D-ATT-05 | Starvation T1/T2/T4 — comportement nominal documenté, à surveiller en observation terrain | Non |

---

## Statut

**Type** : Document d'architecture V2.
**Périmètre** : Gestion de l'attention — conception uniquement.
**Aucune implémentation immédiate.**
**Aucune modification moteur à partir de ce document.**
**Aucun nouveau corpus d'indicateurs.**

Ce document est le quatrième et dernier composant de l'architecture V2 définie par
la doctrine du silence structurel. Les quatre composants forment une chaîne complète :

```
Cohérence inter-modules   → détection des tensions
Hiérarchie des tensions   → classification et sélection du winner
Explicabilité sobre       → formulation opérationnelle neutre
Gestion de l'attention    → gate final, protection de la surface calme
```

L'architecture V2 est désormais documentée dans son intégralité.
Aucune implémentation ne peut commencer avant que les dettes D-COH-01, D-HIE-01
et D-ATT-01 (seuils et fenêtre) soient résolues par calibration terrain.
