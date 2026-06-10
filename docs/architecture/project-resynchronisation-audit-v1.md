# Caméléon Engine — Audit de Resynchronisation V1

> Document d'audit global · 2026-06-10
> Statut : **RÉFÉRENCE — audit objectif, aucune nouvelle architecture, aucun code**
> Portée : repo + documentation + mémoire + roadmap + Notion

---

## Sommaire

1. [Cartographie complète](#1-cartographie-complète)
2. [Audit documentaire](#2-audit-documentaire)
3. [Détection des doublons et conflits](#3-détection-doublons)
4. [Alignement mémoire long terme](#4-alignement-mémoire-long-terme)
5. [Audit Roadmap](#5-audit-roadmap)
6. [Audit Notion](#6-audit-notion)
7. [Actions recommandées](#7-actions-recommandées)
8. [État de cohérence global](#8-état-global)

---

## 1. Cartographie complète

### 01 — FONDATIONS

| Fichier | Nature |
|---|---|
| `docs/manifesto-cameleon-engine.md` | Manifeste officiel |
| `docs/product/doctrine-cameleon-profondeur-viabilite.md` | Doctrine profondeur |
| `docs/product/doctrine-cameleon-transmission-test-reel-v0.md` | Doctrine transmission |
| `docs/product/cadrage-produit-deux-couches.md` | Positionnement deux couches |
| `docs/product/doctrine-confiance-importation-v1.md` | Doctrine confiance |
| `docs/architecture/product_architecture_post_6c3f6fd.md` | Architecture produit officielle (6 couches) |
| `docs/architecture/modele-mental-canonique.md` | Boucle de réflexivité — modèle fondateur |
| `docs/architecture/doctrine-ecosysteme-source-lecteurs.md` | Doctrine une source / plusieurs lecteurs |
| `docs/vision/vision-systeme-immunitaire-cognitif.md` | Vision long terme |
| `docs/cognitive/principes-architecture-cognitive.md` | 7 lois corpus cognitif |
| `docs/cognitive/grammar/vocabulaire-cameleon.md` | Vocabulaire officiel |
| `README.md` | Entrée publique projet |
| `CLAUDE.md` | Instructions développement |
| `UX_NOTES.md` | Notes UX informelles |

### 02 — MÉMOIRE

| Fichier | Nature |
|---|---|
| `docs/architecture/mem-v2-compte-memoire-persistante.md` | Architecture compte + 3 espaces |
| `docs/architecture/baseline-v1-officielle.md` | Référence comportementale versionnée |
| `docs/architecture/couche-fantome-snapshots-v1.md` | Snapshots immuables Couche 2 |
| `docs/architecture/memoire-long-terme-roadmap-alignement.md` | Séquence officielle implémentation mémoire |
| `docs/architecture/mem-01b-memory-caps-schemas.md` | Caps localStorage — CLÔTURÉ |
| `docs/architecture/architecture-donnees-utilisateur.md` | ADU-01→04, namespacing UUID |
| `docs/product/feasibility-miroir-comportemental.md` | Étude faisabilité miroir |
| `docs/memory/project_product_completeness_audit.md` | Audit complétude produit V1 |
| `docs/memory/project_learning_memory.md` | Audit B1–B19 |

*Bibliothèque Vivante, Trajectoire opérateur, Mémoire des erreurs : doctrine uniquement, aucun fichier dédié. Couvertes par les documents ci-dessus.*

### 03 — COMPORTEMENTAL

| Fichier | Nature |
|---|---|
| `docs/architecture/canonical_motor_state_2026.md` | État canonique moteur — référence code |
| `docs/cognitive/behavior-engine-mapping-v1.md` | Mapping 52 concepts → moteur |
| `docs/cognitive/behavior-lifecycle-v1.md` | Séquences cause-effet comportemental |
| `docs/cognitive/implementation-debts-cognitive-corpus.md` | Dettes D1–D8 corpus |
| `docs/cognitive/audit-cockpit-lot5a.md` | Audit cockpit post-Lot 5A |
| `docs/cognitive/architecture/lot-5a-psychologie-collective-design.md` | Psychologie collective |
| `docs/cognitive/architecture/lot-5b-macro-climat-design.md` | Macro comme climat |
| `docs/cognitive/concepts/` (50 fichiers) | Corpus comportemental complet |
| `docs/cognitive/taxonomy/index.md` | Taxonomie comportementale |
| `docs/cognitive/behavior/index.md` | Index comportements |
| `docs/cognitive/transitions/index.md` | Index transitions |
| `docs/cognitive/anti-patterns/index.md` | Index anti-patterns |
| `docs/cognitive/patterns/index.md` | Index patterns |
| `docs/validation-terrain-v1-v2-v3.md` | Validation terrain |

*Scores et Profils : dans CLAUDE.md et engine.js, non dans un doc dédié.*

### 04 — IMPORTS

| Fichier | Nature |
|---|---|
| `docs/architecture/pdf-intelligence-system-v1.md` | Doctrine PDF intelligente (4 niveaux) |
| `docs/architecture/pdf-import-v1-architecture.md` | Architecture PDF Import V1 — CLÔTURÉ |
| `docs/imports/pdf-import-v1/` (10 fichiers) | Spécifications détaillées PDF |
| `docs/architecture/source-detection-v1.md` | Détection source fichier |
| `docs/architecture/parser-v1.md` | Parser générique |
| `docs/architecture/binance-audits-synthesis-v1.md` | Synthèse 4 audits Binance |
| `docs/architecture/calibration-personnelle-binance-v1.md` | Calibration comportementale Binance |
| `docs/architecture/wallet-history-behavioral-audit-v1.md` | Audit Wallet History |
| `docs/architecture/order-history-behavioral-audit-v1.md` | Audit Order History |
| `docs/architecture/binance-multi-source-memory.md` | BMSM — architecture multi-source |
| `docs/architecture/privacy-local-first-imports.md` | Doctrine privacy imports |
| `excel_tests/` (17 fichiers) | Cas de test CSV/XLSX |
| `docs/audit-connexions-modules.md` | Connexions import → moteur |

### 05 — MOTEUR COGNITIF

| Fichier | Nature |
|---|---|
| `docs/architecture/doctrine-silence-structurel.md` | Silence = comportement par défaut |
| `docs/architecture/couche-coherence-inter-modules.md` | tensionMap, active_exposed ≤ 1 |
| `docs/architecture/hierarchie-des-tensions.md` | Ordre T3>T1>T2>T4 |
| `docs/architecture/explicabilite-sobre.md` | ExpositionResult, 4 intentions |
| `docs/architecture/gestion-attention.md` | Gate attention, déclin cycles |
| `docs/architecture/cartographie-variables-pipeline.md` | P1–P6, 15 variables source unique |
| `docs/architecture/strategie-implementation-v2.md` | Migration incrémentale V2 |
| `docs/architecture/calibration-terrain.md` | Seuils provisoires V0 |
| `docs/architecture/instrumentation-debug-calibration.md` | CalibrationSnapshot, export JSON |
| `docs/product/fdm-01-flux-directionnel-marche.md` | FDM-01 — figé |
| `docs/architecture/couche-macro-phase1.md` | Macro Phase 1 — CLÔTURÉE |
| `docs/architecture/macro-layer-strategic-architecture.md` | Architecture stratégique Macro |
| `docs/architecture/macro-doctrine-v1.md` | Doctrine Macro V1 — FIGÉE |

### 06 — INTERFACE

| Fichier | Nature |
|---|---|
| `docs/product/user-journey-v1.md` | Parcours utilisateur — STABILISÉ |
| `docs/ux/how-cameleon-reads-screen-spec-v1.md` | Spec écran lecture |
| `docs/ux/how-cameleon-reads-ux-validation-v4.md` | Validation UX V1→V4 |
| `docs/architecture/how-cameleon-reads-v1.md` | Architecture lecture (en architecture/) |
| `docs/ux/lab-silence-*.md` (8 fichiers) | Laboratoire Silence — outil interne |
| `docs/ux/cognitive-reanimation-v1.md` | Réanimation cognitive |
| `docs/ux/cognitive-reanimation-analysis-v1.md` | Analyse réanimation |
| `docs/ux/narrative-engine-status-v1.md` | Moteur narratif — conditionnel |
| `docs/ux/nar-cluster-point-arret-2026-06-05.md` | NAR cluster — fermé |
| `docs/ux/perc-01-calibration-perceptive-cockpit.md` | Calibration perceptive cockpit |
| `docs/visual/audit-visuel-canonique-v1.md` | Audit visuel |
| `UX_NOTES.md` | Notes UX informelles |

### 07 — ROADMAP

| Fichier | Nature |
|---|---|
| `docs/roadmap/roadmap-realignment-post-constellium.md` | Roadmap stratégique 2026-05-25 |
| `docs/product/orientation-roadmap-cameleon-engine-v1.md` | Orientation roadmap 2026-05-19 |
| `docs/architecture/memoire-long-terme-roadmap-alignement.md` | Séquence mémoire — 2026-06-10 |
| `docs/architecture/dec-foundations-01.md` | 4 décisions fondations — FIGÉES |
| `docs/architecture/protocole-test-reel-v0.md` | Protocole V0 — 6 objectifs |
| `docs/architecture/preparation-production-v2.md` | Stratégie activation V2 |
| `docs/product/protocole-beta-v1.md` | Protocole bêta V1 |
| `docs/product/plan-10-premiers-utilisateurs.md` | Plan 10 premiers opérateurs |
| `docs/beta/beta-1-operateur-option-a.md` | Message bêta #1 |
| `docs/beta/message-invitation-beta-1.md` | Message invitation |
| `docs/architecture/point-arret-2026-05-29.md` | Snapshot état projet |

*Checklists Phase 0–4 : voir §08 RECHERCHE*

### 08 — RECHERCHE

| Fichier | Nature |
|---|---|
| `docs/architecture/checklist-implementation-phase-0.md` | Checklist Phase 0 — terminé |
| `docs/architecture/checklist-implementation-phase-1.md` | Checklist Phase 1 — terminé |
| `docs/architecture/checklist-implementation-phase-2.md` | Checklist Phase 2 — terminé |
| `docs/architecture/checklist-implementation-phase-3.md` | Checklist Phase 3 — en attente V0 |
| `docs/architecture/checklist-implementation-phase-4.md` | Checklist Phase 4 — en attente V0 |
| `docs/architecture/plan-implementation-v2-phase-1.md` | Plan Phase 0/1 |
| `docs/architecture/snapshots-phase3-reference.md` | Snapshots Phase 3 |
| `docs/architecture/v0-observation-strategy.md` | Stratégie observation V0 |
| `docs/architecture/v0-personal-calibration-binance.md` | Calibration personnelle V0 |
| `docs/product/constellium-product-architecture.md` | Constellium — archivé |
| `docs/architecture/constellium_code_audit_2026.md` | Constellium code audit — archivé |
| `docs/fiches/` (11 fichiers) | Fiches pédagogiques — lot fermé |
| `docs/legal/` (3 fichiers) | Légal bêta — actif |
| `docs/security/security-audit-v1.md` | Audit sécurité V1 |
| `docs/product/audit-coherence-doctrinale-2026-05-19.md` | Audit cohérence snapshot |
| `docs/product/audit-dette-travail-phase0-phase1.md` | Audit dette Phase 0/1 |
| `docs/audit-produit-architecture-cognitive.md` | Audit produit/cog |

---

## 2. Audit documentaire

### Légende statuts

- **Actif** : document de référence opérationnel, à lire avant tout chantier concerné
- **Figé** : doctrine close, ne pas modifier sans décision explicite
- **Clôturé** : chantier terminé, archive technique
- **Conditionnel** : activable sous condition documentée
- **Snapshot** : photographie historique, valeur archivistique
- **Obsolète** : remplacé ou contredit par un document plus récent

### FONDATIONS

| Document | Statut | Dépendances | Maturité |
|---|---|---|---|
| `manifesto-cameleon-engine.md` | **Figé** | Aucune | Canonique |
| `doctrine-cameleon-profondeur-viabilite.md` | **Figé** | manifesto | Canonique |
| `doctrine-cameleon-transmission-test-reel-v0.md` | **Figé** | protocole-beta | Canonique |
| `doctrine-confiance-importation-v1.md` | **Figé** | imports | Canonique |
| `cadrage-produit-deux-couches.md` | **Actif** | manifesto | Stable |
| `product_architecture_post_6c3f6fd.md` | **Actif** | moteur | Stable |
| `modele-mental-canonique.md` | **Actif** | manifesto | Stable |
| `doctrine-ecosysteme-source-lecteurs.md` | **Figé** | architecture produit | Long terme |
| `vision-systeme-immunitaire-cognitif.md` | **Figé** | Aucune | Vision |
| `principes-architecture-cognitive.md` | **Figé** | corpus cognitif | Canonique |

### MÉMOIRE

| Document | Statut | Dépendances | Maturité |
|---|---|---|---|
| `mem-v2-compte-memoire-persistante.md` | **Actif** — RÉFÉRENCE | domaine+HTTPS | Doctrine — non démarré |
| `baseline-v1-officielle.md` | **Actif** — RÉFÉRENCE | schéma session enrichi | Doctrine — bloqué §10 |
| `couche-fantome-snapshots-v1.md` | **Actif** — RÉFÉRENCE | Baseline V1 | Doctrine — bloqué §11 |
| `memoire-long-terme-roadmap-alignement.md` | **Actif** | triade mémoire | Alignement |
| `mem-01b-memory-caps-schemas.md` | **Clôturé** | ADU-04 | Implémenté |
| `architecture-donnees-utilisateur.md` | **Clôturé** | Aucune | Implémenté |
| `feasibility-miroir-comportemental.md` | **Figé** | ≥10 opérateurs | Étude |
| `project_product_completeness_audit.md` | **Actif** | audit global | RÉFÉRENCE PRODUIT |

### COMPORTEMENTAL

| Document | Statut | Dépendances | Maturité |
|---|---|---|---|
| `canonical_motor_state_2026.md` | **Actif** | code source | Canonique — figé volontairement |
| `behavior-engine-mapping-v1.md` | **Actif** | 52 concepts | Stable |
| `behavior-lifecycle-v1.md` | **Actif** | mapping V1 | D4 soldée |
| `implementation-debts-cognitive-corpus.md` | **Actif** | corpus | D1/D3/D5–D8 ouvertes |
| `lot-5a/5b design` (2 docs) | **Figé** | corpus | Clos |
| 50 fiches concepts | **Figé** | corpus | Lot fermé |

### IMPORTS

| Document | Statut | Dépendances | Maturité |
|---|---|---|---|
| `pdf-intelligence-system-v1.md` | **Actif** | PDF ARCH-01→06 | Doctrine |
| `pdf-import-v1-architecture.md` | **Clôturé** | pdf-intelligence | Implémenté |
| `binance-audits-synthesis-v1.md` | **Actif** | 4 audits Binance | RÉFÉRENCE imports |
| `calibration-personnelle-binance-v1.md` | **Actif** — Priorité B | ≥5 exports terrain | Attend signal |
| `binance-multi-source-memory.md` | **Actif** — Priorité B | calibration | Attend signal |
| `wallet-history-behavioral-audit-v1.md` | **Actif** | synthèse | Documenté |
| `order-history-behavioral-audit-v1.md` | **Actif** | synthèse | Documenté |

### MOTEUR COGNITIF

| Document | Statut | Dépendances | Maturité |
|---|---|---|---|
| `doctrine-silence-structurel.md` | **Figé** | V2 | Invariant absolu |
| `couche-coherence-inter-modules.md` | **Actif** | V2 Phase 2 | Phase 2 ✅ |
| `hierarchie-des-tensions.md` | **Actif** | V2 Phase 2 | Phase 2 ✅ |
| `explicabilite-sobre.md` | **Actif** | V2 Phase 3 | Shadow mode |
| `gestion-attention.md` | **Actif** | V2 Phase 3 | Shadow mode |
| `macro-doctrine-v1.md` | **Figé** | infra Phase 1 | Canonique |
| `couche-macro-phase1.md` | **Clôturé** | macro doctrine | Infra déployée |
| `fdm-01-flux-directionnel-marche.md` | **Figé** — en réserve | source données | 2 conditions réouverture |
| `strategie-implementation-v2.md` | **Actif** | Phase 0–6 | Référence V2 |

### INTERFACE

| Document | Statut | Dépendances | Maturité |
|---|---|---|---|
| `user-journey-v1.md` | **Actif** — STABILISÉ | interface actuelle | D3–D7 tranchées |
| `narrative-engine-status-v1.md` | **Conditionnel** | V0 ≥10 ops | NAR-IN conditionnel |
| `nar-cluster-point-arret-2026-06-05.md` | **Clôturé** | cluster NAR | Surveillance |
| Lab Silence V1–V2 (8 docs) | **Figé** — en réserve | V2-E7 limite | Outil interne |
| `cognitive-reanimation-v1.md` | **Actif** | UX V2 | Déployé |
| `perc-01-calibration-perceptive-cockpit.md` | **Actif** | cockpit V2 | Provisoire |

### ROADMAP

| Document | Statut | Dépendances | Maturité |
|---|---|---|---|
| `roadmap-realignment-post-constellium.md` | **Actif** | état projet | Référence stratégique |
| `orientation-roadmap-cameleon-engine-v1.md` | **Snapshot** | — | 2026-05-19 — partiellement dépassé |
| `dec-foundations-01.md` | **Figé** | D1–D4 tranchées | DÉCISIONS FIGÉES |
| `preparation-production-v2.md` | **Conditionnel** | Phase 4 Go | Attend Phase 4 |
| `protocole-beta-v1.md` | **Actif** | dec-foundations | J0→J+45 |
| `plan-10-premiers-utilisateurs.md` | **Actif** | protocole bêta | J0→J+90 |
| `protocole-test-reel-v0.md` | **Actif** | V2 Phase 2 | Phase 3 attend |
| `point-arret-2026-05-29.md` | **Snapshot** | — | 2026-05-31 |

---

## 3. Détection des doublons et conflits

### Cas A — Deux documents décrivent la même chose

**A1 — Trois documents de roadmap stratégique**

`orientation-roadmap-cameleon-engine-v1.md` (2026-05-19) + `roadmap-realignment-post-constellium.md` (2026-05-25) + mémoire `project_product_roadmap_foundations.md` + `memoire-long-terme-roadmap-alignement.md` (2026-06-10).

Chaque document couvre "où en est le projet et quoi faire ensuite". La séquence est chronologique, mais aucun des premiers n'est explicitement marqué dépassé. Risque de lire le mauvais.

**Document de référence actif :** `roadmap-realignment-post-constellium.md` + `memoire-long-terme-roadmap-alignement.md` pour la mémoire. Les deux précédents sont des snapshots historiques.

---

**A2 — `pdf-import-v1-architecture.md` et `pdf-intelligence-system-v1.md`**

Les deux couvrent l'architecture PDF. `pdf-import-v1-architecture.md` est CLÔTURÉ (implémenté), `pdf-intelligence-system-v1.md` est la doctrine. Relation claire en principe, mais les 10 fichiers dans `docs/imports/pdf-import-v1/` créent un troisième point de lecture.

**Clarification nécessaire :** annoter `pdf-import-v1-architecture.md` comme "archive" et `pdf-intelligence-system-v1.md` comme "doctrine active".

---

**A3 — `point-arret-2026-05-29.md` et `project_product_completeness_audit.md`**

Les deux sont des photographies de l'état du projet à date proche (fin mai / début juin 2026). Le premier est un snapshot opérationnel. Le second est un audit de complétude produit. Couverture partiellement redondante.

**Décision possible :** `project_product_completeness_audit.md` est la RÉFÉRENCE active. `point-arret-2026-05-29.md` est archive.

---

### Cas B — Deux termes différents pour le même concept

**B1 — "Baseline" vs "Référence comportementale"**

Le document `baseline-v1-officielle.md` utilise "Baseline". Le document `calibration-personnelle-binance-v1.md` utilise "calibration" et "miroir baseline". Les deux parlent de comportement historique mais désignent des architectures différentes (décisionnel vs transactionnel). **Non-doublon confirmé par la doctrine** — mais le terme "miroir baseline" dans `calibration-personnelle-binance-v1.md` crée une confusion terminologique.

**Clarification nécessaire :** s'assurer que `calibration-personnelle-binance-v1.md` contient une note explicite : "Calibration Binance ≠ Baseline V1 — voir distinction dans `baseline-v1-officielle.md`".

---

**B2 — "Couche 2" vs "Tendances" vs "Profil comportemental"**

Ces termes sont utilisés dans différents documents pour désigner approximativement la même chose. `canonical_motor_state_2026.md` définit les couches. Les autres documents les référencent de façon variable.

**Risque :** faible si on lit `canonical_motor_state_2026.md` en premier. Document canonique existant.

---

**B3 — "Session" a deux définitions en coexistence**

Dans le module Comportement : session = passage CSV/import. Dans MEM-V2 : session = "occasion de se voir agir" dans le moteur principal. Les deux définitions sont présentes dans le codebase et dans les docs.

**Clarification nécessaire :** `mem-v2-compte-memoire-persistante.md` §2 définit la session canonique. Cette définition doit être cross-référencée dans `architecture-donnees-utilisateur.md`.

---

### Cas C — Document ancien contredit par document plus récent

**C1 — `orientation-roadmap-cameleon-engine-v1.md` (2026-05-19) liste des chantiers "à démarrer" qui sont depuis soit CLÔTURÉS, soit FIGÉS**

Ex. : Portefeuille V1 est listé comme "à démarrer" dans ce document mais est CLÔTURÉ depuis juin 2026 (commits `9275466`→`6c05db8`).

**Action :** marquer le document comme Snapshot (archive 2026-05-19).

---

**C2 — `product_architecture_post_6c3f6fd.md` référence "6 couches" mais la couche Narration est marquée conditionnelle dans `narrative-engine-status-v1.md`**

Le document architecture liste 6 couches comme actives. Le document NAR précise que la couche 6 (Narration) est conditionnelle — NAR-IN attend V0 terrain.

**Non-contradiction mais nuance** : l'architecture des 6 couches est doctrinalement valide, l'implémentation de la couche 6 est conditionnelle. Ce point mérite une note dans `product_architecture_post_6c3f6fd.md`.

---

**C3 — `how-cameleon-reads-v1.md` existe dans `docs/architecture/` ET les validations sont dans `docs/ux/`**

`docs/architecture/how-cameleon-reads-v1.md` : document de base.
`docs/ux/how-cameleon-reads-screen-spec-v1.md` : spec écran dérivée.
`docs/ux/how-cameleon-reads-ux-validation-v4.md` : validation UX.

Trois documents liés, dans deux dossiers différents, non cross-référencés explicitement. Risque de navigation fragmentée.

---

## 4. Alignement mémoire long terme

### Dépendances vérifiées

```
MEM-V2 (Phase A — Domaine+HTTPS)
  ↓ prérequis de Phase B
MEM-V2 (Phase B — Compte minimum viable)
  ↓ prérequis de
Schéma session enrichi Couche 1
  ↓ prérequis de
Baseline V1
  ↓ prérequis de
Couche Fantôme
  ↓ prérequis de
Couche 3 → Trajectoire → Bibliothèque Vivante
```

**Verdict : dépendances cohérentes.** Aucune contradiction entre les trois documents fondateurs.

### Contradictions : aucune détectée

Les trois documents (`mem-v2`, `baseline-v1`, `couche-fantome`) ont été produits en séquence et se cross-référencent correctement. La `memoire-long-terme-roadmap-alignement.md` formalise la séquence. Cohérence confirmée.

### Prérequis manquants identifiés

**PM-01 — Schéma session enrichi non documenté comme chantier**

Le schéma Couche 1 enrichi (`regime_marche`, `qualite_donnees`, `eligible_baseline`, `baseline_version`) est listé comme Condition 1 dans `baseline-v1-officielle.md §10` et dans `memoire-long-terme-roadmap-alignement.md §3`. Mais il n'existe pas de document de chantier pour ce schéma. C'est un prérequis bloquant sans livrable explicite.

**Recommandation :** créer un document `schema-session-enrichi-v1.md` lors de l'ouverture de ce chantier.

---

**PM-02 — Politique RGPD détaillée manquante**

`mem-v2-compte-memoire-persistante.md §10` différère le traitement RGPD vers `project_legal_v1.md`. Ce fichier existe dans la mémoire projet mais son contenu couvre uniquement le socle bêta (disclaimer, notice). La politique de rétention et le pipeline de suppression pour MEM-V2 Phase B ne sont pas encore documentés.

**Recommandation :** condition à satisfaire avant ouverture Phase B.

---

**PM-03 — Mode pré-Baseline comme expérience produit : non conçu**

`baseline-v1-officielle.md §10 Condition 4` et `memoire-long-terme-roadmap-alignement.md §6` exigent que le mode pré-Baseline soit une expérience produit explicite, pas un état vide. Aucun document de conception UX de ce mode n'existe.

**Recommandation :** à concevoir avant l'implémentation de Baseline V1.

---

### Cohérence de la règle du double ancrage

Documentée dans `baseline-v1-officielle.md §5`. Présente dans `memoire-long-terme-roadmap-alignement.md §3`. Non encore présente dans `product_architecture_post_6c3f6fd.md` (qui définit les 6 couches). 

**Légère lacune :** l'architecture produit officielle devrait référencer cette contrainte.

---

## 5. Audit Roadmap

### Chantiers réellement autorisés maintenant

Ces chantiers ont leurs prérequis satisfaits au 2026-06-10.

| Chantier | Prérequis | Référence |
|---|---|---|
| **Domaine + DNS + HTTPS** | Aucun — décision D1 tranchée (`dec-foundations-01.md`) | MEM-V2 Phase A |
| **Collecte bêta — sélection opérateurs** | Protocole bêta clôturé | `protocole-beta-v1.md` · `plan-10-premiers-utilisateurs.md` |
| **Documentation manquante** (mode pré-Baseline, RGPD détaillé) | Aucun | PM-01, PM-02, PM-03 |
| **Audit Notion** (synchroniser triade mémoire) | Aucun | §6 ci-dessous |
| **Audit cohérence this document** (corrections doublons A1–C3) | Aucun | §3 ci-dessus |
| **Préparation UX mode pré-Baseline** | User journey V1 stabilisé | PM-03 |
| **Resync mémoire projet** (vérifier entrées MEMORY.md vs état réel) | Aucun | Ce document |

### Chantiers interdits actuellement

| Chantier | Condition bloquante | Référence |
|---|---|---|
| **Coder Baseline V1** | Schéma session Couche 1 non enrichi, compte non déployé | `baseline-v1-officielle.md §10` |
| **Coder Couche Fantôme** | Baseline V1 non opérationnelle | `couche-fantome-snapshots-v1.md §11` |
| **Coder Couche 3 Patterns** | Couche Fantôme non déployée | `memoire-long-terme-roadmap-alignement.md §3` |
| **Coder Bibliothèque Vivante** | Compte + opt-in + N≥10 opérateurs manquants | `mem-v2-compte-memoire-persistante.md §7` |
| **Déployer MEM-V2 Phase B** | Domaine + HTTPS manquants | `mem-v2-compte-memoire-persistante.md §8` |
| **Activer V2 Phase 3** | Seuils non calibrés terrain — attend V0 | `checklist-implementation-phase-3.md` |
| **Activer NAR-IN** | V0 ≥10 opérateurs non atteint | `nar-cluster-point-arret-2026-06-05.md` |
| **BMSM implémentation** | Attend signal terrain (Priorité B) | `binance-multi-source-memory.md` |
| **Calibration Personnelle Binance** | Attend ≥5 exports terrain | `calibration-personnelle-binance-v1.md` |
| **Portefeuille V2** | Attend signal terrain (portefeuille V1 clôturé) | `portfolio-v1-impl.md` |
| **FDM-01** | 2 conditions de réouverture non satisfaites | `fdm-01-flux-directionnel-marche.md` |
| **Constellium activation** | Dormant — attend mise en ligne + signal terrain | `dec-foundations-01.md D3` |
| **Tout nouveau système / couche** | Doctrine produit — stabiliser avant étendre | `roadmap-realignment-post-constellium.md` |

---

## 6. Audit Notion

*Note : Notion n'est pas accessible directement via les outils disponibles. Cet audit est basé sur les références présentes dans la mémoire projet (`MEMORY.md`) et les commits git.*

### Documents existant dans le repo mais probablement absents de Notion

Ces documents ont été créés récemment et n'ont pas de trace de synchronisation Notion dans la mémoire projet :

| Document | Date création | Statut Notion |
|---|---|---|
| `mem-v2-compte-memoire-persistante.md` | 2026-06-09 (commit `e639091`) | **Probablement absent** |
| `baseline-v1-officielle.md` | 2026-06-10 (commit `86fea33`) | **Probablement absent** |
| `couche-fantome-snapshots-v1.md` | 2026-06-10 (commit `74d7a9e`) | **Probablement absent** |
| `memoire-long-terme-roadmap-alignement.md` | 2026-06-10 (commit `0c0a92e`) | **Probablement absent** |
| `architecture-donnees-utilisateur.md` (ADU-06 final) | 2026-06-07 | **Incertain** |
| `dec-foundations-01.md` | 2026-06-08 | **Incertain** |
| `modele-mental-canonique.md` | 2026-06-07 | **Incertain** |
| `user-journey-v1.md` | 2026-06-09 | **Probablement absent** |

### Documents existant dans Notion mais dont le statut repo a évolué

Basé sur la mémoire projet (`project_notion_architecture.md`) : les pages Notion de référence incluent Fiches pédagogiques, Lots 5A/5B, Motion System, Moteur Narratif, MOTION_DEBT_REGISTER.

| Sujet Notion | Évolution repo récente | Désynchronisation probable |
|---|---|---|
| Moteur Narratif | NAR-C1 soldé, cluster fermé | Possible — état NAR-IN conditionnel à refléter |
| Constellium | Archivé (`1f9ede7`) | Possible — statut Archivé à refléter |
| Roadmap | Réalignement post-Constellium 2026-05-25 | Probable — version Notion potentiellement antérieure |
| Macro | Doctrine V1 figée (`74611b4`) | Possible |

### Action recommandée pour l'audit Notion

Vérifier manuellement dans Notion les 8 documents ci-dessus (triade mémoire + user journey + foundations). Créer les pages manquantes avec référence au commit. Mettre à jour les pages désynchronisées (Narratif, Constellium, Macro, Roadmap).

---

## 7. Actions recommandées

Ces actions sont classées par ordre de priorité. Aucune n'implique de code.

### Priorité 1 — Clarifications documentaires immédiates (sans création de fichier)

**ACT-01 — Marquer les snapshots historiques**
Ajouter une ligne de statut en tête de `orientation-roadmap-cameleon-engine-v1.md` et `point-arret-2026-05-29.md` : "Snapshot historique — remplacé par [document actif]".

**ACT-02 — Annoter `calibration-personnelle-binance-v1.md`**
Ajouter une note explicite : "Calibration Binance ≠ Baseline V1. Voir distinction §3 de `baseline-v1-officielle.md`."

**ACT-03 — Cross-référencer les docs "How Caméléon Reads"**
Ajouter en tête de chacun des 3 fichiers (`architecture/`, `ux/screen-spec`, `ux/validation`) une référence aux deux autres.

**ACT-04 — Note couche 6 Narration dans architecture produit officielle**
Dans `product_architecture_post_6c3f6fd.md`, ajouter une note : "Couche 6 Narration — implémentation conditionnelle. Voir `narrative-engine-status-v1.md`."

### Priorité 2 — Documents manquants à créer lors de l'ouverture des chantiers concernés

**ACT-05 — `schema-session-enrichi-v1.md`**
À créer avant le chantier Baseline V1. Documenter les 4 champs Couche 1 requis (`regime_marche`, `qualite_donnees`, `eligible_baseline`, `baseline_version`), leur type, leur valeur par défaut, et le contrat de rétrocompatibilité.

**ACT-06 — Politique RGPD MEM-V2**
À créer avant MEM-V2 Phase B. Documenter : durée de rétention, pipeline de suppression, export données, protocole consentement Bibliothèque Vivante.

**ACT-07 — Conception UX mode pré-Baseline**
À créer avant l'implémentation Baseline V1. Documenter : ce que voit l'opérateur avant ses 20 sessions qualifiées, comment l'absence est présentée comme intentionnelle.

### Priorité 3 — Synchronisation Notion

**ACT-08 — Créer dans Notion les 4 documents fondateurs mémoire**
MEM-V2 · Baseline V1 · Couche Fantôme · Roadmap Alignement mémoire.

**ACT-09 — Mettre à jour les pages Notion désynchronisées**
Moteur Narratif (état conditionnel), Constellium (archivé), Roadmap (réalignement mai 2026), Macro (doctrine V1 figée).

### Priorité 4 — Prochaine étape opérationnelle

**ACT-10 — Domaine + HTTPS**
Seul chantier de développement réellement autorisé. Condition d'entrée de MEM-V2 Phase A. Aucune autre implémentation ne peut précéder cela.

---

## 8. État de cohérence global

### Réponse à la question finale

> Quel est aujourd'hui l'état réel de cohérence de Caméléon Engine, quelles sont les zones désynchronisées, et quel est le prochain chantier légitime une fois cette resynchronisation terminée ?

---

**État de cohérence : bon sur le fond, fragile sur la navigation.**

Le projet possède une architecture doctrinale cohérente et mature. Les couches fondamentales sont non contradictoires. Les décisions clés sont figées et respectées. La séquence d'implémentation est claire.

La fragilité est dans la navigation documentaire : trop de documents sans statut explicite, quelques doublons non marqués, et une synchronisation Notion à jour sur les anciens chantiers mais probablement absente sur les chantiers récents.

---

**Zones désynchronisées (par ordre de risque) :**

1. **Notion vs repo** — triade mémoire (MEM-V2, Baseline, CF) non encore dans Notion
2. **Roadmap historique** — deux documents anciens non marqués comme snapshots
3. **Calibration Binance ↔ Baseline** — confusion terminologique latente
4. **Prérequis mémoire non documentés** — mode pré-Baseline et RGPD MEM-V2 n'ont pas de document dédié
5. **How Caméléon Reads** — 3 documents liés sans cross-références

Aucune contradiction architecturale. Aucune incohérence logique. Uniquement des lacunes de balisage.

---

**Prochain chantier légitime :**

> **Domaine + HTTPS.**

C'est la seule porte d'entrée réelle vers l'ensemble de la roadmap. Tout ce qui suit — compte, bêta, mémoire serveur, Baseline, Couche Fantôme — commence par là.

Avant d'ouvrir ce chantier, les actions ACT-01 à ACT-09 de ce document constituent le travail de resynchronisation documentaire recommandé. Il s'agit d'un travail de quelques heures, pas de quelques jours.

---

*Référence : `memoire-long-terme-roadmap-alignement.md` · `roadmap-realignment-post-constellium.md` · `dec-foundations-01.md`*
