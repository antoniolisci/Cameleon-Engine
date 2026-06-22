# Compte Utilisateur V1 — LOT 1 : Export / Import / Purge

## 1. Périmètre LOT 1

LOT 1 couvre la capacité de sauvegarde et restauration manuelle des données opérateur, sans aucune dépendance cloud, sans paiement, sans compte Supabase requis.

Trois fonctionnalités livrées :

| Fonctionnalité | Entrée | Sortie |
|---|---|---|
| **Export** | Clic bouton | Fichier `cameleon-data-{yyyy-mm-dd}.json` téléchargé |
| **Import** | Sélection fichier JSON | Restauration 12 clés opérateur + reload automatique |
| **Purge globale** | Double confirmation | Suppression 12 clés opérateur + reload automatique |

**Hors périmètre LOT 1 (reporté) :**
- Supabase Storage / sync cloud automatique (LOT 2)
- Chiffrement export JSON (LOT 4B)
- Détection cross-device automatique (LOT 3)
- Fonction réhydratation centralisée (dette UI_REHYDRATION_AFTER_IMPORT)

## 2. Fichiers modifiés

### 2.1 `src/js/storage.js` + `ovh-deploy/js/storage.js` (identiques)

**Fonctions ajoutées :**
- `importOperatorData(data)` — restauration sécurisée des 12 clés opérateur
- `clearOperatorData()` — purge des 12 clés opérateur

**KEYS ajoutée (pré-LOT 1, M5) :**
- `KEYS.magicLinkRateLimit: 'CE_magic_link_rl_v1'`

### 2.2 `src/index.html` + `ovh-deploy/index.html` (identiques)

**Boutons ajoutés** dans onglet **Mémoire (H)** → section Diagnostic mémoire :
- `importDataBtn` — "Restaurer depuis fichier"
- `importDataInput` — input file masqué (accept .json)
- `clearOperatorDataBtn` — "Réinitialiser toutes les données"

### 2.3 `src/js/render.js` + `ovh-deploy/js/render.js` (identiques)

**Handlers ajoutés :**
- Handler `importDataInput` : file picker → JSON.parse → détection données locales existantes → confirm() → `importOperatorData()` → confirm reload → `location.reload()`
- Handler `clearOperatorDataBtn` : double confirm() → `clearOperatorData()` → confirm reload → `location.reload()`

## 3. Architecture technique

### 3.1 `importOperatorData(data)`

**Préconditions :**
1. `CE_migration_uuid_v1_done === '1'` (P1) — aucune écriture sans migration UUID active. Sans ce flag, `withUserKey()` retourne la clé legacy et l'import écrirait dans l'espace non-namespacé.
2. `data.version === 1 && data.engine === 'cameleon-engine'` (P2) — validation du format avant toute écriture.

**12 clés opérateur importées — stratégie par format réel de stockage :**

| Clé localStorage | Format de stockage | Stratégie d'écriture |
|---|---|---|
| `CE_journal_entries_v1` | `_wrap({ entries: [...] })` | re-wrap via `_write` |
| `CE_behavior_sessions_v1` | `_wrap({ sessions: [...] })` | re-wrap via `_write` |
| `CE_import_registry_v1` | `_wrap({ imports: [...] })` | re-wrap via `_write` |
| `CE_backups_v1` | `_wrap({ snapshots: [...] })` | re-wrap via `_write` |
| `CE_portfolio_v1` | `_wrap({ snapshots: [...] })` | re-wrap via `_write` |
| `CE_oi_history_v1` | `_wrap({ entries: [...] })` | re-wrap via `_write` |
| `CE_settings_v1` | `_wrap({ data: v })` interne | `settings.set(v)` |
| `CE_operator_memory_v1` | `_wrap({ data: v })` interne | `operatorMemory.set(v)` |
| `cameleon_behavior_memory_v1` | tableau brut, sans enveloppe | `behaviorMemory.setAll([...])` |
| `cameleon.behavior.v1.guardLevel` | `JSON.stringify(v)` brut | `localStorage.setItem` direct |
| `cameleon.behavior.v1.guardLevelUpdatedAt` | `JSON.stringify(v)` brut | `localStorage.setItem` direct |
| `cameleon.behavior.v1.orderStrategyProfile` | `JSON.stringify(v)` brut | `localStorage.setItem` direct |

**Clés intentionnellement préservées (non touchées par import ni purge) :**

| Clé | Raison |
|---|---|
| `CE_identity_v1` | UUID local — concept local, jamais synchronisé |
| `CE_onboarding_v1` | État appareil, affiché une seule fois par navigateur |
| `CE_account_v1` | Cache session Supabase |
| `CE_magic_link_rl_v1` | Rate limit éphémère |
| `CE_migration_uuid_v1_done` | Flag système |
| `CE_migration_uuid_cleanup_done` | Flag système |
| `CE_ui_state_v1` | État UI device-spécifique (onglet actif, panneaux) |
| `CE_payload_current_v1` | Payload courant moteur |

**Gestion d'erreurs :** `_tryWrite()` par clé — détecte `result === false` (échec interne `_write`) + try/catch exception — erreurs accumulées sans interrompre les autres clés. Pas de rollback.

**Retour :** `{ ok: boolean, imported: number, errors: Array<{key, error}> }`

### 3.2 `clearOperatorData()`

Itère `_OPERATOR_KEYS` (12 clés), appelle `localStorage.removeItem(withUserKey(baseKey))` pour chacune. Erreurs accumulées par clé sans interruption. Les clés préservées listées ci-dessus ne sont jamais touchées.

**Retour :** `{ ok: boolean, cleared: number, errors: Array<{key, error}> }`

### 3.3 Dette technique documentée

**`UI_REHYDRATION_AFTER_IMPORT`** — `location.reload()` est utilisé après import et purge comme solution temporaire. Le problème structurel : `appState` est une variable module-level initialisée une seule fois au boot. Après écriture localStorage, l'état en mémoire est périmé et `renderDiagnostics()` affiche des valeurs stales.

Objectif futur : fonction de réhydratation centralisée réutilisable (import, login, logout, sync cloud, changement d'utilisateur). À implémenter uniquement quand plusieurs cas d'usage réels le justifient.

## 4. Commits

| Commit | Message |
|---|---|
| `ac87b67` | fix(storage): M5+M6 — CE_magic_link_rl_v1 dans KEYS{} + sync account-ui.js |
| `3e9b91d` | feat(storage): add safe importOperatorData for operator data restore |
| `0543b1d` | chore(deploy): sync importOperatorData to ovh-deploy storage |
| `fdecebc` | feat(ui): LOT1 restore — importDataBtn + handler + ovh-deploy sync |
| `fd343ed` | fix(ui): LOT1 close — auto-reload après import + UI_REHYDRATION_AFTER_IMPORT debt |
| `08fd9dd` | feat(storage): add clearOperatorData — purge 12 operator keys via withUserKey |
| `a2cf150` | chore(deploy): sync clearOperatorData to ovh-deploy storage |
| `0ae38b6` | feat(ui): add clearOperatorDataBtn — purge globale données opérateur |

## 5. Validation terrain — iPad Chrome (2026-06-22)

**Environnement :** iPad, navigateur Chrome, site cameleonengine.fr (CDN Fastly via gh-pages)

**Navigateur testé :** Chrome uniquement. Safari non testé.

### 5.1 Parcours export

| Étape | Résultat |
|---|---|
| Clic "Exporter mes données" | Fichier JSON téléchargé |
| Taille fichier | 467.9 KB |
| Structure JSON | `version:1`, `engine:"cameleon-engine"`, `data:{...}` |
| Contenu | 12 clés opérateur présentes |

### 5.2 Parcours purge

| Étape | Résultat |
|---|---|
| Clic "Réinitialiser toutes les données" | Première confirmation affichée |
| Annulation à la première confirmation | Aucune écriture — OK |
| Double confirmation acceptée | `clearOperatorData()` appelé |
| Taille après purge | 4.1 KB |
| Entrées historique | 0 entrée |
| Onboarding | Réaffiché — OK |
| Reload automatique | Déclenché — OK |

### 5.3 Parcours import

| Étape | Résultat |
|---|---|
| Clic "Restaurer depuis fichier" | File picker natif iOS/Chrome ouvert |
| Sélection fichier JSON valide (467.9 KB) | Parse réussi |
| Confirmation avec données locales détectées | Affichée — OK |
| Annulation confirmation | Aucune écriture — OK |
| Confirmation acceptée | `importOperatorData()` appelé |
| 12 clés opérateur importées | OK |
| Taille après import | 467.9 KB |
| Entrées historique | 6 entrées restaurées |
| Mémoire comportementale | Restaurée — OK |
| Reload automatique | Déclenché — OK |

### 5.4 Cas limites

| Cas | Résultat |
|---|---|
| Fichier JSON invalide | Rejet propre, message d'erreur — OK |
| Fichier non-JSON | Rejet au parse, message d'erreur — OK |
| Annulation à chaque confirmation | Aucune écriture — OK |

## 6. Limites connues

- **Safari iOS non testé** : `location.reload()` est une API Web standard mais non validé terrain sur Safari iOS.
- **Cross-device** : l'import restaure uniquement les 12 clés opérateur via `withUserKey()`. `CE_identity_v1` est intentionnellement préservée — le comportement cross-device n'est pas spécifié à ce stade. LOT 3.
- **Chiffrement export** : le fichier JSON est en clair. Reporté LOT 4B.

## 7. Décisions architecturales

| Décision | Justification |
|---|---|
| Écriture par format réel par clé (pas JSON.stringify générique) | Chaque clé a son enveloppe attendue par son getter — écriture générique corromprait silencieusement les données |
| `location.reload()` après import/purge | Pragmatique — évite l'état périmé en mémoire sans créer une abstraction prématurée |
| Double confirmation pour purge | Opération irréversible — protection UX minimale |
| `CE_identity_v1` exclue de l'import et de la purge | UUID local : concept local, jamais synchronisé |
| `CE_ui_state_v1` exclue de l'import | État UI lié au device — restaurer serait contre-productif |
| Précondition `CE_migration_uuid_v1_done === '1'` | Sans migration UUID, `withUserKey()` ne namespace pas — écriture dans l'espace legacy |
