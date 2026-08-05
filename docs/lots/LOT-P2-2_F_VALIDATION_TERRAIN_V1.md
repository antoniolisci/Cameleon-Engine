# LOT-P2-2.F — Validation terrain V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-2.F |
| Intitulé | Validation terrain V1 |
| Micro-lot parent | LOT-P2-2 — Parser S1 · Fichiers transactionnels V1 |
| Programme | P2 — Ingestion des données |
| Phase Roadmap V1 | A |
| Type | Validation |
| Document officiel | `docs/lots/LOT-P2-2_F_VALIDATION_TERRAIN_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-08-05 |
| Prérequis satisfaits | LOT-P2-2.E — Implémentation technique V1 · VALIDÉ · `ec543b4` |

---

## §1 Mission

LOT-P2-2.F est la phase terminale de LOT-P2-2 — Parser S1. Sa mission : valider l'intégralité du parser S1 sur des fichiers réels Binance (CSV + PDF, TRADE_HISTORY + ORDER_HISTORY), vérifier que les traces S1 sont correctement écrites dans le corpus canonique, et confirmer l'absence de régression sur la couche de persistance canonique (LOT-P1-2) et sur le module comportemental.

Ce micro-lot produit le rapport de validation qui permet à l'opérateur de prononcer la clôture officielle de LOT-P2-2, sous réserve des Conditions 1 à 6 du cadrage LOT-P2-2 §8.

Ce micro-lot ne modifie aucun contrat existant. Si une anomalie est découverte pendant la validation, elle est documentée dans le rapport §8 et corrigée avant que le verdict PASS puisse être prononcé.

**Note PDF :** Les critères CV-3 et CV-4 (validation terrain sur fichiers PDF) nécessitent le pipeline complet d'extraction PDF dans l'adaptateur Binance S1. Si ce pipeline n'est pas opérationnel au moment de l'exécution, TC3 et TC4 sont bloqués (PC-1). Leur déblocage requiert l'implémentation préalable du pipeline d'extraction PDF, qui peut être réalisée dans le cadre de ce micro-lot avant l'exécution des cas de test correspondants.

---

## §2 Prérequis

### §2.1 Micro-lots et commits de référence

| Document | Rôle dans LOT-P2-2.F |
|---|---|
| LOT-P2-2 — Parser S1 V1 (`LOT-P2-2_PARSER_S1_V1.md`) | Source des critères CV-1→CV-8 · CB-1→CB-3 · conditions de clôture §8 |
| LOT-P2-2.A — Modèle de trace S1 · VALIDÉ · `f75eeda` | Définit la structure des 6 dimensions · valeurs attendues par format |
| LOT-P2-2.B — Classification et extraction · VALIDÉ · `bc1a835` | Définit EP-RC2 · RF-R6 · conditions de qualification · tables d'alias Binance |
| LOT-P2-2.C — Persistance · VALIDÉ · `cfbd93a` | Définit le contrat de persistance · rapport de session · registre |
| LOT-P2-2.D — Interface de déclenchement · VALIDÉ · `69b4ecd` | Définit le pipeline 11 étapes · les cinq situations de rapport |
| LOT-P2-2.E — Implémentation technique V1 · VALIDÉ · `ec543b4` | Tous les composants opérationnels · PR-1→PR-7 satisfaits |

### §2.2 Prérequis techniques satisfaits (PR-1→PR-7)

| Prérequis | État |
|---|---|
| PR-1 — writeIngestedTrace opérationnelle | Satisfait |
| PR-2 — Registre CE_ingestion_registry_v1 opérationnel | Satisfait |
| PR-3 — Adaptateur Binance S1 complet · 6 capacités · EP-RC2 · Test 3b | Satisfait |
| PR-4 — Core ingest(descriptor) · séquence 11 étapes · rapport conforme | Satisfait |
| PR-5 — Interface opérateur accessible dans l'onglet Mémoire | Satisfait |
| PR-6 — Zéro régression LOT-P1-2 (vérification initiale) | Satisfait |
| PR-7 — Zéro régression module comportemental (vérification initiale) | Satisfait |

### §2.3 Fichiers de test requis

| Fichier | Rôle |
|---|---|
| CSV TRADE_HISTORY Binance réel | TC1 · CV-1 · CV-5 · CV-7 |
| CSV ORDER_HISTORY Binance réel (contenant des lignes FILLED et des lignes non FILLED) | TC2 · CV-2 |
| PDF TRADE_HISTORY Binance réel | TC3 · CV-3 |
| PDF ORDER_HISTORY Binance réel | TC4 · CV-4 |
| Fichier de format non reconnu par l'adaptateur (ex. JSON, CSV générique sans signaux Binance) | TC6 · CV-6 |

---

## §3 Périmètre

### §3.1 Couverture incluse

| Périmètre | Source |
|---|---|
| CV-1 à CV-8 — Critères fonctionnels | LOT-P2-2 §7.1 |
| CB-1 à CB-3 — Critères de robustesse | LOT-P2-2 §7.2 |
| Régression LOT-P1-2 — diagnostics C0 · C2 · C3 · C4 | LOT-P1-2 (Condition 3 · LOT-P2-2 §8) |
| Régression module comportemental | CB-2 · LOT-P2-2 §7.2 |

### §3.2 Hors périmètre

- Analyse comportementale — Programme P3.
- Corrélations inter-familles — Programme P6.
- Synthèses et insights — Programme P8.
- Formats Binance non validés en Phase A (dépôts, retraits, transferts, snapshots patrimoniaux).
- Modification de code source, sauf correction d'anomalie documentée dans le rapport §8.
- Validation de formats tiers non Binance.

---

## §4 Pré-conditions

Avant le début de l'exécution, les pré-conditions suivantes doivent être vérifiées et documentées dans le rapport §8.1. La hiérarchie des blocages ci-dessous précise la portée de chaque pré-condition non satisfaite.

**PC-1 — Pipeline PDF opérationnel**
Le pipeline complet d'extraction PDF est implémenté et opérationnel dans l'adaptateur Binance S1.

**PC-2 — Fichiers de test disponibles**
Les cinq fichiers listés en §2.3 sont disponibles avant l'exécution. Leur provenance est documentée (date d'export Binance · format vérifié).

**PC-3 — État initial du registre d'ingestion**
L'état initial du registre CE_ingestion_registry_v1 est noté (nombre d'entrées existantes). Si des empreintes des fichiers de test sont déjà présentes dans le registre (import antérieur), le registre doit être purgé ou les fichiers remplacés par des versions non encore ingérées avant les tests.

**PC-4 — Comptage initial du corpus (C0)**
Exécuter le diagnostic C0 de LOT-P1-2. Documenter le nombre de traces présentes dans le corpus par famille (S1 · SY1 · SY3 · S2) avant tout import. Ces valeurs servent de référence pour RC1.

**PC-5 — Cohérence initiale de l'index (C4)**
Exécuter le diagnostic C4 de LOT-P1-2. Vérifier l'absence d'identifiant orphelin dans l'index avant les tests.

**Hiérarchie des blocages**

| Pré-condition | Portée du blocage |
|---|---|
| PC-5 — Cohérence initiale index (C4) | Bloque immédiatement l'intégralité de LOT-P2-2.F — aucun cas de test ne peut être exécuté tant que PC-5 n'est pas satisfaite |
| PC-1 — Pipeline PDF opérationnel | Bloque TC3 et TC4 uniquement — TC1, TC2, TC5, TC6, TC7, TC8, RC1, RC2 et RC3 peuvent être exécutés normalement |
| PC-2 — Fichiers de test disponibles | Bloque les cas de test dépendant des fichiers non disponibles — les autres cas peuvent être exécutés normalement |
| PC-3 — État initial du registre | Bloque TC8 si les empreintes des fichiers de test sont déjà enregistrées dans le registre — les autres cas ne sont pas affectés |
| PC-4 — C0 initial documenté | Bloque RC1 uniquement (vérification du delta corpus) — les cas de test TC1→TC8 et RC2→RC3 peuvent être exécutés sans cette valeur de référence |

---

## §5 Cas de test

### TC1 — CV-1 : Import CSV TRADE_HISTORY

**Objectif :** Vérifier que chaque ligne d'un fichier CSV TRADE_HISTORY réel Binance produit une trace S1 valide dans le corpus canonique.

**Procédure :**

1. Sélectionner le fichier CSV TRADE_HISTORY via la zone d'import dans l'onglet Mémoire.
2. Déclencher l'import. Attendre l'affichage du rapport.
3. Vérifier que le rapport indique `result = "succès"`.
4. Vérifier que `totalLines` correspond au nombre de lignes de données du fichier (hors en-tête).
5. Vérifier que `qualified = totalLines` — toutes les lignes d'un TRADE_HISTORY sont présupposées exécutées (P2-2.B §6.3).
6. Vérifier que `excluded = 0` et `rejected = 0`.
7. Vérifier que `written = qualified`.
8. Inspecter le corpus canonique : vérifier que `written` nouvelles traces de famille S1 sont présentes.
9. Vérifier que chaque trace S1 porte les 6 champs : `famille = "S1"` · `source` = nom du fichier · `date` (état EP-RC2) · `valeur` (per P2-2.A §3.5) · `session` · `contexte`.
10. Vérifier que `index.bySession[sessionId]` contient exactement `written` identifiants.

**PASS :** result = "succès" · qualified = totalLines · written = qualified · traces S1 présentes dans le corpus · champs conformes au modèle P2-2.A · index cohérent.

**FAIL :** result ≠ "succès" · qualified < totalLines sans raison contractuelle · traces manquantes ou malformées · index incohérent.

---

### TC2 — CV-2 : Import CSV ORDER_HISTORY

**Objectif :** Vérifier que seules les lignes FILLED d'un fichier CSV ORDER_HISTORY réel Binance produisent une trace S1. Les lignes NEW et CANCELED sont exclues sans écriture.

**Procédure :**

1. Identifier préalablement le nombre de lignes FILLED et le nombre de lignes non FILLED (NEW + CANCELED) dans le fichier.
2. Sélectionner le fichier CSV ORDER_HISTORY. Déclencher l'import.
3. Vérifier que `qualified` = nombre de lignes FILLED identifiées.
4. Vérifier que `excluded` = nombre de lignes non FILLED (NEW + CANCELED).
5. Vérifier que `totalLines = qualified + excluded + rejected`.
6. Vérifier que `rejected = 0` — sur un fichier ORDER_HISTORY valide, aucun rejet n'est attendu.
7. Vérifier que `written = qualified`.
8. Inspecter le corpus : vérifier que `written` traces S1 sont présentes avec un champ valeur conforme au modèle ORDER_HISTORY FILLED (P2-2.A §3.5).

**PASS :** qualified = lignes FILLED · excluded = lignes NEW + CANCELED · rejected = 0 · written = qualified · traces ORDER_HISTORY FILLED conformes.

**FAIL :** lignes FILLED non qualifiées · lignes NEW ou CANCELED produisant une trace · rejected > 0 sur un fichier valide · champ valeur non conforme au modèle ORDER_HISTORY.

---

### TC3 — CV-3 : Import PDF TRADE_HISTORY

**Objectif :** Vérifier que le pipeline complet (extraction PDF → adaptateur → Core) produit des traces S1 correctes à partir d'un fichier PDF TRADE_HISTORY Binance réel.

**Prérequis :** PC-1 satisfaite.

**Procédure :**

1. Sélectionner le fichier PDF TRADE_HISTORY. Déclencher l'import.
2. Vérifier que le rapport indique `result ∈ {"succès", "succès partiel"}` — jamais "source non reconnue".
3. Vérifier que `qualified > 0`.
4. Vérifier que `written = qualified`.
5. Inspecter le corpus : vérifier que les traces portent `contexte.sourceType = "TRADE_HISTORY PDF"`.
6. Vérifier que les champs valeur sont conformes au modèle TRADE_HISTORY (P2-2.A §3.5).
7. Si un fichier CSV TRADE_HISTORY de contenu équivalent est disponible : comparer `qualified` PDF avec `qualified` CSV — les deux doivent être égaux pour un contenu identique.

**PASS :** result ∈ {"succès", "succès partiel"} · qualified > 0 · written = qualified · sourceType correct · cohérence CSV/PDF si applicable.

**FAIL :** result = "source non reconnue" · qualified = 0 sur un fichier valide · sourceType incorrect · écart inexpliqué entre qualified CSV et qualified PDF.

---

### TC4 — CV-4 : Import PDF ORDER_HISTORY

**Objectif :** Vérifier que le pipeline complet produit uniquement des traces S1 pour les lignes FILLED d'un fichier PDF ORDER_HISTORY Binance réel.

**Prérequis :** PC-1 satisfaite.

**Procédure :**

1. Sélectionner le fichier PDF ORDER_HISTORY. Déclencher l'import.
2. Vérifier que le rapport indique `result ∈ {"succès", "succès partiel"}`.
3. Si le fichier contient des lignes non FILLED : vérifier que `excluded > 0`.
4. Vérifier que `written = qualified`.
5. Inspecter le corpus : vérifier que les traces portent `contexte.sourceType = "ORDER_HISTORY PDF"`.
6. Vérifier que les champs valeur sont conformes au modèle ORDER_HISTORY FILLED (P2-2.A §3.5).

**PASS :** result ∈ {"succès", "succès partiel"} · lignes non FILLED exclues · written = qualified · sourceType correct · champs valeur conformes.

**FAIL :** result = "source non reconnue" · lignes non FILLED produisant une trace · sourceType incorrect · champs valeur non conformes.

---

### TC5 — CV-5 : Extraction de date EP-RC2

**Objectif :** Vérifier que les quatre états de date EP-RC2 (Standard · R4 · R1 · R3) sont correctement produits selon les données source.

**Note contractuelle :** L'état R3 ("Non disponible" par format non conforme) est indistinguable de R1 ("Non disponible" par absence) depuis la valeur de date seule — les deux produisent la sentinelle "Non disponible". Les deux sont comptés sous R1 dans le rapport (LOT-P2-2.E §8.3). Ce comportement est contractuel et ne constitue pas un défaut.

**Procédure :**

1. Vérifier dans le rapport de TC1 que `dateStates.standard > 0` pour le fichier CSV TRADE_HISTORY.
2. Si les fichiers de test contiennent des dates au format Test 3b (P2-2.B §6.6) : inspecter les traces correspondantes dans le corpus et vérifier que la date est convertie en ISO 8601 UTC (décalage +02:00 → UTC appliqué). Deux variantes à couvrir : longueur 17 caractères (YY-MM-DD HH:MM:SS — exports PDF anciens) · longueur 19 caractères (YYYY-MM-DD HH:MM:SS — exports PDF Binance 2026, décalage +02:00 identique).
3. Pour vérifier l'état R1 : utiliser un fichier ou une ligne dont la colonne date est vide ou contient "--". Vérifier que la trace produite porte `date = "Non disponible"` et que `dateStates.R1` est incrémenté.
4. Pour vérifier l'état R4 : utiliser une ligne dont la valeur date est un timestamp epoch hors plage 2000–2100 ou un timestamp epoch en secondes (10 chiffres). Vérifier que la trace produite porte `date = "Non exploitable au format canonique"` et que `dateStates.R4` est incrémenté.

**PASS :** dateStates.standard > 0 sur un fichier avec dates valides · conversion Test 3b correcte si applicable · état R1 produit sur date absente · état R4 produit sur timestamp non canonique.

**FAIL :** dateStates.standard = 0 sur un fichier avec dates valides · conversion Test 3b incorrecte · état R1 ou R4 absent dans les cas attendus.

---

### TC6 — CV-6 : Rejet RF-R6

**Objectif :** Vérifier que tout fichier de format non reconnu produit un retour explicite "source non reconnue" sans écriture de trace et sans exception non gérée.

**Procédure :**

1. Sélectionner un fichier de format non reconnu par l'adaptateur Binance S1.
2. Déclencher l'import.
3. Vérifier que le rapport affiché dans l'onglet Mémoire indique clairement que la source n'est pas reconnue.
4. Inspecter le corpus : vérifier que zéro nouvelle trace S1 a été écrite.
5. Inspecter le registre CE_ingestion_registry_v1 : vérifier qu'il est inchangé.
6. Vérifier l'absence d'exception non gérée dans la console de l'environnement de navigation.

**PASS :** rapport = "source non reconnue" · zéro trace écrite · registre inchangé · aucune exception.

**FAIL :** trace écrite pour une source non reconnue · ingestion silencieuse sans rapport · exception non gérée dans la console.

---

### TC7 — CV-7 : Persistance canonique

**Objectif :** Vérifier que les traces S1 écrites lors des imports sont persistées dans le corpus canonique et consultables par famille et par session, y compris après rechargement de page.

**Procédure :**

1. Après TC1 et TC2 (au minimum), effectuer un rechargement forcé de la page (vidage du cache de modules).
2. Inspecter le corpus canonique via les outils de l'environnement de navigation.
3. Vérifier que les traces S1 écrites lors de TC1 et TC2 sont toujours présentes dans le corpus.
4. Vérifier que `index.byFamille["S1"]` contient tous les identifiants des traces S1 écrites.
5. Vérifier que `index.bySession[sessionId_TC1]` et `index.bySession[sessionId_TC2]` contiennent les identifiants correspondants.
6. Vérifier que les traces des autres familles (SY1 · SY3 · S2) présentes avant les tests sont intactes.

**PASS :** traces S1 persistées après rechargement · index byFamille et bySession cohérents · traces des autres familles intactes.

**FAIL :** traces S1 disparues après rechargement · identifiants manquants dans l'index · traces d'autres familles altérées.

---

### TC8 — CV-8 : Déduplication et session

**Objectif :** Vérifier que le premier import d'un fichier crée une session et enregistre la source dans le registre, et que le second import du même fichier est bloqué avant toute création de session ou écriture de trace.

**Procédure :**

1. **Premier import** : sélectionner un fichier non encore ingéré (vérification de PC-3). Déclencher l'import.
2. Vérifier que le rapport indique `result = "succès"` · `written > 0`.
3. Inspecter le registre CE_ingestion_registry_v1 : vérifier que l'empreinte de ce fichier est désormais enregistrée.
4. **Second import** : sélectionner le même fichier. Déclencher l'import.
5. Vérifier que le rapport affiché indique clairement le doublon (sourceId · date du premier import · traceCount).
6. Vérifier que le corpus n'a reçu aucune nouvelle trace depuis le premier import.
7. Vérifier que le registre contient une seule entrée pour ce fichier (inchangé après le second import).
8. Vérifier que l'index bySession ne contient pas de nouvelle entrée liée à ce second import.

**PASS :** premier import réussi · empreinte enregistrée · second import bloqué avec rapport doublon · zéro trace ajoutée · registre et index inchangés.

**FAIL :** second import non bloqué · nouvelles traces écrites lors du second import · doublon silencieux · deux sessions créées pour le même fichier.

---

## §6 Vérifications de robustesse

### RC1 — CB-1 : Zéro régression LOT-P1-2

**Objectif :** Confirmer que les imports S1 réalisés dans §5 n'ont pas altéré les traces des autres familles (SY1 · SY3 · S2) ni la structure de l'index canonique.

**Procédure :**

1. Compter le nombre de traces S1 dans le corpus après tous les imports de §5.
2. Compter le nombre de traces SY1, SY3 et S2 dans le corpus. Comparer avec les valeurs relevées en PC-4.
3. Vérifier que C0 final = C0 initial (PC-4) + nombre de traces S1 effectivement écrites lors de §5.
4. Exécuter le diagnostic C2 (structure index) : vérifier la présence des trois axes famille · date · session.
5. Exécuter le diagnostic C3 (structure corpus) : vérifier l'absence de trace malformée.
6. Exécuter le diagnostic C4 (cohérence index↔corpus) : vérifier l'absence d'identifiant orphelin.

**PASS :** C0 delta = traces S1 écrites uniquement · SY1/SY3/S2 inchangés · C2 PASS · C3 PASS · C4 PASS.

**FAIL :** traces des familles SY1, SY3 ou S2 altérées · C0 delta différent des traces S1 attendues · C2 ou C3 ou C4 FAIL.

---

### RC2 — CB-2 : Zéro régression module comportemental

**Objectif :** Confirmer que l'ajout du module d'ingestion et les imports S1 n'ont pas affecté le module comportemental — import comportemental, scoring et affichage des sessions comportementales.

**Procédure :**

1. Naviguer vers l'onglet Comportement.
2. Effectuer un import comportemental via l'interface comportementale existante.
3. Vérifier que le pipeline comportemental s'exécute correctement : scoring produit · session comportementale enregistrée · affichage du résultat correct.
4. Vérifier que l'import comportemental n'a pas ajouté de traces dans le corpus canonique — le module comportemental est isolé du module d'ingestion.
5. Vérifier l'absence d'erreur dans la console lors de l'import comportemental.

**PASS :** import comportemental fonctionnel · scoring produit · zéro trace canonique ajoutée par le module comportemental · aucune erreur console.

**FAIL :** import comportemental en erreur · scoring absent ou corrompu · traces canoniques ajoutées par le module comportemental · erreur console lors de l'import.

---

### RC3 — CB-3 : Fichier vide ou format inconnu

**Objectif :** Vérifier que les cas limites (fichier CSV Binance sans lignes de données, source non reconnue) produisent un retour explicite sans exception non gérée. Le cas "source non reconnue" est couvert par TC6 — ce cas vérifie le comportement sur un fichier Binance valide mais sans données.

**Procédure :**

1. **Fichier headers-only** : préparer un CSV contenant uniquement la ligne d'en-tête Binance (zéro ligne de données). Sélectionner et importer ce fichier.
2. Vérifier que le rapport indique `result = "échec"` · `written = 0` · `qualified = 0`.
3. Inspecter le registre : vérifier qu'il n'a pas été mis à jour — règle P2-2.C §4.4 : le registre n'est alimenté que si written ≥ 1.
4. Vérifier qu'aucune exception non gérée n'est levée dans la console.
5. Vérifier que le même fichier peut être soumis à nouveau immédiatement — pas de doublon enregistré, re-soumission non bloquée.

**PASS :** result = "échec" · written = 0 · registre inchangé · re-soumission possible · aucune exception.

**FAIL :** exception non gérée · written > 0 · registre mis à jour pour un import à 0 trace écrite · re-soumission bloquée par un doublon fantôme.

---

## §7 Critères de verdict

LOT-P2-2.F retourne **PASS** si et seulement si toutes les conditions suivantes sont satisfaites simultanément :

| Condition | Verdict requis |
|---|---|
| PC-5 — Cohérence initiale de l'index | PASS — bloquant si FAIL |
| TC1 — CV-1 · CSV TRADE_HISTORY | PASS |
| TC2 — CV-2 · CSV ORDER_HISTORY FILLED | PASS |
| TC3 — CV-3 · PDF TRADE_HISTORY | PASS |
| TC4 — CV-4 · PDF ORDER_HISTORY | PASS |
| TC5 — CV-5 · États de date EP-RC2 | PASS |
| TC6 — CV-6 · Rejet RF-R6 | PASS |
| TC7 — CV-7 · Persistance canonique | PASS |
| TC8 — CV-8 · Déduplication et session | PASS |
| RC1 — CB-1 · Zéro régression LOT-P1-2 | PASS |
| RC2 — CB-2 · Zéro régression module comportemental | PASS |
| RC3 — CB-3 · Fichier vide ou format inconnu | PASS |

Un FAIL sur l'un de ces éléments rend LOT-P2-2.F FAIL. La clôture officielle de LOT-P2-2 est bloquée jusqu'à résolution.

---

## §8 Rapport d'exécution

*Cette section est remplie lors de l'exécution terrain. Le document n'est pas validé tant que cette section est incomplète.*

### §8.1 Contexte d'exécution

| Champ | Valeur |
|---|---|
| Date | — |
| Environnement | — |
| PC-1 — Pipeline PDF opérationnel | — |
| PC-2 — Fichiers de test disponibles | — |
| PC-3 — État initial du registre (nombre d'entrées) | — |
| PC-4 — C0 initial · S1 | — |
| PC-4 — C0 initial · SY1 | — |
| PC-4 — C0 initial · SY3 | — |
| PC-4 — C0 initial · S2 | — |
| PC-5 — Cohérence initiale index (C4) | — |

### §8.2 Résultats des cas de test

| Cas de test | Critère | Résultat | Observation |
|---|---|---|---|
| TC1 — CSV TRADE_HISTORY | CV-1 | — | — |
| TC2 — CSV ORDER_HISTORY | CV-2 | — | — |
| TC3 — PDF TRADE_HISTORY | CV-3 | — | — |
| TC4 — PDF ORDER_HISTORY | CV-4 | — | — |
| TC5 — États EP-RC2 | CV-5 | — | — |
| TC6 — Rejet RF-R6 | CV-6 | — | — |
| TC7 — Persistance canonique | CV-7 | — | — |
| TC8 — Déduplication et session | CV-8 | — | — |

### §8.3 Résultats des vérifications de robustesse

| Vérification | Critère | Résultat | Observation |
|---|---|---|---|
| RC1 — Régression LOT-P1-2 | CB-1 | — | — |
| RC2 — Régression module comportemental | CB-2 | — | — |
| RC3 — Fichier vide / format inconnu | CB-3 | — | — |

### §8.4 Verdict global

| Condition | Verdict obtenu |
|---|---|
| PC-5 | — |
| TC1 | — |
| TC2 | — |
| TC3 | — |
| TC4 | — |
| TC5 | — |
| TC6 | — |
| TC7 | — |
| TC8 | — |
| RC1 | — |
| RC2 | — |
| RC3 | — |

**LOT-P2-2.F — [EN ATTENTE D'EXÉCUTION]**

---

## §9 Conditions de clôture LOT-P2-2 (rappel)

Conformément au cadrage LOT-P2-2 §8, la clôture officielle de LOT-P2-2 requiert :

| Condition | Critère | État après LOT-P2-2.F PASS |
|---|---|---|
| Condition 1 | Tous les micro-lots P2-2.A à P2-2.F validés | Satisfaite si LOT-P2-2.F PASS |
| Condition 2 | CV-1 à CV-8 satisfaits sur fichiers réels | Satisfaite — TC1→TC8 PASS |
| Condition 3 | CB-1 à CB-3 satisfaits | Satisfaite — RC1→RC3 PASS |
| Condition 4 | DT-2 · DT-3 · DT-4 · DT-5 · DT-C1 tranchées et documentées | Satisfaite depuis P2-2.A→P2-2.D |
| Condition 5 | DQC V2 CAS A sur le document de lot | À réaliser sur LOT-P2-2_PARSER_S1_V1.md avant clôture |
| Condition 6 | Décision opérateur explicite de clôture | À prononcer après LOT-P2-2.F PASS |
