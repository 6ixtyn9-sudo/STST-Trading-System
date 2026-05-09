import pytest
import os
from valr_client import ValrClient

def test_valr_signature_determinism(monkeypatch):
    monkeypatch.setenv("VALR_API_KEY", "dummy_key")
    monkeypatch.setenv("VALR_API_SECRET", "dummy_secret")
    
    client = ValrClient()
    
    timestamp = "1558000609355"
    verb = "POST"
    path = "/v1/orders/limit"
    body = '{"side":"SELL","quantity":"0.1","price":"10000","pair":"BTCZAR","postOnly":true,"customerOrderId":"1234"}'
    
    sig1 = client._generate_signature(timestamp, verb, path, body)
    sig2 = client._generate_signature(timestamp, verb, path, body)
    
    assert sig1 == sig2
    
    # UNVERIFIED: Replace with official VALR test vectors if available.
    # We are testing internal determinism with a fixed timestamp/body here.
    # TODO: Add official VALR test vectors to verify exact signature match.
    assert len(sig1) == 128  # hex string of sha512 (64 bytes * 2 = 128 chars)
