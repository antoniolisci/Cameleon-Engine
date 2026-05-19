# Audit visuel canonique — Caméléon Engine V1

**Date :** 2026-05-19
**Statut :** document de référence — audit ponctuel, non prescriptif sur le fond applicatif.
**Périmètre :** assets visuels présents dans le repo au moment de l'audit.

> Ce document ne génère pas de nouveaux visuels.
> Il filtre, classe et stabilise ce qui existe.
> Son but est d'éviter que chaque nouvelle session réinvente l'identité visuelle de zéro.

---

## 1. Objectif de l'audit

Le projet possède déjà suffisamment d'assets visuels pour commencer à stabiliser un canon.

Le problème actuel n'est plus "produire plus."

Le problème actuel est :

- **sélectionner** — distinguer ce qui appartient à l'identité du reste
- **classifier** — organiser par niveau de canonicité
- **stabiliser** — figer un référentiel que tout contributeur futur peut lire
- **protéger** — éviter que Grok ou toute future génération réinvente Caméléon Engine à chaque session

Un moodboard sans critères est une invitation à la dilution.
Cet audit pose les critères avant de poser les images.

---

## 2. Inventaire complet des assets

*Filenames exacts tels que présents dans le repo au moment de l'audit.*

### A. Vidéos comportementales — `assets/video/video_comportementale/`

```
alignement.mp4
assechement.mp4
defense.mp4
degradation.mp4
exces.mp4
execute.mp4
inflexion.mp4
observation.mp4
piege.mp4
prudence.mp4
retenue.mp4
```

**Note de nommage :** le fichier s'appelle `execute.mp4`, pas `execution.mp4`.
Écart à documenter si le nom est intentionnel — "exécuter" (verbe actif) versus "l'exécution" (concept).

### B. Vidéos structurelles — `assets/video/video_structurelle/`

```
coherence.mp4
introspection.mp4
mystere.mp4
mystere_silencieuse.mp4
ralentissement.mp4
respiration_systeme.mp4
transformation.mp4
```

**Notes de nommage :**
- `respiration_systeme.mp4` — pas `resolution_systeme.mp4` (le mot "respiration" est plus juste doctrinalement)
- `mystere_silencieuse.mp4` — accord féminin (silencieuse) ; cohérence à vérifier avec `mystere.mp4`

### C. Séries d'images comportementales — `assets/images/`

Quatre séries de 5 niveaux chacune, non mentionnées dans le brief initial mais présentes dans le repo :

**Discipline** — `assets/images/discipline/`
```
discipline_lvl1_calm.png
discipline_lvl2_observe.png
discipline_lvl3_align.png
discipline_lvl4_master.png
discipline_lvl5_detach.png
```

**FOMO** — `assets/images/fomo/`
```
fomo_lvl1_curiosity.png
fomo_lvl2_attraction.png
fomo_lvl3_tension.png
fomo_lvl4_impulse.png
fomo_lvl5_trap.png
```

**Overtrading** — `assets/images/overtrading/`
```
overtrading_lvl1_mild.png
overtrading_lvl2_active.png
overtrading_lvl3_reactive.png
overtrading_lvl4_emotional.png
overtrading_lvl5_chaos.png
```

**Revenge** — `assets/images/revenge/`
```
revenge_lvl1_frustration.png
revenge_lvl2_recover.png
revenge_lvl3_forced.png
revenge_lvl4_spiral.png
revenge_lvl5_collapse.png
```

### D. Logos — `assets/images/logo/` et `assets/images/`

```
assets/images/logo/logo_haut.jpeg
assets/images/logo/logo_bas.jpeg
assets/images/cameleon-logo.png
```

### E. Vidéos supprimées — `assets/video/video_supprimee/`

Archivées explicitement, conservées pour traçabilité :

```
stop.mp4
prudence.mp4          ← doublon avec video_comportementale/prudence.mp4
attente.mp4
execution.mp4         ← variante avec "execution" (vs execute.mp4 actif)
Logo_rond_cameleon_noir_doree.MP4
cameleon_engine_logo_fond_noir_simple.mp4
camleon_doré_avec_chaine.mp4
.mp4                  ← fichier sans nom — à identifier ou supprimer
```

### F. Images système — `assets/images/`

```
constellium-guide.png
constellium-main.png
```

Assets spécifiques au module Constellium — hors périmètre de l'audit identité principale.

---

## 3. Analyse par famille

### A. Vidéos comportementales

Ces vidéos constituent le cœur émotionnel et comportemental du cockpit.

Elles expriment :
- état intérieur du trader
- posture comportementale dans le temps
- friction consciente ou non
- prudence, excès, défense, retenue
- alignement, piège, inflexion, dégradation

**Le point critique :** les noms sont déjà alignés avec la doctrine.

Ils ne parlent pas de BUY, SELL, PUMP, BREAKOUT ou SIGNAL.
Ils parlent de **comportements**, de **postures** et de **lectures**.

`piege.mp4` n'est pas une alerte. C'est un état.
`retenue.mp4` n'est pas une recommandation. C'est une lecture comportementale.
`assechement.mp4` ne décrit pas le marché. Il décrit le trader face au marché.

Cette famille est **la plus proche du cœur de Caméléon Engine**.
Elle doit être traitée comme actif principal, pas comme animation décorative.

Risque identifié : si ces vidéos sont utilisées comme habillage graphique sans ancrage sémantique précis dans l'interface, elles perdent leur valeur doctrinale. Elles ne sont pas des transitions — elles sont des états nommés.

---

### B. Vidéos structurelles

Ces vidéos sont moins comportementales et plus systémiques.

Usages potentiels :
- écran d'accueil / hero visual
- transitions entre états moteur
- moments de silence dans l'interface
- fond neutre pendant les phases d'observation

Analyse par fichier :

| Fichier | Lecture doctrinale | Risque |
|---|---|---|
| `coherence.mp4` | forte — "cohérence" est un mot de la doctrine | à confirmer visuellement |
| `introspection.mp4` | forte — lecture intérieure, pas signal extérieur | à confirmer visuellement |
| `ralentissement.mp4` | forte — inversion d'intensité, signature Caméléon | candidat OFFICIEL |
| `respiration_systeme.mp4` | forte — "respiration" > "résolution" doctrinalement | à confirmer visuellement |
| `mystere.mp4` | modérée — risque dérive contemplative ou esthétisante | à confirmer visuellement |
| `mystere_silencieuse.mp4` | modérée — variante de `mystere.mp4` — doublon potentiel | à trancher |
| `transformation.mp4` | modérée — risque de connotation spectacle | à confirmer visuellement |

Distinction à maintenir : **structurel ne signifie pas décoratif**. Une vidéo structurelle qui ne renforce pas une lecture cognitive est de l'esthétisme — ce que la doctrine interdit.

---

### C. Séries d'images comportementales

Quatre séries de 5 niveaux (20 images au total) couvrant les pathologies comportementales majeures : discipline, FOMO, overtrading, revenge.

**Potentiel fort.** Ces séries correspondent directement aux patterns comportementaux identifiés dans le moteur comportemental (`src/js/behavior/`). La progression par niveaux (lvl1 → lvl5) est cohérente avec la lecture graduelle de Caméléon.

**Risque immédiat :** le nommage en anglais (`fomo_lvl1_curiosity.png`) crée une dissonance avec le cockpit en français. Si ces images entrent dans l'interface, la langue doit être alignée.

**Point à trancher avant tout usage :** est-ce que ces images sont destinées à l'interface utilisateur final, ou à la documentation interne (guides, onboarding, communication) ? Le contexte d'usage détermine les critères d'évaluation.

Statut provisoire : **EXPÉRIMENTAL** — à classer définitivement après visionnage et décision d'usage.

---

### D. Logos

**`logo_haut.jpeg`**

Hypothèse : candidat le plus proche de l'ADN Caméléon Engine.

Caractéristiques attendues pour un logo conforme à la doctrine :
- relief et profondeur — pas de flat design
- présence premium — sensation institutionnelle
- signature cognitive — le caméléon comme emblème, pas comme mascotte
- lecture à distance — lisible sans être spectaculaire

Si `logo_haut.jpeg` porte ces qualités, il est le candidat CANONIQUE.

**`logo_bas.jpeg`**

Hypothèse : plus simple, potentiellement plus générique.

Usage possible : favicon, version réduite, contexte mobile, marque secondaire.

Risque : un logo trop minimaliste dans ce contexte de marché devient une icône startup indifférenciée. Caméléon Engine n'est pas une startup. C'est un cockpit cognitif.

**`cameleon-logo.png`**

Présent dans `assets/images/` mais non documenté dans les briefs antérieurs.
À identifier : est-ce une version de travail, une version antérieure, ou un actif actif ?

**Position générale :**
Le logo officiel futur est probablement une évolution simplifiée de `logo_haut.jpeg`, pas une icône plate trop minimaliste. La profondeur prime sur la simplicité dans ce contexte produit.

Cette classification reste une hypothèse. Elle doit être confirmée par lecture visuelle directe.

---

### E. Vidéos supprimées

Ces fichiers ont été archivés intentionnellement. Leur présence dans `video_supprimee/` est une décision.

Observations :
- `prudence.mp4` existe en doublon (supprimée + comportementale active) — la version active est probablement une version supérieure
- `execution.mp4` (supprimée) correspond au nom que l'on attendait pour `execute.mp4` (active) — l'écart de nommage a peut-être une raison
- `Logo_rond_cameleon_noir_doree.MP4` et `cameleon_engine_logo_fond_noir_simple.mp4` et `camleon_doré_avec_chaine.mp4` — explorations logo antérieures. Conservées pour traçabilité, non réactivables sans décision explicite.
- `.mp4` — fichier sans nom. À identifier avant toute décision de nettoyage.

Règle : **ne pas réactiver un asset supprimé sans documenter la raison dans ce fichier**.

---

## 4. Critères canoniques

Un asset est compatible Caméléon Engine s'il répond à ces critères :

**Palette**
- noir profond dominant
- or sombre ou or métallique contrôlé
- espace négatif présent et actif

**Composition**
- un seul point focal
- géométrie discrète
- caméléon ou signe cognitif présent mais non spectaculaire
- absence de bruit visuel

**Mouvement** (pour les vidéos)
- mouvement lent
- intensité contenue
- pas d'accélération non motivée

**Sensation**
- premium institutionnel
- cockpit cognitif — pas interface trading
- lecture avant spectacle
- présence calme — pas agitation

**Sémantique** (pour les noms et textes associés)
- vocabulaire de comportement, posture, lecture
- pas de vocabulaire de signal, alerte, performance

---

## 5. Critères de rejet immédiat

Un asset est incompatible si l'une de ces conditions est remplie :

- cyberpunk néon
- rouge / vert trading agressif (feux de signalisation)
- dashboards saturés visibles dans la composition
- HUD surchargé
- bougies trading visibles
- effets de magie trop forts ou non motivés
- mystique excessive — hermétisme esthétique sans ancrage cognitif
- fantasy techno
- glow incontrôlé
- poster crypto Twitter
- IA générative trop visible — la texture artificielle qui signale sa propre production
- texte trop gros en surimposition
- symboles décoratifs sans fonction narrative

**Principe :** un visuel peut être beau et malgré tout rejeté.

La question n'est pas "est-ce que c'est beau ?"
La question est "est-ce que ça appartient à Caméléon Engine ?"
Ces deux questions ont des réponses indépendantes.

---

## 6. Système de classification

| Niveau | Définition |
|---|---|
| **OFFICIEL** | Asset utilisable directement dans le cockpit ou dans une communication produit. Décision prise, validée, stable. |
| **CANONIQUE** | Asset qui représente profondément la signature visuelle. Référence de production future. Peut ne pas être encore déployé. |
| **EXPÉRIMENTAL** | Asset intéressant, cohérent avec la direction, mais pas encore stabilisé. Doit être confirmé avant usage. |
| **ARCHIVÉ** | Exploration historique à conserver pour traçabilité. Ne plus utiliser comme référence active ni comme source d'inspiration directe. |
| **ABANDONNÉ** | Asset incompatible avec l'ADN produit. À ne plus référencer. |

---

## 7. Classification provisoire

*Provisoire = à confirmer par visionnage réel. Aucun asset n'est classé définitivement sans lecture visuelle.*

### Vidéos comportementales

| Fichier | Classification provisoire | Motif |
|---|---|---|
| `alignement.mp4` | OFFICIEL / CANONIQUE à confirmer | Nom central dans la doctrine |
| `retenue.mp4` | OFFICIEL / CANONIQUE à confirmer | Posture fondatrice |
| `prudence.mp4` | OFFICIEL / CANONIQUE à confirmer | Posture fondatrice |
| `observation.mp4` | OFFICIEL / CANONIQUE à confirmer | Lecture, pas signal |
| `defense.mp4` | CANONIQUE à confirmer | Protection sans blocage |
| `inflexion.mp4` | CANONIQUE à confirmer | Changement d'état lisible |
| `assechement.mp4` | CANONIQUE à confirmer | État rare, fort intérêt sémantique |
| `piege.mp4` | CANONIQUE à confirmer | Nom juste, risque visuel à vérifier |
| `execute.mp4` | EXPÉRIMENTAL | Nommage ambigu (verbe vs concept) — à clarifier |
| `exces.mp4` | EXPÉRIMENTAL | Risque de lecture agressive à confirmer |
| `degradation.mp4` | EXPÉRIMENTAL | Risque de lecture trop négative ou spectaculaire |

### Vidéos structurelles

| Fichier | Classification provisoire | Motif |
|---|---|---|
| `ralentissement.mp4` | CANONIQUE à confirmer | Inversion d'intensité — signature Caméléon |
| `coherence.mp4` | CANONIQUE à confirmer | Mot central de la doctrine |
| `introspection.mp4` | CANONIQUE à confirmer | Lecture intérieure — pas signal |
| `respiration_systeme.mp4` | CANONIQUE à confirmer | "Respiration" juste doctrinalement |
| `mystere.mp4` | EXPÉRIMENTAL | Risque contemplatif non ancré |
| `mystere_silencieuse.mp4` | EXPÉRIMENTAL | Doublon potentiel — à comparer avec `mystere.mp4` |
| `transformation.mp4` | EXPÉRIMENTAL | Risque de connotation spectacle |

### Séries d'images comportementales

| Série | Classification provisoire | Motif |
|---|---|---|
| `discipline/` (5 images) | EXPÉRIMENTAL | Fort potentiel, nommage anglais à résoudre |
| `fomo/` (5 images) | EXPÉRIMENTAL | Fort potentiel, nommage anglais à résoudre |
| `overtrading/` (5 images) | EXPÉRIMENTAL | Fort potentiel, nommage anglais à résoudre |
| `revenge/` (5 images) | EXPÉRIMENTAL | Fort potentiel, nommage anglais à résoudre |

### Logos

| Fichier | Classification provisoire | Motif |
|---|---|---|
| `logo_haut.jpeg` | CANONIQUE à confirmer | Hypothèse : relief, profondeur, premium |
| `logo_bas.jpeg` | EXPÉRIMENTAL | Potentiel favicon / version réduite |
| `cameleon-logo.png` | Non classé | Statut inconnu — à identifier |

### Vidéos supprimées

| Fichier | Classification provisoire | Motif |
|---|---|---|
| `prudence.mp4` | ARCHIVÉ | Doublon de la version active |
| `execution.mp4` | ARCHIVÉ | Variante de nommage — version active choisie |
| `Logo_rond_cameleon_noir_doree.MP4` | ARCHIVÉ | Exploration logo antérieure |
| `cameleon_engine_logo_fond_noir_simple.mp4` | ARCHIVÉ | Exploration logo antérieure |
| `camleon_doré_avec_chaine.mp4` | ARCHIVÉ | Exploration — "chaîne" incompatible avec ADN |
| `attente.mp4` | ARCHIVÉ | Supprimé — motif à documenter si récupération envisagée |
| `stop.mp4` | ABANDONNÉ | "Stop" est vocabulaire interdit par la doctrine |
| `.mp4` | Non classé | Fichier sans nom — à identifier |

---

## 8. Règles de production futures

**Avant toute nouvelle génération d'asset :**

1. Comparer aux critères canoniques de la section 4 avant de valider la demande
2. Ne pas multiplier les variantes logo tant que `logo_haut.jpeg` n'est pas confirmé ou infirmé
3. Chaque nouvel asset doit renforcer la cohérence — pas seulement apporter de la nouveauté
4. Les vidéos doivent rester lentes, silencieuses, lisibles — intensité contenue, pas spectacle
5. Les logos doivent rester premium institutionnel — pas icône startup générique
6. Toute nouvelle demande à Grok ou autre outil de génération doit citer les critères de cet audit comme contrainte de prompt

**La cohérence visuelle est maintenant plus importante que la nouveauté.**

Un dixième visuel cohérent avec les neuf premiers vaut plus qu'un visuel spectaculaire qui rompt la série.

**Sur les séries d'images comportementales :**
- Le nommage anglais (`fomo_lvl1_curiosity`) doit être résolu avant tout usage interface
- La progression par niveaux doit être alignée avec les niveaux du moteur comportemental
- Si les images entrent dans l'interface, la grammaire visuelle doit être unifiée avec les vidéos

**Sur les vidéos supprimées :**
- Ne pas réactiver sans documenter la raison dans ce fichier
- `stop.mp4` ne doit pas être réactivé : le vocabulaire est incompatible

---

## 9. Décision stratégique

La prochaine étape visuelle n'est pas de produire massivement.

La prochaine étape est, dans cet ordre :

1. **Regarder réellement chaque vidéo** — pas en diagonale, en lecture complète
2. **Classer chaque asset** — confirmer ou corriger la classification provisoire de la section 7
3. **Décider des vidéos officielles par famille** — 3 à 5 vidéos comportementales OFFICIELLES, 2 à 3 vidéos structurelles OFFICIELLES
4. **Choisir une direction logo** — confirmer `logo_haut.jpeg` comme base canonique ou ouvrir une nouvelle direction
5. **Résoudre le nommage des séries d'images** — décider de la langue et de l'alignement avec le moteur
6. **Stabiliser la grammaire motion** — durée, cadence, palette, intensité, point focal
7. **Seulement ensuite** — identifier les manquants et produire les assets complémentaires

Ce séquençage protège contre la dispersion.
Produire avant de classer, c'est aggraver le problème que cet audit essaie de résoudre.

---

## 10. Anomalies et points ouverts

Points qui nécessitent une décision avant la prochaine session de travail visuel :

| Anomalie | Action requise |
|---|---|
| `execute.mp4` vs `execution.mp4` (supprimée) | Confirmer le nom canonique et documenter le choix |
| `mystere.mp4` vs `mystere_silencieuse.mp4` | Comparer visuellement, conserver un seul ou justifier les deux |
| `.mp4` sans nom dans `video_supprimee/` | Identifier ou supprimer |
| `cameleon-logo.png` statut inconnu | Identifier l'origine et classer |
| Séries images en anglais | Décider de la langue avant tout usage interface |
| `camleon_doré_avec_chaine.mp4` | "Chaîne" comme symbole — incompatible avec doctrine autonomie utilisateur |

---

*Créé le 2026-05-19. Audit ponctuel — non prescriptif sur le code applicatif.*
*Classification provisoire à confirmer par lecture visuelle directe de chaque asset.*
*Références doctrinales : `docs/manifesto-cameleon-engine.md` · `docs/product/doctrine-cameleon-profondeur-viabilite.md`*
