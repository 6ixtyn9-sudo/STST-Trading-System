# WORKER CONTRACT SCHEMA

This document defines the intended machine-readable contract shape for bounded AI/bot workers inside the $T$T system.

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

## Example YAML Contract

```yaml
worker_id: runner_monitor
name: Runner Monitor
category: operations
mission: observe long experiment runs and summarize runner health

mode_scope:
  allowed_modes:
    - experiment mode
    - audit mode

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

success_condition: runner health summary produced with clear next action
