# Operator Intelligence V1 — Architecture d'implémentation : Dimension Cadence

**Statut :** Document d'architecture · Validé · EN ATTENTE implémentation
**Date :** 2026-06-20
**Scope :** Dimension Cadence uniquement — aucune autre dimension touchée
**Prérequis lus :** `docs/doctrine/operator_intelligence_v1.md` · `docs/architecture/oi_v1_capital_architecture.md`
**Décisions opérateur :** Q1 cycle hebdomadaire uniquement · Q2 version simple (break signalé, non segmenté)

---

## 1. Définitions opérationnelles

**Question centrale :** *Quand l'opérateur est-il actif ?*

La Dimension Cadence mesure la **structure temporelle de l'activité d'ordre** sur la période analysée. Ce n'est pas le volume traité, ni la qualité des décisions — c'est le patron de présence dans le temps.

### Continue

L'activité est distribuée de façon homogène sur la période. L'opérateur est présent régulièrement, sans concentration extrême sur certaines fenêtres. Les silences entre sessions actives sont courts et réguliers.

> Ce que cela décrit : un opérateur dont la présence est stable dans le temps, indépendamment du volume traité.

### Burst

L'activité est très concentrée sur des fenêtres courtes séparées par de longs silences. Peu de jours actifs, mais très denses. Le timing des pics est irrégulier.

> Ce que cela décrit : un opérateur qui trade intensément sur de courtes fenêtres puis disparaît — quelle qu'en soit la raison.

### Périodique

L'activité suit un rythme calendaire détectable. V1 détecte uniquement le cycle hebdomadaire : certains jours de la semaine concentrent systématiquement plus d'activité que les autres. La régularité distingue ce cas du Burst.

> Ce que cela décrit : un opérateur dont l'activité suit un rythme structuré dans la semaine — observable sur la durée.

**Distinction Burst vs Périodique :**
- Burst = concentration intense + timing aléatoire des pics
- Périodique = concentration modérée + timing régulier (même(s) jour(s) de la semaine)
- Un Périodique peut ressembler à un Burst sur une courte période → la détection requiert ≥ 3 mois et ≥ 10 jours actifs

---

## 2. Données d'entrée

### Source

Order History Binance, filtré FILLED-ONLY, normalisé par `binance_order.js` vers le format canonique.

### Champs utilisés

| Champ canonique | Type | Usage pour Cadence |
|---|---|---|
| `timestamp` | Number (ms UTC) | Distribution temporelle — seul champ utilisé |

### Champs non utilisés

Tous les autres champs (`symbol`, `quote_value`, `quantity`, `side`, `price`) sont ignorés par `oi-cadence.js`. La Dimension Cadence est temporelle uniquement.

### Unité de temps

V1 raisonne en **jours calendaires UTC**. Un jour = minuit UTC à minuit UTC suivant. Tous les timestamps sont convertis en date UTC (`YYYY-MM-DD`) avant tout calcul.

---

## 3. Métriques calculées

### M1 — Taux de jours actifs (`active_day_rate`)

```
jours_actifs    = ensemble des dates UTC avec au moins 1 ordre
nb_jours_periode = (date_dernier_ordre - date_premier_ordre) en jours calendaires + 1

active_day_rate = nb_jours_actifs / nb_jours_periode
```

Interprétation :
- `active_day_rate` ≥ 0.50 → présent ≥ 50% des jours → Continue probable
- `active_day_rate` ≤ 0.20 → présent ≤ 20% des jours → Burst ou Périodique
- Zone intermédiaire : Périodique ou Burst selon les autres métriques

**Note :** `nb_jours_periode` est calculé sur l'étendue totale du dataset (du premier au dernier ordre), pas sur des jours de marché.

---

### M2 — Ratio de concentration Burst (`burst_ratio`)

Mesure quelle proportion des ordres totaux est concentrée dans les 20% de jours les plus denses.

```
jours_actifs triés par nb_ordres décroissant
top_20pct   = max(1, ceil(nb_jours_actifs × 0.20))
burst_ratio = Σ ordres_des_top_20pct_jours / ordres_totaux
```

Interprétation :
- `burst_ratio` ≥ 0.80 → 80% des ordres sur 20% des jours → Burst fort
- `burst_ratio` ≤ 0.55 → distribution homogène → Continue probable
- Zone intermédiaire : signal insuffisant seul — croiser avec M1 et M3

**Garde :** si `nb_jours_actifs` < 5, `top_20pct` = 1 seul jour → ne pas conclure Burst sur une seule observation → Indisponible dans ce cas.

---

### M3 — Intervalles entre jours actifs (`median_gap`, `variance_gap`)

```
gaps         = liste des (date_actif[i+1] - date_actif[i]) en jours, pour i = 0..n-2
median_gap   = médiane(gaps)
variance_gap = variance(gaps)
```

Interprétation combinée :
- `median_gap` ≤ 2 jours → présence quasi-quotidienne → Continue renforcé
- `median_gap` > 7 jours ET `variance_gap` élevée → silences longs et irréguliers → Burst
- `median_gap` > 7 jours ET `variance_gap` faible → silences longs mais réguliers → Périodique

`variance_gap` est le discriminant principal entre Burst et Périodique quand `median_gap` est élevé.

---

### M4 — Score de périodicité hebdomadaire (`periodicity_score`)

**Décision Q1 validée :** V1 détecte uniquement le cycle hebdomadaire (lundi→dimanche). Le cycle mensuel est exclu de V1.

```
pour chaque jour de la semaine d ∈ {0=lundi, …, 6=dimanche} :
  n_observé[d] = nb d'ordres posés ce jour-là sur la période totale

n_attendu = ordres_totaux / 7  (distribution uniforme)

periodicity_score = Σ_d ((n_observé[d] - n_attendu)² / n_attendu)
```

Il s'agit d'un chi2 à 6 degrés de liberté (7 jours − 1).

Interprétation :
- `periodicity_score` > 12 → non-uniformité significative → signal Périodique
- `periodicity_score` ≤ 12 → distribution homogène sur la semaine → pas de rythme hebdomadaire détectable

Seuil indicatif V1 : chi2(6, α=0.05) ≈ 12.6. À calibrer sur corpus.

**Condition de validité :** le chi2 n'est fiable que si `n_attendu` ≥ 5 par case (soit ≥ 35 ordres totaux sur ≥ 3 mois). En dessous, `periodicity_score` est calculé mais non utilisé pour la classification.

---

### M5 — Coefficient de variation journalier (`cv_daily`)

```
mean_daily = ordres_totaux / nb_jours_actifs
std_daily  = écart-type du nombre d'ordres par jour actif
cv_daily   = std_daily / mean_daily
```

Rôle : signal de vérification secondaire pour Continue.

- `cv_daily` < 0.5 → jours actifs homogènes en densité → Continue renforcé
- `cv_daily` > 1.5 → jours actifs très hétérogènes en densité → Burst renforcé

---

## 4. Arbre de décision et seuils V1

### Arbre principal

```
ÉTAPE 1 — Vérification des seuils minimums
  si mois_couverts < 3
  OU ordres_filled < 20
  OU nb_jours_actifs < 5 :
    → état = "Indisponible", confiance = "Indisponible", STOP

ÉTAPE 2 — Détection Continue
  si active_day_rate ≥ 0.50
  ET burst_ratio ≤ 0.55 :
    → état = "Continue", ALLER À ÉTAPE 5 (confiance)

ÉTAPE 3 — Détection Périodique
  si periodicity_score > 12
  ET ordres_totaux ≥ 35  (validité chi2)
  ET median_gap ≤ 14
  ET variance_gap ≤ median_gap :
    → état = "Périodique", ALLER À ÉTAPE 5 (confiance)

ÉTAPE 4 — Détection Burst (résidu et signal direct)
  si burst_ratio ≥ 0.70
  OU active_day_rate ≤ 0.20 :
    → état = "Burst", ALLER À ÉTAPE 5 (confiance)
  sinon :
    → zone ambiguë → état = "Burst" (présomption), confiance réduite de 1 niveau

ÉTAPE 5 — Niveau de confiance
  voir §5
```

### Tableau des seuils provisoires V1

| Seuil | Valeur V1 | Rôle |
|---|---|---|
| `active_day_rate` Continue | ≥ 0.50 | Signal primaire Continue |
| `burst_ratio` Continue | ≤ 0.55 | Confirmation Continue |
| `burst_ratio` Burst | ≥ 0.70 | Signal primaire Burst |
| `active_day_rate` Burst | ≤ 0.20 | Signal secondaire Burst |
| `periodicity_score` (chi2) | > 12 | Signal Périodique |
| `median_gap` Périodique max | ≤ 14 jours | Garde : silences pas trop longs |
| `variance_gap` Périodique | ≤ `median_gap` | Régularité des silences |
| Validité chi2 | ≥ 35 ordres | Condition d'usage du `periodicity_score` |
| `nb_jours_actifs` minimum | ≥ 5 | Seuil minimum calcul |
| `mois_couverts` minimum | ≥ 3 | Seuil minimum période |
| `ordres_filled` minimum | ≥ 20 | Seuil minimum volume |
| Seuil break long | > 45 jours | Signalement dans la note (décision Q2) |

> **Ces seuils sont provisoires.** À calibrer sur le corpus réel (REAL_001, REAL_003, REAL_004) lors de l'implémentation.

---

## 5. Niveau de confiance

```
confiance = "Élevé"
  si : mois_couverts ≥ 6
  ET  : nb_jours_actifs ≥ 30
  ET  : ordres_filled ≥ 100

confiance = "Moyen"
  si : (3 ≤ mois_couverts < 6)
  OU  : (10 ≤ nb_jours_actifs < 30)
  OU  : (50 ≤ ordres_filled < 100)
  (et pas déjà "Élevé")

confiance = "Faible"
  si : mois_couverts = 3 (seuil minimal)
  OU  : nb_jours_actifs < 10
  OU  : ordres_filled < 50

confiance = "Indisponible"
  si : mois_couverts < 3
  OU  : nb_jours_actifs < 5
  OU  : ordres_filled < 20
```

### Modificateur Périodique

Si l'état est "Périodique" mais que la période couvre < 6 semaines avec au moins 1 ordre chacune : réduire la confiance de 1 niveau. Le signal est présent mais repose sur trop peu de cycles pour être robuste.

### Modificateur zone ambiguë

Si l'état est "Burst" par présomption (zone ambiguë — ni les seuils Continue ni Burst directs ne sont atteints) : confiance réduite de 1 niveau, mention explicite dans la note.

---

## 6. Traitement des breaks longs (décision Q2)

**Décision Q2 validée :** V1 ne segmente pas automatiquement la période. Si un gap > 45 jours est détecté entre deux jours actifs consécutifs, il est signalé dans la note de restitution. Les métriques sont calculées sur la période totale sans modification.

```
max_gap = max(gaps)
si max_gap > 45 :
  → ajouter à la note : mention du break détecté + durée en jours
  → ne pas modifier les métriques ni la classification
  → ne pas réduire la confiance automatiquement
     (le break peut être intentionnel — le moteur ne le juge pas)
```

**Formulation note (exemple) :**

> *"Un arrêt d'activité de 67 jours a été détecté sur la période. Les métriques sont calculées sur l'ensemble de la période sans segmentation — la Dimension Cadence reflète la période totale importée."*

---

## 7. Format de sortie

### Structure JSON

```json
{
  "dimension": "Cadence",
  "etat": "Continue | Burst | Périodique | Indisponible",
  "confiance": "Élevé | Moyen | Faible | Indisponible",
  "metriques": {
    "active_day_rate": 0.34,
    "burst_ratio": 0.81,
    "median_gap": 4,
    "variance_gap": 9.2,
    "periodicity_score": 8.3,
    "cv_daily": 1.8,
    "nb_jours_actifs": 42,
    "nb_jours_periode": 124,
    "max_gap": 12
  },
  "periode": {
    "debut": "2024-11-01",
    "fin": "2025-03-05",
    "mois_couverts": 4,
    "ordres_filled": 385
  },
  "note": "Texte de restitution lisible"
}
```

### Champ `max_gap`

Toujours présent dans les métriques. Permet l'audit et déclenche la mention de break si > 45 jours.

---

## 8. Restitution textuelle

### Ce que le moteur pourra dire

Ces formulations respectent E1–E5 et L1–L6 :

> *"L'activité est présente sur 34% des jours de la période (42 jours actifs sur 124). La majorité des ordres (81%) se concentre sur les 9 jours les plus actifs — style Cadence : Burst (confiance : Moyen)."*

> *"L'activité est distribuée sur 78% des jours de la période. Aucune concentration extrême détectée — style Cadence : Continue (confiance : Élevé)."*

> *"L'activité présente une régularité hebdomadaire détectable : certains jours de la semaine concentrent significativement plus d'ordres que les autres (score : 18.4) — style Cadence : Périodique (confiance : Moyen)."*

> *"Un arrêt d'activité de 67 jours a été détecté sur la période. Les métriques sont calculées sur l'ensemble sans segmentation — style Cadence : Burst (confiance : Moyen)."*

> *"Période de 2 mois et 4 jours actifs — Dimension Cadence non calculable (données insuffisantes : confiance Indisponible)."*

### Ce que le moteur ne devra jamais dire

> ~~*"L'opérateur trade par impulsions."*~~ — viole E1 (explication causale)

> ~~*"Ce profil Burst indique une réactivité émotionnelle au marché."*~~ — viole E1 + E4

> ~~*"L'opérateur est très actif / peu actif."*~~ — viole E2 (jugement de volume)

> ~~*"Cette cadence continue témoigne d'une discipline remarquable."*~~ — viole E2

> ~~*"L'opérateur devrait régulariser son activité."*~~ — viole L5 (prescription)

> ~~*"Ce pattern Burst suggère que l'opérateur anticipe des opportunités ponctuelles."*~~ — viole E1 + E3

**Règle de test :** si la phrase peut être réfutée par l'opérateur en disant *"ce n'est pas ce que je ressens"* ou *"ce n'est pas ce que je fais"*, elle viole E1 ou E4.

---

## 9. Cas limites

### CL1 — Période trop courte (< 3 mois)

Indisponible obligatoire sous 3 mois — classification interdite. Un opérateur très actif sur 6 semaines peut sembler Continue sur cette fenêtre mais être Burst sur une période plus longue.

### CL2 — Tous les ordres sur un ou deux jours

`burst_ratio` → 1.0. Cas extrême de Burst trivial. Indisponible si `nb_jours_actifs` < 5.

### CL3 — Break long détecté (> 45 jours)

Signalé dans la note. Métriques non modifiées. Décision Q2 — voir §6.

### CL4 — Grid bot ou automation

Un bot générant 200 ordres en un jour est temporellement identique à un humain très actif ce jour-là. `oi-cadence.js` ne distingue pas. Signalement dans la note si `nb_ordres_max_jour > 50` : *"Certains jours présentent une densité d'ordres élevée (> 50 ordres). Les métriques de Cadence intègrent ces jours sans distinction d'origine."*

### CL5 — Décalage horaire UTC vs heure locale

Tous les calculs sont en jours calendaires UTC. V1 ne corrige pas le décalage — limite connue, documentée.

### CL6 — Burst régulier confondu avec Périodique

Règle de priorité V1 :
```
si periodicity_score > 12 ET variance_gap ≤ median_gap → Périodique
sinon si burst_ratio ≥ 0.70                            → Burst
```
Le signal de régularité (`variance_gap` faible) l'emporte sur le signal de concentration si les deux sont présents.

### CL7 — nb_jours_actifs faible sur longue période

Exemple : 6 jours actifs sur 5 mois. Juste au-dessus du seuil minimum. Confiance Faible obligatoire. Note : *"6 jours actifs sur 5 mois — Dimension Cadence calculée avec données minimales (confiance : Faible)."*

### CL8 — Ordres sur plusieurs actifs le même jour

Un opérateur qui pose 3 ordres sur BTC, 2 sur ETH et 1 sur SOL le même jour = 6 ordres ce jour-là. Comportement normal — aucun traitement spécial. La Cadence travaille sur le nombre total d'ordres par jour, indépendamment des actifs.

---

## 10. Risques de confusion — 4 frontières

### Avec le score comportemental (Trade History · Discipliné/Réactif/Impulsif/Agressif)

Le score comportemental mesure la qualité des décisions intra-session. La Cadence mesure la structure temporelle inter-sessions. Ces deux dimensions sont orthogonales — ne jamais les combiner dans une phrase de restitution.

### Avec la suractivité

`active_day_rate` élevé n'est ni bon ni mauvais. Formulations autorisées : faits chiffrés. Formulations interdites : évaluations ("très actif", "trop actif", "peu actif").

### Avec l'overtrading (`scoring.js`)

L'overtrading est une réentrée rapide sur le même actif (Trade History). La Cadence est un descripteur temporel (Order History). Burst ≠ overtrading. La Dimension Cadence n'emploie jamais : "overtrading", "sur-trading", "excès d'ordres", "fréquence excessive".

### Avec la mémoire comportementale (`cameleon_behavior_memory_v1`)

En V1 : `cadenceResult` est éphémère — stocké dans `behaviorRepo`, jamais dans `memoryRepo`. La persistance longitudinale de la Cadence est une décision V2.

---

## 11. Périmètre de l'implémentation

### Ce que `oi-cadence.js` fera

- Recevoir un tableau de trades canoniques FILLED (Order History)
- Extraire les timestamps et calculer la distribution journalière UTC
- Calculer les 6 métriques : `active_day_rate`, `burst_ratio`, `median_gap`, `variance_gap`, `periodicity_score`, `cv_daily`
- Détecter un éventuel break long (> 45 jours) et le signaler dans la note
- Classer en Continue / Burst / Périodique avec niveau de confiance
- Retourner un objet JSON structuré (format §7)

### Ce que `oi-cadence.js` ne fera pas

- Analyser les actifs ou volumes (Dimension Capital — `oi-capital.js`)
- Analyser les types d'ordres ou annulations (Dimension Exécution)
- Analyser les secteurs (Dimension Portefeuille)
- Écrire dans `behavior-repo.js`, `memory-repo.js`, `session-repo.js`
- Modifier `order-analyzer.js`, `oi-capital.js` ou tout autre module existant
- Produire des jugements sur la fréquence ou la qualité de l'activité

### Fichier cible

`src/js/behavior/analytics/oi-cadence.js`

Export unique : `computeCadence(trades)` → retourne l'objet JSON §7.

### Branchement UI (identique au pattern Capital V1)

- Sub-bloc dans `buildOrderAnalysis()`, après le bloc Style Capital
- Silence structurel si `etat === 'Indisponible'`
- `cadenceResult: null` dans toutes les branches non-Order-History
- `cadenceResult` stocké dans `behaviorRepo` comme clé éphémère

---

## Références

- Doctrine OI V1 : `docs/doctrine/operator_intelligence_v1.md` (§6 Dimension 4 — Cadence)
- Architecture Capital V1 : `docs/architecture/oi_v1_capital_architecture.md` (modèle structurel de référence)
- Audit corpus : `docs/architecture/operator_intelligence_corpus_audit.md`
- Format canonique : `src/js/behavior/normalize/mappers/binance_order.js`

---

*Document d'architecture. Validé par l'opérateur le 2026-06-20.*
*Décision Q1 : cycle hebdomadaire uniquement (cycle mensuel exclu de V1).*
*Décision Q2 : break > 45 jours signalé dans la note, période non segmentée.*
*Toute révision des seuils requiert une décision explicite de l'opérateur.*
*Toute extension du périmètre (cycle mensuel, segmentation automatique) requiert une nouvelle session d'architecture.*
