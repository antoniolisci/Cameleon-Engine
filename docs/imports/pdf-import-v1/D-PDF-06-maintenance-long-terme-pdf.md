# D-PDF-06 — Stratégie de maintenance long terme du PDF dans Caméléon Engine

**Date :** 2026-06-04  
**Type :** Réflexion architecturale — aucun code  
**Statut :** Doctrine figée

---

## A. Nature du problème de maintenance PDF

Un parser CSV vieillit linéairement. Si Binance ajoute une colonne, le parser ignore la colonne inconnue ou échoue sur un champ attendu. L'erreur est localisée, détectable, réparable.

Un parser PDF vieillit de manière non linéaire et souvent silencieuse. Il ne lit pas des colonnes — il reconstruit des colonnes à partir de positions spatiales. Quand Binance change son moteur de rendu, les positions changent. Le parser continue de fonctionner. Il extrait des valeurs. Ces valeurs sont fausses. Aucune exception n'est levée.

C'est la nature fondamentale du problème : **la dégradation d'un parser PDF est structurellement invisible**.

Un parser CSV qui échoue échoue bruyamment. Un parser PDF qui échoue peut produire 2476 lignes avec des valeurs décalées de une colonne — et le système les accepte toutes, calcule un score, produit un coaching. L'opérateur voit un résultat. Le résultat est construit sur des décombres.

Un parser PDF est un **contrat avec le moteur de rendu de Binance**, pas un contrat avec les données de Binance. Binance contrôle les données. Le moteur de rendu peut évoluer indépendamment — en réponse à des contraintes de design, de conformité légale, d'internationalisation, de mise à jour de leur bibliothèque PDF interne. Ces évolutions ne sont pas documentées, ne sont pas annoncées, et peuvent arriver sans que les données sous-jacentes changent d'un seul octet.

---

## B. Typologie des ruptures

Les ruptures se classent en cinq catégories, par ordre de dangerosité croissante.

**Type 1 — Décalage de position (détectable, silencieuse)**

Binance modifie légèrement le layout : une colonne se déplace de 15pt vers la droite. La tolérance ±3pt de la signature X absorbe de petits décalages. Au-delà du seuil, la colonne n'est plus reconnue. Le parser extrait soit la mauvaise colonne, soit aucune colonne. Si deux colonnes adjacentes ont des valeurs du même ordre de grandeur (ex. "Prix" et "Quantité exécutée"), le résultat numérique semble plausible mais est factuellement inversé.

**Type 2 — Changement de police ou de rendu typographique (détectable par symptôme indirect)**

Binance change la police ou le moteur de kerning. Les positions X des caractères changent. Le clustering Y peut produire des fusions de lignes ou des séparations inattendues. Symptôme indirect : le nombre de rows extrait change sans raison apparente (`b8.pdf` produirait 28 au lieu de 32). La différence est attribuée à une anomalie de données, pas à une rupture de parsing.

**Type 3 — Changement de structure de tableau (visible)**

Binance ajoute ou supprime une colonne. Le parser extrait toujours le nombre de colonnes attendu — la dernière est perdue, ou les colonnes sont décalées. C'est la rupture la plus visible car elle change le nombre de colonnes. Détectable par une assertion simple sur le compte de colonnes.

**Type 4 — Changement de moteur PDF Binance (cataclysmique)**

Binance change la bibliothèque qui génère ses PDF. La résolution des coordonnées change, le référentiel peut s'inverser (origine bas-gauche vs haut-gauche), l'ordre des items diffère. La signature X entière est invalide. Le clustering Y est invalide. Le parser extrait zéro ligne ou des lignes sans signification. Cette rupture peut invalider l'ensemble du pipeline en une seule mise à jour Binance.

**Type 5 — Changement sémantique sans changement visuel (indétectable)**

Binance modifie la signification d'un champ sans en changer le nom ou la position visuelle. Le champ "Prix" passe de UTC+2 à UTC+0 pour les dates, ou d'un prix moyen à un prix limite pour certains types d'ordres. Le parser extrait les bonnes valeurs au bon endroit. Les valeurs sont techniquement fausses. Cette rupture ne peut être détectée que par cross-validation avec une source externe fiable — typiquement le CSV.

---

**Faux sentiments de sécurité à éviter :**

- *"Les tests passent, donc le parsing est correct."* Les tests valident que le parser extrait ce qu'il extrayait avant. Ils ne valident pas que ce qu'il extrait correspond encore à ce que Binance produit aujourd'hui.
- *"Le score n'a pas changé, donc les données sont correctes."* Un décalage de colonnes entre prix et quantité peut produire le même score si les patterns analysés (fréquence, taille relative) ne sont pas fondamentalement altérés.
- *"Pas d'erreur = pas de problème."* Le parser PDF ne génère pas d'erreur sur une dégradation de type 1, 2 ou 5.
- *"Le corpus de référence protège contre toutes les ruptures."* Le corpus protège contre les régressions internes. Il ne protège pas contre les évolutions externes. Un test qui passe sur `b8.pdf` 2026 ne dit rien sur ce qu'un `b8.pdf` 2027 produirait.

---

## C. Stratégies possibles

**Maintenance réactive** — On attend qu'un opérateur signale un problème. On diagnostique. On corrige.

- Avantage : coût nul tant qu'il n'y a pas de problème.
- Inconvénient : délai potentiellement long entre rupture et signal. Des opérateurs prennent des décisions sur données corrompues pendant ce délai.
- Verdict : acceptable uniquement si le PDF est clairement positionné comme format secondaire avec mention de sa nature reconstruite.

---

**Maintenance préventive** — On anticipe les évolutions Binance, on révise périodiquement le parser sans attendre de rupture.

- Avantage : réduit le délai de réponse.
- Inconvénient : nécessite une veille active des mises à jour Binance — information rarement publiée. Risque de régression introduite par une modification préventive inutile.
- Verdict : difficile à opérationnaliser sans signal concret.

---

**Maintenance basée sur corpus** — On maintient un corpus de référence à jour. À chaque mise à jour Binance, on génère de nouveaux PDFs, on les ajoute au corpus, on vérifie que le parser produit les résultats attendus.

- Avantage : détecte les ruptures de type 1, 2 et 3 immédiatement. Ne requiert pas de veille technologique.
- Inconvénient : ne détecte pas les ruptures de type 5 (sémantique sans changement visuel). Requiert que quelqu'un télécharge de nouveaux PDFs périodiquement.
- Verdict : **stratégie recommandée — efficace et opérationnalisable**.

---

**Maintenance basée sur signal terrain** — On attend que des opérateurs réels importent des PDFs. Si les résultats semblent aberrants ou si une anomalie est signalée, on investigate.

- Avantage : coût nul. Le signal est réel, pas spéculatif.
- Inconvénient : dépend de la capacité des opérateurs à identifier une anomalie dans leurs données — capacité souvent faible.
- Verdict : complément utile à la maintenance basée sur corpus. Pas une stratégie principale.

---

**Stratégie recommandée : corpus + signal terrain.**

Le corpus détecte les ruptures techniques (types 1–4). Le signal terrain détecte les ruptures sémantiques (type 5). Les deux ensemble couvrent l'essentiel du risque. La maintenance préventive et réactive sont des modes de dernier recours, pas des stratégies.

---

## D. Rôle du corpus de référence

`b8.pdf` et `b3.pdf` sont les deux membres du corpus de référence V1. Ces deux fichiers représentent quatre choses distinctes qu'il ne faut pas confondre.

**D1 — Mémoire historique.** Ce sont des artifacts Binance datés de mai 2026. Ils représentent l'état exact du moteur de rendu PDF Binance à ce moment précis. Leur valeur historique ne diminue pas avec le temps — au contraire, ils deviennent plus précieux si Binance change son format, car ils permettent de comparer l'ancien et le nouveau.

**D2 — Détecteur de régression interne.** Ils permettent de détecter toute modification accidentelle du parser qui changerait le résultat sur des données connues. C'est leur rôle de test automatisé. Ce rôle est fiable et permanent.

**D3 — Contrat comportemental.** `b8.pdf = 32 rows` et `b3.pdf = 2476 rows` sont des valeurs de référence figées. Elles définissent ce que "fonctionner correctement" signifie pour ces deux fichiers. Si une modification du code change ces chiffres, c'est une régression.

**D4 — Non-détecteur de rupture externe.** C'est ce que le corpus ne fait pas, et qu'on pourrait croire qu'il fait. Il ne détecte pas les changements dans les nouveaux PDFs Binance. Si Binance change son format en 2027, les tests sur `b8.pdf` et `b3.pdf` passent toujours. Un opérateur qui importe un PDF de 2027 obtiendra un résultat erroné. Les tests ne le détecteront pas.

---

**Conséquence pratique :** le corpus doit être enrichi périodiquement avec de nouveaux PDFs exportés depuis Binance. L'objectif n'est pas un grand corpus — c'est un corpus récent. Deux PDFs récents sont plus utiles que vingt PDFs anciens. Fréquence recommandée : à chaque signalement d'anomalie, et au minimum une fois par an.

---

## E. Doctrine d'expansion des familles PDF

**Pourquoi Trade History et Order History sont légitimes :**

Ces deux familles ont été légitimées par trois conditions simultanément réunies :
1. **Signal terrain réel.** Le corpus B1-B19 contenait ces PDFs — trouvés dans les fichiers réels d'un opérateur réel.
2. **Données identiques aux CSV équivalents.** Le contenu des PDF Trade History et Order History est le même que celui des CSV du même nom. Pas de nouvelles données — un nouveau format d'accès.
3. **Valeur analytique démontrée.** 32 trades Trade History et 2476 trades Order History ont produit des scores comportementaux cohérents avec les attentes terrain.

Ces trois conditions constituent le seuil minimal de légitimité.

---

**Pourquoi Earn, Futures, Margin, Wallet ne doivent pas être automatiquement acceptés :**

*Earn PDF :* Les données Earn (staking, savings, rewards) ne sont pas des trades. Elles n'alimentent pas le pipeline comportemental actuel de Caméléon. La valeur analytique est conditionnelle à un chantier BMSM qui n'existe pas encore.

*Futures PDF :* Impliquent un schéma fondamentalement différent (levier, funding rate, liquidation, positions longues/courtes avec margin). Ce n'est pas une extension du parser existant — c'est un nouveau parseur.

*Margin PDF :* Même logique que Futures : colonnes de margin, d'intérêt, de taux d'emprunt. Format distinct, schéma distinct, pipeline distinct.

*Wallet PDF :* Les données Wallet (dépôts, retraits, transferts) ne sont pas des décisions de trading. Elles alimentent éventuellement BMSM comme source contextuelle, mais le pipeline comportemental actuel ne peut pas les utiliser directement.

**La règle fondamentale :** une nouvelle famille PDF n'est légitime que si ses données alimentent directement et utilement le pipeline comportemental existant, **ou** si un chantier préalable a défini comment elles enrichissent un pipeline futur documenté. L'ajout d'une famille PDF sans pipeline receveur est un geste sans valeur — Caméléon lit les données mais n'en fait rien, et maintient du code qui peut se dégrader silencieusement.

---

## F. Gouvernance et critères d'acceptation

Avant d'accepter une nouvelle famille PDF, cinq critères doivent être simultanément satisfaits. Aucun ne peut être contourné.

**Critère 1 — Signal terrain réel (non négociable).** Le PDF doit avoir été observé dans les données réelles d'un opérateur réel. "Ça pourrait exister sur Binance" n'est pas un signal terrain. Un fichier réel, téléchargé par un opérateur, dans son historique effectif : c'est le seul signal valide.

**Critère 2 — Corpus de référence disponible.** Au moins un exemplaire du PDF doit être disponible comme corpus de référence avant l'implémentation. Sans corpus, pas de contrat comportemental, pas de tests possibles, pas de mémoire de référence.

**Critère 3 — Valeur analytique démontrée.** Les données extraites doivent alimenter un pipeline existant ou un pipeline dont l'architecture est déjà définie. La valeur analytique doit être démontrable — pas théorique.

**Critère 4 — Pipeline receveur défini.** Quel module reçoit les données extraites ? Avec quel schéma canonique ? Vers quel scoring ? Si ces questions n'ont pas de réponse précise avant d'ouvrir le chantier, le chantier est prématuré.

**Critère 5 — Coût de maintenance acceptable.** Chaque nouvelle famille PDF ajoute une surface de fragilité permanente. Le chantier doit être évalué non seulement sur son coût d'implémentation mais sur son coût de maintenance sur 3 ans. Une famille complexe (12+ colonnes, plusieurs cas particuliers, champs nullable) dans un format à haute fragilité représente une dette permanente.

---

**Séquence obligatoire avant tout chantier PDF :**

```
Signal terrain réel
  → Corpus disponible
    → Valeur analytique démontrée
      → Pipeline receveur défini
        → Coût de maintenance évalué
          → Décision d'ouverture
```

Si un seul maillon manque, le chantier ne s'ouvre pas.

---

## G. Vision long terme

Dans trois ans, Caméléon pourrait faire face à deux scénarios opposés.

**Scénario A — Le PDF est resté discipliné**

Deux familles validées, corpus enrichi annuellement, zéro expansion incontrôlée. Le parser est compact, auditable, testable. Quand Binance change son format, le correctif est localisé et prévisible. Le coût de maintenance annuel est faible. La confiance des opérateurs dans le format PDF est maintenue parce qu'il n'a jamais produit de résultats aberrants durables.

Dans ce scénario, le PDF est une porte d'entrée fiable qui a accompli son rôle pendant trois ans sans devenir un fardeau.

**Scénario B — Le PDF a été étendu à chaque signal**

Six familles, parseurs hétérogènes avec des logiques de clustering différentes, corpus partiel, tests insuffisants. Une mise à jour Binance casse trois familles simultanément. Le correctif touche six fichiers. La régression est difficile à isoler. Des opérateurs ont importé des données invalides sans le savoir.

Dans ce scénario, le PDF est devenu la dette technique principale du produit — consommant plus de temps de maintenance que l'ensemble des autres parseurs combinés.

La différence entre ces deux scénarios n'est pas technique. Elle est de gouvernance. Le code est le même dans les deux cas. Ce qui diffère, c'est la discipline appliquée à chaque décision d'expansion.

---

## H. Recommandation finale

**La stratégie recommandée pour maintenir le PDF sur 3 ans tient en cinq règles permanentes.**

**Règle 1 — Corpus vivant, pas figé.** Le corpus de référence (`b8.pdf` et `b3.pdf`) doit être enrichi au minimum une fois par an avec de nouveaux PDFs exportés depuis Binance. Le corpus figé protège contre les régressions internes. Le corpus vivant protège contre les évolutions externes. Les deux sont nécessaires.

**Règle 2 — Zéro expansion sans les cinq critères.** Aucune nouvelle famille PDF n'est ouverte sans signal terrain réel + corpus disponible + valeur analytique démontrée + pipeline receveur défini + coût de maintenance évalué. Cette règle n'a pas d'exception.

**Règle 3 — La qualité d'extraction est un signal produit.** Chaque import PDF expose sa qualité d'extraction (NATIVE / DEGRADED / SCANNED) et son nombre de trades extrait. Si ce signal est visible — même discrètement — l'opérateur peut détecter une anomalie que le système ne peut pas détecter lui-même. Les opérateurs deviennent ainsi des détecteurs de rupture de type 5 (sémantique).

**Règle 4 — Le PDF ne suit pas le CSV dans ses évolutions.** Si Binance ajoute une colonne au CSV Trade History, cette colonne n'est pas automatiquement intégrée au parser PDF. Le PDF est maintenu sur son propre périmètre. La parité fonctionnelle avec le CSV n'est pas un objectif de maintenance.

**Règle 5 — La maintenance réactive reste le mode de dernier recours.** Si une rupture est détectée par signal terrain (opérateur qui signale une anomalie), le délai de correction est court. Mais ce délai ne peut pas être l'unique mécanisme de détection. Le corpus vivant doit détecter les ruptures avant les opérateurs.

---

**Formule de synthèse :**

Le PDF vieillit bien si on lui demande peu et si on l'observe régulièrement. Il vieillit mal si on lui demande beaucoup et si on l'oublie entre deux signaux d'alarme.

Deux familles, corpus vivant, cinq critères d'expansion, zéro parité imposée avec le CSV. C'est la politique de maintenance la plus robuste disponible pour un projet de cette nature, sans infrastructure de monitoring automatisé ni équipe dédiée.
