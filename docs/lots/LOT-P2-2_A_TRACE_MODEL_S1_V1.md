# LOT-P2-2.A — Modèle de trace S1 V1

## En-tête

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P2-2.A |
| Intitulé | Modèle de trace S1 V1 |
| Micro-lot parent | LOT-P2-2 — Parser S1 · Fichiers transactionnels V1 |
| Programme | P2 — Ingestion des données |
| Phase Roadmap V1 | A |
| Type | Modèle — Définition de trace |
| Document officiel | `docs/lots/LOT-P2-2_A_TRACE_MODEL_S1_V1.md` |
| Statut | EN COURS |
| Date d'ouverture | 2026-07-09 |

---

## §1 Mission

LOT-P2-2.A définit la structure exacte d'une trace S1 produite par import d'un fichier transactionnel Binance dans Caméléon Engine Phase A.

Ce micro-lot est purement doctrinal : aucun code, aucune implémentation. Il produit le modèle de référence que devront respecter les micro-lots P2-2.B à P2-2.E pour toute écriture canonique S1.

Le modèle couvre six dimensions : **famille · source · date · valeur · contexte · session**. Il est décliné pour chacun des quatre formats Binance Phase A : TRADE_HISTORY CSV · ORDER_HISTORY FILLED CSV · TRADE_HISTORY PDF · ORDER_HISTORY FILLED PDF.

Ce micro-lot tranche également les décisions DT-2 (déduplication) et DT-5 (date de la trace).

---

## §2 Prérequis

| Document | Rôle dans ce micro-lot |
|---|---|
| LOT-P2-2 — Cadrage V1 | Périmètre S1 Phase A · Invariants INV-1→9 · Décisions DT-2 et DT-5 à trancher ici |
| LOT-P2-1 §12 RF-R5 | Classification fichier structuré → S1 (événement ponctuel) |
| LOT-P2-1 §12 DI4 | Critère S1 = événement ponctuel d'échange |
| LOT-P2-1 §13 FB-F5 | Frontière S1/S2 appliquée ligne par ligne |
| LOT-P2-1 §14 EP-S1 · EP-RC2 | Exigences de provenance S1 · Quatre comportements de date |
| LOT-P2-1 §15 CL-P3 Variante A | Ingestion avec état de date formalisé (R1/R3/R4) |
| LOT-P1-2.1 §4.5 Entrée 9 | Modèle canonique de la trace S1 : famille · source · date · contexte |
| LOT-P1-2.4 §4.3 §6.3 §7.4 | Source officielle S1 · session S1 · contexte S1 |
| PDF Import V1 | Structures de colonnes validées : TRADE_HISTORY (7 col.) · ORDER_HISTORY (12 col.) |

---

## §3 Structure canonique d'une trace S1

### §3.1 Rappel du modèle canonique

Toute trace mémorielle de la couche canonique comporte quatre champs définis par LOT-P1-2.1 :

| Champ canonique | Rôle |
|---|---|
| Famille | Identifiant ACF V1 de la famille mémorielle |
| Source | Module ou opération à l'origine de l'écriture |
| Date | Horodatage de référence de la trace |
| Contexte | Enrichissement contextuel optionnel |

Le modèle S1 Phase A étend cette structure avec deux dimensions opérationnelles : **valeur** (contenu transactionnel de la trace) et **session** (identifiant de l'opération d'import).

### §3.2 Champ Famille

**Valeur constante : `S1`**

Toute trace produite par le parser S1 porte la famille S1 — Transactionnelle. Cette valeur est invariante, déterminée en amont par la règle RF-R5 (fichier structuré → S1 événement ponctuel, per DI4). Elle ne dépend ni du format du fichier, ni du contenu de la ligne.

### §3.3 Champ Source

**Valeur : nom du fichier importé, tel que fourni par l'opérateur.**

La source de la trace S1 est l'identifiant externe du fichier source, conformément à EP-S1. Elle identifie l'origine externe de la donnée, pas le module d'import lui-même.

| Dimension | Valeur |
|---|---|
| Module écrivant (LOT-P1-2.4 §4.3) | Module d'import |
| Identifiant source de la trace | Nom du fichier importé |
| Format | Chaîne de caractères fournie par l'opérateur au moment de l'import |

Le nom de fichier est retenu comme identifiant externe car il est le seul identifiant stable fourni par l'opérateur à l'instant de l'import. Il n'est pas normalisé ni transformé.

### §3.4 Champ Date

**Valeur : date d'exécution du trade ou de l'ordre, extraite du contenu de la ligne, per EP-RC2.**

La date d'une trace S1 représente le moment où l'événement transactionnel a eu lieu — pas le moment de l'import. Cette décision est cohérente avec la sémantique de S1 (événement ponctuel d'échange) : la valeur temporelle de la trace est celle de l'événement réel.

#### Résolution DT-5 — Date de la trace S1

**Décision : date d'exécution du trade ou de l'ordre extrait du contenu de la ligne, per EP-RC2.**

Les options B (plage min/max) et C (date du dernier enregistrement) produiraient une date agrégée, incompatible avec DI4 (S1 = événement ponctuel). L'option A (date d'import — now) efface l'information temporelle réelle de l'événement. La date extraite per EP-RC2 est la seule option compatible avec la doctrine S1.

#### Application d'EP-RC2 par format

| Format | Colonne source | Comportement EP-RC2 |
|---|---|---|
| TRADE_HISTORY CSV | Colonne date (alias : Date, Date(UTC), Date(UTC+2), etc.) | ISO 8601 ou variante → extraction directe · Epoch ms → conversion UTC · Absent → R1 · Non conforme → R3 |
| ORDER_HISTORY FILLED CSV | Colonne date d'exécution (alias : execution_time, Date d'exécution, etc.) | Identique TRADE_HISTORY CSV |
| TRADE_HISTORY PDF | Colonne Durée (position [0]) | Format "YY-MM-DD HH:MM:SS" avec décalage +02:00 → UTC · Absent → R1 · Non conforme → R3 |
| ORDER_HISTORY FILLED PDF | Colonne execution_time (position [7]) | Format identique TRADE_HISTORY PDF · Valeur "--" → R1 (non disponible) |

#### États de date EP-RC2 formalisés

| État | Signification | Comportement d'ingestion |
|---|---|---|
| Standard | Date extraite, conforme ISO 8601 ou convertie en UTC ms | Trace ingérée avec date renseignée |
| R4 — Non exploitable au format canonique | Date présente mais non convertible (epoch ms hors plage, format tronqué) | Trace ingérée avec état R4 formalisé (CL-P3 Variante A) |
| R1 — Non disponible | Champ date absent dans la ligne | Trace ingérée avec état R1 formalisé (CL-P3 Variante A) |
| R3 — Non disponible | Champ date présent mais non conforme à tout format reconnu | Trace ingérée avec état R3 formalisé (CL-P3 Variante A) |

### §3.5 Champ Valeur

Le champ Valeur contient le contenu transactionnel normalisé de la trace. Il varie selon le format source.

#### Valeur — TRADE_HISTORY (CSV et PDF)

| Dimension sémantique | Description |
|---|---|
| Horodatage d'exécution | Date et heure UTC du trade exécuté (per EP-RC2) |
| Paire | Symbole de l'instrument échangé (ex. : BTCUSDT) |
| Côté | Sens de l'opération : BUY ou SELL |
| Prix d'exécution | Prix unitaire effectif du trade |
| Quantité exécutée | Quantité en actif de base effectivement échangée |
| Montant total | Montant en actif de cotation (quantité × prix) |
| Frais | Valeur des frais de transaction et devise associée |

#### Valeur — ORDER_HISTORY FILLED (CSV et PDF)

| Dimension sémantique | Description |
|---|---|
| Identifiant d'ordre | Référence unique de l'ordre (orderId) |
| Horodatage de création | Date et heure UTC de la création de l'ordre |
| Horodatage d'exécution | Date et heure UTC de l'exécution complète (per EP-RC2) |
| Paire | Symbole de l'instrument |
| Type d'ordre | Nature de l'ordre : Limit, Market, ou autre |
| Côté | Sens de l'opération : BUY ou SELL |
| Prix moyen d'exécution | Prix moyen effectif de remplissage |
| Quantité exécutée | Quantité en actif de base effectivement échangée |
| Montant total | Montant en actif de cotation |
| Taux de remplissage | Rapport quantité exécutée / quantité commandée |

#### Différence structurelle TRADE_HISTORY / ORDER_HISTORY FILLED

| Dimension | TRADE_HISTORY | ORDER_HISTORY FILLED |
|---|---|---|
| Frais | Présents explicitement | Non disponibles directement |
| Identifiant d'ordre | Non disponible | Présent (orderId) |
| Type d'ordre | Non disponible | Présent (Limit / Market) |
| Taux de remplissage | Non applicable (exécution totale) | Présent (fillRate) |
| Horodatage de création | Non disponible | Présent (created_at) |

Les deux formats produisent des traces S1 valides. L'absence de certaines dimensions dans un format n'est pas un état d'erreur — c'est la structure normale du format source.

### §3.6 Champ Contexte

**Valeur : enrichissement optionnel de l'opération d'import, conforme à LOT-P1-2.4 §7.4.**

Le contexte n'est pas porté par chaque ligne individuelle mais par l'opération d'import dans son ensemble. Il est associé à la session et attaché à chaque trace produite dans cette session.

| Dimension contextuelle | Contenu |
|---|---|
| Type de fichier | Format reconnu : TRADE_HISTORY CSV · ORDER_HISTORY CSV · TRADE_HISTORY PDF · ORDER_HISTORY PDF |
| Nombre d'enregistrements | Nombre total de lignes dans le fichier source (toutes lignes, avant filtrage) |
| Lignes ingérées | Nombre de lignes ayant produit une trace S1 valide |
| Lignes exclues | Nombre de lignes exclues du périmètre S1 (ex. : ORDER_HISTORY lignes NEW/CANCELED) |
| Lignes rejetées | Nombre de lignes rejetées per RF-R6 (format non classifiable) |
| Résultat de l'import | Synthèse : succès · succès partiel · échec |

### §3.7 Champ Session

**Valeur : identifiant unique de l'opération d'import.**

Conformément à LOT-P1-2.4 §6.3 : la session S1 correspond à une opération d'import de fichier source. Toutes les traces S1 produites lors d'un même import partagent le même identifiant de session.

| Propriété | Valeur |
|---|---|
| Portée | Une opération d'import (un fichier · un déclenchement) |
| Unicité | Chaque import autorisé produit une session distincte · deux imports du même fichier sont bloqués par la déduplication (DT-2) |
| Génération | Identifiant généré au démarrage de l'opération d'import |
| Forme | Chaîne unique non significative (non dérivée du contenu du fichier) |

---

## §4 Résolution DT-2 — Déduplication

### §4.1 Problème

Un même fichier importé deux fois produirait deux jeux de traces S1 identiques dans le corpus. Sans mécanisme de déduplication, l'intégrité du corpus S1 n'est pas garantie.

### §4.2 Décision

**Option B — Empreinte par fichier (fingerprint du contenu total).**

Une empreinte du contenu brut du fichier est calculée au moment de l'import. Si cette empreinte correspond à un import antérieur enregistré dans le registre de sessions, l'import est bloqué et l'opérateur est informé.

### §4.3 Justification

| Critère | Option A (par ligne) | Option B (par fichier) | Option C (aucune) |
|---|---|---|---|
| Protection contre double import | Partielle (détecte overlaps) | Complète (bloque fichier identique) | Aucune |
| Complexité d'implémentation | Élevée | Faible |  Nulle |
| Cas Phase A | Fichiers Binance complets, sans overlap partiel documenté | Adapté | Risque corpus |
| Alignement principe de simplicité | Non | Oui | Non (dette) |

En Phase A, les fichiers Binance importés sont des exports complets. Le risque d'overlap partiel entre deux fichiers distincts est non documenté et hors périmètre. L'empreinte par fichier couvre le cas dominant avec une complexité minimale.

### §4.4 Comportement en cas de doublon détecté

Import bloqué. Aucune trace S1 écrite. Retour d'information explicite à l'opérateur : fichier déjà importé, date du premier import, nombre de traces produites lors du premier import.

---

## §5 Modèle complet par format

### §5.1 TRADE_HISTORY CSV

| Dimension | Valeur |
|---|---|
| Famille | S1 |
| Source | Nom du fichier CSV importé |
| Date | Date d'exécution du trade, extraite de la colonne date per EP-RC2 |
| Valeur | Horodatage · paire · côté · prix · quantité · montant · frais |
| Contexte | Type : TRADE_HISTORY CSV · nb enregistrements · lignes ingérées · lignes rejetées · résultat |
| Session | Identifiant unique de l'opération d'import |

### §5.2 ORDER_HISTORY FILLED CSV

| Dimension | Valeur |
|---|---|
| Famille | S1 |
| Source | Nom du fichier CSV importé |
| Date | Date d'exécution de l'ordre (execution_time), extraite per EP-RC2 · "--" → R1 |
| Valeur | orderId · horodatage création · horodatage exécution · paire · type · côté · prix moyen · quantité exécutée · montant · taux de remplissage |
| Contexte | Type : ORDER_HISTORY CSV · nb enregistrements · lignes ingérées (FILLED) · lignes exclues (NEW/CANCELED) · résultat |
| Session | Identifiant unique de l'opération d'import |

### §5.3 TRADE_HISTORY PDF

| Dimension | Valeur |
|---|---|
| Famille | S1 |
| Source | Nom du fichier PDF importé |
| Date | Colonne Durée (position [0]) · Format "YY-MM-DD HH:MM:SS" → UTC per EP-RC2 |
| Valeur | Horodatage · paire · côté · prix · quantité · montant · frais |
| Contexte | Type : TRADE_HISTORY PDF · nb enregistrements · lignes ingérées · lignes rejetées · résultat |
| Session | Identifiant unique de l'opération d'import |

### §5.4 ORDER_HISTORY FILLED PDF

| Dimension | Valeur |
|---|---|
| Famille | S1 |
| Source | Nom du fichier PDF importé |
| Date | Colonne execution_time (position [7]) · Format "YY-MM-DD HH:MM:SS" → UTC · "--" → R1 |
| Valeur | orderId · horodatage création · horodatage exécution · paire · type · côté · prix moyen · quantité exécutée · montant · taux de remplissage |
| Contexte | Type : ORDER_HISTORY PDF · nb enregistrements · lignes ingérées (FILLED) · lignes exclues (NEW/CANCELED) · résultat |
| Session | Identifiant unique de l'opération d'import |

---

## §6 Décisions tranchées dans ce micro-lot

| ID | Décision | Retenue |
|---|---|---|
| DT-2 | Déduplication S1 | Option B — empreinte par fichier · import bloqué si doublon |
| DT-5 | Date de la trace S1 | Date d'exécution du trade/ordre extraite du contenu per EP-RC2 · non la date d'import |

---

## §7 Critères de validation de ce micro-lot

| CV | Critère | Condition de satisfaction |
|---|---|---|
| CV-A1 | Complétude du modèle | Les 6 dimensions (famille · source · date · valeur · contexte · session) sont définies pour les 4 formats Phase A |
| CV-A2 | Conformité EP-RC2 | Les 4 états de date (Standard / R4 / R1 / R3) sont documentés et associés à leur source colonne par format |
| CV-A3 | Différenciation TRADE/ORDER | Les valeurs transactionnelles propres à chaque format sont explicitement distinguées |
| CV-A4 | DT-2 tranchée | Décision de déduplication documentée et justifiée |
| CV-A5 | DT-5 tranchée | Décision de date de trace documentée et justifiée |
| CV-A6 | Conformité DI4 | Aucun élément du modèle ne contredit S1 = événement ponctuel |

---

## §8 Conditions de clôture de ce micro-lot

| Condition | Critère |
|---|---|
| Condition 1 | CV-A1 à CV-A6 satisfaits |
| Condition 2 | DQC V2 CAS A sur ce document |
| Condition 3 | Validation opérateur explicite |
