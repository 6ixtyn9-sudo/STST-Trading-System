# MODULE REGISTRY

This file is the human-readable registry of the current system modules.

Its purpose is to make module roles durable, explicit, and migration-aware.

If a module matters and its meaning only exists in memory or chat, the architecture is not yet persistent enough.

---

## Registry Fields

Each module entry should eventually maintain:
- role
- current status
- criticality
- persistence status
- owned artifacts / tables / state
- strengths
- risks
- migration target
- next action

This file is the human-readable version.
A structured `module_registry` table should eventually mirror it.

---

## M1 — Foundation

**Role:** Constitution / Config / Security / Kill Switch / Scheduler  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Partial  

### Owns
- config access
- config changelog
- credentials
- kill switch
- triggers / scheduling
- foundational menus and tests

### Strengths
- explicit config discipline
- kill-switch authority
- secure credential custody
- constitutional clarity

### Risks
- meaning still not externally documented enough everywhere
- still partly tied to Apps Script control-plane context

### Migration Target
Remains constitutional layer even after broader migration.

### Next Action
Keep constitutional role explicit in docs and structured memory.

---

## M2 — Data / Canonical History / Universe

**Role:** Market data ingestion and canonical state  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Mixed  

### Owns
- instrument master
- universe construction
- canonical history logic
- history sufficiency gating
- funding log updates
- bootstrap / rebuild workflows

### Strengths
- canonical history gate
- universe building
- data quality logic
- hard-filter and survivorship relevance

### Risks
- historically workbook-heavy
- large surface area
- Apps Script runtime pressure for heavier ingestion paths

### Important current note
M2 is no longer just a fetch layer.
It is also the substrate for:
- curated cohort truth
- historical sufficiency truth
- instrument survivorship truth
- dataset governance

Python is now increasingly relevant for M2-heavy ingestion / rebuild workflows.

### Migration Target
One of the first major Python migration candidates.

### Next Action
Clarify which M2 workloads remain in Apps Script and which are now better handled in Python.

---

## M3 — Analytics

**Role:** Indicators / Levels / Regime  
**Status:** Active  
**Criticality:** High  
**Persistence Status:** Okay  

### Owns
- indicators
- levels
- regime state

### Strengths
- clear analytical separation
- deterministic outputs
- stable conceptual role

### Risks
- output contracts should be documented more explicitly
- still depends on M2 dataset clarity

### Migration Target
Possible later Python candidate, not the immediate pressure point.

### Next Action
Document current output contracts and dependencies more explicitly.

---

## M4 — Signal Engine + DQS

**Role:** Strategy signal generation and DQS scoring  
**Status:** Active  
**Criticality:** High  
**Persistence Status:** Moderate  

### Owns
- signal generation logic
- setup confirmation logic
- DQS scoring
- signal diagnostics

### Strengths
- market hypothesis encoding
- DQS structure
- signal diagnostics
- family-level interpretation relevance

### Risks
- thesis drift if strategy docs are not kept current
- historical signal interpretation can diverge across runtime environments

### Important current note
The currently selected active lead family is:
`BREAKOUT_LONG`

This should remain aligned with actual strategy-family documentation.

### Migration Target
Likely later migration candidate after research/runtime boundaries are cleaner.

### Next Action
Keep `STRATEGY_FAMILIES.md` synchronized with the actual active lead family and selected candidate configs.

---

## M5 — Risk + Portfolio

**Role:** Lawful sizing / leverage / liquidation safety / approval logic  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Moderate  

### Owns
- position sizing logic
- stop-distance logic
- leverage selection / constraints
- exposure checks
- hard rejection rules

### Strengths
- lawful bridge between signals and execution
- explicit rejection semantics
- naturally governance-compatible

### Risks
- assumptions can drift if execution modeling is not kept honest across runtimes

### Important current note
Python-side research and pre-live runtime now explicitly models:
- fees
- slippage
- funding
- leverage-cap-aware sizing

This makes M5 logic more operationally concrete than before.

### Migration Target
Preserve logic; likely service-friendly later.

### Next Action
Keep risk-law semantics explicit and consistent across research and live-prep runtime.

---

## M6 — Execution Engine

**Role:** Deterministic order and position lifecycle  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Weak externally / improving  

### Owns
- orders
- positions
- stop / TP / trail lifecycle
- deterministic position-state transitions

### Strengths
- deterministic role
- rich lifecycle semantics
- naturally auditable if persistence improves

### Risks
- historically too workbook-dependent
- durable external execution-state logging is still not fully mature

### Important current note
Python now contains:
- pre-trade guard scaffolding
- shadow execution scaffolding
- live monitoring / runtime protection scaffolding

This does not mean M6 has fully migrated.
It means the execution-adjacent runtime is now beginning to live partly in Python.

### Migration Target
Major Python/live service candidate.

### Next Action
Preserve deterministic execution semantics while externalizing state durability and telemetry discipline.

---

## M7 — Ops Console

**Role:** Monitoring / Alerts / Dashboard / Operational awareness  
**Status:** Active  
**Criticality:** Medium-High  
**Persistence Status:** Okay  

### Owns
- dashboards
- alerting
- scanner state
- ops summaries
- operator-facing visibility

### Strengths
- practical visibility layer
- operator-facing usefulness
- natural fit for Sheets / dashboard surfaces

### Risks
- should not be mistaken for the only monitoring layer
- stale assumptions can accumulate if runtime observability shifts elsewhere

### Important current note
Python now also has live monitoring / kill-switch scaffolding.
So monitoring is no longer purely workbook/dashboard-centered.

### Migration Target
Likely remains partially in Sheets, even if Python-side monitoring grows.

### Next Action
Keep Apps Script / Sheets ops surfaces and Python-side monitoring conceptually aligned.

---

## M8 — Governance

**Role:** Governance state / go-live gates / hard policy  
**Status:** Active  
**Criticality:** High  
**Persistence Status:** Partial  

### Owns
- governance state
- pause / restriction logic
- go-live gates
- hard-policy framing
- governance packet semantics

### Strengths
- explicit governance-state logic
- naturally superior to vague “AI mood” framing
- constitutional compatibility

### Risks
- governance events are still not durably logged everywhere they should be
- runtime safety can become fake if telemetry is missing

### Important current note
The current live runtime state machine now explicitly uses:
- `ACTIVE`
- `PAUSED`
- `HARD_STOP`

Telemetry freshness is now part of the effective governance surface.

### Migration Target
Preserve logic; strengthen persistence and event history.

### Next Action
Ensure telemetry-aware runtime governance remains explicitly documented and durable.

---

## M9 — Research + Audit

**Role:** Empirical truth / backtesting / OOS / audit  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Mixed but improving  

### Owns
- walk-forward backtests
- OOS evaluation
- experiment truth
- empirical legitimacy
- diagnostics and research metrics

### Strengths
- empirical judiciary role
- strong metric richness
- candidate-selection relevance
- naturally central to strategy legitimacy

### Risks
- complexity is high
- dataset / code-version binding must remain explicit
- historical framing can drift if docs lag runtime

### Important current note
M9-heavy research runtime is now actively happening in Python.

This includes:
- V7 robustness mapping
- V8 friction-aware stress
- V9 candidate selection
- friction-aware execution realism
- leverage-cap-aware sizing realism

The current active lead family is:
`BREAKOUT_LONG`

Current champion:
`TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL`

Current backup:
`TOP_SPS_WITH_DOGE | D2_A | P1_BASE | T1_OPEN`

### Migration Target
One of the top Python migration candidates, and now partially active there already.

### Next Action
Normalize Python-side M9-heavy runtime into more durable source structure and keep experiment / dataset / code binding explicit.

---

## M10 — Memory + Council Orchestrator

**Role:** Persistent memory bridge + council orchestration  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Strongest external bridge so far  

### Owns
- experiment payload persistence
- diagnostic note persistence
- council deliberation creation
- bounded role review scaffolding
- memory / orchestration bridge semantics

### Strengths
- durable memory bridge
- bounded AI workflow
- cross-session continuity support

### Risks
- still incomplete relative to likely long-term importance
- some meaning still exists outside structured memory

### Important current note
Python-side deploy bundle and live runtime artifacts now exist.
This means durable artifacts are no longer only flowing through the older Apps Script mental model.

### Migration Target
Could later evolve into a broader orchestration / memory service layer if justified.

### Next Action
Expand durable artifact handling and reduce reliance on chat memory for project truth.

---

## Summary

The system is already architecturally real.

The main gap is no longer missing modules.
It is:
- keeping runtime reality aligned with docs
- keeping empirical truth aligned with current datasets and code paths
- making governance and telemetry real before live behavior expands
- making project meaning durable across hybrid runtime layers
