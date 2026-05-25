# Stratégie d'observation terrain V0 — Caméléon Engine

## Métadonnées

**Statut** : Document stratégique · Phase 2 figée · Phase 3 non commencée
**Version** : 1.0 — 2026-05-25
**Contexte** : T2-05 validé (b5e7815) · T3 cockpit actif · V2_CALIBRATION:false
**Prérequis** : Phase 2 entièrement validée
**Dépendances** :
- `docs/architecture/calibration-terrain.md` — protocole quantitatif V0
- `docs/architecture/snapshots-phase3-reference.md` — cas de référence Phase 3
- `docs/architecture/checklist-implementation-phase-3.md` — critères T3-01 à T3-09
- `docs/product/doctrine-cameleon-transmission-test-reel-v0.md` — règles d'invitation

**Ce document ne couvre pas :**
- La calibration des seuils (objet de T3-01 à T3-07 après collecte)
- La modification du moteur
- L'activation de T1/T2/T4 cockpit
- V2_CALIBRATION (Phase 6)

---

## Contrainte technique préalable

**Le Debug panel actuel n'affiche pas les données V2.**

`currentPayload` est une variable de module (`let`) dans `render.js` — elle n'est
pas exposée sur `window`. Le panel Debug Brain affiche uniquement les données V1
(score, posture, state, market reading). Les résultats V2 (`tensionMap`,
`hierarchyResult`, `attentionResult`, `expositionResult`) ne sont accessibles
ni depuis la console navigateur ni depuis l'interface utilisateur.

**Signal V2 directement observable sans modification de code :**
uniquement la présence ou l'absence du bloc `.v2-message` dans le cockpit.

Conséquence sur la méthode d'observation : toute la collecte V2 repose sur
l'observation visuelle du message cockpit et l'inférence depuis les données V1
visibles dans le Debug panel (posture, score, need_action).

---

## A. Objectif du V0

### Ce que le V0 cherche réellement à mesurer

Le V0 n'est pas un test de qualité logicielle. Il est un test de pertinence
comportementale. La couche V2 fonctionne correctement sur le plan technique
depuis Phase 2. Ce qui est inconnu n'est pas "est-ce que ça marche ?"
mais "est-ce que ça aide ?".

**Questions ouvertes après Phase 2 :**

| Question | Pourquoi inconnue | Ce que le V0 peut révéler |
|---|---|---|
| Fréquence T3 en usage réel | Dépend des inputs réels d'opérateurs réels | Taux observé sur ≥ 50 sessions |
| Utilité perçue du message | Comportement humain non déductible | Ralentissement, ajustement, réaction |
| Saturation attentionnelle | Effet cumulatif sur plusieurs jours | Signal de fatigue après N sessions |
| Seuil acceptable WINDOW_SIZE=5 | Distribution réelle soumissions/session inconnue | Fréquence de suppression observée |
| Valeur des seuils T1/T4 | Distributions confidence_score et MdS inconnues | Données terrain pour T3-01 |

### Différence entre bug technique et fatigue cognitive

**Bug technique** : observable depuis le code. Il se manifeste par une erreur JS
en console, un score incorrect, un message affiché quand il ne devrait pas l'être,
un flag non respecté. Il est binaire (présent ou absent) et vérifiable sans
opérateur humain.

**Fatigue cognitive** : invisible dans le code. Elle se manifeste par un changement
de comportement de l'opérateur au fil des sessions : il cesse de lire le message,
il adapte ses inputs pour éviter le message, il décrit le cockpit comme "bruyant"
alors que la fréquence n'a pas changé. Elle est graduelle, subjective, et
nécessite un observateur externe.

Un moteur peut être techniquement impeccable et cognitivement épuisant.
Un moteur peut avoir un taux de faux positifs élevé et rester utile si
les vrais positifs sont saisissants. La calibration terrain traite les deux
dimensions séparément.

### Pourquoi Phase 3 dépend du terrain réel

Phase 3 contient trois tâches de calibration (T3-01, T3-04, T3-07) qui modifient
les seuils numériques de `coherence.js`. Ces seuils ne peuvent pas être déduits :

- **T1** : `confidence_score < X` — X dépend de la distribution réelle des scores
  dans les sessions opérateur. Sans sessions réelles, X = 65 est une hypothèse.
- **T4** : `QdR > X` — X dépend de la fréquence réelle de co-occurrence QdR/MdS.
  Sans sessions réelles, les seuils actuels (MdS > 3, QdR > 3) peuvent produire
  une fréquence nulle ou une fréquence excessive selon la population.
- **D-ATT-01** : `WINDOW_SIZE = N` — N dépend du nombre moyen de soumissions
  par session réelle. N = 5 est une estimation sur "session de 3–8 soumissions".

De plus, `calibration-terrain.md` confirme explicitement :
> "La calibration de T1, T4 et D-ATT-01 ne peut pas être réalisée sans sessions
> moteur réelles."

T3 lui-même (binaire, sans seuil continu) ne nécessite pas de calibration
numérique — mais sa *fréquence* doit être validée (objectif ≤ 30%).

---

## B. Ce qu'il faut observer

### Grille d'observation par session

À compléter par l'observateur pour chaque session observée.
Une "session" = une ouverture du moteur jusqu'à fermeture ou inactivité > 20 min.

| Champ | Description | Méthode de collecte |
|---|---|---|
| Fréquence T3 brute | Nombre d'apparitions du message T3 / nombre de soumissions | Comptage visuel |
| Fréquence T3 % | (T3 apparu / total soumissions) × 100 | Calculé |
| Soumissions par session | Nombre total de clics "Analyser" dans la session | Comptage |
| Messages consécutifs | T3 apparu 2 fois de suite ou plus | Note qualitative |
| Sessions silencieuses | Session sans aucun message T3 | Note binaire |
| Durée de visibilité | L'opérateur lit-il le message ? (1 sec au moins) | Observation directe |
| Réaction immédiate | Pause, réajustement, rien | Observation directe |
| Commentaire spontané | L'opérateur mentionne le message sans y être invité | Note verbatim |

### Tableau des comportements à surveiller

**Comportements de prise de conscience (signal positif potentiel)**

| Comportement | Description observable |
|---|---|
| Pause après message | L'opérateur s'arrête ≥ 3 secondes avant la soumission suivante |
| Réajustement engagement | L'opérateur modifie `need_action` ou `posture` après avoir vu le message |
| Lecture active | L'opérateur incline la tête, lit la phrase, reprend la session avec moins de précipitation |
| Verbalisé sans question | "Ah tiens, ça me dit quelque chose" sans qu'on lui pose la question |
| Session ralentie | Intervalle moyen entre soumissions augmente après l'apparition de T3 |

**Comportements d'adaptation neutre (acceptable)**

| Comportement | Description observable |
|---|---|
| Vu mais ignoré | L'opérateur voit le message, continue sans modifier son comportement |
| Noté mentalement | L'opérateur ne réagit pas immédiatement mais mentionne plus tard dans la session |

**Comportements d'alerte (à documenter sans modifier le moteur)**

| Comportement | Description observable |
|---|---|
| Évitement actif | L'opérateur modifie ses inputs pour faire disparaître le message |
| Habituation | L'opérateur ne regarde plus la zone message après 3 sessions |
| Surinterprétation | L'opérateur croit que le message lui interdit de trader |
| Rejet explicite | "Je n'ai pas besoin de ça" — demande de désactivation |
| Confusion | "Qu'est-ce que ça veut dire ?" — message non compris |

### Variables V1 à noter en Debug panel (inférences T3)

Le Debug Brain V1 permet de confirmer quand les conditions T3 sont remplies
(posture = ACTIVE + score visible). Colonnes à relever manuellement :

| Variable V1 Debug | Usage d'inférence |
|---|---|
| Posture | Si ACTIVE + need_action=no → conditions T3 réunies |
| Score (confidence) | Distribution réelle — utile pour calibration T1 future |
| Market reading state | Contexte général de la session |

---

## C. Signaux d'alerte

Les signaux d'alerte ne déclenchent pas de correction immédiate. Ils déclenchent
une observation renforcée et une analyse avant toute action.

### Signaux bloquants — stopper V0 immédiatement

| Signal | Définition opérationnelle | Action |
|---|---|---|
| Erreur JS console | Toute erreur liée à V2 en console navigateur | Rollback N2 (V2_COCKPIT_MESSAGE:false) + investigation |
| Message double | Deux blocs `.v2-message` visibles simultanément | Rollback N1 (revert T2-05) |
| Régression V1 | Score ou posture différents d'une session identique | Rollback N3 (tous flags Phase 2) |
| Demande de désactivation | ≥ 1 opérateur demande explicitement la suppression du message | Désactivation immédiate individuelle, analyse avant généralisation |

### Signaux de calibration — pause et analyse

| Signal | Définition opérationnelle | Seuil | Action |
|---|---|---|---|
| T3 trop fréquent | Fréquence T3 > 30% sur ≥ 10 sessions | > 30% | Analyser conditions T3 (posture/engagement) — ne pas modifier les seuils avant ≥ 50 sessions |
| T3 toujours identique | Le même message apparaît à chaque session pour un opérateur | 5 sessions consécutives | Analyser si conditions T3 sont structurellement permanentes (profil ACTIVE systématique) |
| Session entière ignorée | L'opérateur ne regarde pas la zone message sur ≥ 3 sessions | 3 sessions | Observer sans intervenir — noter le comportement |
| Confusion sémantique | ≥ 2 opérateurs expriment une incompréhension du message | 2 occurrences | Analyser le message — reformulation possible avant T3-02 |
| Cockpit perçu bruyant | ≥ 2 opérateurs décrivent le cockpit comme "nerveux" ou "qui alerte" | 2 occurrences | Signal doctrine silence — investiguer fréquence réelle |

### Signaux de vigilance — observer sans agir

| Signal | Description |
|---|---|
| T3 jamais observé | Fréquence T3 = 0% sur ≥ 20 sessions — vérifier que les conditions ACTIVE + need_action=no sont atteignables |
| Saturation attentionnelle progressive | L'opérateur commente le message positivement en session 1, négativement en session 5 |
| Sur-suppression gate attention | L'opérateur est ACTIVE + need_action=no mais le message n'apparaît pas — le gate a déjà atteint `high` (vérifiable en Debug si accès V2) |

---

## D. Signaux positifs

Les signaux positifs valident la doctrine du silence structurel : le message est rare,
il apporte une information actionnable, il ne génère pas d'urgence artificielle.

### Signaux de valeur directe

| Signal | Description | Pourquoi c'est bon |
|---|---|---|
| Ralentissement utile | L'opérateur fait une pause perceptible après le message | Le cockpit crée un espace de réflexion sans l'imposer |
| Interruption d'impulsion | L'opérateur allait soumettre rapidement, puis reconsidère | T3 remplit sa fonction doctrinale : interrompre le delta engagement/posture |
| Prise de conscience verbalisée | "Ah oui, je suis ACTIVE mais je voulais juste observer" | L'opérateur reconnaît la contradiction que T3 décrit |
| Ajustement engagement | L'opérateur modifie need_action après le message | Signal d'actionabilité directe |

### Signaux de valeur indirecte

| Signal | Description | Pourquoi c'est acceptable |
|---|---|---|
| Message vu, pas d'action | L'opérateur lit et continue | L'information a été reçue — l'opérateur juge qu'elle n'est pas prioritaire |
| Silence non remarqué | L'opérateur ne mentionne pas l'absence de message | Le cockpit calme est invisible — c'est l'objectif |
| Fréquence stable sur 10 sessions | T3 apparaît régulièrement mais pas systématiquement | Confirme que les conditions T3 sont réelles, pas permanentes |

### Signaux de qualité doctrinale

| Signal | Description |
|---|---|
| Respiration cognitive | L'opérateur déclare utiliser le moteur "pour réfléchir, pas pour décider vite" |
| Baisse du stress décisionnel | L'opérateur décrit une session plus calme qu'avant le moteur — corrélation, pas causalité |
| Lecture plus posée | Intervalle moyen entre soumissions augmente sur 10 sessions (possible évolution) |
| Zéro mention de surveillance | Aucun opérateur ne décrit le système comme "qui surveille" ou "qui juge" |

---

## E. Méthode de collecte

### Ce qui est directement observable sans accès technique

La contrainte est réelle : le seul signal V2 observable sans console ni
modification de code est la présence visuelle du bloc `.v2-message` dans
le cockpit. Tout le reste doit être inféré ou collecté par observation directe.

| Canal | Données collectables | Fréquence | Responsable |
|---|---|---|---|
| Observation visuelle cockpit | T3 présent/absent · durée de lecture · réaction immédiate | Chaque session observée | Implémenteur |
| Debug Brain V1 (UI) | Score · posture · state · market reading | Chaque soumission | Observateur ou opérateur |
| Journal utilisateur (optionnel) | Ressenti · moments notables · commentaires | Fin de session | Opérateur |
| Retour spontané | Toute réaction non sollicitée | Continu passif | Tous canaux |
| Observation directe bi-mensuelle | Session complète observée en direct | 1 session / opérateur / 2 semaines | Implémenteur |

### Journal de session — format minimal

À remplir après chaque session observée (ou auto-reporté par l'opérateur
si observation directe impossible) :

```
Date         : ___________
Opérateur    : (anonymisé — ex. OP-01)
Soumissions  : ___
T3 apparu    : ___ fois
T3 % session : ___%
Session silencieuse : ☐ Oui  ☐ Non
Comportement notable : ___________________________________________
Commentaire spontané : ___________________________________________
Signal d'alerte      : ☐ Aucun  ☐ Léger  ☐ Bloquant
```

### Accès aux données V2 via console (observation technique renforcée)

Pour les sessions où l'implémenteur est présent avec accès DevTools :

`currentPayload` n'est pas sur `window` (variable de module render.js).
Accès possible via import dynamique dans la console navigateur :

```javascript
// Console DevTools — accès aux données V2 de la dernière soumission
// (nécessite que render.js soit chargé en ES module)
const { runV2 } = await import('/src/js/v2/pipeline-v2.js');
// Puis recréer le payload de test et appeler runV2() directement
```

Cette méthode est réservée à l'implémenteur lors d'observations techniques.
Elle ne nécessite aucune modification de code. Elle permet de lire
`tensionMap`, `attentionResult.should_expose`, et de confirmer si
une suppression par le gate attention est à l'origine d'un silence cockpit.

### Collecte des données pour calibration T1/T4 (future)

Ces données ne peuvent pas être collectées sans extension du payload V1.
MdS, QdR, DMU ne sont pas dans le payload V1 actuel. Tant que ces champs
ne sont pas exposés, les données nécessaires à T3-01 et T3-07 ne peuvent
pas être collectées au cours du V0.

**Conséquence** : le V0 peut valider T3 (fréquence, utilité, fatigue) et D-ATT-01
(densité de sessions, taux de suppression estimé par inférence). Il ne peut pas
directement valider les seuils T1/T4 sans exposition des champs premium dans le payload.

---

## F. Ce qu'il ne faut surtout pas faire

### Erreurs de calibration prématurée

**Ne pas modifier les seuils sur < 50 sessions.**
10 sessions peuvent produire une fréquence T3 de 0% ou de 80% selon le profil
de l'opérateur et les conditions de marché de la semaine. Ce n'est pas un signal
de calibration — c'est du bruit d'échantillon. La calibration requiert une
distribution stable.

**Ne pas baisser les seuils T3 parce que T3 "ne se déclenche pas assez".**
T3 est binaire (ACTIVE + engagement faible). Si T3 ne se déclenche pas, c'est
que les opérateurs ne sont pas en posture ACTIVE avec engagement faible —
c'est une information, pas un dysfonctionnement. Les seuils T3 ne sont pas
des seuils continus.

**Ne pas activer T1/T2/T4 cockpit parce que T3 semble "trop rare".**
La rareté de T3 est un signal positif si elle correspond à une population d'opérateurs
disciplinés. Ajouter T1/T2/T4 pour "augmenter l'activité cockpit" contredit
la doctrine du silence structurel.

### Erreurs d'interprétation

**Ne pas confondre "opérateur qui ne dit rien" et "message utile".**
L'absence de retour négatif n'est pas une validation. Un opérateur peut ignorer
le message sans le remarquer. L'absence de commentaire n'est informative que si
elle s'accompagne d'un comportement observable (ralentissement, ajustement).

**Ne pas confondre fréquence T3 et fréquence d'exposition.**
Le gate attention (WINDOW_SIZE=5) peut supprimer T3 même quand les conditions
sont réunies. La fréquence visible de T3 est inférieure ou égale à la fréquence
de déclenchement T3. Cette distinction est invisible sans accès aux données V2.

**Ne pas corriger sur intuition après 3 sessions.**
L'intuition d'un implémenteur sur "ce que l'opérateur ressent" n'est pas
une donnée de calibration. Observer, noter, attendre un volume suffisant.

### Erreurs de méthode

**Ne pas mélanger observation UX et calibration numérique.**
L'observation UX ("est-ce que le message aide ?") et la calibration numérique
("quel seuil X pour T1 ?") sont deux opérations distinctes. Un message jugé
utile par les opérateurs peut avoir un seuil trop bas. Un seuil correctement
calibré peut produire un message peu lisible. Les corriger séparément.

**Ne pas solliciter de retour après chaque session.**
La doctrine de transmission (invitations directes, zéro relance) s'applique
ici. Un retour forcé après chaque session génère un biais de confirmation
("j'ai dû observer quelque chose, donc je rapporte quelque chose"). Seuls
les retours spontanés et les observations directes sont fiables.

**Ne pas documenter des "impressions" comme des mesures.**
"L'opérateur semblait fatigué du message" n'est pas une mesure. "L'opérateur
n'a pas regardé la zone message lors des soumissions 7–12" est une mesure.
La distinction est importante pour ne pas contaminer les tableaux de calibration.

---

## G. Critères minimum avant T3-01

T3-01 ne peut pas démarrer sans données terrain suffisantes. Ces critères
sont des planchers — pas des objectifs à atteindre à minima pour passer à
la suite rapidement.

### Volume de sessions minimum

| Paramètre | Minimum absolu | Recommandé | Source |
|---|---|---|---|
| Opérateurs distincts | 10 | 20–30 | calibration-terrain.md |
| Sessions par opérateur | 5 | ≥ 10 | calibration-terrain.md |
| Sessions totales | 50 | ≥ 200 | Dérivé |
| Sessions avec T3 observé | 20 | ≥ 50 | Checklist Phase 3 (§ T3-01) |
| Durée d'observation | 2 semaines | 2–4 semaines | calibration-terrain.md |

Le seuil de 50 sessions avec T3 observé est explicitement requis dans
`checklist-implementation-phase-3.md` (§ T3-01) : "Données V0 analysées
(≥ 50 sessions shadow T1)". Ce seuil vise T1, mais le même raisonnement
s'applique à la validation T3 pour D-ATT-01.

### Fréquence T3 acceptable avant T3-01

| Fréquence T3 observée | Interprétation | Action |
|---|---|---|
| 0% sur ≥ 20 sessions | Conditions T3 structurellement absentes | Vérifier profils opérateurs — T3 peut être correct |
| 1–15% | Fréquence basse — probablement acceptable | Continuer observation — ne pas agir |
| 16–30% | Cible — confirmer sur ≥ 30 sessions | Valider sur volume plus large |
| 31–50% | Alerte — T3 trop fréquent ou opérateurs systématiquement ACTIVE | Observer sans corriger sur < 50 sessions |
| > 50% | Signal bloquant — posture ACTIVE dominante ou conditions T3 mal calibrées | Analyser le profil des opérateurs avant de conclure |

### Seuil de saturation acceptable

Le seuil de saturation est atteint quand l'opérateur ne traite plus le message
comme de l'information mais comme du bruit visuel. Indicateurs :

| Indicateur | Seuil d'alerte |
|---|---|
| T3 consécutifs sans réaction observée | ≥ 5 dans la même session |
| Sessions consécutives avec message sans commentaire | ≥ 7 sessions d'affilée |
| L'opérateur ne regarde plus la zone message | Observé sur ≥ 3 sessions |
| Retour "je vois toujours la même chose" | 1 occurrence suffit |

La saturation n'est pas un signal de correction immédiate du seuil. Elle peut
indiquer que WINDOW_SIZE=5 est trop permissif (suppression insuffisante), ou
que la population d'opérateurs est structurellement en conditions T3 permanentes.
Les deux causes ont des remèdes différents.

### Conditions minimales avant de commencer T3-01

**Toutes les conditions suivantes doivent être réunies :**

- [ ] ≥ 10 opérateurs distincts ont utilisé le moteur avec T3 actif
- [ ] ≥ 50 sessions totales enregistrées (journal rempli)
- [ ] ≥ 20 sessions où T3 s'est déclenché au moins une fois
- [ ] Fréquence T3 stable sur les 20 dernières sessions (variation < 10 points)
- [ ] Aucun signal bloquant actif (erreur JS, double message, demande de désactivation)
- [ ] Aucune confusion sémantique non résolue sur le message T3
- [ ] La distribution des scores (confidence_score) est documentée sur ≥ 30 sessions
  (nécessaire pour calibration T1 — à collecter manuellement depuis Debug panel V1)

---

## H. Hypothèses à surveiller

Ces hypothèses ont guidé les décisions architecturales de Phase 1 et Phase 2.
Le V0 peut les infirmer. Si elles sont infirmées, ne pas corriger dans le code
avant analyse — les noter comme "infirmées" et décider d'une réponse structurée.

| Hypothèse | Ce qui la validerait | Ce qui l'infirmerait |
|---|---|---|
| T3 est binaire et immédiatement compréhensible | "Ah oui, je comprends" spontané | Confusion répétée sur le sens du message |
| WINDOW_SIZE=5 est adapté à une session de 3–8 soumissions | Gate attention supprime T3 ≤ 15% du temps | Suppression > 40% ou T3 visible à chaque soumission |
| Le message T3 est sobre et non intrusif | L'opérateur ne le mentionne pas comme gênant | "C'est agressif" ou "ça m'interrompt" |
| La fréquence T3 sera ≤ 30% | Taux observé ≤ 30% sur ≥ 30 sessions | Taux observé systématiquement > 30% |
| Le silence du cockpit est normal et confortable | Opérateurs ne signalent pas d'absence d'information | "Il ne se passe rien — le moteur est cassé ?" |
| posture=ACTIVE + need_action=no est un proxy valide de T3 | Les opérateurs reconnaissent la tension décrite | "Je suis ACTIVE mais mon engagement est cohérent" |

---

## I. Risques principaux du V0

### Risque R1 — Sous-représentation ACTIVE dans le panel V0

Si les opérateurs invités en V0 sont majoritairement en posture PASSIVE ou BALANCED,
T3 ne se déclenchera presque jamais. La fréquence observée sera structurellement
basse — non pas parce que T3 est bien calibré, mais parce que la population V0
est atypique.

**Garde-fou** : noter le profil de posture dominant de chaque opérateur.
Si la proportion ACTIVE < 20% du panel, les données T3 ne sont pas représentatives.

### Risque R2 — Sur-représentation ACTIVE dans le panel V0

Inverse de R1 : si les opérateurs invités sont majoritairement en posture ACTIVE
(traders actifs sélectionnés pour leur engagement), T3 sera sur-représenté.
La fréquence observée dépassera 30% non par erreur de calibration,
mais par biais de sélection.

**Garde-fou** : mêmes données de profil. Si proportion ACTIVE > 60%, les données
T3 surestiment la fréquence réelle dans la population générale.

### Risque R3 — Confusion entre attention gate et seuil T3

Un cockpit silencieux peut avoir deux causes : (a) T3 ne se déclenche pas (conditions
non réunies) ou (b) T3 se déclenche mais est supprimé par le gate attention.
Ces deux causes sont indiscernables sans accès aux données V2 (non visible dans
l'interface actuelle).

**Garde-fou** : lors des sessions d'observation technique (console DevTools),
vérifier `attentionResult.should_expose` pour distinguer non-déclenchement
de suppression.

### Risque R4 — Habituation rapide masquant la saturation

Si la saturation s'installe discrètement (opérateur cesse de regarder la zone
message), elle peut passer inaperçue si l'observation n'est pas directe.
Un journal auto-reporté par l'opérateur ne détectera pas ce comportement.

**Garde-fou** : au moins 2 sessions d'observation directe par opérateur sur
la durée du V0, de préférence en semaine 1 et en semaine 3.

### Risque R5 — Pression de résultats conduisant à T3-01 prématuré

Après 2–3 semaines, la pression naturelle d'avancement peut inciter à lancer
T3-01 avant que le volume de sessions soit suffisant. Une calibration sur
20 sessions peut produire des seuils qui semblent corrects mais qui sont
non représentatifs.

**Garde-fou** : les critères § G sont des planchers non négociables.
Si les conditions ne sont pas remplies à 4 semaines, le V0 est prolongé —
pas contourné.

### Risque R6 — MdS/QdR/DMU non collectés pendant V0

T3-01 porte sur T1, pas T3. Pour calibrer T1, il faut les distributions de
`confidence_score`, `MdS`, `DMU` sur des sessions réelles. Ces champs ne sont
pas dans le payload V1 actuel — ils ne sont donc pas visibles dans le Debug panel.

**Conséquence** : le V0 dans son état actuel ne peut pas collecter les données
nécessaires à T3-01. Phase 3 restera partiellement bloquée même après V0 validé
pour T3, jusqu'à ce que les champs premium soient exposés dans le payload V1.

Ce risque est documenté, pas masqué. Il n'est pas un motif pour modifier le
payload V1 maintenant — il est un motif pour le noter et planifier l'exposition
des champs comme prérequis de T3-01.

---

## J. Posture d'observation

### Ce que le V0 n'est pas

- Ce n'est pas un test de performance (pas de métrique de "succès")
- Ce n'est pas une démonstration (pas de présentation du moteur sous son meilleur jour)
- Ce n'est pas une phase d'optimisation (les seuils ne doivent pas être touchés)
- Ce n'est pas une enquête de satisfaction (pas de questionnaire NPS, pas de score)

### Ce que le V0 est

Le V0 est une observation prolongée. L'implémenteur regarde le moteur interagir
avec des opérateurs réels et note ce qu'il voit, sans interpréter immédiatement,
sans corriger dans le feu de l'action, sans tirer de conclusions sur moins de
50 sessions.

**La posture d'observation, c'est aussi accepter que le moteur soit silencieux.**
Si T3 ne se déclenche pas pendant 3 sessions, c'est une information. Si le
cockpit reste vide pendant une semaine pour un opérateur, c'est peut-être
exactement le comportement correct.

**La surface calme n'est pas un échec. C'est l'objectif.**

---

## Statut

**Type** : Document stratégique · Version 1.0 · 2026-05-25
**Code modifié** : zéro
**Flags modifiés** : zéro
**V2_CALIBRATION** : false — ne pas activer
**Phase 3** : non commencée — T3-01 reste bloqué par absence de données terrain

Ce document est le pont entre la fin de Phase 2 (moteur figé, T3 actif)
et le début de Phase 3 (calibration). Il ne déclenche rien. Il prépare
un regard juste.

---

*Stratégie d'observation terrain V0 — Version 1.0 — 2026-05-25*
