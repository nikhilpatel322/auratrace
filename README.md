# AuraTrace — SDK-First Autonomous Self-Healing

AuraTrace is a developer SDK that captures application crashes and sends diagnostic telemetry to the AuraTrace backend. The backend analyzes errors, retrieves relevant historical fixes, generates a candidate patch, validates it in an isolated environment, and uses an authorized repair workflow when the configured safety policy permits.

The public website is documentation only. It does not need a live monitoring dashboard, live log stream, incident graphs, or manual monitoring controls.

## How it works

```text
Install SDK in an existing application
              ↓
SDK captures an unhandled crash
              ↓
Telemetry is sent securely to AuraTrace
              ↓
Backend queues and analyzes the event
              ↓
AI diagnoses the likely root cause
              ↓
Repair engine proposes a code patch
              ↓
Patch is tested in an isolated sandbox
              ↓
Authorized repair workflow applies or proposes the fix
              ↓
Health checks verify recovery
```

## SDK quick start

### Python

Install the SDK:

```bash
pip install auratrace
```

Import AuraTrace at application startup:

```python
import auratrace

# Importing the SDK installs its supported automatic crash-capture hooks.
# Configure a project-scoped credential through the environment.
```

Set the backend endpoint and project-scoped credential in the application's environment:

```env
AURATRACE_API_KEY=your_project_scoped_key
AURATRACE_ENDPOINT=http://localhost:8000
```

### Node.js

Install the SDK:

```bash
npm install @auratrace/node
```

Import it early in the application startup:

```typescript
import "@auratrace/node";
```

Configure `AURATRACE_API_KEY` and `AURATRACE_ENDPOINT` in the process environment. Never embed privileged backend, LLM, or GitHub credentials in application code or the SDK package.

> SDK import enables the capture hooks supported by the installed SDK version. Successful delivery still requires valid project-scoped credentials and a reachable, correctly configured backend. SDK capture alone does not guarantee that a fix will be generated or deployed.

## Backend components

- **Ingestion gateway:** authenticates and queues SDK telemetry.
- **Redis Streams:** decouples application event delivery from analysis.
- **Anomaly engine:** evaluates error and performance signals.
- **PostgreSQL + pgvector:** stores incidents and retrieves similar historical fixes.
- **RAG diagnostics:** combines stack traces, metrics, and retrieved context to generate a diagnosis and candidate patch.
- **Repair engine:** applies safety checks, runs tests in isolation, and uses an authorized GitHub/deployment workflow.
- **Recovery verification:** checks health after a repair and supports rollback workflows where configured.

## Frontend scope

The frontend is a public information site containing:
- AuraTrace overview and architecture.
- Python and Node.js SDK installation and integration guides.
- Explanation of crash capture, diagnosis, patch validation, and repair safety.
- Security and project documentation.

It is not intended to display live application telemetry or to require developers to operate a monitoring dashboard.

## Development and validation

Run the existing repository tests and production build before deploying changes:

```bash
python -m pytest -s sdk/python/test_python_sdk.py
cd sdk/nodejs && npm test
cd frontend && npm run build
```

Run backend integration tests according to the environment and credentials configured for the deployment. A passing frontend build does not validate the complete crash-to-repair pipeline.

## Security notes

- Use project-scoped credentials; never ship a master key in an SDK.
- Keep LLM and GitHub credentials on the backend.
- Treat generated patches as untrusted until they pass safety checks and isolated tests.
- Apply fixes only through explicitly authorized policies and deployment workflows.
- Keep the host application running if telemetry delivery fails; the SDK should not block normal application execution.
