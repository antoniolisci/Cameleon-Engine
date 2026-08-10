# LOT-P2-3 — Schéma canonique S2 · Ontologie patrimoniale V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-3 |
| Intitulé | Schéma canonique S2 · Ontologie patrimoniale V1 |
| Programme | P2 — Doctrine des Sources & Schémas d'Ingestion |
| Phase Roadmap V1 | A |
| Type | Doctrine — Schéma canonique |
| Document officiel | `docs/lots/LOT-P2-3_SCHEMA_S2_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-08-10 |
| Date de clôture | — |
| Prérequis | LOT-P2-1 CLOS · LOT-P2-2 CLOS |

---

## §1 Mission

LOT-P2-3 définit le **schéma canonique et l'ontologie patrimoniale de la famille mémorielle S2** au sein de Caméléon Engine.

Son livrable est exclusivement documentaire : un contrat complet décrivant ce qu'est un actif patrimonial, comment l'état patrimonial d'un opérateur est représenté dans le corpus canonique, et quel contrat tout adaptateur futur devra respecter pour alimenter la famille S2.

LOT-P2-3 ne produit aucun parser, aucune implémentation, aucune modification fonctionnelle, aucune validation terrain.

**Objectifs** :

1. Définir l'**ontologie patrimoniale** de Caméléon Engine : les trois entités ACTIF, POSITION et LIEU DE DÉTENTION, leurs propriétés respectives et les règles de séparation entre elles.
2. Définir l'**identité canonique d'un actif** : le champ `assetId`, les propriétés qui déterminent l'identité économique d'un instrument financier, et les règles de génération.
3. Définir le **modèle canonique de trace S2** : les deux types de traces SNAPSHOT et POSITION, leur structure, leur liaison par session, et leur écriture dans `CE_canonical_corpus_v1`.
4. Définir les **règles de dérivation et de classification S2** : la frontière conceptuelle entre événement source et état patrimonial, et l'algorithme générique de dérivation.
5. Définir le **contrat de persistance S2** : conditions d'écriture dans la couche canonique, registre d'ingestion S2, rapport de session.
6. Délimiter le **périmètre Phase A** et formaliser le **contrat générique de l'adaptateur S2** que le futur Programme P3 devra implémenter.

**Principe fondateur** :

S2 ne définit pas un modèle de portefeuille. S2 définit l'ontologie patrimoniale générique de Caméléon Engine. Elle permettra à terme de comprendre ce que l'opérateur possède, où il le possède, sous quelle forme, à quel instant, comment cette composition patrimoniale évolue, et comment cette trajectoire se relie à ses décisions. Les sources s'adaptent au canon. Le canon ne s'adapte jamais structurellement à une source particulière.

---

## §2 Prérequis

| Document | Rôle dans ce lot |
|---|---|
| LOT-P2-1 — Doctrine d'ingestion V1 | Définition fondatrice S2 par DI4 · RF-R5 (classification) · FB-F5 (frontière S1/S2) · EP-S2 (provenance) · EP-RC2 (algorithme de date) |
| LOT-P2-2 — Parser S1 V1 | Modèle d'adaptateur (6 capacités) · `writeIngestedTrace` · `CE_ingestion_registry_v1` · invariants architecturaux I-D1→I-D4 · architecture Core first |
| LOT-P1-2.1 — Modèle canonique de trace V1 | Modèle à 4 champs (famille · source · date · contexte) · règles des champs obligatoires |
| LOT-P1-2.2 — Couche de persistance locale V1 | `canonical-store.js` · `CE_canonical_corpus_v1` · contrat d'écriture canonique |
| LOT-P1-2.3 — Indexation par famille, date et session | Index triple-axe utilisé pour retrouver les traces S2 après ingestion |
| LOT-P1-2.4 — Doctrine de provenance V1 | Règles de provenance pour les 4 familles · session · source · contexte |
| `docs/architecture/portfolio-v1-scope.md` | Référence historique — cadrage patrimonial antérieur à la Roadmap V1 · absorbé par DT-2 |
| `docs/architecture/portfolio-v1-impl.md` | Référence historique — plan d'implémentation antérieur · absorbé par DT-2 · supersédé en implémentation par futur Programme P3 S2 |

---

## §3 Définition canonique de S2

### §3.1 Fondation doctrinale (LOT-P2-1)

Selon DI4 (LOT-P2-1) : **S2 = état de composition patrimoniale à un instant donné**.

Une trace S2 représente non pas ce que l'opérateur a *fait* (action → S1), mais ce que l'opérateur *possède* à une date précise (état → S2).

Selon RF-R5 (LOT-P2-1), les données S2 couvrent : composition de portefeuille, allocation, inventaire de positions, solde total.

Selon FB-F5 (LOT-P2-1), la frontière S1/S2 s'applique **donnée par donnée**, pas par fichier.

### §3.2 Périmètre S2 — Phase A

| Source | Classification | Critère |
|---|---|---|
| Binance Wallet History (CSV) | S2 — état patrimonial dérivé | Quantités nettes par actif dérivées des opérations du fichier |

### §3.3 Sources exclues Phase A

| Source | Raison d'exclusion |
|---|---|
| API blockchain externe | I-01 — local-first : les données ne quittent pas l'appareil sans consentement explicite |
| Binance Wallet History PDF | Format non validé Phase A |
| Wallet History d'autres exchanges | Sources non validées Phase A |
| Saisie manuelle d'actifs | Différé Phase B+ |
| Wallets non-custodiaux (on-chain) | Phase B+ — requiert protocole de synchronisation local sans API |
| Tout fichier de format non reconnu | RF-R6 étendu à S2 : rejet immédiat sans écriture canonique |

---

## §4 Ontologie patrimoniale — Les trois entités fondamentales

### §4.1 Définition des entités

L'ontologie patrimoniale de Caméléon Engine repose sur trois entités distinctes et non substituables.

**ACTIF (Asset)** — l'instrument financier lui-même.

Un actif est défini par sa nature économique et le protocole ou l'entité qui le crée, indépendamment de tout lieu de détention. Bitcoin est un actif. Ethereum est un actif. WBTC est un actif distinct de Bitcoin. stETH est un actif distinct d'Ethereum.

Un actif patrimonial possède une **identité canonique stable** qui ne change pas selon l'endroit où il est détenu, ni selon la source qui le rapporte.

**POSITION** — l'état d'une quantité d'un actif détenue par l'opérateur dans un lieu donné.

Une position lie un actif à un lieu de détention et à une quantité nette à un instant donné. La même quantité de Bitcoin détenue simultanément sur Binance et dans un wallet personnel représente deux positions distinctes du même actif canonique.

**LIEU DE DÉTENTION (Location)** — où la position est conservée.

Le lieu de détention décrit la custodie, le réseau et l'identifiant spécifique. Il appartient à la position, pas à l'actif. Le lieu de détention ne modifie jamais l'identité de l'actif.

### §4.2 Séparation des responsabilités (DT-7)

| Propriété | ACTIF | POSITION | LIEU DE DÉTENTION |
|---|---|---|---|
| Identité économique de l'instrument | ✓ | — | — |
| Protocole / entité définissant l'instrument | ✓ | — | — |
| Type d'instrument | ✓ | — | — |
| Référence au contrat définissant l'instrument | ✓ | — | — |
| Quantité nette détenue | — | ✓ | — |
| Forme de détention (liquid / staké / en pool...) | — | ✓ | — |
| Référence à l'actif concerné | — | ✓ | — |
| Type de custodie (custodial / non-custodial...) | — | — | ✓ |
| Réseau sur lequel la position est détenue | — | — | ✓ |
| Identifiant spécifique (adresse wallet, compte...) | — | — | ✓ |
| Nom de la source (exchange, protocole...) | — | — | ✓ |

**Règle centrale** : le lieu de détention ne modifie pas l'identité de l'actif. Un transfert de Binance vers un wallet personnel ne crée pas un nouvel actif — il déplace une position d'un lieu vers un autre.

### §4.3 Résolution des cas canoniques

| Situation | Résultat |
|---|---|
| BTC sur Binance (custodial) + BTC wallet personnel | MÊME ACTIF · deux positions · lieux de détention distincts |
| ETH wallet A + ETH wallet B | MÊME ACTIF · deux positions · lieux de détention distincts |
| USDT sur Ethereum + USDT sur BSC | MÊME ACTIF (même émetteur Tether) · deux positions · réseaux distincts |
| BTC + WBTC | ACTIFS DISTINCTS — instruments différents (natif vs encapsulé) |
| ETH + stETH | ACTIFS DISTINCTS — instruments différents (natif vs reçu de staking Lido) |
| TAO liquide + exposition alpha subnet Bittensor | Décision différée Phase B+ — ontologie Bittensor à formaliser lors du cadrage Bittensor |

### §4.4 Frontières d'actifs — règles de distinction

**Deux holdings représentent des actifs distincts si et seulement si** l'un des critères suivants est satisfait :

| Critère | Exemple |
|---|---|
| L'instrument est défini par un protocole différent | ETH (Ethereum) ≠ stETH (Lido) |
| L'instrument est une transformation de l'actif d'origine (wrapping, synthétique) | BTC ≠ WBTC |
| L'instrument est un token de pool de liquidité composite | ETH ≠ ETH/USDT LP |

**Deux holdings représentent le même actif si et seulement si** :

| Critère | Exemple |
|---|---|
| Seul le lieu de détention diffère (custodie, réseau, wallet) | BTC Binance = BTC on-chain |
| Seul le réseau de détention diffère, l'émetteur restant identique | USDT Ethereum = USDT BSC (même émetteur Tether) |

**Règle de prudence** : lorsque la distinction actif / lieu de détention est ambiguë pour un type d'instrument non encore formalisé (positions DeFi complexes, subnets Bittensor), la décision est différée au lot d'ingestion concerné. La Phase A ne couvre que des cas non-ambigus.

### §4.5 Principe fondateur

> Les sources s'adaptent au canon.
> Le canon ne s'adapte jamais structurellement à une source particulière.

Un adaptateur source (Binance, on-chain, manuel, API future) exprime ses données dans le modèle canonique défini par LOT-P2-3. Si la source ne peut pas renseigner une propriété requise par le canon, la valeur `null` ou `"unknown"` est utilisée — jamais le modèle canonique n'est simplifié pour accommoder les lacunes d'une source.

---

## §5 Identité canonique d'un actif

### §5.1 Définition de assetId

`assetId` est l'**identifiant canonique stable d'un actif au sein de Caméléon Engine**. Il identifie l'instrument financier, non sa localisation.

Propriétés de `assetId` :
- **Stable** : ne change pas si l'actif est transféré d'un custodien à un autre.
- **Unique** : deux instruments économiquement distincts ont des `assetId` distincts.
- **Agnostique de la source** : ne dépend d'aucun service externe. Calculable localement.
- **Opaque** : l'encodage interne est un détail d'implémentation — seule la stabilité compte.

### §5.2 Propriétés de l'actif patrimonial

```
CHAMPS OBLIGATOIRES
  assetId           string   — identifiant canonique (§5.3)
  symbol            string   — ticker canonique de l'instrument ("BTC", "ETH", "stETH", ...)
  instrumentType    enum     — catégorie de l'instrument (tableau ci-dessous)
  definingProtocol  string   — protocole ou entité qui définit l'instrument

CHAMPS OPTIONNELS (null en Phase A — peuplés en Phase B+)
  name              string | null   — nom lisible ("Bitcoin", "Lido Staked Ether", ...)
  contractRef       string | null   — référence canonique au contrat définissant l'instrument
  attributes        object | null   — propriétés type-spécifiques
```

**Valeurs de `instrumentType`** :

| Valeur | Description | Exemples |
|---|---|---|
| `native-coin` | Token natif d'un protocole blockchain | BTC, ETH, SOL, TAO |
| `fungible-token` | Token fongible défini par un contrat émetteur | USDT, LINK, BNB |
| `staked-receipt` | Reçu de staking émis par un protocole tiers | stETH, rETH |
| `wrapped-asset` | Version encapsulée cross-chain d'un autre actif | WBTC, WETH |
| `lp-token` | Part de pool de liquidité | ETH/USDT LP Uniswap |
| `subnet-token` | Token spécifique à un subnet (Bittensor et équivalents) | Alpha tokens Bittensor |
| `other` | Tout instrument non classifiable ci-dessus | — |

**Exemples de `attributes`** (Phase B+) :

```
subnet-token Bittensor  →  { subnetId: 18, protocol: "bittensor" }
lp-token                →  { pair: "ETH/USDT", protocol: "uniswap-v3" }
staked-receipt          →  { underlying: "ethereum-native", protocol: "lido" }
```

**Justification de `instrumentType` dans l'identité** : `instrumentType` distingue deux instruments qui partagent le même `definingProtocol`. Bitcoin (native-coin · protocol bitcoin) et WBTC (wrapped-asset · protocol bitgo-wbtc) ne sont pas le même actif. La propriété est économiquement déterminante — elle n'est pas un attribut de localisation.

### §5.3 Règles de génération de assetId

La génération de `assetId` est déterministe : les mêmes propriétés produisent toujours le même identifiant.

**Règle générale** :

```
assetId = hash_déterministe(symbol_canonique, instrumentType, definingProtocol)
```

La fonction `hash_déterministe` est stable (ex. UUID v5 ou SHA-256 tronqué). Son implémentation est définie par LOT-P3 S2.

**Actifs canoniques de référence** :

Pour les actifs dont l'identité est non-ambiguë, l'adaptateur maintient une liste de correspondance curated qui garantit la stabilité des `assetId` inter-sessions. La forme recommandée est :

```
canonical:{protocol}-{shorthand}
Exemples : canonical:bitcoin-native · canonical:ethereum-native · canonical:tether-usdt
```

Cette liste est propriété de chaque adaptateur — elle est extensible sans modification de LOT-P2-3.

**Actifs inconnus** :

Lorsque l'adaptateur ne peut pas déterminer avec certitude l'identité canonique d'un actif :

```
assetId = "provisional:" + hash_déterministe(symbol_source, "unknown", "unknown")
```

L'identifiant provisoire est stable par session. Il peut être résolu vers un identifiant canonique lors d'une ingestion ultérieure disposant de plus d'information.

### §5.4 Limites Phase A

En Phase A, la source Binance Wallet History ne fournit que le symbole de l'actif. Les champs `definingProtocol`, `contractRef` et `name` ne sont pas disponibles directement.

| Actif Phase A | Traitement |
|---|---|
| Actif présent dans le mapping curé de l'adaptateur | `assetId` canonique stable · champs connus peuplés |
| Actif inconnu | `assetId` provisoire · `instrumentType` = `"other"` · `definingProtocol` = `null` |
| Champs optionnels | `null` |

Cette limitation est une dette Phase A documentée. Elle n'affecte pas la stabilité du canon — le modèle est conçu pour Phase B+ dès maintenant.

---

## §6 Modèle canonique de trace S2

### §6.1 Architecture deux niveaux : SNAPSHOT / POSITION

Le modèle S2 repose sur deux types de traces complémentaires formant une paire liée :

**Trace SNAPSHOT S2** — ancre temporelle de l'état patrimonial.

Un snapshot représente le fait qu'à l'instant `date`, une opération d'ingestion a produit un état patrimonial documenté. Il porte les métadonnées de l'import et sert de référence pour toutes les positions associées.

**Trace POSITION S2** — état d'un actif dans un lieu de détention.

Une position représente la quantité nette d'un actif canonique détenue dans un lieu de détention spécifique au moment du snapshot. Chaque actif distinct dans chaque lieu de détention distinct produit une trace POSITION.

**Relation** :

```
SNAPSHOT S2 (1 par opération d'ingestion par source)
  └── POSITION S2 · assetId A · lieu 1   (même snapshotId via session)
  └── POSITION S2 · assetId B · lieu 1
  └── POSITION S2 · assetId A · lieu 2   (même actif, lieu différent)
  └── ...
```

Toutes les traces POSITION d'un même snapshot partagent le même `session` (= `snapshotId`). Cette liaison permet de reconstituer l'état patrimonial complet à un instant T.

### §6.2 Structure de la trace SNAPSHOT S2

La trace SNAPSHOT suit le modèle canonique à 4 champs (LOT-P1-2.1) :

| Champ canonique | Valeur |
|---|---|
| `famille` | `S2` |
| `source` | Identifiant canonique de la source patrimoniale (enregistré dans `CE_ingestion_registry_v1`) |
| `date` | Date de l'état patrimonial · extraite du contenu per EP-RC2 (LOT-P2-1) |
| `contexte` | Structure SNAPSHOT (voir ci-dessous) |

**Champs transversaux** :

```
session:    string (UUID v4) — snapshotId partagé avec toutes les POSITION de ce snapshot
ingestedAt: ISO 8601 — horodatage d'écriture dans CE_canonical_corpus_v1
```

**Structure du contexte SNAPSHOT** :

```
contexte: {
  traceType: "snapshot",
  snapshotSummary: {
    assetCount:    number,    // actifs distincts dans ce snapshot
    positionCount: number     // positions distinctes (>= assetCount si multi-localisation)
  },
  sourceRef: {
    label:      string,       // nom lisible de la source
    sourceType: string        // "file" | "api" | "manual"
  },
  importRef: {
    sourceId:   string,       // identifiant enregistré dans CE_ingestion_registry_v1
    importedAt: ISO 8601
  }
}
```

### §6.3 Structure de la trace POSITION S2

| Champ canonique | Valeur |
|---|---|
| `famille` | `S2` |
| `source` | Même sourceId que le SNAPSHOT parent |
| `date` | Même date que le SNAPSHOT parent |
| `contexte` | Structure POSITION (voir ci-dessous) |

**Champs transversaux** :

```
session:    string — même snapshotId que le SNAPSHOT parent (lien de parenté)
ingestedAt: ISO 8601
```

**Structure du contexte POSITION** :

```
contexte: {
  traceType: "position",
  asset: {
    assetId:          string,         // identifiant canonique (§5)
    symbol:           string,         // ticker canonique
    instrumentType:   string,         // enum (§5.2)
    definingProtocol: string | null,  // protocole définissant l'instrument
    name:             string | null,  // nom lisible (Phase B+)
    contractRef:      string | null,  // référence au contrat (Phase B+)
    attributes:       object | null   // propriétés type-spécifiques (Phase B+)
  },
  location: {
    custodyType: "custodial" | "non-custodial" | "protocol-locked" | "unknown",
    source:      string,              // nom de la source ("Binance", "personal-wallet", ...)
    network:     string,              // réseau de détention ("bitcoin" | "ethereum" |
                                      // "binance-custodial" | "bittensor" | "unknown" | ...)
    identifier:  string | null        // identifiant spécifique (adresse, compte, ...)
  },
  holdingForm: "liquid" | "staked" | "locked" | "in-pool" | "other",
  quantity: {
    net:  number,                     // quantité nette calculée depuis la source
    unit: string                      // "native-units" | "token-units" | "shares" | ...
  },
  positionMeta: {
    firstObservedAt: ISO 8601 | null, // première observation dans la source
    lastObservedAt:  ISO 8601 | null, // dernière observation dans la source
    operationCount:  number | null    // nombre d'opérations impliquant cet actif
  }
}
```

### §6.4 Session S2 (DT-4)

**Session S2 = `snapshotId`** : un UUID v4 généré à l'ouverture de chaque opération d'ingestion S2.

Ce `snapshotId` est partagé entre la trace SNAPSHOT et toutes les traces POSITION dérivées de cette opération.

**Invariant** : aucune trace POSITION S2 ne peut exister sans une trace SNAPSHOT portant le même `session`. L'écriture du SNAPSHOT précède toujours l'écriture des POSITIONS.

### §6.5 Distinction par contexte.traceType (DT-5)

Le champ `contexte.traceType` distingue les deux types de traces S2 sans modifier le modèle canonique à 4 champs (LOT-P1-2.1 CLOS) :

| `contexte.traceType` | Type | Rôle |
|---|---|---|
| `"snapshot"` | Trace SNAPSHOT | Ancre temporelle · métadonnées d'import · résumé de l'état |
| `"position"` | Trace POSITION | État d'un actif canonique dans un lieu de détention spécifique |

Toute couche de lecture S2 distingue les deux types par `contexte.traceType`.

---

## §7 Règles de dérivation et classification S2

### §7.1 Frontière événement / état patrimonial (DT-1)

Un événement source et un état patrimonial sont deux réalités distinctes. Le corpus canonique S2 ne contient que des **états patrimoniaux dérivés**. Les événements sources ne deviennent jamais des traces S2.

**Pipeline de dérivation** :

```
ÉVÉNEMENTS SOURCE
(opérations, transactions, lignes de fichier, réponses API...)
  ↓
[CLASSIFICATION selon la nature canonique de chaque événement — responsabilité adaptateur]
  ↓
[RECONSTRUCTION de l'état patrimonial — accumulation par actif et par lieu]
  ↓
ÉTAT PATRIMONIAL S2
→ trace SNAPSHOT + traces POSITION dans CE_canonical_corpus_v1
```

Cette règle est source-agnostique. Elle s'applique à un fichier Wallet History, à une réponse API blockchain, à une saisie manuelle, ou à toute source future.

### §7.2 Algorithme de dérivation générique

```
ENTRÉE  : flux d'événements E₁, E₂, ..., Eₙ classifiés par l'adaptateur
SORTIE  : ensemble de POSITIONS { (assetId, location, holdingForm, quantityNet) }

POUR CHAQUE événement Eᵢ :
  1. identifier_actif(Eᵢ)    → assetId canonique (§5)
  2. extraire_lieu(Eᵢ)        → location { custodyType, source, network, identifier }
  3. classifier_forme(Eᵢ)     → holdingForm
  4. accumuler :
       positions[(assetId, location, holdingForm)].net += Eᵢ.montant_signé

POUR CHAQUE position accumulée :
  5. Construire la trace POSITION S2 (§6.3) avec positionMeta
  6. Résoudre l'état de date per EP-RC2 (LOT-P2-1)

CONSTRUIRE la trace SNAPSHOT S2 (§6.2) :
  snapshotSummary.assetCount    = nombre d'assetId distincts
  snapshotSummary.positionCount = nombre de paires (assetId, location) distinctes
```

Cet algorithme est indépendant de la source. L'adaptateur (Programme P3) est responsable des étapes 1, 2 et 3 — la classification, l'identification de l'actif et l'extraction du lieu.

### §7.3 Règle RF-S2 : classification S2

**Une donnée appartient à la famille S2 si et seulement si** elle représente l'état de composition patrimoniale d'un opérateur à un instant donné (DI4 — LOT-P2-1).

| Type de donnée | Classification |
|---|---|
| Composition de portefeuille à un instant T | S2 |
| Inventaire d'actifs détenus (soldes, positions) | S2 |
| État de staking dans un protocole (position dérivée) | S2 |
| Trade exécuté / ordre FILLED | S1 (LOT-P2-2) |
| Événement ponctuel d'échange | S1 |
| Image ou donnée visuelle de marché | S3 (futur) |
| Donnée personnelle comportementale | S4 (futur) |

### §7.4 Frontière S1 / S2 pour les sources hybrides

Certaines sources contiennent des données relevant à la fois de S1 et de S2. La frontière s'applique donnée par donnée (FB-F5 — LOT-P2-1), pas par fichier.

**Règle pour les sources de type Wallet History** :

Les lignes d'opérations (dépôts, retraits, frais, revenus de staking) sont les **événements sources** qui alimentent la dérivation S2. Elles ne constituent pas des traces S2 individuelles. L'**état dérivé** (quantité nette par actif par lieu de détention) constitue les traces S2. Si certaines lignes représentent des événements d'échange classifiables S1, l'adaptateur les traite séparément — hors périmètre Phase A de LOT-P2-3.

---

## §8 Contrat de persistance S2

### §8.1 Source de vérité canonique

La source de vérité unique pour les données S2 de Caméléon Engine est **`CE_canonical_corpus_v1`** via `canonical-store.js`.

Aucune autre structure de stockage ne peut constituer une source de vérité patrimoniale concurrente. Un cache, une projection ou un état UI dérivé peut coexister, mais ne remplace jamais le corpus canonique.

### §8.2 Séquence d'écriture S2

```
1. Vérification registre : la source est-elle enregistrée dans CE_ingestion_registry_v1 ?
   → OUI : import bloqué · aucune trace écrite · rapport result = "blocked"
   → NON : continuer

2. Génération du snapshotId (UUID v4)

3. Écriture de la trace SNAPSHOT S2
   via writeIngestedTrace(snapshotEntry) dans canonical-store.js

4. Pour chaque position dérivée :
   Écriture de la trace POSITION S2
   via writeIngestedTrace(positionEntry)
   (même session = snapshotId · même date · même source)

5. Enregistrement de la source dans CE_ingestion_registry_v1

6. Génération du rapport de session S2
```

**Règle d'atomicité** : si l'écriture du SNAPSHOT échoue, aucune POSITION n'est écrite. Si l'écriture d'une POSITION échoue après que le SNAPSHOT est écrit, le rapport de session documente les positions écrites et celles ayant échoué. L'état partiel est signalé mais pas automatiquement résolu — la relance est possible si la déduplication le permet.

### §8.3 Registre d'ingestion S2

Le registre `CE_ingestion_registry_v1` (DT-2 — LOT-P2-2) est réutilisé pour S2.

Chaque source S2 ingérée est enregistrée par son `sourceId`. Une source déjà enregistrée déclenche un blocage avant toute écriture canonique.

Le `sourceId` pour S2 Phase A = empreinte du fichier source (analogue à LOT-P2-2 DT-2). Sa méthode de calcul est définie par l'adaptateur (Programme P3).

### §8.4 Rapport de session S2

| Champ | Description |
|---|---|
| `sessionId` | snapshotId (UUID v4) |
| `sourceId` | Identifiant de la source ingérée |
| `snapshotWritten` | Booléen — trace SNAPSHOT créée |
| `positionsTotal` | Nombre total de positions dérivées |
| `positionsWritten` | Nombre de traces POSITION écrites avec succès |
| `positionsFailed` | Nombre de traces POSITION en échec |
| `assetsDistinct` | Nombre d'actifs canoniques distincts (assetId uniques) |
| `dateState` | État de la date per EP-RC2 (ISO 8601 / R1 / R3 / R4) |
| `result` | `"success"` · `"partial"` · `"blocked"` · `"failed"` |

### §8.5 Statut de CE_portfolio_v1__{uuid} (DT-6)

La structure `CE_portfolio_v1__{uuid}` définie dans `portfolio-v1-impl.md` ne constitue pas une source de vérité S2.

Elle peut subsister comme cache de présentation UI, projection ou vue matérialisée dérivée du corpus canonique. Elle ne peut jamais devenir une source canonique concurrente si les mêmes données existent dans `CE_canonical_corpus_v1`. La décision de maintenir ou supprimer cette structure appartient au futur Programme P3 S2.

---

## §9 Périmètre Phase A et contrat adaptateur

### §9.1 Source admise Phase A

Phase A admet une seule source S2 : **le fichier Binance Wallet History au format CSV**.

| Propriété | Valeur Phase A |
|---|---|
| Source | Binance Wallet History |
| Format | CSV |
| Mode d'ingestion | Import fichier local |
| `custodyType` | `"custodial"` |
| `location.source` | `"Binance"` |
| `location.network` | `"binance-custodial"` |

Cette délimitation borne la Phase A sans contaminer le canon S2 de règles Binance-spécifiques. Le canon reste valide pour tout autre source future.

### §9.2 Contrat générique de l'adaptateur S2

Tout adaptateur S2 (Phase A ou suivantes) doit implémenter les **6 capacités** suivantes :

| Capacité | Description |
|---|---|
| `famille` | Retourner la famille mémorielle : `"S2"` |
| `canHandle(descriptor)` | Retourner `true` si la source est traitable par cet adaptateur |
| `getSourceId(descriptor)` | Retourner l'identifiant unique et stable de la source (pour le registre) |
| `fingerprint(descriptor)` | Calculer l'empreinte de la source (pour la déduplication) |
| `extractEvents(descriptor)` | Extraire les événements bruts depuis la source |
| `deriveState(events)` | Dériver l'état patrimonial depuis les événements — retourner `{ snapshot, positions }` conforme aux modèles §6.2 et §6.3 |

**Invariant** : le Core S2 (Programme P3) ne connaît aucun format, aucune plateforme, aucun schéma de champ. Il invoque les 6 capacités de l'adaptateur et orchestre l'écriture canonique. L'adaptateur ne contrôle jamais la séquence d'ingestion.

La capacité `deriveState(events)` remplace la capacité `processEvent` de LOT-P2-2 : S2 dérive un état global depuis l'ensemble des événements, pas un traitement événement par événement.

### §9.3 Exclusions Phase A

| Élément exclu | Raison |
|---|---|
| API blockchain (Etherscan, Alchemy, etc.) | I-01 — local-first |
| Valorisation en EUR / USDT / BTC | Hors périmètre S2 · contraire à la doctrine Caméléon Engine |
| Binance Wallet History PDF | Format non validé Phase A |
| Wallet History d'autres exchanges | Sources non validées Phase A |
| Saisie manuelle d'actifs | Différé Phase B+ |
| Wallets non-custodiaux (on-chain) | Phase B+ |
| Réconciliation multi-imports (solde cumulatif global) | Chaque snapshot est autonome en Phase A |
| Gestion des revenus de staking comme traces S1 | Ambiguïté S1/S2 différée — en Phase A, tout est dérivé en état S2 |
| Toute source absente de §9.1 | Rejet immédiat (RF-R6 étendu à S2) |

### §9.4 Ce que le Programme P3 S2 devra implémenter

1. Le **Core S2** : orchestrateur générique invoquant les 6 capacités adaptateur, séquençant l'ingestion (vérification registre → dérivation → écriture → rapport).
2. L'**adaptateur Binance Wallet History Phase A** : implémente les 6 capacités pour le CSV Wallet History Binance · mapping curé des actifs bien connus · gestion des colonnes (UTC_Time, Operation, Coin, Change).
3. L'**interface de déclenchement S2** : point d'entrée opérateur distinct de l'interface S1 (onglet Mémoire — analogue à LOT-P2-2 DT-4).
4. La **validation terrain** : protocole de validation sur fichiers Binance Wallet History réels, conformément à la méthodologie de validation terrain V1.

---

## §10 Relation avec les documents portfolio-v1 (DT-2)

Les documents `docs/architecture/portfolio-v1-scope.md` et `docs/architecture/portfolio-v1-impl.md` (2026-06-07) sont des **références historiques** conservées. Ils ne sont pas supprimés.

| Contenu | Statut |
|---|---|
| Décision D1 : valorisation déclarative à l'import, aucune API | Valide — intégrée dans les exclusions §9.3 |
| Décision D3 : un snapshot par import | Valide — intégrée dans l'architecture §6.1 |
| Analyse des dépendances et flux (§6 portfolio-v1-scope.md) | Valide comme référence historique |
| Décisions architecturales D2, D7, D8 de portfolio-v1-impl.md | Valide dans leur esprit · périmètre Phase A intégré en §9 · détails d'implémentation déférés à Programme P3 S2 |
| Définition d'un actif patrimonial | Absorbé — remplacé par §4 et §5 du présent document |
| Structure du snapshot comme état patrimonial | Absorbé — remplacé par les modèles SNAPSHOT / POSITION §6 |
| Classification major / stablecoin / altcoin comme propriété canonique de l'actif | Historique et supersédé — remplacé par `instrumentType` + `definingProtocol` |
| `CE_portfolio_v1__{uuid}` comme source de vérité patrimoniale | Contradictoire avec DT-3 — statut redéfini en §8.5 |
| Décision D5 : "uniquement Binance Wallet History en V1" | Historique — le canon est générique · seul §9.1 borne Phase A |
| Embedding dans le module behavior | Historique — l'ingestion S2 appartient au module d'ingestion canonique |

LOT-P2-3 devient la source canonique pour le contrat S2. Le futur Programme P3 S2 deviendra la source canonique pour l'implémentation, supersédant `portfolio-v1-impl.md`.

---

## §11 Stratégie de développement

### §11.1 Séquençage des micro-lots

LOT-P2-3 est un lot de doctrine pure. Ses quatre micro-lots correspondent aux grandes sections du présent document. Aucune implémentation, aucune validation terrain.

| Micro-lot | Sections correspondantes | Mission |
|---|---|---|
| **P2-3.A** — Ontologie patrimoniale | §4 · §5 | Définir les trois entités ACTIF / POSITION / LIEU · résoudre DT-7 · définir l'identité canonique d'actif (assetId · propriétés · génération) |
| **P2-3.B** — Règles de dérivation et classification | §7 | Formaliser la frontière événement / état · algorithme générique de dérivation · RF-S2 · frontière S1/S2 pour sources hybrides |
| **P2-3.C** — Contrat de persistance | §8 | Définir la séquence d'écriture S2 · registre d'ingestion · rapport de session · statut CE_portfolio_v1__{uuid} |
| **P2-3.D** — Périmètre Phase A et contrat adaptateur | §9 | Délimiter Phase A · formaliser le contrat adaptateur 6 capacités · exclusions · mission Programme P3 S2 |

### §11.2 Validation du lot

La validation de LOT-P2-3 est documentaire. Les critères CV-1 à CV-9 (§14) sont satisfaits par la rédaction complète et la cohérence du présent document.

Il n'existe pas de micro-lot de validation terrain pour un lot de doctrine pure.

---

## §12 Invariants

| Invariant | Règle |
|---|---|
| I-S2-1 | La source de vérité unique pour les données S2 est `CE_canonical_corpus_v1`. |
| I-S2-2 | Les sources s'adaptent au canon. Le canon ne s'adapte jamais structurellement à une source particulière. |
| I-S2-3 | `assetId` identifie l'instrument financier, pas sa localisation. Deux holdings du même instrument dans des lieux différents partagent le même `assetId`. |
| I-S2-4 | Les événements sources ne sont jamais des traces S2. Seul l'état patrimonial dérivé est écrit dans `CE_canonical_corpus_v1`. |
| I-S2-5 | La trace SNAPSHOT est écrite avant toute trace POSITION. Aucune trace POSITION ne peut exister sans son SNAPSHOT associé (même `session` = `snapshotId`). |
| I-S2-6 | Aucun appel à une API externe n'est admis en Phase A. Le principe local-first I-01 s'applique à S2 sans exception. |
| I-S2-7 | Aucune valorisation en devise (EUR, USDT, USD...) n'est produite par le schéma S2. La quantité est déclarative. |
| I-S2-8 | Deux instruments définis par des protocoles différents sont des actifs canoniques distincts, même s'ils partagent le même symbole. |
| I-S2-9 | Le réseau de détention est une propriété de la POSITION (`location.network`), pas de l'ACTIF. BTC custodial et BTC on-chain sont le même actif canonique. |
| I-S2-10 | Le Core S2 (Programme P3) ne contient aucune règle spécifique à une source particulière. |

---

## §13 Décisions tranchées

| ID | Question | Décision | Source |
|---|---|---|---|
| DT-1 | Les événements sources deviennent-ils des traces S2 ? | NON — seul l'état patrimonial dérivé est écrit. Les événements sont le matériau de dérivation. | Décision opérateur 2026-08-10 (DS-C1) |
| DT-2 | Relation avec portfolio-v1-scope.md / portfolio-v1-impl.md | Absorption progressive — documents conservés comme références historiques · LOT-P2-3 devient source canonique du contrat S2 · Programme P3 S2 devient source canonique de l'implémentation | Décision opérateur 2026-08-10 (DS-P1) |
| DT-3 | Source de vérité S2 | `CE_canonical_corpus_v1` via `writeIngestedTrace` · aucune structure concurrente | Décision opérateur 2026-08-10 |
| DT-4 | Définition de la session S2 | `session` = `snapshotId` (UUID v4) · partagé entre trace SNAPSHOT et toutes les traces POSITION d'un même import | LOT-P2-3 §6.4 (DS-G1) |
| DT-5 | Distinction SNAPSHOT / POSITION | `contexte.traceType` = `"snapshot"` ou `"position"` · convention dans le champ libre · aucune modification de LOT-P1-2.1 | LOT-P2-3 §6.5 (DS-G2) |
| DT-6 | Sort de `CE_portfolio_v1__{uuid}` | Cache / projection / vue UI dérivée uniquement · jamais source de vérité canonique concurrente | LOT-P2-3 §8.5 (DS-A1) |
| DT-7 | Séparation ACTIF / POSITION / LIEU DE DÉTENTION | Trois entités distinctes · `assetId` = identité de l'instrument · `location` = lieu de détention dans la POSITION · un actif custodial et le même actif non-custodial partagent le même `assetId` | Décision opérateur 2026-08-10 (DS-ID1) |
| DT-8 | Multi-localisation du même actif | Deux positions du même actif dans deux lieux de détention distincts = deux traces POSITION avec le même `assetId` | LOT-P2-3 §4.3 (DS-Q1) |
| DT-9 | Granularité S2 | Deux niveaux : 1 trace SNAPSHOT + N traces POSITION par opération d'ingestion · toutes liées par `snapshotId` | LOT-P2-3 §6.1 |
| DT-10 | Périmètre Phase A | Source unique : Binance Wallet History CSV · local-first · aucune API externe | LOT-P2-3 §9.1 |

---

## §14 Critères de validation du lot

| CV | Critère | Condition de satisfaction |
|---|---|---|
| CV-1 | Ontologie patrimoniale résolue (DT-7) | Trois entités définies · propriétés séparées · cas canoniques §4.3 tranchés · frontières §4.4 couvertes |
| CV-2 | Identité canonique d'actif définie | `assetId` · `symbol` · `instrumentType` · `definingProtocol` définis · règles de génération §5.3 documentées · limites Phase A §5.4 couvertes |
| CV-3 | Modèle canonique de trace S2 complet | Structures SNAPSHOT et POSITION définies · champs obligatoires et optionnels spécifiés · contenu de `contexte` documenté |
| CV-4 | Session S2 et liaison SNAPSHOT / POSITION | `snapshotId` défini · règle d'ordre d'écriture · distinction par `contexte.traceType` |
| CV-5 | Règles de dérivation S2 documentées | Frontière événement / état formalisée · algorithme générique §7.2 · RF-S2 · frontière S1/S2 sources hybrides |
| CV-6 | Contrat de persistance défini | Séquence §8.2 · registre `CE_ingestion_registry_v1` · rapport de session §8.4 · statut `CE_portfolio_v1__{uuid}` |
| CV-7 | Périmètre Phase A borné | Source Binance Wallet History délimitée · contrat adaptateur 6 capacités · exclusions §9.3 exhaustives |
| CV-8 | Relation portfolio-v1 documentée | Tableau §10 : valide / absorbé / historique / contradictoire — rempli et justifié |
| CV-9 | Test de généralité PASS | Chaque règle du canon reste valide si Binance, Bittensor ou Ethereum disparaît |

---

## §15 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | Micro-lots P2-3.A à P2-3.D validés (§4→§9 du présent document complets et cohérents) |
| Condition 2 | CV-1 à CV-9 satisfaits |
| Condition 3 | Décisions DT-1 à DT-10 toutes documentées et non contradictoires |
| Condition 4 | Test de généralité PASS sur l'ensemble du canon S2 |
| Condition 5 | DQC V2 CAS A |
| Condition 6 | DQC V3 PASS |
| Condition 7 | Décision opérateur explicite de clôture |
