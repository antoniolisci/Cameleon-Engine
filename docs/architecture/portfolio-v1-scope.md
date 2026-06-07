# Portefeuille Utilisateur V1 — Cadrage de périmètre

> Document de cadrage produit · Non implémentable · 2026-06-07 · Prérequis : ADU-04 ✅ · MEM-01B ✅ · Identité locale opérationnelle

---

## 1. Contexte

### Position dans la roadmap officielle

Le chantier Portefeuille Utilisateur est en position 1 de la roadmap officielle post-Constellium (`docs/roadmap/roadmap-realignment-post-constellium.md` — MàJ 2026-06-06).

| # | Chantier | Statut |
|---|---|---|
| 1 | **Portefeuille utilisateur** | **En attente de signal terrain** |
| 2 | Mémoire opérateur | Dépend du Portefeuille |
| 3 | PDF Import V1 | Dépend de la Mémoire opérateur |
| 4 | Compte utilisateur | Post-mise en ligne |
| 5 | Paiement | Post-Compte |
| 6 | Mise en ligne | — |
| 7 | Validation terrain | — |
| 8 | Macro V1 | Différé post-mise en ligne |
| 9 | Corrélations personnelles avancées | Dépend du Portefeuille + Mémoire opérateur |

### Pourquoi le Portefeuille est le premier pilier

La chaîne de valeur de Caméléon Engine repose sur trois couches d'observation de l'opérateur :

1. **Comportement de trading** — ce que l'opérateur fait (imports CSV/XLSX · sessions comportementales)
2. **Exposition réelle** — ce que l'opérateur possède à un instant donné (Portefeuille)
3. **Corrélations personnelles** — ce que l'opérateur révèle par la durée et la répétition (futur)

Le Portefeuille est la couche 2. Sans lui, la couche 3 n'a pas de second axe. La Mémoire opérateur (position 2 roadmap) dépend d'une représentation persistante de l'exposition pour construire une mémoire complète — le comportement seul ne suffit pas.

La prochaine couche d'intelligence du moteur est structurellement bloquée tant que le Portefeuille n'existe pas.

## 2. Problème à résoudre

### État actuel

Caméléon Engine dispose aujourd'hui de plusieurs capacités opérationnelles :

- Analyse comportementale sur imports CSV/XLSX (Trade History · Order History · Wallet History)
- Sessions comportementales persistantes (FIFO 50 · `CE_behavior_sessions_v1__{uuid}`)
- Import Registry actif (FIFO 100 · `CE_import_registry_v1__{uuid}`)
- Identité locale UUID — namespacing 9 clés opérateur (`CE_identity_v1`)
- Export opérateur complet (`exportOperatorData()`)
- `wallet_analyzer.js` : importé par `uploader.js`, branché pipeline NON_TRADING/wallet, rendu `behavior-view.js`

### Ce qui manque

`wallet_analyzer.js` est connecté et fonctionnel. Mais les données wallet traitées sont **éphémères** : elles ne sont pas persistées dans le localStorage. Chaque rechargement de page efface l'état du portefeuille.

Il n'existe aucune représentation persistante de ce que l'opérateur possède.

Le moteur sait analyser les données wallet entrantes. Il ne sait pas encore représenter durablement l'état résultant.

### Ce que cela bloque

- Aucune lecture consolidée du portefeuille entre deux sessions.
- Aucune évolution temporelle observable de l'exposition.
- Aucune fondation pour la Mémoire opérateur (qui requiert exposition + comportement).
- Aucune fondation pour les Corrélations personnelles (position 9 roadmap).
- Aucun rattachement des actifs détenus à l'identité locale opérateur.

## 3. Objectifs du Portefeuille V1

### Objectifs principaux

1. **Persister l'état du portefeuille** — rendre durable ce qui est aujourd'hui éphémère. Un opérateur qui recharge la page ne doit pas perdre la représentation de son exposition.

2. **Représenter les actifs détenus** — construire une entité Actif stable, rattachée à l'identité locale, mise à jour par les imports Wallet History.

3. **Stocker les positions** — formaliser la notion de position (actif · quantité · statut) comme entité persistante, distincte de la session d'import.

4. **Permettre une lecture consolidée** — un opérateur doit pouvoir consulter son portefeuille courant indépendamment de toute session comportementale active.

5. **Rattacher le portefeuille à l'identité locale** — l'exposition doit appartenir à un UUID opérateur via `withUserKey()`, exactement comme les sessions comportementales et l'Import Registry.

6. **Intégrer l'export opérateur** — le Portefeuille V1 doit être inclus dans `exportOperatorData()`. Un backup opérateur sans l'exposition est incomplet.

7. **Servir de fondation aux corrélations futures** — les Corrélations personnelles (position 9 roadmap) nécessitent l'exposition comme second axe. Le Portefeuille V1 est leur condition préalable.

8. **Préparer la Mémoire opérateur** — la Mémoire opérateur (position 2 roadmap) intégrera l'évolution de l'exposition sur la durée. Elle ne peut pas être construite sur un portefeuille éphémère.

### Objectif secondaire

9. **Préparer l'intégration avec Constellium** — la représentation des actifs par catégorie (majeurs · altcoins · stablecoins) servira de base à la lecture Constellium future. Le Portefeuille V1 ne consomme pas Constellium. Il prépare la couche qui le fera.

## 4. Hors périmètre explicite

Les éléments suivants sont **exclus du Portefeuille V1**. Leur mention dans une spécification ou une implémentation constitue une violation de périmètre.

### Exclusions absolues

| Élément exclu | Raison |
|---|---|
| Trading automatique | Contraire à la doctrine Caméléon Engine |
| Exécution d'ordres | Hors périmètre permanent |
| API de trading externe | Hors périmètre permanent |
| Recommandations d'actifs | Contraire à la doctrine |
| Signaux de marché | Fonction du moteur principal, pas du Portefeuille |
| Prédictions de valorisation | Contraire à l'ADN du moteur |
| IA décisionnelle | Hors périmètre permanent |
| Scoring de portefeuille | Non décidé · DÉCISION DIFFÉRÉE |
| Optimisation automatique | Contraire à la doctrine |
| Gestion fiscale | Hors périmètre V1 |
| Synchronisation temps réel | Contraire au modèle local-first |
| Connexion à une API de prix externe | Contraire au modèle local-first en V1 |
| Multi-utilisateur | Différé V2+ |
| Notation des actifs | Hors périmètre |
| Alertes de portefeuille | Hors périmètre V1 |
| Historique de prix | Nécessite source externe — exclu V1 |
| Backtesting | Hors périmètre permanent |
| Comparaison avec benchmarks | Hors périmètre |
| Intégration exchanges tiers | Hors périmètre V1 |

### Principe directeur des exclusions

Le Portefeuille V1 est une couche de représentation et de persistance. Il ne prend aucune décision. Il ne produit aucune recommandation. Il ne consulte aucune source externe. Il stocke ce que l'opérateur lui fournit via les imports existants.

## 5. Données minimales à représenter

Ces objets sont définis conceptuellement. Aucune structure technique détaillée n'est décidée ici. Les types de données, schémas, et clés localStorage exacts appartiennent au plan d'implémentation.

### Actif

Un actif est un token ou une devise détenu par l'opérateur.

| Propriété | Nature |
|---|---|
| Symbole | Identifiant de l'actif (ex. BTC, ETH, USDT) |
| Catégorie | Classification conceptuelle (ex. majeur · altcoin · stablecoin) |
| Présence dans le portefeuille | L'actif est-il actuellement détenu ? |
| Date de première observation | Horodatage du premier import contenant cet actif |

### Position

Une position est l'état courant de l'opérateur sur un actif donné.

| Propriété | Nature |
|---|---|
| Actif | Référence à l'actif concerné |
| Quantité | Montant détenu — déclaratif ou calculé depuis import |
| Statut | Ouvert · Fermé · Partiel |
| Source | Import ayant produit cette position |
| Horodatage | Date de dernière mise à jour |

### Snapshot portefeuille

Un snapshot est une photographie de l'état complet du portefeuille à un instant donné.

| Propriété | Nature |
|---|---|
| Date | Horodatage du snapshot |
| Composition | Liste des actifs et positions au moment du snapshot |
| Source d'import | Référence à l'import ayant déclenché le snapshot |
| Schéma version | Version du format pour compatibilité ascendante |

### Règle commune à tous les objets

Ces objets doivent être namespacés sous l'UUID opérateur via `withUserKey()`. Ils ne peuvent exister sans identité locale. Leur perte doit être récupérable via `exportOperatorData()`.

## 6. Relation avec les autres briques

### Matrice de dépendances

| Brique | Relation avec Portefeuille V1 |
|---|---|
| **Imports CSV/XLSX** | Source principale. Les imports Wallet History alimentent le Portefeuille. Le Portefeuille ne modifie pas le pipeline d'import existant. |
| **PDF Import V1** | Source future (position 3 roadmap). Les relevés PDF pourront alimenter le Portefeuille post-V1. Aucune dépendance immédiate en V1. |
| **Mémoire opérateur** | Dépend du Portefeuille. La Mémoire opérateur (position 2) intégrera l'évolution de l'exposition sur la durée. Le Portefeuille V1 est son prérequis direct. |
| **Sessions comportementales** | Orthogonal mais complémentaire. Une session comportementale analyse des trades. Le Portefeuille représente l'état résultant de l'exposition. Les deux coexistent sous le même UUID opérateur. |
| **Export opérateur** | Dépendance directe. Le Portefeuille doit être inclus dans `exportOperatorData()`. Un backup opérateur sans l'exposition est incomplet. |
| **Constellium** | Dépendance future. La composition par catégorie d'actifs alimentera la lecture Constellium. Aucune connexion en V1 — le Portefeuille prépare, il ne consomme pas. |
| **Macro V1** | Indépendant en V1. La couche Macro lit l'état de marché global, pas le portefeuille opérateur. Une corrélation future est possible post-Mémoire opérateur. |
| **Corrélations personnelles** | Dépend du Portefeuille. Les Corrélations personnelles (position 9 roadmap) croisent comportement de trading et exposition réelle. Sans Portefeuille persistant, elles sont architecturalement impossibles. |

### Flux entrant

```
Wallet History import (CSV/XLSX)
  → wallet_analyzer.js  (pipeline existant · NON_TRADING/wallet)
  → [Portefeuille V1]   persiste dans CE_portfolio_v1__{uuid}
```

### Flux sortant

```
CE_portfolio_v1__{uuid}
  → [lecture]  panel Portefeuille (UI)
  → [export]   exportOperatorData()
  → [futur]    Mémoire opérateur
  → [futur]    Corrélations personnelles
```

## 7. Questions ouvertes

Ces sujets ne sont pas décidés. Ils seront tranchés lors du chantier d'implémentation, sur signal terrain ou contrainte technique réelle. Aucune de ces questions ne peut être répondue de façon valide avant l'usage réel.

| Question | Nature | Statut |
|---|---|---|
| Source de valorisation des actifs | Valorisation temps réel (API externe) · déclarative (saisie manuelle) · ou à l'import uniquement ? | DÉCISION DIFFÉRÉE |
| Mode de saisie du portefeuille | Import Wallet History uniquement · ou saisie manuelle complémentaire autorisée ? | DÉCISION DIFFÉRÉE |
| Fréquence des snapshots | À chaque import · à chaque lancement · ou sur demande manuelle uniquement ? | DÉCISION DIFFÉRÉE |
| Représentation des stablecoins | Inclus au même titre que les autres actifs · ou traités séparément ? | DÉCISION DIFFÉRÉE |
| Représentation des actifs externes (hors Binance) | Inclus en V1 · différés · ou notation manuelle ? | DÉCISION DIFFÉRÉE |
| Clé localStorage exacte | Format du namespace · cap FIFO ou non · schéma version | DÉCISION DIFFÉRÉE |
| Cap de rétention des snapshots | Nombre maximal de snapshots conservés avant écrasement FIFO | DÉCISION DIFFÉRÉE |
| Politique de mise à jour | Un import annule-t-il le snapshot précédent · ou s'y ajoute-t-il ? | DÉCISION DIFFÉRÉE |
| Gestion des doublons d'import | Deux imports du même fichier : deux entrées ou mise à jour ? | DÉCISION DIFFÉRÉE |
| Affichage UI | Panel dédié · ou section dans l'onglet Mémoire existant ? | DÉCISION DIFFÉRÉE |

## 8. Critères de validation

Le Portefeuille V1 est déclaré terminé quand les conditions suivantes sont toutes satisfaites.

### Critères fonctionnels

1. Les données wallet importées survivent à un rechargement de page.
2. Le portefeuille est rattaché à l'UUID opérateur via `withUserKey()`.
3. Un snapshot portefeuille est créé après chaque import Wallet History réussi.
4. Le portefeuille est inclus dans `exportOperatorData()`.
5. La clé localStorage est namespacée selon la convention `CE_portfolio_v1__{uuid}`.

### Critères doctrinaux

6. Aucune valorisation en temps réel n'est implémentée.
7. Aucune API externe n'est appelée.
8. Le Portefeuille ne produit aucune recommandation.
9. L'isolation comportemental / moteur principal est respectée — le Portefeuille n'est pas couplé au moteur de score.
10. Aucun champ hors périmètre §4 n'est présent dans le schéma.

### Critères documentaires

11. `docs/architecture/architecture-donnees-utilisateur.md` est mis à jour pour refléter la clé `CE_portfolio_v1__{uuid}` et ses dépendances.
12. `docs/debt-audit.md` est mis à jour — dettes ouvertes et soldées.

## 9. Conclusion

Le Portefeuille V1 n'est pas un outil de trading.

Le Portefeuille V1 est une **couche de représentation et de mémoire de l'exposition opérateur**.

Son rôle est de rendre durable ce que `wallet_analyzer.js` rend déjà visible de façon éphémère. Il n'ajoute pas d'intelligence. Il construit l'infrastructure sur laquelle l'intelligence future pourra s'appuyer.

La hiérarchie est explicite et non contournable :

```
Portefeuille V1
  → Mémoire opérateur  (position 2 roadmap)
    → Corrélations personnelles  (position 9 roadmap)
```

Chaque étape de cette chaîne est un prérequis structurel de l'étape suivante. Un saut de séquence ne produit pas un système plus avancé — il produit un système dont les couches supérieures n'ont pas de fondation.

Le Portefeuille V1 est la première couche de cette fondation.

---

*Ce document est un cadrage de périmètre. Il ne déclenche aucune implémentation.*
*Toute ouverture de chantier d'implémentation doit référencer ce document*
*et démontrer que les questions ouvertes (§7) ont été tranchées.*
