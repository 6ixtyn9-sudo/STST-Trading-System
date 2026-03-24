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
Active

### Source
- CryptoCompare bootstrap
- canonical processing via M2 / M2B
- downstream normalization into `DATA_CLEAN`

### Scope
Crypto majors and related spot/perp universe

### Observed symbols ready
Approximately **14 symbols** during active experiment run

### Observed timeframes
- `4H`
- `1D`

### Observed date range
- **Start:** `2021-12-31`
- **End:** `2026-03-21`

### Observed depth
- roughly `9251–9252` rows for 4H per ready symbol
- roughly `1542` rows for 1D per ready symbol

### Notes
This dataset state was observed during the active `EDGE_CLARITY_V1` matrix run and represents a materially deeper canonical history state than the earlier shallower 2023+ phase.

---

## Universe Notes

### Current practical universe orientation
- crypto
- spot + perps
- majors-heavy baseline

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

This list reflects observed canonical readiness, not necessarily the only possible future universe.

---

## Research Context Notes

### Current experiment usage
The active experiment matrix uses this deeper-history canonical dataset to run walk-forward backtests with OOS evaluation.

### Important implication
Any future comparison against earlier runs must be careful if those earlier runs used:
- shallower history
- different symbol coverage
- different bootstrap populations
- different hard-filter states

---

## Data Quality Notes

### Positive
- canonical history readiness checks exist in M2
- 4H and 1D sufficiency checks are explicit
- gap and stale handling exist
- bootstrap/resumable bootstrap exists
- data is now materially deeper than before

### Risks / caveats
- universe composition may shift as filters and bootstrap scope evolve
- some symbols may have slightly uneven row counts
- synthetic ZAR conversions and FX paths must remain documented
- comparisons across hidden dataset changes can be misleading

---

## Dataset Governance Rules

1. Do not silently mutate dataset assumptions during active experiment interpretation.
2. Record major dataset expansions as new dataset IDs or new notes.
3. If start date changes materially, record it.
4. If symbol scope changes materially, record it.
5. If source changes materially, record it.

---

## Proposed Future Dataset IDs

These are placeholders for future clean labeling.

### `CC_MAJORSPOTPERP_2021_2026_V2`
Use if:
- same source
- same broad scope
- but materially improved symbol coverage or cleaning rules

### `CC_MAJORSPOTPERP_2020_2026_V1`
Use if:
- the start date is pushed back further

### `BTCETH_DEEP_2020_2026_V1`
Use if:
- a benchmark-only deep-history dataset is created for narrower validation

### `UNIVERSE_EXPANDED_LIQUID_2021_2026_V1`
Use if:
- the research universe expands beyond the current majors-heavy baseline

---

## Current Operational Guidance

When discussing any experiment result, ask:

1. Which dataset did this run use?
2. What was the date range?
3. What was the symbol scope?
4. Was the universe majors-only or broader?
5. Was the data source / cleaning pipeline the same?

If those answers are unclear, the comparison is weaker.

---

## Current Summary

The project now appears to have a meaningful canonical history dataset spanning roughly:
- late 2021
- through March 2026
- across around 14 ready crypto spot/perp symbols
- at 4H and 1D resolutions

This dataset is currently the baseline research substrate for the active matrix run.

It should be treated as a named asset, not an implicit assumption.
