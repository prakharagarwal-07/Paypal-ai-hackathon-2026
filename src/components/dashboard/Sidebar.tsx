"use client";

import Link from "next/link";
import { useDashboard, DashboardTab } from "@/lib/dashboard-store";
import ThemeToggle from "@/components/ThemeToggle";
import EditProfileModal from "./EditProfileModal";
import {
  LayoutDashboard,
  FolderGit2,
  Layers,
  Sparkles,
  Wallet,
  ArrowLeft,
  ChevronDown,
  X,
  Plus,
  Settings,
  Send,
  Copy,
  Check,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { isProjectCompleted, isProjectAccepted, extractBaseCode, formatClientId, formatFreelancerId } from "@/lib/dashboard-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNewProject: () => void;
  onSelectProject?: (projectId: string) => void;
}

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
  onOpenNewProject,
  onSelectProject,
}: SidebarProps) {
  const {
    role,
    userProfiles,
    activeTab,
    setActiveTab,
    projects,
    activeProjectId,
    setActiveProjectId,
    authUser,
  } = useDashboard();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const acceptedProjects = projects.filter(isProjectAccepted);
  const activeProjectsList = acceptedProjects.filter((p) => !isProjectCompleted(p));
  const completedProjectsList = acceptedProjects.filter((p) => isProjectCompleted(p));

  const activeProject =
    acceptedProjects.find((p) => p.id === activeProjectId) ||
    activeProjectsList[0] ||
    completedProjectsList[0] ||
    undefined;

  const currentProfile = userProfiles[role];

  const handleProjectSelect = (projectId: string) => {
    setActiveProjectId(projectId);
    setProjectDropdownOpen(false);
    onCloseMobile();
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      setActiveTab("projects");
    }
  };

  // Count incoming proposals awaiting action
  const incomingPendingCount = projects.filter(
    (p) =>
      (p.status === "awaiting_acceptance" || p.status === "changes_requested") &&
      p.initiatedBy !== role
  ).length;

  const [copiedType, setCopiedType] = useState<"client" | "freelancer" | null>(null);

  const baseCode =
    currentProfile.baseCode ||
    authUser?.baseCode ||
    extractBaseCode(currentProfile.milestoneOSId) ||
    "USER01";

  const clientFormattedId = currentProfile.clientId || formatClientId(baseCode);
  const freelancerFormattedId = currentProfile.freelancerId || formatFreelancerId(baseCode);

  const handleCopyId = (e: React.MouseEvent, textToCopy: string, type: "client" | "freelancer") => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Dedicated sections including Project Requests
  const navItems: { id: DashboardTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: "project-requests",
      label: "Project Requests",
      icon: <Send className="h-4 w-4" />,
      badge: incomingPendingCount > 0 ? `${incomingPendingCount}` : undefined,
    },
    {
      id: "projects",
      label: "My Projects",
      icon: <FolderGit2 className="h-4 w-4" />,
      badge: acceptedProjects.length > 0 ? acceptedProjects.length : undefined,
    },
    {
      id: "milestones",
      label: "Milestones",
      icon: <Layers className="h-4 w-4" />,
      badge: activeProject ? activeProject.milestones.length : undefined,
    },
    {
      id: "work-review",
      label: "Work Review",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: "payments",
      label: "Payments",
      icon: <Wallet className="h-4 w-4" />,
    },
  ];

  const handleNavClick = (tab: DashboardTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-[#070B14]/95 border-r border-slate-200/80 dark:border-white/10 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Brand & Project Selector */}
        <div className="p-4 flex-1 flex flex-col overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-white font-bold shadow-sm group-hover:scale-105 transition-all">
                <span className="text-sm font-extrabold tracking-tight">M</span>
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Milestone<span className="text-[#0070BA] dark:text-[#38BDF8]">OS</span>
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active Project Switcher */}
          <div className="mt-4 relative">
            <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">
              Active Project
            </label>
            {activeProject ? (
              <div className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left group">
                <button
                  type="button"
                  onClick={() => handleProjectSelect(activeProject.id)}
                  className="min-w-0 pr-2 flex-1 text-left cursor-pointer"
                  title="Open project workspace"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#0070BA] dark:group-hover:text-sky-300 transition-colors">
                      {activeProject.title}
                    </p>
                    {isProjectCompleted(activeProject) && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    ${activeProject.totalBudget.toLocaleString()} USD • {activeProject.milestones.length} Milestones
                  </p>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectDropdownOpen(!projectDropdownOpen);
                  }}
                  className="p-1.5 -mr-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                  title={projectDropdownOpen ? "Close project list" : "Switch active project"}
                  aria-label="Switch project dropdown"
                >
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      projectDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            ) : (
              <div className="w-full p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-left">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No Active Projects
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Accept a proposal to start
                </p>
              </div>
            )}

            {/* Dropdown Menu */}
            {projectDropdownOpen && acceptedProjects.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] shadow-xl p-1.5 divide-y divide-slate-100 dark:divide-white/5 max-h-72 overflow-y-auto">
                {/* Active Projects */}
                {activeProjectsList.length > 0 && (
                  <div className="space-y-1 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 block">
                      Active Projects
                    </span>
                    {activeProjectsList.map((proj) => (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => handleProjectSelect(proj.id)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          proj.id === activeProjectId
                            ? "bg-blue-50 dark:bg-[#0070BA]/20 text-[#0070BA] dark:text-sky-300 font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate">{proj.title}</span>
                        <span className="text-[10px] opacity-75 shrink-0 ml-1.5">
                          ${proj.totalBudget.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Completed Projects */}
                {completedProjectsList.length > 0 && (
                  <div className="space-y-1 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 flex items-center gap-1">
                      <span>Completed Projects</span>
                      <span className="text-[9px] px-1 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">
                        100% Paid
                      </span>
                    </span>
                    {completedProjectsList.map((proj) => (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => handleProjectSelect(proj.id)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          proj.id === activeProjectId
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate flex items-center gap-1">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{proj.title}</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 ml-1.5">
                          ${proj.totalBudget.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProjectDropdownOpen(false);
                      onCloseMobile();
                      onOpenNewProject();
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs font-bold text-[#0070BA] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-[#0070BA]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{role === "client" ? "Create Project" : "Propose Project"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === "dashboard" && activeTab === "overview") ||
                (item.id === "work-review" && activeTab === "ai-audits");

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0070BA] text-white font-bold shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
          {/* Active User Card with MilestoneOS ID */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-2xs mb-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-2 min-w-0 text-left hover:opacity-85 transition-opacity cursor-pointer flex-1"
                title="Click to edit profile"
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                    role === "client" ? "bg-[#0070BA]" : "bg-emerald-600"
                  }`}
                >
                  {currentProfile.avatar || (role === "client" ? "SC" : "RV")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                    <span>{currentProfile.name}</span>
                    <Settings className="h-2.5 w-2.5 text-slate-400 opacity-60" />
                  </p>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {role === "client"
                      ? (currentProfile as any).company || "Client"
                      : (currentProfile as any).title || "Freelancer"}
                  </span>
                </div>
              </button>
              <ThemeToggle />
            </div>

            {/* Permanent Role IDs (Shared Base Code for the Current Account) */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                <span>My Account IDs (Base: {baseCode})</span>
              </div>

              {role === "freelancer" ? (
                <>
                  {/* Primary Active ID: Freelancer */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wider">Freelancer:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 truncate">{freelancerFormattedId}</span>
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, freelancerFormattedId, "freelancer")}
                      className="p-1 rounded text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 cursor-pointer transition-colors"
                      title="Copy My Freelancer ID"
                    >
                      {copiedType === "freelancer" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {/* Secondary ID: Client (For when this user wants to hire someone) */}
                  <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Client (When hiring):</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300 truncate">{clientFormattedId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, clientFormattedId, "client")}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                      title="Copy My Client ID"
                    >
                      {copiedType === "client" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Primary Active ID: Client */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] uppercase font-bold text-[#0070BA] dark:text-sky-300 tracking-wider">Client:</span>
                      <span className="font-mono font-bold text-[#0070BA] dark:text-sky-300 truncate">{clientFormattedId}</span>
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-sky-200">Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, clientFormattedId, "client")}
                      className="p-1 rounded text-[#0070BA] hover:text-[#005a96] dark:text-sky-400 dark:hover:text-sky-200 cursor-pointer transition-colors"
                      title="Copy My Client ID"
                    >
                      {copiedType === "client" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {/* Secondary ID: Freelancer (For when this user works as freelancer) */}
                  <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Freelancer (When working):</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300 truncate">{freelancerFormattedId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, freelancerFormattedId, "freelancer")}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                      title="Copy My Freelancer ID"
                    >
                      {copiedType === "freelancer" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-1 border-t border-slate-100 dark:border-white/5">
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                try {
                  localStorage.removeItem("milestoneos_active_user_v8");
                  localStorage.removeItem("milestoneos_demo_mode");
                  localStorage.removeItem("milestoneos_role_v8");
                  localStorage.removeItem("milestoneos_projects_v7");
                  localStorage.removeItem("milestoneos_transactions_v7");
                } catch (_) {}
                if (isSupabaseConfigured() && supabase) {
                  try {
                    await supabase.auth.signOut();
                  } catch (_) {}
                }
                window.location.href = "/auth";
              }}
              className="hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Sign out or switch account"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
