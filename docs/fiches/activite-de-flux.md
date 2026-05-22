# Activité de flux

*Fiche pédagogique freeware — Caméléon Engine*
*Version 1.0 — Mai 2026*

---

## Ce qu'il mesure

L'activité de flux mesure l'intensité de la participation au marché à un instant donné — non pas le volume brut d'échanges, mais la densité des ordres qui s'exécutent et la vitesse à laquelle la liquidité se consomme.

Un marché peut afficher un volume élevé avec très peu d'activité de flux réelle : si les échanges se font sans conviction, sans pression directionnelle, le flux reste plat. À l'inverse, un faible volume avec une exécution concentrée génère une activité de flux significative.

C'est une lecture de l'engagement des participants, pas de leur nombre.

---

## Pourquoi il est présent dans Caméléon

La plupart des erreurs de lecture de marché se produisent sur des marchés apparemment calmes. L'activité de flux permet de distinguer un calme de consolidation — où les participants attendent — d'un calme d'indifférence — où personne n'est positionné.

Cette distinction conditionne la fiabilité de presque tous les autres signaux. Un niveau de prix tenu dans un marché à flux élevé n'a pas la même valeur qu'un niveau tenu dans un marché à flux nul.

Caméléon ne peut pas produire une lecture cohérente de l'état de marché sans savoir si le marché est habité ou vide.

---

## Ce qu'il peut faire croire à tort

Une activité de flux élevée peut sembler confirmer une direction. C'est l'un des biais les plus fréquents : beaucoup d'activité = mouvement validé.

Ce n'est pas exact. Un flux intense peut aussi bien accompagner une liquidation massive, un retournement brusque, ou une absorption en cours. L'intensité ne dit rien sur la direction — elle dit que quelque chose se passe, pas ce que c'est.

À l'inverse, une faible activité de flux peut être confondue avec de la stabilité. Elle peut simplement indiquer une session creuse, un creux d'attention institutionnelle, ou un marché suspendu avant un événement. Ces configurations ne se comportent pas de la même façon.

---

## Comment Caméléon l'utilise

Dans le moteur, l'activité de flux sert de modulateur de confiance. Elle ne produit pas de signal propre — elle pondère la fiabilité des autres indicateurs.

Une lecture structurelle claire dans un marché à flux faible est traitée avec une marge d'incertitude plus large. La même lecture dans un marché à flux élevé est considérée comme plus robuste, à condition que les autres indicateurs soient cohérents.

L'activité de flux intervient également dans l'évaluation du régime actuel : un marché en transition génère généralement une activité de flux irrégulière, un signe que la structure est en cours de redéfinition plutôt que consolidée.

---

## Pourquoi il n'est jamais lu seul

L'activité de flux sans direction structurelle est du bruit organisé. Elle indique que quelque chose se passe — pas si ce quelque chose est porteur ou destructeur de tendance.

Combinée à la pression directionnelle, elle permet de distinguer un flux unidirectionnel d'un flux croisé — ce qui change radicalement l'interprétation. Combinée à la cohérence d'environnement, elle révèle si ce flux s'inscrit dans un contexte lisible ou dans une configuration de rupture.

Lue seule, elle crée l'illusion d'une information complète là où il n'y a qu'une intensité sans contexte. C'est précisément le type de lecture partielle que Caméléon est conçu pour corriger.
