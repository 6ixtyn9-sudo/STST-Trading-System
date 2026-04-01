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
- explicit bounded orchestration for AI labor
- lower dependence on accidental sheet-tail review paths

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
- Python is active for:
  - research engine evolution
  - V7 / V8 / V9 workflows
  - friction-aware backtest execution
  - deploy bundle generation
  - live monitoring / governance scaffolding
  - pre-trade runtime guard work

### Newly true enough to document
- deliberative council step persistence exists conceptually and operationally
- M10 can target a specific persisted backtest instead of blindly consuming the last Sheets experiment row
- council review can now run stepwise/resumably via time-driven triggers to avoid Apps Script timeout
- split-brain between “actual intended candidate” and “last row in EXPERIMENTS” has been materially reduced

### Not yet true enough
- provider rate-limit handling is not yet cleanly hardened
- old and new M10 council paths still coexist and should later be simplified
- candidate review policy and activation policy are only partially separated and need further refinement
- machine-readable contracts for broader worker system are not yet operational everywhere

---

## Migration Reality Update

### Old framing
Earlier migration framing treated Python mainly as:
- future ingestion path
- future research scaling path
- future live-service possibility

### Current framing
Python is already active in the project’s research and pre-live path.

Supabase is already active as durable memory for:
- experiment logs
- notes
- snapshots
- artifacts
- deliberation steps

Apps Script remains active as orchestration/governance bridge rather than as sole source of runtime truth.

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
9. Prefer explicit targeting over accidental “latest row” review paths.

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
- [ ] Keep prompt canon aligned with runtime prompt usage

### Success condition
All meaningful code and docs have a canonical GitHub home.

---

## Workstream B — Structured Memory Migration

### Goal
Make Supabase the structured memory home for project state.

### Status
In progress / materially advanced

### Already achieved
- experiment logs
- diagnostic notes
- council deliberations
- module registry table
- decision log table
- dataset registry table
- project snapshots table
- canonical market candles
- dataset coverage tables
- deploy/risk artifact persistence
- deliberation step persistence concept and implementation path

### Remaining tasks
- [ ] reduce duplicate artifact insertion patterns
- [ ] make deliberation targeting and review history cleaner
- [ ] persist current strategy lifecycle state structurally
- [ ] persist champion / backup selection structurally in a more canonical way

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

## Workstream D — Deliberative Memory / Council Migration

### Goal
Upgrade council from thin voting into durable, inspectable, resumable review.

### Status
Now active

### Already achieved
- specific-backtest targeting exists
- council can review intended persisted candidate rows
- worker step persistence path exists
- resumable one-step-per-run council flow exists
- trigger-based resume path exists

### Remaining tasks
- handle provider 429 / quota exhaustion cleanly
- simplify coexistence of old and new council runners
- further separate candidate review policy from activation policy
- improve deliberation cleanup / resume discipline

### Success condition
Council review becomes:
- targeted
- durable
- resumable
- less vulnerable to timeout and split-brain

---

## Workstream E — Live Runtime / Monitoring Migration

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
- shadow execution orchestration loop hardening
- safe real execution bridge
- durable order / fill reconciliation
- stronger observability and service reliability

### Success condition
Live runtime protection and execution support no longer depend on fragile script-only assumptions.

---

## Workstream F — Apps Script Preservation / Role Clarification

### Goal
Preserve Apps Script where it still adds value, while reducing structural overload.

### Status
Important and ongoing

### Apps Script should remain useful for
- M1 constitutional logic
- governance/control surfaces
- Sheets dashboards
- lightweight orchestration where runtime limits are acceptable
- M10 orchestration bridge while hybrid architecture persists

### Apps Script should stop being the default home for
- accidental canonical review targeting via latest sheet row
- heavier compute
- deep research scaling
- fragile persistence hacks
- long multi-step sessions that timeout when resumable flow is better

### Success condition
Apps Script remains valuable, but no longer overburdened or implicitly canonical where it should not be.

---

## Workstream G — Dataset / Historical Data Governance

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

## Strategic Summary

The migration is no longer hypothetical.

It is already active in:
- Python research/runtime
- Supabase durable memory
- M10 deliberative persistence
- specific-backtest review targeting

Current mission:

**continue reducing accidental legacy assumptions, strengthen durable targeted review, harden resumable council execution, and preserve clear separation between candidate review truth and actual activation permission.**
