# LOCALSTORAGE_AUDIT_001 — Audit Surface localStorage

**Statut :** Documenté — aucun code modifié  
**Date :** 2026-05-17  
**Périmètre :** `src/js/storage.js`, `src/js/render.js`, `src/js/behavior/storage/behavior-repo.js`, `src/js/behavior/storage/session-repo.js`, `src/index.html`

---

## Résumé exécutif

Caméléon Engine dispose d'une architecture localStorage mature pour une application local-first :
API centralisée, clés versionnées, migration legacy, TTL sur données comportementales, caps sur historiques, try/catch sur toutes les lectures.

Aucune donnée sensible (PII, données financières réelles, soldes, clés API) n'est stockée.

**Niveau de risque global : FAIBLE (usage local) / MOYEN (avant déploiement public)**

Points forts : nombreux. Points à surveiller : 4, dont 1 architectural notable.

---

## Inventaire complet des clés

### Namespace CE_* — via `storage.js` (centralisé)

| Clé | Propriétaire | Contenu | Cap | Versioning |
|-----|-------------|---------|-----|------------|
| `CE_settings_v1` | `storage.settings` | `{ version, updatedAt, data: {} }` | Aucun | `_v1` |
| `CE_payload_current_v1` | `storage.payloadCurrent` | `{ version, updatedAt, data: <payload moteur> }` | 1 entrée | `_v1` |
| `CE_journal_entries_v1` | `storage.journalEntries` | `{ version, updatedAt, entries: [...] }` | **50 entrées** | `_v1` |
| `CE_behavior_sessions_v1` | `storage.behaviorSessions` + `session-repo.js` | `{ version, updatedAt, sessions: [...] }` | **Aucun cap** | `_v1` |
| `CE_import_registry_v1` | `storage.importRegistry` | `{ version, updatedAt, imports: [...] }` | Aucun | `_v1` |
| `CE_ui_state_v1` | `storage.uiState` | `{ version, updatedAt, data: { activeTab, form, lastSaved } }` | 1 entrée | `_v1` |
| `CE_backups_v1` | `storage.backups` | `{ version, updatedAt, snapshots: [...] }` | **50 entrées** | `_v1` |
| `CE_migration_v1_done` | `storage.runMigration` | `"1"` (plain string) | 1 entrée | `_v1` |
| `CE_onboarding_v1` | `render.js` (direct) | `"1"` (plain string) | 1 entrée | `_v1` |

### Namespace `cameleon.behavior.v1.*` — via `behavior-repo.js` (isolé)

| Clé complète | Écrit par | Lu par | Contenu | TTL |
|-------------|-----------|--------|---------|-----|
| `cameleon.behavior.v1.guardLevel` | `behavior-repo` | `storage.behaviorGuard` | number 1–5 (JSON) | 7 jours |
| `cameleon.behavior.v1.guardLevelUpdatedAt` | `behavior-repo` | `storage.behaviorGuard` | timestamp ms (JSON) | — |
| `cameleon.behavior.v1.dominantRisk` | `behavior-repo` | `render.js` (direct) | string enum (JSON) | 7 jours |
| `cameleon.behavior.v1.dominantRiskUpdatedAt` | `behavior-repo` | `render.js` (direct) | timestamp ms (JSON) | — |
| `cameleon.behavior.v1.coherenceLevel` | `behavior-repo` | `render.js` (direct) | string ('Élevée'\|'Bonne'\|'Moyenne'\|'Faible') (JSON) | aucun |

### Clé hors namespace — via `render.js` (direct, non centralisée)

| Clé | Écrit par | Contenu | Cap |
|-----|-----------|---------|-----|
| `cameleon_behavior_memory_v1` | `render.js` direct | Array `[{ timestamp, actionLevel, behaviorState }]` | **20 entrées** |

### Clés legacy (lecture migration uniquement, jamais réécrites)

| Clé | Origine | Statut post-migration |
|-----|---------|----------------------|
| `cameleon-engine-modular-v732e-v45` | Ancienne version | Lue une fois, **non supprimée** |
| `cameleon_history` | Ancienne version | Lue une fois, **non supprimée** |
| `bhv_sessions` | Ancienne version | Lue une fois, **non supprimée** |

**Total clés actives : 15**  
**Total clés legacy résiduelles : 3** (présentes chez les utilisateurs qui ont migré)

---

## Analyse point par point

---

### 1. Architecture API centralisée — KEEP

`storage.js` déclare en ligne 2 : _"All persistence goes through this module. No raw localStorage calls elsewhere."_

Toutes les opérations passent par `_read()` / `_write()` / `_remove()` — wrappers avec try/catch complet et retour de valeur de fallback. Le pattern est solide.

**Verdict : KEEP**

---

### 2. Versioning des clés — KEEP

Toutes les clés CE_* portent le suffixe `_v1`. Le namespace `cameleon.behavior.v1.*` est explicite. La migration est implémentée via `runMigration()`.

Permet des migrations futures sans casse de l'existant.

**Verdict : KEEP**

---

### 3. try/catch sur toutes les lectures localStorage — KEEP avec nuance

**Protections en place :**

| Lieu | Protection | Fallback |
|------|-----------|---------|
| `storage._read()` | `try/catch → return null` | Toutes les méthodes `.get()` retournent `?? []` ou `?? null` |
| `storage._write()` | `try/catch → return false` | Silencieux mais contrôlé |
| `behavior-repo.get()` | `try/catch → return null` | Null-safe |
| `behavior-repo.set()` | `try/catch` commenté "Quota exceeded — fail silently" | Acceptable |
| `render.js:3672` | `catch {}` | Fallback `memory = []` initialisé avant le try |
| `render.js:4429` | `try { level = JSON.parse(...) } catch {}` | `level = null` initialisé avant |
| `render.js:4683` | `catch { /* stay at OVERTRADING */ }` | Pattern nommé explicite |
| `index.html:10` | `catch(e){}` | Dégradation gracieuse si localStorage indisponible |
| `storage.runMigration()` | `try {} catch {}` global | Migration ignorée si échec, flag quand même écrit |

**Nuance — `runMigration` catch trop large :**  
Le try/catch englobe l'intégralité de la migration (lignes 228–268). Si une seule étape échoue, les autres sont également ignorées. Le flag `CE_migration_v1_done = '1'` est écrit à la ligne 270 **hors du try**, donc il est toujours posé — y compris si la migration a partiellement échoué. Un utilisateur peut se retrouver avec un flag "migration terminée" alors qu'une partie des données n'a pas migré.

**Verdict : KEEP pour l'ensemble. NEED REVIEW pour `runMigration` (catch trop large)**

---

### 4. `cameleon_behavior_memory_v1` hors storage.js — NEED REVIEW

**Constat :**  
`render.js:3626` déclare `const BEHAVIOR_MEMORY_KEY = "cameleon_behavior_memory_v1"` et y accède directement via `localStorage.getItem/setItem` (lignes 3665/3671), en dehors de `storage.js` et hors du `KEYS` object.

**Conséquences :**
- La clé n'est pas dans `KEYS` → `estimateTotalSize()` ne la comptabilise pas
- Pas de wrapper try/catch centralisé (le try/catch est local à `renderBehaviorState()`)
- Pas de migration prévue si le format change
- Invisible pour une future fonction de reset global

**Données stockées :** array de `{ timestamp, actionLevel, behaviorState }` — pas de données sensibles. Cap 20 entrées. Taille estimée < 5 KB.

**Verdict : NEED REVIEW** — données peu sensibles, mais inconsistance architecturale avec la doctrine de `storage.js`

---

### 5. Lecture directe de 3 clés behavior dans render.js — NEED REVIEW

`render.js` lit `cameleon.behavior.v1.dominantRisk`, `cameleon.behavior.v1.dominantRiskUpdatedAt`, et `cameleon.behavior.v1.coherenceLevel` directement via `localStorage.getItem`, sans passer par storage.js.

**Comparaison :**  
La clé `cameleon.behavior.v1.guardLevel` est, elle, encapsulée via `storage.behaviorGuard.readHistoricalLevel()` (storage.js:175). Ce helper intègre la validation de type, la plage [1-5], et le TTL 7 jours.

**Pour les 3 autres clés :**
- `dominantRisk` : validé contre `_VALID_PATTERNS` et TTL vérifiés manuellement dans render.js — correct fonctionnellement, mais duplique la logique TTL
- `dominantRiskUpdatedAt` : même pattern inline
- `coherenceLevel` : validé contre un objet `TEXT` local — pas de TTL, valeur considérée permanente jusqu'à réimport

**Risque :** cohérence et maintenabilité — si le TTL change dans behavior-repo, render.js ne sera pas automatiquement aligné.

**Verdict : NEED REVIEW** — fonctionnel, pas de risque de sécurité, mais duplication de logique TTL

---

### 6. Clés legacy non supprimées post-migration — SAFE TO IMPROVE

`runMigration()` lit `cameleon-engine-modular-v732e-v45`, `cameleon_history`, `bhv_sessions` mais ne les supprime jamais après migration.

**Impact :** Les utilisateurs qui ont migré gardent indéfiniment des données obsolètes dans leur localStorage. Pas de risque de sécurité (ce sont des données engine sans PII). Légère pollution de l'espace.

**Recommandation future :** Ajouter `localStorage.removeItem()` sur les 3 clés legacy à la fin de `runMigration()`, après écriture du flag.

**Verdict : SAFE TO IMPROVE**

---

### 7. Absence de cap sur `CE_behavior_sessions_v1` — NEED REVIEW

`session-repo.js` ne limite pas le nombre de sessions stockées. `behaviorSessions.setAll(sessions)` dans `storage.js` n'applique pas de troncature.

**Impact théorique :** Chaque import CSV/XLSX crée une session contenant un tableau de trades. Un fichier Binance typique ≈ 500 trades × ~100 bytes/trade = ~50 KB/session. Sans cap, 100 sessions = ~5 MB → risque de saturation du quota localStorage (~5-10 MB selon navigateur).

**Mitigant actuel :** L'utilisateur doit activer manuellement "sauvegarder la session" — pas d'accumulation silencieuse. `clearAll()` existe et est accessible dans l'UI behavior.

**Verdict : NEED REVIEW** — pas de risque immédiat, mais à adresser avant un usage intensif

---

### 8. `CE_onboarding_v1` écrit directement dans render.js — SAFE TO IMPROVE

`localStorage.setItem("CE_onboarding_v1", "1")` (render.js:5021) et `localStorage.getItem("CE_onboarding_v1")` (render.js:5017 et index.html:10) contournent storage.js.

**Impact :** Mineur. Données non sensibles (flag binaire "1"). Invisible pour `estimateTotalSize()`. Inconsistance doctrinale.

**Verdict : SAFE TO IMPROVE** (priorité basse)

---

### 9. Données sensibles — KEEP (aucun risque)

**Contenu effectif de chaque clé :**

| Clé | Données réelles | Sensibilité |
|-----|----------------|-------------|
| `CE_settings_v1` | Préférences utilisateur (structure probablement vide) | Nulle |
| `CE_payload_current_v1` | État moteur (état marché, posture, score) | Nulle |
| `CE_journal_entries_v1` | Snapshots décisions (état marché + scores) | Nulle |
| `CE_behavior_sessions_v1` | Trades importés : symbol, side, price, qty, fee, timestamp | **Faible** (données d'analyse, pas de soldes ni clés) |
| `CE_import_registry_v1` | Métadonnées imports (nom fichier, date) | Faible |
| `CE_ui_state_v1` | Valeurs formulaire (sélections dropdown, pas de texte libre) | Nulle |
| `CE_backups_v1` | Snapshots payload moteur | Nulle |
| `cameleon.behavior.v1.*` | Scores comportementaux, niveau, pattern | Nulle |
| `cameleon_behavior_memory_v1` | Séquences actionLevel/behaviorState | Nulle |

**Aucune donnée financière réelle stockée** (pas de soldes, pas de portfolio, pas de clés API, pas de User_ID).

Les données de trades dans `CE_behavior_sessions_v1` contiennent prix/quantité/symbole mais sont issues de fichiers importés par l'utilisateur — pas de données transmises depuis Binance en live.

**Verdict : KEEP — niveau de sensibilité acceptable pour un stockage local-first**

---

### 10. Risque XSS indirect via données relues — KEEP (risque nul)

Les valeurs lues depuis localStorage qui transitent vers le DOM passent par :
- `setText()` (affectation `textContent`) → pas d'injection HTML
- Dict lookups (`STATE_LABELS`, `SNAP_*_MAP`, etc.) avec fallback `|| "—"` → valeur connue retournée
- Scores numériques → aucun risque

Les valeurs de formulaire stockées dans `CE_ui_state_v1.data.form` sont des clés d'enum (ex : `"range"`, `"forte"`) qui restaurent des `<select>` par valeur — pas d'injection DOM.

**Verdict : KEEP — aucun vecteur XSS indirect identifié**

---

### 11. Estimation de taille et saturation — KEEP avec note

**Outillage présent :**
- `canUseStorage()` — probe d'accessibilité
- `estimateTotalSize()` — somme les clés de `KEYS`
- `estimateKeySize(key)` — taille individuelle

**Estimation théorique maximale :**

| Clé | Taille estimée (max) |
|-----|---------------------|
| `CE_backups_v1` | 50 snapshots × ~3 KB = ~150 KB |
| `CE_journal_entries_v1` | 50 entrées × ~1 KB = ~50 KB |
| `CE_behavior_sessions_v1` | Variable (sans cap — voir point 7) |
| `CE_payload_current_v1` | ~3 KB |
| `CE_ui_state_v1` | < 1 KB |
| `cameleon_behavior_memory_v1` | 20 entrées × ~50 bytes = ~1 KB |
| Autres | < 5 KB total |

**Total sans sessions : ~210 KB** — bien en dessous du quota standard de 5 MB.  
**Avec sessions non plafonnées** : seule source de dépassement potentiel.

**Verdict : KEEP pour l'outillage. NEED REVIEW pour l'absence de cap sur sessions.**

---

### 12. Reset sécurisé — SAFE TO IMPROVE

**Ce qui existe :**
- `storage.payloadCurrent.clear()` — supprime la clé
- `storage.journalEntries.clear()` — vide les entrées
- `storage.behaviorSessions.clear()` — vide les sessions
- `storage.backups.clear()` — supprime la clé
- `session-repo.clearAll()` — exposé dans l'UI behavior
- `behavior-repo.clear()` — nettoie toutes les clés `cameleon.behavior.v1.*`

**Ce qui manque :**
- Aucune fonction de reset global utilisateur couvrant l'ensemble des clés
- `cameleon_behavior_memory_v1` non couverte par les clears existants (hors storage.js)
- Les clés legacy ne sont jamais nettoyées
- Pas d'export/sauvegarde avant reset

**Verdict : SAFE TO IMPROVE** — à prévoir avant déploiement public

---

### 13. Versioning et migration future — KEEP avec observation

Le système de migration `runMigration()` est bien conçu :
- Idempotent (flag CE_migration_v1_done)
- Migre les 3 clés legacy vers les nouvelles
- Préserve les données existantes (ne migre que si la cible est vide)

**Observation :** Si une version `_v2` est introduite, le mécanisme de migration devra être étendu. La structure `_wrap({ version: SCHEMA_VERSION })` avec `SCHEMA_VERSION = 1` prépare ce cas, mais il n'y a pas encore de lecteur qui valide ce champ version.

**Verdict : KEEP** — architecture prévoyante, rien d'urgent

---

## Synthèse classification

| # | Élément | Classification | Priorité |
|---|---------|----------------|---------|
| 1 | API centralisée storage.js | **KEEP** | — |
| 2 | Versioning clés _v1 | **KEEP** | — |
| 3 | try/catch sur toutes les lectures | **KEEP** | — |
| 3b | `runMigration` catch trop large | **NEED REVIEW** | Basse |
| 4 | `cameleon_behavior_memory_v1` hors storage.js | **NEED REVIEW** | Moyenne |
| 5 | Lecture directe des 3 clés behavior dans render.js | **NEED REVIEW** | Basse |
| 6 | Clés legacy non supprimées | **SAFE TO IMPROVE** | Basse |
| 7 | Absence de cap sessions | **NEED REVIEW** | Moyenne |
| 8 | `CE_onboarding_v1` hors storage.js | **SAFE TO IMPROVE** | Basse |
| 9 | Données sensibles | **KEEP** (aucune) | — |
| 10 | XSS indirect | **KEEP** (risque nul) | — |
| 11 | Outillage estimation taille | **KEEP** | — |
| 12 | Reset sécurisé | **SAFE TO IMPROVE** | Moyenne |
| 13 | Versioning/migration future | **KEEP** | — |
| 14 | TTL données comportementales (7 jours) | **KEEP** | — |

---

## Points solides

1. **API centralisée avec wrappers protégés** — doctrine claire, presque entièrement respectée
2. **Aucune donnée sensible stockée** — pas de PII, pas de finances réelles
3. **TTL sur les données comportementales** — `guardLevel` et `dominantRisk` expirent après 7 jours
4. **Caps sur journal (50) et backups (50)** — saturation contenue
5. **Migration legacy implémentée** — transition propre depuis les anciennes clés
6. **`canUseStorage()` probe** — dégradation gracieuse si localStorage indisponible
7. **`behavior-repo` explicitement isolé** avec interdiction de `clear()` global
8. **Aucun XSS indirect** — données relues ne transitent pas brutes vers `innerHTML`

---

## Points à surveiller

1. **`cameleon_behavior_memory_v1`** — bypass architectural de storage.js ; non comptabilisée par `estimateTotalSize()` ; pas de migration prévue
2. **Lecture directe de 3 clés behavior dans render.js** — logique TTL dupliquée, risque de désynchronisation si les règles changent dans behavior-repo
3. **Absence de cap sur `CE_behavior_sessions_v1`** — seule source de saturation potentielle sur usage intensif
4. **Clés legacy résiduelles** — `cameleon-engine-modular-v732e-v45`, `cameleon_history`, `bhv_sessions` jamais nettoyées post-migration

---

## Recommandations avant déploiement public

### Haute priorité

**R1 — Ajouter un cap sur CE_behavior_sessions_v1**  
Appliquer un plafond (ex : 20 sessions) dans `behaviorSessions.setAll()` ou dans `session-repo.save()`.  
Fichier : `storage.js` ou `session-repo.js`

**R2 — Exposer une fonction de reset global sécurisé**  
Couvrir toutes les clés actives dont `cameleon_behavior_memory_v1` et les clés behavior.v1.*.  
Idéalement accessible dans l'onglet Mémoire.

### Priorité moyenne

**R3 — Intégrer `cameleon_behavior_memory_v1` dans storage.js**  
Ajouter la clé dans `KEYS`, créer un wrapper `behaviorMemory.get/set`, et supprimer l'accès direct dans `render.js`.

**R4 — Encapsuler les 3 lectures directes behavior dans render.js**  
Ajouter des helpers dans `storage.behaviorGuard` pour `dominantRisk`, `dominantRiskUpdatedAt`, `coherenceLevel` — alignés sur le pattern déjà utilisé pour `guardLevel`.

### Priorité basse

**R5 — Supprimer les clés legacy post-migration**  
Ajouter dans `runMigration()`, après le setItem du flag : `localStorage.removeItem` sur les 3 clés legacy.

**R6 — Granulariser le catch de `runMigration`**  
Entourer chaque bloc de migration (main / hist / sess) d'un try/catch individuel pour ne pas ignorer les étapes suivantes en cas d'échec partiel.

**R7 — Intégrer `CE_onboarding_v1` dans storage.js**  
Ajouter dans `KEYS` et créer un accès via storage.js pour cohérence.

---

## Cohérence avec la stratégie local-first

L'architecture localStorage de Caméléon Engine est cohérente avec la doctrine local-first :
- Zéro transmission réseau
- Données confinées au navigateur de l'utilisateur
- Dégradation gracieuse si localStorage indisponible
- Aucune dépendance à un état serveur

Le seul point structurel notable est le bypass partiel de `storage.js` par `render.js` pour 4 clés (`cameleon_behavior_memory_v1`, `CE_onboarding_v1`, et les 3 lectures directes behavior). Ces écarts sont fonctionnellement sains mais créent une dette architecturale modérée.

---

*Audit statique. Aucun code modifié. Aucun commit. Aucun push.*
