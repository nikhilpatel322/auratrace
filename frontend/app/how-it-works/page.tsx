import Link from 'next/link';
import { ArrowLeft, ArrowDown, Server, ShieldCheck, BrainCircuit, Database, PackageCheck, Code2 } from 'lucide-react';

const stages = [
  { icon: Code2, title: '1. Developer application + SDK', text: 'The SDK captures supported exceptions, stack traces, and relevant context, then sends telemetry to the configured backend endpoint.' },
  { icon: Server, title: '2. Ingestion API and queue', text: 'The FastAPI ingestion service validates incoming payloads and queues events so application requests do not need to wait for database processing.' },
  { icon: BrainCircuit, title: '3. Detection and diagnosis', text: 'Backend workers evaluate telemetry for anomalies, retrieve relevant historical fixes, and ask the configured diagnostic model to propose a root cause and repair.' },
  { icon: Database, title: '4. Repair validation', text: 'The repair workflow checks the proposed change in a controlled environment, runs relevant tests, and applies configured safety rules.' },
  { icon: ShieldCheck, title: '5. Authorized recovery', text: 'Only an explicitly configured and authorized repair/deployment mechanism can apply a source-code change. Failed validation should stop the repair; deployed changes need rollback safeguards.' },
  { icon: PackageCheck, title: '6. Result and verification', text: 'The backend verifies recovery and can return supported status or diagnostic information to the SDK. The SDK itself does not safely rewrite arbitrary application source code.' },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"><ArrowLeft className="h-4 w-4" /> SDK overview</Link>
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Architecture</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Crash in the app. Diagnosis and repair in the backend.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">AuraTrace is SDK-first. The website documents installation and configuration; it is not a live monitoring console.</p>
      </header>
      <div className="space-y-3">
        {stages.map(({ icon: Icon, title, text }, index) => (
          <div key={title}>
            <article className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><Icon className="h-5 w-5" /></div>
              <div><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{text}</p></div>
            </article>
            {index < stages.length - 1 && <div className="flex justify-center py-2 text-gray-400"><ArrowDown className="h-5 w-5" /></div>}
          </div>
        ))}
      </div>
      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-semibold text-amber-950">Safety boundary</h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">An LLM-generated patch is a proposal, not proof of a correct fix. Automatic application requires scoped permissions, sandbox tests, approval policy, deployment checks, and rollback. The SDK should not independently rewrite arbitrary files in the developer's application.</p>
      </aside>
      <div className="flex flex-wrap gap-3">
        <Link href="/python" className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Python SDK guide</Link>
        <Link href="/nodejs" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50">Node.js SDK guide</Link>
      </div>
    </div>
  );
}
