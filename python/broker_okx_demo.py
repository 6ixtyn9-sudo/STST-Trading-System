"""
broker_okx_demo.py — OKX Demo (paper) trading adapter.

Uses CCXT okx exchange with sandbox mode ON.
All orders are written into Supabase paper_orders + paper_positions tables
so M8 governance and M10 memory can see what happened.

Hard gates
──────────
• cfg.assert_paper_mode() is called at construction — refuses to run if STST_MODE != PAPER.
• cfg.require_live_keys() is called at construction — refuses to run without OKX keys.
• OKX demo keys must be created at https://www.okx.com/demo-trading

Usage
─────
  from broker_okx_demo import PaperBroker
  broker = PaperBroker()
  order = broker.place_market_order("BTC/USDT:USDT", side="buy", quantity=0.01, strategy_id="V9_BREAKOUT_LONG")
  broker.close_position(position_id=order["position_id"])
"""
from __future__ import annotations
import sys
from datetime import datetime, timezone
from typing import Optional

import ccxt
from loguru import logger
from supabase import create_client, Client

from config import cfg

logger.remove()
logger.add(sys.stderr, format="<green>{time:HH:mm:ss}</green> | <level>{level:<8}</level> | {message}")


class PaperBroker:
    """
    OKX Demo trading broker that persists all activity to Supabase.
    Raises immediately if mode != PAPER or OKX keys are missing.
    """

    def __init__(self):
        cfg.assert_paper_mode()
        cfg.require_live_keys()

        self._exchange = ccxt.okx({
            "apiKey":     cfg.okx_api_key,
            "secret":     cfg.okx_api_secret,
            "password":   cfg.okx_passphrase,
            "enableRateLimit": True,
            "options": {"defaultType": "swap"},
        })
        self._exchange.set_sandbox_mode(True)   # ← OKX demo environment
        self._sb: Client = create_client(cfg.supabase_url, cfg.supabase_key)
        logger.info("PaperBroker initialised | exchange=OKX_DEMO | mode=PAPER")

    # ── Market data helpers ───────────────────────────────────

    def get_ticker(self, symbol: str) -> dict:
        return self._exchange.fetch_ticker(symbol)

    def get_mid_price(self, symbol: str) -> float:
        t = self.get_ticker(symbol)
        return (t["bid"] + t["ask"]) / 2

    # ── Order placement ───────────────────────────────────────

    def place_market_order(
        self,
        symbol:       str,
        side:         str,            # 'buy' | 'sell'
        quantity:     float,
        strategy_id:  Optional[str] = None,
        stop_loss:    Optional[float] = None,
        take_profit:  Optional[float] = None,
    ) -> dict:
        """
        Place a market order on OKX demo, persist to Supabase.
        Returns the paper_orders row dict.
        """
        logger.info(f"[{symbol}] Placing PAPER market {side.upper()} qty={quantity}")

        raw = self._exchange.create_market_order(symbol, side, quantity)
        logger.debug(f"[{symbol}] Exchange response: {raw}")

        fill_price = raw.get("average") or raw.get("price") or self.get_mid_price(symbol)
        status     = "filled" if raw.get("status") == "closed" else "open"

        row = {
            "exchange":       "okx_demo",
            "mode":           "PAPER",
            "strategy_id":    strategy_id,
            "symbol":         symbol,
            "side":           side.lower(),
            "order_type":     "market",
            "quantity":       quantity,
            "stop_loss":      stop_loss,
            "take_profit":    take_profit,
            "order_id_ext":   raw.get("id"),
            "status":         status,
            "filled_qty":     raw.get("filled", quantity),
            "avg_fill_price": fill_price,
            "commission":     raw.get("fee", {}).get("cost", 0) if raw.get("fee") else 0,
            "commission_ccy": raw.get("fee", {}).get("currency") if raw.get("fee") else None,
            "filled_at":      datetime.now(timezone.utc).isoformat() if status == "filled" else None,
            "raw_response":   raw,
        }
        r = self._sb.table("paper_orders").insert(row).execute()
        order_row = r.data[0]
        logger.success(f"[{symbol}] Order recorded | id={order_row['id']} fill={fill_price}")

        # Open a position row if this is an entry
        if side.lower() == "buy":
            self._open_position(order_row, symbol, strategy_id, fill_price, quantity)

        return order_row

    def close_position(self, position_id: int, strategy_id: Optional[str] = None) -> dict:
        """
        Close an open paper_positions row by placing the offsetting market order.
        Calculates PnL and writes the closed row back.
        """
        pos_r = self._sb.table("paper_positions").select("*").eq("id", position_id).execute()
        if not pos_r.data:
            raise ValueError(f"No paper_position found with id={position_id}")
        pos = pos_r.data[0]

        if pos["status"] != "open":
            raise ValueError(f"Position {position_id} is already {pos['status']}")

        symbol      = pos["symbol"]
        entry_price = float(pos["entry_price"])
        qty         = float(pos["quantity"])
        close_side  = "sell" if pos["side"] == "long" else "buy"

        close_order = self.place_market_order(
            symbol, close_side, qty, strategy_id=strategy_id or pos.get("strategy_id")
        )

        exit_price = float(close_order.get("avg_fill_price") or self.get_mid_price(symbol))
        pnl_gross  = (exit_price - entry_price) * qty if pos["side"] == "long" else (entry_price - exit_price) * qty
        commission = float(pos.get("commission") or 0) + float(close_order.get("commission") or 0)
        pnl_net    = pnl_gross - commission
        risk       = abs(entry_price - float(pos.get("stop_loss") or entry_price * 0.97)) * qty
        pnl_r      = pnl_net / risk if risk > 0 else None

        self._sb.table("paper_positions").update({
            "closed_at":      datetime.now(timezone.utc).isoformat(),
            "exit_price":     exit_price,
            "pnl_gross":      pnl_gross,
            "pnl_net":        pnl_net,
            "pnl_r":          pnl_r,
            "status":         "closed",
            "close_order_id": close_order["id"],
        }).eq("id", position_id).execute()

        logger.success(f"[{symbol}] Position {position_id} closed | pnl_net={pnl_net:.4f} pnl_r={pnl_r}")
        return {"position_id": position_id, "pnl_net": pnl_net, "pnl_r": pnl_r}

    def list_open_positions(self) -> list[dict]:
        r = self._sb.table("paper_positions").select("*").eq("status", "open").execute()
        return r.data or []

    def get_balance(self) -> dict:
        return self._exchange.fetch_balance()

    # ── Internal helpers ──────────────────────────────────────

    def _open_position(self, order_row: dict, symbol: str,
                       strategy_id: Optional[str], entry_price: float, qty: float):
        self._sb.table("paper_positions").insert({
            "exchange":      "okx_demo",
            "mode":          "PAPER",
            "strategy_id":   strategy_id,
            "symbol":        symbol,
            "side":          "long",
            "entry_price":   entry_price,
            "quantity":      qty,
            "status":        "open",
            "open_order_id": order_row["id"],
        }).execute()
