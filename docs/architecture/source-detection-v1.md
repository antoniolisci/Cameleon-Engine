# SOURCE_DETECTION_V1 — Détection des sources Binance

**Statut :** Document d'architecture · Aucune implémentation · Aucun code
**Version :** 1.0 — 2026-06-01
**Auteur :** Caméléon Engine Project
**Corpus de référence :** B1-B19 (fichiers terrain Antonio)

---

## 1. Contexte et portée

Ce document définit la logique de détection des sources Binance pour Caméléon Engine.

Son rôle est d'identifier de façon fiable, à partir d'un fichier importé par l'opérateur, la famille de données qu'il contient : Trade History, Order History, Wallet History ou source inconnue.

**Ce document ne définit pas :**
- le parsing du contenu (responsabilité des parseurs aval)
- la logique d'analyse comportementale
- les scores ou métriques dérivées

**Corpus de référence :** B1-B19 — fichiers terrain réels Antonio Lisci, formats CSV / XLSX / PDF.

**Principe directeur :** la détection est conservatrice. En cas de doute, le système retourne `UNKNOWN` plutôt qu'une famille incorrecte. Un faux négatif est préférable à un faux positif.

---

## 2. Familles de sources connues

Les familles ci-dessous sont issues de l'observation directe du corpus B1-B19. Le statut **Observé** indique une présence confirmée dans le corpus. Le statut **Anticipé** indique une famille attendue de l'écosystème Binance, non encore rencontrée dans le corpus.

| Famille | sourceType | Formats observés | Statut |
|---------|-----------|-----------------|--------|
| Trade History Spot | `TRADE_HISTORY_SPOT` | XLSX · PDF | Observé |
| Order History Spot | `ORDER_HISTORY_SPOT` | XLSX · PDF | Observé |
| Wallet History | `WALLET_HISTORY` | CSV | Observé |
| Trade History Spot CSV | `TRADE_HISTORY_SPOT` | CSV | Anticipé |
| Order History Spot CSV | `ORDER_HISTORY_SPOT` | CSV | Anticipé |
| Source inconnue | `UNKNOWN` | — | Cas limite |

**Règle :** une famille anticipée partage la même logique de `sourceType` que sa variante observée. La détection s'appuie sur la signature de colonnes, pas uniquement sur le format de fichier.

---

## 3. Signatures d'identification par famille

### 3.1 Trade History Spot

**Nom de la source :** Trade History Spot
**sourceType :** `TRADE_HISTORY_SPOT`
**Formats supportés :** CSV · XLSX · PDF

**Colonnes caractéristiques (observées corpus B1-B19) :**

| Position | Nom exact (FR) | Rôle |
|----------|---------------|------|
| 1 | Durée | Horodatage de l'exécution |
| 2 | Paire | Symbole de la paire tradée |
| 3 | Côté | Direction : BUY / SELL |
| 4 | Prix | Prix d'exécution unitaire |
| 5 | Exécuté | Quantité d'actif de base exécutée |
| 6 | Montant | Valeur en actif de cotation |
| 7 | Frais | Commission prélevée |

**Éléments discriminants :**
- Présence obligatoire de `Frais` — absent dans Order History
- Absence de `Numéro de commande` — présent dans Order History
- Absence de `Statut` — présent dans Order History
- 7 colonnes au total (hors doublons d'en-tête)

**Variante PDF :** les colonnes sont identiques. L'en-tête de page contient `Historique des trades Spot` et le domaine `www.binance.com`.

---

### 3.2 Order History Spot

**Nom de la source :** Order History Spot
**sourceType :** `ORDER_HISTORY_SPOT`
**Formats supportés :** CSV · XLSX · PDF

**Colonnes caractéristiques (observées corpus B1-B19) :**

| Position | Nom exact (FR) | Rôle |
|----------|---------------|------|
| 1 | Durée | Horodatage de création de l'ordre |
| 2 | Numéro de commande | Identifiant unique de l'ordre |
| 3 | Paire | Symbole de la paire |
| 4 | Type | Limit / Market / Stop-Limit… |
| 5 | Côté | Direction : BUY / SELL |
| 6 | Prix de l'ordre | Prix cible de l'ordre |
| 7 | Montant de la commande | Quantité commandée |
| 8 | Durée | Horodatage d'exécution (doublon de colonne intentionnel Binance) |
| 9 | Exécuté | Quantité réellement exécutée |
| 10 | Prix moyen | Prix moyen d'exécution |
| 11 | Trading total | Valeur totale échangée |
| 12 | Statut | État de l'ordre : Filled / Cancelled… |

**Éléments discriminants :**
- Présence obligatoire de `Numéro de commande` — absent dans Trade History
- Présence obligatoire de `Statut` — absent dans Trade History
- 12 colonnes au total (dont `Durée` apparaissant deux fois — voir §7)

**Variante PDF :** colonnes identiques. L'en-tête de page contient `Historique d'ordre Spot` et le domaine `www.binance.com`.

---

### 3.3 Wallet History

**Nom de la source :** Wallet History
**sourceType :** `WALLET_HISTORY`
**Formats supportés :** CSV uniquement (observé corpus B1-B19)

**Colonnes caractéristiques (observées corpus B1-B19) :**

| Position | Nom exact (EN) | Rôle |
|----------|---------------|------|
| 1 | User_ID | Identifiant Binance de l'utilisateur |
| 2 | UTC_Time | Horodatage de l'opération |
| 3 | Account | Type de compte (Spot, Earn…) |
| 4 | Operation | Nature de l'opération (Transaction Spend, Fee, Buy Crypto…) |
| 5 | Coin | Actif concerné |
| 6 | Change | Variation de solde (positif = crédit, négatif = débit) |
| 7 | Remark | Commentaire libre Binance |

**Éléments discriminants :**
- En-têtes en **anglais** — seule famille du corpus avec des headers EN (Trade et Order History sont en FR)
- Présence de `User_ID` en colonne 1 — unique à cette famille
- Présence de `Operation` — décrit le type de mouvement, pas un trade
- Présence de `Change` — variation signée, pas un prix

**Note :** le format XLSX ou PDF de Wallet History n'a pas été observé dans le corpus B1-B19. La détection XLSX/PDF pour cette famille reste non définie à ce stade.

## 4. Règles de détection

### 4.1 Détection par extension de fichier

L'extension détermine le mécanisme de lecture, pas la famille de données.

| Extension | Mécanisme de lecture | Familles possibles |
|-----------|--------------------|--------------------|
| `.csv` | Lecture texte, séparateur virgule | TRADE_HISTORY_SPOT · ORDER_HISTORY_SPOT · WALLET_HISTORY |
| `.xlsx` | Lecture tableur, skip lignes header Binance | TRADE_HISTORY_SPOT · ORDER_HISTORY_SPOT |
| `.pdf` | Extraction texte structuré | TRADE_HISTORY_SPOT · ORDER_HISTORY_SPOT |
| autre | — | UNKNOWN immédiat |

**Règle :** l'extension seule ne suffit pas à identifier la famille. Elle conditionne uniquement le mode de lecture avant signature.

---

### 4.2 Détection par signature de colonnes

Applicable aux formats CSV et XLSX. La détection repose sur les colonnes normalisées (minuscules, sans accents, sans espaces superflus).

**Algorithme :**

1. Extraire les noms de colonnes de la première ligne de données valide
2. Normaliser chaque nom (trim, lowercase, suppression accents)
3. Comparer aux signatures de référence

**Signatures de référence normalisées :**

| Colonne normalisée | Présente dans | Absente dans |
|--------------------|--------------|-------------|
| `frais` | TRADE_HISTORY_SPOT | ORDER_HISTORY_SPOT · WALLET_HISTORY |
| `numero de commande` | ORDER_HISTORY_SPOT | TRADE_HISTORY_SPOT · WALLET_HISTORY |
| `statut` | ORDER_HISTORY_SPOT | TRADE_HISTORY_SPOT · WALLET_HISTORY |
| `user_id` | WALLET_HISTORY | TRADE_HISTORY_SPOT · ORDER_HISTORY_SPOT |
| `operation` | WALLET_HISTORY | TRADE_HISTORY_SPOT · ORDER_HISTORY_SPOT |
| `change` | WALLET_HISTORY | TRADE_HISTORY_SPOT · ORDER_HISTORY_SPOT |

**Règle de décision :**
- Si `frais` présent ET `numero de commande` absent → `TRADE_HISTORY_SPOT`
- Si `numero de commande` présent ET `statut` présent → `ORDER_HISTORY_SPOT`
- Si `user_id` présent ET `operation` présent → `WALLET_HISTORY`
- Sinon → `UNKNOWN`

---

### 4.3 Détection par contenu (PDF uniquement)

Pour les fichiers PDF, la détection repose sur le texte de l'en-tête de document, extrait de la première page.

| Texte en-tête détecté | sourceType |
|-----------------------|-----------|
| `Historique des trades Spot` | `TRADE_HISTORY_SPOT` |
| `Historique d'ordre Spot` | `ORDER_HISTORY_SPOT` |
| Aucun des deux | `UNKNOWN` |

**Éléments complémentaires de confirmation :**
- Présence de `www.binance.com` en haut de page
- Présence d'un champ `Période(UTC` indiquant une plage de dates
- Présence de colonnes cohérentes avec la famille détectée (vérification secondaire)

**Règle :** la détection PDF est en deux temps — en-tête d'abord, colonnes en confirmation. Si les deux sont cohérents → confidence `HIGH`. Si seul l'en-tête correspond → confidence `MEDIUM`.

---

### 4.4 Ordre de priorité des règles

La détection suit une séquence fixe et non interruptible :

```
1. Extension de fichier
   → si non reconnue : UNKNOWN · arrêt
   → si reconnue : continuer

2. Pour CSV / XLSX : détection par signature de colonnes (§4.2)
   → si signature identifiée : sourceType défini · continuer vers §5
   → si non identifiée : UNKNOWN · continuer vers §6

3. Pour PDF : détection par contenu en-tête (§4.3)
   → si en-tête identifié : sourceType défini · continuer vers §5
   → si non identifié : UNKNOWN · continuer vers §6

4. Attribution du niveau de confidence
   → HIGH : signature complète et non ambiguë
   → MEDIUM : correspondance partielle (colonnes incomplètes ou en-tête seul)
   → LOW : un seul élément discriminant trouvé
```

## 5. Structure de retour standard

La détection produit systématiquement un objet structuré, quel que soit le résultat — y compris en cas d'échec.

```
{
  sourceType : string   // "TRADE_HISTORY_SPOT" | "ORDER_HISTORY_SPOT" | "WALLET_HISTORY" | "UNKNOWN"
  format     : string   // "CSV" | "XLSX" | "PDF" | "UNKNOWN"
  confidence : string   // "HIGH" | "MEDIUM" | "LOW" | "NONE"
}
```

**Règles de remplissage :**

| Situation | sourceType | format | confidence |
|-----------|-----------|--------|-----------|
| Famille identifiée, signature complète | famille détectée | format réel | `HIGH` |
| Famille identifiée, signature partielle | famille détectée | format réel | `MEDIUM` |
| Famille identifiée, un seul discriminant | famille détectée | format réel | `LOW` |
| Extension non reconnue | `UNKNOWN` | `UNKNOWN` | `NONE` |
| Extension reconnue, signature introuvable | `UNKNOWN` | format réel | `NONE` |

**Invariant :** le champ `format` est toujours rempli si l'extension est reconnue, même quand `sourceType` est `UNKNOWN`.

---

## 6. Gestion des cas Unknown

Un fichier classé `UNKNOWN` n'est jamais rejeté silencieusement.

**Comportement attendu :**

1. **Pas de crash** — la détection se termine proprement avec `sourceType: "UNKNOWN"`
2. **Conservation du fichier** — le fichier n'est pas supprimé ni modifié
3. **Message utilisateur** — l'interface doit afficher un message explicite : le fichier a été reçu mais sa source n'a pas pu être identifiée
4. **Pas de traitement aval** — aucun parseur n'est invoqué sur un fichier `UNKNOWN`
5. **Loggabilité** — l'objet de retour complet est disponible pour diagnostic (nom de fichier, extension détectée, colonnes trouvées si applicable)

**Message utilisateur recommandé :**
> "Ce fichier n'a pas été reconnu comme une source Binance connue. Vérifiez qu'il s'agit bien d'un export Trade History, Order History ou Wallet History."

**Ce que le système ne fait pas en cas de Unknown :**
- Il ne tente pas de deviner la famille
- Il ne force pas un sourceType par défaut
- Il ne déclenche pas d'analyse partielle

---

## 7. Limites et ambiguïtés connues

### L1 — Doublon de colonne `Durée` dans Order History

L'export Binance Order History contient deux colonnes nommées `Durée` : la première correspond à l'horodatage de création de l'ordre, la seconde à l'horodatage d'exécution. Ce doublon est présent dans les formats XLSX et PDF du corpus B1-B19.

**Impact détection :** nul — la présence de `Numéro de commande` suffit à identifier Order History sans utiliser `Durée`.

**Impact parsing aval :** à traiter par le parseur Order History (hors périmètre de ce document).

---

### L2 — Langue des en-têtes

Trade History et Order History ont des en-têtes en français. Wallet History a des en-têtes en anglais. Si Binance propose un jour un export Wallet History en français, la règle de détection par langue deviendra insuffisante — seule la présence de `User_ID` et `Operation` resterait discriminante.

---

### L3 — Formats XLSX et PDF de Wallet History non observés

Le corpus B1-B19 ne contient pas de Wallet History au format XLSX ou PDF. Les règles de détection §4.2 et §4.3 pour Wallet History sont donc incomplètes pour ces formats. Si ces formats sont rencontrés sur le terrain, une mise à jour de ce document est requise avant toute implémentation.

---

### L4 — Trade History CSV et Order History CSV non observés

Le corpus B1-B19 ne contient pas de Trade History ni d'Order History au format CSV. Les signatures de colonnes documentées en §3 sont extrapolées depuis les formats XLSX observés. Une confirmation terrain est nécessaire avant de considérer ces signatures comme définitives pour le format CSV.

---

### L5 — Fichiers corrompus ou tronqués

Si un fichier CSV ou XLSX ne contient pas de ligne de données exploitable (vide, corrompu, protégé), la détection retourne `UNKNOWN` avec `confidence: "NONE"`. Aucun comportement spécifique n'est défini pour les fichiers partiellement corrompus — à traiter au niveau parseur.
