"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { User, Briefcase, Plus, Bell, Search, Menu, Copy, Check } from "lucide-react";

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
    userProfiles,
    isDemoMode,
    exitDemoMode,
    enterDemoMode,
  } = useDashboard();

  const [copiedId, setCopiedId] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const currentProfile = userProfiles[role];

  const handleCopyId = () => {
    if (currentProfile.milestoneOSId) {
      navigator.clipboard.writeText(currentProfile.milestoneOSId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

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

        {/* Center: Workspace Perspective Switcher (Same User, Dual View) */}
        <div className="flex items-center gap-2">
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
              <span>Client View</span>
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
              <span>Freelancer View</span>
            </button>
          </div>

          {/* Demo Mode Indicator & Switcher */}
          {isDemoMode ? (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
              <span>Demo Mode</span>
              <button
                type="button"
                onClick={exitDemoMode}
                className="underline hover:text-amber-900 dark:hover:text-white ml-0.5 cursor-pointer font-medium"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => enterDemoMode(role)}
              title="Launch sample demo projects for hackathon evaluation"
              className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-slate-300 dark:border-white/10 text-[11px] text-slate-400 hover:text-[#0070BA] hover:border-[#0070BA] dark:hover:text-sky-300 dark:hover:border-sky-400 transition-colors cursor-pointer"
            >
              <span>Demo Sandbox</span>
            </button>
          )}
        </div>

        {/* Right: User ID badge, PayPal Sandbox status, Notifications, New Project */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* MilestoneOS User ID Pill */}
          <button
            type="button"
            onClick={handleCopyId}
            title="Click to copy your MilestoneOS ID"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-[11px] font-mono cursor-pointer transition-colors"
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">My ID:</span>
            <span className="font-bold text-slate-800 dark:text-sky-300">
              {currentProfile.milestoneOSId || (role === "client" ? "MSO-7K4P92" : "MSO-2W8L41")}
            </span>
            {copiedId ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3 text-slate-400 hover:text-slate-700 dark:hover:text-white" />
            )}
          </button>

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
