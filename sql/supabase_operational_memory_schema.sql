-- =========================================================
-- OPERATIONAL MEMORY TABLES
-- =========================================================

create table if not exists public.experiment_logs (
  id bigserial primary key,
  created_at timestamptz default now() not null,
  strategy_id text,
  run_name text,
  mode text,
  universe_mode text,
  backtest_id text,
  config_snapshot jsonb,
  total_trades integer,
  oos_total_trades integer,
  win_rate_total numeric,
  profit_factor numeric,
  expectancy_r numeric,
  max_drawdown_pct numeric,
  sharpe_ratio numeric,
  oos_passed boolean,
  oos_fail_reasons_json jsonb,
  setup_confirmed integer,
  confirmed_queued integer,
  rejected_dqs_after_confirm integer,
  pending_filled integer,
  dqs_summary jsonb
);

create table if not exists public.diagnostic_notes (
  id bigserial primary key,
  created_at timestamptz default now() not null,
  backtest_id text,
  note_type text,
  author_type text,
  content text
);

create table if not exists public.council_deliberations (
  id bigserial primary key,
  created_at timestamptz default now() not null,
  backtest_id text,
  strategy_id text,
  governance_state text,
  governance_packet jsonb,
  policy_packet jsonb,
  evaluation jsonb,
  metrics jsonb,
  diagnostics jsonb,
  dqs_summary jsonb,
  risk_officer_vote text default 'PENDING',
  risk_officer_rationale text,
  strategy_scout_vote text default 'PENDING',
  strategy_scout_rationale text,
  quant_auditor_vote text default 'PENDING',
  quant_auditor_rationale text,
  consensus_reached boolean default false,
  president_override text default 'PENDING',
  final_decision text default 'HOLD'
);

create index if not exists idx_experiment_logs_backtest_id
  on public.experiment_logs (backtest_id);

create index if not exists idx_notes_backtest_id
  on public.diagnostic_notes (backtest_id);

create index if not exists idx_council_backtest_id
  on public.council_deliberations (backtest_id);
