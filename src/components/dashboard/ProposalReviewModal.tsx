"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  User,
  ShieldCheck,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { ProjectContract, getFriendlyProjectStatus } from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";

interface ProposalReviewModalProps {
  project: ProjectContract | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRevision?: (project: ProjectContract) => void;
}

export default function ProposalReviewModal({
  project,
  isOpen,
  onClose,
  onOpenRevision,
}: ProposalReviewModalProps) {
  const { role, userProfiles, acceptProposal, requestProposalChanges, rejectProposal, showConfirm } =
    useDashboard();

  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const isSender = role === project.initiatedBy;
  const senderName = project.initiatedBy === "client" ? project.client.name : project.freelancer.name;
  const senderRole = project.initiatedBy === "client" ? "Client" : "Freelancer";
  const senderOrgOrTitle =
    project.initiatedBy === "client" ? project.client.company : project.freelancer.title;
  const senderId =
    project.initiatorMilestoneOSId ||
    (project.initiatedBy === "client" ? project.client.milestoneOSId : project.freelancer.milestoneOSId);

  const statusInfo = getFriendlyProjectStatus(project.status, project.initiatedBy, role);

  const handleConfirmAccept = () => {
    acceptProposal(project.id);
    onClose();
  };

  const handleSubmitChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || feedbackText.trim().length < 5) {
      setFeedbackError("Please provide specific feedback explaining what changes are needed.");
      return;
    }
    requestProposalChanges(project.id, feedbackText.trim());
    setIsRequestingChanges(false);
    setFeedbackText("");
    onClose();
  };

  const handleDecline = () => {
    showConfirm({
      title: "Decline Project Proposal?",
      message: `Are you sure you want to decline the proposal for "${project.title}"? This will record the proposal as rejected.`,
      confirmText: "Yes, Decline Proposal",
      cancelText: "Keep Proposal",
      isDestructive: true,
      onConfirm: () => {
        rejectProposal(project.id, "Proposal declined by counterparty.");
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col transition-all">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.badgeClass}`}>
                {statusInfo.label}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Proposed: {project.createdAt}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Sender Overview Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-sky-50/40 dark:from-blue-950/30 dark:to-sky-950/20 border border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0070BA] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {project.initiatedBy === "client" ? project.client.avatar : project.freelancer.avatar}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0070BA] dark:text-sky-400 tracking-wider block">
                  Proposal Proposer ({senderRole})
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  {senderName}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {senderOrgOrTitle} • ID:{" "}
                  <strong className="font-mono text-slate-800 dark:text-sky-300">{senderId || "MSO-VERIFIED"}</strong>
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Budget</span>
              <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                ${project.totalBudget.toLocaleString()} USD
              </span>
            </div>
          </div>

          {/* Requested Changes Banner (if any) */}
          {project.status === "changes_requested" && project.proposalFeedback && (
            <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/20 space-y-1">
              <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5 text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                Requested Changes & Feedback:
              </span>
              <p className="text-[11px] text-rose-800 dark:text-rose-300 pl-5 leading-relaxed">
                "{project.proposalFeedback}"
              </p>
            </div>
          )}

          {/* Project Scope Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Project Scope & Objective
            </label>
            <p className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              {project.description}
            </p>
          </div>

          {/* Milestones & Acceptance Criteria List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Agreed Milestones ({project.milestones.length})
              </label>
              <span className="text-[11px] text-slate-500">
                Target Deadline: <strong>{project.targetDeadline}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {project.milestones.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      Stage 0{m.stageNumber}: {m.title}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      ${m.amount.toLocaleString()} USD
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {m.description}
                  </p>

                  {/* Criteria Checklist */}
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Acceptance Criteria:
                    </span>
                    {m.acceptanceCriteria.map((c, cIdx) => (
                      <div
                        key={c.id || cIdx}
                        className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg"
                      >
                        <span className="text-[#0070BA] font-bold">•</span>
                        <span>{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Changes Sub-Form */}
          {isRequestingChanges && (
            <form onSubmit={handleSubmitChanges} className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20 space-y-3">
              <div>
                <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                  What adjustments are needed before you can accept this proposal? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackText}
                  onChange={(e) => {
                    setFeedbackText(e.target.value);
                    if (feedbackError) setFeedbackError(null);
                  }}
                  placeholder="Explain requested budget changes, milestone split adjustments, or scope clarifications..."
                  className="w-full rounded-xl border border-amber-300 bg-white dark:bg-[#131C31] dark:border-amber-700/60 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                {feedbackError && (
                  <p className="mt-1 text-[11px] text-rose-600 font-semibold">{feedbackError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestingChanges(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Send className="h-3 w-3" />
                  <span>Send Feedback to Proposer</span>
                </button>
              </div>
            </form>
          )}

          {/* Mutual Agreement Notice */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0070BA] shrink-0 mt-0.5" />
            <p>
              Work and escrow payments begin only after this proposal is mutually accepted. Accepted milestone requirements cannot be silently modified later.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* If sender viewing changes requested: can revise */}
            {isSender && project.status === "changes_requested" && onOpenRevision && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRevision(project);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Revise & Resubmit Proposal
              </button>
            )}

            {/* If recipient: 3 clear actions (Accept, Request Changes, Reject) */}
            {!isSender && project.status === "awaiting_acceptance" && (
              <>
                <button
                  type="button"
                  onClick={handleDecline}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                >
                  Decline Proposal
                </button>

                {!isRequestingChanges && (
                  <button
                    type="button"
                    onClick={() => setIsRequestingChanges(true)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/20 cursor-pointer transition-colors shadow-2xs"
                  >
                    Request Changes
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirmAccept}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Accept & Activate Contract</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
