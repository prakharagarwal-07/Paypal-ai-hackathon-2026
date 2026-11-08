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
} from "./dashboard-data";

export type DashboardTab = "overview" | "projects" | "milestones" | "ai-audits" | "payments";

interface DashboardContextType {
  role: "client" | "freelancer";
  setRole: (role: "client" | "freelancer") => void;
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
  createProject: (newProject: Omit<ProjectContract, "id" | "createdAt" | "escrowReleased" | "activityLog">) => string;
  updateProject: (projectId: string, updates: Partial<ProjectContract>) => void;
  archiveProject: (projectId: string) => void;
  submitMilestoneDeliverables: (
    projectId: string,
    milestoneId: string,
    deliverables: {
      demoUrl: string;
      githubRepo: string;
      githubPr: string;
      loomVideo?: string;
      notes: string;
    },
    isRevision?: boolean
  ) => void;
  requestRevision: (projectId: string, milestoneId: string, reason: string) => void;
  approveMilestone: (projectId: string, milestoneId: string) => void;
  releasePayPalPayment: (projectId: string, milestoneId: string) => string;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToFactoryDefaults: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: "milestoneos_projects_v2",
  TRANSACTIONS: "milestoneos_transactions_v2",
  NOTIFICATIONS: "milestoneos_notifications_v2",
  ROLE: "milestoneos_role_v2",
  ACTIVE_PROJECT: "milestoneos_active_proj_v2",
};

export function DashboardProvider({
  children,
  initialRole = "client",
}: {
  children: ReactNode;
  initialRole?: "client" | "freelancer";
}) {
  const [role, setRoleState] = useState<"client" | "freelancer">(initialRole);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [projects, setProjects] = useState<ProjectContract[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectIdState] = useState<string>("proj_paypal_ai_2026");
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
      const savedActiveProj = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);

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
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, activeProjectId);
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [projects, transactions, notifications, role, activeProjectId, isLoaded]);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 6500);
  };

  const hideToast = () => setToast(null);

  const setRole = (newRole: "client" | "freelancer") => {
    setRoleState(newRole);
    showToast(
      `Switched to ${newRole === "client" ? "Client View (Sarah Chen)" : "Freelancer Workbench (Rohan Verma)"}`,
      "info"
    );
  };

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Action: Create Project
  const createProject = (
    newProjectData: Omit<ProjectContract, "id" | "createdAt" | "escrowReleased" | "activityLog">
  ): string => {
    const id = `proj_${Date.now()}`;
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    const newProject: ProjectContract = {
      ...newProjectData,
      id,
      createdAt: now,
      escrowReleased: 0,
      activityLog: [
        {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          actor: newProjectData.client.name,
          actorRole: "client",
          action: `Created new project contract "${newProjectData.title}" and locked $${newProjectData.totalBudget.toLocaleString()} in PayPal Escrow Vault.`,
        },
      ],
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectIdState(id);

    // Notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "New Project Contract Initialized",
      message: `Project "${newProject.title}" created with $${newProject.totalBudget.toLocaleString()} locked in escrow.`,
      type: "system",
      unread: true,
      projectId: id,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Contract "${newProject.title}" created with $${newProject.totalBudget.toLocaleString()} in escrow!`, "success");
    return id;
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

  // Action: Submit Milestone Deliverables (Freelancer)
  const submitMilestoneDeliverables = (
    projectId: string,
    milestoneId: string,
    deliverables: {
      demoUrl: string;
      githubRepo: string;
      githubPr: string;
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

          // Build realistic simulated Gemini demonstration assessment
          const simulatedAudit: AIAssessment = {
            overallScore: isRevision ? 98 : 95,
            summary: isRevision
              ? "Demonstration AI Audit (Simulated Gemini 2.5 Flash): Revision requirements fully verified. Missing headers resolved, zero regressions found."
              : "Demonstration AI Audit (Simulated Gemini 2.5 Flash): Deliverable staging URL and GitHub pull request verified against all acceptance criteria.",
            status: "approved",
            verifiedAt: nowStr,
            isDemonstration: true,
            criteria: m.acceptanceCriteria.map((crit, idx) => ({
              ...crit,
              status: "satisfied",
              evidence: `Automated test passed: HTTP response validated and code pattern confirmed in PR #${submissionVersion + 3}.`,
              aiNotes: "Satisfied: Code implementation meets acceptance requirements.",
            })),
            automatedChecks: [
              { name: "Live Staging Response", passed: true, detail: "HTTPS 200 OK (118ms)" },
              { name: "GitHub Pull Request & Diffs", passed: true, detail: `Branch merged cleanly, 0 merge conflicts` },
              { name: "Static Analysis & Typings", passed: true, detail: "0 TypeScript errors detected" },
            ],
            suggestedRevisions: isRevision
              ? []
              : ["Recommend monitoring production API latency under peak concurrent webhook delivery."],
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
            attachments: [
              { name: "automated-test-summary.json", size: "142 KB", type: "application/json" },
            ],
            aiAssessment: simulatedAudit,
          };

          return {
            ...m,
            status: "awaiting_client_approval" as MilestoneStatus,
            submissions: [...m.submissions, newSubmission],
            latestAudit: simulatedAudit,
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
                ? `Resubmitted revised deliverables for Stage 0${targetMilestone?.stageNumber || ""}: "${targetMilestone?.title || ""}"`
                : `Submitted completed deliverables for Stage 0${targetMilestone?.stageNumber || ""}: "${targetMilestone?.title || ""}"`,
              milestoneTitle: targetMilestone?.title,
            },
            {
              id: `act_${Date.now() + 1}`,
              timestamp: "Just now",
              actor: "MilestoneOS AI Auditor",
              actorRole: "ai_system",
              action: `Demonstration AI Audit complete: 95% match verified across acceptance criteria.`,
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
      title: isRevision ? "Revised Work Resubmitted" : "Work Submitted for Review",
      message: `${targetProj?.freelancer.name} submitted Stage 0${targetM?.stageNumber || ""}: "${targetM?.title || ""}". AI scored 95%.`,
      type: "submission",
      unread: true,
      projectId,
      milestoneId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      isRevision
        ? "Revised work submitted! Gemini AI verified all criteria. Client notified to review."
        : "Work submitted! Gemini AI completed demonstration audit (95% score). Client notified.",
      "success"
    );
  };

  // Action: Request Revision (Client)
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
            status: "revision_requested" as MilestoneStatus,
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
              action: `Requested revision on Stage 0${targetMilestone?.stageNumber}: "${targetMilestone?.title}"`,
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
      title: "Revision Requested",
      message: `${targetProj?.client.name} requested changes on Stage 0${targetM?.stageNumber}: "${targetM?.title}".`,
      type: "revision",
      unread: true,
      projectId,
      milestoneId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast("Revision request sent to freelancer with your explanation.", "warning");
  };

  // Action: Approve Milestone (Client)
  const approveMilestone = (projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          return {
            ...m,
            status: "payment_pending" as MilestoneStatus,
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
              action: `Approved Stage 0${targetMilestone?.stageNumber}: "${targetMilestone?.title}" (Awaiting PayPal Payout Release)`,
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
      title: "Milestone Approved!",
      message: `Stage 0${targetM?.stageNumber} was approved by ${targetProj?.client.name}. $${targetM?.amount.toLocaleString()} is ready for PayPal payment release.`,
      type: "approval",
      unread: true,
      projectId,
      milestoneId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Milestone approved! $${targetM?.amount.toLocaleString()} is now ready for PayPal payout.`, "success");
  };

  // Action: Release PayPal Payment (Client)
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
          escrowReleased: project.escrowReleased + paidAmount,
          milestones: updatedMilestones,
          activityLog: [
            {
              id: `act_${Date.now()}`,
              timestamp: "Just now",
              actor: project.client.name,
              actorRole: "paypal",
              action: `Released $${paidAmount.toLocaleString()} USD via PayPal Sandbox (TX: ${txId})`,
              milestoneTitle,
            },
            ...project.activityLog,
          ],
        };
      })
    );

    // Add to transaction record
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
      payer: `${clientName} (Apex Global Commerce)`,
      payee: freelancerName,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      title: "PayPal Escrow Payout Released",
      message: `$${paidAmount.toLocaleString()} USD sent to ${freelancerName} via PayPal Sandbox (${txId}).`,
      type: "payment",
      unread: true,
      projectId,
      milestoneId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      `$${paidAmount.toLocaleString()} USD released via PayPal Sandbox! Transaction: ${txId}`,
      "success"
    );

    return txId;
  };

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
    setActiveProjectIdState("proj_paypal_ai_2026");
    setRoleState("client");
    setActiveTab("overview");
    showToast("Dashboard reset to initial demonstration state.", "info");
  };

  return (
    <DashboardContext.Provider
      value={{
        role,
        setRole,
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
        submitMilestoneDeliverables,
        requestRevision,
        approveMilestone,
        releasePayPalPayment,
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
