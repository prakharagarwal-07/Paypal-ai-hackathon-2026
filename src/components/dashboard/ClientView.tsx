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
  FileText,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { ProjectContract, Milestone } from "@/lib/dashboard-data";
import { PayPalIcon } from "./icons";

interface ClientViewProps {
  project: ProjectContract;
  onInspectMilestone: (milestone: Milestone) => void;
}

export default function ClientView({ project, onInspectMilestone }: ClientViewProps) {
  const reviewMilestone = project.milestones.find((m) => m.status === "in_review");
  const escrowRemaining = project.escrowFunded - project.escrowReleased;
  const progressPercent = Math.round((project.escrowReleased / project.totalBudget) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Project Contract Header Card */}
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 sm:p-8 shadow-xl shadow-blue-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0D1527]/75 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Project Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0070BA] dark:bg-blue-500/20 dark:text-sky-300">
                Active Contract
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Created {project.createdAt}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {project.title}
            </h1>

            {/* Freelancer Profile Info */}
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs">
                {project.freelancerAvatar}
              </div>
              <div>
                <span>Assigned to <strong>{project.freelancerName}</strong></span>
                <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-mono">
                  ({project.freelancerEmail})
                </span>
              </div>
            </div>
          </div>

          {/* Escrow Health Gauge */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shrink-0">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                Total Contract Budget
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                ${project.totalBudget.toLocaleString()}.00
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                Released via PayPal
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ${project.escrowReleased.toLocaleString()}.00
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block">
                Locked in Escrow
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#0070BA] dark:text-sky-300 font-mono">
                ${escrowRemaining.toLocaleString()}.00
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-600 dark:text-slate-300">
              Contract Completion Progress
            </span>
            <span className="font-mono text-[#0070BA] dark:text-sky-400 font-bold">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              title="Paid & Released"
            />
            {reviewMilestone && (
              <div
                className="bg-[#0070BA] animate-pulse transition-all duration-500"
                style={{
                  width: `${Math.round((reviewMilestone.amount / project.totalBudget) * 100)}%`,
                }}
                title="Awaiting Your Review"
              />
            )}
          </div>
        </div>
      </div>

      {/* 2. ACTIVE SPOTLIGHT: Milestone in Review (If Any) */}
      {reviewMilestone && (
        <div className="rounded-3xl border border-blue-300/80 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white p-6 sm:p-8 shadow-xl shadow-blue-600/10 dark:border-blue-500/30 dark:from-[#0D182E]/90 dark:via-[#091124]/90 dark:to-[#070B14] backdrop-blur-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0070BA]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Action Required • Deliverables Ready for Review
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Stage 0{reviewMilestone.stageNumber}: {reviewMilestone.title}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {reviewMilestone.description}
              </p>

              {/* Gemini AI Audit Preview Card */}
              {reviewMilestone.aiAudit && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Gemini AI Audit Score: {reviewMilestone.aiAudit.overallScore}%</span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    All {reviewMilestone.aiAudit.criteria.length} agreed acceptance criteria verified with zero critical defects.
                  </div>
                </div>
              )}
            </div>

            {/* Direct Approval Action */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
                  Payout to Release
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                  ${reviewMilestone.amount.toLocaleString()}.00 USD
                </span>
              </div>

              <button
                type="button"
                onClick={() => onInspectMilestone(reviewMilestone)}
                className="btn-gradient-glow flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <PayPalIcon className="h-4 w-4" />
                <span>Inspect Audit & Release via PayPal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Milestone Stages Breakdown (All 4 Stages) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Contract Milestone Stages
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any milestone to view agreed criteria, audit evidence, and PayPal payouts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.milestones.map((m) => {
            const isPaid = m.status === "paid";
            const isInReview = m.status === "in_review";
            const isInProgress = m.status === "in_progress";

            return (
              <div
                key={m.id}
                onClick={() => onInspectMilestone(m)}
                className={`group rounded-3xl border p-5 sm:p-6 shadow-md transition-all cursor-pointer backdrop-blur-xl flex flex-col justify-between ${
                  isInReview
                    ? "border-blue-400 bg-white/95 dark:border-sky-400/80 dark:bg-[#0E172C]/90 shadow-blue-500/10 ring-2 ring-[#0070BA]/20 hover:scale-[1.01]"
                    : isPaid
                    ? "border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-[#0D1527]/70 hover:border-emerald-300 dark:hover:border-emerald-500/30"
                    : "border-slate-200/80 bg-white/60 dark:border-white/5 dark:bg-[#0A0F1D]/60 opacity-85 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      Stage 0{m.stageNumber}
                    </span>

                    {/* Status Pill */}
                    {isPaid && (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                        <Check className="h-3 w-3" />
                        <span>Paid via PayPal</span>
                      </span>
                    )}

                    {isInReview && (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30 animate-pulse">
                        <Clock className="h-3 w-3" />
                        <span>In Review (AI 95%)</span>
                      </span>
                    )}

                    {isInProgress && (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-500/15 dark:text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-500/30">
                        <Clock className="h-3 w-3" />
                        <span>In Progress</span>
                      </span>
                    )}

                    {m.status === "upcoming" && (
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#0070BA] dark:group-hover:text-sky-400 transition-colors">
                    {m.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      Payout Value
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                      ${m.amount.toLocaleString()}.00 USD
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-[#0070BA] dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
