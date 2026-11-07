"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0B0F19]/80 transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo - Clean, Real Product Identity */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-all">
            <span className="text-base font-extrabold tracking-tight">M</span>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#0070BA] border-2 border-white dark:border-[#0B0F19] flex items-center justify-center">
              <span className="text-[7px] text-white font-black leading-none">P</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              Milestone<span className="text-emerald-500 dark:text-emerald-400">OS</span>
            </span>
          </div>
        </Link>

        {/* Clean, Simple Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="#how-it-works"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#demo"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            See It In Action
          </Link>
          <Link
            href="#calculator"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Payment Calculator
          </Link>
          <Link
            href="#benefits"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Who It's For
          </Link>
        </nav>

        {/* Actions & Theme Switch */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/auth?mode=login"
            className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 rounded-xl hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 px-4 pt-3 pb-6 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0B0F19]/95">
          <nav className="flex flex-col gap-3 text-base font-semibold text-slate-700 dark:text-slate-200">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              How It Works
            </Link>
            <Link
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              See It In Action
            </Link>
            <Link
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Payment Calculator
            </Link>
            <Link
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Who It's For
            </Link>
          </nav>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href="/auth?mode=login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-md shadow-emerald-500/20"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
