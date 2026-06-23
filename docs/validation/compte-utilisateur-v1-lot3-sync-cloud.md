# Compte Utilisateur V1 — LOT 3 : Synchronisation Cloud et Restauration Cross-Device

**STATUT : LOT 3 VALIDÉ POUR IMPLÉMENTATION**

---

## 1. Résumé exécutif

LOT 3 apporte la synchronisation cloud manuelle des données opérateur et la restauration automatique sur un nouvel appareil. Il s'appuie sur l'authentification Supabase délivrée en LOT 2 (Magic Link, table `accounts`, session persistence).

**Invariant architectural central :**

> X = 2 chemins d'écriture vers `operator_data`
> - FLUX A → `executeUpload()` (clic "Sauvegarder")
> - S2-LOCAL → `buildLocalPayload()` → `executeUpload()` (clic "Conserver mes données locales")
>
> Aucun autre chemin n'existe. Les deux chemins passent par `executeUpload()`. Il n'existe pas de second mécanisme d'UPSERT dans LOT 3.

---

## 2. Périmètre validé

| Fonctionnalité | Statut |
|---|---|
| Synchronisation manuelle locale → cloud (FLUX A) | Validé |
| Détection d'état de synchronisation à la connexion (FLUX B) | Validé |
| Restauration automatique cloud → local sur appareil vide (FLUX C) | Validé |
| UI de conflit — affichage et attente de décision | Validé |
| Résolution de conflit (S2) — propagation version gagnante | Validé |
| États dégradés : OFFLINE_LOCAL, INIT_EMPTY | Validé |
| Gardes d'accès FLUX A et résolution | Validé |

**Hors périmètre LOT 3 (reporté) :**

| Fonctionnalité | LOT cible |
|---|---|
| Auto-sync (timer, trigger automatique) | Hors périmètre permanent LOT 3 |
| Propagation cloud d'une purge locale | LOT 4+ |
| Versioning cloud / optimistic locking | LOT 4+ |
| Détection continue de conflit pendant session | LOT 4+ |
| Chiffrement du payload cloud | LOT 4B |
| Guard anti-doublon fingerprint cross-device | LOT 4+ |
| Suppression cloud explicite | LOT 4+ |

---

## 3. Architecture retenue

### 3.1 Principe fondateur — LOCAL-FIRST

Le localStorage de l'appareil est la source de vérité intentionnelle de l'opérateur (D-LOT3-CONFLICT-01). Le cloud est un miroir de sauvegarde. Il ne peut pas s'imposer implicitement sur le local.

### 3.2 Deux phases strictement séparées

- **Phase 1 — Détection** : `detectConflict()` lit et compare, n'écrit jamais dans `operator_data`.
- **Phase 2 — Décision** : déclenchée uniquement par action utilisateur explicite (D-LOT3-CONFLICT-04).

### 3.3 Trois flux d'exécution

```
FLUX A : clic "Sauvegarder"
  → buildLocalPayload()
  → executeUpload()
  → UPSERT operator_data (payload + updated_at)

FLUX B : account:connected
  → detectConflict()           [Phase 1 — lecture seule]
  → résultat parmi 5 cas + 2 états techniques
  → si CONFLICT : UI modale → choix utilisateur → S2
  → si AUTO_RESTORE : écriture cloud → localStorage (pas de UPSERT)

FLUX C : FLUX B avec local vide + cloud présent
  → detectConflict() → AUTO_RESTORE
  → restauration automatique cloud → localStorage
```

### 3.4 Table Supabase `operator_data`

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | `uuid` | PRIMARY KEY · FK → auth.users(id) · RLS : `auth.uid() = id` |
| `payload` | `jsonb` | NOT NULL |
| `updated_at` | `timestamptz` | NOT NULL · mis à jour à chaque UPSERT |

### 3.5 Structure du payload

```json
{
  "version": 1,
  "CE_journal_entries_v1": { "entries": [...] } | null,
  "CE_operator_memory_v1": {
    "sessionCount": number,
    "allTime": { "scoreSum", "scoreSessions", "patternFrequency", "profileHistory" },
    "window10": [...],
    "certifications": [...]
  } | null,
  "CE_oi_history_v1": { "entries": [...] } | null,
  "CE_portfolio_v1": { "snapshots": [...] } | null,
  "CE_settings_v1": { ... } | null
}
```

**Règles de normalisation :**
- `payload.version = 1` obligatoire (D-LOT3-DETECT-01)
- Clé absente = `null` — jamais `{}` ni `[]` (D-LOT3-DETECT-02)
- `importedFingerprints` exclu du payload (D-LOT3-PAYLOAD-01)
- Ordre des clés stable à chaque écriture (garantie JSON.stringify dans detectConflict)
- Remplacement total du payload à chaque UPSERT — aucun patch partiel

### 3.6 Résolution de conflit — stratégie S2

Après choix utilisateur, la version gagnante est propagée aux **deux** emplacements (D-LOT3-POST-CONFLICT-01) :

| Choix | Écriture cloud | Écriture localStorage |
|---|---|---|
| "Conserver mes données locales" (S2-LOCAL) | Oui — `buildLocalPayload()` → `executeUpload()` → UPSERT | Non (local déjà correct) |
| "Conserver les données du compte" (S2-CLOUD) | Non (cloud déjà correct) | Oui — payload cloud → localStorage |

---

## 4. Invariant X = 2 — Vérification exhaustive

| Mécanisme | Écrit dans `operator_data` | Chemin | Justification |
|---|---|---|---|
| `executeUpload()` via FLUX A | **Oui** | **FLUX A** | UPSERT principal |
| S2-LOCAL via résolution | **Oui** | **S2-LOCAL** | `buildLocalPayload()` → `executeUpload()` → UPSERT |
| `detectConflict()` | Non | — | SELECT uniquement — Phase 1 |
| AUTO_RESTORE | Non | — | Écriture localStorage uniquement, direction inverse |
| S2-CLOUD | Non | — | Cloud déjà correct — écriture localStorage uniquement |
| `signOut()` | Non | — | `clearAccountState()` locale uniquement |
| `account:connected` | Non | — | Déclenche detectConflict() Phase 1 |
| `account:disconnected` | Non | — | UI update uniquement |
| `account:sync_complete` | Non | — | Bus emission passif |
| `account:sync_error` | Non | — | Bus emission passif |
| Fermeture modale conflit | Non | — | Aucun handler write |
| Clic "Décider plus tard" | Non | — | Fermeture modale uniquement |
| F5 rechargement | Non | — | Annule in-flight, relance detect |
| Erreur FLUX A | Non | — | Échec = pas d'écriture réussie |
| Erreur S2-LOCAL | Non | — | UPSERT échoué |
| Erreur S2-CLOUD | Non | — | Écriture localStorage, pas cloud |
| OFFLINE_LOCAL | Non directement | Via FLUX A si clic Save | Même chemin que FLUX A standard |
| INIT_EMPTY | Non | — | Bouton désactivé — aucun appel possible |
| Timer / auto-save | Non | — | Inexistant dans LOT 3 |
| Retry automatique | Non | — | Interdit (D-LOT3-SYNC-TRIGGER-01) |

**X = 2. Aucun troisième chemin identifié.**

---

## 5. Décisions figées (13)

| ID | Titre | Impact principal |
|---|---|---|
| D-LOT3-CONFLICT-01 | LOCAL-FIRST : local = source de vérité intentionnelle | Modèle de données fondateur |
| D-LOT3-CONFLICT-02 | Vocabulaire neutre — aucune promotion cloud implicite | UI §5 — termes interdits/autorisés |
| D-LOT3-CONFLICT-03 | Aucune décision silencieuse | Toute écriture requiert action explicite |
| D-LOT3-CONFLICT-04 | Détection (Phase 1) ≠ Décision (Phase 2) | detectConflict() ne déclenche jamais S2 |
| D-LOT3-DETECT-01 | `payload.version = 1` obligatoire | Validation lecture payload cloud |
| D-LOT3-DETECT-02 | `null` par défaut pour clés absentes | Normalisation — pas de faux positifs JSON.stringify |
| D-LOT3-PAYLOAD-01 | Exclusion `importedFingerprints` du payload cloud | Isolation guard anti-doublon par appareil |
| D-LOT3-POST-CONFLICT-01 | S2 : version gagnante propagée aux deux emplacements | Cohérence local/cloud post-résolution |
| D-LOT3-SYNC-TRIGGER-01 | FLUX A = bouton explicite uniquement — aucun auto-sync | Pas de timer, pas de retry automatique |
| D-LOT3-UPLOAD-GUARD-01 | Garde UI sur le déclencheur FLUX A | Bouton désactivé selon état de sync |
| D-LOT3-RESOLUTION-GUARD-01 | Verrou terminal des boutons de résolution | Désactivation immédiate au premier clic |
| D-LOT3-OFFLINE-01 | État OFFLINE_LOCAL — echec réseau detectConflict() | Comportement dégradé sans cloud connu |
| D-LOT3-INIT-EMPTY-01 | État INIT_EMPTY — bouton désactivé si payload vide | Suppression ambiguïté INIT vs EMPTY_PAYLOAD |

---

## 6. Risques acceptés

| Référence | Description | Gravité | Probabilité | Traitement | LOT futur |
|---|---|---|---|---|---|
| RISK-S2-01 | Vainqueur S2 potentiellement périmé (fenêtre courte entre détection et résolution) | Moyenne | Faible | Accepté | LOT 4+ (versioning cloud) |
| RISK-SYNC-01 | Détection stale entre connexion et clic upload (fenêtre pouvant durer toute la session) | Élevée | Faible–Moyenne | Accepté | LOT 4+ (détection continue) |
| RISK-CROSS-01 | Last-writer-wins silencieux sur usage multi-appareils simultané — s'étend à S2-LOCAL | Élevée | Faible–Moyenne | Accepté | LOT 4+ (optimistic locking) |
| RISK-PURGE-01 | Purge locale non propageable — AUTO_RESTORE peut réintroduire données purgées | Moyenne | Faible | Accepté · reporté | LOT 4+ (flux suppression cloud) |
| MEMORY-FINGERPRINT-01 | Guard anti-doublon fingerprint inopérant cross-device — sessionCount potentiellement gonflé | Basse | Faible | Accepté | LOT 4+ (guard cloud) |
| NOTE-RESTORE-01 | AUTO_RESTORE interrompu → localStorage partiel → CONFLICT reproposé au cycle suivant | Basse | Très faible | Accepté | — |

---

## 7. États validés

| État | Condition | Bouton "Sauvegarder" | Note |
|---|---|---|---|
| DETECTING | detectConflict() en cours | Désactivé | — |
| OFFLINE_LOCAL (non vide) | Erreur réseau detectConflict() · local présent | Activé | RISK-SYNC-01 actif · état dégradé assumé |
| OFFLINE_LOCAL (vide) | Erreur réseau detectConflict() · local absent | Désactivé | Équivalent INIT_EMPTY |
| INIT_EMPTY | INIT + payload serait vide | Désactivé | "Aucune donnée locale à synchroniser" |
| NO_OP | local = cloud (confirmé) | Activé | — |
| KEEP_LOCAL | local présent · cloud absent | Activé | — |
| AUTO_RESTORE_IN_PROGRESS | local absent · cloud présent · écriture en cours | Désactivé | — |
| AUTO_RESTORE_DONE | Restauration localStorage confirmée | Activé | — |
| CONFLICT_PENDING | local ≠ cloud · en attente de décision | Désactivé | Boutons résolution actifs |
| CONFLICT_RESOLVING | Bouton résolution cliqué | Désactivé | Verrou terminal actif |
| CONFLICT_RESOLVED | S2 terminé avec succès | Activé | État = NO_OP |
| CONFLICT_DEFERRED | Modale fermée sans choix | Désactivé | Sortie : rechargement uniquement |
| UPLOADING | executeUpload() en cours | Désactivé | Verrou en vol |
| UPLOAD_SUCCESS | ok: true | Activé | État = NO_OP |
| UPLOAD_ERROR | ok: false | Activé | Re-clic manuel possible |
| S2_LOCAL_ERROR | S2-LOCAL échoué | Désactivé | Sortie : rechargement uniquement |
| S2_CLOUD_ERROR | S2-CLOUD échoué | Désactivé | Sortie : rechargement uniquement |

**Note critique — OFFLINE_LOCAL ≠ NO_OP :**

OFFLINE_LOCAL est un état dégradé assumé. Il ne doit pas être interprété comme équivalent à NO_OP. Dans NO_OP, l'égalité local = cloud est confirmée par `detectConflict()`. Dans OFFLINE_LOCAL, l'état cloud est inconnu — RISK-SYNC-01 reste actif si l'utilisateur déclenche FLUX A depuis cet état.

---

## 8. Gardes validées

### D-LOT3-UPLOAD-GUARD-01 — Déclencheur FLUX A

| État | Bouton "Sauvegarder" |
|---|---|
| DETECTING | Désactivé |
| detectConflict() en cours | Désactivé |
| CONFLICT_PENDING (non résolu) | Désactivé |
| CONFLICT_DEFERRED | Désactivé |
| UPLOADING (verrou en vol) | Désactivé |
| EMPTY_PAYLOAD / INIT_EMPTY | Désactivé |
| AUTO_RESTORE_IN_PROGRESS | Désactivé |
| NO_OP · KEEP_LOCAL · AUTO_RESTORE_DONE · CONFLICT_RESOLVED · UPLOAD_SUCCESS · UPLOAD_ERROR · OFFLINE_LOCAL (non vide) | **Activé** |

### D-LOT3-RESOLUTION-GUARD-01 — Boutons de résolution de conflit

- Désactivation immédiate au premier clic (les deux boutons)
- Verrou **terminal** : les boutons ne se réactivent jamais pour le même conflit
- Sortie après erreur S2 : rechargement uniquement — pas de second choix dans la même modale

### Couverture des chemins — preuve de non-bypass

| Tentative de bypass | Résultat |
|---|---|
| Clic "Sauvegarder" pendant CONFLICT_PENDING | Ignoré — D-LOT3-UPLOAD-GUARD-01 |
| Double-clic "Conserver local" | Premier clic seul exécuté — D-LOT3-RESOLUTION-GUARD-01 |
| Retry automatique après erreur | Inexistant — D-LOT3-SYNC-TRIGGER-01 |
| `account:connected` déclenche UPSERT | Impossible — `detectConflict()` Phase 1 uniquement |
| `account:sync_complete` déclenche UPSERT | Impossible — bus emission passif |
| Fermeture modale déclenche S2 | Impossible — aucun handler write dans §5 |

---

## 9. Points explicitement hors périmètre LOT 3

| Point | Justification | Référence |
|---|---|---|
| Auto-sync (timer, visibilitychange, on-idle) | Contreviendrait à D-LOT3-SYNC-TRIGGER-01 | D-LOT3-SYNC-TRIGGER-01 |
| Retry automatique après erreur réseau | Contreviendrait à D-LOT3-SYNC-TRIGGER-01 | D-LOT3-SYNC-TRIGGER-01 |
| Propagation cloud d'une purge locale | Flux distinct — confirmation explicite requise | RISK-PURGE-01 |
| Versioning cloud / optimistic locking | Mitigation RISK-CROSS-01 — hors périmètre | RISK-CROSS-01 |
| Détection continue de conflit pendant session | Mitigation RISK-SYNC-01 — hors périmètre | RISK-SYNC-01 |
| Guard anti-doublon fingerprint cross-device | Isolation module comportemental — hors périmètre | MEMORY-FINGERPRINT-01 |
| Patch partiel du payload (mise à jour d'une seule clé) | Remplacement total obligatoire | §4.3.6 |
| Merge de payload (fusion local + cloud) | Contredirait D-LOT3-CONFLICT-01 | D-LOT3-CONFLICT-01 |
| Promotion cloud implicite | Contredirait D-LOT3-CONFLICT-02 | D-LOT3-CONFLICT-02 |
| Chiffrement du payload | LOT 4B | — |

---

## 10. Conclusion de validation

### Gaps historiques — statut final

| Gap | Décision de fermeture | Statut |
|---|---|---|
| detectConflict() erreur réseau : état indéfini | D-LOT3-OFFLINE-01 — état OFFLINE_LOCAL | **Fermé** |
| INIT vs EMPTY_PAYLOAD : ambiguïté UX | D-LOT3-INIT-EMPTY-01 — état INIT_EMPTY | **Fermé** |

### Vérification finale

| Critère | Résultat |
|---|---|
| Invariant X = 2 | **Confirmé** |
| Contradictions inter-décisions | **Aucune** |
| Décisions orphelines | **Aucune** |
| Risques non documentés identifiés | **Aucun** |
| Gaps bloquants résiduels | **Aucun** |
| Nouveau chemin d'écriture cloud | **Aucun** |

---

**STATUT : LOT 3 VALIDÉ POUR IMPLÉMENTATION**

> X = 2 chemins d'écriture vers `operator_data`
> - **FLUX A** — `executeUpload()` via clic "Sauvegarder"
> - **S2-LOCAL** — `buildLocalPayload()` → `executeUpload()` via clic "Conserver mes données locales"
>
> **Aucun autre chemin autorisé.**
