import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/server/paypal";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, milestoneId } = body;

    if (!projectId || !milestoneId) {
      return NextResponse.json(
        { error: "projectId and milestoneId are required" },
        { status: 400 }
      );
    }

    const project = await db.getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found in contract database" }, { status: 404 });
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
