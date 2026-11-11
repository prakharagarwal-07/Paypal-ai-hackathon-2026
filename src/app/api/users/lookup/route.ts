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
    const expectedRole = searchParams.get("expectedRole") as "client" | "freelancer" | null;
    const isDemo = searchParams.get("demo") === "true";

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { found: false, error: "Please provide a valid account ID parameter (e.g. ?id=FL-Q7EWTG or ?id=CL-Q7EWTG)." },
        { status: 400 }
      );
    }

    const cleanId = id.trim().toUpperCase();
    const baseCode = extractBaseCode(cleanId);

    // Validate 6-character alphanumeric base code format
    if (!baseCode || baseCode.length !== 6 || !/^[A-Z0-9]{6}$/.test(baseCode)) {
      return NextResponse.json(
        {
          found: false,
          error: "Invalid ID format. Valid MilestoneOS IDs consist of a role prefix ('CL-' or 'FL-') followed by a 6-character code (e.g. FL-Q7EWTG, CL-Q7EWTG).",
        },
        { status: 400 }
      );
    }

    // Role prefix validation:
    // When a Client looks up a Freelancer, reject 'CL-' IDs
    if (expectedRole === "freelancer" && cleanId.startsWith("CL-")) {
      return NextResponse.json(
        {
          found: false,
          error: `You entered a Client ID (${cleanId}). When initiating a project as a Client, you must enter the Freelancer's ID starting with 'FL-' (e.g. FL-${baseCode}).`,
        },
        { status: 400 }
      );
    }

    // When a Freelancer looks up a Client, reject 'FL-' IDs
    if (expectedRole === "client" && cleanId.startsWith("FL-")) {
      return NextResponse.json(
        {
          found: false,
          error: `You entered a Freelancer ID (${cleanId}). When proposing a project as a Freelancer, you must enter the Client's ID starting with 'CL-' (e.g. CL-${baseCode}).`,
        },
        { status: 400 }
      );
    }

    let user: any = null;
    const serverSupabase = getServerSupabase();
    const targetRole: "client" | "freelancer" =
      expectedRole || (cleanId.startsWith("FL-") ? "freelancer" : "client");

    if (serverSupabase) {
      // 1. First attempt lookup using the base_code column if migration has been executed
      try {
        const { data: bData } = await serverSupabase
          .from("profiles")
          .select("id, milestone_os_id, base_code, full_name, role, avatar, company, title, rating")
          .eq("base_code", baseCode)
          .maybeSingle();

        if (bData) {
          const resolvedBase = bData.base_code || baseCode;
          const displayName = bData.full_name || (bData as any).name || "User";
          user = {
            id: bData.id,
            baseCode: resolvedBase,
            clientId: formatClientId(resolvedBase),
            freelancerId: formatFreelancerId(resolvedBase),
            milestoneOSId: targetRole === "freelancer" ? formatFreelancerId(resolvedBase) : formatClientId(resolvedBase),
            name: displayName,
            avatar: bData.avatar || displayName.slice(0, 2).toUpperCase(),
            role: targetRole,
            company: bData.company || "Client Organization",
            title: bData.title || (targetRole === "freelancer" ? "Independent Specialist & Consultant" : "Client Representative"),
            rating: bData.rating ? Number(bData.rating) : 5.0,
          };
        }
      } catch (_) {}

      // 2. Fallback lookup querying milestone_os_id for baseCode
      if (!user) {
        try {
          const { data: mData } = await serverSupabase
            .from("profiles")
            .select("id, milestone_os_id, full_name, role, avatar, company, title, rating")
            .ilike("milestone_os_id", `%${baseCode}%`)
            .maybeSingle();

          if (mData) {
            const resolvedBase = extractBaseCode(mData.milestone_os_id) || baseCode;
            const displayName = mData.full_name || (mData as any).name || "User";
            user = {
              id: mData.id,
              baseCode: resolvedBase,
              clientId: formatClientId(resolvedBase),
              freelancerId: formatFreelancerId(resolvedBase),
              milestoneOSId: targetRole === "freelancer" ? formatFreelancerId(resolvedBase) : formatClientId(resolvedBase),
              name: displayName,
              avatar: mData.avatar || displayName.slice(0, 2).toUpperCase(),
              role: targetRole,
              company: mData.company || "Client Organization",
              title: mData.title || (targetRole === "freelancer" ? "Independent Specialist & Consultant" : "Client Representative"),
              rating: mData.rating ? Number(mData.rating) : 5.0,
            };
          }
        } catch (e) {
          console.warn("Supabase lookup error:", e);
        }
      }
    }

    // Demo directory fallback is ONLY permitted when explicitly in demo mode
    if (!user && isDemo) {
      const demoUser = db.findUserByBaseCode(baseCode) || db.findUserByMilestoneOSId(cleanId);
      if (demoUser) {
        const demoBase = extractBaseCode(demoUser.milestoneOSId) || baseCode;
        user = {
          id: demoUser.id,
          baseCode: demoBase,
          clientId: formatClientId(demoBase),
          freelancerId: formatFreelancerId(demoBase),
          milestoneOSId: targetRole === "freelancer" ? formatFreelancerId(demoBase) : formatClientId(demoBase),
          name: demoUser.name,
          avatar: demoUser.avatar,
          role: targetRole,
          company: demoUser.company || "Client Organization",
          title: demoUser.title || (targetRole === "freelancer" ? "Senior Specialist & Consultant" : "Client Representative"),
          rating: demoUser.rating || 5.0,
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          found: false,
          error: `No registered account found with code "${baseCode}" (${cleanId}). Please verify the ID with the user.`,
        },
        { status: 404 }
      );
    }

    // Return public non-sensitive preview (NEVER expose passwords, private emails or tokens)
    return NextResponse.json({
      success: true,
      found: true,
      user: {
        id: user.id,
        baseCode: user.baseCode,
        clientId: user.clientId,
        freelancerId: user.freelancerId,
        milestoneOSId: user.milestoneOSId,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        company: user.company,
        title: user.title,
        rating: user.rating,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { found: false, error: err.message || "Failed to lookup user" },
      { status: 500 }
    );
  }
}
