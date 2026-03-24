# TASK INTAKE TEMPLATE

Use this template before starting any focused task, debugging session, or future chat.

---

## Task Title
Short name for the task.

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

## Immediate Goal
What exactly needs to happen?

Example:
- fix a failing Supabase insert
- interpret a batch of experiment rows
- decide what moves to Python first
- understand why a signal family is underperforming

---

## Relevant Modules
List only the modules involved.

Example:
- M2
- M9
- M10

---

## Relevant Docs
List only the docs that matter.

Example:
- docs/PROJECT_STATE.md
- docs/ARCHITECTURE.md
- docs/DATASETS.md
- docs/DECISIONS.md

---

## Relevant Runtime State
What current state matters?

Example:
- active experiment idx
- latest backtest ID
- current dataset ID
- current governance state
- current error message

---

## What Is Already Known
Bullet points of facts already established.

Example:
- matrix runner is resumable
- active run has 416 jobs
- inverted mirrors currently look less bad than base longs
- canonical history currently reaches late 2021

---

## Exact Problem or Question
State it plainly.

Example:
- Why is this specific row failing despite decent PF?
- Why is M9 not emitting diag blobs reliably?
- What is the minimum persistence implementation needed next?

---

## What Should Not Change
List any protected constraints.

Example:
- do not destabilize active run
- do not rewrite robust modules casually
- do not mix live execution and AI authority
- keep M1 sovereign

---

## Desired Output
What do you want back?

Example:
- explanation only
- SQL only
- code patch only
- roadmap
- module critique
- decision recommendation
