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
- still partly tied to Apps Script control-plane context
- some activation-era assumptions can still contaminate broader review flows if boundaries are not explicit

### Migration Target
Remains constitutional layer even after broader migration.

### Next Action
Keep constitutional role explicit and keep M1 authority cleanly above orchestration/council logic.

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
- Apps Script runtime pressure for heavier ingestion paths

### Migration Target
One of the first major Python migration candidates.

### Next Action
Continue keeping active dataset identity explicit across Python/Supabase workflows.

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
- output contracts still not explicit enough everywhere
- depends on clear dataset and timestamp semantics

### Migration Target
Possible later Python candidate.

### Next Action
Keep analytical outputs deterministic and clearly bound to current dataset/runtime assumptions.

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
- family-level interpretation relevance

### Risks
- thesis drift if strategy docs lag actual selected family
- historical signal interpretation can diverge across runtimes

### Important current note
The currently selected active lead family is:
`BREAKOUT_LONG`

### Migration Target
Later migration candidate after research/runtime boundaries are cleaner.

### Next Action
Keep strategy docs and selected config reality synchronized.

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
- assumptions can drift if research/runtime and execution/runtime diverge
- leverage semantics must remain consistent across all runtimes

### Important current note
Python-side research/runtime now explicitly models:
- fees
- slippage
- funding
- leverage-cap-aware sizing

### Migration Target
Preserve logic; likely service-friendly later.

### Next Action
Keep risk-law semantics explicit and stable across research, council interpretation, and live-prep runtime.

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
- historically workbook-dependent
- durable external execution-state logging still not fully mature

### Important current note
Python now contains:
- pre-trade guard scaffolding
- shadow execution scaffolding
- live monitoring / runtime protection scaffolding

### Migration Target
Major Python/live service candidate.

### Next Action
Preserve deterministic execution semantics while continuing to externalize telemetry and state durability.

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
- stale assumptions can accumulate if observability shifts elsewhere

### Migration Target
Likely remains partially in Sheets.

### Next Action
Keep Sheets-facing operator visibility and Python-side runtime observability aligned.

---

## M8 — Governance

**Role:** Governance state / review gates / activation constraints  
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
- superior to vague “AI mood” framing
- constitutional compatibility

### Risks
- historically mixed candidate review with operator activation gating too tightly
- runtime safety becomes fake if telemetry is missing
- overly human-centered gating can contaminate strategy review if not separated cleanly

### Important current note
M8 must now be understood as supporting at least two governance questions:
- candidate review
- activation/go-live review

These should not be silently collapsed.

### Migration Target
Preserve logic; strengthen separation and persistence.

### Next Action
Continue separating:
- candidate review policy
from
- actual activation/live permission policy

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
- central to strategy legitimacy

### Risks
- complexity is high
- dataset / code-version binding must remain explicit
- historical framing can drift if docs lag runtime

### Important current note
M9-heavy research runtime is now actively happening in Python.

Current active strategy pair:
- champion: `TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL`
- backup: `TOP_SPS_WITH_DOGE | D2_A | P1_BASE | T1_OPEN`

### Migration Target
One of the top Python migration candidates, and now partially active there already.

### Next Action
Keep experiment / dataset / code binding explicit and durable.

---

## M10 — Memory + Council Orchestrator

**Role:** Persistent memory bridge + council orchestration  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Strong external bridge / expanding  

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
- now supports resumable stepwise deliberation

### Risks
- old sheet-tail review assumptions can still leak in if not explicitly avoided
- provider quota / rate-limit handling is now an operational constraint
- coexistence of old and new council paths can create confusion until simplified

### Important current note
M10 now supports:
- specific persisted backtest targeting
- stepwise deliberation persistence
- resumable trigger-driven council execution

This is a material evolution from a thinner isolated-vote pattern.

### Migration Target
Could later evolve into a broader orchestration / memory service layer if justified.

### Next Action
Harden:
- rate-limit handling
- trigger hygiene
- path clarity between old and new council flows

---

## Summary

The system is already architecturally real.

The main gaps are no longer missing modules.
They are:
- keeping runtime reality aligned with docs
- keeping empirical truth aligned with current datasets and code paths
- separating candidate review from activation review cleanly
- making deliberation durable without unnecessary bloat
- continuing to reduce split-brain between Python/Supabase truth and legacy sheet-tail assumptions
