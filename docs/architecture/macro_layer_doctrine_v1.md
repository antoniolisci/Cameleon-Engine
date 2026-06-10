# Couche Macro — Doctrine V1

**Caméléon Engine · Document de référence unique**
**Date : 2026-06-10 · Statut : GELÉ — référence officielle Macro V1**

> Document d'entrée. Lire ce fichier avant tout autre document Macro.
> Les phases détaillées (0–6) sont dans `docs/architecture/macro_layer_*.md` et `macro_state_*.md`, `macro_narrative_*.md`, `macro_logging_*.md`, `macro_product_*.md`.

---

## 1. Pourquoi la Couche Macro existe

Le moteur local analyse la configuration technique que l'opérateur observe. Il ne connaît pas le contexte de validité de ce signal.

Un même breakout validé dans un marché structurellement expansif et dans un marché en contraction violente n'a pas la même signification. Le moteur les traite identiquement. Ce plafond est définitif sans couche macro.

**La Couche Macro répond à une seule question :**

> "Dans quel environnement systémique l'opérateur est-il en train de prendre ses décisions ?"

Ce n'est pas une question sur le marché. C'est une question sur l'opérateur dans le marché.

---

## 2. Ce qu'elle est

**Une couche de contexte transversale.**

Elle n'est pas une cinquième couche qui s'ajoute à Pilotage / Moteur / Mémoire / Comportement. Elle traverse les quatre et les enrichit chacune différemment :

| Couche | Ce que la Macro apporte |
|---|---|
| Pilotage | Contexte de validité du cadre opérateur |
| Moteur | Registre narratif enrichi (jamais le calcul) |
| Mémoire | Macro_State associé à chaque session loggée |
| Comportement | Corrélations comportement × régime (valeur long terme) |

---

## 3. Ce qu'elle n'est pas

- **Pas un système de signaux** — elle ne dit jamais quoi faire
- **Pas un deuxième moteur** — elle ne calcule pas de score, de posture ni d'actions
- **Pas un dashboard** — elle n'affiche pas de données brutes en surface principale
- **Pas un outil prédictif** — elle décrit l'environnement présent, jamais le futur
- **Pas une couche Constellium** — les champs Constellium (éther, feu, air, terre, eau) sont des identifiants de la Couche 5 Expression, pas des capteurs macro. Interdiction permanente de les utiliser comme proxy macro (§10, décision figée)

---

## 4. Architecture résumée

```
DONNÉES OPÉRATEUR
  ↓
ACQUISITION — import ponctuel guidé · 3 familles · pas d'API permanente
  ↓
FORMAT — 6 champs UI (5 obligatoires) · data_date distinct · fraîcheur par famille
  ↓
CALCUL — consensus 3 familles → EXPANSIF / NEUTRE / CONTRACTÉ
  ↓
NARRATIF — registre contextuel · vocabulaire interdit · test anti-prescription
  ↓
LOGGING — Session × Macro_State · 10 champs · données financières interdites
  ↓
INTÉGRATION — mention discrète · subordonnée au verdict Moteur · Option B
```

---

## 5. Macro_State — les trois états

**EXPANSIF**
Le capital se distribue vers les actifs risqués. Le levier systémique est présent. L'appétit pour le risque est élevé dans l'écosystème.
EXPANSIF ≠ Acheter. EXPANSIF décrit un environnement ouvert, pas un environnement sûr.

**NEUTRE**
Les signaux disponibles sont insuffisants ou contradictoires. Réponse la plus honnête quand les données ne permettent pas de conclure. NEUTRE est une information positive, pas un échec.

**CONTRACTÉ**
Le capital se concentre sur les actifs défensifs. Le levier recule ou est sous pression.
CONTRACTÉ ≠ Vendre. CONTRACTÉ décrit un environnement sous tension, pas un verdict.

**Règles de production**
- Confirmation multiple obligatoire — aucun signal unique ne produit un état
- Contradiction entre familles → NEUTRE forcé
- Données expirées → famille ignorée → NEUTRE si aucune famille valide
- Stabilité : confirmation sur 2 saisies consécutives pour tout changement (sauf NEUTRE, immédiat)

---

## 6. MACRO-RULE-01 — règle immuable

> **Le Macro_State ne modifie jamais le score, la posture, les actions autorisées, ni la validation humaine.**

Un même formulaire doit produire exactement le même score, la même posture, les mêmes actions — que le contexte macro soit activé ou non.

**Ce que la Macro peut influencer :** registre narratif · texte de coaching · tonalité du Confidence Panel.

**Ce que la Macro ne peut jamais influencer :** `baseEngine()` · `profileMatrix()` · `computeTradingPolicy()` · `applyValidation()` · `buildPayload()`.

Test obligatoire sur tout code futur : `macro activé` vs `macro désactivé` → score / posture / actions strictement identiques. Si ce test échoue → violation du Manifeste.

---

## 7. Acquisition et format

**Trois familles d'information (V1)**

| Famille | Question | Fraîcheur max |
|---|---|---|
| A — Direction du capital | Où va le capital dans l'écosystème ? | 7 jours |
| B — Pression du levier | À quel niveau le marché est-il endetté ? | 3 jours |
| C — Coût cognitif | Quelle amplitude l'opérateur absorbe-t-il ? | 14 jours |

**Format : saisie manuelle guidée dans l'UI** — 6 champs, aucun fichier en V1.

Champs obligatoires : `btc_dominance` · `funding_rate` · `funding_direction` · `volatility_level` · `data_date`

Champ optionnel : `volatility_context`

Au-delà des seuils de fraîcheur : famille ignorée → Neutre pour cette dimension → moteur inchangé.

---

## 8. Logging

**Unité : Session** — cycle complet Pilotage → Moteur → Verdict → Validation.

**10 champs obligatoires :** `session_id` · `timestamp` · `macro_state` · `macro_data_date` · `macro_completeness` · `emotion_state` · `validation_state` · `need_action` · `operator_profile` · `market_posture`

**Jamais enregistré :** montants · tailles de positions · PnL · résultats · valeurs numériques brutes des indicateurs macro · données personnelles identifiantes.

**Orientation permanente : comportement × contexte. Jamais performance × résultat.**

**Horizon 6 mois :** premières observations de patterns (FOMO × régime · suractivité × EXPANSIF). Fragiles, valeur d'hypothèse.

**Horizon 24 mois :** corrélations comportement × régime personnelles robustes. Intelligence inaccessible sans les deux flux coexistant sur durée.

⚠ **Le plafond actuel de 50 sessions (MEM-01B) est insuffisant pour les corrélations.** À résoudre avant activation des lectures personnelles.

---

## 9. Valeur réelle du système

La valeur de court terme de la Couche Macro est la contextualisation narrative du verdict. C'est utile. Ce n'est pas différenciant.

**La valeur réelle est derrière un mur temporel.**

Elle apparaît lorsque suffisamment de sessions ont été loggées avec leur Macro_State pour produire des corrélations personnelles : "Dans les contextes CONTRACTÉS, tu doubles historiquement ta fréquence d'ajustement."

Cette intelligence n'existe nulle part ailleurs. Aucun outil ne croise le régime systémique avec le comportement individuel sur durée. C'est l'exclusivité de Caméléon Engine.

**La condition de cette valeur : le logging doit être actif dès le premier commit.** Une session non loggée est perdue définitivement.

---

## 10. Visibilité

**V1 : Option B — mention discrète**

```
Contexte : Contracté  (données du 10/06)
```

Positionnée après le verdict Moteur dans la hiérarchie visuelle. Jamais dans la même zone que le score.

Niveau 2 (accès volontaire) : texte contextuel court + contribution des familles.
Niveau 3 (V2, mode expert) : valeurs brutes + sources + fraîcheur détaillée.

---

## 11. Registre narratif — règles fondamentales

**Ton :** observateur calme au présent simple. Sujet = capital / levier / opérateurs. Jamais le futur.

**Vocabulaire interdit :** favorable · hostile · opportunité · danger · alerte · prudence · il faut · vous devez · signal · maintenant · hausse probable · baisse probable · risque élevé.

**Deux tests obligatoires sur chaque texte :**
1. Anti-prescription : "Cette phrase décrit-elle ce qui se passe ou dit-elle ce que l'opérateur devrait faire ?"
2. Falsifiabilité : "Cette phrase serait-elle vraie dans l'état opposé ?" Si oui → horoscope → réécrire.

**Test Manifeste :** après lecture, l'opérateur ne doit ressentir aucune pression à agir ou à s'abstenir.

---

## 12. Décisions figées

| Décision | Statut |
|---|---|
| MACRO-RULE-01 — score / posture / actions intouchables | Immuable |
| Pas de proxy Constellium (§10) | Immuable |
| 3 états discrets : EXPANSIF / NEUTRE / CONTRACTÉ | V1 figé |
| Consensus symétrique par familles — pas de pondération numérique | V1 figé |
| NEUTRE forcé en cas de contradiction | Immuable |
| Option B — mention discrète | V1 figé |
| Logging Session × Macro_State dès le premier commit | Non négociable |
| Orientation comportement × contexte (jamais performance × résultat) | Immuable |
| Macro = couche transversale, jamais 5e couche | Figé |
| Jamais un deuxième moteur | Figé |
| Jamais un dashboard | Figé |

---

## 13. Conditions bloquantes avant implémentation

- ☐ Mise en ligne effective — pas de valeur sans utilisateurs réels
- ☐ Seuils qualitatifs calibrés avec un trader réel — des seuils non validés terrain produisent des états faux
- ☐ Labels des champs validés par un trader non-développeur — un label incompréhensible = formulaire inutilisé = logging vide
- ☐ Séparation visuelle documentée — zones Macro et Score strictement distinctes
- ☐ Plafond de conservation des sessions résolu — > 50 sessions nécessaires pour les corrélations

---

## Résumé exécutif

La Couche Macro contextualise l'environnement systémique dans lequel l'opérateur décide. Elle ne touche jamais au score, à la posture ni aux actions. Elle enrichit uniquement le registre narratif. Sa sortie est un état discret parmi trois (EXPANSIF / NEUTRE / CONTRACTÉ), calculé par consensus entre trois familles d'information. En cas de contradiction, NEUTRE est forcé. Elle s'affiche comme une mention discrète, après le verdict Moteur, jamais dans sa zone visuelle.

Sa valeur de court terme est la contextualisation. Sa valeur réelle — la corrélation comportement personnel × régime systémique — est derrière un mur temporel de 12 à 24 mois et conditionnelle au logging actif dès le premier commit.

Cinq conditions bloquantes restantes avant implémentation : mise en ligne · seuils terrain · labels validés · séparation visuelle · plafond sessions.

**Doctrine gelée. Le chantier s'ouvre sur signal d'implémentation réelle.**

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents détaillés : macro_layer_phase0.md → macro_product_integration_phase6.md*
