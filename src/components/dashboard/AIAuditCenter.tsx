"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, getFriendlyStatus, getFriendlyCriterionStatus } from "@/lib/dashboard-data";
import { Sparkles, CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";

interface AIAuditCenterProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
}

export default function AIAuditCenter({ onOpenAudit }: AIAuditCenterProps) {
  const { projects } = useDashboard();

  // Find all milestones that have a submission or review report
  const reviewMilestones = projects.flatMap((p) =>
    p.milestones
      .filter((m) => m.submissions.length > 0 || m.latestAudit)
      .map((m) => {
        const latestSub = m.submissions[m.submissions.length - 1];
        const audit = m.latestAudit || latestSub?.aiAssessment;
        const criteria = audit?.criteria || m.acceptanceCriteria;
        const metCount = criteria.filter((c) => c.status === "met" || c.status === "satisfied").length;
        const attentionCount = criteria.filter(
          (c) => c.status === "missing" || c.status === "needs_manual_review" || c.status === "needs_verification"
        ).length;

        return {
          project: p,
          milestone: m,
          latestSub,
          audit,
          metCount,
          attentionCount,
        };
      })
  );

  return (
    <div className="space-y-6">
      {/* 1. Clear, Simple Heading & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Work Review & AI Assistance
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Check submitted work against the requirements agreed for each milestone.
        </p>
      </div>

      {/* 2. Plain Language Explanatory Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-[#0070BA] dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 dark:text-white block">
            How Automated Work Review Works
          </span>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">
            MilestoneOS automatically checks submitted links and code against agreed milestone requirements to save you time. The AI provides a quick checklist, while the client always makes the final decision to approve the milestone or request changes.
          </p>
        </div>
      </div>

      {/* 3. Review Cards List */}
      <div className="space-y-4">
        {reviewMilestones.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
            No work has been submitted for review yet.
          </div>
        ) : (
          reviewMilestones.map(({ project, milestone, latestSub, metCount, attentionCount }) => {
            const statusInfo = getFriendlyStatus(milestone.status);

            return (
              <div
                key={milestone.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-white/20 transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {milestone.title}
                    </h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.badgeClass}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Project: <strong className="text-slate-700 dark:text-slate-300 font-medium">{project.title}</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Submitted: {latestSub?.submittedAt || "Recently"}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {metCount} requirements met
                    </span>
                    {attentionCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          {attentionCount} needing attention
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Milestone Amount</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      ${milestone.amount.toLocaleString()} USD
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAudit(project, milestone)}
                    className="px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors"
                  >
                    View Report
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
