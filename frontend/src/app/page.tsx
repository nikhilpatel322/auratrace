"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Copy, Github, ShieldCheck, Code2, BrainCircuit, Wrench, PackageCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function HomePage() {
  const [runtime, setRuntime] = useState<"python" | "node">("python");
  const [copied, setCopied] = useState(false);
  const installCommand = runtime === "python" ? "pip install auratrace" : "npm install @auratrace/node";
  const example = runtime === "python"
    ? "import auratrace\n\n# Import at application startup to enable supported crash hooks.\n# Set AURATRACE_API_KEY and AURATRACE_ENDPOINT in the environment."
    : 'import "@auratrace/node";\n\n// Import early at application startup to enable supported crash hooks.\n// Set AURATRACE_API_KEY and AURATRACE_ENDPOINT in the environment.';

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-5 py-20 sm:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                <ShieldCheck className="h-4 w-4" /> SDK-first autonomous repair
              </div>
              <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                Detect the crash. Diagnose the cause. Validate the fix.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                AuraTrace SDK captures supported application crashes and sends telemetry to a backend that analyzes errors, retrieves historical fixes, and validates candidate repairs through a controlled workflow.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/docs" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700">
                  Read SDK documentation <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="https://github.com/sunilsingh175/auratrace" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                  <Github className="h-4 w-4" /> View source
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold">One SDK. Backend-driven diagnosis.</h2>
            <p className="mt-3 text-slate-600 leading-7">Developers integrate the SDK into an existing application. Event processing, AI diagnosis, patch validation, and authorized repair workflows run on the AuraTrace backend—not in a live dashboard.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Code2, title: "1. Capture", text: "Capture supported uncaught exceptions and relevant runtime context." },
              { icon: BrainCircuit, title: "2. Diagnose", text: "Analyze event signals and retrieve similar historical failures." },
              { icon: Wrench, title: "3. Validate", text: "Generate a candidate patch and run configured checks in isolation." },
              { icon: PackageCheck, title: "4. Repair safely", text: "Use authorized repository or deployment workflows and verify recovery." },
            ].map((item) => {
              const Icon = item.icon;
              return <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <Icon className="h-6 w-6 text-red-600" />
                <h3 className="mt-4 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>;
            })}
          </div>
        </section>

        <section className="bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-5 py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Add AuraTrace to your application</h2>
              <p className="mt-3 text-slate-300 leading-7">Choose your runtime for the install command and minimal startup example. Use a project-scoped credential supplied through environment variables.</p>
              <div className="mt-6 inline-flex rounded-lg border border-slate-700 p-1">
                <button onClick={() => { setRuntime("python"); setCopied(false); }} className={`rounded-md px-4 py-2 text-sm font-semibold ${runtime === "python" ? "bg-white text-slate-900" : "text-slate-300"}`}>Python</button>
                <button onClick={() => { setRuntime("node"); setCopied(false); }} className={`rounded-md px-4 py-2 text-sm font-semibold ${runtime === "node" ? "bg-white text-slate-900" : "text-slate-300"}`}>Node.js</button>
              </div>
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm text-emerald-300">{installCommand}</code>
                  <button onClick={() => void copy(installCommand)} className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy"}</button>
                </div>
                <pre className="mt-5 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-slate-200">{example}</pre>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
              <h3 className="font-bold">Environment configuration</h3>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-200">AURATRACE_API_KEY=your_project_scoped_key{"\n"}AURATRACE_ENDPOINT=https://your-auratrace-backend</pre>
              <p className="mt-4 text-sm leading-6 text-slate-300">Keep credentials out of source control. Never embed master keys, LLM keys, or GitHub tokens in the SDK or the application bundle.</p>
              <Link href="/docs" className="mt-5 inline-flex items-center gap-2 font-semibold text-white underline underline-offset-4">Read integration details <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-bold text-amber-950">Safety by design</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">An AI-generated patch is a candidate, not proof of recovery. AuraTrace should validate patches in isolation and only apply or deploy them through explicitly authorized policies. Automatic capture also requires valid project credentials and a reachable backend.</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="text-xl font-bold">Learn how the SDK works</h2><p className="mt-1 text-sm text-slate-600">Integration guides, architecture, and security notes.</p></div>
            <Link href="/docs" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-100"><BookOpen className="h-4 w-4" /> Open documentation</Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
