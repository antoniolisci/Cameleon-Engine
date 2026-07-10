# LOT-P2-2.E — Implémentation technique V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-2.E |
| Intitulé | Implémentation technique V1 |
| Micro-lot parent | LOT-P2-2 — Parser S1 · Fichiers transactionnels V1 |
| Programme | P2 — Ingestion des données |
| Phase Roadmap V1 | A |
| Type | Implémentation — Plan technique |
| Document officiel | `docs/lots/LOT-P2-2_E_IMPLEMENTATION_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-07-10 |

---

## §1 Mission

LOT-P2-2.E traduit les contrats P2-2.A, P2-2.B, P2-2.C et P2-2.D en code source opérationnel. Ce micro-lot est un plan d'exécution : il spécifie quels fichiers créer ou modifier, dans quel ordre, et comment chaque composant correspond aux contrats figés.

Aucune décision architecturale n'est prise dans ce micro-lot. Aucun contrat existant n'est modifié. Si une incohérence est découverte dans les contrats pendant l'implémentation, elle doit être signalée immédiatement à l'opérateur avant toute modification.

Ce micro-lot ne couvre pas la validation terrain. Celle-ci est réservée au micro-lot P2-2.F.

---

## §2 Prérequis

### §2.1 Contrats figés à implémenter

| Contrat | Document | Périmètre à implémenter |
|---|---|---|
| P2-2.A — Modèle de trace S1 | `LOT-P2-2_A_TRACE_MODEL_S1_V1.md` | Structure des 6 dimensions · déclinaison par format |
| P2-2.B — Classification et extraction | `LOT-P2-2_B_CLASSIFICATION_EXTRACTION_V1.md` | S1 Core · EP-RC2 · RF-R6 · Adaptateur Binance Phase A |
| P2-2.C — Persistance | `LOT-P2-2_C_PERSISTENCE_V1.md` | writeIngestedTrace · registre CE_ingestion_registry_v1 · déduplication · rapport |
| P2-2.D — Interface de déclenchement | `LOT-P2-2_D_TRIGGER_INTERFACE_V1.md` | ingest(descriptor) · registre des adaptateurs · contrat adaptateur · séquence 11 étapes · DT-4 |

### §2.2 Infrastructure existante utilisée

| Fichier | Rôle dans ce micro-lot |
|---|---|
| `src/js/canonical/canonical-store.js` | Modification — writeIngestedTrace y est ajoutée |
| `src/js/canonical/canonical-index.js` | Lecture seule — utilisé par le Core à l'étape 10 · non modifié |
| `src/index.html` | Modification — zone import ajoutée dans l'onglet Mémoire |
| `src/js/render.js` | Modification — binding UI et affichage du rapport d'ingestion |

---

## §3 Architecture des composants

Cinq composants techniques à créer ou modifier.

| Composant | Fichier(s) concerné(s) | Action | Contrat source |
|---|---|---|---|
| 1 — writeIngestedTrace | `src/js/canonical/canonical-store.js` | Modification | P2-2.C §6 |
| 2 — Registre d'ingestion | `src/js/ingestion/ingestion-registry.js` | Création | P2-2.C §4 |
| 3 — Adaptateur Binance S1 | `src/js/ingestion/adapters/binance-s1-adapter.js` | Création | P2-2.B §6 · P2-2.A §3 |
| 4 — Core et registre des adaptateurs | `src/js/ingestion/ingestion-core.js` | Création | P2-2.D §7–§8 |
| 5 — Interface opérateur | `src/index.html` · `src/js/render.js` | Modification | P2-2.D §9 |

Le répertoire `src/js/ingestion/` est à créer. Il est distinct du module comportemental (`src/js/behavior/`) conformément à DT-3 Option C — le module d'ingestion n'importe aucune fonction de ce module.

---

## §4 Ordre d'implémentation

### §4.1 Contraintes de dépendance

| Composant | Dépend de |
|---|---|
| 1 — writeIngestedTrace | Aucune dépendance externe au module canonical existant |
| 2 — Registre d'ingestion | Aucune dépendance vers les autres composants d'ingestion |
| 3 — Adaptateur Binance S1 | Aucune dépendance vers le Core (le Core dépend de lui, pas l'inverse) |
| 4 — Core et registre des adaptateurs | Composants 1, 2 et 3 |
| 5 — Interface opérateur | Composant 4 |

### §4.2 Séquence recommandée

**1 → 2 → 3 → 4 → 5**

Les composants 1, 2 et 3 sont indépendants entre eux et peuvent être vérifiés individuellement avant l'intégration dans le Core (composant 4). Le composant 5 ne peut être implémenté qu'une fois le Core opérationnel.

---

## §5 Composant 1 — writeIngestedTrace

### §5.1 Localisation

Fichier existant à modifier : `src/js/canonical/canonical-store.js`

### §5.2 Spécification

Ajouter la fonction `writeIngestedTrace(entry)` à la suite de `writeMigratedTrace`. La fonction est exportée de la même façon que les autres fonctions de ce module.

Son comportement est identique à `writeMigratedTrace` avec les seules différences suivantes (P2-2.C §6.5) :

| Dimension | writeMigratedTrace | writeIngestedTrace |
|---|---|---|
| Champ timestamp ajouté | migratedAt | ingestedAt |
| Sémantique | Rétrospective — données historiques | Prospective — données ingérées depuis source externe |
| Restriction d'usage | canonical-migration.js uniquement | Module d'ingestion (src/js/ingestion/) |

### §5.3 Invariants à respecter

- La validation RV1-RV4 (famille · source · date · contexte) est inchangée.
- La séquence RE1-RE3 est inchangée.
- Le champ `date` de l'entrée est fourni par le module appelant — la fonction ne génère pas la date.
- `ingestedAt` est horodaté au moment de l'appel à la fonction.
- `writeCanonicalTrace` et `writeMigratedTrace` ne sont pas modifiées.

---

## §6 Composant 2 — Registre d'ingestion

### §6.1 Localisation

Nouveau fichier à créer : `src/js/ingestion/ingestion-registry.js`

### §6.2 Clé de stockage

`CE_ingestion_registry_v1` — via la fonction `resolveKey` existante de la couche canonique (ML-5, LOT-P1-2.2).

### §6.3 Structure d'une entrée de registre

Chaque entrée correspond à un import réalisé avec succès (P2-2.C §4.3) :

| Champ | Contenu |
|---|---|
| fingerprint | Empreinte du contenu brut de la source |
| sessionId | Identifiant de session de l'ingestion |
| sourceId | Identifiant stable de la source (Phase A : nom du fichier) |
| importedAt | Horodatage ISO 8601 UTC de l'ingestion |
| traceCount | Nombre de traces écrites lors de cette ingestion |

### §6.4 Fonctions à exposer

| Fonction | Description |
|---|---|
| readRegistry() | Lire le registre depuis localStorage · retourner le tableau d'entrées (tableau vide si absent) |
| findByFingerprint(fingerprint) | Chercher une empreinte dans le registre · retourner l'entrée correspondante ou null |
| addEntry(entry) | Ajouter une entrée au registre · persister dans localStorage |

---

## §7 Composant 3 — Adaptateur Binance S1

### §7.1 Localisation et contrainte d'isolation

Nouveau fichier à créer : `src/js/ingestion/adapters/binance-s1-adapter.js`

L'adaptateur n'importe aucune fonction du module comportemental (`src/js/behavior/`). Le module comportemental constitue une référence documentaire pour les formats Binance Phase A (P2-2.B §7.5), pas une dépendance technique.

### §7.2 Contrat à implémenter

L'adaptateur expose les 6 capacités définies dans P2-2.D §7.2. Aucune de ces capacités ne contient de logique appartenant au Core.

### §7.3 Capacité famille

Valeur constante : `"S1"`.

### §7.4 Capacité canHandle(descriptor)

Identifier le format Binance à partir de `descriptor.data`, conformément à P2-2.B §6.2.

| Signal de détection | Format identifié |
|---|---|
| Présence d'une colonne frais ou fee (insensible à la casse, sans diacritiques) | TRADE_HISTORY |
| Présence d'une colonne statut ou status ET d'une colonne order id ou orderid | ORDER_HISTORY |
| Aucun signal Binance détecté · signaux contradictoires | Retourne faux |

Pour les fichiers PDF, la détection est fondée sur une analyse de score des libellés du document (signaux forts TRADE_HISTORY vs signaux forts ORDER_HISTORY), per le protocole documenté dans PDF Import V1.

La détection ORDER_HISTORY est prioritaire si les deux types de signaux sont simultanément présents.

Cette capacité ne modifie aucun état interne.

### §7.5 Capacité getSourceId(descriptor)

Retourner `descriptor.meta.name` — nom du fichier tel que fourni par l'opérateur. C'est l'identifiant stable de la source en Phase A (P2-2.C §4.3).

### §7.6 Capacité fingerprint(descriptor)

Calculer l'empreinte du contenu brut de `descriptor.data`. L'algorithme retenu est SHA-256 (P2-2.C §4.3 · "hash SHA-256 ou équivalent"). En Phase A, l'implémentation s'appuie sur l'API de hachage native du navigateur, disponible sans dépendance externe — seule option compatible avec l'architecture zéro-dépendance du projet (CLAUDE.md). La valeur retournée est une chaîne hexadécimale.

### §7.7 Capacité extractEvents(descriptor)

Lire `descriptor.data` et retourner la liste des événements bruts, le nombre total d'événements et la description du type de source.

Le parsage dépend du type de fichier identifié par `canHandle()` :

**CSV** : parsage ligne par ligne · première ligne = en-têtes · normalisation des en-têtes (minuscules, sans diacritiques) · chaque ligne de données = un événement brut (objet champs/valeurs). La canonicalisation des variantes timezone Binance (Date(UTC+2), Date(UTC+8)…) est appliquée lors de la normalisation des en-têtes.

**PDF** : extraction positionnelle des colonnes du tableau Binance · chaque ligne = un événement brut. La logique positionnelle est propre à cet adaptateur et s'appuie sur les structures de colonnes documentées dans PDF Import V1.

Le type de source retourné est l'une des quatre valeurs : `TRADE_HISTORY CSV` · `ORDER_HISTORY CSV` · `TRADE_HISTORY PDF` · `ORDER_HISTORY PDF`.

### §7.8 Capacité processEvent(event)

Pour chaque événement brut, appliquer les conditions de qualification puis construire la sortie.

**Étape 1 — Condition 2 : événement exécuté (P2-2.B §6.3)**

- TRADE_HISTORY : toutes les lignes sont présupposées exécutées — passer directement à l'étape 2.
- ORDER_HISTORY : lire la valeur du champ statut. Si la valeur correspond à FILLED (ou équivalent per table P2-2.B §6.3) : passer à l'étape 2. Sinon : retourner statut `exclu`.

**Étape 2 — Condition 3 : champs minimaux (P2-2.B §6.4)**

- TRADE_HISTORY : vérifier la présence et la non-vacuité des champs Paire et Côté (per tables d'alias P2-2.B §6.4). Si absence : retourner statut `rejeté`.
- ORDER_HISTORY FILLED : vérifier Paire, Côté et OrderId. Si absence de l'un ou plusieurs : retourner statut `rejeté`.

**Étape 3 — EP-RC2 avec extension Test 3b (P2-2.B §4 · §6.6)**

L'adaptateur localise la valeur brute `v` dans le champ date de l'événement per P2-2.B §6.5, puis applique l'algorithme EP-RC2 dans l'ordre suivant :

| Test | Condition | État retourné |
|---|---|---|
| Test 1 | v absent, vide, ou sentinelle "--" | R1 — Non disponible |
| Test 2 (dans plage) | v = séquence de 13 chiffres (epoch ms) · dans plage 2000–2100 | Standard |
| Test 2 (hors plage) | v = séquence de 13 chiffres · hors plage 2000–2100 | R4 — Non exploitable |
| Test 3 | v = séquence de 10 chiffres (epoch secondes) | R4 — Non exploitable |
| Test 3b | v = pattern "YY-MM-DD HH:MM:SS" (longueur 17) · préfixe "20" · décalage +02:00 → UTC | Standard |
| Test 4 | v = pattern ISO 8601 ou proche | Standard |
| Test 5 | Aucun test précédent concluant | R3 — Non disponible |

**Étape 4 — Construction du champ valeur (P2-2.A §3.5)**

Pour chaque ligne qualifiée, construire le champ valeur conforme au modèle P2-2.A :

- TRADE_HISTORY : horodatage d'exécution · paire · côté · prix d'exécution · quantité exécutée · montant total · frais
- ORDER_HISTORY FILLED : identifiant d'ordre · horodatage de création · horodatage d'exécution · paire · type d'ordre · côté · prix moyen d'exécution · quantité exécutée · montant total · taux de remplissage

**Valeurs de retour**

| Statut | Contenu retourné |
|---|---|
| qualifié | statut · valeur de date (état EP-RC2) · champ valeur |
| exclu | statut uniquement |
| rejeté | statut uniquement |

---

## §8 Composant 4 — Core et registre des adaptateurs

### §8.1 Localisation

Nouveau fichier à créer : `src/js/ingestion/ingestion-core.js`

### §8.2 Registre des adaptateurs

Le registre est un tableau ordonné d'adaptateurs déclarés dans ce fichier. En Phase A, il contient un seul adaptateur enregistré : l'adaptateur Binance S1 (composant 3). L'ordre de déclaration détermine la priorité de résolution.

L'enregistrement d'un nouvel adaptateur en Phase B+ ne nécessite aucune modification du Core (I-D4, P2-2.D §4).

### §8.3 Fonction ingest(descriptor)

Point d'entrée unique du pipeline (P2-2.D §8.1). Implémente la séquence en 11 étapes.

| Étape | Description | Source contractuelle |
|---|---|---|
| 1 — Résolution | Parcourir le registre · appeler canHandle(descriptor) sur chaque adaptateur · premier vrai = adaptateur sélectionné · si aucun : retourner erreur "source non reconnue" · fin du pipeline | P2-2.D §7.3 · §8.2 |
| 2 — Empreinte | Appeler adapter.fingerprint(descriptor) · stocker la valeur | P2-2.D §8.2 |
| 3 — Déduplication | Appeler findByFingerprint(fingerprint) · si entrée trouvée : retourner information doublon (sourceId · importedAt · traceCount) · fin du pipeline | P2-2.C §4.4 · P2-2.D §8.2 |
| 4 — Session | Générer un identifiant de session unique · stocker pour toutes les traces de cette opération | P2-2.C §5.1 · P2-2.D §8.2 |
| 5 — Extraction | Appeler adapter.extractEvents(descriptor) · récupérer tableau d'événements bruts · totalCount · sourceType | P2-2.D §8.2 |
| 6 — Qualification | Pour chaque événement : appeler adapter.processEvent(event) · accumuler qualified · excluded · rejected · distribution des états de date (standard · R1 · R3 · R4) | P2-2.D §8.2 |
| 7 — Construction du contexte | Consolider les compteurs de l'étape 6 · construire l'objet contexte de session : type de source · totalLines · qualified · excluded · rejected · résultat provisoire | P2-2.C §3.3 · P2-2.D §8.2 |
| 8 — Écriture | Pour chaque événement qualifié : assembler la trace (§8.4) · appeler writeIngestedTrace(trace) · accumuler written · failed · poursuite même en cas d'échec individuel | P2-2.C §5.2 · P2-2.D §8.2 |
| 9 — Registre | Si written ≥ 1 : appeler addEntry({fingerprint · sessionId · sourceId · importedAt · traceCount: written}) | P2-2.C §4.4 · P2-2.D §8.2 |
| 10 — Index | Lire index.bySession[sessionId] et index.byFamille[adapter.famille] · comparer avec written · consigner tout écart dans le rapport | P2-2.C §7 · P2-2.D §8.2 |
| 11 — Rapport | Assembler et retourner le rapport de session (§8.5) | P2-2.C §5.3 · P2-2.D §8.2 |

### §8.4 Assemblage de la trace qualifiée

Pour chaque événement dont processEvent() retourne le statut `qualifié`, le Core assemble la trace canonique avant de l'écrire (P2-2.D §8.3) :

| Champ | Source |
|---|---|
| famille | adapter.famille |
| source | adapter.getSourceId(descriptor) |
| date | Valeur de date retournée par processEvent() |
| valeur | Champ valeur retourné par processEvent() |
| session | Identifiant généré à l'étape 4 |
| contexte | Objet construit à l'étape 7 |

### §8.5 Rapport de session

Le rapport retourné par ingest() suit le contrat P2-2.C §5.3 :

| Champ | Contenu |
|---|---|
| sessionId | Identifiant de la session |
| sourceId | adapter.getSourceId(descriptor) |
| totalLines | Nombre total d'événements bruts (étape 5) |
| qualified | Lignes qualifiées (étape 6) |
| excluded | Lignes exclues hors périmètre S1 (étape 6) |
| rejected | Lignes rejetées per RF-R6 (étape 6) |
| written | Traces écrites avec succès (étape 8) |
| failed | Traces dont l'écriture a échoué (étape 8) |
| dateStates | Distribution des états EP-RC2 : { standard · R1 · R3 · R4 } (étape 6) |
| result | "succès" · "succès partiel" · "échec" — per P2-2.C §5.3 |

---

## §9 Composant 5 — Interface opérateur

### §9.1 Localisation

Fichiers existants à modifier : `src/index.html` · `src/js/render.js`

### §9.2 Zone d'import dans l'onglet Mémoire

Conformément à DT-4 Option B (P2-2.D §9.3) : une zone d'import de source est intégrée à l'onglet Mémoire. Elle est visuellement distincte du diagnostic mémoriel existant (LOT-P1-3) et n'interfère pas avec ses données.

L'opérateur soumet un fichier via cette zone. L'interface lit le fichier sélectionné, construit le descripteur Phase A (`type = "file"` · `data` = contenu binaire · `meta.name` = nom du fichier tel que fourni par l'opérateur) et appelle ingest(descriptor).

### §9.3 Étapes d'interaction

| Étape | Interface |
|---|---|
| Sélection de fichier | Zone de sélection accessible dans l'onglet Mémoire |
| Déclenchement | Action explicite de l'opérateur |
| En cours | Indicateur visible pendant l'exécution du pipeline |
| Résultat | Rapport d'import affiché immédiatement à la fin du pipeline |

### §9.4 Affichage du rapport

| Situation | Information présentée à l'opérateur |
|---|---|
| Succès | Traces écrites · lignes exclues · lignes rejetées · distribution des états EP-RC2 · résultat "succès" |
| Succès partiel | Même information · résultat "succès partiel" · nombre d'échecs d'écriture |
| Échec | Zéro trace écrite · résultat "échec" · raison si identifiable |
| Doublon | Source déjà ingérée · sourceId · date du premier import · nombre de traces du premier import |
| Source non reconnue | Retour explicite · aucune trace écrite · aucune session créée |

Le rapport est affiché immédiatement à la fin du pipeline. Il n'est pas persisté — seul le corpus canonique et le registre d'ingestion constituent les traces durables de l'opération (P2-2.D §9.5).

### §9.5 Contraintes d'isolation

- L'interface d'ingestion ne lit aucune donnée du module comportemental.
- Elle n'émet aucun signal vers l'onglet Comportement.
- L'import comportemental existant n'est pas affecté.

---

## §10 Ordre des commits

| Numéro | Périmètre | Contenu |
|---|---|---|
| 1 | feat(canonical): writeIngestedTrace | Ajout de writeIngestedTrace dans canonical-store.js — composant 1 |
| 2 | feat(ingestion): registre d'ingestion | Création de ingestion-registry.js · CE_ingestion_registry_v1 — composant 2 |
| 3 | feat(ingestion): adaptateur Binance S1 Phase A | Création de binance-s1-adapter.js · 6 capacités · EP-RC2 · Test 3b — composant 3 |
| 4 | feat(ingestion): Core ingest et registre des adaptateurs | Création de ingestion-core.js · pipeline 11 étapes · registre des adaptateurs — composant 4 |
| 5 | feat(ux): zone import ingestion S1 dans onglet Mémoire | Modification index.html + render.js · zone import · affichage rapport — composant 5 |

Les commits 1 à 3 peuvent être réalisés et vérifiés dans n'importe quel ordre entre eux. Le commit 4 requiert les commits 1, 2 et 3. Le commit 5 requiert le commit 4.

---

## §11 Prérequis P2-2.F

Les conditions suivantes doivent être satisfaites avant l'ouverture de P2-2.F — Validation terrain :

| Prérequis | Condition |
|---|---|
| PR-1 | writeIngestedTrace implémentée · exportée · validation RV1-RV4 opérationnelle · ingestedAt produit |
| PR-2 | Registre CE_ingestion_registry_v1 opérationnel : readRegistry · findByFingerprint · addEntry persistant après rechargement |
| PR-3 | Adaptateur Binance S1 complet : 6 capacités opérationnelles · EP-RC2 avec Test 3b · champs valeur TRADE_HISTORY et ORDER_HISTORY FILLED |
| PR-4 | Core ingest(descriptor) complet : séquence 11 étapes · rapport de session conforme P2-2.C §5.3 |
| PR-5 | Interface opérateur accessible dans l'onglet Mémoire · déclenchement fonctionnel · rapport affiché |
| PR-6 | Zéro régression LOT-P1-2 : traces SY1 · SY3 · S2 existantes intactes après un import S1 |
| PR-7 | Zéro régression module comportemental : import comportemental existant fonctionnel et indépendant |

---

## §12 Critères de validation

| CV | Critère | Condition de satisfaction |
|---|---|---|
| CV-E1 | writeIngestedTrace disponible | La fonction est exportée depuis canonical-store.js · accepte les 4 états de date EP-RC2 sans erreur de validation |
| CV-E2 | Registre persistant | readRegistry() retourne le registre correct après rechargement de page |
| CV-E3 | Déduplication active | findByFingerprint() détecte une empreinte précédemment enregistrée |
| CV-E4 | canHandle correct | canHandle(descriptor) retourne vrai pour un fichier Binance valide · faux pour un fichier non reconnu |
| CV-E5 | extractEvents correct | extractEvents() retourne le tableau d'événements bruts attendu pour un fichier CSV Binance et un fichier PDF Binance |
| CV-E6 | processEvent correct | processEvent() applique Condition 2 (FILLED) · Condition 3 (champs minimaux) · EP-RC2 avec Test 3b · retourne statut qualifié · exclu · rejeté selon le cas |
| CV-E7 | Core séquence complète | ingest(descriptor) exécute les 11 étapes et retourne un rapport conforme à tous les champs de P2-2.C §5.3 |
| CV-E8 | Interface opérateur | La zone import est visible dans l'onglet Mémoire · déclenche ingest() · affiche le rapport dans les cinq situations définies en §9.4 |

---

## §13 Conditions de clôture

| Condition | Critère |
|---|---|
| Condition 1 | CV-E1 à CV-E8 satisfaits |
| Condition 2 | PR-1 à PR-7 satisfaits |
| Condition 3 | DQC V2 CAS A sur ce document |
| Condition 4 | Validation opérateur explicite |
