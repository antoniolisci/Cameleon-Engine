# Binance Audits — Synthèse architecturale V1

**Statut :** Synthèse documentaire · Aucune implémentation
**Date :** 2026-05-31
**Nature :** Lecture transversale des trois audits comportementaux Binance produits en session

**Documents de référence :**
- `docs/architecture/calibration-personnelle-binance-v1.md` — `5a8b38f`
- `docs/architecture/wallet-history-behavioral-audit-v1.md` — `645d5b7`
- `docs/architecture/order-history-behavioral-audit-v1.md` — `5a3c764`
- `docs/architecture/binance-multi-source-memory.md` — architecture BMSM

**Ce document ne contient pas :**
- De nouvelles métriques
- De nouvelles décisions d'implémentation
- De modification des chantiers existants

---

## 1. Ce que chaque audit a produit

Trade History existait avant ces trois audits. Il mesure ce qui s'est exécuté. Il est la réalité de l'activité. Les trois audits ont cartographié ce que Trade History ne peut pas produire, quelle que soit la quantité de données trade disponibles.

| Audit | Couche analytique | Question résolue | Verdict |
|---|---|---|---|
| Calibration Personnelle V1 | Baseline opérateur | Comment adapter l'interprétation à l'opérateur réel plutôt qu'à un trader théorique ? | Valeur interprétative — miroir comportemental personnel |
| Wallet History V1 | Capital patrimonial | Dans quel rapport au capital l'opérateur trade-t-il ? | Valeur réelle — orthogonale au trading sur 100% |
| Order History V1 | Intention décisionnelle | Quel est son rapport à l'attente, à la patience, au changement d'avis ? | Valeur réelle — orthogonale à Trade History sur 80% |

### Ce que chaque couche révèle que Trade History ne peut pas révéler

**Wallet History** dit : est-il en construction, en extraction, en mise en réserve ? A-t-il une frontière earn stable, ou son capital de réserve est-il poreux ? La régularité de ses injections révèle-t-elle une discipline ou une réactivité ?

**Order History** dit : qu'a-t-il voulu faire et n'a pas fait ? À quelle vitesse change-t-il d'avis une fois l'ordre placé ? Chasse-t-il le prix après avoir manqué son niveau ? Préfère-t-il son prix à la certitude d'exécution, ou l'inverse ?

**Calibration Personnelle** dit : ce qui semble anormal l'est-il vraiment pour lui ? 10 trades par heure sur TAOUSDC est-ce de l'overtrading, ou sa baseline normale en range ? Un taux d'annulation de 30% sur ses LIMIT est-ce de l'instabilité, ou son style de placement documenté ?

Ces trois réponses sont structurellement absentes de Trade History. Elles ne peuvent pas en être déduites, même avec des algorithmes plus sophistiqués appliqués aux mêmes données.

---

## 2. L'architecture à quatre dimensions

Les trois couches ajoutées, combinées à Trade History, forment une architecture de lecture à quatre dimensions de l'opérateur.

```
Trade History        ████████████████████  exécution     — ce qui s'est passé
Order History        ████████████████░░░░  intention     — ce qui était voulu
Wallet History       ████████████████████  capital       — dans quel contexte
Calibration          ████████████████████  baseline      — relatif à qui
```

Ces quatre dimensions sont **partiellement orthogonales**. Le seul recoupement structurel est l'intersection Order History × Trade History : les ordres FILLED dans Order History ont leur contrepartie exacte dans Trade History. En dehors de cette intersection, les dimensions couvrent des territoires comportementaux distincts.

### Ce que l'architecture quatre dimensions permet de lire

Un même profil comportemental (ex. score 42, Réactif) se lit différemment selon le contexte des trois couches :

| Contexte Wallet History | Contexte Order History | Lecture enrichie |
|---|---|---|
| Capital en accumulation (M02 > 1) · earn stable | Taux annulation faible · délai long | Opérateur discipliné en phase de construction — score 42 cohérent avec son profil global |
| Capital en extraction (M02 < 1) · earn poreux | Cancel-reorder fréquent · micro-annulations | Opérateur sous pression — score 42 peut sous-estimer la tension réelle |
| Rechargements compulsifs récents | Taux annulation en hausse sur période courte | Rupture de comportement probable — à surveiller sans conclure |

La valeur n'est pas dans chaque dimension seule. Elle est dans la lecture croisée.

### Ce que l'architecture quatre dimensions ne fait pas

Elle ne modifie aucun score. Elle ne prend aucune décision. Elle ne prédit rien. Elle produit un **contexte de lecture** — pas une couche de décision.

C'est la distinction architecturale fondamentale de ces audits.

---

## 3. Ce que ces audits changent pour BMSM

BMSM était documenté comme "quatre sources à intégrer". Ces audits définissent **pourquoi** chaque source mérite d'être intégrée et **quels signaux** en extraire en priorité.

### Avant ces audits

BMSM listait les sources et décrivait les signaux bruts possibles (`capital_flow_context`, `reserve_ratio`, `intention_gap`). La valeur de chaque signal était affirmée, pas démontrée.

### Après ces audits

Chaque signal BMSM est maintenant ancré dans une cartographie de métriques classifiées, avec des niveaux de confiance, des faux positifs documentés, et des conditions de validité précises.

| Signal BMSM | Métriques qui le fondent | Niveau de confiance établi |
|---|---|---|
| `intention_gap` (Order × Trade) | M01 taux annulation · M02 délai annulation · M05 cancel-reorder | Fort sur M01/M02 · Moyen sur M05 |
| `capital_flow_context` (Transaction × Trade) | M01 régularité dépôts · M02 ratio dépôts/retraits · M05 retrait cluster | Fort sur M02 · Moyen sur M01 · Faible seul sur M05 |
| `reserve_ratio` (Earn × Trade) | M03 durée earn · M04 rotation earn | Fort sur M03 flexible earn · Moyen sur M04 |
| Baseline personnelle (Calibration) | 5 métriques forte confiance H1–H5 | Fort sur H1/H3/H4 · Moyen sur H2/H5 |

BMSM n'est plus une liste de sources — c'est une architecture de lecture dont les métiers sont maintenant définis.

### Priorité des signaux à implémenter en premier (quand le terrain sera réuni)

1. `intention_gap` — fondé sur les métriques les plus robustes (M01/M02), parseur Order History déjà existant
2. Baseline personnelle H1–H4 — fondée sur Trade History existant, pas de nouvelle source requise
3. `capital_flow_context` — requiert Transaction History (BMSM P1)
4. `reserve_ratio` — requiert Earn History (BMSM P2)

---

## 4. Règles de garde communes aux trois audits

### Règle 1 — Pas de chantier autonome

Aucun des trois audits ne justifie un chantier indépendant. Les trois s'intègrent dans deux chantiers déjà documentés et non démarrés :

| Chantier cible | Ce qu'il absorbe |
|---|---|
| Calibration Personnelle Binance V1 | Baseline opérateur · seuils personnels annulation (M01/M02) · profil de respiration · baseline earn (M03) |
| BMSM P1/P2 | `intention_gap` Order × Trade · `capital_flow_context` Transaction × Trade · `reserve_ratio` Earn × Trade |

Créer un chantier "Order History" ou un chantier "Wallet History" séparés serait une fragmentation non justifiée. L'architecture existante les absorbe.

### Règle 2 — La valeur est conditionnelle au terrain

Ces trois audits produisent de l'architecture en attente. La valeur ne s'active pas sur un seul export. Elle nécessite :

| Condition | Seuil minimal | Seuil robuste |
|---|---|---|
| Imports Trade History | ≥ 3 périodes distinctes | ≥ 5 périodes, 2+ régimes |
| Imports Order History | ≥ 50 ordres par actif analysé | ≥ 200 ordres, 3+ actifs |
| Imports Wallet History | ≥ 6 mois de Transaction History | ≥ 12 mois, 2+ régimes |
| Earn History | ≥ 3 cycles earn complets observables | ≥ 6 mois, flexible earn uniquement |

Tant que ces seuils ne sont pas atteints, les métriques produites sont "indicatives" — non "de référence".

### Règle 3 — Interprétation relative, jamais absolue

La valeur centrale de la Calibration Personnelle s'applique aux trois audits : aucune métrique ne s'interprète sur une valeur absolue. Tout s'interprète comme déviation par rapport à la baseline personnelle de l'opérateur. Un taux d'annulation de 35% n'est ni bon ni mauvais — il l'est seulement par rapport à ce que cet opérateur fait habituellement.

---

## 5. Ce que ces audits ont établi — et ce qu'ils n'ont pas établi

### Ce qui est établi

**1. La valeur comportementale de chaque source est réelle.**
Les trois audits démontrent que chaque source révèle une dimension structurellement absente des autres. Ce n'est pas une affirmation — c'est le résultat d'une cartographie de 60 métriques (20 par audit) avec niveaux de confiance et faux positifs documentés.

**2. L'architecture quatre dimensions est cohérente.**
Trade History + Order History + Wallet History + Calibration Personnelle forment un système de lecture dont les couches ne se redoublent pas. La complémentarité est structurelle, pas accidentelle.

**3. BMSM est fondé, pas seulement raisonnable.**
Avant ces audits, BMSM reposait sur une intuition architecturale correcte. Après ces audits, il repose sur des métriques classifiées avec des conditions de validité précises. La décision de construire BMSM P1 en priorité sur le signal `intention_gap` est maintenant argumentée, pas seulement postulée.

**4. L'hypothèse Order History est confirmée et étendue.**
Le rapport à l'attente, à la patience et au changement d'avis est mesurable. L'extension non anticipée — l'architecture d'exécution comme dimension propre — enrichit le modèle sans le contredire.

### Ce qui n'est pas établi

**Les seuils réels.** Aucun des trois audits ne peut dire à partir de quel taux d'annulation un opérateur est "instable". Ces seuils sont personnels et ne s'établissent qu'avec des données terrain accumulées.

**La fréquence réelle des signaux.** On ne sait pas encore combien de fois par mois un opérateur déclenchera un signal M05 (cancel-reorder) ou un signal M05 Wallet (retrait cluster). Sans données terrain, ces fréquences sont inconnues.

**L'utilité perçue.** Ces couches de lecture ont une valeur analytique démontrée. Elles ont une valeur pour l'opérateur à démontrer — c'est l'objet du test V0 terrain.

---

### Tableau de synthèse final

| Dimension | Calibration Personnelle V1 | Wallet History V1 | Order History V1 |
|---|---|---|---|
| Valeur comportementale réelle | ✅ | ✅ | ✅ |
| Métriques forte confiance | 5 (H1–H5) | 5 (M01–M05) | 5 (M01–M05) |
| Autonomie analytique | ✅ Suffisante | ✅ Suffisante | ⚠️ Partielle |
| Justifie chantier autonome | ❌ | ❌ | ❌ |
| S'intègre dans | Calibration V1 | BMSM P1/P2 | Calibration V1 + BMSM P1 |
| Condition d'activation | Signal terrain ≥5 exports | Signal terrain Transaction+Earn | Parseur existant · seuils à calibrer |
| Hypothèse testée | Interprétation relative | Capital orthogonal au trading | Intention/patience/exécution ✅ |

---

*Binance Audits — Synthèse architecturale V1*
*2026-05-31 — Documentaire · Aucune implémentation · Aucun code*
