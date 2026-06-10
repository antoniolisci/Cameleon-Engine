# Compte Utilisateur Phase A — Audit Architectural

**Caméléon Engine · Document d'architecture**
**Date : 2026-06-10 · Statut : AUDIT — EN ATTENTE DE VALIDATION**

> Ce document est un audit de position. Aucun code. Aucun schéma. Aucun fournisseur. Aucune UI.
> Il répond à une seule question : pourquoi le Compte Utilisateur devient-il le verrou principal de l'architecture ?

---

## 1. Mission

Le Compte Utilisateur n'est pas un chantier d'interface. Ce n'est pas un formulaire d'inscription. Ce n'est pas une décision de stack technique.

C'est une décision fondatrice sur la nature du produit.

**La question à laquelle ce document répond :**

> Que devient Caméléon Engine lorsqu'il cesse d'être une application locale pour devenir un système capable de se souvenir d'un utilisateur dans le temps ?

La réponse détermine ce que le Compte Utilisateur doit être — et ce qu'il ne doit jamais devenir.

---

## 2. Pourquoi ce chantier existe

### 2.1 Aujourd'hui — la réalité locale

Caméléon Engine est une application entièrement locale. Toutes les données de l'opérateur vivent dans le navigateur :

- Le moteur tourne localement
- La mémoire comportementale est dans le navigateur
- Les sessions sont stockées localement (50 sessions, FIFO)
- Si le cache est effacé, tout disparaît
- Si l'opérateur change d'appareil, il repart de zéro

L'opérateur a une identité locale — un UUID généré silencieusement au premier lancement. Cette identité ne sort pas du navigateur. Elle ne permet ni de récupérer les données, ni de les transférer, ni de les accumuler dans le temps au-delà du plafond FIFO.

### 2.2 Demain — ce que le compte rend possible

Avec une identité stable reconnue côté serveur :

- L'historique survit au changement de navigateur ou d'appareil
- Les sessions s'accumulent sans plafond FIFO brutal
- Les données comportementales ont une durée de vie choisie, pas subie
- Les corrélations temporelles deviennent calculables
- La Couche Macro peut associer chaque session à un Macro_State sur plusieurs mois

### 2.3 La différence fondamentale

Ce n'est pas une différence de confort. C'est une différence de nature.

**Sans compte :** chaque session est une observation isolée dans un navigateur. Le moteur ne grandit pas avec l'opérateur. La valeur est constante dans le temps — utile à chaque usage, jamais cumulative.

**Avec compte :** chaque session s'intègre dans une trajectoire personnelle. Le moteur peut commencer à répondre à "qu'est-ce qui se répète chez toi ?" et pas seulement à "que montrent ces données maintenant ?". La valeur croît avec le temps.

Cette transition — de l'observation ponctuelle à la trajectoire personnelle — est précisément ce que le Compte Utilisateur rend architecturalement possible.

---

## 3. Ce qu'est un Compte Utilisateur

### 3.1 Ce qu'il apporte

Le Compte Utilisateur est une **identité stable dans le temps**, reconnue sur plusieurs appareils, permettant à la mémoire de persister indépendamment du navigateur ou du cache.

Il n'apporte pas de nouvelles fonctionnalités au moteur. Il apporte une fondation à la mémoire : la possibilité d'accumuler, de retrouver, et d'exploiter un historique personnel.

### 3.2 Ce qu'il ne doit jamais devenir

**Ce n'est pas un système social.** L'opérateur n'a pas de profil visible par d'autres. Il n'interagit pas avec d'autres utilisateurs. Il n'y a pas de timeline, de partage, de like.

**Ce n'est pas un réseau.** Aucune notion de connexion entre opérateurs. Aucun classement. Aucune comparaison inter-utilisateurs dans l'espace personnel de l'opérateur.

**Ce n'est pas un profil public.** L'identité est privée par défaut, permanente. Elle n'est jamais exposée à d'autres utilisateurs.

**Ce n'est pas un système de classement.** Il n'y a pas de score global, de rang, de niveau visible par autrui. La progression de l'opérateur est une affaire personnelle.

**La formulation canonique :** le Compte Utilisateur est une clé d'accès à sa propre mémoire, pas une présence dans un espace partagé.

---

## 4. Ce que le Compte débloque

### Mémoire longue durée

Sans compte, la mémoire est plafonnée à 50 sessions FIFO dans un seul navigateur. Avec compte, la mémoire peut s'accumuler indéfiniment côté serveur, survivre aux changements d'appareils, et être retrouvée après une interruption de plusieurs mois.

La mémoire longue durée est impossible sans identité stable. L'UUID local est une identité de session, pas une identité de vie.

### Historique personnel

Un historique qui traverse le temps n'a de sens que si quelqu'un le reconnaît d'une session à l'autre. Le compte est ce qui relie les sessions entre elles dans le temps long. Sans lui, chaque session est orpheline.

### Couche Macro

La Couche Macro produit sa valeur réelle en croisant le comportement de l'opérateur avec le régime systémique sur 6 à 24 mois (doctrine Macro V1, §9). Ce croisement nécessite un historique continu et nominatif. Un historique local FIFO ne peut pas le garantir.

### Corrélations comportementales

Les corrélations personnelles — FOMO × régime, impulsivité × contexte, validation × posture — exigent des centaines de sessions pour atteindre une robustesse exploitable. Ces sessions doivent appartenir au même opérateur. Sans compte, cette appartenance n'est garantie que sur un seul navigateur, sur une durée bornée.

### Futur Constellium

Le Constellium Sens B est défini comme "l'histoire vivante d'un opérateur dans le temps" (position officielle, 2026-06-03). Une histoire vivante présuppose un fil conducteur — une identité qui relie les chapitres. Le compte est ce fil.

---

## 5. Ce qu'il ne débloque pas

**Il ne rend pas le moteur plus précis.** Le calcul de score, de posture, d'actions autorisées est strictement local et indépendant de l'identité. Un opérateur avec compte et un opérateur sans compte reçoivent exactement le même verdict pour le même formulaire.

**Il ne produit pas immédiatement de valeur personnelle.** La valeur des corrélations est derrière un mur temporel de 6 à 24 mois. Créer un compte ne produit pas de lecture personnelle instantanée. Ce serait une promesse impossible à tenir.

**Il ne rend pas le moteur prédictif.** L'historique décrit ce qui s'est passé. Il ne prédit jamais ce qui va se passer. Ce principe est non négociable.

**Il ne permet pas la comparaison entre opérateurs.** Les données comportementales personnelles ne servent pas à se comparer à d'autres. La Bibliothèque Vivante (future, opt-in explicite) agrège des patterns anonymisés. Elle ne crée pas de classement.

**Il ne résout pas seul la dette FIFO.** Avoir un compte ne signifie pas que les 50 sessions locales existantes ont déjà été transférées. Le pont local → serveur est une étape distincte, active uniquement après le compte.

**Il ne crée pas de score de performance opérateur.** Pas de classement. Pas de score de progression visible. Pas d'historique de "qualité opérateur". La mémoire décrit une trajectoire — elle ne note jamais l'utilisateur. Cette exclusion est permanente et non négociable.

---

## 6. Relation avec Pilotage

Le Pilotage — la couche de cadrage opérateur — n'est pas modifié par le compte. L'opérateur remplit le même formulaire. Il reçoit la même aide au cadrage. La présence ou l'absence d'un compte ne change ni les champs, ni leur logique, ni leur ordre.

Ce qui change à terme : le Pilotage peut accéder à un contexte historique personnel. "Lors de tes dernières sessions en profil ACTIF, tu as plus souvent choisi de valider sans ajustement." Ce contexte est impossible sans mémoire longue, donc sans compte.

---

## 7. Relation avec Moteur

Le Moteur est souverain. Toujours.

Le compte utilisateur ne commande jamais le moteur. Il ne modifie pas `baseEngine()`, `profileMatrix()`, `computeTradingPolicy()`, `applyValidation()`, ni `buildPayload()`. Un même formulaire produit exactement le même score, la même posture, les mêmes actions autorisées — avec ou sans compte actif.

Cette règle est non négociable et s'applique à tout futur développement impliquant l'identité utilisateur.

---

## 8. Relation avec Mémoire

C'est la section la plus importante de ce document.

### Mémoire locale (aujourd'hui)

La mémoire actuelle vit dans le navigateur. Elle est liée à l'UUID local — un identifiant généré silencieusement, sans email, sans serveur. Elle est :

- Privée par nature (personne d'autre n'y accède)
- Fragile (un effacement de cache la détruit)
- Limitée (50 sessions FIFO)
- Non portable (liée au navigateur)
- Non récupérable (pas de backup automatique)

Elle est suffisante pour un outil d'analyse ponctuel. Elle est insuffisante pour un système vivant.

### Mémoire durable (ce que le compte rend possible)

Avec un compte, la mémoire peut être synchronisée côté serveur. Elle devient :

- Persistante (survive aux changements d'appareils)
- Récupérable (l'opérateur peut retrouver son historique après interruption)
- Extensible (plus de plafond FIFO arbitraire côté serveur)
- Transportable (accessible depuis n'importe quel appareil)

La mémoire locale reste présente et reste prioritaire (offline-first). Le serveur est une sauvegarde et un pont, pas un remplacement.

### Mémoire personnelle (la promesse réelle)

La mémoire personnelle n'est pas seulement une question de volume ou de persistance. C'est une question d'appartenance dans le temps.

Une session comportementale n'a de sens que si elle appartient au même opérateur que la session de la semaine précédente. Ce lien d'appartenance dans le temps — sur 6 mois, sur 2 ans — exige une identité stable reconnue.

Le compte utilisateur est ce qui transforme une collection de sessions stockées en une mémoire personnelle continue.

### Les frontières

La mémoire personnelle de l'opérateur ne doit jamais :
- Être visible par d'autres opérateurs
- Alimenter des comparaisons inter-utilisateurs sans consentement explicite et irréversible
- Être utilisée pour produire des verdicts sur la "qualité" de l'opérateur
- Être transmise à un espace partagé sans opt-in documenté

---

## 9. Relation avec Comportement

Le module comportemental analyse les trades importés et produit un score, des patterns, un profil. Aujourd'hui, chaque import est traité indépendamment des précédents dans la limite des 50 sessions FIFO.

Sans compte, les lectures comportementales sont bornées dans le temps et non garanties dans leur continuité. L'opérateur peut perdre ses données entre deux sessions.

Avec compte, les lectures comportementales peuvent s'appuyer sur un historique continu. Les patterns observés sur 3 semaines deviennent des tendances observées sur 18 mois. La différence n'est pas quantitative — c'est la différence entre une anecdote et une signature comportementale.

Une signature comportementale robuste — la base du futur Miroir Vivant — est impossible sans une identité stable qui garantit la continuité du corpus.

---

## 10. Relation avec Couche Macro

La Couche Macro associe chaque session à un Macro_State. Cette association ne produit de valeur réelle qu'à partir de 6 mois de données continues.

Sans compte : les associations Macro × session existent localement, mais sont plafonnées à 50 sessions et vulnérables à la perte du localStorage.

Avec compte : les associations peuvent s'accumuler sans plafond sur serveur, sur la durée nécessaire aux corrélations robustes.

Le compte n'est pas une condition d'utilisation de la Couche Macro. Il est une condition de sa valeur réelle.

---

## 11. Relation avec Constellium

La position officielle du Constellium Sens B est : "l'histoire vivante d'un opérateur dans le temps." (2026-06-03)

Cette définition contient trois mots qui impliquent chacun une dépendance au compte :

**"histoire"** — un historique qui traverse le temps, pas une collection de sessions éphémères.
**"vivante"** — continue, active, mise à jour au fil des usages.
**"dans le temps"** — sur des mois, des années — pas sur un seul navigateur pendant quelques semaines.

**Le Compte Utilisateur est-il une condition fondatrice du Constellium vivant ?**

Oui.

Sans identité stable, le Constellium Sens B est un nom sans corps. Il ne peut pas être "l'histoire vivante" d'un opérateur si cette histoire disparaît à chaque effacement de cache. La mémoire longue est la fondation du Constellium. Le compte utilisateur est la fondation de la mémoire longue. La chaîne de dépendance est directe et non négociable.

---

## 12. Risques

### R-ACC-01 — Dérive surveillance

Un système qui accumule l'historique comportemental d'un opérateur sur plusieurs années possède une capacité de surveillance potentiellement importante. La frontière entre "mémoire personnelle" et "profil de surveillance" est une décision de design, pas une propriété technique.

**Mitigation :** doctrine 3 espaces mémoire (privé / opt-in / agrégé). Aucune donnée personnelle dans l'Espace 3 sans opt-in explicite et irréversible.

### R-ACC-02 — Illusion de personnalisation immédiate

Le risque de promettre une expérience personnalisée dès la création du compte. L'opérateur crée son compte, attend une "intelligence personnelle" — et reçoit le même verdict que sans compte.

**Mitigation :** ne jamais promettre de valeur personnelle immédiate. La communication doit être claire : le compte prépare une mémoire longue dont la valeur apparaît en mois 6 à 24.

### R-ACC-03 — Dépendance serveur

Avec un compte serveur, le moteur devient partiellement dépendant d'une infrastructure externe. Si le serveur est indisponible, l'opérateur perd l'accès à son historique.

**Mitigation :** offline-first strict. Le serveur est toujours hors du chemin critique du moteur. La session fonctionne sans serveur. La synchronisation est différée.

### R-ACC-04 — Perte de simplicité

L'application locale actuelle n'a pas de friction d'entrée. Un compte ajoute une étape. Chaque étape supplémentaire est un filtre qui réduit le taux de conversion.

**Mitigation :** utilisation sans compte = toujours possible, indéfiniment. Le compte est une option, pas une obligation d'entrée. Le moteur reste accessible à zéro friction.

### R-ACC-05 — Confusion mémoire / prédiction

L'accumulation d'historique peut donner l'illusion que le moteur "connaît" l'opérateur et peut prédire son comportement. Cette confusion fragilise la confiance et contredit la philosophie produit.

**Mitigation :** vocabulaire strict — la mémoire décrit, jamais ne prédit. Toute lecture comportementale historique est formulée au passé observé. Jamais au futur probable.

---

## 13. Conditions bloquantes

Aucun chantier Compte Utilisateur ne s'ouvre avant :

- ☐ Mise en ligne effective sur domaine avec HTTPS — condition absolue (Phase A MEM-V2)
- ☐ Documents légaux en place — CGU, politique de confidentialité, mentions légales — la collecte d'email sans cadre légal est une violation RGPD
- ☐ Pipeline RGPD opérationnel — droit à la suppression testé et documenté avant toute écriture serveur
- ☐ Matrice Gratuit/Premium décidée — la frontière compte gratuit / compte premium détermine ce que le compte active exactement
- ☐ Format de session serveur stabilisé — migrer un historique dans un format instable est une dette garantie
- ☐ Stratégie de migration UUID local → UUID serveur documentée — le bridge est préparé (ADU-01→04) mais son activation est une décision produit, pas technique
- ☐ Administration V1 opérationnelle — capacité de traiter les demandes RGPD côté compte avant toute activation de collecte email : suppression de compte, export des données utilisateur, vérification de l'état d'une demande. Sans cet outil, le système ne peut pas être exploité légalement.
- ☐ Export serveur garanti — toute donnée accumulée côté serveur doit rester portable. L'export JSON local actuel (ARCH-N4) couvre uniquement les données localStorage. Aucun compte en production sans portabilité de sortie côté serveur.

---

## 14. Recommandation

**Le Compte Utilisateur est — C. Fondateur.**

Il n'est pas optionnel parce que sans lui, la mémoire longue est impossible, et la mémoire longue est la colonne vertébrale de tout ce que Caméléon Engine doit devenir (audit `user_memory_long_term_audit.md`).

Il n'est pas simplement important parce que son impact n'est pas additif. Il ne s'ajoute pas à ce qui existe — il le transforme. Sans lui, l'opérateur reste un visiteur. Avec lui, l'opérateur devient un sujet dans le temps.

Il est fondateur parce qu'il conditionne, dans l'ordre :

1. La mémoire longue durée
2. Les corrélations comportementales
3. La valeur réelle de la Couche Macro
4. Le Miroir Vivant
5. La Bibliothèque Vivante
6. L'Empreinte Opérateur™
7. Le Constellium Sens B

Chacun de ces éléments est bloqué sans identité stable. Le compte n'est pas un chantier parmi d'autres dans la séquence produit — il est le pivot qui rend possible la seconde moitié du produit.

---

## 15. Verdict

Le Compte Utilisateur est le verrou principal de l'architecture parce qu'il est la condition de l'identité persistante, et l'identité persistante est la condition de la mémoire longue, et la mémoire longue est la condition de l'intelligence différenciante du produit.

Ce n'est pas un chantier d'authentification. C'est le moment où Caméléon Engine cesse d'être un outil et commence à être un système vivant.

Sa mise en œuvre est conditionnée à la mise en ligne effective et au cadre légal. Elle ne peut pas être anticipée. Elle ne peut pas être reportée indéfiniment sans compromettre la valeur à long terme du produit.

**Statut : DIFFÉRÉ — CONDITIONS IDENTIFIÉES — VERROU CRITIQUE EN PHASE PRODUIT**

---

## Résumé exécutif

**Décision la plus importante**
Le Compte Utilisateur est fondateur, pas optionnel. Il n'ajoute pas de fonctionnalités au moteur — il change la nature du produit. Sans lui, Caméléon Engine est un outil d'analyse. Avec lui, il devient un système vivant capable de se souvenir d'un opérateur dans le temps.

**Découverte la plus importante**
Le compte ne produit aucune valeur immédiate visible. Sa valeur est différée — elle apparaît à travers la mémoire longue, les corrélations, et les lectures personnelles. Promettre une valeur immédiate serait une dérive produit. La communication doit être honnête : le compte prépare une intelligence qui n'existe qu'après 6 à 24 mois d'accumulation.

**Risque principal**
L'illusion de personnalisation immédiate (R-ACC-02) : l'opérateur crée un compte et attend une expérience différente. Si le moteur produit exactement le même verdict — ce qui est correct architecturalement — l'opérateur peut vivre le compte comme inutile. Ce risque est de communication produit, pas de conception.

**Condition bloquante principale**
Mise en ligne effective sur domaine avec HTTPS + documents légaux en place. Sans cadre légal, la collecte d'email est une violation. Sans domaine sécurisé, le compte n'a pas de surface d'existence. Ces deux conditions sont co-bloquantes.

**Verdict**
Le Compte Utilisateur est le pivot entre Caméléon Engine comme outil local et Caméléon Engine comme système vivant. Il conditionne la mémoire longue, les corrélations comportementales, la Couche Macro réelle, et le Constellium. Il ne commande jamais le moteur souverain. Il doit rester invisible sur le chemin critique d'exécution. Sa valeur est temporelle, pas immédiate. Statut : différé — conditions identifiées — verrou critique en Phase Produit.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `mem-v2-compte-memoire-persistante.md` · `architecture-donnees-utilisateur.md` · `user_memory_long_term_audit.md` · `macro_layer_doctrine_v1.md`*
