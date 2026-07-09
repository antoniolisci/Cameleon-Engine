# LOT-P1-3 — Mémoire Opérateur V1
## Cadrage officiel — Troisième LOT du Programme P1

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-3 |
| Titre | Mémoire Opérateur V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Couche de lecture et de valorisation |
| Statut | CLOS |
| Ancrage GPD V1 | Partie VIII §8.1 (blancs) · Partie XIII §13.5 (nœuds multiplicateurs) |
| Prérequis satisfaits | LOT-P1-2 — Couche de persistance canonique V1 · CLOS · `9b16ee8` |
| Date de cadrage | 2026-07-09 |
| Date de clôture | 2026-07-09 |

---

## 1 — Mission

LOT-P1-3 construit la couche de lecture de la mémoire canonique à destination de l'opérateur.

LOT-P1-2 a posé l'infrastructure : corpus canonique, index triple-axe, doctrine de provenance. Les données sont persistées, structurées et indexées. Elles ne sont pas encore accessibles à l'opérateur sous une forme cohérente et utile.

LOT-P1-3 comble ce manque. Il définit le modèle de mémoire opérateur — la projection sémantique des traces canoniques en compartiments mémoriels compréhensibles — et construit l'interface de lecture qui permet à l'opérateur de consulter sa mémoire par famille, par plage de dates et par session.

Ce LOT ne produit pas de nouvelles écritures dans le corpus. Il ne modifie pas la couche de persistance. Il ne produit aucune corrélation ni synthèse. Il construit la première couche de valorisation du capital mémoriel accumulé par les LOT précédents.

---

## 2 — Constat

*Ce constat est fondé exclusivement sur les observations produites par LOT-P1 et LOT-P1-2. Aucun élément n'est inventé.*

### 2.1 — Le corpus canonique est constitué mais non valorisé

LOT-P1-2 a produit un corpus opérationnel réparti sur quatre familles actives en Phase A : SY1 · SY3 · S1 · S2. Ces traces sont structurées, indexées, et lisibles via les primitives de lecture de la couche canonique. Aucune de ces primitives n'est aujourd'hui exposée à l'opérateur via une interface dédiée à la mémoire canonique. La mémoire existe, mais l'opérateur ne peut pas la consulter sous une forme structurée.

### 2.2 — Le diagnostic LOT-P1 affiche une vue non canonique

Le diagnostic mémoriel produit par LOT-P1 (CLOS · 19/19 PASS) expose 14 entrées en lecture directe depuis la couche de persistance brute. Cette vue est correcte pour son périmètre — observer l'état de la couche de persistance. Elle ne constitue pas une vue mémorielle opérateur : elle ne filtre pas par famille canonique, ne navigue pas par plage de dates, ne distingue pas traces mémorielles et états applicatifs.

### 2.3 — Absence de modèle de mémoire opérateur

Il n'existe pas de définition formelle de ce que constitue la mémoire opérateur à un instant donné. Le corpus canonique contient des traces atomiques. L'opérateur a besoin d'une projection cohérente : son historique comportemental (SY1), son historique décisionnel (SY3), son historique transactionnel (S1), son historique patrimonial (S2). Ce modèle doit être défini avant toute intégration.

---

## 3 — Périmètre inclus

### 3.1 — Objectifs principaux

**O1 — Modèle de mémoire opérateur**
Définir formellement ce que constitue la mémoire opérateur V1 : quelles familles, quels compartiments mémoriels, quelle sémantique par famille, quel comportement pour famille vide, quel traitement des dates formalisées (DATE_UNAVAILABLE · DATE_NON_EXPLOITABLE). Ce modèle est la projection sémantique du corpus canonique en représentation cohérente de l'historique de l'opérateur.

**O2 — Interface de lecture opérateur**
Construire l'interface de lecture formelle au-dessus de la couche canonique. Cette interface expose la mémoire de l'opérateur par famille, par plage de dates et par session. Elle est stateless, read-only et indépendante des moteurs applicatifs.

**O3 — Intégration onglet Mémoire**
Intégrer la vue mémoire opérateur dans l'onglet Mémoire existant, en complément du diagnostic mémoriel LOT-P1. Les deux sections coexistent. L'opérateur peut consulter sa mémoire canonique sans que le diagnostic LOT-P1 soit modifié.

**O4 — Validation terrain**
Vérifier sur environnement réel que la mémoire opérateur est lisible, cohérente avec le corpus canonique, et fonctionnelle dans l'onglet Mémoire. Confirmer l'absence de régression sur LOT-P1 et LOT-P1-2.

### 3.2 — Objectifs secondaires

**OS1 — Coexistence avec le diagnostic LOT-P1**
La vue mémoire opérateur V1 ne remplace pas le diagnostic mémoriel LOT-P1. Les deux coexistent dans l'onglet Mémoire pendant la Phase A. Le diagnostic LOT-P1 reste la référence de vérification technique ; la mémoire opérateur V1 est la vue fonctionnelle par famille.

**OS2 — Préservation des garanties LOT-P1-2**
Toute lecture produite par LOT-P1-3 s'appuie exclusivement sur les primitives canoniques de LOT-P1-2. Aucun accès direct au localStorage. Aucune écriture dans le corpus ni dans l'index.

---

## 4 — Hors périmètre

- **Aucune corrélation entre familles** — la détection de relations entre familles appartient au Programme P6.
- **Aucune synthèse ni insight** — la production d'analyses appartient au Programme P8.
- **Aucune nouvelle écriture dans le corpus** — LOT-P1-3 est une couche de lecture pure.
- **Aucune modification de la couche canonique** — ni du corpus, ni de l'index, ni du modèle de trace.
- **Aucune fonctionnalité cloud** — la synchronisation distante appartient au Compte Utilisateur V1.
- **Aucun moteur de recommandation** — LOT-P1-3 lit et présente, il ne recommande pas.
- **Aucune anticipation des programmes P2–P8** — le périmètre est strictement P1 Phase A.
- **Aucune modification du diagnostic mémoriel LOT-P1** — la vue existante (19 entrées) est préservée sans altération.

---

## 5 — Dépendances

### 5.1 — Dépendances satisfaites

| Dépendance | Statut | Référence |
|---|---|---|
| LOT-P1 — Diagnostic mémoriel V1 | CLOS · 19/19 PASS | `2223e15` |
| LOT-P1-2 — Couche de persistance canonique V1 | CLOS · PASS global C0/C2/C3/C4 | `9b16ee8` |
| ACF V1 — Architecture Conceptuelle Fondatrice V1 | ACTIVE | doctrine N1 |
| Roadmap Officielle V1 | GELÉE | `f83bb0c` |
| Grand Plan Directeur V1 | GELÉ | `d8cbf20` |

### 5.2 — Primitives consommées (LOT-P1-2)

LOT-P1-3 consomme exclusivement les primitives de lecture produites par LOT-P1-2 :
- Lecture par famille (`readByFamille`)
- Lecture par plage de dates (`readByDateRange`)
- Lecture par session (`readBySession`)

Ces primitives sont opérationnelles, validées terrain (C2/C3/C4). Aucune modification n'est requise avant l'ouverture de LOT-P1-3.

### 5.3 — Dépendances non satisfaites

Aucune. Tous les prérequis de LOT-P1-3 sont satisfaits à la date de cadrage.

---

## 6 — Architecture générale

### 6.1 — Principe fondateur

LOT-P1-3 introduit une couche sémantique entre la couche de persistance canonique (LOT-P1-2) et l'interface opérateur. Cette couche ne stocke rien — elle lit, projette et expose.

La séparation est stricte :
- **Couche canonique** (LOT-P1-2) — corpus + index + primitives de lecture atomiques
- **Couche mémoire opérateur** (LOT-P1-3) — modèle sémantique + interface de lecture + projection par famille

### 6.2 — Modèle de mémoire opérateur

L'état de mémoire opérateur est la projection cohérente du corpus canonique sur les familles actives en Phase A, à un instant donné. Il est composé de quatre compartiments mémoriels :

| Compartiment | Famille | Sémantique opérateur |
|---|---|---|
| Mémoire comportementale | SY1 | Historique des sessions et analyses comportementales de l'opérateur |
| Mémoire décisionnelle | SY3 | Historique des décisions moteur et des sauvegardes |
| Mémoire transactionnelle | S1 | Historique des importations de données |
| Mémoire patrimoniale | S2 | Historique des états de portefeuille |

Chaque compartiment expose ses traces dans l'ordre défini par la primitive sous-jacente. L'état complet est la somme des quatre compartiments.

### 6.3 — Interface de lecture opérateur

L'interface de lecture opérateur est stateless et read-only. Elle ne maintient aucun état interne entre deux appels. Elle expose au minimum :

- Un accès à l'état complet (tous les compartiments actifs)
- Un accès par compartiment (par famille)
- Un accès temporel (par plage de dates ISO 8601)
- Un accès contextuel (par session, si des sessions sont disponibles)

### 6.4 — Intégration onglet Mémoire

La vue mémoire opérateur s'intègre dans l'onglet Mémoire existant. La coexistence avec le diagnostic LOT-P1 est maintenue : les deux sections sont indépendantes visuellement et fonctionnellement. La vue mémoire opérateur reflète l'état réel du corpus canonique au moment de la consultation.

---

## 7 — Flux de données

```
Corpus canonique (LOT-P1-2)
  └── readByFamille(famille)          → traces atomiques · ordre écriture
  └── readByDateRange(start, end)     → traces atomiques · ordre chronologique
  └── readBySession(sessionId)        → traces atomiques · ordre écriture
        │
        ▼
Couche mémoire opérateur (LOT-P1-3)
  └── getOperatorMemory()             → état complet (4 compartiments actifs)
  └── getCompartiment(famille)        → compartiment mémoriel projeté
  └── getCompartimentByDate(f, s, e)  → compartiment filtré par plage de dates
        │
        ▼
Onglet Mémoire
  └── Section Mémoire Opérateur V1   → affichage structuré par compartiment
```

Le flux est strictement descendant et read-only. Aucune donnée ne remonte du niveau présentation vers la couche canonique. Aucun état n'est maintenu entre deux consultations.

---

## 8 — Décisions d'architecture à prendre

Les décisions suivantes conditionnent l'implémentation de LOT-P1-3. Elles doivent être tranchées dans la spécification LOT-P1-3.1, avant l'ouverture de LOT-P1-3.2.

**D1 — Projection : trace brute ou unité projetée**
L'interface opérateur expose-t-elle les traces canoniques telles quelles (champs id · famille · source · date · contenu · session), ou produit-elle une projection enrichie (libellé famille · date formatée · résumé contenu) ?

- Option A — Traces canoniques brutes : minimaliste, cohérent avec la couche canonique, aucune transformation
- Option B — Projection partielle : date formatée lisible pour l'opérateur, libellé famille explicite, contenu préservé

**D2 — Structure de l'état mémoire**
L'état mémoire opérateur est-il un tableau plat de toutes les traces, ou une structure par compartiment (famille → traces[]) ?

- Option A — Tableau plat : simplicité, homogénéité
- Option B — Structure par compartiment : lisibilité opérateur, cohérence avec le modèle sémantique §6.2

**D3 — Comportement pour famille vide**
Qu'expose l'interface pour une famille sans trace ?

- Option A — Compartiment absent de la réponse
- Option B — Compartiment présent avec tableau vide (explicite, cohérent avec l'index pré-peuplé de LOT-P1-2)

**D4 — Traitement des dates formalisées dans la vue opérateur**
Les traces à date DATE_UNAVAILABLE ou DATE_NON_EXPLOITABLE sont-elles affichées avec un libellé spécifique, ou exclues de la vue opérateur ?

- Option A — Affichage avec libellé explicite ("Date non disponible" · "Date non exploitable au format canonique")
- Option B — Exclusion de la vue opérateur (préservées dans le corpus, non exposées)

**D5 — Limite de volume par compartiment**
LOT-P1-3 impose-t-il une limite au nombre de traces exposées par compartiment, ou expose-t-il la totalité du corpus d'une famille ?

- Option A — Exposition totale : aucune limite, conforme à la limite Phase A de LOT-P1-2
- Option B — Limite configurable (N traces les plus récentes) : anticipation du volume futur

---

## 9 — Risques identifiés

| Réf | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Régression visuelle sur le diagnostic LOT-P1 lors de l'intégration onglet Mémoire | Modérée | Élevé | Coexistence stricte — deux sections indépendantes · aucune modification du code diagnostic LOT-P1 |
| R2 | Confusion opérateur entre diagnostic mémoriel (LOT-P1) et mémoire opérateur (LOT-P1-3) | Modérée | Modéré | Séparation visuelle explicite et libellés distincts dans l'onglet Mémoire |
| R3 | Incohérence entre corpus canonique et vue opérateur si le corpus évolue pendant la consultation | Faible | Modéré | Interface stateless — la vue reflète l'état du corpus au moment de l'appel · pas de cache |
| R4 | Présentation incohérente des traces à date formalisée | Modérée | Modéré | Décision D4 tranchée dans LOT-P1-3.1 — libellé opérateur défini dans la spécification avant toute implémentation |
| R5 | bySession retourne vide pour toutes les traces migrées — vue session sans résultat en Phase A | Certaine | Faible | Vue par session présente mais optionnelle — l'absence de résultat est un comportement attendu, non une erreur |
| R6 | Performance dégradée si le corpus atteint un volume élevé | Faible (Phase A) | Faible | Limite assumée Phase A — conforme à la limite index LOT-P1-2 (R-TECH-02) |

---

## 10 — Critères de validation terrain

### Ensemble A — Critères fonctionnels (CV1–CV6)

**CV1 — Lecture par famille opérationnelle**
`getCompartiment(SY1)` · `getCompartiment(SY3)` · `getCompartiment(S1)` · `getCompartiment(S2)` retournent des traces cohérentes avec le corpus canonique pour chaque famille active. Vérifiable en console par confrontation avec `readByFamille` directe.

**CV2 — Lecture par plage de dates opérationnelle**
`getCompartimentByDate(famille, start, end)` retourne les traces dont la date est comprise dans la plage, dans l'ordre chronologique. Les traces à date formalisée sont traitées conformément à la décision D4.

**CV3 — Famille vide sans erreur**
Une famille sans trace retourne le résultat défini par la décision D3, sans lever d'exception ni produire d'état incohérent.

**CV4 — Vue onglet Mémoire cohérente avec le corpus**
La section Mémoire Opérateur V1 dans l'onglet Mémoire affiche les mêmes traces que celles retournées par l'interface opérateur. Aucune trace manquante. Aucune trace fantôme.

**CV5 — Coexistence avec le diagnostic LOT-P1**
Le diagnostic mémoriel LOT-P1 reste fonctionnel (19 entrées · états · datation) après intégration de LOT-P1-3. Aucune régression visuelle ni fonctionnelle.

**CV6 — Read-only strict**
Aucune écriture dans le corpus ni dans l'index n'est produite par LOT-P1-3 lors d'une consultation, y compris en cas d'erreur de lecture.

### Ensemble B — Conformité doctrinale (CB1–CB2)

**CB1 — Conformité ACF V1**
Les quatre compartiments mémoriels correspondent exactement aux quatre familles actives Phase A définies par l'ACF V1. Aucune famille hors registre exposée.

**CB2 — Conformité Roadmap V1 §4**
Le LOT contribue au Programme P1 sans anticiper P2–P8. Aucun corrélateur, aucune synthèse, aucune recommandation produits.

---

## 11 — Découpage prévisionnel en micro-lots

La méthode officielle de développement V1 (iPad-first · 10 étapes) s'applique. Les décisions D1–D5 doivent être tranchées dans LOT-P1-3.1 avant toute implémentation. La validation terrain est regroupée dans LOT-P1-3.5.

| Sous-phase | Livrable principal | Type |
|---|---|---|
| LOT-P1-3.1 | Modèle de mémoire opérateur V1 — compartiments · sémantique par famille · comportement famille vide · traitement dates formalisées · décisions D1–D5 tranchées | Spécification |
| LOT-P1-3.2 | Interface de lecture opérateur — `getOperatorMemory()` · `getCompartiment()` · `getCompartimentByDate()` · contrat read-only | Spécification + implémentation |
| LOT-P1-3.3 | Intégration onglet Mémoire — section Mémoire Opérateur V1 · coexistence diagnostic LOT-P1 · affichage structuré par compartiment | Implémentation |
| LOT-P1-3.4 | Tests terrain intermédiaires — couverture CV1–CV3 et CV6 avant intégration UI | Tests |
| LOT-P1-3.5 | Validation terrain LOT-P1-3 — protocole CV1–CV6 + CB1–CB2 · vérification régression LOT-P1 et LOT-P1-2 · rapport complet | Validation |

**Contraintes d'ordre :**
- LOT-P1-3.1 est prérequis formel de LOT-P1-3.2.
- LOT-P1-3.3 ne peut pas démarrer avant la validation de LOT-P1-3.2.
- LOT-P1-3.4 peut être parallèle à LOT-P1-3.3 (couverture technique avant intégration visuelle).
- LOT-P1-3.5 est le dernier sous-lot — il referme le LOT.

---

## 12 — Stratégie de tests

### 12.1 — Principe

Les tests de LOT-P1-3 sont des tests terrain sur environnement réel (iPad Chrome ou PC Chrome, données opérateur présentes). Ils s'appuient sur la console du navigateur pour inspecter les résultats des fonctions de lecture, et sur l'onglet Mémoire pour valider la présentation.

Aucun test automatisé n'est requis en Phase A. La cohérence est vérifiée par confrontation directe du résultat de l'interface opérateur avec le corpus canonique.

### 12.2 — Séquence de validation

1. **Pré-condition** — exécuter les diagnostics C0 et C3 (hérités de LOT-P1-2) pour confirmer que le corpus est sain avant tout test LOT-P1-3.
2. **CV1** — tester `getCompartiment` pour chaque famille active (SY1 · SY3 · S1 · S2).
3. **CV2** — tester `getCompartimentByDate` sur une plage couvrant des traces connues.
4. **CV3** — tester `getCompartiment` sur une famille inactive — vérifier le comportement défini par D3.
5. **CV6** — confirmer l'absence d'écriture dans le corpus après consultation (C3 identique avant et après).
6. **CV4** — comparer l'affichage onglet Mémoire avec le résultat console.
7. **CV5** — vérifier la coexistence avec le diagnostic LOT-P1 (19 entrées toujours présentes et fonctionnelles).

### 12.3 — Test de régression LOT-P1-2

Avant la clôture de LOT-P1-3.5, reproduire les diagnostics C0/C2/C3/C4 de LOT-P1-2 pour confirmer qu'aucune régression n'a été introduite dans la couche canonique par l'implémentation de LOT-P1-3.

---

## 13 — Conditions officielles de clôture

La clôture de LOT-P1-3 est conditionnée par la satisfaction simultanée des cinq conditions suivantes.

**Condition 1 — Tous les sous-lots validés**
LOT-P1-3.1 · LOT-P1-3.2 · LOT-P1-3.3 · LOT-P1-3.4 · LOT-P1-3.5 sont tous au statut VALIDÉ. Aucun sous-lot ne peut être sauté.

**Condition 2 — PASS global validation terrain**
Les critères CV1 à CV6 et CB1 à CB2 sont tous en statut PASS dans le rapport de validation LOT-P1-3.5.

**Condition 3 — Zéro régression LOT-P1 et LOT-P1-2**
Le diagnostic mémoriel LOT-P1 reste 19/19 PASS. Les diagnostics C0/C2/C3/C4 de LOT-P1-2 restent PASS après intégration de LOT-P1-3.

**Condition 4 — Décisions D1–D5 tranchées et documentées**
Toutes les décisions d'architecture ouvertes (§8) ont été tranchées, documentées et intégrées dans la spécification LOT-P1-3.1 avant tout développement.

**Condition 5 — Décision opérateur explicite**
La clôture n'est pas automatique. L'opérateur prend la décision de clôture après constat du PASS global et de la satisfaction des quatre conditions précédentes.
