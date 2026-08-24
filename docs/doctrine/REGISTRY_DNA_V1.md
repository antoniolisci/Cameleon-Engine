# Registre des Propriétés Architecturales Constitutives — REGISTRY DNA V1

**Identifiant :** REGISTRY_DNA_V1  
**Nom :** Registre des Propriétés Architecturales Constitutives  
**Statut :** REGISTRE CANONIQUE  
**Version :** V1  
**Date de création :** 2026-08-24  
**Établi par :** Décision humaine — Antonio Lisci  
**Hiérarchie doctrinale :** N1 — Doctrine  
**Famille :** Propriétés architecturales constitutives

---

## 1. Définition d'une propriété DNA

Une propriété DNA est une propriété architecturale **constitutive** de l'identité de Caméléon Engine.

**Critère constitutif :** une propriété est DNA si et seulement si elle satisfait les quatre conditions suivantes.

1. **Observable** — directement démontrable par lecture du code source, sans extrapolation.
2. **Multi-mécanismes** — observable sur plusieurs mécanismes ou couches architecturales distincts, non réductible à un seul fichier ou une seule ligne.
3. **Stable** — indépendante des détails d'implémentation ; elle survivrait à un remplacement complet de la technologie sous-jacente.
4. **Générale** — non réductible à un autre DNA de la liste ; exprime une propriété du système dans son ensemble, pas d'un sous-module.

**Ce qu'un DNA n'est pas :**

- Un invariant normatif — voir ICI-01 et la famille CANONICAL_INVARIANT.
- Un pattern ou mécanisme architectural — voir §3.
- Un mécanisme d'implémentation isolé.
- Une propriété de méthode ou de test.
- Une vision future non encore présente dans le code.

---

## 2. Set canonique — 4 DNA

Le set canonique V1 comprend exactement quatre propriétés DNA. Il a été établi par décision humaine (HD-DNA-04, 2026-08-22) après audit formel du code source au commit de référence `9ceba37`.

---

### DNA-01 — SEPARATION_LECTURE_ACTION

**SHORT_FORMULATION :**
> La production d'une lecture et la détermination des possibilités d'action sont deux responsabilités architecturalement séparées.

**DÉFINITION :**
Caméléon Engine sépare les mécanismes qui produisent une lecture du contexte des mécanismes qui déterminent les possibilités d'action ou les contraintes opérationnelles associées. Une sortie de lecture ne constitue donc pas, par elle-même, un état d'exécution.

**Preuves primaires (code) :**

| Preuve | Source | Observation directe |
|---|---|---|
| `getDecision()` est une fonction pure sans effet de bord | `src/js/decision.js:9` — "Ne modifie pas assessMarket. Ne connaît pas le formulaire." | Lecture de marché produite indépendamment de toute détermination d'action |
| `getDecision(market)` prend une lecture en entrée et retourne posture + alternatives | `src/js/decision.js:69-80` | Séparation structurelle : production de lecture ≠ sortie d'action |
| Pipeline `buildPayload()` : étapes architecturalement distinctes | `src/js/engine.js:238-241` — `baseEngine()` → `profileMatrix()` → `applyAdaptiveFilter()` → `applyValidation()` | Étapes de lecture et de détermination des possibilités d'action séquentielles et séparées |

**Preuves doctrinales :**
- Language System V1 — `docs/doctrine/cameleon_engine_language_system_v1.md`
- `docs/doctrine/lecture_not_equal_action.md`

**Portée de DNA-01 :**
DNA-01 décrit uniquement la séparation architecturale entre (1) la production d'une lecture du contexte et (2) la détermination des possibilités d'action. DNA-01 ne contient aucune assertion sur l'autorité humaine, la validation, la décision humaine explicite, ni la souveraineté sur des fournisseurs. Ces responsabilités appartiennent à DNA-03.

**Signal de dérive :**
Une évolution qui supprimerait la distinction entre production d'une lecture et détermination des possibilités d'action — par exemple une fonction qui produirait une lecture et déclencherait directement un état d'exécution — constituerait un signal de dérive de DNA-01.

---

### DNA-02 — CONTEXTUALISATION_NATIVE

**SHORT_FORMULATION :**
> Le système adapte ses sorties au contexte actif au travers de plusieurs mécanismes structurels distincts.

**DÉFINITION :**
Caméléon Engine adapte ses sorties — score, ton, profil, recommandation — en fonction du contexte actif : état de marché, profil opérateur, état comportemental. Cette adaptation est assurée par plusieurs mécanismes distincts, non par un paramètre central unique.

**Preuves primaires (code) :**

| Preuve | Source | Observation directe |
|---|---|---|
| Modulation ±5% par `personalContext` | `src/js/behavior/analytics/scoring.js:216-227` — "+5% sur la pénalité d'un pattern si récurrent" / "-5% si non récurrent ET tendance improving" | Score adapté au contexte historique de l'opérateur |
| `TONE_LAYER` : état de marché × ton → message | `src/js/tone.js:27` — `const TONE_LAYER` · `tone.js:87-88` — `getMessage(state, tone)` | Message adapté au croisement état de marché × état comportemental |
| `profileMatrix()` : filtre les sorties moteur selon le profil | `src/js/engine.js:90` — `export function profileMatrix(profile, engine, v)` | Sorties adaptées au profil opérateur |
| Signaux comportementaux dans le singleton `_s` | `src/js/behavior.js:43-48` — `let _s = { marketState, validationState, sameStateCount, ... }` | Adaptation comportementale en cours de session |

**Preuves doctrinales :**
- `docs/doctrine/operator_intelligence_v1.md`
- `docs/doctrine/memory_doctrine_v1.md`

**Signal de dérive :**
Une évolution qui remplacerait l'ensemble des mécanismes de contextualisation par un paramètre global unique sans adaptation au profil, au marché ou à l'état comportemental constituerait un signal de dérive de DNA-02.

---

### DNA-03 — AUTORITE_FINALE_HUMAINE

**SHORT_FORMULATION :**
> Les outputs offensifs du système sont architecturalement conditionnés par la valeur de `validationState`, un champ de formulaire fourni par l'opérateur humain.

**DÉFINITION :**
`validationState` est un champ de formulaire (`type: "select"`, label "Validation humaine") dont la valeur est fournie par l'opérateur parmi quatre options : `pending`, `accepted`, `adjusted`, `rejected`. La fonction `applyValidation()` lit ce champ et conditionne les outputs offensifs en conséquence : chaque valeur produit un traitement distinct. L'état `rejected` entraîne le blocage complet de tout output offensif. Les états `pending` et `adjusted` réduisent les signals offensifs. L'état `accepted` les autorise.

**Preuves primaires (code) :**

| Preuve | Source | Observation directe |
|---|---|---|
| `validationState` est un champ de formulaire opérateur | `src/js/data.js:23` — `{ id: "validationState", label: "Validation humaine", type: "select", options: [["pending","En attente"],["accepted","Validée"],["adjusted","Validée sous contrainte"],["rejected","Refusée"]] }` | Valeur fournie par l'opérateur humain |
| `rejected` → VALIDATION BLOCK, attack OFF, sniper OFF | `src/js/engine.js:199-203` | Blocage complet directement prouvé |
| `pending` + offensive ON → attack LIGHT, sniper WATCH | `src/js/engine.js:212-215` | Réduction des signals offensifs directement prouvée |
| `adjusted` → attack LIGHT | `src/js/engine.js:206-209` | Réduction partielle directement prouvée |
| `accepted` + no note → sniper WATCH | `src/js/engine.js:220-222` | Modulation contextuelle directement prouvée |
| "La validation humaine reste nécessaire avant toute exécution." | `src/js/engine.js:216` — `validationSummary` pour l'état `pending` | Propriété nommée dans le code |
| `alignment = "Veto humain"` | `src/js/engine.js:296` | L'architecture reconnaît le veto humain comme état nominal |

**Preuves exclues (motif) :**

- `guardLevel` TTL (`src/js/storage.js`) : démontre directement TEMPORALITE_NATIVE — expiration temporelle d'une donnée comportementale. Ne démontre pas AUTORITE_FINALE_HUMAINE. Preuve classée en DNA-04.
- `src/js/friction.js` : "Ce module ne bloque aucune action. La callback s'exécute toujours." Mécanisme temporel (délai en ms). Ne démontre pas l'autorité finale humaine. Preuve classée en DNA-04.

**Preuves doctrinales :**
- `docs/doctrine/CAMELEON_INTELLECTUAL_CONSTITUTION_V1.md`
- `docs/doctrine/INVARIANT_ICI_01_V1.md` §7

**Relation à ICI-01 :**

DNA-03 et ICI-01 sont distincts et non redondants.

| Dimension | DNA-03 | ICI-01 |
|---|---|---|
| Nature | Propriété architecturale constitutive | Invariant normatif |
| Question | Comment le système est-il structuré ? | Que doit-il ne jamais se produire ? |
| Domaine | Architecture de validation (`validationState`, `applyValidation`) | Accumulation comportementale et son effet sur l'autorité |
| Sens | Description positive de ce qui existe | Contrainte négative sur ce qui est interdit |
| Falsifiabilité | Falsifié si les outputs offensifs ne lisent plus `validationState` | Falsifié si l'accumulation produit de l'autorité autonome (LEVEL-5+) |

Test de séparabilité : les deux peuvent être vrais ou faux indépendamment. Ils sont orthogonaux et complémentaires.

**Signal de dérive :**
Une évolution qui permettrait aux outputs offensifs d'être produits sans aucune lecture de `validationState` constituerait un signal de dérive de DNA-03.

---

### DNA-04 — TEMPORALITE_NATIVE

**SHORT_FORMULATION :**
> Le système intègre nativement la dimension temporelle comme paramètre de première classe.

**DÉFINITION :**
Caméléon Engine traite le temps comme une variable constitutive de ses sorties et de sa mémoire : les données comportementales décroissent, les fenêtres mémorielles sont bornées en entrées et en durée, les délais cognitifs sont calculés à partir du contexte. L'accumulation temporelle enrichit la lecture sans se substituer à la décision humaine.

**Preuves primaires (code) :**

| Preuve | Source | Observation directe |
|---|---|---|
| Décroissance comportementale toutes les 2 minutes | `src/js/behavior.js:32` — `DECAY_INTERVAL_MS = 120000` | Signal comportemental décroissant dans le temps |
| Singleton de session `_s` | `src/js/behavior.js:43-44` — `let _s = { marketState: null, validationState: null, sameStateCount: 0, ... }` | État comportemental scoped à la session |
| FIFO window10, cap-10 | `src/js/behavior/analytics/memory-computer.js:63-70` — `const newWindow10 = [windowEntry, ...memory.window10].slice(0, WINDOW_SIZE)` | Fenêtre mémorielle bornée : les entrées les plus anciennes sont évincées |
| TTL 7 jours sur `guardLevel` | `src/js/storage.js:341` — `const _BHV_TTL = 7 * 24 * 60 * 60 * 1000` · `storage.js:355` — `(Date.now() - ts) >= _BHV_TTL` | Donnée comportementale expirant automatiquement |
| Délai cognitif proportionnel au score | `src/js/friction.js:18,30` — `FRICTION_DELAY(score)` → 0 / 1 500 / 3 000 / 5 000 ms | Délai temporel calculé à partir du score de confiance |

**Note sur `friction.js` :** ce mécanisme est qualifié ici comme mécanisme temporel uniquement — `FRICTION_DELAY` est un délai en millisecondes. Le module déclare explicitement : "Ce module ne bloque aucune action. La callback s'exécute toujours." L'autorité finale humaine relève de DNA-03.

**Preuves doctrinales :**
- `docs/doctrine/memory_doctrine_v1.md`
- `docs/doctrine/operator_intelligence_v1.md`

**Signal de dérive :**
Une évolution qui supprimerait entièrement la différenciation temporelle du système — en traitant toutes les observations comme équivalentes quelle que soit leur ancienneté — constituerait un signal de dérive de DNA-04.

---

## 3. Propriétés non retenues — classification

Ces propriétés ont été analysées et explicitement écartées du set DNA par décision humaine (HD-DNA-01, HD-DNA-02, 2026-08-22).

| Propriété | Décision | Classe finale | Motif |
|---|---|---|---|
| EARNED_COMPLEXITY | NOT DNA — HD-DNA-01 | ARCHITECTURAL_PATTERN | Trop lié à l'évolution V2 et à la gouvernance. Non constitutif. Observé : `src/js/v2/flags.js` — `V2_CALIBRATION: false`. |
| MODULE_BEHAVIORAL_ISOLATION | NOT DNA — HD-DNA-02 | ARCHITECTURAL_PATTERN ou ARCHITECTURAL_MECHANISM | Propriété d'un seul sous-module. Trop étroite pour être constitutive. Observé : `src/js/behavior/behavior-main.js` — "emits NO global events, sets NO window.* properties". |

Le candidat conversationnel SILENCE n'est pas retenu comme DNA V1. La propriété observée est reclassifiée MODULE_BEHAVIORAL_ISOLATION.

---

## 4. Relation entre DNA-03 et ICI-01

La distinction entre DNA-03 et ICI-01 est établie dans DNA-03 (§2 ci-dessus, tableau "Relation à ICI-01"). Elle est réaffirmée ici pour référence directe.

**DNA-03 (constitutif-descriptif)** : propriété architecturale décrivant ce qui existe — `applyValidation()` conditionne les outputs offensifs à partir de `validationState` (champ opérateur).

**ICI-01 (normatif-contraignant)** : invariant décrivant ce qui est interdit — l'accumulation comportementale ne doit jamais, par elle-même, augmenter l'autorité du système sur l'humain.

Ce registre ne modifie pas, ne remplace pas et ne contredit pas `docs/doctrine/INVARIANT_ICI_01_V1.md`.

---

## 5. COGNITIVE_SOVEREIGNTY — statut

**Hypothèse évaluée :**
> "La continuité de la mémoire canonique, de la provenance et de la compréhension de Caméléon Engine ne dépend d'aucun fournisseur d'intelligence externe particulier."

Cette hypothèse a été évaluée lors du pre-write check final (2026-08-24) sur six dimensions. Elle n'est **pas promue** au rang de DNA, d'invariant ou de doctrine dans ce registre.

**Statut par dimension (HEAD `9ceba37`) :**

| Dimension | Statut | Base |
|---|---|---|
| CANONICAL_MEMORY_OWNERSHIP | PARTIALLY_SUPPORTS | Architecture local-first : `canonical-store.js` — `CE_canonical_corpus_v1` en localStorage. Aucun mécanisme de souveraineté formellement enforced contre des fournisseurs futurs. |
| PROVENANCE_OWNERSHIP | PARTIALLY_SUPPORTS | Date produite par la couche : `canonical-store.js:82`. Règle conçue pour l'isolation interne, non explicitement contre des fournisseurs externes. |
| CENTRAL_UNDERSTANDING_OWNERSHIP | DOES_NOT_YET_IMPLEMENT | Compréhension entièrement locale par construction actuelle. Aucun contrat formel. |
| PROVIDER_REPLACEABILITY | DOES_NOT_YET_IMPLEMENT | Mécanisme I-D4 pour adaptateurs de format de données (`ingestion-core.js`). Non applicable aux fournisseurs d'intelligence. |
| PROVIDER_FAILURE_TOLERANCE | PARTIALLY_SUPPORTS (Supabase) / DOES_NOT_YET_IMPLEMENT (intelligence) | Fonctions cognitives locales, indépendantes de Supabase. Aucun fournisseur d'intelligence pour tester la tolérance. |
| PROVIDER_NEUTRAL_CONTRACT | PARTIALLY_SUPPORTED (données) / Contre-évidence (Supabase) | I-D1..I-D4 pour adaptateurs données. Supabase directement intégré — Caméléon adapte à l'API Supabase. |

**Règle épistémique :** l'absence de fournisseurs d'intelligence externes n'est pas une preuve que la souveraineté est implémentée. Une architecture provider-neutre requiert un mécanisme structurel explicite, non la seule absence de dépendances.

---

## 6. Vision future — classification

Les directions architecturales issues de l'analyse ASI:One (pre-write check, 2026-08-24) sont classifiées ci-dessous. Elles ne constituent pas des faits du repository actuel.

| Élément | Classification |
|---|---|
| Fournisseurs d'intelligence externes comme modules d'observation remplaçables | FUTURE_ARCHITECTURAL_DIRECTION |
| Aucun fournisseur propriétaire de la mémoire canonique (contrainte enforced) | FUTURE_ARCHITECTURAL_DIRECTION |
| Résultats externes comme observations entrant dans le pipeline de provenance | FUTURE_ARCHITECTURAL_DIRECTION |
| Isolation du noyau cognitif des défaillances de fournisseurs | FUTURE_ARCHITECTURAL_DIRECTION |
| Contrat Caméléon-owned pour les fournisseurs d'intelligence | FUTURE_ARCHITECTURAL_DIRECTION |
| Routage par coût / qualité / disponibilité / confidentialité / provenance | FUTURE_ARCHITECTURAL_HYPOTHESIS |

**CURRENT FACT ≠ ARCHITECTURAL DIRECTION ≠ ARCHITECTURAL HYPOTHESIS**

Ces trois catégories sont maintenues distinctes dans ce registre et dans toute documentation ultérieure.

---

## 7. Lignage de constitution du registre

```
HISTORICAL_TAXONOMY_STATUS: NON_CANONICAL_AUDIT_LINEAGE
SOURCE: CONVERSATIONAL_AUDIT + GIT_VERIFICATION
```

Les étapes ci-dessous sont des étapes de l'audit de constitution du registre. Elles ne sont pas des versions antérieures commitées de REGISTRY_DNA_V1.md. Les audits conversationnels sont des éléments de lignage, non des versions Git.

| Étape | Date | Nature |
|---|---|---|
| EMERGENT-AUDIT-2026-08-22 | 2026-08-22 | CONVERSATIONAL_AUDIT — 15 candidats analysés |
| DNA Registry Phase 1–2 | 2026-08-22 | GIT_VERIFICATION — 18 propriétés de code (RP-01..RP-18) sur 12 fichiers |
| HUMAN_DECISION_GATE initial | 2026-08-22 | CONVERSATIONAL_AUDIT — 6 candidats soumis |
| HD-DNA-01..HD-DNA-05 | 2026-08-22 | HUMAN_DECISION — set réduit à 4 DNA · corrections sémantiques |
| Pre-write check ASI:One | 2026-08-24 | GIT_VERIFICATION — 0 contradiction · DNA_REGISTRY_IMPACT = NONE |
| AUTHORISE_WRITE | 2026-08-24 | HUMAN_DECISION — Antonio Lisci |

**Table de classification — candidats conversationnels → décisions finales :**

Les identifiants hist-01..hist-15 sont des identifiants internes à cet audit. Ils ne correspondent à aucun artefact Git antérieur à ce document.

| ID conv. | Nom conversationnel | Décision finale | Classe finale | Motif |
|---|---|---|---|---|
| hist-01 | SILENCE | NOT DNA — HD-DNA-02 | ARCHITECTURAL_PATTERN ou MECHANISM | MODULE_BEHAVIORAL_ISOLATION démontré. Trop étroit. |
| hist-02 | SEPARATION_LECTURE_ACTION | RETENU | **DNA-01** | Constitutif, observable, général, stable. |
| hist-03 | VALIDATION_HUMAINE_OBLIGATOIRE | ABSORBÉ | Fondement de **DNA-03** | Absorbé dans AUTORITE_FINALE_HUMAINE. |
| hist-04 | CONTEXTE_MODIFIE_COMPORTEMENT | RETENU — RENOMMÉ | **DNA-02** | Renommé CONTEXTUALISATION_NATIVE (HD-DNA-04). |
| hist-05 | INTELLIGENCE_TEMPORELLE | ABSORBÉ | Fondement de **DNA-04** | Absorbé dans TEMPORALITE_NATIVE. |
| hist-06 | MÉMOIRE_NON_EXPORTABLE | REJETÉ | — | Nom falsifié par `exportOperatorData()` dans `src/js/storage.js`. |
| hist-07 | ACCUMULATION_ASYMÉTRIQUE | REJETÉ | — | Redondant avec ICI-01 (CANONICAL_INVARIANT). |
| hist-08 | EARNED_COMPLEXITY | NOT DNA — HD-DNA-01 | ARCHITECTURAL_PATTERN | Trop lié à l'évolution V2. Non constitutif. |
| hist-09 | VALIDATION_INDÉPENDANTE | REJETÉ | — | Propriété de méthode de test, non du runtime. |
| hist-10 | MULTI_COUCHES_AUTORITÉ | ABSORBÉ | Fondement de **DNA-03** | Structure qui rend AUTORITE_FINALE_HUMAINE observable. |
| hist-11 | ISOLATION_COMPORTEMENTALE | REJETÉ | ARCHITECTURAL_MECHANISM | Équivalent à MODULE_BEHAVIORAL_ISOLATION. |
| hist-12 | FRICTION_ACTIVE | ABSORBÉ | Instance de **DNA-04** | Mécanisme temporel — FRICTION_DELAY en ms (`friction.js`). |
| hist-13 | IDENTITÉ_PAR_PROFIL | REJETÉ | — | Résultat de DNA-02, non propriété constitutive indépendante. |
| hist-14 | (vision future 1) | REJETÉ | — | Non observable dans le code actuel. |
| hist-15 | (vision future 2) | REJETÉ | — | Non observable dans le code actuel. |

---

## 8. Baseline d'évidence

**Commit de référence :** `9ceba37bf866b471d11cf3d24b8de15f4c379463`  
**Dates d'audit :** 2026-08-22 et 2026-08-24  
**Propriétés de code lues :** RP-01 à RP-18 (18 propriétés, 12 fichiers source)  
**Sources doctrinales lues :** DOC-01 à DOC-10 (10 documents doctrine)

---

## 9. Indépendance des 4 DNA et relation à ICI-01

Les 4 DNA sont indépendants — test de séparabilité réalisé lors du pre-write check (2026-08-24) : aucun DNA ne subsume un autre. ICI-01 reste un CANONICAL_INVARIANT séparé de la famille DNA — il est normatif là où les DNA sont constitutifs-descriptifs.
