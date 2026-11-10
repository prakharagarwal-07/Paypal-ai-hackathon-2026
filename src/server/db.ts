/**
 * MilestoneOS — Server-Side Database & Ledger Store
 * Provides persistent project, milestone, submission, and transaction storage.
 */

import fs from "fs";
import path from "path";
import {
  ProjectContract,
  TransactionRecord,
  NotificationItem,
  INITIAL_PROJECTS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  ProjectStatus,
  AIAssessment,
  MilestoneSubmission,
  ActivityItem,
  MilestoneOSUser,
  MILESTONEOS_DIRECTORY,
  generateMilestoneOSId,
  generateInvitationToken,
} from "@/lib/dashboard-data";
import { CaptureOrderResult } from "./paypal";

interface DatabaseState {
  projects: ProjectContract[];
  transactions: TransactionRecord[];
  notifications: NotificationItem[];
  users: MilestoneOSUser[];
}

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "milestoneos_db.json");

let memoryState: DatabaseState = {
  projects: [...INITIAL_PROJECTS],
  transactions: [...INITIAL_TRANSACTIONS],
  notifications: [...INITIAL_NOTIFICATIONS],
  users: [...MILESTONEOS_DIRECTORY],
};

function loadDatabase(): DatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.projects && parsed.transactions) {
        memoryState = parsed;
        return memoryState;
      }
    }
  } catch (err) {
    console.warn("Failed to load disk database, using memory store:", err);
  }
  return memoryState;
}

function persistDatabase(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryState, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to persist database to disk:", err);
  }
}

// Initialize on module load
loadDatabase();

export const db = {
  getProjects(): ProjectContract[] {
    return memoryState.projects;
  },

  getProjectById(id: string): ProjectContract | undefined {
    return memoryState.projects.find((p) => p.id === id);
  },

  findUserByMilestoneOSId(id: string): MilestoneOSUser | null {
    if (!id) return null;
    const clean = id.trim().toUpperCase();
    return memoryState.users.find((u) => u.milestoneOSId.toUpperCase() === clean) || null;
  },

  getProjectByInvitationToken(token: string): ProjectContract | null {
    if (!token) return null;
    return memoryState.projects.find((p) => p.invitationToken === token) || null;
  },

  claimInvitation(
    token: string,
    claimingUser: {
      name: string;
      email: string;
      avatar: string;
      milestoneOSId: string;
      role: "client" | "freelancer";
      companyOrTitle?: string;
    }
  ): ProjectContract | null {
    const project = memoryState.projects.find((p) => p.invitationToken === token);
    if (!project) return null;
    if (project.invitationStatus === "revoked") return null;

    const isClientSender = project.initiatedBy === "client";
    const nowStr = new Date().toISOString();

    if (isClientSender) {
      project.freelancer = {
        name: claimingUser.name,
        email: claimingUser.email,
        avatar: claimingUser.avatar,
        title: claimingUser.companyOrTitle || "Specialist Freelancer",
        rating: 5.0,
        milestoneOSId: claimingUser.milestoneOSId,
      };
    } else {
      project.client = {
        name: claimingUser.name,
        email: claimingUser.email,
        avatar: claimingUser.avatar,
        company: claimingUser.companyOrTitle || "Client Organization",
        milestoneOSId: claimingUser.milestoneOSId,
      };
    }

    project.status = "active";
    project.proposalStatus = "accepted";
    project.acceptedAt = nowStr;
    project.acceptedByMilestoneOSId = claimingUser.milestoneOSId;
    project.termsAgreed = true;
    project.invitationStatus = "claimed";

    project.milestones.forEach((m) => {
      if (!m.status) {
        m.status = "not_started";
      }
    });

    const activity: ActivityItem = {
      id: `act_${Date.now()}`,
      action: `${claimingUser.name} accepted the project proposal via private invitation link. Agreement is now active.`,
      actor: claimingUser.name,
      actorRole: claimingUser.role,
      timestamp: "Just now",
    };
    project.activityLog.unshift(activity);

    persistDatabase();
    return project;
  },

  revokeInvitation(token: string): boolean {
    const project = memoryState.projects.find((p) => p.invitationToken === token);
    if (!project) return false;
    project.invitationStatus = "revoked";
    project.status = "rejected";
    project.proposalStatus = "rejected";
    persistDatabase();
    return true;
  },

  createProject(project: ProjectContract): ProjectContract {
    memoryState.projects.unshift(project);
    persistDatabase();
    return project;
  },

  updateProject(id: string, updates: Partial<ProjectContract>): ProjectContract | null {
    const idx = memoryState.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    memoryState.projects[idx] = { ...memoryState.projects[idx], ...updates };
    persistDatabase();
    return memoryState.projects[idx];
  },

  updateProjectStatus(
    id: string,
    status: ProjectStatus,
    feedback?: string
  ): ProjectContract | null {
    const project = memoryState.projects.find((p) => p.id === id);
    if (!project) return null;

    project.status = status;
    if (status === "active") {
      project.termsAgreed = true;
      project.acceptedAt = new Date().toISOString();
      project.milestones.forEach((m, idx) => {
        if (m.status === "not_started" && idx === 0) {
          m.status = "in_progress";
        }
      });
    } else if (status === "changes_requested") {
      project.proposalFeedback = feedback;
    }

    persistDatabase();
    return project;
  },

  submitMilestoneWork(
    projectId: string,
    milestoneId: string,
    submission: MilestoneSubmission,
    audit?: AIAssessment
  ): { project: ProjectContract; milestone: any } | null {
    const project = memoryState.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    milestone.submissions.push(submission);
    milestone.status = "submitted";
    if (audit) {
      milestone.latestAudit = audit;
      submission.aiAssessment = audit;
    }

    const activity: ActivityItem = {
      id: `act_${Date.now()}`,
      action: `Submitted work for Stage 0${milestone.stageNumber}: ${milestone.title}`,
      actor: project.freelancer.name,
      actorRole: "freelancer",
      timestamp: "Just now",
      milestoneTitle: milestone.title,
    };
    project.activityLog.unshift(activity);

    persistDatabase();
    return { project, milestone };
  },

  reviewMilestone(
    projectId: string,
    milestoneId: string,
    action: "approve" | "request_changes",
    feedback?: string
  ): { project: ProjectContract; milestone: any } | null {
    const project = memoryState.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    if (action === "approve") {
      milestone.status = "approved";
      const activity: ActivityItem = {
        id: `act_${Date.now()}`,
        action: `Approved Stage 0${milestone.stageNumber}: ${milestone.title}. Ready for payment release.`,
        actor: project.client.name,
        actorRole: "client",
        timestamp: "Just now",
        milestoneTitle: milestone.title,
      };
      project.activityLog.unshift(activity);
    } else {
      milestone.status = "changes_requested";
      const activity: ActivityItem = {
        id: `act_${Date.now()}`,
        action: `Requested revisions on Stage 0${milestone.stageNumber}: ${milestone.title}`,
        actor: project.client.name,
        actorRole: "client",
        timestamp: "Just now",
        details: feedback,
        milestoneTitle: milestone.title,
      };
      project.activityLog.unshift(activity);
    }

    persistDatabase();
    return { project, milestone };
  },

  recordPayment(
    projectId: string,
    milestoneId: string,
    capture: CaptureOrderResult
  ): { project: ProjectContract; milestone: any; transaction: TransactionRecord } | null {
    const project = memoryState.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    milestone.status = "paid";
    milestone.paidAt = capture.timestamp;
    milestone.paypalTransactionId = capture.captureId;

    // Update project total paid
    project.totalPaid = (project.totalPaid || 0) + milestone.amount;

    // In flexible milestone management, each milestone maintains its own independent status.
    const allPaid = project.milestones.every((m) => m.status === "paid");
    if (allPaid) {
      project.status = "completed";
    }

    // Create ledger transaction
    const newTx: TransactionRecord = {
      id: `tx_${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      amount: milestone.amount,
      currency: "USD",
      status: "completed",
      payer: project.client.name,
      payee: project.freelancer.name,
      paidAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      paypalTransactionId: capture.captureId,
      isSimulated: capture.isSimulated ?? false,
    };

    memoryState.transactions.unshift(newTx);

    const activity: ActivityItem = {
      id: `act_${Date.now()}`,
      action: `Released payment ($${milestone.amount.toLocaleString()} USD) for Stage 0${milestone.stageNumber}: ${milestone.title} via PayPal Capture ${capture.captureId}`,
      actor: project.client.name,
      actorRole: "client",
      timestamp: "Just now",
      milestoneTitle: milestone.title,
    };
    project.activityLog.unshift(activity);

    persistDatabase();
    return { project, milestone, transaction: newTx };
  },

  addMilestone(
    projectId: string,
    milestone: {
      title: string;
      description: string;
      amount: number;
      dueDate?: string;
      acceptanceCriteria?: string[];
    }
  ): { project: ProjectContract; milestone: any } | null {
    const project = memoryState.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const newStageNumber = project.milestones.length + 1;
    const newId = `ms_${Date.now()}`;
    const newMilestone: any = {
      id: newId,
      stageNumber: newStageNumber,
      title: milestone.title,
      description: milestone.description || "Milestone deliverables agreed with client.",
      amount: milestone.amount,
      currency: project.currency || "USD",
      dueDate: milestone.dueDate || project.targetDeadline || "TBD",
      status: "not_started",
      acceptanceCriteria: (milestone.acceptanceCriteria || []).map((critTitle, idx) => ({
        id: `crit_${Date.now()}_${idx}`,
        title: critTitle,
        description: `Verified deliverable for ${critTitle}`,
        status: "pending",
      })),
      submissions: [],
    };

    project.milestones.push(newMilestone);
    project.totalBudget = (project.totalBudget || 0) + milestone.amount;

    const activity: ActivityItem = {
      id: `act_${Date.now()}`,
      action: `${project.freelancer.name} added a new milestone: Stage 0${newStageNumber}: "${milestone.title}" ($${milestone.amount.toLocaleString()} USD).`,
      actor: project.freelancer.name,
      actorRole: "freelancer",
      timestamp: "Just now",
      milestoneTitle: milestone.title,
    };
    project.activityLog.unshift(activity);

    persistDatabase();
    return { project, milestone: newMilestone };
  },

  editMilestone(
    projectId: string,
    milestoneId: string,
    updates: {
      title?: string;
      description?: string;
      amount?: number;
      dueDate?: string;
    }
  ): { project: ProjectContract; milestone: any } | null {
    const project = memoryState.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    if (milestone.status === "paid" || milestone.status === "approved") {
      return null;
    }

    if (updates.amount !== undefined && updates.amount !== milestone.amount) {
      const diff = updates.amount - milestone.amount;
      project.totalBudget = (project.totalBudget || 0) + diff;
      milestone.amount = updates.amount;
    }

    if (updates.title) milestone.title = updates.title;
    if (updates.description) milestone.description = updates.description;
    if (updates.dueDate) milestone.dueDate = updates.dueDate;

    persistDatabase();
    return { project, milestone };
  },

  getTransactions(): TransactionRecord[] {
    return memoryState.transactions;
  },

  getNotifications(): NotificationItem[] {
    return memoryState.notifications;
  },
};
