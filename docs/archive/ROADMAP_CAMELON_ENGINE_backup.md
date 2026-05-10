# 🧭 ROADMAP CAMÉLÉON ENGINE

---

# 🔒 RÈGLE ABSOLUE

- 1 chose à la fois
- finir avant de commencer autre chose
- aucune dispersion

---

# 🚨 PRIORITÉ 0 — ÉTAT ACTUEL

- Import testé sur **1 fichier réel uniquement**
- Pipeline fonctionnel mais **pas encore robuste**
- Module comportemental connecté (soft influence)
- UI fonctionnelle mais pas encore production-ready

---

# 🔴 PRIORITÉ IMMÉDIATE

- Stabiliser l’import des fichiers réels
- Fiabiliser l’analyse comportementale
- Ne pas ajouter de nouvelles features tant que la base n’est pas solide

---

# ✅ DÉFINITION DU “SOCLE STABLE”

Le socle sera considéré comme stable quand :

- les fichiers trade / wallet sont correctement reconnus
- les données importées sont lisibles et cohérentes
- le journal des trades s’affiche correctement
- le journal wallet s’affiche correctement
- le scoring comportemental ne produit plus de faux signaux majeurs
- aucun bouton essentiel n’est cassé

---

# 🔥 PHASE 1 — SOCLE RÉEL (CRITIQUE)

👉 Tant que cette phase n’est pas validée → aucune nouvelle feature

---

## 🧩 1. IMPORT & DATA (CRITIQUE)

### 1.0 Validation réelle (CRITIQUE AJOUTÉ)

- [ ] Tester 5 à 10 fichiers Binance réels différents
- [ ] Tester :
  - périodes différentes
  - tailles différentes (petit / gros historique)
  - formats CSV variés
- [ ] Tester fichiers incomplets / cassés
- [ ] Tester reset + réimport
- [ ] Vérifier :
  - aucun crash
  - parsing cohérent

---

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

---

### 1.2 Import intelligent multi-formats

- [ ] Détecter automatiquement le type de fichier importé :
  - historique de trades
  - historique d’opérations / wallet
  - fichier inconnu
- [ ] Router vers le bon pipeline :
  - trades → analyse comportementale trading
  - wallet → journal / activité financière
  - inconnu → message clair
- [ ] Ne pas rejeter un fichier valide inutilement

---

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
  - quantity / executed / qty
  - amount / total
  - fee / commission / frais
- [ ] Tolérer FR / EN
- [ ] Tolérer colonnes manquantes non critiques

---

### 1.4 Support formats d’entrée

- [ ] CSV
- [ ] Excel (.xlsx / .xls)
- [ ] Conversion vers pipeline interne unique

---

### 1.5 Normalisation interne

- [ ] Mapper vers format interne unique :
  - timestamp
  - symbol
  - side
  - price
  - quantity
  - quote_value
  - fee
- [ ] Détecter base vs quote asset

---

### 1.6 Pipeline unifié

- [ ] Pipeline unique :
  - import → parsing → normalisation → affichage → analyse
- [ ] Ne pas dupliquer logique

---

### 1.7 Classification fichiers Binance

- [ ] Classer :
  - trades
  - wallet / operations
  - order history
  - open orders
  - convert
  - earn
  - unknown
- [ ] Documenter chaque type

---

### 1.8 Évolution future — Intent Analysis

- [ ] Pipeline dédié :
  - ordres ouverts
  - ordres annulés
  - historique ordres
- [ ] Analyser intentions :
  - efficacité
  - distance marché
  - spam
  - hésitation

---

### 1.9 Logs import (CRITIQUE)

- [ ] Logger :
  - type fichier détecté
  - colonnes reconnues
  - colonnes ignorées
- [ ] Messages d’erreur clairs

---

## 🧠 2. MODULE COMPORTEMENTAL (FIABILISATION)

### 2.0 Validation terrain (CRITIQUE)

- [ ] Tester sur :
  - scalping réel
  - range
  - DCA
- [ ] Vérifier :
  - pas de faux overtrading
  - pas de faux revenge trading

---

### 2.1 Fiabilité des données

- [ ] Vérifier :
  - import
  - transformation
  - affichage
  - analyse
- [ ] Identifier origine des erreurs

---

### 2.2 Détection des patterns

- [ ] Corriger :
  - overtrading (par symbole)
  - revenge trading (par symbole)
  - réentrée rapide
  - escalade de position
  - tailles incohérentes
- [ ] Éviter analyse globale multi-paires
- [ ] Réduire faux positifs

---

### 2.3 Scoring comportemental

- [ ] Ne pas baser uniquement sur nombre de trades
- [ ] Ajouter :
  - avgTimeBetweenSameSymbol
- [ ] Introduire gradation du score
- [ ] Vérifier cohérence réelle

---

### 2.4 Adaptation au style (ÉVOLUTION)

- [ ] Détecter :
  - scalping
  - range
  - swing
  - DCA
- [ ] Adapter seuils
- [ ] Détecter dérives

---

### 2.5 Module wallet

- [ ] Lecture factuelle
- [ ] Journal wallet
- [ ] Séparer trading vs wallet

---

### 2.6 Cohérence moteur vs comportement

- [ ] Vérifier :
  - coherenceLevel ↔ réalité
  - posture ↔ comportement

---

## 🧱 3. FONDATION MOTEUR

- [ ] engine.js = source unique
- [ ] Supprimer doublons
- [ ] Vérifier mapping :
  - market_state → décision
  - décision → UI
- [ ] Stabiliser buildPayload()

---

### 3.1 Protection moteur (CRITIQUE)

- [ ] behavior ≠ décision
- [ ] behavior = lecture / influence uniquement

---

## 🧪 4. VALIDATION & DEBUG

- [ ] Logs internes moteur
- [ ] Mode debug simple
- [ ] Vérifier cohérence globale :
  - moteur vs comportement
  - score vs décision
  - UI vs logique

---

### 4.1 Debug minimal (AJOUT)

- [ ] Toggle debug
- [ ] Afficher :
  - style détecté
  - coherenceLevel
  - transitions

---

# ⛔ STOP FEATURE ZONE

❌ Pas de nouvelles features tant que PHASE 1 non validée

---

# 🧠 PHASE 2 — INTELLIGENCE

---

## 🔥 5. LOGIQUE TEMPORELLE

- [ ] Analyser séquences
- [ ] Détecter suractivité
- [ ] Gérer timing
- [ ] Détecter sessions

---

## 🎯 6. ACTION & POSTURE (UX)

- [ ] Bloc “Pourquoi cette décision”
- [ ] Bloc “Actions autorisées”
- [ ] Bloc “Plan d’action”
- [ ] Bloc “Scénarios SI → ALORS”

---

### 6.1 Hard Influence (CRITIQUE)

- [ ] Adapter :
  - taille
  - fréquence
- [ ] Ajouter warnings forts
- [ ] (plus tard) limiter actions

---

# 🧱 7. BLOCS UI

- [ ] Intégration propre
- [ ] Lisibilité
- [ ] Option “Erreurs à éviter”

---

# 🧭 8. NAVIGATION

### 8.1 Maintenant

- [ ] Aucun nouvel onglet

### 8.2 Plus tard

- [ ] Onglet règles trading

---

# 📊 9. MARKET STATE ENGINE

- [ ] Vérifier mapping :
  - RANGE
  - COMPRESSION
  - EXPANSION
  - DEFENSE

---

# 🧠 10. DICTIONNAIRE

- [ ] Compléter dictionary.js
- [ ] Éviter hardcode

---

# 🎨 11. IDENTITÉ VISUELLE

- [ ] Logo
- [ ] Intégration UI

---

# 🖼️ 12. IMAGES DYNAMIQUES

- [ ] Mapper images aux états marché

---

# 📘 13. MODE D’EMPLOI

- [ ] Explication cockpit
- [ ] Explication fichiers

---

# 💾 14. DATA

- [ ] Vérifier localStorage
- [ ] Séparer snapshot / payload
- [ ] Export CSV

---

# 🧪 15. TESTS

- [ ] Scénarios réels
- [ ] Cas extrêmes
- [ ] UX
- [ ] Cohérence globale

---

# ⚙️ 16. AUTOMATION (PLUS TARD)

⚠️ Ne pas toucher

---

# 📦 17. PRODUIT

- [ ] Cible utilisateur
- [ ] Usage en 30 sec
- [ ] Mode débutant / avancé

---

# 📄 18. DOCUMENTATION

- [ ] Présentation projet
- [ ] Pitch

---

# 🔒 19. STABILITÉ

- [ ] Aucun bug JS
- [ ] UI fluide
- [ ] Version présentable

---

# 🧠 RÈGLE CAMÉLÉON

- 1 chose à la fois
- finir avant de commencer autre chose
- aucune dispersion
