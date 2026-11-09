import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/server/paypal";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, milestoneId, amount, currency = "USD" } = body;

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

    // Verify milestone is approved and ready for payment
    if (milestone.status === "paid") {
      return NextResponse.json(
        { error: "Milestone is already paid" },
        { status: 400 }
      );
    }

    const orderResult = await createPayPalOrder({
      projectId,
      milestoneId,
      milestoneTitle: milestone.title,
      amount: amount || milestone.amount,
      currency,
      freelancerName: project.freelancer.name,
    });

    return NextResponse.json({
      success: true,
      order: orderResult,
      milestone: {
        id: milestone.id,
        title: milestone.title,
        amount: milestone.amount,
      },
    });
  } catch (err: any) {
    console.error("PayPal Create Order API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
