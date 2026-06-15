# CAMÉLÉON ENGINE — IDENTITY V1

> Document fondateur synthétique · Point d'entrée unique pour toute question identitaire
> Créé : 2026-06-15 · Statut : Référence active

---

## I. Principe fondateur

> **Caméléon Engine est une présence calme qui rend la décision lisible sans la prendre.**

Source : `manifesto-cameleon-engine.md §XVI`

Ce principe contient tout. Il n'admet aucune exception.

---

## II. Ce que le produit est

- Un **cockpit cognitif de décision** pour traders.
- Un **instrument de lecture** : il décrit le contexte, structure la lecture, rend la décision lisible.
- Un **système de friction intelligente** : il ralentit le geste impulsif sans bloquer l'action.
- Un **miroir lucide** : il restitue l'état comportemental de l'utilisateur sans le juger.
- Une **présence calme** : plus la situation est intense, plus le cockpit est calme.

Référence complète : `docs/manifesto-cameleon-engine.md §I`

---

## III. Ce que le produit n'est pas

- Pas un système de signaux. Il ne dit jamais "achète" ou "vends".
- Pas un bot. Il ne génère pas d'ordres, ne déclenche pas d'exécutions.
- Pas un oracle. Ses lectures sont conditionnelles, partielles, datées.
- Pas un dashboard. Il raconte une histoire séquentielle.
- Pas un coach. Il ne soigne pas, n'éduque pas, ne flatte pas.
- Pas un produit grand public déguisé. Il ne s'agite pas, ne crie pas.

Référence complète : `docs/manifesto-cameleon-engine.md §II`

---

## IV. Modèle cognitif officiel

```
Lecture → Compréhension → Décision humaine
```

Ce modèle **remplace définitivement** :

```
Lecture → Signal → Exécution
```

**Traduction opérationnelle :**

| Rôle | Acteur |
|------|--------|
| Lit le contexte | Le moteur |
| Structure la lecture | Le moteur |
| Décide | L'utilisateur — toujours |

Le moteur ne décide jamais. Le moteur ne recommande jamais. Le moteur ne valide jamais pour l'utilisateur.

Référence : `docs/doctrine/lecture_not_equal_action.md`

---

## V. Hiérarchie doctrinale

La doctrine est organisée en 6 niveaux. En cas de conflit, le niveau le plus bas prime.

```
N0  Principe fondateur        manifesto-cameleon-engine.md §XVI
N1  Doctrine identité         manifesto-cameleon-engine.md + IDENTITY_V1.md (ce document)
N2  Doctrine langage          cameleon_engine_language_system_v1.md
                               lecture_not_equal_action.md
N3  Doctrine architecture     how-cameleon-reads-v1.md
                               canonical_motor_state_2026.md
N4  Déclinaisons opérat.      guide-operateur-v1.md
                               constellium-product-architecture.md
N5  Documentation technique   CLAUDE.md · README.md · docs/architecture/
```

Référence complète : `memory/project_doctrine_hierarchy.md`

---

## VI. Vocabulaire officiel

**Mots bannis** (liste courte — tous les textes visibles utilisateur) :
exploitable · opportunité · favorable (sens engagement) · Entrer/Exécuter/Suivre (impératifs) · requises · recommandé · autoriser · setup (→ structure) · signal d'exécution

**Modèle à la phrase** :
- ✅ "Le moteur structure la lecture."
- ✅ "La décision t'appartient."
- ✅ "Structure identifiée. Lecture en cours de confirmation."
- ❌ "Signal disponible — exécution possible."
- ❌ "Conditions réunies — entrer avec confirmation."

**Référence exhaustive :** `docs/doctrine/cameleon_engine_language_system_v1.md`

---

## VII. Tests de conformité rapides

Avant tout nouveau texte visible ou fonctionnalité :

1. Ce texte prescrit-il une action ? → Si oui : invalide.
2. Ce texte positionne-t-il le moteur comme décideur ? → Si oui : invalide.
3. Ce texte encode-t-il un chemin Signal→Action ? → Si oui : invalide.
4. La couche qui produit ce texte est-elle autorisée à prescrire ? → Seule Final Decision le peut.
5. Un utilisateur de 30 secondes perçoit-il un système de signaux ou un cockpit de lecture ? → Cockpit requis.

Référence complète des 10 tests : `docs/doctrine/lecture_not_equal_action.md §Tests de conformité`
