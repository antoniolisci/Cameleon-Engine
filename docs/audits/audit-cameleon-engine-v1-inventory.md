# AUDIT-CAMELEON-ENGINE-V1 — Inventaire stratégique complet

> Document d'audit produit · Non implémentable · 2026-06-09
> Auteur : audit produit interne
> Référence : codebase `src/` · docs/ · mémoire projet
> Statut : RÉFÉRENCE AUDIT V1

---

## 1. Résumé exécutif

### État réel du produit

Caméléon Engine est en ligne sur `https://cameleonengine.app`. Il fonctionne techniquement : moteur de décision actif, analyses comportementales sur import, mémoire locale opérationnelle, export JSON utilisateur disponible.

Le produit est une **bêta candidate V1**. Ni prototype (le moteur est stable et calibré), ni produit commercial (pas de compte utilisateur, pas de mémoire cloud, pas d'onboarding guidé). La description la plus précise : un outil profondeur-maximal avec un **parcours utilisateur inexistant**.

### Force principale

Le moteur de décision est cohérent, documenté et fidèle à sa doctrine. Le module comportemental (import CSV/XLSX/PDF, 5 patterns, 4 profils, scoring calibré) est une couche analytique réelle — pas déclarative. La philosophie produit (friction intelligente, miroir comportemental, autonomie préservée) est lisible dans chaque composant et définit un territoire différenciant clair.

### Risque principal avant bêta

**Un utilisateur qui ouvre le produit ne sait pas par où commencer.** L'interface expose simultanément 5 onglets + une sidebar avec Debug Brain + un header avec 5 chips + un hero section avec 6 blocs distincts. La surface de premier écran est surchargée. Le retour terrain ("trop de choses, je ne comprends rien") est précis et prévisible : aucun chemin d'entrée n'est indiqué.

Le produit a été construit par accumulation de couches correctement architecturées. Il n'a pas encore été construit pour un utilisateur qui arrive pour la première fois.

---

## 2. Inventaire produit

### Zones principales

| Zone | Rôle | Statut | Valeur utilisateur | Maturité | Risque / Dette |
|---|---|---|---|---|---|
| **Moteur** | Décision 16 champs → verdict structuré | ACTIF | Forte · cœur du produit | Élevée | Surexposition visuelle — trop de blocs simultanés |
| **Pilotage** | Formulaire de saisie des 16 champs + sorties techniques | ACTIF | Forte (saisie) · Faible (sorties techniques) | Élevée | Onglet "Pilotage" perçu comme technique — pas intuitif pour nouveau |
| **Mémoire** | Historique sessions, export JSON, diagnostic stockage | ACTIF | Différée · forte après 3+ sessions | Élevée | Zones multiples dans un seul onglet (données / signal / diagnostic / journal) |
| **Comportement** | Import CSV/XLSX/PDF → analyse patterns → profil | ACTIF | Forte · nécessite import | Élevée | Entrée uniquement sur données historiques — invisible sans fichier |
| **Manifeste** | Doctrine produit accessible en onglet | ACTIF / À DÉPLACER | Interne · nul pour l'utilisateur novice | Moyenne | Un manifeste de 16 sections en onglet principal confond le produit avec une œuvre |
| **Portefeuille V1** | Snapshot wallet depuis Wallet History import | ACTIF | Différée · nécessite import | Moyenne | Dans l'onglet Mémoire, pas clairement identifié |
| **Debug Brain** | Lecture brute du moteur (sidebar permanente) | INTERNE | Nul en usage normal | Élevée technique | Visible en permanence dans la sidebar → signal "outil pour développeurs" |
| **Constellium** | Couche d'expression dormante + panel explicatif | DORMANT / À MASQUER | Nul V1 · confus | Basse | Boutons "Tester une lecture Constellium" et "Lire le Constellium" visibles dans Pilotage |
| **Publications Paragraph** | Sélection d'articles contextualisés selon l'état marché | ACTIF / À CLARIFIER | Symbolique · lien externe | Moyenne | Le lien Paragraph renvoie vers une URL externe — 404 signalé sur iPad |
| **Macro (Dominance / Désordre)** | Deux champs contextuels dans Pilotage | ACTIF / PARTIEL | Faible seule · modifie le message cs-message | Basse | Fonctionnalité cachée dans le formulaire — non expliquée |
| **Lois du Caméléon** | Lien externe Notion dans sidebar | PARTIEL | Symbolique | Basse | Lien externe — dépend d'une page Notion non contrôlée |
| **Onboarding** | Overlay premier lancement | ACTIF / INSUFFISANT | Faible · 3 règles seulement | Moyenne | Overlay éphémère, ne guide pas le parcours, disparu après clic |

---

## 3. Inventaire moteur

### Pipeline actif

| Étape | Fonction | Type | Calculé | Visible utilisateur | Utile premier écran |
|---|---|---|---|---|---|
| 1. Mapping état formulaire | `mapLegacyMarketState()` | Technique | Oui | Non | Non |
| 2. Score brut 0–100 | `computeScore()` / `baseEngine()` | Calculé | Oui | Oui (affiché "Contexte marché") | Oui |
| 3. Mode moteur | `baseEngine()` mode string | Calculé | Oui | Oui ("Mode") | Oui |
| 4. Signaux ATTACK / SNIPER bruts | `baseEngine()` | Calculé | Oui | Oui (KPI) | Expert |
| 5. Filtre profil | `profileMatrix()` | Calculé + doctrinal | Oui | Oui | Oui |
| 6. Filtre adaptatif | `applyAdaptiveFilter()` | Calculé | Oui | Partiel | Non |
| 7. Validation humaine | `applyValidation()` | Doctrinal | Oui | Oui | Oui |
| 8. Trading policy | `computeTradingPolicy()` | Calculé + doctrinal | Oui | Oui | Oui |
| 9. Payload final | `buildPayload()` | Assemblage | Oui | Oui (brut en `<details>`) | Non |
| 10. V2 pipeline | `runV2()` cohérence + hiérarchie + attention + exposition | Calculé | Oui | `cs-message` uniquement | Partiel |
| 11. Macro overlay | `applyMacroOverlay()` | Calculé | Oui | Oui (suffixe cs-message) | Non |
| 12. Moteur narratif | Textes adaptatifs selon état | Doctrinal | Oui | Oui | Oui |

### Scores exposés

| Score | Source | Visible | Comprend l'utilisateur |
|---|---|---|---|
| Contexte marché (0–100) | `computeScore()` — 18 variables | Oui | Partiellement |
| Qualité du setup (confidence score) | `confidence-score.js` — trend/structure/volatilité/volume | Oui | Non |
| Confiance d'exécution | `execution-confidence.js` | Oui | Non |
| Score comportemental (0–100) | `scoring.js` — patterns + métriques | Oui (module comportement) | Partiellement |

**Quatre scores distincts sont affichés dans l'interface.** Un utilisateur nouveau ne comprend pas leur relation, leur hiérarchie, ou lequel est le plus important.

### Point critique : 5 états comportementaux moteur

Les 5 états cognitifs du manifeste (Ancré / En Veille Active / Friction / Dérive / Rupture) apparaissent dans la doctrine (Manifeste §VI) et dans la mémoire projet. **Ils ne sont pas directement dérivés du code moteur comme états calculés.** Ce qui est calculé :

- Le moteur produit un `tradingStatus` parmi : CORE ONLY / SNIPER LIGHT / SNIPER READY / TRADE LIGHT / TRADE OK / WAIT / NO TRADE / VALIDATION BLOCK / ADJUSTED / WAIT VALIDATION (10 états internes → labels affichés : Socle / Sniper / Attaque / Attente / Protection).
- Le module comportemental produit 4 profils (Discipliné / Réactif / Impulsif / Agressif) à partir de patterns calculés.
- Les 5 états doctrinaux (Ancré…Rupture) sont présents dans le `render.js` via la lecture de `behaviorMemory` — ils sont **dérivés de la mémoire comportementale multi-sessions**, pas d'une session unique.

**Conclusion observable :** les 5 états cognitifs sont calculés via la combinaison du profil comportemental et de l'historique des sessions. Ils sont doctrinaux dans leur dénomination mais ont une base calculée réelle. Le lien entre l'état doctrinal et les calculs n'est pas documenté pour l'utilisateur.

---

## 4. Inventaire analyse comportementale

### Formats supportés

| Format | Type | Statut | Source détectée automatiquement |
|---|---|---|---|
| CSV Binance Trade History | Spot trades | ACTIF | Oui |
| CSV Binance Order History | Orders avec statut | ACTIF | Oui |
| CSV Binance Wallet History | Mouvements de fonds | ACTIF | Oui |
| XLSX Binance (3 types ci-dessus) | Même données, format Excel | ACTIF | Oui (colonnes offset corrigé) |
| PDF Binance | Relevés PDF | ACTIF | Oui (famille détectée) |
| Autres exchanges | Non Binance | NON SUPPORTÉ | N/A |

### Patterns détectés

| Pattern | Poids | Seuil déclenchement | Valeur utilisateur | Risque faux positif |
|---|---|---|---|---|
| `loss_chasing` | 25 | ≥1 séquence perte→augmentation taille | Élevée | Faible |
| `revenge_trading` | 20 | ≥1 trade émotionnel post-perte rapide | Élevée | Moyen |
| `size_inconsistency` | 20 | CV ≥ 0.5 (tailles trop variables) | Élevée | Moyen (mono-actif normal) |
| `overtrading` | 15 | Fréquence élevée sur même symbole | Élevée | Moyen (stratégies grid) |
| `rapid_reentry` | 15 | Réentrée rapide après fermeture | Moyenne | Moyen |

Modulations actives : contextualisation GRID (Order History), atténuation par profil, délai inter-trades, plafond pénalité 65 pts.

### Profils comportementaux

| Profil | Score | Signification |
|---|---|---|
| Discipliné | ≥ 80 | Patterns faibles ou absents |
| Réactif | 60–79 | Signal modéré, comportement adaptable |
| Impulsif | 40–59 | Patterns récurrents — friction recommandée |
| Agressif | 0–39 | Patterns multiples et installés |

### Limites connues

- Binance uniquement — pas de multi-exchange
- Mono-actif : `size_inconsistency` produit des faux positifs sur certains profils légitimes (documenté REAL_002)
- Score plancher ~15 sur historiques longs multi-actifs (documenté REAL_001, REAL_004) — déterministe, non bug
- Calibration post-V0 terrain requise pour ajuster les seuils de T1/T4

---

## 5. Inventaire mémoire et données utilisateur

### Clés localStorage actives

| Clé (schéma) | Contenu | Namespace | Cap | Fiabilité |
|---|---|---|---|---|
| `CE_identity_v1` | UUID opérateur + date création | Global | 1 | Élevée |
| `CE_settings_v1__{uuid}` | Profil opérateur, onglet actif | UUID | 1 | Élevée |
| `CE_payload_current_v1` | Dernier payload moteur | Global | 1 | Élevée |
| `CE_journal_entries_v1__{uuid}` | Historique moteur | UUID | 200 | Élevée |
| `CE_behavior_sessions_v1__{uuid}` | Sessions comportementales | UUID | 50 | Élevée |
| `CE_import_registry_v1__{uuid}` | Registre des imports | UUID | 100 | Élevée |
| `CE_ui_state_v1` | État UI persistant | Global | 1 | Élevée |
| `CE_backups_v1__{uuid}` | Snapshots moteur sauvegardés | UUID | 50 | Élevée |
| `cameleon_behavior_memory_v1__{uuid}` | Mémoire comportementale multi-sessions | UUID | Variable | Élevée |
| `CE_portfolio_v1__{uuid}` | Snapshots portefeuille | UUID | 50 | Élevée |

### Indicateur de saturation (ARCH-N3 — commit 41e59f9)

`getStorageLevel()` : lecture de toutes les clés `CE_*` et `cameleon*` en localStorage. Affichage `"X.X KB (Y%)"` dans Debug Brain avec niveaux normal / vigilance (≥70%) / critique (≥90%). **Indicateur passif uniquement — aucune suppression automatique.**

### Ce qui est déjà fiable

- Namespacing UUID : données isolées par opérateur sur la même machine
- Export JSON : tous les champs inclus, fichier nommé avec date
- Import Registry : evite les doubles analyses
- FIFO caps : aucun dépassement mémoire non contrôlé

### Ce qui dépend d'un compte utilisateur (F2)

- Synchronisation multi-appareils
- Persistance cross-session sur domaine changé
- Historique comportemental long terme (>50 sessions)
- Partage de données entre sessions sur navigateurs différents

### Ce qui devra être repensé avant backend

- `estimateTotalSize()` corrigée (ARCH-N3) mais pas de signal d'alerte à l'utilisateur en cas de saturation critique
- `_write()` échoue silencieusement en cas de QuotaExceededError — aucun retour utilisateur si écriture impossible
- Migration de données entre origines (D1 — domaine figé) : aucun mécanisme existant

---

## 6. Inventaire UX actuelle

### Premier écran

L'utilisateur qui arrive sur `https://cameleonengine.app/` voit simultanément :
- Un header avec 5 chips (Live, Moteur état, Mode, Mode d'emploi, Heure)
- Une sidebar avec 5 onglets de navigation
- Un sidebar Debug Brain permanent (Moteur Brut)
- Un lien externe Notion (🔗 Lois du Caméléon)
- Un hero section avec : badge + h1 + subtitle + grille 4 décisions + journal moteur + décision du jour + signal narratif + mantra + lecture marché + logo
- En scrollant : Verdict moteur, Confiance d'exécution, Posture/Action, Contexte utile, Publications

**Densité d'information au premier écran : critique.** Un nouvel utilisateur ne sait pas où regarder. Aucune hiérarchie visuelle ne guide vers le point d'entrée principal.

### Navigation actuelle

5 onglets principaux dans la sidebar : Moteur / Pilotage / Mémoire / Comportement / Manifeste.

Comportement : le module Comportement n'est pas un onglet de même niveau — il ouvre un panneau latéral séparé qui pousse le contenu. Ce n'est pas cohérent avec les 3 autres onglets principaux.

### Zones trop techniques pour V1

| Zone | Problème | Impact |
|---|---|---|
| Debug Brain (sidebar) | Visible en permanence — libellé "Moteur Brut / Lecture système" | Signal "outil de dev", pas de produit |
| Onglet "Pilotage" | Expose le formulaire brut + sorties techniques (payload, pourquoi, incohérences) | Onglet technique sans contexte pédagogique |
| 4 KPI cards (Score, Mode, ATTACK, SNIPER) | Concepts non définis pour un débutant | Confusion immédiate |
| Payload brut `<details>` | JSON technique dans "Sortie technique" | Inutile pour l'utilisateur final |
| Journal de décision | 8 champs techniques (pattern, score, alerte, badge, métamessage) | Lisible uniquement en mode expert |
| Bouton "Tester une lecture Constellium" | Dans Pilotage — concept non expliqué | Confusion sur l'identité du produit |

### Zones utiles mais mal positionnées

| Zone | Valeur réelle | Problème de position |
|---|---|---|
| Mode d'emploi (dialog) | Contient les 4 règles essentielles | Caché dans le header — pas au premier écran |
| Onboarding overlay | 3 règles claires | Disparaît au premier clic — non réaccesible |
| "Décision du jour" | La valeur la plus directe du produit | Noyée dans le hero section |
| Plan d'action (sidebar droite) | Synthèse opérationnelle directe | Dans la sidebar droite, visible uniquement après scroll |
| Prudence comportementale | Signal fort si actif | Conditionnel — absent au premier écran |

### Retours terrain réels (2026-06-09)

| Retour | Impact |
|---|---|
| iPad : scroll trop long après footer sur Moteur et Mémoire | UX mobile dégradée — footer inexistant bloquant |
| iPad : lien Constellium → 404 | Lien cassé sur appareil mobile — impression d'outil cassé |
| Vieux téléphone : textes qui débordent des cadres | Responsive incomplet sur petits écrans |
| Utilisateur non-trader : "trop de choses, ne sais pas où regarder" | Parcours utilisateur absent |

---

## 7. Inventaire architecture technique

### Structure principale

```
src/
  index.html              — SPA unique, 1186 lignes
  css/
    style.css             — ~7800+ lignes, thème principal
    behavior.css          — styles module comportemental
  js/
    render.js             — ~3600 lignes, orchestrateur DOM
    engine.js             — moteur de scoring et profils
    decision.js           — table de décision état × modifier
    trading-policy.js     — règles actions autorisées/interdites
    market-state.js       — évaluation état marché
    confidence-score.js   — score lisibilité setup
    execution-confidence.js — confiance d'exécution
    macro-context.js      — overlay narratif macro
    storage.js            — API localStorage centralisée
    state.js              — struct état global + persistance
    data.js               — constantes, labels, configs
    render.js             — DOM, animations, historique
    behavior/             — module comportemental (isolation stricte)
    v2/                   — pipeline V2 (cohérence + hiérarchie + attention + exposition)
    vendor/               — xlsx.full.min.js + pdf.min.mjs + pdf.worker.min.mjs
```

### Dépendances internes critiques

- `render.js` orchestre tout le DOM — 3600 lignes, concentration critique documentée (audit volumétrique 2026-06-02 : 36.7% du JS applicatif)
- `behavior/` isolé strict : ne lit pas le moteur, n'écrit pas de globals, communications via export JSON et localStorage
- `v2/` en shadow mode : calcule mais `V2_COCKPIT_MESSAGE: true` expose uniquement le message cs-message

### Forces architecturales

- Local-first complet : zéro appel réseau applicatif, CSP `default-src 'self'`
- ES modules natifs : pas de bundler, déploiement direct
- Isolation `behavior/` : module indépendant et testable séparément
- Namespacing UUID : isolation multi-opérateur sur même machine
- Vendor embarqué : xlsx + PDF.js sans CDN

### Dettes différées non bloquantes

| Dette | Impact | Statut |
|---|---|---|
| `portfolio-repo.js` — présent mais non utilisé | `storage.portfolio` utilisé à la place | Différé — suppression future |
| CSS `bhv-portfolio-*` — classes sans style dédié | Héritage `.bhv-card` suffisant | Différé |
| `render.js` concentration critique (36.7%) | Maintenance difficile à terme | Différé post-bêta |
| `estimateTotalSize()` dans `state.js` — wraps corrigée | `estimateStateSize()` toujours dans state.js | Mineure |
| `_write()` échouent silencieusement | Aucune alerte utilisateur en cas de QuotaExceeded | Différé |
| `src/constellium.html` — hors déploiement OVH | Page orpheline dans le repo | Documentation |

### Modules dormants dans le package déployé

- `src/js/behavior/anonymize/anonymizer.js` — présent, usage non identifié dans le flux principal
- `src/js/v2/calibration.js` — `V2_CALIBRATION: false` → dead path à chaque exécution
- `src/js/behavior/storage/portfolio-repo.js` — jamais appelé par le pipeline actif

---

## 8. Inventaire doctrine / positionnement

### Manifeste produit

Présent dans l'interface (onglet Manifeste, 16 sections, ~3000 mots). Doctrine de haute qualité : cohérente, exigeante, différenciante. **Problème de position** : un manifeste fondateur n'a pas sa place en onglet de navigation principale au même niveau que "Moteur".

### Promesse centrale

"Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre."

### Règles fondamentales actives

| Règle | Implémentée | Respectée |
|---|---|---|
| Pas de signaux d'achat/vente | Oui | Oui |
| Pas de prédictions de marché | Oui | Oui |
| Pas de trading automatique | Oui | Oui |
| Humain responsable de la décision finale | Oui (validation humaine obligatoire) | Oui |
| Friction intelligente, jamais blocage | Oui (friction messages, pas de verrouillage) | Oui |
| Miroir comportemental, jamais juge | Oui (profils sans verdict moral) | Oui |
| Vocabulaire banni respecté | Partiellement | En majorité oui — quelques labels à auditer |
| Pas d'emoji dans l'interface | Non — emojis présents | Violation active |

### Violations doctrinales observées dans le code

1. **Emojis présents** : "⚠️ PRUDENCE COMPORTEMENTALE" (ligne `index.html:332`), "🔗 Lois du Caméléon" (sidebar), "🔗 La naissance du Caméléon" (manifeste)
2. **Bouton "Tester une lecture Constellium"** dans Pilotage : expose un concept dormant (D3) à l'utilisateur actif
3. **Majuscules dans des messages** : "PRUDENCE COMPORTEMENTALE", "LECTURE DU CONSTELLIUM" — la doctrine interdit les majuscules d'emphase
4. **Lien externe Notion** dans la sidebar : crée une dépendance externe non contrôlée

### Ce qui doit rester au cœur

- Moteur de décision 16 champs → verdict unique
- Validation humaine obligatoire (verrou doctrinal)
- Module comportemental (miroir sur données réelles)
- Export JSON (portabilité, droit à la donnée)
- Tone narratif (silence structurel, moteur narratif)

### Ce qui doit rester interne

- Debug Brain (lecture système)
- Payload JSON brut
- Journal technique (pattern, score, badge)
- Architecture V2 (actif mais invisible, correct)

### Ce qui ne doit pas apparaître au premier écran

- Manifeste (onglet de niveau 1)
- Constellium (boutons dans Pilotage)
- 4 scores simultanés sans hiérarchie
- Payload brut et sorties techniques
- Liens externes non produit (Notion)

---

## 9. Carte de valeur utilisateur

| Élément | Catégorie | Justification |
|---|---|---|
| Décision du jour | **Valeur immédiate forte** | Réponse directe à "quoi faire maintenant" |
| Plan d'action | **Valeur immédiate forte** | Synthèse opérationnelle en 2–3 points |
| Verdict moteur (Socle / Attaque / Sniper / Attente) | **Valeur immédiate forte** | Posture claire, compréhensible sans explication |
| Mode d'emploi (dialog) | **Valeur immédiate forte** | 4 règles suffisantes pour démarrer |
| Validation humaine (champ formulaire) | **Valeur immédiate forte** | Force la responsabilité — friction doctrinale |
| Analyse comportementale (profil + score) | **Valeur différée forte** | Nécessite import + temps d'usage |
| Patterns détectés (loss_chasing etc.) | **Valeur différée forte** | Miroir réel, fort impact, nécessite données |
| Export JSON | **Valeur différée forte** | Essentielle pour bêta, invisible au premier usage |
| Portefeuille V1 | **Valeur différée forte** | Nécessite Wallet History import |
| Historique sessions moteur | **Valeur différée forte** | Lisible après 5+ sessions |
| Confiance d'exécution | **Valeur experte** | Score de lisibilité — incompréhensible sans contexte |
| Contexte utile (4 alertes) | **Valeur experte** | État / Risque / Mode / Validation — utile expert |
| Scénarios SI→ALORS | **Valeur experte** | Conditionnels explicites — puissants pour expert |
| Gestion de position (taille, RR, exposition) | **Valeur experte** | Traduction opérationnelle — expert uniquement |
| Score marché 0–100 | **Valeur experte** | Surchiffré sans explication de la composition |
| Debug Brain | **Valeur interne** | Lecture système — développeur / opérateur avancé |
| Payload JSON brut | **Valeur interne** | Audit technique — pas utilisateur |
| Journal technique (8 champs) | **Valeur interne** | Trace technique non destinée à l'utilisateur final |
| Manifeste (onglet) | **Valeur symbolique** | Important mais pas en navigation principale |
| Publications Paragraph | **Valeur symbolique** | Contexte éditorial — secondaire |
| Macro (2 champs) | **Valeur symbolique / dormante** | Effet narratif mineur, non expliqué |
| Boutons Constellium | **Complexité sans valeur immédiate** | Concept dormant exposé |
| 5 onglets de navigation simultanés | **Complexité sans valeur immédiate** | Pas de hiérarchie — surcharge de choix |
| 4 scores sans hiérarchie | **Complexité sans valeur immédiate** | Multiples métriques sans explication de relation |

---

## 10. Carte de complexité

| Élément | Complexité utilisateur | Complexité technique | Valeur produite | Décision recommandée |
|---|---|---|---|---|
| Debug Brain permanent | Haute | Faible (existant) | Interne | Masquer par défaut — accès expert |
| Boutons Constellium dans Pilotage | Haute | Faible (existant) | Nulle V1 | Masquer — D3 dormant |
| Manifeste en onglet principal | Moyenne | Nulle | Symbolique | Déplacer — footer ou modal |
| 4 scores sans hiérarchie visible | Haute | Faible (calculés) | Élevée si hiérarchisés | Simplifier — un score principal visible |
| Payload brut `<details>` | Haute | Nulle | Interne | Masquer — Debug Brain uniquement |
| Journal de décision 8 champs | Haute | Nulle | Interne | Masquer — mode expert |
| Onglet "Pilotage" sans contexte | Haute | Nulle | Forte (formulaire) | Simplifier — renommer, guider |
| Publications Paragraph | Faible | Nulle | Symbolique | Garder — simplifier le label |
| Macro (2 champs) | Moyenne | Nulle | Faible seule | Documenter — contextualiser in-UI |
| Lien Notion sidebar | Faible | Nulle | Symbolique | Reporter — hors sidebar principale |
| Onboarding overlay | Faible | Faible | Élevée | Simplifier — rendre réaccesible |
| Mode d'emploi (dialog) | Faible | Nulle | Élevée | Garder visible — bouton plus prominent |
| 5 onglets sidebar | Haute | Nulle | Organisationnelle | Simplifier — 3 onglets max visible par défaut |

---

## 11. Synthèse : actif / dormant / à clarifier

### A. À protéger absolument

1. **Moteur de décision** (16 champs → verdict → actions autorisées/interdites) — identité du produit
2. **Validation humaine obligatoire** — fondement doctrinal, différenciateur principal
3. **Module comportemental** (patterns réels sur données importées, 4 profils) — miroir authentique
4. **Export JSON** — portabilité, confiance utilisateur, condition bêta
5. **Tone narratif** (silence structurel, moteur narratif, pas de signal, pas de juge) — âme du produit

### B. À simplifier avant bêta

1. **Premier écran** — réduire la surface visible à : Décision du jour + Plan d'action + 1 score principal + bouton "Comprendre"
2. **Debug Brain** — masquer par défaut, accès via raccourci ou mode expert
3. **Boutons Constellium** (Pilotage) — masquer les deux boutons "Tester" et "Lire le Constellium"
4. **Onglet Manifeste** — sortir du niveau de navigation principale, déplacer en footer ou modal
5. **Scores multiples** — établir une hiérarchie visuelle claire : verdict en premier, scores en arrière-plan

### C. À garder dormant

1. **Constellium complet** (panel, CSS, assets) — valeur future conditionnelle, conditions D3 non atteintes
2. **V2_CALIBRATION** — snapshot calibration désactivé, laisser désactivé jusqu'à terrain V0
3. **`portfolio-repo.js`** — doublon non utilisé, suppression différée sans urgence
4. **Publications Paragraph** — contenu utile mais secondaire, visible uniquement après premier usage réussi
5. **Macro (dominance/désordre)** — fonctionnel mais invisible — garder technique, ne pas promouvoir V1

### D. À clarifier

1. **Lien "Lois du Caméléon" (Notion)** — lien externe non contrôlé dans la sidebar principale — décider : interne ou supprimer
2. **Onglet Comportement vs autres onglets** — ouvre un panneau latéral ≠ les 3 autres onglets — incohérence navigation à résoudre
3. **Emojis présents** — violations doctrinales actives (⚠️, 🔗) — à nettoyer ou à valider comme exceptions
4. **Onboarding overlay** — pertinent mais éphémère et non réaccesible — à repositionner dans un parcours guidé
5. **Lien Paragraph "La naissance du Caméléon"** — présent dans le Manifeste — URL externe non contrôlée, statut ?

---

## 12. Recommandation stratégique finale

### Caméléon Engine est-il prêt pour une vraie bêta ?

**Oui, techniquement. Non, en termes de parcours.**

Le moteur est stable. Les analyses comportementales sont calibrées. Le stockage est fiable. L'export fonctionne. La doctrine est cohérente. L'application est en ligne et sécurisée.

Ce qui manque : **un chemin d'entrée explicite pour un nouvel utilisateur.** Sans parcours guidé, la première expérience produit est une accumulation de couches sans hiérarchie. Le retour terrain le confirme.

### Ce qui bloque une bêta réelle

| Bloquant | Nature | Urgence |
|---|---|---|
| Pas de parcours utilisateur | UX | Critique avant invitation |
| Constellium visible (boutons Pilotage) | Cohérence produit | Haute |
| Debug Brain permanent | Perception produit | Haute |
| 4 scores sans hiérarchie | Compréhension | Haute |
| Manifeste en onglet principal | Positionnement | Moyenne |
| Lien 404 sur iPad (Paragraph ?) | Bug signalé | Haute |
| Scroll bloquant iPad sur Moteur/Mémoire | Bug mobile | Haute |
| Textes débordants sur petits écrans | Bug responsive | Haute |

### Prochain document à créer

**Parcours Utilisateur V1** — document opérationnel définissant :
- L'écran d'entrée (ce que l'utilisateur voit en premier)
- Les 3 actions possibles dans les 5 premières minutes
- Le chemin vers la première valeur (premier verdict compris)
- Le chemin vers la valeur comportementale (premier import réussi)
- Ce qui est visible vs masqué par défaut

### Prochain chantier d'implémentation

Avant d'inviter les testeurs bêta :

1. **Masquer Debug Brain par défaut** — toggle accessible mais discret
2. **Masquer les boutons Constellium** dans Pilotage
3. **Corriger les bugs iPad/mobile** (scroll, 404, overflow textes)
4. **Simplifier le premier écran** : 1 action principale visible sans scroll

Ces 4 corrections sont des modifications ciblées, pas une refonte. Elles ne touchent pas à la logique moteur. Elles conditionnent directement la qualité de la première expérience des 12 testeurs bêta.

---

*Ce document est un audit produit — il ne déclenche aucune implémentation.*
*Toute ouverture de chantier UX ou correctif doit référencer ce document.*

---

## Addendum — Révision après challenge stratégique

> Ajouté le 2026-06-09 après relecture critique des sections 11 et 12.
> Ces corrections ne modifient pas les constats d'inventaire — elles révisent les conclusions et la séquence recommandée.

---

### 1. L'identité du produit n'est pas le seul moteur de décision

La section 11A désigne le moteur de décision comme "identité du produit". Cette formulation est trop étroite.

**Correction :** L'identité de Caméléon Engine est la **combinaison du moteur de décision structuré et du miroir comportemental sur données réelles**.

- Le moteur seul est un outil de décision contextuelle — il en existe d'autres, sous d'autres formes.
- Le miroir comportemental seul est un outil analytique — il existe des dashboards de trades.
- Ce qui différencie Caméléon Engine : l'**articulation** entre les deux. Un verdict moteur interprété à la lumière de l'historique comportemental réel de l'opérateur. Le même score, lu différemment selon que l'opérateur est Discipliné ou Agressif sur les 60 derniers jours.

**Conséquence produit :** dans le positionnement différenciant court terme (Priorité 5 ci-dessous), le miroir comportemental doit figurer explicitement, pas en deuxième rang.

---

### 2. Les corrections de surface ne précèdent pas le Parcours Utilisateur V1

La section 12 listait 4 "corrections" avant d'inviter les testeurs, dont "Masquer Debug Brain", "Simplifier le premier écran", "Masquer les boutons Constellium". Ces corrections supposent implicitement de savoir ce que le premier écran doit être — ce qui est précisément l'objet du Parcours Utilisateur V1.

**Correction :** les modifications d'interface ne peuvent pas précéder la définition du parcours, sauf dans un cas précis.

**Exception autorisée — bugs terrain factuels :** les bugs signalés en retour terrain direct (scroll iPad bloquant, textes débordants, lien 404) sont des **anomalies techniques indépendantes de toute décision de design**. Un scroll qui bloque reste un bug quelle que soit l'interface cible. Ils peuvent et doivent être corrigés immédiatement, avant le Parcours Utilisateur V1.

**Tout le reste** (masquer Debug Brain, simplifier le premier écran, repositionner le Manifeste, masquer les boutons Constellium, hiérarchiser les scores) est une décision d'interface. Ces décisions doivent dériver du Parcours Utilisateur V1, pas précéder sa définition.

---

### 3. Ordre prioritaire final

| Priorité | Action | Nature | Précondition |
|---|---|---|---|
| **1** | Bugs terrain factuels : scroll iPad, overflow textes, lien 404 | Correctifs techniques | Aucune — corriger immédiatement |
| **2** | Parcours Utilisateur V1 | Document de définition UX | Décision fondatrice |
| **3** | Modifications d'interface dérivées du parcours | Implémentation UX | Parcours Utilisateur V1 validé |
| **4** | Invitation bêta testeurs | Opérationnel | Parcours + corrections P1 |
| **5** | Positionnement différenciant court | Communication externe | Parcours validé, terrain minimal |

**Règle de séquençage :** P3 est conditionnel à P2. Aucune décision de design n'est prise "en attendant" le parcours — elle sera annulée ou contredite lors de sa définition. Le coût d'une modification prématurée (déplacement, refactoring) est supérieur au coût d'attendre le parcours.

**Règle d'exception P1 :** les bugs P1 peuvent être ouverts en chantier parallèle, sans bloquer ni attendre P2.
