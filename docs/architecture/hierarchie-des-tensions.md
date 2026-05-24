# Hiérarchie des tensions — Caméléon Engine

**Statut** : Document d'architecture V2 · Chantier ouvert · Aucune implémentation immédiate
**Version** : 1.0 — 2026-05-24
**Composant V2** : 2/4 — suite de `docs/architecture/couche-coherence-inter-modules.md`
**Doctrine de référence** : `docs/architecture/doctrine-silence-structurel.md`

---

## Point de départ

La doctrine du silence structurel liste la hiérarchie des tensions comme deuxième
composant V2. La couche de cohérence inter-modules a produit le catalogue T1–T4
et l'algorithme de routage. Mais l'algorithme de routage suppose une hiérarchie
qu'il n'a pas encore formalisée.

Problème concret : si T1 et T3 passent simultanément le routage, lequel s'expose ?
Sur quelle base ? La contrainte `active_exposed ≤ 1` exige une réponse déterministe
à cette question.

Ce document répond à cette question.

---

## Ce que la hiérarchie n'est pas

**Pas une liste ordonnée fixe.** T3 n'est pas toujours plus important que T1.
La priorité dépend du contexte de session.

**Pas un système de score global.** Additionner des scores de tensions différentes
pour produire un "score de cohérence global" crée un agrégat opaque sans valeur
opérationnelle.

**Pas une classification statique.** La même tension peut être `silencieuse` dans
un contexte et `critique` dans un autre. La hiérarchie est un mécanisme de
classification dynamique, pas un rang permanent.

---

## Les deux dimensions de la hiérarchie

Toute tension se positionne sur deux axes indépendants :

**Axe 1 — Sévérité structurelle** : dans quelle mesure cette tension affecte-t-elle
la fiabilité de la décision ?

| Niveau | Signification |
|---|---|
| 0 — Marginal | Tension détectée, impact nul sur la décision |
| 1 — Contextuel | Tension réelle, impact conditionnel selon le contexte |
| 2 — Structurel | Non-alignement inter-modules avéré, impact sur la lecture globale |
| 3 — Critique | Contradiction qui rend la décision partiellement non fiable |
| 4 — Bloquant | Contradiction irréductible, décision impossible |

**Axe 2 — Actionabilité immédiate** : l'opérateur peut-il réduire cette tension
dans la session courante ?

| Niveau | Signification |
|---|---|
| 0 — Non actionnable | Aucun levier disponible dans la session |
| 1 — Conditionnelle | Levier disponible sous conditions |
| 2 — Directe | L'opérateur peut agir immédiatement et de façon déterministe |

La hiérarchie est le produit de ces deux axes. Une tension de sévérité 3 et
d'actionabilité 0 est moins utile à exposer qu'une tension de sévérité 2 et
d'actionabilité 2.

---

## Classification des tensions cataloguées

| Tension | Sévérité par défaut | Actionabilité | Exposition candidate |
|---|---|---|---|
| T3 — Engagement ↔ Posture | 2–3 selon delta | 2 — directe | Priorité haute |
| T1 — Freeware ↔ Premium | 2 | 1 — conditionnelle | Priorité moyenne |
| T2 — Profil ↔ Posture | 2 | 1 — conditionnelle | Priorité moyenne |
| T4 — QdR ↔ MdS | 1–2 | 0–1 | Priorité basse |

**T3 prime dans la quasi-totalité des contextes** : sévérité potentiellement critique
(delta 2+ crans) et actionabilité maximale. C'est la tension qui répond le mieux
à la règle d'exposition — fait structurel, levier direct.

**T1 et T2 sont de même rang par défaut.** Le tie-breaking nécessite un critère
supplémentaire (voir § Règles de tie-breaking).

**T4 est exposée uniquement en l'absence de toute autre tension active** : sévérité
moindre, actionabilité faible.

---

## Escalade et désescalade

La sévérité d'une tension n'est pas fixe. Elle est modulée par le contexte de session.

### Conditions d'escalade (hausse de sévérité)

| Condition | Effet |
|---|---|
| Delta T3 ≥ 2 crans | T3 passe de structurelle à critique |
| DMU actif + T1 déclenchée | T1 monte d'un niveau (confirmation multi-signaux) |
| T2 + T3 simultanément déclenchées | T2 monte à critique (double signal comportemental/structural) |
| Régime de volatilité extrême | Toute tension structurelle monte d'un niveau |

### Conditions de désescalade (baisse de sévérité)

| Condition | Effet |
|---|---|
| Module comportemental absent (pas de CSV) | T2 tombe à silencieuse — donnée manquante |
| Delta T3 = 1 cran | T3 reste contextuelle, ne monte pas à critique |
| dataQuality comportemental = LOW | T2 tombe d'un niveau — profil peu fiable |

### Règle de désescalade comportementale

Si `dataQuality.level = LOW`, toute tension impliquant le profil comportemental (T2)
perd un niveau de sévérité. Un profil issu de données insuffisantes ne peut pas
déclencher une tension critique.

### Garde-fou anti-oscillation

Une tension ne peut pas escalader puis désescalader dans le même cycle de calcul.
Une tension exposée reste à son niveau pendant au moins un cycle complet avant
de pouvoir désescalader.

---

## Règles de tie-breaking

Quand deux tensions de même sévérité passent le routage simultanément :

**Règle 1 — Actionabilité prime.**
Entre T1 (actionabilité conditionnelle) et T3 (actionabilité directe) à sévérité
égale, T3 s'expose. L'opérateur peut agir sur T3 maintenant.

**Règle 2 — Proximité de la décision courante.**
La tension qui concerne l'action immédiate prime sur la tension qui concerne le
contexte général. T3 (engagement déclaré = action courante) prime sur T1
(lecture de marché = contexte).

**Règle 3 — Tensions intra-premium last.**
T4 (QdR ↔ MdS) ne s'expose jamais si T1, T2 ou T3 est active. Tension de
second niveau par construction.

**Ordre de priorité résultant :**

```
Contradiction bloquante
  > Tension critique (T3 delta 2+, ou T2+T3 simultanées)
    > T3 structurelle (delta 1 cran)
      > T1 (freeware ↔ premium)
        > T2 (profil ↔ posture)
          > T4 (QdR ↔ MdS)
            > Tensions silencieuses (jamais exposées)
```

---

## Interaction avec le régime de marché

Le régime de marché module les seuils d'escalade, pas la hiérarchie elle-même.

| Régime | Effet sur la hiérarchie |
|---|---|
| Volatilité élevée | Seuil d'exposition relevé — seule la tension top-1 peut passer |
| Structure dégradée | T1 potentiellement escaladée (contexte premium déjà contradictoire) |
| Marché calme / lisible | Seuil normal — le mécanisme de tie-breaking standard s'applique |

Le régime de marché ne réordonne pas la hiérarchie. Il élève ou abaisse le seuil
à partir duquel une tension atteint l'exposition.

---

## Interaction avec le profil comportemental

Le profil comportemental module les seuils de T2 et l'escalade de T3.

| Profil | Effet |
|---|---|
| Discipliné | Seuil d'exposition de T2 abaissé — la tension est plus utile à exposer |
| Réactif | Seuil normal |
| Impulsif | Seuil d'exposition de T2 relevé ; T3 escalade plus facilement |
| Agressif | Même règle qu'Impulsif + T1 monte d'un niveau si présente |

Logique : un profil Discipliné peut recevoir une tension T2 sans risque de
surinterprétation. Un profil Impulsif est plus sensible — T2 risque d'aggraver
la réactivité plutôt que de la réduire.

**Contrainte dataQuality** : l'escalade comportementale est conditionnée à
`dataQuality ≥ MEDIUM`. Un profil Agressif issu de données insuffisantes
(`dataQuality = LOW`) ne déclenche pas l'escalade de T1.

---

## Ce que la hiérarchie produit concrètement

À chaque cycle de calcul, la hiérarchie produit :

```
HierarchyResult {
  winner: TensionId | null,
  absorbed: TensionId[],
  silent: TensionId[],
  escalated: TensionId[],
  deescalated: TensionId[]
}
```

`winner` est l'unique tension transmise à la couche d'explicabilité sobre
(composant V2-3). Tout le reste est absorbé silencieusement, disponible
uniquement dans le panel Debug.

Si `winner = null` : aucune tension n'a passé le routage ce cycle. Le moteur
fonctionne en mode silence total — comportement normal et majoritaire.

---

## Risques architecturaux

**Priority inflation** : si les conditions d'escalade sont trop larges, tout devient
critique, la doctrine est violée. Garde-fou : aucune tension ne peut escalader plus
d'un niveau par cycle.

**Stabilité oscillatoire** : si une tension escalade puis désescalade alternativement
entre deux cycles, elle crée un signal instable. Garde-fou : une tension exposée reste
à son niveau pendant au moins un cycle complet avant de pouvoir désescalader.

**Biais T3** : T3 primerait presque systématiquement si les règles de tie-breaking
sont trop rigides. Risque de rendre T1 et T2 structurellement invisibles. Garde-fou :
si T3 est silencieuse (delta = 0), T1 et T2 reprennent leur rang normal.

**Fausse escalade comportementale** : un profil Agressif avec `dataQuality = LOW`
ne doit pas escalader T1. Règle : l'escalade comportementale est conditionnée à
`dataQuality ≥ MEDIUM`.

---

## Dettes identifiées

| Référence | Nature | Bloquante ? |
|---|---|---|
| D-HIE-01 | Valeurs numériques exactes des seuils d'escalade (delta T3, seuils T1) | Non |
| D-HIE-02 | Définition formelle de `dataQuality ≥ MEDIUM` dans le module comportemental | Non |
| D-HIE-03 | Comportement si toutes les tensions sont simultanément bloquantes | Non — cas théorique |
| D-HIE-04 | Persistance du niveau de tension entre cycles (stabilité oscillatoire) | Non |

---

## Statut

**Type** : Document d'architecture V2.
**Périmètre** : Hiérarchie des tensions — conception uniquement.
**Aucune implémentation immédiate.**
**Aucune modification moteur à partir de ce document.**
**Aucun nouveau corpus d'indicateurs.**

Ce document produit :
- Les deux axes de classification (sévérité structurelle × actionabilité immédiate).
- La classification par défaut des tensions T1–T4.
- Les règles d'escalade et désescalade avec garde-fous.
- L'ordre de priorité résultant et les règles de tie-breaking.
- Les interactions avec le régime de marché et le profil comportemental.
- La structure `HierarchyResult` transmise à la couche d'explicabilité sobre.
- L'inventaire des dettes D-HIE-01 à 04.

Prochaine étape naturelle : couche d'explicabilité sobre (composant V2-3).
