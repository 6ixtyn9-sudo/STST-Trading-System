-- =============================================================
-- CANONICAL CANDLE STORAGE SCHEMA
-- Dataset contract: OKX_MAJORSPOTPERP_USDT_* / CC_MAJORSPOTPERP_USDT_*
-- See: docs/DATASETS.md
-- =============================================================

-- ── dataset_registry ─────────────────────────────────────────
-- One row per named dataset ID (e.g. CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V1).
-- Dataset IDs are the first-class identity unit; never rely on implicit assumptions.

create table if not exists public.dataset_registry (
  id                  bigserial primary key,
  created_at          timestamptz default now() not null,
  dataset_id          text        not null unique,
  status              text        not null default 'active',   -- active | legacy | experimental
  source              text,                                     -- e.g. OKX, CryptoCompare
  fetch_method        text,                                     -- e.g. ccxt_python, apps_script
  description         text,
  symbol_scope        text[],
  timeframes          text[],
  observed_start      date,
  observed_end        date,
  quality_caveats     text[],
  metadata            jsonb
);

create index if not exists idx_dataset_registry_status
  on public.dataset_registry (status);


-- ── dataset_symbol_coverage ───────────────────────────────────
-- Per-symbol, per-timeframe coverage summary within a dataset.
-- Updated after every successful ingestion run.

create table if not exists public.dataset_symbol_coverage (
  id              bigserial primary key,
  created_at      timestamptz default now() not null,
  dataset_id      text        not null references public.dataset_registry(dataset_id) on delete cascade,
  symbol          text        not null,
  timeframe       text        not null,
  row_count       integer,
  first_candle_ts timestamptz,
  last_candle_ts  timestamptz,
  last_verified   timestamptz,
  unique (dataset_id, symbol, timeframe)
);

create index if not exists idx_dsc_dataset_symbol
  on public.dataset_symbol_coverage (dataset_id, symbol, timeframe);


-- ── market_candles ────────────────────────────────────────────
-- The canonical candle store.  One row per (dataset_id, symbol, timeframe, open_time).
-- Upsert-safe: unique constraint on (dataset_id, symbol, timeframe, open_time).

create table if not exists public.market_candles (
  id              bigserial primary key,
  ingested_at     timestamptz default now() not null,
  dataset_id      text        not null,
  symbol          text        not null,
  timeframe       text        not null,            -- '4H' | '1D'
  open_time       timestamptz not null,
  open            numeric     not null,
  high            numeric     not null,
  low             numeric     not null,
  close           numeric     not null,
  volume          numeric     not null,
  quote_volume    numeric,
  trades          integer,
  source          text,                            -- raw exchange label
  unique (dataset_id, symbol, timeframe, open_time)
);

create index if not exists idx_mc_dataset_symbol_tf_time
  on public.market_candles (dataset_id, symbol, timeframe, open_time desc);

create index if not exists idx_mc_open_time
  on public.market_candles (open_time desc);


-- ── ingestion_runs ────────────────────────────────────────────
-- Audit log: one row per ingestor execution (per symbol+timeframe batch).

create table if not exists public.ingestion_runs (
  id              bigserial primary key,
  started_at      timestamptz default now() not null,
  finished_at     timestamptz,
  dataset_id      text        not null,
  symbol          text        not null,
  timeframe       text        not null,
  status          text        not null default 'running',  -- running | success | partial | failed
  rows_fetched    integer     default 0,
  rows_upserted   integer     default 0,
  fetch_from_ts   timestamptz,
  fetch_to_ts     timestamptz,
  first_candle_ts timestamptz,
  last_candle_ts  timestamptz,
  error_message   text,
  metadata        jsonb
);

create index if not exists idx_ir_dataset_symbol_tf
  on public.ingestion_runs (dataset_id, symbol, timeframe, started_at desc);

create index if not exists idx_ir_status
  on public.ingestion_runs (status);


-- ── data_quality_issues ───────────────────────────────────────
-- Populated by the ingestor when gaps, anomalies, or stale data are detected.

create table if not exists public.data_quality_issues (
  id              bigserial primary key,
  detected_at     timestamptz default now() not null,
  dataset_id      text        not null,
  symbol          text        not null,
  timeframe       text        not null,
  issue_type      text        not null,   -- gap | stale | duplicate | price_anomaly | volume_zero
  severity        text        not null default 'warning', -- info | warning | critical
  description     text,
  affected_from   timestamptz,
  affected_to     timestamptz,
  metadata        jsonb,
  resolved        boolean     default false,
  resolved_at     timestamptz
);

create index if not exists idx_dqi_dataset_symbol_tf
  on public.data_quality_issues (dataset_id, symbol, timeframe, detected_at desc);

create index if not exists idx_dqi_resolved
  on public.data_quality_issues (resolved, severity);


-- =============================================================
-- PAPER TRADING EXECUTION TABLES
-- Used by python/broker_okx_demo.py to persist paper fills
-- into the Supabase memory layer so M8/M10 governance can see them.
-- =============================================================

-- ── paper_orders ─────────────────────────────────────────────
create table if not exists public.paper_orders (
  id              bigserial primary key,
  created_at      timestamptz default now() not null,
  exchange        text        not null default 'okx_demo',
  mode            text        not null default 'PAPER',
  strategy_id     text,
  symbol          text        not null,
  side            text        not null,      -- buy | sell
  order_type      text        not null,      -- market | limit
  quantity        numeric     not null,
  price           numeric,
  stop_loss       numeric,
  take_profit     numeric,
  order_id_ext    text,                      -- exchange-assigned order id
  status          text        not null default 'open', -- open | filled | cancelled | rejected
  filled_qty      numeric     default 0,
  avg_fill_price  numeric,
  commission      numeric     default 0,
  commission_ccy  text,
  filled_at       timestamptz,
  raw_response    jsonb,
  metadata        jsonb
);

create index if not exists idx_po_symbol_status
  on public.paper_orders (symbol, status, created_at desc);

create index if not exists idx_po_strategy
  on public.paper_orders (strategy_id, created_at desc);


-- ── paper_positions ───────────────────────────────────────────
create table if not exists public.paper_positions (
  id              bigserial primary key,
  opened_at       timestamptz default now() not null,
  closed_at       timestamptz,
  exchange        text        not null default 'okx_demo',
  mode            text        not null default 'PAPER',
  strategy_id     text,
  symbol          text        not null,
  side            text        not null,       -- long | short
  entry_price     numeric     not null,
  exit_price      numeric,
  quantity        numeric     not null,
  stop_loss       numeric,
  take_profit     numeric,
  pnl_gross       numeric,
  pnl_net         numeric,
  pnl_r           numeric,                   -- profit/loss in R-multiples
  max_adverse_exc numeric,                   -- MAE
  max_fav_exc     numeric,                   -- MFE
  status          text        not null default 'open', -- open | closed
  open_order_id   bigint references public.paper_orders(id),
  close_order_id  bigint references public.paper_orders(id),
  metadata        jsonb
);

create index if not exists idx_pp_symbol_status
  on public.paper_positions (symbol, status, opened_at desc);

create index if not exists idx_pp_strategy
  on public.paper_positions (strategy_id, opened_at desc);


-- ── paper_signal_queue ────────────────────────────────────────
-- Contract table between M4 signal output and paper_trade_runner.py.
-- Insert a row here (from Python, Apps Script M4, or manually) to queue a signal.
-- paper_trade_runner reads 'pending' rows, applies M8 gate, then places the order.

create table if not exists public.paper_signal_queue (
  id              bigserial primary key,
  created_at      timestamptz default now() not null,
  processed_at    timestamptz,
  strategy_id     text        not null,
  symbol          text        not null,
  side            text        not null default 'buy',  -- buy | sell
  signal_score    numeric,                              -- DQS 0–1
  suggested_qty   numeric,                              -- pre-sized from M5
  stop_loss       numeric,
  take_profit     numeric,
  dataset_id      text,                                 -- which dataset generated this
  timeframe       text,                                 -- signal timeframe
  status          text        not null default 'pending', -- pending | executed | rejected | failed | skipped
  process_note    text,
  metadata        jsonb
);

create index if not exists idx_psq_status
  on public.paper_signal_queue (status, created_at desc);

create index if not exists idx_psq_strategy
  on public.paper_signal_queue (strategy_id, created_at desc);
