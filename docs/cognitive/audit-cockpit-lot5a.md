# Audit cockpit post-Lot 5A

## Statut

Audit de distance — lecture seule. Aucune implémentation. Aucun chantier ouvert.
Réalisé le 2026-05-21 après finalisation du corpus Lot 5A (50 concepts, 5 fiches collectives).

---

## EXISTE

**Friction** — `friction.js` opérationnel. Délais calibrés sur le score d'exécution :
0ms (score ≥ 80) / 1500ms / 3000ms / 5000ms (score < 30).
Trois points d'application dans `render.js` : snapshot, attack, sniper.
La mécanique "ralentir avant validation" existe — elle répond au score, pas à un état collectif.

**Coaching comportemental** — `detectBehaviorCoaching()` produit `{ type, titre, message, action }`,
rendu dans `#behaviorCoachCard`. Actif sur les 5 derniers cycles (overtrading, FOMO, tension).
Exclusivement individuel — il lit l'historique du trader, pas un état ambiant.

**Score de confiance wrappé** — `computeConfidenceScore()` retourne `{ score, label, tone, breakdown }`.
Le score n'est jamais seul : tone CSS (`data-tone`), mode opérationnel (`data-mode`),
phrase contextuelle (`#cs-message`). Le pattern "texture autour du chiffre" existe déjà.

**Rythme UI** — animation score (easeOutCubic 600ms), pulse (`strength-pulse` 420ms),
debounce 150ms. Le cockpit sait déjà moduler son rythme selon le score.

---

## N'EXISTE PAS

**Couche coaching liée à la lecture** — le coaching actuel est 100% comportemental
(cycles individuels). Aucun registre lié à l'origine d'une lecture, à la phase du
cycle décisionnel, ou au moment dans le processus lecture-décision-engagement.

**Contexte atmosphérique** — aucun champ dans le payload, aucun paramètre moteur,
aucun élément DOM ne porte un état collectif. Euphorie, fatigue, consensus, contamination
narrative — aucun de ces états n'existe dans la chaîne de traitement.

**Micro-espace d'engagement** — le moment de confirmation (clic snapshot/offensive)
existe dans `render.js` et la friction s'y applique déjà. Mais cette friction répond
au score, pas à un signal de coprésence ou d'isolement perçu.

**Modèle des phases de lecture** — les 5 concepts Lot 5A agissent à 5 moments distincts
du cycle (avant lecture, pendant, à la conclusion, à l'engagement, en continu).
Ce découpage n'existe pas dans le code. Le cockpit n'a pas de notion de "où en est
l'opérateur dans son cycle de lecture".

**Signal implicite non verbal** — tout signal actuel est soit absent, soit explicite
(label, message, délai visible). Aucun mécanisme de "légère densité imperceptible"
ou de "respiration différente" sans trigger visible.

---

## DANGEREUX À TOUCHER

**`engine.js` / `buildPayload()`** — pipeline critique. Toute modification des champs
produits casse les dépendances en cascade (render.js, decision.js, trading-policy.js).
Pas le bon niveau pour introduire un contexte collectif.

**`computeConfidenceScore()` internals** — score 4-facteurs (trend/structure/volatility/volume)
fondation de tous les seuils de friction. Modifier la formule change le comportement
en production.

**Contrat isolation `src/js/behavior/`** — ne lit rien du moteur principal, n'émet rien,
persiste rien. Contrat intentionnel et documenté. Ne pas connecter à un état collectif.

**Grille de friction** — les délais 0/1500/3000/5000ms sont calibrés sur le comportement
terrain. Ne pas modifier sans test réel.

---

## POINT D'ENTRÉE MINIMAL POSSIBLE

**`#cs-message` dans `renderConfidencePanel()`** — `confidence-score.js`

Ce champ textuel contextuel existe déjà, est distinct du score, peut changer de registre
sans toucher à la mécanique ni au payload. C'est le seul endroit du cockpit où :

- un texte contextuel existe déjà
- il est séparable du chiffre
- son contenu peut varier sans modifier la friction ni la logique
- la fonction qui le produit (`renderConfidencePanel()`) accepte des paramètres

Une expérimentation minimale ressemblerait à : un paramètre optionnel entrant dans
`renderConfidencePanel()` qui, si présent, module légèrement le texte de `cs-message`.
Sans toucher au score. Sans toucher à la friction. Sans modifier le payload.

C'est la plus petite respiration possible.

---

## Distance réelle — diagnostic

**Le manque n'est pas technique. Il est conceptuel.**

Le cockpit a les mécaniques : friction, coaching, contexte score, rythme UI.
Ce qui manque pour accueillir Lot 5A :

1. **Aucun vecteur d'entrée collectif** — rien n'entre dans le moteur qui décrirait un état ambiant.
   Le moteur 16 champs est entièrement individuel et marché-factuel.

2. **Aucun coaching lié à la lecture** — le coaching existe, mais il lit des cycles comportementaux,
   pas la phase du processus décisionnel en cours.

3. **Aucun modèle du cycle lecture-décision-engagement** — le cockpit ne représente pas
   "où en est l'opérateur". Sans ce modèle, les 5 moments distincts du Lot 5A n'ont pas
   de point d'ancrage.

Implémenter Lot 5A demanderait d'abord de modéliser ces trois absences —
avant d'écrire une seule ligne de modulation.

---

*Cet audit ne crée pas de dette d'implémentation. Il documente une distance.*
*Les conditions de réouverture sont dans la page Gel d'implémentation Notion (Lot 5A).*
