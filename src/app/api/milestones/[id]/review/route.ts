import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: milestoneId } = await params;
    const body = await req.json();
    const { projectId, action, feedback } = body;

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

    const project = db.getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const result = db.reviewMilestone(projectId, milestoneId, action, feedback);

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
