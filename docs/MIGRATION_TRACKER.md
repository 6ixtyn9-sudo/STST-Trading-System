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
- machine-readable contracts for bounded AI/bot work

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
- curated cohort universe resolution is now working inside M9
- active run continuation is proven in unattended operation

### Not yet true enough
- code is not fully housed in GitHub
- docs are not yet complete everywhere
- project state still lives too much in chats
- module registry is not yet formally stored everywhere it should be
- dataset states are not yet always explicit enough
- Document Properties still carry too much temporary importance
- long-history storage still leans too heavily on Sheets
- machine-readable worker contracts do not yet exist
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
8. Treat historical data architecture as a first-class migration concern.
9. Prefer contracts over vague automation.

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
- [x] Add MIGRATION_TRACKER
- [x] Add COUNCIL_ROLES
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
- [ ] record stale-series cleanup explicitly
- [ ] separate dataset identity from cohort identity where needed

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
- [ ] define machine-readable council role contracts

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

## Workstream G — Historical Data / Storage Migration

### Goal
Reduce dependence on Google Sheets as the primary historical warehouse.

### Status
Now strategically important

### Why this matters
Current run interpretation is now clearly affected by:
- uneven symbol freshness
- stale series
- limited OOS trade count
- workbook-based historical storage limitations

### Tasks
- [ ] define canonical historical storage policy
- [ ] define what stays rebuildable vs warehouse-backed
- [ ] design Supabase history tables for candle storage / retrieval
- [ ] define dataset-versioning logic for historical expansions
- [ ] decide whether Sheets remains a derived/control surface only
- [ ] document how M2 should evolve once Supabase becomes historical backbone

### Success condition
Historical research quality is no longer constrained primarily by Sheets.

---

## Workstream H — Worker Contract Formalization

### Goal
Move from descriptive AI roles toward machine-readable bounded worker contracts.

### Status
Emerging priority

### Tasks
- [ ] define worker contract schema
- [ ] define authority fields
- [ ] define artifact IO fields
- [ ] define trigger/invocation rules
- [ ] map existing worker roles into contract form
- [ ] define which contracts are advisory only vs operationally callable

### Success condition
AI/bot labor is governed by explicit contracts rather than chat interpretation alone.

---

## Immediate Priorities

### Now
- keep active experiment run stable
- continue documenting architecture reality
- capture current findings durably
- avoid destabilizing the active runner

### This week
- clean dead trigger noise
- audit missing-document dependency
- continue code/docs mirroring into GitHub
- define Supabase historical data migration outline
- begin worker contract schema drafting

### Later
- deepen datasets further if needed
- formalize dataset tagging
- plan Python migration in concrete slices
- expand machine-readable contract infrastructure

---

## Things Explicitly Deferred

- full Python rewrite now
- replacing robust modules just because they are large
- giant PDF uploads as primary continuity mechanism
- overbuilding AI features before persistence and contracts are cleaner
- destabilizing active research for cosmetic cleanup

---

## Current Biggest Risk

The biggest risk is not missing code.

The biggest risk is:
**knowledge and state fragmentation across chats, Sheets, properties, runtime, and human memory.**

A closely related risk is:
**historical data quality/storage becoming the limiting factor on research truth.**

This tracker exists to reduce both risks.

---

## Current Biggest Opportunity

The machine is already real.

If persistence is solved properly, the project gains:
- continuity
- compounding understanding
- less drift
- less re-explanation tax
- stronger future migration path
- cleaner bounded automation
- fairer empirical evaluation through better data architecture

That is the whole point of this migration.
