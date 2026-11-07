"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#080B12]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all">
            <span className="text-base font-extrabold tracking-tighter">M</span>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#0070BA] border-2 border-[#080B12] flex items-center justify-center">
              <span className="text-[7px] text-white font-black leading-none">P</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Milestone<span className="text-emerald-400">OS</span>
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700">
                PayPal AI '26
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-tight -mt-1 hidden sm:inline">
              Verified Milestones & Payouts
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <Link
            href="#how-it-works"
            className="hover:text-white transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#ai-verification"
            className="hover:text-white transition-colors"
          >
            AI Verification
          </Link>
          <Link
            href="#calculator"
            className="hover:text-white transition-colors"
          >
            Escrow Calculator
          </Link>
          <Link
            href="#roles"
            className="hover:text-white transition-colors"
          >
            Roles
          </Link>
          <Link
            href="#paypal-workflow"
            className="hover:text-white transition-colors flex items-center gap-1 text-sky-400"
          >
            PayPal Sandbox
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </Link>
        </nav>

        {/* Auth CTA buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/auth?mode=login"
            className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-2 rounded-lg transition-colors hover:bg-slate-800/60"
          >
            Sign In
          </Link>
          <Link
            href="/auth?mode=signup"
            className="relative inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 active:scale-[0.98]"
          >
            <span>Launch App</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800/60"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0A0E17]/95 px-4 pt-3 pb-6 backdrop-blur-xl">
          <nav className="flex flex-col gap-3 text-base font-medium text-slate-200">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-emerald-400"
            >
              How It Works
            </Link>
            <Link
              href="#ai-verification"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-emerald-400"
            >
              AI Verification
            </Link>
            <Link
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-emerald-400"
            >
              Escrow Calculator
            </Link>
            <Link
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-emerald-400"
            >
              For Clients & Freelancers
            </Link>
            <Link
              href="#paypal-workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sky-400 hover:text-sky-300 flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              PayPal Sandbox Architecture
            </Link>
          </nav>
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col gap-2.5">
            <Link
              href="/auth?mode=login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg border border-slate-700 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-emerald-400 text-sm font-bold text-slate-950 hover:bg-emerald-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
