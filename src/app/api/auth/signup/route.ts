import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/server/supabase";
import { generateMilestoneOSId } from "@/lib/dashboard-data";
import { db } from "@/server/db";

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
    const userRole = role === "freelancer" ? "freelancer" : "client";
    const userName = (name || "").trim() || (userRole === "client" ? "Sarah Chen" : "Rohan Verma");

    const adminSupabase = getServerSupabase();

    if (adminSupabase) {
      const { data, error } = await adminSupabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          name: userName,
          role: userRole,
          milestoneOSId: assignedId,
        },
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      // Also try to insert into profiles table if it exists
      try {
        await adminSupabase.from("profiles").upsert({
          id: data.user.id,
          milestone_os_id: assignedId,
          full_name: userName,
          email: email.trim().toLowerCase(),
          role: userRole,
          avatar: userName.slice(0, 2).toUpperCase(),
        });
      } catch (_) {}

      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: userName,
          role: userRole,
          milestoneOSId: assignedId,
        },
      });
    }

    // Local fallback if Supabase not configured
    return NextResponse.json({
      success: true,
      user: {
        id: `usr_${Date.now()}`,
        email,
        name: userName,
        role: userRole,
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
