# Chantier — Boucle Mémoire Comportementale V1

**Niveau :** N5 — Documentation technique d'implémentation
**Créé :** 2026-06-16
**Statut :** Terminé — Étape 4 opérationnelle (Lecteur de Mémoire Minimal V1, commit c853be8)
**Doctrine de référence :** `docs/doctrine/memory_doctrine_v1.md`

---

## État de la boucle mémoire

La boucle comporte 5 étapes. 4 sont opérationnelles. 1 est en construction.

```
Déclarer          ✅ Opérationnel  — l'opérateur déclare son état à chaque snapshot
Retenir           ✅ Opérationnel  — les snapshots sont persistés en localStorage
Mettre en tension ✅ Opérationnel  — la Drift Detection compare passé et présent
Refléter le motif ✅ Opérationnel  — Lecteur de Mémoire Minimal V1 livré (commit c853be8)
Certifier le      🔧 En construction — dépend de l'accumulation de données réelles
changement
```

---

## Décisions architecturales préalables

### Décision A — behavior-bridge non connecté (volontaire)

`src/js/behavior/behavior-bridge.js` expose `buildBehaviorBridgeOutput()` qui requiert un `scoreResult` issu du pipeline behavior. Ce scoreResult n'est pas exposé hors du module — uniquement le `guardLevel` dérivé est écrit en localStorage (via `behavior-view.js`).

**Décision :** behavior-bridge ne sera pas connecté dans ce chantier.

Rationale :
- Connecter behavior-bridge depuis `render.js` violerait le contrat d'isolation du module behavior.
- `behaviorGuard.readHistoricalLevel()` lit le même `guardLevel` final depuis localStorage — c'est la source de vérité correcte déjà disponible.
- Cette décision est volontaire, pas une limitation technique. La connexion de behavior-bridge est un chantier distinct qui requiert une décision architecturale sur le couplage behavior ↔ moteur principal.

**Conséquence :** behavior-bridge reste dans l'état documenté en `canonical_motor_state_2026.md §5` : "pont prêt, non branché."

---

### Décision B — Guard System non unifié (volontaire)

Les trois systèmes comportementaux (`marketPressureLevel`, `ux-state.js`, Drift Detection) servent des couches de présentation distinctes et ne sont pas en concurrence.

**Décision :** aucune unification dans ce chantier.

Rationale doctrinale : `memory_doctrine_v1.md` interdit toute synthèse fusionnant les sources en verdict unique. Un état comportemental unifié serait précisément ce verdict. L'unification est également documentée comme différée dans `canonical_motor_state_2026.md §7`.

---

## Levier 1 — Tagger les snapshots avec le niveau et le label comportemental

**Objectif :** rendre le niveau et le label comportemental effectifs persistés dans chaque snapshot, pour permettre la future lecture de motifs (étape "Refléter le motif").

**Fichier :** `src/js/render.js`
**Localisation :** `buildCurrentPayload()` — vers la ligne 4857

**Ce qui existe :**
- `effectiveLevel` est calculé dans le bloc overtrading (render.js ~4761)
- `OVERTRADING_DICT[effectiveLevel].etat` contient le label string
- `buildCurrentPayload()` construit l'objet snapshot persisté

**Ce qui manque :**
- `behavior.overtradingLevel` et `behavior.overtradingLabel` ne sont pas inclus dans `buildCurrentPayload()`

**Décision sur `overtradingLevel` :** le champ numérique est conservé aux côtés du label. La donnée numérique est nécessaire à la persistance correcte et aux futures lectures mémorielles — un label textuel seul serait difficile à exploiter pour les comparaisons.

**Implémentation :**
Dans `buildCurrentPayload()`, enrichir le champ `behavior` :
```js
behavior: {
  ...payload.behavior,
  overtradingLevel: effectiveLevel,
  overtradingLabel: OVERTRADING_DICT[effectiveLevel]?.etat ?? 'Ancré',
}
```

**Garde-fou doctrinal :** ces champs sont des données observables persistées. Ils ne produisent aucun verdict. Leur affichage doit respecter R-M01 à R-M05 de `memory_doctrine_v1.md`.

---

## Levier 2 — Exposer le niveau comportemental historique dans le payload

**Objectif :** rendre le niveau comportemental historique lu depuis localStorage visible dans le payload persisté à chaque snapshot.

**Fichier :** `src/js/render.js`
**Localisation :** `buildCurrentPayload()` — même endroit que Levier 1

**Ce qui existe :**
- `behaviorGuard.readHistoricalLevel()` lit le `guardLevel` stocké en localStorage (TTL 7 jours, écrit par `behavior-view.js`)
- Ce niveau est déjà utilisé dans `render.js` pour le merge d'affichage

**Ce qui manque :**
- `behavior.historicalGuardLevel` n'est pas inclus dans le payload persisté

**Implémentation :**
Dans `buildCurrentPayload()`, ajouter au champ `behavior` :
```js
historicalGuardLevel: behaviorGuard.readHistoricalLevel() ?? 1,
```

**Champs explicitement exclus :** `historicalLabel` n'est pas ajouté. Un label dérivé d'un niveau historique sans règle d'affichage définie risquerait de produire un verdict mémoire implicite (R-M05). Si un affichage du label historique est requis ultérieurement, il sera ajouté avec sa règle d'affichage dans un chantier dédié.

---

## Levier 3 — Corriger le langage prescriptif de la Drift Detection

**Objectif :** aligner le langage de `detectBehaviorDrift()` et `detectPreBehaviorDrift()` avec R-M01 à R-M05 de `memory_doctrine_v1.md`.

**Fichier :** `src/js/render.js`
**Localisation :** lignes ~2330–2449

**Hors périmètre de ce levier :**
- Unify Guard System
- Fusion des couches comportementales
- Création d'un état comportemental unique
- Modifications de `ux-state.js`
- Modifications de `marketPressureLevel`

**Règle de correction :** toute phrase prescriptive (impératif, futur prescriptif, conseil implicite) doit être reformulée en observation factuelle au passé de constat ou au présent descriptif.

**Exemples de reformulation (grille R-M01 à R-M05) :**

| Original | Reformulation conforme | Règle |
|---|---|---|
| ❌ *"Réduire l'exposition."* | ✅ *"Le niveau de dérive observé est élevé."* | R-M01 — impératif interdit |
| ❌ *"Éviter toute entrée."* | ✅ *"Les conditions observées correspondent historiquement à des épisodes de dérive."* | R-M01 + R-M02 |
| ❌ *"Attendre une meilleure configuration."* | ✅ *"La configuration actuelle présente plusieurs caractéristiques déjà observées lors de situations similaires."* | R-M02 — directive interdite |

**Méthode d'exécution :**
1. Identifier toutes les phrases contenant un impératif ou un verbe prescriptif dans `detectBehaviorDrift()` et `detectPreBehaviorDrift()`
2. Appliquer les 5 tests de conformité de `memory_doctrine_v1.md §III`
3. Reformuler selon les exemples ci-dessus

---

## Dépendances entre leviers

```
Levier 3 → indépendant · exécuter en premier (correction de conformité)
Levier 1 → prérequis pour Levier 2
Levier 2 → dépend de Levier 1 (enrichit le même champ behavior)
```

**Ordre recommandé :** Levier 3 → Levier 1 → Levier 2

---

## Contrainte doctrinale globale

Aucune donnée issue de la mémoire comportementale ne produit de prescription visible utilisateur.
Tout affichage de données persistées par ces leviers doit respecter `memory_doctrine_v1.md` et `cameleon_engine_language_system_v1.md Partie 10`.
