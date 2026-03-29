# DECISIONS

This file records important architectural, research, and operational decisions.

Every major decision should record:
- what was decided
- why it was decided
- what it affects
- whether it is active or provisional

---

## 2026-03-24 — GitHub becomes canonical code and docs home

**Area:** persistence / source of truth  
**Status:** active

### Decision
GitHub is the canonical home for:
- code
- architecture docs
- project state docs
- strategy docs
- migration docs
- prompt files
- snapshots in file form

### Why
If something matters and only exists in chat, it is not durable enough.

### Consequence
Important project truth should be written into GitHub, not left implicit in conversation history.

---

## 2026-03-24 — Supabase becomes structured project memory layer

**Area:** persistence / data architecture  
**Status:** active

### Decision
Supabase is the structured memory layer for:
- experiment logs
- diagnostic notes
- council deliberations
- module registry
- decision log
- dataset registry
- project snapshots
- other structured persistent artifacts

### Why
Sheets and property blobs are insufficient as long-term machine memory.

### Consequence
Important durable project facts should increasingly move into structured persistence.

---

## 2026-03-24 — M1 remains sovereign

**Area:** governance / architecture  
**Status:** active

### Decision
M1 remains the constitutional authority of the system.

### Why
Configuration truth, kill-switch authority, and constitutional order must not be outranked by AI or persistence layers.

### Consequence
No AI layer, memory layer, or orchestration layer may silently outrank M1.

---

## 2026-03-24 — AI is advisory, not execution truth

**Area:** AI architecture  
**Status:** active

### Decision
AI is a bounded specialist / critique / governance-support layer, not direct execution truth.

### Why
Execution must remain lawful, deterministic, and constrained by governance and empirical evidence.

### Consequence
AI may summarize and critique, but may not manufacture approval.

---

## 2026-03-24 — M8 is governance state, not “AI mood”

**Area:** governance  
**Status:** active

### Decision
M8 is a governance-state engine, not anthropomorphic mood control.

### Why
The system’s needs are best modeled as explicit states like:
- NORMAL
- CAUTION
- RESTRICTED
- PAUSED

### Consequence
Governance outputs should remain formal, operational, and constraining.

---

## 2026-03-24 — M9 is empirical judiciary

**Area:** research / architecture  
**Status:** active

### Decision
M9 is treated as the empirical truth layer.

### Why
Backtests, OOS evaluation, DQS, and metrics truth belong to the empirical judiciary of the system.

### Consequence
Council and deployment logic should defer to empirical legitimacy.

---

## 2026-03-24 — Apps Script remains current control plane, not forever compute backbone

**Area:** migration planning  
**Status:** active

### Decision
Apps Script remains useful as the current control-plane layer, but should not be treated as the forever-home of heavy compute and live infrastructure.

### Why
It already works, but has obvious structural constraints.

### Consequence
Migration should be phased, not panic-driven.

---

## 2026-03-26 — Curated cohort universe resolution replaces crude fake segmentation

**Area:** research architecture  
**Status:** active

### Decision
Curated cohort universe selection replaces crude string-based segmentation as the preferred persistence-testing framework.

### Why
Older segmentation logic was directionally useful but not truly curated.

### Consequence
Future persistence and strategy interpretation should prefer real cohort-aware modes.

---

## 2026-03-27 — ZAR removed from canonical research/live universe

**Area:** data architecture  
**Status:** active

### Decision
ZAR pairs are no longer part of the canonical research/live universe.

### Why
They imposed avoidable constraints on coverage, freshness, comparability, and portability.

### Consequence
Canonical research and live substrate should prefer USDT spot/perp pairs.

---

## 2026-03-27 — OKX + CCXT + Supabase becomes active fresh-data rebuild path

**Area:** data migration / canonical storage  
**Status:** active

### Decision
The active fresh-data rebuild path uses:
- OKX public data
- CCXT in Python / Colab
- Supabase as canonical storage

### Why
Earlier storage architecture was too workbook-constrained and freshness-distorted.

### Consequence
Canonical data now lives outside Sheets-first limitations.

---

## 2026-03-27 — M9 loader reads canonical history from Supabase

**Area:** research architecture  
**Status:** active

### Decision
The actual backtest load path was moved onto the Supabase-backed canonical dataset.

### Why
It was not enough to update only metadata and readiness gates; empirical truth had to consume the new dataset directly.

### Consequence
Research interpretation became more trustworthy.

---

## 2026-03-29 — Python becomes active research/runtime layer

**Area:** migration / runtime architecture  
**Status:** active

### Decision
Python is now an active runtime layer for:
- backtest engine evolution
- strategy validation
- friction-aware testing
- candidate selection
- deploy-bundle generation
- live monitoring scaffolding

### Why
The project has now crossed the threshold where Apps Script alone is not the right home for all heavy research/runtime work.

### Consequence
Migration is no longer purely future-planned; it is partially active.

---

## 2026-03-29 — Leverage must be modeled as a sizing/notional cap, not an R-multiplier

**Area:** backtest modeling  
**Status:** active

### Decision
Leverage is modeled through position sizing / notional caps, not by multiplying trade R.

### Why
The system is already risk-sized by stop distance and risk-per-trade.
Multiplying R by leverage would double-count risk.

### Consequence
Leverage matters by:
- capping notional
- constraining position size
- affecting operational risk
not by mechanically scaling R.

---

## 2026-03-29 — Reject synthetic post-hoc friction/leverage stress

**Area:** research modeling  
**Status:** active

### Decision
The project rejects synthetic post-hoc friction/leverage stress built from reconstructed trade distributions.

### Why
That destroys path structure, DD behavior, and execution realism.

### Consequence
Friction and leverage stress must be applied through the actual execution / sizing path.

---

## 2026-03-29 — V8 uses winner-only friction stress

**Area:** research process  
**Status:** active

### Decision
V8 scope is intentionally limited to:
- V7-passed configurations
- finite friction scenarios
- finite leverage-cap scenarios

### Why
This preserves discipline and avoids scope creep.

### Consequence
V8 is a realism test, not another broad brute-force search.

---

## 2026-03-29 — Current lead family is BREAKOUT_LONG

**Area:** strategy direction  
**Status:** active

### Decision
The project’s current lead family is:
`BREAKOUT_LONG`

### Why
It produced the strongest and most coherent cluster through V7 and remained viable under V8 medium-friction testing.

### Consequence
This is the current primary strategy path.

---

## 2026-03-29 — Current champion and backup selected

**Area:** strategy selection  
**Status:** active

### Champion
`TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL`

### Backup
