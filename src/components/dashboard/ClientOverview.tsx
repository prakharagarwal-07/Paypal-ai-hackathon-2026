"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Wallet,
  AlertCircle,
  Plus,
  FolderGit2,
  Layers,
  TrendingUp,
  Receipt,
  User,
  Calendar,
} from "lucide-react";
import { PayPalIcon } from "./icons";

interface ClientOverviewProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
  onOpenRevision: (project: ProjectContract, milestone: Milestone) => void;
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
  onOpenNewProject: () => void;
}

export default function ClientOverview({
  onOpenAudit,
  onOpenRevision,
  onOpenPayPal,
  onOpenNewProject,
}: ClientOverviewProps) {
  const { projects, setActiveProjectId, setActiveTab, searchQuery } = useDashboard();
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");

  // Metrics calculation
  const totalProjects = projects.length;
  const allMilestones = projects.flatMap((p) => p.milestones);
  const totalMilestones = allMilestones.length;
  const pendingReviews = allMilestones.filter((m) => m.status === "awaiting_client_approval");
  const pendingPayments = allMilestones.filter((m) => m.status === "payment_pending");
  const totalPaid = projects.reduce((sum, p) => sum + p.escrowReleased, 0);
  const totalEscrowLocked = projects.reduce((sum, p) => sum + (p.escrowFunded - p.escrowReleased), 0);

  // Spotlight Milestone (awaiting approval or pending payment)
  const spotlightItem = projects
    .flatMap((p) => p.milestones.map((m) => ({ project: p, milestone: m })))
    .find((item) => item.milestone.status === "awaiting_client_approval" || item.milestone.status === "payment_pending");

  // Filter projects by status & search
  const filteredProjects = projects.filter((p) => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchFreelancer = p.freelancer.name.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      return matchTitle || matchFreelancer || matchCategory;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Metric Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Contracts</span>
            <FolderGit2 className="h-4 w-4 text-[#0070BA] dark:text-sky-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalProjects}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Across {totalMilestones} milestone stages
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Reviews</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingReviews.length}
          </div>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1 block">
            {pendingReviews.length > 0 ? "Action required from you" : "All reviews up to date"}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved for Payout</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {pendingPayments.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Ready for PayPal Sandbox capture
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Escrow Locked</span>
            <Wallet className="h-4 w-4 text-[#0070BA] dark:text-sky-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            ${totalEscrowLocked.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Safe in PayPal Escrow Vault
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Disbursed</span>
            <Receipt className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ${totalPaid.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1 block">
            100% verified by AI
          </span>
        </div>
      </div>

      {/* 2. SPOTLIGHT: Deliverables Ready for Review */}
      {spotlightItem && (
        <div className="rounded-3xl border border-blue-300/80 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white p-5 sm:p-7 shadow-xl shadow-blue-600/5 dark:border-blue-500/30 dark:from-[#0D182E]/90 dark:via-[#091124]/90 dark:to-[#070B14] backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {spotlightItem.milestone.status === "awaiting_client_approval"
                    ? "Action Required • Deliverables Ready for Client Review"
                    : "Action Required • Approved Milestone Ready for PayPal Payout"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  {spotlightItem.project.title}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Stage 0{spotlightItem.milestone.stageNumber}: {spotlightItem.milestone.title}
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {spotlightItem.milestone.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Gemini AI Score: {spotlightItem.milestone.latestAudit?.overallScore || 94}%
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300 font-bold font-mono">
                  Milestone Escrow: ${spotlightItem.milestone.amount.toLocaleString()} USD
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Freelancer: <span className="font-semibold text-slate-800 dark:text-white">{spotlightItem.project.freelancer.name}</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onOpenAudit(spotlightItem.project, spotlightItem.milestone)}
                className="btn-gradient-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Inspect AI Report & Deliverables</span>
              </button>

              {spotlightItem.milestone.status === "awaiting_client_approval" && (
                <button
                  type="button"
                  onClick={() => onOpenRevision(spotlightItem.project, spotlightItem.milestone)}
                  className="px-4 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-200 dark:hover:bg-amber-900/40 text-xs font-bold cursor-pointer transition-colors"
                >
                  Request Revision
                </button>
              )}

              {spotlightItem.milestone.status === "payment_pending" && (
                <button
                  type="button"
                  onClick={() => onOpenPayPal(spotlightItem.project, spotlightItem.milestone)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PayPalIcon className="h-3.5 w-3.5" />
                  <span>Release PayPal Payout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Project Contracts Portfolio */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Project Contracts ({filteredProjects.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any project to open its comprehensive milestone workspace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterStatus === "all"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("active")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterStatus === "active"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("completed")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterStatus === "completed"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Completed
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenNewProject}
              className="btn-gradient-glow inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#004C8F] to-[#0070BA] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Contract</span>
            </button>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const progress = Math.round((project.escrowReleased / project.totalBudget) * 100);
            const paidStages = project.milestones.filter((m) => m.status === "paid").length;
            const inReviewStage = project.milestones.find((m) => m.status === "awaiting_client_approval");

            return (
              <div
                key={project.id}
                className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0070BA] dark:bg-blue-900/30 dark:text-sky-300">
                      {project.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      ${project.totalBudget.toLocaleString()} USD
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Freelancer & Deadline Row */}
                <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {project.freelancer.avatar}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[140px]">
                      {project.freelancer.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Target: {project.targetDeadline}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      {paidStages} of {project.milestones.length} Stages Paid
                    </span>
                    <span className="font-bold text-[#0070BA] dark:text-sky-300">
                      {progress}% Released
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                    {inReviewStage && (
                      <div
                        className="bg-[#0070BA] animate-pulse transition-all duration-500"
                        style={{
                          width: `${Math.round((inReviewStage.amount / project.totalBudget) * 100)}%`,
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Footer Open Workspace */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Escrow Locked:{" "}
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                      ${(project.escrowFunded - project.escrowReleased).toLocaleString()}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveProjectId(project.id);
                      setActiveTab("projects");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0070BA] dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
