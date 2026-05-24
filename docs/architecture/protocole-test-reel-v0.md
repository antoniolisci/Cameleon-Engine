# Protocole test réel V0 — Caméléon Engine

## Métadonnées

**Statut** : Protocole V0 · Document vivant · Aucune implémentation moteur
**Version** : 1.0 — 2026-05-24
**Dépendances** :
- `docs/architecture/calibration-terrain.md`
- `docs/architecture/instrumentation-debug-calibration.md`
- `docs/architecture/gestion-attention.md`
- `docs/product/doctrine-cameleon-transmission-test-reel-v0.md`

---

## Point de départ

L'architecture V2 est documentée dans son intégralité. Les composants — couche de
cohérence inter-modules, hiérarchie des tensions, explicabilité sobre, gestion de
l'attention — forment une chaîne complète sur le plan conceptuel. La couche
d'instrumentation est conçue pour capturer les variables de calibration pendant les
sessions réelles.

Tout cela reste théorique sans observation terrain. Les seuils provisoires de T1, T4
et D-ATT-01 ont été estimés raisonnablement, mais ils ne peuvent être validés que par
des opérateurs réels, sur des marchés réels, dans des conditions normales d'usage.

**Le danger principal n'est pas le manque de données — c'est le biais introduit par
le protocole lui-même.**

Un protocole intrusif produit des sessions artificielles. Des opérateurs qui savent
qu'ils sont observés, qui reçoivent des consignes d'optimisation, ou qui perçoivent
le cockpit comme un environnement de test modifient leur comportement. Les données
collectées reflètent alors le protocole, pas l'usage réel.

Le protocole V0 doit donc minimiser sa propre empreinte cognitive sur l'opérateur.
L'objectif est d'observer un usage authentique, pas de provoquer un usage conforme.
La valeur du test dépend directement de la naturalité des sessions observées.

**Contrainte doctrinale centrale** : le cockpit doit rester perçu comme un outil de
décision pendant le test V0. Jamais comme un laboratoire. Si un opérateur commence
à "jouer le moteur" plutôt qu'à analyser un marché, ses sessions sont invalidées.

---

## Ce que le test réel V0 n'est pas

**Pas un stress test technique.** Le V0 ne cherche pas à identifier des bugs, des cas
limites d'implémentation, ou des comportements inattendus du code. Ces questions
relèvent de la QA interne, réalisée avant le test V0.

**Pas une QA exhaustive.** Il n'existe pas de liste de cas à cocher, de scénarios
imposés, de parcours utilisateur formalisés. Le test V0 observe des sessions libres,
pas des sessions dirigées.

**Pas un benchmark de performance.** Le moteur n'est pas mesuré sur sa vitesse
d'exécution, sa consommation mémoire, ou sa capacité à traiter un volume de soumissions
par seconde.

**Pas une compétition de trading.** Les résultats financiers des opérateurs ne sont
pas collectés, pas analysés, pas corrélés aux outputs du moteur. Le moteur n'est pas
évalué sur la rentabilité des décisions qu'il accompagne.

**Pas une validation de rentabilité opérateur.** Le V0 ne prouve pas que le moteur
améliore les performances de trading. Ce n'est pas son objectif à ce stade.

**Pas une collecte comportementale invasive.** Les opérateurs ne sont pas profilés
psychologiquement, leurs patterns de décision ne sont pas analysés au-delà des
variables de calibration définies. La couche d'instrumentation capture des outputs
structurels du moteur, pas des comportements individuels.

---

## Objectif réel du V0

Le V0 a un objectif unique, décomposable en six axes d'observation.

**Validation des seuils (D-COH-01 / D-ATT-01)**
Les seuils provisoires de T1 (confidence > 65, MdS ≤ 2) et T4 (QdR ≥ 3, MdS ≤ 2)
produisent-ils des tensions dans des conditions réelles ? Sont-ils trop hauts (tensions
jamais déclenchées), trop bas (tensions permanentes), ou dans une zone viable ?

**Validation du silence structurel**
Le moteur reste-t-il majoritairement silencieux dans les sessions normales ? La doctrine
du silence structurel pose l'absorption comme état par défaut. Si des tensions sont
exposées dans 80 % des soumissions, les seuils sont trop permissifs.

**Validation de la densité d'exposition**
La fenêtre glissante N = 5 est-elle adaptée à la densité réelle des sessions ?
La gestion de l'attention atteint-elle `elevated` trop fréquemment, bloquant des
tensions qui auraient été utiles ? Ou trop rarement, laissant passer un bruit
séquentiel non contrôlé ?

**Validation de la lisibilité des tensions**
Quand une tension est exposée, le message produit par l'explicabilité sobre est-il
immédiatement compréhensible sans explication supplémentaire ? Les templates (D-EXP-01)
sont-ils adaptés au vocabulaire naturel des opérateurs ?

**Validation de la gestion de l'attention**
Les suppressions silencieuses de la couche d'attention sont-elles perceptibles ?
Le cockpit semble-t-il "artificiellement calme" à certains moments, créant une
frustration implicite ? Ou la surface calme est-elle naturellement crédible ?

**Observation des faux positifs et faux silences**
T1 se déclenche-t-elle quand la lisibilité freeware est structurellement contredite
par le premium, ou aussi dans des situations où la contradiction est normale ?
T4 se déclenche-t-elle dans des cas réellement ambigus, ou comme bruit de fond
des sessions premium actives ?

---

## Population cible

**Taille cible** : 20–30 opérateurs. Ce seuil est issu de la doctrine de transmission
test réel V0 déjà documentée. Il représente un panel suffisamment large pour détecter
des patterns robustes sans être si large que la collecte devient ingérable manuellement.

**Profils recherchés** :

| Profil | Proportion cible | Raison |
|---|---|---|
| Traders actifs avec historique | 40–50 % | Base de données comportementales existante |
| Traders réguliers styles variés | 30–40 % | Diversité des inputs, couverture de cas T1/T3 |
| Profils réactifs ou impulsifs | 20–30 % | Nécessaires pour calibrer T2 et les seuils d'escalade |

**Exclusions** :

- **Débutants absolus** (< 3 mois de trading actif) : ils n'ont pas de base comportementale
  stable. Leurs inputs moteur seront trop incohérents pour contribuer à la calibration.
- **Traders uniquement algorithmiques** : ils n'utilisent pas de cockpit décisionnel
  — l'outil ne correspond pas à leur usage.
- **Opérateurs ayant participé à la conception du moteur** : biais de connaissance trop
  important — ils savent ce que le moteur cherche à détecter.

**Importance des profils réactifs / impulsifs** : T2 (profil comportemental ↔ posture)
ne peut être validée que si le panel contient des opérateurs dont le profil comportemental
est Impulsif ou Agressif. Un panel exclusivement Discipliné ne permettrait pas d'observer
T2 du tout. La composition du panel doit être vérifiée avant le démarrage du test.

**Diversité géographique et d'actifs** : non contrainte. La calibration porte sur les
outputs structurels du moteur, pas sur les marchés ou les actifs spécifiques.

---

## Conditions d'une session valide

Une session est valide si elle correspond à un usage authentique du cockpit.

**Critères positifs :**
- L'opérateur analyse une situation de marché réelle ou une intention de trading réelle.
- Les inputs soumis reflètent une lecture sincère des conditions de marché à ce moment.
- La session se déroule dans le flux normal de travail de l'opérateur — pas en dehors.

**Critères d'exclusion explicites :**

| Comportement | Raison d'exclusion |
|---|---|
| Soumissions répétées avec inputs identiques pour "voir ce qui change" | Absence d'intention réelle — biais exploration |
| Soumissions en dehors de toute session de trading active | Absence de contexte marché authentique |
| Modification volontaire des inputs pour déclencher une tension | Usage adversarial — biaise les seuils de T1/T4 |
| Sessions consécutives très courtes (< 2 soumissions) | Pas assez de signal pour la calibration de D-ATT-01 |
| Session démarrée uniquement pour tester la collecte ou l'export | Absence d'intention trading |

**Règle de décision en cas de doute** : si un export contient moins de 3 soumissions
avec des inputs distincts, la session est exclue de l'analyse de calibration mais
conservée pour l'analyse de la lisibilité (D-EXP-01).

**Ce que le protocole ne contrôle pas** : il n'est pas possible de vérifier a posteriori
si une soumission correspondait à une décision réelle ou à une exploration. Le protocole
s'appuie sur l'engagement de l'opérateur à utiliser le cockpit dans son contexte habituel.

---

## Déroulement opérateur

Le déroulement opérateur est intentionnellement minimal. Moins le protocole impose,
plus les sessions sont authentiques.

**Ce qui est communiqué à l'opérateur avant le test :**
- L'accès à l'outil et les instructions d'ouverture.
- Qu'il peut utiliser le cockpit normalement, comme un outil d'aide à la décision.
- Qu'à la fin de chaque session, il peut exporter ses données via un bouton discret
  dans l'interface — sans que la nature ou le contenu de ces données soit décrit.
- La durée cible du test (2–4 semaines).

**Ce qui n'est pas communiqué :**
- L'existence de la couche de calibration et de ses seuils provisoires.
- La liste des tensions détectables (T1, T2, T3, T4).
- L'existence de la gestion de l'attention et de ses niveaux.
- Les objectifs de calibration du test.

**Pendant la session :**
1. L'opérateur ouvre le cockpit dans son flux habituel.
2. Il soumet le formulaire pour une situation de marché réelle ou une intention réelle.
3. Il lit le résultat (posture, actions, tension éventuelle) et prend sa décision.
4. Il continue naturellement — aucune consigne d'optimisation, aucune tentative de
   déclencher ou d'éviter des tensions.
5. L'instrumentation capture un snapshot en arrière-plan, invisible.

**En fin de session :**
L'opérateur peut déclencher l'export manuel depuis l'interface si la demande lui a été
transmise. La formulation recommandée : *"En fin de session, appuyez sur le bouton
dans l'interface pour sauvegarder vos données — vous pouvez ensuite fermer l'onglet."*
Aucune mention de calibration, de snapshots, ou de données collectées.

**Règle absolue** : le cockpit doit rester perçu comme un outil, pas comme un
laboratoire. L'opérateur qui commence à optimiser ses inputs pour "mieux interagir
avec le moteur" n'est plus dans un usage authentique.

---

## Accès Debug et instrumentation

**Option B appliquée** : le panel Debug est hors du flux opérateur normal pendant le
test V0. Il n'est pas mentionné activement dans les instructions transmises aux opérateurs.

**État par défaut** : panel Debug fermé à l'ouverture de la page. Non référencé dans
le cockpit principal. Non mentionné dans les communications V0.

**Découverte autonome** : si un opérateur trouve et ouvre le panel Debug de façon
autonome, c'est acceptable. Il verra les variables techniques du moteur existantes
(score brut, posture, breakdown confidence, actions autorisées/interdites) ainsi que
les nouveaux éléments de calibration (compteur de snapshots, bouton d'export). Cette
session est marquée comme "panel Debug ouvert" dans les métadonnées de l'export.

**Aucune donnée de calibration dans le cockpit** : les snapshots accumulés, le compteur
de buffer, le niveau d'attention, les suppressions silencieuses — aucun de ces éléments
n'apparaît dans la surface cockpit opérateur. La couche d'instrumentation est
architecturalement invisible pendant la session.

**Aucun feedback temps réel sur la collecte** : l'opérateur ne reçoit aucune confirmation
de snapshot capturé, aucune jauge de buffer, aucun indicateur de "données en cours
d'enregistrement". La collecte est silencieuse au même titre que le moteur lui-même.

**Export ponctuel** : déclenché volontairement par l'opérateur en fin de session,
via le bouton dans le panel Debug. L'export ne vide pas le buffer — l'opérateur peut
continuer d'accumuler et exporter à nouveau.

---

## Exports et récupération des données

**Format** : JSON — fichier `cameleon-calibration-{timestamp}.json` téléchargé localement.

**Fréquence recommandée** : une fois par session active. Si un opérateur utilise le
cockpit plusieurs fois dans la journée, un export en fin de journée suffit — à condition
que le buffer n'atteigne pas 200 snapshots avant. Si les sessions sont longues ou
nombreuses, exporter après chaque session.

**Mode de transmission** : l'opérateur transmet le fichier JSON au calibrateur par
le canal convenu (email, dépôt partagé, autre). Aucune synchronisation distante
automatique. Aucune transmission sans action volontaire de l'opérateur.

**Indépendance des fichiers** : chaque export est un fichier autonome. Un export
ne contient pas de référence aux exports précédents. Le calibrateur les reçoit
et les agrège manuellement, hors ligne.

**Anonymisation** : les fichiers JSON ne contiennent pas de nom, d'identifiant
utilisateur, ni d'actif tradé. Le champ `timestamp` est la seule donnée temporelle.
Si une anonymisation supplémentaire est requise avant transmission, elle est réalisée
par l'opérateur ou le calibrateur selon les arrangements définis (D-V0-04).

**Agrégation** : réalisée manuellement par le calibrateur après collecte de l'ensemble
des exports. L'outil d'agrégation n'est pas défini dans ce protocole — JSON structuré
et CSV optionnel permettent d'utiliser le tableur ou un script selon le volume.

---

## Signaux d'alerte pendant V0

Ces signaux doivent être surveillés pendant le test. Leur présence indique un problème
de protocole ou de calibration qui nécessite une décision.

| Signal | Indicateur observable | Action recommandée |
|---|---|---|
| **Cockpit perçu comme nerveux** | Retours opérateurs signalant trop d'informations ou de signaux visuels | Vérifier les seuils T1/T4 — probable sur-déclenchement |
| **Tensions quasi inexistantes** | Exports avec 0 tensions exposées sur 10+ soumissions | Vérifier les seuils T1/T4 — probable sous-déclenchement |
| **Elevated trop fréquent** | `attention_level = elevated` dans > 20 % des snapshots | Vérifier N — probable fenêtre trop courte |
| **Opérateurs qui "jouent le moteur"** | Sessions avec inputs manifestement artificiels ou répétitifs | Exclure ces sessions, évaluer si le protocole a été trop transparent |
| **Surcharge Debug** | Opérateurs rapportant confusion ou distraction liée au panel Debug | Vérifier que le panel Debug n'est pas ouvert par défaut — renforcer Option B |
| **Abandon prématuré du test** | Opérateurs qui cessent d'exporter ou utilisent le cockpit moins de 3 sessions | Identifier si la charge d'export est trop élevée ou si l'outil n'apporte pas de valeur perçue |
| **Sessions trop courtes** | Exports avec 1–2 soumissions systématiquement | Clarifier les conditions de session valide avec les opérateurs concernés |

**Seuil d'alerte global** : si 3 signaux ou plus sont actifs simultanément, le test
est suspendu pour évaluation avant de reprendre.

---

## Critères de validité du V0

Le V0 est considéré comme valide si l'ensemble des conditions suivantes est satisfait.

**Volume minimal de sessions**
Au moins 15 opérateurs ont produit des exports avec au moins 3 soumissions valides
chacun. En dessous de ce seuil, les distributions observées sont trop peu robustes
pour valider les seuils.

**Diversité comportementale suffisante**
Le panel contient au moins 4–5 opérateurs dont le profil comportemental est Impulsif
ou Agressif (nécessaire pour observer T2 et valider l'escalade). Un panel uniformément
Discipliné invalide la calibration de T2.

**Volume minimal de tensions observées**
Au moins 30 soumissions ont produit une tension exposée (winner ≠ null et should_expose = true)
sur l'ensemble du test. En dessous, les distributions de confidence_score / MdS / QdR
observées au moment du déclenchement ne sont pas exploitables statistiquement.

**Volume minimal de suppressions attention**
Au moins 10 suppressions par la gestion de l'attention (should_expose = false avec
winner ≠ null) ont été observées. En dessous, la validation de N est impossible.

**Stabilité du cockpit**
Aucun retour opérateur explicite signalant le cockpit comme perturbant, anxiogène,
ou surchargé. Critère qualitatif — évalué sur la base des retours reçus en fin de test.

**Absence de dérive UX majeure**
Moins de 3 opérateurs ont abandonné le test avant la fin de la première semaine sans
signaler de problème technique. Des abandons précoces en nombre signalent un problème
de valeur perçue ou d'ergonomie non anticipé.

---

## Critères d'arrêt / suspension

Ces conditions déclenchent une suspension immédiate du test pour évaluation.
La suspension n'est pas un échec — c'est une décision d'architecture.

**Sur-bruit structurel**
Plus de 40 % des soumissions produisent une tension exposée (winner ≠ null). Les seuils
T1/T4 sont manifestement trop bas. Continuer le test dans ces conditions produit des
données biaisées vers les faux positifs. Action : abaisser les seuils provisoires,
rédémarrer le test.

**Faux positifs massifs**
Retours opérateurs signalant que les tensions exposées ne correspondent à rien de réel
dans leur analyse du marché — elles apparaissent dans des situations où aucune
contradiction n'est perceptible. Action : réviser les formulations des templates
(D-EXP-01) ou les seuils de déclenchement.

**Silence quasi permanent**
Moins de 2 % des soumissions produisent une tension exposée sur un panel de 10+
opérateurs actifs sur 2+ semaines. Les seuils sont trop hauts — T1 et T4 sont
architecturalement présentes mais opérationnellement absentes. Action : abaisser
les seuils provisoires, rédémarrer le test.

**Contamination comportementale du panel**
Plus de 30 % des opérateurs présentent des patterns de soumissions artificielles
(inputs répétitifs, explorations volontaires des seuils). Les données sont inutilisables
pour la calibration. Action : arrêt complet, révision du protocole de communication.

**Instrumentation intrusive**
Retours signalant que la demande d'export ou l'existence du panel Debug a modifié
le comportement pendant les sessions. Action : réviser la formulation de la demande
d'export, renforcer Option B.

**Biais panel extrême**
Le panel est composé à plus de 80 % d'un seul profil comportemental (ex. tous
Disciplinés). Les données ne permettent pas de valider T2 ni les seuils d'escalade.
Action : recruter des profils manquants avant de poursuivre.

---

## Risques méthodologiques

**Effet Hawthorne.**
Le simple fait d'être observé modifie le comportement. Des opérateurs qui savent
qu'ils participent à un test peuvent être plus attentifs, plus méthodiques, ou au
contraire plus anxieux que dans leur usage normal.
Garde-fou : minimiser les informations transmises sur les objectifs du test. Ne pas
communiquer les seuils, les tensions, ni les métriques collectées. La formulation
des instructions ne doit pas suggérer un "comportement idéal".

**Panel trop discipliné.**
Les opérateurs recrutés par invitation directe sont probablement plus engagés et
plus disciplinés que la population générale. La distribution des profils comportementaux
du panel peut sous-représenter Impulsif et Agressif.
Garde-fou : vérifier la composition du panel avant démarrage. Recruter activement
des profils réactifs/impulsifs si nécessaire. Documenter la composition réelle.

**Sessions artificielles.**
Des opérateurs peuvent générer des sessions hors de tout contexte de trading réel —
pendant des heures creuses, pour "contribuer au test". Ces sessions produisent des
distributions d'inputs atypiques qui faussent la calibration.
Garde-fou : critères de session valide documentés. Analyse post-collecte des distributions
d'inputs pour identifier les sessions atypiques.

**Biais du survivant.**
Les opérateurs qui complètent le test jusqu'à la fin sont ceux qui ont trouvé une
valeur dans le cockpit ou qui sont les plus engagés. Ceux qui abandonnent
représentent peut-être les cas où le moteur n'est pas adapté — mais leurs données
sont absentes ou partielles.
Garde-fou : collecter les exports partiels des opérateurs qui abandonnent, même
incomplets. Documenter les raisons d'abandon si communiquées.

**Biais de nouveauté.**
La première semaine d'utilisation d'un outil produit des comportements exploratoires
qui ne reflètent pas l'usage habituel à long terme. Les données de la première semaine
peuvent sur-représenter les explorations.
Garde-fou : analyser séparément les données semaine 1 et semaines 2–4. Si les
distributions diffèrent significativement, les données semaine 1 sont pondérées
différemment dans la calibration.

**Confusion entre "utile" et "agréable".**
Un opérateur peut trouver une tension visuellement agréable ou rassurante sans qu'elle
lui ait apporté une information structurelle réelle. Les retours qualitatifs positifs
ne valident pas les seuils — ils valident la perception.
Garde-fou : distinguer dans l'analyse post-V0 les retours sur la lisibilité des tensions
(D-EXP-01) des retours sur la pertinence structurelle (calibration seuils T1/T4).

---

## Dettes identifiées

| Référence | Nature | Bloquante ? |
|---|---|---|
| D-V0-01 | Taille panel — 20–30 cible ; à confirmer selon disponibilité des profils réactifs/impulsifs | Non |
| D-V0-02 | Instrumentation mobile — si des opérateurs V0 utilisent le cockpit sur mobile, l'export Debug est peu ergonomique | Non |
| D-V0-03 | Export unifié futur — agréger les fichiers JSON de 20–30 opérateurs manuellement est faisable pour V0 ; une consolidation semi-automatisée sera nécessaire si le panel grandit | Non — post-V0 |
| D-V0-04 | Anonymisation éventuelle — les fichiers JSON ne contiennent pas d'identifiant direct ; si une anonymisation supplémentaire est requise avant transmission, définir le protocole avant le début du test | Non |
| D-V0-05 | Sessions longues — si certains opérateurs font des sessions de 2h+ avec 20+ soumissions, le buffer de 200 snapshots tient ; mais l'export en fin de session doit être rappelé | Non |
| D-V0-06 | Multi-device — si un opérateur utilise le cockpit sur plusieurs appareils, chaque appareil produit un export indépendant ; l'agrégation multi-device est manuelle | Non |

---

## Statut

**Type** : Protocole d'exécution V0.
**Périmètre** : Test réel — calibration comportementale et structurelle.
**Aucune implémentation moteur.**
**Aucune validation produit finale.**
**Aucune généralisation statistique forte.**

Le V0 est une phase de calibration, pas une validation. Il ne prouve pas que le moteur
est "bon" ou "mauvais". Il fournit les données nécessaires pour remplacer les seuils
provisoires par des valeurs observées, et pour détecter les problèmes structurels
(sur-exposition, sous-exposition, cockpit nerveux) avant l'implémentation définitive.

Les résultats du V0 alimentent directement `calibration-terrain.md` — les tableaux
vides seront remplis avec les valeurs observées, et les conditions de clôture du
chantier calibration terrain seront satisfaites.

**Contraintes doctrinales absolues :**

Ne jamais transformer le cockpit en laboratoire visible. Le test observe un usage réel,
il ne provoque pas un usage artificiel. Le protocole minimise sa propre empreinte
cognitive sur l'opérateur — la collecte est silencieuse, l'export est discret, les
instructions sont minimalistes. Si un opérateur perçoit qu'il est dans un test
plutôt qu'en train d'utiliser un outil, le protocole a échoué.
