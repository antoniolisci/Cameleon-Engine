# V0-A — Synthèse architecturale : lecture comportementale sur 5 périodes

**Date :** 2026-05-25  
**Phase :** Phase 3 — Validation terrain  
**Type :** Lecture froide — architecture cognitive — aucune correction proposée

---

## 1. Données complètes

| Dimension | 1_semaine | 1_mois | 3_mois | 6_mois | 1_an |
|-----------|-----------|--------|--------|--------|------|
| Trades bruts | 26 | 33 | 255 | 606 | 1 435 |
| Post-grouper | 5 | 12 | 212 | 501 | 1 000 |
| Absorption grouper | 96 % | 75 % | 17 % | 17 % | 38 % |
| Score live | 90 | 65 | 15 | 30 | 25 |
| Score session (bug) | 30 | 30 | 15 | 30 | 25 |
| État | Discipliné | Réactif | Agressif | Agressif | Agressif |
| Style détecté | DCA | Swing | Range | Range | Range/Carnet |
| Overtrading | 0 | 0 | 6 | 13 | 46 |
| CV tailles | 64 % | 150 % | 380 % | 374 % | 277 % |
| Hors norme | 0 | 3 | 11 | 35 | 77 |
| Transitions | — | — | 16 | 41 | 66 |

---

## 2. Lecture froide du moteur

### Ce qui est solide

**La progression de l'overtrading est monotone et proportionnelle.**  
0 → 0 → 6 → 13 → 46. Cette progression suit le volume de trades post-grouper (5, 12, 212, 501, 1 000). Le ratio fenêtres/trades reste approximativement constant. Ce signal n'est pas du bruit — il suit la densité d'activité avec cohérence. C'est le résultat le plus fiable de l'ensemble du corpus.

**Le style varie de façon cohérente avec l'échelle temporelle.**  
DCA sur 3 jours, Swing sur 25 jours, Range/Carnet sur 88 à 366 jours. Ce n'est pas aléatoire. Sur 3 jours, les métriques sous-jacentes (peu de trades, fort ratio achat, délais courts entre fills) produisent naturellement un profil DCA. Sur 25 jours, le délai moyen de 3 342 min entre trades caractérise un comportement Swing. Sur 88 à 366 jours, la densité et l'équilibre BUY/SELL (~50/50) produisent Range. Le moteur ne détecte pas des régimes au sens algorithmique — mais les métriques qu'il calcule les font émerger naturellement. C'est une propriété architecturale non triviale.

**L'escalade de position est le signal le plus consistant.**  
Elle apparaît à partir de 3_mois et reste le risque dominant sur 3_mois, 6_mois et 1_an. Sur 1_mois, elle est absente. C'est cohérent : 3 achats consécutifs avec escalade +180 % en 120 min demande un volume minimal de séquences pour être détecté. Sa persistance sur trois périodes longues sans apparition sur les périodes courtes lui donne de la crédibilité.

### Ce qui est fragile

**Le score n'est pas monotone.**  
90 → 65 → 15 → 30 → 25. Le score remonte de 15 (3_mois) à 30 (6_mois). Intuitivement, une période plus longue devrait contenir plus de comportements et produire un score égal ou inférieur. Ce n'est pas le cas.

L'explication la plus probable : les fichiers sont cumulatifs et en ordre antichronologique. Le fichier 6_mois contient le 3_mois (les 3 mois récents) plus les 3 mois précédents. Si ces 3 mois plus anciens étaient comportementalement plus stables, leur ajout dilue les patterns récents et remonte le score. Le CV tailles confirme cette hypothèse : 380 % sur 3_mois → 374 % sur 6_mois → 277 % sur 1_an. La dilution temporelle fonctionne bien sur le CV.

Ce comportement n'est pas un bug. C'est la conséquence de scorer un agrégat temporel sans distinguer les sous-périodes. Le moteur ne dit pas "tes 3 derniers mois sont plus erratiques que tes 3 mois précédents." Il dit "ton score sur 6 mois est 30." L'information est perdue dans la fusion.

**Le score sur 5 trades (1_semaine) n'est pas fiable au sens statistique.**  
Un score comportemental calculé sur 5 événements synthétiques (post-grouper) donne 90. Ce chiffre n'a pas la même densité informationnelle qu'un score calculé sur 1 000 événements. L'interface affiche les deux avec la même typographie, le même poids visuel. La mention "Analyse partielle — contexte limité" existe et est correcte, mais elle ne quantifie pas l'incertitude.

---

## 3. Analyse cognitive — régimes ou accumulation de patterns ?

La question posée est : le moteur comprend-il des régimes, des temporalités, des oscillations, des dérives locales — ou accumule-t-il simplement des patterns ?

**Réponse honnête : les deux, avec une frontière floue.**

**Ce qu'il comprend réellement :**

Le style detection fonctionne comme une lecture multi-échelle émergente. Ce n'est pas une architecture explicitement conçue pour détecter des régimes temporels — c'est le résultat de métriques qui se comportent différemment selon la profondeur. `avgHoldTime`, `directionalRatio`, `tradeFrequency`, `delayAfterBuy` convergent naturellement vers des profils différents à des échelles différentes. Le moteur ne sait pas qu'il lit des régimes. Mais les régimes émergent quand même.

L'overtrading progression (0 → 0 → 6 → 13 → 46) montre une accumulation proportionnelle au volume. Ce n'est pas un artefact — c'est de la mémoire comportementale implicite. La densité de fenêtres overtrading par unité de trades reste approximativement stable. Le moteur accumule bien ici, et cette accumulation est informative.

**Ce qu'il accumule sans comprendre :**

Le CV tailles se déclenche sur 5 trades (64 %) comme sur 1 000 trades (277 %). Le seuil de déclenchement du pattern n'est pas conditionné par la signification statistique de la mesure. Un CV de 64 % sur 5 événements synthétiques est bruit. Un CV de 380 % sur 212 trades est un signal. Le moteur ne fait pas cette distinction — il déclenche le pattern dans les deux cas.

Les transitions apparaissent dès 3_mois (16) et progressent jusqu'à 1_an (66). Le seuil d'apparition est lié au volume, pas à une détection explicite de changement de régime. Les transitions ne sont pas détectées comme des ruptures structurelles — elles comptent un nombre d'oscillations au-dessus d'un seuil.

**Ce qui manque structurellement :**

Le moteur n'a pas de mémoire des sous-périodes. Il fusionne tout. Il ne peut pas dire : "tu étais stable entre le mois 4 et le mois 6, et instable entre le mois 1 et le mois 3." Il voit un agrégat temporel plat. Cette limitation n'est pas un bug — c'est une frontière architecturale actuelle.

---

## 4. Analyse du grid-grouper

**Taux d'absorption par période :**  
96 % → 75 % → 17 % → 17 % → 38 %

**Ce qui est cohérent :**

L'absorption élevée sur les courtes périodes (96 %, 75 %) reflète la réalité du trading carnet/DCA : les fills individuels sur un ordre fractionné doivent être consolidés. Le grouper fait exactement ce pour quoi il a été conçu. Sur 1_semaine, 25 des 26 trades bruts sont probablement des fills successifs sur les mêmes ordres TAO. Les regrouper en 5 événements est architecturalement juste.

La stabilisation à 17 % sur 3_mois et 6_mois est le taux naturel de ce style de trading : environ 1 trade sur 6 est un fill isolé qui ne s'agrège pas. Ce plancher semble stable.

**Ce qui est incohérent :**

Le taux remonte à 38 % sur 1_an, alors qu'il était stable à 17 % sur 3 et 6 mois. Explication probable : le fichier 1_an inclut la période 1_semaine (96 % d'absorption) en son sein. L'agrégat de 1 435 trades mélange des séquences à haute densité récentes avec des séquences anciennes plus espacées. L'absorption globale de 38 % reflète cette hétérogénéité temporelle, pas un comportement uniforme.

**Ce qui est problématique :**

À 96 % d'absorption, le moteur analyse 5 événements synthétiques et produit un score de 90. La question n'est pas si le grouper a bien fonctionné (il a bien fonctionné) — c'est si 5 événements synthétiques constituent une base suffisante pour une analyse comportementale significative. Le moteur ne pose pas cette question. Il calcule et conclut.

Il n'y a pas de seuil minimal documenté en dessous duquel le moteur refuse de scorer ou baisse explicitement sa confiance de façon quantifiée. La mention "Analyse partielle" est qualitative, pas quantifiée.

---

## 5. Analyse du scoring

**Le score est piloté par le CV tailles dans toutes les périodes.**

Le pattern "Tailles incohérentes" est le seul à être présent sur les 5 périodes. Son amplitude croît de 64 % à 380 %, puis redescend à 277 % avec la dilution temporelle. C'est le pattern le plus persistant du corpus — et potentiellement le moins fiable sur les courtes périodes (PS-01 documenté : CV global vs CV par symbole).

**Le poids 25 % sur l'overtrading crée un effet de bord.**

L'overtrading a le poids le plus élevé (25 %). Il est aussi le pattern le plus sensible au volume de trades analysés. Sur 3_mois, 6 fenêtres overtrading sur 212 trades (~2,8 %) suffisent à tirer le score vers 15. La pondération ne distingue pas la fréquence relative (fenêtres / trades) de la fréquence absolue. 6 fenêtres sur 212 trades et 46 fenêtres sur 1 000 trades ont une signification comportementale différente, mais leurs impacts sur le score sont comparables.

**Cause dominante ≠ risque dominant.**

Sur 3_mois : Cause dominante = Overtrading, Risque dominant = Escalade.  
Sur 1_an : Cause dominante = Overtrading, Risque dominant = Escalade.  
La cause dominante reflète le poids dans le score. Le risque dominant reflète la sévérité comportementale. Ce sont deux métriques différentes qui désignent deux patterns différents. L'interface les affiche sans expliquer cette distinction. Pour l'utilisateur, il n'est pas évident que "cause" et "risque" peuvent diverger — et ce qu'ils signifient respectivement.

**Le score non-monotone est une information, pas un problème.**

15 sur 3_mois et 30 sur 6_mois signifie : les 3 derniers mois sont plus erratiques que les 3 mois qui précèdent. C'est un signal réel, potentiellement utile. Mais l'interface ne le formule pas ainsi. Elle affiche deux scores discrets sur deux périodes. La comparaison n'est pas proposée — elle doit être faite manuellement.

---

## 6. Analyse UX / produit

**Ce qui devient puissant :**

La détection de style multi-échelle est le résultat le plus inattendu et le plus utile. Un utilisateur qui voit DCA (1_semaine) → Swing (1_mois) → Range/Carnet (3 mois et au-delà) obtient une lecture de sa propre trajectoire d'évolution de style. Ce n'est pas ce que l'interface met en avant — mais c'est ce que les données racontent.

Le grid-grouper transforme correctement le bruit de marché en signal comportemental. Sans lui, la lecture sur 1_semaine serait inutilisable. Il est architecturalement invisible mais essentiel.

L'escalade de position comme risque dominant persistant (3_mois, 6_mois, 1_an) donne une lecture cohérente dans le temps. Un utilisateur qui importe trois périodes différentes voit le même risque dominant identifié. C'est de la cohérence comportementale, pas du bruit.

**Ce qui devient dangereux :**

Un utilisateur peut importer 3_mois et obtenir 15 / "STOP IMMÉDIAT". Il peut importer 6_mois le lendemain et obtenir 30 / "Agressif". La même réalité comportementale produit des lectures radicalement différentes selon la fenêtre choisie. L'interface ne dit pas que cette variabilité existe.

Le bloc sessions affiche Best = 30, Worst = 25, Moyenne = 28. Ces trois chiffres sont faux du point de vue de l'utilisateur (bug session-score). La synthèse sessions est aujourd'hui une source de désinformation involontaire.

**Ce qui crée de la défiance :**

Le score 15 avec STOP IMMÉDIAT sur 3_mois, puis 30 sur 6_mois, sans explication de la différence, casse la confiance dans la cohérence du moteur. L'utilisateur ne peut pas comprendre pourquoi 3 mois = danger immédiat et 6 mois = moins grave. Sans ce contexte, il conclut que le moteur est arbitraire.

**Ce qui crée une sensation de vérité :**

La progression overtrading (0 → 0 → 6 → 13 → 46) est visible et proportionnelle. Elle donne l'impression que le moteur "compte quelque chose de réel". L'escalade persistante sur les longues périodes crée une sensation de cohérence temporelle. Le style détecté (DCA puis Swing puis Range) correspond intuitivement à l'idée qu'un trader récent fait d'abord de l'accumulation, puis développe un style. Ces lectures créent de la résonance.

---

## 7. Analyse philosophique

**Le moteur lit-il un comportement vivant ou produit-il des statistiques habillées ?**

Les deux — et c'est précisément le problème.

Il y a au moins trois niveaux de lecture dans les données :

**Niveau 1 — Statistique pure :** CV tailles, hors norme, délais. Ce sont des mesures. Elles ne comprennent rien. Elles quantifient. À faible volume (5 trades), elles produisent des chiffres sans signification comportementale. Le moteur les traite comme des signaux même quand ce sont des artefacts.

**Niveau 2 — Pattern émergent :** overtrading, escalade, transitions. Ce sont des structures qui émergent de l'interaction entre plusieurs métriques et une fenêtre temporelle. Ils ne sont pas arbitraires — ils correspondent à des comportements réels observables. L'escalade sur 3 achats consécutifs + 180 % en 120 min est un pattern réel, pas une statistique habillée.

**Niveau 3 — Régime latent :** le style détecté (DCA / Swing / Range). Ce n'est pas calculé comme un régime — c'est une émergence des métriques. Mais le résultat ressemble à une lecture comportementale profonde. C'est le niveau où le moteur se rapproche le plus de lire un comportement vivant.

**Le moteur oscille entre ces trois niveaux sans signaler auquel il opère.**

Un CV de 64 % sur 5 trades est du niveau 1 (statistique sans sens). L'escalade persistante sur 3 périodes est du niveau 2 (pattern réel). Le style DCA → Swing est du niveau 3 (régime émergent). L'interface les présente avec le même poids, la même autorité visuelle, le même ton.

C'est là que la friction s'installe : le moteur sait parfois. Mais il ne sait pas qu'il ne sait pas — et il ne dit pas quand il ne sait pas. Il n'a pas de métacognition sur la qualité de ses propres lectures.

Un système qui "lit un comportement vivant" devrait produire des lectures différentes selon la confiance qu'il a dans sa propre analyse. Ce moteur ne le fait pas encore systématiquement.

---

## 8. Conclusions classifiées

### A — CONFIRMÉ

- **Style détecté multi-échelle est cohérent.** DCA / Swing / Range/Carnet émergent correctement des métriques selon la profondeur temporelle. Ce n'est pas aléatoire.
- **Overtrading est un signal réel et proportionnel.** Progression 0 → 0 → 6 → 13 → 46 suit le volume. Taux relatif stable.
- **Escalade de position est le signal individuel le plus fiable.** Cohérent sur 3 périodes longues, absent sur les périodes courtes. Définition stricte.
- **Grid-grouper remplit correctement son rôle sur les courtes périodes.** Absorption 96 % sur 1_semaine est architecturalement juste pour un style carnet/DCA.
- **Bug session-score confirmé.** Pipeline live ≠ pipeline sessions. Les scores affichés dans la synthèse sessions sont structurellement faux.
- **Point de bascule comportemental à ~3 mois.** Overtrading, transitions et fracture de cohérence apparaissent simultanément à cette profondeur.
- **CV tailles se déclenche à tout volume, y compris sans signification statistique.**

### B — INCERTAIN

- **Score non-monotone (15 sur 3_mois, 30 sur 6_mois).** Probablement une dilution temporelle (les 3-6 mois précédents étaient plus calmes). Mais la composition exacte n'est pas vérifiable sans analyse par sous-période.
- **CV 380 % sur 3_mois : signal réel ou PS-01 inter-symboles ?** 8 symboles sur 3_mois — le CV global est-il dominé par des différences légitimes de sizing par actif, ou par une véritable instabilité comportementale ? Impossible à trancher sans CV par symbole.
- **Style Range/Carnet sur 1_an : authentique ou artefact du grid-grouper ?** À quelle proportion le style est-il influencé par le fait que le grouper laisse passer 38 % des trades, créant artificiellement une densité de trading apparente ?
- **Absorption 38 % sur 1_an vs 17 % sur 3/6 mois.** Composition temporelle ou comportement différent sur la période la plus ancienne ?

### C — À INVESTIGUER

- **Seuil d'activation des transitions.** Absent jusqu'à 12 trades post-grouper, présent à 212. Dépend-il du volume, de la diversité de style, ou d'un seuil hard-codé ?
- **Taux d'overtrading relatif.** 6 fenêtres sur 212 trades (2,8 %) vs 46 sur 1 000 trades (4,6 %). La légère hausse du taux relatif sur 1_an est-elle significative ou dans le bruit ?
- **Seuil de confiance minimal du score.** En dessous de combien de trades post-grouper le score est-il informatif ? 5 semble insuffisant. 12 est limite. La frontière n'est pas définie.
- **Escalade de position : progression.** 8 séquences sur 212 trades (3_mois) → 16 sur 501 trades (6_mois) → 16 sur 1 000 trades (1_an). La stagnation sur 6_mois → 1_an mérite investigation. Le signal se stabilise-t-il ou disparaît-il sur la période la plus ancienne ?

### D — PROBABLEMENT FAUX

- **Score 90 sur 5 trades synthétiques comme lecture comportementale fiable.** La valeur est produite par le calcul, mais son intervalle de confiance est trop large pour être actionnable. "Discipliné" sur 5 événements ne devrait pas avoir le même poids qu'un "Discipliné" sur 500.
- **Synthèse sessions actuelle (Best=30, Worst=25, Moyenne=28) comme mémoire comportementale.** Ces valeurs ne correspondent pas aux scores vécus par l'utilisateur. La synthèse sessions est aujourd'hui une fiction numérique.
- **CV tailles sur moins de 20 trades comme signal comportemental.** 64 % sur 5 trades est un artefact statistique, pas un diagnostic.
- **STOP IMMÉDIAT sur 3_mois comme réponse proportionnée.** Le même corpus produit 15 (3_mois) et 30 (6_mois). Le niveau d'alarme ne devrait pas être absolu sur une valeur sujette à une telle variance selon la fenêtre choisie.

---

## 9. Ce que le corpus V0-A a permis de voir

Ce protocole d'observation a produit cinq lectures sur le même opérateur. La conclusion centrale n'est pas "le moteur a tort" ou "le moteur a raison". Elle est plus fine :

**Le moteur produit des lectures vraies à l'échelle des régimes et des lectures instables à l'échelle des mesures.**

Les régimes — style, escalade persistante, point de bascule à 3 mois — sont vrais. Les mesures — score 90 sur 5 trades, CV 64 % sur 5 trades, synthèse sessions à 28 — sont fragiles.

Le travail qui reste n'est pas de corriger les scores. C'est de distinguer, dans l'interface et dans l'architecture, ce que le moteur sait avec confiance de ce qu'il produit par convention.

---

*Protocole V0-A Phase 3 — observé sur 5 périodes — 2026-05-25.*  
*Aucune correction proposée. Document d'observation architecturale.*
