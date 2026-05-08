-- ============================================================
-- Dataset Registry Seed Rows
-- Run AFTER supabase_candles_schema.sql
-- Matches the three active dataset IDs in docs/DATASETS.md
-- ============================================================

insert into public.dataset_registry
  (dataset_id, status, source, fetch_method, description,
   symbol_scope, timeframes, quality_caveats)
values
  (
    'CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V1',
    'active',
    'CryptoCompare / OKX',
    'ccxt_python',
    'Current active Python-led V7/V8/V9 validation substrate. Major USDT spot+perp, max available depth.',
    ARRAY['BTC/USDT','BTC/USDT:USDT','ETH/USDT','ETH/USDT:USDT',
          'SOL/USDT','SOL/USDT:USDT','XRP/USDT','XRP/USDT:USDT',
          'DOGE/USDT','DOGE/USDT:USDT'],
    ARRAY['4H','1D'],
    ARRAY['4H depth shallower than ideal for intraday persistence truth',
          'Do not silently compare with older Apps-Script-era datasets']
  ),
  (
    'OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V2',
    'active',
    'OKX',
    'ccxt_python',
    'OKX-sourced incremental candle store. Fed by ingest_okx_to_supabase.py. V2 adds gap detection and ingestion_runs audit trail.',
    ARRAY['BTC/USDT','BTC/USDT:USDT','ETH/USDT','ETH/USDT:USDT',
          'SOL/USDT','SOL/USDT:USDT','XRP/USDT','XRP/USDT:USDT',
          'DOGE/USDT','DOGE/USDT:USDT'],
    ARRAY['4H','1D'],
    ARRAY['Verify depth after first bootstrap run','4H coverage starts ~2025-07 on some symbols']
  ),
  (
    'OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1',
    'legacy',
    'OKX',
    'ccxt_python_colab',
    'Original fresh-data persistence-hunt substrate (2026-03-27). Historically important for PERSISTENCE_HUNT_V3.',
    ARRAY['BTC/USDT','BTC/USDT:USDT','ETH/USDT','ETH/USDT:USDT',
          'SOL/USDT','SOL/USDT:USDT','XRP/USDT','XRP/USDT:USDT',
          'DOGE/USDT','DOGE/USDT:USDT'],
    ARRAY['4H','1D'],
    ARRAY['4H coverage materially shallower than V2','No longer refreshed']
  ),
  (
    'CC_MAJORSPOTPERP_2021_2026_V1',
    'legacy',
    'CryptoCompare',
    'apps_script',
    'Legacy Apps-Script-era workbook-heavy dataset. Mixed freshness, ZAR pairs included. Do not compare silently with Supabase-backed datasets.',
    ARRAY['BTC/USDT','BTC/USDTPERP','ETH/USDT','ETH/USDTPERP',
          'SOL/USDTPERP','XRP/USDT','XRP/USDTPERP',
          'BNB/ZAR','BTC/ZAR','DOGE/ZAR','ETH/ZAR','SOL/ZAR','XRP/ZAR'],
    ARRAY['4H','1D'],
    ARRAY['ZAR-influenced','mixed freshness','workbook-heavy','weaker reproducibility']
  )
on conflict (dataset_id) do update
  set status          = excluded.status,
      description     = excluded.description,
      quality_caveats = excluded.quality_caveats;
