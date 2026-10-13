"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Terminal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function ProjectsPage() {
  return (
    <AppShell hideHeaderTitle>
      <div className="mx-auto max-w-3xl space-y-6 py-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
            <Terminal className="h-3.5 w-3.5" /> SDK onboarding
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">Integrate AuraTrace</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Ordinary developer onboarding no longer creates projects or displays project API keys. Start with the public SDK guide. Administrative project management is kept separate from the developer setup path.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/docs" className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#b91c1c]">
              <BookOpen className="h-4 w-4" /> Read SDK docs <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <ShieldCheck className="h-4 w-4" /> Admin console
            </Link>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900">What happens next?</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-600 list-decimal pl-5">
            <li>Install the SDK that matches your runtime.</li>
            <li>Follow the integration guide and configure only the options supported by the installed SDK.</li>
            <li>Use the authenticated dashboard to inspect telemetry, incidents, and diagnostic results.</li>
          </ol>
          <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs leading-relaxed text-amber-900">
            Note: removing the project/key form from this page does not itself implement anonymous SDK registration. The backend registration flow must be completed before a fresh SDK installation can send telemetry without existing credentials.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
