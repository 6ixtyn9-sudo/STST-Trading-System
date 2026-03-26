# PROJECT STATE

## Date
2026-03-26

## Current Phase
**Research Machine Stabilization + Curated Persistence Hunt Execution + Durable Memory / Data Architecture Planning**

The project is no longer in bootstrap idea-stage.  
It is now an operating research machine with:

- working resumable experimentation
- materially improved runtime integrity
- a corrected curated-universe resolver
- an active narrow persistence-hunt run under real cohort selection
- growing pressure to formalize memory, contracts, and historical storage architecture

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
- Curated cohort universe selection is now working inside the actual M9 backtest path.
- The active run now continues unattended through trigger-based resumable execution.

### Main bottleneck
The core bottleneck is no longer “can the system run?”

The bottleneck is now:

- persistent project memory
- canonical code/document home still incomplete
- architecture meaning still too dependent on human memory
- dataset / run / decision registries not yet fully formalized
- historical storage still too dependent on Google Sheets
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

### Prior completed broad run
- **Run name:** `EDGE_CLARITY_V1`
- **Runner:** `RUN_experimentMatrix_resumableContinue`
- **Total jobs:** `416`
- **Status:** completed
- **Result:** no OOS-passing strategy found
- **Important caveat:** that run used weaker family targeting and pre-curated/fake universe segmentation logic, so it is still informative, but not the cleanest architecture baseline anymore.

### Current active run
- **Run name:** `PERSISTENCE_HUNT_V2`
- **Runner:** `RUN_experimentMatrix_resumableContinue`
- **Launch path:** canonical via `RUN_experimentMatrix_resumableStart(...)`
- **Variant mode:** `PERSISTENCE_HUNT_V2`
- **Total jobs:** `240`
- **Status:** active

### Operational note
Apps Script timeouts are still a real platform constraint, but the resumable runner is now materially hardened:

- state persists
- rescue trigger exists
- continuation trigger exists
- jobs resume
- Supabase inserts continue
- accidental top-level autostart contamination was previously discovered and removed
- runtime audit confirmed M9 constants/functions are visible in the same execution context
- current active run has continued even while the operator laptop was closed
- rescue/continuation behavior is now proven in practice, not just conceptually

This is now a controlled speed constraint, not a broken architecture.

---

## Current Data Status

### Canonical history
Observed canonical history coverage is still mixed and imperfect.

Typical currently observed ranges:
- approximately **14 symbols ready**
- roughly **~9250+ 4H candles** for stronger symbols
- roughly **~1542–1543 1D candles**
- start around **2021-12-31**
- some symbols current through **2026-03-26**
- some symbols are stale or partially lagging

### Important current data caveats
Not all symbols are equally current.

Observed examples during active run:
- some BTC / SOL / XRP / perp symbols extend through current date
- some symbols such as `DOGE/*`, `BNB/ZAR`, or certain ETH/XRP series may lag or truncate earlier
- this likely affects:
  - OOS trade count
  - cohort consistency
  - fairness of cross-symbol opportunity density
  - persistence interpretation

### Data architecture conclusion
Google Sheets is no longer an adequate long-history warehouse for the scale of research now being run.

Future work should move historical / canonical storage more fully into Supabase and reduce dependence on Sheets as the primary history backbone.

---

## Current Universe / Cohort Status

### Previous limitation discovered
The old segmentation logic inside M9 was found to be too crude.

It effectively relied on symbol-name substring matching such as:
- BTC
- ETH
- SOL
- XRP

This meant the old “segmentation” was directionally useful but not a true curated universe resolver.

### Major correction made
The M9 universe resolver was upgraded to support real curated cohort selection.

### Current supported curated universe modes
- `HARD_FILTER_ALL`
- `TOP_K`
- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`
- `PERP_CORE`
- `SPOT_CORE`
- `CUSTOM`

### Why this matters
This was a major architecture correction.

The project is now testing persistence on a much more defensible basis:
- hard-filter aware
- SPS/top-K aware
- spot/perp aware
- cohort aware
- custom allowlist capable

This is a materially better universe-selection framework than the old fake name-bucket segmentation.

---

## Current Research Read

### Completed broad experiment conclusion
`EDGE_CLARITY_V1` completed without producing an OOS-passing strategy.

### Strongest empirical family frontier so far
The most promising family cluster remains:
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Broad signal
Base long continuation families are generally weak under current gates.

### Strong recurring pattern
Inverted mirror and explicit short/trap-style families are less bad and more promising than native long continuation families.

This is not deployment proof, but it is a meaningful empirical pattern and is now the basis for the active curated persistence hunt.

---

## Current Persistence Hunt

### Objective
Test whether the strongest near-miss families become more persistent when the universe is selected through real curated cohorts rather than crude blended or fake name-bucket segmentation.

### Families under test
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Persistence lever selected
- **Curated cohort / universe composition**
- plus **quality-suppression neighborhood variation**

### Cohorts under test
- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`
- `HARD_FILTER_ALL`
- `PERP_CORE`
- `SPOT_CORE`

### Strategic reason
This run is designed to test whether long drawdown duration, weak Sharpe, and insufficient OOS trades improve when:
- the strongest family candidates are isolated
- the universe is chosen through true venue-aware curated cohorts
- and quality parameters are shifted toward suppression rather than loose firehose behavior

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
- active run continuation across idle/laptop-closed periods

### Not yet sufficiently persistent
- codebase canon
- architecture docs canon
- module registry
- project decision registry
- dataset registry
- run registry
- machine-readable worker contracts
- chat-derived understanding still not fully externalized into canonical documents

---

## Current Run Read So Far

### Major insight from this session
The move from fake name-based segmentation to real curated cohort resolution was absolutely the right call.

This is one of the most important architecture findings to date.

### Strongest cohort so far
`TOP_SPS_WITH_DOGE`

This cohort is currently outperforming `TOP_SPS_CORE` in near-miss persistence structure.

### Strongest family so far
`LOOSE_MOMO_LONG | INVERTED_MIRROR` (`LMI`)

`FAKEOUT_SHORT` (`FOS`) remains viable, but `LMI` appears slightly stronger so far.

### Best fail structure seen so far
Multiple `TOP_SPS_WITH_DOGE` rows are now failing only on:
- `OOS_MaxDD_Days`
- `OOS_Sharpe`

This is a major narrowing of the failure frontier.

### Interpretation
The persistence problem is increasingly concentrated in:
- path quality
- time-under-water
- Sharpe smoothness

rather than broad total edge failure across all dimensions.

That is meaningful progress, though not yet proof of a persistent edge.

---

## Important Runtime Lessons Captured

### Resolved or improved issues
- hard timeout continuation vulnerability materially improved with rescue-trigger pattern
- phantom execution confusion was previously traced to a top-level autostart invocation
- M9 runtime visibility confusion was traced and resolved through runtime integrity audit and corrected execution hygiene
- canonical launch discipline improved: experiments must be launched via explicit named function calls, not loose code snippets
- active run persistence now works in unattended real-world conditions

### Still-open runtime cleanup issues
- dead trigger noise exists for missing `IGN_onOpen`
- one missing-document / no-access error was observed inside an experiment path
- that document dependency should be audited after the active run or during a safe maintenance window
- some symbol histories still show staleness or partial lag

### New rule
No top-level executable statements should exist in the project.  
Only:
- declarations
- object literals
- function bodies

No file should auto-launch experiments on load.

---

## Immediate Priorities

1. Let `PERSISTENCE_HUNT_V2` continue unless a true fatal issue appears
2. Capture mid-run / post-run project snapshot
3. Compare curated cohort results to identify strongest operating bucket
4. Rank best near-miss rows by:
   - fewest OOS fail reasons
   - highest OOS trade count
   - strongest PF / expectancy among near-misses
5. Clean dead trigger noise (`IGN_onOpen`) in a safe maintenance window
6. Audit and fix the missing-document dependency in experiment execution
7. Formalize run registry
8. Formalize dataset registry
9. Formalize module registry
10. Continue moving code/docs toward canonical GitHub home
11. Design historical data migration path toward Supabase-backed canonical storage
12. Stop treating PDFs/chats as primary continuity layer

---

## Not Priorities Right Now

Do **not** treat these as immediate:
- full Python rewrite
- replacing robust existing modules for no reason
- broad new brute-force family sweeps
- overbuilding AI automation before memory/contracts are cleaner
- giant PDF uploads as continuity strategy
- destabilizing the active run with opportunistic edits

---

## Strategic Summary

The machine is alive.  
The runtime is much more trustworthy.  
The broad search is complete.  
The curated persistence hunt is running.

Most important current strategic findings:

- the old segmentation logic was too crude
- curated cohort resolution is materially better
- `TOP_SPS_WITH_DOGE` currently looks strongest
- the remaining failure frontier is increasingly concentrated in:
  - `MaxDD_Days`
  - `Sharpe`

Current mission:

**let the current curated persistence hunt continue, improve durable system memory, clean runtime noise, and begin planning the historical data/storage architecture needed for fairer persistence evaluation at larger scale.**
