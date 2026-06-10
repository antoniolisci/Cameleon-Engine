# Compte Utilisateur V1 — Checklist Pré-Implémentation

**Caméléon Engine · Document opérationnel**
**Date : 2026-06-10 · MàJ : 2026-06-10 · Statut : PRÉ-CHANTIER — DÉCISIONS FERMÉES**

> Vérifier que toutes les conditions sont réunies avant le premier commit du Compte Utilisateur V1.

---

## Décisions préalables — TOUTES FERMÉES

Les 5 décisions bloquantes identifiées dans `user_account_v1_execution_architecture.md` sont désormais documentées et figées.

| # | Décision | Résultat | Document | Commit |
|---|----------|----------|----------|--------|
| 1 | Frontière Gratuit / Premium | Option B — local = gratuit · serveur = premium | `freemium_matrix_v1.md` | `2bad403` |
| 2 | TTL Magic Link | 15 minutes · usage unique · 3/15 min rate limit | `magic_link_ttl_v1.md` | `dbb7578` |
| 3 | Fournisseur SMTP | Postmark · Resend = repli · SES rejeté | `smtp_provider_v1.md` | `2b86678` |
| 4 | Fournisseur serveur | Supabase · PocketBase = repli · Firebase rejeté | `server_provider_v1.md` | `ee16310` |
| 5 | Migration UUID local → serveur | Option C — progressive consentie · UUID bridge auto · sessions sur consentement | `uuid_migration_scope_v1.md` | `6c5cffd` |

Ces décisions ferment directement les cases marquées `[x]` dans les blocs ci-dessous. Les cases encore ouvertes `[ ]` appartiennent à la phase d'implémentation.

---

## Bloc A — Fondations Produit

### A1 — Domaine public opérationnel

- [ ] Domaine définitif choisi
- [ ] DNS configuré
- [ ] HTTPS actif
- [ ] Version publique accessible depuis Internet
- [ ] Vérification multi-appareils réalisée

### A2 — Positionnement produit figé ✅ `freemium_matrix_v1.md` · `2bad403`

- [x] Version gratuite définie
- [x] Version premium définie
- [x] Frontière Gratuit / Premium documentée
- [x] Aucun impact sur le moteur souverain

### A3 — Gouvernance validée

- [ ] Manifeste produit relu
- [ ] User Account Phase A validé
- [ ] User Account V1 Execution Architecture validé
- [ ] Aucun conflit avec Macro Doctrine
- [ ] Aucun conflit avec Intelligence Layer

---

## Bloc B — Cadre Légal

### B1 — Documents obligatoires

- [ ] Mentions légales
- [ ] Politique de confidentialité
- [ ] Conditions Générales d'Utilisation
- [ ] Politique de conservation des données

### B2 — RGPD

- [ ] Base légale de collecte documentée
- [ ] Consentement défini
- [ ] Procédure export utilisateur documentée
- [ ] Procédure suppression utilisateur documentée
- [ ] Délais de conservation définis

### B3 — Vérification finale

- [ ] Parcours création compte relu sous angle RGPD
- [ ] Parcours suppression relu sous angle RGPD
- [ ] Export utilisateur testé sur données fictives

---

## Bloc C — Infrastructure

### C1 — Identité

- [x] Magic Link confirmé *(`magic_link_ttl_v1.md` + `smtp_provider_v1.md` + `server_provider_v1.md`)*
- [ ] Structure UUID serveur validée
- [ ] Bridge UUID local → serveur validé
- [ ] Règles de création de compte documentées

### C2 — Email ✅ (partiel) `smtp_provider_v1.md` · `2b86678` · `magic_link_ttl_v1.md` · `dbb7578`

- [x] Fournisseur SMTP choisi *(Postmark)*
- [ ] Envoi Magic Link testé
- [x] Gestion expiration des liens documentée *(TTL = 15 min · usage unique)*
- [x] Gestion réémission documentée *(rate limiting 3 demandes / 15 min)*

### C3 — Stockage

- [ ] Structure des espaces mémoire validée
- [ ] Séparation physique des données définie
- [ ] Politique sauvegarde définie
- [ ] Politique restauration définie

---

## Bloc D — Migration Local → Serveur

### D1 — Cas utilisateur existant

- [ ] Détection historique local
- [ ] Proposition migration
- [ ] Migration idempotente
- [ ] Vérification schemaVersion

### D2 — Cas nouvel utilisateur

- [ ] Création compte vierge
- [ ] Initialisation serveur propre

### D3 — Cas nouvel appareil

- [ ] Reconnexion utilisateur
- [ ] Synchronisation historique
- [ ] Gestion conflits documentée

### D4 — Cas refus migration ✅ `uuid_migration_scope_v1.md` · `6c5cffd`

- [x] Limitation explicitement documentée *(local intact · aucune relance)*
- [x] Corpus serveur démarre à la date du compte *(sessions pré-compte = locales sauf migration explicite)*
- [x] Impact Intelligence documenté *(sessions non migrées = absentes de la mémoire longue)*
- [x] Impact Macro documenté *(traces Macro hors périmètre migration V1)*

---

## Bloc E — Administration V1

### E1 — Comptes

- [ ] Voir compte
- [ ] Désactiver compte
- [ ] Réactiver compte

### E2 — RGPD

- [ ] Export utilisateur
- [ ] Suppression utilisateur
- [ ] Vérification état demande

### E3 — Audit minimal

- [ ] Journal des actions administrateur
  - [ ] Date
  - [ ] Action
  - [ ] Compte concerné

---

## Bloc F — Portabilité

### F1 — Export Local

- [ ] ARCH-N4 validé

### F2 — Export Serveur

- [ ] Format défini
- [ ] Export complet disponible
- [ ] Export testé
- [ ] Restauration vérifiée

> **Règle non négociable :** aucun compte en production sans portabilité complète des données serveur.

---

## Bloc G — Protections Architecturales

### G1 — Moteur souverain

- [ ] Le compte ne modifie jamais le score
- [ ] Le compte ne modifie jamais la posture
- [ ] Le compte ne modifie jamais les actions
- [ ] Le compte ne modifie jamais le verdict

### G2 — Interdictions permanentes

- [ ] Pas de réseau social
- [ ] Pas de profil public
- [ ] Pas de classement
- [ ] Pas de score opérateur
- [ ] Pas de moteur personnalisé caché
- [ ] Pas de prédiction

---

## GO / NO GO

Le chantier Compte Utilisateur V1 peut ouvrir uniquement si :

- Tous les blocs A à G sont validés
- Les conditions bloquantes du document `user_account_v1_execution_architecture.md` sont satisfaites
- Aucun conflit n'existe avec les doctrines gelées

> **Si une seule condition critique est ouverte → NO GO.**

### État actuel — 2026-06-10

**Décisions préalables : 5/5 FERMÉES ✅**

Les cases encore ouvertes dans les blocs A→G sont des tâches d'implémentation — elles ne bloquent pas l'ouverture du chantier mais doivent être cochées avant le premier commit en production.

| Bloc | Cases fermées par les décisions | Cases restantes (implémentation) |
|------|--------------------------------|----------------------------------|
| A | A2 (4/4) | A1, A3 |
| B | — | B1, B2, B3 (intégralité) |
| C | C1 partiel (1/4), C2 partiel (3/4) | C1 (3), C2 (1), C3 (4) |
| D | D4 (4/4) | D1, D2, D3 |
| E | — | E1, E2, E3 (intégralité) |
| F | — | F1, F2 (intégralité) |
| G | — | G1, G2 (intégralité) |

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `user_account_v1_execution_architecture.md` · `user_account_phaseA_audit.md` · `doctrine_to_product_transition_audit.md`*
