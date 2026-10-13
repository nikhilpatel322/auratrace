"""
Demo Application Regression & Repair Verification Test Suite.
Verifies microservice operational flow, exception handling patterns,
and safe remediation logic tested by the AuraTrace repair engine.
"""

import sys
import pytest


def process_order(order_data: dict) -> dict:  # auratrace-sandbox-verified
    """Simulated microservice order fulfillment logic."""
    if not order_data:
        raise ValueError("Order payload cannot be empty")
    
    order_id = order_data.get("order_id")
    if not order_id:
        raise KeyError("missing 'order_id'")
        
    items = order_data.get("items", [])
    total = sum(item.get("price", 0.0) * item.get("quantity", 1) for item in items)
    
    return {
        "status": "PROCESSED",
        "order_id": order_id,
        "total_amount": round(total, 2),
        "items_count": len(items),
    }


def safe_attribute_lookup(payload, key, default=None):
    """Safe lookup pattern recommended by AuraTrace AI Doctor."""
    return (payload or {}).get(key, default)


def test_order_fulfillment_success():
    """Verify standard operational fulfillment path."""
    order = {
        "order_id": "ord_990182",
        "items": [
            {"item_id": "sku_1", "price": 49.99, "quantity": 2},
            {"item_id": "sku_2", "price": 15.00, "quantity": 1},
        ],
    }
    result = process_order(order)
    assert result["status"] == "PROCESSED"
    assert result["order_id"] == "ord_990182"
    assert result["total_amount"] == 114.98
    assert result["items_count"] == 2


def test_order_fulfillment_missing_key():
    """Verify handled exception when required key is missing."""
    with pytest.raises(KeyError) as exc_info:
        process_order({"customer": "Alice"})
    assert "missing 'order_id'" in str(exc_info.value)


def test_order_fulfillment_empty_payload():
    """Verify handled exception when payload is empty."""
    with pytest.raises(ValueError) as exc_info:
        process_order({})
    assert "Order payload cannot be empty" in str(exc_info.value)


def test_safe_attribute_remediation():
    """Verify safe attribute retrieval under null/missing dictionary conditions."""
    assert safe_attribute_lookup({"name": "DemoService"}, "name") == "DemoService"
    assert safe_attribute_lookup(None, "name") is None
    assert safe_attribute_lookup({}, "missing_field", default="fallback") == "fallback"


def test_regression_threshold_calculation():
    """Verify threshold evaluation used in regression checks."""
    baseline_error_rate = 0.01
    current_error_rate = 0.08
    threshold = 0.05
    regression = (current_error_rate - baseline_error_rate) > threshold
    assert regression is True

    minor_error_rate = 0.03
    regression_minor = (minor_error_rate - baseline_error_rate) > threshold
    assert regression_minor is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
