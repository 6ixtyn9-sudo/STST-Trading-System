# TASK INTAKE TEMPLATE

Use this template before starting any focused task, debugging session, migration task, runtime task, or future chat.

The purpose is to reduce ambiguity, prevent drift, and keep work bounded.

---

## Task Title
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

---

## Immediate Goal
What exactly needs to happen?

Examples:
- fix a runtime guard bug
- interpret a V8 result cluster
- update strategy docs
- verify telemetry freshness behavior
- design a shadow execution cycle
- patch a monitoring gap
- audit a missing dependency
- define a worker contract

---

## Relevant Modules
List only the modules involved.

Examples:
- M2
- M5
- M6
- M8
- M9
- M10

---

## Relevant Docs
List only the docs that matter.

Examples:
- `PROJECT_STATE.md`
- `ARCHITECTURE.md`
- `DATASETS.md`
- `DECISIONS.md`
- `GOVERNANCE_GATES.md`
- `RUNBOOKS.md`
- `STRATEGY_LIFECYCLE.md`

---

## Relevant Runtime State
What current runtime state matters?

Examples:
- active experiment index
- current dataset ID
- current governance state
- current live state (`ACTIVE` / `PAUSED` / `HARD_STOP`)
- active config (`CHAMPION` / `BACKUP`)
- equity telemetry freshness
- governance heartbeat freshness
- whether a run is active
- whether shadow cycle is active

---

## Required Artifacts
What existing artifacts must be read before doing work?

Examples:
- latest experiment rows
- latest V8 CSV
- deploy bundle
- live risk rules
- live state JSON
- latest equity snapshots
- latest live trades
- trigger inventory
- active project snapshot

---

## What Is Already Known
Bullet points of facts already established.

Examples:
- champion and backup are selected
- V8 medium-friction survivors exist
- DD duration is the main unresolved risk
- Python is active in research/runtime
- telemetry is required before entries
- leverage above 3x is not adding practical value

---

## Exact Problem or Question
State it plainly.

Examples:
- why is `can_open_new_trade()` blocking entries?
- should champion switch to backup?
- why is the live dashboard showing stale telemetry?
- what should the next micro-live runbook step be?
- which dataset is actually active in this runtime path?

---

## What Should Not Change
List protected constraints.

Examples:
- do not destabilize active runtime
- do not rewrite robust modules casually
- keep M1 sovereign
- do not bypass governance
- do not allow entries without telemetry
- do not silently change friction assumptions
- do not launch from loose snippets

---

## Allowed Changes
List what types of changes are allowed in this task.

Examples:
- docs only
- audit helpers only
- one-function patch only
- monitoring code only
- runtime guard only
- roadmap only
- no execution changes

---

## Forbidden Changes
List changes that must not happen during this task.

Examples:
- no live order placement
- no trigger deletion
- no large refactor
- no migration execution
- no governance override
- no code edits outside listed modules

---

## Desired Output
What do you want back?

Examples:
- explanation only
- code patch only
- markdown replacement
- roadmap
- module critique
- decision recommendation
- cleanup checklist
- handoff packet

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
- contract schema
- patch list

---

## Success Condition
What does “done” mean?

Examples:
- one root cause identified with exact fix location
- one patch produced and scoped
- one runtime guard validated
- one doc updated completely
- one deployment decision clarified
- one shadow loop step made safe

---

## Do-Not-Do-Yet Warning
Optional but strongly recommended.

Examples:
- do not enable live entries before equity telemetry is online
- do not scale up before shadow validation
- do not patch mid-run unless it is truly fatal
- do not change dataset assumptions without documenting them
- do not switch to backup just because of emotion
