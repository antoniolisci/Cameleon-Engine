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

## Methodological ROI Analysis — Mandatory Before Any Method Evolution

The method must remain alive. Every improvement to the method increases its cost. A new rule is therefore never automatically a good idea.

Before proposing any new control, new rule, or new documentary step — whether during Control 11 or at any other moment — perform a methodological ROI analysis. Answer all seven questions explicitly.

**Question 1 — Frequency**
Is the problem encountered frequent enough to justify a permanent method evolution? Or is it simply an exceptional case?

**Question 2 — Reach**
Will the new rule produce a benefit across dozens or hundreds of future documents? Or only across a few specific cases?

**Question 3 — Simplicity**
Is there a simpler way to achieve the same result?

**Question 4 — Absorption**
Can the new rule be absorbed into an existing rule instead of creating a new control?

**Question 5 — Net value**
Does this evolution increase readability · robustness · coherence more than it increases complexity?

**Question 6 — Durability**
If this rule remains present for 5 years, will it still have value? Answer clearly.

**Question 7 — Score**
Assign explicit scores:
- Value produced: 0–10
- Complexity added: 0–10
- Methodological ROI: Excellent · Good · Average · Low · Negative

**Decision rule**
A permanent new rule may only be added if: **Value ≥ 8/10 AND Complexity ≤ 3/10**

If either threshold is not met: the rule is refused or integrated into an existing rule.

**Fundamental principle**
An extraordinary method is not one that always adds rules. It is one that becomes more intelligent while remaining simpler. Simplicity is an architectural constraint at the same level as robustness. Every new rule must prove it genuinely deserves to exist.

---

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

## Document Quality Control V3 — Mandatory After Every Commit (Before Next Micro-Lot)

Applies after DQC V2 is complete and the document has been committed.
**Opening the next micro-lot is strictly forbidden until DQC V3 returns PASS. No exception.**

**Mission:** Guarantee that every new document integrates perfectly into the global documentary architecture of Caméléon Engine. DQC V3 does not verify the document itself — it verifies the document's integration across the entire ecosystem, including its long-term impact on documentary architecture health.

**Execution order: Controls 1 → 7, then Control 10, then Control 8 (report), then Control 9 (verdict), then Control 11 (method review).**

**Control 1 — Documentary Duplicates**
Verify no other document already holds the same responsibility. Identify: mission duplicates · functional duplicates · doctrine duplicates · responsibility duplicates. If a duplicate exists: explain why · propose resolution · suspend next micro-lot.

**Control 2 — Single Source of Truth**
For every major concept in the document: identify the master document · clarify this document's role · verify no document becomes a second source of truth.

**Control 3 — Documentary Coherence Audit**
Compare explicitly with: Roadmap V1 · GPD V1 · Gouvernance V1 · Language System V1 · Memory Doctrine · parent LOT · previous micro-lots · sibling documents · validation documents · MEMORY.md · project memory · Notion. Detect: contradictions · inconsistencies · implicit changes · obsolete rules · broken references · documents requiring update.

**Control 4 — Responsibility Audit**
Answer explicitly: What is the exact responsibility of the new document? Which documents remain responsible for other topics? Is there overlap? Is there ambiguity? Is the split still coherent?

**Control 5 — Dependency Verification**
Check: incoming dependencies · outgoing dependencies · LOT order · micro-lot order · prerequisites · validation criteria · closure conditions. Report any missing dependency.

**Control 6 — Documentary Synchronization**
Determine whether an update is required in: MEMORY.md · project memory · Notion · Roadmap · GPD · Gouvernance · other official documents. Never omit Notion when a structural decision is validated. Any desynchronization must be reported.

**Control 7 — Architectural Impact**
Evaluate the impact of the new document on the global architecture. Answer: Does it add a new responsibility? Does it modify an existing one? Does it change a doctrine? Does it require a documentary evolution elsewhere?

**Control 10 — Documentary Architecture Evolution**
Analyze the long-term impact of the new document on the global documentary ecosystem. Answer all nine questions explicitly.

1. Does the document create a new documentary responsibility? If yes: which one · why is it legitimate · why should it not have been absorbed by an existing document?

2. Does the document shift a responsibility that previously belonged to another document? If yes: which document · is the shift correctly documented · does the previous document require modification?

3. Does the document render an existing document obsolete · partially obsolete · incomplete · ambiguous · or unnecessary? If yes: identify the affected document precisely.

4. Does the document create a documentary redundancy — even if not yet critical? Explain why.

5. Should the document be merged with another · split into multiple documents · or remain independent? Justify the decision.

6. Has the documentary ecosystem become more complex? Evaluate: readability · navigability · number of dependencies · depth of cross-references · future risk of confusion.

7. Does the documentary architecture remain evolutive? Answer explicitly: Can 50 more documents be added without loss of coherence? 100? 300? If a limit appears, signal it immediately.

8. Are documentary refactorings recommended? If yes, list them clearly: fusion · split · relocation · renaming · responsibility change · simplification.

9. Evaluate the documentary debt. Classify: None · Low · Moderate · High · Critical. Justify.

**Control 8 — DQC V3 Report**
Produce the following mandatory table (covers all 10 controls):

| Control | Verdict |
|---------|---------|
| Documentary duplicates | PASS / FAIL |
| Responsibilities | PASS / FAIL |
| Documentary coherence | PASS / FAIL |
| Single source of truth | PASS / FAIL |
| Dependencies | PASS / FAIL |
| Architectural impact | PASS / FAIL |
| Documentary evolution | PASS / FAIL |
| Documentary debt | None / Low / Moderate / High / Critical |
| MEMORY.md | OK / Needs update |
| Project memory | OK / Needs update |
| Notion | OK / Needs update |
| Roadmap / GPD / Gouvernance | PASS / FAIL |

**Control 9 — Final Verdict**
Conclude with an explicit architecture assessment:

**Documentary architecture:** Stable · Enriched · Refactoring recommended

Then conclude with one of:
- **DQC V3 — PASS** — next micro-lot may open.
- **DQC V3 — CAS B** — next micro-lot is forbidden until all issues are resolved and PASS is obtained.

If a refactoring is required before the next micro-lot, the verdict must be **DQC V3 — CAS B**. A recommended refactoring alone (not required) does not block the next micro-lot but must be documented.

**Control 11 — Methodological Continuous Improvement**
After completing Controls 1–10, step back and analyze the quality of the method itself — not the document, not the ecosystem, but the way documents are produced. Answer all six questions explicitly.

This control does not change the DQC V3 verdict. It only evolves the method progressively. No rule should be added merely to increase complexity. The method must become more intelligent, not heavier. Simplicity remains a core architectural value of Caméléon Engine.

1. During this DQC V3, was there a difficulty that a better method could have prevented? If yes: describe the problem precisely · explain why it appeared · propose a durable improvement.

2. Is there a new methodological rule that should be added to CLAUDE.md to prevent this type of problem in all future lots? If yes: apply the Methodological ROI Analysis first. Only if Value ≥ 8/10 AND Complexity ≤ 3/10: draft the proposed rule · explain its value · specify whether it is mandatory or recommended. If thresholds are not met: refuse or integrate into an existing rule.

3. Does DQC V2 or DQC V3 currently have a weakness · blind spot · insufficient check · useless step · redundancy · or excessive complexity? Justify precisely.

4. Does the experience from this micro-lot change how Caméléon Engine should be developed? If yes: identify the lesson learned · propose its integration into the official method.

5. Does the cost of the current method remain proportional to the benefit obtained? Is the method more secure · clearer · more robust without becoming unnecessarily heavy? If simplification is preferable, propose it.

6. Looking at the entire development process, is an evolution of the general project method recommended? This may concern: documentation · audits · validations · commits · synchronization · governance · ADR · Roadmap · project memory · Notion · or any other part of the workflow. Think as a software architect responsible for a project that must live for several years.

**Control 11 — Mandatory report:**

| Control | Verdict |
|---------|---------|
| Current method is adapted | PASS / FAIL |
| New rule proposed | Yes / No |
| Simplification recommended | Yes / No |
| CLAUDE.md evolution | Yes / No |
| Governance evolution | Yes / No |
| Methodological debt | None / Low / Moderate / High |

Conclude with one of:
- **Method: Stable** — no change needed.
- **Method: Improving** — one or more improvements identified and documented.
- **Method: Refactoring recommended** — a structural change to the method is warranted.
