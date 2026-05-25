# V0-A — Post-fix : cohérence cognitive du moteur

**Date :** 2026-05-25  
**Phase :** Phase 3 — Validation terrain  
**Type :** Observation stratégique — aucun code, aucune roadmap

---

## 1. Contexte

### Rappel V0-A

Le protocole V0-A a consisté à importer cinq exports Binance Spot Trade History réels sur le même opérateur, couvrant des périodes progressives : 1 semaine, 1 mois, 3 mois, 6 mois, 1 an. L'objectif n'était pas de juger le trader — c'était d'évaluer la cohérence du moteur comportemental face à des données réelles.

Le moteur a produit des lectures multi-échelles cohérentes (DCA → Swing → Range/Carnet selon la profondeur), détecté un point de bascule comportemental à ~3 mois, et identifié l'escalade de position comme signal persistant et fiable. Le diagnostic architectural a séparé ce qui est confirmé (A), incertain (B), à investiguer (C) et probablement faux (D).

### Rappel bug session-score

La synthèse sessions affichait des scores calculés sans le grid-grouper. Les sessions sauvegardées étaient rescorées sur les trades bruts, pas sur les trades groupés. L'écart était proportionnel au taux d'absorption : maximal sur 1_semaine (96 % d'absorption → score session 30 au lieu de 90), nul sur 3_mois et 6_mois (17 % d'absorption → scores identiques).

Conséquence : le pipeline live et la mémoire sessions produisaient deux vérités contradictoires sur le même jeu de données.

### Rappel fix 615c810

Fichier modifié : `src/js/behavior/analytics/behavior-analyzer.js`  
Changement : ajout de `groupGridTrades(s.trades)` avant `computeMetrics` dans `analyzeSessions`.  
Périmètre : quatre lignes. Aucune logique comportementale modifiée.

### Scores après fix

| Session | Score live | Score session avant | Score session après |
|---------|------------|--------------------|--------------------|
| 1_semaine | 90 | 30 | ~90 |
| 1_mois | 65 | 30 | ~65 |
| 3_mois | 15 | 15 | 15 |
| 6_mois | 30 | 30 | 30 |
| 1_an | 25 | 25 | 25 |

**Score moyen :** 28 → 45  
**Lecture globale :** "Instable — dominé par des réactions" → "Irrégulier — Tu alternes entre discipline et impulsivité"

---

## 2. Observation centrale

**Le moteur est imparfait, mais cognitivement cohérent.**

Cette phrase mérite d'être développée parce qu'elle marque une transition qualitative, pas seulement une correction technique.

Avant le fix, le moteur était dans une situation paradoxale : il produisait des lectures pertinentes pendant l'import — lecture de régime, détection de style, coaching adapté — puis les contredisait silencieusement dans la synthèse sessions. Un utilisateur voyait "1_semaine : 90 / Discipliné" dans le live, puis "Best score : 30 / Instable" dans la mémoire. Ces deux informations provenaient du même moteur, des mêmes trades, de la même logique déclarée. Elles se contredisaient sans explication.

Ce type de contradiction est cognitivement destructeur. Il ne dit pas à l'utilisateur que quelque chose est faux — il dit que le moteur lui-même ne sait pas ce qu'il pense. Un moteur contradictoire n'est pas seulement inexact. Il est impossible à faire confiance, même quand il a raison.

La correction ne rend pas le moteur plus précis dans ses scores. Elle l'aligne avec lui-même. Le live et la mémoire racontent maintenant la même histoire. C'est ce que signifie "cognitivement cohérent" : le moteur produit une lecture unique, lisible dans le temps, sans se contredire selon le contexte d'affichage.

C'est une étape importante parce qu'un moteur incohérent ne peut pas être amélioré proprement. Chaque ajustement sur un pipeline risquait d'aggraver la contradiction sur l'autre. La cohérence est la condition préalable à tout affinement sérieux.

---

## 3. Ce que le fix change vraiment

**Continuité live / mémoire.** Le score qu'un utilisateur voit pendant l'import est maintenant le même que celui stocké et affiché dans la synthèse sessions. Il n'y a plus de rupture narrative entre l'expérience d'import et la consultation de l'historique.

**Cohérence narrative.** La progression multi-périodes devient lisible. Avec des scores sessions de 90 / 65 / 15 / 30 / 25, l'utilisateur peut comprendre une alternance : discipline sur la période récente, dérives sur des périodes plus longues, stabilisation relative sur 6 mois et 1 an. Cette lecture est imparfaite, mais elle est cohérente. Elle peut être discutée, contestée, nuancée. Elle ne peut plus être simplement rejetée comme contradictoire.

**Réduction de la contradiction UX.** Avant, l'interface produisait une dissonance sans l'annoncer. L'utilisateur ne savait pas pourquoi "son" score changeait selon l'endroit où il regardait. Cette dissonance était invisible — aucune erreur, aucun message d'alerte — ce qui la rendait encore plus perturbante. Elle n'existe plus.

**Amélioration de la confiance utilisateur.** Un moteur qui se contredit lui-même ne peut pas être un miroir. Il devient un juge arbitraire dont les verdicts dépendent de l'écran consulté. Avec la correction, le moteur reprend une forme de crédibilité minimale : il dit la même chose partout.

**Meilleure lecture multi-périodes.** La synthèse sessions peut maintenant remplir son rôle : montrer une évolution comportementale dans le temps. La progression de 90 à 25 sur cinq périodes est discutable — elle dépend de la composition des datasets, du taux d'absorption, de PS-01 — mais elle est au moins lisible comme une progression, pas comme du bruit.

---

## 4. Ce que le fix ne résout pas

Le fix est chirurgical. Il corrige une incohérence de pipeline. Il ne touche à rien d'autre. Ce qui suit n'est pas une critique de la correction — c'est un inventaire honnête de ce qui reste ouvert.

**Scoring encore imparfait.** Le score 15 sur 3_mois et 30 sur 6_mois reste contre-intuitif. La non-monotonicité reflète la composition temporelle des datasets, pas nécessairement un comportement réel. Le moteur ne l'explique pas.

**Patterns encore bruts.** Le CV tailles se déclenche sur 5 trades (64 %) comme sur 1 000 trades (277 %). La définition du pattern ne change pas selon le volume. Le signal est présenté avec la même autorité dans les deux cas.

**Confiance de lecture absente.** Le moteur ne sait pas signaler quand sa propre lecture est fragile. Un score sur 5 trades synthétiques et un score sur 501 trades sont affichés identiquement. L'incertitude statistique est invisible.

**Seuils non contextualisés.** Les mêmes seuils s'appliquent à un style DCA, à un style Swing et à un style Range/Carnet. Un Range trader qui exécute cinq achats en 60 minutes sur le même symbole déclenche le même overtrading qu'un trader impulsif qui fait la même chose sans stratégie. Le moteur voit la même signature comportementale dans des situations différentes.

**UX encore trop punitive.** Le STOP IMMÉDIAT, le rouge, l'état "Agressif" arrivent avant la lecture de style. Un utilisateur ayant un style Range/Carnet identifiable et cohérent reçoit d'abord la sanction, puis la reconnaissance. L'ordre est inversé.

**Style détecté encore trop discret.** L'information la plus structurante — "tu opères en Range/Carnet" — est placée trop bas dans l'interface pour être vue rapidement. Elle est enterrée sous les patterns et le coaching.

**Activité structurée encore mal séparée de l'impulsivité réelle.** Un grid trader, un DCA trader et un overtrader peuvent produire des signatures temporelles similaires. Le grid-grouper atténue ce problème, mais il ne le résout pas complètement. 6 fenêtres overtrading sur 3_mois pourraient être des séquences grid légitimes ou de l'overtrading réel — le moteur ne fait pas cette distinction de façon explicite.

---

## 5. Nouveau niveau produit identifié

Il y a trois niveaux dans l'évolution d'un moteur comportemental.

**Niveau 1 — Détecter.** Le moteur observe des signatures et les nomme. Il calcule des métriques, identifie des patterns, produit un score. C'est le travail d'un moteur de règles bien calibré. Avant le V0-A, Caméléon Engine opérait principalement à ce niveau, avec une incohérence de pipeline qui en réduisait la crédibilité.

**Niveau 2 — Comprendre.** Le moteur commence à lire des structures plutôt que des événements isolés. Il identifie des régimes (DCA, Swing, Range), détecte des points de bascule, reconnaît que le même opérateur peut être discipliné sur une période et erratique sur une autre. Le V0-A a montré que Caméléon Engine opère déjà partiellement à ce niveau : la détection de style multi-échelle est réelle, l'escalade persistante est un signal structurel, le point de bascule à 3 mois est identifiable. Le fix de cohérence rend cette compréhension visible dans le temps.

**Niveau 3 — Nuancer.** Le moteur sait lire, et il sait aussi quand sa lecture est fragile. Il distingue une lecture fiable d'une lecture partielle. Il adapte son ton selon la confiance de son analyse. Il ne présente pas un score sur 5 trades avec la même autorité qu'un score sur 500. Il ne déclenche pas le même signal d'urgence pour 6 fenêtres d'overtrading sur 212 trades et pour 46 fenêtres sur 1 000 trades.

Caméléon Engine n'est pas encore au niveau 3. Il vient de consolider le niveau 2. C'est une étape réelle, pas une métaphore.

**Avant, le moteur détectait.**  
**Maintenant, le moteur commence à comprendre.**  
**Prochaine étape : le moteur doit apprendre à nuancer.**

---

## 6. Axes futurs — sans implémentation

Ces axes sont des directions de réflexion. Aucun n'implique de code maintenant.

### Axe 1 — Confiance de lecture

Le moteur devrait distinguer la qualité de sa propre analyse avant de l'exposer. Une lecture fiable est celle qui repose sur un volume suffisant, une cohérence de style stable, et des patterns clairement au-dessus du seuil de signification. Une lecture fragile est celle qui repose sur peu de trades, un style instable, ou des patterns à la limite du seuil.

Cette distinction ne change pas le calcul — elle change la communication. "Score : 90 — lecture partielle (5 événements analysés)" dit autre chose que "Score : 90 — lecture fiable (501 événements)". Les deux scores sont calculés de la même façon. Ce qui change, c'est ce que le moteur dit de lui-même.

### Axe 2 — Seuils par contexte

Les mêmes seuils appliqués à un DCA trader et à un Range trader ne mesurent pas la même chose. Un DCA trader qui fait 5 achats en 60 minutes construit une position — c'est son style. Un trader Range qui fait la même chose hors de ses patterns habituels peut être en train de dériver.

Adapter le contexte ne signifie pas blanchir les dérives. Une escalade de position est une escalade, quel que soit le style. Ce qui change, c'est le seuil de déclenchement de l'overtrading et la signification du CV tailles selon la diversification du portefeuille.

Phrase canonique à conserver : *"La calibration adapte l'interprétation. Elle ne blanchit jamais les dérives."*

### Axe 3 — Mémoire multi-échelles

Le V0-A a produit cinq lectures du même opérateur. Ces cinq lectures ne se contredisent pas — elles se complètent. Discipliné sur 1 semaine, réactif sur 1 mois, agressif sur 3 mois, agressif mais plus stable sur 6 mois, dense et multi-régimes sur 1 an. C'est une trajectoire comportementale, pas un état unique.

Un moteur qui réduit cela à une seule note brute efface l'information la plus intéressante : la dynamique. La mémoire multi-échelles n'est pas l'affichage de cinq scores côte à côte. C'est la lecture de ce que ces scores racontent ensemble sur l'évolution de l'opérateur dans le temps.

### Axe 4 — Activité structurée vs impulsivité réelle

C'est le problème central de la précision comportementale. Un grid trader, un DCA trader et un overtrader peuvent produire des signatures identiques sur une fenêtre courte. La différence n'est pas dans la signature — elle est dans l'intention et dans la structure sous-jacente.

Le grid-grouper est une première réponse à ce problème. Il n'est pas suffisant. La question ouverte est : comment le moteur peut-il distinguer une activité dense mais cohérente d'une activité dense et erratique, quand les métriques de surface sont similaires ?

Ce problème ne se résout pas par des seuils plus fins. Il se résout par une meilleure lecture du contexte opératoire — ce qui est précisément l'objectif du niveau 3.

### Axe 5 — UX cognitive

L'interface actuelle hiérarchise l'alarme avant la reconnaissance. Le score rouge arrive avant le style détecté. Le STOP précède la cohérence. La lecture comportementale est enterrée sous les patterns.

L'inversion de cette hiérarchie ne change pas ce que le moteur sait. Elle change ce que l'utilisateur perçoit en premier. Un utilisateur qui voit d'abord "Style : Range/Carnet — Cohérence : moyenne — Risque actif : escalade" reçoit une lecture structurée. Un utilisateur qui voit d'abord "25/100 — Agressif — STOP IMMÉDIAT" reçoit une sanction.

Les deux utilisateurs ont accès aux mêmes informations. L'un d'eux comprend le moteur. L'autre le subit.

---

## 7. Risques si cette évolution n'a pas lieu

**Moteur trop punitif.** Un moteur qui sanctionne sans nuancer finit par être désactivé. L'utilisateur apprend à ignorer les alertes parce qu'elles ne font pas de distinction entre une dérive grave et un style mal compris.

**Utilisateur figé dans son passé.** Sans mémoire multi-échelles, le score long terme écrase le score récent. Un opérateur qui a progressé voit toujours son passé comme sa définition. Le moteur devient un miroir figé, pas un miroir vivant.

**Confusion entre discipline récente et dérive historique.** Si la synthèse sessions réduit cinq périodes à un score moyen de 45, l'information que l'opérateur était discipliné sur la semaine récente et agressif sur les 3 mois précédents est perdue. La nuance disparaît dans la moyenne.

**Faux positifs sur activité structurée.** Sans contextualisation par style, le grid trader et le DCA trader continueront à déclencher de l'overtrading pour des séquences qui font partie de leur architecture normale d'exécution.

**Perte de confiance dans la lecture.** Un moteur qui dit "STOP IMMÉDIAT" sur 3 mois et "30" sur 6 mois, sur les mêmes trades, sans explication, perd sa crédibilité. L'utilisateur ne sait plus à quelle lecture se fier. Il choisit d'ignorer les deux.

**Moteur perçu comme juge au lieu de miroir.** La vocation du moteur n'est pas de condamner — c'est de montrer. Un moteur qui hiérarchise l'alarme avant la reconnaissance produit un verdict avant une lecture. L'utilisateur se défend au lieu d'observer.

---

## 8. Conclusion

Le V0-A ne valide pas un moteur parfait.

Il valide un moteur désormais cohérent — et c'est précisément ce qui le rend améliorable proprement.

Avant le fix, les améliorations risquaient d'aggraver les contradictions : corriger le scoring live sans corriger le pipeline sessions aurait approfondi l'écart. Corriger la présentation UX sans aligner les deux pipelines aurait rendu la contradiction plus visible, pas moins présente.

Maintenant que live et mémoire sont alignés, chaque amélioration peut être évaluée de façon cohérente. Un ajustement de seuil se voit dans le live et dans la mémoire. Une correction de pattern affecte les deux lectures de la même façon. La base est stable.

Ce n'est pas le dernier état du moteur. C'est l'état à partir duquel le travail sérieux peut commencer.

**Un moteur contradictoire doit être réparé.**  
**Un moteur cohérent peut être affiné.**

---

*Document d'observation stratégique — Phase 3 V0-A — 2026-05-25.*  
*Aucun code. Aucune roadmap. Aucun patch.*
