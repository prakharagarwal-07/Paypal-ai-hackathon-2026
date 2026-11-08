"use client";

import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Wallet,
  Check,
  Upload,
  Receipt,
  FileCheck2,
} from "lucide-react";
import { ProjectContract, Milestone } from "@/lib/dashboard-data";
import { PayPalIcon } from "./icons";

interface FreelancerViewProps {
  project: ProjectContract;
  onOpenSubmission: (milestone: Milestone) => void;
  onInspectMilestone: (milestone: Milestone) => void;
}

export default function FreelancerView({
  project,
  onOpenSubmission,
  onInspectMilestone,
}: FreelancerViewProps) {
  const inProgressMilestone = project.milestones.find(
    (m) => m.status === "in_progress" || m.status === "in_review"
  );
  const paidMilestones = project.milestones.filter((m) => m.status === "paid");
  const escrowLocked = project.escrowFunded - project.escrowReleased;

  return (
    <div className="space-y-6">
      {/* 1. Freelancer Workbench Header Banner */}
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 sm:p-8 shadow-xl shadow-blue-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0D1527]/75 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                Freelancer Workbench
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Contract with {project.clientName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {project.title}
            </h1>

            {/* Escrow Guarantee Notice */}
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 px-3.5 py-2 rounded-xl max-w-xl">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>
                Funds are 100% pre-funded in PayPal Escrow. You are guaranteed payout upon milestone completion.
              </span>
            </div>
          </div>

          {/* Freelancer Payout Stats */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shrink-0">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                Received in PayPal
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ${project.escrowReleased.toLocaleString()}.00
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                Escrow Awaiting Payout
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#0070BA] dark:text-sky-300 font-mono">
                ${escrowLocked.toLocaleString()}.00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Milestone Workbench / Submission Station */}
      {inProgressMilestone && (
        <div className="rounded-3xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white p-6 sm:p-8 shadow-xl shadow-emerald-600/10 dark:border-emerald-500/30 dark:from-[#091D1E]/80 dark:via-[#091124]/80 dark:to-[#070B14] backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  Stage 0{inProgressMilestone.stageNumber} • Payout: ${inProgressMilestone.amount.toLocaleString()}.00 USD
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Due {inProgressMilestone.dueDate}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {inProgressMilestone.title}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {inProgressMilestone.description}
              </p>

              {inProgressMilestone.status === "in_review" ? (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 px-3.5 py-1.5 rounded-xl w-fit">
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitted to Sarah • Gemini AI Verified 95% • Awaiting Client Sign-Off</span>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <FileCheck2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>When ready, submit your live staging link and GitHub PR for automated AI audit.</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
              {inProgressMilestone.status === "in_review" ? (
                <button
                  type="button"
                  onClick={() => onInspectMilestone(inProgressMilestone)}
                  className="btn-gradient-glow flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:scale-[1.02] cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>View Submitted AI Audit</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenSubmission(inProgressMilestone)}
                  className="btn-gradient-glow flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#0070BA] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-emerald-600/25 hover:scale-[1.02] cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Submit Deliverables & Run Pre-Flight</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Pre-Flight AI Protection Explainer */}
      <div className="rounded-3xl border border-blue-200/80 bg-blue-50/50 p-6 sm:p-7 dark:border-blue-500/20 dark:bg-[#0070BA]/10 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                How Gemini AI Protects Your Freelance Work
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Before your client sees your deliverables, our pre-flight inspector verifies all agreed acceptance criteria. If anything is missing, you get immediate actionable feedback so you never get ghosted or face scope creep disputes.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-[#0070BA] dark:text-sky-300 shrink-0 bg-white dark:bg-[#131C31] px-3.5 py-2 rounded-xl border border-blue-200 dark:border-white/10 shadow-sm">
            ✓ 0% Scope Creep
          </div>
        </div>
      </div>

      {/* 4. Payout History & Real PayPal Receipts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              PayPal Payout Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Funds transferred directly to your PayPal Sandbox wallet (<span className="font-mono text-emerald-600 dark:text-emerald-400">{project.freelancerEmail}</span>).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {paidMilestones.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-[#0D1527]/75 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                  <PayPalIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Stage 0{m.stageNumber}: {m.title}
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      COMPLETED
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Ref ID: {m.paypalTransactionId || "PAYID-MN7642-8921-A"} • Paid on {m.paidAt}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-white/5">
                <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                  +${m.amount.toLocaleString()}.00 USD
                </span>

                <button
                  type="button"
                  onClick={() => onInspectMilestone(m)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
