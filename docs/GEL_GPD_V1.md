# GEL_GPD_V1.md
## Acte de Gel Officiel — Grand Plan Directeur V1
### Caméléon Engine · Gouvernance documentaire

---

## 1 — Acte de Gel

Le **Grand Plan Directeur V1** est officiellement gelé.

Il devient la **cartographie officielle de Caméléon Engine** à compter du **2026-07-06**.

Ce gel fait suite à l'achèvement complet du cycle de gouvernance documentaire :
construction progressive par sections · audit global indépendant · intégration des corrections · certification finale accordée sans réserve.

---

## 2 — Portée

Le Grand Plan Directeur V1 est :

- la **carte officielle du système** — blocs, moteurs, outils, familles mémoire, flux, documents, blancs, dépendances, risques, piliers futurs ;
- le **document de positionnement architectural** — chaque composant du projet y est situé dans la hiérarchie et dans le système ;
- le **point d'entrée de compréhension globale** — tout nouvel intervenant doit consulter ce document avant toute autre décision architecturale.

Le Grand Plan Directeur V1 décrit ce qui est. Il ne prescrit pas ce qui doit être construit.

---

## 3 — Ce que le GPD V1 ne remplace pas

Le Grand Plan Directeur V1 ne remplace aucun des documents suivants. Chacun reste la référence de son propre domaine.

| Document | Reste la référence de |
|---|---|
| Manifesto · IDENTITY V1 | Vision fondatrice et identité du produit |
| Doctrines N2 (Language System V1 · Lecture ≠ Action · Memory Doctrine V1 · Pattern Reflection · OI V1 · Gouvernance V1 · Macro Doctrine V1) | Principes permanents et règles de conformité |
| Architecture Conceptuelle Fondatrice V1 | Dictionnaire officiel · familles mémoire · 10 invariants · frontières |
| Documents d'architecture technique (`docs/architecture/`) | Spécifications d'implémentation des moteurs et pipelines |
| `docs/architecture/canonical_motor_state_2026.md` | États canoniques du moteur décisionnel |
| ADR (Architecture Decision Records) | Décisions techniques ponctuelles et leur justification |
| Roadmap | Décision de développement et priorisation — appartient à l'opérateur |
| LOT et chantiers | Spécifications d'exécution et validation terrain |

---

## 4 — Statut documentaire

| Élément | Rôle | Niveau | Fréquence de changement |
|---|---|---|---|
| **Vision** | Pourquoi le produit existe | N0 | Rarement — des années |
| **Doctrines** | Principes permanents — tranchent tout conflit | N1-N2 | Lentement — décision consciente |
| **Architecture Conceptuelle Fondatrice V1** | Structure du système — familles, invariants, dictionnaire | N1-N2 | Lentement — décision explicite |
| **Grand Plan Directeur V1** | Cartographie complète du projet — positionnement de chaque composant | N2-N3 | Stable jusqu'à V2 |
| **Architectures Techniques** | Spécifications des pipelines et moteurs | N3-N5 | Évolue avec les chantiers |
| **ADR** | Décisions techniques ponctuelles et justification | N4-N5 | À chaque décision technique significative |
| **Roadmap** | Priorisation et séquencement des chantiers | Indépendante | Volontairement instable — peut changer à tout moment |
| **Chantiers (LOT)** | Exécution et validation terrain | N5 | Couche terminale |

---

## 5 — Conditions de réouverture

Une **V2 du Grand Plan Directeur** est justifiée uniquement par l'une des situations suivantes :

1. **Évolution majeure de l'Architecture Conceptuelle Fondatrice V1** — ajout ou suppression de familles mémoire, modification des invariants fondateurs, révision du dictionnaire officiel.
2. **Apparition de nouveaux piliers structurels** — composants dont d'autres modules dépendent, non préfigurés dans la Partie XI de la V1.
3. **Modification profonde de la structure système** — ajout d'une couche ou d'une hiérarchie non représentable dans le schéma actuel (Partie XII).
4. **Changement de gouvernance** — révision de la Doctrine de Gouvernance V1 modifiant la hiérarchie des niveaux ou les règles de conflit.

**Les situations suivantes ne justifient pas une V2 :**

- un bug ou une régression technique ;
- un nouveau LOT ou chantier d'implémentation ;
- une amélioration UX ou une modification d'interface ;
- une évolution locale d'un moteur ou d'un outil ;
- la publication d'un ADR ;
- la clôture ou l'ouverture d'un chantier.

Ces événements sont documentés dans leurs propres espaces — ils n'affectent pas la cartographie globale.

---

## 6 — Règle de Gouvernance

> **Toute évolution future doit respecter le Grand Plan Directeur V1 tant qu'une version V2 n'a pas été officiellement publiée.**

**Conséquences :**

- Tout nouveau module ou composant doit s'insérer dans la structure existante (Partie XII — Règle d'invariance du schéma). Si l'insertion n'est pas naturelle, c'est un signal architectural avant d'être un chantier de code.
- Tout nouveau chantier doit être positionnable dans la hiérarchie à 9 niveaux (Partie I) avant d'être engagé.
- Tout document de référence non listé dans la Partie VII doit être explicitement positionné par rapport au GPD V1 avant d'être considéré comme actif.
- En cas de conflit entre le GPD V1 et un document de niveau inférieur, le GPD V1 fait autorité — sauf si une doctrine de niveau supérieur tranche différemment.

---

## 7 — Historique

| Version | Date | Statut |
|---|---|---|
| GPD V1 | 2026-07-06 | **Gel officiel** |
| GPD V2 | — | En attente — conditions définies en §5 |

---

## 8 — Décision Officielle

À compter du **2026-07-06**, le **Grand Plan Directeur V1** devient la cartographie officielle de Caméléon Engine.

Toute interprétation architecturale du projet devra être cohérente avec cette cartographie jusqu'à son remplacement officiel par une version V2 publiée selon les conditions définies en §5.

Le Grand Plan Directeur V1 ne clôt aucun développement. Il ne prescrit aucune roadmap. Il établit uniquement la représentation complète et stable de ce qui existe, de ce qui manque, et de la structure dans laquelle tout futur module devra s'inscrire.

---

*Acte de gel produit à l'issue du cycle de gouvernance documentaire complet — construction · audit · certification — Caméléon Engine, 2026-07-06.*
