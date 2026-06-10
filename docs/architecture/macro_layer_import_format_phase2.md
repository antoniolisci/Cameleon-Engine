# Couche Macro — Format d'Import Phase 2

**Caméléon Engine · Direction Architecture**
**Date : 2026-06-10**
**Statut : Document décisionnel Phase 2 — format d'import uniquement**
**Prérequis : Phase 0 + Phase 1 validées**

---

## 1. Mission

Figer le format exact par lequel l'opérateur fournit ses données macro au système.

Pas d'implémentation. Pas d'UI. Pas de code.

Une seule question : quelle structure de données permet au système de produire un Macro_State fiable depuis une saisie humaine ?

---

## 2. Options de format

Cinq options ont été évaluées.

---

**Option A — Saisie manuelle directe dans l'UI**

L'opérateur remplit des champs dans le cockpit, comme il le fait déjà dans le Pilotage.

Avantages : aucun fichier à créer, aucun format à apprendre, cohérence UX totale avec l'existant, horodatage automatique par le système, zéro risque de format incorrect.

Inconvénients : données non exportables, pas d'historique natif de la saisie, reconstruction impossible si la session est perdue.

---

**Option B — CSV minimal**

Un fichier texte avec des colonnes simples, une ligne par famille.

Avantages : familier pour les traders (Binance exporte en CSV), éditable dans Excel, lisible sans outil.

Inconvénients : parsing fragile sur les séparateurs et encodages, risque d'erreur sur les virgules décimales selon locale, moins intuitif qu'un formulaire pour une saisie ponctuelle.

---

**Option C — JSON structuré**

Un fichier structuré avec des clés nommées.

Avantages : précis, non ambigu, standard technique universel.

Inconvénients : intimidant pour un trader non développeur, erreurs de syntaxe fréquentes à la saisie manuelle, nécessite un éditeur ou un générateur.

---

**Option D — Collage texte guidé**

L'opérateur copie-colle un bloc de texte structuré depuis un template fourni.

Avantages : guidé, lisible, pas de format imposé.

Inconvénients : parsing textuel fragile, erreurs de copie, entretien du template nécessaire.

---

**Option E — Format hybride : saisie UI + export JSON**

Saisie dans l'UI (Option A) avec possibilité d'exporter les données saisies en fichier daté et de les réimporter.

Avantages : simplicité en entrée + portabilité en sortie, cohérence avec le modèle d'import existant (CSV comportemental, PDF), historique externe possible.

Inconvénients : plus complexe à concevoir que l'Option A seule, l'export est une fonctionnalité supplémentaire.

---

**Matrice de décision**

| Critère | A | B | C | D | E |
|---|---|---|---|---|---|
| Simplicité utilisateur | ✅ | ⚠ | ❌ | ⚠ | ✅ |
| Robustesse | ✅ | ⚠ | ✅ | ❌ | ✅ |
| Lisibilité humaine | ✅ | ✅ | ⚠ | ✅ | ✅ |
| Local-first | ✅ | ✅ | ✅ | ✅ | ✅ |
| Faible maintenance | ✅ | ⚠ | ✅ | ❌ | ⚠ |
| Risque d'erreur | Faible | Moyen | Élevé | Élevé | Faible |

---

## 3. Format retenu V1

**Option A — Saisie manuelle directe dans l'UI.**

Raison principale : l'opérateur saisit déjà des données contextuelles dans le Pilotage. La Couche Macro est une extension naturelle de ce geste. Aucun fichier, aucun format, aucune friction technique.

L'horodatage est géré automatiquement par le système au moment de la saisie. L'opérateur ne date pas ses données — il les entre, et le système enregistre quand.

**Option E (hybride) est réservée à V2** — export/réimport une fois que le format interne est stabilisé et que le besoin terrain est confirmé.

---

## 4. Champs obligatoires V1

Trois familles, sept champs au total. Chaque champ est une valeur unique, simple, déclarative.

---

**Famille A — Direction du capital**

| Champ | Type | Description | Exemple |
|---|---|---|---|
| `btc_dominance` | Nombre décimal | Part de Bitcoin dans la capitalisation totale crypto, en % | 56.3 |

Un seul champ. La direction du capital est capturée par un seul indicateur de référence. L'opérateur lit cette valeur sur son agrégateur habituel.

---

**Famille B — Pression du levier**

| Champ | Type | Description | Exemple |
|---|---|---|---|
| `funding_rate` | Nombre décimal | Taux de financement BTC perpétuel en cours, en % | 0.012 |
| `funding_direction` | Catégoriel | Tendance récente : hausse / stable / baisse | hausse |

Deux champs. La valeur numérique seule est insuffisante sans le contexte directionnel. Un funding à 0.010 qui monte depuis 3 jours n'a pas le même sens qu'un funding à 0.010 qui redescend.

---

**Famille C — Coût cognitif du marché**

| Champ | Type | Description | Exemple |
|---|---|---|---|
| `volatility_level` | Catégoriel | Évaluation subjective de l'amplitude récente : faible / modérée / élevée / extrême | élevée |
| `volatility_context` | Catégoriel (optionnel) | Nature de la volatilité : directionnelle / chaotique | directionnelle |

Deux champs, dont un optionnel. La volatilité est partiellement calculable en interne, mais l'opérateur est le mieux placé pour qualifier l'amplitude qu'il ressent. L'appréciation subjective a de la valeur ici.

---

**Champ transversal — Fraîcheur**

| Champ | Type | Description |
|---|---|---|
| `data_date` | Date | Date à laquelle les valeurs ont été observées (pas la date d'import) |

Un seul champ de date pour l'ensemble des familles. La distinction entre "date d'observation" et "date d'import" est critique : une donnée observée hier mais importée aujourd'hui est une donnée d'hier.

---

**Récapitulatif**

| Champ | Famille | Obligatoire |
|---|---|---|
| `btc_dominance` | A | Oui |
| `funding_rate` | B | Oui |
| `funding_direction` | B | Oui |
| `volatility_level` | C | Oui |
| `volatility_context` | C | Non |
| `data_date` | Transversal | Oui |

**6 champs dont 5 obligatoires.** Un trader peut remplir ce formulaire en moins de deux minutes.

---

## 5. Horodatage

**Deux timestamps distincts coexistent dans le système :**

`data_date` — la date à laquelle l'opérateur a observé les valeurs (saisie par l'opérateur).
`import_timestamp` — la date et heure à laquelle le système a enregistré la saisie (générée automatiquement).

**Pourquoi cette séparation est nécessaire :**
Un opérateur peut noter ses valeurs macro le matin et les entrer dans le système le soir. Ce qui compte pour la fraîcheur, c'est quand il a observé les données, pas quand il les a tapées.

**Règles :**

- `data_date` accepte une date uniquement (pas d'heure) — la granularité journalière est suffisante pour des données de régime.
- `data_date` ne peut pas être dans le futur. Toute date future est rejetée.
- `data_date` peut être le jour même ou les jours précédents.
- Le fuseau horaire n'est pas géré en V1 — date locale de l'opérateur, sans conversion. La granularité journalière absorbe les décalages horaires.
- `import_timestamp` est généré par le système. L'opérateur ne le voit pas en surface — il est enregistré pour le logging.

---

## 6. Fraîcheur des données

La fraîcheur est évaluée au moment de l'affichage, pas au moment de l'import.

Le système compare la date du jour avec `data_date` et applique les règles par famille.

---

**Famille A — Direction du capital**

| Ancienneté | Statut | Comportement |
|---|---|---|
| 0–3 jours | Fraîche | Utilisée normalement |
| 4–7 jours | Tolérable | Utilisée avec mention "données de J-N" |
| 8–14 jours | Dégradée | Contribution réduite · mention visible |
| > 14 jours | Invalide | Famille ignorée · Neutre pour cette dimension |

---

**Famille B — Pression du levier**

| Ancienneté | Statut | Comportement |
|---|---|---|
| 0–1 jour | Fraîche | Utilisée normalement |
| 2 jours | Tolérable | Utilisée avec avertissement |
| 3 jours | Dégradée | Mention "données dégradées" · contribution réduite |
| > 3 jours | Invalide | Famille ignorée · Neutre pour cette dimension |

La Famille B a la fenêtre de fraîcheur la plus courte. C'est la dimension la plus volatile.

---

**Famille C — Coût cognitif**

| Ancienneté | Statut | Comportement |
|---|---|---|
| 0–7 jours | Fraîche | Utilisée normalement |
| 8–14 jours | Tolérable | Utilisée avec mention |
| > 14 jours | Dégradée | Famille ignorée · Neutre pour cette dimension |

---

**Règle générale de dégradation**

Si une famille est invalide ou dégradée, elle ne contribue pas à l'état final.
Si toutes les familles valides convergent → état calculé normalement.
Si les familles valides se contredisent → état Neutre.
Si aucune famille n'est valide → Macro_State absent. Le moteur fonctionne sans Macro.

**Le produit ne bloque jamais sur une donnée manquante.**

---

## 7. Validation de l'import

**Ce qui est accepté sans restriction**

- Toutes les valeurs dans les plages attendues
- `data_date` valide, dans le passé ou le jour même
- `volatility_context` absent (champ optionnel)

**Ce qui est accepté en mode dégradé**

- `data_date` trop ancienne selon les seuils → famille concernée ignorée, saisie conservée dans le log
- `funding_direction` absent → Famille B utilisée avec `funding_rate` seul, mention "partiel"
- Saisie partielle (une ou deux familles renseignées) → état calculé sur les familles disponibles, mention "contexte partiel"

**Ce qui est rejeté**

- `data_date` dans le futur → rejet avec message explicite
- `btc_dominance` hors plage 0–100 → rejet
- `funding_rate` hors plage vraisemblable → avertissement (pas rejet — les marchés extrêmes produisent des valeurs extrêmes)
- Saisie vide intégrale → aucun Macro_State · moteur inchangé

**Doublons**

Si l'opérateur importe une nouvelle saisie alors qu'une saisie récente existe, le système affiche les deux dates et demande confirmation. La saisie la plus récente prend priorité. L'ancienne est conservée dans le log.

---

## 8. Exemple conceptuel

Ce n'est pas un fichier. Ce n'est pas du code. C'est la représentation lisible de ce que le système reçoit.

```
--- Contexte Macro · saisie du 10/06/2026 ---

FAMILLE A — Direction du capital
  BTC Dominance : 56.3 %

FAMILLE B — Pression du levier
  Funding Rate BTC : 0.012 %
  Tendance Funding : hausse

FAMILLE C — Coût cognitif
  Niveau de volatilité : élevée
  Nature (optionnel) : directionnelle

Date d'observation : 10/06/2026
```

Six lignes de données. Un trader peut lire et valider ça en dix secondes.

---

## 9. Expérience utilisateur

**Ce que l'opérateur doit comprendre**

Il ne configure pas un système. Il communique ce qu'il observe.

Chaque champ correspond à une lecture qu'il fait déjà sur ses outils habituels. Le formulaire ne lui demande pas d'analyser — il lui demande de transmettre.

**Formulation des étiquettes (principes)**

Les labels des champs doivent être en langage trader, pas en langage technique.

| À éviter | À préférer |
|---|---|
| "btc_dominance" | "Part de Bitcoin dans le marché crypto (%)" |
| "funding_rate" | "Taux de financement BTC en cours (%)" |
| "volatility_level" | "Ambiance du marché en ce moment" |

**Guidage de source**

Chaque champ doit indiquer où trouver la valeur, sans imposer de source.
Exemple : "Lisible sur CoinMarketCap, TradingView ou votre agrégateur habituel."

Ce guidage est éditorial, pas technique. Il ne crée pas de dépendance à une source spécifique.

**Résistance à la surconfiance**

Le formulaire ne doit pas ressembler à un tableau de bord Bloomberg. Il doit rester discret, secondaire, complémentaire.

Formulation à éviter : "Mettez à jour votre contexte macro pour optimiser vos décisions."
Formulation à préférer : "Ces données permettent à Caméléon de contextualiser votre session."

---

## 10. Risques

**R1 — Valeurs inventées**
L'opérateur peut entrer des valeurs approximatives ou inventées pour "avoir un contexte". Un Macro_State basé sur des données fictives est une fausse précision.
Mitigation : le formulaire rappelle que les données influencent uniquement le contexte narratif — aucun avantage à inventer des valeurs cohérentes.

**R2 — Import trop ancien non remarqué**
L'opérateur entre ses données une fois et oublie de les mettre à jour. Le Macro_State devient progressivement mensonger sans signal visible.
Mitigation : le signal de fraîcheur est permanent et visible. L'état dégradé s'affiche automatiquement au-delà des seuils.

**R3 — Surconfiance dans l'état calculé**
"Caméléon dit Expansif — j'ai raison d'entrer." L'état macro est lu comme une validation de la décision.
Mitigation : séparation visuelle obligatoire + anti-prescription dans tous les textes de Niveau 2.

**R4 — Complexité perçue**
Six champs peuvent sembler beaucoup pour un formulaire "contextuel". Si l'opérateur perçoit le formulaire comme une contrainte, il ne l'utilise pas.
Mitigation : champs facultatifs clairement identifiés. Saisie partielle toujours acceptée. La complétion est une invitation, jamais une obligation.

**R5 — Dérive vers dashboard macro**
Une fois le formulaire en place, la tentation est d'ajouter des champs ("et si on ajoutait le DXY ?"). Chaque ajout dégrade l'expérience utilisateur et la maintenance.
Mitigation : tout champ supplémentaire passe le filtre des 5 principes directeurs Phase 1. Aucune exception sans décision documentée.

---

## 11. V1 / V2 / Rejeté

**V1**

- Saisie manuelle directe dans l'UI
- 5 champs obligatoires + 1 optionnel
- `data_date` saisi par l'opérateur, `import_timestamp` automatique
- Règles de fraîcheur par famille avec dégradation explicite
- Validation légère (plages, dates futures, saisie vide)
- Guidage de source éditorial par champ
- Logging complet de chaque saisie avec Macro_State résultant

**V2**

- Export de la saisie en fichier daté (JSON ou CSV) pour portabilité
- Réimport depuis fichier pour continuité entre sessions
- Historique des saisies passées accessible à l'opérateur
- Ajout éventuel de la Famille D (DXY / contexte TradFi)

**Rejeté**

- Fichier d'import en V1 — complexité non justifiée pour 6 champs
- JSON saisi manuellement par l'opérateur — risque d'erreur de syntaxe
- Champs libres texte non structurés — parsing fragile
- Horodatage à la minute — granularité inutile pour des données de régime
- Import automatisé depuis source externe — viole local-first en V1

---

## 12. Verdict Phase 2

**Format retenu**
Saisie manuelle guidée dans l'UI — 6 champs (5 obligatoires, 1 optionnel). Aucun fichier en V1.

**Champs obligatoires**
`btc_dominance` · `funding_rate` · `funding_direction` · `volatility_level` · `data_date`

**Règle de fraîcheur**
Famille A : 7 jours max utilisable · Famille B : 3 jours max utilisable · Famille C : 14 jours max utilisable. Au-delà : famille ignorée, Neutre pour cette dimension, moteur inchangé.

**Condition bloquante avant implémentation**
Valider les labels exacts de chaque champ avec un trader réel avant de construire l'UI. Un label incompréhensible rend le formulaire inutilisé, et un formulaire inutilisé rend le logging vide.

---

## Résumé exécutif

**Format retenu :** saisie manuelle guidée dans l'UI · 6 champs · aucun fichier en V1.

**Champs :** BTC Dominance % · Funding Rate % · Tendance Funding · Niveau de volatilité · Nature volatilité (optionnel) · Date d'observation.

**Fraîcheur :** Famille B périme en 3 jours · Famille A en 7 jours · Famille C en 14 jours · dégradation automatique vers Neutre par famille.

**Risques principaux :** valeurs inventées (fausse précision) · import oublié (état mensonger) · surconfiance dans l'état calculé · dérive dashboard.

**Condition bloquante :** valider les labels des champs avec un trader réel avant toute implémentation UI.

**Hors V1 :** export/réimport fichier · historique consultable · Famille D · import automatisé.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
