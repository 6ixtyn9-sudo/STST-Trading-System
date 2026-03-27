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
- governance state exists
- active run continuation is proven in unattended operation
- fresh canonical candles now exist in Supabase
- Apps Script can read canonical history from Supabase
- M2 canonical history gate can use the Supabase-backed dataset
- M9 actual 4H backtest loader can use the Supabase-backed dataset
- active V3 run is using the fresh Supabase-backed canonical dataset

### Not yet true enough
- code is not fully housed in GitHub
- docs are not yet complete everywhere
- project state still lives too much in chats
- module registry is not yet formally stored everywhere it should be
- richer OOS reporting is not yet surfaced cleanly
- machine-readable worker contracts do not yet exist
- deeper 4H history may still be desirable
- Python migration plan is understood, but not yet staged concretely as primary runtime

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
- [x] Add RUNBOOKS
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
In progress / materially advanced

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
- [x] create canonical candle storage tables
- [x] create dataset coverage tables
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
Partial / improved

### Tasks
- [ ] reduce reliance on `M9_DIAG_*` property blobs
- [x] ensure DQS summary is externally persisted
- [ ] clarify ALL vs OOS metrics in reporting
- [x] version important experiment contexts via dataset identity
- [ ] log dataset ID alongside all major experiment surfaces consistently
- [ ] create reproducibility notes for major runs

### Success condition
Research history is durable, queryable, and interpretable without guessing.

---

## Workstream D — Dataset Governance

### Goal
Treat datasets as named assets.

### Status
Active

### Tasks
- [x] establish DATASETS doc
- [x] insert dataset_registry rows
- [x] define active fresh dataset identity
- [x] separate legacy and fresh dataset contexts
- [x] remove ZAR from canonical research/live universe
- [ ] record future deeper-history expansions explicitly
- [ ] record future 4H augmentation explicitly
- [ ] tag all major runs consistently with dataset ID

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
- [x] create `python/README.md`
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
Active / phase 1 materially achieved

### Why this matters
Historical research interpretation was being distorted by:
- uneven symbol freshness
- stale series
- workbook-based historical storage limitations
- hidden dataset ambiguity

### Achieved
- fresh canonical candles stored in Supabase
- active USDT-only spot/perp dataset established
- Apps Script bridge to canonical history works
- M9 actual backtest load path uses the active Supabase-backed dataset
- V3 launched on fresh canonical dataset

### Remaining tasks
- define phase-2 deeper 4H augmentation if needed
- reduce remaining workbook dependence in downstream paths
- enrich historical retrieval governance and versioning
- clarify what remains warehouse-backed vs rebuildable long term

### Success condition
Historical research quality is no longer constrained primarily by Sheets, and future deeper-history augmentation is explicit rather than hidden.

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
- keep active `PERSISTENCE_HUNT_V3` stable
- monitor fresh-data V3 behavior
- preserve comparability
- avoid destabilizing the active runner

### This week
- capture V3 findings durably
- enrich OOS reporting visibility after run or safe pause
- continue code/docs mirroring into GitHub
- prepare post-run pruning plan for legacy bootstrap and stale source logic

### Later
- deepen 4H history if needed
- formalize worker contracts
- continue migration toward cleaner service boundaries

---

## Things Explicitly Deferred

- full Python rewrite now
- replacing robust modules just because they are large
- giant PDF uploads as primary continuity mechanism
- overbuilding AI features before persistence and contracts are cleaner
- destabilizing active research for cosmetic cleanup

---

## Current Biggest Risk

The biggest risk is no longer simple code absence.

The biggest risks are now:
- knowledge and state fragmentation across chats, Sheets, properties, runtime, and human memory
- richer OOS visibility lagging behind the quality of current experiments
- deeper 4H history becoming the next limiting factor on final persistence truth

---

## Current Biggest Opportunity

The machine is already real.

Now that the fresh-data path is working, the project gains:
- continuity
- cleaner comparability
- less stale-data distortion
- stronger empirical trust
- better foundation for later pruning and migration
- a much fairer chance to evaluate whether V3 truly improves persistence

That is the point of this migration.
