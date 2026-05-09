# STST-Trading-System
Modular crypto algo-trading system (M1–M10) built on Apps Script, Supabase &amp; OpenRouter. Runs resumable walk-forward backtests with OOS validation across 14 spot/perp pairs. Tests strategy families (Breakout, Trend Pullback, Momo) with inverted mirrors, DQS gating, Sharpe/expectancy/drawdown filters, and AI council governance. Migrating to Python


# $T$T Trading System

A modular trading research, governance, and execution system built on Google Sheets + Apps Script, with Supabase as persistent memory and OpenRouter as bounded AI council infrastructure.

## Current Stack

- **Google Sheets** — dashboard, experiments, operational visibility
- **Apps Script** — orchestration, automation, current control plane
- **Supabase** — persistent structured memory and experiment storage
- **OpenRouter** — AI council voting / advisory layer
- **GitHub** — code, docs, architecture, project home

## Current Module Map

- **M1** — Foundation / Constitution
- **M2** — Data / Canonical History / Universe
- **M3** — Analytics / Indicators / Levels / Regime
- **M4** — Signal Engine + DQS
- **M5** — Risk + Portfolio
- **M6** — Execution Engine
- **M7** — Ops Console / Alerts / Dashboard
- **M8** — Governance / Behavior / Go-Live Gates
- **M9** — Research + Audit / Backtesting
- **M10** — Memory + Council Orchestrator

## Current Project Phase

**Research machine stabilization + persistence migration**

This means the system is already running large experiment matrices and storing experiment results, but the main priority is now to build a durable home for:

- code
- architecture
- project decisions
- datasets
- experiment history
- council history

## Strategic Goal

Build a governed research-and-deployment system that can:

1. ingest and maintain canonical market data
2. compute indicators, levels, and regime
3. generate and filter signals
4. size and risk-check trades lawfully
5. execute deterministically
6. backtest and audit strategies empirically
7. remember its own history persistently
8. eventually migrate core heavy infrastructure to Python

## Current Persistence Doctrine

If something matters, it must live in one of these places:

- **GitHub** for code and prose
- **Supabase** for structured/queryable memory
- **Sheets** for live dashboard/control surface

If it exists only in chat, it does not truly exist.

## Immediate Priorities

1. move project identity into GitHub
2. move project memory into Supabase
3. reduce dependence on chat/PDF context
4. continue experiment logging and research continuity
5. document datasets, module roles, and current state
6. prepare for later Python migration

## Notes

This repo is the permanent home of the project.  
Chats are temporary working sessions, not canonical memory.

## VALR Setup (Python Option B)

To use the Python VALR client (`VALR_READONLY` or `VALR_LIVE`), you must configure credentials via `.env` variables.

**Requirements:**
1. Enable **2FA** on your VALR account.
2. Create an API key with **View-only** permissions (recommended for MVP).
3. If intending to trade in the future (once enabled), ensure the key has **Trade** permissions.

**Configuration (`.env` file):**
```ini
VALR_API_KEY="your_api_key_here"
VALR_API_SECRET="your_api_secret_here"
STST_MODE="PAPER" # Must be "LIVE" to allow trading
I_UNDERSTAND_LIVE_TRADING="YES" # Required explicitly for live trading
```

**Notes:**
- Smoke test skips balances if keys are not set.
- Signature tests use VALR official vectors (GET + POST).
- Rate-limit behavior: GET retries on 429 with Retry-After; trading calls fail closed.
