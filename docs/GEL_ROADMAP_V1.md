# GEL_ROADMAP_V1.md
## Acte de Gel Officiel — Roadmap V1
### Caméléon Engine · Gouvernance documentaire

---

## 1 — Acte de Gel

La **Roadmap V1** est officiellement gelée.

Elle devient le **document de séquencement stratégique officiel de Caméléon Engine** à compter du **2026-07-06**.

Ce gel fait suite à l'achèvement complet du cycle de gouvernance documentaire :
10 phases de construction · 3 audits intermédiaires · intégration de 11 corrections · certification finale CAS A accordée sans réserve.

---

## 2 — Objet

La Roadmap V1 répond à une seule question : **dans quel ordre construire ce qui manque ?**

Elle définit :
- les 8 programmes structurels à construire, déduits exclusivement du Grand Plan Directeur V1 ;
- les 4 grandes phases de séquencement (A → B → C → D) ;
- les 3 conditions de transition entre phases (T1 / T2 / T3) ;
- le graphe de dépendances (15 arêtes strictes + 1 recommandée) ;
- les synthèses émergentes (SY2 · SY3) sans programme autonome ;
- les règles de gouvernance transversales (Language System V1 · 10 invariants ACF V1).

---

## 3 — Portée

La Roadmap V1 est :
- le **document de séquencement officiel** — elle détermine l'ordre de construction des programmes structurels ;
- le **filtre de priorisation** — tout chantier doit pouvoir s'inscrire dans l'un des 8 programmes et dans la phase correspondante ;
- le **point de référence pour les ADR** — toute décision technique doit s'inscrire dans un programme Roadmap V1 identifié.

La Roadmap V1 **n'est pas** :
- un planning de livraison avec des dates ;
- une liste de fonctionnalités à développer ;
- une spécification d'implémentation ;
- un engagement de délai.

---

## 4 — Hiérarchie documentaire

| Document | Niveau | Relation à la Roadmap V1 |
|---|---|---|
| Vision · IDENTITY V1 | N0 | Au-dessus — non affecté |
| Doctrines N2 actives | N1-N2 | Au-dessus — font autorité en cas de conflit |
| Architecture Conceptuelle Fondatrice V1 | N1-N2 | Au-dessus — source des invariants et familles mémoire |
| Grand Plan Directeur V1 | N2-N3 | Au-dessus — source exclusive des 8 programmes |
| **Roadmap V1** | **N3** | **CE DOCUMENT** |
| ADR | N4-N5 | En dessous — doit s'inscrire dans un programme Roadmap V1 |
| LOT / Chantiers | N5 | En dessous — doit s'inscrire dans un programme Roadmap V1 |
| Implémentation | N5 | En dessous |

---

## 5 — Ce qui reste modifiable sans rouvrir la Roadmap V1

Les éléments suivants évoluent dans leurs propres espaces documentaires sans affecter la Roadmap V1 :

- **Le statut de chaque programme** (Non ouvert → En construction → En audit → Gelé) — mis à jour au fil des chantiers, dans les documents de clôture LOT correspondants.
- **Les ADR** — décisions techniques ponctuelles, inscrites dans un programme identifié.
- **Les LOT et chantiers** — spécifications d'exécution, inscrites dans un programme identifié.
- **La complexité documentaire estimée** — peut être révisée par l'opérateur sans décision de gouvernance.
- **L'arête R1 (P5→P8 recommandée)** — peut être promue en stricte si OI V2 se révèle critique pour SY4, sans V2 Roadmap.

---

## 6 — Conditions de réouverture (V2)

Une **V2 de la Roadmap** est justifiée uniquement par l'une des situations suivantes :

1. **Évolution du Grand Plan Directeur V1** — si une V2 GPD est publiée, les blancs et dépendances changent potentiellement, ce qui peut justifier une révision des 8 programmes.
2. **Nouveau pilier structurel non préfiguré** — apparition d'un composant dont d'autres modules dépendent, absent des 8 programmes actuels et non réductible à une extension d'un programme existant.
3. **Modification de l'Architecture Conceptuelle Fondatrice V1** — ajout de familles mémoire, révision des invariants ou du dictionnaire officiel affectant directement le périmètre des programmes.
4. **Changement de gouvernance documentaire** — révision de la Doctrine de Gouvernance V1 modifiant la hiérarchie des niveaux ou les règles de conflit.

**Les situations suivantes ne justifient pas une V2 :**

- la clôture ou l'ouverture d'un programme ou d'un LOT ;
- un bug ou une régression dans un programme existant ;
- une amélioration UX ou une modification d'interface ;
- une évolution locale d'un moteur ou d'un pipeline ;
- la publication d'un ADR ;
- le changement de statut d'un programme (Non ouvert → En construction, etc.).

---

## 7 — Règle de gouvernance

> **Toute décision de développement doit être positionnée dans la Roadmap V1 avant d'être engagée.**

**Conséquences :**

- Tout nouveau LOT doit s'inscrire dans l'un des 8 programmes identifiés et dans la phase correspondante.
- Tout nouveau programme non listable dans les 8 programmes actuels est un signal architectural — il doit être traité au niveau Doctrine ou GPD avant d'être engagé.
- L'ordre des phases A→B→C→D est contraignant. La Phase B ne peut démarrer que si T1 est satisfait. La Phase C ne peut démarrer que si T2 est satisfait. La Phase D ne peut démarrer que si T3 est satisfait.
- En cas de conflit entre la Roadmap V1 et un ADR ou LOT, la Roadmap V1 fait autorité.
- En cas de conflit entre la Roadmap V1 et le GPD V1 ou une Doctrine N2, le GPD V1 ou la Doctrine fait autorité.

---

## 8 — Références

| Document | Rôle dans la Roadmap V1 |
|---|---|
| `docs/grand_plan_directeur_v1.md` | Source exclusive des 8 programmes (blancs · dépendances · terrain Roadmap) |
| `docs/GEL_GPD_V1.md` | Conditions de réouverture GPD V1 — conditionnent la V2 Roadmap |
| `docs/doctrine/architecture_conceptuelle_fondatrice_v1.md` | 10 invariants · 5 sources · 4 synthèses · 3 couches · Dictionnaire officiel |
| `docs/doctrine/pattern_reflection_doctrine_v1.md` | Doctrine obligatoire pour P2 (livrable 7) et P6 |
| `docs/doctrine/language_system_v1.md` | Règle transversale — vérification vocabulaire pour chaque programme |

---

## 9 — Historique

| Version | Date | Statut |
|---|---|---|
| Roadmap V1 | 2026-07-06 | **Gel officiel** |
| Roadmap V2 | — | En attente — conditions définies en §6 |

---

## 10 — Décision Officielle

À compter du **2026-07-06**, la **Roadmap V1** devient le document de séquencement stratégique officiel de Caméléon Engine.

Toute décision de développement devra être cohérente avec ce séquencement jusqu'au remplacement officiel par une version V2 publiée selon les conditions définies en §6.

La Roadmap V1 ne prescrit aucun délai. Elle ne clôt aucun développement. Elle établit uniquement l'ordre architectural correct dans lequel les 8 programmes structurels doivent être construits pour que le système soit cohérent avec sa vision fondatrice.

---

*Acte de gel produit à l'issue du cycle de gouvernance documentaire complet — 10 phases · 3 audits · 11 corrections · certification CAS A — Caméléon Engine, 2026-07-06.*
