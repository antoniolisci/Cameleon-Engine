# RÈGLE

- 1 chose à la fois
- finir avant de commencer autre chose
- pas de dispersion

---

# 🧭 ROADMAP CAMÉLÉON ENGINE

## 🔴 PRIORITÉ IMMÉDIATE

- Stabiliser l’import des fichiers réels
- Fiabiliser l’analyse comportementale
- Ne pas ajouter de nouvelles features tant que la base n’est pas solide

## ✅ Définition du “socle stable”
Le socle sera considéré comme stable quand :
- les fichiers trade / wallet sont correctement reconnus
- les données importées sont lisibles et cohérentes
- le journal des trades s’affiche correctement
- le journal wallet s’affiche correctement
- le scoring comportemental ne produit plus de faux signaux majeurs
- aucun bouton essentiel n’est cassé

---

## 🧩 1. IMPORT & DATA (CRITIQUE)

### 1.1 Import réel Binance
- [ ] Accepter directement les fichiers Binance sans Google Sheets
- [ ] Supporter les vrais formats Binance :
  - trade
  - wallet / operations
- [ ] Vérifier parsing correct :
  - date
  - pair / symbol
  - side / direction
  - price
  - quantity
  - amount / total
  - fee
- [ ] Gérer les erreurs avec message clair

### 1.2 Import intelligent multi-formats
- [ ] Détecter automatiquement le type de fichier importé :
  - historique de trades
  - historique d’opérations / wallet
  - fichier inconnu
- [ ] Router le fichier vers le bon pipeline :
  - trades → analyse comportementale trading
  - wallet → journal / activité financière
  - inconnu → message clair
- [ ] Ne plus rejeter un fichier valide uniquement parce qu’il n’est pas un format “trade”

### 1.3 Parsing tolérant
- [ ] Détecter automatiquement le séparateur CSV :
  - virgule
  - point-virgule
  - tabulation
- [ ] Tolérer des noms de colonnes variables :
  - date / timestamp / UTC_Time
  - pair / symbol / market
  - side / type / direction
  - price / prix
  - executed / qty / quantity / exécuté
  - amount / total
  - fee / commission / frais
- [ ] Tolérer les variations de langue :
  - FR
  - EN
- [ ] Tolérer l’absence de certaines colonnes non critiques

### 1.4 Support des formats d’entrée
- [ ] Accepter CSV
- [ ] Accepter Excel (.xlsx / .xls)
- [ ] Convertir les formats d’entrée vers un pipeline interne unique
- [ ] Éviter toute logique séparée inutile entre CSV et Excel

### 1.5 Normalisation interne
- [ ] Mapper toutes les données importées vers un format interne unique :
  - timestamp
  - symbol
  - side
  - price
  - quantity
  - quote_value
  - fee
- [ ] Détecter si les montants sont en base asset ou en quote asset
- [ ] Utiliser un seul pipeline interne de traitement

### 1.6 Pipeline unifié
- [ ] Faire tourner metrics / patterns / scoring uniquement sur le format interne
- [ ] Ne jamais dupliquer la logique de parsing ou d’analyse
- [ ] Garder une chaîne simple :
  - import
  - parsing
  - normalisation
  - affichage
  - analyse

### 1.7 Classification des fichiers Binance
- [ ] Classer les fichiers réels par famille :
  - trades
  - wallet / operations
  - order history
  - open orders
  - convert
  - earn
  - unknown / mixte
- [ ] Construire les règles d’import à partir de ces familles réelles
- [ ] Documenter chaque famille :
  - colonnes
  - usage
  - pipeline cible
  - exploitable / non exploitable

### 1.8 Évolution future — Intent Analysis
- [ ] Ajouter plus tard un pipeline dédié pour :
  - ordres ouverts
  - ordres annulés
  - historique des ordres
- [ ] Analyser les intentions :
  - efficacité des ordres
  - distance au marché
  - spam d’ordres
  - hésitation
- [ ] Garder ce module totalement séparé du trading et du wallet

---

## 🧠 2. MODULE COMPORTEMENTAL (FIABILISATION)

### 2.1 Fiabilité des données
- [ ] Vérifier séparément :
  - données importées
  - données transformées
  - données affichées
  - données analysées
- [ ] Identifier précisément où naît une erreur :
  - import
  - mapping
  - traitement
  - affichage
  - analyse

### 2.2 Détection des patterns
- [ ] Corriger détection :
  - overtrading (par symbole)
  - revenge trading (par symbole)
  - réentrée rapide (par symbole)
  - escalade de position (avec seuil significatif)
  - tailles incohérentes (par symbole)
- [ ] Ne plus analyser globalement toutes les paires ensemble
- [ ] Réduire les faux positifs :
  - carnet d’ordres structuré
  - DCA
  - range
  - scalping propre

### 2.3 Scoring comportemental
- [ ] Ne plus déclencher overtrading uniquement sur le nombre de trades
- [ ] Ajouter la condition de rythme réel :
  - avgTimeBetweenSameSymbol
- [ ] Introduire une gradation du score
- [ ] Ne pas considérer activité élevée = risque automatique
- [ ] Vérifier que les conclusions collent à la réalité du trading

### 2.4 Adaptation au style de trading (évolution)
- [ ] Identifier le style dominant :
  - scalping
  - range / carnet d’ordres
  - swing
  - DCA / accumulation
  - mixte
- [ ] Adapter les seuils d’analyse au style détecté
- [ ] Mesurer la cohérence interne :
  - le trader est-il cohérent avec son propre style ?
- [ ] Détecter les dérives de style

### 2.5 Module wallet
- [ ] Rendre la lecture wallet plus factuelle et moins “jugeante”
- [ ] Ajouter un journal des opérations wallet
- [ ] Séparer clairement :
  - analyse trading
  - analyse wallet

---

## 🧱 3. FONDATION MOTEUR

- [ ] Vérifier que `engine.js` reste la source unique de décision
- [ ] Supprimer les doublons inutiles (`decision.js` / `moteur.js`)
- [ ] Vérifier le mapping :
  - market_state → décision
  - décision → UI
- [ ] Stabiliser `buildPayload()`

---

## 🧪 4. VALIDATION & DEBUG

- [ ] Ajouter des logs internes du moteur
- [ ] Créer un mode debug simple
- [ ] Vérifier la cohérence globale :
  - moteur vs comportement
  - score vs décision
  - UI vs logique
- [ ] Vérifier que le moteur principal reste intact quand on modifie le module comportemental

---

## 🧠 5. LOGIQUE TEMPORELLE

- [ ] Analyser les séquences de trades
- [ ] Détecter la suractivité
- [ ] Gérer le temps entre trades
- [ ] Détecter les sessions

---

## 🎯 6. ACTION & POSTURE (UX)

- [ ] Bloc “Pourquoi cette décision”
- [ ] Bloc “Actions autorisées”
- [ ] Bloc “Plan d’action”
- [ ] Bloc “Scénarios SI → ALORS”

---

## 🧱 7. BLOCS UI IMPORTANTS

- [ ] Intégrer les blocs sans casser la hiérarchie visuelle
- [ ] Ajouter un bloc “Erreurs à éviter” (optionnel)
- [ ] Vérifier la lisibilité globale

---

## 🧭 8. NAVIGATION & ONGLETS

### 8.1 Priorité actuelle
- [ ] Ne pas créer de nouveaux onglets tant que l’import et l’analyse ne sont pas stables

### 8.2 Plus tard
- [ ] Ajouter un nouvel onglet gauche
- [ ] Créer un onglet “Règles de trading”

#### Contenu
- Range
- Scalping
- Attente
- Réentrée
- Gestion taille
- Surtrading / FOMO

#### Format
- Autorisé
- Interdit
- Erreur classique
- Réflexe Caméléon

### 8.3 Idée future — Onglet Journal
- [ ] Créer plus tard un onglet gauche “Journal”
- [ ] Regrouper dans cet onglet :
  - journal moteur
  - journal des trades
  - journal wallet / opérations
  - historique des sessions
- [ ] Ne créer cet onglet qu’après stabilisation de l’import et de l’analyse

---

## 📊 9. MARKET STATE ENGINE

- [ ] Vérifier le mapping final :
  - RANGE
  - COMPRESSION
  - EXPANSION
  - DEFENSE
- [ ] Aligner avec `dictionary.js`
- [ ] Vérifier la cohérence avec le moteur

---

## 🧠 10. DICTIONNAIRE GLOBAL

- [ ] Compléter `dictionary.js`
- [ ] Centraliser toutes les définitions
- [ ] Éviter les valeurs hardcodées
- [ ] Assurer la cohérence globale

---

## 🎨 11. IDENTITÉ VISUELLE

- [ ] Créer le logo Caméléon Engine
- [ ] Intégrer le logo en haut à gauche
- [ ] Adapter au thème dark premium

---

## 🖼️ 12. IMAGES DYNAMIQUES

- [ ] Créer un système d’images selon le marché
- [ ] Mapper :
  - RANGE → calme
  - EXPANSION → mouvement
  - COMPRESSION → tension
  - DEFENSE → danger
- [ ] Charger dynamiquement dans l’UI

---

## 📘 13. MODE D’EMPLOI (IN-APP)

- [ ] Créer un onglet “Mode d’emploi”
- [ ] Expliquer :
  - le cockpit
  - les décisions
  - le comportement
  - les différents types de fichiers
- [ ] Rendre le tout simple et lisible

---

## 💾 14. DATA & HISTORIQUE

- [ ] Vérifier `localStorage`
- [ ] Séparer snapshot / payload
- [ ] Préparer export CSV

---

## 🧪 15. TESTS

- [ ] Tester plusieurs scénarios réels
- [ ] Tester les cas extrêmes
- [ ] Vérifier l’UX
- [ ] Vérifier la cohérence globale
- [ ] Tester :
  - import trade
  - import wallet
  - clear/reset
  - sessions
  - retour au moteur principal

---

## ⚙️ 16. AUTOMATION (PLUS TARD)

- [ ] n8n
- [ ] API prix
- [ ] API portefeuille

⚠️ Ne pas toucher pour l’instant

---

## 📦 17. PRODUIT

- [ ] Clarifier la cible utilisateur
- [ ] Garantir un usage en 30 secondes
- [ ] Définir mode débutant vs avancé
- [ ] Clarifier le positionnement :
  - cockpit de décision
  - analyse comportementale
  - lecture wallet
  - plus tard : intent analysis

### 17.1 Idées futures à forte valeur
- [ ] Intent analysis
- [ ] Onglet fiscalité
- [ ] Lecture capital / wealth tracking
- [ ] Journal unifié

---

## 📄 18. DOCUMENTATION PROJET

- [ ] Présentation simple du projet
- [ ] Problème / solution
- [ ] Fonctionnalités
- [ ] Différenciation
- [ ] État actuel
- [ ] Prochaines étapes
- [ ] Pitch oral

---

## 🔒 19. STABILITÉ

- [ ] Aucun bug JS
- [ ] Aucun bouton cassé
- [ ] UI fluide
- [ ] Version présentable

---

## 🧠 RÈGLE CAMÉLÉON

- 1 chose à la fois
- finir avant de commencer autre chose
- aucune dispersion
