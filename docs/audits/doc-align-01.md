# DOC-ALIGN-01 — Audit global de cohérence documentaire

> Caméléon Engine · 2026-06-07 · Aucun code · Aucune modification fonctionnelle

---

## Contexte

Cet audit a été déclenché après la clôture de MEM-01B et GUIDE-01B, avant la mise en ligne. Objectif : que la documentation soit aussi propre que le code. Un nouvel intervenant doit pouvoir comprendre le projet sans Antonio.

---

## Étape 1 — Inventaire complet

### Vue d'ensemble

| Catégorie | Fichiers | Localisation |
|---|---|---|
| Racine repo | 2 | `README.md`, `CLAUDE.md` |
| Docs racine | 12 | `docs/*.md` |
| Architecture | 41 | `docs/architecture/` |
| Cognitif / corpus | 64 | `docs/cognitive/` |
| Produit | 12 | `docs/product/` |
| UX | 17 | `docs/ux/` |
| Validation | 7 | `docs/validation/` |
| Imports | 10 | `docs/imports/` |
| Légal | 3 | `docs/legal/` |
| Fiches pédagogiques | 11 | `docs/fiches/` |
| Opérateur | 1 | `docs/operator-guide/` |
| Beta | 2 | `docs/beta/` |
| Mémoire | 2 | `docs/memory/` |
| Roadmap | 1 | `docs/roadmap/` |
| Vision | 1 | `docs/vision/` |
| Sécurité | 1 | `docs/security/` |
| Visual | 2 | `docs/visual/` |
| Archive | 1 | `docs/archive/` |
| **Total** | **~191** | |

### Tableau d'inventaire par document clé

| Document | Statut | À jour | Obsolète | Partiel | Action |
|---|---|---|---|---|---|
| `README.md` | Actif | ⚠️ Partiel | | ✅ | Mettre à jour caps mémoire + ADU |
| `CLAUDE.md` | Actif | ✅ | | | OK — vérifier caps |
| `docs/manifesto-cameleon-engine.md` | Figé | ✅ | | | Aucune action |
| `docs/README_FOUNDATIONS.md` | Actif | ✅ | | | §11 ajouté — OK |
| `docs/architecture-technique-cameleon-engine.md` | **Obsolète partiel** | | ⚠️ | | 3 valeurs périmées (voir §2) |
| `docs/audit-connexions-modules.md` | Archive observation | ✅ | | | Conserver tel quel |
| `docs/audit-produit-architecture-cognitive.md` | Archive observation | ✅ | | | Conserver tel quel |
| `docs/debt-audit.md` | **Partiel** | | | ⚠️ | Dernière MàJ 2026-06-03 — dettes ADU/MEM manquantes |
| `docs/plan-reduction-v1.md` | Archive | | ⚠️ | | Plan V1 implémenté — archiver explicitement |
| `docs/plan-v2.md` | Archive | | ⚠️ | | Plan V2 implémenté — archiver explicitement |
| `docs/plan-v3-friction-graduelle.md` | Archive | | ⚠️ | | Plan V3 implémenté — archiver explicitement |
| `docs/plan-v4-comportement-excel-csv.md` | Archive | | ⚠️ | | Plan V4 implémenté — archiver explicitement |
| `docs/validation-terrain-v1-v2-v3.md` | Archive observation | ✅ | | | Conserver — log historique |
| `docs/v0-session-log-template.md` | Actif | ✅ | | | Template valide |
| `docs/architecture/architecture-donnees-utilisateur.md` | **Partiel** | | | ⚠️ | ADU-04/05/06 clôturés — doc s'arrête à ADU-03 |
| `docs/architecture/binance-multi-source-memory.md` | Partiel | | | ⚠️ | "cap FIFO 20 sessions" → 50 |
| `docs/architecture/privacy-local-first-imports.md` | Partiel | | | ⚠️ | "Cap FIFO 20 sessions" → 50 |
| `docs/architecture/canonical_motor_state_2026.md` | Actif | ✅ | | | OK |
| `docs/architecture/checklist-implementation-phase-0.md` | Archivée complète | ✅ | | | Phase 0 ✅ — conserver comme trace |
| `docs/architecture/checklist-implementation-phase-1.md` | Archivée complète | ✅ | | | Phase 1 ✅ — conserver comme trace |
| `docs/architecture/checklist-implementation-phase-2.md` | Archivée complète | ✅ | | | Phase 2 ✅ — conserver comme trace |
| `docs/architecture/checklist-implementation-phase-3.md` | En attente terrain | ✅ | | | Phase 3 attend V0 — statut correct |
| `docs/architecture/checklist-implementation-phase-4.md` | En attente | ✅ | | | Phase 4 attend Phase 3 — statut correct |
| `docs/architecture/macro-doctrine-v1.md` | Figé | ✅ | | | Corpus figé `74611b4` — aucune action |
| `docs/architecture/pdf-intelligence-system-v1.md` | Actif | ✅ | | | OK |
| `docs/architecture/calibration-terrain.md` | Actif vivant | ✅ | | | Document évolutif — OK |
| `docs/architecture/protocole-test-reel-v0.md` | Actif | ✅ | | | OK |
| `docs/cognitive/` (64 fichiers) | Figé | ✅ | | | Corpus stabilisé — aucune action |
| `docs/product/doctrine-cameleon-profondeur-viabilite.md` | Figé | ✅ | | | Référence permanente |
| `docs/product/doctrine-confiance-importation-v1.md` | Figé | ✅ | | | Référence permanente |
| `docs/legal/` (3 fichiers) | Partiels | | | ⚠️ | FA-01/02/03 différés — à compléter post-lancement |
| `docs/operator-guide/guide-operateur-v1.md` | **Nouveau** | ✅ | | | Créé `2061162` — OK |
| `docs/roadmap/roadmap-realignment-post-constellium.md` | Actif | ✅ | | | MàJ `136315d` — OK |
| `docs/archive/ROADMAP_CAMELON_ENGINE_backup.md` | Archive | | ⚠️ | | Redondant avec roadmap active |
| `docs/memory/project_product_completeness_audit.md` | Actif | ✅ | | | Référence produit figée 2026-06-05 |
| `docs/beta/` (2 fichiers) | Actifs | ✅ | | | OK — templates terrain |

---

## Étape 2 — Détection des écarts

### 2.1 — Valeurs périmées (caps mémoire)

MEM-01B a modifié les caps le 2026-06-07. Les documents suivants mentionnent encore les anciennes valeurs :

| Document | Valeur actuelle dans doc | Valeur réelle | Commit de référence |
|---|---|---|---|
| `docs/architecture-technique-cameleon-engine.md:374` | `HISTORY_LIMIT = 50` | **200** | `abed3b4` |
| `docs/architecture-technique-cameleon-engine.md:391` | `HISTORY_LIMIT = 50` | **200** | `abed3b4` |
| `docs/architecture-technique-cameleon-engine.md:752` | `JOURNAL_LIMIT = 50` dans storage.js | **supprimé** (importé de data.js) | `abed3b4` |
| `docs/architecture/binance-multi-source-memory.md:120` | "cap FIFO 20 sessions" | **50** | `abed3b4` |
| `docs/architecture/privacy-local-first-imports.md:121` | "Cap FIFO 20 sessions" | **50** | `abed3b4` |
| `README.md` | Caps non spécifiés | À vérifier | — |

### 2.2 — Dettes décrites comme ouvertes mais déjà soldées

| Document | Dette mentionnée | Statut réel | Commit clôture |
|---|---|---|---|
| `docs/architecture/architecture-donnees-utilisateur.md:328` | ARCH-N2 — Import Registry sans user_id | **SOLDÉE** | `1b0f51b` |
| `docs/architecture/architecture-donnees-utilisateur.md:348` | ARCH-N4 — Pas d'export JSON | **CLÔTURÉE** | `7468940` |
| `docs/architecture/architecture-donnees-utilisateur.md:491` | "Prochain chantier : ADU-04" | **ADU-04/05/06 tous clôturés** | `7118244` |
| `docs/debt-audit.md` | Dernière MàJ 2026-06-03 | Manque : ADU-04A/B/C, MEM-01B, ADU-06, ARCH-N6 | Sessions 7–9 |

### 2.3 — Plans anciens non archivés explicitement

Ces documents décrivent des plans qui ont été implémentés. Ils n'ont pas de statut "ARCHIVÉ" explicite, ce qui peut induire un nouvel intervenant en erreur :

| Document | Contenu | État réel |
|---|---|---|
| `docs/plan-reduction-v1.md` | Plan V1 Reduction Pass | Implémenté — pas d'archivage explicite |
| `docs/plan-v2.md` | Reconstruction cognitive (curseur de confiance) | Implémenté — pas d'archivage explicite |
| `docs/plan-v3-friction-graduelle.md` | Friction graduelle | Implémenté — pas d'archivage explicite |
| `docs/plan-v4-comportement-excel-csv.md` | Module comportemental CSV/XLSX | Implémenté — pas d'archivage explicite |

### 2.4 — Documents redondants

| Doublon | Référence active | Action |
|---|---|---|
| `docs/archive/ROADMAP_CAMELON_ENGINE_backup.md` | `docs/roadmap/roadmap-realignment-post-constellium.md` | Supprimer ou marquer obsolète |

### 2.5 — Branche de référence périmée

`docs/architecture-technique-cameleon-engine.md` cite la branche `feature/allowed-engine` comme branche de référence. Cette branche n'existe plus — le code est sur `main`. La ligne est trompeuse pour un nouvel intervenant.

### 2.6 — Documents manquants

| Manque | Impact | Priorité |
|---|---|---|
| Synthèse d'état post-MEM-01B (caps, schemas, importRegistry) | Un intervenant ne sait pas que les caps ont changé | Haute |
| Document UUID namespacing / ADU-04/05/06 clôture | Architecture storage pas à jour dans les docs | Haute |
| Index des audits | `docs/audits/` vient d'être créé — pas encore indexé dans README_FOUNDATIONS | Moyenne |
| Mention `docs/operator-guide/` dans README_FOUNDATIONS | Guide créé mais non référencé dans l'index fondateurs | Haute |

---

## Étape 3 — Comparaison avec les priorités réelles

### Ordre officiel des priorités produit

1. Portefeuille utilisateur
2. Mémoire opérateur
3. PDF Import V1
4. Comptes utilisateur
5. Paiement
6. Mise en ligne
7. Validation terrain
8. Macro V1
9. Corrélations avancées

### Couverture documentaire actuelle par priorité

| Priorité | Documentation existante | Lacune |
|---|---|---|
| **1. Portefeuille utilisateur** | `docs/architecture/wallet-history-behavioral-audit-v1.md` · `docs/architecture/binance-multi-source-memory.md` | Pas de spec de chantier · BMSM non démarré |
| **2. Mémoire opérateur** | `docs/architecture/architecture-donnees-utilisateur.md` · `docs/memory/project_product_completeness_audit.md` | ADU doc partiel (s'arrête à ADU-03) — ADU-04/05/06 non reflétés |
| **3. PDF Import V1** | `docs/architecture/pdf-intelligence-system-v1.md` · `docs/imports/pdf-import-v1/` | Clôturé `92e1440` — documentation à jour |
| **4. Comptes utilisateur** | `docs/architecture/architecture-donnees-utilisateur.md` (D-04) | Différé V2 — correct, rien à faire |
| **5. Paiement** | Aucun | Normal — prématuré |
| **6. Mise en ligne** | `docs/beta/` · `docs/legal/` | Legal partiel (FA-01/02/03 différés) — OK |
| **7. Validation terrain** | `docs/architecture/protocole-test-reel-v0.md` · `docs/architecture/calibration-terrain.md` · `docs/beta/` | OK — protocoles en place |
| **8. Macro V1** | `docs/architecture/macro-doctrine-v1.md` · `docs/architecture/couche-macro-phase1.md` | Corpus figé — OK |
| **9. Corrélations avancées** | Aucun | Normal — horizon lointain |

### Écarts identifiés

**Écart A — Mémoire opérateur :** La priorité #2 est la mieux exécutée côté code (ADU-04/05/06 clôturés, namespacing UUID opérationnel, caps 50/200/100) mais la documentation ne reflète pas cet état. Un intervenant lisant `architecture-donnees-utilisateur.md` croira qu'ADU-04 reste à faire.

**Écart B — Portefeuille utilisateur :** Priorité #1 sans chantier ouvert ni spec. BMSM documenté mais non démarré. C'est le vide documentaire le plus critique avant la mise en ligne.

**Écart C — Guide opérateur :** Créé `2061162` mais non référencé dans le Foundations Index côté fichier, ni dans README.md. Un testeur qui arrive sur le repo ne le trouve pas.

**Écart D — Plans V1/V2/V3/V4 :** Quatre documents de plan sans archivage explicite flottent dans `docs/`. Ils ne correspondent plus à aucune priorité active mais semblent "en cours" à un lecteur nouveau.

---

## Étape 4 — Structure Notion recommandée

Structure proposée pour le workspace Notion. Objectif : un intervenant qui ouvre Notion comprend immédiatement l'état du projet sans lire le repo.

```
🦎 Caméléon Engine
│
├── 📋 Produit
│   ├── Vision produit
│   ├── Positionnement
│   ├── 📖 Guide opérateur V1          ← existe (commit 2061162)
│   ├── 🗺️ Roadmap officielle           ← existe
│   └── Audit de complétude V1         ← existe (docs/memory/)
│
├── 🏗️ Architecture
│   ├── État canonique du moteur       ← existe
│   ├── Données utilisateur (ADU)      ← à mettre à jour
│   ├── Cartographie variables         ← existe
│   ├── Mémoire opérateur (MEM-01B)   ← à créer (synthèse caps + schemas)
│   ├── Import PDF V1                  ← existe
│   └── Couche Macro V1                ← existe
│
├── 🧠 Comportement & Corpus
│   ├── Mapping Behavior ↔ Moteur      ← existe
│   ├── Principes architecture cognitive ← existe
│   ├── Audits Binance (Trade/Order/Wallet) ← existent
│   └── Calibration personnelle V1     ← existe
│
├── ✅ Validation
│   ├── Protocole test réel V0         ← existe
│   ├── Résultats V0-A                 ← existe
│   └── Calibration terrain            ← existe
│
├── 🧪 Tests & Audits
│   ├── DOC-ALIGN-01 (ce document)    ← nouveau
│   ├── Audit dette technique          ← partiel
│   └── Stress tests analytiques       ← existent (memory)
│
├── ⚖️ Légal
│   ├── Mentions légales               ← existe
│   ├── CGU (post-lancement)           ← différé
│   └── Politique confidentialité      ← différé
│
├── 📜 Historique
│   ├── Commits majeurs               ← à créer
│   ├── Décisions structurantes       ← dispersées en mémoire
│   └── Synthèse stratégique 48h      ← existe
│
└── 🗂️ Foundations Index              ← existe — à compléter §11+
```

### Pages à créer en priorité dans Notion

| Page | Contenu | Urgence |
|---|---|---|
| **Mémoire opérateur — MEM-01B** | Caps SESSION=50 · HISTORY=200 · importRegistry=100 · schemas enrichis | Haute |
| **ADU — État complet post-clôture** | ADU-04/05/06 clôturés · namespacing UUID · 9 clés · migration propre | Haute |
| **Commits majeurs** | Table: commit / date / chantier / impact | Moyenne |
| **Décisions structurantes** | D-01→D-06 + ARCH-N1/N2/DO-03 + MEM-01B | Moyenne |

---

## Étape 5 — Ordre recommandé des prochains chantiers documentaires

Les chantiers sont classés par impact sur la lisibilité du projet pour un intervenant externe, non par importance fonctionnelle.

### Chantier 1 — Corriger les valeurs périmées (QUICK WIN)

**Durée estimée :** 1 session courte  
**Impact :** Supprime les contradictions les plus visibles

Fichiers à corriger :

| Fichier | Ligne | Correction |
|---|---|---|
| `docs/architecture-technique-cameleon-engine.md` | 374 | `HISTORY_LIMIT = 200` |
| `docs/architecture-technique-cameleon-engine.md` | 391 | `HISTORY_LIMIT = 200` |
| `docs/architecture-technique-cameleon-engine.md` | 752 | Supprimer mention JOURNAL_LIMIT · remplacer par "importé de data.js" |
| `docs/architecture-technique-cameleon-engine.md` | 5 | Branche `feature/allowed-engine` → `main` |
| `docs/architecture/binance-multi-source-memory.md` | 120 | "20 sessions" → "50 sessions" |
| `docs/architecture/privacy-local-first-imports.md` | 121 | "20 sessions" → "50 sessions" |

### Chantier 2 — Mettre à jour architecture-donnees-utilisateur.md

**Durée estimée :** 1 session  
**Impact :** Le document le plus consulté sur les données est actuellement trompeur

Actions :
- Ajouter §ADU-04, §ADU-05, §ADU-06 (état clôturé avec commits)
- Marquer ARCH-N2 comme soldée (`1b0f51b`)
- Marquer ARCH-N4 comme clôturée (`7468940`)
- Changer "Prochain chantier : ADU-04" en "ADU-04/05/06 clôturés"
- Mettre à jour les caps : ARCH-N3 cap 20 → 50 (mais ARCH-N3 reste différée pour autre raison)

### Chantier 3 — Archiver les plans V1/V2/V3/V4

**Durée estimée :** 30 minutes  
**Impact :** Supprime 4 documents ambigus qui semblent "en cours"

Action : Ajouter un bandeau en tête de chaque fichier :
```
> **ARCHIVÉ** — Ce plan a été implémenté. Il est conservé comme trace historique.
> État actuel : voir `docs/architecture/canonical_motor_state_2026.md`
```

### Chantier 4 — Mettre à jour debt-audit.md

**Durée estimée :** 1 session  
**Impact :** L'audit des dettes redevient fiable

Dettes à ajouter comme soldées :
- ADU-04A/B/C (commits `358d9b2` / `b4eb8d2` / `7118244`)
- MEM-01B Bloc A/B/C/D (commits `abed3b4` → `1b0f51b`)
- ADU-05 / ARCH-N2 (commit `1b0f51b`)
- ADU-06 / ARCH-N4 (commit `7468940`) / ARCH-N6 (commit `87578f3`)
- GUIDE-01B (commit `2061162`)

### Chantier 5 — Référencer le guide opérateur dans README_FOUNDATIONS

**Durée estimée :** 15 minutes  
**Impact :** Un testeur qui arrive trouve le guide d'entrée

Ajouter entrée dans `docs/README_FOUNDATIONS.md` §8 :

```markdown
| Guide Opérateur V1 | Document d'accueil opérationnel bêta · 7 sections · aucun conseil financier | `docs/operator-guide/guide-operateur-v1.md` | `2061162` |
```

Idem dans `README.md` racine.

### Chantier 6 — Créer la synthèse MEM-01B dans docs/

**Durée estimée :** 1 session  
**Impact :** L'état réel de la mémoire opérateur devient lisible sans lire le code

Fichier cible : `docs/architecture/mem-01b-memory-caps-schemas.md`

Contenu :
- Caps actuels : SESSION=50 · HISTORY=200 · BACKUPS=50 · IMPORT_REGISTRY=100
- Schema backup enrichi (MEM-01B Bloc B)
- Schema session comportementale avec snapshot (MEM-01B Bloc C)
- ImportRegistry activé (MEM-01B Bloc D)

### Chantier 7 — Supprimer ou marquer le backup roadmap

**Durée estimée :** 5 minutes  
**Impact :** Supprime un doublon trompeur

`docs/archive/ROADMAP_CAMELON_ENGINE_backup.md` → ajouter bandeau "ARCHIVÉ · Référence active : docs/roadmap/"

### Résumé par urgence

| Urgence | Chantier | Durée |
|---|---|---|
| **Immédiate** | 1 — Corriger valeurs périmées | Court |
| **Immédiate** | 5 — Référencer guide opérateur | 15 min |
| **Haute** | 2 — Mettre à jour ADU doc | 1 session |
| **Haute** | 4 — Mettre à jour debt-audit | 1 session |
| **Moyenne** | 3 — Archiver plans V1/V2/V3/V4 | 30 min |
| **Moyenne** | 6 — Synthèse MEM-01B | 1 session |
| **Basse** | 7 — Backup roadmap | 5 min |

---

*DOC-ALIGN-01 · Audit documentaire · Caméléon Engine · 2026-06-07*
