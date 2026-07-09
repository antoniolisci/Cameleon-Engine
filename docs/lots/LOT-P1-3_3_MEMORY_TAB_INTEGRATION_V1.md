# LOT-P1-3.3 — Intégration onglet Mémoire V1
## Spécification officielle — Troisième sous-phase de LOT-P1-3

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-3.3 |
| Titre | Intégration onglet Mémoire V1 |
| Lot parent | LOT-P1-3 — Mémoire Opérateur V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Spécification + Implémentation |
| Statut | EN COURS |
| Prérequis satisfaits | LOT-P1-3.2 — Interface de lecture opérateur V1 · VALIDÉ · `b544818` |
| Date de spécification | 2026-07-09 |

---

## 1 — Mission de cette sous-phase

LOT-P1-3.3 intègre la vue mémoire opérateur dans l'onglet Mémoire existant de Caméléon Engine.

LOT-P1-3.2 a produit l'interface de lecture opérateur — quatre opérations formellement spécifiées, stateless et read-only. Ces opérations sont prêtes à être consommées par un premier consommateur. LOT-P1-3.3 est ce premier consommateur : il construit la section visuelle "Mémoire Opérateur V1" qui affiche les quatre compartiments mémoriels à l'opérateur dans l'onglet Mémoire.

La section coexiste avec le diagnostic mémoriel existant (LOT-P1). Les deux sections sont indépendantes visuellement et fonctionnellement. Aucune section existante de l'onglet Mémoire n'est modifiée.

LOT-P1-3.3 est le prérequis de LOT-P1-3.4 (tests terrain intermédiaires) et de LOT-P1-3.5 (validation terrain complète). Aucun test ni validation terrain ne fait partie de cette sous-phase.

---

## 2 — Prérequis

### 2.1 — Documents de référence obligatoires

| Document | Rôle dans LOT-P1-3.3 |
|---|---|
| LOT-P1-3.2 — Interface de lecture opérateur V1 | Fournit les quatre opérations O1–O4 consommées par cette section |
| LOT-P1-3.1 — Modèle de mémoire opérateur V1 | Définit les objets affichés (unité mémorielle · compartiment · état) et les invariants |
| LOT-P1-3 — Cadrage officiel | Définit l'objectif O3 (intégration onglet Mémoire), la coexistence OS1, les risques R1–R2 et les critères CV4–CV5 |
| Language System V1 | Définit les règles de libellé pour tous les textes visibles opérateur |

### 2.2 — Interface consommée (LOT-P1-3.2)

La section Mémoire Opérateur V1 consomme l'opération O1 comme source principale de données d'affichage.

| Opération | Usage dans LOT-P1-3.3 |
|---|---|
| O1 — Lecture de l'état complet | Source principale — construit l'état de mémoire opérateur affiché dans la section |
| O2 — Lecture par famille | Disponible — non exposée comme contrôle UI dans le périmètre de cette sous-phase |
| O3 — Lecture par plage de dates | Disponible — non exposée comme contrôle UI dans le périmètre de cette sous-phase |
| O4 — Lecture par session | Disponible — non exposée comme contrôle UI dans le périmètre de cette sous-phase |

Les opérations O2, O3 et O4 sont disponibles dans la couche de service (LOT-P1-3.2). Leur exposition sous forme de contrôle UI n'appartient pas au périmètre de LOT-P1-3.3. La section s'appuie sur l'état complet (O1) comme vue de référence Phase A.

### 2.3 — Invariants contraignants (LOT-P1-3.1)

Les invariants OM-I1 à OM-I7 s'appliquent à la présentation. La couche visuelle ne peut pas les contredire.

| Invariant | Impact sur la section UI |
|---|---|
| OM-I1 | Les quatre compartiments sont toujours affichés — aucun ne peut être absent de la section |
| OM-I2 | L'ordre des unités dans un compartiment est celui reçu de l'interface — non réordonné par la section |
| OM-I3 | Aucune interaction utilisateur ne déclenche d'écriture dans le corpus |
| OM-I4 | Le champ id n'est jamais affiché dans la section |
| OM-I5 | Les unités à date formalisée affichent le libellé opérateur défini en LOT-P1-3.1 §6.1 |
| OM-I6 | Chaque consultation reconstruit l'état depuis le corpus — aucun cache affiché |
| OM-I7 | Aucune interaction utilisateur dans cette section ne produit d'écriture |

---

## 3 — Périmètre de LOT-P1-3.3

### 3.1 — Responsabilité exacte

LOT-P1-3.3 est responsable de :

- Spécifier la structure visuelle de la section Mémoire Opérateur V1 dans l'onglet Mémoire.
- Implémenter cette section en consommant l'opération O1 de l'interface LOT-P1-3.2.
- Afficher les quatre compartiments mémoriels (SY1 · SY3 · S1 · S2) avec leurs unités mémorielles.
- Respecter les décisions d'affichage DI3, DI4 et DI5 définies dans cette spécification.
- Garantir la coexistence sans régression avec le diagnostic mémoriel LOT-P1 et la section Gestion des données.

### 3.2 — Hors périmètre

- **Tests terrain intermédiaires** — appartient à LOT-P1-3.4.
- **Validation terrain complète** — appartient à LOT-P1-3.5.
- **Contrôles UI de filtrage par date (O3) ou par session (O4)** — non exposés en Phase A.
- **Modification du diagnostic mémoriel LOT-P1** — strictement interdit (R1 cadrage §9).
- **Modification de la section Gestion des données** — hors périmètre.
- **Nouvelles écritures dans le corpus** — lecture pure (OM-I7).
- **Corrélations entre compartiments** — Programme P6.
- **Synthèses et insights** — Programme P8.

---

## 4 — Structure de la section Mémoire Opérateur V1

### 4.1 — Position dans l'onglet Mémoire (décision DI3 — voir §7)

La section Mémoire Opérateur V1 est insérée dans l'onglet Mémoire selon la décision DI3. Sa position est fixe et ne dépend d'aucun état de l'application. Elle est toujours présente dès que l'onglet Mémoire est affiché.

### 4.2 — Délimitation visuelle

La section Mémoire Opérateur V1 est visuellement délimitée et clairement distincte du diagnostic mémoriel LOT-P1 et de la section Gestion des données. Le titre de la section est visible et explicite. Aucune ambiguïté entre les sections n'est tolérée (R2 cadrage §9).

### 4.3 — Contenu de la section

La section contient :

1. Un titre de section identifiant explicitement la vue mémoire opérateur.
2. Les quatre compartiments mémoriels affichés conformément à la décision DI5.
3. Pour chaque compartiment : son nom sémantique opérateur (famille et libellé), ses unités mémorielles, et une indication visuelle si le compartiment est vide (décision DI4).

---

## 5 — Affichage des compartiments et des unités mémorielles

### 5.1 — Identification du compartiment

Chaque compartiment est identifié par son nom sémantique opérateur, conforme aux libellés de LOT-P1-3 §6.2 :

| Famille | Libellé opérateur |
|---|---|
| SY1 | Mémoire comportementale |
| SY3 | Mémoire décisionnelle |
| S1 | Mémoire transactionnelle |
| S2 | Mémoire patrimoniale |

Ces libellés sont les seuls noms autorisés pour désigner les compartiments dans la section. Aucun identifiant technique (SY1, SY3, S1, S2) n'est exposé à l'opérateur.

### 5.2 — Affichage des unités mémorielles

Chaque unité mémorielle affiche les champs définis dans LOT-P1-3.1 §3.2, à l'exclusion du champ id :

| Champ | Affichage |
|---|---|
| famille | Non répété dans chaque unité — porté par le titre du compartiment |
| source | Affiché tel quel — valeur fournie par l'interface |
| date | Voir §5.3 — traitement selon la valeur |
| contenu | Affiché tel quel — aucune transformation, aucun résumé (C4) |
| session | Non affiché dans la vue O1 Phase A (valeur null pour l'ensemble du corpus migré) |

Le champ session est fonctionnellement disponible dans le modèle mais sa valeur est null pour la totalité du corpus Phase A (bySession = 0 confirmé terrain LOT-P1-2.5). Il n'est pas affiché dans la vue principale.

### 5.3 — Affichage des dates formalisées (décision D4 — LOT-P1-3.1)

La représentation du champ date suit les règles définies en LOT-P1-3.1 §6.1 :

| Valeur reçue de l'interface | Texte affiché à l'opérateur |
|---|---|
| Date ISO 8601 UTC | Représentation lisible de la date — mise en forme à la discrétion de l'implémentation |
| DATE_UNAVAILABLE ("Date non disponible") | "Date non disponible" |
| DATE_NON_EXPLOITABLE ("Date non exploitable au format canonique") | "Date non exploitable au format canonique" |

Les unités à date formalisée sont affichées, non masquées (invariant OM-I5 · décision D4 Option A). Elles sont visuellement distinguées des unités à date ISO 8601.

---

## 6 — Comportements d'affichage spéciaux

### 6.1 — Compartiment vide

Lorsqu'un compartiment ne contient aucune unité mémorielle, il est affiché conformément à la décision DI4. Son titre reste visible. L'absence de traces est indiquée explicitement à l'opérateur. Aucun message d'erreur n'est affiché — l'absence de traces est un état normal (D3 · OM-I1).

### 6.2 — État complet vide

Si O1 retourne un état de mémoire opérateur dont les quatre compartiments sont tous vides, la section Mémoire Opérateur V1 affiche les quatre compartiments avec mention d'absence de traces. Aucune erreur n'est signalée. Ce comportement est conforme à §5.1 de LOT-P1-3.2.

### 6.3 — Vue par session (O4) — non exposée en Phase A

L'opération O4 est disponible dans la couche de service (LOT-P1-3.2) mais son exposition sous forme de contrôle UI est hors périmètre de LOT-P1-3.3. En Phase A, toutes les traces migrées sont sans session — O4 retourne systématiquement un compartiment vide (DI1 · RI2 de LOT-P1-3.2). La non-exposition de O4 dans cette sous-phase élimine le risque de confusion opérateur identifié dans RI2 : aucun résultat vide ne peut être présenté à l'opérateur comme une erreur puisque la vue par session n'existe pas encore dans l'interface.

### 6.4 — Rafraîchissement de la section

La section Mémoire Opérateur V1 est construite à l'activation de l'onglet Mémoire. Elle reflète l'état du corpus au moment de la consultation (OM-I6 — non-persistance). Aucun mécanisme de rafraîchissement automatique n'est requis en Phase A.

---

## 7 — Décisions de l'intégration

### DI3 — Position de la section dans l'onglet Mémoire — TRANCHÉE

**Décision :** La section Mémoire Opérateur V1 est insérée dans l'onglet Mémoire après le diagnostic mémoriel LOT-P1 (Option B).

**Fondement :** Le diagnostic mémoriel LOT-P1 est une section établie et stable (19/19 PASS · gel actif). L'insertion de contenu en aval d'une section existante minimise le risque de régression visuelle (R1 cadrage §9). La disposition verticale permet la coexistence sans déplacement ni modification des éléments existants. Une révision de l'ordre des sections pourra être proposée après validation terrain si la priorité de la vue fonctionnelle l'exige.

---

### DI4 — Affichage des compartiments vides — TRANCHÉE

**Décision :** Un compartiment vide est affiché avec son titre et une mention explicite d'absence de traces (Option A).

**Fondement :** La décision D3 de LOT-P1-3.1 garantit que les quatre compartiments sont des constantes du modèle. La vue UI doit refléter ce modèle fidèlement : un compartiment visible et vide signale à l'opérateur que la consultation a eu lieu et que ce type de mémoire ne contient pas encore de traces. Un compartiment absent crée l'ambiguïté entre "famille vide" et "famille non supportée". L'invariant OM-I1 est ainsi respecté jusqu'à la couche de présentation.

---

### DI5 — Mode d'affichage des compartiments — TRANCHÉE

**Décision :** Chaque compartiment est affiché dans un bloc repliable indépendant (Option C — accordéon).

**Fondement :** L'onglet Mémoire est consulté depuis des appareils à écran limité (iPad-first). Un empilement plat de quatre compartiments potentiellement longs surchargerait la vue. Le mode accordéon permet à l'opérateur de consulter un compartiment à la fois tout en gardant la structure des quatre familles visible. Ce mode est cohérent avec le comportement déjà établi dans l'onglet Mémoire (section F5 repliable, LOT-P1). Chaque compartiment est repliable indépendamment. L'état de repli n'est pas persisté — il est réinitialisé à chaque ouverture de l'onglet.

---

## 8 — Risques spécifiques à LOT-P1-3.3

| Réf | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| RI4 | Régression visuelle ou fonctionnelle sur le diagnostic mémoriel LOT-P1 lors de l'insertion de la section | Modérée | Élevé | Insertion en aval uniquement · aucune modification du code du diagnostic · vérification CV5 lors de LOT-P1-3.4 et LOT-P1-3.5 |
| RI5 | Confusion opérateur entre les deux sections de l'onglet Mémoire (R2 cadrage §9) | Modérée | Modéré | Titre de section explicite · délimitation visuelle franche · libellés distincts conformes au Language System V1 |
| RI6 | Inconsistance entre le contenu affiché et le corpus canonique (corpus modifié entre deux affichages) | Faible | Modéré | Construction à l'activation de l'onglet — l'état reflète le corpus au moment de la consultation (OM-I6) |
| RI7 | Affichage incorrect des libellés de dates formalisées (DATE_UNAVAILABLE · DATE_NON_EXPLOITABLE) | Modérée | Modéré | Libellés définis dans cette spécification (§5.3) · vérification dans LOT-P1-3.4 sur les traces R1/R3/R4 |

---

## 9 — Dépendances de LOT-P1-3.3

### 9.1 — Dépendances entrantes

LOT-P1-3.4 (tests terrain intermédiaires) dépend formellement de LOT-P1-3.3 pour la vérification de CV4. LOT-P1-3.5 (validation terrain complète) dépend de LOT-P1-3.3 pour les critères CV4 et CV5.

### 9.2 — Dépendances sortantes

| Dépendance | Nature |
|---|---|
| LOT-P1-3.2 — Interface de lecture opérateur V1 | Contraignante · O1 est la source de données principale de la section |
| LOT-P1-3.1 — Modèle · invariants · contraintes | Contraignante · OM-I1→OM-I7 et C1→C5 s'appliquent à la couche de présentation |
| LOT-P1-3 — Cadrage officiel | Contraignante · CV4 · CV5 · CB1 · CB2 doivent être couverts |
| Language System V1 | Contraignante · tous les textes visibles opérateur |

---

## 10 — Critères de validation de LOT-P1-3.3

La validation documentaire de la spécification est immédiate. La validation de l'implémentation est couverte par LOT-P1-3.4 (tests intermédiaires) et LOT-P1-3.5 (validation terrain complète). Les critères suivants portent sur la complétude et la cohérence de cette spécification.

**V1 — Complétude de la structure**
La section Mémoire Opérateur V1 est entièrement spécifiée : position · titre · quatre compartiments · unités mémorielles · comportements spéciaux. Aucun élément visible n'est laissé sans spécification.

**V2 — Cohérence avec le modèle LOT-P1-3.1**
Chaque élément affiché correspond à un champ ou un attribut défini dans LOT-P1-3.1. Aucun champ non défini dans le modèle n'est affiché. Le champ id n'est jamais exposé (OM-I4).

**V3 — Décisions DI3, DI4 et DI5 tranchées et documentées**
Les trois décisions d'intégration sont résolues dans cette spécification, avec leur fondement explicite.

**V4 — Couverture des critères de validation terrain du cadrage LOT-P1-3**
- CV4 (vue onglet Mémoire cohérente avec le corpus) → §5 et §6 de cette spécification garantissent la fidélité d'affichage · vérifiable dans LOT-P1-3.4 et LOT-P1-3.5
- CV5 (coexistence avec le diagnostic LOT-P1) → §3.1 garantit l'absence de modification · vérifiable dans LOT-P1-3.4 et LOT-P1-3.5
- CB1 (conformité ACF V1) → §5.1 — seules les quatre familles actives Phase A sont affichées avec leur libellé opérateur
- CB2 (conformité Roadmap V1 §4) → §3.2 — aucune corrélation, aucune synthèse, aucune recommandation dans cette section

**V5 — Couverture des invariants OM-I1→OM-I7**
OM-I1 → §2.3 et DI4 (quatre compartiments toujours affichés) · OM-I2 → §5.2 (ordre non modifié) · OM-I3 et OM-I7 → §3.1 et §6 (aucune écriture) · OM-I4 → §5.2 (id absent) · OM-I5 → §5.3 (libellés dates formalisées) · OM-I6 → §6.4 (construction à l'activation · aucun cache).

**V6 — Neutralité architecturale**
Le document ne contient aucun nom de fichier, aucune balise HTML, aucune propriété CSS, aucun sélecteur, aucun langage de programmation, aucun pseudo-code.

**V7 — Conformité doctrinale**
- Language System V1 : les libellés des compartiments (§5.1) et des dates formalisées (§5.3) respectent le système de langage opérateur.
- Gouvernance V1 : le niveau spécification est respecté — aucune anticipation de l'implémentation au-delà du nécessaire.
- Roadmap V1 §4 et Programmes P6/P8 : la section ne produit aucune corrélation, aucune synthèse, aucune recommandation.
- ACF V1 : les quatre familles actives Phase A et leurs libellés sont conformes au registre ACF V1.
