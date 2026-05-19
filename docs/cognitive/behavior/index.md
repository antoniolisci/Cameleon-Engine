# Behavior — Psychologie et comportement du trader

**Statut :** squelette — structure posée, contenu à construire par concept validé.

---

## Objectif de ce dossier

Documenter les mécanismes psychologiques et comportementaux du trader en situation
de décision. Pas en général — dans le contexte spécifique du trading spot,
face à des conditions de marché lisibles ou non.

Ce dossier alimente le module comportemental du cockpit et les messages de coaching.
Il ne produit pas de conseils. Il produit des descriptions.

---

## Type de contenu futur

- Mécanismes cognitifs activés par le P&L non réalisé
- Cycles émotionnels intra-session et inter-sessions
- Dynamiques de régimes comportementaux (FOMO, revenge, overconfidence, fatigue)
- Relations entre état comportemental et qualité d'exécution
- Patterns de récupération après drawdown
- Fatigue décisionnelle : définition, marqueurs, impact sur la lecture

**Format attendu pour chaque concept :**
- Nom du concept (terme Caméléon officiel)
- Description sobre (ce que c'est, comment il se manifeste)
- Marqueurs observables dans les données (si applicable au moteur comportemental)
- Ce que ce n'est pas (frontière avec d'autres concepts)
- Lien vers la famille taxonomique correspondante

---

## Exemples de concepts possibles

*Liste indicative — non exhaustive, non validée. Ces concepts doivent être rédigés
un par un, pas en bloc.*

- **Fatigue décisionnelle** — dégradation progressive de la qualité de lecture après un
  nombre élevé de décisions dans un délai court
- **Overconfidence post-gain** — surestimation de sa capacité de lecture après une série
  gagnante, indépendamment de la qualité réelle des décisions
- **Ancrage sur le prix d'entrée** — incapacité à invalider une thèse parce que le prix
  d'entrée devient une référence émotionnelle plutôt qu'analytique
- **Revenge** — trading motivé par la récupération d'une perte plutôt que par une lecture
  de marché
- **FOMO** — décision d'entrée déclenchée par l'observation d'un mouvement en cours,
  non par une lecture préalable du contexte
- **Paralysie** — incapacité à prendre une décision cohérente malgré un contexte lisible,
  généralement en contexte de perte récente ou de pression accumulée
- **Régime de stress** — état de contraction cognitive réduisant la fenêtre de lecture et
  amplifiant les réactions aux variations de court terme

---

## Règles de non-dérive

- Aucun concept ne se termine par une prescription ("si X, alors faire Y")
- Les comportements sont décrits sans jugement moral
- Un comportement documenté ici n'est pas un défaut de caractère — c'est un mécanisme
  universel, observable dans des conditions spécifiques
- Pas de statistiques génériques sur "combien de traders perdent à cause de X"
- Pas de techniques de gestion émotionnelle (respiration, visualisation, etc.)
- Pas de référence à la psychologie clinique, au stoïcisme, ou à d'autres cadres externes

---

## Relation avec le moteur

Le module comportemental (`src/js/behavior/`) produit aujourd'hui :
- un profil parmi 4 : Discipliné / Réactif / Impulsif / Agressif
- un score comportemental
- des patterns identifiables sur l'historique importé

Ce dossier doit rester cohérent avec ces 4 profils et contribuer à leur signification,
sans les redéfinir.

---

*Contenu à construire progressivement. Ne pas remplir massivement.*
