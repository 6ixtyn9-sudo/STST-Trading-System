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
- research
- interpretation
- memory
- planning
- governance review

AI should not become:
- unbounded execution truth
- config authority
- silent override layer
- substitute for empirical evidence

---

## Worker Categories

1. **Memory Workers**
2. **Research Workers**
3. **Governance Workers**
4. **Operations Workers**
5. **Migration Workers**

---

## MEMORY WORKERS

---

## Worker: Project Archivist

### Mission
Summarize and persist important project state.

### Inputs
- current project docs
- recent decisions
- recent experiment outcomes
- current run state

### Outputs
- project snapshot summaries
- chunk summaries
- update suggestions for PROJECT_STATE / DECISIONS / DATASETS

### Good use cases
- end-of-day summaries
- post-run state capture
- pre-new-chat briefing packs

---

## Worker: Module Registrar

### Mission
Maintain the module registry.

### Inputs
- module source files
- architecture docs
- observed changes

### Outputs
- module summaries
- changed role notes
- migration relevance notes
- dependency updates

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

### Outputs
- “load this into the next chat” briefing packet

---

## RESEARCH WORKERS

---

## Worker: Strategy Taxonomist

### Mission
Define and maintain strategy family meanings.

### Inputs
- strategy names
- family docs
- inversion interpretations
- experiment observations

### Outputs
- strategy family taxonomy
- family definitions
- what each family needs to see
- category assignment
- future family proposals

### Good use cases
- fakeout vs breakout interpretation
- inversion meaning
- family ontology

---

## Worker: Mirror Interpreter

### Mission
Explain what inverted families are becoming conceptually.

### Inputs
- native family definition
- inverted family results
- experiment behavior

### Outputs
- interpretation of whether inversion reveals:
  - fakeout
  - fade
  - exhaustion
  - trap
  - continuation failure

### Good use cases
- “Is inverted breakout really fakeout short?”
- “What is loose momo inverted actually doing?”

---

## Worker: Family Comparator

### Mission
Compare strategy families empirically.

### Inputs
- experiment logs
- family labels
- mirrored labels
- metrics
- fail reasons

### Outputs
- family rankings
- least-dead shortlist
- repeated failure modes
- native vs inverted comparison

---

## Worker: Experiment Designer

### Mission
Design the next experiment wave.

### Inputs
- completed experiment results
- family shortlist
- current dataset state
- runtime constraints

### Outputs
- next experiment plan
- narrowed parameter scope
- family-specific rerun structure
- symbol segmentation plan

### Good use cases
- avoid another giant broad brute-force wave
- design sharper follow-up runs

---

## Worker: Edge Curator

### Mission
Track promising candidate edges without declaring victory too early.

### Inputs
- family rankings
- repeated patterns
- OOS behavior
- degradation notes

### Outputs
- candidate watchlist
- “less bad” list
- “requires deeper validation” list

---

## GOVERNANCE WORKERS

---

## Worker: Risk Officer

### Mission
Conservative review of candidate deployment eligibility.

### Inputs
- governance packet
- evaluation packet
- metrics
- diagnostics

### Outputs
- bounded approve/reject rationale

---

## Worker: Strategy Scout

### Mission
Opportunity-oriented review of candidate strategic attractiveness.

### Inputs
- experiment facts
- DQS summary
- diagnostics
- governance packet

### Outputs
- bounded approve/reject rationale

---

## Worker: Quant Auditor

### Mission
Empirical legitimacy review.

### Inputs
- OOS metrics
- hard policy packet
- experiment payload

### Outputs
- bounded approve/reject rationale

---

## Worker: Gate Maintenance Auditor

### Mission
Continuously review whether approved/live-eligible strategies still deserve approval.

### Inputs
- strategy lifecycle state
- rolling validation results
- recent maintenance metrics
- governance state

### Outputs
- keep active
- reduce confidence
- quarantine
- retire recommendation

This worker is critical for perpetual gate maintenance.

---

## OPERATIONS WORKERS

---

## Worker: Runner Monitor

### Mission
Observe long experiment runs and summarize runner health.

### Inputs
- execution logs
- timeout events
- progress state
- latest experiment index

### Outputs
- runner health summary
- whether the system is progressing or truly stalled
- post-run improvement notes

---

## Worker: Dashboard Narrator

### Mission
Translate dashboard and scanner state into plain-English ops summaries.

### Inputs
- M7 dashboard state
- alerts
- margin fraction
- position state

### Outputs
- concise operator summary
- risk posture summary
- watchpoints

---

## Worker: Alert Triage Assistant

### Mission
Sort alerts by urgency and likely root cause.

### Inputs
- alert logs
- current system state
- recent execution context

### Outputs
- what matters now
- what can wait
- likely cluster causes

---

## MIGRATION WORKERS

---

## Worker: Data Expansion Planner

### Mission
Design better historical data acquisition and canonical rebuild strategy.

### Inputs
- current dataset state
- gaps in history
- source limitations
- future experiment requirements

### Outputs
- source options
- target date range
- canonical rebuild plan
- dataset versioning suggestions

This worker matters because data quality outranks clever prompting.

---

## Worker: Python Migration Planner

### Mission
Plan staged migration away from slow Apps Script heavy lifting.

### Inputs
- module registry
- runtime pain points
- experiment latency
- persistence goals

### Outputs
- migration order
- service candidates
- what stays in Sheets
- what moves first

---

## Worker: Storage Architect

### Mission
Decide what should be warehoused, what should be rebuildable, and what should be cached.

### Inputs
- dataset strategy
- Supabase limits
- experiment scale
- reproducibility requirements

### Outputs
- storage policy
- canonical vs raw retention policy
- warehouse recommendations

---

## Output Discipline

Every worker should prefer:
- short structured outputs
- tables
- JSON when needed
- references to named docs / modules / datasets

Avoid:
- vibes
- grand speeches
- invented facts
- hidden assumptions

---

## Future Direction

This AI labor force should eventually support:
- perpetual experimentation
- perpetual validation
- perpetual gate maintenance
- persistent project memory
- faster research iteration
- safer live deployment decisions

That is the intended evolution of AI usage in the $T$T system.
