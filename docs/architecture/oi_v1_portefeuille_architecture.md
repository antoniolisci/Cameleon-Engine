# Operator Intelligence V1 — Architecture d'implémentation : Dimension Portefeuille

**Sous-titre :** Architecture de Portefeuille · Ancré / Explorateur / Opportuniste

**Statut :** Document d'architecture · Validé · EN ATTENTE implémentation  
**Date :** 2026-06-20  
**Scope :** Dimension Portefeuille uniquement — aucune autre dimension touchée  
**Prérequis lus :** `docs/doctrine/operator_intelligence_v1.md` · `docs/architecture/oi_v1_capital_architecture.md` · `docs/architecture/oi_v1_cadence_architecture.md`

---

## 1. Contexte et décision d'architecture

### Ce que cette dimension mesure

**Question centrale :** *Quelle relation l'opérateur entretient-il avec ses actifs dans la durée ?*

**Mission :** Décrire comment l'opérateur structure sa relation aux actifs dans la durée.

En cohérence avec les deux dimensions validées :

| Dimension | Mission |
|---|---|
| Capital | Décrire comment l'opérateur répartit son activité entre les actifs. |
| Cadence | Décrire comment l'opérateur répartit son activité dans le temps. |
| **Portefeuille** | **Décrire comment l'opérateur structure sa relation aux actifs dans la durée.** |

### Ce que cette dimension ne mesure pas

- Aucune classification sectorielle (IA, RWA, DePIN, L1, etc.)
- Aucune table externe symbole→secteur
- Aucune taxonomie de marché
- Aucune analyse d'image ou Vision IA
- Aucune inférence d'intention, de stratégie ou de qualité de décision

La dimension est entièrement calculée depuis les données Order History FILLED, sans dépendance externe.

### Propriété humaine mesurée

La dimension mesure la **structure relationnelle de l'opérateur avec ses instruments financiers dans le temps**. Le pattern comportemental face aux actifs — revenir ou ne pas revenir — est une propriété de l'opérateur. Il transcende les instruments spécifiques : un opérateur qui retourne systématiquement sur les mêmes actifs en 2026 avait, avec forte probabilité, le même comportement en 2022 sur d'autres actifs.

Cette propriété reste mesurable et comparable dans le temps indépendamment de l'évolution des narratifs de marché.

---

## 2. Définitions opérationnelles

### Ancré

L'activité Order History est organisée autour d'un **noyau stable d'actifs récurrents** qui reviennent de période en période et concentrent une part significative des ordres exécutés.

> Ce que cela décrit : certains symboles reviennent de manière répétée d'une période à l'autre. Leur présence n'est pas sporadique — ils constituent une structure récurrente dans l'activité de l'opérateur.

### Explorateur

L'activité Order History présente un **taux élevé de renouvellement des actifs**. Peu ou aucun symbole revient régulièrement d'une période à l'autre. L'univers de trading se renouvelle constamment, avec une proportion significative de symboles jamais vus auparavant dans chaque nouvelle période.

> Ce que cela décrit : la majorité des actifs traités dans une période donnée n'ont pas été présents dans les périodes précédentes. L'opérateur étend continuellement son univers de symboles traités.

### Opportuniste

L'activité ne présente **ni noyau stable suffisamment marqué, ni renouvellement systématique des actifs**. La structure est intermédiaire : certains actifs reviennent, d'autres sont nouveaux, sans que l'un ou l'autre signal soit dominant.

> Ce que cela décrit : la zone entre Ancré et Explorateur. Aucun pattern de loyauté ou d'exploration n'est assez fort pour être classifié. Comparable à l'état Irrégulier de la Dimension Cadence : un constat d'absence de signal net, pas un jugement.

### Indisponible

Les données Order History sont insuffisantes pour produire une classification fiable. Trois motifs distincts (voir §6).

**Comportement UI :** Silence structurel — aucun bloc affiché. Conforme au pattern Capital V1 et Cadence V1.

---

## 3. Séparation avec Capital et Cadence

### Séparation avec Capital

Capital mesure la concentration de l'activité **à un instant t** (CR3, HHI) et le taux de rotation mensuel (rotation_score Jaccard entre périodes consécutives). C'est une lecture cross-sectionnelle.

Portefeuille mesure la **récurrence des mêmes actifs sur plusieurs périodes**. C'est une lecture longitudinale.

La distinction est précise. Quatre combinaisons existent et sont toutes réelles :

| Capital | Portefeuille | Ce que la combinaison révèle |
|---|---|---|
| Concentré | Ancré | Peu d'actifs à tout instant, toujours les mêmes |
| Concentré | Explorateur | Peu d'actifs à la fois, mais différents à chaque période |
| Diversifié | Ancré | Beaucoup d'actifs au total, mais un noyau récurrent stable |
| Diversifié | Explorateur | Beaucoup d'actifs, continuellement renouvelés |

Capital ne peut pas distinguer ces quatre cas. Portefeuille les discrimine.

**Note sur rotation_score (Capital) :** Le rotation_score Jaccard mesure le chevauchement entre les symboles actifs de deux périodes consécutives. Portefeuille mesure la récurrence d'un symbole sur l'ensemble de la période analysée, pas seulement entre deux périodes adjacentes. Un opérateur peut avoir un rotation_score élevé (symboles différents chaque mois) mais être Ancré (il revient toujours sur les mêmes 3 actifs sur 18 mois). Capital ne voit pas ce retour à long terme.

### Séparation avec Cadence

Cadence mesure *quand* l'opérateur est actif — la distribution temporelle de l'activité. Portefeuille mesure *avec quels actifs* — l'identité des symboles à travers les périodes actives.

Les deux dimensions sont orthogonales par construction. Un opérateur Continue peut être Ancré ou Explorateur. Un opérateur Burst peut l'être aussi. La dimension temporelle et la dimension relationnelle sont indépendantes.

---

## 4. Données d'entrée

### Source

Order History Binance, filtré FILLED-ONLY, normalisé par `binance_order.js` vers le format canonique.

### Champs utilisés

| Champ canonique | Type | Usage pour Portefeuille |
|---|---|---|
| `symbol` | String (normalisé, ex. "TAO") | Identité de chaque actif — clé de classification |
| `timestamp` | Number (ms UTC) | Construction des périodes mensuelles |
| `quote_value` | Number (USDT) | Pondération des ordres (priorité) |

### Champs non utilisés

| Champ | Raison |
|---|---|
| `side` | Irrelevant — la récurrence se mesure sur l'actif, pas le sens de l'ordre |
| `price` | Irrelevant |
| `quantity` | Non utilisé (quote_value en priorité, order_count en fallback) |
| `type` (LIMIT/MARKET) | Appartient à la Dimension Exécution |

### Pondération

Même règle que Capital V1 : si ≥ 50% des ordres FILLED ont une `quote_value` non nulle, pondération par `quote_value`. Sinon, chaque ordre compte pour 1 (`order_count = 1`). La `quantity` n'est jamais utilisée comme pondération.

### Absence de dépendance externe

Aucune table de classification. Aucun mapping symbole→secteur. Aucune donnée de marché externe. Tout est calculé depuis l'Order History uniquement.

---

## 5. Concept de période active

**Définition :** Une période active est un **mois calendaire** (format `YYYY-MM`) contenant au moins un ordre FILLED.

Les mois sans aucun ordre FILLED sont exclus des calculs. Cela assure que la dimension mesure "parmi les périodes où l'opérateur a été actif, combien de fois revient-il sur le même actif ?" — indépendamment des phases d'inactivité capturées par la Dimension Cadence.

```
periodes_actives = liste triée des mois YYYY-MM distincts présents dans les timestamps
nb_mois_actifs   = |periodes_actives|
```

**Exemple :** un opérateur actif en janv, fév, puis absent mars-juin, puis actif juil-sept → 5 périodes actives, pas 9.

---

## 6. Métriques calculées

### M1 — Présence par période de chaque symbole (`periode_presence`)

Pour chaque symbole S distinct dans les ordres FILLED :

```
mois_avec_S       = {mois m ∈ periodes_actives | S apparaît dans au moins 1 ordre de m}
periode_presence(S) = |mois_avec_S| / nb_mois_actifs
```

Interprétation :
- `periode_presence(S)` = 1.0 → S est présent dans toutes les périodes actives
- `periode_presence(S)` = 0.25 → S n'apparaît que dans 1 période sur 4

Cette métrique est la base du noyau (M3) et du taux de récurrence moyen (M2).

---

### M2 — Taux de récurrence moyen (`recurrence_rate`)

```
recurrence_rate = mean(periode_presence(S)) pour tous les symboles S distincts
```

Interprétation :
- `recurrence_rate` élevé → les symboles reviennent souvent → signal Ancré
- `recurrence_rate` faible → les symboles n'apparaissent qu'une ou deux fois → signal Explorateur

**Note :** Cette métrique est une moyenne sur tous les symboles. Un opérateur avec 50 symboles dont 2 reviennent souvent et 48 n'apparaissent qu'une fois aura un `recurrence_rate` faible malgré quelques actifs récurrents — c'est correct et cohérent avec M3/M4 qui capturent le poids de ces récurrents.

---

### M3 — Noyau et taille du noyau (`noyau_symbols`, `taille_noyau`)

```
RECURRENCE_NOYAU_SEUIL = 0.50  (seuil provisoire V1)

noyau_symbols = { S | periode_presence(S) ≥ RECURRENCE_NOYAU_SEUIL }
taille_noyau  = |noyau_symbols|
```

Un symbole appartient au noyau s'il est présent dans au moins la moitié des périodes actives.

Interprétation :
- `taille_noyau` = 0 → aucun actif récurrent stable → signal fort Explorateur
- `taille_noyau` ≥ 2 → au moins deux actifs forment un noyau stable → condition nécessaire pour Ancré

**Usage de `noyau_symbols` :** Tableau de noms de symboles utilisé pour la génération de la note de restitution (ex. "TAO · ETH · FET"). Non affiché brut dans l'UI V1.

---

### M4 — Part d'activité portée par le noyau (`noyau_weight`)

```
poids_total  = Σ poids(tous les ordres FILLED)
poids_noyau  = Σ poids(ordres dont symbol ∈ noyau_symbols)
noyau_weight = poids_noyau / poids_total
```

Interprétation :
- `noyau_weight` = 0.80 → le noyau porte 80% de l'activité → noyau dominant
- `noyau_weight` = 0.15 → le noyau est présent mais marginal → noyau symbolique, non structurant

Cette métrique distingue un noyau réel (dominant) d'un artefact statistique (quelques retours anecdotiques sur des actifs secondaires).

**Garde importante :** `taille_noyau` élevée + `noyau_weight` faible ne suffit pas pour classer Ancré. Les deux conditions sont requises conjointement (voir §7).

---

### M5 — Taux d'exploration (`exploration_rate`)

Pour chaque période active Pk à partir de la deuxième (P2..Pmax) :

```
univers_anterieur(Pk) = union de tous les symboles des périodes P1 à P(k-1)
symboles_Pk           = ensemble des symboles dans Pk
nouveaux_Pk           = symboles_Pk \ univers_anterieur(Pk)
taux_nouveaux(Pk)     = |nouveaux_Pk| / |symboles_Pk|
```

```
exploration_rate = mean(taux_nouveaux(Pk)) pour k = 2 à nb_mois_actifs
```

La première période est exclue : par définition, tous ses symboles sont "nouveaux" car aucune période précédente n'existe.

Interprétation :
- `exploration_rate` = 0.50 → en moyenne, 50% des symboles de chaque période sont de nouveaux symboles jamais vus avant
- `exploration_rate` = 0.05 → l'opérateur trade principalement des symboles déjà vus dans les périodes précédentes

**Note sur le choix "univers cumulatif" :** La comparaison se fait contre l'ensemble cumulatif de tous les symboles des périodes précédentes (pas seulement la période précédente). Cela mesure si l'opérateur introduit des symboles genuinement nouveaux dans son univers de trading — pas des symboles déjà connus réintroduits après une absence.

---

### M6 — Taille de l'univers total (`universe_size`)

```
universe_size = |union de tous les symboles distincts sur toute la période|
```

Métrique contextuelle. Non utilisée dans la classification. Utilisée dans la note de restitution ("L'activité couvre X actifs distincts sur Y périodes actives").

---

## 7. Métriques rejetées ou différées

| Métrique | Statut | Raison |
|---|---|---|
| `noyau_stability` | Différé V2 | Requiert de scinder l'historique en deux moitiés — nécessite ≥ 6 mois actifs — trop restrictif pour V1 |
| `mean_lifespan_days` | Différé V2 | Métrique bruyante — fortement biaisée par les outliers — nécessite calibration terrain avant usage |
| `return_rate` (retour après absence) | Différé V2 | Requiert détection de "disparition + réapparition" par symbole — complexité élevée — sens réel à partir de ≥ 3 mois de présence par symbole |
| `satellite_rate` | Supprimé | Dérivé exact de `noyau_weight` (= 1 − noyau_weight) — non indépendant |
| Classification sectorielle (IA, RWA, etc.) | Écarté | Propriété de marché, pas de l'opérateur — instable dans le temps — voir §1 |

---

## 8. Arbre de décision et seuils V1

### Pré-calcul

```
1. Construire periodes_actives et nb_mois_actifs
2. Calculer periode_presence(S) pour chaque symbole S
3. Calculer noyau_symbols, taille_noyau
4. Calculer noyau_weight
5. Calculer recurrence_rate
6. Calculer exploration_rate (périodes P2..Pmax)
7. Calculer universe_size
```

### Arbre de classification

```
GARDE 1 — Données insuffisantes
  si nb_ordres_filled < MIN_ORDRES (20)
  → etat = "Indisponible", motif = "donnees_insuffisantes", STOP

GARDE 2 — Période insuffisante
  si nb_mois_actifs < MIN_MOIS_ACTIFS (2)
  → etat = "Indisponible", motif = "periode_insuffisante", STOP

GARDE 3 — Univers mono-actif
  si universe_size < 2
  → etat = "Indisponible", motif = "univers_insuffisant", STOP
  (cas mono-actif : récurrence triviale, non informative)

CLASSIFICATION

  si taille_noyau ≥ SEUIL_TAILLE_NOYAU (2)
  ET noyau_weight ≥ SEUIL_NOYAU_WEIGHT (0.60)
  → etat = "Ancré", ALLER À CONFIANCE

  sinon si exploration_rate ≥ SEUIL_EXPLORATION (0.40)
  ET taille_noyau ≤ SEUIL_NOYAU_MAX_EXPLORATEUR (1)
  → etat = "Explorateur", ALLER À CONFIANCE

  sinon
  → etat = "Opportuniste", ALLER À CONFIANCE
```

### Tableau des seuils provisoires V1

| Constante | Valeur V1 | Rôle |
|---|---|---|
| `MIN_ORDRES` | 20 | Seuil minimum volume — cohérent avec Capital et Cadence |
| `MIN_MOIS_ACTIFS` | 2 | Seuil minimum périodes — nécessaire pour mesurer la récurrence |
| `RECURRENCE_NOYAU_SEUIL` | 0.50 | Part minimale de périodes actives pour appartenir au noyau |
| `SEUIL_TAILLE_NOYAU` | 2 | Nombre minimum de symboles dans le noyau pour Ancré |
| `SEUIL_NOYAU_WEIGHT` | 0.60 | Part minimale d'activité portée par le noyau pour Ancré |
| `SEUIL_EXPLORATION` | 0.40 | Taux minimum de nouveaux symboles par période pour Explorateur |
| `SEUIL_NOYAU_MAX_EXPLORATEUR` | 1 | Nombre maximum de symboles noyau compatible avec Explorateur |

**Ces seuils sont provisoires V1. Ils devront être calibrés sur corpus réel (≥ 5 profils Order History distincts).**

---

## 9. Niveau de confiance

```
Élevé  : nb_mois_actifs ≥ 6
Moyen  : nb_mois_actifs ∈ [3, 5]
Faible : nb_mois_actifs = 2
```

La confiance est absente du JSON si `etat === "Indisponible"`.

**Justification :** La robustesse de la classification dépend directement du nombre de périodes comparables. Avec 2 périodes seulement, le signal est statistiquement fragile. Avec 6+ périodes, les patterns de récurrence et d'exploration sont stables.

---

## 10. Format JSON de sortie

```json
{
  "dimension": "Portefeuille",
  "etat": "Ancré",
  "confiance": "Élevé",
  "note": "L'activité Order History couvre 11 actifs distincts sur 8 périodes actives. TAO · ETH · FET sont présents dans au moins 6 de ces 8 périodes et concentrent 74% des ordres exécutés. Structure de portefeuille : Ancré (confiance : Élevé).",
  "metriques": {
    "taille_noyau": 3,
    "noyau_weight": 0.74,
    "recurrence_rate": 0.68,
    "exploration_rate": 0.14,
    "universe_size": 11,
    "nb_mois_actifs": 8,
    "nb_ordres_filled": 385,
    "noyau_symbols": ["TAO", "ETH", "FET"]
  }
}
```

### Spécifications

| Clé | Type | Présence |
|---|---|---|
| `dimension` | String | Toujours — valeur fixe `"Portefeuille"` |
| `etat` | String | Toujours |
| `confiance` | String | Absent si `etat === "Indisponible"` |
| `note` | String | Toujours — vide si `etat === "Indisponible"` (silence UI) |
| `metriques.taille_noyau` | Number | Présent sauf Indisponible |
| `metriques.noyau_weight` | Number | Présent sauf Indisponible |
| `metriques.recurrence_rate` | Number | Présent sauf Indisponible |
| `metriques.exploration_rate` | Number | Présent sauf Indisponible (null si nb_mois_actifs < 2) |
| `metriques.universe_size` | Number | Toujours présent |
| `metriques.nb_mois_actifs` | Number | Toujours présent |
| `metriques.nb_ordres_filled` | Number | Toujours présent |
| `metriques.noyau_symbols` | Array\<String\> | Présent sauf Indisponible — tableau vide si taille_noyau = 0 |

**`noyau_symbols` :** Tableau de noms de symboles normalisés. Usage interne — génération de la note de restitution. Non affiché brut dans l'UI V1.

---

## 11. Notes de restitution (E1–E5)

Les notes respectent les 5 lois doctrinales : faits observables uniquement, aucune inférence d'intention, aucun jugement de qualité, aucune prescription, ton factuel neutre.

### Ancré

> « L'activité Order History couvre [universe_size] actifs distincts sur [nb_mois_actifs] périodes actives. [noyau_symbols joints par " · "] sont présents dans au moins la moitié de ces périodes et concentrent [noyau_weight × 100]% des ordres exécutés. Structure de portefeuille : Ancré (confiance : [confiance]). »

### Explorateur

> « L'activité Order History couvre [universe_size] actifs distincts sur [nb_mois_actifs] périodes actives. En moyenne, [exploration_rate × 100]% des actifs traités dans chaque période sont des actifs non présents dans les périodes précédentes. Aucun noyau stable d'actifs récurrents n'est identifié. Structure de portefeuille : Explorateur (confiance : [confiance]). »

### Opportuniste

> « L'activité Order History couvre [universe_size] actifs distincts sur [nb_mois_actifs] périodes actives. La distribution entre actifs récurrents et actifs nouveaux ne présente pas de structure dominante nette. Structure de portefeuille : Opportuniste (confiance : [confiance]). »

### Indisponible

Silence structurel — aucun bloc affiché.

*(Note interne — motif `"periode_insuffisante"` : la période couverte est insuffisante pour mesurer la récurrence. Motif `"univers_insuffisant"` : un seul actif distinct est présent — la récurrence est triviale et non informative.)*

### Règles de style obligatoires

- Jamais de jugement implicite ("riche", "risqué", "prudent", "impulsif", "bon")
- Jamais d'inférence d'intention ("vous cherchez", "vous préférez", "vous évitez", "vous construisez")
- Jamais de prescription ("il serait souhaitable de")
- Toujours : faits observés, chiffres, structure descriptive

---

## 12. Cas limites

| Cas | Comportement attendu |
|---|---|
| 1 seul actif sur toute la période | GARDE 3 → Indisponible · motif : `"univers_insuffisant"` |
| 2 périodes actives seulement | Classification possible · confiance = Faible |
| Noyau taille 1, noyau_weight = 0.90 | `SEUIL_TAILLE_NOYAU` non atteint (< 2) → ne déclenche pas Ancré → Opportuniste ou Explorateur selon exploration_rate |
| Tous les symboles apparaissent une seule fois | recurrence_rate → 1/nb_mois_actifs · taille_noyau = 0 → Explorateur si exploration_rate ≥ 0.40 |
| Opérateur absent 4 mois (Cadence=Burst ou Irrégulier) | Les 4 mois inactifs sont exclus de nb_mois_actifs — les périodes actives restent comparées entre elles |
| Opérateur avec 1 période active seulement | GARDE 2 → Indisponible · motif : `"periode_insuffisante"` (exploration_rate non calculable) |
| exploration_rate calculé sur 1 seule période (nb_mois_actifs = 2) | Valeur possible mais confiance = Faible |
| quote_value absent sur tous les ordres | Bascule sur order_count = 1 — la classification reste possible |

---

## 13. Compatibilité Mémoire V2

Cette dimension est la plus naturellement longitudinale des trois. Sa valeur croît mécaniquement avec le temps disponible et les données accumulées.

**Évolution du noyau :** Le suivi de `noyau_symbols` sur plusieurs sessions permet d'observer si le noyau se stabilise, évolue, ou se renouvelle. Exemple de lecture V2 : "Votre noyau s'est modifié : ETH et BTC constituaient votre noyau en 2024. TAO les a rejoints en 2025. BTC a disparu du noyau depuis 4 périodes."

**Détection de transitions :** Le passage Explorateur → Ancré est un signal comportemental observable. Un opérateur en phase d'exploration intense qui développe progressivement un noyau stable peut le voir daté et tracé.

**`noyau_stability` (différée V2) :** Avec suffisamment d'historique (≥ 6 mois actifs), il devient possible de mesurer si le noyau de la première moitié de la période est le même que celui de la seconde moitié.

**`return_rate` (différée V2) :** La détection de symboles disparus puis réapparus ouvre une lecture de "retour de conviction" — pertinente en V2 pour la mémoire comportementale.

**Empreinte tridimensionnelle stable :** Capital + Cadence + Portefeuille ensemble forment une signature comportementale comparable dans le temps. Contrairement à une classification sectorielle (qui évolue avec les narratifs de marché), l'Architecture de Portefeuille produit des observations cumulables sur toute la durée de vie de l'opérateur.

---

## 14. Compatibilité Capital et Cadence — Combinaisons

### Concentré + Continue + Ancré

Capital=Concentré : peu de symboles dominent l'activité à chaque instant.  
Cadence=Continue : présence régulière, active la plupart des jours.  
Portefeuille=Ancré : les mêmes actifs reviennent de période en période.

**Lecture :** Un opérateur avec un univers délibérément étroit, géré de façon régulière, sur des instruments stables. La cohérence est triple — concentration, rythme, et identité des actifs.

---

### Diversifié + Irrégulier + Explorateur

Capital=Diversifié : nombreux symboles, distribution équilibrée.  
Cadence=Irrégulier : aucun signal temporel net.  
Portefeuille=Explorateur : les actifs se renouvellent constamment.

**Lecture :** Aucun axe ne présente de structure répétée — ni concentration, ni régularité, ni fidélité aux instruments. L'activité ne construit pas de patterns stables observables sur les trois dimensions.

---

### Rotatif + Burst + Opportuniste

Capital=Rotatif : les symboles dominants changent d'une période à l'autre.  
Cadence=Burst : activité concentrée en épisodes intenses.  
Portefeuille=Opportuniste : ni noyau stable, ni exploration systématique.

**Lecture :** Activité épisodique avec rotation des actifs, sans structure de loyauté nette mais sans renouvellement radical non plus. Trois dimensions sans ancrage structurant.

---

### Concentré + Burst + Explorateur

Capital=Concentré : peu d'actifs dominent à chaque instant.  
Cadence=Burst : épisodes d'activité intenses.  
Portefeuille=Explorateur : les actifs se renouvellent à chaque épisode.

**Lecture :** Concentration intense sur quelques actifs — mais des actifs différents à chaque épisode. Zéro loyauté aux instruments malgré une concentration élevée à l'instant t. Cette combinaison illustre la valeur de Portefeuille : Capital seul ne distingue pas un "Concentré fidèle" (Ancré) d'un "Concentré mobile" (Explorateur).

---

## 15. Risques

### Risques statistiques

**R1 — Indisponible fréquent sur historiques courts** *(critique)*  
La dimension requiert minimum 2 périodes actives. Les opérateurs avec moins de 2 mois d'Order History FILLED ne seront pas classés. C'est une limite statistique réelle, non contournable. Mitigation : règle Indisponible explicite avec motif.

**R2 — Biais de première période dans exploration_rate** *(modéré)*  
La première période est exclue du calcul (tout est "nouveau" par définition). Si nb_mois_actifs = 2, exploration_rate repose sur une seule observation — peu robuste. Mitigation : confiance = Faible si nb_mois_actifs = 2.

**R3 — Seuil noyau 50% : signification variable selon la durée** *(modéré)*  
Avec 2 périodes actives, un symbole doit apparaître dans les 2 pour être dans le noyau (seuil strict). Avec 10 périodes, il peut manquer 5 apparitions. La robustesse du noyau croît avec nb_mois_actifs. Mitigation : confiance calibrée sur la durée.

### Risques cognitifs

**R4 — "Opportuniste" perçu comme jugement négatif** *(modéré)*  
L'état Opportuniste peut être lu comme "sans conviction" ou "improvisant". La restitution E1–E5 doit être strictement factuelle. Si le terrain confirme la confusion systématique, label alternatif à évaluer : "Mixte" ou "Variable".

**R5 — "Ancré" perçu comme validation positive** *(modéré)*  
L'état Ancré peut être interprété comme confirmant une bonne stratégie. La restitution ne doit porter aucune valorisation implicite.

### Risques UX

**R6 — Troisième bloc dans buildOrderAnalysis** *(faible)*  
Le panneau Order History affichera Capital + Cadence + Portefeuille. La lisibilité doit être vérifiée en test terrain. Aucune modification de design prévue en V1 — le pattern de bloc existant est suffisant.

**R7 — noyau_symbols affiché accidentellement** *(faible)*  
Le tableau `noyau_symbols` est dans le JSON pour la génération de note. Il ne doit pas être affiché brut dans l'UI V1. La note textuelle suffit.

### Risques de sur-ingénierie

**R8 — Ajout prématuré des métriques différées V2** *(faible)*  
`return_rate` et `noyau_stability` sont différées à juste titre. Les ajouter en V1 sans calibration terrain crée de la complexité sans valeur validée.

**R9 — Modification des seuils avant terrain** *(faible)*  
Les seuils provisoires ne doivent pas être affinés avant calibration sur corpus réel. Résister à l'optimisation a priori.

---

## 16. Valeur produit

**Note : A — Dimension majeure**

### Justification

**Révélation non triviale.** L'opérateur ne perçoit pas consciemment ses propres patterns de récurrence. "Vous revenez sur les mêmes 3 actifs dans 75% de vos périodes actives" est une information que les données seules rendent visible. Ce n'est pas une reformulation de ce que l'opérateur sait déjà.

**Orthogonalité complète.** Les quatre combinaisons Capital × Portefeuille (Concentré+Ancré, Concentré+Explorateur, Diversifié+Ancré, Diversifié+Explorateur) sont toutes réelles et distinctes. Aucune n'est réductible à une autre dimension.

**Stabilité temporelle maximale.** La dimension reste valide, comparable, et cumulable dans le temps indépendamment des narratifs de marché, des secteurs, et des actifs spécifiques.

**Zéro dépendance externe.** Aucune table à maintenir, aucune taxonomie à réviser. Entièrement calculable depuis l'Order History.

**Mission directe.** Devenir l'auteur de ses décisions suppose une conscience de ses patterns. Architecture révèle un pattern comportemental que l'opérateur ne voit pas sans outil.

**Potentiel V2 élevé.** Seule dimension qui supporte naturellement le tracking longitudinal, la détection de transitions comportementales, et la mémoire de l'évolution de l'opérateur.

**Limite honnête.** La dimension est Indisponible pour les historiques courts (< 2 mois actifs). Pour un opérateur débutant ou avec peu de données, la valeur est nulle. C'est une limite statistique irréductible, pas une limite de conception.

---

## 17. Recommandation finale et ordre de construction OI V1

Architecture de Portefeuille est la troisième dimension d'Operator Intelligence V1 pour les raisons suivantes :

1. Elle mesure une propriété humaine stable, non une propriété de marché.
2. Elle est orthogonale à Capital et Cadence.
3. Elle est entièrement calculable depuis FILLED Order History sans dépendance externe.
4. Elle révèle quelque chose de non-trivial que l'opérateur ne peut pas percevoir sans outil.

Les alternatives sérieusement évaluées :

- **Exécution** (Patiente / Réactive / Mixte) : dimension plus puissante sur le plan conceptuel, mais requiert les ordres non exécutés (CANCELLED, EXPIRED, PENDING) pour être fiable. Non viable depuis FILLED seul. Mérite d'être la quatrième dimension après décision sur le pipeline ALL-STATUS.
- **Dimensionnement des positions** : observable, mais orthogonalité partielle avec Capital et valeur cognitive inférieure.
- **Horizon temporel par actif** : fortement corrélé avec Portefeuille — largement redondant.

**Ordre de construction OI V1 recommandé :**

| Ordre | Dimension | Données requises | Statut |
|---|---|---|---|
| 1 | Capital | FILLED | ✅ Livré · Déployé · Validé terrain |
| 2 | Cadence | FILLED | ✅ Livré · Déployé · Validé terrain (partiel) |
| 3 | **Portefeuille** | **FILLED** | **→ Prochaine** |
| 4 | Exécution | ALL-STATUS | Attend décision pipeline |

---

## 18. Périmètre strict d'implémentation future

**Module futur :** `src/js/behavior/analytics/oi-portefeuille.js`  
**Export futur :** `computePortefeuille(trades)`  
**Philosophie :** Module pur — aucun effet de bord, aucune dépendance DOM, aucun import de modules UI.

**Pattern identique Capital V1 et Cadence V1 :**
- Entrée : tableau de trades normalisés (FILLED uniquement)
- Sortie : objet JSON structuré (voir §10)
- Silence structurel si `etat === "Indisponible"` (aucun bloc UI affiché)
- Branchement UI : `uploader.js` + `behavior-view.js` (session ultérieure)
- `portefeuilleResult` : null dans toutes les branches non-Order-History

**Ce qui ne doit pas entrer dans `oi-portefeuille.js` :**
- Aucune classification sectorielle
- Aucune table externe
- Aucun appel réseau
- Aucun accès au DOM
- Aucun import depuis d'autres modules OI (Capital, Cadence)
- Aucune IA ou Vision
