"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, getFriendlyStatus } from "@/lib/dashboard-data";
import {
  FolderGit2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface AIAuditCenterProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
  onSelectProject?: (projectId: string) => void;
}

const REVIEW_STATUS_FILTERS = [
  { id: "all", label: "All Reviews" },
  { id: "pending_decision", label: "Awaiting Client Decision" },
  { id: "changes_requested", label: "Changes Requested" },
  { id: "completed", label: "Approved & Completed" },
];

export default function AIAuditCenter({ onOpenAudit, onSelectProject }: AIAuditCenterProps) {
  const { projects, role, searchQuery } = useDashboard();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Get all projects that have at least one milestone with a submission or audit report
  const projectsWithReviews = projects.filter((p) =>
    p.milestones.some((m) => m.submissions.length > 0 || m.latestAudit)
  );

  // Filter projects by selected project ID and search query
  const displayedProjects = projectsWithReviews.filter((p) => {
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

  // Helper to get reviewed milestones for a project based on filters
  const getProjectReviews = (project: ProjectContract) => {
    return project.milestones
      .filter((m) => m.submissions.length > 0 || m.latestAudit)
      .filter((milestone) => {
        if (selectedStatus !== "all") {
          if (selectedStatus === "pending_decision") {
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
          } else if (selectedStatus === "completed") {
            if (milestone.status !== "approved" && milestone.status !== "paid") {
              return false;
            }
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
      })
      .map((m) => {
        const latestSub = m.submissions[m.submissions.length - 1];
        const audit = m.latestAudit || latestSub?.aiAssessment;
        const criteria = audit?.criteria || m.acceptanceCriteria;
        const metCount = criteria.filter(
          (c) => c.status === "met" || c.status === "satisfied"
        ).length;
        const attentionCount = criteria.filter(
          (c) =>
            c.status === "missing" ||
            c.status === "needs_manual_review" ||
            c.status === "needs_verification"
        ).length;

        return {
          milestone: m,
          latestSub,
          audit,
          metCount,
          attentionCount,
        };
      });
  };

  const totalReviewsCount = displayedProjects.reduce(
    (sum, p) => sum + getProjectReviews(p).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Clear, Simple Heading & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Work Review & AI Assistance
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Check submitted deliverables and automated checks clearly classified under each project.
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

      {/* 3. Filter Row 1: Filter by Project */}
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
            All Projects ({projectsWithReviews.length})
          </button>

          {projectsWithReviews.map((p) => {
            const count = p.milestones.filter(
              (m) => m.submissions.length > 0 || m.latestAudit
            ).length;
            return (
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
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Row 2: Filter by Review Status */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Filter by Review Status:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {REVIEW_STATUS_FILTERS.map((f) => (
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

      {/* 5. Classified Project Groupings */}
      <div className="space-y-6">
        {totalReviewsCount === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0D1527]">
            No work reviews found matching your selected filters.
          </div>
        ) : (
          displayedProjects.map((project) => {
            const reviews = getProjectReviews(project);
            if (reviews.length === 0) return null;

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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0070BA] dark:bg-blue-950/40 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                        {reviews.length} Review{reviews.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      With <strong className="text-slate-700 dark:text-slate-300">{otherParty}</strong> • Total Budget: <span className="font-mono font-bold">${project.totalBudget.toLocaleString()} USD</span>
                    </p>
                  </div>

                  {onSelectProject && (
                    <button
                      type="button"
                      onClick={() => onSelectProject(project.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-[#0070BA] hover:text-white dark:hover:bg-[#0070BA] dark:hover:text-white text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all cursor-pointer shadow-2xs self-start sm:self-auto shrink-0"
                    >
                      <span>Open Project Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Reviews in this Project */}
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {reviews.map(({ milestone, latestSub, metCount, attentionCount }) => {
                    const statusInfo = getFriendlyStatus(milestone.status);

                    return (
                      <div
                        key={milestone.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onOpenAudit(project, milestone)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onOpenAudit(project, milestone);
                          }
                        }}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] cursor-pointer transition-colors group text-left"
                      >
                        {/* Review info */}
                        <div className="space-y-1.5 flex-1 min-w-0 pr-4">
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

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40">
                              <FolderGit2 className="h-2.5 w-2.5 text-[#0070BA] dark:text-sky-400" />
                              Project: {project.title}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>Submitted: {latestSub?.submittedAt || "Recently"}</span>
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{metCount} requirements met</span>
                            </span>
                            {attentionCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>{attentionCount} needing attention</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Amount & Primary Action */}
                        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Milestone Amount</span>
                            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                              ${milestone.amount.toLocaleString()} USD
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAudit(project, milestone);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>View Report</span>
                          </button>
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
