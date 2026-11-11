import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { ProjectContract, ActivityItem, extractBaseCode } from "@/lib/dashboard-data";
import { getServerSupabase } from "@/server/supabase";

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

    const effectiveCreatorId = creatorId || (initiatedBy === "client" ? (body.clientId || client?.id) : (body.freelancerId || freelancer?.id));

    let resolvedClientId = body.clientId || client?.id;
    let resolvedFreelancerId = body.freelancerId || freelancer?.id;

    const supabase = getServerSupabase();
    if (supabase) {
      if (!resolvedFreelancerId && freelancer?.milestoneOSId) {
        const fBase = extractBaseCode(freelancer.milestoneOSId);
        try {
          const { data: fProfile } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .ilike("milestone_os_id", `%${fBase}%`)
            .maybeSingle();
          if (fProfile?.id) {
            resolvedFreelancerId = fProfile.id;
            if (fProfile.email && (!freelancer.email || freelancer.email.includes("@milestoneos.link"))) {
              freelancer.email = fProfile.email;
            }
          }
        } catch (_) {}
      }
      if (!resolvedClientId && client?.milestoneOSId) {
        const cBase = extractBaseCode(client.milestoneOSId);
        try {
          const { data: cProfile } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .ilike("milestone_os_id", `%${cBase}%`)
            .maybeSingle();
          if (cProfile?.id) {
            resolvedClientId = cProfile.id;
            if (cProfile.email && (!client.email || client.email.includes("@milestoneos.link"))) {
              client.email = cProfile.email;
            }
          }
        } catch (_) {}
      }
    }

    if (initiatedBy === "client") {
      resolvedClientId = resolvedClientId || effectiveCreatorId;
    } else {
      resolvedFreelancerId = resolvedFreelancerId || effectiveCreatorId;
    }

    const newProject: ProjectContract = {
      id: projectId,
      title,
      description: description || "",
      category,
      client: {
        ...client,
        id: resolvedClientId || client.id,
      },
      freelancer: {
        ...freelancer,
        id: resolvedFreelancerId || freelancer.id,
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
      isDemo: Boolean(body.isDemo),
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
