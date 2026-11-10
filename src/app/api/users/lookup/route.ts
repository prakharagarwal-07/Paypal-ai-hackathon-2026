import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { found: false, error: "Please provide a valid MilestoneOS ID parameter (e.g. ?id=MSO-8K4P92)." },
        { status: 400 }
      );
    }

    const cleanId = id.trim().toUpperCase();

    // Basic format check
    if (!cleanId.startsWith("MSO-")) {
      return NextResponse.json(
        {
          found: false,
          error: "Invalid MilestoneOS ID format. Valid IDs begin with 'MSO-' followed by 6 alphanumeric characters.",
        },
        { status: 400 }
      );
    }

    const user = db.findUserByMilestoneOSId(cleanId);

    if (!user) {
      return NextResponse.json(
        {
          found: false,
          error: `No registered account found with MilestoneOS ID "${cleanId}". Please verify the ID with the user.`,
        },
        { status: 404 }
      );
    }

    // Return public non-sensitive preview
    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
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
