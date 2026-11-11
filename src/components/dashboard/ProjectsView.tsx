"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { ProjectContract, Milestone, getFriendlyProjectStatus, isProjectCompleted, isProjectAccepted, formatCurrency } from "@/lib/dashboard-data";
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
  FolderGit2,
} from "lucide-react";
import CompletedProjectModal from "./CompletedProjectModal";
import ProposalReviewModal from "./ProposalReviewModal";

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
  const { projects, role, searchQuery, setActiveTab } = useDashboard();
  const [filterTab, setFilterTab] = useState<"all" | "active" | "incoming" | "completed">("all");
  const [selectedCompletedProject, setSelectedCompletedProject] = useState<ProjectContract | null>(null);
  const [selectedReviewProject, setSelectedReviewProject] = useState<ProjectContract | null>(null);

  // Incoming proposals awaiting action from current role
  const incomingProjects = projects.filter(
    (p) =>
      (p.status === "awaiting_acceptance" || p.status === "changes_requested") &&
      p.initiatedBy !== role
  );
  const incomingPendingCount = incomingProjects.length;

  // Strictly filter to accepted projects only. Pending proposals/requests belong in Project Requests.
  const acceptedProjects = projects.filter(isProjectAccepted);

  const filteredProjects = acceptedProjects.filter((p) => {
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

  const completedProjects = filteredProjects.filter((p) => isProjectCompleted(p));
  const activeProjects = filteredProjects.filter(
    (p) => !isProjectCompleted(p) && p.status === "active"
  );

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

      {/* Notice for pending proposals requiring action */}
      {incomingPendingCount > 0 && (
        <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-700/80 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              You have <strong>{incomingPendingCount} pending project request{incomingPendingCount > 1 ? "s" : ""}</strong> awaiting review in <strong>Project Requests</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("project-requests")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer text-xs transition-colors shrink-0 shadow-2xs self-start sm:self-auto"
          >
            <span>Review in Project Requests</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/50 dark:bg-emerald-950/60 dark:text-emerald-300">
            {completedProjects.length}
          </span>
        </button>

        {incomingProjects.length > 0 && (
          <button
            type="button"
            onClick={() => setFilterTab("incoming")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === "incoming"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-100/70 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300/80 dark:border-amber-800/60"
            }`}
          >
            <span>Incoming Requests</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {incomingProjects.length}
            </span>
          </button>
        )}
      </div>

      {/* DEDICATED INCOMING REQUESTS CARDS */}
      {incomingProjects.length > 0 && (filterTab === "all" || filterTab === "incoming") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span>Incoming Project Proposals</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {incomingProjects.length} Action Required
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab("project-requests")}
              className="text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage in Project Requests</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {incomingProjects.map((project) => {
              const proposer = project.initiatedBy === "client" ? project.client : project.freelancer;
              return (
                <div
                  key={project.id}
                  className="p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-[#0D1527] dark:to-amber-950/10 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {proposer.avatar || proposer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            {project.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            Awaiting Your Acceptance
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          From: <strong>{proposer.name}</strong> ({proposer.milestoneOSId || "Client"})
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Budget</span>
                      <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                        {formatCurrency(project.totalBudget, project.currency)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                      <span>Milestones: <strong>{project.milestones.length}</strong></span>
                      <span>Target Deadline: <strong>{project.targetDeadline}</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedReviewProject(project)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>Review & Accept Proposal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State for Zero Accepted Projects */}
      {filteredProjects.length === 0 && incomingProjects.length === 0 && (
        <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0D1527]/70 text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-blue-50 dark:bg-sky-950/40 text-[#0070BA] dark:text-sky-300 flex items-center justify-center font-bold">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {role === "client" ? "No active projects yet" : "No active freelance projects yet"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {role === "client"
                ? "Initiate a project proposal or check Project Requests. Once accepted, your projects will appear here."
                : "Check your Project Requests to review and accept incoming client proposals."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>{role === "client" ? "Create Project" : "Propose Project"}</span>
            </button>
            {incomingPendingCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("project-requests")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <span>View Project Requests ({incomingPendingCount})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
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
                          {formatCurrency(project.totalBudget, project.currency)}
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
                const totalSettled =
                  project.milestones
                    .filter((m) => m.status === "paid")
                    .reduce((sum, m) => sum + m.amount, 0) || project.totalPaid;

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
                            {formatCurrency(totalSettled, project.currency)}
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

      {/* PROPOSAL REVIEW MODAL */}
      <ProposalReviewModal
        project={selectedReviewProject}
        isOpen={!!selectedReviewProject}
        onClose={() => setSelectedReviewProject(null)}
      />

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

