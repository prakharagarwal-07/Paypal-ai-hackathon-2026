"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  ProjectContract,
  Milestone,
  MilestoneStatus,
  TransactionRecord,
  NotificationItem,
  INITIAL_PROJECTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRANSACTIONS,
  AIAssessment,
  MilestoneSubmission,
  ActivityItem,
} from "./dashboard-data";

export type DashboardTab =
  | "dashboard"
  | "projects"
  | "milestones"
  | "work-review"
  | "payments"
  // Legacy aliases
  | "overview"
  | "ai-audits";

export interface UserProfiles {
  client: {
    name: string;
    email: string;
    avatar: string;
    company: string;
  };
  freelancer: {
    name: string;
    email: string;
    avatar: string;
    title: string;
    rating: number;
  };
}

export const DEFAULT_USER_PROFILES: UserProfiles = {
  client: {
    name: "Sarah Chen",
    email: "sarah.chen@apexcommerce.com",
    avatar: "SC",
    company: "Apex Commerce",
  },
  freelancer: {
    name: "Rohan Verma",
    email: "rohan.verma@craftdev.io",
    avatar: "RV",
    title: "Senior Full-Stack Engineer",
    rating: 4.98,
  },
};

interface DashboardContextType {
  role: "client" | "freelancer";
  setRole: (role: "client" | "freelancer") => void;
  userProfiles: UserProfiles;
  updateUserProfile: (
    role: "client" | "freelancer",
    data: Partial<{ name: string; email: string; company?: string; title?: string }>
  ) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  projects: ProjectContract[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  activeProject: ProjectContract | undefined;
  transactions: TransactionRecord[];
  notifications: NotificationItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  toast: { message: string; type: "success" | "info" | "warning" } | null;
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
  hideToast: () => void;

  // Actions
  createProject: (
    newProject: Omit<
      ProjectContract,
      "id" | "createdAt" | "totalPaid" | "escrowFunded" | "escrowReleased" | "activityLog"
    >,
    asDraft?: boolean
  ) => string;
  updateProject: (projectId: string, updates: Partial<ProjectContract>) => void;
  archiveProject: (projectId: string) => void;
  acceptProposal: (projectId: string) => void;
  requestProposalChanges: (projectId: string, feedback: string) => void;
  rejectProposal: (projectId: string, reason?: string) => void;
  resubmitProposal: (projectId: string, updatedData: Partial<ProjectContract>) => void;
  submitMilestoneDeliverables: (
    projectId: string,
    milestoneId: string,
    deliverables: {
      demoUrl: string;
      githubRepo: string;
      githubPr?: string;
      loomVideo?: string;
      notes: string;
    },
    isRevision?: boolean
  ) => void;
  requestRevision: (projectId: string, milestoneId: string, reason: string) => void;
  requestChanges: (projectId: string, milestoneId: string, reason: string) => void;
  approveMilestone: (projectId: string, milestoneId: string) => void;
  releasePayPalPayment: (projectId: string, milestoneId: string) => string;
  makePayment: (projectId: string, milestoneId: string) => string;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToFactoryDefaults: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: "milestoneos_projects_v7",
  TRANSACTIONS: "milestoneos_transactions_v7",
  NOTIFICATIONS: "milestoneos_notifications_v7",
  ROLE: "milestoneos_role_v7",
  ACTIVE_TAB: "milestoneos_tab_v7",
  ACTIVE_PROJECT: "milestoneos_active_proj_v7",
  STATUS_FILTER: "milestoneos_status_filter_v7",
  PROFILES: "milestoneos_profiles_v7",
};

export function DashboardProvider({
  children,
  initialRole = "client",
}: {
  children: ReactNode;
  initialRole?: "client" | "freelancer";
}) {
  const [role, setRoleState] = useState<"client" | "freelancer">(initialRole);
  const [activeTab, setActiveTabState] = useState<DashboardTab>("dashboard");
  const [projects, setProjects] = useState<ProjectContract[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectIdState] = useState<string>("proj_online_store_2026");
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilterState] = useState<string>("all");
  const [userProfiles, setUserProfiles] = useState<UserProfiles>(DEFAULT_USER_PROFILES);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const setActiveTab = (tab: DashboardTab) => {
    // Map legacy alias IDs to new standard IDs
    const resolvedTab = tab === "overview" ? "dashboard" : tab === "ai-audits" ? "work-review" : tab;
    setActiveTabState(resolvedTab);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, resolvedTab);
    } catch (_) {}
  };

  const setStatusFilter = (filter: string) => {
    setStatusFilterState(filter);
    try {
      localStorage.setItem(STORAGE_KEYS.STATUS_FILTER, filter);
    } catch (_) {}
  };

  const updateUserProfile = (
    profileRole: "client" | "freelancer",
    data: Partial<{ name: string; email: string; company?: string; title?: string }>
  ) => {
    setUserProfiles((prev) => {
      const initials = (data.name || prev[profileRole].name)
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const updated = {
        ...prev,
        [profileRole]: {
          ...prev[profileRole],
          ...data,
          avatar: initials || prev[profileRole].avatar,
        },
      };

      try {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updated));
      } catch (_) {}

      return updated;
    });

    showToast("Profile settings updated successfully.", "success");
  };

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
      const savedActiveProj = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);
      const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as DashboardTab | null;
      const savedFilter = localStorage.getItem(STORAGE_KEYS.STATUS_FILTER);
      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);

      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedRole === "client" || savedRole === "freelancer") {
        setRoleState(savedRole);
      }
      if (savedActiveProj) {
        setActiveProjectIdState(savedActiveProj);
      }
      if (savedTab) {
        setActiveTabState(savedTab);
      }
      if (savedFilter) {
        setStatusFilterState(savedFilter);
      }
      if (savedProfiles) {
        setUserProfiles(JSON.parse(savedProfiles));
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, activeProjectId);
      localStorage.setItem(STORAGE_KEYS.STATUS_FILTER, statusFilter);
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(userProfiles));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [projects, transactions, notifications, role, activeTab, activeProjectId, statusFilter, userProfiles, isLoaded]);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const hideToast = () => setToast(null);

  const setRole = (newRole: "client" | "freelancer") => {
    setRoleState(newRole);
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, newRole);
    } catch (_) {}
    const actorName = userProfiles[newRole].name;
    showToast(
      `Switched to ${newRole === "client" ? `Client View (${actorName})` : `Freelancer View (${actorName})`}`,
      "info"
    );
  };

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, id);
    } catch (_) {}
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Action: Create Project / Propose Project
  const createProject = (
    newProjectData: Omit<
      ProjectContract,
      "id" | "createdAt" | "totalPaid" | "escrowFunded" | "escrowReleased" | "activityLog"
    >,
    asDraft: boolean = false
  ): string => {
    const id = `proj_${Date.now()}`;
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    const isClientInitiator = newProjectData.initiatedBy === "client";
    const senderName = isClientInitiator ? newProjectData.client.name : newProjectData.freelancer.name;
    const recipientName = isClientInitiator ? newProjectData.freelancer.name : newProjectData.client.name;
    const initialStatus = asDraft ? "draft" : "awaiting_acceptance";

    const newProject: ProjectContract = {
      ...newProjectData,
      id,
      createdAt: now,
      totalPaid: 0,
      escrowFunded: 0,
      escrowReleased: 0,
      status: initialStatus,
      proposalStatus: asDraft ? "draft" : "awaiting_acceptance",
      termsAgreed: false,
      activityLog: [
        {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: senderName,
          actorRole: isClientInitiator ? "client" : "freelancer",
          action: asDraft
            ? `Created draft project "${newProjectData.title}" ($${newProjectData.totalBudget.toLocaleString()} USD).`
            : `${senderName} submitted project proposal "${newProjectData.title}" to ${recipientName} for acceptance.`,
        },
      ],
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectIdState(id);

    if (!asDraft) {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        timestamp: "Just now",
        title: isClientInitiator ? "New Project Initiated" : "New Project Proposal",
        message: `${senderName} sent a project proposal for "${newProject.title}" ($${newProject.totalBudget.toLocaleString()} USD).`,
        type: "system",
        unread: true,
        projectId: id,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    showToast(
      asDraft
        ? `Draft "${newProject.title}" saved.`
        : `Proposal "${newProject.title}" sent to ${recipientName}!`,
      "success"
    );
    return id;
  };

  // Action: Accept Proposal
  const acceptProposal = (projectId: string) => {
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const accepterName = role === "client" ? project.client.name : project.freelancer.name;

        // Activate milestones: stage 1 becomes in_progress, others not_started
        const updatedMilestones = project.milestones.map((m, idx) => ({
          ...m,
          status: idx === 0 ? ("in_progress" as const) : ("not_started" as const),
        }));

        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: accepterName,
          actorRole: role,
          action: `${accepterName} accepted the project proposal. The agreement is now active and binding.`,
        };

        return {
          ...project,
          status: "active" as const,
          proposalStatus: "accepted" as const,
          acceptedAt: nowStr,
          termsAgreed: true,
          milestones: updatedMilestones,
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );

    const project = projects.find((p) => p.id === projectId);
    const projTitle = project?.title || "Project";

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "Proposal Accepted & Contract Active",
      message: `The project "${projTitle}" has been accepted. Work on agreed milestones may now begin.`,
      type: "approval",
      unread: true,
      projectId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Proposal accepted! Contract "${projTitle}" is now active.`, "success");
  };

  // Action: Request Changes on Proposal
  const requestProposalChanges = (projectId: string, feedback: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const requesterName = role === "client" ? project.client.name : project.freelancer.name;

        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: requesterName,
          actorRole: role,
          action: `${requesterName} requested changes to the project proposal: "${feedback}".`,
        };

        return {
          ...project,
          status: "changes_requested" as const,
          proposalStatus: "changes_requested" as const,
          proposalFeedback: feedback,
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );

    const project = projects.find((p) => p.id === projectId);
    const projTitle = project?.title || "Project";

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "Proposal Changes Requested",
      message: `Changes requested on proposal "${projTitle}": ${feedback}`,
      type: "revision",
      unread: true,
      projectId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast("Feedback sent. Proposal marked as Changes Requested.", "info");
  };

  // Action: Reject Proposal
  const rejectProposal = (projectId: string, reason?: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const declinerName = role === "client" ? project.client.name : project.freelancer.name;

        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: declinerName,
          actorRole: role,
          action: `${declinerName} declined the project proposal${reason ? `: "${reason}"` : "."}`,
        };

        return {
          ...project,
          status: "rejected" as const,
          proposalStatus: "rejected" as const,
          proposalFeedback: reason,
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );

    showToast("Project proposal declined.", "info");
  };

  // Action: Resubmit Revised Proposal
  const resubmitProposal = (projectId: string, updatedData: Partial<ProjectContract>) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const senderName = role === "client" ? project.client.name : project.freelancer.name;

        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: senderName,
          actorRole: role,
          action: `${senderName} revised and resubmitted the project proposal for acceptance.`,
        };

        return {
          ...project,
          ...updatedData,
          status: "awaiting_acceptance" as const,
          proposalStatus: "awaiting_acceptance" as const,
          proposalFeedback: undefined,
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );

    const project = projects.find((p) => p.id === projectId);
    const projTitle = project?.title || "Project";

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "Revised Proposal Submitted",
      message: `Revised proposal submitted for "${projTitle}". Ready for review.`,
      type: "submission",
      unread: true,
      projectId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Revised proposal for "${projTitle}" submitted!`, "success");
  };

  // Action: Update Project
  const updateProject = (projectId: string, updates: Partial<ProjectContract>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
    showToast("Project details updated.", "info");
  };

  // Action: Archive Project
  const archiveProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "archived" as const } : p))
    );
    showToast("Project moved to archive.", "info");
  };

  // Action: Submit Milestone Deliverables
  const submitMilestoneDeliverables = (
    projectId: string,
    milestoneId: string,
    deliverables: {
      demoUrl: string;
      githubRepo: string;
      githubPr?: string;
      loomVideo?: string;
      notes: string;
    },
    isRevision: boolean = false
  ) => {
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;

          const submissionVersion = m.submissions.length + 1;

          const simpleAudit: AIAssessment = {
            overallScore: isRevision ? 98 : 95,
            summary: isRevision
              ? "Automated review checked the revised work against the requested changes. All requirements met."
              : "Automated review checked the submitted links and files against milestone requirements. Requirements appear satisfied.",
            status: "approved",
            verifiedAt: nowStr,
            isDemonstration: true,
            criteria: m.acceptanceCriteria.map((crit) => ({
              ...crit,
              status: "met",
              evidence: "Checked against submitted links: requirement verified.",
              aiNotes: "Requirement appears satisfied.",
            })),
            automatedChecks: [
              { name: "Website link responds", passed: true, detail: "Link opens successfully" },
              { name: "Code repository accessible", passed: true, detail: "Code verified" },
            ],
          };

          const newSubmission: MilestoneSubmission = {
            id: `sub_${Date.now()}`,
            version: submissionVersion,
            submittedAt: nowStr,
            submittedBy: project.freelancer.name,
            demoUrl: deliverables.demoUrl,
            githubRepo: deliverables.githubRepo,
            githubPr: deliverables.githubPr,
            loomVideo: deliverables.loomVideo,
            notes: deliverables.notes,
            aiAssessment: simpleAudit,
          };

          return {
            ...m,
            status: "submitted" as MilestoneStatus,
            submissions: [...m.submissions, newSubmission],
            latestAudit: simpleAudit,
          };
        });

        const targetMilestone = project.milestones.find((m) => m.id === milestoneId);

        return {
          ...project,
          milestones: updatedMilestones,
          activityLog: [
            {
              id: `act_${Date.now()}`,
              timestamp: "Just now",
              actor: project.freelancer.name,
              actorRole: "freelancer",
              action: isRevision
                ? `Resubmitted revised work for Milestone ${targetMilestone?.stageNumber}: "${targetMilestone?.title}"`
                : `Submitted work for Milestone ${targetMilestone?.stageNumber}: "${targetMilestone?.title}"`,
              milestoneTitle: targetMilestone?.title,
            },
            ...project.activityLog,
          ],
        };
      })
    );

    const targetProj = projects.find((p) => p.id === projectId);
    const targetM = targetProj?.milestones.find((m) => m.id === milestoneId);

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: isRevision ? "Revised Work Submitted" : "Work Submitted for Review",
      message: `${targetProj?.freelancer.name} submitted work for Milestone ${targetM?.stageNumber}: "${targetM?.title}".`,
      type: "submission",
      unread: true,
      projectId,
      milestoneId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      isRevision
        ? "Revised work submitted! Client notified to review."
        : "Work submitted! The client has been notified to review.",
      "success"
    );
  };

  // Action: Request Changes (Client)
  const requestRevision = (projectId: string, milestoneId: string, reason: string) => {
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;

          const updatedSubmissions = m.submissions.map((sub, idx) => {
            if (idx === m.submissions.length - 1) {
              return {
                ...sub,
                revisionRequest: {
                  requestedAt: nowStr,
                  reason,
                  requestedBy: project.client.name,
                },
              };
            }
            return sub;
          });

          return {
            ...m,
            status: "changes_requested" as MilestoneStatus,
            submissions: updatedSubmissions,
          };
        });

        const targetMilestone = project.milestones.find((m) => m.id === milestoneId);

        return {
          ...project,
          milestones: updatedMilestones,
          activityLog: [
            {
              id: `act_${Date.now()}`,
              timestamp: "Just now",
              actor: project.client.name,
              actorRole: "client",
              action: `Requested changes on Milestone ${targetMilestone?.stageNumber}: "${targetMilestone?.title}"`,
              details: reason,
              milestoneTitle: targetMilestone?.title,
            },
            ...project.activityLog,
          ],
        };
      })
    );

    const targetProj = projects.find((p) => p.id === projectId);
    const targetM = targetProj?.milestones.find((m) => m.id === milestoneId);

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "Changes Requested",
      message: `${targetProj?.client.name} requested changes on Milestone ${targetM?.stageNumber}: "${targetM?.title}".`,
      type: "revision",
      unread: true,
      projectId,
      milestoneId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast("Change request sent to the freelancer.", "info");
  };

  const requestChanges = requestRevision;

  // Action: Approve Milestone (Client)
  const approveMilestone = (projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          return {
            ...m,
            status: "approved" as MilestoneStatus,
          };
        });

        const targetMilestone = project.milestones.find((m) => m.id === milestoneId);

        return {
          ...project,
          milestones: updatedMilestones,
          activityLog: [
            {
              id: `act_${Date.now()}`,
              timestamp: "Just now",
              actor: project.client.name,
              actorRole: "client",
              action: `Approved Milestone ${targetMilestone?.stageNumber}: "${targetMilestone?.title}" (Ready for Payment)`,
              milestoneTitle: targetMilestone?.title,
            },
            ...project.activityLog,
          ],
        };
      })
    );

    const targetProj = projects.find((p) => p.id === projectId);
    const targetM = targetProj?.milestones.find((m) => m.id === milestoneId);

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "Milestone Approved",
      message: `Milestone ${targetM?.stageNumber} was approved by ${targetProj?.client.name}. Payment of $${targetM?.amount.toLocaleString()} USD is now ready.`,
      type: "approval",
      unread: true,
      projectId,
      milestoneId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Milestone approved! $${targetM?.amount.toLocaleString()} is now ready for payment.`, "success");
  };

  // Action: Make Payment via PayPal Sandbox (Client)
  const releasePayPalPayment = (projectId: string, milestoneId: string): string => {
    const txId = `PAYID-SBX-${Math.floor(100000 + Math.random() * 900000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let paidAmount = 0;
    let milestoneTitle = "";
    let freelancerName = "";
    let clientName = "";
    let projectTitle = "";

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        projectTitle = project.title;
        freelancerName = project.freelancer.name;
        clientName = project.client.name;

        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          paidAmount = m.amount;
          milestoneTitle = m.title;
          return {
            ...m,
            status: "paid" as MilestoneStatus,
            paidAt: nowStr,
            paypalTransactionId: txId,
          };
        });

        return {
          ...project,
          totalPaid: project.totalPaid + paidAmount,
          escrowReleased: project.escrowReleased + paidAmount,
          milestones: updatedMilestones,
          activityLog: [
            {
              id: `act_${Date.now()}`,
              timestamp: "Just now",
              actor: project.client.name,
              actorRole: "paypal",
              action: `Completed payment of $${paidAmount.toLocaleString()} USD via PayPal Sandbox (Receipt: ${txId})`,
              milestoneTitle,
            },
            ...project.activityLog,
          ],
        };
      })
    );

    // Record transaction
    const newTx: TransactionRecord = {
      id: `tx_${Date.now()}`,
      milestoneId,
      milestoneTitle,
      projectId,
      projectTitle,
      amount: paidAmount,
      currency: "USD",
      paidAt: nowStr,
      paypalTransactionId: txId,
      status: "completed",
      isSimulated: true,
      payer: `${clientName} (Apex Commerce)`,
      payee: freelancerName,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "Payment Completed",
      message: `$${paidAmount.toLocaleString()} USD paid to ${freelancerName} via PayPal Sandbox (${txId}).`,
      type: "payment",
      unread: true,
      projectId,
      milestoneId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      `Payment of $${paidAmount.toLocaleString()} USD completed via PayPal Sandbox! Transaction: ${txId}`,
      "success"
    );

    return txId;
  };

  const makePayment = releasePayPalPayment;

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const resetToFactoryDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.ROLE);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT);
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
    setProjects(INITIAL_PROJECTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveProjectIdState("proj_online_store_2026");
    setRoleState("client");
    setActiveTabState("dashboard");
    showToast("Dashboard reset to initial demonstration state.", "info");
  };

  return (
    <DashboardContext.Provider
      value={{
        role,
        setRole,
        userProfiles,
        updateUserProfile,
        activeTab,
        setActiveTab,
        projects,
        activeProjectId,
        setActiveProjectId,
        activeProject,
        transactions,
        notifications,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        toast,
        showToast,
        hideToast,
        createProject,
        updateProject,
        archiveProject,
        acceptProposal,
        requestProposalChanges,
        rejectProposal,
        resubmitProposal,
        submitMilestoneDeliverables,
        requestRevision,
        requestChanges,
        approveMilestone,
        releasePayPalPayment,
        makePayment,
        markNotificationRead,
        clearAllNotifications,
        resetToFactoryDefaults,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
