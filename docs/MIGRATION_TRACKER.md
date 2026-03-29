# MIGRATION TRACKER

This file tracks the transition from fragmented bootstrap infrastructure into a durable long-term architecture.

---

## Migration Objective

Move the system from:
- chat-dependent continuity
- PDF-heavy knowledge transfer
- Sheets-heavy memory
- Apps Script as too much of the entire backbone
- unclear runtime / data / state binding

to:
- GitHub as canonical code/doc home
- Supabase as structured memory and persistence home
- Apps Script as current control / governance plane where useful
- Python as the active home for workloads Apps Script is structurally bad at
- machine-readable contracts for bounded AI/bot work

---

## Migration Principle

Migration must be:
- phased
- workload-driven
- persistence-first
- not panic-driven
- not novelty-driven

Python is not being adopted because it is fashionable.
It is being adopted because some workloads now clearly exceed what Apps Script should be carrying.

---

## Current State

### Already true
- core modules M1–M10 still exist as the architecture frame
- GitHub is active as canonical doc/code home
- Supabase is active for structured persistence
- Apps Script remains useful as current control-plane surface
- Python is now active for:
  - research engine evolution
  - V7 / V8 / V9 workflows
  - friction-aware backtest execution
  - deploy bundle generation
  - live monitoring / governance scaffolding
  - pre-trade runtime guard work

### Not yet true enough
- code is not fully mirrored and normalized into GitHub
- module docs are not complete everywhere
- some architectural memory still lives too much in chats
- worker contracts are not yet machine-readable
- Apps Script / Python responsibility boundaries are still emerging rather than fully formalized
- live execution service layer is not yet fully operationalized
- Supabase persistence is not yet uniformly integrated across all runtime surfaces

---

## Migration Reality Update

### Old framing
Earlier migration framing treated Python mainly as:
- future ingestion path
- future research scaling path
- future live-service possibility

### Current framing
Python is now already active in the project’s research and pre-live path.

Therefore migration is no longer purely future-planned.
It is now **partially active**.

This does not mean Apps Script has been replaced.
It means the project is now in a **hybrid migration phase**.

---

## Migration Principles

1. Do not rewrite robust modules casually.
2. Prioritize persistence before elegance.
3. Preserve comparability of active workflows.
4. Keep M1 sovereign.
5. Keep AI advisory, bounded, and fail-closed.
6. Treat Apps Script as current control plane, not forever backbone.
7. Move meaning into docs and structured memory, not chats.
8. Treat historical data and runtime telemetry as first-class architecture.
9. Prefer explicit contracts over vague automation.

---

## Workstreams

---

## Workstream A — Code Home Migration

### Goal
Make GitHub the durable home for code and docs.

### Status
In progress

### Tasks
- [x] Create GitHub repository
- [x] Add README
- [x] Add architecture/state/governance docs
- [x] Add migration tracker
- [x] Add decision log
- [x] Add strategy / module docs
- [x] Add Python migration README
- [ ] Mirror all relevant module source files into repo structure
- [ ] Normalize current Python research/runtime code into repo
- [ ] Add SQL schema files cleanly
- [ ] Add snapshots / run artifacts as needed

### Success condition
All meaningful code and docs have a canonical GitHub home.

---

## Workstream B — Structured Memory Migration

### Goal
Make Supabase the structured memory home for project state.

### Status
In progress / materially advanced

### Tasks
- [x] experiment logs
- [x] diagnostic notes
- [x] council deliberations
- [x] module registry table
- [x] decision log table
- [x] dataset registry table
- [x] project snapshots table
- [x] canonical market candles
- [x] dataset coverage tables
- [ ] insert complete current module rows
- [ ] insert current major decisions structurally
- [ ] insert regular project snapshots
- [ ] persist current strategy lifecycle state structurally
- [ ] persist champion / backup selection structurally

### Success condition
Project continuity can be reconstructed from Supabase without relying on dead chats.

---

## Workstream C — Research Runtime Migration

### Goal
Move heavy research / validation logic into Python where appropriate.

### Status
Active

### Already achieved
- Python backtest engine active
- timestamp-normalized engine active
- friction-aware execution modeling active
- leverage-cap-aware sizing active
- V7 / V8 / V9 research flow active

### Remaining tasks
- normalize engine into maintainable Python source layout
- reduce notebook-only drift
- formalize experiment runner interfaces
- improve reproducibility / config versioning
- bind runs more cleanly to code version and dataset version

### Success condition
Python becomes the stable home for heavy research runtime without losing governance clarity.

---

## Workstream D — Live Runtime / Monitoring Migration

### Goal
Stage Python as the home for live runtime support where Apps Script is structurally weak.

### Status
Emerging / active preparation

### Already achieved
- deploy bundle generation
- champion / backup config artifacts
- live risk rules
- live monitoring dashboard
- kill-switch evaluator
- runtime state machine
- pre-trade guard design
- shadow execution scaffolding

### Remaining tasks
- equity snapshot heartbeat integration
- shadow execution orchestration loop
- safe real execution bridge
- durable order / fill reconciliation
- stronger observability and service reliability

### Success condition
Live runtime protection and execution support no longer depend on fragile script-only assumptions.

---

## Workstream E — Apps Script Preservation / Role Clarification

### Goal
Preserve Apps Script where it still adds value, while reducing structural overload.

### Status
Important and ongoing

### Apps Script should remain useful for
- M1 constitutional logic
- governance/control surfaces
- Sheets dashboards
- lightweight orchestration where runtime limits are acceptable

### Apps Script should stop being the default home for
- heavier compute
- deep research scaling
- fragile persistence hacks
- live execution infrastructure that needs stronger durability

### Success condition
Apps Script remains valuable, but no longer overburdened.

---

## Workstream F — Dataset / Historical Data Governance

### Goal
Treat datasets as named assets and bind experiments to them explicitly.

### Status
Still important

### Tasks
- [x] establish dataset docs and registry
- [x] maintain canonical candle storage
- [ ] ensure all major Python runs consistently carry dataset identity
- [ ] ensure code-version binding is explicit
- [ ] preserve historical interpretability across runtime environments

### Success condition
Every important run can be tied to:
- a known dataset
- a known code version
- a known config state

---

## Workstream G — Worker Contract Formalization

### Goal
Move from descriptive AI roles toward machine-readable bounded contracts.

### Status
Emerging priority

### Tasks
- [ ] define worker contract schema
- [ ] define authority fields
- [ ] define artifact I/O fields
- [ ] define invocation rules
- [ ] map current worker roles into structured contract form

### Success condition
AI/bot labor is governed by explicit contracts rather than chat interpretation.

---

## Effective Migration Order

### 1. M2-heavy ingestion / 
