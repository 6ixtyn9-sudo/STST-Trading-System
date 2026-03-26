# TASK INTAKE TEMPLATE

Use this template before starting any focused task, debugging session, migration task, or future chat.

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
- memory / documentation

---

## Current Mode
Choose one:

- experiment mode
- audit mode
- repair mode
- migration mode
- governance mode
- normal operations mode

---

## Immediate Goal
What exactly needs to happen?

Examples:
- fix a failing Supabase insert
- interpret a batch of experiment rows
- decide what moves to Python first
- understand why a signal family is underperforming
- clean a dead trigger
- design machine-readable worker contracts
- audit a missing document dependency
- define Supabase historical storage policy

---

## Relevant Modules
List only the modules involved.

Examples:
- M2
- M6
- M9
- M10

---

## Relevant Docs
List only the docs that matter.

Examples:
- `docs/PROJECT_STATE.md`
- `docs/ARCHITECTURE.md`
- `docs/DATASETS.md`
- `docs/DECISIONS.md`
- `docs/AI_WORKER_JOBS.md`
- `docs/COUNCIL_ROLES.md`

---

## Relevant Runtime State
What current runtime state matters?

Examples:
- active experiment idx
- latest backtest ID
- current dataset ID
- current governance state
- current error message
- active trigger inventory
- current system mode
- whether an experiment is currently running

---

## Required Artifacts
What existing artifacts must be read before doing work?

Examples:
- latest experiment rows
- trigger inventory
- current M9 config override
- current run state object
- latest Supabase insert error
- active project snapshot

---

## What Is Already Known
Bullet points of facts already established.

Examples:
- matrix runner is resumable
- active run has 240 jobs
- curated cohort universe selection is now working
- `TOP_SPS_WITH_DOGE` currently looks stronger than `TOP_SPS_CORE`
- historical data is still too dependent on Sheets
- dead `IGN_onOpen` trigger exists

---

## Exact Problem or Question
State it plainly.

Examples:
- Why is this specific row failing despite decent PF?
- Why is M9 not emitting diag blobs reliably?
- What is the minimum persistence implementation needed next?
- Where does this missing-document dependency come from?
- What should the worker contract schema be?
- What should move to Supabase first?

---

## What Should Not Change
List any protected constraints.

Examples:
- do not destabilize active run
- do not rewrite robust modules casually
- do not mix live execution and AI authority
- keep M1 sovereign
- do not change governance thresholds silently
- do not launch experiments from loose snippets

---

## Allowed Changes
List what types of changes are allowed in this task.

Examples:
- docs only
- audit helpers only
- code patch limited to one function
- trigger cleanup only
- SQL schema proposal only
- roadmap only

---

## Forbidden Changes
List changes that must not happen during this task.

Examples:
- no run launch
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
- SQL only
- code patch only
- roadmap
- module critique
- decision recommendation
- contract schema
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
What does “done” mean for this task?

Examples:
- one root cause identified with exact fix location
- one patch produced and scoped
- one migration phase documented
- one worker contract schema drafted
- one post-run interpretation completed

---

## Do-Not-Do-Yet Warning
Optional but recommended.

Examples:
- do not touch active experiment runner until current run finishes
- do not migrate data before storage policy is defined
- do not add more AI workers before worker contracts are formalized
