# Market Structures — Structures de marché comme contexte de lecture

**Statut :** squelette — structure posée, contenu à construire par concept validé.

---

## Objectif de ce dossier

Documenter les configurations structurelles du marché non pas comme opportunités,
mais comme contextes de lisibilité. Une structure de marché dit quelque chose sur
la qualité de la lecture possible — pas sur la direction probable.

Ce dossier alimente le moteur de décision et les états du cockpit. Il ne prédit rien.
Il décrit des régimes de marché et leur impact sur la lecture comportementale.

---

## Type de contenu futur

- Définition des structures fondamentales : range, expansion, compression, défense
- Qualité de lisibilité associée à chaque structure
- Marqueurs qui signalent un changement de structure (sans prédire lequel)
- Impact des structures sur l'état comportemental du trader
- Conditions dans lesquelles une structure est lisible vs ambiguë

**Format attendu pour chaque concept :**
- Nom de la structure (terme Caméléon officiel)
- Description : comment elle se manifeste, ce qui la définit
- Lisibilité : haute / moyenne / basse — et pourquoi
- Impact comportemental typique : comment cette structure tend à affecter l'état du trader
- Risque de mauvaise lecture : ce que le trader tend à voir (et qui n'est pas là)
- Ce que ce n'est pas

---

## Exemples de concepts possibles

*Liste indicative — non exhaustive, non validée.*

- **Range stable** — oscillation dans des bornes définies, lisibilité haute, traders
  tendant à sur-trader par ennui ou à attendre une cassure qui ne vient pas
- **Range instable** — oscillation dans des bornes floues, lisibilité réduite, risque de
  fausses cassures élevé, contexte de lectures contradictoires fréquentes
- **Compression** — contraction de la volatilité, réduction du mouvement, lisibilité basse
  sur la direction mais haute sur l'imminence d'un changement d'état
- **Expansion non confirmée** — mouvement fort sans structure claire, contexte de FOMO
  élevé, lisibilité dégradée par la vitesse
- **Zone de liquidité** — concentration de stops et d'ordres limitatifs visible dans la
  structure, contexte de comportement de "chasse" aux liquidités
- **Dégradation de structure** — perte progressive de la cohérence structurelle,
  contexte de décisions incohérentes et de thèses mal invalidées
- **Rejet de niveau** — retournement rapide après un test de zone clé, information sur
  la qualité du niveau, pas signal d'entrée

---

## Règles de non-dérive

- Aucune structure n'implique une direction d'entrée
- Aucun "en range, vendre la résistance" — c'est du conseil déguisé
- Les structures sont des contextes de lisibilité, pas des configurations d'opportunité
- Pas de probabilités associées ("la compression précède une cassure dans X% des cas")
- Pas de référence à des indicateurs techniques (VWAP, EMA, Fibonacci, etc.)
- La structure décrit le marché — pas les participants institutionnels ou leurs intentions

---

## Relation avec le moteur

Le cockpit opère aujourd'hui avec les états marché suivants (issus de `decision.js`) :
- range:stable / range:unstable
- expansion:stable / expansion:unstable
- compression:stable / compression:unstable
- defense:stable / defense:unstable

Ce dossier doit être cohérent avec cette taxonomie et l'enrichir sans la redéfinir.

---

*Contenu à construire progressivement. Ne pas remplir massivement.*
