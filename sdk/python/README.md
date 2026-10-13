# AuraTrace Python SDK

<<<<<<< HEAD
AuraTrace is an automatic crash-capture client.

## Installation

```bash
pip install auratrace
```

Import the package once at application startup:

```python
import auratrace
```

That is the complete integration for unhandled crashes. Importing AuraTrace automatically installs the global exception hook, detects the application name, captures the crash stack trace and runtime metadata, and sends the event asynchronously.

Use a project-scoped `AURATRACE_API_KEY` and optionally `AURATRACE_ENDPOINT`. The SDK never uses an AuraTrace master/admin key.

## Optional explicit configuration

```python
import auratrace

auratrace.init(
    api_key="YOUR_AURATRACE_PROJECT_KEY",
    endpoint="http://localhost:8000",
)
```

## Optional manual capture

Manual capture remains available for caught exceptions and custom telemetry, but it is not required for unhandled crash detection.

The SDK buffers telemetry in a background worker and fails silently if AuraTrace is unavailable so observability cannot interrupt the host application.
=======
Zero-config crash capture for Python applications.

## Install

```bash
pip install auratrace-sdk
```

## Quick Start

```python
from auratrace import init

init(api_key="aura_live_...")
```

That's it. Now every uncaught exception is automatically captured
and sent to AuraTrace for AI diagnosis.

## Optional configuration

```python
init(
    api_key="aura_live_...",
    endpoint="http://localhost:8000",   # default
    service_name="payment-service",      # auto-detected if omitted
    environment="production",            # or from AURATRACE_ENV
    auto_capture=True,                   # install excepthook
)
```

## Manual capture

```python
from auratrace import capture_exception, capture_event

try:
    process_payment()
except Exception as e:
    capture_exception(e)

# Custom events
capture_event("latency", latency_ms=3500, endpoint="/api/checkout")
```

## Frameworks supported

- FastAPI (auto-instrumented)
- Flask (auto-instrumented)
- Django (auto-instrumented)
- Plain Python (always)

## Environment variables

| Variable | Description |
|----------|-------------|
| `AURATRACE_API_KEY` | API key (alternative to passing in code) |
| `AURATRACE_ENDPOINT` | Override endpoint |
| `AURATRACE_SERVICE` | Service name |
| `AURATRACE_ENV` | Environment (production/staging/dev) |
| `AURATRACE_DISABLED` | Set to `1` to disable the SDK |
>>>>>>> 9f420d2609525d61c582cceb64279c1885f42862
