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
        actionLabel: "Review Work",
        project,
        milestone,
      });
    });

    // 2. Milestones approved and ready for payment
    paymentsDue.forEach(({ project, milestone }) => {
      actionsNeeded.push({
        type: "payment",
        title: `Payment ready: $${milestone.amount.toLocaleString()} USD for "${milestone.title}"`,
        description: `Work was approved. Send payment to ${project.freelancer.name} with PayPal.`,
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
        actionLabel: "Update & Resubmit",
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
        actionLabel: "Submit Work",
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
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Actions Needed ({actionsNeeded.length})
          </h2>

          <div className="space-y-2.5">
            {actionsNeeded.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>

                <div className="shrink-0">
                  {item.type === "review" && (
                    <button
                      type="button"
                      onClick={() => onOpenAudit(item.project, item.milestone)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors"
                    >
                      {item.actionLabel}
                    </button>
                  )}

                  {item.type === "payment" && (
                    <button
                      type="button"
                      onClick={() => onOpenPayPal(item.project, item.milestone)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <PayPalIcon className="h-3.5 w-3.5" />
                      <span>{item.actionLabel}</span>
                    </button>
                  )}

                  {(item.type === "submit" || item.type === "revision") && (
                    <button
                      type="button"
                      onClick={() => onOpenSubmission(item.project, item.milestone)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Recent Activity */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Recent Activity
        </h2>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] divide-y divide-slate-100 dark:divide-white/5">
          {recentActivities.map((act) => (
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
