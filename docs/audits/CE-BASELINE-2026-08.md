# CE-BASELINE-2026-08
## Caméléon Engine — Engineering & Knowledge Baseline · August 2026

---

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | CE-BASELINE-2026-08 |
| Nom officiel | Caméléon Engine — Engineering & Knowledge Baseline · August 2026 |
| Statut | **VALIDÉE** |
| Protocole d'exécution | V2.1 |
| DATE_DE_L_ETAT_OBSERVE | 2026-08-16 |
| DATE_D_EXECUTION | 2026-08-17 |
| Commit de référence | `be2c14c5354564cf4a17ef7030c3d04c049fc15b` |
| Décision de validation | D-OP-05 — prononcée par l'opérateur |
| Intégrité de photographie | CONFIRMÉE — 0 mutation introduite pendant l'exécution |

---

## §1 — Décision de validation (D-OP-05)

**D-OP-05 — VALIDATION CANONIQUE DE CE-BASELINE-2026-08**

La restitution amendée de CE-BASELINE-2026-08 est reconnue comme photographie canonique de l'état de Caméléon Engine observé au 2026-08-16, au commit `be2c14c5354564cf4a17ef7030c3d04c049fc15b`.

Cette validation porte sur la restitution amendée intégrant RES-01→RES-14, D-OP-04 (Notion), les reclassifications [F]/[I]/[H]/[ND], les métriques corrigées et les réserves résiduelles.

---

## §2 — Principe d'immuabilité

Cette baseline représente définitivement CE QUE CAMÉLÉON ENGINE ÉTAIT À CET INSTANT.

Elle ne doit jamais être réécrite pour refléter un état postérieur. Si une anomalie observée dans cette baseline est corrigée ultérieurement, la correction est enregistrée comme évolution postérieure — jamais comme réécriture rétroactive de ce document.

La traçabilité de la revue contradictoire (RES-01→RES-14) fait partie de la valeur historique de cette baseline. La première restitution contenait des erreurs qui ont été corrigées par la revue — ce fait est préservé.

---

## §3 — Décisions opérateur (D-OP-01→D-OP-05)

| D-OP | Décision | Exécution |
|---|---|---|
| D-OP-01 | `admin/` et `prototype/` séparés de CODE_APP | EXÉCUTÉE |
| D-OP-02 | Nom officiel : "Caméléon Engine — Engineering & Knowledge Baseline · August 2026" | EXÉCUTÉE |
| D-OP-03 | Phase 10B (exécution runtime des tests) = HORS SCOPE | EXÉCUTÉE |
| D-OP-04 | Notion = consultation autorisée et demandée en lecture seule | EXÉCUTÉE — 2026-08-17 |
| D-OP-05 | Validation canonique de CE-BASELINE-2026-08 | PRONONCÉE — 2026-08-17 |

---

## §4 — État Git

### §4.1 — Synchronisation

| Dimension | Valeur |
|---|---|
| HEAD | `be2c14c5354564cf4a17ef7030c3d04c049fc15b` |
| origin/main | `be2c14c5354564cf4a17ef7030c3d04c049fc15b` |
| Synchronisation | OUI — 0 ahead / 0 behind |
| Working tree | NON CLEAN au moment de la baseline |

### §4.2 — Working tree au moment de la baseline

| Nature | Élément |
|---|---|
| [F] Modifié | `.claude/settings.local.json` |
| [F] Non suivi | `assets/excel_tests/b1-b19/` |
| [F] Non suivi | `assets/excel_tests/tc5-ep-rc2/` |
| [F] Non suivi | `assets/images/CONSTELLIUM_VISUALS_Images/` |
| [F] Non suivi | `assets/images/images_supprimees/` |
| [F] Non suivi | `assets/video/CONSTELLIUM_VISUALS_Video/` |
| [F] Non suivi | `docs/architecture/oi_v1_execution_architecture.md` |

### §4.3 — Historique

| Métrique | Valeur |
|---|---|
| Commits sur main | 811 |
| Commits toutes refs | 950 |
| Premier commit | `0ce60db` · 2026-04-05 05:12:29 |
| Dernier commit | `be2c14c` · 2026-08-16 20:05:29 |
| Fenêtre Git observable | ~134 jours |

[ND] Phase antérieure à 2026-04-05 non traçable depuis Git seul.

### §4.4 — Distribution mensuelle (main)

| Mois | Commits |
|---|---|
| Avril 2026 | 109 |
| Mai 2026 | 253 |
| Juin 2026 | 315 |
| Juillet 2026 | 78 |
| Août 2026 | 56 (au 16/08) |

### §4.5 — Branches

| Branche | Nature |
|---|---|
| `main` | Branche principale — active |
| `feature/allowed-engine` | État inconnu — voir RES-R02 |
| `ui-polish-final` | État inconnu — voir RES-R02 |
| `gh-pages` | Remote — déploiement GitHub Pages |

---

## §5 — Métriques code

### §5.1 — CODE_APP (`src/js/` hors `vendor/`)

| Métrique | Valeur |
|---|---|
| ENG-001 — Fichiers JS | 82 |
| ENG-002 — Lignes JS | 23 134 |
| ENG-003 — Lignes CSS | 10 606 |
| ENG-004 — Lignes HTML app | 1 550 |

Inclut : moteur principal · account/ · behavior/ · behavior/analytics · canonical/ · ingestion/ · v2/.

### §5.2 — CODE_ADMIN (`admin/`)

| Métrique | Valeur |
|---|---|
| ENG-A01 — Fichiers | 2 |
| ENG-A02 — Lignes | 625 |
| Détail | `admin/admin.js` (207L) + `admin/index.html` (418L) |

Note : `src/constellium.html` (207L) ne fait pas partie de `admin/`. Sa classification de périmètre est NON DÉTERMINÉE — voir RES-R01.

### §5.3 — CODE_PROTOTYPE (`prototype/`)

| Métrique | Valeur |
|---|---|
| ENG-P01 — Fichiers | 15 |
| ENG-P02 — Lignes | 6 134 |
| Contenu | 15 fichiers HTML (lab-silence / how-cameleon-reads / reconstruction) |

### §5.4 — Tests automatisés

| Métrique | Valeur |
|---|---|
| ENG-005 — Fichiers test | 5 (HTML runners dans `src/tests/`) |
| ENG-006 — Lignes test | 1 956 |

### §5.5 — Données structurées

| Métrique | Valeur | Source |
|---|---|---|
| ENG-008 — SQL | 332 lignes | `supabase/migrations/001_core_schema.sql` (159L) + `002_rgpd_schema.sql` (173L) |
| ENG-009 — TODOs | 1 | `src/js/v2/calibration.js:15` — Phase 6 CalibrationSnapshot |

### §5.6 — Dépendances vendor (~2,9 MB)

| Bibliothèque | Usage |
|---|---|
| `pdf.min.mjs` + `pdf.worker.min.mjs` | PDF.js 4.10.38 |
| `supabase.esm.js` | Authentification cloud |
| `xlsx.full.min.js` | Import Excel/CSV |

---

## §6 — Pipeline V2

| Flag | Valeur | Statut |
|---|---|---|
| V2_ENABLED | `true` | Actif |
| V2_COHERENCE | `true` | Phase 1 shadow mode |
| V2_HIERARCHY | `true` | Phase 2 shadow mode |
| V2_ATTENTION | `true` | Phase 3 shadow mode |
| V2_EXPOSITION | `true` | Phase 4 shadow mode |
| V2_COCKPIT_MESSAGE | `true` | Phase 5 — exposé utilisateur |
| V2_CALIBRATION | `false` | Phase 6 — non implémenté (TODO ouvert) |

---

## §7 — Métriques documentaires

| Métrique | Valeur |
|---|---|
| DOC-001 — Fichiers MD totaux | 352 |
| DOC-002 — Fichiers MD dans docs/ | 294 |
| DOC-003 — LOT files | 30 |
| DOC-004 — Fichiers doctrine | 8 |
| DOC-005 — Lignes docs/ | 87 213 |
| DOC-006 — Entrées M1 (project_memory/) | 35 |
| DOC-007 — Sous-répertoires docs/ | 17 |
| DOC-009 — Lignes totales MD | 97 792 |

---

## §8 — Avancement programmes / LOTs

### §8.1 — Programme P1 — GELÉ (2026-07-09)

| LOT | Statut |
|---|---|
| LOT-P1 — Diagnostic mémoriel V1 | CLOS |
| LOT-P1-2 — Persistance canonique V1 | CLOS |
| LOT-P1-2.1 — Modèle canonique de trace V1 | CLOS |
| LOT-P1-2.2 — Couche de persistance structurée V1 | CLOS |
| LOT-P1-2.3 — Indexation V1 | CLOS |
| LOT-P1-2.4 — Doctrine de provenance V1 | CLOS |
| LOT-P1-3 — Mémoire Opérateur V1 | CLOS |
| LOT-P1-3.1 à LOT-P1-3.5 | CLOS |

### §8.2 — Programme P2 — EN COURS (6/7 livrables CLOS)

| LOT | Statut | Commit clôture |
|---|---|---|
| LOT-P2-1 — Doctrine d'ingestion V1 | CLOS | c5fc6e3 |
| LOT-P2-2 — Parser S1 V1 | CLOS | 431de03 |
| LOT-P2-3 — Schéma S2 V1 | CLOS | 1a0c194 |
| LOT-P2-4 — Schéma S5 V1 | CLOS (header repo : VALIDÉ — incohérence documentaire) | 6e49b3e |
| LOT-P2-5 — Schéma S4 V1 | CLOS | 4856372 |
| LOT-P2-6 — Schéma S3 V1 | CLOS | 2702a15 |
| LOT-P2-7 — Normalisation inter-familles V1 | CLOS | 630e7a8 |
| **LOT-P2-8 — Doctrine des Corrélations** | **NON OUVERT / EN ATTENTE** | — |

### §8.3 — Programmes P3→P8

NON OUVERTS — conditionnels à P2 GELÉ (⏳) et/ou P1 GELÉ (✅).

| Programme | Condition bloquante |
|---|---|
| P3 | P2 gelé (clôture S3/S4 requiert P2 gelé) |
| P4 | P2 avancé |
| P5 | P1 gelé ✅ · OI V1 stable ✅ |
| P6 | P2 gelé |
| P7 | P1 gelé ✅ |
| P8 | P6 + P7 clos |

### §8.4 — Phase A (Roadmap V1)

| Programme | Livrables | Clos |
|---|---|---|
| P1 | 4 | 4 (GELÉ) |
| P2 | 7 | 6 (L7 NON OUVERT) |
| **Phase A totale** | **11** | **10** |

---

## §9 — Roadmap V1

**Cohérence de séquence :** CONFIRMÉE — aucune violation du DAG P1→P2→…

**Couverture de la réalité projet :** PARTIELLE — éléments réels hors périmètre Roadmap V1 (non des violations) :

| Élément | Présence Roadmap V1 |
|---|---|
| Compte Utilisateur V1 | ABSENT |
| Hardening H01/H02 | ABSENT |
| Constellium V1 (gelé) | ABSENT |
| PDF Import V1 | ABSENT |
| Pipeline V2 | ABSENT |
| Constitution Opérationnelle V1 | ABSENT |
| Constitution Intellectuelle V1 | ABSENT |

Aucune dérive détectée. La Roadmap V1 est un document de séquencement structurel (P1→P8), non un inventaire exhaustif du projet.

---

## §10 — Tests

### §10.1 — Tests automatisés (`src/tests/`)

| Fichier | Composant |
|---|---|
| canonical-store.test.html | canonical-store |
| ingestion-registry.test.html | ingestion-registry |
| binance-s1-adapter.test.html | S1 adapter Binance |
| ingestion-core.test.html | ingestion-core |
| pdf-import-v1.test.html | PDF import |

### §10.2 — Validations terrain documentées

| LOT | Résultat |
|---|---|
| LOT-P1-3.4 | 7/7 PASS |
| LOT-P1-3.5 | 9/9 PASS |
| LOT-P2-2.F | 12/12 PASS |
| CVP CV-1→CV-9 | PASS dans chaque LOT clos |

### §10.3 — Couverture par composant

| Composant | Test auto | Validation terrain | Couverture |
|---|---|---|---|
| Ingestion S1 | OUI | OUI (P2-2.F) | DÉTERMINÉE |
| Couche canonique P1 | AUCUN DÉTECTÉ | OUI (P1-2 phases) | PARTIELLEMENT DÉTERMINÉE |
| Engine V1 | AUCUN DÉTECTÉ | CVP par LOT (manuel) | PARTIELLEMENT DÉTERMINÉE |
| Pipeline V2 | AUCUN DÉTECTÉ | AUCUNE TERRAIN DÉTECTÉE | NON DÉTERMINÉE — voir RES-R03 |
| Comportemental | AUCUN DÉTECTÉ | AUCUNE TERRAIN DÉTECTÉE | NON DÉTERMINÉE — voir RES-R03 |
| OI V1 | AUCUN DÉTECTÉ | [LOCAL] hors repo | NON DÉTERMINÉE depuis REPO |

---

## §11 — Bornes et indéterminations ouvertes (corpus P2)

### §11.1 — Bornes enregistrées

| Borne | LOT | Objet | Périmètre résolution |
|---|---|---|---|
| BORNE-S3-1 | LOT-P2-6 | Dérivation secondaire S3 | LOT d'activation S3 |
| BORNE-S3-2 | LOT-P2-6 | Critère identité supports visuels | LOT d'activation S3 |
| BORNE-S3-3 | LOT-P2-6 | Nature/structure/format `valeur` S3 (6 dimensions) | LOT d'activation S3 |
| BORNE-S4-1 | LOT-P2-5 | Authorship copy-paste externe | LOT d'activation S4 |
| BORNE-S4-2 | LOT-P2-5 | Frontière contributions distinctes (saisie continue) | LOT d'activation S4 |

### §11.2 — Indéterminations résiduelles

| Indétermination | Périmètre |
|---|---|
| Sémantique exacte date S3 | LOT d'activation S3 — EP-S3 |
| Applicabilité R1/R3/R4 à S3 | LOT d'activation S3 |
| Applicabilité R1/R3/R4 à S5 | LOT d'activation S5 |
| Normalisation R4 (epoch ms → ISO 8601 UTC) | Programme P3+ |
| `date_phenomene` comme règle S4 | LOT d'activation S4 |
| D2c — cas zéro contenu S3 | LOT d'activation S3 |
| I-01 — conflit GPT Vision vs local-first | Doctrine Mémoire Visuelle · GPD V1 §8.4 |

---

## §12 — Registre des anomalies (version finale)

| Ref | Observation | Classification finale |
|---|---|---|
| ANO-F-01 | LOT-P2-4 header = VALIDÉ · contenu + Notion = CLOS | INCOHÉRENCE DOCUMENTAIRE |
| ANO-F-02 | LOT-P2-2.A→.F = EN COURS · parent CLOS | DETTE DOCUMENTAIRE |
| ANO-D-01 | canonical/ + ingestion/ absents de ovh-deploy | SIGNAL ARCHITECTURAL [I/ND] |
| ANO-D-02 | index.html production ≠ src/index.html | SIGNAL ARCHITECTURAL [I/ND] |
| ANO-B-01 | Branches feature/allowed-engine · ui-polish-final | RISQUE NON DÉTERMINÉ |
| ANO-G-01 | Pas d'historique Git avant 2026-04-05 | FAUX POSITIF ÉCARTÉ |
| ANO-T-01 | Tests automatisés uniquement pour ingestion S1 | DETTE TECHNIQUE PARTIELLE |
| ANO-V-01 | V2 Phase 6 TODO ouvert | FAUX POSITIF ÉCARTÉ |

---

## §13 — Déploiement (src/ ↔ ovh-deploy/)

Le workflow `.github/workflows/deploy.yml` synchronise : `src/js/*` · `src/css/*` · `src/index.html` uniquement.

| Composant | src/ | ovh-deploy/ |
|---|---|---|
| Couche canonique (`canonical/`) | [F] PRÉSENT | [F] ABSENT |
| Pipeline ingestion S1 (`ingestion/`) | [F] PRÉSENT | [F] ABSENT |
| Page Constellium | [F] PRÉSENT | [F] ABSENT |
| Styles Constellium | [F] PRÉSENT | [F] ABSENT |

[I] L'absence peut correspondre à une stratégie de déploiement progressif.
[ND] L'intention architecturale exacte n'est pas établie par les sources actuellement identifiées.

---

## §14 — Vérification Notion (D-OP-04)

**Consultation :** Page "🦎 Caméléon Engine" — fetchée 2026-08-16T17:53:41Z · lecture seule

| Élément | Statut Notion | Concordance |
|---|---|---|
| Programme P1 | GELÉ 2026-07-09 | CONFIRMÉ |
| LOT-P1 / P1-2 / P1-3 | CLOS | CONFIRMÉ |
| LOT-P2-1 → P2-3 | CLOS | CONFIRMÉ |
| LOT-P2-4 | CLOS (commit 6e49b3e) | DIVERGENT — header repo = VALIDÉ (renforce ANO-F-01) |
| LOT-P2-5 / P2-6 / P2-7 | CLOS | CONFIRMÉ |
| LOT-P2-8 | NON OUVERT | CONFIRMÉ |
| Roadmap V1 | GELÉE f83bb0c | CONFIRMÉ |

Stale Notion : champ "Dernier commit" = `87ba299` (2026-07-06) — limite connue du workflow de synchronisation.

**Conclusion D-OP-04 :** Notion confirme la photographie. Aucune nouvelle divergence introduite.

---

## §15 — Reproductibilité

**Reproductible depuis :** `git checkout be2c14c`

| Dimension | Reproductibilité |
|---|---|
| Métriques REPO | COMPLÈTE |
| M2 (mémoire auto-Claude) | NON — [LOCAL] hors repo |
| Notion | NON — [NOTION] source externe |
| Runtime | NON — non capturé |

---

## §16 — Réserves résiduelles non bloquantes

| ID | Description | Nature |
|---|---|---|
| RES-R01 | `src/constellium.html` (207L) — classification de périmètre hors D-OP-01 | [ND] |
| RES-R02 | Branches `feature/allowed-engine` · `ui-polish-final` — état inconnu | RISQUE NON DÉTERMINÉ |
| RES-R03 | Couverture tests Pipeline V2 / comportemental / OI — non déterminée depuis repo | COUVERTURE NON DÉTERMINÉE |

Ces réserves ne bloquent pas la validation. Elles peuvent être réévaluées dans une baseline postérieure.

---

## §17 — Traçabilité de la revue contradictoire

La restitution initiale contenait 14 réserves (RES-01→RES-14) dont 4 de blocage :

| RES | Nature | Correction |
|---|---|---|
| RES-01 | DATE_D_EXECUTION = 2026-08-16 (faux) | Corrigé : 2026-08-17 |
| RES-02 | Table D-OP décalée | Corrigé : table reconstruite |
| RES-03 | Notion non consulté | Résolu : D-OP-04 exécuté |
| RES-04 | Description CODE_APP inexacte | Corrigé |
| RES-05 | CODE_ADMIN = src/constellium.html (faux) | Corrigé : admin/ · 2 fichiers · 625L |
| RES-06 | SQL chemin = src/database/schema.sql (inexistant) | Corrigé : supabase/migrations/ |
| RES-07 | docs/ lignes "88 000+" | Corrigé : 87 213 (exact) |
| RES-08 | MD total "~97 792" | Corrigé : 97 792 (exact, sans ~) |
| RES-09 | Déploiement = "décision architecturale implicite" | Reclassifié [F]+[I]+[ND] |
| RES-10 | "Aucun test" — couverture binaire | Corrigé : distinctions par type |
| RES-11 | 85% Phase A non défendable | Corrigé : P1 4/4 · P2 6/7 · Phase A 10/11 |
| RES-12 | Formulations [I]/[H] non marquées | Marquées |
| RES-13 | Roadmap "cohérente" sans nuance couverture | Distingué : séquence ≠ représentativité |
| RES-14 | ANO-G-01 + ANO-V-01 faux positifs | Écartés |

---

## §18 — Point de comparaison futur

Cette baseline constitue le jalon **T0** du projet Caméléon Engine.

Toute baseline future devra comparer ses métriques avec les valeurs canoniques établies ici :

| Métrique T0 | Valeur CE-BASELINE-2026-08 |
|---|---|
| Commits main | 811 |
| Fichiers JS (CODE_APP) | 82 |
| Lignes JS | 23 134 |
| Lignes CSS | 10 606 |
| Fichiers MD totaux | 352 |
| Lignes MD totales | 97 792 |
| LOTs P2 clos | 6/7 |
| Bornes P2 ouvertes | 5 |
| Indéterminations P2 | 7 |
| Runners test auto | 5 |

**Prochaine baseline suggérée :** CE-BASELINE-2027-02 (ou après gel de P2 et ouverture de Phase B).

---

*Document produit à l'issue du Protocole CE-BASELINE V2.1 — revue contradictoire — consultation Notion D-OP-04 — validation opérateur D-OP-05 — Caméléon Engine, 2026-08-17.*
