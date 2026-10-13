# AuraTrace Node.js SDK

<<<<<<< HEAD
AuraTrace is an automatic crash-capture client.

## Installation
=======
Zero-config crash capture for Node.js applications.

## Install
>>>>>>> 9f420d2609525d61c582cceb64279c1885f42862

```bash
npm install @auratrace/node
```

<<<<<<< HEAD
Import it once during application startup:

```typescript
import "@auratrace/node";
```

That is the complete integration for unhandled process failures. Importing AuraTrace automatically installs handlers for `uncaughtException` and `unhandledRejection`, detects application metadata from `package.json`, and sends diagnostic events asynchronously.

Use a project-scoped `AURATRACE_API_KEY` and optionally `AURATRACE_ENDPOINT`. Never use an AuraTrace master/admin key in an application.

## Optional explicit configuration

```typescript
import { AuraTrace } from "@auratrace/node";

AuraTrace.init({
  apiKey: process.env.AURATRACE_API_KEY,
  endpoint: process.env.AURATRACE_ENDPOINT,
});
```

## Optional manual capture and HTTP telemetry

Manual capture plus Express/Connect middleware remain available for caught exceptions and request-level telemetry. They are not required for automatic crash detection.

The SDK fails silently when the AuraTrace backend is unavailable so observability cannot interrupt the host application.
=======
## Quick Start

```javascript
const auratrace = require('@auratrace/node');

auratrace.init({ apiKey: 'aura_live_...' });
```

That's it. Now every uncaught exception and unhandled rejection
is automatically captured and sent to AuraTrace.

## TypeScript

```typescript
import { init, captureException, captureEvent } from '@auratrace/node';

init({ apiKey: 'aura_live_...' });
```

## Manual capture

```javascript
try {
  await processPayment();
} catch (err) {
  auratrace.captureException(err);
}

auratrace.captureEvent('latency', { latencyMs: 3500, endpoint: '/api/checkout' });
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `AURATRACE_API_KEY` | API key (alternative to code) |
| `AURATRACE_ENDPOINT` | Override endpoint |
| `AURATRACE_SERVICE` | Service name |
| `AURATRACE_ENV` | Environment |
| `AURATRACE_DISABLED` | Set to `1` to disable |
>>>>>>> 9f420d2609525d61c582cceb64279c1885f42862
