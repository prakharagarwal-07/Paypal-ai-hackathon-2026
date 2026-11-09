import { NextRequest, NextResponse } from "next/server";
import { verifyMilestoneWithAI } from "@/server/gemini";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, milestoneId, submission } = body;

    if (!projectId || !milestoneId) {
      return NextResponse.json(
        { error: "projectId and milestoneId are required" },
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

    const assessment = await verifyMilestoneWithAI({
      milestoneTitle: milestone.title,
      milestoneDescription: milestone.description,
      acceptanceCriteria: milestone.acceptanceCriteria,
      submission: submission || {
        notes: "Automated verification requested for milestone deliverables.",
      },
    });

    return NextResponse.json({
      success: true,
      assessment,
      milestoneId: milestone.id,
      projectTitle: project.title,
    });
  } catch (err: any) {
    console.error("AI Verification API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to perform AI acceptance check" },
      { status: 500 }
    );
  }
}
