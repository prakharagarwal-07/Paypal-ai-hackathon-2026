import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { verifyMilestoneWithAI } from "@/server/gemini";
import { MilestoneSubmission } from "@/lib/dashboard-data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: milestoneId } = await params;
    const body = await req.json();
    const { projectId, repoUrl, githubRepo, demoUrl, loomVideo, notes, deliverableLinks, attachments } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const project = await db.getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Work submissions only allowed when project is active
    if (project.status !== "active") {
      return NextResponse.json(
        { error: "Work submissions are locked until the project proposal is accepted and active." },
        { status: 403 }
      );
    }

    const repo = githubRepo || repoUrl || "";

    const submission: MilestoneSubmission = {
      id: `sub_${Date.now()}`,
      version: (milestone.submissions.length || 0) + 1,
      submittedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      submittedBy: project.freelancer.name,
      githubRepo: repo,
      demoUrl: demoUrl || "",
      loomVideo: loomVideo || "",
      notes: notes || "Submitted deliverable package for milestone review.",
      deliverableLinks: deliverableLinks || [],
      attachments: attachments || [],
    };

    // Run AI Acceptance Verification in real-time
    const audit = await verifyMilestoneWithAI({
      milestoneTitle: milestone.title,
      milestoneDescription: milestone.description,
      acceptanceCriteria: milestone.acceptanceCriteria,
      submission: {
        githubRepo: repo,
        demoUrl,
        loomVideo,
        notes: submission.notes,
        deliverableLinks: submission.deliverableLinks,
        attachments: submission.attachments,
      },
    });

    submission.aiAssessment = audit;

    const result = await db.submitMilestoneWork(projectId, milestoneId, submission, audit);

    return NextResponse.json({
      success: true,
      message: "Work submitted and verified by MilestoneOS AI Engine.",
      submission,
      audit,
      milestone: result?.milestone,
      project: result?.project,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit milestone work" },
      { status: 500 }
    );
  }
}
