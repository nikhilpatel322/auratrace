"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Code2,
  Terminal,
  ArrowRight,
  Cpu,
  Database,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ProjectPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-red-500/20 selection:text-red-900">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-xs font-bold text-red-700 mb-4">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            Developer Overview
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">AuraTrace SDK</h1>
          <p className="text-base sm:text-lg font-bold text-red-600 mt-2">AI-assisted application diagnostics</p>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mt-3 leading-relaxed">
            Instrument a Python or Node.js application to collect telemetry, identify anomalies, and investigate failures through the AuraTrace monitoring pipeline.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/docs" className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-3 text-sm font-bold transition">
              <Terminal className="h-4 w-4" /> SDK documentation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
              Open dashboard
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Integration</p>
            <h2 className="text-lg font-bold mt-1">Supported SDKs</h2>
            <p className="text-sm text-slate-500 mt-1">Choose the runtime used by your application and follow the current integration guide.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">Py</span>
                <h3 className="font-bold">Python</h3>
              </div>
              <p className="text-sm text-slate-600">Exception hooks and background telemetry transport for Python services.</p>
              <code className="block mt-4 rounded-lg bg-slate-950 p-3 text-xs text-slate-100">pip install auratrace</code>
              <Link href="/docs#python" className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-red-600 hover:underline">Python guide <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">JS</span>
                <h3 className="font-bold">Node.js</h3>
              </div>
              <p className="text-sm text-slate-600">Unhandled exception and rejection hooks with asynchronous telemetry transport.</p>
              <code className="block mt-4 rounded-lg bg-slate-950 p-3 text-xs text-slate-100">npm install @auratrace/node</code>
              <Link href="/docs#nodejs" className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-red-600 hover:underline">Node.js guide <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform pipeline</p>
            <h2 className="text-lg font-bold mt-1">How telemetry is processed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <Code2 className="h-5 w-5 text-red-600 mb-3" />
              <h3 className="text-sm font-bold">SDK capture</h3>
              <p className="text-xs text-slate-600 mt-1">Collect exception context and runtime telemetry asynchronously.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <Cpu className="h-5 w-5 text-red-600 mb-3" />
              <h3 className="text-sm font-bold">Anomaly analysis</h3>
              <p className="text-xs text-slate-600 mt-1">Process event windows and flag unusual error or latency patterns.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <Database className="h-5 w-5 text-red-600 mb-3" />
              <h3 className="text-sm font-bold">AI diagnostics</h3>
              <p className="text-xs text-slate-600 mt-1">Use historical fixes and retrieved context to support incident investigation.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-amber-950">Setup status</h2>
              <p className="text-sm text-amber-900 mt-1">
                Public SDK documentation is available. Fully automatic installation registration is a separate backend capability; do not assume that importing the SDK alone provisions a tenant until that flow has been implemented and verified. Project and credential administration remains in the authenticated administrative console.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
