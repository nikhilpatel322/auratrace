import Link from 'next/link';
import { ArrowRight, Bot, Bug, CheckCircle2, Code2, GitBranch, PackageCheck, ShieldCheck, Workflow } from 'lucide-react';

const features = [
  { icon: Bug, title: 'Capture application failures', text: 'The SDK collects exception details and stack traces from your application and sends telemetry to the configured AuraTrace backend.' },
  { icon: Bot, title: 'Diagnose in the backend', text: 'Backend workers analyze the event, compare it with relevant historical fixes, and prepare an AI-assisted diagnosis.' },
  { icon: ShieldCheck, title: 'Validate before recovery', text: 'A repair is not automatically safe just because an LLM suggested it. The configured repair mechanism must authorize, test, and validate changes before applying them.' },
];

const steps = [
  ['01', 'Install the SDK', 'Add the package to your Python or Node.js application.'],
  ['02', 'Configure the client', 'Set the backend endpoint and project credentials using environment variables.'],
  ['03', 'Run your application', 'The SDK reports supported errors without requiring a monitoring dashboard.'],
  ['04', 'Backend handles recovery', 'Detection, diagnosis, fix generation, validation, and authorized repair run server-side.'],
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-7 py-12 text-white md:px-12 md:py-16">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            SDK-first AI self-healing
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Recover from application failures with <span className="text-red-400">AuraTrace.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-gray-300 md:text-lg">
            Integrate a small SDK into your application. AuraTrace sends crash telemetry to the backend, where detection, AI diagnosis, fix validation, and authorized repair are processed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/python" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
              Integrate Python SDK <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/nodejs" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Integrate Node.js SDK
            </Link>
          </div>
          <p className="mt-5 text-xs text-gray-400">No live monitoring dashboard is required. Runtime processing happens in the backend.</p>
        </div>
      </section>

      <section>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">What AuraTrace does</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Your app runs. The backend does the heavy work.</h2>
          <p className="mt-3 leading-7 text-gray-600">The frontend is documentation for developers. It does not display live logs, incident streams, monitoring graphs, or real-time anomaly feeds.</p>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Integration path</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Four steps to connect your app</h2>
          <p className="mt-3 leading-7 text-gray-600">Choose the SDK for your runtime, configure it, and let the backend process telemetry and repair workflows.</p>
          <Link href="/how-it-works" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">Read the architecture <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="space-y-3">
          {steps.map(([number, title, text]) => (
            <div key={number} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">{number}</span>
              <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-gray-600">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100"><PackageCheck className="h-5 w-5" /></div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Choose your SDK</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">Use the runtime documentation for exact package commands, configuration, and code examples. Verify package names and supported initialization options against the SDK version in your repository before production use.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/python" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:border-red-300 hover:text-red-600"><Code2 className="h-4 w-4" /> Python guide</Link>
              <Link href="/nodejs" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:border-red-300 hover:text-red-600"><GitBranch className="h-4 w-4" /> Node.js guide</Link>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:border-red-300 hover:text-red-600"><Workflow className="h-4 w-4" /> Backend workflow</Link>
            </div>
          </div>
          <CheckCircle2 className="hidden h-5 w-5 text-green-600 sm:block" />
        </div>
      </section>
    </div>
  );
}
