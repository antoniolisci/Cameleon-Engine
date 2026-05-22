# Behavior Engine Mapping V1 — Corpus → Moteur comportemental

**Statut :** document de travail — cartographie honnête, pas d'implémentation.
**Date :** 2026-05-22
**Dépend de :** implementation-debts-cognitive-corpus.md · principes-architecture-cognitive.md
**Usage :** référence de décision pour l'implémentation du futur moteur comportemental.

Ce document ne modifie aucun concept. Il ne crée aucun nouveau concept.
Il répond à une question précise : **lequel des 52 concepts peut réellement être activé
par ce que le moteur voit aujourd'hui, et à quelle profondeur ?**

---

## 1. Ce que le payload expose réellement

Inventaire exhaustif des données disponibles dans le moteur comportemental actuel.
Tout ce qui ne figure pas ici est **absent** — et l'absence est une contrainte, pas un détail.

### 1.1 Métriques disponibles (metrics.js)

| Donnée | Précision | Limite |
|---|---|---|
| `totalTrades` | Compte brut | Pas de lisibilité du contexte |
| `buyCount` / `sellCount` | Directionnel | Pas de P&L par trade |
| `avgSize` | Valeur USDT moyenne | Sur-expositions globales seulement |
| `oversizedTradesCount` | Trades > 2× moyenne | Pas de raison derrière |
| `avgTimeBetween` | Délai global en minutes | Biaisé si multi-actifs |
| `avgTimeBetweenSameSymbol` | Délai par symbole (minimum) | Rythme réel le plus rapide uniquement |
| `avgDelayAfterBuy` / `avgDelayAfterSell` | Délai directionnel moyen | Pas de symbole précis |
| `maxSizeCVBySymbol` | CV de taille par symbole | Max uniquement, pas la distribution |
| `hourDist[0..23]` | Distribution horaire UTC | Pas de découpage session |
| `activeHours` | Heures distinctes avec trades | Pas de durée de session |
| `spanDays` | Étendue totale | Pas de découpage en sessions |
| `firstTs` / `lastTs` | Bornes temporelles | Pas de gaps intra-session |
| `dataQuality` | LOW / PARTIAL / HIGH | Fiabilité du dataset |

### 1.2 Patterns détectés (patterns.js)

Cinq patterns binaires, avec intensité :

| Pattern | Signal | Intensité |
|---|---|---|
| `overtrading` | ≥ 5 trades même symbole en 60 min | count (fenêtres déclenchées) |
| `revenge_trading` | SELL → BUY même symbole < 30 min avec taille > 1.5× moy. | count |
| `rapid_reentry` | BUY → SELL < 20 min → BUY < 45 min même symbole | count |
| `size_inconsistency` | CV de taille > 0.5 sur ≥ 5 trades par symbole | cv |
| `loss_chasing` | 3 BUYs consécutifs escaladants (> 1.8× 1er) en 120 min même symbole | count |

### 1.3 Ce qui est structurellement absent

- P&L par trade — **absent** (Binance Spot ne l'exporte pas par trade)
- Contexte de marché au moment de l'entrée — **absent**
- Structure de marché (trend, range, compression) — **absent**
- Raisonnement de l'opérateur — **absent**
- Données de session individualisées — **absent** (tout est une seule série temporelle)
- Données sociales ou externes — **absent**
- Positions ouvertes en cours — **absent** (historique terminé seulement)
- Données multi-exchange ou multi-compte — **absent**

---

## 2. Familles du corpus et leur détectabilité

### 2.1 Directement détectables — inférence nulle

Ces concepts ont un proxy direct dans les patterns ou métriques existants.
La détection est déjà opérante dans le moteur actuel, même sans le nommer ainsi.

| Concept | Signal dans le payload | Mapping pattern |
|---|---|---|
| **Overtrading** | Fréquence excessive même symbole | `overtrading` |
| **Revenge** | SELL → BUY rapide + taille supérieure | `revenge_trading` |
| **Dérive de sizing** | CV élevé de taille par symbole | `size_inconsistency` |
| **Escalade d'engagement** | 3 BUYs consécutifs avec escalade de taille | `loss_chasing` |
| **Surcharge contextuelle** (proxy partiel) | Nombre élevé de symboles distincts + trades interleaved | `overtrading` multi-symboles |

**Limite de cette couche :** le moteur détecte le comportement mais ne nomme pas le concept.
"Overtrading" dans le scoring n'est pas "overtrading" dans le corpus — l'un est un compteur de fréquence, l'autre est une déconnexion entre entrées et lisibilité.

---

### 2.2 Inférence faible — signal indirect mais fiable

Ces concepts ne sont pas détectés directement, mais leur activation laisse une trace
dans les données disponibles. L'inférence est plausible et peu risquée de faux positifs.

| Concept | Signal proxy | Condition de fiabilité |
|---|---|---|
| **Besoin d'action** | Longue période d'inactivité suivie d'une rafale (`overtrading`) | Inactivité anormale détectable via gaps entre trades |
| **Réentrée rapide (impulsivité partielle)** | BUY → SELL → BUY rapide même symbole | `rapid_reentry` — le mécanisme est observé, pas sa cause |
| **Dispersion attentionnelle** | Trades multi-symboles interleaved en fenêtre courte | Co-activation avec surcharge via distribution par symbole |
| **Aversion à la perte** (proxy sortie) | `avgDelayAfterSell` très court vs `avgDelayAfterBuy` | Fermetures précipitées vs positions tenues longtemps |
| **Calme trompeur** | `size_inconsistency` + `revenge_trading` sans `overtrading` | Comportement hétérogène sans signal d'activité excessive |

**Précaution :** ces inférences nécessitent que la condition soit vérifiée explicitement.
L'activation automatique sans seuil précis produira des faux positifs.

---

### 2.3 Inférence moyenne — signal disponible mais bruyant

Ces concepts ont un proxy dans les données, mais celui-ci ne les distingue pas
d'autres concepts adjacents. Le risque de faux positif est réel.

| Concept | Signal proxy | Risque de confusion |
|---|---|---|
| **FOMO** | Entrée sur mouvement déjà avancé | Pas de prix de référence → indistinguable de besoin-action ou impulsivité |
| **Surconfiance** | Élévation globale de sizing sur série de trades | Nécessite P&L pour distinguer série gagnante de sizing structurel |
| **Effet de halo** | Sizing/vitesse anormaux sur le trade suivant X | Nécessite P&L pour identifier "X = bon trade" |
| **Anticipation compulsive** | Entrée avant événement structurel | Pas de données de structure → détection impossible sans market state feed |
| **Biais de récence** | Suractivité sur les symboles les plus récents | Distinguable via historique de fréquence par symbole sur la période |
| **Fatigue décisionnelle** | Activité concentrée sur fin de session (`hourDist`) | Corrélation temporelle valide mais non causale |
| **Illusion de cohérence** | Sizing cohérent mais patterns d'entrée incohérents | Nécessite cross-référence sizing × timing |

---

### 2.4 Inférence forte — absence de données suffisantes

Ces concepts requièrent des données structurellement absentes du payload actuel.
Toute détection en V1 serait spéculative.

| Concept | Donnée manquante |
|---|---|
| **Aversion à la perte** (mécanisme complet) | P&L par trade — hold time comparé gain/perte |
| **Invalidation refusée** | État de la thèse au moment de la sortie — pas de marché |
| **Pression du résultat** | Objectif de session — aucune donnée contextuelle |
| **Contamination inter-session** | Découpage en sessions individuelles |
| **Récupération comportementale** | P&L par session, état avant/après |
| **Illusion de contrôle** | Durée d'exposition à UN actif spécifique (historique complet requis) |
| **Transfert de confiance** | Distinction actif familier / actif nouveau sur historique long |
| **Ancrage sur le prix d'entrée** | Prix de référence ou zone d'ancrage — absent |
| **Fenêtre décisionnelle** | Données de processus décisionnel interne |
| **Conviction tardive** | Prix de départ du mouvement — nécessite market state |
| **Tunnel cognitif** | Lecture de la structure au moment des décisions |
| **Inertie de lecture** | Lecture structurelle active de l'opérateur |
| **Rigidité de thèse** | Accès à la thèse d'entrée vs données contradictoires |
| **Biais de confirmation** | Sélection d'information — pas observable dans les trades |
| **Saturation attentionnelle** | Densité d'info dans un seul contexte — pas de comportement observable |

---

### 2.5 Non détectables en V1 — coaching only

Ces concepts décrivent des états qui ne laissent pas de trace mesurable dans les trades.
Ils sont valides dans le corpus, utilisables dans le coaching contextuel,
mais ne peuvent jamais déclencher une modulation basée sur les données.

**Concepts individuels non observables :**
- `observation`, `retenue`, `friction`, `alignement`, `désalignement`
- `inertie-lecture`, `rigidité-thèse`, `biais-confirmation`
- `tunnel-cognitif`, `saturation-attentionnelle`
- `illusion-contrôle` (sans historique long par actif)
- `pression-résultat`, `récupération-comportementale`

**Concepts collectifs (Lot 5A) :**
- `narratif-dominant`, `consensus-apparent`, `contamination-narrative`
- `états-collectifs-stables`, `validation-sociale`

Ces cinq concepts nécessitent des données sociales / collectives absentes du payload individuel.
En V1, ils ne peuvent apparaître que dans le coaching contextuel global (tonalité de lecture),
jamais comme modulations déclenchées par les données de l'opérateur.

**Concepts de structure de marché (Lots 3 et 5B) :**
- `compression`, `range-long` — états du marché, pas de l'opérateur
- `dominance-macro-local`, `désordre-structurel` — requièrent un feed de structure de marché

Ces concepts sont hors périmètre du moteur comportemental qui lit **uniquement les trades**.
Leur activation éventuelle nécessiterait une intégration avec le moteur principal (market-state.js).
Ce branchement n'est pas dans le périmètre V1.

---

## 3. Distinctions à fusionner en V1

Ces fusions sont recommandées pour V1. Elles ne détruisent pas les concepts — elles reconnaissent
que le moteur ne peut pas encore produire l'effet cockpit différencié.

### 3.1 Inertie de lecture + Rigidité de thèse → "Lecture en retard"

**Justification :** les deux produisent le même signal observable dans les données
(maintien d'une lecture qui ne correspond plus au contexte). Sans accès au processus interne,
le moteur voit la même chose.

**Coaching V1 unifié :** invitation à reconsulter le contexte récent avant l'entrée.
La nuance (regarder ce qui a changé vs reconstruire sur ce qu'on voit) sera adressée en V2
quand des marqueurs de différenciation seront identifiés.

### 3.2 Besoin d'action + Impulsivité + FOMO + Anticipation compulsive → "Entrée précipitée"

**Justification :** les quatre produisent une entrée sur contexte insuffisamment validé.
Le moteur voit une entrée rapide ou prématurée — il ne voit pas le mécanisme interne.

**Coaching V1 unifié :** invitation à vérifier la validité du contexte avant l'entrée.
La différenciation par mécanisme (impulsivité = délai quasi-nul, FOMO = mouvement déjà avancé,
besoin-action = inactivité préalable, anticipation = entrée avant confirmation) sera adressée
en V2 avec des seuils spécifiques par marqueur.

**Note :** `rapid_reentry` dans le moteur est le meilleur proxy de ce cluster en V1.
L'attribution "entrée précipitée" sur ce seul pattern est honnête.

### 3.3 Illusion de contrôle + Transfert de confiance → "Analyse raccourcie"

**Justification :** les deux produisent une certitude élevée sur un contexte qui ne la justifie pas.
Sans historique long par actif, la distinction est impossible.

**Coaching V1 unifié :** invitation à ralentir l'analyse sur les actifs non-core.

### 3.4 Surconfiance + Effet de halo → "Sizing élevé non justifié"

**Justification :** sans P&L par trade, il est impossible d'associer l'élévation de sizing
à une série gagnante (surconfiance) ou à un trade précédent réussi (effet de halo).

**Coaching V1 unifié :** surveillance du sizing sur les séquences récentes.

---

## 4. Distinctions à conserver

Ces distinctions produisent des effets cockpit différents même en V1.
Les fusionner serait une perte de précision sans gain de simplicité.

### 4.1 Overtrading vs Besoin d'action

L'overtrading est détectable (pattern existant). Le besoin d'action est son précurseur.
En V1, détecter l'un ne signifie pas que l'autre est actif — mais la séquence est informative.
**Conserver les deux comme états distincts dans le coaching** : overtrading = correctif,
besoin-action = préventif (si détectable via gap prolongé avant la rafale).

### 4.2 Aversion à la perte vs Revenge trading

Ces deux ont des outputs comportementaux différents :
- `revenge_trading` = escalade après SELL (pattern détectable)
- `aversion à la perte` = tenir les perdantes (proxy via `avgDelayAfterSell` / hold time comparé)

Les confondre produirait un coaching erroné. Conserver la distinction même si l'inférence
pour l'aversion à la perte reste partielle.

### 4.3 Surcharge contextuelle vs Dispersion attentionnelle

La surcharge est la cause (observable : nombre de symboles simultanés), la dispersion est l'effet
(observable : profondeur réduite sur chaque actif — proxy via trades interleaved).
**Implémenter la séquence** : surcharge détectée en premier → si également overtrading multi-symboles → annotation dispersion.
(cf. dette D4 dans implementation-debts-cognitive-corpus.md)

### 4.4 Dérive de sizing vs Escalade d'engagement

La dérive est globale (CV élevé toutes directions), l'escalade est directionnelle (BUYs croissants).
Les deux ont des patterns distincts dans le moteur (`size_inconsistency` vs `loss_chasing`).
Le coaching différencié est déjà en place — le conserver.

---

## 5. Modulations cockpit réalistes sans faux positifs

Ce tableau liste uniquement les modulations qui peuvent être activées avec un seuil précis
sur données réelles. Aucune modulation spéculative.

| Modulation | Déclencheur | Concept proxied | Niveau de confiance |
|---|---|---|---|
| Coaching "suractivité" | `overtrading` (count ≥ 3) | overtrading / besoin-action | ÉLEVÉ |
| Coaching "réentrée impulsive" | `revenge_trading` (count ≥ 1) | revenge / aversion-perte | ÉLEVÉ |
| Coaching "sizing instable" | `size_inconsistency` (cv ≥ 0.5) | dérive-sizing | ÉLEVÉ |
| Coaching "escalade" | `loss_chasing` (count ≥ 1) | escalade-engagement / aversion-perte | ÉLEVÉ |
| Coaching "réentrée" | `rapid_reentry` (count ≥ 1) | impulsivité / anticipation-compulsive | ÉLEVÉ |
| Annotation "multi-actifs" | symbols.length > 5 + overtrading | surcharge contextuelle | MOYEN |
| Annotation "rythme global" | `avgTimeBetweenSameSymbol` < 15 min | suractivité | MOYEN |
| Annotation "concentration horaire" | `activeHours` ≤ 5 | fenêtre décisionnelle contrainte | FAIBLE |
| Coaching "sizing élevé" | `oversizedTradesCount` ≥ 3 | dérive-sizing / surconfiance proxy | MOYEN |

**Modulations à ne pas implémenter en V1 (risque de faux positif élevé) :**
- Coaching sur FOMO sans market state feed
- Coaching sur surconfiance sans P&L
- Toute modulation sur les concepts collectifs (Lot 5A) à partir du payload individuel
- Coaching sur calme-trompeur sans vérification préalable des marqueurs comportementaux
  (voir dette D7 — à brancher sur désalignement/cohérence, pas sur volatilité)

---

## 6. Concepts "coaching only" — intégrables sans détection

Ces concepts peuvent alimenter le coaching textuel de façon contextuelle —
c'est-à-dire sans être déclenchés par les données, mais comme enrichissement
de la lecture narrative d'un profil détecté.

**Exemples d'utilisation valide :**

- `besoin-action` : mentionnable dans le coaching d'un profil `overtrading` sans l'avoir détecté directement.
  "Cette fréquence peut refléter une pression à agir plutôt qu'une lecture."

- `fatigue-décisionnelle` : mentionnable si l'activité est concentrée en fin de période.
  Proxy : `hourDist` orienté vers les dernières heures de session.

- `aversion-perte` : mentionnable dans le coaching de `revenge_trading`.
  "L'entrée rapide après une vente peut être une réponse à la perte difficile à accepter."

- `retenue`, `observation` : utilisables comme lectures Caméléon génériques.
  Non déclenchés par pattern — proposés comme attitude générale selon le profil.

**Règle :** un concept coaching-only est évoqué en tant que possibilité, jamais comme diagnostic.
Le moteur ne dit jamais "vous avez besoin d'action" — il peut dire "ce pattern peut
parfois refléter un inconfort de l'inaction". La modalité est systématiquement interrogative.

---

## 7. Interactions simultanées implémentables en V1

Parmi les 5 interactions documentées dans implementation-debts-cognitive-corpus.md (section 2) :

### 7.1 Surcharge contextuelle + Dispersion attentionnelle (2B) — FAISABLE

**Signal :** `overtrading` sur plusieurs symboles distincts (`triggeredSymbols.size` > 2)
combiné à des trades interleaved entre symboles dans la même fenêtre.

**Modulation :** coaching plus fort que la somme des deux modulations individuelles.
La boucle d'aggravation mutuelle justifie une friction plus forte.

**Condition :** ce n'est pas l'implémentation de la boucle elle-même, c'est la reconnaissance
que la co-activation mérite un signal plus fort.

### 7.2 Besoin d'action + Dominance macro (2C) — NON FAISABLE V1

Requiert le feed market-state. Reporter à V2 avec intégration moteur principal.

### 7.3 Inertie de lecture + Désordre structurel (2A) — NON FAISABLE V1

Requiert à la fois des données de lecture opérateur et market-state. Reporter à V2.

### 7.4 Inertie de lecture + Narratif dominant (2D) — NON FAISABLE V1

Requiert données collectives absentes du payload individuel. Hors périmètre V1.

### 7.5 Fatigue décisionnelle + Désordre structurel (2E) — NON FAISABLE V1

Requiert market-state. Reporter à V2.

**Bilan interactions V1 :** une seule interaction réellement implémentable (2B).
Les quatre autres dépendent de données absentes.

---

## 8. Séquences causales à implémenter (dette D4)

Les trois paires cause-effet documentées dans implementation-debts-cognitive-corpus.md
ont des implications directes pour V1.

### 8.1 Besoin d'action → Overtrading

- **Détection préventive** (besoin-action) : gap prolongé avant une rafale de trades.
  Signal candidat : période d'inactivité > Xh suivie d'un trigger `overtrading`.
  Nécessite seuillage sur `avgTimeBetween` global avant la fenêtre d'overtrading.
- **Détection corrective** (overtrading) : déjà implémentée.
- **Règle d'activation** : les deux modulations ne s'activent pas simultanément.
  La détection préventive vient d'abord. Si elle échoue → détection corrective.

### 8.2 Aversion à la perte → Invalidation refusée

- **Aversion** : proxy détectable via `avgDelayAfterSell` court vs positions BUY tenues longtemps.
  Mais sans P&L : impossible de distinguer fermeture précipitée d'une position gagnante
  vs maintien d'une perdante. Signal trop bruité pour V1.
- **Invalidation refusée** : non détectable sans état des positions ouvertes.
- **Décision V1** : reporter. L'aversion à la perte sera mentionnable dans le coaching
  du `revenge_trading` uniquement, comme possibilité.

### 8.3 Surcharge contextuelle → Dispersion attentionnelle

- **Surcharge** : proxy via multi-symboles actifs + nombre élevé de trades interleavés.
  Marqueur concret : `symbols.length` > N sur la période (N à calibrer sur données réelles).
- **Dispersion** : proxy via rapidité des transitions entre symboles différents dans le flux.
  Marqueur : trades alternant symboles dans des fenêtres très courtes.
- **Séquence V1** : détecter surcharge structurellement (count symbols) → si également
  overtrading multi-symboles → annotation dispersion active.

---

## 9. Traitements spéciaux

### 9.1 Calme trompeur — branchement comportemental uniquement

Comme documenté dans la dette D7 : **calme-trompeur est un concept opérateur, pas marché**.
En V1, il est activable uniquement si les conditions suivantes sont simultanément vraies :
- Profil Discipliné (score ≥ 80) — calme apparent
- Au moins un pattern secondaire détecté (`size_inconsistency` ou `revenge_trading`)
  à seuil bas

**Ne jamais brancher sur des signaux de volatilité faible ou contexte de marché calme.**

### 9.2 Concepts Lot 5A — usage contextuel uniquement

Les cinq concepts collectifs (`narratif-dominant`, `consensus-apparent`,
`contamination-narrative`, `états-collectifs-stables`, `validation-sociale`)
ne peuvent pas être activés par les données du payload individuel en V1.

Leur usage possible en V1 : dans le coaching narratif global (texte d'introduction ou
conclusion), en tant que contexte général "le marché peut être dans un état collectif
qui renforce ces comportements". Jamais comme diagnostic individuel.

### 9.3 dataQuality.level et modulations

- `LOW` : aucune modulation comportementale basée sur les concepts. Le corpus n'est pas activé.
- `PARTIAL` : seules les modulations de niveau ÉLEVÉ sont activables (les 5 patterns directs).
  Les inférences faibles/moyennes sont désactivées.
- `HIGH` : toutes les modulations éligibles selon ce document.

---

## 10. Récapitulatif — Carte de détectabilité

```
DIRECTEMENT DÉTECTABLE — 5 concepts
────────────────────────────────────
overtrading          → pattern overtrading
revenge              → pattern revenge_trading
dérive-sizing        → pattern size_inconsistency
escalade-engagement  → pattern loss_chasing
réentrée rapide      → pattern rapid_reentry

INFÉRENCE FAIBLE — 5 concepts
──────────────────────────────
besoin-action        → gap + overtrading en rafale
impulsivité          → rapid_reentry (proxy partiel)
dispersion attent.   → overtrading multi-symboles
aversion-perte       → avgDelayAfterSell (partiel)
calme-trompeur       → profil Discipliné + pattern secondaire

INFÉRENCE MOYENNE — 7 concepts
────────────────────────────────
FOMO                 → entrée rapide (mais indistinct)
surconfiance         → sizing élevé (sans P&L : bruité)
biais-récence        → suractivité sur symboles récents
fatigue décisionnelle→ hourDist (corrélation, pas causalité)
illusion-cohérence   → sizing cohérent + patterns incohérents

COACHING ONLY — 16 concepts
──────────────────────────────────────────────────────
observation, retenue, friction, alignement, désalignement
récupération-comport., pression-résultat, contamination-inter-session
inertie-lecture, rigidité-thèse, biais-confirmation
tunnel-cognitif, saturation-attentionnelle
invalidation-refusée, ancrage-prix, fenêtre-décisionnelle

HORS PÉRIMÈTRE PAYLOAD COMPORTEMENTAL — 19 concepts
─────────────────────────────────────────────────────
Lot 5A collectifs (×5) : narratif-dominant, consensus-apparent,
  contamination-narrative, états-collectifs-stables, validation-sociale
Lot 5B marché (×2)     : dominance-macro-local, désordre-structurel
Lot 3 marché (×2)      : compression, range-long
illusion-contrôle      : historique long par actif requis
transfert-confiance    : distinction familier/nouveau requis
conviction-tardive     : market-state requis
anticipation compuls.  : market-state requis (version complète)
aversion-perte         : P&L requis (version complète)
surconfiance           : P&L requis
effet-halo             : P&L requis
illusion-cohérence     : cross-référence sizing × timing requis
```

**Total : 5 + 5 + 7 + 16 + 19 = 52 concepts cartographiés.**

---

## 11. Contraintes absolues de ce document

- Aucun concept nouveau.
- Aucune réécriture du corpus.
- Aucun pseudo-système IA inférant des états non observables.
- Les fusions recommandées sont des décisions d'implémentation, pas des modifications du corpus.
- Ce document est relu avant tout chantier d'implémentation comportementale,
  conjointement avec implementation-debts-cognitive-corpus.md.

---

*Corpus stable à 52 concepts — 2026-05-22.*
*Ce document est la cartographie V1. Il sera révisé en V2 quand les données absentes
(P&L par trade, market state feed, découpage sessions) seront disponibles.*
