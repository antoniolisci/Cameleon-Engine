# Caméléon Knowledge Governance V1

**Statut :** Doctrine permanente · N1  
**Identifiant :** CAMELEON_KNOWLEDGE_GOVERNANCE_V1  
**Famille :** Doctrines fondatrices  
**Date :** 2026-08-25  
**Hiérarchie :** N1 — Doctrine (cf. Hiérarchie doctrinale officielle N0–N5)

---

## §1 — Identité et statut

Ce document est une doctrine permanente de niveau N1.

Il définit les invariants qui gouvernent ce que Caméléon Engine est autorisé à considérer comme connaissance canonique, les conditions d'acquisition de ce statut, et les règles de préservation de la lignée entre les transformations techniques successives.

Ce document ne définit pas des fonctionnalités. Il définit les règles qui gouvernent la production, la qualification et la préservation de la connaissance dans Caméléon Engine.

---

## §2 — Périmètre

Les invariants définis dans ce document s'appliquent :

- à toute production de connaissance par le moteur, quel que soit le module source ;
- à toute transformation ou migration de connaissance existante ;
- à toute représentation dérivée d'une connaissance canonique ;
- à tout sous-système automatisé produisant des sorties susceptibles d'être réintégrées comme entrées.

Ces invariants ne s'appliquent pas :

- à la connaissance runtime, définie au §4, qui est par nature éphémère et hors périmètre canonique ;
- aux données de session non persistées, qui n'entrent jamais dans le registre canonique.

---

## §3 — Fondements et relations doctrinales

Ce document s'inscrit dans la continuité de trois documents N1 existants et d'une doctrine de provenance N2.

**[GIT_FACT]** La Constitution Intellectuelle V1 (`docs/doctrine/CAMELEON_INTELLECTUAL_CONSTITUTION_V1.md`) établit que toute fonctionnalité impliquant une production de lecture doit démontrer sa non-contradiction avec les dix doctrines fondatrices. Knowledge Governance V1 opère dans ce cadre : il n'en modifie aucune doctrine, il précise les conditions de production de la connaissance.

**[GIT_FACT]** ICI-01 (`docs/doctrine/INVARIANT_ICI_01_V1.md`) établit que l'accumulation comportementale ne doit jamais, par elle-même, augmenter l'autorité décisionnelle ou exécutive du système sur l'humain. Knowledge Governance V1 opère sur le périmètre épistémique — il gouverne la qualification de la connaissance, non l'autorité du système.

**[GIT_FACT]** La doctrine de provenance (LOT-P1-2.4) établit trois règles de provenance pour les traces mémorielles canoniques : source=obligatoire · date=produite par la couche · contexte=optionnel. Knowledge Governance V1 est compatible avec cette doctrine. KG-08 en étend la portée à la préservation de la lignée lors des migrations techniques.

**[GIT_FACT]** REGISTRY_DNA_V1 (`docs/doctrine/REGISTRY_DNA_V1.md`) formalise quatre propriétés architecturales constitutives : DNA-01 Silence Structurel · DNA-02 Validation Humaine Obligatoire · DNA-03 Intelligence Temporelle · DNA-04 Validation Indépendante. Les niveaux HUMAN et INDEPENDENT de la taxonomie KG-06 (§8) entretiennent une continuité conceptuelle avec DNA-02 et DNA-04 respectivement. KG-06 opère sur le périmètre épistémique (statut d'une connaissance) ; les DNA opèrent sur le périmètre architectural (propriétés du système). La cohérence entre ces deux registres est intentionnelle et doit être maintenue lors de toute évolution de l'un ou de l'autre.

---

## §4 — Définitions

**Connaissance canonique :** une connaissance est dite **canonique** lorsqu'elle satisfait aux conditions de production définies par le présent document (cf. §8 pour les conditions d'acquisition du statut canonique). Elle est durable, identifiable, et possède une lignée reconstituable.

**Connaissance runtime :** donnée produite au cours d'une exécution, non persistée de façon intentionnelle dans le registre canonique. Elle est éphémère par définition. Elle ne peut pas être réintégrée comme connaissance canonique sans passer par les conditions d'acquisition définies au §8.

**Lignée :** chaîne de provenance d'une connaissance, depuis sa source d'origine jusqu'à sa forme courante, incluant les transformations intermédiaires documentées. Une lignée est intègre lorsqu'aucun maillon n'a été supprimé ni silencieusement modifié.

**Invalidation :** opération par laquelle une connaissance canonique est marquée comme non valide à compter d'un instant donné. Une connaissance invalidée est préservée avec son marqueur d'invalidation. Elle ne peut pas être effacée sans rompre la lignée.

**Statut épistémique :** qualification formelle de la connaissance selon la méthode qui l'a produite. Le statut détermine les conditions d'utilisation de la connaissance dans une lecture.

**Substrat de stockage :** support technique dans lequel la connaissance est persistée. Le substrat peut être remplacé ; la lignée ne peut pas être détruite lors de ce remplacement.

---

## §5 — Position dans la chaîne doctrinale

Knowledge Governance V1 est une doctrine N1. Elle complète la Constitution Intellectuelle V1 sans en modifier aucun article.

**P-01 [GIT_FACT]** La Constitution Intellectuelle V1 définit dix doctrines gouvernant la manière dont Caméléon Engine est autorisé à produire une lecture. Elle ne définit pas les conditions de qualification de la connaissance qui alimente ces lectures. Ce gap est le périmètre de Knowledge Governance V1.

**P-02 [CORPUS_INFERENCE]** À mesure que Caméléon Engine accumule des traces mémorielles, comportementales et analytiques, la question de ce qui constitue une connaissance légitime devient architecturalement critique. Une accumulation sans gouvernance crée une dérive épistémique silencieuse.

**P-03 [DOCTRINAL_RULE]** Knowledge Governance V1 établit que le statut canonique n'est pas une propriété intrinsèque d'une donnée — il est produit par la méthode qui l'a générée. Une donnée produite sans méthode validée ne peut pas prétendre au statut canonique.

**P-04**

[GIT_FACT] ICI-01 établit que l'accumulation comportementale ne doit jamais, par elle-même, augmenter l'autorité décisionnelle ou exécutive du système sur l'humain.

[DOCTRINAL_RULE] Knowledge Governance V1 complète ce principe dans son propre périmètre : aucune connaissance canonique ne déclenche automatiquement une action ou une décision à la place de l'humain.

---

## §6 — Les cinq invariants fondamentaux

Les cinq invariants suivants sont les seuls retenus après l'audit des candidats KG-01 à KG-08 et les décisions humaines closes au §19.

| Identifiant | Nom | Formulation condensée |
|---|---|---|
| KG-01 | READ PATH ≠ WRITE PATH | Les chemins de lecture et d'écriture de la connaissance canonique doivent être architecturalement distincts |
| KG-02 | CANONICAL ≠ RUNTIME | L'état runtime ne peut pas être substitué à la connaissance canonique |
| KG-03 | INVALIDATED ≠ CURRENT | Une connaissance invalidée est préservée avec son marqueur — elle n'est pas effacée |
| KG-06 | PRODUCTION METHOD → STATUS | Le statut épistémique d'une connaissance dépend de la méthode qui l'a produite |
| KG-08 | TECHNOLOGY REPLACEABILITY ≠ LINEAGE DESTRUCTION | Le substrat peut être remplacé ; la lignée doit être préservée intégralement |

Ces cinq invariants sont indépendants. Aucun n'absorbe un autre. Leurs périmètres respectifs sont définis aux §9 à §16.

---

## §7 — Les trois corollaires

Les trois corollaires suivants découlent formellement des invariants fondamentaux. Ils ont été maintenus distincts après contre-audit adversarial, car chacun couvre un vecteur d'échec que l'invariant parent ne couvre pas seul.

**KG-04 — Anti-autoréférentialité** (corollaire de KG-01)

Un sous-système ne peut pas utiliser ses propres sorties comme source de preuve indépendante pour les mêmes sorties. L'autoréférentialité rompt l'indépendance du chemin de validation même lorsque KG-01 (séparation read/write) est formellement respecté.

[HUMAN_DECISION] KG-04 est maintenu comme corollaire de KG-01 et non comme invariant autonome. Sa formulation et sa portée sont liées à celles de KG-01. Toute révision de KG-01 exige une réévaluation explicite de la validité et de la portée de KG-04. KG-04 est défini comme corollaire formel de KG-01 — une modification du périmètre de KG-01 modifie par implication le périmètre de KG-04.

---

**KG-05 — Intégrité de récupération** (corollaire de KG-02)

Le mécanisme de récupération de la connaissance canonique ne peut pas altérer silencieusement le contenu sémantique de ce qu'il récupère. Une récupération qui transforme ou filtre sans traçabilité viole KG-02 même lorsque la connaissance canonique originale est intacte.

[HUMAN_DECISION] KG-05 est maintenu comme corollaire de KG-02 et non comme invariant autonome.

---

**KG-07 — Fidélité de projection** (corollaire de KG-02)

Une représentation dérivée d'une connaissance canonique doit rester fidèle à sa source canonique en permanence. Une représentation qui diverge silencieusement de sa source viole KG-02 même en l'absence de staleness au sens de KG-03 et en l'absence de duplication au sens de CONST-I11.

[HUMAN_DECISION] KG-07 est maintenu comme corollaire de KG-02 et non comme invariant autonome.

---

## §8 — Taxonomie KG-06 : conditions d'acquisition du statut canonique

KG-06 établit que le statut épistémique d'une connaissance dépend de la méthode qui l'a produite. Quatre niveaux de canonicité sont définis.

### CANONICAL BY DEFINITION

Une connaissance est canonique par définition lorsqu'elle résulte d'une décision humaine explicite documentée dans le registre doctrinal du projet, ou d'une observation primaire directement et explicitement saisie par l'opérateur — dans les deux cas, l'humain est la source de la connaissance et aucune validation externe n'est requise.

[GIT_FACT] Les invariants du présent document sont canoniques par définition — ils résultent de décisions humaines closes et documentées au §19.

---

### CANONICAL AFTER DETERMINISTIC VALIDATION

Une connaissance est canonique après validation déterministe lorsqu'elle est produite par un algorithme dont la sortie est entièrement déterminée par son entrée — une même entrée produit toujours une même sortie, sans intervention humaine ni validation externe.

Dans cette définition, l'entrée comprend l'ensemble des données effectivement consommées par l'algorithme. Un composant dont la sortie dépend d'un état mémoriel variable ne relève pas de cette catégorie du seul fait que son code est déterministe.

[IMPLEMENTATION_CONSEQUENCE — NON PRESCRIPTIVE] Le parser S1 des fichiers transactionnels relève de cette catégorie dans son périmètre de Phase A.

---

### CANONICAL AFTER INDEPENDENT VALIDATION

Une connaissance est canonique après validation indépendante lorsqu'elle est produite par un processus dont le résultat est vérifié par une source ou une méthode indépendante de la source initiale.

[IMPLEMENTATION_CONSEQUENCE — NON PRESCRIPTIVE] Le schéma S2 ontologique, après réconciliation avec des sources indépendantes, relève de cette catégorie.

---

### CANONICAL AFTER HUMAN VALIDATION

Une connaissance est canonique après validation humaine lorsque sa production repose sur un modèle externe ou opaque dont le comportement n'est pas entièrement déterministe pour l'opérateur, et qu'une validation humaine explicite est requise avant canonisation.

[IMPLEMENTATION_CONSEQUENCE — NON PRESCRIPTIVE] S3 — extraction visuelle automatisée reposant sur un modèle externe ou opaque — relève de cette catégorie.

---

**Note sur la portée de KG-06 :**

La taxonomie ci-dessus décrit les conditions de production requises pour chaque niveau. Elle ne constitue pas une hiérarchie de valeur ou d'autorité entre les niveaux. Une connaissance canonique par définition n'est pas plus précieuse qu'une connaissance canonique après validation déterministe — elle répond simplement à une méthode de production différente. Toute question portant sur la comparaison de valeur entre niveaux relève d'une décision documentée dans le périmètre compétent.

Les niveaux HUMAN et INDEPENDENT entretiennent une continuité conceptuelle avec DNA-02 (Validation Humaine Obligatoire) et DNA-04 (Validation Indépendante) tels que définis dans `docs/doctrine/REGISTRY_DNA_V1.md`. KG-06 n'est pas une transposition de ces DNA — il opère sur le périmètre épistémique, tandis que DNA-02 et DNA-04 opèrent sur le périmètre architectural. La cohérence entre les deux registres est intentionnelle et doit être maintenue lors de toute évolution de l'un ou de l'autre.

---

## §9 — KG-01 : READ PATH ≠ WRITE PATH

**Formulation canonique :**

> Les chemins de lecture et d'écriture de la connaissance canonique doivent être architecturalement distincts. Un système qui peut produire de la connaissance canonique à partir de ses propres sorties opère une boucle qui, à terme, peut rendre toute erreur locale globalement canonique.

**Périmètre :** tout module produisant de la connaissance destinée à être persistée ou réintégrée.

**Condition de violation :** un module lit sa propre sortie persistée comme entrée pour produire une nouvelle connaissance canonique sans franchir une barrière de validation externe.

**Rapport aux corollaires :** KG-04 (anti-autoréférentialité) complète KG-01 en couvrant le vecteur de self-référentialité dans les sous-systèmes analytiques complexes, où KG-01 peut être formellement respecté tout en autorisant une boucle de renforcement épistémique.

[HUMAN_DECISION] KG-01 est adopté dans sa formulation prospective : les chemins doivent être conçus séparément dès l'origine, pas seulement maintenus séparément a posteriori.

---

## §10 — KG-02 : CANONICAL ≠ RUNTIME

**Formulation canonique :**

> L'état runtime est éphémère par définition. La connaissance canonique est durable par définition. Les confondre dégrade les deux.

**Périmètre :** tout module accédant simultanément à de la connaissance canonique persistée et à de l'état runtime de session.

**Condition de violation :** un état runtime est utilisé comme substitut à une connaissance canonique sans passer par les conditions d'acquisition du §8, ou une connaissance canonique est traitée comme un état runtime et modifiée sans traçabilité.

**Rapport aux corollaires :** KG-05 (intégrité de récupération) complète KG-02 en couvrant le vecteur de dérive lors de la récupération — la connaissance canonique est intacte, mais le mécanisme de récupération la transforme silencieusement. KG-07 (fidélité de projection) complète KG-02 en couvrant le vecteur de divergence entre représentation dérivée et source canonique — la source est intacte, mais la représentation s'en écarte silencieusement.

---

## §11 — KG-03 : INVALIDATED ≠ CURRENT

**Formulation canonique :**

> Une connaissance invalidée n'est pas absente — elle est préservée avec son invalidation. L'effacer détruit la lignée.

**Périmètre :** tout module ayant autorité pour modifier, corriger ou supprimer une connaissance canonique existante.

**Condition de violation :** une connaissance invalidée est effacée sans laisser de trace de son existence antérieure et de la raison de son invalidation.

**Note :** KG-03 ne s'oppose pas à la correction d'une erreur. Il exige que la correction soit tracée — la version précédente et le motif de correction doivent rester accessibles dans la lignée.

---

## §12 — KG-04 : Anti-autoréférentialité (corollaire de KG-01)

**Formulation canonique :**

> Un sous-système ne peut pas utiliser ses propres sorties comme source de preuve indépendante pour les mêmes sorties.

**Périmètre :** tout sous-système analytique dont les sorties sont persistées et susceptibles d'être réintégrées comme entrées dans un cycle ultérieur.

**Condition de violation :** le sous-système P lit ses propres sorties persistées S comme source indépendante pour produire une nouvelle sortie S', sans qu'aucune validation externe n'intervienne entre S et S'.

**Distinction avec KG-01 :** KG-01 porte sur la séparation architecturale des chemins. KG-04 porte sur l'indépendance épistémique des sources. Un système peut respecter KG-01 (chemins séparés) et violer KG-04 (en lisant ses propres sorties comme sources indépendantes via des chemins formellement distincts).

**Couplage révisionnel :** Toute révision de KG-01 exige une réévaluation explicite de la validité et de la portée de KG-04. KG-04 est défini comme corollaire formel de KG-01 — une modification du périmètre de KG-01 modifie par implication le périmètre de KG-04.

---

## §13 — KG-05 : Intégrité de récupération (corollaire de KG-02)

**Formulation canonique :**

> Le mécanisme de récupération de la connaissance canonique ne peut pas altérer silencieusement le contenu sémantique de ce qu'il récupère.

**Périmètre :** tout mécanisme de recherche, d'indexation, de filtrage ou de récupération opérant sur le registre canonique.

**Condition de violation :** la connaissance canonique récupérée diffère sémantiquement de la connaissance canonique stockée, sans que cette différence soit tracée ni déclarée.

**Distinction avec KG-02 :** KG-02 porte sur la confusion entre runtime et canonique. KG-05 porte sur la fidélité du mécanisme de récupération, indépendamment de la nature de ce qui est récupéré. Une récupération altérante sur de la connaissance canonique intacte viole KG-05 sans violer KG-02.

---

## §14 — KG-08 : TECHNOLOGY REPLACEABILITY ≠ LINEAGE DESTRUCTION

**Formulation canonique :**

> Le substrat technique peut être remplacé. La lignée de la connaissance doit être préservée intégralement lors de toute migration.

**Périmètre :** toute opération de migration d'un substrat de stockage vers un autre, de réorganisation de schéma, ou de transformation structurelle des données canoniques persistées.

**Condition de violation :** une migration technique entraîne la perte, la corruption ou la rupture silencieuse de la lignée de provenance des connaissances concernées.

**Conditions de conformité :** une migration est conforme à KG-08 si et seulement si :

1. les métadonnées de provenance (source · date · contexte) sont intégralement transférées ;
2. la signification de chaque champ de provenance est préservée, pas seulement sa valeur littérale ;
3. la correspondance entre connaissance pré-migration et connaissance post-migration est documentée ;
4. aucune connaissance n'est silencieusement effacée lors de la migration.

La préservation de la lignée inclut la préservation de la signification des métadonnées de provenance. Une migration ne peut conserver littéralement une valeur tout en en modifiant silencieusement l'interprétation. Si la sémantique d'un champ de provenance change lors d'une migration, la lignée est rompue au sens de KG-08.

**[GIT_FACT]** La doctrine de provenance (LOT-P1-2.4) définit trois champs canoniques : source (obligatoire) · date (produite par la couche) · contexte (optionnel). KG-08 s'appuie sur ces trois champs comme support minimal de la lignée.

---

## §15 — KG-07 : Fidélité de projection (corollaire de KG-02)

**Formulation canonique :**

> Une représentation dérivée d'une connaissance canonique doit rester fidèle à sa source canonique en permanence.

**Périmètre :** toute représentation, synthèse, agrégation ou affichage dérivé d'une connaissance canonique.

**Condition de violation :** la représentation dérivée diverge de sa source canonique sans que cette divergence soit tracée ni déclarée.

**Distinction avec KG-03 :** KG-03 porte sur la préservation des connaissances invalidées. KG-07 porte sur la fidélité des représentations dérivées de connaissances valides. Une représentation erronée d'une connaissance valide et non invalidée viole KG-07 sans violer KG-03.

**Distinction avec CONST-I11 :** CONST-I11 établit que le Constellium ne duplique pas les objets canoniques dont Caméléon Engine est la source de vérité analytique. KG-07 établit que toute représentation dérivée reste fidèle à sa source. La non-duplication (CONST-I11) ne garantit pas la fidélité de projection (KG-07) — une représentation unique peut diverger de sa source sans la dupliquer.

---

## §16 — KG-06 : PRODUCTION METHOD → STATUS

**Formulation canonique :**

> Le statut épistémique d'une connaissance dépend de la méthode qui l'a produite. Une donnée produite sans méthode validée ne peut pas prétendre au statut canonique.

**Périmètre :** toute connaissance susceptible d'être intégrée au registre canonique de Caméléon Engine.

**Condition de violation :** une connaissance est traitée comme canonique sans que la méthode de sa production ait été qualifiée selon la taxonomie du §8.

**Note d'application :** la taxonomie du §8 définit quatre niveaux de canonicité. La qualification d'une connaissance dans un niveau donné est déterminée par la méthode réellement utilisée pour la produire, non par le contenu ou la valeur de la connaissance. Le niveau le plus adapté est celui qui correspond à la méthode de production effective.

---

## §17 — Relations avec ICI-01

ICI-01 et Knowledge Governance V1 sont deux invariants N1 complémentaires et orthogonaux.

**[GIT_FACT]** ICI-01 (`docs/doctrine/INVARIANT_ICI_01_V1.md`) établit que l'accumulation comportementale ne doit jamais, par elle-même, augmenter l'autorité décisionnelle ou exécutive du système sur l'humain. Son périmètre est l'accumulation comportementale et le plafond d'autorité décisionnelle du système.

**[DOCTRINAL_RULE]** Knowledge Governance V1 opère sur le périmètre épistémique — il gouverne la qualification de la connaissance, non l'autorité du système. Il ne modifie pas ICI-01 et n'en réduit pas la portée.

Les deux invariants sont compatibles. Ils couvrent des dimensions distinctes :

| Dimension | ICI-01 | KG V1 |
|---|---|---|
| Objet | Accumulation comportementale | Connaissance canonique |
| Axe | Autorité du système | Qualification épistémique |
| Plafond | LEVEL-4 (autorité) | Méthode de production |
| Convergence | L'accumulation n'augmente jamais l'autorité | La méthode détermine le statut |

**[DOCTRINAL_RULE]** La règle de non-déclenchement automatique (§5 P-04) est propre à KG V1 dans son périmètre : aucune connaissance canonique ne déclenche automatiquement une action ou une décision à la place de l'humain. Cette règle complète ICI-01 dans le périmètre épistémique sans en modifier la portée.

---

## §18 — Compatibilité avec la Constitution Intellectuelle V1

Knowledge Governance V1 est compatible avec les dix doctrines de la Constitution Intellectuelle V1. La démonstration ci-dessous est ordonnée selon la hiérarchie doctrinale (§3 Constitution).

| Doctrine | Compatibilité | Note |
|---|---|---|
| 2.1 Lecture ≠ Action | Conforme | KG V1 gouverne la production de connaissance, non la lecture. Aucune connaissance canonique ne prescrit d'action. |
| 2.2 Observer → Comparer → Expliquer → Laisser décider | Conforme | La qualification canonique (§8) est un acte d'observation et de classification, jamais de prescription. |
| 2.3 Explicabilité | Conforme | KG-06 exige que la méthode de production soit identifiable — c'est une forme d'explicabilité de la connaissance. |
| 2.4 Incertitude maîtrisée | Conforme | KG-03 (conservation des invalidations) et KG-06 (qualification par méthode) permettent au moteur de distinguer ce qu'il sait, pense et ignore. |
| 2.5 Honnêteté intellectuelle | Conforme | KG-03 préserve les connaissances invalidées — changer d'analyse est traçable, jamais effacé. |
| 2.6 Traçabilité intellectuelle | Conforme | KG-08 et la doctrine de provenance garantissent que toute connaissance peut être reconstruite depuis sa source. |
| 2.7 Réfutabilité | Conforme | KG-06 impose que la méthode soit explicite — une connaissance sans méthode identifiable ne peut pas être réfutée par sa méthode. |
| 2.8 Proportionnalité | Conforme | Le statut épistémique (§8) détermine le poids accordé à une connaissance dans une lecture. |
| 2.9 Contextualité | Conforme | Le champ contexte de la provenance (LOT-P1-2.4, KG-08) préserve le contexte de production. |
| 2.10 Humilité cognitive | Conforme | Knowledge Governance V1 lui-même satisfait au §20 les critères d'évolution de la Constitution — il n'est pas figé en dogme. |

---

## §19 — Registre des décisions humaines closes

Les cinq décisions suivantes sont closes et ne peuvent pas être rouvertes sans décision architecturale explicite de niveau N1.

| ID | Objet | Décision |
|---|---|---|
| HD-01 | KG-01 : portée prospective ou rétrospective | OPTION A retenue : prospective. Les chemins de lecture et d'écriture doivent être conçus séparément dès l'origine. |
| HD-02 | KG-07 : invariant autonome ou corollaire | OPTION B retenue : corollaire de KG-02. KG-07 n'est pas un invariant fondamental — il est une propriété dérivée de KG-02 appliquée au périmètre des représentations. |
| HD-03 | KG-04 : invariant autonome ou corollaire | OPTION B retenue : corollaire de KG-01. KG-04 n'est pas un invariant fondamental — il est une propriété dérivée de KG-01 appliquée au périmètre de l'autoréférentialité. |
| HD-04 | KG-05 : invariant autonome ou corollaire | OPTION B retenue : corollaire de KG-02. KG-05 n'est pas un invariant fondamental — il est une propriété dérivée de KG-02 appliquée au périmètre de la récupération. |
| HD-05 | KG-06 : taxonomie binaire ou graduée | Taxonomie graduée retenue : quatre niveaux définis selon la méthode de production. Aucune hiérarchie de valeur entre les niveaux. |

---

## §20 — Conditions d'évolution

Knowledge Governance V1 est volontairement stable.

Toute proposition d'ajout d'un nouvel invariant ou d'un nouveau corollaire doit satisfaire les quatre critères de la Constitution Intellectuelle V1 §5 :

1. Elle couvre un domaine réellement absent de la chaîne existante.
2. Elle ne peut pas être absorbée par un invariant ou corollaire existant.
3. Elle apporte une valeur durable supérieure au coût documentaire qu'elle génère.
4. Elle passe l'Analyse de rentabilité méthodologique (Valeur ≥ 8/10 · Complexité ≤ 3/10).

Toute révision d'un invariant existant constitue une décision architecturale majeure de niveau N1. Elle exige une documentation complète du motif, de l'impact sur les corollaires et sur les documents dépendants.

La stabilité de Knowledge Governance V1 est une valeur opérationnelle. L'accumulation de règles dégrade la gouvernance qu'elle cherche à établir.

---

## §21 — Risques canoniques

### RC-01 — Dérive par accumulation silencieuse

Un système qui accumule de la connaissance sans gouvernance explicite de la qualification épistémique produit inévitablement une dérive : des connaissances de statuts différents sont traitées à poids égal, et les erreurs locales se propagent globalement.

**Vecteurs principaux :** absence de qualification KG-06 · confusion CANONICAL/RUNTIME (KG-02) · autoréférentialité non détectée (KG-04).

**Signaux d'alerte :** connaissances sans méthode de production identifiable · connaissances runtime persistées sans validation · outputs analytiques réintégrés sans barrière de validation.

### RC-02 — Rupture de lignée lors d'une migration technique

Une migration technique non gouvernée peut détruire silencieusement la lignée de provenance des connaissances. La migration est conforme (substrat remplacé), mais la connaissance est orpheline (lignée perdue).

**Vecteurs principaux :** perte de métadonnées de provenance · dérive sémantique silencieuse des champs de provenance · absence de documentation de la correspondance pré/post-migration.

**Signaux d'alerte :** connaissances post-migration sans source identifiable · champs de provenance conservés littéralement mais dont la signification a changé · absence de documentation de migration.

---

## §22 — Texte fondateur

Caméléon Engine accumule. C'est sa nature. Il accumule des traces, des sessions, des lectures, des patterns comportementaux, des données patrimoniales.

Cette accumulation est sa valeur. Elle est aussi son risque fondamental.

Une accumulation sans gouvernance ne produit pas de connaissance — elle produit du bruit qualifié de connaissance.

Knowledge Governance V1 établit les règles qui séparent l'une de l'autre.

Une connaissance canonique n'est pas une donnée qui existe dans le système. C'est une donnée dont la méthode de production a été qualifiée, dont la lignée est intègre, dont le statut peut être justifié, et qui ne prétend jamais à une autorité qu'elle n'a pas.

Un moteur qui respecte ces invariants ne cherche pas à produire plus de connaissance. Il cherche à produire de la connaissance méritée.

---

*Ce document est la référence permanente pour toute question relative à la qualification de la connaissance dans Caméléon Engine.*  
*Il peut être révisé uniquement par décision architecturale explicite de niveau N1, satisfaisant les conditions du §20.*
