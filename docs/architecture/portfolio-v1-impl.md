# Portefeuille Utilisateur V1 — Plan d'implémentation

> Document d'architecture · Non implémentable sans validation · 2026-06-07
> Référence cadrage : `docs/architecture/portfolio-v1-scope.md` · commit `cac0e7d`
> Décisions architecturales : 10/10 tranchées et validées (voir §1)

---

## Sommaire

1. [Décisions architecturales validées](#1-décisions-architecturales-validées)
2. [Architecture cible](#2-architecture-cible)
3. [Schéma de données](#3-schéma-de-données)
4. [Clés localStorage](#4-clés-localstorage)
5. [Pipeline d'import](#5-pipeline-dimport)
6. [Extraction des données portefeuille](#6-extraction-des-données-portefeuille)
7. [Détection des doublons](#7-détection-des-doublons)
8. [Intégration exportOperatorData()](#8-intégration-exportoperatordata)
9. [Impacts UI](#9-impacts-ui)
10. [Plan de migration](#10-plan-de-migration)
11. [Tâches atomiques d'implémentation](#11-tâches-atomiques-dimplémentation)
12. [Critères de validation finaux](#12-critères-de-validation-finaux)

---

## 1. Décisions architecturales validées

Ces décisions ont été tranchées lors de la session d'architecture du 2026-06-07 et validées par l'opérateur. Elles sont la référence de ce document.

| # | Question | Décision retenue |
|---|---|---|
| D1 | Valorisation des actifs | À l'import uniquement — quantités déclaratives issues du fichier. Aucune API externe. Aucune valorisation en EUR/USDT. |
| D2 | Mode de saisie | Import Wallet History uniquement en V1. Saisie manuelle différée V2. |
| D3 | Fréquence des snapshots | À chaque import Wallet History réussi (`ok: true`). Un snapshot = un import. |
| D4 | Stablecoins | Inclus au même titre que les autres actifs. Catégorie : `stablecoin`. |
| D5 | Actifs externes (hors Binance) | Différés V2. En V1 : uniquement les actifs extraits du fichier Wallet History Binance. |
| D6 | Clé localStorage | `CE_portfolio_v1__{uuid}` — namespaced via `withUserKey()`. `schemaVersion: 1`. |
| D7 | Cap de rétention | FIFO 50 snapshots. Cohérence avec `SESSION_LIMIT = 50` (MEM-01B). |
| D8 | Politique de mise à jour | Append — chaque import ajoute un snapshot. Aucun écrasement. |
| D9 | Gestion des doublons | Append + avertissement non-bloquant. Critères : même `fileName` + même `fileSize` + import précédent < 24h. Sans hash en V1. |
| D10 | Affichage UI | Section dans l'onglet Mémoire existant. Pas de nouvel onglet. |

---

## 2. Architecture cible

### Vue d'ensemble

Le Portefeuille V1 s'insère dans le pipeline existant **sans modifier le moteur principal**. Il est attaché au pipeline Wallet History — déjà fonctionnel — via un point d'injection unique dans `behavior-view.js`, après que `uploader.js` ait retourné un résultat `ok: true` de type `wallet`.

```
Wallet History import (CSV/XLSX)
  → uploader.js          classifie NON_TRADING/wallet
  → wallet_analyzer.js   analyse comportementale (existant)
  → [NOUVEAU] portfolio-extractor.js   extrait la composition par actif
  → [NOUVEAU] portfolio-repo.js        persiste dans CE_portfolio_v1__{uuid}
  → behavior-view.js     rendu UI (existant + section Portefeuille)
```

### Couches concernées

| Couche | Fichier(s) | Nature de la modification |
|---|---|---|
| Extraction données | `src/js/behavior/wallet/portfolio-extractor.js` | **Nouveau** — calcule la composition par actif depuis les lignes brutes |
| Persistance | `src/js/behavior/storage/portfolio-repo.js` | **Nouveau** — API CRUD pour `CE_portfolio_v1__{uuid}` |
| Storage central | `src/js/storage.js` | **Modifié** — KEYS + objet `portfolio` + `exportOperatorData()` |
| Point d'injection | `src/js/behavior/ui/behavior-view.js` | **Modifié** — appel post-import wallet + section UI |
| Export opérateur | `src/js/storage.js` | **Modifié** — `portfolio: portfolio.getAll()` dans `data` |

### Isolation stricte

Le Portefeuille V1 respecte le contrat d'isolation du module behavior :

- Il ne lit **aucune** donnée du moteur principal (`engine.js`, `decision.js`, etc.)
- Il n'émet **aucun** événement global
- Il ne pose **aucune** propriété `window.*`
- Il n'appelle **aucune** API externe
- Il n'est appelé que depuis `behavior-view.js`, exclusivement après un import Wallet History réussi

### Dépendances techniques

| Dépendance | Nature | Statut |
|---|---|---|
| `identity.ensure()` / `withUserKey()` dans `storage.js` | UUID opérateur | Opérationnel (ADU-04) |
| `importRegistry.append()` dans `storage.js` | Registre imports | Opérationnel (MEM-01B Bloc D) |
| `analyzeWallet()` dans `wallet_analyzer.js` | Analyse comportementale | Opérationnel |
| Lignes brutes du fichier wallet | Source de composition | Disponibles dans `uploader.js` — **à transmettre** (voir §6) |
| `exportOperatorData()` dans `storage.js` | Export backup | Opérationnel — à étendre |

---

## 3. Schéma de données

### Structure racine — objet `CE_portfolio_v1__{uuid}`

```json
{
  "version": 1,
  "updatedAt": "<ISO timestamp>",
  "snapshots": [ <PortfolioSnapshot>, … ]
}
```

Le tableau `snapshots` est capé à **50 entrées** (FIFO — la plus récente en tête, index 0). Au-delà de 50, le snapshot le plus ancien est supprimé avant insertion.

---

### Objet `PortfolioSnapshot`

Un snapshot est produit à chaque import Wallet History réussi.

```json
{
  "snapshotId":  "<UUID v4>",
  "schemaVersion": 1,
  "createdAt":   "<ISO timestamp>",
  "importRef": {
    "fileName":  "string",
    "fileSize":  "number (octets)",
    "importedAt": "<ISO timestamp>"
  },
  "assets": [ <Asset>, … ],
  "metrics": {
    "totalOperations":    "number",
    "uniqueCoinsCount":   "number",
    "activityLevel":      "low | medium | high",
    "feeIntensity":       "low | medium | high"
  },
  "duplicateWarning": "boolean"
}
```

**`snapshotId`** — UUID RFC 4122 v4 généré à la création. Identifiant stable du snapshot, utilisable comme référence croisée (Mémoire opérateur future).

**`importRef`** — Trace de l'import ayant produit ce snapshot. Sert à la détection de doublons (§7) et au rattachement à l'Import Registry.

**`duplicateWarning`** — `true` si les critères de doublon (§7) ont été détectés lors de cet import. N'empêche pas la création du snapshot.

---

### Objet `Asset`

Un actif est un token ou une devise observé dans le fichier wallet.

```json
{
  "symbol":       "string (ex. BTC, ETH, USDT)",
  "category":     "major | altcoin | stablecoin",
  "netQuantity":  "number (somme algébrique des Change pour ce symbole)",
  "firstSeenAt":  "<ISO timestamp — date du premier mouvement dans le fichier>",
  "lastSeenAt":   "<ISO timestamp — date du dernier mouvement dans le fichier>",
  "operationCount": "number (nombre de lignes impliquant ce symbole)"
}
```

**`netQuantity`** — Valeur déclarative calculée depuis le fichier. Représente la somme des `Change` (positifs + négatifs) pour ce symbole dans le fichier importé. Elle n'est **pas** le solde réel du compte (qui dépend d'imports antérieurs non couverts). C'est la contribution nette de *cet* import.

**`category`** — Catégorie conceptuelle assignée à l'import (voir §6 — règle de classification).

**Note d'absence de Position distincte en V1** — L'objet `Position` (actif · quantité · statut) tel que défini dans le scope est représenté par `Asset.netQuantity` + `Asset.category` en V1. Une entité Position formelle (avec statut `ouvert/fermé/partiel`) est différée : elle requiert une réconciliation multi-imports que V1 ne supporte pas.

---

### Règles de types

| Champ | Type | Contrainte |
|---|---|---|
| `snapshotId` | string (UUID v4) | Non null, non vide |
| `schemaVersion` | number | Valeur fixe : `1` |
| `createdAt` | string (ISO 8601) | Non null |
| `importRef.fileName` | string | Non null, non vide |
| `importRef.fileSize` | number | ≥ 0 |
| `assets` | array | Peut être vide si le fichier ne contient aucune ligne exploitable |
| `asset.symbol` | string (uppercase) | Non null, non vide |
| `asset.category` | enum | `major` / `altcoin` / `stablecoin` |
| `asset.netQuantity` | number | Peut être 0 ou négatif (net négatif possible) |
| `metrics.*` | number / string enum | Repris directement de `analyzeWallet()` |

---

## 4. Clés localStorage

### Clé principale

| Clé | Format | Namespacing | Cap |
|---|---|---|---|
| `CE_portfolio_v1__{uuid}` | JSON — objet racine avec `snapshots[]` | `withUserKey('CE_portfolio_v1')` | FIFO 50 snapshots |

### Intégration dans `storage.js`

La clé `portfolio` doit être ajoutée à l'objet `KEYS` :

```
KEYS.portfolio = 'CE_portfolio_v1'
```

La constante de cap doit être déclarée dans `storage.js` :

```
PORTFOLIO_SNAPSHOTS_LIMIT = 50
```

### État canonique des clés opérateur post-Portefeuille V1

Après implémentation, les clés namespacées opérateur seront :

| Clé namespacée | Contenu | Cap |
|---|---|---|
| `CE_journal_entries_v1__{uuid}` | Historique moteur | FIFO 200 |
| `CE_behavior_sessions_v1__{uuid}` | Sessions comportementales | FIFO 50 |
| `CE_import_registry_v1__{uuid}` | Registre des imports | FIFO 100 |
| `CE_backups_v1__{uuid}` | Snapshots moteur | FIFO 50 |
| `CE_settings_v1__{uuid}` | Préférences opérateur | — |
| `CE_portfolio_v1__{uuid}` | **[NOUVEAU]** Snapshots portefeuille | **FIFO 50** |
| `cameleon_behavior_memory_v1__{uuid}` | Mémoire comportementale | — |
| `cameleon.behavior.v1.guardLevel__{uuid}` | Niveau de garde | — |
| `cameleon.behavior.v1.guardLevelUpdatedAt__{uuid}` | Horodatage niveau garde | — |
| `cameleon.behavior.v1.orderStrategyProfile__{uuid}` | Profil stratégie ordres | — |

### Clés globales (non namespacées — inchangées)

`CE_identity_v1` · `CE_ui_state_v1` · `CE_payload_current_v1` · drapeaux de migration.

### Impact sur `_OPERATOR_KEYS`

La constante `_OPERATOR_KEYS` dans `storage.js` (liste des 9 clés copiées lors de la migration UUID) doit être étendue pour inclure `CE_portfolio_v1`. Cette extension ne déclenche pas de migration — la clé sera absente sur les profils existants, ce qui est le comportement attendu (liste vide = pas de snapshots).

### Cohérence avec `architecture-donnees-utilisateur.md`

`docs/architecture/architecture-donnees-utilisateur.md` est le document canonique de l'état des clés. Il doit être mis à jour lors de l'implémentation (critère documentaire §12 du scope).

---

## 5. Pipeline d'import

### Pipeline existant (état actuel)

```
behavior-view.js — handleFileImport(file)
  → uploader.js — processFile(file)
      → classifyFile(headers)       → NON_TRADING/wallet
      → analyzeWallet(rows)         → { type:'wallet', metrics, summary }
      → return { ok:true, type:'wallet', metrics, summary }
  → importRegistry.append(buildRegistryEntry(result, file))
  → behaviorRepo.set('walletResult', result)
  → mount(root)                     → buildWalletAnalysis() dans le rendu
```

### Pipeline cible (post-implémentation)

```
behavior-view.js — handleFileImport(file)
  → uploader.js — processFile(file, rows)   [MODIFIÉ : rows transmis]
      → classifyFile(headers)       → NON_TRADING/wallet
      → analyzeWallet(rows)         → { type:'wallet', metrics, summary }
      → return { ok:true, type:'wallet', metrics, summary, rawRows: rows }
  → importRegistry.append(buildRegistryEntry(result, file))
  → [NOUVEAU] portfolioExtractor.extract(result.rawRows)
      → calcule assets[] avec netQuantity et category
      → retourne { assets, duplicateWarning }
  → [NOUVEAU] portfolioRepo.append(buildPortfolioSnapshot(result, file, assets, duplicateWarning))
      → construit PortfolioSnapshot (§3)
      → persiste dans CE_portfolio_v1__{uuid} (FIFO 50)
  → behaviorRepo.set('walletResult', result)
  → mount(root)                     → buildWalletAnalysis() + buildPortfolioSection()
```

### Point d'injection

Le point d'injection unique est dans `behavior-view.js`, dans le bloc de traitement post-import wallet (ligne ~1190, autour de `behaviorRepo.set('walletResult', result)`). Aucune modification d'`uploader.js` n'est nécessaire si `rows` sont déjà accessibles dans `behavior-view.js` — à vérifier lors de l'implémentation.

**Alternative si `rows` non accessibles depuis `behavior-view.js`** : `uploader.js` enrichit le résultat retourné avec `rawRows: rows` pour les résultats de type `wallet` uniquement. La modification est minimale et non invasive pour les autres types.

### Conditions de déclenchement

Le pipeline Portefeuille V1 se déclenche **uniquement** quand :
- `result.ok === true`
- `result.type === 'wallet'`

Si l'import échoue (`ok: false`) ou si le type est `trades` / `order_history`, le portfolio n'est pas touché. L'état existant est préservé.

### Ordre des opérations (séquence obligatoire)

1. `importRegistry.append()` — enregistrement de l'import (existant, inchangé)
2. `portfolioExtractor.extract()` — extraction des assets depuis les lignes brutes
3. `portfolioRepo.append()` — persistance du snapshot portefeuille
4. `behaviorRepo.set('walletResult', result)` — mise à jour état comportemental (existant, inchangé)
5. `mount(root)` — rendu UI (existant + section Portefeuille)

**Rationale séquence** : L'extraction et la persistance précèdent le rendu pour que la section Portefeuille dans `mount()` puisse lire le snapshot qui vient d'être créé.

---

## 6. Extraction des données portefeuille

### Problème à résoudre

`wallet_analyzer.js` calcule des métriques agrégées (totalVolume, uniqueCoins, etc.) mais ne calcule pas la **composition nette par actif** — indispensable pour le Portefeuille.

La fonction `analyzeWallet()` retourne `uniqueCoins: [...Set]` (la liste des symboles présents), mais pas les quantités nettes par symbole. Le Portefeuille V1 a besoin de `netQuantity` par symbole.

### Solution : module `portfolio-extractor.js`

Un nouveau module `src/js/behavior/wallet/portfolio-extractor.js` calcule la composition depuis les lignes brutes. Il ne remplace pas `wallet_analyzer.js` — il le complète.

**Opération centrale :** pour chaque ligne du fichier, lire `Coin` (ou alias) et `Change` (ou alias). Accumuler `Change` par symbole pour obtenir la quantité nette.

**Données sources :** les mêmes colonnes que `wallet_analyzer.js` les lit déjà :
- Colonne `Coin` / alias : `asset`
- Colonne `Change` : valeur numérique signée (positif = crédit, négatif = débit)
- Colonne `UTC_Time` / alias : pour `firstSeenAt` / `lastSeenAt`

**Sortie de `portfolioExtractor.extract(rows)`** :

```
{
  assets: [
    {
      symbol:         "BTC",
      category:       "major",
      netQuantity:    0.42,
      firstSeenAt:    "<ISO timestamp>",
      lastSeenAt:     "<ISO timestamp>",
      operationCount: 12
    },
    …
  ]
}
```

### Règle de classification des catégories

Aucune API externe. Classification statique basée sur une liste de référence minimale, stockée dans le module extracteur ou dans `data.js`.

| Catégorie | Critère |
|---|---|
| `stablecoin` | Symbole dans la liste statique : USDT · USDC · BUSD · DAI · TUSD · FDUSD · USDS · et tout symbole se terminant par `USD` ou `EUR` |
| `major` | Symbole dans la liste statique : BTC · ETH · BNB |
| `altcoin` | Tout autre symbole non classifié |

**Principe :** la liste est conservatrice. Un actif ambigu tombe en `altcoin`. La liste n'est pas extensible sans modification de code (pas de configuration utilisateur en V1).

### Cas limites

| Cas | Comportement |
|---|---|
| `Change` non parsable | Ligne ignorée pour le calcul de netQuantity ; opération comptée quand même |
| `Coin` absent | Ligne entière ignorée |
| `netQuantity` = 0 après accumulation | Actif inclus dans le snapshot avec `netQuantity: 0` — information valide (solde soldé) |
| `netQuantity` < 0 | Inclus tel quel — signe négatif possible si les débits excèdent les crédits dans la fenêtre du fichier |
| Fichier vide (0 lignes) | `assets: []` — snapshot créé sans actifs |
| `UTC_Time` absent | `firstSeenAt: null` · `lastSeenAt: null` |

### Ce que portfolio-extractor.js ne fait pas

- Il ne réconcilie pas plusieurs snapshots (inter-import)
- Il ne calcule pas de solde cumulatif global (chaque snapshot est autonome)
- Il ne contacte aucune API externe
- Il ne modifie pas `wallet_analyzer.js`

---

## 7. Détection des doublons

### Décision validée (D9)

> Append + avertissement non-bloquant.
> Critères : même `fileName` + même `fileSize` + import précédent < 24h.
> Sans hash en V1.

### Logique de détection

Avant d'appeler `portfolioRepo.append()`, comparer le fichier entrant avec le dernier snapshot existant (index 0 de la liste FIFO) :

```
snapshots = portfolioRepo.getAll()
if snapshots.length > 0 :
  last = snapshots[0]
  elapsed = now() - Date.parse(last.importRef.importedAt)   // ms
  if (
    last.importRef.fileName === file.name
    && last.importRef.fileSize === file.size
    && elapsed < 86400000   // 24h en ms
  ) → duplicateWarning = true
else → duplicateWarning = false
```

### Comportement en cas de doublon détecté

1. Le snapshot est **quand même créé** (`duplicateWarning: true` dans le snapshot).
2. L'UI affiche un **avertissement non-bloquant** sous la section Portefeuille.
3. L'import n'est pas annulé. L'opérateur reste libre de ré-importer le même fichier.
4. Aucune confirmation n'est demandée.

**Texte d'avertissement suggéré (UI) :**
> Ce fichier semble avoir déjà été importé récemment (même nom, même taille, moins de 24h).
> Le snapshot a été créé. Si c'est un doublon, il peut être ignoré.

### Limites de la détection V1

La détection repose sur `fileName` + `fileSize`. Elle n'est pas infaillible :
- Deux exports différents avec le même nom et la même taille ne seront pas distingués.
- Un fichier modifié légèrement (ajout d'une ligne) avec la même taille passera sans avertissement.
- Ces limites sont documentées et acceptées — une détection par hash est différée V2.

### Ce que la détection ne fait pas

- Elle ne bloque pas l'import.
- Elle ne compare pas le contenu des lignes.
- Elle ne supprime pas le snapshot précédent.
- Elle ne demande pas confirmation à l'opérateur.

---

## 8. Intégration exportOperatorData()

### Modification de `exportOperatorData()` dans `storage.js`

La fonction `exportOperatorData()` retourne actuellement un objet `data` avec 10 champs. Le Portefeuille V1 ajoute un 11e champ :

```
data: {
  journalEntries:       journalEntries.getAll(),
  behaviorSessions:     behaviorSessions.getAll(),
  backups:              backups.getAll(),
  settings:             settings.get(),
  behaviorMemory:       behaviorMemory.getAll(),
  guardLevel:           …,
  guardLevelUpdatedAt:  …,
  orderStrategyProfile: …,
  importRegistry:       importRegistry.getAll(),
  uiState:              uiState.get(),
  portfolio:            portfolio.getAll(),     ← [NOUVEAU]
}
```

### API de `portfolio` dans `storage.js`

Le module `portfolio` suit exactement le même pattern que `importRegistry` ou `behaviorSessions` :

| Méthode | Comportement |
|---|---|
| `portfolio.getAll()` | Lit `CE_portfolio_v1__{uuid}` — retourne `[]` si absent |
| `portfolio.append(snapshot)` | Prepend + FIFO 50 — `snapshots.unshift(snap)` puis `slice(0, 50)` |
| `portfolio.clear()` | Écrit `{ snapshots: [] }` |

### Compatibilité ascendante

La clé `portfolio` sera absente dans les exports produits avant l'implémentation. Les lecteurs futurs (Mémoire opérateur, etc.) doivent traiter `portfolio: undefined` comme `portfolio: []`. Aucune migration de données existantes n'est requise — la clé n'existe pas encore en localStorage.

---

## 9. Impacts UI

### Décision validée (D10)

> Section dans l'onglet Mémoire existant. Pas de nouvel onglet.

### Emplacement dans l'onglet Mémoire

L'onglet Mémoire (`src/index.html` — tab `mémoire`) contient actuellement les sections : Sessions comportementales, Historique moteur, Import Registry. La section Portefeuille s'insère comme nouvelle section dans cet onglet.

**Position dans le flux** : après la section Import Registry (logique : imports → portefeuille résultant).

### Contenu de la section Portefeuille

La section affiche le **dernier snapshot** (index 0 de la liste FIFO). Les snapshots antérieurs ne sont pas affichés en V1 — ils sont conservés en localStorage pour la Mémoire opérateur future.

**Blocs à afficher :**

| Bloc | Contenu |
|---|---|
| En-tête | Date du snapshot · nom du fichier source |
| Composition | Liste des actifs : symbole · catégorie · netQuantity |
| Métriques | totalOperations · uniqueCoinsCount · activityLevel · feeIntensity |
| Avertissement doublon | Affiché uniquement si `duplicateWarning: true` |

### État vide (aucun snapshot existant)

Si `portfolio.getAll()` retourne `[]`, la section affiche un état vide :

> Aucun portefeuille importé. Importez un fichier Wallet History pour voir votre portefeuille.

### Rendu dans `behavior-view.js`

La section Portefeuille est rendue par une fonction `buildPortfolioSection(snapshot)` appelée depuis `mount()`. Elle s'insère dans le HTML de rendu de l'onglet Mémoire, après la section Import Registry.

Elle est rendue **indépendamment** de `buildWalletAnalysis()` :
- `buildWalletAnalysis()` — rendu comportemental du fichier qui vient d'être importé (état en session, dans l'onglet Comportement)
- `buildPortfolioSection()` — rendu du dernier snapshot persisté (dans l'onglet Mémoire)

Ces deux sections peuvent coexister. Elles lisent des sources différentes :
- `buildWalletAnalysis()` lit `state.walletResult` (en-mémoire, éphémère)
- `buildPortfolioSection()` lit `portfolio.getAll()[0]` (localStorage, persistant)

### Contraintes UI (doctrine)

- Pas de graphique (hors périmètre V1)
- Pas de valorisation en EUR/USDT (exclu §4 scope)
- Pas de bouton "Mettre à jour manuellement" (saisie manuelle différée V2)
- Pas de tri ni de filtre par catégorie (V1 = lecture simple)
- Texte sobre, aucune émoji, aucune couleur sémantique autre que neutre
- L'avertissement doublon est informatif uniquement — pas de couleur d'alerte forte

---

## 10. Plan de migration

### Aucune migration de données requise

Le Portefeuille V1 introduit une nouvelle clé localStorage (`CE_portfolio_v1__{uuid}`) qui n'existe pas sur les profils actuels. Son absence est le comportement attendu : `portfolio.getAll()` retourne `[]`, la section Mémoire affiche l'état vide.

Il n'y a rien à migrer — aucune donnée existante ne contient de portefeuille persisté.

### Mise à jour de `_OPERATOR_KEYS`

La liste `_OPERATOR_KEYS` dans `storage.js` doit inclure `CE_portfolio_v1` pour garantir que la clé soit copiée lors d'une future migration UUID (si un opérateur démarre sans UUID puis en crée un). Cette extension n'affecte pas les profils existants — la clé absente est copiée comme absente (no-op).

### Mise à jour de `architecture-donnees-utilisateur.md`

Le document `docs/architecture/architecture-donnees-utilisateur.md` est la référence canonique de l'état des clés opérateur. Il doit être mis à jour pour refléter :
- Ajout de `CE_portfolio_v1__{uuid}` dans la table des clés
- Ajout dans `_OPERATOR_KEYS`
- Ajout dans `exportOperatorData()`

Cette mise à jour est un critère de validation documentaire (§12).

### Impact sur `debt-audit.md`

`docs/debt-audit.md` doit être mis à jour après implémentation pour refléter la dette soldée et les éventuelles dettes ouvertes introduites par le Portefeuille V1. Cette mise à jour est également un critère de validation documentaire (§12).

---

## 11. Tâches atomiques d'implémentation

Les tâches sont séquentielles. Chaque tâche est indépendante et committable séparément.

### T1 — Créer `portfolio-extractor.js`

**Fichier :** `src/js/behavior/wallet/portfolio-extractor.js`

Implémente `extract(rows)` :
- Accumule `netQuantity` par symbole depuis la colonne `Change`
- Classe chaque symbole dans `major` / `stablecoin` / `altcoin` (liste statique)
- Retourne `{ assets: [Asset] }`
- Cas limites : lignes sans `Coin`, `Change` non parsable, fichier vide (voir §6)

**Validation :** appel manuel avec un fichier Wallet History réel en console → vérifier structure et valeurs.

---

### T2 — Créer `portfolio-repo.js`

**Fichier :** `src/js/behavior/storage/portfolio-repo.js`

Implémente :
- `getAll()` → lit `CE_portfolio_v1__{uuid}` via `withUserKey()`, retourne `snapshots` ou `[]`
- `append(snapshot)` → prepend + `slice(0, 50)` + write
- `clear()` → write `{ snapshots: [] }`
- `buildSnapshot(result, file, assets, duplicateWarning)` → construit un `PortfolioSnapshot` conforme §3 (génère `snapshotId` via `crypto.randomUUID()`)

**Validation :** appel manuel depuis la console — vérifier que `localStorage.getItem('CE_portfolio_v1__...')` contient les données attendues.

---

### T3 — Mettre à jour `storage.js`

**Fichier :** `src/js/storage.js`

Modifications :
1. Ajouter `portfolio: 'CE_portfolio_v1'` dans `KEYS`
2. Déclarer `const PORTFOLIO_SNAPSHOTS_LIMIT = 50`
3. Ajouter l'objet `portfolio` (export) avec `getAll()` / `append()` / `clear()` — pattern identique à `importRegistry`
4. Ajouter `CE_portfolio_v1` dans `_OPERATOR_KEYS`
5. Ajouter `portfolio: portfolio.getAll()` dans `exportOperatorData()` → champ `data`

**Validation :** `exportOperatorData()` doit inclure `data.portfolio` (liste, potentiellement vide).

---

### T4 — Brancher dans `behavior-view.js`

**Fichier :** `src/js/behavior/ui/behavior-view.js`

Modifications dans le bloc de traitement post-import wallet (`result.type === 'wallet'`) :

1. Accéder aux lignes brutes du fichier (depuis `result.rawRows` ou depuis le scope local selon accessibilité — à déterminer lors de l'implémentation)
2. Appeler `portfolioExtractor.extract(rawRows)` → `{ assets }`
3. Détecter le doublon (§7) en comparant avec `portfolio.getAll()[0]`
4. Appeler `portfolio.append(buildSnapshot(result, file, assets, duplicateWarning))`
5. Passer `duplicateWarning` à `mount()` pour affichage conditionnel

**Ordre des appels** (obligatoire) :
1. `importRegistry.append()`
2. `portfolioExtractor.extract()`
3. `portfolio.append()`
4. `behaviorRepo.set('walletResult', result)`
5. `mount(root)`

**Validation :** importer un fichier Wallet History → vérifier que `portfolio.getAll()` contient un snapshot après import.

---

### T5 — Implémenter `buildPortfolioSection()` dans `behavior-view.js`

**Fichier :** `src/js/behavior/ui/behavior-view.js`

Ajouter la fonction `buildPortfolioSection(snapshot)` :
- Si `snapshot` est null/undefined → retourner le bloc état vide
- Sinon → afficher date, fichier source, liste des actifs, métriques, et si `duplicateWarning: true` → avertissement non-bloquant

Appeler `buildPortfolioSection(portfolio.getAll()[0])` depuis `mount()`, dans le rendu de l'onglet Mémoire, après la section Import Registry.

**Validation :** onglet Mémoire affiche la section Portefeuille après un import Wallet History réussi. Rechargement de page → section toujours présente (données persistées).

---

### T6 — Vérification intégration export

**Fichier :** `src/js/storage.js`

Tester `downloadOperatorData()` après import Wallet History → ouvrir le JSON téléchargé → vérifier la présence de `data.portfolio` avec le snapshot.

---

### T7 — Mise à jour documentaire

**Fichiers :**
- `docs/architecture/architecture-donnees-utilisateur.md` — ajouter `CE_portfolio_v1__{uuid}` dans la table des clés
- `docs/debt-audit.md` — enregistrer les dettes soldées et ouvertes du chantier

**Validation :** les deux documents reflètent l'état réel post-implémentation.

---

## 12. Critères de validation finaux

Ces critères sont identiques à ceux du `portfolio-v1-scope.md` §8, reformulés en termes de vérification concrète post-implémentation.

### Critères fonctionnels (5)

| # | Critère | Vérification |
|---|---|---|
| F1 | Les données wallet importées survivent à un rechargement de page | Importer un fichier Wallet History → recharger → `portfolio.getAll()` contient le snapshot |
| F2 | Le portefeuille est rattaché à l'UUID opérateur via `withUserKey()` | La clé en localStorage est `CE_portfolio_v1__<uuid>` (pas `CE_portfolio_v1` seul) |
| F3 | Un snapshot est créé après chaque import Wallet History réussi | Importer 3 fois → `portfolio.getAll().length === 3` (ou cap si ≥ 50) |
| F4 | Le portefeuille est inclus dans `exportOperatorData()` | `exportOperatorData().data.portfolio` est présent et non null |
| F5 | La clé localStorage est namespacée selon la convention `CE_portfolio_v1__{uuid}` | Inspecter localStorage — clé au format exact |

### Critères doctrinaux (5)

| # | Critère | Vérification |
|---|---|---|
| D1 | Aucune valorisation en temps réel implémentée | Aucun champ `price`, `value`, `eur`, `usd` dans le schéma snapshot |
| D2 | Aucune API externe appelée | Aucun appel réseau dans `portfolio-extractor.js` et `portfolio-repo.js` |
| D3 | Le portefeuille ne produit aucune recommandation | Aucune logique de scoring ou suggestion dans les nouveaux modules |
| D4 | L'isolation comportemental / moteur principal est respectée | Aucun import de `engine.js`, `decision.js` ou `trading-policy.js` dans les nouveaux fichiers |
| D5 | Aucun champ hors périmètre §4 du scope n'est présent dans le schéma | Revue du schéma JSON : aucun champ trading, benchmark, alertes, scoring |

### Critères documentaires (2)

| # | Critère | Vérification |
|---|---|---|
| Doc1 | `docs/architecture/architecture-donnees-utilisateur.md` mis à jour | La clé `CE_portfolio_v1__{uuid}` figure dans la table des clés avec ses propriétés |
| Doc2 | `docs/debt-audit.md` mis à jour | Les dettes ouvertes et soldées du chantier Portefeuille V1 sont enregistrées |

### Critères de régression (non régression pipeline existant)

| # | Critère | Vérification |
|---|---|---|
| R1 | Import Trade History non affecté | Importer un Trade History → comportement identique à avant — aucune mention de portfolio |
| R2 | Import Order History non affecté | Idem pour Order History |
| R3 | `exportOperatorData()` toujours valide sans wallet importé | `exportOperatorData().data.portfolio` = `[]` (pas d'erreur, pas null) |
| R4 | Rechargement page sans wallet importé — pas d'erreur JS | Section Portefeuille affiche l'état vide, aucune exception en console |

---

*Ce document est un plan d'implémentation. Il ne déclenche aucune modification de code.*
*Toute ouverture de chantier doit référencer ce document et le `portfolio-v1-scope.md`.*
