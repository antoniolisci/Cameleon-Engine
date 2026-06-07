> **ARCHIVÉ**
>
> Ce document décrit un plan désormais implémenté.
>
> Il est conservé comme trace historique du développement de Caméléon Engine.
>
> Pour l'état actuel du système, consulter :
> `docs/architecture/canonical_motor_state_2026.md`
>
> Statut : Implémenté et clôturé.
>
> Ne plus utiliser ce document comme référence d'architecture active.

# Plan de réduction structurelle V1 — Caméléon Engine
## Document opérationnel. Autorité : manifeste produit.

> Ce document traduit l'audit V1 Reduction Pass en plan d'intervention séquencé.
> Il définit quoi couper, dans quel ordre, avec quels critères de validation.
> Il ne modifie aucun code. Il prépare les patches.
> À consulter avant chaque intervention sur le cockpit.

---

## Phrase directrice de référence

> **Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre.**

Chaque décision de coupe se valide contre cette phrase.
Si la coupe rend le cockpit plus calme et la décision plus lisible : elle est juste.
Si elle retire de l'information irremplaçable : elle est prématurée.

---

## Diagnostic de départ

Le cockpit V1 pré-réduction contient :

- **37+ représentations visibles** de 5 couches d'information distinctes
- **11 sections** dans la seule colonne droite (vue Moteur active)
- **4 blocs irréductibles** identifiés
- **7 blocs supprimables** sans perte d'information
- **4 fusions** nécessaires
- **4 blocs à déplacer** hors vue Moteur
- **3 blocs à clarifier** avant décision finale

La cible V1 : **6 à 7 blocs** dans la colonne droite. Une hiérarchie lisible en moins de 10 secondes.

---

## Section 1 — Noyau V1 irréductible

Ces blocs ne sont pas touchés. Ils constituent le minimum viable du cockpit décisionnel.

---

### NOYAU-1 — Verdict moteur

**ID HTML :** `section.verdict-shell`

**Pourquoi irréductible :**
C'est le seul bloc qui produit la décision et en assume la responsabilité narrative. Il contient : verdict (`verdictImmediate`), posture autorisée (`verdictAllowed`, `verdictNext`), risque à éviter (`verdictBlocked`, `verdictWatch`), bloc premium (`premiumVerdictLabel`).
Sans lui, le cockpit n'a plus de point de référence autoritaire.

**Contrainte :**
Ne pas modifier son contenu, sa position, ni sa hiérarchie visuelle.

---

### NOYAU-2 — Pourquoi cette décision

**ID HTML :** `section.pourquoi-shell` → `#whyDecisionPrimary`, `#whyDecisionSecondary`

**Pourquoi irréductible :**
Seul bloc qui expose la causalité du verdict. Il répond à "pourquoi" là où le Verdict répond à "quoi". Il respecte le principe d'honnêteté narrative du manifeste.

**Contrainte :**
Ne pas modifier sa position relative au Verdict moteur. Il doit suivre immédiatement le verdict.

---

### NOYAU-3 — Plan d'action

**ID HTML :** `#actionPlanCard` → `#actionPlan`

**Pourquoi irréductible :**
Seul bloc qui traduit le verdict en guidance opérationnelle concrète (3 lignes dérivées de `decisionState`). Même si la forme peut être simplifiée, la fonction est irremplaçable.

**Contrainte de forme :**
Réduire à une phrase directrice unique (pas trois lignes) — mais cela est une décision de patch ultérieur, pas une condition de conservation.

**Contrainte :**
Supprimer le sous-bloc **Choix actuel** lors du patch dédié (voir Section 2). Le conteneur `#actionPlanCard` lui, reste.

---

### NOYAU-4 — Scénarios SI → ALORS

**ID HTML :** `section.side-card` → `#scIfValidation`, `#scIfRejection`, `#scIfStagnation`

**Pourquoi irréductible :**
Seul bloc prospectif du cockpit. Il anticipe les trois futurs possibles selon l'évolution de la validation — information absente de tous les autres blocs.

**Contrainte :**
Ne pas fusionner avec le Plan d'action. Les scénarios sont conditionnels (Si…), le plan est directionnel (maintenant). Ce sont deux temporalités distinctes.

---

### NOYAU-5 — Sortie technique (payload JSON)

**ID HTML :** `section.secondary-technical-card` → `details.technical-shell` → `#jsonOutput`

**Pourquoi irréductible :**
Honnête dans sa nature. Discret par défaut (collapsible). Indispensable pour l'audit et le debug. Aucun coût cognitif en conditions normales.

**Contrainte :**
Rester collapsible. Ne jamais devenir visible par défaut.

---

## Section 2 — Blocs à supprimer

Ces blocs seront retirés du DOM. Aucune information unique ne sera perdue.
Classés par ordre croissant de risque opérationnel.

---

### SUPPR-1 — Choix actuel

**Localisation :** injecté dynamiquement dans `#actionPlan` par `bindDecisionAnchor()` dans `render.js`

**Motif de suppression :**
Les deux boutons (`Je suis le moteur` / `Je passe outre`) sont des `<div>` sans impact sur le moteur, le payload, la validation, ou le rendu. Ils écrivent uniquement dans `localStorage["cameleon_user_decisions_v1"]` — tableau jamais consulté en runtime.

Ils créent une illusion d'agentivité. L'utilisateur qui clique "Je passe outre" croit modifier quelque chose. Il ne modifie rien.

**Ce qui disparaît :**
- La fausse interactivité
- Le message éphémère de 8 secondes
- L'écriture dans `cameleon_user_decisions_v1`

**Ce qui reste :**
- Le conteneur `#actionPlan` et son contenu réel (les 3 lignes de guidance)

**Risque patch :** très faible. Aucun autre bloc ne lit ce widget.

---

### SUPPR-2 — Hero overlay panel

**Localisation :** `div.hero-overlay-panel` (après `section.hero`, avant `#guidanceCard`)

**Contenu :** `#confidenceHero`, `#modeHero`, `#heroActionMode`, `#snapshotCountHero`, `#heroAllowedDetail`, `#heroPriorityDetail`

**Motif de suppression :**
Doublon intégral du Hero KPI grid qui précède. Chaque champ a son équivalent exact dans la section hero ou dans le Centre de décision.

**Ce qui disparaît :**
La répétition du verdict sous un troisième format dans la zone hero.

**Risque patch :** très faible. Les IDs alimentés par render.js peuvent être retirés du DOM — render.js écrira dans le vide (appels `setText()` sur des IDs inexistants sont silencieux).

**Note :** vérifier que `render.js` ne conditionne aucune logique sur ces IDs avant suppression.

---

### SUPPR-3 — Lecture rapide

**Localisation :** `section.structured-shell.tab-panel` (colonne gauche, sous "Pourquoi cette décision")

**Contenu :** 3 structured-cards — `#structuredMarketText`, `#structuredProfileText`, `#structuredValidationText`

**Motif de suppression :**
Reformulation en trois phrases de ce que le Verdict moteur exprime déjà. Sa présence est le symptôme du problème — elle signale que le Verdict moteur n'est pas suffisamment lisible. La réponse correcte est de clarifier le Verdict, pas d'en ajouter une traduction.

**Ce qui disparaît :**
Une couche narrative redondante.

**Risque patch :** faible. Aucun autre bloc ne dépend de ce rendu.

---

### SUPPR-4 — Diagnostic mémoire (vue Moteur)

**Localisation :** colonne droite, `section.side-card` → `#storageStatus`, `#storageSize`, `#lastSaved`, `#snapshotCount`

**Motif de suppression de la vue Moteur :**
Un trader en session active n'a aucun besoin de connaître la taille de son localStorage en KB. Cette information appartient aux paramètres ou à l'onglet Mémoire — pas au cockpit décisionnel.

**Ce qui disparaît :**
L'affichage dans la vue Moteur.

**Ce qui reste :**
Les données elles-mêmes (localStorage). Le bloc peut être déplacé vers Mémoire (voir Section 4).

**Risque patch :** faible.

---

### SUPPR-5 — Suivi de trade (live)

**Localisation :** colonne droite, `section.side-card` → `#ltTradeStatus`, `#ltImmediateAction`, `#ltIfContinuation`, `#ltIfRejection`, `#ltProtection`, `#ltGainManagement`

**Motif de suppression :**
Le moteur ne connaît pas l'état réel d'une position ouverte (prix d'entrée, direction, P&L courant). Les 6 champs de ce bloc sont soit des placeholders à "—", soit des recommandations génériques dérivées de `decisionState`.

Présenter "Gestion du gain : sécuriser 50%" sans savoir si une position est ouverte est structurellement malhonnête. C'est de la précision simulée.

**Ce qui disparaît :**
Des champs qui promettent ce que le moteur ne peut pas calculer.

**Risque patch :** faible sur la logique, modéré sur la perception — ce bloc a une présence visuelle forte (6 champs). Valider que son contenu est bien générique avant suppression.

**Pré-condition :** confirmer visuellement que ces champs affichent des valeurs pré-écrites par état et non calculées à partir de données de position réelles.

---

### SUPPR-6 — Trade Setup / Entrée concrète

**Localisation :** colonne droite, `section.side-card` → `#tsEntryPoint`, `#tsValidationCondition`, `#tsInvalidation`, `#tsTiming`

**Motif de suppression :**
Même problème que Suivi de trade. Le moteur ne connaît pas le prix d'entrée souhaité par l'utilisateur. "Point d'entrée" et "Invalidation" ne peuvent pas être calculés sans données de prix spécifiques que le formulaire ne collecte pas.

**Pré-condition :** confirmer visuellement que ces champs affichent "—" ou des valeurs génériques, non des calculs de prix.

**Risque patch :** modéré. Si ces champs contiennent un contenu réel et utile (même générique), la décision sera réévaluée.

---

### SUPPR-7 — Agent grid (colonne gauche)

**Localisation :** `div.agent-grid` → deux `agent-card` : Mission + Cadre d'exécution
**IDs :** `#profileReaction`, `#allowedActions`, `#blockedActions`, `#executionFrame`, `#postureActions`, `#priorityActions`

**Motif de suppression :**
4 colonnes de listes (autorisé / interdit / posture / priorité) qui reformulent ce que le Verdict moteur présente déjà en deux lignes directes. La liste `#allowedActions` / `#blockedActions` est également visible dans le Debug Brain sidebar.

**Ce qui disparaît :**
La représentation en 4 listes de la même décision.

**Ce qui reste :**
Le Verdict moteur comme référence unique pour les actions autorisées/interdites.

**Risque patch :** modéré. Vérifier que `#profileReaction` n'est pas le seul endroit où la réaction profil est exposée en language narratif.

---

## Section 3 — Blocs à fusionner

Ces blocs ne sont pas supprimés — ils sont consolidés pour réduire la redondance sans perdre l'information différentielle.

---

### FUSION-1 — Niveau d'exécution → dans Verdict moteur

**Blocs concernés :**
- Source : `section.side-card` → `#execPermission`, `#execActionType`, `#execIntensity`, `#execRisk`
- Destination : `section.verdict-shell`

**Ce qui est conservé :**
`#execPermission` uniquement (Hors exécution / Attendre / Préparer / Exécuter) — information non présente littéralement dans le Verdict moteur.

**Ce qui est supprimé :**
`#execActionType` (reformule `verdictAllowed`), `#execIntensity` (déductible), `#execRisk` (reformule `alertRiskValue`).

**Résultat attendu :**
Un seul champ de permission d'exécution intégré dans la zone Verdict. Suppression du bloc "Niveau d'exécution" en tant que section indépendante.

**Risque patch :** faible. La logique de calcul dans `renderExecutionLevel()` reste intacte — seule la présentation change.

---

### FUSION-2 — Risk / Money Management → dans Gestion de position

**Blocs concernés :**
- Source : `section.side-card` → `#rmRiskPerTrade`, `#rmPositionSize`, `#rmMaxExposure`, `#rmRrMinimum`
- Destination : `section.side-card` → `#pmSize`, `#pmMode`, `#pmEntry`, `#pmExit`, `#pmMaxRisk`, `#pmStatus`

**Logique :**
Les deux blocs parlent de la même chose (exposition, taille, risque par trade) dans deux grilles séparées. La fusion produit un seul bloc de 6 à 8 champs couvrant les deux périmètres.

**Champ différentiel à préserver :**
`#rmRrMinimum` — ratio risque/récompense minimum. À intégrer dans la Gestion de position si non présent.

**Risque patch :** faible sur la logique. Modéré sur la disposition — les deux blocs actuels ont des classes CSS distinctes.

---

### FUSION-3 — Centre de décision → réduction à un titre de section

**Bloc concerné :**
`section.side-card` (premier bloc colonne droite) → `#decisionSummaryHeadline`, `#decisionSummaryText`, `#decisionAgentText`, `#decisionAvoidText`, `#alertLevel`, `#trafficLight`, `#decisionPanel`, `#ultraShortPanel`

**Diagnostic :**
Chacun de ces 8 champs a un équivalent direct dans la colonne gauche ou le hero. Ce bloc est un doublon de Verdict moteur dans la colonne droite.

**Option A — Suppression totale :**
La colonne droite commence directement par Plan d'action. Le Verdict moteur dans la colonne gauche est la référence.

**Option B — Réduction à un seul champ titre :**
Conserver uniquement `#decisionSummaryHeadline` comme titre contextuel de la colonne droite (ex. "BLOCAGE" / "EXÉCUTION" / "ATTENTE"). Supprimer les 7 autres champs.

**Recommandation :** Option B pour la V1. Option A si la colonne droite prend une identité propre distincte.

**Risque patch :** modéré. Ce bloc est visuellement proéminent — sa disparition modifie le poids visuel de la colonne droite.

---

### FUSION-4 — Hero (3 couches) → une seule couche

**Blocs concernés :**
- Hero KPI grid : `#heroMarketStrong`, `#heroVerdictValue`, `#heroPostureValue`, `#heroAvoidValue`
- Hero bar : `#heroBarMarket`, `#heroBarScore`, `#heroBarMode`, `#heroBarPosture`, `#heroBarCount`
- Hero decision grid : `#heroDecisionVerdict`, `#heroDecisionAgent`, `#heroDecisionAction`, `#heroDecisionAvoid`

**Logique :**
Les trois couches affichent les mêmes 4 à 5 données dans trois formats simultanés. Une seule couche suffit.

**Ce qui est conservé :**
La hero-decision-grid (la plus informative : Verdict + Agent + Action du jour + Risque trop élevé).

**Ce qui est supprimé :**
Le hero KPI grid et le hero bar — ou l'inverse selon les contraintes CSS.

**Risque patch :** élevé. La section hero est le bloc visuellement le plus complexe. Cette fusion doit passer après les suppressions plus simples.

---

## Section 4 — Blocs à déplacer hors vue Moteur

Ces blocs ont une valeur réelle — mais dans une autre zone du cockpit.

---

### DEPLAC-1 — Journal de décision → onglet Mémoire

**Localisation actuelle :** colonne droite, vue Moteur
**IDs :** `#jdValidationState`, `#jdValidationNote`, `#jdJournalNote`, `#jdMoteurSummary`, `#jdHistory`, `#jdPattern`, `#jdScore`, `#jdAlert`, `#jdMetaMessage`, `#jdMetaBadge`

**Motif du déplacement :**
Ce bloc contient de la mémoire (notes de session, historique, patterns comportementaux) — pas de la décision active. Il appartient à l'onglet Mémoire qui existe précisément pour cette fonction.

**Sa présence dans la vue Moteur** ajoute 10+ champs à une zone dont la mission est la décision instantanée.

**Action attendue :**
Déplacer le bloc HTML dans le `div[data-tab-panel="memoire"]`. La logique de rendu (`renderDecisionJournal()`) reste intacte.

**Risque patch :** faible sur la logique. S'assurer que les IDs restent accessibles à `render.js` après déplacement (ils le seront — render.js ne se soucie pas de la position dans le DOM, seulement de l'existence des IDs).

---

### DEPLAC-2 — Diagnostic mémoire → onglet Mémoire

**Localisation actuelle :** colonne droite, vue Moteur
**IDs :** `#storageStatus`, `#storageSize`, `#lastSaved`, `#snapshotCount`

**Motif du déplacement :** identique à DEPLAC-1. Information technique de stockage, pas de décision.

**Risque patch :** très faible.

---

### DEPLAC-3 — Table shell (Sortie du moteur) → onglet Pilotage

**Localisation actuelle :** colonne gauche, vue Moteur (bas de page)
**IDs :** `#autoMarket`, `#autoScore`, `#autoMode`, `#autoAttack`, `#autoSniper`, `#profileFiltered`

**Motif du déplacement :**
Ce tableau de valeurs brutes est utile pour comprendre le raisonnement du moteur — c'est la fonction de l'onglet Pilotage. Dans la vue Moteur, il ajoute de la charge sans apporter de valeur décisionnelle.

**Note :** l'onglet Pilotage contient déjà un bloc `#whyBlock` et les grilles de diagnostic. Cette table est cohérente avec cet ensemble.

**Risque patch :** faible.

---

### DEPLAC-4 — Contexte utile (master card) — parties redondantes → Pilotage

**Localisation :** `section.master-card.tab-panel` (colonne gauche, vue Moteur)

**Ce qui peut être déplacé :**
- `div.master-grid` complet (master-left + master-right avec command-box) → vers Pilotage ou suppression
- `div.micro-summary-panel` (micro-summary-grid) → suppression
- `div.alertes-bottom-grid` sauf `#bhvInfluencePanel` → suppression

**Ce qui reste dans la vue Moteur (si le bloc est conservé réduit) :**
- Les 4 alert cards (État, Risque, Mode, Validation) — si elles apportent une couche visuelle rapide distincte du Verdict
- `#bhvInfluencePanel` — seul champ potentiellement unique (influence comportementale)

**Alternative :**
Supprimer entièrement `section.master-card` et intégrer `#bhvInfluencePanel` dans le Verdict moteur ou le Plan d'action.

**Risque patch :** élevé. Ce bloc est le plus complexe de la colonne gauche. À traiter après les coupes simples.

---

## Section 5 — Blocs à clarifier avant décision

Ces blocs ne peuvent pas être traités sans une vérification visuelle ou une question ouverte sur leur contenu réel.

---

### CLARIF-1 — Mode d'action principal + 4 boutons (Socle / Attaque / Sniper / Attente)

**Question ouverte :**
Ces boutons (`#modeCoreBtn`, `#modeAttackBtn`, `#modeSniperBtn`, `#modeWaitBtn`) sont-ils des indicateurs de statut (l'état actif est défini par le moteur) ou des contrôles réels (l'utilisateur peut changer de mode) ?

**Si indicatifs uniquement :**
Les reformater en statut passif, non cliquables. Supprimer les handlers click.

**Si interactifs :**
Documenter précisément leur impact sur le payload et sur la validation. S'assurer que leur action est cohérente avec le principe d'autonomie préservée.

**Action avant décision :**
Inspecter `render.js` — chercher les handlers de `modeCoreBtn` / `modeAttackBtn` / `modeSniperBtn` / `modeWaitBtn` et identifier ce qu'ils modifient.

---

### CLARIF-2 — Gestion de position (valeurs calculées vs valeurs génériques)

**Question ouverte :**
Les 6 champs (`#pmSize`, `#pmMode`, `#pmEntry`, `#pmExit`, `#pmMaxRisk`, `#pmStatus`) sont-ils calculés à partir de `engagement_level` et `sizing_factor` avec des valeurs précises et spécifiques, ou sont-ce des reformulations textuelles génériques de `decisionState` ?

**Si calculés :** le bloc mérite conservation et fusion avec Risk/MM.

**Si génériques :** le bloc reformule ce que Plan d'action dit déjà — candidat à la suppression ou à la réduction sévère.

**Action avant décision :**
Lire `renderPositionManagement()` dans `render.js` et comparer les valeurs affichées avec les 6 états de `decisionState`.

---

### CLARIF-3 — Lecture day card + Signal narratif + Mantra opérationnel

**Question ouverte :**
Ces trois blocs produisent-ils des contenus textuels distincts les uns des autres, ou reformulent-ils la même guidance dans trois registres différents ?

**Si distincts :** évaluer lequel est le plus fort et supprimer les deux autres.

**Si identiques ou très proches :** supprimer les trois et vérifier si le Plan d'action couvre l'information manquante.

**Action avant décision :**
Comparer les valeurs de `#lectureDayMain`, `#signalNarratifMain`, et `#mantraOperationnelMain` sur 4 à 5 états différents du moteur (BLOCKED, WAIT, ALIGNED, PROTECT, TENSION).

---

## Section 6 — Ordre recommandé des patches

**Principe :** couper d'abord ce qui est le moins risqué, le plus isolé, et ce qui produit le plus de soulagement cognitif immédiat.

---

### PATCH-1 — Choix actuel *(risque : très faible)*

**Scope :** supprimer l'injection de `.decision-anchor` et l'appel à `bindDecisionAnchor()` dans `render.js`.

**Impact visuel :** le bloc `#actionPlan` affiche uniquement les 3 lignes de guidance. La section Plan d'action devient propre et honnête.

**Impact moteur :** zéro. Aucune logique n'est affectée.

**Test de validation :** Plan d'action s'affiche sans boutons. Le cockpit tourne normalement sur 5 états différents.

---

### PATCH-2 — Hero overlay panel *(risque : très faible)*

**Scope :** supprimer `div.hero-overlay-panel` du HTML.

**Impact visuel :** disparition d'une couche de répétition entre le hero et le cockpit principal.

**Impact moteur :** les IDs (`#confidenceHero`, etc.) disparaissent. `render.js` appellera `setText()` sur des IDs inexistants — silencieux, sans erreur.

**Test de validation :** aucune erreur console. Le hero s'affiche normalement.

---

### PATCH-3 — Déplacements Mémoire *(risque : faible)*

**Scope :**
- Déplacer `section` Journal de décision dans `div[data-tab-panel="memoire"]`
- Déplacer `section` Diagnostic mémoire dans `div[data-tab-panel="memoire"]`

**Impact visuel :** la colonne droite perd 2 blocs dans la vue Moteur. Elle gagne en clarté.

**Impact moteur :** zéro — les IDs restent dans le DOM, `render.js` les trouve toujours.

**Test de validation :** les données Journal et Diagnostic sont visibles dans l'onglet Mémoire. Aucune rupture dans la vue Moteur.

---

### PATCH-4 — Lecture rapide *(risque : faible)*

**Scope :** supprimer `section.structured-shell.tab-panel` du HTML.

**Impact visuel :** la colonne gauche perd une section. Le flux Verdict → Pourquoi → [suivant] est plus direct.

**Test de validation :** aucune erreur console. Les IDs (`#structuredMarketText`, etc.) peuvent être retirés des appels `render.js` dans un patch ultérieur — pour l'instant la perte est silencieuse.

---

### PATCH-5 — Diagnostic mémoire (vue Moteur) *(risque : très faible)*

*(si non fait dans PATCH-3)*

**Scope :** supprimer le bloc `section.side-card` contenant `#storageStatus`, `#storageSize`, `#lastSaved`, `#snapshotCount` de la colonne droite vue Moteur.

---

### PATCH-6 — Déplacement Table shell → Pilotage *(risque : faible)*

**Scope :** déplacer `div.table-shell` dans le `div[data-tab-panel="pilotage"]`.

**Test de validation :** les valeurs `autoMarket`, `autoScore`, etc. s'affichent dans l'onglet Pilotage.

---

### PATCH-7 — Fusion Niveau d'exécution *(risque : faible)*

**Scope :**
- Supprimer le bloc `section.side-card` "Niveau d'exécution" de la colonne droite
- Intégrer `#execPermission` dans le Verdict moteur (position à définir avec le design)

**Test de validation :** la valeur de permission (Hors exécution / Attendre / Préparer / Exécuter) est visible dans le Verdict moteur.

---

### PATCH-8 — Fusion Risk/MM → Gestion de position *(risque : faible)*

**Scope :**
- Fusionner les 4 champs Risk/MM dans la section Gestion de position
- Supprimer le bloc Risk/MM en tant que section indépendante

**Test de validation :** tous les champs RM sont visibles dans Gestion de position.

---

### PATCH-9 — Suppression Suivi de trade / Trade Setup *(risque : modéré)*

**Pré-condition :** confirmer visuellement que ces champs sont génériques.

**Scope :** supprimer les deux sections de la colonne droite.

**Test de validation :** aucune perte d'information non présente ailleurs. Vérifier sur état ALIGNED (le seul où ces blocs pourraient avoir du contenu).

---

### PATCH-10 — Agent grid *(risque : modéré)*

**Pré-condition :** confirmer que `#profileReaction` n'est pas le seul vecteur de la réaction profil en langage narratif.

**Scope :** supprimer `div.agent-grid` de la colonne gauche.

**Test de validation :** la décision actions autorisées/interdites reste lisible via le Verdict moteur.

---

### PATCH-11 — Centre de décision (réduction) *(risque : modéré)*

**Scope :** supprimer les 7 champs redondants. Conserver uniquement `#decisionSummaryHeadline` comme titre contextuel de la colonne droite.

**Test de validation :** la colonne droite commence par un titre de contexte clair (BLOCAGE / ATTENTE / EXÉCUTION). Les 7 champs disparus ne créent aucune perte d'information.

---

### PATCH-12 — Réduction Hero (3 couches → 1) *(risque : élevé — traiter en dernier)*

**Pré-condition :**
- Tous les patches 1 à 11 sont validés
- Une lecture complète du CSS `style.css` sur les classes `.hero-kpi-grid`, `.hero-bar`, `.hero-decision-grid`

**Scope :** supprimer 2 des 3 couches hero. Conserver la hero-decision-grid (ou la plus lisible selon évaluation visuelle).

**Test de validation :** le hero affiche une seule représentation du verdict. Aucune régression visuelle sur les autres zones.

---

### PATCH-13 — Contexte utile (réduction) *(risque : élevé — après PATCH-12)*

**Scope :**
- Supprimer `div.master-grid`, `div.micro-summary-panel`
- Conserver `#bhvInfluencePanel` et les 4 alert cards si elles ont une valeur visuelle dans le flux

**Test de validation :** `section.master-card` réduite à sa partie différentielle. Aucune information perdue.

---

## Section 7 — Risques par étape

| Patch | Risque | Nature du risque | Mitigation |
|---|---|---|---|
| PATCH-1 | Très faible | Aucun impact moteur | Vérification visuelle seule |
| PATCH-2 | Très faible | IDs orphelins silencieux | Vérifier console JS |
| PATCH-3 | Faible | Position DOM des IDs change | Tester tous les onglets |
| PATCH-4 | Faible | IDs orphelins dans render.js | Silencieux — nettoyage futur |
| PATCH-5 | Très faible | Aucun | — |
| PATCH-6 | Faible | Position DOM change | Tester onglet Pilotage |
| PATCH-7 | Faible | `renderExecutionLevel()` écrit sur ID disparu | Silencieux — vérifier |
| PATCH-8 | Faible | CSS à ajuster si classes différentes | Vérifier rendu Gestion position |
| PATCH-9 | Modéré | Contenu peut être non-générique | Vérification visuelle préalable obligatoire |
| PATCH-10 | Modéré | `profileReaction` peut être unique | Lire render.js avant |
| PATCH-11 | Modéré | Poids visuel colonne droite | Vérification UX post-patch |
| PATCH-12 | Élevé | CSS complexe, interactions visuelles | Lire CSS hero complet avant |
| PATCH-13 | Élevé | Bloc le plus complexe colonne gauche | Traiter en dernier, tester tous les états |

---

## Section 8 — Critères de validation après chaque coupe

Après chaque patch, valider sur **5 états moteur différents** :

1. **BLOCKED (émotion FOMO active)** — l'état le plus contraignant
2. **ALIGNED (validation acceptée, score ≥ 65)** — l'état d'exécution
3. **WAIT (compression, score < 35)** — l'état passif
4. **PROTECT (marché défensif)** — l'état de réduction
5. **READY (expansion, validation pending)** — l'état d'attente active

**Pour chaque état, vérifier :**

- [ ] Le Verdict moteur affiche des données cohérentes avec l'état
- [ ] Le Plan d'action affiche des données cohérentes avec l'état
- [ ] Aucune erreur dans la console JavaScript
- [ ] Aucun ID en double dans le DOM
- [ ] La colonne droite est lisible en moins de 5 secondes
- [ ] La décision principale est identifiable en moins de 2 secondes sans scrolling
- [ ] Aucun bloc n'affiche "—" comme valeur principale dans un état actif

**Test de régression comportementale :**
- [ ] L'onglet Comportement s'isole toujours correctement
- [ ] L'onglet Mémoire affiche les données déplacées correctement
- [ ] La sauvegarde/restauration localStorage fonctionne

**Test manifeste :**
Après chaque patch, relire la phrase directrice :
> "Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre."

Et répondre à : *Le cockpit est-il plus calme qu'avant ce patch ? La décision est-elle plus lisible ?*
Si la réponse est non à l'une des deux questions : le patch est à retravailler.

---

## Section 9 — Verdict final

### Ce que la réduction V1 produit

À l'issue des 13 patches séquencés :

**Colonne droite — vue Moteur**

Avant : 11 sections, ~40 champs, scroll obligatoire

Après cible : 5 à 6 sections maximum
1. Centre de décision (réduit à un titre contextuel)
2. Plan d'action (3 lignes de guidance, sans Choix actuel)
3. Scénarios SI → ALORS
4. Gestion de position + Risk/MM (fusionné)
5. Sortie technique (collapsible)

**Colonne gauche — vue Moteur**

Avant : 6 blocs empilés dont 3 redondants

Après cible : 3 blocs essentiels
1. Verdict moteur (avec execPermission intégré)
2. Pourquoi cette décision
3. Contexte utile (réduit à bhvInfluence + alert cards)

**Zone Hero**

Avant : 3 couches + overlay panel

Après cible : 1 couche + Engine Journal (réduit à une phrase directrice)

### Ce que la réduction V1 ne touche pas

- Aucune logique moteur (`engine.js`, `decision.js`, `trading-policy.js`)
- Aucun calcul de score ou de décision
- Aucune donnée persistée (localStorage reste intact)
- Aucun onglet Pilotage ni Mémoire dans leur structure interne
- Aucun module Comportement
- La chaîne complète `buildPayload()` → `computeDecisionState()` → `render*()`

### Ce que la réduction V1 affirme

Que Caméléon Engine a une colonne vertébrale solide.
Que cette colonne vertébrale n'avait pas besoin de 37 représentations pour exister.
Que 4 blocs irréductibles portent 90% de la valeur cognitive du cockpit.
Et que les 33 représentations restantes étaient de la confiance mal dépensée.

La réduction n'appauvrit pas le produit.
Elle lui rend sa signature.

---

*Document créé le 2026-05-10. Référence : audit V1 Reduction Pass (même date).*
*Autorité : manifeste-cameleon-engine.md · Section XVI — Principe directeur unique.*
*Ne pas modifier sans relire le manifeste.*
