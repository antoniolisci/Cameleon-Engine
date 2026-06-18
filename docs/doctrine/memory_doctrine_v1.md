# CAMÉLÉON ENGINE — DOCTRINE DE LA MÉMOIRE V1

> Document fondateur N2 · Compagnon de `lecture_not_equal_action.md`
> Créé : 2026-06-16 · Statut : Référence active

---

## I. Ce que la mémoire comportementale peut faire

La mémoire comportementale est une couche d'observation sur le temps.
Elle hérite de toutes les contraintes de la Couche 1 (Lecture) : décrire l'observable, jamais prescrire.

**Trois opérations autorisées :**

- **Retenir** — conserver les états comportementaux déclarés session par session.
- **Comparer** — mettre en regard le passé et le présent.
- **Décrire** — restituer l'état comportemental historique en termes factuels et neutres.

---

## II. Ce que la mémoire ne peut jamais faire

- **Conseiller** — "Tu devrais faire..." est une prescription. Interdite.
- **Prédire** — "Tu vas probablement..." est une extrapolation. Interdite.
- **Expliquer causalement** — "C'est parce que tu as..." est une attribution. Interdite.
- **Résoudre** — la mémoire identifie un état. Elle ne le résout pas à la place de l'opérateur.
- **Fusionner les sources** — la mémoire comportementale et la lecture marché sont deux couches séparées. Aucune synthèse fusionnant les deux n'est autorisée.
- **Présenter une évolution non prouvée comme un fait** — "Tu as progressé" est interdit. "Le motif de déclarations a changé" est autorisé si le changement peut être constaté sans extrapolation.

---

## III. Relation à la doctrine Lecture ≠ Action

La doctrine Lecture ≠ Action (`lecture_not_equal_action.md`) établit que la lecture du moteur ne produit jamais de signal d'action.

La mémoire comportementale est soumise à la même règle, avec une contrainte supplémentaire : elle parle de l'opérateur lui-même — ce qui crée un risque de prescription personnalisée encore plus direct que la lecture du marché.

**Test de conformité mémoire :**

1. Ce texte dit-il à l'opérateur quoi faire maintenant ? → Si oui : invalide.
2. Ce texte présente-t-il une évolution non vérifiée comme un fait accompli ? → Si oui : invalide.
3. Ce texte fusionne-t-il mémoire comportementale et lecture marché en un verdict unique ? → Si oui : invalide.
4. Ce texte explique-t-il causalement un état ? → Si oui : invalide.
5. Ce texte utilise-t-il l'impératif ou le futur prescriptif ? → Si oui : invalide.

---

## IV. État de déploiement

Les règles de cette doctrine s'appliquent à tout affichage mémoire, qu'il soit issu d'une étape opérationnelle ou d'une étape en construction.

L'état de déploiement de chaque étape de la boucle est documenté dans `docs/architecture/chantier-boucle-memoire-v1.md`.

La façon dont les traces mémoire (sessions, comparaisons W1/W2) apparaissent comme étoiles dans la visualisation Constellium — et les règles de langage associées — est documentée dans `docs/architecture/constellium/constellium_v1_definition.md` (§3 Étoiles V1 · §4 Liens V1 · §7 Langage autorisé).

---

*CAMÉLÉON ENGINE — MEMORY DOCTRINE V1*
*Document N2. Référence permanente.*
*Chemin : `docs/doctrine/memory_doctrine_v1.md`*
