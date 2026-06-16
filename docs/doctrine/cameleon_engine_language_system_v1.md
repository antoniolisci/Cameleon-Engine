# CAMÉLÉON ENGINE — LANGUAGE SYSTEM V1

*Document fondateur. Version 1.0. Référence permanente du projet.*

---

## Préambule

Ce document ne décrit pas ce que le moteur fait. Il définit ce que le moteur a le droit de dire — et à qui, et à quel moment.

Caméléon Engine est un outil cognitif. Son danger n'est pas technique : il est sémantique. Un utilisateur qui agit sur la base d'une mauvaise interprétation d'un message d'observation n'a pas été trahi par un bug — il a été trahi par une phrase mal placée dans la hiérarchie du langage.

Ce document pose les règles qui rendent cette erreur impossible.

---

## PARTIE 1 — Hiérarchie officielle

---

### Couche 1 — LECTURE
> *"Je décris ce que je vois."*

**Rôle :** observer l'état du marché et le restituer sans jugement de valeur, sans prescription, sans lien avec l'opérateur.

**Responsabilité :** être le miroir fidèle de la réalité du marché à l'instant T. Ne rien ajouter. Ne rien interpréter.

**Ce qu'elle sait :** l'état du marché (expansion / range / compression / defense / riskoff), le score moteur, les signaux bruts (fire, air, earth, water, ether, btc, dxy).

**Ce qu'elle ignore :** ce que l'opérateur a confirmé. Ce que le moteur recommande. Ce qui est autorisé ou interdit. L'état comportemental de l'opérateur.

**Ce qu'elle a le droit de dire :**
- Les états du marché, leurs caractéristiques objectives
- Les signaux présents ou absents
- Les mouvements de prix et de structure
- La force ou la faiblesse des indicateurs

**Ce qu'elle n'a jamais le droit de dire :**
- Tout ce qui implique une action de l'opérateur
- Tout ce qui implique qu'une opportunité est saisissable
- Tout ce qui utilise "vous", "tu" ou l'impératif
- Tout ce qui contient les mots : ouvrir, autoriser, permettre, recommander, entrer, saisir

---

### Couche 2 — CONFIANCE
> *"Je qualifie la lisibilité du signal."*

**Rôle :** mesurer la qualité du signal de lecture. Pas sa direction. Pas son exploitabilité. Sa clarté.

**Responsabilité :** donner à l'opérateur une indication sur la fiabilité de ce que la couche 1 lui montre. Dire si le signal est net ou flou — jamais si l'action est justifiée.

**Ce qu'elle sait :** les scores de lisibilité (trend, structure, volatilité, volume), la cohérence interne des signaux entre eux.

**Ce qu'elle ignore :** la décision de l'opérateur. Les règles d'action. Le verdict final. L'état comportemental.

**Ce qu'elle a le droit de dire :**
- La lisibilité du signal (haute, moyenne, faible)
- La cohérence ou l'incohérence entre les indicateurs
- Le degré de certitude que le signal mérite attention
- La qualité du contexte comme filtre d'interprétation

**Ce qu'elle n'a jamais le droit de dire :**
- Que l'action est recommandée ou favorable
- Que le setup est "exploitable" dans le sens "à saisir"
- Que l'engagement est justifié
- Tout ce qui contient les mots : favorable *(au sens d'autorisation)*, actif *(au sens d'engagement)*, prêt, autorisé, opportunité *(au sens d'invitation à agir)*

---

### Couche 3 — VALIDATION
> *"Je reflète ce que l'humain a décidé."*

**Rôle :** enregistrer et restituer l'état de la décision humaine. La validation ne parle pas du marché. Elle parle de ce que l'opérateur a choisi de reconnaître ou de refuser.

**Responsabilité :** être le gardien de la frontière entre ce que le moteur observe et ce que l'humain accepte. Aucune exécution n'est possible sans son accord.

**Ce qu'elle sait :** l'état de validation (accepted / adjusted / pending / rejected), la note de contexte éventuelle, le résumé de validation.

**Ce qu'elle ignore :** pourquoi le marché fait ce qu'il fait. Ce qui est autorisé ou interdit. Le verdict final.

**Ce qu'elle a le droit de dire :**
- L'état de la validation de manière factuelle
- Ce qui manque pour que la validation soit complète
- Ce que l'opérateur a explicitement refusé

**Ce qu'elle n'a jamais le droit de dire :**
- Ce que l'opérateur devrait faire
- Ce que le marché offre ou "ouvre"
- Tout ce qui contient les mots : ouvrir, recommander, suggérer, permettre, aller, agir

---

### Couche 4 — POLICY
> *"Je liste ce qui est autorisé et ce qui est interdit."*

**Rôle :** traduire l'état décisionnel en règles binaires d'action. Deux listes. Rien d'autre. Pas de narration, pas de conseil, pas de jugement.

**Responsabilité :** être la frontière concrète entre le permis et l'interdit. La Policy ne donne pas envie d'agir. Elle délimite l'espace d'action.

**Ce qu'elle sait :** le DecisionState produit par le moteur, les règles correspondantes par état.

**Ce qu'elle ignore :** le marché lui-même. La qualité du signal. L'état comportemental de l'opérateur. Le verdict narratif.

**Ce qu'elle a le droit de dire :**
- Une liste d'actions autorisées (noms d'action, forme neutre)
- Une liste d'actions interdites (noms d'action, forme neutre)
- Un message de cadrage court et factuel

**Ce qu'elle n'a jamais le droit de dire :**
- Que l'action est recommandée ou conseillée
- Que le contexte est favorable
- Tout ce qui ressemble à un conseil personnel
- Tout ce qui utilise l'impératif ou le futur prescriptif

---

### Couche 5 — FINAL DECISION
> *"Je conclus. Je suis la seule voix qui peut prescrire."*

**Rôle :** produire le verdict unique et final. Adresser directement l'opérateur. Dire ce qu'il doit faire maintenant.

**Responsabilité :** être la synthèse de toutes les couches précédentes. Elle seule peut utiliser l'impératif, le prescriptif, le "vous" ou le "tu". Elle a lu tout ce qui précède. Elle a le dernier mot.

**Ce qu'elle sait :** tout. Elle est la seule couche qui agrège la lecture, la confiance, la validation et la policy pour produire une instruction unique.

**Ce qu'elle ignore :** rien. C'est précisément pour cela qu'elle seule peut conclure.

**Ce qu'elle a le droit de dire :**
- Un verdict clair (ALIGNED / READY / WAIT / PROTECT / BLOCKED)
- Une instruction directe à l'opérateur
- Une condition explicite si l'action est possible
- Une raison concise si l'action est interdite

**Ce qu'elle n'a jamais le droit de dire :**
- Quelque chose de contradictoire avec la Policy
- Quelque chose qui ignore la Validation
- Une instruction vague qui peut être interprétée dans plusieurs sens

---

## PARTIE 2 — Doctrine du vocabulaire

---

### Grille des verbes

| Verbe | Lecture | Confiance | Validation | Policy | Final Decision |
|---|---|---|---|---|---|
| être, montrer, afficher | ✅ | ✅ | ✅ | ✅ | ✅ |
| progresser, reculer, consolider | ✅ | ✅ | ❌ | ❌ | ❌ |
| indiquer, signaler, présenter | ✅ | ✅ | ✅ | ❌ | ❌ |
| mesurer, qualifier, évaluer | ❌ | ✅ | ❌ | ❌ | ❌ |
| atteindre (un seuil) | ❌ | ✅ | ❌ | ❌ | ❌ |
| accepter, refuser, confirmer | ❌ | ❌ | ✅ | ❌ | ❌ |
| manquer (dans le sens : absent) | ❌ | ✅ | ✅ | ❌ | ❌ |
| autoriser, interdire, permettre | ❌ | ❌ | ❌ | ✅ | ✅ |
| lister, classer | ❌ | ❌ | ❌ | ✅ | ❌ |
| attendre *(instruction)* | ❌ | ❌ | ❌ | ❌ | ✅ |
| entrer, sortir *(ordre)* | ❌ | ❌ | ❌ | ❌ | ✅ uniquement si ALIGNED |
| réduire, protéger, tenir *(ordre)* | ❌ | ❌ | ❌ | ❌ | ✅ |
| ouvrir *(une fenêtre)* | ❌ | ❌ | ❌ | ❌ | ❌ jamais |
| saisir *(une opportunité)* | ❌ | ❌ | ❌ | ❌ | ❌ jamais |
| recommander, conseiller | ❌ | ❌ | ❌ | ❌ | ❌ jamais |

---

### Grille des adjectifs

| Adjectif | Lecture | Confiance | Validation | Policy | Final Decision | Raison |
|---|---|---|---|---|---|---|
| fort, faible, stable, instable | ✅ | ✅ | ❌ | ❌ | ❌ | Descriptif pur |
| lisible, flou, clair, incomplet | ❌ | ✅ | ✅ | ❌ | ❌ | Qualification du signal |
| cohérent, incohérent, partiel | ❌ | ✅ | ✅ | ❌ | ❌ | Qualification du signal |
| accepté, refusé, en attente | ❌ | ❌ | ✅ | ❌ | ❌ | État de décision humaine |
| autorisé, interdit, permis | ❌ | ❌ | ❌ | ✅ | ✅ | Règle d'action |
| aligné, bloqué, protégé | ❌ | ❌ | ❌ | ❌ | ✅ | Verdict final |
| **favorable** *(sens : "à saisir")* | ❌ | ❌ | ❌ | ❌ | ❌ | Prescriptif implicite — banni |
| **exploitable** *(sens : "à exploiter")* | ❌ | ❌ | ❌ | ❌ | ❌ | Prescriptif implicite — banni |
| **actif** *(sens : "engagé")* | ❌ | ❌ | ❌ | ❌ | ❌ | Prescriptif implicite — banni |
| **prêt** *(sens : "prêt à entrer")* | ❌ | ❌ | ❌ | ❌ | ✅ uniquement | Exclusif Final Decision |

---

### Mots bannis de toutes les couches sauf Final Decision

Ces mots créent systématiquement une ambiguïté prescriptive. Leur usage en dehors de la Final Decision est une violation de la doctrine.

> **ouvrir** *(une fenêtre, une opportunité)*
> **saisir**
> **exploitable** *(dans le sens "à saisir")*
> **favorable** *(dans le sens "tu devrais agir")*
> **actif** *(dans le sens "tu t'engages")*
> **disponible** *(dans le sens "disponible pour toi maintenant")*
> **possible** *(seul, sans verdict explicite)*

---

## PARTIE 3 — Doctrine des couleurs

---

### Principe

La couleur est le premier signal cognitif. Elle est lue avant le texte. Elle crée une attente. Si une couleur normalement associée à l'action apparaît dans une couche de lecture, l'utilisateur commence à agir mentalement avant d'avoir lu l'instruction.

**Règle absolue :** les couleurs d'autorisation sont réservées à la Final Decision et à la Policy (actions autorisées). Toute autre couche ne peut pas les utiliser — même pour un signal positif.

---

### Palette officielle par couche

#### Couche 1 — LECTURE
| Usage | Couleur | Hex | Justification cognitive |
|---|---|---|---|
| Principale | Gris neutre / bleu-gris froid | `#8B9BAF` | Aucune intention, pur constat |
| Secondaire | Blanc cassé / fond sombre | `#C8D0DC` | Lisibilité sans hiérarchie |
| Intensité | Faible — jamais saturée | — | Le marché s'exprime, pas le moteur |

**Couleurs interdites en Lecture :** tout vert (autorisation), tout orange-rouge (alerte), toute saturation élevée.

---

#### Couche 2 — CONFIANCE
| Usage | Couleur | Hex | Justification cognitive |
|---|---|---|---|
| Lisibilité haute | Bleu doux | `#5B9BD5` | Calme, fiable — pas d'urgence |
| Lisibilité moyenne | Bleu-gris | `#7A8FAA` | Nuance sans alarme |
| Lisibilité faible | Gris-beige | `#A8956E` | Signale l'incertitude sans provoquer |
| Intensité | Moyenne | — | Qualifie, ne commande pas |

**Couleurs interdites en Confiance :** vert vif (réservé à ALIGNED), orange-rouge (réservé à BLOCKED/PROTECT).

---

#### Couche 3 — VALIDATION
| Usage | Couleur | Hex | Justification cognitive |
|---|---|---|---|
| Acceptée | Vert pâle / désaturé | `#6DB887` | Signal positif sans excitation |
| En attente | Ambre froid | `#C9A84C` | Attention passive, pas urgence |
| Refusée | Rouge froid | `#B05050` | Veto clair, pas alarme |
| Intensité | Modérée | — | La décision humaine est claire mais ne s'impose pas visuellement |

**Note :** le vert de validation est intentionnellement moins saturé que le vert ALIGNED. L'acceptation d'un setup n'est pas la même chose que l'autorisation d'entrer.

---

#### Couche 4 — POLICY
| Usage | Couleur | Hex | Justification cognitive |
|---|---|---|---|
| Actions autorisées | Vert neutre | `#5BA85A` | Permission — pas invitation |
| Actions interdites | Rouge neutre | `#B04040` | Interdit — pas urgence |
| Fond liste | Gris très foncé | `#1E1E2E` | Neutralise l'émotion, liste factuelle |
| Intensité | Modérée | — | Règle, pas émotion |

---

#### Couche 5 — FINAL DECISION
| Verdict | Couleur principale | Hex | Intensité | Justification |
|---|---|---|---|---|
| ALIGNED | Vert vif, saturé | `#4CAF50` | Haute | Seul état où l'entrée est autorisée — doit trancher |
| READY | Bleu-vert | `#3AAFA9` | Moyenne-haute | Signal visible, pas encore autorisé |
| WAIT | Bleu-gris moyen | `#5A7FA8` | Moyenne | Attente structurée, pas urgence |
| TENSION | Ambre moyen | `#C89A3A` | Moyenne | Vigilance, pas alarme |
| PROTECT | Orange foncé | `#C47820` | Haute | Réduction active, signal fort |
| BLOCKED | Rouge froid désaturé | `#A03030` | Haute | Veto — pas une alarme, un mur |

**Règle des couleurs de haute intensité :** seule la Final Decision peut utiliser des couleurs à haute saturation et haute luminosité. Toute autre couche qui emprunte ces couleurs crée une fausse urgence ou une fausse autorisation.

---

### Réponse à la question de doctrine

**Quelles couleurs doivent être réservées exclusivement aux couches qui autorisent réellement une action ?**

> Le **vert vif** (`#4CAF50` et ses proches) est exclusivement réservé à la Final Decision avec verdict ALIGNED. Aucune autre couche, aucun autre état ne peut l'utiliser. Un signal "lisible" ou "cohérent" n'est pas un signal d'autorisation — il ne mérite pas la même couleur.

---

## PARTIE 4 — Doctrine des icônes

---

### Principe

Une icône est un pré-mot. Elle est lue avant le texte, avant la couleur. Une icône de validation dans une couche de lecture crée une autorisation implicite que le texte n'a jamais donnée.

---

### Grille des icônes par couche

#### Couche 1 — LECTURE : icônes descriptives uniquement
| Icône | Usage autorisé | Signification |
|---|---|---|
| 〇 Cercle vide | État neutre, observation | "Je regarde" |
| ↑ ↓ Flèches directionnelles | Direction du mouvement marché | "Le prix monte / descend" |
| ≈ Tilde / vagues | Compression, range | "Stabilité, attente" |
| 〰 Ligne brisée | Volatilité, instabilité | "Signal irrégulier" |

**Icônes interdites en Lecture :**
- ✅ Coche verte — implique validation
- ⚡ Éclair — implique urgence d'action
- 🎯 Cible — implique intention d'entrée
- ▶ Play — implique démarrage d'action

---

#### Couche 2 — CONFIANCE : icônes de qualité uniquement
| Icône | Usage autorisé | Signification |
|---|---|---|
| ◉ Cercle plein partiel | Degré de lisibilité | "Signal X% lisible" |
| ▪▪▪ Barres de force | Niveau de confiance | "Lisibilité faible / moyenne / forte" |
| ? Point d'interrogation | Incertitude de lecture | "Signal ambigu" |

**Icônes interdites en Confiance :**
- ✅ — implique accord humain (Validation)
- ⚠️ seul — implique urgence (Final Decision)
- ▶ — implique action

---

#### Couche 3 — VALIDATION : icônes de décision humaine
| Icône | Usage autorisé | Signification |
|---|---|---|
| ✔ Coche simple | Validation acceptée | "L'humain a confirmé" |
| ✗ Croix simple | Validation refusée | "L'humain a refusé" |
| ⏸ Pause | Validation en attente | "Décision humaine non encore rendue" |

**Icônes interdites en Validation :**
- ▶ — implique exécution
- 🎯 — implique entrée
- Toute icône de marché (flèches directionnelles) — la validation ne parle pas du marché

---

#### Couche 4 — POLICY : icônes de règle
| Icône | Usage autorisé | Signification |
|---|---|---|
| ✅ Coche verte | Action autorisée (liste) | "Cette action est permise" |
| 🚫 / ✗ Rouge | Action interdite (liste) | "Cette action est interdite" |

**Note :** la coche verte (✅) est autorisée en Policy uniquement dans les listes d'actions — jamais comme élément de titre ou de verdict. Dans la liste, elle dit "cette action est permise", pas "entre maintenant".

---

#### Couche 5 — FINAL DECISION : icônes de verdict exclusives
| Icône | Verdict | Signification |
|---|---|---|
| ✅ Coche verte grande | ALIGNED | "L'entrée est autorisée" |
| 👀 Yeux | READY | "Regarder — ne pas agir encore" |
| ⏸ Pause | WAIT | "Attendre" |
| 🛡 Bouclier | PROTECT | "Réduire, protéger" |
| 🔴 Point rouge | BLOCKED | "Stop — aucune exécution" |

**Réponse à la question de doctrine :**

> **Non.** Une couche de Lecture ne peut pas utiliser les mêmes symboles qu'une couche d'autorisation. La coche verte (✅), le play (▶), la cible (🎯) et l'éclair (⚡) sont exclusivement réservés à la Policy et à la Final Decision. En Lecture ou en Confiance, ces icônes créent une autorisation implicite que le texte n'a pas donnée et que l'architecture n'a pas validée.

---

## PARTIE 5 — Doctrine typographique

---

### Principe

La hiérarchie typographique doit refléter la hiérarchie cognitive. Ce qui est le plus important pour l'action de l'opérateur doit être le plus visible. Ce qui est informatif mais non prescriptif doit être visuellement secondaire.

---

### Hiérarchie des poids visuels

| Rang | Couche | Taille relative | Poids | Position | Rôle visuel |
|---|---|---|---|---|---|
| 1 | Final Decision | 140–160% | Extra-bold (700–900) | Dessus du pli / zone centrale | Impossible à manquer |
| 2 | Validation | 110–120% | Bold (600) | Adjacente à Final Decision | Contexte immédiat du verdict |
| 3 | Policy | 100% | Medium (500) | Sous le verdict | Règles d'action lisibles |
| 4 | Confiance | 90% | Regular (400) | Section secondaire | Qualifie sans dominer |
| 5 | Lecture | 85% | Regular / Light (300–400) | Fond informationnel | Contexte, jamais au premier plan |

---

### Règles typographiques par couche

**Couche 1 — LECTURE**
- Taille : petite (85% de la base)
- Poids : Regular ou Light
- Opacité : 60–75% (recul visuel intentionnel)
- Majuscules : interdites pour les messages (réservées aux labels de couche)
- Objectif : présent mais non dominant

**Couche 2 — CONFIANCE**
- Taille : légèrement sous la base (90%)
- Poids : Regular
- Opacité : 70–80%
- Format : chiffres + unités (pourcentages, niveaux) pour ancrer dans le factuel
- Objectif : lisible, pas saillant

**Couche 3 — VALIDATION**
- Taille : base + 10%
- Poids : Bold
- Couleur : selon l'état (vert pâle / ambre / rouge froid)
- Objectif : immédiatement repérable comme décision humaine

**Couche 4 — POLICY**
- Taille : base
- Poids : Medium
- Format : listes, jamais de prose
- Espacement augmenté entre les items (respiration)
- Objectif : scannable en moins de 2 secondes

**Couche 5 — FINAL DECISION**
- Taille : 140–160% de la base
- Poids : Extra-bold
- Couleur : selon verdict (couleurs réservées haute intensité)
- Objectif : lu en premier, compris en 1 seconde

---

### Ordre de lecture officiel

```
┌─────────────────────────────────────┐
│  FINAL DECISION        [150% Bold]  │  ← lu en premier
│  Conditions réunies. Attendre.      │
├─────────────────────────────────────┤
│  VALIDATION            [120% Bold]  │  ← lu en deuxième
│  En attente                         │
├─────────────────────────────────────┤
│  POLICY                [100% Med]   │  ← lu en troisième
│  ✅ Observer     🚫 Entrer          │
├─────────────────────────────────────┤
│  CONFIANCE             [90% Reg]    │  ← contexte
│  Signal lisible à 78%               │
├─────────────────────────────────────┤
│  LECTURE               [85% Light]  │  ← fond informationnel
│  Marché en expansion. BTC fort.     │
└─────────────────────────────────────┘
```

La page se lit de haut en bas dans l'ordre de la décision, pas dans l'ordre de la construction du signal. L'utilisateur voit d'abord ce qu'il doit faire, puis pourquoi.

---

## PARTIE 6 — Doctrine narrative

---

### Structure officielle du flux

```
LECTURE
  "Le marché est en expansion. Structure claire."
    ↓
CONFIANCE
  "Signal lisible. Trois facteurs alignés sur quatre."
    ↓
VALIDATION
  "Validation en attente. La confirmation humaine manque."
    ↓
POLICY
  "Autorisé : Observer / Préparer les niveaux
   Interdit : Entrer / Renforcer"
    ↓
FINAL DECISION
  "Signal visible. Attendre la confirmation avant toute exécution."
```

---

### Règles de la hiérarchie narrative

**Règle 1 — Le dernier mot appartient à la Final Decision.**
Aucune couche ne peut contredire ou nuancer le verdict de la Final Decision. Si la Final Decision dit WAIT, aucun message de Lecture ne peut dire "l'opportunité est là".

**Règle 2 — Une couche inférieure ne peut jamais contredire une couche supérieure.**
L'ordre est strict : Lecture → Confiance → Validation → Policy → Final Decision. Une couche inférieure fournit le matériau. Une couche supérieure synthétise. Si la synthèse dit stop, la description dit ce qu'elle voit — pas ce que l'opérateur devrait en faire.

**Règle 3 — En cas d'apparence de contradiction, la couche la plus haute prime sans exception.**
Si la Lecture dit "expansion forte" et que la Final Decision dit BLOCKED, il n'y a pas de contradiction — il y a une information (Lecture) et une instruction (Final Decision). L'utilisateur agit sur l'instruction, pas sur l'information.

**Règle 4 — La Final Decision est la seule voix qui parle à l'opérateur en tant qu'agent.**
Toutes les autres couches parlent du monde (marché, signal, règles). Seule la Final Decision s'adresse à l'opérateur directement, en tant que sujet d'une action future.

**Règle 5 — Toute phrase ambiguë est attribuée à la couche la plus haute qui peut la justifier.**
Si une phrase hésite entre Confiance et Final Decision, elle appartient à Final Decision — et donc, si elle est dans la zone Confiance, elle est mal placée.

---

## PARTIE 7 — Tests de conformité

---

### Grille d'audit — checklist réutilisable

Pour chaque phrase affichée dans Caméléon Engine, appliquer les cinq questions suivantes :

```
1. APPARTENANCE
   Dans quelle couche cette phrase est-elle affichée ?
   □ Lecture  □ Confiance  □ Validation  □ Policy  □ Final Decision

2. SUJET GRAMMATICAL
   Qui est le sujet de la phrase ?
   □ Le marché / le prix / la structure     → Lecture ✅
   □ Le signal / la lisibilité              → Confiance ✅
   □ L'opérateur (décision passée)          → Validation ✅
   □ L'action (liste)                       → Policy ✅
   □ L'opérateur (instruction future)       → Final Decision ✅
   □ Ambigu / peut être les deux           → ⚠️ Non conforme

3. VERBES ET ADJECTIFS
   La phrase utilise-t-elle un mot banni ?
   □ ouvrir / saisir / exploitable (sens action) → ❌ Non conforme
   □ favorable / actif / prêt (sens autorisation) → ❌ Non conforme
   □ recommander / conseiller → ❌ Non conforme

4. PRESCRIPTION IMPLICITE
   Un utilisateur isolé de son contexte visuel
   pourrait-il interpréter cette phrase comme une autorisation d'agir ?
   □ Non → ✅ Conforme
   □ Peut-être → ⚠️ À reformuler
   □ Oui → ❌ Non conforme — reformulation obligatoire

5. HIÉRARCHIE
   Si la Final Decision dit WAIT ou BLOCKED,
   cette phrase semble-t-elle la contredire ?
   □ Non → ✅ Conforme
   □ Oui → ❌ Non conforme — cette phrase ne doit pas apparaître dans ce contexte
```

---

## PARTIE 8 — Application au moteur actuel

---

### Zones les plus conformes

**`trading-policy.js` — DECISION_STATE_POLICY**
La Policy est déjà au format liste binaire. Les verbes sont neutres (Observe, Prepare, Execute). Le message de cadrage reste factuel. C'est la couche la plus mature du moteur linguistiquement.

**`render.js → computeFinalDecision()` — messages passthrough**
Les messages WAIT, PROTECT, BLOCKED sont sobres et non-prescriptifs de manière excessive. *"Lecture en cours. Aucune action prioritaire."* est conforme. *"Contexte défavorable. Aucune exposition recommandée."* est conforme.

**`render.js → renderBehaviorCard()` — NEUTRE / CALME**
*"Aucune pression comportementale détectée."* et *"Observer. Laisser la structure venir."* sont descriptifs, non prescriptifs, conformes.

---

### Zones les plus problématiques

**`engine.js → buildPayload()` — `action_recommended`**
Produit du texte long prescriptif depuis la couche 1 (lecture marché), sans savoir si la validation est accordée. Parle directement à l'opérateur avant que Final Decision ait parlé.

**`confidence-score.js → THRESHOLDS`**
Les labels ("Setup favorable", "Setup acceptable") sont dans la couche Confiance mais utilisent le registre de la Final Decision.

**`render.js → CONFIDENCE_ACTION_FR`**
*"Engagement actif"*, *"Setup exploitable"* — couche Confiance, vocabulaire Policy/Final Decision.

**`render.js → STATE_SYNTHESIS`**
*"Impulsion → opportunité exploitable"*, *"Tendance → suivre le mouvement"* — couche Lecture, vocabulaire prescriptif de Final Decision.

---

### Les 10 messages les plus dangereux cognitivement

| # | Message actuel | Couche | Problème |
|---|---|---|---|
| 1 | *"La fenêtre SNIPER est ouverte"* | Lecture | "ouvrir" est prescriptif — implique action possible maintenant |
| 2 | *"Impulsion → opportunité exploitable"* | Lecture | "exploitable" + "opportunité" = invitation implicite à agir |
| 3 | *"Setup favorable"* | Confiance | "favorable" = registre Final Decision ALIGNED |
| 4 | *"Engagement actif"* | Confiance | "actif" = registre engagement = invitation à s'engager |
| 5 | *"Setup exploitable"* | Confiance | Idem n°3 — pire car "exploitable" implique l'exploitation |
| 6 | *"Une offensive peut être travaillée"* | Lecture | "offensive" + "peut être travaillée" = prescription depuis la Lecture |
| 7 | *"Tendance → suivre le mouvement"* | Lecture | "suivre" est une instruction d'action |
| 8 | *"👀 Setup favorable — attendre confirmation"* | Decision State | Mixe registre opportunité et instruction dans un seul label |
| 9 | *"✅ Exécution autorisée"* | Decision State (ALIGNED) | Conforme si Final Decision — problématique si couche 4 |
| 10 | *"Le contexte l'autorise, mais uniquement dans un cadre de risque strict"* | Lecture | "autorise" appartient à Policy — pas à la description du contexte |

---

### Les 10 reformulations les plus importantes

| # | Message actuel | Reformulation conforme | Couche cible |
|---|---|---|---|
| 1 | *"La fenêtre SNIPER est ouverte"* | *"Un signal SNIPER est visible sur la structure."* | Lecture |
| 2 | *"Impulsion → opportunité exploitable"* | *"Impulsion → signal directionnel fort."* | Lecture |
| 3 | *"Setup favorable"* | *"Signal de haute lisibilité."* | Confiance |
| 4 | *"Engagement actif"* | *"Lisibilité suffisante pour un suivi actif."* | Confiance |
| 5 | *"Setup exploitable"* | *"Signal interprétable. Structure complète."* | Confiance |
| 6 | *"Une offensive peut être travaillée"* | *"Un signal offensif est présent sur la structure."* | Lecture |
| 7 | *"Tendance → suivre le mouvement"* | *"Tendance → momentum directionnel actif."* | Lecture |
| 8 | *"Setup favorable — attendre confirmation"* | *"Signal lisible. Confirmation non encore reçue."* | Validation + FD séparés |
| 9 | *"Le contexte l'autorise"* | *"Le moteur autorise dans ce contexte."* | Final Decision |
| 10 | *"Une offensive légère peut être envisagée"* | *"Signal offensif réduit visible. Taille de position limitée."* | Lecture + FD séparés |

---

## PARTIE 9 — Charte finale

---

### CAMÉLÉON ENGINE — LANGUAGE SYSTEM V1
*20 règles fondatrices*

---

**R01 — Hiérarchie absolue**
Le moteur parle en cinq couches : Lecture → Confiance → Validation → Policy → Final Decision. Chaque couche est souveraine dans son registre. Aucune couche ne peut emprunter le vocabulaire d'une couche supérieure.

**R02 — La Final Decision a le dernier mot**
Seule la Final Decision peut conclure, prescrire et adresser l'opérateur comme agent d'une action future. Toutes les autres couches décrivent le monde. Une seule couche dit quoi faire.

**R03 — La Lecture décrit, jamais ne prescrit**
La Lecture décrit l'état du marché. Elle ne parle jamais à l'opérateur. Elle ne connaît pas la validation. Elle ne sait pas ce qui est autorisé.

**R04 — La Confiance qualifie, jamais n'autorise**
La Confiance mesure la lisibilité du signal. Un signal lisible n'est pas un signal autorisé. "Haute lisibilité" ≠ "Entrer".

**R05 — La Validation reflète, jamais ne recommande**
La Validation restitue ce que l'humain a décidé. Elle ne suggère pas ce qu'il devrait décider. Elle ne parle pas du marché.

**R06 — La Policy liste, jamais ne narre**
La Policy produit deux listes : autorisé / interdit. Elle ne raconte pas, ne conseille pas, ne juge pas. Format liste uniquement.

**R07 — Trois mots bannis de toutes les couches sauf Final Decision**
`ouvrir` *(une fenêtre d'action)*, `saisir` *(une opportunité)*, `recommander`. Ces mots créent une prescription implicite. Ils n'appartiennent qu'à la Final Decision.

**R08 — Trois adjectifs bannis de toutes les couches sauf Final Decision**
`favorable` *(dans le sens "agis")*, `exploitable` *(dans le sens "à exploiter")*, `actif` *(dans le sens "tu t'engages")*. Ces adjectifs appartiennent au registre de l'autorisation.

**R09 — Le vert vif est exclusivement réservé à ALIGNED**
Aucune couche inférieure à la Final Decision ne peut utiliser la couleur verte saturée. Une validation acceptée n'est pas une exécution autorisée — leurs verts doivent être visuellement distincts.

**R10 — La Final Decision est toujours le premier élément lu**
Typographiquement, le verdict final occupe le rang visuel le plus élevé. L'opérateur lit ce qu'il doit faire avant de lire pourquoi.

**R11 — Une icône d'autorisation ne peut pas apparaître hors de la Final Decision ou de la Policy**
✅, ▶, 🎯 sont réservés. En Lecture ou en Confiance, ces icônes créent une autorisation que le moteur n'a pas donnée.

**R12 — Le sujet grammatical trahit la couche**
Si la phrase a pour sujet l'opérateur en tant qu'agent futur, elle appartient à la Final Decision. Si elle a pour sujet le marché, elle appartient à la Lecture. Un sujet mal placé est un message mal placé.

**R13 — Aucun message ne peut être interprété différemment selon sa position sur la page**
Un message isolé de son contexte visuel doit rester compréhensible dans sa couche. Si le sens change selon où l'utilisateur regarde, le message n'est pas conforme.

**R14 — En cas de contradiction apparente, la couche la plus haute prime sans commentaire**
Le moteur ne s'excuse pas et n'explique pas la contradiction. La Final Decision dit stop : l'opérateur s'arrête. La Lecture peut continuer de décrire un marché fort — ce n'est pas une contradiction, c'est une information.

**R15 — Une couche de Lecture ne peut pas utiliser l'impératif**
*"Attendre", "Observer", "Réduire"* : impératifs. Ils appartiennent à la Final Decision. La Lecture peut écrire *"Le marché attend une cassure"* — jamais *"Attendre la cassure"*.

**R16 — Le temps verbal signale la couche**
Présent de constat → Lecture. Présent de qualification → Confiance. Passé de décision → Validation. Infinitif de règle → Policy. Impératif ou prescriptif → Final Decision exclusivement.

**R17 — La Policy ne produit jamais de prose**
Un texte continu dans la zone Policy est une violation. Deux listes courtes. Un message de cadrage maximum une ligne. Rien de plus.

**R18 — Les scores numériques appartiennent à la Confiance**
Un chiffre (78%, niveau 3, score 84) qualifie — il ne prescrit pas. Les scores restent dans la couche Confiance. La Final Decision ne s'appuie pas sur des chiffres bruts — elle synthétise.

**R19 — Un utilisateur qui lit seulement la Final Decision doit savoir exactement quoi faire**
La Final Decision est autosuffisante. Elle ne présuppose pas que l'opérateur a lu les autres couches. Elle dit tout ce qui est nécessaire à l'action en une ou deux phrases.

**R20 — Ce document est une contrainte, pas une suggestion**
La doctrine linguistique de Caméléon Engine n'est pas un guide de style. C'est une règle d'architecture cognitive. Un message qui viole la doctrine n'est pas "moins bien rédigé" — il est fonctionnellement défectueux.

---

## PARTIE 10 — Doctrine de la mémoire comportementale

---

### Principe

La mémoire comportementale est une extension temporelle de la Couche 1 — Lecture — appliquée au comportement passé de l'opérateur. Elle hérite de toutes les contraintes de la Lecture : décrire l'observable, jamais prescrire.

Elle ne constitue pas une sixième couche. Elle ne produit pas de verdict. Si un affichage mémoire ressemble à une instruction, il est mal placé dans la hiérarchie.

---

### Ce que les affichages mémoire ont le droit de faire

- Retenir et restituer ce que l'opérateur a déclaré lors des sessions passées.
- Comparer un état passé et l'état présent.
- Décrire un état comportemental en termes factuels et au passé de constat.

---

### Ce que les affichages mémoire n'ont jamais le droit de faire

- Conseiller, prescrire, recommander.
- Prédire ou extrapoler.
- Expliquer causalement ("à cause de", "parce que").
- Fusionner lecture marché et mémoire comportementale en un verdict unique.
- Présenter une évolution non prouvée comme un fait accompli.

---

### Règles de langage pour les affichages mémoire

**R-M01 — Temps de constat uniquement**
Passé composé, imparfait. Interdits : futur, conditionnel prescriptif, impératif.
- ✅ *"Tu as déclaré 7 fois une entrée FOMO sur les 10 dernières sessions."*
- ❌ *"Tu devrais éviter les entrées FOMO."*

**R-M02 — La mise en regard est descriptive, jamais directive**
- ✅ *"Tu faisais cela. Aujourd'hui, le contexte est différent."*
- ❌ *"Le motif passé indique que tu devrais attendre."*

**R-M03 — L'absence de changement est un fait, pas un échec**
- ✅ *"Le motif reste stable sur les 10 dernières sessions."*
- ❌ *"Tu n'as pas progressé."*

**R-M04 — La certification du changement est factuelle ou absente**
- ✅ *"Ce motif n'est plus apparu sur les dernières sessions."* (changement constaté)
- ❌ *"Tu as changé."* (assertion non vérifiée)

**R-M05 — La mémoire ne produit pas de verdict**
Elle décrit. Elle ne conclut pas. Toute conclusion appartient à la Final Decision.

---

**Référence doctrine complète :** `docs/doctrine/memory_doctrine_v1.md`

---

*CAMÉLÉON ENGINE — LANGUAGE SYSTEM V1*
*Document fondateur. Aucun code. Aucune modification. Référence permanente.*
*Chemin : `docs/doctrine/cameleon_engine_language_system_v1.md`*
