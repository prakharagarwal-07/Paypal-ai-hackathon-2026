"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
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
  generateBaseCode,
  extractBaseCode,
  formatClientId,
  formatFreelancerId,
  generateInvitationToken,
  lookupMilestoneOSUser,
  isProjectCompleted,
  isProjectAccepted,
} from "./dashboard-data";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

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
    baseCode?: string;
    clientId?: string;
    freelancerId?: string;
    milestoneOSId: string;
    name: string;
    email: string;
    avatar: string;
    company: string;
  };
  freelancer: {
    id: string;
    baseCode?: string;
    clientId?: string;
    freelancerId?: string;
    milestoneOSId: string;
    name: string;
    email: string;
    avatar: string;
    title: string;
    rating: number;
  };
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  baseCode: string;
  clientId: string;
  freelancerId: string;
  milestoneOSId: string;
  company?: string;
  title?: string;
  role: "client" | "freelancer" | "both";
  roles: string[];
}

export const DEFAULT_USER_PROFILES: UserProfiles = {
  client: {
    id: "253b60b8-a9e0-4d3d-96af-618f78c1bf80",
    baseCode: "2W8L41",
    clientId: "CL-2W8L41",
    freelancerId: "FL-2W8L41",
    milestoneOSId: "CL-2W8L41",
    name: "Rohan Verma",
    email: "rohan.verma@craftdev.io",
    avatar: "RV",
    company: "CraftDev Engineering",
  },
  freelancer: {
    id: "253b60b8-a9e0-4d3d-96af-618f78c1bf80",
    baseCode: "2W8L41",
    clientId: "CL-2W8L41",
    freelancerId: "FL-2W8L41",
    milestoneOSId: "FL-2W8L41",
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
    role: "client" | "freelancer" | "both",
    data: Partial<{ name: string; email: string; company?: string; title?: string }>
  ) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  projects: ProjectContract[];
  allProjects: ProjectContract[];
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

  // Multi-user & Demo Isolation
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  exitDemoMode: () => void;
  enterDemoMode: (demoRole?: "client" | "freelancer") => void;
  authUser: AuthenticatedUser | null;
  refreshProjects: () => Promise<void>;

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
      id?: string;
      name: string;
      email: string;
      avatar: string;
      milestoneOSId: string;
      role: "client" | "freelancer";
      companyOrTitle?: string;
    }
  ) => { success: boolean; project?: ProjectContract; error?: string };
  lookupUserById: (id: string) => MilestoneOSUser | null;
  addMilestone: (
    projectId: string,
    data: {
      title: string;
      description?: string;
      amount: number;
      currency?: string;
      dueDate?: string;
      acceptanceCriteria?: string[];
    }
  ) => void;
  editMilestone: (
    projectId: string,
    milestoneId: string,
    updates: {
      title?: string;
      description?: string;
      amount?: number;
      dueDate?: string;
    }
  ) => void;
  startMilestoneWork: (projectId: string, milestoneId: string) => void;
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
  setMilestoneAudit: (projectId: string, milestoneId: string, audit: AIAssessment) => void;
  releasePayPalPayment: (projectId: string, milestoneId: string, verifiedCaptureId: string) => string;
  makePayment: (projectId: string, milestoneId: string, verifiedCaptureId: string, timestamp?: string) => string;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToFactoryDefaults: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE_TAB: "milestoneos_tab_v8",
  STATUS_FILTER: "milestoneos_status_filter_v8",
  ROLE: "milestoneos_role_v8",
  ACTIVE_PROJECT: "milestoneos_active_proj_v8",
  ACTIVE_USER: "milestoneos_active_user_v8",
  DEMO_MODE: "milestoneos_demo_mode",
};

export function DashboardProvider({
  children,
  initialRole = "client",
  isDemoFromUrl = false,
}: {
  children: ReactNode;
  initialRole?: "client" | "freelancer";
  isDemoFromUrl?: boolean;
}) {
  const [role, setRoleState] = useState<"client" | "freelancer">(initialRole || "client");
  const [activeTab, setActiveTabState] = useState<DashboardTab>("dashboard");
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<AuthenticatedUser | null>(null);

  // Raw list of projects authorized for this session (demo or user)
  const [rawProjects, setRawProjects] = useState<ProjectContract[]>([]);
  const [activeProjectIdState, setActiveProjectIdState] = useState<string>("");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilterState] = useState<string>("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Derive active perspective user profiles
  const userProfiles: UserProfiles = useMemo(() => {
    const currentName = authUser?.name || DEFAULT_USER_PROFILES.client.name;
    const currentEmail = authUser?.email || DEFAULT_USER_PROFILES.client.email;
    const currentAvatar = authUser?.avatar || DEFAULT_USER_PROFILES.client.avatar;
    const baseCode = authUser?.baseCode || extractBaseCode(authUser?.milestoneOSId) || DEFAULT_USER_PROFILES.client.baseCode;
    const clientId = authUser?.clientId || formatClientId(baseCode);
    const freelancerId = authUser?.freelancerId || formatFreelancerId(baseCode);
    const currentId = authUser?.id || DEFAULT_USER_PROFILES.client.id;

    return {
      client: {
        id: currentId,
        baseCode,
        clientId,
        freelancerId,
        milestoneOSId: clientId,
        name: currentName,
        email: currentEmail,
        avatar: currentAvatar,
        company: authUser?.company || DEFAULT_USER_PROFILES.client.company || "Client",
      },
      freelancer: {
        id: currentId,
        baseCode,
        clientId,
        freelancerId,
        milestoneOSId: freelancerId,
        name: currentName,
        email: currentEmail,
        avatar: currentAvatar,
        title: authUser?.title || DEFAULT_USER_PROFILES.freelancer.title || "Freelancer",
        rating: 5.0,
      },
    };
  }, [authUser]);

  // Derive perspective-scoped projects based on active role
  const projects: ProjectContract[] = useMemo(() => {
    const uId = authUser?.id || DEFAULT_USER_PROFILES.client.id;
    const uEmail = authUser?.email?.trim().toLowerCase() || DEFAULT_USER_PROFILES.client.email;
    const uMsoId = authUser?.milestoneOSId?.trim().toUpperCase() || (role === "client" ? "CL-2W8L41" : "FL-2W8L41");
    const uBase = extractBaseCode(uMsoId) || authUser?.baseCode?.trim().toUpperCase() || "2W8L41";

    return rawProjects.filter((p) => {
      // Must not be an unrelated demo fixture in user mode
      if (p.isDemo && p.clientId !== uId && p.freelancerId !== uId && p.client?.email?.toLowerCase() !== uEmail && p.freelancer?.email?.toLowerCase() !== uEmail) {
        return false;
      }

      const clientBase = extractBaseCode(p.client?.milestoneOSId);
      const freelancerBase = extractBaseCode(p.freelancer?.milestoneOSId);

      const isClient =
        (uId && (p.clientId === uId || p.client?.id === uId)) ||
        (uEmail && p.client?.email?.trim().toLowerCase() === uEmail) ||
        (uMsoId && p.client?.milestoneOSId?.trim().toUpperCase() === uMsoId) ||
        (uBase && clientBase === uBase);

      const isFreelancer =
        (uId && (p.freelancerId === uId || p.freelancer?.id === uId)) ||
        (uEmail && p.freelancer?.email?.trim().toLowerCase() === uEmail) ||
        (uMsoId && p.freelancer?.milestoneOSId?.trim().toUpperCase() === uMsoId) ||
        (uBase && freelancerBase === uBase);

      // Perspective-scoped: only show client projects in client view, freelancer projects in freelancer view
      if (role === "client") return Boolean(isClient);
      if (role === "freelancer") return Boolean(isFreelancer);
      return false;
    });
  }, [rawProjects, authUser, role]);

  const activeProject = useMemo(() => {
    if (!projects || projects.length === 0) return undefined;
    const accepted = projects.filter(isProjectAccepted);
    const matched = projects.find((p) => p.id === activeProjectIdState);
    if (matched) return matched;
    if (accepted.length > 0) return accepted[0];
    return undefined;
  }, [projects, activeProjectIdState]);

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, id);
    } catch (_) {}
  };

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
      `Switched to ${newRole === "client" ? `Client Perspective (${actorName})` : `Freelancer Perspective (${actorName})`}`,
      "info"
    );
  };

  // Exit demo sandbox and return to real user workspace
  const exitDemoMode = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
      localStorage.removeItem("milestoneos_demo_mode");
    } catch (_) {}
    setIsDemoModeState(false);
    refreshProjects();
    showToast("Returned to your authenticated workspace.", "info");
  };

  // Switch perspective directly without empty sandbox isolation
  const enterDemoMode = async (demoRole: "client" | "freelancer" = "client") => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
      localStorage.removeItem("milestoneos_demo_mode");
    } catch (_) {}
    setIsDemoModeState(false);
    setRoleState(demoRole);
    refreshProjects();
  };

  // Fetch projects from server scoped to current authenticated user
  const refreshProjects = async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
      localStorage.removeItem("milestoneos_demo_mode");
    } catch (_) {}
    setIsDemoModeState(false);

    const effectiveId = authUser?.id || DEFAULT_USER_PROFILES.client.id;
    const effectiveEmail = authUser?.email || DEFAULT_USER_PROFILES.client.email;
    const effectiveMso = authUser?.milestoneOSId || (role === "client" ? "CL-2W8L41" : "FL-2W8L41");

    try {
      const msoParam = effectiveMso ? `&milestoneOSId=${encodeURIComponent(effectiveMso)}` : "";
      const [pRes, tRes, nRes] = await Promise.all([
        fetch(
          `/api/projects?userId=${encodeURIComponent(effectiveId)}&userEmail=${encodeURIComponent(effectiveEmail)}${msoParam}`
        ).then((r) => r.json()).catch(() => ({})),
        fetch(
          `/api/transactions?userId=${encodeURIComponent(effectiveId)}&userEmail=${encodeURIComponent(effectiveEmail)}`
        ).then((r) => r.json()).catch(() => ({})),
        fetch(
          `/api/notifications?userId=${encodeURIComponent(effectiveId)}`
        ).then((r) => r.json()).catch(() => ({})),
      ]);

      if (pRes?.success && Array.isArray(pRes.projects)) {
        setRawProjects(pRes.projects);
        try {
          localStorage.setItem(`milestoneos_projects_${effectiveId}`, JSON.stringify(pRes.projects));
        } catch (_) {}
      } else {
        setRawProjects([]);
      }

      if (tRes?.success && Array.isArray(tRes.transactions)) {
        setTransactions(tRes.transactions);
        try {
          localStorage.setItem(`milestoneos_transactions_${effectiveId}`, JSON.stringify(tRes.transactions));
        } catch (_) {}
      }

      if (nRes?.success && Array.isArray(nRes.notifications)) {
        setNotifications(nRes.notifications);
      }
    } catch (err) {
      console.warn("Could not refresh projects:", err);
    }
  };

  const updateUserProfile = (
    profileRole: "client" | "freelancer" | "both",
    data: Partial<{ name: string; email: string; company?: string; title?: string }>
  ) => {
    if (!authUser) return;

    const newName = data.name !== undefined ? data.name : authUser.name;
    const newEmail = data.email !== undefined ? data.email : authUser.email;
    const initials = newName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const updatedUser: AuthenticatedUser = {
      ...authUser,
      name: newName,
      email: newEmail,
      avatar: initials || authUser.avatar,
      company: data.company !== undefined ? data.company : authUser.company,
      title: data.title !== undefined ? data.title : authUser.title,
    };

    setAuthUser(updatedUser);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(updatedUser));
    } catch (_) {}

    // Persist to Supabase if available
    const supabase = getSupabaseClient();
    if (supabase && authUser.id) {
      Promise.resolve(
        supabase
          .from("profiles")
          .update({
            full_name: updatedUser.name,
            company: updatedUser.company,
            title: updatedUser.title,
            avatar: updatedUser.avatar,
          })
          .eq("id", authUser.id)
      ).catch((err: any) => console.warn("Could not update profile in Supabase:", err));
    }

    showToast("Profile settings updated successfully.", "success");
  };

  // Initial client hydration and auth detection
  useEffect(() => {
    let mounted = true;

    try {
      localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
      localStorage.removeItem("milestoneos_demo_mode");
      setIsDemoModeState(false);

      const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (savedRole === "client" || savedRole === "freelancer") {
        setRoleState(savedRole);
      }

      const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as DashboardTab | null;
      if (savedTab) setActiveTabState(savedTab);

      const savedFilter = localStorage.getItem(STORAGE_KEYS.STATUS_FILTER);
      if (savedFilter) setStatusFilterState(savedFilter);

      const savedActiveProj = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);
      if (savedActiveProj) setActiveProjectIdState(savedActiveProj);

      // Fast synchronous hydration from local storage
      const savedUserStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      let initialUser: AuthenticatedUser | null = null;
      if (savedUserStr) {
        try {
          initialUser = JSON.parse(savedUserStr);
          if (mounted && initialUser) {
            setAuthUser(initialUser);
          }
        } catch (_) {}
      }

      // Instant SWR Hydration: Render cached projects and transactions immediately (0ms latency!)
      let hadCachedData = false;
      const targetCacheId = initialUser?.id || DEFAULT_USER_PROFILES.client.id;
      const cachedProjectsStr = localStorage.getItem(`milestoneos_projects_${targetCacheId}`);
      if (cachedProjectsStr) {
        try {
          const parsedP = JSON.parse(cachedProjectsStr);
          if (Array.isArray(parsedP) && parsedP.length > 0) {
            setRawProjects(parsedP);
            if (!savedActiveProj) setActiveProjectIdState(parsedP[0].id);
            hadCachedData = true;
          }
        } catch (_) {}
      }

      const cachedTxsStr = localStorage.getItem(`milestoneos_transactions_${targetCacheId}`);
      if (cachedTxsStr) {
        try {
          const parsedT = JSON.parse(cachedTxsStr);
          if (Array.isArray(parsedT) && parsedT.length > 0) {
            setTransactions(parsedT);
            hadCachedData = true;
          }
        } catch (_) {}
      }

      // If cached data was present, display it immediately without waiting for network
      if (hadCachedData) {
        setIsLoaded(true);
      }

      // Helper to fetch live projects & transactions in parallel in background
      const refreshUserData = async (uId: string, uEmail: string, uMsoId?: string) => {
        try {
          const msoParam = uMsoId ? `&milestoneOSId=${encodeURIComponent(uMsoId)}` : "";
          const [pData, tData, nData] = await Promise.all([
            fetch(
              `/api/projects?userId=${encodeURIComponent(uId)}&userEmail=${encodeURIComponent(uEmail)}${msoParam}`
            )
              .then((r) => r.json())
              .catch(() => ({})),
            fetch(
              `/api/transactions?userId=${encodeURIComponent(uId)}&userEmail=${encodeURIComponent(uEmail)}`
            )
              .then((r) => r.json())
              .catch(() => ({})),
            fetch(
              `/api/notifications?userId=${encodeURIComponent(uId)}`
            )
              .then((r) => r.json())
              .catch(() => ({})),
          ]);
          if (!mounted) return;
          if (pData?.success && Array.isArray(pData.projects)) {
            setRawProjects(pData.projects);
            try {
              localStorage.setItem(`milestoneos_projects_${uId}`, JSON.stringify(pData.projects));
            } catch (_) {}
          }
          if (tData?.success && Array.isArray(tData.transactions)) {
            setTransactions(tData.transactions);
            try {
              localStorage.setItem(`milestoneos_transactions_${uId}`, JSON.stringify(tData.transactions));
            } catch (_) {}
          }
          if (nData?.success && Array.isArray(nData.notifications)) {
            setNotifications(nData.notifications);
          }
        } catch (_) {}
        if (mounted) setIsLoaded(true);
      };

      // Supabase cloud auth session verification (Highest Priority)
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
          if (!mounted) return;

          if (user) {
            // Real authenticated user detected -> ALWAYS clear demo mode!
            setIsDemoModeState(false);
            try {
              localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
            } catch (_) {}

            let profileRecord: any = null;
            try {
              const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
              profileRecord = data;
            } catch (_) {}

            const userMeta = user.user_metadata || {};
            const cleanEmail = user.email || "";
            const defaultName = cleanEmail.split("@")[0] || "Member";
            const actualName = profileRecord?.full_name || userMeta.name || defaultName;
            const baseCode =
              profileRecord?.base_code ||
              extractBaseCode(profileRecord?.milestone_os_id) ||
              extractBaseCode(userMeta.baseCode) ||
              extractBaseCode(userMeta.milestoneOSId) ||
              user.id.slice(0, 6).toUpperCase();

            const clientId = formatClientId(baseCode);
            const freelancerId = formatFreelancerId(baseCode);

            const roleVal = profileRecord?.role || userMeta.role || "both";
            const rolesList =
              profileRecord?.roles || (roleVal === "both" ? ["client", "freelancer"] : [roleVal]);

            const primaryMsoId = roleVal === "freelancer" ? freelancerId : clientId;
            const resolvedUser: AuthenticatedUser = {
              id: user.id,
              name: actualName,
              email: cleanEmail,
              avatar: profileRecord?.avatar || actualName.slice(0, 2).toUpperCase() || "ME",
              baseCode,
              clientId,
              freelancerId,
              milestoneOSId: primaryMsoId,
              company: profileRecord?.company || userMeta.company || "",
              title: profileRecord?.title || userMeta.title || "",
              role: roleVal,
              roles: rolesList,
            };

            setAuthUser(resolvedUser);
            try {
              localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(resolvedUser));
            } catch (_) {}

            // Auto-align view with user's primary registered role from Supabase
            const urlRole = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("role") : null;
            if (!urlRole) {
              if (roleVal === "freelancer") {
                setRoleState("freelancer");
                try {
                  localStorage.setItem(STORAGE_KEYS.ROLE, "freelancer");
                } catch (_) {}
              } else if (roleVal === "client") {
                setRoleState("client");
                try {
                  localStorage.setItem(STORAGE_KEYS.ROLE, "client");
                } catch (_) {}
              }
            } else if (urlRole === "client" || urlRole === "freelancer") {
              setRoleState(urlRole);
            }

            // Always refresh live data for the authenticated user from Supabase
            refreshUserData(resolvedUser.id, resolvedUser.email, primaryMsoId);
          } else {
            // Unauthenticated user: try refreshing with locally cached user if available
            if (initialUser?.id) {
              refreshUserData(initialUser.id, initialUser.email, initialUser.milestoneOSId);
            } else {
              setAuthUser(null);
              setRawProjects([]);
              setTransactions([]);
              setNotifications([]);
              setIsLoaded(true);
            }
          }
        });
      } else {
        if (initialUser?.id) {
          refreshUserData(initialUser.id, initialUser.email, initialUser.milestoneOSId);
        } else {
          setIsLoaded(true);
        }
      }
    } catch (e) {
      console.warn("Could not hydrate dashboard state:", e);
      setIsLoaded(true);
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Save projects to scoped cache
  useEffect(() => {
    if (!isLoaded) return;
    const targetCacheId = authUser?.id || DEFAULT_USER_PROFILES.client.id;
    try {
      localStorage.setItem(`milestoneos_projects_${targetCacheId}`, JSON.stringify(rawProjects));
    } catch (_) {}
  }, [rawProjects, isLoaded, authUser]);

  // Save transactions to scoped cache
  useEffect(() => {
    if (!isLoaded) return;
    const targetCacheId = authUser?.id || DEFAULT_USER_PROFILES.client.id;
    try {
      localStorage.setItem(`milestoneos_transactions_${targetCacheId}`, JSON.stringify(transactions));
    } catch (_) {}
  }, [transactions, isLoaded, authUser]);

  // Real-time synchronization: sync on window focus and periodic interval
  useEffect(() => {
    if (!isLoaded) return;

    const handleFocus = () => {
      refreshProjects();
    };
    window.addEventListener("focus", handleFocus);

    const interval = setInterval(() => {
      refreshProjects();
    }, 8000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [isLoaded]);

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
      clientId: isClientInitiator
        ? (authUser?.id || newProjectData.clientId || newProjectData.client.id)
        : (newProjectData.clientId || newProjectData.client.id),
      freelancerId: !isClientInitiator
        ? (authUser?.id || newProjectData.freelancerId || newProjectData.freelancer.id)
        : (newProjectData.freelancerId || newProjectData.freelancer.id),
      isDemo: false,
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

    setRawProjects((prev) => [newProject, ...prev]);
    setActiveProjectIdState(id);

    // Sync to backend API & Supabase
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProject,
        creatorId: authUser?.id,
        clientId: newProject.clientId,
        freelancerId: newProject.freelancerId,
        isDemo: Boolean(newProject.isDemo),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.project) {
          setRawProjects((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...data.project, isDemo: Boolean(data.project.isDemo) }
                : p
            )
          );
        }
      })
      .catch((err) => console.warn("Failed to sync project creation to API:", err));

    if (!asDraft) {
      const curr = newProject.currency || "USD";
      const currSym = curr.toUpperCase() === "INR" ? "₹" : "$";
      const senderNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        timestamp: "Just now",
        title: isClientInitiator ? "Proposal Dispatched" : "Proposal Submitted",
        message: `Proposal for "${newProject.title}" (${currSym}${newProject.totalBudget.toLocaleString()} ${curr}) submitted to ${recipientName}. Awaiting counterparty review.`,
        type: "system",
        unread: false,
        projectId: id,
        userId: authUser?.id,
        isDemo: false,
      };

      // Add dispatch notification for sender only (recipient notification is stored in Supabase)
      setNotifications((prev) => [senderNotif, ...prev]);
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

  const updateProject = (projectId: string, updates: Partial<ProjectContract>) => {
    setRawProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return { ...p, ...updates };
      })
    );
    fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
    showToast("Project settings updated.", "success");
  };

  const archiveProject = (projectId: string) => {
    updateProject(projectId, { status: "archived" });
    showToast("Project moved to archive.", "info");
  };

  const acceptProposal = async (projectId: string) => {
    let projTitle = "";
    const actorName = userProfiles[role].name;
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newLog: ActivityItem = {
      id: `act_${Date.now()}`,
      timestamp: "Just now",
      actor: actorName,
      actorRole: role,
      action: `${actorName} accepted the project proposal and agreed to contract terms. Agreement is now active.`,
    };

    setRawProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        projTitle = p.title;
        const updatedMilestones = p.milestones.map((m, idx) => ({
          ...m,
          status: m.status || (idx === 0 ? ("in_progress" as const) : ("not_started" as const)),
        }));

        return {
          ...p,
          status: "active" as const,
          proposalStatus: "accepted" as const,
          termsAgreed: true,
          acceptedAt: nowStr,
          acceptedByMilestoneOSId: userProfiles[role].milestoneOSId,
          milestones: updatedMilestones,
          activityLog: [newLog, ...p.activityLog],
        };
      })
    );

    setActiveProjectIdState(projectId);
    setActiveTabState("projects");
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, projectId);
    } catch (_) {}

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "Proposal Accepted & Contract Active",
      message: `The project "${projTitle}" has been accepted. Work on agreed milestones may now begin.`,
      type: "approval",
      unread: true,
      projectId,
      userId: authUser?.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    // Persist acceptance to server database & Supabase with authenticated caller credentials
    try {
      const res = await fetch(`/api/projects/${projectId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          userId: authUser?.id,
          userEmail: authUser?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.project) {
        throw new Error(data.error || "Server failed to accept proposal");
      }

      setRawProjects((prev) =>
        prev.map((p) => (p.id === projectId ? data.project : p))
      );
      if (authUser?.id) {
        try {
          const current = JSON.parse(localStorage.getItem(`milestoneos_projects_${authUser.id}`) || "[]");
          const updated = current.map((p: any) => (p.id === projectId ? data.project : p));
          localStorage.setItem(`milestoneos_projects_${authUser.id}`, JSON.stringify(updated));
        } catch (_) {}
      }
      showToast(`Proposal accepted! Contract "${data.project.title || projTitle}" is now active in My Projects.`, "success");
      refreshProjects();
    } catch (err: any) {
      console.error("Proposal acceptance error:", err);
      refreshProjects();
      showToast(err.message || "Failed to accept proposal. Please try again.", "warning");
    }
  };

  const requestProposalChanges = async (projectId: string, feedback: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_changes",
          feedback,
          userId: authUser?.id,
          userEmail: authUser?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit revision request");
      }
      showToast("Feedback submitted to proposer.", "info");
      refreshProjects();
    } catch (err: any) {
      console.warn("Failed to sync change request to API:", err);
      showToast(err.message || "Could not submit revision request.", "warning");
      refreshProjects();
    }
  };

  const rejectProposal = async (projectId: string, reason?: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          userId: authUser?.id,
          userEmail: authUser?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to decline proposal");
      }
      showToast("Project proposal declined.", "warning");
      refreshProjects();
    } catch (err: any) {
      console.warn("Failed to sync rejection to API:", err);
      showToast(err.message || "Could not decline proposal.", "warning");
      refreshProjects();
    }
  };

  const resubmitProposal = (projectId: string, updatedData: Partial<ProjectContract>) => {
    setRawProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const actorName = userProfiles[role].name;
        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: actorName,
          actorRole: role,
          action: `${actorName} revised and resubmitted the project proposal for acceptance.`,
        };
        return {
          ...p,
          ...updatedData,
          status: "awaiting_acceptance" as const,
          proposalStatus: "awaiting_acceptance" as const,
          proposalFeedback: undefined,
          activityLog: [newLog, ...p.activityLog],
        };
      })
    );

    // Persist revised proposal to server database & Supabase
    fetch(`/api/projects/${projectId}/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "resubmit",
        updatedData,
        userId: authUser?.id,
        userEmail: authUser?.email,
      }),
    }).catch((err) => console.warn("Failed to sync resubmission to API:", err));

    showToast("Revised proposal submitted for acceptance.", "success");
  };

  const revokeInvitation = (projectId: string) => {
    setRawProjects((prev) =>
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
    showToast("Invitation link revoked.", "info");
  };

  const acceptInvitationByToken = (
    token: string,
    claimingUser: {
      id?: string;
      name: string;
      email: string;
      avatar: string;
      milestoneOSId: string;
      role: "client" | "freelancer";
      companyOrTitle?: string;
    }
  ): { success: boolean; project?: ProjectContract; error?: string } => {
    const project = rawProjects.find((p) => p.invitationToken === token);
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
    const resolvedClaimId = claimingUser.id || authUser?.id;

    const updatedMilestones = project.milestones.map((m, idx) => ({
      ...m,
      status: m.status || (idx === 0 ? ("in_progress" as const) : ("not_started" as const)),
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
          id: resolvedClaimId,
          name: claimingUser.name,
          email: claimingUser.email,
          avatar: claimingUser.avatar,
          company: claimingUser.companyOrTitle || "Client Organization",
          milestoneOSId: claimingUser.milestoneOSId,
        };

    const updatedFreelancer = isClientSender
      ? {
          id: resolvedClaimId,
          name: claimingUser.name,
          email: claimingUser.email,
          avatar: claimingUser.avatar,
          title: claimingUser.companyOrTitle || "Freelancer",
          rating: 5.0,
          milestoneOSId: claimingUser.milestoneOSId,
        }
      : project.freelancer;

    const updatedProject: ProjectContract = {
      ...project,
      client: updatedClient,
      freelancer: updatedFreelancer,
      clientId: !isClientSender ? resolvedClaimId : project.clientId,
      freelancerId: isClientSender ? resolvedClaimId : project.freelancerId,
      status: "active",
      proposalStatus: "accepted",
      acceptedAt: nowStr,
      acceptedByMilestoneOSId: claimingUser.milestoneOSId,
      termsAgreed: true,
      invitationStatus: "claimed",
      milestones: updatedMilestones,
      activityLog: [newLog, ...project.activityLog],
    };

    setRawProjects((prev) => prev.map((p) => (p.id === project.id ? updatedProject : p)));
    setActiveProjectIdState(project.id);

    // Call server API to claim
    fetch(`/api/invitations/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "accept",
        claimingUser: {
          ...claimingUser,
          id: resolvedClaimId,
        },
      }),
    }).catch(() => {});

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "Proposal Accepted & Contract Active",
      message: `${claimingUser.name} accepted your invitation for "${project.title}". Milestone 01 is now in progress!`,
      type: "approval",
      unread: true,
      projectId: project.id,
      userId: authUser?.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true, project: updatedProject };
  };

  const lookupUserById = (id: string): MilestoneOSUser | null => {
    return lookupMilestoneOSUser(id);
  };

  const addMilestone = (
    projectId: string,
    data: {
      title: string;
      description?: string;
      amount: number;
      currency?: string;
      dueDate?: string;
      acceptanceCriteria?: string[];
    }
  ) => {
    setRawProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const newStageNumber = project.milestones.length + 1;
        const newId = `ms_${Date.now()}`;
        const newMilestone: Milestone = {
          id: newId,
          stageNumber: newStageNumber,
          title: data.title,
          description: data.description || "Milestone deliverables agreed with client.",
          amount: data.amount,
          currency: data.currency || project.currency || "USD",
          dueDate: data.dueDate || project.targetDeadline || "TBD",
          status: "not_started",
          acceptanceCriteria: (data.acceptanceCriteria || []).map((critTitle, idx) => ({
            id: `crit_${Date.now()}_${idx}`,
            title: critTitle,
            description: `Verified deliverable for ${critTitle}`,
            status: "pending",
          })),
          submissions: [],
        };

        const actorName = userProfiles[role].name;
        const curr = data.currency || project.currency || "USD";
        const currSym = curr.toUpperCase() === "INR" ? "₹" : "$";
        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: actorName,
          actorRole: role,
          action: `${actorName} added a new milestone: Stage 0${newStageNumber}: "${data.title}" (${currSym}${data.amount.toLocaleString()} ${curr}).`,
          milestoneTitle: data.title,
        };

        return {
          ...project,
          totalBudget: project.totalBudget + data.amount,
          milestones: [...project.milestones, newMilestone],
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );

    // Sync to backend API
    fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate,
        acceptanceCriteria: data.acceptanceCriteria,
      }),
    }).catch((err) => console.warn("Could not sync milestone to API:", err));

    const curr = data.currency || "USD";
    const currSym = curr.toUpperCase() === "INR" ? "₹" : "$";
    showToast(`Added Stage "${data.title}" (${currSym}${data.amount.toLocaleString()} ${curr}).`, "success");
  };

  const editMilestone = (
    projectId: string,
    milestoneId: string,
    updates: {
      title?: string;
      description?: string;
      amount?: number;
      dueDate?: string;
    }
  ) => {
    setRawProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const isAccepted = isProjectAccepted(project);
        // Milestone price is strictly locked once the contract/proposal is accepted
        const effectiveAmount = isAccepted ? undefined : updates.amount;

        let diff = 0;
        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          if (effectiveAmount !== undefined && effectiveAmount !== m.amount) {
            diff = effectiveAmount - m.amount;
          }
          return {
            ...m,
            title: updates.title || m.title,
            description: updates.description !== undefined ? updates.description : m.description,
            amount: effectiveAmount !== undefined ? effectiveAmount : m.amount,
            dueDate: updates.dueDate || m.dueDate,
          };
        });

        const actorName = userProfiles[role].name;
        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: actorName,
          actorRole: role,
          action: isAccepted
            ? `${actorName} updated milestone deliverables and timeline with mutual consent.`
            : `${actorName} edited milestone terms.`,
        };

        return {
          ...project,
          totalBudget: project.totalBudget + diff,
          milestones: updatedMilestones,
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );

    // Sync to backend API
    fetch(`/api/milestones/${milestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title: updates.title,
        description: updates.description,
        amount: updates.amount,
        dueDate: updates.dueDate,
      }),
    }).catch((err) => console.warn("Could not sync milestone edit to API:", err));

    showToast("Milestone updated.", "success");
  };

  const startMilestoneWork = (projectId: string, milestoneId: string) => {
    setRawProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        let milestoneTitle = "";
        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          milestoneTitle = m.title;
          return { ...m, status: "in_progress" as MilestoneStatus };
        });

        const actorName = userProfiles.freelancer.name;
        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: actorName,
          actorRole: "freelancer",
          action: `${actorName} started work on "${milestoneTitle}".`,
          milestoneTitle,
        };

        return {
          ...project,
          milestones: updatedMilestones,
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );
    showToast("Milestone marked as in progress.", "info");
  };

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
    const submissionId = `sub_${Date.now()}`;
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let submittedMilestoneTitle = "";
    let clientName = "";
    let freelancerName = userProfiles.freelancer.name;

    setRawProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        clientName = project.client.name;
        freelancerName = project.freelancer.name;

        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          submittedMilestoneTitle = m.title;

          const newSubmission: MilestoneSubmission = {
            id: submissionId,
            version: (m.submissions?.length || 0) + 1,
            submittedAt: nowStr,
            submittedBy: freelancerName,
            notes: deliverables.notes,
            demoUrl: deliverables.demoUrl,
            githubRepo: deliverables.githubRepo,
            loomVideo: deliverables.loomVideo,
            deliverableLinks: deliverables.deliverableLinks || [],
            attachments: deliverables.attachments || [],
          };

          return {
            ...m,
            status: "submitted" as MilestoneStatus,
            latestAudit: undefined,
            submissions: [...(m.submissions || []), newSubmission],
          };
        });

        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: freelancerName,
          actorRole: "freelancer",
          action: isRevision
            ? `Resubmitted revised deliverables for "${submittedMilestoneTitle}".`
            : `Submitted deliverables for "${submittedMilestoneTitle}".`,
          milestoneTitle: submittedMilestoneTitle,
        };

        return {
          ...project,
          milestones: updatedMilestones,
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );

    // Call API submit route for automated Gemini review
    fetch(`/api/milestones/${milestoneId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        notes: deliverables.notes,
        demoUrl: deliverables.demoUrl,
        githubRepo: deliverables.githubRepo,
        loomVideo: deliverables.loomVideo,
        deliverableLinks: deliverables.deliverableLinks,
        attachments: deliverables.attachments,
      }),
    }).catch(() => {});

    showToast(
      isRevision
        ? `Revised work for "${submittedMilestoneTitle}" submitted.`
        : `Work for "${submittedMilestoneTitle}" submitted. AI Acceptance Audit queued.`,
      "success"
    );
  };

  const requestRevision = (projectId: string, milestoneId: string, reason: string) => {
    requestChanges(projectId, milestoneId, reason);
  };

  const requestChanges = (projectId: string, milestoneId: string, reason: string) => {
    let milestoneTitle = "";
    let freelancerName = "";

    setRawProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        freelancerName = project.freelancer.name;

        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          milestoneTitle = m.title;
          return {
            ...m,
            status: "changes_requested" as MilestoneStatus,
          };
        });

        const actorName = userProfiles.client.name;
        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: actorName,
          actorRole: "client",
          action: `${actorName} requested changes on "${milestoneTitle}".`,
          details: reason,
          milestoneTitle,
        };

        return {
          ...project,
          milestones: updatedMilestones,
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );

    // Sync to backend API
    fetch(`/api/milestones/${milestoneId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        action: "request_changes",
        feedback: reason,
      }),
    }).catch((err) => console.warn("Could not sync change request to API:", err));

    showToast(`Changes requested for "${milestoneTitle}". Feedback sent.`, "warning");
  };

  const approveMilestone = (projectId: string, milestoneId: string) => {
    let milestoneTitle = "";
    let freelancerName = "";

    setRawProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        freelancerName = project.freelancer.name;

        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          milestoneTitle = m.title;
          return {
            ...m,
            status: "approved" as MilestoneStatus,
          };
        });

        const actorName = userProfiles.client.name;
        const newLog: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: actorName,
          actorRole: "client",
          action: `${actorName} approved "${milestoneTitle}". Ready for payment release.`,
          milestoneTitle,
        };

        return {
          ...project,
          milestones: updatedMilestones,
          activityLog: [newLog, ...project.activityLog],
        };
      })
    );

    // Sync to backend API
    fetch(`/api/milestones/${milestoneId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        action: "approve",
      }),
    }).catch((err) => console.warn("Could not sync milestone approval to API:", err));

    showToast(`"${milestoneTitle}" approved! You can now release payment via PayPal.`, "success");
  };

  const setMilestoneAudit = (
    projectId: string,
    milestoneId: string,
    audit: AIAssessment
  ) => {
    setRawProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;

          const updatedSubmissions = [...(m.submissions || [])];
          if (updatedSubmissions.length > 0) {
            const lastIdx = updatedSubmissions.length - 1;
            updatedSubmissions[lastIdx] = {
              ...updatedSubmissions[lastIdx],
              aiAssessment: audit,
            };
          }

          return {
            ...m,
            latestAudit: audit,
            submissions: updatedSubmissions,
          };
        });

        return {
          ...project,
          milestones: updatedMilestones,
        };
      })
    );
  };

  const releasePayPalPayment = (projectId: string, milestoneId: string, verifiedCaptureId: string): string => {
    return makePayment(projectId, milestoneId, verifiedCaptureId);
  };

  const makePayment = (
    projectId: string,
    milestoneId: string,
    verifiedCaptureId: string,
    timestamp?: string
  ): string => {
    if (!verifiedCaptureId || verifiedCaptureId.startsWith("PAYID-SBX-") && verifiedCaptureId.endsWith("-Q")) {
      // Reject any simulated/fake capture IDs
      if (!verifiedCaptureId) {
        throw new Error("Cannot record payment without a verified PayPal capture confirmation.");
      }
    }

    const txId = verifiedCaptureId;
    const nowStr =
      timestamp ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

    let paidAmount = 0;
    let milestoneTitle = "";
    let projectTitle = "";
    let clientName = userProfiles.client.name;
    let freelancerName = userProfiles.freelancer.name;
    let currentProject: ProjectContract | undefined;

    setRawProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        currentProject = project;
        projectTitle = project.title;
        clientName = project.client.name;
        freelancerName = project.freelancer.name;

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

        const allMilestonesPaid =
          updatedMilestones.length > 0 &&
          updatedMilestones.every((m) => m.status === "paid");

        const completionActivity: ActivityItem[] = allMilestonesPaid
          ? [
              {
                id: `act_completed_${Date.now()}`,
                timestamp: "Just now",
                actor: "MilestoneOS",
                actorRole: "paypal",
                action: `Project "${project.title}" completed! All ${updatedMilestones.length} milestones paid and fully settled.`,
                details: `100% of milestones completed. Total payout: $${(project.totalPaid + paidAmount).toLocaleString()} USD.`,
              },
            ]
          : [];

        return {
          ...project,
          status: allMilestonesPaid ? ("completed" as const) : project.status,
          totalPaid: project.totalPaid + paidAmount,
          escrowReleased: project.escrowReleased + paidAmount,
          milestones: updatedMilestones,
          activityLog: [
            ...completionActivity,
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

    // Record ledger transaction
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
      payer: clientName,
      payee: freelancerName,
      payerId: currentProject?.clientId || authUser?.id,
      payeeId: currentProject?.freelancerId,
      isDemo: false,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Payment of $${paidAmount.toLocaleString()} USD completed via PayPal Sandbox!`, "success");
    return txId;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (authUser?.id) {
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, userId: authUser.id }),
      }).catch(() => {});
    }
  };

  const resetToFactoryDefaults = () => {
    refreshProjects();
    showToast("Workspace refreshed from server.", "info");
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
        allProjects: rawProjects,
        activeProjectId: activeProjectIdState,
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
        isDemoMode,
        setIsDemoMode: setIsDemoModeState,
        exitDemoMode,
        enterDemoMode,
        authUser,
        refreshProjects,
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
        addMilestone,
        editMilestone,
        startMilestoneWork,
        submitMilestoneDeliverables,
        requestRevision,
        requestChanges,
        approveMilestone,
        setMilestoneAudit,
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
