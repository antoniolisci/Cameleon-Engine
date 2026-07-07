# LOT-P1-2 — Couche de persistance canonique V1
## Cadrage officiel — Deuxième LOT du Programme P1

---

## Statut

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1-2 |
| Titre | Couche de persistance canonique V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Architecture fondatrice |
| Statut | CADRAGE EN COURS |
| Ancrage GPD V1 | Partie II §2.5 (storage) · Partie VIII §8.1 (blancs) · Partie XIII §13.5 (nœuds multiplicateurs) |
| Prérequis satisfaits | LOT-P1 — Diagnostic mémoriel V1 · CLOS · `2223e15` |
| Date de cadrage | 2026-07-07 |
| Commit Roadmap V1 | `f83bb0c` |
| Commit convention nommage | `9af0be1` |

**Note sur le titre :** Le nom de fichier `CANONICAL_PERSISTENCE` reflète les deux livrables centraux du LOT — le modèle canonique de trace et la couche de persistance structurée. Les livrables d'indexation et de doctrine de provenance en sont des composantes directes, non des extensions séparées.

---

## 1 — Mission

LOT-P1-2 construit l'infrastructure sur laquelle repose l'intégralité de la Roadmap V1.

Le diagnostic mémoriel produit par LOT-P1 a rendu visible l'état actuel de la couche de persistance. Il a établi la cartographie de terrain nécessaire à toute décision d'architecture sur cette couche. LOT-P1-2 s'appuie sur ce constat pour définir et construire la fondation qui manque : un modèle canonique de trace, une couche de persistance structurée, une indexation par famille et par date, et une doctrine de provenance formalisée.

Ces quatre éléments constituent les quatre livrables officiels du Programme P1 tels que définis dans la Roadmap V1 (§4).

LOT-P1-2 ne produit pas de fonctionnalité visible pour l'opérateur. Il produit l'infrastructure sans laquelle aucune des couches L1, L2 et L3 de l'Architecture Conceptuelle Fondatrice V1 ne peut opérer.

---

## 2 — Constat

*Ce constat est fondé exclusivement sur les observations produites par LOT-P1 (diagnostic mémoriel V1) et les constats du Grand Plan Directeur V1. Aucun élément n'est inventé.*

### 2.1 — Absence de modèle canonique de trace

La couche de persistance actuelle ne repose sur aucun modèle de trace unifié. Les 14 entrées inventoriées par LOT-P1 utilisent des structures hétérogènes : certaines disposent d'une enveloppe avec métadonnées (dont la date de dernière écriture), d'autres sont des valeurs primitives sans enveloppe, d'autres encore des tableaux bruts sans en-tête. Aucune entrée ne porte systématiquement les quatre champs nécessaires à une trace mémorielle complète : famille d'appartenance, source d'écriture, date d'écriture, contexte d'origine.

Cette hétérogénéité a été rendue visible par LOT-P1 : trois entrées — R1 (Mémoire comportementale), R3 (Niveau de garde comportemental) et R4 (Paramètres d'ordres récents) — n'exposent pas de datation normalisée, chacune pour une raison structurelle distincte liée au format de leur stockage. Ces trois cas ne sont pas des anomalies isolées : ils sont la conséquence directe de l'absence d'un modèle canonique.

### 2.2 — Couche de persistance non structurée

Le Grand Plan Directeur V1 (Partie II §2.5) identifie le module de persistance actuel comme un "contrat architectural central" — toute écriture durable passe par lui. Ce rôle central est exact. Mais le contrat lui-même repose sur une organisation par type de donnée, non par structure mémorielle. Les clés de stockage sont nommées ad hoc, sans hiérarchie formelle entre familles, sans distinction entre trace mémorielle et état applicatif.

Le GPD V1 (Partie XIII §13.5) identifie ce même problème comme un nœud multiplicateur : "chaque famille utilise ses propres formats de date, ses propres structures de données, ses propres clés de stockage. Sans normalisation cross-familles, aucune de ces trois couches ne peut opérer" — les couches citées étant la Timeline, le Corrélateur et l'Assistant Mémoire, qui dépendent tous trois de la fondation que LOT-P1-2 doit poser.

### 2.3 — Absence d'indexation chronologique et par session

Les données persistées actuellement sont accessibles par type de donnée, non par famille mémorielle, par date ou par session. L'opérateur ne peut pas consulter "toutes les traces de la famille SY1 entre deux dates" ou "tout ce qui a été enregistré lors de cette session". Cette limitation n'est pas un déficit de présentation — c'est un déficit structurel : l'index n'existe pas.

Le GPD V1 (Partie XIII §13.5) signale explicitement ce manque comme un "prérequis structurant" pour la Timeline.

### 2.4 — Provenance non garantie (I-08)

L'invariant I-08 de l'Architecture Conceptuelle Fondatrice V1 impose que "chaque trace conserve source · date · contexte". Cet invariant n'est pas satisfait par la couche actuelle : l'écriture d'une trace ne contraint pas le module écrivant à fournir ces métadonnées. La provenance est partielle là où elle existe, absente là où le format de stockage ne l'autorise pas.

---

## 3 — Objectifs

### 3.1 — Objectifs principaux

Ces quatre objectifs correspondent directement aux quatre livrables officiels du Programme P1 (Roadmap V1 §4).

**O1 — Modèle canonique de trace**
Définir le modèle de données minimal que toute trace mémorielle doit satisfaire : famille d'appartenance, source d'écriture, date d'écriture, contexte d'origine. Ce modèle est la référence que toute couche supérieure (L1, L2, L3) pourra interroger de manière uniforme.

**O2 — Couche de persistance locale structurée**
Remplacer l'organisation ad hoc par une couche organisée autour des familles mémoire définies par l'Architecture Conceptuelle Fondatrice V1. La couche est indépendante de tout moteur applicatif — elle ne connaît que les familles et les traces ; elle ne connaît pas les moteurs qui les produisent.

**O3 — Indexation par famille, par date et par session**
Doter la couche de persistance d'un mécanisme d'indexation permettant la retrouvabilité d'une trace selon trois axes : sa famille mémorielle, sa date d'écriture, et la session à laquelle elle appartient. Cet index est un prérequis structurant pour L2 (Corrélateur) et L3 (Assistant Mémoire).

**O4 — Doctrine de provenance**
Formaliser la règle selon laquelle toute écriture dans la couche de persistance doit fournir la source, la date et le contexte de la trace. La doctrine rend cette exigence contraignante et vérifiable — elle ne peut pas être contournée par une écriture directe sans métadonnées.

### 3.2 — Objectifs secondaires

**OS1 — Migration des 14 entrées existantes**
Faire migrer les 14 entrées inventoriées par LOT-P1 vers la couche structurée, en préservant les données existantes sans perte. Pour les trois entrées sans datation (R1, R3, R4), la migration formalise leur cas particulier dans le modèle canonique — elle ne crée pas de datation là où il n'y en a pas.

**OS2 — Préservation des garanties LOT-H01/LOT-H02**
Toute modification de la couche de persistance doit préserver les garanties de robustesse introduites par les lots de Hardening (gestion des erreurs réseau, protection contre le dépassement de quota, validation des données à l'import).

### 3.3 — Objectifs explicitement exclus

- **Aucun parseur de source** — l'ingestion des sources S1 à S5 appartient au Programme P3.
- **Aucune interface visible** — LOT-P1-2 est une infrastructure. Aucun élément de présentation opérateur n'est produit.
- **Aucune corrélation** — la détection de relations entre familles appartient au Programme P6.
- **Aucune synthèse** — la production d'insights appartient au Programme P8.
- **Aucune migration cloud** — la synchronisation des données vers un stockage distant relève du Compte Utilisateur V1 (existant) et n'est pas étendue dans ce LOT.
- **Aucune modification des moteurs applicatifs** — le moteur décisionnel, le moteur comportemental et OI V1 ne sont pas touchés.
- **Aucun nouveau vocabulaire utilisateur** — LOT-P1-2 est une couche infrastructure. Elle ne produit aucun texte visible par l'opérateur.

---

## 4 — Architecture cible

### 4.1 — Principe fondateur

La couche de persistance canonique repose sur un principe unique : **chaque donnée durable dans le système est une trace mémorielle, et toute trace mémorielle appartient à une famille définie par l'Architecture Conceptuelle Fondatrice V1.**

Ce principe rompt avec l'organisation actuelle qui distingue les données par leur type applicatif (état du formulaire, historique, sessions comportementales, paramètres OI…). La couche canonique les organise par famille mémorielle — ce qu'elles représentent pour la mémoire du décideur, pas ce qu'elles servent au niveau applicatif.

### 4.2 — Le modèle canonique de trace

Toute trace mémorielle persistée dans la couche canonique porte quatre champs obligatoires :

| Champ | Rôle | Contrainte |
|---|---|---|
| **Famille** | Identifie la famille mémorielle d'appartenance (S1 à S5, SY1 à SY4, L1 à L3, Référentiel) | Valeur dans l'ensemble défini par l'ACF V1 — non extensible sans décision doctrinale |
| **Source** | Identifie le module ou l'opération à l'origine de l'écriture | Non nul — toute écriture sans source est rejetée |
| **Date** | Horodatage de l'écriture | ISO 8601 · UTC · non nul sauf cas formalisés (voir §4.3) |
| **Contexte** | Description minimale de la situation à l'origine de la trace | Facultatif mais encouragé — sa présence enrichit L2 et L3 |

La trace porte également la **valeur** qu'elle stocke — mais la valeur seule n'est pas une trace : sans les quatre champs ci-dessus, elle est une donnée applicative, pas une trace mémorielle.

### 4.3 — Cas particuliers de datation

LOT-P1 a identifié trois familles dont la date d'écriture ne peut être extraite des formats actuels. Le modèle canonique les formalise explicitement :

| Cas | Famille | Nature du cas | Traitement dans le modèle |
|---|---|---|---|
| R1 | Mémoire comportementale synthétisée | Tableau brut sans enveloppe | Le champ Date est déclaré "non disponible" — valeur formalisée, non laissée nulle par défaut |
| R3 | Niveau de garde comportemental | Format non normalisé | Même traitement que R1 |
| R4 | Paramètres d'ordres récents | Horodatage en millisecondes d'époque | Le champ Date est déclaré "non exploitable au format canonique" jusqu'à migration normalisée |

Ces trois cas ne sont pas des erreurs — ils sont des états légitimes du modèle, formellement déclarés. La migration future de R4 vers un format ISO 8601 résoudra son cas sans modifier la structure du modèle.

### 4.4 — Structure de la couche de persistance

La couche s'organise en trois niveaux :

**Niveau 1 — Familles**
Les familles mémoire de l'ACF V1 constituent les compartiments primaires de la couche. Chaque famille est un espace isolé : une écriture dans la famille SY1 Comportementale ne peut pas affecter la famille S1 Transactionnelle.

**Niveau 2 — Traces**
Dans chaque famille, les traces sont stockées dans l'ordre chronologique de leur écriture. Chaque trace est atomique : elle ne peut pas être modifiée partiellement — seule l'écriture complète d'une nouvelle trace est autorisée.

**Niveau 3 — Index**
Un index transversal, maintenu par la couche elle-même, permet la retrouvabilité d'une trace selon trois axes : famille, date, session. L'index est mis à jour à chaque écriture. Il n'est jamais interrogé directement par les moteurs — ils passent par l'interface de la couche.

### 4.5 — Responsabilités de la couche

| Responsabilité | Description |
|---|---|
| **Écriture contrôlée** | Toute écriture passe par l'interface de la couche. Aucune écriture directe n'est autorisée. La couche valide la présence des champs obligatoires avant persistance. |
| **Lecture par famille** | Retourner toutes les traces d'une famille dans l'ordre chronologique. |
| **Lecture par date** | Retourner toutes les traces dont la date est comprise dans une plage donnée. |
| **Lecture par session** | Retourner toutes les traces associées à un identifiant de session donné. |
| **Isolation des familles** | Garantir qu'une opération sur une famille n'affecte pas les autres. |
| **Dégradation gracieuse (I-09)** | Si une famille est absente, la lecture retourne un ensemble vide — jamais une erreur bloquante. |

### 4.6 — Ce que la couche ne fait pas

La couche de persistance canonique ne produit aucune corrélation, aucune synthèse, aucune recommandation. Elle stocke et restitue. Toute logique d'interprétation appartient aux couches L1, L2 ou L3 qui s'appuient sur elle.

La couche ne décide pas de ce qu'une trace signifie — elle garantit seulement qu'elle est retrouvable.

---

## 5 — Flux de données

Les flux ci-dessous décrivent la vie d'une trace dans la couche de persistance canonique. Ils sont conceptuels — aucun détail d'implémentation n'est prescrit.

### Création

Une trace est créée lorsqu'un module du système produit une donnée durable. Le module fournit obligatoirement : la famille cible, la source, la valeur à persister. La date est horodatée par la couche au moment de l'écriture. Le contexte est fourni si disponible.

### Validation

La couche vérifie la présence des champs obligatoires (famille, source) et la cohérence de la famille déclarée avec l'espace de familles de l'ACF V1. Toute écriture incomplète est rejetée — la couche ne complète pas silencieusement les champs manquants.

### Persistance

La trace validée est écrite dans le compartiment de la famille correspondante. L'index est mis à jour simultanément : la trace est enregistrée sur les trois axes (famille, date, session). La persistance est atomique — soit la trace et l'index sont tous les deux mis à jour, soit aucun ne l'est.

### Lecture

Une trace est lue via l'interface de la couche par famille, par plage de dates ou par session. La couche retourne les traces dans l'ordre chronologique. Elle ne filtre pas, ne trie pas au-delà de la chronologie, ne produit pas d'agrégat. L'interprétation appartient à la couche appelante.

### Restauration

À l'import d'une sauvegarde, les traces sont réintégrées dans la couche en préservant leurs métadonnées d'origine (famille, source, date, contexte). La restauration ne réécrit pas les dates — elle restaure les traces telles qu'elles étaient au moment de l'export.

### Export

À la demande de l'opérateur, la couche exporte l'ensemble des traces de toutes les familles dans un format portable. L'export respecte l'invariant I-01 (local-first) : les données ne quittent l'appareil qu'à l'initiative explicite de l'opérateur.

### Suppression

La suppression d'une trace ou d'une famille est une opération irréversible. Elle nettoie simultanément la valeur et les entrées d'index correspondantes. Aucune suppression partielle d'un enregistrement n'est autorisée.

---

## 6 — Découpage du chantier

LOT-P1-2 est décomposé en cinq sous-phases. Les quatre premières correspondent aux quatre livrables officiels du Programme P1 (Roadmap V1 §4). La cinquième est la validation terrain.

### LOT-P1-2.1 — Modèle canonique de trace

**Mission :** Définir formellement le modèle de trace — ses quatre champs obligatoires, leurs contraintes, les cas particuliers de datation (R1, R3, R4) et les règles d'écriture.

**Livrable :** Document de spécification du modèle canonique, validé par rapport aux 14 entrées de LOT-P1.

**Prérequis :** LOT-P1 clos.

**Dépendance aval :** LOT-P1-2.2 ne peut pas commencer sans le modèle validé.

---

### LOT-P1-2.2 — Couche de persistance locale structurée

**Mission :** Concevoir et construire la couche de persistance organisée par famille mémorielle, avec isolation des compartiments et interface d'écriture contrôlée. Migrer les 14 entrées existantes vers la nouvelle structure.

**Livrable :** Couche de persistance opérationnelle, 14 entrées migrées, interface d'écriture exposée.

**Prérequis :** LOT-P1-2.1 validé.

**Dépendance aval :** LOT-P1-2.3 et LOT-P1-2.4 peuvent démarrer en parallèle une fois LOT-P1-2.2 validé.

---

### LOT-P1-2.3 — Indexation par famille, date et session

**Mission :** Construire l'index transversal permettant la retrouvabilité des traces selon les trois axes : famille, date, session. L'index est maintenu automatiquement par la couche à chaque écriture.

**Livrable :** Index opérationnel, les trois modes de lecture vérifiés sur les 14 entrées migrées.

**Prérequis :** LOT-P1-2.2 validé.

**Dépendance aval :** LOT-P1-2.4 peut avancer en parallèle.

---

### LOT-P1-2.4 — Doctrine de provenance

**Mission :** Formaliser la règle de provenance comme contrainte architecturale — toute écriture dans la couche doit fournir source, date et contexte. Documenter les cas particuliers (R1, R3, R4) dans la doctrine.

**Livrable :** Document de doctrine de provenance, validé contre l'ACF V1 invariant I-08 et le Language System V1.

**Prérequis :** LOT-P1-2.2 validé (la doctrine porte sur une couche concrète, pas sur un modèle théorique).

**Dépendance aval :** LOT-P1-2.5 ne peut pas commencer sans que LOT-P1-2.3 et LOT-P1-2.4 soient tous les deux validés.

---

### LOT-P1-2.5 — Validation terrain

**Mission :** Confirmer, par observation directe en conditions réelles, que la couche de persistance canonique satisfait les quatre critères de clôture du Programme P1 définis dans la Roadmap V1.

**Livrable :** Rapport de validation terrain. Protocole de validation défini à l'ouverture de cette sous-phase.

**Prérequis :** LOT-P1-2.2, LOT-P1-2.3 et LOT-P1-2.4 tous validés.

**Dépendance aval :** Aucune — LOT-P1-2.5 est la phase terminale de ce LOT.

---

## 7 — Risques

### 7.1 — Risques de régression

**R-REG-01 — Perte de données lors de la migration**
La migration des 14 entrées existantes vers la couche structurée constitue le risque de régression le plus élevé. Une erreur dans le processus de migration peut entraîner la perte silencieuse de données que l'opérateur a accumulées. Mitigation : la migration doit être réversible — les données d'origine doivent être préservées jusqu'à validation complète de la couche canonique.

**R-REG-02 — Rupture des garanties Hardening**
Les lots LOT-H01 et LOT-H02 ont introduit des gardes contre le dépassement de quota de stockage, les erreurs réseau et les données corrompues à l'import. La refonte de la couche de persistance risque de contourner ou d'effacer ces gardes. Mitigation : auditer chaque garde existante avant migration et vérifier sa présence dans la couche canonique.

**R-REG-03 — Régression du Compte Utilisateur V1**
Le Compte Utilisateur V1 exporte et importe 12 clés définies. Si la couche canonique renomme ou réorganise ces clés, l'export/import existant sera rompu. Mitigation : la migration doit maintenir la compatibilité avec les exports produits sous l'ancienne structure, ou définir explicitement une procédure de conversion.

### 7.2 — Risques doctrinaux

**R-DOC-01 — Violation de I-08 (Provenance)**
Si la doctrine de provenance (LOT-P1-2.4) n'est pas contraignante architecturalement, les modules applicatifs pourront continuer à écrire des traces sans source ni contexte. La doctrine doit être implémentée comme un mécanisme de validation, pas comme une recommandation.

**R-DOC-02 — Violation de I-01 (Local-first)**
Toute évolution de la couche de persistance qui déclencherait une synchronisation non sollicitée vers un stockage distant violerait I-01. Mitigation : la couche canonique est strictement locale — elle n'expose aucune interface réseau.

**R-DOC-03 — Extension non autorisée des familles**
La couche organise les données par famille mémorielle. Si un module applicatif introduit une famille non définie par l'ACF V1, cela viole la gouvernance doctrinale. Mitigation : le registre des familles autorisées est fermé — toute extension nécessite une décision doctrinale explicite, pas une modification de la couche.

### 7.3 — Risques techniques

**R-TECH-01 — Complexité de la migration R1/R3/R4**
Les trois entrées sans datation normalisée nécessitent un traitement particulier pendant la migration. Leur structure actuelle (tableau brut, format non normalisé, horodatage en millisecondes) ne correspond pas au modèle canonique. Une migration naïve produirait des traces avec des champs de datation incorrects. Mitigation : le modèle canonique formalise ces trois cas avant la migration (LOT-P1-2.1), de sorte que la migration sache comment les traiter.

**R-TECH-02 — Performance de l'index**
Un index maintenu à chaque écriture introduit un coût à chaque opération de persistance. Si l'index n'est pas conçu pour la volumétrie attendue, il peut dégrader les performances globales. Mitigation : l'architecture de l'index doit être validée pour la volumétrie des 14 familles actuelles et extrapolée aux familles S2-S5 futures.

### 7.4 — Risques UX

**R-UX-01 — Régression du Diagnostic mémoriel (LOT-P1)**
Le Diagnostic mémoriel lit directement la couche de persistance. Si la couche canonique modifie la structure des données sans adapter le diagnostic, l'interface produira des valeurs incorrectes ou vides. Mitigation : la migration inclut un audit du Diagnostic mémoriel après chaque sous-phase.

### 7.5 — Risques Language System

**R-LS-01 — Aucun nouveau vocabulaire utilisateur**
LOT-P1-2 est une couche infrastructure. Il ne produit aucun texte visible par l'opérateur. Le risque Language System V1 est donc minimal pour ce LOT — il sera traité dans les LOT qui consomment cette couche et exposent des résultats à l'opérateur.

---

## 8 — Critères de validation

Ces critères reprennent et précisent les quatre critères de clôture du Programme P1 définis dans la Roadmap V1 (§4).

**CV1 — Modèle canonique de trace satisfait**
Toute trace persistée dans la couche canonique contient les quatre champs : famille, source, date, contexte d'origine. Les trois cas particuliers (R1, R3, R4) sont formellement documentés dans le modèle — leur absence de datation est une valeur déclarée, non un champ manquant.

**CV2 — Indépendance de la couche**
La couche de persistance canonique n'importe aucune logique applicative. Elle n'appelle aucun moteur. Elle ne connaît que les familles mémoire et les traces. Un remplacement complet de la couche d'implémentation sous-jacente ne devrait pas nécessiter de modification des moteurs qui l'utilisent.

**CV3 — Indexation opérationnelle**
La retrouvabilité par famille, par date et par session est vérifiée sur les 14 entrées migrées. Chacun des trois modes de lecture retourne un résultat cohérent avec les données persistées.

**CV4 — Provenance systématique**
Aucune écriture dans la couche ne peut aboutir sans que la source soit fournie. Le mécanisme de validation est actif et vérifiable — il n'est pas contournable par les modules applicatifs.

**CV5 — Aucune perte de données**
Les 14 entrées existantes sont présentes dans la couche canonique après migration. Leurs valeurs sont identiques à celles observées avant migration. Les trois entrées sans datation sont dans leur état formalisé (non nulle par défaut, mais déclarée non disponible).

**CV6 — Garanties Hardening préservées**
Les gardes introduits par LOT-H01 et LOT-H02 sont présents et actifs dans la couche canonique.

**CV7 — Diagnostic mémoriel non régressé**
Le Diagnostic mémoriel (LOT-P1) affiche des données cohérentes après migration. Aucun des 19 scénarios de validation de LOT-P1 ne régresse.

---

## 9 — Dépendances futures

La Roadmap V1 (§7 — graphe de dépendances) établit que P1 est un prérequis strict de tous les autres programmes. LOT-P1-2 est donc le débloqueur architectural principal de la Roadmap.

| Programme | Lien avec LOT-P1-2 |
|---|---|
| **P2 — Doctrine des Sources** | Prérequis strict — P2 ne peut pas démarrer sans P1 gelé |
| **P3 — Moteur d'Ingestion Pipeline** | Prérequis strict — le pipeline a besoin du modèle canonique pour savoir où et comment persister |
| **P4 — Moteur Décisionnel & Snapshots** | Prérequis strict — les snapshots décisionnels s'écrivent dans la couche canonique |
| **P5 — Operator Intelligence V2** | Prérequis strict — l'extension OI utilise la couche canonique pour la persistance longue durée |
| **P6 — Moteur de Corrélation** | Prérequis strict — L2 requiert un index chronologique cross-familles (LOT-P1-2.3) |
| **P7 — Moteur Comportemental V2** | Prérequis strict — l'extension SY1 utilise la couche canonique |
| **P8 — Moteur de Synthèse** | Prérequis strict — L3 requiert P1 gelé · P6 gelé |

Le nœud multiplicateur identifié dans le GPD V1 (Partie XIII §13.5) "Modèle de données unifié cross-familles" est précisément ce que LOT-P1-2 livre. Sa résolution débloque simultanément la Timeline, le Corrélateur et l'Assistant Mémoire.

---

## 10 — Conditions de clôture

LOT-P1-2 peut être officiellement clos si et seulement si :

1. Les sous-phases LOT-P1-2.1, LOT-P1-2.2, LOT-P1-2.3 et LOT-P1-2.4 ont chacune reçu une validation documentée.
2. La sous-phase LOT-P1-2.5 (validation terrain) a été exécutée par l'opérateur.
3. Les sept critères de validation (CV1 à CV7) ont tous reçu le verdict PASS.
4. Le rapport de validation terrain a été produit et consigné.
5. Le Programme P1 satisfait ses quatre critères de clôture tels que définis dans la Roadmap V1 (§4).

À la clôture de LOT-P1-2, la clôture officielle du Programme P1 est ouverte. La transition T1 de la Phase A (P1 gelé ET P2 gelé) devient partiellement satisfaite : P1 est gelé. P2 peut être ouvert sans attendre — sa condition prérequis étant "P1 gelé", cette condition est remplie à la clôture de LOT-P1-2.

---

## 11 — Conformité doctrinale

| Référentiel | Statut | Note |
|---|---|---|
| ACF V1 — I-01 (local-first) | Conforme | Couche strictement locale — aucune interface réseau |
| ACF V1 — I-02 (autorité humaine) | Conforme | La couche stocke et restitue — elle ne décide pas |
| ACF V1 — I-03 (Lecture ≠ Action) | Conforme | La couche est infrastructure — elle n'émet aucun message à l'opérateur |
| ACF V1 — I-04 (silence structurel) | Conforme | Une famille absente retourne un ensemble vide, jamais une erreur |
| ACF V1 — I-05 (mémoire comme cœur) | Conforme | La couche canonique est le cœur mémoriel du système |
| ACF V1 — I-06 (profil interdit) | Conforme | La couche n'agrège pas de profil — elle stocke des traces atomiques |
| ACF V1 — I-07 (corrélation non imposée) | Conforme | La couche ne produit aucune corrélation — elle fournit les données brutes |
| ACF V1 — I-08 (provenance traçable) | ⚠ Objectif central | C'est l'objectif O4 de ce LOT — traité par LOT-P1-2.4 |
| ACF V1 — I-09 (dégradation gracieuse) | Conforme | Famille absente = ensemble vide, pas d'erreur bloquante |
| ACF V1 — I-10 (valeur temporelle) | Conforme | L'indexation chronologique (LOT-P1-2.3) matérialise cet invariant |
| Language System V1 | Conforme | Aucun texte visible opérateur produit par ce LOT |
| Roadmap V1 — I-TR-01 | Conforme | Ancrage GPD V1 documenté en §Statut |
| Doctrine de Gouvernance V1 | Conforme | Cadrage avant toute implémentation |
| Pattern Reflection Doctrine V1 | Conforme | Aucune corrélation produite par ce LOT |

---

*Cadrage officiel LOT-P1-2 — Programme P1 · Phase A · Caméléon Engine · 2026-07-07.*
