# LOT-P1-3.2 — Interface de lecture opérateur V1
## Spécification officielle — Deuxième sous-phase de LOT-P1-3

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-3.2 |
| Titre | Interface de lecture opérateur V1 |
| Lot parent | LOT-P1-3 — Mémoire Opérateur V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Spécification + Implémentation |
| Statut | VALIDÉ · `b544818` · 2026-07-09 |
| Prérequis satisfaits | LOT-P1-3.1 — Modèle de mémoire opérateur V1 · VALIDÉ · `0945e9e` |
| Date de spécification | 2026-07-09 |

---

## 1 — Mission de cette sous-phase

LOT-P1-3.2 spécifie et implémente l'interface de lecture opérateur : la couche de service entre le modèle défini en LOT-P1-3.1 et ses consommateurs.

Cette interface expose quatre opérations de lecture. Chacune construit des objets du modèle LOT-P1-3.1 à partir des primitives canoniques de LOT-P1-2. Elle est stateless et read-only. Elle ne produit aucune écriture dans le corpus ni dans l'index.

LOT-P1-3.2 est le prérequis formel de LOT-P1-3.3. L'intégration dans l'onglet Mémoire ne peut pas être réalisée sans interface validée, de la même façon que LOT-P1-3.1 était le prérequis formel de LOT-P1-3.2.

---

## 2 — Prérequis

### 2.1 — Documents de référence obligatoires

| Document | Rôle dans LOT-P1-3.2 |
|---|---|
| LOT-P1-3.1 — Modèle de mémoire opérateur V1 | Définit les types de retour et les invariants OM-I1→OM-I7 et contraintes C1→C5 |
| LOT-P1-2.3 — Indexation V1 | Définit les trois primitives de lecture consommées par l'interface |
| LOT-P1-3 — Cadrage officiel | Définit les opérations à exposer (§6.3 · §7) et les critères de validation terrain (§10) |

### 2.2 — Types hérités de LOT-P1-3.1

Les trois types suivants sont définis dans LOT-P1-3.1. Toutes les opérations de cette interface produisent des résultats conformes à ces types.

| Type | Définition (référence LOT-P1-3.1) |
|---|---|
| Unité mémorielle | Projection opérateur d'une trace canonique — sans champ id · date libellée (§3.2) |
| Compartiment mémoriel | Séquence ordonnée d'unités mémorielles pour une famille ACF V1 (§3.3) |
| État de mémoire opérateur | Agrégation des quatre compartiments actifs SY1 · SY3 · S1 · S2 (§3.4) |

### 2.3 — Invariants contraignants (LOT-P1-3.1 §9)

Les invariants OM-I1 à OM-I7 s'appliquent à toutes les opérations de l'interface.

| Invariant | Impact sur l'interface |
|---|---|
| OM-I1 | L'opération O1 retourne toujours exactement quatre compartiments (SY1 · SY3 · S1 · S2) |
| OM-I2 | L'ordre des unités mémorielles dans un compartiment n'est pas modifié par l'interface |
| OM-I3 | Aucune opération ne crée, modifie ni supprime une trace canonique |
| OM-I4 | Aucune opération n'expose le champ id d'une trace canonique |
| OM-I5 | Les unités à date formalisée portent le libellé opérateur défini en LOT-P1-3.1 §6.1 |
| OM-I6 | Aucune opération ne maintient d'état interne entre deux appels |
| OM-I7 | Aucune opération ne produit d'écriture, y compris en cas d'erreur de lecture |

### 2.4 — Contraintes contraignantes (LOT-P1-3.1 §10)

Les contraintes C1 à C5 s'appliquent à l'interface.

| Contrainte | Impact sur l'interface |
|---|---|
| C1 | L'interface n'accède jamais directement au stockage local — elle passe exclusivement par les primitives canoniques de LOT-P1-2 |
| C2 | L'interface dépend du modèle de trace canonique — toute évolution du modèle peut nécessiter une révision de cette spécification |
| C3 | L'interface n'expose jamais de compartiment associé à une famille hors registre ACF V1 dans l'état complet |
| C4 | Le contenu des unités mémorielles n'est pas transformé par l'interface |
| C5 | La valeur null du champ session est préservée dans toutes les unités mémorielles produites |

---

## 3 — Périmètre de LOT-P1-3.2

### 3.1 — Responsabilité exacte

LOT-P1-3.2 est responsable de :
- Spécifier les quatre opérations de lecture de la mémoire opérateur (O1–O4) avec leurs contrats d'entrée, de sortie et leurs garanties.
- Implémenter ces opérations conformément à la spécification.
- Produire une couche de service testable indépendamment de l'intégration visuelle.

La couche de service est le seul point d'accès à la mémoire opérateur pour tous les consommateurs. Aucun consommateur (onglet Mémoire, module futur) n'accède aux primitives canoniques directement.

### 3.2 — Hors périmètre

- **Affichage et intégration UI** — appartient à LOT-P1-3.3.
- **Tests terrain intermédiaires** — regroupés dans LOT-P1-3.4.
- **Validation terrain complète** — LOT-P1-3.5.
- **Nouvelles écritures dans le corpus** — hors périmètre de LOT-P1-3 (lecture pure).
- **Corrélations entre familles** — Programme P6.
- **Synthèses et insights** — Programme P8.

---

## 4 — Opérations de lecture (O1–O4)

L'interface expose quatre opérations. Chacune est stateless (OM-I6) et read-only (OM-I3 · OM-I7).

### 4.1 — O1 : Lecture de l'état complet

**Objet :** construire l'état de mémoire opérateur complet.

**Paramètres :** aucun.

**Résultat :** un état de mémoire opérateur composé de quatre compartiments mémoriels (SY1 · SY3 · S1 · S2). Chaque compartiment est construit par appel à la primitive de lecture par famille.

**Garanties :**
- Les quatre compartiments sont toujours présents (OM-I1 · D3 LOT-P1-3.1 §11).
- Un compartiment dont la séquence est vide a l'attribut vide = true.
- L'ordre des unités dans chaque compartiment est celui fourni par la primitive (OM-I2).
- Aucun champ id n'est exposé dans les unités (OM-I4).
- Aucune écriture n'est produite (OM-I7).

**Référence de construction :** séquence définie en LOT-P1-3.1 §4.2.

---

### 4.2 — O2 : Lecture par famille

**Objet :** construire le compartiment mémoriel d'une famille ACF V1.

**Paramètres :** un identifiant de famille.

**Résultat :** un compartiment mémoriel contenant les unités mémorielles de la famille demandée, dans l'ordre fourni par la primitive de lecture par famille (OM-I2).

**Garanties :**
- Si la famille est active et contient des traces : le compartiment est non vide.
- Si la famille est active et ne contient pas de traces : le compartiment est présent avec séquence vide (D3).
- Si l'identifiant de famille est hors registre ACF V1 : le compartiment retourné contient une séquence vide (décision DI2 — voir §7).
- Aucune écriture n'est produite (OM-I7).

---

### 4.3 — O3 : Lecture par plage de dates

**Objet :** construire le compartiment mémoriel d'une famille, filtré par plage de dates.

**Paramètres :** un identifiant de famille · une date de début (ISO 8601 UTC) · une date de fin (ISO 8601 UTC).

**Résultat :** un compartiment mémoriel contenant les unités mémorielles de la famille dont la date est comprise dans la plage [début, fin], dans l'ordre chronologique.

**Garanties :**
- Les unités à date formalisée (DATE_UNAVAILABLE · DATE_NON_EXPLOITABLE) ne participent pas au filtrage par plage de dates. Elles sont exclues du résultat, conformément à LOT-P1-2.3 §7 et MI-7.
- Si aucune unité ne correspond à la plage : le compartiment retourné contient une séquence vide.
- La valeur du champ date des unités retournées n'est pas modifiée par l'opération (C4 · D4 LOT-P1-3.1 §11).
- Aucune écriture n'est produite (OM-I7).

---

### 4.4 — O4 : Lecture par session

**Objet :** construire le compartiment mémoriel d'une famille, filtré par session.

**Paramètres :** un identifiant de famille · un identifiant de session (valeur opaque).

**Résultat :** un compartiment mémoriel contenant les unités mémorielles de la famille associées à l'identifiant de session donné, dans l'ordre d'écriture.

**Garanties :**
- Si aucune unité de la famille ne porte l'identifiant de session demandé : le compartiment retourné contient une séquence vide.
- En Phase A, toutes les traces migrées sont sans session — O4 retourne systématiquement un compartiment vide pour les données historiques. Ce comportement est attendu et non une erreur (R5 du cadrage LOT-P1-3 §9 · bySession = 0 confirmé terrain LOT-P1-2.5).
- La valeur null du champ session est préservée dans toutes les unités (C5).
- Aucune écriture n'est produite (OM-I7).

---

## 5 — Comportement en situation d'absence de données ou d'erreur de lecture

### 5.1 — Corpus vide ou famille sans trace

Si le corpus ne contient aucune trace pour la famille demandée, les opérations O1 à O4 retournent un compartiment avec séquence vide. Aucune erreur n'est levée. Ce comportement est conforme à OM-I1 (O1 : quatre compartiments toujours présents) et à D3 (compartiment présent même si vide).

### 5.2 — Erreur de lecture

Si une primitive de lecture retourne une erreur ou un résultat inattendu, l'opération retourne un compartiment avec séquence vide pour la famille concernée. Aucune écriture n'est produite (OM-I7). L'intégrité du corpus est absolue — un résultat partiel ou vide est toujours préférable à toute tentative de correction ou d'écriture.

---

## 6 — Dépendances de LOT-P1-3.2

### 6.1 — Dépendances entrantes

LOT-P1-3.3 (intégration onglet Mémoire) dépend formellement de LOT-P1-3.2. Aucune intégration UI ne peut démarrer avant la validation de cette sous-phase.

### 6.2 — Dépendances sortantes

| Dépendance | Nature |
|---|---|
| LOT-P1-3.1 — Types · invariants · contraintes | Contraignante · héritée dans toutes les opérations |
| LOT-P1-2.3 — Primitives de lecture | Contraignante · C1 interdit tout autre mode d'accès |
| LOT-P1-2.4 — Doctrine de provenance | Informationnelle · les sources des traces sont définies ici |

---

## 7 — Décisions de l'interface

### DI1 — Inclusion de la lecture par session (O4) en Phase A — TRANCHÉE

**Décision :** L'opération O4 (lecture par session) est incluse dans la spécification et l'implémentation de LOT-P1-3.2.

**Fondement :** La primitive de lecture par session est disponible et validée (LOT-P1-2.3 · LOT-P1-2.5). Le modèle LOT-P1-3.1 supporte la session via C5. Le résultat vide en Phase A est documenté comme comportement attendu (R5 du cadrage LOT-P1-3 §9). Inclure O4 complète l'interface sans complexité supplémentaire. L'exclure créerait une asymétrie entre les primitives disponibles et les opérations exposées, et forcerait une réouverture de LOT-P1-3.2 dès que des sessions seront produites.

### DI2 — Comportement sur famille hors registre ACF V1 — TRANCHÉE

**Décision :** Une opération appelée avec un identifiant de famille hors registre ACF V1 retourne un compartiment mémoriel avec séquence vide. Aucune erreur n'est levée.

**Fondement :** Ce comportement est cohérent avec le comportement des primitives sous-jacentes (lecture par famille retourne une séquence vide pour une famille inconnue — LOT-P1-2.3). La contrainte C3 est respectée : aucun compartiment hors registre n'apparaît dans l'état complet (O1 construit toujours et uniquement les quatre familles actives Phase A). La validation du registre ACF V1 appartient à la couche d'écriture canonique (LOT-P1-2) — la couche de lecture ne duplique pas ce rôle.

---

## 8 — Risques spécifiques à LOT-P1-3.2

| Réf | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| RI1 | Divergence entre les contrats spécifiés et le comportement réel des primitives LOT-P1-2 | Faible | Modéré | Tout écart constaté lors de l'implémentation = divergence documentée · soumise à validation opérateur |
| RI2 | O4 retourne systématiquement vide en Phase A, interprété comme une erreur par un futur consommateur | Certaine | Faible | Documenté en Phase A comme comportement attendu — LOT-P1-3.3 doit prévoir un libellé explicite pour ce cas |
| RI3 | Violation de C1 lors de l'implémentation (accès direct au stockage) | Faible | Élevé | C1 est une contrainte architecturale absolue — tout accès direct est une violation bloquante |

---

## 9 — Critères de validation de LOT-P1-3.2

La validation de la spécification est documentaire. La validation de l'implémentation est couverte par LOT-P1-3.4 (tests terrain intermédiaires) et LOT-P1-3.5 (validation terrain complète).

**V1 — Complétude des opérations**
Les quatre opérations O1 à O4 sont formellement définies avec leurs paramètres, leurs résultats et leurs garanties.

**V2 — Cohérence avec le modèle LOT-P1-3.1**
Chaque opération produit des résultats conformes aux types définis dans LOT-P1-3.1 (unité mémorielle · compartiment mémoriel · état de mémoire opérateur).

**V3 — Décisions DI1 et DI2 tranchées et documentées**
Les deux décisions d'interface sont résolues dans ce document, avec leur fondement explicite.

**V4 — Couverture des invariants OM-I1→OM-I7**
Les garanties de chaque opération couvrent collectivement les sept invariants. OM-I1 → O1 garantit quatre compartiments. OM-I2 → ordre préservé. OM-I3/OM-I7 → aucune écriture. OM-I4 → id absent. OM-I5 → libellés dates formalisées. OM-I6 → stateless.

**V5 — Couverture des contraintes C1→C5**
Les garanties des opérations et le §2.4 couvrent les cinq contraintes. C1 → accès via primitives uniquement. C2 → dépendance déclarée. C3 → registre fermé dans O1. C4 → contenu non transformé. C5 → null session préservé.

**V6 — Couverture des critères de validation terrain du cadrage LOT-P1-3**
- CV1 (lecture par famille) → O2
- CV2 (lecture par plage de dates) → O3
- CV3 (famille vide sans erreur) → O2 · §5.1
- CV4 (vue onglet cohérente avec corpus) → O1 utilisé par LOT-P1-3.3
- CV5 (coexistence diagnostic LOT-P1) → hors périmètre LOT-P1-3.2 · responsabilité LOT-P1-3.3 (intégration UI)
- CV6 (read-only strict) → OM-I7 garanti par toutes les opérations
- CB1 (conformité ACF V1) → C3 dans §2.4 · O1 construit uniquement SY1·SY3·S1·S2
- CB2 (conformité Roadmap V1 §4) → §3.2 hors périmètre (aucune corrélation · aucune synthèse)

**V7 — Neutralité architecturale**
Le document ne contient aucun nom de fichier, aucune structure de données interne, aucun langage de programmation, aucun pseudo-code.
