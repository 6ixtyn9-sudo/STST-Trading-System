# SPINE_7

This document defines the seven persistent pillars of the $T$T system.

The purpose of Spine-7 is to prevent the machine from depending on:
- chat memory
- one operator’s mental state
- accidental last-row assumptions
- brittle runtime fragments
- platform limits disguised as architecture

Spine-7 is the durable labor backbone of the system.

---

## Purpose

The system is no longer just:
- a research notebook
- a Sheets + Apps Script machine
- a collection of prompts
- a set of backtests

It is now a hybrid governed system that must persist:
- empirical truth
- runtime truth
- governance truth
- operational continuity
- strategic identity

Spine-7 defines the irreducible domains that must remain alive if the machine is to remain coherent.

It is also the current routing system for:
- persistence priorities
- worker design boundaries
- architecture gap detection
- anti-bloat discipline

---

## The Seven Pillars

1. **Research**
2. **Persistence**
3. **Observation**
4. **Gating**
5. **Governance**
6. **Documentation**
7. **Orchestration**

---

# 1. Research

## Purpose
Continuously test whether the edge is alive, degrading, improving, or regime-dependent.

## Owns
- backtests
- reruns
- data refresh revalidation
- edge appreciation / depreciation analysis
- strategy maintenance review
- lifecycle promotion / demotion evidence

## Current status
**Active**

## Current reality
Research is now materially Python-led.

Important current research truth includes:
- V5 timestamp mismatch bug was found and fixed through timestamp normalization
- V7 confirmed `BREAKOUT_LONG` center-of-mass
- V8 confirmed medium-friction survival in a narrow cluster
- V9 selected champion and backup for micro-live validation posture
- current persisted main review target is the V9 sanity rerun champion row

## Key artifacts
- `experiment_logs`
- `diagnostic_notes`
- `RUN_REGISTRY.md`
- `STRATEGY_LIFECYCLE.md`
- Python V7 / V8 / V9 runtime outputs
- current review target:
  - `backtest_id = bt_8e24c2cd59f9ce9fa6e9128400b8d1c7`

## Current strongest truth
- lead family: `BREAKOUT_LONG`
- active dataset: `CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V1`
- champion:
  - `TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL | F2_MED | LEV3`
- backup:
  - `TOP_SPS_WITH_DOGE | D2_A | P1_BASE | T1_OPEN | F2_MED | LEV3`

## Current main weakness
**drawdown duration / prolonged underwater time**

## Failure mode if absent
- stale edge treated as real
- no empirical maintenance
- candidate selection decays into folklore

## Next action
Keep Python research truth durably reflected in repo docs and Supabase, especially around candidate selection and persisted target rows.

---

# 2. Persistence

## Purpose
Make important system facts durable and queryable.

## Owns
- experiment persistence
- project snapshots
- deploy bundles
- risk rules
- chunk persistence
- durable result registration

## Current status
**Active and materially improved**

## Current reality
Supabase is now real structured memory, not just planned persistence.

Current persisted domains include:
- experiment logs
- diagnostic notes
- project snapshots
- project chunks
- datasets
- decision memory
- council summary rows
- deliberation step history

Python-side persistence also now writes:
- V9 sanity rerun result
- champion / backup strategy state
- deploy bundle artifacts
- live risk rules artifacts

## Key artifacts
- `project_snapshots`
- `project_chunks`
- `decision_log`
- `experiment_logs`
- `diagnostic_notes`
- `council_deliberations`
- `council_deliberation_steps`

## Current persistence truth
If something matters operationally, it should not exist only in chat.

## Main current gaps
- some artifact insertion patterns still duplicate instead of update cleanly
- strategy lifecycle state is still stronger in docs than in structured schema
- champion / backup identity is persisted, but not yet in one canonical structured table
- some Python milestone truth still lives too much in notebook history

## Failure mode if absent
- system truth dissolves into chat
- work must be repeatedly re-explained
- review loses continuity

## Next action
Keep converting milestone truth into durable Supabase rows and canon docs without multiplying unnecessary files.

---

# 3. Observation

## Purpose
Know what the runtime is actually doing now.

## Owns
- live state observation
- equity telemetry observation
- governance heartbeat observation
- shadow signal observation
- operator-facing runtime summaries

## Current status
**Partial but real**

## Current reality
Observation scaffolding now exists in Python for:
- `live_state.json`
- `live_equity.jsonl`
- `live_events.jsonl`
- `shadow_signals.jsonl`
- `shadow_decisions.jsonl`

Live monitoring dashboard logic exists.
Governance heartbeat and equity freshness checks exist.
Shadow-cycle logic exists.

## Key artifacts
- `live_state.json`
- `live_equity.jsonl`
- `live_events.jsonl`
- `shadow_signals.jsonl`
- `shadow_decisions.jsonl`

## Current main gap
Observation is scaffolded, but still early.
The system is not yet rich in actual live telemetry history.

## Failure mode if absent
- runtime becomes blind
- stale state goes unnoticed
- live / shadow monitoring becomes fake

## Next action
Ensure runtime observation is treated as first-class persistence, not just temporary local files.

---

# 4. Gating

## Purpose
Determine what the machine is lawfully allowed to do right now.

## Owns
- pre-trade guard
- telemetry freshness gate
- governance freshness gate
- active / paused / hard-stop enforcement
- fail-closed runtime permission logic

## Current status
**Partial but operational**

## Current reality
Python runtime now contains:
- live kill-switch evaluator
- telemetry freshness rules
- governance freshness rules
- `can_open_new_trade()`
- `pre_trade_guard()`
- explicit entry blocking on stale or missing telemetry

This is one of the most important shifts in the project:
candidate legitimacy is no longer silently treated as activation permission.

## Key artifacts
- `live_risk_rules.json`
- runtime guard logic
- governance heartbeat checks
- equity freshness checks
- entry permission outputs

## Current rule
No new trade unless:
- state is `ACTIVE`
- active config exists
- equity telemetry exists
- equity telemetry is fresh
- governance heartbeat is fresh
- no kill-switch is active

## Failure mode if absent
- system may act while blind
- candidate legitimacy gets confused with live permission
- unsafe entry evaluation becomes possible

## Next action
Keep gating fail-closed and prevent activation semantics from drifting back into fuzzy council logic.

---

# 5. Governance

## Purpose
Interpret candidate legitimacy and operational restriction using bounded review.

## Owns
- candidate review
- council continuity
- policy interpretation
- candidate vs activation review separation
- deliberation memory

## Current status
**Active**

## Current reality
Governance now has two explicit layers:

### Candidate review
Should this strategy be promoted into shadow / micro-live validation posture?

### Activation review
May the runtime actually open new trades right now?

This distinction is now core doctrine.

M10 council now supports:
- specific persisted target review
- three initial workers
- three cross-reviews
- one supervisor synthesis
- per-step persistence

## Key artifacts
- `council_deliberations`
- `council_deliberation_steps`
- governance packets
- worker prompts
- supervisor outputs
- `GOVERNANCE_GATES.md`
- `DELIBERATION_PATTERN.md`
- `WORKER_REGISTRY.md`

## Current main blocker
- OpenRouter quota / rate-limit handling
not
- council concept design

## Failure mode if absent
- review becomes ad hoc
- stale assumptions leak into decisions
- candidate review and activation review collapse into confusion

## Next action
Keep council targeted at explicit persisted backtests and continue hardening resumable deliberation.

---

# 6. Documentation

## Purpose
Keep the written house aligned with the actual house.

## Owns
- architecture truth
- project state truth
- lifecycle truth
- run registry truth
- migration truth
- worker registry truth

## Current status
**Active but drift-sensitive**

## Current reality
The repo now contains strong documentation coverage for:
- architecture
- strategy lifecycle
- governance gates
- run registry
- migration state
- worker roles
- datasets
- home guide
- module registry

But hybrid architecture creates ongoing drift risk:
- Python runtime can advance faster than docs
- older Apps Script-era assumptions can linger too long
- notebook truth can outpace written canon

## Key artifacts
- `PROJECT_STATE.md`
- `ARCHITECTURE.md`
- `STRATEGY_LIFECYCLE.md`
- `RUN_REGISTRY.md`
- `MIGRATION_TRACKER.md`
- `WORKER_REGISTRY.md`
- `DATASETS.md`
- `DECISIONS.md`

## Failure mode if absent
- docs become sabotage through drift
- future sessions inherit lies
- runtime center of gravity changes silently

## Next action
Keep docs aligned with actual Python/Supabase runtime truth and explicitly preserve major notebook-era discoveries.

---

# 7. Orchestration

## Purpose
Maintain continuity across resumable, hybrid, rate-limited, multi-step system flows.

## Owns
- trigger hygiene
- resume discipline
- duplicate-run avoidance
- stuck-flow detection
- continuity routing
- execution path clarity

## Current status
**Partial and important**

## Current reality
Orchestration remains hybrid.

Apps Script still matters for:
- trigger-driven continuity
- M10 council orchestration
- Sheets-connected control surfaces

Python now also carries orchestration-adjacent continuity through:
- checkpointed experiment runners
- resumable research loops
- shadow runtime loop scaffolding
- persistence-aware artifact generation

## Key artifacts
- Apps Script trigger inventory
- checkpoint files
- resumable council flow
- runner continuation state
- JSONL progress files
- execution logs

## Current main gap
- trigger hygiene still needs continued discipline
- old and new council paths still coexist
- provider quota issues can interrupt otherwise-correct orchestration

## Failure mode if absent
- duplicate runs
- stuck deliberations
- accidental fallback to old paths
- chaos under platform limits

## Next action
Simplify path clarity and keep resumable flows canonical instead of letting legacy shortcuts re-enter.

---

# Spine-7 Rule

All future worker design should map to one or more Spine-7 pillars.

If a proposed worker does not clearly strengthen one of the seven pillars, it is probably scope creep.

All major work should also be classifiable by Spine-7 before it starts.

---

# Current Rollout Priority

Current practical rollout priority remains:

1. **Persistence**
2. **Observation**
3. **Gating**
4. **Research**
5. **Governance**
6. **Orchestration**
7. **Documentation**

This is rollout order, not importance rank.

---

# Current Strategic Read

The machine’s biggest risks are no longer missing concepts.

They are:
- persistence gaps between runtime truth and durable truth
- observation gaps in pre-live telemetry
- gating drift
- governance ambiguity between candidate review and activation review
- orchestration fragility under rate limits and hybrid flow coexistence

Spine-7 is the frame used to prevent that drift.

---

# Architecture Rule

Spine-7 should be modeled fully now, even if implemented gradually.

Do not design a partial house and repeatedly rebuild it.

Use Spine-7 as:
- architecture compression
- persistence routing
- worker-boundary discipline
- anti-bloat doctrine
- continuity map
