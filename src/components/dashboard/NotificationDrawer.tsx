"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { ProjectContract } from "@/lib/dashboard-data";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  Bell,
  Sparkles,
  Check,
  FolderGit2,
  FileText,
  ArrowRight,
} from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProposal?: (project: ProjectContract) => void;
  onSelectProject?: (projectId: string) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  onOpenProposal,
  onSelectProject,
}: NotificationDrawerProps) {
  const {
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setActiveProjectId,
    setActiveTab,
    projects,
    authUser,
  } = useDashboard();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleNotificationClick = async (notif: (typeof notifications)[0]) => {
    markNotificationRead(notif.id);
    const isProposal =
      notif.type === "proposal" ||
      notif.title.toLowerCase().includes("proposal");

    let project = notif.projectId ? projects.find((p) => p.id === notif.projectId) : null;
    if (!project && notif.projectId) {
      try {
        const res = await fetch(`/api/projects/${notif.projectId}?userId=${encodeURIComponent(authUser?.id || "")}`);
        const data = await res.json();
        if (data.success && data.project) {
          project = data.project;
        }
      } catch (_) {}
    }

    if (isProposal && project && onOpenProposal) {
      onOpenProposal(project);
    } else if (isProposal) {
      setActiveTab("project-requests");
    } else if (notif.projectId) {
      if (onSelectProject) {
        onSelectProject(notif.projectId);
      } else {
        setActiveProjectId(notif.projectId);
        setActiveTab("projects");
      }
    }
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "proposal":
        return <FileText className="h-4 w-4" />;
      case "submission":
        return <Sparkles className="h-4 w-4 text-[#0070BA] dark:text-sky-400" />;
      case "revision":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "approval":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "payment":
        return <Wallet className="h-4 w-4 text-emerald-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0D1527] border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-white/5 text-[#0070BA] dark:text-sky-400">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Activity & Alerts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All notifications read"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="text-xs text-slate-500 hover:text-[#0070BA] dark:text-slate-400 dark:hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <Check className="h-3 w-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 p-2">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => {
                const project = notif.projectId
                  ? projects.find((p) => p.id === notif.projectId)
                  : null;

                const isProposal =
                  notif.type === "proposal" ||
                  notif.title.toLowerCase().includes("proposal");

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
                      isProposal
                        ? "border-2 border-[#0070BA] dark:border-sky-400 bg-gradient-to-br from-blue-50/95 via-sky-50/50 to-white dark:from-sky-950/70 dark:via-[#0D1527] dark:to-[#0A1020] shadow-md shadow-blue-500/15 ring-1 ring-[#0070BA]/20 hover:shadow-xl hover:border-sky-500"
                        : notif.unread
                        ? "bg-blue-50/50 dark:bg-blue-900/10 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                        : "opacity-80 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {isProposal ? (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0070BA]" />
                        </span>
                      </div>
                    ) : notif.unread ? (
                      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#0070BA] dark:bg-sky-400" />
                    ) : null}

                    {isProposal && (
                      <div className="mb-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#0070BA] text-white shadow-2xs tracking-wide uppercase">
                          <Sparkles className="h-3 w-3" />
                          <span>Action Required • Project Proposal</span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 shadow-xs ${
                          isProposal
                            ? "bg-[#0070BA] text-white dark:bg-sky-500 shadow-md shadow-blue-600/30"
                            : "bg-white dark:bg-[#131C31] border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        {project && (
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 shadow-2xs">
                              <FolderGit2 className="h-2.5 w-2.5 text-[#0070BA] dark:text-sky-400" />
                              Project: {project.title}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {notif.timestamp}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {notif.message
                            .replace(/\s*\([^)]*(?:receipt|payid|transaction)[^)]*\)/gi, "")
                            .replace(/\s*\(Receipt:?\s*[^)]+\)/gi, "")
                            .replace(/\s*\(PAYID-[A-Za-z0-9\-_–—]+\)/gi, "")
                            .trim()}
                        </p>

                        {isProposal ? (
                          <div className="mt-3 pt-2.5 border-t border-[#0070BA]/15 dark:border-white/10 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              Terms & Milestones ready
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationRead(notif.id);
                                if (project && onOpenProposal) {
                                  onOpenProposal(project);
                                } else {
                                  setActiveTab("project-requests");
                                }
                                onClose();
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Review Proposal</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : notif.projectId ? (
                          <div className="mt-2 flex items-center justify-between">
                            <span className="inline-flex items-center text-[10px] font-semibold text-[#0070BA] dark:text-sky-400 hover:underline">
                              View Milestone Workspace →
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
