# MIGRATION TRACKER

This file tracks the transition from fragmented bootstrap infrastructure into a durable long-term home.

---

## Migration Objective

Move the $T$T system from:

- chat-dependent continuity
- PDF-based knowledge transfer
- Sheets-heavy memory
- Script Properties overuse
- unclear project-state persistence

to:

- GitHub as canonical code/doc home
- Supabase as structured memory home
- Sheets as dashboard/control surface
- Apps Script as current control plane
- later Python for heavy compute and live services

---

## Current State

### Already true
- core modules M1–M10 exist
- resumable experiment matrix works
- Supabase experiment logging works
- council deliberation scaffolding works
- canonical history is materially deeper than before
- governance state exists
- large research runs are active

### Not yet true enough
- code is not fully housed in GitHub
- docs are not yet complete
- project state still lives too much in chats
- module registry is not yet formally stored everywhere it should be
- dataset states are not yet always explicit
- Document Properties still carry too much temporary importance
- Python migration plan is understood, but not yet staged concretely

---

## Migration Principles

1. Do not rewrite robust modules casually.
2. Prioritize persistence before elegance.
3. Preserve comparability of active research runs.
4. Keep M1 sovereign.
5. Keep AI advisory, bounded, and fail-closed.
6. Treat Apps Script as current control plane, not forever backbone.
7. Move meaning into docs and memory tables, not chats.

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
- [x] Add PROJECT_STATE
- [x] Add ARCHITECTURE
- [x] Add MODULE_REGISTRY
- [x] Add DECISIONS
- [x] Add DATASETS
- [ ] Add MIGRATION_TRACKER
- [ ] Add COUNCIL_ROLES
- [ ] Add RUNBOOKS
- [ ] Mirror module source files into repo folders
- [ ] Add SQL schema files
- [ ] Add snapshot JSONs if useful

### Success condition
All meaningful code and docs have a canonical GitHub home.

---

## Workstream B — Project Brain Migration

### Goal
Make Supabase the structured memory home for project state.

### Status
In progress

### Tasks
- [x] experiment_logs table
- [x] diagnostic_notes table
- [x] council_deliberations table
- [x] create module_registry table
- [x] create decision_log table
- [x] create dataset_registry table
- [x] create project_snapshots table
- [x] create active_todos table
- [x] create project_chunks table
- [ ] insert complete module rows
- [ ] insert key decisions
- [ ] insert current dataset state
- [ ] insert regular project snapshots
- [ ] store future chunk summaries of modules/chats

### Success condition
Project continuity can be reconstructed from Supabase without needing dead chats.

---

## Workstream C — Research Memory Cleanup

### Goal
Reduce dependence on Document Properties and ambiguous reporting.

### Status
Partial

### Tasks
- [ ] reduce reliance on `M9_DIAG_*` property blobs
- [ ] ensure DQS summary is always externally persisted
- [ ] clarify ALL vs OOS metrics in reporting
- [ ] version important experiment contexts
- [ ] log dataset ID alongside experiment rows
- [ ] create reproducibility notes for major runs

### Success condition
Research history is durable, queryable, and interpretable without guessing.

---

## Workstream D — Dataset Governance

### Goal
Treat datasets as named assets.

### Status
Early

### Tasks
- [x] establish DATASETS doc
- [x] insert first dataset_registry row
- [ ] define dataset naming convention
- [ ] tag major runs with dataset ID
- [ ] record scope changes explicitly
- [ ] record source changes explicitly
- [ ] record deeper-history expansions explicitly

### Success condition
Every important experiment can be tied to a clearly identified dataset state.

---

## Workstream E — Governance + Council Formalization

### Goal
Make M8 + M10 a durable constitutional decision layer.

### Status
Partial

### Tasks
- [x] governance state function exists
- [x] council fact pack exists
- [x] pending deliberation creation exists
- [ ] store governance events historically
- [ ] document council role prompts in repo
- [ ] clarify presidential override flow
- [ ] ensure hard policy remains fail-closed
- [ ] keep M1 supremacy explicit in docs

### Success condition
Council behavior is documented, bounded, and persistently auditable.

---

## Workstream F — Apps Script to Python Migration Planning

### Goal
Stage future migration without destabilizing current system.

### Status
Future-planned

### Candidate order
1. M2-heavy ingestion/bootstrap logic
2. M9-heavy research/backtest logic
3. M6 live execution services
4. M10 service orchestration if needed

### Tasks
- [ ] create `python/README.md`
- [ ] define migration phases
- [ ] identify first service candidates
- [ ] define data contracts between old/new layers
- [ ] preserve Sheets as dashboard where useful

### Success condition
Python migration happens by layer, not by panic rewrite.

---

## Immediate Priorities

### Now
- keep active experiment run stable
- finish docs
- finish project-brain tables
- insert first memory rows

### This week
- mirror code into GitHub
- create project snapshots habit
- reduce memory dependence on chat
- preserve experiment observations durably

### Later
- deepen datasets further if needed
- formalize dataset tagging
- plan Python migration in concrete slices

---

## Things Explicitly Deferred

- full Python rewrite now
- replacing robust modules just because they are large
- giant PDF uploads as primary continuity mechanism
- overbuilding AI features before persistence is clean

---

## Current Biggest Risk

The biggest risk is not missing code.

The biggest risk is:
**knowledge fragmentation across chats, Sheets, properties, and human memory.**

This migration tracker exists to reduce that risk.

---

## Current Biggest Opportunity

The machine is already real.

If persistence is solved properly, the project gains:
- continuity
- compounding understanding
- less drift
- less re-explanation tax
- stronger future migration path

That is the whole point of this migration.
