# DATASETS

This file tracks the known dataset states, sources, scope, quality caveats, and intended use of datasets in the $T$T system.

Datasets must be treated as named research assets, not invisible background assumptions.

If the data changes, comparisons can become invalid unless the dataset identity and caveats are recorded explicitly.

For every meaningful dataset state, record:
- source
- date range
- instruments
- timeframe coverage
- quality caveats
- intended use
- whether it is active, legacy, or experimental

---

## Dataset Governance Philosophy

A dataset is not “just the candles.”
A dataset also implies:
- symbol scope
- market type scope
- source behavior
- freshness profile
- timeframe depth
- cleaning assumptions
- whether the downstream system actually consumes it

This matters because:
- stale data can produce false failures
- hidden source changes can produce false confidence
- changing the universe can distort persistence interpretation
- changing time depth can make earlier experiments non-comparable

Therefore:
- if the data changes materially, the dataset ID must change or the change must be explicitly documented
- experiments should be discussed with explicit dataset context
- no major run should rely on implicit background data assumptions

---

## Legacy Dataset Family

### Dataset ID
`CC_MAJORSPOTPERP_2021_2026_V1`

### Status
Legacy / imperfect / no longer preferred for current fresh-data persistence work

### Source
- CryptoCompare bootstrap
- canonical processing via M2 / M2B
- downstream normalization into `DATA_CLEAN`

### Scope
Crypto spot + perp universe used in earlier research / persistence runs.

### Observed symbols ready
Approximately **14 symbols** were observed in earlier historical readiness logs.

### Observed timeframes
- `4H`
- `1D`

### Observed date range
Approximate observed range:
- **Start:** `2021-12-31`
- **End:** up to `2026-03-26` for stronger/current symbols

### Observed depth
Typical observed ranges:
- roughly `~9250+` rows for 4H on stronger/current symbols
- roughly `~1542–1543` rows for 1D on stronger/current symbols

### Historically observed symbols
This list reflects observed readiness during the older sheet-heavy canonical period:
- `BNB/ZAR`
- `BTC/USDT`
- `BTC/USDTPERP`
- `BTC/ZAR`
- `DOGE/USDTPERP`
- `DOGE/ZAR`
- `ETH/USDT`
- `ETH/USDTPERP`
- `ETH/ZAR`
- `SOL/USDTPERP`
- `SOL/ZAR`
- `XRP/USDT`
- `XRP/USDTPERP`
- `XRP/ZAR`

### Historical caveats
- uneven symbol freshness
- stale or partially lagging series
- mixed spot/perp freshness
- ZAR-heavy research baggage
- workbook-heavy historical storage
- weaker reproducibility than the current Supabase-backed dataset
- comparisons could be distorted by hidden freshness differences

### Historical use
This dataset family matters for interpretation of:
- `EDGE_CLARITY_V1`
- `PERSISTENCE_HUNT_V1`
- `PERSISTENCE_HUNT_V2`

It should remain documented for continuity, but it is no longer the preferred clean baseline for current persistence work.

---

## Current Active Canonical Dataset

### Dataset ID
`OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

### Status
Active / preferred for current fresh-data persistence work

### Source
- OKX public market data
- fetched via Python / Google Colab using CCXT
- written into Supabase canonical candle storage
- covered by Supabase `dataset_symbol_coverage`

### Canonical storage location
Supabase tables:
- `market_candles`
- `dataset_symbol_coverage`
- `dataset_registry`
- `ingestion_runs`
- `data_quality_issues` (when populated)

### Scope
USDT-quoted major crypto spot + perp research universe with no ZAR pairs in the canonical research/live substrate.

### Canonical symbols
- `BTC/USDT`
- `BTC/USDTPERP`
- `ETH/USDT`
- `ETH/USDTPERP`
- `SOL/USDT`
- `SOL/USDTPERP`
- `XRP/USDT`
- `XRP/USDTPERP`
- `DOGE/USDT`
- `DOGE/USDTPERP`

### Symbol count
10

### Timeframes
- `4H`
- `1D`

### Observed 1D coverage
Per symbol:
- approximately `1440` rows
- observed range:
  - **Start:** `2022-04-18`
  - **End:** `2026-03-27`

### Observed 4H coverage
Per symbol:
- approximately `1440` rows
- observed range:
  - **Start:** `2025-07-30T12:00:00Z`
  - **End:** `2026-03-27T08:00:00Z`

### Freshness profile
All currently loaded canonical symbols are fresh and aligned through the current observed end date.
This is materially cleaner than the legacy mixed-freshness sheet-backed dataset.

### Current quality read
Positive:
- uniform symbol scope
- uniform freshness
- no ZAR pairs in canonical research universe
- spot + perp both represented
- canonical storage in Supabase
- Apps Script bridge verified
- M2 canonical history gate verified against this dataset
- M9 actual 4H backtest loader verified against this dataset
- curated universe resolver aligned to this dataset
- active V3 run is using this dataset

### Important caveat
4H depth is materially shallower than 1D depth on the current OKX/CCXT path.

This means:
- the dataset is very useful for recent intraday persistence work
- the dataset is useful for current V3 evaluation
- the dataset is not yet equivalent to a deep multi-year 4H benchmark dataset

### Intended use
- current V3 persistence experiment foundation
- current preferred fresh-data research substrate
- canonical non-ZAR persistence-testing baseline
- Apps Script / Supabase bridge validation dataset
- active M9 fresh-data backtest source

---

## Dataset Interpretation Notes

### Legacy vs active baseline
The project now has two materially different dataset contexts:

#### Legacy baseline
`CC_MAJORSPOTPERP_2021_2026_V1`
- older
- mixed freshness
- workbook-heavy
- ZAR-influenced

#### Active fresh baseline
`OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`
- fresher
- more uniform
- Supabase-backed
- no ZAR in canonical research universe

These should not be treated as silently comparable.

### Current active curated cohort interpretation
The curated universe modes now operate against the active USDT-only spot/perp canonical dataset:
- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`
- `HARD_FILTER_ALL`
- `PERP_CORE`
- `SPOT_CORE`
- `CUSTOM`

Under the active dataset, these should be interpreted as USDT-based curated cohort definitions, not the older ZAR-mixed universe.

---

## Current Research Context

### Earlier experiment usage
The earlier persistence work should be interpreted relative to the older dataset context.

### Current experiment usage
The active `PERSISTENCE_HUNT_V3` matrix should be interpreted relative to:
`OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

### Important implication
Any comparison across V2 and V3 must be explicit about:
- dataset identity
- symbol scope
- source
- 4H depth differences
- fresh-data bridge activation
- universe definition changes

If those are not explicit, comparisons are weaker.

---

## Data Quality Notes

### Positive
- canonical candles now exist in Supabase
- 10-symbol core USDT spot/perp universe is loaded
- freshness is uniform across the active phase-1 dataset
- dataset coverage is queryable
- Apps Script can read canonical history from Supabase
- M9 real 4H loader has been validated against the fresh dataset
- V3 is actively running on the fresh dataset

### Risks / caveats
- 4H depth is still shallower than ideal
- deeper multi-year intraday augmentation may still be desirable later
- richer OOS reporting surfaces are still needed
- comparisons against older runs remain weaker unless dataset ID is stated explicitly

---

## Dataset Governance Rules

1. Do not silently mutate dataset assumptions during active experiment interpretation.
2. Record major dataset expansions as new dataset IDs or explicit dataset notes.
3. If the start date changes materially, record it.
4. If the symbol scope changes materially, record it.
5. If the source changes materially, record it.
6. If curated cohort definitions change materially, record it.
7. If stale-history issues are corrected materially, record it.
8. If the actual backtest load path changes to a new data source, record it.
9. If a dataset is active in a named run, that run should be interpreted relative to that dataset ID.

---

## Proposed Future Dataset IDs

### `OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V2`
Use if:
- same source
- same broad scope
- but materially improved 4H depth, cleaning rules, or coverage logic

### `BENCHMARK_BTCETH_USDT_4H_DEEP_V1`
Use if:
- a narrower benchmark-only deeper 4H dataset is created for BTC/ETH validation

### `MULTISOURCE_MAJORSPOTPERP_USDT_2020_2026_V1`
Use if:
- deeper history is later assembled from multiple sources while preserving explicit dataset identity

---

## Operational Guidance

When discussing any experiment result, ask:

1. Which dataset did this run use?
2. What was the date range?
3. What was the symbol scope?
4. Which cohort / universe mode was active?
5. Was the data source / cleaning pipeline the same?
6. Was the run using the legacy mixed-freshness dataset or the active Supabase-backed dataset?

If those answers are unclear, the comparison is weaker.

---

## Current Summary

The system now has an active Supabase-backed canonical research dataset:

- USDT majors only
- 10 spot/perp symbols
- 1D depth back to `2022-04-18`
- recent 4H depth back to `2025-07-30`
- uniform freshness through `2026-03-27`
- no ZAR dependence in the canonical research universe

This dataset is now the preferred active substrate for current V3 persistence work.

However:
- 4H depth is still limited relative to the longer-term deep-history ambition
- future deeper 4H augmentation may still be desirable

This dataset should be treated as a named research asset, not an implicit assumption.
