import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getServerSupabase } from "@/server/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, feedback, updatedData } = body;

    let callerId = body.userId || body.callerId;
    let callerEmail = body.userEmail;

    // Verify caller session token if provided in Authorization header
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

    const project = await db.getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isClientProposer = project.initiatedBy === "client";
    const proposerId = isClientProposer ? (project.clientId || project.client?.id) : (project.freelancerId || project.freelancer?.id);
    const proposerEmail = isClientProposer ? project.client?.email?.toLowerCase() : project.freelancer?.email?.toLowerCase();
    const recipientId = isClientProposer ? (project.freelancerId || project.freelancer?.id) : (project.clientId || project.client?.id);
    const recipientEmail = isClientProposer ? project.freelancer?.email?.toLowerCase() : project.client?.email?.toLowerCase();

    const isProposer = Boolean(
      (callerId && callerId === proposerId) ||
      (callerEmail && callerEmail.toLowerCase() === proposerEmail)
    );

    const isRecipient = Boolean(
      (callerId && callerId === recipientId) ||
      (callerEmail && callerEmail.toLowerCase() === recipientEmail)
    );

    // Scenario D Enforcement: Proposer CANNOT accept, reject, or request changes on their own proposal
    if (action === "accept" || action === "reject" || action === "request_changes") {
      if (isProposer) {
        return NextResponse.json(
          { error: "You cannot accept, reject, or request changes on your own proposal. Only the recipient can accept." },
          { status: 403 }
        );
      }

      if (callerId && !isRecipient) {
        return NextResponse.json(
          { error: "Unauthorized. Only the designated recipient can accept or review this project proposal." },
          { status: 403 }
        );
      }
    }

    if (action === "accept") {
      if (project.status === "active" && project.proposalStatus === "accepted") {
        return NextResponse.json(
          { success: true, message: "Project proposal has already been accepted and is active.", project }
        );
      }

      if (project.status === "rejected" || project.proposalStatus === "rejected") {
        return NextResponse.json(
          { error: "Cannot accept a rejected proposal. A revised proposal must be resubmitted first." },
          { status: 400 }
        );
      }

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
      if (callerId && !isProposer) {
        return NextResponse.json(
          { error: "Only the original proposer can revise and resubmit this proposal." },
          { status: 403 }
        );
      }

      const updates = {
        ...updatedData,
        status: "awaiting_acceptance",
        proposalStatus: "awaiting_acceptance",
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
