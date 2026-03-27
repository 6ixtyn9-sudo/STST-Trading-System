# HOME GUIDE

This file explains how the $T$T project home is organized.

---

## Purpose

The project no longer relies on chat sessions as its primary memory.

This repository and its linked Supabase database are the durable home of the system.

The current direction is:
- GitHub for code and meaning
- Supabase for structured/queryable memory
- Sheets for operational surface
- Apps Script for current control plane
- future machine-readable contracts for bounded bot labor

---

## What lives where

### GitHub
GitHub is the home for:
- code
- architecture docs
- migration docs
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
- future expanded historical data storage

If something is structured/queryable memory, it should live there.

---

### Google Sheets
Sheets remain the operational surface for:
- dashboards
- experiment visibility
- current workflow controls
- current Apps Script runtime integration

Sheets are the control room, not the permanent archive.

Sheets are also no longer an ideal long-history warehouse for the scale of research now being run.

---

### Apps Script
Apps Script remains the current control plane:
- orchestration
- wrappers
- triggers
- current module runtime

It is part of the house, but not the entire house.

---

## Working Rule

If something matters and exists only in chat, it is not persistent enough.

Every important thing should be recorded in either:
- GitHub
- Supabase
- or both

---

## Current House Rooms

### `/docs`
Human-readable project meaning

### `/apps-script`
Source snapshots of Apps Script modules

### `/sql`
Database schema and seed files

### `/snapshots`
Project state snapshots

### `/prompts`
Council role prompts

### `/python`
Future migration staging area

---

## Current Workflow

### For code changes
- update Apps Script as needed
- mirror important source changes into GitHub

### For architectural decisions
- update `docs/DECISIONS.md`
- optionally insert into `decision_log`

### For new project state
- update `docs/PROJECT_STATE.md`
- optionally insert into `project_snapshots`

### For dataset changes
- update `docs/DATASETS.md`
- update `dataset_registry`

### For module changes
- update `docs/MODULE_REGISTRY.md`
- update `module_registry`

### For AI worker evolution
- update `docs/AI_WORKER_JOBS.md`
- eventually define machine-readable worker contract files
- keep worker scope/authority explicit

---

## Important Reminder

This house does not need to be perfect on day one.

The goal is:
- durable continuity
- less drift
- less re-explanation
- stronger future migration
- clearer runtime discipline
- cleaner artifact ownership

Perfection can come later.
Persistence comes first.

---

## Current Strategic Note

The machine is already real.

The most important current home-building work is now:
- reducing chat dependence
- reducing Sheets dependence for historical storage
- making project memory durable
- making worker/bot labor bounded through clearer contracts

---

## Current Practical Update

The active research machine now has a real fresh-data bridge:

- Python / Colab performs historical rebuild work
- Supabase stores canonical market history
- Apps Script reads canonical history from Supabase for current fresh-data research paths
- Sheets remain the dashboard/control surface

This is the first materially real reduction in dependence on workbook-only historical storage.
