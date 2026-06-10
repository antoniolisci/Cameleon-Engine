# Fournisseur Serveur V1 — Position officielle

**Caméléon Engine · Document d'architecture produit**
**Date : 2026-06-10 · Statut : AUDIT — EN ATTENTE DE VALIDATION**

> Ce document répond à une seule question :
> "Quel fournisseur serveur doit être retenu pour Caméléon Engine V1 ?"
>
> Aucun code. Aucun tutoriel d'implémentation. Décision produit et architecture uniquement.

---

## Résumé exécutif

Le fournisseur serveur est la seule infrastructure externe à décider avant le Compte Utilisateur V1. Sans lui, la mémoire longue n'existe pas, le Magic Link ne peut pas être validé côté serveur, et l'Admin V1 n'a aucune surface d'opération.

Le critère de sélection n'est pas le prix. C'est : **"quelle solution permet de créer le Compte Utilisateur V1, la mémoire longue serveur, l'Admin V1 et l'export RGPD avec le moins de friction, le moins de dette et le plus de cohérence pour une équipe d'une personne ?"**

**Décision proposée : Supabase.**

Supabase est le seul fournisseur de l'intervalle qui réunit nativement : authentification Magic Link en production, base de données PostgreSQL standard (SQL portable, exports RGPD directs), interface d'administration incluse, configuration SMTP externe possible (Postmark), et philosophie open source avec escape hatch self-hosted permanent.

**Fournisseur de repli : PocketBase.**

---

## 1. Cadre de la décision

### Ce que le serveur doit faire dans Caméléon Engine V1

Quatre fonctions uniquement :

1. **Authentifier l'utilisateur** via Magic Link — valider le token généré, créer la session, la maintenir.
2. **Stocker la mémoire longue** — sessions au-delà du localStorage, liées à l'UUID utilisateur.
3. **Exposer une interface Admin V1 minimale** — gestion des comptes, suppression RGPD, journal d'audit.
4. **Permettre l'export RGPD** — toutes les données utilisateur exportables en JSON ou CSV sur demande.

Ce que le serveur ne doit pas faire : héberger le moteur, modifier les scores, influer sur les décisions du moteur souverain, gérer le contenu de l'application. Le moteur reste 100% client-side. Le serveur est une couche de persistence et d'identité — rien d'autre.

### Ce qui ne compte pas dans cette décision

- Le prix exact par requête (le volume V1 est négligeable pour tous les fournisseurs)
- Les fonctionnalités enterprise (webhooks complexes, ML intégré, edge functions avancées)
- La popularité dans l'écosystème startup
- La profondeur de l'écosystème (plugins, intégrations tiers)

### Ce qui compte

- Authentification Magic Link **native et en production** — pas un plugin expérimental
- Base de données **SQL standard** — exports directs, portabilité certaine, RGPD sans friction
- **Admin V1 opérationnel sans code** — interface de gestion incluse dès J0
- Charge opérationnelle **minimale pour une personne seule**
- **Escape hatch** crédible — possibilité de quitter sans réécriture complète
- Compatibilité SMTP externe — pouvoir brancher Postmark sans friction
- Cohérence avec la philosophie **local-first** : le serveur est une couche additionnelle, pas le centre de gravité

---

## 2. Analyse comparative

| Critère | Supabase | PocketBase | Appwrite | Firebase | Directus | Custom Node+PG | Serverless minimal |
|---------|----------|------------|----------|----------|----------|----------------|-------------------|
| Magic Link natif | ✅✅ | ⚠️ | ✅✅ | ✅✅ | ❌ | Manuel | Manuel |
| PostgreSQL / SQL | ✅✅ | ✅ (SQLite) | ✅ (MariaDB) | ❌ (NoSQL) | ✅✅ | ✅✅ | ✅ (Neon) |
| Admin V1 inclus | ✅✅ | ✅✅ | ✅✅ | ✅ | ✅✅ | ❌ | ❌ |
| SMTP externe (Postmark) | ✅✅ | ✅✅ | ✅✅ | ⚠️ | ✅ | ✅✅ | ✅✅ |
| Export RGPD direct | ✅✅ | ✅✅ | ✅✅ | ⚠️ | ✅✅ | ✅✅ | ✅ |
| Suppression compte | ✅✅ | ✅✅ | ✅✅ | ✅ | ✅✅ | Manuel | Manuel |
| 1 personne | ✅✅ | ✅✅ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ |
| Dette opérationnelle | Faible | Minimale | Modérée | Faible | Modérée | Élevée | Modérée |
| Escape hatch | ✅✅ | ✅✅ | ✅✅ | ❌ | ✅✅ | ✅✅ | ✅ |
| Risque verrouillage | Faible | Nul | Faible | Élevé | Faible | Nul | Modéré |
| Scalabilité V2/V3 | ✅✅ | ✅ | ✅ | ✅✅ | ✅ | ✅✅ | ✅ |
| Cohérence local-first | ✅✅ | ✅✅ | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |

---

**Supabase**
Fondé en 2020. BaaS open source bâti sur PostgreSQL. L'authentification inclut nativement le Magic Link (OTP email) en production, testé à grande échelle. La base de données est PostgreSQL standard — exports SQL directs, portabilité totale, RGPD sans friction. L'interface Supabase Studio constitue un Admin V1 opérationnel dès J0 : gestion des utilisateurs, lecture des tables, logs d'authentification. SMTP externe configurable : Postmark se branche sans friction. Row Level Security intégrée = séparation naturelle des espaces de données par utilisateur. Open source : self-hosting possible si la situation tarifaire change. Free tier couvre largement le V1 (500 MB DB, 50 000 utilisateurs actifs/mois). Réserve principale : l'API Auth est Supabase-specific — migrer l'authentification coûte du code, pas seulement un changement de token. PostgreSQL reste portable.

**PocketBase**
Projet open source Go. Binaire unique : un seul fichier déployé sur un VPS, zéro dépendance. SQLite par défaut (exportable, portable, lisible hors contexte). Interface Admin incluse et fonctionnelle. SMTP externe configurable. Magic Link : PocketBase dispose d'un système OTP email depuis la version 0.23 — couvre le cas d'usage Magic Link mais moins éprouvé en production à grande échelle que Supabase Auth. Cohérence maximale avec la philosophie local-first : le serveur est un binaire sur une machine, pas un service cloud. Escape hatch absolu — possession totale des données. Réserve : projet plus jeune, communauté plus petite, moins de ressources de support. Mais pour un usage V1 minimal (auth + sessions + admin), PocketBase est over-qualified.

**Appwrite**
BaaS open source. Auth inclut Magic URL nativement. Admin console fonctionnel. Docker-based : nécessite de gérer un stack Docker en production. Pour une personne seule, la charge opérationnelle du Docker (mises à jour, sécurité, volumes) est un overhead non négligeable par rapport à PocketBase (binaire seul) ou Supabase (hébergé). Techniquement solide mais la friction de déploiement est au-dessus du seuil acceptable pour V1.

**Firebase**
BaaS Google. Auth inclut "Email Link" (équivalent Magic Link) nativement. Firestore est NoSQL — exports RGPD complexes (pas de SQL direct), structure propriétaire, pas de portabilité standard. Verrouillage fournisseur élevé : Google Cloud, facturation opaque à grande échelle, NoSQL non migrable vers SQL sans réécriture. Si Google change sa politique de tarification (déjà survenu en 2023 avec Firestore pricing) ou déprécie Firebase, la migration est un chantier complet. Pour une décision sur 5 ans, ce risque est structurellement inacceptable.

**Directus**
Headless CMS / Data platform. Excellent pour la gestion de contenu, moins adapté à un cas d'usage auth-first. Pas de Magic Link natif — l'authentification requiert un développement custom. L'usage principal de Directus est la gestion de données structurées, pas l'authentification d'utilisateurs. Hors périmètre V1.

**Backend custom Node/Express + PostgreSQL**
Maximum de flexibilité. Zéro verrouillage. Mais : le serveur devient un projet backend à part entière. Auth Magic Link = à implémenter from scratch. Admin V1 = à construire. RGPD export/suppression = à coder. Pour une personne seule, c'est ouvrir un chantier de plusieurs mois avant de démarrer le Compte Utilisateur V1. Exactement ce que la contrainte principale interdit. Correct pour une équipe avec un développeur backend dédié. Mauvais choix pour Caméléon Engine V1.

**Backend serverless minimal (Vercel/Netlify functions + Neon/PlanetScale)**
Approche hybride : fonctions serverless pour l'API, PostgreSQL serverless (Neon) pour la base. Pas d'admin inclus. Auth = à implémenter via une librairie (Lucia, Auth.js, etc.) — Magic Link possible mais nécessite du code. RGPD = manuel. Intéressant pour minimiser le coût d'hébergement, mais crée une dépendance multiple (function provider + DB provider + auth library) et exige un investissement de configuration non négligeable. La charge de maintenance est distribuée mais non nulle.

---

## 3. Risques

### Risques de dépendance fournisseur

**Verrouillage API Auth.**
Supabase Auth utilise une API spécifique (tokens, sessions, callbacks). Migrer l'authentification vers un autre fournisseur requiert de réécrire les appels Auth — pas une migration de token, mais du code. La donnée utilisateur (PostgreSQL) est portable instantanément. La logique d'authentification est la partie coûteuse à migrer. PocketBase présente le même risque, mais moindre car le code est auto-hébergé et modifiable directement.

**Disparition ou changement de politique du fournisseur.**
Supabase est une entreprise privée (Serie B, ~$200M levés à fin 2025). Risque de rachat, changement tarifaire, ou fermeture non nul. Mitigation permanente : PostgreSQL sous-jacent = escape hatch toujours disponible. PocketBase est open source = risque de disparition nul pour le binaire déjà déployé.

**Firebase (risque de référence).**
Google a déjà modifié la tarification de Firebase/Firestore en 2023 avec peu de préavis. NoSQL = aucun escape hatch SQL. Verrouillage structurel.

### Risques produit

**Le serveur devient un projet backend à part entière.**
Le risque principal pour une personne seule : le serveur capte de l'attention, génère des incidents, exige des mises à jour de sécurité, des migrations, des rollbacks. La règle est : le serveur doit fonctionner "en arrière-plan". Tout fournisseur qui demande plus de 2 heures par mois de maintenance en régime de croisière est trop complexe pour V1.

**Perte de la philosophie local-first.**
Si le serveur devient le centre de gravité du produit (état stocké serveur, logique déplacée côté API, décisions dépendantes d'un round-trip réseau), Caméléon Engine cesse d'être local-first. Le serveur est une couche de persistence et d'identité — jamais une couche de décision.

**Dérive vers une application SaaS classique.**
Sans discipline architecturale, les fonctionnalités "serveur" prolifèrent : notifications push, analytics serveur, sync temps réel. Chaque ajout augmente la dette opérationnelle. La règle : le serveur ne fait que ce que le localStorage ne peut structurellement pas faire.

### Risques RGPD

**Export difficile sur base NoSQL.**
Firebase Firestore ne produit pas d'export SQL natif. Un export RGPD complet (article 20, portabilité des données) exige un code custom sur une structure propriétaire. PostgreSQL produit un dump standard en une commande. SQLite (PocketBase) est exportable en une commande.

**Suppression de compte incomplète.**
Supprimer un compte utilisateur correctement (toutes les données, toutes les tables, logs de session) demande une procédure explicite. Supabase fournit une API de suppression + cascade SQL. PocketBase idem. Une solution custom requiert de l'implémenter entièrement.

### Risques de migration future

**Migration V1 → V2.**
Si le fournisseur V1 ne supporte pas les besoins V2 (ex. : réplication, multi-région, haute disponibilité), une migration sera nécessaire. PostgreSQL (Supabase) → PostgreSQL (autre hébergeur) = migration de données sans réécriture. SQLite (PocketBase) → PostgreSQL = migration plus coûteuse mais faisable. NoSQL → SQL = réécriture.

**Verrouillage sur la logique Auth.**
La logique Magic Link est petite (générer un token, l'envoyer via Postmark, le valider). La réimplémenter sur un autre fournisseur est une demi-journée de travail, pas un chantier. Le risque réel de migration est sur les données, pas sur la logique Auth.

---

## 4. Recommandation

**Fournisseur recommandé : Supabase.**

**Fournisseur à éviter malgré sa popularité : Firebase.**

### Réponses aux questions obligatoires

**Quelle solution permet de lancer le Compte Utilisateur V1 sans créer un chantier serveur disproportionné ?**
Supabase. Magic Link natif et en production, Admin Studio inclus dès J0, PostgreSQL standard, Postmark configurable en quelques minutes. Le Compte Utilisateur V1 peut être opérationnel en quelques sessions de travail — pas quelques semaines.

**Quelle solution est la plus cohérente avec local-first, mémoire longue serveur, Magic Link, Postmark, Admin V1, export / suppression RGPD ?**
Supabase remplit les 6 critères nativement. PocketBase remplit les 6 critères également, avec une friction de déploiement légèrement supérieure (VPS à gérer) mais un verrouillage nul.

**Quelle solution faut-il éviter malgré sa puissance ou sa popularité ?**
Firebase. Sa popularité vient de son intégration dans l'écosystème Google et de sa courbe d'apprentissage initiale douce. Son verrouillage structurel (NoSQL propriétaire, politique tarifaire variable, exports RGPD complexes) est incompatible avec une décision sur 5 ans pour une personne seule.

**Quelle solution serait retenue si l'objectif est "fonctionner pendant plusieurs années sans devenir un projet backend à part entière" ?**
Supabase. Sa gestion de l'infrastructure (mises à jour, sécurité, backups) est entièrement déléguée. La charge opérationnelle en régime de croisière est proche de zéro.

**Le fournisseur serveur doit-il être considéré comme infrastructure neutre, couche produit, ou risque stratégique ?**
**Infrastructure neutre — avec une condition.** Le serveur est une couche de persistence et d'identité, pas une couche de décision. Il ne doit pas devenir un risque stratégique. Il le devient si : (a) le fournisseur crée un verrouillage irréversible (Firebase), ou (b) le serveur capte l'attention architecturale au détriment du moteur. La condition pour rester une infrastructure neutre : PostgreSQL sous-jacent, open source, escape hatch self-hosted disponible. Supabase remplit ces trois conditions.

### Pourquoi pas PocketBase en V1 principal

PocketBase est architecturalement excellent et philosophiquement aligné. Une seule réserve pour le rôle de fournisseur principal V1 : le système OTP email (Magic Link) est plus récent dans PocketBase (v0.23+, 2024) et moins éprouvé en production à grande échelle que Supabase Auth. Pour un fournisseur principal sur une infrastructure d'authentification critique — un Magic Link non reçu = connexion impossible — la maturité de Supabase Auth est le facteur décisif. Si Supabase devait être écarté (tarification, fermeture), PocketBase est le choix de repli naturel : binaire unique, SQLite portable, admin inclus, SMTP externe configurable.

### Classement

1. Supabase ✅✅ — recommandé
2. PocketBase ✅✅ — repli (réserve : maturité OTP Magic Link)
3. Appwrite ✅ — acceptable, friction Docker
4. Serverless minimal ⚠️ — acceptable, configuration multi-provider
5. Custom Node/Express ⚠️ — viable techniquement, devient un projet backend
6. Directus ❌ — hors périmètre auth
7. Firebase ❌ — rejeté

---

## 5. Décision proposée

### Fournisseur serveur V1 — définitif

**Supabase.** Fournisseur de repli : PocketBase.

### Règles permanentes associées

| Règle | Valeur |
|-------|--------|
| Fournisseur V1 | Supabase |
| Base de données | PostgreSQL (standard, portable) |
| Authentification | Magic Link via Supabase Auth |
| SMTP d'envoi | Postmark (configuré sur Supabase) |
| Admin V1 | Supabase Studio — inclus, opérationnel dès J0 |
| Export RGPD | SQL direct — aucun code custom requis |
| Suppression compte | API Supabase + cascade SQL |
| Fournisseur de repli | PocketBase |
| Firebase | Rejeté pour V1 et V2 |
| Moteur souverain | Inchangé — reste 100% client-side |
| Logique décision | Jamais déplacée côté serveur |
| Périmètre serveur | Persistence + identité uniquement |

### Ce que ce document ne décide pas

- La configuration exacte des tables PostgreSQL — appartient à l'implémentation
- La structure des Row Level Security policies — appartient à l'implémentation
- Le contenu exact des sessions persistées — appartient à l'architecture mémoire longue
- Le périmètre migration UUID local → serveur — décision distincte, encore ouverte
- La tarification premium et la gestion des abonnements — hors périmètre de ce document
- La procédure de rollback en cas de défaillance Supabase — appartient à l'exploitation

### Décisions ouvertes restantes après cet audit

| Décision | Statut |
|----------|--------|
| Périmètre migration UUID local → serveur | ❌ Non décidé |

---

## 6. Conditions résiduelles

### Conditions techniques à satisfaire avant implémentation

Ces conditions ne font pas partie de la décision fournisseur — elles appartiennent à la phase d'implémentation. Elles sont listées ici pour éviter les surprises à l'ouverture du chantier.

**Conditions côté Supabase :**
- Projet Supabase créé, clés API stockées en variables d'environnement (jamais dans le code)
- SMTP Postmark configuré dans les paramètres Auth de Supabase (désactiver l'SMTP Supabase par défaut)
- Templates email Magic Link rédigés en français — "Ce lien est valable 15 minutes."
- Rate limiting Auth configuré (cohérence avec `magic_link_ttl_v1.md` : 3 demandes / 15 min)
- Row Level Security activée sur toutes les tables utilisateur

**Conditions côté architecture :**
- UUID local (localStorage) ↔ UUID serveur (Supabase Auth) : périmètre de liaison défini (décision encore ouverte)
- Espace de données utilisateur namespacé correctement (cohérence avec `architecture_donnees_utilisateur.md`)
- Export JSON utilisateur : schéma défini avant premier commit

**Condition RGPD :**
- Procédure de suppression complète documentée avant mise en production (cohérence avec checklist Bloc B)
- Export RGPD : déclenché par l'utilisateur, pas par l'admin uniquement

---

## 7. Verdict final

**Décision la plus importante**
Le fournisseur serveur n'est pas un détail d'infrastructure — c'est le support de l'identité utilisateur, de la mémoire longue et de la conformité RGPD. Un mauvais choix (Firebase) crée un verrouillage irréversible et une dette RGPD permanente. Un bon choix (Supabase) disparaît dans le décor : il fonctionne, se met à jour seul, et reste quittable.

**Découverte la plus importante**
Firebase est le fournisseur à éviter en priorité malgré sa popularité. Son verrouillage NoSQL n'est pas un risque théorique — c'est une certitude structurelle. Une décision sur 5 ans avec un fournisseur dont la politique tarifaire a changé unilatéralement en 2023 n'est pas une décision architecturale saine.

**Fournisseur recommandé**
Supabase. PostgreSQL standard, Magic Link natif en production, Admin Studio inclus, SMTP Postmark configurable, open source avec self-hosting possible. Philosophie cohérente avec Caméléon Engine : le serveur est une infrastructure neutre, pas un centre de décision.

**Fournisseur rejeté définitivement**
Firebase. Verrouillage NoSQL structurel, politique tarifaire instable, exports RGPD complexes. Incompatible avec une décision sur 5 ans pour une équipe d'une personne.

**Risque principal**
Ne pas laisser le serveur devenir un projet à part entière. Le périmètre est strict : persistence + identité. Toute fonctionnalité "serveur" qui ne relève pas de ces deux catégories est une dérive à refuser explicitement.

**Question finale : le choix du fournisseur serveur peut-il être considéré comme fermé après ce document ?**

**Oui, sous réserve de validation par l'opérateur du projet.**

La décision ne contient aucune dépendance vers la décision encore ouverte (périmètre migration UUID local → serveur). Elle peut être validée et figée indépendamment.

**Verdict final**

Classification : **B — Document important.**

Non A car le fournisseur serveur est un choix d'infrastructure, pas une décision doctrinale. Important car il ferme la quatrième condition bloquante de la checklist pré-implémentation (Bloc C2 — fournisseur serveur choisi) et ne laisse plus qu'une seule décision ouverte avant le GO/NO GO.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `user_account_v1_execution_architecture.md` · `smtp_provider_v1.md` · `freemium_matrix_v1.md` · `magic_link_ttl_v1.md`*
