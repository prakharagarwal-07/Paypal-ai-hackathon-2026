import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { ProjectContract, ActivityItem } from "@/lib/dashboard-data";
import { getServerSupabase } from "@/server/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const isDemo = searchParams.get("isDemo") === "true";
    let userId = searchParams.get("userId") || undefined;
    let userEmail = searchParams.get("userEmail") || undefined;
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

    const projects = db.getProjects({
      userId,
      userEmail,
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

    const effectiveCreatorId = creatorId || body.clientId || (initiatedBy === "client" ? client.id : freelancer.id);

    const newProject: ProjectContract = {
      id: projectId,
      title,
      description: description || "",
      category,
      client: {
        ...client,
        id: client.id || (initiatedBy === "client" ? effectiveCreatorId : body.clientId),
      },
      freelancer: {
        ...freelancer,
        id: freelancer.id || (initiatedBy === "freelancer" ? effectiveCreatorId : body.freelancerId),
      },
      clientId: body.clientId || (initiatedBy === "client" ? effectiveCreatorId : undefined),
      freelancerId: body.freelancerId || (initiatedBy === "freelancer" ? effectiveCreatorId : undefined),
      totalBudget,
      totalPaid: 0,
      escrowFunded: 0,
      escrowReleased: 0,
      currency: "USD",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      targetDeadline: targetDeadline || "TBD",
      status: asDraft ? "draft" : "awaiting_acceptance",
      initiatedBy,
      termsAgreed: false,
      proposalStatus: asDraft ? "draft" : "awaiting_acceptance",
      isPublicInvitation: Boolean(isPublicInvitation || invitationToken || !freelancer.id),
      invitationToken: invitationToken || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      invitationStatus: invitationStatus || "active",
      invitationExpiresAt: invitationExpiresAt || undefined,
      isDemo: false,
      milestones: milestones.map((m: any, idx: number) => ({
        id: `m_${projectId}_${idx + 1}`,
        stageNumber: idx + 1,
        title: m.title || `Milestone ${idx + 1}`,
        description: m.description || "",
        amount: Number(m.amount) || 0,
        currency: "USD",
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

    const saved = db.createProject(newProject, effectiveCreatorId);

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
