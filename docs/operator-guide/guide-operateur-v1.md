# Caméléon Engine — Guide Opérateur V1

> Version 1.0 · Bêta fermée · 2026-06-07

---

## 1. Ce que Caméléon Engine fait

Caméléon Engine est un outil d'aide à la décision pour les traders spot. Il prend en entrée une description de la situation actuelle — conditions de marché et état de l'opérateur — et produit en sortie une décision structurée : ce qui est autorisé, ce qui est interdit, et à quel niveau d'engagement.

**Ce que le moteur produit concrètement :**

- Un **verdict** sur le marché (lisible / illisible / ambigu)
- Un **niveau d'engagement** recommandé (de Sniper à Observateur)
- Une liste d'**actions autorisées** et d'**actions interdites** pour la session
- Un **coaching adaptatif** ajusté au profil de l'opérateur

Le moteur ne prend pas de décision à la place de l'opérateur. Il structure ce que l'opérateur voit déjà, pour qu'il décide mieux — pas à sa place.

**Ce que le moteur évalue :**

Caméléon Engine croise deux dimensions :

1. **Le contexte de marché** — tendance, structure, volatilité, volume, liquidité
2. **L'état de l'opérateur** — niveau de confiance, état émotionnel, validation subjective de la lecture

La décision finale dépend des deux. Un marché lisible avec un opérateur en état dégradé produit une décision différente d'un marché lisible avec un opérateur calibré.

---

## 2. Ce que Caméléon Engine ne fait pas

**Caméléon Engine ne donne pas de signal d'entrée ou de sortie.** Il ne dit jamais "achète" ou "vends". Il ne connaît pas les prix, les niveaux techniques, ni les actifs en portefeuille.

**Il ne prédit pas le marché.** Aucun module du moteur ne fait de prévision. La décision est relative à la situation décrite au moment de la saisie — elle ne vaut que pour cette session.

**Il ne garantit aucun résultat.** Une décision "autorisé" ne signifie pas que le trade sera gagnant. Elle signifie que les conditions décrites rendent l'engagement cohérent selon les règles du moteur.

**Il ne remplace pas le jugement de l'opérateur.** Le moteur est un miroir structuré, pas un arbitre. Si le moteur dit "autorisé" et que l'opérateur ressent une dissonance, c'est l'opérateur qui a le dernier mot.

**Il ne surveille pas le marché en temps réel.** Caméléon Engine n'est pas connecté à un flux de données. Toutes les informations sont saisies manuellement par l'opérateur avant chaque session.

**Il ne remplace pas une formation au trading.** L'outil présuppose que l'opérateur comprend les concepts de base : tendance, structure, volatilité, position sizing. Il ne les explique pas.

---

## 3. Où saisir les informations : l'onglet Pilotage

**L'onglet Pilotage est l'entrée du moteur.** Toutes les informations que Caméléon Engine utilise pour produire une décision sont saisies ici, manuellement, avant chaque session.

### Les champs de marché

Ces champs décrivent la situation du marché au moment de la saisie :

- **Tendance** — direction dominante sur le timeframe de référence
- **Structure de marché** — clarté des niveaux, cohérence des impulsions/corrections
- **Volatilité** — niveau d'agitation du prix
- **Volume** — activité des participants
- **Liquidité** — présence de zones de liquidité significatives

### Les champs de l'opérateur

Ces champs décrivent l'état de l'opérateur au moment de la saisie :

- **Profil** — le profil de trading choisi : Passif, Équilibré ou Actif
- **Confiance** — niveau de confiance dans la lecture actuelle
- **État émotionnel** — état ressenti avant d'entrer sur le marché
- **Validation** — l'opérateur confirme ou ajuste sa propre lecture subjective

### La validation : un champ d'entrée, pas un résultat

La validation est souvent mal comprise. C'est un **champ de saisie** : l'opérateur exprime s'il valide, hésite ou rejette sa propre lecture du marché. Ce que l'opérateur indique ici modifie directement le poids accordé à sa lecture par le moteur. Ce n'est pas une confirmation de la décision finale — c'est une donnée d'entrée qui alimente le calcul.

### Règle d'utilisation

Saisir les informations dans l'état actuel, sans anticiper la décision souhaitée. Le moteur détecte les incohérences entre champs — une saisie orientée vers un résultat attendu produit une décision dégradée.

---

## 4. Où lire les résultats : l'onglet Moteur

**L'onglet Moteur est la sortie du moteur.** Après avoir saisi les informations dans Pilotage et lancé l'analyse, les résultats apparaissent ici.

### Le verdict marché

La première information affichée est le verdict du marché : **Lisible**, **Illisible** ou **Ambigu**. Ce verdict est calculé à partir des champs de marché uniquement — il ne dépend pas de l'état de l'opérateur.

### Le niveau d'engagement

Le moteur recommande un niveau d'engagement pour la session :

- **Sniper** — conditions très sélectives, un seul setup d'exception
- **Standard** — conditions normales, engagement habituel
- **Réduit** — conditions dégradées ou opérateur en état limité
- **Observateur** — pas d'engagement recommandé pour cette session

### Les actions autorisées et interdites

Le moteur liste explicitement ce qui est autorisé et ce qui est interdit pour la session. Cette liste est directement actionnable — elle remplace le besoin de se poser la question en temps réel.

### Les trois indicateurs numériques

L'onglet Moteur affiche trois scores distincts. Ils mesurent des choses différentes et ne doivent pas être confondus :

| Indicateur | Ce qu'il mesure | Plage |
|---|---|---|
| **Contexte marché** | Force brute du signal de marché | 0–100 |
| **Qualité du setup** | Lisibilité structurelle (tendance, volume, volatilité) | 0–100 |
| **Confiance d'exécution** | État combiné opérateur × marché | 0–100 |

Un score élevé sur "Contexte marché" avec un score bas sur "Confiance d'exécution" indique un marché techniquement fort mais un opérateur non aligné. La décision finale prend les deux en compte.

### Le coaching adaptatif

En bas de l'onglet Moteur, le moteur affiche un message de coaching ajusté à la situation. Ce message est généré à partir du profil opérateur, de l'état émotionnel déclaré et du verdict marché. Il ne contient jamais de conseil d'achat ou de vente.

---

## 5. Comment interpréter la décision

### La décision n'est pas un feu vert

Une décision "autorisé" ne signifie pas que le trade est bon. Elle signifie que les conditions décrites au moment de la saisie sont cohérentes avec un engagement. Si le marché évolue entre la saisie et le moment du trade, la décision ne se met pas à jour automatiquement — c'est à l'opérateur de relancer une analyse.

### Lire le niveau d'engagement avant les actions

Le niveau d'engagement (Sniper / Standard / Réduit / Observateur) est la première information à lire. Il donne l'intention globale. La liste des actions autorisées précise ensuite dans quel cadre cet engagement peut s'exprimer.

**Exemple :** Niveau Sniper + action "Long court terme autorisé" → l'opérateur peut prendre un long, mais uniquement sur un setup d'exception. Ce n'est pas une autorisation générale de shorter ou de multiplier les positions.

### Interpréter une décision "Observateur"

Une décision Observateur ne signifie pas que le marché est mauvais. Elle peut résulter d'un opérateur en état dégradé sur un marché excellent. Le moteur ne distingue pas les causes — il indique seulement que l'état combiné marché × opérateur ne justifie pas un engagement.

### Quand la décision surprend

Si la décision ne correspond pas à ce que l'opérateur attendait, deux vérifications s'imposent :

1. **Vérifier les champs de l'opérateur** — état émotionnel, confiance, validation. Un score bas sur Confiance d'exécution avec un marché fort indique que c'est l'opérateur qui dégrade la décision, pas le marché.
2. **Vérifier la cohérence des champs de marché** — des champs contradictoires (tendance haussière + structure chaotique + volume faible) produisent un verdict Ambigu ou Illisible.

La décision n'est jamais arbitraire. Elle est toujours explicable par les champs saisis.

---

## 6. Comprendre le profil opérateur

### Les trois profils disponibles

Le profil opérateur détermine le filtre appliqué à la décision du moteur. Il existe trois profils :

- **Passif** — favorise la sélectivité : moins d'engagements, conditions plus strictes, priorité à la préservation du capital
- **Équilibré** — filtre neutre : le moteur s'exprime sans sur-contrainte ni sur-permissivité
- **Actif** — favorise l'engagement : plus d'opportunités identifiées, tolérance plus haute au risque calculé

Le profil ne change pas la qualité du marché — il change le seuil à partir duquel le moteur autorise un engagement. Un marché identique produit des décisions différentes selon le profil.

### Comment choisir son profil

Le profil reflète la stratégie de l'opérateur, pas son état du moment. Il doit être stable dans le temps et aligné avec l'approche réelle du trading.

**Un opérateur qui trade peu et sélectivement** → Passif.  
**Un opérateur qui cherche régulièrement des opportunités** → Équilibré.  
**Un opérateur avec une tolérance élevée et un suivi rigoureux** → Actif.

Changer de profil à chaque session pour obtenir une décision favorable est contre-productif : le moteur perd sa capacité à refléter fidèlement l'opérateur.

### Le profil opérateur ≠ le profil comportemental

Il existe deux types de profils dans Caméléon Engine, avec des noms similaires mais des rôles distincts :

- Le **profil opérateur** (Passif / Équilibré / Actif) est saisi dans l'onglet Pilotage. Il configure le filtre du moteur principal.
- Le **profil comportemental** (Discipliné / Réactif / Impulsif / Agressif) est calculé automatiquement à partir de l'historique des trades importés dans le module Comportement.

Le profil comportemental n'est pas saisi — il est observé. Il ne modifie pas la décision du moteur directement, sauf si le Guard Level comportemental est activé (voir §7).

---

## 7. Les erreurs d'interprétation fréquentes

### Erreur 1 — Confondre Pilotage et Moteur

L'onglet **Pilotage** est l'entrée : l'opérateur saisit les données.  
L'onglet **Moteur** est la sortie : le moteur affiche la décision.

Une confusion fréquente consiste à chercher la décision dans Pilotage ou à saisir des données dans Moteur. La règle est simple : **on saisit dans Pilotage, on lit dans Moteur.**

### Erreur 2 — Lire un seul score et ignorer les deux autres

L'onglet Moteur affiche trois scores qui mesurent des choses différentes. Lire uniquement "Contexte marché = 78" sans lire "Confiance d'exécution = 31" donne une image incomplète. La décision finale intègre les trois. Un score élevé sur l'un ne compense pas un score bas sur un autre.

### Erreur 3 — Croire que la Validation confirme la décision

La **Validation** dans l'onglet Pilotage est un champ d'entrée. L'opérateur y indique son niveau de confiance dans sa propre lecture. Ce que l'opérateur saisit ici modifie le calcul — ce n'est pas le moteur qui valide la décision, c'est l'opérateur qui valide sa lecture avant que le moteur calcule.

### Erreur 4 — Ne pas comprendre le Guard Level comportemental

Si le module Comportement est utilisé et que des sessions comportementales sont enregistrées, le moteur peut être influencé silencieusement par un **Guard Level** calculé à partir de l'historique des trades. Ce mécanisme est actif sans signal visible dans l'interface principale.

**Concrètement :** un opérateur avec un profil comportemental Impulsif ou Agressif verra certaines décisions du moteur durcies automatiquement, même si tous les champs Pilotage sont favorables. C'est intentionnel — le Guard Level est un garde-fou comportemental, pas un bug.

Pour vérifier si le Guard Level est actif : aller dans le module Comportement → onglet Mémoire → l'indicateur de niveau est visible.

### Erreur 5 — Changer de profil pour forcer une décision

Passer de Passif à Actif juste avant une saisie pour obtenir une décision "autorisé" est la forme la plus courante de contournement. Le moteur le permet techniquement — mais le résultat est une décision qui ne reflète plus l'opérateur réel. Le profil doit rester stable et aligné avec la stratégie réelle, pas avec le trade souhaité du moment.

---

*Guide Opérateur V1 · Version bêta fermée · Caméléon Engine*
