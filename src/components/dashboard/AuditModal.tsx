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
} from "lucide-react";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import { GitHubIcon, PayPalIcon } from "./icons";

interface AuditModalProps {
  project: ProjectContract;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onReleasePayout: (milestoneId: string) => void;
  isClientView: boolean;
}

export default function AuditModal({
  project,
  milestone,
  isOpen,
  onClose,
  onReleasePayout,
  isClientView,
}: AuditModalProps) {
  const [isReleasing, setIsReleasing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const audit = milestone.aiAudit;
  const deliverables = milestone.deliverables;

  const handleApproveAndPay = () => {
    setIsReleasing(true);
    setTimeout(() => {
      setIsReleasing(false);
      onReleasePayout(milestone.id);
    }, 1200);
  };

  const copyDemo = () => {
    if (deliverables?.demoUrl) {
      navigator.clipboard.writeText(deliverables.demoUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/20 bg-white/95 p-6 sm:p-8 text-slate-900 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0D1527]/95 dark:text-white transition-all animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-[#0070BA] dark:bg-blue-500/20 dark:text-sky-300">
                Stage 0{milestone.stageNumber}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Project: {project.title}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {milestone.title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {milestone.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Deliverables Section */}
        {deliverables && (
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5 dark:border-white/10 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Submitted Proof of Work
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {deliverables.submittedAt}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {deliverables.demoUrl && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#131C31] text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <ExternalLink className="h-4 w-4 text-[#0070BA] dark:text-sky-400 shrink-0" />
                    <span className="font-semibold truncate">Live Staging URL</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={copyDemo}
                      className="p-1 hover:text-[#0070BA] dark:hover:text-sky-300 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={deliverables.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:text-[#0070BA] dark:hover:text-sky-300"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {deliverables.githubPr && (
                <a
                  href={deliverables.githubPr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-[#131C31] dark:hover:bg-[#1A2642] text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <GitHubIcon className="h-4 w-4 text-slate-800 dark:text-white shrink-0" />
                    <span className="font-semibold truncate">GitHub Pull Request</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              )}

              {deliverables.loomVideo && (
                <a
                  href={deliverables.loomVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-[#131C31] dark:hover:bg-[#1A2642] text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Video className="h-4 w-4 text-purple-500 shrink-0" />
                    <span className="font-semibold truncate">Loom Walkthrough</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              )}
            </div>

            {deliverables.notes && (
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-[#0070BA] pl-3 py-0.5">
                "{deliverables.notes}"
              </p>
            )}
          </div>
        )}

        {/* Gemini AI Audit Breakdown */}
        {audit ? (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-[#0070BA] dark:text-sky-300 border border-blue-500/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Gemini 2.5 Automated Audit Report</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold">
                      Verified
                    </span>
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Evaluated on {audit.verifiedAt}
                  </span>
                </div>
              </div>

              {/* Score Pill */}
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Compliance Score:
                </span>
                <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                  {audit.overallScore}%
                </span>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 p-4 dark:border-blue-500/20 dark:bg-[#0070BA]/10 text-xs text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
              <strong>Audit Verdict:</strong> {audit.summary}
            </div>

            {/* Detailed Criteria Checklist */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-1">
                Acceptance Criteria Verification ({audit.criteria.length} items):
              </span>

              {audit.criteria.map((crit) => (
                <div
                  key={crit.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-slate-900/60 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {crit.title}
                        </span>
                        <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                          {crit.description}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                      PASSED
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-[#0070BA] dark:text-sky-400 shrink-0" />
                    <span>AI evidence: {crit.aiNotes}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Automated System Checks */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {audit.automatedChecks.map((check, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/60 bg-slate-50/60 dark:border-white/5 dark:bg-slate-900/40 text-[11px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold truncate">{check.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] truncate ml-2">
                    {check.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
            No audit report generated for this milestone yet.
          </div>
        )}

        {/* Payout Action Section */}
        <div className="mt-8 pt-5 border-t border-slate-200/80 dark:border-white/10">
          {milestone.status === "paid" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Payout Released via PayPal Sandbox</span>
              </div>
              <div className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">
                Transaction ID: {milestone.paypalTransactionId || "PAYID-MN7642-8921-A"} • Paid on {milestone.paidAt}
              </div>
            </div>
          ) : isClientView ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
                  Escrow Payout to Rohan Verma
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ${milestone.amount.toLocaleString()}.00 USD
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleApproveAndPay}
                  disabled={isReleasing}
                  className="btn-gradient-glow w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {isReleasing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Releasing via PayPal...</span>
                    </>
                  ) : (
                    <>
                      <PayPalIcon className="h-4 w-4" />
                      <span>Approve & Release ${milestone.amount.toLocaleString()} with PayPal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Status: In Client Review • Payout of ${milestone.amount.toLocaleString()} will transfer to your PayPal wallet upon client sign-off.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
