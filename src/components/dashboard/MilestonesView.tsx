"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, MilestoneStatus } from "@/lib/dashboard-data";
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Upload,
  Receipt,
  ArrowRight,
  Filter,
} from "lucide-react";
import { PayPalIcon } from "./icons";

interface MilestonesViewProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
  onOpenSubmission: (project: ProjectContract, milestone: Milestone) => void;
  onOpenRevision: (project: ProjectContract, milestone: Milestone) => void;
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
}

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All Milestones" },
  { id: "awaiting_client_approval", label: "Awaiting Review" },
  { id: "revision_requested", label: "Revision Requested" },
  { id: "payment_pending", label: "Payment Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "paid", label: "Paid" },
  { id: "not_started", label: "Not Started" },
];

export default function MilestonesView({
  onOpenAudit,
  onOpenSubmission,
  onOpenRevision,
  onOpenPayPal,
}: MilestonesViewProps) {
  const { projects, role, searchQuery, setSearchQuery, setActiveProjectId, setActiveTab } =
    useDashboard();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const allMilestones = projects.flatMap((p) =>
    p.milestones.map((m) => ({ project: p, milestone: m }))
  );

  const filtered = allMilestones.filter(({ project, milestone }) => {
    if (selectedStatus !== "all" && milestone.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = milestone.title.toLowerCase().includes(q);
      const matchProject = project.title.toLowerCase().includes(q);
      const matchDesc = milestone.description.toLowerCase().includes(q);
      return matchTitle || matchProject || matchDesc;
    }
    return true;
  });

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case "paid":
        return {
          label: "Paid & Settled",
          classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
        };
      case "payment_pending":
        return {
          label: "Payment Pending",
          classes: "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300",
        };
      case "awaiting_client_approval":
        return {
          label: "Awaiting Client Review",
          classes: "bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300 animate-pulse",
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
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Milestones Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track and verify deliverable progression across all contract stages.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === f.id
                  ? "bg-[#0070BA] text-white shadow-xs font-bold"
                  : "bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Milestones Grid / List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-white/10 rounded-3xl">
            No milestones match your current filters.
          </div>
        ) : (
          filtered.map(({ project, milestone }) => {
            const statusInfo = getStatusBadge(milestone.status);

            return (
              <div
                key={milestone.id}
                className="p-5 rounded-3xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs hover:border-[#0070BA]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Stage 0{milestone.stageNumber}
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {project.title}
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.classes}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {milestone.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Due: {milestone.dueDate}</span>
                    <span>•</span>
                    <span>{milestone.acceptanceCriteria.length} Acceptance Criteria</span>
                    {milestone.latestAudit && (
                      <>
                        <span>•</span>
                        <span className="text-[#0070BA] dark:text-sky-300 font-bold flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI Score: {milestone.latestAudit.overallScore}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-white/5">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Escrow Payout
                    </span>
                    <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                      ${milestone.amount.toLocaleString()} USD
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role specific triggers */}
                    {role === "client" ? (
                      <>
                        {milestone.status === "awaiting_client_approval" && (
                          <button
                            type="button"
                            onClick={() => onOpenAudit(project, milestone)}
                            className="btn-gradient-glow px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#004C8F] to-[#0070BA] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Review Deliverables</span>
                          </button>
                        )}
                        {milestone.status === "payment_pending" && (
                          <button
                            type="button"
                            onClick={() => onOpenPayPal(project, milestone)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <PayPalIcon className="h-3.5 w-3.5" />
                            <span>Release Payout</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {(milestone.status === "in_progress" ||
                          milestone.status === "revision_requested") && (
                          <button
                            type="button"
                            onClick={() => onOpenSubmission(project, milestone)}
                            className="btn-gradient-glow px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#004C8F] to-[#0070BA] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>{milestone.status === "revision_requested" ? "Resubmit" : "Submit"}</span>
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setActiveProjectId(project.id);
                        setActiveTab("projects");
                      }}
                      className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      title="Open in Project Workspace"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
