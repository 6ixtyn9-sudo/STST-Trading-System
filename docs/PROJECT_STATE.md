# PROJECT STATE

## Date
2026-04-01

## Current Phase
**Python-Based Strategy Validation + Deliberative Council Persistence + Micro-Live Readiness**

The project is in a hybrid state where:
- Python is the active research and candidate-selection runtime
- Supabase is the durable structured memory layer
- Apps Script remains active as a control/governance/orchestration surface
- M10 has now been upgraded into a resumable deliberative council path

This is still not broad live deployment.
It is a governed transition phase:
- validated strategy candidate exists
- persistence has materially improved
- deliberation is now durable and resumable
- activation permission is still more restrictive than candidate review

---

## Current Reality

### System status
- Core modules M1–M10 still exist and remain the architecture frame.
- Python remains active for:
  - V7 / V8 / V9 strategy validation
  - friction-aware testing
  - leverage-cap-aware testing
  - deploy-bundle generation
  - live monitoring scaffolding
- Supabase remains active for:
  - experiment logs
  - diagnostic notes
  - project snapshots
  - deploy/risk artifacts
  - council deliberations
  - deliberation step history
- Apps Script remains active for:
  - constitutional control
  - governance surfaces
  - M10 orchestration
  - Sheets-connected operational surfaces

---

## Current Strategy Status

### Lead family
`BREAKOUT_LONG`

### Champion
`TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL | F2_MED | LEV3`

### Backup
`TOP_SPS_WITH_DOGE | D2_A | P1_BASE | T1_OPEN | F2_MED | LEV3`

### Current V9 sanity rerun reference
- backtest_id: `bt_8e24c2cd59f9ce9fa6e9128400b8d1c7`
- run_name: `V9_SANITY_RERUN_CHAMPION`

### Persisted V9 sanity rerun metrics
- OOS trades: `866`
- PF: `1.6007207495283173`
- ExpR: `0.23946111614681695`
- Sharpe: `1.124384528563206`
- strict gate result: failed
- strict fail reason:
  - `OOS_MaxDD_Days(174)>120`

### Current interpretation
The selected champion remains:
- economically credible
- appropriate for shadow / micro-live validation posture
- not a strict research-grade scale-up pass

The dominant unresolved weakness remains:
- prolonged underwater duration / drawdown duration

---

## Current M10 / Council Reality

### New reality
M10 is no longer only:
- a pending deliberation creator
- a three isolated votes launcher
- a thin finalizer

It now has a **deliberative council path** that supports:
- targeted review of a specific persisted backtest
- three initial worker judgments
- three cross-reviews
- one supervisor synthesis
- durable step persistence in Supabase
- resumable trigger-driven execution to avoid Apps Script timeout

### Current implemented review target
The council can now review a specific persisted backtest rather than blindly consuming the last Sheets experiment row.

This was a critical fix because the older “latest sheet row” behavior pointed council review at stale Apps Script-era persistence-hunt rows rather than the actual Python-led champion candidate.

### Important current operational truth
The deliberative council pipeline is working technically.

The current main blocker is no longer architecture plumbing.
It is now:
- provider quota / rate-limit handling on OpenRouter free tier

---

## Current Governance Understanding

### Important distinction now made explicit
The project currently has two different governance questions:

#### 1. Candidate Review
Question:
- does this strategy deserve promotion into shadow / micro-live validation posture?

This should be governed by:
- empirical quality
- strategy legitimacy
- friction realism
- bounded governance context

It should **not** be hard-rejected just because:
- mood journal entries are incomplete
- capital acknowledgment was not checked
- leverage acknowledgment was not checked

Those are activation-layer concerns, not candidate-legitimacy concerns.

#### 2. Go-Live Activation Review
Question:
- is the machine/operator/runtime actually permitted to activate live behavior right now?

This should be governed by:
- runtime state
- telemetry
- kill switch
- activation checklist
- human/operator readiness constraints where they still exist

### Current status
This distinction is now partially implemented conceptually and should continue to be enforced more clearly.

---

## Current Data / Persistence Reality

### Current active candidate review substrate
- dataset_id: `CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V1`

### Persistence improvements now real
Durable memory now includes:
- experiment log persistence
- diagnostic note persistence
- snapshot persistence
- deploy bundle persistence
- live risk rules persistence
- deliberation step persistence

### New persistence truth
If a council step matters, it should now be reconstructable later.

That means durable review is no longer only:
- final decision columns

It now also includes:
- per-worker step history

---

## Current Bottlenecks

The bottlenecks are now:

1. clean separation between:
   - candidate review policy
   - activation/go-live policy

2. OpenRouter rate-limit handling for resumable deliberation

3. trigger hygiene / resumable orchestration discipline

4. continued doc/runtime alignment while hybrid architecture remains active

5. avoidance of split-brain between:
   - Python/Supabase truth
   - older Sheets-last-row assumptions

---

## Immediate Priorities

1. Clean up M8 policy semantics:
   - candidate review vs activation review
2. Harden M10 resumable council flow:
   - trigger cleanup
   - 429/backoff handling
3. Keep council targeting specific persisted backtests, not latest sheet row
4. Continue improving durable artifact persistence
5. Only after that, continue shadow / micro-live operational validation

---

## Not Priorities Right Now

- broad new family search
- cosmetic prompt expansion for every worker role
- broad YAML contract rollout everywhere
- broad live activation
- leverage expansion
- pretending the champion is fully production-proven
- returning to sheet-tail as the canonical review source

---

## Strategic Summary

The machine has advanced again.

Current reality is now best described as:

- Python-led strategy validation
- Supabase-backed durable memory
- Apps Script governance/orchestration still active
- M10 deliberative council pipeline now technically working
- candidate review and actual activation review now recognized as separate governance layers
- main unresolved strategic risk remains drawdown duration / prolonged underwater time

Current mission:

**stabilize the candidate-review governance path, harden resumable deliberation, preserve persistence gains, and continue treating micro-live readiness as a governed validation posture rather than full deployment proof.**
