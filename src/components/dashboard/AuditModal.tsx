"use client";

import { useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Video,
  FileCode,
  Sparkles,
  RefreshCw,
  Wallet,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import { GitHubIcon, PayPalIcon } from "./icons";
import { useDashboard } from "@/lib/dashboard-store";

interface AuditModalProps {
  project: ProjectContract;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onOpenRevisionModal?: () => void;
  onOpenPayPalModal?: () => void;
}

export default function AuditModal({
  project,
  milestone,
  isOpen,
  onClose,
  onOpenRevisionModal,
  onOpenPayPalModal,
}: AuditModalProps) {
  const { role, approveMilestone } = useDashboard();
  const [filter, setFilter] = useState<"all" | "satisfied" | "missing" | "needs_verification">("all");
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const latestSubmission = milestone.submissions[milestone.submissions.length - 1];
  const audit = milestone.latestAudit || latestSubmission?.aiAssessment;

  const copyShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const criteria = audit?.criteria || milestone.acceptanceCriteria;
  const filteredCriteria = criteria.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const satisfiedCount = criteria.filter((c) => c.status === "satisfied").length;
  const missingCount = criteria.filter((c) => c.status === "missing").length;
  const needsVerificationCount = criteria.filter((c) => c.status === "needs_verification").length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col transition-all">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-400/10 dark:text-sky-300">
                <Sparkles className="h-3 w-3" />
                Gemini 2.5 Flash Work-Assessment Report
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Stage 0{milestone.stageNumber} • Version {milestone.submissions.length || 1}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {milestone.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={copyShareLink}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 cursor-pointer transition-colors"
              title="Copy share link"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Demonstration Notice */}
          <div className="p-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">DEMONSTRATION ASSESSMENT (SIMULATED GEMINI 2.5 FLASH EVALUATION)</span>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                This report demonstrates how MilestoneOS uses Gemini to audit code repositories, live staging URLs, and acceptance criteria before escrow funds are released. Real API connection can be activated in production.
              </p>
            </div>
          </div>

          {/* Top Scorecard & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 to-white dark:border-blue-500/20 dark:from-[#131C31] dark:to-[#091124] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  AI Match Score
                </span>
                <div className="text-3xl font-black text-[#0070BA] dark:text-sky-300 mt-1">
                  {audit ? `${audit.overallScore}%` : "95%"}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Criteria Threshold Met
                </span>
              </div>
              <div className="h-14 w-14 rounded-full border-4 border-[#0070BA] dark:border-sky-400 flex items-center justify-center font-bold text-sm text-[#0070BA] dark:text-sky-300">
                {audit?.overallScore || 95}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#131C31] md:col-span-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Executive Audit Summary
              </span>
              <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {audit?.summary ||
                  "All acceptance criteria evaluated. Staging endpoints responded with 200 OK, PR diff matches specifications, and cryptographic signature validation passed."}
              </p>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>Verified: {audit?.verifiedAt || "Recent"}</span>
                <span>•</span>
                <span>Contract Escrow: ${milestone.amount.toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* Deliverables Preview Bar */}
          {latestSubmission && (
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-white/5 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Submitted Deliverables (v{latestSubmission.version})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {latestSubmission.demoUrl && (
                  <a
                    href={latestSubmission.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-[#131C31] dark:hover:bg-[#1A2642] text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ExternalLink className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400 shrink-0" />
                      <span className="font-semibold truncate">Live Staging URL</span>
                    </div>
                  </a>
                )}
                {latestSubmission.githubPr && (
                  <a
                    href={latestSubmission.githubPr}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-[#131C31] dark:hover:bg-[#1A2642] text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <GitHubIcon className="h-3.5 w-3.5 text-slate-800 dark:text-white shrink-0" />
                      <span className="font-semibold truncate">GitHub Pull Request</span>
                    </div>
                  </a>
                )}
                {latestSubmission.loomVideo && (
                  <a
                    href={latestSubmission.loomVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-[#131C31] dark:hover:bg-[#1A2642] text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Video className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <span className="font-semibold truncate">Video Walkthrough</span>
                    </div>
                  </a>
                )}
              </div>
              {latestSubmission.notes && (
                <div className="pt-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white">Freelancer Notes: </span>
                  {latestSubmission.notes}
                </div>
              )}
            </div>
          )}

          {/* Automated Sanity Checks */}
          {audit?.automatedChecks && audit.automatedChecks.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Automated Verification Pipeline
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {audit.automatedChecks.map((check, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#131C31] flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{check.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {check.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acceptance Criteria Breakdown with Filters */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Acceptance Criteria Evaluation ({criteria.length})
              </h3>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filter === "all"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  All ({criteria.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("satisfied")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filter === "satisfied"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  Satisfied ({satisfiedCount})
                </button>
                {missingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter("missing")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      filter === "missing"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-bold"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    Missing ({missingCount})
                  </button>
                )}
                {needsVerificationCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter("needs_verification")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      filter === "needs_verification"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    Needs Verification ({needsVerificationCount})
                  </button>
                )}
              </div>
            </div>

            {/* Criteria Cards */}
            <div className="space-y-3">
              {filteredCriteria.map((crit) => (
                <div
                  key={crit.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    crit.status === "satisfied"
                      ? "border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-950/10"
                      : crit.status === "missing"
                      ? "border-rose-200/80 bg-rose-50/30 dark:border-rose-500/20 dark:bg-rose-950/10"
                      : "border-amber-200/80 bg-amber-50/30 dark:border-amber-500/20 dark:bg-amber-950/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {crit.status === "satisfied" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : crit.status === "missing" ? (
                          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {crit.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 pl-6">
                        {crit.description}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        crit.status === "satisfied"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : crit.status === "missing"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >
                      {crit.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Concrete Evidence Finding */}
                  {crit.evidence && (
                    <div className="mt-3 ml-6 p-2.5 rounded-xl bg-white/80 dark:bg-[#070B14]/80 border border-slate-200/60 dark:border-white/10 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5 text-[11px]">
                        AI Evaluator Evidence & Observations:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                        {crit.evidence}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Revisions */}
          {audit?.suggestedRevisions && audit.suggestedRevisions.length > 0 && (
            <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/50 dark:border-blue-500/20 dark:bg-[#0D182E]/50 space-y-1.5">
              <span className="text-xs font-bold text-[#0070BA] dark:text-sky-300 uppercase tracking-wider block">
                Suggested Improvements
              </span>
              <ul className="list-disc pl-5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {audit.suggestedRevisions.map((rev, idx) => (
                  <li key={idx}>{rev}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Milestone Escrow:{" "}
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              ${milestone.amount.toLocaleString()} USD
            </span>{" "}
            locked in PayPal Escrow Vault.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {role === "client" ? (
              <>
                {milestone.status === "awaiting_client_approval" && onOpenRevisionModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRevisionModal();
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-900/50 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Request Revision
                  </button>
                )}

                {milestone.status === "awaiting_client_approval" && (
                  <button
                    type="button"
                    onClick={() => {
                      approveMilestone(project.id, milestone.id);
                      onClose();
                      if (onOpenPayPalModal) {
                        onOpenPayPalModal();
                      }
                    }}
                    className="flex-1 sm:flex-initial btn-gradient-glow px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve & Release ${milestone.amount.toLocaleString()} Payout</span>
                  </button>
                )}

                {milestone.status === "payment_pending" && onOpenPayPalModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPayPalModal();
                    }}
                    className="flex-1 sm:flex-initial btn-gradient-glow px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-white text-xs font-bold shadow-md shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <PayPalIcon className="h-4 w-4" />
                    <span>Release ${milestone.amount.toLocaleString()} with PayPal Sandbox</span>
                  </button>
                )}

                {milestone.status === "paid" && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Paid & Settled (TX: {milestone.paypalTransactionId})</span>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer transition-colors"
              >
                Close Audit Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
