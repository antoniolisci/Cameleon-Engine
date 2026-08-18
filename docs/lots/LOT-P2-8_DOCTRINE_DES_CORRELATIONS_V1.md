# LOT-P2-8 — Doctrine des Corrélations · V1

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-8 |
| Intitulé | Doctrine des Corrélations · V1 |
| Programme | P2 — Doctrine des Sources & Schémas d'Ingestion |
| Livrable Roadmap V1 | L7 |
| Phase Roadmap V1 | A |
| Type | Doctrine — Corrélations |
| Statut | EN COURS |
| Date d'ouverture | 2026-08-17 |
| Date de clôture | — |
| Commit d'ouverture | à venir |
| Prérequis | LOT-P2-1 CLOS · LOT-P2-7 CLOS |
| Document | docs/lots/LOT-P2-8_DOCTRINE_DES_CORRELATIONS_V1.md |

---

## §1 — Mission

LOT-P2-8 a pour mission de formaliser la Doctrine des Corrélations de Caméléon Engine : définir ce qu'est une corrélation dans le corpus canonique, ce qu'elle peut légitimement asserter, à quel niveau de confiance, et ce qu'elle ne peut jamais impliquer.

Ce lot est un lot de doctrine pure. Il ne produit aucune implémentation, aucun code, aucune activation d'une famille source.

LOT-P2-8 est le septième livrable du Programme P2 Roadmap V1 (L7). Il correspond au blanc doctrinal B identifié dans GPD V1 §8.4.

---

## §2 — Contexte & Prérequis

### §2.1 — Prérequis satisfaits

| Prérequis | Statut | Commit |
|---|---|---|
| LOT-P2-1 — Doctrine d'ingestion V1 | CLOS | c5fc6e3 |
| LOT-P2-2 — Parser S1 V1 | CLOS | 431de03 |
| LOT-P2-3 — Schéma S2 V1 | CLOS | 1a0c194 |
| LOT-P2-4 — Schéma S5 V1 | CLOS | 6e49b3e |
| LOT-P2-5 — Schéma S4 V1 | CLOS | 4856372 |
| LOT-P2-6 — Schéma S3 V1 | CLOS | 2702a15 |
| LOT-P2-7 — Normalisation inter-familles V1 | CLOS | 630e7a8 |

### §2.2 — Contexte d'ouverture

La Roadmap V1 L7 désigne LOT-P2-8 comme "Doctrine des Corrélations — incluant Pattern Reflection Doctrine V1". Ce lot est le dernier livrable du Programme P2 Phase A.

Aucun document du corpus gelé ne fournit de doctrine complète de corrélation. Les fragments disponibles sont dispersés entre ACF V1, PRD V1, dt_const_01, intelligence_layer_position_audit, modele-mental-canonique et ROADMAP V1.

LOT-P2-8 doit instruire le vocabulaire nécessaire à l'expression des corrélations et vérifier sa compatibilité avec Language System V1, conformément au mandat GPD / ROADMAP.

### §2.3 — Bornes et indéterminations héritées

**5 bornes ouvertes héritées — restent ouvertes à l'entrée de ce lot :**

| Borne | Origine | Nature | Statut | Impact P2-8 |
|---|---|---|---|---|
| BORNE-S3-1 | LOT-P2-6 | Dérivation secondaire S3 — NON DÉTERMINÉ | OUVERTE | Périphérique à ce stade |
| BORNE-S3-2 | LOT-P2-6 | Supports visuels multiples ou identiques — NON DÉTERMINÉ | OUVERTE | Périphérique à ce stade |
| BORNE-S3-3 | LOT-P2-6 · LOT-P2-7 | Nature/structure/format champ `valeur` S3 — NON DÉTERMINÉ | OUVERTE | Impact potentiel sur périmètre corrélations S3 · PARTIELLEMENT INSTRUIT |
| BORNE-S4-1 | LOT-P2-5 · LOT-P2-7 | Authorship copy-paste externe — NON DÉTERMINÉ | OUVERTE | Impact potentiel sur identification source S4 dans corrélation · NON DÉTERMINÉ |
| BORNE-S4-2 | LOT-P2-5 · LOT-P2-7 | Frontière contributions distinctes S4 — NON DÉTERMINÉ | OUVERTE | Impact potentiel sur grain unité corrélable S4 · NON DÉTERMINÉ |

Aucune borne n'est résolue par LOT-P2-8. BORNE-S3-1 et BORNE-S3-2 sont périphériques à ce stade. BORNE-S3-3, BORNE-S4-1 et BORNE-S4-2 présentent un impact potentiel sur la doctrine — partiellement instruit à l'ouverture, non déterminé.

---

**7 indéterminations T0 (CE-BASELINE-2026-08 §11.2) — restent ouvertes :**

| IND | Indétermination | Origine | Statut |
|---|---|---|---|
| IND-T0-1 | Sémantique exacte de la date S3 | LOT-P2-7 Règle 2 | OUVERTE · LOT d'activation S3 |
| IND-T0-2 | Applicabilité R1/R3/R4 à S3 | LOT-P2-7 Règle 3 | OUVERTE · LOT d'activation S3 |
| IND-T0-3 | Applicabilité R1/R3/R4 à S5 | LOT-P2-7 Règle 3 | OUVERTE · LOT d'activation S5 |
| IND-T0-4 | Normalisation R4 (epoch ms → ISO 8601 UTC) | LOT-P2-7 | OUVERTE · Programme P3+ |
| IND-T0-5 | `date_phenomene` comme règle inter-familles S4 | LOT-P2-7 | OUVERTE · LOT d'activation S4 |
| IND-T0-6 | D2c — cas zéro contenu S3 | LOT-P2-6 DT-S3-2 | OUVERTE · dépend DT-S3-3 |
| IND-T0-7 | I-01 — conflit GPT Vision vs local-first | LOT-P2-6 · Doctrine Mémoire Visuelle | OUVERTE · GPD V1 §8.4 blanc B3 |

Ces 7 indéterminations T0 restent sous l'autorité de leurs périmètres de résolution respectifs et ne sont pas résolues par LOT-P2-8. Leur incidence éventuelle sur la portée de la Doctrine des Corrélations doit toutefois être conservée lorsqu'elle est démontrable ; sinon : NON DÉTERMINÉ.

---

**Questions / indéterminations propres à LOT-P2-8 :**

| ID | Nature | Statut |
|---|---|---|
| DÉCISION-01 | Définition canonique de "corrélation" dans CE | ADOPTÉE — §5.6 |
| S-04 | Impact BORNE-S3-3/S4-1/S4-2 sur la doctrine des corrélations | PARTIELLEMENT INSTRUITE |
| S-06 | Périmètre S3 dans les corrélations Phase A | NON TRANCHÉE — décision opérateur requise |
| Y-1 | Tension : modele-mental-canonique §3 l.170 "entre patterns et résultats" vs interdiction fusion marché (intelligence_layer_position_audit R-INT-07) | RÉSOLUE — FAUX CONFLIT DE PORTÉE + RESTRICTION OPÉRATIONNELLE PARTIELLE — voir §9 |
| Y-5 | Mécanisme général de changement de statut d'une relation / hypothèse dans CE | PARTIELLEMENT RÉSOLUE — voir §8 |
| Y-5A | Autorité de validation en CE-général | RÉSOLUE — voir §8.1 |
| Y-5B | Automaticité du changement de statut | PARTIELLEMENT RÉSOLUE — voir §8.2 |
| Y-5C | Relation entre évolution des lectures / confiance et validation | RÉSOLUE — voir §8.3 |
| Y-5D | Taxonomie des statuts CE-général | NON DÉTERMINÉE — Programme P6 |
| Y-5E | Graphe exact des transitions | NON DÉTERMINÉE — Programme P6 |
| Y-5F | Critères et seuils de proposition de changement | NON DÉTERMINÉE — Programme P6 |
| Y-6 | Tension : "lien" / "relation" / "corrélation" — rapport sémantique et ontologique dans CE | PARTIELLEMENT RÉSOLUE — voir §6 |
| Y-6A | Relation / Corrélation dans le Constellium | RÉSOLUE · portée Constellium uniquement — voir §6.1 |
| Y-6B | Relation / Corrélation en CE-général | NON DÉTERMINÉE — voir §6.2 |
| Y-6C | « lien » / « relation » dans I-07 | NON DÉTERMINÉE — voir §6.3 |
| Y-7 | Périmètre des corrélations intra-famille — périmètre opérationnel L2 / P6 et existence conceptuelle des corrélations intra-famille | PARTIELLEMENT RÉSOLUE — voir §7 |
| Y-7A | Périmètre opérationnel L2 / P6 — inter-familles ou non ? | RÉSOLUE — INTER-FAMILLES dans le périmètre actuellement canonisé — voir §7.1 |
| Y-7B | Existence doctrinale et mécanisme éventuel des corrélations intra-famille | NON DÉTERMINÉE — voir §7.2 |

---

## §3 — Périmètre

### §3.1 — Inclus dans ce lot

- Définition canonique de "corrélation" dans CE (DÉCISION-01)
- Statut épistémique des corrélations (HYPOTHÈSE · OBSERVÉE · autre — à décider)
- Règles d'assertion et de non-assertion d'une corrélation
- Frontière corrélation / causalité — fondée sur CONST-I3 et intelligence_layer_position_audit §3 l.91
- Périmètre des familles corrélables en Phase A
- Intégration Pattern Reflection Doctrine V1 dans la doctrine des corrélations
- Instruction du vocabulaire de corrélation pour compatibilité Language System V1
- Seuil minimal d'observation — principe N2 (valeur N5 hors périmètre)

### §3.2 — Exclus de ce lot

- Moteur de corrélation L2 (Programme P6 — prérequis : P1 GELÉ · P2 GELÉ · P3 avancé)
- Toute implémentation technique de corrélation
- Valeur numérique du seuil minimal d'observation (N5 — Programme P6)
- Activation S3, S4, S5 (lots d'activation respectifs)
- Résolution BORNE-S3-1/S3-2/S3-3/S4-1/S4-2 (lots d'activation respectifs)
- Couche L1 Temporelle et Couche L3 Cognitive (programmes ultérieurs)
- Doctrine des Corrélations Constellium — périmètre dt_const_01 distinct

---

## §4 — Fondements doctrinaux

### §4.1 — Sources d'autorité

| Source | Référence | Niveau | Élément applicable |
|---|---|---|---|
| ACF V1 — Dictionnaire | M2 l.34 | A | "Corrélation — Relation observée entre deux mémoires ou plus — jamais imposée, toujours détectée" |
| ACF V1 — I-07 | M2 l.130 | A | "Le système ne fabrique pas de liens. Il détecte des relations qui existent dans les données." |
| ACF V1 — I-08 | M2 l.131 | A | "Toute information persistée conserve sa source, sa date, son contexte d'origine." |
| LOT-P2-1 — IG-I5 | §6 l.266 | A | "Aucune corrélation à l'ingestion — la couche d'ingestion ne corrèle pas les données entre familles." |
| dt_const_01 — CONST-I2 | l.130 | A · portée Constellium | Relation non prouvée → statut HYPOTHÈSE visible au moment de la navigation |
| dt_const_01 — CONST-I3 | l.138 | A · portée Constellium | "Une corrélation ne devient jamais une causalité dans le Constellium. Le statut épistémique de toute relation doit être visible au moment de la navigation." |
| dt_const_01 — CONST-I4 | l.144 | A · portée Constellium | "Une hypothèse reste une hypothèse jusqu'à validation explicite par l'opérateur. Elle ne change pas de statut automatiquement." — portée CE-générale NON DÉTERMINÉE |
| PRD V1 — R-P07 | §7 | A (principe N2) | Seuil minimal d'observation = principe N2 · valeur = N5 (Programme P6) |
| PRD V1 — R-P03 | §5 | A | Interdiction de clauses causales dans l'expression des patterns |
| intelligence_layer_position_audit — §3 | l.87–89 | A | Corrélations comportement × contexte autorisées |
| intelligence_layer_position_audit — §3 | l.91 | A | "corrélation n'est pas causalité" — général CE |
| ROADMAP V1 — L7 | l.104 | A | "Doctrine des Corrélations — incluant Pattern Reflection Doctrine V1" |
| ROADMAP V1 — P6 | l.219 | A | "Aucune corrélation imposée — uniquement détectées (I-07)" |
| ROADMAP V1 — P6 | l.222 | A | "Toute corrélation persistée conserve sa provenance (I-08)" |
| modele-mental-canonique — §3 | l.160–168 | B | "Un lien révélé entre deux dimensions du comportement de l'opérateur, visible uniquement sur une durée suffisante." |
| Language System V1 — Couche 3 VALIDATION | §3 | A | "Rôle : enregistrer et restituer l'état de la décision humaine." · "accepter, refuser, confirmer" — exclusifs à cette couche |
| Constitution Intellectuelle V1 | §5 · §8 | A | §5 : "droit et devoir du moteur de faire évoluer ses lectures lorsque les observations changent" · §8 : "le niveau de confiance affiché reste toujours proportionnel aux preuves disponibles" |

**Note I-07 / I-08 :**

I-07 et I-08 sont deux invariants distincts. I-07 encadre la non-imposition (détection uniquement). I-08 encadre la provenance de toute information persistée. Les deux textes exacts ont été lus et confirmés depuis ACF V1 (M2 l.130–131) et sont cités verbatim ci-dessus.

I-07 ≠ I-08 : toute section traitant de la détection s'appuie sur I-07. Toute section traitant de la provenance des corrélations persistées s'appuie sur I-08.

### §4.2 — Acquis non réouverts dans ce lot

| Acquis | Fondement | Source |
|---|---|---|
| Aucune corrélation à l'ingestion | A | LOT-P2-1 IG-I5 |
| Corrélation ≠ causalité | A | CONST-I3 (Constellium) · intelligence_layer_position_audit §3 l.91 (général CE) |
| Statut épistémique visible au moment de la navigation dans le Constellium | A · portée Constellium | CONST-I2 · CONST-I3 — portée générale à instruire si nécessaire |
| Hypothèse ≠ passage automatique de statut dans le Constellium | A · portée Constellium | CONST-I4 — portée Constellium uniquement · portée CE-générale partiellement instruite via Y-5 (§8) |
| Seuil principe N2 · valeur N5 | A (principe) | PRD V1 R-P07 |
| Interdiction clauses causales dans expression patterns | A | PRD V1 R-P03 |
| Corrélation jamais imposée · toujours détectée | A | ACF V1 I-07 |
| Provenance de toute corrélation persistée | A | ACF V1 I-08 · ROADMAP V1 P6 l.222 |

### §4.3 — Tensions identifiées (non bloquantes à l'ouverture)

Voir également §2.3 — Questions / indéterminations propres à LOT-P2-8.

| ID | Tension | Statut |
|---|---|---|
| Y-1 | modele-mental-canonique §3 l.170 "entre patterns et résultats" vs interdiction de corrélation comportement × résultats de marché (intelligence_layer_position_audit R-INT-07) | RÉSOLUE — voir §9 |
| Y-5 | Mécanisme général de changement de statut d'une relation / hypothèse dans CE | PARTIELLEMENT RÉSOLUE — voir §8 |
| Y-6 | "lien" / "relation" / "corrélation" — rapport sémantique et ontologique dans CE | PARTIELLEMENT RÉSOLUE — voir §6 |
| Y-6A | Relation / Corrélation dans le Constellium | RÉSOLUE · portée Constellium uniquement — voir §6.1 |
| Y-6B | Relation / Corrélation en CE-général | NON DÉTERMINÉE — voir §6.2 |
| Y-6C | « lien » / « relation » dans I-07 — alternance "ne fabrique pas de liens / détecte des relations" | NON DÉTERMINÉE — voir §6.3 |
| Y-7 | Périmètre des corrélations intra-famille — périmètre opérationnel L2 / P6 et existence conceptuelle des corrélations intra-famille | PARTIELLEMENT RÉSOLUE — voir §7 |
| Y-7A | Périmètre opérationnel L2 / P6 — inter-familles ou non ? | RÉSOLUE — INTER-FAMILLES dans le périmètre actuellement canonisé — voir §7.1 |
| Y-7B | Existence doctrinale et mécanisme éventuel des corrélations intra-famille | NON DÉTERMINÉE — voir §7.2 |

---

## §5 — DÉCISION-01 : Définition canonique de "corrélation" dans CE

### §5.1 — Mandat

DÉCISION-01 a pour mission de définir le terme "corrélation" tel qu'il sera utilisé dans toute la doctrine de Caméléon Engine.

État à l'ouverture : aucun document du corpus gelé ne fournit de définition canonique complète et opératoire. ACF V1 (M2 l.34) fournit un fragment dictionnaire de niveau A. Les autres fragments sont partiels, contextualisés ou inférés. La sélection ou la synthèse d'une définition requiert une décision opérateur explicite.

### §5.2 — Fragments extraits du corpus gelé

| Fragment | Source | Niveau | Nature |
|---|---|---|---|
| "Relation observée entre deux mémoires ou plus — jamais imposée, toujours détectée" | ACF V1 M2 l.34 | A | Fragment dictionnaire — incomplet comme définition canonique complète et opératoire |
| "Le système ne fabrique pas de liens. Il détecte des relations qui existent dans les données." | ACF V1 I-07 M2 l.130 | A | Invariant — encadre la non-imposition · ne définit pas la corrélation |
| "Un lien révélé entre deux dimensions du comportement de l'opérateur, visible uniquement sur une durée suffisante." | modele-mental-canonique §3 l.160 | B | Définition contextualisée au comportemental — non générique |
| "corrélation n'est pas causalité" | intelligence_layer_position_audit §3 l.91 | A | Frontière épistémique — non définition |
| "Aucune corrélation imposée — uniquement détectées dans les données (I-07)" | ROADMAP V1 P6 l.219 | A | Règle de détection — non définition |

Conclusion : aucun fragment ne fournit seul une définition canonique complète et opératoire. DÉCISION-01 est requise.

### §5.3 — Concepts voisins à distinguer

| Concept | Statut dans CE | Fondement |
|---|---|---|
| Causalité | Interdit d'être asserté depuis une corrélation | CONST-I3 (A · Constellium) · intelligence_layer_position_audit §3 l.91 (A · général CE) |
| Pattern | Comportement récurrent détecté — jamais un profil figé ; distinction avec « corrélation » = corollaire des périmètres distincts, non règle verbatim | ACF V1 dictionnaire (A · définition) · PRD V1 (B · distinction) |
| Relation | Terme présent dans le corpus — rapport exact avec « corrélation » partiellement instruit | ACF V1 I-07 · PARTIELLEMENT RÉSOLUE — voir §6 |
| Lien | Terme de modele-mental-canonique — non canonisé dans doctrine primaire · Y-6 partiellement résolue | B — non adopté · voir §6 |
| Hypothèse | Statut épistémique applicable à une relation non prouvée — portée Constellium établie par CONST-I2 ; portée générale à instruire | CONST-I2 (A · Constellium) |
| Co-occurrence | Terme absent du corpus gelé | PROPOSITION D'INSTRUCTION — niveau D |

### §5.4 — Matrice des options d'instruction

Les 4 options ci-dessous sont des **OPTIONS D'INSTRUCTION** extraites du corpus gelé. Aucune n'est sélectionnée. Chaque option reçoit une décomposition par composante avec son niveau fondement individuel.

**Règle appliquée :** UNE OPTION COMPOSITE NE PEUT PAS HÉRITER DU NIVEAU A SI UNE PARTIE STRUCTURANTE DE SA FORMULATION EST INFÉRÉE.

---

**Option I — Relationnelle inter-familles**

> Proposition : "Une corrélation est une relation détectée entre deux traces ou plus appartenant à des familles différentes, persistée et traçable."

| Composante | Fondement | Niveau |
|---|---|---|
| "relation détectée" | ACF V1 I-07 M2 l.130 — texte direct | A |
| "deux traces ou plus" | ACF V1 M2 l.34 "deux mémoires ou plus" — analogie trace/mémoire | B |
| "appartenant à des familles différentes" | Inférence architecturale depuis ROADMAP P6 + ACF V1 L2 — non texte canonique | C |
| "persistée" | ACF V1 I-08 M2 l.131 + ROADMAP V1 P6 l.222 — texte direct | A |
| "traçable" | ACF V1 I-08 M2 l.131 — texte direct | A |

**Niveau composite Option I : B/C** — la composante "familles différentes" comme contrainte stricte est une inférence architecturale (C), non un texte canonique direct.

---

**Option II — Révélation comportementale**

> Proposition : "Une corrélation est un lien révélé entre deux dimensions du comportement de l'opérateur, visible uniquement sur une durée suffisante."

| Composante | Fondement | Niveau |
|---|---|---|
| "lien révélé" | modele-mental-canonique §3 l.160 — citation directe | B |
| "deux dimensions du comportement de l'opérateur" | modele-mental-canonique §3 l.160 — citation directe | B |
| "visible uniquement sur une durée suffisante" | modele-mental-canonique §3 l.168 — paraphrase du texte source | B |
| Portée restrictive — exclut S1×S2, S1×S4 et paires non comportementales | Inférence par spécificité de la source · non établi comme règle | C |

**Niveau composite Option II : B** — entièrement fondé sur modele-mental-canonique (B). La portée restrictive à l'unique dimension comportementale est contextuelle (C) — risque de non-couverture du périmètre P2-8.

---

**Option III — Coexistence contextuelle**

> Proposition : "Une corrélation est la co-occurrence structurelle de deux signaux, observée entre le comportement de l'opérateur et son contexte de marché, sur un corpus suffisant."

| Composante | Fondement | Niveau |
|---|---|---|
| Autorisation corrélations comportement × contexte | intelligence_layer_position_audit §3 l.87–89 — texte direct | A |
| "co-occurrence structurelle" | Terme absent du corpus gelé — néologisme proposé | D |
| "deux signaux" | Terme non défini dans le corpus gelé | D |
| "corpus suffisant" | PRD V1 R-P07 — principe N2 | A (principe seulement) |
| Portée restrictive — exclut paires hors comportement×contexte | Inférence par la source · non établi comme règle | C |

**Niveau composite Option III : D** — deux composantes structurantes ("co-occurrence structurelle", "deux signaux") sont des propositions sans fondement dans le corpus gelé.

---

**Option IV — Relation épistémique traçable**

> Proposition : "Une corrélation est une relation dont le statut épistémique est visible et persisté, posée entre des entités distinctes du corpus mémoriel."

| Composante | Fondement | Niveau |
|---|---|---|
| "statut épistémique visible" | CONST-I2 l.130 + CONST-I3 l.138 — texte direct · portée Constellium | A · portée Constellium |
| "persisté" | ACF V1 I-08 M2 l.131 — texte direct | A |
| "entités distinctes du corpus mémoriel" | ACF V1 M2 l.34 "deux mémoires ou plus" — paraphrase élargie · "entités" n'est pas le terme du corpus | B/C |
| Définition par attributs épistémiques sans contenu positif | Choix architectural inféré — non prescrit dans le corpus | C |

**Niveau composite Option IV : B/C** — les composantes épistémiques sont A (portée Constellium), mais "entités distinctes" et l'approche par attributs sans définition positive sont des inférences architecturales (C).

---

### §5.5 — Critères de sélection pour DÉCISION-01

Une définition candidate doit satisfaire l'ensemble des critères suivants :

1. Compatibilité avec I-07 (non-imposition) — fondement A requis
2. Compatibilité avec I-08 (provenance traçable) — fondement A requis
3. Compatibilité avec CONST-I3 / intelligence_layer_position_audit §3 l.91 (corrélation ≠ causalité) — fondement A requis
4. Compatibilité avec CONST-I4 dans son périmètre d'origine Constellium ; toute extension de cette règle au mécanisme général de statut des corrélations CE reste à instruire via Y-5
5. Compatibilité avec IG-I5 (aucune corrélation à l'ingestion) — fondement A requis
6. Périmètre couvrant les besoins du Moteur de Corrélation L2 (ACF V1 · ROADMAP P6)
7. *(Critère méthodologique provisoire d'arbitrage — non doctrinal)* Niveau composite minimum B — aucune composante structurante de niveau D · à valider par décision opérateur si retenu
8. Compatibilité Language System V1 (terme à instruire ou confirmer)

### §5.6 — DÉCISION-01 : ADOPTÉE

**Définition canonique CE-générale :**

> « Une corrélation est une relation observée entre deux mémoires ou plus — jamais imposée, toujours détectée. »

Formulation quasi-verbatim ACF V1 dictionnaire (M2 l.34). Niveau fondement : **A**. Option V-B retenue.

---

**D-01.1 — Formulation**

Option V-B adoptée. La définition reprend quasi-verbatim le dictionnaire ACF V1. Aucune expansion interprétative de I-07 n'est introduite dans la définition elle-même.

---

**D-01.2 — Unité**

Le terme canonique de l'unité dans la définition est **mémoire**. Ne pas remplacer par : trace · donnée · entité · dimension · signal.

La présence de "traces" dans la responsabilité #5 d'ACF V1 constitue une différence de granularité entre niveau conceptuel (mémoire) et niveau opérationnel (trace = unité de base de la mémoire). Cette tension est conservée à instruire ultérieurement si nécessaire. Elle ne modifie pas DÉCISION-01.

---

**D-01.3 — Périmètre intra / inter-familles**

**Distinction définition / périmètre moteur :**

DÉCISION-01 est une définition CE-générale. Elle ne prescrit pas le périmètre opérationnel du futur moteur de corrélation.

Le périmètre opérationnel du moteur (L2 / Programme P6) est instruit séparément dans Y-7A et Y-7B (voir §7).

"Appartenant à des familles différentes" n'est pas ajouté à la définition.

La définition canonique ("deux mémoires ou plus") ne pose aucune restriction explicite relative à l'appartenance familiale des mémoires mises en relation. Cette absence de restriction ne constitue pas une autorisation doctrinale positive des corrélations intra-famille.

Les textes F-04 (ACF V1 L2 Relationnelle) et F-05 (ACF V1 responsabilité #5) restent applicables dans leur périmètre fonctionnel actuel sans généralisation supplémentaire.

La question du périmètre des corrélations intra-famille est **PARTIELLEMENT RÉSOLUE** — voir **Y-7**.

---

**D-01.4 — Y-6**

L'utilisation du mot "relation" dans la définition reprend strictement le vocabulaire du dictionnaire ACF V1. DÉCISION-01 ne résout pas Y-6.

Elle ne canonise ni "Relation > Corrélation" ni "Relation = Corrélation" ni aucune autre ontologie générale entre les termes relation · corrélation · lien.

**Y-6 est partiellement résolue — voir §6.**

---

**D-01.5 — Règles doctrinales distinctes — non absorbées par la définition**

La définition canonique ne doit pas absorber les règles doctrinales suivantes. Chacune reste une règle indépendante :

| # | Règle | Source | Statut |
|---|---|---|---|
| 1 | Corrélation ≠ causalité | CONST-I3 (A · Constellium) · intelligence_layer_position_audit §3 l.91 (A · général CE) | ÉTABLIE |
| 2 | Aucune corrélation à l'ingestion | LOT-P2-1 IG-I5 | ÉTABLIE |
| 3 | Seuil minimal d'observations — principe | PRD V1 R-P07 | ÉTABLIE (N2) |
| 4 | Valeur numérique du seuil | — | NON FIXÉE — Programme P6 |
| 5 | Provenance obligatoire lorsqu'une corrélation est persistée | ACF V1 I-08 · ROADMAP V1 P6 l.222 | ÉTABLIE |
| 6 | Séparation structurelle comportement / marché | intelligence_layer_position_audit R-INT-07 | ÉTABLIE |
| 7 | Règles de statut épistémique du Constellium | CONST-I2 · CONST-I3 · CONST-I4 · portée Constellium | ÉTABLIES · portée Constellium |
| 8 | Y-5 — mécanisme général de changement de statut CE | Language System V1 Couche 3 · Constitution Intellectuelle V1 §5/§8 | PARTIELLEMENT RÉSOLUE — Y-5A/Y-5C RÉSOLUES · Y-5B PARTIELLEMENT RÉSOLUE · Y-5D/E/F NON DÉTERMINÉES — voir §8 |
| 9 | Y-6 — rapport relation / corrélation / lien | — | PARTIELLEMENT RÉSOLUE — voir §6 |
| 10 | S-06 — périmètre S3 dans les corrélations Phase A | — | NON TRANCHÉE |
| 11 | Y-7 — périmètre opérationnel L2 / P6 et corrélations intra-famille | — | PARTIELLEMENT RÉSOLUE — voir §7 |

---

**D-01.6 — Formulation écartée**

Ne pas inscrire comme doctrine : "une corrélation est une propriété des données indépendamment du système".

Cette formulation est une extrapolation de niveau C non établie par I-07.

La formulation correctement fondée issue de I-07 est un invariant distinct : **"CE détecte des relations qui existent dans les données sans les fabriquer."** Cet invariant ne doit pas être fusionné silencieusement avec la définition canonique.

Les lectures "observée = état épistémique" / "détectée = mécanisme" restent des interprétations de niveau C. Elles ne sont pas canonisées par cette décision et ne doivent pas être présentées comme des distinctions établies.

---

**D-01.7 — N-arité**

"deux mémoires ou plus" autorise sémantiquement n ≥ 3.

Cette permission sémantique ne signifie pas qu'une architecture n-aire est actuellement conçue, validée ou implémentée dans CE.

**Permission sémantique ≠ architecture implémentée.**

---

**D-01.8 — Co-occurrence accidentelle**

Ne pas inscrire : "le seuil minimal exclut les co-occurrences accidentelles".

Le seuil minimal d'observations réduit le risque statistique de déclarer une co-occurrence accidentelle comme corrélation. Il ne constitue pas, à lui seul, une preuve doctrinale qu'une relation observée n'est pas accidentelle.

La qualification statistique relève du chantier d'implémentation et de calibration correspondant (Programme P6).

---

## §6 — Y-6 : Rapport sémantique entre "relation", "corrélation" et "lien" dans CE

### §6.1 — Y-6A : Relation / Corrélation dans le Constellium

**STATUT : RÉSOLUE · PORTÉE CONSTELLIUM UNIQUEMENT**

| Source | Référence | Niveau | Élément applicable |
|---|---|---|---|
| dt_const_01 — CONST-I3 | l.138 | A · portée Constellium | "toute relation — corrélation, hypothèse, dérivation, déclaration opérateur" |
| constellium_v1_definition | §4 l.224 | A · portée Constellium | "Un lien est une relation entre deux étoiles, prouvée par les données." |

Dans le périmètre Constellium :

- "relation" est le terme générique. Une corrélation, une hypothèse, une dérivation et une déclaration opérateur sont toutes des types de relation (CONST-I3).
- "lien" est le terme de représentation Constellium pour une relation prouvée par les données (constellium_v1_definition §4).
- "corrélation" est un type de relation dans ce périmètre.

Hiérarchie établie : **relation > corrélation** (en tant que type spécifique) dans le périmètre Constellium uniquement.

Cette résolution est strictement circonscrite au périmètre Constellium. Elle ne s'étend pas au périmètre CE-général (voir §6.2).

---

### §6.2 — Y-6B : Relation / Corrélation en CE-général

**STATUT : NON DÉTERMINÉE**

DÉCISION-01 utilise le terme "relation" comme vocabulaire repris du dictionnaire ACF V1 (M2 l.34). Ce choix de vocabulaire ne crée pas d'ontologie CE-générale du terme "Relation".

Aucun document du corpus gelé ne définit "relation" comme terme canonique CE-général distinct de "corrélation".

La résolution Y-6A (périmètre Constellium) ne s'étend pas au périmètre CE-général : aucun fondement de niveau A ne permet d'asserter une ontologie "relation > corrélation" applicable hors Constellium.

Y-6B reste NON DÉTERMINÉE. Sa résolution requiert une décision doctrinale dédiée dans un lot compétent.

---

### §6.3 — Y-6C : « lien » / « relation » dans I-07

**STATUT : NON DÉTERMINÉE**

Texte I-07 (ACF V1 M2 l.130, niveau A) :

> « Le système ne fabrique pas de liens. Il détecte des relations qui existent dans les données. »

I-07 contient une alternance entre "liens" (première clause) et "relations" (deuxième clause). Hypothèses locales testées lors de l'instruction de Y-6C :

| Hypothèse | Contenu | Niveau |
|---|---|---|
| Y-6C-H1 — Synonymie locale | « liens » et « relations » seraient synonymes dans I-07 | B — cohérent, non établi verbatim |
| Y-6C-H2 — Contraste rhétorique/actionnel | l'alternance « liens / relations » porterait principalement sur fabriquer vs détecter | B — interprétation cohérente, non établie verbatim |
| Y-6C-H3 — Lecture Constellium | « liens » pourrait être lu à travers le sens Constellium de lien/relation représentée | C — inférence architecturale hors périmètre direct de I-07 |

**Note méthodologique :**

L'interprétation que le contraste "liens/relations" dans I-07 est purement rhétorique ou actionnel (Y-6C-H2) constitue une lecture de niveau B. Elle ne peut pas être inscrite comme résolution canonique. Aucun texte du corpus gelé n'établit verbatim que "liens" et "relations" sont synonymes dans I-07 (Y-6C-H1 non confirmé), ni qu'ils désignent deux objets sémantiquement distincts.

Y-6C reste NON DÉTERMINÉE. Sa résolution requiert soit un fondement de niveau A dans le corpus gelé, soit une décision doctrinale explicite dans un lot compétent.

---

## §7 — Y-7 : Périmètre opérationnel du moteur L2 / P6 et corrélations intra-famille

### §7.1 — Y-7A : Périmètre opérationnel L2 / P6

**STATUT : RÉSOLUE — INTER-FAMILLES dans le périmètre actuellement canonisé**

Le corpus canonique gelé désigne le moteur L2 / Programme P6 comme opérant sur des corrélations inter-familles. Six textes de niveau A fondent cette lecture :

| # | Source | Référence | Niveau | Fondement inter-familles |
|---|---|---|---|---|
| F-01 | ACF V1 — L2 Relationnelle | M2 l.87 | A | "Moteur de corrélation — liens entre familles, détection de relations non évidentes" |
| F-02 | ACF V1 — Responsabilité #5 | M2 l.157 | A | "Corréler — détecter des relations entre traces de familles différentes" |
| F-03 | ROADMAP V1 — P6 Mission | l.207 | A | "Implémenter la couche L2 — détection de relations entre familles mémoire" |
| F-04 | ROADMAP V1 — P6 Livrable 2 | l.213 | A | "Moteur de détection de relations inter-familles" |
| F-05 | ROADMAP V1 — Phase C | l.327 | A | "P6 — Moteur de Corrélation (L2) · Corrélation inter-familles conforme Pattern Reflection Doctrine V1" |
| F-06 | GPD V1 — §11.3 | l.1739 | A | "cette relation n'est visible qu'en croisant SY1 et S5" — exemple canonique de corrélation cross-familles |

La convergence de ces six textes de niveau A établit que le périmètre opérationnel de L2 et P6 est inter-familles dans le corpus canonique gelé.

**Y-7A : RÉSOLUE — INTER-FAMILLES dans le périmètre actuellement canonisé.**

Toute extension future de P6 vers des corrélations intra-famille nécessiterait une décision doctrinale explicite dans le lot compétent.

---

**Ce que Y-7A n'affirme pas :**

- Y-7A n'affirme pas que les corrélations intra-famille sont interdites dans CE.
- Y-7A n'affirme pas qu'une corrélation intra-famille est conceptuellement impossible.
- Y-7A ne modifie pas DÉCISION-01 — la définition reste CE-générale.
- Y-7A ne résout pas Y-7B.

---

### §7.2 — Y-7B : Existence doctrinale et mécanisme des corrélations intra-famille

**STATUT : NON DÉTERMINÉE**

La définition canonique de DÉCISION-01 ("deux mémoires ou plus") ne pose aucune restriction explicite relative à l'appartenance familiale des mémoires mises en relation.

Cette absence de restriction ne constitue toutefois pas une autorisation doctrinale positive des corrélations intra-famille. Aucun texte de niveau A du corpus gelé ne les autorise explicitement, et aucun texte de niveau A ne les interdit explicitement.

Leur existence doctrinale en CE reste donc NON DÉTERMINÉE.

---

**Frontière Pattern / Corrélation intra-famille :**

Pattern (PRD V1) et corrélation sont deux concepts distincts dans CE :

- Un **pattern** est une régularité comportementale temporelle — défini au niveau de la conduite opérateur sur une durée (PRD V1).
- Une **corrélation** est une relation observée entre deux mémoires ou plus (DÉCISION-01).

Cette distinction conceptuelle n'établit pas de frontière familiale. Elle ne signifie pas que les corrélations intra-famille seraient équivalentes aux patterns, ni que les patterns épuisent l'espace des relations possibles au sein d'une famille.

**Ne jamais inscrire : corrélations intra-famille = patterns.**

Ce glissement constituerait une inférence de niveau C non fondée dans le corpus gelé. L'existence doctrinale des corrélations intra-famille reste indépendante de la doctrine des patterns.

---

Y-7B reste NON DÉTERMINÉE. Sa résolution requiert une décision doctrinale dédiée dans un lot compétent.

---

## §8 — Y-5 : Mécanisme général de changement de statut d'une relation / hypothèse dans CE

**STATUT : PARTIELLEMENT RÉSOLUE**

Y-5 instruite exhaustivement. Deux sous-questions sont résolues (Y-5A · Y-5C), une est partiellement résolue (Y-5B), trois restent NON DÉTERMINÉES (Y-5D · Y-5E · Y-5F).

**Note CONST-I4 :**
CONST-I4 ("Une hypothèse reste une hypothèse jusqu'à validation explicite par l'opérateur. Elle ne change pas de statut automatiquement.") est une règle strictement Constellium (dt_const_01 l.144). Elle n'est pas le fondement des règles CE-générales établies dans cette section. CONST-I4 est mentionné uniquement comme règle analogue existant dans le périmètre Constellium, sans extension à CE-général.

---

### §8.1 — Y-5A : Autorité de validation

**STATUT : RÉSOLUE**

**Règle Y-5A :**

> « Lorsqu'un acte d'acceptation, de refus ou de confirmation intervient dans CE-général, cet acte relève exclusivement de la couche Validation et de la décision humaine. »

Niveau composite : **B**

| Source | Référence | Niveau | Élément applicable |
|---|---|---|---|
| Language System V1 — Couche 3 VALIDATION | §3 | A | "accepter, refuser, confirmer" — exclusifs à la couche Validation · tableau d'exclusivité |
| Language System V1 — Couche 3 VALIDATION | §3 | A | "Rôle : enregistrer et restituer l'état de la décision humaine." |
| Constitution Intellectuelle V1 | §1 | A | "La décision reste humaine." |

**Ce que Y-5A n'établit pas :**

- Toute validation humaine ne change pas nécessairement le statut d'une relation — cette implication inverse n'est pas fondée dans le corpus gelé.
- Y-5A ne généralise pas CONST-I4 à CE-général.
- Y-5A ne définit pas de liste de statuts CE-général.

---

### §8.2 — Y-5B : Automaticité du changement de statut

**STATUT : PARTIELLEMENT RÉSOLUE**

**Règle Y-5B :**

> « Lorsqu'un changement de statut implique un acte d'acceptation, de refus ou de confirmation, cet acte ne peut pas être produit par une couche inférieure à la couche Validation. »

Niveau composite : **B** — découle de Y-5A (§8.1) et de la séparation des couches Language System V1.

**Portée de Y-5B :**

La règle couvre uniquement la classe des changements de statut impliquant l'un des trois actes : accepter · refuser · confirmer.

La classe des éventuels changements de statut n'impliquant ni acceptation, ni refus, ni confirmation reste **NON DÉTERMINÉE** dans le corpus gelé et dans ce lot.

**Ce que Y-5B n'établit pas :**

- Y-5B n'établit pas qu'aucun changement de statut ne peut jamais être automatique dans CE-général.
- Y-5B ne définit pas les statuts accessibles ni de graphe de transitions.

---

### §8.3 — Y-5C : Relation entre évolution des lectures / confiance et validation

**STATUT : RÉSOLUE**

**Règle Y-5C :**

> « Une évolution des lectures ou du niveau de confiance n'est pas, à elle seule, un acte d'acceptation, de refus ou de confirmation. »

Niveau composite : **B**

| Source | Référence | Niveau | Élément applicable |
|---|---|---|---|
| Constitution Intellectuelle V1 | §5 — Honnêteté intellectuelle | A | "droit et devoir du moteur de faire évoluer ses lectures lorsque les observations changent" |
| Constitution Intellectuelle V1 | §8 — Proportionnalité | A | "le niveau de confiance affiché reste toujours proportionnel aux preuves disponibles" |
| Language System V1 | Séparation Couche 2 / Couche 3 | A | Couche 2 = niveau de lisibilité du signal · Couche 3 = état de la décision humaine — couches distinctes |

**Ce que Y-5C n'établit pas :**

- Y-5C n'établit pas "confiance ≠ statut épistémique" comme règle CE-générale — "statut épistémique" reste un terme Constellium (CONST-I2, CONST-I3).
- Y-5C n'établit pas que les lectures ou le niveau de confiance évoluent automatiquement.

La distinction fondée ici est uniquement : une évolution de Couche 1 (lecture) ou Couche 2 (confiance) n'est pas un acte de Couche 3 (Validation).

---

### §8.4 — Y-5D : Taxonomie des statuts CE-général

**STATUT : NON DÉTERMINÉE**

Aucun texte du corpus gelé ne définit la liste des statuts épistémiques applicables aux relations ou hypothèses du corrélateur L2 en CE-général. CONST-I2/I3 définissent corrélation · hypothèse · dérivation · déclaration opérateur dans le périmètre Constellium uniquement. Cette taxonomie ne peut pas être transposée à CE-général sans décision doctrinale dédiée.

Y-5D reste NON DÉTERMINÉE. Sa résolution relève du Programme P6 et du lot d'implémentation du moteur de corrélation L2.

---

### §8.5 — Y-5E : Graphe exact des transitions

**STATUT : NON DÉTERMINÉE**

Aucun texte du corpus gelé ne définit les passages de statut à statut pour les relations du corrélateur L2 en CE-général. Y-5E requiert que Y-5D soit d'abord résolue. Elle relève du Programme P6.

---

### §8.6 — Y-5F : Critères et seuils de proposition de changement

**STATUT : NON DÉTERMINÉE — PROGRAMME P6**

Les critères et seuils à partir desquels le corrélateur L2 pourrait proposer un changement de statut à l'opérateur ne sont définis ni dans le corpus gelé ni dans ce lot. La valeur numérique du seuil minimal d'observation (N5) est explicitement exclue du périmètre LOT-P2-8 (§3.2). Les critères de promotion de statut relèvent du même périmètre.

Y-5F reste NON DÉTERMINÉE. Sa résolution relève du Programme P6.

---

## §9 — Y-1 : Tension « entre patterns et résultats » — périmètre des corrélations autorisées

**STATUT : RÉSOLUE — FAUX CONFLIT DE PORTÉE + RESTRICTION OPÉRATIONNELLE PARTIELLE**

Y-1 instruite par analyse exhaustive du corpus : modele-mental-canonique §3 · intelligence_layer_position_audit §3 et §4 (R-INT-07) · PRD V1 §II/§III. La tension résulte d'une ambiguïté terminologique dans modele-mental-canonique §3 et d'une approximation dans la formulation initiale de Y-1. Elle n'est pas une contradiction réelle entre les deux textes sources.

---

### §9.1 — Expression « entre patterns et résultats » — lecture contextuelle de niveau B

L'expression "entre patterns et résultats" figure dans modele-mental-canonique §3 (l.164), dans la liste des éléments appartenant au concept **"Corrélation personnelle"**, définie comme :

> « Un lien révélé entre deux dimensions du comportement de l'opérateur, visible uniquement sur une durée suffisante. »

Dans ce contexte définitionnel, "résultats" peut être lu comme désignant des résultats comportementaux ou opérationnels. Cette lecture est compatible avec la définition de la Corrélation personnelle, mais elle n'est pas définie verbatim par le corpus.

**Niveau de cette lecture : B** — inférence contextuelle depuis la définition. Le corpus ne définit pas "résultats" verbatim comme "résultats comportementaux."

**Ce que cette lecture n'établit pas :**

- Elle n'affirme pas que "résultats" signifie définitivement "résultats comportementaux" — l'ambiguïté terminologique du document source subsiste.
- Elle n'affirme pas que toute corrélation comportement × comportement est automatiquement autorisée.
- Elle n'est pas une autorisation positive de nouvelles formes de corrélation.
- Elle ne peut pas être élevée au niveau A.

---

### §9.2 — Interdictions de niveau A

Ces interdictions s'appliquent indépendamment de la lecture contextuelle de §9.1 :

| Forme interdite | Règle | Source | Niveau |
|---|---|---|---|
| Comportement × résultats financiers / PnL | "La séparation comportement / résultat est structurelle et permanente." · "L'Intelligence ne croise jamais le comportement avec les résultats financiers." | intelligence_layer_position_audit §4 "Scoring de performance" l.139–143 | A |
| Comportement × observations de prix | "L'Intelligence ne croise jamais les lectures comportementales avec des observations de prix." | intelligence_layer_position_audit R-INT-07 l.225–229 | A |
| Comportement × observations de tendance de marché | "… de tendance …" — même texte R-INT-07 | intelligence_layer_position_audit R-INT-07 l.225–229 | A |
| Comportement × timing de marché | "… ou de timing de marché." — même texte R-INT-07 | intelligence_layer_position_audit R-INT-07 l.225–229 | A |
| Données comportementales déclarées combinées avec données de lecture marché dans les opérations PRD V1 | "Ces opérations s'appliquent exclusivement aux données comportementales déclarées. Elles ne peuvent pas être combinées avec des données de lecture marché." | PRD V1 §II l.113 · §III l.143 | A |

---

### §9.3 — Exemple conflictuel : modele-mental-canonique l.170

modele-mental-canonique §3 l.170 présente l'exemple suivant comme une "corrélation" :

> « Tu trades plus gros quand le BTC monte »

Cet exemple croise un comportement (taille de position) avec une observation de prix (BTC monte). Il est en conflit réel avec R-INT-07 (niveau A) : "L'Intelligence ne croise jamais les lectures comportementales avec des observations de prix."

**Résolution par hiérarchie de niveaux dans ce lot :**

| Document | Nature | Niveau dans §4.1 |
|---|---|---|
| modele-mental-canonique §3 l.160–168 | Document fondateur · Audit conceptuel | B |
| intelligence_layer_position_audit R-INT-07 | Position opérationnelle | A |

Pour LOT-P2-8, la règle de niveau A (R-INT-07) prévaut sur cet exemple de niveau B.

**Ce que cette résolution n'implique pas :**

- Elle ne modifie pas modele-mental-canonique.
- Elle ne modifie pas intelligence_layer_position_audit.
- La temporalité des deux documents est un élément de contexte documentaire — elle ne constitue pas à elle seule une règle de priorité doctrinale. La prévalence de R-INT-07 est fondée sur le niveau A attribué dans §4.1 de ce lot.

---

### §9.4 — Formes autorisées : corrélations comportement × contexte de session

intelligence_layer_position_audit §3 (l.87–89, niveau A) autorise explicitement les corrélations comportementales avec le contexte de la session, désigné verbatim comme :

- régime Macro
- profil opérateur
- état émotionnel déclaré

**Ce que §9.4 n'établit pas :**

- Il ne généralise pas à "tout contexte de session" ou "tout contexte de marché."
- Il n'autorise pas d'autres formes de contexte par extension ou analogie.
- La question de la volatilité reste distincte — voir §9.5.

---

### §9.5 — Point résiduel : volatilité et données de contexte ambiguës

La volatilité, et plus généralement les données de contexte qui ne relèvent ni clairement du "régime Macro · profil opérateur · état émotionnel déclaré" (formes autorisées, niveau A) ni clairement des "observations de prix · tendance · timing de marché" (formes interdites, niveau A), présentent une ambiguïté non tranchée dans le corpus gelé.

Ce point ne rouvre pas Y-1. Il constitue un point **NON DÉTERMINÉ** à trancher dans MANDAT-2 (règles d'assertion et de non-assertion), lors de la délimitation opérationnelle du périmètre des corrélations assertables en Phase A.

---

## §10 → §n — Réservés

Les sections §10 et suivantes seront ouvertes à l'avancement du lot selon les décisions opérateur.

---

*Footer opérateur — LOT-P2-8 · État : EN COURS · Ouverture : 2026-08-17*
