# RUNBOOKS

This file contains practical operating runbooks for common workflows.

The project is now in a hybrid phase:
- Apps Script remains part of the control/governance surface
- Python is active for research, candidate selection, and pre-live runtime scaffolding

Runbooks must reflect actual runtime reality, not older project memory.

---

## Runbook: Start a large research experiment matrix

### Goal
Start a resumable research matrix safely.

### Steps
1. Confirm the intended dataset context is understood.
2. Confirm experiment scope, families, universes, and maxJobs.
3. Confirm the active code path is the intended one.
4. Launch only through the intended named runner / entry point.
5. Monitor:
   - notebook / runner output
   - persisted results
   - checkpoint state
   - structured logging
6. Do not mutate core assumptions mid-run unless the issue is truly fatal.

### Success condition
- state is saved
- jobs progress
- timeouts or interruptions can recover
- results append durably
- no silent duplication or reset occurs

---

## Runbook: Observe a timeout or interruption during active research

### Goal
Determine whether the run is broken or merely paused / recoverable.

### Steps
1. Check current progress / last completed job.
2. Check checkpoint state and persisted output.
3. Check whether the intended continuation path exists.
4. Confirm whether recent rows were still persisted.
5. If recovery behavior is working, do not panic-patch mid-run.

### Interpretation
A timeout or interruption is acceptable if:
- state persists
- continuation is possible
- no silent reset happened
- no corruption is detected

### Rule
If the run is recoverable, preserve comparability first and patch later.

---

## Runbook: Persist current project state

### Goal
Prevent loss of important context.

### Steps
1. Update `PROJECT_STATE.md`
2. Update `DECISIONS.md` if a real decision was made
3. Add/update a snapshot in `/snapshots`
4. If datasets changed materially, update `DATASETS.md`
5. If strategy state changed materially, update `STRATEGY_LIFECYCLE.md`
6. If migration reality changed materially, update `MIGRATION_TRACKER.md`

### Success condition
A future session can reconstruct project state without relying on memory or chat.

---

## Runbook: Add a new module or major module revision

### Goal
Keep module meaning durable.

### Steps
1. Update source files in their canonical repo location.
2. Update `MODULE_REGISTRY.md`
3. If architecture meaning changed materially, update `ARCHITECTURE.md`
4. If migration relevance changed, update `MIGRATION_TRACKER.md`
5. If the change reflects a real project-level decision, update `DECISIONS.md`

### Success condition
Module meaning exists outside your head.

---

## Runbook: Add a new dataset state

### Goal
Keep research comparability honest.

### Steps
1. Give the dataset a clear ID.
2. Update `DATASETS.md`
3. Record:
   - source
   - symbol scope
   - timeframe scope
   - date range
   - quality caveats
4. Mention dataset identity when interpreting major runs.
5. If a new run depends on it, update `RUN_REGISTRY.md`.

### Success condition
Important experiment conclusions can be traced back to explicit data assumptions.

---

## Runbook: Convene the council

### Goal
Create bounded advisory review over a persisted strategy / experiment fact set.

### Steps
1. Confirm the relevant experiment or candidate facts are persisted.
2. Build the fact pack.
3. Build the governance packet.
4. Run bounded role review.
5. Record the outcome durably.
6. Do not allow council output to bypass constitutional or empirical limits.

### Important
Council is advisory and bounded.
Hard policy remains fail-closed.

---

## Runbook: Before changing anything important mid-run

### Ask
1. Will this contaminate comparability?
2. Will this change active experiment assumptions?
3. Is this a true emergency or just optimization temptation?
4. Can it wait until after completion or safe pause?

### Rule
If not urgent:
**wait until error or completion**

---

## Runbook: Start shadow-live or micro-live safely

### Goal
Begin runtime validation without entering an unsafe “ACTIVE but blind” state.

### Preconditions
- champion and backup configs exist
- deploy bundle exists
- live risk rules exist
- monitoring code is loaded
- state machine exists
- telemetry path is ready

### Required startup sequence
1. Load deploy bundle and live risk rules.
2. Confirm live state file exists and is readable.
3. Confirm active config is explicitly selected.
4. Write at least one valid equity snapshot.
5. Apply governance evaluation.
6. Confirm state is `ACTIVE`.
7. Run the pre-trade guard.
8. Only then evaluate shadow/live entries.

### Success condition
The system is not merely running — it is governable.

---

## Runbook: Before any new entry

### Goal
Prevent entries when runtime protection is blind, stale, or paused.

### Required sequence
1. Log a fresh equity snapshot.
2. Apply governance.
3. Load live state.
4. Run `can_open_new_trade()` / pre-trade guard.
5. If and only if allowed, evaluate signals or orders.

### Entry must be blocked if:
- state is not `ACTIVE`
- no active config exists
- no equity telemetry exists
- equity telemetry is stale
- governance heartbeat is stale
- hard-stop condition exists

### Success condition
No new trade is opened unless governance and telemetry are alive.

---

## Runbook: Respond to `PAUSED` state

### Goal
Handle a pause without improvisation.

### Meaning
`PAUSED` means:
- no new entries
- continue monitoring
- manage or reconcile open state if needed
- investigate cause before resuming

### Steps
1. Read `pause_reason`.
2. Confirm whether pause came from:
   - daily loss
   - rolling metrics
   - telemetry staleness
   - consecutive losses
   - underwater-duration caution
3. Do not re-activate blindly.
4. Record operator note if human intervention occurs.
5. Resume only after:
   - cause is understood
   - telemetry is healthy
   - governance allows it

### Success condition
Pause is treated as a control action, not an annoyance.

---

## Runbook: Respond to `HARD_STOP`

### Goal
Prevent a hard-stop event from being casually overridden.

### Meaning
`HARD_STOP` means:
- no new entries
- no silent resumption
- explicit human review required

### Steps
1. Read `hard_stop_reason`.
2. Stop any assumption of normal operation.
3. Confirm whether open positions or orders require reconciliation.
4. Record incident details.
5. Do not restore `ACTIVE` without explicit review and note.

### Success condition
Hard-stop remains constitutionally meaningful.

---

## Runbook: Switch champion to backup

### Goal
Move to backup configuration in a controlled way.

### Important
Do not auto-switch just because performance feels bad.

### Steps
1. Confirm the reason for considering a switch.
2. Confirm current state is not `HARD_STOP`.
3. Confirm backup config exists and is valid.
4. Record operator note.
5. Switch active config explicitly.
6. Continue with the same telemetry + governance discipline.

### Good reasons to switch
- champion paused but backup remains a legitimate candidate
- operator wants controlled fallback testing
- explicit validation plan calls for backup activation

### Bad reasons to switch
- emotional frustration
- trying to outrun governance
- avoiding documentation of the real issue

### Success condition
Fallback remains disciplined, explicit, and auditable.

---

## Runbook: Telemetry outage handling

### Goal
Prevent “ACTIVE but blind” operation.

### Trigger examples
- no equity snapshots
- stale equity snapshots
- stale governance heartbeat
- monitoring loop not updating

### Steps
1. Stop new entries.
2. Mark / preserve state appropriately.
3. Investigate telemetry path.
4. Do not resume entry logic until telemetry is restored.
5. Record the event.

### Rule
No telemetry → no trustworthy risk protection → no new entries.

---

## Runbook: Drift check before major work

### Goal
Prevent the repo and runtime from diverging.

### Ask
1. Does the doc state still match the runtime state?
2. Has Python become more active than the docs admit?
3. Has the strategy lifecycle advanced?
4. Has a new champion / backup / deployment posture emerged?
5. Are migration docs still truthful?

### If yes
Update docs before continuing architecture-heavy work.

### Success condition
Project truth is written down before it decays into memory drift.
