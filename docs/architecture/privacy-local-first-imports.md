# Privacy — Imports locaux et confidentialité des données

**Statut :** Canonique
**Date :** 2026-05-31
**Domaine :** Architecture produit · Sécurité · Import de données

---

## Préambule

La doctrine "La confiance précède l'importation" (`doctrine-confiance-importation-v1.md`) définit quand et pourquoi l'opérateur importe des données. Ce document définit ce que Caméléon Engine fait — et ne fait jamais — avec ces données une fois importées.

Ces règles s'appliquent à toutes les sources d'import, actuelles et futures :

| Source | Statut actuel |
|--------|--------------|
| CSV Order History | Production — actif |
| CSV / XLSX Trade History | Production — actif |
| CSV Transaction History | En conception — chantier BMSM P1 |
| CSV Earn History | En conception — chantier BMSM P2 |
| PDF Binance | Doctrinal — en attente signal terrain |
| Journaux personnels PDF | Doctrinal — niveau 4 lointain |

## 1. Principes non négociables

Ces principes sont permanents. Ils ne peuvent pas être contournés, désactivés ou délégués à un composant tiers.

### LOCAL-FIRST

**Les données appartiennent à l'utilisateur.**

Aucun fichier importé — CSV, XLSX, PDF — ne quitte le navigateur à quelque moment que ce soit. Le traitement se fait entièrement en mémoire vive, sans persistance du contenu brut.

### PRIVACY-FIRST

**Le moteur ne doit jamais connaître l'identité de l'utilisateur.**

User_ID, UID Binance, adresses de retrait, email, historique financier, montants, soldes, données patrimoniales — ces informations sont supprimées lors de la normalisation, avant toute analyse.

### ZERO CLOUD

**Aucune donnée importée ne transite par un serveur.**

Aucun appel réseau pendant ou après l'import. Aucune API externe. Les bibliothèques de parsing sont vendorisées localement (SheetJS déjà dans `src/vendor/`).

### ZERO TELEMETRIE

**Aucun tracking de l'usage des fichiers importés.**

Le moteur ne sait pas combien de fichiers l'utilisateur importe, ni sur quelle période, ni quel exchange.

### ZERO EXFILTRATION

**Aucun export automatique des données normalisées.**

Les exports manuels (JSON de calibration, rapport comportemental) sont initiés par l'utilisateur et restent sur la machine locale.

## 2. Classification des données sensibles par source

### Order History

| Champ | Sensibilité | Traitement |
|------|------------|-----------|
| Date, Pair, Side, Price, Qty, Status | Non-PII — données de marché | Conservé après normalisation |
| Order ID | Identificateur technique | Pour réconciliation Order×Trade uniquement — non stocké après analyse |
| User ID (header PDF) | **PII — à supprimer** | Suppression avant normalisation |

### Trade History

| Champ | Sensibilité | Traitement |
|------|------------|-----------|
| Date, Pair, Side, Price, Qty, Fee | Non-PII — données de marché | Conservé après normalisation |
| Trade ID | Identificateur technique | Non stocké après analyse |
| User ID (header PDF) | **PII — à supprimer** | Suppression avant normalisation |

### Transaction History

| Champ | Sensibilité | Traitement |
|------|------------|-----------|
| Date, Operation, Coin, Change | Données financières — non PII si anonymisées | Conservé si analytiquement pertinent |
| Remark | Peut contenir des références externes | Supprimé sauf si pertinent |
| Adresse de retrait | **PII — à supprimer** | Suppression avant normalisation |
| Account ID, UID | **PII — à supprimer** | Suppression avant normalisation |
| Email | **PII — à supprimer** | Suppression avant normalisation |

### Earn History

| Champ | Sensibilité | Traitement |
|------|------------|-----------|
| Date, Product, Asset, Amount, APY | Données financières — non PII si anonymisées | Conservé après normalisation |
| User ID, Account ID | **PII — à supprimer** | Suppression avant normalisation |

### PDF (tous formats)

Les headers de page des PDF Binance contiennent le User_ID et souvent l'email. Le premier passage sur le document est un passage de suppression des PII, avant toute extraction de données.

## 3. Les cinq règles techniques

### Règle 1 — Aucun fichier brut ne survit à l'import

Le fichier est lu en mémoire via l'API `FileReader` du navigateur, traité immédiatement. Aucun `Blob`, aucun `ArrayBuffer`, aucune copie du fichier source n'est persisté en localStorage ou IndexedDB.

### Règle 2 — Suppression systématique des PII avant normalisation

Champs supprimés systématiquement : User_ID, UID, Account_ID, Client_ID, email, adresses de retrait, numéros de téléphone. Suppression dans le mapper, avant la couche `canonical.js`. Le moteur analytique ne reçoit jamais ces champs.

### Règle 3 — Aucune donnée importée ne quitte le navigateur

Aucun fetch vers un endpoint d'analyse. Aucune synchronisation cloud. Aucun envoi à un CDN. Aucune WebSocket pendant l'analyse. Vérifiable : le réseau reste silencieux dans l'onglet Network des DevTools.

### Règle 4 — Stockage localStorage minimal et structuré

Seules les données structurées normalisées peuvent persister.

| Ce qui est stocké | Ce qui n'est pas stocké |
|------------------|------------------------|
| Score comportemental, profil, patterns, dataQuality | Contenu brut CSV / XLSX / PDF |
| Timestamp de la session | Montants exacts, soldes absolus |
| — | User_ID, adresses, email, identifiants |

Cap FIFO 20 sessions via `session-repo.js`.

### Règle 5 — Compatibilité RGPD by design

Le moteur analyse Order History, Trade History, Transaction History, Earn History et PDF sans jamais identifier l'utilisateur.

**Droit à l'oubli natif :** "supprimer l'historique" efface toutes les données behavior en localStorage. Aucune copie distante.

**Minimisation des données :** seuls les ratios et métriques agrégées sont stockés — pas les montants exacts ni les soldes absolus.

**Transparence :** l'utilisateur peut à tout moment vider les données behavior via l'interface.

**Portabilité limitée au local :** les exports JSON ponctuels restent sur la machine de l'utilisateur.

## 4. Règles de garde pour les implémentations futures

**Avant d'accepter une nouvelle source d'import :**
1. Cartographier les champs PII potentiels dans le format source
2. Définir la règle de suppression avant toute normalisation
3. Documenter ce qui est stocké vs ce qui est libéré
4. Vérifier que le stockage localStorage respecte le cap FIFO existant

**Avant d'ajouter une bibliothèque de parsing :**
1. Vérifier qu'elle fonctionne entièrement côté navigateur (pas de dépendance Node.js)
2. Vendoriser localement — pas de CDN
3. Vérifier l'absence d'appels réseau dans le code source de la bibliothèque

**Signal d'alerte :** si une analyse nécessite des données que le moteur ne possède pas après suppression des PII, la réponse est de ne pas faire l'analyse — pas de conserver les PII.

## 5. Dette privacy existante

Dettes héritées de l'audit de sécurité de mai 2026. Non bloquantes pour P1/P2 du chantier BMSM, à résoudre avant déploiement public.

| ID | Dette | Priorité | Condition d'ouverture |
|---|---|---|---|
| PDF-06 | Confidentialité et stockage localStorage — modules PDF | Haute | Avant PDF V1 |
| PRIV-01 | `cameleon_behavior_memory_v1` écrit hors `storage.js` | Moyenne | Avant déploiement public |
| PRIV-02 | Lectures directes localStorage dans `render.js` | Moyenne | Avant déploiement public |
| PRIV-03 | `catch` dans `runMigration` peut masquer une erreur silencieuse | Basse | Avant déploiement public |

## Règle de garde finale

> **Le moteur peut analyser le comportement de trading sans jamais connaître l'identité du trader.**
>
> Si une analyse nécessite de savoir qui est l'utilisateur, ce n'est pas une analyse Caméléon Engine.

---

*Privacy — Imports locaux et confidentialité des données — 2026-05-31*
*Référence : docs/architecture/privacy-local-first-imports.md*
*Ne déclenche aucune implémentation. Aucun code.*
