"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, MilestoneStatus } from "@/lib/dashboard-data";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Wallet,
  AlertCircle,
  AlertTriangle,
  Upload,
  Receipt,
  User,
  Calendar,
  Settings,
  Archive,
  Layers,
  FileText,
  Video,
  ChevronRight,
  FolderGit2,
} from "lucide-react";
import { GitHubIcon, PayPalIcon } from "./icons";

interface ProjectWorkspaceProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
  onOpenSubmission: (project: ProjectContract, milestone: Milestone) => void;
  onOpenRevision: (project: ProjectContract, milestone: Milestone) => void;
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
  onOpenEditProject: () => void;
}

export default function ProjectWorkspace({
  onOpenAudit,
  onOpenSubmission,
  onOpenRevision,
  onOpenPayPal,
  onOpenEditProject,
}: ProjectWorkspaceProps) {
  const { role, activeProject, approveMilestone } = useDashboard();

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    activeProject?.milestones[0]?.id || ""
  );
  const [activeInspectorTab, setActiveInspectorTab] = useState<
    "criteria" | "submissions" | "ai-report" | "activity"
  >("criteria");

  if (!activeProject) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        No active project selected.
      </div>
    );
  }

  // Find selected milestone, fallback to first
  const selectedMilestone =
    activeProject.milestones.find((m) => m.id === selectedMilestoneId) ||
    activeProject.milestones[0];

  const progressPercent = Math.round(
    (activeProject.escrowReleased / activeProject.totalBudget) * 100
  );
  const escrowLocked = activeProject.escrowFunded - activeProject.escrowReleased;

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case "paid":
        return {
          label: "Paid & Settled",
          classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
        };
      case "payment_pending":
        return {
          label: "Approved (Payment Pending)",
          classes: "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300",
        };
      case "awaiting_client_approval":
        return {
          label: "Awaiting Client Approval",
          classes: "bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300 animate-pulse",
        };
      case "under_ai_review":
        return {
          label: "Under AI Review",
          classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
        };
      case "revision_requested":
        return {
          label: "Revision Requested",
          classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold",
        };
      case "in_progress":
        return {
          label: "In Progress",
          classes: "bg-slate-200/80 text-slate-800 dark:bg-white/10 dark:text-slate-200",
        };
      default:
        return {
          label: "Not Started",
          classes: "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PROJECT WORKSPACE HEADER CARD */}
      <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0070BA] dark:bg-blue-900/30 dark:text-sky-300">
                {activeProject.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Contract #{activeProject.id}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                PayPal Orders v2 Escrow Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeProject.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {activeProject.description}
            </p>
          </div>

          {/* Right side: Action controls */}
          <div className="flex items-center gap-3 shrink-0">
            {role === "client" && (
              <button
                type="button"
                onClick={onOpenEditProject}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex items-center gap-1.5 text-xs font-semibold transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Project Settings</span>
              </button>
            )}
          </div>
        </div>

        {/* Client & Freelancer Badges */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Client Info */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#0070BA] text-white font-bold flex items-center justify-center shrink-0">
              {activeProject.client.avatar}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Contract Owner (Client)
              </span>
              <span className="font-bold text-slate-900 dark:text-white block truncate">
                {activeProject.client.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate block">
                {activeProject.client.company}
              </span>
            </div>
          </div>

          {/* Freelancer Info */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              {activeProject.freelancer.avatar}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Assigned Freelancer
              </span>
              <span className="font-bold text-slate-900 dark:text-white block truncate">
                {activeProject.freelancer.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate block">
                ★ {activeProject.freelancer.rating} Rating
              </span>
            </div>
          </div>

          {/* Budget Info */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-[#0070BA] dark:text-sky-300 font-bold flex items-center justify-center shrink-0">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Total Contract Budget
              </span>
              <span className="font-bold font-mono text-base text-slate-900 dark:text-white block">
                ${activeProject.totalBudget.toLocaleString()} USD
              </span>
              <span className="text-[11px] text-slate-500 block">
                ${escrowLocked.toLocaleString()} locked in escrow
              </span>
            </div>
          </div>

          {/* Deadline Info */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Target Completion
              </span>
              <span className="font-bold text-slate-900 dark:text-white block">
                {activeProject.targetDeadline}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Created: {activeProject.createdAt}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Project Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Overall Contract Progress ({activeProject.milestones.filter((m) => m.status === "paid").length} of {activeProject.milestones.length} Stages Settled)
            </span>
            <span className="font-mono text-[#0070BA] dark:text-sky-400 font-bold">
              ${activeProject.escrowReleased.toLocaleString()} / ${activeProject.totalBudget.toLocaleString()} Released ({progressPercent}%)
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              title="Paid & Released"
            />
            {activeProject.milestones.find((m) => m.status === "awaiting_client_approval") && (
              <div
                className="bg-[#0070BA] animate-pulse transition-all duration-500"
                style={{
                  width: `${Math.round(
                    ((activeProject.milestones.find((m) => m.status === "awaiting_client_approval")?.amount || 0) /
                      activeProject.totalBudget) *
                      100
                  )}%`,
                }}
                title="Awaiting Review"
              />
            )}
          </div>
        </div>
      </div>

      {/* 2. MILESTONE INTERACTIVE TIMELINE / STAGE SELECTOR */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Milestone Timeline ({activeProject.milestones.length} Stages)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeProject.milestones.map((milestone) => {
            const isSelected = selectedMilestone?.id === milestone.id;
            const statusInfo = getStatusBadge(milestone.status);

            return (
              <button
                key={milestone.id}
                type="button"
                onClick={() => setSelectedMilestoneId(milestone.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "border-[#0070BA] bg-blue-50/50 dark:border-sky-400 dark:bg-[#131C31] shadow-md ring-2 ring-[#0070BA]/20"
                    : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#0D1527] dark:hover:bg-white/5"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Stage 0{milestone.stageNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.classes}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {milestone.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {milestone.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${milestone.amount.toLocaleString()} USD
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Due {milestone.dueDate}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DETAILED MILESTONE INSPECTOR */}
      {selectedMilestone && (
        <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] overflow-hidden shadow-sm">
          {/* Milestone Inspector Header */}
          <div className="p-6 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-[#0070BA] dark:text-sky-400">
                  Stage 0{selectedMilestone.stageNumber}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    getStatusBadge(selectedMilestone.status).classes
                  }`}
                >
                  {getStatusBadge(selectedMilestone.status).label}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {selectedMilestone.title}
              </h2>
            </div>

            {/* Payout & Context Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Client Actions */}
              {role === "client" && (
                <>
                  {selectedMilestone.status === "awaiting_client_approval" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenRevision(activeProject, selectedMilestone)}
                        className="px-3.5 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-200 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Request Revision
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenAudit(activeProject, selectedMilestone)}
                        className="btn-gradient-glow px-4 py-2 rounded-xl bg-gradient-to-r from-[#004C8F] to-[#0070BA] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Inspect Deliverables & AI Audit</span>
                      </button>
                    </>
                  )}

                  {selectedMilestone.status === "payment_pending" && (
                    <button
                      type="button"
                      onClick={() => onOpenPayPal(activeProject, selectedMilestone)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <PayPalIcon className="h-3.5 w-3.5" />
                      <span>Release ${selectedMilestone.amount.toLocaleString()} with PayPal Sandbox</span>
                    </button>
                  )}
                </>
              )}

              {/* Freelancer Actions */}
              {role === "freelancer" && (
                <>
                  {selectedMilestone.status === "revision_requested" ||
                  selectedMilestone.status === "in_progress" ? (
                    <button
                      type="button"
                      onClick={() => onOpenSubmission(activeProject, selectedMilestone)}
                      className="btn-gradient-glow px-4 py-2 rounded-xl bg-gradient-to-r from-[#004C8F] to-[#0070BA] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {selectedMilestone.status === "revision_requested"
                          ? "Respond to Revision & Resubmit"
                          : "Submit Deliverables & AI Check"}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAudit(activeProject, selectedMilestone)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
                      <span>View AI Work-Assessment</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Inspector Tabs Bar */}
          <div className="px-6 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/30 dark:bg-black/10 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveInspectorTab("criteria")}
              className={`py-3.5 border-b-2 cursor-pointer transition-all ${
                activeInspectorTab === "criteria"
                  ? "border-[#0070BA] text-[#0070BA] dark:border-sky-400 dark:text-sky-300 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Acceptance Criteria ({selectedMilestone.acceptanceCriteria.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveInspectorTab("submissions")}
              className={`py-3.5 border-b-2 cursor-pointer transition-all ${
                activeInspectorTab === "submissions"
                  ? "border-[#0070BA] text-[#0070BA] dark:border-sky-400 dark:text-sky-300 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Submission & Revision History ({selectedMilestone.submissions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveInspectorTab("ai-report")}
              className={`py-3.5 border-b-2 cursor-pointer transition-all ${
                activeInspectorTab === "ai-report"
                  ? "border-[#0070BA] text-[#0070BA] dark:border-sky-400 dark:text-sky-300 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              AI Assessment Report
            </button>

            <button
              type="button"
              onClick={() => setActiveInspectorTab("activity")}
              className={`py-3.5 border-b-2 cursor-pointer transition-all ${
                activeInspectorTab === "activity"
                  ? "border-[#0070BA] text-[#0070BA] dark:border-sky-400 dark:text-sky-300 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Project Activity Feed
            </button>
          </div>

          {/* Tab 1: Acceptance Criteria */}
          {activeInspectorTab === "criteria" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Requirements established by {activeProject.client.name} that must be verified before escrow release.
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ${selectedMilestone.amount.toLocaleString()} USD Guaranteed
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-3">
                {selectedMilestone.acceptanceCriteria.map((crit) => (
                  <div key={crit.id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {crit.status === "satisfied" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : crit.status === "missing" ? (
                            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          ) : crit.status === "needs_verification" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                          )}
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {crit.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                          {crit.description}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                          crit.status === "satisfied"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : crit.status === "missing"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                            : crit.status === "needs_verification"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                        }`}
                      >
                        {crit.status.replace("_", " ")}
                      </span>
                    </div>

                    {crit.evidence && (
                      <div className="ml-6 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] block">
                          Evaluated Evidence:
                        </span>
                        <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          {crit.evidence}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Submissions & Revision History */}
          {activeInspectorTab === "submissions" && (
            <div className="p-6 space-y-4">
              {selectedMilestone.submissions.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs">
                  No deliverables submitted for this stage yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedMilestone.submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#0070BA] text-white text-[10px] font-mono">
                            v{sub.version}
                          </span>
                          <span>Submitted by {sub.submittedBy}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {sub.submittedAt}
                        </span>
                      </div>

                      {/* Links preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        {sub.demoUrl && (
                          <a
                            href={sub.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#131C31] border border-slate-200 dark:border-white/10 text-xs hover:border-[#0070BA] transition-colors"
                          >
                            <span className="truncate font-semibold">Demo Staging</span>
                            <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                          </a>
                        )}
                        {sub.githubPr && (
                          <a
                            href={sub.githubPr}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#131C31] border border-slate-200 dark:border-white/10 text-xs hover:border-[#0070BA] transition-colors"
                          >
                            <span className="truncate font-semibold">GitHub PR</span>
                            <GitHubIcon className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        )}
                        {sub.loomVideo && (
                          <a
                            href={sub.loomVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#131C31] border border-slate-200 dark:border-white/10 text-xs hover:border-purple-400 transition-colors"
                          >
                            <span className="truncate font-semibold">Loom Video</span>
                            <Video className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                          </a>
                        )}
                      </div>

                      {sub.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                          <span className="font-bold text-slate-800 dark:text-white">Notes: </span>
                          {sub.notes}
                        </p>
                      )}

                      {/* Revision Feedback Request if attached to this version */}
                      {sub.revisionRequest && (
                        <div className="mt-3 p-3 rounded-xl border border-amber-300/80 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                              Revision Requested by {sub.revisionRequest.requestedBy}
                            </span>
                            <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                              {sub.revisionRequest.requestedAt}
                            </span>
                          </div>
                          <p className="pl-5 leading-relaxed">
                            "{sub.revisionRequest.reason}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: AI Assessment Report */}
          {activeInspectorTab === "ai-report" && (
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/60 dark:border-blue-500/20 dark:bg-[#0D182E]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0070BA] dark:text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Gemini 2.5 Flash Automated Audit Score
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {selectedMilestone.latestAudit ? `${selectedMilestone.latestAudit.overallScore}% Criteria Match` : "95% Criteria Match"}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                    {selectedMilestone.latestAudit?.summary ||
                      "Demonstration AI Audit: All criteria verified against code pull request and live staging response."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAudit(activeProject, selectedMilestone)}
                  className="px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer shrink-0 transition-colors"
                >
                  Open Full Audit Modal
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Project Activity Feed */}
          {activeInspectorTab === "activity" && (
            <div className="p-6 space-y-3">
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/5">
                {activeProject.activityLog.map((act) => (
                  <div key={act.id} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                    <div className="h-2 w-2 rounded-full bg-[#0070BA] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{act.actor}</span>{" "}
                      <span className="text-slate-600 dark:text-slate-300">{act.action}</span>
                      {act.details && (
                        <p className="mt-1 text-slate-500 dark:text-slate-400 font-mono text-[11px] pl-2 border-l border-slate-200 dark:border-white/10">
                          {act.details}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {act.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
