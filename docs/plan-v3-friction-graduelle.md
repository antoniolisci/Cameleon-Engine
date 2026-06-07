> **ARCHIVÉ**
>
> Ce document décrit un plan désormais implémenté.
>
> Il est conservé comme trace historique du développement de Caméléon Engine.
>
> Pour l'état actuel du système, consulter :
> `docs/architecture/canonical_motor_state_2026.md`
>
> Statut : Implémenté et clôturé.
>
> Ne plus utiliser ce document comme référence d'architecture active.

# Plan V3 — Friction graduelle
## Caméléon Engine · Document de plan · Observation uniquement

> Aucun patch dans ce document.
> Aucun changement JS, CSS, moteur, buildPayload(), scoring, ou localStorage existant.
> Ce document est un plan opérationnel. Les patches seront appliqués séparément.

---

## Doctrine de référence

> "Caméléon Engine ne bloque pas.
> Il ralentit le geste impulsif juste assez que la conscience rattrape la pulsion."

La friction V3 n'est pas un système de sécurité. C'est un ralentisseur cognitif.
Elle ne punit pas. Elle ne refuse pas. Elle crée un espace entre l'impulsion et l'acte.

---

## Section 1 — Analyse des points d'entrée

### 1.1 — Bouton Snapshot (`#saveSnapshotBtn`)

**Localisation :** `src/index.html` ligne 621, handler `render.js` ligne 4984.

**Fonctionnement actuel :**
```
clic → vérifie latestSnapshotContext → handleManualSnapshot() → saveSnapshot()
     → backups.prepend(snapshot)    [localStorage write]
     → renderTraderMemory() + renderTraderSignature() + renderBehaviorProfile()
     → btn.disabled = true pendant 1200ms → retour à l'état initial
```

**Conséquence réelle du clic :**
- Écriture dans `localStorage` (behavioral memory)
- Influence sur le profil comportemental, la signature, l'historique
- Base de calcul pour `computeSnapshotQuality()` et `computeBehaviorGate()`

**Impact sur l'engine :** aucun — `buildPayload()` et scoring ne lisent pas ce localStorage.

**Doublon guard existant :** `saveSnapshot()` retourne `false` si
`market_state|emotion_state|state` est identique au dernier enregistrement.

**Friction cible :**
Le snapshot d'un état de basse confiance a une valeur comportementale réelle
(enregistrer un mauvais état permet au système de le détecter).
La friction ne bloque donc **jamais** le snapshot — elle contextualise l'acte.

---

### 1.2 — Boutons de mode (`#modeCoreBtn`, `#modeAttackBtn`, `#modeSniperBtn`, `#modeWaitBtn`)

**Localisation :** `src/index.html` lignes 491–504, handlers `render.js` lignes 5035–5053.

**Fonctionnement actuel :**
```
clic modeCoreBtn   → activateTab("pilotage") + focusPanel("coreText")
clic modeAttackBtn → activateTab("pilotage") + focusPanel("action")
clic modeSniperBtn → activateTab("pilotage") + focusPanel("triggerBox")
clic modeWaitBtn   → activateTab("moteur")   + focusPanel("lectureDayMain")
```

**Conséquence réelle du clic :**
Purement **navigationnelle**. Ces boutons n'écrivent rien, ne modifient aucun état
moteur, aucun localStorage. L'état `active` des boutons est **imposé par le moteur**
via `setActionMode(payload)` — le clic ne le change pas.

**Lecture :** un utilisateur qui clique "Attaque" quand `visualMode === "ATTENTE"`
ne change rien au moteur. Il navigue vers le panel Pilotage/action.

**Distinction essentielle :** la friction ici n'est pas sur une action conséquente —
elle est sur un **geste d'intention**. L'utilisateur signale qu'il envisage d'attaquer.
Ce geste d'intention, quand la confiance est faible, mérite d'être conscientisé.

**Friction cible :**
Pour les boutons CORE et WAIT : friction légère ou nulle (postures défensives ou neutres).
Pour les boutons ATTACK et SNIPER : friction graduelle selon le score de confiance
(ces postures sont offensives — le geste impulsif le plus probable).

---

### 1.3 — Ce que la friction ne touchera PAS

| Élément | Raison |
|---|---|
| `#saveBtn` (Pilotage) | Sauvegarde payload JSON local, usage technique |
| `#clearBtn` (Pilotage) | Action destructive — hors scope, traitement séparé |
| `#clearSnapshotBtn` | Idem |
| `#prefillBtn` (Constellium) | Simulation pédagogique, hors scope |
| Onglets (Moteur/Pilotage/Mémoire) | Navigation pure, jamais de friction |
| Formulaire marché (inputs) | Saisie de données, jamais de friction |

---

## Section 2 — Grille de friction par score

Le score de confiance (`computeExecutionConfidence()`) est calculé à la volée
au moment du clic. Il n'est pas mis en cache entre les cycles.

### 2.1 — Snapshot (`#saveSnapshotBtn`)

| Score | Comportement | Mécanisme | Message |
|---|---|---|---|
| 80–100 | Immédiat | Aucune friction | (comportement actuel conservé) |
| 55–79 | Délai court | Bouton grisé 1.5s avant confirmation | "Enregistrement dans 1.5s…" |
| 30–54 | Délai moyen + message | Bouton grisé 3s, phrase contextuelle visible | "Confiance réduite — état enregistré pour analyse." |
| 1–29 | Délai long + lecture | Bouton grisé 5s, phrase factuelle visible | "Confiance faible ({score}%) — enregistrement en cours." |
| 0 | Message immédiat | Aucun délai, mais label différent post-action | "État hors condition enregistré." |

**Règle absolue :** le snapshot se déclenche toujours.
La friction est temporelle et informationnelle, jamais un veto.

---

### 2.2 — Boutons ATTACK et SNIPER

| Score | Comportement | Mécanisme | Message |
|---|---|---|---|
| 80–100 | Navigation immédiate | Aucune friction | (comportement actuel conservé) |
| 55–79 | Délai + info | Navigation après 1.5s, message neutre | "Mode offensif — confiance partielle ({score}%)." |
| 30–54 | Délai + lecture | Navigation après 3s, phrase factuelle | "Confiance réduite — posture offensive à évaluer avec discipline." |
| 1–29 | Délai + lecture obligatoire | Navigation après 5s | "Confiance faible ({score}%) — ce mode est disponible. Prendre un moment." |
| 0 | Message + navigation différée | Navigation après 5s | "Hors condition d'exécution — navigation disponible." |

**Règle absolue :** la navigation s'exécute toujours, même à score 0.
L'utilisateur atteint toujours le panel cible. La friction est temporelle.

---

### 2.3 — Boutons CORE et WAIT

| Score | Comportement |
|---|---|
| Tous scores | Navigation immédiate, aucune friction |

**Justification :** CORE (défensif) et WAIT (observation) sont des postures de prudence.
Les frictionner contredit la doctrine — ralentir un geste de retrait est contre-productif.

---

## Section 3 — Mécanisme technique proposé

### 3.1 — Fonction utilitaire `applyFriction(score, callback, message)`

Fonction pure à créer dans un nouveau fichier `src/js/friction.js`.

**Signature :**
```
applyFriction(score, btn, callback, getMessage)
```

**Comportement :**
1. Calcule le délai selon le score (0 / 1500 / 3000 / 5000 ms)
2. Si délai > 0 : grise le bouton, injecte le message, déclenche callback après délai
3. Si délai = 0 : exécute callback immédiatement
4. Nettoie l'état visuel du bouton après exécution

**États visuels gérés :**
- `btn.disabled = true` pendant le délai
- `data-friction-state="pending"` sur le bouton
- Injection du message dans un conteneur dédié adjacent (pas d'alert, pas de modal)
- Nettoyage automatique après exécution

**Règle : la fonction ne connaît pas le moteur.**
Elle reçoit un score entier (0–100) et une callback. C'est tout.

---

### 3.2 — Point d'injection snapshot

Remplacer dans `bindControls()` :
```javascript
// Avant
$("saveSnapshotBtn")?.addEventListener("click", () => {
  if (!latestSnapshotContext) return;
  const saved = handleManualSnapshot(...);
  ...
});

// Après
$("saveSnapshotBtn")?.addEventListener("click", () => {
  if (!latestSnapshotContext) return;
  const score = computeExecutionConfidence(
    currentPayload, getBehaviorState(currentPayload)
  ).score;
  applyFriction(score, $("saveSnapshotBtn"), () => {
    const saved = handleManualSnapshot(...);
    ...
  }, (s) => getFrictionMessage("snapshot", s));
});
```

---

### 3.3 — Point d'injection mode ATTACK / SNIPER

Remplacer dans `bindControls()` :
```javascript
// Avant
$("modeAttackBtn")?.addEventListener("click", () => {
  activateTab("pilotage");
  focusPanel("action");
});

// Après
$("modeAttackBtn")?.addEventListener("click", () => {
  const score = computeExecutionConfidence(
    currentPayload, getBehaviorState(currentPayload)
  ).score;
  applyFriction(score, $("modeAttackBtn"), () => {
    activateTab("pilotage");
    focusPanel("action");
  }, (s) => getFrictionMessage("offensive", s));
});
```

Idem pour `modeSniper`. CORE et WAIT ne sont pas wrappés.

---

### 3.4 — Messages de friction (`getFrictionMessage`)

Fonction pure dans `friction.js`. Retourne une string selon le contexte et le score.

**Registre obligatoire :**
- Factuel : score visible, état décrit sans jugement
- Sobre : une phrase, jamais deux
- Non punitif : aucun "tu ne devrais pas", aucun "attention", aucun "danger"
- Temporel : informe du délai restant si pertinent

**Exemples validés :**

Snapshot :
- 55–79 : "Enregistrement dans un instant — confiance d'exécution : {score}%."
- 30–54 : "Confiance réduite ({score}%) — état enregistré pour suivi comportemental."
- 1–29  : "Confiance faible ({score}%) — enregistrement en cours."
- 0     : "État hors condition enregistré."

Boutons offensifs :
- 55–79 : "Mode offensif — confiance actuelle : {score}%."
- 30–54 : "Confiance réduite — posture offensive disponible. Prendre un moment."
- 1–29  : "Confiance faible ({score}%) — panel disponible dans quelques secondes."
- 0     : "Hors condition d'exécution — navigation en cours."

**Mots interdits dans les messages :**
bloqué, interdit, impossible, danger, alerte, stop, refusé, verrouillé, attention (seul).

---

### 3.5 — Conteneur DOM pour les messages de friction

Un `div.friction-message` adjacent à chaque bouton frictionnant.
Vide par défaut (`display:none` ou `aria-hidden`).
Injecté dynamiquement par `applyFriction()`, nettoyé après exécution.
Aucun style intrusif — texte sobre, petit, calme.

---

## Section 4 — Risques techniques

| Risque | Nature | Mitigation |
|---|---|---|
| Double clic pendant délai | Déclenchement multiple | `btn.disabled = true` pendant le délai |
| `currentPayload` null au clic | NullPointerException | Guard `if (!currentPayload) return` avant calcul |
| Timer non nettoyé | Fuite mémoire | `clearTimeout` systématique au nettoyage |
| Focus perdu pendant délai | UX dégradée | Focus maintenu sur le bouton via `btn.focus()` |
| Navigation tab qui précède le focusPanel | Race condition | `applyFriction` callback atomique (tab + focus dans même tick) |

---

## Section 5 — Risques produit

| Risque | Nature | Mitigation |
|---|---|---|
| Sensation de lenteur perçue comme un bug | UX | Message explicite sur le délai ("dans un instant…") |
| Friction perçue comme un jugement | Doctrine | Wording factuel strict — aucun registre normatif |
| CORE/WAIT frictionnés par erreur | Architecture | Ces boutons ne passent jamais dans `applyFriction` |
| Score 0 bloque navigation | Doctrine | Navigation toujours exécutée, même à score 0 |
| Friction snapshot sur doublon | Logique | `saveSnapshot()` retourne false → feedback "Aucun changement" conservé |

---

## Section 6 — Ordre de patches V3

```
V3-PATCH-1  friction.js — applyFriction() + getFrictionMessage()   risque : faible
            Fichier pur, aucun effet de bord. Testable sans UI.

V3-PATCH-2  Friction snapshot                                       risque : faible
            Wrapper du handler existant. Pattern btn.disabled déjà en place.

V3-PATCH-3  Friction boutons ATTACK et SNIPER                       risque : faible
            Wrapper des deux handlers. CORE et WAIT inchangés.

V3-PATCH-4  DOM friction-message containers                         risque : minimal
            Ajout de deux divs vides dans index.html.
            CSS : 2–3 règles seulement (taille, opacité, display).
```

---

## Section 7 — Critères de validation

### Par patch

**V3-PATCH-1 :**
- `applyFriction(95, btn, cb, msg)` → callback immédiate, aucun délai
- `applyFriction(40, btn, cb, msg)` → callback après 3s exactement
- `applyFriction(0, btn, cb, msg)`  → callback après 5s, message visible
- Double clic pendant délai → une seule exécution

**V3-PATCH-2 :**
- Score 90 → snapshot immédiat, comportement actuel conservé
- Score 60 → snapshot après 1.5s, message visible pendant le délai
- Score 20 → snapshot après 5s, message factuel visible
- Doublon → "Aucun changement détecté" conservé (pas de friction sur doublon)

**V3-PATCH-3 :**
- Score 90 + clic ATTACK → navigation immédiate
- Score 40 + clic ATTACK → navigation après 3s, message visible
- Score 10 + clic SNIPER → navigation après 5s
- Clic CORE (tout score) → navigation immédiate, aucun message
- Clic WAIT (tout score) → navigation immédiate, aucun message

### Sur 5 états moteur

| État | Score attendu | Snapshot | ATTACK | SNIPER |
|---|---|---|---|---|
| BLOCKED × NONE | 0 | délai 5s | délai 5s | délai 5s |
| PROTECT × MINIMAL | ~6 | délai 5s | délai 5s | délai 5s |
| WAIT × NEUTRAL | ~27 | délai 5s | délai 5s | délai 5s |
| READY × NEUTRAL | ~45 | délai 3s | délai 3s | délai 3s |
| ALIGNED × FULL | ~90 | immédiat | immédiat | immédiat |

### Test manifeste

Après chaque patch :
> "Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre."

Questions :
1. La friction ajoute-t-elle de la conscience ou de la frustration ?
2. L'utilisateur comprend-il pourquoi il attend ?
3. Peut-il toujours agir s'il le décide ?

Si la réponse à (1) est frustration, ou à (3) est non : le patch est à retravailler.

---

## Section 8 — Ce que V3 ne fera jamais

- Empêcher une action de s'exécuter
- Afficher une popup ou un modal
- Utiliser les mots du registre carcéral (voir V2-PATCH-3)
- Modifier la logique moteur, le scoring, buildPayload()
- Écrire dans localStorage (hors pattern existant)
- Introduire un état global de friction (la friction est stateless, calculée à chaque clic)
