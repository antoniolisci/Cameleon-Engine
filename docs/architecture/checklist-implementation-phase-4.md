# Checklist d'implémentation — Phase 4 : Infrastructure de calibration et pré-production V2

## Métadonnées

**Statut** : Checklist opérationnelle · Phase 4 uniquement
**Version** : 1.0 — 2026-05-24
**Prérequis** : Phase 3 entièrement validée (critères de fin Phase 3 tous verts)
**Dépendances** :
- `docs/architecture/checklist-implementation-phase-3.md` — Phase 3 référence
- `docs/architecture/instrumentation-debug-calibration.md` — CalibrationSnapshot spec
- `docs/architecture/calibration-terrain.md` — protocole V0, seuils post-Phase 3
- `docs/architecture/doctrine-silence-structurel.md` — invariant absolu
- `docs/architecture/strategie-implementation-v2.md` — V2_CALIBRATION Phase 6 spec

**Usage :** Ce document active V2_CALIBRATION et finalise l'infrastructure de collecte.
Ne pas démarrer Phase 4 sans Phase 3 validée et décision produit explicite.

---

## Objectif de Phase 4

Phase 4 active `V2_CALIBRATION: true` — le septième flag V2, le seul resté
inactif après Phase 3. Elle déploie l'infrastructure de collecte CalibrationSnapshot
pour finaliser la calibration des seuils et préparer le Go/No-Go production.

Phase 4 n'ajoute aucune fonctionnalité visible dans le cockpit.
Elle ajoute une couche de collecte invisible, in-memory, activée uniquement
via le Debug panel — conformément au contrat D-DBG-01–05.

À l'issue de Phase 4 :
- `CalibrationSnapshot` collecté in-memory à chaque soumission
- Export JSON ponctuel activé depuis le Debug panel (Option B)
- Données terrain agrégées manuellement pour validation finale seuils
- Sur-suppression et fatigue cognitive validées sur sessions longues
- Production readiness documentée et décision Go/No-Go formalisée

**Ce document ne couvre pas :**
- L'escalade/désescalade de tensions (D-HIE-02/03) — dette future
- Un backend de collecte, une télémétrie SaaS, ou un dashboard analytique
- Une persistance multi-session automatique des CalibrationSnapshots
- Une modification de la couche cockpit ou de `buildPayload()`

**Condition de démarrage :** Phase 3 entièrement validée (5 tableaux verts) ET
décision produit explicite de déployer l'instrumentation de calibration.

---

## Prérequis — vérifications avant Phase 4

**Ne pas démarrer Phase 4 si l'un de ces items est rouge.**

### Prérequis Phase 3

- [ ] Critères de fin Phase 3 tous verts (5 tableaux)
- [ ] Chaîne cockpit complète : T3 + T1 + T2 + T4 actifs
- [ ] Fréquence totale cockpit ≤ 40% confirmée sur 20 sessions
- [ ] Seuils T1/T2/T4 calibrés et documentés dans `calibration-terrain.md`
- [ ] Aucun signal d'arrêt Phase 3 actif (S3-01 à S3-06)

### Prérequis doctrine

- [ ] Doctrine silence structurel invariante — 6/6 invariants verts Phase 3
- [ ] `active_exposed ≤ 1` confirmé systématiquement Phase 3
- [ ] Aucune logique punitive dans le cockpit

### Prérequis connaissance

Avant d'activer Phase 4, relire intégralement :
- [ ] `docs/architecture/instrumentation-debug-calibration.md` — contrat CalibrationSnapshot, Option B, D-DBG-01–05
- [ ] `docs/architecture/calibration-terrain.md` — état actuel des seuils post-Phase 3

### Prérequis git

```bash
git status
```
- [ ] Working tree clean
- [ ] Hash du dernier commit noté : `________________`

### Prérequis philosophique

Phase 4 introduit une couche de collecte. Le risque principal n'est pas technique :
c'est la dérive vers un système d'observation de l'opérateur.

**La règle cardinale Phase 4 :** le CalibrationSnapshot collecte des états moteur,
pas des données comportementales d'usage. Il sert à calibrer des seuils internes,
pas à analyser l'opérateur. Si une donnée collectée décrit l'opérateur plutôt que
le moteur, elle ne doit pas figurer dans le snapshot.

---

## Philosophie — calibration sans intrusion

### Ce que "calibration sans intrusion" signifie

La calibration V2 doit rester invisible pour l'opérateur. Ni la collecte, ni
l'export, ni l'analyse ne doivent modifier l'expérience de session.

**Trois interdits absolus Phase 4 :**

1. **Pas de télémétrie automatique.** Aucun envoi réseau, aucune API externe,
   aucun enregistrement automatique en localStorage. L'export est ponctuel,
   déclenché manuellement depuis le Debug panel.

2. **Pas de collecte comportementale.** Le CalibrationSnapshot enregistre les
   états du moteur (tensionMap, HierarchyResult, AttentionResult, seuils atteints),
   pas les actions de l'opérateur (ce qu'il a choisi, à quelle vitesse, avec quelle hésitation).

3. **Pas de pollution cockpit.** La présence du CalibrationSnapshot ne modifie
   rien dans l'interface opérateur — pas d'indicateur "calibration active", pas
   de badge, pas de notification.

### Ce que le CalibrationSnapshot contient (et ne contient pas)

| Contenu autorisé | Contenu interdit |
|---|---|
| tensionMap du cycle | Timestamp d'action opérateur |
| HierarchyResult (winner, absorbed) | Durée de session |
| AttentionResult (should_expose, level) | Nombre de soumissions par heure |
| ExpositionResult (tension_id, message) | Profil de l'opérateur |
| Seuils actifs D-COH-01 | Identifiant opérateur |
| Flags V2 actifs au moment du snapshot | Toute donnée personnellement identifiable |

### Cycle de vie du CalibrationSnapshot

```
Soumission moteur
  → runV2() produit les 4 résultats
  → calibration.js construit le CalibrationSnapshot in-memory
  → Stocké dans un tableau en mémoire (max 50 entrées, FIFO)
  → Export manuel via bouton Debug → JSON/CSV
  → Analyse externe manuelle
  → Ajustement seuils dans coherence.js
```

**Jamais de persistence automatique en localStorage.**
**Jamais d'envoi réseau.**
**L'export efface le tableau en mémoire (option configurable).**

---

## Snapshots de référence Phase 4

Reprendre les snapshots Phase 3 (A–M) comme référence de non-régression.
Ajouter 3 snapshots spécifiques Phase 4.

### Snapshot N — CalibrationSnapshot collecté (cycle normal)

Inputs : Snapshot G (T3 cockpit attendu) avec V2_CALIBRATION actif.
Résultat attendu :
- Cockpit : identique Phase 3 (aucun changement visible)
- Debug panel : tableau CalibrationSnapshot contient ≥ 1 entrée
- Aucun envoi réseau, aucune écriture localStorage

Vérifier en Debug :
```javascript
// Après soumission Snapshot G
window._v2CalibrationBuffer?.length >= 1
// ou l'équivalent selon l'implémentation calibration.js
```

### Snapshot O — Export JSON déclenché manuellement

Depuis le Debug panel, déclencher l'export après 5 soumissions variées.
Résultat attendu :
- Fichier JSON téléchargé ou affiché (selon Option B)
- 5 entrées CalibrationSnapshot dans l'export
- Aucune donnée personnellement identifiable
- Cockpit : aucun changement visible pendant l'export

### Snapshot P — Tampon saturé (50 entrées FIFO)

Soumettre 55 fois pour saturer le tampon.
Résultat attendu :
- Tampon contient 50 entrées (pas 55 — FIFO actif)
- Les 5 premières entrées ont été écrasées
- Aucune erreur mémoire, aucune dégradation UI

### Checklist snapshots Phase 4

- [ ] Snapshots A–M Phase 3 disponibles (non-régression)
- [ ] Snapshot N : CalibrationSnapshot collecté, cockpit inchangé
- [ ] Snapshot O : export manuel fonctionnel, données correctes
- [ ] Snapshot P : tampon FIFO 50 entrées validé

---

## Ordre d'exécution — Phase 4

```
T4-01 → T4-02 → T4-03 → T4-04 → T4-05 → T4-06 → T4-07 → T4-08
  ↓        ↓        ↓        ↓        ↓        ↓        ↓        ↓
activer  export  collecte  valid.  valid.   valid.  valid.  agréga-
V2_CALI- JSON    sessions  données  suppres- over-   fatigue tion
BRATION  debug   longues   calibra- silenc.  suppres cogni-  manuelle
                           tion     réelle   sion    tive
```

**Ordre contraint :**
- T4-01 avant T4-02 : le flag doit être actif avant de tester l'export
- T4-02 avant T4-03 : l'export doit être fonctionnel avant les sessions longues
- T4-04 à T4-08 : validations parallélisables si les données sont disponibles

**Résumé par objectif :**

| Objectif | Tâches | Sortie |
|---|---|---|
| Infrastructure | T4-01 → T4-02 | CalibrationSnapshot actif, export fonctionnel |
| Collecte terrain | T4-03 → T4-04 | Dataset sessions longues validé |
| Validation qualité | T4-05 → T4-07 | Suppression/over-suppression/fatigue validées |
| Analyse | T4-08 | Agrégation manuelle, seuils révisés |

---

## T4-01 — Activation CalibrationSnapshot (V2_CALIBRATION: true)

**Fichier à modifier :** `src/js/v2/flags.js`
**Lire avant d'activer :** `docs/architecture/instrumentation-debug-calibration.md` intégralement.

### Modification `flags.js`

```javascript
V2_CALIBRATION: true,   // ← true (était false) — collecte CalibrationSnapshot active
```

C'est le seul changement de ce flag dans toute la Phase 4.

### Vérification immédiate

Après activation, recharger l'application. **Avant** toute soumission :
- [ ] Cockpit : **identique** Phase 3 — aucun élément visuel ajouté
- [ ] Console : zéro erreur
- [ ] localStorage : aucune nouvelle clé créée

### Activation du module calibration dans `pipeline-v2.js`

Décommenter le bloc Phase 6 (calibration) dans `pipeline-v2.js` :

```javascript
import { buildCalibrationSnapshot } from './calibration.js';

// Dans runV2() — après le retour final :
if (V2_FLAGS.V2_CALIBRATION) {
  const snap = buildCalibrationSnapshot({ tensionMap, hierarchyResult, attentionResult, expositionResult });
  _calibrationBuffer.push(snap);
  if (_calibrationBuffer.length > 50) _calibrationBuffer.shift(); // FIFO
}
```

**Note :** `_calibrationBuffer` est une variable module-level dans `pipeline-v2.js`,
exactement comme `_attentionState`. Jamais exportée vers le cockpit. Jamais en localStorage.

### Vérification Debug

Soumettre Snapshot N (T3 cockpit attendu) :
- [ ] `window.__v2Buffer?.length >= 1` (ou équivalent selon implémentation) visible en Debug
- [ ] `payload.v2` intact — CalibrationSnapshot n'altère pas le payload
- [ ] Cockpit : message T3 identique Phase 3

### Commit

```bash
git add src/js/v2/flags.js src/js/v2/pipeline-v2.js src/js/v2/calibration.js
git commit -m "feat(v2/calibration): activate CalibrationSnapshot collection"
```

### Checklist T4-01

- [ ] `V2_CALIBRATION: true` dans `flags.js`
- [ ] Bloc calibration décommenté dans `pipeline-v2.js`
- [ ] `calibration.js` buildCalibrationSnapshot() implémenté
- [ ] Snapshot N : buffer contient ≥ 1 entrée après soumission
- [ ] Cockpit : inchangé
- [ ] localStorage : aucune nouvelle clé
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T4-02 — Export JSON ponctuel

**Prérequis :** T4-01 validé — `_calibrationBuffer` actif en mémoire.
**Objectif :** permettre l'export manuel du buffer depuis le Debug panel (Option B).

### Option B — export ponctuel depuis Debug panel

L'export doit être déclenché par un bouton explicite dans le Debug panel.
Il ne doit jamais être automatique, jamais déclenché sans action humaine.

```javascript
// Dans render.js — section Debug panel (chirurgical)
// Ajouter un bouton "Exporter calibration" visible uniquement en Debug
// Au clic : generateCalibrationExport()
```

**Format de sortie :** JSON uniquement (CSV optionnel si implémenté dans calibration.js).

### Structure d'un export CalibrationSnapshot

```json
{
  "exportedAt": "ISO8601 timestamp",
  "version": "v2-phase4",
  "count": 15,
  "snapshots": [
    {
      "cycle": 1,
      "tensionMap": { "tensions": [...], "active_exposed": 1 },
      "hierarchyResult": { "winner": {...}, "absorbed": [...] },
      "attentionResult": { "should_expose": true, "attention_level": "normal" },
      "expositionResult": { "tension_id": "T3", "message": "..." },
      "flagsAtSnapshot": { "V2_COHERENCE": true, ... },
      "thresholdsAtSnapshot": { "T1_X": 65, "T1_Y": 2, ... }
    }
  ]
}
```

**Aucun champ :** timestamp de l'action opérateur, durée de réflexion,
identifiant utilisateur, données de navigation, inputs formulaire bruts.

### Vérification export — Snapshot O

Soumettre 5 sessions variées (G, J, L, A, K), puis déclencher l'export :
- [ ] 5 entrées dans le JSON exporté
- [ ] Chaque entrée contient tensionMap, hierarchyResult, attentionResult, expositionResult
- [ ] Aucun champ personnellement identifiable
- [ ] Cockpit : inchangé pendant et après l'export

### Vérification tampon FIFO — Snapshot P

Soumettre 55 sessions identiques, puis exporter :
- [ ] Export contient exactement 50 entrées (pas 55)
- [ ] Les 5 premières ont été écrasées (FIFO confirmé)
- [ ] Aucune erreur mémoire

### Commit

```bash
git add src/js/render.js src/js/v2/calibration.js
git commit -m "feat(v2/calibration): add manual JSON export from Debug panel"
```

### Checklist T4-02

- [ ] Bouton export visible dans Debug panel uniquement
- [ ] Export JSON structuré conforme à la spec
- [ ] Aucun champ personnellement identifiable dans l'export
- [ ] FIFO 50 entrées confirmé (Snapshot P)
- [ ] Export ne modifie pas le cockpit
- [ ] Console : zéro erreur
- [ ] Commit effectué

---

## T4-03 — Protocole collecte sessions longues

**Prérequis :** T4-02 validé — export fonctionnel.
**Objectif :** constituer un dataset de calibration sur sessions longues.

### Pourquoi les sessions longues sont nécessaires

Les sessions courtes (< 10 soumissions) ne révèlent pas :
- Le déclin progressif de l'attention (DECLINE_FAST/DECLINE_FULL)
- La recovery de la fenêtre glissante après 20 min d'inactivité
- Les coexistences multi-tensions organiques (non construites)
- La starvation réelle sur sessions représentatives

### Protocole sessions longues Phase 4

**Cible :** 3 sessions longues par opérateur · ≥ 30 soumissions par session · 5 opérateurs minimum.

| Opérateur | Sessions | Soumissions totales | Export effectué ? |
|---|---|---|---|
| 1 | 3 | ≥ 90 | ☐ |
| 2 | 3 | ≥ 90 | ☐ |
| 3 | 3 | ≥ 90 | ☐ |
| 4 | 3 | ≥ 90 | ☐ |
| 5 | 3 | ≥ 90 | ☐ |

**Total cible :** 450 CalibrationSnapshots.

### Contraintes de collecte

- Chaque export est déclenché manuellement à la fin de chaque session longue
- L'opérateur ne sait pas que la calibration est active (comportement authentique)
- L'export est renommé selon le schéma : `calib_op{N}_session{M}_{YYYYMMDD}.json`
- Les fichiers sont stockés localement par l'implémenteur (pas en ligne)

### Checklist T4-03

- [ ] 5 opérateurs × 3 sessions longues planifiés
- [ ] ≥ 450 CalibrationSnapshots collectés
- [ ] Exports nommés et organisés localement
- [ ] Aucun opérateur informé de la collecte (comportement authentique)
- [ ] FIFO validé sur toutes les sessions (≤ 50 entrées par export)

---

## T4-04 — Validation données de calibration

**Prérequis :** T4-03 complété — dataset ≥ 450 snapshots disponibles.
**Objectif :** vérifier que les données collectées sont exploitables pour la calibration.

### Critères de qualité des données

| Critère | Seuil | Mesure |
|---|---|---|
| Complétude | ≥ 95% des snapshots contiennent tous les champs | Compter les entrées partielles |
| Diversité tension | ≥ 4 types de winner observés (T3/T1/T2/T4) | Compter les tension_id distincts |
| Diversité attention | Les 3 niveaux observés (normal/elevated/high) | Compter les attention_level distincts |
| Représentativité | ≥ 20% de snapshots sans tension (silence nominal) | Compter tensionMap.tensions.length === 0 |
| FIFO | Aucun export > 50 entrées | Vérifier count ≤ 50 par export |

### Analyse de complétude

```bash
# Script d'analyse manuelle (adapté selon le format JSON exporté)
# Compter les snapshots avec tensionMap non null :
# Compter les snapshots avec expositionResult non null :
# Distribution des tension_id exposés :
```

- [ ] Complétude ≥ 95%
- [ ] ≥ 4 tension_id distincts dans le dataset
- [ ] 3 attention_level distincts observés
- [ ] ≥ 20% de cycles silence (aucune tension)
- [ ] Aucun export individuel > 50 entrées

### Signal de dataset insuffisant

Si l'un des critères n'est pas atteint :
- Complétude < 95% : vérifier l'implémentation `buildCalibrationSnapshot()`
- T4 jamais winner dans 450 snapshots : seuils T4 probablement trop restrictifs après Phase 3
- Aucun cycle silence : conditions terrain trop homogènes — demander aux opérateurs de varier les inputs

### Checklist T4-04

- [ ] Dataset analysé manuellement (ou avec script)
- [ ] Critères de qualité vérifiés
- [ ] Dataset jugé exploitable pour calibration (ou collecte complémentaire déclenchée)

---

## T4-05 — Validation suppression silencieuse réelle

**Objectif :** confirmer sur le dataset réel que la suppression silencieuse fonctionne
comme prévu — sans sur-suppression pathologique.

### Définition

**Suppression silencieuse réelle :** `attentionResult.should_expose === false`
avec cockpit vide. Normal, prévu, attendu.

**Sur-suppression pathologique :** suppression d'un winner réellement pertinent
à cause d'expositions précédentes qui ne lui sont pas liées (ex. T3 × 5 supprime T1
immédiatement après, alors que T1 est l'information critique du moment).

### Analyse dans le dataset Phase 4

Extraire les snapshots où `should_expose === false` et `winner !== null` :

| Métrique | Valeur | Acceptable ? |
|---|---|---|
| Taux suppression global | `__`% | ≤ 40% |
| Taux suppression T3 | `__`% | ≤ 35% |
| Taux suppression T1 | `__`% | ≤ 45% |
| Taux suppression T2 | `__`% | ≤ 50% |
| Taux suppression T4 | `__`% | ≤ 70% (T4 naturellement supprimé) |

**Lecture :** un T1 supprimé 60% du temps est inquiétant si ces suppressions
surviennent sans que T3 ait couvert l'information. Un T4 supprimé 70% du temps
est normal — c'est la rareté attendue.

### Validation qualitative suppression T3

T3 est la tension critique. Sa suppression doit être rare sur les premières soumissions :

- [ ] T3 est exposé à la première détection (should_expose=true) dans ≥ 80% des cas
- [ ] T3 n'est jamais supprimé lors de la première apparition dans une session

### Checklist T4-05

- [ ] Dataset analysé : taux de suppression par type calculés
- [ ] Taux dans les limites acceptables
- [ ] T3 exposé première détection ≥ 80% des cas
- [ ] Aucune sur-suppression pathologique détectée

---

## T4-06 — Validation over-suppression

**Objectif :** détecter une over-suppression systémique — quand la gate attention
devient trop restrictive et supprime la majorité des expositions légitimes.

### Définition de l'over-suppression

Il y a over-suppression quand :
- `attention_level === 'high'` sur > 30% des cycles avec un winner
- L'opérateur ne voit aucun message pendant une session entière malgré des tensions réelles
- T3 est supprimé plus d'une fois consécutive dans une session longue

**Note :** une suppression individuelle n'est pas une over-suppression. L'over-suppression
est un pattern systémique sur une session.

### Analyse over-suppression dans le dataset

Extraire les séquences de suppressions consécutives par session :

| Session | Suppressions consécutives max | Over-suppression ? |
|---|---|---|
| Opérateur 1 · Session 1 | | ☐ |
| Opérateur 1 · Session 2 | | ☐ |
| (etc.) | | |

**Seuil d'alerte :** > 3 suppressions consécutives d'un même type sur une session = over-suppression.

- [ ] Aucune session avec > 3 suppressions consécutives T3
- [ ] Taux sessions avec over-suppression ≤ 10% du total

### Action si over-suppression détectée

**Option A :** augmenter WINDOW_SIZE (N=5 → N=7 ou N=10).
**Option B :** réduire DECLINE_FAST/DECLINE_FULL.
**Jamais :** désactiver le gate attention.

Si WINDOW_SIZE est modifié : relancer T4-03 (collecte complémentaire) et
re-valider les taux de suppression T4-05.

### Checklist T4-06

- [ ] Séquences de suppression analysées par session
- [ ] Over-suppression absente (≤ 10% des sessions)
- [ ] Si détectée : WINDOW_SIZE ajusté + re-validation

---

## T4-07 — Validation fatigue cognitive

**Objectif :** détecter la fatigue cognitive — quand la couche V2 alourdit
progressivement la charge mentale de l'opérateur sur des sessions longues.

### Définition de la fatigue cognitive V2

La fatigue cognitive V2 est distincte de la fatigue générale de trading.
Elle est spécifique à la présence de messages V2 : l'opérateur adapte son
comportement pour les ignorer, les éviter, ou en décoder le sens à chaque apparition.

**Signaux de fatigue cognitive V2 :**
- L'opérateur cesse de lire les messages après N soumissions
- L'opérateur demande à désactiver les messages
- L'opérateur modifie délibérément ses inputs pour "éviter" de déclencher un message
- Les prises de décision ralentissent après apparition d'un message V2

### Protocole observation fatigue — sessions longues

Lors des sessions Phase 4 (T4-03), observer sans intervenir :

| Opérateur | Session | Message V2 lu ? (1ère apparition) | Message V2 lu ? (5ème apparition) | Comportement d'évitement ? |
|---|---|---|---|---|
| 1 | 1 | ☐ Oui ☐ Non | ☐ Oui ☐ Non | ☐ |
| 1 | 2 | ☐ Oui ☐ Non | ☐ Oui ☐ Non | ☐ |
| (etc.) | | | | |

### Critères de non-fatigue

- [ ] ≥ 80% des opérateurs lisent le message à la 1ère apparition
- [ ] ≥ 60% des opérateurs lisent le message à la 5ème apparition
- [ ] 0 opérateur manifeste un comportement d'évitement
- [ ] 0 opérateur demande à désactiver les messages

### Action si fatigue détectée

**Réduire la fréquence** en resserrant les seuils — pas en modifiant le gate attention.
La fréquence est le premier levier. Le gate attention n'est pas un levier de fréquence.

Si la fréquence ne peut pas descendre sans vider le signal : réévaluer la valeur
de la couche V2 pour ce profil d'opérateur. C'est une décision produit, pas technique.

### Checklist T4-07

- [ ] Observation fatigue complétée sur ≥ 5 opérateurs × 3 sessions
- [ ] Critères de non-fatigue vérifiés
- [ ] Aucun comportement d'évitement observé
- [ ] Si fatigue détectée : seuils resserrés + re-collecte T4-03

---

## T4-08 — Agrégation manuelle calibration

**Prérequis :** T4-04 à T4-07 validés — dataset de qualité, suppressions correctes,
over-suppression absente, fatigue non détectée.

**Objectif :** agréger les données CalibrationSnapshot pour produire les seuils
définitifs de chaque tension.

### Processus d'agrégation manuelle

Phase 4 ne fournit pas d'outil d'analyse automatique. L'agrégation est manuelle
par conception (pas de backend, pas de SaaS).

**Outil recommandé :** tableur (Excel / LibreOffice Calc) ou script Python local.
**Jamais :** envoyer les données à un service en ligne.

### Étapes d'agrégation

**Étape 1 — Consolider les exports**

Fusionner tous les fichiers `calib_*.json` en un seul dataset :
- [ ] N = `____` snapshots total
- [ ] Plage de dates couverte : `__` à `__`

**Étape 2 — Distribution par tension**

| Tension | Fois winner | Fois absorbée | Fois silencieuse | % sessions |
|---|---|---|---|---|
| T3 | | | | |
| T1 | | | | |
| T2 | | | | |
| T4 | | | | |
| Aucune | | | | |

**Étape 3 — Révision des seuils par tension**

Pour chaque tension, calculer le taux TP/FP aux seuils actuels depuis les données réelles :

| Tension | Seuil actuel | TP% réel | FP% réel | Seuil révisé ? |
|---|---|---|---|---|
| T1 | X=`__`, Y=`__` | | | |
| T2 | niveaux : `__` | | | |
| T4 | MdS>`__`, QdR>`__` | | | |
| D-ATT-01 (WINDOW_SIZE) | N=`__` | | | |

**Étape 4 — Décision par seuil**

Pour chaque seuil révisé, une décision explicite :
- **Confirmer** : seuil actuel optimal, ne pas modifier
- **Resserrer** : FP trop élevé, augmenter le seuil
- **Élargir** : TP trop faible, risque de starvation (rare)
- **Reporter** : données insuffisantes, relancer T4-03

| Tension | Décision | Nouveau seuil |
|---|---|---|
| T1 | | |
| T2 | | |
| T4 | | |
| WINDOW_SIZE | | |

### Application des seuils révisés

Si des seuils sont modifiés :
1. Modifier `coherence.js` et/ou `attention.js` avec les valeurs finales
2. Mettre à jour `calibration-terrain.md` avec les seuils définitifs
3. Commit : `fix(v2/calibration): apply final calibrated thresholds`
4. Re-valider les snapshots G, J, L, N

- [ ] Seuils définitifs appliqués et documentés
- [ ] `calibration-terrain.md` mis à jour

---

## Procédures analyse post-V0

L'analyse post-V0 est la phase de lecture des données CalibrationSnapshot
après la clôture du test V0 terrain (≥ 20 opérateurs, protocole V0 complet).

### Périmètre de l'analyse post-V0

L'analyse post-V0 couvre :
1. **Taux de détection par tension** — combien de fois chaque type a été détecté
2. **Taux d'exposition** — combien de fois chaque type a atteint le cockpit
3. **Distribution attention_level** — proportion normal/elevated/high sur le total
4. **Efficacité du gate** — rapport (expositions refusées) / (expositions autorisées)
5. **Fréquence totale cockpit** — confirmée ou infirmée vs objectif ≤ 40%

### Ce que l'analyse post-V0 ne couvre pas

- Comportement de l'opérateur (hors périmètre — collecte comportementale interdite)
- Corrélation messages V2 / performance de trading (non collecté, non évaluable)
- Utilisation du moteur (nombre de soumissions par session — non collecté)

### Grille d'analyse post-V0

| Métrique | Valeur observée | Objectif | Conforme ? |
|---|---|---|---|
| Fréquence T3 cockpit | | ≤ 30% | ☐ |
| Fréquence T1 cockpit | | ≤ 15% | ☐ |
| Fréquence T2 cockpit | | ≤ 10% | ☐ |
| Fréquence T4 cockpit | | ≤ 10% | ☐ |
| Fréquence totale | | ≤ 40% | ☐ |
| Taux over-suppression T3 | | ≤ 5% | ☐ |
| Taux attention_level high | | ≤ 25% | ☐ |

### Rapport d'analyse post-V0

Produire un document synthétique `calibration-rapport-v0.md` (local, non versionné) :
- [ ] Métriques ci-dessus remplies
- [ ] Décisions de seuils documentées (T4-08)
- [ ] Recommandation Go/No-Go V2 justifiée

---

## Stratégie correction seuils

La correction des seuils post-V0 suit une logique conservatrice : modifier
le minimum nécessaire, valider chaque correction isolément.

### Principes de correction seuils

**Règle 1 — Un seuil à la fois.** Ne pas modifier T1 et T2 simultanément.
La correction croisée rend l'attribution des changements impossible.

**Règle 2 — Corriger vers la restriction, pas vers l'élargissement.**
Si un seuil est trop large (FP trop élevé), resserrer. Si un seuil est trop
strict (starvation pathologique), analyser d'abord si la starvation est réelle.

**Règle 3 — Documenter la justification.** Chaque modification de seuil
doit avoir une justification basée sur les données (pas une intuition).

### Matrice de décision correction

| Observation | Action seuil | Impact attendu |
|---|---|---|
| FP T1 > 20% | Augmenter T1_X (ex. 65 → 70) | Réduire FP, risque de réduire TP |
| T1 jamais détecté | Réduire T1_X (ex. 65 → 60) | Augmenter détection, risque FP |
| T4 > 15% sessions | Augmenter seuils T4 | Réduire fréquence T4 |
| Over-suppression T3 | Augmenter WINDOW_SIZE (N → N+2) | Réduire suppressions |
| Fatigue cognitive | Resserrer seuils tous types | Réduire fréquence globale |

### Procédure de correction

1. Identifier le seuil à modifier (un seul)
2. Modifier `coherence.js` ou `attention.js`
3. Relancer **T4-03 court** (3 sessions × 3 opérateurs = 9 sessions)
4. Re-analyser les métriques T4-04 à T4-07
5. Valider ou itérer

- [ ] Chaque correction isolée et re-validée avant la suivante
- [ ] Maximum 3 cycles de correction avant décision Go/No-Go

---

## Stratégie re-test

Après correction des seuils, un re-test partiel est nécessaire avant de valider
la correction. Le re-test complet (test V0 intégral) n'est pas systématique.

### Quand faire un re-test partiel vs complet

| Modification | Re-test requis |
|---|---|
| Seuil numérique ajusté de ±5 points | Partiel — 3 opérateurs × 3 sessions |
| Seuil numérique ajusté de ±15 points | Partiel étendu — 5 opérateurs × 5 sessions |
| Modification WINDOW_SIZE | Partiel étendu |
| Modification PRIORITY_ORDER (interdit Phase 4) | Jamais — décision architecturale |
| Ajout d'un nouveau type de tension | Test complet (Phase 5+) |

### Protocole re-test partiel

1. Sélectionner 3 opérateurs ayant participé au test V0 initial
2. 3 sessions longues chacun (≥ 30 soumissions)
3. Exporter les CalibrationSnapshots
4. Vérifier les métriques T4-04 à T4-07
5. Si métriques dans les cibles : valider la correction
6. Si métriques hors cibles : itérer (maximum 3 cycles)

### Seuil d'arrêt re-test

Après 3 cycles de correction/re-test sans convergence : décision No-Go.
Les seuils ne peuvent pas être calibrés avec les données disponibles.
Action : revenir aux seuils Phase 3 (stables) et garder V2_CALIBRATION:true
pour collecte future uniquement.

- [ ] Stratégie re-test documentée pour chaque correction appliquée
- [ ] Maximum 3 cycles respecté

---

## Validation production readiness

La production readiness V2 est l'état dans lequel le moteur peut être utilisé
par des opérateurs sans supervision, avec la couche V2 entièrement active
et calibrée. C'est la cible finale de Phase 4.

### Critères production readiness — liste exhaustive

**Techniques :**
- [ ] Tous les flags V2 actifs (V2_ENABLED, V2_COHERENCE, V2_HIERARCHY, V2_ATTENTION, V2_EXPOSITION, V2_COCKPIT_MESSAGE, V2_CALIBRATION)
- [ ] Seuils T1/T2/T4 calibrés depuis données V0 réelles (non provisoires)
- [ ] WINDOW_SIZE calibré et documenté dans `calibration-terrain.md`
- [ ] Zéro erreur JavaScript console sur sessions normales
- [ ] localStorage : aucune clé V2 persistée
- [ ] `buildPayload()` non modifié — pipe V1 intact
- [ ] `PRIORITY_ORDER` non modifié depuis Phase 2

**Qualité des signaux :**
- [ ] FP T1 ≤ 20%, FP T2 ≤ 20%, FP T4 ≤ 15% (sur données V0 post-correction)
- [ ] Taux T3 cockpit ≤ 30%, T1 ≤ 15%, T2 ≤ 10%, T4 ≤ 10%
- [ ] Fréquence totale cockpit ≤ 40%
- [ ] Over-suppression T3 ≤ 5%

**UX et doctrine :**
- [ ] `active_exposed ≤ 1` systématique sur sessions longues
- [ ] Suppression silencieuse validée en conditions réelles
- [ ] Fatigue cognitive non détectée (≥ 60% opérateurs lisent encore T3 à la 5ème apparition)
- [ ] Doctrine silence structurel invariante (6/6 invariants)
- [ ] Module comportement isolation stricte préservée

**Sécurité :**
- [ ] CalibrationSnapshot : aucune donnée personnellement identifiable
- [ ] Export ponctuel uniquement — aucun envoi réseau automatique
- [ ] Aucune clé V2 dans localStorage

### Ce que la production readiness ne signifie pas

Production readiness n'est pas :
- Une garantie de performance trading (hors périmètre moteur)
- Une stabilité définitive des seuils (la calibration est un processus vivant)
- Un déploiement public sans restrictions

---

## Stratégie activation limitée

Avant un déploiement ouvert, une activation limitée permet de valider le moteur
en conditions réelles avec un périmètre contrôlé.

### Définition de l'activation limitée

L'activation limitée est le test V0 étendu : 20–30 opérateurs identifiés,
V2 entièrement actif et calibré, observation sans supervision. Distincte du test V0
initial (observation avec supervision et protocole formalisé).

**Durée :** 4–6 semaines d'usage autonome.
**Périmètre :** opérateurs identifiés, invitation directe, aucun inconnu.
**Objectif :** valider que le moteur V2 calibré tient ses promesses en usage réel autonome.

### Critères d'entrée activation limitée

- [ ] Critères production readiness verts (section précédente)
- [ ] Seuils définitifs documentés dans `calibration-terrain.md`
- [ ] Rapport d'analyse post-V0 produit
- [ ] Décision Go (voir § Critères Go/No-Go) formalisée

### Ce qu'on observe pendant l'activation limitée

- Retours qualitatifs des opérateurs (pas de collecte automatique)
- Signaux de fatigue ou de gêne (retours directs)
- Demandes de désactivation (signal négatif majeur)
- Usage persistant après 2 semaines sans relance (signal positif)

### Ce qu'on n'observe pas

- Performance de trading des opérateurs — hors périmètre et potentiellement intrusif
- Fréquence d'utilisation — non collecté automatiquement
- Sessions individuelles — aucun suivi nominatif

### Checklist activation limitée

- [ ] Opérateurs identifiés (20–30)
- [ ] Moteur V2 calibré déployé
- [ ] Protocole observation minimale activé (retours directs uniquement)
- [ ] Durée cible fixée : `__` semaines

---

## Rollback production

En production, le rollback doit être immédiat et traçable. Phase 4 introduit
deux nouveaux mécanismes de rollback par rapport aux phases précédentes.

### Niveau 1 — Désactivation CalibrationSnapshot

Arrête la collecte sans toucher au cockpit ou aux seuils.

```javascript
V2_CALIBRATION: false,   // ← false
```

Utilisé si : l'export CalibrationSnapshot génère des erreurs ou ralentit l'UI.

### Niveau 2 — Rollback seuils Phase 4 → seuils Phase 3

Revenir aux seuils post-Phase 3 si les corrections Phase 4 ont dégradé les signaux.

```bash
git revert <hash-T4-08-correction>  # revert du commit de correction seuils
```

### Niveau 3 — Rollback total Phase 4

Retour à l'état Phase 3 validée (7 flags → 6 flags actifs).

```javascript
V2_CALIBRATION: false,   // seul flag modifié en Phase 4
```

**Note :** Phase 4 ne modifie que `V2_CALIBRATION` et potentiellement les seuils
dans `coherence.js`. Le rollback est donc minimal par rapport aux phases précédentes.

### Niveau 4 — Désactivation V2 complète (urgence)

```javascript
V2_ENABLED: false,   // désactive toute la couche V2
```

Utilisé uniquement en cas de régression critique non résolvable en moins de 15 minutes.

### Procédure de communication rollback activation limitée

Si un rollback est déclenché pendant l'activation limitée :
1. Notifier les opérateurs : "mise à jour en cours" (pas d'explication technique)
2. Appliquer le rollback
3. Re-valider les critères production readiness avant de redéployer
4. Ne pas redéployer dans les 48h sans analyse complète

### Matrice décision rollback production

| Signal | Niveau rollback |
|---|---|
| Erreur JS console liée V2_CALIBRATION | N1 (désactiver CalibrationSnapshot) |
| FP soudainement élevé post-correction | N2 (revert seuils) |
| Retours négatifs > 30% opérateurs | N3 + investigation |
| Régression moteur V1 détectée | N4 (urgence) |

---

## Critères Go / No-Go V2

Le Go/No-Go V2 est la décision formelle de déployer la couche V2 en activation
limitée. C'est la décision la plus importante de la chaîne d'implémentation.

### Critères Go

**Tous requis** pour un décision Go :

| Critère | Seuil | Vérifié |
|---|---|---|
| Production readiness | Tous items verts | ☐ |
| Fréquence totale cockpit | ≤ 40% sur dataset V0 | ☐ |
| FP T1/T2 | < 20% | ☐ |
| FP T4 | < 15% | ☐ |
| Over-suppression T3 | ≤ 5% | ☐ |
| Fatigue cognitive | Non détectée | ☐ |
| Doctrine silence structurel | 6/6 invariants verts | ☐ |
| Seuils calibrés | Documentés dans calibration-terrain.md | ☐ |
| Rapport post-V0 | Produit et archivé | ☐ |

### Critères No-Go

**Un seul suffit** pour un No-Go :

| Critère | Seuil de No-Go |
|---|---|
| FP T1 ou T2 | ≥ 30% malgré 3 cycles de correction |
| Over-suppression T3 | > 10% sur dataset V0 |
| Fatigue cognitive confirmée | ≥ 3 opérateurs sur 5 |
| Starvation pathologique T1 | > 50% absorption sans couverture T3 |
| Régression moteur V1 non résolvable | 1 seule occurrence confirmée |
| Fréquence totale | > 50% malgré seuils resserrés |

### Conséquence d'un No-Go

Un No-Go n'est pas un échec permanent. Il signifie que la couche V2 n'est pas
prête dans l'état actuel pour ce profil d'opérateur.

**Options après No-Go :**
- Option A : réduire le périmètre (désactiver T2 ou T4, garder T3+T1)
- Option B : retravailler les messages (formulation, lisibilité)
- Option C : retravailler les seuils avec un dataset V0 plus large
- Option D : différer Phase 4 — garder Phase 3 comme état stable indéfiniment

### Formalisation de la décision

La décision Go/No-Go doit être formalisée par écrit :

```
Date : ________________
Décision : ☐ Go �� No-Go
Justification : ________________
Seuils définitifs : T1 X=___ Y=___ · T2 ___ · T4 ___ · WINDOW_SIZE=___
Signataire : ________________
```

- [ ] Décision Go/No-Go formalisée et archivée

---

## Validation non-régression Phase 4

Phase 4 modifie uniquement `flags.js` (V2_CALIBRATION) et potentiellement
les seuils dans `coherence.js`/`attention.js`. La non-régression est minimale.

### Tableau non-régression moteur V1

| Test | Référence Phase 3 | Phase 4 | Statut |
|---|---|---|---|
| R-01 à R-08 | Identiques Phase 3 | Identiques | ☐ |
| buildPayload() | Tous champs V1 | Inchangé | ☐ |
| Snapshots A–M | Comportement Phase 3 | Identiques | ☐ |

### Tableau non-régression V2 cockpit

| Composant | Phase 3 | Phase 4 | Statut |
|---|---|---|---|
| T3 message cockpit | Visible si conditions | Identique | ☐ |
| T1/T2/T4 message cockpit | Visible selon hiérarchie | Identique | ☐ |
| active_exposed | ≤ 1 | ≤ 1 | ☐ |
| Fréquence totale | ≤ 40% | ≤ 40% | ☐ |

### Tableau non-régression performance

L'activation du CalibrationSnapshot ne doit pas dégrader les performances :
- [ ] Temps de rendu après soumission : identique Phase 3 (pas de latence perceptible)
- [ ] Aucun freeze UI pendant la collecte du snapshot
- [ ] Aucun freeze UI pendant l'export JSON

### Tableau non-régression sécurité

- [ ] localStorage : aucune clé V2 après 50 soumissions
- [ ] Aucun envoi réseau observé (Network panel DevTools : zéro requête V2)
- [ ] Export JSON : aucun champ personnellement identifiable

---

## Signaux d'arrêt Phase 4

### Signaux bloquants — arrêt immédiat

| # | Signal | Gravité | Action |
|---|---|---|---|
| S4-01 | Régression moteur V1 | Critique | Rollback N4 · investiguer |
| S4-02 | Donnée personnellement identifiable dans le CalibrationSnapshot | Critique | Rollback N1 · corriger buildCalibrationSnapshot() |
| S4-03 | Envoi réseau automatique détecté | Critique | Rollback N1 · investiguer l'implémentation |
| S4-04 | Écriture localStorage liée V2_CALIBRATION | Bloquant | Corriger · ne pas continuer |
| S4-05 | Erreur JS console liée au CalibrationSnapshot | Bloquant | Corriger avant de poursuivre |
| S4-06 | active_exposed > 1 observé Phase 4 | Critique | Rollback N3 · réinvestiguer Phase 3 |

### Signaux de calibration — pause et révision

| # | Signal | Action |
|---|---|---|
| S4-07 | FP T1/T2 > 25% après correction | Re-collecter (T4-03) · 3ème cycle correction |
| S4-08 | Over-suppression T3 > 10% | Augmenter WINDOW_SIZE · re-valider T4-05/T4-06 |
| S4-09 | Fatigue cognitive détectée ≥ 3 opérateurs | Réduire fréquence globale · resserrer seuils |
| S4-10 | T4 jamais détecté sur 450 snapshots | Vérifier conditions T4 · seuils peut-être trop restrictifs |

### Signaux de No-Go

| # | Signal | Conséquence |
|---|---|---|
| S4-11 | FP ≥ 30% malgré 3 cycles correction | No-Go · Option A ou B |
| S4-12 | Fatigue cognitive ≥ 4/5 opérateurs | No-Go · reconsidérer la valeur de V2 |
| S4-13 | Starvation T1 pathologique > 50% | No-Go · réévaluer hiérarchie (décision architecturale) |

---

## Critères de fin Phase 4

**Phase 4 est validée quand les 5 tableaux ci-dessous sont entièrement verts.**

### Tableau 1 — Infrastructure CalibrationSnapshot

| Item | Critère | Statut |
|---|---|---|
| T4-01 | V2_CALIBRATION:true · snapshot collecté · cockpit inchangé | ☐ |
| T4-02 | Export JSON manuel · FIFO 50 entrées · aucune donnée PII | ☐ |
| T4-03 | ≥ 450 snapshots collectés · 5 opérateurs × 3 sessions longues | ☐ |
| T4-04 | Dataset qualité validée (complétude ≥ 95%, diversité tensions) | ☐ |

### Tableau 2 — Validation suppression et attention

| Item | Critère | Statut |
|---|---|---|
| T4-05 | Suppression silencieuse réelle validée · taux par type acceptables | ☐ |
| T4-06 | Over-suppression absente (≤ 10% sessions) | ☐ |
| T4-07 | Fatigue cognitive non détectée | ☐ |

### Tableau 3 — Calibration et analyse

| Item | Critère | Statut |
|---|---|---|
| T4-08 | Agrégation manuelle · seuils définitifs | ☐ |
| Analyse post-V0 | Rapport calibration-rapport-v0.md produit | ☐ |
| Corrections seuils | Maximum 3 cycles · seuils convergés | ☐ |
| Re-tests | Protocole re-test respecté pour chaque correction | ☐ |

### Tableau 4 — Non-régression et sécurité

| Item | Critère | Statut |
|---|---|---|
| Moteur V1 | R-01→R-08 identiques Phase 3 | ☐ |
| V2 cockpit | T3+T1+T2+T4 identiques Phase 3 | ☐ |
| localStorage | Aucune clé V2 | ☐ |
| Réseau | Zéro requête automatique | ☐ |

### Tableau 5 — Go/No-Go et production readiness

| Item | Critère | Statut |
|---|---|---|
| Production readiness | Tous items verts | ☐ |
| Décision Go/No-Go | Formalisée par écrit | ☐ |
| Si Go : activation limitée | Périmètre défini, opérateurs identifiés | ☐ |
| Doctrine silence structurel | 6/6 invariants verts | ☐ |

---

## Statut et suite

**Statut de ce document :** Checklist opérationnelle · Version 1.0 · Non commencée

Ce document couvre Phase 4 intégralement : activation du CalibrationSnapshot,
collecte terrain sur sessions longues, validation suppression/over-suppression/fatigue,
agrégation manuelle, correction seuils, et décision Go/No-Go formalisée.

### Ce que Phase 4 complète

À l'issue de Phase 4, le moteur Caméléon est dans l'état final suivant :
- **7 flags V2 actifs :** V2_ENABLED + V2_COHERENCE + V2_HIERARCHY + V2_ATTENTION + V2_EXPOSITION + V2_COCKPIT_MESSAGE + V2_CALIBRATION
- **Seuils définitifs :** T1/T2/T4 calibrés depuis données V0 réelles
- **WINDOW_SIZE retenu :** documenté dans `calibration-terrain.md`
- **CalibrationSnapshot :** infrastructure de collecte opérationnelle (in-memory, export ponctuel)
- **Go/No-Go formalisé :** décision documentée
- **Si Go :** activation limitée prête à démarrer

### Ce que Phase 4 ne couvre pas

- L'escalade/désescalade de tensions (D-HIE-02/03) — dette architecturale future
- La gestion multi-session (persistance cross-session) — hors périmètre
- Un backend ou une analytics SaaS — explicitement exclus

### Position finale dans la chaîne V2

```
Phase 0 (infra) → Phase 1 (cohérence shadow) → Phase 2 (T3 cockpit)
  → Phase 3 (T1+T2+T4 · calibration initiale · pré-production)
    → Phase 4 (CalibrationSnapshot · calibration définitive · Go/No-Go)
      → Activation limitée (test V0 étendu)
        → Production (si Go)
```

**Phase 4 est le dernier document de la chaîne d'implémentation.**
Après Phase 4, le moteur est en production ou en révision — les deux cas
sont documentés dans les critères Go/No-Go.

---

*Checklist Phase 4 — Version 1.0 — 2026-05-24*
