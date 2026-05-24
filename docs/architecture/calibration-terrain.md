# Calibration terrain — Caméléon Engine

## Métadonnées

**Statut** : Protocole V0 · Document vivant · Aucune implémentation immédiate
**Version** : 1.0 — 2026-05-24
**Dépendances** :
- `docs/architecture/couche-coherence-inter-modules.md`
- `docs/architecture/hierarchie-des-tensions.md`
- `docs/architecture/gestion-attention.md`

---

## Point de départ

L'architecture V2 est documentée dans son intégralité : doctrine du silence structurel,
couche de cohérence inter-modules, hiérarchie des tensions, couche d'explicabilité sobre,
gestion de l'attention. Les quatre composants forment une chaîne cohérente et complète
sur le plan conceptuel.

Mais l'architecture est théorique. Elle définit comment les tensions seront détectées,
classées, filtrées et formulées. Elle ne peut pas définir à quel seuil numérique une
tension devient réelle plutôt que du bruit. Ces seuils dépendent du comportement observé
du moteur en conditions réelles, avec des opérateurs réels, sur des marchés réels.

**La distinction centrale** : architecture et calibration sont deux opérations différentes.

L'architecture définit la structure — quelles variables entrent, comment elles interagissent,
quelle forme prend l'output. La calibration valide que les valeurs provisoires choisies
pour les seuils produisent le comportement souhaité dans les conditions d'usage réel.

Un seuil mal calibré ne viole pas l'architecture — il en dégrade la valeur. Une tension
qui se déclenche trop facilement devient du bruit. Une tension qui ne se déclenche jamais
est architecturalement présente mais opérationnellement absente.

La calibration terrain est donc une phase de validation, pas d'optimisation. Son objectif
n'est pas de rendre le moteur plus performant selon une métrique abstraite. Il est de
s'assurer que les seuils provisoires correspondent au comportement réel du moteur tel
qu'observé par des opérateurs dans des sessions authentiques.

---

## Ce que la calibration terrain n'est pas

**Pas une optimisation de performance.** La calibration ne cherche pas à maximiser un
score, minimiser un taux d'erreur, ou atteindre un optimum défini par une fonction de coût.
Elle cherche à valider que les seuils produisent un comportement cohérent avec la doctrine.

**Pas une maximisation des tensions exposées.** Un moteur qui expose beaucoup de tensions
n'est pas mieux calibré qu'un moteur qui en expose peu. La doctrine du silence structurel
pose l'absorption comme état par défaut. Un cockpit calme est le comportement nominal —
pas un signe de sous-calibration.

**Pas une personnalisation par utilisateur.** Les seuils calibrés sont des seuils globaux.
La calibration ne vise pas à adapter le moteur au profil individuel de chaque opérateur.
Elle vise à trouver des valeurs robustes pour l'ensemble de la population cible.

**Pas un scoring psychologique.** La calibration de D-ATT-01 (fenêtre glissante) ne mesure
pas la fatigue cognitive réelle des opérateurs. Elle mesure un proxy structurel observable :
la densité d'expositions par session, qui est un fait comptable, pas une inférence sur l'état
intérieur de l'opérateur.

**Pas une phase de développement.** La calibration ne produit pas de code, ne modifie pas
l'architecture, ne crée pas de nouveau corpus. Elle produit des valeurs numériques validées
pour remplacer les hypothèses provisoires actuelles.

---

## Inventaire des dettes concernées

| Référence | Sujet | Composant | Statut |
|---|---|---|---|
| D-COH-01 | Seuils de déclenchement T1 et T4 | Couche de cohérence | **Ouvert** — bloquant à l'implémentation |
| D-HIE-01 | Valeurs numériques exactes des seuils d'escalade | Hiérarchie des tensions | **Partiellement clos** — voir § suivant |
| D-ATT-01 | Taille de la fenêtre glissante N | Gestion de l'attention | **Ouvert** — hypothèse N = 5 provisoire |

Les dettes D-COH-02, D-COH-03, D-COH-04, D-HIE-02 à 04, D-EXP-01 à 04 et D-ATT-02 à 05
ne nécessitent pas de calibration terrain — elles relèvent de décisions d'architecture ou
de validation qualitative. Elles ne sont pas traitées dans ce document.

---

## Ce qui est déjà considéré comme résolu

### T2 — Profil comportemental ↔ Posture moteur

Le déclenchement de T2 est binaire :

```
posture = ACTIVE AND profil ∈ { Impulsif, Agressif }
```

Aucun seuil flottant n'est nécessaire. La combinaison est soit présente, soit absente.
La valeur du `profil` est catégorielle (4 labels fixes). La valeur de `posture` est
catégorielle (3 labels fixes). Leur combinaison n'a pas de dimension continue à calibrer.

**Statut** : clos provisoirement. Réévaluable si l'observation terrain révèle des
faux positifs systématiques sur Réactif (actuellement exclu de T2).

### T3 — Engagement déclaré ↔ Posture recommandée

Le delta T3 est ordinal. L'engagement et la posture sont tous deux définis sur des
échelles à 3 valeurs normalisées (1–3). Le delta est calculé en crans entiers.

```
delta 0  → silence
delta 1  → tension contextuelle
delta 2+ → tension critique
```

Aucun seuil continu n'est à calibrer. Le découpage en crans est déjà la granularité
minimale du système — il n'existe pas de valeur intermédiaire entre 1 cran et 2 crans.

**Escalade T3** : `delta ≥ 2` déclenche une escalade vers critique. Cette règle est
déjà formalisée dans la hiérarchie des tensions. D-HIE-01 est donc partiellement clos
sur ce point. La seule question résiduelle de D-HIE-01 (comportement si toutes les
tensions sont simultanément bloquantes) est un cas théorique non bloquant.

**Statut** : clos. Aucune calibration terrain nécessaire pour T3 et l'escalade T3.

---

## Ce qui reste réellement à calibrer

### T1 — Synthèse freeware ↔ Qualificateurs premium

La forme du déclenchement est définie architecturalement :

```
confidence_score > X
AND (
  MdS ≤ Y
  OR DMU = actif
)
```

**X** (seuil de lisibilité) et **Y** (seuil de maturité de structure) sont inconnus.
Ils ne peuvent pas être déduits logiquement — ils dépendent de la distribution réelle
des `confidence_score` observés dans les sessions moteur et des valeurs MdS associées.

Questions terrain qui déterminent X :
- À partir de quel score de lisibilité l'opérateur commence-t-il à agir sur la synthèse
  freeware sans vérification premium supplémentaire ?
- En dessous de quel score, la contradiction premium est-elle attendue et donc non informative ?
- Un seuil X trop bas → faux positifs en série, tension T1 active même quand le marché
  est structurellement ambigu par construction.
- Un seuil X trop haut → T1 ne se déclenche jamais, tension absente dans les cas pertinents.

Questions terrain qui déterminent Y :
- Quelles valeurs ordinales de MdS signalent une structure réellement précoce (non confirmée)
  plutôt qu'une structure simplement en phase intermédiaire ?
- La combinaison `confidence_score élevé + DMU actif` suffit-elle sans MdS, ou faut-il
  les deux signaux ?

**Hypothèses provisoires** : `X = 65`, `Y = 2` (sur une échelle 1–4). À valider terrain.

---

### T4 — QdR ↔ MdS (tension intra-premium)

La forme du déclenchement est définie architecturalement :

```
QdR ≥ X
AND MdS ≤ Y
```

QdR et MdS sont tous deux des indicateurs ordinaux à 4 niveaux. La combinaison
"retracement de qualité dans une structure non confirmée" est une ambiguïté structurelle
réelle — mais à partir de quels rangs ordinaux cette ambiguïté devient-elle informative
plutôt que du bruit de fond normal du corpus premium ?

Questions terrain :
- La combinaison QdR = 3 / MdS = 2 est-elle fréquente au point d'être non remarquable ?
- La combinaison QdR = 4 / MdS = 1 est-elle suffisamment rare pour être systématiquement
  informative ?
- T4 risque d'être la tension la plus fréquente ou la plus rare selon les seuils retenus.
  Son calibrage détermine si elle est une tension utile ou une tension structurellement absente.

**Hypothèses provisoires** : `X = 3` (QdR ≥ 3), `Y = 2` (MdS ≤ 2). À valider terrain.

---

### D-ATT-01 — Fenêtre glissante N

L'hypothèse actuelle est `N = 5`. Elle repose sur l'estimation d'une session typique
à 3–8 soumissions. Sans observation réelle, cette estimation est non vérifiée.

Questions terrain :
- Le cockpit est-il perçu comme trop silencieux ? Signal : opérateurs qui signalent
  ne jamais voir de tensions alors qu'ils s'attendaient à en voir.
- Le niveau `elevated` est-il atteint trop fréquemment ? Signal : tensions structurelles
  supprimées dans des sessions courtes (3–4 soumissions).
- Des tensions utiles sont-elles régulièrement supprimées par la gestion de l'attention
  alors qu'elles auraient modifié une décision ?

**Hypothèse provisoire** : `N = 5`. Ajustements possibles : N = 3 (fenêtre courte,
protection plus agressive) ou N = 7 (fenêtre large, protection plus souple).

---

## Ce que les datasets REAL_001–004 peuvent apporter

**Rappel structurel** : les datasets REAL_001–004 sont des historiques d'ordres et
de trades. Ils ne sont pas des sessions Cameleon Engine. Ils n'ont pas été soumis
au formulaire moteur et n'ont pas produit de `confidence_score`, de `posture`, ni
de valeurs DMU/MdS/QdR au sens du moteur.

### Utilisable indirectement

**Distribution des profils comportementaux** : les datasets REAL permettent d'estimer
la fréquence des profils Discipliné / Réactif / Impulsif / Agressif dans une population
de traders réels. Cela donne un ordre de grandeur de la fréquence attendue de T2 —
combien d'opérateurs tomberont dans la combinaison ACTIVE + Impulsif/Agressif.

**Durée et densité des sessions** : les datasets REAL documentent des horizons temporels
de trading (2 semaines à 2.3 ans, REAL_004). En faisant l'hypothèse qu'une session moteur
correspond à une analyse journalière ou hebdomadaire, il est possible d'estimer grossièrement
le nombre de soumissions attendues par opérateur sur une période de test V0. Ce proxy est
imprécis mais donne un ordre de grandeur pour D-ATT-01.

**Patterns multi-actifs** : REAL_001 et REAL_004 couvrent 89+ actifs avec des trajectoires
de concentration vers 1–8 actifs au fil du temps. Cela suggère que les opérateurs réels
travaillent sur des portefeuilles changeants — information utile pour calibrer la fréquence
attendue de T1 (lisibilité freeware sur des actifs de maturité variable).

### Non utilisable directement

**Seuils confidence_score** : les datasets REAL ne contiennent aucune valeur de
`confidence_score` — cet indicateur n'existe que dans les sessions moteur.

**Distributions MdS, QdR, DMU** : idem — ces valeurs sont produites par le moteur,
pas extraites des historiques de trading.

**Deltas T3** : l'engagement déclaré et la posture recommandée sont des outputs de
session moteur, pas des données présentes dans les historiques.

---

## Dépendance structurelle au test V0

La calibration de T1, T4 et D-ATT-01 ne peut pas être réalisée sans sessions moteur réelles.
Il n'existe pas de jeu de données synthétique qui produise une distribution crédible des
`confidence_score` ou des combinaisons MdS/QdR dans des conditions d'usage authentiques.

**Ce que le test réel V0 doit produire pour permettre la calibration :**

| Variable | Usage | Tension concernée |
|---|---|---|
| `confidence_score` par soumission | Distribution, percentiles, fréquence > 65 | T1 seuil X |
| `MdS` par soumission | Distribution ordinale, co-occurrence avec confidence élevé | T1 seuil Y |
| `DMU` par soumission | Fréquence d'activation, co-occurrence avec confidence élevé | T1 déclenchement |
| `QdR` par soumission | Distribution ordinale | T4 seuil X |
| Co-occurrence QdR/MdS | Fréquence des combinaisons hautes/basses | T4 seuil Y |
| Nombre de soumissions par session | Distribution, médiane, percentile 90 | D-ATT-01 valeur N |
| Fréquence des tensions T1/T4 déclenchées | Taux avec hypothèses provisoires | Validation seuils |
| Fréquence des suppressions attention | Taux de `should_expose = false` | Validation N |

Ces données ne nécessitent pas de journalisation permanente au sens de localStorage.
Elles peuvent être collectées via le panel Debug existant sur la durée du test V0,
manuellement ou par export ponctuel.

---

## Protocole de collecte V0

**Taille cible** : 20–30 opérateurs (conforme à la doctrine de transmission test réel V0).
**Durée cible** : 2–4 semaines de sessions actives.

### Données à collecter par session

| Champ | Type | Méthode | Destination |
|---|---|---|---|
| `confidence_score` | Numérique 0–100 | Panel Debug / export | Calibration T1 |
| `posture` | Catégoriel 3 valeurs | Panel Debug | Calibration T2 (validation) |
| `MdS` | Ordinal 1–4 | Panel Debug / export | Calibration T1 + T4 |
| `QdR` | Ordinal 1–4 | Panel Debug / export | Calibration T4 |
| `DMU` | Booléen | Panel Debug / export | Calibration T1 |
| Engagement déclaré | Ordinal 1–3 | Formulaire | Calibration T3 (validation) |
| Nombre de soumissions | Compteur | Panel Debug | Calibration D-ATT-01 |

### Données à collecter par observation de tension (si T1/T4 implémentées)

| Champ | Type | Méthode | Destination |
|---|---|---|---|
| Tension déclenchée (id) | Catégoriel T1/T2/T3/T4 | Log interne | Fréquence |
| Tension supprimée (attention) | Booléen | Log interne | Taux suppression |
| `attention_level` au moment | Catégoriel 3 valeurs | Log interne | Validation D-ATT-01 |

### Données à collecter par retour opérateur

| Question | Type | Destination |
|---|---|---|
| "Le cockpit vous a-t-il semblé bruyant ?" | Binaire + commentaire | Validation D-ATT-01 |
| "Des informations vous ont-elles semblé manquer ?" | Binaire + commentaire | Validation over-suppression |
| "La tension affichée vous a-t-elle apporté une information utile ?" | Binaire | Validation T1/T4 pertinence |

**Note sur les retours opérateur** : les retours qualitatifs sont un complément,
pas la base de la calibration. Un opérateur qui dit "je ne vois pas de tensions"
peut signifier que les seuils sont trop hauts ou que le marché observé était stable.
Ces deux causes sont indiscernables sans les données quantitatives associées.

---

## Critères de validation

### Validation T1 — seuils X et Y

Un seuil T1 est validé si :

**Cohérence** : les sessions où T1 se déclenche correspondent à des sessions où
`confidence_score` élevé et premium contradictoire co-existent de façon structurelle
— pas aléatoirement.

**Rareté** : T1 ne se déclenche pas dans plus de 20–30 % des soumissions où
`confidence_score > X`. Si T1 se déclenche quasi-systématiquement dès que le score
est élevé, Y est trop permissif — toute lisibilité élevée est faussement perçue comme
en tension avec le premium.

**Absence de bruit** : les soumissions où T1 se déclenche mais où l'opérateur
ne modifie pas son comportement après exposition constituent un proxy de bruit.
Un taux > 50 % indique un seuil trop bas.

**Surface calme préservée** : dans les sessions sans signal premium contradictoire
avéré, T1 doit être silencieuse. Un déclenchement en l'absence de contradiction
réelle est un faux positif structurel.

### Validation T4 — seuils QdR X et MdS Y

Un seuil T4 est validé si :

**Cohérence** : la combinaison QdR ≥ X / MdS ≤ Y correspond à des situations où
l'opérateur est effectivement face à un retracement formellement propre dans une
structure non confirmée — pas simplement deux indicateurs premium sans rapport contextuel.

**Rareté** : T4 doit être la tension la moins fréquente (par définition — tension
intra-premium de second niveau). Si T4 se déclenche aussi souvent que T3, les seuils
sont trop permissifs.

**Non-redondance avec T1** : si T4 se déclenche systématiquement en même temps que T1,
les deux tensions mesurent le même phénomène. Signe que Y (MdS dans T4) est trop proche
de Y (MdS dans T1) — à différencier.

### Validation gestion de l'attention — valeur N

La valeur N est validée si :

**Absence de sur-suppression** : sur l'ensemble du test V0, moins de 15 % des tensions
structurelles ou critiques validées par la hiérarchie sont supprimées par la gestion
de l'attention. Au-delà, N est trop petit et le cockpit est sur-protégé.

**Surface calme effective** : les opérateurs ne signalent pas un cockpit bruyant
ou nerveux. Proxy : retour qualitatif + observation du taux de tensions T3 exposées
consécutivement dans la même session.

**Déclin fonctionnel** : le niveau `elevated` ne persiste pas plus de 3–4 cycles
en l'absence de nouvelles tensions. Si `elevated` persiste plus longtemps, les règles
de déclin ne fonctionnent pas comme attendu avec la valeur N retenue.

---

## Hypothèses provisoires actuelles

| Paramètre | Valeur provisoire | Source | À valider par |
|---|---|---|---|
| T1 seuil X (`confidence_score`) | 65 | Estimation raisonnée | Test V0 — distribution confidence |
| T1 seuil Y (`MdS`) | ≤ 2 (sur 4) | Estimation raisonnée | Test V0 — co-occurrence |
| T4 seuil X (`QdR`) | ≥ 3 (sur 4) | Estimation raisonnée | Test V0 — distribution QdR |
| T4 seuil Y (`MdS`) | ≤ 2 (sur 4) | Estimation raisonnée | Test V0 — co-occurrence |
| D-ATT-01 fenêtre N | 5 | Estimation session 3–8 soumissions | Test V0 — densité par session |
| D-ATT-01 seuil elevated | 3 expositions dans la fenêtre | Table d'élévation V2 | Test V0 — taux suppression |
| D-ATT-01 déclin palier 1 | 2 cycles sans exposition | Garde-fou anti-oscillation | Test V0 — persistance elevated |
| D-ATT-01 déclin palier 2 | 4 cycles sans exposition | Garde-fou anti-oscillation | Test V0 — persistance high |
| Near-misses | Exclus du comptage | Décision provisoire D-ATT-02 | Test V0 — patterns inattendus |
| Suppression silencieuse | Activée (pas d'indicateur) | Décision provisoire D-ATT-04 | Test V0 — retour qualitatif |

Toutes les valeurs de cette table sont modifiables après calibration. La modification
d'un seuil ne constitue pas une révision architecturale — elle n'affecte pas la structure
des composants V2 ni les règles de routage. Elle substitue une valeur provisoire par une
valeur validée terrain.

---

## Tableau de calibration terrain (à remplir)

### T1 — Seuils confidence_score × MdS

| Sessions observées | confidence_score médian | Percentile 80 | Fréquence MdS ≤ 2 avec confidence > 65 | Faux positifs T1 | Taux bruit | Seuil X retenu | Seuil Y retenu | Notes |
|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | À remplir post-V0 |

### T4 — Seuils QdR × MdS

| Sessions observées | Fréquence QdR ≥ 3 | Fréquence MdS ≤ 2 | Co-occurrence QdR≥3/MdS≤2 | Redondance avec T1 | Taux bruit | Seuil X retenu | Seuil Y retenu | Notes |
|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | À remplir post-V0 |

### Gestion de l'attention — Fenêtre N

| Sessions observées | Soumissions/session médian | Soumissions/session p90 | Taux elevated | Taux suppression structurelle | Cockpit perçu bruyant (%) | Valeur N retenue | Notes |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | À remplir post-V0 |

---

## Risques de calibration

**Overfitting sur le panel V0.**
Le panel de 20–30 opérateurs n'est pas représentatif de toute la population cible.
Des seuils calibrés sur ce panel peuvent être inadaptés à des opérateurs avec des
profils différents (novices vs expérimentés, actifs exotiques vs majeurs).
Garde-fou : les seuils retenus doivent être robustes sur au moins 70 % du panel,
pas optimaux pour un sous-groupe. Toute valeur qui n'est satisfaisante que pour
une minorité est rejetée même si elle optimise une métrique.

**Sous-exposition systématique.**
Si les seuils provisoires sont trop hauts, T1 et T4 ne se déclenchent jamais pendant V0.
La calibration est alors impossible — on ne peut pas ajuster un paramètre sur un signal
absent. Garde-fou : inclure dans le protocole V0 des sessions test avec des conditions
connues pour produire T1 (confidence élevé + MdS faible intentionnellement soumis).

**Sur-exposition pendant V0.**
Si les seuils provisoires sont trop bas, le cockpit devient bruyant pendant V0 et les
opérateurs abandonnent le test. Cela invalide les données de session avant même la
calibration. Garde-fou : démarrer V0 avec des seuils délibérément conservateurs (X = 70,
Y = 1) et les abaisser progressivement si T1/T4 sont trop rares.

**Biais comportemental du panel.**
Les 20–30 opérateurs invités en V0 sont sélectionnés par invitation directe — ce ne sont
pas des utilisateurs aléatoires. Ils peuvent avoir des profils comportementaux atypiques
(traders plus expérimentés, plus disciplinés, plus attentifs). La distribution de T2
observée sur ce panel peut sous-estimer la fréquence réelle de T2 dans la population
générale. Garde-fou : documenter explicitement les profils comportementaux du panel V0
et signaler si la proportion Impulsif/Agressif est inhabituellement faible.

**Confusion calibration / validation architecturale.**
L'ajustement d'un seuil après observation peut être confondu avec une révision de
l'architecture. Garde-fou : toute modification issue de la calibration se limite aux
valeurs numériques dans ce document. Si l'observation terrain révèle un problème
structurel (ex. T1 ne détecte pas ce qu'elle est censée détecter même avec des seuils
variés), c'est une révision architecturale — elle nécessite de rouvrir
`couche-coherence-inter-modules.md`, pas de modifier ce tableau.

---

## Statut

**Type** : Protocole V0 · Document vivant.
**Périmètre** : Calibration des seuils T1, T4 et D-ATT-01 — aucune autre modification.
**Aucune implémentation immédiate.**
**Aucune modification moteur.**
**Aucun nouveau corpus d'indicateurs.**

Ce document est un pont entre la conception théorique de l'architecture V2 et sa
validation en conditions réelles. Les tableaux de calibration sont vides — ils le
resteront jusqu'à la clôture du test réel V0.

La calibration ne répondra pas à toutes les questions ouvertes de l'architecture V2.
Elle répondra uniquement aux questions dont la réponse dépend de données empiriques
non disponibles au stade de la conception. Les dettes D-COH-02 à 04, D-HIE-02 à 04,
D-EXP-01 à 04 et D-ATT-02 à 05 suivent leurs propres chemins de résolution, documentés
dans leurs composants respectifs.

**Conditions de clôture de ce chantier :**
1. Test réel V0 complété (20–30 opérateurs, 2–4 semaines).
2. Tableaux de calibration remplis avec données observées.
3. Seuils X/Y T1, X/Y T4 et N D-ATT-01 validés selon les critères du § Critères de validation.
4. Hypothèses provisoires remplacées par des valeurs terrain dans les documents architecturaux concernés.
5. Dettes D-COH-01, D-HIE-01 et D-ATT-01 marquées comme closes.
