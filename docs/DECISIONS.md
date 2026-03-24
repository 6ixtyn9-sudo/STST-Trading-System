# DECISIONS

This file records important architectural and operational decisions for the $T$T system.

---

## 2026-03-24 — Persistence becomes top priority

**Area:** architecture / project continuity  
**Status:** active

### Decision
The project’s primary bottleneck is no longer raw execution capability or strategy experimentation.

The new top priority is **persistent project memory**.

### Why
The system has grown beyond what can be reliably carried by:
- chat context
- PDF uploads
- ad hoc explanations
- Script Properties as semi-memory
- Google Sheets as the only long-term memory surface

The project now needs a real home for:
- code
- docs
- module roles
- project state
- dataset state
- decisions
- experiment history

### Consequence
Work is now organized around building a permanent project home:
- **GitHub** for code and docs
- **Supabase** for structured project memory
- **Sheets** only as the live control/dashboard surface

---

## 2026-03-24 — GitHub becomes canonical code and docs home

**Area:** persistence / source of truth  
**Status:** active

### Decision
GitHub is the canonical home for:
- module source files
- architecture documentation
- project state docs
- migration tracker
- prompt files
- project snapshots in file form

### Why
Apps Script editor alone is not sufficient as a long-term code home because:
- it is not a good documentation environment
- it is not a good diff/review environment
- it is not a good architectural memory system
- it does not solve dead-chat continuity

### Consequence
All meaningful project prose and code snapshots should be mirrored into GitHub.

If something matters and only exists in chat, it is not durable enough.

---

## 2026-03-24 — Supabase becomes project memory layer

**Area:** persistence / data architecture  
**Status:** active

### Decision
Supabase is the persistent structured memory layer for:
- experiment logs
- diagnostic notes
- council deliberations
- module registry
- decision log
- dataset registry
- project snapshots
- active todos
- future chunked knowledge records

### Why
Sheets hit practical scale and continuity limits.
Document Properties are useful as glue, but weak as durable knowledge storage.

Supabase is better suited for:
- structured memory
- external persistence
- retrieval
- queryable history
- future Python/service integration

### Consequence
Important project facts should migrate out of chats and property blobs into Supabase tables.

---

## 2026-03-24 — M1 remains sovereign

**Area:** governance / architecture  
**Status:** active

### Decision
M1 remains the constitutional authority of the system.

### Why
M1 already governs:
- config truth
- changelog discipline
- credential custody
- kill switch authority
- trigger scheduling

This makes it the natural constitutional layer.

### Consequence
No AI layer, memory layer, or orchestration layer should outrank M1.
Specifically:
- AI cannot override kill switch
- Supabase is not config authority
- council logic must remain subordinate to constitutional rules

---

## 2026-03-24 — AI is advisory/governance support, not execution truth

**Area:** AI architecture  
**Status:** active

### Decision
AI is used as a bounded specialist council and advisory layer, not as direct execution truth.

### Why
Execution must remain deterministic and lawful.
AI is useful for:
- role specialization
- critique
- bounded rationale
- arbitration support

AI is not suitable as an unbounded hidden source of live execution decisions.

### Consequence
Council outputs must remain bounded by:
- governance state
- hard rules
- empirical gates
- M1 authority
- fail-closed logic

---

## 2026-03-24 — M8 is governance state, not “AI mood”

**Area:** governance  
**Status:** active

### Decision
M8 is treated as a **governance-state engine**, not as anthropomorphic AI mood control.

### Why
The system already has strong governance semantics:
- pause
- ban
- caution
- restriction
- gate validation
- go-live readiness

These are better modeled as formal system states than as personality modifiers.

### Consequence
M8 should continue to produce formal outputs like:
- NORMAL
- CAUTION
- RESTRICTED
- PAUSED

and these outputs should constrain downstream orchestration.

---

## 2026-03-24 — M9 is empirical judiciary

**Area:** research / architecture  
**Status:** active

### Decision
M9 is treated as the empirical truth layer.

### Why
M9 already governs:
- walk-forward backtests
- OOS evaluation
- DQS summary
- empirical pass/fail logic
- metrics truth

This makes it the natural judiciary / evidence layer.

### Consequence
Council and deployment logic should defer to M9 for empirical legitimacy.

---

## 2026-03-24 — Apps Script remains current control plane, not forever compute backbone

**Area:** migration planning  
**Status:** active

### Decision
Apps Script remains the current orchestration/control plane for now.

### Why
It already works.
The experiment runner is resumable and the system is alive.

### But
It has visible constraints:
- runtime ceilings
- trigger complexity
- startup overhead
- workbook coupling

### Consequence
No immediate rewrite is required, but future heavy lifting should migrate toward Python/services over time.

---

## 2026-03-24 — Existing robust modules are preserved, not casually replaced

**Area:** architecture discipline  
**Status:** active

### Decision
Existing modules that are already strong should not be replaced just because the project is being reorganized.

### Why
The main problem is persistence fragmentation, not absence of architecture.

The system already contains meaningful modules:
- M1, M2, M3, M4, M5, M6, M7, M8, M9, M10

### Consequence
Refactoring should be:
- deliberate
- documented
- persistence-first
- migration-aware

not novelty-driven.

---

## 2026-03-24 — Current research read: inverted mirrors look more promising than base longs

**Area:** research direction  
**Status:** provisional / active observation

### Decision
Current research notes should explicitly record the recurring pattern that inverted mirror variants appear less bad than base long variants.

### Why
Across the active matrix, repeated rows suggest:
- base long families are broadly weak
- inverted mirrors sometimes show improved PF / expectancy / relative behavior
- they still mostly fail current OOS gates, but are directionally more promising

### Consequence
This is not a deployment conclusion.
It is a research direction that should be preserved as a durable observation.

---

## Rule for future decisions

Every major decision should record:
- what was decided
- why it was decided
- what it affects
- whether it is provisional or active

This file exists so future work does not depend on memory luck.
