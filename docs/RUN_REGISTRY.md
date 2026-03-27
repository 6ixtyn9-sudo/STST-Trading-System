# RUN REGISTRY

This file tracks major research / experiment runs as named assets.

Runs should be treated as durable research events, not temporary activity.

For each important run, record:
- run name
- date
- status
- launcher
- purpose
- families
- universe / cohort logic
- dataset context
- result summary
- important caveats

---

## `EDGE_CLARITY_V1`

### Date
2026-03-24 to 2026-03-25 era

### Status
Completed

### Launcher
`RUN_experimentMatrix_resumableStart(...)`

### Runner
`RUN_experimentMatrix_resumableContinue`

### Total Jobs
416

### Purpose
Broad edge search / family clarity sweep

### Result
No OOS-passing strategy found

### Important Read
- broad search completed
- strongest surviving family frontier leaned toward:
  - `LOOSE_MOMO_LONG | INVERTED_MIRROR`
  - `FAKEOUT_SHORT`
- native long continuation families broadly weak

### Caveats
- family scope was broader than later persistence work
- older segmentation logic was cruder than later curated cohort framework
- older dataset context was weaker than the current fresh-data baseline

---

## `PERSISTENCE_HUNT_V1`

### Date
2026-03-25 era

### Status
Completed / superseded

### Launcher
`RUN_experimentMatrix_resumableStart(...)`

### Runner
`RUN_experimentMatrix_resumableContinue`

### Purpose
Narrow persistence test using strongest families under segmentation logic available at that time

### Families
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Universe Logic
Older segmentation:
- `MAJORS_ONLY`
- `BTC_ONLY`
- `ETH_ONLY`
- `MAJORS_EX_BTC_ETH`

### Main Result
No OOS passes

### Important caveat
This run was directionally useful, but later audit showed the underlying M9 resolver was still too crude / name-bucket oriented.

---

## `PERSISTENCE_HUNT_V2`

### Date
2026-03-26 era

### Status
Completed / superseded as fresh-data baseline by V3

### Launcher
`START_PERSISTENCE_HUNT_V2()`

### Runner
`RUN_experimentMatrix_resumableContinue`

### Total Jobs
240

### Purpose
Curated persistence hunt using:
- corrected family shortlist
- corrected curated cohort universe selection
- suppression-focused neighborhood

### Families
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Cohorts
- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`
- `HARD_FILTER_ALL`
- `PERP_CORE`
- `SPOT_CORE`

### Current strongest read from that phase
- best cohort: `TOP_SPS_WITH_DOGE`
- best family: `LMI`
- best near-miss rows often failed only on:
  - `MaxDD_Days`
  - `Sharpe`

### Important caveats
- interpreted against the older mixed-freshness dataset context
- not the cleanest fresh-data baseline anymore

---

## `PERSISTENCE_HUNT_V3`

### Date
2026-03-27 active era

### Status
Active

### Launcher
`START_PERSISTENCE_HUNT_V3()`

### Runner
`RUN_experimentMatrix_resumableContinue`

### Total Jobs
240

### Purpose
Fresh-data persistence hunt using:
- Supabase-backed canonical history
- USDT-only spot/perp universe
- V3 payoff overlay framework
- two-phase experiment structure

### Families
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Cohorts
- `TOP_SPS_WITH_DOGE`
- `TOP_SPS_CORE`
- `HARD_FILTER_ALL`

### Dataset Context
`OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

### Experiment Structure

#### Phase 1
- CONTROL
- TIME_STOP
- TIME_STOP + TAIL_CLAMP
- TIME_STOP + FULL_EXIT
- TIME_STOP + FULL_EXIT + TAIL_CLAMP

#### Phase 2
- center-exit plumbing / bounded proxy modes
- center-exit + tail-clamp variants
- center-exit + full-exit variants

### Current early read
The earliest V3 rows are the most promising experiment posture observed so far.

Current notable pattern:
- some rows fail only on `OOS_Total_Trades < 20`
- while showing strong PF / expectancy / Sharpe and low drawdown

### Important caveats
- 4H history depth in the active fresh dataset remains shallower than ideal
- richer OOS metrics are not yet fully surfaced in the `EXPERIMENTS` sheet
- this is the cleanest current persistence baseline, but not yet the final “perfect deep-history” dataset

---

## Rule

A run is a named research artifact.

It should not be discussed only by memory or by row fragments.
