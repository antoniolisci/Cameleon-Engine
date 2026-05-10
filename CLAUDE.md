# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

Zero dependencies, zero build step. The project uses ES modules which require a local HTTP server (CORS blocks `file:///`).

```powershell
# Windows — double-click or run in terminal:
powershell -ExecutionPolicy Bypass -File .\serve-local.ps1 -Port 8000
# Then open: http://localhost:8000/src/index.html
```

No npm, no package.json, no compilation. Changes take effect on page reload.

## Architecture Overview

Cameleon Engine is a **client-side-only decision-support tool for spot trading**. It takes 16 form inputs describing current market conditions and the operator's behavioral state, then produces a structured decision: allowed/forbidden actions, engagement level, and adaptive coaching.

All code is in French (UI labels, variable names, comments). No localization layer — French is the native language.

State is persisted via `localStorage` (form state + history, capped at 50 snapshots). The behavioral analysis module is explicitly **ephemeral** — no persistence by design.

## Main Engine Pipeline

```
Form Input (16 fields)
  → mapLegacyMarketState()   [form values → state:modifier string]
  → baseEngine()             [raw score 0–100 + attack/sniper signals]
  → profileMatrix()          [filter by PASSIVE / BALANCED / ACTIVE]
  → applyAdaptiveFilter()    [needAction × coreOrders modulation]
  → applyValidation()        [human lock: accepted/pending/adjusted/rejected]
  → computeTradingPolicy()   [posture + state → allowed/forbidden actions]
  → buildPayload()           [final decision object]
  → render.js                [DOM injection + history panel update]
```

## Key Files

| File | Role |
|------|------|
| `src/index.html` | Single-page shell — 3 tabs (Moteur / Pilotage / Mémoire) + Comportement sidebar |
| `src/js/data.js` | All constants: labels, presets, profile configs, state configs, action modes |
| `src/js/state.js` | Global state struct + localStorage read/write |
| `src/js/engine.js` | Score computation, `baseEngine()`, `profileMatrix()`, `buildPayload()` |
| `src/js/decision.js` | Behavioral decision table: `state:modifier → posture + actions + riskLevel` |
| `src/js/market-state.js` | Market assessment: `state + modifier → risk + metadata` |
| `src/js/confidence-score.js` | Readability score: trend(30%) + structure(30%) + volatility(25%) + volume(15%) |
| `src/js/trading-policy.js` | Derives allowed/forbidden actions from posture + market state + confidence |
| `src/js/moteur.js` | Consolidated API — `runMoteur()`, `getMarketState()`, `getDecision()` |
| `src/js/render.js` | ~3600 lines — all DOM rendering, form binding, animations, history, debug panel |
| `src/css/style.css` | Main theme — header, sidebar, shells, panels, debug brain |
| `src/css/behavior.css` | Behavior module styles (`.bhv-` prefix) |

## Behavioral Module (Isolated Submodule)

Located in `src/js/behavior/`. The isolation contract is strict and intentional:

- Reads **no** data from the main engine
- Emits **no** global events, sets **no** `window.*` properties
- Persists **nothing** (in-memory only)
- Self-clears when any main engine tab is clicked

Pipeline: `CSV file → parser.js → canonical.js → metrics.js → patterns.js → scoring.js → coaching.js → behavior-view.js`

The behavioral score produces one of four labels: **Discipliné / Réactif / Impulsif / Agressif**.

## Debugging

A "Debug Brain" sidebar panel (toggled in UI) shows raw engine state, posture, confidence breakdown, and allowed/forbidden rule lists. It is rendered inside `render.js`.

## Where to Make Changes

- **Engine logic** (scoring, decisions, allowed actions): `engine.js`, `decision.js`, `trading-policy.js`
- **UI copy/labels/text**: `render.js`, `src/index.html`
- **Behavioral analysis**: `src/js/behavior/analytics/`
- **UI layout/theme**: `src/css/style.css`
- **Constants and config**: `src/js/data.js`

## Reading Order for New Contributors

1. `src/js/data.js` — understand the data model and constants
2. `src/js/state.js` — understand state shape and persistence
3. `src/js/engine.js` — core scoring logic
4. `src/js/decision.js` — decision table
5. `src/js/trading-policy.js` — action rules
6. `src/js/render.js` (lines 1–200) — initialization and form binding
7. `src/js/behavior/behavior-main.js` — isolation contract entry point
