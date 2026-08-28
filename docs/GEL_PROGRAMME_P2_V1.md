# GEL_PROGRAMME_P2_V1.md
## Acte de Gel Officiel — Programme P2
### Caméléon Engine · Gouvernance documentaire

---

## 1 — Acte de Gel

Le **Programme P2 — Doctrine des Sources & Schémas d'Ingestion** est officiellement gelé.

Il devient le **socle doctrinal figé de l'ingestion canonique de Caméléon Engine** à compter du **2026-08-28**.

Ce gel fait suite à la clôture des 8 LOTs du Programme P2, à la vérification complète de la condition T1 définie par la Roadmap V1, et à la décision explicite de l'opérateur de formaliser cet état par un acte canonique distinct.

---

## 2 — Objet

Le Programme P2 répond à une seule question : **selon quelles règles doctrinales les données des 5 familles sources sont-elles ingérées dans la couche canonique de Caméléon Engine ?**

Il définit :
- la doctrine d'ingestion commune à toutes les familles sources (LOT-P2-1) ;
- le premier parser d'ingestion opérationnel pour la famille S1 (LOT-P2-2) ;
- les schémas canoniques des 5 familles sources : S2 · S5 · S4 · S3 (LOT-P2-3 à LOT-P2-6) ;
- les règles de normalisation inter-familles (LOT-P2-7) ;
- la doctrine des corrélations — définition canonique CE-générale, périmètre L2/Phase A, règles d'assertion (LOT-P2-8).

**Ce que le Programme P2 n'est pas :**
- une implémentation de parsers S2–S5 (hors périmètre Phase A) ;
- un moteur de détection de corrélations (Programme P6) ;
- une doctrine d'activation des familles silencieuses (lots d'activation futurs).

---

## 3 — Condition T1 vérifiée

La Roadmap V1 §5 définit la condition de sortie de la Phase A :

> **T1 — Condition de sortie Phase A :** P1 gelé ET P2 gelé (les 5 schémas sources formalisés + Doctrine des Corrélations intégrée)

Vérification occurrence par occurrence :

| Condition T1 | Vérification | Statut |
|---|---|---|
| P1 gelé | Déclaration opérateur · 2026-07-09 · `29587d0` (LOT-P1-3 closure) | SATISFAIT |
| S1 formalisé | LOT-P2-2 CLOS · `431de03` · 2026-08-09 | SATISFAIT |
| S2 formalisé | LOT-P2-3 CLOS · `1a0c194` · 2026-08-11 | SATISFAIT |
| S3 formalisé | LOT-P2-6 CLOS · `2702a15` · 2026-08-16 | SATISFAIT — BORNEs préservées |
| S4 formalisé | LOT-P2-5 CLOS · `4856372` · 2026-08-16 | SATISFAIT — BORNEs préservées |
| S5 formalisé | LOT-P2-4 · `6e49b3e` · 2026-08-15 | SATISFAIT — voir note §4 |
| Doctrine des Corrélations intégrée | LOT-P2-8 CLOS · `3999410` · 2026-08-28 | SATISFAIT |
| Aucun blocker actif | Toutes dettes déclarées non bloquantes | SATISFAIT |

**Verdict T1 : SATISFAITE.**

---

## 4 — Les 8 LOTs du Programme P2

| LOT | Intitulé | Statut | Commit | Date clôture |
|---|---|---|---|---|
| LOT-P2-1 | Doctrine d'ingestion V1 | CLOS | `c5fc6e3` | 2026-07-09 |
| LOT-P2-2 | Parser S1 · Fichiers transactionnels V1 | CLOS | `431de03` | 2026-08-09 |
| LOT-P2-3 | Schéma canonique S2 · Ontologie patrimoniale V1 | CLOS | `1a0c194` | 2026-08-11 |
| LOT-P2-4 | Schéma canonique S5 · Données contextuelles V1 | CLOS† | `6e49b3e` | 2026-08-15 |
| LOT-P2-5 | Schéma canonique S4 · Famille Personnelle V1 | CLOS | `4856372` | 2026-08-16 |
| LOT-P2-6 | Schéma canonique S3 · Famille Visuelle V1 | CLOS | `2702a15` | 2026-08-16 |
| LOT-P2-7 | Normalisation inter-familles V1 | CLOS | `630e7a8` | 2026-08-16 |
| LOT-P2-8 | Doctrine des Corrélations V1 | CLOS | `3999410` | 2026-08-28 |

**† Note LOT-P2-4 :** le champ `Statut` du header du document `docs/lots/LOT-P2-4_SCHEMA_S5_V1.md` affiche `VALIDÉ` et non `CLOS`. Cette inconsistance est documentaire : le message du commit `6e49b3e` est "P2-4.D — validation documentaire · DQC V2 CAS A · clôture LOT-P2-4", et la mémoire projet enregistre le statut CLOS avec ce même commit. La clôture est démontrée par deux sources convergentes. La correction du header fait l'objet d'une autorisation séparée et ne conditionne pas le présent gel.

---

## 5 — Dettes transportées (non bloquantes)

Ces dettes sont explicitement déclarées dans les LOTs sources. Le gel ne les résout pas. Il ne les efface pas. Elles survivent au gel et doivent être traitées dans les lots ou programmes compétents.

### Dettes issues de LOT-P2-8 — Doctrine des Corrélations

| Dette | Source | Destination | Bloquant |
|---|---|---|---|
| Y-5B résiduel (classe changements sans accept/refus/confirmer) | LOT-P2-8 §2.3 | P6 | Non |
| Y-6C (rapport lien/relation dans I-07) | LOT-P2-8 §2.3 | Lot compétent | Non |
| Y-7B (corrélations intra-famille — existence doctrinale) | LOT-P2-8 §2.3 | Lot compétent | Non |
| R-C-01→R-C-13 / Architecture C / D1-D5 | LOT-P2-8 §10.7 | P6 | Non |
| KG-06 L2 exact (dépend méthode réelle de production) | LOT-P2-8 | P6 | Non |

### Dettes issues de LOT-P2-6 — Schéma S3

| Dette | Source | Destination | Bloquant |
|---|---|---|---|
| BORNE-S3-1 — Dérivation secondaire | LOT-P2-6 §5.6 | Lot d'activation S3 | Non |
| BORNE-S3-2 — Supports visuels multiples ou identiques | LOT-P2-6 §5.7 | Lot d'activation S3 | Non |
| BORNE-S3-3 — Nature, structure et format du champ `valeur` S3 | LOT-P2-6 §5.8 · LOT-P2-7 §2.3 | Lot d'activation S3 | Non |

### Dettes issues de LOT-P2-5 — Schéma S4

| Dette | Source | Destination | Bloquant |
|---|---|---|---|
| BORNE-S4-1 — Authorship du copy-paste externe | LOT-P2-5 §5.5 | Lot d'activation S4 | Non |
| BORNE-S4-2 — Frontière opérationnelle entre contributions distinctes | LOT-P2-5 §5.6 | Lot d'activation S4 | Non |

**Règle transversale :** aucune de ces dettes ne doit être reconstruite par inférence. Chaque dette sera traitée uniquement dans le lot ou programme désigné, avec une décision opérateur explicite.

---

## 6 — Effets du gel

### Ce que le gel de P2 déverrouille

| Programme | Prérequis Roadmap V1 | Impact du gel P2 |
|---|---|---|
| P3 — Moteur d'Ingestion Pipeline | P1 gelé · P2 gelé pour clôture S3/S4 | Clôture parsers S3 et S4 désormais débloquée |
| P4 — Moteur Décisionnel & Snapshots | P1 gelé · P2 avancé | Ouverture débloquée |
| P5 — Operator Intelligence V2 | P1 gelé · OI V1 stable | Déjà débloqué — gel P2 sans effet additionnel |
| P6 — Moteur de Corrélation | P1 gelé · **P2 gelé** · P3 avancé | P2 gelé satisfait — P3 avancé reste requis |
| P7 — Moteur Comportemental V2 | P1 gelé · comportemental V1 stable | Déjà débloqué — gel P2 sans effet additionnel |
| P8 — Moteur de Synthèse | P1 gelé · P2 gelé · plusieurs prérequis avancés | P2 gelé satisfait — autres prérequis restent requis |

### Condition T1 — Phase A → Phase B

La satisfaction de T1 (P1 gelé ET P2 gelé) constitue la condition de sortie de la Phase A de la Roadmap V1. Les programmes de Phase B peuvent être ouverts selon leurs prérequis individuels définis dans la Roadmap V1.

---

## 7 — Ce que le gel ne signifie pas

- **La Phase B n'est pas ouverte automatiquement.** Chaque programme requiert une décision opérateur distincte, conformément aux prérequis individuels définis dans la Roadmap V1.
- **Les BORNEs S3 et S4 ne sont pas résolues.** BORNE-S3-1 · S3-2 · S3-3 · BORNE-S4-1 · S4-2 survivent au gel et seront traitées dans les lots d'activation respectifs.
- **Les déférés de LOT-P2-8 ne sont pas résolus.** Y-5B · Y-6C · Y-7B · R-C-01→R-C-13 · KG-06 L2 survivent au gel.
- **Aucun LOT existant n'est modifié.** Le gel est un acte de constat, pas de révision.
- **Le header de LOT-P2-4 n'est pas corrigé par ce gel.** L'inconsistance `VALIDÉ` vs clôture démontrée est documentée au §4 — sa correction fait l'objet d'une autorisation séparée.
- **Aucune doctrine n'est réinterprétée.** DÉCISION-01 · OPTION I · les invariants KG V1 · la doctrine d'ingestion V1 restent inchangés.

---

## 8 — Références

| Document | Rôle |
|---|---|
| `docs/ROADMAP_V1.md` | Condition T1 · §4.P2 livrables · §5 phases |
| `docs/GEL_ROADMAP_V1.md` | Gel officiel Roadmap V1 · gouvernance |
| `docs/lots/LOT-P2-1_INGESTION_DOCTRINE_V1.md` | Doctrine d'ingestion V1 · `c5fc6e3` |
| `docs/lots/LOT-P2-8_DOCTRINE_DES_CORRELATIONS_V1.md` | Doctrine des Corrélations V1 · `3999410` |
| `docs/doctrine/CAMELEON_KNOWLEDGE_GOVERNANCE_V1.md` | KG V1 · `db91787` |

---

## 9 — Décision Officielle

Le Programme P2 — Doctrine des Sources & Schémas d'Ingestion est officiellement gelé à compter du **2026-08-28**.

La condition T1 de la Roadmap V1 (P1 gelé ET P2 gelé) est formellement satisfaite.

---

*Acte de gel produit à l'issue de la clôture des 8 LOTs du Programme P2 · vérification T1 complète · décision opérateur explicite · Caméléon Engine, 2026-08-28.*
