# WORKER CONTRACT SCHEMA

This document defines the intended machine-readable contract shape for bounded AI/bot workers inside the system.

The goal is to move from prose-only worker descriptions toward explicit operational contracts.

---

## Purpose

A worker contract should define:
- who the worker is
- what the worker is allowed to do
- what the worker reads
- what the worker writes
- how the worker is triggered
- what output format it must follow
- what authority it does **not** have

This is a foundation for:
- safer bounded automation
- less prompt ambiguity
- clearer bot orchestration
- durable labor definitions
- lower context dependence
- stronger runtime discipline

---

## Design Principles

Worker contracts should be:
- explicit
- bounded
- machine-readable
- artifact-oriented
- authority-limited
- fail-closed when possible

Workers should not be:
- vague role-play
- hidden authority
- config sovereignty
- empirical truth override
- silent launchers
- substitutes for runtime governance

---

## Minimal Contract Fields

A minimal worker contract should contain:
- `worker_id`
- `name`
- `category`
- `mission`
- `mode_scope`
- `inputs`
- `outputs`
- `output_format`
- `authority`
- `trigger_conditions`
- `forbidden_actions`
- `success_condition`

---

## Strongly Recommended Additional Fields

As the project matures, contracts should also support:
- `depends_on_modules`
- `requires_governance_state`
- `requires_telemetry`
- `requires_human_ack`
- `artifacts_must_exist`
- `artifacts_must_be_fresh`
- `failure_behavior`
- `idempotency_expectation`
- `notes`

These become especially important for:
- runtime workers
- monitoring workers
- execution-adjacent workers
- migration/orchestration workers

---

## Core Contract Principles

### 1. Advisory does not mean authority
A worker may recommend something without being allowed to do it.

### 2. Runtime safety must be explicit
If a worker depends on telemetry, governance, or live state, the contract should say so.

### 3. Missing inputs should fail closed
If required artifacts are missing or stale, the worker should:
- refuse action
- emit a bounded warning
- not guess its way forward

### 4. Worker authority must be narrower than system authority
No worker should silently outrank:
- M1
- M8 governance state
- M9 empirical truth
- operator review where required

---

## Example YAML Contract

```yaml
worker_id: runner_monitor
name: Runner Monitor
category: operations
mission: observe long experiment runs and summarize runner health

mode_scope:
  allowed_modes:
    - experiment_mode
    - audit_mode

inputs:
  artifacts:
    - execution_logs
    - trigger_inventory
    - run_state
  docs:
    - PROJECT_STATE.md
    - RUN_REGISTRY.md

outputs:
  artifacts:
    - docs/RUN_HEALTH.md
  ephemeral_allowed: true

output_format:
  type: markdown
  required_sections:
    - what_actually_happened
    - what_should_have_happened
    - why_they_differed
    - next_action
    - do_not_do_yet

authority:
  may_edit_code: false
  may_launch_runs: false
  may_delete_triggers: false
  may_recommend: true
  may_write_docs: true
  may_override_governance: false
  may_override_m1: false

trigger_conditions:
  - long_run_active
  - timeout_detected
  - rescue_trigger_fired

forbidden_actions:
  - start_experiment
  - delete_runtime_state
  - change_config

failure_behavior:
  on_missing_inputs: fail_closed
  on_ambiguous_runtime: escalate

success_condition: runner health summary produced with clear next action

worker_id: pre_trade_guard
name: Pre-Trade Guard
category: runtime_integrity
mission: determine whether new entries are currently allowed

mode_scope:
  allowed_modes:
    - shadow_live_mode
    - micro_live_mode

inputs:
  artifacts:
    - live_state.json
    - live_equity.jsonl
    - live_events.jsonl
    - deploy_bundle.json
    - live_risk_rules.json

outputs:
  artifacts:
    - shadow_decisions.jsonl
  ephemeral_allowed: true

output_format:
  type: json
  required_fields:
    - ok
    - reason
    - active_config
    - latest_equity_ts
    - latest_governance_ts

authority:
  may_edit_code: false
  may_launch_runs: false
  may_place_orders: false
  may_recommend: true
  may_override_governance: false
  may_override_m1: false

requires_governance_state:
  allowed_values:
    - ACTIVE

requires_telemetry:
  equity_required: true
  governance_heartbeat_required: true

forbidden_actions:
  - place_order
  - switch_config_silently
  - ignore_stale_telemetry

failure_behavior:
  on_missing_equity: fail_closed
  on_stale_governance: fail_closed
  on_missing_active_config: fail_closed

success_condition: clear yes_or_no entry permission decision returned
