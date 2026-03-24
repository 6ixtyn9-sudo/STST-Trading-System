# HOME GUIDE

This file explains how the $T$T project home is organized.

---

## Purpose

The project no longer relies on chat sessions as its primary memory.

This repository and its linked Supabase database are the durable home of the system.

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

If something is structured/queryable memory, it should live there.

---

### Google Sheets
Sheets remain the operational surface for:
- dashboards
- experiment visibility
- current workflow controls
- current Apps Script runtime integration

Sheets are the control room, not the permanent archive.

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

---

## Important Reminder

This house does not need to be perfect on day one.

The goal is:
- durable continuity
- less drift
- less re-explanation
- stronger future migration

Perfection can come later.
Persistence comes first.
