"""
paper_trade_runner.py — Signal → OKX Demo Broker execution loop.

This is the wiring layer between M4 signal output (read from Supabase
experiment_logs / a signals table) and the PaperBroker.

Workflow
────────
  1. Load open paper positions from Supabase.
  2. Check each open position for exit conditions (stop-loss / take-profit hit).
  3. Load pending signals from the signal queue table.
  4. For each approved signal: check M8 gate → size → place order via PaperBroker.
  5. Log everything to paper_orders + paper_positions + diagnostic_notes.

Signal contract (what this runner expects in `paper_signal_queue`)
──────────────────────────────────────────────────────────────────
  symbol          text    e.g. 'BTC/USDT:USDT'
  side            text    'buy' | 'sell'
  strategy_id     text    e.g. 'V9_BREAKOUT_LONG'
  signal_score    numeric DQS score (0–1)
  suggested_qty   numeric pre-sized quantity from M5
  stop_loss       numeric absolute price level
  take_profit     numeric absolute price level
  status          text    'pending' → set to 'executed' | 'rejected' | 'skipped'

Usage
─────
  python paper_trade_runner.py              # process queue once and exit
  python paper_trade_runner.py --loop 60   # poll every 60 seconds
  python paper_trade_runner.py --dry-run   # evaluate signals, print decisions, no orders
"""
from __future__ import annotations
import argparse, sys, time
from datetime import datetime, timezone
from typing import Optional

from loguru import logger
from supabase import create_client, Client

from config import cfg
from broker_okx_demo import PaperBroker

logger.remove()
logger.add(sys.stderr, format="<green>{time:HH:mm:ss}</green> | <level>{level:<8}</level> | {message}")
logger.add("logs/paper_runner_{time:YYYY-MM-DD}.log", rotation="00:00", retention="14 days")

# ── M8 gate constants ─────────────────────────────────────────
MIN_DQS_SCORE   = 0.60   # minimum signal quality score to allow execution
MAX_OPEN_POSITIONS = 5   # hard cap on concurrent paper positions


# ─────────────────────────────────────────────────────────────
# Supabase helpers
# ─────────────────────────────────────────────────────────────

def _sb() -> Client:
    return create_client(cfg.supabase_url, cfg.supabase_key)


def _load_pending_signals(sb: Client) -> list[dict]:
    r = (sb.table("paper_signal_queue")
           .select("*")
           .eq("status", "pending")
           .order("created_at")
           .execute())
    return r.data or []


def _claim_signal(sb: Client, signal_id: int) -> bool:
    r = sb.table("paper_signal_queue").update({"status": "processing"}).eq("id", signal_id).eq("status", "pending").execute()
    return len(r.data) > 0


def _mark_signal(sb: Client, signal_id: int, status: str, note: str = "") -> None:
    sb.table("paper_signal_queue").update({
        "status":       status,
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "process_note": note,
    }).eq("id", signal_id).execute()


def _write_diagnostic(sb: Client, note_type: str, content: str,
                       backtest_id: Optional[str] = None) -> None:
    sb.table("diagnostic_notes").insert({
        "backtest_id": backtest_id,
        "note_type":   note_type,
        "author_type": "paper_runner",
        "content":     content,
    }).execute()


def _count_open_positions(sb: Client) -> int:
    r = sb.table("paper_positions").select("id", count="exact").eq("status", "open").execute()
    return r.count or 0


def _check_exits(sb: Client, broker: PaperBroker) -> int:
    """
    Check all open positions for stop-loss / take-profit breach.
    Returns number of positions closed.
    """
    positions = broker.list_open_positions()
    closed = 0
    for pos in positions:
        symbol      = pos["symbol"]
        entry_price = float(pos["entry_price"])

        try:
            mid = broker.get_mid_price(symbol)
        except Exception as exc:
            logger.warning(f"[{symbol}] Could not fetch price for exit check: {exc}")
            continue

        sl = float(pos["stop_loss"]) if pos.get("stop_loss") else None
        tp = float(pos["take_profit"]) if pos.get("take_profit") else None

        reason = None
        if sl and mid <= sl:
            reason = f"SL hit @ {mid:.4f} (SL={sl:.4f})"
        elif tp and mid >= tp:
            reason = f"TP hit @ {mid:.4f} (TP={tp:.4f})"

        if reason:
            logger.info(f"[{symbol}] Closing position {pos['id']} — {reason}")
            result = broker.close_position(pos["id"])
            _write_diagnostic(sb, "exit", f"Position {pos['id']} closed: {reason} | pnl_r={result.get('pnl_r')}")
            closed += 1

    return closed


# ─────────────────────────────────────────────────────────────
# M8 gate
# ─────────────────────────────────────────────────────────────

def _m8_approve(signal: dict, open_count: int) -> tuple[bool, str]:
    """
    Lightweight M8 governance gate for paper execution.
    Returns (approved: bool, reason: str).
    """
    score = float(signal.get("signal_score") or 0)
    if score < MIN_DQS_SCORE:
        return False, f"DQS score {score:.2f} < threshold {MIN_DQS_SCORE}"

    if open_count >= MAX_OPEN_POSITIONS:
        return False, f"Position cap reached ({open_count}/{MAX_OPEN_POSITIONS})"

    qty = float(signal.get("suggested_qty") or 0)
    if qty <= 0:
        return False, "suggested_qty is zero or missing"

    return True, "M8 approved"


# ─────────────────────────────────────────────────────────────
# Core loop
# ─────────────────────────────────────────────────────────────

def process_once(broker: PaperBroker, sb: Client, dry_run: bool = False) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    logger.info(f"=== Paper runner cycle @ {now} ===")

    # 1. Check exits on open positions
    exits = _check_exits(sb, broker) if not dry_run else 0

    # 2. Load pending signals
    signals = _load_pending_signals(sb)
    logger.info(f"Pending signals: {len(signals)} | exits this cycle: {exits}")

    executed = rejected = skipped = 0

    for sig in signals:
        sid    = sig["id"]
        symbol = sig["symbol"]
        side   = sig.get("side", "buy")
        qty    = float(sig.get("suggested_qty") or 0)

        open_count = _count_open_positions(sb)
        approved, reason = _m8_approve(sig, open_count)

        if not approved:
            logger.warning(f"[{symbol}] Signal {sid} REJECTED — {reason}")
            if not dry_run:
                _mark_signal(sb, sid, "rejected", reason)
                _write_diagnostic(sb, "rejection", f"Signal {sid} rejected: {reason}")
            rejected += 1
            continue

        logger.info(f"[{symbol}] Signal {sid} APPROVED — {side} qty={qty} score={sig.get('signal_score')}")

        if dry_run:
            logger.info(f"[{symbol}] DRY RUN — skipping order placement.")
            skipped += 1
            continue

        if not _claim_signal(sb, sid):
            logger.info(f"[{symbol}] Signal {sid} already claimed or no longer pending.")
            skipped += 1
            continue

        try:
            order = broker.place_market_order(
                symbol      = symbol,
                side        = side,
                quantity    = qty,
                strategy_id = sig.get("strategy_id"),
                stop_loss   = float(sig["stop_loss"])   if sig.get("stop_loss")   else None,
                take_profit = float(sig["take_profit"])  if sig.get("take_profit") else None,
            )
            _mark_signal(sb, sid, "executed", f"order_id={order['id']}")
            _write_diagnostic(
                sb, "execution",
                f"Signal {sid} executed: {side} {qty} {symbol} @ order_id={order['id']}",
            )
            executed += 1

        except Exception as exc:
            err = str(exc)
            logger.error(f"[{symbol}] Execution failed for signal {sid}: {err}")
            _mark_signal(sb, sid, "failed", err)
            skipped += 1

    summary = {"executed": executed, "rejected": rejected, "skipped": skipped, "exits": exits}
    logger.info(f"=== Cycle done | {summary} ===")
    return summary


def run_loop(interval_seconds: int, dry_run: bool = False) -> None:
    broker = PaperBroker()
    sb     = _sb()
    while True:
        try:
            process_once(broker, sb, dry_run=dry_run)
        except Exception as exc:
            logger.error(f"Runner cycle error: {exc}")
        logger.info(f"Sleeping {interval_seconds}s …")
        time.sleep(interval_seconds)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="STST paper trade runner")
    p.add_argument("--loop", type=int, default=0,
                   help="Poll interval in seconds (0 = run once and exit)")
    p.add_argument("--dry-run", action="store_true",
                   help="Evaluate signals but place no orders")
    a = p.parse_args()

    if a.loop > 0:
        run_loop(a.loop, dry_run=a.dry_run)
    else:
        broker = PaperBroker()
        sb     = _sb()
        result = process_once(broker, sb, dry_run=a.dry_run)
        sys.exit(0)
