"""
ingest_okx_to_supabase.py — OKX → CCXT → Supabase candle ingestor.

Steps per (symbol, timeframe):
  1. Open an ingestion_runs row (status='running').
  2. Find the latest stored candle timestamp.
  3. Fetch new candles from OKX (public, no API key needed).
  4. Upsert into market_candles.
  5. Update dataset_symbol_coverage.
  6. Close the ingestion_runs row (success | failed).
  7. Flag gaps into data_quality_issues.

Usage:
  python ingest_okx_to_supabase.py [--dataset-id ID] [--symbols S …] [--timeframes T …] [--dry-run]
"""
from __future__ import annotations
import argparse, sys, time
from datetime import datetime, timezone
from typing import Optional

import ccxt
import pandas as pd
from loguru import logger
from supabase import create_client, Client

from config import cfg

logger.remove()
logger.add(sys.stderr, format="<green>{time:HH:mm:ss}</green> | <level>{level:<8}</level> | {message}")
logger.add("logs/ingest_okx_{time:YYYY-MM-DD}.log", rotation="00:00", retention="14 days", level="DEBUG")

_okx = ccxt.okx({"enableRateLimit": True, "options": {"defaultType": "swap"}})


def _sb() -> Client:
    return create_client(cfg.supabase_url, cfg.supabase_key)


def _last_ts(sb: Client, ds: str, sym: str, tf: str) -> Optional[datetime]:
    r = (sb.table("market_candles").select("open_time")
           .eq("dataset_id", ds).eq("symbol", sym).eq("timeframe", tf)
           .order("open_time", desc=True).limit(1).execute())
    if r.data:
        return datetime.fromisoformat(r.data[0]["open_time"].replace("Z", "+00:00"))
    return None


def _open_run(sb: Client, ds: str, sym: str, tf: str, since: Optional[datetime]) -> int:
    r = sb.table("ingestion_runs").insert({
        "dataset_id": ds, "symbol": sym, "timeframe": tf,
        "status": "running",
        "fetch_from_ts": since.isoformat() if since else None,
    }).execute()
    return r.data[0]["id"]


def _close_run(sb: Client, run_id: int, status: str, fetched: int, upserted: int,
               first: Optional[datetime], last: Optional[datetime], err: Optional[str] = None):
    sb.table("ingestion_runs").update({
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "status": status, "rows_fetched": fetched, "rows_upserted": upserted,
        "first_candle_ts": first.isoformat() if first else None,
        "last_candle_ts": last.isoformat() if last else None,
        "error_message": err,
    }).eq("id", run_id).execute()


def _update_coverage(sb: Client, ds: str, sym: str, tf: str,
                     delta: int, first: datetime, last: datetime):
    r = (sb.table("dataset_symbol_coverage").select("row_count")
           .eq("dataset_id", ds).eq("symbol", sym).eq("timeframe", tf).execute())
    existing = r.data[0]["row_count"] if r.data else 0
    sb.table("dataset_symbol_coverage").upsert({
        "dataset_id": ds, "symbol": sym, "timeframe": tf,
        "row_count": (existing or 0) + delta,
        "first_candle_ts": first.isoformat(), "last_candle_ts": last.isoformat(),
        "last_verified": datetime.now(timezone.utc).isoformat(),
    }, on_conflict="dataset_id,symbol,timeframe").execute()


def _flag_gap(sb: Client, ds: str, sym: str, tf: str, gfrom: datetime, gto: datetime):
    sb.table("data_quality_issues").insert({
        "dataset_id": ds, "symbol": sym, "timeframe": tf,
        "issue_type": "gap", "severity": "warning",
        "description": f"Missing candles between {gfrom} and {gto}",
        "affected_from": gfrom.isoformat(), "affected_to": gto.isoformat(),
    }).execute()


def _fetch(symbol: str, tf_ccxt: str, since: Optional[datetime]) -> pd.DataFrame:
    since_ms = int(since.timestamp() * 1000) + 1 if since else None
    rows: list = []
    while True:
        batch = _okx.fetch_ohlcv(symbol, timeframe=tf_ccxt, since=since_ms, limit=cfg.batch_limit)
        if not batch:
            break
        rows.extend(batch)
        if len(batch) < cfg.batch_limit:
            break
        since_ms = batch[-1][0] + 1
        time.sleep(0.25)

    if not rows:
        return pd.DataFrame(columns=["open_time","open","high","low","close","volume","quote_volume"])
    df = pd.DataFrame(rows, columns=["ts_ms","open","high","low","close","volume","quote_volume"])
    df["open_time"] = pd.to_datetime(df["ts_ms"], unit="ms", utc=True)
    return df.drop(columns=["ts_ms"]).sort_values("open_time").drop_duplicates("open_time")


def _gaps(df: pd.DataFrame, tf: str) -> list[tuple[datetime, datetime]]:
    if len(df) < 2:
        return []
    exp = pd.Timedelta(hours=4) if tf in ("4h","4H") else pd.Timedelta(days=1)
    times = df["open_time"].tolist()
    return [(times[i-1], times[i]) for i in range(1, len(times)) if times[i] - times[i-1] > exp * 2]


def ingest_symbol(sb: Client, dataset_id: str, symbol: str, tf: str, dry_run: bool = False) -> dict:
    tf_db   = tf.upper()
    tf_ccxt = tf.lower()
    logger.info(f"[{symbol}|{tf_db}] ingesting …")

    last   = _last_ts(sb, dataset_id, symbol, tf_db)
    run_id = _open_run(sb, dataset_id, symbol, tf_db, last) if not dry_run else -1

    try:
        df = _fetch(symbol, tf_ccxt, last)
        if df.empty:
            logger.info(f"[{symbol}|{tf_db}] already up to date.")
            if not dry_run: _close_run(sb, run_id, "success", 0, 0, None, None)
            return {"symbol": symbol, "timeframe": tf_db, "status": "up_to_date", "rows_upserted": 0}

        first_ts = df["open_time"].iloc[0].to_pydatetime()
        last_ts  = df["open_time"].iloc[-1].to_pydatetime()
        logger.info(f"[{symbol}|{tf_db}] fetched {len(df)} candles ({first_ts.date()} → {last_ts.date()})")

        detected_gaps = _gaps(df, tf)
        if detected_gaps:
            logger.warning(f"[{symbol}|{tf_db}] {len(detected_gaps)} gap(s) detected")
            if not dry_run:
                for gs, ge in detected_gaps:
                    _flag_gap(sb, dataset_id, symbol, tf_db, gs.to_pydatetime(), ge.to_pydatetime())

        if dry_run:
            return {"symbol": symbol, "timeframe": tf_db, "status": "dry_run", "rows_fetched": len(df)}

        records = [{
            "dataset_id": dataset_id, "symbol": symbol, "timeframe": tf_db,
            "open_time": row["open_time"].isoformat(),
            "open": float(row["open"]), "high": float(row["high"]),
            "low":  float(row["low"]),  "close": float(row["close"]),
            "volume": float(row["volume"]),
            "quote_volume": float(row["quote_volume"]) if pd.notna(row.get("quote_volume")) else None,
            "source": "OKX",
        } for _, row in df.iterrows()]

        upserted = 0
        for i in range(0, len(records), 500):
            sb.table("market_candles").upsert(
                records[i:i+500], on_conflict="dataset_id,symbol,timeframe,open_time"
            ).execute()
            upserted += len(records[i:i+500])

        _update_coverage(sb, dataset_id, symbol, tf_db, upserted, first_ts, last_ts)
        _close_run(sb, run_id, "success", len(df), upserted, first_ts, last_ts)
        logger.success(f"[{symbol}|{tf_db}] done — {upserted} rows upserted.")
        return {"symbol": symbol, "timeframe": tf_db, "status": "success", "rows_upserted": upserted}

    except Exception as exc:
        err = str(exc)
        logger.error(f"[{symbol}|{tf_db}] FAILED: {err}")
        if not dry_run and run_id != -1:
            _close_run(sb, run_id, "failed", 0, 0, None, None, error=err)
        return {"symbol": symbol, "timeframe": tf_db, "status": "failed", "error": err}


def run_full_ingest(dataset_id: Optional[str] = None, symbols: Optional[list[str]] = None,
                    timeframes: Optional[list[str]] = None, dry_run: bool = False) -> list[dict]:
    ds  = dataset_id or cfg.okx_dataset_id
    syms = symbols   or cfg.symbols
    tfs  = timeframes or cfg.timeframes
    sb   = _sb()
    results: list[dict] = []
    logger.info(f"=== Ingest start | dataset={ds} | symbols={len(syms)} | tfs={tfs} ===")
    for tf in tfs:
        for sym in syms:
            results.append(ingest_symbol(sb, ds, sym, tf, dry_run=dry_run))
            time.sleep(cfg.sleep_seconds)
    failed = [r for r in results if r["status"] == "failed"]
    logger.info(f"=== Ingest done | total={len(results)} failed={len(failed)} ===")
    return results


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--dataset-id", default=None)
    p.add_argument("--symbols", nargs="+", default=None)
    p.add_argument("--timeframes", nargs="+", default=None)
    p.add_argument("--dry-run", action="store_true")
    a = p.parse_args()
    res = run_full_ingest(a.dataset_id, a.symbols, a.timeframes, a.dry_run)
    sys.exit(1 if any(r["status"] == "failed" for r in res) else 0)
