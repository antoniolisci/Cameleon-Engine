# Patterns — Lectures structurelles et comportementales positives

**Statut :** squelette — structure posée, contenu à construire par concept validé.

---

## Objectif de ce dossier

Documenter les patterns "positifs" ou neutres — configurations comportementales
et structurelles qui reflètent une lisibilité haute, une cohérence décisionnelle,
ou un alignement entre état et contexte.

Ce dossier est le pendant de `anti-patterns/`. Là où les anti-patterns documentent les
dérives, ce dossier documente ce qui fonctionne — non pour prescrire, mais pour
que le cockpit puisse reconnaître et nommer ces configurations quand elles se produisent.

---

## Distinction avec anti-patterns/

Les anti-patterns décrivent des comportements qui dégradent la qualité décisionnelle.
Les patterns ici décrivent des configurations qui la maintiennent ou l'améliorent.

La symétrie n'est pas parfaite. Un pattern positif n'est pas l'absence d'un anti-pattern.
Un trader sans overtrading ne fait pas nécessairement preuve de discipline — il peut
simplement manquer d'opportunités lisibles.

---

## Type de contenu futur

- Configurations de marché favorisant la lisibilité structurelle
- Comportements décisionnels cohérents avec le contexte
- Patterns de sizing qui reflètent l'alignement entre confiance et taille
- Séquences de récupération saines après un drawdown
- Conditions dans lesquelles la retenue est un pattern de valeur et non une paralysie

**Format attendu pour chaque pattern :**
- Nom du pattern (terme Caméléon sobre)
- Description fonctionnelle
- Marqueurs observables dans les données (si applicable)
- Contexte dans lequel ce pattern se manifeste
- Ce qui le distingue d'un pattern superficiellement similaire mais moins robuste

---

## Exemples de concepts possibles

*Liste indicative — non exhaustive, non validée.*

- **Alignement posture-contexte** — cohérence entre l'état comportemental du trader et
  les conditions de marché. Marqueurs : sizing proportionnel à la lisibilité, fréquence
  basse en contexte dégradé, fréquence adaptée en contexte lisible.
- **Retenue active** — réduction délibérée de l'activité en contexte de lisibilité basse.
  Distinct de la paralysie : le trader est disponible mais ne trouve pas de contexte
  suffisamment lisible.
- **Sizing différencié** — variation de taille corrélée à la confiance d'exécution et
  à la qualité du contexte. Marqueurs : coefficient de variation de taille faible sur
  contexte stable, variation adaptée sur contexte variable.
- **Récupération structurée** — séquence comportementale après un drawdown qui passe par
  une réduction de taille, une augmentation de la sélectivité, et un retour progressif.
- **Lecture sobre** — entrées peu fréquentes, sizing modéré, taux d'invalidation bas.
  Corrélation avec une sélectivité haute et un contexte lisible.
- **Cohérence intra-session** — stabilité du comportement sur une session complète, sans
  spike d'activité ni dégradation de sizing. Marqueur d'absence de régime émotionnel dominant.

---

## Règles de non-dérive

- Les patterns positifs ne sont pas des modèles à suivre — ce sont des lectures
- "Ce trader fait preuve de discipline" n'existe pas ici — "cet historique montre
  un pattern cohérent avec un régime de calme et d'alignement sur cette période"
  est la formulation correcte
- Pas de prescription ("pour être discipliné, faire X")
- Un pattern positif peut coexister avec une performance négative — la qualité
  décisionnelle et le résultat sont deux variables distinctes
- Pas de ranking des patterns (il n'y a pas un "meilleur" pattern comportemental)

---

*Contenu à construire progressivement. Ne pas remplir massivement.*
