# PARSER_V1 — Contrat d'extraction des sources Binance

**Statut :** Document d'architecture · Aucune implémentation · Aucun code
**Version :** 1.0 — 2026-06-01
**Auteur :** Caméléon Engine Project
**Dépend de :** source-detection-v1.md · pdf-import-v1-architecture.md

---

## 1. Contexte et portée

Ce document définit le contrat d'extraction des données pour chaque famille de source Binance identifiée par SOURCE_DETECTION_V1.

SOURCE_DETECTION_V1 répond à : *"Quel type de fichier est-ce ?"*
PARSER_V1 répond à : *"Une fois la source détectée, quelles données doivent être extraites, sous quelle forme, et avec quelles limites ?"*

**Ce document ne définit pas :**
- la logique de détection de source (responsabilité de SOURCE_DETECTION_V1)
- l'analyse comportementale des données extraites
- les scores, métriques ou décisions dérivées

**Principe directeur :** chaque famille a son propre contrat d'extraction. Une source ne peut jamais être forcée dans le schéma d'une autre famille. En cas d'ambiguïté ou de données insuffisantes, l'extraction est refusée proprement — sans crash, sans données partielles silencieuses.

---

## 2. Dépendance à SOURCE_DETECTION_V1

PARSER_V1 reçoit en entrée l'objet produit par SOURCE_DETECTION_V1 :

```
{
  sourceType : "TRADE_HISTORY_SPOT" | "ORDER_HISTORY_SPOT" | "WALLET_HISTORY" | "UNKNOWN"
  format     : "CSV" | "XLSX" | "PDF" | "UNKNOWN"
  confidence : "HIGH" | "MEDIUM" | "LOW" | "NONE"
}
```

**Règles d'entrée :**
- Si `sourceType === "UNKNOWN"` → extraction refusée · aucun parseur invoqué
- Si `confidence === "NONE"` → extraction refusée
- Si `confidence === "LOW"` → extraction tentée avec avertissement dans la sortie
- Si `confidence === "HIGH"` ou `"MEDIUM"` → extraction normale

Le parseur sélectionné est déterminé par la combinaison `sourceType + format`. Chaque combinaison observée dans le corpus B1-B19 dispose d'un contrat dédié (§5→9).

---

## 3. Familles couvertes

Les contrats d'extraction couvrent les combinaisons `sourceType + format` observées dans le corpus B1-B19. Les combinaisons anticipées (non encore observées) sont signalées.

| sourceType | format | Section | Statut corpus |
|-----------|--------|---------|--------------|
| `WALLET_HISTORY` | CSV | §5 | Observé |
| `TRADE_HISTORY_SPOT` | XLSX | §6 | Observé |
| `ORDER_HISTORY_SPOT` | XLSX | §7 | Observé |
| `TRADE_HISTORY_SPOT` | PDF | §8 | Observé |
| `ORDER_HISTORY_SPOT` | PDF | §9 | Observé |
| `TRADE_HISTORY_SPOT` | CSV | §6 (même contrat) | Anticipé |
| `ORDER_HISTORY_SPOT` | CSV | §7 (même contrat) | Anticipé |
| `WALLET_HISTORY` | XLSX · PDF | — | Non observé · contrat non défini |

**Règle :** les combinaisons non observées et non listées ne disposent d'aucun contrat. Toute tentative d'extraction sur une combinaison inconnue est traitée comme `UNKNOWN`.

---

## 4. Contrat d'extraction commun

Les règles suivantes s'appliquent à toutes les familles sans exception.

**R1 — Isolation des familles**
Chaque famille est extraite selon son propre schéma. Aucun champ d'une famille ne peut être mappé sur le schéma d'une autre famille.

**R2 — Lignes invalides**
Une ligne est invalide si : tous ses champs obligatoires sont vides, ou si la date est absente ou non parsable. Les lignes invalides sont ignorées silencieusement et comptabilisées dans la sortie (`skipped`).

**R3 — Champs obligatoires vs optionnels**
Chaque contrat de famille définit ses champs obligatoires. L'absence d'un champ obligatoire rend la ligne invalide. L'absence d'un champ optionnel produit `null` dans la sortie.

**R4 — Normalisation des valeurs numériques**
Les montants, prix et quantités sont extraits comme nombres flottants. Les séparateurs locaux (virgule décimale, espace milliers) sont normalisés. En cas d'échec de conversion : valeur `null`, ligne non rejetée sauf si le champ est obligatoire.

**R5 — Normalisation des dates**
Toutes les dates sont converties en format ISO 8601 (YYYY-MM-DDTHH:mm:ssZ). Les fuseaux horaires déclarés dans le fichier sont conservés tel quels. En cas d'échec de parsing : valeur `null`, ligne rejetée si la date est obligatoire.

**R6 — Limite de taille**
Un fichier dépassant 5 Mo est refusé avant extraction. La limite est vérifiée avant toute lecture de contenu.

**R7 — Encodage**
Les fichiers CSV sont lus en UTF-8. En cas d'échec d'encodage : tentative en UTF-8-BOM, puis CP1252. Si toutes les tentatives échouent : extraction refusée.

---

## 5. Extraction Wallet History CSV

**Nature de la source :** mouvements de capital — dépôts, retraits, frais, revenus Earn, conversions. Cette source n'est pas une source de trades. Elle ne doit jamais être traitée comme Trade History ou Order History.

**Mécanisme de lecture :** CSV texte, séparateur virgule, encodage UTF-8, première ligne = en-têtes.

**Champs à extraire :**

| Champ source | Champ extrait | Type | Obligatoire |
|-------------|--------------|------|------------|
| `User_ID` | `userId` | string | Non |
| `UTC_Time` | `timestamp` | ISO 8601 | Oui |
| `Account` | `account` | string | Non |
| `Operation` | `operation` | string | Oui |
| `Coin` | `asset` | string | Oui |
| `Change` | `change` | float | Oui |
| `Remark` | `remark` | string | Non |

**Champs obligatoires :** `timestamp` · `operation` · `asset` · `change`

**Règles spécifiques :**
- `change` est un nombre signé : positif = crédit, négatif = débit. Le signe est conservé tel quel.
- `operation` est une chaîne libre Binance (`Transaction Spend`, `Simple Earn Flexible Subscription`, `Buy Crypto With Fiat`…). Elle n'est pas normalisée à l'extraction — la classification sémantique est laissée aux couches aval.
- `userId` n'est pas extrait à des fins d'analyse — il est ignoré ou masqué selon la politique privacy du projet.
- Une ligne où `change === 0` est valide et conservée.

**Données non extraites :** aucune — tous les champs du schéma Binance sont mappés.

---

## 6. Extraction Trade History XLSX

**Nature de la source :** exécutions de trades — chaque ligne représente une transaction réellement exécutée sur le marché Spot.

**S'applique également à :** Trade History CSV (même schéma de colonnes, mécanisme de lecture différent).

**Mécanisme de lecture XLSX :** les 9 premières lignes contiennent des métadonnées Binance (domaine, nom, e-mail, période). La ligne de colonnes réelle se trouve à la ligne 10. Le parseur doit ignorer les lignes 1→9 et commencer l'extraction à partir de la ligne 10.

**Mécanisme de lecture CSV :** première ligne = en-têtes (pas de lignes de métadonnées).

**Champs à extraire :**

| Champ source (FR) | Champ extrait | Type | Obligatoire |
|------------------|--------------|------|------------|
| `Durée` | `timestamp` | ISO 8601 | Oui |
| `Paire` | `pair` | string | Oui |
| `Côté` | `side` | string (`BUY`\|`SELL`) | Oui |
| `Prix` | `price` | float | Oui |
| `Exécuté` | `executed` | float | Oui |
| `Montant` | `amount` | float | Oui |
| `Frais` | `fee` | string | Non |

**Champs obligatoires :** `timestamp` · `pair` · `side` · `price` · `executed` · `amount`

**Règles spécifiques :**
- `fee` contient une valeur concaténée avec l'actif (`0.0056583TAO`). Le parseur extrait la chaîne brute — la décomposition valeur/actif est laissée aux couches aval.
- `side` est normalisé en majuscules : `BUY` ou `SELL`. Toute autre valeur → ligne invalide.
- `executed` et `amount` peuvent contenir l'actif concaténé dans certains exports — le parseur doit extraire la partie numérique uniquement.
- Le champ `Exécuté` peut présenter un exposant superscript (`Exécuté²`, U+00B2) — normaliser `²` → `2` avant toute comparaison de nom de colonne.

---

## 7. Extraction Order History XLSX

**Nature de la source :** intentions décisionnelles — chaque ligne représente un ordre passé, qu'il soit exécuté, annulé ou partiellement rempli. Cette source documente l'intention de l'opérateur, pas l'exécution effective.

**S'applique également à :** Order History CSV (même schéma de colonnes, mécanisme de lecture différent).

**Mécanisme de lecture XLSX :** identique à §6 — 9 lignes de métadonnées à ignorer, colonnes réelles à la ligne 10.

**Avertissement — doublon de colonne `Durée` :** l'export Binance Order History contient deux colonnes nommées `Durée` (positions 1 et 8). La position 1 est l'horodatage de création de l'ordre. La position 8 est l'horodatage d'exécution. Le parseur doit les distinguer par position, pas par nom.

**Champs à extraire :**

| Position | Champ source (FR) | Champ extrait | Type | Obligatoire |
|----------|------------------|--------------|------|------------|
| 1 | `Durée` | `createdAt` | ISO 8601 | Oui |
| 2 | `Numéro de commande` | `orderId` | string | Oui |
| 3 | `Paire` | `pair` | string | Oui |
| 4 | `Type` | `orderType` | string | Non |
| 5 | `Côté` | `side` | string (`BUY`\|`SELL`) | Oui |
| 6 | `Prix de l'ordre` | `orderPrice` | float | Non |
| 7 | `Montant de la commande` | `orderAmount` | float | Non |
| 8 | `Durée` | `executedAt` | ISO 8601 | Non |
| 9 | `Exécuté` | `executed` | float | Non |
| 10 | `Prix moyen` | `avgPrice` | float | Non |
| 11 | `Trading total` | `total` | float | Non |
| 12 | `Statut` | `status` | string | Oui |

**Champs obligatoires :** `createdAt` · `orderId` · `pair` · `side` · `status`

**Règles spécifiques :**
- `status` valeurs observées : `Filled` · `Cancelled` · `Partially Filled`. La normalisation sémantique est laissée aux couches aval.
- Un ordre `Cancelled` peut avoir `executed === 0` et `total === 0` — ligne valide, conservée.
- `orderPrice` est `null` pour les ordres Market (prix non fixé à la création).
- Le champ `Exécuté` (position 9) peut présenter le superscript U+00B2 — même normalisation que §6.
- `Trading total` peut contenir `¹` en exposant dans certains exports — normaliser avant extraction numérique.

---

## 8. Extraction Trade History PDF

**Nature de la source :** identique à Trade History XLSX — exécutions de trades. Le PDF est une représentation visuelle du même jeu de données.

**Fragilité :** l'extraction PDF dépend d'un moteur d'extraction de texte structuré. La mise en page, le zoom et la qualité d'impression peuvent altérer l'extraction. Ce format est intrinsèquement plus fragile que CSV ou XLSX.

**Mécanisme de lecture :** extraction texte page par page. Les lignes de données commencent après l'en-tête de page (`Historique des trades Spot`, nom, période). Chaque ligne de trade est identifiable par sa structure : date · paire · côté · prix · quantités · frais.

**Schéma d'extraction :** identique à §6.

| Champ source (FR) | Champ extrait | Type | Obligatoire |
|------------------|--------------|------|------------|
| `Durée` | `timestamp` | ISO 8601 | Oui |
| `Paire` | `pair` | string | Oui |
| `Côté` | `side` | string (`BUY`\|`SELL`) | Oui |
| `Prix` | `price` | float | Oui |
| `Exécuté` | `executed` | float | Oui |
| `Montant` | `amount` | float | Oui |
| `Frais` | `fee` | string | Non |

**Règles spécifiques PDF :**
- Les valeurs numériques peuvent être fusionnées avec l'actif sans espace (`5.6583TAO`) — même règle que §6.
- Une ligne de trade peut être coupée entre deux pages — le parseur doit gérer la continuité entre pages.
- Les lignes d'en-tête répétées en haut de chaque page (`Durée Paire Côté…`) doivent être ignorées.
- En cas d'extraction partielle d'une ligne (champs manquants par coupure) : ligne ignorée et comptabilisée dans `skipped`.

---

## 9. Extraction Order History PDF

**Nature de la source :** identique à Order History XLSX — intentions décisionnelles. Le PDF est une représentation visuelle du même jeu de données.

**Fragilité :** même mise en garde que §8 — format plus fragile que XLSX.

**Mécanisme de lecture :** extraction texte page par page. Les lignes de données commencent après l'en-tête (`Historique d'ordre Spot` avec apostrophe U+2019, nom, période).

**Schéma d'extraction :** identique à §7 — mêmes champs, mêmes types, mêmes champs obligatoires.

| Position | Champ source (FR) | Champ extrait | Type | Obligatoire |
|----------|------------------|--------------|------|------------|
| 1 | `Durée` | `createdAt` | ISO 8601 | Oui |
| 2 | `Numéro de commande` | `orderId` | string | Oui |
| 3 | `Paire` | `pair` | string | Oui |
| 4 | `Type` | `orderType` | string | Non |
| 5 | `Côté` | `side` | string (`BUY`\|`SELL`) | Oui |
| 6 | `Prix de l'ordre` | `orderPrice` | float | Non |
| 7 | `Montant de la commande` | `orderAmount` | float | Non |
| 8 | `Durée` | `executedAt` | ISO 8601 | Non |
| 9 | `Exécuté` | `executed` | float | Non |
| 10 | `Prix moyen` | `avgPrice` | float | Non |
| 11 | `Trading total` | `total` | float | Non |
| 12 | `Statut` | `status` | string | Oui |

**Règles spécifiques PDF :**
- Le doublon de colonne `Durée` (positions 1 et 8) est présent dans le PDF — même règle de distinction par position que §7.
- Les lignes d'en-tête répétées en haut de chaque page doivent être ignorées.
- Une ligne d'ordre peut être coupée entre deux pages — même règle de continuité que §8.
- Le commentaire Binance en marge droite (`Commentaires`) ne doit pas être extrait comme données.

---

## 10. Gestion des erreurs et fichiers incomplets

Le parseur ne doit jamais crasher. Tout état d'erreur produit une sortie structurée avec un code d'erreur explicite.

**Catégories d'erreur :**

| Code | Situation | Comportement |
|------|-----------|-------------|
| `ERR_SIZE` | Fichier > 5 Mo | Refus avant lecture · aucune extraction |
| `ERR_ENCODING` | Encodage non déchiffrable | Refus après tentatives UTF-8 / UTF-8-BOM / CP1252 |
| `ERR_NO_HEADERS` | Aucune ligne de colonnes détectable | Refus · extraction impossible |
| `ERR_NO_DATA` | Colonnes trouvées, zéro ligne de données | Extraction vide · `rows: []` · non bloquant |
| `ERR_PARTIAL_PDF` | Extraction PDF incomplète (pages corrompues) | Extraction partielle · lignes tronquées dans `skipped` |
| `WARN_LOW_CONFIDENCE` | `confidence === "LOW"` en entrée | Extraction tentée · avertissement dans la sortie |

**Lignes ignorées (`skipped`) :**
Toute ligne invalide au sens des règles R2/R3 de §4 est ignorée silencieusement et comptabilisée. Le compteur `skipped` est toujours présent dans la sortie, même s'il vaut 0.

---

## 11. Sortie standard attendue

Chaque extraction produit un objet de sortie unique, quel que soit le résultat.

```
{
  sourceType  : string          // famille extraite
  format      : string          // format lu
  confidence  : string          // repris de SOURCE_DETECTION_V1
  rows        : array           // lignes extraites (vide si aucune donnée valide)
  total       : number          // nombre de lignes brutes lues
  skipped     : number          // nombre de lignes ignorées
  errors      : array           // liste des codes d'erreur rencontrés (vide si aucun)
  warnings    : array           // liste des avertissements (vide si aucun)
}
```

**Invariants :**
- `rows.length + skipped === total` pour CSV et XLSX (hors lignes de métadonnées)
- `errors` est toujours un tableau — jamais `null`
- `warnings` est toujours un tableau — jamais `null`
- Si `errors` contient `ERR_SIZE` ou `ERR_ENCODING` ou `ERR_NO_HEADERS` : `rows === []` et `total === 0`

---

## 12. Limites et exclusions

**L1 — PDF non garanti ligne à ligne**
L'extraction PDF repose sur la structure textuelle du document. Un PDF scanné (image) ou réencodé ne produira pas de texte exploitable. Dans ce cas : `ERR_NO_HEADERS` ou `ERR_NO_DATA`.

**L2 — Wallet History : classification sémantique hors périmètre**
Le champ `operation` est extrait brut. La distinction entre dépôt / retrait / frais / earn est laissée aux couches aval. PARSER_V1 ne classifie pas les opérations.

**L3 — Multi-actifs dans un même fichier**
Order History et Trade History peuvent contenir plusieurs paires (TAOUSDC, BTCUSDT…). Le parseur extrait toutes les lignes sans filtrage par actif.

**L4 — Fuseaux horaires**
Les exports Binance indiquent `UTC+2` dans les métadonnées. Les timestamps sont extraits tels quels depuis les cellules. La conversion en UTC absolu est laissée aux couches aval.

**L5 — Familles non couvertes**
Wallet History XLSX/PDF, Earn History, Transaction History, Futures, Margin et tout autre format non observé dans le corpus B1-B19 sont hors périmètre. Toute tentative d'extraction sur ces familles retourne `ERR_NO_HEADERS` ou est bloquée en amont par SOURCE_DETECTION_V1.
