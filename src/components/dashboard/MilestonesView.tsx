"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, getFriendlyStatus, MilestoneStatus } from "@/lib/dashboard-data";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { PayPalIcon } from "./icons";

interface MilestonesViewProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
  onOpenSubmission: (project: ProjectContract, milestone: Milestone) => void;
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
  onSelectProject: (projectId: string) => void;
}

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "submitted", label: "Submitted for Review" },
  { id: "changes_requested", label: "Changes Requested" },
  { id: "approved", label: "Approved" },
  { id: "in_progress", label: "In Progress" },
  { id: "paid", label: "Payment Completed" },
  { id: "not_started", label: "Not Started" },
];

export default function MilestonesView({
  onOpenAudit,
  onOpenSubmission,
  onOpenPayPal,
  onSelectProject,
}: MilestonesViewProps) {
  const { projects, role, searchQuery, setActiveProjectId, setActiveTab } = useDashboard();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const allMilestones = projects.flatMap((p) =>
    p.milestones.map((m) => ({ project: p, milestone: m }))
  );

  const filtered = allMilestones.filter(({ project, milestone }) => {
    if (selectedFilter !== "all") {
      if (selectedFilter === "submitted") {
        if (milestone.status !== "submitted" && milestone.status !== "awaiting_client_approval" && milestone.status !== "under_ai_review") {
          return false;
        }
      } else if (selectedFilter === "changes_requested") {
        if (milestone.status !== "changes_requested" && milestone.status !== "revision_requested") {
          return false;
        }
      } else if (selectedFilter === "approved") {
        if (milestone.status !== "approved" && milestone.status !== "payment_pending") {
          return false;
        }
      } else if (milestone.status !== selectedFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        milestone.title.toLowerCase().includes(q) ||
        project.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Milestones
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Individual stages of work and their current status.
        </p>
      </div>

      {/* Simple Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelectedFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === f.id
                ? "bg-[#0070BA] text-white shadow-2xs font-bold"
                : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Milestones Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
            No milestones found with this status.
          </div>
        ) : (
          filtered.map(({ project, milestone }) => {
            const statusInfo = getFriendlyStatus(milestone.status);

            return (
              <div
                key={milestone.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-white/20 transition-all"
              >
                <div className="space-y-1 min-w-0 pr-4">
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

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                    <span>Due: {milestone.dueDate}</span>
                    <span>•</span>
                    <span>{milestone.acceptanceCriteria.length} requirements</span>
                  </div>
                </div>

                {/* Amount & Obvious Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Milestone Amount</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      ${milestone.amount.toLocaleString()} USD
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Primary Role Action */}
                    {role === "client" ? (
                      <>
                        {(milestone.status === "submitted" ||
                          milestone.status === "awaiting_client_approval") && (
                          <button
                            type="button"
                            onClick={() => onOpenAudit(project, milestone)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors"
                          >
                            Review Work
                          </button>
                        )}

                        {(milestone.status === "approved" ||
                          milestone.status === "payment_pending") && (
                          <button
                            type="button"
                            onClick={() => onOpenPayPal(project, milestone)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <PayPalIcon className="h-3.5 w-3.5" />
                            <span>Pay Now</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {(milestone.status === "in_progress" ||
                          milestone.status === "changes_requested" ||
                          milestone.status === "revision_requested") && (
                          <button
                            type="button"
                            onClick={() => onOpenSubmission(project, milestone)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors"
                          >
                            {milestone.status === "changes_requested" || milestone.status === "revision_requested"
                              ? "Update Work"
                              : "Submit Work"}
                          </button>
                        )}
                      </>
                    )}

                    {/* View in Project Workspace */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveProjectId(project.id);
                        setActiveTab("projects");
                      }}
                      className="p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      title="Open project workspace"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
