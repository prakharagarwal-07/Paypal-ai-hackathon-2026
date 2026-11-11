import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { verifyMilestoneWithAI } from "@/server/gemini";
import { MilestoneSubmission } from "@/lib/dashboard-data";
import { getServerSupabase } from "@/server/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: milestoneId } = await params;
    const body = await req.json();
    const { projectId, repoUrl, githubRepo, demoUrl, loomVideo, notes, deliverableLinks, attachments } = body;

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

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const project = await db.getProjectById(projectId, undefined, true);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Strict Freelancer Authorization Check
    const isDemo = Boolean(project.isDemo);
    if (!isDemo && (callerId || callerEmail)) {
      const isFreelancer = Boolean(
        (callerId && (project.freelancerId === callerId || project.freelancer?.id === callerId)) ||
        (callerEmail && project.freelancer?.email?.toLowerCase() === callerEmail.toLowerCase())
      );
      if (!isFreelancer) {
        return NextResponse.json(
          { error: "Unauthorized. Only the designated freelancer can submit deliverables for this milestone." },
          { status: 403 }
        );
      }
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
