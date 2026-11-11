import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: milestoneId } = await params;
    const body = await req.json();
    const { projectId, title, description, amount, dueDate } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const updates: any = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (amount !== undefined) {
      const num = Number(amount);
      if (!isNaN(num) && num > 0) updates.amount = num;
    }
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const result = await db.editMilestone(projectId, milestoneId, updates);
    if (!result) {
      return NextResponse.json(
        { error: "Milestone cannot be edited (may be approved/paid or not found)" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Milestone updated successfully",
      milestone: result.milestone,
      project: result.project,
    });
  } catch (err: any) {
    console.error("Edit milestone API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update milestone" },
      { status: 500 }
    );
  }
}
