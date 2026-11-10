"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, ActivityItem, getFriendlyStatus, isProjectCompleted } from "@/lib/dashboard-data";
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
  FileText,
  Layers,
  DollarSign,
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
  onReviewProposal?: (project: ProjectContract) => void;
  onOpenRevision?: (project: ProjectContract) => void;
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

  const isProposal =
    act.action.toLowerCase().includes("proposal") ||
    act.action.toLowerCase().includes("proposed") ||
    act.action.toLowerCase().includes("invitation link");

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

  if (isProposal) {
    return {
      category: "Project Proposal",
      badgeColor:
        "bg-indigo-50 text-[#0070BA] border-indigo-200 dark:bg-indigo-950/60 dark:text-sky-300 dark:border-indigo-800",
      iconBg: "bg-indigo-100 text-[#0070BA] dark:bg-indigo-950/80 dark:text-sky-400",
      icon: FileText,
      type: "proposal" as const,
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
  onReviewProposal,
  onOpenRevision,
}: DashboardOverviewProps) {
  const {
    projects,
    role,
    setActiveProjectId,
    setActiveTab,
  } = useDashboard();

  // Clean metrics calculations
  const totalProjects = projects.filter((p) => p.status === "active" && !isProjectCompleted(p)).length;
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

  // Dedicated proposals requiring user action
  const incomingProposals = projects.filter((p) => {
    if (p.status !== "awaiting_acceptance") return false;
    return role === "client" ? p.initiatedBy === "freelancer" : p.initiatedBy === "client";
  });

  const changesRequestedProposals = projects.filter((p) => {
    return p.status === "changes_requested" && p.initiatedBy === role;
  });

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
    incomingProposals.forEach((project) => {
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

      {/* Brand New User Clean Workspace State */}
      {projects.length === 0 && (
        <div className="p-8 sm:p-10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0D1527]/70 backdrop-blur-md text-center space-y-4">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-50 dark:bg-sky-950/40 text-[#0070BA] dark:text-sky-300 flex items-center justify-center font-bold">
            <FolderGit2 className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {role === "client" ? "No client projects yet" : "No active freelance projects yet"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {role === "client"
                ? "Create your first project to define custom milestone acceptance criteria, invite a freelancer, and fund escrow with PayPal Sandbox."
                : "Accept a client invitation link or share your permanent MilestoneOS ID with a client to receive milestone proposals."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{role === "client" ? "Create First Project" : "Propose a Project"}</span>
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED STANDOUT SECTION: INCOMING PROJECT PROPOSALS & REQUESTS */}
      {(incomingProposals.length > 0 || changesRequestedProposals.length > 0) && (
        <section aria-label="Incoming Project Proposals" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0070BA] dark:bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0070BA] dark:bg-sky-500 shadow-sm" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Incoming Project Proposals</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#0070BA] text-white shadow-2xs">
                  {incomingProposals.length + changesRequestedProposals.length} Action Required
                </span>
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("project-requests")}
              className="text-xs font-bold text-[#0070BA] dark:text-sky-400 hover:text-[#005a96] dark:hover:text-sky-300 flex items-center gap-1.5 cursor-pointer group transition-colors"
            >
              <span>Manage in Project Requests Hub</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {incomingProposals.map((proj) => {
              const proposer = proj.initiatedBy === "client" ? proj.client : proj.freelancer;
              const proposerRoleLabel = proj.initiatedBy === "client" ? "Client" : "Freelancer";

              return (
                <div
                  key={proj.id}
                  className="relative overflow-hidden rounded-3xl border-2 border-[#0070BA] dark:border-sky-500/80 bg-gradient-to-br from-blue-50/95 via-sky-50/40 to-white dark:from-[#0B1528] dark:via-[#0D1527] dark:to-[#08101F] p-5 sm:p-6 shadow-xl shadow-blue-500/10 transition-all hover:shadow-2xl hover:border-sky-500"
                >
                  {/* Subtle decorative glow */}
                  <div className="absolute top-0 right-0 -mt-12 -mr-12 h-44 w-44 rounded-full bg-[#0070BA]/15 dark:bg-sky-500/15 blur-3xl pointer-events-none" />

                  {/* Header Row: Proposer & Status Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pb-4 border-b border-blue-200/60 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-[#0070BA] text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
                        {proposer.avatar || proposer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {proposer.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0070BA]/15 text-[#0070BA] dark:bg-sky-950/70 dark:text-sky-300 border border-[#0070BA]/25 dark:border-sky-800/50">
                            {proposerRoleLabel}
                          </span>
                        </div>
                        {proposer.milestoneOSId && (
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            MilestoneOS ID: <strong className="text-slate-800 dark:text-slate-200">{proposer.milestoneOSId}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0070BA] text-white shadow-2xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                        <span>Awaiting Your Acceptance</span>
                      </span>
                    </div>
                  </div>

                  {/* Body: Title, Description, and Key Contract Terms */}
                  <div className="py-4 space-y-3 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                          {proj.category || "General Project"}
                        </span>
                        <span>•</span>
                        <span>Proposed {proj.createdAt}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        {proj.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {proj.description}
                      </p>
                    </div>

                    {/* Financial & Milestone Badges */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs shadow-2xs">
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-slate-500 dark:text-slate-400">Total Proposed Budget:</span>
                        <span className="font-mono font-black text-slate-900 dark:text-white text-sm text-emerald-600 dark:text-emerald-400">
                          ${proj.totalBudget.toLocaleString()} {proj.currency}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs shadow-2xs">
                        <Layers className="h-4 w-4 text-[#0070BA] dark:text-sky-400" />
                        <span className="text-slate-500 dark:text-slate-400">Milestones:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {proj.milestones.length} Stages with criteria
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs shadow-2xs">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-500 dark:text-slate-400">Target Delivery:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {proj.targetDeadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Row: Security Notice & Primary Action Button */}
                  <div className="pt-4 border-t border-blue-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                      <ShieldCheck className="h-4 w-4 text-[#0070BA] dark:text-sky-400 shrink-0" />
                      <span>Review milestone criteria before accepting. Funds remain safe until milestones are approved.</span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (onReviewProposal) {
                            onReviewProposal(proj);
                          } else {
                            setActiveProjectId(proj.id);
                            setActiveTab("project-requests");
                          }
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold transition-all shadow-md shadow-blue-600/25 hover:shadow-lg cursor-pointer"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Review & Accept Proposal</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Changes Requested Proposals (if user sent proposal and got feedback) */}
            {changesRequestedProposals.map((proj) => (
              <div
                key={proj.id}
                className="relative overflow-hidden rounded-3xl border-2 border-amber-400 dark:border-amber-500/80 bg-gradient-to-br from-amber-50/95 via-orange-50/30 to-white dark:from-[#211608] dark:via-[#0D1527] dark:to-[#0A1020] p-5 sm:p-6 shadow-xl shadow-amber-500/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                      <AlertCircle className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Feedback on Proposal: {proj.title}
                      </h4>
                      <span className="text-xs text-amber-700 dark:text-amber-300">
                        The counterparty requested adjustments to the proposal scope or budget.
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-2xs self-start sm:self-auto">
                    <span>Changes Requested</span>
                  </span>
                </div>

                {proj.proposalFeedback && (
                  <div className="my-3 p-3 rounded-xl bg-white/80 dark:bg-white/5 border border-amber-200/80 dark:border-white/10 text-xs italic text-slate-700 dark:text-slate-300">
                    "{proj.proposalFeedback}"
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenRevision) {
                        onOpenRevision(proj);
                      } else {
                        setActiveProjectId(proj.id);
                        setActiveTab("project-requests");
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer"
                  >
                    <span>Revise & Resubmit Proposal</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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

              // Strip receipt or transaction codes from the main headline notification
              const cleanAction = act.action
                .replace(/\s*\([^)]*(?:receipt|payid|transaction)[^)]*\)/gi, "")
                .replace(/\s*\(Receipt:?\s*[^)]+\)/gi, "")
                .replace(/\s*\(PAYID-[A-Za-z0-9\-_–—]+\)/gi, "")
                .trim();

              const isProposalActivity = meta.type === "proposal";

              return (
                <div
                  key={act.id}
                  className={`p-4 transition-colors duration-150 ${
                    isProposalActivity
                      ? "border-l-4 border-l-[#0070BA] bg-blue-50/40 dark:bg-sky-950/25 shadow-2xs"
                      : isExpanded
                      ? "bg-slate-50/50 dark:bg-white/[0.015]"
                      : "hover:bg-slate-50/40 dark:hover:bg-white/[0.01]"
                  }`}
                >
                  {/* Clean, Linear Header Row */}
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    {/* Left: Minimal Icon & Summary */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${meta.iconBg}`}
                      >
                        <MetaIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        {/* Event Message */}
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                          <strong className="text-slate-900 dark:text-white font-semibold">
                            {act.actor}:
                          </strong>{" "}
                          <span>{cleanAction}</span>
                        </p>

                        {/* Quiet Subtitle Metadata (Inline, no clutter) */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <button
                            type="button"
                            onClick={() => handleProjectClick(act.projectId)}
                            className="font-medium text-[#0070BA] dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            Project: {act.projectTitle}
                          </button>
                          <span>•</span>
                          <span>{act.timestamp}</span>
                          <span>•</span>
                          <span className="capitalize">{meta.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Clean Details & Proposal Action */}
                    <div className="shrink-0 flex items-center gap-2 pt-0.5">
                      {isProposalActivity && (
                        <button
                          type="button"
                          onClick={() => {
                            const p = projects.find((proj) => proj.id === act.projectId);
                            if (p && onReviewProposal) {
                              onReviewProposal(p);
                            } else {
                              setActiveTab("project-requests");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Review Proposal</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpand(act.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isExpanded
                            ? "bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-white"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                        }`}
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? "Hide" : "Details"}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Clean, Untidy-Free Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 ml-11 space-y-2.5 text-xs animate-in fade-in duration-150">
                      {/* PayPal Receipt & Action Row */}
                      {receiptCode && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                              Receipt:
                            </span>
                            <span className="font-mono font-semibold text-slate-900 dark:text-white text-xs">
                              {receiptCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(receiptCode, `receipt_${act.id}`)}
                              className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-white ml-1 cursor-pointer"
                              title="Copy transaction ID"
                            >
                              {copiedKey === `receipt_${act.id}` ? (
                                <span className="text-emerald-600 font-medium">Copied</span>
                              ) : (
                                <span>Copy</span>
                              )}
                            </button>
                          </div>

                          {onOpenInvoice && (
                            <button
                              type="button"
                              onClick={() => {
                                const project =
                                  projects.find((p) => p.id === act.projectId) || projects[0];
                                const milestone =
                                  project?.milestones.find((m) => m.title === milestoneName) ||
                                  project?.milestones[0];
                                if (project && milestone) {
                                  onOpenInvoice(project, milestone, receiptCode);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:bg-[#0070BA]/10 transition-colors cursor-pointer"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>View AI Invoice</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Notes / Details statement */}
                      {act.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                          "{act.details}"
                        </p>
                      )}

                      {/* Subtle Footer with quick workspace link */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>
                          {milestoneName ? `Target Milestone: ${milestoneName}` : `Event ID: ${act.id}`}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleProjectClick(act.projectId)}
                          className="font-medium text-[#0070BA] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Workspace</span>
                          <ArrowRight className="h-3 w-3" />
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
