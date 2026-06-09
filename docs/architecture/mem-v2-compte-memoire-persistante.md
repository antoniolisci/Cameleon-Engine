# MEM-V2 — Architecture Compte Utilisateur & Mémoire Persistante

> Document de référence architecture · Caméléon Engine · 2026-06-09
> Statut : **RÉFÉRENCE — non démarré**

---

## Sommaire

1. [Question liminaire — utiliser sans compte](#1-question-liminaire)
2. [Définition canonique de la session](#2-session-canonique)
3. [Architecture du compte utilisateur](#3-architecture-compte)
4. [Catégories de mémoire](#4-categories-memoire)
5. [Frontières des espaces mémoire](#5-frontieres-espaces)
6. [Synchronisation multi-appareils](#6-synchronisation)
7. [Bibliothèque Vivante de l'Opérateur](#7-bibliotheque-vivante)
8. [Roadmap officielle — Phases A→E](#8-roadmap)
9. [Audit des risques](#9-risques)
10. [Conclusion — compte minimum viable](#10-conclusion)

---

## 1. Question liminaire — utiliser sans compte

**Réponse : oui, indéfiniment.**

L'utilisation sans compte est le mode par défaut et doit le rester. Le compte n'est pas une barrière d'entrée — c'est une couche optionnelle qui devient pertinente lorsque l'opérateur veut que sa mémoire survive à son appareil.

| Mode | Données | Durée | Limite |
|------|---------|-------|--------|
| Sans compte | localStorage uniquement | Tant que le navigateur n'est pas vidé | 50 sessions FIFO |
| Avec compte | localStorage + serveur | Illimitée (sous politique de rétention) | Selon abonnement |

**Ce que le compte débloque :**
- Continuité de la mémoire entre appareils
- Historique long terme (au-delà de 50 sessions)
- Participation optionnelle à la Bibliothèque Vivante
- Accès aux fonctionnalités premium futures (F2+)

**Ce que le compte ne change pas :**
- Le moteur de décision — identique pour tous
- La logique d'analyse comportementale
- La confidentialité des données non partagées

## 2. Définition canonique de la session

**Une session = "une occasion de se voir agir."**

Ce n'est pas un fichier importé. Ce n'est pas une soumission de formulaire. C'est le moment où un opérateur confronte son état intérieur à une décision de marché — et reçoit un miroir.

### Critères de délimitation

Une session commence quand l'opérateur charge le moteur avec l'intention d'analyser une situation réelle ou proche du réel.

Une session se termine naturellement — par fermeture, par déconnexion, ou par un délai d'inactivité significatif (>30 min, paramètre calibrable post-V0).

### Ce qui constitue une session

- Un passage complet dans le Moteur (16 champs remplis → résultat rendu)
- Éventuellement plusieurs itérations dans la même fenêtre de temps (même contexte de marché)

### Ce qui ne constitue pas une session

- Un test de l'interface sans contexte réel
- Un rechargement de page
- Une navigation entre onglets sans nouvelle saisie

### Implication pour la persistance

Le schéma de session existant (`CE_behavior_sessions_v1`) capture déjà les sessions comportementales. MEM-V2 n'écrase pas ce schéma — il l'étend avec un identifiant utilisateur lorsqu'un compte est présent.

## 3. Architecture du compte utilisateur

### Champs minimum viables (5)

| Champ | Type | Usage |
|-------|------|-------|
| `email` | string | Identifiant d'authentification + magic link |
| `uuid` | string (UUID v4) | Clé de namespacing localStorage + bridge serveur |
| `created_at` | ISO 8601 | Audit, rétention, support |
| `last_seen` | ISO 8601 | Détection inactivité, nettoyage |
| `consent_living_library` | boolean | Opt-in Bibliothèque Vivante (défaut : false) |

### Authentification — magic link

Aucun mot de passe. L'opérateur entre son email → reçoit un lien à usage unique → est connecté.

Raisons :
- Supprime la friction d'un mot de passe oublié
- Pas de stockage de hash côté serveur
- Adapté à un outil utilisé de manière espacée (pas quotidien)

### Champs interdits au lancement

Les champs suivants ne doivent pas figurer dans le compte V1 :

- Nom / prénom (non nécessaire au fonctionnement)
- Numéro de téléphone
- Données financières (solde, PnL réel)
- Toute donnée permettant l'identification croisée avec un exchange

### UUID comme pont local→serveur

Le UUID généré localement (`cameleon_user_uuid`) au moment de l'inscription devient la clé de namespacing de toutes les données localStorage existantes. La migration est transparente : les données anonymes préexistantes sont rattachées au compte sans retraitement.

Architecture namespacing déjà en place via ADU-01→04 (`architecture-donnees-utilisateur.md`).

## 4. Catégories de mémoire

### Catégorie A — Mémoire de session (déjà implémentée)

Données générées à chaque passage dans le moteur. Stockées en localStorage, cap 50 sessions FIFO (MEM-01B).

Contenu : score brut, posture, profil, état marché, timestamp, résultat comportemental si analyse disponible.

**Avec compte :** synchronisées sur serveur, illimitées (sous politique de rétention).

### Catégorie B — Mémoire comportementale long terme

Données agrégées sur les patterns de l'opérateur au fil du temps. Non stockées session par session — calculées à intervalles (hebdomadaire ou sur déclenchement manuel).

Contenu : évolution du profil comportemental, tendances de score, patterns d'entrée récurrents.

**Sans compte :** non disponible (insuffisamment de sessions locales pour être fiable).
**Avec compte :** disponible à partir de N≥10 sessions réelles sur une période cohérente.

### Catégorie C — Mémoire déclarative

Données saisies explicitement par l'opérateur : objectifs personnels, règles auto-imposées, notes de session.

**Statut :** différé post-V0 terrain. Pas de chantier ouvert.

### Données interdites en mémoire

Les données suivantes ne doivent jamais entrer dans la mémoire persistante, quel que soit le consentement :

- Clés API exchange
- Montants de trades réels (même agrégés)
- Adresses de wallets
- Screenshots ou exports bruts non traités
- Toute donnée permettant de reconstituer l'historique financier complet d'un opérateur

## 5. Frontières des espaces mémoire

Trois espaces distincts, avec des règles de transfert explicites :

```
┌─────────────────────────────────────────────────────────────────┐
│  ESPACE 1 — Mémoire privée utilisateur                          │
│  Propriété : opérateur                                           │
│  Stockage : localStorage (local) + serveur namespacé (compte)   │
│  Accès : opérateur uniquement                                    │
│  Suppression : à la demande, immédiate                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │ opt-in explicite requis
                              │ anonymisation irréversible
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ESPACE 2 — Bibliothèque Vivante (anonymisée)                   │
│  Propriété : Caméléon Engine (agrégat)                          │
│  Stockage : serveur, sans clé individuelle                       │
│  Accès : moteur de patterns uniquement (N≥10)                   │
│  Suppression individuelle : impossible (irréversibilité de       │
│  l'anonymisation — mentionnée explicitement au consentement)     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ extraction patterns uniquement
                              │ jamais de données brutes
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ESPACE 3 — Mémoire produit                                     │
│  Propriété : Caméléon Engine                                     │
│  Contenu : patterns comportementaux statistiques, aucune donnée  │
│  individuelle, sert à calibrer les seuils du moteur              │
│  Accès : équipe produit uniquement                               │
└─────────────────────────────────────────────────────────────────┘
```

**Règle de transfert :** les données ne peuvent transiter que dans le sens 1→2→3. Jamais en sens inverse. Le passage de 1 vers 2 requiert un opt-in explicite, éclairé, révocable pour les sessions futures (mais non rétroactif une fois anonymisées).

## 6. Synchronisation multi-appareils

### Principe de base : local d'abord, serveur comme miroir

Le localStorage reste la source de vérité pour la session en cours. Le serveur reçoit les sessions terminées — il n'est pas interrogé en temps réel.

### Règle de conflit (last-write-wins avec marqueur de source)

En cas de désynchronisation entre localStorage et serveur (ex. : utilisation hors-ligne puis reconnexion) :

1. Les sessions avec timestamp plus récent ont priorité
2. En cas d'égalité de timestamp : la session locale a priorité sur la session serveur
3. Aucune session n'est supprimée silencieusement — les conflits sont loggés

### Cas limites documentés

| Situation | Comportement |
|-----------|-------------|
| Utilisation sur deux appareils simultanés | Chaque appareil gère sa session ; fusion au prochain sync |
| Appareil perdu / réinitialisé | Récupération depuis serveur à la reconnexion |
| Suppression de compte | Suppression serveur immédiate ; localStorage local non touché (contrôle utilisateur) |
| Révocation opt-in Bibliothèque Vivante | Arrêt du transfert futur ; données déjà anonymisées non récupérables |

### Offline-first

L'outil doit rester pleinement fonctionnel sans connexion. Le compte est une couche de synchronisation, pas une dépendance d'exécution.

## 7. Bibliothèque Vivante de l'Opérateur

### Définition

Un corpus anonymisé de patterns comportementaux, extrait des données de l'Espace 1 avec consentement explicite. Il permet au moteur de calibrer ses seuils sur des comportements réels, et non sur des heuristiques statiques.

### Conditions d'activation

- Minimum N≥10 opérateurs distincts avec opt-in actif
- Chaque opérateur doit avoir produit ≥5 sessions réelles
- L'extraction de patterns ne s'effectue que sur l'agrégat — jamais sur un opérateur individuel

### Ce que la Bibliothèque contient

- Distributions de profils comportementaux (Discipliné / Réactif / Impulsif / Agressif)
- Corrélations entre conditions de marché et erreurs comportementales fréquentes
- Seuils empiriques de score par profil type

### Ce que la Bibliothèque ne contient pas

- Aucun identifiant, même indirect
- Aucune séquence de trades réels
- Aucune donnée permettant de reconstituer un historique individuel

### Règle anti-horoscope

**La Bibliothèque Vivante ne doit jamais produire de résultats sur des populations trop petites.**

Règle : aucun pattern ne peut être présenté à l'opérateur comme "les opérateurs de votre profil font X" si ce pattern est extrait de moins de 10 cas distincts. En dessous de ce seuil, le résultat est soit masqué, soit présenté comme indicatif uniquement.

Raison : un pattern extrait de 3 ou 4 cas n'est pas un pattern — c'est du bruit. Présenter du bruit comme signal nuit directement à la confiance que l'opérateur place dans son miroir.

### Statut actuel

Non démarré. Prérequis : compte utilisateur opérationnel + ≥10 opérateurs avec opt-in. Référence : `project_operator_living_library.md`.

## 8. Roadmap officielle — Phases A→E

### Phase A — Infrastructure locale (prérequis : mise en ligne)

- Domaine enregistré + HTTPS actif
- UUID local généré et stable par navigateur (déjà en place via ADU-01)
- localStorage namespacé par UUID (déjà en place via ADU-02→04)
- Politique de rétention locale documentée (MEM-01B ✅)

**Statut :** partiellement en place. Bloquant : domaine + HTTPS.

### Phase B — Compte minimum viable

- Magic link authentication (email → token → session)
- Bridge UUID local → serveur
- Synchronisation sessions terminées (Catégorie A)
- Interface "Mon compte" minimale : email + opt-in Bibliothèque Vivante
- RGPD : page de suppression de compte + export données

**Statut :** non démarré. Condition d'entrée : Phase A complète.

### Phase C — Mémoire comportementale long terme

- Agrégation des sessions Catégorie A en profil évolutif (Catégorie B)
- Affichage dans l'onglet Mémoire : "Votre profil sur les 30 derniers jours"
- Seuil minimum : N≥10 sessions personnelles pour afficher un trend

**Statut :** non démarré. Condition d'entrée : Phase B + ≥10 sessions réelles.

### Phase D — Bibliothèque Vivante (N≥10 opérateurs)

- Pipeline anonymisation Espace 1 → Espace 2
- Extraction patterns sur agrégat
- Premier calibrage empirique des seuils moteur
- Présentation patterns à l'opérateur (règle anti-horoscope active)

**Statut :** non démarré. Condition d'entrée : Phase C + ≥10 opérateurs opt-in.

### Phase E — Mémoire déclarative (optionnelle)

- Interface notes de session
- Règles auto-imposées persistantes
- Objectifs personnels trackés

**Statut :** différé. Décision : post-V0 terrain, selon signal utilisateur.

## 9. Audit des risques

| ID | Risque | Sévérité | Mitigation |
|----|--------|----------|------------|
| R-01 | Perte de données localStorage (clear navigateur) | Élevée | Sync serveur dès Phase B |
| R-02 | Fuite UUID entre opérateurs via URL partagée | Moyenne | UUID jamais dans l'URL ; cookie httpOnly ou sessionStorage |
| R-03 | Violation RGPD — données non supprimées à la demande | Élevée | Pipeline de suppression testé avant Phase B |
| R-04 | Opt-in Bibliothèque Vivante mal compris → sentiment de trahison | Élevée | Langage clair, irréversibilité explicite, séparation visuelle opt-in |
| R-05 | Magic link intercepté | Moyenne | Lien à usage unique, expiration 15 min, HTTPS obligatoire |
| R-06 | Dérive coût serveur avec croissance utilisateurs | Faible | Architecture local-first minimise les appels serveur |
| R-07 | Dépendance au serveur rend l'outil inutilisable hors-ligne | Élevée | Offline-first : serveur jamais sur le chemin critique d'exécution |

### Risque prioritaire : localStorage critique

Identifié dans l'Audit de complétude produit V1 (`c6771fd`) : localStorage est le seul point de persistance local. Un utilisateur qui vide son navigateur perd tout. Ce risque est le principal moteur de la Phase B.

**Mitigation court terme (avant Phase B) :** documenter clairement dans le Guide Opérateur que localStorage peut être vidé, et qu'un export manuel est la seule sauvegarde disponible.

## 10. Conclusion — compte minimum viable

**Le compte minimum viable = email + UUID.**

Deux champs. Pas de mot de passe. Pas de profil. Pas de préférences. Juste ce qui permet de reconnaître un opérateur d'une session à l'autre, et de faire survivre sa mémoire à un appareil.

### Ce que ce document ne tranche pas

- Le choix de l'infrastructure serveur (self-hosted vs BaaS)
- Le modèle tarifaire (freemium, abonnement, etc.)
- L'interface exacte de la page compte
- Le traitement RGPD détaillé (juridique → référence `project_legal_v1.md`)

Ces décisions appartiennent à la Phase B et seront prises au moment de l'implémentation, en tenant compte du contexte réel d'alors.

### Principe directeur

> Le compte ne doit jamais donner l'impression d'être une surveillance. Il doit donner l'impression d'être une mémoire qui appartient à l'opérateur.

La différence entre surveillance et mémoire n'est pas technique — elle est dans la conception, le langage, et le contrôle donné à l'utilisateur sur ses propres données.

---

*Référence roadmap : `project_product_roadmap_foundations.md` · Séquence : Architecture → Compte → Mémoire → Portefeuille*
