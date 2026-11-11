import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/server/paypal";
import { db } from "@/server/db";
import { getServerSupabase } from "@/server/supabase";
import { extractBaseCode } from "@/lib/dashboard-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, projectId, milestoneId } = body;
    let callerId = body.userId || body.payerId || body.callerId || req.headers.get("x-user-id");
    let callerEmail = body.userEmail || req.headers.get("x-user-email");
    let callerMsoId = body.milestoneOSId || req.headers.get("x-user-mso-id");

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

    if (!orderId || !projectId || !milestoneId) {
      return NextResponse.json(
        { error: "orderId, projectId, and milestoneId are required" },
        { status: 400 }
      );
    }

    // 1. Verify project and milestone exist in server contract database
    const project = await db.getProjectById(projectId, undefined, true);
    if (!project) {
      return NextResponse.json({ error: "Project not found in contract database" }, { status: 404 });
    }

    // Security check: Only the designated client can capture payments
    const clientId = project.clientId || project.client?.id;
    const clientEmail = project.client?.email?.toLowerCase();
    const clientMso = project.client?.milestoneOSId || (project as any).client_mso_id;
    const clientBase = extractBaseCode(clientMso);
    const callerBase = extractBaseCode(callerMsoId) || extractBaseCode(callerId);

    const isClientCaller = Boolean(
      (callerId && (callerId === clientId || callerId === clientMso)) ||
      (callerEmail && clientEmail && callerEmail.toLowerCase() === clientEmail) ||
      (callerMsoId && clientMso && callerMsoId.toUpperCase() === clientMso.toUpperCase()) ||
      (callerBase && clientBase && callerBase === clientBase)
    );

    if (!isClientCaller && !project.isDemo) {
      return NextResponse.json(
        { error: "Unauthorized. Only the designated client can capture payments for this project." },
        { status: 403 }
      );
    }

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found in project" }, { status: 404 });
    }

    // 2. Prevent duplicate capture if milestone already settled
    if (milestone.status === "paid") {
      return NextResponse.json(
        { error: "Milestone has already been paid and settled." },
        { status: 400 }
      );
    }

    // 3. Capture PayPal Order via server-to-server PayPal API call
    const captureResult = await capturePayPalOrder(orderId);

    // 4. Strict status verification: must be COMPLETED
    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: `PayPal payment capture did not complete. Status: ${captureResult.status}`,
          details: captureResult,
        },
        { status: 400 }
      );
    }

    // 5. Security check: Verify captured order belongs to this exact project and milestone
    if (captureResult.customId && captureResult.customId !== `${projectId}:${milestoneId}`) {
      console.warn(
        `Mismatch in captured customId: expected ${projectId}:${milestoneId}, got ${captureResult.customId}`
      );
      return NextResponse.json(
        { error: "Captured order does not match the requested milestone contract." },
        { status: 403 }
      );
    }

    if (captureResult.referenceId && captureResult.referenceId !== milestoneId) {
      console.warn(
        `Mismatch in captured referenceId: expected ${milestoneId}, got ${captureResult.referenceId}`
      );
      return NextResponse.json(
        { error: "Captured order reference ID does not match this milestone." },
        { status: 403 }
      );
    }

    // 6. Security check: Verify captured amount matches agreed milestone contract price
    const contractCurrency = (milestone.currency || project.currency || "USD").toUpperCase();
    const isINR = contractCurrency === "INR";
    const expectedAmount = isINR
      ? Math.max(1, Math.round((milestone.amount / 85) * 100) / 100)
      : milestone.amount;

    if (Math.abs(captureResult.amount - expectedAmount) > 1.0) {
      console.warn(
        `Captured amount mismatch: expected ${expectedAmount}, captured ${captureResult.amount}`
      );
      return NextResponse.json(
        { error: "Captured payment amount does not match milestone agreed contract price." },
        { status: 400 }
      );
    }

    // 7. Update server database with verified genuine capture
    const updated = await db.recordPayment(projectId, milestoneId, captureResult);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to record verified payment in contract database" },
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
