# Point d'arrêt — 2026-05-29

**Type :** Snapshot d'état projet · Non prescriptif
**Branche :** main · Commit de référence : `5b9f306`

---

## État du projet à cette date

### Ce qui est terminé

| Chantier | Statut | Commit / Référence |
|---|---|---|
| Moteur Narratif Adaptatif V1 — Doctrine | ✅ Terminé | docs/ux/narrative-engine-status-v1.md |
| Moteur Narratif V1.1 — Audit critique | ✅ Terminé | Notion — Moteur Narratif Adaptatif |
| État officiel V1 — Suivi validé | ✅ Terminé | `9e214de` |
| Audit visuel cockpit — 7 états | ✅ Terminé | CSS-01 documenté |
| Motion System V1 — Documentation | ✅ Terminé | docs/architecture/ |
| MOTION_DEBT_REGISTER — 6 dettes | ✅ Terminé | Notion — Motion System V1 |
| MD-01 — Liens brisés HTML corrigés | ✅ Résolu | `bc84bfb` |
| PDF Intelligence System V1 — Doctrine | ✅ Terminé | `1493617` · docs/architecture/pdf-intelligence-system-v1.md |
| CLAUDE.md — Persistance comportementale | ✅ Corrigé | `1493617` · DOC-CM / AUD-C1 soldés |
| Inventaire global des dettes | ✅ Produit | 45 dettes · 8 familles · mémoire projet |
| Doctrine — La confiance précède l'importation | ✅ Terminé | `5b9f306` · docs/product/doctrine-confiance-importation-v1.md |

---

## Phase actuelle

**Phase : Observation terrain**

Le projet n'est pas en phase de construction active.

Le corpus doctrinal est posé. L'architecture V2 est implémentée jusqu'à la Phase 2 (T3 cockpit actif). Les systèmes narratif, motion et PDF sont documentés. Les dettes sont recensées et priorisées. La relation utilisateur/données est maintenant formalisée : la confiance précède l'importation.

Ce qui manque ne peut pas être produit par du code ou de la doctrine supplémentaire. Ce qui manque, c'est l'usage réel.

> Le terrain doit maintenant produire des informations que la doctrine seule ne peut plus produire.

---

## Chantiers volontairement fermés

| Chantier | Raison de la fermeture |
|---|---|
| Narrative V1.2 — Correction collisions dictionnaire | Attente retour terrain cockpit réel |
| Motion V1.2 — Mapping état→vidéo | Attente stabilisation V2 + session terrain Motion |
| PDF V1 — Implémentation | Attente signal terrain réel (demande import fiscal PDF) |
| V2 Phase 3 — Activation T1/T2/T4 cockpit | Attente données V0 terrain (≥50 sessions, ≥10 opérateurs) |
| V2 segmentation temporelle | Attente correction LS-1→LS-4 avant toute construction |
| Constellium | Archivé — conditions d'activation non réunies |

Ces fermetures sont des décisions, pas des reports. Chacune a une condition de déclenchement explicite.

---

## Prochain signal attendu

Un seul signal compte maintenant : **l'utilisation réelle du cockpit**.

- Le cockpit est prêt. V2 T3 est actif. Le moteur narratif est branché. Le pipeline comportemental est stable.
- Les collisions du dictionnaire narratif n'empêchent pas l'usage — elles le dégradent légèrement sur 4 états.
- Les 18 vidéos en réserve n'empêchent pas l'usage — elles attendent leur mapping.
- Les 45 dettes recensées ne bloquent rien dans l'état actuel.

Ce que le terrain produira :
- Confirmation ou nuance des collisions narratives observées en audit visuel
- Signal d'ouverture (ou non) de Narrative V1.2
- Données de calibration V0 pour T1/T2/T4
- Éventuellement : première demande réelle d'import PDF

---

## Dettes actives à surveiller (non urgentes)

| ID | Dette | Priorité | Condition d'ouverture |
|---|---|---|---|
| NAR-C1 | Trancher Mantra absolu vs modulable | Haute | Avant V1.2, pas pendant |
| V2-T1T4 | MdS/QdR/DMU absents payload V1 | Haute | Prérequis Phase 3 |
| AUD-T3 | Plancher ~15 sur V2 segmentation | Haute | Avant toute V2 segmentation |
| DOC-BHV-01 | behavior/README.md formulations obsolètes | Basse | Prochain chantier documentation behavior |

---

## Carte de maturité — audit 2026-05-29

Échelle : 0 = idée · 1 = doctrine · 2 = architecture · 3 = implémentation · 4 = validation terrain · 5 = stable

| Domaine | Maturité | Dette principale | Prochain signal |
|---|---|---|---|
| Architecture générale | 4 | AUD-A1 — "profondeur" opérationnellement indéfinie | Surveillance dérive feature uniquement |
| Behavior | 4 | AUD-T3 — plancher ~15 déterministe bloque V2 segmentation | ≥20 opérateurs terrain (protocole V0) |
| V2 | 3 | V2-T1T4 — MdS/QdR/DMU absents payload V1 (prérequis Phase 3) | ≥50 sessions, ≥10 opérateurs |
| Narrative | 3 | NAR-C1 — Mantra absolu vs modulable non tranché | Retour terrain cockpit réel |
| Documentation | 3 | DOC-BHV-01 — behavior/README.md persistance incorrecte | Prochain chantier documentation behavior |
| Motion | 2 | MD-05 — 18 vidéos réserve non connectées | Stabilisation V2 + décision mapping état→vidéo |
| PDF | 2 | PDF-06 — Confidentialité et stockage localStorage | Première demande terrain réelle import PDF |

### Incohérences identifiées à surveiller

| ID | Nature | Impact |
|---|---|---|
| C4 | Cap FIFO 50 sessions vs mémoire comportementale V2 | Collision structurelle — insoluble sans backend |
| T1 | KPI rétention 12 mois immesurable sans backend | Doctrine s'engage sur ce qu'elle ne peut pas lire |
| AUD-A1 | "Profondeur" (Loi 3) jamais définie opérationnellement | Exploitable pour justifier n'importe quelle feature |
| A3 | Hiérarchie manifeste vs doctrine non établie | Aucun mécanisme de résolution en cas de conflit |

### Documents partiellement obsolètes (non bloquants)

- `docs/plan-v2.md` — supplanté par les checklists Phase 0→4, non archivé
- `docs/validation-terrain-v1-v2-v3.md` — supplanté par docs/validation/, non archivé
- `docs/architecture-technique-cameleon-engine.md` §10 — "in-memory only" faux depuis V4.2

---

## Règle de garde

> **"Ne pas ouvrir un chantier parce qu'il existe. L'ouvrir uniquement lorsqu'un signal réel justifie son existence."**
