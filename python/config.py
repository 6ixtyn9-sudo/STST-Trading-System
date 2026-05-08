"""
config.py — Central configuration for the STST Python runtime layer.

All secrets are sourced from environment variables (or a .env file at
the project root).  No secrets are ever hard-coded here.

Usage:
    from config import cfg

Then use cfg.supabase_url, cfg.okx_api_key, etc.
"""

import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

# Load .env from the project root (two levels up from python/)
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(_ROOT, ".env"), override=False)


def _require(key: str) -> str:
    val = os.getenv(key)
    if not val:
        raise EnvironmentError(
            f"Required environment variable '{key}' is not set. "
            f"Add it to your .env file at the project root."
        )
    return val


def _optional(key: str, default: str = "") -> str:
    return os.getenv(key, default)


# ── Active dataset IDs ────────────────────────────────────────
# Change these when you mint a new dataset version (see docs/DATASETS.md).
ACTIVE_DATASET_ID = _optional(
    "STST_ACTIVE_DATASET_ID",
    "CC_MAJORSPOTPERP_USDT_MAXDEPTH_2026_SUPABASE_V1",
)

OKX_DATASET_ID = _optional(
    "STST_OKX_DATASET_ID",
    "OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V2",
)

# ── Canonical universe ─────────────────────────────────────────
CANONICAL_SYMBOLS: list[str] = [
    "BTC/USDT",
    "BTC/USDT:USDT",   # OKX perp notation for BTC/USDTPERP
    "ETH/USDT",
    "ETH/USDT:USDT",
    "SOL/USDT",
    "SOL/USDT:USDT",
    "XRP/USDT",
    "XRP/USDT:USDT",
    "DOGE/USDT",
    "DOGE/USDT:USDT",
]

CANONICAL_TIMEFRAMES: list[str] = ["4h", "1d"]   # ccxt uses lowercase

# ── Ingestor knobs ────────────────────────────────────────────
INGEST_BATCH_LIMIT   = int(_optional("STST_INGEST_BATCH_LIMIT", "1000"))
INGEST_SLEEP_SECONDS = float(_optional("STST_INGEST_SLEEP_SECONDS", "0.4"))


@dataclass
class Config:
    # Supabase
    supabase_url: str = field(default_factory=lambda: _require("SUPABASE_URL"))
    supabase_key: str = field(default_factory=lambda: _require("SUPABASE_SERVICE_ROLE_KEY"))

    # OKX (only needed for paper/live trading, not for public data ingestion)
    okx_api_key:    str = field(default_factory=lambda: _optional("OKX_API_KEY"))
    okx_api_secret: str = field(default_factory=lambda: _optional("OKX_API_SECRET"))
    okx_passphrase: str = field(default_factory=lambda: _optional("OKX_PASSPHRASE"))

    # Runtime mode  PAPER | LIVE
    mode: str = field(default_factory=lambda: _optional("STST_MODE", "PAPER"))

    # Dataset IDs
    active_dataset_id: str = field(default_factory=lambda: ACTIVE_DATASET_ID)
    okx_dataset_id:    str = field(default_factory=lambda: OKX_DATASET_ID)

    # Universe
    symbols:     list[str] = field(default_factory=lambda: CANONICAL_SYMBOLS)
    timeframes:  list[str] = field(default_factory=lambda: CANONICAL_TIMEFRAMES)

    # Ingestor
    batch_limit:   int   = field(default_factory=lambda: INGEST_BATCH_LIMIT)
    sleep_seconds: float = field(default_factory=lambda: INGEST_SLEEP_SECONDS)

    def require_live_keys(self) -> None:
        """Raise early if OKX keys are absent (call before placing any order)."""
        for attr, env in [
            ("okx_api_key",    "OKX_API_KEY"),
            ("okx_api_secret", "OKX_API_SECRET"),
            ("okx_passphrase", "OKX_PASSPHRASE"),
        ]:
            if not getattr(self, attr):
                raise EnvironmentError(
                    f"'{env}' is required for OKX trading but is not set."
                )

    def assert_paper_mode(self) -> None:
        """Hard-gate: refuse to continue unless mode == PAPER."""
        if self.mode.upper() != "PAPER":
            raise RuntimeError(
                f"STST_MODE is '{self.mode}' but this guard requires PAPER mode. "
                "Set STST_MODE=PAPER in your .env to use the paper broker."
            )


# Singleton — import and use everywhere
cfg = Config()
