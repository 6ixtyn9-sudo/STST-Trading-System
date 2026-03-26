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

---

## `PERSISTENCE_HUNT_V1`

### Date
2026-03-25 era

### Status
Completed / superseded as cleaner baseline by V2

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
2026-03-26 active era

### Status
Active

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

### Current strongest read
- best cohort so far: `TOP_SPS_WITH_DOGE`
- best family so far: `LMI`
- best near-miss rows often fail only on:
  - `MaxDD_Days`
  - `Sharpe`

### Operational significance
This run also provided evidence that the resumable experiment runner now persists meaningfully in unattended use.

---

## Rule

A run is a named research artifact.

It should not be discussed only by memory or by row fragments.
