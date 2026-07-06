# LOT-P1.2 — Conception du composant de diagnostic mémoriel

**Statut : CADRAGE VALIDÉ**

---

| Champ | Valeur |
|---|---|
| Identifiant | LOT-P1.2 |
| Titre | Conception du composant de diagnostic mémoriel |
| LOT parent | LOT-P1 — Diagnostic mémoriel V1 |
| Programme Roadmap V1 | P1 — Fondation Mémoire & Persistance |
| Phase Roadmap V1 | A |
| Type | Observabilité |
| Statut | CADRAGE VALIDÉ |
| Date de cadrage | 2026-07-06 |

---

## 1 — Introduction du composant

Le diagnostic mémoriel lit l'état actuel des données enregistrées sur cet appareil. Il ne modifie aucune donnée, ne produit aucune recommandation et ne déclenche aucune action. Une famille absente ou vide est un état normal.

---

## 2 — Familles mémorielles exposées

Le composant organise les familles de la couche de persistance en cinq familles mémorielles. Les clés éphémères et les marqueurs techniques internes sont exclus du diagnostic.

| Famille mémorielle | Entrées |
|---|---|
| F1 — Mémoire comportementale | Sessions comportementales · Mémoire comportementale · Niveau de garde comportemental · Paramètres d'ordres récents |
| F2 — Mémoire opérateur | Mémoire opérateur · Historique des analyses opérateur |
| F3 — Mémoire décisionnelle | Journal des décisions moteur · Sauvegardes moteur |
| F4 — Données opérateur | Registre des importations · Portefeuille · Paramètres |
| F5 — Système local | Identité locale · État de navigation · Instantané moteur |

**Exclues du diagnostic :** clé d'embarquement initial (chaîne brute, hors domaine mémoriel opérateur) · clé de limitation temporelle d'accès (éphémère) · marqueurs de migration (internes, non opérationnels).

**Note sur F5 :** les trois entrées de F5 font partie de la couche de persistance inventoriée en LOT-P1.1. Toute famille connue apparaît dans le diagnostic conformément au critère 2 de LOT-P1. La hiérarchisation visuelle de F5 est une décision de LOT-P1.4.

---

## 3 — Provenance par famille mémorielle

Chaque famille affiche une étiquette de provenance indiquant l'origine de ses données, sans exposer de terme technique interne.

| Famille mémorielle | Provenance affichée |
|---|---|
| F1 — Mémoire comportementale | Analyse comportementale |
| F2 — Mémoire opérateur | Mémoire opérateur |
| F3 — Mémoire décisionnelle | Moteur décisionnel |
| F4 — Données opérateur | Données opérateur |
| F5 — Système local | Système local |

---

## 4 — États possibles

| État | Condition | Affichage |
|---|---|---|
| Présente | Entrée existante · données non vides | Espace utilisé et date affichés |
| Vide | Entrée existante · données vides ou structure vide | "Aucune donnée enregistrée" |
| Absente | Entrée absente de la couche de persistance | "Non enregistrée" |
| Non datée | Entrée présente · métadonnée de datation indisponible | Présente + "— datation non disponible" |

**Règle I-04 (Silence structurel) :** les états Vide et Absent sont des états normaux. Aucune formulation ne suggère une anomalie, un manque ou une erreur. Une entrée non enregistrée est un état observé, pas un problème signalé.

---

## 5 — Règle d'affichage de la date

| Condition | Affichage |
|---|---|
| Métadonnée de datation présente et au format standard | "Mis à jour le JJ/MM/AAAA" — date seule, sans l'heure |
| Entrée dont la structure ne contient pas de métadonnée de datation standard (R1) | "— datation non disponible" |
| Entrée dont les scalaires sont stockés sans enveloppe standard (R3) | "— datation non disponible" |
| Entrée absente | Aucune date affichée |
| Entrée vide · métadonnée de datation présente | Date de la dernière écriture affichée |
| Entrée vide · métadonnée de datation absente | "— datation non disponible" |

**Règle I-08 (Provenance traçable) :** toute date absente ou non directement lisible est signalée explicitement. Aucune date calculée, estimée ou déduite n'est présentée comme directe.

---

## 6 — Règle d'affichage de l'espace utilisé

| Condition | Affichage de l'entrée |
|---|---|
| Entrée présente | Espace utilisé en Ko avec une décimale — ex. "4,2 Ko" |
| Entrée absente | "—" |
| Entrée vide · enveloppe présente | Espace réel de l'enveloppe — ex. "0,1 Ko" |

**Total de la couche de persistance :**

| Champ affiché | Description |
|---|---|
| Espace total utilisé | Estimation en Ko de l'occupation globale |
| Pourcentage d'occupation | Ratio entre l'espace utilisé et l'espace disponible |
| Niveau d'occupation | Nominal · Élevé · Saturé |

**Niveaux d'occupation :**

| Niveau | Signification |
|---|---|
| Nominal | Occupation dans les proportions habituelles de fonctionnement |
| Élevé | Occupation importante de l'espace disponible |
| Saturé | Espace disponible épuisé |

Ces niveaux sont factuels et descriptifs. Ils ne constituent aucune recommandation d'action.

---

## 7 — Message d'état vide global

Affiché uniquement si toutes les entrées du diagnostic sont absentes ou vides :

> "Aucune donnée opérateur n'est enregistrée sur cet appareil."

Ce message est neutre, factuel et non alarmant. Il ne suggère aucune action. Il décrit l'état observé de la couche de persistance.

Si au moins une entrée est présente, aucun message global n'est affiché. Chaque entrée affiche son propre état.

---

## 8 — Conformité Language System V1

| Terme | Verdict |
|---|---|
| Présente / Vide / Absente / Non datée | Conforme — factuel, non punitif |
| "Non enregistrée" | Conforme — neutre |
| "Datation non disponible" | Conforme — factuel |
| "Mis à jour le JJ/MM/AAAA" | Conforme |
| "Aucune donnée opérateur n'est enregistrée" | Conforme — neutre, non alarmant |
| "Instantané moteur" | Conforme — descriptif, non actionnable, conforme Lecture ≠ Action |
| "Paramètres d'ordres récents" | Conforme — factuel, aucune classification opérateur |
| "Historique des analyses opérateur" | Conforme — neutre, aucune classification implicite |
| Nominal / Élevé / Saturé | Conforme — descriptifs, aucune injonction |
| ~~Décision~~ (qualificatif de sortie moteur) | Interdit — viole Lecture ≠ Action |
| ~~Profil~~ | Interdit — risque I-06 |
| ~~Erreur~~ | Interdit — remplacer par "Non disponible" |
| ~~Alerte~~ | Interdit |
| ~~Signal~~ | Interdit |
| ~~Vigilance / Critique~~ (niveaux d'occupation) | Interdit — prescriptifs, incompatibles Lecture ≠ Action |

---

## 9 — Critères de validation avant LOT-P1.3

LOT-P1.2 est validé et LOT-P1.3 peut être ouvert si et seulement si :

1. Les cinq familles mémorielles (F1→F5) et leur contenu sont approuvés par l'opérateur.
2. Les libellés de toutes les entrées sont approuvés.
3. Les quatre états (présente / vide / absente / non datée) couvrent l'intégralité des cas inventoriés en LOT-P1.1 sans en ajouter de nouveaux.
4. Les règles d'affichage de la date intègrent explicitement R1 et R3 comme "datation non disponible" sans tentative de déduire une date alternative.
5. Le message d'état vide global est jugé neutre et conforme I-04 par l'opérateur.
6. La vérification Language System V1 ne produit aucun terme interdit.
7. Aucun élément de ce cadrage ne décrit ou ne présuppose une implémentation technique.

Ces critères sont vérifiables sans code. La validation est une décision de l'opérateur sur le cadrage, pas un test technique.

---

*Conception du composant de diagnostic mémoriel — LOT-P1.2 · Programme P1 · Phase A · Caméléon Engine · 2026-07-06.*
