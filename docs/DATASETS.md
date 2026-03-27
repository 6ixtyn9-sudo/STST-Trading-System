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

## Legacy Canonical Dataset

### Dataset ID
`CC_MAJORSPOTPERP_2021_2026_V1`

### Status
Legacy / imperfect / no longer preferred for active fresh-data persistence work

### Source
- CryptoCompare bootstrap
- canonical processing via M2 / M2B
- downstream normalization into `DATA_CLEAN`

### Scope
Crypto spot + perp universe used in earlier research / persistence runs

### Observed symbols ready
Approximately **14 symbols** were observed in historical readiness logs.

### Observed timeframes
- `4H`
- `1D`

### Observed date range
Approximate observed range:
- **Start:** `2021-12-31`
- **End:** up to `2026-03-26` for stronger symbols

### Observed depth
Typical observed ranges:
- roughly `~9250+` rows for 4H on stronger/current symbols
- roughly `~1542–1543` rows for 1D on stronger/current symbols

### Legacy practical universe notes
Frequently observed symbols included:
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

### Important caveats
- uneven symbol freshness
- stale or partially lagging series
- ZAR-heavy research baggage
- workbook-heavy historical storage
- lower reproducibility than the new Supabase-backed dataset

### Why it matters historically
This dataset remains important for interpreting:
- `EDGE_CLARITY_V1`
- `PERSISTENCE_HUNT_V1`
- `PERSISTENCE_HUNT_V2`

But it should no longer be treated as the cleanest current baseline.

---

## Current Active Canonical Dataset

### Dataset ID
`OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

### Status
Active / preferred for current fresh-data persistence work

### Source
- OKX public market data
- fetched via Python / Google Colab using CCXT
- stored canonically in Supabase `market_candles`
- coverage tracked in Supabase `dataset_symbol_coverage`

### Scope
USDT-quoted major crypto spot + perp research universe with no ZAR pairs.

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
- approximately `1440` rows per symbol
- observed range:
  - **Start:** `2022-04-18`
  - **End:** `2026-03-27`

### Observed 4H coverage
- approximately `1440` rows per symbol
- observed range:
  - **Start:** `2025-07-30T12:00:00Z`
  - **End:** `2026-03-27T08:00:00Z`

### Current quality read
Positive:
- uniform symbol scope
- uniform freshness
- non-ZAR canonical universe
- Supabase-backed persistence
- Apps Script bridge verified
- M2 canonical history gate verified against this dataset
- M9 actual 4H backtest loader verified against this dataset
- curated universe resolver aligned to this dataset
- active V3 run is using this dataset

### Important caveat
4H depth is materially shallower than 1D depth on the current OKX/CCXT path.

This means:
- the dataset is useful for recent intraday persistence work
- the dataset is useful for current V3 evaluation
- the dataset is not yet equivalent to a deep multi-year 4H benchmark universe

### Intended use
- current V3 persistence experiment foundation
- current preferred fresh-data research substrate
- canonical non-ZAR persistence-testing baseline
- active Apps Script / Supabase bridge validation dataset

---

## Current Curated Cohort Context

The active persistence architecture now uses curated cohort modes such as:
- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`
- `HARD_FILTER_ALL`
- `PERP_CORE`
- `SPOT_CORE`
- `CUSTOM`

Under the active canonical dataset, these are now interpreted against the USDT-only spot/perp universe rather than the older ZAR-mixed universe.

---

## Current Research Context Notes

### Earlier experiment usage
The older `PERSISTENCE_HUNT_V2` matrix should be interpreted relative to the legacy mixed-freshness dataset context.

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
2. Record major dataset expansions as new dataset IDs or new notes.
3. If start date changes materially, record it.
4. If symbol scope changes materially, record it.
5. If source changes materially, record it.
6. If curated cohort definitions change materially, record it.
7. If stale-history issues are corrected materially, record it.

---

## Proposed Future Dataset IDs

### `OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V2`
Use if:
- same source
- same broad scope
- but materially improved 4H depth, cleaning rules, or coverage logic

### `BENCHMARK_BTCETH_USDT_4H_DEEP_V1`
Use if:
- a narrower benchmark-only deep 4H dataset is created for BTC/ETH validation

### `MULTISOURCE_MAJORSPOTPERP_USDT_2020_2026_V1`
Use if:
- deeper history is later assembled from multiple sources while preserving explicit dataset identity

---

## Current Operational Guidance

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
