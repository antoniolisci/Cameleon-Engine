# Régime de volatilité

*Fiche pédagogique freeware — Caméléon Engine*
*Version 1.0 — Mai 2026*

---

## Ce qu'il mesure

Le régime de volatilité mesure dans quelle phase de volatilité le marché se trouve actuellement — expansion, contraction, ou transition — et non le niveau absolu de volatilité à un instant donné.

Deux marchés peuvent afficher la même valeur de volatilité mesurée et se trouver dans des régimes opposés : l'un en fin de contraction sur le point de s'ouvrir, l'autre en début de compression après une phase d'expansion. Ces configurations ne se comportent pas de la même façon.

C'est une lecture d'état, pas une mesure de grandeur.

---

## Pourquoi il est présent dans Caméléon

Le contexte de volatilité conditionne la fiabilité de presque tous les signaux produits par les autres indicateurs. Une rupture de structure dans un régime de faible volatilité n'a pas le même poids qu'une rupture identique dans un régime d'expansion active.

Caméléon ne peut pas produire une lecture calibrée sans savoir dans quel régime le marché opère. Le régime de volatilité est le cadre dans lequel tous les autres signaux prennent leur sens relatif. Sans lui, le moteur travaillerait avec des données sans étalon commun.

---

## Ce qu'il peut faire croire à tort

Un régime de faible volatilité peut sembler sûr — le marché bouge peu, les lectures paraissent stables. Ce n'est pas une propriété du régime en lui-même. Les régimes de faible volatilité sont souvent des phases de compression qui précèdent les expansions les plus abruptes.

À l'inverse, un régime d'expansion élevée peut sembler favorable à la lecture — les mouvements sont amples, les structures visibles. Mais l'expansion produit aussi davantage de faux signaux, de ruptures non confirmées, et de lectures contradictoires entre indicateurs.

Le régime ne préjuge pas de la clarté de la lecture. Il la conditionne.

---

## Comment Caméléon l'utilise

Dans le moteur, le régime de volatilité agit comme un calibrateur global. Il ajuste le seuil de significativité des autres indicateurs — un mouvement qui serait notable en régime de contraction peut être ordinaire en régime d'expansion.

Il influe directement sur la cohérence d'environnement : un marché où les indicateurs émettent des signaux contradictoires dans un régime de transition est une configuration normale ; la même configuration dans un régime stable signale une tension structurelle réelle.

---

## Pourquoi il n'est jamais lu seul

Le régime de volatilité sans direction structurelle est un cadre vide. Savoir que le marché est en expansion ne dit rien de ce qui s'expanse — une tendance, un retournement, une phase sans structure identifiable.

Sans amplitude de fourchette, le régime ne peut pas être mis en relation avec l'espace concret que le marché occupe. Sans cohérence d'environnement, il reste une caractérisation partielle dont la signification dépend de ce que les autres indicateurs produisent simultanément.

Seul, le régime de volatilité décrit le cadre. Il ne lit pas ce qui s'y passe.
