# Transitions — Changements d'état et moments de rupture

**Statut :** squelette — structure posée, contenu à construire par concept validé.

---

## Objectif de ce dossier

Documenter les moments de transition — quand un état se transforme en un autre.
Les transitions sont les moments les plus difficiles à lire. Elles cumulent
l'ambiguïté de la structure et l'instabilité de l'état comportemental.

Ce dossier sert à nommer les séquences typiques de transition, sans les prédire,
pour que le cockpit puisse contextualiser ces moments de façon utile.

---

## Pourquoi les transitions sont distinctes

Un état stable se lit relativement bien. Un range défini est lisible. Un régime de
calme comportemental est reconnaissable. La valeur ajoutée est limitée : le cockpit
confirme ce qui est déjà évident.

La valeur réelle est dans les transitions. Quand le range commence à se dégrader.
Quand le régime de calme glisse vers le stress. Quand la confiance d'exécution se
contracte progressivement sans raison apparente. Ces moments sont difficiles à nommer
en temps réel, et ce dossier prépare le vocabulaire pour le faire.

---

## Type de contenu futur

- Séquences typiques de transition entre structures de marché
- Séquences typiques de transition entre régimes comportementaux
- Marqueurs qui précèdent une transition (sans les ériger en système de prédiction)
- Durée typique des transitions (en termes de qualité de lisibilité, pas en temps absolu)
- Comment la transition affecte la cohérence décisionnelle du trader

**Format attendu pour chaque transition :**
- Nom de la transition (ex. "range → expansion non confirmée")
- État de départ / état d'arrivée
- Marqueurs typiques observables
- Impact comportemental durant la transition
- Risque de mauvaise lecture spécifique à ce moment
- Ce qui signale que la transition est terminée (stabilisation)

---

## Exemples de transitions possibles

*Liste indicative — non exhaustive, non validée.*

- **Range stable → compression** — contraction progressive, traders interprétant
  l'absence de mouvement comme une opportunité imminente (FOMO anticipatoire)
- **Expansion → range instable** — perte de momentum, confusion sur les bornes,
  lectures contradictoires entre participants
- **Calme → stress comportemental** — dégradation progressive de la qualité de lecture,
  souvent après une série de petites pertes sans drawdown majeur
- **FOMO → paralysie** — épuisement après une ou plusieurs entrées précipitées mal
  gérées, incapacité temporaire à prendre la décision suivante
- **Revenge → régime de calme** — séquence de récupération après un épisode de revenge,
  rarement linéaire
- **Dégradation de structure → changement de régime de marché** — moment où la lisibilité
  est minimale, contexte de décisions les plus coûteuses

---

## Règles de non-dérive

- Les transitions sont des séquences, pas des règles ("si A alors B")
- Un marqueur de transition n'est pas un signal d'entrée ou de sortie
- La durée d'une transition n'est pas prévisible — elle est documentée comme variable
- Pas de "timing" associé aux transitions (durée en minutes, en bougies)
- La transition est un contexte de lisibilité réduite — le cockpit doit le signaler,
  pas tenter de l'exploiter

---

*Contenu à construire progressivement. Ne pas remplir massivement.*
