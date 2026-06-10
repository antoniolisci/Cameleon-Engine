# Couche Macro — Calcul du Macro_State (Phase 3)

**Caméléon Engine · Direction Architecture**
**Date : 2026-06-10**
**Statut : Document décisionnel Phase 3 — règles de calcul uniquement**
**Prérequis : Phase 0 + Phase 1 + Phase 2 validées**

---

## 1. Mission

Définir les règles conceptuelles par lesquelles les données macro importées deviennent un état unique : EXPANSIF, NEUTRE ou CONTRACTÉ.

Sans code. Sans formule. Sans algorithme.

La doctrine uniquement — l'implémentation viendra après.

---

## 2. Définition du Macro_State

### Ce qu'il est

Le Macro_State est un descripteur d'environnement décisionnel.

Il répond à une seule question : dans quelle configuration systémique l'opérateur est-il en train de prendre ses décisions en ce moment ?

Il décrit un état présent, observable, structurel — pas une prédiction, pas une recommandation, pas une lecture technique.

### Ce qu'il n'est pas

Il n'est pas un signal d'entrée ou de sortie. Il n'est pas une confirmation de thèse. Il n'est pas un indicateur technique. Il n'est pas une mesure de la qualité de l'analyse de l'opérateur.

### Ce que l'opérateur doit comprendre

**EXPANSIF** — Le capital se distribue vers les actifs risqués. Le levier est présent. L'appétit pour le risque est structurellement élevé dans l'écosystème. Ce contexte ne garantit pas le succès d'une décision — il décrit le climat dans lequel cette décision est prise.

**NEUTRE** — Les signaux sont mixtes, insuffisants ou contradictoires. Ce n'est pas un échec du système. C'est le résultat le plus honnête lorsque les données ne permettent pas de trancher. NEUTRE est une valeur positive, pas une absence de réponse.

**CONTRACTÉ** — Le capital se concentre sur les actifs défensifs. Le levier recule ou est sous pression. L'environnement systémique est moins favorable à la prise de risque distribuée. Ce contexte n'interdit aucune décision — il la contextualise différemment.

---

## 3. Combinaison des familles

### Pourquoi aucun poids numérique n'est retenu

Attribuer des poids numériques aux familles (ex: Famille A = 40%, Famille B = 40%, Famille C = 20%) produirait une fausse précision. Ces poids seraient arbitraires, non calibrés sur des données réelles, et donneraient l'illusion d'un calcul objectif là où il y a une décision subjective de pondération.

**Le modèle retenu est un modèle de consensus, pas un modèle de pondération.**

### Signal directionnel de chaque famille

Chaque famille produit un signal parmi trois : EXPANSIF, NEUTRE, CONTRACTÉ.

**Famille A — Direction du capital**

Capital qui se distribue vers les altcoins (BTC perd des parts) → signal EXPANSIF
Capital qui se concentre sur Bitcoin (BTC gagne des parts) → signal CONTRACTÉ
Zone intermédiaire ou mouvement non tranché → signal NEUTRE

---

**Famille B — Pression du levier**

Funding positif et en hausse → signal EXPANSIF (longs leviers présents, appétit haussier)
Funding négatif ou en forte baisse → signal CONTRACTÉ (deleveraging, pression baissière)
Funding proche de zéro ou stable → signal NEUTRE

Cas particulier : funding très élevé avec tendance à la hausse peut signaler une fragilité structurelle (euphorie), ce qui nuance la lecture EXPANSIF en contexte d'excès. Cette nuance appartient au registre narratif, pas au calcul de l'état.

---

**Famille C — Coût cognitif**

Volatilité faible → signal EXPANSIF (environnement lisible, coût cognitif bas)
Volatilité modérée → signal NEUTRE
Volatilité élevée ou extrême → signal CONTRACTÉ (environnement difficile à lire, coût cognitif élevé)

### Règle de consensus

**Si 2 familles ou plus convergent vers le même état → cet état est retenu.**

**Si les 3 familles divergent → NEUTRE est forcé.**

**Si 1 seule famille est disponible → son signal est retenu avec mention "contexte partiel".**

Ce modèle est simple, transparent, et résistant à la fausse précision. L'opérateur peut comprendre et contester le résultat.

### Pourquoi la hiérarchie des familles est rejetée en V1

On pourrait argumenter que la Famille B (levier) est plus opérationnellement pertinente et devrait "gagner" en cas de conflit. Ce raisonnement est séduisant mais produit deux problèmes : il crée une dépendance à un jugement qui n'a pas encore été validé terrain, et il rend le calcul moins transparent. En V1, la symétrie est préférable. Une hiérarchie peut être introduite en V2 après calibration.

---

## 4. Gestion des données manquantes

### Principe : dégradation silencieuse, jamais blocage

Une famille absente ou expirée est simplement ignorée dans le calcul. Elle ne produit pas de signal. Elle n'est pas remplacée par une valeur par défaut.

| Situation | Comportement |
|---|---|
| Famille A expirée | Retirée du calcul · les 2 autres familles décident |
| Famille B absente | Retirée du calcul · les 2 autres familles décident |
| Famille C invalide | Retirée du calcul · les 2 autres familles décident |
| 2 familles expirées | 1 seule famille disponible · état partiel retenu |
| Toutes familles expirées | Macro_State absent · aucun affichage macro · moteur inchangé |

### Seuil minimal de calcul

**1 famille valide suffit à produire un état partiel.** L'état est accompagné de la mention "contexte partiel" pour informer l'opérateur que la lecture est incomplète.

**0 famille valide → aucun Macro_State.** Le cockpit est identique à son état sans Macro. Il n'y a rien à afficher, rien à corriger.

---

## 5. Nature de la sortie

### Confirmation : état discret retenu

Phase 0 a recommandé un état discret. Cette décision est confirmée.

**Un score continu (0–100) est rejeté.** Un score numérique donnerait l'illusion d'une précision que les données ne justifient pas. L'opérateur lirait "67" comme s'il y avait une différence significative avec "64". Il n'y en a pas.

**Un score discret (ex: 5 niveaux) est rejeté.** Cinq états pour des données aussi limitées produisent de la fausse granularité.

**Trois états discrets (EXPANSIF / NEUTRE / CONTRACTÉ) sont retenus.** Cette résolution est honnête par rapport à la qualité des données disponibles. Elle est stable, lisible, et résistante à la sur-interprétation.

---

## 6. Doctrine de stabilité

### Le problème des oscillations

Sans doctrine de stabilité, un Macro_State peut osciller entre EXPANSIF et NEUTRE sur des mises à jour consécutives, créant une instabilité qui dégrade la confiance de l'opérateur dans la lecture.

### Règle de confirmation

**Un état ne change que s'il est produit de façon stable sur deux saisies consécutives.**

Si la saisie précédente produisait EXPANSIF et que la nouvelle saisie produit NEUTRE, le Macro_State affiché reste EXPANSIF avec la mention "signal de transition détecté". Si la saisie suivante confirme NEUTRE, le changement est acté.

**Exceptions :**
- Premier import : aucune confirmation requise, l'état est retenu immédiatement.
- Passage vers NEUTRE depuis n'importe quel état : confirmation non requise. NEUTRE est le sas de sécurité — il peut être atteint immédiatement.

### Pourquoi NEUTRE ne requiert pas de confirmation

NEUTRE signifie "je ne suis pas certain". Atteindre l'incertitude immédiatement est toujours plus sûr qu'y résister. Le danger est de rester EXPANSIF trop longtemps, pas de tomber en NEUTRE trop tôt.

---

## 7. Gestion des contradictions

### Définition d'une contradiction

Une contradiction survient lorsque les familles disponibles produisent des signaux opposés sans majorité.

Exemples :
- Famille A → EXPANSIF (rotation vers les altcoins)
- Famille B → CONTRACTÉ (funding négatif)
- Famille C → NEUTRE (volatilité modérée)
→ Aucune majorité → NEUTRE forcé

- Famille A → EXPANSIF
- Famille B → CONTRACTÉ
→ Deux familles, contradiction directe → NEUTRE forcé

### Règle d'arbitrage

**En cas de contradiction directe entre familles, NEUTRE est toujours retenu.** Aucune famille ne l'emporte sur les autres en V1.

Ce choix est conservateur. Il préfère l'honnêteté à la précision. Un NEUTRE honnête est plus utile qu'un état tranché sur des signaux contradictoires.

### Cas de l'excès de levier

Un funding très élevé positif avec forte hausse (Famille B → EXPANSIF fort) combiné à une volatilité extrême (Famille C → CONTRACTÉ) est une configuration contradictoire classique : euphorie + fragilité simultanées. La règle de contradiction s'applique — NEUTRE. La nuance de l'excès appartient aux textes de Niveau 2.

---

## 8. Visibilité utilisateur

### Niveau 1 — Surface permanente

L'opérateur voit uniquement l'état final et sa fraîcheur.

```
Contexte : Contracté  (données du 10/06)
```

Pas de score. Pas de détail. Pas d'explication.

### Niveau 2 — Accessible volontairement

Sur demande explicite, l'opérateur accède à :
- La contribution de chaque famille (signal par famille)
- Un texte contextuel court : "Le capital se concentre sur Bitcoin. Le levier recule."
- La mention du mode dégradé si applicable

### Ce qui n'est jamais affiché en surface

Les valeurs numériques brutes (pourcentages, taux). La composition technique du calcul. Les seuils de fraîcheur exacts. Ces informations appartiennent au Niveau 3 (mode expert), hors cockpit principal.

---

## 9. Risques cognitifs

**Illusion de causalité**
L'opérateur perçoit une relation entre le Macro_State et son score moteur, même si les deux sont techniquement séparés. Proximité visuelle = causalité perçue.
Protection : séparation visuelle absolue (condition bloquante Phase 0, toujours active).

**Illusion prédictive**
"Macro EXPANSIF → le marché va monter." L'opérateur convertit un descripteur en prédiction.
Protection : les textes de Niveau 2 utilisent exclusivement le passé et le présent, jamais le futur. Test MACRO-RULE-01 sur chaque phrase.

**Surinterprétation de NEUTRE**
"NEUTRE → rien à faire → je sors." NEUTRE est une absence de contexte tranché, pas une instruction.
Protection : les formulations de NEUTRE insistent sur son caractère informatif positif ("les signaux sont insuffisants pour conclure") plutôt que sur son absence ("pas de signal").

**Dépendance au contexte**
"Je ne trade que si le Macro est EXPANSIF." L'opérateur attend une permission que Caméléon n'est pas conçu pour donner.
Protection : rappel visible dans l'onboarding que le Macro_State décrit l'environnement, jamais ne valide la décision. La décision appartient au Pilotage + Moteur.

**Recherche de certitude**
L'opérateur met à jour ses données macro fréquemment pour "trouver" un état favorable. Comportement de confirmation.
Protection : la doctrine de stabilité (confirmation requise pour tout changement hors NEUTRE) ralentit mécaniquement ce comportement.

---

## 10. Logging

### Pourquoi le logging est obligatoire dès le premier commit

La valeur principale de la Couche Macro — la corrélation comportement personnel × régime systémique — est derrière un mur temporel. Elle n'existe que si chaque session a été enregistrée avec son Macro_State associé.

Une session sans Macro_State est une session perdue définitivement pour cette corrélation. Elle ne peut pas être reconstruite rétroactivement.

Le logging n'est pas une fonctionnalité V2. C'est la condition de viabilité de toute la Couche Macro.

### Ce qui doit être enregistré à chaque session

- L'état final calculé : EXPANSIF, NEUTRE, CONTRACTÉ, ou ABSENT
- Le signal de chaque famille disponible au moment de la session
- La date d'observation des données (`data_date`)
- La mention du mode dégradé si applicable (partiel, transition, famille manquante)

### Ce qui ne doit pas être enregistré

- Les valeurs numériques brutes (BTC dominance %, funding rate %) — ce sont des données sensibles à la fraîcheur, elles perdent leur sens dès que la session est archivée
- L'identité ou les coordonnées de l'opérateur — cohérence avec la doctrine privacy local-first
- Le score moteur de la session dans le log macro — les deux systèmes restent séparés dans leur logging

---

## 11. V1 / V2 / Rejeté

**V1**
- Modèle de consensus à 3 familles
- 3 états discrets : EXPANSIF / NEUTRE / CONTRACTÉ
- Dégradation silencieuse sur famille manquante ou expirée
- Doctrine de stabilité : confirmation sur 2 saisies consécutives (sauf NEUTRE)
- Contradiction → NEUTRE forcé
- Logging session × Macro_State dès le premier commit
- Visibilité : Niveau 1 (état + fraîcheur) + Niveau 2 (contributeurs sur demande)

**V2**
- Hiérarchie des familles calibrée sur données terrain
- Seuils BTC dominance et funding rate figés après calibration
- Niveau 3 (mode expert avec valeurs brutes)
- Corrélations personnelles exploitables (après N sessions loggées)

**Rejeté**
- Score numérique continu
- Pondération numérique des familles en V1
- Prédiction directionnelle dans les textes
- Affichage des valeurs brutes en surface principale
- Logging des valeurs numériques brutes dans l'historique

---

## 12. Verdict Phase 3

**Comment est calculé le Macro_State ?**
Modèle de consensus : chaque famille produit un signal directionnel. La majorité décide. Contradiction → NEUTRE.

**Quelle logique est retenue ?**
Consensus symétrique en V1. Trois familles, une voix chacune. Majorité simple. NEUTRE si aucune majorité.

**Quelle stabilité est retenue ?**
Confirmation sur deux saisies consécutives pour tout changement vers EXPANSIF ou CONTRACTÉ. NEUTRE est atteint immédiatement.

**Quelle est la principale protection cognitive ?**
La séparation visuelle absolue entre Macro_State et score moteur. Toutes les autres protections (textes, formulations, anti-prescription) sont secondaires par rapport à cette contrainte de présentation.

**Condition bloquante avant implémentation**
Définir les seuils qualitatifs de chaque famille (à quel niveau de BTC dominance considère-t-on que le capital se concentre ?) avec un trader réel, avant d'écrire une ligne de logique. Des seuils non validés terrain produisent un Macro_State systématiquement faux.

---

## Résumé exécutif

**Décision la plus importante :** modèle de consensus — chaque famille a une voix égale, la majorité décide, NEUTRE si contradiction. Pas de pondération numérique.

**Risque principal :** illusion de causalité entre Macro_State et score moteur si la séparation visuelle n'est pas respectée.

**Logique retenue :** 3 familles → signal directionnel par famille → consensus → état discret · dégradation silencieuse si famille manquante · NEUTRE si contradiction.

**Protection principale :** séparation visuelle absolue entre Macro_State et score. Toutes les autres protections sont secondaires.

**Condition bloquante :** définir les seuils qualitatifs de chaque famille avec un trader réel avant implémentation. Des seuils non calibrés terrain → Macro_State systématiquement faux → valeur nulle.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
