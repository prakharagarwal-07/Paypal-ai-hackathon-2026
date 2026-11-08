"use client";

import { useState } from "react";
import {
  X,
  ExternalLink,
  Video,
  FileText,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Milestone } from "@/lib/dashboard-data";
import { GitHubIcon } from "./icons";

interface SubmissionModalProps {
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onSubmitDeliverable: (
    milestoneId: string,
    deliverables: {
      demoUrl: string;
      githubRepo: string;
      githubPr: string;
      loomVideo: string;
      notes: string;
    }
  ) => void;
}

export default function SubmissionModal({
  milestone,
  isOpen,
  onClose,
  onSubmitDeliverable,
}: SubmissionModalProps) {
  const [demoUrl, setDemoUrl] = useState("https://staging.milestone-store.demo/webhook-test");
  const [githubRepo, setGithubRepo] = useState("https://github.com/rohan-dev/ecommerce-paypal-app");
  const [githubPr, setGithubPr] = useState("https://github.com/rohan-dev/ecommerce-paypal-app/pull/6");
  const [loomVideo, setLoomVideo] = useState("https://loom.com/share/webhook-verification-demo");
  const [notes, setNotes] = useState(
    "Verified all webhook endpoints in sandbox mode. Added HMAC SHA-256 signature verification and automated retry queues for missed events."
  );

  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [preflightResults, setPreflightResults] = useState<{
    score: number;
    passed: boolean;
    findings: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleRunPreflight = () => {
    setIsRunningAudit(true);
    setPreflightResults(null);

    setTimeout(() => {
      setIsRunningAudit(false);
      setPreflightResults({
        score: 97,
        passed: true,
        findings: [
          "Live URL endpoint responded 200 OK (164ms)",
          "PayPal Webhook signature verification confirmed",
          "GitHub Pull Request #6 contains 8 commits with green CI tests",
          "Acceptance criteria match: 3 of 3 items fulfilled",
        ],
      });
    }, 1100);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDeliverable(milestone.id, {
      demoUrl,
      githubRepo,
      githubPr,
      loomVideo,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-white/95 p-6 sm:p-8 text-slate-900 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0D1527]/95 dark:text-white transition-all animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                Freelancer Submission
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Stage 0{milestone.stageNumber} • ${milestone.amount.toLocaleString()}.00 USD
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Submit Work for {milestone.title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Provide verifiable proof of completion. Run our AI Pre-Flight check to catch any missed criteria before Sarah reviews your milestone.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleFinalSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
              <span>Live Staging / Preview URL</span>
            </label>
            <input
              type="url"
              required
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://staging.yourproject.com"
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <GitHubIcon className="h-3.5 w-3.5" />
                <span>GitHub Repository</span>
              </label>
              <input
                type="url"
                required
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <GitHubIcon className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
                <span>GitHub Pull Request</span>
              </label>
              <input
                type="url"
                required
                value={githubPr}
                onChange={(e) => setGithubPr(e.target.value)}
                placeholder="https://github.com/.../pull/1"
                className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-purple-500" />
              <span>Loom Walkthrough Preview (Optional)</span>
            </label>
            <input
              type="url"
              value={loomVideo}
              onChange={(e) => setLoomVideo(e.target.value)}
              placeholder="https://loom.com/share/..."
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>Notes for Client</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summary of completed features, testing instructions, credentials..."
              className="w-full rounded-xl border border-slate-300/80 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
            />
          </div>

          {/* PRE-FLIGHT AI CHECK BUTTON */}
          <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-4 dark:border-blue-500/20 dark:bg-[#0070BA]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#0070BA] dark:text-sky-300" />
                  <span>Gemini 2.5 Pre-Flight Assistant</span>
                </span>
                <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                  Verify acceptance criteria against your code before sending to client.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunPreflight}
                disabled={isRunningAudit}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-sm border border-slate-200 dark:bg-[#131C31] dark:text-white dark:border-white/15 dark:hover:bg-[#1A2642] cursor-pointer disabled:opacity-60 transition-all shrink-0"
              >
                {isRunningAudit ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Auditing Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
                    <span>Run Pre-Flight Check</span>
                  </>
                )}
              </button>
            </div>

            {preflightResults && (
              <div className="mt-3.5 pt-3 border-t border-blue-200/50 dark:border-blue-500/20 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Pre-Flight Passed! Ready for client submission.
                  </span>
                  <span className="font-mono">{preflightResults.score}% Match</span>
                </div>
                {preflightResults.findings.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-gradient-glow flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Submit to Client for Payout</span>
              <Check className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
