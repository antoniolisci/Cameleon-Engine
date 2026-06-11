# Caméléon Engine — Politique de Confidentialité

*Dernière mise à jour : 2026-06-11*

---

## 1. Responsable du traitement

**Antonio Lisci**  
Caméléon Engine — projet indépendant  
France  
Contact : [antonio.lisci@gmail.com](mailto:antonio.lisci@gmail.com)

---

## 2. Données collectées

### 2.1 Adresse email

Lors de la création d'un compte, l'utilisateur fournit son adresse email. Elle est utilisée exclusivement pour :
- l'envoi du lien de connexion (Magic Link) ;
- les communications relatives au compte (modifications substantielles des CGU, réponses aux demandes RGPD).

Aucun email commercial ni newsletter n'est envoyé sans consentement explicite.

### 2.2 Données de compte

Les données suivantes sont associées au compte utilisateur sur le serveur :
- adresse email ;
- identifiant de compte (généré automatiquement depuis l'authentification Supabase) ;
- statut du compte (gratuit ou premium) ;
- date de création du compte ;
- consentement aux présentes politiques (horodaté).

### 2.3 Données d'utilisation

Pour les utilisateurs disposant d'un compte, les données suivantes peuvent être synchronisées sur le serveur :
- sessions d'analyse comportementale (imports CSV analysés) ;
- snapshots de décision du moteur.

Ces données sont associées au seul compte de l'utilisateur. Elles ne sont pas partagées avec des tiers à des fins commerciales.

---

## 3. Stockage local (localStorage)

Pour tous les utilisateurs, y compris sans compte, les données suivantes sont stockées **localement dans le navigateur** uniquement :
- état du formulaire et historique des sessions moteur (50 sessions maximum) ;
- sessions d'analyse comportementale (50 sessions maximum) ;
- identifiant local de l'appareil (UUID généré automatiquement, non lié à l'identité réelle) ;
- préférences d'interface.

Ces données restent sur l'appareil de l'utilisateur. Elles ne sont transmises à aucun serveur sauf accord explicite lors de la migration de compte vers le serveur.

---

## 4. Stockage serveur (Supabase)

Pour les utilisateurs disposant d'un compte, certaines données sont synchronisées sur les serveurs de **Supabase** (infrastructure PostgreSQL). Supabase héberge les données dans des centres de données situés dans l'Union Européenne.

Supabase agit en qualité de sous-traitant au sens du RGPD. Les données sont chiffrées en transit (TLS) et au repos.

La politique de sécurité de Supabase est consultable à : [supabase.com/security](https://supabase.com/security)

---

## 5. Emails transactionnels (Postmark)

Les liens de connexion Magic Link sont envoyés via **Postmark** (Wildbit LLC). L'adresse email de l'utilisateur est transmise à Postmark dans le seul but d'acheminer l'email transactionnel. Aucun email à des fins marketing n'est traité par ce canal.

La politique de confidentialité de Postmark est consultable à : [postmarkapp.com/privacy-policy](https://postmarkapp.com/privacy-policy)

---

## 6. Hébergement du site

Le site est hébergé sur **GitHub Pages** (GitHub, Inc., États-Unis). L'accès au site peut entraîner la collecte de logs d'accès par GitHub (adresse IP, navigateur, URL demandée). Ces données sont traitées par GitHub selon sa propre politique de confidentialité : [docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement](https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement)

---

## 7. Durée de conservation

| Donnée | Durée de conservation |
|--------|-----------------------|
| Données de compte (email, statut) | Jusqu'à suppression du compte ou inactivité de 24 mois |
| Sessions comportementales synchronisées | Jusqu'à suppression du compte |
| Snapshots moteur synchronisés | Jusqu'à suppression du compte |
| Données locales (localStorage) | Jusqu'à effacement par l'utilisateur ou son navigateur |

---

## 8. Droits RGPD

Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679), l'utilisateur dispose des droits suivants concernant ses données personnelles :

- **Droit d'accès** : obtenir une copie de l'ensemble de ses données personnelles traitées.
- **Droit de rectification** : corriger des données inexactes ou incomplètes.
- **Droit à l'effacement** : demander la suppression de son compte et de toutes ses données serveur.
- **Droit à la portabilité** : exporter ses données dans un format structuré et lisible (JSON), disponible directement depuis l'interface du service pour les utilisateurs connectés.
- **Droit d'opposition** : s'opposer à certains traitements dans les cas prévus par le RGPD.

### Comment exercer ses droits

**Depuis l'interface :** les utilisateurs connectés peuvent exporter leurs données et demander la suppression de leur compte directement depuis le panel Compte.

**Par email :** en contactant [antonio.lisci@gmail.com](mailto:antonio.lisci@gmail.com) avec l'objet "Demande RGPD — [droit concerné]". Les demandes sont traitées dans un délai de 30 jours.

En cas de réponse insatisfaisante, l'utilisateur peut introduire une réclamation auprès de la **CNIL** : [cnil.fr/fr/plaintes](https://www.cnil.fr/fr/plaintes)

---

## 9. Cookies et traceurs

Caméléon Engine n'utilise pas de cookies tiers, de traceurs publicitaires, ni de solutions d'analyse comportementale externes (Google Analytics, Hotjar, etc.).

Le `localStorage` utilisé pour la persistance des données n'est pas un cookie : il n'est pas partagé entre domaines et ne peut pas être lu par des tiers. Aucun bandeau de consentement cookies n'est requis en l'absence de cookies tiers.

---

## 10. Modifications de la politique

En cas de modification substantielle de cette politique de confidentialité, les utilisateurs disposant d'un compte seront informés par email dans un délai raisonnable avant l'entrée en vigueur des modifications.

La date de dernière mise à jour figure en en-tête du document.

---

*URL permanente : [cameleonengine.fr/politique-confidentialite](https://cameleonengine.fr/politique-confidentialite)*
