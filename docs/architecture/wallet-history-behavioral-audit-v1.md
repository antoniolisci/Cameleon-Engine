# Wallet History — Audit comportemental V1

**Statut :** Exploratoire · Audit comportemental · Aucune implémentation
**Date :** 2026-05-31
**Nature :** Audit architectural et comportemental — pas de code, pas de roadmap

**Sources couvertes :**
- Transaction History (dépôts, retraits, transferts internes, conversions)
- Earn History (flexible earn, locked earn, staking, rewards)
- Wallet Snapshot (soldes par date — si disponible)

**Exclusions strictes :**
- Toute donnée issue du trading (Trade History / Order History)
- Tout calcul de PnL
- Tout signal de marché
- Toute IA ou système prédictif

**Question centrale :**
> Existe-t-il suffisamment de valeur comportementale dans un Wallet History Binance pour justifier un chantier dédié ?

---

## Ce que les sources contiennent réellement

### Transaction History

| Opération | Contenu | Pertinence comportementale |
|---|---|---|
| Deposit | Actif · montant · date | Capital entrant depuis l'extérieur |
| Withdraw | Actif · montant · date · adresse | Capital sortant du système |
| Transfer (internal) | Actif · montant · de→vers (Spot/Earn/Futures) | Réallocation interne |
| Conversion | Actif source · actif cible · montant · taux | Rebalancement de portefeuille |
| Small Assets Conversion | Poussière → BNB | Comportement de gestion du détail |
| Fee | Actif · montant | Non pertinent seul |
| Commission Rebate | Actif · montant | Non pertinent seul |

### Earn History

| Opération | Contenu | Pertinence comportementale |
|---|---|---|
| Subscribe Flexible | Actif · montant · date | Mise en réserve liquide |
| Redeem Flexible | Actif · montant · date | Retrait de réserve |
| Subscribe Locked | Actif · montant · durée · date | Mise en réserve avec engagement |
| Redeem Locked | Actif · montant · date | Récupération d'engagement |
| Interest | Actif · montant · date | Non pertinent seul |
| Staking Reward | Actif · montant · date | Non pertinent seul |

### Ce que ces sources ne contiennent pas

- Aucune information sur les trades
- Aucun prix de marché au moment de l'opération
- Aucune intention déclarée
- Aucun solde total absolu (sauf Wallet Snapshot, si disponible)

---

## 20 métriques comportementales identifiées

---

### FORTE VALEUR

---

#### M01 — Régularité des injections de capital

**Ce qu'elle mesure réellement :** L'écart-type du délai entre deux dépôts consécutifs. Un faible écart-type indique un comportement d'accumulation planifiée (type DCA capital). Un écart-type élevé indique des injections réactives à des événements.

**Pourquoi elle est intéressante :** Elle distingue deux profils fondamentalement différents : l'opérateur qui construit son capital de manière délibérée, et celui qui injecte du capital sous pression (opportunité perçue, perte à compenser, impulsion). C'est une métrique de discipline patrimoniale, pas de performance.

**Faux positifs :** Un opérateur peut avoir une régularité apparente parce qu'il reçoit un salaire fixe — la régularité reflète alors un calendrier de revenus, pas une intention d'accumulation. Inversement, une irrégularité peut refléter des revenus variables (freelance, bonus), pas une impulsivité.

**Niveau de confiance :** Moyen — interprétable seulement sur ≥ 6 dépôts. Nécessite un corpus de ≥ 4 mois.

---

#### M02 — Ratio net dépôts / retraits sur période glissante

**Ce qu'elle mesure réellement :** La direction du capital sur une période donnée. Un ratio > 1 indique que l'opérateur met plus de capital dans le système qu'il n'en retire — mode accumulation. Un ratio < 1 indique l'inverse — mode extraction ou consommation.

**Pourquoi elle est intéressante :** Elle révèle si l'opérateur considère Binance comme un outil de construction patrimoniale ou comme une source de revenus à extraire. Un opérateur en mode accumulation constant a un profil de capital radicalement différent d'un opérateur qui extrait régulièrement ses gains.

**Faux positifs :** Un retrait massif unique (achat immobilier, urgence médicale, fin d'activité) fait chuter le ratio temporairement sans signifier un changement de comportement. À pondérer sur la durée.

**Niveau de confiance :** Fort — peu sensible au bruit si calculé sur des fenêtres de ≥ 3 mois.

---

#### M03 — Durée médiane des positions en earn

**Ce qu'elle mesure réellement :** Le temps médian qu'un actif passe en earn (flexible ou locked) avant d'être racheté. Une durée longue indique une réserve véritable. Une durée courte indique que l'earn est utilisé comme parking temporaire avant redéploiement.

**Pourquoi elle est intéressante :** Elle révèle si les positions earn sont une couche de patience ou une salle d'attente avant trading. Un opérateur qui garde ses stablecoins en earn 90 jours a un rapport au capital fondamentalement différent de celui qui les redemande après 3 jours.

**Faux positifs :** Un locked earn impose une durée minimale — la durée observée peut être contrainte par le produit, pas par le comportement. Il faut séparer flexible earn (comportement libre) de locked earn (contrainte contractuelle).

**Niveau de confiance :** Fort sur flexible earn · Faible sur locked earn (durée imposée par le produit).

---

#### M04 — Taux de rotation earn → redéploiement actif

**Ce qu'elle mesure réellement :** La fréquence à laquelle les actifs sortent de earn pour être transférés vers le compte Spot (puis vraisemblablement tradés, même si on n'observe pas les trades). Un taux de rotation élevé = earn utilisé comme buffer, pas comme réserve. Un taux bas = earn est une frontière stable.

**Pourquoi elle est intéressante :** C'est la métrique la plus révélatrice du comportement de réserve réel. L'opérateur qui perturbe fréquemment ses positions earn, même pour des raisons "rationnelles", démontre une frontière poreuse entre réserve et capital actif. L'opérateur qui laisse ses earn positions intactes sur de longues périodes démontre une discipline structurelle de gestion patrimoniale.

**Faux positifs :** Une rédemption earn peut être motivée par un retrait externe (sortie de Binance), pas par un redéploiement trading. Sans observer ce qui suit la rédemption, on ne peut pas distinguer les deux. Le croisement avec Transaction History (retrait suivant) permet de réduire ce biais.

**Niveau de confiance :** Moyen — nécessite contexte post-rédemption pour trancher.

---

#### M05 — Comportement de retrait en cluster

**Ce qu'elle mesure réellement :** La détection de plusieurs retraits rapprochés dans le temps (ex. 3 retraits en 72h), ou d'un retrait représentant une fraction inhabituellement élevée du capital estimé. Ce pattern est une signature comportementale de stress patrimonial.

**Pourquoi elle est intéressante :** Les retraits en cluster sont l'un des rares signaux observables de réponse à une situation de pression (perte majeure, peur systémique, urgence externe). Ils ne prouvent pas le stress — mais ils corrèlent avec des contextes de perturbation. C'est un proxy comportemental indirect, pas une mesure d'état.

**Faux positifs :** Des retraits multiples peuvent correspondre à un virement en plusieurs fois pour contourner des limites bancaires, ou à un changement de portefeuille matériel. Ces comportements techniques sont indiscernables d'un retrait de stress par les données seules.

**Niveau de confiance :** Faible en isolation · Moyen si corrélé avec une période de volatilité de marché documentée.

---

### VALEUR MOYENNE

---

#### M06 — Amplitude des dépôts (coefficient de variation)

**Ce qu'elle mesure réellement :** La dispersion des montants de dépôt autour de leur moyenne. Un CV faible = dépôts de taille constante (automatisés ou disciplinés). Un CV élevé = dépôts de tailles très variables (opportunistes, réactifs).

**Pourquoi elle est intéressante :** Combinée à M01 (régularité), elle affine le profil d'injection : régulier + CV faible = accumulation systématique · régulier + CV élevé = rythme fixe mais montants modulés selon perceptions · irrégulier + CV élevé = comportement purement réactif.

**Faux positifs :** Les revenus variables (bonus annuel, dividendes) créent un CV naturellement élevé sans signifier d'impulsivité. Difficile à interpréter sans contexte.

**Niveau de confiance :** Moyen — informatif uniquement en combinaison avec M01.

---

#### M07 — Ratio actifs stables (stablecoins) en earn vs actifs volatils en earn

**Ce qu'elle mesure réellement :** La proportion du capital earn placé en stablecoins (USDT, BUSD, USDC) versus en actifs volatils (BTC, ETH, BNB). Un ratio stablecoin élevé = logique de préservation de capital. Un ratio volatil élevé = logique de conviction de holding.

**Pourquoi elle est intéressante :** Elle révèle le rapport de l'opérateur au risque de son capital de réserve. Un opérateur qui met BTC en earn pendant 6 mois fait un pari comportemental différent de celui qui parque des USDT. Le premier exprime une conviction à long terme ; le second exprime une recherche de rendement sans risque.

**Faux positifs :** Certains actifs n'ont pas d'option earn disponible, ce qui peut biaiser le ratio mécaniquement. Le disponible en earn sur Binance varie selon les périodes.

**Niveau de confiance :** Moyen — sensible à l'offre earn disponible, pas uniquement au comportement.

---

#### M08 — Fréquence de conversion inter-actifs

**Ce qu'elle mesure réellement :** Le nombre de conversions directes (hors trading) entre actifs sur une période donnée. Les conversions fréquentes indiquent une activité de rebalancement ou de réallocation de portefeuille. Les conversions rares indiquent une allocation stable.

**Pourquoi elle est intéressante :** Elle distingue l'opérateur qui gère activement la composition de son capital (rebalancement) de celui qui laisse son allocation évoluer passivement. C'est une mesure d'intentionnalité patrimoniale.

**Faux positifs :** Les conversions de poussière (dust) sont automatiques ou de routine et ne reflètent pas une décision de gestion. Il faut filtrer les conversions < seuil de montant significatif.

**Niveau de confiance :** Moyen — nécessite filtrage des micro-conversions.

---

#### M09 — Stabilité de la composition du portefeuille earn dans le temps

**Ce qu'elle mesure réellement :** Le nombre d'actifs distincts qui apparaissent dans les positions earn sur différentes périodes. Une composition stable = stratégie d'earn définie. Une composition changeante = tâtonnement ou réactivité à l'offre.

**Pourquoi elle est intéressante :** Un opérateur qui met systématiquement les mêmes actifs en earn démontre une politique patrimoniale cohérente. Un opérateur qui essaie constamment de nouveaux produits earn démontre une sensibilité aux promotions ou une absence de stratégie définie.

**Faux positifs :** L'évolution de l'offre earn Binance (nouveaux produits, fermetures) force parfois des changements indépendants de la volonté de l'opérateur.

**Niveau de confiance :** Moyen — sensible aux modifications de l'offre plateforme.

---

#### M10 — Cyclicité dépôt → earn → rédemption

**Ce qu'elle mesure réellement :** L'existence d'un cycle répétable : l'opérateur dépose → transfère en earn → redemande → [redéploie ou retire]. La régularité de ce cycle révèle si l'opérateur a une politique structurée de gestion du capital ou une gestion ad hoc.

**Pourquoi elle est intéressante :** Un cycle régulier est le signe d'un système personnel de gestion patrimoniale, même rudimentaire. L'absence de cycle = gestion réactive. La présence d'un cycle = gestion planifiée. C'est une métrique de maturité comportementale patrimoniale.

**Faux positifs :** Des cycles apparents peuvent être produits par des contraintes externes (durée locked earn) plutôt que par une intention de l'opérateur.

**Niveau de confiance :** Moyen — nécessite ≥ 3 cycles complets observables.

---

#### M11 — Délai moyen entre dépôt et mise en earn

**Ce qu'elle mesure réellement :** Le temps entre l'arrivée d'un dépôt sur le compte Spot et son transfert en earn. Un délai court = automatisme ou discipline de mise en réserve rapide. Un délai long = le capital reste disponible longtemps avant d'être "sécurisé".

**Pourquoi elle est intéressante :** Il révèle si l'opérateur a un réflexe de mise en réserve ou si le capital stagne en compte courant avant d'éventuellement être tradé ou épargné. C'est un indicateur de la priorité accordée à la construction de réserve vs à la disponibilité immédiate.

**Faux positifs :** L'absence de mise en earn rapide peut être due à une intention de trader rapidement le dépôt — ce qui est un comportement de trading, hors périmètre de cet audit.

**Niveau de confiance :** Faible — difficile à séparer de l'intention de trading sans croiser Trade History.

---

#### M12 — Tendance nette du capital sur horizon long

**Ce qu'elle mesure réellement :** La direction du capital total (dépôts cumulés − retraits cumulés) sur des fenêtres de 3, 6, 12 mois. Une tendance croissante = mode construction. Une tendance stable = mode préservation. Une tendance décroissante = mode extraction ou consommation.

**Pourquoi elle est intéressante :** C'est la lecture la plus macroscopique du comportement patrimonial. Elle permet de caractériser une période entière en un mot : l'opérateur était-il en phase de construction, de préservation ou d'extraction ?

**Faux positifs :** Sans connaître les montants absolus (violation privacy), la tendance relative peut être calculée via les ratios, mais perd en précision. Une sortie massive unique (immobilier) crée une tendance décroissante artificielle.

**Niveau de confiance :** Moyen — robuste sur longues périodes, fragile sur courtes.

---

### FAIBLE VALEUR

---

#### M13 — Taux de conversion de poussière (dust)

**Ce qu'elle mesure réellement :** La fréquence à laquelle l'opérateur convertit les petits soldes résiduels en BNB. Indique un comportement de "rangement" du portefeuille.

**Pourquoi elle est intéressante (théoriquement) :** Un opérateur qui convertit régulièrement sa poussière démontre une attention au détail de son portefeuille.

**Faux positifs :** Cette action peut être déclenchée automatiquement par Binance ou par des promotions. Le signal est trop faible et trop bruité pour être significatif seul.

**Niveau de confiance :** Faible — signal anecdotique.

---

#### M14 — Ratio retraits de grande taille

**Ce qu'elle mesure réellement :** La proportion des retraits qui dépassent un seuil relatif (ex. > 30% du capital estimé) par rapport à l'ensemble des retraits.

**Pourquoi elle est intéressante (théoriquement) :** Un retrait de grande taille peut signaler une décision patrimoniale importante (sortie partielle, achat immobilier, réallocation vers autre plateforme).

**Faux positifs :** Sans connaître le capital total absolu (violation privacy), le "seuil relatif" est impossible à calculer précisément. La métrique perd sa substance.

**Niveau de confiance :** Faible — non calculable sans données de capital absolu.

---

#### M15 — Fréquence des transferts internes (Spot ↔ Earn ↔ Futures)

**Ce qu'elle mesure réellement :** Le nombre de transferts internes entre sous-comptes Binance par mois.

**Pourquoi elle est intéressante (théoriquement) :** Un grand nombre de transferts internes indique une gestion active de l'allocation entre compartiments.

**Faux positifs :** Les transferts internes sont souvent mécaniquement liés aux activités de trading (alimenter le compte Futures). Impossible d'interpréter sans connaître le contexte.

**Niveau de confiance :** Faible — signal trop couplé au trading pour être interprété seul.

---

#### M16 — Comportement post-dépôt immédiat

**Ce qu'elle mesure réellement :** Ce qui se passe dans les 24h suivant un dépôt — est-ce que l'actif va immédiatement en earn, reste en Spot, ou disparaît vers Futures ?

**Pourquoi elle est intéressante (théoriquement) :** Révèle l'intention primaire derrière le dépôt.

**Faux positifs :** Impossible à interpréter sans accès au Trade History (ce qui est exclu du périmètre). La destination post-dépôt vers Spot sans earn ni retrait peut signifier trading immédiat ou simple attente — indiscernables ici.

**Niveau de confiance :** Faible — nécessite croisement Trade History pour être utile.

---

#### M17 — Récompenses earn comme indicateur de durée d'engagement

**Ce qu'elle mesure réellement :** Le volume cumulé de rewards earn comme proxy de la durée totale passée en earn (plus les rewards sont élevés, plus l'engagement a été long).

**Pourquoi elle est intéressante (théoriquement) :** Permet d'estimer la durée d'engagement sans avoir les timestamps précis de chaque position.

**Faux positifs :** Les taux APY varient massivement selon les produits et les périodes. Des rewards élevés peuvent venir d'un APY promotionnel court plutôt que d'un engagement long. Trop de variables confondantes.

**Niveau de confiance :** Faible — trop de variables confondantes (APY, promotions, montant).

---

#### M18 — Présence ou absence d'earn sur stablecoins

**Ce qu'elle mesure réellement :** Si l'opérateur utilise l'earn pour ses stablecoins (indicateur de gestion de trésorerie) ou les laisse en compte courant sans rendement.

**Pourquoi elle est intéressante (théoriquement) :** Un opérateur qui met systématiquement ses USDT en earn flexible exprime un comportement de trésorerie optimisée, même rudimentaire.

**Faux positifs :** Certaines périodes, Binance a suspendu ou fortement réduit les APY stablecoin, rendant l'earn peu attractif indépendamment du comportement. La décision peut être rationnelle (taux nul) plutôt que comportementale.

**Niveau de confiance :** Faible — trop dépendant de l'offre plateforme.

---

#### M19 — Concentration géographique des retraits (adresses distinctes)

**Ce qu'elle mesure réellement :** Le nombre d'adresses de retrait distinctes utilisées sur une période.

**Pourquoi elle est intéressante (théoriquement) :** Un opérateur avec une seule adresse de retrait (son hardware wallet personnel) exprime un profil différent de celui qui retire vers de nombreuses adresses.

**Faux positifs :** Les adresses de retrait sont des PII. Cette métrique viole les règles privacy-first du projet. À exclure formellement.

**Niveau de confiance :** Non applicable — **exclusion privacy formelle.**

---

#### M20 — Délai entre rédemption earn et retrait externe

**Ce qu'elle mesure réellement :** Une fois que l'opérateur rachète une position earn, combien de temps avant que cet actif quitte Binance (retrait externe) ? Court délai = earn était la dernière étape avant sortie. Long délai = l'actif reste dans l'écosystème après rédemption.

**Pourquoi elle est intéressante (théoriquement) :** Révèle si l'earn est utilisé comme antichambre de la sortie de fonds ou comme réserve intérieure au système.

**Faux positifs :** Si l'actif reste en Spot après rédemption sans retrait externe, on ne sait pas s'il va être tradé ou simplement détenu — ce qui nécessite Trade History.

**Niveau de confiance :** Faible — nécessite croisement Trade History ou retrait externe observable.

---

## Les 5 métriques les plus différenciantes pour Caméléon Engine

Ces cinq métriques sont sélectionnées selon un critère unique : elles révèlent quelque chose que Trade History ne peut pas révéler.

---

### D1 — Régularité des injections de capital (M01)

**Pourquoi différenciante :** Trade History dit comment l'opérateur trade. M01 dit comment il alimente son activité. Un opérateur qui dépose de manière régulière et prévisible a une relation au risque capital fondamentalement différente d'un opérateur qui injecte de l'argent sous pression ou après une série de pertes. Cette métrique révèle la santé du rapport au capital *avant* le trading, pas pendant.

**Ce qu'elle apporte à Caméléon Engine :** Un contexte structurel. Un score comportemental de 42 avec un opérateur en accumulation disciplinée (M01 faible écart-type) se lit différemment qu'un score de 42 avec un opérateur en injection réactive (M01 fort écart-type).

---

### D2 — Durée médiane des positions en earn flexible (M03)

**Pourquoi différenciante :** C'est la métrique de patience patrimoniale la plus pure de l'audit. Elle ne dépend pas du marché, ne dépend pas des trades, et ne peut pas être calculée depuis Trade History. Elle mesure uniquement la capacité de l'opérateur à laisser une réserve en place sans la toucher.

**Ce qu'elle apporte à Caméléon Engine :** Un indicateur de discipline de réserve. Un opérateur dont la durée médiane earn est de 90 jours est structurellement différent d'un opérateur dont la durée est de 4 jours — même si leurs scores comportementaux de trading sont identiques.

---

### D3 — Taux de rotation earn → compte actif (M04)

**Pourquoi différenciante :** C'est le test de cohérence de la réserve. Beaucoup d'opérateurs déclarent avoir une "réserve" — peu ont une frontière earn stable. M04 mesure si la réserve est réelle ou déclaratoire. Une rotation élevée révèle une frontière poreuse entre réserve et capital actif, indépendamment de ce que l'opérateur dit de lui-même.

**Ce qu'elle apporte à Caméléon Engine :** Un calibrateur de profil de risque réel. Un opérateur avec M04 élevé (earn utilisé comme parking) a un profil de risque différent de ce que son comportement de trading laisse croire — il n'a pas de réserve stable.

---

### D4 — Ratio net dépôts / retraits sur horizon glissant (M02)

**Pourquoi différenciante :** Elle positionne l'opérateur dans un de trois modes fondamentaux : construction, préservation, extraction. Ces modes changent sur des échelles de mois, pas de jours. Trade History ne peut pas révéler ce mode — il montre l'activité, pas la direction patrimoniale.

**Ce qu'elle apporte à Caméléon Engine :** Un contexte macroscopique de lecture. Le même comportement de trading en mode construction (M02 > 1) et en mode extraction (M02 < 1) indique des réalités très différentes pour l'opérateur.

---

### D5 — Comportement de retrait en cluster (M05)

**Pourquoi différenciante :** C'est le seul proxy disponible dans ces sources d'un état de stress patrimonial aigu. Trade History peut révéler l'hyperactivité (overtrading), M05 révèle la fuite — quand l'opérateur sort du système en urgence. Ces deux signaux couvrent des réponses comportementales complémentaires : l'un est l'accélération frénétique, l'autre est l'arrêt brutal.

**Ce qu'elle apporte à Caméléon Engine :** Un signal de rupture comportementale que le moteur actuel ne peut pas détecter. L'overtrading existe dans Trade History. La fuite de capital n'y est pas.

---

### Synthèse des 5 métriques différenciantes

| Rang | Métrique | Signal unique | Ce que Trade History ne dit pas |
|---|---|---|---|
| D1 | Régularité des injections (M01) | Discipline vs réactivité patrimoniale | Comment l'opérateur alimente son activité |
| D2 | Durée earn flexible (M03) | Patience de réserve réelle | Si l'opérateur peut laisser un capital en place |
| D3 | Taux de rotation earn (M04) | Frontière réserve / actif | Si la réserve est réelle ou déclaratoire |
| D4 | Ratio net dépôts/retraits (M02) | Mode patrimonial (construction / extraction) | La direction macroscopique du capital |
| D5 | Retrait en cluster (M05) | Stress patrimonial aigu | La fuite de capital sous pression |

---

## Réponse à la question centrale

> **Existe-t-il suffisamment de valeur comportementale dans un Wallet History Binance pour justifier un chantier dédié ?**

---

### Réponse : Oui — mais sous une condition stricte et une forme précise

La valeur existe. Elle est réelle. Elle est complémentaire à Trade History, pas redondante. Mais elle ne justifie pas un chantier autonome — elle justifie une intégration dans BMSM (déjà documenté) comme couche de contexte patrimonial.

---

### Ce que Wallet History apporte que Trade History ne peut pas apporter

Trade History révèle **comment** l'opérateur trade.
Wallet History révèle **dans quel rapport au capital** il trade.

Ces deux lectures sont orthogonales. Un opérateur peut être discipliné dans ses trades et chaotique dans sa gestion de capital (injections réactives, earn en salle d'attente, retraits en cluster). L'inverse est également vrai.

La valeur de Wallet History est précisément cette orthogonalité : elle ajoute une dimension que l'analyse des trades ne peut produire, quelle que soit la quantité de données trade disponibles.

---

### Ce que Wallet History ne peut pas faire seul

| Limite | Raison |
|---|---|
| Interpréter une durée de détention earn | Nécessite le contexte de marché (non disponible) |
| Distinguer retrait de stress vs retrait planifié | Impossibilité structurelle sans annotation |
| Calculer le capital absolu total | Violation privacy-first — non calculable |
| Révéler l'intention derrière une rédemption earn | Nécessite ce qui suit (trade ou retrait) |
| Valider M05 (retrait cluster) | Nécessite corrélation avec contexte de marché externe |

Cinq des 20 métriques identifiées ont un niveau de confiance faible en isolation. Deux métriques (M19 adresses retrait, M14 ratio grandes sorties) sont structurellement limitées par les contraintes privacy. Une métrique (M19) est formellement exclue.

---

### Ce que cet audit confirme sur BMSM

Le chantier BMSM (Binance Multi-Source Memory, `binance-multi-source-memory.md`) est architecturalement correct. Il planifie déjà :
- P1 — Transaction History (M01, M02, M05, M12)
- P2 — Earn History + croisements (M03, M04, M07, M10, M11)

Les 5 métriques différenciantes identifiées ici (D1–D5) recoupent exactement les signaux prévus en P1 et P2.

**Cet audit ne modifie pas BMSM. Il le confirme.**

---

### Ce que cet audit apporte de nouveau

Deux choses que BMSM n'avait pas encore formalisées :

**1. La hiérarchie des métriques.** BMSM décrit les sources et les signaux bruts. Cet audit classe les métriques par valeur réelle et identifie les 5 différenciantes. C'est une information utile pour prioriser l'implémentation P1/P2 quand le signal terrain sera reçu.

**2. La confirmation de l'orthogonalité.** BMSM affirme que Transaction + Earn ajoutent une couche. Cet audit démontre pourquoi : la dimension patrimoniale est structurellement absente de Trade History et ne peut pas en être déduite.

---

### Verdict final

| Dimension | Évaluation |
|---|---|
| Valeur comportementale réelle | ✅ Oui — orthogonale à Trade History |
| Métriques forte valeur disponibles | ✅ 5 identifiées (M01–M05) |
| Métriques faible valeur ou inutilisables | ⚠️ 8 sur 20 — signal trop faible ou trop bruité |
| Justifie un chantier dédié autonome | ❌ Non — intégration dans BMSM P1/P2 suffisante |
| Justifie la priorité de BMSM P1/P2 | ✅ Oui — cet audit renforce la décision |
| Condition d'ouverture | Signal terrain — opérateur avec Transaction + Earn History disponibles |

**La valeur est réelle. La forme est l'intégration dans BMSM, pas un chantier séparé.**

---

*Wallet History — Audit comportemental V1*
*2026-05-31 — Exploratoire · Aucune implémentation · Aucun code*
