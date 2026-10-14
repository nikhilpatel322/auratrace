import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { BookOpen, Code2, Workflow } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AuraTrace SDK | Automatic crash recovery',
  description: 'Integrate the AuraTrace SDK to send application crashes to an AI-powered backend for diagnosis and authorized recovery.',
};

const navItems = [
  { href: '/', label: 'Overview', icon: BookOpen },
  { href: '/python', label: 'Python SDK', icon: Code2 },
  { href: '/nodejs', label: 'Node.js SDK', icon: Code2 },
  { href: '/how-it-works', label: 'How it works', icon: Workflow },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3">
            <Link href="/" className="flex items-center gap-3" aria-label="AuraTrace SDK overview">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-lg font-bold text-white">A</span>
              <span>
                <span className="block text-lg font-bold tracking-tight text-gray-950">AuraTrace</span>
                <span className="block text-xs text-gray-500">SDK documentation</span>
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-red-600">
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          {children}
        </main>
        <footer className="mt-16 border-t border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between md:px-8">
            <span>AuraTrace — SDK integration and self-healing documentation</span>
            <span>Crash processing and repair run in the backend.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
