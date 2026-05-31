# Calibration Personnelle Binance V1 — Audit de faisabilité architecturale

**Statut :** Exploratoire · Doctrinal · Aucune implémentation
**Date :** 2026-05-31
**Nature :** Audit d'architecture et de faisabilité — pas une roadmap, pas un plan d'implémentation

**Documents de référence :**
- `docs/architecture/v0-personal-calibration-binance.md` — stratégie V0-A Antonio (calibration comportementale)
- `docs/architecture/binance-multi-source-memory.md` — architecture BMSM 4 sources (Transaction + Earn)
- `docs/architecture/privacy-local-first-imports.md` — règles privacy, suppression PII

**Ce document ne couvre pas :**
- L'implémentation de quoi que ce soit
- La modification du moteur décisionnel principal
- La création d'un système auto-adaptatif
- Les seuils T1/T4 (non calibrables depuis Binance seul — documenté dans v0-personal-calibration-binance.md)

---

## Question centrale

> **Une calibration personnelle Binance apporte-t-elle réellement une valeur distinctive à Caméléon Engine, et si oui sous quelle forme exacte ?**

La réponse à cette question se construit à travers les cinq sections qui suivent. Elle est énoncée explicitement en section 5.

---

## 1. Cartographie complète des données

### 1.1 Données disponibles — ce que les exports contiennent

| Source | Champ | Type de donnée | Granularité |
|---|---|---|---|
| Trade History | `Date` | Timestamp horodaté | Seconde |
| Trade History | `Pair` | Symbole actif | Ex. BTCUSDT |
| Trade History | `Side` | BUY / SELL | Nominal |
| Trade History | `Price` | Prix d'exécution | Float |
| Trade History | `Qty` | Quantité exécutée (base) | Float |
| Trade History | `Total` | Volume quote (Qty × Price) | Float |
| Trade History | `Fee` | Frais payés | Float |
| Trade History | `Fee Coin` | Actif des frais (BNB, USDT…) | Nominal |
| Order History | `Order_ID` | Identifiant ordre | String (PII partiel) |
| Order History | `Date` | Timestamp de soumission | Seconde |
| Order History | `Pair` | Symbole | Nominal |
| Order History | `Type` | LIMIT / MARKET / STOP_LIMIT | Nominal |
| Order History | `Side` | BUY / SELL | Nominal |
| Order History | `Status` | FILLED / CANCELLED / PARTIAL | Nominal |
| Order History | `Price` | Prix cible déclaré | Float |
| Order History | `Qty` | Quantité déclarée | Float |
| Transaction History | `Date` | Timestamp | Seconde |
| Transaction History | `Operation` | Type de transaction | Ex. Deposit, Withdraw |
| Transaction History | `Coin` | Actif concerné | Nominal |
| Transaction History | `Change` | Montant net (+ dépôt / - retrait) | Float (signé) |
| Earn History | `Date` | Timestamp | Seconde |
| Earn History | `Product` | Type d'earn | Ex. Flexible, Locked |
| Earn History | `Asset` | Actif en earn | Nominal |
| Earn History | `Amount` | Montant du revenu passif | Float |
| Earn History | `APY` | Taux annualisé | Float |

### 1.2 Données utiles — ce qui peut être exploité analytiquement

| Donnée dérivable | Source | Méthode de calcul | Usage analytique |
|---|---|---|---|
| Temps de détention par position | Trade History | Matching BUY→SELL (FIFO) par symbole | Profil temporel (Axe A) |
| Temps entre interventions | Trade History | Δt entre trades consécutifs, par actif | Rythme naturel de l'opérateur |
| Distribution des durées | Trade History | Histogramme des détentions calculées | Médiane, quartiles, outliers |
| Fréquence d'intervention | Trade History | Trades par heure / jour / semaine | Rythme global |
| Prises de profits partielles | Trade History | Séquences BUY → SELL × n sur même actif | Profil de respiration (Axe B) |
| Rechargements | Trade History | BUY → BUY sur même actif sans SELL intermédiaire | Construction de position |
| Rotations | Trade History | SELL → BUY rapide sur même actif | Range vs conviction |
| Concentration par actif | Trade History | % du volume quote par symbole | Spécialisation vs dispersion |
| Variation de taille de position | Trade History | CV des `Qty` par actif et par période | Cohérence du sizing |
| Accélérations d'activité | Trade History | Densité locale vs densité baseline | Proxy hyperactivité (Axe C) |
| Périodes d'inactivité | Trade History | Gaps temporels entre trades | Signature de repli |
| Taux d'annulation d'ordres | Order History | CANCELLED / (FILLED + CANCELLED) | Proxy indécision / anxiété |
| Type d'ordre dominant | Order History | Ratio LIMIT / MARKET | Patience vs urgence |
| Rechargements compulsifs | Transaction History | Dépôt dans les 24h suivant une session intense | Signal capital management |
| Retraits de protection | Transaction History | Retrait partiel en période de stress documenté | Signal gestion du risque systémique |
| Ratio capital actif / passif | Earn + Trade | Capital en earn / capital en trading actif par période | Profil de risque réel |
| Trajectoire comportementale | Tous | Séquence de profils sur périodes multiples | Évolution opérateur (Axe A+B+C) |

### 1.3 Données inutiles — disponibles mais sans valeur analytique comportementale

| Donnée | Raison d'inutilité |
|---|---|
| `Fee` et `Fee Coin` (valeur brute) | Montant absolu non comparable sans capital total. Ratio pertinent uniquement en relatif. |
| `Order_ID`, `Trade_ID` | Identifiants techniques — utiles pour réconciliation seulement, pas pour l'analyse comportementale |
| `APY` (Earn History) | Taux affiché par Binance — ne reflète pas le comportement de l'opérateur |
| `Product` (Earn History) | Catégorie commerciale — Flexible vs Locked n'apporte pas d'information comportementale directe |
| Prix d'exécution isolé | Sans contexte de marché (open/high/low du jour), un prix seul n'indique pas si le trade était bien ou mal exécuté |
| Montant absolu en USDT | Violation Règle 4 privacy — seuls les ratios et métriques agrégées sont analytiquement sains |

### 1.4 Données impossibles à obtenir depuis les exports Binance

| Dimension | Raison structurelle | Impact sur le chantier |
|---|---|---|
| **Contexte de marché au moment du trade** | Binance n'exporte pas l'OHLC de la bougie correspondante | Impossible d'interpréter une durée de détention sans savoir si le marché était en range ou en tendance |
| **Intention de l'opérateur** | Non déclarée dans les CSV — les trades ne portent aucune annotation | "Tenu 30 jours" peut être attente disciplinée ou inattention |
| **P&L réel par position** | Nécessite un moteur de comptabilité complexe (FIFO/LIFO, fees, assets multiples) — non fourni par les exports | Le moteur comportemental ne calcule pas de P&L |
| **Stop loss et targets déclarés** | Non présents dans les exports (sauf STOP_LIMIT partiellement) | Impossible de savoir si une sortie était planifiée ou réactive |
| **`confidence_score` du moteur** | Output du moteur principal — n'existe pas dans les trades | Seuils T1 non calibrables depuis Binance |
| **`posture` déclarée** | Variable de formulaire moteur — non présente dans les exports | Seuils T2/T3 non calibrables depuis Binance |
| **`need_action`** | Variable de formulaire moteur — non présente dans les exports | Seuils T3 non calibrables depuis Binance |
| **MdS, QdR, DMU** | Indicateurs premium saisis manuellement dans le formulaire | Tensions T1/T4 non calibrables depuis Binance |
| **Soumissions moteur** | Distinctes de la fréquence de trading | D-ATT-01 `WINDOW_SIZE` non calibrable depuis Binance |
| **Perception et fatigue cognitive** | Dimension subjective — non observable dans les données | V0-B sessions cockpit uniquement |
| **Utilité ressentie** | Dimension qualitative — non observable | V0-B sessions cockpit uniquement |

---

## 2. Les cinq axes d'analyse

### Axe A — Profil temporel

**Ce que les exports permettent de documenter :**

Le matching BUY→SELL par symbole (FIFO) produit une durée de détention pour chaque position fermée. Sur un corpus suffisant (≥ 50 positions), la distribution de ces durées révèle la structure temporelle naturelle de l'opérateur.

| Métrique | Ce qu'elle révèle | Limite d'interprétation |
|---|---|---|
| Médiane de détention | "La moitié de mes positions sortent en moins de X heures" | Ne dit pas si c'était prévu ou forcé |
| Quartile Q1 (25%) | La durée typique de ses trades courts | Scalp intentionnel vs sortie panique — non distinguable sans contexte |
| Quartile Q3 (75%) | La durée typique de ses trades longs | Attente disciplinée vs inattention — non distinguable sans contexte |
| Écart Q3−Q1 | Amplitude de la variété temporelle | Large écart = opérateur multi-style ou multi-actifs |
| Δt entre interventions | Rythme de présence sur le marché | Ne capture pas les périodes d'observation sans trade |
| Densité quotidienne | Trades/jour moyen | Ne distingue pas range dense vs tendance fluide |

**Questions que cet axe permet de poser :**

- L'opérateur est-il naturellement rapide (Q1 < 30 min), lent (Q3 > 24h), ou mixte ?
- Sa vitesse varie-t-elle selon l'actif ou selon le régime de marché ?
- Existe-t-il une durée plancher en dessous de laquelle il ne descend jamais (signature de prudence minimale) ?

**Ce que cet axe ne peut pas répondre :**

Si la durée observée correspond à une intention ou à un accident de parcours.

---

### Axe B — Profil de respiration

**Ce que les exports permettent de documenter :**

La "respiration" d'un opérateur, c'est la manière dont il entre et sort des positions — d'un seul tenant ou en plusieurs fois. Les exports Trade History permettent d'identifier les séquences.

| Pattern | Séquence observable | Interprétation possible | Interprétation à éviter |
|---|---|---|---|
| Sortie partielle | BUY(100) → SELL(30) → SELL(70) | Prise de profit graduelle — range discipline | Indécision (si délai très court entre les SELL) |
| Construction progressive | BUY(30) → BUY(30) → BUY(40) sur prix différents | DCA intentionnel ou averaging | Loss chasing (si les BUY accompagnent une baisse) |
| Rotation rapide | SELL complet → BUY dans la minute | Re-entry après signal | Revenge trading (si contexte de perte précédente) |
| Rechargement post-sortie | BUY → SELL → attente (> 1h) → BUY | Cycle range structuré | Attachement émotionnel à un actif |

**Métriques calculables :**

- Ratio positions à sortie unique / positions à sorties multiples
- Délai médian entre SELL partiel et SELL final
- Délai médian entre SELL complet et BUY suivant (même actif)
- Fréquence des positions construites en plusieurs entrées

**Ce que cet axe ne peut pas répondre :**

Si les sorties partielles correspondent à des targets prédéfinis ou à des décisions réactives au cours du mouvement.

---

### Axe C — Profil émotionnel indirect

**Ce que les exports permettent de documenter sans psychologie déclarative :**

Les données comportementales ne mesurent pas des émotions. Elles mesurent des **patterns d'activité qui, statistiquement, sont corrélés à des états émotionnels**. Cette distinction est fondamentale.

**Signaux d'accélération soudaine :**

Une période où la densité de trades dépasse 2× la baseline personnelle de l'opérateur. Ce signal ne dit pas "il était stressé" — il dit "quelque chose a modifié son rythme habituel".

| Observable | Seuil de détection | Ce que ça révèle | Ce que ça ne révèle pas |
|---|---|---|---|
| Spike de densité | > 2× baseline sur 1h | Rupture du rythme normal | Cause (opportunité réelle vs stress) |
| Concentration soudaine sur actif unique | > 80% du volume sur 1 actif en 1 journée vs < 40% normalement | Focalisation anormale | Si elle était planifiée ou émotionnelle |
| Annulations d'ordres en cluster | > 5 annulations dans 30 min | Indécision ou recherche de niveau | Si c'était exploration tactique ou anxiété |
| Changement de type d'ordre | LIMIT → MARKET en période d'activité dense | Urgence ou peur du manque | Réaction à un signal réel vs FOMO |
| Gap d'inactivité inhabituel | > 3× la durée normale d'inactivité personnelle | Repli / déconnexion | Si volontaire ou subi |

**Signatures comportementales récurrentes détectables :**

Ces patterns sont déjà en partie couverts par `patterns.js`. La valeur de la calibration personnelle est de **réinterpréter ces patterns relativement à la baseline de l'opérateur**, pas à une norme théorique.

Exemple : un opérateur dont la baseline est 8 trades/heure sur TAOUSDC en range n'est pas "en hyperactivité" à 10 trades/heure. Un opérateur dont la baseline est 2 trades/heure l'est clairement.

---

### Axe D — Adaptation des indicateurs : la valeur centrale du chantier

**Question fondamentale :**

> Un même comportement doit-il être interprété différemment selon l'opérateur ?

**Réponse : oui, structurellement.**

Les seuils actuels du module comportemental sont génériques. Ils définissent "anormal" par rapport à un opérateur théorique moyen. Mais ce moyen n'existe pas : chaque opérateur a un rythme naturel, une fréquence d'intervention, une durée de détention qui lui sont propres.

**Cas documentés :**

| Comportement observé | Interprétation générique | Interprétation calibrée |
|---|---|---|
| 10 trades en 60 min | Overtrading | Normal pour un range trader dense — excessif pour un swing trader |
| Détention de 3 jours | Indécision / position oubliée | Swing discipline — ou manque d'attention. Dépend du style de l'opérateur |
| CV de taille 0.8 (forte variation) | Instabilité du sizing | Normal pour un opérateur multi-actifs avec allocations différentes par classe |
| BUY → SELL en 8 min × 5 fois | Rapid reentry problématique | Grid trading intentionnel sur range — structurellement attendu |
| 4 SELL sur une même position | Indécision | Prise de profit graduelle sur cible connue |
| Annulation de 30% des ordres | Forte indécision | Approche tactique de placement (test niveaux avant exécution) |

**Ce que la calibration change :**

Elle déplace l'"anormal" de "déviation par rapport à un standard théorique" vers **"déviation significative par rapport à la propre baseline historique de l'opérateur"**.

Ce glissement est la contribution architecturale principale du chantier.

**Ce que la calibration ne change pas :**

- Les seuils de détection dans `patterns.js` restent les mêmes
- Les scores comportementaux restent les mêmes
- La logique du moteur principal reste intacte
- Le pipeline de décision (`engine.js`, `buildPayload()`) n'est pas touché

La calibration produit une **couche d'interprétation supplémentaire**, pas une modification du calcul.

---

### Axe E — Capacités réelles de chaque source

| Source | Ce qu'elle apporte | Ce qu'elle n'apporte pas | Statut pipeline |
|---|---|---|---|
| **Trade History** | Timing précis, séquences d'exécution, durées de détention, patterns de respiration, densité d'activité | Contexte marché, intention, P&L réel | ✅ Production actif |
| **Order History** | Intention déclarée, annulations, types d'ordres, ratio LIMIT/MARKET, qualité d'exécution (intention vs réel) | Ordres non soumis, modification d'ordres (non exportée par Binance) | ✅ Production actif |
| **Transaction History** | Flux de capital, rechargements compulsifs, retraits de protection, dépendance au contexte de capital disponible | Destination des fonds, motivation du mouvement | 🟡 Conception BMSM P1 |
| **Earn History** | Ratio capital passif / actif, profil de risque réel (part exposée vs mise en réserve), évolution de l'appétit au risque | Changements de stratégie d'earn, motivation du choix produit | 🟡 Conception BMSM P2 |
| **PDF Binance** | Agrégats historiques, confirmation des données CSV | Granularité transactionnelle, timestamps précis — les CSV sont supérieurs | ⚠️ Doctrinal — conditionnel signal terrain |

**Hiérarchie analytique des sources :**

1. **Trade History** — source primaire : la plus riche en granularité comportementale
2. **Order History** — source complémentaire : ajoute la couche d'intention et d'annulation
3. **Transaction History** — source de contexte : capital flow, non comportement de trading direct
4. **Earn History** — source de cadrage : profil de risque global, non granularité tactique
5. **PDF** — source de secours : redondant avec les CSV, utile uniquement en l'absence des exports CSV

---

## 3. Hypothèses de calibration V1

### Forte confiance — ces hypothèses reposent sur des données robustes et répétables

| Hypothèse | Données requises | Condition de validité |
|---|---|---|
| **H1 — Médiane de détention personnelle** : il est possible d'établir la durée médiane de détention de l'opérateur avec une précision suffisante pour séparer "court" de "long" dans son propre référentiel | Trade History, ≥ 100 trades | Positions correctement matchées FIFO par symbole — problèmes résiduels avec partial fills |
| **H2 — Fréquence d'intervention par actif** : chaque actif fréquemment tradé a une densité caractéristique stable (trades/heure en période active) | Trade History, ≥ 30 trades par actif | Nécessite segmentation temporelle pour exclure périodes inactives |
| **H3 — Concentration par actif** : la distribution du volume par actif est stable et révèle une structure de spécialisation ou de généralisme | Trade History, ≥ 6 mois | Sensible aux changements de stratégie — ne pas fusionner périodes trop éloignées |
| **H4 — Bibliothèque de faux positifs personnels** : il est possible de construire une liste des patterns détectés qui sont structurellement normaux pour cet opérateur | Trade History + REAL_001–004 | Dépend des analyses de terrain déjà réalisées — Antonio : déjà partiellement établi |
| **H5 — Profil de respiration dominant** : l'opérateur a une tendance stable vers les sorties graduelles ou les sorties totales | Trade History, ≥ 50 positions fermées | Ne distingue pas l'intention derrière les multiples SELL — contexte manuel requis |

### Moyenne confiance — ces hypothèses sont raisonnables mais nécessitent plusieurs exports croisés

| Hypothèse | Données requises | Incertitude principale |
|---|---|---|
| **H6 — Rythme naturel par régime de marché** : le comportement de l'opérateur change de manière prévisible entre range, tendance et volatilité | Trade History × 3+ régimes explicitement identifiés | Identifier le régime de marché nécessite des données externes — non présentes dans les exports |
| **H7 — Signature d'accélération anormale** : un seuil personnel de densité au-delà duquel l'activité est réellement anormale (pas juste dense) | Trade History × 5+ périodes | La baseline elle-même peut varier — un range de 6 semaines peut créer une baseline artificielle |
| **H8 — Taux d'annulation stable** : le ratio CANCELLED/FILLED est une signature stable révélant le style de placement | Order History, ≥ 100 ordres | Sensible aux types d'ordres utilisés — un opérateur qui utilise peu de LIMIT a peu d'annulations par construction |
| **H9 — Évolution du profil dans le temps** : les exports multi-périodes montrent une trajectoire comportementale lisible | Trade History × 3+ périodes distinctes | Dépend de la qualité d'annotation des périodes — REAL_004 suggère une trajectoire claire mais reste un cas |
| **H10 — Contexte de capital comme modificateur** : les rechargements après perte ou retraits en période de stress sont détectables par croisement Transaction × Trade | Transaction History + Trade History | Requiert P1 BMSM — non encore disponible. Corrélation ≠ causalité |

### Faible confiance — ces hypothèses sont plausibles mais reposent sur des inférences fragiles

| Hypothèse | Données requises | Problème fondamental |
|---|---|---|
| **H11 — Proxy de stress via patterns d'activité** : les pics d'activité corrélés à des patterns (rapid_reentry, overtrading) révèlent des états de stress indirect | Trade History, patterns.js | Corrélation comportementale ≠ état émotionnel. Un rush d'activité peut être une opportunité saisie avec discipline |
| **H12 — Tolérance à la volatilité** : la taille des positions en période de forte volatilité révèle la tolérance au risque de l'opérateur | Trade History + données externe volatilité marché | Impossible à calculer sans données de volatilité externe. La volatilité n'est pas dans les exports |
| **H13 — Comportements de type "range" vs "tendance"** : il est possible d'inférer si l'opérateur préfère les marchés en range | Trade History + durées de détention + concentration | La durée de détention seule ne suffit pas — un swing trader en tendance tient aussi longtemps qu'un range trader |
| **H14 — Modification du sizing comme signal d'état** : un CV de taille croissant dans une période courte révèle une instabilité émotionnelle | Trade History par actif, par période courte | Sur multi-actifs, le CV est naturellement élevé par allocation différente — le séparer du vrai signal d'instabilité est difficile |
| **H15 — Chronobiologie personnelle** : l'opérateur trade préférentiellement à certaines heures de la journée, et ce pattern est stable | Trade History timestamps | Stable à long terme mais peut changer selon les sessions. Révèle des habitudes mais pas des préférences décisionnelles |

---

## 4. Architecture conceptuelle

### Principes directeurs

- Aucune interaction avec le moteur principal (`engine.js`, `buildPayload()`)
- Lecture seule de données historiques — pas de feedback actif sur les décisions courantes
- Isolation totale du pipeline comportemental existant (contrat `behavior/` inchangé)
- Persistance uniquement via `localStorage` — mêmes règles que le reste du module
- Pas d'IA, pas de prédiction, pas d'auto-adaptation cachée
- La calibration produit un profil de lecture — pas une modification de calcul

### Modules conceptuels

---

#### Module 1 — `DataInventory`

**Responsabilité :** Catalogue et validation des sources disponibles pour l'opérateur.

**Entrées :** Présence ou absence de chaque type d'export dans le pipeline actuel.

**Sorties :** Tableau de disponibilité des sources + niveau de confiance associé à chaque axe d'analyse possible.

**Flux :** Consulté au démarrage de chaque import. Produit un diagnostic : "avec vos données actuelles, les axes A/B sont documentables, l'axe C est partiel, les axes D/E attendent des sources supplémentaires."

---

#### Module 2 — `BaselineBuilder`

**Responsabilité :** Construire la baseline comportementale personnelle de l'opérateur à partir de l'ensemble des exports historiques importés.

**Sous-composants conceptuels :**

| Sous-composant | Responsabilité |
|---|---|
| `TemporalProfile` | Médiane de détention · Distribution des durées · Densité d'intervention par actif |
| `RhythmProfile` | Ratio sorties graduelles/totales · Délai médian entre SELL partiel et SELL final · Fréquence des rechargements |
| `SizingProfile` | CV de taille intra-actif et inter-actifs · Sizing relatif par actif (différent par classe) |
| `ActivityProfile` | Baseline de densité par actif · Seuils personnels d'accélération anormale |

**Entrées :** Données normalisées produites par les parsers existants (`binance_spot.js`, `binance_order.js`) — le `BaselineBuilder` est en aval des parsers, pas en parallèle.

**Sorties :** Objet `OperatorBaseline` — profil agrégé de l'opérateur. Persisté dans `localStorage`.

**Condition de validité :** Minimum 3 imports de périodes distinctes couvrant au moins 2 régimes de marché différents. En dessous de ce seuil, la baseline est marquée "indicative" et non "de référence".

---

#### Module 3 — `ContextAnnotator`

**Responsabilité :** Permettre à l'opérateur d'annoter chaque import avec le contexte de marché correspondant. Sans annotation, l'interprétation de la baseline est impossible.

**Interface conceptuelle :** Avant ou après chaque import, l'opérateur peut déclarer :
- Régime de marché probable : Bull / Bear / Range / Volatil / Mixte / Inconnu
- Actifs dominants de la période (déjà détectables automatiquement)
- Notes libres optionnelles

**Pourquoi ce module existe :**

Les exports Binance ne contiennent pas le contexte marché. Sans lui, comparer une détention de 30 jours en bull run avec une détention de 30 jours en bear marché est analytiquement sans sens. Le `ContextAnnotator` est la seule façon de rendre les données temporelles interprétables.

**Sorties :** Métadonnées de contexte attachées à chaque import dans `localStorage`.

---

#### Module 4 — `DeviationAnalyzer`

**Responsabilité :** Pour un import donné, comparer les métriques observées à la baseline personnelle et identifier les déviations significatives.

**Principe de calcul :**

Une déviation est significative si elle dépasse un seuil relatif à la baseline personnelle — pas à un standard théorique. Le seuil de "significatif" est lui-même calibrable (faible/moyen/fort) selon le nombre d'imports disponibles dans la baseline.

**Exemples de déviations détectables :**

| Observable | Baseline | Observation actuelle | Déviation |
|---|---|---|---|
| Densité TAOUSDC | 6 trades/heure | 14 trades/heure | + 133% — potentiellement anormal |
| CV de taille BTCUSDT | 0.25 | 0.28 | + 12% — dans la norme |
| Médiane détention | 4h | 25 min | - 90% — rupture de style |
| Taux annulation | 12% | 38% | + 217% — signal fort d'indécision |

**Sorties :** Rapport de déviations par période importée — inclus dans l'affichage comportemental existant, pas dans le moteur principal.

---

#### Module 5 — `CalibrationProfile`

**Responsabilité :** Objet de persistance consolidant l'ensemble des données de calibration de l'opérateur.

**Structure conceptuelle :**

```
CalibrationProfile
  ├── baseline (OperatorBaseline)
  │     ├── temporal (médiane, Q1, Q3, densité par actif)
  │     ├── rhythm (ratios sorties, rechargements)
  │     ├── sizing (CV intra/inter, sizing relatif)
  │     └── activity (densités personnelles, seuils)
  ├── imports[]
  │     ├── id, date, type, période, régime (annoté)
  │     ├── métriques brutes
  │     └── déviations calculées
  ├── falsePositiveLibrary[]
  │     └── pattern_id · actif · contexte · classification
  └── calibrationQuality
        ├── nbImports
        ├── periodsDistinct
        ├── regimesCovered
        └── confidenceLevel (indicative / référence)
```

**Persistance :** `localStorage` — clé `CE_calibration_profile_v1`. Respect des règles privacy : aucun montant absolu, aucune donnée PII, uniquement métriques agrégées et ratios.

---

#### Module 6 — `CalibrationView`

**Responsabilité :** Affichage lecture seule du profil de calibration dans le panneau comportemental existant.

**Contenu affiché :**

- Résumé de la baseline : "Votre détention médiane : 4h · Densité TAOUSDC range : 6–8 trades/heure · Profil dominant : Réactif (3/4 imports)"
- Rapport de déviations pour le dernier import
- Indicateur de qualité de calibration (indicative / de référence)
- Bibliothèque de faux positifs personnels documentés

**Ce que la vue ne fait pas :**

- Ne modifie aucun score
- N'envoie aucun signal au moteur principal
- N'affiche aucune recommandation opérationnelle
- Ne dit pas "vous devriez trader autrement"

**Intégration :** Le `CalibrationView` s'insère dans le panneau comportemental existant (`behavior-view.js`) comme une section additionnelle, sous les résultats de l'analyse courante. Il ne remplace rien — il complète.

---

### Flux conceptuels

```
Import CSV Binance (Trade History / Order History)
  → [parsers existants] binance_spot.js / binance_order.js
  → DataInventory (valide la source, détermine les axes accessibles)
  → [si import nouveau régime] ContextAnnotator (annotation manuelle facultative)
  → BaselineBuilder.update(nouveaux trades normalisés)
      → TemporalProfile.recalculate()
      → RhythmProfile.recalculate()
      → SizingProfile.recalculate()
      → ActivityProfile.recalculate()
  → DeviationAnalyzer.compare(importActuel, baseline)
  → CalibrationProfile.persist() → localStorage
  → CalibrationView.render() → panneau comportemental
```

**Le flux principal du moteur (`Form → engine.js → buildPayload() → render.js`) n'est pas touché.**

---

### Frontières strictes

| Ce qui interagit avec `CalibrationProfile` | Ce qui n'interagit pas |
|---|---|
| `behavior-view.js` (lecture seule pour affichage) | `engine.js` (aucun accès) |
| `session-repo.js` (persistance partagée avec le module comportemental) | `buildPayload()` (aucun accès) |
| Parsers existants (en amont) | `coherence.js`, `attention.js`, `hierarchy.js` (aucun accès) |
| `patterns.js` (peut enrichir la bibliothèque de faux positifs) | Moteur principal (aucun signal, aucune variable partagée) |

---

## 5. Réponse à la question centrale

> **Une calibration personnelle Binance apporte-t-elle réellement une valeur distinctive à Caméléon Engine, et si oui sous quelle forme exacte ?**

### Réponse : Oui — sous une forme précise et délimitée

La valeur est réelle, mais elle est **interprétative, pas calculatoire**. Elle ne modifie aucun score. Elle ne change aucune décision. Elle produit un **miroir comportemental personnel** qui transforme la lecture des résultats existants.

**Sans calibration :**
> "Votre score est 42. Profil : Réactif. Overtrading détecté sur TAOUSDC."

**Avec calibration :**
> "Votre score est 42. Profil : Réactif — cohérent avec vos 4 imports précédents. L'overtrading détecté sur TAOUSDC est dans votre baseline range trading (6–8 trades/h). Ce n'est pas un signal d'alerte pour vous."

Cette différence est significative : elle transforme une lecture générique en **lecture contextualisée pour l'opérateur réel**.

---

### Forme exacte de la valeur

| Dimension | Valeur apportée | Forme concrète |
|---|---|---|
| **Interprétation personnalisée** | "Anormal" devient relatif à la propre baseline de l'opérateur | Rapport de déviations : écart entre métriques actuelles et baseline personnelle |
| **Réduction des faux positifs** | Les patterns structurellement normaux pour l'opérateur sont identifiés et distingués des vrais signaux | Bibliothèque de faux positifs personnels persistée |
| **Trajectoire comportementale** | Lecture de l'évolution dans le temps — consolidation, maturation, changement de style | Historique des profils sur plusieurs imports annotés |
| **Calibration des seuils comportementaux** | Les seuils `OVERTRADING_MIN_TRADES`, `SIZE_CV_THRESHOLD` etc. peuvent être ajustés sur la base d'une réalité documentée | Propositions de seuils personnalisés — validées avant modification |

---

### Conditions nécessaires pour que la valeur soit réelle

La valeur n'existe pas avec un seul import. Elle se construit progressivement :

| Étape | Condition | Valeur débloquée |
|---|---|---|
| 1 import | Disponible | Aucune baseline — analyse courante uniquement |
| 3 imports, 1 régime | Minimum | Baseline indicative — déviations approximatives |
| 5 imports, 2 régimes | Utile | Baseline de référence — déviations fiables |
| 8+ imports, 3+ régimes | Robuste | Trajectoire comportementale · Bibliothèque de faux positifs complète |

---

### Ce que la calibration n'est pas

- **Pas un système auto-adaptatif :** elle ne modifie rien automatiquement
- **Pas un système prédictif :** elle ne prédit pas le comportement futur
- **Pas un remplacement du V0 terrain :** elle ne calibre pas T1/T4, T3, D-ATT-01
- **Pas un correcteur de score :** les scores comportementaux restent ceux du module `behavior/`
- **Pas une IA :** aucun apprentissage automatique, aucun modèle

---

### Conditions d'ouverture du chantier

| Condition | Raison |
|---|---|
| BMSM documenté et non démarré | ✅ Remplie (commit 5130332) |
| V0-A calibration Antonio — stratégie définie | ✅ Remplie (v0-personal-calibration-binance.md) |
| Aucun chantier actif concurrent sur `behavior/` | À vérifier avant ouverture |
| Signal terrain : au moins 1 opérateur ayant importé ≥ 5 exports sur périodes distinctes | Condition principale — non encore remplie |

**La calibration personnelle ne doit pas être implémentée avant que la condition terrain soit remplie.** L'architecture est prête. L'implémentation attend la réalité.

---

## Dettes architecturales identifiées

| ID | Dette | Priorité | Bloquant |
|---|---|---|---|
| CPB-01 | Définir le format de `OperatorBaseline` dans `localStorage` sans exposer de montants absolus | Haute | Oui — avant tout développement |
| CPB-02 | Spécifier le comportement de `BaselineBuilder` si les imports couvrent des périodes qui se chevauchent | Haute | Oui |
| CPB-03 | Définir le seuil de "déviation significative" — absolu ou relatif à la dispersion de la baseline | Moyenne | Non |
| CPB-04 | Spécifier comment la bibliothèque de faux positifs est construite et mise à jour — automatique ou validation manuelle | Moyenne | Non |
| CPB-05 | Définir le comportement de `CalibrationView` si la baseline est insuffisante (< 3 imports) | Faible | Non |
| CPB-06 | Préciser les règles de suppression PII dans `CalibrationProfile` (montants → ratios uniquement) | Haute | Oui — contrainte privacy |

---

*Calibration Personnelle Binance V1 — Audit de faisabilité architecturale*
*2026-05-31 — Document exploratoire · Aucune implémentation · Aucune modification de code*
