# LOT-P2-2.D — Interface de déclenchement V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-2.D |
| Intitulé | Interface de déclenchement V1 |
| Micro-lot parent | LOT-P2-2 — Parser S1 · Fichiers transactionnels V1 |
| Programme | P2 — Ingestion des données |
| Phase Roadmap V1 | A |
| Type | Modèle — Pipeline et interface de déclenchement |
| Document officiel | `docs/lots/LOT-P2-2_D_TRIGGER_INTERFACE_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-07-10 |

---

## §1 Mission

LOT-P2-2.D définit le pipeline d'ingestion et l'interface de déclenchement opérateur de Caméléon Engine. Il spécifie :

- la demande d'ingestion (descripteur de source générique) ;
- la résolution de l'adaptateur (registre des adaptateurs) ;
- le contrat générique d'un adaptateur ;
- la séquence d'orchestration du Core ;
- la décision DT-4 (point d'entrée opérateur).

Ce micro-lot orchestre les responsabilités définies dans les micro-lots antérieurs. Il ne redéfinit ni la logique de qualification (P2-2.B), ni le contrat de persistance (P2-2.C). Il les enchaîne dans une séquence contrôlée exclusivement par le Core.

Aucun code dans ce micro-lot.

---

## §2 Prérequis

| Document | Rôle dans ce micro-lot |
|---|---|
| LOT-P2-2 — Cadrage V1 | DT-4 à trancher ici · Invariants INV-1→9 |
| LOT-P2-2.A — Modèle de trace S1 V1 | 6 dimensions · session = une opération d'import · source = identifiant de la source |
| LOT-P2-2.B — Logique de classification et d'extraction V1 | S1 Core · qualification · EP-RC2 · RF-R6 · Adaptateur Binance Phase A |
| LOT-P2-2.C — Persistance dans la couche canonique V1 | `writeIngestedTrace` · registre `CE_ingestion_registry_v1` · séquence de session · rapport · `contexte` |
| LOT-P1-2.2 — Couche de persistance locale structurée V1 | Interface d'écriture canonique |
| LOT-P1-2.3 — Indexation par famille, date et session | Index triple-axe · vérification post-ingestion |

---

## §3 Périmètre — Séparation des responsabilités

| Responsabilité | Micro-lot titulaire |
|---|---|
| Modèle de trace S1 | P2-2.A |
| Qualification · extraction de date (EP-RC2) · construction du champ valeur | P2-2.B |
| Persistance · registre d'ingestion · rapport de session | P2-2.C |
| **Pipeline d'orchestration · registre des adaptateurs · interface opérateur** | **P2-2.D (ce document)** |

Conséquence directe : aucune règle Binance-spécifique ne figure dans les sections génériques de ce micro-lot (§4 à §8). Toute mention Phase A est explicitement marquée.

---

## §4 Invariants du pipeline

Ces invariants sont non négociables. Ils s'appliquent à toutes les familles (S1–S5) et à tous les adaptateurs présents et futurs.

| Invariant | Règle |
|---|---|
| I-D1 | Le Core ne connaît aucun format de source, aucune plateforme, aucun schéma de champs. |
| I-D2 | Les adaptateurs ne contrôlent jamais la séquence d'ingestion. Ils répondent aux sollicitations du Core. |
| I-D3 | La séquence d'orchestration (§8) est identique quelle que soit la famille ou l'adaptateur activé. |
| I-D4 | L'enregistrement d'un nouvel adaptateur ne modifie aucun code du Core. |

---

## §5 Les six responsabilités du pipeline

Le pipeline couvre six responsabilités distinctes et séquentielles.

| Responsabilité | Définition | Titulaire |
|---|---|---|
| Demande d'ingestion | Réception de la source à ingérer et déclenchement du pipeline | Core — point d'entrée (§8.1) |
| Résolution de l'adaptateur | Identification de l'adaptateur capable de traiter la source · rejet immédiat si aucun | Core — registre des adaptateurs (§7) |
| Extraction | Lecture des événements bruts depuis la source | Adaptateur (§7.2) |
| Qualification et construction | Classification de chaque événement (qualifié · exclu · rejeté) · extraction de date · construction du champ valeur | Adaptateur (règles P2-2.B §3→§6 pour S1 · règles équivalentes pour les familles futures) |
| Persistance | Déduplication · session · écriture des traces · registre · vérification de l'index | Core — contrat P2-2.C |
| Rapport de session | Production du bilan d'ingestion et présentation à l'opérateur | Core — interface (§9) |

---

## §6 Descripteur de source

### §6.1 Rôle

La demande d'ingestion est exprimée par un **descripteur de source** — structure générique transmise au pipeline par l'interface opérateur. Le Core et les adaptateurs interagissent exclusivement via ce descripteur. Le descripteur isole le Core de tout savoir sur la nature concrète de la source.

### §6.2 Structure du descripteur

| Champ | Contenu |
|---|---|
| `type` | Catégorie de la source · identifie le mode d'accès : `"file"` · `"api"` · `"wallet"` · `"blockchain"` · `"bank"` · valeur future |
| `data` | Contenu brut de la source (binaire ou structuré selon le type) |
| `meta` | Métadonnées optionnelles : nom fourni par l'opérateur · horodatage de soumission |

### §6.3 Phase A — Descripteur fichier

**Note Phase A** : En Phase A, `type = "file"` · `data` = contenu binaire du fichier soumis · `meta.name` = nom du fichier tel que fourni par l'opérateur. La structure générique est conçue pour accueillir les types futurs sans modification du Core.

---

## §7 Registre des adaptateurs

### §7.1 Rôle

Le registre des adaptateurs est le seul pont entre le Core et les adaptateurs. Il maintient la liste ordonnée des adaptateurs enregistrés et fournit au pipeline la résolution de l'adaptateur compétent pour un descripteur donné.

### §7.2 Contrat générique d'un adaptateur

Tout adaptateur enregistré expose les capacités suivantes. Ces capacités sont génériques et suffisantes pour toutes les familles S1–S5 et pour toutes les sources futures.

| Capacité | Description |
|---|---|
| `famille` | Famille canonique que cet adaptateur produit (ex. : `"S1"`) |
| `canHandle(descriptor)` | Détermine si cet adaptateur peut traiter le descripteur de source · retourne vrai ou faux · ne modifie aucun état |
| `getSourceId(descriptor)` | Retourne l'identifiant stable de la source (conformément à `sourceId` — LOT-P2-2.C §4.3) |
| `fingerprint(descriptor)` | Calcule et retourne l'empreinte du contenu de la source (DT-2 — LOT-P2-2.A §4) |
| `extractEvents(descriptor)` | Lit la source · retourne l'ensemble des événements bruts · le nombre total d'événements · la description du type de source |
| `processEvent(event)` | Traite un événement brut · retourne : le statut de qualification (`qualifié` · `exclu` · `rejeté`) · si qualifié : la valeur de date (résultat EP-RC2 pour S1 · équivalent pour les familles futures) et le champ valeur de la trace |

### §7.3 Résolution de l'adaptateur

À réception d'un descripteur, le Core interroge les adaptateurs enregistrés dans l'ordre d'enregistrement via `canHandle(descriptor)`. Le premier adaptateur retournant vrai est sélectionné.

Si aucun adaptateur ne reconnaît la source : le pipeline est interrompu avant toute création de session. L'opérateur reçoit un retour explicite. Aucune trace n'est écrite.

### §7.4 Phase A — Adaptateur Binance S1

**Note Phase A** : En Phase A, un seul adaptateur est enregistré, produisant la famille `S1`. Ses règles de détection, de qualification, d'extraction de date (EP-RC2) et de construction du champ valeur sont définies dans LOT-P2-2.B §6.

---

## §8 Orchestrateur du pipeline

### §8.1 Point d'entrée

Le Core expose un unique point d'entrée pour toute opération d'ingestion :

> **`ingest(descriptor) → rapport de session`**

Le point d'entrée reçoit un descripteur de source (§6) et retourne un rapport de session (structure définie en LOT-P2-2.C §5.3). Tout état intermédiaire est interne au pipeline.

### §8.2 Séquence d'orchestration

| Étape | Action | Condition de poursuite |
|---|---|---|
| 1 — Résolution | Consulter le registre · appeler `canHandle()` sur les adaptateurs enregistrés | Adaptateur trouvé — sinon : retour erreur "source non reconnue" · fin |
| 2 — Empreinte | Appeler `adapter.fingerprint(descriptor)` | Toujours |
| 3 — Déduplication | Consulter le registre `CE_ingestion_registry_v1` (LOT-P2-2.C §4.4) | Empreinte absente — sinon : retour information doublon · fin |
| 4 — Session | Générer un identifiant de session unique (LOT-P2-2.C §5.1 étape 2) | Toujours |
| 5 — Extraction | Appeler `adapter.extractEvents(descriptor)` · récupérer événements bruts · totalCount · sourceType | Toujours |
| 6 — Qualification | Pour chaque événement brut : appeler `adapter.processEvent(event)` · accumuler : qualified · excluded · rejected · distribution des états de date | Poursuite quelle que soit la qualification individuelle |
| 7 — Construction du contexte | Consolider les compteurs de l'étape 6 · construire le champ `contexte` de session (LOT-P2-2.C §3.3) | Toujours |
| 8 — Écriture | Pour chaque événement qualifié : construire la trace (§8.3) · appeler `writeIngestedTrace()` (LOT-P2-2.C DT-C1) · accumuler : written · failed | Poursuite même en cas d'échec d'écriture individuelle |
| 9 — Registre | Ajouter l'entrée dans `CE_ingestion_registry_v1` si written ≥ 1 (LOT-P2-2.C §4.4) | written ≥ 1 |
| 10 — Index | Vérifier `index.bySession[sessionId]` et `index.byFamille[famille]` (LOT-P2-2.C §7) | Toujours |
| 11 — Rapport | Construire et retourner le rapport de session (LOT-P2-2.C §5.3) | Toujours |

### §8.3 Construction de la trace qualifiée

Pour chaque événement dont `processEvent()` retourne le statut `qualifié`, le Core assemble la trace canonique avant de l'écrire :

| Champ | Source |
|---|---|
| `famille` | `adapter.famille` |
| `source` | `adapter.getSourceId(descriptor)` |
| `date` | Valeur de date retournée par `processEvent()` · état EP-RC2 pour S1 (Standard · R1 · R3 · R4) |
| `valeur` | Champ valeur retourné par `processEvent()` |
| `session` | Identifiant de session généré à l'étape 4 |
| `contexte` | Objet de session construit à l'étape 7 (LOT-P2-2.C §3.3) |

### §8.4 Cas d'échec au niveau pipeline

| Situation | Comportement | Session créée | Registre mis à jour |
|---|---|---|---|
| Aucun adaptateur reconnu | Retour erreur "source non reconnue" · fin du pipeline | Non | Non |
| Doublon détecté | Retour information doublon (LOT-P2-2.C §4.5) · fin du pipeline | Non | Non |
| Extraction complète échoue | Rapport "échec" · zéro trace écrite | Oui | Non |
| Zéro événement qualifié | Rapport "échec" · written = 0 | Oui | Non |
| Toutes les écritures échouent | Rapport "échec" · written = 0 | Oui | Non |
| Erreurs partielles d'écriture | Rapport "succès partiel" · written ≥ 1 · failed ≥ 1 | Oui | Oui |

---

## §9 Résolution DT-4 — Interface opérateur

### §9.1 Problème

Le point d'entrée opérateur de l'ingestion doit être localisé dans l'interface de Caméléon Engine. La décision DT-4 détermine cet emplacement.

### §9.2 Options

| Option | Description |
|---|---|
| A | Réutilise l'interface existante de l'onglet Comportement |
| B | Nouvelle interface dans l'onglet Mémoire |
| C | Déclenchement automatique après import comportemental |

### §9.3 Décision

**Option B — Nouvelle interface dans l'onglet Mémoire.**

### §9.4 Justification

| Critère | Évaluation |
|---|---|
| Cohérence fonctionnelle | L'ingestion écrit dans le corpus canonique — couche de mémoire de Caméléon Engine. L'onglet Mémoire est le point naturel de contrôle des opérations mémorielles. |
| Isolation comportementale | Option A violerait l'isolation du module comportemental (LOT-P2-2 §6.2 · CLAUDE.md) : ce module ne doit émettre aucun signal vers les autres modules et n'être piloté par aucun autre module. |
| Isolation ingestion | Option C couplerait l'import comportemental à l'import d'ingestion, contredisant DT-3 (implémentation indépendante) et l'invariant INV-2. |
| Évolutivité | L'onglet Mémoire accueillera toutes les familles d'ingestion futures (S1–S5). Une interface d'ingestion unifiée dans cet onglet est cohérente avec la croissance du Programme P2. |

### §9.5 Interface Phase A — Zone d'import dans l'onglet Mémoire

**Note Phase A** : En Phase A, le seul type de source supporté est le fichier. L'interface est une zone d'import de fichier positionnée dans l'onglet Mémoire. Elle sera étendue en Phase B+ pour accueillir les sources non-fichier (API, wallet, blockchain, banque, sources futures).

**Déclenchement :**
- Zone de soumission de source visible dans l'onglet Mémoire.
- Déclenchement explicite par l'opérateur.
- Indicateur d'opération en cours pendant l'exécution du pipeline.

**Retour d'information :**

| Situation | Information présentée à l'opérateur |
|---|---|
| Succès | Nombre de traces écrites · lignes exclues · lignes rejetées · distribution des états de date EP-RC2 · résultat "succès" |
| Succès partiel | Même information · résultat "succès partiel" · nombre d'échecs d'écriture |
| Échec | Zéro trace écrite · résultat "échec" · raison si identifiable |
| Doublon | Source déjà ingérée · identifiant de la source (sourceId) · date du premier import · nombre de traces produites |
| Source non reconnue | Retour explicite · aucune trace écrite · aucune session créée |

Le retour est présenté immédiatement à la fin du pipeline. Il n'est pas persisté — seul le corpus canonique et le registre d'ingestion constituent les traces durables de l'opération.

---

## §10 Critères de validation

| CV | Critère | Condition de satisfaction |
|---|---|---|
| CV-D1 | Import réussi | Source reconnue et qualifiée → pipeline complet · rapport "succès" · traces présentes dans corpus et index |
| CV-D2 | Événements exclus | Événements hors périmètre → exclus sans rejet RF-R6 · comptabilisés dans le rapport |
| CV-D3 | Source non reconnue | Aucun adaptateur compétent → retour explicite · aucune trace · aucune session |
| CV-D4 | Déduplication DT-2 | Deuxième soumission du même contenu → information doublon · pipeline interrompu · registre inchangé |
| CV-D5 | Interface Mémoire | La zone d'import est accessible dans l'onglet Mémoire · rapport visible après chaque pipeline |
| CV-D6 | Rapport complet | Rapport de session contient tous les champs définis en LOT-P2-2.C §5.3 |
| CV-D7 | Zéro régression canonique | Traces des familles SY1 · SY3 · S2 existantes intactes après ingestion |
| CV-D8 | Isolation comportementale | Le module comportemental reste indépendant · son import existant fonctionne sans modification |
| CV-D9 | Extensibilité adaptateur | Un adaptateur supplémentaire peut être enregistré sans modification du Core · CV-D1 satisfait pour ce nouvel adaptateur |

---

## §11 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | CV-D1 à CV-D9 satisfaits |
| Condition 2 | DT-4 tranchée et documentée |
| Condition 3 | DQC V2 CAS A sur ce document |
| Condition 4 | Validation opérateur explicite |
