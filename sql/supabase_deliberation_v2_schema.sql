create table if not exists public.council_deliberation_steps (
  id bigint generated always as identity primary key,
  deliberation_id bigint not null references public.council_deliberations(id),
  backtest_id text not null,
  worker_id text not null,
  phase text not null,
  output_json jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_council_deliberation_steps_delib
  on public.council_deliberation_steps(deliberation_id);

create index if not exists idx_council_deliberation_steps_backtest
  on public.council_deliberation_steps(backtest_id);

create index if not exists idx_council_deliberation_steps_worker_phase
  on public.council_deliberation_steps(worker_id, phase);
