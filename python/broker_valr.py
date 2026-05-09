import os
from loguru import logger
from valr_client import ValrClient

class BrokerValr:
    """
    VALR Live Broker (Option B architecture - Python REST client).
    Currently scaffolded, trading endpoints are not verified/enabled.
    """
    def __init__(self):
        self.client = ValrClient()
        self._check_live_gates()

    def _check_live_gates(self):
        """
        Hard safety check. Never allow trading in non-LIVE mode.
        """
        stst_mode = os.getenv("STST_MODE", "").upper()
        understand_live = os.getenv("I_UNDERSTAND_LIVE_TRADING", "").upper()
        
        if stst_mode != "LIVE" or understand_live != "YES":
            logger.error("Live gates failed. STST_MODE must be LIVE and I_UNDERSTAND_LIVE_TRADING must be YES.")
            raise RuntimeError("Refusing to trade in non-LIVE mode")

    def place_market_order(self, symbol: str, side: str, qty: float):
        """
        VALR endpoint: POST /v1/orders/market
        """
        self._check_live_gates()
        raise NotImplementedError("VALR market orders are scaffolded but not enabled.")

    def place_limit_order(self, symbol: str, side: str, qty: float, price: float):
        """
        VALR endpoint: POST /v1/orders/limit
        """
        self._check_live_gates()
        raise NotImplementedError("VALR limit orders are scaffolded but not enabled.")

    def get_order(self, order_id: str):
        """
        VALR endpoint: GET /v1/orders/{orderId}
        """
        self._check_live_gates()
        raise NotImplementedError("VALR get_order is scaffolded but not enabled.")

    def cancel_order(self, order_id: str):
        """
        VALR endpoint: DELETE /v1/orders/order
        """
        self._check_live_gates()
        raise NotImplementedError("VALR cancel_order is scaffolded but not enabled.")
