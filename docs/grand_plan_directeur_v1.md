# GRAND PLAN DIRECTEUR V1
## Cartographie architecturale officielle — Caméléon Engine
### Date de référence : 2026-07-06 — Version certifiée et gelée

---

## PARTIE I — ARCHITECTURE DU PROJET

---

### 1.1 — Cartographie de haut niveau

La structure de Caméléon Engine s'organise en neuf niveaux descendants. Chaque niveau est subordonné à celui qui le précède.

```
╔══════════════════════════════════════════════════════╗
║  VISION                                              ║
║  "Un miroir qui se souvient"                         ║
║  Cockpit cognitif · miroir lucide · présence calme   ║
╚══════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════╗
║  DOCTRINES                                           ║
║  Lecture ≠ Action · Language System V1               ║
║  Memory Doctrine · OI V1 · Pattern Reflection        ║
║  Mémoire Vivante V1 · Gouvernance V1                 ║
╚══════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════╗
║  ARCHITECTURE CONCEPTUELLE                           ║
║  Familles mémoire · 10 invariants · Frontières       ║
║  Dictionnaire officiel · Hiérarchie système          ║
╚══════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════╗
║  ARCHITECTURES TECHNIQUES                            ║
║  Pipeline V1 · Pipeline V2 · Behavioral pipeline     ║
║  Storage contract · Account architecture             ║
╚══════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════╗
║  MOTEURS                                             ║
║  Décisionnel · Comportemental · OI V1                ║
║  Parser · Confiance · Pattern · Coaching             ║
║  Macro · Mémoire · Pipeline V2                       ║
╚══════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════╗
║  OUTILS D'ENTRÉE                                     ║
║  CSV · XLSX · PDF · Formulaire                       ║
║  [Journal · Wallet Intelligence · GPT Vision]        ║
╚══════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════╗
║  FAMILLES MÉMOIRE                                    ║
║  5 sources (S1-S5) · 4 synthèses (SY1-SY4)          ║
║  3 couches (L1-L3) · Référentiel                     ║
╚══════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════╗
║  INTERFACES                                          ║
║  Cockpit (4 zones) · Onglet Mémoire · Pilotage       ║
║  Constellium · Behavioral sidebar · Debug Brain      ║
╚══════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════╗
║  UTILISATEUR                                         ║
║  Autorité finale — décision toujours humaine         ║
╚══════════════════════════════════════════════════════╝
```

---

### 1.2 — Explication de chaque niveau

| Niveau | Question centrale | Fréquence de changement |
|---|---|---|
| **Vision** | Pourquoi le produit existe. La boussole ultime. | Rarement — des années |
| **Doctrines** | Quels principes devront toujours être respectés. | Lentement — évolution consciente |
| **Architecture Conceptuelle** | Comment la vision est structurée en familles, invariants, dictionnaire. | Lentement — décisions explicites |
| **Architectures techniques** | Comment les doctrines se traduisent en pipelines et contrats de code. | Peut évoluer sans changer les doctrines |
| **Moteurs** | Les composants actifs qui transforment des entrées en sorties structurées. | Évoluent avec les chantiers |
| **Outils d'entrée** | Les instruments par lesquels l'information entre dans le système. | Ajout possible, suppression rare |
| **Familles mémoire** | Les espaces de stockage structuré où la mémoire est organisée et accumulée. | Structure stable — contenu croît avec l'usage |
| **Interfaces** | Ce que l'utilisateur voit et touche. | Évoluent avec l'UX |
| **Utilisateur** | L'autorité finale. La couche terminale de toute décision. | Immuable par principe |

**Règle de subordination :** une couche inférieure ne peut jamais modifier une couche supérieure. En cas de conflit, la couche supérieure fait toujours autorité. C'est la règle de la Doctrine de Gouvernance V1.

---

### 1.3 — Hiérarchie de gouvernance vs hiérarchie système

Ces deux hiérarchies coexistent dans Caméléon Engine. Les confondre est une erreur architecturale.

**Hiérarchie de gouvernance** — concerne les décisions :

```
Vision → Doctrine → Architecture → Roadmap → Implémentation
```

Elle répond à : *qui a le droit de décider quoi, et dans quel ordre.*

**Hiérarchie système** — concerne le traitement de l'information :

```
Sources → Pipeline → Mémoire → Moteurs → Connaissance → Synthèse → Décision humaine
```

Elle répond à : *comment une donnée brute devient une mémoire exploitable.*

**Pourquoi la distinction est essentielle :**

Un développeur qui confond les deux peut croire qu'un moteur de niveau inférieur (Implémentation) a le droit de modifier la Vision parce qu'il est en tête du pipeline système. Ce n'est pas le cas. Les deux hiérarchies opèrent sur des axes indépendants et ne se substituent pas.

**Note d'exécution :** la hiérarchie système est conceptuelle, pas séquentielle. Les Moteurs sont actifs pendant le pipeline de traitement, pas uniquement après que la mémoire est écrite. La couche Moteurs et la couche Pipeline s'interleuvent dans la réalité d'exécution. Le schéma en Partie XII donne la lecture d'exécution réelle du système.

---

## AUTO-VÉRIFICATION — PARTIE I

**Doublons :** Aucun. La pyramide (1.1), la table d'explication (1.2) et la distinction de hiérarchies (1.3) couvrent trois angles distincts sans se répéter.

**Cohérence doctrinale :**
- La règle de subordination (1.2) est alignée avec la Doctrine de Gouvernance V1.
- L'Utilisateur en position terminale est aligné avec l'invariant I-02 (Autorité humaine) et le principe fondateur du manifesto.
- La distinction gouvernance / système est alignée avec l'Architecture Conceptuelle Fondatrice V1 (§ "Deux hiérarchies distinctes").
- Aucun mot prescriptif. Aucune action recommandée.

**Ce que cette partie ne couvre pas intentionnellement :** le contenu de chaque bloc (renvoyé à la Partie II), les détails des familles mémoire (renvoyés à la Partie V), les moteurs (renvoyés à la Partie IV).


---

**Observations architecturales notées (non bloquantes) :**
- *OA-01 :* Dissocier "Outils" et "Familles mémoire" dans la pyramide — deux natures distinctes (instruments d'entrée vs espaces de stockage structuré).
- *OA-02 :* La hiérarchie système "Sources → Pipeline → Mémoire → Moteurs" mériterait vérification — les moteurs opèrent pendant le pipeline, pas après la mémoire.

Ces observations seront intégrées lors de la Phase 5 (audit global), avant le gel.

---

# GRAND PLAN DIRECTEUR V1

## PARTIE II — INVENTAIRE DES BLOCS EXISTANTS

*Format par bloc : rôle · chemin · produit · consomme · famille mémoire enrichie · niveau gouvernance · statut.*
*Les détails opérationnels de chaque catégorie (flux, moteurs, outils) sont développés dans les Parties III à VI.*

---

### 2.1 — Blocs Vision / Doctrine

---

**Manifesto**
- Rôle : Document fondateur absolu. Définit ce que le produit est et n'est pas. Tranche tout doute produit.
- Chemin : `docs/manifesto-cameleon-engine.md`
- Produit : Principe directeur unique — "Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre."
- Consomme : Rien. Source première, non dérivée.
- Famille mémoire : Filtre architectural — ne nourrit aucune famille, contraint toutes les décisions.
- Gouvernance : N0 — Vision fondatrice
- Statut : RÉFÉRENCE PERMANENTE

---

**IDENTITY V1**
- Rôle : Point d'entrée synthétique. Concentre le principe fondateur, le modèle cognitif, la hiérarchie doctrinale et les tests de conformité.
- Chemin : `docs/doctrine/IDENTITY_V1.md`
- Produit : Résumé opérationnel de la doctrine N0-N2 pour tout nouvel intervenant.
- Consomme : Manifesto · Language System V1 · Lecture ≠ Action
- Famille mémoire : SY2 Identitaire (définit le caractère du produit)
- Gouvernance : N1 — Doctrine identité
- Statut : RÉFÉRENCE ACTIVE

---

**Language System V1**
- Rôle : Doctrine linguistique complète. Mots bannis, reformulations types, règles par couche, grille de conformité.
- Chemin : `docs/doctrine/cameleon_engine_language_system_v1.md`
- Produit : Source de vérité pour tout texte visible utilisateur.
- Consomme : Manifesto (§VIII Manière de parler)
- Famille mémoire : SY2 Identitaire
- Gouvernance : N2 — Doctrine
- Statut : RÉFÉRENCE ACTIVE — s'applique à tout texte UI sans exception

---

**Lecture ≠ Action**
- Rôle : Doctrine du modèle cognitif officiel. Interdit que le moteur prescrive. Garantit que la décision reste humaine.
- Chemin : `docs/doctrine/lecture_not_equal_action.md`
- Produit : Modèle Lecture → Compréhension → Décision humaine · 10 tests de conformité
- Consomme : Manifesto (§III principe d'autonomie préservée)
- Famille mémoire : Filtre architectural
- Gouvernance : N2 — Doctrine
- Statut : RÉFÉRENCE ACTIVE

---

**Memory Doctrine V1**
- Rôle : Règles de ce que la mémoire comportementale peut et ne peut pas faire (retenir, comparer, décrire — jamais conseiller, prédire, expliquer).
- Chemin : `docs/doctrine/memory_doctrine_v1.md`
- Produit : 3 opérations autorisées · 5 tests de conformité mémoire
- Consomme : Lecture ≠ Action (extension directe)
- Famille mémoire : Filtre architectural sur SY1 Comportementale
- Gouvernance : N2 — Doctrine
- Statut : RÉFÉRENCE ACTIVE

---

**Pattern Reflection Doctrine V1**
- Rôle : Étend la Memory Doctrine aux motifs comportementaux. Motifs ≠ profils. Interdit la fusion mémoire comportementale / lecture marché.
- Chemin : `docs/doctrine/pattern_reflection_doctrine_v1.md`
- Produit : Règles de restitution des patterns
- Consomme : Memory Doctrine V1
- Famille mémoire : Filtre architectural sur SY1 Comportementale
- Gouvernance : N2 — Doctrine
- Statut : RÉFÉRENCE ACTIVE

---

**Operator Intelligence V1 (doctrine)**
- Rôle : Définit ce qu'un moteur peut légitimement dire d'un opérateur à partir de ses comportements observables. 4 dimensions, niveaux de confiance, 5 frontières épistémiques, 5 anti-dérives.
- Chemin : `docs/doctrine/operator_intelligence_v1.md`
- Produit : Périmètre légitime de l'OI V1 · règles linguistiques · règle de non-fusion avec le moteur décisionnel
- Consomme : Lecture ≠ Action · Memory Doctrine V1 · Language System V1
- Famille mémoire : Filtre architectural sur SY2 Identitaire · SY3 Décisionnelle
- Gouvernance : N2 — Doctrine
- Statut : RÉFÉRENCE ACTIVE

---

**Mémoire Vivante V1**
- Rôle : Pivot stratégique fondamental. Le produit passe de moteur d'analyse à moteur de mémoire. Pose le filtre architectural permanent : "Cette fonctionnalité enrichit-elle durablement la mémoire du décideur ?"
- Chemin : `memory/project_memoire_vivante_v1_doctrine.md`
- Produit : 6 familles de mémoire (ancienne nomenclature, remplacée par 5+4+3+Référentiel) · filtre architectural · modèle Premium
- Consomme : Manifesto · Architecture Conceptuelle Fondatrice V1
- Famille mémoire : Filtre architectural sur l'ensemble du système
- Gouvernance : N1-N2 — Vision + Doctrine
- Statut : EN MATURATION — aucune implémentation démarrée · Notion publication différée

---

**Gouvernance V1**
- Rôle : Hiérarchie officielle Vision → Doctrine → Architecture → Roadmap → Implémentation. Règles de non-descente automatique entre niveaux.
- Chemin : `memory/project_gouvernance_v1_doctrine.md`
- Produit : 5 niveaux · règle de subordination · principe de remise en question
- Consomme : Rien — doctrine fondatrice indépendante
- Famille mémoire : Filtre architectural
- Gouvernance : N2 — Doctrine
- Statut : ACTIVE

---

### 2.2 — Blocs Architecture Conceptuelle

---

**Architecture Conceptuelle Fondatrice V1**
- Rôle : Document fondateur de la vision système. "Un miroir qui se souvient." Pose le dictionnaire officiel, les familles mémoire (5+4+3+Référentiel), les 10 invariants, les frontières et les responsabilités des moteurs.
- Chemin : `memory/project_architecture_conceptuelle_fondatrice_v1.md`
- Produit : Dictionnaire 15 termes · structure mémoire validée · 10 invariants · 9 frontières · 11 responsabilités moteurs · Q1/Q2/Q3 validées
- Consomme : Manifesto · Mémoire Vivante V1 · toutes les doctrines N2
- Famille mémoire : Filtre architectural — structure toutes les familles
- Gouvernance : N1-N2 — Vision + Doctrine (en maturation)
- Statut : ACTIVE — pas d'implémentation démarrée

---

**État Canonique du Moteur 2026**
- Rôle : Source de vérité technique sur les états, engagements, guards et comportements du pipeline décisionnel.
- Chemin : `docs/architecture/canonical_motor_state_2026.md`
- Produit : États comportementaux officiels (Ancré / Veille Active / Friction / Dérive / Rupture) · pressureLevel · riskLevel · règles de merge effectiveLevel
- Consomme : Code source réel (commit `aacfad1`)
- Famille mémoire : Référentiel technique (infrastructure)
- Gouvernance : N3 — Architecture technique
- Statut : ACTIF — référence canonique · mis à jour post-refactorisation juin 2026

---

**Constellium V1 (définition)**
- Rôle : Définition officielle de ce que le Constellium est et n'est pas. "Visualisation des liens entre les traces du décideur."
- Chemin : `docs/architecture/constellium/constellium_v1_definition.md`
- Produit : Définition positive et négative · règles de langage autorisé · spec étoiles V1 et liens V1
- Consomme : Language System V1 · Memory Doctrine V1 · données sessions et snapshots
- Famille mémoire : L2 Relationnelle
- Gouvernance : N3 — Architecture
- Statut : SCELLÉ · gelé jusqu'aux conditions §13 de position_audit

---

### 2.3 — Blocs Techniques (modules implémentés)

---

**Moteur Décisionnel + Pipeline V1**
- Rôle : Pipeline principal — transforme 16 inputs formulaire en décision structurée.
- Chemin : `src/js/engine.js` · `decision.js` · `trading-policy.js` · `moteur.js` · `market-state.js` · `confidence-score.js`
- Produit : Payload (score · posture · engagement · tradingStatus · actions autorisées/interdites)
- Consomme : 16 champs formulaire déclarés par l'opérateur
- Famille mémoire : S5 Contextuelle (snapshots persistés)
- Gouvernance : N5 — Implémentation
- Statut : STABLE — production

---

**Pipeline V2**
- Rôle : Couche analytique parallèle au pipeline V1. Analyse cohérence, hiérarchie, attention, exposition.
- Chemin : `src/js/v2/pipeline-v2.js` · `coherence.js` · `hierarchy.js` · `attention.js` · `exposition.js` · `flags.js`
- Produit : tensionMap (P1) · hierarchyResult (P2) · attentionResult (P3) · expositionResult/message cockpit (P4)
- Consomme : Payload V1
- Famille mémoire : Aucune — couche de lecture uniquement
- Gouvernance : N5 — Implémentation
- Statut : Phases 1-4 actives · Phase 6 (calibration) non démarrée · visible Debug Brain + message cockpit P4

---

**Behavioral Engine**
- Rôle : Module comportemental isolé. Analyse CSV/XLSX pour produire un scoring comportemental. Isolation stricte — ne lit aucune donnée du moteur principal.
- Chemin : `src/js/behavior/` (module complet)
- Produit : Score 0-100 · label (Discipliné / Réactif / Impulsif / Agressif) · patterns · coaching · sessions persistées · guardLevel
- Consomme : Fichiers CSV Trade History · Fichiers XLSX
- Famille mémoire : SY1 Comportementale · SY4 D'apprentissage (partiel)
- Gouvernance : N5 — Implémentation
- Statut : OPÉRATIONNEL · boucle mémoire V1 complète (W1/W2 · moyenne · distribution)

---

**Operator Intelligence V1 (implémentation)**
- Rôle : Calcule 4 dimensions du style opérateur (Exécution, Capital, Portefeuille, Cadence) avec niveaux de confiance.
- Chemin : `src/js/behavior/analytics/oi-cadence.js` · `oi-capital.js` · `oi-portefeuille.js` · `order-analyzer.js` · `behavior/storage/oi-history-repo.js`
- Produit : 4 dimensions + niveaux de confiance · persistance dans `CE_oi_history_v1`
- Consomme : Order History (PDF normalisé) · Trade History (CSV/XLSX)
- Famille mémoire : SY2 Identitaire · SY3 Décisionnelle
- Gouvernance : N5 — Implémentation
- Statut : MOTEUR CALCULÉ · persistance active · UI dédiée absente (blanc majeur)

---

**Macro Layer**
- Rôle : Couche contextuelle narrative. Répond à : "Dans quel environnement l'opérateur prend-il ses décisions ?" Overlay narratif uniquement — aucun impact sur le score.
- Chemin : `src/js/macro-context.js`
- Produit : Suffixe narratif conditionnel sur le message Confiance
- Consomme : 2 champs formulaire (`dominanceMacro` · `desordreStructurel`) + message base Confidence Panel
- Famille mémoire : S5 Contextuelle (enrichissement futur — Phase 2+ non démarrée)
- Gouvernance : N5 — Implémentation Phase 1
- Statut : PHASE 1 CLÔTURÉE · commits `877d678` + `78d2455` · invariant MACRO-RULE-01 respecté

---

### 2.4 — Blocs Outils (imports, sources de données)

---

**CSV Import**
- Rôle : Import du fichier Trade History Binance en format CSV.
- Chemin : `src/js/behavior/import/parser.js` · `behavior/normalize/`
- Produit : Trades normalisés → Behavioral Engine → OI V1 (Trade History)
- Consomme : Fichier CSV brut (Binance Trade History)
- Famille mémoire : S1 Transactionnelle
- Gouvernance : N5 — Implémentation
- Statut : OPÉRATIONNEL

---

**XLSX Import**
- Rôle : Import du fichier Trade History en format Excel.
- Chemin : `src/js/behavior/import/` · `src/js/vendor/` (lib XLSX)
- Produit : Trades normalisés → Behavioral Engine (même pipeline que CSV)
- Consomme : Fichier XLSX brut
- Famille mémoire : S1 Transactionnelle
- Gouvernance : N5 — Implémentation
- Statut : OPÉRATIONNEL

---

**PDF Import V1**
- Rôle : Import du fichier Order History Binance en format PDF. Source primaire pour OI V1 (dimensions Exécution et Capital — ordres posés, annulés inclus).
- Chemin : `src/js/behavior/import/pdf-*.js` · `src/js/vendor/` (lib PDF)
- Produit : Order History normalisé → OI V1
- Consomme : Fichier PDF brut (Binance Order History FR 2026)
- Famille mémoire : S1 Transactionnelle
- Gouvernance : N5 — Implémentation
- Statut : CLOS — mode maintenance · ne pas rouvrir sauf régression

---

### 2.5 — Blocs Infrastructure (storage, compte, déploiement)

---

**Storage (couche de persistance)**
- Rôle : Contrat architectural central. Toute persistance passe par ce module. Accesseurs typés pour chaque clé localStorage.
- Chemin : `src/js/storage.js`
- Produit : Accesseurs (formState · history · behaviorMemory · identity · account · onboarding · etc.)
- Consomme : localStorage navigateur
- Famille mémoire : Infrastructure — sert toutes les familles
- Gouvernance : N5 — Implémentation
- Statut : STABLE · renforcé LOT-H02 (P3 : onboarding accessor + QuotaExceededError absorbé)

---

**Compte Utilisateur V1**
- Rôle : Authentification Magic Link + synchronisation cloud des préférences utilisateur.
- Chemin : `src/js/account/` (8 fichiers : init · service · ui · cloud · sync · config · events · storage)
- Produit : Session authentifiée · export/import/purge de 12 clés localStorage · sync OVH
- Consomme : Supabase Auth · localStorage
- Famille mémoire : SY2 Identitaire (identifiant persistant)
- Gouvernance : N5 — Implémentation
- Statut : QUALIFIÉ · LOT 1-3 validés terrain iPad Chrome et PC Chrome

---

**Déploiement OVH**
- Rôle : Infrastructure de déploiement statique. Héberge le front-end et reçoit les syncs cloud.
- Chemin : `docs/deployment/ovh-static-deployment-v1.md` · `serve-local.ps1`
- Produit : Application accessible en production
- Consomme : Build statique (HTML + JS + CSS — zero dépendance)
- Famille mémoire : Infrastructure
- Gouvernance : N5 — Implémentation
- Statut : ACTIF en production

---

### 2.6 — Blocs Interface (cockpit, constellium, sidebar)

---

**Cockpit (Interface principale)**
- Rôle : Rendu DOM complet de l'expérience utilisateur. Point de convergence de tous les moteurs.
- Chemin : `src/js/render.js` (~5200 lignes) · `src/index.html` · `src/css/style.css`
- Produit : 4 zones affichées (Marché · Setup · Comportemental · Confiance) · historique · onglet Pilotage · onglet Mémoire · Debug Brain
- Consomme : Payload V1 + V2 · behavioral guardLevel · localStorage · macro overlay
- Famille mémoire : Interface — restitue, ne stocke pas
- Gouvernance : N5 — Implémentation
- Statut : STABLE · point de fragilité architecturale (voir Partie X)

---

**Constellium V1 (interface)**
- Rôle : Visualisation des liens entre les traces du décideur.
- Chemin : `src/index.html` (tab Mémoire — section Constellium) · `src/css/style.css`
- Produit : Carte de constellation des traces · liens entre sessions, snapshots, patterns
- Consomme : Sessions comportementales · snapshots moteur · comparaisons W1/W2
- Famille mémoire : L2 Relationnelle (révèle les connexions)
- Gouvernance : N5 — Implémentation
- Statut : SCELLÉ · commit `d5719d9` · anti-doublon fingerprint

---

**Behavioral Sidebar**
- Rôle : Panneau latéral comportemental. Affiche le scoring comportemental, les patterns détectés, la mémoire W1/W2.
- Chemin : `src/js/behavior/ui/behavior-view.js` · `src/css/behavior.css`
- Produit : Affichage score + label + patterns + coaching + historique sessions
- Consomme : Output Behavioral Engine + memory-computer.js
- Famille mémoire : SY1 Comportementale (restitution)
- Gouvernance : N5 — Implémentation
- Statut : OPÉRATIONNEL

---

**Corpus Cognitif (documentation)**
- Rôle : Base documentaire des concepts comportementaux et cognitifs du domaine (~50 concepts : biais, patterns, états, transitions, structures de marché).
- Chemin : `docs/cognitive/` (concepts · grammar · taxonomy · patterns · macro-climates · market-structures)
- Produit : Définitions canoniques · grammaire comportementale · taxonomie
- Consomme : Littérature comportementale + observations terrain
- Famille mémoire : Futur Référentiel infrastructure (Q2 validée — Architecture Conceptuelle V1)
- Gouvernance : N3 — Architecture (connaissance du domaine)
- Statut : EXISTANT mais non connecté au code · deviendra Référentiel infrastructure (sans urgence)

---

## AUTO-VÉRIFICATION — PARTIE II

**Doublons internes :**
OI V1 apparaît deux fois (doctrine en 2.1, implémentation en 2.3). C'est intentionnel et justifié — les deux blocs sont de nature distincte (règles vs code). Constellium V1 apparaît deux fois (architecture en 2.2, interface en 2.6) pour la même raison. Aucun doublon non voulu.

**Informations reportées intentionnellement :**
Les détails des flux (comment les blocs s'enchaînent) → Partie III. Les responsabilités précises de chaque moteur → Partie IV. Le contenu des familles mémoire → Partie V. Les valeurs produites par chaque outil → Partie VI. Les statuts documentaires détaillés → Partie VII.

**Cohérence doctrinale :**
Aucun bloc n'est décrit comme "décidant" à la place de l'utilisateur. Les doctrines sont présentées comme des filtres et non comme des fonctionnalités. La distinction doctrine / implémentation d'OI V1 est explicite. Le Corpus Cognitif est décrit comme "deviendra Référentiel" — aligné avec la Q2 validée.

**Couverture :**
19 blocs recensés. Wallet Intelligence est absent car l'infrastructure est trop minimale pour constituer un bloc autonome — il apparaîtra en Partie VIII (Blancs) et Partie XI (Futurs piliers).


---

**Observations OA-03 et OA-04 notées pour l'audit global.**

---

# GRAND PLAN DIRECTEUR V1

## PARTIE III — CARTOGRAPHIE DES FLUX

*Cette partie décrit comment circule l'information à travers le système.*
*Elle ne redécrit pas les blocs (Partie II) ni les détails des moteurs (Partie IV).*
*Pour chaque flux : entrée → transformations → sortie → famille mémoire enrichie.*

---

### 3.1 — Flux CSV Trade History

**Entrée :** Fichier CSV brut (Binance Trade History)

```
Fichier CSV
  ↓
format-detector.js          détecte le format (CSV / XLSX)
  ↓
parser.js                   parse les lignes brutes
  ↓
normalize/canonical.js      normalise vers le format canonique
  ↓
analytics/metrics.js        calcule les métriques (win rate, drawdown, cadence…)
  ↓
analytics/patterns.js       détecte les patterns comportementaux
                            (overtrading · rapid_reentry · tilt_sequence…)
  ↓
analytics/scoring.js        produit score 0-100 + label
                            (Discipliné / Réactif / Impulsif / Agressif)
  ↓
analytics/coaching.js       traduit en message lisible (Language System V1)
  ↓
behavior-view.js            render DOM + écrit guardLevel en localStorage
  ↓
session-repo.js             persiste la session (CE_behavior_sessions_v1 · FIFO 50)
  ↓
render.js                   lit guardLevel → effectiveLevel = max(instantLevel, historicalLevel)
  ↓
Cockpit — zone Comportemental    état affiché (Ancré / Veille Active / Friction / Dérive / Rupture)
```

**Familles mémoire enrichies :** SY1 Comportementale · SY4 D'apprentissage (partielle — coaching uniquement, boucle complète absente)

**Note :** Le flux XLSX suit exactement le même chemin à partir de `format-detector.js`. Seule la lecture initiale du fichier diffère (lib XLSX en lieu et place du parser CSV).

---

### 3.2 — Flux PDF Order History (Operator Intelligence V1)

**Entrée :** Fichier PDF brut (Binance Order History FR)

```
Fichier PDF
  ↓
pdf-loader.js               charge le PDF (lib tiers)
  ↓
pdf-family-detector.js      détecte la famille
                            (ORDER_HISTORY / TRADE_HISTORY)
  ↓
pdf-table-extractor.js      extrait le tableau structuré
  ↓
pdf-normalizer.js           normalise vers le format canonique d'ordres
  ↓
order-analyzer.js           calcule :
                            cancel rate · ratio limit/market
                            fragmentation · pattern cancel-replace
  ↓
  ├─ oi-capital.js          dimension Capital (concentré / diversifié / rotatif)
  ├─ oi-cadence.js          dimension Cadence (continue / burst / périodique)
  └─ oi-portefeuille.js     dimension Portefeuille (thématique / opportuniste / multi)
  ↓
oi-history-repo.js          persiste les résultats (CE_oi_history_v1)
  ↓
[UI dédiée — absente]       les 4 dimensions sont calculées et persistées
                            mais non visibles par l'opérateur
```

**Familles mémoire enrichies :** SY2 Identitaire · SY3 Décisionnelle

**Blanc de flux :** La chaîne est complète jusqu'à la persistance. Elle est interrompue avant la restitution. L'opérateur ne peut pas consulter son style OI V1 actuellement.

---

### 3.3 — Flux Formulaire Moteur (pipeline décisionnel)

**Entrée :** 16 champs formulaire déclarés par l'opérateur

```
16 champs formulaire
  ↓
market-state.js             mapLegacyMarketState()
                            → state:modifier string
  ↓
engine.js baseEngine()      score brut 0-100 + signaux attack / sniper
  ↓
engine.js profileMatrix()   filtre par profil (PASSIVE / BALANCED / ACTIVE)
  ↓
engine.js applyAdaptiveFilter()   modulation needAction × coreOrders
  ↓
engine.js applyValidation()       verrou humain
                                  (accepted / pending / adjusted / rejected)
  ↓
trading-policy.js           computeTradingPolicy()
                            → actions autorisées / interdites
  ↓
engine.js buildPayload()    payload final :
                            score · posture · engagement · tradingStatus
                            pressureLevel · riskLevel
  ↓
  ├─ v2/pipeline-v2.js      runV2() en parallèle :
  │    tensionMap (P1)
  │    hierarchyResult (P2)
  │    attentionResult (P3)
  │    expositionResult / message cockpit (P4)
  │
  └─ render.js              injection DOM — 4 zones cockpit
                            + merge effectiveLevel (comportemental)
                            + overlay macro (si contexte actif)
  ↓
Cockpit (4 zones)           Marché · Setup · Comportemental · Confiance
  ↓
state.js + storage.js       snapshot persisté (historique · max 50)
```

**Familles mémoire enrichies :** S5 Contextuelle (snapshots formulaire)

**Note :** Ce flux ne touche pas les familles comportementales (SY1, SY2, SY3). Il décrit l'état du marché et de l'opérateur dans l'instant — pas son histoire.

---

### 3.4 — Flux Macro Layer

**Entrée :** 2 champs formulaire déclarés (`dominanceMacro` · `desordreStructurel`)

```
Champs dominanceMacro / desordreStructurel déclarés
  ↓
moteur.js runMoteur()       transmet macroState au cycle de rendu
  ↓
macro-context.js            applyMacroOverlay()
                            si contexte actif → suffixe narratif ajouté
                            si inactif → message base retourné intact
  ↓
render.js — zone Confiance  message affiché (avec ou sans suffixe)
  ↓
[Score · posture · actions : strictement inchangés — MACRO-RULE-01]
```

**Familles mémoire enrichies :** Aucune actuellement. S5 Contextuelle visée en Phase 2+ (non démarrée).

**Invariant de flux :** Ce flux est strictement narratif. Il ne peut jamais modifier une variable du payload. Toute évolution qui briserait cet invariant violerait MACRO-RULE-01.

---

### 3.5 — Flux Compte Utilisateur

**Entrée :** Email saisi par l'opérateur

```
Email saisi
  ↓
account-ui.js               validation email (regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ↓
account-service.js          envoi Magic Link via Supabase Auth
                            + _mapSendError() si échec (jamais de message brut)
  ↓
[Opérateur clique le lien reçu par email]
  ↓
account-service.js          verifyMagicLink()
                            getSession() + .catch() (comportement optimiste réseau)
  ↓
account-init.js             session locale établie
  ↓
account-cloud.js            synchronisation LOT 3 :
account-sync.js             12 clés localStorage → OVH
  ↓
account-storage.js          persistance état compte local
```

**Familles mémoire enrichies :** SY2 Identitaire (identifiant persistant cross-device)

**Principe de flux :** Comportement optimiste réseau — une erreur Supabase ou une coupure réseau ne déconnecte pas l'opérateur. L'état existant est conservé jusqu'à preuve contraire.

---

## AUTO-VÉRIFICATION — PARTIE III

**Doublons internes :**
XLSX est traité comme note au sein du flux CSV, sans section distincte — leur pipeline est identique à partir du format-detector. Pas de répétition inutile.

**Doublons avec la Partie II :**
Les descriptions de rôle des blocs ne sont pas répétées. Chaque flux nomme les composants mais décrit leur enchaînement, pas leur nature. Le chemin de fichier n'est pas répété ici — il reste en Partie II.

**Doublons avec la Partie IV :**
Les responsabilités unitaires des moteurs (ce qu'ils font, ce qu'ils ne font jamais) sont réservées à la Partie IV. Ici seul le transit de l'information est décrit.

**Cohérence doctrinale :**
Flux 3 (formulaire) : la décision reste dans le cockpit — l'opérateur est la couche terminale. Flux 4 (macro) : l'invariant MACRO-RULE-01 est rappelé explicitement. Flux 2 (OI V1) : le blanc de flux est identifié sans proposition d'implémentation.

**Couverture :**
5 flux couverts. Les flux futurs (Journal, GPT Vision, Wallet, Corrélateur) sont absents intentionnellement — ils n'existent pas encore et seront traités en Partie VIII (Blancs) et Partie IX (Dépendances).


---

# GRAND PLAN DIRECTEUR V1

## PARTIE IV — INVENTAIRE DES MOTEURS

*Pour chaque moteur : responsabilité unique · entrées · sorties · ce qu'il ne fait jamais · ce qu'il délègue.*
*Les flux d'enchaînement sont en Partie III. Les descriptions de blocs sont en Partie II.*

---

### 4.1 — Moteur Décisionnel

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Transformer 16 inputs formulaire en décision structurée (payload). |
| **Entrées** | 16 champs formulaire déclarés par l'opérateur (état marché, profil, validation humaine, contexte macro). |
| **Sorties** | `payload` : score 0-100 · posture (PASSIVE / BALANCED / ACTIVE) · engagement (FULL / REDUCED / NONE) · tradingStatus · pressureLevel · actions autorisées/interdites. |
| **Ne fait jamais** | Ne donne pas d'ordre. Ne prescrit pas d'action. Ne lit pas les données comportementales historiques (OI V1, sessions). Ne lit pas de source externe. |
| **Délègue à** | `trading-policy.js` pour le calcul des actions · `render.js` pour l'affichage · `state.js` + `storage.js` pour la persistance du snapshot. |

---

### 4.2 — Moteur Comportemental (scoring)

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Calculer un score comportemental et un label à partir des trades exécutés (Trade History). |
| **Entrées** | Trades normalisés (output de `canonical.js`) — exclusivement issus de fichiers CSV ou XLSX. |
| **Sorties** | Score 0-100 · label (Discipliné / Réactif / Impulsif / Agressif) · métriques (win rate, drawdown, cadence, sizing). |
| **Ne fait jamais** | Ne fusionne pas avec la lecture du payload décisionnel. Ne consulte pas l'Order History. Ne produit pas de recommandation. Ne nomme pas l'opérateur avec une étiquette identitaire permanente. |
| **Délègue à** | `patterns.js` pour la détection de patterns · `coaching.js` pour la restitution · `session-repo.js` pour la persistance. |

---

### 4.3 — Moteur Operator Intelligence V1

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Calculer 4 dimensions du style opérateur (Exécution, Capital, Portefeuille, Cadence) avec niveaux de confiance explicites, à partir des ordres posés. |
| **Entrées** | Order History normalisé (ordres posés, annulés inclus — PDF) · Trade History (fills — CSV/XLSX) en complément. |
| **Sorties** | 4 dimensions avec niveau de confiance (Élevé / Moyen / Faible / Indisponible) · persistées dans `CE_oi_history_v1`. |
| **Ne fait jamais** | Ne produit pas de profil unique global. Ne prédit pas le comportement futur. N'alimente jamais `buildPayload()`. Ne fusionne pas avec le moteur décisionnel. Ne dépasse pas les frontières épistémiques de la doctrine OI V1. |
| **Délègue à** | `oi-history-repo.js` pour la persistance · [UI dédiée future] pour la restitution. |

---

### 4.4 — Moteur Parser (import)

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Transformer un fichier brut (CSV, XLSX ou PDF) en structures de données normalisées au format canonique. |
| **Entrées** | Fichier binaire ou texte brut (Binance Trade History CSV/XLSX · Order History PDF). |
| **Sorties** | Tableaux d'objets normalisés (trades ou ordres) conformes au format canonique. |
| **Ne fait jamais** | Ne calcule pas de métriques. Ne score pas. Ne persiste pas directement. Ne prend pas de décision sur la qualité des données. |
| **Délègue à** | `canonical.js` pour la normalisation · `metrics.js` ou `order-analyzer.js` pour le calcul aval. |

---

### 4.5 — Moteur Pattern Detection

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Détecter les patterns comportementaux récurrents dans les trades normalisés. |
| **Entrées** | Trades normalisés (output de `canonical.js`). |
| **Sorties** | Liste de patterns détectés avec intensité (overtrading · rapid_reentry · tilt_sequence · derive_sizing · etc.). |
| **Ne fait jamais** | Ne prescrit pas de correction. Ne nomme pas l'opérateur. Ne fusionne pas un pattern avec une lecture de marché. Ne produit pas de profil (Pattern Reflection Doctrine V1). |
| **Délègue à** | `coaching.js` pour la traduction en langage · `behavior-view.js` pour l'affichage. |

---

### 4.6 — Moteur Coaching

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Traduire le score comportemental et les patterns détectés en message lisible, factuel, conforme au Language System V1. |
| **Entrées** | Score · label · patterns détectés · contexte session. |
| **Sorties** | Message textuel conforme : factuel, sans prescription, sans jugement, avec action aucune. |
| **Ne fait jamais** | Ne dit pas quoi faire. Ne juge pas la qualité des décisions. Ne flatte pas. N'utilise pas les mots bannis (Language System V1). Ne produit pas de verdict global sur l'opérateur. |
| **Délègue à** | `behavior-view.js` pour l'affichage. |

---

### 4.7 — Moteur Confiance (Confidence Score)

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Calculer la lisibilité de la situation marché à partir de 4 dimensions pondérées. |
| **Entrées** | Valeurs formulaire : trend (30%) · structure (30%) · volatilité (25%) · volume (15%). |
| **Sorties** | Score de confiance pondéré → modulation du niveau affiché dans la zone Confiance du cockpit. |
| **Ne fait jamais** | Ne lit pas les données comportementales historiques. Ne prescrit pas d'entrée en position. Ne prédit pas. |
| **Délègue à** | `render.js` pour l'intégration dans le message final du Confidence Panel (avec overlay macro si actif). |

---

### 4.8 — Moteur Mémoire Comportementale

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Agréger, comparer et restituer l'évolution comportementale sur la durée (W1/W2, moyenne, distribution). |
| **Entrées** | Sessions comportementales persistées (`CE_behavior_sessions_v1`). |
| **Sorties** | Comparaison W1/W2 · moyenne historique · distribution des labels · `guardLevel` écrit en localStorage (TTL 7 jours). |
| **Ne fait jamais** | Ne conseille pas. Ne prédit pas. Ne fusionne pas avec la lecture marché (Memory Doctrine V1). Ne présente pas une évolution comme un fait accompli si elle n'est pas vérifiable. |
| **Délègue à** | `render.js` pour la lecture du `guardLevel` → calcul de l'`effectiveLevel` cockpit. |

---

### 4.9 — Moteur Macro Overlay

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Ajouter un suffixe narratif contextuel au message Confiance si un contexte macro est déclaré actif. |
| **Entrées** | Message base (Confidence Panel) · `macroState` (`dominanceMacro` · `desordreStructurel`). |
| **Sorties** | Message enrichi d'un suffixe contextuel — ou message identique si aucun contexte actif. |
| **Ne fait jamais** | N'influence jamais le score. Ne modifie jamais la posture, l'engagement, les actions ou le `tradingStatus`. Ne lit pas les données comportementales. |
| **Délègue à** | `render.js` pour l'affichage du message enrichi dans la zone Confiance. |

---

### 4.10 — Moteur Pipeline V2

| Champ | Contenu |
|---|---|
| **Responsabilité unique** | Produire une analyse multi-dimensionnelle de cohérence, hiérarchie, attention et exposition en couche parallèle au pipeline V1. |
| **Entrées** | Payload V1 complet (output de `buildPayload()`). |
| **Sorties** | `tensionMap` (P1) · `hierarchyResult` (P2) · `attentionResult` (P3) · `expositionResult` + message cockpit actif (P4). |
| **Ne fait jamais** | Ne modifie pas le payload V1. Ne court-circuite pas le pipeline décisionnel. Ne produit pas de verdict sur l'opérateur. |
| **Délègue à** | `render.js` pour l'affichage du message P4 dans le cockpit · Debug Brain pour les résultats P1-P3. |

---

## AUTO-VÉRIFICATION — PARTIE IV

**Doublons internes :**
Aucun moteur n'est décrit deux fois. Le Moteur Décisionnel (4.1) et le Moteur Pipeline V2 (4.10) sont distincts — l'un produit le payload, l'autre l'analyse en aval sans le modifier.

**Doublons avec les autres parties :**
Les fichiers source ne sont pas répétés (Partie II). Les flux d'enchaînement ne sont pas redécrits (Partie III). Les outils d'import ne sont pas détaillés ici — le Moteur Parser (4.4) décrit uniquement la responsabilité de transformation, pas les formats d'entrée spécifiques (Partie VI).

**Cohérence doctrinale :**
Chaque "Ne fait jamais" est ancré dans une doctrine explicite : OI V1 n'alimente jamais `buildPayload()` (doctrine OI V1 §XII) · Coaching ne prescrit pas (Language System V1 + Memory Doctrine V1) · Pattern Detection ne produit pas de profil (Pattern Reflection Doctrine V1) · Macro Overlay n'influence pas le score (MACRO-RULE-01) · Mémoire Comportementale ne fusionne pas avec le marché (Memory Doctrine V1).

**Couverture :**
10 moteurs recensés. Aucun moteur futur (Corrélateur, Assistant Mémoire) n'est inclus — ils appartiennent à la Partie VIII (Blancs) et Partie XI (Futurs piliers).


---

# GRAND PLAN DIRECTEUR V1

## PARTIE V — CARTE DES FAMILLES MÉMOIRE

*Cette partie décrit les familles elles-mêmes — leur structure, leur état actuel, et la vérification de cohérence de l'organisation.*
*Les outils qui les alimentent sont en Partie VI. Les moteurs qui les traitent sont en Partie IV.*

---

### 5.1 — Structure validée

Structure issue de l'Architecture Conceptuelle Fondatrice V1 (2026-07-06).

```
╔══════════════════════════════════════════════════════════════╗
║  5 SOURCES                                                   ║
║  Ce que le système reçoit                                    ║
║                                                              ║
║  S1  Transactionnelle   Trades exécutés · ordres posés       ║
║  S2  Patrimoniale       Actifs détenus · staking · on-chain  ║
║  S3  Visuelle           Captures d'écran · graphiques        ║
║  S4  Personnelle        Notes · journal · objectifs          ║
║  S5  Contextuelle       Marché · événements · décisions macro║
╚══════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════╗
║  4 SYNTHÈSES                                                 ║
║  Ce que le système construit à partir des sources            ║
║                                                              ║
║  SY1 Comportementale   Habitudes · patterns · discipline     ║
║  SY2 Identitaire       Style opérateur · valeurs stables     ║
║  SY3 Décisionnelle     Trace des décisions prises            ║
║  SY4 D'apprentissage   Leçons extraites de boucles complètes ║
╚══════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════╗
║  3 COUCHES SYSTÈME                                           ║
║  Dimensions transversales qui traversent toutes les familles ║
║                                                              ║
║  L1  Temporelle         Évolution · tendances · cycles       ║
║  L2  Relationnelle      Corrélations · liens entre familles  ║
║  L3  Cognitive          Insights · intelligence accumulée    ║
╚══════════════════════════════════════════════════════════════╝
                              ↓
╔══════════════════════════════════════════════════════════════╗
║  RÉFÉRENTIEL                                                 ║
║  Infrastructure d'interprétation — hors familles mémoire    ║
║  Taxonomie · vocabulaire · classification                    ║
╚══════════════════════════════════════════════════════════════╝
```

**Distinction structurelle :**
- Les **sources** sont des entrées : ce que le système reçoit depuis l'extérieur.
- Les **synthèses** sont des constructions : ce que le système produit en traitant les sources.
- Les **couches** sont des dimensions : elles traversent toutes les familles sans en être une.
- Le **Référentiel** est une infrastructure : un outil d'interprétation, jamais une mémoire.

---

### 5.2 — État actuel de chaque famille

#### Sources

| Famille | Nature | État dans le produit | Alimentée par |
|---|---|---|---|
| **S1 Transactionnelle** | Trades exécutés · ordres posés · historiques exchange | ACTIVE | CSV Import · XLSX Import · PDF Import V1 |
| **S2 Patrimoniale** | Actifs détenus · staking · revenus passifs · portefeuille on-chain | Infrastructure minimale | `wallet_analyzer.js` (partiel — sans logique livrée) |
| **S3 Visuelle** | Captures d'écran portefeuille · graphiques · ordres · performances | ABSENTE | Rien — futur GPT Vision |
| **S4 Personnelle** | Notes libres · journal · réflexions · objectifs déclarés | ABSENTE | Rien — futur Journal |
| **S5 Contextuelle** | Contexte macro · événements majeurs · décisions stratégiques | Partielle | Macro Layer Phase 1 (overlay narratif) · snapshots formulaire |
*Note de périmètre S5 :* les 50 snapshots formulaire sont classés S5 pour leurs champs contextuels uniquement (état marché, dominanceMacro, bias). Les champs comportementaux (stress, impulsivité, validation humaine) appartiennent à SY1 Comportementale.

#### Synthèses

| Famille | Nature | État dans le produit | Construite par |
|---|---|---|---|
| **SY1 Comportementale** | Habitudes · patterns récurrents · discipline · évolution sur la durée | ACTIVE | Behavioral Engine · memory-computer.js · boucle W1/W2 |
| **SY2 Identitaire** | Style opérateur · valeurs stables · caractère du produit | Partielle | OI V1 (style calculé, non visible) · IDENTITY\_V1 (identité produit) |
| **SY3 Décisionnelle** | Trace des décisions prises — séparée de l'apprentissage qui en découle | Partielle | Snapshots formulaire (50 max) · historique moteur |
| **SY4 D'apprentissage** | Leçons extraites de boucles complètes : intention → décision → conséquence → leçon | Absente comme famille | `coaching.js` produit un message, pas une leçon capturée |

#### Couches système

| Couche | Nature | État dans le produit |
|---|---|---|
| **L1 Temporelle** | Dimension temps — évolution, tendances, cycles | Infrastructure partielle : TTL sessions · comparaisons W1/W2 · historique 50 snapshots |
| **L2 Relationnelle** | Moteur de corrélation — liens entre familles, relations non évidentes | Infrastructure minimale : Constellium scellé (visualisation) · aucun corrélateur actif |
| **L3 Cognitive** | Intelligence — transformation de corrélations en insights utilisables | ABSENTE — futur Assistant Mémoire |

#### Référentiel

| Composant | Nature | État dans le produit |
|---|---|---|
| **Référentiel** | Taxonomie cognitive · vocabulaire d'interprétation · classification des concepts | Corpus documenté (`docs/cognitive/` — ~50 concepts) · non connecté au code · deviendra infrastructure formelle (Q2 validée) |

---

### 5.3 — Vérification de cohérence et d'exhaustivité

**Les 5 sources sont-elles distinctes sans chevauchement ?**

- S1 (Transactionnelle) couvre les actes de trading : ce qui a été executé ou tenté sur un exchange. S2 (Patrimoniale) couvre l'état du patrimoine : ce qui est détenu, indépendamment des transactions récentes. La distinction est nette — un portefeuille en staking depuis 6 mois sans transaction relève de S2, pas de S1.
- S3, S4, S5 sont de natures suffisamment distinctes (visuel · texte libre · contexte marché) pour ne pas se chevaucher.
- Verdict : **cohérent, sans redondance**.

**Les 4 synthèses sont-elles distinctes sans chevauchement ?**

- SY1 (Comportementale) décrit des *patterns récurrents dans le temps*. SY2 (Identitaire) décrit le *style stable de l'opérateur* — deux objets proches mais distincts : SY1 est dynamique (un pattern peut disparaître), SY2 est plus stable (le style change lentement). La frontière est à surveiller lors de l'implémentation.
- SY3 (Décisionnelle) et SY4 (D'apprentissage) sont volontairement séparées (Q1 validée) : une décision peut exister sans que sa conséquence soit connue ; la leçon requiert la boucle complète. Distinction fondée.
- Verdict : **cohérent** — la frontière SY1/SY2 est la seule à surveiller.

**Les 3 couches sont-elles des dimensions et non des familles ?**

- L1 (Temporelle), L2 (Relationnelle), L3 (Cognitive) ne stockent pas de données — elles *traversent* les familles. Un trade (S1) peut être indexé temporellement (L1), mis en relation avec une note (L2), et produire un insight (L3). Elles ne concurrencent aucune source ni synthèse.
- Verdict : **la distinction couche / famille est valide et non-redondante**.

**Le Référentiel est-il correctement placé hors des familles ?**

- Le Référentiel ne stocke pas de mémoire — il fournit le vocabulaire pour l'interpréter. Le placer dans les synthèses serait une erreur de catégorie. Il est correctement positionné comme infrastructure.
- Verdict : **correct**.

**Une famille manque-t-elle ?**

- La mémoire *sociale* (apprentissage collectif, données partagées entre utilisateurs) est exclue par principe (Q3 validée — option future hautement contrôlée, non moteur architectural actuel). Aucune autre famille n'est identifiée comme manquante dans le périmètre de la vision actuelle.

**Une famille est-elle inutile ?**

- Aucune. Même S3 et S4 (absentes en code) sont justifiées par la doctrine Mémoire Vivante V1 — elles sont le remède identifié à la dépendance exclusive aux transactions.

---

## AUTO-VÉRIFICATION — PARTIE V

**Doublons avec les autres parties :**
Les outils qui alimentent chaque famille ne sont pas décrits ici en détail — ils sont listés brièvement dans le tableau 5.2 et développés en Partie VI. Les moteurs qui traitent ces familles sont en Partie IV. Les flux complets sont en Partie III.

**Doublons internes :**
La structure (5.1), l'état (5.2) et la vérification (5.3) couvrent trois angles distincts de la même réalité sans se répéter.

**Cohérence doctrinale :**
La distinction SY3/SY4 est conforme à la Q1 validée (Architecture Conceptuelle Fondatrice V1). L'exclusion de la mémoire sociale est conforme à la Q3. La position du Référentiel est conforme à la Q2. L'état "ABSENTE" de S3, S4, SY4, L3 est nommé sans proposition d'implémentation.


---

# GRAND PLAN DIRECTEUR V1

## PARTIE VI — CARTOGRAPHIE DES OUTILS

*Pour chaque outil : pourquoi existe-t-il · quelle mémoire nourrit-il · quel moteur le consomme · quelle valeur produit-il.*
*Les flux détaillés sont en Partie III. Les descriptions de blocs sont en Partie II. Les familles mémoire sont en Partie V.*

---

### 6.1 — CSV Import

| Champ | Contenu |
|---|---|
| **Pourquoi existe-t-il** | Permet d'importer le Trade History Binance (ordres exécutés avec résultats). Source principale du Behavioral Engine. |
| **Mémoire nourrie** | S1 Transactionnelle → alimente SY1 Comportementale via le scoring comportemental. |
| **Moteur consommateur** | Moteur Parser (4.4) → Moteur Comportemental (4.2) → Moteur Pattern Detection (4.5) → Moteur Coaching (4.6). Également : Moteur OI V1 (4.3) pour la dimension Exécution (fills). |
| **Valeur produite** | Score comportemental · label · patterns · guardLevel persisté · vue longitudinale W1/W2. |

---

### 6.2 — XLSX Import

| Champ | Contenu |
|---|---|
| **Pourquoi existe-t-il** | Alternative au CSV pour les utilisateurs dont l'export Binance est en format Excel. Même données, format différent. |
| **Mémoire nourrie** | S1 Transactionnelle → alimente SY1 Comportementale (pipeline identique au CSV). |
| **Moteur consommateur** | Moteur Parser (4.4) → même chaîne que le CSV à partir de `canonical.js`. |
| **Valeur produite** | Identique au CSV Import. L'outil existe pour ne pas exclure les utilisateurs sans accès au format CSV. |

---

### 6.3 — PDF Import V1

| Champ | Contenu |
|---|---|
| **Pourquoi existe-t-il** | Permet d'importer l'Order History Binance (ordres posés, annulés inclus — pas seulement les fills). Seule source qui révèle le cancel rate réel et les intentions de placement. |
| **Mémoire nourrie** | S1 Transactionnelle → alimente SY2 Identitaire et SY3 Décisionnelle via OI V1. |
| **Moteur consommateur** | Moteur Parser (4.4 — branche PDF) → Moteur OI V1 (4.3) : dimensions Capital, Cadence, Portefeuille, Exécution. |
| **Valeur produite** | Seul outil permettant à OI V1 de calculer les dimensions Exécution et Capital avec confiance élevée. Sans lui, ces deux dimensions restent indisponibles. |
| **Statut** | CLOS — mode maintenance. Ne pas rouvrir sauf régression. |

---

### 6.4 — Formulaire Moteur

| Champ | Contenu |
|---|---|
| **Pourquoi existe-t-il** | Point d'entrée principal de la session de trading. L'opérateur déclare sa lecture de l'état du marché et de son propre état. C'est l'acte central de chaque session. |
| **Mémoire nourrie** | S5 Contextuelle (snapshots persistés — 50 max). |
| **Moteur consommateur** | Moteur Décisionnel (4.1) en totalité — les 16 champs sont sa seule entrée. Moteur Macro Overlay (4.9) pour 2 champs contextuels. Moteur Confiance (4.7) pour 4 champs pondérés. |
| **Valeur produite** | Décision structurée (payload) · posture · engagement · actions autorisées/interdites · snapshot historique. |

---

### 6.5 — Constellium

| Champ | Contenu |
|---|---|
| **Pourquoi existe-t-il** | Révèle les connexions entre les traces du décideur — là où les autres onglets affichent des *contenus*, le Constellium affiche des *relations*. |
| **Mémoire nourrie** | L2 Relationnelle — il lit dans les familles existantes (sessions, snapshots, patterns) et visualise leurs liens. Il ne produit pas de nouvelles données. |
| **Moteur consommateur** | Aucun moteur analytique ne le consomme. C'est une interface de lecture de la mémoire, pas une entrée vers un moteur. |
| **Valeur produite** | "Qu'est-ce qui est relié à quoi dans mon histoire de décideur ?" — question que ni le Moteur, ni la Mémoire, ni le Comportement ne posent. |
| **Statut** | SCELLÉ — lecture seule, gelé jusqu'aux conditions §13 de position_audit. |

---

### 6.6 — Compte Utilisateur V1

| Champ | Contenu |
|---|---|
| **Pourquoi existe-t-il** | Permet à l'opérateur d'identifier sa mémoire (identifiant persistant) et de la synchroniser entre appareils ou de la sauvegarder dans le cloud. |
| **Mémoire nourrie** | SY2 Identitaire (identifiant persistant) · toutes les familles indirectement (via le sync cloud des 12 clés). |
| **Moteur consommateur** | Aucun moteur analytique ne le consomme directement. Il est consommé par `account-sync.js` / `account-cloud.js` pour la persistance cloud. |
| **Valeur produite** | Continuité de la mémoire cross-device · protection contre la perte de données localStorage · accès depuis n'importe quel appareil. |

---

### 6.7 — Wallet Intelligence (infrastructure partielle)

| Champ | Contenu |
|---|---|
| **Pourquoi existe-t-il** | Permettra à terme d'importer automatiquement les données on-chain (actifs détenus, staking, revenus passifs) sans dépendre d'un fichier d'export. |
| **Mémoire nourrie** | S2 Patrimoniale — famille actuellement vide. |
| **Moteur consommateur** | Aucun moteur actif ne le consomme. L'infrastructure (`wallet_analyzer.js` · `portfolio-repo.js`) est posée mais sans logique livrée. |
| **Valeur produite** | Actuellement : aucune. À terme : engagement quotidien sans transaction — le patrimoine évolue même sans trade. |
| **Statut** | Infrastructure minimale posée — futur chantier (OA-03 : à évaluer comme bloc émergent lors de l'audit global). |

---

### 6.8 — Journal Personnel (absent)

| Champ | Contenu |
|---|---|
| **Pourquoi devrait-il exister** | Seul outil capable de capturer l'*intention* avant la décision. Toutes les autres sources capturent le résultat. Sans journal, SY4 D'apprentissage ne peut pas être construite — la boucle intention → décision → conséquence → leçon ne se ferme pas. |
| **Mémoire nourrie** | S4 Personnelle — famille actuellement vide. |
| **Moteur consommateur** | Aucun moteur existant. Nécessiterait un moteur futur dédié à la mémoire personnelle. |
| **Valeur produite** | Engagement quotidien sans transaction · capture des intentions · fermeture de la boucle d'apprentissage · rétention par accumulation de mémoire personnelle. |
| **Statut** | ABSENT — futur chantier · nécessite une Doctrine de la Mémoire Personnelle avant toute implémentation. |

---

### 6.9 — GPT Vision (absent)

| Champ | Contenu |
|---|---|
| **Pourquoi devrait-il exister** | Permettrait d'importer de la mémoire sans fichier — une capture d'écran de portefeuille ou de graphique devient une trace structurée exploitable. |
| **Mémoire nourrie** | S3 Visuelle — famille actuellement vide. |
| **Moteur consommateur** | Aucun moteur existant. Nécessiterait un moteur de normalisation visuelle et une API externe (GPT-4 Vision ou équivalent). |
| **Valeur produite** | Mémoire sans friction d'import · capture de l'état d'un portefeuille à un instant T · source complémentaire aux données textuelles. |
| **Statut** | ABSENT — futur chantier · nécessite une Doctrine de la Mémoire Visuelle (local-first, confidentialité, consentement) avant toute implémentation. Décision architecturale majeure : l'image transite-t-elle vers un cloud ? |

---

## AUTO-VÉRIFICATION — PARTIE VI

**Doublons internes :**
CSV et XLSX sont traités séparément pour conserver la clarté de leur distinction (même valeur, usage différent). Aucun outil n'est décrit deux fois.

**Doublons avec les autres parties :**
Les flux de transformation ne sont pas répétés ici (Partie III). Les responsabilités des moteurs consommateurs ne sont pas redéveloppées (Partie IV). L'état des familles mémoire n'est pas réexpliqué (Partie V). Les descriptions de blocs ne sont pas répétées (Partie II).

**Cohérence doctrinale :**
Les outils absents (6.8, 6.9) sont nommés avec leur valeur potentielle — mais sans proposition d'implémentation ni d'ordre de développement. Les prérequis doctrinaux sont identifiés (Doctrine Mémoire Personnelle, Doctrine Mémoire Visuelle) sans les créer. Le Constellium est correctement décrit comme interface de lecture, non comme outil d'entrée.

**Couverture :**
9 outils couverts : 3 actifs (CSV, XLSX, PDF) · 1 central (Formulaire) · 1 scellé (Constellium) · 1 qualifié (Compte Utilisateur) · 1 infrastructure partielle (Wallet Intelligence) · 2 absents (Journal, GPT Vision). Cohérent avec l'état réel du produit.


---

# GRAND PLAN DIRECTEUR V1

## PARTIE VII — CARTOGRAPHIE DOCUMENTAIRE

*Cette partie décrit le statut et la validité des documents — pas leur contenu (Partie II) ni leur rôle fonctionnel (Parties III-VI).*
*Format : niveau · statut · validité · évolution nécessaire.*

---

### 7.1 — Documents Vision / Doctrine (N0-N2)

| Document | Niveau | Statut | Validité | Évolution nécessaire |
|---|---|---|---|---|
| `docs/manifesto-cameleon-engine.md` | N0 | PERMANENT | Totale | Aucune — évolue uniquement par approfondissement |
| `docs/doctrine/IDENTITY_V1.md` | N1 | RÉFÉRENCE ACTIVE | Totale | Mettre à jour la hiérarchie doctrinale si Gouvernance V1 s'y intègre formellement |
| `docs/doctrine/cameleon_engine_language_system_v1.md` | N2 | RÉFÉRENCE ACTIVE | Totale | Aucune — source de vérité linguistique stable |
| `docs/doctrine/lecture_not_equal_action.md` | N2 | RÉFÉRENCE ACTIVE | Totale | Aucune |
| `docs/doctrine/memory_doctrine_v1.md` | N2 | RÉFÉRENCE ACTIVE | Totale | Aucune |
| `docs/doctrine/pattern_reflection_doctrine_v1.md` | N2 | RÉFÉRENCE ACTIVE | Totale | Aucune |
| `docs/doctrine/operator_intelligence_v1.md` | N2 | RÉFÉRENCE ACTIVE | Totale | Aucune |
| `memory/project_memoire_vivante_v1_doctrine.md` | N1-N2 | EN MATURATION | Partielle | **OA-04** : nomenclature à harmoniser avec la structure 5+4+3+Référentiel (ancienne version à 6 familles) |
| `memory/project_gouvernance_v1_doctrine.md` | N2 | ACTIVE | Totale | Envisager intégration dans `docs/doctrine/` lorsque la doctrine sera stabilisée |
*Architecture Conceptuelle Fondatrice V1 : voir section 7.2 — double nature doctrine + architecture conceptuelle. Référence active, Q1/Q2/Q3 validées.*

| `docs/architecture/macro-doctrine-v1.md` | N2 | FIGÉE (2026-06-05) | Totale | Aucune — doctrine Phase 1 close |
| `docs/architecture/doctrine-silence-structurel.md` | N2 | RÉFÉRENCE ACTIVE | Totale | Vérifier alignement avec Language System V1 lors du prochain chantier langage |

---

### 7.2 — Documents Architecture Conceptuelle

Ces documents définissent la structure conceptuelle du système — entre la doctrine (N2) et l'architecture technique (N3).

| Document | Niveau | Statut | Validité | Évolution nécessaire |
|---|---|---|---|---|
| `memory/project_architecture_conceptuelle_fondatrice_v1.md` | N1-N2 | ACTIVE | Totale | Envisager migration vers `docs/` lorsque la phase de maturation sera close. *Double nature : doctrine (N1-N2) + architecture conceptuelle — référencé ici comme document fondateur de la structure système.* |
| `docs/architecture/canonical_motor_state_2026.md` | N3 | ACTIF · référence | Totale | À mettre à jour si le Pipeline V2 produit de nouveaux états officiels |
| `docs/architecture/constellium/constellium_v1_definition.md` | N3 | SCELLÉ | Totale | Gelé — aucune modification jusqu'aux conditions §13 |

---

### 7.3 — Documents Architecture Technique (N3-N5)

*Sélection des documents à enjeux. L'intégralité du dossier `docs/architecture/` est accessible directement dans le dépôt. Seuls les documents structurants sont listés ici.*

| Document | Niveau | Statut | Validité | Évolution nécessaire |
|---|---|---|---|---|
| `docs/architecture/user_account_v1_execution_architecture.md` | N3-N5 | ACTIF | Totale | Aucune — LOT 1-3 qualifiés |
| `docs/architecture/oi_v1_capital_architecture.md` | N3-N5 | ACTIF | Totale | Aucune — moteur calculé, UI manquante |
| `docs/architecture/oi_v1_cadence_architecture.md` | N3-N5 | ACTIF | Totale | Aucune |
| `docs/architecture/oi_v1_portefeuille_architecture.md` | N3-N5 | ACTIF | Totale | Aucune |
| `docs/architecture/pdf-import-v1-architecture.md` | N5 | CLOS — maintenance | Totale | Ne pas rouvrir sauf régression |
| `docs/architecture/macro-layer-strategic-architecture.md` | N3 | ACTIF — Phase 1 | Partielle | Phases 2+ non démarrées — doc anticipatoire |
| `docs/architecture/couche-macro-phase1.md` | N5 | CLÔTURÉ | Totale | Aucune — Phase 1 validée terrain |
| `docs/architecture/how-cameleon-reads-v1.md` | N3 | ACTIF | Totale | Vérifier alignement avec Mémoire Vivante V1 lors de la stabilisation |
| `docs/architecture/modele-mental-canonique.md` | N3 | À VÉRIFIER | Incertaine | Antérieur à l'Architecture Conceptuelle Fondatrice V1 — vérifier cohérence terminologique |
| `docs/cognitive/` (dossier complet) | N3 | ACTIF — non connecté | Totale sur le fond | Deviendra Référentiel infrastructure (Q2) · connexion au code absente |

---

### 7.4 — Documents de Validation terrain

| Document | Statut | Couverture |
|---|---|---|
| `docs/validation/compte-utilisateur-v1-lot1-export-import-purge.md` | CLOS | Export · import · purge — 12 clés · iPad Chrome |
| `docs/validation/compte-utilisateur-v1-lot2-auth-magic-link.md` | CLOS | Magic Link · signOut · reload x5 — PC Chrome |
| `docs/validation/compte-utilisateur-v1-lot3-sync-cloud.md` | CLOS | T1→T6 PASS · Promise.race() 20s · AbortController 15s — iPad Chrome |
| `docs/validation-terrain-v1-v2-v3.md` | HISTORIQUE | Validation des premières versions du moteur décisionnel |
| `docs/validation/v0-a-binance-trade-history-validation.md` | HISTORIQUE | Validation parser CSV/Behavioral Engine |
| `docs/validation/declared-breakout-compression-ui-coherence.md` | HISTORIQUE | Validation cohérence UX états moteur |

---

### 7.5 — Documents en tension ou à surveiller

Ces documents ne sont pas invalides. Ils présentent des points de friction avec les doctrines récentes — à vérifier avant usage.

| Document | Tension identifiée | Action recommandée |
|---|---|---|
| `memory/project_memoire_vivante_v1_doctrine.md` | Nomenclature ancienne à 6 familles — non alignée avec 5+4+3+Référentiel (OA-04) | Harmoniser lors de la stabilisation de la doctrine |
| `docs/product/cadrage-produit-deux-couches.md` | Antérieur au pivot Mémoire Vivante V1 — peut décrire un produit à deux couches qui ne correspond plus à la vision actuelle | Relire avant toute décision produit fondée sur ce document |
| `docs/architecture/memoire-long-terme-roadmap-alignement.md` | Écrit avant la structure 5+4+3 — peut référencer d'anciens noms de familles | Vérifier terminologie avant usage |
| `docs/architecture/mem-v2-compte-memoire-persistante.md` | Vision pré-LOT3 — partiellement dépassé par le compte utilisateur V1 livré | Ne consulter que pour le contexte historique |
| `docs/architecture/modele-mental-canonique.md` | Antérieur à l'Architecture Conceptuelle Fondatrice V1 — le modèle mental y décrit peut diverger du dictionnaire officiel | Vérifier cohérence terminologique avant usage |
| `docs/architecture/mem-01b-memory-caps-schemas.md` | Schémas de capacité mémoire — peut ne pas refléter les familles validées | Vérifier alignement avec Partie V avant usage |
| `docs/architecture/intelligence_layer_position_audit.md` | Rédigé avant la formalisation de L3 Cognitive — la position de la couche intelligence peut diverger | Utile comme référence historique — ne pas appliquer directement |

---

### 7.6 — Archives (ne plus consulter pour des décisions)

Ces documents ont une valeur historique uniquement. Ils décrivent des états du projet qui ne correspondent plus à l'état actuel.

| Document | Raison de l'archivage |
|---|---|
| `docs/archive/ROADMAP_CAMELON_ENGINE_backup.md` | Ancienne roadmap — remplacée par la gouvernance par chantiers (LOTs) |
| `docs/plan-v2.md` | Plan de phase dépassé |
| `docs/plan-v3-friction-graduelle.md` | Plan de phase dépassé |
| `docs/plan-v4-comportement-excel-csv.md` | Plan de phase dépassé |
| `docs/source-v4.5.html` | Source code d'une version ancienne |
| `docs/source-v7.3.2e.html` | Source code d'une version ancienne |
| `docs/v0-session-log-template.md` | Template de session V0 — remplacé par les outils actuels |

---

## AUTO-VÉRIFICATION — PARTIE VII

**Doublons avec la Partie II :**
Les rôles et contenus des documents ne sont pas répétés ici. La Partie VII se concentre exclusivement sur le niveau, le statut, la validité et les besoins d'évolution. Un lecteur cherchant "ce que fait ce document" consulte la Partie II ; un lecteur cherchant "est-il encore valide" consulte la Partie VII.

**Doublons internes :**
L'Architecture Conceptuelle Fondatrice V1 apparaît en 7.2 comme référence principale. La section 7.1 contient une note de renvoi vers 7.2 — le doublon est résolu. Aucun autre doublon.

**Cohérence doctrinale :**
Aucun document archivé n'est supprimé — il est classé. Aucune décision de suppression ne peut être prise dans ce document (Partie VII est de la cartographie, pas de la gouvernance). Les tensions identifiées en 7.5 sont nommées sans prescrire de corrections immédiates.

**Couverture :**
Les ~240 fichiers du projet ne sont pas tous listés — seuls les documents à enjeux structurants apparaissent. Les documents purement techniques (architecture individuelle de chaque LOT, checklists d'implémentation) sont dans `docs/architecture/` et sont accessibles mais ne nécessitent pas de suivi particulier.


---

# GRAND PLAN DIRECTEUR V1

## PARTIE VIII — LES BLANCS

*Cette partie recense ce qui n'existe pas — ni en code, ni en doctrine formelle, ni en architecture active.*
*Les familles mémoire concernées sont décrites en Partie V. Les outils absents sont en Partie VI.*
*Cette partie ne propose pas d'ordre de développement — c'est la Partie XIII.*

---

### 8.1 — Blancs dans les familles mémoire

*Nature de ces blancs : **technique** — familles définies doctrinalement, infrastructure non encore construite.*

Familles définies par l'Architecture Conceptuelle Fondatrice V1 mais sans outil actif pour les alimenter.

| Famille | Nature du blanc | Conséquence actuelle |
|---|---|---|
| **S2 Patrimoniale** | Infrastructure minimale posée (`wallet_analyzer.js`) mais sans logique livrée. Aucune donnée on-chain n'entre dans le système. | Le patrimoine de l'opérateur est invisible pour le produit — même si l'opérateur ne trade plus. |
| **S3 Visuelle** | Aucun outil, aucune architecture active. GPT Vision absent. | Toute information contenue dans une capture d'écran est perdue. |
| **S4 Personnelle** | Aucun outil, aucune architecture active. Journal absent. | L'intention avant la décision n'est jamais capturée. La boucle d'apprentissage ne peut pas se fermer. |
| **SY4 D'apprentissage** | `coaching.js` produit un message — mais aucun mécanisme ne capture la leçon extraite après une boucle complète (intention → décision → conséquence → leçon). | La synthèse d'apprentissage n'existe pas. L'opérateur ne peut pas relire ce qu'il a appris. |
| **L2 Relationnelle** | Constellium scellé visualise des connexions existantes, mais aucun corrélateur actif ne détecte automatiquement des relations entre familles. | Les corrélations cross-familles sont invisibles — elles ne peuvent être perçues que par l'opérateur lui-même. |
| **L3 Cognitive** | Aucune couche d'intelligence active. Aucun assistant mémoire. | Le système décrit — il ne synthétise pas. La valeur de l'accumulation ne se révèle pas automatiquement. |

---

### 8.2 — Blancs fonctionnels

*Nature de ces blancs : **technique** — modules architecturalement décrits ou partiellement initialisés, non développés.*

Modules architecturalement décrits ou partiellement initialisés, mais non développés.

**UI Operator Intelligence**
Le moteur OI V1 calcule les 4 dimensions et les persiste dans `CE_oi_history_v1`. Aucune interface ne les présente à l'opérateur. Le résultat existe dans le système — l'opérateur ne peut pas le consulter.

**Timeline**
Concept mentionné dans plusieurs documents. Aucune architecture formelle. Aucun index chronologique cross-familles. Les données persistées (sessions, snapshots, trades) ont chacune leur propre organisation — une lecture chronologique unifiée est impossible sans cette couche.

**Corrélateur actif**
Le Constellium visualise des liens existants entre traces connues. Il ne détecte pas de nouvelles corrélations entre familles. Un corrélateur actif serait capable d'identifier, par exemple, qu'un pattern comportemental (SY1) est systématiquement associé à un contexte marché particulier (S5) — sans que l'opérateur ait à le remarquer lui-même.

**Recherche sémantique**
Mentionnée dans plusieurs documents de mémoire. Aucune base technique. Impossible d'interroger la mémoire accumulée par un texte libre ("quelles sessions ressemblaient à aujourd'hui ?").

**Macro Layer Phases 2+**
La Phase 1 est livrée (overlay narratif). L'architecture prévoit des phases d'import de contexte externe et d'enrichissement de S5 Contextuelle. Ces phases n'ont pas de document d'architecture actif.

**Référentiel formel**
Le Corpus Cognitif (`docs/cognitive/` — ~50 concepts) est documenté mais non connecté au code. Aucune API, aucun accès programmatique. Le moteur ne peut pas s'appuyer sur cette connaissance pour qualifier ses observations.

---

### 8.3 — Blancs UX

*Nature de ces blancs : **volontaire** — fonctions calculées et persistées, dont la restitution à l'opérateur est intentionnellement différée.*

Fonctions calculées ou définies dans le système mais non accessibles à l'opérateur dans l'interface.

**Onglet Operator Intelligence**
OI V1 est calculé, persisté, opérationnel. L'opérateur n'a aucun endroit pour consulter son style (Exécution, Capital, Portefeuille, Cadence) ni son évolution entre sessions. C'est le blanc UX le plus immédiatement résolvable — le moteur existe.

**Espace d'écriture**
Aucun champ de saisie libre dans le produit. L'opérateur ne peut pas écrire une note, une réflexion ou un objectif. Le produit est entièrement en lecture — l'écriture n'existe pas.

**Vue chronologique**
Aucune représentation de l'histoire du décideur dans le temps. Les sessions existent, les snapshots existent, les patterns existent — mais leur lecture est par type, jamais par date. L'opérateur ne peut pas voir "ce qui s'est passé ce mois-ci".

**Mémoire S5 Contextuelle visible**
Les snapshots formulaire constituent une mémoire contextuelle (S5) mais ne sont pas présentés comme tels dans l'interface. L'onglet Mémoire expose export/import/purge — pas la mémoire accumulée elle-même.

---

### 8.4 — Blancs doctrinaux

*Nature de ces blancs : **bloquant** — doctrines préalables manquantes. Ne pas démarrer d'implémentation avant leur existence.*

Doctrines qui devront exister avant que les modules correspondants puissent être développés conformément à la vision.

**Doctrine de la Mémoire Personnelle**
Règles de ce qu'une note ou un journal peut faire et ne peut jamais faire. Peut-il être analysé ? Peut-il produire une synthèse ? Peut-il être mis en relation avec une lecture de marché ? Ces questions n'ont pas de réponse doctrinale aujourd'hui. Sans cette doctrine, tout développement du Journal risque de violer Lecture ≠ Action ou Memory Doctrine V1.

**Doctrine de la Mémoire Visuelle**
Règles de confidentialité, de consentement et de local-first pour les captures d'écran. Une image contient potentiellement des informations sensibles (soldes, positions, identité). La question architecturale centrale — l'image transite-t-elle vers un cloud pour être traitée par GPT Vision ? — n'a pas de réponse doctrinale. Sans décision sur ce point, tout développement violerait l'invariant I-01 (local-first).

**Doctrine des Corrélations**
Règles épistémiques sur ce que le corrélateur peut affirmer. Une corrélation observée dans les données peut facilement être présentée comme une cause, une recommandation ou une prédiction. Or ces trois formulations violent Lecture ≠ Action. La doctrine doit définir comment un lien est nommé, avec quel niveau de confiance, et ce qu'il ne peut jamais impliquer.

**Doctrine de l'Assistant Mémoire**
Règles strictes de non-prescription pour L3 Cognitive. C'est le composant le plus exposé au risque de dérive vers le conseil ou la prédiction déguisée. Sans doctrine préalable, le développement d'un assistant mémoire produira presque inévitablement des formulations interdites par les doctrines existantes.

**Doctrine du Référentiel**
Règles définissant comment le Corpus Cognitif (~50 concepts) devient une infrastructure formelle connectée au code. Quels concepts sont accessibles programmatiquement ? Sous quelle forme ? Qui les met à jour ? Ces règles sont absentes.

---

## AUTO-VÉRIFICATION — PARTIE VIII

**Doublons avec les autres parties :**
Les statuts "ABSENTE" des familles mémoire ne sont pas réexpliqués ici — la Partie VIII nomme le blanc et sa conséquence, pas la famille elle-même (Partie V). Les outils absents sont mentionnés par nom sans les redécrire (Partie VI). Les futurs piliers ne sont pas anticipés ici — ils apparaîtront en Partie XI.

**Doublons internes :**
Les quatre sous-sections couvrent des angles distincts : manques dans les familles (8.1) · modules non développés (8.2) · invisibilité de ce qui est calculé (8.3) · doctrines préalables manquantes (8.4). Aucun blanc n'est listé deux fois dans des catégories différentes. L'UI OI V1 apparaît en 8.2 (fonctionnel) et 8.3 (UX) sous des angles distincts : en 8.2 comme module absent, en 8.3 comme résultat calculé mais invisible.

**Cohérence doctrinale :**
Aucune proposition d'implémentation. Aucun ordre de développement. Les blancs doctrinaux (8.4) sont identifiés comme prérequis — jamais comme obstacles à contourner. L'invariant I-01 est rappelé pour GPT Vision sans prescrire de solution.


---

# GRAND PLAN DIRECTEUR V1

## PARTIE IX — CARTE DES DÉPENDANCES

*Pour chaque futur module : ce qui est impacté dans le système existant · risques introduits · prérequis doctrinaux et architecturaux.*
*Cette partie ne propose pas d'ordre de développement. Elle décrit uniquement les chaînes de dépendance.*
*Les blancs correspondants sont en Partie VIII. La valeur stratégique de chaque module est en Partie XI.*

---

### 9.1 — Si : Wallet Intelligence

**Ce qui est impacté dans le système existant**

| Composant | Impact |
|---|---|
| S2 Patrimoniale | Activation de la famille — actuellement vide |
| `storage.js` | Nouveau type de données (wallet snapshots, positions on-chain) |
| `account-sync.js` | Nouvelles clés à synchroniser si les données sont cloud-backed |
| Constellium | Nouvelles traces disponibles à connecter (impact potentiel sur le périmètre scellé) |
| SY3 Décisionnelle | Le contexte patrimonial pourrait enrichir les traces de décisions futures |

**Risques**

- **I-01 (local-first) :** les données on-chain nécessitent une API blockchain externe → décision architecturale sur la frontière local/cloud.
- **Confusion S1/S2 :** un trade exécuté (S1) et un actif détenu (S2) peuvent sembler proches mais décrivent des réalités distinctes. Sans séparation claire, des données patrimoniales pourraient contaminer l'analyse transactionnelle.
- **Tentation d'intégration au pipeline décisionnel :** nourrir `buildPayload()` avec le patrimoine créerait une décision fondée sur la richesse — violation de la séparation des couches.

**Prérequis doctrinaux**
Aucun bloquant identifié — S2 est définie et ses règles peuvent dériver des doctrines existantes (local-first, Lecture ≠ Action).

**Prérequis architecturaux**
Décision explicite sur la frontière local/cloud pour les données blockchain (ADR à créer).

---

### 9.2 — Si : Journal Personnel

**Ce qui est impacté dans le système existant**

| Composant | Impact |
|---|---|
| S4 Personnelle | Activation de la famille — actuellement vide |
| `storage.js` | Nouveau type (journal entries : texte libre horodaté) |
| SY4 D'apprentissage | Vecteur principal pour fermer la boucle intention → décision → conséquence → leçon |
| Language System V1 | Extension nécessaire : règles pour le traitement du texte libre saisi par l'opérateur |
| Memory Doctrine V1 | Extension nécessaire : peut-on analyser le journal ? Peut-il produire une synthèse ? |

**Risques**

- **Prescription déguisée :** le système lit un journal et en "déduit" un comportement → violation de Lecture ≠ Action si non encadré.
- **Confusion S4/S5 :** une note d'intention (S4) et un contexte de marché déclaré (S5) peuvent être mélangés si le modèle de données n'est pas rigoureux.
- **Dérive vers le coaching :** le journal pourrait devenir un espace d'évaluation par le système, au lieu d'un espace de capture par l'opérateur.

**Prérequis doctrinaux**
**Bloquant :** Doctrine de la Mémoire Personnelle — inexistante (identifiée en 8.4). Sans elle, tout développement risque de violer Memory Doctrine V1.

**Prérequis architecturaux**
Aucun majeur — `storage.js` est extensible.

---

### 9.3 — Si : Timeline

**Ce qui est impacté dans le système existant**

| Composant | Impact |
|---|---|
| L1 Temporelle | Activation formelle de la dimension temporelle |
| Toutes les familles S1-S5, SY1-SY4 | Chaque famille doit produire des événements avec un timestamp normalisé dans un format commun |
| `storage.js` | Nouveau mode d'accès chronologique — aujourd'hui les données sont organisées par type, pas par date |
| Constellium | La Timeline est complémentaire (axe temps vs. axe relations) — interface à distinguer clairement |
| `render.js` | Nouveau composant d'interface nécessaire |

**Risques**

- **Normalisation cross-familles :** chaque source utilise ses propres formats de date (timestamps CSV Binance ≠ dates PDF ≠ horodatages formulaire). Une Timeline unifiée nécessite une couche de normalisation significative.
- **Dérive "dashboard" :** une Timeline qui affiche tout simultanément devient un dashboard — interdit par le manifesto §II. La présentation doit rester séquentielle.
- **Surcharge informationnelle :** sans filtre cognitif, la Timeline peut afficher trop d'événements pour être lisible.

**Prérequis doctrinaux**
Aucun bloquant doctrinal — mais une doctrine UX de la Timeline serait nécessaire pour éviter la dérive dashboard.

**Prérequis architecturaux**
**Structurant :** modèle de timestamps unifié cross-familles (dépendance importante — toutes les familles doivent être compatibles avant que la Timeline soit possible).

---

### 9.4 — Si : GPT Vision

**Ce qui est impacté dans le système existant**

| Composant | Impact |
|---|---|
| S3 Visuelle | Activation de la famille — actuellement vide |
| `storage.js` | Nouveau type (traces visuelles normalisées) |
| Architecture locale | Dépendance à une API externe (GPT-4 Vision ou équivalent) — rupture potentielle du local-first |
| Compte Utilisateur V1 | Consentement explicite nécessaire avant tout envoi d'image vers le cloud |

**Risques**

- **I-01 (local-first) — risque majeur :** une image doit quitter l'appareil pour être traitée par GPT Vision. C'est la décision architecturale la plus structurante de ce module. Si elle n'est pas résolue, tout le module viole l'invariant fondateur.
- **Données sensibles :** une capture d'écran contient des soldes, des positions, parfois une identité. La provenance et le traitement de ces données doivent être formalisés (I-08).
- **I-09 (dégradation gracieuse) :** si l'API est indisponible, le système ne doit pas bloquer. La mémoire visuelle doit être facultative, jamais critique.
- **Traçabilité de l'extraction :** ce que GPT Vision "voit" dans une image est difficile à vérifier. La provenance de la trace produite est incertaine.

**Prérequis doctrinaux**
**Bloquant :** Doctrine de la Mémoire Visuelle — inexistante (identifiée en 8.4). Elle doit répondre à : consentement, local-first vs. cloud, anonymisation, limites de ce que le moteur peut inférer d'une image.

**Prérequis architecturaux**
ADR explicite sur la frontière local/cloud pour les images · mécanisme de consentement côté Compte Utilisateur V1.

---

### 9.5 — Si : Corrélateur actif

**Ce qui est impacté dans le système existant**

| Composant | Impact |
|---|---|
| L2 Relationnelle | Activation formelle — Constellium ne suffit plus comme seule expression de cette couche |
| Toutes les familles mémoire | Le corrélateur lit dans tout — toutes les familles doivent avoir un modèle de données homogène |
| Constellium | Le corrélateur alimenterait Constellium en liens découverts → impact potentiel sur le statut scellé |
| Language System V1 | Nouveau vocabulaire nécessaire pour nommer une corrélation sans la transformer en causalité |

**Risques**

- **Confusion corrélation / causalité :** "à chaque fois que X, Y suit" est une corrélation. La présenter sans précaution devient une recommandation — violation de Lecture ≠ Action.
- **Risque de prescription systémique :** le corrélateur est le composant le plus susceptible de produire, à l'échelle, des formulations prescriptives déguisées en observations.
- **Impact sur Constellium scellé :** si le corrélateur découvre des liens, ils doivent pouvoir apparaître quelque part — ce qui peut nécessiter une évolution de Constellium.
- **Modèle de données unifié :** sans homogénéité cross-familles (même dépendance que la Timeline), le corrélateur ne peut pas opérer.

**Prérequis doctrinaux**
**Bloquant :** Doctrine des Corrélations — inexistante (identifiée en 8.4). Elle doit définir ce qu'une corrélation peut affirmer, avec quel niveau de confiance, et ce qu'elle ne peut jamais impliquer.

**Prérequis architecturaux**
Modèle de données unifié cross-familles (dépendance partagée avec la Timeline).

---

### 9.6 — Si : Assistant Mémoire

**Ce qui est impacté dans le système existant**

| Composant | Impact |
|---|---|
| L3 Cognitive | Activation — couche actuellement absente |
| Toutes les familles mémoire | L'assistant lit dans l'ensemble de la mémoire accumulée |
| Toutes les doctrines actives | Ce module est le plus exposé à la violation doctrinale — chaque doctrine existante doit être revue pour sa conformité |
| Language System V1 | Extension majeure nécessaire : vocabulaire des réponses de l'assistant |
| Compte Utilisateur V1 | Si l'assistant s'appuie sur un LLM externe, décision sur les données envoyées au cloud |

**Risques**

- **Dérive vers le coaching :** risque le plus élevé de tous les modules. Un assistant qui restitue de la mémoire peut facilement glisser vers "tu devrais" — violation directe de Lecture ≠ Action et du manifesto §II.
- **Assignation d'identité :** en synthétisant des mois de mémoire, l'assistant peut produire des étiquettes identitaires déguisées en observations — violation de l'invariant I-06 (profil interdit).
- **Hallucinations :** si l'assistant s'appuie sur un LLM externe, des corrélations inventées peuvent être présentées comme des mémoires réelles — violation critique de I-08 (provenance traçable).
- **Dépendance d'amont :** un assistant mémoire sans Corrélateur actif (9.5) ni Timeline (9.3) opère sur des familles isolées — sa valeur est fortement réduite.

**Prérequis doctrinaux**
**Bloquant :** Doctrine de l'Assistant Mémoire — inexistante (identifiée en 8.4). C'est le module qui nécessite le plus de doctrine préalable. Toutes les doctrines existantes doivent être relues pour garantir leur compatibilité avec ce composant.

**Prérequis architecturaux**
L2 Relationnelle (Corrélateur actif) et L1 Temporelle (Timeline) devraient idéalement précéder ce module — un assistant qui ne peut pas relier ni ordonner les mémoires est structurellement limité.

---

## AUTO-VÉRIFICATION — PARTIE IX

**Doublons avec les autres parties :**
Les définitions des familles mémoire ne sont pas répétées (Partie V). Les descriptions des modules absents ne sont pas redonnées (Partie VIII). La valeur stratégique de chaque module n'est pas développée ici (Partie XI). La Partie IX se concentre exclusivement sur ce qui est impacté, les risques et les prérequis.

**Doublons internes :**
La dépendance "modèle de données unifié cross-familles" apparaît deux fois (9.3 Timeline et 9.5 Corrélateur). C'est intentionnel : c'est un prérequis architectural partagé. Il sera consolidé dans la Partie XIII (Terrain pour la future Roadmap).

**Cohérence doctrinale :**
Aucun module n'est présenté comme "à développer". Les prérequis bloquants sont identifiés sans proposition de solution. Les invariants violés sont nommés (I-01, I-06, I-08, I-09) sans décision corrective. L'Assistant Mémoire est le seul module à cumuler plusieurs prérequis doctrinaux bloquants — ce fait est noté sans hiérarchiser.


---

# GRAND PLAN DIRECTEUR V1

## PARTIE X — RISQUES ARCHITECTURAUX

*Cette partie identifie ce qui pourrait dériver, se dégrader ou créer une incohérence dans l'architecture existante ou prévisible.*
*Les blancs (ce qui manque) sont en Partie VIII. Les impacts des futurs modules sont en Partie IX.*
*Format par risque : description · pourquoi c'est un risque · protection actuelle · signal d'alerte.*

---

### 10.1 — Fusion inter-couches

**Description**
Un composant de synthèse (SY1-SY4) commence à lire simultanément dans les sources (S1-S5) et dans le payload du moteur décisionnel pour produire un verdict unifié. Exemple concret : OI V1 alimente `buildPayload()` avec la dimension Exécution pour "confirmer" une posture.

**Pourquoi c'est un risque**
La fusion crée une prescription déguisée : le style passé (OI V1 — horizon mois) autorise une action présente (moteur — horizon session). Ce glissement viole Lecture ≠ Action et l'invariant I-02 (Autorité humaine), sans qu'aucun composant individuel ne soit clairement fautif.

**Protection actuelle**
OI V1 Doctrine §XII (anti-dérive E) : "Operator Intelligence V1 n'alimente jamais `buildPayload()`." · Isolation structurelle du module comportemental (`behavior/`) qui ne lit aucune donnée du moteur principal.

**Signal d'alerte**
Toute PR ou modification qui fait transiter un résultat OI V1, un guardLevel ou un score comportemental vers `engine.js` ou `buildPayload()`. Tout import de `moteur.js` dans `behavior/`.

---

### 10.2 — Dérive Constellium vers dashboard

**Description**
Constellium commence à afficher des métriques, des scores ou des "insights" plutôt que des liens entre traces. La pression s'exerce naturellement à mesure que d'autres modules produisent davantage de données visualisables.

**Pourquoi c'est un risque**
Constellium n'est pas un moteur — il visualise des connexions. S'il commence à calculer, il double le Behavioral Engine. S'il commence à scorer, il viole la définition canonique ("révèle les connexions, ne produit pas de données"). Le glissement est progressif et difficile à détecter.

**Protection actuelle**
Statut SCELLÉ (commit `d5719d9`) · définition canonique de Constellium V1 · conditions §13 de `constellium_position_audit.md` à satisfaire avant toute réouverture.

**Signal d'alerte**
Toute proposition d'ajouter un chiffre, un score ou une évaluation dans l'interface Constellium. Toute modification du fichier `behavior-view.js` qui écrirait un nouveau type de donnée dans les traces Constellium.

---

### 10.3 — Dette render.js

**Description**
`render.js` (~5200 lignes, fichier unique) est le point de convergence de tous les moteurs, de toutes les zones du cockpit et de toute la logique d'affichage. Sa taille et son absence de décomposition en modules créent un risque structurel croissant.

**Pourquoi c'est un risque**
Tout bug dans `render.js` peut régresser simultanément la zone Marché, la zone Confiance, le panel comportemental, l'historique et le Debug Brain. L'ajout de chaque nouveau module (OI V1 UI, Journal, Timeline) augmente la taille du fichier et la surface de régression.

**Protection actuelle**
Tests terrain avant tout commit touchant `render.js`. Discipline de modification chirurgicale (ne pas réusiner ce qui fonctionne). Aucun refactoring prévu — architecture hybride assumée.

**Signal d'alerte**
Tout nouveau module dont l'UI est développée directement dans `render.js` sans isolation préalable. Tout ajout de plus de 200 lignes en une seule modification.

---

### 10.4 — Mémoire comportementale sans frontière épistémique

**Description**
À mesure que `CE_behavior_sessions_v1` accumule des sessions (max 50, FIFO), la tentation de "sortir des conclusions" sur l'opérateur croît. Après 30 sessions, le système dispose de suffisamment de données pour produire des généralisations — légitimes ou non.

**Pourquoi c'est un risque**
Memory Doctrine V1 interdit le conseil, la prédiction et l'explication causale. Mais ces trois dérives sont précisément celles que les algorithmes de synthèse produisent naturellement sur un volume de données croissant. Le risque augmente avec la richesse des données, pas avec leur pauvreté.

**Protection actuelle**
Memory Doctrine V1 · Pattern Reflection Doctrine V1 · OI V1 Doctrine P5 (le volume conditionne la légitimité, pas l'inverse) · règle de non-fusion (un scoring comportemental ne produit jamais de verdict global).

**Signal d'alerte**
Tout message produit par `coaching.js` ou `memory-computer.js` qui utilise le futur prescriptif, l'impératif, ou une formulation du type "tu as tendance à" basée sur une extrapolation non vérifiable.

---

### 10.5 — Violation du local-first par les futures familles

**Description**
S2 (Patrimoniale), S3 (Visuelle) et potentiellement S4 (Personnelle) impliquent des données qui pourraient nécessiter un traitement cloud — API blockchain, GPT Vision, synchronisation de journal. Chaque nouveau module est une porte vers une violation de l'invariant I-01.

**Pourquoi c'est un risque**
L'invariant I-01 (local-first) est fondateur. Sa violation progressive — module par module, chacun semblant raisonnable pris isolément — peut transformer le produit en un service cloud sans qu'aucune décision explicite n'ait été prise. C'est une dérive par accumulation.

**Protection actuelle**
Invariant I-01 formalisé dans l'Architecture Conceptuelle Fondatrice V1 · prérequis doctrinal identifié pour GPT Vision (Doctrine de la Mémoire Visuelle) · prérequis architectural identifié pour Wallet Intelligence (ADR frontière local/cloud).

**Signal d'alerte**
Tout nouveau module qui envoie une donnée utilisateur vers un serveur externe sans mécanisme de consentement explicite documenté. Toute dépendance à une API externe sans fallback local documenté.

---

### 10.6 — Dérive du Corpus Cognitif en profil utilisateur

**Description**
Le Corpus Cognitif (~50 concepts : biais, patterns, états, transitions) pourrait être utilisé pour assigner à l'opérateur des "biais dominants" ou un "profil cognitif" à partir des patterns détectés. Exemple : "vous présentez principalement des patterns de FOMO et d'aversion à la perte".

**Pourquoi c'est un risque**
Un profil cognitif est interdit au même titre qu'un profil de trading (invariant I-06 — profil interdit). L'assignation de biais dominants crée une étiquette identitaire permanente qui viole Pattern Reflection Doctrine V1 et OI V1 Anti-dérive A. La formulation "vous êtes un trader FOMO" est exactement ce que le produit refuse de produire.

**Protection actuelle**
Invariant I-06 · Pattern Reflection Doctrine V1 (motifs ≠ profils) · OI V1 Anti-dérive A (interdiction du profil unique global).

**Signal d'alerte**
Tout composant qui agrège les patterns détectés sur plusieurs sessions pour produire une liste de "biais caractéristiques" de l'opérateur. Toute formulation associant un concept cognitif à l'identité ("vous êtes", "votre profil cognitif").

---

### 10.7 — Doublon OI V1 / Behavioral Engine

**Description**
OI V1 (style opérateur sur Order History — dimensions Exécution, Capital, Portefeuille, Cadence) et le Behavioral Engine (scoring comportemental sur Trade History — Discipliné/Réactif/Impulsif/Agressif) décrivent tous deux des aspects comportementaux de l'opérateur. Présentés côte à côte sans distinction claire, ils peuvent être confondus ou fusionnés dans une synthèse.

**Pourquoi c'est un risque**
Ces deux systèmes ont des sources, des horizons temporels et des objets distincts. OI V1 décrit le *style d'exécution* sur des mois. Le Behavioral Engine décrit le *comportement de session* sur des semaines. Leur fusion produirait un verdict global qui ne correspond à aucun des deux — et violerait la règle de non-fusion de OI V1 §XII.

**Protection actuelle**
OI V1 Doctrine §XII (règle de non-fusion explicite) · séparation physique des modules (`behavior/analytics/scoring.js` vs. `oi-*.js`) · niveaux de confiance distincts dans chaque système.

**Signal d'alerte**
Toute interface qui affiche le score comportemental (0-100) et les dimensions OI V1 dans le même panneau sans distinction claire de source et d'horizon. Toute synthèse qui combine les deux en un verdict unique.


---

### 10.8 — Dérive documentaire

**Description**
L'écosystème documentaire de Caméléon Engine est riche (~240 fichiers). À mesure que le projet évolue, des documents de travail, des réflexions intermédiaires et des versions alternatives s'accumulent. Sans discipline documentaire stricte, deux documents peuvent prétendre être la référence pour le même sujet.

**Pourquoi c'est un risque**
Un développeur qui consulte deux documents décrivant la même famille mémoire avec des nomenclatures différentes (ex. "6 familles" vs. "5+4+3+Référentiel") peut prendre une décision d'implémentation fondée sur le document le moins récent. La dérive documentaire est silencieuse — aucun test ne détecte qu'un document de référence est en conflit avec un autre.

**Protection actuelle**
Doctrine de Construction Documentaire V1 (6 phases : squelette → audit → validation → remplissage → audit global → gel) · Protocole documentaire V1 · règle de gel après certification · Grand Plan Directeur V1 (Partie VII — cartographie des tensions documentaires identifiées).

**Signal d'alerte**
Deux documents prétendant être la référence canonique pour le même périmètre avec des formulations différentes. Un document de travail ou une réflexion intermédiaire cité comme référence sans avoir subi le cycle de certification. Une version "_v2", "_corrigé" ou "_final" créée sans gel préalable du document original.

---

## AUTO-VÉRIFICATION — PARTIE X

**Doublons avec les autres parties :**
Les blancs (modules absents) ne sont pas répétés ici — la Partie X traite uniquement des risques dans ce qui existe ou est prévisible. Les dépendances des futurs modules sont en Partie IX. Les signaux d'alerte sont propres à cette partie — ils n'apparaissent nulle part ailleurs.

**Doublons internes :**
Chaque risque couvre un mécanisme de dérive distinct. Les risques 10.1 et 10.7 sont proches (fusion inter-couches et doublon OI V1 / Behavioral Engine) mais opèrent à des niveaux différents : 10.1 concerne la fusion dans le pipeline décisionnel, 10.7 concerne la confusion dans la présentation à l'opérateur. Le risque 10.8 (dérive documentaire) est de nature transversale — il s'applique à tout le projet, pas à un composant isolé.

**Cohérence doctrinale :**
Chaque risque est ancré dans au moins une doctrine ou un invariant existant. Aucun risque n'est proposé sans protection existante identifiée — ou sans signal d'alerte permettant de le détecter tôt. Aucune solution d'implémentation n'est prescrite.


---

# GRAND PLAN DIRECTEUR V1

## PARTIE XI — FUTURS PILIERS DU PRODUIT

*Cette partie identifie les éléments qui deviendront structurellement fondamentaux à long terme — pas demain, pas dans le prochain chantier.*
*Un pilier n'est pas une fonctionnalité. C'est un composant dont d'autres choses dépendent et qui transforme la nature du produit.*
*Les prérequis techniques sont en Partie IX. Les blancs correspondants sont en Partie VIII. Cette partie ne propose pas d'ordre de développement.*

---

### 11.1 — Timeline

**Pourquoi ce sera un pilier**

Sans axe temporel unifié, la mémoire accumulée est une collection de fragments sans ordre. Chaque famille — sessions comportementales, snapshots formulaire, ordres OI V1 — vit dans son propre format, sans lien chronologique commun. La Timeline est l'axe qui transforme ces fragments en une histoire lisible du décideur.

C'est la différence entre une bibliothèque (où les informations existent mais doivent être cherchées séparément) et un journal de bord (où elles s'organisent naturellement dans le temps).

**Ce qu'elle rend possible**

La première fois que l'opérateur peut voir, pour une date donnée : le contexte macro déclaré, l'état comportemental enregistré, la décision prise via le formulaire, les patterns détectés à cette période. Ces quatre éléments existent aujourd'hui — ils ne peuvent pas être mis en regard sans la Timeline.

Elle rend également possible la question : "Ma dégradation comportementale de novembre correspondait-elle à quelque chose de particulier dans ma mémoire contextuelle ?" Aujourd'hui, cette question n'a pas de réponse accessible.

---

### 11.2 — Référentiel (Corpus Cognitif formalisé)

**Pourquoi ce sera un pilier**

Le Corpus Cognitif (~50 concepts : biais, patterns, états, transitions) existe en documentation mais reste disconnecté du code. Sans Référentiel formel, le système décrit des comportements en termes bruts — il ne peut pas les qualifier dans un vocabulaire partagé avec l'opérateur.

Un moteur qui détecte un "burst d'activité" et un moteur qui peut nommer ce burst "anticipation compulsive" (concept défini dans le Corpus) ne produisent pas le même niveau de lecture. Le Référentiel est le pont entre l'observation mécanique et la compréhension humaine.

**Ce qu'il rend possible**

Des observations qualifiées. Le coaching peut devenir plus précis sans devenir prescriptif — nommer est différent de juger. L'opérateur qui retrouve dans le Référentiel le concept exact qui décrit son comportement reconnaît quelque chose de vrai, au lieu de recevoir une étiquette générique.

Il rend également possible la cohérence terminologique entre le code, la documentation et l'interface — les trois emploient aujourd'hui des vocabulaires partiellement distincts.

---

### 11.3 — Corrélateur (L2 Relationnelle)

**Pourquoi ce sera un pilier**

La promesse centrale de Caméléon Engine — "révéler ce qu'aucune donnée isolée ne pourrait mettre en évidence" — ne peut pas être tenue sans corrélateur. Aujourd'hui, chaque famille mémoire est une île. Le Constellium visualise des connexions existantes, mais aucun composant ne détecte automatiquement des relations entre familles.

Le corrélateur est l'engine de la proposition de valeur unique du produit. Sans lui, la multiplicité des familles mémoire est une promesse non tenue.

**Ce qu'il rend possible**

Des corrélations cross-familles invisibles à l'œil nu. "Tes sessions avec un guardLevel Friction correspondent à 80% à des contextes où dominanceMacro était active — cette relation n'est visible qu'en croisant SY1 et S5." Ce type d'observation est structurellement impossible avec les outils actuels, quelles que soient les données accumulées.

Il rend également possible l'alimentation dynamique de Constellium — les connexions ne sont plus seulement visualisées, elles sont découvertes.

---

### 11.4 — Wallet Intelligence réel

**Pourquoi ce sera un pilier**

Caméléon Engine entre aujourd'hui en phase d'attente dès que l'opérateur cesse de trader. C'est une limite d'architecture mémorielle, pas une limite technique : le produit dépend presque exclusivement de S1 (Transactionnelle). Wallet Intelligence active S2 (Patrimoniale) — la seule famille qui évolue quotidiennement sans transaction.

Un staking génère des revenus chaque jour. Un portefeuille on-chain se réévalue en permanence. Ces évolutions ne nécessitent aucune action de l'opérateur — et pourtant elles constituent une mémoire patrimoniale riche.

**Ce qu'il rend possible**

Un engagement quotidien avec le produit indépendant de la fréquence de trading. L'opérateur qui ne trade pas pendant un mois voit toujours sa mémoire s'enrichir. La valeur du produit cesse d'être conditionnée à l'activité transactionnelle — premier pas vers la proposition "un miroir qui se souvient même quand tu ne fais rien".

---

### 11.5 — Journal Personnel

**Pourquoi ce sera un pilier**

Le Journal est la seule source qui capture l'intention avant la décision. Toutes les autres sources (CSV, PDF, captures d'écran, snapshots formulaire) capturent des résultats ou des états. Sans journal, SY4 (D'apprentissage) ne peut pas exister — la boucle intention → décision → conséquence → leçon ne se ferme jamais.

C'est une limite fondamentale : sans capture de l'intention, le système ne peut jamais dire "voilà ce que tu pensais avant que cela arrive". Il ne peut décrire que ce qui s'est passé, jamais pourquoi l'opérateur l'avait voulu.

**Ce qu'il rend possible**

La fermeture de la boucle d'apprentissage. "J'entre parce que je pense que BTC va casser 70k" — retrouver cette note trois mois plus tard avec ce qui s'est réellement passé. La première fois que le produit peut faciliter un apprentissage rétrospectif ancré dans l'intention déclarée, pas seulement dans le résultat observé.

Il rend également possible un engagement quotidien sans transaction — écrire une réflexion, noter un contexte, formuler un objectif sont des actes de mémoire qui ne dépendent pas du marché.

---

### 11.6 — Assistant Mémoire (L3 Cognitive)

**Pourquoi ce sera un pilier**

À mesure que la mémoire s'accumule — sessions, patterns, ordres, snapshots, notes — la synthèse manuelle devient impossible. L'opérateur qui a trois ans de mémoire ne peut pas relire et croiser lui-même des milliers de traces pour trouver ce qui est structurellement vrai de son comportement. L'Assistant Mémoire est la couche qui transforme l'accumulation en connaissance exploitable.

Il représente la réalisation la plus complète du principe fondateur : "un miroir qui se souvient". Avec suffisamment de mémoire et un assistant pour en faciliter la lecture, le produit tient sa promesse à long terme — la valeur croît avec le temps, pas malgré lui.

**Ce qu'il rend possible**

Une question posée à la mémoire accumulée : "Quelles situations ressemblent à aujourd'hui ?" ou "Qu'est-ce qui se passait les fois où j'étais en Dérive ?" Ces questions nécessitent de croiser L1 (Temporelle), L2 (Relationnelle), et plusieurs familles sources — ce n'est possible qu'avec L3 active.

Il rend également possible le "Test des 10 ans" — un opérateur avec dix ans de mémoire accumulée qui peut retrouver, qualifier et comprendre son évolution de décideur dans toute sa profondeur.

**Note de prudence**
C'est le pilier dont le développement est le plus exposé aux risques doctrinaux (Partie X, risques 10.1, 10.4, 10.6). Sa valeur est la plus haute à long terme. Son risque de dérive est également le plus élevé. Il nécessite l'existence préalable des autres piliers pour être efficace — et la Doctrine de l'Assistant Mémoire avant toute implémentation.

---

## AUTO-VÉRIFICATION — PARTIE XI

**Doublons avec les autres parties :**
Les prérequis techniques de chaque pilier ne sont pas redéveloppés ici — ils sont en Partie IX. Les blancs correspondants ne sont pas redécrits — ils sont en Partie VIII. Les risques associés ne sont pas répétés — ils sont en Partie X. La Partie XI se concentre exclusivement sur la valeur stratégique et ce que chaque pilier rend possible.

**Doublons internes :**
Wallet Intelligence (11.4) et Journal Personnel (11.5) partagent le même bénéfice "engagement quotidien sans transaction" — c'est intentionnel et signalé : ils résolvent le même problème par deux familles mémoire distinctes (S2 et S4). Ce n'est pas un doublon — c'est une convergence stratégique.

**Cohérence doctrinale :**
Aucun pilier n'est décrit comme "à développer". Aucun ordre n'est proposé. L'Assistant Mémoire est explicitement signalé comme le pilier avec le risque doctrinal le plus élevé — sans pour autant être dépriorisé ou écarté. Le manifesto §XIV ("extensions naturelles") est respecté : Journal, Timeline, modules de lecture supplémentaires y figurent explicitement comme extensions compatibles.


---

# GRAND PLAN DIRECTEUR V1

## PARTIE XII — VUE SYSTÈME

*Un seul schéma. Le plus simple possible.*
*Objectif : permettre à quelqu'un découvrant Caméléon Engine de comprendre le projet entier en quelques minutes.*

---

### 12.1 — Schéma principal

```
╔═══════════════════════════════════════════════════════════════════╗
║                      CAMÉLÉON ENGINE                             ║
║                "Un miroir qui se souvient"                       ║
╚═══════════════════════════════════════════════════════════════════╝

                          OPÉRATEUR
                              │
              ┌───────────────┴───────────────┐
              │                               │
    DÉCLARATION (temps réel)         ARCHIVES (fichiers)
    Formulaire 16 champs             CSV · XLSX · PDF
    Contexte macro                   [Journal · Wallet · Vision]
              │                               │
              ▼                               ▼
    ┌─────────────────┐           ┌─────────────────────┐
    │ MOTEUR          │           │ MOTEURS             │
    │ DÉCISIONNEL     │           │ ANALYTIQUES         │
    │                 │           │                     │
    │ V1 — pipeline   │           │ Comportemental      │
    │ V2 — cohérence  │           │ OI V1               │
    │ Confiance       │           │ Pattern · Coaching  │
    │ Macro overlay   │           │ Mémoire             │
    └────────┬────────┘           └──────────┬──────────┘
             │                              │
             │                    ┌─────────▼──────────┐
             │                    │      MÉMOIRE        │
             │                    │                     │
             │                    │  5 sources          │
             │                    │  4 synthèses        │
             │                    │  3 couches          │
             │                    │  Référentiel        │
             │                    └─────────┬──────────┘
             │                              │
             └──────────────┬───────────────┘
                            │
                    ┌───────▼────────┐
                    │    COCKPIT     │
                    │                │
                    │  4 zones       │
                    │  Onglet Mémoire│
                    │  Constellium   │
                    │  Debug Brain   │
                    └───────┬────────┘
                            │
                        OPÉRATEUR
                      Autorité finale
                   Décision toujours humaine
```

---

### 12.2 — Lecture en 3 phrases

**L'opérateur alimente le système de deux façons :** par déclaration directe (formulaire — ce qu'il observe maintenant) et par archives (fichiers — ce qu'il a fait dans le passé). Ces deux entrées passent par des moteurs distincts selon leur nature.

**Les moteurs produisent deux sorties complémentaires :** une décision structurée immédiate (payload → cockpit) et une mémoire accumulée (familles S1-S5, SY1-SY4, L1-L3). Ces deux sorties convergent dans le cockpit, qui les restitue simultanément à l'opérateur.

**L'opérateur est aux deux extrémités du système :** il fournit les entrées, il reçoit la restitution, et il reste l'autorité finale de toute décision. Le système ne décide jamais — il rend la décision lisible.

---

### 12.3 — Règle d'invariance du schéma

Ce schéma est stable par construction. Tout nouveau module s'insère dans l'une de ses couches existantes sans modifier la structure.

| Futur module | S'insère dans |
|---|---|
| Wallet Intelligence | Archives → Moteurs Analytiques → Mémoire (S2) |
| Journal Personnel | Archives → Moteurs Analytiques → Mémoire (S4) |
| GPT Vision | Archives → Moteurs Analytiques → Mémoire (S3) |
| Timeline | Couche L1 dans Mémoire → Cockpit |
| Corrélateur | Couche L2 dans Mémoire → Cockpit |
| Assistant Mémoire | Couche L3 dans Mémoire → Cockpit |
| UI Operator Intelligence | Cockpit (nouvelle zone ou onglet) |

**Aucun futur module ne nécessite de modifier le schéma lui-même.** Si un module proposé ne s'insère pas naturellement dans l'une des couches existantes, c'est un signal architectural : soit le module n'appartient pas au système, soit le schéma est incomplet.

Le schéma est donc un **test de cohérence implicite** — tout module dont la place n'est pas évidente mérite une question doctrinale avant d'être développé.

---

## AUTO-VÉRIFICATION — PARTIE XII

**Doublons avec les autres parties :**
Le schéma ne redécrit pas les moteurs (Partie IV), les familles mémoire (Partie V), ni les outils (Partie VI). Il positionne chaque couche sans en développer le contenu. La lecture en 3 phrases n'introduit aucune information nouvelle — elle guide la lecture du schéma.

**Doublons internes :**
La règle d'invariance (12.3) complète le schéma (12.1) sans le répéter — elle explique pourquoi le schéma est stable, en montrant comment les futurs modules s'y insèrent. Aucune redondance entre les trois sections.

**Cohérence doctrinale :**
L'opérateur apparaît deux fois — en entrée et en sortie — ce qui reflète l'invariant I-02 (Autorité humaine) et le principe fondateur ("rendre la décision lisible sans la prendre"). Le schéma ne montre aucune flèche directe "moteur → décision" : la décision émerge du cockpit vers l'opérateur, jamais du moteur seul. La hiérarchie de gouvernance (Vision → Implémentation) est volontairement absente de ce schéma — elle est en Partie I, et les deux hiérarchies restent séparées conformément à la section 1.3.


---

# GRAND PLAN DIRECTEUR V1

## PARTIE XIII — TERRAIN POUR LA FUTURE ROADMAP

*Cette partie prépare le terrain sans construire la Roadmap.*
*Elle décrit l'état du sol — ce qui est solide, ce qui est bloqué, ce qui attend une décision.*
*La Roadmap elle-même appartient à l'opérateur. Elle ne figure pas ici.*

---

### 13.1 — Ce qui est solide (fondations disponibles)

Ces éléments sont stables, validés terrain, et peuvent être utilisés comme fondations sans risque de régression.

| Fondation | État | Note |
|---|---|---|
| Pipeline décisionnel V1 | Stable — production | Référence canonique : `canonical_motor_state_2026.md` |
| Pipeline V2 (Phases 1-4) | Actif — cockpit + debug | Phase 6 calibration non démarrée |
| Behavioral Engine + boucle mémoire V1 | Opérationnel | W1/W2 · moyenne · distribution · FIFO 50 |
| OI V1 (moteur + persistance) | Calculé et persisté | UI dédiée absente — moteur solide |
| CSV/XLSX Import | Stable | Même pipeline à partir de `canonical.js` |
| PDF Import V1 | Clos — maintenance | Ne pas rouvrir sauf régression |
| Compte Utilisateur V1 (LOT 1-3) | Qualifié terrain | iPad Chrome + PC Chrome validés |
| Storage layer | Stable — renforcé LOT-H02 | Contrat architectural respecté |
| Macro Layer Phase 1 | Clôturé | Overlay narratif uniquement — MACRO-RULE-01 intact |
| Constellium V1 | Scellé | Conditions §13 à satisfaire avant réouverture |
| Language System V1 | Appliqué | Source de vérité pour tout texte UI |
| Architecture Conceptuelle Fondatrice V1 | Active | Dictionnaire · invariants · familles validés |
| Toutes les doctrines N0-N2 | Permanentes | Références actives sans exception |

---

### 13.2 — Ce qui peut être développé sans prérequis doctrinal ou architectural majeur

Ces modules peuvent être engagés sans qu'une nouvelle doctrine ou une refonte architecturale soit nécessaire. Ils ont leurs propres prérequis mineurs, identifiés.

**UI Operator Intelligence**
Le moteur calcule les 4 dimensions. La persistance est active (`CE_oi_history_v1`). Seule l'interface manque. Aucune doctrine bloquante — OI V1 Doctrine couvre déjà les règles de restitution. Prérequis unique : décision UX sur la forme de présentation (onglet dédié, panneau, intégration existante).
C'est le module avec le ratio valeur/prérequis le plus favorable de tout le projet.

**Wallet Intelligence V1 (premier périmètre)**
L'infrastructure est posée. S2 Patrimoniale est définie. Un premier périmètre minimal (import manuel de snapshot patrimonial, sans API blockchain) contournerait la question locale/cloud. Prérequis unique : décision architecturale explicite sur la frontière local/cloud (ADR, pas une doctrine).

**Macro Layer Phase 2**
L'architecture des phases suivantes est documentée (`macro-layer-strategic-architecture.md`). Phase 1 est close et stable. Une phase 2 d'enrichissement de S5 Contextuelle peut s'appuyer sur la fondation existante sans remettre en cause MACRO-RULE-01.

---

### 13.3 — Ce qui nécessite une doctrine avant de commencer

Ces modules sont architecturalement identifiables mais doctrinalement bloqués. Développer l'un d'eux sans sa doctrine préalable expose le produit à des violations des invariants existants.

| Module | Doctrine manquante | Risque sans elle |
|---|---|---|
| Journal Personnel | Doctrine de la Mémoire Personnelle | Violation possible de Memory Doctrine V1 · glissement vers le coaching |
| GPT Vision | Doctrine de la Mémoire Visuelle | Violation I-01 (local-first) · données sensibles sans cadre de consentement |
| Corrélateur actif | Doctrine des Corrélations | Corrélation présentée comme causalité · violation Lecture ≠ Action |
| Assistant Mémoire | Doctrine de l'Assistant Mémoire | Dérive vers le conseil · assignation d'identité · I-06 violé |
| Référentiel formel | Doctrine du Référentiel | Corpus connecté au code sans règles d'usage · dérive profil cognitif |

---

### 13.4 — Ce qui nécessite une architecture avant de commencer

Ces modules dépendent de fondations architecturales qui n'existent pas encore. Une doctrine suffisante ne serait pas un prérequis bloquant — c'est l'infrastructure technique qui manque.

**Modèle de données unifié cross-familles**
La Timeline, le Corrélateur et l'Assistant Mémoire nécessitent tous de croiser plusieurs familles mémoire. Aujourd'hui, chaque famille utilise ses propres formats de date, ses propres structures de données, ses propres clés de stockage. Sans normalisation cross-familles, aucune de ces trois couches ne peut opérer.

**Index chronologique**
La Timeline nécessite un accès chronologique aux données — mode d'accès qui n'existe pas dans `storage.js` (organisé par type, non par date). Un index chronologique est un prérequis structurant.

**Évolution du périmètre Constellium**
Le Corrélateur alimenterait Constellium en liens découverts — ce qui implique une décision explicite sur le statut scellé. Ce n'est pas un chantier technique : c'est une décision de gouvernance (conditions §13) avant toute architecture.

---

### 13.5 — L'équation de la future Roadmap

#### Les nœuds de dépendance partagés

Plusieurs modules futurs partagent exactement les mêmes prérequis. Ces nœuds sont des **chantiers multiplicateurs** : les résoudre une fois débloque plusieurs modules simultanément.

| Nœud partagé | Modules débloqués |
|---|---|
| Modèle de données unifié cross-familles | Timeline · Corrélateur · Assistant Mémoire |
| Décision frontière local/cloud | Wallet Intelligence · GPT Vision |
| Extension du Language System V1 | Journal · Corrélateur · Assistant Mémoire |
| 4 nouvelles doctrines (Personnelle · Visuelle · Corrélations · Assistant) | Journal · GPT Vision · Corrélateur · Assistant Mémoire |
| Évolution de `storage.js` (nouveaux types) | Journal · Wallet Intelligence · GPT Vision |
| Décision sur Constellium (§13) | Corrélateur (alimentation des liens découverts) |

#### Le cadre de décision

La future Roadmap sera cohérente avec la Doctrine Mémoire Vivante V1 si elle répond, dans l'ordre, à ces trois questions :

> **1. Quelle famille mémoire est la plus vide et la plus utile à activer maintenant ?**
> *(Identifié en Partie V — état actuel de chaque famille)*

> **2. Quel nœud de dépendance partagé débloque le plus de valeur en une seule décision ?**
> *(Identifié ci-dessus — les nœuds multiplicateurs)*

> **3. Quel prérequis — doctrinal ou architectural — doit être levé en premier ?**
> *(Identifié en 13.3 et 13.4)*

Ce cadre ne prescrit pas de réponse. Il structure la décision pour qu'elle soit consciente, alignée sur la Vision, et non réactive à l'urgence perçue.

#### État du terrain au 2026-07-06

La cartographie est complète. Les fondations sont solides. Le module avec le ratio valeur/prérequis le plus favorable est identifié (UI Operator Intelligence — 13.2). Les nœuds multiplicateurs sont identifiés. Les doctrines manquantes sont listées sans être créées.

Le terrain est prêt. La Roadmap appartient à l'opérateur.

---

## AUTO-VÉRIFICATION — PARTIE XIII

**Doublons avec les autres parties :**
Les prérequis doctrinaux ne sont pas redécrits ici — ils sont listés avec leur référence en Partie VIII (8.4). Les dépendances techniques ne sont pas redéveloppées — elles sont en Partie IX. Les piliers futurs ne sont pas justifiés ici — ils sont en Partie XI. La Partie XIII synthétise sans répéter.

**Doublons internes :**
Les nœuds de dépendance partagés (13.5) consolident des informations dispersées dans les Parties VIII, IX et XI — c'est leur rôle, pas une répétition. Ils n'introduisent aucune information nouvelle : ils regroupent ce qui était épars.

**Cohérence doctrinale :**
Aucun ordre de développement n'est proposé. Aucun LOT n'est ouvert. L'observation sur UI Operator Intelligence est formulée comme un constat factuel (ratio valeur/prérequis) et non comme une recommandation. Le cadre de décision (13.5) est un outil de questionnement, pas une roadmap déguisée. La phrase finale — "Le terrain est prêt. La Roadmap appartient à l'opérateur." — respecte l'invariant I-02 (Autorité humaine) au niveau de la gouvernance du projet.


---

# GRAND PLAN DIRECTEUR V1

## CLÔTURE

---

### Rôle de ce document

Le Grand Plan Directeur V1 est une cartographie de référence. Il répond à une seule question : **où se situe exactement chaque élément du projet dans l'écosystème Caméléon Engine ?**

Il a été produit après une phase de réflexion stratégique majeure — pose de la Doctrine Mémoire Vivante V1, de la Doctrine de Gouvernance V1, et de l'Architecture Conceptuelle Fondatrice V1 — pour établir une représentation complète et cohérente du projet avant toute reprise de développement.

---

### Ce que ce document est

- Une carte de l'existant : blocs, moteurs, outils, familles mémoire, flux, documents.
- Un inventaire des blancs : ce qui manque, pourquoi, et ce qui est volontairement laissé vide.
- Une carte des dépendances : ce qui est impacté quand un module futur est développé.
- Un inventaire des risques : ce qui pourrait dériver dans l'architecture existante.
- Un terrain préparé : ce qui est solide, ce qui est bloqué, ce qui attend une décision.

---

### Ce que ce document n'est pas

- Il **ne remplace aucune doctrine**. Les doctrines actives (Language System V1, Lecture ≠ Action, Memory Doctrine V1, OI V1, Pattern Reflection, Gouvernance V1, Architecture Conceptuelle Fondatrice V1) restent leurs propres références. Ce document les cartographie, il ne les résume pas.
- Il **ne remplace aucune architecture détaillée**. Les documents d'architecture technique (`canonical_motor_state_2026.md`, `constellium_v1_definition.md`, `oi_v1_*_architecture.md`, etc.) restent leurs propres références. Ce document les positionne, il ne les développe pas.
- Il **ne remplace aucune roadmap**. Il prépare le terrain de la future Roadmap — la décision de ce qui sera développé, dans quel ordre, appartient à l'opérateur.
- Il **ne constitue pas une spécification d'implémentation**. Aucune section de ce document n'autorise l'ouverture d'un chantier de code.

---

### Comment utiliser ce document

**Pour orienter une décision produit :** consulter la Partie I (niveaux) et la Partie XIII (terrain Roadmap) pour situer la décision dans l'architecture globale.

**Pour localiser un bloc ou un module :** consulter la Partie II (inventaire des blocs) et la Partie VI (outils).

**Pour comprendre un flux de données :** consulter la Partie III (flux) et la Partie IV (moteurs).

**Pour évaluer l'impact d'un futur développement :** consulter la Partie IX (dépendances) et la Partie X (risques).

**Pour vérifier la cohérence d'une idée avec la vision :** consulter la Partie XII (schéma — règle d'invariance) et la Partie XI (piliers futurs).

**Pour identifier ce qui manque :** consulter la Partie VIII (blancs) et la Partie V (familles mémoire).

---

### Conditions de mise à jour

Ce document est une V1 datée. Il décrit l'état du projet au **2026-07-06**.

Il peut évoluer dans deux circonstances :

**Mise à jour ponctuelle :** lorsqu'un chantier majeur est clôturé (nouveau bloc livré, nouvelle doctrine posée, blanc résorbé). La mise à jour concerne uniquement la section impactée — pas une réécriture complète.

**Nouvelle version (V2) :** lorsque l'Architecture Conceptuelle Fondatrice V1 sort de sa phase de maturation, ou lorsque suffisamment de piliers futurs (Partie XI) sont devenus réalité pour que la cartographie soit structurellement différente.

**Ce qui ne justifie pas de mise à jour :** l'ouverture d'un LOT, une correction de bug, une modification d'UX localisée. Ces événements sont documentés dans leurs propres chantiers.

---

### Observations architecturales — statuts post-gel

Les 16 observations identifiées pendant la construction ont été traitées lors de la Phase 5 (audit global). Les corrections nécessaires et recommandées ont été intégrées avant le gel. Les améliorations facultatives sont reportées à une V2.

| Ref | Observation | Statut |
|---|---|---|
| OA-01 | Dissocier "Outils" et "Familles mémoire" dans la pyramide | **Intégré — C1** : pyramide corrigée à 9 niveaux |
| OA-02 | Vérifier la hiérarchie système — placement des moteurs | **Intégré — R1** : note d'exécution ajoutée en I.1.3 |
| OA-03 | Wallet Infrastructure comme bloc émergent en Partie II | Résolu pendant la construction — Partie II §2.4 |
| OA-04 | Harmoniser Mémoire Vivante V1 avec 5+4+3+Référentiel | Tension cartographiée en 7.1 — correction dans le document source (hors GPD) |
| OA-05 | Wallet Intelligence : flux ou seulement dans les blancs | Résolu pendant la construction — absent de III, présent en VIII |
| OA-06 | Moteur Parser : unique ou famille d'outils | Résolu pendant la construction — moteur unique avec branches documentées |
| OA-07 | S5 Contextuelle : périmètre des snapshots formulaire | **Intégré — R4** : note de périmètre ajoutée en V.5.2 |
| OA-08 | Formulaire : outil ou interface d'entrée décisionnelle | Résolu pendant la construction — "point d'entrée" en VI.6.4 |
| OA-09 | ACF V1 : doublon 7.1 / 7.2 | **Intégré — R2** : renvoi en 7.1, entrée principale en 7.2 |
| OA-10 | `mem-v2-compte-memoire-persistante.md` : historique ou préfiguration | Amélioration facultative — reportée V2 |
| OA-11 | Partie VIII : distinguer nature des blancs (volontaire / technique / bloquant) | **Intégré — R3** : qualification ajoutée par catégorie |
| OA-12 | Nœuds de dépendance partagés | Résolu pendant la construction — intégré en XIII.5 |
| OA-13 | Risque de dérive documentaire en Partie X | **Intégré — C2** : risque 10.8 ajouté |
| OA-14 | UI Operator Intelligence : pilier court terme ou passerelle | Amélioration facultative — reportée V2 |
| OA-15 | Schéma XII : distinguer graphiquement existant et futur | Amélioration facultative — reportée V2 |
| OA-16 | Section statut du document dans la Clôture | Résolu pendant la construction — "Conditions de mise à jour" |

---

### Conclusion officielle

Le Grand Plan Directeur V1 est complet et certifié.

Il couvre treize parties, seize observations architecturales traitées, et l'ensemble des blocs, moteurs, outils, familles mémoire, flux, documents, blancs, dépendances, risques et piliers du projet au 2026-07-06.

Il ne modifie rien. Il décrit ce qui est.

Il est la carte officielle de Caméléon Engine jusqu'à publication d'un Grand Plan Directeur V2.

---

*Document produit par cycle de gouvernance documentaire complet — construction progressive · auto-vérification · audit global · certification · gel officiel. Caméléon Engine, 2026-07-06.*
