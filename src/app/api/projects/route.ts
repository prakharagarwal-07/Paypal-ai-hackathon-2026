import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { ProjectContract, ActivityItem, extractBaseCode } from "@/lib/dashboard-data";
import { getServerSupabase } from "@/server/supabase";
import { resolveCounterpartyIdentity } from "@/server/identity";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const isDemo = searchParams.get("isDemo") === "true";
    let userId = searchParams.get("userId") || undefined;
    let userEmail = searchParams.get("userEmail") || undefined;
    const milestoneOSId = searchParams.get("milestoneOSId") || undefined;
    const role = (searchParams.get("role") as "client" | "freelancer") || undefined;

    // Check Authorization header for Supabase Bearer Token
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const supabase = getServerSupabase();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            userId = user.id;
            userEmail = user.email;
          }
        } catch (_) {}
      }
    }

    // Also accept x-user-id and x-user-email headers
    if (!userId) userId = req.headers.get("x-user-id") || undefined;
    if (!userEmail) userEmail = req.headers.get("x-user-email") || undefined;

    const projects = await db.getProjects({
      userId,
      userEmail,
      milestoneOSId,
      role,
      isDemo,
      status,
    });

    return NextResponse.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category = "Full-Stack Development",
      targetDeadline,
      milestones = [],
      client,
      freelancer,
      initiatedBy = "client",
      asDraft = false,
      creatorId,
      isPublicInvitation = false,
      invitationToken,
      invitationStatus,
      invitationExpiresAt,
    } = body;

    if (!title || !client || !freelancer) {
      return NextResponse.json(
        { error: "Title, client, and freelancer are required" },
        { status: 400 }
      );
    }

    const totalBudget = milestones.reduce((sum: number, m: any) => sum + (Number(m.amount) || 0), 0);
    const projectId = `proj_${Date.now()}`;

    const activity: ActivityItem = {
      id: `act_${Date.now()}`,
      action: asDraft
        ? `Drafted project "${title}"`
        : isPublicInvitation
        ? `${initiatedBy === "client" ? client.name : freelancer.name} created shareable proposal link for "${title}"`
        : `${initiatedBy === "client" ? client.name : freelancer.name} submitted project proposal for mutual agreement`,
      actor: initiatedBy === "client" ? client.name : freelancer.name,
      actorRole: initiatedBy === "client" ? "client" : "freelancer",
      timestamp: "Just now",
    };

    let clientData = client ? { ...client } : {};
    let freelancerData = freelancer ? { ...freelancer } : {};

    const isValidUUID = (str?: string | null) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    const effectiveCreatorId = creatorId || (initiatedBy === "client" ? (body.clientId || clientData?.id) : (body.freelancerId || freelancerData?.id));

    let resolvedClientId = isValidUUID(body.clientId) ? body.clientId : isValidUUID(clientData?.id) ? clientData.id : null;
    let resolvedFreelancerId = isValidUUID(body.freelancerId) ? body.freelancerId : isValidUUID(freelancerData?.id) ? freelancerData.id : null;

    // Use Central Identity Resolution for non-public counterparties
    if (!isPublicInvitation) {
      if (initiatedBy === "client") {
        resolvedClientId = resolvedClientId || (isValidUUID(effectiveCreatorId) ? effectiveCreatorId : null);

        // Resolve Freelancer Counterparty
        const fIdentifier = freelancerData?.milestoneOSId || freelancerData?.id || body.freelancerId || freelancerData?.email;
        if (!fIdentifier) {
          return NextResponse.json(
            { error: "Freelancer identifier is required when creating a client request." },
            { status: 400 }
          );
        }

        const fResult = await resolveCounterpartyIdentity({
          identifier: fIdentifier,
          expectedRole: "freelancer",
          proposerId: resolvedClientId,
          proposerEmail: clientData?.email,
        });

        if (!fResult.success) {
          return NextResponse.json(
            { error: fResult.error, code: fResult.code },
            { status: 400 }
          );
        }

        resolvedFreelancerId = fResult.user.id;
        freelancerData = {
          ...freelancerData,
          id: fResult.user.id,
          name: fResult.user.name,
          email: fResult.user.email,
          avatar: fResult.user.avatar || freelancerData.avatar || "FL",
          title: fResult.user.title || freelancerData.title || "Independent Specialist",
          milestoneOSId: fResult.user.freelancerId,
          rating: fResult.user.rating || 5.0,
        };
      } else {
        // Initiated by freelancer
        resolvedFreelancerId = resolvedFreelancerId || (isValidUUID(effectiveCreatorId) ? effectiveCreatorId : null);

        // Resolve Client Counterparty
        const cIdentifier = clientData?.milestoneOSId || clientData?.id || body.clientId || clientData?.email;
        if (!cIdentifier) {
          return NextResponse.json(
            { error: "Client identifier is required when proposing a project." },
            { status: 400 }
          );
        }

        const cResult = await resolveCounterpartyIdentity({
          identifier: cIdentifier,
          expectedRole: "client",
          proposerId: resolvedFreelancerId,
          proposerEmail: freelancerData?.email,
        });

        if (!cResult.success) {
          return NextResponse.json(
            { error: cResult.error, code: cResult.code },
            { status: 400 }
          );
        }

        resolvedClientId = cResult.user.id;
        clientData = {
          ...clientData,
          id: cResult.user.id,
          name: cResult.user.name,
          email: cResult.user.email,
          avatar: cResult.user.avatar || clientData.avatar || "CL",
          company: cResult.user.company || clientData.company || "Client Organization",
          milestoneOSId: cResult.user.clientId,
        };
      }
    }

    // Safety check: Proposer and recipient must never be the exact same user
    if (!isPublicInvitation && resolvedClientId && resolvedFreelancerId && resolvedClientId === resolvedFreelancerId) {
      return NextResponse.json(
        { error: "Client and Freelancer must be different registered users. Self-assignment is not permitted." },
        { status: 400 }
      );
    }

    const newProject: ProjectContract = {
      id: projectId,
      title,
      description: description || "",
      category,
      client: {
        ...clientData,
        id: resolvedClientId || clientData.id,
      },
      freelancer: {
        ...freelancerData,
        id: resolvedFreelancerId || freelancerData.id,
      },
      clientId: resolvedClientId,
      freelancerId: resolvedFreelancerId,
      totalBudget,
      totalPaid: 0,
      escrowFunded: 0,
      escrowReleased: 0,
      currency: body.currency || "USD",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      targetDeadline: targetDeadline || "TBD",
      status: asDraft ? "draft" : "awaiting_acceptance",
      initiatedBy,
      termsAgreed: false,
      proposalStatus: asDraft ? "draft" : "awaiting_acceptance",
      isPublicInvitation: Boolean(isPublicInvitation),
      invitationToken: invitationToken || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      invitationStatus: invitationStatus || "active",
      invitationExpiresAt: invitationExpiresAt || undefined,
      isDemo: Boolean(
        (resolvedClientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resolvedClientId)) ||
        (resolvedFreelancerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resolvedFreelancerId))
          ? false
          : body.isDemo
      ),
      milestones: milestones.map((m: any, idx: number) => ({
        id: `m_${projectId}_${idx + 1}`,
        stageNumber: idx + 1,
        title: m.title || `Milestone ${idx + 1}`,
        description: m.description || "",
        amount: Number(m.amount) || 0,
        currency: m.currency || body.currency || "USD",
        dueDate: m.dueDate || "TBD",
        status: "not_started",
        acceptanceCriteria: (m.acceptanceCriteria || []).map((c: any, cIdx: number) => ({
          id: `crit_${projectId}_${idx + 1}_${cIdx + 1}`,
          title: typeof c === "string" ? c : c.title || c.text || `Requirement ${cIdx + 1}`,
          description: typeof c === "string" ? c : c.description || c.text || "",
          status: "pending",
        })),
        submissions: [],
      })),
      activityLog: [activity],
    };

    const saved = await db.createProject(newProject, effectiveCreatorId);

    return NextResponse.json({
      success: true,
      project: saved,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
