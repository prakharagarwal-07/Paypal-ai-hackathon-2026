import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const project = await db.getProjectByInvitationToken(token);

    if (!project) {
      return NextResponse.json(
        { error: "Invitation not found or invalid link." },
        { status: 404 }
      );
    }

    if (project.invitationStatus === "revoked") {
      return NextResponse.json(
        {
          error: "This invitation link was revoked by the sender.",
          status: "revoked",
          projectTitle: project.title,
        },
        { status: 410 }
      );
    }

    const isExpired =
      project.invitationExpiresAt &&
      new Date(project.invitationExpiresAt).getTime() < Date.now();

    if (isExpired) {
      return NextResponse.json(
        {
          error: "This invitation link has expired.",
          status: "expired",
          projectTitle: project.title,
        },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
      invitation: {
        token: project.invitationToken,
        status: project.invitationStatus || "active",
        expiresAt: project.invitationExpiresAt,
        initiatedByRole: project.initiatedBy,
        senderName:
          project.initiatedBy === "client" ? project.client.name : project.freelancer.name,
        senderOrgOrTitle:
          project.initiatedBy === "client" ? project.client.company : project.freelancer.title,
        senderMilestoneOSId:
          project.initiatorMilestoneOSId ||
          (project.initiatedBy === "client"
            ? project.client.milestoneOSId
            : project.freelancer.milestoneOSId),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();

    const claimingUser =
      body.claimingUser ||
      (body.name || body.userId
        ? {
            id: body.userId || body.id,
            name: body.name,
            email: body.userEmail || body.email,
            avatar: body.avatar || "U",
            milestoneOSId: body.milestoneOSId || "",
            role: body.role || "freelancer",
            companyOrTitle: body.companyOrTitle || body.title || body.company || "Specialist",
          }
        : null);

    const action = body.action || (claimingUser ? "accept" : undefined);
    const feedback = body.feedback;

    const project = await db.getProjectByInvitationToken(token);

    if (!project) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (action === "revoke") {
      await db.revokeInvitation(token);
      return NextResponse.json({ success: true, message: "Invitation link revoked." });
    }

    if (project.invitationStatus === "revoked") {
      return NextResponse.json(
        { error: "This invitation has been revoked." },
        { status: 410 }
      );
    }

    if (action === "accept") {
      if (!claimingUser || !claimingUser.name) {
        return NextResponse.json(
          { error: "Authenticated user details required to accept proposal." },
          { status: 400 }
        );
      }

      // Prevent sender self-acceptance
      const senderId =
        project.initiatorMilestoneOSId ||
        (project.initiatedBy === "client"
          ? project.client.milestoneOSId
          : project.freelancer.milestoneOSId);

      if (senderId && claimingUser.milestoneOSId && senderId === claimingUser.milestoneOSId) {
        return NextResponse.json(
          { error: "You created this proposal. You cannot accept your own invitation." },
          { status: 400 }
        );
      }

      const updated = await db.claimInvitation(token, claimingUser);
      return NextResponse.json({
        success: true,
        message: "Invitation accepted. Project contract is now active.",
        project: updated,
      });
    }

    if (action === "request_changes") {
      project.status = "changes_requested";
      project.proposalStatus = "changes_requested";
      project.proposalFeedback = feedback || "Changes requested on proposed terms.";
      return NextResponse.json({
        success: true,
        message: "Feedback submitted to proposer.",
        project,
      });
    }

    if (action === "reject") {
      project.status = "rejected";
      project.proposalStatus = "rejected";
      return NextResponse.json({
        success: true,
        message: "Proposal declined.",
        project,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process invitation action" },
      { status: 500 }
    );
  }
}
