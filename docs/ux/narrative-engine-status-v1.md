# Moteur Narratif Adaptatif — État officiel V1

**Dernière mise à jour :** 2026-05-29
**Documents sources :** Moteur Narratif Adaptatif V1 (doctrine) · V1.1 (audit critique)
**Maturité estimée :** Doctrine

---

## 1. Statut actuel

**Niveau : Doctrine**

Les principes sont vrais. Les règles sont correctes. La direction est juste.
L'exécution a des lacunes identifiées et adressables sans remettre en cause le cadre.

Le système n'atteint pas encore le stade d'architecture stable pour deux raisons précises :

- Contradiction C1 non tranchée : Mantra absolu vs Mantra modulable par profil
- Trois états sur sept produisent des collisions structurelles dans le dictionnaire actuel

---

## 2. Ce qui est validé

### Les 4 voix officielles

| Voix | Rôle | Question |
|---|---|---|
| Journal | Décrit | Qu'est-ce qui se passe en ce moment ? |
| Signal | Interprète | Que voit le moteur dans cette configuration ? |
| Mantra | Contraint | Quelle est la règle non-négociable ici ? |
| Décision | Statue | Que fait-on maintenant, et pourquoi ? |

Chaque voix répond à une question distincte. Les quatre ne se croisent pas.

### Garde-fous principaux

- Le moteur narratif ne donne jamais de conseil de trading
- Il ne rassure jamais (réconfort = corruption de voix)
- Il ne punit jamais sur le passé (jugement rétroactif = corruption inverse)
- La certitude d'une voix ne dépasse jamais la certitude du moteur
- Aucune voix ne contredit le verdict du moteur
- La rotation V3 ne dilue pas la règle

### Principes fondateurs validés

- Le moteur narratif est une **couche de calibration perceptive**, pas une couche de communication
- Le dictionnaire est une **source calibrée**, pas un oracle
- La Décision.raison est **comportementale** (conséquence future), jamais technique
- Le Mantra est **absolu par forme** : une règle qui s'explique est une règle qui se négocie

---

## 3. Ce qui reste ouvert

### C1 — Mantra : absolu ou modulable par profil ?

**Tension :** Le document V1 affirme simultanément que le Mantra est absolu par nature *et* qu'il peut être "plus restrictif" selon le profil opérateur en V2. Ces deux affirmations sont incompatibles.

**Décision requise avant V2 :** soit le Mantra est la voix de la discipline invariante (pas de modulation), soit il est la voix de la contrainte comportementale (spécialisable par profil). Les deux ne peuvent pas coexister.

### Rôle exact des sub

Les main de chaque voix sont correctement définies. Les sub ne le sont pas.
Elles sont traitées comme des "compléments" sans contrainte formelle — ce qui en fait la principale source de redondance actuelle et future.

Une règle explicite sur ce que fait la sub (par rapport à la main) est nécessaire avant toute évolution du dictionnaire.

### Silence défensif

Le silence d'une voix est architecturalement reconnu comme signal valide.
Les règles de déclenchement ne sont pas encore formalisées :

- Quelles voix peuvent disparaître ?
- Dans quels états ?
- Selon quel critère de déclenchement ?

### Rotation narrative V3

Le mécanisme est conceptuellement défini (variantes cycliques non-aléatoires).
Le protocole de validation est absent : comment vérifier qu'une variante est aussi contraignante que l'originale ?

### Vieillissement du système sur 3 ans

Le Journal deviendra invisible pour les opérateurs experts. Le Signal tautologique disparaîtra de la lecture. La Décision.raison risque de se banaliser.

Le moteur narratif n'a pas encore modélisé ce qu'il devient pour ses utilisateurs de long terme.

### Critères de validation des variantes

Toute évolution du dictionnaire (V1.2, V2, rotation V3) doit passer par un test de terrain. Le critère d'évaluation de la "surface minimale expressive" n'est pas encore défini de manière opérationnelle.

---

## 4. États fragiles à traiter plus tard

### `breakout` — Priorité haute

**Problème :** Journal et Signal décrivent le même événement (la cassure) depuis le même niveau d'abstraction.
**Type de collision :** Journal / Signal — collision de niveau d'abstraction.
**Détail :** "Le prix franchit une zone" (Journal) et "Cassure en cours" (Signal) sont quasi-synonymes. La nuance ("Le piège aussi" vs "Attends le retest") est trop faible pour justifier deux voix distinctes.

### `riskoff` — Priorité haute

**Problème :** Trois voix disent la même chose sur la rupture de régime.
**Type de collision :** Journal.sub / Signal.sub / Décision.raison — redondance tri-voix.
**Détail :** "Les règles ne s'appliquent plus" · "Aucun trade ne vaut ce contexte" · "Plus d'edge. Chaque position est un pari." sont trois reformulations d'une seule idée. Le Mantra ("Avoir raison ne suffit pas") est la seule voix distincte — et elle est noyée.

### `instable` — Priorité haute

**Problème :** Journal et Signal décrivent le même vide depuis le même registre.
**Type de collision :** Journal / Signal — fond identique.
**Détail :** "Aucune lecture fiable" et "Aucun signal / Ce n'est pas un marché" sont deux formulations de la même disqualification. La Décision.raison ("Tu inventes un signal. L'erreur est déjà là.") est forte mais arrive après trois voix qui ont déjà conclu.

### `compression` — Priorité moyenne

**Problème :** Le Journal conclut à la place de la Décision.
**Type de collision :** Journal.sub / Mantra / Décision.centrale — saturation verbale sur la même conclusion.
**Détail :** "L'entrée n'existe pas" (Journal.sub) · "Pas de cassure. Pas d'entrée." (Mantra) · "Pas de cassure — pas d'entrée" (Décision) énoncent trois fois le même verdict. Le Journal descend au niveau de la Décision.

---

## 5. Décision produit actuelle

- **Ne pas coder davantage maintenant.** Les blocs narratifs sont branchés et fonctionnels.
- **Ne pas ajouter de variantes maintenant.** Les collisions existantes doivent être résolues avant d'en créer de nouvelles.
- **Ne pas modifier dictionary.js immédiatement.** Toute modification du dictionnaire est un chantier séparé (V1.2) qui requiert validation visuelle et usage réel.
- **Observer le cockpit réel** après activation des blocs narratifs. Les collisions identifiées sont théoriques — le terrain les confirmera ou les nuancera.

---

## 6. Prochaine étape recommandée

**Chantier futur : Dictionnaire narratif V1.2**

- Objectif : corriger les collisions des 4 états fragiles sans changer l'architecture des voix
- Méthode : reformuler uniquement les voix en collision, état par état, avec validation des 6 règles de non-redondance
- Condition de déclenchement : après validation visuelle du cockpit réel et au moins une session d'usage terrain
- Périmètre strict : dictionary.js uniquement — aucun changement à render.js, engine.js, ou à la structure des voix

---

## 7. Règle de garde

> **"Le laboratoire nourrit le cockpit. Le moteur narratif donne une voix au cockpit. Aucun des deux ne doit remplacer le produit."**
