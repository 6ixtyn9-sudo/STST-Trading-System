# HOME GUIDE

This file explains how the project home is organized.

---

## Purpose

The project should not rely on chat sessions as primary memory.

This repository and its linked structured memory layers are the durable home of the system.

Current direction:
- GitHub for code and meaning
- Supabase for structured/queryable memory
- Sheets for dashboard / control surfaces where useful
- Apps Script as current control-plane layer
- Python as active research and pre-live runtime layer
- future machine-readable contracts for bounded bot labor

---

## What Lives Where

### GitHub
GitHub is the home for:
- code
- architecture docs
- migration docs
- strategy docs
- prompts
- SQL schema files
- snapshot files

If something is code or prose, it should live here.

---

### Supabase
Supabase is the home for:
- experiment logs
- diagnostic notes
- council deliberations
- module registry
- decision log
- dataset registry
- project snapshots
- active todos
- future chunked project knowledge
- canonical market history
- dataset coverage summaries

If something is structured/queryable memory, it should live there.

---

### Google Sheets
Sheets remain useful for:
- dashboards
- controls
- operator visibility
- lightweight operational surfaces

Sheets are the control room, not the permanent archive.

---

### Apps Script
Apps Script remains the current control-plane layer for:
- orchestration
- wrappers
- some governance/control workflows
- dashboard-connected operations where still useful

It is part of the house, but not the whole house.

---

### Python
Python is now an active runtime layer for:
- heavier backtesting
- friction-aware execution modeling
- candidate selection
- deploy-bundle generation
- live monitoring / kill-switch scaffolding
- shadow execution guard work
- ingestion / rebuild workflows where appropriate

Python is not just a future migration idea anymore.

---

## Current House Rooms

### `/apps-script`
Apps Script-side source and related runtime logic snapshots

### `/docs`
Human-readable project meaning and governance truth

### `/sql`
Schema and seed files

### `/snapshots`
Project state snapshots across major phases

### `/prompts`
Bounded council role prompts

### `/python`
Active Python runtime and migration layer

---

## Working Rule

If something matters and exists only in chat, it is not persistent enough.

Every important thing should be recorded in:
- GitHub
- Supabase
- or both

---

## Current Workflow

### For code changes
- update the actual runtime layer involved
- mirror durable code/doc meaning into GitHub
- do not let runtime reality drift away from repo truth

### For architectural decisions
- update `DECISIONS.md`
- update other affected docs if the decision changes project truth materially

### For new project state
- update `PROJECT_STATE.md`
- add/update a snapshot if the phase materially changed

### For dataset changes
- update `DATASETS.md`
- record dataset context explicitly in interpretation

### For strategy changes
- update `STRATEGY_LIFECYCLE.md`
- update `RUN_REGISTRY.md`
- update `STRATEGY_FAMILIES.md` if the active lead changed

### For runtime / governance changes
- update `GOVERNANCE_GATES.md`
- update `RUNBOOKS.md`
- keep telemetry and runtime guard rules explicit

---

## Current Strategic Note

The machine is already real.

The current home-building priority is:
- reducing chat dependence
- reducing drift between docs and runtime
- making project memory durable
- making governance operationally real
- keeping migration phased and explicit

---

## Current Practical Update

The current project is no longer best described as:
- Apps Script persistence hunting with Python only as a rebuild workbench

It is now better described as:
- a hybrid Apps Script + Python project
- with Python actively handling research and pre-live runtime work
- while Apps Script remains useful as a control/governance/dashboard layer

This is the current real house layout.

---

## Important Reminder

This house does not need to be perfect on day one.

The goal is:
- durable continuity
- less drift
- less re-explanation
- stronger migration discipline
- clearer runtime discipline
- explicit artifact ownership

Perfection can come later.
Truthful persistence comes first.
