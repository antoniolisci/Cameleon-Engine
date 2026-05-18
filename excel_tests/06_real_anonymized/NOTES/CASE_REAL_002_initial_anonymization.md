# CASE_REAL_002 — Anonymisation initiale : Binance Trade History TAOUSDC (120 trades)

**Date :** 2026-05-18  
**Phase :** 4 — Datasets réels anonymisés  
**Statut :** CLEAN généré — en attente de validation terrain

---

## 1. Source

| Champ | Valeur |
|-------|--------|
| Fichier RAW | `Binance-Historique-des-trades-Spot-202605181005(UTC+2)_d12e8614.xlsx` |
| Format | Binance **Trade History** XLSX (pas Order History) |
| Exporté le | 2026-05-18 à 10:05 UTC+2 |
| Période brute | 2026-03-17 → 2026-05-03 (~47 jours) |
| Total lignes brutes | 120 trades |
| Statut | Tous FILLED par construction (Trade History = trades exécutés uniquement) |
| Différence vs REAL_001 | REAL_001 = Order History (25 mois, 64 symboles) ; REAL_002 = Trade History (47 jours, 1 symbole) |

---

## 2. Structure XLSX brute

Le fichier présente la même structure de méta-en-tête que REAL_001 :

| Ligne | Contenu |
|-------|---------|
| 0 | Vide |
| 1 | `www.binance.com` |
| 2 | `Historique des trades Spot` |
| 3 | Vide |
| 4 | `Nom: ANTONIO LISCI` · `E-mail: antonio.lisci@gmail.com` · `Adresse: 449 rue du Perron` |
| 5 | `ID utilisateur: 478192933` · `Période(UTC+2): 2026-03-18 to 2026-05-18` |
| 6–8 | Vides |
| 9 | **Headers** : Durée · Paire · Côté · Prix · Exécuté · Montant · Frais |
| 10+ | Données trades |

Particularité structurelle : les colonnes de données sont en positions paires (indices 2, 4, 6, 8, 10, 12, 14) séparées par des colonnes None — artefact de mise en page Binance.

---

## 3. Colonnes supprimées (PII)

| Élément supprimé | Raison |
|-----------------|--------|
| Lignes 0–8 du XLSX (méta-en-tête Binance) | PII directe : Nom, E-mail, Adresse, User ID |
| Colonnes None intercalées | Artefacts structurels sans valeur analytique |

**Note :** Le format Trade History ne contient pas de colonne `Numéro de commande` (Order ID). La suppression de PII se limite aux lignes d'en-tête. Aucune colonne de données n'est supprimée.

---

## 4. Colonnes conservées et noms CSV CLEAN

| Colonne source (XLSX) | Nom CSV CLEAN | `normalizeKey()` | Alias matché |
|-----------------------|---------------|------------------|--------------|
| Durée | `Duree` | `duree` | `ALIASES_DATE['duree']` ✅ |
| Paire | `Paire` | `paire` | `ALIASES_SYMBOL['paire']` ✅ |
| Côté | `Cote` | `cote` | `ALIASES_SIDE['cote']` ✅ |
| Prix | `Prix` | `prix` | `ALIASES_PRICE['prix']` ✅ |
| Exécuté | `Execute` | `execute` | `ALIASES_QTY['execute']` ✅ |
| Montant | `Montant` | `montant` | `ALIASES_QUOTE['montant']` ✅ |
| Frais | `Frais` | `frais` | `ALIASES_FEE['frais']` ✅ |

**7/7 colonnes mappées sans blocage.** Aucune correction de nom nécessaire (contrairement à REAL_001 où `Date_ouverture` → `Duree` avait dû être corrigé).

---

## 5. Transformations d'anonymisation appliquées

| Transformation | Valeur | Raison |
|----------------|--------|--------|
| Décalage temporel | +60 jours (uniforme) | Cohérence avec REAL_001 ; brise la corrélation avec l'historique de prix public |
| Offset prix | Aucun (décision utilisateur) | Préserve cohérence analytique `price × quantity = montant` |
| Facteur quantité | Aucun (décision utilisateur) | Préserve CV, avgSize, métriques comportementales |
| Encodage sortie | UTF-8 BOM | Compatibilité Excel / moteur |

---

## 6. Vérification PII post-génération

| Terme recherché | Résultat |
|----------------|----------|
| ANTONIO / LISCI | Non trouvé |
| antonio.lisci | Non trouvé |
| 478192933 (User ID) | Non trouvé |
| 449 rue du Perron | Non trouvé |

**Conclusion PII :** CLEAN — aucun identifiant direct résiduel. Aucun Order ID à supprimer (Trade History n'en contient pas).

---

## 7. Profil du dataset CLEAN

| Dimension | Valeur |
|-----------|--------|
| Fichier CLEAN | `REAL_002_taousdc_trade_history_120_trades.csv` |
| Période anonymisée | 2026-05-16 → 2026-07-02 (~47 jours) |
| Trades | **120** |
| BUY | 63 (52.5%) |
| SELL | 57 (47.5%) |
| Symboles | **1 (TAOUSDC uniquement)** |
| Types d'ordre | Non présent dans Trade History (info perdue) |
| Fee — SELL | En USDC (quote currency) |
| Fee — BUY | En TAO (base currency) |
| Cohérence price × qty | 120/120 OK (0 incohérence) |

### Métriques analytiques prédites

| Métrique | Valeur | Interprétation |
|----------|--------|----------------|
| `avgSize` (price×qty) | 35.03 USDC | Positions modestes (~35 USDC/trade) |
| `stdev(tradeSize)` | 35.28 | Forte dispersion relative |
| **CV tradeSize** | **1.007** | `size_inconsistency` probable (seuil 0.5) — mais variabilité intra-actif réelle |
| `oversizedTradesCount` | **15** (>2×avgSize) | Pénalité métrique −10 (seuil ≥ 3) |
| `avg quote_value` | 35.03 USDC | validateTrades OK (seuil 10 000) |
| BUY / SELL | 63 / 57 | dataQuality HIGH attendu |
| Gaps ≤ 3min | 27 / 119 (22.7%) | Grid grouper potentiellement actif |
| Gap minimum | ~0 min (trades simultanés) | 2 trades identiques à `26-03-18 14:33:56` |
| Gap médian | 82.6 min | Activité espacée — pas de trading continu |

---

## 8. Audit pipeline statique (2026-05-18)

### Méthodologie

Simulation complète en Python du pipeline JS : `classifyFile()` → `detectFormat()` → `normalizeTrade()` sur les 120 lignes. Chaque étape reproduite fidèlement depuis `uploader.js`, `format-detector.js`, `binance_spot.js`.

### Résultats

**`classifyFile()` :**

| Signal | Résultat | Via |
|--------|---------|-----|
| date | ❌ non détecté | `normalizeHeader('Duree')` = `'duree'` absent de `DETECT_DATE` |
| symbol | ✅ | `'paire'` exact match |
| side | ✅ | `'cote'` exact match |
| price | ✅ | `'prix'` exact match |
| qty | ✅ | `'execute'` exact match |
| → | **FULL_TRADING (4/5)** | Import accepté |

**Note :** `'duree'` n'est pas dans `DETECT_DATE` (la liste de classification dans `uploader.js`). Le fichier est néanmoins classifié FULL_TRADING (4 signaux suffisent). Ceci diffère de `binance_spot.js` où `'duree'` EST dans `ALIASES_DATE` et est donc correctement extrait lors du mapping. Asymétrie connue, sans impact sur le résultat.

**`detectFormat()` :**
- `Frais` → `normalizeH` → `'frais'` → dans `SIGNALS_FEE` → `hasFee = true`
- `hasStatus = false` (pas de colonne Statut dans Trade History)
- → **TRADE_HISTORY** ✅ Pipeline `mapBinanceSpotRow()` activé

**`normalizeTrade()` — audit de mapping :**

| Champ | Clé normalisée | Alias matché | Valeur exemple |
|-------|---------------|--------------|----------------|
| date | `duree` | `ALIASES_DATE['duree']` | `'2026-07-02 17:18:12'` ✅ |
| symbol | `paire` | `ALIASES_SYMBOL['paire']` | `'TAOUSDC'` ✅ |
| side | `cote` | `ALIASES_SIDE['cote']` | `'SELL'` ✅ |
| price | `prix` | `ALIASES_PRICE['prix']` | `'290.2'` ✅ |
| qty | `execute` | `ALIASES_QTY['execute']` | `'0.111TAO'` → 0.111 ✅ |
| quote | `montant` | `ALIASES_QUOTE['montant']` | `'32.2122USDC'` → 32.2122 ✅ |
| fee | `frais` | `ALIASES_FEE['frais']` | `'0.0322122USDC'` → 0.0322122 ✅ |

**Simulation post-correction (120 lignes) :**

| Métrique | Valeur |
|----------|--------|
| Lignes acceptées | **120 / 120 (100%)** |
| Rejets timestamp null | 0 |
| Rejets champ manquant | 0 |
| Incohérences price × qty > 5% | 0 |

Aucune correction de colonne nécessaire. Le fichier est directement importable.

---

## 9. Analyse comparative REAL_001 vs REAL_002

### Caractéristiques générales

| Dimension | REAL_001 | REAL_002 |
|-----------|---------|---------|
| Format source | Order History | **Trade History** |
| Durée historique | 25 mois | **47 jours** |
| Trades | 1685 | **120** |
| Symboles | 64 | **1 (TAOUSDC)** |
| Fee disponible | Non | **Oui (Frais)** |
| Order ID | Oui (supprimé) | **Non (absent par design)** |
| Correction parser nécessaire | Oui (`Date_ouverture` → `Duree`) | **Non (0 correction)** |
| Pipeline activé | `mapOrderRows()` | **`mapBinanceSpotRow()`** |

### Métriques analytiques comparées

| Métrique | REAL_001 | REAL_002 | Interprétation |
|----------|---------|---------|----------------|
| CV tradeSize | **2.478** | **1.007** | R002 : variabilité intra-actif réelle (pas d'inflation multi-actifs) |
| oversizedTradesCount | 188 | **15** | R002 : disproportion locale, pas structurelle |
| dataQuality attendu | HIGH | **HIGH** | Les deux équilibrés BUY/SELL |
| Gaps ≤ 3min | 235/602 (TAOUSDC) | 27/119 (tout) | R002 : moins dense mais clustering réel |
| Période | Multi-phases (25 mois) | **Mono-phase (~7 semaines)** | R002 : comportement plus homogène |
| Lisibilité comportementale | Faible (multi-actifs, long) | **Haute (mono-actif, court)** | R002 permet une lecture ciblée |

### Impact sur les limites LS connues

| Limite LS (REAL_001) | Impact sur REAL_002 |
|---------------------|---------------------|
| LS-1 — CV multi-actifs (2.478) | **Atténué** : CV=1.007, même cause éliminée (mono-actif). Variabilité résiduelle = réelle |
| LS-2 — oversizedTradesCount (188) | **Atténué** : 15 oversized. Reflète des positions réellement plus grandes |
| LS-3 — Amplification post-grouper | **Présente** : 27 gaps ≤ 3min → grouper probablement actif, effets attendus |
| LS-4 — Score moyen multi-phases | **Éliminée** : 47 jours = période homogène, un seul contexte comportemental |

### REAL_002 est analytiquement plus propre que REAL_001

REAL_002 représente un dataset **de meilleure qualité analytique** pour la Phase 4 :

1. **CV réel vs structurel** : le CV de 1.007 reflète une vraie variabilité de position sur TAOUSDC, pas une inflation mathématique due aux prix inter-actifs. Si `size_inconsistency` se déclenche, c'est un signal potentiellement réel.

2. **Fee disponible** : la colonne `Frais` apporte une dimension analytique supplémentaire absente de REAL_001. Le moteur extrait `fee` via `ALIASES_FEE` — ce champ peut être exploité dans des métriques futures sans patch.

3. **Lisibilité comportementale** : 120 trades sur 47 jours sur un seul actif → les patterns détectés sont directement interprétables. REAL_001 (1685 trades / 25 mois / 64 actifs) rendait la lecture comportementale globale peu fiable.

4. **Cohérence temporelle** : une seule période de marché. Le score reflète un comportement homogène, pas une moyenne de 25 mois de stratégies différentes.

**Réserve :** 120 trades est proche du seuil bas pour les métriques comportementales (SYN-001 = 200 trades, considéré comme baseline). Certains patterns nécessitent un volume suffisant pour être significatifs.

---

## 10. Anomalies connues (avant test terrain)

| Anomalie | Type | Description |
|----------|------|-------------|
| CV=1.007 sur mono-actif | BC/LS | Size_inconsistency probable — reflète variabilité réelle des positions sur TAOUSDC ; moins structurel que REAL_001 mais à confirmer |
| oversizedTradesCount=15 | BC | 15 trades > 2×avgSize — positions réellement plus grandes sur certains mouvements |
| 2 trades simultanés (`26-03-18 14:33:56`) | Observ. | BUY 0.3379TAO + BUY 0.0041TAO au même instant — probable split de fill ou ajustement de position |
| 27/119 gaps ≤ 3min | BC/AG | Clustering réel → groupGridTrades() potentiellement actif → effets secondaires métriques attendus |
| Fee dual-currency (USDC/TAO) | Observ. | SELL fees en USDC, BUY fees en TAO — parseNum extrait la valeur numérique ; la devise est ignorée par le moteur |
| 120 trades (volume limité) | LQ | Proche du seuil bas pour certaines métriques comportementales |

---

## 11. Hypothèses analytiques pré-terrain

| Pattern | Probabilité | Raisonnement |
|---------|------------|-------------|
| `size_inconsistency` | **Moyenne** | CV=1.007 > seuil 0.5, mais variabilité intra-actif — à distinguer d'un FP structurel |
| `oversizing` (métrique) | **Haute** | 15 oversized > seuil 3 → pénalité −10 quasi-certaine |
| `grid_trading` | **Moyenne** | 27 gaps ≤ 3min sur 119 — grouper actif si même symbole + même côté dans ces clusters |
| `rapid_reentry` | **Basse à moyenne** | 47 jours TAOUSDC — dépend de l'alternance BUY→SELL rapide |
| `overtrading` | **Basse** | Médiane 82.6 min entre trades — densité globale faible |
| `loss_chasing` | **Basse** | Dépend des séquences de prix dans les mouvements baissiers |

**Score prédit : 45–70** (moins pénalisé que REAL_001 car sans LS-1/LS-4, mais size_inconsistency et oversizing attendus)

---

## 12. Checklist terrain

- [ ] Serveur local démarré (`serve-local.ps1`)
- [ ] Console DevTools ouverte — filtre **Verbose** activé (pour voir `[bhv:grid]`)
- [ ] Fichier importé : `CLEAN/REAL_002_taousdc_trade_history_120_trades.csv`
- [ ] Import réussi (pas d'erreur UI)
- [ ] Score noté
- [ ] dataQuality noté (LOW / PARTIAL / HIGH)
- [ ] Patterns listés (chacun avec severity)
- [ ] Logs `[bhv:grid]` notés (groupes détectés ?)
- [ ] Aucun crash / NaN / freeze
- [ ] Comparaison score REAL_002 vs REAL_001 documentée
- [ ] Section `§13 Résultats terrain` complétée dans ce fichier

---

## 13. Résultats terrain (à remplir)

| Champ | Prédit | Observé |
|-------|--------|---------|
| Import réussi | ✅ | — |
| Trades importés | 120 | — |
| dataQuality | HIGH | — |
| Score | 45–70 | — |
| Lecture comportementale | — | — |
| Profil | — | — |
| Logs `[bhv:grid]` | Groupes probables | — |
| Crash / NaN / freeze | Aucun | — |
