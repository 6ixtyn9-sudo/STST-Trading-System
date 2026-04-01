# AI WORKER JOBS

This document defines the intended AI labor force for the $T$T system.

The goal is not to use AI as one vague oracle.
The goal is to assign bounded, specialized work.

---

## Core Principle

AI workers should have:
- clear scope
- bounded inputs
- fixed output contracts
- minimal drift
- no hidden authority over constitutional rules

AI should support:
- research interpretation
- memory
- planning
- governance review
- execution clarity
- debugging clarity
- runtime integrity

AI should not become:
- unbounded execution
- truth authority
- config authority
- silent override layer
- substitute for empirical evidence

AI should also reduce process ambiguity.

---

## Current Strategic Direction

The project now has a clearer distinction between:

### A. Single-Worker Utility Tasks
These are bounded tasks where one worker is enough:
- summarization
- context pack creation
- module registration
- artifact explanation
- migration note drafting

### B. Deliberative Multi-Worker Tasks
These are judgment-heavy tasks where a structured council pattern is useful:
- candidate review
- deployment readiness interpretation
- bounded governance critique
- strategy maintenance review

This distinction matters because not every AI task should become a 3+1 deliberation.

---

## Current Deliberative Pattern

The current active deliberative pattern is:

1. three initial worker judgments
2. three cross-reviews
3. one supervisor synthesis

Current operational role set:
- Risk Officer
- Strategy Scout
- Quant Auditor
- Council Supervisor

This pattern is currently used for:
- candidate review of persisted backtests

It is not yet generalized across all worker types.

---

# Worker Categories

- Memory Workers
- Research Workers
- Governance Workers
- Operations Workers
- Migration Workers
- Runtime Integrity Workers

---

# MEMORY WORKERS

## Worker: Project Archivist

### Mission
Summarize and persist important project state.

### Inputs
- current project docs
- recent decisions
- recent experiment outcomes
- current run state
- current system mode

### Outputs
- project snapshot summaries
- chunk summaries
- update suggestions for:
  - `PROJECT_STATE`
  - `DECISIONS`
  - `DATASETS`
- “what changed since last snapshot”

### Current status
Defined, not yet part of the active deliberative council pattern.

---

## Worker: Module Registrar

### Mission
Maintain the module registry.

### Inputs
- module source files
- architecture docs
- observed changes
- migration notes
- runtime audit findings when relevant

### Outputs
- module summaries
- changed role notes
- migration relevance notes
- dependency updates
- “module impact if patched” notes

### Current status
Defined, not yet part of the active deliberative council pattern.

---

## Worker: Context Pack Builder

### Mission
Build a compact task-specific context pack before a new work session.

### Inputs
- task type
- module list
- docs list
- recent project snapshot
- relevant experiment data
- current mode

### Outputs
- “load this into the next chat” briefing packet
- task-scoped references only
- minimal required memory pack

### Current status
Defined, not yet part of the active deliberative council pattern.

---

# RESEARCH WORKERS

## Worker: Strategy Taxonomist

### Mission
Define and maintain strategy family meanings.

## Worker: Mirror Interpreter

### Mission
Explain what inverted families are becoming conceptually.

## Worker: Family Comparator

### Mission
Compare strategy families empirically.

## Worker: Experiment Designer

### Mission
Design the next experiment wave.

## Worker: Edge Curator

### Mission
Track promising candidate edges without declaring victory too early.

### Current note
These workers remain important, but are not yet the current active M10 deliberative implementation focus.

---

# GOVERNANCE WORKERS

## Worker: Risk Officer

### Mission
Conservative review of candidate deployment eligibility.

### Inputs
- governance packet
- policy packet
- experiment metrics
- diagnostics
- relevant risk facts

### Outputs
- bounded approve/reject rationale
- explicit risk objections
- “not yet safe” reasons

### Current status
Active in current deliberative council pattern.

---

## Worker: Strategy Scout

### Mission
Opportunity-oriented review of candidate strategic attractiveness.

### Inputs
- experiment facts
- diagnostics
- governance packet
- policy packet

### Outputs
- bounded approve/reject rationale
- upside case
- where further validation is justified

### Current status
Active in current deliberative council pattern.

---

## Worker: Quant Auditor

### Mission
Empirical legitimacy review.

### Inputs
- OOS metrics
- hard policy packet
- experiment payload
- walk-forward evidence
- persistence evidence

### Outputs
- bounded approve/reject rationale
- empirical weaknesses
- minimum further proof required

### Current status
Active in current deliberative council pattern.

---

## Worker: Council Supervisor

### Mission
Synthesize worker outputs into one final bounded decision.

### Inputs
- fact pack
- governance packet
- policy packet
- initial worker outputs
- cross-review worker outputs

### Outputs
- final bounded decision
- summary of strongest arguments
- summary of rejected arguments
- explicit acknowledgment of policy constraints

### Important boundary
The supervisor is still subordinate to:
- M1
- M8
- M9
- fail-closed policy

### Current status
Active in current deliberative council pattern.

---

## Worker: Gate Maintenance Auditor

### Mission
Continuously review whether approved/live-eligible strategies still deserve approval.

### Current status
Conceptually important, not yet part of the active implemented deliberative pattern.

---

# OPERATIONS WORKERS

## Worker: Runner Monitor

### Mission
Observe long experiment runs and summarize runner health.

## Worker: Dashboard Narrator

### Mission
Translate dashboard and scanner state into plain-English ops summaries.

## Worker: Alert Triage Assistant

### Mission
Sort alerts by urgency and likely root cause.

### Current note
These remain useful worker definitions, but are not yet the active M10 implementation priority.

---

# MIGRATION WORKERS

## Worker: Data Expansion Planner

### Mission
Design better historical data acquisition and canonical rebuild strategy.

## Worker: Python Migration Planner

### Mission
Plan staged migration away from slow Apps Script heavy lifting.

## Worker: Storage Architect

### Mission
Decide what should be warehoused, what should be rebuildable, and what should be cached.

### Current note
These workers are still strategically relevant, especially as persistence grows, but are not yet in the active deliberative runtime path.

---

# RUNTIME INTEGRITY WORKERS

## Worker: Runtime Integrity Auditor

### Mission
Verify that the runtime environment actually matches the intended code and execution context.

## Worker: Execution Path Auditor

### Mission
Determine whether the system executed the intended path.

## Worker: Launch Discipline Enforcer

### Mission
Ensure experiments, audits, and maintenance are launched through safe and unambiguous entry points.

## Worker: Patch Hygiene Auditor

### Mission
Keep patches minimal, explicit, and non-duplicative.

## Worker: Mode Switch Coordinator

### Mission
Move the system cleanly between modes.

### Current note
These are valuable bounded worker definitions, but they remain future candidates for stronger formalization rather than current broad implementation scope.

---

# Output Discipline

Every worker should prefer:
- short structured outputs
- explicit next actions
- clear refusal on missing facts
- references to named docs / modules / datasets
- explicit do-not-do-yet warnings where relevant

Avoid:
- vibes
- grand speeches
- invented facts
- hidden assumptions
- unbounded recommendations

---

# Worker Interaction Rules

Workers should not silently overstep into each other’s domain.

Examples:
- the Experiment Designer may propose a run, but does not launch it
- the Project Archivist may summarize state, but does not declare empirical truth
- the Risk Officer may reject a candidate, but does not override constitutional authority
- the Council Supervisor may synthesize worker reasoning, but does not override hard policy

---

# Current V1 Implementation Rule

The current active worker implementation scope is intentionally narrow.

Current focus:
- candidate review council
- durable step persistence
- resumable orchestration

Why:
- this delivers a real persistence win without expanding into uncontrolled worker sprawl

This is deliberate scope discipline.

---

# Future Direction

The next maturity steps may include:
- broader machine-readable contracts
- more worker-specific persistence artifacts
- cleaner prompt/runtime loading
- stronger non-council worker operationalization

But current priority remains:

**make the bounded deliberative council technically real, durable, targeted, and resumable before expanding worker complexity elsewhere.**
