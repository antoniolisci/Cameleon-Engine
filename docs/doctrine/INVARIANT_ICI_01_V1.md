# Invariant de Conservation de l'Autorité Humaine — ICI-01

**Identifiant :** ICI-01  
**Nom :** Invariant de Conservation de l'Autorité Humaine  
**Alias :** Human Authority Conservation Invariant  
**Statut :** INVARIANT CANONIQUE  
**Version :** V1  
**Date de promotion :** 2026-08-22  
**Promu par :** Décision humaine — Antonio Lisci  
**Hiérarchie doctrinale :** N1 — Doctrine (cf. Hiérarchie doctrinale officielle N0–N5)  
**Famille :** Invariants architecturaux fondateurs

---

## Historique

| Version | Date | Auteur | Description |
|---|---|---|---|
| V0.1 | 2026-08-22 | Projet Caméléon Engine | EMERGENT-AUDIT-2026-08-22 — candidate identifié parmi 7 propriétés émergentes |
| V0.2 | 2026-08-22 | Projet Caméléon Engine | EVIDENCE-CLOSURE-2026-08-22 — OVT-01/02/03 clos, plafond LEVEL-4 confirmé |
| V1.0 | 2026-08-22 | Antonio Lisci (HUMAN_DECISION) | Promotion au statut d'invariant canonique |

---

## 1. Formulation canonique

> L'accumulation peut augmenter la connaissance, la contextualisation et la force des protections proposées par Caméléon Engine. Elle ne doit jamais, par elle-même, augmenter l'autorité décisionnelle ou exécutive du système sur l'humain.

Cette formulation est stable. Elle ne peut être modifiée qu'en tant que décision architecturale majeure, selon les critères définis dans la Constitution Intellectuelle V1.

---

## 2. Conditions de violation

ICI-01 est violé si une information issue de l'accumulation, de la mémoire ou de l'analyse comportementale peut, sans décision humaine correspondante :

1. **Retirer une capacité d'action à l'opérateur** — désactiver un bouton, masquer un champ, restreindre la navigation.
2. **Produire un veto décisionnel canonique** — modifier directement `tradingStatus`, `validationState`, ou tout champ moteur qui détermine les actions autorisées ou interdites.
3. **Déclencher une exécution autonome** — initier un ordre, une action ou une opération sans confirmation humaine explicite à ce point de décision.

---

## 3. Plafond d'autorité

### 3.1 Taxonomie des niveaux d'autorité

| Niveau | Description | Statut sous ICI-01 |
|--------|-------------|-------------------|
| LEVEL-0 | Aucune influence sur l'opérateur | AUTORISÉ |
| LEVEL-1 | Affichage passif (badge, label, historique) | AUTORISÉ |
| LEVEL-2 | Modulation contextuelle bornée | AUTORISÉ |
| LEVEL-3 | Renforcement des signaux de protection | AUTORISÉ |
| LEVEL-4 | Restriction de la recommandation produite par le système | AUTORISÉ — PLAFOND |
| LEVEL-5 | Blocage physique des choix opérateur | **INTERDIT** |
| LEVEL-6 | Veto décisionnel canonique | **INTERDIT** |
| LEVEL-7 | Exécution autonome | **INTERDIT** |

### 3.2 Sémantique de LEVEL-4 — distinction fondamentale

LEVEL-4 désigne la restriction de la **recommandation ou représentation produite par le système**, non la restriction de la **capacité de décision ou d'action de l'opérateur**.

Les observations suivantes sont des instances de LEVEL-4 :
- État BLOCKED affiché dans l'interface
- `engagement_level='NONE'` produit par `renderOperational()`
- Affichage "0%" pour la taille de position
- Affichage "Aucune entrée" en lieu de recommandation

Ces sorties restreignent ce que **le système recommande**. Elles ne restreignent pas ce que **l'opérateur peut décider ou exécuter**. L'opérateur conserve intégralement sa capacité d'action indépendante.

ICI-01 autorise LEVEL-4 précisément parce que l'autorité finale reste humaine. Si l'accumulation comportementale parvenait à restreindre physiquement une capacité d'action de l'opérateur — désactiver un bouton, masquer une option, bloquer une navigation — cela constituerait LEVEL-5 et violerait ICI-01.

### 3.3 Plafond observé et certifié

```
ICI01_ALLOWED_MAX_LEVEL: LEVEL-4
ICI01_FORBIDDEN_LEVELS: LEVEL-5 / LEVEL-6 / LEVEL-7
```

Le plafond LEVEL-4 est fondé sur preuves directes, non sur déclaration. Chaque niveau interdit a été falsifié par lecture du code source au commit de référence.

---

## 4. Fondement de preuves

### 4.1 Baseline d'évidence

**Commit de référence :** `913e923de30cfc443e55df5b28002d92a6fc1401`  
**Audit :** EMERGENT-AUDIT-2026-08-22 + EVIDENCE-CLOSURE-2026-08-22

### 4.2 Vérifications ouvertes (OVT)

**OVT-01 — Blocage physique UI (CLOS)**  
Question : le riskLevel/behaviorState élevé désactive-t-il physiquement des contrôles UI ?  
Résultat : LEVEL-4 confirmé. Aucun `button.disabled` conditionné aux données comportementales dans `render.js`. `computeFinalDecision()` et `renderOperational()` produisent des restrictions textuelles uniquement.

**OVT-02 — Propagation d'autorité via certifications (CLOS)**  
Question : les certifications auto-attribuées propagent-elles de l'autorité ?  
Résultat : LEVEL-1 confirmé. `personalContext.certifications` n'est consommé ni par `scoring.js`, ni par `coaching.js`, ni par aucun module de politique trading.

**OVT-03 — Adaptation statique ou dynamique de getAdaptiveTone (CLOS)**  
Question : `getAdaptiveTone()` est-il véritablement adaptatif ou une simple table de correspondance ?  
Résultat : STATEFUL_ADAPTATION confirmée. Singleton de session `_s`, 4 signaux live, décroissance 2 min. Classé ARCHITECTURAL_MECHANISM. Plafond LEVEL-3/4, aucune persistance localStorage.

### 4.3 Fichiers sourcés

| Fichier | Sections vérifiées |
|---------|-------------------|
| `src/js/render.js` | getBehaviorState() · computeFinalDecision() · renderOperational() · buildCurrentPayload() |
| `src/js/behavior.js` | getAdaptiveTone() · module singleton `_s` · signaux et décroissance |
| `src/js/behavior/analytics/scoring.js` | personalContext modulation · certifications non consommées |
| `src/js/behavior/analytics/memory-computer.js` | attribution des certifications · logique WINDOW_SIZE |
| `src/js/behavior/analytics/coaching.js` | certifications non consommées |
| `src/js/storage.js` | withUserKey() · guardLevel TTL · resolveKey() |
| `src/js/behavior/storage/memory-repo.js` | getMemory() · structure complète |

---

## 5. Lignage épistémique

| Étape | Statut | Description |
|-------|--------|-------------|
| EMERGENT-AUDIT-2026-08-22 | COMPLÉTÉ | 7 propriétés analysées, 10 questions + contre-audit chacune |
| Reclassification CQ-7 | APPLIQUÉE | EMERGENT-01/02/06/07 → DNA_IMPLEMENTATION |
| ICI-01 classé EMERGENT_PROPERTY | VALIDÉ | Totalité non réductible à un seul DNA |
| EVIDENCE-CLOSURE-2026-08-22 | COMPLÉTÉE | OVT-01/02/03 clos, plafond LEVEL-4 établi par preuves |
| Verdict | ÉMIS | ICI01_CANDIDATE_INVARIANT_READY_FOR_HUMAN_PROMOTION |
| HUMAN_DECISION | PROMOTÉ | 2026-08-22 — Antonio Lisci |

---

## 6. Relations conceptuelles — EMERGENT-AUDIT-2026-08-22

ICI-01 n'est pas un DNA. C'est une propriété émergente dont la totalité dépasse tout DNA individuel.

**Note sur la taxonomie DNA :** Les propriétés architecturales (DNA-01 à DNA-14) ont été identifiées lors de l'EMERGENT-AUDIT-2026-08-22. Cette taxonomie n'est pas encore formalisée dans un document du dépôt. Les relations ci-dessous sont référencées par leur contenu conceptuel, sans ID canonique, jusqu'à ce que le registre DNA soit commité.

| Propriété conceptuelle | Relation avec ICI-01 |
|------------------------|---------------------|
| Silence structurel (module comportemental n'émet pas d'événements globaux) | Cohérent avec le plafond LEVEL-4 — l'accumulation n'émet pas d'événements qui modifieraient le comportement d'autres modules |
| Validation humaine obligatoire pour les états critiques | Fondement direct de la condition "sans décision humaine correspondante" dans la formulation canonique |
| Intelligence temporelle (accumulation temporelle enrichit la lecture) | Légitimée par ICI-01 jusqu'au plafond LEVEL-4 — l'accumulation dans le temps renforce la connaissance, jamais l'autorité |
| Validation indépendante (tests avec contrats de retour vérifiables) | Méthode de vérification ICI-01 — les preuves OVT-01/02/03 reposent sur cette propriété |
| Architecture multi-couches (autorité maximale bornée par couche) | Architecture qui rend ICI-01 observable — chaque couche a un plafond, ICI-01 fixe le plafond global |

---

## 7. Relation à la Constitution Intellectuelle V1

ICI-01 est une extension du Language System V1 appliquée à l'axe de l'accumulation :

- **Language System V1** établit que la lecture n'est jamais une instruction.
- **ICI-01** établit que l'accumulation enrichit les lectures, jamais l'autorité du système.

Les deux invariants sont orthogonaux et complémentaires. ICI-01 ne modifie pas, ne remplace pas et ne contredit pas la Constitution Intellectuelle V1.

---

## 8. Conséquences architecturales

### 8.1 Contraintes immédiates

| Module | Contrainte |
|--------|-----------|
| `scoring.js` | La modulation observée via `personalContext` est de ±5%. Toute évolution future qui permettrait à l'accumulation d'atteindre LEVEL-5+ d'autorité sans décision humaine correspondante violerait ICI-01. |
| `memory-computer.js` | Aucune valeur mémorielle ne peut être écrite directement dans les champs moteurs (`tradingStatus`, `validationState`). |
| Certifications | Toute extension lisant les certifications pour activer/désactiver des fonctionnalités trading doit inclure une étape de confirmation humaine. |
| `getAdaptiveTone()` | L'escalade de ton ne doit jamais désactiver directement un champ de formulaire ou forcer une valeur de décision. |
| guardLevel | Ne peut pas, seul, déclencher un état BLOCKED sans la logique multi-facteurs de `computeFinalDecision()`. |
| `computeFinalDecision()` | Si jamais élevé à désactiver physiquement des contrôles UI, une décision humaine est requise. |

### 8.2 Contraintes préventives

- **Agents futurs :** "le système" dans la formulation s'étend à tout sous-système automatisé. L'invariant ne peut pas être contourné par délégation à un agent.
- **Automatisations :** tout batch ou trigger automatique basé sur l'accumulation comportementale doit rester dans LEVEL-0 à LEVEL-4.
- **Couche d'exécution :** aucun pipeline d'exécution déclenché par accumulation comportementale ne peut opérer sans confirmation humaine explicite.

---

## 9. Recommandations de non-régression

**Obligatoires**

| Code | Portée | Recommandation |
|------|--------|---------------|
| R1 | Code review | Toute PR touchant `scoring.js`, `memory-computer.js`, `render.js` (getBehaviorState/computeFinalDecision), ou la logique guardLevel inclut une vérification explicite qu'aucun chemin de données accumulées n'atteint LEVEL-5+. |
| R2 | Nouvelles clés localStorage comportementales | Documenter le plafond d'autorité (LEVEL-0 à LEVEL-4) dans le commentaire d'implémentation. |

**Fortement recommandées**

| Code | Portée | Recommandation |
|------|--------|---------------|
| REC-1 | Clôture LOT comportemental | Checklist de conformité ICI-01 à appliquer à la clôture de tout LOT touchant le module comportemental. |
| REC-2 | render.js | Bloc de commentaire dans `computeFinalDecision()` et `renderOperational()` citant ICI-01 et le plafond LEVEL-4. |
| REC-3 | Feature certifications | Si les certifications sont étendues (badges UI, privilèges), vérifier qu'aucun code downstream ne les lit pour modifier les décisions trading. |

---

## 10. Note sur l'ambiguïté Q6

La formulation utilise "le système" sans délimitation explicite. Dans le contexte V1, "le système" désigne Caméléon Engine en tant que déployé à la date de promotion. Si des agents autonomes sont introduits dans l'architecture future, une clarification explicite étendant ICI-01 à ces sous-systèmes sera nécessaire.

Cette ambiguïté est documentée, non bloquante pour V1.

---

## 11. Vérifications ouvertes non-bloquantes

| Code | Question | Statut |
|------|----------|--------|
| OVT-04 | `tradingStatus` possède-t-il une énumération canonique dans `data.js` ou `decision.js` ? | OPEN_NON_BLOCKING |
| OVT-05 | `payloadCurrent`/`uiState` scope device-global documenté comme KNOWN_LIMITATION formelle ? | OPEN_NON_BLOCKING |

Ces vérifications concernent la qualité documentaire. Elles ne remettent pas en cause l'invariant.
