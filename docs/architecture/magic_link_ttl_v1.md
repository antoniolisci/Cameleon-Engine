# Magic Link TTL V1 — Position officielle

**Caméléon Engine · Document d'architecture produit**
**Date : 2026-06-10 · Statut : AUDIT — EN ATTENTE DE VALIDATION**

> Ce document répond à une seule question :
> "Quelle durée de validité (TTL) doit avoir un Magic Link dans Caméléon Engine V1 ?"
>
> Aucun code. Aucun fournisseur. Architecture et produit uniquement.

---

## Résumé exécutif

Le TTL du Magic Link est la troisième des cinq décisions ouvertes bloquant le chantier Compte Utilisateur V1. C'est une décision de produit plus que de sécurité : la sécurité d'un Magic Link repose sur le fait qu'il est à usage unique et invalidé après utilisation — pas sur sa durée de validité seule.

**Décision proposée : 15 minutes, usage unique, invalidation immédiate à l'utilisation.**

Le TTL de 15 minutes est le point de l'intervalle le plus cohérent avec la philosophie Caméléon Engine : suffisant pour la totalité des cas d'usage réels d'un utilisateur actif et volontaire, sans la marge de confort inutile que représente 30 minutes pour un profil de trader qui vient de décider de se connecter.

---

## 1. Ce que le Magic Link résout

Caméléon Engine utilise exclusivement le Magic Link comme mécanisme d'authentification. Pas de mot de passe. Pas de Google OAuth. Pas de code SMS.

Ce choix est doctrinal, pas technique : le compte est un pont entre l'outil local et la mémoire serveur. Son accès doit être simple, digne, et sans friction inutile. Un mot de passe est un point de friction — et une dette de support (réinitialisation, force, compromission).

Le Magic Link résout ce problème : l'identité est prouvée par la capacité à recevoir un email sur l'adresse déclarée. C'est le standard le plus simple qui garantit un niveau de sécurité acceptable pour un produit V1 sans données financières.

**Paramètres du Magic Link qui ne sont pas en débat dans ce document :**
- Usage unique : le lien est consommé dès le premier clic. Toujours.
- Invalidation à l'utilisation : cliquer le lien le désactive immédiatement.
- Invalidation des anciens liens : générer un nouveau lien invalide tous les liens précédents pour cet email.

---

## 2. Analyse comparative des options

| TTL | Sécurité | Usabilité desktop | Usabilité mobile | Charge support | Verdict |
|-----|----------|-------------------|------------------|----------------|---------|
| 5 min | ✅✅ | ⚠️ | ❌ | Élevée | Trop court |
| 10 min | ✅✅ | ✅ | ⚠️ | Modérée | Limite basse acceptable |
| **15 min** | **✅✅** | **✅✅** | **✅✅** | **Faible** | **Recommandé** |
| 30 min | ✅✅ | ✅✅ | ✅✅ | Faible | Acceptable — marge inutile |
| 60 min | ✅ | ✅✅ | ✅✅ | Très faible | Trop permissif |
| 24 h | ⚠️ | ✅✅ | ✅✅ | Nulle | À rejeter |

**5 minutes**
Sécurité maximale. Utilisabilité nulle sur mobile : le passage de l'application email vers le navigateur, le chargement de la page, et la latence réseau consomment facilement 2 à 3 minutes dans des conditions normales. Un TTL de 5 minutes produit un taux d'échec élevé, une charge de support immédiate, et une première expérience de connexion frustrante. **Rejeté.**

**10 minutes**
Acceptable sur desktop où l'email est ouvert dans un onglet adjacent. Problématique sur mobile dans les conditions suivantes : email reçu en background, notification lente, réseau 4G instable. Le risque d'expiration entre la réception et le clic est non négligeable. **Acceptable mais pas recommandé.**

**15 minutes — recommandé**
Couvre la totalité des cas d'usage réels pour un utilisateur qui a demandé volontairement un lien. Le pire cas mobile (notification lente, changement d'application, réseau instable) prend 2 à 5 minutes — la marge ×3 est suffisante. Le Magic Link est activement demandé, pas reçu passivement : l'utilisateur est devant son appareil, en attente de l'email. 15 minutes correspond à ce profil. La sécurité d'un Magic Link repose sur l'usage unique, pas sur la durée — la fenêtre d'exposition réelle est le délai entre génération et premier clic, pas le TTL total.

**30 minutes**
Acceptable. La marge est inutile pour le profil réel de Caméléon Engine. 30 minutes suppose un utilisateur distrait ou passif — ce qui ne correspond pas au trader actif qui vient de décider de se connecter. La différence de risque sécurité avec 15 minutes est négligeable en pratique.

**60 minutes**
Sécurité réduite sans gain d'usabilité substantiel par rapport à 30 minutes. Une heure de fenêtre sur un lien d'authentification est excessive pour un produit qui n'a pas de MFA. **Non recommandé.**

**24 heures**
Inacceptable pour V1. Une fenêtre de 24 heures transforme le Magic Link en token de session déguisé. Si l'email de l'utilisateur est compromis pendant ces 24 heures, l'accès au compte Caméléon Engine est exposé pendant toute cette durée. **Rejeté définitivement.**

---

## 3. Règles de comportement du lien

Ces règles sont indépendantes du TTL choisi. Elles s'appliquent quelle que soit la durée retenue.

### Que se passe-t-il quand un lien expire ?

L'utilisateur arrive sur une page d'erreur claire : "Ce lien a expiré. Demandez un nouveau lien." La page doit proposer directement le formulaire de demande — pas un retour à l'accueil. Pas de message d'erreur technique. Pas de code d'erreur visible.

### Un utilisateur peut-il demander immédiatement un nouveau lien ?

Oui. Le blocage de la régénération est contre-productif pour V1 : si l'utilisateur n'a pas reçu le lien ou s'il a expiré, l'impossibilité de régénérer immédiatement crée une impasse. En revanche, une limite de taux doit exister pour prévenir l'abus.

**Règle de rate limiting V1 :** maximum 3 demandes par tranche de 15 minutes par adresse email. Au-delà, message clair : "Vous avez fait plusieurs demandes récentes. Vérifiez vos spams ou attendez quelques minutes."

### Un nouveau lien invalide-t-il les anciens ?

**Oui. Toujours. Sans exception.**

C'est la règle de sécurité la plus importante de ce document. Il ne peut exister qu'un seul lien actif par adresse email à tout moment. Générer un nouveau lien invalide immédiatement tous les liens précédents, qu'ils aient expiré ou non. Cette règle prévient les attaques par accumulation de liens valides et simplifie l'état du système.

### Existe-t-il une limite de génération ?

Oui — voir rate limiting ci-dessus. La limite est sur la fenêtre temporelle, pas sur un quota absolu. Un utilisateur qui a des difficultés réseau légitimes peut demander plusieurs liens sur une journée sans être bloqué indéfiniment.

### Le TTL doit-il être configurable ?

**Non pour V1.** La configurabilité du TTL ajoute une complexité opérationnelle (interface admin, validation des valeurs, tests de régression) sans valeur produit à ce stade. La valeur retenue est figée en V1. Une révision est possible en V1.1 sur signal terrain — pas avant.

### Le TTL doit-il être visible par l'utilisateur ?

**Oui — dans l'email uniquement.** L'email du Magic Link doit mentionner explicitement la durée : "Ce lien est valable 15 minutes." Pas de compte à rebours dans l'interface. Pas d'affichage du temps restant. L'information est donnée une fois, au moment où elle est utile — dans l'email lui-même, avant que l'utilisateur clique.

---

## 4. Risques

### Risques produit

**TTL trop court → abandon à la création de compte.**
Le premier moment de friction d'un Magic Link est la création de compte. Si l'utilisateur reçoit un email sur son téléphone, ouvre l'email, puis perd la connexion ou change d'application, un TTL de 5 ou 10 minutes produit une expiration avant le clic. L'utilisateur abandonne. Il ne revient pas toujours.

**TTL trop long → sensation de laxisme sécurité.**
Un utilisateur informé qui voit un lien valide 24 heures dans sa boîte mail peut légitimement questionner le niveau de sécurité du produit. Pour un outil de trading, cette impression est contre-productive même si le risque réel est faible.

### Risques sécurité

**Compromission de l'email entre génération et clic.**
Le seul scénario de risque réel. Si l'email de l'utilisateur est compromis et que l'attaquant reçoit le Magic Link avant l'utilisateur légitime, il peut accéder au compte. Ce risque existe quel que soit le TTL — il est réduit par un TTL court et par la règle d'invalidation unique. Avec 15 minutes et usage unique, la fenêtre d'exposition est limitée et le lien est consommé au premier usage.

**Accumulation de liens actifs.**
Résolu par la règle d'invalidation : un seul lien actif par email à tout moment.

**Attaque par énumération d'emails.**
Indépendante du TTL. Résolu par rate limiting + réponse identique que l'email existe ou non ("Si cet email est enregistré, vous recevrez un lien").

### Risques UX

**Message d'expiration incompréhensible.**
Si le message d'erreur en cas d'expiration est technique ou ambigu, l'utilisateur ne sait pas quoi faire. La page d'expiration doit être la plus simple possible avec une action directe disponible.

**Absence de confirmation d'envoi.**
Si l'utilisateur demande un lien et ne voit pas de confirmation d'envoi immédiate, il peut cliquer à plusieurs reprises. La confirmation "Email envoyé — vérifiez votre boîte" doit être affichée immédiatement après la demande.

### Risques de support

**"Je n'ai pas reçu mon lien."**
Principal ticket de support prévisible. Causes : spam, délai SMTP, faute de frappe dans l'email. Résolution : vérifier les spams, réessayer avec le bon email. La qualité du fournisseur SMTP réduit ce risque mais ne l'élimine pas.

**"Mon lien ne fonctionne plus."**
Cause : lien expiré ou lien déjà utilisé. Résolution : demander un nouveau lien. La page d'expiration doit résoudre ce cas sans support humain.

---

## 5. Cohérence doctrinale

**Manifeste**
L'authentification doit être une "présence calme" — elle ne doit pas occuper l'attention de l'opérateur. Un Magic Link de 15 minutes avec invalidation claire et régénération immédiate disponible respecte ce principe : le processus de connexion se résout silencieusement, sans friction notable pour un utilisateur actif et attentif.

**User Account Phase A**
"Le compte est une décision de continuité." Un TTL trop court transforme la connexion en obstacle — l'opposé de la décision de continuité. 15 minutes permet à l'utilisateur actif d'agir dans son rythme naturel sans marge inutile.

**User Account Execution Architecture**
L'architecture gelée précise : "Magic link uniquement. TTL à définir." Ce document ferme cette définition. Aucun conflit avec les 5 champs compte ni avec les 6 espaces de données.

**User Real Journey V1**
J0 = première connexion. La première expérience de Magic Link définit la confiance initiale de l'opérateur dans le système. Un lien expiré à la première tentative est une première impression négative irréparable. 15 minutes protège cette expérience sans sacrifier la sécurité — un utilisateur qui vient de demander un lien clique dans les 1 à 5 minutes.

**Freemium Matrix V1**
Indépendant. Le TTL est identique pour les utilisateurs gratuits et premium. L'authentification n'est pas derrière la frontière local/serveur — c'est une infrastructure commune.

---

## 6. Recommandation

**TTL recommandé : 15 minutes.**

**TTL rejeté définitivement : 24 heures.**

### Pourquoi 15 minutes

1. Le Magic Link est activement demandé — l'utilisateur est en attente de l'email. Ce profil ne justifie pas 30 minutes.
2. Couvre la totalité des cas d'usage réels : le pire cas mobile (notification lente, réseau instable, changement d'application) prend 2 à 5 minutes. La marge ×3 est suffisante.
3. La sécurité d'un Magic Link repose sur l'usage unique. La fenêtre d'exposition réelle est le délai entre génération et premier clic — généralement 1 à 5 minutes. 15 minutes n'ajoute pas de risque perceptible par rapport à 30 minutes.
4. Cohérent avec la responsabilité utilisateur : Caméléon Engine s'adresse à des opérateurs actifs, pas à des utilisateurs passifs. 15 minutes reflète ce profil. 30 minutes suppose une distraction qui ne correspond pas.

### Pourquoi rejeter 24 heures définitivement

Un TTL de 24 heures transforme le Magic Link en token d'accès longue durée. La fenêtre de compromission est disproportionnée pour un produit sans MFA. C'est un choix qui pourrait convenir à un outil interne sans données sensibles — pas à un produit d'authentification utilisateur dans un contexte de trading.

---

## 7. Décision proposée

### TTL V1 — définitif

**15 minutes.** Non configurable en V1.

### Règles permanentes associées

| Règle | Valeur |
|-------|--------|
| TTL | 15 minutes |
| Usage | Unique — invalidé au premier clic |
| Liens simultanés actifs | 1 par adresse email maximum |
| Nouveau lien → anciens liens | Invalidés immédiatement |
| Rate limiting | 3 demandes par 15 minutes par email |
| Visibilité TTL | Dans l'email uniquement — "Ce lien est valable 15 minutes." |
| Configurabilité V1 | Non — valeur figée |
| TTL gratuit vs premium | Identique — l'authentification n'est pas derrière la frontière |

### Comportements obligatoires

**À l'expiration :** page d'erreur claire avec lien direct vers nouvelle demande. Jamais de code d'erreur technique visible.

**À la génération :** confirmation d'envoi immédiate. Jamais de silence après soumission.

**À l'utilisation :** invalidation immédiate du lien, redirection vers l'outil. Jamais de lien réutilisable.

**En cas de rate limit atteint :** message clair orienté action ("Vérifiez vos spams ou attendez quelques minutes"). Jamais de blocage définitif.

### Ce que ce document ne décide pas

Ce document ne décide pas du fournisseur SMTP, du système de stockage des tokens, de la durée de session après connexion, ni du contenu exact de l'email. Ces éléments appartiennent à l'implémentation ou à d'autres décisions ouvertes.

---

## 8. Verdict final

**Décision la plus importante**
La sécurité d'un Magic Link repose sur l'usage unique et l'invalidation immédiate — pas sur la durée du TTL. La durée est un paramètre d'usabilité. Choisir un TTL trop court pour paraître "plus sécurisé" est une erreur de raisonnement : elle produit de la frustration sans gain sécurité réel.

**Découverte la plus importante**
La règle d'invalidation mutuelle (un nouveau lien invalide tous les anciens) est plus critique que le TTL lui-même. Elle simplifie l'état du système, prévient l'accumulation de tokens valides, et protège contre les scénarios d'usage parallèle involontaire. Cette règle doit être permanente et non configurable.

**Décision recommandée**
TTL = 15 minutes. Usage unique. Invalidation immédiate à l'utilisation. Un seul lien actif par email. Rate limiting 3/15 min.

**Décision rejetée définitivement**
TTL = 24 heures. Fenêtre de compromission disproportionnée sans valeur d'usabilité supplémentaire par rapport à 30 minutes.

**Risque principal**
L'expérience de la première connexion. Si le premier Magic Link expire avant que l'utilisateur clique, la confiance initiale dans le système est compromise. 15 minutes protège ce moment critique sans la marge de confort inutile de 30 minutes.

**Question finale : la décision TTL Magic Link V1 peut-elle être considérée comme fermée après ce document ?**

**Oui, sous réserve de validation par l'opérateur du projet.**

Ce document produit une décision complète, documentée, et cohérente avec l'ensemble des doctrines gelées. Elle ne contient aucune dépendance vers les décisions encore ouvertes (fournisseur serveur, SMTP, périmètre migration). Elle peut être validée et figée indépendamment.

**Verdict final**

Classification : **B — Document important.**

Non A car le TTL est un paramètre d'infrastructure, pas une décision doctrinale fondatrice. Important car il ferme une condition bloquante de la checklist pré-implémentation (Bloc C2 — gestion expiration des liens documentée) et permet l'avancement vers l'implémentation du compte.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `user_account_v1_execution_architecture.md` · `user_account_phaseA_audit.md` · `freemium_matrix_v1.md`*
