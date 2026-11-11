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
  Image as ImageIcon,
  Palette,
  Cloud,
  Globe,
  Link as LinkIcon,
  Eye,
  Upload,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Info,
  Loader2,
  ChevronRight,
  AlertOctagon,
} from "lucide-react";
import { Milestone, ProjectContract, getFriendlyCriterionStatus, AIAssessment } from "@/lib/dashboard-data";
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
  const { role, approveMilestone, setMilestoneAudit } = useDashboard();
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("Connecting to Gemini...");

  if (!isOpen) return null;

  const latestSubmission = milestone.submissions?.[milestone.submissions.length - 1];
  const audit = milestone.latestAudit || latestSubmission?.aiAssessment;
  const criteria = audit?.criteria || milestone.acceptanceCriteria || [];

  const metCount = criteria.filter((c) => c.status === "met" || c.status === "satisfied").length;
  const missingCount = criteria.filter((c) => c.status === "missing").length;
  const reviewCount = criteria.filter(
    (c) => c.status === "needs_manual_review" || c.status === "needs_verification"
  ).length;

  const handleRunAIAnalysis = async (forceRefresh = false) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setIsQuotaError(false);
    setLoadingStep("1. Packaging submitted files, code & links...");

    try {
      setTimeout(() => {
        setLoadingStep("2. Gemini inspecting deliverables against acceptance criteria...");
      }, 700);

      setTimeout(() => {
        setLoadingStep("3. Cross-checking verified evidence vs unverified assumptions...");
      }, 1500);

      const res = await fetch("/api/ai/verify-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          milestoneId: milestone.id,
          submission: latestSubmission,
          forceRefresh,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isQuotaExceeded || res.status === 429) {
          setIsQuotaError(true);
          setAnalysisError(
            "Gemini API rate limit reached (HTTP 429). The system can run a deterministic heuristic audit or you can retry in a moment."
          );
        } else {
          setAnalysisError(data.error || "Failed to complete AI acceptance analysis.");
        }
        return;
      }

      if (data.assessment) {
        setMilestoneAudit(project.id, milestone.id, data.assessment);
      }
    } catch (err: any) {
      setAnalysisError(err?.message || "Network error while connecting to AI verification service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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
                Milestone Deliverable Review
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* 1. "Analyse with AI" Hero Trigger or Cached Bar */}
          {!audit && !isAnalyzing && (
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-transparent shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Analyse with AI</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Google Gemini
                      </span>
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 leading-relaxed">
                      Evaluate the submitted files, code structures, and deliverable links against the contract acceptance criteria before approving payment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-t border-indigo-100 dark:border-white/5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Advisory only • Triggers only on your explicit click
                </span>
                <button
                  type="button"
                  onClick={() => handleRunAIAnalysis(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyse with AI</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 text-center space-y-3 animate-in fade-in">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-lg animate-pulse">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gemini Evaluating Deliverables...
                </h4>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-mono">
                  {loadingStep}
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full animate-[shimmer_1.5s_infinite] w-2/3" />
              </div>
            </div>
          )}

          {/* Error / Quota State */}
          {analysisError && !isAnalyzing && (
            <div
              className={`p-4 rounded-xl border ${
                isQuotaError
                  ? "border-amber-300 bg-amber-50/70 dark:border-amber-800/40 dark:bg-amber-950/20"
                  : "border-rose-300 bg-rose-50/70 dark:border-rose-900/40 dark:bg-rose-950/20"
              } space-y-2`}
            >
              <div className="flex items-start gap-2.5">
                {isQuotaError ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 flex-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {isQuotaError ? "Gemini API Quota Limit Exceeded (HTTP 429)" : "AI Analysis Error"}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysisError}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => handleRunAIAnalysis(true)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry Analysis</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Structured Assessment Card (when audit exists) */}
          {audit && !isAnalyzing && (
            <div className="space-y-4">
              {/* Header Status Bar & Caching Indicator */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      audit.status === "approved"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : audit.status === "changes_requested"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {audit.status === "approved" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : audit.status === "changes_requested" ? (
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>
                      {audit.status === "approved"
                        ? "Recommended for Approval"
                        : audit.status === "changes_requested"
                        ? "Changes Recommended"
                        : "Manual Verification Advised"}
                    </span>
                  </span>

                  {audit.isCached ? (
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10">
                      Cached (Unchanged)
                    </span>
                  ) : null}

                  {audit.isQuotaExceeded ? (
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50">
                      Heuristic Mode
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      {audit.overallScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">Confidence Score</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunAIAnalysis(true)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                    title="Re-analyse with AI (bypass cache)"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Overall AI Assessment
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {metCount} of {criteria.length} requirements met
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {audit.summary}
                </p>
                {audit.qualityNotes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-blue-200/50 dark:border-blue-900/30">
                    <strong className="text-slate-700 dark:text-slate-300">Artifact Quality: </strong>
                    {audit.qualityNotes}
                  </p>
                )}
              </div>

              {/* Requirement 7: Non-binding Advisory Notice */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-white/[0.02] flex items-center gap-2.5 text-slate-600 dark:text-slate-400 text-[11px]">
                <Info className="h-4 w-4 text-[#0070BA] dark:text-sky-400 shrink-0" />
                <p className="leading-snug">
                  <strong>Advisory Evaluation Only:</strong> Gemini provides automated criteria checks. It cannot release escrow payments, approve milestones, or enforce binding decisions. Milestone approval remains strictly under your control.
                </p>
              </div>

              {/* Missing Deliverables Alert (if any) */}
              {audit.missingDeliverables && audit.missingDeliverables.length > 0 && (
                <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/60 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                    <AlertOctagon className="h-4 w-4" />
                    <span>Missing or Incomplete Deliverables ({audit.missingDeliverables.length})</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px] pl-1">
                    {audit.missingDeliverables.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Inconsistencies Alert (if any) */}
              {audit.inconsistencies && audit.inconsistencies.length > 0 && (
                <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-950/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Potential Scope Inconsistencies ({audit.inconsistencies.length})</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px] pl-1">
                    {audit.inconsistencies.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirement 6: Verified Findings vs Unverified Assumptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Verified Findings */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/15 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified Findings</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    Directly inspected from submitted files, photos, code, and documents.
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 pt-1">
                    {(audit.verifiedFindings && audit.verifiedFindings.length > 0
                      ? audit.verifiedFindings
                      : ["Agreed contract deliverables verified in submission package."]
                    ).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unverified Assumptions */}
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/15 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Unverified Assumptions</span>
                  </div>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    Live links, private credentials, or runtime items needing manual inspection.
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 pt-1">
                    {(audit.unverifiedAssumptions && audit.unverifiedAssumptions.length > 0
                      ? audit.unverifiedAssumptions
                      : ["Interactive features and staging links should be verified manually."]
                    ).map((a, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <ChevronRight className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 3. Submitted Deliverables & Assets */}
          {latestSubmission && (
            <div className="space-y-3 pt-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                Submitted Deliverables & Assets ({latestSubmission.attachments?.length || 0} files,{" "}
                {latestSubmission.deliverableLinks?.length || 0} links):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Files and images uploaded directly from PC */}
                {latestSubmission.attachments &&
                  latestSubmission.attachments.map((file, idx) => {
                    const isImg = file.type?.startsWith("image/") || file.dataUrl?.startsWith("data:image");
                    return (
                      <div
                        key={`att_${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {isImg && file.dataUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: file.dataUrl!, name: file.name })}
                              className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 shrink-0 cursor-pointer relative group/img"
                              title="Click to view full photo"
                            >
                              <img
                                src={file.dataUrl}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="h-3.5 w-3.5" />
                              </div>
                            </button>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-sky-950/60 text-[#0070BA] dark:text-sky-400 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0 text-left">
                            <span className="font-semibold text-xs block text-slate-900 dark:text-white truncate">
                              {file.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                              <span>{file.size}</span>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                Uploaded deliverable
                              </span>
                            </div>
                          </div>
                        </div>

                        {file.dataUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ url: file.dataUrl!, name: file.name })}
                            className="px-2 py-1 rounded-lg bg-[#0070BA]/10 hover:bg-[#0070BA]/20 text-[#0070BA] dark:text-sky-300 text-[11px] font-bold cursor-pointer transition-colors shrink-0"
                          >
                            {isImg ? "View Photo" : "View File"}
                          </button>
                        ) : null}
                      </div>
                    );
                  })}

                {latestSubmission.deliverableLinks &&
                  latestSubmission.deliverableLinks.map((link, idx) => {
                    const isPhoto = link.type === "photo";
                    const isDesign = link.type === "design";
                    const isDoc = link.type === "document";
                    const isCloud = link.type === "cloud";

                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#0070BA] dark:hover:border-sky-500 transition-colors bg-white dark:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {isPhoto ? (
                            <ImageIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : isDesign ? (
                            <Palette className="h-4 w-4 text-purple-500 shrink-0" />
                          ) : isDoc ? (
                            <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                          ) : isCloud ? (
                            <Cloud className="h-4 w-4 text-sky-500 shrink-0" />
                          ) : (
                            <LinkIcon className="h-4 w-4 text-[#0070BA] shrink-0" />
                          )}
                          <span className="font-semibold text-xs truncate">
                            {link.title || link.url}
                          </span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      </a>
                    );
                  })}

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

          {/* 4. Requirement-by-Requirement Checklist */}
          <div className="space-y-2.5 pt-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              Contract Acceptance Criteria ({criteria.length})
            </span>

            <div className="space-y-2">
              {criteria.map((crit) => {
                const statusInfo = getFriendlyCriterionStatus(crit.status);

                return (
                  <div
                    key={crit.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 space-y-1.5"
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

                    {crit.evidence && (
                      <div className="ml-6 p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-900 dark:text-emerald-200">
                        <strong className="font-semibold">Observed Evidence: </strong>
                        {crit.evidence}
                      </div>
                    )}

                    {crit.aiNotes && (
                      <div className="ml-6 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400">
                        <strong className="font-semibold text-slate-700 dark:text-slate-300">AI Notes: </strong>
                        {crit.aiNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Escrow Payment:{" "}
            <strong className="text-slate-900 dark:text-white font-mono">
              ${milestone.amount.toLocaleString()} USD
            </strong>
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
                    milestone.status === "in_progress" ||
                    milestone.status === "not_started") && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSubmissionModal();
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      {milestone.status === "changes_requested" || milestone.status === "revision_requested"
                        ? "Update & Resubmit Work"
                        : "Submit Deliverables"}
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
          >
            <div className="p-3 border-b border-white/10 flex items-center justify-between text-white text-xs">
              <span className="font-semibold truncate pr-4">{previewImage.name}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 flex-1 overflow-auto flex items-center justify-center bg-black/40">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
