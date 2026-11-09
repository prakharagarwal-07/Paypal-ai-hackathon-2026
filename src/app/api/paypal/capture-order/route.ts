import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/server/paypal";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, projectId, milestoneId } = body;

    if (!orderId || !projectId || !milestoneId) {
      return NextResponse.json(
        { error: "orderId, projectId, and milestoneId are required" },
        { status: 400 }
      );
    }

    const captureResult = await capturePayPalOrder(orderId);

    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "PayPal payment capture did not complete", details: captureResult },
        { status: 400 }
      );
    }

    // Record payment in database and advance contract milestones
    const updated = db.recordPayment(projectId, milestoneId, captureResult);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to record payment in contract store" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      capture: captureResult,
      transaction: updated.transaction,
      project: updated.project,
    });
  } catch (err: any) {
    console.error("PayPal Capture Order API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
