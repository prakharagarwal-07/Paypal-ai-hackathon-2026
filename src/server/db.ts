/**
 * MilestoneOS — Server-Side Multi-User Database & Ledger Store
 * Single Source of Truth: Supabase PostgreSQL
 * Provides persistent project, milestone, submission, transaction, and multi-user storage
 * with full demo-data isolation and Supabase synchronization.
 */

import {
  ProjectContract,
  TransactionRecord,
  NotificationItem,
  ProjectStatus,
  AIAssessment,
  MilestoneSubmission,
  ActivityItem,
  MilestoneOSUser,
  MILESTONEOS_DIRECTORY,
  extractBaseCode,
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

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function rowToProject(row: any): ProjectContract {
  const base: ProjectContract = row.data && typeof row.data === "object" ? { ...row.data } : ({} as any);

  return {
    ...base,
    id: row.id,
    title: row.title || base.title || "Untitled Project",
    description: row.description ?? base.description ?? "",
    category: row.category || base.category || "Full-Stack Development",
    currency: row.currency || base.currency || "USD",
    totalBudget: Number(row.total_budget ?? base.totalBudget ?? 0),
    totalPaid: Number(row.total_paid ?? base.totalPaid ?? 0),
    escrowFunded: Number(row.escrow_funded ?? base.escrowFunded ?? 0),
    escrowReleased: Number(row.escrow_released ?? base.escrowReleased ?? 0),
    targetDeadline: row.target_deadline || base.targetDeadline || "TBD",
    status: (row.status || base.status || "active") as any,
    proposalStatus: (row.proposal_status || base.proposalStatus || "accepted") as any,
    termsAgreed: row.terms_agreed ?? base.termsAgreed ?? true,
    clientId: row.client_id || base.clientId,
    freelancerId: row.freelancer_id || base.freelancerId,
    client: {
      id: row.client_id || base.client?.id,
      name: row.client_name || base.client?.name || "Client",
      email: row.client_email || base.client?.email || "",
      avatar: base.client?.avatar || (row.client_name ? row.client_name.slice(0, 2).toUpperCase() : "CL"),
      company: row.client_company || base.client?.company || undefined,
      milestoneOSId: row.client_mso_id || base.client?.milestoneOSId || undefined,
    },
    freelancer: {
      id: row.freelancer_id || base.freelancer?.id,
      name: row.freelancer_name || base.freelancer?.name || "Freelancer",
      email: row.freelancer_email || base.freelancer?.email || "",
      avatar: base.freelancer?.avatar || (row.freelancer_name ? row.freelancer_name.slice(0, 2).toUpperCase() : "FL"),
      title: row.freelancer_title || base.freelancer?.title || undefined,
      rating: base.freelancer?.rating ?? 5.0,
      milestoneOSId: row.freelancer_mso_id || base.freelancer?.milestoneOSId || undefined,
    },
    initiatedBy: (row.initiated_by || base.initiatedBy || "client") as any,
    initiatorMilestoneOSId: row.initiator_mso_id || base.initiatorMilestoneOSId,
    invitationToken: row.invitation_token || base.invitationToken,
    invitationStatus: row.invitation_status || base.invitationStatus,
    isDemo: Boolean(row.is_demo ?? base.isDemo),
    milestones: Array.isArray(row.milestones) ? row.milestones : base.milestones || [],
    activityLog: Array.isArray(row.activity_log) ? row.activity_log : base.activityLog || [],
    createdAt:
      base.createdAt ||
      (row.created_at
        ? new Date(row.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "Today"),
  };
}

function projectToRow(p: ProjectContract, creatorId?: string): any {
  const cId = p.clientId || p.client?.id;
  const fId = p.freelancerId || p.freelancer?.id;
  const validCId = isValidUUID(cId) ? cId : null;
  const validFId = isValidUUID(fId) ? fId : null;

  if (validCId) {
    p.clientId = validCId;
    if (p.client) p.client.id = validCId;
  }
  if (validFId) {
    p.freelancerId = validFId;
    if (p.freelancer) p.freelancer.id = validFId;
  }

  return {
    id: p.id,
    title: p.title || "Untitled Project",
    description: p.description || "",
    category: p.category || "Full-Stack Development",
    currency: p.currency || "USD",
    total_budget: p.totalBudget || 0,
    total_paid: p.totalPaid || 0,
    escrow_funded: p.escrowFunded || 0,
    escrow_released: p.escrowReleased || 0,
    target_deadline: p.targetDeadline || "TBD",
    status: p.status || "active",
    proposal_status: p.proposalStatus || "accepted",
    terms_agreed: Boolean(p.termsAgreed ?? true),
    client_id: validCId,
    freelancer_id: validFId,
    client_name: p.client?.name || "Client",
    client_email: p.client?.email || "",
    client_company: p.client?.company || null,
    client_mso_id: p.client?.milestoneOSId || null,
    freelancer_name: p.freelancer?.name || "Freelancer",
    freelancer_email: p.freelancer?.email || "",
    freelancer_title: p.freelancer?.title || null,
    freelancer_mso_id: p.freelancer?.milestoneOSId || null,
    initiated_by: p.initiatedBy || "client",
    invitation_token: p.invitationToken || null,
    invitation_status: p.invitationStatus || "active",
    is_demo: Boolean(p.isDemo),
    milestones: p.milestones || [],
    activity_log: p.activityLog || [],
    data: p,
    updated_at: new Date().toISOString(),
  };
}

function rowToTransaction(row: any): TransactionRecord {
  const base: TransactionRecord = row.data && typeof row.data === "object" ? { ...row.data } : ({} as any);
  return {
    ...base,
    id: row.id,
    projectId: row.project_id || base.projectId,
    projectTitle: row.project_title || base.projectTitle || "",
    milestoneId: row.milestone_id || base.milestoneId,
    milestoneTitle: row.milestone_title || base.milestoneTitle || "",
    amount: Number(row.amount ?? base.amount ?? 0),
    currency: row.currency || base.currency || "USD",
    status: (row.status || base.status || "completed") as any,
    payer: row.payer || base.payer || "Client",
    payee: row.payee || base.payee || "Freelancer",
    payerId: row.payer_id || base.payerId,
    payeeId: row.payee_id || base.payeeId,
    paidAt:
      base.paidAt ||
      (row.paid_at
        ? new Date(row.paid_at).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Today"),
    paypalTransactionId: row.paypal_transaction_id || base.paypalTransactionId,
    isSimulated: Boolean(row.is_simulated ?? base.isSimulated),
    isDemo: Boolean(row.is_demo ?? base.isDemo),
  };
}

let cachedProjects: { data: ProjectContract[]; timestamp: number } | null = null;
let cachedTransactions: { data: TransactionRecord[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 10000; // 10s TTL for fast responses

export function invalidateServerCache() {
  cachedProjects = null;
  cachedTransactions = null;
}

async function getLiveProjects(): Promise<ProjectContract[]> {
  const now = Date.now();
  if (cachedProjects && now - cachedProjects.timestamp < CACHE_TTL_MS) {
    return cachedProjects.data;
  }
  const supabase = getServerSupabase();
  if (!supabase) return cachedProjects?.data || [];
  const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
  if (error || !data) {
    console.error("Supabase getLiveProjects error:", error);
    return cachedProjects?.data || [];
  }
  const mapped = data.map(rowToProject);
  cachedProjects = { data: mapped, timestamp: now };
  return mapped;
}

async function getLiveTransactions(): Promise<TransactionRecord[]> {
  const now = Date.now();
  if (cachedTransactions && now - cachedTransactions.timestamp < CACHE_TTL_MS) {
    return cachedTransactions.data;
  }
  const supabase = getServerSupabase();
  if (!supabase) return cachedTransactions?.data || [];
  const { data, error } = await supabase.from("transactions").select("*").order("paid_at", { ascending: false });
  if (error || !data) {
    console.error("Supabase getLiveTransactions error:", error);
    return cachedTransactions?.data || [];
  }
  const mapped = data.map(rowToTransaction);
  cachedTransactions = { data: mapped, timestamp: now };
  return mapped;
}

export const db = {
  /**
   * Retrieves projects scoped strictly to the authenticated user or demo sandbox.
   * Supabase PostgreSQL is the authoritative single source of truth with 10s server cache.
   */
  async getProjects(filter?: ProjectFilter): Promise<ProjectContract[]> {
    const all = await getLiveProjects();
    const isDemo = Boolean(filter?.isDemo);
    const userId = filter?.userId?.trim();
    const userEmail = filter?.userEmail?.trim().toLowerCase();
    const role = filter?.role;
    const status = filter?.status;

    // 1. Explicit Demo Mode: Return all demo projects
    if (isDemo) {
      let demos = all.filter((p) => p.isDemo);
      if (status) demos = demos.filter((p) => p.status === status);
      return demos;
    }

    // 2. Real Registered Users: Filter projects where user is authorized participant
    const userMsoId = filter?.milestoneOSId?.trim().toUpperCase();
    const userBaseCode = extractBaseCode(userMsoId);

    if (userId || userEmail || userMsoId) {
      return all.filter((p) => {
        if (status && p.status !== status) return false;

        const clientBase = extractBaseCode(p.client?.milestoneOSId);
        const freelancerBase = extractBaseCode(p.freelancer?.milestoneOSId);

        const isClient =
          (userId && (p.clientId === userId || p.client?.id === userId)) ||
          (userEmail && p.client?.email?.toLowerCase() === userEmail) ||
          (userMsoId && p.client?.milestoneOSId?.toUpperCase() === userMsoId) ||
          (userBaseCode && clientBase === userBaseCode);

        const isFreelancer =
          (userId && (p.freelancerId === userId || p.freelancer?.id === userId)) ||
          (userEmail && p.freelancer?.email?.toLowerCase() === userEmail) ||
          (userMsoId && p.freelancer?.milestoneOSId?.toUpperCase() === userMsoId) ||
          (userBaseCode && freelancerBase === userBaseCode);

        if (role === "client") return isClient;
        if (role === "freelancer") return isFreelancer;
        return isClient || isFreelancer;
      });
    }

    // 3. Fallback for unauthenticated requests or system health checks
    if (!filter) {
      return all;
    }

    return [];
  },

  /**
   * Retrieves a single project by ID, verifying user authorization if authUser is provided.
   */
  async getProjectById(
    id: string,
    authUser?: { id?: string; email?: string; milestoneOSId?: string; isDemo?: boolean }
  ): Promise<ProjectContract | undefined> {
    const all = await getLiveProjects();
    const project = all.find((p) => p.id === id);
    if (!project) return undefined;

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

      const clientBase = extractBaseCode(project.client?.milestoneOSId);
      const freelancerBase = extractBaseCode(project.freelancer?.milestoneOSId);

      const isAuthorized =
        (uId &&
          (project.clientId === uId ||
            project.freelancerId === uId ||
            project.client?.id === uId ||
            project.freelancer?.id === uId)) ||
        (uEmail &&
          (project.client?.email?.toLowerCase() === uEmail ||
            project.freelancer?.email?.toLowerCase() === uEmail)) ||
        (uMso &&
          (project.client?.milestoneOSId?.toUpperCase() === uMso ||
            project.freelancer?.milestoneOSId?.toUpperCase() === uMso)) ||
        (uBase && (clientBase === uBase || freelancerBase === uBase));

      if (isAuthorized) return project;
      return undefined;
    }

    return project;
  },

  findUserByBaseCode(codeOrId: string): MilestoneOSUser | null {
    if (!codeOrId) return null;
    const base = extractBaseCode(codeOrId);
    return (
      MILESTONEOS_DIRECTORY.find((u) => {
        const uBase = extractBaseCode(u.milestoneOSId) || extractBaseCode(u.baseCode);
        return uBase === base;
      }) || null
    );
  },

  findUserByMilestoneOSId(id: string): MilestoneOSUser | null {
    return this.findUserByBaseCode(id);
  },

  async getProjectByInvitationToken(token: string): Promise<ProjectContract | null> {
    if (!token) return null;
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase.from("projects").select("*").eq("invitation_token", token).maybeSingle();
    if (error || !data) return null;
    return rowToProject(data);
  },

  async claimInvitation(
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
  ): Promise<ProjectContract | null> {
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data } = await supabase.from("projects").select("*").eq("invitation_token", token).maybeSingle();
    if (!data) return null;

    const project = rowToProject(data);
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

    const row = projectToRow(project);
    await supabase.from("projects").upsert(row, { onConflict: "id" });

    if (claimingUser.id && isValidUUID(claimingUser.id)) {
      try {
        await supabase.from("project_members").upsert(
          {
            project_id: project.id,
            user_id: claimingUser.id,
            project_role: isClientSender ? "freelancer" : "client",
            membership_status: "accepted",
          },
          { onConflict: "project_id,user_id,project_role" }
        );
      } catch (_) {}
    }

    invalidateServerCache();
    return project;
  },

  async revokeInvitation(token: string): Promise<boolean> {
    if (!token) return false;
    const supabase = getServerSupabase();
    if (!supabase) return false;

    const { error } = await supabase
      .from("projects")
      .update({
        invitation_status: "revoked",
        status: "rejected",
        proposal_status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("invitation_token", token);

    invalidateServerCache();
    return !error;
  },

  async createProject(project: ProjectContract, creatorId?: string): Promise<ProjectContract> {
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

    const supabase = getServerSupabase();
    if (supabase) {
      const row = projectToRow(project, creatorId);
      const { error } = await supabase.from("projects").upsert(row, { onConflict: "id" });
      if (error) {
        console.error("Supabase createProject error:", error);
        throw new Error(`Failed to save project to Supabase: ${error.message}`);
      }

      // Automatically create persistent Supabase notification for the recipient
      const recipientId = project.initiatedBy === "client" ? project.freelancerId : project.clientId;
      const senderName = project.initiatedBy === "client" ? project.client?.name : project.freelancer?.name;
      const currSym = (project.currency || "USD") === "INR" ? "₹" : "$";
      if (recipientId && isValidUUID(recipientId)) {
        try {
          await supabase.from("notifications").upsert(
            {
              id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              user_id: recipientId,
              project_id: project.id,
              title: project.initiatedBy === "client" ? "Project Assignment Received" : "Incoming Project Proposal",
              message: `${senderName || "Counterparty"} sent you a project proposal: "${project.title}" (${currSym}${project.totalBudget.toLocaleString()} ${project.currency || "USD"}). Review to accept.`,
              type: "proposal",
              unread: true,
              is_demo: Boolean(project.isDemo),
              created_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        } catch (notifErr) {
          console.warn("Could not insert recipient notification:", notifErr);
        }
      }
    }

    invalidateServerCache();
    return project;
  },

  async updateProject(id: string, updates: Partial<ProjectContract>): Promise<ProjectContract | null> {
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;

    const current = rowToProject(data);
    const updated: ProjectContract = { ...current, ...updates };
    const row = projectToRow(updated);
    const { error: upsertErr } = await supabase.from("projects").upsert(row, { onConflict: "id" });
    if (upsertErr) {
      console.error("Supabase updateProject error:", upsertErr);
      return null;
    }
    invalidateServerCache();
    return updated;
  },

  async updateProjectStatus(
    id: string,
    status: ProjectStatus,
    feedback?: string
  ): Promise<ProjectContract | null> {
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (!data) return null;

    const project = rowToProject(data);
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
      action:
        status === "active"
          ? `${actorName} accepted the project proposal. Contract terms are now mutually agreed and active.`
          : status === "changes_requested"
          ? `${actorName} requested revisions: "${feedback}".`
          : `${actorName} declined the project proposal.`,
      actor: actorName,
      actorRole,
      timestamp: "Just now",
    };
    project.activityLog.unshift(activity);

    const row = projectToRow(project);
    const { error: updateError } = await supabase.from("projects").upsert(row, { onConflict: "id" });
    if (updateError) {
      console.error("Supabase updateProjectStatus error:", updateError);
      throw new Error(`Failed to update project status in Supabase: ${updateError.message}`);
    }

    // Mark previous proposal notifications for this project as read
    try {
      await supabase
        .from("notifications")
        .update({ unread: false })
        .eq("project_id", project.id);
    } catch (_) {}

    // Notify the proposer of the decision
    const proposerId = project.initiatedBy === "client" ? project.clientId : project.freelancerId;
    if (proposerId) {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: "Just now",
        title:
          status === "active"
            ? "Proposal Accepted & Contract Active!"
            : status === "changes_requested"
            ? "Proposal Changes Requested"
            : "Proposal Declined",
        message:
          status === "active"
            ? `${actorName} accepted your project proposal for "${project.title}". Milestone 01 is now active!`
            : `${actorName} responded to your proposal for "${project.title}".`,
        type: status === "active" ? "approval" : "proposal",
        unread: true,
        projectId: project.id,
        userId: proposerId,
        isDemo: Boolean(project.isDemo),
      };
      await db.createNotification(notif);
    }

    invalidateServerCache();
    return project;
  },

  async submitMilestoneWork(
    projectId: string,
    milestoneId: string,
    submission: MilestoneSubmission,
    audit?: AIAssessment
  ): Promise<{ project: ProjectContract; milestone: any } | null> {
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
    if (!data) return null;

    const project = rowToProject(data);
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

    const row = projectToRow(project);
    await supabase.from("projects").upsert(row, { onConflict: "id" });

    invalidateServerCache();
    return { project, milestone };
  },

  async setMilestoneAudit(
    projectId: string,
    milestoneId: string,
    audit: AIAssessment
  ): Promise<{ project: ProjectContract; milestone: any } | null> {
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
    if (!data) return null;

    const project = rowToProject(data);
    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    milestone.latestAudit = audit;
    if (milestone.submissions && milestone.submissions.length > 0) {
      milestone.submissions[milestone.submissions.length - 1].aiAssessment = audit;
    }

    const row = projectToRow(project);
    await supabase.from("projects").upsert(row, { onConflict: "id" });

    invalidateServerCache();
    return { project, milestone };
  },

  async reviewMilestone(
    projectId: string,
    milestoneId: string,
    action: "approve" | "request_changes",
    feedback?: string
  ): Promise<{ project: ProjectContract; milestone: any } | null> {
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
    if (!data) return null;

    const project = rowToProject(data);
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

    const row = projectToRow(project);
    await supabase.from("projects").upsert(row, { onConflict: "id" });

    invalidateServerCache();
    return { project, milestone };
  },

  async recordPayment(
    projectId: string,
    milestoneId: string,
    capture: CaptureOrderResult
  ): Promise<{ project: ProjectContract; milestone: any; transaction: TransactionRecord } | null> {
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
    if (!data) return null;

    const project = rowToProject(data);
    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    milestone.status = "paid";
    milestone.paidAt = capture.timestamp || new Date().toISOString();
    milestone.paypalTransactionId = capture.captureId;

    // Update project totals
    project.totalPaid = (project.totalPaid || 0) + milestone.amount;
    project.escrowReleased = (project.escrowReleased || 0) + milestone.amount;

    const allPaid = project.milestones.every((m) => m.status === "paid");
    if (allPaid) {
      project.status = "completed";
    }

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

    // Save updated project to Supabase
    const row = projectToRow(project);
    await supabase.from("projects").upsert(row, { onConflict: "id" });

    // Save new transaction record to Supabase
    const txPayerId = project.clientId && isValidUUID(project.clientId) ? project.clientId : null;
    const txPayeeId = project.freelancerId && isValidUUID(project.freelancerId) ? project.freelancerId : null;

    const txRow = {
      id: newTx.id,
      project_id: project.id,
      project_title: project.title,
      milestone_id: milestone.id,
      milestone_title: milestone.title,
      payer_id: txPayerId,
      payer: project.client.name,
      payee_id: txPayeeId,
      payee: project.freelancer.name,
      amount: milestone.amount,
      currency: newTx.currency,
      status: "completed",
      paypal_transaction_id: capture.captureId,
      paid_at: new Date().toISOString(),
      is_simulated: Boolean(capture.isSimulated),
      is_demo: Boolean(project.isDemo),
      data: newTx,
    };
    await supabase.from("transactions").upsert(txRow, { onConflict: "id" });

    invalidateServerCache();
    return { project, milestone, transaction: newTx };
  },

  async addMilestone(
    projectId: string,
    milestone: {
      title: string;
      description: string;
      amount: number;
      dueDate?: string;
      acceptanceCriteria?: string[];
    }
  ): Promise<{ project: ProjectContract; milestone: any } | null> {
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
    if (!data) return null;

    const project = rowToProject(data);
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

    const row = projectToRow(project);
    await supabase.from("projects").upsert(row, { onConflict: "id" });

    invalidateServerCache();
    return { project, milestone: newMilestone };
  },

  async editMilestone(
    projectId: string,
    milestoneId: string,
    updates: {
      title?: string;
      description?: string;
      amount?: number;
      dueDate?: string;
    }
  ): Promise<{ project: ProjectContract; milestone: any } | null> {
    const supabase = getServerSupabase();
    if (!supabase) return null;

    const { data } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
    if (!data) return null;

    const project = rowToProject(data);
    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    if (milestone.status === "paid" || milestone.status === "approved") {
      return null;
    }

    const isAccepted = isProjectAccepted(project);
    if (!isAccepted && updates.amount !== undefined && updates.amount !== milestone.amount) {
      const diff = updates.amount - milestone.amount;
      project.totalBudget = (project.totalBudget || 0) + diff;
      milestone.amount = updates.amount;
    }

    if (updates.title) milestone.title = updates.title;
    if (updates.description) milestone.description = updates.description;
    if (updates.dueDate) milestone.dueDate = updates.dueDate;

    const row = projectToRow(project);
    await supabase.from("projects").upsert(row, { onConflict: "id" });

    invalidateServerCache();
    return { project, milestone };
  },

  async getTransactions(filter?: {
    userId?: string;
    userEmail?: string;
    isDemo?: boolean;
    projectId?: string;
  }): Promise<TransactionRecord[]> {
    const all = await getLiveTransactions();
    const isDemo = Boolean(filter?.isDemo);
    const userId = filter?.userId?.trim();
    const userEmail = filter?.userEmail?.trim().toLowerCase();
    const projectId = filter?.projectId;

    if (isDemo) {
      let demos = all.filter((t) => t.isDemo);
      if (projectId) demos = demos.filter((t) => t.projectId === projectId);
      return demos;
    }

    if (userId || userEmail) {
      const userProjects = await db.getProjects({ userId, userEmail });
      const userProjectIds = new Set(userProjects.map((p) => p.id));

      let userTxs = all.filter(
        (t) => userProjectIds.has(t.projectId) || (userId && (t.payerId === userId || t.payeeId === userId))
      );
      if (projectId) userTxs = userTxs.filter((t) => t.projectId === projectId);
      return userTxs;
    }

    if (!filter) {
      return all;
    }

    return [];
  },

  async getNotifications(filter?: { userId?: string; isDemo?: boolean }): Promise<NotificationItem[]> {
    const supabase = getServerSupabase();
    if (!supabase) return [];

    if (filter?.isDemo) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_demo", true)
        .order("created_at", { ascending: false });
      return (data || []).map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type || "general",
        unread: Boolean(n.unread),
        timestamp: n.created_at || "Just now",
        projectId: n.project_id || undefined,
        userId: n.user_id || undefined,
        isDemo: true,
      }));
    }

    if (filter?.userId) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_demo", false)
        .eq("user_id", filter.userId)
        .order("created_at", { ascending: false });
      return (data || []).map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type || "general",
        unread: Boolean(n.unread),
        timestamp: n.created_at || "Just now",
        projectId: n.project_id || undefined,
        userId: n.user_id || undefined,
        isDemo: false,
      }));
    }

    return [];
  },

  async createNotification(item: NotificationItem): Promise<NotificationItem> {
    const supabase = getServerSupabase();
    if (supabase) {
      const uId = item.userId && isValidUUID(item.userId) ? item.userId : null;
      try {
        await supabase.from("notifications").upsert(
          {
            id: item.id,
            user_id: uId,
            project_id: item.projectId || null,
            title: item.title,
            message: item.message,
            type: item.type || "general",
            unread: Boolean(item.unread ?? true),
            is_demo: Boolean(item.isDemo),
            created_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (_) {}
    }
    return item;
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const supabase = getServerSupabase();
    if (!supabase) return false;
    const { error } = await supabase.from("notifications").update({ unread: false }).eq("id", id);
    return !error;
  },

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const supabase = getServerSupabase();
    if (!supabase) return false;
    const { error } = await supabase.from("notifications").update({ unread: false }).eq("user_id", userId);
    return !error;
  },
};
