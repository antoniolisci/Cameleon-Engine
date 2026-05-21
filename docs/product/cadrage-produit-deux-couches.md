# Cadrage Produit — Modèle Deux Couches

**Statut : canonique.**
**Date d'établissement : 2026-05-21**

> Ce document contraint les décisions UX et d'implémentation futures.
> Il est le pont entre la doctrine produit, les principes UX et l'architecture des couches.
> En cas de doute sur une feature, une copie UI, ou un comportement système — ce document s'applique.

---

## Positionnement confirmé

Caméléon Engine reste :

- un cockpit orienté trading
- un système de lecture marché
- un environnement opérationnel
- un outil d'aide à la décision

**N'est pas et ne deviendra pas :** outil thérapeutique, application de méditation, coach psychologique, système anti-trading.

---

## Phrase fondatrice

> **"Le marché est une donnée. Ton comportement aussi."**

Cette phrase résume la séparation des couches, la neutralité du système, et la non-moralisation.
Toutes les évolutions futures doivent rester cohérentes avec cette logique.

---

## Les deux couches complémentaires

### Couche 1 — Marché

Le marché est vivant, dynamique, émotionnel, riche, visuellement fort, orienté trading réel.

Cette couche doit rester : désirable, premium, fluide, énergique, agréable à utiliser.

Références UX : cockpit aéronautique moderne, Linear, Arc Browser.

**Interdits :** UI casino, surcharge visuelle, clignotements, alertes excitatrices, dopamine artificielle, urgence permanente.

> "Vivant" ≠ "agressif".

### Couche 2 — Opérateur

Le système rend visible : le comportement opérateur, les dérives potentielles, les conflits comportementaux, certaines impulsions, certaines incohérences.

Rôle du système : clarification, contextualisation, régulation discrète, friction intelligente, lisibilité cognitive.

**Cette couche ne moralise pas, ne juge pas, n'impose pas, ne remplace pas l'utilisateur, ne force pas de décisions.**

---

## Principes UX

### A. Surface vivante

Le cockpit peut être riche, vivant, fluide, immersif, émotionnellement fort — sans devenir bruyant, agressif, dopaminergique, saturé.

> Le silence est l'absence de sollicitation, pas l'absence de vie visuelle.

### B. Le silence est une fonction produit

Le système doit savoir ne rien pousser, ne pas solliciter constamment, laisser respirer l'interface, hiérarchiser l'attention.

### C. Limiter la surcharge

Priorité visible permanente : état marché, posture opérateur, lisibilité immédiate.
Les données secondaires restent accessibles mais non persistantes à l'écran.

### D. Pas de mécaniques addictives

Interdits sauf validation explicite : leaderboard, streaks, gamification comportementale, notifications agressives, mécanismes FOMO, scores sociaux, alertes émotionnelles.

---

## Séparation des langages

| Contexte | Langage | Exemples |
|----------|---------|----------|
| **Interne** — docs, doctrine, architecture, réflexions produit | Conceptuel | métacognition, friction cognitive, régulation, couches comportementales |
| **Externe** — UI, copies cockpit, onboarding, messages utilisateur | Concret, trading-oriented | simple, immédiatement compréhensible |

> La doctrine ne doit pas remonter brutalement dans la surface produit.

---

## Garde-fous techniques (inchangés)

Ces règles sont des protections structurelles du noyau produit :

- `payload` comme source unique de vérité
- séparation stricte des couches
- island architecture
- `buildPayload()` protégé
- pas de logique cachée dans l'UI
- pas d'override moteur
- séparation marché / opérateur maintenue
- module comportemental isolé

---

## Checklist — Toute future feature

Avant toute implémentation, vérifier :

1. Est-ce que cette feature améliore réellement la lisibilité ?
2. Est-ce qu'elle ajoute du bruit inutile ?
3. Est-ce qu'elle pousse artificiellement à l'action ?
4. Est-ce qu'elle surcharge l'attention ?
5. Est-ce qu'elle respecte la séparation marché / opérateur ?
6. Est-ce qu'elle protège ou dégrade la stabilité cognitive ?
7. Est-ce qu'elle transforme le cockpit en plateforme crypto classique ?

---

## Objectif final

Construire un cockpit :

- vivant mais non agressif
- riche mais lisible
- émotionnel mais stable
- orienté marché mais non destructeur
- capable d'accompagner un engagement durable avec le trading

> Le système ne doit pas empêcher le marché.
> Il doit empêcher l'opérateur de se perdre dans le marché.
