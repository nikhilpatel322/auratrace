"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { BookOpen, Check, Copy, ShieldCheck } from "lucide-react";

export default function DocumentationPage() {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  }

  const Code = ({ id, value }: { id: string; value: string }) => (
    <div className="rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-end border-b border-slate-800 px-3 py-2">
        <button onClick={() => void copy(value, id)} className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white">
          {copied === id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied === id ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap p-4 text-sm leading-6 text-slate-200">{value}</pre>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-5 py-12">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"><BookOpen className="h-4 w-4" /> Developer documentation</div>
          <h1 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight">AuraTrace SDK Integration</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">Integrate the SDK into an existing application. AuraTrace captures supported crashes and sends events to the backend for analysis, diagnosis, and controlled repair. This site documents the SDK; it is not a live monitoring console.</p>
        </header>

        <section id="python" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3"><span className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-blue-900">Py</span><div><h2 className="text-xl font-bold">Python SDK</h2><p className="text-sm text-slate-500">Install and import at application startup</p></div></div>
          <h3 className="mt-6 mb-2 text-sm font-bold">1. Install</h3>
          <Code id="py-install" value="pip install auratrace" />
          <h3 className="mt-6 mb-2 text-sm font-bold">2. Import the SDK</h3>
          <Code id="py-setup" value={`import auratrace

# Import the SDK early in application startup.
# The SDK installs the automatic crash hooks supported by this version.
# Set AURATRACE_API_KEY and AURATRACE_ENDPOINT in the process environment.`} />
          <h3 className="mt-6 mb-2 text-sm font-bold">3. Configure the environment</h3>
          <Code id="py-env" value={`AURATRACE_API_KEY=your_project_scoped_key
AURATRACE_ENDPOINT=https://your-auratrace-backend`} />
        </section>

        <section id="nodejs" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3"><span className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-900">JS</span><div><h2 className="text-xl font-bold">Node.js SDK</h2><p className="text-sm text-slate-500">Import early in the application startup path</p></div></div>
          <h3 className="mt-6 mb-2 text-sm font-bold">1. Install</h3>
          <Code id="node-install" value="npm install @auratrace/node" />
          <h3 className="mt-6 mb-2 text-sm font-bold">2. Import the SDK</h3>
          <Code id="node-setup" value={`import "@auratrace/node";

// Import the SDK early so supported crash hooks are installed.
// Set AURATRACE_API_KEY and AURATRACE_ENDPOINT in the process environment.`} />
          <h3 className="mt-6 mb-2 text-sm font-bold">3. Configure the environment</h3>
          <Code id="node-env" value={`AURATRACE_API_KEY=your_project_scoped_key
AURATRACE_ENDPOINT=https://your-auratrace-backend`} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold">What happens after a crash?</h2>
          <ol className="mt-5 space-y-4">
            {[
              ["Capture and transport", "The SDK captures supported crash context and sends telemetry asynchronously to the configured backend."],
              ["Queue and analyze", "The ingestion service authenticates the event and queues it for backend processing. The anomaly engine evaluates available signals."],
              ["Diagnose", "The diagnostic service combines the stack trace and relevant metrics with similar historical fixes to propose a likely cause."],
              ["Generate and test a patch", "The repair engine creates a candidate patch and runs configured safety checks and tests in an isolated environment."],
              ["Apply and verify", "A fix is applied only through an authorized repository or deployment workflow. Health checks determine whether recovery succeeded."],
            ].map(([title, text]) => <li key={title} className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" /><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div></li>)}
          </ol>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" /><div><h2 className="font-bold text-amber-950">Security and important limitations</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-950">
            <li>Use a project-scoped credential. Never put master, LLM, or GitHub credentials inside the SDK or application bundle.</li>
            <li>Importing the SDK does not provision a project or credential automatically unless a separate registration flow is implemented.</li>
            <li>Telemetry delivery requires a valid credential and a reachable backend.</li>
            <li>AI-generated patches must be treated as untrusted until validated. Automatic deployment requires explicit authorization and safe deployment controls.</li>
            <li>Crash capture does not guarantee every error can be diagnosed or automatically repaired.</li>
          </ul></div></div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
