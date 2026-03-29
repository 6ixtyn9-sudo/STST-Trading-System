# PROJECT STATE

## Date
2026-03-29

## Current Phase
**Python-Based Strategy Validation + V9 Micro-Live Readiness**

The project is no longer primarily centered on Apps Script persistence-hunt experiments over the older V3 structure.

It has now advanced into a Python-driven research and pre-live phase that includes:
- expanded backtest engine work
- friction-aware execution modeling
- leverage-cap-aware sizing
- candidate strategy selection
- micro-live deployment preparation
- live governance / kill-switch scaffolding

This is not yet scaled live deployment.
It is the transition from validated research into controlled micro-live readiness.

---

## Current Reality

### System status
- Core modules M1–M10 still exist conceptually and remain valid as the project architecture.
- Python is now active for research-critical and pre-live-critical workflows.
- The backtest engine is no longer friction-blind:
  - fees are modeled
  - slippage is modeled
  - stop/TP adverse slippage is modeled
  - funding cost is modeled
  - leverage is treated as a sizing/notional cap
- V7 robustness mapping completed.
- V8 friction stress completed.
- V9 champion / backup selection completed.
- Live governance scaffolding is now real:
  - deploy bundle exists
  - champion / backup configs exist
  - live risk rules exist
  - monitoring dashboard exists
  - kill-switch evaluator exists
  - active / paused / hard-stop state handling exists
- Shadow / micro-live runtime guard work is now the next active implementation layer.

### Main bottleneck
The bottleneck is no longer:
- basic machine viability
- or whether the project can run research at all

The main bottlenecks are now:
- safe and disciplined transition into shadow / micro-live
- real telemetry and runtime protection
- operational handling of prolonged underwater periods
- preserving architectural clarity while Python becomes more active
- avoiding drift away from the phased migration plan

---

## Current Stack

### Active
- Google Sheets
- Apps Script
- Supabase
- GitHub
- OpenRouter
- Google Colab / Python

### Current role split
- **Python**: active research runtime, friction-aware backtesting, V7/V8/V9, live monitoring scaffolding
- **Supabase**: structured persistence and canonical memory / data layer
- **Apps Script**: still relevant as current control-plane / governance / dashboard layer where useful
- **GitHub**: canonical code + documentation home

---

## Current Strategy Status

### Current lead family
`BREAKOUT_LONG`

### Current champion
`TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL`

### Current backup
`TOP_SPS_WITH_DOGE | D2_A | P1_BASE | T1_OPEN`

These were selected from the actual `F2_MED + LEV3` survivor pool in V8 / V9.

---

## Current Research Status

### V7
V7 established the strongest operating neighborhood around:
- `BREAKOUT_LONG`
- `TOP_SPS_WITH_DOGE`
- `D2_A / D3_A`
- `P2_FAST / P1_BASE`
- `T1_OPEN / T2_BAL`

This confirmed a real center-of-mass rather than a one-row fluke.

### V8
V8 introduced real friction-aware and leverage-cap-aware testing.

#### V8 results
- total rows: `120`
- strict passes: `30`
- survival passes: `42`
- friction-ignored suspects: `0`

#### Key V8 conclusion
The edge survives medium friction in a narrow but credible cluster.

#### Important V8 constraint
Heavy friction (`F3_HEAVY`) effectively destroys viability.

#### Leverage conclusion
`LEV3` and `LEV5` behaved identically in the tested board.
This implies leverage above 3x is not adding practical value in the current candidate zone.

### V9
V9 selected:
- one champion
- one backup
- micro-live posture
- deploy bundle
- live risk rules

#### V9 sanity rerun on champion
- trades: `866`
- PF: `~1.60`
- ExpR: `~0.239`
- Sharpe: `~1.12`
- DD days: `174`

It failed the strict research gate only on:
- `OOS_MaxDD_Days(174)>120`

This is interpreted as:
- **good enough for micro-live validation**
- **not good enough for scaled deployment confidence**

---

## Current Risk Understanding

### Primary unresolved risk
The main unresolved live-operational weakness is:

**drawdown duration / prolonged underwater time**

This is now the dominant caution, more than leverage stress.

### Why this matters
The edge remains economically alive under medium friction, but recovery periods remain long enough to create:
- operational drag
- psychological drag
- governance pressure
- possible live deployment discomfort

This must be treated explicitly in live governance and scaling decisions.

---

## Current Deployment Posture

### Approved for
- shadow-live
- micro-live validation
- conservative runtime hardening
- telemetry / governance integration

### Not approved for
- aggressive capital deployment
- leverage expansion
- autonomous scale-up
- treating the strategy as fully production-proven

---

## Current Governance Status

### Built
- live state machine:
  - `ACTIVE`
  - `PAUSED`
  - `HARD_STOP`
- deploy bundle
- champion / backup artifacts
- live risk rules
- monitoring dashboard
- kill-switch evaluator
- pre-trade runtime guard design
- telemetry-aware entry constraints

### Current principle
No new entries should be allowed without:
- equity telemetry
- fresh governance evaluation
- active config
- ACTIVE state

---

## Current Data Status

### Important note
The project’s center of gravity has shifted away from the earlier Apps Script persistence-hunt framing.

The Python research stack is currently working from a different active dataset path than the earlier 2026-03-27 V3 framing.

### Operational truth
The project is now best understood as being in:
- Python-led strategy validation and pre-live governance buildout

rather than in:
- Apps Script-led fresh-data persistence-hunt as the dominant active frame

That older context remains historically important, but is no longer the best description of present reality.

---

## Immediate Priorities

1. Update docs so project reality matches current state.
2. Finalize runtime-safe shadow execution loop.
3. Ensure equity telemetry is present before any entries are allowed.
4. Run shadow execution using champion config.
5. Validate monitoring / governance under real runtime flow.
6. Only then consider actual micro-live activation.

---

## Not Priorities Right Now
- broad new family search
- panic rewrite of Apps Script
- cosmetic cleanup that changes active operational truth
- leverage expansion
- pretending V9 is fully live-proven
- scaled deployment

---

## Strategic Summary

The project has moved beyond broad persistence hunting and into a more operational phase.

The machine is now:
- strategy-selective
- friction-aware
- governance-aware
- pre-live capable

Most important current strategic truth:
- the edge appears real enough to survive medium friction,
- but the main unresolved risk is prolonged underwater duration,
- so the correct next move is disciplined shadow/micro-live validation rather than scale.

Current mission:

**preserve architectural clarity, enforce telemetry-aware governance, validate the selected champion in shadow/micro-live posture, and only escalate from a position of real operational evidence rather than research enthusiasm.**
