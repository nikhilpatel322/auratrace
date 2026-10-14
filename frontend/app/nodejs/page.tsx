import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const commands = `npm install @auratrace/node

# PowerShell:
$env:AURATRACE_API_KEY="YOUR_PROJECT_API_KEY"
$env:AURATRACE_ENDPOINT="http://localhost:8000"
`;

const sample = `import { init } from "@auratrace/node";

init({
  apiKey: process.env.AURATRACE_API_KEY,
  endpoint: process.env.AURATRACE_ENDPOINT ?? "http://localhost:8000",
});
`;

export default function NodeSdkPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"><ArrowLeft className="h-4 w-4" /> SDK overview</Link>
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-red-600">SDK documentation / Node.js</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Integrate AuraTrace with Node.js</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">Initialize the SDK in your Node.js service to report supported process errors and diagnostic context to the AuraTrace backend.</p>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold">1. Install the package</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">Run this command from your application directory. Keep credentials in environment variables and use a project-scoped key.</p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-950 p-5 text-sm leading-6 text-gray-100"><code>{commands}</code></pre>
        <button onClick={() => navigator.clipboard.writeText(commands)} className="mt-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">Copy install commands</button>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold">2. Initialize at startup</h2>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-950 p-5 text-sm leading-6 text-gray-100"><code>{sample}</code></pre>
        <p className="mt-3 text-xs leading-5 text-amber-700">Confirm the exported function and option names against sdk/nodejs/src/client.ts and sdk/nodejs/src/index.ts before use. The repository currently contains unresolved SDK merge conflicts, so validate the package build before publishing it.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">3. Integration checklist</h2>
        <ul className="mt-4 space-y-3">
          {['Initialize the SDK before starting the application workload.', 'Use environment-specific credentials and endpoint configuration.', 'Test with a controlled error in development or staging.', 'Confirm the backend receives and processes telemetry.', 'Do not let an unvalidated AI-generated patch modify production code. Use an authorized repair workflow with tests and rollback.'].map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-gray-700"><Check className="mt-1 h-4 w-4 shrink-0 text-green-600" />{item}</li>)}
        </ul>
      </section>
      <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Understand the backend <ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
}
