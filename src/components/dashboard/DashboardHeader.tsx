"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { User, Briefcase, Plus, Bell, Search, Menu } from "lucide-react";

interface DashboardHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenNewProject: () => void;
}

export default function DashboardHeader({
  onToggleMobileSidebar,
  onOpenNotifications,
  onOpenNewProject,
}: DashboardHeaderProps) {
  const {
    role,
    setRole,
    searchQuery,
    setSearchQuery,
    notifications,
  } = useDashboard();

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3 dark:border-white/10 dark:bg-[#070B14]/90 transition-colors">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Menu + Search */}
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects and milestones..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 focus:border-[#0070BA] transition-all"
            />
          </div>
        </div>

        {/* Center: Clear, Understandable Role Switcher */}
        <div className="flex items-center">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-[#0e1628]">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === "client"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-[#0070BA] dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Client (Sarah)</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("freelancer")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === "freelancer"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-emerald-600 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Freelancer (Rohan)</span>
            </button>
          </div>
        </div>

        {/* Right: PayPal Sandbox status, Notifications, New Project */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PayPal Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 dark:bg-[#0070BA]/10 dark:border-blue-500/20 text-[11px] font-medium text-[#0070BA] dark:text-sky-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>PayPal Connected</span>
          </div>

          {/* Notifications */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#0070BA] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Project Initiation Action (Both Roles) */}
          <button
            type="button"
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold shadow-xs hover:bg-[#005a96] cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {role === "client" ? "Create Project" : "Propose Project"}
            </span>
            <span className="sm:hidden">
              {role === "client" ? "New" : "Propose"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
