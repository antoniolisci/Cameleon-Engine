# ROADMAP_V1.md
## Roadmap Officielle V1 — Caméléon Engine
### Document de gouvernance stratégique · Post-GPD V1

---

## Statut

| Champ | Valeur |
|---|---|
| Statut | **GELÉ — document de gouvernance officiel** |
| Date de gel | 2026-07-06 |
| Niveau hiérarchique | N3 — sous GPD V1, au-dessus des ADR et LOT |
| Dépend de | Grand Plan Directeur V1 (d8cbf20) · Architecture Conceptuelle Fondatrice V1 · Doctrines N2 actives |

---

## 1 — Mission

La Roadmap V1 répond à une seule question :

> **Dans quel ordre construire ce qui manque dans Caméléon Engine ?**

Elle ne prescrit pas de délais, ne découpe pas en sprints, ne remplace aucune spécification technique. Elle séquence les programmes structurels dans un ordre architectural correct, fondé exclusivement sur les blancs et dépendances identifiés dans le Grand Plan Directeur V1.

**Ce que la Roadmap V1 n'est pas :**
- Un planning de livraison
- Une liste de fonctionnalités
- Une spécification d'implémentation
- Un engagement de date

---

## 2 — Hiérarchie documentaire officielle

```
Vision (N0)
  └── Doctrines N1-N2 (Language System V1 · Lecture ≠ Action · Memory Doctrine V1 · Pattern Reflection · OI V1 · Gouvernance V1 · Macro Doctrine V1)
        └── Architecture Conceptuelle Fondatrice V1 (N1-N2)
              └── Grand Plan Directeur V1 (N2-N3)  ← cartographie officielle
                    └── Roadmap V1 (N3)  ← CE DOCUMENT
                          └── ADR (N4-N5)
                                └── LOT / Chantiers (N5)
                                      └── Implémentation (N5)
```

**Règle d'autorité :** En cas de conflit entre la Roadmap V1 et un ADR ou LOT, la Roadmap V1 fait autorité. En cas de conflit entre la Roadmap V1 et le GPD V1 ou une Doctrine, la Doctrine ou le GPD V1 fait autorité.

---

## 3 — Invariant de traçabilité (I-TR-01)

> **Toute entrée de la Roadmap V1 doit être reliée à au moins un élément du Grand Plan Directeur V1.**

Un programme sans ancrage GPD V1 n'a pas sa place dans cette Roadmap. L'inventaire de chaque programme ci-dessous inclut sa référence GPD V1 explicite.

---

## 4 — Les 8 programmes structurels

Les 8 programmes sont déduits exclusivement des blancs (GPD V1 — Partie VIII), des dépendances (GPD V1 — Partie IX) et du terrain Roadmap (GPD V1 — Partie XIII). Aucun programme n'est inventé hors GPD V1.

---

### P1 — Fondation Mémoire & Persistance

**Mission :** Poser l'infrastructure de persistance durable qui manque au système actuel — couche de stockage structuré, modèle canonique de trace, provenance obligatoire.

**Référence GPD V1 :** Partie VIII (blanc B1 — infrastructure persistance absente) · Partie IX (dépendance D1 — tout repose sur persistance)

**Livrables :**
1. Modèle canonique de trace (source · date · contexte · famille mémoire)
2. Couche de persistance locale structurée (remplace localStorage ad hoc)
3. Indexation par famille mémoire + date + session
4. Doctrine de provenance — chaque trace conserve source·date·contexte (I-08)

**Critères de clôture :**
- Toute trace persistée contient : famille · source · date · contexte d'origine
- La couche est indépendante de tout moteur applicatif
- L'indexation permet retrouvabilité par famille, par date, par session
- Aucune donnée ne quitte l'appareil sans consentement explicite (I-01)

**Prérequis :** Aucun

**Statut :** Non ouvert
**Impact architectural :** Systémique
**Complexité documentaire :** L

---

### P2 — Doctrine des Sources & Schémas d'Ingestion

**Mission :** Formaliser la doctrine d'ingestion pour les 5 familles sources (S1→S5) — schémas canoniques, règles de normalisation, frontières entre familles.

**Référence GPD V1 :** Partie III (flux sources → pipeline) · Partie VIII (blanc B2 — schémas S1→S5 non formalisés) · ACF V1 (5 sources définies)

**Livrables :**
1. Schéma canonique S1 (Transactionnelle — CSV/PDF/Excel)
2. Schéma canonique S2 (Patrimoniale — blockchain/wallets/staking)
3. Schéma canonique S3 (Visuelle — captures d'écran via GPT Vision) [clôture requiert P2 doctrine]
4. Schéma canonique S4 (Personnelle — notes/journal/réflexions) [clôture requiert P2 doctrine]
5. Schéma canonique S5 (Contextuelle — marché global/événements)
6. Règles de normalisation inter-familles
7. Doctrine des Corrélations — incluant Pattern Reflection Doctrine V1 (interdiction fusion marché · motifs ≠ profils)

**Critères de clôture :**
- Les 5 schémas sources sont formalisés et vérifiés contre I-08 (provenance traçable)
- La Doctrine des Corrélations intègre Pattern Reflection Doctrine V1
- Chaque schéma inclut : source · date · contexte (I-08)
- Language System V1 vérifié pour tout nouveau vocabulaire introduit

**Prérequis :** P1 gelé

**Statut :** Non ouvert
**Impact architectural :** Fort
**Complexité documentaire :** XL

---

### P3 — Moteur d'Ingestion Pipeline

**Mission :** Implémenter le pipeline d'ingestion opérationnel pour les 5 sources — parser, normaliser, persister, indexer.

**Référence GPD V1 :** Partie II (inventaire moteurs) · Partie III (flux pipeline) · Partie IX (dépendance D2 — pipeline bloqué par schémas)

**Livrables :**
1. Parser S1 (Transactionnelle)
2. Parser S2 (Patrimoniale)
3. Parser S3 (Visuelle — GPT Vision) [clôture schéma S3 requiert P2 gelé]
4. Parser S4 (Personnelle) [clôture schéma S4 requiert P2 gelé]
5. Parser S5 (Contextuelle)
6. Module de normalisation canonique
7. Module de persistance structurée (s'appuie sur P1)
8. Module d'indexation (famille · date · session)

**Critères de clôture :**
- Chaque parser produit des traces conformes au modèle canonique P1
- La provenance est systématiquement conservée (I-08)
- Le pipeline peut fonctionner partiellement si une source est absente (I-09 — dégradation gracieuse)
- Clôture des schémas S3 et S4 requiert P2 gelé

**Prérequis :** P1 gelé · P2 peut démarrer sans P2, mais clôture S3/S4 requiert P2 gelé

**Note :** P3 peut démarrer en parallèle de P2 pour S1/S2/S5. La clôture complète de P3 est conditionnelle à P2.

**Statut :** Non ouvert
**Impact architectural :** Fort
**Complexité documentaire :** XL

---

### P4 — Moteur Décisionnel & Snapshots

**Mission :** Formaliser la persistance des décisions de trading — tracer chaque décision avec son contexte complet, séparer décision et apprentissage (SY3 ≠ SY4).

**Référence GPD V1 :** Partie II (moteur décisionnel) · Partie VIII (blanc B4 — SY3 Décisionnelle non structurée) · ACF V1 (I-02 — autorité humaine · SY3/SY4 séparées)

**Livrables :**
1. Schéma de snapshot décisionnel (intention · contexte · décision · outcome)
2. Module de persistance SY3 (Décisionnelle)
3. Séparation formelle SY3 (décision prise) / SY4 (apprentissage extrait)
4. Historisation des snapshots avec traçabilité source (I-08)

**Critères de clôture :**
- Chaque décision persistée contient : intention · contexte moteur · décision choisie · timestamp
- SY3 et SY4 sont deux entités de persistance distinctes — jamais fusionnées
- L'humain reste seul décideur — le système trace, ne génère pas (I-02)
- Language System V1 vérifié pour tout nouveau vocabulaire de décision

**Prérequis :** P1 gelé · P2 avancé (schémas contextuels)

**Statut :** Non ouvert
**Impact architectural :** Moyen
**Complexité documentaire :** M

---

### P5 — Operator Intelligence V2 (Extension OI)

**Mission :** Étendre OI V1 existant avec la couche mémoire durable — Capital · Cadence · Portefeuille → persistance longue durée + évolution temporelle.

**Référence GPD V1 :** Partie II (OI V1 existant) · Partie VIII (blanc B5 — OI sans persistance longue durée) · Partie XI (pilier futur OI V2)

**Livrables :**
1. Extension Capital — historique longue durée + évolution temporelle
2. Extension Cadence — fréquence de trading sur durée étendue
3. Extension Portefeuille — évolution de composition sur la durée
4. Module d'historisation OI (couche L1 — temporelle)
5. Interface de visualisation évolution OI

**Critères de clôture :**
- OI V1 existant préservé sans régression
- L'évolution temporelle de chaque dimension est consultable
- Les données OI historiques respectent I-01 (local-first)
- Language System V1 vérifié pour tout nouveau vocabulaire OI

**Prérequis :** P1 gelé · OI V1 stable (existant — 65471ad)

**Statut :** Non ouvert
**Impact architectural :** Moyen
**Complexité documentaire :** M

---

### P6 — Moteur de Corrélation (L2 Relationnelle)

**Mission :** Implémenter la couche L2 — détection de relations entre familles mémoire. Jamais imposées, toujours détectées. Pattern Reflection Doctrine V1 obligatoire.

**Référence GPD V1 :** Partie IV (moteurs) · Partie VIII (blanc B6 — L2 absente) · Partie XI (pilier futur — corrélation) · ACF V1 (L2 Relationnelle · I-07 · Dictionnaire : Corrélation)

**Livrables :**
1. Doctrine de corrélation opérationnelle (conforme Pattern Reflection Doctrine V1)
2. Moteur de détection de relations inter-familles
3. Seuil de confiance minimal — silence si données insuffisantes (I-04)
4. Schéma de stockage des corrélations détectées
5. Interface de visualisation des relations détectées

**Critères de clôture :**
- Aucune corrélation imposée — uniquement détectées dans les données (I-07)
- Pattern Reflection Doctrine V1 respectée : motifs ≠ profils · interdiction fusion marché absolue
- Seuil de confiance minimal documenté — le système se tait si données insuffisantes (I-04)
- Toute corrélation persistée conserve sa provenance (I-08)
- Language System V1 vérifié

**Risques architecturaux :**
- Violation I-07 (corrélation imposée) — risque élevé si seuil mal calibré
- Violation Pattern Reflection Doctrine V1 (fusion marché) — risque critique pour SY1×S5
- Dérive vers profil figé (I-06) — surveillance obligatoire

**Prérequis :** P1 gelé · P2 gelé · P3 avancé (traces disponibles)

**Statut :** Non ouvert
**Impact architectural :** Systémique
**Complexité documentaire :** XXL

---

### P7 — Moteur Comportemental V2 (Extension SY1)

**Mission :** Étendre le module comportemental existant avec la couche mémoire longue durée — SY1 Comportementale sur une profondeur temporelle étendue.

**Référence GPD V1 :** Partie II (module comportemental existant) · Partie VIII (blanc B7 — SY1 sans mémoire longue durée) · ACF V1 (SY1 Comportementale)

**Livrables :**
1. Extension mémoire longue durée SY1 (au-delà des 50 sessions actuelles)
2. Détection de patterns comportementaux sur fenêtre étendue
3. Historisation de l'évolution du comportement dans le temps (L1 — temporelle)
4. Interface de visualisation de l'évolution comportementale

**Critères de clôture :**
- Module comportemental V1 existant préservé sans régression
- Les patterns sont évolutifs — jamais des profils figés (I-06)
- La profondeur temporelle est configurable et consultable
- Language System V1 vérifié

**Prérequis :** P1 gelé · Module comportemental V1 stable (existant)

**Statut :** Non ouvert
**Impact architectural :** Moyen
**Complexité documentaire :** L

---

### P8 — Moteur de Synthèse & Intelligence (L3 Cognitive)

**Mission :** Implémenter la couche L3 — transformer les corrélations détectées en insights utilisables. SY4 D'apprentissage. Silence structurel (I-04) systématique.

**Référence GPD V1 :** Partie IV (moteurs) · Partie VIII (blanc B8 — L3 absente) · Partie XI (pilier futur — intelligence) · ACF V1 (L3 Cognitive · SY4 D'apprentissage · Dictionnaire : Intelligence · Synthèse · Leçon)

**Livrables :**
1. Doctrine de synthèse (conditions de production d'insight — seuil mémoire minimal)
2. Moteur d'extraction SY4 (D'apprentissage — boucles complètes : intention→décision→conséquence→leçon)
3. Module de scoring comportemental global (croise SY1 + SY3 + SY4)
4. Interface d'insight — présentation adaptée au contexte (I-11 — Présenter)
5. Silence structurel documenté — conditions d'activation du silence (I-04)

**Critères de clôture :**
- SY4 liée à sa source de décision (I-08) — chaque leçon traçable jusqu'à la boucle d'origine
- Aucune recommandation d'action automatique (I-02 · I-03 — Lecture ≠ Action)
- Silence structurel activé si mémoire insuffisante — seuil documenté (I-04)
- Aucun profil figé produit — uniquement des patterns évolutifs (I-06)
- Language System V1 vérifié — le vocabulaire "insight" et "leçon" conforme au Dictionnaire ACF V1

**Prérequis :** P1 gelé · P2 gelé · P3 avancé · P4 avancé · P6 gelé · P7 avancé

**Statut :** Non ouvert
**Impact architectural :** Systémique
**Complexité documentaire :** XXL

---

## 5 — Les 4 grandes phases

### Phase A — Fondations
**Objectif :** Poser l'infrastructure sans laquelle rien d'autre n'est possible.

| Programme | Rôle dans la phase |
|---|---|
| P1 — Fondation Mémoire & Persistance | Prérequis absolu de toute la Roadmap |
| P2 — Doctrine des Sources | Schémas d'ingestion sans lesquels le pipeline est impossible |

**Condition de sortie (T1) :** P1 gelé ET P2 gelé (les 5 schémas sources formalisés + Doctrine des Corrélations intégrée)

---

### Phase B — Activation mémorielle
**Objectif :** Rendre le système capable de recevoir, parser et persister les traces des 5 familles sources.

| Programme | Rôle dans la phase |
|---|---|
| P3 — Moteur d'Ingestion Pipeline | Pipeline opérationnel S1→S5 |
| P4 — Moteur Décisionnel & Snapshots | Persistance des décisions — SY3 formalisée |
| P5 — Operator Intelligence V2 | Extension OI V1 avec mémoire longue durée |
| P7 — Moteur Comportemental V2 | Extension SY1 sur fenêtre temporelle étendue |

**Note :** P3/P4/P5/P7 peuvent être ouverts en parallèle, dans le respect de leurs prérequis respectifs.

**Condition de sortie (T2) :** P5 clôturé ET P4 avancé ET P7 structurel opérationnel

---

### Phase C — Intelligence relationnelle
**Objectif :** Activer la couche L2 — détecter les relations entre familles mémoire.

| Programme | Rôle dans la phase |
|---|---|
| P6 — Moteur de Corrélation (L2) | Corrélation inter-familles conforme Pattern Reflection Doctrine V1 |

**Condition de sortie (T3) :** P6 clôturé ET P7 clôturé ET P4 clôturé

---

### Phase D — Synthèse
**Objectif :** Activer la couche L3 — transformer les corrélations en intelligence utilisable. Clôture du cycle.

| Programme | Rôle dans la phase |
|---|---|
| P8 — Moteur de Synthèse & Intelligence (L3) | Intelligence cognitive · SY4 · insights · silence structurel |

**Condition de sortie :** P8 gelé → système complet selon l'Architecture Conceptuelle Fondatrice V1

---

## 6 — Schéma des grandes phases

```
PHASE A — Fondations
  P1 ──────────────────────────────────────────────────────────
  P2 ──────────────────────────────────────────────────────────
                              │
                              ▼ T1 : P1 gelé · P2 gelé

PHASE B — Activation mémorielle
  P3 ──────────────────────────
  P4 ──────────────────────────
  P5 ──────────────────────────
  P7 ──────────────────────────
                              │
                              ▼ T2 : P5 clôturé · P4 avancé · P7 struct. opérationnel

PHASE C — Intelligence relationnelle
  P6 ──────────────────────────
                              │
                              ▼ T3 : P6 clôturé · P7 clôturé · P4 clôturé

PHASE D — Synthèse
  P8 ──────────────────────────
                              │
                              ▼ Système complet (ACF V1 satisfaite)
```

---

## 7 — Graphe de dépendances (15 arêtes)

### Arêtes directes validées

| # | De | Vers | Type |
|---|---|---|---|
| 1 | P1 | P2 | Prérequis strict |
| 2 | P1 | P3 | Prérequis strict |
| 3 | P1 | P4 | Prérequis strict |
| 4 | P1 | P5 | Prérequis strict |
| 5 | P1 | P6 | Prérequis strict |
| 6 | P1 | P7 | Prérequis strict |
| 7 | P1 | P8 | Prérequis strict |
| 8 | P2 | P3 | Prérequis strict (clôture S3/S4) |
| 9 | P2 | P6 | Prérequis strict |
| 10 | P2 | P8 | Prérequis strict |
| 11 | P3 | P6 | Prérequis partiel (traces disponibles) |
| 12 | P3 | P8 | Prérequis partiel |
| 13 | P4 | P8 | Prérequis partiel |
| 14 | P6 | P8 | Prérequis strict |
| 15 | P7 | P8 | Prérequis partiel |

### Arête recommandée

| # | De | Vers | Type |
|---|---|---|---|
| R1 | P5 | P8 | Recommandée (OI enrichit les insights SY4) |

**Propriété du graphe :** DAG strict — aucun cycle détecté. Le graphe est orienté, acyclique, cohérent avec les 4 phases.

---

## 8 — Synthèses émergentes (SY2 · SY3)

SY2 (Identitaire) et SY3 (Décisionnelle) n'ont pas de programme autonome dans cette Roadmap. Elles sont des synthèses émergentes — produites par l'accumulation et le croisement des programmes existants.

### SY2 — Identitaire (émergente)
**Constituée par :** OI V1 (existant) + SY1 étendue (P7) + corrélations L2 (P6) + patterns comportementaux (P7) + insights L3 (P8)

SY2 n'est pas une étiquette figée posée sur l'utilisateur. Elle émerge de l'observation de patterns stables dans le temps, conformément à I-06 (profil interdit) et à la définition du Dictionnaire ACF V1.

### SY3 — Décisionnelle (émergente)
**Constituée par :** Snapshots décisionnels (P4) + OI V1 (existant) + contexte moteur (P4) + apprentissages SY4 (P8)

SY3 trace ce qui a été choisi. SY4 extrait ce que cela a enseigné. Les deux familles ont des cycles de vie différents — jamais fusionnées (ACF V1 — Q1 validée).

---

## 9 — Règle transversale Language System V1

> **Tout programme introduisant un nouveau vocabulaire utilisateur doit vérifier et étendre si nécessaire la conformité Language System V1.**

Cette règle s'applique transversalement à tous les programmes (P1→P8), sans être un prérequis bloquant à l'ouverture d'un programme.

**Application :** Chaque programme inclut dans ses critères de clôture la vérification LS V1 pour les nouveaux termes introduits.

---

## 10 — Principes de gouvernance de la Roadmap V1

1. **Traçabilité obligatoire (I-TR-01)** — tout programme est ancré dans le GPD V1. Pas d'ancrage = pas de place dans cette Roadmap.

2. **Séquencement architectural** — l'ordre est dicté par les dépendances, jamais par des préférences ou des urgences perçues.

3. **Parallélisme contrôlé** — des programmes peuvent avancer en parallèle dans la Phase B, dans le strict respect de leurs prérequis respectifs.

4. **Dégradation gracieuse (I-09)** — le système peut avancer avec des prérequis partiels (ex. P3 peut démarrer sans P2 complet), mais ne peut pas clôturer sans les conditions définies.

5. **Doctrine des Corrélations** — Pattern Reflection Doctrine V1 s'applique à P2 et P6 sans exception.

6. **Silence structurel (I-04)** — P8 doit implémenter un seuil de confiance minimal documenté. En dessous de ce seuil, le système se tait.

7. **Autorité humaine (I-02)** — aucun programme ne peut générer une action automatique. P8 produit des insights, pas des décisions.

8. **Lecture ≠ Action (I-03)** — comprendre une situation ne génère pas automatiquement une recommandation. Ce principe s'applique à P6 et P8 en particulier.

9. **Local-first (I-01)** — aucune donnée ne quitte l'appareil sans consentement explicite. S'applique à P1 (infrastructure) et à tous les programmes en aval.

10. **Valeur temporelle (I-10)** — l'architecture est conçue pour que la valeur du système croisse avec la profondeur mémorielle. Le séquencement A→B→C→D reflète cette logique.

---

## 11 — Certification

### Processus de construction

| Phase | Description | Verdict |
|---|---|---|
| Phase 1 | Audit des 11 roadmaps existantes | Aucune réutilisable |
| Phase 2 | Définition du rôle + hiérarchie documentaire | Validée |
| Phase 3 | Identification des 8 programmes depuis GPD V1 | Validée |
| Phase 3.5 | Audit architectural (8 dimensions) | CAS B → C1/C2/C3 intégrées |
| Phase 4 | Décomposition détaillée + 3 champs de pilotage | Validée |
| Phase 5 | Construction des 4 grandes phases A→B→C→D | Validée |
| Phase 5.5 | Audit des transitions (3 transitions + audit transversal) | CAS B → T1/T2/T3 + R1 corrigés |
| Phase 6 | Vérification graphe de dépendances (15 arêtes) | CAS A |
| Phase 7 | Vérification doctrinale complète (10 invariants + 5 doctrines actives) | CAS B → C1/C2/C3 + R1/R2/R3 intégrées |
| Phase 8 | Audit de cohérence globale | CAS A |
| Phase 9 | Certification finale | CAS A — accordée sans réserve |
| Phase 10 | Gel officiel | CE DOCUMENT |

### Corrections intégrées

| Ref | Correction | Origine |
|---|---|---|
| C1 (3.5) | SY2/SY3 : synthèses émergentes, pas de programme autonome | Phase 3.5 — audit structural |
| C2 (3.5) | LS V1 : règle transversale, pas prérequis bloquant P2 | Phase 3.5 — audit structural |
| C3 (3.5) | P3 peut démarrer sans P2 mais clôture S3/S4 requiert P2 | Phase 3.5 — audit structural |
| T1 (5.5) | "P2 gelé" ajouté à la condition de sortie Phase A | Phase 5.5 — audit transitions |
| T2 (5.5) | T2 reformulée : P5 clôturé · P4 avancé · P7 struct. opérationnel | Phase 5.5 — audit transitions |
| T3 (5.5) | P4 clôturé ajouté à T3 | Phase 5.5 — audit transitions |
| R1 (5.5) | Arête P5→P8 qualifiée "recommandée" (pas stricte) | Phase 5.5 — audit transitions |
| C1 (7) | Pattern Reflection Doctrine V1 intégrée P2 (livrable 7) et P6 (risques) | Phase 7 — audit doctrinal |
| C2 (7) | I-04 Silence structurel ajouté critères de clôture P6 | Phase 7 — audit doctrinal |
| C3 (7) | I-08 Provenance traçable ajouté aux critères P3 et P8 | Phase 7 — audit doctrinal |
| R2 (7) | Arête R1 (P5→P8) confirmée "recommandée" + justification | Phase 7 — audit doctrinal |
| R3 (7) | SY4 explicitement liée à sa source de décision dans P8 (I-08) | Phase 7 — audit doctrinal |

### Verdict

**CAS A — CERTIFICATION ACCORDÉE SANS RÉSERVE**

La Roadmap V1 est cohérente avec le Grand Plan Directeur V1, l'Architecture Conceptuelle Fondatrice V1, et les Doctrines N2 actives. Le graphe de dépendances est acyclique. Les 10 invariants sont couverts. Les 4 grandes phases sont correctement séquencées. Aucune réserve documentaire.

---

## 12 — Historique documentaire

| Version | Date | Statut |
|---|---|---|
| Roadmap V1 | 2026-07-06 | **Gel officiel** |
| Roadmap V2 | — | En attente — conditions définies dans GEL_ROADMAP_V1.md |

---

*Document produit à l'issue du cycle de gouvernance documentaire complet — 10 phases · audit · certification — Caméléon Engine, 2026-07-06.*
