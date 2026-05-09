import os
import hmac
import hashlib
import time
import requests
from typing import Dict, Any, Optional
from loguru import logger

class ValrClient:
    def __init__(self):
        self.api_key = os.getenv("VALR_API_KEY")
        self.api_secret = os.getenv("VALR_API_SECRET")
        self.base_url = os.getenv("VALR_BASE_URL", "https://api.valr.com")
        
        if not self.api_key or not self.api_secret:
            logger.warning("VALR_API_KEY or VALR_API_SECRET not set. Authentication will fail.")

    def _generate_signature(self, timestamp: str, verb: str, path: str, body: str) -> str:
        """
        Generates HMAC-SHA512 signature for VALR.
        Payload: timestamp + VERB + path + body
        """
        payload = f"{timestamp}{verb.upper()}{path}{body}"
        return hmac.new(
            self.api_secret.encode("utf-8") if self.api_secret else b"",
            payload.encode("utf-8"),
            hashlib.sha512
        ).hexdigest()

    def _request(self, verb: str, path: str, body: str = "") -> requests.Response:
        url = f"{self.base_url}{path}"
        timestamp = str(int(time.time() * 1000))
        
        headers = {
            "Content-Type": "application/json"
        }
        
        if self.api_key and self.api_secret:
            signature = self._generate_signature(timestamp, verb, path, body)
            headers["X-VALR-API-KEY"] = self.api_key
            headers["X-VALR-SIGNATURE"] = signature
            headers["X-VALR-TIMESTAMP"] = timestamp

        if verb.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif verb.upper() == "POST":
            response = requests.post(url, headers=headers, data=body)
        elif verb.upper() == "DELETE":
            response = requests.delete(url, headers=headers, data=body)
        else:
            raise ValueError(f"Unsupported HTTP verb: {verb}")
            
        return response

    def get_public_status(self) -> bool:
        """
        Calls VALR status endpoint. Returns True if status is online/read-only.
        """
        response = self._request("GET", "/v1/public/status")
        response.raise_for_status()
        data = response.json()
        status = data.get("status")
        return status in ("online", "read-only")

    def get_balances(self) -> list:
        """
        Calls GET /v1/account/balances with signing headers.
        """
        response = self._request("GET", "/v1/account/balances")
        response.raise_for_status()
        return response.json()
