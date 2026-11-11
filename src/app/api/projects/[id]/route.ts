import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getServerSupabase } from "@/server/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const isDemo = searchParams.get("isDemo") === "true";
    let userId = searchParams.get("userId") || req.headers.get("x-user-id") || undefined;
    let userEmail = searchParams.get("userEmail") || req.headers.get("x-user-email") || undefined;
    let milestoneOSId = searchParams.get("milestoneOSId") || req.headers.get("x-milestoneos-id") || undefined;

    // Check Authorization header for Supabase Bearer Token
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const supabase = getServerSupabase();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            userId = user.id;
            userEmail = user.email;
          }
        } catch (_) {}
      }
    }

    const authUser = (userId || userEmail || milestoneOSId || isDemo)
      ? { id: userId, email: userEmail, milestoneOSId, isDemo }
      : undefined;

    const project = await db.getProjectById(id, authUser);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you are not authorized to view it." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db.updateProject(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update project" },
      { status: 500 }
    );
  }
}
