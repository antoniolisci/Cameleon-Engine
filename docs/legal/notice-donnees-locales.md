# Caméléon Engine — Notice sur les données locales

Version 1.0

## Philosophie du projet

Caméléon Engine est conçu selon une architecture local-first.

Principe central : les données appartiennent à l'utilisateur.

Le logiciel privilégie le stockage local plutôt que l'envoi vers des serveurs distants. Cette approche est un choix délibéré de conception, pas une contrainte technique.

---

## Données pouvant être importées

L'utilisateur peut importer volontairement dans l'application :
- des historiques de transactions ;
- des historiques d'ordres ;
- des historiques wallet ;
- des fichiers CSV ;
- des fichiers XLSX ;
- des fichiers PDF compatibles (Trade History et Order History Binance).

Ces fichiers peuvent contenir des informations financières sensibles, notamment des données d'activité de trading, des montants, des actifs détenus et des périodes d'activité.

L'utilisateur choisit seul les fichiers qu'il importe.

---

## Traitement des données

Les analyses produites par Caméléon Engine sont réalisées localement.

- Les calculs comportementaux sont exécutés sur l'appareil de l'utilisateur.
- Les données importées ne sont pas envoyées à un serveur de traitement.
- Aucune copie des données importées n'est transmise à l'éditeur ou à un tiers.

---

## Données stockées localement

Caméléon Engine stocke les éléments suivants dans le navigateur de l'utilisateur, via localStorage :

- un identifiant local (UUID) généré anonymement sur l'appareil ;
- les sessions comportementales (historique des analyses réalisées) ;
- les paramètres utilisateur ;
- la mémoire opérateur (profil comportemental persistant) ;
- les sauvegardes locales ;
- les registres d'import ;
- les résultats d'analyse.

Ces données sont associées à l'identifiant local et restent sur l'appareil de l'utilisateur.

---

## Données non collectées

Caméléon Engine ne collecte pas :
- le nom ou le prénom de l'utilisateur ;
- son adresse postale ;
- son numéro de téléphone ;
- ses coordonnées bancaires ou identifiants de plateforme ;
- son adresse IP à des fins d'analyse ou de profilage ;
- des données publicitaires ;
- des données de tracking comportemental externe.

---

## Export des données

L'utilisateur peut exporter l'ensemble de ses données locales sous forme de fichier JSON, depuis l'onglet Mémoire de l'application.

- L'export est déclenché manuellement par l'utilisateur.
- Le fichier est créé et téléchargé localement sur son appareil.
- Aucune copie n'est envoyée à un tiers lors de cette opération.

---

## Absence de serveur de collecte

Caméléon Engine fonctionne sans backend de collecte de données.

- Aucune base de données centrale n'est utilisée pour stocker les données des utilisateurs.
- Aucun profil utilisateur distant n'est créé.
- L'application ne nécessite pas de connexion à un serveur pour fonctionner.

---

## Limites du stockage local

Les données stockées restent liées à l'appareil et au navigateur utilisés.

- Une suppression du stockage local du navigateur (cache, données de site) peut entraîner la perte des données.
- Un changement d'appareil ou de navigateur ne transfère pas automatiquement les données.
- L'utilisateur est responsable de ses sauvegardes et de ses exports.

L'export JSON disponible dans l'application permet à l'utilisateur de conserver une copie de ses données.

---

## Sécurité et confidentialité

Les données restent sous le contrôle de l'utilisateur sur son propre appareil.

- Aucune vente de données n'est réalisée.
- Aucune transmission volontaire à des tiers n'est effectuée par l'application.

La sécurité des données dépend également de la sécurité de l'appareil de l'utilisateur. Caméléon Engine ne peut pas garantir la protection des données en cas d'accès non autorisé à l'appareil.

---

## Résumé

Caméléon Engine applique une approche local-first :

- vos données restent sur votre appareil ;
- vos imports ne sont pas transmis à un serveur ;
- vos analyses sont calculées localement ;
- vous gardez le contrôle de vos sauvegardes et exports.

La décision appartient toujours à l'utilisateur.
