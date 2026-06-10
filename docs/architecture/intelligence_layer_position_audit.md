# Phase Intelligence — Position Officielle

**Caméléon Engine · Document d'architecture**
**Date : 2026-06-10 · Statut : AUDIT — EN ATTENTE DE VALIDATION**

> Ce document répond à une seule question :
> "Quelles formes d'intelligence sont autorisées, interdites ou différées dans Caméléon Engine ?"
>
> Aucun code. Aucune UI. Aucun modèle. Aucun fournisseur. Architecture uniquement.

---

## 1. Mission

Caméléon Engine accumule, depuis sa première session, un corpus comportemental personnel. Ce corpus contient des sessions, des postures, des patterns, des états émotionnels, des contextes macro, des profils opérateur. Il grandit avec chaque usage.

Ce corpus ne parle pas encore. Il stocke.

La Phase Intelligence est le moment où ce corpus commence à révéler ce qu'il contient.

**Ce que la Phase Intelligence doit apporter :**

Pas de nouvelles décisions. Pas de nouveaux verdicts. Pas de signaux supplémentaires. Elle doit apporter une seule chose : la capacité de voir ce qui se répète, ce qui corrèle, ce qui évolue — dans l'historique personnel de l'opérateur.

**La contrainte fondatrice :**

> "Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre."

La Phase Intelligence ne prend jamais la décision. Elle ne remplace jamais le moteur. Elle ne devient jamais un système de signaux. Cette contrainte est immuable et s'applique à chaque forme d'intelligence évaluée dans ce document.

---

## 2. Frontière — Moteur, Mémoire, Intelligence

Avant de définir ce qu'est la Phase Intelligence, il faut définir ce qu'elle n'est pas.

### Ce que fait le Moteur

Le Moteur calcule. Il prend 16 champs en entrée et produit un score, une posture, des actions autorisées, un verdict. Il est souverain, stateless, présent. Il répond toujours à la même question : **"Que montrent ces données maintenant ?"**

Le Moteur ne connaît pas hier. Il ne connaît pas demain. Il n'a pas de mémoire.

### Ce que fait la Mémoire

La Mémoire stocke. Elle accumule les sessions, les imports, les snapshots, les états comportementaux. Elle est passive — elle ne réfléchit pas. Elle répond à : **"Qu'a-t-on enregistré ?"**

La Mémoire ne détecte pas. Elle ne corrèle pas. Elle conserve.

### Ce que fait l'Intelligence

L'Intelligence observe. Elle traverse la Mémoire pour détecter ce qui se répète, ce qui corrèle, ce qui évolue. Elle répond à : **"Qu'est-ce qui se passe dans la durée chez cet opérateur ?"**

L'Intelligence ne décide pas. Elle ne calcule pas de score. Elle ne produit pas de verdict. Elle révèle.

| Dimension | Moteur | Mémoire | Intelligence |
|---|---|---|---|
| Temporalité | Présent uniquement | Archive passive | Trajectoire dans le temps |
| Action | Calcule et décide | Stocke | Observe et révèle |
| Question | "Que montrent ces données ?" | "Qu'a-t-on enregistré ?" | "Qu'est-ce qui se répète ?" |
| Souveraineté | Absolue | Neutre | Nulle — jamais directive |
| Horizon | Immédiat | Illimité | 6 à 24 mois minimum |

La frontière est claire. Elle ne doit jamais être franchie dans les deux sens : l'Intelligence ne commande pas le Moteur, et le Moteur n'est pas enrichi par l'Intelligence.

---

## 3. Intelligence autorisée

### Détection de récurrences comportementales

L'Intelligence peut observer qu'un pattern se répète dans l'historique personnel de l'opérateur. "Sur tes 60 dernières sessions, le pattern Suractivité a été détecté dans 40% des cas." Cette observation décrit une réalité — elle ne la commente pas, elle ne la juge pas.

**Règle :** formulation au passé observé uniquement. Jamais de projection.

### Observation de patterns temporels

L'Intelligence peut identifier des concentrations temporelles. "Tes sessions en profil ACTIF se concentrent sur certaines plages de la semaine." Cette information est descriptive. Elle aide l'opérateur à se voir — elle ne lui dit pas quoi faire.

**Règle :** décrire la distribution, jamais inférer l'intention.

### Contextualisation historique

L'Intelligence peut fournir un contexte historique au verdict moteur. "Dans des conditions similaires sur les 6 derniers mois, tu as ajusté ton verdict dans 3 cas sur 5." C'est un miroir, pas un conseil.

**Règle :** la contextualisation est subordonnée au verdict Moteur. Elle ne le précède jamais. Elle ne le modifie jamais.

### Corrélations comportement × contexte

L'Intelligence peut corréler le comportement observé avec le contexte de la session : régime Macro, profil opérateur, état émotionnel déclaré. "En régime CONTRACTÉ, ton score comportemental tend à être plus bas qu'en régime EXPANSIF."

**Règle :** corrélation n'est pas causalité. Le vocabulaire doit le refléter — "tend à", "a été observé", jamais "provoque" ni "explique".

### Évolution dans le temps

L'Intelligence peut décrire une trajectoire. "Sur 12 mois, la fréquence du pattern Impulsif a diminué de 40%." C'est une observation de l'opérateur par lui-même sur durée.

**Règle :** la trajectoire décrit un déplacement observé. Elle ne prescrit pas de direction.

### Mémoire personnelle exploitée

L'Intelligence peut produire des lectures personnalisées à partir du corpus propre de l'opérateur. Ces lectures sont exclusives — elles ne peuvent exister nulle part ailleurs parce qu'elles dépendent d'un historique unique.

**Règle :** toute lecture personnalisée doit passer le test MIR-01 (décrire, ne pas juger) et le test Manifeste.

### Doctrine du seuil de confiance — règle permanente

Toute corrélation ou lecture Intelligence repose sur un nombre minimum d'observations. Ce seuil sera calibré terrain — il n'est pas fixé ici. Mais le principe est figé.

**Une intelligence basée sur trop peu de sessions est interdite, même si elle paraît intéressante.** Le système doit préférer ne rien afficher plutôt qu'afficher une corrélation fragile avec le poids d'autorité que lui confère le système.

La rareté des lectures n'est pas seulement une propriété de design UX — c'est une règle architecturale. Afficher peu, afficher juste, afficher seulement ce qui repose sur un corpus suffisant.

**Règle :** aucune corrélation n'est présentée à l'opérateur si elle ne satisfait pas le seuil minimum d'observations en vigueur. Incertitude explicite obligatoire quand le seuil est proche.

---

## 4. Intelligence interdite

Ces formes d'intelligence sont incompatibles avec l'architecture, le Manifeste, ou la philosophie produit. L'interdiction est permanente pour certaines, structurelle pour d'autres.

### Prédiction de marché

**Interdit — incompatible avec le Manifeste.**

L'Intelligence n'émet jamais de prédiction sur l'évolution d'un actif, d'un secteur, ou d'un régime systémique. Aucune formulation du type "le marché devrait", "il est probable que", "dans ce contexte, attendez-vous à". Cette interdiction couvre également les prédictions déguisées en probabilités.

### Signaux d'achat ou de vente

**Interdit — incompatible avec la mission fondatrice.**

L'Intelligence ne produit jamais d'instruction d'action sur un marché. Pas de "acheter X", pas de "réduire l'exposition", pas de "sortir de la position". Toute formulation qui oriente une décision de marché viole le Manifeste dans sa forme la plus directe.

### Notation de l'utilisateur

**Interdit — incompatible avec la doctrine.**

L'Intelligence ne produit pas de note sur "la qualité" de l'opérateur. Pas de score de qualité décisionnelle, pas de grade comportemental, pas d'évaluation de la performance. L'opérateur n'est jamais noté par le système.

### Scoring de performance

**Interdit — incompatible avec la doctrine comportement × contexte.**

L'Intelligence ne croise jamais le comportement avec les résultats financiers. Elle ne sait pas si une décision a été "bonne" ou "mauvaise" en termes de PnL. La séparation comportement / résultat est structurelle et permanente.

### Classement des utilisateurs

**Interdit — incompatible avec l'architecture des 3 espaces mémoire.**

L'Intelligence n'établit pas de classement inter-utilisateurs. Elle ne compare jamais l'opérateur à d'autres opérateurs dans son espace privé. La Bibliothèque Vivante (Espace 2, opt-in) produit des patterns agrégés anonymisés — jamais des classements.

### Optimisation automatique

**Interdit — prend la décision à la place de l'opérateur.**

L'Intelligence ne modifie jamais automatiquement les paramètres, les profils, les seuils, ou les comportements du moteur en fonction de l'historique. Toute évolution du système est une décision explicite de l'opérateur ou du développeur — jamais du système lui-même.

### Recommandation automatique d'ordres

**Interdit — violation directe du Manifeste.**

L'Intelligence ne formule jamais de recommandation sur un ordre à passer. C'est la forme la plus directe de "prendre la décision" — incompatible avec chaque principe fondateur du produit.

---

## 5. Intelligence différée

Ces formes d'intelligence sont cohérentes avec la philosophie mais prématurées en V1. Elles nécessitent des prérequis non satisfaits aujourd'hui.

### Bibliothèque Vivante

Agrégation anonymisée de patterns comportementaux provenant de plusieurs opérateurs (opt-in explicite, irréversible). Nécessite N≥10 opérateurs opt-in avec historique suffisant. Différée après validation terrain.

### Intelligence collective anonymisée

"Chez les opérateurs avec un profil similaire, ce pattern a été observé dans X% des cas." Différée après Bibliothèque Vivante opérationnelle. Règle anti-horoscope : aucun pattern présenté si extrait de moins de 10 cas distincts.

### Apprentissage comportemental avancé

Détection de signatures comportementales personnelles sur 24+ mois : clusters temporels, déclencheurs récurrents, évolutions de posture. Différé après mémoire longue opérationnelle et corpus suffisant.

### Corrélations multi-utilisateurs

Croisement de patterns entre opérateurs pour identifier des régularités universelles ou des profils-types. Différé — nécessite la Bibliothèque Vivante, le consentement explicite, et un corpus significatif.

---

## 6. Risques

### R-INT-01 — Illusion de prédiction

Le risque le plus structurel. Une corrélation observée dans l'historique est interprétée comme une prédiction. "Tu as toujours été Impulsif en régime EXPANSIF" devient "tu vas être Impulsif demain en EXPANSIF". Cette glissement est invisible et psychologiquement naturel.

**Mitigation :** vocabulaire strict — passé observé uniquement. Test Manifeste obligatoire sur chaque lecture. Aucune formulation au futur dans les surfaces Intelligence.

### R-INT-02 — Illusion de causalité

Une corrélation entre deux observations n'implique pas que l'une cause l'autre. "Tes sessions courtes corrèlent avec un score comportemental élevé" ne signifie pas que la durée cause le score.

**Mitigation :** vocabulaire de corrélation strict — "a été observé avec", "tend à coexister avec", jamais "provoque" ni "est dû à".

### R-INT-03 — Effet oracle

Le système accumule suffisamment d'historique pour paraître "connaître" l'opérateur. L'opérateur commence à lui attribuer une autorité qu'il n'a pas. Il attend que le système lui dise quoi faire.

**Mitigation :** règle MIR-04 — la rareté des lectures est une propriété de design. Moins l'Intelligence parle, plus ce qu'elle dit a de poids. Un système qui parle en permanence dilue son autorité et crée la dépendance.

### R-INT-04 — Dépendance cognitive

L'opérateur délègue progressivement sa réflexion au système. Il ne remplit plus le formulaire pour se voir — il le remplit pour recevoir une lecture. La finalité s'inverse.

**Mitigation :** l'Intelligence doit toujours renvoyer vers l'opérateur, jamais vers le système. "Tu as tendance à" (renvoi vers soi) plutôt que "le système indique que" (renvoi vers l'oracle).

### R-INT-05 — Délégation de responsabilité

"Le moteur m'a conseillé" devient une excuse. L'opérateur transfère la responsabilité de ses décisions au système. C'est la forme la plus dangereuse de la dérive — elle n'est pas dans le code, elle est dans l'usage.

**Mitigation :** règle MIR-02 — l'Intelligence ne déduit jamais l'intention à partir du comportement observé. Elle décrit, jamais ne juge ni ne justifie.

### R-INT-06 — Dérive coach

L'Intelligence commence à formuler des conseils comportementaux. "Pour améliorer ton score, tu devrais..." C'est le glissement du miroir vers le prescripteur.

**Mitigation :** test anti-prescription obligatoire sur chaque formulation — "cette phrase décrit-elle ce qui s'est passé ou dit-elle ce que l'opérateur devrait faire ?"

### R-INT-07 — Dérive signal

Les lectures comportementales personnelles commencent à ressembler à des signaux de marché. "Chaque fois que tu as eu ce pattern, le marché était en EXPANSIF." L'implication est évidente même sans la formuler.

**Mitigation :** séparation structurelle comportement / marché. L'Intelligence ne croise jamais les lectures comportementales avec des observations de prix, de tendance ou de timing de marché.

### R-INT-08 — Prescription passive par accumulation de confiance

Une corrélation répétée sur une longue durée peut devenir cognitivement prescriptive même si le texte reste descriptif. "En régime CONTRACTÉ, ton score comportemental a été bas dans 75% des 200 sessions observées" est observatoire. L'opérateur le lit comme une règle.

Le vocabulaire seul ne protège pas contre ce mécanisme. Sur 24 mois de données, une corrélation robuste exerce une autorité que les formules précautionneuses ne neutralisent pas.

**La protection doit être architecturale, pas lexicale :** seuil minimum d'observations (doctrine §3), rareté des lectures comme règle (pas seulement design), incertitude explicite affichée avec chaque lecture. Ces trois éléments ensemble constituent la protection contre la prescription passive. Aucun des trois ne suffit isolément.

---

## 7. Relation avec la Couche Macro

La Couche Macro et la Phase Intelligence partagent la même dépendance fondatrice : toutes deux nécessitent un historique de sessions long. Mais elles ne font pas la même chose.

**Ce que la Macro apporte à l'Intelligence :** chaque session loggée porte un `macro_state`. Cet état est la matière première des corrélations comportement × régime. La Macro fournit le contexte systémique que l'Intelligence peut croiser avec le comportement.

**Ce que l'Intelligence apporte à la Macro :** rien, dans la direction de calcul. MACRO-RULE-01 est immuable : le `macro_state` est calculé indépendamment de tout historique comportemental. L'Intelligence lit le résultat de la Macro — elle ne l'influence jamais.

**La règle de coexistence :** Macro et Intelligence s'alimentent l'une l'autre dans une seule direction. La Macro produit des états que l'Intelligence observe sur durée. L'Intelligence produit des corrélations que l'opérateur peut interpréter à la lumière de son usage de la Macro. Le calcul de la Macro reste souverain.

**Ce qui ne change pas :** MACRO-RULE-01 intégrale. L'Intelligence ne modifie jamais `macro_state`, ne contourne jamais la règle de consensus, et ne produit jamais un "macro_state alternatif" à partir de l'historique comportemental.

---

## 8. Relation avec le Constellium

Le Constellium Sens B est défini comme "l'histoire vivante d'un opérateur dans le temps". La Phase Intelligence est ce qui anime cette histoire.

**L'Intelligence nourrit le Constellium :** les corrélations, les patterns, les trajectoires produites par la Phase Intelligence sont la matière des modules futurs du Constellium — Miroir Vivant, Empreinte Opérateur™, Bibliothèque Vivante. Sans Intelligence active, le Constellium est une vision sans contenu.

**Le Constellium ne nourrit pas l'Intelligence :** le Constellium est une couche d'expression (Couche 5) et une application-cadre (Sens B). Il ne produit pas de données comportementales. La relation est unidirectionnelle : Intelligence → Constellium.

**Conséquence architecturale :** la Phase Intelligence doit précéder les modules avancés du Constellium dans la séquence de construction. On ne peut pas construire le Miroir Vivant sans que l'Intelligence soit capable de lire la mémoire longue.

---

## 9. Conditions bloquantes

Aucune Phase Intelligence ne s'ouvre avant :

- ☐ Compte utilisateur actif — sans identité stable, aucune mémoire personnelle n'existe côté serveur
- ☐ Mémoire longue opérationnelle côté serveur — le corpus local FIFO ne suffit pas
- ☐ Logging stable — `schemaVersion` figé dans les sessions avant accumulation longue durée
- ☐ Volume minimum atteint — les lectures comportementales exigent un corpus suffisant (seuil à calibrer terrain, indicatif : 50–100 sessions minimum pour les premières observations)
- ☐ Matrice Gratuit/Premium décidée — les lectures Intelligence sont probablement premium ; définir la frontière avant de construire
- ☐ Règles MIR-01→04 intégrées — toute lecture comportementale doit les respecter avant d'être exposée
- ☐ Export serveur garanti — la portabilité des données Intelligence est une condition de confiance

---

## 10. Verdict

**La Phase Intelligence est — C. Une couche d'observation.**

Elle n'est pas un nouveau moteur : elle ne calcule pas de score, ne produit pas de posture, ne décide pas.

Elle n'est pas une mémoire enrichie : la mémoire stocke sans observer. L'Intelligence traverse la mémoire pour y détecter ce que le regard humain ne peut pas voir sur durée.

Elle n'est pas un système de signaux : elle ne dit jamais quoi faire, jamais quoi éviter, jamais quand agir.

Elle est un observatoire personnel — une couche qui lit l'historique de l'opérateur pour lui révéler ce qu'il ne voit pas lui-même dans la durée.

**Définition officielle :**

> La Phase Intelligence est un observatoire personnel : elle révèle ce que la mémoire contient, sans jamais décider de ce que l'opérateur doit faire.

---

## Résumé exécutif

**Décision la plus importante**
La Phase Intelligence est une couche d'observation — jamais un moteur, jamais un système de signaux. Elle révèle ce qui se répète dans l'historique personnel. Elle ne décide pas, ne prescrit pas, ne prédit pas. Cette définition est le filtre contre toute dérive future.

**Découverte la plus importante**
L'intelligence interdite représente la majorité des usages "attendus" par un marché habitué aux outils de signaux. Prédiction, recommandation, optimisation automatique, notation — tout ce qu'un utilisateur non formé pourrait attendre d'un système "intelligent" est explicitement interdit. La valeur différenciante de Caméléon Engine est précisément dans ce refus.

**Risque principal**
L'effet oracle (R-INT-03) combiné à la dérive signal (R-INT-07) : le système accumule suffisamment d'historique pour paraître prédictif, et les lectures comportementales commencent à ressembler à des signaux de timing. Ce glissement est invisible dans le code — il se produit dans la perception de l'opérateur. La rareté des lectures est la seule protection efficace.

**Condition bloquante principale**
Mémoire longue opérationnelle côté serveur (elle-même conditionnée au Compte Utilisateur). Sans corpus personnel suffisant et durable, toute Phase Intelligence produirait des lectures fragiles et potentiellement trompeuses.

**Verdict final**
La Phase Intelligence est l'étape qui transforme l'historique accumulé en connaissance personnelle. Elle est cohérente avec le Manifeste à condition de rester strictement observatoire. Elle ne s'ouvre qu'après mémoire longue opérationnelle, compte utilisateur actif, et règles MIR-01→04 intégrées. Sa définition officielle est immuable : révéler ce que la mémoire contient, sans jamais décider de ce que l'opérateur doit faire.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `macro_layer_doctrine_v1.md` · `user_memory_long_term_audit.md` · `user_account_phaseA_audit.md` · `constellium_position_audit.md`*
