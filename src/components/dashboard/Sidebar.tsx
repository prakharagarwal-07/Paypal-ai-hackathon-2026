"use client";

import Link from "next/link";
import { useDashboard, DashboardTab } from "@/lib/dashboard-store";
import ThemeToggle from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  FolderGit2,
  Layers,
  Sparkles,
  Wallet,
  ArrowLeft,
  RotateCcw,
  User,
  Briefcase,
  ChevronDown,
  X,
  Plus,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNewProject: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile, onOpenNewProject }: SidebarProps) {
  const {
    role,
    activeTab,
    setActiveTab,
    projects,
    activeProjectId,
    setActiveProjectId,
    resetToFactoryDefaults,
  } = useDashboard();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const navItems: { id: DashboardTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: "projects",
      label: "Project Workspace",
      icon: <FolderGit2 className="h-4 w-4" />,
      badge: projects.length,
    },
    {
      id: "milestones",
      label: "Milestones",
      icon: <Layers className="h-4 w-4" />,
      badge: activeProject?.milestones.length || 0,
    },
    {
      id: "ai-audits",
      label: "AI Work-Assessment",
      icon: <Sparkles className="h-4 w-4" />,
      badge: "Gemini",
    },
    {
      id: "payments",
      label: "PayPal Escrow & Ledger",
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white/95 dark:bg-[#070B14]/95 border-r border-slate-200/80 dark:border-white/10 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Section: Brand & Project Selector */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col overflow-y-auto">
          {/* Logo & Close */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-white font-bold shadow-md shadow-blue-600/25 group-hover:scale-105 transition-all">
                <span className="text-sm font-extrabold tracking-tight">M</span>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#004C8F] border border-white dark:border-[#0B0F19] flex items-center justify-center">
                  <span className="text-[6px] text-white font-black leading-none">P</span>
                </div>
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Milestone<span className="text-[#0070BA] dark:text-[#38BDF8]">OS</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-medium -mt-1">
                  FinTech Escrow System
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

          {/* Quick Active Project Switcher */}
          <div className="mt-4 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Active Contract
            </label>
            <button
              type="button"
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left cursor-pointer group"
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activeProject?.title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  ${activeProject?.totalBudget.toLocaleString()} USD • {activeProject?.milestones.length} Milestones
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                  projectDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {projectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] shadow-xl p-1.5 divide-y divide-slate-100 dark:divide-white/5">
                <div className="space-y-1 pb-1">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        setActiveProjectId(proj.id);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
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

                {role === "client" && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProjectDropdownOpen(false);
                        onOpenNewProject();
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs font-bold text-[#0070BA] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-[#0070BA]/10 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Create New Contract</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2">
              Workspace Navigation
            </span>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#004C8F] to-[#0070BA] text-white shadow-md shadow-blue-600/20 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? "text-white" : "text-[#0070BA] dark:text-sky-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200/70 text-slate-700 dark:bg-white/10 dark:text-slate-300"
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
        <div className="p-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
          {/* Active User Card */}
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-xs mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                  role === "client" ? "bg-[#0070BA]" : "bg-emerald-600"
                }`}
              >
                {role === "client" ? "SC" : "RV"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {role === "client" ? "Sarah Chen" : "Rohan Verma"}
                </p>
                <span
                  className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                    role === "client"
                      ? "bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                  }`}
                >
                  {role === "client" ? "Client (Hiring)" : "Freelancer (Building)"}
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Landing Page</span>
            </Link>

            <button
              type="button"
              onClick={resetToFactoryDefaults}
              title="Reset all projects and transactions to factory demo state"
              className="hover:text-[#0070BA] dark:hover:text-sky-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
