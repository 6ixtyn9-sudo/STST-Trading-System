import sys
from valr_client import ValrClient
import requests
from loguru import logger

def main():
    logger.info("Starting VALR read-only smoke test...")
    client = ValrClient()

    # 1. Public Status
    try:
        res_status = client._request("GET", "/v1/public/status")
        logger.info(f"VALR GET /v1/public/status -> {res_status.status_code}")
        res_status.raise_for_status()
        logger.info(f"Public status OK: {res_status.json().get('status')}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch public status: {e}")
        print("SMOKE_OK=False")
        sys.exit(1)

    # 2. Balances
    if not client.api_key or not client.api_secret:
        logger.info("SKIPPED balances: missing credentials")
        print("SMOKE_OK=False")
        sys.exit(0)

    try:
        res_bal = client._request("GET", "/v1/account/balances")
        logger.info(f"VALR GET /v1/account/balances -> {res_bal.status_code}")
        res_bal.raise_for_status()
        balances = res_bal.json()

        logger.info(f"Number of balance entries: {len(balances)}")
        if balances:
            sample_currencies = [b.get("currency") for b in balances[:3]]
            logger.info(f"Sample currencies: {sample_currencies}")

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch balances: {e}")
        print("SMOKE_OK=False")
        sys.exit(1)

    logger.info("Smoke test completed successfully.")
    print("SMOKE_OK=True")

if __name__ == "__main__":
    main()

