# Reconstruction cognitive V1 — Architecture UX

Caméléon Engine · Direction UX  
Date : 2026-05-28  
Statut : base officielle de reconstruction — v1

---

## 1. Hiérarchie perceptive complète

### Zone 1 — État principal

**Rôle cognitif :** focale primaire absolue. Identification immédiate de l'état du système. C'est la première information que le cerveau doit recevoir et ancrer.

**Niveau d'intensité :** maximum. Rien d'autre sur la page n'atteint ce niveau.

**Rôle dans le trajet du regard :** point d'entrée forcé. L'œil ne choisit pas — il tombe dessus.

**Rôle narratif :** "Le système est en état X. Je suis dans un cockpit actif."

**Relation avec les autres zones :** elle les domine. Toutes les zones suivantes existent en réponse à elle — elles justifient, détaillent, ou soutiennent l'état annoncé.

**Diagnostic V1 :** cette zone fonctionne. Le mot d'état à 38px / font-weight 200 est correct. L'etat-label en 10px / --text-3 crée un bon ancrage secondaire. La description en 13px / --text-2 est au bon niveau. Ne pas toucher.

**Seul ajustement possible :** vérifier que le margin-bottom de 72px est suffisant pour séparer cette focale de la zone analytique qui suit. Si la page respire mal après le prototype final, c'est ici qu'on ajuste en premier.

---

### Zone 2 — Structure primaire

**Rôle cognitif :** ancrage contextuel macro. Le cerveau reçoit le cadre de lecture avant de recevoir les données. Formation, phase, durée, résolution, symétrie, charge.

**Niveau d'intensité :** haute. C'est la première zone analytique — elle doit s'imposer après la focale principale comme l'entrée dans la lecture réelle.

**Rôle dans le trajet du regard :** premier arrêt analytique. L'œil ralentit ici pour lire, pas scanner.

**Rôle narratif :** "Voici le contexte dans lequel le système opère." Cette zone répond à la question : "De quoi s'agit-il ?"

**Relation avec les autres zones :** elle cadre. Lectures par niveau et Cohérence inter-niveaux n'ont de sens qu'après elle.

**Diagnostic V1 :** traitement visuel identique aux autres sections. Son rôle d'ancrage n'est pas traduit visuellement. Elle devrait signaler "début de lecture analytique" — ce qu'elle ne fait pas.

**Levier :** conserver le traitement standard. La différenciation vient de ce qui vient avant (respiration après état) et de ce qui vient après (densité de Lectures par niveau). Elle tire sa position de son contexte, pas de sa propre modification.

---

### Zone 3 — Lectures par niveau

**Rôle cognitif :** accumulation dense. Le cerveau construit son modèle — H4, H1, M15. Trois sous-blocs, neuf lignes. C'est la section de travail cognitif le plus intense.

**Niveau d'intensité :** moyenne-haute, mais dense. L'intensité vient de la densité informationnelle, pas du poids visuel.

**Rôle dans le trajet du regard :** zone d'accumulation. L'œil travaille ici — il lit, compare, construit. Pas de scan. Lecture active.

**Rôle narratif :** "Voici les preuves par niveau. Construis ton modèle." Le cerveau accumule une tension — trois niveaux parfois cohérents, parfois divergents. Cette tension doit être ressentie.

**Relation avec les autres zones :** elle prépare "Cohérence inter-niveaux". Sans accumulation ici, la synthèse là-bas n'a pas de poids. La relation est causale.

**Diagnostic V1 :** les sous-titres H4/H1/M15 créent une structure interne qui aide. C'est le seul endroit dans V1 où la structure visuelle se différencie naturellement. Les sous-blocs séparent les niveaux correctement. Le problème vient de l'entrée dans cette section (pas marquée) et de la sortie (pas marquée).

**Levier :** ne pas toucher l'intérieur. Travailler sur l'espacement avant (entrée) et l'espacement après (sortie vers Cohérence).

---

### Zone 4 — Cohérence inter-niveaux

**Rôle cognitif :** moment pivot. Résolution de la tension accumulée dans Lectures par niveau. Le cerveau reçoit la synthèse relationnelle — comment les niveaux se connectent, se confirment ou divergent.

**Niveau d'intensité :** haute, mais différente de la haute de Structure primaire. C'est une intensité de résolution, pas d'ancrage.

**Rôle dans le trajet du regard :** point de résolution. L'œil ralentit à nouveau — mais différemment. Dans Structure primaire, il lit pour cadrer. Ici, il lit pour résoudre. La qualité de l'attention est différente.

**Rôle narratif :** "Voici ce que les preuves signifient ensemble." C'est le point de jonction cognitif de toute la page.

**Relation avec les autres zones :** elle clôt Lectures par niveau et introduit Signaux actifs. Sans elle, la narration s'interrompt. V2-E3 l'a prouvé : son absence crée une tension non résolue.

**Diagnostic V1 :** traitement visuel identique à toutes les autres sections. Le moment pivot n'est pas marqué. Le cerveau ne reçoit aucun signal indiquant qu'il entre dans une zone de résolution plutôt qu'une zone d'accumulation supplémentaire. C'est le déficit structural le plus significatif.

**Levier principal :** augmenter l'espacement avant cette section. Un écart visuel plus grand entre la fin de Lectures par niveau et le début de Cohérence inter-niveaux signale le pivot sans le nommer. L'œil respire avant de résoudre.

---

### Zone 5 — Signaux actifs

**Rôle cognitif :** zone vivante. Lecture en temps réel. Les signaux ne sont pas des données structurées — ce sont des observations actives. Le cerveau change de mode de lecture ici : il ne construit plus un modèle, il lit ce que le système observe.

**Niveau d'intensité :** signal distinct. Pas plus élevé que les zones analytiques en poids — mais chromatiquement différent. La couleur `--signal` est le seul break chromatique de toute la page.

**Rôle dans le trajet du regard :** zone de décrochage voulu. Après la densité analytique et la résolution de Cohérence, l'œil entre dans une zone de nature différente. Le changement de couleur le signale naturellement. C'est le moment où le cerveau passe de "construction de modèle" à "lecture de flux".

**Rôle narratif :** "Voici ce que le système observe maintenant." Ces signaux sont vivants — pas des données historiques, des observations en cours. Cette nature doit être perçue.

**Relation avec les autres zones :** elle reçoit la tension résolue par Cohérence et la traduit en observations concrètes. Elle est la conséquence de tout ce qui précède.

**Diagnostic V1 :** la couleur `--signal` différencie déjà cette zone — c'est un atout existant. Mais la densité visuelle des items (5px padding vertical) est insuffisante. Les signaux se lisent trop vite, comme s'ils n'étaient que des lignes supplémentaires. Ils méritent plus de respiration individuelle.

**Levier :** augmenter le padding vertical de chaque `.signal-item`. Augmenter légèrement l'espacement avant la section. La zone vivante doit respirer différemment des zones analytiques.

---

### Zone 6 — Système

**Rôle cognitif :** métadonnée permanente. Fond opérationnel. Ce que le système est, pas ce qu'il dit. Cette zone ne demande pas de lecture active — elle confirme le contexte de fond.

**Niveau d'intensité :** délibérément basse. Pas par accident, pas par épuisement de contraste — mais par design intentionnel. La basse intensité de cette zone est une information : "Ce qui est ici n'est pas une zone de décision."

**Rôle dans le trajet du regard :** décrochage volontaire. L'œil arrive ici après avoir résolu tout ce qu'il avait à résoudre. Il lit en diagonale — Moteur, Mode, Prochain cycle — et sort. C'est la sortie propre de la page.

**Rôle narratif :** "Le système est actif. Son mode est X." Ces trois lignes confirment le contexte opérationnel global. Elles ne demandent pas d'interprétation.

**Relation avec les autres zones :** elle clôt. Elle répond implicitement à la focale principale — "je suis en état Analyse" est justifié par "le moteur est actif, le mode est analytique".

**Diagnostic V1 :** quasi-invisible par épuisement de contraste. Les valeurs en `--text-2` et les labels en `--text-3` à 10px la font disparaître dans la page. Elle devrait disparaître — mais intentionnellement. La différence entre "invisible par accident" et "récédé par design" est l'espacement qui la précède.

**Levier :** augmenter significativement l'espacement avant cette section — pas pour la mettre en valeur, mais pour la séparer clairement des zones de lecture active. Ce grand espace dit : "Ce qui suit est de nature différente."

---

## 2. Architecture du regard

```
┌─────────────────────────────────────────────────┐
│  BANDE SYSTÈME                                  │  ← identification cockpit immédiate (0.5s)
│  Caméléon Engine          SESSION · 28.05.26    │
└─────────────────────────────────────────────────┘

  ÉTAT EN COURS                                     ← label d'ancrage (micro-lecture)
  ANALYSE                                           ← FOCALE PRIMAIRE — arrêt 2-3s
  Structure primaire en cours d'évaluation...       ← contexte (lecture rapide)

  [espace respiratoire — 72px]                      ← descente vers l'analytique

──────────────────────────────────────────────────  ← entrée analytique
  STRUCTURE PRIMAIRE                                ← 1er arrêt analytique
  Formation        Compression asymétrique          ← lecture ligne par ligne
  Phase            Contraction — H4 → H1            ← accumulation de cadre
  ...                                               ← ralentissement ici

  [espace standard — 40px]

──────────────────────────────────────────────────
  LECTURES PAR NIVEAU                               ← zone de travail intensif
  H4 → Tendance / Structure / Pression              ← construction du modèle
  H1 → Tendance / Structure / Pression              ← comparaison active
  M15 → Tendance / Structure / Pression             ← tension accumulée ici
                                                    ← cerveau en mode construction

  [espace augmenté — 64px]                          ← PAUSE AVANT PIVOT

──────────────────────────────────────────────────
  COHÉRENCE INTER-NIVEAUX                           ← MOMENT PIVOT — résolution
  H4 → H1    Compressive cohérente                 ← cerveau en mode résolution
  H1 → M15   Divergence légère                     ← tension partielle résolue
  ...                                               ← modèle complété

  [espace augmenté — 56px]                          ← transition vers zone vivante

──────────────────────────────────────────────────
  SIGNAUX ACTIFS                                    ← ZONE VIVANTE — changement de mode
  · Consolidation active depuis 3 sessions...       ← lecture de flux (couleur signal)
  · Volume décroissant sur compression...           ← observation active
  · Momentum H1 en neutralisation...                ← cerveau en mode réception
  · Aucune cassure de structure...
  · Divergence M15 non confirmée...

  [espace large — 72px]                             ← séparation intentionnelle

──────────────────────────────────────────────────
  SYSTÈME                                           ← ZONE DE FOND — décrochage voulu
  Moteur     Actif — lecture multi-niveaux          ← confirmation de contexte
  Mode       Analytique                             ← lecture diagonale
  Prochain cycle   Non défini — analyse en cours    ← sortie propre

┌─────────────────────────────────────────────────┐
│  Laboratoire du Silence · V1    État : Analyse  │  ← fermeture cockpit
└─────────────────────────────────────────────────┘
```

**Trajet complet :**

1. **0–0.5s** — bande haute : identification cockpit / système
2. **0.5–3s** — état-mot "ANALYSE" : ancrage, focale primaire, réponse à "où suis-je"
3. **3–8s** — Structure primaire : lecture analytique, cadrage
4. **8–20s** — Lectures par niveau : travail cognitif intense, accumulation, comparaison H4/H1/M15
5. **20–26s** — pause respiratoire (espace avant Cohérence) — transition ressentie
6. **26–32s** — Cohérence inter-niveaux : résolution, synthèse, modèle fermé
7. **32–40s** — Signaux actifs : changement de registre, couleur signal, observations en cours
8. **40–44s** — Système : scan diagonal, confirmation de fond, sortie
9. **Permanent** — bande basse : confirmation de l'état courant, clôture

---

## 3. Reconstruction du rythme de page

### Le problème actuel : plateau perceptif

```
Intensité
████  État
────────────────────────────────── plateau uniforme
████  Structure primaire
████  Lectures par niveau
████  Cohérence inter-niveaux
████  Signaux actifs
████  Système
```

### La cible : courbe cognitive contrôlée

```
Intensité
█████████  État (max — focale primaire)
     ↓     respiration (72px)
  █████    Structure primaire (haute — ancrage)
     ↓     standard
  ████     Lectures par niveau (dense — travail)
     ↓     espace augmenté (PAUSE — 64px)
  █████    Cohérence inter-niveaux (haute — résolution)
     ↓     espace augmenté (56px)
  ░░░░░    Signaux actifs (distinct — zone vivante / chromatique)
     ↓     espace large (72px — séparation intentionnelle)
  ░░░      Système (basse — fond / décrochage voulu)
```

### Zones qui doivent être denses

- **Lectures par niveau** — neuf lignes, trois sous-blocs. La densité interne est correcte. Ne pas aérer. La densité est le signal que le cerveau travaille ici.
- **Structure primaire** — six lignes. Densité standard, correcte.

### Zones qui doivent respirer

- **Avant Cohérence inter-niveaux** — espace augmenté. La pause signale le pivot.
- **Signal-items** — padding vertical augmenté. Chaque observation doit respirer.
- **Avant Système** — espace large. La séparation est intentionnelle, pas cosmétique.

### Zones qui doivent produire une tension

- **Lectures par niveau** → **Cohérence inter-niveaux** : la tension vient de l'accumulation de données parfois divergentes (H1→M15 = divergence légère), résolue ensuite par la synthèse. La pause avant Cohérence amplifie cette tension.

### Zones qui doivent résoudre

- **Cohérence inter-niveaux** : clôture active du modèle construit dans Lectures par niveau.
- **Signaux actifs** : traduction de la synthèse en observations concrètes.

---

## 4. Modifications CSS structurelles — propositions analytiques

### A — Espacement différentiel des sections

Principe : les sections ne sont pas toutes équidistantes. L'espace entre deux sections exprime la nature de leur relation cognitive.

```css
/* ÉTAT ACTUEL — uniforme */
.section-bloc {
  padding-top: 40px;
  margin-bottom: 48px;
}

/* CIBLE — différentiel par rôle */

/* Section Cohérence inter-niveaux — moment pivot */
/* Augmenter padding-top : signal de pause avant résolution */
.section-coherence {
  padding-top: 64px;  /* vs 40px standard — +24px */
}

/* Section Signaux actifs — entrée zone vivante */
/* Augmenter padding-top : signal de changement de nature */
.section-signaux {
  padding-top: 56px;  /* vs 40px standard — +16px */
}

/* Section Système — récession intentionnelle */
/* Augmenter padding-top : séparation marquée */
.section-systeme {
  padding-top: 72px;  /* vs 40px standard — +32px */
}
```

Implémentation : ajouter des classes spécifiques aux sections concernées dans le HTML, ou utiliser le sélecteur `:nth-child`. La solution la plus propre est une classe par section.

---

### B — Respiration de la zone vivante

Principe : les signaux actifs ne sont pas des lignes clé-valeur. Leur cadence de lecture est différente. Le padding vertical doit le refléter.

```css
/* ÉTAT ACTUEL */
.signal-item {
  padding: 5px 0;
}

/* CIBLE */
.signal-item {
  padding: 9px 0;  /* +4px top/bottom — +80% de respiration */
}
```

L'effet : chaque signal devient un item qui se lit, pas un item qu'on scanne. La zone respire sans s'élargir de façon visible.

---

### C — Récession intentionnelle de la section Système

Principe : la section Système doit être reculée par design, pas par accident.

```css
/* ÉTAT ACTUEL — section-titre Système identique aux autres */
.section-titre {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.20em;
  color: var(--text-3);
}

/* CIBLE — section-titre Système légèrement différencié */
.section-systeme .section-titre {
  font-weight: 400;       /* 600 → 400 : recul de présence */
  letter-spacing: 0.16em; /* légèrement moins étendu */
}
```

L'effet : le titre "Système" a légèrement moins de poids que les autres titres de section. Ce n'est pas perceptible consciemment — mais le cerveau enregistre que cette zone est différente.

---

### D — Différenciation perceptive de Cohérence inter-niveaux

Principe : le moment pivot mérite d'être légèrement distingué dans son titre — signal que la nature de ce qui suit change.

```css
/* OPTION A — couleur */
.section-coherence .section-titre {
  color: var(--text-2);  /* --text-3 → --text-2 : légèrement plus présent */
}

/* OPTION B — letter-spacing */
.section-coherence .section-titre {
  letter-spacing: 0.24em;  /* vs 0.20em standard */
}
```

Option A (couleur) : le titre passe de --text-3 (#555350) à --text-2 (#8c8a85). Différence subtile — perceptible en comparaison directe, pas consciemment identifiable à l'usage. Signale implicitement "cette zone est de nature différente".

Option B (letter-spacing) : plus sobre, moins de risque de déséquilibre.

À tester sur prototype. Ne pas implémenter les deux simultanément.

---

### E — Préservation absolue de la focale principale

Règle stricte : aucun élément ne doit approcher les valeurs de `.etat-mot`.

```css
/* VALEURS INTOUCHABLES */
.etat-mot {
  font-size: 38px;      /* aucun autre élément > 20px */
  font-weight: 200;     /* aucun autre élément à ce poids */
  letter-spacing: 0.14em;
  color: var(--text);   /* seuls éléments à --text : valeurs analytiques + état */
}
```

---

### F — Récapitulatif des valeurs

| Section | padding-top actuel | padding-top cible | Raison |
|---|---|---|---|
| Structure primaire | 40px | 40px | standard — entrée analytique |
| Lectures par niveau | 40px | 40px | standard — accumulation dense |
| Cohérence inter-niveaux | 40px | **64px** | pause avant pivot — +24px |
| Signaux actifs | 40px | **56px** | transition vers zone vivante — +16px |
| Système | 40px | **72px** | récession intentionnelle — +32px |

| Élément | Valeur actuelle | Valeur cible | Raison |
|---|---|---|---|
| signal-item padding | 5px 0 | **9px 0** | respiration zone vivante |
| section-systeme titre font-weight | 600 | **400** | récession intentionnelle |
| section-coherence titre color | --text-3 | **--text-2** | signal pivot (option A) |

---

## 5. Vision cockpit restaurée — réponse aux 3 secondes

### Ce que l'utilisateur perçoit dans les 3 premières secondes

**Seconde 0–1 :** bande haute. "Caméléon Engine" en 10.5px/700/text/uppercase. Identification système immédiate. "SESSION · 28.05.26 · 11:42" en mono/text-3. Timestamp actif. Le cerveau enregistre : système en cours d'exécution, pas un document statique.

**Seconde 1–2 :** "ÉTAT EN COURS" en 10px/600/text-3. "ANALYSE" en 38px/200/text. La taille de ce mot est seule dans son niveau — rien d'autre sur la page ne s'approche de 38px. Le cerveau enregistre : ce mot est ce qui compte. Il ancre l'état.

**Seconde 2–3 :** l'œil descend et perçoit la structure — des sections, une hiérarchie, des zones. Il voit la couleur distincte de Signaux actifs plus bas. Il perçoit les bandes haut et bas. Il enregistre : c'est un environnement structuré, pas un document. Il y a des niveaux, des zones, un système.

### Ce que les modifications restaurent dans cette perception

**Avec l'espacement différentiel :** l'œil qui parcourt rapidement la page avant de lire perçoit des variations de densité. Il y a des zones serrées et des zones respirées. Cela signale une hiérarchie — pas toutes les zones ne sont équivalentes.

**Avec la récession de Système :** l'œil voit une zone clairement en retrait en bas de page. Il enregistre : il y a une zone de fond. Ce n'est pas toute la page qui a le même niveau d'importance.

**Avec la respiration des signaux :** l'œil voit une zone avec une cadence différente et une couleur différente. Il enregistre : cette zone fonctionne différemment. Elle est vivante.

**Avec le pivot de Cohérence :** l'œil perçoit une rupture de rythme après la densité de Lectures. Il ralentit naturellement. Il enregistre : quelque chose change ici.

**Résultat :** en trois secondes, le cerveau a reçu — cockpit actif, état en cours, structure hiérarchique, zone de fond, zone vivante, narration en cours. Pas par une lecture complète. Par la seule architecture de la page.

---

## Ce que cette reconstruction ne fait pas

Elle n'ajoute pas une seule couleur.  
Elle n'ajoute pas un seul composant.  
Elle ne touche pas au contenu.  
Elle ne touche pas à la focale principale.  
Elle ne touche pas à la palette.  
Elle ne casse pas le calme.

Elle différencie ce qui était indifférencié. Elle donne à chaque zone un traitement cohérent avec son rôle cognitif. Elle rend perceptible une narration qui existait déjà dans le contenu mais pas dans la structure visuelle.
