# Doctrine Produit — La confiance précède l'importation

**Statut :** Canonique  
**Date :** 2026-05-29  
**Domaine :** Architecture produit · Relation utilisateur · Modèle d'entrée

---

## Contexte

Une hypothèse historique du projet Caméléon Engine était la suivante :

```
Import utilisateur → Analyse → Valeur
```

Les retours terrain informels montrent cependant une résistance forte à l'importation de données personnelles :
historique Binance, exports CSV/XLSX, rapports fiscaux, journaux personnels, documents PDF.

Cette résistance n'est pas principalement technique.  
Elle est psychologique.

Même lorsque les données restent locales et ne quittent jamais la machine de l'utilisateur, l'importation est perçue comme une exposition de données sensibles.

Le problème n'est donc pas la sécurité réelle.  
Le problème est la **confiance perçue**.

---

## Principe directeur

> **La confiance précède l'importation.**

Caméléon Engine doit démontrer sa valeur avant de demander des données.

L'utilisateur doit pouvoir comprendre le produit, l'utiliser et en retirer un bénéfice réel sans importer le moindre fichier.

L'importation ne doit jamais être une condition d'entrée.  
Elle doit être une décision volontaire de l'utilisateur.

---

## Conséquence architecturale

Les imports ne sont pas la **porte d'entrée** du système.  
Ils sont des **portes de profondeur**.

### Porte d'entrée

Accessible immédiatement — aucune donnée personnelle requise :

- lecture des régimes de marché
- Market State
- narration adaptative
- friction cognitive
- posture décisionnelle
- lecture des phases du marché
- contexte et lisibilité

### Porte de profondeur

Accessible uniquement si l'utilisateur le souhaite :

- import CSV
- import XLSX
- import PDF
- journaux personnels
- historique comportemental
- calibration avancée

**Objectif :** rendre le trader plus lisible à lui-même.

---

## Distinction fondamentale

Caméléon Engine possède deux couches de valeur indépendantes :

**Couche 1 — Comprendre le marché**

> *Que se passe-t-il actuellement ?*

Cette couche ne nécessite aucune donnée utilisateur.

**Couche 2 — Comprendre l'opérateur**

> *Comment est-ce que j'interagis avec ce marché ?*

Cette couche nécessite potentiellement : historique, comportement, journaux, documents.  
Elle est donc **optionnelle**.

---

## Application aux modules existants

### Behavior

Le module Behavior est une fonctionnalité de profondeur.  
Il ne constitue pas le point d'entrée principal du produit.

### PDF Intelligence System

Même logique. Les PDF ne sont pas une condition d'utilisation.  
Ils sont une extension volontaire de la compréhension de soi.

---

## Règle d'évaluation — futures intégrations

Toute nouvelle fonctionnalité demandant un import, une connexion exchange, un wallet ou des données privées doit répondre à la question suivante :

> **Quelle valeur l'utilisateur reçoit-il avant de fournir ces données ?**

Si la réponse est « aucune », la fonctionnalité doit être reconsidérée.

---

## Règle de garde

> **Caméléon Engine doit être utile avant d'être intrusif.**  
> L'utilisateur découvre d'abord la valeur.  
> Il choisit ensuite la profondeur.  
> Jamais l'inverse.
