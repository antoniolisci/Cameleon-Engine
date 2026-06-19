# Operator Intelligence V1 — Architecture d'implémentation : Dimension Capital

**Statut :** Document d'architecture · EN ATTENTE de validation avant tout code  
**Date :** 2026-06-19  
**Scope :** Dimension Capital uniquement — aucune autre dimension touchée  
**Prérequis lus :** `docs/doctrine/operator_intelligence_v1.md` · `docs/architecture/operator_intelligence_corpus_audit.md`

---

## 1. Définitions opérationnelles

### Concentré

L'opérateur concentre la majorité de son activité sur un petit nombre d'actifs. Sur l'ensemble de la période analysée, le top-3 des symboles représente ≥65% du volume total exécuté. La concentration est **stable** : les mêmes actifs dominent d'une sous-période à l'autre.

> Ce que cela décrit : un opérateur qui revient régulièrement sur les mêmes positions, souvent avec des tailles significatives.

### Diversifié

L'opérateur distribue son activité sur un nombre élevé d'actifs sans dominante claire. Aucun cluster de 3 symboles ne dépasse 40% du volume total. Cette distribution est **simultanée** — elle est observable dans chaque sous-période, pas seulement en agrégeant.

> Ce que cela décrit : un opérateur qui maintient une exposition large et régulière sur de nombreux actifs.

### Rotatif

L'activité est concentrée à tout instant, mais les actifs dominants changent significativement d'une période à l'autre. La concentration globale est haute (CR3 ≥ 65%), mais les symboles qui composent ce top-3 sont différents entre sous-périodes consécutives.

> Ce que cela décrit : un opérateur qui "parie" sur des thèmes ou des actifs successifs — concentré dans la fenêtre courante, diversifié dans le temps.

**Distinction clé Diversifié vs Rotatif :**
- Diversifié = spread à tout moment
- Rotatif = concentré à tout moment, mais sur des actifs différents
- La détection du Rotatif nécessite au minimum 3 sous-périodes comparables (sinon la rotation est indétectable)

---

## 2. Données d'entrée

### Source

Order History Binance, filtré FILLED-ONLY, normalisé par `binance_order.js` vers le format canonique.

### Format canonique utilisé

Le mapper `binance_order.js` produit pour chaque ordre FILLED :

| Champ canonique | Type | Usage pour Capital |
|---|---|---|
| `timestamp` | Number (ms UTC) | Découpage temporel — sous-périodes pour rotation |
| `symbol` | String ("BTCUSDT") | Identification de l'actif — extraction base asset |
| `quote_value` | Number (USDT ou autre) | Poids monétaire de l'ordre — pondération par volume |
| `quantity` | Number | Fallback si `quote_value` = 0 |
| `side` | "BUY" \| "SELL" | Non utilisé pour Capital V1 |
| `price` | Number | Non utilisé directement (quote_value = price × qty) |

> `quote_value` est le champ de pondération principal. Il correspond à la valeur en quote asset (USDT généralement) de chaque ordre exécuté. Source : colonne "Trading Total" ou "Total" des exports Binance.

### Ce qui n'est PAS utilisé

- Colonnes CANCELED / NEW / PARTIALLY_FILLED → Dimension Capital travaille sur FILLED uniquement
- `fee` → non pertinent pour la répartition de volume
- `orderId`, `fillRate` → non pertinents pour Capital
- Prix individuels → absorbés dans `quote_value`

---

## 3. Normalisation des symboles (base asset extraction)

Le champ `symbol` Binance est une paire de trading (ex. : "BTCUSDT", "ETHBUSD", "SOLUSDT"). Pour la Dimension Capital, on travaille sur l'**actif de base** — pas sur la paire.

### Algorithme V1

```
quote_assets_connus = [USDT, BUSD, FDUSD, USDC, BTC, ETH, BNB, DAI, TUSD]
(ordonnés du plus long au plus court pour éviter les correspondances partielles)

pour chaque symbole S :
  pour chaque quote Q dans quote_assets_connus :
    si S se termine par Q :
      base = S.slice(0, S.length - Q.length)
      si base.length >= 2 : retourner base
  retourner S  // symbole non reconnu → conservé tel quel
```

### Exemples

| Paire (symbol) | Base asset extrait |
|---|---|
| BTCUSDT | BTC |
| ETHBUSD | ETH |
| TAOUSDT | TAO |
| SOLUSDT | SOL |
| FETUSDT | FET |
| XMRUSDT | XMR |
| ONDOUSDT | ONDO |
| BNBUSDT | BNB |
| BTCBUSD | BTC (fusionné avec BTCUSDT) |
| ETHBTC | ETH (quote = BTC) |

### Fusion de paires

BTCUSDT + BTCBUSD → même base asset BTC → volumes agrégés sous BTC.

### Exclusions

Les paires stables/stables (BUSDUSDT, TUSDUSDT, USDCUSDT) sont exclues du calcul de répartition Capital — elles représentent des conversions, pas des positions sur actifs. Elles sont comptabilisées dans les ordres totaux pour les seuils minimums mais pas dans le calcul de volume.

---

## 4. Métriques calculées

### M1 — CR3 : Taux de concentration des 3 premiers actifs

```
volume_total = Σ quote_value sur tous les ordres FILLED (hors stables/stables)
volume_top3  = Σ quote_value des 3 actifs les plus actifs

CR3 = volume_top3 / volume_total
```

Interprétation :
- CR3 = 0.90 → 90% du volume sur 3 actifs → très concentré
- CR3 = 0.30 → top-3 ne représente qu'un tiers → fortement diversifié
- CR3 est le **signal primaire** de classification

Avantage vs HHI : directement intelligible, facile à expliquer dans la restitution.

### M2 — HHI : Indice de Herfindahl-Hirschman

```
pour chaque base asset i :
  si = volume_asset_i / volume_total
HHI = Σ(si²)
```

Interprétation :
- HHI → 1 : monopole (un seul actif)
- HHI = 1/N : distribution parfaitement égale sur N actifs
- Seuil indicatif : HHI > 0.25 → concentration significative

Rôle : **signal de vérification secondaire**. Utilisé pour confirmer les cas ambigus de CR3, pas pour la classification primaire.

### M3 — Nombre de symboles actifs

```
symboles_actifs = count(base assets avec volume_asset ≥ 1% du volume_total)
```

Le seuil de 1% filtre les actifs marginaux (1 ordre isolé sur un symbole rare). Un actif sous ce seuil est compté dans le total mais exclu du compte "actifs".

### M4 — Rotation score (détection Rotatif)

Calculé uniquement si la période couvre ≥ 3 mois.

```
Découper la période en fenêtres mensuelles W₁, W₂, ..., Wₙ
Pour chaque fenêtre Wᵢ : calculer TOP3(Wᵢ) = set des 3 actifs les plus actifs

Pour chaque paire consécutive (Wᵢ, Wᵢ₊₁) :
  Jaccard(Wᵢ, Wᵢ₊₁) = |TOP3(Wᵢ) ∩ TOP3(Wᵢ₊₁)| / |TOP3(Wᵢ) ∪ TOP3(Wᵢ₊₁)|

rotation_score = 1 - moyenne(Jaccard sur toutes les paires consécutives)
```

Interprétation :
- rotation_score = 0 : même top-3 à chaque fenêtre → aucune rotation
- rotation_score = 1 : top-3 complètement différent à chaque fenêtre → rotation maximale
- Seuil indicatif : rotation_score ≥ 0.45 → rotation significative

Cas limite : fenêtre avec < 5 ordres → fenêtre ignorée dans le calcul de rotation (données insuffisantes pour ce mois).

---

## 5. Arbre de décision et seuils V1

### Arbre principal

```
ÉTAPE 1 — Vérification des seuils minimums
  si mois_couverts < 2 OU symboles_actifs < 2 OU ordres_filled < 20 :
    → état = "Indisponible", confiance = "Indisponible", STOP

ÉTAPE 2 — Calcul CR3 global
  si CR3 ≥ 0.65 :
    → candidat = "Concentré ou Rotatif"
    → ALLER À ÉTAPE 3 (rotation)
  si CR3 < 0.40 :
    → état = "Diversifié", ALLER À ÉTAPE 4 (confiance)
  si 0.40 ≤ CR3 < 0.65 :
    → zone ambiguë → état = "Diversifié" (présomption), confiance réduite
    → ALLER À ÉTAPE 4 (confiance)

ÉTAPE 3 — Rotation score (uniquement si CR3 ≥ 0.65)
  si mois_couverts < 3 :
    → rotation_score = null (indétectable)
    → état = "Concentré" (défaut faute de signal rotation)
    → confiance réduite de 1 niveau
  si rotation_score ≥ 0.45 :
    → état = "Rotatif"
  sinon :
    → état = "Concentré"
  → ALLER À ÉTAPE 4 (confiance)

ÉTAPE 4 — Calcul du niveau de confiance
  voir §6
```

### Seuils V1 (provisoires — à calibrer)

| Seuil | Valeur V1 | Rôle |
|---|---|---|
| CR3 concentration | 0.65 | Au-dessus → Concentré ou Rotatif |
| CR3 diversification | 0.40 | En-dessous → Diversifié |
| rotation_score rotation | 0.45 | Au-dessus → Rotatif |
| Volume minimum actif | 1% du total | Sous ce seuil → actif marginal ignoré |
| Fenêtre mensuelle min ordres | 5 | Sous ce seuil → fenêtre ignorée pour rotation |

> **Ces seuils sont provisoires.** Ils doivent être validés sur le corpus réel (REAL_001, REAL_003, REAL_004) avant d'être fixés. La calibration est une étape de l'implémentation, pas de l'architecture.

---

## 6. Niveau de confiance

### Critères et règles

```
confiance = "Élevé"
  si : mois_couverts ≥ 6
  ET  : symboles_actifs ≥ 5
  ET  : ordres_filled ≥ 100

confiance = "Moyen"
  si : (3 ≤ mois_couverts < 6)
  OU  : (3 ≤ symboles_actifs < 5)
  OU  : (50 ≤ ordres_filled < 100)
  (et pas déjà "Élevé")

confiance = "Faible"
  si : mois_couverts < 3
  OU  : symboles_actifs < 3
  OU  : ordres_filled < 50

confiance = "Indisponible"
  si : mois_couverts < 2
  OU  : symboles_actifs < 2
  OU  : ordres_filled < 20
```

### Modificateur rotation

Si l'état est "Concentré" parce que la rotation est **indétectable** (période < 3 mois) et non parce que la rotation est **absente** (rotation_score < 0.45) : réduire la confiance de 1 niveau et l'indiquer dans la note de restitution.

---

## 7. Datasets de calibration

### Datasets utilisables pour Capital

| Dataset | FILLED | Symboles | Durée | Profil attendu | Usage |
|---|---|---|---|---|---|
| **REAL_001 CLEAN** | 1685 | 64 | 25 mois | Diversifié ou Rotatif | Calibration principale |
| **REAL_003 CLEAN** | 542 | 10 | 5.6 mois | Multi-actifs modéré | Calibration secondaire |
| **REAL_004 CLEAN** | 1910 | ~89 | 28 mois | Diversifié quasi-certain | Cas extrême — borne haute |
| **REAL_002 CLEAN** | 120 | 1 | 47 jours | Concentré trivial (mono-actif) | Cas limite |
| **b3.pdf** (FILLED extraits) | ~1200 estimé | multi | 12 mois | Inconnu | Validation B-series |

### Plan de calibration

1. Appliquer l'algorithme sur REAL_001, REAL_003, REAL_004 avec les seuils provisoires
2. Vérifier que la classification produite est cohérente avec la lecture humaine du corpus
3. Ajuster CR3 et rotation_score si besoin
4. Documenter les seuils retenus avec les valeurs observées sur chaque dataset
5. Les seuils calibrés deviennent les seuils V1 figés

---

## 8. Format de sortie

### Structure JSON

```json
{
  "dimension": "Capital",
  "etat": "Concentré | Diversifié | Rotatif | Indisponible",
  "confiance": "Élevé | Moyen | Faible | Indisponible",
  "metriques": {
    "symboles_actifs": 12,
    "cr3": 0.78,
    "hhi": 0.42,
    "rotation_score": 0.23,
    "top3_symboles": ["TAO", "SOL", "BTC"],
    "ponderation": "quote_value | order_count"
  },
  "periode": {
    "debut": "2024-01-15",
    "fin": "2025-03-20",
    "mois_couverts": 14,
    "fenetres_rotation": 12
  },
  "seuils_appliques": {
    "cr3_concentration": 0.65,
    "cr3_diversification": 0.40,
    "rotation_seuil": 0.45
  },
  "note": "Texte de restitution lisible — voir §9 et §10"
}
```

### Champ `ponderation`

- `"quote_value"` : pondération par valeur monétaire (chemin normal)
- `"order_count"` : fallback si quote_value = 0 sur ≥ 50% des ordres (parsing défaillant)

Le champ `ponderation` doit toujours être déclaré dans la sortie pour permettre l'audit de la restitution.

---

## 9. Ce que le moteur pourra dire

Ces formulations respectent les frontières épistémiques E1–E5 et les règles linguistiques L1–L6 :

> *"Sur la période analysée, 78% du volume d'ordres est concentré sur 3 actifs : TAO, SOL, BTC."*

> *"L'activité est distribuée sur 12 actifs distincts. Aucun cluster de 3 symboles ne dépasse 35% du volume total — style Capital : Diversifié."*

> *"Sur 14 mois, la concentration reste élevée (CR3 : 74%) mais les actifs dominants changent chaque trimestre — style Capital : Rotatif (confiance : Moyen)."*

> *"Données insuffisantes pour calculer la Dimension Capital : période de 47 jours, 1 actif distinct — confiance : Indisponible."*

> *"Le top-3 (TAO · FET · RENDER) représente 82% du volume sur 8 mois. Les mêmes actifs dominent sur les 4 fenêtres mensuelles — style Capital : Concentré (confiance : Élevé)."*

---

## 10. Ce que le moteur ne devra jamais dire

Ces formulations violent les frontières épistémiques — elles déduisent des intentions, convictions, ou identités :

> ~~*"L'opérateur croit à l'IA."*~~

> ~~*"Ce style de concentration traduit une conviction forte."*~~

> ~~*"L'opérateur préfère les positions concentrées."*~~

> ~~*"Ce profil indique un appétit pour le risque élevé."*~~

> ~~*"L'opérateur diversifie pour se protéger."*~~

> ~~*"La rotation vers RWA montre une anticipation macro."*~~

**Règle de test :** Si la phrase peut être réfutée par l'opérateur en disant *"ce n'est pas ce que je pense"*, elle viole E1. La reformulation correcte décrit un comportement observable, pas un état mental supposé.

---

## 11. Cas limites

### CL1 — Mono-actif (REAL_002 : 1 symbole)

**Comportement officiel (aligné §5) :** `symboles_actifs = 1 < MIN_SYMBOLES (2)` → garde §5 déclenche `état = "Indisponible"`. La Dimension Capital n'est pas calculable avec un seul actif.

Justification : la Dimension Capital décrit une **répartition** entre actifs. Avec un seul actif, il n'y a pas de répartition à décrire — seulement une absence d'alternative observable. Ce cas sort du périmètre de la dimension.

- CR3 = 100% (observable mais non interprétable comme style Capital)
- rotation_score = null (un seul actif, rotation impossible)
- confiance : **Indisponible**
- Note : *"Un seul actif observé sur 47 jours — Dimension Capital non calculable (symboles_actifs < 2)."*

> **Note descriptive (hors classification) :** une concentration triviale sur un seul actif peut être mentionnée dans la restitution comme observation brute, mais ne constitue pas une classification Capital valide. Le moteur déclare Indisponible et ne déduit aucun style.

### CL2 — Très grand nombre de symboles (REAL_004 : ~89 symboles)

- CR3 potentiellement < 0.10 → Diversifié très probable
- Appliquer le filtre "symboles actifs ≥ 1% du volume" pour nettoyer le bruit
- Note éventuelle : *"89 symboles détectés dont 42 actifs (≥ 1% du volume). Style Capital : Diversifié (confiance : Élevé)."*

### CL3 — Période courte avec haute concentration (< 3 mois, CR3 élevé)

- Rotation indétectable
- Classer Concentré (défaut faute de signal rotation)
- Réduire confiance de 1 niveau + indiquer dans la note
- Note : *"Période de 2 mois insuffisante pour détecter une éventuelle rotation. Style Capital : Concentré probable (confiance : Faible — rotation non calculable)."*

### CL4 — Zone ambiguë CR3 (0.40–0.65)

- Ni clairement Concentré ni clairement Diversifié
- Classer Diversifié (présomption) avec confiance Moyen
- Ne pas inventer de sous-catégorie
- Note : *"Concentration modérée (CR3 : 52%). Style Capital : Diversifié (confiance : Moyen — zone intermédiaire)."*

### CL5 — quote_value manquant ou nul

- Se produit si la colonne "Total" / "Trading Total" est absente du fichier source
- Fallback : pondération par nombre d'ordres (order_count)
- Indiquer `"ponderation": "order_count"` dans la sortie
- Note : *"Pondération par nombre d'ordres (valeur monétaire non disponible). Résultat moins précis."*

### CL6 — Stable/stable dans les paires

- BUSDUSDT, TUSDUSDT, USDCUSDT → conversions de stablecoins
- Exclure du calcul de volume Capital
- Comptabiliser dans les ordres totaux pour les seuils minimums

### CL7 — Fenêtres mensuelles vides ou quasi-vides

- Un mois avec < 5 ordres → fenêtre ignorée dans le calcul du rotation_score
- Si > 30% des fenêtres sont ignorées → rotation_score marqué "partiel" et confiance réduite

### CL8 — Même base asset, quotes différents (BTCUSDT + BTCBUSD)

- Deux lignes d'actifs différents, même base asset
- Volumes agrégés sous la base commune (BTC)
- Le compte de paires distinctes reste informatif mais la concentration est calculée sur la base

---

## 12. Périmètre de l'implémentation

### Ce que le module Capital fera

- Recevoir un tableau de trades canoniques (FILLED Order History)
- Extraire les base assets par normalisation de paire
- Calculer CR3, HHI, symboles_actifs, rotation_score
- Classer en Concentré / Diversifié / Rotatif avec niveau de confiance
- Retourner un objet JSON structuré (format §8)

### Ce que le module Capital ne fera pas

- Consulter la table symbole → secteur (c'est la Dimension Portefeuille)
- Interpréter le côté BUY/SELL (c'est la Dimension Exécution)
- Analyser les timestamps inter-ordres (c'est la Dimension Cadence)
- Modifier ou écrire dans `behavior-repo.js`, `memory-repo.js`, `session-repo.js`
- Modifier `order-analyzer.js` existant (isolation stricte)

### Fichier cible

`src/js/behavior/analytics/oi-capital.js`

Exportation unique : `computeCapital(trades)` → retourne l'objet JSON §8.

---

## Références

- Doctrine OI V1 : `docs/doctrine/operator_intelligence_v1.md` (§4 Dimension Capital, §6 Frontières épistémiques)
- Audit corpus : `docs/architecture/operator_intelligence_corpus_audit.md`
- Format canonique : `src/js/behavior/normalize/mappers/binance_order.js`
- Table secteur (hors scope Capital) : `docs/architecture/operator_intelligence_symbol_sector_map_v1.md`

---

---

## 13. Notes de validation corpus (post-implémentation)

**Commit implémentation :** `5d862c8` — `src/js/behavior/analytics/oi-capital.js`

### Résultats corpus réel (session 2026-06-19)

| Dataset | État | Confiance | CR3 | HHI | Rotation | Top-3 |
|---|---|---|---|---|---|---|
| REAL_002 (1 symb, 47j) | Indisponible | Indisponible | 1.0 | 1.0 | null | TAO |
| REAL_003 (10 symb, 5.6m) | **Rotatif** | Moyen | 0.977 | 0.851 | 0.50 | TAO · FET · ONDO |
| REAL_001 (64 symb, 25m) | **Rotatif** | Élevé | 0.653 | 0.199 | 0.67 | HBAR · FET · ADA |
| REAL_004 (89 symb, 28m) | **Diversifié** | Moyen | 0.486 | 0.106 | 0.71 | HBAR · FET · GLM |

### Note sur le test synthétique Rotatif

Le test synthétique initial (4 groupes de 3 symboles entièrement distincts qui tournent chaque mois) produisait un CR3 global de ~0.24 — en dessous du seuil de concentration (0.65). Le moteur classifiait correctement en Diversifié.

**Ce comportement est correct.** La définition de Rotatif dans ce document (§1) requiert une **concentration globale élevée** (CR3 ≥ 0.65 sur l'ensemble de la période) combinée à un **changement de composition** du top-3 d'un mois à l'autre. Un opérateur qui distribue son activité sur 12 actifs distincts en rotation complète produit un profil Diversifié au sens global — même si chaque mois pris individuellement semble concentré.

Un vrai profil Rotatif doit conserver 3 à 5 actifs récurrents qui captent la majorité du volume global, tout en changeant lesquels d'entre eux dominent à chaque fenêtre. REAL_001 (CR3 = 0.65, rotation = 0.67) et REAL_003 (CR3 = 0.98, rotation = 0.50) illustrent ce pattern mieux que tout test synthétique à groupes entièrement distincts.

*Le test synthétique Rotatif sera à revoir dans un chantier de tests dédié.*

---

*Ce document a été validé avant tout code.*  
*Les seuils V1 sont confirmés après validation corpus réel (session 2026-06-19).*  
*Toute révision des seuils requiert une décision explicite de l'opérateur.*
