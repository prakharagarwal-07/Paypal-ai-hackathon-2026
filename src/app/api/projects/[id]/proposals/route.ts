import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, feedback, updatedData } = body;

    const project = await db.getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (action === "accept") {
      const updated = await db.updateProjectStatus(id, "active");
      return NextResponse.json({
        success: true,
        message: "Proposal accepted. Mutually agreed contract is now active.",
        project: updated,
      });
    }

    if (action === "request_changes") {
      if (!feedback) {
        return NextResponse.json(
          { error: "Feedback is required when requesting changes" },
          { status: 400 }
        );
      }
      const updated = await db.updateProjectStatus(id, "changes_requested", feedback);
      return NextResponse.json({
        success: true,
        message: "Change request submitted to proposer.",
        project: updated,
      });
    }

    if (action === "reject") {
      const updated = await db.updateProjectStatus(id, "rejected", feedback);
      return NextResponse.json({
        success: true,
        message: "Proposal declined.",
        project: updated,
      });
    }

    if (action === "resubmit") {
      const updates = {
        ...updatedData,
        status: "awaiting_acceptance",
        proposalFeedback: undefined,
      };
      const updated = await db.updateProject(id, updates);
      return NextResponse.json({
        success: true,
        message: "Proposal revised and resubmitted for mutual agreement.",
        project: updated,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported: accept, request_changes, reject, resubmit" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process proposal action" },
      { status: 500 }
    );
  }
}
