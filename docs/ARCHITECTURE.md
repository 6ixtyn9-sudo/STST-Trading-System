# ARCHITECTURE

## Overview

The $T$T system is a modular trading architecture built around distinct layers of responsibility:

- constitutional control
- data and canonical history
- analytics
- signal generation
- risk control
- execution
- operations monitoring
- governance
- empirical audit
- persistent memory and council orchestration

The system is intentionally modular so that each layer can evolve without collapsing the whole machine.

It is now better understood as:

- a live operational machine
- a research machine
- a governance-constrained system
- a memory-bearing system in transition
- an architecture moving from implicit human continuity toward explicit persistent continuity

---

## Constitutional View

### M1 — Foundation / Constitution
M1 is the constitutional layer.

Responsibilities:
- CONFIG source of truth
- CONFIG changelog
- security and credential custody
- kill switch
- trigger scheduling
- foundational menu and tests

M1 is sovereign over:
- security
- kill switch authority
- config legitimacy

No AI or downstream module should override M1.

---

## Data and State Layers

### M2 — Data / Canonical History / Universe
M2 handles external market data state.

Responsibilities:
- instrument master
- hard filters
- universe construction
- candle fetching
- canonical `DATA_CLEAN` maintenance
- funding log updates
- history sufficiency gating
- bootstrap / resumable bootstrap

M2 is the source of canonical market history for the rest of the system.

### Important current architectural note
M2 is no longer just a fetch layer.  
It is also the substrate for meaningful universe construction through:

- hard-filter pass state
- top-K/SPS state
- symbol readiness
- product-type awareness
- instrument survivorship

This matters because later modules now increasingly depend on **curated cohort selection**, not crude name buckets.

---

### M3 — Analytics
M3 transforms canonical data into analytical state.

Responsibilities:
- ATR, RSI, Bollinger, OBV, relative performance
- support/resistance
- daily levels
- consolidation counts
- market regime

Outputs:
- `INDICATORS`
- `LEVELS`
- `REGIME`

M3 is an analysis layer, not a decision layer.

---

## Decision Layers

### M4 — Signal Engine + DQS
M4 generates strategy signals from M2 + M3 state.

Responsibilities:
- eligibility filtering
- breakout/retest/confirmation thesis
- DQS scoring
- signal state writing
- signal diagnostics

Outputs:
- `SIGNALS` rows, especially `CONFIRMED` candidates

M4 says:
“this setup exists and is worth consideration.”

---

### M5 — Risk + Portfolio
M5 lawfully sizes and evaluates candidate signals.

Responsibilities:
- position sizing
- stop distance
- leverage selection
- liquidation proxy
- funding/carry estimates
- exposure checks
- hard rejection rules
- `APPROVED` / rejected risk rows

Outputs:
- `RISK_CALC` rows

M5 is the lawful bridge between signals and execution.

---

### M6 — Execution Engine
M6 executes approved risk decisions and manages live position state.

Responsibilities:
- process approved risks into orders
- create positions
- manage stops / TP / runner logic
- update order/position lifecycle
- live API execution in LIVE mode

Outputs:
- `ORDERS`
- `POSITIONS`

M6 should remain deterministic and obedient.

---

## Monitoring and Governance Layers

### M7 — Ops Console
M7 provides operational awareness.

Responsibilities:
- alerting
- email batching
- scanner logic
- dashboard
- API log
- risk/ops summaries
- kill-switch escalation in certain conditions

M7 is the ops/visibility layer, not the strategy brain.

---

### M8 — Governance
M8 governs system readiness and behavioral constraints.

Responsibilities:
- governance state
- mood / behavior journaling
- pause / ban logic
- go-live gates
- governance cycle
- AI governance fact pack
- hard-policy evaluation for council

Outputs:
- governance state
- governance packets
- go-live gate status

M8 is not execution logic.  
It is system-governance logic.

---

## Empirical Truth Layer

### M9 — Research + Audit
M9 is the empirical judiciary.

Responsibilities:
- walk-forward backtests
- OOS evaluation
- metrics calculation
- DQS summaries
- experiment truth
- tax export

Outputs:
- `BACKTEST_RESULTS`
- diagnostics
- `dqs_summary`
- empirical pass/fail state

M9 decides whether strategy claims have empirical support.

### Important current architectural note
M9 was found to contain the actual backtest universe resolver path.

That resolver has now been upgraded from crude symbol-name segmentation toward curated cohort support.

This is a major architecture correction because it means persistence tests are now being run on more defensible universe definitions.

### Current M9 universe capabilities
M9 now supports real cohort-aware selection such as:
- `HARD_FILTER_ALL`
- `TOP_K`
- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`
- `PERP_CORE`
- `SPOT_CORE`
- `CUSTOM`

This is a significant improvement over the old string-matching segmentation logic.

---

## Persistence + Council Layer

### M10 — Memory + Council Orchestrator
M10 bridges the running workbook into persistent memory and AI review.

Responsibilities:
- build experiment payloads
- push experiment logs to Supabase
- add diagnostic notes
- create pending council deliberations
- build fact packs for role agents
- collect and finalize bounded AI council votes

M10 is not supreme authority and not execution truth.
It is a memory and orchestration bridge.

### Important current architectural note
M10 should increasingly be thought of as a durable artifact bridge, not just a helper layer.

Its long-term role is to reduce the amount of meaning that exists only in:
- chat
- PDFs
- human recollection
- temporary property blobs

---

## Flow Summary

### Research / operational flow
1. **M2** builds canonical market state
2. **M3** computes indicators, levels, and regime
3. **M4** generates signals and DQS-scored candidates
4. **M5** evaluates risk, size, leverage, liquidation safety
5. **M6** executes approved risks and manages positions
6. **M7** monitors ops state and raises alerts
7. **M8** governs system state and gate logic
8. **M9** backtests and judges empirical validity
9. **M10** persists experiment/council memory externally

---

## Persistence Architecture

### Sheets / Apps Script
Current operating surface:
- visible state
- current orchestration
- current dashboard
- active runner state
- live operational control plane

### Supabase
Persistent structured memory:
- experiment logs
- diagnostics
- council deliberations
- project brain tables
- future dataset / run / decision registries
- future historical storage support

### GitHub
Persistent code and meaning:
- source files
- architecture docs
- module registry
- migration tracker
- decisions
- prompts
- project state snapshots

---

## Authority Hierarchy

1. **M1** — constitutional authority
2. **M8** — governance state authority
3. **M9** — empirical truth authority
4. **M10** — orchestration / memory / council
5. **M5** — lawful risk gate
6. **M6** — execution

This means:
- execution should never outrank governance
- AI should never outrank hard rules
- memory should never outrank constitution
- orchestration should never outrank empirical truth
- no council process should silently bypass hard policy

---

## Current Strategic Read of the Architecture

The machine is now at a stage where the critical architecture problems are less about “missing modules” and more about:

- durable memory
- artifact continuity
- better data/storage architecture
- reduction of implicit human context
- machine-readable contracts for bounded AI/bot labor

The architecture is increasingly moving from:
- implicit continuity
to:
- explicit continuity

That transition is now a first-class concern.

---

## Future Migration Direction

The likely migration path is:

1. keep Sheets + Apps Script as current control plane
2. move project memory and meaning into GitHub + Supabase
3. move historical data storage away from Sheets toward Supabase-backed canonical persistence
4. later migrate heavy data/research workloads toward Python
5. eventually move live execution infrastructure to Python/services
6. retain Sheets as a control/dashboard surface if useful

This architecture is evolutionary, not rewrite-first.

---

## Present Architectural Priority

The current architectural priority is not to rewrite everything.

It is to make the existing machine:

- remember itself durably
- select universes more truthfully
- log and compare research more cleanly
- reduce runtime ambiguity
- prepare for larger-scale history and fairer persistence evaluation
