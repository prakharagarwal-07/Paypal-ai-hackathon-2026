"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  ExternalLink,
  Video,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  FolderGit2,
} from "lucide-react";
import { Milestone, ProjectContract, getFriendlyCriterionStatus } from "@/lib/dashboard-data";
import { GitHubIcon, PayPalIcon } from "./icons";
import { useDashboard } from "@/lib/dashboard-store";

interface AuditModalProps {
  project: ProjectContract;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onOpenRevisionModal?: () => void;
  onOpenPayPalModal?: () => void;
  onOpenSubmissionModal?: () => void;
}

export default function AuditModal({
  project,
  milestone,
  isOpen,
  onClose,
  onOpenRevisionModal,
  onOpenPayPalModal,
  onOpenSubmissionModal,
}: AuditModalProps) {
  const { role, approveMilestone } = useDashboard();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const latestSubmission = milestone.submissions[milestone.submissions.length - 1];
  const audit = milestone.latestAudit || latestSubmission?.aiAssessment;
  const criteria = audit?.criteria || milestone.acceptanceCriteria;

  const metCount = criteria.filter((c) => c.status === "met" || c.status === "satisfied").length;
  const missingCount = criteria.filter((c) => c.status === "missing").length;
  const reviewCount = criteria.filter(
    (c) => c.status === "needs_manual_review" || c.status === "needs_verification"
  ).length;

  const copyShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#0070BA] dark:text-sky-400">
                Work Review & AI Assistance
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Stage 0{milestone.stageNumber}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {milestone.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 shadow-2xs">
                <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400" />
                Project: {project.title}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Summary Box */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                Review Summary
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {metCount} of {criteria.length} requirements met
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {audit?.summary ||
                "Submitted deliverables have been checked against the milestone requirements agreed in the project contract."}
            </p>
          </div>

          {/* Submitted Links & Work */}
          {latestSubmission && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                Submitted Work:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {latestSubmission.demoUrl && (
                  <a
                    href={latestSubmission.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#0070BA] transition-colors"
                  >
                    <span className="font-semibold truncate">Website / Demo Link</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </a>
                )}
                {latestSubmission.githubRepo && (
                  <a
                    href={latestSubmission.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#0070BA] transition-colors"
                  >
                    <span className="font-semibold truncate">Code Repository</span>
                    <GitHubIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  </a>
                )}
                {latestSubmission.loomVideo && (
                  <a
                    href={latestSubmission.loomVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-purple-400 transition-colors"
                  >
                    <span className="font-semibold truncate">Video Walkthrough</span>
                    <Video className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  </a>
                )}
              </div>
              {latestSubmission.notes && (
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Freelancer Notes: </strong>
                  {latestSubmission.notes}
                </p>
              )}
            </div>
          )}

          {/* Requirements Checklist */}
          <div className="space-y-2.5 pt-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              Requirements Checklist ({criteria.length})
            </span>

            <div className="space-y-2">
              {criteria.map((crit) => {
                const statusInfo = getFriendlyCriterionStatus(crit.status);

                return (
                  <div
                    key={crit.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {statusInfo.label === "Met" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : statusInfo.label === "Missing" ? (
                          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {crit.title}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 pl-6 text-[11px] leading-relaxed">
                      {crit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Payment: <strong className="text-slate-900 dark:text-white font-mono">${milestone.amount.toLocaleString()} USD</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {role === "client" ? (
              <>
                {(milestone.status === "submitted" ||
                  milestone.status === "awaiting_client_approval") && (
                  <>
                    {onOpenRevisionModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenRevisionModal();
                        }}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Request Changes
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        approveMilestone(project.id, milestone.id);
                        onClose();
                        if (onOpenPayPalModal) {
                          onOpenPayPalModal();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Milestone</span>
                    </button>
                  </>
                )}

                {(milestone.status === "approved" ||
                  milestone.status === "payment_pending") &&
                  onOpenPayPalModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPayPalModal();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <PayPalIcon className="h-4 w-4" />
                      <span>Pay ${milestone.amount.toLocaleString()} with PayPal Sandbox</span>
                    </button>
                  )}
              </>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 font-bold text-slate-800 dark:text-white cursor-pointer"
                >
                  Close
                </button>
                {onOpenSubmissionModal &&
                  (milestone.status === "changes_requested" ||
                    milestone.status === "revision_requested" ||
                    milestone.status === "in_progress") && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSubmissionModal();
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      {milestone.status === "in_progress"
                        ? "Submit Deliverables"
                        : "Update & Resubmit Work"}
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
