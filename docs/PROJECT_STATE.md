# PROJECT STATE

## Date
2026-03-24

## Current Phase
**Research Machine Stabilization + Persistence Transition**

The project is no longer in bootstrap idea-stage.  
It is now an operating research machine with growing persistence infrastructure.

---

## Current Reality

### System status
- Core modules M1–M10 exist.
- Experiment matrix runner is active and resumable.
- Supabase persistence is live for experiment logging.
- AI council scaffolding exists.
- Governance state exists.
- Research and execution are both real subsystems.

### Main problem
The core bottleneck is no longer “can the system run?”

The bottleneck is:

- fragmented memory
- dead chat context
- PDF ingestion unreliability
- code not yet living in a durable canonical home
- architecture meaning still too dependent on human memory

---

## Current Stack

- Google Sheets
- Apps Script
- Supabase
- OpenRouter
- GitHub (new canonical home)

---

## Current Experiment Status

### Active run
- **Run name:** `EDGE_CLARITY_V1`
- **Runner:** `RUN_experimentMatrix_resumableContinue`
- **Total jobs:** `416`
- **Observed progress:** around `102 / 416`
- **Behavior:** resumable, survives timeouts, continues via trigger scheduling

### Operational note
Apps Script timeouts are occurring, but the resumable runner is functioning correctly:
- state persists
- continuation triggers are scheduled
- jobs resume
- Supabase inserts continue

This is a speed constraint, not a fatal architecture failure.

---

## Current Data Status

### Canonical history
Observed canonical history coverage:
- approximately **14 symbols ready**
- roughly **9251–9252 4H candles**
- roughly **1542 1D candles**
- start around **2021-12-31**
- end around **2026-03-21**

This is materially better than the earlier shallower history state.

### Universe scope
Current focus is:
- crypto
- spot + perps
- majors-oriented baseline, with broader research seed / bootstrap machinery existing in M2/M2B

---

## Current Research Read

### Broad signal so far
Base long families are generally weak under current gates.

### Strong recurring pattern
Inverted mirror variants often look **less bad** than their original long-side versions.

This is not deployment proof, but it is a meaningful empirical pattern and should be tracked as a research direction.

### Common failure reasons
Most rows still fail due to:
- insufficient OOS trade count
- poor OOS Sharpe
- excessive OOS drawdown duration

This suggests some candidates may be “interesting but not yet robust.”

---

## Current Persistence Status

### Already persistent
- experiment logs in Supabase
- council deliberations in Supabase
- diagnostics in Supabase
- some runtime state in Sheets
- some state in Script Properties

### Not yet sufficiently persistent
- codebase
- architecture docs
- module registry
- project decisions
- dataset registry
- chat-derived understanding

---

## Immediate Priorities

1. Create GitHub repo as canonical code/doc home
2. Add project-brain tables to Supabase
3. Create module registry
4. Create dataset registry
5. Create project snapshots
6. Stop treating PDFs/chats as primary memory
7. Keep current experiment run stable while persistence layer is formalized

---

## Not Priorities Right Now

Do **not** treat these as immediate:
- full Python rewrite
- replacing robust existing modules for no reason
- overbuilding AI automation before memory is clean
- giant PDF uploads as project continuity strategy

---

## Short Strategic Summary

The machine is alive.  
The project home is not fully built yet.

Current mission:
**make the system remember itself durably.**
