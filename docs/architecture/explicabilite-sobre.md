# Couche d'explicabilité sobre — Caméléon Engine

**Statut** : Document d'architecture V2 · Chantier ouvert · Aucune implémentation immédiate
**Version** : 1.0 — 2026-05-24
**Composant V2** : 3/4 — suite de `docs/architecture/hierarchie-des-tensions.md`
**Doctrine de référence** : `docs/architecture/doctrine-silence-structurel.md`

---

## Point de départ

La hiérarchie des tensions produit un `HierarchyResult` avec un `winner : TensionId | null`.
Si `winner = null`, le moteur fonctionne en silence total. Aucun problème à résoudre.

Si `winner ≠ null`, une tension a passé le routage. Elle doit être exposée à l'opérateur.
La question est : sous quelle forme ?

La doctrine du silence structurel impose une contrainte forte sur cette forme :
la tension doit être exposable sans jugement, sans prescription, sans surcharge cognitive.
Un message brut du type "T3 delta +2" est illisible. Un message du type "Votre engagement est
trop élevé par rapport aux conditions actuelles" est normatif et viole la doctrine.

La couche d'explicabilité sobre est le traducteur entre l'abstraction technique (`winner: T3,
delta: +2`) et une formulation opérationnelle neutre, immédiatement lisible, sans charge morale.

---

## Ce que cette couche n'est pas

**Pas un système de coaching.** Le coaching comportemental est dans le module comportemental.
Cette couche ne produit pas de recommandations sur la posture de l'opérateur.

**Pas un système d'alerte.** Aucun signal visuel urgent, aucune couleur rouge, aucun son.
Une tension exposée est une information structurelle, pas une alarme.

**Pas un système de justification moteur.** La couche n'explique pas pourquoi le moteur
a produit tel score ou telle posture. Elle traduit uniquement la tension `winner`.

**Pas un système de scoring de tension.** Elle ne produit pas de note globale, pas de
"niveau de risque" agrégé, pas d'indice composite.

**Pas persistante.** Aucun localStorage, aucune session storage, aucun historique
d'exposition. Chaque cycle est indépendant.

---

## Input / Output

### Input

La couche reçoit le `HierarchyResult` produit par la hiérarchie des tensions :

```
HierarchyResult {
  winner: TensionId | null,
  absorbed: TensionId[],
  silent: TensionId[],
  escalated: TensionId[],
  deescalated: TensionId[]
}
```

Pour produire sa sortie, elle a besoin du détail de la tension `winner` :

```
TensionDetail {
  id: TensionId,
  type: "contextual" | "structural" | "critical" | "blocking",
  delta: number | string,
  modules: [string, string],
  severity: 1 | 2 | 3 | 4
}
```

### Output

Si `winner = null` → la couche retourne `null`. Rien n'est affiché.

Si `winner ≠ null` → la couche retourne :

```
ExpositionResult {
  message: string,       // formulation finale destinée à l'UI
  intention: "expliquer" | "ralentir" | "contextualiser" | "bloquer",
  tension_id: TensionId,
  severity: 1 | 2 | 3 | 4,
  is_blocking: boolean
}
```

`is_blocking = true` uniquement si `type = "blocking"`. Dans ce cas, la décision moteur
est marquée comme suspendue dans le payload.

---

## Les quatre intentions

Le message n'est pas neutre dans sa fonction, même s'il est neutre dans sa forme.
La couche sélectionne une intention selon la sévérité et le type de la tension.

| Intention | Sévérité | Objet |
|---|---|---|
| **expliquer** | 1–2 | Poser un fait structurel observable. L'opérateur peut continuer. |
| **ralentir** | 2–3 | Introduire une friction légère. Pas une interdiction, une pause. |
| **contextualiser** | 2–3 | Replacer la tension dans le cadre premium ou comportemental. |
| **bloquer** | 4 | Suspendre la décision. Contradiction irréductible détectée. |

**Règle de sélection :**
- `type = blocking` → intention = bloquer, `is_blocking = true`
- `type = critical` + actionabilité directe → intention = ralentir
- `type = critical` + actionabilité conditionnelle → intention = contextualiser
- `type = structural` ou `contextual` → intention = expliquer

L'intention ne se voit pas dans l'UI finale. Elle guide uniquement la sélection
du template et le traitement visuel par la couche de rendering.

---

## Règles de formulation

Sept règles contraignent chaque message produit par la couche.

**R1 — Pas de première ni deuxième personne.**
Ni "je détecte", ni "vous devriez", ni "votre profil". Le message parle des modules et
des faits structurels, pas de l'opérateur ni du moteur comme agents.

**R2 — Pas de verbe modal prescriptif.**
Interdit : "devriez", "pourriez envisager", "il serait prudent de", "il faudrait".
Ces formulations transgressent la doctrine en introduisant une recommandation implicite.

**R3 — Maximum 20 mots.**
Une tension exposée est une information périphérique, pas le centre de l'écran.
Elle doit être lisible en 2–3 secondes sans décoder.

**R4 — Pas de phrase interrogative.**
"Avez-vous vérifié la maturité de structure ?" — interdit. L'interrogatif crée
une pression implicite et implique que l'opérateur a omis quelque chose.

**R5 — Fait structurel, pas interprétation.**
"Distance posture/engagement : +2 crans." — fait structurel.
"Votre engagement dépasse la posture recommandée." — interprétation normative. Interdit.

**R6 — Pas d'auto-explication.**
Le message ne dit pas "tension détectée entre X et Y par le moteur". Il dit
directement ce que la tension révèle sur les conditions actuelles.

**R7 — Cohérence lexicale avec le corpus.**
Les termes doivent correspondre au vocabulaire des fiches (posture, engagement, maturité,
retracement, divergence, etc.). Aucun néologisme, aucun emprunt à la terminologie ICT/SMC.

---

## Templates de messages par tension

Les templates sont des structures fixes avec variables substituées au moment du rendu.
Chaque tension dispose d'un template par niveau d'intention possible.

### T3 — Engagement ↔ Posture

```
expliquer   : "Distance posture/engagement : +{delta} cran(s)."
ralentir    : "Distance posture/engagement : +{delta} crans — écart structurel direct."
bloquer     : "Contradiction structurelle — décision suspendue."
```

### T1 — Freeware ↔ Premium

```
expliquer   : "Lisibilité freeware non confirmée par {module}."
contextualiser : "Lisibilité freeware / {module} contradictoires — lecture à deux niveaux."
```

### T2 — Profil comportemental ↔ Posture

```
expliquer   : "Posture ACTIVE · profil {profil} — tension détectée."
contextualiser : "Posture ACTIVE · profil {profil} — combinaison structurellement identifiée."
```

### T4 — QdR ↔ MdS (tension intra-premium)

```
expliquer   : "Retracement qualifié · structure non confirmée."
contextualiser : "Correction propre dans structure précoce — lecture ambiguë."
```

### Contradiction bloquante (tous types)

```
bloquer     : "Contradiction structurelle — décision suspendue."
```

**Règle de substitution** : les variables `{delta}`, `{module}`, `{profil}` sont
injectées depuis `TensionDetail` au moment de la production du message. Si une variable
est absente, la couche substitue une valeur générique plutôt que d'omettre le message.

---

## Règles de cycle et de persistance

La couche produit un résultat par cycle de calcul (par soumission du formulaire).
Elle ne stocke rien entre les cycles.

**Apparition** : le message s'affiche quand `winner ≠ null` pour la première fois dans la session.

**Persistance intra-cycle** : si deux soumissions consécutives produisent le même `winner`
avec le même delta, le message reste identique. Pas d'animation répétée, pas de rechargement.

**Disparition** : quand `winner = null`, `ExpositionResult = null`, le message disparaît.
La disparition est silencieuse — aucune animation, aucun feedback "tension résolue".

**Absence de mémoire inter-sessions** : aucun localStorage, aucune session storage.
Le message de la session précédente n'est pas rappelé au démarrage.

**Indépendance** : la couche ne sait pas si la tension avait déjà été exposée lors
d'une session antérieure. Elle ne peut pas "apprendre" à filtrer les tensions récurrentes.
Ce comportement est intentionnel — la récurrence d'une tension est une information
structurelle, pas un bruit à supprimer.

---

## Cas limites

**`winner` non nul mais `TensionDetail` introuvable** : la couche retourne `null` plutôt
que d'afficher un message incomplet. Mieux vaut le silence qu'une formulation tronquée.

**Variable de substitution absente** : si `{profil}` est absent pour T2 (module
comportemental non chargé), le template devient "Posture ACTIVE · profil non chargé —
tension détectée." La variable générique doit être définie pour chaque tension (D-EXP-03).

**`is_blocking = true` sans décision moteur disponible** : cas théorique. Si le payload
moteur n'a pas encore été produit, la couche ne peut pas marquer la décision comme suspendue.
Comportement à définir (D-EXP-04).

**Deux soumissions rapides** : si deux cycles se produisent avant que le rendu du premier
soit terminé, la couche produit le résultat du cycle le plus récent. Le cycle précédent
est abandonné — pas de queue, pas de buffer.

---

## Interface avec la couche de rendering

La couche d'explicabilité sobre produit un `ExpositionResult`. Elle ne sait pas comment
il sera affiché. La couche de rendering (composant V2-4) est responsable de la présentation.

**Ce que la couche fournit à la couche de rendering :**
- `message` : la chaîne de caractères finale, prête à l'affichage
- `intention` : le signal sémantique (`expliquer`, `ralentir`, `contextualiser`, `bloquer`)
- `severity` : le niveau numérique (1–4) pour le traitement visuel optionnel
- `is_blocking` : le flag de suspension de décision

**Ce que la couche ne contrôle pas :**
- La position du message dans l'UI
- La couleur, la typographie, l'animation
- La durée d'affichage
- Le comportement sur mobile vs desktop

**Contrat d'interface** : la couche de rendering peut utiliser `intention` et `severity`
pour différencier visuellement les niveaux. Elle ne peut pas modifier `message` — la
formulation est sous la responsabilité de la couche d'explicabilité.

---

## Ce que cette couche produit

- La **structure `ExpositionResult`** avec ses quatre champs (`message`, `intention`, `severity`, `is_blocking`).
- Les **quatre intentions** et leur règle de sélection depuis la sévérité et le type de tension.
- Les **sept règles de formulation** contraignant tout message produit par la couche.
- Les **templates par tension** (T1–T4 + contradiction bloquante) avec variables de substitution.
- Les **règles de cycle et de persistance** : apparition, stabilité, disparition silencieuse, absence de mémoire.
- L'**interface avec la couche de rendering** : contrat, champs exposés, séparation des responsabilités.
- L'**inventaire des dettes** D-EXP-01 à 04.

---

## Dettes identifiées

| Référence | Nature | Bloquante ? |
|---|---|---|
| D-EXP-01 | Validation terrain des templates — les formulations doivent être testées sur un panel d'opérateurs réels | Non |
| D-EXP-02 | Règle de sélection d'intention pour T4 en mode `contextualiser` — ambiguïté QdR/MdS vs formulation | Non |
| D-EXP-03 | Valeurs génériques de substitution quand les variables sont absentes (profil non chargé, module absent) | Non |
| D-EXP-04 | Comportement `is_blocking = true` si le payload moteur n'est pas encore disponible | Non — cas théorique |

---

## Statut

**Type** : Document d'architecture V2.
**Périmètre** : Couche d'explicabilité sobre — conception uniquement.
**Aucune implémentation immédiate.**
**Aucune modification moteur à partir de ce document.**
**Aucun nouveau corpus d'indicateurs.**

Ce document produit :
- La structure `ExpositionResult` et son contrat d'interface.
- Les quatre intentions et leur règle de sélection.
- Les sept règles de formulation contraignantes.
- Les templates de messages pour T1–T4 et la contradiction bloquante.
- Les règles de cycle (apparition, stabilité, disparition, absence de mémoire).
- L'inventaire des dettes D-EXP-01 à 04.

Prochaine étape naturelle : couche de gestion de l'attention (composant V2-4).
