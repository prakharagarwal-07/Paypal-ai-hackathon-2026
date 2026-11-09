"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, getFriendlyStatus } from "@/lib/dashboard-data";
import {
  ArrowLeft,
  Calendar,
  User,
  Settings,
  Sparkles,
  Upload,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wallet,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
} from "lucide-react";
import { PayPalIcon } from "./icons";

interface ProjectWorkspaceProps {
  onBackToProjects?: () => void;
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
  onOpenSubmission: (project: ProjectContract, milestone: Milestone) => void;
  onOpenRevision: (project: ProjectContract, milestone: Milestone) => void;
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
  onOpenEditProject: () => void;
}

export default function ProjectWorkspace({
  onBackToProjects,
  onOpenAudit,
  onOpenSubmission,
  onOpenRevision,
  onOpenPayPal,
  onOpenEditProject,
}: ProjectWorkspaceProps) {
  const { role, activeProject, approveMilestone } = useDashboard();
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(false);

  if (!activeProject) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        No project selected.
      </div>
    );
  }

  const completedCount = activeProject.milestones.filter((m) => m.status === "paid").length;
  const progressPercent = Math.round(
    (completedCount / activeProject.milestones.length) * 100
  );

  const toggleMilestone = (id: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAll = () => {
    const next = !allExpanded;
    setAllExpanded(next);
    const updated: Record<string, boolean> = {};
    activeProject.milestones.forEach((m) => {
      updated[m.id] = next;
    });
    setExpandedMilestones(updated);
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      {onBackToProjects && (
        <button
          type="button"
          onClick={onBackToProjects}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to My Projects</span>
        </button>
      )}

      {/* Completed Project Banner */}
      {activeProject.status === "completed" && (
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-blue-50/40 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:via-[#0D1527] dark:to-blue-950/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  Project Completed & 100% Paid Out
                </strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  PayPal Settled
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                All {activeProject.milestones.length} milestones were delivered, verified, and settled on {activeProject.targetDeadline}. Total paid: <strong className="font-mono font-bold text-emerald-700 dark:text-emerald-400">${activeProject.totalPaid.toLocaleString()} USD</strong>.
              </p>
            </div>
          </div>

          <span className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs self-start sm:self-auto shadow-xs">
            100% Settled
          </span>
        </div>
      )}

      {/* SECTION 1: Project Overview */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0070BA] dark:text-sky-400 block mb-1">
              {activeProject.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {activeProject.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              {activeProject.description}
            </p>
          </div>

          {role === "client" && (
            <button
              type="button"
              onClick={onOpenEditProject}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Project Settings</span>
            </button>
          )}
        </div>

        {/* Client, Freelancer, Total Budget, Completion Date */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-white/5 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Client</span>
            <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
              {activeProject.client.name}
            </span>
            <span className="text-slate-500 text-[11px]">{activeProject.client.company}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Freelancer</span>
            <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
              {activeProject.freelancer.name}
            </span>
            <span className="text-slate-500 text-[11px]">{activeProject.freelancer.title}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Total Budget</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white block mt-0.5">
              ${activeProject.totalBudget.toLocaleString()} USD
            </span>
            <span className="text-slate-500 text-[11px]">
              ${activeProject.totalPaid.toLocaleString()} paid so far
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Completion Date</span>
            <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
              {activeProject.targetDeadline}
            </span>
            <span className="text-slate-500 text-[11px]">Started {activeProject.createdAt}</span>
          </div>
        </div>

        {/* Overall progress */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Overall Progress</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {completedCount} of {activeProject.milestones.length} milestones completed ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0070BA] dark:bg-sky-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Milestones */}
      <div className="space-y-6">
        {/* Visual Progress Stepper (Milestone Flow Track) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#0070BA] dark:text-sky-400" />
              <span className="font-bold text-slate-900 dark:text-white">Milestone Flow Track</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              {completedCount} of {activeProject.milestones.length} completed
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {activeProject.milestones.map((m) => {
              const statusInfo = getFriendlyStatus(m.status);
              const isDone = m.status === "paid";
              const isCurrent =
                m.status === "submitted" ||
                m.status === "in_progress" ||
                m.status === "changes_requested" ||
                m.status === "approved";

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    toggleMilestone(m.id);
                    document.getElementById(`milestone-${m.id}`)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isDone
                      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
                      : isCurrent
                      ? "border-blue-300 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20 shadow-2xs"
                      : "border-slate-200 bg-slate-50/50 dark:border-white/5 dark:bg-white/5 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      Stage 0{m.stageNumber}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : m.status === "changes_requested" ? (
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    ) : m.status === "submitted" ? (
                      <Sparkles className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400 shrink-0" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {m.title}
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                    {statusInfo.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Milestone Timeline Header with Expand/Collapse toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Stages of Work ({activeProject.milestones.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear stage-by-stage progression from start to payout.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{allExpanded ? "Collapse All Details" : "Expand All Details"}</span>
            {allExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Connected Vertical Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-4">
          {/* Vertical connecting track line */}
          <div className="absolute left-3 sm:left-3.5 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-white/10 -translate-x-1/2 pointer-events-none" />

          {activeProject.milestones.map((milestone) => {
            const statusInfo = getFriendlyStatus(milestone.status);
            const isExpanded = !!expandedMilestones[milestone.id];
            const metCount = milestone.acceptanceCriteria.filter(
              (c) => c.status === "met" || c.status === "satisfied"
            ).length;
            const isPaid = milestone.status === "paid";
            const isSubmitted =
              milestone.status === "submitted" ||
              milestone.status === "under_ai_review" ||
              milestone.status === "awaiting_client_approval";
            const isChangesRequested =
              milestone.status === "changes_requested" || milestone.status === "revision_requested";
            const isApproved =
              milestone.status === "approved" || milestone.status === "payment_pending";

            return (
              <div
                key={milestone.id}
                id={`milestone-${milestone.id}`}
                className="relative"
              >
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs z-10 ${
                    isPaid
                      ? "bg-emerald-500 text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40"
                      : isSubmitted
                      ? "bg-[#0070BA] text-white ring-4 ring-blue-50 dark:ring-blue-950/40 animate-pulse-subtle"
                      : isChangesRequested
                      ? "bg-rose-500 text-white ring-4 ring-rose-50 dark:ring-rose-950/40"
                      : isApproved
                      ? "bg-blue-600 text-white ring-4 ring-blue-50 dark:ring-blue-950/40"
                      : "bg-slate-100 dark:bg-white/10 text-slate-400 ring-4 ring-slate-50 dark:ring-slate-900/40 border border-slate-200 dark:border-white/10"
                  }`}
                >
                  {isPaid ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : isSubmitted ? (
                    <Sparkles className="h-3.5 w-3.5" />
                  ) : isChangesRequested ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : isApproved ? (
                    <Wallet className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-[11px] font-mono">{milestone.stageNumber}</span>
                  )}
                </div>

                {/* Milestone card */}
                <div
                  className={`rounded-2xl border transition-all ${
                    isSubmitted
                      ? "border-blue-300 dark:border-blue-900/60 bg-white dark:bg-[#0D1527] shadow-sm"
                      : isChangesRequested
                      ? "border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0D1527] shadow-sm"
                      : "border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527]"
                  }`}
                >
                  {/* Card Header & Content */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          Stage 0{milestone.stageNumber}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {milestone.title}
                        </h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {milestone.description}
                      </p>

                      {/* Compact Requirements Pill (Click to toggle details) */}
                      <div className="pt-1.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleMilestone(milestone.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          <CheckCircle2
                            className={`h-3 w-3 ${
                              metCount === milestone.acceptanceCriteria.length
                                ? "text-emerald-500"
                                : "text-amber-500"
                            }`}
                          />
                          <span>
                            {metCount} of {milestone.acceptanceCriteria.length} requirements met
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-slate-400" />
                          )}
                        </button>

                        <span className="text-[11px] text-slate-400">
                          Due: {milestone.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Amount & Primary Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Milestone Amount</span>
                        <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          ${milestone.amount.toLocaleString()} USD
                        </span>
                      </div>

                      {/* Primary Role Action Button */}
                      <div>
                        {role === "client" ? (
                          <>
                            {isSubmitted && (
                              <button
                                type="button"
                                onClick={() => onOpenAudit(activeProject, milestone)}
                                className="px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Review Work</span>
                              </button>
                            )}

                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => onOpenPayPal(activeProject, milestone)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                              >
                                <PayPalIcon className="h-3.5 w-3.5" />
                                <span>Pay Now</span>
                              </button>
                            )}

                            {isChangesRequested && (
                              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                                Waiting for Updates
                              </span>
                            )}

                            {isPaid && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Paid via PayPal</span>
                              </span>
                            )}

                            {milestone.status === "in_progress" && (
                              <span className="text-xs text-slate-500 font-medium">
                                In Progress
                              </span>
                            )}

                            {milestone.status === "not_started" && (
                              <span className="text-xs text-slate-400 font-medium">
                                Upcoming
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {(milestone.status === "in_progress" || isChangesRequested) && (
                              <button
                                type="button"
                                onClick={() => onOpenSubmission(activeProject, milestone)}
                                className="px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                <span>{isChangesRequested ? "Update & Resubmit" : "Submit Work"}</span>
                              </button>
                            )}

                            {isSubmitted && (
                              <button
                                type="button"
                                onClick={() => onOpenAudit(activeProject, milestone)}
                                className="px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 text-[#0070BA] dark:text-sky-300 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors"
                              >
                                View Submission
                              </button>
                            )}

                            {isApproved && (
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                                Awaiting Client Payment
                              </span>
                            )}

                            {isPaid && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Payment Received</span>
                              </span>
                            )}

                            {milestone.status === "not_started" && (
                              <span className="text-xs text-slate-400 font-medium">
                                Upcoming
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details Section (Requirements, Submission, Feedback) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/50 dark:bg-white/[0.02] rounded-b-2xl">
                      {/* Changes requested feedback notice */}
                      {isChangesRequested && (
                        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5 mt-3">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                          <div>
                            <strong className="block font-bold">Feedback from {activeProject.client.name}:</strong>
                            <p className="mt-0.5 text-rose-700 dark:text-rose-300">
                              Please review the requested changes and submit your updated deliverables.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Latest submission links */}
                      {milestone.submissions && milestone.submissions.length > 0 && (
                        <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              Latest Deliverable Submitted
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {milestone.submissions[0].submittedAt}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {milestone.submissions[0].demoUrl && (
                              <a
                                href={milestone.submissions[0].demoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 text-xs font-semibold text-[#0070BA] dark:text-sky-300 hover:underline border border-slate-200 dark:border-white/10"
                              >
                                <span>Live Demo</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => onOpenAudit(activeProject, milestone)}
                              className="text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:underline cursor-pointer"
                            >
                              Open AI Review Report →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Requirements checklist */}
                      <div className="mt-3 space-y-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Agreed Requirements ({milestone.acceptanceCriteria.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {milestone.acceptanceCriteria.map((crit) => {
                            const isCritMet = crit.status === "met" || crit.status === "satisfied";
                            return (
                              <div
                                key={crit.id}
                                className="p-2.5 rounded-xl border border-slate-200/80 bg-white dark:border-white/5 dark:bg-[#0D1527] flex items-start gap-2.5 text-xs"
                              >
                                <CheckCircle2
                                  className={`h-4 w-4 shrink-0 mt-0.5 ${
                                    isCritMet
                                      ? "text-emerald-500"
                                      : "text-slate-300 dark:text-slate-600"
                                  }`}
                                />
                                <div className="min-w-0">
                                  <span className="font-semibold text-slate-900 dark:text-white block truncate">
                                    {crit.title}
                                  </span>
                                  {crit.description && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                      {crit.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Recent Updates */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Updates
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest submissions, review feedback, and payment records.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] divide-y divide-slate-100 dark:divide-white/5">
          {activeProject.activityLog.map((act) => (
            <div key={act.id} className="p-4 flex items-start gap-3 text-xs">
              <div className="h-2 w-2 rounded-full bg-[#0070BA] mt-1.5 shrink-0" />
              <div className="flex-1">
                <span className="font-bold text-slate-900 dark:text-white">{act.actor}:</span>{" "}
                <span className="text-slate-700 dark:text-slate-300">{act.action}</span>
                {act.details && (
                  <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px] italic">
                    "{act.details}"
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block mt-1">
                  {act.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
