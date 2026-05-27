# UX Spec — How Caméléon Reads Screen V1

**Statut :** spécification UX — pré-implémentation  
**Date :** 2026-05-27  
**Référence doctrine :** `docs/architecture/how-cameleon-reads-v1.md`  
**Portée :** écran pédagogique structurel · aucun code · aucune intégration

---

## 1. Objectif de l'écran

Expliquer au visiteur ou à l'utilisateur comment Caméléon Engine lit les données — sans tutoriel marketing, sans storytelling, sans narration mystique.

L'écran doit répondre à une question simple que tout utilisateur nouveau se pose :

> "Qu'est-ce que ce moteur lit exactement, et qu'est-ce qu'il ne lit pas ?"

L'écran est informatif et doctrinal. Il n'est pas promotionnel.

**Ce que l'écran produit :**
- compréhension de la hiérarchie des couches,
- compréhension de la distinction CSV/PDF,
- compréhension de la place secondaire du Constellium,
- compréhension des limites volontaires du moteur.

**Ce que l'écran ne produit pas :**
- désir d'achat,
- fascination pour le système,
- sentiment d'appartenance,
- projection identitaire.

---

## 2. Principes UX

- **Sobriété souveraine** — aucun élément visuel ne doit dépasser en poids la couche 1 (données observables).
- **Hiérarchie descendante** — plus on descend dans la page, plus les couches sont légères et secondaires.
- **Froid par défaut** — pas de chaleur émotionnelle, pas de ton d'encouragement.
- **Lisibilité structurelle** — chaque bloc se lit seul, dans n'importe quel ordre.
- **Densité contrôlée** — espacement généreux, pas de surcharge informationnelle.
- **Respiration** — chaque bloc est séparé par un espace clair. Le silence visuel est fonctionnel.

---

## 3. Structure de l'écran

### 3.1 — Ouverture sobre

**Position :** haut de page, pleine largeur.  
**Hauteur :** compacte. Pas de hero plein écran.

**Copywriting proposé :**

```
Caméléon Engine lit des structures observables.

Il ne lit ni l'identité, ni les émotions, ni la personnalité.
```

**Spécifications :**
- deux lignes maximum,
- typographie grande mais sobre,
- fond sombre, texte clair,
- aucune illustration à ce stade,
- aucun sous-titre promotionnel,
- aucun bouton CTA.

---

### 3.2 — Bloc des 4 couches

**Position :** deuxième section, pleine largeur.  
**Format :** hiérarchie verticale — empilement du bas vers le haut, ou liste descendante avec poids visuel décroissant.

**Principe visuel fondamental :**  
La couche 1 est la plus lourde, la plus visible, la plus solide. Chaque couche supérieure est visuellement plus légère. La couche 4 est la plus discrète.

---

#### Couche 1 — Données observables

**Poids visuel :** maximum. Fond dense, contour fort, typographie pleine.

**Label :** `Couche 1 — Données observables`

**Copywriting :**
```
Fréquence · Sizing · Délais · Modifications d'ordres
Annulations · Temps en position · Concentration · Dispersion
Structure du carnet · Régimes
```

**Description :**
```
Déterministe. Traçable. Mathématique.
Cette couche peut exister seule.
Aucune couche supérieure ne la remplace.
```

---

#### Couche 2 — Structures comportementales

**Poids visuel :** fort, mais inférieur à la couche 1. Légèrement moins de contraste.

**Label :** `Couche 2 — Structures comportementales`

**Copywriting :**
```
Accélération · Compression · Oscillation · Dispersion
Stabilisation · Respiration · Escalade · Rigidité
```

**Description :**
```
Patterns dérivés des données.
Structures observables — pas d'états psychologiques.
```

**Note éditoriale :** ne jamais écrire "impulsivité", "panique", "revanche". Écrire "accélération post-perte", "fréquence élevée", "escalade de sizing".

---

#### Couche 3 — Représentation secondaire

**Poids visuel :** moyen-léger. Traitement visuel plus aéré, moins de densité.

**Label :** `Couche 3 — Représentation secondaire`

**Copywriting :**
```
Constellium · Météo comportementale · Synthèse visuelle temporaire
```

**Description :**
```
Lecture rapide de la dynamique actuelle.
Secondaire. Temporaire. Ne remplace pas les données.
```

---

#### Couche 4 — Auto-limitation

**Poids visuel :** le plus léger. Traitement discret, typographie réduite, contraste minimal.

**Label :** `Couche 4 — Auto-limitation`

**Copywriting :**
```
Refus de certaines lectures · Expiration des états
Absence de mémoire relationnelle · Absence de compagnon IA
```

**Description :**
```
Le moteur contient des mécanismes de limitation volontaire de sa propre influence.
Ces mécanismes protègent la fiabilité du système et l'autonomie de l'utilisateur.
```

---

### 3.3 — Bloc "Data Always Wins"

**Position :** section centrale, après les 4 couches.  
**Format :** bloc isolé, pleine largeur, traitement typographique distinct.  
**Ton :** froid, assertif, sans dramatisation.

**Copywriting proposé (FR) :**
```
Si une représentation contredit les données observables,
les données observables ont toujours priorité.
```

**Copywriting proposé (EN) :**
```
If representation conflicts with observable data,
observable data always wins.
```

**Spécifications :**
- centré horizontalement,
- pas de fond coloré agressif,
- pas d'icône ou d'illustration,
- pas d'effet visuel dramatique (pas de gradient, pas de glow),
- typographie légèrement plus grande que le corps de texte standard,
- espace vide généreux au-dessus et en dessous.

---

### 3.4 — Bloc CSV / Excel vs PDF

**Position :** après le bloc "Data Always Wins".  
**Format :** deux cartes côte à côte (layout 2 colonnes sur desktop, empilées sur mobile).

---

#### Carte gauche — CSV / Excel

**Titre :**
```
Mémoire du comportement exécuté
```

**Contenu :**
```
Actions réalisées · Historiques · Exécutions
Séquences réelles · Résultats observables
```

**Description courte :**
```
Ce qui s'est passé.
Le moteur y lit des séquences réelles, des régimes, des transitions.
```

**Direction visuelle :**  
Chronologie horizontale, lignes denses, séquences, activité. Représentation de flux temporel.

---

#### Carte droite — PDF

**Titre :**
```
Architecture opératoire avant exécution
```

**Contenu :**
```
Structure carnet · Ordres en attente · Annulations
Repositionnements · Respiration · Stabilité opératoire
```

**Description courte :**
```
Ce qui était préparé.
Le moteur y lit la structure visible des décisions avant exécution — pas l'intention psychologique.
```

**Direction visuelle :**  
Carte spatiale, zones, distances, niveaux, structure statique. Représentation de disposition.

---

**Note éditoriale commune aux deux cartes :**  
Aucune des deux sources ne permet au moteur de lire des émotions ou des intentions psychologiques. Seulement des structures visibles dans les données.

---

### 3.5 — Bloc Constellium

**Position :** après le bloc CSV/PDF.  
**Poids visuel :** délibérément inférieur aux blocs précédents. Le Constellium est secondaire — l'écran doit le refléter.

**Titre de section :**
```
Constellium — Représentation secondaire
```

**Description :**
```
Le Constellium synthétise les dynamiques détectées sous une forme lisible d'un coup d'œil.
Il ne représente pas une identité. Il représente une dynamique temporaire.
```

**Les cinq éléments — format compact :**

| Élément | Dynamique | Mots structurels |
|---|---|---|
| FEU — Expansion | Régime d'intensification | Accélération · Pression · Convergence |
| TERRE — Stabilité | Régime d'ancrage | Structure · Inertie · Équilibre |
| EAU — Oscillation | Régime de modulation | Flux · Transition · Adaptation |
| AIR — Préparation | Régime d'anticipation | Espace · Distance · Suspension |
| ÉTHER — Synthèse | Régime de cohérence globale | Équilibre · Légèreté · Convergence faible |

**Spécifications :**
- pas de grande illustration par élément,
- pas d'icône dominante,
- pas d'effet cosmique ou lumineux,
- traitement compact — liste ou tableau,
- les éléments sont des états temporaires, pas des profils.

---

### 3.6 — Bloc "Ce que le moteur refuse"

**Position :** avant-dernière section.  
**Format :** deux colonnes ou liste contrastée.  
**Ton :** froid, factuel, non moralisateur.

**Titre :**
```
Ce que le moteur ne déduit pas
```

**Colonne gauche — Refusé :**
```
Émotions
Identité
Intentions profondes
Personnalité
Profil psychologique
```

**Colonne droite — Produit :**
```
Dynamiques
Structures
Séquences
Écarts
Régimes
```

**Note de bas de bloc :**
```
Ces refus ne sont pas des manques.
Ce sont des choix architecturaux qui protègent la fiabilité du système
et l'autonomie de l'utilisateur.
```

---

## 4. Hiérarchie visuelle globale

Du plus lourd au plus léger, de haut en bas :

```
1. Ouverture sobre               — ancrage
2. Couche 1 (données)            — souveraineté
3. Couche 2 (structures)         — analyse
4. Bloc "Data Always Wins"       — règle centrale
5. Bloc CSV vs PDF               — distinction des sources
6. Couche 3 (Constellium)        — représentation secondaire
7. Couche 4 (auto-limitation)    — garde-fou
8. Bloc "Ce que le moteur refuse" — limites
```

La densité visuelle décroît au fil de la page. La couche 1 est la plus chargée. Le bloc final est le plus aéré.

---

## 5. Copywriting — principes

- Phrases courtes. Maximum 2 lignes par paragraphe.
- Pas de point d'exclamation.
- Pas de "découvrez", "explorez", "révélez".
- Pas de "votre potentiel", "votre profil", "votre personnalité".
- Verbes descriptifs uniquement : lit · détecte · produit · refuse · expire · décrit.
- Les données sont toujours le sujet de la phrase, jamais le moteur.

**Exemples acceptables :**
```
"Le moteur lit des structures dans les données."
"Cette couche peut exister seule."
"Les données ont toujours priorité."
"Ce refus protège l'autonomie de l'utilisateur."
```

**Exemples refusés :**
```
"Caméléon vous comprend."
"Découvrez votre dynamique comportementale."
"Le moteur révèle qui vous êtes vraiment."
"Votre profil Constellium."
```

---

## 6. Interdictions

**Visuelles :**
- mysticisme, fantasy, ésotérisme,
- avatars, visages, créatures,
- lore ou univers narratif,
- néons cyberpunk saturés,
- glow cosmique, auras,
- grandes illustrations dominantes,
- gamification (barres de progression, badges, scores visibles),
- rouge/vert trading dominant,
- surcharge HUD.

**Éditoriales :**
- storytelling héroïque,
- promesses de performance,
- comparaisons concurrentielles,
- langage de coaching émotionnel,
- personnification du moteur,
- onboarding SaaS agressif,
- appels à l'action répétés.

**Architecturales :**
- le Constellium ne doit jamais être visuellement plus lourd que la couche 1,
- aucune section ne doit produire un sentiment d'appartenance identitaire,
- aucun bloc ne doit suggérer que le moteur "vous connaît".

---

## 7. Critères de validation

Avant implémentation, chaque section doit passer ce test :

1. **Test de souveraineté** — la couche 1 est-elle visuellement la plus lourde de l'écran ?
2. **Test de froideur** — peut-on lire l'écran sans ressentir de fascination ou d'appartenance ?
3. **Test de traçabilité** — chaque affirmation est-elle reliée à une donnée observable ?
4. **Test de secondarité** — le Constellium est-il visuellement moins présent que les blocs données ?
5. **Test du refus** — le bloc des limites est-il lisible sans sonner moralisateur ?
6. **Test de lecture rapide** — un utilisateur non familier comprend-il la hiérarchie des couches en moins de 30 secondes ?

---

## 8. Risques de dérive

Surveiller particulièrement lors de l'implémentation :

- **Dérive esthétique** — le Constellium devient visuellement dominant, l'écran ressemble à un univers mystique.
- **Dérive narrative** — le copywriting glisse vers du storytelling ou de la promesse implicite.
- **Dérive identitaire** — les éléments (FEU, TERRE, etc.) sont présentés comme des profils plutôt que comme des états temporaires.
- **Dérive relationnelle** — le ton devient chaleureux, le moteur est personnifié.
- **Dérive de densité** — trop d'informations par bloc, l'écran devient illisible.
- **Dérive de légèreté** — la couche 1 perd son poids visuel, toutes les couches semblent équivalentes.
