# Mémoire Utilisateur Long Terme — Audit Architectural

**Caméléon Engine · Document d'architecture**
**Date : 2026-06-10 · Statut : AUDIT — EN ATTENTE DE VALIDATION**

> Ce document est un audit de position. Aucun code. Aucun schéma. Aucun choix technique définitif.
> Il détermine comment Caméléon Engine peut conserver l'historique d'un utilisateur
> sur plusieurs mois ou années sans casser l'architecture actuelle.

---

## 1. Mission

**Question centrale :**

> Comment permettre à Caméléon Engine de se souvenir d'un utilisateur dans le temps afin de rendre possibles : la mémoire durable, les corrélations comportementales, la Couche Macro, les futures lectures personnelles, et le futur Constellium ?

Ce document ne répond pas à "comment stocker". Il répond à "pourquoi stocker, quoi stocker, et à quel horizon".

---

## 2. Pourquoi ce chantier existe

### 2.1 Ce que Caméléon Engine est sans mémoire durable

Un outil d'analyse de formulaire. Chaque session est une observation isolée. L'opérateur repart avec un verdict. Demain, le moteur ne sait pas s'il l'a vu hier.

L'outil est utile à chaque usage. Il ne grandit pas avec son utilisateur.

C'est la situation actuelle.

### 2.2 Ce que Caméléon Engine devient avec mémoire durable

Un système qui observe l'opérateur dans le temps. Il ne répond plus seulement à "que montre ce formulaire maintenant ?" — il répond aussi à "qu'est-ce qui se répète chez cet opérateur ?"

La différence n'est pas technique. C'est une différence de nature.

**Sans mémoire longue :** outil d'analyse ponctuel.
**Avec mémoire longue :** système vivant.

### 2.3 La différence entre outil d'analyse et système vivant

| Dimension | Outil d'analyse | Système vivant |
|---|---|---|
| Granularité temporelle | Session unique | Trajectoire multi-mois |
| Connaissance opérateur | Formulaire actuel | Historique personnel |
| Valeur avec le temps | Constante | Croissante |
| Corrélations possibles | Aucune | Comportement × contexte × régime |
| Ce qu'il produit | Verdict instantané | Intelligence différée |
| Dépendance à l'utilisateur | Zéro | Forte (irremplaçable après N sessions) |

La valeur d'un système vivant est derrière un mur temporel. Elle n'est pas visible en semaine 1. Elle devient irremplaçable en mois 12.

---

## 3. Limites actuelles

### 3.1 Le plafond 50 sessions

`SESSION_LIMIT = 50` (MEM-01B, Bloc A, 2026-06-07). Les sessions comportementales sont stockées en FIFO : à la 51e session, la plus ancienne est effacée.

À raison de 3 imports par semaine : 50 sessions = ~17 semaines = environ 4 mois de données maximum. Passé ce délai, l'historique commence à perdre ses premières observations.

Ce plafond est le goulot d'étranglement structurel de toute intelligence temporelle.

### 3.2 La mémoire locale

Toutes les données opérateur résident dans `localStorage` du navigateur. Ce stockage est :

- **Non transférable** entre appareils — l'opérateur qui change de navigateur repart de zéro
- **Fragile** — vider le cache du navigateur efface tout
- **Non synchronisé** — aucun backup automatique, export JSON manuel uniquement
- **Nominalement capé** — chaque navigateur impose une limite (5–10 Mo selon les implémentations)

L'export JSON (`ARCH-N4`, clôturé) est la seule sortie de secours. Il est manuel et passif.

### 3.3 Persistance actuelle — état réel

| Données | Stockage | Cap | Durée réelle |
|---|---|---|---|
| Sessions comportementales | `CE_behavior_sessions_v1__{uuid}` | 50 FIFO | ~4 mois à 3 imports/sem |
| Snapshots moteur | `CE_backups_v1__{uuid}` | 50 | Non limité par usage |
| Historique formulaires | `CE_journal_entries_v1__{uuid}` | 200 | Quelques mois |
| Registre imports | `CE_import_registry_v1__{uuid}` | 100 | Non limité par usage |
| Mémoire comportementale | `cameleon_behavior_memory_v1__{uuid}` | Indéfini | Volatile — réécrite à chaque import |

Aucune de ces données n'est synchronisée avec un serveur. Tout est local.

### 3.4 Conséquences sur la Couche Macro

La Macro_State doit être associée à chaque session pour produire des corrélations comportement × régime. Cette exigence est formelle (doctrine Macro V1, Phase 5 Logging).

Avec 50 sessions maximum et aucun serveur : le logging est actif, mais la fenêtre d'observation est bornée à ~4 mois. Les corrélations Macro × comportement exigent 6–24 mois de données (doctrine Macro V1, §8). L'infrastructure actuelle ne peut pas les produire.

### 3.5 Conséquences sur le module Comportement

L'étude de faisabilité du miroir comportemental (2026-06-07) établit que tout miroir sérieux exige 50–100 sessions. L'infrastructure atteint le seuil minimal (50). Mais le seuil haut (100) et la durée réelle (plusieurs mois, pas seulement le volume) sont conditionnels à la mémoire longue.

Un volume de sessions ne suffit pas : la distribution temporelle compte. 50 sessions en 3 semaines n'ont pas la même valeur que 50 sessions sur 6 mois.

### 3.6 Conséquences sur l'Intelligence future

Toute lecture personnelle avancée — Empreinte Opérateur™, Bibliothèque Vivante, Miroir Vivant — dépend d'un corpus personnel robuste sur durée. Sans mémoire longue, ces modules seraient construits dans le vide.

---

## 4. Unité mémoire

### 4.1 Ce qui doit être conservé

**L'unité centrale : la Session.**

Une session est un cycle complet : Pilotage → Moteur → Verdict → Validation humaine.
Elle contient l'état de l'opérateur au moment de la décision.

| Élément | Justification |
|---|---|
| `session_id` | Identifiant unique de l'observation |
| `timestamp` | Ancrage temporel — irremplaçable |
| `macro_state` | Contexte systémique au moment de la décision |
| `macro_data_date` | Fraîcheur des données macro à ce moment |
| `emotion_state` | État auto-déclaré de l'opérateur |
| `validation_state` | Résultat humain : accepté / ajusté / rejeté |
| `need_action` | Signal comportemental du moteur |
| `operator_profile` | Profil PASSIF / ÉQUILIBRÉ / ACTIF |
| `market_posture` | Posture décisionnelle à ce moment |
| Score comportemental | Discipliné / Réactif / Impulsif / Agressif |
| Patterns détectés | Liste des patterns actifs, avec intensité |
| Résumé qualité import | `analysisQuality`, `dataQuality.level` |

**Éléments secondaires à conserver :**

- Registre des imports (source, format, date, qualité)
- Snapshots moteur (profil, score confiance, contexte macro V1)

### 4.2 Ce qui ne doit jamais être conservé

Ces exclusions sont doctrinales et permanentes.

| Élément | Raison |
|---|---|
| Montants en valeur absolue | Données financières sensibles |
| Tailles de positions | Données financières sensibles |
| PnL, résultats, gains/pertes | Orientation performance — interdit par doctrine |
| Valeurs numériques brutes des indicateurs macro | Granularité inutile en mémoire longue |
| Données personnelles identifiantes | RGPD, confiance |
| Clés d'API, tokens, identifiants externes | Sécurité fondamentale |
| Toute donnée qui transforme la mémoire en bilan financier | Contraire à la philosophie produit |

**Règle permanente :** l'orientation de la mémoire est comportement × contexte. Jamais performance × résultat. Une session mémorisée décrit comment l'opérateur a agi. Elle ne dit jamais combien il a gagné ou perdu.

---

## 5. Horizons temporels

### 1 semaine

L'opérateur complète 2–5 formulaires. Le moteur produit des verdicts. Aucune corrélation possible. La mémoire locale est abondante. Aucune valeur différentielle par rapport à un outil sans mémoire.

Valeur nouvelle : **aucune**. La mémoire existe mais ne produit pas encore d'intelligence.

### 1 mois

L'opérateur a entre 12 et 25 sessions. Les premiers patterns comportementaux apparaissent dans le module Comportement. Le score comportemental commence à avoir une signification relative.

Valeur nouvelle : **premières tendances comportementales observables**. Encore fragiles. Le moteur peut commencer à dire "sur ce mois, tu as été majoritairement Réactif".

### 6 mois

Entre 75 et 150 sessions selon le rythme. Le plafond actuel de 50 sessions est dépassé — les premières données sont effacées si l'infrastructure n'a pas évolué.

Les corrélations commencent à être exploitables : comportement × régime macro si le logging est actif dès J0. Les patterns les plus fréquents ont une solidité indicative.

Valeur nouvelle : **premières hypothèses sur les corrélations personnelles**. Niveau de confiance : indicatif. Formulation : "Dans les contextes CONTRACTÉS, tu ajustes plus souvent que d'habitude."

### 24 mois

Entre 300 et 600 sessions. Le corpus personnel est dense. Les corrélations comportement × Macro_State × profil temporel deviennent robustes. L'Empreinte Opérateur™ a suffisamment de matière pour produire une synthèse non générique.

Valeur nouvelle : **intelligence personnelle exclusive**. Ce que le moteur produit à ce stade n'existe nulle part ailleurs — aucun outil concurrent ne peut le reproduire sans ces 24 mois de données.

### 5 ans

Le corpus personnel est une trajectoire. Pas seulement "ce que tu fais maintenant" mais "comment tu as évolué". Le moteur peut décrire des transitions — des phases de l'opérateur dans le marché.

Valeur nouvelle : **mémoire vivante d'une trajectoire**. Le produit cesse d'être un outil d'analyse. Il devient le journal de bord d'une évolution.

---

## 6. Corrélations futures

Sans construire d'algorithmes, voici ce que la mémoire longue rend possible.

**FOMO × régime macro :** Dans les contextes EXPANSIF, l'opérateur soumet-il plus de formulaires ? Ajuste-t-il moins sa validation ? La fréquence de sessions en régime EXPANSIF corrèle-t-elle avec un profil Réactif ou Impulsif ?

**Impulsivité × contexte marché :** Les sessions classées "Impulsif" se concentrent-elles dans certaines configurations de formulaire (fire strong + état émotionnel + stress) ? Un seuil de déclenchement personnel est-il identifiable ?

**Validation humaine × posture :** L'opérateur accepte-t-il plus souvent les verdicts moteur en posture VEILLE qu'en posture FRICTION ? La fréquence de rejet / ajustement corrèle-t-elle avec un contexte macro particulier ?

**Comportement × Macro_State :** Un même score comportemental en régime CONTRACTÉ et en régime EXPANSIF a-t-il la même signification ? L'opérateur sur-calibre-t-il sa vigilance en CONTRACTÉ ou la sous-calibre-t-il en EXPANSIF ?

Ces corrélations n'existent nulle part ailleurs. Elles ne sont pas produites par un algorithme prédictif — elles émergent de l'observation de l'opérateur par lui-même sur durée. C'est la proposition de valeur centrale du système vivant.

---

## 7. Relations avec les couches existantes

### Pilotage

La mémoire longue enrichit le Pilotage en lui donnant un référentiel personnel. Au lieu de "voici ta posture maintenant", le moteur peut contextualiser : "voici ta posture maintenant, comparée à tes 30 dernières sessions en conditions similaires". Sans mémoire longue : comparaison impossible.

### Moteur

Le Moteur est souverain et stateless. Il ne consulte pas la mémoire longue pour calculer. La règle MACRO-RULE-01 s'applique par extension : la mémoire longue ne modifie jamais le score, la posture, ni les actions autorisées. Elle enrichit uniquement la narration et le contexte.

### Mémoire (couche actuelle)

La couche Mémoire actuelle — localStorage + 50 sessions FIFO — est la V1 de ce qui doit devenir une mémoire longue durable. La rupture architecturale à venir est : passer du stockage local éphémère à un stockage serveur persistant. L'UUID namespacing (ADU-01→04) est le pont préparé pour cette migration.

### Comportement

Le module Comportement lit les sessions pour calculer des scores et patterns. Avec 50 sessions locales, sa profondeur temporelle est bornée. Avec une mémoire longue, il peut travailler sur plusieurs mois — les patterns deviennent des tendances, les tendances deviennent des signatures.

### Couche Macro

La Couche Macro produit sa valeur réelle uniquement en présence d'une mémoire longue (doctrine Macro V1, §9). Sa valeur de court terme — contextualisation narrative — est utile mais non différenciante. Sa valeur réelle — corrélation comportement × régime systémique — est derrière un mur de 6 à 24 mois. Sans mémoire longue, la Couche Macro reste un gadget de contexte. Avec mémoire longue, elle devient une intelligence exclusive.

---

## 8. Relation avec le Constellium

### La dépendance est fondatrice

Le Constellium Sens B — l'application principale future — est défini comme "l'histoire vivante d'un opérateur dans le temps". Cette définition n'est pas métaphorique. Elle est littérale.

Sans mémoire longue, il n'y a pas d'histoire. Sans histoire, il n'y a pas de Constellium — il y a un dashboard.

La mémoire longue est donc une **condition nécessaire** du Constellium, pas une feature optionnelle.

### À quel niveau

Le Constellium dépend de la mémoire longue à plusieurs niveaux :

- **Bibliothèque Vivante** — impossible sans trajectoire multi-mois
- **Empreinte Opérateur™** — synthèse identitaire sans corpus = horoscope
- **Miroir Vivant** — interaction avec son propre historique : sans historique, pas de miroir
- **Corrélations personnelles avancées** — nécessitent le corpus croisé (Trade × Behavior × Macro)

### À quel horizon

La mémoire longue doit être active **dès le premier commit** pour chaque utilisateur. Pas parce que la valeur est immédiate — elle ne l'est pas — mais parce qu'une session non loggée est perdue définitivement. Le mur temporel ne peut pas être raccourci rétroactivement.

Chaque utilisateur doit commencer à accumuler dès son premier usage, même si l'intelligence personnelle n'apparaît que 6 à 24 mois plus tard.

---

## 9. Risques

### R-MEM-01 — Explosion du volume

À 3 sessions par semaine sur 5 ans : ~750 sessions par utilisateur. Sur 1 000 utilisateurs actifs : 750 000 sessions. Si chaque session pèse ~10 Ko, c'est 7,5 Go de données comportementales. Ce n'est pas un volume critique pour un hébergement standard, mais il doit être planifié avant le lancement.

**Mitigation :** archivage progressif, FIFO côté serveur si nécessaire, compression des sessions anciennes.

### R-MEM-02 — Dérive surveillance

Un système qui observe l'opérateur dans le temps peut glisser vers de la surveillance si les données sont utilisées pour évaluer la "performance" plutôt que la "cohérence comportementale".

**Mitigation :** doctrine permanente comportement × contexte / jamais performance × résultat. Séparation des espaces mémoire (privé / opt-in / agrégé). Aucune donnée individuelle dans l'Espace 3.

### R-MEM-03 — Surcharge utilisateur

Si le système expose trop d'informations passées, l'opérateur peut être paralysé par son propre historique ou entrer dans une relation obsessionnelle avec ses patterns.

**Mitigation :** règles MIR-01→04 permanentes. Rareté comme propriété de design (MIR-04). La mémoire doit être disponible quand l'opérateur la cherche — jamais imposée.

### R-MEM-04 — Perte de lisibilité

Plus la mémoire est riche, plus le risque de produire des interfaces illisibles est élevé. Trop d'informations historiques tuent la clarté du verdict présent.

**Mitigation :** hiérarchie de l'affichage : verdict moteur toujours en premier. Mémoire = niveau 2 ou 3, accessible volontairement. Jamais dans la zone principale.

### R-MEM-05 — Confusion mémoire / prédiction

Le risque le plus subtil : l'opérateur interprète une tendance historique comme une prédiction future. "Tu as souvent été Impulsif en EXPANSIF" → "donc je vais être Impulsif demain en EXPANSIF".

**Mitigation :** vocabulaire interdit dans toute surface mémoire : "probablement", "tu vas", "il faut", "risque de". Seul le présent observé est légitime. La mémoire décrit ce qui s'est passé. Elle ne prédit jamais.

### R-MEM-06 — Dette produit par accumulation

Construire une mémoire longue sans architecture données solide produit une dette croissante. Chaque session enregistrée dans un format non stable coûte une migration future.

**Mitigation :** `schemaVersion` dans tous les objets persistés (déjà en place pour backups et sessions via MEM-01B Blocs B et C). Toute extension du schéma doit être compatible ascendante.

---

## 10. Conditions bloquantes

Aucun chantier mémoire longue serveur ne s'ouvre avant :

- ☐ Mise en ligne effective sur domaine avec HTTPS (Phase A MEM-V2 — condition absolue)
- ☐ Compte utilisateur actif — email + UUID (Phase B MEM-V2 — sans identité stable, pas de mémoire personnelle)
- ☐ Bridge UUID local → serveur testé et documenté (ADU-01→04 en place localement — pont vers serveur = Phase B)
- ☐ Pipeline RGPD opérationnel — droit à la suppression testé avant toute écriture serveur
- ☐ Matrice Gratuit/Premium décidée — le périmètre de la mémoire longue (combien de sessions, quels types) dépend du modèle économique
- ☐ Format de session stabilisé — `schemaVersion` doit être figé avant accumulation serveur
- ☐ Décision sur le cap FIFO serveur (DO-01 ouvert) — combien de sessions conserver côté serveur ?

---

## 11. Recommandation

### La mémoire longue durée est — C. Fondatrice.

**Elle n'est pas optionnelle** parce que sans elle, la valeur différenciante centrale du produit (corrélations personnelles comportement × régime × contexte) ne peut pas exister.

**Elle n'est pas simplement importante** parce que son impact n'est pas additif — elle change la nature du produit. Sans elle, Caméléon Engine est un outil d'analyse ponctuel. Avec elle, il devient un système vivant. Ce n'est pas une amélioration — c'est une transformation de catégorie.

**Elle est fondatrice** parce que :
1. Elle conditionne la valeur réelle de la Couche Macro (doctrine Macro V1, §9)
2. Elle est la condition nécessaire du Constellium Sens B
3. Elle est le prérequis du miroir comportemental, de l'Empreinte Opérateur™, de la Bibliothèque Vivante
4. Elle ne peut pas être construite rétroactivement — chaque session non loggée est perdue définitivement
5. Sa valeur est derrière un mur temporel de 6 à 24 mois — commencer tard coûte du temps irremplaçable

**Séquence juste :**
Logging actif dès J0 (local) → Mise en ligne → Compte utilisateur → Bridge serveur → Accumulation longue durée → Corrélations → Lectures personnelles.

Le logging local est déjà actif. L'étape bloquante est le passage au serveur — conditionné à la mise en ligne et au compte utilisateur.

---

## 12. Verdict

La mémoire longue durée est la colonne vertébrale de tout ce que Caméléon Engine doit devenir. Elle n'est pas un chantier parmi d'autres — elle est la condition de l'intelligence différenciante du produit.

L'état actuel (50 sessions FIFO locales) est une fondation nécessaire, pas un état stable. Chaque jour d'usage sans mémoire serveur est une observation potentiellement perdue si le localStorage est effacé.

La séquence est juste : ce chantier ne s'ouvre pas avant la mise en ligne et le compte utilisateur. Mais il est non négociable après. Aucune lecture personnelle, aucune corrélation macro, aucune Bibliothèque Vivante, aucun Constellium vivant ne sont possibles sans lui.

**Statut : DIFFÉRÉ — CONDITIONS IDENTIFIÉES — PRIORITÉ ABSOLUE EN PHASE INTELLIGENCE**

---

## Résumé exécutif

**Décision la plus importante**
La mémoire longue durée est fondatrice, pas optionnelle. Elle change la nature du produit — de l'outil d'analyse ponctuel au système vivant. Toutes les couches intelligentes (Macro, Comportement, Constellium) en dépendent structurellement.

**Découverte la plus importante**
La valeur différenciante réelle de Caméléon Engine — les corrélations personnelles comportement × régime × contexte — est entièrement derrière un mur temporel de 6 à 24 mois. Cette valeur n'est pas reproductible par des concurrents sans le même historique. Elle ne peut pas être construite rétroactivement. Chaque session non loggée dès J0 est une donnée perdue définitivement.

**Risque principal**
Confusion mémoire / prédiction (R-MEM-05) : l'opérateur interprète une tendance historique comme un signal directif. Le vocabulaire de la mémoire doit être strictement descriptif — jamais prescriptif, jamais prédictif.

**Condition bloquante principale**
Mise en ligne effective sur domaine avec HTTPS + Compte utilisateur actif (Phase A + B de MEM-V2). Sans identité stable côté serveur, aucune mémoire longue n'est possible. Le logging local actuel est la fondation — le passage au serveur est l'étape bloquante.

**Verdict**
La mémoire longue durée est la condition de l'intelligence différenciante du produit. Le logging local est actif et sain. Le passage au serveur est non négociable après la mise en ligne. Sans lui : pas de corrélations Macro, pas de miroir comportemental robuste, pas de Constellium vivant. Statut : différé avec conditions identifiées — priorité absolue en Phase Intelligence.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `mem-v2-compte-memoire-persistante.md` · `architecture-donnees-utilisateur.md` · `macro_layer_doctrine_v1.md` · `feasibility-miroir-comportemental.md`*
