# Périmètre Migration UUID Local → Serveur V1 — Position officielle

**Caméléon Engine · Document d'architecture produit**
**Date : 2026-06-10 · Statut : AUDIT — EN ATTENTE DE VALIDATION**

> Ce document répond à une seule question :
> "Quel périmètre exact doit couvrir la migration UUID local → serveur en V1 ?"
>
> Aucun code. Aucun schéma SQL. Décision produit et architecture uniquement.

---

## Résumé exécutif

La migration UUID local → serveur est le dernier verrou architecturel avant l'implémentation du Compte Utilisateur V1. Elle définit ce qui traverse — ou ne traverse pas — la frontière entre le localStorage et Supabase au moment où un utilisateur crée son compte.

La règle doctrinale centrale est irrévocable :

> **Le serveur ne remplace pas le local. Le serveur prolonge la mémoire locale dans le temps.**

Toute décision de migration qui contredit cette règle est invalide.

**Décision proposée : Option C — Migration progressive consentie.**

Ce qui migre en V1 : l'UUID bridge (lien local→serveur, automatique) + les sessions mémoire locale (sur consentement explicite, à l'initiative de l'utilisateur).

Ce qui ne migre pas en V1 : imports CSV/Excel/PDF, données comportementales brutes, portfolio, préférences, traces Macro.

**Principe directeur :** jamais silencieuse, jamais destructive, toujours réversible par export.

---

## 1. Cadre de décision

### Le problème structurel

Caméléon Engine fonctionne sans compte depuis le début. Tous les utilisateurs qui ont utilisé l'outil avant la mise en ligne du Compte Utilisateur V1 ont accumulé des données locales : historique de sessions, analyse comportementale, imports. Ces données sont namespacées par un UUID local généré automatiquement dans le localStorage.

Quand un utilisateur crée son compte (Magic Link → Supabase), Supabase Auth génère un UUID serveur distinct. Les deux UUID coexistent. La question n'est pas "faut-il relier les deux ?" — la réponse est oui, c'est le bridge fondamental. La question est : **quelle donnée locale doit traverser ce bridge, quand, et sous quelles conditions ?**

### Inventaire des données locales existantes

| Donnée locale | Clé localStorage | Nature | Volume V1 |
|---------------|-----------------|--------|-----------|
| UUID local | `CE_user_uuid_v1` | Identifiant | 1 valeur |
| Historique sessions moteur | `CE_history_v1` | 50 snapshots FIFO | ~50 entrées max |
| Sessions comportementales | `CE_behavior_sessions_v1` | 50 sessions FIFO | ~50 entrées max |
| Mémoire comportementale | `cameleon_behavior_memory_v1` | Synthèse | 1 objet |
| Registre imports | `CE_import_registry_v1` | 100 entrées FIFO | ~100 refs |
| Portfolio | `CE_portfolio_v1` | Positions actives | Variable |
| État formulaire | `CE_form_state_v1` | Champ par champ | ~16 champs |

### Ce que la migration doit résoudre

Un seul problème fonctionnel : **qu'est-ce que "mon compte" contient le jour où je me connecte pour la première fois ?**

Deux extrêmes possibles :
- **Rien** : le compte est vide. L'historique local reste local, invisible côté serveur. Le premium démarre à zéro.
- **Tout** : tout le localStorage migre automatiquement à la création du compte.

Les deux extrêmes sont architecturalement insatisfaisants. "Rien" trahit la promesse de mémoire longue. "Tout" viole le principe de consentement explicite et crée des risques de corruption, de doublons et de dépendance premium non anticipée.

### Contrainte doctrinale absolue

La migration **ne doit jamais être silencieuse.** L'utilisateur doit savoir ce qui part, pourquoi, et pouvoir refuser. L'historique local doit rester intact après la migration — il n'est jamais effacé ou remplacé par la version serveur. Le local est le filet de sécurité permanent.

---

## 2. Options analysées

### Option A — Migration minimale (UUID bridge uniquement)

Seul le lien UUID local → UUID serveur est créé. Aucune donnée ne traverse. Le compte démarre vide côté serveur. L'historique local reste 100% local, jamais relié à la mémoire longue serveur.

**Avantages :** zéro risque de corruption, zéro consentement complexe, implémentation triviale.

**Inconvénients :** la mémoire longue premium démarre à zéro même pour un utilisateur avec 3 mois d'historique local. La promesse "votre mémoire survit au-delà du localStorage" est creuse si l'existant ne peut jamais y accéder. L'utilisateur premium regarde un compte vide le jour J.

**Verdict :** insuffisant pour un utilisateur avec historique. Acceptable seulement comme étape transitoire avant une offre de migration ultérieure.

---

### Option B — Migration complète automatique

Tout le localStorage namespacé migre automatiquement au moment de la création du compte : sessions, comportemental, imports, portfolio, préférences.

**Avantages :** le compte reflète immédiatement l'historique réel. La valeur premium est visible dès J0 compte.

**Inconvénients :**
- Migration silencieuse — viole la règle doctrinale absolue
- Volume inconnu à l'avance — localStorage peut contenir des données corrompues ou incomplètes
- Doublons si l'utilisateur crée plusieurs comptes
- Les imports (CSV/Excel/PDF) peuvent peser plusieurs Mo et contenir des données de tiers
- Aucun contrôle utilisateur sur ce qui part
- RGPD : données envoyées sans consentement explicite = problème légal

**Verdict :** rejeté. La migration silencieuse est une violation doctrinale et légale.

---

### Option C — Migration progressive consentie

L'UUID bridge est créé automatiquement. L'historique de sessions est proposé à la migration via une action explicite de l'utilisateur — jamais automatique. Les données à risque élevé (imports, portfolio, comportemental brut) sont exclues du périmètre V1.

**Avantages :** conforme à la doctrine (explicite, consentie, non destructive), RGPD propre, risque de corruption minimisé, implémentation bornée.

**Inconvénients :** l'utilisateur doit effectuer une action pour que son historique rejoigne le compte — friction minime mais réelle. Certains utilisateurs ignoreront l'offre.

**Verdict :** recommandé. Cohérent avec toutes les doctrines gelées.

---

### Option D — Pas de migration V1

Aucun bridge UUID, aucune migration. Le Compte Utilisateur V1 est une couche entièrement nouvelle, sans connexion au localStorage existant.

**Avantages :** implémentation la plus simple possible. Zéro risque.

**Inconvénients :** le localStorage existant devient un îlot permanent sans chemin vers le serveur. L'utilisateur avec historique ne voit aucun bénéfice immédiat à créer un compte. La mémoire longue n'est pas une extension de la mémoire locale — c'est un nouveau silo. Contradictoire avec la promesse architecturale centrale.

**Verdict :** rejeté. Incompatible avec "le serveur prolonge la mémoire locale dans le temps."

---

### Option E — Migration différée V1+1

Le bridge UUID est créé en V1. La migration de contenu est une fonctionnalité V1+1, après validation terrain du comportement de la mémoire longue serveur.

**Avantages :** séquence prudente. V1 valide le bridge et la mémoire serveur avant d'y ajouter de la complexité de migration.

**Inconvénients :** l'utilisateur avec historique attend une session de plus pour "voir" son compte enrichi. L'offre de migration doit quand même être planifiée architecturalement maintenant.

**Verdict :** variante acceptable de l'Option C, à retenir comme plancher si l'Option C est jugée trop complexe pour V1.

---

## 3. Périmètre retenu

### Ce qui migre en V1 — périmètre positif

**Niveau 1 — Automatique, sans consentement additionnel (inhérent à la création du compte)**

| Élément | Nature | Condition |
|---------|--------|-----------|
| UUID bridge | Lien UUID local → UUID serveur Supabase Auth | Automatique à la création du compte |

L'UUID bridge n'est pas une migration de données — c'est une déclaration d'identité. En créant un compte, l'utilisateur dit implicitement : "cet appareil et cet historique local sont les miens." Aucun consentement additionnel requis au-delà de la création du compte elle-même.

**Niveau 2 — Sur consentement explicite, à l'initiative de l'utilisateur**

| Élément | Nature | Condition |
|---------|--------|-----------|
| Sessions mémoire locale (historique moteur) | 50 snapshots max, `CE_history_v1` | Proposition explicite — l'utilisateur déclenche l'action |
| Sessions comportementales | 50 sessions max, `CE_behavior_sessions_v1` | Proposition explicite — l'utilisateur déclenche l'action |

Ces deux éléments constituent la valeur perçue immédiate de la migration. Ils représentent le "capital mémoire" que l'utilisateur a accumulé localement. L'offre de migration leur donne un sens premium : ils passent d'un localStorage limité à 50 entrées FIFO vers une mémoire longue illimitée côté serveur.

La proposition doit être présentée une seule fois, clairement, avec un récapitulatif du contenu (nombre de sessions, période couverte). Aucune relance. Aucune obligation.

---

### Ce qui ne migre pas en V1 — périmètre négatif

| Élément | Raison d'exclusion |
|---------|-------------------|
| Imports CSV / Excel / PDF | Contenu potentiellement volumineux, données de tiers, aucune valeur serveur directe |
| Registre imports (`CE_import_registry_v1`) | Métadonnées d'import locales — non pertinentes côté serveur en V1 |
| Portfolio (`CE_portfolio_v1`) | Données financières sensibles, périmètre non défini côté serveur |
| Mémoire comportementale synthèse (`cameleon_behavior_memory_v1`) | Objet dérivé — peut être recalculé côté serveur depuis les sessions migrées |
| État formulaire | Éphémère, aucune valeur de mémoire longue |
| Préférences utilisateur | Triviales, reset acceptable, aucun historique à préserver |
| Traces Macro futures | Non implémentées en V1 |

Ces exclusions ne sont pas définitives pour les versions suivantes — elles délimitent ce que V1 prend en charge. Le principe : en V1, seule la mémoire de sessions (moteur + comportemental) a une valeur suffisante pour justifier une migration proposée.

---

### Traitement du local après migration

**Le localStorage n'est jamais effacé.** Ni automatiquement, ni à l'issue de la migration. L'historique local reste accessible dans l'outil, indépendamment du compte serveur.

La raison : si la migration échoue partiellement, si le serveur est indisponible, ou si l'utilisateur perd l'accès à son compte, le local est le filet de sécurité. Supprimer le local après migration reviendrait à supprimer le filet au moment précis où on en aurait besoin.

---

## 4. Cas utilisateur

### CU-01 — Utilisateur existant avec historique local

Profil : utilise Caméléon Engine depuis plusieurs semaines, 30+ sessions en localStorage, analyses comportementales enregistrées.

Traitement V1 :
1. Crée son compte (Magic Link). UUID bridge créé automatiquement.
2. À la première connexion post-création, une proposition de migration lui est présentée : "Vous avez 34 sessions locales couvrant les 6 dernières semaines. Voulez-vous les transférer vers votre compte pour construire votre mémoire longue ?"
3. S'il accepte → les sessions migrent vers Supabase, namespacées sous son UUID serveur. Le local reste intact.
4. S'il refuse ou ignore → rien ne migre. Le compte démarre avec les nouvelles sessions uniquement. La proposition n'est pas représentée.

---

### CU-02 — Nouvel utilisateur sans historique

Profil : crée un compte dès sa première utilisation de l'outil, localStorage vide ou quasi-vide.

Traitement V1 :
1. Crée son compte. UUID bridge créé.
2. Aucune proposition de migration — le localStorage ne contient rien de pertinent.
3. La mémoire longue commence à se construire à partir de J0 compte. C'est le cas le plus propre architecturalement.

---

### CU-03 — Utilisateur qui refuse la migration

Profil : a un historique local, voit la proposition, décline explicitement.

Traitement V1 :
- La proposition disparaît. Aucune relance.
- Le compte est opérationnel — il accumule des sessions premium à partir de ce moment.
- L'historique local reste accessible localement, inchangé.
- L'utilisateur peut toujours exporter son historique local manuellement via l'export JSON (ARCH-N4).
- Pas de "deuxième chance" automatique — la décision de refus est respectée.

---

### CU-04 — Utilisateur qui ignore la migration

Profil : ferme la proposition sans répondre, ne revient pas dessus.

Traitement V1 :
- Comportement identique au refus.
- La proposition n'est pas représentée à chaque connexion.
- Option possible en V1+1 : accès à la migration depuis les paramètres du compte.

---

### CU-05 — Utilisateur qui se connecte sur un nouvel appareil

Profil : a un compte actif, son historique est côté serveur. Se connecte depuis une machine différente.

Traitement V1 :
- Magic Link → connexion réussie → UUID serveur reconnu.
- Le localStorage du nouvel appareil est vide. Aucune migration à proposer.
- La mémoire longue serveur est disponible immédiatement via le compte.
- C'est la promesse principale du premium multi-device.
- Le local du premier appareil reste intact — aucune synchronisation bidirectionnelle en V1.

---

### CU-06 — Utilisateur avec conflit local / serveur

Profil : a migré 20 sessions il y a 2 semaines, a accumulé 15 nouvelles sessions locales depuis. Se reconnecte.

Traitement V1 :
- Les 15 nouvelles sessions locales sont uniquement locales — elles ne migrent pas automatiquement vers le serveur.
- Aucune synchronisation automatique en V1. Le serveur n'est pas un miroir en temps réel du local.
- Le serveur accumule les nouvelles sessions premium à partir de J0 compte — les sessions créées post-connexion sont directement enregistrées côté serveur si l'utilisateur est connecté.
- Règle : **en V1, il n'y a pas de sync continu. Les sessions pré-migration = locales. Les sessions post-connexion = serveur.** La frontière temporelle est la date de création du compte.

---

### CU-07 — Utilisateur avec historique local corrompu

Profil : données localStorage partiellement corrompues (interruption navigateur, dépassement quota, modification manuelle).

Traitement V1 :
- La proposition de migration est présentée normalement.
- Si l'utilisateur accepte, la migration lit le localStorage et ignore les entrées malformées — elle migre uniquement les sessions valides.
- L'utilisateur est informé du résultat : "34 sessions trouvées. 32 transférées. 2 ignorées (données incomplètes)."
- Le localStorage corrompu reste intact côté client — aucune tentative de "réparation" locale lors de la migration.
- Si la totalité du localStorage est illisible → proposition non présentée. Aucun message d'erreur alarmant.

---

## 5. Risques

### Perte d'historique

**Risque :** l'utilisateur refuse la migration, puis efface son localStorage (vidage navigateur, changement de machine). Son historique est perdu définitivement.

**Mitigation V1 :** proposer l'export JSON local (ARCH-N4) avant ou en même temps que la proposition de migration. L'utilisateur est responsable de ses données locales — c'est cohérent avec la philosophie local-first. Le serveur ne peut pas protéger ce que l'utilisateur n'a pas choisi d'y envoyer.

---

### Doublons

**Risque :** l'utilisateur crée deux comptes, migre les mêmes sessions vers les deux, ou migre plusieurs fois vers le même compte.

**Mitigation V1 :** la migration est une action unique proposée une seule fois. Côté serveur, chaque session migrée est identifiée par son UUID de session locale — un doublon est détecté et ignoré à l'insertion. L'idempotence de la migration est une condition de sécurité non négociable.

---

### Corruption lors de la migration

**Risque :** une session locale mal formée provoque une erreur côté serveur, corrompant l'insertion des sessions valides.

**Mitigation V1 :** la migration est transactionnelle ou atomique par session. Une session invalide est ignorée et journalisée — elle ne bloque pas les suivantes. L'utilisateur reçoit un rapport de résultat.

---

### Migration partielle sans information

**Risque :** la connexion est interrompue à mi-migration. L'utilisateur croit que tout a migré alors que 50% seulement est côté serveur.

**Mitigation V1 :** la migration ne se termine que si elle peut produire un rapport complet. Si elle est interrompue, les sessions partiellement envoyées sont rollbackées. L'utilisateur est informé de l'échec et peut relancer l'opération.

---

### Fausse promesse "logging dès J0"

**Risque :** la doctrine dit "logging dès J0". Un utilisateur pourrait comprendre que toutes ses sessions depuis le début de l'utilisation de l'outil sont automatiquement dans son compte dès qu'il crée un compte — ce qui n'est pas le cas.

**Clarification doctrinale :** "logging dès J0 compte" signifie que le serveur commence à enregistrer les sessions au moment de la création du compte, sans délai. Cela ne signifie pas que les sessions antérieures au compte migrent automatiquement. La migration des sessions pré-compte est une action distincte, explicite, sur consentement. Cette distinction doit être documentée dans la communication utilisateur.

---

### Confusion local / serveur

**Risque :** l'utilisateur ne sait pas si ce qu'il voit dans l'outil vient du local ou du serveur. Il croit avoir une mémoire longue alors qu'il consulte encore le localStorage.

**Mitigation V1 :** l'interface indique explicitement la source de la mémoire affichée. Les sessions locales (pre-migration) et les sessions serveur (post-création compte) sont clairement distinguées. Pas d'ambiguïté sur "ce qui est sauvegardé".

---

### Dépendance premium non anticipée

**Risque :** l'utilisateur migre ses données, puis refuse ou ne peut pas payer le premium. Ses données sont sur le serveur mais inaccessibles.

**Mitigation V1 :** les données migrées appartiennent à l'utilisateur — export RGPD disponible à tout moment, indépendamment du statut premium. La suppression du compte déclenche l'export ou la suppression complète des données migrées. Le local reste accessible quoi qu'il arrive.

---

### RGPD

**Risque :** des données personnelles migrent côté serveur sans consentement documenté.

**Mitigation V1 :** la migration de contenu (Niveau 2) est déclenchée par une action explicite de l'utilisateur. L'UUID bridge (Niveau 1) est inhérent à la création du compte — couvert par les CGU et la politique de confidentialité. Aucune donnée ne part sans action volontaire de l'utilisateur.

---

### Dérive vers la synchronisation permanente

**Risque :** V1 ouvre la porte. V1+1 ajoute une sync partielle. V1+2 sync complète en temps réel. Le serveur devient un miroir du local — ce qui transforme l'architecture en application SaaS classique.

**Règle permanente :** la migration est une opération ponctuelle et consentie, pas un mécanisme de sync continu. Toute demande de sync automatique est une décision d'architecture distincte — elle ne découle pas de ce document et doit être évaluée séparément, en cohérence avec la doctrine local-first.

---

## 6. Recommandation

**Option retenue : C — Migration progressive consentie.**

### Réponses aux questions obligatoires

**Que migre-t-on exactement en V1 ?**

Deux éléments uniquement :
1. L'UUID bridge (automatique, inhérent à la création du compte)
2. Les sessions mémoire locale — historique moteur + sessions comportementales — sur action explicite de l'utilisateur

**Que ne migre-t-on pas en V1 ?**

Imports CSV/Excel/PDF, registre d'imports, portfolio, mémoire comportementale synthèse, état formulaire, préférences, traces Macro. Ces éléments ne sont ni dans le périmètre de la mémoire longue V1 ni dans celui de l'Admin V1. Ils appartiennent à des décisions d'architecture futures.

**Quel est le principe directeur ?**

Migration progressive consentie. L'utilisateur choisit ce qui part. Le local reste intact. Le serveur reçoit uniquement ce que l'utilisateur lui donne explicitement.

**Comment traite-t-on un refus ?**

La proposition disparaît sans relance. Le compte fonctionne normalement. L'historique local reste disponible localement. L'utilisateur peut exporter son historique via ARCH-N4 à tout moment.

**Comment traite-t-on un échec ?**

Rollback complet ou par session. L'utilisateur est informé du résultat (sessions migrées / ignorées). Aucune donnée n'est perdue côté local. L'opération peut être relancée.

### Cohérence avec les doctrines gelées

| Doctrine | Cohérence |
|----------|-----------|
| User Account V1 Execution Architecture | ✅ — bridge UUID prévu, "limitation migration" documentée |
| Freemium Matrix V1 | ✅ — la migration de sessions pré-compte reste dans le périmètre premium (mémoire longue) |
| Server Provider V1 | ✅ — PostgreSQL Supabase supporte les insertions idempotentes et les transactions |
| User Real Journey V1 | ✅ — la valeur J+45 (premier miroir comportemental) peut inclure des sessions migrées |
| Mémoire Longue / MEM-V2 | ✅ — les sessions migrées alimentent la mémoire longue comme des sessions normales |
| Intelligence Layer Position | ✅ — l'Intelligence opère sur la mémoire longue ; des sessions migrées l'enrichissent |
| Doctrine → Product Transition | ✅ — la migration est un mécanisme produit, pas une décision doctrinale. Elle suit les doctrines, elle ne les redéfinit pas |
| MACRO-RULE-01 | ✅ — le moteur souverain est inchangé, aucune donnée Macro ne migre en V1 |

---

## 7. Décision proposée

### Périmètre migration UUID local → serveur V1 — définitif

**Option C — Migration progressive consentie.**

### Règles permanentes

| Règle | Valeur |
|-------|--------|
| Option retenue | C — Migration progressive consentie |
| UUID bridge | Automatique à la création du compte |
| Sessions moteur (historique) | Proposées sur action explicite — jamais automatiques |
| Sessions comportementales | Proposées sur action explicite — jamais automatiques |
| Imports CSV/Excel/PDF | Hors périmètre V1 |
| Portfolio | Hors périmètre V1 |
| Préférences | Hors périmètre V1 |
| Migration silencieuse | Interdite — toujours explicite |
| Suppression du local après migration | Interdite — le local reste intact |
| Idempotence | Obligatoire — un doublon est ignoré, pas dupliqué |
| Rapport de résultat | Obligatoire — sessions migrées / ignorées |
| Refus de migration | Respecté — aucune relance automatique |
| Échec de migration | Rollback — aucune perte de données locales |
| Export RGPD | Disponible à tout moment, indépendamment du statut premium |
| Sync continue local ↔ serveur | Hors périmètre V1 — décision distincte |
| Moteur souverain | Inchangé — aucune donnée moteur ne détermine la migration |

### Ce que ce document ne décide pas

- L'interface exacte de la proposition de migration — appartient à l'implémentation UX
- Le format exact des sessions migrées dans Supabase — appartient au schéma de base de données
- La gestion des sessions post-création (logging en temps réel) — appartient à l'implémentation du Compte Utilisateur
- La migration de données en V1+1 (imports, portfolio) — décision d'architecture future
- La synchronisation continue en V2 — décision d'architecture future, soumise à la doctrine local-first

### Conditions résiduelles

| Condition | Statut |
|-----------|--------|
| Schéma PostgreSQL sessions migrées | À définir en implémentation |
| Format proposition UX migration | À définir en implémentation |
| Procédure rollback migration partielle | À définir en implémentation |
| Export RGPD données migrées | À implémenter avant mise en production |

---

## 8. Verdict final

**Décision la plus importante**
La migration UUID local → serveur n'est pas une opération technique — c'est une déclaration de confiance. L'utilisateur décide de donner au serveur ce qu'il a construit localement. Cette décision doit être consciente, réversible par export, et sans conséquence négative en cas de refus. Si la migration n'est pas consentie, elle n'existe pas.

**Découverte la plus importante**
La confusion "logging dès J0" est le risque de communication le plus sérieux. Le logging dès J0 compte signifie que le serveur enregistre les nouvelles sessions à partir de la création du compte — pas que l'historique antérieur est automatiquement disponible. Cette distinction doit être claire dans la communication produit et dans l'interface, sous peine de déception au moment de la première connexion.

**Principe directeur confirmé**
Le serveur prolonge la mémoire locale dans le temps. Il ne la copie pas, il ne la remplace pas, il ne la surveille pas. Ce que le local contient appartient à l'utilisateur. Ce que l'utilisateur choisit d'envoyer au serveur lui appartient toujours — et peut être récupéré ou supprimé à tout moment.

**Risque principal**
La dérive vers la synchronisation permanente. V1 pose le bridge. L'appel naturel sera d'ajouter une sync continue. Cette décision doit être évaluée séparément, avec une conscience explicite de ce qu'elle implique sur la philosophie local-first et sur la charge opérationnelle.

**Question finale : le périmètre migration UUID local → serveur peut-il être considéré comme fermé après ce document ?**

**Oui, sous réserve de validation par l'opérateur du projet.**

Ce document ferme la dernière décision ouverte de la checklist pré-implémentation du Compte Utilisateur V1. Les 5 décisions bloquantes sont désormais documentées. La checklist GO/NO GO peut être relue.

**Verdict final**

Classification : **A — Document fondateur.**

Classification A car la décision de migration définit la relation fondamentale entre le local et le serveur — c'est une décision doctrinale qui conditionne toute l'architecture de la mémoire longue, du compte utilisateur et de la confiance utilisateur. Ce document ferme la dernière condition bloquante avant le GO/NO GO de la checklist pré-implémentation.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `user_account_v1_execution_architecture.md` · `server_provider_v1.md` · `freemium_matrix_v1.md` · `user_real_journey_v1.md`*
