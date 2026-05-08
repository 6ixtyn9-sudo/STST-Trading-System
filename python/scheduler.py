"""
scheduler.py — Periodic refresh scheduler for the STST Python runtime.

Schedule
────────
  4H candles  → every 4 hours, offset +5 min after candle close
  1D candles  → daily at 00:10 UTC

Run it as a long-lived process:
  python scheduler.py

Or run a single job immediately (useful for cron / GitHub Actions):
  python scheduler.py --run-now [4h|1d|all]
"""
from __future__ import annotations
import argparse, sys
from datetime import datetime, timezone

import schedule
import time
from loguru import logger

from ingest_okx_to_supabase import run_full_ingest

logger.remove()
logger.add(sys.stderr, format="<green>{time:HH:mm:ss}</green> | <level>{level:<8}</level> | {message}")
logger.add("logs/scheduler_{time:YYYY-MM-DD}.log", rotation="00:00", retention="14 days")


def _run_4h():
    logger.info(f"[Scheduler] 4H ingest triggered at {datetime.now(timezone.utc).isoformat()}")
    run_full_ingest(timeframes=["4h"])


def _run_1d():
    logger.info(f"[Scheduler] 1D ingest triggered at {datetime.now(timezone.utc).isoformat()}")
    run_full_ingest(timeframes=["1d"])


def _run_all():
    logger.info(f"[Scheduler] Full ingest triggered at {datetime.now(timezone.utc).isoformat()}")
    run_full_ingest(timeframes=["4h", "1d"])


def main_loop():
    # 4H candles — fire every 4 hours at :05 past the hour
    schedule.every(4).hours.at(":05").do(_run_4h)
    # 1D candles — fire daily at 00:10 UTC
    schedule.every().day.at("00:10").do(_run_1d)

    logger.info("Scheduler running. Press Ctrl-C to stop.")
    logger.info(f"Next 4H job: {schedule.next_run()}")

    while True:
        schedule.run_pending()
        time.sleep(30)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--run-now", choices=["4h", "1d", "all"], default=None,
                   help="Run a single ingest immediately and exit.")
    a = p.parse_args()

    if a.run_now == "4h":
        _run_4h()
    elif a.run_now == "1d":
        _run_1d()
    elif a.run_now == "all":
        _run_all()
    else:
        main_loop()
