# D-PDF-04 — Rôle architectural du PDF dans Caméléon Engine

**Date :** 2026-06-04  
**Type :** Réflexion architecturale — aucun code  
**Statut :** Doctrine figée

---

## A. Nature réelle du PDF dans Caméléon Engine

Le PDF n'est pas un format de données. C'est un format de présentation.

Binance génère ses PDF à partir des mêmes données que ses CSV — mais en passant par un moteur de rendu visuel. Le résultat est une représentation figée, orientée affichage humain, non machine. Caméléon doit donc "lire" ce que l'utilisateur voit sur son écran, à la place de ce que Binance expose dans ses exports structurés.

Ce renversement a une conséquence architecturale profonde : **le PDF place Caméléon en position de décodeur, pas de consommateur**. Il ne reçoit pas des données — il reconstruit des données à partir d'artefacts visuels. Ce positionnement est fragile par nature.

Dans l'état actuel, le PDF Binance n'apporte aucune donnée que le CSV ne contient pas. Les 32 trades de `b8.pdf` sont identiques aux 32 trades du CSV Trade History correspondant. La valeur du PDF est exclusivement **logistique** : l'opérateur a ce format dans ses mains, pas l'autre. Ce n'est pas une raison faible — c'est la seule raison valide — mais elle doit être nommée clairement.

**Le PDF est donc, en premier lieu, une porte d'entrée.** Pas une source principale au sens technique — mais une source principale au sens du parcours utilisateur. Il est le format qui permet à Caméléon d'être utile à quelqu'un qui n'a pas encore organisé ses données. C'est une position stratégique distincte de celle du CSV, pas inférieure, pas supérieure : orthogonale.

---

## B. Comparaison CSV / XLSX / PDF

| Dimension | CSV | XLSX | PDF |
|---|---|---|---|
| Fidélité des données | Maximale — source directe Binance | Maximale — même source | Dégradée — reconstruction positionnelle |
| Richesse structurelle | Toutes colonnes | Toutes colonnes | Colonnes présentes à l'écran uniquement |
| Robustesse parsing | Élevée — délimiteur stable | Élevée — structure cellulaire | Fragile — clustering Y, seuil X, signaux forts |
| Surface de fragilité | Encodage, séparateur décimal | Version Excel, colonnes décalées | Changement layout Binance, DPI, police, export engine |
| Capacité analytique | Complète | Complète | Complète sur périmètre V1 — sans garantie de continuité |
| Coût de maintenance | Faible | Modéré (ex. CASE_001 superscript) | Élevé — tout changement Binance casse le parsing silencieusement |
| Signal de rupture | Erreur parsing visible | Erreur colonne détectable | Rupture silencieuse possible — 0 trade extrait sans erreur |

Le PDF a une surface de fragilité qualitativement différente des deux autres. Une mise à jour Binance qui déplace une colonne de 5pt casse `PDF-ARCH-02`. Une mise à jour qui change la police casse les signatures X. Ces ruptures ne produisent pas d'erreur — elles produisent des données incorrectes ou des résultats vides acceptés silencieusement.

---

## C. Impact sur la philosophie produit

Le manifeste dit : *"présence calme qui rend la décision lisible"*. Le produit doit être stable, sobre, fiable.

Le PDF introduit une tension avec ce principe sur deux niveaux :

**Niveau 1 — fiabilité implicite.** L'opérateur qui importe un PDF reçoit exactement le même score, le même coaching, la même analyse que s'il avait importé un CSV. Caméléon ne lui signale pas que la donnée a été reconstruite par un algorithme de clustering. Il n'a aucun moyen de savoir que son score repose sur une extraction positionnelle plutôt que sur un parsing direct. Cette opacité est confortable à court terme. Elle est risquée si le parsing se dégrade sans le signaler.

**Niveau 2 — cohérence du signal.** La doctrine du produit repose sur la précision. Un score de 65/100 doit signifier quelque chose de précis. Si ce score est calculé sur des données partiellement mal extraites (un clustering Y raté sur une page, une ligne fusionnée), la précision du signal est compromise sans que personne le sache.

Le PDF ne nuit pas à la philosophie si — et seulement si — sa qualité d'extraction est traçable et exposable. Ce n'est pas le cas par défaut en V1.

---

## D. Risques long terme

**R1 — Rupture silencieuse de parsing.** Binance met à jour son moteur PDF d'export. Le parsing continue de fonctionner mais extrait des données fausses ou incomplètes. L'opérateur voit un score. Le score est construit sur des déchets. Ce risque est non détectable sans corpus de référence frais.

**R2 — Dette de maintenance croissante.** Chaque nouvelle famille PDF (Earn, Futures, Margin, Wallet) exige un cycle complet : détection → extraction → normalisation → tests terrain. Le coût marginal est élevé. Le risque de régression sur les familles existantes augmente à chaque extension.

**R3 — Confusion utilisateur.** L'opérateur qui importe un CSV obtient le même résultat que celui qui importe un PDF du même dataset. Si un écart apparaît un jour (parsing dégradé, famille non détectée, colonne manquante), l'opérateur n'a aucun outil pour comprendre d'où vient la différence. La source est opaque dans l'UI.

**R4 — Cannibalisation du CSV.** Si le PDF est présenté comme équivalent au CSV dans l'UI, certains opérateurs n'exporteront plus que des PDF. Si le parsing se dégrade, ils n'ont plus de fallback évident.

**R5 — Expansion incontrôlée.** Chaque signal terrain suivant crée une pression naturelle d'extension vers Earn, Futures, Margin. Sans garde-fou explicite, la doctrine d'intégration progressive peut être érodée par accumulation de cas "légitimes". Chaque extension augmente la surface de fragilité et le coût de maintenance.

---

## E. Options stratégiques

**Option A — PDF = format de dernier recours, signal dégradé**

Le PDF est accepté mais signalé explicitement comme source moins fiable. L'UI affiche un avertissement visible ("Données extraites par lecture PDF — précision réduite"). Le score PDF peut être légèrement annoté.

- Avantages : honnêteté architecturale. Cohérence avec la philosophie de signal précis. Protection contre la confusion utilisateur.
- Inconvénients : friction à l'import. Risque que l'opérateur perçoive le PDF comme "moins bon" alors que la qualité est correcte sur le corpus actuel.
- Convient si : on considère que la fragilité du PDF est un risque réel à communiquer dès maintenant.

---

**Option B — PDF = format de confort, traité à parité (statu quo)**

Le PDF est traité exactement comme le CSV. Aucun signal différentiel dans l'UI. La qualité d'extraction est gérée en interne (gardes SCANNED/UNREADABLE) mais non exposée.

- Avantages : UX fluide. Pas de friction. Cohérence perçue entre formats.
- Inconvénients : risque R1 (rupture silencieuse) non mitigé. Risque R3 (confusion) non adressé.
- Convient si : on accepte que le PDF soit une porte d'entrée pratique et qu'on maintienne le corpus de référence à chaque version Binance.

---

**Option C — PDF = format explicitement documenté, qualité tracée**

Le PDF est accepté, traité à parité fonctionnelle, mais la qualité d'extraction est exposée de manière sobre. Ex. : "Source : PDF · Qualité : NATIVE · 32 trades lus". L'opérateur voit que le PDF a été lu correctement. Si la qualité est DEGRADED, le signal change discrètement. Ce métadonnée est accessible dans le debug panel.

- Avantages : honnêteté sans friction. Trace exploitable si régression. Cohérence avec la doctrine de signal précis. Défendable si un écart CSV/PDF apparaît.
- Inconvénients : nécessite un chantier UX spécifique (UX-PDF-03 ou équivalent).
- Convient si : on considère que la traçabilité de la source est une valeur produit.

---

## F. Recommandation finale

**Option C est la plus cohérente avec la doctrine du produit.**

La philosophie de Caméléon repose sur la précision du signal, pas sur sa commodité. Traiter le PDF à parité absolue (Option B) revient à ne pas dire à l'opérateur quelque chose qu'il devrait savoir : ses données ont été reconstruites, pas lues directement.

Option A surestime le risque actuel — le corpus B1-B19 prouve que le parsing est fiable sur les familles observées. Signaler un "format dégradé" serait inexact et créerait de la méfiance injustifiée.

Option C dit la vérité de manière sobre : *voici la source, voici la qualité de lecture, voici le nombre de trades extraits*. Si demain Binance change son format PDF et que la qualité passe à DEGRADED, l'opérateur le voit immédiatement. Si la qualité est NATIVE et 32/32 trades extraits, il a la confirmation que son import est fiable.

**Recommandation concrète :**
1. Maintenir V1 fonctionnel tel quel (statu quo fonctionnel)
2. Ajouter, dans un chantier UX dédié, une mention sobre de la source et de la qualité d'extraction dans le résultat d'import
3. Maintenir le corpus de référence (`b8.pdf`, `b3.pdf`) enrichi périodiquement comme détecteur de régression
4. Ne pas étendre les familles PDF sans signal terrain réel — la doctrine d'intégration progressive s'applique avec plus de rigueur encore au PDF qu'au CSV

**Le PDF est une porte d'entrée légitime. Ce n'est pas une source de première intention. Cette hiérarchie mérite d'être visible — discrètement, mais clairement.**
