"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, getFriendlyStatus } from "@/lib/dashboard-data";
import {
  FolderGit2,
  Sparkles,
  Wallet,
  Receipt,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Calendar,
} from "lucide-react";
import { PayPalIcon } from "./icons";

interface DashboardOverviewProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
  onOpenSubmission: (project: ProjectContract, milestone: Milestone) => void;
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
  onOpenNewProject: () => void;
  onSelectProject?: (projectId: string) => void;
  onNavigateToProjects?: () => void;
}

export default function DashboardOverview({
  onOpenAudit,
  onOpenSubmission,
  onOpenPayPal,
  onOpenNewProject,
  onSelectProject,
  onNavigateToProjects,
}: DashboardOverviewProps) {
  const {
    projects,
    role,
    setActiveProjectId,
    setActiveTab,
  } = useDashboard();

  // Clean metrics calculations
  const totalProjects = projects.filter((p) => p.status === "active").length;
  const allMilestones = projects.flatMap((p) =>
    p.milestones.map((m) => ({ project: p, milestone: m }))
  );

  const pendingReviews = allMilestones.filter(
    (item) => item.milestone.status === "submitted" || item.milestone.status === "awaiting_client_approval"
  );

  const paymentsDue = allMilestones.filter(
    (item) => item.milestone.status === "approved" || item.milestone.status === "payment_pending"
  );
  const paymentsDueTotal = paymentsDue.reduce((sum, item) => sum + item.milestone.amount, 0);

  const totalPaid = projects.reduce((sum, p) => sum + p.totalPaid, 0);

  // Actions Needed list (items that need user attention)
  const actionsNeeded: {
    type: "review" | "payment" | "submit" | "revision";
    title: string;
    description: string;
    actionLabel: string;
    project: ProjectContract;
    milestone: Milestone;
  }[] = [];

  if (role === "client") {
    // 1. Milestones submitted for review
    pendingReviews.forEach(({ project, milestone }) => {
      actionsNeeded.push({
        type: "review",
        title: `Review work for "${milestone.title}"`,
        description: `${project.freelancer.name} submitted work. Check requirements and approve or request changes.`,
        actionLabel: "View",
        project,
        milestone,
      });
    });

    // 2. Milestones approved and ready for payment
    paymentsDue.forEach(({ project, milestone }) => {
      actionsNeeded.push({
        type: "payment",
        title: `Payment ready: $${milestone.amount.toLocaleString()} USD for "${milestone.title}"`,
        description: `Work was approved. Send payment to ${project.freelancer.name} via PayPal Sandbox.`,
        actionLabel: "Pay Now",
        project,
        milestone,
      });
    });
  } else {
    // Freelancer actions
    // 1. Milestones with changes requested
    const changesRequested = allMilestones.filter(
      (item) => item.milestone.status === "changes_requested" || item.milestone.status === "revision_requested"
    );
    changesRequested.forEach(({ project, milestone }) => {
      actionsNeeded.push({
        type: "revision",
        title: `Changes requested on "${milestone.title}"`,
        description: `${project.client.name} requested updates before this milestone can be approved.`,
        actionLabel: "View",
        project,
        milestone,
      });
    });

    // 2. Active in-progress milestones
    const inProgress = allMilestones.filter((item) => item.milestone.status === "in_progress");
    inProgress.forEach(({ project, milestone }) => {
      actionsNeeded.push({
        type: "submit",
        title: `Submit work for "${milestone.title}"`,
        description: `Due on ${milestone.dueDate}. Submit your demo link and files when ready.`,
        actionLabel: "View",
        project,
        milestone,
      });
    });
  }

  // Combined recent activity feed (latest 4 items across projects)
  const recentActivities = projects
    .flatMap((p) => p.activityLog.map((act) => ({ ...act, projectTitle: p.title })))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Overall project progress and payment activity.
        </p>
      </div>

      {/* 2. Four Clean, Compact Summary Cards (Clickable) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Projects */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateToProjects) {
              onNavigateToProjects();
            } else {
              setActiveTab("projects");
            }
          }}
          title="Click to view all active projects"
          className="group p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] text-left w-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#0070BA]/50 dark:hover:border-sky-400/50 hover:shadow-lg hover:shadow-sky-500/5 active:translate-y-0 focus:outline-hidden focus:ring-2 focus:ring-[#0070BA]/40"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Active Projects
            </span>
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              <FolderGit2 className="h-4 w-4 text-[#0070BA] dark:text-sky-400 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalProjects}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>In progress</span>
            <span className="text-[#0070BA] dark:text-sky-400 font-semibold inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </button>

        {/* Pending Reviews */}
        <button
          type="button"
          onClick={() => setActiveTab("work-review")}
          title="Click to check submitted work and AI reports"
          className="group p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] text-left w-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-amber-400/60 dark:hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/5 active:translate-y-0 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Pending Reviews
            </span>
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              <Sparkles className="h-4 w-4 text-amber-500 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingReviews.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>
              {pendingReviews.length === 1 ? "1 milestone waiting" : `${pendingReviews.length} milestones waiting`}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Review <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </button>

        {/* Payments Due */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("payments");
            setTimeout(() => {
              document.getElementById("payments-to-make")?.scrollIntoView({ behavior: "smooth" });
            }, 60);
          }}
          title="Click to view payments waiting to be completed"
          className="group p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] text-left w-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/60 dark:hover:border-[#0070BA]/50 hover:shadow-lg hover:shadow-blue-500/5 active:translate-y-0 focus:outline-hidden focus:ring-2 focus:ring-[#0070BA]/40"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Payments Due
            </span>
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              <Wallet className="h-4 w-4 text-[#0070BA] dark:text-sky-400 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            ${paymentsDueTotal.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>
              {paymentsDue.length} approved milestone{paymentsDue.length === 1 ? "" : "s"}
            </span>
            <span className="text-[#0070BA] dark:text-sky-400 font-semibold inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Pay <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </button>

        {/* Total Paid */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("payments");
            setTimeout(() => {
              document.getElementById("transaction-history")?.scrollIntoView({ behavior: "smooth" });
            }, 60);
          }}
          title="Click to view transaction history"
          className="group p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] text-left w-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400/60 dark:hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/5 active:translate-y-0 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Total Paid
            </span>
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              <Receipt className="h-4 w-4 text-emerald-500 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ${totalPaid.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>Through PayPal Sandbox</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Records <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </button>
      </div>

      {/* 3. Actions Needed */}
      {actionsNeeded.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Actions Needed</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {actionsNeeded.length}
              </span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Items requiring your attention or review
            </span>
          </div>

          <div className="space-y-3">
            {actionsNeeded.map((item, idx) => {
              const handleViewWorkReview = () => {
                setActiveProjectId(item.project.id);
                setActiveTab("work-review");
                onOpenAudit(item.project, item.milestone);
              };

              // Determine border and theme styles based on action type
              const isRevision = item.type === "revision";
              const isReview = item.type === "review";
              const isPayment = item.type === "payment";

              const borderAccent = isRevision
                ? "border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-[#0D1527] dark:to-[#0D1527]"
                : isReview
                ? "border-l-4 border-l-[#0070BA] bg-gradient-to-r from-blue-50/40 via-white to-white dark:from-blue-950/20 dark:via-[#0D1527] dark:to-[#0D1527]"
                : isPayment
                ? "border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-[#0D1527] dark:to-[#0D1527]"
                : "border-l-4 border-l-sky-500 bg-gradient-to-r from-sky-50/40 via-white to-white dark:from-sky-950/20 dark:via-[#0D1527] dark:to-[#0D1527]";

              const iconBadge = isRevision ? (
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 shrink-0 shadow-2xs">
                  <AlertCircle className="h-4 w-4" />
                </div>
              ) : isReview ? (
                <div className="p-2.5 rounded-xl bg-blue-100 text-[#0070BA] dark:bg-blue-950/50 dark:text-sky-400 shrink-0 shadow-2xs">
                  <Sparkles className="h-4 w-4" />
                </div>
              ) : isPayment ? (
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shrink-0 shadow-2xs">
                  <PayPalIcon className="h-4 w-4" />
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-sky-100 text-[#0070BA] dark:bg-sky-950/50 dark:text-sky-400 shrink-0 shadow-2xs">
                  <Clock className="h-4 w-4" />
                </div>
              );

              const statusBadgeText = isRevision
                ? "Changes Requested"
                : isReview
                ? "Review Submitted Work"
                : isPayment
                ? "Approved for Payment"
                : "Work In Progress";

              const statusBadgeClass = isRevision
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                : isReview
                ? "bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300 border border-blue-200 dark:border-blue-800"
                : isPayment
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800";

              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${borderAccent}`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {iconBadge}

                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Prominent highlighted Project badge + status tag */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 shadow-2xs">
                          <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400" />
                          Project: {item.project.title}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass}`}>
                          {statusBadgeText}
                        </span>

                        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          ${item.milestone.amount.toLocaleString()} USD
                        </span>
                      </div>

                      {/* Milestone Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pt-0.5">
                        Stage 0{item.milestone.stageNumber}: {item.milestone.title}
                      </h3>

                      {/* Description with explicitly highlighted project name */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {isRevision ? (
                          <>
                            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{item.project.client.name}</strong> requested updates on project{" "}
                            <strong className="text-[#0070BA] dark:text-sky-300 font-bold underline decoration-[#0070BA]/30 underline-offset-2">
                              {item.project.title}
                            </strong>{" "}
                            before this milestone can be approved.
                          </>
                        ) : isReview ? (
                          <>
                            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{item.project.freelancer.name}</strong> submitted work for project{" "}
                            <strong className="text-[#0070BA] dark:text-sky-300 font-bold underline decoration-[#0070BA]/30 underline-offset-2">
                              {item.project.title}
                            </strong>
                            . Check requirements and approve or request changes.
                          </>
                        ) : isPayment ? (
                          <>
                            Work was approved for project{" "}
                            <strong className="text-[#0070BA] dark:text-sky-300 font-bold underline decoration-[#0070BA]/30 underline-offset-2">
                              {item.project.title}
                            </strong>
                            . Send payment to <strong className="text-slate-800 dark:text-slate-200 font-semibold">{item.project.freelancer.name}</strong> via PayPal Sandbox.
                          </>
                        ) : (
                          <>
                            Due on {item.milestone.dueDate} for project{" "}
                            <strong className="text-[#0070BA] dark:text-sky-300 font-bold underline decoration-[#0070BA]/30 underline-offset-2">
                              {item.project.title}
                            </strong>
                            . Check requirements and submit deliverables.
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="shrink-0 flex items-center gap-2 self-start sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 w-full sm:w-auto justify-end">
                    {isPayment ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleViewWorkReview}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenPayPal(item.project, item.milestone)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <PayPalIcon className="h-3.5 w-3.5" />
                          <span>Pay Now</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleViewWorkReview}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Latest updates across all projects
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] divide-y divide-slate-100 dark:divide-white/5 shadow-xs overflow-hidden">
          {recentActivities.map((act) => (
            <div key={act.id} className="p-4 sm:p-5 flex items-start gap-3.5 text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="h-2.5 w-2.5 rounded-full bg-[#0070BA] dark:bg-sky-400 mt-1 shrink-0 ring-4 ring-blue-50 dark:ring-sky-950/40" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40">
                    <FolderGit2 className="h-2.5 w-2.5 text-[#0070BA] dark:text-sky-400" />
                    Project: {act.projectTitle}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {act.timestamp}
                  </span>
                </div>

                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white font-bold">{act.actor}:</strong>{" "}
                  {act.action}
                </p>

                {act.details && (
                  <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px] italic bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                    "{act.details}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
