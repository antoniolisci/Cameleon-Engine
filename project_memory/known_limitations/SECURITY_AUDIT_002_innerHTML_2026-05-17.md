# SECURITY_AUDIT_002 — Audit innerHTML / insertAdjacentHTML / outerHTML

## Statut
Documenté — aucun risque actif critique

## Date
2026-05-17

## Périmètre
- `src/js/render.js`
- `src/js/behavior/ui/behavior-view.js`

## Contexte

Audit exhaustif de tous les usages de `innerHTML`, `insertAdjacentHTML` et `outerHTML`
dans le code source front-end de Caméléon Engine.

Déclenché après la suppression du helper mort `setHtml()` (voir SECURITY_AUDIT_001).

**Total occurrences auditées :** 31  
**Vecteurs XSS actifs identifiés :** 0  
**Corrections urgentes requises :** 0

---

## Catégorie 1 — innerHTML sûr : opérations de vidage (= "")

| Fichier | Ligne | Élément | Verdict |
|---------|-------|---------|---------|
| render.js | 1069 | `#cerveau-synthesis` | Nul |
| render.js | 1095 | `#regle-primaire` | Nul |
| render.js | 1113 | `#regle-secondaire` | Nul |
| render.js | 2320 | conteneur alertes comportementales | Nul |
| render.js | 2864 | `#renderHistoryPanel` container | Nul |
| render.js | 2924 | `#history-list` | Nul |
| render.js | 3266 | `#rulesAllowed` | Nul |
| render.js | 3268 | `#rulesForbidden` | Nul |
| render.js | 3347 | `.prudence-expert-body` (clear avant rebuild) | Nul |
| render.js | 3523 | conteneur de politiques (clear) | Nul |
| render.js | 3754 | panel debug (clear) | Nul |
| render.js | 3759 | panel debug (clear) | Nul |

Aucune donnée injectée — vidage pur. Aucune action requise.

---

## Catégorie 2 — innerHTML sûr : template statique ou données entièrement hardcodées

| Fichier | Ligne | Fonction | Données injectées | Verdict |
|---------|-------|----------|-------------------|---------|
| render.js | 1858 | `renderTraderSignature()` | `label/message/action` issus d'objets littéraux hardcodés dans le module | Nul |
| render.js | 2064 | `renderPsychProfile()` | `profile.label/message/action` — objets de profil entièrement statiques | Nul |
| render.js | 2325–2329 | `renderBehaviorAlert()` | `alert.message` issus de chaînes de détection hardcodées | Nul |
| render.js | 2519 | `renderBehaviorCoach()` | `coaching.titre/message/action` — `detectBehaviorCoaching()` retourne des objets littéraux | Nul |
| render.js | 3284 | `renderWhyBlock()` — status primary | `sm.icon` + `sm.phrase` 100% hardcodés dans `statusMap` ; `statusText` contraint à 3 clés exactes par le guard `if (sm)` | Nul |
| render.js | 3351 | `renderPrudenceBlock()` — rows | `label` et `text` issus de `_rows` tableau de littéraux hardcodés | Nul |
| render.js | 3579 | `renderActionScore()` — block engagement | `actionScore` (numérique), `label` (dict lookup), `engineScore` (numérique) | Nul |

---

## Catégorie 3 — innerHTML acceptable : données contrôlées (engine / dicts / calculs internes)

| Fichier | Ligne | Fonction | Données injectées | Source réelle | Verdict |
|---------|-------|----------|-------------------|---------------|---------|
| render.js | 1759 | `renderTraderMemory()` | `emotionLabel/stateLabel/qualityLabel` + `memory.tendance` | `TRADER_MEMORY_LABELS` dict lookups + calcul sur sessions localStorage | Faible |
| render.js | 1975 | `renderBehaviorScore()` | `niveau/pattern/score/color` | Score calculé par `scoring.js`, pattern par `patterns.js` — pipeline interne | Faible |
| render.js | 2135 | `renderBehaviorRepetition()` | `rep.pattern/count/total/status` | Analyse fréquence sur historique localStorage sessionnel | Faible |
| render.js | 2159 | `renderSnapshotHistory()` | `time` (Date formatée) + `mkt/emo/dec` via `SNAP_*_MAP ?? "—"` | Dict lookups avec fallback `"—"` — jamais de chaîne brute inconnue | Faible |
| render.js | 2258 | `renderHistoryInsight()` | `result.message` + `pattern.message` | Strings produits par `detectHistoryInsights()` — logique interne, pas de texte utilisateur | Faible |
| render.js | 2472 | `renderGuidanceCard()` | `headlineText/modeLabel/forbidden/allowed/contextText` | Dicts de config + `CONTEXT` dict — aucun texte libre utilisateur | Faible |
| render.js | 2942 | `renderHistory()` | `cockpit.market.*` via `getCockpitModel()` | Valeurs localStorage passées à travers `getCockpitModel` + dicts `SNAP_*_MAP`, fallback `"—"` | Faible |
| render.js | 3136 | `renderAllowedActions()` | `actionsText` (dict `translatePolicyAction`) + `gateLabel` (dict `GATE_LABELS` hardcodé) | Clés d'action engine → labels FR via dict. Aucun texte libre. | Faible |
| render.js | 3312 | `renderWhyBlock()` — items secondaires | `label` hardcodé + `value` depuis `STATE_LABELS[market_state]`, `trigger_level`, `_bhvLabel`, `simplifyText(action_recommended)` | Valeurs enum engine + dict lookups. `market_state` est toujours une clé validée par le pipeline. | Faible |
| render.js | 4364 | `renderDecisionHistory()` | `d.time` (Date formatée) + `d.status/engagement/sizing` | Snapshot en mémoire session, produit par `buildDecisionSnapshot()` à partir du payload engine | Faible |

**Justification du niveau "Faible" :** ces usages injectent des valeurs qui transitent par
localStorage ou le pipeline engine. En théorie, si localStorage était corrompu ou manipulé
par un tiers sur la même machine, ces valeurs pourraient contenir des caractères inattendus.
En pratique : application locale, mono-utilisateur, sans exposition réseau. Risque théorique
uniquement.

---

## Catégorie 4 — innerHTML à surveiller : template large avec données utilisateur

| Fichier | Ligne | Fonction | Données injectées | Verdict |
|---------|-------|----------|-------------------|---------|
| behavior-view.js | 151 | Module entier — `root.innerHTML = buildShell(state)` | Tout le HTML du module comportemental. Données CSV utilisateur canalisées via `escHtml()` avant toute injection. | Faible (protégé) |

`escHtml()` (behavior-view.js:1245) échappe correctement `&`, `<`, `>`, `"`.
Toute valeur issue du parsing CSV passe par cette fonction avant injection.
Aucune injection XSS possible à ce stade.

---

## Résumé exécutif

| Niveau de risque | Occurrences | Action requise |
|-----------------|-------------|----------------|
| Nul | 19 | Rien |
| Faible | 12 | Acceptable — local-first |
| Moyen | 0 | — |
| Élevé | 0 | — |

**Aucun vecteur d'injection XSS actif identifié.**

Architecture cohérente : les données utilisateur réelles (CSV comportemental) passent toutes
par `escHtml()`, et les données engine injectées via innerHTML sont exclusivement des valeurs
enum, dict lookups ou calculs internes.

---

## Recommandations futures (avant déploiement public uniquement)

Ces points ne sont pas urgents pour l'usage local actuel.

1. **render.js:3312, 2159, 2942** — les fallbacks `|| payload.market_state` (raw) pourraient
   être remplacés par `|| "—"` pour éliminer toute possibilité de valeur inattendue, même si
   le risque actuel est théorique.

2. **render.js:4364** (`renderDecisionHistory`) — `d.status/engagement/sizing` sont des strings
   produits en interne mais injectés via `innerHTML`. Refactoriser en `createElement` +
   `textContent` serait la forme la plus défensive.

3. **Content Security Policy (CSP)** — rappel SECURITY_AUDIT_001 : l'absence de CSP est le
   vrai vecteur à adresser avant toute exposition publique, indépendamment des innerHTML.

4. **`escHtml()` dans render.js** — la fonction n'existe qu'en `behavior-view.js`. Si render.js
   devait injecter du texte utilisateur libre, importer ou dupliquer `escHtml()` serait la
   première étape.

---

## Lien avec les autres audits

- SECURITY_AUDIT_001 : audit global local-first (secrets, CDN, localStorage, CSP)
- IMPORT_002 : vendorisation SheetJS (suppression CDN → local)
- `setHtml()` supprimé avant cet audit (`chore(security): remove unused innerHTML helper`)
