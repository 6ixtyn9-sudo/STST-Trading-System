PROJECT STATE

## Date
2026-03-25

## Current Phase
**Research Machine Stabilization + Persistence Hunt Execution**

The project is no longer in bootstrap idea-stage.  
It is now an operating research machine with working resumable experimentation, improved runtime integrity, and an active narrow persistence-hunt run.

---

## Current Reality

### System status
- Core modules M1–M10 exist.
- Experiment matrix runner is active and resumable.
- Rescue-trigger timeout recovery is implemented.
- Supabase persistence is live for experiment logging.
- Full diagnostic blob persistence has been added to experiment logging.
- AI council scaffolding exists.
- Governance state exists.
- Research and execution are both real subsystems.
- Runtime integrity and launch discipline have materially improved.

### Main bottleneck
The core bottleneck is no longer “can the system run?”

The bottleneck is now:

- persistent project memory
- canonical code/document home still incomplete
- architecture meaning still too dependent on human memory
- dataset / run / decision registries not yet fully formalized
- edge persistence still unproven even though the research machine is now functioning

---

## Current Stack

- Google Sheets
- Apps Script
- Supabase
- OpenRouter
- GitHub (intended canonical home, not yet fully completed)

---

## Current Experiment Status

### Prior completed run
- **Run name:** `EDGE_CLARITY_V1`
- **Runner:** `RUN_experimentMatrix_resumableContinue`
- **Total jobs:** `416`
- **Status:** completed
- **Result:** no OOS-passing strategy found

### Current active run
- **Run name:** `PERSISTENCE_HUNT_V1`
- **Runner:** `RUN_experimentMatrix_resumableContinue`
- **Launch path:** canonical via `RUN_experimentMatrix_resumableStart(...)`
- **Variant mode:** `PERSISTENCE_HUNT`
- **Status:** active

### Operational note
Apps Script timeouts are still a real platform constraint, but the resumable runner is now materially hardened:
- state persists
- rescue trigger exists
- continuation trigger exists
- jobs resume
- Supabase inserts continue
- accidental top-level autostart contamination was discovered and removed
- runtime audit confirmed M9 constants/functions are now visible in the same execution context

This is now a controlled speed constraint, not a broken architecture.

---

## Current Data Status

### Canonical history
Observed canonical history coverage:
- approximately **14 symbols ready**
- roughly **9251–9252 4H candles**
- roughly **1542 1D candles**
- start around **2021-12-31**
- end around **2026-03-21**

### Universe scope
Current focus is:
- crypto
- spot + perps
- majors-oriented baseline
- segmented persistence testing now includes:
  - `MAJORS_ONLY`
  - `BTC_ONLY`
  - `ETH_ONLY`
  - `MAJORS_EX_BTC_ETH`

---

## Current Research Read

### Completed broad experiment conclusion
`EDGE_CLARITY_V1` completed without producing an OOS-passing strategy.

### Strongest empirical frontier so far
The most promising family cluster remains:
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Broad signal
Base long families are generally weak under current gates.

### Strong recurring pattern
Inverted mirror and explicit short/trap-style families are less bad and more promising than native long continuation families.

This is not deployment proof, but it is a meaningful empirical pattern and is now the basis for the active persistence hunt.

### Common failure reasons
Most rows still fail due to:
- insufficient OOS trade count
- poor OOS Sharpe / weak path quality
- excessive OOS drawdown duration / long time underwater

This suggests some candidates may be structurally interesting but not yet persistent.

---

## Current Persistence Hunt

### Objective
Test whether the strongest near-miss families become more persistent when the universe is segmented instead of blended.

### Families under test
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Persistence lever selected
- **Universe segmentation**

### Segments under test
- `MAJORS_ONLY`
- `BTC_ONLY`
- `ETH_ONLY`
- `MAJORS_EX_BTC_ETH`

### Strategic reason
This run is designed to test whether long drawdown duration and poor Sharpe are being caused partly by edge dilution across the wrong symbols.

---

## Current Persistence Status

### Already persistent
- experiment logs in Supabase
- DQS summaries in Supabase
- diagnostic blobs in Supabase experiment logs
- some council deliberations in Supabase
- runtime state in Sheets
- runtime state in Script/Document Properties
- resumable experiment state with rescue-trigger protection

### Not yet sufficiently persistent
- codebase canon
- architecture docs canon
- module registry
- project decision registry
- dataset registry
- run registry
- chat-derived understanding still not fully externalized into canonical documents

---

## Important Runtime Lessons Captured

### Resolved issues
- hard timeout continuation vulnerability materially improved with rescue-trigger pattern
- phantom execution confusion traced to a top-level autostart invocation
- M9 runtime visibility confusion traced and resolved through runtime integrity audit and corrected execution hygiene
- canonical launch discipline improved: experiments must be launched via explicit named function calls, not loose code snippets

### New rule
No top-level executable statements should exist in the project.  
Only:
- declarations
- object literals
- function bodies

No file should auto-launch experiments on load.

---

## Immediate Priorities

1. Let `PERSISTENCE_HUNT_V1` run to completion
2. Capture post-run project snapshot
3. Compare segmented universe results to identify strongest edge bucket
4. Formalize run registry
5. Formalize dataset registry
6. Formalize module registry
7. Continue moving code/docs toward canonical GitHub home
8. Stop treating PDFs/chats as primary continuity layer

---

## Not Priorities Right Now

Do **not** treat these as immediate:
- full Python rewrite
- replacing robust existing modules for no reason
- broad new brute-force family sweeps
- overbuilding AI automation before memory is cleaner
- giant PDF uploads as continuity strategy

---

## Short Strategic Summary

The machine is alive.  
The runtime is now much more trustworthy.  
The broad search is complete.  
The narrow persistence hunt is running.

Current mission:
**make the system remember itself durably, and determine whether the short-side near-miss edge becomes more persistent when segmented by universe.**

---
