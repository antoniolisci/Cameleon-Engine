# Caméléon Engine — Mémoire Structurée du Projet

**Date de création :** 2026-06-01
**Statut :** Document vivant — mise à jour après chaque campagne de validation

**Principe directeur :**
Fichier → Extraction → Connaissances → Normalisation → Analyse → Mémoire → Adaptation

**Boucle officielle :**
Situation rencontrée → Compréhension → Adaptation → Mémoire

---

## Table des matières

1. [Import Memory](#import-memory)
2. [Behavior Memory](#behavior-memory)
3. [Diagnostic Memory](#diagnostic-memory)
4. [Calibration Memory](#calibration-memory)
5. [Architecture Memory](#architecture-memory)
6. [Zones Fragiles](#zones-fragiles)
7. [Recommandations avant B1-B19](#recommandations-avant-b1-b19)
8. [État actuel des familles de connaissances](#état-actuel)

---

## Import Memory

---

### IMP-001 — CSV Binance Trade History (format français)

**Famille :** Import
**Situation rencontrée :** Import des 5 fichiers CSV Binance Spot Trade History locale FR — corpus V0-A (1 semaine → 1 an)

**Symptôme observé :** Premier test de compatibilité complète sur données réelles.

**Compréhension :**
Le format d'export Binance FR (`historique_des_transactions`) est stable et constant sur tous les fichiers testés. Caractéristiques :
- Encodage : UTF-8 avec BOM (`EF BB BF`)
- Séparateur : virgule
- En-tête standard : `Durée,Paire,Côté,Prix,Exécuté,Montant,Frais`
- Format date : `YY-MM-DD HH:MM:SS` (ex : `26-05-24 07:01:57`) — 2 chiffres pour l'année
- Format quantité : nombre + suffixe asset collé (ex : `1.4886TAO`, `90.9FET`, `0.00019BTC`)
- Pas d'orderId : les exports Trade History n'en contiennent pas

**Adaptation appliquée :**
- `normalizeKey()` : lowercase + NFD decomposition + strip diacritiques + strip BOM
- `parseDate()` : regex shortYear `/^(\d{2})-(\d{2})-(\d{2})\s(\d{2}:\d{2}:\d{2})$/` → reconstruit `20${YY}-${MM}-${DD}T${HH:MM:SS}Z`
- `parseNum()` : extrait le préfixe numérique via `/^([\d.]+)/` — ignore le suffixe asset
- Tables d'alias : `ALIASES_DATE`, `ALIASES_SYMBOL`, `ALIASES_SIDE`, `ALIASES_PRICE`, `ALIASES_QTY`, `ALIASES_QUOTE`, `ALIASES_FEE`

**Résultat obtenu :** 7/7 colonnes reconnues sur les 5 fichiers V0-A. Zéro erreur d'encodage, zéro rejet anormal.

**Statut :** ✅ Résolu
**Réutilisation future :** Référence de base pour tout nouveau format CSV. Comparer l'en-tête observé à ce mapping avant d'ajouter de nouveaux alias.

**Fichiers concernés :**
`src/js/behavior/import/parser.js` · `src/js/behavior/normalize/canonical.js` · `src/js/behavior/normalize/mappers/binance_order.js`

**Commit associé :** Corpus V0-A validé 2026-05-25

---

### IMP-002 — Frais multi-devise dans un même fichier (base / quote / BNB)

**Famille :** Import
**Situation rencontrée :** Dans le même fichier V0-A, la colonne `Frais` contient trois types de valeurs selon la ligne : asset de base, asset de cotation, ou BNB.

**Symptôme observé :** `0.0014886TAO` (base), `0.21546USDC` (quote), `0.000012BNB` — dans le même corpus.

**Compréhension :** `parseNum()` extrait correctement la valeur numérique dans les trois cas. Le suffixe asset est ignoré. La valeur de frais stockée est un nombre pur — non comparable entre lignes si la devise change. Limitation acceptable pour l'analyse comportementale V1 : ce qui compte est la cohérence comportementale, pas la valeur absolue des frais.

**Adaptation appliquée :** Limitation documentée. Suffixe ignoré intentionnellement.

**Résultat obtenu :** Aucun impact négatif sur l'analyse comportementale.

**Statut :** ✅ Résolu par conception — limitation connue
**Réutilisation future :** Si les frais deviennent un axe d'analyse, ajouter un champ `fee_asset` dans le trade canonique pour distinguer la devise.

**Fichiers concernés :** `src/js/behavior/normalize/canonical.js`

---

### IMP-003 — Colonnes vides en fin de ligne

**Famille :** Import
**Situation rencontrée :** Certaines lignes CSV V0-A se terminent par des champs vides : `...0.0014886TAO,,,`

**Symptôme observé :** Aucun crash, aucun rejet.

**Compréhension :** Le parser lenient ignore les colonnes sans alias correspondant. Ce comportement est correct et intentionnel — les colonnes sans mapping sont silencieusement ignorées.

**Adaptation appliquée :** Aucune — comportement déjà robuste par conception.

**Résultat obtenu :** Zéro impact.

**Statut :** ✅ Résolu par conception
**Réutilisation future :** Maintenir le mode lenient pour tout futur format multiplateforme. Ne jamais rejeter une ligne pour des colonnes supplémentaires inconnues.

**Fichiers concernés :** `src/js/behavior/import/parser.js`

---

### IMP-004 — Hétérogénéité de devise intra-fichier (BTCEUR + USDC)

**Famille :** Import
**Situation rencontrée :** Fichiers 6_mois et 1_an du corpus V0-A contiennent des trades `BTCEUR` aux côtés de trades libellés en USDC.

**Symptôme observé :** La colonne `Montant` contient des valeurs en EUR pour les lignes BTCEUR et en USDC pour le reste. Le parser extrait les deux sans distinction.

**Compréhension :** Le pipeline actuel traite `quote_value` comme un nombre pur sans devise. Les métriques comportementales qui agrègent ce champ comparent EUR et USDC dans la même distribution — hétérogénéité non détectée. La devise est implicite dans le symbole, pas dans les colonnes.

**Adaptation appliquée :** Limitation documentée. Aucune correction en Phase 3 (impact marginal sur V0-A — peu de lignes BTCEUR).

**Résultat obtenu :** Impact marginal constaté. Patterns comportementaux non affectés significativement sur ce corpus.

**Statut :** ⚠️ À surveiller — s'intensifie si proportion de paires non-USDC augmente
**Réutilisation future :** Pour tout dataset multi-devise : détecter la monnaie de cotation via le symbole et normaliser avant agrégation, ou ajouter un flag `mixed_quote_currency` dans `dataQuality`.

**Fichiers concernés :** `src/js/behavior/normalize/canonical.js` · `src/js/behavior/analytics/metrics.js`

---

### IMP-005 — CASE_001 : superscript ² dans les noms de colonnes

**Famille :** Import
**Situation rencontrée :** Export Binance Order History en français — la colonne `Exécuté²` (U+00B2) n'était pas reconnue.

**Symptôme observé :** `normalizeKey('Exécuté²')` produisait `execute` au lieu de `execute2`. Colonne non reconnue → quantité = 0 → rejet des lignes.

**Compréhension :** Binance FR utilise parfois `²` (superscript, U+00B2) comme suffixe de désambiguïsation quand deux colonnes ont le même nom après normalisation (comportement SheetJS). La normalisation NFD standard ne couvre pas ce cas — `²` n'est pas un diacritique, c'est un caractère distinct.

**Adaptation appliquée :**
- `normalizeKey()` : ajout du remplacement `²` → `2` avant les autres normalisations
- `ALIASES_QTY` : ajout de `execute2` comme alias valide

**Résultat obtenu :** 30 FILLED reconnus / 31 ignorés (lignes hors périmètre) — comportement correct.

**Statut :** ✅ Résolu
**Réutilisation future :** Tout export Binance FR avec colonnes dupliquées peut produire ce suffixe. La règle `²→2` dans `normalizeKey()` couvre tous les cas futurs. Tester systématiquement les colonnes reconnues/orphelines au premier import de tout nouveau format.

**Fichiers concernés :** `src/js/behavior/normalize/canonical.js` · `src/js/behavior/normalize/mappers/binance_order.js`

---

### IMP-006 — Garde 5 MB et performance

**Famille :** Import
**Situation rencontrée :** Mesure des tailles réelles des fichiers Binance sur le corpus V0-A.

**Symptôme observé :** Aucun fichier n'approche la limite. Le plus grand (1_an, 1 435 trades) = 101 Ko, soit 2 % de la garde.

**Compréhension :** Les exports CSV Binance sont très compacts. La garde 5 MB ne se déclenchera pas sur des périodes allant jusqu'à 2–3 ans. Les PDF et XLSX futurs pourraient être plus verbeux.

**Adaptation appliquée :** Garde en place et fonctionnelle. Parsing < 200 ms sur le fichier le plus grand.

**Résultat obtenu :** Aucun problème de performance sur le corpus V0-A.

**Statut :** ✅ Résolu par conception
**Réutilisation future :** Documenter la taille observée lors de chaque nouveau format validé. La garde reste utile pour les formats futurs (PDF, XLSX multi-feuilles).

**Fichiers concernés :** `src/js/behavior/import/parser.js`

---

## Behavior Memory

---

### BHV-001 — Grid-grouper : absorption élevée sur périodes courtes

**Famille :** Comportement
**Situation rencontrée :** Import de la période 1_semaine (26 trades bruts) — style carnet/DCA sur TAOUSDC

**Symptôme observé :** 25 des 26 trades bruts absorbés par le grid-grouper → 5 événements synthétiques. Taux d'absorption = 96 %.

**Compréhension :** Le grid-grouper regroupe les fills successifs d'un même ordre fractionné en un événement unique. Sur une période courte (3 jours) avec un seul actif, la quasi-totalité des trades sont des fills partiels d'ordres grille. Ce comportement est architecturalement correct.

Taux d'absorption observés sur le corpus V0-A :

| Période | Trades bruts | Post-grouper | Absorption |
|---|---|---|---|
| 1_semaine | 26 | 5 | 96 % |
| 1_mois | 33 | 12 | 75 % |
| 3_mois | 255 | 212 | 17 % |
| 6_mois | 606 | 501 | 17 % |
| 1_an | 1 435 | 1 000 | 38 % |

Le taux de 17 % sur 3_mois/6_mois semble être le plancher naturel de ce style de trading. La remontée à 38 % sur 1_an s'explique par la composition temporelle : le fichier 1_an contient la période 1_semaine (96 %) en son sein.

**Adaptation appliquée :** Aucune. Comportement validé.

**Résultat obtenu :** Score live 90 / Discipliné sur 1_semaine — cohérent avec un style range discipliné sur courte période.

**Limite identifiée :** Un score sur 5 événements synthétiques n'a pas la même fiabilité statistique qu'un score sur 500. Le moteur ne quantifie pas cette différence — la mention "Analyse partielle" est qualitative, non chiffrée.

**Statut :** ✅ Comportement correct — ⚠️ Limite de confiance non quantifiée
**Réutilisation future :** En dessous de ~20 trades post-grouper, traiter le score comme "indicatif uniquement". Seuil à formaliser avant V2 production.

**Fichiers concernés :** `src/js/behavior/analytics/grid-grouper.js` · `src/js/behavior/ui/behavior-view.js`

---

### BHV-002 — Score plancher ~15 sur datasets multi-actifs (PS-01)

**Famille :** Comportement
**Situation rencontrée :** Corpus V0-A 3_mois (8 symboles) → score 15 / "Agressif". Même phénomène sur REAL_001 et REAL_004.

**Symptôme observé :** CV global des tailles de position = 380 % sur 3_mois → pattern `size_inconsistency` en sévérité `high` → pénalité ~25 pts → score chute vers 15, même sans autre anomalie comportementale réelle.

**Compréhension :** La mesure originale calculait un CV global en mélangeant tous les trades de tous les actifs. Un trader qui alloue 200 $ sur BTC (0.00019 BTC) et 50 $ sur FET (90.9 FET) produit un CV global mécaniquement élevé — non pas par incohérence comportementale, mais par différenciation d'allocation par actif. Le CV global confond variabilité inter-symboles (règle d'allocation normale) et variabilité intra-symbole (dérive réelle).

**Adaptation appliquée (commit ff93e2a) :**
- `metrics.js` calculait déjà `maxSizeCVBySymbol` — CV maximum parmi les symboles ayant ≥ 3 trades
- `patterns.js` `detectSizeInconsistency()` modifié : utilise `maxSizeCVBySymbol` en priorité, fallback CV global si aucun symbole n'atteint le seuil minimum

**Résultat obtenu :** Sur mono-actif : aucun changement. Sur multi-actifs : scores identiques avant/après sur les 5 datasets V0-A — deux causes : CV intra-symbole authentiquement élevé pour cet opérateur, et plafond de pénalités à 65 pts absorbant les réductions. La correction est architecturalement juste même si l'impact est invisible sur ce dataset (cohérence metrics.js / patterns.js rétablie). Tables terrain renseignées dans `docs/validation/ps-01-size-inconsistency-by-symbol.md` — commit `7b91341`.

**Limite résiduelle :** `SIZE_MIN_TRADES_PER_SYMBOL = 3` — un CV calculé sur 3 trades reste fragile. Le descriptif UI réfère toujours à la moyenne globale, pas par symbole (acceptable V1).

**Statut :** ✅ CLÔTURÉ — correction appliquée et validée terrain V0-A (commit `7b91341`)
**Réutilisation future :** Le CV par symbole est le standard pour tout futur développement de métriques de taille. Ne jamais calculer de CV global sur un dataset multi-actifs sans segmentation préalable.

**Fichiers concernés :** `src/js/behavior/analytics/patterns.js` (`detectSizeInconsistency()`) · `src/js/behavior/analytics/metrics.js` (`computeMaxSizeCVBySymbol()`)

**Commit associé :** `ff93e2a`

---

### BHV-003 — Score non-monotone sur fichiers cumulatifs

**Famille :** Comportement
**Situation rencontrée :** Corpus V0-A cumulatif — scores observés : 3_mois = 15, 6_mois = 30, 1_an = 25.

**Symptôme observé :** Une période plus longue (6_mois) produit un score plus élevé que la sous-période incluse en elle (3_mois). Contre-intuitif pour un utilisateur.

**Compréhension :** Les fichiers V0-A sont cumulatifs et antichronologiques. Le fichier 6_mois contient les 3 mois récents (identiques au fichier 3_mois) plus les 3 mois précédents. Si ces 3 mois plus anciens étaient comportementalement plus stables, leur ajout dilue les patterns récents et remonte le score. Ce n'est pas un bug — c'est la conséquence de scorer un agrégat plat sans segmentation temporelle interne. Le CV confirme la dilution : 380 % (3_mois) → 374 % (6_mois) → 277 % (1_an).

**Adaptation appliquée :** Aucune. Limitation architecturale documentée.

**Résultat obtenu :** La lecture "15 sur 3_mois, 30 sur 6_mois" signifie réellement que les 3 derniers mois étaient plus erratiques que les 3 mois précédents. Information utile mais non présentée comme telle.

**Statut :** ⚠️ À surveiller — peut créer de la défiance utilisateur
**Réutilisation future :** Pour B1-B19 : expliquer aux opérateurs que les scores sur fenêtres différentes ne sont pas directement comparables si les fichiers sont cumulatifs. La segmentation temporelle interne est une dette architecturale post-V0.

**Fichiers concernés :** `src/js/behavior/analytics/scoring.js`

---

### BHV-004 — Overtrading : signal réel et proportionnel

**Famille :** Comportement
**Situation rencontrée :** Corpus V0-A — mesure de la progression des fenêtres overtrading sur 5 périodes.

**Symptôme observé :** 0 → 0 → 6 → 13 → 46 fenêtres overtrading (1_semaine → 1_mois → 3_mois → 6_mois → 1_an).

**Compréhension :** La progression suit le volume de trades post-grouper (5, 12, 212, 501, 1 000). Le taux relatif fenêtres/trades reste approximativement constant (~2–5 %). Ce signal n'est pas du bruit — il suit la densité d'activité avec cohérence. C'est le résultat le plus fiable de l'ensemble du corpus V0-A.

**Limite identifiée :** La pondération overtrading (25 % du score) ne distingue pas la fréquence relative de la fréquence absolue. 6 fenêtres sur 212 trades (2,8 %) et 46 fenêtres sur 1 000 trades (4,6 %) ont une signification comportementale différente mais des impacts sur le score comparables.

**Adaptation appliquée :** Aucune. Comportement correct validé.

**Résultat obtenu :** Signal proportionnel et cohérent dans le temps.

**Statut :** ✅ Signal valide — ⚠️ Pondération absolue vs relative à clarifier
**Réutilisation future :** Pour B1-B19, noter la fréquence relative (fenêtres/trades) en plus du compte absolu. Servira à calibrer la pondération en Phase 3/4.

**Fichiers concernés :** `src/js/behavior/analytics/patterns.js` · `src/js/behavior/analytics/scoring.js`

---

### BHV-005 — Escalade de position : signal individuel le plus fiable

**Famille :** Comportement
**Situation rencontrée :** Corpus V0-A — escalade détectée sur 3_mois, 6_mois, 1_an ; absente sur 1_semaine et 1_mois.

**Symptôme observé :** 8 séquences (3_mois) → 16 (6_mois) → 16 (1_an). Stagnation sur la période la plus ancienne — à investiguer.

**Compréhension :** L'escalade (3 BUY consécutifs, taille croissante ≥ +180 % en 120 min) nécessite un volume minimal de trades pour se déclencher. Son absence sur les courtes périodes et sa persistance sur les trois longues périodes lui donnent de la crédibilité comme comportement ancré, pas comme anomalie ponctuelle.

**Adaptation appliquée :** Aucune. Signal le plus fiable identifié.

**Résultat obtenu :** Risque dominant persistant sur toutes les longues périodes — cohérent dans le temps sur le corpus V0-A.

**Statut :** ✅ Signal confirmé — stagnation 6_mois → 1_an à investiguer
**Réutilisation future :** Pour tout opérateur B1-B19, l'escalade persistante sur 3 périodes consécutives est un comportement ancré, pas une anomalie. C'est le premier pattern à vérifier sur les données longue durée.

**Fichiers concernés :** `src/js/behavior/analytics/patterns.js`

---

### BHV-006 — Style détecté multi-échelle (DCA → Swing → Range/Carnet)

**Famille :** Comportement
**Situation rencontrée :** Corpus V0-A — même opérateur, même pipeline — trois styles distincts selon la profondeur temporelle.

**Symptôme observé :** DCA (1_semaine) → Swing (1_mois) → Range/Carnet (3_mois, 6_mois, 1_an).

**Compréhension :** Le style n'est pas calculé explicitement comme un régime. Il émerge de métriques qui se comportent différemment selon l'échelle temporelle : `avgHoldTime`, `directionalRatio`, `tradeFrequency`, `delayAfterBuy` convergent naturellement vers des profils distincts à des profondeurs différentes. Ce n'est pas une architecture explicitement conçue pour détecter des régimes — c'est une propriété émergente.

Cette lecture multi-échelle est l'un des résultats les plus inattendus et les plus utiles du corpus V0-A.

**Adaptation appliquée :** Aucune. Propriété émergente validée.

**Résultat obtenu :** Lecture de trajectoire de style utilisateur cohérente avec l'intuition comportementale.

**Statut :** ✅ Propriété émergente validée
**Réutilisation future :** Pour B1-B19, documenter le style détecté sur chaque période importée. La variation de style selon la profondeur est une information à valoriser dans une future interface — ne pas la traiter comme une incohérence du moteur.

**Fichiers concernés :** `src/js/behavior/analytics/metrics.js` · `src/js/behavior/analytics/scoring.js`

---

### BHV-007 — CV tailles sur faible volume : statistique sans sens comportemental

**Famille :** Comportement
**Situation rencontrée :** CV 64 % calculé sur 5 trades synthétiques (post-grouper) sur la période 1_semaine — pattern "Tailles incohérentes" potentiellement déclenché.

**Symptôme observé :** Le moteur peut déclencher un pattern sur 5 événements avec la même autorité visuelle que sur 1 000 événements.

**Compréhension :** Un CV calculé sur 5 valeurs a un intervalle de confiance très large — il n'est pas statistiquement significatif. Le moteur ne conditionne pas le déclenchement d'un pattern à la signification statistique de la mesure. Il calcule et conclut, quel que soit le volume sous-jacent.

Ce problème est distinct de BHV-002 (PS-01) : BHV-002 concerne la mesure elle-même (CV global vs par symbole) ; BHV-007 concerne le seuil minimal de volume pour que toute mesure de CV soit informationnellement valide.

**Adaptation appliquée :** Aucune correction directe. Limitation documentée.

**Résultat obtenu :** Score 90 sur 5 trades — valeur produite par le calcul, mais intervalle de confiance trop large pour être actionnable avec la même autorité qu'un score sur 500 trades.

**Statut :** ⚠️ À surveiller — seuil minimal de confiance à définir
**Réutilisation future :** Formaliser un seuil : en dessous de N trades post-grouper (estimé : 20), le CV tailles est non-informatif. À traiter comme dette avant V2 production.

**Fichiers concernés :** `src/js/behavior/analytics/patterns.js` · `src/js/behavior/analytics/scoring.js`

---

## Diagnostic Memory

---

### DGN-001 — Bug session-score : pipeline live ≠ pipeline sessions

**Famille :** Diagnostic
**Situation rencontrée :** Phase 3 V0-A — après sauvegarde de deux sessions (1_an = 25, 1_semaine = 90), le score moyen affiché dans la synthèse = 28 au lieu de 58.

**Symptôme observé :** Session 1_semaine affichée à 90 pendant l'import → rescorée à ~31 dans la synthèse sessions. Label affiché : "Instable" alors que la dernière session importée était "Discipliné".

**Compréhension :** Au moment de la découverte (2026-05-25), deux pipelines distincts coexistaient sans le signaler :

- **Pipeline live** (`behavior-view.js`) :
  `groupGridTrades(trades)` → `computeMetrics()` → `detectPatterns()` → `computeScore(patterns, metrics, gridContext)`

- **Pipeline sessions** (`behavior-analyzer.js` — état au moment du bug) :
  `computeMetrics(s.trades)` → `detectPatterns()` → `computeScore(patterns, metrics)`
  — sans grid-grouper, sans gridContext

Le grid-grouper tournait uniquement côté view et son résultat n'était pas persisté. `analyzeSessions` rescalait chaque session sur les trades bruts.

Impact mesuré sur V0-A au moment du bug :

| Session | Absorption grouper | Score live | Score session |
|---|---|---|---|
| 1_an | 38 % | 25 | ~25 (peu d'écart) |
| 1_semaine | 96 % | 90 | ~31 (écart majeur) |

La session 1_semaine était la plus impactée : 25 des 26 trades bruts auraient été groupés. Sans grouper, le pipeline voyait de l'overtrading apparent sur 26 trades concentrés en 3 jours.

**Problèmes identifiés au moment du bug :**
1. Grid-grouper absent dans `analyzeSessions` — principal ✅ résolu
2. `gridContext` absent dans `analyzeSessions` — secondaire (voir DGN-002, toujours actif)
3. Moyenne des scores non pondérée par nombre de trades — décision produit à trancher séparément

**Correction appliquée (commit exact non tracé) :**
`groupGridTrades` importé et appliqué avant `computeMetrics()` dans `behavior-analyzer.js`. Revérification 2026-06-01 confirme que le code actuel utilise bien les trades groupés dans le pipeline sessions.

**Résultat obtenu :** Pipeline sessions aligné sur le pipeline live pour le grid-grouper. Les scores de la synthèse sessions reflètent désormais les mêmes trades groupés que ceux affichés pendant l'import.

**Statut :** ✅ Résolu — correction présente dans le code actuel
**Réutilisation future :** Toute future extension de pipeline (Order History, multi-sources) doit s'assurer que le pipeline de rescoring des sessions utilise exactement les mêmes transformations que le pipeline live.

**Fichiers concernés :**
`src/js/behavior/analytics/behavior-analyzer.js` · `src/js/behavior/ui/behavior-view.js`

**Commit associé :** `615c810` (bug documenté) — correction présente dans le code (commit exact non tracé)

---

### DGN-002 — gridContext absent dans analyzeSessions

**Famille :** Diagnostic
**Situation rencontrée :** Lié à DGN-001 — `computeScore(patterns, metrics)` appelé sans `gridContext` dans le pipeline sessions.

**Symptôme observé :** La modulation overtrading par profil grid (V4.3) ne s'applique pas dans la synthèse sessions, même quand un profil Order History est actif.

**Compréhension :** `gridContext` est lu depuis localStorage via `readGridContext()` dans `behavior-view.js` mais pas dans `behavior-analyzer.js`. Impact mineur comparé à DGN-001 (grid-grouper absent) mais réel pour les opérateurs avec profil grid actif.

**Adaptation appliquée :** Non encore appliquée. DGN-001 (grid-grouper) a été résolu indépendamment — DGN-002 reste ouvert séparément.

**Statut :** ⚠️ Actif — à traiter séparément (DGN-001 résolu)
**Réutilisation future :** `readGridContext()` n'est pas exportée de `behavior-view.js` — la correction requiert soit une export, soit une reproduction directe de la logique dans `behavior-analyzer.js` via `behaviorRepo.get('orderStrategyProfile')`.

**Fichiers concernés :** `src/js/behavior/analytics/behavior-analyzer.js`

---

### DGN-003 — Taux d'absorption grid : lecture confuse sur fichiers cumulatifs

**Famille :** Diagnostic
**Situation rencontrée :** Taux d'absorption grid-grouper observé sur V0-A : 17 % stable sur 3_mois et 6_mois, remonte à 38 % sur 1_an.

**Symptôme observé :** Le taux ne suit pas une progression monotone — il diminue puis augmente. Un opérateur ou un auditeur pourrait conclure à un comportement incohérent du grouper.

**Compréhension :** Ce n'est pas une incohérence du grouper — c'est un artefact de la composition temporelle des fichiers cumulatifs. Le fichier 1_an contient la période 1_semaine (96 % d'absorption) en son sein. L'agrégat de 1 435 trades mélange des séquences récentes à haute densité DCA/carnet avec des séquences plus anciennes plus espacées. Le taux 38 % reflète ce mix, pas un comportement uniforme du grouper.

Le taux de 17 % sur 3/6_mois semble être le plancher naturel de ce style de trading (cf. BHV-001 pour la table complète).

**Adaptation appliquée :** Aucune. Comportement attendu documenté.

**Statut :** ✅ Résolu par compréhension
**Réutilisation future :** Ne pas utiliser le taux d'absorption comme métrique de comparaison directe entre datasets cumulatifs. Il reflète le mix temporel de styles, pas la qualité du grouper.

**Fichiers concernés :** `src/js/behavior/analytics/grid-grouper.js`

---

### DGN-004 — Cause dominante ≠ risque dominant : ambiguïté non signalée

**Famille :** Diagnostic / UX
**Situation rencontrée :** Corpus V0-A 3_mois et 1_an — cause dominante = Overtrading, risque dominant = Escalade de position.

**Symptôme observé :** L'interface affiche les deux sans expliquer qu'il s'agit de deux métriques différentes mesurant deux choses différentes.

**Compréhension :**
- **Cause dominante** : le pattern qui pèse le plus dans le calcul du score. Reflète la pondération interne.
- **Risque dominant** : le pattern le plus sévère comportementalement. Reflète la dangerosité individuelle.

Sur 3_mois : overtrading fait baisser le score (cause), mais l'escalade de position est ce qui met réellement l'opérateur en danger (risque). Ce sont deux lectures légitimes mais orthogonales — l'une dit "ce qui fait baisser ton score", l'autre dit "ce qui te met en danger".

Un opérateur qui lit les deux sans contexte peut conclure que le moteur est incohérent.

**Adaptation appliquée :** Aucune correction. Observation documentée.

**Statut :** ⚠️ À surveiller — source de confusion UX potentielle
**Réutilisation future :** Pour B1-B19, noter systématiquement quand cause dominante et risque dominant divergent. Si ce cas est fréquent chez plusieurs opérateurs, c'est un signal de refonte de la présentation UX : distinguer explicitement "ce qui fait baisser ton score" de "ce qui te met en danger".

**Fichiers concernés :** `src/js/behavior/ui/behavior-view.js` · `src/js/behavior/analytics/scoring.js`

---

## Calibration Memory

---

### CAL-001 — Profil opérateur de référence : corpus V0-A (Antonio)

**Famille :** Calibration
**Situation rencontrée :** 5 périodes importées sur le même opérateur — corpus V0-A (2025-05-23 → 2026-05-24).

**Compréhension :** Ce corpus constitue la première baseline personnelle documentée du projet. Il est la référence pour identifier ce qui est normal pour cet opérateur versus ce qui est une dérive réelle.

**Métriques observées :**

| Dimension | Valeur de référence |
|---|---|
| Style dominant (3 mois+) | Range/Carnet |
| Style court terme (< 1 mois) | DCA / Swing |
| Actif principal | TAOUSDC |
| Diversité actifs (1 an) | 19 symboles |
| Absorption grid typique | 17 % (3–6 mois), 96 % (< 1 semaine) |
| Taux overtrading relatif | ~2–5 % fenêtres/trades |
| Escalade de position | Présente et persistante sur toutes les longues périodes |
| Score plancher (multi-actifs, avant PS-01) | ~15 |
| Point de bascule comportemental | ~3 mois / ~200 trades post-grouper |

**Faux positifs personnels documentés :**

| Pattern | Réalité | Déclencheur |
|---|---|---|
| `size_inconsistency` élevé | Allocation différenciée par actif, pas une dérive | CV global multi-actifs (PS-01 — voir BHV-002) |
| Overtrading sur TAOUSDC | Style Range/Carnet intentionnel | Densité de fills sur un seul actif |
| Score bas sur 3_mois (15) | Période récente plus active — pas représentative du long terme | Concentration des patterns sur la fenêtre courte récente |

**Statut :** ✅ Baseline terrain établie — à enrichir avec B1-B19
**Réutilisation future :** Tout écart significatif par rapport à ces métriques sur de futures importations sera un signal de changement comportemental réel — pas un artefact du moteur. Cette baseline est le point de départ de la Calibration Personnelle Binance V1 (architecture définie dans `docs/architecture/calibration-personnelle-binance-v1.md`).

**Fichiers concernés :** `docs/validation/v0-a-binance-trade-history-validation.md` · `docs/validation/v0-a-comparaison-scores-periodes.md`

---

### CAL-002 — Régimes comportementaux : seuils et baselines observés

**Famille :** Calibration
**Situation rencontrée :** Synthèse des observations V0-A sur les seuils de déclenchement des patterns et des régimes.

**Compréhension :** Le moteur ne détecte pas des régimes explicitement — ils émergent des métriques (cf. BHV-006). Mais la calibration nécessite de connaître à quels seuils de volume et de temps ces régimes émergent de façon fiable. Ce cas documente ces seuils observés, distincts de la propriété émergente elle-même.

**Seuils observés sur V0-A :**

| Seuil | Valeur observée | Confiance |
|---|---|---|
| Volume minimal pour score fiable | ~20 trades post-grouper | Estimé — à confirmer B1-B19 |
| Volume minimal pour détecter l'escalade | ~200 trades post-grouper | Observé (absent sur 1_semaine/1_mois) |
| Volume minimal pour détecter les transitions | ~200 trades post-grouper | Observé (absent avant 3_mois) |
| Taux d'overtrading "normal" (Range/Carnet) | 2–5 % fenêtres/trades | Observé sur 3 périodes longues |
| Score plancher multi-actifs (avant PS-01) | ~15 | Observé sur REAL_001, REAL_004, V0-A 3_mois |
| CV tailles "normal" sur mono-actif | 64–150 % | Observé sur 1_semaine/1_mois |
| CV tailles "faux positif" sur multi-actifs | 277–380 % | Observé sur 3_mois → 1_an (PS-01) |

**Ce qui reste à calibrer (attend B1-B19) :**
- Seuils T1/T2/T4 de la couche V2 (tensions, attention, exposition) — provisoires
- Score moyen "normal" par profil de trading (scalping, swing, range, directionnel)
- Taux d'escalade "normal" vs "ancré" selon le nombre de séquences
- `SIZE_MIN_TRADES_PER_SYMBOL` : augmenter de 3 à 5+ pour fiabilité statistique

**Statut :** ✅ Baselines partielles établies — calibration collective B1-B19 requise
**Réutilisation future :** Ces seuils sont provisoires. Après B1-B19, comparer les valeurs observées sur 20–30 opérateurs aux baselines V0-A pour ajuster. Si un seuil tient sur 80 % des opérateurs, il devient un seuil stable.

**Fichiers concernés :** `docs/architecture/calibration-terrain.md` · `docs/validation/v0-a-comparaison-scores-periodes.md`

---

## Architecture Memory

---

### ARCH-001 — Quatre sources Binance : dimensions orthogonales

**Famille :** Architecture
**Situation rencontrée :** Audits comportementaux V1 — Trade History, Order History, Wallet History, Calibration (2026-05-31).

**Compréhension :** Les quatre sources Binance ne se répètent pas — elles couvrent des territoires comportementaux distincts.

| Source | Dimension | Ce qu'elle capture |
|---|---|---|
| Trade History | Exécution | Ce qui s'est réellement passé |
| Order History | Intention | Ce qui était voulu avant exécution |
| Wallet / Transaction | Capital | Dans quel contexte capital l'opérateur tradait |
| Calibration | Baseline | Relatif à qui — référence personnelle |

**Seul recoupement :** les ordres FILLED en Order History correspondent exactement aux trades en Trade History. En dehors de cette intersection, les trois sources actives couvrent ~80 % de territoire distinct.

**Règles de garde — à ne pas contourner :**
1. Pas de chantier autonome par source — toutes s'intègrent dans Calibration V1 ou BMSM P1/P2
2. Valeur conditionnelle au volume : Order History ≥ 50 ordres/actif ; Wallet History ≥ 6 mois ; Calibration ≥ 3 imports sur 2+ régimes de marché
3. Interprétation relative uniquement — jamais absolue. Le même taux d'annulation de 35 % est élevé ou bas uniquement par rapport à la baseline personnelle de l'opérateur

**Statut :** ✅ Architecture doctrine établie — implémentation conditionnelle au signal terrain
**Réutilisation future :** Avant d'implémenter Order History ou Wallet History parsing, vérifier que ≥5 opérateurs ont montré le besoin terrain. La règle de garde s'applique à toute extension future.

**Fichiers concernés :**
`docs/architecture/binance-audits-synthesis-v1.md` · `docs/architecture/order-history-behavioral-audit-v1.md` · `docs/architecture/wallet-history-behavioral-audit-v1.md` · `docs/architecture/calibration-personnelle-binance-v1.md`

**Commits associés :** `b70f98e` (synthèse) · `5a3c764` (order history) · `645d5b7` (wallet history) · `5a8b38f` (calibration)

---

### ARCH-002 — Boucle officielle Caméléon Engine

**Famille :** Architecture
**Situation rencontrée :** Formalisation du principe directeur lors de l'audit mémoire 2026-06-01.

**Compréhension :** Caméléon Engine est conçu autour des **connaissances**, pas des formats. Un CSV, XLSX ou PDF sont des contenants. La valeur réelle se trouve dans ce qui est extrait, normalisé, analysé et mémorisé.

```
Fichier
  ↓ Extraction
Connaissances brutes
  ↓ Normalisation
Schéma canonique
  ↓ Analyse
Patterns / Score
  ↓ Mémoire
Baseline personnelle
  ↓ Adaptation
Calibration évolutive
```

**Boucle d'apprentissage — règle officielle pour tout nouveau cas :**
```
Situation rencontrée → Compréhension → Adaptation → Mémoire
```

Cette boucle s'applique à : imports, comportements, calibrations, diagnostics, bugs, nouvelles plateformes.

**Statut :** ✅ Principe fondateur — permanente
**Réutilisation future :** Tout nouveau cas terrain — bug, format inconnu, pattern inattendu, nouveau comportement opérateur — produit une entrée dans ce document avant toute correction de code.

---

### ARCH-003 — Vision multiplateforme : connaissances communes

**Famille :** Architecture
**Situation rencontrée :** Réflexion sur l'extension à d'autres plateformes (Kraken, Coinbase, Bybit, etc.).

**Compréhension :** Ne pas raisonner en termes de plateformes supportées. Raisonner en termes de **connaissances communes** que toute plateforme produit sous des formes différentes.

| Connaissance | Signal comportemental | Présente sur |
|---|---|---|
| Trade exécuté | Ce qui s'est passé | Toutes plateformes |
| Ordre déclaré | Ce qui était voulu | La plupart |
| Dépôt / Retrait | Capital flow | Toutes plateformes |
| Earn / Staking | Réserve passive | Plateformes avec DeFi |

**Principe d'adaptation :** Le point d'extension est `canonical.js` — la normalisation vers le schéma canonique interne. Pas le parser. Un nouveau format = un nouveau mapper qui produit le même schéma canonique. Tout le pipeline en aval reste inchangé.

**Statut :** ✅ Doctrine établie — implémentation conditionnelle au signal terrain
**Réutilisation future :** Avant tout nouveau format multiplateforme : identifier d'abord quelles connaissances il produit, puis mapper vers le schéma canonique existant. Si une connaissance n'a pas de champ canonique existant, créer le champ — pas un pipeline parallèle.

**Fichiers concernés :** `src/js/behavior/normalize/canonical.js`

---

### ARCH-004 — Rôle potentiel des PDF

**Famille :** Architecture
**Situation rencontrée :** Réflexion avant campagne B1-B19 — certains opérateurs peuvent ne disposer que d'exports PDF.

**Compréhension :** Caméléon Engine n'a jamais traité de PDF en production. L'architecture est documentée (`docs/architecture/pdf-intelligence-system-v1.md`) mais non démarrée.

Deux rôles potentiels distincts :

| Rôle | Situation | Valeur |
|---|---|---|
| Source de connaissance | L'opérateur exporte un rapport fiscal Binance en PDF | Extraction des trades si CSV indisponible |
| Source de résilience | L'opérateur ne dispose que du PDF — pas de CSV | Dernier recours pour ne pas exclure l'opérateur |

**Principe fondateur :** Si un utilisateur ne possède que des PDF, Caméléon Engine doit chercher à s'adapter à cette situation — pas à le rejeter. L'exclusion d'un opérateur pour un problème de format va à l'encontre de la doctrine "connaissances d'abord".

**Condition d'ouverture :** ≥3 opérateurs dans B1-B19 signalent "je n'ai que des PDF" → ouvrir le chantier PDF-Intelligence.

**Statut :** ✅ Architecture doctrinale — implémentation conditionnelle au signal terrain
**Réutilisation future :** Ne pas anticiper. Ouvrir uniquement sur signal réel. L'architecture est prête (`pdf-intelligence-system-v1.md`, 8 dettes PDF-01→08) — le déclencheur est le besoin opérateur, pas la maturité technique.

**Fichiers concernés :** `docs/architecture/pdf-intelligence-system-v1.md`

---

## Zones Fragiles

Consolidation des points ⚠️ identifiés dans les sections précédentes. Aucune nouvelle information — chaque zone pointe vers son cas source.

| ID | Zone | Manifestation | Impact | Priorité | Cas source |
|---|---|---|---|---|---|
| Z-01 | ~~Bug session-score (grid-grouper absent)~~ | Résolu — `groupGridTrades` présent dans `behavior-analyzer.js` | — | ✅ Résolu | DGN-001 |
| Z-02 | ~~PS-01 confirmation terrain~~ | ✅ Tables renseignées — scores V0-A identiques avant/après (CV intra-symbole réel + plafond 65 pts) | — | ✅ Clôturé — commit `7b91341` | BHV-002 |
| Z-03 | Score sur < 20 trades post-grouper | Valeur calculée sans signification statistique suffisante | Moyen | B | BHV-001 · BHV-007 |
| Z-04 | Score non-monotone sur fichiers cumulatifs | Contre-intuitif — peut créer de la défiance utilisateur | Moyen | B | BHV-003 |
| Z-05 | Pondération overtrading absolue vs relative | 6 fenêtres sur 212 trades pèse autant que 46 sur 1 000 | Moyen | B | BHV-004 |
| Z-06 | gridContext absent dans analyzeSessions | Modulation grid non appliquée dans la synthèse sessions | Faible | C — traiter séparément (Z-01 résolu) | DGN-002 |
| Z-07 | Hétérogénéité devise intra-fichier (BTCEUR) | Métriques comparant EUR et USDC sans distinction | Faible | C — surveiller B1-B19 | IMP-004 |
| Z-08 | Cause dominante ≠ risque dominant | Deux métriques présentées sans expliquer leur différence | Moyen | B | DGN-004 |

**Lecture des priorités :**
- **A** : bloquant ou à confirmer avant B1-B19 — agir maintenant
- **B** : important — à adresser après observation B1-B19
- **C** : faible impact ou se corrige avec une zone de priorité supérieure

---

## Recommandations avant B1-B19

Dérivées des zones actives. Z-01 résolue (DGN-001). Aucune recommandation nouvelle.

### Priorité A — Avant de lancer B1-B19

~~**A1 — Mesurer les scores post-PS-01 sur V0-A (Z-02)**~~
✅ Clôturé 2026-06-01 — tables renseignées dans `docs/validation/ps-01-size-inconsistency-by-symbol.md` (commit `7b91341`). Scores V0-A identiques avant/après PS-01 : CV intra-symbole authentiquement élevé pour cet opérateur + plafond de pénalités 65 pts.

### Priorité B — Protocole d'observation B1-B19

Pour chaque opérateur importé, noter systématiquement :

| Champ | Pourquoi |
|---|---|
| Source (CSV / XLSX / PDF) | Détecter les besoins format non couverts |
| Encodage détecté | Valider IMP-001 sur d'autres exports |
| Colonnes reconnues / orphelines | Détecter de nouveaux formats ou locales |
| Trades bruts → post-grouper → taux d'absorption | Valider BHV-001, détecter styles inconnus |
| Score + état + style détecté | Alimenter CAL-002 (baselines collectives) |
| CV tailles + patterns déclenchés | Confirmer PS-01 sur multi-actifs (Z-02) |
| Cause dominante vs risque dominant | Observer la fréquence de divergence (DGN-004) |
| Faux positifs suspectés | Enrichir la bibliothèque CAL-001 |

**B1 — Diversité des profils à couvrir**
Viser au minimum : scalping / swing / range · mono-actif / multi-actifs · avec et sans grid · courte période / longue période

**B2 — Signal PDF**
Si ≥3 opérateurs signalent "je n'ai que des PDF" → ouvrir le chantier ARCH-004

**B3 — Signal multidevise**
Si des paires non-USDC (EUR, BTC-base) apparaissent fréquemment → adresser IMP-004

### Priorité C — Post-B1-B19

- Formaliser le seuil minimal de trades post-grouper pour score fiable (Z-03)
- Évaluer la pondération overtrading relative vs absolue (Z-05)
- Clarifier la présentation cause dominante / risque dominant dans l'interface (Z-08)
- Ajuster `SIZE_MIN_TRADES_PER_SYMBOL` de 3 à 5+ si les données B1-B19 le confirment

---

## État actuel

Tableau de maturité par famille de connaissances au 2026-06-01. Statuts tirés des cas documentés ci-dessus.

### Import Memory

| Connaissance | Statut | Cas |
|---|---|---|
| CSV Binance Trade History FR — encodage, colonnes, dates, quantités | ✅ Production | IMP-001 |
| Frais multi-devise (base / quote / BNB) | ✅ Limitation connue | IMP-002 |
| Parser lenient — colonnes inconnues ignorées | ✅ Production | IMP-003 |
| Hétérogénéité devise intra-fichier (BTCEUR) | ⚠️ Limitation documentée | IMP-004 |
| CASE_001 — superscript ² dans les colonnes | ✅ Résolu | IMP-005 |
| Garde 5 MB et performance | ✅ Production | IMP-006 |
| Order History parsing complet | ❌ Architecture définie — non implémenté | ARCH-001 |
| Wallet / Transaction History parsing | ❌ Architecture définie — non démarré | ARCH-001 |
| PDF parsing | ❌ Architecture doctrinale — non démarré | ARCH-004 |

### Behavior Memory

| Connaissance | Statut | Cas |
|---|---|---|
| Grid-grouper — comportement et taux d'absorption | ✅ Validé terrain | BHV-001 |
| PS-01 — CV par symbole | ✅ CLÔTURÉ — correction validée terrain V0-A | BHV-002 |
| Score non-monotone sur fichiers cumulatifs | ⚠️ Limitation documentée | BHV-003 |
| Overtrading — signal proportionnel | ✅ Validé terrain | BHV-004 |
| Escalade de position — signal le plus fiable | ✅ Validé terrain | BHV-005 |
| Style détecté multi-échelle | ✅ Propriété émergente validée | BHV-006 |
| CV tailles sur faible volume | ⚠️ Seuil minimal non formalisé | BHV-007 |
| Seuils T1/T2/T4 (couche V2) | ❌ Provisoires — calibration B1-B19 requise | CAL-002 |

### Diagnostic Memory

| Connaissance | Statut | Cas |
|---|---|---|
| Bug session-score — pipeline live ≠ sessions | ✅ Résolu — correction présente dans le code actuel | DGN-001 |
| gridContext absent dans analyzeSessions | ⚠️ Actif — à traiter séparément (DGN-001 résolu) | DGN-002 |
| Taux d'absorption incohérent sur cumulatifs | ✅ Résolu par compréhension | DGN-003 |
| Cause dominante ≠ risque dominant | ⚠️ Ambiguïté UX documentée | DGN-004 |

### Calibration Memory

| Connaissance | Statut | Cas |
|---|---|---|
| Profil opérateur de référence (Antonio) | ✅ Baseline établie | CAL-001 |
| Seuils et baselines comportementaux V0-A | ✅ Partiels — enrichissement B1-B19 | CAL-002 |
| Calibration collective (B1-B19) | ❌ Non démarrée | CAL-002 |
| Calibration Personnelle Binance V1 (UI) | ❌ Architecture prête — non implémentée | ARCH-001 |

### Architecture Memory

| Connaissance | Statut | Cas |
|---|---|---|
| 4 sources Binance — orthogonalité et règles de garde | ✅ Doctrine établie | ARCH-001 |
| Boucle officielle Caméléon Engine | ✅ Principe fondateur | ARCH-002 |
| Vision multiplateforme — point d'extension canonical.js | ✅ Doctrine établie | ARCH-003 |
| Rôle potentiel des PDF | ✅ Architecture doctrinale | ARCH-004 |

---

*Document vivant — toute découverte terrain produit une entrée dans ce document avant toute correction de code.*
*Prochaine mise à jour : après campagne B1-B19.*
