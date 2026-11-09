import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    let transactions = db.getTransactions();
    if (projectId) {
      transactions = transactions.filter((t) => t.projectId === projectId);
    }

    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
