# Plan V4 — Module comportemental : fiabilisation Excel/CSV

**Date :** 10 mai 2026  
**Scope strict :** pipeline CSV/XLSX → trades canoniques. Aucune nouvelle feature, aucune modification moteur principal.

---

## 1. État actuel du module comportemental

Le module comportemental (`src/js/behavior/`) est isolé du moteur principal par contrat :

- Ne lit aucune donnée du moteur principal
- N'émet aucun événement global, ne pose aucune propriété `window.*`
- Ne persiste rien au-delà de `cameleon.behavior.v1.*` dans localStorage
- Se vide à tout clic sur un onglet principal

Le pipeline complet est :

```
Fichier CSV/XLSX
  → uploader.js          [lecture, classification, dispatch]
  → parser.js            [CSV → tableau de row-objects]
  → binance_spot.js      [normalisation + mapping canonique]
  → validator.js         [isValidTrade — filtre strict]
  → trade-validator.js   [validation métier]
  → metrics.js           [métriques quantitatives]
  → patterns.js          [détection de 5 patterns]
  → scoring.js           [score comportemental → label]
  → coaching.js          [messages adaptatifs]
  → behavior-view.js     [rendu DOM]
```

---

## 2. Fichiers concernés par V4

| Fichier | Rôle | Priorité patch |
|---------|------|----------------|
| `src/js/behavior/import/uploader.js` | Orchestration, classification fichier, dispatch | Haute |
| `src/js/behavior/normalize/mappers/binance_spot.js` | Normalisation clés, tables d'alias, mapping canonique | Haute |
| `src/js/behavior/normalize/validator.js` | Filtre `isValidTrade` — 5 conditions strictes | Moyenne |
| `src/js/behavior/normalize/trade-validator.js` | Validation métier post-normalisation | Basse |
| `src/js/behavior/analytics/patterns.js` | Détection 5 patterns | Moyenne |
| `src/js/behavior/analytics/metrics.js` | Métriques quantitatives | Basse |
| `src/js/behavior/import/parser.js` | Parse CSV brut → row-objects | Basse (stable) |
| `src/js/behavior/storage/session-repo.js` | Persistance sessions | Hors scope V4 |
| `src/js/behavior/storage/behavior-repo.js` | Namespace localStorage isolé | Hors scope V4 |

---

## 3. Parser actuel

**`parser.js`** parse le CSV brut :
- Détecte le séparateur (virgule, point-virgule, tabulation)
- Retourne un tableau d'objets `{ colonne: valeur }` avec les headers de la 1re ligne

**`readFileAsText(file)`** (dans `uploader.js`) lit en UTF-8. Pas de fallback encodage (ex. ISO-8859-1 pour exports FR anciens).

**`readFileAsXLSX(file)`** (dans `uploader.js`) utilise SheetJS chargé depuis CDN :
```
https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js
```
Options : `{ raw: false, defval: '' }` — toutes les valeurs en string, cellules vides → chaîne vide.

---

## 4. Limites CSV/XLSX identifiées

### 4.1 Debug non retiré — pollution console en production

`uploader.js` appelle `enableTradeDebug()` inconditionnellement à la ligne 216 (avant la boucle d'import), ce qui active le log de la première ligne à chaque import. Trois blocs `[DEBUG TEMPORAIRE]` sont présents (lignes 145–148, 157–161, 216).

**Impact :** Pollution console permanente. Aucun impact fonctionnel, mais masque les vrais avertissements.

### 4.2 SheetJS chargé depuis CDN

Si le réseau est indisponible (mode hors-ligne, CDN down, firewall entreprise), l'import XLSX échoue avec un message opaque : `"Impossible de charger le module xlsx."`. Il n'existe pas de fallback.

**Impact :** Les utilisateurs qui exportent en XLSX (format par défaut Binance) et travaillent hors connexion voient une erreur non explicite.

### 4.3 Encodage UTF-8 unique

`readFileAsText` lit en UTF-8 uniquement. Les exports Binance FR anciens (pré-2022) peuvent être encodés en ISO-8859-1. Les accents mal encodés (`Ã©` au lieu de `é`) passent dans les clés de colonnes, mais `normalizeKey` + décomposition NFD ne peut pas corriger un mauvais encodage initial.

**Impact :** Faible (Binance envoie UTF-8 depuis 2022), mais non documenté.

---

## 5. Formats Binance Spot connus

Les exports Binance Spot ont varié dans le temps. Formats identifiés à ce jour :

| Format | Date | Colonnes clés | Particularité |
|--------|------|---------------|---------------|
| CSV FR récent | 2023–2026 | Date(UTC), Paire, Côté, Prix, Exécuté, Montant, Frais | En-têtes accentués |
| CSV EN récent | 2023–2026 | Date(UTC), Pair, Side, Price, Executed, Amount, Fee | Standard |
| CSV Binance réel | var. | Date(UTC), Pair, Type, Price, Amount, Total, Fee | "Type" = BUY/SELL, "Amount" = base qty, "Total" = quote value |
| XLSX Order History | 2024–2026 | Order Time, Trading Pair, Side, Price, Filled, Total, Fee | SheetJS `raw: false` → dates en string |
| XLSX Trade History | var. | Date, Symbol, Trade Type, Average Price, Filled, Total | "Trade Type" = BUY_LIMIT / SELL_MARKET |
| CSV 2 chiffres année | 2026+ | 26-04-12 16:42:05 | Format court année détecté par parseDate |

---

## 6. Causes de lignes ignorées (trades skippés)

Un trade est ignoré si `mapBinanceSpotRow` retourne `null` ou si `isValidTrade` retourne `false`.

### 6.1 normalizeTrade retourne null

Toute ligne où l'un des 4 champs suivants est absent ou vide :

| Champ | Condition d'échec |
|-------|-------------------|
| `timestamp` | Date non parseable par parseDate |
| `symbol` | Aucun alias SYMBOL trouvé, ou valeur vide après trim |
| `side` | rawSide ne commence pas par BUY_, SELL_, n'est pas LONG/SHORT/ACHAT/VENTE |
| `price` | parseNum retourne 0 |

**Cas fréquent :** colonne "Side" contient "BUY_LIMIT" → rawSide = "BUY_LIMIT" → `startsWith('BUY_')` → OK. Mais si la colonne "Type" est mappée en SIDE au lieu de la vraie colonne "Side", "LIMIT" ou "MARKET" donnent un side non reconnu → null.

**Cas qty :** si qty = 0 et que les colonnes Amount + Total coexistent, qty = Amount (fallback). Si Amount est la valeur quote (certains exports), qty est faux mais non nul → trade accepté avec quantité incorrecte.

### 6.2 isValidTrade retourne false

Conditions strictes :
- `timestamp` pas un nombre > 0
- `symbol` pas une string non vide
- `side` pas dans `['BUY', 'SELL']` — déclenche si normalizeTrade renvoie un side intermédiaire (ne devrait pas arriver si normalizeTrade filtre correctement)
- `price` pas un nombre > 0
- `quantity` pas un nombre > 0

### 6.3 Causes structurelles

- Ligne vide ou ligne de sous-total (export Binance ajoute parfois une ligne "Total" en bas)
- Ligne d'en-tête dupliquée (export multi-pages collé manuellement)
- Colonne prix exprimée en string non numérique ("N/A", "-", "—")

---

## 7. Mapping colonnes attendu

### normalizeKey

```
String → toLowerCase → NFD diacritics strip → séparateurs → espace → trim
"Côté" → "cote"  |  "Exécuté" → "execute"  |  "Avg. Price" → "avg price"
```

### Tables d'alias actuelles et collisions identifiées

**ALIASES_SIDE** — risque de collision élevé :

| Alias | Risque |
|-------|--------|
| `'type'` | Colonne "Type" = type d'ordre (LIMIT/MARKET) sur certains exports, pas le côté |
| `'trade type'` | Peut contenir "BUY_LIMIT" (OK) ou "LIMIT" sans préfixe BUY/SELL (KO) |
| `'bs flag'` | Rare, peu documenté |
| `'achat vente'` | Jamais vu en production |

**Conflit ALIASES_QTY / ALIASES_QUOTE** — 'amount' est dans ALIASES_QTY (via 'montant execute') et ALIASES_QUOTE (via 'montant'). La résolution dépend de l'ordre de parcours des alias et de la valeur de la cellule. Sur le format "Binance réel" (Amount = base qty, Total = quote value), la logique qty-fallback (ligne 90–92 de binance_spot.js) compense, mais uniquement si qty = 0 au départ.

**ALIASES_DATE** — 'duree' est un alias incohérent (durée ≠ date). Présence inexpliquée.

### Champs optionnels non bloquants

`fee` — retourne 0 si absent, n'empêche pas l'import.  
`quote_value` — calculé par fallback (price × qty) si absent.

---

## 8. Stratégie de normalisation — patches recommandés

### Patch 1 — Retirer les DEBUG TEMPORAIRE (priorité 1)

Fichier : `uploader.js`

- Supprimer les 3 blocs `console.log([bhv:file]...)` (lignes 145–148, 157–161)
- Supprimer `enableTradeDebug()` ligne 216
- Supprimer `enableTradeDebug` de l'import ligne 6
- Conserver le mécanisme dans `binance_spot.js` (flag + export) mais ne plus l'activer automatiquement

Fichier : `binance_spot.js`

- Supprimer le bloc `[DEBUG TEMPORAIRE]` (lignes 105–116) et les variables associées (`_debugNormalize`, `enableTradeDebug`)

### Patch 2 — Séparer ALIASES_SIDE des types d'ordre (priorité 2)

Retirer 'type', 'trade type', 'bs flag', 'achat vente' de ALIASES_SIDE.

Ajouter un traitement explicite : si la colonne normalisée est 'type' ou 'trade type', vérifier si la valeur commence par 'BUY' ou 'SELL'. Si oui, l'utiliser comme source de side uniquement si aucune colonne 'side'/'direction'/'cote'/'sens' n'a été trouvée.

### Patch 3 — Clarifier la résolution Amount (priorité 2)

Le fallback `qty = amountVal` si `qty === 0 && amountVal > 0 && totalVal > 0` (ligne 90–92) est correct pour le format "Binance réel". Mais la condition ne distingue pas si Amount est vraiment la base qty ou la quote value.

Clarification : si `totalVal / amountVal` est proche de `price` (à ±10%), alors Amount est bien la qty base. Sinon, le fallback est risqué.

### Patch 4 — Aligner quote_quantity entre patterns.js et metrics.js (priorité 3)

`metrics.js` utilise `price × quantity` (tradeSize) pour toutes les métriques de taille, avec un commentaire explicatif : quote_quantity peut être incorrecte sur certains exports.

`patterns.js` utilise `quote_quantity` pour `size_inconsistency` (CV) et `revenge_trading` (comparaison > avgSize). Si quote_quantity = 0 (champ manquant ou non rempli), ces deux patterns ne se déclencheront jamais.

Correction : remplacer `t.quote_quantity` par `tradeSize(t)` (importé de metrics.js) dans `detectSizeInconsistency` et `detectRevenge`.

### Patch 5 — Retirer 'duree' de ALIASES_DATE (priorité 3)

Alias incohérent. Aucun export Binance connu n'utilise "Durée" comme colonne de date.

### Patch 6 — Message d'erreur XLSX hors-ligne (priorité 4)

Dans `loadXLSX()`, l'erreur actuelle est : `"Impossible de charger le module xlsx. Utilisez un fichier CSV."`. Ce message est correct mais n'explique pas la cause.

Améliorer : `"Impossible de charger le module xlsx (réseau indisponible ?). Exportez votre historique en CSV depuis Binance et réessayez."`

---

## 9. Stratégie de tests avec vrais fichiers

Le module n'a pas de tests automatisés. La validation se fait manuellement avec des fichiers réels.

### Matrice de tests minimale

| Fichier | Format | Colonnes clés | Résultat attendu |
|---------|--------|---------------|------------------|
| `binance_spot_trade_recent.csv` | CSV EN, UTF-8 | Date(UTC), Pair, Side, Price, Executed, Total | FULL_TRADING, tous trades OK |
| Export FR accentué | CSV FR, UTF-8 | Date(UTC), Paire, Côté, Prix, Exécuté, Montant | FULL_TRADING, normalisation accents OK |
| Format "Binance réel" | CSV EN | Date(UTC), Pair, Type, Price, Amount, Total | FULL_TRADING, qty fallback Amount actif |
| XLSX Order History | XLSX | Order Time, Trading Pair, Side, Price, Filled | FULL_TRADING, SheetJS raw:false |
| XLSX Trade History | XLSX | Date, Symbol, Trade Type, Average Price, Filled | FULL_TRADING, "BUY_LIMIT" → BUY OK |
| Historique wallet | CSV | Operation, Coin, Change | NON_TRADING/wallet |
| Historique Earn | XLSX | colonnes vides ≥ 20% | NON_TRADING/earn |
| Fichier multi-pages collé | CSV | En-tête dupliqué à mi-fichier | Lignes dupliquées skippées, pas d'erreur |
| Fichier avec ligne Total | CSV | Dernière ligne "Total" sans date | Ligne skippée, pas de crash |

### Protocole

1. Importer le fichier dans l'interface
2. Vérifier le nombre de trades affichés vs nombre de lignes CSV (moins les headers et lignes vides)
3. Vérifier la console : zéro `[bhv:*]` après patch 1
4. Vérifier les métriques : avgSize cohérent avec ordre de grandeur réel des trades
5. Vérifier les patterns : si un seul symbole, tous les patterns par-symbole fonctionnent

---

## 10. Risques de faux positifs

### 10.1 size_inconsistency — faux positif systématique si quote_quantity = 0

Si le fichier importé ne contient pas de colonne de valeur quote (ou si elle est à 0), `detectSizeInconsistency` calcule le CV sur un tableau de zéros → CV = 0 → pattern non déclenché. C'est correct par absence de données.

Mais si quote_quantity est incorrectement remplie (ex : contient la qty base au lieu de la valeur USDT), le CV sera très élevé → faux positif `size_inconsistency`.

**Mitigation :** alignement sur `tradeSize(t)` (patch 4).

### 10.2 revenge_trading — faux positif si avgSize biaisé

`detectRevenge` compare `curr.quote_quantity > metrics.avgSize * 1.5`. Si avgSize est calculé sur price×qty (metrics.js) mais curr.quote_quantity est une valeur différente (ex : 0 si champ absent), la comparaison échoue silencieusement (0 > seuil → false → pas de revenge). Ce n'est pas un faux positif mais un faux négatif.

Inversement, si quote_quantity > 0 mais est la valeur base asset exprimée en unité crypto (ex : 0.002 BTC), la comparaison donne 0.002 > 500 * 1.5 → false. Jamais de revenge.

**Mitigation :** alignement sur tradeSize (patch 4).

### 10.3 overtrading — faux négatif si le trader opère multi-symboles

Depuis la v3, overtrading est compté par fenêtre × symbole. Un trader qui fait 4 trades BTCUSDT + 4 trades ETHUSDT en 60 min ne déclenche pas le pattern (8 < seuil par symbole). C'est un choix de design (réduction faux positifs multi-paires) mais peut masquer un comportement réel d'overtrading global.

**Non bloquant pour V4** — comportement documenté, non modifié.

### 10.4 loss_chasing — faux positif DCA

Un DCA planifié à légère progression (100 → 115 → 130 USDT) ne déclenche pas `loss_chasing` grâce au facteur `LC_ESCALATION_FACTOR = 1.8` (130 doit dépasser 100 × 1.8 = 180 pour qualifier). Seuil calibré volontairement.

---

## 11. Ordre des patches recommandé

| Ordre | Patch | Fichier(s) | Criticité |
|-------|-------|-----------|-----------|
| 1 | Retirer DEBUG TEMPORAIRE | `uploader.js`, `binance_spot.js` | Haute — pollue la console en prod |
| 2 | Séparer ALIASES_SIDE / types d'ordre | `binance_spot.js` | Haute — cause de trades skippés |
| 3 | Aligner quote_quantity → tradeSize | `patterns.js` | Moyenne — patterns silencieusement brisés si quote manquant |
| 4 | Clarifier qty fallback Amount | `binance_spot.js` | Moyenne — qty incorrecte possible |
| 5 | Retirer 'duree' de ALIASES_DATE | `binance_spot.js` | Basse — alias incohérent |
| 6 | Message XLSX hors-ligne | `uploader.js` | Basse — UX uniquement |

---

## 12. Critères de validation V4

Le pipeline est considéré fiabilisé quand :

1. **Console propre** — Zéro log `[bhv:*]` dans la console après un import réussi (hors erreurs réelles)
2. **Taux de skip ≤ 5%** — Sur un fichier CSV/XLSX Binance Spot standard (≥ 50 trades), moins de 5% des lignes sont skippées sans explication visible
3. **Cohérence qty** — Pour 3 formats Binance testés, `avgSize` affiché dans les métriques est dans l'ordre de grandeur réel des trades (±20%)
4. **Patterns cohérents** — `size_inconsistency` et `revenge_trading` se déclenchent sur des données de test préparées avec des valeurs volontairement incohérentes
5. **XLSX fonctionne** — Import d'un fichier .xlsx Binance (≥ 20 trades) produit le même résultat qu'un CSV équivalent converti
6. **Wallet et Earn rejetés** — Un export wallet et un export Earn sont correctement classifiés NON_TRADING avec le message approprié
7. **Aucune régression moteur** — Aucun fichier dans `src/js/` hors du répertoire `behavior/` n'est modifié

---

*Document rédigé le 10 mai 2026. Ce document est un plan d'analyse — aucun patch n'est appliqué ici.*
