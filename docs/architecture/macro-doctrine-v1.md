# Doctrine Macro V1 — Référence officielle du chantier

**Statut : FIGÉE — 2026-06-05**
**Référence mémoire :** `project_macro_doctrine_officielle_v1.md`
**Infrastructure Phase 1 :** commits `877d678` + `78d2455`
**Architecture stratégique :** `macro-layer-strategic-architecture.md` — commits `1a46aa7` + `2ccb73f`

---

## Mission de la couche Macro

La Macro Caméléon répond à une seule question :

> **"Dans quel environnement l'opérateur est-il en train de prendre ses décisions ?"**

Le sujet central n'est pas le marché. Le sujet central est **l'opérateur dans le marché**.

**Formulations de référence officielles :**

- "La Macro n'est pas là pour expliquer le marché. Elle est là pour contextualiser l'expérience de l'opérateur."
- "Le comportemental n'est pas là pour contextualiser le marché. Il est là pour révéler comment l'opérateur réagit à ce contexte."
- "Marché → Contexte → Comportement → Connaissance de soi"

> **"C'est ce pont entre marché, psychologie et expérience vécue qui constitue le cœur de la Macro Caméléon."**
>
> ← test de cohérence de toute évolution future

---

## États officiels

**Autorisés uniquement :** Expansif · Neutre · Contracté

**Interdits :** Bull/Bear market · Accumulation · Distribution · Début/Fin de cycle · Probabilités · Pourcentages de confiance

### Résolution des labels — décision explicite

Les états décrivent un **environnement de décision** — jamais une recommandation d'action.

- **Expansif ≠ Acheter**
- **Contracté ≠ Vendre**
- **Neutre ≠ Attendre**

Les lectures comportementales servent précisément à éviter cette interprétation simpliste.

---

## Indicateurs V1

| Indicateur | Statut |
|---|---|
| BTC Dominance | **Noyau V1 — priorité absolue** |
| Funding Rate | **Noyau V1 — priorité absolue** |
| Volatilité réalisée | V1.5 — différée techniquement |
| Open Interest | Conditionnel — source fiable requise |
| Stablecoin Dominance | Dépriorisée — redondance partielle BTC.D |
| TOTAL2 | Optionnel — si coût marginal quasi nul |

**Exclus définitivement :** TOTAL3 · Flux ETF · DXY (V2 minimum) · tout proxy Constellium (cf. §10 `macro-layer-strategic-architecture.md`)

---

## Règles d'assemblage

- Aucun indicateur seul ne produit un état Expansif ou Contracté
- **Confirmation multiple obligatoire** (BTC.D + Funding minimum)
- **Neutre obligatoire** si signaux contradictoires — jamais considéré comme un échec
- **Neutre si données trop anciennes** (MACRO-FRESHNESS-01)

### MACRO-FRESHNESS-01 — Fraîcheur maximale acceptable

| Indicateur | Max acceptable |
|---|---|
| Funding Rate | 12–24h |
| Open Interest | 24–48h |
| BTC Dominance | 3–7 jours |
| Volatilité réalisée | 5–7 jours |

Données hors seuil : affichage horodatage + signal visuel de fraîcheur obligatoire. Jamais de silence sur des données périmées.

---

## MACRO-RULE-01 — Langage officiel

**Accepté (descriptif) :**
- "Les opérateurs ont tendance à…"
- "Ce contexte est fréquemment associé à…"

**Interdit (directif) :**
- "Vous devriez…"
- "Il vaut mieux…"
- "Réduisez vos positions."
- "Attendez."

**Test obligatoire sur chaque texte :** "est-ce que cette phrase décrit ce qui se passe, ou dit-elle ce que l'opérateur devrait faire ?" Si la seconde → reformuler.

---

## Architecture UX retenue — Vision C enrichie

**Rejetées :** Vision A (module dashboard explicite) · Vision B pure (macro invisible)

### Niveau 1 — Affichage permanent minimal

```
Confiance : Modérée
Contexte : Contracté  (données du 05/06)
```

- Aucune donnée brute
- Aucun dashboard
- **Séparation visuelle obligatoire** avec le score moteur (risque de lecture causale sinon — violation MACRO-RULE-01 par UX)

### Niveau 2 — Accessible volontairement (▶ Comprendre ce contexte)

- **Lecture contextuelle :** "Le capital se concentre vers Bitcoin."
- **Lecture comportementale populationnelle :** "Dans ce contexte, les opérateurs ont tendance à…"
- **Construction historique :** "Ce contexte a été enregistré · X sessions enregistrées · corrélations lisibles à partir de N sessions"
  - N à définir avant implémentation (voir Points ouverts)

### Niveau 3 — Utilisateurs avancés uniquement

Sources · fraîcheur · valeurs numériques · détails techniques. Hors cockpit principal.

---

## Maturité progressive des corrélations personnelles

### Principe

Les corrélations personnelles n'apparaissent pas à un seuil unique. Elles émergent progressivement.

**Rejeté :** logique ON/OFF ("Je ne sais rien" → "Je te connais")
**Retenu :** maturité progressive basée sur la capacité d'interprétation réelle

### Formulations de référence

- "Caméléon Engine ne cherche pas à retenir l'utilisateur. Il cherche à le rendre progressivement plus lisible à lui-même."
- "La progression ne débloque pas des récompenses. Elle débloque des niveaux de compréhension."

### Anti-gamification — règle absolue

**Interdits :** badges · points · niveaux de joueur · récompenses artificielles · compte à rebours · toute technique de gamification

La progression est **cognitive**, jamais ludique.

### Architecture 6 niveaux

| Niveau | Déclenchement | Ce que le système voit | Exemple de lecture |
|---|---|---|---|
| 0 | Aucun historique | — | Lectures populationnelles uniquement |
| 1 | Premières dizaines de sessions | Répétitions émergentes | "Certains comportements semblent plus fréquents dans certains contextes" |
| 2 | Contextes récurrents | Environnements comparables | "Certains contextes reviennent suffisamment pour être comparés" |
| 3 | Différences observables | Variation comportementale selon contexte | Première vraie valeur personnelle |
| 4 | Corrélations exploitables | Patterns fiables | "Dans les contextes Contractés, tu augmentes fréquemment ta fréquence d'intervention" |
| 5 | Comparaisons inter-régimes | Analyse relative | "Tes performances sont plus stables en Neutre qu'en Expansif" |
| 6 | Profil robuste | Multiples régimes + cycles | Lectures personnelles solides |

### Règle de validation des niveaux

**Un niveau n'existe que s'il produit une information réellement nouvelle.**

Un niveau n'existe pas pour montrer une progression — il existe parce que le système peut voir quelque chose qu'il ne pouvait pas voir avant. Si aucune nouvelle lecture n'est possible : le niveau n'existe pas.

**Risque identifié :** Niveaux 1 et 2 peuvent produire des formulations si prudentes qu'elles n'informent pas réellement. Architecture réelle peut être 3–4 niveaux effectifs.

---

## Architecture des données — séparation Macro / Comportemental

```
Macro         → fournit : contexte + biais populationnels + logging
Comportemental → fournit : corrélations personnelles + patterns individuels
```

**Les corrélations personnelles vivent dans le module comportemental, pas dans la Macro.**

La Macro **alimente** le comportemental. Elle ne le remplace pas.

### Transition V1 → V2

- **V1 :** "Dans ce contexte, les opérateurs ont tendance à..." (populationnel)
- **V2 :** "Dans ce contexte, tu augmentes historiquement ta fréquence d'intervention." (personnel)

---

## Logging Session × État Macro — obligation stratégique

**Exigence non optionnelle :** chaque session doit être loggée avec son état macro **dès le premier jour d'ouverture du chantier**.

Toute session sans logging est une session perdue pour les corrélations futures. Le calcul rétroactif du Macro_State est impossible.

---

## Différenciation produit

La valeur n'est pas dans les données (publiques). Elle est dans la chaîne :

**Donnée → Contexte → Biais → Historique utilisateur**

Différenciation future : **Session × Contexte Macro × Comportement Utilisateur**

Aucun outil existant ne produit "comment cet opérateur se comporte dans ce régime macro". C'est la valeur centrale.

---

## Points ouverts — implémentation uniquement, hors doctrine

Ces questions ne modifient pas la doctrine. Elles conditionnent l'ouverture du chantier.

1. **Modèle d'acquisition des données** — quelle option, quelle fréquence, quel seuil de fraîcheur pour Funding Rate (24h max vs import hebdomadaire). Conflit non résolu.
2. **Pont Session × Macro × Comportement** — architecture technique non conçue. Chantier distinct, non dans le roadmap actuel.
3. **Seuils numériques BTC.D et Funding Rate** — calibration terrain. La doctrine définit les règles de structure, pas les valeurs.
4. **N sessions par niveau de maturité** — "premières dizaines" = valeurs provisoires à définir (ex: 10, 25, 50, 100…) avant ouverture.
5. **Séparation visuelle Niveau 1** — design final à définir pour distinguer "Confiance : Modérée" (moteur) de "Contexte : Contracté" (macro).
6. **Format objet logging session × état** — structure de données non définie.
7. **Extension MACRO-RULE-01 au coaching comportemental** — behaviorCoachCard non tranché formellement.

---

## Statut du chantier

**DIFFÉRÉ** — après :

1. Mise en ligne (compte · paiement · utilisateur)
2. Mémoire opérateur
3. Premiers utilisateurs réels avec sessions documentées

L'infrastructure préparatoire Phase 1 (`contextualFields` + `applyMacroOverlay`) reste en place. Elle n'a pas besoin d'être reconstruite.

---

## Règle de modification

Cette doctrine est considérée comme **figée**.

Toute évolution future devra démontrer une **incompatibilité réelle** avec cette doctrine avant de pouvoir la modifier.

Le test de cohérence obligatoire pour toute proposition :

> "Est-ce compatible avec Vision C enrichie + MACRO-RULE-01 + le pont marché / psychologie / expérience vécue ?"

Si non → reformuler ou rejeter. Pas négocier.
