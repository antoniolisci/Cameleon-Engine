# LOT-P2-2.C — Persistance dans la couche canonique V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-2.C |
| Intitulé | Persistance dans la couche canonique V1 |
| Micro-lot parent | LOT-P2-2 — Parser S1 · Fichiers transactionnels V1 |
| Programme | P2 — Ingestion des données |
| Phase Roadmap V1 | A |
| Type | Modèle — Contrat de persistance |
| Document officiel | `docs/lots/LOT-P2-2_C_PERSISTENCE_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-07-09 |

---

## §1 Mission

LOT-P2-2.C définit le contrat de persistance entre le parser S1 et la couche canonique (LOT-P1-2.2). Il spécifie la structure exacte des traces S1 soumises à la couche, le comportement du registre de sessions d'import (déduplication DT-2), la séquence d'écriture d'une session, le traitement des erreurs partielles et la vérification par l'index.

Ce micro-lot identifie également une tension dans l'API de persistance existante et tranche la décision DT-C1 (point d'entrée d'écriture pour les traces S1).

Aucun code dans ce micro-lot. Aucune interface utilisateur (périmètre P2-2.D).

---

## §2 Prérequis

| Document | Rôle dans ce micro-lot |
|---|---|
| LOT-P2-2.A — Modèle de trace S1 V1 | 6 dimensions · états EP-RC2 · DT-2 (empreinte par fichier) · DT-5 (date d'exécution) |
| LOT-P2-2.B — Logique de classification et d'extraction V1 | Sortie du parser : traces qualifiées + états EP-RC2 + contexte session |
| LOT-P1-2.1 — Modèle canonique de trace V1 | 4 champs canoniques · règles RV1-RV4 · RE1-RE3 |
| LOT-P1-2.2 — Couche de persistance locale structurée V1 | API d'écriture `writeCanonicalTrace` · `writeMigratedTrace` |
| LOT-P1-2.3 — Indexation par famille, date et session | Index triple-axe `byFamille · byDate · bySession` |
| LOT-P1-2.4 — Doctrine de provenance V1 | Source S1 = "Module d'import" · session = une opération d'import |

---

## §3 Contrat d'entrée — structure soumise à la couche

### §3.1 Rappel de l'API existante

La couche canonique (LOT-P1-2.2) expose deux fonctions d'écriture :

| Fonction | Date produite par | Usage documenté |
|---|---|---|
| `writeCanonicalTrace(entry)` | La couche — `new Date().toISOString()` (maintenant) | Nouvelles écritures par les modules actifs |
| `writeMigratedTrace(entry)` | Le module appelant — `entry.date` | Migration de données historiques |

### §3.2 Tension identifiée avec DT-5

`writeCanonicalTrace` génère la date au moment de l'appel. Or DT-5 (LOT-P2-2.A §3.4) exige que la date d'une trace S1 soit la date d'exécution du trade extraite du contenu du fichier per EP-RC2 — une date historique, pas la date d'import.

`writeCanonicalTrace` est donc structurellement incompatible avec les exigences S1. La décision DT-C1 (§6) résout cette tension.

### §3.3 Structure d'entrée d'une trace S1

Quelle que soit la fonction d'écriture retenue (§6), la structure soumise par le module d'ingestion est la suivante :

| Champ | Valeur pour une trace S1 |
|---|---|
| `famille` | `"S1"` — constant, fourni par le parser |
| `source` | Nom du fichier importé — fourni par l'adaptateur |
| `date` | ISO 8601 UTC (état Standard) · `"Non disponible"` (R1/R3) · `"Non exploitable au format canonique"` (R4) — fourni par l'algorithme EP-RC2 |
| `valeur` | Objet contenant le contenu transactionnel normalisé de la ligne (dimensions définies en LOT-P2-2.A §3.5) |
| `session` | Identifiant unique de la session d'import (non nul) |
| `contexte` | Objet de synthèse de l'import (type fichier · nb enregistrements · lignes ingérées · exclues · rejetées · résultat) |

### §3.4 Correspondance états EP-RC2 → champ `date`

| État EP-RC2 | Valeur du champ `date` soumis | Validation RV3 |
|---|---|---|
| Standard | Chaîne ISO 8601 UTC · ex. : `"2024-03-15T08:32:14.000Z"` | PASS — pattern ISO 8601 UTC avec suffixe Z |
| R1 — Non disponible | `"Non disponible"` | PASS — état formalisé reconnu (`DATE_UNAVAILABLE`) |
| R3 — Non disponible | `"Non disponible"` | PASS — état formalisé reconnu (`DATE_UNAVAILABLE`) |
| R4 — Non exploitable | `"Non exploitable au format canonique"` | PASS — état formalisé reconnu (`DATE_NON_EXPLOITABLE`) |

Les quatre états EP-RC2 sont nativement supportés par RV3. Aucune extension de la validation n'est nécessaire.

---

## §4 Registre de sessions d'import

### §4.1 Rôle

Le registre de sessions d'import stocke les empreintes des fichiers déjà importés (DT-2 — Option B, LOT-P2-2.A §4). Il est consulté avant chaque import et mis à jour après chaque import réussi.

### §4.2 Clé de stockage

Le registre est persisté dans localStorage sous la clé `CE_ingestion_registry_v1` (namespacing UUID via `resolveKey`, conforme à l'architecture LOT-P1-2.2 ML-5).

### §4.3 Structure du registre

Le registre est un tableau d'entrées. Chaque entrée correspond à un import réalisé avec succès :

| Champ | Contenu |
|---|---|
| `fingerprint` | Empreinte du contenu brut de la source (hash SHA-256 ou équivalent) |
| `sessionId` | Identifiant de session de l'ingestion correspondante |
| `sourceId` | Identifiant stable de la source ingérée |
| `importedAt` | Horodatage ISO 8601 UTC de l'ingestion |
| `traceCount` | Nombre de traces écrites lors de cette ingestion |

**Note Phase A / long terme** : En Phase A, `sourceId` = nom du fichier importé. À long terme, `sourceId` représente l'identifiant stable de la source ingérée : fichier, API, wallet, blockchain, banque ou source future.

### §4.4 Protocole de déduplication

**Avant chaque import** : calculer l'empreinte du fichier → chercher dans le registre.

- Empreinte présente → import bloqué · aucune session créée · retour d'information à l'opérateur (§4.5).
- Empreinte absente → import autorisé · session créée · poursuite du traitement.

**Après import réussi** : ajouter l'entrée au registre (fingerprint · sessionId · sourceId · importedAt · traceCount).

Si l'import échoue entièrement (§5.3) : aucune entrée ajoutée au registre.

### §4.5 Information opérateur en cas de doublon

Retour minimal obligatoire : identifiant de la source déjà ingérée · date de la première ingestion · nombre de traces produites lors de la première ingestion. Aucune trace n'est écrite.

---

## §5 Séquence d'écriture d'une session S1

### §5.1 Vue d'ensemble

L'écriture d'une session S1 suit une séquence en cinq étapes. Les étapes 1 et 2 précèdent toute écriture canonique.

| Étape | Action | Condition de poursuite |
|---|---|---|
| 1 — Vérification déduplication | Consulter le registre · vérifier l'empreinte | Empreinte absente du registre |
| 2 — Création de session | Générer un identifiant de session unique | Toujours |
| 3 — Écriture des traces | Écrire chaque trace S1 via la couche canonique | Poursuite même en cas d'échec partiel (§5.2) |
| 4 — Mise à jour du registre | Ajouter l'entrée au registre de sessions | Uniquement si au moins une trace a été écrite |
| 5 — Rapport de session | Produire le bilan d'import (§5.3) | Toujours |

### §5.2 Comportement batch — écriture des N traces

Pour un fichier de N lignes qualifiées, le module d'ingestion soumet N traces à la couche canonique en séquence. Chaque appel d'écriture est indépendant.

La séquence d'écriture n'est pas interrompue si une trace individuelle est rejetée par la couche (validation RV1-RV4 échouée ou erreur de stockage). Les autres traces sont tentées. L'échec d'une trace est consigné dans le rapport de session.

### §5.3 Rapport de session

À la fin de chaque import, le module produit un rapport de session contenant :

| Champ | Contenu |
|---|---|
| `sessionId` | Identifiant de la session |
| `sourceId` | Identifiant stable de la source ingérée (Phase A : nom du fichier) |
| `totalLines` | Nombre total de lignes dans le fichier |
| `qualified` | Lignes ayant passé les 3 conditions de qualification (P2-2.B §3) |
| `excluded` | Lignes exclues (hors périmètre — événement non exécuté) |
| `rejected` | Lignes rejetées per RF-R6 (colonnes minimales absentes) |
| `written` | Traces S1 écrites avec succès dans la couche canonique |
| `failed` | Traces S1 dont l'écriture a échoué (erreur couche ou validation) |
| `dateStates` | Distribution des états EP-RC2 : `{ standard, R1, R3, R4 }` |
| `result` | Synthèse : `"succès"` · `"succès partiel"` · `"échec"` |

**Définition des cas :**
- `"succès"` : `written === qualified` et `failed === 0`
- `"succès partiel"` : `written > 0` et `failed > 0`
- `"échec"` : `written === 0` (aucune trace persistée)

---

## §6 Décision DT-C1 — Point d'entrée de persistance pour les traces S1

### §6.1 Problème

Le module d'ingestion S1 doit fournir la date extraite du fichier (EP-RC2 · DT-5). La fonction `writeCanonicalTrace` ne l'autorise pas. La fonction `writeMigratedTrace` l'autorise, mais est documentée "réservée à canonical-migration.js — ne doit pas être utilisée pour les nouvelles écritures."

### §6.2 Options

| Option | Description |
|---|---|
| A | Utiliser `writeMigratedTrace` en levant la restriction documentaire |
| B | Créer une nouvelle fonction `writeIngestedTrace(entry)` dans `canonical-store.js` |
| C | Modifier `writeCanonicalTrace` pour accepter une date optionnelle |

### §6.3 Décision

**Option B — Créer `writeIngestedTrace(entry)` dans `canonical-store.js`.**

### §6.4 Justification

| Critère | Évaluation |
|---|---|
| Clarté sémantique | Option B distingue explicitement migration (données historiques avant LOT-P1-2.2) et ingestion (nouvelles données structurées provenant de fichiers externes) |
| Contrat stable | Option A lève une contrainte documentée sans contrôle architectural · Option C modifie le comportement d'une fonction existante déjà utilisée par 5 modules |
| Implémentation | `writeIngestedTrace` est identique à `writeMigratedTrace` dans sa logique · le champ `migratedAt` est remplacé par `ingestedAt` (traçabilité de l'import) |
| Évolutivité | Option B permet de diverger les comportements migration/ingestion sans modifier la logique existante |

### §6.5 Spécification de `writeIngestedTrace`

Comportement identique à `writeMigratedTrace` avec les différences suivantes :

| Dimension | `writeMigratedTrace` | `writeIngestedTrace` |
|---|---|---|
| Champ timestamp ajouté | `migratedAt` | `ingestedAt` |
| Sémantique | Rétrospective — données historiques | Prospective — données ingérées depuis source externe |
| Restriction d'usage | canonical-migration.js uniquement | Module d'ingestion S1 (et futurs modules d'ingestion) |

La validation RV1-RV4 et la séquence RE1-RE3 sont inchangées.

---

## §7 Vérification par l'index après ingestion

Après l'écriture de la session, le module d'ingestion vérifie la cohérence via l'index canonique (LOT-P1-2.3) :

| Vérification | Méthode | Condition de succès |
|---|---|---|
| Traces indexées par famille | `index.byFamille[famille cible de la session]` | Longueur augmentée de `written` entrées |
| Traces indexées par session | `index.bySession[sessionId]` | Longueur égale à `written` |

En cas de divergence entre `written` et la longueur dans l'index : consigner l'écart dans le rapport de session. La réconciliation de l'index (`reconcileIndex`) est disponible dans `canonical-index.js` si nécessaire.

---

## §8 Critères de validation

| CV | Critère | Condition de satisfaction |
|---|---|---|
| CV-C1 | Écriture Standard | Trace avec date ISO 8601 UTC → RV3 PASS · trace présente dans corpus et index |
| CV-C2 | Écriture R1/R3 | Trace avec date "Non disponible" → RV3 PASS · trace présente dans corpus et index |
| CV-C3 | Écriture R4 | Trace avec date "Non exploitable au format canonique" → RV3 PASS · trace présente dans corpus et index |
| CV-C4 | Session indexée | Après import · `index.bySession[sessionId]` contient exactement `written` identifiants |
| CV-C5 | Famille indexée | Après import · `index.byFamille[famille cible de la session]` est augmenté du nombre de traces écrites |
| CV-C6 | Déduplication DT-2 | Deuxième import du même fichier → bloqué · aucune trace écrite · registre inchangé |
| CV-C7 | Échec partiel | Si N-1 traces écrites et 1 échec → rapport "succès partiel" · N-1 traces dans corpus · registre mis à jour |
| CV-C8 | Zéro régression | Les traces SY1 · SY3 · S2 existantes restent intactes après l'import |

---

## §9 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | CV-C1 à CV-C8 satisfaits |
| Condition 2 | DT-C1 tranchée et documentée |
| Condition 3 | DQC V2 CAS A sur ce document |
| Condition 4 | Validation opérateur explicite |
