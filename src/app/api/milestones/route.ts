import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, title, description, amount, dueDate, acceptanceCriteria } = body;

    if (!projectId || !title || !amount) {
      return NextResponse.json(
        { error: "projectId, title, and amount are required" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    const result = db.addMilestone(projectId, {
      title,
      description: description || "Agreed deliverables milestone.",
      amount: numericAmount,
      dueDate,
      acceptanceCriteria: Array.isArray(acceptanceCriteria) ? acceptanceCriteria : [],
    });

    if (!result) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Milestone created successfully",
      milestone: result.milestone,
      project: result.project,
    });
  } catch (err: any) {
    console.error("Add milestone API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create milestone" },
      { status: 500 }
    );
  }
}
