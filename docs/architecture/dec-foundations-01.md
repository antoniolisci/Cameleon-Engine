# DEC-FOUNDATIONS-01 — Décisions préalables mise en ligne

> Document de décision produit · Non implémentable · 2026-06-08
> Référence : `project_product_roadmap_foundations.md` · `project_product_completeness_audit.md`
> Statut : DÉCISIONS FIGÉES

---

## 1. Contexte

Caméléon Engine est techniquement prêt pour une bêta fermée.

État au 2026-06-08 :
- Moteur principal stable — pipeline 8 étapes, 5 états
- Module Comportement stable — Trade / Order / Wallet History
- Portefeuille V1 clôturé — snapshots persistants, export JSON inclus
- Architecture données utilisateur clôturée — 10 clés namespacées UUID
- Socle juridique bêta clôturé — 3 documents légaux
- Guide Opérateur V1 clôturé
- 0 dette critique ouverte

Ce qui bloque la mise en ligne : 4 décisions préalables non tranchées.
Ce document les tranche.

---

## 2. Décision D1 — Hébergement

### Options analysées

| Option | Avantages | Inconvénients |
|---|---|---|
| GitHub Pages | Gratuit · HTTPS automatique · zéro infra · déploiement natif depuis le repo | Domaine `github.io` peu professionnel en production |
| Vercel / Netlify | Gratuit tier · HTTPS · custom domain · déploiement git | Dépendance d'un tiers supplémentaire |
| VPS | Contrôle total | Surcoût de maintenance — aucun avantage pour un site statique |

### Décision retenue

**Provider : GitHub Pages.**
**Domaine bêta :** `github.io` — acceptable, audience connue et limitée.
**Domaine production :** domaine personnalisé définitif, à enregistrer avant J0 utilisateurs réels.
**HTTPS :** obligatoire — imposé par `crypto.randomUUID()` (secure context requis) et par la politique de sécurité navigateur pour les modules ES.

### Contrainte critique — URL définitive avant tout utilisateur réel

Le localStorage est lié à l'**origine** (protocole + domaine + port). Un changement d'URL après le premier utilisateur = perte totale de ses données, sans récupération possible.

**Règle permanente : le domaine de production est choisi et figé avant d'inviter le premier utilisateur réel.** Les testeurs bêta sur `github.io` et les utilisateurs production sur le domaine définitif sont des populations techniquement séparées — leurs données ne se transfèrent pas automatiquement.

### Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Changement d'URL après J0 | Perte de données certaine | Figer le domaine avant toute invitation |
| Indisponibilité GitHub Pages | Faible | Acceptable pour bêta fermée |

### Conclusion opérationnelle

1. Bêta fermée : `github.io` — autorisé, audience maîtrisée.
2. Avant mise en ligne publique : enregistrer le domaine définitif.
3. Configurer GitHub Pages sur ce domaine avant le premier utilisateur externe.
4. Ne jamais changer de domaine après J0.

**Gate non négociable :** la bêta ne s'ouvre pas tant que le domaine de production n'est pas enregistré, configuré sur le provider retenu et que HTTPS est actif.

---

## 3. Décision D2 — Matrice Gratuit / Premium

### Principe directeur

La monétisation ne peut précéder l'infrastructure qui la rend possible. Sans Compte utilisateur, sans passerelle de paiement, une matrice Gratuit/Premium ne peut pas être appliquée — elle crée des précédents sans mécanisme de contrôle.

**La matrice V1 est une décision de principe, pas une implémentation.**

### Matrice retenue

| Fonctionnalité | Statut V1 | Justification |
|---|---|---|
| Moteur principal (16 champs, décision, posture, score) | **Gratuit permanent** | Identité du produit — ne jamais monétiser |
| Debug Brain | **Gratuit permanent** | Composante de confiance — transparence non négociable |
| Export JSON opérateur | **Gratuit permanent** | Droit à la portabilité — ne jamais monétiser |
| Analyse comportementale (Trade / Order / Wallet) | **Gratuit bêta** | Collecte de données nécessaire à la calibration |
| Portefeuille V1 (snapshots wallet) | **Gratuit bêta** | Couche fondation — collecte nécessaire |
| PDF Import V1 | **Gratuit bêta** | Collecte nécessaire |
| Couche Macro V1 (futur) | **Premium candidat** | Valeur différenciante, effort élevé, données de marché |
| Mémoire opérateur (futur) | **Premium candidat** | Valeur long terme, dépend du Compte |
| Corrélations personnelles (futur) | **Premium candidat** | Couche Intelligence — valeur maximale |
| Sync multi-appareil (futur) | **Premium** | Nécessite backend — naturellement premium |

**Communication bêta :** chaque testeur est informé dès l'invitation que :
- l'outil est gratuit pendant la bêta ;
- certaines couches avancées futures (Mémoire opérateur, Corrélations personnelles) pourront devenir payantes ;
- le moteur principal et l'export JSON resteront gratuits.

Cette information doit apparaître dans la lettre d'invitation bêta.

### Règle de monétisation V1

**Rien n'est monétisé tant que le Compte utilisateur n'existe pas.**

La frontière Gratuit/Premium devient opérationnelle uniquement quand :
1. F2 Compte utilisateur est implémenté
2. La passerelle de paiement est intégrée
3. La décision est confirmée à la lumière des retours terrain

### Ce qui reste interdit en premium pour la bêta

- Le moteur de décision principal
- L'export des données utilisateur
- Toute fonctionnalité nécessaire à comprendre les résultats du moteur

---

## 4. Décision D3 — Frontière Constellium / produit

### Contexte

Constellium est la **Couche 5 Expression** de l'architecture officielle — elle exprime le moteur, elle ne le commande pas. Des assets visuels (PNG, MP4) existent dans le repo mais ne sont pas intégrés dans l'interface. La tension à résoudre : Constellium a une esthétique symbolique. Caméléon Engine est un outil professionnel pour traders.

### Rôle autorisé

- Éléments textuels sobres déjà intégrés (Moteur Narratif — états, formulations) : conservés
- Usage futur comme couche d'expression conditionnelle — ouvert après validation terrain explicite

### Rôle interdit

- Les assets PNG/MP4 Constellium ne sont pas exposés dans l'interface V1
- Constellium n'est pas présenté aux utilisateurs comme une fonctionnalité ou un "mode"
- Constellium ne pilote aucune logique moteur
- Aucun texte mystique dans l'interface opérationnelle (règle C1 audit code `acc1912`)

### Frontière produit / identité

| Élément | Décision |
|---|---|
| Logo produit | **Indépendant de Constellium** — identité propre, sobre, professionnelle |
| Favicon | **Indépendant** — simple, non symbolique |
| Assets PNG/MP4 Constellium | **Non intégrés V1** — archivés, ouverts uniquement sur signal terrain explicite |
| Palette de couleurs | **Propre au produit** — non imposée par Constellium |
| Moteur Narratif (textes, états) | **Conservé** — sobre, dans les limites C1, déjà calibré |

### Décision finale

Constellium est une **couche d'expression dormante**.
Son seul état actif en V1 est le Moteur Narratif déjà intégré (textes d'état et formulations compatibles avec les règles C1).
Les assets visuels (PNG, MP4) restent archivés hors interface.

Une éventuelle activation future nécessite simultanément :
- une validation terrain confirmée ;
- une décision explicite de l'opérateur après revue des assets.

Sans ces deux conditions, Constellium ne constitue pas un chantier actif.

---

## 5. Décision D4 — Admin V1 localStorage-only

### Ce qui est impossible sans backend

| Capacité | Raison |
|---|---|
| Liste des utilisateurs actifs | localStorage est local — aucun signal côté serveur |
| Révocation d'accès | Pas d'authentification serveur |
| Monitoring d'usage en temps réel | Aucune télémétrie, aucun appel réseau |
| Gestion des paiements | Pas de backend, pas de Compte |
| Statistiques globales | Les données ne quittent jamais le navigateur de l'utilisateur |

### Ce qui est possible sans backend

| Capacité | Mécanisme |
|---|---|
| Suivi des testeurs | Liste manuelle — Notion ou tableur |
| Remontée de bugs | Template GitHub Issues ou email dédié |
| Collecte de feedback | Formulaire externe (Tally, Typeform) ou email |
| Revue des sessions | Export JSON volontaire — l'utilisateur envoie son fichier |
| Communication des mises à jour | Email direct aux testeurs connus |
| Accès bêta | Invitation directe — voir périmètre ci-dessous |

### Périmètre retenu — Admin V1

**Aucun code.** Admin V1 pour la bêta = un **process**, pas une fonctionnalité.

**Bêta fermée par invitation (sans contrôle d'accès technique).**
L'accès est limité par l'absence de communication publique et par l'invitation directe des testeurs.
L'URL n'est pas diffusée publiquement.
Un participant peut néanmoins partager l'URL ; ce risque est accepté dans le cadre d'une cohorte limitée de testeurs connus.

| Élément | Outil |
|---|---|
| Liste testeurs | Notion ou fichier |
| Canal bugs | GitHub Issues avec template |
| Canal feedback | Email ou formulaire externe |
| Revue données | Export JSON volontaire |
| Communication | Email direct |

### Ce qui est différé après Compte utilisateur

- Dashboard admin (utilisateurs actifs, rétention)
- Gestion des accès premium
- Monitoring paiements
- Statistiques d'usage agrégées

### Note — révision du périmètre roadmap

Le périmètre initial "Administration V1" supposait implicitement un backend (liste utilisateurs, gestion accès, monitoring paiements). Ce périmètre est irréalisable en localStorage-only.

**Correction :** Administration V1 pour bêta fermée = process de coordination manuelle, zéro code. Administration V1 réelle = BLOC 8, après F2 Compte utilisateur.

---

## 6. Tableau de synthèse

| Décision | Choix retenu | Impact | Bloque quoi | Statut |
|---|---|---|---|---|
| **D1** Hébergement | GitHub Pages · domaine définitif avant J0 · gate HTTPS | URL figée avant premier utilisateur réel | F2 Compte, mise en ligne | ✅ Tranchée |
| **D2** Matrice G/P | Rien monétisé sans Compte · Moteur + export = gratuit permanent · communication dès invitation | Pas de premium pendant bêta | F2 Compte, paiement | ✅ Tranchée |
| **D3** Constellium | Couche dormante · Moteur Narratif seul actif · activation sur 2 conditions | Assets archivés · identité propre à créer | BLOC 3 Assets | ✅ Tranchée |
| **D4** Admin V1 | Process manuel · bêta par invitation sans guard technique · zéro code | Coordination bêta = outillage externe | F2 Compte (admin réelle) | ✅ Tranchée |

---

## 7. Prochaine étape autorisée

### F2 Compte utilisateur — peut-il s'ouvrir ?

**Non encore.** D1 est tranchée sur le principe (GitHub Pages) mais le **domaine définitif n'est pas encore enregistré**. F2 doit être bâti sur l'URL finale — le Compte utilisateur génère des données persistantes liées à l'origine.

**Condition pour ouvrir F2 :** choisir et enregistrer le domaine de production.

### Récolte emails — peut-elle avancer en parallèle ?

**Oui, immédiatement.** Aucune dépendance technique. Formulaire externe (Tally, Brevo, ConvertKit) ou page landing minimaliste. Indépendant de D1/F2.

### Landing page — peut-elle commencer ?

**Oui, contenu uniquement.** La mise en ligne de la landing attend D1 finalisée (domaine enregistré). Le contenu (texte, positionnement, visuels) peut être préparé maintenant.

---

*Ce document est une décision produit — il ne déclenche aucune implémentation.*
*Toute ouverture de chantier d'implémentation doit référencer ce document.*
