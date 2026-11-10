"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { ProjectContract, Milestone, getFriendlyProjectStatus } from "@/lib/dashboard-data";
import {
  Plus,
  ArrowRight,
  User,
  Calendar,
  CheckCircle2,
  DollarSign,
  Receipt,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import CompletedProjectModal from "./CompletedProjectModal";

interface ProjectsViewProps {
  onOpenNewProject: () => void;
  onSelectProject: (projectId: string) => void;
  onOpenInvoice?: (project: ProjectContract, milestone: Milestone, transactionId?: string) => void;
}

export default function ProjectsView({
  onOpenNewProject,
  onSelectProject,
  onOpenInvoice,
}: ProjectsViewProps) {
  const { projects, role, searchQuery } = useDashboard();
  const [filterTab, setFilterTab] = useState<"all" | "active" | "proposals" | "completed">("all");
  const [selectedCompletedProject, setSelectedCompletedProject] = useState<ProjectContract | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.freelancer.name.toLowerCase().includes(q) ||
        p.client.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const proposalProjects = filteredProjects.filter(
    (p) =>
      p.status === "awaiting_acceptance" ||
      p.status === "changes_requested" ||
      p.status === "draft"
  );
  const activeProjects = filteredProjects.filter((p) => p.status === "active");
  const completedProjects = filteredProjects.filter((p) => p.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Projects
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View active projects in progress, milestone status, and completed projects with settlement records.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{role === "client" ? "Create Project" : "Propose Project"}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTab === "all"
              ? "bg-[#0070BA] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          All Projects ({filteredProjects.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("proposals")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterTab === "proposals"
              ? "bg-amber-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>Proposals & Pending</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/50 dark:bg-amber-900/50">
            {proposalProjects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("active")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterTab === "active"
              ? "bg-[#0070BA] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>Active</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-200/50 dark:bg-sky-900/50">
            {activeProjects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("completed")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterTab === "completed"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>Completed</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/50 dark:bg-emerald-900/50">
            {completedProjects.length}
          </span>
        </button>
      </div>

      {/* PROPOSALS & PENDING AGREEMENTS */}
      {(filterTab === "all" || filterTab === "proposals") && proposalProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Proposals & Pending Agreements</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {proposalProjects.length} pending
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Project proposals awaiting mutual agreement or revision before work can begin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposalProjects.map((project) => {
              const statusInfo = getFriendlyProjectStatus(project.status, project.initiatedBy, role);
              const otherPartyName = role === "client" ? project.freelancer.name : project.client.name;
              const initiatorName =
                project.initiatedBy === "client" ? project.client.name : project.freelancer.name;
              const isSender = role === project.initiatedBy;

              return (
                <div
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectProject(project.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectProject(project.id);
                    }
                  }}
                  className={`group p-5 rounded-2xl border bg-white dark:bg-[#0D1527] space-y-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl text-left ${
                    statusInfo.isActionNeededForMe
                      ? "border-amber-300 dark:border-amber-700/80 ring-2 ring-amber-300/30"
                      : "border-slate-200 dark:border-white/10"
                  }`}
                >
                  {/* Top: Name & Total Amount */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Initiated by: <strong className="text-slate-700 dark:text-slate-300">{initiatorName}</strong>
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0070BA] dark:group-hover:text-sky-300 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {role === "client" ? "Freelancer: " : "Client: "}
                          <strong className="text-slate-800 dark:text-slate-200 font-semibold">{otherPartyName}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-medium">Proposed Budget</span>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          ${project.totalBudget.toLocaleString()} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Milestones count & target deadline */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Target: {project.targetDeadline}</span>
                    </div>

                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {project.milestones.length} milestone stage{project.milestones.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                        statusInfo.isActionNeededForMe
                          ? "bg-amber-600 text-white hover:bg-amber-500"
                          : "bg-slate-100 dark:bg-white/10 group-hover:bg-[#0070BA] group-hover:text-white dark:group-hover:bg-[#0070BA] dark:group-hover:text-white text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span>
                        {statusInfo.isActionNeededForMe
                          ? "Review Proposal"
                          : isSender
                          ? "View Proposal"
                          : "View Details"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filterTab === "proposals" && proposalProjects.length === 0 && (
        <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0D1527]">
          No pending proposals found. All projects are active or completed.
        </div>
      )}

      {/* SECTION 1: ACTIVE PROJECTS */}
      {(filterTab === "all" || filterTab === "active") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Projects</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0070BA] dark:bg-blue-950/40 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                  {activeProjects.length} in progress
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Work currently under development with upcoming milestones.
              </p>
            </div>
          </div>

          {activeProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              No active projects found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProjects.map((project) => {
                const completedCount = project.milestones.filter((m) => m.status === "paid").length;
                const progress = Math.round((completedCount / project.milestones.length) * 100);
                const otherPartyName = role === "client" ? project.freelancer.name : project.client.name;

                return (
                  <div
                    key={project.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectProject(project.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectProject(project.id);
                      }
                    }}
                    className="group p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] space-y-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#0070BA]/50 dark:hover:border-sky-400/50 hover:shadow-xl hover:shadow-slate-900/5 dark:hover:shadow-black/20 active:translate-y-0 focus:outline-hidden focus:ring-2 focus:ring-[#0070BA]/40 text-left"
                  >
                    {/* Top: Name & Total Amount */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0070BA] dark:group-hover:text-sky-300 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {role === "client" ? "Freelancer: " : "Client: "}
                          <strong className="text-slate-800 dark:text-slate-200 font-semibold">{otherPartyName}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Amount</span>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          ${project.totalBudget.toLocaleString()} USD
                        </span>
                      </div>
                    </div>

                    {/* Progress & Next Deadline */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          {completedCount} of {project.milestones.length} milestones completed
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0070BA] dark:bg-sky-400 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer: Deadline, Status, and View Project Button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Next deadline: {project.targetDeadline}</span>
                      </div>

                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 group-hover:bg-[#0070BA] group-hover:text-white dark:group-hover:bg-[#0070BA] dark:group-hover:text-white text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
                      >
                        <span>View Project</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: COMPLETED PROJECTS (Dedicated Section) */}
      {(filterTab === "all" || filterTab === "completed") && (
        <div className="space-y-4 pt-4 border-t border-slate-200/70 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Completed Projects</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {completedProjects.length} 100% Settled
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fully delivered projects with complete payment records, important dates, and verified deliverables.
              </p>
            </div>

            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 self-start sm:self-auto">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Paid via PayPal Sandbox</span>
            </span>
          </div>

          {completedProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              No completed projects found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedProjects.map((project) => {
                const otherPartyName = role === "client" ? project.freelancer.name : project.client.name;

                return (
                  <div
                    key={project.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedCompletedProject(project)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedCompletedProject(project);
                      }
                    }}
                    className="group p-5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-white to-emerald-50/20 dark:border-emerald-900/40 dark:from-[#0D1527] dark:to-emerald-950/10 space-y-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 dark:hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/5 active:translate-y-0 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 text-left"
                  >
                    {/* Top Row: Title, Badge & Total Paid */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 mb-1.5">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Completed & 100% Paid</span>
                          </span>

                          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {role === "client" ? "Freelancer: " : "Client: "}
                            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{otherPartyName}</strong>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block font-medium">Total Paid</span>
                          <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                            ${project.totalPaid.toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Middle: Important Dates & Milestone completion */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-[11px] text-slate-400">Timeline:</span>
                        <span className="font-medium text-[11px]">
                          {project.createdAt} → {project.targetDeadline}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-[11px] text-slate-400">Milestones:</span>
                        <span className="font-semibold text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>All {project.milestones.length} stages paid via PayPal</span>
                        </span>
                      </div>
                    </div>

                    {/* Footer: View Details Action */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Completed: {project.targetDeadline}
                      </span>

                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500 text-xs font-bold transition-all shadow-2xs"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>View Payments & Details</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED PROJECT DETAILS MODAL */}
      <CompletedProjectModal
        project={selectedCompletedProject}
        isOpen={!!selectedCompletedProject}
        onClose={() => setSelectedCompletedProject(null)}
        onOpenInvoice={onOpenInvoice}
        onViewWorkspace={(projectId) => {
          setSelectedCompletedProject(null);
          onSelectProject(projectId);
        }}
      />
    </div>
  );
}

