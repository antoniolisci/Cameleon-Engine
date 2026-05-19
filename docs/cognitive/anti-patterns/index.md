# Anti-patterns — Dérives comportementales documentées

**Statut :** squelette — structure posée, contenu à construire par concept validé.

---

## Objectif de ce dossier

Documenter les comportements qui dégradent systématiquement la qualité décisionnelle.
Ces comportements ne sont pas des erreurs morales — ce sont des patterns reconnaissables,
récurrents, et documentables sur les données.

Un anti-pattern est nommé ici non pour punir le trader qui l'exprime, mais pour que
le cockpit puisse en produire une lecture utile : reconnaître le pattern, nommer le
régime, offrir le miroir.

---

## Distinction avec behavior/

`behavior/index.md` documente les mécanismes psychologiques généraux.
Ce dossier documente les **expressions comportementales observables** de ces mécanismes —
les patterns qui apparaissent dans les données d'import et que le moteur peut lire.

Un anti-pattern ici est concret, observable, mesurable sur un historique.
Un mécanisme dans `behavior/` est un processus cognitif interne.

---

## Type de contenu futur

- Description sobre de chaque anti-pattern
- Marqueurs observables dans les données (fréquence d'entrée, taille, timing)
- Contexte de déclenchement typique (quelle structure, quel régime précède)
- Comment l'anti-pattern se reconnaît rétrospectivement dans un historique importé
- Ce que l'anti-pattern n'est pas (frontière avec des comportements légitimes)

**Format attendu pour chaque anti-pattern :**
- Nom officiel (terme Caméléon — sobre, non moralisateur)
- Définition fonctionnelle
- Marqueurs observables sur les données
- Contexte de déclenchement
- Ce qui le distingue d'un comportement similaire mais légitime
- Impact typique sur la qualité décisionnelle

---

## Exemples d'anti-patterns possibles

*Liste indicative — non exhaustive, non validée.*

- **Overtrading** — fréquence d'entrée déconnectée du nombre de setups lisibles
  disponibles dans le contexte. Marqueurs : nombre d'entrées anormalement élevé
  sur une période, taille uniforme (absence de sizing différencié).
- **Revenge trading** — entrée(s) après une perte significative, taille souvent
  supérieure à la taille habituelle, dans un contexte non lisible.
  Marqueurs : entrée rapide (<15min) après une sortie en perte, taille augmentée.
- **FOMO entry** — entrée après un mouvement significatif déjà réalisé.
  Marqueurs : prix d'entrée situé dans l'extension du mouvement, pas en zone de structure.
- **Sizing chaotique** — variation de taille non corrélée au contexte ou à la confiance.
  Marqueurs : coefficient de variation de taille élevé sur une période courte.
- **Hold irrationnel** — maintien d'une position bien au-delà de l'invalidation
  de la thèse initiale. Marqueurs : durée de hold anormalement longue, drawdown
  non réalisé croissant.
- **Sur-trading post-gain** — augmentation de la fréquence après une série gagnante.
  Marqueurs : spike d'activité temporel corrélé à une série positive récente.
- **Micro-scalping en bruit** — entrées à très haute fréquence dans un contexte de
  lisibilité basse (range instable, compression). Marqueurs : taux élevé de petites
  sorties dans les deux sens.

---

## Règles de non-dérive

- Les anti-patterns sont des lectures comportementales, pas des verdicts moraux
- "Ce trader fait de l'overtrading" n'existe pas ici — "ce historique montre un pattern
  compatible avec un régime d'overtrading sur cette période" est la formulation correcte
- Pas de liste prescriptive associée ("pour corriger l'overtrading, faire X")
- Les anti-patterns ne sont jamais présentés comme des causes de perte — ils sont des
  patterns observables dont la corrélation avec la performance est documentée sobrement
- Pas de classement moral (le revenge n'est pas "pire" que le FOMO — ce sont deux
  patterns distincts avec des marqueurs distincts)

---

## Relation avec le module comportemental

Le moteur comportemental actuel identifie déjà certains de ces patterns.
Ce dossier doit rester cohérent avec les patterns implémentés dans `src/js/behavior/analytics/patterns.js`
sans les redéfinir.

Les nouveaux patterns documentés ici sont des candidats futurs pour le moteur —
pas des ajouts immédiats.

---

*Contenu à construire progressivement. Ne pas remplir massivement.*
