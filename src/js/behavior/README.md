# Behavior Analysis Module — `src/js/behavior/`

## What this module is

This directory contains the **historical Behavior Analysis module**.

It analyzes an imported trade history file (CSV or XLS) to identify behavioral patterns
across a trader's past activity: overtrading bursts, position escalation, revenge trading,
and similar psychological tendencies.

### Pipeline

```
CSV/XLS file
  → parser.js        [raw file → normalized trade rows]
  → canonical.js     [rows → canonical trade objects]
  → metrics.js       [trade objects → aggregate metrics]
  → patterns.js      [metrics → detected pattern list]
  → scoring.js       [patterns → behavioral score + label]
  → coaching.js      [score → adaptive coaching messages]
  → behavior-view.js [all of the above → DOM rendering]
```

### Output labels

The module produces one of four behavioral labels:

- **Discipliné**
- **Réactif**
- **Impulsif**
- **Agressif**

---

## What this module is NOT

This module is **separate** from the instant Behavior Guard computed in `engine.js`.

| | Instant Behavior Guard | Historical Behavior Module |
|---|---|---|
| **Location** | `engine.js` → `buildPayload()` | `src/js/behavior/` |
| **Input** | Current form state + engine score | Imported CSV/XLS trade history |
| **Output** | `overtradingLevel` (1–5) in `payload.behavior` | Behavioral label + coaching |
| **Timing** | Recomputed on every engine run | Only when a file is imported |
| **Persistence** | None — ephemeral per run | `localStorage` via storage bridge (V3) |
| **UI block** | `#overtrading-block` in `index.html` | Behavior tab |

The instant guard also has **side effects on the engine itself**: at level ≥ 4 it
reduces `engagement_level`; at level 5 it forces `attack = OFF`, `sniper = OFF`,
and `tradingStatus = NO TRADE`. The historical module has no such side effects.

---

## Isolation contract

This module:
- Reads **no** data from the main engine
- Emits **no** global events
- Sets **no** `window.*` properties
- Writes session results to `localStorage` via `behaviorRepo` (`cameleon.behavior.v1.*` namespace)
- Self-clears when any main engine tab is clicked

---

## Current integration — V3 (stable)

The storage-mediated bridge is active. After each CSV import, `behavior-view.js` writes
the following keys to `localStorage` under the `cameleon.behavior.v1.*` namespace:

| Key | Value | Written by |
|---|---|---|
| `guardLevel` | Integer 1–5 | `behavior-view.js` after every import |
| `guardLevelUpdatedAt` | `Date.now()` timestamp | `behavior-view.js` after every import |
| `dominantRisk` | Pattern string or absent | `behavior-view.js` — only if a dominant pattern exists |
| `dominantRiskUpdatedAt` | `Date.now()` timestamp | `behavior-view.js` — only when `dominantRisk` is written |
| `coherenceLevel` | String enum | `behavior-view.js` after every import |

`render.js` reads all keys and applies the following rules:

- **`guardLevel`** — valid if: is a number, in [1–5], timestamp exists, age < 7 days.
  Fallback: `1` (no effect on merge).
- **`dominantRisk`** — valid if: is a string, in known pattern keys, timestamp exists, age < 7 days.
  Fallback: `'OVERTRADING'` (V1/V2 compatible).
- Both TTLs are **7 days** — same contract, same expiry window.

The active pattern is exposed on the `#overtrading-block` DOM element as
`data-ot-pattern` for DevTools traceability. No UI layout change.

### Merge rule

```
finalLevel = Math.max(instantGuardLevel, historicalGuardLevel)
```

Historical behavior may raise caution but must never reduce the instant guard level.
`engine.js` and `buildPayload()` are not involved in this merge.

### Integration contract

- `payload.behavior.overtradingLevel` is set exclusively by `engine.js` / `buildPayload()`.
- The bridge must not overwrite it directly.
- Any future V4 merge (e.g. weighted average, dual display) must define an explicit
  strategy and apply it at the `behavior: { ... }` object in `buildPayload()`,
  or remain in the render layer with both values preserved independently.
