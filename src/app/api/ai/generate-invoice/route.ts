import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceWithAI, hasGeminiKey, GenerateInvoiceInput } from "@/server/gemini";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, milestoneId, transactionId, customPayload } = body;

    let invoiceInput: GenerateInvoiceInput;

    if (customPayload) {
      invoiceInput = customPayload;
    } else {
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

      invoiceInput = {
        projectId: project.id,
        projectTitle: project.title,
        projectDescription: project.description,
        category: project.category,
        client: {
          name: project.client.name,
          email: project.client.email,
          company: project.client.company,
        },
        freelancer: {
          name: project.freelancer.name,
          email: project.freelancer.email,
          title: project.freelancer.title,
        },
        milestone: {
          id: milestone.id,
          stageNumber: milestone.stageNumber,
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount,
          currency: milestone.currency || "USD",
          dueDate: milestone.dueDate,
          paidAt: milestone.paidAt,
          acceptanceCriteria: milestone.acceptanceCriteria,
          submissions: milestone.submissions,
        },
        payment: {
          transactionId: transactionId || milestone.paypalTransactionId,
          paidAt: milestone.paidAt,
          amount: milestone.amount,
          currency: milestone.currency || "USD",
          status: "completed",
          method: "PayPal Sandbox Escrow Settlement",
        },
      };
    }

    const invoice = await generateInvoiceWithAI(invoiceInput);

    return NextResponse.json({
      success: true,
      invoice,
      hasLiveKey: hasGeminiKey(),
    });
  } catch (err: any) {
    console.error("AI Invoice Generation Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate AI invoice" },
      { status: 500 }
    );
  }
}
