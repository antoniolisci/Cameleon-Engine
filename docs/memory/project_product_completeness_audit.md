---
name: Audit de complétude produit — Caméléon Engine V1
description: Référence produit active 2026-06-05 · audit architecte senior · 7 priorités immédiates · risque localStorage critique · roadmap élargie 10 blocs · complément à project_product_roadmap_foundations.md
type: project
date: 2026-06-05
---
**Statut : RÉFÉRENCE PRODUIT ACTIVE — figée 2026-06-05 — audit stratégique final**
**Complément de :** `project_product_roadmap_foundations.md`

---

## Conclusion centrale

Caméléon Engine possède une doctrine produit de niveau senior — cohérente, défendable, et suffisamment mature pour guider une mise en ligne réelle. Le moteur, le module Comportement, le PDF Import V1, et l'architecture V2 sont stables.

**Le risque principal n'est plus technique.**

Le risque principal devient : mettre en ligne un moteur solide sans l'environnement produit nécessaire pour inspirer confiance et éviter les erreurs d'usage.

Les couches non-moteur manquantes sont :
- Confiance utilisateur (légal, disclaimer, avertissements)
- Identité visuelle (logo, favicon, Open Graph)
- Documentation opérationnelle (guide démarrage, limites de l'outil)
- Sécurité des données locales (export utilisateur, avertissement perte)
- Acquisition (récolte emails, canal feedback)
- Support minimal (procédure bug, communication mises à jour)
- Administration minimale (adaptée à l'architecture localStorage-only)

---

## 7 priorités immédiates

Ces 7 éléments sont des **protections produit** avant mise en ligne — pas des fonctionnalités secondaires.

| # | Priorité | Nature | Prérequis |
|---|---|---|---|
| 1 | Disclaimer financier | Texte juridique | Aucun — à faire maintenant |
| 2 | Guide opérateur V1 (démarrage rapide) | Documentation | Aucun — à faire maintenant |
| 3 | Avertissement perte données localStorage | UX + texte in-app | Aucun — à faire maintenant |
| 4 | Export JSON données utilisateur | Fonctionnalité minimale | Aucun — indépendant des Fondations |
| 5 | Logo + Favicon | Design | Décision frontière assets Constellium vs produit |
| 6 | Décision hébergement | Décision (0 code) | Aucun |
| 7 | Matrice Gratuit / Premium | Décision (0 code) | Aucun |

Les priorités 1, 2, 3, 6, 7 ne nécessitent aucun code. Elles peuvent toutes être traitées avant l'ouverture des Fondations techniques.

---

## Risque localStorage — critique

Le localStorage est lié au navigateur, au domaine, et au profil utilisateur. Les données peuvent être perdues silencieusement dans les scénarios suivants :

- Nettoyage de cache navigateur (action fréquente chez les non-techniciens)
- Changement de navigateur ou d'appareil
- Réinstallation du système d'exploitation
- Navigation privée (données non persistées)
- Changement de domaine ou d'URL (si l'URL de l'outil change, toutes les données sont perdues)
- Migration de schéma (si les clés localStorage changent de format entre versions)

**Conséquence :** un utilisateur peut perdre 6 mois de sessions comportementales sans comprendre pourquoi. C'est un risque produit, juridique, et de confiance.

**Décision à retenir :**
Le couple **Avertissement données locales + Export JSON utilisateur** est une protection produit prioritaire — pas une fonctionnalité secondaire.

**Clés localStorage actuelles (contrats implicites à ne pas modifier sans procédure) :**
- `CE_behavior_sessions_v1` — sessions comportementales (FIFO 20)
- `cameleon_behavior_memory_v1` — mémoire comportementale

Changer le schéma de ces clés sans procédure de migration = données utilisateur irrécupérables.

**Risque domaine stable :** Si l'URL de l'outil change après mise en ligne, toutes les données localStorage des utilisateurs existants sont perdues sans récupération possible. Le choix du domaine doit être définitif avant la mise en ligne publique.

---

## Décisions préalables — Bloc 0

Ces 4 décisions ne requièrent aucun code. Elles doivent précéder tout développement.

| # | Décision | Impact si non prise |
|---|---|---|
| D1 | Hébergement — domaine · provider · HTTPS | URL instable = perte données utilisateur au changement |
| D2 | Matrice Gratuit / Premium | Fonctionnalités construites sans porte premium = gratuites par précédent |
| D3 | Frontière assets Constellium vs assets produit | Confusion identitaire · exposition accidentelle d'assets internes |
| D4 | Périmètre Administration V1 adapté à localStorage-only | Admin V1 irréalisable en localStorage si périmètre backend supposé |

**Note sur D4 :** Le périmètre actuel dans la roadmap ("liste utilisateurs · gestion accès · monitoring paiements") suppose un backend. En localStorage-only, ce périmètre est irréalisable tel quel. Il doit être redéfini explicitement avant le chantier Administration V1.

---

## Frontières critiques non documentées

Ces éléments risquent d'être oubliés si non documentés maintenant.

**1. Documentation interne ≠ documentation externe**
Les 80+ pages Notion et les fichiers dans `docs/` sont des documents d'architecture interne. Ils ne doivent jamais être exposés aux utilisateurs. Cette frontière n'est formalisée nulle part — risque d'exposition accidentelle sur un futur site de documentation.

**2. Le changelog comme obligation post-lancement**
Dès qu'une mise à jour modifie le comportement du moteur (score, états, actions), les utilisateurs existants doivent être informés. Il n'existe ni processus, ni outil, ni engagement documenté pour cette communication. En l'absence de liste emails active, la communication est impossible.

**3. PII dans le pipeline BMSM**
La règle "PII supprimées avant normalisation" est documentée dans l'architecture BMSM mais n'est pas vérifiée dans le pipeline actuel. Si BMSM est ouvert sans vérification explicite, des données financières personnelles pourraient être stockées en localStorage — violation RGPD potentielle.

**4. PDF.js worker-src en production**
La CSP actuelle est correcte sans PDF.js en worker mode. Si PDF Import est activé en production sans ajouter `worker-src blob:` à la CSP, le module sera silencieusement bloqué dans certains navigateurs. Cette vérification doit figurer dans la checklist de mise en ligne.

**5. Les futurs chantiers Intelligence supposent une persistance réelle**
Macro V1 + BMSM + Corrélations + Empreinte Opérateur™ + Bibliothèque Vivante dépendent tous d'une Architecture données utilisateur avec persistance au-delà du navigateur. Les ouvrir avant F1 = reconstruction garantie. Aucun de ces chantiers n'est réalisable avec la seule architecture localStorage actuelle.

---

## Roadmap élargie — 10 blocs

La roadmap produit ne se réduit pas à une roadmap moteur. 10 blocs parallèles ou séquentiels.

```
BLOC 0 — Décisions préalables (0 code, avant tout)
  D1 Hébergement · D2 Matrice G/P · D3 Frontière assets · D4 Périmètre Admin V1

BLOC 1 — Fondations techniques (séquence stricte)
  F1 Architecture données utilisateur → F2 Compte → F3 Mémoire opérateur → F4 Portefeuille

BLOC 2 — Juridique (parallèle, sans prérequis technique)
  J1 Disclaimer financier ← CRITIQUE · J2 Mentions légales · J3 CGU · J4 Confidentialité · J5 Cookies

BLOC 3 — Assets (parallèle, dépend de D3)
  A1 Logo+PNG · A2 Favicon · A3 Open Graph · A4 Visuel landing

BLOC 4 — Documentation (parallèle partielle)
  Doc1 Guide opérateur V1 · Doc2 Page "Ce que l'outil ne fait pas" · Doc3 Limites module Comportement
  Doc4 Avertissement perte données · Doc5 Guide déploiement V1 · Doc6 Changelog

BLOC 5 — Produit (après F1)
  P1 Récolte emails ← peut démarrer maintenant · P2 Paiement ← F2+D2 · P3 Pass & Invitations ← F2+P2

BLOC 6 — Sécurité produit (parallèle partielle)
  S1 Export JSON utilisateur ← avant mise en ligne publique
  S2 Avertissement changement domaine ← avant migration production
  S3 Procédure migration schéma localStorage ← avant tout changement schéma
  S4 Vérification CSP PDF.js worker-src ← avant activation PDF Import production

BLOC 7 — Support (processus, non code)
  Su1 Canal feedback · Su2 Procédure bug · Su3 Procédure communication mises à jour

BLOC 8 — Lancement (gate event)
  L1 Administration V1 (périmètre D4) · L2 Landing page · L3 Mise en ligne · L4 Validation terrain

BLOC 9 — Intelligence (après L3 + L4)
  I1 Macro V1 ← F3+L3+L4 · I2 BMSM ← L3+signal terrain · I3 Corrélations ← I1+I2
```

**Éléments activables maintenant sans prérequis :**
- P1 Récolte emails (formulaire externe, aucun prérequis)
- J1 Disclaimer financier (rédaction texte)
- Doc1 Guide opérateur V1 (rédaction texte)
- Doc2 "Ce que l'outil ne fait pas" (rédaction texte)
- D1/D2/D3/D4 Décisions (0 code, 0 dépendance)

---

## Tableau de criticité final

### Déjà suffisamment mature
- Moteur principal (pipeline 8 étapes) — stable, documenté, commité
- Module Comportement — pipeline complet, REAL_001→004 validés
- PDF Import V1 — CLÔTURÉ `6a166c6`, 22/22 tests PASS
- Doctrine Macro V1 — figée `74611b4`, implémentation correctement différée
- Architecture comportementale V2 — Phases 0–2 complètes, T3 shadow mode
- Corpus doctrinal — exceptionnellement complet
- CSP et sécurité applicative locale — correcte pour l'architecture actuelle
- Séquence roadmap produit — auditée et corrigée (`project_product_roadmap_foundations.md`)

### Ce qui manque encore
**Décisions (0 code) :** Hébergement · Matrice G/P · Frontière assets · Périmètre Admin V1
**Actifs à créer :** Logo · Favicon · Open Graph · Disclaimer · CGU · Mentions légales · Politique confidentialité · Guide opérateur V1 · Avertissement localStorage · Export JSON · Canal feedback
**Architecture non démarrée :** Architecture données utilisateur · Compte · Mémoire opérateur FIFO

### Ce qui est prioritaire (avant toute mise en ligne)
Disclaimer financier · Guide opérateur V1 · Avertissement perte données · Export JSON utilisateur · Logo + Favicon · Décision hébergement · Matrice Gratuit/Premium

### Ce qui peut attendre
FAQ · Vidéos produit · Bibliothèque Vivante · Empreinte Opérateur™ · Corrélations personnelles · Administration V1 avancée · Macro V1 implémentation · BMSM

### Ce qui risque d'être oublié si non documenté maintenant
1. Contrainte domaine stable — URL définitive avant mise en ligne publique
2. Clés localStorage comme contrats implicites — ne pas modifier sans migration
3. Frontière documentation interne / externe — ne jamais exposer docs/ aux utilisateurs
4. Changelog comme obligation post-lancement — sans liste emails, communication impossible
5. PII dans pipeline BMSM — à vérifier avant ouverture du chantier
6. PDF.js worker-src — à ajouter à CSP avant activation PDF Import en production
