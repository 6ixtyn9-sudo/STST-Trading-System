# TASK INTAKE TEMPLATE

Use this template before starting any focused task, debugging session, migration task, runtime task, persistence task, worker-design task, or future chat.

The purpose is to reduce ambiguity, prevent drift, preserve continuity, and keep work bounded.

This template is intentionally compact.
It should move work forward, not create paperwork.

---

## Push to Start
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

## Spine Pillar
Choose the main operating pillar this task strengthens:
- research
- persistence
- observation
- gating
- governance
- documentation
- orchestration

If more than one applies, list the primary one first.

---

## Immediate Goal
What exactly needs to happen?

Examples:
- persist the current champion rerun properly
- define the Persistence Clerk worker contract
- verify telemetry freshness behavior
- detect whether new entries are lawfully blocked
- summarize current shadow runtime state
- identify whether the edge requires rerun after data refresh
- patch one continuity bug in deliberation resume flow

---

## Relevant Modules
List only the modules involved.

Examples:
- M8
- M9
- M10

---

## Relevant Docs
List only the docs that matter.

Examples:
- `PROJECT_STATE.md`
- `WORKER_REGISTRY.md`
- `RUNBOOKS.md`
- `STRATEGY_LIFECYCLE.md`

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

## Required Artifacts
What existing artifacts must be read before doing work?

Examples:
- latest experiment row
- latest persisted backtest result
- deploy bundle
- live risk rules
- live state JSON
- latest equity snapshots
- latest live events
- current deliberation row
- current deliberation steps
- active project snapshot

---

## What Is Already Known
Bullet points of facts already established.

Examples:
- champion and backup are selected
- DD duration is the main unresolved risk
- Python is active in research/runtime
- telemetry is required before entries
- council must target explicit persisted backtests
- research maintenance is a first-class need

---

## Exact Problem or Question
State it plainly.

Examples:
- what exactly must be persisted for this milestone?
- why is `can_open_new_trade()` blocking entries?
- does the current strategy require rerun after dataset refresh?
- which worker should own this task?
- is the council stuck or merely rate-limited?

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
- do not create new docs unless truly necessary

---

## Allowed Changes
List what is allowed in this task.

Examples:
- one doc replacement
- one worker contract
- one helper design
- one-function patch
- persistence logic only
- monitoring logic only
- roadmap only
- no execution changes

---

## Forbidden Changes
List changes that must not happen during this task.

Examples:
- no live order placement
- no governance override
- no large refactor
- no trigger deletion
- no migration execution
- no code edits outside listed modules

---

## Desired Output
What do you want back?

Examples:
- full markdown replacement
- contract JSON
- compact patch plan
- root-cause explanation
- checklist
- routing table
- one exact next action

---

## Machine-Readable Deliverable Required?
Choose one:
- yes
- no

If yes, specify format:
- JSON
- YAML
- SQL
- Markdown table
- patch list

---

## Success Condition
What does “done” mean?

Examples:
- one worker contract is fully defined
- one persistence path is clarified
- one runtime guard is validated
- one shadow monitor output shape is fixed
- one continuity problem is identified with exact next action

---

## Do-Not-Do-Yet Warning
Optional but strongly recommended.

Examples:
- do not enable live entries before equity telemetry is online
- do not scale up before research maintenance is formalized
- do not patch mid-run unless it is truly fatal
- do not create a new doc when an existing doc can be updated
- do not confuse candidate review with activation permission
