import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/server/supabase";
import {
  extractBaseCode,
  formatClientId,
  formatFreelancerId,
} from "@/lib/dashboard-data";
import { resolveCounterpartyIdentity } from "@/server/identity";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const query = searchParams.get("q");
    const isList = searchParams.get("list") === "true";
    const expectedRole = (searchParams.get("expectedRole") as "client" | "freelancer") || (searchParams.get("role") as "client" | "freelancer") || "freelancer";
    const proposerId = searchParams.get("proposerId") || req.headers.get("x-user-id");
    const proposerEmail = searchParams.get("proposerEmail") || req.headers.get("x-user-email");
    const serverSupabase = getServerSupabase();

    // 1. Directory List Mode: Allows browsing/selecting registered counterparties
    if (isList && serverSupabase) {
      let dbQuery = serverSupabase
        .from("profiles")
        .select("id, milestone_os_id, full_name, email, role, avatar, company, title, rating")
        .order("full_name", { ascending: true })
        .limit(30);

      if (expectedRole) {
        // Match users with the requested role or 'both'
        dbQuery = dbQuery.or(`role.eq.${expectedRole},role.eq.both`);
      }

      const { data: listData, error: listErr } = await dbQuery;
      if (listErr) {
        return NextResponse.json({ success: false, error: listErr.message }, { status: 500 });
      }

      const users = (listData || []).map((row) => {
        const base = extractBaseCode(row.milestone_os_id) || row.id.slice(0, 6).toUpperCase();
        return {
          id: row.id,
          baseCode: base,
          clientId: formatClientId(base),
          freelancerId: formatFreelancerId(base),
          milestoneOSId: expectedRole === "freelancer" ? formatFreelancerId(base) : formatClientId(base),
          name: row.full_name || "User",
          email: row.email,
          avatar: row.avatar || (row.full_name ? row.full_name.slice(0, 2).toUpperCase() : "US"),
          role: row.role,
          company: row.company || "Client Organization",
          title: row.title || (expectedRole === "freelancer" ? "Independent Specialist" : "Client"),
          rating: Number(row.rating || 5.0),
        };
      });

      return NextResponse.json({
        success: true,
        count: users.length,
        users,
      });
    }

    // 2. Direct Single User Lookup via Central Identity Resolution
    const lookupKey = (id || email || query || "").trim();
    if (!lookupKey) {
      return NextResponse.json(
        { found: false, error: "Please provide a valid account ID, code, or email (e.g. ?id=FL-2W8L41 or ?email=user@example.com)." },
        { status: 400 }
      );
    }

    const result = await resolveCounterpartyIdentity({
      identifier: lookupKey,
      expectedRole,
      proposerId,
      proposerEmail,
    });

    if (!result.success) {
      const statusCode = result.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        {
          found: false,
          error: result.error,
          code: result.code,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      found: true,
      user: result.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { found: false, error: err.message || "Failed to lookup user" },
      { status: 500 }
    );
  }
}
