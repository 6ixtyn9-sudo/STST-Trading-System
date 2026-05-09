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

    def _request(self, verb: str, path: str, body: str = "", max_retries: int = 3) -> requests.Response:
        url = f"{self.base_url}{path}"
        
        for attempt in range(max_retries):
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
                
            logger.info(f"VALR {verb.upper()} {path} -> {response.status_code}")
            
            if response.status_code == 429:
                if verb.upper() == "GET" and attempt < max_retries - 1:
                    retry_after = response.headers.get("Retry-After")
                    sleep_time = 1
                    if retry_after and retry_after.isdigit():
                        sleep_time = min(int(retry_after), 10)
                    
                    logger.warning(f"Rate limited (429) on {path}. Retrying in {sleep_time}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(sleep_time)
                    continue
                else:
                    logger.error(f"Rate limited (429) on {verb.upper()} {path}. Failing closed.")
                    response.raise_for_status()
                    
            return response
            
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
