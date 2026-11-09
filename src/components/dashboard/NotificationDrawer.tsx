"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { X, CheckCircle2, AlertCircle, Clock, Wallet, Bell, Sparkles, Check, FolderGit2 } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const {
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setActiveProjectId,
    setActiveTab,
    projects,
  } = useDashboard();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    markNotificationRead(notif.id);
    if (notif.projectId) {
      setActiveProjectId(notif.projectId);
      setActiveTab("projects");
    }
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
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

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 flex items-start gap-3 relative ${
                      notif.unread
                        ? "bg-blue-50/50 dark:bg-blue-900/10"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {notif.unread && (
                      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#0070BA] dark:bg-sky-400" />
                    )}
                    <div className="p-2 rounded-lg bg-white dark:bg-[#131C31] shadow-xs border border-slate-200/60 dark:border-white/10 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
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
                        {notif.message}
                      </p>
                      {notif.projectId && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="inline-flex items-center text-[10px] font-semibold text-[#0070BA] dark:text-sky-400 hover:underline">
                            View Milestone Workspace →
                          </span>
                        </div>
                      )}
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
