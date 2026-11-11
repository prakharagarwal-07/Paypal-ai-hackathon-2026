/**
 * MilestoneOS — Server-Side Multi-User Database & Ledger Store
 * Provides persistent project, milestone, submission, transaction, and multi-user storage
 * with full demo-data isolation and Supabase synchronization.
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
  generateBaseCode,
  extractBaseCode,
  formatClientId,
  formatFreelancerId,
  generateInvitationToken,
  isProjectAccepted,
} from "@/lib/dashboard-data";
import { CaptureOrderResult } from "./paypal";
import { getServerSupabase } from "./supabase";

export interface ProjectFilter {
  userId?: string;
  userEmail?: string;
  milestoneOSId?: string;
  role?: "client" | "freelancer";
  isDemo?: boolean;
  status?: string;
}

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
        // Ensure demo projects are always present for demo mode
        const existingDemoIds = new Set(parsed.projects.filter((p: ProjectContract) => p.isDemo).map((p: ProjectContract) => p.id));
        const missingDemos = INITIAL_PROJECTS.filter((p) => !existingDemoIds.has(p.id));
        memoryState = {
          ...parsed,
          projects: [...parsed.projects, ...missingDemos],
          users: [...MILESTONEOS_DIRECTORY],
        };
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
  /**
   * Retrieves projects scoped strictly to the authenticated user and perspective role.
   * Demo projects are ONLY returned when filter.isDemo === true.
   */
  getProjects(filter?: ProjectFilter): ProjectContract[] {
    const isDemo = Boolean(filter?.isDemo);
    const userId = filter?.userId?.trim();
    const userEmail = filter?.userEmail?.trim().toLowerCase();
    const role = filter?.role;
    const status = filter?.status;

    // 1. Explicit Demo Mode: Only return designated demo projects (Sarah & Rohan)
    if (isDemo) {
      let demos = memoryState.projects.filter((p) => Boolean(p.isDemo));
      if (status) {
        demos = demos.filter((p) => p.status === status);
      }
      return demos;
    }

    // 2. Real Registered Users: Filter projects where user is authorized participant
    const userMsoId = filter?.milestoneOSId?.trim().toUpperCase();
    const userBaseCode = extractBaseCode(userMsoId);

    if (userId || userEmail || userMsoId) {
      return memoryState.projects.filter((p) => {
        // Exclude demo projects from normal user views
        if (p.isDemo) return false;

        // Apply status filter if provided
        if (status && p.status !== status) return false;

        const clientBase = extractBaseCode(p.client.milestoneOSId);
        const freelancerBase = extractBaseCode(p.freelancer.milestoneOSId);

        const isClient =
          (userId && (p.clientId === userId || p.client.id === userId)) ||
          (userEmail && p.client.email?.toLowerCase() === userEmail) ||
          (userMsoId && p.client.milestoneOSId?.toUpperCase() === userMsoId) ||
          (userBaseCode && clientBase === userBaseCode);

        const isFreelancer =
          (userId && (p.freelancerId === userId || p.freelancer.id === userId)) ||
          (userEmail && p.freelancer.email?.toLowerCase() === userEmail) ||
          (userMsoId && p.freelancer.milestoneOSId?.toUpperCase() === userMsoId) ||
          (userBaseCode && freelancerBase === userBaseCode);

        if (role === "client") return isClient;
        if (role === "freelancer") return isFreelancer;

        // If no role filter, user is allowed if they are either party
        return isClient || isFreelancer;
      });
    }

    // 3. Fallback for unauthenticated requests: Never leak demo or user data
    return [];
  },

  /**
   * Retrieves a single project by ID, verifying user authorization if authUser is provided.
   */
  getProjectById(id: string, authUser?: { id?: string; email?: string; milestoneOSId?: string; isDemo?: boolean }): ProjectContract | undefined {
    const project = memoryState.projects.find((p) => p.id === id);
    if (!project) return undefined;

    // When authUser is provided, enforce strict security authorization checks
    if (authUser) {
      if (project.isDemo && authUser.isDemo) {
        return project;
      }
      if (project.isDemo && !authUser.isDemo) {
        return undefined;
      }

      const uId = authUser.id;
      const uEmail = authUser.email?.toLowerCase();
      const uMso = authUser.milestoneOSId?.trim().toUpperCase();
      const uBase = extractBaseCode(uMso);

      const clientBase = extractBaseCode(project.client.milestoneOSId);
      const freelancerBase = extractBaseCode(project.freelancer.milestoneOSId);

      const isAuthorized =
        (uId && (project.clientId === uId || project.freelancerId === uId || project.client.id === uId || project.freelancer.id === uId)) ||
        (uEmail && (project.client.email?.toLowerCase() === uEmail || project.freelancer.email?.toLowerCase() === uEmail)) ||
        (uMso && (project.client.milestoneOSId?.toUpperCase() === uMso || project.freelancer.milestoneOSId?.toUpperCase() === uMso)) ||
        (uBase && (clientBase === uBase || freelancerBase === uBase));

      if (isAuthorized) return project;
      return undefined;
    }

    // Direct internal server calls (PayPal order creation, AI invoice generation)
    return project;
  },

  findUserByBaseCode(codeOrId: string): MilestoneOSUser | null {
    if (!codeOrId) return null;
    const base = extractBaseCode(codeOrId);
    return memoryState.users.find((u) => {
      const uBase = extractBaseCode(u.milestoneOSId) || extractBaseCode(u.baseCode);
      return uBase === base;
    }) || null;
  },

  findUserByMilestoneOSId(id: string): MilestoneOSUser | null {
    return this.findUserByBaseCode(id);
  },

  getProjectByInvitationToken(token: string): ProjectContract | null {
    if (!token) return null;
    return memoryState.projects.find((p) => p.invitationToken === token) || null;
  },

  claimInvitation(
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
  ): ProjectContract | null {
    const project = memoryState.projects.find((p) => p.invitationToken === token);
    if (!project) return null;
    if (project.invitationStatus === "revoked") return null;

    const isClientSender = project.initiatedBy === "client";
    const nowStr = new Date().toISOString();

    if (isClientSender) {
      project.freelancer = {
        id: claimingUser.id,
        name: claimingUser.name,
        email: claimingUser.email,
        avatar: claimingUser.avatar,
        title: claimingUser.companyOrTitle || "Freelancer",
        rating: 5.0,
        milestoneOSId: claimingUser.milestoneOSId,
      };
      project.freelancerId = claimingUser.id;
    } else {
      project.client = {
        id: claimingUser.id,
        name: claimingUser.name,
        email: claimingUser.email,
        avatar: claimingUser.avatar,
        company: claimingUser.companyOrTitle || "Client Organization",
        milestoneOSId: claimingUser.milestoneOSId,
      };
      project.clientId = claimingUser.id;
    }

    project.status = "active";
    project.proposalStatus = "accepted";
    project.acceptedAt = nowStr;
    project.acceptedByMilestoneOSId = claimingUser.milestoneOSId;
    project.termsAgreed = true;
    project.invitationStatus = "claimed";

    project.milestones.forEach((m, idx) => {
      if (!m.status || m.status === "not_started") {
        m.status = idx === 0 ? "in_progress" : "not_started";
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

    // Async sync with Supabase project_members
    const supabase = getServerSupabase();
    if (supabase && claimingUser.id) {
      Promise.resolve(
        supabase
          .from("project_members")
          .insert({
            project_id: project.id,
            user_id: claimingUser.id,
            project_role: isClientSender ? "freelancer" : "client",
            membership_status: "accepted",
          })
      ).catch(() => {});
    }

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

  createProject(project: ProjectContract, creatorId?: string): ProjectContract {
    // Preserve demo flag if created in demo mode
    project.isDemo = Boolean(project.isDemo);

    let cid = project.clientId || project.client?.id;
    let fid = project.freelancerId || project.freelancer?.id;

    if (project.initiatedBy === "client") {
      if (creatorId) cid = creatorId;
    } else if (project.initiatedBy === "freelancer") {
      if (creatorId) fid = creatorId;
    }

    if (cid) {
      project.clientId = cid;
      if (project.client) project.client.id = cid;
    }
    if (fid) {
      project.freelancerId = fid;
      if (project.freelancer) project.freelancer.id = fid;
    }

    if (!project.invitationToken) {
      project.invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      project.invitationStatus = "active";
    }

    memoryState.projects.unshift(project);
    persistDatabase();

    // Async sync to Supabase if connected
    const supabase = getServerSupabase();
    if (supabase && creatorId) {
      Promise.resolve(
        supabase
          .from("projects")
          .insert({
            id: project.id,
            title: project.title,
            description: project.description,
            category: project.category,
            currency: project.currency || "USD",
            total_budget: project.totalBudget,
            target_deadline: project.targetDeadline,
            status: project.status,
            proposal_status: project.proposalStatus || "draft",
            terms_agreed: project.termsAgreed || false,
            client_id: project.clientId || null,
            freelancer_id: project.freelancerId || null,
            client_name: project.client.name,
            client_email: project.client.email,
            client_company: project.client.company,
            client_mso_id: project.client.milestoneOSId,
            freelancer_name: project.freelancer.name,
            freelancer_email: project.freelancer.email,
            freelancer_title: project.freelancer.title,
            freelancer_mso_id: project.freelancer.milestoneOSId,
            initiated_by: project.initiatedBy,
            initiator_mso_id: project.initiatorMilestoneOSId,
            invitation_token: project.invitationToken || null,
            invitation_status: project.invitationStatus || "active",
            is_demo: false,
          })
      )
        .then(() => {
          return Promise.resolve(
            supabase.from("project_members").insert({
              project_id: project.id,
              user_id: creatorId,
              project_role: project.initiatedBy,
              membership_status: "owner",
            })
          );
        })
        .catch(() => {});
    }

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
      project.proposalStatus = "accepted";
      project.invitationStatus = "claimed";
      project.acceptedAt = new Date().toISOString();
      project.milestones.forEach((m, idx) => {
        if (m.status === "not_started" && idx === 0) {
          m.status = "in_progress";
        }
      });
    } else if (status === "changes_requested") {
      project.proposalStatus = "changes_requested";
      project.proposalFeedback = feedback;
    } else if (status === "rejected") {
      project.proposalStatus = "rejected";
    }

    const actorName = project.initiatedBy === "client" ? project.freelancer.name : project.client.name;
    const actorRole = project.initiatedBy === "client" ? "freelancer" : "client";
    const activity: ActivityItem = {
      id: `act_${Date.now()}`,
      action: status === "active"
        ? `${actorName} accepted the project proposal. Contract terms are now mutually agreed and active.`
        : status === "changes_requested"
        ? `${actorName} requested revisions: "${feedback}".`
        : `${actorName} declined the project proposal.`,
      actor: actorName,
      actorRole,
      timestamp: "Just now",
    };
    project.activityLog.unshift(activity);

    // Notify the proposer of the decision
    const proposerId = project.initiatedBy === "client" ? project.clientId : project.freelancerId;
    if (proposerId) {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        timestamp: "Just now",
        title: status === "active" ? "Proposal Accepted!" : status === "changes_requested" ? "Proposal Changes Requested" : "Proposal Declined",
        message: status === "active"
          ? `${actorName} accepted your project proposal for "${project.title}". Milestone 01 is now in progress!`
          : `${actorName} responded to your proposal for "${project.title}".`,
        type: status === "active" ? "approval" : "proposal",
        unread: true,
        projectId: project.id,
        userId: proposerId,
        isDemo: false,
      };
      db.createNotification(notif);
    }

    persistDatabase();

    const supabase = getServerSupabase();
    if (supabase) {
      Promise.resolve(
        supabase
          .from("projects")
          .update({
            status: project.status,
            proposal_status: project.proposalStatus || "accepted",
            terms_agreed: project.termsAgreed || false,
          })
          .eq("id", project.id)
      ).catch(() => {});
    }

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

  setMilestoneAudit(
    projectId: string,
    milestoneId: string,
    audit: AIAssessment
  ): { project: ProjectContract; milestone: any } | null {
    const project = memoryState.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    milestone.latestAudit = audit;
    if (milestone.submissions && milestone.submissions.length > 0) {
      milestone.submissions[milestone.submissions.length - 1].aiAssessment = audit;
    }

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
    project.escrowReleased = (project.escrowReleased || 0) + milestone.amount;

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
      currency: milestone.currency || project.currency || "USD",
      status: "completed",
      payer: project.client.name,
      payee: project.freelancer.name,
      payerId: project.clientId,
      payeeId: project.freelancerId,
      paidAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      paypalTransactionId: capture.captureId,
      isSimulated: capture.isSimulated ?? false,
      isDemo: Boolean(project.isDemo),
    };

    memoryState.transactions.unshift(newTx);

    const curr = milestone.currency || project.currency || "USD";
    const currSym = curr.toUpperCase() === "INR" ? "₹" : "$";
    const activity: ActivityItem = {
      id: `act_${Date.now()}`,
      action: `Released payment (${currSym}${milestone.amount.toLocaleString()} ${curr}) for Stage 0${milestone.stageNumber}: ${milestone.title} via PayPal Capture ${capture.captureId}`,
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

    // Milestone price is strictly immutable once contract is accepted
    const isAccepted = isProjectAccepted(project);
    if (!isAccepted && updates.amount !== undefined && updates.amount !== milestone.amount) {
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

  /**
   * Retrieves transactions scoped to authorized user projects or demo mode.
   */
  getTransactions(filter?: { userId?: string; userEmail?: string; isDemo?: boolean; projectId?: string }): TransactionRecord[] {
    const isDemo = Boolean(filter?.isDemo);
    const userId = filter?.userId?.trim();
    const userEmail = filter?.userEmail?.trim().toLowerCase();
    const projectId = filter?.projectId;

    if (isDemo) {
      let txs = memoryState.transactions.filter((t) => t.isDemo);
      if (projectId) txs = txs.filter((t) => t.projectId === projectId);
      return txs;
    }

    if (userId || userEmail) {
      // Find project IDs where user is client or freelancer
      const userProjects = db.getProjects({ userId, userEmail });
      const userProjectIds = new Set(userProjects.map((p) => p.id));

      let txs = memoryState.transactions.filter((t) => !t.isDemo && (userProjectIds.has(t.projectId) || (userId && (t.payerId === userId || t.payeeId === userId))));
      if (projectId) txs = txs.filter((t) => t.projectId === projectId);
      return txs;
    }

    return [];
  },

  /**
   * Retrieves notifications scoped to user or demo mode.
   */
  getNotifications(filter?: { userId?: string; isDemo?: boolean }): NotificationItem[] {
    if (filter?.isDemo) {
      return memoryState.notifications.filter((n) => n.isDemo);
    }

    if (filter?.userId) {
      return memoryState.notifications.filter((n) => !n.isDemo && n.userId === filter.userId);
    }

    return [];
  },

  /**
   * Creates a notification for a user.
   */
  createNotification(item: NotificationItem): NotificationItem {
    memoryState.notifications.unshift(item);
    persistDatabase();

    const supabase = getServerSupabase();
    if (supabase && item.userId) {
      Promise.resolve(
        supabase.from("notifications").insert({
          id: item.id,
          user_id: item.userId,
          title: item.title,
          message: item.message,
          type: item.type,
          project_id: item.projectId,
          is_read: !item.unread,
        })
      ).catch(() => {});
    }

    return item;
  },
};
