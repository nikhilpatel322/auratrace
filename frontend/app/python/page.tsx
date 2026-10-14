import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Terminal } from 'lucide-react';

const code = `# Install the SDK
pip install auratrace

# Configure credentials in your shell
# PowerShell:
$env:AURATRACE_API_KEY="YOUR_PROJECT_API_KEY"
$env:AURATRACE_ENDPOINT="http://localhost:8000"
`;

export default function PythonSdkPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"><ArrowLeft className="h-4 w-4" /> SDK overview</Link>
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-red-600">SDK documentation / Python</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Integrate AuraTrace with Python</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">Initialize the SDK in your Python service so supported exceptions can be reported to your AuraTrace backend for diagnosis.</p>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold">1. Install and configure</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">Use the package name and configuration options supported by the version in your repository. Keep project credentials in environment variables; do not hard-code production keys or use an administrator/master key in application code.</p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-950 p-5 text-sm leading-6 text-gray-100"><code>{code}</code></pre>
        <button onClick={() => navigator.clipboard.writeText(code)} className="mt-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">Copy setup commands</button>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold">2. Initialize at application startup</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">The repository SDK currently exposes an initialization API. Add initialization once, early in your application entry point, before the main workload starts.</p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-950 p-5 text-sm leading-6 text-gray-100"><code>{`import os
import auratrace

auratrace.init(
    api_key=os.environ.get("AURATRACE_API_KEY"),
    endpoint=os.environ.get("AURATRACE_ENDPOINT", "http://localhost:8000"),
    service_name="my-python-service",
)
`}</code></pre>
        <p className="mt-3 text-xs leading-5 text-amber-700">Confirm the init parameter names against sdk/python/auratrace/client.py for the branch you deploy. The repository currently contains unresolved SDK merge conflicts, so validate the package before publishing it.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">3. Integration checklist</h2>
        <ul className="mt-4 space-y-3">
          {['Use a project-scoped API key and store it outside source control.', 'Initialize the SDK once per application process.', 'Trigger a controlled test exception in a non-production environment.', 'Check backend ingestion and worker logs on the server, not in a live frontend dashboard.', 'Verify that a proposed repair is tested and authorized before any code or deployment change.'].map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-gray-700"><Check className="mt-1 h-4 w-4 shrink-0 text-green-600" />{item}</li>)}
        </ul>
      </section>
      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6">
        <Link href="/nodejs" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Node.js SDK <ArrowRight className="h-4 w-4" /></Link>
        <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"><Terminal className="h-4 w-4" /> Backend workflow</Link>
      </div>
    </div>
  );
}
