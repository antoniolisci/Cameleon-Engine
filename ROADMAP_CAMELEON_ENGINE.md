\# RÈGLE



\- 1 chose à la fois

\- finir avant de commencer autre chose

\- pas de dispersion





\# 🧭 ROADMAP CAMÉLÉON ENGINE



\## 🔴 PRIORITÉ IMMÉDIATE (NE PAS SKIP)



\- Corriger l’import Binance natif (sans Google Sheets)

\- Corriger l’analyse comportementale (actuellement fausse)

\- Ne pas ajouter de nouvelles features avant fiabilisation



\---



\## 🧩 1. IMPORT \& DATA (CRITIQUE)



\- \[ ] Accepter directement les fichiers Binance (sans modification)

\- \[ ] Supporter format réel Binance (Spot)

\- \[ ] Identifier colonnes :

&#x20; - Date / Pair / Side / Price / Qty / Amount / Fee

\- \[ ] Gérer variations de format Binance

\- \[ ] Vérifier parsing correct :

&#x20; - BUY / SELL

&#x20; - prix

&#x20; - quantités

&#x20; - montants

\- \[ ] Gestion erreurs fichier (message clair)

\- \[ ] Supprimer dépendance Google Sheets



\### 🔧 MISE À JOUR — IMPORT MULTI-SOURCES \& COMPORTEMENT



\- \[ ] Support multi-sources (Binance + autres exchanges + CSV génériques)

\- \[ ] Détection automatique du format de fichier

\- \[ ] Normalisation interne des données (format unique)



\- \[ ] Identifier précisément où naît une erreur :

&#x20; - import

&#x20; - mapping

&#x20; - traitement

&#x20; - analyse



\- \[ ] Distinguer :

&#x20; - activité élevée structurée (carnet d’ordres)

&#x20; - surtrading impulsif



\- \[ ] Ne pas considérer automatiquement plusieurs trades comme une erreur





\---



\## 🧠 2. MODULE COMPORTEMENTAL (FIABILISATION)



\- \[ ] Vérifier séparément : données importées, données transformées, données analysées

\- \[ ] Corriger détection :

&#x20; - overtrading (par symbole)

&#x20; - revenge trading (par symbole)

&#x20; - réentrée rapide (par symbole)

&#x20; - escalade de position (avec seuil significatif)

&#x20; - tailles incohérentes (par symbole)



\- \[ ] Ne plus analyser globalement toutes les paires ensemble



\- \[ ] Réduire faux positifs (carnet d’ordres structuré / DCA / range)



\- \[ ] Ajuster seuils de détection (éviter règles trop rigides)



\- \[ ] Corriger score comportemental



\- \[ ] Vérifier cohérence conclusions vs réalité trading



\- \[ ] Rendre les insights fiables



\---



\## 🧱 3. FONDATION MOTEUR



\- \[ ] Vérifier que engine.js est la source unique de décision

\- \[ ] Supprimer doublons (decision.js / moteur.js)

\- \[ ] Vérifier mapping :

&#x20; - market\_state → décision

&#x20; - décision → UI

\- \[ ] Stabiliser buildPayload()



\---



\## 🧪 4. VALIDATION \& DEBUG



\- \[ ] Ajouter logs internes du moteur

\- \[ ] Créer mode debug (affichage variables internes)

\- \[ ] Vérifier cohérence globale :

&#x20; - moteur vs comportement

&#x20; - score vs décision

&#x20; - UI vs logique



\---



\## 🧠 5. LOGIQUE TEMPORELLE



\- \[ ] Analyse des séquences de trades

\- \[ ] Détection rythme / suractivité

\- \[ ] Gestion du temps entre trades

\- \[ ] Détection sessions



\---



\## 🎯 6. ACTION \& POSTURE (UX)



\- \[ ] Bloc “Pourquoi cette décision”

\- \[ ] Bloc “Actions autorisées”

\- \[ ] Bloc “Plan d’action”

\- \[ ] Bloc “Scénarios SI → ALORS”



\---



\## 🧱 7. BLOCS UI IMPORTANTS



\- \[ ] Intégrer les blocs sans casser la hiérarchie

\- \[ ] Ajouter bloc “Erreurs à éviter” (optionnel)

\- \[ ] Vérifier lisibilité globale



\---



\## 🧭 8. NAVIGATION \& ONGLETS



\- \[ ] Ajouter un nouvel onglet gauche

\- \[ ] Créer onglet “Règles de trading”



\### Contenu :

\- Range

\- Scalping

\- Attente

\- Réentrée

\- Gestion taille

\- Surtrading / FOMO



\### Format :

\- Autorisé

\- Interdit

\- Erreur classique

\- Réflexe Caméléon



\---



\## 📊 9. MARKET STATE ENGINE



\- \[ ] Vérifier mapping final :

&#x20; - RANGE

&#x20; - COMPRESSION

&#x20; - EXPANSION

&#x20; - DEFENSE

\- \[ ] Alignement avec dictionary.js

\- \[ ] Cohérence moteur



\---



\## 🧠 10. DICTIONNAIRE GLOBAL



\- \[ ] Compléter dictionary.js

\- \[ ] Centraliser toutes les définitions

\- \[ ] Éviter valeurs hardcodées

\- \[ ] Assurer cohérence globale



\---



\## 🎨 11. IDENTITÉ VISUELLE



\- \[ ] Créer logo Caméléon Engine

\- \[ ] Intégrer logo (top left)

\- \[ ] Adapter au thème dark premium



\---



\## 🖼️ 12. IMAGES DYNAMIQUES



\- \[ ] Créer système d’images selon marché

\- \[ ] Mapper :

&#x20; - RANGE → calme

&#x20; - EXPANSION → mouvement

&#x20; - COMPRESSION → tension

&#x20; - DEFENSE → danger

\- \[ ] Charger dynamiquement dans UI



\---



\## 📘 13. MODE D’EMPLOI (IN-APP)



\- \[ ] Créer onglet “Mode d’emploi”

\- \[ ] Expliquer :

&#x20; - cockpit

&#x20; - décisions

&#x20; - comportement

\- \[ ] Rendre simple et lisible

\- \[ ] Lier au fonctionnement réel



\---



\## 💾 14. DATA \& HISTORIQUE



\- \[ ] Vérifier localStorage

\- \[ ] Séparer snapshot / payload

\- \[ ] Préparer export CSV



\---



\## 🧪 15. TESTS



\- \[ ] Tester 10 scénarios différents

\- \[ ] Tester cas extrêmes

\- \[ ] Vérifier UX

\- \[ ] Vérifier cohérence globale



\---



\## ⚙️ 16. AUTOMATION (PLUS TARD)



\- \[ ] n8n

\- \[ ] API prix

\- \[ ] API portefeuille



⚠️ Ne pas toucher pour l’instant



\---



\## 📦 17. PRODUIT



\- \[ ] Clarifier cible utilisateur

\- \[ ] Usage en 30 secondes

\- \[ ] Mode débutant vs avancé

\- \[ ] Définir positionnement clair



\---



\## 📄 18. DOCUMENTATION PROJET (RDV)



\- \[ ] Présentation simple du projet

\- \[ ] Problème / solution

\- \[ ] Fonctionnalités

\- \[ ] Différenciation

\- \[ ] État actuel

\- \[ ] Prochaines étapes

\- \[ ] Pitch oral



\---



\## 🔒 19. STABILITÉ



\- \[ ] Aucun bug JS

\- \[ ] Aucun bouton cassé

\- \[ ] UI fluide

\- \[ ] Version présentable



\---



\## 🧠 RÈGLE CAMÉLÉON



\- 1 chose à la fois

\- finir avant de commencer autre chose

\- aucune dispersion

