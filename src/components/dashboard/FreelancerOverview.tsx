"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
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
  AlertTriangle,
  FolderGit2,
  Calendar,
} from "lucide-react";
import { PayPalIcon } from "./icons";

interface FreelancerOverviewProps {
  onOpenSubmission: (project: ProjectContract, milestone: Milestone) => void;
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
}

export default function FreelancerOverview({
  onOpenSubmission,
  onOpenAudit,
}: FreelancerOverviewProps) {
  const { projects, setActiveProjectId, setActiveTab, transactions } = useDashboard();

  // Find all milestones across projects
  const allMilestones = projects.flatMap((p) => p.milestones.map((m) => ({ project: p, milestone: m })));

  const activeMilestones = allMilestones.filter(
    (item) => item.milestone.status === "in_progress" || item.milestone.status === "revision_requested"
  );
  const inReviewMilestones = allMilestones.filter(
    (item) => item.milestone.status === "awaiting_client_approval" || item.milestone.status === "under_ai_review"
  );
  const paidMilestones = allMilestones.filter((item) => item.milestone.status === "paid");

  const totalEarned = paidMilestones.reduce((sum, item) => sum + item.milestone.amount, 0);
  const guaranteedEscrow = allMilestones
    .filter((item) => item.milestone.status !== "paid")
    .reduce((sum, item) => sum + item.milestone.amount, 0);

  // Priority Action Spotlight: Revision requested takes highest priority, followed by in_progress
  const actionSpotlight =
    allMilestones.find((item) => item.milestone.status === "revision_requested") ||
    allMilestones.find((item) => item.milestone.status === "in_progress") ||
    allMilestones.find((item) => item.milestone.status === "awaiting_client_approval");

  return (
    <div className="space-y-6">
      {/* 1. Freelancer Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Tasks</span>
            <Clock className="h-4 w-4 text-[#0070BA] dark:text-sky-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {activeMilestones.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Milestones in progress
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">In Client Review</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {inReviewMilestones.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            AI verified & awaiting payout
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Guaranteed Escrow</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ${guaranteedEscrow.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1 block">
            Locked in PayPal Vault
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Received</span>
            <Receipt className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            ${totalEarned.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Instant PayPal settlements
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Client Rating</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ★ 4.98
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            100% on-time milestone delivery
          </span>
        </div>
      </div>

      {/* 2. FREELANCER ACTION SPOTLIGHT */}
      {actionSpotlight && (
        <div
          className={`p-6 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-xl ${
            actionSpotlight.milestone.status === "revision_requested"
              ? "border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white dark:border-amber-500/30 dark:from-[#1E1405]/90 dark:via-[#140E04]/90 dark:to-[#070B14]"
              : "border-blue-300/80 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white dark:border-blue-500/30 dark:from-[#0D182E]/90 dark:via-[#091124]/90 dark:to-[#070B14]"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {actionSpotlight.milestone.status === "revision_requested"
                    ? "Revision Requested • Action Required from Developer"
                    : actionSpotlight.milestone.status === "in_progress"
                    ? "Active Milestone • Work in Progress"
                    : "Deliverables in Review by Client"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  {actionSpotlight.project.title}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Stage 0{actionSpotlight.milestone.stageNumber}: {actionSpotlight.milestone.title}
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {actionSpotlight.milestone.description}
              </p>

              {/* Show Revision Note if requested */}
              {actionSpotlight.milestone.status === "revision_requested" &&
                actionSpotlight.milestone.submissions[actionSpotlight.milestone.submissions.length - 1]
                  ?.revisionRequest && (
                  <div className="mt-3 p-3 rounded-xl border border-amber-300/80 bg-amber-100/60 dark:border-amber-500/30 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold block">Client Feedback:</span>
                    <p className="mt-0.5">
                      "
                      {
                        actionSpotlight.milestone.submissions[
                          actionSpotlight.milestone.submissions.length - 1
                        ]?.revisionRequest?.reason
                      }
                      "
                    </p>
                  </div>
                )}

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold font-mono">
                  Guaranteed Payout: ${actionSpotlight.milestone.amount.toLocaleString()} USD
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300 font-bold">
                  Due: {actionSpotlight.milestone.dueDate}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Client: <span className="font-semibold text-slate-800 dark:text-white">{actionSpotlight.project.client.name}</span>
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              {actionSpotlight.milestone.status === "revision_requested" ||
              actionSpotlight.milestone.status === "in_progress" ? (
                <button
                  type="button"
                  onClick={() => onOpenSubmission(actionSpotlight.project, actionSpotlight.milestone)}
                  className="btn-gradient-glow px-5 py-3 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>
                    {actionSpotlight.milestone.status === "revision_requested"
                      ? "Respond & Resubmit Revised Deliverables"
                      : "Submit Deliverables & Run AI Pre-Flight"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAudit(actionSpotlight.project, actionSpotlight.milestone)}
                  className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer hover:bg-slate-800 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>View Gemini Assessment Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Assigned Milestones Workbench Queue */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Assigned Milestones Queue
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Work through stages, run pre-flight AI audits, and receive instant PayPal Sandbox payouts upon client approval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMilestones.map(({ project, milestone }) => (
            <div
              key={milestone.id}
              className="p-5 rounded-3xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    Stage 0{milestone.stageNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      milestone.status === "paid"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : milestone.status === "awaiting_client_approval"
                        ? "bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300"
                        : milestone.status === "revision_requested"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                    }`}
                  >
                    {milestone.status.replace(/_/g, " ")}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {milestone.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {milestone.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Guaranteed Payout</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${milestone.amount.toLocaleString()} USD
                  </span>
                </div>

                <div>
                  {milestone.status === "in_progress" || milestone.status === "revision_requested" ? (
                    <button
                      type="button"
                      onClick={() => onOpenSubmission(project, milestone)}
                      className="px-3 py-1.5 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      {milestone.status === "revision_requested" ? "Resubmit" : "Submit"}
                    </button>
                  ) : milestone.status === "paid" ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAudit(project, milestone)}
                      className="text-xs text-[#0070BA] dark:text-sky-400 font-bold hover:underline cursor-pointer"
                    >
                      Inspect AI Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
