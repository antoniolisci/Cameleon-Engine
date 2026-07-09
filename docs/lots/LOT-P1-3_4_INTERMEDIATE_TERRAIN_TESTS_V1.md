# LOT-P1-3.4 — Tests terrain intermédiaires V1
## Protocole de tests — Quatrième sous-phase de LOT-P1-3

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-3.4 |
| Titre | Tests terrain intermédiaires V1 |
| Lot parent | LOT-P1-3 — Mémoire Opérateur V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Tests |
| Statut | EN COURS |
| Prérequis satisfaits | LOT-P1-3.3 — Intégration onglet Mémoire V1 · VALIDÉ · `fe17206` |
| Date de spécification | 2026-07-09 |

---

## 1 — Mission

LOT-P1-3.4 produit le protocole de tests terrain intermédiaires de la couche de service LOT-P1-3.2. Il vérifie les critères CV1, CV2, CV3 et CV6 du cadrage LOT-P1-3 sur un corpus opérateur réel, avant la validation terrain complète de LOT-P1-3.5.

LOT-P1-3.4 cible la couche de service — les opérations O1, O2 et O3 définies dans LOT-P1-3.2 et leurs garanties OM-I1 à OM-I7. La section Mémoire Opérateur V1 intégrée dans l'onglet Mémoire (LOT-P1-3.3 · VALIDÉ · `fe17206`) constitue l'environnement d'exécution. LOT-P1-3.4 ne teste pas la présentation visuelle — ce périmètre appartient à LOT-P1-3.5.

Aucun test automatisé n'est requis en Phase A. Les vérifications s'appuient sur l'observation directe du comportement de la couche de service dans un environnement réel.

---

## 2 — Prérequis

| Document | Rôle dans LOT-P1-3.4 |
|---|---|
| LOT-P1-3.2 — Interface de lecture opérateur V1 | Définit les opérations O1–O4 et leurs garanties |
| LOT-P1-3.1 — Modèle de mémoire opérateur V1 | Définit les invariants OM-I1→OM-I7 et les types de résultat |
| LOT-P1-3 — Cadrage officiel | Définit les critères CV1–CV6 et la stratégie de tests §12 |
| LOT-P1-3.3 — Intégration onglet Mémoire V1 | Fournit l'environnement d'exécution terrain |
| LOT-P1-2 — Couche de persistance canonique V1 | Fournit le corpus de référence et les diagnostics C0, C3 |

---

## 3 — Périmètre

### 3.1 — Couverture incluse

LOT-P1-3.4 couvre exactement les critères assignés dans LOT-P1-3 §11 :

- **CV1** — Lecture par famille opérationnelle : O1 et O2 retournent les unités mémorielles conformes au corpus canonique pour les quatre familles actives Phase A.
- **CV2** — Lecture par plage de dates opérationnelle : O3 retourne les unités mémorielles comprises dans une plage de dates, à l'exclusion des unités à date formalisée.
- **CV3** — Famille sans trace : O2 retourne un compartiment présent avec séquence vide pour une famille sans traces, sans lever d'erreur.
- **CV6** — Intégrité read-only : aucune écriture n'est produite dans le corpus ni dans l'index lors d'une consultation complète.

LOT-P1-3.4 inclut également la vérification des libellés de dates formalisées (OM-I5 · RI7 de LOT-P1-3.3) dans le cadre de TC1.

### 3.2 — Hors périmètre

- **CV4** — Vue onglet Mémoire cohérente avec le corpus : appartient à LOT-P1-3.5.
- **CV5** — Coexistence avec le diagnostic LOT-P1 : appartient à LOT-P1-3.5.
- **CB1** — Conformité ACF V1 : appartient à LOT-P1-3.5.
- **CB2** — Conformité Roadmap V1 §4 : appartient à LOT-P1-3.5.
- **Test de régression complet LOT-P1-2** (diagnostics C0/C2/C3/C4 en séquence complète) : appartient à LOT-P1-3.5.

---

## 4 — Conditions de test

### 4.1 — Environnement requis

Les tests sont exécutés sur un environnement terrain réel. Les données opérateur doivent être présentes dans le corpus canonique au moment de l'exécution. Le corpus canonique ne doit pas être modifié entre le début et la fin des tests.

L'exécution des tests requiert la capacité d'invoquer directement les opérations O1 à O3 et d'observer leur résultat. Cette capacité est disponible via les outils d'inspection de l'environnement de navigation, conformément à la stratégie définie dans LOT-P1-3 §12.1.

### 4.2 — Corpus requis

| Condition | Détail |
|---|---|
| Corpus non vide | Au moins une trace présente dans au moins une des quatre familles actives (SY1 · SY3 · S1 · S2) |
| Index cohérent | Le diagnostic C3 de LOT-P1-2 retourne PASS avant le début des tests |
| Comptage de référence | Le diagnostic C0 de LOT-P1-2 a été exécuté et le nombre total de traces est noté |

---

## 5 — Pré-conditions obligatoires

Avant l'exécution de TC1–TC4, les pré-conditions suivantes doivent être satisfaites et documentées dans le compte rendu de tests.

**PC1 — Comptage initial (C0)**
Exécuter le diagnostic C0 de LOT-P1-2. Noter le nombre total de traces présentes dans le corpus. Cette valeur constitue la référence pour le test TC4 (CV6).

**PC2 — Cohérence index (C3)**
Exécuter le diagnostic C3 de LOT-P1-2. Vérifier que le résultat est PASS. Si C3 échoue, bloquer les tests et résoudre la cause avant toute exécution.

**PC3 — Disponibilité de la couche de service**
Vérifier que la couche de service LOT-P1-3.2 est accessible dans l'environnement de navigation et que les opérations O1 à O4 sont invocables.

Si l'une des pré-conditions n'est pas satisfaite, l'exécution de LOT-P1-3.4 est bloquée.

---

## 6 — Cas de test

### TC1 — CV1 : Lecture par famille

**Objectif :** Vérifier que O1 et O2 retournent les unités mémorielles conformes au corpus canonique pour les quatre familles actives, avec les garanties OM-I1, OM-I2, OM-I4 et OM-I5.

**Opérations testées :** O1 (état complet) · O2 (par famille, pour SY1 · SY3 · S1 · S2 individuellement)

**Procédure :**

1. Exercer O1. Vérifier que le résultat contient exactement quatre compartiments : SY1 · SY3 · S1 · S2 (OM-I1).
2. Pour chaque compartiment retourné par O1 : vérifier que le nombre d'unités est cohérent avec le corpus (référence : comptage PC1 par famille si disponible).
3. Vérifier que le champ id n'est exposé dans aucune unité mémorielle (OM-I4).
4. Pour chaque unité mémorielle dont le champ date est une date ISO 8601 : vérifier que la date est présente et non transformée.
5. Pour chaque unité mémorielle dont le champ date est formalisé : vérifier que le libellé affiché est conforme à LOT-P1-3.1 §6.1 — "Date non disponible" (DATE_UNAVAILABLE) ou "Date non exploitable au format canonique" (DATE_NON_EXPLOITABLE). (OM-I5 · RI7 de LOT-P1-3.3)
6. Vérifier que l'ordre des unités dans chaque compartiment est l'ordre d'écriture dans le corpus (OM-I2).
7. Exercer O2 pour chaque famille individuellement (SY1, SY3, S1, S2). Vérifier que le compartiment retourné est cohérent avec le compartiment correspondant dans le résultat de O1.

**Résultat attendu :** Quatre compartiments présents. Unités mémorielles conformes au corpus. Champ id absent. Libellés de dates formalisées corrects. Ordre d'écriture préservé. Cohérence O1/O2 confirmée.

**PASS :** Toutes les vérifications ci-dessus sont satisfaites.

**FAIL :** Compartiment manquant dans O1 · id exposé · libellé de date formalisée incorrect · ordre des unités non conforme · incohérence entre O1 et O2.

---

### TC2 — CV2 : Lecture par plage de dates

**Objectif :** Vérifier que O3 retourne uniquement les unités mémorielles dont la date est comprise dans la plage spécifiée, à l'exclusion des unités à date formalisée.

**Opération testée :** O3 (lecture par plage de dates)

**Condition préalable :** Identifier une famille active ayant des traces avec des dates ISO 8601 dans le corpus. Si aucune trace avec date ISO 8601 n'est disponible pour aucune famille active : documenter l'observation et considérer TC2 non exercé (reporté à LOT-P1-3.5).

**Procédure :**

1. Choisir une famille active avec des traces à date ISO 8601. Identifier au moins deux dates de traces distinctes dans le corpus (références issues de PC1 ou du résultat de TC1).
2. Définir une plage [début, fin] qui inclut une partie des traces connues et en exclut d'autres.
3. Exercer O3 pour la famille choisie avec la plage [début, fin].
4. Vérifier que les unités retournées ont toutes une date ISO 8601 comprise dans [début, fin].
5. Vérifier qu'aucune unité dont la date est hors de la plage [début, fin] n'est incluse dans le résultat.
6. Vérifier qu'aucune unité à date formalisée (DATE_UNAVAILABLE · DATE_NON_EXPLOITABLE) n'est incluse dans le résultat.
7. Si aucune trace ne correspond à la plage : vérifier que le résultat est une séquence vide sans erreur.

**Résultat attendu :** Les unités retournées ont toutes une date ISO 8601 dans la plage. Aucune unité hors plage. Aucune unité à date formalisée. Séquence vide sans erreur si aucune trace dans la plage.

**PASS :** Toutes les vérifications ci-dessus sont satisfaites · ou TC2 documenté comme non exercé si aucune trace à date ISO 8601 n'est disponible.

**FAIL :** Unité hors plage incluse · unité à date formalisée incluse · erreur levée au lieu d'une séquence vide.

---

### TC3 — CV3 : Famille sans trace

**Objectif :** Vérifier que O2 retourne un compartiment présent avec séquence vide pour une famille sans traces dans le corpus, sans lever d'erreur.

**Opération testée :** O2 (lecture par famille)

**Deux cas selon l'état du corpus :**

**Cas A — Au moins une famille active est sans trace dans le corpus :**

1. Identifier la famille active sans trace, à partir des résultats de TC1 ou du comptage C0.
2. Exercer O2 pour cette famille.
3. Vérifier que le compartiment est présent dans le résultat.
4. Vérifier que la séquence d'unités est vide.
5. Vérifier qu'aucune erreur n'est levée.

**Résultat attendu (Cas A) :** Compartiment présent · séquence vide · aucune erreur.

**Cas B — Toutes les familles actives ont des traces dans le corpus :**

1. Documenter que CV3 n'est pas exercé sur données réelles dans les conditions actuelles du corpus.
2. Exercer O2 avec un identifiant de famille hors registre ACF V1 Phase A (valeur autre que SY1, SY3, S1, S2) pour vérifier la décision DI2 de LOT-P1-3.2.
3. Vérifier que le compartiment retourné contient une séquence vide.
4. Vérifier qu'aucune erreur n'est levée.

**Résultat attendu (Cas B) :** Comportement DI2 confirmé · CV3 reporté à LOT-P1-3.5.

**PASS :** Comportement D3 observé (Cas A) · ou DI2 confirmé et CV3 reporté avec documentation explicite (Cas B).

**FAIL :** Erreur levée · compartiment absent · exception non gérée.

---

### TC4 — CV6 : Intégrité read-only

**Objectif :** Vérifier qu'aucune écriture dans le corpus ni dans l'index n'est produite par les opérations O1, O2 et O3.

**Opérations testées :** O1 · O2 · O3 (en séquence complète)

**Procédure :**

1. Rappeler la valeur C0 notée lors de PC1 (nombre total de traces dans le corpus avant les tests).
2. Exercer O1 (état complet).
3. Exercer O2 pour chaque famille active (SY1, SY3, S1, S2).
4. Exercer O3 pour au moins une famille et une plage de dates.
5. Après ces consultations : exécuter à nouveau le diagnostic C0 de LOT-P1-2.
6. Comparer le résultat C0 avant et après : le nombre total de traces doit être identique.
7. Exécuter le diagnostic C3 de LOT-P1-2. Vérifier que le résultat est PASS.

**Résultat attendu :** C0 identique avant et après la séquence de consultations. C3 PASS après consultations. Aucune trace ajoutée, modifiée ou supprimée.

**PASS :** C0 avant = C0 après ET C3 PASS après consultations.

**FAIL :** C0 augmente · C0 diminue · C3 passe en état incohérent après consultations.

---

## 7 — Critères de verdict de LOT-P1-3.4

LOT-P1-3.4 retourne **PASS** si et seulement si les quatre conditions suivantes sont satisfaites simultanément :

| Cas de test | Verdict requis |
|---|---|
| TC1 — CV1 | PASS |
| TC2 — CV2 | PASS · ou Non exercé documenté si aucune trace à date ISO 8601 disponible |
| TC3 — CV3 | PASS (Cas A) · ou DI2 vérifié + CV3 reporté documenté (Cas B) |
| TC4 — CV6 | PASS |

Un FAIL sur l'un des cas de test rend LOT-P1-3.4 FAIL. L'ouverture de LOT-P1-3.5 est bloquée jusqu'à résolution.

---

## 8 — Dépendances

### 8.1 — Dépendances entrantes

LOT-P1-3.5 (validation terrain complète) dépend formellement de LOT-P1-3.4. La validation complète ne peut pas démarrer avant que LOT-P1-3.4 retourne PASS.

### 8.2 — Dépendances sortantes

| Dépendance | Nature |
|---|---|
| LOT-P1-3.3 — Intégration onglet Mémoire V1 | Contraignante · fournit l'environnement d'exécution terrain |
| LOT-P1-3.2 — Interface de lecture opérateur V1 | Contraignante · définit les opérations O1–O4 et leurs garanties |
| LOT-P1-3.1 — Modèle de mémoire opérateur V1 | Contraignante · définit les invariants OM-I1→OM-I7 vérifiés |
| LOT-P1-3 — Cadrage officiel | Contraignante · définit CV1–CV6 et la stratégie de tests §12 |
| LOT-P1-2 — Couche de persistance canonique V1 | Informationnelle · fournit les diagnostics C0 et C3 de référence |

---

## 9 — Critères de validation du document LOT-P1-3.4

**V1 — Complétude des cas de test**
TC1 à TC4 couvrent exactement CV1, CV2, CV3 et CV6. Chaque cas de test définit une procédure, un résultat attendu et des critères PASS/FAIL explicites.

**V2 — Couverture du cadrage LOT-P1-3 §11**
LOT-P1-3.4 couvre exactement les critères assignés dans LOT-P1-3 §11 : CV1 · CV2 · CV3 · CV6. Aucun critère non assigné n'est introduit.

**V3 — Non-anticipation de LOT-P1-3.5**
CV4, CV5, CB1, CB2 et le test de régression complet LOT-P1-2 sont explicitement hors périmètre. Leur exclusion est documentée en §3.2.

**V4 — Cohérence avec le modèle et l'interface**
Les opérations testées (O1, O2, O3), les invariants vérifiés (OM-I1, OM-I2, OM-I4, OM-I5, OM-I7) et les comportements attendus sont référencés par leurs identifiants formels de LOT-P1-3.1 et LOT-P1-3.2. Aucun contrat de test ne contredit les garanties de LOT-P1-3.2.

**V5 — Neutralité architecturale**
Le document ne contient aucun nom de fichier, aucune propriété CSS, aucun sélecteur, aucun langage de programmation, aucun pseudo-code, aucune signature de fonction.

**V6 — Conformité doctrinale**
Language System V1 : les libellés opérateur ("Date non disponible" · "Date non exploitable au format canonique") sont conformes aux définitions de LOT-P1-3.1 §6.1. Gouvernance V1 : le niveau tests est respecté — aucune décision d'architecture non prévue.
