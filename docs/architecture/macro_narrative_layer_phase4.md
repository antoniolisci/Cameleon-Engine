# Couche Macro — Registre Narratif (Phase 4)

**Caméléon Engine · Direction Architecture**
**Date : 2026-06-10**
**Statut : Document décisionnel Phase 4 — registre narratif uniquement**
**Prérequis : Phases 0 à 3 validées**

---

## 1. Mission

Définir le langage officiel de la Couche Macro.

Pas de code. Pas d'UI. Pas de composants.

Une seule question : comment la Couche Macro doit-elle parler pour informer sans prescrire ?

---

## 2. Définition narrative des états

### EXPANSIF

**Ce que l'état signifie**
Le capital se déplace vers les actifs risqués. Le levier systémique est présent. L'appétit pour le risque est structurellement élevé dans l'écosystème au moment où l'opérateur décide.

**Ce que l'état ne signifie pas**
Il ne signifie pas que le marché va monter. Il ne signifie pas que les prises de position sont justifiées. Il ne valide aucune analyse technique. Il ne garantit aucune issue.

**Ce que l'utilisateur risque de mal comprendre**
"EXPANSIF = favorable = je peux y aller." C'est la confusion la plus dangereuse. EXPANSIF décrit un climat, pas une permission. Un accident de voiture peut arriver par beau temps.

**Ancre narrative**
EXPANSIF décrit un environnement ouvert. Pas un environnement sûr.

---

### NEUTRE

**Ce que l'état signifie**
Les signaux disponibles sont insuffisants, contradictoires ou dégradés pour produire une lecture tranchée. Le système dit honnêtement qu'il ne voit pas de direction claire.

**Ce que l'état ne signifie pas**
Il ne signifie pas qu'il ne se passe rien. Il ne signifie pas qu'il faut attendre. Il ne signifie pas que le marché est calme.

**Ce que l'utilisateur risque de mal comprendre**
"NEUTRE = rien à faire = je reste en dehors." Ce n'est pas une instruction. C'est une lecture de lisibilité du contexte systémique. La décision appartient à l'opérateur, pas à l'état NEUTRE.

**Ancre narrative**
NEUTRE est la réponse la plus honnête que le système puisse donner quand les données ne permettent pas de conclure. C'est une information positive, pas un aveu d'échec.

---

### CONTRACTÉ

**Ce que l'état signifie**
Le capital se concentre sur les actifs défensifs. Le levier systémique recule ou est sous pression. L'environnement systémique présente moins d'appétit pour le risque distribué.

**Ce que l'état ne signifie pas**
Il ne signifie pas que le marché va baisser. Il ne signifie pas qu'il faut couper les positions. Il ne signifie pas que l'analyse de l'opérateur est invalide.

**Ce que l'utilisateur risque de mal comprendre**
"CONTRACTÉ = danger = je sors." Ce raccourci transforme un descripteur en instruction. Il inverse la hiérarchie : la Macro prendrait la décision à la place de l'opérateur.

**Ancre narrative**
CONTRACTÉ décrit un environnement sous tension. Pas un verdict.

---

## 3. Ton officiel

### Registre retenu : observation calme, présent simple, falsifiable

La Couche Macro parle comme un météorologue, pas comme un conseiller financier. Elle décrit ce qu'elle voit. Elle ne dit jamais ce que l'opérateur devrait faire.

**Test de validation de chaque formulation**
Avant de valider une phrase, poser deux questions :
1. "Est-ce que cette phrase décrit ce qui se passe, ou dit-elle ce que l'opérateur devrait faire ?" Si la seconde → reformuler.
2. "Cette phrase serait-elle vraie dans n'importe quel contexte ?" Si oui → horoscope → reformuler.

---

### Vocabulaire autorisé

| Registre | Exemples |
|---|---|
| Mouvement du capital | "Le capital se déplace vers...", "Le capital se concentre sur..." |
| Comportement systémique | "Le levier systémique est présent / recule / sous pression" |
| Lecture observationnelle | "Ce contexte est fréquemment associé à...", "Dans ce type d'environnement..." |
| Comportement populationnel | "Les opérateurs ont tendance à...", "Ce régime a historiquement coïncidé avec..." |
| Lisibilité | "L'environnement est lisible / difficile à lire", "Les signaux convergent / divergent" |

---

### Vocabulaire interdit

| Mot / Registre | Raison |
|---|---|
| favorable / hostile | Jugement de valeur → lecture prescriptive |
| opportunité | Appel à l'action déguisé |
| danger / alerte | Réaction émotionnelle → prise de décision sous peur |
| prudence / attention | Directif → l'opérateur doit déduire lui-même |
| risque élevé / faible | Verdict sur la décision → appartient au moteur, pas à la Macro |
| hausse / baisse probable | Prédiction → interdit par doctrine |
| il faut / vous devez | Prescription directe |
| maintenant / immédiatement | Urgence artificielle |
| Signal | Confusion avec les systèmes de signaux que Caméléon n'est pas |

**Cas limite — "expansion" et "contraction"**
Ces mots sont autorisés comme descripteurs de mouvement de capital, jamais comme métaphores de qualité ("phase d'expansion = bonne période"). La distinction est dans la construction de la phrase.

---

## 4. Relation Macro ↔ Moteur

### Les deux systèmes sont indépendants

Le Macro_State et le verdict moteur parlent de deux choses différentes. Ils ne peuvent pas se contredire parce qu'ils ne répondent pas à la même question.

- Le Moteur répond à : "Quelle est ma lecture de la configuration actuelle ?"
- La Macro répond à : "Dans quel environnement systémique cette lecture est-elle produite ?"

### Cas de tension apparente

**Exemple A :** Macro = EXPANSIF · Moteur = DÉFENSE

Message correct :
"Le contexte systémique présente un appétit pour le risque. Votre configuration personnelle indique une posture défensive. Les deux lectures sont indépendantes."

Message interdit :
"Malgré un contexte favorable, votre moteur recommande la prudence." ← "favorable" = interdit + inversion de hiérarchie

**Exemple B :** Macro = CONTRACTÉ · Moteur = ATTAQUE

Message correct :
"Le contexte systémique présente une contraction du capital risqué. Votre configuration personnelle indique une posture offensive. Les deux lectures décrivent des niveaux différents."

Message interdit :
"Attention : votre moteur est offensif dans un contexte difficile." ← "attention" + "difficile" = prescriptif + jugement de valeur

### Règle fondamentale

**La Macro ne commente jamais le verdict du Moteur. Elle décrit uniquement le contexte dans lequel ce verdict est produit.**

---

## 5. Posture utilisateur recherchée

### Ce que la Macro doit produire

**Conscience calme.** L'opérateur sait dans quel environnement il décide. Cette conscience ne l'excite pas, ne le freine pas. Elle l'éclaire.

L'analogie juste : un marin qui connaît les conditions météo avant d'appareiller. Cette information n'annule pas son jugement — elle l'enrichit.

### Ce que la Macro ne doit jamais produire

- Excitation ("EXPANSIF → c'est le moment !")
- Paralysie ("CONTRACTÉ → je ne fais rien")
- Dépendance ("Je ne décide qu'après avoir vérifié la Macro")
- Certitude ("La Macro dit X → le marché va faire X")

### Signal d'alarme

Si un opérateur consulte la Macro avant le Moteur pour "avoir la permission" — la couche narrative a échoué. Elle est devenue prescriptive par le comportement qu'elle induit, même si les mots sont neutres.

---

## 6. Exemples de formulations

### EXPANSIF

**1 ligne**
"Le capital se distribue vers les actifs risqués. L'appétit systémique pour le risque est présent."

**2 lignes**
"Le capital se déplace vers les altcoins. Le levier systémique est présent et orienté à la hausse.
Ce contexte décrit l'environnement dans lequel vous décidez — pas la qualité de votre décision."

**3 lignes**
"Le capital se distribue activement vers les actifs risqués. Le financement des positions longues est présent dans l'écosystème.
Dans ce type de contexte, les opérateurs ont tendance à augmenter leur fréquence d'intervention.
Ce contexte ne valide pas votre analyse — il la situe."

---

### NEUTRE

**1 ligne**
"Les signaux disponibles ne convergent pas vers une lecture tranchée."

**2 lignes**
"Les familles d'information disponibles ne produisent pas de consensus clair.
C'est la réponse la plus honnête dans ce contexte."

**3 lignes**
"Le capital et le levier envoient des signaux contradictoires ou insuffisants.
Aucune direction systémique dominante n'est lisible en ce moment.
Votre décision repose sur votre analyse personnelle, sans contexte macro orienté."

---

### CONTRACTÉ

**1 ligne**
"Le capital se concentre sur les actifs défensifs. Le levier systémique recule."

**2 lignes**
"Le capital se replie vers Bitcoin et les actifs défensifs. La pression du levier diminue dans l'écosystème.
Ce contexte décrit l'environnement systémique — pas la viabilité de votre configuration."

**3 lignes**
"Le capital se concentre sur les actifs de réserve. Le financement systémique est sous pression.
Dans ce type de contexte, les opérateurs ont tendance à réduire leur exposition globale.
Ce contexte contextualise votre lecture — il ne la remplace pas."

---

### Mode dégradé

**Contexte partiel (1 ou 2 familles seulement)**
"Contexte partiel — certaines données sont absentes ou expirées. La lecture est incomplète."

**Transition détectée**
"Signal de transition détecté. L'état précédent est maintenu jusqu'à confirmation."

---

## 7. Risques narratifs

**Effet horoscope**
Formulations si générales qu'elles sont vraies dans n'importe quel contexte. "Le marché présente des mouvements." → toujours vrai.
Protection : test de falsifiabilité. Si la phrase est vraie dans l'état opposé, c'est un horoscope.

**Effet prophétie**
L'état Macro est utilisé pour prédire ce qui va se passer. Toute formulation au futur crée cet effet.
Protection : présent et passé uniquement. Interdiction absolue du futur dans les textes Macro.

**Effet gourou**
Le système se positionne comme ayant une connaissance supérieure. "Ce que le marché nous dit vraiment..." → autorise implicitement.
Protection : le sujet des phrases est toujours "le capital", "le levier", "les opérateurs" — jamais "le marché" comme entité intelligente, jamais "Caméléon" comme oracle.

**Illusion de précision**
La qualité visuelle du texte donne l'impression d'une analyse approfondie là où il y a trois champs saisies manuellement.
Protection : mention systématique de la source et de la fraîcheur dans le Niveau 2. L'opérateur doit pouvoir remonter à "3 valeurs saisies le 10/06".

**Sensation de certitude**
Un texte fluide et structuré produit une impression de fiabilité indépendamment de la qualité des données sous-jacentes.
Protection : le mode dégradé doit être aussi visible que l'état normal. Un état "Contracté — données partielles" n'est pas inférieur visuellement à un état "Contracté".

---

## 8. Visibilité

**Utilisateur standard — Niveau 1**
État + fraîcheur. Pas de texte. L'état se lit en un coup d'œil.
```
Contexte : Contracté  (données du 10/06)
```

**Utilisateur avancé — Niveau 2 (accès volontaire)**
État + texte contextuel court (1–2 lignes de la formulation) + contribution des familles disponibles.
Pas de valeurs numériques brutes. Pas de sources détaillées.

**Utilisateur expert — Niveau 3 (V2)**
Valeurs brutes + sources + fraîcheur détaillée par famille. Hors cockpit principal.

**Règle transversale**
Le texte narratif ne doit jamais être plus visible que le verdict du Moteur. La Macro est contextuelle — le Moteur est central. La hiérarchie visuelle doit refléter la hiérarchie cognitive.

---

## 9. Compatibilité Manifeste

Le Manifeste Caméléon pose :

> "Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre."

La Phase 4 est directement dérivée de cette phrase.

**Présence calme** → Le registre narratif est sobre, descriptif, jamais urgent. L'état s'affiche discrètement — il ne réclame pas l'attention.

**Rend la décision lisible** → La Macro contextualise l'environnement dans lequel la décision est prise. Elle ne réduit pas la complexité — elle l'organise.

**Sans la prendre** → Aucun mot interdit n'est autorisé. Aucune formulation ne dit ce que l'opérateur devrait faire. L'anti-prescription est la traduction directe de "sans la prendre".

**Test de compatibilité sur chaque texte**
La phrase : "Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre" doit rester vraie après lecture du texte narratif macro. Si un opérateur lit le texte et ressent une pression à agir ou à s'abstenir — le texte échoue le test.

---

## 10. V1 / V2 / Rejeté

**V1**
- Définitions narratives des 3 états (EXPANSIF / NEUTRE / CONTRACTÉ)
- Vocabulaire autorisé et interdit figé
- Formulations 1 ligne pour le Niveau 1
- Formulations 2–3 lignes pour le Niveau 2
- Messages mode dégradé (partiel, transition)
- Test anti-prescription sur chaque texte avant déploiement

**V2**
- Textes populationnels personnalisés selon l'historique opérateur ("Dans ce contexte, tu augmentes historiquement...")
- Corpus textuel élargi selon les régimes observés terrain
- Niveau 3 (mode expert avec sourçage détaillé)

**Rejeté**
- Tout mot du vocabulaire interdit
- Formulations au futur
- Textes génériques vrais dans tout contexte (horoscope)
- Mise en avant de la Macro au-dessus du verdict Moteur
- Gamification du niveau de confiance de l'état

---

## 11. Verdict Phase 4

**Comment la Couche Macro doit parler**
En observateur calme. Elle décrit le mouvement du capital et du levier. Elle ne juge pas. Elle ne prédit pas. Elle ne recommande pas.

**Quels mots utiliser**
Mouvement du capital · concentration / distribution · levier présent / sous pression · convergence / divergence des signaux · contexte lisible / difficile à lire · les opérateurs ont tendance à.

**Quels mots bannir**
Favorable · hostile · opportunité · danger · alerte · prudence · il faut · vous devez · risque élevé / faible · hausse / baisse probable · signal · maintenant · immédiatement.

**Quel comportement psychologique rechercher**
Conscience calme. L'opérateur sait où il décide. Cette conscience n'oriente pas sa décision — elle l'éclaire.

**Protection psychologique principale**
Test de compatibilité Manifeste : après lecture du texte macro, l'opérateur ne doit ressentir aucune pression à agir ou à s'abstenir. Si cette pression existe — le texte est à réécrire.

---

## Résumé exécutif

**Décision la plus importante :** Vocabulaire interdit figé — favorable, hostile, opportunité, danger, prudence, il faut, hausse/baisse probable. Ces mots transforment la Macro en système prescriptif.

**Risque principal :** Effet horoscope — formulations si générales qu'elles sont toujours vraies. Test de falsifiabilité obligatoire sur chaque phrase.

**Ton retenu :** Observateur calme au présent simple. Sujet = capital / levier / opérateurs. Jamais "le marché" comme oracle. Jamais le futur.

**Mots interdits :** favorable · hostile · opportunité · danger · alerte · prudence · il faut · vous devez · signal · maintenant · hausse probable · baisse probable.

**Protection psychologique principale :** Test Manifeste — "après lecture, l'opérateur ressent-il une pression à agir ?" Si oui : réécrire. La conscience calme est l'objectif, jamais l'excitation ni la paralysie.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
