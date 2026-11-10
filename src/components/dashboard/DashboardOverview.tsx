"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, ActivityItem, getFriendlyStatus } from "@/lib/dashboard-data";
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
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { PayPalIcon } from "./icons";

interface DashboardOverviewProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
  onOpenSubmission: (project: ProjectContract, milestone: Milestone) => void;
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
  onOpenInvoice?: (project: ProjectContract, milestone: Milestone, transactionId?: string) => void;
  onOpenNewProject: () => void;
  onSelectProject?: (projectId: string) => void;
  onNavigateToProjects?: () => void;
}

interface EnrichedActivity extends ActivityItem {
  projectTitle: string;
  projectId: string;
}

function getActivityMeta(act: EnrichedActivity) {
  const isPayment =
    act.actorRole === "paypal" ||
    act.action.toLowerCase().includes("payment") ||
    act.action.toLowerCase().includes("paid") ||
    act.action.toLowerCase().includes("receipt");

  const isAI =
    act.actorRole === "ai_system" ||
    act.action.toLowerCase().includes("automated") ||
    act.action.toLowerCase().includes("ai assistant") ||
    act.action.toLowerCase().includes("audit");

  const isRevision =
    act.action.toLowerCase().includes("changes requested") ||
    act.action.toLowerCase().includes("requested changes") ||
    act.action.toLowerCase().includes("revision");

  const isApproval =
    !isPayment &&
    (act.action.toLowerCase().includes("approved") ||
      act.action.toLowerCase().includes("accepted"));

  const isSubmission =
    act.action.toLowerCase().includes("submitted") ||
    act.action.toLowerCase().includes("resubmitted");

  if (isPayment) {
    return {
      category: "Payment & Settlement",
      badgeColor:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
      iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
      icon: Wallet,
      type: "payment" as const,
    };
  }

  if (isAI) {
    return {
      category: "AI Work Review",
      badgeColor:
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
      iconBg: "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300",
      icon: Sparkles,
      type: "ai" as const,
    };
  }

  if (isRevision) {
    return {
      category: "Changes Requested",
      badgeColor:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
      iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
      icon: AlertCircle,
      type: "revision" as const,
    };
  }

  if (isApproval) {
    return {
      category: "Milestone Approved",
      badgeColor:
        "bg-sky-50 text-[#0070BA] border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
      iconBg: "bg-sky-100 text-[#0070BA] dark:bg-sky-950/70 dark:text-sky-400",
      icon: CheckCircle2,
      type: "approval" as const,
    };
  }

  if (isSubmission) {
    return {
      category: "Work Submitted",
      badgeColor:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
      iconBg: "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300",
      icon: ArrowUpRight,
      type: "submission" as const,
    };
  }

  return {
    category: "Project Update",
    badgeColor:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10",
    iconBg: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    icon: FolderGit2,
    type: "general" as const,
  };
}

function extractReceiptCode(text?: string): string | null {
  if (!text) return null;
  const match = text.match(/PAYID-[A-Za-z0-9\-]+/i) || text.match(/Receipt:\s*([A-Za-z0-9\-_]+)/i);
  return match ? match[1] || match[0] : null;
}

function extractMilestoneTitle(act: EnrichedActivity): string | null {
  if (act.milestoneTitle) return act.milestoneTitle;
  const match = act.action.match(/"([^"]+)"/);
  if (match) return match[1];
  const msMatch = act.action.match(/Milestone\s+\d+:\s*([^,\(]+)/i);
  if (msMatch) return msMatch[1].trim();
  return null;
}

export default function DashboardOverview({
  onOpenAudit,
  onOpenSubmission,
  onOpenPayPal,
  onOpenInvoice,
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
    type: "review" | "payment" | "submit" | "revision" | "proposal";
    title: string;
    description: string;
    actionLabel: string;
    project: ProjectContract;
    milestone?: Milestone;
  }[] = [];

  if (role === "client") {
    // 0. Incoming proposals sent by freelancer to client
    const incomingProposals = projects.filter(
      (p) => p.status === "awaiting_acceptance" && p.initiatedBy === "freelancer"
    );
    incomingProposals.forEach((project) => {
      actionsNeeded.push({
        type: "proposal",
        title: `Review incoming proposal from ${project.freelancer.name}`,
        description: `${project.freelancer.name} proposed "${project.title}" ($${project.totalBudget.toLocaleString()} USD across ${project.milestones.length} milestones). Review terms to accept or request changes.`,
        actionLabel: "Review",
        project,
      });
    });

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
    // 0. Incoming projects initiated by client awaiting freelancer acceptance
    const incomingProjects = projects.filter(
      (p) => p.status === "awaiting_acceptance" && p.initiatedBy === "client"
    );
    incomingProjects.forEach((project) => {
      actionsNeeded.push({
        type: "proposal",
        title: `Project assignment from ${project.client.name}`,
        description: `${project.client.name} created project "${project.title}" ($${project.totalBudget.toLocaleString()} USD). Review milestones and accept to begin work.`,
        actionLabel: "Review",
        project,
      });
    });

    // 0b. Proposals with changes requested
    const proposalChanges = projects.filter(
      (p) => p.status === "changes_requested" && p.initiatedBy === "freelancer"
    );
    proposalChanges.forEach((project) => {
      actionsNeeded.push({
        type: "proposal",
        title: `Changes requested on proposal "${project.title}"`,
        description: `${project.client.name} requested changes to your project proposal. Review feedback to revise and resubmit.`,
        actionLabel: "Revise",
        project,
      });
    });

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

  const [expandedActivityIds, setExpandedActivityIds] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleProjectClick = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      setActiveProjectId(projectId);
      setActiveTab("projects");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedActivityIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Combined recent activity feed across all projects
  const allActivities: EnrichedActivity[] = projects.flatMap((p) =>
    p.activityLog.map((act) => ({
      ...act,
      projectTitle: p.title,
      projectId: p.id,
    }))
  );

  const displayActivities = showAllActivities ? allActivities : allActivities.slice(0, 5);

  const areAllExpanded =
    displayActivities.length > 0 &&
    displayActivities.every((act) => !!expandedActivityIds[act.id]);

  const toggleAllExpanded = () => {
    if (areAllExpanded) {
      setExpandedActivityIds({});
    } else {
      const all: Record<string, boolean> = {};
      displayActivities.forEach((act) => {
        all[act.id] = true;
      });
      setExpandedActivityIds(all);
    }
  };

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
              const isProposal = item.type === "proposal";
              const isRevision = item.type === "revision";
              const isReview = item.type === "review";
              const isPayment = item.type === "payment";

              const handleActionClick = () => {
                setActiveProjectId(item.project.id);
                if (isProposal) {
                  setActiveTab("projects");
                } else if (item.milestone) {
                  setActiveTab("work-review");
                  onOpenAudit(item.project, item.milestone);
                } else {
                  setActiveTab("projects");
                }
              };

              // Determine border and theme styles based on action type
              const borderAccent = isProposal
                ? item.project.status === "changes_requested"
                  ? "border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-[#0D1527] dark:to-[#0D1527]"
                  : "border-l-4 border-l-[#0070BA] bg-gradient-to-r from-blue-50/40 via-white to-white dark:from-blue-950/20 dark:via-[#0D1527] dark:to-[#0D1527]"
                : isRevision
                ? "border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-[#0D1527] dark:to-[#0D1527]"
                : isReview
                ? "border-l-4 border-l-[#0070BA] bg-gradient-to-r from-blue-50/40 via-white to-white dark:from-blue-950/20 dark:via-[#0D1527] dark:to-[#0D1527]"
                : isPayment
                ? "border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-[#0D1527] dark:to-[#0D1527]"
                : "border-l-4 border-l-sky-500 bg-gradient-to-r from-sky-50/40 via-white to-white dark:from-sky-950/20 dark:via-[#0D1527] dark:to-[#0D1527]";

              const iconBadge = isProposal ? (
                <div className="p-2.5 rounded-xl bg-indigo-100 text-[#0070BA] dark:bg-indigo-950/50 dark:text-sky-400 shrink-0 shadow-2xs">
                  <FolderGit2 className="h-4 w-4" />
                </div>
              ) : isRevision ? (
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

              const statusBadgeText = isProposal
                ? item.project.status === "changes_requested"
                  ? "Changes Requested"
                  : "Mutual Agreement Pending"
                : isRevision
                ? "Changes Requested"
                : isReview
                ? "Review Submitted Work"
                : isPayment
                ? "Approved for Payment"
                : "Work In Progress";

              const statusBadgeClass = isProposal
                ? item.project.status === "changes_requested"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  : "bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300 border border-blue-200 dark:border-blue-800"
                : isRevision
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                : isReview
                ? "bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300 border border-blue-200 dark:border-blue-800"
                : isPayment
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800";

              const displayAmount = item.milestone
                ? item.milestone.amount
                : item.project.totalBudget;

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
                          ${displayAmount.toLocaleString()} USD
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pt-0.5">
                        {item.milestone
                          ? `Stage 0${item.milestone.stageNumber}: ${item.milestone.title}`
                          : item.title}
                      </h3>

                      {/* Description with explicitly highlighted project name */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {isProposal ? (
                          <span>{item.description}</span>
                        ) : isRevision ? (
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
                        ) : item.milestone ? (
                          <>
                            Due on {item.milestone.dueDate} for project{" "}
                            <strong className="text-[#0070BA] dark:text-sky-300 font-bold underline decoration-[#0070BA]/30 underline-offset-2">
                              {item.project.title}
                            </strong>
                            . Check requirements and submit deliverables.
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="shrink-0 flex items-center gap-2 self-start sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 w-full sm:w-auto justify-end">
                    {isPayment && item.milestone ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleActionClick}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenPayPal(item.project, item.milestone!)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <PayPalIcon className="h-3.5 w-3.5" />
                          <span>Pay Now</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleActionClick}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{item.actionLabel || "View"}</span>
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
      <div className="space-y-4">
        {/* Header with Title, Count, Expand All & View All controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Recent Activity
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40">
                {allActivities.length} updates logged
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Live audit ledger of milestone submissions, AI reviews, client approvals, and PayPal settlements.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={toggleAllExpanded}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0070BA] dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer shadow-2xs"
            >
              {areAllExpanded ? "Collapse All Details" : "Expand All Details"}
            </button>

            {allActivities.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:text-[#005a96] dark:hover:text-sky-300 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-sky-800/50 bg-blue-50/50 dark:bg-sky-950/40 hover:bg-blue-100/60 dark:hover:bg-sky-900/50 transition-colors cursor-pointer shadow-2xs"
              >
                {showAllActivities ? "Show Top 5" : `View All (${allActivities.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Activity Cards List */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] divide-y divide-slate-100 dark:divide-white/5 shadow-xs overflow-hidden">
          {displayActivities.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No activity logged yet.
            </div>
          ) : (
            displayActivities.map((act) => {
              const meta = getActivityMeta(act);
              const isExpanded = !!expandedActivityIds[act.id];
              const receiptCode = extractReceiptCode(act.action) || extractReceiptCode(act.details);
              const milestoneName = extractMilestoneTitle(act);
              const MetaIcon = meta.icon;

              return (
                <div
                  key={act.id}
                  className={`p-4 sm:p-5 transition-colors duration-150 ${
                    isExpanded
                      ? "bg-slate-50/70 dark:bg-white/[0.02]"
                      : "hover:bg-slate-50/50 dark:hover:bg-white/[0.015]"
                  }`}
                >
                  {/* Top Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    {/* Left: Category Icon + Content */}
                    <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                      {/* Stylized Category Icon */}
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${meta.iconBg}`}
                      >
                        <MetaIcon className="h-4 w-4" />
                      </div>

                      {/* Main Summary Content */}
                      <div className="flex-1 min-w-0">
                        {/* Tags line: Project, Category, Milestone (if any), Timestamp */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                          {/* Clickable Project Tag */}
                          <button
                            type="button"
                            onClick={() => handleProjectClick(act.projectId)}
                            title={`Open ${act.projectTitle} workspace`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 hover:bg-[#0070BA]/20 transition-colors cursor-pointer"
                          >
                            <FolderGit2 className="h-2.5 w-2.5 text-[#0070BA] dark:text-sky-400" />
                            <span className="truncate max-w-[220px]">Project: {act.projectTitle}</span>
                          </button>

                          {/* Category Tag */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeColor}`}
                          >
                            {meta.category}
                          </span>

                          {/* Target Milestone Pill if available */}
                          {milestoneName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 truncate max-w-[240px]">
                              Milestone: {milestoneName}
                            </span>
                          )}

                          {/* Timestamp */}
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 ml-auto sm:ml-0">
                            <Clock className="h-2.5 w-2.5" />
                            {act.timestamp}
                          </span>
                        </div>

                        {/* Event Message */}
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          <strong className="text-slate-900 dark:text-white font-bold">{act.actor}:</strong>{" "}
                          <span>{act.action}</span>
                        </p>

                        {/* Collapsed Details Snippet (if unexpanded and has details) */}
                        {!isExpanded && act.details && (
                          <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px] italic truncate">
                            "{act.details}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Expand Details Button */}
                    <div className="shrink-0 flex items-center gap-2 self-start sm:self-center pl-12 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => toggleExpand(act.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          isExpanded
                            ? "bg-[#0070BA] text-white hover:bg-[#005a96]"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 border border-slate-200/80 dark:border-white/10"
                        }`}
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? "Hide Details" : "Expand Details"}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Sub-Panel */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200/70 dark:border-white/10 sm:ml-12.5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      {/* Context Banner: Verified Receipt */}
                      {receiptCode && (
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8.5 w-8.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
                              <Receipt className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                                  PayPal Sandbox Transaction Receipt
                                </span>
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-200/60 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200 px-1.5 py-0.2 rounded-full">
                                  <ShieldCheck className="h-2.5 w-2.5" />
                                  100% Settled
                                </span>
                              </div>
                              <p className="font-mono font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">
                                {receiptCode}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                const project = projects.find((p) => p.id === act.projectId) || projects[0];
                                const milestone =
                                  project?.milestones.find((m) => m.title === milestoneName) ||
                                  project?.milestones[0];
                                if (onOpenInvoice && project && milestone) {
                                  onOpenInvoice(project, milestone, receiptCode);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-2xs cursor-pointer"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>AI Invoice & Receipt</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(receiptCode, `receipt_${act.id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#0D1527] border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shadow-2xs cursor-pointer"
                            >
                              {copiedKey === `receipt_${act.id}` ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Copy ID</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Context Banner: AI Work Review */}
                      {meta.type === "ai" && (
                        <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 flex items-start gap-3 shadow-2xs">
                          <div className="h-8.5 w-8.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="text-xs">
                            <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
                              Automated Acceptance Review
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5 leading-relaxed">
                              Milestone deliverables were inspected against contract requirements by the AI assistant. Both parties can review the checklist before final approval.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Context Banner: Changes Requested */}
                      {meta.type === "revision" && (
                        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 shadow-2xs">
                          <div className="h-8.5 w-8.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div className="text-xs flex-1">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                              Client Revision Feedback
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 italic mt-1 font-medium leading-relaxed bg-white/70 dark:bg-black/20 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/40">
                              "{act.details || "Modifications requested before milestone funds can be released."}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Generic Details (when not revision and exists) */}
                      {act.details && meta.type !== "revision" && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                            Activity Notes & Record
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                            "{act.details}"
                          </p>
                        </div>
                      )}

                      {/* Structured 4-Column Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                          <span className="text-[10px] text-slate-400 block font-medium">Logged Actor</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                            {act.actor}
                          </span>
                          <span className="text-[10px] text-slate-500 capitalize">
                            Role: {act.actorRole === "ai_system" ? "AI Agent" : act.actorRole}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                          <span className="text-[10px] text-slate-400 block font-medium">Associated Project</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                            {act.projectTitle}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Milestone Contract
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                          <span className="text-[10px] text-slate-400 block font-medium">Target Milestone</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                            {milestoneName || "General Stage"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Deliverable Scope
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                          <span className="text-[10px] text-slate-400 block font-medium">Recorded Date & Time</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                            {act.timestamp}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Verified Ledger
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <span className="text-[11px] text-slate-400">
                          Log Identifier: <code className="font-mono text-[10px] text-slate-500">{act.id}</code>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleProjectClick(act.projectId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[#0070BA] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <span>Open in Project Workspace</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
