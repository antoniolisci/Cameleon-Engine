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
| **Persistence** | None — ephemeral per run | None — in-memory only |
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
- Persists **nothing** (in-memory only)
- Self-clears when any main engine tab is clicked

---

## Future integration — TODO

The historical module could eventually produce its own pressure level (1–5) derived
from past behavioral patterns. If that is implemented:

- It must **not** overwrite `payload.behavior.overtradingLevel` directly.
- A **merge strategy** must be defined explicitly (e.g. `max()`, weighted average,
  or a separate field like `payload.behavior.historicalLevel`).
- The merge point belongs in `engine.js` → `buildPayload()`, inside the
  `behavior: { ... }` object, with both values preserved independently.
- The render layer can then decide which level to display or how to combine them.

Until that strategy is defined, the two systems remain intentionally disconnected.
