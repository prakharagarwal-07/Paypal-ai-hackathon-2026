import { NextResponse } from "next/server";
import { hasPayPalCredentials } from "@/server/paypal";
import { hasGeminiKey } from "@/server/gemini";
import { db } from "@/server/db";

export async function GET() {
  const projects = await db.getProjects();
  const transactions = await db.getTransactions();

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      paypal: {
        configured: hasPayPalCredentials(),
        environment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
      },
      geminiAI: {
        configured: hasGeminiKey(),
        model: "gemini-3.5-flash",
      },
      database: {
        status: "connected",
        totalProjects: projects.length,
        totalTransactions: transactions.length,
      },
    },
  });
}
