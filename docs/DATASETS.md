# DATASETS

This file tracks known dataset states, sources, scope, quality caveats, and intended use of datasets in the system.

Datasets must be treated as named research assets, not invisible background assumptions.

If the data changes materially, comparisons can become invalid unless dataset identity and caveats are recorded explicitly.

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

A dataset is not “just candles.”
A dataset also implies:
- symbol scope
- market type scope
- source behavior
- freshness profile
- timeframe depth
- cleaning assumptions
- whether the downstream system actually consumes it
- whether the same runtime path used it in practice

This matters because:
- stale data can produce false failures
- hidden source changes can produce false confidence
- changing the universe can distort interpretation
- changing time depth can make earlier experiments non-comparable
- changing runtime path without documenting it can create false continuity

Therefore:
- if the data changes materially, the dataset ID must change or the change must be explicitly documented
- major experiments must be discussed with explicit dataset context
- no important run should rely on implicit background data assumptions

---

## Dataset State Types

### Legacy
Historically important, but no longer the preferred baseline.

### Active
The current preferred substrate for a specific runtime path or project phase.

### Experimental
Useful for tests, probes, or rebuilds, but not yet accepted as the main reference baseline.

---

## Historical Legacy Dataset Family

### Dataset ID
`CC_MAJORSPOTPERP_2021_2026_V1`

### Status
Legacy / historically important / no longer preferred as current validation baseline

### Source
- CryptoCompare bootstrap
- canonical processing via Apps Script-era M2 / M2B flow
- downstream normalization into sheet-backed canonical structures

### Scope
Mixed crypto spot + perp universe used in earlier research and persistence work.

### Observed symbols ready
Approximately **14 symbols** in earlier readiness logs.

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
Examples seen in earlier logs:
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
- weaker reproducibility than later Supabase-backed datasets
- comparisons could be distorted by hidden freshness differences

### Historical use
This dataset family matters for interpretation of:
- `EDGE_CLARITY_V1`
- `PERSISTENCE_HUNT_V1`
- `PERSISTENCE_HUNT_V2`

### Important note
This dataset remains documented for historical continuity.
It should not be silently treated as equivalent to later Supabase-backed datasets.

---

## Fresh-Data Persistence-Hunt Dataset

### Dataset ID
`OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

### Status
Historically important active dataset for the 2026-03-27 fresh-data persistence-hunt phase

### Source
- OKX public market data
- fetched via Python / Colab using CCXT
- written into Supabase canonical candle storage

### Canonical storage location
Supabase tables:
- `market_candles`
- `dataset_symbol_coverage`
- `dataset_registry`
- `ingestion_runs`
- `data_quality_issues` (when populated)

### Scope
USDT-quoted major crypto spot + perp universe with no ZAR pairs in the canonical research/live substrate.

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
Loaded symbols were aligned and fresh through the observed end date.

### Important historical role
This dataset was the active substrate for the Apps Script / Supabase fresh-data persistence-hunt phase and materially improved on the older mixed-freshness workbook-heavy context.

### Important caveat
4H depth was materially shallower than ideal for deeper intraday persistence truth.

### Historical use
This dataset is associated with:
- `PERSISTENCE_HUNT_V3`
- fresh Supabase-backed persistence-hunt interpretation
- non-ZAR canonical research transition

### Important note
This dataset remains historically important, but it is no longer the only active context worth documenting.

---

## Current Python Validation Dataset

### Dataset ID
`CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V1`

### Status
Active in the current Python-led V7 / V8 / V9 validation phase

### Source
- Supabase-backed canonical candle storage
- consumed directly by the Python research/runtime path
- current Python notebooks use this dataset ID explicitly in backtest loading

### Scope
USDT major spot + perp universe for Python-led strategy validation.

### Currently observed symbols in active code path
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

### Timeframe usage in current Python validation
- active research focus is currently `4H`
- indicators and backtests are being run over the loaded 4H path
- supporting data model still includes broader candle table semantics where relevant

### Important runtime truth
This dataset is the one explicitly referenced by the current Python V7 / V8 / V9 workflow.

That means:
- current `BREAKOUT_LONG` selection work
- V8 friction stress
- V9 champion/backup selection
are tied to this Python-active dataset context, not merely to the earlier 2026-03-27 persistence-hunt dataset framing.

### Current role
This is the active dataset context for:
- V7 robustness mapping
- V8 friction-aware stress
- V9 candidate selection and micro-live readiness preparation

### Caveats
- exact historical depth should still be verified whenever comparing against older Apps Script-era runs
- this dataset should not be silently treated as identical to the earlier `OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1` context
- any comparison across project phases should state the dataset explicitly

---

## Dataset Interpretation Notes

### The project now has multiple important dataset contexts

#### Legacy workbook-heavy / mixed-freshness context
`CC_MAJORSPOTPERP_2021_2026_V1`

Characteristics:
- older
- mixed freshness
- ZAR-influenced
- workbook-heavy
- historically important, but weaker baseline

#### Fresh-data persistence-hunt context
`OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

Characteristics:
- fresher
- USDT-only
- Supabase-backed
- cleaner than the legacy workbook-heavy context
- historically central to V3 persistence-hunt interpretation

#### Current Python validation context
`CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V1`

Characteristics:
- active in Python-led V7 / V8 / V9 workflow
- current `BREAKOUT_LONG` validation substrate
- tied to the actual current candidate-selection path

### Important rule
These should not be treated as silently interchangeable.

---

## Dataset-to-Run Interpretation

### Earlier experiment usage
Interpret these relative to earlier historical dataset context:
- `EDGE_CLARITY_V1`
- `PERSISTENCE_HUNT_V1`
- `PERSISTENCE_HUNT_V2`

### Fresh-data persistence-hunt usage
Interpret this relative to:
- `OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`
- `PERSISTENCE_HUNT_V3`

### Current Python validation usage
Interpret these relative to:
- `CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V1`
- `V7_BREAKOUT_LONG_ROBUSTNESS_MAP`
- `V8_FRICTION_STRESS_BREAKOUT_LONG`
- `V9_MICRO_LIVE_READINESS`

---

## Current Universe Interpretation

### Earlier context
Earlier universes and cohorts may have been interpreted under:
- mixed-freshness
- ZAR-influenced
- workbook-heavy
- older segmentation logic

### Current context
The current Python-led strategy-validation work uses curated universe modes over the active Python dataset context:
- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`

These should now be interpreted relative to the Python validation dataset, not just the older persistence-hunt frame.

---

## Data Quality Notes

### Positive
- canonical candle storage exists in Supabase
- major spot/perp symbol set is explicit
- dataset identity is now visible rather than hidden
- multiple important project phases now have named dataset context
- Python research runtime is explicitly tied to a named dataset

### Risks / caveats
- older runs and newer runs are still easy to compare incorrectly if dataset identity is omitted
- 4H depth remains an important quality dimension and must be stated explicitly when relevant
- some historical project memory still frames older datasets as if they were the current active substrate
- runtime truth can drift if docs are not kept aligned with the actually loaded dataset ID

---

## Dataset Governance Rules

1. Do not silently mutate dataset assumptions during active interpretation.
2. Record major dataset expansions as new dataset IDs or explicit dataset notes.
3. If the source changes materially, record it.
4. If the symbol scope changes materially, record it.
5. If the time depth changes materially, record it.
6. If the runtime path changes to a different dataset, record it.
7. If curated cohort interpretation changes materially, record it.
8. Every important named run should be interpretable relative to a named dataset.
9. If two runs used different datasets, comparisons must say so.

---

## Proposed Future Dataset IDs

### `OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V2`
Use if:
- same broad source/scope
- materially improved depth, cleaning, or coverage logic

### `CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V2`
Use if:
- same broad validation family
- but materially changed depth, cleaning, or runtime assumptions

### `BENCHMARK_BTCETH_USDT_4H_DEEP_V1`
Use if:
- a narrower benchmark-only deeper 4H dataset is created

### `MULTISOURCE_MAJORSPOTPERP_USDT_2020_2026_V1`
Use if:
- deeper multi-source history is later assembled with explicit dataset identity

---

## Operational Guidance

When discussing any important experiment or strategy conclusion, ask:

1. Which dataset did this run use?
2. What was the date range?
3. What was the symbol scope?
4. Which cohort / universe mode was active?
5. Was the data source / cleaning pipeline the same?
6. Was this run part of the older persistence-hunt phase or the current Python validation phase?

If those answers are unclear, the comparison is weaker.

---

## Current Summary

The project now has more than one important Supabase-backed dataset context.

Historically important:
- `CC_MAJORSPOTPERP_2021_2026_V1`
- `OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

Currently active in Python-led validation:
- `CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V1`

This means dataset identity is now a first-class research requirement.

Datasets must be treated as named research assets, not invisible assumptions.
