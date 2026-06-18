# Réalignement de roadmap — Post-Constellium

**Statut : document stratégique — non implémentable — référence de discipline produit**
**Date : 2026-05-25**
**Contexte : archivage du chantier Constellium + retour au socle stable**

---

> Le danger futur n'est plus le manque d'idées. C'est la dispersion.
> Le moteur doit devenir fiable avant de devenir plus intelligent.
> Stabiliser est maintenant plus important qu'étendre.

---

## 1. Préambule stratégique

### Pourquoi cette roadmap change

Le projet Caméléon Engine a traversé, entre fin 2025 et mai 2026, une phase de construction doctrinale et architecturale dense. Cette phase a produit :

- une architecture V2 complète (cohérence inter-modules, hiérarchie des tensions, exposition, attention) ;
- une doctrine du silence structurel ;
- un corpus comportemental de 52 concepts stables ;
- des fiches pédagogiques freeware et premium ;
- un protocole de test réel V0 ;
- un chantier Constellium complet (audit, profils opérateurs, transitions, dérive progressive).

Cette phase a été nécessaire. Elle a posé des fondations conceptuelles solides. Elle est maintenant terminée dans ses grandes lignes.

Ce qui doit changer, c'est la cadence.

### Ce que le chantier Constellium modifie

Le chantier Constellium a cristallisé un problème structurel du projet : la capacité à produire de la doctrine dépasse désormais la capacité à valider et stabiliser. Le moteur conceptuel est en avance sur le moteur réel. L'architecture comportementale imaginée est plus riche que l'architecture comportementale observable et robuste.

C'est un signe de santé intellectuelle — et un risque opérationnel.

Un projet qui accumule de la doctrine sans accumuler de la robustesse construit une dette invisible. Les couches conceptuelles s'empilent. La complexité croît. La lisibilité décroît. Le risque de déconnexion entre ce que le moteur "sait" et ce qu'il fait réellement en conditions terrain augmente.

### Pourquoi ralentir l'expansion conceptuelle

La doctrine est maintenant suffisamment riche pour plusieurs mois, voire plusieurs années de travail d'implémentation. Les profils Constellium, la mémoire comportementale, les transitions opératoires — ces sujets n'ont pas besoin d'être approfondis davantage maintenant. Ils ont besoin d'attendre que le moteur réel soit assez mature pour les recevoir.

Continuer à ajouter de la doctrine dans un moteur qui n'a pas encore confirmé sa robustesse terrain est contre-productif. Chaque nouvelle couche conceptuelle ajoutée avant la validation de la précédente crée une dette de compréhension qui se paiera au moment de l'implémentation.

### Pourquoi le retour au socle stable est prioritaire

L'objectif du projet n'est pas de produire la doctrine la plus riche possible. L'objectif est de produire un outil de décision fiable, lisible et protecteur pour des opérateurs réels.

Fiable d'abord. Profond ensuite.

---

## 2. État actuel du projet — photographie honnête

### Socle stable et protégé

Ces éléments sont considérés comme matures. Ils ne doivent pas être constamment réinterrogés ni refactorés sans signal réel.

| Élément | Statut |
|---|---|
| Pipeline moteur (baseEngine → buildPayload) | Stable — architecture figée volontairement |
| Séparation comportemental / moteur principal | Stable — contrat d'isolation respecté |
| Parsing CSV/Excel (Order History + Trade History) | Stable — production-ready post-audit mai 2026 |
| Doctrine friction intelligente | Stable — documentée et implémentée |
| Architecture V2 (4 composants) en shadow mode | Stable — Phase 2 complète 2026-05-25 |
| Corpus comportemental (52 concepts) | Stable — clos volontairement |
| Fiches freeware v1 (6/6) | Stable — lot fermé |
| Fiches premium v1 (4/4) | Stable — lot fermé |
| Chantier Constellium (socle doctrinal) | Stable — archivé |

### Comportements validés terrain

Ces éléments ont été testés sur des données réelles et ont produit des résultats documentés.

| Dataset | Statut | Enseignements clés |
|---|---|---|
| REAL_001 — 1685 trades multi-actifs | Validé Phase 4 | Score plancher ~15 sur multi-actifs long — PS-01 documenté |
| REAL_002 — 120 trades mono-actif | Validé Phase 4 | Score 37 — Trade History parser validé runtime |
| REAL_003 — 542 trades 10 actifs | Validé Phase 4 | Taux absorption > nombre absolu comme prédicteur |
| REAL_004 — 1910 trades 2.3 ans | Validé Phase 4 | Trajectoire comportementale réelle lisible |

### Éléments encore fragiles

| Élément | Nature de la fragilité |
|---|---|
| Score comportemental multi-actifs | PS-01 (CV global) produit un score plancher ~15 non représentatif |
| Profil GRID sur données Order History sans historique récent | Contextualisation désactivée si Order History > 7 jours |
| Patterns inter-symboles (FN-OT-2, FN-RV-2, FN-LC-3) | Non détectables — faux négatifs documentés mais non traités |
| Distinction pyramiding / loss chasing | PS-02 — limitation architecturale non résolue |
| Sessions V2 longues multi-jours | Non encore testées en conditions réelles |
| Seuils V2 (T1, T4, D-ATT-01) | Provisoires — non calibrés sur données terrain réelles |

### Architecture doctrinale (conceptuelle uniquement)

| Document | Statut | Lien implémentation |
|---|---|---|
| Chantier Constellium complet | Archivé — non implémentable | Post-MVP |
| Mémoire comportementale | Conceptuelle uniquement | Aucune infrastructure existante |
| Profils opérateurs | Doctrinaux | Aucun flag, aucun code |
| Transitions opératoires | Doctrinaux | Aucune détection active |

### Dette UX

| Élément | Nature |
|---|---|
| Hiérarchie des tensions cockpit | Active en shadow mode — non exposée utilisateur |
| Gestionnaire d'attention | Implémenté — calibration provisoire |
| Messages comportementaux | Fonctionnels — non testés sur fatigue cognitive réelle |
| Debug Brain | Outil de calibration — pas une surface UX finale |

### Dette de validation terrain

| Besoin | Statut |
|---|---|
| Sessions cockpit longues (> 4h) | Non testées |
| Multi-jours consécutifs | Non testés |
| Profils opérateurs réels multiples | Non observés |
| Faux positifs en conditions réelles | Documentés théoriquement, non mesurés terrain |
| Faux négatifs en conditions réelles | Idem |

---

## 3. Ce qui est considéré comme socle stable

Ces éléments ne doivent plus être rouverts sans signal réel de défaillance.

**Pipeline principal (engine.js → buildPayload)**
La structure du payload est figée volontairement. `buildPayload()` est la source de vérité. Aucune modification sans signal réel et ADR documenté.

**Séparation comportemental / moteur**
Le contrat d'isolation du module `src/js/behavior/` est strict et permanent. Aucun couplage avec le moteur principal ne doit être introduit.

**Parsing et import CSV/Excel**
Production-ready. Les cas CASE_001/002/003 sont documentés et soldés. Le dataQuality layer est implémenté. Ne pas rouvrir sans cas terrain nouveau non couvert.

*Extension multi-source (Transaction History + Earn History) :* chantier BMSM enregistré en Priorité B — non démarré. Référence : `docs/architecture/binance-multi-source-memory.md`.

**Corpus cognitif (52 concepts)**
Clos. Aucun nouveau lot cognitif sans nouveau territoire conceptuel clairement distinct.

**Lot freeware et lot premium**
Fermés. Aucune réouverture sans signal produit réel (demande terrain, contradiction doctrinale majeure).

**Chantier Constellium**
Archivé comme socle doctrinal. Référencé. Disponible. Non monopolisant.

---

## 4. Ce qui devient officiellement secondaire

Ces éléments sont intéressants. Ils ne sont pas prioritaires maintenant.

**Expansion du corpus cognitif**
52 concepts sont suffisants. Tout nouveau lot doit attendre un signal fort de manque réel — pas d'une envie d'explorer.

**Nouvelles fiches pédagogiques**
Les deux lots sont fermés. Rouvrir nécessite un signal marché, pas une idée de contenu.

**Architecture Constellium**
La doctrine est complète. L'implémentation n'est pas envisageable avant la stabilisation complète du moteur comportemental actuel et la validation terrain V0.

**Nouvelles couches cognitives V2**
Les 4 composants V2 sont implémentés. L'activation progressive (Phase 3/4) doit précéder toute nouvelle couche.

**Machine learning, scoring adaptatif, IA de profil**
Hors périmètre permanent. Ni dans le court terme, ni dans le moyen terme.

**Psychologie de trading, profils personnalité, scoring émotionnel**
Hors doctrine. Contraire à l'ADN du moteur.

**Intégrations externes, API tierces, multi-exchange**
Hors priorité. Aucune complexité d'infrastructure avant validation fonctionnelle complète.

---

## 5. Nouvelle priorité absolue

### Validation terrain du comportemental réel

C'est maintenant le cœur du projet. Non pas en termes de nouveauté — mais en termes d'honnêteté.

Le moteur comportemental produit des scores, des labels (Discipliné / Réactif / Impulsif / Agressif), et des patterns détectés. Ces outputs ont été validés sur des données synthétiques et sur quatre datasets terrain. Mais la validation réelle nécessite ce que les tests seuls ne peuvent pas produire : l'usage authentique par des opérateurs en conditions réelles.

**Pourquoi les faux positifs réels sont critiques**

Un faux positif signalé à un opérateur en conditions réelles a un coût. Il nuit à la confiance. Il produit du bruit. Il risque de créer une friction contre-productive — exactement ce que le moteur cherche à éviter.

Les faux positifs documentés (FP-OT-1, FP-SI-1, FP-LC-1, etc.) sont connus théoriquement. Ils ne sont pas encore mesurés en usage réel. Cette mesure est la priorité.

**Pourquoi la robustesse précède la profondeur**

Un moteur qui produit des insights profonds mais instables est moins utile qu'un moteur qui produit des insights moins profonds mais fiables. La profondeur sans robustesse est du bruit sophistiqué.

La robustesse n'est pas une vertu secondaire. C'est la condition d'existence de tout le reste.

---

## 6. Chantiers prioritaires réels

### Priorité A — Socle critique (immédiat)

Ces chantiers ne nécessitent pas de nouveau concept. Ils nécessitent de la rigueur et de l'observation.

| Chantier | Objectif | Nature |
|---|---|---|
| Validation comportementale V0-A | Analyser exports Binance Antonio sur différentes périodes de marché | Observation terrain |
| Stabilité sessions longues V2 | Tester les 4 composants V2 sur sessions > 4h et multi-jours | Validation runtime |
| Réduction faux positifs connus | FP-SI-1 (CV multi-actifs) — correction PS-01 par CV par symbole | Correction architecturale ciblée |
| Robustesse parsing | Valider sur nouveaux exports réels — formats edge cases | Validation terrain |
| Comportemental UX cockpit | Lisibilité réelle des messages comportementaux en usage | Observation UX |

### Priorité B — Consolidation comportementale

Ces chantiers affinent ce qui existe sans l'étendre.

| Chantier | Objectif | Nature |
|---|---|---|
| Calibration seuils V2 réels | T1 / T4 / D-ATT-01 — correction post-V0-A | Calibration post-terrain |
| Scoring multi-actifs | Correction PS-01 + validation sur REAL_001 corrigé | Correction architecturale |
| Observation patterns réels | Mesurer taux de faux positifs par pattern sur données terrain | Mesure |
| Activation Phase 3 V2 | T3-01→T3-09 — activation progressive T1/T2/T4 cockpit | Implémentation contrôlée |
| Binance Multi-Source Memory | Transaction History + Earn History + croisement Order×Trade | Extension pipeline comportemental — Non démarré |

### Priorité C — UX et lisibilité cognitive

Ces chantiers améliorent l'expérience sans ajouter de complexité conceptuelle.

| Chantier | Objectif | Nature |
|---|---|---|
| Hiérarchie des alertes | Vérifier que active_exposed ≤ 1 fonctionne en conditions réelles | Validation UX |
| Réduction du bruit | Mesurer la fréquence d'exposition des tensions en usage réel | Observation |
| Friction intelligente | Vérifier que les messages cockpit restent utiles sur sessions longues | Validation cognitif |
| Suppression silencieuse | Confirmer que le silence est le comportement par défaut perçu | Validation UX |

### Priorité D — Constellium futur (archivé)

| Chantier | Objectif | Temporalité |
|---|---|---|
| Classification indicateurs (universel / semi-adaptatif / contextuel) | Formaliser la classification de l'audit | Post-validation terrain |
| Architecture anti-sur-ajustement | Définir les garde-fous contre l'absorption de dérive | Post-profils validés |
| Stress tests théoriques Constellium | Tester les profils sur des scénarios comportementaux extrêmes | Post-V0 |
| Prototype Constellium interne | Premier prototype de lecture adaptative | Post-MVP |
| Calibration adaptative réelle | Architecture de calibration opératoire | Très long terme |

**Priorité D ne contamine pas les priorités A, B, C.**

---

## 7. Risques actuels du projet

Ce sont les risques que le projet doit s'administrer à lui-même. Ils ne viennent pas de l'extérieur.

### Surcharge conceptuelle

Le projet dispose maintenant d'une doctrine plus riche que ce que l'implémentation peut absorber à court terme. Le risque est de continuer à enrichir la doctrine sans que cela serve le produit réel. Chaque concept ajouté sans validation terrain crée une dette de pertinence : on ne sait pas si le concept est utile avant de l'avoir confronté à un usage réel.

### Inflation philosophique

La tentation de continuer à raffiner la pensée (nouvelles doctrines, nouveaux cadres, nouvelles architectures conceptuelles) est réelle. Elle produit des documents cohérents et intellectuellement satisfaisants. Elle ne produit pas un moteur plus fiable.

### Moteur trop complexe pour être auditable

Un moteur dont personne ne peut prédire le comportement dans un cas donné est un moteur risqué. La complexité doit rester maîtrisée. Chaque nouvelle couche doit être justifiable simplement.

### UX trop dense — fatigue cognitive

Si le cockpit expose trop d'informations, trop de tensions, trop d'alertes — même structurées selon la doctrine du silence — il devient lui-même une source de charge cognitive. La densité UX est un risque à mesurer, pas à assumer.

### Comportemental trop théorique

Les patterns comportementaux ont été construits sur une logique théorique solide. Les faux positifs documentés suggèrent que cette logique, juste en général, produit des erreurs sur des comportements légitimes dans certains contextes. Ces erreurs ne sont pas résolvables par plus de théorie. Elles sont résolvables par l'observation terrain.

### Dérive "IA magique"

Le moteur doit rester explicable. Chaque signal doit être traçable jusqu'à une règle lisible. Dès que le moteur commence à produire des outputs que même ses concepteurs ne peuvent pas expliquer simplement, il a dépassé son niveau de complexité acceptable.

### Implémentation prématurée de Constellium

Le risque le plus immédiat : vouloir commencer à coder des éléments Constellium avant que la base soit stabilisée. La richesse du chantier Constellium crée une attraction vers l'implémentation. Cette attraction doit être résistée activement.

### Perte de simplicité

La simplicité n'est pas une propriété initiale qui se perd avec le temps. C'est une décision permanente. Chaque feature qui ne peut pas être expliquée en deux phrases à un utilisateur non-technique est une feature suspecte.

---

## 8. Doctrine de discipline produit

Ces règles sont actives dès maintenant. Elles ne sont pas des aspirations — elles sont des contraintes opératoires.

**Ne pas ouvrir plusieurs grands chantiers simultanément.**
Un chantier majeur à la fois. Le chantier en cours doit être terminé (ou archivé délibérément) avant d'en ouvrir un nouveau.

**Finir les couches avant d'en créer de nouvelles.**
La Phase 3 V2 doit être activée et validée avant de concevoir la Phase 4. La Phase 4 doit être complète avant de concevoir Constellium live. Constellium live n'existe pas avant la validation V0.

**Distinguer doctrine et implémentation — explicitement.**
Tout document produit doit indiquer clairement : est-ce un document doctrinal (aucune implémentation) ou une spécification technique (implément­able) ? La confusion entre les deux est une source majeure de dispersion.

**Ralentir volontairement.**
La cadence de production de doctrine doit être délibérément réduite. Un mois sans nouveau grand chantier conceptuel est un mois productif si la robustesse a progressé.

**Stabiliser avant complexifier.**
Avant toute nouvelle couche de complexité, la couche existante doit être stable, testée, et calibrée sur des données réelles.

**Ne pas coder une idée immédiatement après l'avoir pensée.**
Le délai entre la conception et l'implémentation est un filtre de qualité. Les idées qui survivent à quelques semaines d'attente sont généralement les bonnes. Les idées qui semblent urgentes immédiatement sont souvent des réponses à un état émotionnel, pas à un besoin réel.

**Documenter d'abord — observer ensuite — implémenter très tard.**
C'est l'ordre canonique Caméléon Engine. La violation de cet ordre est une anomalie à corriger.

**Un signal terrain vaut plus qu'un argument théorique.**
Quand un opérateur réel expérimente quelque chose d'inattendu, c'est une information plus précieuse que dix sessions d'analyse conceptuelle.

---

## 9. Position officielle du chantier Constellium

### Ce que Constellium est

Le chantier Constellium est :

- un chantier de calibration adaptative future ;
- une architecture comportementale conceptuelle ;
- un socle de lecture opératoire contextuelle ;
- une doctrine d'interprétation différenciée selon les profils ;
- la première architecture sérieuse de mémoire comportementale pour Caméléon Engine.

C'est un travail de fond, fondateur, et structurellement important pour la trajectoire long terme du produit.

### Ce que Constellium n'est pas

Le chantier Constellium n'est pas :

- une priorité de code ;
- une feature en cours de développement ;
- un moteur actif ;
- une calibration implémentée ;
- une IA adaptative en construction ;
- un engagement produit envers des utilisateurs actuels.

### Quand Constellium devient pertinent

Constellium devient pertinent comme chantier d'implémentation quand les conditions suivantes sont réunies :

1. Le moteur comportemental actuel est stable et robuste sur données terrain réelles.
2. La validation V0 (V0-A Binance + V0-B cockpit) est complète.
3. Les faux positifs majeurs (PS-01, PS-02) sont traités.
4. Le scoring multi-actifs est fiable.
5. Les seuils V2 sont calibrés sur des données réelles.
6. L'UX cockpit est validée sur des sessions longues.

**Avant ces conditions : Constellium reste doctrinal et archivé.**

> **Mise à jour 2026-06-18** — La définition opérationnelle V1 est maintenant figée :
> *"Le Constellium est la visualisation des liens entre les traces du décideur."*
> Étoiles, liens affichables, placement UX, langage autorisé et risques documentés dans :
> `docs/architecture/constellium/constellium_v1_definition.md`

---

## 10. Feuille de route réaliste

### Court terme (maintenant → 3 mois)

**Objectif unique :** robustesse, validation, stabilité.

- V0-A : analyse comportementale sur exports Binance Antonio (plusieurs périodes de marché)
- Correction PS-01 : passage CV global → CV par symbole dans `detectSizeInconsistency`
- Activation Phase 3 V2 : T3-01→T3-09, activation progressive T1/T2/T4 cockpit
- Tests sessions longues : V2 sur sessions > 4h et multi-jours
- Observation faux positifs réels : documenter les cas terrain non couverts

**Ce qui ne se fait pas :** nouveaux concepts, nouvelles doctrines, nouvelles fiches, nouvelles couches.

### Moyen terme (3 → 9 mois)

**Objectif :** consolidation comportementale et UX.

- V0-B : observation cockpit sur 20–30 opérateurs réels
- Calibration seuils V2 sur données terrain
- Réduction faux positifs mesurés en V0
- Phase 4 V2 : CalibrationSnapshot, export JSON ponctuel, correction seuils
- Préparation production V2 : activation limitée réelle
- Évaluation de la pertinence d'une correction PS-02 (si données terrain le justifient)

**Ce qui ne se fait pas :** implémentation Constellium, machine learning, scoring adaptatif.

### Long terme (9 mois → horizon)

**Objectif :** lecture contextuelle et système adaptatif.

- Classification formelle des indicateurs Constellium (universel / semi-adaptatif / contextuel)
- Architecture anti-sur-ajustement
- Stress tests théoriques Constellium sur profils réels observés en V0
- Prototype interne de lecture opératoire contextuelle
- Calibration adaptative minimale par profil déclaré
- Mémoire comportementale inter-sessions — architecture et infrastructure

**Condition d'entrée dans le long terme :** toutes les étapes court et moyen terme complètes et validées.

---

## 11. Architecture de maturité du produit

Le projet traverse des phases de maturité séquentielles. Elles ne peuvent pas être sautées.

```
Phase 1 — Prototype doctrinal            ✅ Complète (2025)
  Moteur de score · Décision · UX initiale

Phase 2 — Moteur stable                  ✅ Complète (2026-05)
  V2 implémentée · Corpus clos · Fiches produites · Silence structurel

Phase 3 — Validation terrain             ⬤ En cours
  V0-A Binance · V0-B cockpit · Sessions longues · Faux positifs réels

Phase 4 — Cohérence UX                   ○ Future (conditionelle Phase 3)
  Seuils calibrés · Bruit mesuré · Fatigue cognitive maîtrisée

Phase 5 — Réduction faux positifs        ○ Future (conditionnelle Phase 4)
  PS-01 → PS-06 traités · Scoring fiable tous profils · Multi-actifs robuste

Phase 6 — Lecture contextuelle minimale  ○ Future (conditionnelle Phase 5)
  Profil déclaré · Contextualisation légère · Garde-fous adaptatifs

Phase 7 — Architecture adaptative        ○ Long terme (Constellium live)
  Mémoire comportementale · Profils opérateurs · Transitions détectées
```

**Le projet est en Phase 3. L'objectif immédiat est de compléter la Phase 3.**

Chaque phase doit être complète et validée avant que la suivante commence. Un produit qui court-circuite ce séquençage accumule une dette invisible qui se paie sur la robustesse et la lisibilité.

---

## 12. Conclusion stratégique

Le projet Caméléon Engine dispose maintenant d'une base solide.

**Ce qui est solide :**

Un moteur fonctionnel et documenté. Une doctrine comportementale cohérente et complète pour les besoins actuels. Une architecture V2 implémentée et prête pour la validation. Un corpus cognitif clos et stable. Un chantier Constellium qui fournit la vision long terme. Un protocole de test réel défini. Des données terrain réelles analysées.

**Ce qui doit changer :**

La relation du projet à l'expansion. Le moteur dispose de plus de doctrine qu'il ne peut en valider dans les mois qui viennent. Cette doctrine est un actif — mais seulement si elle est utilisée au bon moment. Utilisée trop tôt, elle crée de la complexité prématurée.

**La priorité n'est plus d'ajouter.**

La priorité est de confirmer que ce qui existe fonctionne, résiste à l'usage réel, et reste lisible dans le temps. La robustesse est la condition d'existence de tout le reste.

Un moteur profond mais instable est un moteur inutile. Un moteur simple mais fiable est un moteur utile.

**Ce que cela implique concrètement :**

Ralentir l'expansion doctrinale. Concentrer l'énergie sur la validation terrain. Mesurer les faux positifs réels. Calibrer les seuils sur des données authentiques. Confirmer que la doctrine produit ce qu'elle promet en conditions réelles.

**Ce que cela ne signifie pas :**

Abandonner la vision long terme. Le chantier Constellium reste un pilier de la trajectoire future. Les profils opérateurs, la mémoire comportementale, les transitions — ce sont des directions correctes. Elles sont simplement prématurées comme chantiers d'implémentation.

---

> La profondeur n'a de valeur que si elle reste lisible et robuste.
> Le projet doit protéger sa cohérence autant que son ambition.
> Le moteur ne doit pas devenir une accumulation de couches cognitives.
> Une doctrine riche ne justifie pas une implémentation immédiate.

---

*Document de réalignement stratégique — post-Constellium — 2026-05-25*
*Référence : docs/roadmap/roadmap-realignment-post-constellium.md*
*Ne déclenche aucune implémentation. Aucun code. Aucun refactor.*

---

## MàJ 2026-06-05 — Doctrine Macro V1 figée

**Chantier de réflexion terminé.** La doctrine complète de la future couche Macro est figée. Aucun code produit.

**Document officiel commité :** `docs/architecture/macro-doctrine-v1.md` — commit `74611b4`

**Décisions figées :**
- Positionnement : "l'opérateur dans le marché" — pas le marché lui-même
- Architecture UX : Vision C enrichie (pattern Debug Brain) — 3 niveaux
- Noyau V1 : BTC Dominance + Funding Rate — confirmation multiple obligatoire
- États : Expansif / Neutre / Contracté — aucun autre — Expansif ≠ Acheter
- MACRO-RULE-01 : descriptif uniquement, jamais directif
- Proxy Constellium rejeté définitivement (`2ccb73f`)
- Corrélations personnelles : module comportemental, pas module Macro
- Maturité progressive : 6 niveaux, rejet gamification absolu
- Logging session × état macro : obligatoire dès J1 d'ouverture

**Conditions d'ouverture du chantier (non résolues) :**
- Modèle d'acquisition des données (conflit fraîcheur/local-first Funding Rate)
- Pont Session × Macro × Comportement (chantier distinct)
- Seuils numériques BTC.D et Funding Rate (calibration terrain)
- N sessions par niveau de maturité

**Statut chantier Macro V1 (implémentation) : DIFFÉRÉ** — après mise en ligne + mémoire opérateur + premiers utilisateurs réels.

---

## MàJ 2026-06-06 — Vision long terme et doctrine écosystème

### Deux documents de vision archivés. Aucun chantier ouvert.

---

**Doctrine écosystème figée** — commit `45ee3c2`
Fichier : `docs/architecture/doctrine-ecosysteme-source-lecteurs.md`

Loi fondatrice : il n'y a pas quatre applications. Il y a une source de vérité
et des lecteurs. Caméléon Engine observe. Mémoire du Caméléon, Scribe du Caméléon
et Constellium sont des lecteurs/projections futures possibles — pas des projets
à construire maintenant.

Règle permanente : nommer un module n'est pas l'autoriser. Tout lecteur futur
doit démontrer un besoin utilisateur réel avant d'exister.

---

**Vision stratégique archivée** — commit `4f33ddf`
Fichier : `docs/vision/vision-systeme-immunitaire-cognitif.md`

Cinq pistes de projets futurs ont été analysées et classées :

- **Moteur de Friction** — piste la plus originale et défendable. Inverse le
  paradigme dominant du logiciel (accélération → friction intelligente).
  Cross-domain. Extension naturelle de ce que Caméléon construit dans le trading.
  À ouvrir uniquement après validation terrain de Caméléon Engine.

- **Cartographe des Décisions** — concept valide (ferme la boucle temporelle
  décision → conséquence). Différé — obstacle structurel de discipline utilisateur
  non résolu.

- **Scribe Automatique** — utile en outil interne. Fragile comme produit
  commercial (commoditisation par les grandes plateformes).

- **Mémoire Vivante** — module futur interne (= Mémoire du Caméléon déjà
  planifiée). Pas un projet autonome.

- **Conservatoire du Réel** — philosophie de travail, pas un produit. Abandonné.

**Fil rouge découvert :** souveraineté cognitive sous pression.
Toutes les pistes répondent au même problème fondamental : comment un humain
conserve-t-il sa lucidité lorsqu'il doit décider dans des conditions difficiles ?

**Hypothèse stratégique :** Caméléon Engine est la première incarnation d'une
réflexion plus large sur la décision humaine. Le trading est le laboratoire le
plus exigeant et le plus mesurable pour ce problème — pas une limite de périmètre.

**Phrase fondatrice :**
> *Les meilleurs outils de décision ne donnent pas de réponses.
> Ils rendent les mauvaises questions visibles.*

---

**Ces réflexions ne modifient pas la roadmap officielle.**

Roadmap officielle en vigueur :

1. Portefeuille utilisateur interne
2. Mémoire opérateur
3. PDF Import V1
4. Compte utilisateur
5. Paiement
6. Mise en ligne
7. Validation terrain

---

## MàJ 2026-06-06 — Plan 10 premiers utilisateurs archivé

**Document de validation terrain** — commit `98c1068`
Fichier : `docs/product/plan-10-premiers-utilisateurs.md`

Stratégie d'apprentissage produit documentée. Hypothèse terrain, pas un plan
marketing. Aucun chantier ouvert.

Principe central : la vraie contrainte n'est pas l'acquisition — c'est la sélection.
Profil cible : trader actif 12+ mois, frustré par lui-même plus que par le marché.
Signal d'incompatibilité : toute personne qui cherche des signaux dans les 5
premières minutes.

Métriques hiérarchisées en 3 niveaux :
- Niveau 1 : preuves de base (import réalisé, retour J+7)
- Niveau 2 : preuves d'engagement (2e import, 3 semaines consécutives)
- Niveau 3 : preuves de valeur + preuve de transformation comportementale

La preuve de valeur supérieure : un changement durable de comportement
(réduction des entrées impulsives, du revenge trading, utilisation volontaire
de la friction). Un gain ponctuel peut être dû au hasard. Un changement durable
ne l'est pas.

Plan J0→J90 : préparation → réseau personnel (3–5 users) → communautés (5 users)
→ bilan. Peu d'utilisateurs, beaucoup d'observation.

**Ce document ne modifie pas la roadmap officielle en vigueur.**

---

## MàJ 2026-06-07 — Faisabilité miroir comportemental archivée

**Étude de faisabilité produit** — commit `d4e2f69`
Fichier : `docs/product/feasibility-miroir-comportemental.md`

Orientation validée conceptuellement. Aucun chantier ouvert.

**Diagnostic central :** le miroir comportemental est sous-alimenté par la
limite actuelle de 20 sessions FIFO. Tout miroir sérieux requiert 50–100
sessions minimum. Le chantier Mémoire opérateur (position 2 roadmap) est
le prérequis qui débloque tout.

**Règles doctrinales permanentes figées — MIR-01→04 :**
- MIR-01 : Décrire, ne pas juger — s'applique aux messages ET aux noms de patterns
- MIR-02 : Ne jamais inférer l'intention à partir du comportement observable seul
- MIR-03 : Le moteur ne diagnostique pas une personnalité
- MIR-04 : La rareté des messages est une propriété de design

**Risques psychologiques documentés :** résistance sans changement, biais de
confirmation, attribution interne ≠ auto-flagellation.

**Prérequis avant implémentation :** auditer les noms de patterns actuels —
la dérive vers le juge vient de l'ontologie, pas des formulations de phrases.

**Séquence juste :** Mémoire longue → miroir minimal → verbatims terrain → décision.

**Ce document ne modifie pas la roadmap officielle en vigueur.**

---

## MàJ 2026-06-10 — Architecture Macro V1 gelée

**Chantier d'architecture terminé.** La doctrine complète de la Couche Macro V1 est figée en 8 documents. Aucun code produit.

**Documents commités — commits `15d1b33` → `4b7dfa5` :**
- `macro_layer_phase0.md` — Mission et doctrine
- `macro_layer_acquisition_phase1.md` — Architecture d'acquisition
- `macro_layer_import_format_phase2.md` — Format d'import
- `macro_state_calculation_phase3.md` — Calcul du Macro_State
- `macro_narrative_layer_phase4.md` — Registre narratif
- `macro_logging_phase5.md` — Logging Session × Macro_State
- `macro_product_integration_phase6.md` — Intégration produit
- `macro_layer_doctrine_v1.md` — **Document de référence unique (porte d'entrée)**

**Décisions immuables figées :**
- MACRO-RULE-01 : score / posture / actions strictement intouchables
- Pas de proxy Constellium (§10)
- 3 états : EXPANSIF / NEUTRE / CONTRACTÉ
- Consensus symétrique par familles — NEUTRE si contradiction
- Option B : mention discrète — jamais au niveau visuel du score
- Logging Session × Macro_State dès le premier commit du chantier
- Couche transversale — jamais 5e couche, jamais deuxième moteur, jamais dashboard

**Conditions bloquantes restantes (5) :**
1. Mise en ligne effective
2. Seuils qualitatifs calibrés avec trader réel
3. Labels des champs validés par trader non-développeur
4. Séparation visuelle documentée
5. Plafond de conservation des sessions résolu (> 50)

**Statut : ARCHITECTURE VALIDÉE — EN ATTENTE D'IMPLÉMENTATION**

Le chantier ne rouvre que sur signal d'implémentation réelle, après mise en ligne et satisfaction des 5 conditions.

---

## MàJ 2026-06-10 — Corpus d'architecture Compte Utilisateur V1 figé

**7 documents d'architecture commités.** Aucun code produit.

**Documents commités — commits `06ef92b` → `12b450d` :**
- `constellium_position_audit.md` — Position officielle Constellium (Sens A / Sens B)
- `user_memory_long_term_audit.md` — Audit mémoire longue : C. Fondatrice
- `user_account_phaseA_audit.md` — Audit Phase A : C. Fondateur — pivot outil→système vivant
- `intelligence_layer_position_audit.md` — Intelligence = couche d'observation uniquement
- `doctrine_to_product_transition_audit.md` — Séquence corrigée, risque dérive par addition
- `user_account_v1_execution_architecture.md` — **Architecture d'exécution GELÉE**
- `user_account_v1_pre_implementation_checklist.md` — Checklist pré-chantier 76 cases
- `user_real_journey_v1.md` — Parcours J0→J+365 — classification A (document fondateur)

**Décisions immuables figées :**
- Admin V1 = co-bloquante avec le Compte Utilisateur (confirmé)
- 5 champs compte V1 : email · server_uuid · created_at · status · rgpd_consent · local_uuid_bridge
- 6 espaces de données physiquement séparés — Espace 1 (identité) n'a aucune donnée comportementale
- Magic link uniquement — pas de mot de passe
- Migration refus : corpus serveur commence à la date de création du compte (pas J0 local)
- Export serveur garanti = condition ferme avant premier commit
- Intelligence = observatoire — 7 formes interdites — seuil de confiance bloquant
- R-INT-08 : prescription passive par accumulation — protection architecturale, pas lexicale
- "Le moteur souverain ne sait pas que le compte existe." — règle permanente finale

**Conditions bloquantes GO/NO GO — 5 fermes :**
1. HTTPS actif
2. Documents légaux complets (CGU · politique · mentions)
3. Pipeline RGPD testé (suppression + export sur données fictives)
4. Admin V1 opérationnelle
5. Export serveur garanti

**5 décisions encore ouvertes :**
1. Fournisseur serveur
2. Fournisseur SMTP
3. TTL magic link
4. Matrice Gratuit / Premium V1
5. Périmètre exact de migration UUID local → serveur

**Paliers de valeur utilisateur figés (user_real_journey_v1.md) :**
- J+45/J+60 : première vraie valeur mémoire longue (preservation vs FIFO localStorage)
- J+90/J+180 : première vraie valeur Couche Macro (≥20 sessions en contextes variés)
- Post J+180 : première valeur Intelligence — seulement si seuil de confiance atteint
- **J+180 = moment où la valeur devient réellement différenciante**
- Vallée de patience J+14→J+45 = moment le plus dangereux d'abandon

**Checklist pré-chantier :**
76 cases sur 7 blocs A→G. Règle absolue : une seule condition critique ouverte = NO GO.

**Statut chantier Compte Utilisateur V1 (implémentation) : EN ATTENTE GO/NO GO**

Le chantier ne s'ouvre qu'après validation des 5 conditions bloquantes + 5 décisions ouvertes. La checklist `user_account_v1_pre_implementation_checklist.md` est l'instrument de validation.

---

## MàJ 2026-06-10 — 5 décisions pré-implémentation Compte Utilisateur V1 fermées

**Toutes les décisions d'architecture préalables sont documentées et figées.** Aucun code produit.

**Documents commités — commits `2bad403` → `598970b` :**

| # | Décision | Résultat | Document | Commit |
|---|----------|----------|----------|--------|
| 1 | Frontière Gratuit / Premium | Option B — local = gratuit · serveur = premium | `freemium_matrix_v1.md` | `2bad403` |
| 2 | TTL Magic Link | 15 min · usage unique · 3/15 min rate limit · 24h rejeté | `magic_link_ttl_v1.md` | `dbb7578` |
| 3 | Fournisseur SMTP | Postmark · Resend = repli · SES rejeté | `smtp_provider_v1.md` | `2b86678` |
| 4 | Fournisseur serveur | Supabase · PocketBase = repli · Firebase rejeté | `server_provider_v1.md` | `ee16310` |
| 5 | Migration UUID local → serveur | Option C — progressive consentie · UUID bridge auto · sessions sur consentement · local intact | `uuid_migration_scope_v1.md` | `6c5cffd` |

**Checklist pré-implémentation mise à jour** — commit `598970b`

12 cases cochées [x] sur 76 :
- A2 (4/4) — frontière Gratuit/Premium documentée
- C1 (1/4) — Magic Link confirmé
- C2 (3/4) — SMTP choisi + TTL documenté + réémission documentée
- D4 (4/4) — refus migration : limitation documentée, corpus serveur, Impact Intelligence, Impact Macro

Cases restantes (64) : tâches d'implémentation uniquement — blocs A1, A3, B, C1 (3), C2 (1), C3, D1/D2/D3, E, F, G.

**Décisions immuables figées par cette session :**
- Frontière locale/serveur : le moteur souverain ne sait pas qu'un abonnement existe
- Magic Link : usage unique · TTL = 15 min · non configurable V1
- SMTP : Postmark branché sur Supabase Auth — email marketing interdit via ce fournisseur
- Serveur : PostgreSQL Supabase · périmètre strict = identité + persistance uniquement
- Migration : jamais silencieuse · jamais destructive · local = filet de sécurité permanent

**Statut GO/NO GO — 2026-06-10 : GO CONDITIONNEL**

Les 5 décisions préalables sont fermées. Le chantier peut ouvrir. Les conditions d'implémentation (64 cases restantes) se cochent pendant le chantier, pas avant.

**Statut chantier Compte Utilisateur V1 (implémentation) : PRÊT À OUVRIR**

---

## MàJ 2026-06-10 — État de la séquence Fondations produit

Mise à jour complète de la séquence officielle issue de l'audit architectural 2026-06-05.

### PHASE FONDATIONS

| # | Chantier | Statut | Référence |
|---|----------|--------|-----------|
| 1 | Architecture des données utilisateur | ✅ CLÔTURÉE — ADU-01→06 | `project_architecture_donnees_utilisateur.md` |
| 2 | Compte utilisateur | 🔓 PRÊT À OUVRIR — 5/5 décisions fermées · GO conditionnel | `user_account_v1_pre_implementation_checklist.md` · `598970b` |
| 3 | Mémoire opérateur | ○ Non démarré — MEM-01B caps/schemas ✅ · MEM-V2 architecture référencée | Après Compte V1 |
| 4 | Portefeuille utilisateur interne | ✅ CLÔTURÉ localStorage V1 — T1→T7 · 2 dettes différées (repo.js + CSS) | `9275466`→`6c05db8` · migration serveur après Compte |

### PHASE PRODUIT

| # | Chantier | Statut | Référence |
|---|----------|--------|-----------|
| 5 | Matrice Gratuit / Premium | ✅ FERMÉE — Option B · local=gratuit · serveur=premium | `freemium_matrix_v1.md` · `2bad403` |
| 6 | Récolte Emails | ○ Non démarré | Indépendant — peut avancer en parallèle |
| 7 | Documents légaux | ✅ Socle V1 CLÔTURÉ — CGU/politique/mentions = post-lancement | `project_legal_v1.md` · `b02afc3` |
| 8 | Paiement | ○ Non démarré | Après Compte + Matrice |
| 9 | Pass & Invitations | ○ Non démarré | Après Compte + Paiement |

### PHASE LANCEMENT

| # | Chantier | Statut | Référence |
|---|----------|--------|-----------|
| 10 | Administration V1 | ○ Non démarré — co-bloquante avec Compte | Condition de mise en ligne — pas post-lancement |
| 11 | Mise en ligne | ○ Non démarré | Gate event — débloque Phase Intelligence |
| 12 | Validation terrain | ○ Non démarré | Protocole bêta V1 documenté · `9d4b832` |

### PHASE INTELLIGENCE

| # | Chantier | Statut | Référence |
|---|----------|--------|-----------|
| 13 | Macro V1 implémentation | ○ Différé — architecture figée · 5 conditions bloquantes | `macro_layer_doctrine_v1.md` · `4b7dfa5` |
| 14 | BMSM | ○ Non démarré — Priorité B | `5130332` · signal terrain ≥ 5 exports requis |
| 15 | Corrélations personnelles avancées | ○ Long terme | Après Macro V1 + volume sessions |

### Décisions structurelles permanentes — rappel

- **Séquence inviolable :** Utilisateur → Sessions → Mémoire → Contexte → Corrélations
- **Compte = pivot :** propriétaire de la Mémoire et du Portefeuille côté serveur
- **Portefeuille V1 localStorage** est fonctionnel mais reste isolé jusqu'à la migration UUID serveur
- **Admin V1 = condition de mise en ligne** — pas un chantier post-lancement
- **Macro V1** ne s'ouvre qu'après mise en ligne + Mémoire opérationnelle + utilisateurs réels
- **Matrice Gratuit/Premium** : décision prise — ne pas construire de fonctionnalité premium avant que le Compte existe
