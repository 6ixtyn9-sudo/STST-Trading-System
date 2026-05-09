import os
import sys
from supabase import create_client
from config import cfg

def run():
    sb = create_client(cfg.supabase_url, cfg.supabase_key)
    # Insert a test signal
    sb.table("paper_signal_queue").insert({
        "strategy_id": "V9_TEST_SIGNAL",
        "symbol": "BTC/USDT:USDT",
        "side": "buy",
        "signal_score": 0.99,
        "suggested_qty": 0.001,
        "stop_loss": 50000,
        "take_profit": 100000,
        "status": "pending"
    }).execute()
    print("=== SEEDED TEST SIGNAL ===")

if __name__ == "__main__":
    run()
