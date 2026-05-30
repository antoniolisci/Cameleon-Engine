# UI — Cohérence narrative : cassure déclarée en compression

**Date :** 2026-05-30
**Fichier modifié :** `src/js/render.js`
**Type :** Correction UI — couche présentation uniquement
**Moteur :** inchangé

---

## 1. Problème initial

Quand un opérateur déclarait dans le Filtre adaptatif :

- Signal de structure = **Cassure validée** (`real_breakout`)
- Confirmation d'élan = **Volume et impulsion**
- Validation humaine = **Validée**
- État de marché = **Compression**

L'interface continuait d'afficher les textes du dictionnaire statique associé à la compression :

- "Pas de cassure — pas d'entrée"
- "Pas de cassure. Pas d'entrée."
- "En attente" / "Aucun setup exploitable pour l'instant."
- "Lecture en cours. Aucun setup confirmé."

La contradiction était explicite : l'opérateur venait de déclarer une cassure validée, et le moteur répondait "pas de cassure".

---

## 2. Cause

`MARKET_DICTIONARY` est indexé par `market_state` uniquement (`"compression"`). Il ne lit pas `setup_inputs.structure_signal`.

`deriveMarketStateKey()` retourne `"COMPRESSION"` dès que `v.market === "compression"`, sans vérifier si un signal de cassure a été déclaré. Le cas `BREAKOUT` (ligne 405 de `data.js`) ne s'applique que si le marché est `"expansion"`.

Résultat : toutes les fonctions qui lisent le dictionnaire affichaient "Pas de cassure" même quand `structureSignal === "real_breakout"`.

---

## 3. Correction appliquée

**Fichier :** `src/js/render.js` uniquement.
**Aucun fichier moteur touché** (`engine.js`, `data.js`, `dictionary.js`, `decision.js`, `trading-policy.js`).

Deux fonctions helpers ajoutées (lignes 90–115) :

**`_isDeclaredBreakout(payload)`**
Retourne `true` si `market_state === "compression"` ET `structure_signal` est `"real_breakout"` ou `"compression_breakout"`. Condition stricte, aucun effet de bord.

**`_getPresentationDict(payload, dictEntry)`**
Retourne le dictionnaire d'origine si `_isDeclaredBreakout` est faux. Sinon, retourne une version avec 3 champs remplacés : `mantra`, `signal`, `decision.centrale`. Le reste du dictionnaire (journal, posture, actions, risque, validation) reste intact.

Quatre call sites du dictionnaire mis à jour pour passer par `_getPresentationDict`.

Deux fonctions de rendu modifiées :
- `computeDecisionState()` — message WAIT compression différencié si cassure déclarée
- `getHeroCopy()` — titre/sous-titre WAIT différenciés si cassure déclarée
- Hero H1 — texte différencié si cassure déclarée en état WAIT

---

## 4. Textes avant / après

| Élément UI | Compression normale | Cassure déclarée en compression |
|---|---|---|
| Decision centrale | "Pas de cassure — pas d'entrée" | "Cassure déclarée — confirmation moteur en attente" |
| Mantra | "Pas de cassure. Pas d'entrée." | "La cassure est déclarée. Le moteur attend confirmation." |
| Signal principal | "Pas de signal" | "Cassure déclarée" |
| Signal secondaire | "Pas de cassure." | "Attendre confirmation de structure." |
| LDC titre | "En attente" | "Observation active" |
| LDC sous-titre | "Aucun setup exploitable pour l'instant." | "Cassure déclarée — entrée non confirmée, surveiller." |
| Hero H1 | "Lecture en cours. Aucun setup confirmé." | "Cassure déclarée. Confirmation attendue." |
| Badge WAIT | "Compression — attendre la cassure" | "Cassure déclarée — confirmation moteur en attente" |

---

## 5. Tests terrain

### CAS 1 — Compression normale (régression)

**Paramètres :**
- État marché : Compression
- Signal de structure : Aucun
- Confirmation d'élan : Aucune
- Validation humaine : En attente
- Profil : Équilibré / Nécessité d'agir : Non

**Attendu :** Textes compression classiques inchangés — "Pas de cassure", attente, taille 0 %.

**Résultat :** OK. `_isDeclaredBreakout` retourne `false` → dictionnaire intact → comportement identique à avant correction. Aucune régression.

---

### CAS 2 — Cassure déclarée en compression (cas cible)

**Paramètres :**
- État marché : Compression
- Signal de structure : Cassure validée
- Confirmation d'élan : Volume et impulsion
- Validation humaine : Validée
- Profil : Équilibré / Socle en place : Oui

**Attendu :** Textes nuancés, pas d'entrée automatique, moteur non permissif.

**Résultat :** OK.
- "Cassure déclarée. Confirmation attendue."
- "Observation active"
- "Cassure déclarée — entrée non confirmée, surveiller."
- "La cassure est déclarée. Le moteur attend confirmation."
- "Cassure déclarée — confirmation moteur en attente"

La contradiction "Cassure validée / Pas de cassure" est résolue. Verdict = Socle. Aucune entrée automatique.

---

### CAS 3 — Cassure validée hors compression (non-régression)

**Paramètres :**
- État marché : Breakout / Tendance
- BTC : Fort / Ether : Fort / Feu : Fort
- Signal de structure : Cassure validée
- Confirmation d'élan : Bougie propre
- Validation humaine : Validée / Nécessité d'agir : Oui
- Zone : Niveau de cassure

**Attendu :** `_isDeclaredBreakout` retourne `false` (marché ≠ compression) → logique normale expansion/breakout → aucun override narratif compression.

**Résultat :** OK.
- Narration tendance / exécution normale
- "Lecture claire. Conditions réunies." / "Exécution"
- Protection opérationnelle conservée par le moteur (retest en attente)
- Aucun texte "cassure déclarée en compression" visible

---

## 6. Conclusion

La correction est une **correction UI narrative pure**.

- Elle corrige une incohérence d'affichage sans toucher au moteur.
- Elle n'autorise aucune entrée nouvelle.
- Elle ne rend pas le système permissif.
- Elle est réversible en retirant `_getPresentationDict` et `_isDeclaredBreakout`.
- Les 3 cas de test passent sans régression.

**Moteur inchangé. Logique de décision inchangée. Présentation cohérente.**
