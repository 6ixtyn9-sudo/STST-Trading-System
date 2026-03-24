-- =========================================================
-- PROJECT BRAIN TABLES
-- =========================================================

create table if not exists public.module_registry (
  module_id text primary key,
  name text not null,
  role text not null,
  status text not null default 'active',
  layer text,
  live_critical boolean not null default false,
  research_critical boolean not null default false,
  persistence_status text not null default 'partial',
  migration_target text,
  summary text,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.decision_log (
  id bigint generated always as identity primary key,
  title text not null,
  area text not null,
  rationale text not null,
  impact text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.dataset_registry (
  dataset_id text primary key,
  source text not null,
  scope text,
  start_date date,
  end_date date,
  symbol_count integer,
  timeframe_set text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_snapshots (
  id bigint generated always as identity primary key,
  snapshot_name text not null,
  summary text not null,
  snapshot_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.active_todos (
  id bigint generated always as identity primary key,
  title text not null,
  area text not null,
  priority text not null default 'MEDIUM',
  status text not null default 'OPEN',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_chunks (
  id bigint generated always as identity primary key,
  source_type text not null,
  source_name text not null,
  tags text,
  summary text,
  content text not null,
  created_at timestamptz not null default now()
);
