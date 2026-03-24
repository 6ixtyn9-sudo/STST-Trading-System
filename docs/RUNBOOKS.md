# RUNBOOKS

This file contains practical operating runbooks for common workflows.

---

## Runbook: Start a large experiment matrix

### Goal
Start a resumable research matrix safely.

### Steps
1. Confirm canonical history is healthy
2. Confirm current dataset assumptions are understood
3. Confirm experiment scope and maxJobs
4. Start matrix using the intended runner
5. Monitor `EXPERIMENTS`, Apps Script executions, and Supabase inserts
6. Do not mutate core assumptions mid-run unless necessary

### Success condition
- state is saved
- jobs run
- timeouts recover
- experiment rows append
- Supabase logging continues

---

## Runbook: Observe timeout event during active matrix

### Goal
Determine whether the run is broken or merely paused.

### Steps
1. Check Apps Script execution history
2. Check whether a continuation trigger was scheduled
3. Check experiment index progress
4. Check whether recent experiment rows still reached Sheets/Supabase
5. If resuming correctly, do not panic-patch

### Interpretation
A timeout is acceptable if:
- state persists
- continuation resumes
- no silent duplication or reset occurs

---

## Runbook: Persist current project state

### Goal
Prevent loss of important context.

### Steps
1. Update `docs/PROJECT_STATE.md`
2. Add a new row to `project_snapshots`
3. Add important architectural decisions to `docs/DECISIONS.md`
4. Add structured decision rows to `decision_log`
5. If a major dataset changed, update `docs/DATASETS.md` and `dataset_registry`

### Success condition
A future session can reconstruct current project state without relying on chat memory.

---

## Runbook: Add a new module or major module revision

### Goal
Keep module understanding durable.

### Steps
1. Add/update source files in GitHub
2. Update `docs/MODULE_REGISTRY.md`
3. Update `module_registry` row in Supabase
4. If module role changed materially, update `docs/ARCHITECTURE.md`
5. Record important rationale in `docs/DECISIONS.md`

### Success condition
Module meaning exists outside your head.

---

## Runbook: Add a new dataset state

### Goal
Keep research comparability honest.

### Steps
1. Give the dataset a clear ID
2. Update `docs/DATASETS.md`
3. Insert/update `dataset_registry`
4. Note scope, date range, source, and symbol count
5. Mention dataset ID when interpreting major experiments

### Success condition
Experiment results can be traced back to explicit data assumptions.

---

## Runbook: Convene the council

### Goal
Create durable advisory review for an experiment.

### Steps
1. Push latest experiment payload to Supabase
2. Create pending council deliberation
3. Build governance fact pack
4. Run council votes
5. Finalize decision
6. Persist deliberation outcome

### Important
Council is advisory and bounded.
Hard policy must remain fail-closed.

---

## Runbook: Before changing anything important mid-run

### Ask
1. Will this contaminate comparability?
2. Will this affect active matrix assumptions?
3. Is this a true emergency or just optimization temptation?
4. Can it wait until after the run?

### Rule
If not urgent:
**wait until error or completion**
