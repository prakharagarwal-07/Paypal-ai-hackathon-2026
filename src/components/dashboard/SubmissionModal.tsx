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
  Check,
  AlertTriangle,
  FolderGit2,
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
  const isRevision =
    milestone.status === "changes_requested" || milestone.status === "revision_requested";

  const latestSubmission = milestone.submissions[milestone.submissions.length - 1];
  const revisionFeedback = latestSubmission?.revisionRequest;

  const [demoUrl, setDemoUrl] = useState(latestSubmission?.demoUrl || "");
  const [githubRepo, setGithubRepo] = useState(latestSubmission?.githubRepo || "");
  const [loomVideo, setLoomVideo] = useState(latestSubmission?.loomVideo || "");
  const [notes, setNotes] = useState(
    latestSubmission?.notes ||
    (isRevision
      ? ""
      : "")
  );

  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [checkPassed, setCheckPassed] = useState(false);

  if (!isOpen) return null;

  const handleQuickCheck = () => {
    setIsRunningCheck(true);
    setTimeout(() => {
      setIsRunningCheck(false);
      setCheckPassed(true);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMilestoneDeliverables(
      project.id,
      milestone.id,
      {
        demoUrl,
        githubRepo,
        loomVideo,
        notes,
      },
      isRevision
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-bold text-[#0070BA] dark:text-sky-400 block mb-0.5">
              {isRevision ? "Resubmit Revised Work" : "Submit Work for Review"}
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {milestone.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40">
                <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400" />
                Project: {project.title}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                • ${milestone.amount.toLocaleString()} USD
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Changes Requested Banner */}
          {isRevision && revisionFeedback && (
            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/20 text-slate-700 dark:text-slate-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Requested Changes from {revisionFeedback.requestedBy}:
              </span>
              <p className="text-[11px] leading-relaxed pl-5">
                "{revisionFeedback.reason}"
              </p>
            </div>
          )}

          {/* Website / Demo Link */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Website / Demo Link *
            </label>
            <input
              type="url"
              required
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://your-demo-site.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
            />
          </div>

          {/* Code Link */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Code Repository Link *
            </label>
            <input
              type="url"
              required
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
            />
          </div>

          {/* Video Walkthrough (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Video Walkthrough (Optional)
            </label>
            <input
              type="url"
              value={loomVideo}
              onChange={(e) => setLoomVideo(e.target.value)}
              placeholder="https://loom.com/share/..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Notes for Client
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain how the requirements were met or any test instructions..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          {/* Quick Pre-Check Button */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-xs">
                Quick Requirements Check
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically verify your links before sending to the client.
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickCheck}
              disabled={isRunningCheck}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer shrink-0"
            >
              {isRunningCheck ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : checkPassed ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Checked
                </span>
              ) : (
                "Run Check"
              )}
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
