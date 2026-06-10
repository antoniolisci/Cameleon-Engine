# Audit de Transition — Doctrine vers Réalité Produit

**Caméléon Engine · Document d'architecture**
**Date : 2026-06-10 · Statut : AUDIT — EN ATTENTE DE VALIDATION**

> Ce document répond à une seule question :
> "Comment passer de la doctrine à la réalité produit sans casser ce qui vient d'être gelé ?"
>
> Aucun code. Aucun mockup. Aucun marketing. Architecture uniquement.

---

## Résumé exécutif

La doctrine est solide. Le risque n'est plus conceptuel — il est opérationnel.

Caméléon Engine possède aujourd'hui un corpus doctrinal cohérent, testé, et gelé sur six dimensions (Macro, Compte, Mémoire, Intelligence, Constellium, Manifeste). La prochaine phase n'est pas une phase de réflexion. C'est une phase de construction ordonnée.

Le plus grand risque des 12 prochains mois n'est pas un bug. C'est la **dérive par addition** — chaque petite extension qui semble alignée avec la vision et qui, cumulée, déplace imperceptiblement le centre de gravité du produit.

**Verdict : B — Le projet doit encore consolider certaines fondations.**

Le moteur est réel, stable, déployé. La doctrine est cohérente. Mais les fondations d'infrastructure (compte, mémoire longue, administration, RGPD) n'existent pas encore. Sans elles, les doctrines gelées sont des plans sur papier.

---

## 1. Où les projets cassent leur propre doctrine

### 1.1 Dérive par addition

C'est le mode d'échec le plus fréquent et le plus invisible. Aucun ajout ne viole explicitement une règle. Chacun "améliore" le produit. L'ensemble déplace le sens.

Une corrélation affichée par convenance. Un texte de contexte qui devient conseil. Un indicateur historique ajouté "pour information". Chaque addition prise isolément passe les tests. Ensemble, elles transforment une "présence calme" en système qui oriente.

**Protection requise :** règle de gouvernance qui évalue chaque ajout non pas isolément mais dans l'ensemble de ce qui existe déjà.

### 1.2 Dérive UX

L'interface répond aux demandes implicites des opérateurs. "Peut-on voir si c'est un bon moment ?" La réponse doctrinale est non. La réponse UX naturelle est d'ajouter un indicateur. La pression de l'usage réel est le principal vecteur de dérive UX.

**Protection requise :** le User Journey V1 (décisions D1–D7) doit être relu avant toute modification de l'interface. Chaque nouvelle demande UX passe le test Manifeste avant d'être evaluée techniquement.

### 1.3 Dérive intelligence

La Phase Intelligence est la zone la plus fragile. Le corpus doctrinal est gelé mais l'implémentation n'a pas commencé. Quand elle commencera, la pression sera forte d'ajouter "juste une corrélation de plus", "juste un pattern supplémentaire". La doctrine du seuil de confiance et R-INT-08 existent précisément pour bloquer cette dérive — mais elles ne valent que si elles sont appliquées activement.

**Protection requise :** chaque nouvelle lecture Intelligence doit être soumise à un test formel (§6 de ce document) avant implémentation.

### 1.4 Dérive mémoire

La doctrine "comportement × contexte, jamais performance × résultat" est claire. En pratique, la tentation d'enregistrer "juste le résultat" pour "enrichir le contexte" est récurrente. Une fois enregistré, un champ n'est jamais supprimé.

**Protection requise :** tout ajout de champ dans le schéma de session passe la règle d'exclusion permanente (§4 de `user_memory_long_term_audit.md`) avant d'être intégré.

### 1.5 Dérive dashboard

Caméléon Engine n'est pas un dashboard. La pression de l'usage tend à le transformer en un. Chaque nouvelle surface qui agrège et affiche de l'information — même comportementale, même contextuelle — doit être évaluée contre ce risque.

**Protection requise :** règle C2 (couches expression/narration subordonnées au moteur), et test Manifeste sur chaque nouvelle surface.

### 1.6 Dette de cohérence inter-couches

Les six doctrines ont été construites en séquence. Chacune est cohérente en interne. La cohérence entre elles est documentée mais non testée en conditions réelles. Quand l'implémentation commencera, des tensions inter-couches apparaîtront que la réflexion seule ne peut pas anticiper.

**Protection requise :** chaque chantier d'implémentation doit explicitement vérifier l'impact sur les couches adjacentes, pas seulement la sienne.

---

## 2. Verrous réels avant mise en ligne

### Niveau A — Bloquants absolus

**A1 — Domaine actif avec HTTPS**
Condition absolue pour le compte utilisateur, le magic link, et la mémoire serveur. Sans HTTPS, aucun système d'authentification ne peut fonctionner. Déjà en cours via ovh-deploy — à confirmer opérationnel.

**A2 — Documents légaux complets**
CGU, politique de confidentialité, mentions légales. La collecte d'email sans cadre légal est une violation RGPD immédiate. Ces documents doivent être en place avant toute activation de collecte.

**A3 — Administration V1 opérationnelle**
Capacité de traiter les demandes RGPD : suppression de compte, export de données utilisateur, suivi de demande. Co-bloquant avec le compte utilisateur (DEC-FOUNDATIONS-01).

**A4 — Pipeline RGPD testé**
Le droit à la suppression doit être documenté et testé avant toute écriture côté serveur. Pas une formalité — une condition d'exploitation légale.

### Niveau B — Importants

**B1 — Matrice Gratuit/Premium décidée**
La frontière entre les fonctionnalités gratuites et premium détermine ce que le compte active. Construire le compte sans cette décision revient à construire une porte sans savoir ce qu'elle ouvre.

**B2 — Export serveur garanti**
Portabilité de sortie pour toutes les données accumulées côté serveur. L'export JSON local (ARCH-N4) ne couvre pas le serveur. À garantir avant production du compte.

**B3 — Format de session stabilisé**
Le `schemaVersion` doit être figé avant accumulation longue durée. Migrer un historique de 24 mois dans un format instable est une dette garantie.

**B4 — Stratégie de migration UUID local → serveur documentée**
Le bridge est préparé (ADU-01→04). Son activation est une décision produit qui doit être documentée avant d'être exécutée.

### Niveau C — Améliorations

**C1 — Indicateur saturation localStorage** (ARCH-N3, déjà clôturé)
**C2 — Nettoyage dette ARCH-N3** (différé terrain)
**C3 — Optimisations performance render.js** (différé post-lancement)

---

## 3. Cohérence de la séquence gelée

### La séquence actuelle

```
Mise en ligne
  → Compte utilisateur
    → Mémoire longue
      → Macro (valeur réelle)
        → Intelligence
          → Constellium vivant
```

### Analyse

**La séquence est correcte dans son ordre.** Chaque étape est la condition nécessaire de la suivante. On ne peut pas construire la mémoire longue sans identité stable. On ne peut pas produire de corrélations Macro sans mémoire longue. On ne peut pas activer l'Intelligence sans corpus personnel suffisant.

**Un ajustement nécessaire :** Administration V1 est co-bloquante avec le Compte utilisateur, pas postérieure. La séquence doit le refléter :

```
Mise en ligne + Admin V1 (co-bloquants)
  → Compte utilisateur + RGPD pipeline
    → Mémoire longue (logging dès J0 — déjà actif localement)
      → Macro valeur réelle (6 mois minimum)
        → Intelligence (corpus suffisant)
          → Constellium vivant
```

**Un point de vigilance :** le logging Macro est déjà doctrinalement actif dès J0. La Phase 1 de la Macro (contextualFields + applyMacroOverlay) est en place. Ce qui est différé, c'est la valeur réelle des corrélations — pas le logging. Cette distinction doit être préservée : le logging commence à la mise en ligne, la lecture des corrélations commence après 6 mois.

---

## 4. Chantiers prématurés à maintenir fermés

### Intelligence — fermé

Prématuré. Conditionné à : compte actif + mémoire longue opérationnelle + corpus minimum (50–100 sessions indicatif) + 6 mois de données. Ouvrir l'Intelligence avant ces conditions produit des lectures fragiles avec poids d'autorité.

### Corrélations comportementales — fermé

Prématuré. Sous-ensemble de la Phase Intelligence. Mêmes conditions. Les corrélations basées sur un corpus insuffisant sont plus dangereuses qu'aucune corrélation.

### Constellium Sens B (application principale) — fermé

Prématuré. Conditionné à : mise en ligne + compte + mémoire + Intelligence active + 7 conditions bloquantes documentées (Constellium Position Audit §13). Nommer n'autorise pas.

### Gamification — incompatible et fermé

Incompatible avec le Manifeste et la doctrine "jamais performance × résultat". Aucune condition ne peut l'ouvrir sans réécrire la doctrine. Ne pas traiter comme "différé" — traiter comme "incompatible".

### Intelligence collective / Bibliothèque Vivante — fermé

Prématuré. Conditionné à N≥10 opérateurs opt-in avec historique suffisant. Ouvrir avant ce seuil viole la règle anti-horoscope (MEM-V2).

### Multi-device sync — fermé

Prématuré. Conditionné au compte utilisateur et à la mémoire serveur. Ne pas implémenter de synchronisation avant que l'identité serveur soit active.

### Premium — conditionnel

Pas prématuré dans la réflexion (Matrice Gratuit/Premium doit être décidée avant le compte). Prématuré dans l'implémentation (avant que le compte existe). Traiter comme B1 dans les verrous.

---

## 5. Fondations invisibles à construire avant Phase Intelligence

### Logging

Le logging comportemental est actif (sessions, imports, backups). Le logging Macro_State est architecturalement préparé (champ `macroContext: null` dans les snapshots). Ce null doit devenir un vrai Macro_State dès l'activation de la Couche Macro V1.

**Condition :** vérifier que le champ `macroContext` est effectivement rempli avant de compter les sessions comme "exploitables" pour les corrélations Intelligence.

### Conservation

SESSION_LIMIT=50 en localStorage. Suffisant pour le local. Insuffisant pour 24 mois de corrélations. La conservation longue durée côté serveur est une fondation, pas une extension.

### Migration

Le bridge UUID local → serveur est préparé mais inactivé. Son activation est une décision de déploiement qui doit être testée sur corpus réel avant mise en production.

### Versioning

`schemaVersion` présent dans les sessions (Bloc B/C de MEM-01B). Cette propriété est non négociable pour la stabilité des corrélations dans le temps. Toute évolution de schéma doit être documentée et compatible ascendante.

### Administration

V1 = capacité minimale de traiter les demandes RGPD. Sans elle, le compte ne peut pas être mis en production légalement. Ce n'est pas une amélioration — c'est une condition d'exploitation.

### RGPD

Le droit à la suppression doit être testé avant d'écrire la première donnée côté serveur. Pas documenté seulement — testé. La suppression d'un compte doit supprimer l'intégralité des données namespacées sous son UUID.

### Identité utilisateur

UUID local en place (ADU-01→04). L'étape suivante est le bridge vers un UUID serveur stable, lié à un email, authentifié par magic link. Cette fondation conditionne tous les espaces mémoire.

---

## 6. Gouvernance officielle — checklist de validation des chantiers futurs

Tout chantier proposé doit passer les sept questions suivantes avant d'être autorisé. Un "non" à une question de niveau A est bloquant.

### Questions de niveau A — bloquantes si non

**A1 — Respecte-t-il MACRO-RULE-01 ?**
Score, posture, actions, et validation humaine sont-ils strictement inchangés ?

**A2 — Passe-t-il le test Manifeste ?**
Après ce chantier, Caméléon Engine est-il encore "une présence calme qui rend la décision lisible sans la prendre" ?

**A3 — Est-il dans la bonne position de la séquence ?**
Ses conditions préalables sont-elles toutes satisfaites ? (Mise en ligne → Compte → Mémoire → Macro → Intelligence → Constellium)

**A4 — Est-il compatible avec la règle d'exclusion mémoire ?**
N'introduit-il pas de données financières, de données de performance, ni de données personnelles identifiantes dans un espace non consenti ?

### Questions de niveau B — importantes

**B1 — Crée-t-il une dette vers un chantier futur ?**
Si oui, cette dette est-elle documentée et acceptée explicitement ?

**B2 — Respecte-t-il la règle C3 (suppression non cassante) ?**
Sa suppression future est-elle possible sans casser le moteur ?

**B3 — Respecte-t-il la doctrine du seuil de confiance ?**
S'il implique des lectures Intelligence, repose-t-il sur un corpus suffisant ?

---

## 7. Le plus grand risque produit des 12 prochains mois

Ce n'est pas un bug. Ce n'est pas une violation explicite de doctrine.

**C'est la dérive par addition progressive.**

Le moteur est stable. La doctrine est gelée. Les premières semaines de mise en ligne vont produire des observations terrain réelles — des frictions, des confusions, des demandes d'opérateurs. La réponse naturelle est d'ajouter.

Chaque ajout sera justifié. "On ajoute juste un peu de contexte." "On améliore juste la lisibilité." "On répond juste à ce que les opérateurs demandent." Individuellement, aucun de ces ajouts ne viole le Manifeste. Collectivement, en 12 mois, ils peuvent transformer le produit.

La dérive par addition est d'autant plus dangereuse qu'elle ressemble à de la croissance. Le produit s'enrichit. Les métriques s'améliorent. La doctrine s'érode.

**La protection n'est pas dans le code.** Elle est dans la gouvernance : appliquer la checklist §6 à chaque ajout, même mineur, même "évident". La doctrine ne se protège pas elle-même — elle doit être activement maintenue.

---

## 8. Verdict final

**B — Le projet doit encore consolider certaines fondations.**

**Pourquoi pas C (trop théorique) :**
Le moteur est réel. Il est déployé sur cameleonengine.fr. Il a été testé sur des données réelles (V0-A, REAL_001–004). La doctrine n'est pas spéculative — elle est issue de l'usage réel.

**Pourquoi pas A (prêt pour la phase produit) :**
Les fondations d'infrastructure nécessaires à la doctrine ne sont pas encore construites. Le compte utilisateur n'existe pas. La mémoire longue serveur n'existe pas. L'administration V1 n'existe pas. Le pipeline RGPD n'est pas testé. Les doctrines gelées décrivent un produit qui ne peut pas encore fonctionner tel que décrit.

**Ce que B signifie concrètement :**
Le projet entre en phase de construction ordonnée, pas en phase de réflexion. La prochaine étape n'est pas un audit supplémentaire. C'est l'exécution de la séquence : mise en ligne effective + Admin V1 → Compte utilisateur → Mémoire longue. La réflexion est terminée sur ces couches. La construction peut commencer.

**La doctrine est prête. Les fondations doivent suivre.**

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
*Documents connexes : `macro_layer_doctrine_v1.md` · `user_account_phaseA_audit.md` · `user_memory_long_term_audit.md` · `intelligence_layer_position_audit.md` · `constellium_position_audit.md`*
