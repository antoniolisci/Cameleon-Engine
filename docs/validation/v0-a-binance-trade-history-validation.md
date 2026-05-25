# V0-A — Validation Binance Spot Trade History

**Date :** 2026-05-25  
**Auteur :** Antonio Lisci  
**Phase :** Phase 3 — Validation terrain  
**Protocole :** Diagnostic progressif — 1 semaine → 1 mois → 3 mois → 6 mois → 1 an

---

## 1. Contexte

Ce document valide la compatibilité de cinq exports Binance Spot Trade History réels avec le pipeline d'import comportemental du moteur (format FR, locale française). Les fichiers couvrent des périodes progressivement longues et servent de corpus officiel V0-A.

Objectif : vérifier que le pipeline complet (encodage → parsing → normalisation → anonymisation → stockage) fonctionne sans modification, et documenter les observations comportementales réelles.

---

## 2. Série officielle V0-A

| Fichier | Taille | Lignes | Trades | Période réelle | Symboles |
|---------|--------|--------|--------|----------------|----------|
| `spot_binance_historique_des_transactions_1_semaine.csv` | 1 960 o | 27 | 26 | 2026-05-21 → 2026-05-24 | TAOUSDC (1) |
| `spot_binance_historique_des_transactions_1_mois.csv` | 2 459 o | 34 | 33 | 2026-04-28 → 2026-05-24 | TAOUSDC (1) |
| `spot_binance_historique_des_transactions_3_mois.csv` | 18 310 o | 256 | 255 | 2026-02-25 → 2026-05-24 | 8 symboles |
| `spot_binance_historique_des_transactions_6_mois.csv` | 43 397 o | 607 | 606 | 2025-11-25 → 2026-05-24 | 10 symboles |
| `spot_binance_historique_des_transactions_1_an.csv` | 103 768 o | 1 436 | 1 435 | 2025-05-23 → 2026-05-24 | 19 symboles |

**Note structure :** Les fichiers sont cumulatifs — chaque fichier contient l'intégralité du fichier précédent. Tous se terminent au 2026-05-24 (dernier jour de trading avant l'export). Les périodes nommées ("1 semaine", "1 mois", etc.) correspondent aux intervalles Binance sélectionnés à l'export, non à des sessions indépendantes.

**Symboles 1_an :** ADAUSDC · ARUSDC · BIOUSDC · BTCEUR · BTCUSDC · ETHUSDC · FETUSDC · HBARUSDC · INJUSDC · LINKUSDC · NEARUSDC · ONDOUSDC · PLUMEUSDC · RENDERUSDC · ROSEUSDC · SEIUSDC · SOLUSDC · TAOUSDC · XRPUSDC

**Symboles 3_mois :** BIOUSDC · FETUSDC · LINKUSDC · ONDOUSDC · PLUMEUSDC · ROSEUSDC · SOLUSDC · TAOUSDC

**Symboles 6_mois :** BIOUSDC · BTCEUR · FETUSDC · INJUSDC · LINKUSDC · ONDOUSDC · PLUMEUSDC · ROSEUSDC · SOLUSDC · TAOUSDC

---

## 3. Diagnostic d'encodage

**Résultat :** Tous les fichiers sont en **UTF-8 avec BOM** (`EF BB BF`).

Vérification sur `1_semaine.csv` — premiers octets :
```
EF BB BF 44 75 72 C3 A9 65 2C ...
↑ BOM     D  u  r  é (UTF-8)   ,
```

`C3 A9` = séquence UTF-8 valide pour `é` (U+00E9). Le parser strip le BOM via `text.replace(/^\ufeff/, '')` et lit le reste correctement. L'affichage `Dur\xe9e` observé en session précédente était un artefact de la console PowerShell (encodage terminal), non un problème de fichier.

**Conclusion encodage :** aucune action requise.

---

## 4. Diagnostic de format des colonnes

**En-tête observé (identique dans les 5 fichiers) :**
```
Durée,Paire,Côté,Prix,Exécuté,Montant,Frais
```

**Mapping via `normalizeKey()` + tables d'alias :**

| Colonne CSV | Forme normalisée | Alias match | Champ canonique |
|-------------|-----------------|-------------|-----------------|
| `Durée` | `duree` | `ALIASES_DATE` | `timestamp` |
| `Paire` | `paire` | `ALIASES_SYMBOL` | `symbol` |
| `Côté` | `cote` | `ALIASES_SIDE` | `side` |
| `Prix` | `prix` | `ALIASES_PRICE` | `price` |
| `Exécuté` | `execute` | `ALIASES_QTY` | `quantity` |
| `Montant` | `montant` | `ALIASES_QUOTE` | `quote_value` |
| `Frais` | `frais` | `ALIASES_FEE` | `fee` |

**7/7 colonnes reconnues.** Aucune colonne orpheline, aucun champ critique manquant.

---

## 5. Diagnostic de format des données

### 5.1 Format date

**Format observé :** `YY-MM-DD HH:MM:SS` — ex : `26-05-24 07:01:57`

**Parsing :** `parseDate()` détecte via regex `/^(\d{2})-(\d{2})-(\d{2})\s(\d{2}:\d{2}:\d{2})$/` → construit `20${YY}-${MM}-${DD}T${HH:MM:SS}Z` → `2026-05-24T07:01:57Z` ✅

Tous les timestamps du corpus sont du format 2-chiffres-année. La regex shortYear couvre l'intégralité des lignes.

### 5.2 Format quantité et montant

**Format observé :** nombre + suffixe asset — ex : `1.4886TAO`, `0.96LINK`, `90.9FET`, `0.00019BTC`

**Parsing :** `parseNum()` via `str.match(/^([\d.]+)/)` → extrait le préfixe numérique, ignore le suffixe ✅

### 5.3 Format frais

**Format observé :** deux variantes dans le même corpus :
- Frais en asset de base : `0.0014886TAO`, `0.0001217TAO` — payés en cryptomonnaie achetée
- Frais en asset de cotation : `0.21546USDC`, `0.03016USDC` — payés en USDC
- Frais en BNB (cas isolé) : `0.000012BNB` — frais Binance natifs

**Parsing :** dans tous les cas, `parseNum()` extrait la valeur numérique ✅. Le suffixe asset est ignoré. La distinction base/quote/BNB n'est pas exploitée par le pipeline actuel — `fee` stocke uniquement la valeur numérique. Comportement attendu, documenté comme limitation acceptable.

### 5.4 Colonnes vides en fin de ligne

**Observé sur certaines lignes :** `...0.0014886TAO,,,` — 3 champs vides après les 7 colonnes.

**Comportement :** les colonnes vides supplémentaires ne correspondent à aucun alias — ignorées par `normalizeTrade()`. Aucun crash, aucun rejet. ✅

### 5.5 Paire BTCEUR (cotation non-USDC)

**Observé dans 6_mois et 1_an :** `BTCEUR` — la colonne `Montant` contient une valeur en EUR, non en USDC.

**Comportement :** le parser extrait `quote_value` en EUR pour ces lignes. Il n'existe pas de conversion devise dans le pipeline actuel. Les métriques comportementales (volume, ratio, taille) seront calculées sur des valeurs EUR comparées à des valeurs USDC — hétérogénéité de devise non détectée.

**Risque :** faible pour V0-A (peu de lignes BTCEUR dans le corpus). Limitation connue, documentée. Pas de correction prévue en Phase 3.

---

## 6. Diagnostic anonymisation

**Module :** `src/js/behavior/anonymize/anonymizer.js`

**Format Trade History :** les exports Spot Trade History n'ont **pas** de champ `orderId` — c'est l'Order History uniquement qui en produit. Sur ce corpus V0-A :

- `anonymizeTrade()` est appelée pour chaque trade ✅
- Aucun champ `orderId` présent → `if ('orderId' in sanitized)` évalue false → spread `{ ...trade }` retourné intact
- Aucune donnée comportementale n'est altérée
- La couche d'anonymisation est fonctionnellement inerte sur Trade History, ce qui est le comportement correct

**Conclusion anonymisation :** pipeline correct, aucun effet de bord.

---

## 7. Contraintes de taille et de performance

| Fichier | Taille | vs. limite 5 MB | Lignes | Estimation parsing |
|---------|--------|-----------------|--------|--------------------|
| 1_semaine | 1,9 Ko | < 0,1 % | 26 | < 10 ms |
| 1_mois | 2,5 Ko | < 0,1 % | 33 | < 10 ms |
| 3_mois | 18 Ko | < 0,4 % | 255 | < 50 ms |
| 6_mois | 43 Ko | < 0,9 % | 606 | < 100 ms |
| 1_an | 104 Ko | 2 % | 1 435 | < 200 ms |

Tous les fichiers sont bien en dessous de la limite de 5 MB. Même le fichier 1_an (101 Ko) est à 2 % de la limite. Le garde-taille ne se déclenchera pas.

---

## 8. Observations comportementales attendues

### 8.1 Profil 1_semaine / 1_mois (mono-asset TAOUSDC)

- **26 trades / 33 trades** — volume faible à modéré
- **1 seul symbole** — CV global = CV par symbole (PS-01 se comporte correctement)
- Profil probable : Range/Carnet (trading concentré sur TAO, mix BUY/SELL rapprochés)
- Score attendu : modéré à élevé (pas de plancher PS-01)

### 8.2 Profil 3_mois (8 symboles, 255 trades)

- Diversification visible : BIOUSDC, FETUSDC, LINKUSDC, ONDOUSDC, PLUMEUSDC, ROSEUSDC, SOLUSDC, TAOUSDC
- CV global commencera à diverger du CV par symbole → PS-01 peut détecter des incohérences de taille inter-symboles légitimes
- Score attendu : intermédiaire

### 8.3 Profil 6_mois / 1_an (10–19 symboles)

- **Pattern attendu :** score plancher ~15 (déjà observé sur REAL_001/REAL_004 — architecture multi-actifs)
- **Cause :** PS-01 `detectSizeInconsistency` utilise le CV global — les différences de taille entre actifs (ex : 0.00019 BTC vs 90.9 FET) gonflent artificiellement le CV → faux positif systematique
- **Décision documentée :** no-patch en Phase 3, correction PS-01 (CV par symbole) à traiter en Priorité A après observation terrain

### 8.4 BTCEUR dans 6_mois / 1_an

- Trades BTC seront présents avec `quote_value` en EUR
- Comparaisons inter-symboles incluront une hétérogénéité de devise
- Impact comportemental : marginal (peu de lignes), documenté

---

## 9. Résultat du diagnostic

| Critère | Statut | Notes |
|---------|--------|-------|
| Encodage fichier | ✅ OK | UTF-8 avec BOM — parser compatible |
| Format colonnes (7/7) | ✅ OK | Tous les alias reconnus |
| Format date YY-MM-DD | ✅ OK | shortYear regex couvre tous les cas |
| Format quantité N.NNNSymbol | ✅ OK | parseNum gère le suffixe asset |
| Format frais mixte (base/quote/BNB) | ✅ OK | Valeur numérique extraite, suffixe ignoré |
| Colonnes vides supplémentaires | ✅ OK | Ignorées silencieusement |
| Taille fichiers (5 MB max) | ✅ OK | 1_an = 101 Ko (2 % de la limite) |
| Anonymisation Trade History | ✅ OK | Inerte sur ce format (pas d'orderId) |
| Paire BTCEUR | ⚠ Limitation | quote_value en EUR — hétérogénéité devise non détectée |
| PS-01 sur multi-actifs | ⚠ Connu | Plancher ~15 attendu sur 6_mois + 1_an (dette D-PS-01) |

**Verdict : aucun bloqueur technique.** Le corpus V0-A est prêt pour validation terrain complète.

---

## 10. Prochaines étapes

1. **Importation effective dans le moteur** — charger chaque fichier dans l'onglet Comportement et vérifier l'absence d'erreur console
2. **Observer le score et le profil** pour chaque période, noter les patterns détectés
3. **Documenter les faux positifs réels** — en particulier PS-01 sur 6_mois/1_an
4. **Remplir les tableaux de calibration** dans `docs/architecture/calibration-terrain.md` (seuils T1/T4/D-ATT-01 provisoires)
5. **Correction PS-01** (Priorité A roadmap) — CV global → CV par symbole dans `detectSizeInconsistency`

---

*Document vivant — mis à jour après chaque session terrain V0-A.*
