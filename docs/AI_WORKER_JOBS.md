# AI WORKER JOBS

This document defines the intended AI labor force for the $T$T system.

The goal is not to use AI as one vague oracle.
The goal is to assign bounded, specialized work that strengthens the actual house.

The house is now organized through **Spine-7**.

That means every meaningful worker should strengthen one or more of these pillars:

1. Research
2. Persistence
3. Observation
4. Gating
5. Governance
6. Documentation
7. Orchestration

If a proposed worker does not clearly strengthen a Spine-7 pillar, it is probably scope creep.

---

## Core Principle

AI workers should have:
- clear scope
- bounded inputs
- fixed output contracts
- minimal drift
- no hidden authority over constitutional rules
- explicit Spine-7 relevance

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
- worker sprawl without architecture value

AI should also reduce process ambiguity.

---

## Current Rule

A worker should be justified by at least one of:

- it strengthens a Spine-7 pillar materially
- it closes a known continuity gap
- it reduces ambiguity in an active workflow
- it produces durable artifacts that matter later

If not, do not build it yet.

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

# Spine-7 Worker Mapping

---

## 1. Research Pillar Workers

### Purpose
Strengthen empirical truth, strategy maintenance, and research continuity.

### Candidate workers
- Strategy Taxonomist
- Mirror Interpreter
- Family Comparator
- Experiment Designer
- Edge Curator
- Quant Auditor

### Current active implementation
- **Quant Auditor** is active in the deliberative council

### Current non-active but valid future workers
- Strategy Taxonomist
- Mirror Interpreter
- Family Comparator
- Experiment Designer
- Edge Curator

### Rule
Research workers must remain subordinate to M9 empirical truth.

They may interpret evidence.
They may not manufacture evidence.

---

## 2. Persistence Pillar Workers

### Purpose
Make project truth durable, queryable, and less chat-dependent.

### Candidate workers
- Project Archivist
- Module Registrar
- Context Pack Builder

### Current active implementation
- no broad persistence worker is fully operationalized yet
- parts of M10 and human process currently cover this function

### High-value future direction
Persistence workers are among the most justified future expansions because they directly reduce continuity loss.

### Rule
Persistence workers should produce durable artifacts, not just ephemeral summaries.

---

## 3. Observation Pillar Workers

### Purpose
Help the system know what runtime is actually doing now.

### Candidate workers
- Runner Monitor
- Dashboard Narrator
- Alert Triage Assistant

### Current active implementation
- not yet broadly operationalized

### Why these matter
Observation gaps create fake confidence.
Workers here are justified if they make runtime state more visible and less ambiguous.

### Rule
Observation workers may summarize runtime state.
They may not invent missing telemetry.

---

## 4. Gating Pillar Workers

### Purpose
Strengthen lawful yes/no decision boundaries around action.

### Candidate workers
- Runtime Integrity Auditor
- Launch Discipline Enforcer
- pre-trade-guard-oriented bounded helper roles

### Current active implementation
- gating logic itself exists in runtime code
- AI workers here are still mostly conceptual

### Important note
This pillar is highly sensitive.
Workers here must remain advisory unless explicitly bounded otherwise.

### Rule
No gating worker may weaken fail-closed behavior.

---

## 5. Governance Pillar Workers

### Purpose
Interpret candidate legitimacy and bounded restriction.

### Candidate workers
- Risk Officer
- Strategy Scout
- Quant Auditor
- Council Supervisor
- Gate Maintenance Auditor

### Current active implementation
- **Risk Officer** — active
- **Strategy Scout** — active
- **Quant Auditor** — active
- **Council Supervisor** — active

### Current deliberative pattern
1. three initial worker judgments
2. three cross-reviews
3. one supervisor synthesis

### Rule
Governance workers must not override:
- M1
- M8 activation state
- M9 empirical truth
- fail-closed policy

---

## 6. Documentation Pillar Workers

### Purpose
Keep written truth aligned with runtime truth.

### Candidate workers
- Project Archivist
- Module Registrar
- Context Pack Builder
- documentation drift checker (future)

### Current active implementation
- mostly human-driven today

### Why this pillar matters
Documentation drift is a real failure mode in a hybrid system.
If docs lie, future sessions inherit false architecture.

### Rule
Documentation workers should update or recommend updates to existing canon before multiplying new artifacts.

---

## 7. Orchestration Pillar Workers

### Purpose
Strengthen continuity across multi-step, resumable, hybrid workflows.

### Candidate workers
- Runner Monitor
- Launch Discipline Enforcer
- Mode Switch Coordinator
- Patch Hygiene Auditor
- Execution Path Auditor

### Current active implementation
- orchestration logic is mostly still runtime/human-managed
- workerization here remains mostly future-scope

### Why this matters
Orchestration failure creates:
- duplicate runs
- stuck deliberations
- accidental fallbacks
- chaos under quotas and timeouts

### Rule
Orchestration workers should reduce confusion and continuity loss, not add meta-process overhead.

---

# Worker Groups

## Persistence / Memory Workers

### Worker: Project Archivist
**Primary pillar:** Persistence  
**Secondary pillars:** Documentation

#### Mission
Summarize and persist important project state.

#### Inputs
- current project docs
- recent decisions
- recent experiment outcomes
- current run state
- current system mode

#### Outputs
- project snapshot summaries
- chunk summaries
- update suggestions for:
  - `PROJECT_STATE`
  - `DECISIONS`
  - `DATASETS`
- “what changed since last snapshot”

#### Current status
Defined, not yet part of the active deliberative council pattern.

---

### Worker: Module Registrar
**Primary pillar:** Documentation  
**Secondary pillars:** Persistence

#### Mission
Maintain the module registry.

#### Inputs
- module source files
- architecture docs
- observed changes
- migration notes
- runtime audit findings when relevant

#### Outputs
- module summaries
- changed role notes
- migration relevance notes
- dependency updates
- “module impact if patched” notes

#### Current status
Defined, not yet part of the active deliberative council pattern.

---

### Worker: Context Pack Builder
**Primary pillar:** Persistence  
**Secondary pillars:** Documentation

#### Mission
Build a compact task-specific context pack before a new work session.

#### Inputs
- task type
- module list
- docs list
- recent project snapshot
- relevant experiment data
- current mode

#### Outputs
- “load this into the next chat” briefing packet
- task-scoped references only
- minimal required memory pack

#### Current status
Defined, not yet part of the active deliberative council pattern.

---

## Research Workers

### Worker: Strategy Taxonomist
**Primary pillar:** Research  
**Secondary pillars:** Documentation

#### Mission
Define and maintain strategy family meanings.

#### Current status
Conceptually valid, not currently active in M10 runtime.

---

### Worker: Mirror Interpreter
**Primary pillar:** Research

#### Mission
Explain what inverted families are becoming conceptually.

#### Current status
Conceptually valid, not currently active in M10 runtime.

---

### Worker: Family Comparator
**Primary pillar:** Research

#### Mission
Compare strategy families empirically.

#### Current status
Conceptually valid, not currently active in M10 runtime.

---

### Worker: Experiment Designer
**Primary pillar:** Research  
**Secondary pillars:** Orchestration

#### Mission
Design the next experiment wave.

#### Current status
Conceptually valid, not currently active in M10 runtime.

---

### Worker: Edge Curator
**Primary pillar:** Research  
**Secondary pillars:** Persistence

#### Mission
Track promising candidate edges without declaring victory too early.

#### Current status
Conceptually valid, not currently active in M10 runtime.

---

## Governance Workers

### Worker: Risk Officer
**Primary pillar:** Governance  
**Secondary pillars:** Gating

#### Mission
Conservative review of candidate deployment eligibility.

#### Inputs
- governance packet
- policy packet
- experiment metrics
- diagnostics
- relevant risk facts

#### Outputs
- bounded approve/reject rationale
- explicit risk objections
- “not yet safe” reasons

#### Current status
Active in current deliberative council pattern.

---

### Worker: Strategy Scout
**Primary pillar:** Governance  
**Secondary pillars:** Research

#### Mission
Opportunity-oriented review of candidate strategic attractiveness.

#### Inputs
- experiment facts
- diagnostics
- governance packet
- policy packet

#### Outputs
- bounded approve/reject rationale
- upside case
- where further validation is justified

#### Current status
Active in current deliberative council pattern.

---

### Worker: Quant Auditor
**Primary pillar:** Research  
**Secondary pillars:** Governance

#### Mission
Empirical legitimacy review.

#### Inputs
- OOS metrics
- hard policy packet
- experiment payload
- walk-forward evidence
- persistence evidence

#### Outputs
- bounded approve/reject rationale
- empirical weaknesses
- minimum further proof required

#### Current status
Active in current deliberative council pattern.

---

### Worker: Council Supervisor
**Primary pillar:** Governance  
**Secondary pillars:** Orchestration

#### Mission
Synthesize worker outputs into one final bounded decision.

#### Inputs
- fact pack
- governance packet
- policy packet
- initial worker outputs
- cross-review worker outputs

#### Outputs
- final bounded decision
- summary of strongest arguments
- summary of rejected arguments
- explicit acknowledgment of policy constraints

#### Important boundary
The supervisor is still subordinate to:
- M1
- M8
- M9
- fail-closed policy

#### Current status
Active in current deliberative council pattern.

---

### Worker: Gate Maintenance Auditor
**Primary pillar:** Governance  
**Secondary pillars:** Research

#### Mission
Continuously review whether approved/live-eligible strategies still deserve approval.

#### Current status
Conceptually important, not yet part of the active implemented deliberative pattern.

---

## Observation / Operations Workers

### Worker: Runner Monitor
**Primary pillar:** Observation  
**Secondary pillars:** Orchestration

#### Mission
Observe long experiment runs and summarize runner health.

#### Current status
Conceptually useful, not yet active runtime priority.

---

### Worker: Dashboard Narrator
**Primary pillar:** Observation  
**Secondary pillars:** Documentation

#### Mission
Translate dashboard and scanner state into plain-English ops summaries.

#### Current status
Conceptually useful, not yet active runtime priority.

---

### Worker: Alert Triage Assistant
**Primary pillar:** Observation

#### Mission
Sort alerts by urgency and likely root cause.

#### Current status
Conceptually useful, not yet active runtime priority.

---

## Migration Workers

### Worker: Data Expansion Planner
**Primary pillar:** Persistence  
**Secondary pillars:** Research

#### Mission
Design better historical data acquisition and canonical rebuild strategy.

#### Current status
Strategically relevant, not yet active runtime priority.

---

### Worker: Python Migration Planner
**Primary pillar:** Orchestration  
**Secondary pillars:** Documentation

#### Mission
Plan staged migration away from slow Apps Script heavy lifting.

#### Current status
Strategically relevant, not yet active runtime priority.

---

### Worker: Storage Architect
**Primary pillar:** Persistence  
**Secondary pillars:** Documentation

#### Mission
Decide what should be warehoused, what should be rebuildable, and what should be cached.

#### Current status
Strategically relevant, not yet active runtime priority.

---

## Runtime Integrity / Gating / Orchestration Workers

### Worker: Runtime Integrity Auditor
**Primary pillar:** Gating  
**Secondary pillars:** Observation

#### Mission
Verify that the runtime environment actually matches the intended code and execution context.

#### Current status
Conceptually valuable, not yet active runtime priority.

---

### Worker: Execution Path Auditor
**Primary pillar:** Orchestration  
**Secondary pillars:** Gating

#### Mission
Determine whether the system executed the intended path.

#### Current status
Conceptually valuable, not yet active runtime priority.

---

### Worker: Launch Discipline Enforcer
**Primary pillar:** Orchestration  
**Secondary pillars:** Gating

#### Mission
Ensure experiments, audits, and maintenance are launched through safe and unambiguous entry points.

#### Current status
Conceptually valuable, not yet active runtime priority.

---

### Worker: Patch Hygiene Auditor
**Primary pillar:** Orchestration  
**Secondary pillars:** Documentation

#### Mission
Keep patches minimal, explicit, and non-duplicative.

#### Current status
Conceptually valuable, not yet active runtime priority.

---

### Worker: Mode Switch Coordinator
**Primary pillar:** Orchestration  
**Secondary pillars:** Governance

#### Mission
Move the system cleanly between modes.

#### Current status
Conceptually valuable, not yet active runtime priority.

---

# Current Active Council Workers

These are the currently active and justified AI workers in the implemented M10 path.

| worker_id | role | primary_pillar | secondary_pillars | current_status |
|---|---|---|---|---|
| risk_officer | conservative candidate risk review | governance | gating | active |
| strategy_scout | strategic attractiveness review | governance | research | active |
| quant_auditor | empirical legitimacy review | research | governance | active |
| council_supervisor | bounded final synthesis | governance | orchestration | active |

---

# Current Non-Council Worker Candidates

These remain valid, but are not yet broad implementation priority.

| worker | primary_pillar | why it may matter later |
|---|---|---|
| project_archivist | persistence | reduces context loss across sessions |
| module_registrar | documentation | keeps module truth durable |
| context_pack_builder | persistence | compresses future working context |
| runner_monitor | observation | improves long-run visibility |
| alert_triage_assistant | observation | clarifies ops urgency |
| runtime_integrity_auditor | gating | checks runtime truth against intended state |
| launch_discipline_enforcer | orchestration | reduces accidental bad launches |
| gate_maintenance_auditor | governance | supports ongoing maintenance review |

---

# Output Discipline

Every worker should prefer:
- short structured outputs
- explicit next actions
- clear refusal on missing facts
- references to named docs / modules / datasets
- explicit do-not-do-yet warnings where relevant
- bounded claims tied to a real pillar contribution

Avoid:
- vibes
- grand speeches
- invented facts
- hidden assumptions
- unbounded recommendations
- worker activity with no durable architecture value

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
- this delivers a real continuity win
- this strengthens governance without uncontrolled worker sprawl
- this keeps worker growth subordinate to Spine-7

This is deliberate scope discipline.

---

# Worker Design Rules

## Rule 1
No worker without a clear Spine-7 justification.

## Rule 2
No worker should exist only because the role sounds interesting.

## Rule 3
If a human/operator can do the task trivially and the artifact does not persist, workerization is lower priority.

## Rule 4
Workers should produce durable value:
- stronger interpretation
- stronger continuity
- stronger visibility
- stronger bounded governance
- stronger orchestration clarity

## Rule 5
Workers must remain subordinate to:
- M1 constitutional authority
- M8 governance authority
- M9 empirical truth
- fail-closed system behavior

---

# Expansion Rule

Before adding a new worker, ask:

1. Which Spine-7 pillar does it strengthen?
2. What existing gap does it close?
3. What artifact will it produce?
4. Why is this better than updating an existing worker or doc?
5. Does this reduce ambiguity, or just create more moving parts?

If those answers are weak, do not build it yet.

---

# Future Direction

The worker system may expand later.

But expansion should follow this order:

1. workers that strengthen persistence
2. workers that strengthen observation
3. workers that strengthen gating
4. workers that strengthen orchestration
5. only then broader role expansion if still justified

That order aligns with Spine-7 rollout priority.

---

# Summary

The worker system exists to strengthen the house, not decorate it.

Current active priority remains:

- bounded deliberative council
- durable step persistence
- resumable governance flow
- anti-drift scope discipline

Spine-7 is now the test for whether a worker deserves to exist.
