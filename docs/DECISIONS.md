# DECISIONS

This file records important architectural and operational decisions for the $T$T system.

---

## 2026-03-26 — Persistence becomes top priority

**Area:** architecture / project continuity  
**Status:** active

### Decision
The project’s primary bottleneck is no longer raw execution capability or strategy experimentation.

The new top priority is **persistent project memory**.

### Why
The system has grown beyond what can be reliably carried by:
- chat context
- PDF uploads
- ad hoc explanations
- Script Properties as semi-memory
- Google Sheets as the only long-term memory surface

The project now needs a real home for:
- code
- docs
- module roles
- project state
- dataset state
- decisions
- experiment history

### Consequence
Work is now organized around building a permanent project home:
- **GitHub** for code and docs
- **Supabase** for structured project memory
- **Sheets** only as the live control/dashboard surface

---

## 2026-03-24 — GitHub becomes canonical code and docs home

**Area:** persistence / source of truth  
**Status:** active

### Decision
GitHub is the canonical home for:
- module source files
- architecture documentation
- project state docs
- migration tracker
- prompt files
- project snapshots in file form

### Why
Apps Script editor alone is not sufficient as a long-term code home because:
- it is not a good documentation environment
- it is not a good diff/review environment
- it is not a good architectural memory system
- it does not solve dead-chat continuity

### Consequence
All meaningful project prose and code snapshots should be mirrored into GitHub.

If something matters and only exists in chat, it is not durable enough.

---

## 2026-03-24 — Supabase becomes project memory layer

**Area:** persistence / data architecture  
**Status:** active

### Decision
Supabase is the persistent structured memory layer for:
- experiment logs
- diagnostic notes
- council deliberations
- module registry
- decision log
- dataset registry
- project snapshots
- active todos
- future chunked knowledge records

### Why
Sheets hit practical scale and continuity limits.
Document Properties are useful as glue, but weak as durable knowledge storage.

Supabase is better suited for:
- structured memory
- external persistence
- retrieval
- queryable history
- future Python/service integration

### Consequence
Important project facts should migrate out of chats and property blobs into Supabase tables.

---

## 2026-03-24 — M1 remains sovereign

**Area:** governance / architecture  
**Status:** active

### Decision
M1 remains the constitutional authority of the system.

### Why
M1 already governs:
- config truth
- changelog discipline
- credential custody
- kill switch authority
- trigger scheduling

This makes it the natural constitutional layer.

### Consequence
No AI layer, memory layer, or orchestration layer should outrank M1.
Specifically:
- AI cannot override kill switch
- Supabase is not config authority
- council logic must remain subordinate to constitutional rules

---

## 2026-03-24 — AI is advisory/governance support, not execution truth

**Area:** AI architecture  
**Status:** active

### Decision
AI is used as a bounded specialist council and advisory layer, not as direct execution truth.

### Why
Execution must remain deterministic and lawful.
AI is useful for:
- role specialization
- critique
- bounded rationale
- arbitration support

AI is not suitable as an unbounded hidden source of live execution decisions.

### Consequence
Council outputs must remain bounded by:
- governance state
- hard rules
- empirical gates
- M1 authority
- fail-closed logic

---

## 2026-03-24 — M8 is governance state, not “AI mood”

**Area:** governance  
**Status:** active

### Decision
M8 is treated as a **governance-state engine**, not as anthropomorphic AI mood control.

### Why
The system already has strong governance semantics:
- pause
- ban
- caution
- restriction
- gate validation
- go-live readiness

These are better modeled as formal system states than as personality modifiers.

### Consequence
M8 should continue to produce formal outputs like:
- NORMAL
- CAUTION
- RESTRICTED
- PAUSED

and these outputs should constrain downstream orchestration.

---

## 2026-03-24 — M9 is empirical judiciary

**Area:** research / architecture  
**Status:** active

### Decision
M9 is treated as the empirical truth layer.

### Why
M9 already governs:
- walk-forward backtests
- OOS evaluation
- DQS summary
- empirical pass/fail logic
- metrics truth

This makes it the natural judiciary / evidence layer.

### Consequence
Council and deployment logic should defer to M9 for empirical legitimacy.

---

## 2026-03-24 — Apps Script remains current control plane, not forever compute backbone

**Area:** migration planning  
**Status:** active

### Decision
Apps Script remains the current orchestration/control plane for now.

### Why
It already works.
The experiment runner is resumable and the system is alive.

### But
It has visible constraints:
- runtime ceilings
- trigger complexity
- startup overhead
- workbook coupling

### Consequence
No immediate rewrite is required, but future heavy lifting should migrate toward Python/services over time.

---

## 2026-03-24 — Existing robust modules are preserved, not casually replaced

**Area:** architecture discipline  
**Status:** active

### Decision
Existing modules that are already strong should not be replaced just because the project is being reorganized.

### Why
The main problem is persistence fragmentation, not absence of architecture.

The system already contains meaningful modules:
- M1, M2, M3, M4, M5, M6, M7, M8, M9, M10

### Consequence
Refactoring should be:
- deliberate
- documented
- persistence-first
- migration-aware

not novelty-driven.

---

## 2026-03-24 — Current research read: inverted mirrors look more promising than base longs

**Area:** research direction  
**Status:** provisional / active observation

### Decision
Current research notes should explicitly record the recurring pattern that inverted mirror variants appear less bad than base long variants.

### Why
Across the active matrix, repeated rows suggest:
- base long families are broadly weak
- inverted mirrors sometimes show improved PF / expectancy / relative behavior
- they still mostly fail current OOS gates, but are directionally more promising

### Consequence
This is not a deployment conclusion.
It is a research direction that should be preserved as a durable observation.

---

## 2026-03-26 — Curated cohort universe resolution replaces crude fake segmentation as the preferred persistence framework

**Area:** research architecture / M9 runtime integrity  
**Status:** active

### Decision
The preferred persistence-testing framework is now **curated cohort universe selection**, not crude symbol-name segmentation.

### Why
The actual M9 backtest resolver was audited and found to be using crude string-based segmentation logic such as BTC/ETH/SOL/XRP substring matching.

That meant older “segmentation” runs were directionally useful, but not true curated universe tests.

The resolver path was upgraded to support real cohort-aware modes such as:
- `HARD_FILTER_ALL`
- `TOP_K`
- `TOP_SPS_CORE`
- `TOP_SPS_WITH_DOGE`
- `PERP_CORE`
- `SPOT_CORE`
- `CUSTOM`

### Consequence
Future persistence work should interpret curated cohort runs as more meaningful than the earlier fake-name-bucket segmentation framework.

---

## 2026-03-26 — `PERSISTENCE_HUNT_V2` becomes the active narrow persistence run

**Area:** research execution  
**Status:** active

### Decision
The active persistence run became `PERSISTENCE_HUNT_V2`, not `PERSISTENCE_HUNT_V1`.

### Why
`PERSISTENCE_HUNT_V2` had:
- corrected family targeting
- corrected universe selection architecture
- stronger suppression-focused parameter neighborhood
- real curated cohort comparison
- 240-job scope with better interpretability

### Consequence
Current live persistence interpretation from that phase should be based primarily on `PERSISTENCE_HUNT_V2`.

---

## 2026-03-26 — Runner persistence is now treated as operationally proven

**Area:** runtime integrity / execution architecture  
**Status:** active

### Decision
The resumable experiment runner is treated as operationally proven enough for unattended continuation.

### Why
During the active `PERSISTENCE_HUNT_V2` run:
- the run continued while the operator laptop was closed
- continuation triggers kept progressing
- rescue/continuation behavior recovered through speed bumps
- the machine showed practical persistence rather than merely theoretical resumability

### Consequence
Timeouts remain a platform constraint, but the runner itself is now considered materially more trustworthy than before.

---

## 2026-03-26 — `TOP_SPS_WITH_DOGE` is currently the strongest persistence cohort

**Area:** research interpretation  
**Status:** provisional / active observation

### Decision
Current research memory should record that `TOP_SPS_WITH_DOGE` is currently the strongest operating cohort in `PERSISTENCE_HUNT_V2`.

### Why
Observed run results showed:
- stronger trade counts than `TOP_SPS_CORE`
- narrower near-miss failure structures
- multiple rows failing only on:
  - `MaxDD_Days`
  - `Sharpe`

### Consequence
Post-run follow-up design should give special attention to:
- `TOP_SPS_WITH_DOGE`
- `LMI`
- nearby parameter regions that preserve trade count while still suppressing weak setups

---

## 2026-03-26 — Machine-readable contracts are emerging as the likely foundation for bounded bot labor

**Area:** AI architecture / orchestration  
**Status:** active direction

### Decision
The next maturity step for AI inside the system should be **machine-readable worker contracts**.

### Why
The project has outgrown:
- vague assistant usage
- chat-memory dependence
- prose-only role definitions

Bounded workers need:
- explicit scope
- input contracts
- output contracts
- authority limits
- durable artifact expectations

### Consequence
Future worker/council/runtime-support design should move toward machine-readable contracts rather than loose descriptive role notes alone.

---

## 2026-03-27 — ZAR is removed from the canonical research/live universe

**Area:** data architecture / research substrate  
**Status:** active

### Decision
ZAR pairs are no longer part of the canonical research/live universe.

### Why
ZAR was imposing unnecessary constraints on:
- symbol coverage
- freshness
- source robustness
- portability
- fair cohort comparison
- future live portability beyond South Africa-specific assumptions

The research and live-trading substrate is now better served by a USDT spot/perp universe.

### Consequence
Canonical research datasets should prefer:
- USDT spot pairs
- USDT perpetual pairs

ZAR remains relevant only as:
- reporting
- accounting
- tax translation
- optional external conversion logic

---

## 2026-03-27 — OKX + CCXT + Supabase becomes the active fresh-data rebuild path

**Area:** data migration / canonical storage  
**Status:** active

### Decision
The active fresh-data rebuild path uses:
- OKX public market data
- CCXT in Python / Google Colab
- Supabase as canonical storage

### Why
Earlier data architecture was constrained by:
- stale series
- uneven freshness
- workbook dependence
- source limitations
- Apps Script not being ideal for deep historical ingestion

OKX/CCXT provided a working free route from the current environment, and Supabase removed the cell-limit/storage bottleneck.

### Consequence
Historical research data for current persistence work should now be interpreted primarily against the new Supabase-backed dataset, not the older sheet-heavy mixed-freshness dataset.

---

## 2026-03-27 — M9 backtest loader now reads fresh canonical history from Supabase

**Area:** research architecture / runtime integration  
**Status:** active

### Decision
The actual M9 4H backtest history loader now uses the Supabase-backed canonical dataset in the active fresh-data path.

### Why
It was no longer sufficient to move only the dataset registry and readiness gate.
The real empirical truth path had to consume the fresh dataset directly.

### Consequence
Current V3 persistence work is now being evaluated on the Supabase-backed canonical history path rather than the older `DATA_CLEAN` sheet history path.

---

## 2026-03-27 — V3 launched on fresh Supabase-backed dataset

**Area:** research execution  
**Status:** active

### Decision
`PERSISTENCE_HUNT_V3` was launched using the fresh Supabase-backed canonical dataset.

### Why
The historical storage migration and fresh-data rebuild reached a sufficient phase-1 state:
- canonical dataset exists in Supabase
- Apps Script bridge verified
- M2 history gate verified
- M9 4H loader verified
- curated universe resolver aligned to the new USDT universe
- fresh-data smoke backtest completed successfully
- V3 builder validated at 240 jobs

### Consequence
V3 interpretation must now be understood relative to:
- `OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1`

not the earlier mixed-freshness CryptoCompare/ZAR-heavy dataset.

A remaining caveat is that 4H depth is still shallower than ideal, so V3 results are fresher and cleaner, but not yet “final perfect deep-history truth.”

---

## Rule for future decisions

Every major decision should record:
- what was decided
- why it was decided
- what it affects
- whether it is provisional or active

This file exists so future work does not depend on memory luck.
