# Order History — Audit comportemental V1

**Statut :** Exploratoire · Audit comportemental · Aucune implémentation
**Date :** 2026-05-31
**Nature :** Audit architectural et comportemental — pas de code, pas de roadmap

**Sources couvertes :**
- Binance Spot Order History
- Binance Futures Order History (traité en section limites)

**Champs disponibles :**
Date création · Date exécution · Prix demandé · Quantité demandée · Quantité exécutée · Type d'ordre · Statut

**Statuts analysés :**
`NEW` · `FILLED` · `PARTIALLY_FILLED` · `CANCELED` · `EXPIRED`

**Exclusions strictes :**
Trade History · Wallet History · PnL · Signaux marché · IA prédictive · Toute implémentation

**Documents de référence :**
- `docs/architecture/wallet-history-behavioral-audit-v1.md` — audit Wallet History
- `docs/architecture/calibration-personnelle-binance-v1.md` — calibration personnelle
- `docs/architecture/binance-multi-source-memory.md` — architecture BMSM

**Hypothèse à tester :**
> Trade History mesure l'exécution. Wallet History mesure le rapport au capital. Order History pourrait mesurer le rapport à l'attente, à la patience et au changement d'avis.

**Question centrale :**
> Existe-t-il suffisamment de valeur comportementale dans un Order History Binance pour justifier une exploitation future dans Caméléon Engine ?

---

## 1. Ce que contient réellement Order History

Order History est le registre de toutes les instructions passées par l'opérateur au marché — exécutées ou non. C'est la couche de l'**intention déclarée**, par opposition à Trade History qui est la couche de l'**exécution réelle**.

### Champs et leur portée analytique

| Champ | Contenu | Ce qu'il révèle comportementalement |
|---|---|---|
| `Date création` | Timestamp de soumission de l'ordre | Quand l'opérateur a pris la décision |
| `Date exécution` | Timestamp du fill complet ou partiel | Combien de temps l'ordre a attendu |
| `Prix demandé` | Prix limite fixé par l'opérateur (LIMIT) ou nul (MARKET) | Le niveau que l'opérateur juge acceptable |
| `Quantité demandée` | Taille de position souhaitée | L'intention de sizing |
| `Quantité exécutée` | Taille réellement exécutée | Ce qui s'est concrétisé |
| `Type d'ordre` | LIMIT / MARKET / STOP_LIMIT / OCO | L'architecture de patience choisie |
| `Statut` | FILLED / PARTIALLY_FILLED / CANCELED / EXPIRED / NEW | Le destin de l'intention |

### Ce que chaque statut révèle

| Statut | Signification opérationnelle | Valeur comportementale |
|---|---|---|
| `FILLED` | L'intention s'est réalisée intégralement | Baseline d'exécution réussie — point de comparaison |
| `PARTIALLY_FILLED` | L'intention s'est réalisée partiellement, puis fermée | L'opérateur a accepté une position incomplète — ou a changé d'avis en cours de remplissage |
| `CANCELED` | L'opérateur a annulé activement l'ordre | Changement d'avis délibéré — le signal le plus riche de cet audit |
| `EXPIRED` | L'ordre a expiré sans être exécuté ni annulé | Patience passive : l'opérateur a fixé une limite temporelle et ne l'a pas étendue |
| `NEW` | Ordre en attente au moment de l'export | État transitoire — faible valeur analytique seul |

### Ce que Order History ne contient pas

- Aucun prix de marché au moment de l'ordre (impossible de savoir si le prix limite était agressif ou passif)
- Aucune modification d'ordre (Binance n'exporte pas l'historique des modifications de prix/quantité)
- Aucune raison de l'annulation
- Aucune information sur l'état émotionnel de l'opérateur
- Aucune donnée de PnL

---

## 2. Ce que Trade History ne permet pas de voir

Trade History enregistre uniquement ce qui s'est exécuté. Il est structurellement aveugle à tout ce qui ne s'est pas produit. Or, ce qui ne s'est pas produit est souvent comportementalement aussi révélateur que ce qui s'est produit.

### La couche invisible de Trade History

| Dimension comportementale | Visible dans Trade History | Visible dans Order History |
|---|---|---|
| Ordres annulés avant exécution | ❌ Absent par définition | ✅ CANCELED — signal direct de changement d'avis |
| Ordres expirés sans action | ❌ Absent | ✅ EXPIRED — patience passive, limite temporelle acceptée |
| Intention de sizing (quantité souhaitée) | ❌ Uniquement la quantité exécutée | ✅ Quantité demandée vs quantité exécutée |
| Type d'ordre choisi | ❌ Non exporté dans Trade History Binance | ✅ LIMIT / MARKET / STOP_LIMIT |
| Délai entre décision et exécution | ❌ Uniquement le timestamp d'exécution | ✅ Date création → Date exécution |
| Ordres partiellement remplis puis abandonnés | ❌ Seule la partie exécutée apparaît | ✅ PARTIALLY_FILLED avec quantité demandée complète |
| Tentatives de placement avortées | ❌ Invisible | ✅ CANCELED avec délai court après placement |
| Architecture de patience (LIMIT long vs MARKET) | ❌ Non mesurable | ✅ Ratio LIMIT/MARKET par actif et par période |

### La valeur du gap

Le gap entre Order History et Trade History est un signal comportemental en lui-même. Un opérateur dont 40% des ordres sont annulés avant exécution démontre une instabilité décisionnelle que Trade History rend complètement invisible — ses trades exécutés semblent cohérents, mais son comportement réel est ponctué de doutes et de revirements.

À l'inverse, un opérateur dont 95% des ordres LIMIT sont exécutés démontre une précision de placement et une discipline d'attente que Trade History seul confirme partiellement.

**Le gap Order→Trade est le vrai objet de cet audit.**

---

## 3. Les 20 métriques comportementales identifiées

---

### FORTE VALEUR

---

#### M01 — Taux d'annulation global

**Ce qu'elle mesure réellement :** Le ratio ordres CANCELED / total ordres (FILLED + CANCELED + EXPIRED + PARTIALLY_FILLED). C'est la proportion des intentions qui ne se sont pas concrétisées par choix actif de l'opérateur.

**Pourquoi elle est intéressante :** C'est la métrique de stabilité décisionnelle la plus directe disponible dans les données Binance. Un taux élevé révèle un opérateur qui change fréquemment d'avis entre la décision de placer un ordre et l'attente de son exécution. Un taux faible révèle soit une très grande patience (attend que le marché vienne à lui), soit un usage dominant du MARKET (pas d'attente possible).

**Faux positifs :** Un taux d'annulation élevé peut être structurel et délibéré : les market makers et les opérateurs qui font du scaling in/out annulent massivement des ordres limites dans le cadre de stratégies normales. Un taux élevé sur TAOUSDC range trading peut refléter des ajustements de grille, pas de l'impulsivité.

**Niveau de confiance :** Fort — robuste sur ≥ 50 ordres. Nécessite segmentation par actif pour éviter les biais de stratégie.

---

#### M02 — Délai médian avant annulation

**Ce qu'elle mesure réellement :** Sur les ordres CANCELED, le délai entre la date de création et la date d'annulation. Mesuré en secondes, minutes ou heures selon la distribution.

**Pourquoi elle est intéressante :** Elle révèle la **vitesse du changement d'avis**. Un délai médian de 8 secondes indique un comportement réflexif — l'opérateur place et annule presque immédiatement, souvent sous l'effet d'une impulsion ou d'une hésitation. Un délai médian de 4 heures indique un processus délibéré : l'opérateur place, attend, réévalue, puis annule. Ces deux profils sont comportementalement opposés malgré un taux d'annulation identique.

**Faux positifs :** Des annulations ultra-rapides (< 1 seconde) peuvent être produites par des bots ou des interfaces qui replacent automatiquement les ordres. Des annulations après plusieurs heures peuvent être déclenchées par une alerte externe (news, notification) plutôt que par une réévaluation interne.

**Niveau de confiance :** Fort — la distribution des délais est un signal robuste. La médiane est préférable à la moyenne (insensible aux outliers).

---

#### M03 — Ratio LIMIT vs MARKET

**Ce qu'elle mesure réellement :** La proportion des ordres LIMIT par rapport aux ordres MARKET sur une période. C'est l'architecture de patience choisie par l'opérateur : LIMIT = "je préfère mon prix à la certitude d'exécution" ; MARKET = "je préfère l'exécution immédiate à la maîtrise du prix".

**Pourquoi elle est intéressante :** C'est la mesure de patience la plus structurelle de cet audit. Elle révèle une préférence comportementale profonde : l'opérateur accepte-t-il de ne pas être exécuté pour obtenir son prix, ou préfère-t-il payer le spread pour entrer immédiatement ? Un ratio LIMIT élevé sur les entrées et MARKET sur les sorties révèle une asymétrie significative — patient à l'entrée, pressé à la sortie.

**Faux positifs :** Le ratio est biaisé par la taille des positions et par l'actif. Sur des actifs peu liquides, les LIMIT sont obligatoires (le spread MARKET est prohibitif). Sur des actifs liquides comme BTCUSDT, le MARKET ne coûte presque rien — son usage n'est pas forcément un signe d'urgence.

**Niveau de confiance :** Moyen — Fort si segmenté par actif et par liquidité.

---

#### M04 — Taux de remplissage partiel abandonné

**Ce qu'elle mesure réellement :** La proportion des ordres PARTIALLY_FILLED qui ont ensuite été annulés avant d'atteindre un fill complet. Mesure la conviction de l'opérateur sur la taille de sa position.

**Pourquoi elle est intéressante :** Un opérateur qui annule fréquemment ses ordres partiellement remplis démontre une instabilité dans son intention de sizing : il voulait 100 unités, en a reçu 30, et a décidé que 30 suffisaient (ou qu'il ne voulait plus du tout). Cela révèle une difficulté à maintenir une conviction sur la taille de la position une fois que le marché résiste à son prix.

**Faux positifs :** Dans un contexte de range trading avec grilles, des fills partiels suivis d'annulations peuvent être des comportements normaux de gestion de grille — pas du tout de l'instabilité. Nécessite le contexte de l'actif et du régime.

**Niveau de confiance :** Moyen — Fort si croisé avec le type de stratégie (grille vs directionnel).

---

#### M05 — Pattern cancel-reorder (price chasing)

**Ce qu'elle mesure réellement :** La fréquence des séquences CANCELED suivi d'un nouvel ordre sur le même actif dans la même direction dans un délai court (ex. < 10 minutes). Révèle si l'opérateur "chasse le prix" après avoir manqué son niveau.

**Pourquoi elle est intéressante :** C'est la métrique comportementale la plus révélatrice de l'hypothèse centrale (rapport à l'attente). Un opérateur qui place un ordre LIMIT, voit le marché partir sans lui, annule, et replace l'ordre plus haut (BUY) ou plus bas (SELL) est en train de chasser le prix — comportement documenté comme précurseur de mauvaises entrées sur marché en mouvement. Cette séquence est entièrement invisible dans Trade History (seul le dernier ordre exécuté apparaît).

**Faux positifs :** Un ajustement de prix peut être tactique et discipliné — par exemple, corriger un ordre placé avec une faute de frappe, ou ajuster à une nouvelle information fondamentale. La distinction entre "chasse émotionnelle" et "ajustement rationnel" ne peut pas être faite uniquement avec les données.

**Niveau de confiance :** Moyen — Fort si la séquence se répète plus de 3 fois sur un même actif dans une session courte.

---

### VALEUR MOYENNE

---

#### M06 — Distribution des délais d'exécution (LIMIT orders)

**Ce qu'elle mesure réellement :** Pour les ordres LIMIT FILLED, le délai entre création et exécution. La distribution révèle si l'opérateur pose des ordres proches du marché (fills rapides) ou éloignés (fills lents ou jamais).

**Pourquoi elle est intéressante :** Un opérateur dont 80% des LIMIT sont exécutés en moins de 5 minutes place des ordres proches du cours — comportement proche du MARKET avec contrôle du prix minimal. Un opérateur dont les LIMIT attendent en moyenne 6 heures place des niveaux réfléchis et attend que le marché vienne à lui — comportement de patience structurelle.

**Faux positifs :** Le délai d'exécution dépend autant de la volatilité du marché que du comportement de l'opérateur. En période de range étroit, même un ordre légèrement éloigné peut attendre longtemps. Sans contexte de marché, la métrique est partiellement aveugle.

**Niveau de confiance :** Moyen — nécessite contexte de régime marché pour être interprétable.

---

#### M07 — Taux d'ordres expirés

**Ce qu'elle mesure réellement :** La proportion des ordres EXPIRED (time-in-force expiré) parmi les ordres non exécutés. Mesure la patience passive : l'opérateur avait fixé une limite temporelle et ne l'a pas étendue.

**Pourquoi elle est intéressante :** Un EXPIRED révèle une décision différente d'un CANCELED. L'opérateur n'a pas activement annulé — il a laissé expirer, ce qui signifie qu'il avait accepté d'avance que l'ordre pourrait ne pas être exécuté. C'est une forme de patience avec clôture automatique, distincte de la patience active du LIMIT GTC (Good Till Canceled).

**Faux positifs :** Certains types d'ordres (Day Orders sur Futures) expirent automatiquement en fin de session — un taux EXPIRED élevé peut refléter l'utilisation de ce type d'ordre, pas une intention comportementale spécifique.

**Niveau de confiance :** Moyen — informatif si le contexte de time-in-force est connu.

---

#### M08 — Asymétrie de patience BUY vs SELL

**Ce qu'elle mesure réellement :** La comparaison du taux d'annulation et du délai médian d'attente entre les ordres BUY et les ordres SELL. Une asymétrie révèle que l'opérateur est plus patient à l'entrée qu'à la sortie, ou l'inverse.

**Pourquoi elle est intéressante :** Un opérateur plus patient à l'entrée (peu d'annulations BUY, LIMIT respectés) mais impulsif à la sortie (MARKET sur SELL, annulations rapides) démontre un profil classique d'aversion à la perte : il prend le temps d'entrer mais panique en sortant. L'inverse (patient à la sortie, pressé à l'entrée) révèle la peur de rater l'entrée — FOMO structurel.

**Faux positifs :** L'asymétrie peut être stratégique et délibérée : un opérateur qui entre sur LIMIT (cherche le meilleur prix) et sort sur MARKET (priorité à la certitude de sortie) applique simplement une règle d'exécution rationnelle.

**Niveau de confiance :** Moyen — contexte de stratégie requis pour trancher.

---

#### M09 — Concentration du type d'ordre par actif

**Ce qu'elle mesure réellement :** Si l'opérateur utilise systématiquement le même type d'ordre pour un actif donné, ou s'il varie. Révèle l'existence (ou l'absence) d'une politique d'exécution par actif.

**Pourquoi elle est intéressante :** Un opérateur qui utilise toujours LIMIT sur BTCUSDT et toujours MARKET sur les altcoins moins liquides démontre une politique d'exécution adaptée — signal de maturité opérationnelle. Un opérateur dont le type varie sans pattern apparent par actif démontre une absence de règle d'exécution — signal d'improvisation.

**Faux positifs :** La variation peut refléter des adaptations au régime de marché (LIMIT en range, MARKET en breakout) — comportement rationnel, pas incohérent.

**Niveau de confiance :** Moyen — forte valeur si la politique est documentée et stable sur plusieurs périodes.

---

#### M10 — Variance de la quantité demandée intra-actif

**Ce qu'elle mesure réellement :** Le coefficient de variation des quantités demandées sur un même actif. Un CV faible = sizing cohérent. Un CV élevé = sizing très variable, potentiellement réactif aux conditions du moment.

**Pourquoi elle est intéressante :** Croisée avec Trade History (qui donne la quantité exécutée), cette métrique révèle si l'instabilité du sizing se produit au niveau de l'intention (avant exécution) ou du résultat. Un opérateur dont les intentions de sizing sont stables mais les exécutions variables subit des contraintes de liquidité. L'inverse révèle une instabilité décisionnelle au moment du placement.

**Faux positifs :** Une variance élevée peut être une feature de stratégie (scaling, grille asymétrique). La comparer à la variance de Trade History pour isolation.

**Niveau de confiance :** Moyen — plus fort en croisement avec Trade History.

---

#### M11 — Taux d'utilisation des ordres STOP_LIMIT

**Ce qu'elle mesure réellement :** La proportion des ordres STOP_LIMIT parmi l'ensemble des ordres. Révèle si l'opérateur utilise une protection systématique de ses positions.

**Pourquoi elle est intéressante :** Un opérateur qui place systématiquement des STOP_LIMIT démontre une gestion du risque proactive — il planifie la sortie au moment de l'entrée. Un opérateur qui n'en utilise jamais sort soit à la main (discipline ou stress), soit pas du tout (positions tenues jusqu'au retour). Ce comportement est entièrement invisible dans Trade History.

**Faux positifs :** Certains opérateurs utilisent des alertes externes (TradingView, Telegram bots) plutôt que des STOP_LIMIT Binance — leur absence dans l'historique ne signifie pas l'absence de gestion du risque.

**Niveau de confiance :** Moyen — signal fort si présent, non concluant si absent.

---

#### M12 — Fréquence des micro-annulations (< 30 secondes)

**Ce qu'elle mesure réellement :** La proportion des ordres annulés dans les 30 secondes suivant leur placement. Ces annulations ultra-rapides révèlent un comportement réflexif : l'opérateur place et annule presque immédiatement, souvent avant même que le marché ait pu réagir.

**Pourquoi elle est intéressante :** Les micro-annulations sont une signature de l'hésitation au moment de l'acte — l'opérateur presse "soumettre" puis se ravise immédiatement. C'est une forme d'anxiété décisionnelle observable dans les données. Distincte des annulations délibérées après réflexion (M02).

**Faux positifs :** Des erreurs de saisie (mauvais prix, mauvaise quantité) produisent des micro-annulations techniques sans signification comportementale. Difficile à filtrer.

**Niveau de confiance :** Moyen — signal utile si la fréquence est élevée et répétée.

---

### FAIBLE VALEUR

---

#### M13 — Nombre d'ordres NEW simultanés en cours

**Ce qu'elle mesure réellement :** Au moment de l'export, le nombre d'ordres en statut NEW (en attente d'exécution). Révèle si l'opérateur a des ordres ouverts sur plusieurs actifs simultanément.

**Pourquoi elle est faible :** C'est une donnée d'état à un instant T, pas une donnée comportementale sur une période. La valeur analytique est très limitée sans historique des ordres NEW à différents moments.

**Niveau de confiance :** Faible — donnée ponctuelle, non comportementale.

---

#### M14 — Ratio fill partiel au moment de l'annulation

**Ce qu'elle mesure réellement :** Pour les ordres PARTIALLY_FILLED puis CANCELED, quel pourcentage de la quantité demandée avait été exécuté avant annulation.

**Pourquoi elle est faible :** Le ratio 30%/50%/80% de fill avant annulation dépend autant de la liquidité du marché que de la décision de l'opérateur. Sans prix de marché au moment de l'annulation, impossible de distinguer "annulation choisie" de "annulation résultant d'une exécution difficile".

**Niveau de confiance :** Faible — trop de variables confondantes liées à la liquidité.

---

#### M15 — Évolution du type d'ordre dans le temps

**Ce qu'elle mesure réellement :** Si l'opérateur a changé ses habitudes de type d'ordre entre deux périodes (ex. plus de MARKET en 2025 qu'en 2024).

**Pourquoi elle est faible :** Ce changement peut refléter une évolution de stratégie, une évolution de l'interface Binance (changements UX), ou simplement un changement d'actif tradé. Trop d'explications possibles pour un signal fiable.

**Niveau de confiance :** Faible — trop d'explications alternatives non distinguables.

---

#### M16 — Ordres annulés en période de volatilité

**Ce qu'elle mesure réellement :** Corrélation entre les pics d'annulation et les périodes de forte volatilité de marché.

**Pourquoi elle est faible :** Nécessite des données de volatilité marché (non disponibles dans l'export Order History). Sans cette information externe, la corrélation ne peut pas être calculée.

**Niveau de confiance :** Faible — nécessite données externes non disponibles dans l'export.

---

#### M17 — Clustering d'ordres sur même actif

**Ce qu'elle mesure réellement :** Des clusters d'ordres (ex. 5 ordres sur BTCUSDT en 10 minutes) révèlent soit une grille d'ordres délibérée, soit un comportement de tâtonnement frénétique.

**Pourquoi elle est faible :** Sans distinguer grille (régularité de prix) d'impulsivité (prix erratiques), le clustering seul est ambigu. Le `grid-grouper.js` existant dans le pipeline comportemental adresse déjà partiellement ce problème via Trade History.

**Niveau de confiance :** Faible en isolation — mieux adressé via Trade History + grid-grouper existant.

---

#### M18 — Biais directionnel des annulations

**Ce qu'elle mesure réellement :** Est-ce que l'opérateur annule plus souvent ses ordres BUY ou ses ordres SELL ?

**Pourquoi elle est faible :** Sans contexte de marché (bull / bear / range), cette asymétrie ne peut pas être interprétée. En bull, annuler plus de BUY peut signifier "j'ai raté" ou "le marché est allé plus haut que prévu" — indiscernables.

**Niveau de confiance :** Faible — non interprétable sans régime de marché.

---

#### M19 — Comparaison prix LIMIT BUY vs prix LIMIT SELL

**Ce qu'elle mesure réellement :** L'écart entre les prix demandés sur les ordres BUY et les prix demandés sur les ordres SELL. Révèle théoriquement la fourchette de travail que l'opérateur s'alloue.

**Pourquoi elle est faible :** Sans le prix de marché au moment du placement, comparer un prix LIMIT BUY à un prix LIMIT SELL sur des timestamps différents est analytiquement sans sens — les prix de marché ont changé entre les deux.

**Niveau de confiance :** Faible — non calculable sans prix de marché de référence.

---

#### M20 — Taux d'ordres annulés avant tout fill (vs partiellement remplis)

**Ce qu'elle mesure réellement :** La distinction entre les ordres qui n'ont reçu aucune exécution avant annulation (CANCELED pur) et ceux qui ont été partiellement remplis (PARTIALLY_FILLED + CANCELED). La première catégorie révèle un changement d'avis précoce ; la seconde révèle un changement d'avis en cours d'exécution.

**Pourquoi elle est faible ici :** La valeur de cette distinction est réelle, mais elle est déjà capturée plus finement par M04 (remplissage partiel abandonné) et M02 (délai avant annulation). M20 est redondant par rapport aux métriques de forte valeur.

**Niveau de confiance :** Faible — redondance avec M02 et M04.

---

## 4. Les 5 métriques les plus différenciantes pour Caméléon Engine

Ces cinq métriques sont sélectionnées selon un critère unique : elles révèlent quelque chose que ni Trade History ni Wallet History ne peuvent révéler.

---

### D1 — Taux d'annulation global (M01)

**Pourquoi différenciante :** C'est la métrique fondatrice de cet audit. Elle mesure la stabilité décisionnelle — la capacité de l'opérateur à maintenir une intention entre le moment où il la formule (placement) et le moment où elle se concrétise (exécution). Trade History rend ce signal complètement invisible : seuls les ordres exécutés y apparaissent. Un opérateur avec 40% d'annulations peut paraître parfaitement cohérent dans son Trade History.

**Ce qu'elle apporte à Caméléon Engine :** Un indicateur de cohérence entre intention et action. Un taux d'annulation élevé chronique est un signal de friction décisionnelle que le module comportemental actuel ne peut pas capter.

---

### D2 — Délai médian avant annulation (M02)

**Pourquoi différenciante :** Elle transforme le taux d'annulation (M01) d'un signal binaire en un signal qualitatif. Deux opérateurs avec 30% d'annulations sont comportementalement opposés si l'un annule en 6 secondes et l'autre en 6 heures. Le premier est réflexif ; le second est délibéré. Cette dimension temporelle du changement d'avis n'existe nulle part ailleurs dans les données Binance.

**Ce qu'elle apporte à Caméléon Engine :** La vélocité du doute. Un signal de vitesse de changement d'avis qui complète le score comportemental existant en ajoutant la dimension temporelle de l'indécision.

---

### D3 — Pattern cancel-reorder (M05)

**Pourquoi différenciante :** C'est le proxy comportemental le plus proche du price chasing — comportement documenté comme l'un des patterns les plus coûteux en trading actif. Il ne peut pas être détecté dans Trade History (le dernier ordre exécuté efface les tentatives précédentes). Il ne peut pas être détecté dans Wallet History. Il n'existe que dans Order History.

**Ce qu'elle apporte à Caméléon Engine :** Une détection directe de la poursuite du prix sous pression, distincte de l'overtrading (trop de trades exécutés) qui est déjà dans le pipeline comportemental. Le cancel-reorder est un overtrading d'intention, pas d'exécution.

---

### D4 — Ratio LIMIT vs MARKET (M03)

**Pourquoi différenciante :** C'est l'architecture de patience choisie par l'opérateur — sa préférence structurelle entre "obtenir mon prix" et "obtenir mon exécution". Cette préférence est stable, révélatrice, et totalement absente de Trade History (Binance Trade History n'exporte pas le type d'ordre). C'est une information qui n'a aucun équivalent dans les autres sources.

**Ce qu'elle apporte à Caméléon Engine :** Une mesure de la patience architecturale, distincte de la patience comportementale (ne pas annuler). Un opérateur peut être patient dans l'attente (peu d'annulations) mais impulsif dans le type d'ordre (toujours MARKET). Ces deux dimensions sont indépendantes.

---

### D5 — Asymétrie de patience BUY vs SELL (M08)

**Pourquoi différenciante :** Elle révèle la structure émotionnelle de l'opérateur à travers ses préférences d'exécution différenciées selon la direction. Un opérateur patient à l'entrée (LIMIT BUY, peu d'annulations) et pressé à la sortie (MARKET SELL, annulations rapides) démontre une structure d'aversion à la perte classique — anxieux de ne pas manquer la sortie, calme à l'entrée. Cette asymétrie est structurelle et ne change pas facilement. Elle est invisible ailleurs.

**Ce qu'elle apporte à Caméléon Engine :** Un profil de biais directionnel de patience. Un signal architectural sur la manière dont l'opérateur gère différemment l'entrée et la sortie au niveau de l'intention, avant même l'exécution.

---

### Synthèse des 5 métriques différenciantes

| Rang | Métrique | Signal unique | Invisible dans Trade History |
|---|---|---|---|
| D1 | Taux d'annulation (M01) | Stabilité décisionnelle | ✅ Ordres annulés absents de Trade History |
| D2 | Délai avant annulation (M02) | Vélocité du doute | ✅ Seul le timestamp d'exécution existe |
| D3 | Cancel-reorder (M05) | Price chasing d'intention | ✅ Tentatives avortées effacées |
| D4 | Ratio LIMIT/MARKET (M03) | Architecture de patience | ✅ Type d'ordre non exporté dans Trade History |
| D5 | Asymétrie BUY/SELL (M08) | Biais directionnel de patience | ✅ Ne distingue pas direction dans l'exécution |

---

## 5. Limites structurelles de la source

### L1 — Absence de prix de marché au moment de l'ordre

C'est la limite la plus contraignante. Sans savoir où était le marché au moment du placement d'un ordre LIMIT, on ne peut pas interpréter le prix demandé. Un LIMIT BUY à 50 000 USDT sur BTCUSDT peut être agressif (marché à 50 050) ou très patient (marché à 52 000). Cette information est absente de l'export.

**Conséquence :** Les métriques basées sur la position du prix LIMIT par rapport au marché (M19 notamment) sont inexploitables sans données externes.

---

### L2 — Absence d'historique de modification d'ordre

Binance n'exporte pas les modifications d'ordres (changement de prix ou de quantité avant exécution ou annulation). Un ordre peut avoir été modifié 5 fois avant d'être annulé — l'export ne montre que la version finale. Cela sous-estime l'instabilité décisionnelle réelle de l'opérateur.

**Conséquence :** M01 (taux d'annulation) et M02 (délai) sont des sous-estimations conservatives de l'agitation décisionnelle réelle.

---

### L3 — Ambiguïté des CANCELED

Un ordre annulé peut l'être pour des raisons très différentes : changement d'avis, erreur de saisie, stratégie de placement (test de niveau), contrainte externe (margin call, fermeture de session). L'export ne fournit aucune raison d'annulation.

**Conséquence :** Chaque métrique d'annulation est une distribution d'intentions mélangées. L'interprétation comportementale nécessite un volume suffisant pour que le signal émerge du bruit.

---

### L4 — Spot vs Futures : deux comportements distincts

L'Order History Spot et l'Order History Futures couvrent des comportements radicalement différents. Les ordres Futures impliquent un levier, des liquidations forcées, des ordres de protection systématiques (SL/TP intégrés) qui n'ont pas d'équivalent Spot. Mélanger les deux sources sans segmentation produit un profil composite non interprétable.

**Conséquence :** Traiter Spot et Futures séparément est une contrainte obligatoire avant toute analyse. Les métriques de cet audit s'appliquent prioritairement au Spot.

---

### L5 — Dépendance partielle à Trade History pour les métriques les plus riches

Plusieurs métriques de valeur moyenne (M10 variance sizing, M04 remplissage partiel abandonné) atteignent leur pleine valeur uniquement en croisement avec Trade History. Order History seul est moins puissant que Order History + Trade History croisés.

**Conséquence :** Order History est une source complémentaire à Trade History, pas une source autonome. Sa valeur maximale est dans le gap entre les deux, pas dans l'un ou l'autre seul.

---

## 6. Comparaison des trois sources

| Dimension | Trade History | Wallet History | Order History |
|---|---|---|---|
| **Couche analytique** | Exécution | Capital patrimonial | Intention décisionnelle |
| **Question centrale** | Comment l'opérateur trade-t-il ? | Dans quel rapport au capital trade-t-il ? | Quel est son rapport à l'attente et au changement d'avis ? |
| **Signal principal** | Fréquence, sizing, patterns d'exécution, profil comportemental | Injections, réserves, extraction, accumulation | Annulations, patience, architecture d'ordre, price chasing |
| **Ce qu'elle ne peut pas voir** | Intentions avortées, ordres annulés, types d'ordres | Tout ce qui concerne les trades | Prix de marché au moment de l'ordre, modifications d'ordres |
| **Autonomie analytique** | ✅ Forte — pipeline complet existant | ✅ Suffisante — 5 métriques fortes identifiées | ⚠️ Partielle — maximale en croisement avec Trade History |
| **Niveau de confiance général** | Fort — volume de données élevé, pipeline validé | Moyen — nécessite plusieurs périodes | Moyen — limité par absence de prix de marché |
| **Statut dans BMSM** | ✅ Production actif | 🟡 P1/P2 en conception | ✅ Production actif (parseur existant) |
| **Valeur sans les autres sources** | Haute | Haute | Moyenne |
| **Valeur en croisement** | Référence centrale | Contextualise le capital | Révèle le gap intention/exécution |

### Ce que chaque source apporte d'irremplaçable

**Trade History :** Sans elle, on ne sait pas ce qui s'est exécuté. C'est la réalité de l'activité. Aucune autre source ne peut la substituer.

**Wallet History :** Sans elle, on ne sait pas dans quel contexte de capital l'opérateur trade. L'exécution peut sembler cohérente pendant une phase d'extraction de capital ou de rechargement compulsif — invisible dans Trade History.

**Order History :** Sans elle, on ne sait pas ce que l'opérateur a voulu faire et n'a pas fait. Les intentions avortées, la chasse aux prix, l'instabilité de taille de position avant exécution — invisibles dans Trade History. Mais Order History seul, sans Trade History pour le calibrer, perd la moitié de sa valeur.

### Orthogonalité des trois sources

Les trois sources sont **partiellement orthogonales** — elles se recoupent peu mais ne sont pas complètement indépendantes. Le recoupement principal : les ordres FILLED dans Order History ont leur contrepartie exacte dans Trade History. En dehors de cette intersection, les deux sources couvrent des territoires comportementaux distincts.

```
Trade History        : ████████████████░░░░  (exécution — 80% orthogonal à Order History)
Order History        : ░░░░████████████████  (intention — 80% orthogonal à Trade History)
Wallet History       : ████████████████████  (capital — 100% orthogonal aux deux)
```

---

## 7. Verdict

### Test de l'hypothèse

> **Trade History mesure l'exécution. Wallet History mesure le rapport au capital. Order History pourrait mesurer le rapport à l'attente, à la patience et au changement d'avis.**

**L'hypothèse est confirmée — avec une nuance.**

Order History mesure effectivement :
- Le rapport à l'attente : ratio LIMIT/MARKET (M03), délai d'exécution (M06), ordres expirés (M07)
- La patience : délai avant annulation (M02), taux d'annulation (M01)
- Le changement d'avis : taux d'annulation (M01), cancel-reorder (M05), remplissage partiel abandonné (M04)

La nuance : Order History mesure également quelque chose que l'hypothèse n'anticipait pas — **l'architecture d'exécution**. Le choix entre LIMIT et MARKET, l'asymétrie BUY/SELL, l'utilisation des STOP_LIMIT révèlent une politique d'exécution sous-jacente qui va au-delà de la simple patience ou impatience.

L'hypothèse était juste sur le fond et incomplète sur l'étendue.

---

### Réponse à la question centrale

> **Existe-t-il suffisamment de valeur comportementale dans un Order History Binance pour justifier une exploitation future dans Caméléon Engine ?**

**Oui — sous forme d'enrichissement du pipeline existant, pas de chantier autonome.**

### Ce qui justifie cette réponse

**Valeur réelle et différenciante :**
- 5 métriques de forte valeur identifiées (M01–M05)
- 4 d'entre elles révèlent des signaux comportementaux structurellement absents de Trade History
- L'hypothèse centrale est confirmée empiriquement

**Mais pas de chantier autonome :**
- Order History est déjà parsé dans le pipeline actuel (`binance_order.js` — Production actif)
- La valeur maximale d'Order History est dans son croisement avec Trade History, pas seul
- Les métriques les plus intéressantes (M01, M02, M05) nécessitent des seuils personnels calibrés — ce qui renvoie au chantier de Calibration Personnelle Binance V1 (déjà documenté)
- 8 métriques sur 20 ont un niveau de confiance faible en isolation

### Position dans l'architecture existante

| Chantier existant | Comment Order History s'y intègre |
|---|---|
| Pipeline comportemental actuel (`behavior/`) | `binance_order.js` déjà actif — analyse les ordres FILLED |
| Calibration Personnelle Binance V1 | Les seuils personnels d'annulation (M01/M02) alimentent la baseline opérateur |
| BMSM P1 | Le croisement Order × Trade (gap intention/exécution) est prévu dans BMSM |
| patterns.js existant | Cancel-reorder (M05) peut enrichir la détection de rapid_reentry existante |

### Ce que cet audit recommande (sans implémentation)

L'exploitation des métriques Order History les plus différenciantes (D1–D5) devrait s'intégrer dans deux chantiers déjà documentés :

1. **Calibration Personnelle Binance V1** — les métriques M01, M02, M03 contribuent à la baseline personnelle de l'opérateur. Ce sont des seuils personnels, pas des seuils génériques.

2. **BMSM P1 — croisement Order × Trade** — déjà prévu comme signal `intention_gap`. Cet audit confirme que ce signal mérite d'être développé au-delà du simple ratio ordres annulés/exécutés.

**Aucun nouveau chantier n'est nécessaire. Deux chantiers existants s'en trouvent renforcés.**

---

### Tableau de synthèse final

| Dimension | Évaluation |
|---|---|
| Valeur comportementale réelle | ✅ Oui — orthogonale à Trade History sur 80% |
| Métriques forte valeur | ✅ 5 identifiées (M01–M05) |
| Métriques faible valeur ou inutilisables | ⚠️ 8 sur 20 — signal faible ou nécessite données externes |
| Hypothèse centrale confirmée | ✅ Rapport à l'attente, patience, changement d'avis — confirmés |
| Extension de l'hypothèse | ✅ Architecture d'exécution — dimension non anticipée, réelle |
| Autonomie analytique | ⚠️ Partielle — maximale en croisement avec Trade History |
| Justifie un chantier autonome | ❌ Non — parseur déjà existant, intégration dans calibration + BMSM |
| Renforce les chantiers existants | ✅ Calibration Personnelle V1 + BMSM P1 intention_gap |

---

*Order History — Audit comportemental V1*
*2026-05-31 — Exploratoire · Aucune implémentation · Aucun code*
