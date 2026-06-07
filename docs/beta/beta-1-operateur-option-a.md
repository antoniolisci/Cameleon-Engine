# Bêta 1 — Protocole testeur · Option A (repo privé)

**Version :** 1.0 · 2026-06-07  
**Périmètre :** 1 opérateur · accès repo GitHub privé · installation locale

---

## Objectif du test

Vérifier que Caméléon Engine est utilisable par un opérateur externe dans des conditions réelles, sans assistance technique continue.

Ce n'est pas un test de performance ou de précision du moteur. C'est un test de parcours : est-ce que l'outil se laisse utiliser ? Où ça résiste ? Où ça surprend ?

---

## Prérequis testeur

- Windows 10 ou 11
- PowerShell disponible (présent par défaut sur Windows 10/11)
- Git installé ([git-scm.com](https://git-scm.com))
- Un navigateur moderne : Chrome, Firefox ou Edge — version récente
- Un fichier d'historique Binance : CSV, XLSX ou PDF (Trade History ou Order History)
- Accès à l'invitation GitHub reçue par email

---

## Installation — étapes

### 1. Accepter l'invitation GitHub

Ouvrir l'email d'invitation reçu de GitHub et cliquer sur le lien d'acceptation.  
Le repo apparaît ensuite dans votre liste de dépôts GitHub.

### 2. Cloner le repo

Ouvrir un terminal PowerShell ou Git Bash et exécuter :

```powershell
git clone https://github.com/antoniolisci/Cameleon-Engine.git
cd Cameleon-Engine
```

### 3. Lancer le serveur local

Dans le dossier `Cameleon-Engine`, exécuter :

```powershell
powershell -ExecutionPolicy Bypass -File .\serve-local.ps1
```

Le terminal affiche :

```
Serving C:\...\Cameleon-Engine
Open http://localhost:8000/src/index.html
Press Ctrl+C to stop.
```

Laisser ce terminal ouvert pendant toute la session.

### 4. Ouvrir l'application

Dans le navigateur, ouvrir :

```
http://localhost:8000/src/index.html
```

L'application se charge. Un écran de bienvenue apparaît au premier lancement.

---

## Parcours de test demandé

Suivre les étapes dans l'ordre. Prendre note de chaque point de friction.

### Étape 1 — Ouvrir l'application

- L'écran de bienvenue s'affiche-t-il correctement ?
- Le menu de navigation (Moteur / Pilotage / Mémoire / Comportement) est-il visible ?

### Étape 2 — Lancer une analyse moteur

- Aller sur l'onglet **Moteur**
- Remplir les champs selon une situation de marché réelle ou fictive
- Cliquer sur **Analyser**
- Le résultat est-il lisible ? La décision est-elle compréhensible ?

### Étape 3 — Importer un fichier

- Aller sur l'onglet **Comportement**
- Glisser-déposer ou sélectionner un fichier CSV, XLSX ou PDF Binance (Trade History ou Order History)
- L'import se termine-t-il ? Un résumé d'import s'affiche-t-il ?
- Si le fichier est un PDF : un message de qualité apparaît-il si la qualité est dégradée ?

### Étape 4 — Vérifier le résumé d'import

- La source est-elle correctement détectée (ex : "Trade History PDF") ?
- Le nombre de lignes lues et retenues est-il cohérent avec le fichier ?

### Étape 5 — Sauvegarder une lecture

- Après une analyse moteur, utiliser la fonction de sauvegarde si disponible
- La session est-elle enregistrée dans l'historique ?

### Étape 6 — Exporter les données

- Aller sur l'onglet **Mémoire**
- Section **Diagnostic mémoire**
- Cliquer sur **Exporter mes données**
- Un fichier `cameleon-data-YYYY-MM-DD.json` est-il téléchargé ?
- Ouvrir le fichier : contient-il des données lisibles ?

---

## Ce que le testeur doit noter

Pour chaque anomalie ou observation, noter :

| Catégorie | Description |
|---|---|
| **Blocage** | L'action n'est pas possible, l'application ne répond plus |
| **Incompréhension** | L'interface ne dit pas clairement quoi faire |
| **Erreur console** | Ouvrir F12 → Console — noter les messages en rouge |
| **Fichier refusé** | Un fichier valide est rejeté sans raison claire |
| **Lenteur** | Une opération prend visiblement trop de temps |
| **Ressenti général** | Impression globale après 30 minutes d'utilisation |

Aucun format imposé — un email, un message, des notes libres. L'important est de décrire ce qui s'est passé.

---

## Règles de confidentialité

- Ne pas partager le repo ni son contenu publiquement
- Ne pas importer de fichier contenant des données financières sensibles si inconfort
- Toutes les données restent sur votre machine — rien n'est envoyé à un serveur
- L'export JSON produit par l'application est local — ne pas l'envoyer sans vérification préalable

---

## Contact

Pour toute question pendant le test, contacter directement Antonio par email ou message direct.
