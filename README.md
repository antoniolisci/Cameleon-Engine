# Cameleon Engine

**Shell visuel V7.3.2e · Moteur adaptatif V4.5**

Application d'aide à la décision pour le trading spot. Produit un diagnostic de marché structuré, un niveau d'engagement autorisé, et une analyse comportementale basée sur l'historique réel de trades.

Pas de framework. Pas de dépendance externe. HTML + JS modules + CSS natifs.

---

## Lancer en local (Windows)

Ne pas ouvrir `src/index.html` directement via `file:///` — les modules ES sont bloqués par CORS sur ce protocole.

**Option 1 — double-clic**

```
serve-local.cmd
```

**Option 2 — PowerShell**

```powershell
powershell -ExecutionPolicy Bypass -File .\serve-local.ps1
```

Puis ouvrir dans le navigateur :

```
http://localhost:8000/src/index.html
```

Pour changer le port :

```powershell
powershell -ExecutionPolicy Bypass -File .\serve-local.ps1 -Port 8080
```

`Ctrl+C` pour stopper le serveur.

---

## Architecture

```
src/
├── index.html
├── css/
│   ├── style.css                 Moteur principal
│   └── behavior.css              Module comportemental (.bhv-)
└── js/
    ├── engine.js                 Score, profils, filtres, payload
    ├── moteur.js                 Interface principale
    ├── market-state.js           Lecture état de marché
    ├── decision.js               Arbre de décision
    ├── state.js                  État global
    ├── confidence-score.js       Score de confiance
    ├── trading-policy.js         Politique de trading
    ├── render.js                 Rendu UI
    ├── data.js                   Labels et constantes
    ├── tone.js / dictionary.js   Éditorial et vocabulaire
    └── behavior/                 Module comportemental — isolé
        ├── behavior-main.js
        ├── analytics/
        │   ├── metrics.js
        │   ├── patterns.js
        │   ├── scoring.js
        │   └── coaching.js
        ├── import/
        │   ├── parser.js
        │   └── uploader.js
        ├── normalize/
        │   ├── canonical.js
        │   ├── validator.js
        │   └── mappers/binance_spot.js
        ├── storage/behavior-repo.js
        └── ui/behavior-view.js
```

---

## Moteur principal

### Pipeline

```
Inputs
  → baseEngine()           score + signaux bruts (attack, sniper)
  → profileMatrix()        filtrage par profil
  → applyAdaptiveFilter()  modulation needAction × coreOrders
  → applyValidation()      verrou humain
  → buildPayload()         payload complet
```

### Score système (0–100)

Calculé sur : état de marché, émotion, Constellium (feu / air / eau / terre / éther), BTC, DXY.

### Profils

| Profil | Comportement |
|---|---|
| PASSIVE | Sniper léger uniquement si nécessité confirmée |
| BALANCED | Sniper + attaque mesurée sur lecture propre |
| ACTIVE | Offensive assumée, sniper ouvert sur lecture complète |

### Niveaux d'engagement

`FULL` → `NEUTRAL` → `REDUCED` → `MINIMAL` → `NONE`

Déterminés par `needAction` × `coreOrders` × état émotionnel.

### États de validation

| État | Effet |
|---|---|
| `accepted` | Autorisation normale |
| `pending` | Sniper en observation, attaque réduite |
| `adjusted` | Attaque réduite, sniper coupé (hors profil ACTIVE) |
| `rejected` | Blocage total de l'offensive |

---

## Module comportemental

Entièrement isolé du moteur : ne lit aucune donnée moteur, n'émet aucun événement global, ne modifie aucune propriété `window`.

### Import

Export CSV Binance Spot. Colonnes requises :

```
Date(UTC), Pair, Side, Price, Executed, Amount, Fee
```

Glisser-déposer ou sélection de fichier depuis l'onglet **Comportement** de la sidebar.

### Pipeline analytique

```
CSV → parser → normalize → computeMetrics → detectPatterns → computeScore → computeCoaching → rendu
```

### Métriques (`metrics.js`)

| Clé | Description |
|---|---|
| `avgSize` | Taille moyenne des positions (valeur quote, $) |
| `avgTimeBetween` | Délai moyen entre trades consécutifs (min) |
| `oversizedTradesCount` | Trades > 2× la taille moyenne |
| `activeHours` | Heures distinctes avec au moins 1 trade (sur 24) |
| `avgDelayAfterBuy` | Délai moyen avant le trade suivant un achat (min) |
| `avgDelayAfterSell` | Délai moyen avant le trade suivant une vente (min) |
| `hourDist` | Distribution horaire UTC — tableau [0..23] |

### Patterns (`patterns.js`)

| Type | Condition de déclenchement |
|---|---|
| `overtrading` | ≥ 5 trades dans une fenêtre de 60 min |
| `revenge_trading` | BUY dans les 30 min suivant un SELL, taille > 1.5× avg |
| `rapid_reentry` | BUY → SELL < 20 min → nouveau BUY < 45 min |
| `size_inconsistency` | Coefficient de variation des tailles ≥ 0.5 (min. 5 trades) |
| `loss_chasing` | 3 BUYs consécutifs à taille croissante en < 120 min |

### Score comportemental (`scoring.js`)

Score sur 100, pénalités graduées selon l'intensité réelle (count ou CV).

| Profil | Seuil |
|---|---|
| Discipliné | ≥ 80 |
| Réactif | ≥ 60 |
| Impulsif | ≥ 40 |
| Agressif | < 40 |

### Coaching adaptatif (`coaching.js`)

```js
computeCoaching(patterns, metrics, scoreData)
// → { priority: string, tips: string[], plan: string[] }
```

**`priority`** — risque dominant (ex. `"Escalade de position"`, `"Sizing instable"`)

**`tips`** — 1 à 5 conseils, triés par `poids × intensité`, sans doublon. S'adaptent à l'intensité réelle :

```
overtrading  count < 5   → "Limite à 3 trades/h."
             count ≥ 5   → "Réduis fortement — max 3/h."
             count ≥ 10  → "Stoppe temporairement."

size_inconsistency  cv 0.5–1  → conseil léger
                    cv ≥ 1    → contrainte stricte

loss_chasing  count < 3  → conseil léger
              count ≥ 3  → interdiction explicite
```

**`plan`** — 2 à 5 étapes concrètes issues des 2 patterns dominants. Chaque étape est directement exécutable.

Règle de déduplication : si `revenge_trading` et `rapid_reentry` sont tous deux détectés, seul le plus sévère (`poids × count`) est conservé.

---

## Principes de conception

- **Zéro interprétation psychologique** — tous les textes sont fondés sur des séquences, des délais et des tailles observables
- **Zéro P&L** — aucune mention de gain ou de perte
- **Isolation stricte** — le module comportemental ne modifie rien dans le moteur principal
- **Pas de localStorage** — les données importées sont en mémoire uniquement, effacées à chaque rechargement
