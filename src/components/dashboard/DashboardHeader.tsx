"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { User, Briefcase, Plus, Bell, Search, Menu, ShieldCheck, Wallet } from "lucide-react";

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
    projects,
  } = useDashboard();

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Calculate total escrow across projects
  const totalEscrowFunded = projects.reduce((acc, p) => acc + p.escrowFunded, 0);
  const totalEscrowReleased = projects.reduce((acc, p) => acc + p.escrowReleased, 0);
  const totalEscrowLocked = totalEscrowFunded - totalEscrowReleased;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl px-4 sm:px-8 py-3 dark:border-white/10 dark:bg-[#070B14]/85 transition-colors">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Left side: Hamburger on mobile + Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts, milestones, criteria..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 focus:border-[#0070BA] transition-all"
            />
          </div>
        </div>

        {/* Center: ROLE SWITCHER (Client Sarah ⇋ Freelancer Rohan) */}
        <div className="flex items-center">
          <div className="flex items-center rounded-2xl border border-slate-200/90 bg-slate-100/90 p-1 dark:border-white/10 dark:bg-[#0e1628]/90 shadow-inner">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === "client"
                  ? "bg-white text-slate-900 shadow-md ring-1 ring-black/5 dark:bg-gradient-to-r dark:from-[#004C8F] dark:to-[#0070BA] dark:text-white dark:ring-0"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-300" />
              <span className="hidden md:inline">Client View</span>
              <span className="md:hidden">Client</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0070BA] dark:bg-white/20 dark:text-white font-mono">
                Sarah
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("freelancer")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === "freelancer"
                  ? "bg-white text-slate-900 shadow-md ring-1 ring-black/5 dark:bg-gradient-to-r dark:from-[#004C8F] dark:to-[#0070BA] dark:text-white dark:ring-0"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="hidden md:inline">Freelancer Workbench</span>
              <span className="md:hidden">Freelancer</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-white/20 dark:text-white font-mono">
                Rohan
              </span>
            </button>
          </div>
        </div>

        {/* Right side: PayPal Sandbox status, Escrow badge, Notifications, New Project */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PayPal Sandbox Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200/60 dark:bg-[#0070BA]/10 dark:border-blue-500/20 text-[11px] font-semibold text-[#0070BA] dark:text-sky-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">PayPal Sandbox v2</span>
          </div>

          {/* Escrow Balance Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-white/5 text-xs">
            <Wallet className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
            <span className="text-slate-500 dark:text-slate-400">Escrow Locked:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              ${totalEscrowLocked.toLocaleString()}
            </span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#0070BA] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* New Project Button (For Client) */}
          {role === "client" && (
            <button
              type="button"
              onClick={onOpenNewProject}
              className="btn-gradient-glow inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Contract</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
