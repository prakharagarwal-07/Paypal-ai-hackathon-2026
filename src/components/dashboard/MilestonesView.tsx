"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, getFriendlyStatus, isProjectCompleted } from "@/lib/dashboard-data";
import {
  FolderGit2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Wallet,
  Calendar,
  Layers,
  Check,
  Upload,
  Play,
} from "lucide-react";
import { PayPalIcon } from "./icons";

interface MilestonesViewProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
  onOpenSubmission: (project: ProjectContract, milestone: Milestone) => void;
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
  onOpenRevision?: (project: ProjectContract, milestone: Milestone) => void;
  onOpenInvoice?: (project: ProjectContract, milestone: Milestone, transactionId?: string) => void;
  onSelectProject: (projectId: string) => void;
}

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All Statuses" },
  { id: "submitted", label: "Submitted for Review" },
  { id: "changes_requested", label: "Changes Requested" },
  { id: "approved", label: "Approved (Payment Ready)" },
  { id: "in_progress", label: "In Progress" },
  { id: "paid", label: "Payment Completed" },
  { id: "not_started", label: "Not Started" },
];

export default function MilestonesView({
  onOpenAudit,
  onOpenSubmission,
  onOpenPayPal,
  onOpenRevision,
  onOpenInvoice,
  onSelectProject,
}: MilestonesViewProps) {
  const { projects, role, searchQuery, approveMilestone, startMilestoneWork } = useDashboard();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  // Filter projects by selected project ID and search query
  const projectsToDisplay = projects.filter((p) => {
    if (selectedProjectId !== "all" && p.id !== selectedProjectId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hasMilestoneMatch = p.milestones.some((m) =>
        m.title.toLowerCase().includes(q)
      );
      const hasProjectMatch = p.title.toLowerCase().includes(q);
      return hasMilestoneMatch || hasProjectMatch;
    }
    return true;
  });

  // Helper to filter milestones in a project
  const getFilteredMilestones = (project: ProjectContract) => {
    return project.milestones.filter((milestone) => {
      if (selectedStatus !== "all") {
        if (selectedStatus === "submitted") {
          if (
            milestone.status !== "submitted" &&
            milestone.status !== "awaiting_client_approval" &&
            milestone.status !== "under_ai_review"
          ) {
            return false;
          }
        } else if (selectedStatus === "changes_requested") {
          if (
            milestone.status !== "changes_requested" &&
            milestone.status !== "revision_requested"
          ) {
            return false;
          }
        } else if (selectedStatus === "approved") {
          if (
            milestone.status !== "approved" &&
            milestone.status !== "payment_pending"
          ) {
            return false;
          }
        } else if (milestone.status !== selectedStatus) {
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
  };

  // Count total matching milestones across displayed projects
  const totalMatchingMilestones = projectsToDisplay.reduce(
    (sum, p) => sum + getFilteredMilestones(p).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Milestones by Project
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 shadow-2xs">
            Work in Any Order
          </span>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Non-sequential milestone execution — start, submit, and approve any stage independently.
        </p>
      </div>

      {/* Filter Row 1: Filter by Project */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Filter by Project:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedProjectId("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedProjectId === "all"
                ? "bg-[#0070BA] text-white shadow-2xs font-bold"
                : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Projects ({projects.length})
          </button>

          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedProjectId === p.id
                  ? "bg-[#0070BA] text-white shadow-2xs font-bold"
                  : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{p.title}</span>
              <span className="ml-1.5 opacity-70">({p.milestones.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row 2: Filter by Milestone Status */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Filter by Status:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === f.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold"
                  : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project Groupings List */}
      <div className="space-y-6">
        {totalMatchingMilestones === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0D1527]">
            No milestones found matching your selected filters.
          </div>
        ) : (
          projectsToDisplay.map((project) => {
            const projectMilestones = getFilteredMilestones(project);
            if (projectMilestones.length === 0) return null;

            const completedCount = project.milestones.filter((m) => m.status === "paid").length;
            const progress = Math.round((completedCount / project.milestones.length) * 100);
            const otherParty = role === "client" ? project.freelancer.name : project.client.name;

            return (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] overflow-hidden shadow-xs space-y-0"
              >
                {/* Project Header Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-[#0070BA] dark:text-sky-400" />
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {project.title}
                      </h2>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isProjectCompleted(project)
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-blue-50 text-[#0070BA] dark:bg-blue-950/40 dark:text-sky-300 border border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        {isProjectCompleted(project) ? "Completed & Settled" : "Active Project"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      With <strong className="text-slate-700 dark:text-slate-300">{otherParty}</strong> • Total Budget: <span className="font-mono font-bold">${project.totalBudget.toLocaleString()} USD</span> • {completedCount} of {project.milestones.length} stages completed ({progress}%)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-[#0070BA] hover:text-white dark:hover:bg-[#0070BA] dark:hover:text-white text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all cursor-pointer shadow-2xs self-start sm:self-auto shrink-0"
                  >
                    <span>Open Project Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Milestones inside this project */}
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {projectMilestones.map((milestone) => {
                    const statusInfo = getFriendlyStatus(milestone.status);
                    const isPaid = milestone.status === "paid";
                    const isSubmitted =
                      milestone.status === "submitted" ||
                      milestone.status === "under_ai_review" ||
                      milestone.status === "awaiting_client_approval";
                    const isChangesRequested =
                      milestone.status === "changes_requested" ||
                      milestone.status === "revision_requested";
                    const isApproved =
                      milestone.status === "approved" || milestone.status === "payment_pending";

                    return (
                      <div
                        key={milestone.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectProject(project.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectProject(project.id);
                          }
                        }}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] cursor-pointer transition-colors group text-left"
                      >
                        {/* Milestone details */}
                        <div className="space-y-1 min-w-0 pr-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              Stage 0{milestone.stageNumber}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0070BA] dark:group-hover:text-sky-300 transition-colors">
                              {milestone.title}
                            </h3>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.badgeClass}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {milestone.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 pt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40">
                              <FolderGit2 className="h-2.5 w-2.5 text-[#0070BA] dark:text-sky-400" />
                              Project: {project.title}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due {milestone.dueDate}</span>
                            </span>
                            <span>•</span>
                            <span>{milestone.acceptanceCriteria.length} requirements</span>
                          </div>
                        </div>

                        {/* Amount & Primary Action */}
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
                                {isSubmitted && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        approveMilestone(project.id, milestone.id);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                                    >
                                      <Check className="h-3 w-3 stroke-[3]" />
                                      <span>Approve</span>
                                    </button>
                                    {onOpenRevision && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenRevision(project, milestone);
                                        }}
                                        className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                                      >
                                        Revision
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenAudit(project, milestone);
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors shadow-xs"
                                    >
                                      Review
                                    </button>
                                  </div>
                                )}

                                {isApproved && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenPayPal(project, milestone);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                                  >
                                    <PayPalIcon className="h-3.5 w-3.5" />
                                    <span>Pay Now</span>
                                  </button>
                                )}

                                {isChangesRequested && (
                                  <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                                    Revision Requested
                                  </span>
                                )}

                                {isPaid && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                      <span>Paid</span>
                                    </span>
                                    {onOpenInvoice && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenInvoice(project, milestone, milestone.paypalTransactionId);
                                        }}
                                        className="text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Sparkles className="h-3 w-3" />
                                        <span>AI Invoice</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {milestone.status === "not_started" && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenSubmission(project, milestone);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                                      title="Submit deliverables directly"
                                    >
                                      <Upload className="h-3 w-3" />
                                      <span>Submit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startMilestoneWork(project.id, milestone.id);
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-1"
                                      title="Start working"
                                    >
                                      <Play className="h-2.5 w-2.5 text-[#0070BA] dark:text-sky-400 fill-current" />
                                      <span>Start</span>
                                    </button>
                                  </div>
                                )}

                                {(milestone.status === "in_progress" || isChangesRequested) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenSubmission(project, milestone);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                                  >
                                    <Upload className="h-3 w-3" />
                                    <span>{isChangesRequested ? "Update Work" : "Submit Work"}</span>
                                  </button>
                                )}

                                {isSubmitted && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenAudit(project, milestone);
                                    }}
                                    className="text-xs text-[#0070BA] dark:text-sky-400 font-semibold hover:underline"
                                  >
                                    View Submission
                                  </button>
                                )}

                                {isApproved && (
                                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30">
                                    Approved
                                  </span>
                                )}

                                {isPaid && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                      <span>Paid</span>
                                    </span>
                                    {onOpenInvoice && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenInvoice(project, milestone, milestone.paypalTransactionId);
                                        }}
                                        className="text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Sparkles className="h-3 w-3" />
                                        <span>AI Invoice</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </>
                            )}

                            {/* Chevron indicating clickability */}
                            <div
                              className="p-1.5 rounded-lg text-slate-400 group-hover:text-[#0070BA] dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all"
                              title="Open in project workspace"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
