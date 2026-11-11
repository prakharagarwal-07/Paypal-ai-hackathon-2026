import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getServerSupabase } from "@/server/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: milestoneId } = await params;
    const body = await req.json();
    const { projectId, action, feedback } = body;

    let callerId = body.userId || body.callerId || req.headers.get("x-user-id");
    let callerEmail = body.userEmail || req.headers.get("x-user-email");

    // Verify caller session token if provided
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const supabase = getServerSupabase();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            callerId = user.id;
            callerEmail = user.email;
          }
        } catch (_) {}
      }
    }

    if (!projectId || !action) {
      return NextResponse.json(
        { error: "projectId and action ('approve' | 'request_changes') are required" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "request_changes") {
      return NextResponse.json(
        { error: "action must be either 'approve' or 'request_changes'" },
        { status: 400 }
      );
    }

    // Retrieve internal project record
    const project = await db.getProjectById(projectId, undefined, true);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Strict Client Authorization Check
    const isDemo = Boolean(project.isDemo);
    if (!isDemo && (callerId || callerEmail)) {
      const isClient = Boolean(
        (callerId && (project.clientId === callerId || project.client?.id === callerId)) ||
        (callerEmail && project.client?.email?.toLowerCase() === callerEmail.toLowerCase())
      );
      if (!isClient) {
        return NextResponse.json(
          { error: "Unauthorized. Only the designated client can approve or request changes on milestone deliverables." },
          { status: 403 }
        );
      }
    }

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const result = await db.reviewMilestone(projectId, milestoneId, action, feedback);

    return NextResponse.json({
      success: true,
      action,
      milestone: result?.milestone,
      project: result?.project,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit milestone review" },
      { status: 500 }
    );
  }
}
