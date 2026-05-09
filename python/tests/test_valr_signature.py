import os
from valr_client import ValrClient

# ──────────────────────────────────────────────────────────────────────
# Source: VALR Authentication docs ("Test data" section), retrieved 2026-05-09
# https://docs.valr.com  →  Authentication  →  "If you choose to write
# your own method..."
# ──────────────────────────────────────────────────────────────────────

# Shared test API secret (public, from VALR docs – not a real account secret)
_TEST_SECRET = "4961b74efac86b25cce8fbe4c9811c4c7a787b7a5996660afcc2e287ad864363"

# GET vector
_GET_TIMESTAMP = "1558014486185"
_GET_VERB      = "GET"
_GET_PATH      = "/v1/account/balances"
_GET_BODY      = ""
_GET_EXPECTED  = (
    "9d52c181ed69460b49307b7891f04658e938b21181173844b5018b2fe783a6d"
    "4c62b8e67a03de4d099e7437ebfabe12c56233b73c6a0cc0f7ae87e05f6289928"
)

# POST vector
_POST_TIMESTAMP = "1558017528946"
_POST_VERB      = "POST"
_POST_PATH      = "/v1/orders/market"
_POST_BODY      = '{"customerOrderId":"ORDER-000001","pair":"BTCUSDC","side":"BUY","quoteAmount":"80000"}'
_POST_EXPECTED  = (
    "09f536e3dfdad58443f16010a97a0a21ad27486b7b8d6d4103170d885410ed7"
    "7f037f1fa628474190d4f5c08ca12c1acc850901f1c2e75c6d906ec3b32b008d0"
)


def _client_with_test_secret(monkeypatch) -> ValrClient:
    monkeypatch.setenv("VALR_API_KEY", "test_key_placeholder")
    monkeypatch.setenv("VALR_API_SECRET", _TEST_SECRET)
    return ValrClient()


def test_valr_signature_get_official_vector(monkeypatch):
    """GET vector from VALR official authentication docs."""
    client = _client_with_test_secret(monkeypatch)
    computed = client._generate_signature(_GET_TIMESTAMP, _GET_VERB, _GET_PATH, _GET_BODY)
    assert computed == _GET_EXPECTED, (
        f"GET signature mismatch.\nComputed: {computed}\nExpected: {_GET_EXPECTED}"
    )


def test_valr_signature_post_official_vector(monkeypatch):
    """POST vector from VALR official authentication docs. Body is the exact raw string."""
    client = _client_with_test_secret(monkeypatch)
    computed = client._generate_signature(_POST_TIMESTAMP, _POST_VERB, _POST_PATH, _POST_BODY)
    assert computed == _POST_EXPECTED, (
        f"POST signature mismatch.\nComputed: {computed}\nExpected: {_POST_EXPECTED}"
    )
