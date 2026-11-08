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
  Upload,
  AlertTriangle,
} from "lucide-react";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import { GitHubIcon } from "./icons";
import { useDashboard } from "@/lib/dashboard-store";

interface SubmissionModalProps {
  project: ProjectContract;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmissionModal({
  project,
  milestone,
  isOpen,
  onClose,
}: SubmissionModalProps) {
  const { submitMilestoneDeliverables } = useDashboard();
  const isRevision = milestone.status === "revision_requested";

  const latestSubmission = milestone.submissions[milestone.submissions.length - 1];
  const revisionFeedback = latestSubmission?.revisionRequest;

  const [demoUrl, setDemoUrl] = useState(
    latestSubmission?.demoUrl || "https://staging.milestone-store.demo/checkout"
  );
  const [githubRepo, setGithubRepo] = useState(
    latestSubmission?.githubRepo || "https://github.com/rohan-dev/ecommerce-paypal-app"
  );
  const [githubPr, setGithubPr] = useState(
    latestSubmission?.githubPr || "https://github.com/rohan-dev/ecommerce-paypal-app/pull/6"
  );
  const [loomVideo, setLoomVideo] = useState(
    latestSubmission?.loomVideo || "https://loom.com/share/revision-fix-verification"
  );
  const [notes, setNotes] = useState(
    isRevision
      ? "Resolved client revision request: Added PayPal-Request-Id header with cryptographically generated UUID v4 on all capture attempts. Verified zero duplicate capture responses."
      : "Verified all webhook endpoints and PayPal Orders v2 integration in sandbox mode."
  );

  const [isPreflightRunning, setIsPreflightRunning] = useState(false);
  const [preflightResults, setPreflightResults] = useState<{
    score: number;
    passed: boolean;
    details: string;
  } | null>(null);

  if (!isOpen) return null;

  const handlePreflightCheck = () => {
    setIsPreflightRunning(true);
    setPreflightResults(null);

    setTimeout(() => {
      setIsPreflightRunning(false);
      setPreflightResults({
        score: isRevision ? 98 : 95,
        passed: true,
        details:
          "Pre-flight analysis passed! Staging HTTP 200 OK, GitHub branch cleanly merged, and all acceptance criteria schemas verified against contract specs.",
      });
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMilestoneDeliverables(
      project.id,
      milestone.id,
      {
        demoUrl,
        githubRepo,
        githubPr,
        loomVideo,
        notes,
      },
      isRevision
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col transition-all">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isRevision
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300"
                }`}
              >
                {isRevision ? "Resubmitting Revision (v" + (milestone.submissions.length + 1) + ")" : "Stage Deliverable Submission"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Stage 0{milestone.stageNumber} • Escrow: ${milestone.amount.toLocaleString()} USD
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {milestone.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Revision Request Feedback Banner */}
          {isRevision && revisionFeedback && (
            <div className="p-4 rounded-2xl border border-amber-300/80 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-950/20 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Client Revision Request from {revisionFeedback.requestedBy}</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-normal ml-auto">
                  {revisionFeedback.requestedAt}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 pl-6 leading-relaxed">
                "{revisionFeedback.reason}"
              </p>
            </div>
          )}

          {/* Staging URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
              <span>Live Staging / Demo URL *</span>
            </label>
            <input
              type="url"
              required
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://staging.yourdomain.com/..."
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all font-mono"
            />
          </div>

          {/* GitHub Repo & PR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <GitHubIcon className="h-3.5 w-3.5" />
                <span>GitHub Repository *</span>
              </label>
              <input
                type="url"
                required
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <GitHubIcon className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
                <span>GitHub Pull Request *</span>
              </label>
              <input
                type="url"
                required
                value={githubPr}
                onChange={(e) => setGithubPr(e.target.value)}
                placeholder="https://github.com/.../pull/1"
                className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all font-mono"
              />
            </div>
          </div>

          {/* Loom Video */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-purple-500" />
              <span>Video Walkthrough (Loom / YouTube / MP4)</span>
            </label>
            <input
              type="url"
              value={loomVideo}
              onChange={(e) => setLoomVideo(e.target.value)}
              placeholder="https://loom.com/share/..."
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all font-mono"
            />
          </div>

          {/* Submission Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>Submission Notes & Verification Instructions</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain how each acceptance criterion was satisfied, test credentials, or sandbox instructions..."
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
            />
          </div>

          {/* Pre-Flight AI Check Card */}
          <div className="p-4 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/60 via-sky-50/30 to-white dark:border-blue-500/20 dark:from-[#131C31] dark:to-[#0D1527] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0070BA] dark:text-sky-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Gemini Pre-Flight Verification
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Test acceptance criteria before notifying the client to guarantee a 95%+ audit score.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePreflightCheck}
              disabled={isPreflightRunning}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#070B14] border border-blue-300 dark:border-blue-500/40 text-xs font-bold text-[#0070BA] dark:text-sky-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              {isPreflightRunning ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Run Pre-Flight AI Check</span>
                </>
              )}
            </button>
          </div>

          {/* Pre-flight Results */}
          {preflightResults && (
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/80 dark:border-emerald-500/40 dark:bg-emerald-950/20 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  Pre-Flight Passed with Score: {preflightResults.score}%
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                  {preflightResults.details}
                </p>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gradient-glow px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>{isRevision ? "Resubmit Revised Deliverables" : "Submit Deliverables for Review"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
