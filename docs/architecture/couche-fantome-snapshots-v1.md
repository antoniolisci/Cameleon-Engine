# Couche Fantôme — Snapshots V1 — Caméléon Engine

> Document d'architecture fondamental · 2026-06-10
> Statut : **RÉFÉRENCE — implémentation interdite tant que Baseline V1 et versionnement algorithmique ne sont pas intégrés à la roadmap**

---

## Sommaire

1. [Définition canonique](#1-définition-canonique)
2. [Rôle exact](#2-rôle-exact)
3. [Fréquence de création](#3-fréquence-de-création)
4. [Contenu minimal d'un snapshot](#4-contenu-minimal)
5. [Versionnement algorithmique](#5-versionnement-algorithmique)
6. [Lien avec Baseline V1](#6-lien-baseline-v1)
7. [Lien avec MEM-V2](#7-lien-mem-v2)
8. [Immutabilité](#8-immutabilité)
9. [Visibilité UI](#9-visibilité-ui)
10. [Risques à 3 ans](#10-risques)
11. [Conditions non négociables avant implémentation](#11-conditions-non-négociables)
12. [Verdict](#12-verdict)

---

## 1. Définition canonique

### Définition officielle

> **La Couche Fantôme est un registre de snapshots périodiques immuables de l'état de Couche 2 — des portraits comportementaux de périodes closes, cristallisés à intervalles définis, versionnés algorithmiquement, et persistés de façon permanente comme substrat de la détection de patterns de Couche 3.**

### Les trois couches en relation

| Couche | Nature | Temporalité | Durée de vie |
|---|---|---|---|
| **Couche 2** | Tendance vivante | Fenêtre glissante recalculée | Éphémère — remplacée à chaque session |
| **Couche Fantôme** | Tendance figée | Période close cristallisée | Permanente — immuable après création |
| **Couche 3** | Comparaison des tendances figées | Multi-périodes | Mutable — patterns invalidables |

La relation est irréversible dans un seul sens :

```
Couche 2 (vivante)
  ↓ cristallisation périodique
Couche Fantôme (figée)
  ↓ comparaison inter-snapshots
Couche 3 (patterns)
```

Couche 2 alimente la Couche Fantôme. La Couche Fantôme alimente Couche 3. Ni Couche 3 ni la Couche Fantôme ne modifient jamais Couche 2.

### Pourquoi "fantôme"

Cette couche n'est pas visible dans l'interface principale. Elle n'est pas manipulée directement par l'opérateur. Elle est la mémoire structurelle du système — présente partout dans les inférences de Couche 3, invisible dans l'expérience immédiate.

Elle répond à une question que l'opérateur ne peut pas poser autrement :

> "Quel était mon comportement pendant cette période, sachant que les sessions de cette période ont depuis longtemps disparu de ma mémoire locale ?"

## 2. Rôle exact

### Rôle primaire — rendre Couche 3 architecturalement possible

Sans Couche Fantôme, Couche 3 est impossible au-delà du cap FIFO de Couche 1. La démonstration est directe.

Couche 3 doit détecter "profil Réactif dominant en mars ET en juillet" comme un pattern stable. Pour cela, il faut pouvoir répondre à : "Quel était le profil dominant en mars ?"

Couche 2 recalculée en continu ne répond qu'à "Quel est le profil dominant sur les 30 derniers jours ?" — et cette réponse écrase la précédente à chaque mise à jour. Avec le cap de 50 sessions FIFO de Couche 1 : si nous sommes en octobre et que les sessions de mars ont été évincées, aucune reconstruction n'est possible. Les données sources ont disparu.

**La Couche Fantôme est le seul mécanisme qui rend comparables des comportements de périodes éloignées dans le temps.**

### Rôle secondaire — survivre au cap FIFO de Couche 1

Les snapshots de la Couche Fantôme survivent à l'éviction des sessions de Couche 1. Un opérateur actif depuis 18 mois a peut-être 250 sessions totales, dont seulement les 50 dernières sont accessibles localement. Ses snapshots couvrent les 18 mois complets — y compris les périodes dont les sessions brutes ont disparu.

La Couche Fantôme est une **archive comportementale légère** : elle ne stocke pas les sessions, mais elle préserve leur signature agrégée de façon permanente.

### Ce que la Couche Fantôme ne fait pas — règles d'exclusion

Ces interdictions sont structurelles. Les violer compromet l'intégrité de l'ensemble du système.

| Ce qu'elle ne fait pas | Pourquoi |
|---|---|
| **Ne produit pas elle-même de patterns** | La comparaison inter-snapshots est le rôle exclusif de Couche 3 |
| **Ne modifie pas les sessions brutes de Couche 1** | Couche 1 est la source de vérité individuelle — rien ne la modifie rétroactivement |
| **Ne calcule pas de Baseline** | Elle porte la Baseline en métadonnée, ne la construit pas |
| **Ne prend aucune décision** | Elle stocke des portraits, elle n'interprète pas |
| **Ne recalcule pas ses propres données après création** | L'immutabilité est absolue sur les champs comportementaux |

## 3. Fréquence de création

### Le problème des approches naïves

**Temporelle pure (ex. : mensuel) :** un opérateur qui produit 20 sessions en janvier et 2 sessions en février aura deux snapshots de valeur statistique radicalement différente. Couche 3 comparera un portrait robuste et un portrait anémique sans distinction.

**Quantitative pure (ex. : tous les 10 sessions) :** l'opérateur actif produit un snapshot toutes les 3 semaines. L'opérateur occasionnel en produit un tous les 4 mois. Leurs snapshots ne couvrent pas des périodes temporellement comparables.

### Condition duale obligatoire

Un snapshot est créé uniquement quand les **deux** conditions suivantes sont satisfaites simultanément :

| Condition | Seuil V1 | Justification |
|---|---|---|
| **Sessions qualifiées minimum** | ≥ 8 sessions | Garantit la consistance statistique minimale |
| **Durée depuis le dernier snapshot** | ≥ 4 semaines | Garantit la distinction temporelle entre snapshots |

Les deux conditions sont nécessaires. Aucune n'est suffisante seule.

### Règle anti-snapshot anémique

Si les deux conditions ne peuvent pas être satisfaites simultanément — par exemple, l'opérateur a produit 3 sessions en 6 semaines — aucun snapshot n'est créé. Les sessions s'accumulent dans la "période en cours" jusqu'à ce que le seuil soit atteint.

**Un snapshot anémique est plus dangereux qu'un snapshot absent.** Un snapshot basé sur 3 sessions a une variance tellement élevée que ses valeurs sont du bruit. Couche 3 ne peut pas le distinguer d'un snapshot fiable — elle lui accordera la même autorité.

### Règle anti-multiplication sur période dense

Si un opérateur très actif produit 40 sessions en 4 semaines, le snapshot est créé après que les deux conditions sont satisfaites (8 sessions ET 4 semaines). Les sessions supplémentaires de la même période alimentent ce même snapshot — pas un nouveau.

Créer plusieurs snapshots sur une courte période produirait des auto-corrélations artificielles dans Couche 3 : les patterns détectés refléteraient la densité d'activité, pas les tendances comportementales.

### Snapshot manuel

Un snapshot peut être déclenché manuellement par l'opérateur à un moment qu'il juge significatif :
- Avant un changement de stratégie déclaré
- À une date anniversaire
- Après une période de stress de marché intense

Un snapshot manuel n'est pas soumis à la condition duale — il peut être créé avec moins de 8 sessions ou moins de 4 semaines. Il est systématiquement marqué `trigger_type: "manual"` en métadonnée, ce qui permet à Couche 3 de le traiter différemment si nécessaire.

**Un snapshot manuel est une annotation contextuelle, pas un portrait statistique. Couche 3 doit le pondérer en conséquence.**

## 4. Contenu minimal d'un snapshot

### Champs obligatoires

| Champ | Type | Description |
|---|---|---|
| `snapshot_id` | UUID | Identifiant unique immuable — généré à la cristallisation |
| `created_at` | ISO 8601 | Timestamp de cristallisation |
| `period_start` | ISO 8601 | Date de la première session incluse |
| `period_end` | ISO 8601 | Date de la dernière session incluse |
| `session_count` | integer | Nombre de sessions qualifiées incluses |
| `session_ids` | string[] | Identifiants des sessions contributives (pas leurs données) |
| `algo_version` | string | Version du moteur de scoring comportemental actif lors de la cristallisation |
| `baseline_version` | string \| null | Identifiant de la Baseline active · null en mode pré-Baseline |
| `score_mean` | float | Score comportemental moyen sur la période |
| `score_stddev` | float | Écart-type des scores — indicateur de stabilité intra-période |
| `profile_distribution` | object | Pourcentages Discipliné / Réactif / Impulsif / Agressif |
| `profile_dominant` | string | Profil le plus fréquent sur la période |
| `regime_distribution` | object | Pourcentages Expansif / Neutre / Contracté (depuis métadonnées sessions) |
| `data_quality` | enum | full / partial / mixed — qualité globale des sessions incluses |
| `trigger_type` | enum | automatic / manual — comment ce snapshot a été déclenché |

### Taille estimée

Un snapshot correctement structuré pèse entre 500 bytes et 2 KB. 100 snapshots représentent environ 100–200 KB — compatible localStorage.

### Champs interdits dans un snapshot

Les champs suivants ne doivent jamais figurer dans un snapshot, quelle que soit la raison :

| Champ interdit | Raison |
|---|---|
| Données brutes des sessions individuelles | C'est le rôle de Couche 1, pas de la Couche Fantôme |
| Données d'import Trade History / Order History | Les snapshots décrivent des sessions, pas des trades |
| Scores individuels de chaque session | Uniquement l'agrégat — les données individuelles appartiennent à Couche 1 |
| Trades individuels ou montants | Toute donnée financière identifiable est hors périmètre |
| Notes libres non structurées | Les annotations suivent le schéma défini en §8, pas de champs libres |
| Données permettant l'identification croisée | Aucune donnée permettant de reconstituer un historique financier |

### Principe de contenu minimal

Un snapshot doit contenir exactement ce dont Couche 3 a besoin pour comparer des périodes — ni moins (risque de perte d'information analytique), ni plus (risque de stockage de données inutiles ou sensibles).

## 5. Versionnement algorithmique

### Le problème fondamental

Un changement du moteur de scoring comportemental (`scoring.js`, `patterns.js`, `metrics.js`) modifie la façon dont les sessions sont transformées en profils et en scores. Deux snapshots créés avec des versions algorithmiques différentes sont structurellement incomparables — même si leurs valeurs numériques se ressemblent superficiellement.

Comparer un snapshot `algo_version: "1.2"` à un snapshot `algo_version: "2.0"` équivaut à comparer des températures en Celsius avec des températures en Fahrenheit : les échelles diffèrent, la signification diffère.

### Règle de comparabilité — non négociable

> **Couche 3 ne compare que des snapshots partageant la même paire (`algo_version`, `baseline_version`).**

Cette règle est architecturale. Elle ne peut pas être contournée par une transformation mathématique ou une normalisation a posteriori.

### Comportement lors d'un upgrade algorithmique

Quand le moteur comportemental est mis à jour :

1. Les snapshots existants sont **gelés** — marqués avec leur `algo_version`, non modifiés, accessibles en lecture pour l'archive historique
2. Les nouveaux snapshots sont créés avec la nouvelle version
3. Couche 3 **repart de zéro** pour la détection de patterns sur la nouvelle version, jusqu'à accumulation de snapshots comparables
4. L'opérateur est informé : "Suite à une mise à jour du moteur, la détection de tendances reprend sur les nouvelles périodes."

**Conséquence acceptée :** un upgrade algorithmique majeur remet à zéro la détection de patterns. C'est le coût de l'intégrité. Comparer des snapshots de versions différentes produirait des faux patterns — pires que l'absence de patterns.

### Politique de versionnement sémantique

| Niveau | Exemples | Impact sur la Couche Fantôme |
|---|---|---|
| **Patch** (X.Y.Z → X.Y.Z+1) | Correction de bug mineur, normalisation de libellé sans impact sur les scores | Snapshots comparables si impact sur scores < 2% — à documenter explicitement |
| **Mineure** (X.Y → X.Y+1) | Nouveau pattern détecté, poids ajustés, seuils modifiés | Snapshots existants gelés, nouvelle accumulation requise |
| **Majeure** (X → X+1) | Refonte du pipeline de scoring, nouveaux profils, nouvelle échelle | Snapshots existants archivés, remise à zéro complète |

Cette politique doit être inscrite comme contrainte de release : toute release touchant le pipeline comportemental doit documenter son niveau de compatibilité avec les snapshots existants.

### Gestion des snapshots buggy

Si un bug est découvert dans l'algorithme ayant produit des snapshots :

- Les snapshots concernés reçoivent l'annotation `flagged_as_buggy: true` (voir §8)
- Ils sont exclus des comparaisons Couche 3 automatiquement
- Ils restent accessibles pour diagnostic
- **Aucune correction rétroactive n'est appliquée sur leurs données**

### Principe de non-réécriture algorithmique

> L'histoire ne se réécrit pas. Ce qui était vrai à un instant T reste la description de cet instant T, même si l'algorithme était imparfait.

Un snapshot produit par un algorithme buggy est un artefact historique valide — il décrit ce que l'algorithme calculait à ce moment-là. Sa valeur analytique est nulle pour Couche 3, mais sa valeur d'archive reste entière.

## 6. Lien avec Baseline V1

**Document de référence :** `docs/architecture/baseline-v1-officielle.md`

### Chaque snapshot porte sa baseline d'origine

Le champ `baseline_version` de chaque snapshot identifie la Baseline personnelle active lors de la cristallisation. Ce lien est permanent — un snapshot ne change jamais de `baseline_version` après sa création.

Raison : la Baseline contextualise le snapshot. Un score moyen de 62 doit être lu différemment selon que la Baseline active indiquait un score nominal de 55 ou de 70. Sans cette référence figée, la lecture historique du snapshot perd son sens.

### Les snapshots restent attachés à leur baseline d'origine

Même si la Baseline est reconstruite (V1→V2), les snapshots créés sous la Baseline V1 restent associés à `baseline_version: "V1"`. Ils ne sont pas rétroactivement re-référencés à la Baseline V2.

Ce principe est cohérent avec l'immutabilité générale de la Couche Fantôme : le contexte de référence au moment de la cristallisation est une donnée historique, pas une variable recalculable.

### Reconstruction de Baseline = nouveau groupe de comparaison

Quand la Baseline est reconstruite (V1→V2) :

1. Les snapshots existants (`baseline_version: "V1"`) sont **gelés** pour les comparaisons Couche 3
2. Les nouveaux snapshots porteront `baseline_version: "V2"`
3. Couche 3 ne compare que des snapshots de même `baseline_version`
4. La détection de patterns repart de zéro pour le groupe V2

**Temps d'accumulation requis après reconstruction :** avec la fréquence minimale de 4 semaines / 8 sessions par snapshot, et un seuil minimal de 3 snapshots pour une inférence "probable" dans Couche 3, une reconstruction de Baseline implique **au minimum 12 semaines avant que Couche 3 puisse produire de nouvelles inférences.**

C'est un argument supplémentaire en faveur de la doctrine de reconstruction rare inscrite dans la Baseline V1 — chaque reconstruction a un coût analytique réel.

### Snapshots pré-Baseline

Les sessions produites avant que la Baseline V1 soit construite peuvent générer des snapshots. Ces snapshots portent `baseline_version: null`.

| Statut | Usage |
|---|---|
| `baseline_version: null` | Conservés comme archive historique · non utilisés dans les comparaisons Couche 3 normalisées |
| `baseline_version: "V1"` ou supérieure | Analytiquement actifs · participent aux comparaisons Couche 3 |

Les snapshots pré-Baseline ne sont pas supprimés. Ils peuvent servir à une analyse "avant/après première Baseline" si ce cas d'usage est développé ultérieurement.

### Cohérence de séquence

La Couche Fantôme ne peut produire ses premiers snapshots analytiques qu'après que la Baseline V1 est construite. **La Baseline V1 est un prérequis bloquant de la Couche Fantôme analytique.**

## 7. Lien avec MEM-V2

**Document de référence :** `docs/architecture/mem-v2-compte-memoire-persistante.md`

### Position dans les catégories MEM-V2

Les snapshots de la Couche Fantôme ne correspondent exactement ni à la Catégorie A ni à la Catégorie B telles que définies dans MEM-V2.

| Catégorie MEM-V2 | Contenu défini | Couche Fantôme ? |
|---|---|---|
| **Catégorie A** | Sessions brutes individuelles | Non — les snapshots sont des agrégats de sessions |
| **Catégorie B** | Patterns comportementaux agrégés long terme | Partiellement — les snapshots sont le substrat de Catégorie B, pas Catégorie B elle-même |

**Les snapshots forment une sous-couche de Catégorie B** — la matière première à partir de laquelle les patterns de Catégorie B sont extraits. MEM-V2 devra être mis à jour pour documenter cette distinction explicitement.

### Stockage séparé de CE_behavior_sessions_v1

Les snapshots CF doivent être stockés dans un **namespace localStorage distinct** de la FIFO de Couche 1.

Raison fondamentale : les snapshots CF sont conçus pour survivre à l'éviction des sessions Couche 1. Si les deux partagent le même mécanisme de stockage ou d'éviction, la Couche Fantôme perd son utilité principale.

**Clé localStorage recommandée :** `CE_ghost_snapshots_v1` (ou namespace équivalent selon l'architecture ADU).

### Cap local recommandé

| Paramètre | Valeur | Justification |
|---|---|---|
| Cap local | 100 snapshots | Représente 4 à 8 ans d'utilisation pour un opérateur actif — suffisant sans compte |
| Comportement au cap | Signal à l'opérateur · pas de suppression silencieuse | Cohérence avec la doctrine d'immutabilité |

### Compatibilité serveur dès V1

Le schéma de snapshot local doit être identique au schéma serveur anticipé dès le premier déploiement. Aucun champ "local only" qui ne pourrait pas être synchronisé avec MEM-V2 Phase B.

Si le schéma local et serveur divergent, la migration MEM-V2 Phase B nécessitera une transformation de données sur l'ensemble de l'historique — coût et risque élevés.

### Synchronisation avec compte (MEM-V2 Phase B)

Avec compte : les snapshots CF sont synchronisés côté serveur sans cap. La synchronisation est une extension du schéma local — pas une transformation.

L'ordre de synchronisation : sessions (Catégorie A) d'abord, puis snapshots CF (sous-couche Catégorie B). Les snapshots ne peuvent pas être reconstruits côté serveur si les sessions sources ont déjà disparu du FIFO local.

### RGPD — suppression à la demande

Les snapshots CF sont des données personnelles dérivées. L'opérateur doit pouvoir les supprimer à la demande (droit à l'effacement RGPD). La suppression de compte entraîne la suppression des snapshots côté serveur. Côté localStorage, la suppression reste sous contrôle de l'opérateur.

**Note :** la suppression d'un snapshot ne supprime pas les sessions Couche 1 correspondantes, et inversement.

## 8. Immutabilité

### Principe

Un snapshot est immuable après création : aucun de ses champs comportementaux ne peut être modifié. Il représente l'état de la réalité comportementale à l'instant de sa cristallisation — pas l'état idéal, pas l'état corrigé, pas l'état tel qu'on aurait voulu qu'il soit.

### Champs comportementaux immuables

Tous les champs définis en §4 sont immuables après création :

- Données agrégées (score_mean, score_stddev, distributions)
- Références de contexte (algo_version, baseline_version)
- Données de période (period_start, period_end, session_ids)
- Métadonnées de création (created_at, trigger_type)

### Seules les annotations additives sont possibles

Trois annotations peuvent être ajoutées post-création. Elles ne modifient aucune donnée existante — elles ajoutent de l'information contextuelle.

| Annotation | Type | Usage |
|---|---|---|
| `flagged_as_buggy` | boolean | Marque le snapshot comme produit par un algorithme buggy — exclut des comparaisons Couche 3 |
| `excluded_from_patterns` | boolean + raison | Exclut manuellement ce snapshot des comparaisons Couche 3, avec motif documenté |
| `manual_note` | string courte | Note contextuelle de l'opérateur — ne fait pas partie des données analytiques |

Ces annotations ne sont jamais appliquées silencieusement par le système. `flagged_as_buggy` est appliqué par l'équipe produit lors de la détection d'un bug. `excluded_from_patterns` est appliqué sur décision explicite. `manual_note` est appliqué par l'opérateur.

### Interdiction de recalcul rétroactif silencieux

Quelle que soit la raison — correction de bug, upgrade algorithmique, recalibration des seuils — aucun snapshot ne voit ses données comportementales recalculées après création.

**Pourquoi cette règle est non négociable :**

Un opérateur qui voit sa trajectoire se modifier rétroactivement sans explication perd confiance dans la permanence de sa mémoire. Ce sentiment de trahison est plus dommageable que des données imparfaites. La mémoire imparfaite est meilleure que la mémoire révisée silencieusement.

### Règle de non-suppression unilatérale

Le système ne supprime jamais un snapshot de sa propre initiative — uniquement :
- Sur demande explicite de l'opérateur (droit RGPD)
- Sur suppression de compte

Si le cap local de 100 snapshots est atteint, un signal est émis et l'opérateur décide. Le système ne supprime pas les "vieux" snapshots pour libérer de l'espace.

## 9. Visibilité UI

### Principe directeur

> La Couche Fantôme est **invisible comme donnée brute, visible comme présence mémoire.**

L'opérateur ne voit pas les snapshots. Il voit que le système s'appuie sur une mémoire structurée de ses périodes passées. Cette distinction est fondamentale : exposer les données brutes des snapshots créerait de la confusion ; exposer leur existence crée de la confiance.

### Ce qui est visible — UI standard

**Indicateur de couverture mémoire (onglet Mémoire) :**
> "Ta mémoire comporte N périodes — de [mois année] à [mois année]."

**Notification de cristallisation (discrète) :**
> "Caméléon a enregistré une nouvelle période dans ta mémoire. ([mois année])"

Cette notification est sobre — pas une alerte, pas une pop-up. Un indicateur discret dans l'onglet Mémoire ou un badge minimal. L'opérateur doit savoir que sa mémoire se construit, sans que cela interrompe son usage.

**Ligne du temps abstraite :**
Représentation visuelle des mois/trimestres couverts par des snapshots, sans afficher les données de chaque snapshot. Elle montre la densité de la mémoire dans le temps — pas son contenu.

### Ce qui n'est pas visible — par défaut

- Le contenu des snapshots (scores, distributions par période)
- Les champs `algo_version` ou `baseline_version` sous forme brute
- Les `session_ids` contributrices
- Le nombre exact de sessions par snapshot
- Les annotations techniques (flagged_as_buggy, etc.)

**Raison :** les données brutes des snapshots créent plus de confusion que de clarté si présentées directement. Leur valeur est dans ce que Couche 3 en extrait — pas dans leur contenu individuel.

### Transparence sur les patterns (Couche 3)

Quand Couche 3 présente un pattern, l'opérateur peut demander : "Sur quelles périodes ?" Le système répond avec la liste de dates des snapshots contributifs — pas leurs données, uniquement les périodes.

> "Ce pattern a été observé sur 3 périodes : avril 2026 · juillet 2026 · octobre 2026."

### Mode détails avancés (optionnel — V2+)

Pour les opérateurs qui souhaitent comprendre la construction de leur mémoire, un mode optionnel peut exposer :
- La liste des périodes avec durée et nombre de sessions
- L'indicateur de qualité global par période (full / partial / mixed)
- La version de Baseline active par période

Ce mode est **optionnel, accessible sur demande, jamais activé par défaut.**

## 10. Risques à 3 ans

### Risque 1 — Upgrade algorithmique non géré (sévérité : critique)

**Mécanisme :** une mise à jour du moteur comportemental est déployée sans politique de versionnement. Les nouveaux snapshots sont créés avec v2, les anciens avec v1. Couche 3 compare les deux sans distinction.

**Résultat :** des "patterns" sont détectés qui sont des artefacts du changement algorithmique. L'opérateur voit sa trajectoire changer brutalement après une mise à jour. La confiance dans le système s'effondre.

**Probabilité :** élevée si la politique de versionnement n'est pas inscrite comme contrainte de release dès le premier déploiement.

**Prévention :** Condition 3 du §11 — politique de versionnement comme contrainte de release.

---

### Risque 2 — Snapshots anémiques non filtrés (sévérité : modérée)

**Mécanisme :** la condition duale n'est pas respectée lors de l'implémentation. Des périodes de 2-3 sessions produisent des snapshots. Ces snapshots entrent dans Couche 3 avec la même autorité que les snapshots robustes.

**Résultat :** des patterns sont détectés sur des données statistiquement bruit. Couche 3 produit des "insights" non fiables présentés avec la même confiance que des insights fondés.

**Prévention :** Condition 4 du §11 — minimum 8 sessions qualifiées comme contrainte hard.

---

### Risque 3 — Fragmentation du namespace localStorage (sévérité : modérée)

**Mécanisme :** plusieurs versions du produit utilisent des conventions de nommage différentes pour le namespace CF. Des snapshots orphelins s'accumulent dans des clés inconnues de la version actuelle.

**Résultat :** des pertes de mémoire silencieuses. L'opérateur croit avoir une mémoire de 18 mois — en réalité, seuls les 6 derniers mois sont accessibles à Couche 3.

**Prévention :** nommer le namespace CF une seule fois (`CE_ghost_snapshots_v1`), ne jamais le renommer sans procédure de migration explicite.

---

### Risque 4 — Accumulation sans politique de rétention (sévérité : faible à 3 ans, modérée à 5 ans)

**Mécanisme :** sans cap et sans archivage, un utilisateur de 5 ans accumule 260-300 snapshots. Couche 3 compare des centaines de snapshots à chaque calcul de pattern.

**Résultat :** dégradation progressive des performances — imperceptible jusqu'à ce qu'elle soit problématique. Sur mobile ou sur appareils anciens, l'onglet Mémoire devient lent.

**Prévention :** cap à 100 snapshots locaux + signal à l'opérateur au seuil.

---

### Risque 5 — Reconstructions fréquentes de Baseline fragmentant les groupes (sévérité : modérée)

**Mécanisme :** un opérateur reconstruit sa Baseline 3 ou 4 fois en 18 mois. Chaque reconstruction crée un nouveau groupe de snapshots. Aucun groupe n'atteint la densité suffisante pour Couche 3.

**Résultat :** l'opérateur a une mémoire longue en apparence — des dizaines de snapshots — mais analytiquement vide. Chaque groupe est trop petit pour des patterns fiables.

**Prévention :** la doctrine de reconstruction rare de Baseline V1 est le garde-fou principal. La fréquence de reconstruction doit être visible à l'opérateur : "Si tu reconstruis ta référence maintenant, la détection de tendances reprend à zéro."

## 11. Conditions non négociables avant implémentation

Ces conditions doivent être satisfaites avant qu'une seule ligne de code liée à la Couche Fantôme soit écrite. Leur non-respect crée des dettes structurelles impossibles à corriger rétroactivement sans perte de données ou refactorisation majeure.

---

### Condition 1 — Namespace de stockage dédié, séparé du FIFO Couche 1

Les snapshots CF doivent être stockés dans un namespace localStorage distinct de `CE_behavior_sessions_v1`. Ils ne partagent aucun mécanisme d'éviction avec Couche 1.

**Pourquoi bloquant :** si les snapshots partagent le FIFO des sessions, ils seront évincés avec elles. La Couche Fantôme perd son rôle fondamental — survivre au cap FIFO.

---

### Condition 2 — `algo_version` et `baseline_version` obligatoires sur chaque snapshot

Ces deux champs doivent être présents et renseignés sur chaque snapshot. Un snapshot sans l'un de ces champs ne doit pas être créé.

**Pourquoi bloquant :** sans eux, Couche 3 ne peut pas garantir la comparabilité des snapshots. Tout pattern détecté sans ces champs est potentiellement un artefact de version.

---

### Condition 3 — Politique de versionnement algorithmique inscrite comme contrainte de release

Toute release touchant le pipeline comportemental (`scoring.js`, `patterns.js`, `metrics.js`) doit documenter son niveau de compatibilité avec les snapshots existants (patch / mineure / majeure) avant déploiement.

**Pourquoi bloquant :** sans cette contrainte, le premier upgrade post-déploiement produira silencieusement des données incomparables — indétectable jusqu'à ce que Couche 3 produise des faux patterns.

---

### Condition 4 — Minimum 8 sessions qualifiées avant cristallisation (contrainte hard)

Le seuil de 8 sessions qualifiées est une contrainte d'implémentation non contournable — pas une recommandation. Aucun snapshot ne peut être créé sous ce seuil (sauf snapshot manuel explicitement marqué).

**Pourquoi bloquant :** un snapshot anémique corrompt Couche 3 de façon indétectable. Couche 3 lui accorde la même autorité qu'à un snapshot robuste.

---

### Condition 5 — Notification opérateur à chaque cristallisation

La création d'un snapshot doit être signalée à l'opérateur — discrètement, mais de façon visible dans l'onglet Mémoire.

**Pourquoi bloquant :** si la mémoire se construit silencieusement, l'opérateur ne comprend pas l'origine des patterns présentés par Couche 3. La transparence sur la construction est nécessaire à la confiance dans les résultats.

---

### Condition 6 — Schéma de snapshot compatible serveur dès V1

Le schéma du snapshot local doit être identique au schéma serveur anticipé pour MEM-V2 Phase B. Aucun champ "local only".

**Pourquoi bloquant :** un schéma divergent entre local et serveur impose une transformation de données sur l'ensemble de l'historique lors de la migration — coût élevé, risque de perte.

---

### Condition 7 — La Couche Fantôme attend la Baseline V1

Les premiers snapshots analytiques (avec `baseline_version` renseignée) ne peuvent être créés qu'après que la Baseline V1 est construite.

**Pourquoi bloquant :** des snapshots sans référence Baseline (`baseline_version: null`) ne peuvent pas participer aux comparaisons normalisées de Couche 3. Créer des snapshots analytiques avant la Baseline revient à créer une mémoire sans cadre de référence — inutilisable et trompeuse.

## 12. Verdict

### Verdict global

**GO AVEC CONDITIONS — architecture cohérente, rôle clairement délimité, implémentation interdite tant que Baseline V1 et versionnement algorithmique ne sont pas intégrés à la roadmap.**

---

### Ce qui est solide

**La définition est non ambiguë.** Un snapshot CF n'est pas un backup, pas un cache, pas une vue dérivée. C'est un portrait comportemental de période close, immuable après création, dont le seul rôle est de rendre Couche 3 possible. Cette précision évite les dérives d'implémentation.

**La condition duale de cristallisation est juste.** L'exigence ≥8 sessions qualifiées AND ≥4 semaines n'est ni arbitraire ni conservative par excès. Elle correspond au volume minimum pour que l'état de Couche 2 reflète une réalité comportementale et non un bruit de courte durée.

**L'immutabilité comportementale est la bonne décision.** Autoriser la modification rétroactive des snapshots détruirait la fiabilité de Couche 3. Les trois annotations additives autorisées (`flagged_as_buggy`, `excluded_from_patterns`, `manual_note`) sont le bon niveau de flexibilité — sans jamais altérer ce qui a été observé.

**Le versionnement algorithmique (`algo_version` + `baseline_version`) est structurellement nécessaire.** Sans lui, chaque upgrade du moteur comportemental produit silencieusement des données incomparables. L'inscrire comme contrainte de release dès le premier déploiement est la seule approche viable.

**L'articulation avec Baseline V1 est correcte.** La Couche Fantôme attend la Baseline — pas l'inverse. Des snapshots sans `baseline_version` renseignée ont un rôle réduit et explicitement documenté, ce qui évite l'illusion de Couche 3 avant que les prérequis soient réunis.

---

### Ce qui casse sans les 7 conditions

| Condition manquante | Conséquence directe |
|---|---|
| Namespace non dédié | Snapshots évincés par FIFO Couche 1 — Couche Fantôme vide à terme |
| `algo_version` absent | Faux patterns détectés après tout upgrade du moteur |
| Politique de versionnement absente | Première release post-déploiement corrompt les comparaisons silencieusement |
| Seuil 8 sessions non enforced | Snapshots anémiques entrent dans Couche 3 avec autorité de snapshots robustes |
| Cristallisation silencieuse | Opérateur ne comprend pas l'origine des patterns — confiance impossible |
| Schéma non compatible serveur | Migration MEM-V2 Phase B = transformation de l'historique complet |
| Déploiement avant Baseline V1 | Mémoire de Couche 3 sans cadre de référence — analytiquement inutilisable |

---

### Relation avec les autres documents fondateurs

Ce document forme, avec `baseline-v1-officielle.md` et `mem-v2-compte-memoire-persistante.md`, la triade architecturale de la mémoire opérateur long terme. Les trois sont interdépendants :

- Sans **Baseline V1** : les snapshots CF existent mais ne peuvent pas être normalisés entre eux.
- Sans **MEM-V2 Phase B** : les snapshots CF survivent localement mais disparaissent avec le navigateur.
- Sans **Couche Fantôme** : Baseline V1 existe mais ne peut pas être transformée en trajectoire — la mémoire reste statique.

Aucun des trois ne peut être implémenté isolément de façon utile. Leur séquence d'implémentation est : Baseline V1 → Couche Fantôme → Couche 3, sur un substrat MEM-V2 Phase B.

---

*Référence roadmap : `project_product_roadmap_foundations.md` · Famille : Mémoire Opérateur Long Terme · Prérequis : `baseline-v1-officielle.md` · `mem-v2-compte-memoire-persistante.md`*
