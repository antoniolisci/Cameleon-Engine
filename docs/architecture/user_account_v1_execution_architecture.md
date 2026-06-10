# Compte Utilisateur V1 — Architecture d'Exécution

**Caméléon Engine · Document d'architecture**
**Date : 2026-06-10 · Statut : ARCHITECTURE D'EXÉCUTION — EN ATTENTE DE VALIDATION**

> Ce document quitte le mode réflexion.
> Il répond à une seule question : comment construire le Compte Utilisateur V1 sans casser le moteur souverain et sans compromettre les doctrines gelées ?
>
> Aucun code. Aucun fournisseur. Aucun framework. Architecture d'exécution uniquement.

---

## Résumé exécutif

Le Compte Utilisateur V1 est le seul composant dont la construction débloque tous les autres : mémoire longue, Macro réelle, Intelligence, Constellium. Il est simple dans sa forme — email + UUID + magic link — et complexe dans ses implications sur le cycle de vie des données.

L'architecture cible est déjà partiellement en place : l'UUID local est opérationnel (ADU-01→04), le namespacing est actif, le schemaVersion est dans les sessions. Ce qui manque : le pont vers le serveur, l'identité email, l'Administration V1, et le pipeline RGPD.

La transition n'est pas une migration massive. C'est un pont progressif : local d'abord, serveur en miroir, fusion au signal de l'opérateur.

---

## 1. Périmètre exact du Compte Utilisateur V1

### Ce que contient le compte

| Champ | Rôle | Stockage |
|---|---|---|
| `email` | Identifiant d'authentification — adresse d'envoi du magic link | Serveur uniquement |
| `server_uuid` | Identité stable côté serveur — RFC 4122 | Serveur uniquement |
| `created_at` | Horodatage de création du compte | Serveur |
| `status` | État du compte : actif / désactivé / supprimé | Serveur |
| `rgpd_consent` | Enregistrement du consentement avec horodatage | Serveur |
| `local_uuid_bridge` | Lien entre UUID local existant et UUID serveur | Serveur |

Cinq champs. C'est le minimum viable. Tout le reste est V2.

### Ce que ne contient pas le compte

- Pas de mot de passe (magic link exclusivement)
- Pas de nom d'affichage, photo, profil public
- Pas de données comportementales dans l'objet compte
- Pas de données financières
- Pas d'abonnement premium (décision Gratuit/Premium préalable)
- Pas de préférences UI (stockées séparément, espace dédié)

### Ce que le compte débloque

- Persistance des sessions comportementales au-delà du FIFO local
- Accès cross-device à l'historique
- Récupération après perte du localStorage
- Accumulation longue durée vers Intelligence et corrélations Macro
- Base légale pour la Bibliothèque Vivante (opt-in futur)

### Ce que le compte ne débloque pas

- Aucune fonctionnalité Intelligence immédiate (corpus insuffisant en V1)
- Aucune lecture de corrélation Macro immédiate (6 mois minimum requis)
- Aucune comparaison inter-utilisateurs
- Aucun signal de marché
- Aucun accès premium automatique

---

## 2. Séparation des espaces de données

Chaque espace a une frontière physique et fonctionnelle. Aucune donnée ne traverse une frontière sans règle explicite.

### Espace 1 — Identité

Contenu : email, server_uuid, local_uuid_bridge, created_at, status, rgpd_consent.

Accès : Administration V1 uniquement. Jamais exposé à l'opérateur directement. Jamais croisé avec les sessions comportementales dans une requête de lecture.

Règle fondatrice : l'identité ne contient aucune donnée comportementale. Elle sait que l'opérateur existe. Elle ne sait pas comment il opère.

### Espace 2 — Sessions comportementales

Contenu : sessions complètes (cycle Pilotage → Moteur → Verdict → Validation), avec snapshot comportemental et macro_state.

Stockage actuel : `CE_behavior_sessions_v1__{uuid}` en localStorage, cap 50 FIFO.
Stockage futur : miroir serveur namespacé sous server_uuid, cap étendu.

Règle : le serveur ne stocke jamais les données session avant que le bridge local → serveur soit actif pour cet opérateur.

### Espace 3 — Mémoire longue

Extension de l'Espace 2 au-delà du FIFO local. Même schéma, même format, conservation prolongée côté serveur. Distinct physiquement des sessions courantes — les sessions courantes restent en local, la mémoire longue est server-side.

Règle : aucune donnée financière, aucun PnL, aucun montant dans cet espace. Comportement × contexte uniquement.

### Espace 4 — Préférences utilisateur

Contenu : préférences UI, paramètres d'affichage, profil opérateur choisi, guard level.

Stockage actuel : `CE_settings_v1__{uuid}`, `cameleon.behavior.v1.guardLevel__{uuid}` en localStorage.
Stockage futur : synchronisé serveur, priorité locale en cas de conflit.

Règle : les préférences ne commandent jamais le moteur. Elles n'influencent pas le score.

### Espace 5 — Administration

Contenu : demandes RGPD, logs de suppression, logs d'export, états de requêtes, tokens magic link (éphémères).

Accès : opérateur de l'administration uniquement. Jamais accessible par l'opérateur-utilisateur via l'application.

Règle : les tokens magic link ont une durée de vie courte et sont invalidés après usage unique. Jamais stockés en clair au-delà de leur TTL.

### Espace 6 — Bibliothèque Vivante (futur, opt-in)

Contenu : patterns comportementaux anonymisés agrégés. Aucune donnée individuelle identifiable.

Règle permanente : transfert Espace 2 → Espace 6 uniquement sur opt-in explicite, documenté, et décrit comme irréversible. Le retrait du consentement ne supprime pas les patterns déjà agrégés (anonymisation = irréversibilité). Cette règle doit être communiquée au consentement.

---

## 3. Cycle de vie complet de l'opérateur

### 3.1 Création du compte

1. L'opérateur saisit son email dans le formulaire d'inscription
2. Un magic link est envoyé à cette adresse (TTL : 15–30 minutes, usage unique)
3. L'opérateur clique le lien → token validé côté serveur
4. Le serveur crée le compte : server_uuid généré, email associé, rgpd_consent enregistré
5. Le serveur détecte le local_uuid du navigateur (transmis à la validation)
6. Le bridge local_uuid → server_uuid est créé et enregistré
7. L'opérateur est authentifié pour la session

### 3.2 Première connexion post-création

1. Le bridge est actif
2. Les données localStorage existantes (sessions, snapshots, préférences) sont éligibles à la migration serveur
3. La migration est proposée à l'opérateur, pas automatique (son consentement sur le transfert)
4. Si migration acceptée : les données sont envoyées au serveur sous server_uuid, les clés locales sont marquées "migrées" (pas supprimées — filet de sécurité)
5. Les nouvelles sessions s'accumulent localement ET en miroir serveur

**Limitation importante — migration refusée ou ignorée :**
Si l'opérateur refuse ou ignore la migration de son historique local, le corpus serveur commence à la date de création du compte. Conséquences directes :
- Les corrélations Intelligence démarrent à cette date — pas à la première session
- Les corrélations Macro démarrent à cette date — pas à la première session
- Les sessions antérieures restent uniquement dans l'historique localStorage local
- La promesse de mémoire longue n'est complète que si la migration est acceptée

Le principe "logging dès J0" (Macro Layer Doctrine V1) s'applique au logging lui-même, qui est actif dès la première session. Il ne garantit pas que ces sessions rejoindront le corpus serveur — cela dépend de l'action de l'opérateur.

### 3.3 Accumulation de mémoire

1. Chaque session sauvegardée localement déclenche une synchronisation vers le serveur (offline-first : si pas de connexion, synchronisation différée)
2. Le serveur accumule au-delà du FIFO local : les sessions en local continuent de tourner sur 50, le serveur conserve tout
3. La synchronisation valide le schemaVersion à chaque écriture — une session avec un schéma non reconnu est rejetée avec erreur logguée, jamais silencieusement ignorée

### 3.4 Export des données

1. L'opérateur demande un export depuis l'application
2. Le serveur agrège toutes les données namespacées sous son server_uuid : sessions, préférences, registre d'imports, snapshots
3. Un fichier JSON est généré et mis à disposition
4. Ne sont pas inclus : tokens d'authentification, données administration, logs RGPD
5. L'export est disponible pendant 24h puis supprimé du serveur

### 3.5 Suppression du compte

1. L'opérateur demande la suppression depuis l'application
2. Administration V1 reçoit la demande (état : en attente)
3. Délai de grâce : 7 jours pendant lesquels l'opérateur peut annuler
4. À l'expiration du délai : toutes les données serveur namespacées sous server_uuid sont supprimées de façon irréversible
5. L'email est dissocié
6. Le server_uuid est marqué "supprimé" (jamais réutilisé)
7. Le bridge local → serveur est rompu
8. Les données localStorage sur l'appareil de l'opérateur ne sont pas supprimées automatiquement — c'est son appareil. Il en est informé.
9. Les patterns agrégés dans l'Espace 6 (Bibliothèque Vivante, si opt-in) ne sont pas supprimés — anonymisation irréversible déclarée au consentement

### 3.6 Connexion sur nouvel appareil

1. L'opérateur saisit son email
2. Magic link envoyé, validé
3. Serveur reconnaît le server_uuid associé
4. Aucune migration à faire : le nouveau localStorage commence vide
5. Les nouvelles sessions s'accumulent localement et en miroir serveur
6. L'historique serveur est accessible depuis l'application sur ce nouvel appareil

---

## 4. Frontières non négociables

Ces interdictions sont structurelles. Elles ne peuvent être levées par aucun chantier futur sans réécriture explicite de la doctrine.

| Interdiction | Fondement |
|---|---|
| Le compte ne modifie jamais le moteur | MACRO-RULE-01 — absolu |
| Le compte n'influence jamais le score, la posture, les actions | MACRO-RULE-01 — absolu |
| Le compte ne produit jamais de signal de marché | Manifeste — absolu |
| Le compte ne crée jamais de classement inter-utilisateurs | Doctrine mémoire — permanent |
| Le compte ne stocke jamais de données financières | Doctrine mémoire — permanent |
| Le compte ne stocke jamais de résultats, PnL, performances | Doctrine mémoire — permanent |
| Le compte ne déverrouille jamais une fonctionnalité hors séquence | Doctrine transition — permanent |
| Les données de l'Espace 1 (identité) ne croisent jamais l'Espace 2 (sessions) dans une lecture | Séparation des espaces — structurel |
| Un token magic link est toujours usage unique et TTL court | Sécurité — non négociable |
| La suppression d'un compte supprime toutes ses données serveur | RGPD — légal |

---

## 5. Administration V1 — minimum absolu

L'Administration V1 n'est pas un outil de confort. C'est la condition légale d'exploitation.

**Fonctions indispensables uniquement :**

**A — Gestion des demandes RGPD**
- Voir la liste des demandes en attente (suppression / export)
- Exécuter une suppression : purger toutes les données sous le server_uuid demandé
- Exécuter un export : générer le JSON de toutes les données namespacées, mettre à disposition
- Marquer une demande comme traitée avec horodatage

**B — Gestion des comptes**
- Voir un compte par email ou server_uuid (statut, created_at, bridge actif)
- Désactiver un compte (blocage d'accès sans suppression des données)
- Réactiver un compte désactivé

**C — Monitoring minimal**
- Nombre de comptes actifs
- Demandes RGPD en attente

Tout le reste est V2 : statistiques d'usage, logs détaillés, analytics, dashboard. Ces éléments ne sont pas des fondations — ils sont des outils de croissance.

---

## 6. Transition local → serveur

### État actuel

L'UUID local est opérationnel (ADU-01→04). Neuf clés sont namespacées sous `__{uuid}`. La migration locale est idempotente et testée. Le schemaVersion est présent dans les sessions et snapshots.

### Le pont — trois cas de figure

**Cas 1 — Opérateur existant crée un compte**
Un local_uuid existe dans `CE_identity_v1`. Le bridge mappe ce local_uuid vers le server_uuid créé à l'inscription. Les données localStorage existantes sont éligibles à la migration serveur. Migration proposée à l'opérateur, pas automatique.

**Cas 2 — Nouvel opérateur crée un compte directement**
Pas de local_uuid préexistant significatif. Le server_uuid est créé à l'inscription. Le localStorage commence à s'accumuler sous le server_uuid dès la connexion.

**Cas 3 — Opérateur avec compte sur nouvel appareil**
Pas de local_uuid sur ce nouvel appareil. Authentification par magic link. Le server_uuid est reconnu. Le localStorage local commence vide. Les nouvelles sessions s'accumulent localement et se synchronisent vers le serveur.

### Règles de migration

1. La migration est idempotente : elle peut être relancée sans dupliquer les données
2. Les clés locales sont marquées "migrées" mais non supprimées pendant 30 jours (filet de sécurité)
3. Le schemaVersion est validé avant chaque écriture serveur — version non reconnue = rejet avec log, jamais écriture silencieuse d'une donnée corrompue
4. En cas d'échec partiel : la migration reprend là où elle s'est arrêtée (liste des clés migrées trackée)
5. Le localStorage reste source de vérité pour la session en cours — le serveur est un miroir, jamais sur le chemin critique

---

## 7. Risques majeurs

### Niveau A — Critiques

**A1 — Bridge UUID non créé ou rompu**
Si le bridge local_uuid → server_uuid échoue silencieusement, l'historique local n'est jamais migré et l'opérateur perd ses données antérieures. Ce risque est le plus grave — il est invisible et irréversible.
**Mitigation :** log explicite du statut du bridge à chaque connexion. Test de cohérence bridge avant toute synchronisation.

**A2 — Suppression RGPD incomplète**
Une clé namespacée oubliée dans la purge laisse des données orphelines sous un UUID "supprimé". Violation RGPD potentielle.
**Mitigation :** liste canonique des 9 clés opérateur (ADU) + toutes les clés serveur ajoutées depuis. La liste doit être maintenue comme référence de purge. Test de purge obligatoire avant mise en production.

**A3 — Mismatch schemaVersion à la synchronisation**
Une session locale avec schemaVersion inconnu du serveur est rejetée. Si le rejet est silencieux, l'opérateur perd des sessions sans le savoir.
**Mitigation :** rejet explicite avec notification à l'opérateur. Jamais de rejet silencieux.

### Niveau B — Importants

**B1 — Double stockage pendant la période de transition**
Local + serveur = redondance pendant 30 jours. Consommation localStorage potentiellement doublée temporairement.
**Mitigation :** nettoyage automatique des clés locales marquées "migrées" après 30 jours.

**B2 — Magic link expiré ou intercepté**
L'opérateur clique après expiration du TTL. Edge case : lien intercepté dans un email forwardé.
**Mitigation :** TTL court (15–30 min). Usage unique strict. Lien expiré → proposition d'en renvoyer un nouveau.

**B3 — Conflit multi-device**
Deux appareils accumulent des sessions offline en parallèle. À la synchronisation, les deux ensembles sont valides mais chronologiquement entrelacés.
**Mitigation :** timestamp comme source de vérité pour l'ordre des sessions. Pas de déduplication — conserver les deux si conflit d'état.

### Niveau C — Secondaires

**C1 — estimateTotalSize() ne compte pas les données serveur**
Le Debug Brain affiche une taille localStorage qui ne reflète plus la taille réelle des données de l'opérateur post-migration.
**Mitigation :** accepté comme limitation V1. Correction différée.

**C2 — Registre d'imports divergent entre appareils**
L'importRegistry peut contenir des entrées différentes selon l'appareil. Pas critique — le registre est informatif, pas structurel.

---

## 8. Conditions d'ouverture du chantier

Le premier commit sur le Compte Utilisateur V1 ne peut pas être posé avant que ces conditions soient toutes validées.

### Conditions fermes (non négociables)

- ☐ Domaine actif avec HTTPS confirmé opérationnel
- ☐ Documents légaux rédigés, relus, et approuvés : CGU, politique de confidentialité, mentions légales
- ☐ Pipeline RGPD conçu et testé sur données de test : suppression complète + export validés
- ☐ Administration V1 spécifiée (ce document) et approuvée
- ☐ Export serveur garanti — toute donnée accumulée côté serveur doit rester portable et exportable par l'opérateur. Aucun compte en production sans portabilité de sortie complète côté serveur. L'export JSON local (ARCH-N4) couvre le localStorage uniquement — il ne couvre pas les données serveur.

### Conditions de décision (arbitrages requis avant code)

- ☐ Fournisseur infrastructure serveur choisi (hors périmètre de ce document — décision technique externe)
- ☐ Fournisseur SMTP pour magic link choisi
- ☐ TTL du magic link décidé
- ☐ Décision Gratuit/Premium V1 : même "tout est gratuit en V1" doit être une décision explicite documentée
- ☐ Périmètre de migration proposé à l'opérateur décidé : automatique / proposé / manuel

### Conditions techniques déjà satisfaites

- ✅ UUID local opérationnel (ADU-01→04)
- ✅ Namespacing des 9 clés en place
- ✅ schemaVersion dans sessions et snapshots (MEM-01B)
- ✅ Export JSON local opérationnel (ARCH-N4)
- ✅ RGPD pipeline local conçu (DO-03)

---

## 9. Verdict final

Le Compte Utilisateur V1 est architecturalement complet dans ce document. Les espaces sont définis. Les frontières sont posées. Le cycle de vie est décrit. Les interdictions structurelles sont listées. L'Administration V1 est spécifiée à son minimum légal.

**Ce qui bloque encore le premier commit :**

Pas un manque de réflexion. Pas une doctrine incohérente. Quatre éléments concrets :

1. HTTPS opérationnel confirmé
2. Documents légaux approuvés
3. Décision fournisseur (serveur + SMTP)
4. Décision Gratuit/Premium V1

Ces quatre éléments résolus, le chantier peut ouvrir.

**La règle permanente à maintenir pendant toute la construction :**

Le moteur souverain ne sait pas que le compte existe. Il n'a pas accès à l'email, au server_uuid, au statut du compte, ni à aucun espace de données de l'identité. Le moteur reçoit un formulaire. Il produit un verdict. Le reste ne le concerne pas.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `user_account_phaseA_audit.md` · `user_memory_long_term_audit.md` · `mem-v2-compte-memoire-persistante.md` · `architecture-donnees-utilisateur.md` · `doctrine_to_product_transition_audit.md`*
