# Préparation production V2 — Stratégie d'activation réelle limitée

## Métadonnées

**Statut** : Document stratégique · pré-production V2
**Version** : 1.0 — 2026-05-24
**Prérequis** : Phase 4 validée · décision Go formalisée · seuils définitifs documentés
**Dépendances** :
- `docs/architecture/checklist-implementation-phase-4.md` — Phase 4 référence · Go/No-Go
- `docs/architecture/calibration-terrain.md` — seuils définitifs post-Phase 4
- `docs/architecture/doctrine-silence-structurel.md` — invariant absolu production
- `docs/product/doctrine-cameleon-transmission-test-reel-v0.md` — protocole V0 initial

**Usage :** Ce document guide la transition de pré-production vers activation limitée réelle.
Ne pas démarrer sans décision Go formalisée (Phase 4, § Critères Go/No-Go).

---

## Objectif

Ce document formalise la stratégie de passage entre la pré-production V2 validée
(Phase 4 · décision Go) et la première activation réelle limitée du cockpit V2
auprès d'opérateurs identifiés.

Il couvre :
- La segmentation des opérateurs cibles pour l'activation initiale
- Le monitoring manuel (sans télémétrie, sans SaaS)
- La validation de stabilité sur sessions longues et multi-jours
- Les stratégies de rollback et de désactivation immédiate
- La collecte de feedback qualitatif
- Les critères de gel de l'architecture et des seuils
- La stratégie de passage vers V2.1

**Ce document ne couvre pas :**
- Un backend de collecte automatique
- Une analytics d'usage ou de performance
- Une télémétrie distante
- Une modification de l'architecture V2 (les specs sont scellées après Phase 4)
- Une extension multi-plateforme ou multi-langue

**Condition de démarrage :** décision Go formalisée (Phase 4), seuils définitifs
documentés dans `calibration-terrain.md`, et production readiness verts.

---

## Philosophie — activation sans précipitation

### Le paradoxe de l'activation limitée

La tentation de l'activation limitée est de la traiter comme un lancement :
recruter vite, diffuser large, mesurer les retours. C'est exactement l'inverse
de ce qui est requis.

L'activation limitée V2 est une **observation prolongée**, pas un déploiement.
Elle vise à confirmer que le moteur se comporte en conditions autonomes comme
en conditions supervisées (Phase 4). Rien de plus.

### Ce que "sans précipitation" signifie concrètement

**Un seul critère de réussite :** les opérateurs utilisent le moteur de façon
naturelle, sans adapter leur comportement à la présence des messages V2.

**Trois signaux d'échec précoce :**
- L'opérateur modifie ses inputs pour "éviter" un message V2
- L'opérateur ignore systématiquement les messages après 3 sessions
- L'opérateur demande une version sans messages V2

Si l'un de ces signaux est observé, l'activation est suspendue — peu importe
où en est le calendrier.

### Interdits absolus de philosophie

- Aucun objectif de croissance du nombre d'utilisateurs pendant l'activation limitée
- Aucun tableau de bord de suivi des retours (retours directs uniquement)
- Aucune comparaison performance avant/après V2 (hors périmètre)
- Aucune communication externe sur "le lancement de V2" (activation limitée ≠ lancement)

---

## Segmentation profils opérateurs

L'activation limitée V2 ne s'adresse pas à n'importe quel opérateur. Le profil
cible conditionne la pertinence des signaux observés.

### Profil cible V2 activation limitée

**Profil 1 — Opérateur V0 expérimenté** (priorité haute)
- A participé au test V0 initial (Phase 1–4)
- Connaît le moteur V1, ses forces et ses limites
- Utilise le moteur régulièrement (≥ 3 sessions par semaine)
- Valeur : calibration fiable, comportement connu, retours contextualisés

**Profil 2 — Opérateur V0 nouveau** (priorité normale)
- N'a pas participé au test V0 initial
- Connaît le moteur V1 (utilisateur V1 existant)
- Découvre V2 sans biais de calibration Phase 1–4
- Valeur : validation lisibilité première impression, comportement naturel non conditionné

**Profil 3 — Opérateur découverte** (déconseillé activation limitée)
- Découvre à la fois V1 et V2 simultanément
- Le signal V2 est inexploitable : impossible de distinguer l'apprentissage V1
  de la réaction V2
- À réserver pour une phase ultérieure (post-stabilisation V2)

### Répartition cible activation limitée

| Profil | Cible | Raison |
|---|---|---|
| V0 expérimenté | 60–70% | Signal fiable · contexte connu |
| V0 nouveau | 30–40% | Validation première impression |
| Découverte | 0% | Signal non exploitable à ce stade |

### Taille de cohorte

**Minimum :** 15 opérateurs actifs (usage ≥ 2 sessions / semaine)
**Optimal :** 20–25 opérateurs
**Maximum recommandé :** 30 opérateurs (au-delà : suivi qualitatif difficile)

**Critère d'exclusion :** opérateur qui n'a pas utilisé le moteur V1 au cours
des 4 semaines précédant l'activation limitée (comportement non représentatif).

---

## Stratégie activation progressive production

L'activation est progressive — pas d'ouverture simultanée à toute la cohorte.

### Phase A — Noyau dur (semaines 1–2)

5 opérateurs · profil V0 expérimenté uniquement.

**Objectif :** détecter les problèmes critiques avant d'élargir.

Critères de passage Phase A → Phase B :
- [ ] Aucun signal bloquant observé (voir § Critères Go/No-Go · signaux S4-01 à S4-06)
- [ ] Messages V2 lus et compris par tous les opérateurs Phase A
- [ ] Fréquence totale cockpit dans les cibles (≤ 40%)
- [ ] Aucune demande de désactivation

### Phase B — Cohorte principale (semaines 3–5)

15–20 opérateurs · mix profil V0 expérimenté + V0 nouveau.

**Objectif :** valider le comportement à l'échelle de la cohorte cible.

Critères de passage Phase B → Phase C :
- [ ] 2 semaines complètes sans signal bloquant
- [ ] Retours qualitatifs : ≥ 70% neutres ou positifs sur les messages V2
- [ ] Aucun comportement d'évitement observé

### Phase C — Stabilisation (semaines 6–8)

Cohorte complète (jusqu'à 30 opérateurs) · observation passive.

**Objectif :** confirmer la stabilité sur 2 semaines sans retours actifs.

À l'issue de Phase C :
- [ ] Critères V2 stable remplis (voir § Critères V2 stable)
- [ ] Décision de gel architecture (voir § Critères gel architecture)

### Règle de non-accélération

**Aucune Phase ne peut être raccourcie** pour respecter un calendrier.
Si Phase A révèle un signal bloquant à la semaine 2, Phase B ne démarre pas.
Le calendrier s'adapte aux signaux — pas l'inverse.

---

## Monitoring manuel sans SaaS

Le monitoring V2 en production est intentionnellement minimal et sans SaaS.
Il repose sur trois canaux uniquement : retours directs opérateurs, observation
directe de sessions, et export CalibrationSnapshot ponctuel.

### Ce que le monitoring couvre

| Canal | Fréquence | Méthode |
|---|---|---|
| Retours directs opérateurs | Continu (passif) | Canal dédié · pas de questionnaire forcé |
| Observation directe | 1 session / opérateur / 2 semaines | L'implémenteur observe en direct |
| Export CalibrationSnapshot | 1 fois / 2 semaines | Export manuel Debug panel · 5 opérateurs tirés au sort |

### Ce que le monitoring ne couvre pas

- Nombre total de sessions — non collecté
- Performance de trading — hors périmètre et intrusif
- Comparaison avant/après V2 — non demandée aux opérateurs
- Taux de "satisfaction" — terme à éviter (trop orienté produit/SaaS)

### Grille d'observation directe (bi-hebdomadaire)

À remplir lors de chaque session d'observation directe :

| Session observée | Message V2 visible ? | Lu ? | Commentaire spontané | Signal négatif ? |
|---|---|---|---|---|
| (date) | | | | ☐ |

### Traitement des retours directs

Retour entrant → classer dans l'une des 4 catégories :

| Catégorie | Exemple | Action |
|---|---|---|
| Positif fonctionnel | "Ce message m'a aidé à reconsidérer" | Logger · aucune action |
| Neutre | "Je l'ai vu, c'est tout" | Logger |
| Négatif léger | "Je ne comprends pas bien" | Analyser · reformuler si récurrent |
| Négatif critique | "Je veux enlever ça" | Signal bloquant · traiter immédiatement |

### Tableau de bord minimal (papier/tableur local)

| Semaine | Opérateurs actifs | Retours reçus | Positifs | Neutres | Négatifs légers | Négatifs critiques |
|---|---|---|---|---|---|---|
| S1 | | | | | | |
| S2 | | | | | | |
| (etc.) | | | | | | |

**Jamais en ligne. Jamais partagé automatiquement.** Fichier local uniquement.

---

## Validation stabilité sessions longues

La validation de stabilité sessions longues confirme que le comportement V2
observé en Phase 4 (sessions contrôlées) tient en conditions d'usage réelles.

### Définition d'une session longue en production

En production, une session longue n'est plus construite par l'implémenteur.
C'est une session naturelle d'un opérateur utilisant le moteur pour du trading réel.

**Session longue production :** ≥ 20 soumissions sur une même session de trading.
(Phase 4 utilisait 30 soumissions construites — les sessions réelles peuvent être plus courtes)

### Métriques à valider

Extraire des CalibrationSnapshots d'une session longue (export ponctuel) :

| Métrique | Cible production | Observé |
|---|---|---|
| `active_exposed` maximum | 1 | |
| Taux over-suppression T3 | ≤ 5% | |
| Fréquence totale cockpit session | ≤ 40% | |
| Erreurs JS console | 0 | |
| Entrées CalibrationBuffer | ≤ 50 (FIFO) | |

### Validation UI sur session longue

Observer directement une session longue (≥ 20 soumissions) :
- [ ] Aucune dégradation visuelle du cockpit au fil des soumissions
- [ ] Aucun message V2 bloqué visuellement (éléments fantômes dans le DOM)
- [ ] Le panneau Debug reste lisible après 20+ soumissions
- [ ] Aucune latence perceptible après 10+ soumissions consécutives

### Critère de validation sessions longues

- [ ] ≥ 3 sessions longues analysées par export CalibrationSnapshot
- [ ] Toutes les métriques dans les cibles
- [ ] Aucun comportement inattendu observé

---

## Validation stabilité multi-jours

La stabilité multi-jours valide que le moteur V2 ne dérive pas sur une période
de plusieurs jours d'usage continu. C'est le test le moins contrôlable — et donc
le plus révélateur.

### Pourquoi les multi-jours révèlent ce que les sessions ne voient pas

- Le buffer attention se vide entre les sessions (20 min de fenêtre) — mais
  la fréquence d'apparition peut s'accumuler différemment selon les contextes de marché
- Les seuils T3 peuvent déclencher plus souvent sur certaines configurations de marché
  récurrentes (ex. semaines à haute volatilité)
- La fatigue cognitive s'accumule sur plusieurs jours, pas sur une session

### Protocole validation multi-jours

**Durée :** 10 jours consécutifs d'utilisation naturelle · 3 opérateurs Phase A.

**Collecte :** 1 export CalibrationSnapshot par opérateur par jour (si session > 5 soumissions).

Grille de suivi 10 jours :

| Jour | Op 1 · sessions | Op 1 · message visible ? | Op 2 | Op 3 | Signal négatif ? |
|---|---|---|---|---|---|
| J1 | | | | | |
| J2 | | | | | |
| J3–J10 | | | | | |

### Métriques multi-jours

| Métrique | Cible | Observé J1–J10 |
|---|---|---|
| Fréquence T3 sur 10 jours | ≤ 30% des sessions | |
| Fréquence totale tous types | ≤ 40% des sessions | |
| Jours sans message V2 | ≥ 4/10 | |
| Retours négatifs spontanés | 0 | |

### Critère de validation multi-jours

- [ ] 10 jours consécutifs · 3 opérateurs · métriques dans les cibles
- [ ] Aucune dérive de fréquence observée (T3 ne monte pas au fil des jours)
- [ ] Aucun retour négatif spontané sur la semaine 2 (signe que V2 est intégré naturellement)

---

## Stratégie rollback production réel

En production réelle, le rollback doit être encore plus rapide qu'en Phase 4.
L'opérateur ne doit pas percevoir une dégradation prolongée.

### Niveaux de rollback production (identiques Phase 4, priorités ajustées)

| Niveau | Délai max | Trigger |
|---|---|---|
| N1 — CalibrationSnapshot off | < 5 min | Erreur JS liée V2_CALIBRATION |
| N2 — Seuils Phase 3 | < 15 min | FP soudain élevé · dérive fréquence |
| N3 — Total Phase 4 (V2_CALIBRATION:false) | < 15 min | Problème CalibrationSnapshot persistant |
| N4 — Désactivation V2 (V2_ENABLED:false) | < 5 min | Régression moteur V1 · tout signal critique |

### Procédure rollback N4 (urgence)

N4 est le seul rollback qui impacte l'expérience opérateur (les messages V2 disparaissent).

1. Passer `V2_ENABLED: false` dans `flags.js`
2. Recharger l'application (ou notifier les opérateurs de recharger)
3. Vérifier que le cockpit est identique Phase 1 (aucun message V2)
4. Notifier les opérateurs : "mise à jour en cours — aucune donnée perdue"
5. Analyser la cause avant tout redéploiement

**Ne jamais redéployer V2 dans les 24h suivant un N4** sans identification de la cause.

### Décision de rollback — qui décide

Le rollback est décidé unilatéralement par l'implémenteur sans consultation.
La vitesse prime. Les explications viennent après.

### Matrice déclenchement rollback production

| Signal observé | Rollback | Délai |
|---|---|---|
| Erreur JS liée V2 | N1 ou N4 selon gravité | < 5 min |
| ≥ 3 retours négatifs critiques en 48h | N4 | < 15 min |
| Fréquence T3 > 50% sur 3 sessions consécutives | N2 | < 30 min |
| Over-suppression systémique détectée | N2 | < 1h |
| Fatigue cognitive confirmée ≥ 3/5 opérateurs | N4 | < 2h |

---

## Stratégie désactivation immédiate V2

La désactivation immédiate V2 est distincte du rollback : elle est déclenchée
non pas par un problème technique, mais par une décision produit
(opérateur qui refuse V2, signal de nuisance systémique, décision d'arrêt).

### Désactivation individuelle (opérateur)

Si un opérateur demande à désactiver V2, la réponse est immédiate et sans négociation.

**Procédure :**
1. Confirmer à l'opérateur que c'est possible et immédiat
2. Livrer une version du moteur avec `V2_COCKPIT_MESSAGE: false` (flag local)
3. Logger le signal (sans identifier l'opérateur)
4. Analyser si la demande est isolée ou systémique

**Note :** la désactivation individuelle ne doit pas nécessiter une recompilation
ou un redéploiement. En architecture V2, `V2_COCKPIT_MESSAGE: false` suffit
pour retirer tous les messages cockpit — le reste de V2 continue en shadow.

### Désactivation collective (décision produit)

Si ≥ 30% des opérateurs de la cohorte expriment un signal négatif critique :

1. Activer `V2_ENABLED: false` (rollback N4 sur toute la cohorte)
2. Notifier la cohorte
3. Analyser les signaux collectés
4. Décider : reformuler les messages, recalibrer les seuils, ou reporter V2

**Ne jamais forcer V2 sur une cohorte qui le refuse.**
La couche V2 est une aide — pas une contrainte.

### Désactivation temporaire vs permanente

| Cause | Type | Action |
|---|---|---|
| Problème technique transitoire | Temporaire | Rollback N1–N3 · corriger · redéployer |
| Message mal formulé | Temporaire | Reformuler dans exposition.js · re-valider lisibilité |
| Fréquence trop haute | Temporaire | Resserrer seuils · re-déployer |
| Rejet structurel V2 par la cohorte | Permanent Phase A | Reporter à Phase B différente |

---

## Validation charge cognitive réelle

La charge cognitive réelle en production diffère de la charge cognitive en Phase 4
(sessions construites) : le contexte de trading réel génère déjà une charge cognitive
élevée. V2 s'y ajoute — il doit être imperceptible.

### Définition de la charge cognitive V2 en production réelle

La charge cognitive V2 est négligeable si l'opérateur ne mentionne pas les
messages V2 dans ses retours spontanés après 4 semaines d'usage.

**Signal de charge acceptable :** "Ah oui, ça s'affiche parfois" (neutre, non intégré)
**Signal de charge problématique :** "Je dois faire attention à ces messages" (intégré négativement)
**Signal de charge nulle :** "Quels messages ?" (invisible — optimal)

### Test de charge cognitive réelle — 4 semaines

Poser une seule question à chaque opérateur à la fin de la semaine 4 :

> "Y a-t-il quelque chose dans l'interface que vous souhaiteriez modifier ou
>  supprimer ?"

**Analyser la réponse :**
- Mention spontanée de V2 = charge présente (analyser si positive, neutre, ou négative)
- Absence de mention = charge nulle ou positive (optimal)
- Demande de suppression = signal bloquant

### Grille validation charge cognitive 4 semaines

| Opérateur | Mention V2 spontanée ? | Type de mention | Signal négatif ? |
|---|---|---|---|
| 1–20 | (à remplir) | | ☐ |

- [ ] Mentions de suppression : 0
- [ ] Mentions négatives actives (gêne, pression) : ≤ 2/20

### Critère de charge cognitive acceptable

- [ ] ≤ 2/20 opérateurs mentionnent V2 de façon négative
- [ ] 0/20 demandes de suppression
- [ ] La question "Y a-t-il quelque chose..." ne génère pas systématiquement une mention V2

---

## Validation silence structurel production

Le silence structurel en production est l'état dans lequel le moteur ne produit
aucun message V2 sur une proportion significative des sessions — et où cette
absence est perçue comme normale par l'opérateur.

### Invariants à vérifier en production

Les 6 invariants de la doctrine silence structurel doivent rester intacts :

| Invariant | Vérification production |
|---|---|
| Absorption par défaut | Aucun message dans ≥ 60% des sessions opérateur |
| Exposition = exception | Les messages sont perçus comme rares par les opérateurs |
| Unicité | `active_exposed ≤ 1` sur tous les exports CalibrationSnapshot |
| Indépendance | Cockpit identique Debug ouvert ou fermé |
| Non-jugement | 0 retour opérateur mentionnant "jugé" ou "surveillé" |
| Non-instruction | 0 retour opérateur mentionnant "forcé" ou "obligation" |

### Validation silence structurel — audit bi-mensuel

Tous les 15 jours, extraire un export CalibrationSnapshot de 3 opérateurs
et vérifier :

```
Taux sessions sans message V2 : __ / sessions totales
Taux active_exposed = 0 : __ / snapshots
Taux active_exposed = 1 : __ / snapshots
Taux active_exposed > 1 (interdit) : __ / snapshots
```

- [ ] Taux sessions sans message ≥ 60%
- [ ] `active_exposed > 1` : 0 occurrence
- [ ] Aucun retour mentionnant surveillance ou jugement (monitoring § feedback)

### Alerte doctrine silence

Si l'une des conditions suivantes est observée, la doctrine est en danger :

- Taux sessions sans message < 50% sur 2 semaines consécutives
- `active_exposed > 1` observé même une fois
- ≥ 2 opérateurs mentionnent "alerte" ou "avertissement" pour décrire V2

**Action immédiate :** resserrer les seuils et re-valider la fréquence avant de continuer.

---

## Stratégie collecte feedback qualitatif

La collecte de feedback qualitatif en production V2 suit les mêmes principes
que le test V0 : zéro questionnaire automatique, zéro sollicitation répétée,
retours directs uniquement.

### Canaux de collecte

**Canal 1 — Retours spontanés**
L'opérateur contacte l'implémenteur directement (message, appel).
Aucun formulaire. Aucune plateforme de feedback.

**Canal 2 — Observation directe bi-mensuelle**
L'implémenteur observe une session en direct (avec accord de l'opérateur).
Maximum 1 session par opérateur par mois.

**Canal 3 — Question unique de fin de période**
À la fin de chaque phase d'activation (A, B, C), une seule question est posée
à tous les opérateurs (voir § Charge cognitive réelle).

### Ce que le feedback ne doit pas être

- Un questionnaire NPS ("Note de 0 à 10")
- Un formulaire structuré avec 10 questions
- Un système de notation in-app
- Une demande répétée ("Qu'avez-vous pensé de la session de ce matin ?")

**La doctrine de transmission (docs/product/doctrine-cameleon-transmission-test-reel-v0.md)
s'applique ici : invitation directe · zéro relance · retour authentique ou pas de retour.**

### Grille de classification des retours

| Retour reçu | Date | Canal | Catégorie | Action |
|---|---|---|---|---|
| (libellé) | | ☐ Spontané ☐ Observation ☐ Question | ☐ + ☐ ≈ ☐ − ☐ critique | |

### Seuil d'action sur feedback

| Volume retours négatifs | Délai d'action |
|---|---|
| 1 retour critique | Analyser dans les 24h |
| 2 retours négatifs sur le même sujet | Investiguer · considérer correction |
| 3+ retours négatifs sur le même sujet | Correction prioritaire avant Phase B/C |

---

## Critères extension progressive utilisateurs

L'extension progressive de la cohorte suit les phases A → B → C définies
dans § Stratégie activation progressive. Cette section formalise les critères
précis de chaque transition.

### Critères Phase A → Phase B (5 opérateurs → 15–20)

**Tous requis :**
- [ ] 2 semaines Phase A sans signal bloquant (S4-01 à S4-06)
- [ ] Fréquence totale cockpit Phase A : ≤ 40% sur les exports bi-hebdomadaires
- [ ] 0 demande de désactivation Phase A
- [ ] Messages V2 lus et compris par ≥ 4/5 opérateurs Phase A (question observation)
- [ ] Aucun retour mentionnant surveillance ou jugement

### Critères Phase B → Phase C (15–20 → 25–30)

**Tous requis :**
- [ ] 2 semaines Phase B sans signal bloquant
- [ ] Fréquence totale cockpit Phase B : ≤ 40%
- [ ] Retours qualitatifs Phase B : ≥ 70% neutres ou positifs
- [ ] Aucun comportement d'évitement observé en Phase B
- [ ] Validation stabilité multi-jours (10 jours · 3 opérateurs) : métriques dans les cibles

### Critères de gel de l'extension (ne pas aller plus loin que Phase C)

L'extension est gelée si l'une des conditions suivantes est atteinte :
- La cohorte Phase C est stable depuis 4 semaines sans signal négatif → état V2 stable atteint
- Un signal de résistance systémique est observé → analyser avant d'étendre
- La capacité de suivi qualitatif est dépassée (> 30 opérateurs sans aide)

### Règle de non-extension contrainte

**Aucune extension** n'est déclenchée par un calendrier ou une pression externe.
Le passage Phase A → B → C est conditionnel aux signaux terrain.

---

## Critères gel architecture V2

Le gel de l'architecture V2 est la décision formelle de ne plus modifier
les composants structuraux de la couche V2 — hiérarchie, attention, exposition,
contrats de données. C'est le point de non-retour avant V2.1.

### Ce que le gel architecture couvre

| Composant gelé | Ce qui ne peut plus changer |
|---|---|
| `PRIORITY_ORDER` dans `hierarchy.js` | Ordre T3>T1>T2>T4 — définitif |
| Contrats de types (`types.js`) | TensionMap · HierarchyResult · AttentionResult · ExpositionResult |
| Structure `buildPayload()` | Aucune modification possible — zone de stabilité |
| Logique `applyAttentionGate()` | Stateless contract · WINDOW_SIZE seul paramètre ajustable |
| Structure CalibrationSnapshot | Format JSON exporté — stable |

### Ce que le gel ne couvre pas (toujours ajustable)

- Seuils numériques dans `coherence.js` (D-COH-01 — calibration vivante)
- Messages dans `exposition.js` (formulation améliorable)
- WINDOW_SIZE (paramètre, pas architecture)
- CSS `.v2-message` (style améliorable)

### Critères de déclenchement gel architecture

**Tous requis :**
- [ ] Phase C de l'activation limitée complétée (8 semaines)
- [ ] Critères V2 stable atteints (voir § Critères V2 stable)
- [ ] Aucun signal d'instabilité architecturale observé (winner inattendu, active_exposed > 1)
- [ ] Les contrats de types sont stables depuis Phase 1 sans modification

### Formalisation du gel

```
Date gel architecture : ________________
Composants gelés : PRIORITY_ORDER · types.js · buildPayload() · applyAttentionGate() contrat
Composants toujours ajustables : seuils · messages · WINDOW_SIZE · CSS
Signataire : ________________
```

- [ ] Gel architecture formalisé et archivé (note locale — pas dans le code)

---

## Critères freeze seuils

Le freeze des seuils est distinct du gel de l'architecture. Les seuils sont
des paramètres numériques — leur freeze signifie qu'ils ne seront plus modifiés
sans un déclencheur explicite (signal terrain, anomalie détectée).

### Distinction gel architecture vs freeze seuils

| | Gel architecture | Freeze seuils |
|---|---|---|
| Scope | Structures, contrats, logique | Valeurs numériques T1/T2/T4 · WINDOW_SIZE |
| Réversibilité | Irréversible (→ V2.1) | Réversible (déclencheur signal terrain) |
| Déclencheur | Phase C stable · 8 semaines | Critères V2 stable + aucune anomalie |

### Critères de déclenchement freeze seuils

**Tous requis :**
- [ ] Seuils définitifs documentés dans `calibration-terrain.md` depuis ≥ 4 semaines
- [ ] Aucune correction de seuil déclenchée pendant les 4 semaines Phase C
- [ ] FP T1/T2/T4 stables (mesures bi-hebdomadaires sans dérive)
- [ ] Fréquence totale cockpit stable (≤ 40% sans tendance à la hausse)

### Ce qui peut encore modifier les seuils après le freeze

Le freeze n'est pas irréversible. Les seuils peuvent être modifiés uniquement si :
- Un signal terrain produit un FP > 20% confirmé sur 10 sessions consécutives
- Une modification du contexte de marché produit une dérive de fréquence > 50%
- Une nouvelle tension est ajoutée (→ V2.1)

### Formalisation du freeze seuils

```
Date freeze seuils : ________________
Seuils gelés : T1 X=___ Y=___ · T2 niveaux=___ · T4 MdS>___ QdR>___ · WINDOW_SIZE=___
Condition de dégel : signal FP > 20% ou dérive fréquence > 50%
Signataire : ________________
```

- [ ] Freeze seuils formalisé (note locale)

---

## Critères V2 stable

L'état "V2 stable" est l'état dans lequel la couche V2 est considérée comme
fiable, calibrée, et non-intrusive pour la cohorte d'activation limitée.
C'est la condition de gel des deux composants (architecture + seuils).

### Critères V2 stable — liste exhaustive

**Stabilité technique :**
- [ ] Zéro erreur JavaScript console liée V2 sur ≥ 4 semaines consécutives
- [ ] `active_exposed ≤ 1` — 0 exception sur les exports bi-hebdomadaires
- [ ] localStorage : zéro clé V2 confirmé depuis Phase 1

**Stabilité signal :**
- [ ] Fréquence totale cockpit stable entre 25–40% sur ≥ 4 semaines (ni trop haute, ni trop basse)
- [ ] FP T1/T2 < 20% · FP T4 < 15% confirmés sur les données Phase C
- [ ] T4 fréquence ≤ 10% — rareté préservée

**Stabilité terrain :**
- [ ] Aucune demande de désactivation depuis 3 semaines
- [ ] Charge cognitive : ≤ 2/20 mentions négatives V2 à la question fin Phase C
- [ ] Silence structurel : ≥ 60% sessions sans message sur exports Phase C

**Stabilité doctrine :**
- [ ] Les 6 invariants doctrine silence structurel respectés sur toute la Phase C
- [ ] Aucun message V2 perçu comme alerte ou jugement (0 retour de ce type)

### État V2 stable ≠ V2 parfait

V2 stable signifie que V2 est utilisable en production sans supervision constante.
Il ne signifie pas que tous les seuils sont parfaitement calibrés ou que la
couche V2 ne peut plus être améliorée.

L'amélioration continue est possible — mais dans V2.1, pas dans V2.

---

## Stratégie passage V2 → V2.1

V2.1 est la prochaine itération après stabilisation de V2. Elle n'est pas planifiée —
elle est conditionnelle à des signaux terrain qui ne peuvent pas être anticipés.

### Ce que V2.1 peut couvrir (domaines autorisés)

- Escalade/désescalade de tensions (D-HIE-02/03 — dette architecturale documentée)
- Nouveaux types de tension (si un signal terrain identifie un gap réel non couvert)
- Reformulation des messages T1/T2/T4 (si lisibilité insuffisante confirmée Phase C)
- Gestion multi-session de la fenêtre attention (D-ATT-01 — si over-suppression chronique)

### Ce que V2.1 ne doit pas être

- Un backend de collecte automatique
- Une analytics utilisateur ou une télémétrie
- Une modification de `buildPayload()` ou du pipeline V1
- Une extension du nombre de types de tension sans signal terrain clair
- Un ajout de logique punitive ou de gamification

### Conditions de déclenchement V2.1

V2.1 ne démarre que si :
1. V2 stable est atteint (critères ci-dessus)
2. Gel architecture ET freeze seuils sont formalisés
3. Un signal terrain identifie un gap réel que V2 ne couvre pas
4. Ce gap est validé par la doctrine d'architecture cognitive
   (7 lois · test 5 questions · détection contamination)

**Un seul de ces déclencheurs ne suffit pas.** Les 4 doivent être présents.

### Processus V2.1

V2.1 suit le même processus que V2 : spécification → implémentation incrémentale → shadow mode → activation progressive → calibration → Go/No-Go.

**Aucun raccourci de processus** sous prétexte que "V2 a déjà validé le framework".
Chaque itération repart de Phase 0 pour les nouvelles fonctionnalités.

### Note sur la nommenclature

V2.1 ne signifie pas un "ajout de features". Il signifie une itération sur
la même architecture, avec les mêmes principes, à partir des mêmes lois.
Si le périmètre change radicalement, c'est V3 — pas V2.1.

---

## Statut et suite

**Statut de ce document :** Document stratégique · Version 1.0 · Non commencé

Ce document couvre la transition complète entre pré-production V2 (Phase 4 validée)
et l'état V2 stable en activation limitée réelle.

### Ce que ce document formalise

- La segmentation des opérateurs (V0 expérimenté · V0 nouveau · découverte exclus)
- L'activation progressive en 3 phases (A : 5 opérateurs · B : 20 · C : 30)
- Le monitoring minimal sans SaaS (retours directs · observation · exports ponctuels)
- La validation de stabilité sessions longues et multi-jours
- Les rollbacks production (4 niveaux · délais définis)
- La désactivation immédiate individuelle et collective
- La collecte de feedback qualitatif (sans questionnaire, sans relance)
- Les critères d'extension de cohorte (A→B→C)
- Le gel de l'architecture et le freeze des seuils
- Les critères V2 stable
- La stratégie V2.1 (conditionnelle, non planifiée)

### Position dans la chaîne complète V2

```
Phase 0 (infra)
  → Phase 1 (cohérence shadow)
    → Phase 2 (T3 cockpit)
      → Phase 3 (T1+T2+T4 · calibration · pré-production)
        → Phase 4 (CalibrationSnapshot · calibration définitive · Go/No-Go)
          → Préparation production V2 ← ce document
            → Activation limitée (Phase A → B → C)
              → V2 stable · Gel architecture · Freeze seuils
                → V2.1 (si signal terrain + conditions)
```

**Ce document est le dernier de la chaîne d'architecture V2.**
Il clôt le corpus d'implémentation commencé en Phase 0.

---

*Préparation production V2 — Version 1.0 — 2026-05-24*
