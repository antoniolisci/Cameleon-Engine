# Constellium V1 — Définition officielle

**Caméléon Engine · Référence produit et UX**
**Date : 2026-06-18 · Statut : RÉFÉRENCE OFFICIELLE**

> Ce document est la définition de référence du Constellium V1.
> Il complète `constellium-product-architecture.md` (architecture à 8 couches) et `constellium_position_audit.md` (position dans le code).
> Il répond à la question : *que voit l'opérateur quand il accède au Constellium ?*

---

## Définition centrale

> **Le Constellium est la visualisation des liens entre les traces du décideur.**

Il ne produit pas de données. Il révèle les connexions entre des données déjà produites par l'opérateur : ses sessions, ses snapshots, ses notes, ses validations, ses motifs comportementaux, ses comparaisons W1/W2.

Il répond à une question que ni l'onglet Moteur, ni l'onglet Mémoire, ni l'onglet Comportement ne posent :

> **"Qu'est-ce qui est relié à quoi dans mon histoire de décideur ?"**

---

## 1. Définition négative — Ce que le Constellium n'est pas

Ces interdictions sont fermes. Chaque ajout futur doit être testé contre cette liste.

**Le Constellium n'est pas un moteur de décision.**
Il ne calcule rien. Il ne produit pas de score. Il ne recommande pas une action. La décision reste dans Caméléon Engine et dans la tête de l'opérateur.

**Le Constellium n'est pas un indicateur.**
Il n'affiche pas de valeur numérique destinée à orienter un choix. Aucun chiffre présenté comme un signal.

**Le Constellium n'est pas un signal.**
Il ne dit pas "le marché est haussier", "réduire l'exposition", "opportunité détectée". Ces formulations sont interdites par Language System V1 et par la doctrine du Constellium.

**Le Constellium n'est pas un dashboard marché.**
Il ne synthétise pas les conditions de marché actuelles. Ce rôle appartient à Caméléon Engine. Le Constellium ne regarde pas le marché — il regarde les *traces laissées par l'opérateur face au marché*.

**Le Constellium n'est pas une prédiction.**
Il ne projette pas vers l'avenir. Il ne dit pas "si ce motif continue". Il observe ce qui s'est passé. Jamais ce qui va se passer.

**Le Constellium n'est pas une recommandation d'action.**
Aucune phrase du type "vous devriez", "il est conseillé", "la prochaine fois". L'opérateur tire ses propres conclusions.

**Le Constellium n'est pas une duplication de l'onglet Mémoire.**
Mémoire affiche des *contenus* : sessions, snapshots, scores, comparaisons. Le Constellium affiche des *relations* entre ces contenus. La distinction est structurelle, pas cosmétique.

**Le Constellium n'est pas une surcouche décorative.**
Chaque lien visible doit être ancré dans une donnée réelle, traçable, vérifiable. Si la relation n'est pas prouvée par les données, elle n'est pas affichée.

**Le Constellium n'est pas IA Vision.**
IA Vision est une couche future qui n'existe pas encore. Le Constellium V1 ne la simule pas, ne la nomme pas comme active, ne la promet pas.

**Le Constellium n'est pas une identité.**
Il ne définit pas l'opérateur. Il ne dit pas "vous êtes un trader Feu". Il observe des *dynamiques temporaires*, jamais des *profils permanents*.

---

## 2. Définition positive — Ce que le Constellium devient

Le Constellium est une *carte relationnelle vivante*. Il grandit avec l'usage. Il est honnête sur ses limites. Quand les données sont insuffisantes pour établir un lien, il le dit.

Le Constellium *lit* les données. Il ne les *crée* pas. Si l'opérateur n'a pas encore accumulé de traces, le Constellium est vide — et il le dit clairement.

### Relation avec les structures existantes

| Couche | Rôle | Relation au Constellium |
|--------|------|------------------------|
| Caméléon Engine | Analyse l'instant présent | Produit les traces que le Constellium rend lisibles |
| Onglet Mémoire | Affiche les contenus persistés | Constellium = les *liens* entre ces contenus |
| Module Comportement | Analyse les fichiers CSV | Produit des motifs que le Constellium peut relier à d'autres traces |
| IA Vision (futur) | Analyse les captures d'écran | Étoile future du Constellium — absente en V1 |
| Miroir Vivant (futur) | Dialogue avec son propre historique | Couche profonde du Constellium — absente en V1 |

---

## 3. Étoiles V1

Une étoile est un type de trace du décideur. Elle est un *nœud* dans la carte relationnelle.

---

### Étoile 1 — Snapshot

**Rôle :** Capture ponctuelle de l'état du moteur à un instant T. L'opérateur a délibérément figé une lecture.

**Source de données :** Module Pilotage (localStorage).

**Statut actuel :** Existant et opérationnel.

**Pourquoi elle appartient au Constellium :** Le snapshot est la trace la plus intentionnelle — l'opérateur a décidé qu'un moment méritait d'être retenu. Le Constellium montre à quels autres moments ce snapshot est relié (même semaine W1/W2, même motif comportemental).

**Ce qu'elle ne doit pas faire :** Devenir une recommandation rétrospective. Le snapshot ne dit pas "vous auriez dû agir ici".

---

### Étoile 2 — Validation

**Rôle :** Décision de l'opérateur face au verdict du moteur : accepté / en attente / ajusté / rejeté.

**Source de données :** Pipeline moteur (`applyValidation()`), historique dans `render.js`.

**Statut actuel :** Existant et opérationnel. Inclus dans le payload. Non exploité pour des corrélations.

**Pourquoi elle appartient au Constellium :** La validation est le moment où l'opérateur exerce son jugement humain face au moteur. Elle révèle si l'opérateur fait confiance au moteur, s'il diverge, et dans quelles conditions.

**Ce qu'elle ne doit pas faire :** Être comptée comme un score de "bonne utilisation". Une validation rejetée n'est pas un mauvais signe — c'est une décision.

---

### Étoile 3 — Motif comportemental

**Rôle :** Pattern récurrent détecté dans les données CSV analysées par le module Comportement.

**Source de données :** `src/js/behavior/analytics/patterns.js`, `scoring.js`. Persisté dans `CE_behavior_sessions_v1`.

**Statut actuel :** Existant et opérationnel.

**Pourquoi elle appartient au Constellium :** Les motifs sont les *répétitions* dans le comportement de l'opérateur. Le Constellium les relie aux validations contemporaines, aux semaines W1/W2 où ils ont été observés.

**Ce qu'elle ne doit pas faire :** Être présentée comme un profil psychologique. Un motif détecté est une observation sur une période donnée, pas un trait de personnalité.

---

### Étoile 4 — Comparaison W1/W2

**Rôle :** Comparaison entre deux semaines d'activité comportementale. Révèle une progression, une stagnation, ou une régression sur des métriques précises.

**Source de données :** `cameleon_behavior_memory_v1` (écrit par `render.js`). Boucle mémoire V1 opérationnelle (commit 77406b2).

**Statut actuel :** Existant et opérationnel.

**Pourquoi elle appartient au Constellium :** La comparaison W1/W2 est le seul lien temporel structuré actuellement disponible entre deux moments distincts. C'est la trace la plus "relationnelle" du système — elle existe pour relier deux états dans le temps.

**Ce qu'elle ne doit pas faire :** Être présentée comme une "amélioration certifiée". Une différence entre W1 et W2 est une différence observée, pas une progression garantie.

---

### Étoile 5 — Session comportementale

**Rôle :** Résultat complet d'une analyse CSV : score, label (Discipliné/Réactif/Impulsif/Agressif), distribution des motifs.

**Source de données :** `CE_behavior_sessions_v1` — jusqu'à 50 sessions FIFO.

**Statut actuel :** Existant et opérationnel.

**Pourquoi elle appartient au Constellium :** La session est le container de base de toutes les autres étoiles comportementales. Elle relie un moment dans le temps à un état comportemental observé.

**Ce qu'elle ne doit pas faire :** Être affichée comme un classement ou un palmarès. L'ordre chronologique est informatif ; le classement par score serait normatif.

---

### Étoile 6 — Note (statut partiel)

**Rôle :** Texte libre laissé par l'opérateur pour contextualiser une trace.

**Source de données :** `CE_journal_entries_v1`. La relation structurelle note → session/validation n'est pas implémentée.

**Statut actuel :** Partiellement existant. Les entrées de journal existent. La jonction avec d'autres traces n'est pas établie dans le code.

**Pourquoi elle appartient au Constellium :** La note est la trace la plus humaine — elle contient la raison derrière une décision, le contexte que les chiffres ne capturent pas.

**Ce qu'elle ne doit pas faire :** Être analysée automatiquement (extraction sémantique, sentiment analysis). Elle reste opaque pour le moteur.

**Pour le V1 :** Affichable comme nœud isolé, sans lien structurel garanti vers d'autres étoiles. Si la relation n'est pas prouvable : "Relation non établie".

---

### Étoile 7 — Capture (statut futur)

**Rôle :** Image du graphique ou de l'interface au moment d'une décision.

**Source de données :** Aucune intégration existante comme donnée structurée.

**Statut actuel :** Futur. Non implémenté.

**Pour le V1 :** Nœud absent. Sa place est documentée pour la V2.

---

### Étoile 8 — IA Vision (statut futur)

**Rôle :** Analyse automatique des captures pour en extraire des données structurées.

**Source de données :** Inexistante. Concept uniquement.

**Statut actuel :** Futur. Aucune trace dans le code.

**Pour le V1 :** Nœud absent. Le Constellium V1 ne nomme pas IA Vision comme active ou imminente.

---

### Étoile 9 — Miroir (statut futur)

**Rôle :** Synthèse de l'histoire comportementale — "Que révèle mon histoire ?"

**Source de données :** Dépend de la couche Empreinte Opérateur™ et Mémoire longue — non implémentée.

**Statut actuel :** Futur. Vision long terme confirmée, non démarrée.

**Pour le V1 :** Nœud absent. Condition d'activation : ≥ 50 sessions + mémoire longue opérationnelle.

---

### Tableau de synthèse des étoiles

| Étoile | Statut V1 | Source |
|--------|-----------|--------|
| Snapshot | Présente | Pilotage |
| Validation | Présente | Moteur |
| Motif comportemental | Présente | CE_behavior_sessions_v1 |
| Comparaison W1/W2 | Présente | cameleon_behavior_memory_v1 |
| Session comportementale | Présente | CE_behavior_sessions_v1 |
| Note | Partielle — lien structurel absent | CE_journal_entries_v1 |
| Capture | Absente — futur | — |
| IA Vision | Absente — futur | — |
| Miroir | Absent — futur long terme | — |

---

## 4. Liens V1

Un lien est une relation entre deux étoiles, prouvée par les données. Si la relation n'est pas prouvable, le lien n'est pas affiché.

---

### Lien 1 — Session → Motif

**Signification :** Cette session comportementale a produit ce motif (ou cette absence de motif).

**Source de preuve :** `CE_behavior_sessions_v1` — chaque session contient les patterns détectés.

**Statut :** Existant. Lien natif dans la structure des données.

**Affichable en V1 :** Oui.

**Risque UX :** Trop de motifs affichés simultanément = surcharge. Règle : afficher les motifs dominants, pas tous.

---

### Lien 2 — Session → W1/W2

**Signification :** Cette session appartient à la semaine W1 ou W2 et contribue à la comparaison.

**Source de preuve :** `cameleon_behavior_memory_v1` — split W1/W2 opérationnel (commit 77406b2).

**Statut :** Existant. Calculable.

**Affichable en V1 :** Oui.

**Risque UX :** L'opérateur pourrait interpréter W2 > W1 comme "j'ai progressé". Risque de conclusion normative. Formulation à maîtriser (cf. §6 Langage).

---

### Lien 3 — W1/W2 → Motif

**Signification :** Ce motif était présent dans W1 et absent dans W2 (ou l'inverse). La comparaison des motifs entre semaines est le cœur de la boucle mémoire.

**Source de preuve :** `cameleon_behavior_memory_v1` contient les données W1/W2 avec distribution des motifs.

**Statut :** Existant. Calculable.

**Affichable en V1 :** Oui.

**Risque :** La disparition d'un motif ne doit pas être présentée comme un "progrès certifié". Formulation stricte : "Motif observé en W1, non observé en W2."

---

### Lien 4 — Snapshot → Session

**Signification :** Ce snapshot a été pris au cours d'une période couverte par cette session comportementale.

**Source de preuve :** Timestamps des snapshots + timestamps des sessions.

**Statut :** Partiellement existant. Dépend de la présence et de la cohérence des timestamps dans les deux sources.

**Affichable en V1 :** Conditionnel. Si les timestamps ne permettent pas de lier avec certitude : "Relation incertaine" ou absent.

**Risque :** Ne pas inférer une relation causale à partir d'une proximité temporelle.

---

### Lien 5 — Validation → Session

**Signification :** Cette validation du moteur principal a eu lieu pendant une période où tel comportement était observé.

**Source de preuve :** Historique des validations + sessions comportementales. Lien temporel.

**Statut :** Partiellement existant. Les deux sources existent. La jonction temporelle n'est pas implémentée.

**Affichable en V1 :** Conditionnel. Si les timestamps permettent une association fiable, oui. Sinon, absent.

**Risque doctrinal :** Ne jamais présenter ce lien comme causal. C'est une coïncidence temporelle observée, pas une explication.

---

### Lien 6 — Note → Session (statut partiel)

**Signification :** Cette note a été écrite pendant ou après cette session.

**Source de preuve :** `CE_journal_entries_v1` + timestamps des sessions.

**Statut :** Partiellement disponible. La relation n'est pas structurée dans le code.

**Affichable en V1 :** Non. Afficher un lien non certifié serait une fabrication de sens. À documenter pour V2.

---

### Liens futurs (non affichables en V1)

| Lien | Raison de l'absence |
|------|---------------------|
| Capture → Note | Captures non structurées comme données |
| Note → Validation | Relation structurelle absente |
| Capture → IA Vision | IA Vision inexistante |
| IA Vision → Miroir | Miroir inexistant |
| Mémoire → Miroir | Mémoire longue non disponible |
| Validation → Résultat | Résultats (P&L) non reliés aux validations |

---

### Tableau de synthèse des liens

| Lien | Affichable V1 | Condition |
|------|--------------|-----------|
| Session → Motif | Oui | Natif |
| Session → W1/W2 | Oui | Natif |
| W1/W2 → Motif | Oui | Calculable |
| Snapshot → Session | Conditionnel | Dépend des timestamps |
| Validation → Session | Conditionnel | Dépend des timestamps + jonction |
| Note → Session | Non en V1 | Lien structurel absent |
| Tous les liens futurs | Non | Données absentes |

---

## 5. V1 réaliste avec données actuelles

### Ce que le Constellium V1 peut montrer maintenant

**Nœuds actifs :**
- Sessions comportementales (jusqu'à 50, FIFO)
- Motifs détectés par session
- Comparaisons W1/W2
- Distribution W1/W2 par type de motif
- Snapshots (si timestamp disponible)

**Liens affichables :**
- Session ↔ ses motifs détectés
- Sessions ↔ leur attribution W1/W2
- W1 ↔ W2 (delta motifs, delta score)
- Snapshot ↔ session contemporaine (si timestamps cohérents)

**Ce que ça donne concrètement :**
Une vue qui montre la distribution temporelle des sessions comportementales, les motifs dominants par période, et la comparaison des deux semaines les plus récentes. Sobre, honnête, ancré dans les données réelles.

### Ce que le Constellium V1 ne peut pas encore montrer

- Liens validations ↔ comportement (jonction temporelle non implémentée)
- Liens notes ↔ sessions (relation structurelle absente)
- Captures (non structurées)
- IA Vision (inexistante)
- Miroir (prérequis : mémoire longue ≥ 50 sessions)

### Formulation des absences

Quand une étoile est absente ou un lien non disponible, le Constellium affiche :
- *"Données insuffisantes"*
- *"Aucun lien observé sur cette période"*
- *"Disponible après accumulation de sessions"*

Il ne cache pas les absences. Il les nomme.

### Ce que V1 ne promet pas

V1 ne suggère pas que les nœuds absents (IA Vision, Miroir, Captures) sont "en cours de chargement" ou "bientôt disponibles". Ils sont simplement absents. Leur existence future n'est pas un argument de présentation.

---

## 6. UX / Placement

### Ce que le Constellium n'est pas dans la navigation

- **Pas un onglet principal.** Les onglets couvrent des fonctions opérationnelles actives. Le Constellium est une lecture synthétique, pas une fonction opérationnelle.
- **Pas une carte dans Mémoire.** Mémoire affiche du contenu. Les mélanger créerait la confusion entre contenus et relations.
- **Pas une landing d'onboarding.** La chaîne conceptuelle est trop riche pour un opérateur en première session.

### Placement V1 recommandé

**Une vue accessible après accumulation de données, depuis l'onglet Mémoire.**

Le Constellium V1 se déclenche quand les données le justifient. Il n'est pas visible par défaut. Il devient accessible après un seuil minimal d'usage (exemple : 3 sessions comportementales complètes).

Depuis l'onglet Mémoire, après accumulation suffisante, un accès vers la "Carte des traces" devient visible. Ce n'est pas un onglet de premier niveau — c'est une vue secondaire qui révèle les liens entre ce que Mémoire contient.

### Tunnel de découverte

- Avant le seuil : rien n'est visible.
- Au passage du seuil : indication discrète ("Votre mémoire contient assez de traces pour être cartographiée").
- L'opérateur choisit d'ouvrir la vue. Elle ne s'impose pas.

**Règle :** Le Constellium n'existe que quand il peut dire quelque chose. Avant le seuil, afficher un écran vide serait une promesse non tenue.

---

## 7. Langage autorisé

Le Constellium respecte Language System V1. Il est une extension de cette doctrine, pas une exception.

**Modèle :** Observation → Relation présente → Invitation à lire.
**Interdit :** Conclusion → Recommandation → Normalisation.

### Formules autorisées

Pour décrire un lien observé :
- "Lien observé entre [A] et [B]"
- "Trace reliée"
- "Relation présente dans la mémoire"
- "Observé lors de cette session"
- "Présent dans W1 — absent dans W2" (ou l'inverse)
- "Motif détecté dans [N] sessions"

Pour indiquer une absence ou une incertitude :
- "Données insuffisantes"
- "Aucun lien observé sur cette période"
- "Relation non établie"
- "Aucun motif récurrent observé"
- "Disponible après accumulation de données"

Pour décrire la carte globale :
- "Carte des traces enregistrées"
- "Relations observées entre les sessions"
- "Mémoire disponible : [N] sessions"

### Formules interdites

- "Vous avez progressé"
- "Amélioration observée" (qualificatif normatif)
- "Vous devez" / "Il est recommandé"
- "Réduire" / "Augmenter" + comportement
- "Opportunité"
- "Signal"
- "Résultat amélioré"
- "Profil stable" / "Profil impulsif" (comme identité permanente)
- "Bonne semaine" / "Mauvaise semaine"
- Toute formulation qui conclut à la place de l'opérateur

### Ton

Le Constellium parle comme un observateur neutre. Il note. Il relie. Il ne juge pas. Il n'oriente pas. Il ressemble davantage à une cartographie qu'à un coach.

---

## 8. Risques

### Risque 1 — Mysticisme décoratif

**Description :** Le Constellium prend un aspect visuel trop riche et devient un écran beau mais inutile.

**Probabilité :** Élevée. Les assets visuels existants (PNG/MP4 force par force) orientent naturellement vers une esthétique symbolique.

**Mitigation :** Charte visuelle V1 (`constellium-visual-charter-v1.md`) déjà claire : *calme, analytique, sobre, jamais décorative sans fonction.* Règle de vérification : "Est-ce que cette image aide à lire une dynamique ou raconte-t-elle une histoire ?" Si la réponse est floue, l'asset n'existe pas.

**Signal d'alarme :** Si quelqu'un dit "c'est beau" mais ne peut pas décrire ce qu'il a appris → dérive décorative confirmée.

---

### Risque 2 — Confusion avec un signal de trading

**Description :** L'opérateur interprète les liens affichés comme des signaux opérationnels.

**Probabilité :** Élevée. La psychologie de la visualisation tend vers la prescription.

**Mitigation :** Language System V1 strict. Aucune formulation normative. Ligne fixe visible dans la vue : *"Le Constellium observe. Il ne recommande pas."*

---

### Risque 3 — Surcharge UX

**Description :** Trop de nœuds, trop de liens affichés simultanément. L'opérateur est submergé.

**Probabilité :** Moyenne. Augmente avec l'accumulation de sessions.

**Mitigation :** Hiérarchisation visuelle stricte. Nœuds primaires visibles par défaut. Nœuds secondaires accessibles en expansion. Nombre maximum de connexions simultanées : à définir lors de l'implémentation.

---

### Risque 4 — Doublon avec l'onglet Mémoire

**Description :** L'opérateur ne comprend pas la différence entre Mémoire et Constellium.

**Probabilité :** Élevée si le Constellium affiche des *contenus* plutôt que des *liens*.

**Mitigation :** La différence doit être *structurelle*, pas seulement visuelle. Mémoire = liste de contenus. Constellium = graphe de relations. Si le Constellium ressemble à un tableau avec des icônes, il est raté.

---

### Risque 5 — Promettre IA Vision avant qu'elle existe

**Description :** La chaîne conceptuelle crée une attente. L'opérateur s'attend à voir IA Vision dans le Constellium V1.

**Probabilité :** Moyenne.

**Mitigation :** Ne pas nommer les nœuds absents de façon suggestive. Pas de placeholder "IA Vision — bientôt disponible". Les absences sont soit invisibles, soit clairement nommées "non disponible".

---

### Risque 6 — Construire trop tôt

**Description :** Le Constellium est construit avant que les données soient suffisantes pour le justifier.

**Probabilité :** Élevée si cette définition déclenche un chantier immédiat.

**Mitigation :** Ce document est une définition, pas un signal d'implémentation. Les conditions de déclenchement restent celles définies dans `constellium_position_audit.md` §13 : mise en ligne effective, Compte Utilisateur actif, validation terrain ≥ 10 opérateurs.

---

### Risque 7 — Définition creuse

**Description :** "Visualisation des liens" reste abstrait sans liste concrète de liens affichables.

**Mitigation :** Ce document la résout — les étoiles et les liens sont définis, statuts inclus. La définition centrale doit toujours être lue avec les §3 et §4.

---

## 9. Recommandation finale

### Le Constellium doit-il être construit maintenant ?

**Non.**

Les conditions de déclenchement (`constellium_position_audit.md` §13) ne sont pas réunies :
- Mise en ligne non effectuée (Phase Lancement non démarrée)
- Compte Utilisateur prêt à ouvrir, non démarré
- Validation terrain (≥ 10 opérateurs actifs) non effectuée
- CST-NAME, CST-NARR, CST-ASSETS restent ouvertes

La roadmap officielle place le Constellium Sens B en Phase Intelligence, après la Phase Lancement.

### Forme minimale possible sans chantier formel

Le `constelliumPanel` dans `index.html` existe déjà, implémenté, masqué par CSS (`display: none`, P3-03). Il préfigure le lien Validation → Session comportementale contemporaine. Sa réactivation n'est pas un chantier — c'est une ligne CSS. Mais elle demande une décision consciente, pas un "test".

### Ce qui est décidé par ce document

1. La définition officielle de V1 : "Le Constellium est la visualisation des liens entre les traces du décideur."
2. Les 9 étoiles et leurs statuts (5 présentes, 1 partielle, 3 futures).
3. Les 6 liens et leurs conditions d'affichage (3 natifs, 2 conditionnels, 1 différé).
4. Le placement UX : vue secondaire depuis Mémoire, après seuil de données.
5. La mini-charte linguistique : extension de Language System V1.
6. Les 7 risques et leurs mitigations.

### Prochaine action la plus rentable

Aucun chantier code. Aucune maquette.

Ce document est commité comme référence officielle. Il attend le signal d'implémentation — qui ne viendra qu'après la Phase Lancement.

---

## Conclusion

> Le Constellium est la visualisation des liens entre les traces du décideur.
>
> Il n'analyse pas le marché. Il n'analyse pas l'opérateur. Il montre ce qui est relié.
>
> Il existera pleinement quand les traces seront suffisantes pour que les liens soient vrais.
>
> En V1 : trois liens sont natifs, deux conditionnels, un différé. Six étoiles absentes ou partielles. Trois futures.
>
> C'est honnête. C'est suffisant pour commencer à définir — pas encore pour implémenter.

---

*Caméléon Engine — Architecture Produit et UX · 2026-06-18*
*Documents de référence : `constellium-product-architecture.md` · `constellium_position_audit.md` · `cameleon_engine_language_system_v1.md` · `constellium-visual-charter-v1.md`*
