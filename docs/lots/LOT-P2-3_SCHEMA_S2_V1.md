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
| ETH liquide + ETH verrouillé en tant que validateur natif | MÊME ACTIF (ETH natif · `native-coin` · protocole ethereum) · deux positions · `holdingForm` distinct (`liquid` vs `staked`) |
| BTC sur Binance + BTC sur Kraken + BTC wallet personnel | MÊME ACTIF · trois positions · lieux de détention distincts (deux custodials · un non-custodial) |
| ETH wallet A + ETH wallet B (même réseau, adresses distinctes) | MÊME ACTIF · deux positions · même réseau (`ethereum`) · identifiants wallet distincts |
| USDC émis par Circle sur Ethereum + USDC émis par Circle sur Solana | MÊME ACTIF (même émetteur Circle) · deux positions · réseaux distincts |
| Token LP ETH/USDT Uniswap + ETH séparément | ACTIFS DISTINCTS — instrument composite (`lp-token`) distinct des actifs sous-jacents |

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

**Note sur le staking — distinction ontologique essentielle :**

Le staking via protocole tiers et le staking natif produisent deux résultats ontologiques distincts :

| Type de staking | Résultat ontologique |
|---|---|
| Staking via protocole tiers (ex. ETH via Lido → stETH) | L'actif original est transformé en un reçu de staking — instrument canoniquement distinct (`staked-receipt` · `definingProtocol` = `lido`). L'opérateur ne détient plus d'ETH, mais du stETH. Deux actifs distincts. |
| Staking natif (ex. ETH verrouillé comme validateur Ethereum) | L'actif reste ETH natif. La POSITION change de `holdingForm = "liquid"` à `holdingForm = "staked"`. Aucun nouvel actif canonique n'est créé. |

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
  definingProtocol  string   — protocole, entreprise ou DAO qui crée et contrôle l'instrument

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
| `staked-receipt` | Reçu de staking émis par un protocole tiers. Ne couvre pas le staking natif — l'opérateur qui stake nativement conserve l'actif d'origine avec `holdingForm = "staked"`. | stETH, rETH |
| `wrapped-asset` | Version encapsulée cross-chain d'un autre actif | WBTC, WETH |
| `lp-token` | Part de pool de liquidité | ETH/USDT LP Uniswap |
| `subnet-token` | Token représentant une exposition économique spécifique à un sous-réseau ou une sous-couche de protocole. Sémantique formelle différée Phase B+. | Alpha tokens Bittensor |
| `other` | Instrument non classifiable dans les catégories ci-dessus. Classification temporaire — à affiner lors d'une ingestion ultérieure ou du lot d'ingestion concerné. | — |

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

**Note sur `symbol_canonique`** : le symbole entrant dans la formule est le symbole normalisé par le mapping curé de l'adaptateur, non le symbole brut de la source. Les variantes de marché sont résolues en symbole canonique avant génération de l'`assetId` (exemples : XBT → BTC · MIOTA → IOTA). La responsabilité de normalisation appartient à l'adaptateur.

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

**Doctrine de l'identifiant provisoire** :

Trois règles gouvernent l'usage et la résolution des identifiants provisoires :

1. **Immutabilité** : les traces déjà écrites dans `CE_canonical_corpus_v1` avec un `assetId` provisoire ne sont jamais modifiées rétroactivement. L'historique reflète ce qui était connu au moment de l'ingestion.

2. **Résolution future** : lorsque l'identité canonique d'un actif provisoire est établie ultérieurement, un registre de résolution optionnel peut associer `assetId_provisoire → assetId_canonique`. La couche de lecture utilise ce registre pour afficher l'information canonique sans modifier la trace originale.

3. **Risque de collision** : deux actifs distincts partageant le même symbole source (mais des protocoles différents non encore identifiés) reçoivent le même `assetId` provisoire. Ce risque est inhérent à l'information incomplète. Il doit être signalé dans le rapport de session sous forme d'avertissement lorsque plusieurs actifs inconnus partagent le même symbole.

La conception du registre de résolution et la gestion du cycle de vie des identifiants provisoires sont une responsabilité du Programme P3 S2, pas du schéma S2.

**Rôle de `contractRef` dans la génération de `assetId`** :

- `location.network` est une propriété de la POSITION, jamais de l'ACTIF.
- Les attributs de custodie (custodial, non-custodial), wallet et compte sont des propriétés de la POSITION.
- `contractRef` décrit une représentation technique de l'instrument — il est un champ optionnel de l'ACTIF, pas un discriminant d'identité dans le schéma courant.
- Son rôle identitaire éventuel pour certains types d'instruments futurs reste différé aux lots Phase B+ concernés.
- `contractRef` ne participe pas à la formule de génération de `assetId` en Phase A.

### §5.4 Limites Phase A

En Phase A, la source Binance Wallet History ne fournit que le symbole de l'actif. Les champs `definingProtocol`, `contractRef` et `name` ne sont pas disponibles directement.

| Actif Phase A | Traitement |
|---|---|
| Actif présent dans le mapping curé de l'adaptateur | `assetId` canonique stable · champs connus peuplés |
| Actif inconnu | `assetId` provisoire · `instrumentType` = `"other"` · `definingProtocol` = `null` |
| Champs optionnels | `null` |

Cette limitation est une dette Phase A documentée. Elle n'affecte pas la stabilité du canon — le modèle est conçu pour Phase B+ dès maintenant.

### §5.5 Test sémantique minimal d'identité canonique

Le test suivant permet de déterminer si deux holdings représentent le même actif canonique, indépendamment de toute considération de localisation.

**Minimum sémantique de résolution canonique** :

Le tuple (`symbol_canonique` · `instrumentType` · `definingProtocol`) constitue le **minimum sémantique retenu par le schéma courant** pour résoudre l'identité canonique d'un actif.

| Propriété | Rôle dans l'identité |
|---|---|
| `symbol` | Symbole canonique de l'instrument |
| `instrumentType` | Catégorie économique de l'instrument |
| `definingProtocol` | Entité qui crée et contrôle l'instrument |

Une différence sémantiquement significative sur l'une de ces propriétés peut imposer des `assetId` distincts.

L'égalité du tuple permet la résolution vers un même `assetId` selon le référentiel canonique courant. Elle ne constitue pas une preuve ontologique universelle que toutes les représentations futures possibles correspondent nécessairement au même instrument économique.

Les futurs lots d'ingestion peuvent identifier des discriminants supplémentaires sans remettre en cause l'ontologie ACTIF / POSITION / LIEU.

Le test s'applique indépendamment de :
- la localisation (réseau, custodien, adresse) — propriété de la POSITION
- la forme de détention (`holdingForm`) — propriété de la POSITION
- la quantité détenue — propriété de la POSITION
- la source ou la plateforme ayant rapporté l'actif — métadonnée d'ingestion

**Exemples :**

| Holding A | Holding B | Verdict | Raison |
|---|---|---|---|
| ETH (Binance) | ETH (Ledger) | MÊME ACTIF | `symbol` · `instrumentType` · `definingProtocol` identiques |
| USDT (Ethereum) | USDT (BSC) | MÊME ACTIF | `symbol` · `instrumentType` · `definingProtocol` identiques (émetteur Tether) |
| ETH liquide | ETH verrouillé (validator natif) | MÊME ACTIF | `symbol` · `instrumentType` · `definingProtocol` identiques — seul `holdingForm` diffère |
| ETH | stETH | ACTIFS DISTINCTS | `instrumentType` et `definingProtocol` différents |
| BTC | WBTC | ACTIFS DISTINCTS | `symbol` · `instrumentType` · `definingProtocol` différents |
| USDT | USDC | ACTIFS DISTINCTS | `symbol` et `definingProtocol` différents |

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
    definingProtocol: string | null,  // protocole, entreprise ou DAO définissant l'instrument (§5.2)
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

**Note sur la classification dans le pipeline** : la classification mentionnée ci-dessus désigne la nature sémantique de l'événement source (achat, dépôt, frais, reward...) — responsabilité de l'adaptateur, documentée en §7.5. Elle est distincte de la règle RF-S2 (§7.3) qui qualifie l'appartenance à la famille mémorielle S2.

### §7.2 Algorithme de dérivation générique

```
ENTRÉE  : flux d'événements E₁, E₂, ..., Eₙ classifiés par l'adaptateur (§7.5)
           — ordre chronologique obligatoire
SORTIE  : ensemble de POSITIONS { (assetId, location, holdingForm, quantityNet,
                                    derivationStatus) }
          + liste d'anomalies transmise au rapport de session S2 (§8.4)

INITIALISATION :
  positions = {}    — accumulateur indexé par (assetId, location, holdingForm)
  anomalies = []    — événements non classifiables, incohérences détectées

POUR CHAQUE événement Eᵢ dans l'ordre chronologique :

  1. SI Eᵢ n'est pas classifiable par l'adaptateur selon §7.5 :
       Ajouter Eᵢ à anomalies
       CONTINUER — Eᵢ ne contribue pas à l'accumulation

  2. Décomposer Eᵢ en N sous-opérations { s₁, ..., sₙ } — N ≥ 1
       Chaque sⱼ = (assetId, location, holdingForm, Δqty)
       N = 1 pour : dépôt · retrait · reward · fee · burn · mint · airdrop
       N = 2 pour : swap (deux actifs distincts)
                  · staking natif (même actif · même lieu · deux holdingForm distincts)
                  · lock/unlock (même actif · même lieu · deux holdingForm distincts)
                  · transfert interne (même actif · deux locations distinctes observées)

  3. POUR CHAQUE sous-opération sⱼ :
       clé = (sⱼ.assetId, sⱼ.location, sⱼ.holdingForm)
       positions[clé].qty += sⱼ.Δqty

APRÈS ACCUMULATION :

  4. Résoudre l'état de date global per EP-RC2 (LOT-P2-1)

  5. POUR CHAQUE position p :
       SI anomalies associées à p.assetId contiennent AN-06 ou AN-07 :
         p.derivationStatus = "error_detected"
         — position écrite mais marquée non exploitable
       SINON SI p.qty < 0 :
         p.derivationStatus = "incomplete_history"
       SINON SI anomalies contient au moins un événement associé à p.assetId :
         p.derivationStatus = "partial"
       SINON :
         p.derivationStatus = "complete"
       — Note : le statut "direct_snapshot" est attribué par le chemin §7.8 uniquement,
         jamais par cet algorithme (modes mutuellement exclusifs — I-B-07)

  6. Construire chaque trace POSITION S2 (§6.3) avec positionMeta et derivationStatus

CONSTRUIRE la trace SNAPSHOT S2 (§6.2) :
  snapshotSummary.assetCount    = nombre d'assetId distincts
  snapshotSummary.positionCount = nombre de paires (assetId, location) distinctes
  Inclure résumé des anomalies dans le rapport de session (§8.4)
```

Cet algorithme est indépendant de la source. L'adaptateur (Programme P3) est responsable de la classification des événements selon §7.5 (étape 1) et de la décomposition en sous-opérations (étape 2). Le Core S2 est responsable de l'accumulation (étape 3) et de la qualification du statut de dérivation (étape 5).

**Invariant d'ordre** : l'accumulation doit respecter l'ordre chronologique des événements sources. Un ordre non déterminé entre deux événements de même horodatage doit être signalé comme anomalie.

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

### §7.5 Classification des types d'événements sources

La classification des événements sources est une responsabilité de l'adaptateur. Elle est opérée avant l'accumulation et conditionne la décomposition en sous-opérations (§7.2 étape 2).

**Tableau canonique des types d'événements S2** :

| Code | Nom canonique | N sous-op. | Δqty actif principal | Impact secondaire |
|---|---|---|---|---|
| EV-01 | deposit | 1 | + (réception) | — |
| EV-02 | withdrawal | 1 | − (sortie) | — |
| EV-03 | fee | 1 | − (coût de transaction) | — |
| EV-04 | reward_staking | 1 | + (revenu de staking) | — |
| EV-05 | reward_lending | 1 | + (intérêt reçu) | — |
| EV-06 | reward_cashback | 1 | + (remise reçue) | — |
| EV-07 | reward_airdrop | 1 | + (token reçu gratuitement) | — |
| EV-08 | mint | 1 | + (création d'actif) | — |
| EV-09 | burn | 1 | − (destruction d'actif) | — |
| EV-10 | swap_out | 2 | − (actif vendu) | + actif reçu (EV-11) |
| EV-11 | swap_in | 2 | + (actif reçu) | − actif vendu (EV-10) |
| EV-12 | stake_lock | 2 | − (spot → staked, même lieu) | + holdingForm staked |
| EV-13 | stake_unlock | 2 | − (staked → spot, même lieu) | + holdingForm spot |
| EV-14 | lock | 2 | − (spot → locked, même lieu) | + holdingForm locked |
| EV-15 | unlock | 2 | − (locked → spot, même lieu) | + holdingForm spot |
| EV-16 | transfer_out | 1 ou 2 | − (départ d'un lieu) | + si leg entrant observé |
| EV-17 | transfer_in | 1 ou 2 | + (arrivée dans un lieu) | − si leg sortant observé |
| EV-18 | distribution | 1 | + (distribution reçue) | — |
| EV-19 | correction_positive | 1 | + (ajustement correctif) | — |
| EV-20 | correction_negative | 1 | − (ajustement correctif) | — |
| EV-21 | balance_snapshot | direct | état direct (§7.8) | aucune accumulation |
| EV-22 | unclassified | 0 | → anomalie (§7.2 étape 1) | — |

**Règles de classification** :

- Un événement source peut se mapper sur un seul code EV-xx. En cas d'ambiguïté, l'adaptateur choisit le code le plus spécifique.
- EV-10 et EV-11 apparaissent toujours en paire pour un même événement source. Un swap avec un seul leg observé est traité comme EV-01 ou EV-02 avec anomalie.
- EV-16 et EV-17 : si les deux legs du transfert sont observés dans les données sources, ils génèrent chacun une sous-opération compensée (N=2). Si un seul leg est visible, N=1 et le leg manquant est absent (doctrine transfert — §7.7).
- EV-21 (balance_snapshot) déclenche le chemin de dérivation directe (§7.8), non l'accumulation.
- EV-22 déclenche l'enregistrement en anomalie sans contribution à l'accumulation.

**Périmètre Phase A** : les types actifs en Phase A (source Binance Wallet History) sont EV-01, EV-02, EV-03, EV-04, EV-07, EV-08, EV-09, EV-10, EV-11, EV-12, EV-13, EV-16, EV-17, EV-18. Les types EV-05, EV-06, EV-14, EV-15, EV-19, EV-20, EV-21 sont réservés aux adaptateurs futurs (Phase B+).

---

### §7.6 Algèbre des variations de POSITION

Une POSITION est caractérisée par le triplet `(assetId, location, holdingForm)`. Trois classes de variation sont possibles :

| Classe | Définition | Exemple |
|---|---|---|
| Δqty | Variation de quantité sur un triplet stable | Dépôt, retrait, reward, fee |
| ΔholdingForm | Même actif, même lieu, holdingForm différent | Staking natif : spot → staked (EV-12) |
| Δlocation | Même actif, location différente | Transfert inter-exchanges (EV-16/EV-17) |

**Règles de l'algèbre** :

- Δqty : accumulation directe sur le triplet. Pas de création de nouvelle POSITION si le triplet existe déjà.
- ΔholdingForm : génère deux sous-opérations sur le même `(assetId, location)` — une décrémentation sur l'ancien holdingForm, une incrémentation sur le nouveau.
- Δlocation : génère deux sous-opérations sur le même `(assetId, holdingForm)` — une décrémentation sur l'ancienne location, une incrémentation sur la nouvelle. Soumis à la doctrine de transfert (§7.7).
- Une variation peut combiner Δqty et ΔholdingForm (ex. : staking avec frais intégrés), mais jamais Δlocation et ΔholdingForm simultanément dans le schéma courant Phase A.

---

### §7.7 Doctrine du transfert — prévention du double comptage

Un transfert d'actif entre deux lieux de détention génère un risque de double comptage si les deux legs (sortie + entrée) sont visibles dans les données sources.

**Cinq situations de transfert** :

| Situation | Legs observés | Traitement |
|---|---|---|
| T-1 : transfert interne complet | EV-16 + EV-17 pour le même événement | N=2 : Δqty(−) sur location_source + Δqty(+) sur location_dest — conservation nette |
| T-2 : leg sortant seul | EV-16 uniquement | N=1 : Δqty(−) sur location_source — leg entrant absent |
| T-3 : leg entrant seul | EV-17 uniquement | N=1 : Δqty(+) sur location_dest — leg sortant absent |
| T-4 : transfert vers wallet externe non suivi | EV-16, destination inconnue | N=1 : Δqty(−) — la destination n'est pas dans le périmètre |
| T-5 : transfert depuis source non suivie | EV-17, origine inconnue | N=1 : Δqty(+) — l'origine n'est pas dans le périmètre |

**Règle de prévention du double comptage** : si EV-16 et EV-17 correspondent au même événement source (même montant, même actif, même horodatage ou référence partagée), ils forment un transfert T-1. Les deux sous-opérations compensées garantissent que la quantité totale de l'actif est conservée. Un adaptateur ne doit jamais compter un transfert interne comme deux événements indépendants.

**Règle d'asymétrie conservatrice** : en cas de doute sur l'appariement (deux événements potentiellement liés mais sans preuve), traiter chacun comme N=1 indépendant (situations T-2 + T-3). L'état résultant sera surestimé, ce qui est préférable à une perte silencieuse. Le `derivationStatus` des positions concernées sera `partial`.

---

### §7.8 État patrimonial direct vs état reconstruit

Deux modes de dérivation de l'état patrimonial S2 sont possibles :

| Mode | Déclencheur | Mécanisme |
|---|---|---|
| Reconstruction par accumulation | Flux d'événements classifiés (EV-01→EV-20) | Algorithme §7.2 — accumulation chronologique des Δqty |
| Snapshot direct | Source contenant un bilan explicite (EV-21) | Lecture directe des soldes déclarés — aucune accumulation |

**Doctrine de préférence** :

- Si la source contient un bilan explicite (soldes déclarés à un instant T), le mode snapshot direct est préféré.
- Si la source contient uniquement un flux d'opérations, la reconstruction par accumulation est obligatoire.
- Les deux modes ne se mélangent pas dans une même session S2. Une session utilise l'un ou l'autre.

**Statut de dérivation associé** :

- Snapshot direct → `derivationStatus = "direct_snapshot"` — la quantité est déclarée, non calculée.
- Accumulation complète → `derivationStatus = "complete"` ou `"partial"` selon les anomalies (§7.12).

---

### §7.9 Doctrine de temporalité

La temporalité de la dérivation S2 obéit aux règles suivantes :

| Règle | Énoncé |
|---|---|
| TB-1 | L'accumulation suit l'ordre chronologique des événements sources. Un ordre non déterminé est une anomalie. |
| TB-2 | La date retenue pour chaque trace POSITION est la date de l'événement source le plus récent contribuant à la position, résolue per EP-RC2 (LOT-P2-1). |
| TB-3 | La date du SNAPSHOT est la date de l'événement source le plus récent de toute la session. |
| TB-4 | Deux événements de même horodatage sont traités dans l'ordre de leur apparition dans la source. L'adaptateur doit garantir un ordre stable (non arbitraire). |
| TB-5 | L'historique partiel (données disponibles seulement à partir de T₀) ne constitue pas une erreur. Il est documenté par le `derivationStatus` de la position (§7.12). |
| TB-6 | Aucune interpolation temporelle n'est autorisée. Une quantité inconnue à un instant reste inconnue. |

---

### §7.10 Historique partiel et état d'ouverture inconnu

Quand les données disponibles ne couvrent pas l'intégralité de l'historique d'un actif, quatre situations sont possibles :

| Situation | Caractéristique | Traitement |
|---|---|---|
| H-1 : historique complet | Tous les événements depuis la création du compte sont disponibles | Accumulation normale — `derivationStatus = "complete"` si aucune anomalie |
| H-2 : historique partiel connu | Les données débutent à T₀ > T_création, et T₀ est connu et déclaré | Accumulation depuis T₀ — `derivationStatus = "partial"` — état d'ouverture inconnu explicitement déclaré |
| H-3 : historique partiel non borné | Les données débutent à T₀ inconnu (premier événement disponible) | Accumulation depuis le premier événement — `derivationStatus = "incomplete_history"` |
| H-4 : solde négatif après accumulation | qty < 0 pour une POSITION après accumulation complète | Signal d'historique incomplet ou d'anomalie source — `derivationStatus = "incomplete_history"` |

**Règle fondamentale** : l'état d'ouverture d'une POSITION n'est JAMAIS supposé être zéro en l'absence d'information. L'absence de données = état inconnu, non état nul. Un `derivationStatus = "incomplete_history"` est préférable à une hypothèse silencieuse.

---

### §7.11 Quantités impossibles et taxonomie des anomalies de dérivation

Une anomalie de dérivation est tout résultat qui ne peut pas représenter un état patrimonial réel. La liste suivante est exhaustive pour Phase A :

| Code | Type | Déclencheur | Traitement |
|---|---|---|---|
| AN-01 | Quantité négative | qty < 0 après accumulation | `derivationStatus = "incomplete_history"` · position conservée avec qty signée |
| AN-02 | Événement non classifiable | L'adaptateur ne reconnaît pas le type d'opération | Enregistré en anomalies · ignoré dans l'accumulation |
| AN-03 | Ordre temporel indéterminé | Deux événements de même horodatage sans ordre stable | Signal dans le rapport · ordre arbitraire appliqué |
| AN-04 | Swap asymétrique | EV-10 sans EV-11 correspondant (ou inverse) | Traité comme EV-01 ou EV-02 selon sens · anomalie signalée |
| AN-05 | Transfert non apparié | EV-16 et EV-17 potentiellement liés mais non confirmés | Traités indépendamment (doctrine conservatrice §7.7) · anomalie signalée |
| AN-06 | assetId non résolvable | L'adaptateur ne peut pas déterminer `symbol_canonique`, `instrumentType` ou `definingProtocol` | Événement enregistré en anomalie · ignoré dans l'accumulation |
| AN-07 | Valeur source illisible | Quantité absente, mal formée ou non parseable | Événement enregistré en anomalie · ignoré dans l'accumulation |
| AN-08 | Date non résolvable | EP-RC2 retourne état R1 (absent) ou R3 (non-conformant) sans fallback | Date signalée comme inconnue · position marquée `partial` |

Toutes les anomalies sont transmises au rapport de session S2 (§8.4) pour traçabilité opérateur.

---

### §7.12 Statut de dérivation — `derivationStatus`

Le champ `derivationStatus` est un qualificatif ordinal de la confiance dans la valeur de la POSITION dérivée. Il est calculé après accumulation selon les règles de §7.2.

| Valeur | Signification | Condition de déclenchement |
|---|---|---|
| `complete` | Dérivation complète sans anomalie | Aucune anomalie · qty ≥ 0 · historique supposé complet |
| `partial` | Dérivation effectuée avec anomalies non bloquantes | Au moins une anomalie AN-02, AN-03, AN-04, AN-05 ou AN-08 associée à l'actif · qty ≥ 0 |
| `incomplete_history` | Historique insuffisant pour garantir l'état | qty < 0 (AN-01) · ou H-3 déclaré · ou solde d'ouverture inconnu significatif |
| `direct_snapshot` | État déclaré directement par la source | Source EV-21 (bilan explicite) — aucune accumulation |
| `error_detected` | Anomalie bloquante détectée | AN-06 ou AN-07 rend la position non fiable — position écrite mais marquée non exploitable |

**Règle de propagation** : le `derivationStatus` le plus défavorable parmi toutes les POSITION d'une session est inclus dans le résumé du SNAPSHOT (`snapshotSummary`). L'ordre de sévérité croissant est : `complete` < `direct_snapshot` < `partial` < `incomplete_history` < `error_detected`.

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

**Distinctions contractuelles** :

- **Opération d'ingestion S2** : unité logique de persistance associée à une source et à un snapshotId. Elle s'ouvre lors de la première tentative et reste ouverte jusqu'à réussite complète de la persistance attendue (`result = "success"`) ou abandon explicite.
- **Tentative de persistance** : exécution technique — initiale ou de reprise — effectuée à l'intérieur d'une même opération d'ingestion S2.

**Relation** : 1 opération d'ingestion S2 → 1 snapshotId → 1..n tentatives de persistance.

**Règle d'atomicité** : si l'écriture du SNAPSHOT échoue lors d'une tentative, aucune POSITION n'est écrite et la source n'est pas enregistrée dans `CE_ingestion_registry_v1`. Si l'écriture d'une ou plusieurs POSITION échoue après que le SNAPSHOT est écrit, la session est en état `partial` — la source n'est pas enregistrée dans le registre.

**Enregistrement conditionnel** : l'étape 5 (enregistrement dans `CE_ingestion_registry_v1`) ne s'exécute que lorsque `result = "success"`. Une tentative en état `partial` ou `failed` ne finalise pas l'enregistrement dans le registre.

**Doctrine de relance** : une opération d'ingestion dont la source n'est pas enregistrée dans `CE_ingestion_registry_v1` peut faire l'objet d'une tentative de reprise. Cette reprise obéit aux comportements observables suivants :

- **Même opération, même snapshotId** : la reprise poursuit l'opération existante. Si un SNAPSHOT canonique existe déjà pour cette opération, aucun nouveau SNAPSHOT n'est créé — le snapshotId de la tentative initiale est réutilisé.
- **Aucune duplication canonique** : les traces S2 déjà présentes dans `CE_canonical_corpus_v1` pour cette opération ne sont pas écrites une seconde fois.
- **Conservation des écritures** : les traces POSITION déjà persistées lors d'une tentative précédente sont conservées sans modification.
- **Écriture ciblée** : seules les traces POSITION manquantes sont ajoutées lors de la reprise.
- **Finalisation conditionnelle** : l'enregistrement dans `CE_ingestion_registry_v1` n'est effectué qu'à l'issue d'une tentative dont `result = "success"`.

Le `snapshotSummary` de la trace SNAPSHOT (`assetCount`, `positionCount`) est issu du résultat de dérivation (§7.2) — il ne dépend pas du nombre de tentatives d'écriture. La trace SNAPSHOT existante n'est pas modifiée par une tentative de reprise.

Le mécanisme technique permettant à Programme P3 de détecter une opération partielle, de retrouver son snapshotId et d'identifier les traces déjà persistées est une responsabilité d'implémentation hors périmètre de LOT-P2-3.

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
| `anomalies` | Anomalies de dérivation détectées lors de la session · liste des occurrences AN-01→AN-08 rencontrées · liste vide si aucune anomalie · canal contractuel I-B-09 |
| `result` | `"success"` · `"partial"` · `"blocked"` · `"failed"` |

**Contrat I-B-09** : le champ `anomalies` est le canal opérateur contractuel unique pour les anomalies de dérivation AN-01→AN-08. Aucune anomalie détectée lors de la dérivation (§7.11) ne peut être absente de ce champ.

**Sémantique de `result`** :

| État de la séquence de persistance | `result` |
|---|---|
| Source déjà enregistrée dans `CE_ingestion_registry_v1` (étape 1 → OUI) | `"blocked"` |
| Écriture du SNAPSHOT échouée (étape 3 → échec) | `"failed"` |
| SNAPSHOT écrit · au moins une POSITION attendue non écrite (étape 4 → échec partiel) | `"partial"` |
| SNAPSHOT écrit · zéro POSITION dérivée conformément aux règles de §7 (positionsTotal = 0) | `"success"` |
| SNAPSHOT + toutes les POSITION attendues écrites avec succès | `"success"` |

### §8.5 Statut de CE_portfolio_v1__{uuid} (DT-6)

La structure `CE_portfolio_v1__{uuid}` définie dans `portfolio-v1-impl.md` ne constitue pas une source de vérité S2.

Elle peut subsister comme cache de présentation UI, projection ou vue matérialisée dérivée du corpus canonique. Elle ne peut jamais devenir une source de vérité canonique concurrente — sans exception. La décision de maintenir ou supprimer cette structure appartient au futur Programme P3 S2.

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

Tout adaptateur S2 (Phase A ou suivantes) doit exposer les **5 capacités** suivantes :

| Capacité | Description |
|---|---|
| `famille` | Retourner la famille mémorielle : `"S2"` |
| `canHandle(descriptor)` | Retourner `true` si la source est traitable par cet adaptateur |
| `getSourceId(descriptor)` | Retourner l'identifiant unique et stable de la source (pour le registre) |
| `fingerprint(descriptor)` | Calculer l'empreinte de la source (pour la déduplication) |
| `extractCanonicalInput(descriptor)` | Extraire les données de la source · les classifier selon §7.5 · les décomposer en sous-opérations canoniques (§7.2 étape 2) · résoudre les identités canoniques (§5.3) · normaliser les locations — retourner `{ mode, payload, anomalies }` |

**Contrat de `extractCanonicalInput`** :

- `mode` : `"accumulation"` si la source contient un flux d'opérations · `"direct_snapshot"` si la source contient un bilan explicite (EV-21 · §7.8). La détection du mode est une responsabilité de l'adaptateur.
- `payload` :
  - mode `"accumulation"` → sous-opérations canoniques : `{ assetId, location, holdingForm, Δqty, timestamp, eventType }` par sous-opération · ordre chronologique garanti (I-B-01)
  - mode `"direct_snapshot"` → balances canoniques déclarées : `{ assetId, location, holdingForm, quantity, timestamp }` par actif détenu
- `anomalies` : anomalies détectées avant la frontière Core — événement non classifiable (EV-22 · I-B-04 · AN-02) · identité non résolvable (AN-06) · valeur illisible (AN-07) · date non résolvable (AN-08) · conformément à §7.11 et I-B-09.

**Partition de responsabilité (§7.2 · P2-3.B VALIDÉ)** :

- **Adaptateur** : étapes 1 (classification §7.5) et 2 (décomposition §7.2) — exécutées en batch dans `extractCanonicalInput`. Les méthodes internes de l'adaptateur (extraction brute, classification unitaire, décomposition, résolution d'identité canonique) sont des détails d'implémentation hors contrat.
- **Core S2** : accumulation générique §7.2 étape 3 · résolution de date §7.2 étape 4 · qualification `derivationStatus` §7.2 étape 5 · construction des traces SNAPSHOT §6.2 et POSITION §6.3 · orchestration de la persistance §8.

Le Core choisit la branche de dérivation selon `mode` — valeur doctrinale (§7.8), jamais selon un identifiant de source, un format, une plateforme ou un schéma de champ.

**Invariant** : le Core S2 (Programme P3) ne connaît aucun format, aucune plateforme, aucun schéma de champ. Il invoque les 5 capacités de l'adaptateur et orchestre la dérivation et l'écriture canonique. L'adaptateur ne contrôle jamais la séquence d'ingestion.

**Mode `direct_snapshot` — Phase B+** : prévu architecturalement dans le contrat. Non actif en Phase A : EV-21 (`balance_snapshot`) est réservé aux adaptateurs Phase B+ (§7.5). Un adaptateur Phase A retourne toujours `mode : "accumulation"`.

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

1. Le **Core S2** : orchestrateur générique invoquant les 5 capacités adaptateur, séquençant l'ingestion (vérification registre → extraction canonique → accumulation ou lecture directe selon `mode` → qualification du statut → construction des traces → écriture → rapport).
2. L'**adaptateur Binance Wallet History Phase A** : implémente les 5 capacités pour le CSV Wallet History Binance · mapping curé des actifs bien connus.
3. L'**interface de déclenchement S2** : point d'entrée opérateur distinct de l'interface S1, conforme au principe d'isolation établi par LOT-P2-2 DT-4.
4. La **validation terrain** : protocole de validation sur fichiers Binance Wallet History réels, conformément à la méthodologie de validation terrain V1.

### §9.5 Décisions différées — Phase B+

| Référence | Sujet | Description | Statut |
|---|---|---|---|
| K-1 | Sources mixtes EV-21 | Politique applicable lorsqu'une source contient simultanément un bilan explicite (EV-21) et des événements transactionnels (EV-01→EV-20). §7.8 établit la préférence pour le mode `direct_snapshot` en présence d'un bilan explicite, mais ne définit pas le traitement des données transactionnelles coexistantes. Le contrat `{ mode, payload, anomalies }` est compatible avec tout arbitrage futur. | Différé Phase B+ |

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

| Micro-lot | Sections correspondantes | Mission | Statut |
|---|---|---|---|
| **P2-3.A** — Ontologie patrimoniale | §4 · §5 | Définir les trois entités ACTIF / POSITION / LIEU · résoudre DT-7 · définir l'identité canonique d'actif (assetId · propriétés · génération) | VALIDÉ · `baff98b` |
| **P2-3.B** — Règles de dérivation et classification | §7 | Formaliser la frontière événement / état · algorithme générique de dérivation · RF-S2 · frontière S1/S2 pour sources hybrides | VALIDÉ · `97bfe0a` |
| **P2-3.C** — Contrat de persistance | §8 | Définir la séquence d'écriture S2 · registre d'ingestion · rapport de session · statut CE_portfolio_v1__{uuid} | VALIDÉ · `8bad1a3` |
| **P2-3.D** — Périmètre Phase A et contrat adaptateur | §9 | Délimiter Phase A · formaliser le contrat adaptateur 5 capacités · exclusions · mission Programme P3 S2 | VALIDÉ |

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
| I-A-01 | Un changement de lieu de détention (réseau, custodien, adresse wallet) ne modifie jamais l'identité canonique de l'actif (`assetId`). |
| I-A-02 | Un reçu de staking émis par un protocole tiers (ex. stETH, rETH) est un actif canoniquement distinct de l'actif sous-jacent. Il n'est jamais représenté comme une POSITION de l'actif sous-jacent avec `holdingForm = "staked"`. |
| I-A-03 | La `holdingForm` d'une POSITION décrit l'état de la quantité détenue (liquid · staked · locked · in-pool). Elle ne modifie jamais l'identité canonique de l'actif (`assetId`). |
| I-A-04 | `definingProtocol` désigne la plus petite entité (protocole, entreprise ou DAO) qui crée et contrôle l'instrument. Pour les instruments multi-réseau d'un même émetteur, `definingProtocol` reste l'émetteur — le réseau de déploiement appartient à la POSITION (`location.network`). |
| I-A-05 | Un actif aux propriétés insuffisamment connues reçoit un `assetId` provisoire stable et déterministe. Les traces portant un `assetId` provisoire ne sont jamais modifiées rétroactivement, même après résolution ultérieure de l'identité canonique. |
| I-A-06 | Le minimum sémantique de résolution canonique retenu par le schéma courant est (`symbol_canonique` · `instrumentType` · `definingProtocol`). Ce tuple détermine l'`assetId` dans le référentiel canonique courant. Les futurs types d'instruments peuvent nécessiter des discriminants identitaires supplémentaires, formalisés par leurs lots d'ingestion, sans introduire de dépendance au lieu de détention. |
| I-B-01 | L'accumulation S2 suit l'ordre chronologique des événements sources. Un ordre non déterminé entre deux événements de même horodatage est une anomalie signalée — jamais une hypothèse silencieuse. |
| I-B-02 | Chaque événement source est décomposé en N ≥ 1 sous-opérations avant accumulation. Un événement qui génère N=1 sous-opération et un événement qui génère N=2 sont traités par le même algorithme d'accumulation — aucun cas spécial. |
| I-B-03 | L'état d'ouverture d'une POSITION n'est jamais supposé être zéro en l'absence de données. L'absence de données = état inconnu. Une quantité négative après accumulation signale un historique incomplet, non une erreur du schéma. |
| I-B-04 | Tout événement source non classifiable par l'adaptateur est enregistré comme anomalie et ignoré dans l'accumulation. Il ne bloque jamais la session — il dégrade le `derivationStatus` des positions associées. |
| I-B-05 | Un transfert interne avec les deux legs visibles (EV-16 + EV-17 appariés) génère deux sous-opérations compensées. La quantité totale de l'actif est conservée. Un transfert avec un seul leg visible génère une seule sous-opération — le leg manquant reste inconnu. |
| I-B-06 | Le `derivationStatus` de chaque POSITION est calculé après accumulation complète. Il ne peut pas être modifié rétroactivement par une session ultérieure. Une nouvelle session produit ses propres traces avec son propre statut. |
| I-B-07 | Les deux modes de dérivation (accumulation par événements / snapshot direct) ne se mélangent jamais dans une même session S2. Une session utilise l'un ou l'autre exclusivement. |
| I-B-08 | Aucune interpolation temporelle n'est autorisée. Une quantité inconnue à un instant reste inconnue et ne peut pas être estimée par interpolation entre deux états connus. |
| I-B-09 | Toutes les anomalies de dérivation (AN-01 à AN-08) sont transmises au rapport de session S2. Aucune anomalie n'est silencieuse. Le rapport de session est le seul canal de communication des anomalies vers l'opérateur. |
| I-B-10 | La classification des types d'événements (§7.5) est une responsabilité exclusive de l'adaptateur. Le Core S2 (Programme P3) ne contient aucune règle source-spécifique de classification. |

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
| DT-11 | Algorithme de dérivation — sous-opérations | Chaque événement source est décomposé en N ≥ 1 sous-opérations avant accumulation · un événement swap produit N=2, un dépôt produit N=1 · l'accumulateur traite toujours des sous-opérations, jamais des événements bruts | LOT-P2-3 §7.2 (P2-3.B) |
| DT-12 | Gestion du double comptage des transferts | Un transfert interne avec deux legs observés génère deux sous-opérations compensées (conservation nette) · un transfert avec un leg seul génère une seule sous-opération · en cas de doute d'appariement, traitement conservateur indépendant | LOT-P2-3 §7.7 (P2-3.B) |
| DT-13 | État d'ouverture inconnu | Jamais supposé zéro · une quantité négative après accumulation = `derivationStatus = "incomplete_history"` · le schéma courant n'interpole jamais et n'estime jamais un état manquant | LOT-P2-3 §7.10 (P2-3.B) |

---

## §14 Critères de validation du lot

| CV | Critère | Condition de satisfaction |
|---|---|---|
| CV-1 | Ontologie patrimoniale résolue (DT-7) | Trois entités définies · propriétés séparées · cas canoniques §4.3 tranchés · frontières §4.4 couvertes |
| CV-2 | Identité canonique d'actif définie | `assetId` · `symbol` · `instrumentType` · `definingProtocol` définis · règles de génération §5.3 documentées · limites Phase A §5.4 couvertes |
| CV-3 | Modèle canonique de trace S2 complet | Structures SNAPSHOT et POSITION définies · champs obligatoires et optionnels spécifiés · contenu de `contexte` documenté |
| CV-4 | Session S2 et liaison SNAPSHOT / POSITION | `snapshotId` défini · règle d'ordre d'écriture · distinction par `contexte.traceType` |
| CV-5 | Règles de dérivation S2 documentées | Frontière événement / état formalisée · algorithme générique §7.2 · classification §7.5 · algèbre §7.6 · doctrine transfert §7.7 · snapshot direct §7.8 · temporalité §7.9 · historique partiel §7.10 · anomalies §7.11 · derivationStatus §7.12 · RF-S2 · frontière S1/S2 sources hybrides |
| CV-6 | Contrat de persistance défini | Séquence §8.2 · registre `CE_ingestion_registry_v1` · rapport de session §8.4 · statut `CE_portfolio_v1__{uuid}` |
| CV-7 | Périmètre Phase A borné | Source Binance Wallet History délimitée · contrat adaptateur 5 capacités · exclusions §9.3 exhaustives |
| CV-8 | Relation portfolio-v1 documentée | Tableau §10 : valide / absorbé / historique / contradictoire — rempli et justifié |
| CV-9 | Test de généralité PASS | Chaque règle du canon reste valide si Binance, Bittensor ou Ethereum disparaît |

---

## §15 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | Micro-lots P2-3.A à P2-3.D validés (§4→§9 du présent document complets et cohérents) |
| Condition 2 | CV-1 à CV-9 satisfaits |
| Condition 3 | Décisions DT-1 à DT-13 toutes documentées et non contradictoires |
| Condition 4 | Test de généralité PASS sur l'ensemble du canon S2 |
| Condition 5 | DQC V2 CAS A |
| Condition 6 | DQC V3 PASS |
| Condition 7 | Décision opérateur explicite de clôture |

**Obligation résiduelle — §6.2 ↔ §7.12** : avant clôture du lot, résoudre l'incohérence suivante : §6.2 définit `snapshotSummary` comme `{ assetCount, positionCount }` uniquement, tandis que §7.12 stipule que le pire `derivationStatus` de la session doit être inclus dans `snapshotSummary`. Ces deux définitions sont incompatibles. Cette anomalie est non bloquante pour P2-3.C mais doit être résolue de manière contrôlée avant validation de la Condition 5. La modalité de correction reste soumise à arbitrage opérateur.
