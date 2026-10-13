"""
AuraTrace Python SDK — Zero-Boilerplate Automatic Crash Detection & Diagnostics
"""

from typing import Optional

from .client import (
    AuraTrace,
    AutomaticBackendDetection,
    AutoTrace,
    Trace,
    TraceClient,
)
from .hooks import install_exception_hook, uninstall_exception_hook
from .metadata import (
    get_runtime_info,
    resolve_api_key,
    resolve_endpoint,
    resolve_environment,
    resolve_service_name,
)
from .transport import HTTPTransport
from .engine import EmbeddedDiagnosticEngine, DiagnosticReport
from .safety import inspect_patch, PatchSafetyResult
from .sandbox import run_sandbox_test

_default_client: Optional[AuraTrace] = None


def init(
    api_key: Optional[str] = None,
    service_name: Optional[str] = None,
    endpoint: Optional[str] = None,
    environment: Optional[str] = None,
    version: Optional[str] = "1.0.0",
    batch_size: int = 50,
    flush_interval_seconds: float = 1.0,
    install_global_hook: bool = True,
    enable_local_diagnosis: bool = True,
) -> AuraTrace:
    """Manually configure or override AuraTrace client instance."""
    global _default_client
    _default_client = AuraTrace(
        api_key=api_key,
        service_name=service_name,
        endpoint=endpoint,
        environment=environment,
        version=version,
        batch_size=batch_size,
        flush_interval_seconds=flush_interval_seconds,
        install_global_hook=install_global_hook,
        enable_local_diagnosis=enable_local_diagnosis,
    )
    return _default_client


def _get_or_create_client() -> AuraTrace:
    global _default_client
    if _default_client is None:
        _default_client = AuraTrace()
    return _default_client


def capture_message(message: str, metadata: Optional[dict] = None) -> None:
    """Capture and send a log message to AuraTrace."""
    _get_or_create_client().capture_message(message, metadata=metadata)


def capture_exception(
    exception: BaseException, metadata: Optional[dict] = None
) -> Optional[DiagnosticReport]:
    """Capture and diagnose an exception trace with AuraTrace."""
    return _get_or_create_client().capture_exception(exception, metadata=metadata)


def diagnose(
    exception: BaseException, auto_sandbox: bool = False
) -> Optional[DiagnosticReport]:
    """Run embedded crash diagnosis, RAG search, and Safety Gate verification."""
    return _get_or_create_client().diagnose(exception, auto_sandbox=auto_sandbox)


def flush() -> None:
    """Flush all pending telemetry batches synchronously."""
    if _default_client is not None:
        _default_client.flush()


# Auto-bootstrap client on import
try:
    _get_or_create_client()
except Exception:
    pass  # Fail silent during initialization if unconfigured

__all__ = [
    "AuraTrace",
    "AutoTrace",
    "TraceClient",
    "Trace",
    "AutomaticBackendDetection",
    "init",
    "capture_message",
    "capture_exception",
    "diagnose",
    "flush",
    "HTTPTransport",
    "EmbeddedDiagnosticEngine",
    "DiagnosticReport",
    "inspect_patch",
    "PatchSafetyResult",
    "run_sandbox_test",
    "install_exception_hook",
    "uninstall_exception_hook",
]
