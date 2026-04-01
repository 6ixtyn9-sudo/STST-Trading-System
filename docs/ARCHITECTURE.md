# ARCHITECTURE

## Overview

The system is a modular trading architecture built around distinct layers of responsibility:

- constitutional control
- data and canonical history
- analytics
- signal generation
- risk control
- execution
- operations monitoring
- governance
- empirical audit
- persistent memory and orchestration

The system remains intentionally modular so that each layer can evolve without collapsing the machine.

It is now best understood as:
- a research machine
- a governance-constrained system
- a pre-live runtime in formation
- a memory-bearing system
- a hybrid Apps Script + Python architecture in phased transition

---

## Constitutional View

### M1 — Foundation / Constitution
M1 is the constitutional layer.

Responsibilities:
- config source of truth
- config changelog
- security and credential custody
- kill switch
- trigger scheduling
- foundational menus and tests

M1 remains sovereign over:
- security
- kill switch authority
- config legitimacy

No AI or downstream runtime should override M1.

---

## Data and State Layers

### M2 — Data / Canonical History / Universe
M2 handles market data state.

Responsibilities:
- instrument master
- hard filters
- universe construction
- canonical history maintenance
- funding log updates
- history sufficiency gating
- bootstrap / rebuild workflows

M2 is the source of canonical market-history truth.

### Important current note
Python remains increasingly relevant for:
- deeper ingestion
- rebuilds
- direct dataset use in research/runtime

---

### M3 — Analytics
M3 transforms canonical data into analytical state.

Responsibilities:
- indicators
- levels
- regime state
- deterministic analytical transformations

M3 remains an analysis layer, not a decision layer.

---

## Decision Layers

### M4 — Signal Engine + DQS
M4 generates strategy signals from M2 + M3 state.

Responsibilities:
- setup eligibility
- thesis confirmation
- DQS scoring
- signal diagnostics

Current active lead family:
`BREAKOUT_LONG`

Strategy-family docs should remain aligned with this reality.

---

### M5 — Risk + Portfolio
M5 lawfully sizes and evaluates candidate signals.

Responsibilities:
- position sizing
- stop-distance logic
- leverage constraints
- liquidation / safety proxies
- exposure checks
- hard rejection rules

Python-side research/runtime now models:
- fees
- slippage
- funding
- leverage-cap-aware sizing

This makes M5 semantics more operationally concrete than before.

---

### M6 — Execution Engine
M6 executes approved risks and manages position lifecycle.

Responsibilities:
- order creation
- position lifecycle
- stops / TP / trailing logic
- deterministic execution state transitions

Important current note:
Execution-adjacent runtime now exists partly in Python via:
- pre-trade guard logic
- shadow execution scaffolding
- live monitoring / kill-switch scaffolding

M6 has not fully migrated.
The execution-adjacent runtime is hybrid.

---

## Monitoring and Governance Layers

### M7 — Ops Console
M7 provides operational awareness.

Responsibilities:
- dashboards
- alerts
- summaries
- operator visibility
- ops scanning

Monitoring is no longer purely workbook/dashboard-centered.
Python-side monitoring also exists.

---

### M8 — Governance
M8 governs system readiness and behavioral constraints.

Responsibilities:
- governance state
- pause / restriction logic
- hard-policy framing
- deployment gate semantics

Outputs:
- governance state
- governance packets
- system restrictions

### Important current architecture update
M8 should now be understood as containing at least two distinct governance questions:

#### A. Candidate Review Governance
Used to evaluate whether a strategy deserves:
- shadow-live
- micro-live validation posture
- bounded promotion from research

This should primarily reflect:
- empirical candidate legitimacy
- bounded governance context
- strategy maintenance posture

#### B. Activation / Go-Live Governance
Used to determine whether the runtime may actually:
- activate
- open entries
- operate live right now

This should reflect:
- runtime state
- telemetry health
- kill switch
- activation controls

### Architecture caution
These two layers should not be silently collapsed into one question.

That collapse caused review contamination when council deliberation consumed operator activation constraints as if they were candidate-legitimacy failures.

---

## Empirical Truth Layer

### M9 — Research + Audit
M9 is the empirical judiciary.

Responsibilities:
- walk-forward backtests
- OOS evaluation
- experiment truth
- diagnostic metrics
- strategy legitimacy

Current active Python-led M9 work includes:
- V7 robustness mapping
- V8 friction-aware stress
- V9 candidate selection

Current selected pair:
- champion: `TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL`
- backup: `TOP_SPS_WITH_DOGE | D2_A | P1_BASE | T1_OPEN`

This remains the current center of gravity of the project.

---

## Persistence + Orchestration Layer

### M10 — Memory + Council Orchestrator
M10 bridges running state into durable memory and bounded review.

Responsibilities:
- experiment payload persistence
- diagnostic note writing
- council deliberation scaffolding
- memory/orchestration support

### Important architecture update
M10 now supports a **deliberative council path** with:
- specific-backtest targeting
- three initial worker judgments
- three cross-reviews
- one supervisor synthesis
- durable deliberation-step persistence
- resumable trigger-driven execution to avoid Apps Script timeout

This is a material upgrade from:
- three isolated votes
- one thin finalizer

### Important operational caution
The main current operational weakness in M10 is no longer timeout alone.

It is now:
- provider quota / rate-limit handling
- trigger hygiene
- clean review-mode separation

---

## Flow Summary

### Research / runtime flow
1. **M2** builds canonical market state
2. **M3** computes analytical state
3. **M4** generates signals and DQS-scored candidates
4. **M5** evaluates risk lawfully
5. **M6** executes or simulates execution
6. **M7** monitors ops state
7. **M8** governs system state
8. **M9** backtests and judges empirical validity
9. **M10** persists and orchestrates durable review/memory

### Current council review flow
1. specific persisted experiment is selected
2. M10 creates pending deliberation
3. worker initial round runs
4. worker cross-review round runs
5. supervisor finalization runs
6. deliberation steps are persisted durably
7. summary decision is written back

---

## Persistence Architecture

### GitHub
Canonical home for:
- code
- architecture meaning
- strategy docs
- decisions
- snapshots
- prompt canon

### Supabase
Structured persistence layer for:
- experiment logs
- diagnostics
- deliberations
- deliberation steps
- dataset metadata
- project memory
- snapshots
- deploy/risk artifacts

### Apps Script
Current control-plane / governance / dashboard layer where useful.

### Python
Active runtime for:
- heavier research
- friction-aware testing
- candidate selection
- live/runtime scaffolding
- deploy artifact generation

---

## Authority Hierarchy

1. **M1** — constitutional authority
2. **M8** — governance authority
3. **M9** — empirical truth authority
4. **M10** — orchestration / memory
5. **M5** — lawful risk gate
6. **M6** — execution

This means:
- execution should not outrank governance
- AI should not outrank hard rules
- memory should not outrank constitution
- orchestration should not outrank empirical truth

---

## Current Strategic Read of the Architecture

The architecture problem is no longer “missing modules.”

The main current architecture challenges are:
- keeping docs aligned with runtime truth
- reducing split-brain between Apps Script and Python reality
- separating candidate review from activation permission cleanly
- making deliberation durable without making it bloated
- handling provider quota/rate-limit constraints in resumable council flow

---

## Migration Direction

The architecture remains explicitly evolutionary and hybrid.

Likely path:
1. preserve Apps Script where it remains good enough
2. continue using Python for heavy research/runtime workloads
3. strengthen Supabase as durable memory/state layer
4. keep M10 as orchestration bridge while reducing sheet-tail dependence
5. only deepen execution migration after telemetry/governance loop is solid

---

## Present Architectural Priority

The current architectural priority is:

- preserve truthful runtime docs
- keep council targeting specific persisted backtests
- separate candidate review from actual activation review
- harden resumable deliberation
- continue validation under disciplined micro-live posture
