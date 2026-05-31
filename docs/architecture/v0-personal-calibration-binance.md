# Calibration V0 personnelle — Exports Binance Antonio

## Métadonnées

**Statut** : Document stratégique · V0 mono-opérateur · Aucune modification de code
**Version** : 1.0 — 2026-05-25
**Contexte** : Phase 2 figée · T3 cockpit actif · Phase 3 bloquée (absence données terrain)
**Opérateur de référence** : Antonio — opérateur principal et unique pour la phase V0 initiale
**Dépendances** :
- `docs/architecture/v0-observation-strategy.md` — stratégie d'observation générale
- `docs/architecture/calibration-terrain.md` — protocole quantitatif V0
- `docs/architecture/snapshots-phase3-reference.md` — cas de référence Phase 3
- `src/js/behavior/normalize/mappers/binance_spot.js` — parser Trade History
- `src/js/behavior/normalize/mappers/binance_order.js` — parser Order History

**Ce document ne couvre pas :**
- La calibration des seuils T1/T4 (impossible depuis Binance seul)
- La modification du moteur ou des flags
- Le remplacement du V0 terrain cockpit par des exports Binance

---

## Cadrage préalable — ce que le V0 est maintenant

La stratégie V0 originale (`v0-observation-strategy.md`) a été conçue pour un panel
de 20–30 opérateurs. Ce cadre reste valide comme objectif final. Mais il suppose une
disponibilité multi-opérateurs qui n'est pas encore réunie.

**La phase initiale du V0 est mono-opérateur : Antonio.**

Ce n'est pas une restriction — c'est une ressource. Antonio dispose d'exports Binance
couvrant des périodes multiples, des régimes de marché différents, et un comportement
de trading réel documenté (REAL_001–REAL_004 déjà analysés). Cette base permet de
calibrer ce qui est calibrable depuis des exports, avant même le démarrage des sessions
cockpit.

**Reformulation du V0 en deux phases :**

| Phase | Nom | Base | Objectif |
|---|---|---|---|
| V0-A | Calibration comportementale Binance | Exports Binance Antonio | Profil, seuils overtrading, durée détention, patterns réels |
| V0-B | Observation cockpit terrain | Sessions moteur réelles | Fréquence T3, utilité perçue, seuil D-ATT-01 |

Ces deux phases sont complémentaires, pas alternatives. V0-A prépare des données de
référence comportementale. V0-B valide la couche V2 en conditions cockpit réelles.

---

## A. Ce que les exports Binance peuvent calibrer

### A1. Profil comportemental — base empirique réelle

Le module comportemental (`behavior/`) calcule à partir des exports :
`score → profil Discipliné / Réactif / Impulsif / Agressif`

Les exports Binance d'Antonio permettent d'établir :

| Donnée calibrable | Source export | Usage |
|---|---|---|
| Profil comportemental global | Trade History / Order History | Validation que T2 (ACTIVE + Impulsif/Agressif) est pertinent |
| Fréquence du profil sur plusieurs périodes | Plusieurs exports | Stabilité du profil dans le temps |
| Évolution du profil selon le régime de marché | Exports datés | Est-ce que le profil change en range vs tendance ? |
| Fréquence réelle d'overtrading | Order History | Calibration OVERTRADING_WINDOW_MIN / OVERTRADING_MIN_TRADES |
| Taille de position typique et variance (CV) | Trade History | Seuil SIZE_CV_THRESHOLD pertinent pour Antonio |
| Patterns de re-entry | Trade History | Distinguer range trading structuré vs rapid_reentry émotionnel |

### A2. Durée de détention réelle

Le moteur calcule `avgDelayAfterBuy` — délai moyen entre un BUY et le trade suivant
(tous symboles confondus), et `avgTimeBetweenSameSymbol` — rythme par actif.

Ces métriques permettent d'établir :

| Donnée | Ce qu'elle révèle |
|---|---|
| `avgTimeBetweenSameSymbol` (minimum sur tous actifs) | L'actif sur lequel Antonio est le plus réactif |
| Distribution des durées BUY→SELL par symbole | Ce qui est "courte détention normale" pour Antonio |
| Écart entre détention médiane et détention longue | Ce que signifie "long" dans son contexte réel |
| Fréquence des détentions > 24h, > 7j, > 30j | Confirme que longue détention ≠ passivité pour lui |

**Règle critique (voir section E) :** Ces durées ne peuvent pas être interprétées sans
le contexte de marché. Un BUY tenu 30 jours peut être une attente disciplinée ou un
manque d'attention. La donnée brute ne tranche pas — elle documente.

### A3. Concentration par actif et rotation portefeuille

Déjà documenté dans REAL_001–REAL_004, mais les exports permettent de maintenir
une bibliothèque à jour :

| Donnée | Usage |
|---|---|
| Nombre d'actifs tradés par période | Profil concentré vs dispersé |
| Actifs dominants (% du volume) | Spécialisation ou généralisme |
| Rotation d'actifs entre périodes | Cohérence de la sélection |
| Émergence de nouveaux actifs | Signal de changement de stratégie |

### A4. Séquences range / attente / sortie

Via `grid-grouper.js` et `patterns.js` :

| Pattern détecté | Interprétation possible | Interprétation à éviter |
|---|---|---|
| Groupes grille sur TAOUSDC / BTCUSDT | Range trading structuré | Impulsivité (si taille constante et régularité) |
| BUY → SELL → BUY rapide | Re-entry range | Revenge trading (si taille croissante) |
| 3 BUYs croissants sur 2h | Loss chasing (si prix baisse) | DCA planifié (si régularité) |
| CV de taille élevé multi-actifs | Allocation différente par actif (normal) | Incohérence globale (piège LS-4) |

### A5. Faux positifs comportementaux — bibliothèque personnalisée

Chaque export analysé contribue à identifier les faux positifs spécifiques à Antonio.
Un faux positif est ici défini comme : le moteur produit un signal d'alerte comportementale
pour un comportement qui est, chez Antonio, intentionnel et structuré.

**Exemples déjà documentés (REAL_001–REAL_004) :**

| Faux positif | Dataset source | Cause du faux positif |
|---|---|---|
| Score 15 sur multi-actifs long | REAL_001, REAL_004 | CV multi-actifs élevé par construction (allocation différente) |
| Overtrading détecté sur TAOUSDC | REAL_002 | Range trading dense par stratégie |
| Oversized trades fréquents | REAL_001 | Concentration volontaire sur quelques actifs clés |

Chaque nouvel export peut compléter ou invalider cette bibliothèque.

### A6. Seuils overtrading — calibration par actif

Les seuils actuels du module comportemental sont génériques :

```
OVERTRADING_WINDOW_MIN = 60   // 5+ trades dans 60 minutes
OVERTRADING_MIN_TRADES = 5
```

Avec les exports d'Antonio, il est possible de calculer :
- Quelle est sa fréquence moyenne sur TAOUSDC en range ?
- Combien de trades/heure sur ses actifs les plus actifs ?
- À partir de quel volume horaire son activité devient-elle réellement anormale ?

**Note :** ces seuils appartiennent au module comportemental, pas à la couche V2.
Leur ajustement éventuel ne touche pas aux flags V2 ni à `coherence.js`.

### A7. Comportement sur plusieurs régimes de marché

C'est la valeur principale des exports multi-périodes. En comparant :

| Période | Régime probable | Comportement attendu |
|---|---|---|
| Bull run (ex. fin 2024) | Tendance forte haussière | Moins de range, détentions plus longues |
| Bear market / stagnation | Range ou tendance baissière | Re-entry plus fréquente, détentions courtes |
| Consolidation latérale | Range pur | Grilles, overtrading apparent, re-entry structurée |
| Volatilité extrême (ex. liquidations cascade) | Chaos | Comportement non représentatif |

Un profil stable sur des régimes différents est un signal de cohérence comportementale.
Un profil très différent selon le régime est une information sur la sensibilité d'Antonio
au contexte — pas nécessairement un problème.

---

## B. Ce que les exports Binance ne peuvent pas calibrer

### B1. Seuils T1/T4 — impossibilité structurelle

| Variable non disponible | Raison | Tension concernée |
|---|---|---|
| `confidence_score` | Output du moteur principal — pas extrait des trades | T1 seuil X |
| `MdS` (Maturité de structure) | Indicateur premium saisi dans le formulaire moteur | T1 seuil Y / T4 |
| `QdR` (Qualité du retracement) | Indicateur premium saisi dans le formulaire moteur | T4 seuil X |
| `DMU` (Divergence multi-unité) | Indicateur premium saisi dans le formulaire moteur | T1 déclenchement |
| `posture` (PASSIVE/BALANCED/ACTIVE) | Déclarée dans le formulaire moteur à chaque session | T2/T3 |
| `need_action` (oui/non) | Déclaré dans le formulaire moteur | T3 proxy engagement |
| `engagement_declared` | Déclaré dans le formulaire moteur | T3 |

**Conséquence directe :** Les seuils T1 et T4 restent provisoires (X=65, Y=2) après
analyse des exports Binance. La calibration de ces seuils nécessite impérativement
des sessions moteur réelles où Antonio saisit ses analyses dans le formulaire.

### B2. Fréquence T3 en conditions cockpit — non mesurable hors sessions

T3 se déclenche sur `posture = ACTIVE + need_action = no`. Ces deux variables ne sont
pas présentes dans les exports Binance. On ne peut pas déduire depuis l'historique de
trades :
- Si Antonio aurait déclaré ACTIVE à tel moment
- Si Antonio aurait coché "pas d'action nécessaire" pour une analyse donnée

**En revanche**, les exports permettent de formuler une hypothèse : si la période est
un range dense avec re-entry fréquente, il est probable qu'Antonio ait été en posture
ACTIVE. Mais c'est une hypothèse de travail, pas une mesure.

### B3. Perception cockpit et fatigue cognitive

Les exports ne contiennent aucune donnée sur :
- L'utilité ressentie du message T3
- La saturation attentionnelle après plusieurs sessions
- La confusion sémantique sur le message affiché
- L'impact du cockpit sur le stress décisionnel

Ces mesures ne peuvent venir que des sessions moteur réelles — V0-B.

### B4. Valeur de D-ATT-01 (WINDOW_SIZE)

`WINDOW_SIZE = 5` représente l'hypothèse d'une session à 3–8 soumissions. Les exports
Binance documentent le rythme de trading réel, mais pas le nombre de soumissions dans
une session moteur. Ces deux grandeurs ne sont pas corrélées de façon fiable :
Antonio peut trader 15 fois par jour tout en soumettant le formulaire moteur 3 fois.

---

## C. Méthode recommandée d'import

### C1. Types d'exports Binance reconnus par le moteur

| Type | Parser | Ce qu'il contient | Usage privilégié |
|---|---|---|---|
| Trade History (Spot) | `binance_spot.js` | Timestamp · Symbol · Side · Price · Qty · Total · Fee | Timing précis, détention, re-entry |
| Order History | `binance_order.js` | Idem + Order ID · Status · Fill Rate | Ordres annulés exclus, grilles |
| Transaction History | Non supporté — chantier BMSM P1 | Dépôts, retraits, flux capital | En conception — voir `binance-multi-source-memory.md` |
| Earn History | Non supporté — chantier BMSM P2 | Revenus passifs, staking | En conception — voir `binance-multi-source-memory.md` |
| Wallet Snapshot | `wallet_analyzer.js` | Soldes par date | Valeur portefeuille (pas les trades) |

**Ne pas mélanger Trade History et Order History dans le même import.** Les deux formats
ont des champs différents et produisent des comportements légèrement distincts au parsing.

### C2. Protocole multi-fichiers

**Principe : un fichier = une période identifiée.**

Pour chaque export à analyser :
1. **Noter la période couverte** (dates début–fin, extraites du fichier ou du nom)
2. **Identifier le régime de marché probable** (bull / bear / range / volatil) sur cette période
3. **Identifier les actifs dominants** (top 3 par volume avant toute analyse)
4. **Importer le fichier seul** — pas de merge avec d'autres exports à ce stade
5. **Lire le rapport comportemental** et noter le profil + score
6. **Remplir la grille d'analyse** (section D)
7. **Archiver le rapport** dans la bibliothèque de cas réels

### C3. Règles de non-contamination entre exports

| Règle | Raison |
|---|---|
| Ne pas fusionner bull run + bear market | Le profil résultant reflétera un comportement composite non interprétable |
| Ne pas fusionner périodes > 6 mois si actifs radicalement différents | La rotation d'actifs crée un CV artificiel |
| Éviter les fichiers < 30 trades | Données insuffisantes pour les seuils statistiques du module comportemental |
| Éviter les fichiers couvrant des liquidations en cascade | Comportement non représentatif, fausse les patterns |

**Exception acceptable :** REAL_001 (1685 trades, 2.3 ans) est volontairement long pour
documenter la trajectoire comportementale. Ce format est utile pour la bibliothèque
historique, mais pas pour la calibration de seuils (voir REAL_004 findings).

### C4. Identification du contexte marché

Pour chaque export, noter :

```
Période     : 2024-01-15 → 2024-03-20
Régime      : Bull run BTC (ATH mars 2024)
Actifs top3 : BTCUSDT (60%), TAOUSDC (25%), autre (15%)
Type export : Trade History
Nb trades   : ___
Notes       : Forte hausse TAOUSDC en parallèle BTC — deux stratégies actives simultanément
```

---

## D. Grille d'analyse par fichier

À remplir après chaque import. Conserver dans la bibliothèque de cas réels.

```
──────────────────────────────────────────────────────────────
FICHE EXPORT BINANCE — V0 personnelle Antonio
──────────────────────────────────────────────────────────────

Métadonnées
  Fichier         : ___________
  Type            : ☐ Trade History  ☐ Order History
  Période couverte: ___________ → ___________
  Durée (jours)   : ___
  Régime marché   : ☐ Bull  ☐ Bear  ☐ Range  ☐ Mixte  ☐ Inconnu

Volume
  Nombre de trades (après filtrage FILLED) : ___
  BUY / SELL                               : ___ / ___
  Actifs distincts                         : ___
  Actifs top 3 (par volume quote)          : ___ · ___ · ___

Durée de détention
  avgTimeBetweenSameSymbol (actif min)     : ___ min  sur ___
  avgDelayAfterBuy                         : ___ min
  Trades tenus > 24h (estimation)          : ___  (~___%)
  Trades tenus > 7j                        : ___  (~___%)
  Observation : longues détentions correspondent à ___________

Profil comportemental
  Score moteur                             : ___/100
  Profil                                   : ☐ Discipliné  ☐ Réactif  ☐ Impulsif  ☐ Agressif
  dataQuality                              : ☐ HIGH  ☐ MEDIUM  ☐ LOW
  Patterns détectés                        : ___________

Patterns — interprétation contextuelle
  overtrading détecté ?   ☐ Oui  ☐ Non — si oui, actif : ___ — structuré ou émotionnel ? ___
  rapid_reentry ?         ☐ Oui  ☐ Non — si oui, contexte : ___________________________
  size_inconsistency ?    ☐ Oui  ☐ Non — si oui, inter-actifs (normal) ou intra-actif ? ___
  loss_chasing ?          ☐ Oui  ☐ Non — si oui, prix baissait ? ___ taille croissante ? ___
  revenge_trading ?       ☐ Oui  ☐ Non — si oui, après quelle séquence ? _______________

Faux positifs identifiés
  ☐ CV multi-actifs élevé (allocation différente par actif — attendu)
  ☐ Overtrading sur range dense TAOUSDC (structuré par design)
  ☐ Longue détention interprétée comme passivité (contexte marché justifie l'attente)
  ☐ Autre : ___________

Limites du fichier
  ___________________________________________________________________________

Signaux à documenter pour bibliothèque
  ___________________________________________________________________________

──────────────────────────────────────────────────────────────
```

---

## E. Règles d'interprétation adaptées à Antonio

Ces règles sont fondées sur l'analyse des datasets REAL_001–REAL_004 et sur le cadrage
explicite fourni par l'utilisateur. Elles doivent être appliquées avant toute conclusion.

### E1. Durée de détention — ne pas conclure sans contexte marché

**Longue détention ≠ passivité.**

Antonio peut tenir une position 30, 60 ou 90 jours. Ce n'est pas un manque d'attention —
c'est une stratégie d'attente de confirmation. Le moteur comportemental ne calcule pas
de P&L et ne sait pas si la position était en gain ou en attente de niveau.

| Observation | Conclusion interdite | Conclusion possible |
|---|---|---|
| Détention de 45 jours sur TAOUSDC | "Antonio était passif / non attentif" | "Antonio attendait un niveau de sortie défini" |
| Pas de trade sur BTC pendant 3 mois | "Abandon / inactivité" | "Absence intentionnelle sur actif non en setup" |

**Courte détention ≠ impulsivité.**

Un BUY → SELL en 20 minutes peut être :
- Un scalp intentionnel sur un setup précis
- Une sortie rapide sur signal d'invalidation
- Un take profit partiel sur grille

Il ne devient "rapid reentry problématique" que si la séquence BUY → SELL rapide → BUY rapide
avec taille croissante est répétée dans un contexte de perte. Cette distinction est déjà
intégrée dans les seuils de `patterns.js` — la rappeler ici évite une surinterprétation
manuelle.

### E2. Ordres multiples proches — présumer la grille avant de conclure

Plusieurs BUY sur le même actif en quelques minutes ou heures peuvent être :
- Une grille planifiée (TAOUSDC range trading documenté dans REAL_002)
- Un DCA en escalier intentionnel
- Un split d'ordre pour optimiser le fill

Le `grid-grouper.js` identifie et absorbe ces groupes avant le scoring. Mais si une
séquence semble anormale, vérifier d'abord si les prix d'entrée sont régulièrement espacés
(grille) ou erratiques (impulsivité).

### E3. Re-entry — distinguer range par design et fuite en avant

| Indicateur | Signal range structuré | Signal fuite en avant |
|---|---|---|
| Taille des trades | Constante ou légèrement décroissante | Croissante (escalade) |
| Prix d'entrée | Espacés régulièrement | Successivement plus bas (chasing) |
| Contexte de marché | Range identifié | Tendance baissière forte |
| Fréquence | Stable sur la période range | Accélère après un trade perdant |

### E4. Activité élevée sur certains actifs — juger par actif, pas globalement

Antonio a démontré une concentration forte sur TAOUSDC (REAL_002 : 120 trades, score 37,
grouper 4 groupes, comportement range validé). Une activité élevée sur cet actif est
normale et structurée. Appliquer les seuils d'overtrading globaux sur un actif range
dense produit des faux positifs confirmés.

**Règle opérationnelle :** si overtrading est détecté sur un actif avec groupes grille ≥ 2
et taille de position constante, classer comme faux positif jusqu'à preuve contraire.

### E5. Cohérence globale comme critère primaire

**Le comportement d'Antonio se juge sur la cohérence entre périodes, pas sur la fréquence brute.**

Un trader qui :
- a un profil Réactif constant sur bull, bear et range
- maintient un CV de taille stable intra-actif
- montre une concentration progressive (89 actifs → 8 actifs documentée REAL_004)

...démontre une cohérence comportementale réelle, indépendamment du nombre de trades.

Signaux de cohérence à surveiller :
- Profil stable sur ≥ 3 exports de périodes différentes
- Actifs concentrés sur les exports les plus récents (maturation)
- Patterns d'overtrading limités aux actifs range identifiés

Signaux de rupture à documenter (sans conclure immédiatement) :
- Changement de profil brutal entre deux périodes proches
- Émergence de loss chasing sur actifs nouveaux
- CV de taille intra-actif qui explose sur une période courte

---

## F. Sortie attendue — bibliothèque de cas réels

### F1. Structure de la bibliothèque

```
docs/
  v0-calibration-binance/
    REAL_001_order_history_multi_actifs_2.3ans.md     (déjà analysé)
    REAL_002_trade_history_taousdc_mono_actif.md      (déjà analysé)
    REAL_003_order_history_multi_actifs_intermediaire.md (déjà analysé)
    REAL_004_reference_historique_majeure.md          (déjà analysé)
    [NouveauFichier_periode_regime].md                (à créer à chaque nouvel import)
```

Note : Les fiches REAL_001–004 sont documentées dans les memories projet et dans
`docs/architecture/stress-test/` selon l'organisation existante. La bibliothèque
Binance V0 s'appuie sur ces références comme points d'ancrage.

### F2. Seuils comportementaux plus justes — objectif de V0-A

À l'issue de 5–10 exports couvrant des régimes différents, il sera possible de proposer :

| Paramètre | Valeur actuelle générique | Cible après V0-A |
|---|---|---|
| `OVERTRADING_MIN_TRADES` | 5 trades / 60 min | À ajuster selon densité réelle TAOUSDC range |
| `SIZE_CV_THRESHOLD` | 0.5 | À valider : est-ce correct intra-actif pour Antonio ? |
| `LC_ESCALATION_FACTOR` | 1.8× | À valider : quel facteur sépare DCA de loss chasing chez Antonio ? |
| `RR_HOLD_MAX_MIN` | 20 min | À valider : sa "sortie rapide normale" est de combien ? |
| `REVENGE_MAX_GAP_MIN` | 30 min | À valider : son délai normal de re-entry range est de combien ? |

**Note de prudence :** ces ajustements appartiennent au module comportemental (behavior/),
pas à la couche V2 (coherence.js, attention.js...). Les modifier n'impacte pas les flags V2.
Ils doivent être proposés, puis validés, avant modification.

### F3. Préparation au module comportemental avancé

Les exports Binance V0-A constituent la base empirique pour les futures tensions T2
(posture ACTIVE + profil Impulsif/Agressif). Connaître la fréquence réelle du profil
Impulsif/Agressif chez Antonio permet d'anticiper si T2 sera une tension rare ou fréquente
dans son usage cockpit.

**Si V0-A révèle un profil stable Discipliné/Réactif** → T2 sera très rare pour Antonio.
C'est cohérent avec l'architecture. Aucune action requise.

**Si V0-A révèle un profil Impulsif/Agressif sur certaines périodes** → T2 pourrait
se déclencher lors de sessions cockpit en conditions similaires. Information utile pour
calibrer l'attention avant Phase 3 T3-04.

---

## Rapport de synthèse — état V0-A au démarrage

### Ce qui devient calibrable grâce aux exports Binance

| Dimension | Calibrable | Niveau de confiance |
|---|---|---|
| Profil comportemental de référence | ✅ | Fort — déjà établi sur REAL_001–004 |
| Fréquence historique de chaque profil | ✅ | Moyen — nécessite 5+ exports sur périodes différentes |
| Seuils overtrading adaptés à Antonio | ✅ (partiel) | Moyen — données existantes à compléter |
| CV de taille inter-actifs vs intra-actif | ✅ | Fort — REAL_001–004 confirment le pattern |
| Durée de détention "normale" par contexte | ✅ | Moyen — nécessite exports avec contexte marché annoté |
| Bibliothèque de faux positifs personnels | ✅ | Fort — 4 cas documentés, à étendre |
| Comportement sur régimes différents | 🟡 Partiel | Faible → nécessite exports explicitement datés/contextualisés |

### Ce qui reste non calibrable via Binance seul

| Dimension | Pourquoi | Déblocage |
|---|---|---|
| Seuils T1 (`confidence_score × MdS`) | `confidence_score` n'existe pas dans les trades | Sessions moteur V0-B |
| Seuils T4 (`QdR × MdS`) | `QdR` et `MdS` non présents dans les exports | Sessions moteur V0-B |
| Fréquence T3 réelle | `posture` et `need_action` non présents | Sessions moteur V0-B |
| Valeur D-ATT-01 (WINDOW_SIZE) | Soumissions moteur ≠ fréquence de trading | Sessions moteur V0-B |
| Utilité perçue du message T3 | Dimension cognitive / perception | Observation cockpit V0-B |
| Fatigue attentionnelle | Non mesurable hors usage réel du cockpit | Observation cockpit V0-B |

### Prochain type de fichier Binance utile à envoyer

**Priorité 1 — Export ciblé sur une période de range identifiée**

L'actif TAOUSDC sur une période de range dense (oscillation sans tendance forte).
Objectif : calibrer les seuils overtrading et confirmer que le range trading TAOUSDC
est structurellement distinct de l'impulsivité.

Format préféré : Trade History (binance_spot.js) — timestamps précis à la seconde.
Période idéale : 3–8 semaines. Minimum : 50 trades.

**Priorité 2 — Export couvrant le bull run récent (si disponible)**

Période de tendance haussière forte, idéalement fin 2024 ou début 2025.
Objectif : documenter le comportement en tendance et vérifier si le profil change
(moins de range, plus de détentions longues, moins d'overtrading).

**Priorité 3 — Export court post-événement volatil**

Quelques semaines autour d'un événement de volatilité forte (liquidations, news majeure).
Objectif : vérifier si le comportement reste cohérent ou montre des patterns émotionnels.
Ce fichier sera traité avec la note "non représentatif" si les patterns sont aberrants.

---

## Contraintes de ce document

- Aucune modification de code
- Aucune modification des flags V2
- Aucune recalibration de T1/T4 depuis Binance uniquement
- Les exports Binance ne remplacent pas le V0 terrain cockpit (V0-B)
- Ce document est une stratégie — pas un protocole d'exécution automatique

---

*Calibration V0 personnelle — Exports Binance Antonio — Version 1.0 — 2026-05-25*
