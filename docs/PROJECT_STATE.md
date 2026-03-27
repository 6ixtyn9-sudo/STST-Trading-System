# PROJECT STATE

## Date
2026-03-27

## Current Phase
**Fresh-Data Persistence Transition + Supabase-Backed V3 Execution**

The project is no longer merely stabilizing a research machine.  
It is now actively running V3 persistence research on a fresh Supabase-backed canonical dataset.

---

## Current Reality

### System status
- Core modules M1–M10 exist.
- Experiment matrix runner is active and resumable.
- Rescue-trigger timeout recovery is implemented.
- Supabase persistence is live for experiment logging.
- Full diagnostic blob persistence is active.
- AI council scaffolding exists.
- Governance state exists.
- Research and execution are both real subsystems.
- Runtime integrity improved materially.
- Curated cohort universe selection is working inside the actual M9 path.
- Fresh canonical dataset now exists in Supabase and is being used by the active M9 4H backtest loader.
- `PERSISTENCE_HUNT_V3` is active.

### Main bottleneck
The bottleneck is no longer basic machine viability.

The current bottlenecks are now:
- richer durable project memory
- cleaner run/dataset/code-version binding
- richer OOS experiment visibility in reporting
- eventual deeper 4H history
- final proof of edge persistence

---

## Current Stack

- Google Sheets
- Apps Script
- Supabase
- OpenRouter
- GitHub
- Google Colab / Python (active data rebuild workbench)

---

## Current Experiment Status

### Prior completed runs

#### `EDGE_CLARITY_V1`
- completed
- no OOS-passing strategy found
- older weaker baseline

#### `PERSISTENCE_HUNT_V1`
- completed / superseded
- directionally useful
- older crude segmentation framework

#### `PERSISTENCE_HUNT_V2`
- completed / superseded as fresh-data baseline by V3
- major result: `TOP_SPS_WITH_DOGE` and `LMI` looked strongest
- major caveat: still tied to older mixed-freshness dataset context

### Current active run

#### `PERSISTENCE_HUNT_V3`
- **Status:** active
- **Launcher:** `START_PERSISTENCE_HUNT_V3()`
- **Runner:** `RUN_experimentMatrix_resumableContinue`
- **Total Jobs:** `240`
- **Dataset:** `OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

### Current early V3 read
Early V3 rows are the most promising research posture observed so far.

Current notable pattern:
- several early rows fail only on `OOS_Total_Trades < 20`
- while showing strong:
  - profit factor
  - expectancy
  - Sharpe
  - low drawdown

This is not deployment proof, but it is materially stronger than earlier failure structures.

---

## Current Data Status

### Active canonical dataset
`OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

### Scope
- USDT spot + perp only
- 10 core symbols
- no ZAR pairs in canonical research universe

### Observed coverage

#### 1D
- start: `2022-04-18`
- end: `2026-03-27`
- ~1440 rows per symbol

#### 4H
- start: `2025-07-30T12:00:00Z`
- end: `2026-03-27T08:00:00Z`
- ~1440 rows per symbol

### Current data conclusion
The active research dataset is now:
- fresher
- cleaner
- more uniform
- Supabase-backed
- non-ZAR
- operationally integrated into M9

However:
- 4H depth is still shallower than ideal
- future deeper 4H augmentation may still be desirable

---

## Current Universe / Cohort Status

Curated universe modes are now aligned to the active canonical USDT spot/perp dataset:

- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`
- `HARD_FILTER_ALL`
- `PERP_CORE`
- `SPOT_CORE`
- `CUSTOM`

This is materially cleaner than the earlier ZAR-mixed or fake-name-bucket interpretations.

---

## Current Research Read

### Strongest family cluster
Still:
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Strongest cohort direction
Still:
- `TOP_SPS_WITH_DOGE`

### New V3-specific read
With the fresh Supabase-backed dataset and V3 foundation, the failure frontier appears to be narrowing further.

Early V3 rows suggest:
- path quality may be materially improved
- drawdown/Sharpe structure may be cleaner
- the main remaining blocker in early examples is often sample size rather than broad edge collapse

This is the strongest experimental posture seen so far, though still not final proof.

---

## Current Persistence Status

### Already persistent
- experiment logs in Supabase
- DQS summaries in Supabase
- diagnostic blobs in Supabase experiment logs
- dataset coverage in Supabase
- canonical candles in Supabase
- resumable experiment state
- active run continuation
- fresh canonical history bridge into Apps Script/M9

### Not yet sufficiently persistent
- all code mirrored fully into GitHub
- all module docs complete
- all decisions inserted structurally
- richer OOS metric visibility in experiment reporting
- worker contracts formalized machine-readably everywhere

---

## Important Runtime Lessons Captured

### Confirmed now
- fresh-data bridge works
- M2 history gate works against Supabase
- M9 actual loader uses Supabase path
- universe resolver aligned to new dataset
- V3 builder validated at 240 jobs
- V3 launch succeeded and first jobs executed
- runtime ghost audit showed no active trigger ghosts attached at the audit moment

### Still-open cleanup items
- legacy bootstrap / old-source code still exists and should be pruned later
- richer OOS columns should be added to experiment reporting
- stale properties and old helper duplication should be cleaned after the active run

### New rule
Do not prune aggressively during active V3 execution.  
Bridge first, patch second, prune later.

---

## Immediate Priorities

1. Let `PERSISTENCE_HUNT_V3` continue unless a true fatal issue appears
2. Monitor V3 run progression and continuation health
3. Rank best early V3 rows by:
   - fewest OOS fail reasons
   - highest OOS trade count
   - strongest PF / expectancy / Sharpe
4. Add richer explicit OOS columns to experiment reporting after the run or during a safe pause
5. Capture post-run project snapshot
6. Continue reducing continuity dependence on chats/PDFs
7. Prune legacy bootstrap / ZAR / old-source code after V3 stabilizes

---

## Not Priorities Right Now

- large code pruning during active V3
- new broad family brute force
- full Python rewrite
- cosmetic cleanup that risks comparability

---

## Strategic Summary

The machine is alive.  
The fresh-data path is real.  
The bridge to Supabase-backed canonical history is working.  
V3 is running.

Most important current strategic change:
- the project is no longer evaluating persistence on stale mixed sheet-heavy history
- it is now evaluating persistence on a fresh canonical Supabase-backed USDT spot/perp dataset

Current mission:

**let V3 continue, preserve comparability, observe whether the stronger early posture survives broader job coverage, and then clean, document, and deepen the system from a position of real empirical progress.**
