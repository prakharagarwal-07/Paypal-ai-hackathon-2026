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
} from "@/lib/dashboard-data";
import { CaptureOrderResult } from "./paypal";

interface DatabaseState {
  projects: ProjectContract[];
  transactions: TransactionRecord[];
  notifications: NotificationItem[];
}

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "milestoneos_db.json");

let memoryState: DatabaseState = {
  projects: [...INITIAL_PROJECTS],
  transactions: [...INITIAL_TRANSACTIONS],
  notifications: [...INITIAL_NOTIFICATIONS],
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

    // Advance next milestone if available
    const nextMilestone = project.milestones.find((m) => m.status === "not_started");
    if (nextMilestone) {
      nextMilestone.status = "in_progress";
    } else {
      const allPaid = project.milestones.every((m) => m.status === "paid");
      if (allPaid) {
        project.status = "completed";
      }
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

  getTransactions(): TransactionRecord[] {
    return memoryState.transactions;
  },

  getNotifications(): NotificationItem[] {
    return memoryState.notifications;
  },
};
