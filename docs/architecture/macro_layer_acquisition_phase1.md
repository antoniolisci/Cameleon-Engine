# Couche Macro — Architecture d'Acquisition Phase 1

**Caméléon Engine · Direction Architecture**
**Date : 2026-06-10**
**Statut : Document décisionnel Phase 1 — architecture d'acquisition uniquement**
**Prérequis : `docs/architecture/macro_layer_phase0.md` validé**

---

## 1. Mission

Définir comment la Couche Macro obtient ses informations.

Pas de code. Pas d'API. Pas d'implémentation.

Une seule question : quelle stratégie d'acquisition est compatible avec Caméléon Engine ?

---

## 2. Principes directeurs

Ces principes filtrent chaque décision d'acquisition. Tout ce qui les viole est rejeté.

**Local-first** — Aucune dépendance en temps réel permanente. Le moteur fonctionne sans connexion internet active.

**Dégradation explicite** — Si les données sont absentes ou périmées, le système l'indique clairement. Il ne ment pas. Il ne bloque pas.

**Maintenance minimale** — Chaque source ajoutée est une dette de maintenance. Une source instable coûte plus qu'elle n'apporte.

**Frontière narrative** — La Macro n'entre pas dans le calcul. Elle entre dans le registre contextuel. Ce principe contraint aussi l'acquisition : pas besoin de données temps réel si elles n'influencent que la description.

**Sobriété** — Caméléon n'est pas un terminal Bloomberg. Trois dimensions bien choisies valent mieux que dix dimensions bruitées.

---

## 3. Familles d'information

Trois familles orthogonales couvrent l'essentiel du contexte systémique. Chaque famille répond à une question distincte.

---

**Famille A — Direction du capital**

Question : *Où va le capital dans l'écosystème ?*

Se concentre-t-il sur les actifs de réserve ou se distribue-t-il vers les altcoins ? Cette direction indique si le marché est en mode Risk-On (distribution des risques) ou Risk-Off (concentration défensive).

Fréquence nécessaire : lente. Le régime de direction change sur des jours à semaines, pas sur des heures.

---

**Famille B — Pression du levier**

Question : *À quel niveau le marché est-il endetté ?*

Le levier systémique détermine la fragilité structurelle. Un marché fortement levé réagit de façon non linéaire aux mouvements de prix. C'est la dimension la plus opérationnellement pertinente pour l'opérateur.

Fréquence nécessaire : rapide. Le levier peut s'effondrer en quelques heures lors d'une cascade de liquidations.

⚠ Conflit fondamental : cette famille requiert une fraîcheur que le modèle d'import manuel ne peut pas garantir.

---

**Famille C — Coût cognitif du marché**

Question : *Quelle est l'amplitude des mouvements que l'opérateur doit absorber ?*

La volatilité réalisée est la seule famille directement calculable depuis les données de l'opérateur. Elle capture le coût cognitif réel : un marché volatile impose une charge mentale indépendante de l'analyse technique.

Fréquence nécessaire : lente. Une rolling window sur 14-30 jours lisse le bruit quotidien.

Avantage structurel : pleinement local-first. Zéro dépendance externe.

---

**Famille D — Contexte macro-économique traditionnel**

Question : *Quel est le régime du dollar et des marchés traditionnels ?*

Le DXY et les marchés actions influencent le crypto de façon systémique en période de corrélation élevée. En période de décorrélation, cette famille apporte peu.

Fréquence nécessaire : lente (semaines).

Statut : secondaire. À ne pas inclure si le coût d'acquisition est disproportionné par rapport à la valeur apportée.

---

**Familles exclues du périmètre**

- Flux ETF : source instable, scraping uniquement, maintenance très élevée. Exclu définitivement.
- Sentiment de marché (peur/greed index) : agrégation opaque d'indicateurs déjà couverts. Redondant.
- Narratifs dominants : requiert curation manuelle ou NLP. Hors périmètre V1.

---

## 4. Cartographie des sources

Inventaire des options. Aucun choix n'est fait ici.

| Famille | Option | Gratuité | Stabilité | Local-first | Fraîcheur max |
|---|---|---|---|---|---|
| Direction capital | Agrégateur public (API) | Oui | Bonne | Compatible via import | 3–7 jours |
| Direction capital | Export CSV manuel | Oui | Absolue | Oui | Dépend de l'opérateur |
| Pression levier | Exchange public (API) | Oui | Très bonne | Compatible via import | 12–24h |
| Pression levier | Export CSV exchange | Oui | Absolue | Oui | Dépend de l'opérateur |
| Coût cognitif | Calcul interne sur prix OHLCV | Oui | Absolue | Pleinement | 5–7 jours |
| Coût cognitif | Source tierce | Oui | Variable | Partielle | Variable |
| Contexte TradFi | Source financière publique | Oui | Incertaine | Partielle | 1–2 semaines |

**Observation clé :** la Famille C (coût cognitif) est la seule pleinement locale. Les Familles A et B ont toujours une dépendance externe à gérer.

---

## 5. Stratégie d'acquisition V1

### Modèle retenu : import ponctuel guidé

L'opérateur importe un fichier daté contenant les valeurs des trois familles. Le système lit ce fichier, calcule l'état macro, et affiche la fraîcheur.

Ce modèle est cohérent avec l'architecture d'import existante (CSV comportemental, PDF). Il ne crée pas de nouvelle infrastructure.

---

**Ce qui est acquis par import**

Familles A et B — déclarées par l'opérateur via fichier importé ou saisie directe guidée.

L'opérateur consulte ses sources habituelles (exchange, agrégateur), extrait les valeurs pertinentes, et les renseigne. Le système ne se connecte à rien.

Format cible : le plus simple possible. Trois valeurs numériques + date de capture. Rien d'autre.

---

**Ce qui est calculé localement**

Famille C — la volatilité réalisée est calculée en interne depuis les données de prix que l'opérateur possède déjà (historique trades, OHLCV importé). Zéro dépendance externe.

---

**Ce qui est ignoré en V1**

- Famille D (contexte TradFi) — coût/valeur déséquilibré pour un outil crypto-first
- Toute source nécessitant une connexion permanente
- Tout indicateur non dérivable depuis les trois familles

---

## 6. Fréquence de mise à jour

### Pourquoi la fréquence est une décision produit, pas une décision technique

Caméléon Engine décrit un régime — pas un tick. Un régime macro change sur des jours à semaines, pas sur des minutes.

| Famille | Fréquence recommandée | Justification |
|---|---|---|
| Direction capital | Hebdomadaire | Rotation lente · un jour marginal n'inverse pas le régime |
| Pression levier | 24–48h max | Peut s'effondrer rapidement · signal opérationnel fort |
| Coût cognitif | Hebdomadaire | Rolling 30j · mise à jour quotidienne = bruit |

### Conflit non résolu

La Famille B (pression levier) requiert une fraîcheur de 24–48h. Un import manuel hebdomadaire produit un Macro_State mensonger sur cette dimension précisément.

**Trois options pour résoudre ce conflit :**

A. Séparer la fréquence par famille — l'opérateur met à jour uniquement la Famille B plus fréquemment.

B. Signaler la dégradation — au-delà de 48h, le système affiche "Levier : données dégradées" plutôt qu'une valeur obsolète. L'état Neutre est forcé pour cette dimension.

C. Exclure la Famille B de V1 — accepter un Macro_State moins précis mais toujours honnête.

**Recommandation : Option B.** La dégradation explicite est préférable à la fausse précision. L'état ne ment pas.

---

## 7. Gestion des pannes

**Principe fondateur : la Macro ne bloque jamais le produit.**

Le moteur fonctionne exactement comme avant l'activation de la Couche Macro. Si les données macro sont absentes, le cockpit est identique à son état sans Macro.

---

**Scénarios de dégradation**

| Situation | Comportement attendu |
|---|---|
| Aucune donnée importée | Macro_State = absent · aucun affichage macro · moteur inchangé |
| Données trop anciennes (> seuil) | Macro_State = "Neutre — données dégradées" · horodatage visible |
| Une famille manquante | État calculé sur familles disponibles · mention "partiel" |
| Toutes les familles manquantes | Retour silencieux à l'état sans Macro |

---

**Seuils de fraîcheur à définir avant implémentation**

Les valeurs exactes (ex: 48h pour le levier, 7 jours pour la direction) sont provisoires. Elles doivent être validées par calibration terrain avant d'être figées.

---

## 8. Risques

**R1 — Fausse précision**
Un Macro_State calculé depuis des données insuffisantes ou périmées est plus dangereux qu'une absence d'état. L'opérateur qui croit avoir un contexte fiable prend des décisions fondées sur du vent.
Mitigation : dégradation explicite obligatoire. Neutre honnête > état mensonger.

**R2 — Dérive dashboard**
La Couche Macro commence comme "trois valeurs et un état". Elle risque de devenir un dashboard complet en trois itérations si le périmètre n'est pas défendu activement.
Mitigation : toute nouvelle source passe le filtre des 5 principes directeurs. Aucune exception.

**R3 — Dépendance à l'opérateur pour la fraîcheur**
Le modèle d'import ponctuel dépend de la discipline de l'opérateur. Un opérateur qui n'importe pas pendant deux semaines a un Macro_State dégradé.
Mitigation : signal visuel de fraîcheur permanent. L'état dégradé est visible sans que l'opérateur ait à chercher.

**R4 — Confusion avec le score**
Si le Macro_State et le score sont visuellement proches, l'opérateur infère une causalité fausse.
Mitigation : séparation visuelle documentée avant implémentation (condition bloquante Phase 0).

**R5 — Maintenance des textes**
Les lectures populationnelles ("Dans ce contexte, les opérateurs ont tendance à...") deviennent inexactes si le corpus textuel est statique et que le marché change de régime.
Mitigation : corpus textuel conçu pour être régime-agnostique dans un premier temps. Révision éditoriale comme chantier distinct.

---

## 9. Recommandation finale

### A — Ce qui entre en V1

- **Famille A** (direction du capital) — import manuel guidé, fréquence hebdomadaire
- **Famille B** (pression du levier) — import manuel guidé, fréquence 24–48h avec dégradation explicite au-delà
- **Famille C** (coût cognitif) — calcul interne depuis données OHLCV existantes
- Modèle d'import : fichier simple daté, trois valeurs, aucune infrastructure nouvelle
- Dégradation explicite : horodatage visible + état "Neutre — données dégradées" automatique
- Logging session × Macro_State actif dès le premier commit

### B — Ce qui attend V2

- Famille D (contexte TradFi / DXY) — valeur conditionnelle à la phase de corrélation crypto/TradFi
- Import automatisé de la Famille B (résoudre conflit fraîcheur/local-first proprement)
- Corpus textuel des lectures populationnelles V2 enrichi par données terrain

### C — Ce qui est explicitement rejeté

- Flux ETF — maintenance très élevée, source instable
- API permanente en temps réel — viole local-first
- Indicateurs single-source sans confirmation — fausse précision
- Sentiment index tiers — agrégation opaque, redondant
- Narratifs de marché — hors périmètre local-first

---

## 10. Verdict Phase 1

La stratégie d'acquisition V1 est l'import ponctuel guidé.

Trois familles. Un fichier daté. Un état discret. Une dégradation explicite.

La Couche Macro n'introduit aucune infrastructure nouvelle. Elle réutilise le modèle d'import existant. Elle ne se connecte à rien.

Sa valeur n'est pas dans la sophistication de l'acquisition. Elle est dans le logging systématique de chaque session avec son contexte macro associé — ce qui, sur durée, produit l'intelligence que rien d'autre ne peut produire.

**Condition bloquante avant implémentation :** documenter le format exact du fichier d'import (structure, champs, seuils de fraîcheur par famille). Ce choix conditionne tout le reste et peut être fait sans coder.

---

## Résumé exécutif

**Décision la plus importante**
L'acquisition repose sur l'import ponctuel guidé — pas d'API permanente, pas de connexion temps réel. L'opérateur importe un fichier daté. Le système calcule un état. C'est tout.

**Risques principaux**
Fausse précision si les données sont dégradées et non signalées. Dérive dashboard si le périmètre n'est pas défendu. Confusion score/macro si la séparation visuelle n'est pas résolue avant implémentation.

**Ce qui entre en V1**
Trois familles (direction capital + pression levier + coût cognitif). Import manuel guidé. Dégradation explicite. Logging session × Macro_State obligatoire dès le premier commit.

**Ce qui reste hors V1**
Contexte TradFi. Import automatisé. Narratifs. Flux ETF. API permanente. Sentiment index.

**Recommandation finale**
Ouvrir le chantier uniquement après mise en ligne effective et validation du format d'import. Le logging est la priorité absolue — chaque session sans contexte macro est une session perdue définitivement.

---

*Caméléon Engine — Architecture Produit · 2026-06-10*
