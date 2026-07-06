# LOT-P1.5 — Validation terrain du diagnostic mémoriel V1

**Statut : CADRAGE**

---

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1.5 |
| Titre | Validation terrain du diagnostic mémoriel V1 |
| LOT parent | LOT-P1 — Diagnostic mémoriel V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Observabilité |
| Statut | CADRAGE |
| Date de cadrage | 2026-07-06 |
| Prérequis | LOT-P1.1 validé · LOT-P1.2 `e03edec` · LOT-P1.3 `1894d70` · LOT-P1.4 `08f7bcd` |

---

## 1 — Objet et portée

LOT-P1.5 est le protocole officiel de validation terrain du diagnostic mémoriel V1. Il définit les scénarios, les critères et les preuves permettant de confirmer que l'ensemble du travail produit dans LOT-P1.1 à LOT-P1.4 est correctement reflété dans le diagnostic accessible à l'opérateur.

La validation terrain est une vérification par observation directe. Elle ne porte pas sur le code, les structures de données ou les mécanismes internes. Elle porte exclusivement sur ce que l'opérateur voit et peut lire dans l'interface.

La validation terrain est une condition nécessaire et suffisante à la clôture officielle de LOT-P1.

---

## 2 — Prérequis à l'ouverture de la validation terrain

La validation terrain ne peut pas commencer avant que les trois conditions suivantes soient réunies :

1. Le diagnostic mémoriel est accessible depuis l'interface sans manipulation technique.
2. LOT-P1.1, LOT-P1.2, LOT-P1.3 et LOT-P1.4 sont chacun en statut CADRAGE VALIDÉ.
3. La couche de persistance contient au moins une famille dans chaque état représentatif (Présente, Vide, Absente) pour permettre l'observation de chaque scénario.

Si la condition 3 ne peut pas être réunie naturellement, l'opérateur prépare l'environnement d'observation avant de démarrer — sans modifier le comportement du diagnostic.

---

## 3 — Scénarios de validation

### Scénario V1 — Exhaustivité du diagnostic

**Objectif :** confirmer que les 14 entrées définies en LOT-P1.2 §2 sont toutes présentes dans le diagnostic, et que les familles exclues sont absentes.

**Procédure :** ouvrir le diagnostic et lire chaque famille, entrée par entrée.

| Famille | Entrées attendues |
|---|---|
| F1 — Mémoire comportementale | Sessions comportementales · Mémoire comportementale · Niveau de garde comportemental · Paramètres d'ordres récents |
| F2 — Mémoire opérateur | Mémoire opérateur · Historique des analyses opérateur |
| F3 — Mémoire décisionnelle | Journal des décisions moteur · Sauvegardes moteur |
| F4 — Données opérateur | Registre des importations · Portefeuille · Paramètres |
| F5 — Système local | Identité locale · État de navigation · Instantané moteur |

**Critère de réussite :** les 14 entrées sont visibles dans leurs familles respectives · aucune entrée n'appartient à la mauvaise famille · aucune entrée n'apparaît en double · les familles exclues (embarquement initial, limitation temporelle d'accès, marqueurs de migration) n'apparaissent pas dans le diagnostic.

**Critère d'échec :** une entrée attendue est absente · une entrée apparaît dans la mauvaise famille · une 15e entrée non définie en LOT-P1.2 est présente · une famille exclue est visible.

---

### Scénario V2 — Libellés opérateur

**Objectif :** confirmer que chaque entrée porte le libellé exact défini en LOT-P1.2 §2.

**Procédure :** lire chaque libellé affiché et le comparer aux 14 libellés de référence de LOT-P1.2 §2.

**Critère de réussite :** chaque libellé affiché est identique au libellé de référence — aucun mot abrégé, reformulé ou manquant.

**Critère d'échec :** un libellé diffère du libellé de référence, même d'un seul mot · un terme interdit par le Language System V1 apparaît dans un libellé · un terme technique interne est exposé.

---

### Scénario V3 — Provenance par famille

**Objectif :** confirmer que chaque famille affiche l'étiquette de provenance définie en LOT-P1.2 §3.

| Famille | Provenance attendue |
|---|---|
| F1 — Mémoire comportementale | Analyse comportementale |
| F2 — Mémoire opérateur | Mémoire opérateur |
| F3 — Mémoire décisionnelle | Moteur décisionnel |
| F4 — Données opérateur | Données opérateur |
| F5 — Système local | Système local |

**Critère de réussite :** chaque famille affiche l'étiquette de provenance exacte, de façon discrète et lisible.

**Critère d'échec :** une étiquette est absente · une étiquette est inexacte · une étiquette est présentée avec une prominence identique au nom de l'entrée.

---

### Scénario V4 — État Présente

**Objectif :** confirmer qu'une entrée dont les données sont présentes est affichée conformément à LOT-P1.4 §5.1.

**Procédure :** observer une entrée pour laquelle des données existent dans la couche de persistance.

**Critère de réussite :**
- Nom affiché.
- Aucun message d'état ("Non enregistrée" ou "Aucune donnée enregistrée" absents).
- Espace utilisé affiché en Ko avec une décimale.
- Datation au format "Mis à jour le JJ/MM/AAAA".
- Étiquette de provenance visible.

**Critère d'échec :** message d'état parasite présent · espace utilisé absent · datation absente sans "— datation non disponible" · format de date incorrect.

---

### Scénario V5 — État Vide

**Objectif :** confirmer qu'une entrée existante mais sans contenu est affichée conformément à LOT-P1.4 §5.2.

**Note :** ce scénario valide également le cas LOT-P1.3 §5.4 (famille vide avec datation disponible), identifié comme risque documentaire R-DOC-02 lors du cadrage LOT-P1.3.

**Critère de réussite :**
- Nom affiché.
- Message "Aucune donnée enregistrée" présent.
- Espace utilisé affiché (volume de l'enveloppe).
- Datation : "Mis à jour le JJ/MM/AAAA" si la métadonnée est disponible dans l'enveloppe · "— datation non disponible" sinon.
- Étiquette de provenance visible.

**Critère d'échec :** message d'état absent ou incorrect · espace utilisé affiché comme "—" alors que l'enveloppe existe · datation incorrecte ou absente sans signalement.

---

### Scénario V6 — État Absente

**Objectif :** confirmer qu'une entrée non présente dans la couche de persistance est affichée conformément à LOT-P1.4 §5.3.

**Critère de réussite :**
- Nom affiché.
- Message "Non enregistrée" présent.
- Espace utilisé affiché comme "—".
- Aucune date affichée.
- Étiquette de provenance visible.
- Présentation visuellement neutre — aucun signal d'anomalie (I-04).

**Critère d'échec :** message d'état absent ou incorrect · une date est affichée · espace utilisé affiché autrement que "—" · état Absente présenté avec une mise en relief alarmante.

---

### Scénario V7 — État Non datée — R1 (Mémoire comportementale)

**Objectif :** confirmer que la famille R1 affiche "— datation non disponible" conformément à LOT-P1.3 §6.1 et LOT-P1.4 §5.4.

**Procédure :** observer l'entrée Mémoire comportementale lorsque des données sont présentes.

**Critère de réussite :**
- Nom affiché : "Mémoire comportementale".
- Espace utilisé affiché en Ko.
- Datation : "— datation non disponible".
- Aucune date au format JJ/MM/AAAA.
- Aucune date estimée, calculée ou déduite.

**Critère d'échec :** une date quelconque est affichée · "— datation non disponible" est absent.

---

### Scénario V8 — État Non datée — R3 (Niveau de garde comportemental)

**Objectif :** confirmer que la famille R3 affiche "— datation non disponible" conformément à LOT-P1.3 §6.3 et LOT-P1.4 §5.4.

**Procédure :** observer l'entrée Niveau de garde comportemental lorsque des données sont présentes.

**Critère de réussite :**
- Nom affiché : "Niveau de garde comportemental".
- Espace utilisé affiché en Ko.
- Datation : "— datation non disponible".
- Aucune date au format JJ/MM/AAAA.
- Aucune information temporelle alternative présentée comme une date.

**Critère d'échec :** une date quelconque est affichée · "— datation non disponible" est absent · une information temporelle non standard est visible à la place ou en complément.

---

### Scénario V9 — Datation standard (famille datable)

**Objectif :** confirmer qu'une famille parmi les 12 familles datables affiche sa date de dernière écriture au format correct.

**Procédure :** observer une entrée datable (hors R1 et R3) lorsque des données sont présentes.

**Critère de réussite :**
- Date affichée au format "Mis à jour le JJ/MM/AAAA".
- Date seule, sans l'heure.
- Date cohérente avec une écriture récente connue de l'opérateur.

**Critère d'échec :** date absente · heure incluse dans l'affichage · format non conforme · date manifestement incohérente (date future, date antérieure à l'existence du système).

---

### Scénario V10 — Espace utilisé par état

**Objectif :** confirmer que l'espace utilisé est affiché conformément à LOT-P1.2 §6 pour chaque état.

**Procédure :** observer l'espace utilisé de trois entrées représentatives : une Présente, une Vide, une Absente.

**Critère de réussite :**
- Présente : valeur en Ko avec une décimale — ex. "4,2 Ko".
- Vide : valeur en Ko de l'enveloppe — ex. "0,1 Ko".
- Absente : "—".

**Critère d'échec :** une entrée Présente affiche "—" · une entrée Absente affiche une valeur · format sans décimale · unité absente ou incorrecte.

---

### Scénario V11 — Total de la couche de persistance

**Objectif :** confirmer que le total est affiché conformément à LOT-P1.2 §6 et LOT-P1.4 §2.2, positionné après l'introduction et avant les familles.

**Critère de réussite :**
- Espace total affiché en Ko avec une décimale.
- Pourcentage d'occupation affiché.
- Niveau d'occupation affiché : "Nominal", "Élevé" ou "Saturé" — aucun autre terme.
- Total positionné après l'introduction et avant F1.

**Critère d'échec :** un niveau d'occupation utilise un terme non conforme (Normal, Vigilance, Critique ou autre) · total absent · total positionné après les familles.

---

### Scénario V12 — Introduction du composant

**Objectif :** confirmer que l'introduction est affichée mot pour mot, en tête du diagnostic, en permanence.

**Texte attendu exact :**

> "Le diagnostic mémoriel lit l'état actuel des données enregistrées sur cet appareil. Il ne modifie aucune donnée, ne produit aucune recommandation et ne déclenche aucune action. Une famille absente ou vide est un état normal."

**Critère de réussite :** texte affiché mot pour mot · positionné avant le total et les familles · visible sans interaction · présent quelle que soit la quantité de données.

**Critère d'échec :** texte absent · texte modifié, même d'un mot · texte positionné après les familles · texte masqué par défaut.

---

### Scénario V13 — Message d'état vide global

**Objectif :** confirmer que le message global apparaît uniquement lorsque toutes les entrées sont absentes ou vides.

**Texte attendu exact :**

> "Aucune donnée opérateur n'est enregistrée sur cet appareil."

**Critère de réussite :**
- Message affiché à la place des familles lorsque toutes les entrées sont absentes ou vides.
- Texte exact, neutre, non alarmant.
- Introduction toujours visible au-dessus du message.
- Message absent dès qu'au moins une entrée est présente.

**Critère d'échec :** message absent alors que toutes les entrées sont absentes ou vides · message affiché alors qu'une entrée est présente · texte modifié · style alarmant.

---

### Scénario V14 — Hiérarchie visuelle F1→F4 / F5

**Objectif :** confirmer que F5 est présenté dans une zone visuellement distincte et secondaire, après F1→F4, conformément à LOT-P1.4 §1.3 et §3.2.

**Critère de réussite :**
- F1, F2, F3, F4 affichées avant F5.
- F5 perçu visuellement comme secondaire par rapport à F1→F4.
- Les trois entrées de F5 sont visibles par défaut sans interaction.

**Critère d'échec :** F5 est affiché avant F4 · F5 est visuellement identique à F1→F4 sans distinction perceptible · les entrées de F5 sont masquées sans action de l'opérateur.

---

### Scénario V15 — Repliabilité de F5

**Objectif :** confirmer que la zone F5 peut être réduite et restaurée par l'opérateur, sans perte de données ni effet sur les autres familles.

**Procédure :** réduire la zone F5 · vérifier que F1→F4 ne sont pas affectées · restaurer F5 · vérifier que les données sont identiques avant et après.

**Critère de réussite :**
- La zone F5 peut être réduite par l'opérateur.
- Le repli est réversible.
- Les données F5 après restauration sont identiques aux données avant réduction.
- Les familles F1→F4 restent inchangées pendant et après le repli de F5.
- Aucune famille F1→F4 n'est repliable.

**Critère d'échec :** F5 ne peut pas être replié · les données diffèrent après restauration · une famille F1→F4 est repliable · le repli affecte l'affichage d'une autre famille.

---

### Scénario V16 — Neutralité des niveaux d'occupation

**Objectif :** confirmer qu'aucun niveau d'occupation ne reçoit une présentation visuellement plus urgente que les autres, conformément à LOT-P1.4 §4.1.

**Procédure :** observer le niveau d'occupation affiché dans le total et évaluer sa présentation.

**Critère de réussite :** le niveau d'occupation est affiché en texte factuel · sa présentation ne diffère pas qualitativement des autres informations du total · le terme affiché est "Nominal", "Élevé" ou "Saturé".

**Critère d'échec :** un niveau est distingué par une couleur, une icône ou une typographie signalant une urgence · le terme affiché n'est pas l'un des trois termes définis.

---

### Scénario V17 — Conformité Language System V1

**Objectif :** confirmer qu'aucun terme interdit par le Language System V1 n'apparaît dans la surface de présentation du diagnostic.

**Termes interdits à rechercher activement :**

| Terme interdit | Raison |
|---|---|
| "Erreur" | Interdit — remplacer par "Non disponible" |
| "Profil" | Interdit — risque I-06 |
| "Alerte" | Interdit |
| "Signal" | Interdit |
| "Vigilance" (niveau d'occupation) | Interdit — prescriptif |
| "Critique" (niveau d'occupation) | Interdit — alarmiste |
| "Normal" (niveau d'occupation) | Interdit — normatif |
| "Décision" (qualificatif du moteur) | Interdit — viole Lecture ≠ Action |
| "Manque" | Interdit — suggère un défaut |
| "Doit" | Interdit — prescription |
| "À corriger" / "Corriger" | Interdit — invitation à l'action |

**Critère de réussite :** aucun terme interdit n'apparaît dans l'ensemble de la surface de présentation — libellés, messages d'état, datation, niveaux d'occupation, introduction, message global.

**Critère d'échec :** un terme interdit apparaît, dans n'importe quel élément visible du diagnostic.

---

### Scénario V18 — Conformité Lecture ≠ Action

**Objectif :** confirmer que le diagnostic ne contient aucune invitation à l'action et que sa consultation ne modifie aucune donnée.

**Critère de réussite :**
- Aucun élément interactif du diagnostic n'agit sur la couche de persistance.
- Après consultation du diagnostic, l'état de toutes les familles mémorielles est identique à l'état avant consultation.
- Aucune formulation directive ou corrective n'est présente dans la surface du diagnostic.

**Critère d'échec :** la consultation du diagnostic modifie une donnée de la couche de persistance · un bouton, lien ou formulation invite à corriger, purger ou modifier · l'état d'une famille change après lecture.

---

### Scénario V19 — Cohérence documentaire globale

**Objectif :** confirmer qu'aucun comportement observé en terrain ne contredit les règles définies dans LOT-P1.1 à LOT-P1.4.

**Procédure :** après l'ensemble des scénarios V1→V18, l'opérateur confirme l'absence de contradiction entre le comportement observé et les cadrages de référence.

**Critère de réussite :** aucun comportement observé ne contredit une règle documentée dans les quatre lots précédents.

**Critère d'échec :** un comportement observé contredit explicitement une règle d'un lot précédent — identifier le lot, la section et la règle en conflit.

---

## 4 — Preuves attendues

Pour chaque scénario V1 à V19, la preuve de réussite est une observation directe par l'opérateur, consignée dans un rapport de validation terrain.

**La preuve ne requiert pas :**
- de test automatisé ;
- de capture d'écran automatisée ;
- de lecture de code source ;
- d'inspection directe de la couche de persistance.

**La preuve requiert :**
- que l'opérateur ait ouvert le diagnostic ;
- que l'opérateur ait observé chaque élément concerné par le scénario ;
- que l'opérateur ait comparé l'observation au critère de réussite ;
- que l'opérateur ait consigné son verdict (PASS / FAIL) pour chaque scénario.

Le rapport de validation terrain peut prendre la forme d'une note de validation ou d'un document dédié. Il constitue la preuve officielle de clôture de LOT-P1.

---

## 5 — Conditions de clôture officielle de LOT-P1

LOT-P1 peut être officiellement clos si et seulement si :

1. Les 19 scénarios de validation (V1→V19) ont été exécutés par l'opérateur.
2. Chacun des 19 scénarios a reçu le verdict PASS.
3. Aucun critère d'échec n'a été constaté.
4. Le rapport de validation terrain a été produit et consigné.

**En cas de FAIL sur un ou plusieurs scénarios :**

| Scénarios en échec | Lot à réviser |
|---|---|
| V1 — Exhaustivité | LOT-P1.2 — périmètre des familles |
| V2 — Libellés | LOT-P1.2 — libellés opérateur |
| V3 — Provenance | LOT-P1.2 — étiquettes de provenance |
| V4, V5, V6 — États | LOT-P1.2 — définition des états |
| V7 — R1 (Non datée) | LOT-P1.3 — §6.1 |
| V8 — R3 (Non datée) | LOT-P1.3 — §6.3 |
| V9 — Datation standard | LOT-P1.3 — règles d'affichage §5 |
| V10 — Espace utilisé | LOT-P1.2 — règles espace §6 |
| V11 — Total couche | LOT-P1.2 — §6 · LOT-P1.4 — §2.2 |
| V12 — Introduction | LOT-P1.4 — §2.1 |
| V13 — Message vide global | LOT-P1.2 — §7 |
| V14 — Hiérarchie F5 | LOT-P1.4 — §1.3, §3.2 |
| V15 — Repliabilité F5 | LOT-P1.4 — §3.3 |
| V16 — Neutralité niveaux | LOT-P1.4 — §4.1 |
| V17 — Language System V1 | LOT-P1.2 — §8 |
| V18 — Lecture ≠ Action | LOT-P1.4 — §4.3, §4.4 |
| V19 — Cohérence globale | Lot identifié dans le rapport de validation |

Toute révision d'un lot précédent rouvre ce lot et son cycle de validation. Le protocole LOT-P1.5 recommence depuis le début après révision.

---

## 6 — Ce que LOT-P1.5 ne valide pas

LOT-P1.5 est une validation de conformité cadrage/terrain. Il ne valide pas :

- les performances de la couche de persistance ;
- la robustesse sous charge ou en conditions dégradées ;
- la compatibilité multi-navigateurs ou multi-appareils au-delà du contexte d'observation défini ;
- les fonctionnalités des programmes P2→P8 de la Roadmap V1 ;
- les lots suivants du Programme P1 qui n'ont pas encore été produits.

Ces éléments appartiennent à des chantiers futurs hors périmètre de LOT-P1.

---

## 7 — Verdict d'ouverture vers la clôture officielle de LOT-P1

**LOT-P1.5 peut être exécuté dès que le diagnostic mémoriel est accessible dans l'interface.**

**La clôture officielle de LOT-P1 est ouverte** si et seulement si les 19 scénarios de validation ont tous reçu le verdict PASS et que le rapport de validation terrain est produit.

**Synchronisation documentaire globale :** elle intervient uniquement à la clôture complète de LOT-P1, après PASS des 19 scénarios et production du rapport terrain. Elle ne doit pas être faite après chaque sous-lot LOT-P1.1 à LOT-P1.5, sauf demande explicite de l'opérateur.

À la clôture de LOT-P1, la synchronisation documentaire globale déclenche :

- Mise à jour de MEMORY.md — statut LOT-P1 clos.
- Mise à jour Notion — page chantier, Foundations Index, Journal de décisions.
- Ouverture formelle du lot suivant du Programme P1 selon la Roadmap V1.

La clôture de LOT-P1 marque l'achèvement du diagnostic mémoriel V1, premier lot du Programme P1. Elle ouvre la voie aux lots suivants du Programme P1 sur la trajectoire Phase A de la Roadmap V1.

---

*Validation terrain du diagnostic mémoriel V1 — LOT-P1.5 · Programme P1 · Phase A · Caméléon Engine · 2026-07-06.*
