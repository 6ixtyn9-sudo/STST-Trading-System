# DATASETS

This file tracks the known dataset states, sources, scope, and major notes for the $T$T system.

---

## Dataset Philosophy

Datasets must be treated as named research assets, not invisible background assumptions.

If the data changes, comparisons can become invalid unless the dataset state is recorded.

For every meaningful dataset state, record:
- source
- date range
- instruments
- timeframe coverage
- quality caveats
- intended use

---

## Current Primary Canonical Dataset

### Dataset ID
`CC_MAJORSPOTPERP_2021_2026_V1`

### Status
Active but imperfect

### Source
- CryptoCompare bootstrap
- canonical processing via M2 / M2B
- downstream normalization into `DATA_CLEAN`

### Scope
Crypto spot + perp universe used in current research / persistence runs

### Observed symbols ready
Approximately **14 symbols** have been observed in active run history-readiness logs.

### Observed timeframes
- `4H`
- `1D`

### Observed date range
Approximate current observed range:
- **Start:** `2021-12-31`
- **End:** up to `2026-03-26` for stronger symbols

### Observed depth
Typical observed ranges:
- roughly `~9250+` rows for 4H on stronger/current symbols
- roughly `~1542–1543` rows for 1D on stronger/current symbols

---

## Current Practical Universe Notes

### Frequently observed symbols in ready-state logs
- BNB/ZAR
- BTC/USDT
- BTC/USDTPERP
- BTC/ZAR
- DOGE/USDTPERP
- DOGE/ZAR
- ETH/USDT
- ETH/USDTPERP
- ETH/ZAR
- SOL/USDTPERP
- SOL/ZAR
- XRP/USDT
- XRP/USDTPERP
- XRP/ZAR

This list reflects observed canonical readiness, not necessarily the final long-term research universe.

---

## Current Curated Cohort Context

The active persistence-hunt architecture now uses curated cohort modes such as:
- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`
- `HARD_FILTER_ALL`
- `PERP_CORE`
- `SPOT_CORE`

This is important because:
- dataset interpretation is no longer just “what symbols exist”
- it is also “which curated cohorts were active during the run”

---

## Important Current Data Quality Caveats

### Uneven symbol freshness
Not all symbols are equally current.

Observed issues include:
- some BTC / SOL / XRP / perp symbols current through late March 2026
- some DOGE / BNB / ETH / XRP-ZAR variants lagging or ending materially earlier
- some series appear stale while daily rows continue further

### Why this matters
This can affect:
- OOS trade count
- fairness of cohort comparisons
- opportunity density
- backtest path quality
- persistence interpretation

### Current conclusion
The dataset is usable and materially deeper than earlier phases, but it is not yet ideal.

---

## Current Research Context Notes

### Current experiment usage
The active `PERSISTENCE_HUNT_V2` matrix uses this deeper canonical dataset to run walk-forward backtests with OOS evaluation.

### Important implication
Any future comparison against earlier runs must be careful if those earlier runs used:
- shallower history
- different symbol coverage
- different bootstrap populations
- different hard-filter states
- older fake segmentation logic instead of curated cohort resolution

---

## Data Quality Notes

### Positive
- canonical history readiness checks exist in M2
- 4H and 1D sufficiency checks are explicit
- gap and stale handling exist
- bootstrap/resumable bootstrap exists
- data is materially deeper than before
- the active run is now able to use more realistic curated cohorts

### Risks / caveats
- universe composition may shift as filters and bootstrap scope evolve
- some symbols have uneven row counts
- some symbols are stale or partially lagged
- synthetic ZAR conversions and FX paths must remain documented
- comparisons across hidden dataset changes can be misleading
- Sheets is still doing too much storage work for long-history research scale

---

## Dataset Governance Rules

1. Do not silently mutate dataset assumptions during active experiment interpretation.
2. Record major dataset expansions as new dataset IDs or new notes.
3. If start date changes materially, record it.
4. If symbol scope changes materially, record it.
5. If source changes materially, record it.
6. If curated cohort definitions change materially, record it.
7. If stale-history issues are corrected materially, record it.

---

## Proposed Future Dataset IDs

These are placeholders for future clean labeling.

### `CC_MAJORSPOTPERP_2021_2026_V2`
Use if:
- same source
- same broad scope
- but materially improved symbol coverage or cleaning rules

### `CC_MAJORSPOTPERP_2021_2026_SUPABASE_V1`
Use if:
- historical canonical storage moves materially into Supabase
- with improved continuity and less workbook dependence

### `CC_MAJORSPOTPERP_2020_2026_V1`
Use if:
- the start date is pushed back further

### `BTCETH_DEEP_2020_2026_V1`
Use if:
- a benchmark-only deep-history dataset is created for narrower validation

### `UNIVERSE_EXPANDED_LIQUID_2021_2026_V1`
Use if:
- the research universe expands beyond the current majors-heavy / curated-core baseline

---

## Current Operational Guidance

When discussing any experiment result, ask:

1. Which dataset did this run use?
2. What was the date range?
3. What was the symbol scope?
4. Which cohort / universe mode was active?
5. Was the data source / cleaning pipeline the same?
6. Were some series stale relative to others?

If those answers are unclear, the comparison is weaker.

---

## Current Summary

The project now has a meaningful canonical history dataset spanning roughly:
- late 2021
- through March 2026 for stronger/current symbols
- across around 14 observed crypto spot/perp symbols
- at 4H and 1D resolutions

This dataset is currently the baseline research substrate for the active matrix run.

However:
- freshness is uneven
- some series are stale
- long-history storage is still too dependent on Sheets

This dataset should be treated as a named asset, not an implicit assumption, and its future evolution toward Supabase-backed canonical persistence should be tracked explicitly.
