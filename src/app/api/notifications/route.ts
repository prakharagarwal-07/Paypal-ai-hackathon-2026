import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getServerSupabase } from "@/server/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isDemo = searchParams.get("isDemo") === "true";
    let userId = searchParams.get("userId") || undefined;

    // Check Authorization header for Supabase Bearer Token
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const supabase = getServerSupabase();
      if (supabase) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (user) {
            userId = user.id;
          }
        } catch (_) {}
      }
    }

    if (!userId) userId = req.headers.get("x-user-id") || undefined;

    const notifications = await db.getNotifications({
      userId,
      isDemo,
    });

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, projectId, title, message, type = "general", isDemo = false } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "title and message are required" }, { status: 400 });
    }

    const item = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      projectId,
      title,
      message,
      type,
      unread: true,
      timestamp: new Date().toISOString(),
      isDemo: Boolean(isDemo),
    };

    const saved = await db.createNotification(item);
    return NextResponse.json({ success: true, notification: saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, all, userId } = body;

    if (all && userId) {
      await db.markAllNotificationsRead(userId);
      return NextResponse.json({ success: true, message: "All notifications marked read" });
    }

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const ok = await db.markNotificationRead(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}
