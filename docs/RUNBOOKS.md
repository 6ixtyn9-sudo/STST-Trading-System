# RUNBOOKS

This file contains practical operating runbooks for common workflows.

The project is in a hybrid phase:
- Apps Script remains part of the control/governance surface
- Python is active for research, candidate selection, and pre-live runtime scaffolding

Runbooks must reflect actual runtime reality, not stale project memory.

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

## Runbook: Convene candidate-review council on a specific persisted backtest

### Goal
Review the intended strategy candidate rather than whatever happens to be the last sheet row.

### Why this runbook exists
The older “latest row” path can accidentally target stale Apps Script-era rows.

Current review should prefer:
- specific persisted `backtest_id`
- specific Python-led candidate row
- explicit intended experiment target

### Steps
1. Identify the intended `backtest_id` from `experiment_logs`.
2. Confirm it is the correct candidate row.
3. Start council review through the specific-backtest path.
4. Allow the resumable trigger-driven council runner to process one step at a time.
5. Inspect `council_deliberation_steps` for progress.
6. Inspect `council_deliberations` for summary decision.

### Current preferred example
Current champion review target:
- `bt_8e24c2cd59f9ce9fa6e9128400b8d1c7`

### Success condition
Council reviews the intended persisted candidate row, not an accidental stale sheet-tail row.

---

## Runbook: Run resumable deliberative council safely

### Goal
Avoid Apps Script timeout during multi-step council review.

### Rule
Do not run the entire council in one execution if the path is already stepwise/resumable.

### Correct pattern
1. Create pending deliberation for specific backtest.
2. Process one step.
3. Let time-driven resume trigger continue remaining steps.
4. Inspect status rather than relaunching manually in panic.

### Important
The current canonical resumable path is:
- start explicit specific-backtest review
- then allow `RUN_ResumeDeliberativeCouncilNow()` to continue

Do not rely on an old all-in-one runner for large multi-step council work.

### Success condition
Council review completes without timeout by spreading work across multiple executions.

---

## Runbook: Respond to OpenRouter rate limit during council review

### Trigger
Resume trigger or manual council step fails with:
- `429`
- free-model daily limit exhausted
- provider quota exceeded

### Steps
1. Confirm that the failure is quota-related, not code-related.
2. Do not duplicate deliberations blindly.
3. Inspect whether partial deliberation steps already exist.
4. Resume later after quota resets, or switch provider/model policy if approved.
5. Prefer resuming the same deliberation rather than creating a new duplicate unless there is a reason to abandon it.

### Success condition
Council review is resumed or deferred cleanly, not restarted chaotically.

---

## Runbook: Before changing anything important mid-run

### Ask
1. Will this contaminate comparability?
2. Will this change active assumptions?
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

## Runbook: Drift check before major work

### Goal
Prevent repo and runtime from diverging.

### Ask
1. Does the doc state still match runtime truth?
2. Has Python become more active than docs admit?
3. Has the strategy lifecycle advanced?
4. Has the active review target shifted from sheet-tail to persisted backtest?
5. Are migration and governance docs still truthful?

### If yes
Update docs before continuing architecture-heavy work.

### Success condition
Project truth is written down before it decays into memory drift.
