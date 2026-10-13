"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Github, Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = [
    { name: "Overview", href: "/", icon: Sparkles },
    { name: "SDK", href: "/project", icon: BookOpen },
    { name: "Documentation", href: "/docs", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <BrandLogo size="md" href="/" />
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
                return <Link key={item.href} href={item.href} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                  <Icon className="h-4 w-4" />{item.name}
                </Link>;
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://github.com/sunilsingh175/auratrace" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"><Github className="h-4 w-4" /> GitHub</a>
            <Link href="/docs" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700">SDK guide <ArrowRight className="h-4 w-4" /></Link>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden">{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && <div className="space-y-1 border-t border-slate-200 bg-white p-3 md:hidden">{navLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">{item.name}</Link>)}<a href="https://github.com/sunilsingh175/auratrace" target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">GitHub repository</a></div>}
    </nav>
  );
}

export default Navbar;
