# Fournisseur SMTP V1 — Position officielle

**Caméléon Engine · Document d'architecture produit**
**Date : 2026-06-10 · Statut : AUDIT — EN ATTENTE DE VALIDATION**

> Ce document répond à une seule question :
> "Quel fournisseur SMTP doit être retenu pour Caméléon Engine V1 ?"
>
> Aucun code. Aucun benchmark marketing. Décision produit et architecture uniquement.

---

## Résumé exécutif

Le fournisseur SMTP est la seule infrastructure externe indispensable au Compte Utilisateur V1. Sans lui, le Magic Link ne part pas — l'authentification est impossible.

Le critère de sélection n'est pas le prix. C'est : **"quelle solution crée le moins de friction, le moins de dette et le moins de charge mentale sur plusieurs années, pour une équipe d'une personne ?"**

**Décision proposée : Postmark.**

Postmark est le seul fournisseur de l'intervalle construit exclusivement pour l'email transactionnel — le seul cas d'usage de Caméléon Engine. Sa philosophie correspond exactement au critère : fonctionner pendant plusieurs années sans y penser.

---

## 1. Cadre de la décision

### Ce que le SMTP doit faire dans Caméléon Engine V1

Un seul type d'email : le Magic Link d'authentification. Pas de newsletter. Pas de marketing. Pas de notification produit. Pas d'email de bienvenue enrichi. Un lien. Envoyé à la demande. Reçu dans les secondes qui suivent.

Le volume en V1 est minimal : quelques dizaines d'emails pour la bêta fermée, progressivement quelques centaines. La délivrabilité doit être excellente dès le premier email — un Magic Link non reçu est une connexion impossible.

### Ce qui ne compte pas dans cette décision

- Le prix exact par email (le volume V1 est négligeable pour tous les fournisseurs)
- Les fonctionnalités marketing (hors périmètre permanent)
- Les tableaux de bord analytics avancés (non nécessaires)
- L'intégration avec des outils tiers (aucun outil tiers dans la stack V1)

### Ce qui compte

- Délivrabilité fiable dès J0, sans configuration complexe
- API simple — une requête, un email envoyé
- Stabilité du fournisseur sur 3 à 5 ans
- Charge opérationnelle minimale pour une personne seule
- Pas de gestion de réputation à la main

---

## 2. Analyse comparative

| Critère | Postmark | Resend | Brevo | Mailgun | SendGrid | Amazon SES |
|---------|----------|--------|-------|---------|----------|------------|
| Simplicité V1 | ✅✅ | ✅✅ | ✅ | ✅ | ⚠️ | ❌ |
| Délivrabilité | ✅✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Facilité d'exploitation | ✅✅ | ✅✅ | ✅ | ✅ | ⚠️ | ❌ |
| Dette opérationnelle | Nulle | Nulle | Faible | Faible | Modérée | Élevée |
| 1 personne | ✅✅ | ✅✅ | ✅ | ✅ | ⚠️ | ❌ |
| Stabilité fournisseur | ✅✅ | ⚠️ | ✅ | ✅ | ✅ | ✅✅ |
| Risque verrouillage | Faible | Faible | Faible | Faible | Modéré | Faible |
| "Sans y penser" | ✅✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ |

**Postmark**
Fondé en 2009. Spécialisé exclusivement dans l'email transactionnel — il n'a jamais voulu faire autre chose. La délivrabilité est son seul produit. Les pools d'envoi sont séparés strictement entre transactionnel et marketing (Postmark ne fait pas de marketing). La réputation est maintenue sans intervention de l'utilisateur. L'API est parmi les plus simples du marché : un endpoint, un token, un JSON. Pas de gestion de listes, pas de segments, pas de campagnes. Exactement le profil recherché.

**Resend**
Lancé en 2023. Philosophie développeur-first, API très propre. Interface épurée. Croissance rapide, bonne réputation parmi les équipes techniques modernes. Tier gratuit généreux (3 000 emails/mois). Réserve principale : entreprise jeune, moins de 3 ans d'existence. Pour une décision sur 5 ans, c'est une incertitude non négligeable. Alternative solide si Postmark est exclu.

**Brevo (ex-Sendinblue)**
Entreprise française. Avantage RGPD réel — hébergement européen, équipe soumise au droit européen. Bon tier gratuit. Inconvénient : produit hybride marketing + transactionnel. L'interface est plus complexe que nécessaire pour un usage exclusivement transactionnel. La charge mentale à l'ouverture (configurations, listes, paramètres) est inutile pour Caméléon Engine V1.

**Mailgun**
Fournisseur établi, bonne délivrabilité. Historique problématique : suppression du tier gratuit en 2021, plusieurs révisions de tarification. Pour une décision de stabilité sur plusieurs années, l'historique tarifaire de Mailgun est un signal défavorable. Acceptable techniquement, pas recommandé pour le critère de stabilité.

**SendGrid**
Racheté par Twilio en 2019. Produit puissant, orienté enterprise. Interface complexe, nombreuses options superflues pour un usage V1. Quelques rapports de délivrabilité dégradée sur les comptes bas volume. La taille du produit est un risque pour une équipe d'une personne : surface de configuration importante, documentation dense, apprentissage non négligeable.

**Amazon SES**
Le moins cher du marché. Inconvénient structurel : la délivrabilité n'est pas gérée automatiquement. L'utilisateur doit configurer les rebonds, les plaintes, la gestion de réputation, les notifications SNS. En mode sandbox par défaut, une demande de production est nécessaire. Pour une équipe d'une personne, la charge opérationnelle est disproportionnée. Correct pour une grande infrastructure avec une équipe dédiée. Mauvais choix pour Caméléon Engine V1.

---

## 3. Risques

### Risques produit

**Magic Link non reçu = connexion impossible.**
C'est le risque produit principal. Si la délivrabilité est défaillante — lien en spam, délai SMTP élevé, bounces non gérés — l'utilisateur ne peut pas se connecter. C'est une expérience de J0 irréparable. La délivrabilité n'est pas un détail technique — c'est la condition d'existence du compte.

**Changement de fournisseur en production.**
Migrer de fournisseur SMTP en production (avec des utilisateurs actifs) est un chantier non trivial : DNS (SPF, DKIM, DMARC), historique de réputation à reconstruire, risque de dégradation temporaire de délivrabilité. Le choix initial doit être tenu sur le long terme.

### Risques opérationnels

**Gestion de la réputation.**
Certains fournisseurs (SES notamment) exigent que l'opérateur gère activement sa réputation d'envoi : taux de bounces, plaintes, suppression de listes. Pour une personne seule, c'est une dette récurrente. Les fournisseurs premium (Postmark, Resend) gèrent cela automatiquement.

**Incidents SMTP non détectés.**
Si l'envoi échoue silencieusement et qu'il n'y a pas d'alerte, des utilisateurs sont bloqués sans que l'opérateur le sache. V1 minimum : un tableau de bord d'envoi lisible et une notification en cas d'échec.

### Risques de délivrabilité

**Réputation partagée sur tier gratuit.**
Sur les tiers gratuits de certains fournisseurs (SendGrid notamment), les IP d'envoi sont mutualisées avec d'autres expéditeurs. Un voisin peu scrupuleux peut dégrader la réputation du pool. Postmark sépare strictement les pools transactionnels — ce risque est absent.

**Emails en spam à J0.**
La réputation d'un nouveau domaine est zéro. Certains fournisseurs réchauffent automatiquement la réputation des nouveaux domaines. D'autres non. Vérifier que le fournisseur retenu propose un démarrage fluide sans réchauffement manuel.

### Risques de dépendance fournisseur

**Verrouillage API.**
Le risque est faible : tous les fournisseurs utilisent une API HTTP standard. Le changement de fournisseur nécessite de changer un token et un endpoint — pas une réécriture. La dépendance réelle est la réputation de domaine construite sur l'infrastructure du fournisseur.

**Disparition ou rachat du fournisseur.**
Resend est jeune (3 ans). Mailgun a des antécédents de changement de politique. Postmark et Brevo sont établis et stables. Amazon SES est permanent mais complexe. Pour une décision sur 5 ans, la stabilité de l'entreprise compte.

---

## 4. Recommandation

**Fournisseur recommandé : Postmark.**

**Fournisseur à éviter malgré sa popularité : Amazon SES.**

### Réponses aux questions obligatoires

**Quel fournisseur est le plus cohérent pour une V1 portée par une seule personne ?**
Postmark. Zéro gestion de réputation, zéro configuration de listes, zéro surface superflue. L'API envoie un email. C'est tout.

**Quel fournisseur minimise la charge mentale et le support ?**
Postmark. La délivrabilité est le produit — pas un paramètre à gérer. Les tableaux de bord sont lisibles sans formation. Le support répond sur un outil dédié au transactionnel, pas sur un produit hybride.

**Quel fournisseur permet de lancer le Compte Utilisateur sans ouvrir un nouveau chantier technique ?**
Postmark ou Resend. Les deux ont une API intégrable en une session de travail. Postmark est préférable pour la stabilité à long terme.

**Quel fournisseur faudrait-il éviter malgré sa popularité ?**
Amazon SES. Sa popularité est due à son prix bas et à son intégration dans l'écosystème AWS. Pour Caméléon Engine, qui n'est pas sur AWS et qui est opéré par une personne seule, les avantages économiques sont nuls et la dette opérationnelle est élevée.

**Quel fournisseur serait retenu si l'objectif est "fonctionner pendant plusieurs années sans y penser" ?**
Postmark. C'est sa promesse depuis 2009 et sa seule raison d'exister.

### Pourquoi pas Resend

Resend est une alternative sérieuse, techniquement excellente, et philosophiquement alignée. Une seule réserve : 3 ans d'existence. Pour une décision de stabilité sur 5 ans, Postmark offre 16 ans de track record sur le même produit. Si Postmark devait être écarté (tarification, disponibilité), Resend est le choix de repli naturel.

---

## 5. Décision proposée

### Fournisseur SMTP V1 — définitif

**Postmark.** Fournisseur de repli : Resend.

### Règles permanentes associées

| Règle | Valeur |
|-------|--------|
| Fournisseur V1 | Postmark |
| Type d'email autorisé | Transactionnel uniquement (Magic Link) |
| Email marketing via Postmark | Interdit — hors périmètre permanent |
| Changement de fournisseur | Décision de production — jamais à la légère |
| Fournisseur de repli | Resend |
| Amazon SES | Rejeté pour V1 |

### Ce que ce document ne décide pas

- La configuration DNS (SPF, DKIM, DMARC) — appartient à l'implémentation
- Le contenu exact de l'email Magic Link — appartient à l'UX compte
- La gestion des bounces — gérée automatiquement par Postmark, pas de décision produit requise
- Le volume d'envoi cible — non pertinent pour le choix du fournisseur à ce stade

### Décisions ouvertes restantes après cet audit

| Décision | Statut |
|----------|--------|
| Fournisseur serveur | ❌ Non décidé |
| Périmètre migration UUID local → serveur | ❌ Non décidé |

---

## 6. Verdict final

**Décision la plus importante**
La délivrabilité du Magic Link est la condition d'existence du compte. Un fournisseur SMTP n'est pas un détail d'infrastructure — c'est l'infrastructure de l'authentification. Le critère de sélection n'est pas économique : c'est la fiabilité durable pour une personne seule.

**Découverte la plus importante**
Amazon SES est le fournisseur à éviter en priorité malgré sa popularité. Sa complexité opérationnelle (gestion de réputation, bounces, sandbox, approbation production) est conçue pour des équipes dédiées, pas pour un opérateur unique. L'économie réalisée sur les emails est nulle au volume V1 — la dette opérationnelle est certaine.

**Fournisseur recommandé**
Postmark. Spécialiste exclusif du transactionnel depuis 2009. Zéro gestion de réputation. API minimale. Philosophie "fonctionner sans y penser" — exactement le critère.

**Fournisseur rejeté définitivement**
Amazon SES pour V1. Charge opérationnelle disproportionnée pour une équipe d'une personne.

**Risque principal**
Ne pas changer de fournisseur une fois en production sans raison impérieuse. La réputation de domaine construite sur un fournisseur est un actif invisible — la migration coûte plus que le gain apparent.

**Question finale : le choix du fournisseur SMTP peut-il être considéré comme fermé après ce document ?**

**Oui, sous réserve de validation par l'opérateur du projet.**

La décision ne contient aucune dépendance vers les deux décisions encore ouvertes (fournisseur serveur, périmètre migration). Elle peut être validée et figée indépendamment.

**Verdict final**

Classification : **B — Document important.**

Non A car le fournisseur SMTP est un choix d'infrastructure, pas une décision doctrinale. Important car il ferme une condition bloquante de la checklist pré-implémentation (Bloc C2 — fournisseur SMTP choisi) et débloque concrètement l'implémentation du Magic Link.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `user_account_v1_execution_architecture.md` · `magic_link_ttl_v1.md`*
