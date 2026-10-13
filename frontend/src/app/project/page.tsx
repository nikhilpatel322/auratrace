import React from "react";
import Link from "next/link";
import { ArrowRight, Code2, Cpu, Database, ShieldCheck, Terminal, Wrench } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ProjectPage() {
  const stages = [
    { icon: Code2, title: "SDK capture", text: "The Python or Node.js SDK captures supported crash context and sends telemetry asynchronously." },
    { icon: Cpu, title: "Backend analysis", text: "Ingestion, Redis Streams, and anomaly detection process incoming events away from the host application." },
    { icon: Database, title: "AI diagnosis", text: "The diagnostic pipeline retrieves similar historical failures and synthesizes a likely cause and candidate patch." },
    { icon: Wrench, title: "Repair and verification", text: "The repair engine checks safety, runs isolated tests, and uses an authorized repository or deployment workflow." },
  ];
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-5 py-12">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12">
          <p className="text-sm font-semibold text-red-700">Project overview</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">AuraTrace SDK</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">An SDK-first crash diagnosis and self-healing platform. Developers integrate the SDK into an existing application; telemetry analysis and repair orchestration run in the AuraTrace backend. This frontend provides SDK information and documentation only.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/docs#python" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"><Terminal className="h-4 w-4" /> Python SDK <ArrowRight className="h-4 w-4" /></Link><Link href="/docs#nodejs" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50">Node.js SDK</Link></div>
        </header>
        <section className="grid gap-4 sm:grid-cols-2">
          {stages.map((stage) => { const Icon = stage.icon; return <article key={stage.title} className="rounded-2xl border border-slate-200 bg-white p-6"><Icon className="h-6 w-6 text-red-600" /><h2 className="mt-4 font-bold">{stage.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{stage.text}</p></article>; })}
        </section>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" /><div><h2 className="font-bold text-amber-950">Automatic repair safety</h2><p className="mt-2 text-sm leading-6 text-amber-950">A generated patch is not proof that a problem is solved. AuraTrace must validate candidate changes in isolation and apply them only through explicitly authorized repository or deployment controls. Valid project credentials and a reachable backend are required for telemetry delivery.</p></div></div></section>
      </main>
      <PublicFooter />
    </div>
  );
}
