AI WORKER JOBS
This document defines the intended AI labor force for the $T$T system.

The goal is not to use AI as one vague oracle.
The goal is to assign bounded, specialized work.

Core Principle
AI workers should have:

clear scope
bounded inputs
fixed output contracts
minimal drift
no hidden authority over constitutional rules
AI should support:

research
interpretation
memory
planning
governance review
execution clarity
debugging clarity
runtime integrity
AI should not become:

unbounded execution truth
config authority
silent override layer
substitute for empirical evidence
AI should also reduce process ambiguity.

AI workers should help prevent:

running the wrong function
reading the wrong log
mixing audit mode with production mode
launching experiments with unintended defaults
accumulating duplicate / obsolete helper functions
relying on chat memory when durable state should exist elsewhere
AI must improve:

execution clarity
launch discipline
debugging discipline
code hygiene
project continuity
Worker Categories
Memory Workers
Research Workers
Governance Workers
Operations Workers
Migration Workers
Runtime Integrity Workers
MEMORY WORKERS
Worker: Project Archivist
Mission
Summarize and persist important project state.

Inputs
current project docs
recent decisions
recent experiment outcomes
current run state
current system mode
Outputs
project snapshot summaries
chunk summaries
update suggestions for PROJECT_STATE / DECISIONS / DATASETS
“what changed since last snapshot”
Good use cases
end-of-day summaries
post-run state capture
pre-new-chat briefing packs
recovering from context-window loss
Worker: Module Registrar
Mission
Maintain the module registry.

Inputs
module source files
architecture docs
observed changes
migration notes
runtime audit findings when relevant
Outputs
module summaries
changed role notes
migration relevance notes
dependency updates
“module impact if patched” notes
Worker: Context Pack Builder
Mission
Build a compact task-specific context pack before a new work session.

Inputs
task type
module list
docs list
recent project snapshot
relevant experiment data
current mode (research / audit / migration / incident)
Outputs
“load this into the next chat” briefing packet
task-scoped references only
minimal required memory pack
RESEARCH WORKERS
Worker: Strategy Taxonomist
Mission
Define and maintain strategy family meanings.

Inputs
strategy names
family docs
inversion interpretations
experiment observations
Outputs
strategy family taxonomy
family definitions
what each family needs to see
category assignment
future family proposals
Good use cases
fakeout vs breakout interpretation
inversion meaning
family ontology
Worker: Mirror Interpreter
Mission
Explain what inverted families are becoming conceptually.

Inputs
native family definition
inverted family results
experiment behavior
Outputs
interpretation of whether inversion reveals:
fakeout
fade
exhaustion
trap
continuation failure
Good use cases
“Is inverted breakout really fakeout short?”
“What is loose momo inverted actually doing?”
Worker: Family Comparator
Mission
Compare strategy families empirically.

Inputs
experiment logs
family labels
mirrored labels
metrics
fail reasons
Outputs
family rankings
least-dead shortlist
repeated failure modes
native vs inverted comparison
Good use cases
family leaderboard
near-miss concentration
deciding what to deprioritize
Worker: Experiment Designer
Mission
Design the next experiment wave.

Inputs
completed experiment results
family shortlist
current dataset state
runtime constraints
current persistence bottleneck
Outputs
next experiment plan
narrowed parameter scope
family-specific rerun structure
symbol segmentation plan
chosen persistence lever
Good use cases
avoid another giant broad brute-force wave
design sharper follow-up runs
move from “search” to “persistence hunt”
Worker: Edge Curator
Mission
Track promising candidate edges without declaring victory too early.

Inputs
family rankings
repeated patterns
OOS behavior
degradation notes
regime concentration observations
Outputs
candidate watchlist
“less bad” list
“requires deeper validation” list
“not worth further search” list
GOVERNANCE WORKERS
Worker: Risk Officer
Mission
Conservative review of candidate deployment eligibility.

Inputs
governance packet
evaluation packet
metrics
diagnostics
current governance state
Outputs
bounded approve/reject rationale
explicit risk objections
“not yet safe” reasons
Worker: Strategy Scout
Mission
Opportunity-oriented review of candidate strategic attractiveness.

Inputs
experiment facts
DQS summary
diagnostics
governance packet
Outputs
bounded approve/reject rationale
upside case
where further validation is justified
Worker: Quant Auditor
Mission
Empirical legitimacy review.

Inputs
OOS metrics
hard policy packet
experiment payload
walk-forward evidence
persistence evidence
Outputs
bounded approve/reject rationale
empirical weaknesses
minimum further proof required
Worker: Gate Maintenance Auditor
Mission
Continuously review whether approved/live-eligible strategies still deserve approval.

Inputs
strategy lifecycle state
rolling validation results
recent maintenance metrics
governance state
Outputs
keep active
reduce confidence
quarantine
retire recommendation
Why this matters
This worker is critical for perpetual gate maintenance.

OPERATIONS WORKERS
Worker: Runner Monitor
Mission
Observe long experiment runs and summarize runner health.

Inputs
execution logs
timeout events
progress state
latest experiment index
trigger state
Outputs
runner health summary
whether the system is progressing or truly stalled
whether a problem is:
true runner failure
trigger failure
wrong execution path
stale state confusion
post-run improvement notes
Worker: Dashboard Narrator
Mission
Translate dashboard and scanner state into plain-English ops summaries.

Inputs
M7 dashboard state
alerts
margin fraction
position state
Outputs
concise operator summary
risk posture summary
watchpoints
Worker: Alert Triage Assistant
Mission
Sort alerts by urgency and likely root cause.

Inputs
alert logs
current system state
recent execution context
current mode
Outputs
what matters now
what can wait
likely cluster causes
whether alert is operational, research, or infrastructure-related
MIGRATION WORKERS
Worker: Data Expansion Planner
Mission
Design better historical data acquisition and canonical rebuild strategy.

Inputs
current dataset state
gaps in history
source limitations
future experiment requirements
Outputs
source options
target date range
canonical rebuild plan
dataset versioning suggestions
Why this matters
Data quality outranks clever prompting.

Worker: Python Migration Planner
Mission
Plan staged migration away from slow Apps Script heavy lifting.

Inputs
module registry
runtime pain points
experiment latency
persistence goals
Outputs
migration order
service candidates
what stays in Sheets
what moves first
Worker: Storage Architect
Mission
Decide what should be warehoused, what should be rebuildable, and what should be cached.

Inputs
dataset strategy
Supabase limits
experiment scale
reproducibility requirements
Outputs
storage policy
canonical vs raw retention policy
warehouse recommendations
RUNTIME INTEGRITY WORKERS
Worker: Runtime Integrity Auditor
Mission
Verify that the runtime environment actually matches the intended code and execution context.

Inputs
execution logs
symbol existence checks
trigger inventory
property inventory
runtime audit functions
selected function name
current mode
Outputs
runtime health summary
missing/visible symbol report
duplicate/obsolete execution path warnings
“safe to proceed / unsafe to proceed” decision
Good use cases
function exists but constants appear missing
top-level code autostarts unexpectedly
selected function does not match executed function
trigger contamination vs manual execution confusion
Worker: Execution Path Auditor
Mission
Determine whether the system executed the intended path.

Inputs
stack trace
execution log
active triggers
selected function
recent code patches
Outputs
actual entry path used
intended entry path
mismatch explanation
next isolation step
Good use cases
“I ran ping but start function executed”
“Why did this log come from a different path?”
“Was this trigger-driven or manual?”
“Is top-level code hijacking execution?”
Worker: Launch Discipline Enforcer
Mission
Ensure experiments, audits, and maintenance are launched through safe and unambiguous entry points.

Inputs
requested task
launcher functions
experiment builder state
runtime constraints
current system mode
Outputs
approved launch command
preview step requirement
“do not run loose expressions” warning
exact function to execute next
Good use cases
experiment launch
persistence hunts
maintenance cycles
runtime audits
Key rule
This worker should strongly prefer:

named launch functions
preview-before-start
one-entry-point-per-task
Worker: Patch Hygiene Auditor
Mission
Keep patches minimal, explicit, and non-duplicative.

Inputs
existing source file
proposed patch
duplicate function candidates
temporary debug helpers
obsolete launchers
Outputs
replace list
delete list
keep list
temporary-vs-permanent code classification
Good use cases
“don’t bloat the codebase”
“which old function should be removed now?”
“what debug helpers should be deleted after use?”
“is this patch operationally necessary or just convenient?”
Worker: Mode Switch Coordinator
Mission
Move the system cleanly between:

normal operations mode
experiment mode
audit mode
migration mode
incident/debug mode
Inputs
current issue
current governance state
active triggers
active run state
recent failures
Outputs
declared current mode
next allowed actions
prohibited actions until mode is cleared
exit criteria for returning to normal mode
Good use cases
after confusing runtime failures
before launch of a major experiment
before maintenance / migration
after autostart / trigger contamination incidents
Why this matters
A lot of wasted time happens when the system is half in:

experiment mode
and half in debug mode
This worker prevents that.

Output Discipline
Every worker should prefer:

short structured outputs
tables
JSON when needed
references to named docs / modules / datasets
explicit next actions
explicit do-not-do-yet warnings when relevant
Avoid:

vibes
grand speeches
invented facts
hidden assumptions
unbounded recommendations
For debugging / runtime workers
Prefer outputs in this shape:

What actually happened
What should have happened
Why they differed
What exact function to run next
What not to run yet
This is important because ambiguity compounds fast in execution debugging.

Worker Interaction Rules
Workers should not silently overstep into each other’s domain.

Examples:

the Experiment Designer may propose a next run, but the Launch Discipline Enforcer decides the safe launch path
the Project Archivist may summarize runtime issues, but the Runtime Integrity Auditor determines whether runtime is healthy
the Patch Hygiene Auditor may recommend deleting wrappers or helpers, but the Mode Switch Coordinator may require them temporarily during audit mode
the Quant Auditor may reject a candidate edge, but cannot rewrite governance thresholds silently
Future Direction
This AI labor force should eventually support:

perpetual experimentation
perpetual validation
perpetual gate maintenance
persistent project memory
faster research iteration
safer live deployment decisions
perpetual runtime integrity checking
safer experiment launching
lower ambiguity during debugging
explicit mode switching between audit / run / repair / deploy
Because a persistent project is not only one that remembers research —
it is one that reliably knows what it is currently doing.

Strategic Summary
The intended AI evolution inside the $T$T system is:

not one giant oracle
not one agent with hidden power
not AI as substitute for empirical truth
Instead:

many bounded workers
explicit scopes
explicit outputs
persistent memory support
safer experimentation
safer governance
safer debugging
safer launch discipline
That is the intended operating model of AI inside the $T$T system.
