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

The system is intentionally modular so that each layer can evolve without collapsing the machine.

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

M1 is sovereign over:
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
M2 is not just a fetch layer.
It is also the substrate for:
- curated cohort construction
- readiness truth
- historical sufficiency truth
- dataset governance

Python is increasingly relevant for M2-heavy ingestion and rebuild work.

---

### M3 — Analytics
M3 transforms canonical data into analytical state.

Responsibilities:
- indicators
- levels
- regime state
- deterministic analytical transformations

M3 is an analysis layer, not a decision layer.

---

## Decision Layers

### M4 — Signal Engine + DQS
M4 generates strategy signals from M2 + M3 state.

Responsibilities:
- setup eligibility
- thesis confirmation
- DQS scoring
- signal diagnostics

M4 says:
“this setup exists and is worth consideration.”

### Important current note
The currently selected active lead family is:
`BREAKOUT_LONG`

Strategy-family docs must remain aligned with this reality.

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

M5 is the lawful bridge between signals and execution.

### Important current note
Python-side runtime now explicitly models:
- fees
- slippage
- funding
- leverage-cap-aware sizing

This makes risk-law semantics more operationally concrete than before.

---

### M6 — Execution Engine
M6 executes approved risks and manages position lifecycle.

Responsibilities:
- order creation
- position lifecycle
- stops / TP / trailing logic
- deterministic execution state transitions

M6 should remain deterministic and obedient.

### Important current note
Execution-adjacent runtime is now partly forming in Python via:
- pre-trade guard logic
- shadow execution scaffolding
- live monitoring / kill-switch scaffolding

This does not mean M6 has fully migrated.
It means the pre-live runtime has become hybrid.

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

M7 is the visibility layer, not the empirical truth layer.

### Important current note
Monitoring is no longer only workbook/dashboard-based.
Python-side monitoring and kill-switch evaluation now exist too.

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

### Important current note
The live runtime now explicitly uses:
- `ACTIVE`
- `PAUSED`
- `HARD_STOP`

Telemetry freshness is now part of the effective governance surface.

M8 is not “AI mood.”
It is governance-state logic.

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

M9 decides whether strategy claims have empirical support.

### Important current note
M9-heavy research logic is now actively happening in Python.

This includes:
- V7 robustness mapping
- V8 friction stress
- V9 candidate selection

The current active lead family is:
`BREAKOUT_LONG`

Current selected candidate pair:
- champion: `TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL`
- backup: `TOP_SPS_WITH_DOGE | D2_A | P1_BASE | T1_OPEN`

This is now the actual center of gravity of the project.

---

## Persistence + Orchestration Layer

### M10 — Memory + Council Orchestrator
M10 bridges running state into durable memory and bounded review.

Responsibilities:
- experiment payload persistence
- diagnostic note writing
- council deliberation scaffolding
- memory/orchestration support

M10 is not supreme authority and not empirical truth.
It is a memory / orchestration bridge.

### Important current note
Durable artifacts now also exist in Python-side runtime:
- deploy bundle
- live risk rules
- champion/backup artifacts
- monitoring state artifacts

This means project memory is no longer solely flowing through the older Apps Script mental model.

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

---

## Persistence Architecture

### GitHub
Canonical home for:
- code
- architecture meaning
- strategy docs
- decisions
- snapshots
- migration truth

### Supabase
Structured persistence layer for:
- experiment logs
- diagnostics
- deliberations
- dataset metadata
- project memory

### Apps Script
Current control-plane / governance / dashboard layer where useful.

### Python
Active runtime for:
- heavier research
- friction-aware testing
- candidate selection
- pre-live runtime scaffolding
- shadow execution scaffolding
- monitoring / kill-switch logic

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
- making telemetry a real precondition for live behavior
- preserving governance clarity during migration
- avoiding notebook drift becoming invisible architecture

---

## Migration Direction

The architecture is now explicitly evolutionary and hybrid.

Likely path:
1. preserve Apps Script where it remains good enough
2. continue using Python for heavy research/runtime workloads
3. strengthen Supabase as durable memory/state layer
4. formalize service boundaries where needed
5. only migrate live execution more deeply once telemetry/governance loop is solid

This is not rewrite-first.
It is phased migration from a position of actual system capability.

---

## Present Architectural Priority

The current architectural priority is:

- preserve current truth in docs
- finish telemetry-safe shadow/live-prep loop
- prevent runtime drift
- validate selected strategy under disciplined micro-live posture
- deepen durability before broadening live ambition
