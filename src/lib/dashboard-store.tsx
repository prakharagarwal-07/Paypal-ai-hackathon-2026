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
  DeliverableLink,
  DeliverableAttachment,
  MilestoneOSUser,
  MILESTONEOS_DIRECTORY,
  generateMilestoneOSId,
  generateInvitationToken,
  lookupMilestoneOSUser,
} from "./dashboard-data";

export type DashboardTab =
  | "dashboard"
  | "projects"
  | "project-requests"
  | "milestones"
  | "work-review"
  | "payments"
  // Legacy aliases
  | "overview"
  | "ai-audits";

export interface UserProfiles {
  client: {
    id: string;
    milestoneOSId: string;
    name: string;
    email: string;
    avatar: string;
    company: string;
  };
  freelancer: {
    id: string;
    milestoneOSId: string;
    name: string;
    email: string;
    avatar: string;
    title: string;
    rating: number;
  };
}

export const DEFAULT_USER_PROFILES: UserProfiles = {
  client: {
    id: "usr_client_sarah",
    milestoneOSId: "MSO-7K4P92",
    name: "Sarah Chen",
    email: "sarah.chen@apexcommerce.com",
    avatar: "SC",
    company: "Apex Commerce",
  },
  freelancer: {
    id: "usr_dev_rohan",
    milestoneOSId: "MSO-2W8L41",
    name: "Rohan Verma",
    email: "rohan.verma@craftdev.io",
    avatar: "RV",
    title: "Senior Full-Stack Engineer",
    rating: 4.98,
  },
};

export interface AlertState {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  isDestructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

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
  alertState: AlertState | null;
  showAlert: (options: {
    title?: string;
    message: string;
    type?: "info" | "warning" | "error" | "success";
    confirmText?: string;
    onConfirm?: () => void;
  }) => void;
  showConfirm: (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  closeAlert: () => void;

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
  revokeInvitation: (projectId: string) => void;
  acceptInvitationByToken: (
    token: string,
    claimingUser: {
      name: string;
      email: string;
      avatar: string;
      milestoneOSId: string;
      role: "client" | "freelancer";
      companyOrTitle?: string;
    }
  ) => { success: boolean; project?: ProjectContract; error?: string };
  lookupUserById: (id: string) => MilestoneOSUser | null;
  submitMilestoneDeliverables: (
    projectId: string,
    milestoneId: string,
    deliverables: {
      demoUrl?: string;
      githubRepo?: string;
      githubPr?: string;
      loomVideo?: string;
      notes: string;
      deliverableLinks?: DeliverableLink[];
      attachments?: DeliverableAttachment[];
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
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const showAlert = (options: {
    title?: string;
    message: string;
    type?: "info" | "warning" | "error" | "success";
    confirmText?: string;
    onConfirm?: () => void;
  }) => {
    setAlertState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || "warning",
      confirmText: options.confirmText || "OK",
      isConfirm: false,
      onConfirm: () => {
        setAlertState(null);
        if (options.onConfirm) options.onConfirm();
      },
    });
  };

  const showConfirm = (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setAlertState({
      isOpen: true,
      title: options.title || "Confirm Action",
      message: options.message,
      type: options.isDestructive ? "error" : "warning",
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel",
      isConfirm: true,
      isDestructive: options.isDestructive,
      onConfirm: () => {
        setAlertState(null);
        options.onConfirm();
      },
      onCancel: () => {
        setAlertState(null);
        if (options.onCancel) options.onCancel();
      },
    });
  };

  const closeAlert = () => setAlertState(null);

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
        const parsed = JSON.parse(savedProfiles);
        if (!parsed.client?.milestoneOSId) parsed.client.milestoneOSId = "MSO-7K4P92";
        if (!parsed.freelancer?.milestoneOSId) parsed.freelancer.milestoneOSId = "MSO-2W8L41";
        setUserProfiles(parsed);
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
    const senderProfile = isClientInitiator ? userProfiles.client : userProfiles.freelancer;
    const senderName = isClientInitiator ? newProjectData.client.name : newProjectData.freelancer.name;
    const recipientName = newProjectData.isPublicInvitation
      ? "Unassigned (Private Invitation Link)"
      : isClientInitiator
      ? newProjectData.freelancer.name
      : newProjectData.client.name;
    const initialStatus = asDraft ? "draft" : "awaiting_acceptance";

    const invToken = newProjectData.isPublicInvitation
      ? newProjectData.invitationToken || generateInvitationToken()
      : undefined;

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
      initiatorMilestoneOSId: senderProfile.milestoneOSId,
      invitationToken: invToken,
      invitationStatus: newProjectData.isPublicInvitation ? "active" : undefined,
      invitationExpiresAt: newProjectData.isPublicInvitation
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      activityLog: [
        {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: senderName,
          actorRole: isClientInitiator ? "client" : "freelancer",
          action: asDraft
            ? `Created draft project "${newProjectData.title}" ($${newProjectData.totalBudget.toLocaleString()} USD).`
            : newProjectData.isPublicInvitation
            ? `${senderName} created project proposal "${newProjectData.title}" and generated a private shareable invitation link.`
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
        type: "proposal",
        unread: true,
        projectId: id,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    showToast(
      asDraft
        ? `Draft "${newProject.title}" saved.`
        : newProjectData.isPublicInvitation
        ? `Shareable invitation created! Copy the link to invite your counterparty.`
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

    const activeUser = userProfiles[role];

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const accepterName = activeUser.name;

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

        // If project was an unassigned invitation, bind current user
        let updatedClient = project.client;
        let updatedFreelancer = project.freelancer;

        if (role === "client" && (!project.client.email || project.client.name.includes("Unassigned"))) {
          updatedClient = {
            name: activeUser.name,
            email: activeUser.email,
            avatar: activeUser.avatar,
            company: (activeUser as any).company || "Client Organization",
            milestoneOSId: activeUser.milestoneOSId,
          };
        } else if (role === "freelancer" && (!project.freelancer.email || project.freelancer.name.includes("Unassigned"))) {
          updatedFreelancer = {
            name: activeUser.name,
            email: activeUser.email,
            avatar: activeUser.avatar,
            title: (activeUser as any).title || "Specialist Freelancer",
            rating: 5.0,
            milestoneOSId: activeUser.milestoneOSId,
          };
        }

        return {
          ...project,
          client: updatedClient,
          freelancer: updatedFreelancer,
          status: "active" as const,
          proposalStatus: "accepted" as const,
          acceptedAt: nowStr,
          acceptedByMilestoneOSId: activeUser.milestoneOSId,
          termsAgreed: true,
          invitationStatus: project.invitationToken ? ("claimed" as const) : project.invitationStatus,
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

  const revokeInvitation = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const actorName = userProfiles[role].name;
        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: actorName,
          actorRole: role,
          action: `${actorName} revoked the private invitation link for proposal "${p.title}".`,
        };
        return {
          ...p,
          invitationStatus: "revoked" as const,
          status: "rejected" as const,
          proposalStatus: "rejected" as const,
          activityLog: [newLog, ...p.activityLog],
        };
      })
    );
    showToast("Invitation link revoked. New recipients can no longer accept it.", "info");
  };

  const acceptInvitationByToken = (
    token: string,
    claimingUser: {
      name: string;
      email: string;
      avatar: string;
      milestoneOSId: string;
      role: "client" | "freelancer";
      companyOrTitle?: string;
    }
  ): { success: boolean; project?: ProjectContract; error?: string } => {
    const project = projects.find((p) => p.invitationToken === token);
    if (!project) {
      return { success: false, error: "Invitation proposal not found." };
    }
    if (project.invitationStatus === "revoked") {
      return { success: false, error: "This invitation link was revoked by the sender." };
    }
    if (project.invitationStatus === "claimed" || project.status === "active") {
      return { success: false, error: "This proposal has already been accepted and bound to another account." };
    }
    if (project.invitationExpiresAt && new Date(project.invitationExpiresAt).getTime() < Date.now()) {
      return { success: false, error: "This invitation link has expired." };
    }

    const senderId =
      project.initiatorMilestoneOSId ||
      (project.initiatedBy === "client" ? project.client.milestoneOSId : project.freelancer.milestoneOSId);

    if (senderId && claimingUser.milestoneOSId && senderId === claimingUser.milestoneOSId) {
      return { success: false, error: "You created this proposal. You cannot accept your own invitation link." };
    }

    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const isClientSender = project.initiatedBy === "client";

    const updatedMilestones = project.milestones.map((m, idx) => ({
      ...m,
      status: idx === 0 ? ("in_progress" as const) : ("not_started" as const),
    }));

    const newLog: ActivityItem = {
      id: `act_${Date.now()}`,
      timestamp: "Just now",
      actor: claimingUser.name,
      actorRole: claimingUser.role,
      action: `${claimingUser.name} accepted the project proposal via private invitation link. Agreement is now active.`,
    };

    const updatedClient = isClientSender
      ? project.client
      : {
          name: claimingUser.name,
          email: claimingUser.email,
          avatar: claimingUser.avatar,
          company: claimingUser.companyOrTitle || "Client Organization",
          milestoneOSId: claimingUser.milestoneOSId,
        };

    const updatedFreelancer = isClientSender
      ? {
          name: claimingUser.name,
          email: claimingUser.email,
          avatar: claimingUser.avatar,
          title: claimingUser.companyOrTitle || "Specialist Freelancer",
          rating: 5.0,
          milestoneOSId: claimingUser.milestoneOSId,
        }
      : project.freelancer;

    const updatedProject: ProjectContract = {
      ...project,
      client: updatedClient,
      freelancer: updatedFreelancer,
      status: "active",
      proposalStatus: "accepted",
      acceptedAt: nowStr,
      acceptedByMilestoneOSId: claimingUser.milestoneOSId,
      termsAgreed: true,
      invitationStatus: "claimed",
      milestones: updatedMilestones,
      activityLog: [newLog, ...project.activityLog],
    };

    setProjects((prev) => prev.map((p) => (p.id === project.id ? updatedProject : p)));
    setActiveProjectIdState(project.id);

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "Proposal Accepted & Contract Active",
      message: `${claimingUser.name} accepted your invitation for "${project.title}". Milestone 01 is now in progress!`,
      type: "approval",
      unread: true,
      projectId: project.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true, project: updatedProject };
  };

  const lookupUserById = (id: string): MilestoneOSUser | null => {
    return lookupMilestoneOSUser(id);
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
      demoUrl?: string;
      githubRepo?: string;
      githubPr?: string;
      loomVideo?: string;
      notes: string;
      deliverableLinks?: DeliverableLink[];
      attachments?: DeliverableAttachment[];
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

          // Build dynamic automated checks based on actual materials submitted
          const checks: Array<{ name: string; passed: boolean; detail: string }> = [];

          if (deliverables.deliverableLinks && deliverables.deliverableLinks.length > 0) {
            checks.push({
              name: "Deliverable Assets Verified",
              passed: true,
              detail: `${deliverables.deliverableLinks.length} asset link(s) provided`,
            });
          }

          if (deliverables.demoUrl && deliverables.demoUrl.trim().length > 0) {
            checks.push({
              name: "Live Preview / Staging",
              passed: true,
              detail: "Preview link accessible",
            });
          }

          if (deliverables.githubRepo && deliverables.githubRepo.trim().length > 0) {
            checks.push({
              name: "Code Repository Integration",
              passed: true,
              detail: "Repository verified",
            });
          }

          if (deliverables.loomVideo && deliverables.loomVideo.trim().length > 0) {
            checks.push({
              name: "Walkthrough Video",
              passed: true,
              detail: "Video walkthrough attached",
            });
          }

          checks.push({
            name: "Scope & Requirement Alignment",
            passed: true,
            detail: "Deliverables match agreed acceptance criteria",
          });

          const simpleAudit: AIAssessment = {
            overallScore: isRevision ? 98 : 95,
            summary: isRevision
              ? "Automated review checked the revised work against the requested changes. All requirements met."
              : "Automated review checked the submitted deliverables and notes against milestone requirements. Requirements appear satisfied.",
            status: "approved",
            verifiedAt: nowStr,
            isDemonstration: true,
            criteria: m.acceptanceCriteria.map((crit) => ({
              ...crit,
              status: "met",
              evidence: "Checked against submitted deliverables: requirement verified.",
              aiNotes: "Requirement appears satisfied.",
            })),
            automatedChecks: checks,
          };

          const newSubmission: MilestoneSubmission = {
            id: `sub_${Date.now()}`,
            version: submissionVersion,
            submittedAt: nowStr,
            submittedBy: project.freelancer.name,
            demoUrl: deliverables.demoUrl || "",
            githubRepo: deliverables.githubRepo || "",
            githubPr: deliverables.githubPr,
            loomVideo: deliverables.loomVideo,
            notes: deliverables.notes,
            deliverableLinks: deliverables.deliverableLinks || [],
            attachments: deliverables.attachments || [],
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
              action: `Completed payment of $${paidAmount.toLocaleString()} USD via PayPal Sandbox`,
              details: `PayPal Transaction: ${txId}`,
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
      message: `$${paidAmount.toLocaleString()} USD paid to ${freelancerName} via PayPal Sandbox.`,
      type: "payment",
      unread: true,
      projectId,
      milestoneId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      `Payment of $${paidAmount.toLocaleString()} USD completed via PayPal Sandbox!`,
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
        alertState,
        showAlert,
        showConfirm,
        closeAlert,
        createProject,
        updateProject,
        archiveProject,
        acceptProposal,
        requestProposalChanges,
        rejectProposal,
        resubmitProposal,
        revokeInvitation,
        acceptInvitationByToken,
        lookupUserById,
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
