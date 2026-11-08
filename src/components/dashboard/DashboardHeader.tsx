"use client";

import Link from "next/link";
import { User, Briefcase, Plus, ArrowLeft, ShieldCheck, Wallet, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface DashboardHeaderProps {
  role: "client" | "freelancer";
  onRoleChange: (newRole: "client" | "freelancer") => void;
  onNewProjectClick: () => void;
  escrowFunded: number;
  escrowReleased: number;
}

export default function DashboardHeader({
  role,
  onRoleChange,
  onNewProjectClick,
  escrowFunded,
  escrowReleased,
}: DashboardHeaderProps) {
  const escrowRemaining = escrowFunded - escrowReleased;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 sm:px-8 py-3 dark:border-white/10 dark:bg-[#070B14]/80 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand Logo & Back to Home */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-white font-bold shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
              <span className="text-base font-extrabold tracking-tight">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                Milestone<span className="text-[#0070BA] dark:text-[#38BDF8]">OS</span>
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-medium">
                PayPal AI Hackathon 2026
              </span>
            </div>
          </Link>

          {/* Quick link to Home */}
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0070BA] dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Landing Page</span>
          </Link>
        </div>

        {/* ROLE PERSONA SWITCHER: Toggle between Client (Sarah) and Freelancer (Rohan) */}
        <div className="flex items-center">
          <div className="flex items-center rounded-2xl border border-slate-200/90 bg-slate-100/90 p-1 dark:border-white/10 dark:bg-[#0e1628]/90 shadow-inner">
            <button
              type="button"
              onClick={() => onRoleChange("client")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === "client"
                  ? "bg-white text-slate-900 shadow-md ring-1 ring-black/5 dark:bg-gradient-to-r dark:from-[#004C8F] dark:to-[#0070BA] dark:text-white dark:ring-0"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-300" />
              <span className="hidden sm:inline">Client View</span>
              <span className="sm:hidden">Client</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0070BA] dark:bg-white/20 dark:text-white font-mono">
                Sarah
              </span>
            </button>

            <button
              type="button"
              onClick={() => onRoleChange("freelancer")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === "freelancer"
                  ? "bg-white text-slate-900 shadow-md ring-1 ring-black/5 dark:bg-gradient-to-r dark:from-[#004C8F] dark:to-[#0070BA] dark:text-white dark:ring-0"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="hidden sm:inline">Freelancer Workbench</span>
              <span className="sm:hidden">Freelancer</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-white/20 dark:text-white font-mono">
                Rohan
              </span>
            </button>
          </div>
        </div>

        {/* Right side: PayPal Sandbox status, Escrow badge, and New Project button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PayPal Sandbox Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200/60 dark:bg-[#0070BA]/10 dark:border-blue-500/20 text-[11px] font-semibold text-[#0070BA] dark:text-sky-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">PayPal Sandbox v2</span>
          </div>

          {/* Escrow Balance Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-white/5 text-xs">
            <Wallet className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
            <span className="text-slate-500 dark:text-slate-400">Escrow:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              ${escrowRemaining.toLocaleString()}
            </span>
          </div>

          {/* New Project CTA for Client */}
          {role === "client" && (
            <button
              type="button"
              onClick={onNewProjectClick}
              className="btn-gradient-glow inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Contract</span>
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
