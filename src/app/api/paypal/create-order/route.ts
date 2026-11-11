import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/server/paypal";
import { db } from "@/server/db";
import { getServerSupabase } from "@/server/supabase";
import { extractBaseCode } from "@/lib/dashboard-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, milestoneId } = body;
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

    if (!projectId || !milestoneId) {
      return NextResponse.json(
        { error: "projectId and milestoneId are required" },
        { status: 400 }
      );
    }

    const project = await db.getProjectById(projectId, undefined, true);
    if (!project) {
      return NextResponse.json({ error: "Project not found in contract database" }, { status: 404 });
    }

    // Security check: Only the designated client can fund or pay milestone contracts
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
        { error: "Unauthorized. Only the designated client organization can initiate payments for this project." },
        { status: 403 }
      );
    }

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found in project" }, { status: 404 });
    }

    // Security check: Prevent creating orders for already settled milestones
    if (milestone.status === "paid") {
      return NextResponse.json(
        { error: "Milestone has already been paid and settled." },
        { status: 400 }
      );
    }

    // Security check: Amount is strictly derived from the verified server database contract.
    // Client-supplied amounts are deliberately ignored to prevent price tampering.
    const contractAmount = milestone.amount;
    const contractCurrency = (milestone.currency || project.currency || "USD").toUpperCase();

    if (!contractAmount || contractAmount <= 0) {
      return NextResponse.json(
        { error: "Milestone contract amount must be greater than zero." },
        { status: 400 }
      );
    }

    // PayPal REST API does not support INR directly for checkout.
    // When milestone is in INR, convert to USD for PayPal authorization (1 USD = ~85 INR)
    // while keeping contract tracking in Rupees.
    let orderAmount = contractAmount;
    let orderCurrency = contractCurrency;

    if (contractCurrency === "INR") {
      orderAmount = Math.max(1, Math.round((contractAmount / 85) * 100) / 100);
      orderCurrency = "USD";
    }

    const orderResult = await createPayPalOrder({
      projectId: project.id,
      milestoneId: milestone.id,
      milestoneTitle:
        contractCurrency === "INR"
          ? `${milestone.title} (INR ${contractAmount.toLocaleString()} - USD ${orderAmount.toFixed(2)})`
          : milestone.title,
      amount: orderAmount,
      currency: orderCurrency,
      freelancerName: project.freelancer.name,
    });

    return NextResponse.json({
      success: true,
      order: orderResult,
      milestone: {
        id: milestone.id,
        title: milestone.title,
        amount: contractAmount,
        currency: contractCurrency,
        orderAmount,
        orderCurrency,
      },
    });
  } catch (err: any) {
    console.error("PayPal Create Order API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create PayPal Sandbox order" },
      { status: 500 }
    );
  }
}
