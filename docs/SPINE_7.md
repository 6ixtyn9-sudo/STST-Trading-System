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

## 1. Research

### Purpose
Continuously test whether the edge is alive, degrading, improving, or regime-dependent.

### Owns
- backtests
- reruns
- data refresh revalidation
- edge appreciation / depreciation analysis
- strategy maintenance review
- lifecycle promotion / demotion evidence

### Key artifacts
- `experiment_logs`
- `diagnostic_notes`
- run summaries
- strategy maintenance notes
- candidate review metrics

### Failure mode if absent
- stale edge treated as real
- no empirical maintenance
- candidate selection decays into folklore

---

## 2. Persistence

### Purpose
Make important system facts durable and queryable.

### Owns
- experiment persistence
- project snapshots
- deploy bundles
- risk rules
- chunk persistence
- durable result registration

### Key artifacts
- `project_snapshots`
- `project_chunks`
- `decision_log`
- `experiment_logs`
- `diagnostic_notes`

### Failure mode if absent
- system truth dissolves into chat
- work must be repeatedly re-explained
- review loses continuity

---

## 3. Observation

### Purpose
Know what the runtime is actually doing now.

### Owns
- live state observation
- equity telemetry observation
- governance heartbeat observation
- shadow signal observation
- operator-facing runtime summaries

### Key artifacts
- `live_state.json`
- `live_equity.jsonl`
- `live_events.jsonl`
- `shadow_signals.jsonl`
- `shadow_decisions.jsonl`

### Failure mode if absent
- runtime becomes blind
- stale state goes unnoticed
- live/ shadow monitoring becomes fake

---

## 4. Gating

### Purpose
Determine what the machine is lawfully allowed to do right now.

### Owns
- pre-trade guard
- telemetry freshness gate
- governance freshness gate
- active/paused/hard-stop enforcement
- fail-closed runtime permission logic

### Key artifacts
- `live_risk_rules.json`
- runtime guard outputs
- gating decisions
- entry permission checks

### Failure mode if absent
- system may act while blind
- candidate legitimacy gets confused with live permission
- unsafe entry evaluation becomes possible

---

## 5. Governance

### Purpose
Interpret candidate legitimacy and operational restriction using bounded review.

### Owns
- candidate review
- council continuity
- policy interpretation
- candidate vs activation review separation
- deliberation memory

### Key artifacts
- `council_deliberations`
- `council_deliberation_steps`
- governance packets
- policy packets
- supervisor outputs

### Failure mode if absent
- review becomes ad hoc
- stale assumptions leak into decisions
- candidate review and activation review collapse into confusion

---

## 6. Documentation

### Purpose
Keep the written house aligned with the actual house.

### Owns
- architecture truth
- project state truth
- lifecycle truth
- run registry truth
- migration truth
- worker registry truth

### Key artifacts
- `PROJECT_STATE.md`
- `ARCHITECTURE.md`
- `STRATEGY_LIFECYCLE.md`
- `RUN_REGISTRY.md`
- `MIGRATION_TRACKER.md`
- `WORKER_REGISTRY.md`

### Failure mode if absent
- docs become sabotage through drift
- future sessions inherit lies
- runtime center of gravity changes silently

---

## 7. Orchestration

### Purpose
Maintain continuity across resumable, hybrid, rate-limited, multi-step system flows.

### Owns
- trigger hygiene
- resume discipline
- duplicate-run avoidance
- stuck-flow detection
- continuity routing
- execution path clarity

### Key artifacts
- Apps Script trigger inventory
- execution logs
- checkpoint state
- resumable council flow state
- runner continuation records

### Failure mode if absent
- duplicate runs
- stuck deliberations
- accidental fallback to old paths
- chaos under platform limits

---

## Spine-7 Rule

All future worker design should map to one or more Spine-7 pillars.

If a proposed worker does not clearly strengthen one of the seven pillars, it is probably scope creep.

---

## Rollout Priority

Initial rollout priority:

1. Persistence
2. Observation
3. Gating
4. Research
5. Governance
6. Orchestration
7. Documentation

This is rollout order, not importance rank.

---

## Architecture Rule

Spine-7 should be modeled fully now, even if implemented gradually.

Do not design a partial house and repeatedly rebuild it.
