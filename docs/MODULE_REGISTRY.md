# MODULE REGISTRY

This file is the human-readable registry of the current system modules.

The purpose of this file is to make module roles durable, explicit, and migration-aware.

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
A structured Supabase `module_registry` table should eventually mirror it.

---

## M1 — Foundation

**Role:** Constitution / Config / Security / Kill Switch / Scheduler  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Partial  

### Owns
- CONFIG access
- CONFIG changelog
- credentials
- kill switch
- triggers
- foundational menus/tests

### Strengths
- strong config discipline
- explicit changelog
- secure key custody
- clean kill-switch authority

### Risks
- still tied to Apps Script / workbook environment
- architecture meaning not yet externally documented enough

### Migration Target
Remains constitutional layer even after Python migration

### Next Action
Mirror constitutional role into Supabase `module_registry` + GitHub docs

---

## M2 — Data / Canonical History / Universe

**Role:** Market data ingestion and canonical state  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Mixed  

### Owns
- `INSTRUMENTS`
- `UNIVERSE`
- `DATA_RAW`
- `DATA_CLEAN`
- `FUNDING_LOG`
- bootstrap / resumable bootstrap

### Strengths
- canonical history gate
- resumable bootstrap
- hard filters
- universe building
- data quality logic
- history diagnostics

### Risks
- large module surface
- Apps Script runtime pressure
- currently workbook-heavy
- historical storage still too dependent on Sheets
- symbol freshness inconsistencies can distort research interpretation

### Important current note
M2 is increasingly central not only for data ingestion, but also for:
- hard-filter pass truth
- SPS / Top-K universe state
- cohort construction inputs
- history sufficiency truth

### Migration Target
One of the first major Python / service migration candidates

### Next Action
Register dataset versions, bootstrap modes, and historical storage policy more clearly

---

## M3 — Analytics

**Role:** Indicators / Levels / Regime  
**Status:** Active  
**Criticality:** High  
**Persistence Status:** Okay  

### Owns
- `INDICATORS`
- `LEVELS`
- `REGIME`

### Strengths
- clean compute separation
- deterministic analytical outputs
- schema discipline
- test coverage

### Risks
- analytical outputs still mostly persist in Sheets
- depends on M2 schema stability

### Migration Target
Later Python candidate, not immediate

### Next Action
Document output contracts and dependencies

---

## M4 — Signal Engine + DQS

**Role:** Strategy signal generation and DQS scoring  
**Status:** Active  
**Criticality:** High  
**Persistence Status:** Moderate  

### Owns
- `SIGNALS` generation logic
- confirmation thesis
- DQS scoring
- signal diagnostics

### Strengths
- clear thesis structure
- DQS logic
- diagnostics
- adaptive setup evaluation

### Risks
- research/live interpretation can drift if not documented
- signal context still workbook-centered

### Migration Target
Later migration candidate after persistence improves

### Next Action
Document current active strategy thesis explicitly and align with `STRATEGY_FAMILIES.md`

---

## M5 — Risk + Portfolio

**Role:** Lawful sizing / leverage / liquidation safety / approval logic  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Moderate  

### Owns
- `RISK_CALC`
- risk sizing logic
- leverage selection
- liquidation proxy
- hard rejection rules

### Strengths
- clear bridge between M4 and M6
- structured approval logic
- explicit rejection reasons
- test coverage

### Risks
- depends on assumptions across M4, M6, M7
- should be documented as a lawful gate, not just a calculator

### Migration Target
Preserve logic; likely service-friendly later

### Next Action
Add to registry and snapshot its output contract

---

## M6 — Execution Engine

**Role:** Deterministic order and position lifecycle  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Weak externally  

### Owns
- `ORDERS`
- `POSITIONS`
- execution state transitions
- stop/TP/trailing lifecycle

### Strengths
- deterministic
- rich schemas
- explicit position lifecycle
- tests and diagnostics

### Risks
- execution truth remains too workbook-dependent
- should eventually emit durable external logs
- some experiment-path helpers still have brittle external document dependencies

### Migration Target
Major Python/live service candidate

### Next Action
Treat as lawful executor; later externalize lifecycle persistence and audit document dependencies

---

## M7 — Ops Console

**Role:** Monitoring / Alerts / Dashboard / Operational awareness  
**Status:** Active  
**Criticality:** Medium-High  
**Persistence Status:** Okay  

### Owns
- `ALERT_LOG`
- `DASHBOARD`
- `API_LOG`
- ops scanning

### Strengths
- alert catalog
- dashboard
- risk and ops visibility
- email batching

### Risks
- depends on workbook ecosystem
- some references may assume exact upstream schemas
- dead trigger noise / operational clutter can accumulate if not maintained

### Migration Target
Likely remains partially in Sheets even later

### Next Action
Keep as ops layer; not core migration blocker

---

## M8 — Governance

**Role:** Governance state / Go-live gates / AI hard policy pack  
**Status:** Active  
**Criticality:** High  
**Persistence Status:** Partial  

### Owns
- governance state
- mood / behavior logic
- pause / ban logic
- go-live gates
- council fact packs

### Strengths
- real governance-state function
- go-live validation
- AI hardening packet
- policy evaluation

### Risks
- some state stored in Script Properties
- governance events not yet fully externally logged

### Migration Target
Preserve logic; later add stronger persistence of governance events

### Next Action
Log governance transitions into Supabase eventually

---

## M9 — Research + Audit

**Role:** Empirical truth / backtesting / OOS / audit  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Mixed  

### Owns
- `BACKTEST_RESULTS`
- `ARCHIVE`
- walk-forward backtests
- OOS metrics
- DQS summaries
- tax export

### Strengths
- serious research engine
- OOS logic
- strong metric richness
- compact DQS summary path
- diagnostics

### Risks
- remnants of property-based diagnostics
- complexity is high
- sheet reporting still mixes ALL vs OOS concepts imperfectly

### Important current note
M9 was audited and found to contain the real backtest universe resolver path.  
That resolver has now been upgraded to support curated cohort-aware selection.

This is a major architecture correction.

### Migration Target
One of the top Python migration candidates

### Next Action
Keep pushing compact outputs to Supabase; reduce property dependence; preserve curated cohort semantics

---

## M10 — Memory + Council Orchestrator

**Role:** Persistent memory bridge + council orchestration  
**Status:** Active  
**Criticality:** Very High  
**Persistence Status:** Strongest external bridge so far  

### Owns
- experiment export
- Supabase logging
- diagnostic note writing
- council deliberation creation
- OpenRouter role voting
- council finalization

### Strengths
- bridges Sheets into persistent memory
- structured experiment payloads
- governance fact-pack integration
- bounded AI workflow

### Risks
- still latest-row centric in places
- still depends on workbook as immediate source
- broader project memory role is still incomplete relative to its likely long-term importance

### Migration Target
Could later evolve into service/orchestrator layer

### Next Action
Expand into full project-brain bridge, not only council memory

---

## Summary

The system is already architecturally real.

The biggest remaining gap is not “missing modules.”  
It is lack of a permanent home for:

- code
- architecture meaning
- project state
- decisions
- dataset history
- run history
- cross-session continuity
- machine-readable worker contracts
