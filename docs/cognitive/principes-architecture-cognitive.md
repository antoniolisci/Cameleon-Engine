# Principes d'architecture cognitive — Caméléon Engine

**Statut :** document de référence permanent.
**Date :** 2026-05-22
**Usage :** évaluer tout nouveau concept avant intégration dans le corpus.
Ce document ne décrit pas le projet. Il gouverne sa construction.

---

## Principe fondateur

Caméléon Engine produit des lectures comportementales.
Ces lectures s'appuient sur des concepts qui décrivent — jamais ne prescrivent.

Le corpus cognitif existe pour stabiliser le vocabulaire, pas pour accumuler
de la connaissance. Chaque concept qui entre dans le corpus modifie ce que le
système peut dire et ce qu'il ne peut plus dire. L'ajout n'est jamais neutre.

---

## Lois structurelles

**Loi 1 — Primauté de l'effet cockpit**
Un concept existe si et seulement s'il produit un effet cockpit réel et identifiable.
Pas un mécanisme intéressant. Pas une cause distincte. Un effet — c'est-à-dire
une modification observable de ce que le cockpit fait ou dit.

**Loi 2 — Unicité de l'effet comme condition d'existence**
Deux concepts qui produisent le même effet cockpit ne justifient pas deux fiches.
Une différence de cause ou de mécanisme ne suffit pas.
Si l'output est identique, le concept est redondant — et la redondance est
une forme de dette silencieuse.

**Loi 3 — Modulation atmosphérique**
Le cockpit modifie la texture de lecture, pas les signaux eux-mêmes.
Il n'ajoute pas de signaux. Il ne produit pas d'alertes supplémentaires.
Il retravaille ce qui existe déjà : rythme, tonalité, friction, contexte du score.

**Loi 4 — Sobriété structurelle**
Un lot cognitif n'est pas une liste. C'est un espace où chaque concept
tient sa place sans en réclamer d'autre.
La taille d'un lot n'est pas un objectif. C'est une conséquence.

**Loi 5 — Stabilité sans auteur**
Un concept est valide s'il peut être relu et appliqué sans mémoire de session.
S'il requiert le contexte de sa création pour être compris, il n'est pas fini.

**Loi 6 — Dette consciente plutôt que pseudo-implémentation**
Quand un concept décrit une modulation que le cockpit ne peut pas encore produire,
la réponse juste est de documenter la distance — pas de simuler une implémentation.
La dette nommée est moins dangereuse que l'implémentation incomplète.

**Loi 7 — Le corpus décrit. Il ne prescrit jamais.**
Aucun concept ne doit produire une recommandation d'action.
Le corpus dit ce qui se passe. Il ne dit jamais quoi faire.

---

## Architecture du corpus

Le corpus cognitif est organisé en **lots thématiques**. Chaque lot constitue
un espace cohérent, pas une catégorie encyclopédique.

**Hiérarchie de validation**
1. L'effet cockpit (Loi 1) — condition nécessaire
2. L'unicité de l'effet (Loi 2) — condition d'existence
3. La maintenabilité sans auteur (Loi 5) — condition de stabilité
4. La compatibilité atmosphérique (Loi 3) — condition d'intégration

Un concept qui échoue à l'étape 1 ou 2 n'entre pas dans le corpus,
quelle que soit sa pertinence théorique.

**Le payload est la source de vérité unique.** Tout concept qui ne peut pas
être traduit en modification du payload ou de la texture de rendu est hors périmètre.
Le corpus ne documente pas des états du marché. Il documente des états de lecture.

---

## Test d'existence en 5 questions

Avant d'intégrer un concept dans le corpus, répondre séquentiellement :

1. **Quel est l'effet cockpit précis ?**
   Si la réponse est vague ou théorique, le concept n'est pas prêt.

2. **Cet effet existe-t-il déjà dans le corpus ?**
   Si oui, le concept est redondant — sauf s'il produit un effet *différent*.

3. **Le concept est-il maintenable sans vigilance de l'auteur ?**
   Si sa cohérence dépend de savoir pourquoi il a été créé, il n'est pas stabilisé.

4. **Le phénomène existe-t-il avec un seul trader ?**
   Non → famille collective. Oui → famille individuelle.
   Un concept mal classé produit des modulations au mauvais moment.

5. **Le concept mérite-t-il sa place parmi les autres du lot ?**
   Pas "est-il intéressant ?" — mais "est-il irréductiblement distinct ?"

---

## Détection de contamination doctrinale

### Marqueurs de vocabulaire à risque

| Catégorie | Exemples | Risque |
|-----------|----------|--------|
| Directionnel | «hausse probable», «signal d'achat», «confirme» | oraculaire |
| Prédictif | «anticipation», «précède», «prédit» | prescriptif |
| Sentiment simplifié | «optimisme», «peur», «confiance» | blog financier |
| Prescriptif | «éviter», «réduire», «ne pas trader» | prescriptif |
| Fondamental | «valorisation», «taux», «macro-économique» | hors périmètre |
| Encyclopédique | «historiquement», «les études montrent» | encyclopédique |

### Effets de lecture qui signalent une dérive

- **Effet prescriptif** : le concept dit au trader quoi faire
- **Effet directionnel** : le concept pointe vers un résultat de marché
- **Effet générique** : le concept pourrait figurer dans n'importe quel article de finance comportementale
- **Effet oraculaire** : le concept prédit un état futur
- **Effet moralisateur** : le concept juge le comportement plutôt que de le décrire

---

## Ce que le système refuse structurellement

Ces refus ne sont pas des règles de style. Ce sont des contraintes architecturales.
Les franchir détruit la cohérence du corpus — même si le contenu est juste.

- **Pas de prescriptions** : le corpus ne donne pas de conseils, même implicitement
- **Pas de prédictions** : aucun concept ne décrit ce qui va se passer
- **Pas d'états de marché bruts** : le corpus décrit des états de lecture, pas des configurations de marché
- **Pas de concepts sans effet cockpit** : l'intérêt théorique ne justifie pas l'intégration
- **Pas de lots ouverts indéfiniment** : un lot se ferme quand l'espace est cohérent, pas quand il est épuisé

---

*Ce document est relu avant toute ouverture de nouveau lot cognitif.*
*Il est mis à jour si une loi est affinée ou si un nouveau pattern de dérive est identifié.*
