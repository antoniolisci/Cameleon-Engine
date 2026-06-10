# Compte Utilisateur V1 — Checklist Pré-Implémentation

**Caméléon Engine · Document opérationnel**
**Date : 2026-06-10 · Statut : PRÉ-CHANTIER**

> Vérifier que toutes les conditions sont réunies avant le premier commit du Compte Utilisateur V1.

---

## Bloc A — Fondations Produit

### A1 — Domaine public opérationnel

- [ ] Domaine définitif choisi
- [ ] DNS configuré
- [ ] HTTPS actif
- [ ] Version publique accessible depuis Internet
- [ ] Vérification multi-appareils réalisée

### A2 — Positionnement produit figé

- [ ] Version gratuite définie
- [ ] Version premium définie
- [ ] Frontière Gratuit / Premium documentée
- [ ] Aucun impact sur le moteur souverain

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

- [ ] Magic Link confirmé
- [ ] Structure UUID serveur validée
- [ ] Bridge UUID local → serveur validé
- [ ] Règles de création de compte documentées

### C2 — Email

- [ ] Fournisseur SMTP choisi
- [ ] Envoi Magic Link testé
- [ ] Gestion expiration des liens documentée
- [ ] Gestion réémission documentée

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

### D4 — Cas refus migration

- [ ] Limitation explicitement documentée
- [ ] Corpus serveur démarre à la date du compte
- [ ] Impact Intelligence documenté
- [ ] Impact Macro documenté

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

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `user_account_v1_execution_architecture.md` · `user_account_phaseA_audit.md` · `doctrine_to_product_transition_audit.md`*
