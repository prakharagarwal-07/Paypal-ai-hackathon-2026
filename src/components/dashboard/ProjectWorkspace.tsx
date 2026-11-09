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
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
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
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

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

  // Default to first milestone if none selected
  const currentMilestone =
    activeProject.milestones.find((m) => m.id === selectedMilestoneId) ||
    activeProject.milestones[0];

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
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Milestones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stages of work agreed for this project.
          </p>
        </div>

        <div className="space-y-3">
          {activeProject.milestones.map((milestone) => {
            const statusInfo = getFriendlyStatus(milestone.status);
            const isSelected = currentMilestone.id === milestone.id;

            return (
              <div
                key={milestone.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-[#0070BA] bg-blue-50/20 dark:border-sky-400 dark:bg-white/5"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#0D1527]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        Stage 0{milestone.stageNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {milestone.title}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {milestone.description}
                    </p>
                  </div>

                  {/* Amount, Due Date & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                        ${milestone.amount.toLocaleString()} USD
                      </span>
                      <span className="text-[11px] text-slate-400">Due {milestone.dueDate}</span>
                    </div>

                    {/* Single obvious primary action */}
                    <div>
                      {role === "client" ? (
                        <>
                          {(milestone.status === "submitted" ||
                            milestone.status === "awaiting_client_approval") && (
                            <button
                              type="button"
                              onClick={() => onOpenAudit(activeProject, milestone)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors"
                            >
                              Review Work
                            </button>
                          )}

                          {(milestone.status === "approved" ||
                            milestone.status === "payment_pending") && (
                            <button
                              type="button"
                              onClick={() => onOpenPayPal(activeProject, milestone)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors"
                            >
                              <PayPalIcon className="h-3.5 w-3.5" />
                              <span>Pay Now</span>
                            </button>
                          )}

                          {milestone.status === "paid" && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Paid</span>
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {(milestone.status === "in_progress" ||
                            milestone.status === "changes_requested" ||
                            milestone.status === "revision_requested") && (
                            <button
                              type="button"
                              onClick={() => onOpenSubmission(activeProject, milestone)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors"
                            >
                              {milestone.status === "changes_requested" || milestone.status === "revision_requested"
                                ? "Update Work"
                                : "Submit Work"}
                            </button>
                          )}

                          {(milestone.status === "submitted" ||
                            milestone.status === "awaiting_client_approval") && (
                            <button
                              type="button"
                              onClick={() => onOpenAudit(activeProject, milestone)}
                              className="text-xs text-[#0070BA] dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                            >
                              View Submission
                            </button>
                          )}

                          {milestone.status === "paid" && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Paid</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requirements Checklist */}
                {milestone.acceptanceCriteria.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Agreed Requirements:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {milestone.acceptanceCriteria.map((crit) => (
                        <div
                          key={crit.id}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2
                            className={`h-3.5 w-3.5 shrink-0 ${
                              crit.status === "met" || crit.status === "satisfied"
                                ? "text-emerald-500"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                          <span className="truncate">{crit.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
