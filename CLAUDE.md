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

State is persisted via `localStorage` (form state + history, capped at 50 snapshots). The behavioral analysis module **also persists in localStorage**: up to 50 sessions FIFO in `CE_behavior_sessions_v1` (via `session-repo.js`) and behavioral memory in `cameleon_behavior_memory_v1` (written by `render.js`). Session results survive page reload. Analysis state is not shared with the main engine.

## Main Engine Pipeline

```
Form Input (16 fields)
  → mapLegacyMarketState()   [form values → state:modifier string]
  → baseEngine()             [raw score 0–100 + attack/sniper signals]
  → profileMatrix()          [filter by PASSIVE / BALANCED / ACTIVE]
  → applyAdaptiveFilter()    [needAction × coreOrders modulation]
  → applyValidation()        [human lock: accepted/pending/adjusted/rejected]
  → buildPayload()           [final decision object]
  → render.js                [DOM injection + history panel update]
    → getTradingPolicy()     [posture + state → allowed/forbidden actions, called from render.js]
```

> **Source officielle des états moteur :** `docs/architecture/canonical_motor_state_2026.md`
> Ce document est la référence technique canonique pour les états, engagements, guards et comportements du pipeline.

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
| `src/js/render.js` | ~5200 lines — all DOM rendering, form binding, animations, history, debug panel |
| `src/css/style.css` | Main theme — header, sidebar, shells, panels, debug brain |
| `src/css/behavior.css` | Behavior module styles (`.bhv-` prefix) |

## Behavioral Module (Isolated Submodule)

Located in `src/js/behavior/`. The isolation contract is strict and intentional:

- Reads **no** data from the main engine
- Emits **no** global events, sets **no** `window.*` properties
- Persists **session results** in localStorage — up to 50 sessions FIFO (`CE_behavior_sessions_v1` via `session-repo.js`); behavioral memory written externally by `render.js` (`cameleon_behavior_memory_v1`)
- **UI panel clears** when any main engine tab is clicked — localStorage data is not affected

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

## Document Quality Control V2 — Mandatory Before Every Commit

Applies to every `.md` file: LOT, doctrine, ADR, governance, roadmap, audit, report, specification, MEMORY.md, CLAUDE.md, etc.
**A Git commit is strictly forbidden until every phase has been completed and the document reaches CAS A. No exception.**

**Phase 1 — Write**
Write the document and save it to disk. Never validate from the conversational output.

**Phase 2 — Read From Disk**
Read the file back from the filesystem (Read tool). Conversational rendering is never authoritative.

**Phase 3 — Structural Audit**
Detect and correct automatically: duplicated paragraphs · duplicated sentences · partially duplicated or truncated+resumed sentences · duplicated Markdown blocks · duplicated lists · duplicated tables · duplicated code blocks · duplicated headings (`#`, `##`, `###`, etc.) · malformed tables · broken numbering · missing separators · formatting inconsistencies · conversational artefacts.

**Phase 4 — Logical Consistency Audit**
Verify: no contradiction between sections · objectives vs. exclusions · risks vs. mitigations · doctrine vs. implementation · success criteria fully cover the scope · failure criteria cover every exclusion · references point to existing sections · every subsection belongs to the correct parent · consistent terminology throughout · coherent version/dates/identifiers · no orphan section.

**Phase 5 — Architectural Neutrality Audit**
Reject or remove: implementation details · filenames · API names · storage technologies · CSS classes · framework-specific concepts · implementation shortcuts · temporary technical decisions. The document must remain valid if the implementation changes completely.

**Phase 6 — Doctrine Audit**
Verify compliance with every active doctrine: ACF V1 · Language System V1 · Memory Doctrine · Pattern Reflection Doctrine · OI V1 · Governance V1 · Roadmap V1 · Grand Plan Directeur V1.

**Phase 7 — Second Read**
Read the corrected file again from disk. Never assume previous corrections succeeded. Perform the entire verification a second time.

**Phase 8 — Quality Report**
Produce a final report with one of two verdicts only:
- **CAS A** — Document clean. No duplicate. No inconsistency. No structural issue. No doctrinal issue. Ready for commit.
- **CAS B** — List every issue. Correct them. Repeat Phases 2→8. Commit remains forbidden.

**Mandatory Double Independent Review**
After the first audit reaches CAS A, do not trust that verdict. Perform a second independent review directly from disk, as if the first review never happened. The second review must not assume the document is correct. Search again for: duplicated sentences · partial duplicates · duplicated paragraphs · duplicated Markdown blocks · duplicated headings · duplicated tables · truncated or resumed sentences · formatting artefacts · numbering mistakes · broken references · inconsistent terminology · contradictory statements · copy/paste artefacts. Never rely on the conversational rendering.

**Conflict Resolution**
If the second review finds any issue missed by the first: immediately downgrade to CAS B · automatically correct every issue · save the file again · restart the complete verification protocol from Phase 2 (Read From Disk). Do not continue from the previous step.

**CAS A Validation Rule**
A document may be declared CAS A only if both the first review and the second independent review reach CAS A independently. If either review finds an issue: document remains CAS B · commit remains forbidden.

**Golden Rule**
Never assume that because the first review found nothing, nothing exists. Every review must behave as if auditing a document written by someone else. Assume hidden copy/paste artefacts, duplicated lines, or rendering issues may still exist until two independent reviews performed directly on the saved file both conclude CAS A.
