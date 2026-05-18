# PHASE 4 — Protocole de validation sur datasets réels anonymisés

**Date :** 2026-05-18  
**Statut :** Ouvert  
**Périmètre :** Pipeline analytique comportemental uniquement — `metrics.js`, `patterns.js`, `scoring.js`, `behavior-view.js`, `grid-grouper.js`  
**Aucune modification de code dans ce document.**

---

## 1. Objectif de la Phase 4

Les phases 1 à 3 ont validé le pipeline sur données synthétiques contrôlées (200 à 1000 trades, distributions uniformes, seed fixe). Ces conditions garantissent la reproductibilité mais ne représentent pas le comportement humain réel.

La Phase 4 vise à valider la robustesse analytique du pipeline sur des données réelles anonymisées, c'est-à-dire des exports Binance Trade History provenant de sessions de trading effectivement exécutées.

### Objectifs mesurables

| Objectif | Critère de succès |
|----------|------------------|
| Robustesse sur distributions réelles | Aucun crash, aucun NaN, aucune exception non catchée |
| Cohérence du scoring | Scores dans [0, 100] sur tous les datasets |
| Pertinence des patterns | Patterns déclenchés reconnus comme plausibles par l'opérateur |
| Comportement `dataQuality` | LOW/PARTIAL/HIGH correctement assignés |
| Stabilité UI | Aucun freeze, aucun élément DOM manquant |
| Comportement `groupGridTrades()` | Groupes détectés uniquement quand le profil le justifie |

---

## 2. Différences SYN vs réel

| Dimension | Datasets SYN (Phases 1–3) | Datasets réels (Phase 4) |
|-----------|--------------------------|--------------------------|
| Distribution temporelle | Régulière (seed fixe, espacement constant) | Irrégulière — concentration autour de sessions, pauses longues |
| Taille des positions | Uniforme (range fixe) | Variable — reflet de la conviction réelle |
| Rythme | Prévisible — calculé analytiquement | Imprévisible — dépend du contexte marché |
| Patterns | Injectés délibérément | Émergents — potentiellement absents, multiples, ou contradictoires |
| Transitions comportementales | Absentes ou structurées | Possibles — profil peut changer au cours de la période |
| dataQuality | Contrôlée (HIGH par construction) | Dépend de l'historique réel — peut être LOW ou PARTIAL |
| Bruit | Nul | Présent — fees anormaux, timestamps corrompus, colonnes absentes |

Les données réelles testeront des cas que les SYN ne peuvent pas reproduire : périodes d'inactivité longues, comportements mixtes, faux positifs sur data sparse.

---

## 3. Règles d'anonymisation

Tout dataset réel doit être anonymisé avant import dans `06_real_anonymized/CLEAN/` ou validation. L'anonymisation est une précondition non négociable.

### Transformations requises

| Élément | Règle |
|---------|-------|
| Timestamps | Décalage temporel fixe (ex : +/− N jours uniformément) — préserve les intervalles relatifs |
| Prix | Offset additif fixe (ex : +20 USDT) — préserve les variations relatives |
| Quantités | Multiplication par un facteur fixe (ex : × 0.7) — préserve les ratios |
| Symboles | Conserver le ticker (TAOUSDT, BTCUSDT…) — nécessaire pour la logique par symbole |
| Fees | Dériver automatiquement depuis les prix/quantités transformés |
| User ID | Supprimer — ne doit jamais apparaître dans un dataset commité |
| Données financières brutes | Ne jamais commiter le fichier RAW — uniquement CLEAN ou VALIDATED |

### Transformations interdites

- Ne pas modifier l'ordre des trades (le tri chronologique doit rester valide)
- Ne pas arrondir les timestamps (la précision à la minute est nécessaire pour les fenêtres glissantes)
- Ne pas supprimer des trades individuels (biaiserait les métriques de rythme et de volume)

### Vérification avant commit

Avant tout commit d'un dataset CLEAN ou VALIDATED :
- Confirmer l'absence de toute valeur identifiable (email, UID, adresse)
- Confirmer que le fichier ne provient pas d'un export contenant des soldes ou des transferts (wallet history ≠ trade history)
- Ne commiter **que** les fichiers dans `06_real_anonymized/VALIDATED/`

---

## 4. Convention de nommage

Tous les datasets réels suivent la convention :

```
REAL_NNN_[description courte]_[N]_trades.[ext]
```

| Composant | Règle |
|-----------|-------|
| `REAL_` | Préfixe fixe — distingue des datasets SYN |
| `NNN` | Numéro séquentiel à 3 chiffres (001, 002…) |
| `[description]` | Mots-clés en minuscules séparés par `_` — résume le profil observé (ex : `overtrading`, `grid`, `dca_progressif`, `swing_mixte`) |
| `[N]_trades` | Nombre de trades dans le fichier CLEAN |
| `[ext]` | `csv` uniquement dans VALIDATED — le XLSX source reste dans RAW |

**Exemples :**
```
REAL_001_swing_mixte_87_trades.csv
REAL_002_grid_taousdt_312_trades.csv
REAL_003_overtrading_btcusdt_54_trades.csv
```

La CASE correspondante (dans `NOTES/`) porte le même nom de base :
```
CASE_REAL_001_swing_mixte_87_trades.md
```

---

## 5. Structure des dossiers

```
excel_tests/
└── 06_real_anonymized/
    ├── RAW/        ← Export Binance brut — jamais commité, jamais partagé
    ├── CLEAN/      ← Fichier anonymisé (offset timestamps, prix, quantités) — non commité
    ├── VALIDATED/  ← Fichier prêt à être utilisé dans les tests — commitable si 100% anonymisé et validé
    ├── REJECTED/   ← Datasets écartés (format non supporté, trop peu de trades, anomalie bloquante)
    └── NOTES/      ← Fiches CASE_REAL_*.md — committées
```

### RAW/
Export brut issu de Binance (CSV ou XLSX). Contient les données financières réelles non modifiées. **Ne jamais commiter.** Ne jamais partager. Entrée uniquement.

### CLEAN/
Version anonymisée du RAW : timestamps décalés, prix offsets, quantités normalisées. Prêt pour l'import dans l'outil. **Non commité** — peut encore contenir des patterns identifiables si le trader est connu. Étape intermédiaire avant VALIDATED.

### VALIDATED/
Dataset CLEAN ayant passé la vérification complète d'anonymisation et l'import sans erreur. **Commitable** si la checklist d'anonymisation est confirmée. C'est la source officielle pour les tests de Phase 4.

### REJECTED/
Datasets dont l'import a échoué, dont la structure est incompatible (Earn, Wallet, Order History non FILLED), ou dont le volume est trop faible (< 10 trades). Conserver avec une fiche de rejet pour traçabilité.

### NOTES/
Fiches markdown `CASE_REAL_*.md`. Documentent les métadonnées, résultats terrain, anomalies observées et conclusions pour chaque dataset. **Committées.** C'est le seul contenu de `06_real_anonymized/` qui entre dans le repo.

---

## 6. Métadonnées minimales par dataset

Chaque fiche `CASE_REAL_*.md` doit documenter les champs suivants **avant** de commencer le test terrain :

### Métadonnées de source

| Champ | Description |
|-------|-------------|
| `periode` | Plage de dates des trades (après anonymisation) |
| `nombre_trades` | Nombre de trades dans le fichier CLEAN importé |
| `symboles` | Liste des paires présentes (ex : TAOUSDT, BTCUSDT) |
| `type_activite` | Description qualitative (ex : swing court terme, grid TAOUSDT, DCA mensuel) |
| `source_import` | Format du fichier source (ex : Binance Trade History CSV) |
| `anomalies_connues` | Particularités identifiées lors de la préparation (ex : gap de 3 jours, fees anormaux) |

### Résultats analytiques

| Champ | Description |
|-------|-------------|
| `dataQuality` | Niveau observé (LOW / PARTIAL / HIGH) avec raison |
| `patterns_attendus` | Patterns que l'opérateur s'attendait à voir compte tenu du type d'activité |
| `patterns_observes` | Patterns effectivement détectés par le moteur |
| `score` | Score comportemental observé (0–100) |
| `score_attendu` | Estimation subjective de l'opérateur avant le test |

### Conclusion

| Champ | Description |
|-------|-------------|
| `conclusion_analytique` | Cohérence du score vs activité réelle — justifiée ou non |
| `classification` | Voir §8 (faux positif, comportement confirmé, etc.) |
| `action` | Aucune / Documenter / Recommandation V2 |

---

## 7. Protocole d'import

### Étape 1 — Préparation

1. Télécharger l'export Trade History depuis Binance (pas Order History, pas Wallet)
2. Vérifier que le fichier contient les colonnes attendues : `Date(UTC), Pair, Side, Price, Executed, Amount, Fee`
3. Appliquer l'anonymisation (§3) — sauvegarder dans `CLEAN/`
4. Vérifier l'absence de données personnelles dans CLEAN
5. Ouvrir le serveur local (`serve-local.ps1`)

### Étape 2 — Import dans l'outil

1. Ouvrir `http://localhost:8000/src/index.html`
2. Naviguer vers l'onglet Comportement
3. Ouvrir DevTools → Console → **activer "Tous les niveaux" (Verbose)** — nécessaire pour les logs `[bhv:grid]` et `[bhv:patterns]`
4. Importer le fichier CLEAN via le bouton d'import
5. Observer la console dès l'import

### Étape 3 — Lecture des résultats

Consigner dans la CASE :
- Nombre de trades importés et ignorés
- Présence de warnings `[bhv:map]`
- Log `[bhv:grid]` si présent (groupes détectés)
- `dataQuality.level` affiché
- Score affiché
- Patterns affichés (label + severity)

### Étape 4 — Validation

Comparer les résultats observés avec les patterns attendus (§6). Classifier selon §8. Remplir la grille d'observation (§9).

---

## 8. Checklist DevTools

Avant toute lecture de résultats :

- [ ] Niveau de log console : **"Tous les niveaux"** ou **"Verbose"** activé
- [ ] Aucune exception rouge non catchée
- [ ] Aucun `[bhv:map] ❌` (import partiel)
- [ ] Si `[bhv:grid]` présent : noter le nombre de groupes et de trades absorbés
- [ ] `dataQuality.level` lisible dans le bandeau ou le score card
- [ ] Score dans [0, 100] — vérifier que ce n'est pas NaN via la console si douteux
- [ ] Aucun élément DOM affiché avec la valeur `undefined` ou `NaN`
- [ ] Aucun freeze UI (analyse terminée en < 2s pour les datasets < 500 trades)

---

## 9. Grille d'observation

Pour chaque dataset REAL, remplir après import :

| Checkpoint | Attendu | Observé | Commentaire |
|-----------|---------|---------|-------------|
| Import OK (`ok: true`) | Oui | — | — |
| Nombre de trades importés | N (CLEAN) | — | Écart si ignorés |
| Warnings `[bhv:map]` | Aucun | — | — |
| `[bhv:grid]` actif | Selon profil | — | Nombre groupes / absorbés |
| `dataQuality.level` | Selon volume | — | Raison affichée |
| Score comportemental | Estimation opérateur | — | Cohérence subjective |
| Pattern 1 | — | — | Attendu / observé / absent |
| Pattern 2 | — | — | — |
| Pattern 3 | — | — | — |
| NaN / Infinity | Absent | — | — |
| Exception console | Absente | — | — |
| Freeze UI | Absent | — | — |
| Durée analyse | < 2s | — | Mesurer si > 200 trades |

---

## 10. Classification des anomalies

Chaque écart entre comportement attendu et observé doit être classifié selon une des catégories suivantes.

### Catégories primaires

| Code | Nom | Définition |
|------|-----|-----------|
| `FP` | Faux positif | Pattern déclenché sur données qui ne correspondent pas au comportement ciblé |
| `FN` | Faux négatif | Pattern absent alors que le comportement est clairement présent |
| `BA` | Comportement ambigu | Pattern détecté mais interprétation discutable — ni clairement FP ni clairement réel |
| `BC` | Comportement confirmé | Pattern détecté et reconnu comme cohérent avec l'activité réelle de l'opérateur |
| `AG` | Artefact grouping | Anomalie causée par la consolidation `_isGridGroup` (ex : size_inconsistency sur groupes) |
| `LQ` | Limitation dataQuality | Score ou pattern biaisé par une insuffisance de données (LOW/PARTIAL) |
| `LS` | Limitation scoring | Score ne reflète pas le comportement réel par construction du moteur (ex : paceDelay global dilue un overtrading localisé) |
| `LM` | Limitation métrique | Métrique calculée correctement mais non pertinente pour ce type de trade (ex : avgBuySize sur SELL-only) |
| `LS2` | Limitation structurelle | Comportement non détectable en principe — pattern requiert une information absente du format (ex : P&L, position taille réelle) |

### Règles de classification

1. Un seul code primaire par anomalie.
2. Si plusieurs codes s'appliquent, retenir le code le plus précis (AG > LQ > LS).
3. La classification est faite par l'opérateur — elle est subjective et documentée comme telle.
4. Une classification `FP` ou `FN` ne déclenche **pas** automatiquement une correction du moteur (voir §14).

---

## 11. Procédure de documentation

Pour chaque dataset, dans l'ordre :

1. Préparer la CASE avant le test (métadonnées source + patterns attendus)
2. Importer et remplir la grille d'observation
3. Classifier chaque écart observé selon §10
4. Rédiger la conclusion analytique
5. Décider de l'action (`Aucune` / `Documenter` / `Recommandation V2`)
6. Sauvegarder la CASE dans `NOTES/`
7. Si le dataset CLEAN passe la checklist d'anonymisation complète : déplacer vers `VALIDATED/`
8. Commiter la CASE (pas le dataset)

---

## 12. Règles anti-biais

Ces règles protègent la généralisation du moteur contre la sur-optimisation sur un dataset particulier.

### Ce que Phase 4 NE DOIT PAS faire

1. **Ne pas ajuster les seuils du moteur à un seul dataset.** Un faux positif isolé sur REAL_001 n'est pas une raison de modifier `OVERTRADING_MIN_TRADES`, `REVENGE_MAX_GAP_MIN`, ou `LC_ESCALATION_FACTOR`.

2. **Ne pas corriger chaque faux positif.** Certains FP sont inévitables sur données réelles — le moteur est conçu pour identifier des tendances, pas pour être un oracle exhaustif.

3. **Ne pas transformer le moteur en outil de justification.** Si un opérateur conteste un score, la réponse n'est pas de modifier le moteur — c'est de mieux documenter ses limites.

4. **Ne pas casser la généralisation.** Une règle ajoutée pour passer REAL_002 peut introduire un FP sur SYN-005. Toute modification doit être re-validée sur les 6 datasets SYN précédents.

5. **Ne pas sur-pondérer les patterns rares.** Un comportement détecté sur 1 dataset réel sur 5 n'est pas une raison d'augmenter son poids dans le scoring.

6. **Ne pas interpréter l'absence de pattern comme une validation.** Un FN peut être une limitation structurelle (§10 LS2) — ne pas le corriger si le pattern requiert une information absente du format.

---

## 13. Limites connues du moteur

Ces limites sont connues et documentées. La Phase 4 les observera mais ne les corrigera pas.

| Limite | Description | Impact |
|--------|-------------|--------|
| `paceDelay` global | Le délai moyen est calculé sur tous les trades — dilue les bursts localisés | Overtrading localisé pénalisé moins sévèrement que prévu |
| `_isGridGroup` taille | Les trades synthétiques ont N× la taille des trades normaux | size_inconsistency et oversizedTradesCount artificiellement élevés |
| `dataQuality LOW` autorité | Le score est produit même sur datasets incomplets (ex : SELL-only) | Score 90 peut masquer une lecture comportementale partielle |
| P&L absent | Aucun calcul de profit/perte par trade — Trade History ne le fournit pas | `loss_chasing` basé sur taille de position, pas sur perte réelle |
| Timestamps d'exécution | `groupGridTrades()` ne peut pas reconstruire des grilles exécutées à plusieurs heures d'écart | Certains profils grid réels ne seront pas groupés |
| Multi-symboles | `avgTimeBetweenSameSymbol` retourne le minimum — un trader multi-paires peut avoir un rythme global élevé mais un rythme par paire correct | Pénalité paceDelay potentiellement injuste |

---

## 14. Autorité réelle du score

### Comment lire un score Phase 4

Le score comportemental produit par le moteur est un **indicateur de tendance**, pas un jugement exhaustif. Sur données réelles :

- Un **score élevé (≥ 80)** indique une absence de patterns négatifs mesurables sur la période. Il ne garantit pas l'absence de comportements problématiques non couverts par le modèle.
- Un **score bas (< 60)** indique la présence de signaux comportementaux quantifiables. Il ne qualifie pas le trader — il documente un comportement observable sur la période analysée.

### Interpréter `dataQuality`

| Niveau | Signification | Conduite recommandée |
|--------|--------------|---------------------|
| `HIGH` | ≥ 20 trades, ≥ 72h, BUY et SELL présents | Score pleinement interprétable |
| `PARTIAL` | < 20 trades ou < 72h | Score indicatif — interpréter avec réserve |
| `LOW` | < 5 trades, ou un seul côté | Score non représentatif — comportement structurellement incomplet |

Quand `dataQuality = LOW`, le score peut être élevé par absence d'information, pas par vertu (cf. SYN-004, score 90 sur SELL-only).

### Différencier faux positif / comportement réel / artefact / limitation

| Signal | Indice d'identification | Classification probable |
|--------|------------------------|------------------------|
| Pattern déclenché, opérateur reconnaît le comportement | Cohérence subjective | `BC` — Comportement confirmé |
| Pattern déclenché, opérateur nie, données insuffisantes | Peu de trades sur la période, dataQuality LOW | `LQ` — Limitation dataQuality |
| Pattern déclenché, opérateur nie, données suffisantes | FP structurel documenté (ex : overtrading sur grid non groupé) | `AG` ou `FP` |
| Pattern absent, opérateur reconnaît le comportement | Seuils non atteints, format limite | `FN` ou `LS2` |
| Score élevé, comportement douteux | dataQuality LOW, patterns BUY-dépendants absents | `LQ` — Score non représentatif |
| Score bas, comportement structuré | Overtrading réel mais paceDelay global élevé | `LS` — Limitation scoring |

---

## 15. Ce que Phase 4 doit confirmer avant V1

Liste de critères de validation pré-production. La Phase 4 est soldée quand chaque item est renseigné pour au moins un dataset réel.

### Robustesse technique

- [ ] **Absence de NaN ou Infinity** sur score, metrics et tous les champs affichés
- [ ] **Absence d'exception non catchée** dans la console sur tous les datasets testés
- [ ] **Absence de freeze UI** (analyse < 2s sur tous les datasets < 500 trades testés)
- [ ] **Import correct** sur fichier CSV réel Binance (Trade History, format actuel)
- [ ] **Import tolérant** en cas de colonnes manquantes ou ordre différent
- [ ] **`dataQuality`** correctement assigné sur datasets avec périodes courtes (PARTIAL) et datasets complets (HIGH)

### Cohérence analytique

- [ ] **Score dans [0, 100]** sur tous les datasets, quelle que soit la distribution
- [ ] **`overtrading`** déclenché uniquement quand un rythme dense réel est présent, pas sur activité normale
- [ ] **`rapid_reentry`** distingue correctement les réentrées impulsives des stratégies rapides légitimes (au moins un cas documenté)
- [ ] **`loss_chasing`** non déclenché sur DCA planifié (progression de taille régulière)
- [ ] **`size_inconsistency`** non déclenché sur profil multi-symboles avec allocation différenciée par paire
- [ ] **`groupGridTrades()`** groupe correctement les fills grid réels quand les seuils sont respectés

### Comportement UI

- [ ] **Bandeau `dataQuality`** affiché correctement quand LOW ou PARTIAL
- [ ] **Score card** affiché sans élément `undefined` ou `NaN`
- [ ] **Tableau patterns** complet, aucune ligne vide inattendue
- [ ] **Pas de contenu dupliqué** dans le rendu DOM sur reimport

### Autorité contextuelle

- [ ] **Au moins un cas documenté** où dataQuality LOW produit un score élevé non représentatif
- [ ] **Au moins un cas documenté** où le score reflète correctement un comportement réel négatif
- [ ] **Au moins un cas documenté** de FP classifié et non corrigé (limite documentée, pas de patch)

---

## 16. Interprétation des patterns sur données réelles

### `overtrading`

Sur données réelles, l'overtrading peut être déclenché par :
- Comportement réel (frénésie sur événement de marché) → `BC`
- Stratégie grid dont les fills ne sont pas groupés → `AG`
- Scalping intentionnel sur période courte → `BC` ou `BA` selon le contexte

Vérifier si `[bhv:grid]` a absorbé des trades avant de conclure à un FP.

### `rapid_reentry`

Distinguer :
- Réentrée impulsive après sortie rapide (perte < 20 min → rachat) → `BC`
- Stratégie de pullback intentionnelle (sortie programmée + réentrée planifiée) → `FP` ou `BA`

Sans contexte opérateur, classer `BA` par défaut.

### `revenge_trading`

Signal fort quand présent avec taille > 1.5× la moyenne et gap < 30 min. Sur données réelles, peut être déclenché par :
- Comportement émotionnel réel → `BC`
- Variation de taille habituelle sur une paire volatile → `FP`

### `loss_chasing`

Nécessite 3 BUY croissants (1.8× facteur) dans 120 min. Sur données réelles :
- Averaging down progressif sous panique → `BC`
- DCA planifié à progression légère → `FP` (seuil 1.8× conçu pour l'éviter, mais vérifier)

### `size_inconsistency`

CV > 0.5 sur un seul symbole. Sur données réelles :
- Sizing erratique sans règle → `BC`
- Allocation différenciée BTC/alt intentionnelle → `FP` (si calcul multi-symboles biaise le CV)
- Trades synthétiques grid mélangés aux normaux → `AG`

---

## 17. Annexe — Template CASE_REAL

```markdown
# CASE_REAL_NNN — [description]

**Date création :** YYYY-MM-DD
**Type :** Réel anonymisé
**Statut :** En attente / Validé / Rejeté
**Fichier :** excel_tests/06_real_anonymized/VALIDATED/REAL_NNN_...csv
**Phase :** ANALYTIC_STRESS_TEST_PLAN_001 — Phase 4

---

## Métadonnées source

| Champ | Valeur |
|-------|--------|
| Période | 2025-XX-XX → 2025-XX-XX |
| Nombre trades | N |
| Symboles | TAOUSDT, ... |
| Type activité | swing / grid / DCA / mixte |
| Source import | Binance Trade History CSV |
| Anomalies connues | — |

## Patterns attendus (estimation avant test)

- ...

## Grille d'observation

| Checkpoint | Attendu | Observé | OK ? |
|-----------|---------|---------|------|
| Import OK | Oui | — | — |
| Trades importés | N | — | — |
| Warnings [bhv:map] | Aucun | — | — |
| [bhv:grid] | — | — | — |
| dataQuality | — | — | — |
| Score | — | — | — |
| overtrading | — | — | — |
| rapid_reentry | — | — | — |
| revenge_trading | — | — | — |
| loss_chasing | — | — | — |
| size_inconsistency | — | — | — |
| NaN / exception | Absent | — | — |
| Freeze UI | Absent | — | — |

## Classification

| Pattern / anomalie | Classification | Justification |
|--------------------|---------------|---------------|
| — | — | — |

## Conclusion analytique

...

## Action

Aucune / Documenter / Recommandation V2 :
```
