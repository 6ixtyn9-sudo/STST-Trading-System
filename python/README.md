# Python Runtime / Migration Layer

This folder is the active Python layer of the project.

Python is no longer only a future migration staging area.
It is now actively used for selected workloads that Apps Script is structurally bad at.

---

## Current Status
**Active, but phased.**

Python is currently being used for:
- heavier research runtime
- friction-aware backtest engine work
- V7 / V8 / V9 strategy validation
- deploy bundle generation
- live monitoring / kill-switch scaffolding
- shadow execution guard work

Python is **not yet the sole primary runtime of the whole project**.
The project is currently in a hybrid state:
- Apps Script remains useful as control/governance/dashboard layer
- Python is active where heavier compute, richer persistence, or stronger runtime reliability are needed

---

## Why Python Exists Here

The purpose of Python is not novelty.

It exists to take over the workloads that Apps Script is structurally weak at:
- heavy compute
- larger-scale backtesting
- richer execution modeling
- service reliability
- live execution infrastructure
- stronger observability
- better runtime state handling

---

## Current Active Python Use Cases

### 1. Research / M9-heavy work
- walk-forward backtests
- OOS evaluation
- experiment processing
- friction-aware V8 stress testing
- V9 candidate selection

### 2. Execution / pre-live support
- deploy bundle generation
- champion / backup config artifacts
- live monitoring dashboard
- kill-switch evaluation
- pre-trade runtime guard
- shadow execution scaffolding

### 3. Data / ingestion support
- external data ingestion
- canonical history rebuilds
- Supabase-backed dataset workflows
- heavier bootstrap / repair workflows

---

## Likely Migration Order

### 1. M2-heavy ingestion / bootstrap logic
- external data ingestion
- canonical history maintenance
- bootstrap workflows
- repair / rebuild flows

### 2. M9-heavy research logic
- walk-forward backtests
- OOS evaluation
- larger-scale experiment processing
- friction-aware validation

### 3. M6 live execution services
- durable execution state
- order management
- telemetry
- monitoring
- stronger persistence / observability

### 4. M10 orchestration services
- only if service separation materially improves continuity, coordination, or reliability

---

## What Should Remain Easy to Preserve
- M1 constitutional logic
- M8 governance rules
- Sheets dashboard / control surfaces where still useful
- existing operator-facing control-plane workflows where they remain reliable

---

## Important Rule
Migration should be phased, not panic-driven.

This is not a rewrite-for-novelty folder.
It is the project’s active landing zone for workloads that justify Python.

---

## Current Architectural Reality
The project is now hybrid by design:

### Apps Script
Best retained for:
- governance / orchestration surfaces
- lightweight control-plane logic
- Sheets integration
- human-readable operator workflows

### Python
Best used for:
- heavier research runtime
- friction-aware testing
- candidate selection
- live monitoring and execution-adjacent services
- data ingestion and rebuild workflows

### Supabase
Structured memory and durable persistence layer.

### GitHub
Canonical code and documentation home.

---

## Immediate Priority
The immediate priority is not broad migration for its own sake.

It is:
- stabilizing the Python research-to-micro-live path
- preserving governance clarity
- wiring telemetry-safe shadow/live execution
- keeping migration workload-driven and reversible where practical

---

## Anti-Drift Rule
If Python work begins to materially change the project’s runtime center of gravity, the docs must be updated.

This folder should never silently become “the real system” while the docs still describe it as hypothetical.
