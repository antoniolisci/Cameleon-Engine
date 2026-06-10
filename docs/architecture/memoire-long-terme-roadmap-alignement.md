# Mémoire Long Terme — Alignement Roadmap

> Document d'alignement officiel · Caméléon Engine · 2026-06-10
> Statut : **RÉFÉRENCE — aucun code autorisé avant satisfaction des conditions bloquantes**

---

## Sommaire

1. [La triade fondatrice](#1-triade-fondatrice)
2. [Ordre officiel d'implémentation](#2-ordre-officiel)
3. [Conditions bloquantes](#3-conditions-bloquantes)
4. [Ce qui peut être fait maintenant](#4-autorisé-maintenant)
5. [Ce qui reste interdit maintenant](#5-interdit-maintenant)
6. [Position produit](#6-position-produit)
7. [Verdict](#7-verdict)

---

## 1. La triade fondatrice

La mémoire opérateur long terme repose sur trois documents d'architecture, finalisés le 2026-06-10 et déposés dans `docs/architecture/`. Ils sont interdépendants. Aucun des trois ne peut être implémenté de façon isolée de façon utile.

| Document | Rôle | Fichier |
|---|---|---|
| **MEM-V2** | Compte utilisateur + persistance serveur + 3 espaces mémoire | `mem-v2-compte-memoire-persistante.md` |
| **Baseline V1** | Référence comportementale personnelle versionnée | `baseline-v1-officielle.md` |
| **Couche Fantôme** | Snapshots immuables de tendances — substrat de Couche 3 | `couche-fantome-snapshots-v1.md` |

### Ce que chaque couche apporte

**MEM-V2** résout le problème de persistance : sans compte et sans serveur, toute mémoire disparaît avec le navigateur. C'est l'infrastructure sans laquelle rien de long terme n'est viable.

**Baseline V1** résout le problème de référence : sans ancrage personnel, les scores bruts sont des chiffres sans cadre. La Baseline est le centre de gravité comportemental de l'opérateur — l'état vers lequel son comportement tend à revenir.

**Couche Fantôme** résout le problème de mémoire traversante : sans snapshots immuables, les tendances passées disparaissent avec le cap FIFO des sessions de Couche 1. La Couche Fantôme rend possible la comparaison de comportements séparés dans le temps.

---

## 2. Ordre officiel d'implémentation

La séquence ci-dessous est stricte. Chaque étape est un prérequis de la suivante. L'ordre ne peut pas être inversé ou parallélisé sans créer des dettes structurelles.

```
Étape 1 — Domaine + HTTPS
  ↓ prérequis de tout déploiement réel
Étape 2 — Compte minimum viable (MEM-V2 Phase B)
  magic link · bridge UUID · synchronisation sessions
  ↓ prérequis de la persistance long terme
Étape 3 — Schéma session enrichi (Couche 1)
  regime_marche · qualite_donnees · eligible_baseline · baseline_version
  ↓ prérequis de Baseline V1
Étape 4 — Baseline V1
  20 sessions qualifiées · 8 semaines · double ancrage obligatoire
  ↓ prérequis de la Couche Fantôme
Étape 5 — Couche Fantôme
  condition duale ≥8 sessions + ≥4 semaines · algo_version + baseline_version
  ↓ prérequis de Couche 3
Étape 6 — Mémoire Long Terme M1
  affichage onglet Mémoire · tendances personnelles · mode pré-Baseline explicite
  ↓ prérequis de l'affichage de patterns
Étape 7 — Couche 3 Patterns
  comparaison inter-snapshots · même (algo_version, baseline_version)
  ↓ prérequis de la trajectoire
Étape 8 — Trajectoire opérateur
  direction du changement entre Baselines · reconstruction rare
  ↓ prérequis de l'intelligence collective
Étape 9 — Bibliothèque Vivante
  N≥10 opérateurs opt-in · données second ordre · règle anti-horoscope
```

### Étapes actuellement accessibles

Au 2026-06-10, seule **l'Étape 1** est partiellement engageable (choix domaine, configuration HTTPS). Les Étapes 2 à 9 ne peuvent être démarrées que dans l'ordre, à partir du moment où leurs prérequis sont réunis.

---

## 3. Conditions bloquantes

Ces interdictions sont architecturales, non préférentielles. Les contourner crée des dettes impossibles à corriger rétroactivement.

| Ce qui est interdit | Condition bloquante |
|---|---|
| Implémenter Baseline V1 | Schéma session Couche 1 non enrichi (`regime_marche`, `qualite_donnees`, `eligible_baseline`, `baseline_version`) |
| Implémenter Couche Fantôme | Baseline V1 non opérationnelle |
| Implémenter Couche 3 Patterns | Couche Fantôme non déployée avec versionnement algorithmique actif |
| Implémenter Bibliothèque Vivante | Compte utilisateur absent OU opt-in non implémenté OU seuil N≥10 opérateurs non atteint |
| Afficher toute comparaison relative | Double ancrage non implémenté (absolu co-localisé et affiché en premier) |
| Déployer mémoire serveur | Politique RGPD non documentée et pipeline de suppression non testé |

### Conditions transversales permanentes

Ces règles s'appliquent à toutes les étapes, sans exception :

- **Règle du double ancrage** : aucune donnée relative sans donnée absolue co-localisée, affichée en premier.
- **Règle anti-horoscope** : aucun pattern collectif présenté si extrait de moins de 10 cas distincts.
- **Règle de non-reconstruction silencieuse** : la Baseline n'est jamais reconstruite automatiquement sans décision explicite de l'opérateur.
- **Règle MACRO-RULE-01** : les couches macro ne modifient jamais le score brut du moteur.

---

## 4. Ce qui peut être fait maintenant

Les chantiers suivants sont autorisés sans restriction, dans l'état actuel du projet (pré-compte, pré-domaine) :

| Chantier | Justification |
|---|---|
| **Documentation** | Aucun prérequis — en cours |
| **Roadmap et alignement** | Aucun prérequis — ce document |
| **Audit d'architecture** | Aucun prérequis — pratique systématique |
| **Préparation UX** | Maquettes, flows, textes pour mode pré-Baseline, ligne du temps mémoire |
| **Préparation légale** | RGPD, mentions légales, politique de rétention |
| **Domaine** | Choix domaine, configuration DNS, HTTPS |
| **Collecte bêta** | Sélection des 10–30 premiers opérateurs, protocole d'invitation |
| **Protocole de test V0** | Objectifs, critères d'arrêt, métriques de validation |

---

## 5. Ce qui reste interdit maintenant

Les chantiers suivants sont explicitement interdits tant que leurs conditions bloquantes ne sont pas satisfaites. Cette liste vaut comme décision d'architecture permanente jusqu'à nouvelle instruction.

**Interdit — développement :**

- Coder Baseline V1 (schéma session enrichi non en place)
- Coder Couche Fantôme (Baseline V1 non opérationnelle)
- Coder Couche 3 Patterns (Couche Fantôme non déployée)
- Coder Bibliothèque Vivante (compte + opt-in + seuil N≥10 non atteints)
- Modifier les algorithmes comportementaux (`scoring.js`, `patterns.js`, `metrics.js`) pour anticiper ces couches sans déploiement réel

**Interdit — produit :**

- Ajouter des insights mémoire simulés dans l'interface sans données terrain réelles
- Afficher des "tendances" calculées sur moins de sessions que les seuils documentés
- Présenter des comparaisons relatives sans ancrage absolu co-localisé
- Laisser entendre qu'une mémoire long terme est active avant qu'elle le soit réellement

---

## 6. Position produit

### Le principe

Caméléon Engine ne simule pas une mémoire longue. Il attend d'avoir les données, les versions, les snapshots et les conditions nécessaires pour que cette mémoire soit fiable.

> **Une mémoire absente est honnête. Une mémoire simulée est dangereuse.**

### Pourquoi cette position est non négociable

Un système de mémoire comportementale construit trop tôt — avant les fondations — produit des patterns qui ne sont pas des patterns, des tendances qui ne sont pas des tendances, des progrès qui ne sont pas des progrès. L'opérateur commence à se fier à des miroirs déformés.

Le danger n'est pas technique. Il est cognitif : un opérateur qui croit voir sa trajectoire dans un système qui la simule prend des décisions sur la base d'une fiction. C'est l'inverse exact de la promesse de Caméléon Engine.

### Mode pré-mémoire

Pendant la période précédant la disponibilité de la mémoire long terme, l'interface doit :

- Afficher explicitement que la mémoire long terme n'est pas encore disponible
- Ne pas masquer cette absence derrière des indicateurs partiels
- Présenter le mode pré-Baseline comme une expérience produit intentionnelle, pas un état d'attente

---

## 7. Verdict

**GO DOCUMENTATION — NO CODE.**

Les trois documents fondateurs (`mem-v2-compte-memoire-persistante.md`, `baseline-v1-officielle.md`, `couche-fantome-snapshots-v1.md`) sont finalisés et constituent la référence d'architecture pour toute décision future sur la mémoire opérateur long terme.

Ce document d'alignement sert à une seule chose : empêcher le projet d'aller trop vite et de construire une mémoire fragile avant ses fondations.

La séquence est définie. Les conditions sont claires. L'implémentation commence à l'Étape 1.

---

*Documents fondateurs : `mem-v2-compte-memoire-persistante.md` · `baseline-v1-officielle.md` · `couche-fantome-snapshots-v1.md` · Référence roadmap : `project_product_roadmap_foundations.md`*
