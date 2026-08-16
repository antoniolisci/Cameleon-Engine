# LOT-P2-7 — Normalisation inter-familles · V1

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-7 |
| Intitulé | Normalisation inter-familles · V1 |
| Programme | P2 — Doctrine des Sources & Schémas d'Ingestion |
| Phase Roadmap V1 | A |
| Type | Doctrine — Règles de normalisation |
| Statut | EN COURS |
| Date d'ouverture | 2026-08-16 |
| Date de clôture | — |
| Prérequis | LOT-P2-1 CLOS · LOT-P2-6 CLOS |

---

## §1 — Mission

LOT-P2-7 définit les règles de normalisation inter-familles des données des familles S1→S5 du corpus Caméléon Engine. Ce lot constitue le sixième livrable du Programme P2, défini par la Roadmap V1 (P2 livrable 6 : « Règles de normalisation inter-familles ») et délimité par LOT-P2-1 §3.2 (exclusion : « Normalisation des formats de données — périmètre LOT-P2-7 »). Doctrine pure — aucun code, aucune implémentation.

---

## §2 — Contexte & Prérequis

### §2.1 — Prérequis formels

| Prérequis | Statut |
|---|---|
| LOT-P2-1 — Doctrine d'ingestion V1 | CLOS · c5fc6e3 · 2026-07-09 |
| LOT-P2-2 — Parser S1 V1 | CLOS · 431de03 · 2026-08-09 |
| LOT-P2-3 — Schéma S2 V1 | CLOS · 1a0c194 · 2026-08-11 |
| LOT-P2-4 — Schéma S5 V1 | CLOS · 6e49b3e · 2026-08-15 |
| LOT-P2-5 — Schéma S4 V1 | CLOS · 4856372 · 2026-08-16 |
| LOT-P2-6 — Schéma S3 V1 | CLOS · 2702a15 · 2026-08-16 |

### §2.2 — Contexte architectural

Les cinq familles de données S1→S5 ont été définies dans les LOT-P2-2 à LOT-P2-6. Chaque famille dispose désormais d'un schéma canonique indépendant. LOT-P2-7 intervient à ce moment précis pour définir les règles de normalisation qui s'appliquent entre ces familles, conformément à la Roadmap V1.

Le Grand Plan Directeur V1 (§13.4) identifie un « modèle de données unifié cross-familles » comme terrain nécessaire pour les composants Timeline, Corrélateur et Assistant Mémoire. Ce constat constitue le contexte architectural motivant de LOT-P2-7. Il ne constitue pas un mandat imposant un modèle unifié de forme déterminée — la sémantique et la forme des règles de normalisation restent à définir par ce lot.

Le Grand Plan Directeur V1 (§9.3) cite les dates comme exemple concret d'hétérogénéité inter-familles pouvant appeler une normalisation.

### §2.3 — Bornes ouvertes héritées

Les lots amont ont documenté des indéterminations qui affectent directement le périmètre de LOT-P2-7. Ces bornes ne sont pas fermées dans ce lot.

| Borne | Origine | Nature |
|---|---|---|
| BORNE-S3-3 | LOT-P2-6 §5.8 | Nature, structure et format du champ `valeur` S3 — NON DÉTERMINÉ |
| BORNE-S4-1 | LOT-P2-5 §5.4 | Authorship du copy-paste externe — NON DÉTERMINÉ |
| BORNE-S4-2 | LOT-P2-5 §5.5 | Frontière opérationnelle entre contributions distinctes — NON DÉTERMINÉ |

Ces bornes seront documentées quant à leur impact sur la normalisation inter-familles. Leur résolution relève des lots d'activation respectifs.

---

## §3 — Périmètre

### §3.1 — Inclus dans ce lot

- Définition de la sémantique de « normalisation inter-familles » dans le corpus
- Identification des formats et axes réellement concernés par la normalisation (les « formats de données » visés par LOT-P2-1 §3.2)
- Établissement des règles correspondantes, après instruction en P2-7.A
- Documentation des zones d'indétermination dues aux bornes amont (BORNE-S3-3 · BORNE-S4-1 · BORNE-S4-2)

### §3.2 — Exclus de ce lot

- Doctrine des Corrélations (périmètre LOT-P2-8)
- Implémentation technique de la normalisation (Programme P3+)
- Résolution des bornes ouvertes S3/S4 (périmètre des lots d'activation respectifs)
- Modification des schémas clos S1→S5 (LOT-P2-2 à LOT-P2-6)
- Modification des invariants LOT-P2-1 (RF · FB · DI · IG)
- Corrélation inter-familles et détection de relations entre données

---

## §4 — Fondements doctrinaux

### §4.1 — Textes fondateurs

| Texte | Rôle dans ce lot |
|---|---|
| Roadmap V1 (P2 livrable 6) | Mandat textuel — « Règles de normalisation inter-familles » |
| LOT-P2-1 §3.2 | Délimitation — exclusion explicite : « Normalisation des formats de données (périmètre LOT-P2-7) » |
| LOT-P2-4 §3.2 | Délimitation confirmée — exclusion explicite : « Normalisation inter-familles (périmètre LOT-P2-7) » |
| LOT-P2-6 §3.2 | Délimitation confirmée — exclusion explicite : « Normalisation inter-familles (périmètre LOT-P2-7) » |
| GPD V1 §13.4 | Contexte architectural motivant — modèle cross-familles nécessaire pour Timeline · Corrélateur · Assistant Mémoire |
| GPD V1 §9.3 | Exemple d'hétérogénéité inter-familles (dates) |

### §4.2 — Invariants hérités non modifiables

Les invariants figés dans LOT-P2-1 (RF · FB · DI · IG) et les schémas clos LOT-P2-2 à LOT-P2-6 ne peuvent pas être modifiés par LOT-P2-7. Toute règle de normalisation produite dans ce lot doit être compatible avec ces invariants.

---

## §5 — Question centrale

### §5.1 — Question centrale · INSTRUITE · P2-7.A

**Que signifie « normalisation inter-familles » dans le corpus Caméléon Engine ?**

Le corpus (Roadmap V1 · LOT-P2-1 §3.2 · LOT-P2-4 §3.2 · LOT-P2-6 §3.2) nomme explicitement la « normalisation inter-familles » comme périmètre de LOT-P2-7 sans en définir la sémantique. La définition de cette sémantique — ce que normaliser signifie concrètement pour des données de familles différentes — est la question fondamentale instruite en P2-7.A.

La réponse à cette question centrale a déterminé l'existence, le nombre et la nature des décisions à trancher dans ce lot. La décision centrale issue de cette instrumentation est inscrite en §6.

---

## §6 — Registre des décisions

### Décision centrale — P2-7.A

**Adoptée · 2026-08-16**

La normalisation inter-familles dans Caméléon Engine définit, pour les dimensions où le corpus fonde une représentation commune, les règles permettant leur lecture cohérente dans un contexte cross-familles, sans modifier la sémantique propre de chaque famille ni masquer les différences sémantiques pertinentes entre familles.

Lorsque deux familles emploient un même champ canonique avec des sémantiques différentes, la règle de normalisation doit rendre cette différence explicitement observable plutôt que de la résoudre par uniformisation.

LOT-P2-7 ne modifie aucun schéma canonique S1→S5.

---

## §7 — Suivi des micro-lots

### §7.1 — État des micro-lots

| Micro-lot | Mission | Statut |
|---|---|---|
| P2-7.A — Instrumentation | Définir la sémantique de « normalisation inter-familles » · identifier les axes et formats concernés · produire les décisions à trancher | **VALIDÉ · 2026-08-16** |
| P2-7.B — Règles effectives | Produire les règles effectives de normalisation pour les dimensions fondées par le corpus et documenter les limitations strictement nécessaires révélées par leur instruction | **À INSTRUIRE** |
| P2-7.C — Validation documentaire | DQC V2 CAS A · double revue indépendante · CV-1→CV-9 | **À DÉTERMINER après P2-7.B** |

### §7.2 — Critères de passage P2-7.A

| Condition | Statut |
|---|---|
| Sémantique de « normalisation inter-familles » définie et ancrée dans le corpus | SATISFAIT · §6 · 2026-08-16 |
| Axes et formats concernés identifiés depuis les textes fondateurs | SATISFAIT · P2-7.A · dimension `date` identifiée · `valeur` / `session` / `source` documentées comme non candidates |
| Impact des bornes amont (BORNE-S3-3 · BORNE-S4-1 · BORNE-S4-2) explicité | SATISFAIT · P2-7.A · bornes préservées · impact sur la décision centrale documenté |
| Registre des décisions à trancher (§6) alimenté ou vide justifié | SATISFAIT · §6 alimenté · Décision centrale inscrite |

### §7.3 — Conditions de clôture

| Condition | Statut |
|---|---|
| P2-7.B VALIDÉ | EN ATTENTE |
| P2-7.C VALIDÉ | EN ATTENTE |

---

## §8 — Critères de validation

| Critère | Condition |
|---|---|
| CV-1 | La sémantique de « normalisation inter-familles » est définie et ancrée dans le corpus |
| CV-2 | Les axes et formats concernés sont identifiés depuis les textes fondateurs |
| CV-3 | Les règles produites sont compatibles avec les invariants LOT-P2-1 |
| CV-4 | Les bornes héritées (BORNE-S3-3 · BORNE-S4-1 · BORNE-S4-2) sont documentées et leurs impacts sur la normalisation sont explicités |
| CV-5 | Aucune décision relevant de la Doctrine des Corrélations (périmètre LOT-P2-8) n'est inscrite dans ce lot |
| CV-6 | Aucune modification d'un schéma clos (S1→S5) n'est introduite |
| CV-7 | DQC V2 CAS A |
| CV-8 | DQC V3 PASS |
| CV-9 | Décision opérateur explicite de clôture |

---

## §9 — Conditions de clôture

| Condition | Statut |
|---|---|
| P2-7.A VALIDÉ | SATISFAIT · 2026-08-16 |
| P2-7.B · P2-7.C VALIDÉS | EN ATTENTE |
| CV-1→CV-9 PASS | EN ATTENTE |
| DQC V2 CAS A | EN ATTENTE |
| DQC V3 PASS | EN ATTENTE |
| Décision opérateur explicite de clôture | EN ATTENTE |

---

*P2-7 EN COURS — P2-7.B À INSTRUIRE.*
