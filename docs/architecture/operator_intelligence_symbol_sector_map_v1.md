# Operator Intelligence V1 — Table symbole → secteur

**Statut :** Référence canonique · V1 · Créée 2026-06-19  
**Scope :** Dimension Portefeuille de l'Operator Intelligence V1 uniquement  
**Maintenance :** Manuelle, par décision explicite de l'opérateur  
**Source :** `docs/architecture/operator_intelligence_symbol_sector_map_v1.md`

---

## 1. Règles de catégorisation

### R1 — Catégorisation comportementale, pas fondamentale

Un symbole est catégorisé selon son **rôle perçu dans l'écosystème crypto au moment de la saisie**, pas selon une analyse fondamentale de son protocole. La table sert à décrire le style d'activité de l'opérateur — elle n'émet pas de jugement sur la valeur des actifs.

### R2 — Secteur principal obligatoire, secteur secondaire optionnel

Chaque symbole a **un secteur principal** (obligatoire). Un secteur secondaire est assigné uniquement quand le positionnement est genuinement hybride et que l'ambiguïté impacte la lecture du Portefeuille. L'absence de secteur secondaire est la règle par défaut.

### R3 — Niveaux de confiance explicites

| Niveau | Signification |
|---|---|
| **Élevé** | Consensus large dans l'écosystème · classification stable dans le temps |
| **Moyen** | Positionnement reconnu mais susceptible d'évoluer ou débattu |
| **Faible** | Classification provisoire · dépend du contexte ou de la période |

### R4 — Résolution des conflits

Si un symbole change de positionnement dominant (ex. : un actif initialement DeFi devient Majeur), la table est mise à jour manuellement avec note de révision. L'ancienne classification n'est pas supprimée — elle est archivée en commentaire avec date.

### R5 — Symboles non mappés

Un symbole absent de la table retourne `secteur: "Inconnu"` avec confiance `Indisponible`. Le moteur ne déduit pas le secteur. Il ne bloque pas non plus l'analyse — il exclut ce symbole du calcul de diversification sectorielle tout en le comptabilisant dans le volume total.

---

## 2. Limites de la table

**Cette table ne prétend pas être :**
- Une classification financière officielle
- Une source de vérité sur la nature des protocoles
- Un jugement sur la pertinence ou la qualité des actifs
- Une analyse fondamentale stable dans le temps

**Cette table est :**
- Un outil de lecture comportementale de l'opérateur
- Une approximation utile et révisable
- Une référence interne au projet Caméléon Engine
- Valide uniquement pour la période de sa dernière révision

**Horizon de validité recommandé :** 6 mois. Révision obligatoire à chaque ouverture d'un nouveau chantier Portefeuille.

---

## 3. Secteurs officiels V1

| Identifiant | Nom complet | Description |
|---|---|---|
| `Majeurs` | Actifs majeurs | Actifs à capitalisation très élevée, liquidité profonde, usage généraliste |
| `IA` | Intelligence Artificielle | Protocoles IA, réseaux d'agents, infrastructure compute pour IA |
| `RWA` | Real World Assets | Tokenisation d'actifs réels : dette, immobilier, fonds, commodités |
| `DePIN` | Decentralized Physical Infrastructure | Réseaux d'infrastructure physique décentralisés : stockage, bande passante, GPU, énergie |
| `L1` | Layer 1 | Blockchains de couche 1 (hors Majeurs) : chaînes applicatives, chaînes de trading, L1 sectoriels |
| `Infrastructure` | Infrastructure Web3 | Middleware, oracles, outils inter-chaînes, protocoles de connectivité |
| `Privacy` | Confidentialité | Actifs dont la proposition principale est la confidentialité des transactions |
| `Stables` | Stablecoins | Actifs à parité fixe (USDT, USDC, FDUSD, etc.) — présents dans l'historique, non scorés sectoriellement |

> **Note V1 :** DeSci (science décentralisée) n'est pas un secteur officiel V1. Les actifs avec composante DeSci sont classés `DePIN` si leur infrastructure physique est dominante, ou `IA` si leur cas d'usage est principalement computationnel. La distinction DeSci sera reconsidérée en V2 si le corpus justifie un secteur dédié.

---

## 4. Table symbole → secteur

| Symbole | Secteur principal | Secteur secondaire | Confiance | Note |
|---|---|---|---|---|
| **BTC** | Majeurs | — | Élevé | Actif de référence. Store of value dominant. Liquidité maximale. |
| **ETH** | Majeurs | Infrastructure | Élevé | L1 fondateur, mais aussi couche d'infrastructure dominante du Web3. |
| **SOL** | Majeurs | L1 | Élevé | Majeur par capitalisation. L1 haute performance comme positionnement technique. |
| **BNB** | Majeurs | — | Élevé | Token d'exchange Binance. Majeur par capitalisation et volume. |
| **ADA** | Majeurs | L1 | Élevé | Cardano — L1 établi, classé Majeur par ancienneté et capitalisation historique. |
| **TAO** | IA | — | Élevé | Bittensor — réseau d'IA décentralisé. Cas d'usage IA pur. Consensus fort. |
| **FET** | IA | DePIN | Élevé | Fetch.ai (désormais ASI Alliance avec AGIX/OCEAN). Agents IA + infrastructure. |
| **RENDER** | IA | DePIN | Élevé | Render Network — GPU distribué pour rendu et charges IA. Double ancrage validé. |
| **ONDO** | RWA | — | Élevé | Ondo Finance — tokenisation de fonds d'obligations US. RWA institutionnel pur. |
| **PLUME** | RWA | L1 | Élevé | Plume Network — L1 dédié aux RWA. Infrastructure + cas d'usage RWA intrinsèques. |
| **LINK** | Infrastructure | RWA | Élevé | Chainlink — oracle décentralisé. Infrastructure fondamentale, activateur RWA clé. |
| **AR** | DePIN | Infrastructure | Élevé | Arweave — stockage permanent décentralisé. DePIN de données, infrastructure Web3. |
| **BIO** | DePIN | — | Moyen | BioProtocol — infrastructure décentralisée pour la recherche biomédicale. Composante DeSci importante mais classé DePIN V1 (infrastructure physique/données). |
| **INJ** | L1 | — | Élevé | Injective — L1 orienté DeFi et trading décentralisé. Pas encore Majeur par capitalisation. |
| **NEAR** | L1 | IA | Moyen | NEAR Protocol — L1 scalable, repositionné vers l'IA (NEAR AI). Double ancrage émergent. |
| **SEI** | L1 | — | Élevé | Sei Network — L1 optimisé pour le trading. Positionnement DeFi/trading assumé. |
| **SUI** | L1 | — | Élevé | Sui — L1 haute performance (Move VM). Croissance rapide, pas encore Majeur. |
| **ROSE** | Privacy | Infrastructure | Moyen | Oasis Network — réseau à confidentialité intégrée avec couche d'exécution sécurisée. |
| **XMR** | Privacy | — | Élevé | Monero — Privacy pur. Cas d'usage unique, consensus fort, classification stable. |

---

## 5. Règles de maintenance

### M1 — Déclencheurs de révision

La table doit être révisée dans les cas suivants :

| Déclencheur | Action |
|---|---|
| Nouveau symbole récurrent dans l'Order History d'un opérateur | Ajouter l'entrée avec classification + niveau de confiance |
| Repositionnement majeur d'un protocole existant | Mettre à jour secteur principal / secondaire + archiver l'ancienne valeur |
| Émergence d'un nouveau secteur dominant non couvert par V1 | Ouvrir un chantier Table V2 |
| Révision du corpus OI V1 (nouveau profil d'opérateur) | Vérifier que les symboles du nouveau profil sont couverts |

### M2 — Format d'archivage d'une révision

```
<!-- RÉVISION YYYY-MM-DD : [SYMBOLE] secteur principal était [ancien] → [nouveau]. Raison : [motif bref]. -->
```

### M3 — Ce que la maintenance n'est pas

- La table n'est pas mise à jour à chaque commit du moteur
- La table n'est pas synchronisée avec des sources externes (CoinGecko, CoinMarketCap)
- La table n'est pas versionnée automatiquement — les révisions sont tracées dans ce fichier par commentaire

---

## 6. Impact sur la dimension Portefeuille

La Dimension Portefeuille de l'OI V1 utilise cette table pour calculer :

**Ce qui est calculé :**
- Nombre de secteurs actifs dans l'Order History analysé
- Répartition du volume d'ordres (FILLED) par secteur
- Ratio secteur dominant / secteurs secondaires
- Symboles non mappés (secteur `Inconnu`) — comptabilisés en volume, exclus du scoring sectoriel

**Ce qui détermine l'état :**

| État Portefeuille | Condition indicative |
|---|---|
| **Thématique** | ≥70% du volume concentré sur 1–2 secteurs identifiables |
| **Multi-actifs** | Volume réparti sur ≥4 secteurs sans dominante claire |
| **Opportuniste** | Concentration forte mais sur secteurs non corrélés entre eux (ex. : Privacy + RWA) |

> Les seuils exacts (70%, 4 secteurs, etc.) seront calibrés lors de l'implémentation sur le corpus réel. Ces valeurs sont indicatives V1.

**Seuil minimum pour activer la Dimension Portefeuille :**
- ≥5 symboles distincts dans l'Order History analysé
- ≥80% des symboles présents dans la table (sinon : confiance `Faible`)
- En-dessous de 80% : confiance `Faible` explicitement déclarée dans la restitution

---

## 7. Ce que le moteur pourra dire

Ces formulations respectent les frontières épistémiques OI V1 (règles E1–E5) :

> *"Sur la période analysée, l'activité est concentrée à 78% sur des actifs classés IA et DePIN."*

> *"Le portefeuille observé couvre 5 secteurs distincts : Majeurs, IA, RWA, L1, Infrastructure."*

> *"Aucun secteur dominant identifiable — style Portefeuille : Multi-actifs (confiance : Moyen)."*

> *"3 symboles non mappés dans la table V1 (HYPE, PENGU, WIF) — exclus du calcul sectoriel. Volume total non-mappé : 12%."*

> *"Concentration sectorielle sur IA : 61% du volume d'ordres sur 3 symboles (TAO, FET, RENDER)."*

---

## 8. Ce que le moteur ne devra jamais dire

Ces formulations violent les frontières épistémiques — elles déduisent des intentions, des convictions, ou une identité à partir de comportements observés :

> ~~*"L'opérateur croit à l'IA."*~~

> ~~*"L'opérateur a une conviction RWA."*~~

> ~~*"Ce portefeuille reflète une thèse sur la dépréciation du dollar."*~~

> ~~*"L'opérateur est un investisseur thématique."*~~

> ~~*"Ce profil indique un appétit pour le risque élevé."*~~

> ~~*"L'opérateur anticipe la rotation sectorielle vers les RWA."*~~

**Règle de test :** Si la phrase peut être réfutée par l'opérateur en disant *"ce n'est pas ce que je pense"*, elle viole E1 (observable → description, jamais → explication causale). La reformulation correcte décrit le **comportement observable**, pas l'état mental supposé.

---

## Références

- Doctrine fondatrice : `docs/doctrine/operator_intelligence_v1.md` — règles E1–E5, L1–L6
- Audit corpus : `docs/architecture/operator_intelligence_corpus_audit.md`
- Dimension Portefeuille : §4 de la doctrine OI V1

---

*Cette table est la référence V1 pour la classification sectorielle dans Caméléon Engine.*  
*Elle est révisable uniquement par décision explicite de l'opérateur.*  
*Elle ne constitue pas un conseil financier ni une analyse fondamentale des actifs listés.*
