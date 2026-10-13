import sys, os, json, pathlib
sys.path.insert(0, os.path.abspath("."))

print("=== STEP 4: Embedded Diagnostic Flow ===")

import auratrace
auratrace.init(service_name="test-microservice", api_key=None)
print("[1] SDK init OK (embedded, no backend required)")

try:
    _ = 1 / 0
except ZeroDivisionError as exc:
    eid = auratrace.capture_exception(exc)
    print(f"[2] Exception captured -> event_id: {eid}")

diag_dir = pathlib.Path(".auratrace/diagnostics")
diag_dir.mkdir(parents=True, exist_ok=True)
print(f"[3] Diagnostic dir ready: {diag_dir.resolve()}")

from auratrace.engine import DiagnosisEngine
engine = DiagnosisEngine()
report = engine.diagnose(
    error_type="ZeroDivisionError",
    error_message="division by zero",
    stack_frames=[{"filename": "app.py", "lineno": 42, "function": "compute", "context": "result = 1 / 0"}]
)
print(f"[4] Report keys: {list(report.keys())}")
print(f"    has_patch: {report.get('has_patch', False)}")
print(f"    confidence: {report.get('confidence', 'n/a')}")

report_path = diag_dir / "test_flow_report.json"
report_path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
print(f"[5] Report saved: {report_path}")

if report.get("has_patch") and report.get("proposed_patch"):
    from auratrace.safety import SafetyChecker
    safe, reason = SafetyChecker().check(report["proposed_patch"])
    print(f"[6] Safety: safe={safe} reason={reason!r}")
else:
    print("[6] No patch for ZeroDivisionError - EXPECTED (unknown pattern)")

from auratrace.sandbox import PatchSandbox
sb = PatchSandbox()
r7 = sb.apply_and_test({"file": "test_app.py", "old": "raise ValueError", "new": "raise ValueError  # ok"})
print(f"[7] Sandbox benign patch -> success={r7.get('success')}")

r8 = sb.apply_and_test({"command": "rm -rf /"})
print(f"[8] Sandbox dangerous cmd -> rejected={not r8.get('success', False)}")

unknown = engine.diagnose(error_type="NoPatternError", error_message="novel failure", stack_frames=[])
print(f"[9] Unknown error has_patch={unknown.get('has_patch', False)} (expected False)")

print("\n=== STEP 4 COMPLETE ===")
