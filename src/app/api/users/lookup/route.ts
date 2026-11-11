import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { getServerSupabase } from "@/server/supabase";
import {
  extractBaseCode,
  formatClientId,
  formatFreelancerId,
} from "@/lib/dashboard-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const query = searchParams.get("q");
    const isList = searchParams.get("list") === "true";
    const expectedRole = searchParams.get("expectedRole") as "client" | "freelancer" | null;
    const roleParam = searchParams.get("role") as "client" | "freelancer" | null;
    const targetRole = expectedRole || roleParam;
    const serverSupabase = getServerSupabase();

    // 1. Directory List Mode: Allows browsing/selecting registered counterparties
    if (isList && serverSupabase) {
      let dbQuery = serverSupabase
        .from("profiles")
        .select("id, milestone_os_id, full_name, email, role, avatar, company, title, rating")
        .order("full_name", { ascending: true })
        .limit(30);

      if (targetRole) {
        // Match users with the requested role or 'both'
        dbQuery = dbQuery.or(`role.eq.${targetRole},role.eq.both`);
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
          milestoneOSId: targetRole === "freelancer" ? formatFreelancerId(base) : formatClientId(base),
          name: row.full_name || "User",
          email: row.email,
          avatar: row.avatar || (row.full_name ? row.full_name.slice(0, 2).toUpperCase() : "US"),
          role: row.role,
          company: row.company || "Client Organization",
          title: row.title || (targetRole === "freelancer" ? "Independent Specialist" : "Client"),
          rating: Number(row.rating || 5.0),
        };
      });

      return NextResponse.json({
        success: true,
        count: users.length,
        users,
      });
    }

    // 2. Direct Single User Lookup (by ID, base code, or email)
    const lookupKey = (id || email || query || "").trim();
    if (!lookupKey) {
      return NextResponse.json(
        { found: false, error: "Please provide a valid account ID, code, or email (e.g. ?id=FL-2W8L41 or ?email=user@example.com)." },
        { status: 400 }
      );
    }

    const cleanInput = lookupKey.toUpperCase();
    const isEmailLookup = lookupKey.includes("@");
    const baseCode = isEmailLookup ? null : extractBaseCode(cleanInput);

    let user: any = null;

    if (serverSupabase) {
      // Lookup by email if email format provided
      if (isEmailLookup) {
        try {
          const { data: eData } = await serverSupabase
            .from("profiles")
            .select("id, milestone_os_id, full_name, email, role, avatar, company, title, rating")
            .eq("email", lookupKey.toLowerCase())
            .maybeSingle();

          if (eData) {
            const resolvedBase = extractBaseCode(eData.milestone_os_id) || eData.id.slice(0, 6).toUpperCase();
            user = {
              id: eData.id,
              baseCode: resolvedBase,
              clientId: formatClientId(resolvedBase),
              freelancerId: formatFreelancerId(resolvedBase),
              milestoneOSId: targetRole === "freelancer" ? formatFreelancerId(resolvedBase) : formatClientId(resolvedBase),
              name: eData.full_name || "User",
              email: eData.email,
              avatar: eData.avatar || (eData.full_name ? eData.full_name.slice(0, 2).toUpperCase() : "US"),
              role: eData.role,
              company: eData.company || "Client Organization",
              title: eData.title || (targetRole === "freelancer" ? "Independent Specialist" : "Client"),
              rating: Number(eData.rating || 5.0),
            };
          }
        } catch (_) {}
      }

      // Lookup by base code or milestone_os_id
      if (!user && baseCode) {
        try {
          const { data: mData } = await serverSupabase
            .from("profiles")
            .select("id, milestone_os_id, full_name, email, role, avatar, company, title, rating")
            .ilike("milestone_os_id", `%${baseCode}%`)
            .maybeSingle();

          if (mData) {
            const resolvedBase = extractBaseCode(mData.milestone_os_id) || baseCode;
            user = {
              id: mData.id,
              baseCode: resolvedBase,
              clientId: formatClientId(resolvedBase),
              freelancerId: formatFreelancerId(resolvedBase),
              milestoneOSId: targetRole === "freelancer" ? formatFreelancerId(resolvedBase) : formatClientId(resolvedBase),
              name: mData.full_name || "User",
              email: mData.email,
              avatar: mData.avatar || (mData.full_name ? mData.full_name.slice(0, 2).toUpperCase() : "US"),
              role: mData.role,
              company: mData.company || "Client Organization",
              title: mData.title || (targetRole === "freelancer" ? "Independent Specialist" : "Client"),
              rating: Number(mData.rating || 5.0),
            };
          }
        } catch (_) {}
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          found: false,
          error: `No registered account found matching "${lookupKey}". Please verify the account ID or email.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      found: true,
      user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { found: false, error: err.message || "Failed to lookup user" },
      { status: 500 }
    );
  }
}
