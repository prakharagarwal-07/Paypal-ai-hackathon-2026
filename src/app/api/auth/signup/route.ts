import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/server/supabase";
import { generateMilestoneOSId } from "@/lib/dashboard-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const assignedId = generateMilestoneOSId();
    // In PostgreSQL profiles, role has check constraint ('client', 'freelancer')
    // Users have access to both workspaces via multi-role support
    const dbRole = role === "freelancer" ? "freelancer" : "client";
    const userRoles = ["client", "freelancer"];
    const cleanEmail = email.trim().toLowerCase();
    const defaultName = cleanEmail.split("@")[0];
    const userName = (name || "").trim() || defaultName;
    const avatarInitials = userName.slice(0, 2).toUpperCase();

    const adminSupabase = getServerSupabase();

    if (adminSupabase) {
      const { data, error } = await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name: userName,
          role: dbRole,
          roles: userRoles,
          milestoneOSId: assignedId,
        },
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      // Upsert into profiles table
      try {
        await adminSupabase.from("profiles").upsert({
          id: data.user.id,
          milestone_os_id: assignedId,
          full_name: userName,
          email: cleanEmail,
          role: dbRole,
          avatar: avatarInitials,
        });
      } catch (_) {}

      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: userName,
          role: "both",
          roles: userRoles,
          milestoneOSId: assignedId,
        },
      });
    }

    // Local fallback if Supabase not configured
    return NextResponse.json({
      success: true,
      user: {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        name: userName,
        role: userRole,
        roles: userRoles,
        milestoneOSId: assignedId,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Sign up failed." },
      { status: 500 }
    );
  }
}
