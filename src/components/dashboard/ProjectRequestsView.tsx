"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { ProjectContract, getFriendlyProjectStatus } from "@/lib/dashboard-data";
import {
  Send,
  Inbox,
  Plus,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Trash2,
} from "lucide-react";
import ProposalReviewModal from "./ProposalReviewModal";
import ShareInvitationModal from "./ShareInvitationModal";

interface ProjectRequestsViewProps {
  onOpenNewProject: () => void;
  onOpenRevision: (project: ProjectContract) => void;
  onSelectProject: (projectId: string) => void;
}

export default function ProjectRequestsView({
  onOpenNewProject,
  onOpenRevision,
  onSelectProject,
}: ProjectRequestsViewProps) {
  const { role, projects, searchQuery, revokeInvitation, showConfirm, authUser, isDemoMode } = useDashboard();

  const [activeTab, setActiveTab] = useState<"incoming" | "sent">("incoming");
  const [selectedReviewProject, setSelectedReviewProject] = useState<ProjectContract | null>(null);
  const [selectedShareProject, setSelectedShareProject] = useState<ProjectContract | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const myId = authUser?.id;
  const myEmail = authUser?.email?.trim().toLowerCase();

  // Incoming Requests: Strict recipient authorization
  // For Client role: proposals where client_id = authUser.id AND initiated_by = 'freelancer'
  // For Freelancer role: requests where freelancer_id = authUser.id AND initiated_by = 'client'
  const incomingRequests = projects.filter((p) => {
    const isProposalStatus =
      p.status === "awaiting_acceptance" ||
      p.status === "changes_requested" ||
      p.status === "rejected";
    if (!isProposalStatus) return false;

    // Disregard invalid self-assigned proposals
    if (p.clientId && p.freelancerId && p.clientId === p.freelancerId) return false;

    if (isDemoMode) {
      return role === "client" ? p.initiatedBy === "freelancer" : p.initiatedBy === "client";
    }

    if (role === "client") {
      const isTargetClient =
        (myId && (p.clientId === myId || p.client?.id === myId)) ||
        (myEmail && p.client?.email?.trim().toLowerCase() === myEmail);
      return Boolean(isTargetClient && p.initiatedBy === "freelancer");
    } else {
      const isTargetFreelancer =
        (myId && (p.freelancerId === myId || p.freelancer?.id === myId)) ||
        (myEmail && p.freelancer?.email?.trim().toLowerCase() === myEmail);
      return Boolean(isTargetFreelancer && p.initiatedBy === "client");
    }
  });

  // Sent Proposals: Strict proposer authorization
  // For Client role: requests where client_id = authUser.id AND initiated_by = 'client'
  // For Freelancer role: proposals where freelancer_id = authUser.id AND initiated_by = 'freelancer'
  const sentProposals = projects.filter((p) => {
    const isProposalOrRecent =
      p.status === "awaiting_acceptance" ||
      p.status === "changes_requested" ||
      p.status === "draft" ||
      p.status === "rejected" ||
      p.status === "accepted" ||
      (p.status === "active" && p.proposalStatus === "accepted");
    if (!isProposalOrRecent) return false;

    if (isDemoMode) {
      return role === "client" ? p.initiatedBy === "client" : p.initiatedBy === "freelancer";
    }

    if (role === "client") {
      const isProposerClient =
        (myId && (p.clientId === myId || p.client?.id === myId)) ||
        (myEmail && p.client?.email?.trim().toLowerCase() === myEmail);
      return Boolean(isProposerClient && p.initiatedBy === "client");
    } else {
      const isProposerFreelancer =
        (myId && (p.freelancerId === myId || p.freelancer?.id === myId)) ||
        (myEmail && p.freelancer?.email?.trim().toLowerCase() === myEmail);
      return Boolean(isProposerFreelancer && p.initiatedBy === "freelancer");
    }
  });

  const incomingActionCount = incomingRequests.filter((p) => p.status === "awaiting_acceptance").length;

  const handleCopyLink = (project: ProjectContract) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const inviteUrl = `${origin}/invite/${project.invitationToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(project.invitationToken || "token");
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRevoke = (project: ProjectContract) => {
    showConfirm({
      title: "Revoke Proposal Invitation Link?",
      message: `Are you sure you want to revoke the invitation link for "${project.title}"? Anyone with the link will no longer be able to review or accept this proposal.`,
      confirmText: "Yes, Revoke Link",
      cancelText: "Keep Active",
      isDestructive: true,
      onConfirm: () => revokeInvitation(project.id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Project Requests
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review incoming milestone proposals and manage invitation links sent to counterparties.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{role === "client" ? "Create Project" : "Propose Project"}</span>
        </button>
      </div>

      {/* Tabs Switcher: Incoming vs Sent */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("incoming")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "incoming"
              ? "bg-[#0070BA] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Inbox className="h-3.5 w-3.5" />
          <span>Incoming Requests</span>
          {incomingActionCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
              {incomingActionCount} new
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sent")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "sent"
              ? "bg-[#0070BA] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          <span>Sent Proposals</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-white/10">
            {sentProposals.length}
          </span>
        </button>
      </div>

      {/* TAB 1: INCOMING REQUESTS */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-3 bg-white dark:bg-[#0D1527]">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0070BA] dark:text-sky-400 flex items-center justify-center mx-auto">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                No Incoming Project Requests
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                When a client or freelancer initiates a project proposal with your MilestoneOS ID, or when you open an invitation link, it will appear here for review and acceptance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((project) => {
                const statusInfo = getFriendlyProjectStatus(project.status, project.initiatedBy, role);
                const senderName =
                  project.initiatedBy === "client" ? project.client.name : project.freelancer.name;
                const senderId =
                  project.initiatorMilestoneOSId ||
                  (project.initiatedBy === "client"
                    ? project.client.milestoneOSId
                    : project.freelancer.milestoneOSId);

                return (
                  <div
                    key={project.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow text-left"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Date: {project.createdAt}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {project.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            From: <strong className="text-slate-800 dark:text-slate-200">{senderName}</strong>
                            {senderId && (
                              <span className="font-mono text-slate-400 ml-1.5">({senderId})</span>
                            )}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Budget</span>
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            ${project.totalBudget.toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Deadline: {project.targetDeadline}</span>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {project.milestones.length} Milestones
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedReviewProject(project)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        <span>Review Proposal</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SENT PROPOSALS */}
      {activeTab === "sent" && (
        <div className="space-y-4">
          {sentProposals.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-3 bg-white dark:bg-[#0D1527]">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0070BA] dark:text-sky-400 flex items-center justify-center mx-auto">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                No Sent Proposals Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                You can create a project proposal for a specific person using their MilestoneOS ID, or generate a private invitation link to share via WhatsApp, email, or message.
              </p>
              <button
                type="button"
                onClick={onOpenNewProject}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{role === "client" ? "Create Project Proposal" : "Propose Project"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sentProposals.map((project) => {
                const statusInfo = getFriendlyProjectStatus(project.status, project.initiatedBy, role);
                const recipientName =
                  project.isPublicInvitation && !project.acceptedAt
                    ? "Shareable Invitation Link (Unassigned)"
                    : role === "client"
                    ? project.freelancer.name
                    : project.client.name;

                const isShareable = project.isPublicInvitation && project.invitationToken;
                const isRevoked = project.invitationStatus === "revoked";

                return (
                  <div
                    key={project.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow text-left"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Sent: {project.createdAt}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {project.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Recipient: <strong className="text-slate-800 dark:text-slate-200">{recipientName}</strong>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Budget</span>
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            ${project.totalBudget.toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {project.description}
                      </p>

                      {/* If Changes Requested notice */}
                      {project.status === "changes_requested" && project.proposalFeedback && (
                        <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300">
                          <strong>Counterparty feedback: </strong>
                          "{project.proposalFeedback}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Deadline: {project.targetDeadline}</span>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {project.milestones.length} Milestones
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        {isShareable && !isRevoked && project.status === "awaiting_acceptance" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(project)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedToken === project.invitationToken ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-500" />
                                  <span className="text-emerald-600">Copied Link!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedShareProject(project)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0070BA] dark:text-sky-300 hover:bg-blue-100 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Share2 className="h-3 w-3" />
                              <span>Share Link</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRevoke(project)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                              title="Revoke invitation link"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {project.status === "changes_requested" ? (
                          <button
                            type="button"
                            onClick={() => onOpenRevision(project)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            Revise Proposal
                          </button>
                        ) : project.status === "accepted" || project.status === "active" ? (
                          <button
                            type="button"
                            onClick={() => onSelectProject(project.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors"
                          >
                            Open Workspace
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedReviewProject(project)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Proposal Details Modal */}
      <ProposalReviewModal
        project={selectedReviewProject}
        isOpen={Boolean(selectedReviewProject)}
        onClose={() => setSelectedReviewProject(null)}
        onOpenRevision={(proj) => {
          setSelectedReviewProject(null);
          onOpenRevision(proj);
        }}
      />

      {/* Share Proposal Link Modal */}
      <ShareInvitationModal
        project={selectedShareProject}
        isOpen={Boolean(selectedShareProject)}
        onClose={() => setSelectedShareProject(null)}
      />
    </div>
  );
}
