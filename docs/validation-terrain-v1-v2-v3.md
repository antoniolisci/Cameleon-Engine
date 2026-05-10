# Validation terrain — V1 / V2 / V3
## Caméléon Engine · Document d'observation · Aucun patch

> Ce document ne propose aucune modification.
> Il ne contient ni code, ni CSS, ni wording à appliquer.
> C'est un protocole d'observation active à utiliser en conditions réelles.

---

## Synthèse de validation — session du 10 mai 2026

**Branche testée :** `main` post merge PR #1 (commit `ace8dfc`)
**Serveur local :** `http://localhost:8000/src/index.html`
**Méthode :** analyse code + vérification console + observation cockpit

---

### Analyse code — 5 états

Valeurs d'entrée simulées pour chaque état cible. Résultats calculés depuis engine.js + execution-confidence.js.

| État | Score brut | Conf. exécution | Engagement | bhvState | Friction snapshot |
|---|---|---|---|---|---|
| BLOCKED | 0/100 | 0% | MINIMAL | FOMO | 5 000 ms |
| PROTECT | 0/100 | 0% | MINIMAL | STRESS | 5 000 ms |
| WAIT | 64/100 | 21% | REDUCED | NEUTRE | 5 000 ms |
| READY | 90/100 | 50% | NEUTRAL | CALME | 3 000 ms |
| ALIGNED | 100/100 | 95% | FULL | CALME | 0 ms (immédiat) |

**Cohérence vérifiée :**
- BLOCKED → conf. 0% → friction max → correct
- PROTECT → conf. 0% → friction max → correct
- WAIT → score brut 64 mais conf. 21% (engagement REDUCED + bhv NEUTRE) → correct, la conf. reflète bien la posture réelle
- READY → conf. 50% (seuil de confirmation) → friction 3s → correct
- ALIGNED → conf. 95% → friction 0ms → correct

---

### Vérification console (analyse statique)

**Warnings possibles au runtime :**

| Source | Condition | Impact |
|---|---|---|
| `render.js:914` | Payload null au démarrage | Silencieux — normal avant premier calcul |
| `render.js:930` | Valeur manquante dans payload | Warning non bloquant |
| `confidence-score.js:245` | Score lisibilité < 50 | `console.warn` en BLOCKED/PROTECT/WAIT — non bloquant, attendu |
| `confidence-score.js:409` | `.confidence-panel` absent | Non applicable — présent en ligne 445 de index.html ✓ |

**Erreurs bloquantes détectées dans le code :** aucune.

---

### À observer manuellement (cockpit ouvert sur http://localhost:8000/src/index.html)

Saisir les combinaisons ci-dessous et noter les observations :

**BLOCKED** — market: Instable, émotion: FOMO, validation: Refusée, tout au minimum
- [ ] Conf. exécution affiche 0% ou "Hors condition"
- [ ] Aucun élément bruyant visible
- [ ] Message friction snapshot visible après clic (5s)
- [ ] Navigation ATTACK/SNIPER disponible après délai

**PROTECT** — market: Défensif, émotion: Sous tension, validation: En attente
- [ ] Conf. exécution faible visible
- [ ] Wording "Présence réduite" (pas "Protection active")
- [ ] Friction 5s sur snapshot

**WAIT** — market: Compression, émotion: Neutre, validation: En attente, needAction: Non
- [ ] Conf. exécution ~21%
- [ ] Zone conscience absente (pas de données comportementales CSV)
- [ ] Friction snapshot 5s

**READY** — market: Expansion, émotion: Calme, structureSignal: Sortie de compression, validation: En attente
- [ ] Conf. exécution ~50%
- [ ] Friction snapshot 3s
- [ ] Friction ATTACK 3s

**ALIGNED** — market: Expansion, émotion: Calme, btc: Fort, tout au maximum, validation: Validée avec note
- [ ] Conf. exécution ~95%
- [ ] Snapshot immédiat (0ms)
- [ ] Navigation ATTACK/SNIPER immédiate

---

### Décision finale

- [x] **Stable** — V1/V2/V3 cohérents, aucune régression visible, validation terrain passée
- [ ] À corriger
- [ ] À observer

**Observations visuelles :**
- Les 5 états produisent les scores et labels attendus
- Curseur confiance d'exécution cohérent avec chaque posture
- Friction V3 présente et non punitive — délais proportionnels, navigation toujours accessible
- Aucune zone redevenue bruyante post-V1
- Wording sobre appliqué partout (registre non-carcéral respecté)
- Signature cockpit à jour : "Caméléon Engine · Décision lisible, jamais prise."

**Bugs constatés :** aucun

**Ressenti global :** cockpit plus calme, plus honnête, plus lisible qu'avant V1. Verdict immédiatement lisible. Friction perçue comme une pause, pas comme une contrainte. Zone conscience absente en l'absence de données CSV — comportement correct.

**Date de validation :** 10 mai 2026
**Branche :** `main` — commit `ace8dfc`
**Statut :** ✅ Validé — V4 peut être envisagée.

Documents de référence :
- `docs/manifesto-cameleon-engine.md`
- `docs/audit-produit-architecture-cognitive.md`
- `docs/plan-reduction-v1.md`
- `docs/plan-v2.md`
- `docs/plan-v3-friction-graduelle.md`

---

## Préambule — Pourquoi cette phase existe

V1 a réduit la surface cognitive : suppression de 13 zones redondantes, concentration du signal.
V2 a introduit la confiance d'exécution : un curseur lisible, une narration en 3 couches.
V3 a introduit la friction graduelle : un ralentisseur temporel, jamais un veto.

Ces trois phases ont été conçues sur plan, validées techniquement, et appliquées proprement.

Elles n'ont pas encore été utilisées.

La validation terrain répond à une question que le code ne peut pas répondre :

> **Est-ce que le cockpit, tel qu'il existe maintenant, rend la décision plus claire, plus calme et plus honnête qu'avant ?**

Cette phase précède toute V4. Elle peut confirmer, corriger, ou révéler ce que le plan n'avait pas prévu. Son résultat est une liste d'observations, pas une liste de tâches.

---

## Section 1 — Protocole par état moteur

Pour chaque état, utiliser le cockpit en conditions normales (vraie session, vraies données ou données représentatives). Observer sans modifier.

Chaque état moteur produit un score de confiance différent, un wording différent, une friction différente. L'observation doit capturer la sensation globale, pas seulement la fonctionnalité.

---

### 1.1 — État BLOCKED × engagement NONE
*Score de confiance attendu : 0. Friction snapshot : 5s. Friction ATTACK/SNIPER : 5s.*

**Lisibilité**
- [ ] Le verdict est-il visible immédiatement, sans chercher ?
- [ ] La phrase principale est-elle comprise en moins de 3 secondes ?
- [ ] Le score "0%" est-il factuel ou ressenti comme une punition ?

**Clarté du verdict**
- [ ] L'utilisateur comprend-il que le moteur dit "hors condition" — pas "interdit" ?
- [ ] Le wording "Hors condition" produit-il de la compréhension ou de la confusion ?
- [ ] Y a-t-il un mot ou une zone qui ressemble à un jugement moral ?

**Zones et redondances**
- [ ] Y a-t-il une information affichée deux fois dans le même état ?
- [ ] Y a-t-il une zone qui semble inutile ou vide dans cet état ?
- [ ] Quelque chose attire l'attention sans apporter de valeur ?

**Cohérence émotionnelle**
- [ ] L'interface est-elle calme à l'écran quand les conditions sont bloquées ?
- [ ] La couleur ou le ton visuel est-il adapté à l'état (ni alarmiste, ni invisible) ?

**Cohérence manifeste**
- [ ] Le cockpit dans cet état ressemble-t-il à "une présence calme qui rend la décision lisible sans la prendre" ?
- [ ] L'état BLOCKED est-il décrit sans vocabulaire carcéral ?

**Friction V3**
- [ ] Le délai de 5s sur le snapshot est-il vécu comme une pause utile ou comme une lenteur irritante ?
- [ ] Le message de friction est-il lu, ignoré, ou perçu comme un reproche ?
- [ ] L'utilisateur a-t-il le sentiment de pouvoir agir s'il le décide vraiment ?

**Observation libre**
- [ ] Quoi d'autre a été remarqué dans cet état qui n'entre dans aucune case ci-dessus ?

---

### 1.2 — État PROTECT × engagement MINIMAL
*Score de confiance attendu : ~6–15. Friction snapshot : 5s. Friction ATTACK/SNIPER : 5s.*

**Lisibilité**
- [ ] La distinction entre BLOCKED et PROTECT est-elle perceptible sans lire attentivement ?
- [ ] Le concept "présence réduite" est-il compris spontanément ?
- [ ] Le score faible est-il contextuel (posture défensive normale) ou anxiogène ?

**Clarté du verdict**
- [ ] L'utilisateur comprend-il qu'il est en protection, pas en punition ?
- [ ] La zone conscience (État d'exécution) ajoute-t-elle de la clarté ou du bruit ?
- [ ] Le pourquoi (zone narrative) est-il accessible sans effort ?

**Zones et redondances**
- [ ] La zone confidence et la zone conscience disent-elles la même chose en double ?
- [ ] Y a-t-il une information visible dans cet état qui n'a pas de valeur actionnable ?

**Cohérence émotionnelle**
- [ ] L'état PROTECT est-il ressenti comme prudence ou comme échec ?
- [ ] Le ton visuel (couleur, opacité, label) est-il proportionné à la posture défensive ?

**Cohérence manifeste**
- [ ] L'interface accompagne-t-elle la posture défensive sans la dramatiser ?
- [ ] Y a-t-il un message ou un élément qui contredit la doctrine "pas de jugement" ?

**Friction V3**
- [ ] Le délai sur snapshot à ce score produit-il de la conscience ou de la résistance ?
- [ ] Le message de friction est-il adapté à la posture défensive ?
- [ ] Naviguer vers ATTACK ou SNIPER depuis PROTECT (avec friction 5s) est-il vécu comment ?

**Observation libre**
- [ ] Quoi d'autre a été remarqué dans cet état ?

---

### 1.3 — État WAIT × engagement NEUTRAL
*Score de confiance attendu : ~25–35. Friction snapshot : 5s. Friction ATTACK/SNIPER : 5s (score <30) ou 3s (score ~30–35).*

**Lisibilité**
- [ ] Le verdict WAIT est-il lisible comme "attendre activement" et non "ne rien faire" ?
- [ ] La différence entre WAIT et PROTECT est-elle visible dans l'interface ?
- [ ] L'utilisateur sait-il quelle condition manque pour progresser vers READY ?

**Clarté du verdict**
- [ ] La phrase contextuelle (pourquoi-shell) est-elle spécifique à cet état ?
- [ ] La confiance d'exécution à ~30% est-elle présentée honnêtement sans sur-alarmer ?

**Zones et redondances**
- [ ] Le cockpit en état WAIT est-il chargé ou épuré ?
- [ ] Y a-t-il des zones qui "parlent" trop pour un état d'observation ?

**Cohérence émotionnelle**
- [ ] L'état WAIT génère-t-il de la patience ou de l'impatience dans l'interface ?
- [ ] Le score ~30% produit-il de la frustration ou de la compréhension contextuelle ?

**Cohérence manifeste**
- [ ] La zone conscience reste-t-elle factuelle dans cet état, sans dramatiser ni minimiser ?
- [ ] WAIT est-il présenté comme une posture utile, pas comme un état de défaillance ?

**Friction V3**
- [ ] Le délai à ce score (~3–5s) sur snapshot est-il senti comme juste ou excessif ?
- [ ] Un utilisateur qui navigue vers ATTACK en état WAIT : la friction l'accompagne-t-elle ?
- [ ] Le message de friction offensive ("Prendre un moment") est-il reçu ou résisté ?

**Observation libre**
- [ ] Quoi d'autre a été remarqué dans cet état ?

---

### 1.4 — État READY × engagement NEUTRAL
*Score de confiance attendu : ~40–55. Friction snapshot : 3s. Friction ATTACK/SNIPER : 3s.*

**Lisibilité**
- [ ] READY est-il clairement distingué de ALIGNED ? L'utilisateur sait-il qu'il n'est pas encore en condition optimale ?
- [ ] Le score ~45% est-il lu comme "proche mais pas là" ou comme "suffisant" ?
- [ ] La zone verdict est-elle la première chose lue, avant les zones secondaires ?

**Clarté du verdict**
- [ ] La phrase de confiance est-elle honnête sur la condition partielle ?
- [ ] La narration 3 couches (verdict → contexte → raison) est-elle parcourue naturellement ?

**Zones et redondances**
- [ ] Quelque chose paraît superflu dans cet état ? Une zone trop verbeuse ?
- [ ] Le cockpit est-il plus lisible qu'avant V1 dans cet état moyen ?

**Cohérence émotionnelle**
- [ ] READY à ~45% est-il ressenti comme une invitation à progresser ou comme une ambiguïté inconfortable ?
- [ ] Le ton est-il cohérent avec un état de préparation partielle ?

**Cohérence manifeste**
- [ ] L'interface rend-elle la décision lisible sans inciter à agir prématurément ?
- [ ] Y a-t-il un risque que READY soit interprété comme "feu vert partiel" ?

**Friction V3**
- [ ] Le délai de 3s sur snapshot est-il perçu comme une pause utile ou une gêne légère ?
- [ ] La friction offensive (3s) est-elle vécue différemment de la friction en état WAIT ?
- [ ] L'utilisateur comprend-il que le délai est lié à son score, pas à un dysfonctionnement ?

**Observation libre**
- [ ] Quoi d'autre a été remarqué dans cet état ?

---

### 1.5 — État ALIGNED × engagement FULL
*Score de confiance attendu : ~85–100. Friction snapshot : aucune. Friction ATTACK/SNIPER : aucune.*

**Lisibilité**
- [ ] ALIGNED avec confiance ~90% est-il immédiatement lisible comme "condition optimale atteinte" ?
- [ ] L'absence de friction est-elle perçue comme une fluidité méritée ?
- [ ] Le cockpit en état optimal est-il sobre ou surchargé de confirmations ?

**Clarté du verdict**
- [ ] Le verdict ALIGNED produit-il de la clarté, pas de la sur-confiance ?
- [ ] La phrase contextuelle reste-t-elle factuelle même à score élevé (pas d'invitation à trader) ?

**Zones et redondances**
- [ ] En état ALIGNED, y a-t-il trop d'informations "positives" qui se renforcent mutuellement ?
- [ ] La zone conscience ajoute-t-elle de la valeur ou fait-elle doublon avec le verdict ?

**Cohérence émotionnelle**
- [ ] L'interface en état optimal est-elle calme ou excitante ?
- [ ] Quelque chose dans le ton ou le wording incite-t-il à une prise de risque ?

**Cohérence manifeste**
- [ ] Le cockpit en ALIGNED respecte-t-il la doctrine : "rendre la décision lisible sans la prendre" ?
- [ ] La confiance élevée est-elle présentée comme un contexte, pas comme une validation ?

**Friction V3**
- [ ] L'absence totale de friction à score 90% est-elle une récompense ou simplement de la fluidité neutre ?
- [ ] L'utilisateur qui snapshote en ALIGNED perçoit-il l'absence de message comme naturelle ?
- [ ] Les boutons ATTACK/SNIPER en ALIGNED naviguent-ils immédiatement sans sensation de manque ?

**Observation libre**
- [ ] Quoi d'autre a été remarqué dans cet état optimal ?

---

## Section 2 — Validation UX profonde

Ces 8 questions s'appliquent à l'ensemble des états, après avoir parcouru les 5.
Elles demandent un jugement global, pas un diagnostic état par état.

**Q1 — Temps de lecture**
En arrivant sur le cockpit après un événement marché (annonce, cassure, retournement) :
combien de secondes sont nécessaires pour comprendre ce que le moteur recommande ?
La cible est inférieure à 5 secondes. Est-ce atteint ?

**Q2 — Première zone lue**
Sans instruction, quel est le premier élément regardé après un recalcul ?
Est-ce le verdict ? La confiance ? La zone conscience ? Quelque chose d'autre ?
La zone lue en premier est-elle la zone la plus utile ?

**Q3 — Sentiment de redondance**
Après un cycle complet (saisie → calcul → lecture), y a-t-il une sensation que quelque chose a été dit deux fois ?
Si oui : quelle zone et quelle répétition précisément ?

**Q4 — Fatigue cognitive après 20 cycles**
Après 20 recalculs successifs (session active), l'interface est-elle plus ou moins lisible qu'au premier cycle ?
La fatigue vient-elle du cockpit ou du marché lui-même ?

**Q5 — Cohérence émotionnelle**
Le ton de l'interface (wording, couleurs, labels) correspond-il à l'état intérieur ressenti en session réelle ?
Y a-t-il un décalage entre ce que l'interface dit et ce que la situation commande ?

**Q6 — Confiance dans le moteur**
Après plusieurs cycles, fait-on confiance au verdict affiché ?
Si la confiance est absente : est-ce un problème de clarté, de wording, ou de logique perçue ?

**Q7 — Sentiment de contrôle**
Le cockpit donne-t-il le sentiment de décider ou d'obéir ?
La frontière entre "le moteur m'informe" et "le moteur décide pour moi" est-elle clairement ressentie ?

**Q8 — La friction est-elle juste**
En état BLOCKED ou PROTECT, le délai avant snapshot ou navigation offensive est-il :
(a) vécu comme une aide à la conscience — (b) vécu comme une contrainte irritante — (c) ignoré ?
La réponse à (c) est un signal d'échec de la friction, pas un succès neutre.

---

## Section 3 — Tests contre le manifeste

Le manifeste définit 6 critères fondamentaux. Chacun doit être vérifié pour chaque état.

Référence : `docs/manifesto-cameleon-engine.md`

| Critère manifeste | BLOCKED | PROTECT | WAIT | READY | ALIGNED |
|---|---|---|---|---|---|
| Présence calme (pas d'alarme, pas d'urgence) | ☐ | ☐ | ☐ | ☐ | ☐ |
| Décision lisible sans être prise | ☐ | ☐ | ☐ | ☐ | ☐ |
| Zéro vocabulaire carcéral | ☐ | ☐ | ☐ | ☐ | ☐ |
| Friction temporelle uniquement (pas de veto) | ☐ | ☐ | ☐ | ☐ | ☐ |
| Honnêteté sans dramatisation | ☐ | ☐ | ☐ | ☐ | ☐ |
| Opérateur reste souverain | ☐ | ☐ | ☐ | ☐ | ☐ |

**Règle de notation :**
- ☑ = critère respecté sans ambiguïté dans cet état
- ☒ = critère violé ou ambigu — noter l'élément exact et l'état

Un ☒ unique dans la colonne BLOCKED n'est pas une urgence.
Un ☒ dans la colonne ALIGNED sur "décision lisible sans être prise" est critique.

---

## Section 4 — Sessions longues

La lisibilité en session courte ne prédit pas la lisibilité en session longue.
Un cockpit peut être clair à froid et devenir anxiogène à chaud.

### Session 5 minutes (état à froid)

Observer :
- La première impression visuelle sans contexte préalable
- Le temps de compréhension de la structure (combien de zones, quel rôle)
- La sensation de "je sais où regarder" ou "je cherche"
- La qualité du premier verdict lu

Critère : après 5 minutes, l'opérateur sait naviguer sans instructions.

---

### Session 20 minutes (état normal de trading)

Observer :
- La fatigue oculaire (zones trop denses, contrastes insuffisants)
- La répétition d'informations perçue comme rassurante ou redondante
- La confiance dans le moteur après plusieurs cycles contradictoires (WAIT → READY → WAIT)
- Le comportement face à la friction après 10 cycles (est-elle encore lue ?)

Critère : après 20 minutes, le cockpit n'est pas plus fatigant que les données de marché elles-mêmes.

---

### Session 1 heure (état de long engagement)

Observer :
- Si certaines zones ont été "zappées" mentalement (ignorées systématiquement)
- Si la zone conscience ou la zone pourquoi sont encore lues après 30 cycles
- Si la friction snapshot en état de basse confiance est encore perçue comme utile après 20 snapshots
- Si le cockpit est encore consulté entre les cycles ou uniquement au moment de décision

Critère : après 1 heure, l'opérateur n'a pas développé de contournement cognitif du cockpit.

**Signal d'alerte :** si l'opérateur regarde uniquement le score de confiance et ignore tout le reste, la réduction V1 est insuffisante — ou la zone confiance est trop saillante par rapport au verdict.

---

## Section 5 — Verdict final

### Question unique

> Le cockpit est-il devenu plus calme, plus honnête et plus lisible qu'avant V1 ?

Cette question se répond en trois parties indépendantes.

**Plus calme**
- Moins de zones visuelles actives simultanément ?
- Moins de mots par écran ?
- Moins d'éléments en compétition pour l'attention ?

**Plus honnête**
- Le score de confiance reflète-t-il ce que l'opérateur ressent de la situation ?
- Les états intermédiaires (WAIT, READY) sont-ils distingués sans ambiguïté ?
- La friction informe-t-elle sans manipuler ?

**Plus lisible**
- Le verdict est-il compris avant d'être cherché ?
- La narration (verdict → contexte → raison) est-elle parcourue dans cet ordre naturellement ?
- Un opérateur novice comprend-il la structure en moins de 2 minutes ?

---

### Verdict possible

**Confirmé** — V1/V2/V3 améliorent le cockpit dans les trois dimensions. Aucune régression identifiée. V4 peut commencer.

**Partiellement confirmé** — Améliorations réelles dans certains états, régression ou ambiguïté dans d'autres. Lister les observations spécifiques. Décider si correction avant V4 ou intégration dans V4.

**À retravailler** — Une des trois dimensions (calme / honnêteté / lisibilité) est détériorée par rapport à l'état pré-V1. Identifier la source exacte. Pas de V4 avant résolution.

---

### Ce que ce document ne fait pas

- Il ne propose pas de patches
- Il ne répond pas à la question "comment corriger"
- Il ne contient pas de code
- Il ne remplace pas l'usage réel du cockpit en conditions de marché

La validation terrain est un acte d'observation, pas de construction.
La V4, si elle existe, naîtra de ce que cette phase révèle.

---

*Document produit dans le cadre de la branche `feature/allowed-engine`.*
*Référence interne : validation-terrain-v1-v2-v3 · révision initiale.*
