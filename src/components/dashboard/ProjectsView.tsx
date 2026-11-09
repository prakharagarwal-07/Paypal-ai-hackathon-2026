"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { ProjectContract } from "@/lib/dashboard-data";
import { Plus, ArrowRight, User, Calendar, CheckCircle2 } from "lucide-react";

interface ProjectsViewProps {
  onOpenNewProject: () => void;
  onSelectProject: (projectId: string) => void;
}

export default function ProjectsView({ onOpenNewProject, onSelectProject }: ProjectsViewProps) {
  const { projects, role, searchQuery } = useDashboard();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Projects
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View active projects, milestone progress, and deadlines.
          </p>
        </div>

        {role === "client" && (
          <button
            type="button"
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer transition-colors shadow-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => {
          const completedCount = project.milestones.filter((m) => m.status === "paid").length;
          const progress = Math.round((completedCount / project.milestones.length) * 100);
          const otherPartyName = role === "client" ? project.freelancer.name : project.client.name;

          return (
            <div
              key={project.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              {/* Top: Name & Total Amount */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
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

                <button
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-[#0070BA] hover:text-white dark:hover:bg-[#0070BA] dark:hover:text-white text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <span>View Project</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
