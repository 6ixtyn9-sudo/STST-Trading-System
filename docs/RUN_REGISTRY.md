# RUN REGISTRY

This file tracks major research / experiment runs as named assets.

Runs should be treated as durable research events, not temporary activity.

For each important run, record:
- run name
- date
- status
- launcher / runtime
- purpose
- families
- universe / cohort logic
- dataset context
- result summary
- important caveats

---

## Historical Persistence-Hunt Era

---

## `EDGE_CLARITY_V1`

### Date
2026-03-24 to 2026-03-25 era

### Status
Completed

### Runtime
Apps Script / resumable experiment runner

### Purpose
Broad edge search / family clarity sweep

### Result
No OOS-passing strategy found

### Important read
- broad search completed
- strongest frontier at that time leaned toward:
  - `LOOSE_MOMO_LONG | INVERTED_MIRROR`
  - `FAKEOUT_SHORT`

### Caveats
- broader family scope than later runs
- older segmentation logic
- older dataset context

---

## `PERSISTENCE_HUNT_V1`

### Date
2026-03-25 era

### Status
Completed / superseded

### Runtime
Apps Script / resumable experiment runner

### Purpose
Narrow persistence test using strongest families under the framework available at that time

### Families
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Main result
No OOS passes

### Caveats
Directionally useful, but later architecture review showed the universe resolution logic was still too crude.

---

## `PERSISTENCE_HUNT_V2`

### Date
2026-03-26 era

### Status
Completed / superseded

### Runtime
Apps Script / resumable experiment runner

### Purpose
Curated persistence hunt using corrected family shortlist and improved cohort-aware logic

### Families
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Current strongest read from that phase
- strongest cohort: `TOP_SPS_WITH_DOGE`
- strongest family cluster: `LMI`
- many near-misses failed on:
  - drawdown duration
  - Sharpe

### Caveats
Still tied to older dataset context and older project phase.

---

## `PERSISTENCE_HUNT_V3`

### Date
2026-03-27 era

### Status
Historically important fresh-data persistence phase

### Runtime
Apps Script + Supabase-backed canonical dataset path

### Purpose
Fresh-data persistence hunt using Supabase-backed canonical history and cleaner USDT spot/perp substrate

### Dataset context
`OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

### Important historical meaning
This run marked a major shift away from older workbook-heavy mixed-freshness research interpretation.

### Caveats
Historically important, but no longer the best description of the current active project phase.

---

## Python-Led Strategy Validation Era

---

## `V7_BREAKOUT_LONG_ROBUSTNESS_MAP`

### Date
2026-03-29 era

### Status
Completed

### Runtime
Python / Colab backtest engine

### Purpose
Robustness mapping of the `BREAKOUT_LONG` family across a finite board of universes, defenses, payoffs, and tunes

### Family
- `BREAKOUT_LONG`

### Universes
- `TOP_SPS_WITH_DOGE`
- `TOP_SPS_CORE`

### Result summary
V7 confirmed that the strongest operating neighborhood clustered around:
- `TOP_SPS_WITH_DOGE`
- `D2_A / D3_A`
- `P2_FAST / P1_BASE`
- `T1_OPEN / T2_BAL`

This established a real center-of-mass rather than a one-row fluke.

### Important caveat
V7 alone did not prove live viability.
It justified moving to friction-aware stress.

---

## `V8_FRICTION_STRESS_BREAKOUT_LONG`

### Date
2026-03-29 era

### Status
Completed

### Runtime
Python / Colab friction-aware backtest engine

### Purpose
Stress V7-passed `BREAKOUT_LONG` candidates under:
- realistic friction scenarios
- leverage-cap-aware sizing assumptions

### Scope
Winner-only finite board

### Friction scenarios
- `F0_NONE`
- `F1_LIGHT`
- `F2_MED`
- `F3_HEAVY`

### Leverage-cap scenarios
- `LEV3`
- `LEV5`

### Result summary
- total rows: `120`
- strict passes: `30`
- survival passes: `42`
- friction-ignored suspects: `0`

### Key conclusion
The edge survives medium friction in a narrow but credible cluster.

### Important operational read
Heavy friction destroys viability.
The dominant unresolved weakness is drawdown duration / underwater time.

### Leverage read
`LEV3` and `LEV5` were effectively identical in the tested board, implying leverage above 3x adds no practical value here.

---

## `V9_MICRO_LIVE_READINESS`

### Date
2026-03-29 era

### Status
Completed

### Runtime
Python / Colab candidate-selection + live-governance preparation layer

### Purpose
Select one champion and one backup from the medium-friction survivor pool and build micro-live deployment artifacts

### Champion
`TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL`

### Backup
`TOP_SPS_WITH_DOGE | D2_A | P1_BASE | T1_OPEN`

### Produced artifacts
- champion config
- backup config
- deploy bundle
- live risk rules
- live monitoring scaffold
- kill-switch evaluator
- runtime state model

### V9 sanity rerun summary
Champion rerun under micro-live posture remained economically strong but still failed the strict DD-duration threshold.

### Interpretation
Approved for:
- shadow-live
- micro-live validation
- conservative runtime testing

Not approved for:
- aggressive capital
- scale-up
- leverage expansion

---

## Rule

A run is a named research artifact.

It should not exist only in memory or in row fragments.
It should be durably interpretable later.
