# Caméléon Engine — Foundations Index

**Date :** 2026-05-27  
**Portée :** index des documents fondateurs du projet

---

## 1. Rôle de cet index

Ce document centralise les documents fondateurs de Caméléon Engine.

Il sert :
- de point d'entrée pour comprendre la doctrine du projet,
- de mémoire structurelle des décisions architecturales,
- de guide de lecture pour les nouveaux contributeurs,
- de référence de cohérence avant tout nouveau chantier.

Ces documents ne sont pas du marketing. Ils définissent :
- la doctrine,
- les limites,
- les principes de conception,
- les règles de représentation,
- la hiérarchie des couches,
- les garde-fous anti-dérive.

---

## 2. Documents fondamentaux

> **Mise à jour 2026-06-15 — Language System V1**
> Deux documents doctrinaux ont été ajoutés et constituent désormais la **source de vérité pour tout texte visible utilisateur** :
> - `docs/doctrine/cameleon_engine_language_system_v1.md` — règles de langage exhaustives, 5 couches, mots bannis, 20 règles fondatrices.
> - `docs/doctrine/lecture_not_equal_action.md` — principe fondateur Lecture ≠ Action, 10 tests de conformité.
> - `docs/doctrine/IDENTITY_V1.md` — point d'entrée synthétique, hiérarchie doctrinale N0–N5.
> - `docs/doctrine/memory_doctrine_v1.md` — doctrine N2 de la mémoire comportementale : règles d'affichage, ce que la mémoire peut et ne peut jamais faire.
>
> Le modèle cognitif officiel est désormais : **Lecture → Compréhension → Décision humaine**
> (remplace définitivement : Lecture → Signal → Exécution)
>
> Pour la hiérarchie complète des sources de vérité, voir : `memory/project_doctrine_hierarchy.md`

---

### IDENTITY V1 — Point d'entrée identitaire

| | |
|---|---|
| **Chemin** | `docs/doctrine/IDENTITY_V1.md` |
| **Rôle** | Point d'entrée synthétique pour toute question identitaire. Ce que le produit est, ce qu'il n'est pas, le modèle cognitif officiel, la hiérarchie doctrinale N0–N5. |
| **Statut** | Référence active · Document fondateur |
| **Importance** | À lire en premier avant tout chantier. Contient les 5 tests de conformité rapides et le vocabulaire officiel. |

---

### How Caméléon Reads — V1

| | |
|---|---|
| **Chemin** | `docs/architecture/how-cameleon-reads-v1.md` |
| **Rôle** | Explique le fonctionnement structurel du moteur, les quatre couches, la distinction PDF/CSV et la souveraineté des données. |
| **Statut** | Référence pédagogique active |
| **Importance** | Clarifie ce que le moteur lit réellement et ce qu'il refuse de produire. Document d'entrée pour tout contributeur ou chantier nouveau. |

---

### Constellium — Définition V1

| | |
|---|---|
| **Chemin** | `docs/architecture/constellium/constellium_v1_definition.md` |
| **Rôle** | Définit ce que l'opérateur voit dans le Constellium : définition positive et négative, 9 étoiles (traces du décideur), 6 liens affichables, placement UX, charte linguistique, 7 risques. |
| **Statut** | Référence officielle · 2026-06-18 · Implémentation gelée |
| **Importance** | Phrase fondatrice : "Le Constellium est la visualisation des liens entre les traces du décideur." Document à consulter avant tout chantier Constellium. |

---

### Constellium — Visual Charter V1

| | |
|---|---|
| **Chemin** | `docs/visual/constellium-visual-charter-v1.md` |
| **Rôle** | Définit la direction visuelle officielle du Constellium, les interdictions, les règles de représentation et les garde-fous esthétiques. |
| **Statut** | Référence officielle active |
| **Importance** | Protège contre la dérive mystique, identitaire ou narrative. Document de référence avant tout travail sur les assets visuels. |

---

### Synthèse stratégique 48h — mai 2026

| | |
|---|---|
| **Chemin** | `memory/project_synthese_48h_mai2026.md` |
| **Rôle** | Mémoire stratégique des réflexions architecturales ayant conduit au réalignement doctrinal de mai 2026. |
| **Statut** | Archive de synchronisation active |
| **Importance** | Trace la transition doctrinale majeure du projet. Utile pour comprendre pourquoi certaines directions ont été exclues. |

---

## 3. Ordre de lecture recommandé

1. **IDENTITY V1** — comprendre ce que le produit est et n'est pas avant tout le reste. Contient la hiérarchie doctrinale complète et les tests de conformité.
2. **How Caméléon Reads** — comprendre le fonctionnement structurel du moteur.
3. **Constellium Définition V1** — comprendre ce que le Constellium devient : traces, liens, UX, langage autorisé.
4. **Constellium Visual Charter** — comprendre les règles de la couche de représentation secondaire.
5. **Synthèse stratégique 48h** — comprendre le contexte des décisions et les directions exclues.

Cet ordre existe parce que la doctrine identitaire est le filtre de tout le reste. La lecture du moteur est le socle technique. La représentation visuelle est secondaire au moteur. La synthèse stratégique donne le contexte des arbitrages sans lequel les documents précédents semblent arbitraires.

---

## 4. Principes fondateurs communs

Ces principes sont présents dans l'ensemble des documents fondateurs. Ils forment la base doctrinale commune :

- **Souveraineté des données** — les métriques observables ont toujours la priorité sur les représentations.
- **Traçabilité** — toute lecture produite doit pouvoir être reliée à des données observables.
- **Hiérarchie des couches** — les quatre couches ont un ordre fixe et non négociable.
- **Représentation secondaire** — le Constellium synthétise, il ne remplace pas.
- **Refus de l'identité utilisateur** — le moteur lit des dynamiques, pas des profils.
- **Refus du compagnon IA** — le moteur ne construit pas de relation.
- **Auto-limitation** — le système contient volontairement des mécanismes limitant sa propre influence.
- **Sobriété** — aucune couche ne doit devenir plus saillante que les données qu'elle représente.
- **Anti-centralité psychologique** — le moteur n'est pas un référent identitaire.
- **Anti-gamification** — aucune mécanique d'engagement découplée de la qualité de lecture.
- **Moteur structurel et non psychologique** — les structures comportementales sont observables ; les états psychologiques ne le sont pas.

---

## 5. Règle d'usage

Tout nouveau chantier — UX, comportemental, visualisation, IA, PDF, agents, représentation — doit être confronté à ces documents avant implémentation.

Ces documents servent :
- d'arbitres en cas de doute sur la direction,
- de garde-fous contre les dérives progressives,
- de mémoire du projet quand le contexte change.

Un chantier qui contredit un principe listé dans ces documents nécessite une décision explicite de modification de la doctrine, pas une implémentation silencieuse.

---

## 6. Conclusion

Ces documents ne définissent pas seulement ce que Caméléon Engine construit.

Ils définissent aussi ce que Caméléon Engine refuse de devenir.

---

## 7. Document d'accueil opérateur

Ce document n'est pas un document fondateur. Il n'est pas doctrinal. Il est le point d'entrée pour tout testeur bêta ou opérateur qui découvre Caméléon Engine.

| | |
|---|---|
| **Chemin** | `docs/operator-guide/guide-operateur-v1.md` |
| **Rôle** | Mode d'emploi complet — non technique. Ce que le moteur fait, où saisir les informations, où lire les résultats, comment interpréter la décision, les erreurs fréquentes. |
| **Statut** | Actif · Version bêta fermée · commit `2061162` |
| **Audience** | Opérateurs, testeurs bêta, tout intervenant non technique |
