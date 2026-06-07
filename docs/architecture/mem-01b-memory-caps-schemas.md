# MEM-01B — Memory Caps & Schemas

> Document d'architecture · **Clôturé** · 2026-06-07 · Blocs A/B/C/D · commits `abed3b4` / `11019c7` / `b6ec361` / `1b0f51b`

---

## 1. Contexte

MEM-01B a été ouvert après la finalisation de MEM-01A (décisions produit sur les caps mémoire). Les limites observées avant intervention :

- **`SESSION_LIMIT = 20`** — à 3 imports par semaine, les données comportementales les plus anciennes étaient perdues en 7 semaines. Insuffisant pour constituer une base de signal terrain fiable.
- **`HISTORY_LIMIT = 50`** — coexistait avec `JOURNAL_LIMIT = 50` dans `storage.js`, créant deux sources de vérité divergentes pour la même limite.
- **`importRegistry.append()`** — API présente dans `storage.js` mais jamais appelée depuis la création du registre. Registre inerte.
- **Schema backup minimal** — aucun champ contextuel (profil, score, macro) dans les snapshots `CE_backups_v1`.
- **Sessions comportementales sans snapshot analytique** — les résultats d'analyse n'étaient pas conservés dans la session ; recalcul depuis les trades bruts à chaque affichage.

MEM-01B appartient à la chaîne : Identité locale (ADU-04) → Namespacing (ADU-04B) → Import Registry (ADU-05) → Export JSON (ADU-06). Il précède et prépare le chantier **Mémoire opérateur** (roadmap position #2, non démarré).

## 2. Résumé exécutif

| Élément | Avant | Après | Commit |
|---|---|---|---|
| `SESSION_LIMIT` | 20 | **50** | `abed3b4` (Bloc A) |
| `HISTORY_LIMIT` | 50 | **200** | `abed3b4` (Bloc A) |
| `JOURNAL_LIMIT` | 50 (privé `storage.js`) | **supprimé** | `abed3b4` (Bloc A) |
| `BACKUPS_LIMIT` | 50 | **50** (inchangé) | — |
| `IMPORT_REGISTRY_LIMIT` | absent | **100** | `1b0f51b` (Bloc D) |
| Schema backups | minimal | enrichi (5 nouveaux champs) | `11019c7` (Bloc B) |
| Snapshot analytique sessions | absent | 13 champs figés | `b6ec361` (Bloc C) |
| `importRegistry.append()` | API morte | active, capée, namespacée | `1b0f51b` (Bloc D) |

## 3. Bloc A — Révision des caps mémoire

**Commit :** `abed3b4` · 2026-06-07

### Valeurs décidées

| Constante | Valeur | Fichier source |
|---|---|---|
| `SESSION_LIMIT` | **50** | `session-repo.js` |
| `HISTORY_LIMIT` | **200** | `data.js` — source unique |
| `BACKUPS_LIMIT` | **50** | `storage.js` — inchangé |

### Pourquoi ces valeurs

**SESSION_LIMIT = 50** — à 3 imports par semaine, 50 sessions représentent environ 4 mois de données comportementales continues. En dessous de 20 (valeur précédente), les premières sessions étaient effacées avant d'avoir constitué un signal stable.

**HISTORY_LIMIT = 200** — 200 snapshots de décisions moteur offrent une traçabilité suffisante pour détecter des évolutions sur plusieurs semaines. La valeur de 50 était arbitraire et insuffisante pour un usage terrain régulier.

**BACKUPS_LIMIT = 50** — non modifié. Les backups manuels sont moins fréquents que les décisions moteur. 50 reste adapté à l'usage.

### Problème résolu : deux sources de vérité

`JOURNAL_LIMIT = 50` existait en variable privée dans `storage.js`. La même limite était définie dans `data.js` comme `HISTORY_LIMIT`. Les deux n'étaient pas toujours synchronisées.

Résolution : `JOURNAL_LIMIT` supprimé de `storage.js`, qui importe désormais `HISTORY_LIMIT` depuis `data.js`. Source unique.

### Limites subsistantes

Risque résiduel : `QuotaExceededError` silencieux si le localStorage atteint sa limite navigateur avec 50 sessions comportementales. Décision : différé, attendre données terrain. Voir dette ARCH-N3 (§8).

## 4. Bloc B — Enrichissement du schéma backup

**Commit :** `11019c7` · 2026-06-07

### Nouveaux champs

`handleManualSnapshot()` dans `render.js` — champs ajoutés à chaque entrée `CE_backups_v1` :

```js
{
  schemaVersion:   1,
  // champs existants inchangés…
  profile:         payload.user_profile || null,
  confidenceScore: buildMarketContext(buildConfidenceInputs(payload))?.score ?? null,
  macroContext:    null,   // placeholder — Macro V1
  v2State:         null    // placeholder — V2
}
```

### Objectif

Un snapshot moteur sans contexte d'opérateur n'est qu'un instantané de marché. L'ajout du profil (`PASSIVE` / `BALANCED` / `ACTIVE`) et du score de confiance au moment de la décision permet de distinguer deux snapshots identiques produits dans des contextes opérateur différents.

### Valeur ajoutée pour la mémoire opérateur

Les champs `macroContext` et `v2State` sont des placeholders `null`. Ils sont prêts à être alimentés lors des chantiers Macro et V2 sans modifier le schéma. Compatibilité ascendante totale — les lecteurs existants n'utilisent que les champs pré-existants.

## 5. Bloc C — Snapshot analytique

**Commit :** `b6ec361` · 2026-06-07

### Ce qui a changé

Signature `session-repo.save()` migrée vers objet options :

```js
save(trades, { snapshot = null, name = null } = {})
```

`buildSessionSnapshot(state)` dans `behavior-view.js` — appelé au clic "Sauvegarder session". 13 champs figés dans chaque session `CE_behavior_sessions_v1` :

```js
{
  schemaVersion:    1,
  computedAt:       /* timestamp ISO */,
  importType:       /* "trades" | "order_history" | "wallet" */,
  tradeCount:       /* number */,
  analysisQuality:  /* "HIGH" | "MEDIUM" | "LOW" */,
  score:            /* number 0–100 */,
  profile:          /* "Discipliné" | "Réactif" | "Impulsif" | "Agressif" */,
  dominantRisk:     /* string */,
  patternsSummary:  /* [{ type, label, count, cv }] */,
  coachingPriority: /* string */,
  pdfQuality:       /* string | null */,
  importSummary:    /* object | null */,
  macroContext:     null,   // placeholder
  engineContext:    null    // placeholder
}
```

### Conservation du contexte

Avant Bloc C, les sessions comportementales ne contenaient que les trades bruts. Pour afficher le score ou le profil d'une session passée, le moteur recomputait depuis `s.trades`. Ce recalcul était exact, mais si les algorithmes évoluaient entre la sauvegarde et l'affichage, le résultat pouvait différer de ce que l'opérateur avait observé.

Le snapshot fige les résultats tels qu'observés au moment du clic. Il est immutable.

### Différence session / mémoire

La **session comportementale** conserve les trades bruts et un snapshot analytique d'une période délimitée. Elle répond à : "qu'ai-je fait durant ces N trades ?"

La **mémoire opérateur** (non démarrée) distillera les tendances stables sur plusieurs sessions. Elle répondra à : "qu'est-ce qui se répète dans mon comportement ?"

La session est l'unité. La mémoire est la synthèse. `behavior-analyzer.js` recompute toujours depuis `s.trades` — il ne lit jamais `s.snapshot`. Le snapshot sert exclusivement à l'affichage et à l'export.

## 6. Bloc D — Import Registry

**Commit :** `1b0f51b` · 2026-06-07

### Activation du registre

`importRegistry.append()` existait dans `storage.js` depuis sa création mais n'était jamais appelée. L'API était inerte.

Déclenchement post-Bloc D : `if (result.ok) importRegistry.append(buildRegistryEntry(result, file));` — appelé après chaque import réussi dans `behavior-view.js`, avant le rendu `mount(root)`.

### Namespacing UUID

Chaque entrée est stockée sous `CE_import_registry_v1__{uuid}` via `importRegistry.append()` → `withUserKey()`. L'entrée appartient à l'opérateur identifié. Sans UUID, le registre serait une liste anonyme sans propriétaire.

### Cap FIFO 100

`IMPORT_REGISTRY_LIMIT = 100` dans `storage.js`. Le registre conserve les 100 derniers imports — les plus anciens sont écrasés. À 3 imports par semaine, 100 entrées représentent environ 8 mois d'historique.

### Structure V1 — 13 champs par entrée

```js
{
  schemaVersion:    1,
  importedAt:       /* timestamp ISO */,
  source:           /* "file" | "pdf" */,
  format:           /* "csv" | "xlsx" | "pdf" */,
  importType:       /* "trades" | "order_history" | "wallet" */,
  fileName:         /* string */,
  rowsRead:         /* number */,
  rowsKept:         /* number */,
  rowsIgnored:      /* number */,
  analysisQuality:  /* "HIGH" | "MEDIUM" | "LOW" | null */,
  pdfQuality:       /* string | null */,
  sessionId:        /* string | null */
}
```

Cas wallet : `rowsRead = rowsKept = metrics.totalOperations` (pas `trades.length`, inexistant pour les données wallet). `sessionId`, `analysisQuality`, `pdfQuality` = `null`.

### Clôture ARCH-N2

ARCH-N2 décrivait l'absence de `user_id` dans le registre. Le Bloc D résout cette dette : chaque entrée est namespacée sous UUID opérateur. **ARCH-N2 SOLDÉE** (`1b0f51b`).

`exportOperatorData()` inclut déjà `importRegistry.getAll()` — aucune modification supplémentaire n'était nécessaire.

## 7. État canonique actuel

Cette section est la référence pour tout développeur qui rejoint le projet. Elle décrit le système mémoire tel qu'il est, sans nécessiter de lire le code.

### Caps opérationnels

| Constante | Valeur | Fichier source | Commit |
|---|---|---|---|
| `SESSION_LIMIT` | **50** | `session-repo.js` | `abed3b4` |
| `HISTORY_LIMIT` | **200** | `data.js` | `abed3b4` |
| `BACKUPS_LIMIT` | **50** | `storage.js` | inchangé |
| `IMPORT_REGISTRY_LIMIT` | **100** | `storage.js` | `1b0f51b` |

### Clés localStorage, caps, schemas, dépendances

**9 clés opérateur — namespacées `__{uuid}` :**

| Clé | Cap | Schema | Dépendance |
|---|---|---|---|
| `CE_journal_entries_v1__{uuid}` | 200 FIFO | Payload moteur complet | `history.push()` |
| `CE_behavior_sessions_v1__{uuid}` | 50 FIFO | Trades bruts + snapshot 13 champs | `session-repo.save()` |
| `CE_import_registry_v1__{uuid}` | 100 FIFO | 13 champs V1 par import | `importRegistry.append()` |
| `CE_backups_v1__{uuid}` | 50 FIFO | Snapshot moteur enrichi (5 champs nouveaux) | `handleManualSnapshot()` |
| `CE_settings_v1__{uuid}` | — | Paramètres opérateur | `settings.*` |
| `cameleon_behavior_memory_v1__{uuid}` | — | État comportemental courant (7j TTL) | `behaviorMemory.*` |
| `cameleon.behavior.v1.guardLevel__{uuid}` | 1 valeur | Niveau guard overtrading | `behaviorGuard.*` |
| `cameleon.behavior.v1.guardLevelUpdatedAt__{uuid}` | 1 valeur | Timestamp guard level | `behaviorGuard.*` |
| `cameleon.behavior.v1.orderStrategyProfile__{uuid}` | 1 valeur | Profil stratégie ordre | `behaviorGuard.*` |

**Clés globales — inchangées :**

| Clé | Rôle |
|---|---|
| `CE_identity_v1` | UUID opérateur — source de vérité identité |
| `CE_ui_state_v1` | État UI — éphémère |
| `CE_payload_current_v1` | Dernier payload moteur — recalculable |
| `CE_migration_v1_done` | Flag migration legacy |
| `CE_migration_uuid_v1_done` | Flag migration → namespacé |
| `CE_migration_uuid_cleanup_done` | Flag nettoyage legacy |

### Flux mémoire

```
Import CSV/XLSX/PDF
  → behavior-view.js (parse + analyse)
  → importRegistry.append(buildRegistryEntry)      → CE_import_registry_v1__{uuid}
  → session-repo.save(trades, { snapshot })        → CE_behavior_sessions_v1__{uuid}
  → [comportement met à jour Signal courant]       → cameleon_behavior_memory_v1__{uuid}

Formulaire moteur
  → runMoteur() → buildPayload()
  → history.push(snapshot)                         → CE_journal_entries_v1__{uuid}
  → [handleManualSnapshot optionnel]               → CE_backups_v1__{uuid}

Export
  → exportOperatorData()
    → CE_journal_entries_v1__{uuid}
    → CE_behavior_sessions_v1__{uuid}
    → CE_import_registry_v1__{uuid}
    → CE_backups_v1__{uuid}
    → CE_settings_v1__{uuid}
    → cameleon_behavior_memory_v1__{uuid}
    → cameleon.behavior.v1.* (3 clés)
    → CE_identity_v1
```

## 8. Dettes résiduelles

### ARCH-N3 — QuotaExceededError silencieux

**Statut :** Différée.

**Nature :** Si le localStorage atteint sa limite navigateur (généralement 5–10 Mo), les appels `session-repo.save()` peuvent échouer silencieusement. Le FIFO à 50 sessions réduit le risque mais ne l'élimine pas — tout dépend du volume de trades par session.

**Motif :** Différée — attendre données terrain réelles. Sans jeu de données opérateur sur plusieurs mois, la valeur de risque réel est inconnue. Une correction prématurée introduirait de la complexité non justifiée.

## 9. Conclusion

MEM-01B est clôturé.

Les quatre blocs ont été implémentés et poussés sur `main` le 2026-06-07.

| Bloc | Objet | Commit |
|---|---|---|
| A | Caps mémoire — SESSION=50 · HISTORY=200 · source unique | `abed3b4` |
| B | Schema backups enrichi — profil · score · placeholders Macro/V2 | `11019c7` |
| C | Snapshot analytique figé par session comportementale — 13 champs | `b6ec361` |
| D | Import Registry activé · capé FIFO 100 · namespacé · 13 champs V1 | `1b0f51b` |

Tous les objectifs du chantier ont été atteints.

Ce document devient la référence documentaire officielle de la mémoire opérateur V1. Pour l'état de l'identité locale et du namespacing, consulter `docs/architecture/architecture-donnees-utilisateur.md`. Pour l'état des dettes soldées, consulter `docs/debt-audit.md`.

---

*Ce document ne doit pas être modifié sans décision produit. Les caps sont des paramètres d'architecture, pas des constantes arbitraires.*
