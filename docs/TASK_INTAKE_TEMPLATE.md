# TASK INTAKE TEMPLATE

Use this template before starting any focused task, debugging session, migration task, runtime task, persistence task, worker-design task, or future chat.

The purpose is to:
- reduce ambiguity
- prevent drift
- preserve continuity
- keep work bounded
- ensure work strengthens the actual house

This template is intentionally compact.
It should move work forward, not create paperwork.

---

## Task Name
Short name for the task.

---

## Task Type
Choose one:
- architecture
- debugging
- research analysis
- persistence
- migration
- governance
- execution
- data
- runtime integrity
- monitoring
- memory / documentation
- worker design

---

## Current Mode
Choose one:
- experiment mode
- audit mode
- repair mode
- migration mode
- governance mode
- shadow-live mode
- micro-live mode
- normal operations mode
- noob mode

---

## Spine-7 Pillar
Choose the main pillar this task strengthens:

- research
- persistence
- observation
- gating
- governance
- documentation
- orchestration

If more than one applies, list:
- primary pillar
- secondary pillar(s)

---

## Why This Task Matters To Spine-7
State plainly:

- what pillar failure this task helps prevent
- why this work deserves to exist
- what goes wrong if this is not done

Example:
- prevents persistence truth from dissolving into chat
- prevents runtime from acting while blind
- prevents candidate review from being confused with activation permission
- prevents orchestration chaos under rate limits

---

## Immediate Goal
What exactly needs to happen?

Examples:
- persist the current champion rerun properly
- patch one council resume bug
- confirm telemetry freshness blocking works
- document current shadow runtime truth
- design one bounded worker contract
- remove one split-brain review path

---

## Relevant Modules
List only the modules involved.

Examples:
- M8
- M9
- M10

---

## Relevant Spine Artifacts
What existing artifacts matter most for this task?

Examples:
- `experiment_logs`
- `diagnostic_notes`
- `project_snapshots`
- `project_chunks`
- `council_deliberations`
- `council_deliberation_steps`
- `live_state.json`
- `live_equity.jsonl`
- `live_events.jsonl`
- `shadow_decisions.jsonl`

---

## Relevant Docs
List only the docs that matter.

Examples:
- `SPINE_7.md`
- `PROJECT_STATE.md`
- `RUNBOOKS.md`
- `GOVERNANCE_GATES.md`
- `STRATEGY_LIFECYCLE.md`
- `WORKER_REGISTRY.md`

---

## Relevant Runtime State
What current runtime state matters?

Examples:
- current dataset ID
- current governance state
- current live state (`ACTIVE` / `PAUSED` / `HARD_STOP`)
- active config (`CHAMPION` / `BACKUP`)
- current review target `backtest_id`
- whether shadow cycle is active
- whether equity telemetry exists
- whether governance heartbeat is fresh

---

## Required Inputs
What must be read before doing this task?

Examples:
- latest persisted backtest result
- deploy bundle
- live risk rules
- live state JSON
- latest equity snapshots
- latest live events
- current deliberation row
- current deliberation steps
- current snapshot row

---

## What Is Already Known
Bullet points of facts already established.

Examples:
- champion and backup are selected
- DD duration is the main unresolved risk
- Python is active in research/runtime
- telemetry is required before entries
- council must target explicit persisted backtests
- candidate review and activation review are distinct

---

## Exact Problem Or Question
State it plainly.

Examples:
- why is council resume stalling?
- what exactly must be persisted for this milestone?
- does pre-trade guard fail closed correctly?
- is this task research, gating, or governance?
- what single patch prevents the next continuity failure?

---

## Persistence Requirement
What must exist durably after this task?

Choose one or more:
- no durable output required
- doc update
- Supabase row / update
- JSON artifact
- code patch
- runbook update
- worker contract
- snapshot update
- project chunk
- deliberation history
- other

Be explicit.

---

## What Should Not Change
List protected constraints.

Examples:
- do not destabilize active runtime
- do not rewrite robust modules casually
- keep M1 sovereign
- do not bypass governance
- do not allow entries without telemetry
- do not silently change dataset assumptions
- do not create unnecessary new docs

---

## Allowed Changes
List what is allowed in this task.

Examples:
- one doc replacement
- one helper design
- one-function patch
- persistence logic only
- monitoring logic only
- one worker prompt refinement
- one schema-safe insert/update path

---

## Forbidden Changes
List changes that must not happen during this task.

Examples:
- no live order placement
- no governance override
- no large refactor
- no trigger deletion
- no broad migration execution
- no code edits outside listed modules

---

## Desired Output
What do you want back?

Examples:
- full markdown replacement
- compact patch plan
- root-cause explanation
- checklist
- one exact next action
- one insert/upsert routine
- one worker routing recommendation

---

## Success Condition
What does “done” mean?

Examples:
- one persistence gap is closed
- one runtime gate is validated
- one deliberation continuity bug is removed
- one durable artifact is created
- one doc is brought into runtime alignment
- one worker task is properly bounded to a Spine-7 pillar

---

## Do-Not-Do-Yet Warning
Optional but strongly recommended.

Examples:
- do not enable live entries before equity telemetry is truly online
- do not scale up before maintenance logic is formalized
- do not confuse candidate review with activation permission
- do not create new files when an existing artifact can be updated
- do not patch mid-run unless it is truly fatal
