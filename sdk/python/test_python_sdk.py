"""
Unit tests for the official AuraTrace Python SDK.
Tests initialization, telemetry queueing, exception handling, and transport handling offline.
"""

import os
import unittest
from unittest.mock import patch

import auratrace
from auratrace.client import AuraTrace
from auratrace.metadata import resolve_service_name


class TestPythonSDK(unittest.TestCase):
    def test_auto_detect_service_name(self):
        with patch.dict(os.environ, {"AURATRACE_SERVICE_NAME": "order-service"}):
            self.assertEqual(resolve_service_name(), "order-service")

    def test_auratrace_init_no_master_key_fallback(self):
        with patch.dict(os.environ, {}, clear=True):
            client = AuraTrace(api_key="at_test_key_12345", service_name="test-service", install_global_hook=False)
            self.assertEqual(client.api_key, "at_test_key_12345")
            self.assertEqual(client.service_name, "test-service")
            self.assertEqual(client.environment, "production")

    def test_capture_message_queuing(self):
        client = AuraTrace(api_key="at_test_key_12345", service_name="test-service", install_global_hook=False)
        client.capture_message("User authentication succeeded", metadata={"user_id": "usr_100"})
        self.assertFalse(client.transport._queue.empty())
        item = client.transport._queue.get_nowait()
        self.assertEqual(item["level"], "INFO")
        self.assertEqual(item["message"], "User authentication succeeded")
        self.assertEqual(item["metadata"]["user_id"], "usr_100")

    def test_capture_exception_queuing(self):
        client = AuraTrace(api_key="at_test_key_12345", service_name="test-service", install_global_hook=False)
        try:
            raise KeyError("missing_account_id")
        except Exception as exc:
            client.capture_exception(exc, metadata={"transaction_id": "tx_9988"})

        self.assertFalse(client.transport._queue.empty())
        item = client.transport._queue.get_nowait()
        self.assertEqual(item["level"], "CRITICAL")
        self.assertEqual(item["error_type"], "KeyError")
        self.assertIn("missing_account_id", item["message"])
        self.assertEqual(item["metadata"]["transaction_id"], "tx_9988")

    def test_global_module_functions(self):
        with patch.dict(os.environ, {"AURATRACE_API_KEY": "at_test_env_key", "AURATRACE_SERVICE_NAME": "global-test-service"}):
            client = auratrace.init(install_global_hook=False)
            self.assertEqual(client.api_key, "at_test_env_key")
            self.assertEqual(client.service_name, "global-test-service")

            auratrace.capture_message("Global test log")
            self.assertFalse(client.transport._queue.empty())

    def test_embedded_engine_diagnosis(self):
        try:
            sample_dict = {}
            _ = sample_dict["user_id"]
        except Exception as exc:
            report = auratrace.diagnose(exc)
            self.assertIsNotNone(report)
            self.assertEqual(report.error_type, "KeyError")
            self.assertTrue(report.safety_allowed)
            self.assertIn("user_id", report.suggested_patch)
            self.assertGreater(len(report.similar_cases), 0)

    def test_embedded_safety_blocks_dangerous_patch(self):
        dangerous_patch = """--- a/app.py
+++ b/app.py
@@ -1 +1 @@
-pass
+import os; os.system('rm -rf /')
"""
        safety_res = auratrace.inspect_patch(dangerous_patch)
        self.assertFalse(safety_res.allowed)
        self.assertTrue(len(safety_res.flagged_patterns) > 0)


if __name__ == "__main__":
    unittest.main()

