# CASE_002 — Binance historique retraits : NON_TRADING attendu et correct

## Statut
edge_case

## Fichier source local
`Binance-Rapport-d'historique-des-retraits-2026-05-16.xlsx`  
Placé dans `03_edge_cases/` (hors périmètre trading V1 — pas dans `02_broken/`).  
Comportement probablement identique pour l'export équivalent dépôts.

## Type supposé
NON_TRADING — export de flux financiers (retraits / dépôts), pas d'historique de trades.

## Symptôme observé
Message UI exact :

> "Export Binance détecté mais colonnes non mappées."

Diagnostic affiché :
- NON_TRADING (classification)
- date ✅
- symbol ❌
- side ❌
- price ❌
- qty ❌

Colonnes normalisées détectées :
```
date utc 0 | crypto | reseau | montant | frais | adresse | txid | statut
```

## Ce que le système détecte
- format : UNKNOWN (ni TRADE_HISTORY ni ORDER_HISTORY — pas de colonne fee/status/orderId trading)
- statuts : sans objet (pas de colonne statut de trade)
- headers : date utc 0, crypto, reseau, montant, frais, adresse, txid, statut
- nombre de lignes : non connu (fichier non conservé)
- nombre de trades extraits : 0 — **comportement attendu**

---

## Interprétation

Le comportement du pipeline est **sain et cohérent**.

Le moteur d'import attend des colonnes de trading pour l'analyse comportementale :
- `symbol` (paire tradée, ex : BTCUSDT)
- `side` (BUY / SELL)
- `price` (prix d'exécution)
- `qty` (quantité exécutée)

Les exports retraits/dépôts Binance n'ont pas cette structure. Ils décrivent des **mouvements de compte** (transferts vers wallet externe, dépôts depuis wallet externe) et non des **ordres exécutés** sur le carnet d'ordres.

Chaîne de décision dans `classifyFile()` :
1. `tradingSignals` : 1/5 uniquement (date ✅, symbol ❌, side ❌, price ❌, qty ❌)
2. `walletSignals` : absent (`operation` / `coin` / `change` non détectés)
3. `earnSignals` : absent
4. → Classification : `NON_TRADING / unknown`
5. → Message spécifique car `looksLikeBinance = true` (nom du fichier commence par "Binance")
6. → Diagnostic checkmark affiché correctement

**La détection est correcte** : le système identifie le fichier comme Binance, normalise les colonnes, classifie proprement, et retourne un message informatif plutôt qu'une erreur technique.

Ce n'est pas un bug de parsing, de header detection, ni de mapping. C'est une **limitation de périmètre explicite** et assumée.

Note : les colonnes `adresse` et `txid` sont des données onchain (adresse de wallet, hash de transaction) — hors modèle comportemental trading par définition.

---

## Décision produit (V1)

**Les exports retraits / dépôts ne font pas partie du périmètre comportemental V1.**

Justification :
- L'analyse comportementale repose sur des patterns d'exécution (timing, taille, fréquence, BUY/SELL ratio, overtrading, revenge trading, etc.)
- Ces patterns nécessitent des trades exécutés — pas des flux de trésorerie
- Les retraits/dépôts n'ont pas de côté (BUY/SELL), pas de prix d'exécution, pas de symbole de paire

**Aucune correction urgente nécessaire.** Le message UI est clair et orienté utilisateur.

**Évolution possible (hors V1) :**
- Module `wallet / flux financiers` : analyse des dépôts/retraits (fréquence, montants, comportement onchain)
- Module `comptabilité / tracking` : suivi des flux USDT vers/depuis exchanges
- Intégration avec le pipeline wallet existant (`wallet_analyzer.js`) si les colonnes correspondent

Ces évolutions sont indépendantes du pipeline comportemental trading et nécessiteraient un mapper dédié.

---

## Étapes de reproduction
1. Télécharger depuis Binance : Portefeuille → Historique des transactions → Retraits → Export XLSX
2. Importer dans l'onglet Comportement de Caméléon Engine
3. Observer le message "Export Binance détecté mais colonnes non mappées" + diagnostic ❌❌❌❌

## Résultat attendu
Message informatif "hors périmètre" — pas d'analyse trading. ✅

## Résultat obtenu
Comportement conforme au résultat attendu. ✅

## Statut de correction
**non applicable** — comportement correct, aucune correction nécessaire en V1.

## Notes
- Cas similaire probable pour l'export dépôts Binance (même structure de colonnes).
- `wallet_analyzer.js` existe déjà pour les exports "Account History" (Operation/Coin/Change) — structure différente des exports retraits.
- Référence : `IMPORT_AUDIT_003_excel_csv_pipeline.md` section 7 — "Formats supportés".
