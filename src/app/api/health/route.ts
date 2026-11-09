import { NextResponse } from "next/server";
import { hasPayPalCredentials } from "@/server/paypal";
import { hasGeminiKey } from "@/server/gemini";
import { db } from "@/server/db";

export async function GET() {
  const projects = db.getProjects();
  const transactions = db.getTransactions();

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
        model: "gemini-2.5-flash",
      },
      database: {
        status: "connected",
        totalProjects: projects.length,
        totalTransactions: transactions.length,
      },
    },
  });
}
