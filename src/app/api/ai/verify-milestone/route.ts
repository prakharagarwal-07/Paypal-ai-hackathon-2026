import { NextRequest, NextResponse } from "next/server";
import { verifyMilestoneWithAI, computeMilestoneFingerprint } from "@/server/gemini";
import { db } from "@/server/db";

// In-memory cache for fast lookup and deduplication of in-flight requests
const auditCache = new Map<string, any>();
const inFlightRequests = new Map<string, Promise<any>>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, milestoneId, submission, forceRefresh } = body;

    if (!projectId || !milestoneId) {
      return NextResponse.json(
        { error: "projectId and milestoneId are required" },
        { status: 400 }
      );
    }

    const project = await db.getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const effectiveSubmission =
      submission ||
      (milestone.submissions && milestone.submissions.length > 0
        ? milestone.submissions[milestone.submissions.length - 1]
        : {
            notes: "Milestone deliverables submitted for acceptance review.",
          });

    // Compute fingerprint to detect unchanged submissions
    const fingerprint = computeMilestoneFingerprint(
      milestone.title,
      milestone.description,
      milestone.acceptanceCriteria,
      effectiveSubmission
    );

    const cacheKey = `${projectId}_${milestoneId}_${fingerprint}`;

    // 1. Check existing audit in memory cache or milestone DB if not force-refreshing
    if (!forceRefresh) {
      if (auditCache.has(cacheKey)) {
        const cached = auditCache.get(cacheKey);
        return NextResponse.json({
          success: true,
          assessment: { ...cached, isCached: true },
          milestoneId: milestone.id,
          projectTitle: project.title,
          cached: true,
        });
      }

      if (
        milestone.latestAudit &&
        milestone.latestAudit.submissionFingerprint === fingerprint
      ) {
        return NextResponse.json({
          success: true,
          assessment: { ...milestone.latestAudit, isCached: true },
          milestoneId: milestone.id,
          projectTitle: project.title,
          cached: true,
        });
      }
    }

    // 2. Prevent duplicate in-flight requests
    let auditPromise = inFlightRequests.get(cacheKey);
    if (!auditPromise) {
      auditPromise = (async () => {
        try {
          const assessment = await verifyMilestoneWithAI({
            milestoneTitle: milestone.title,
            milestoneDescription: milestone.description,
            acceptanceCriteria: milestone.acceptanceCriteria,
            submission: effectiveSubmission,
          });

          assessment.submissionFingerprint = fingerprint;

          // Save to server database
          await db.setMilestoneAudit(projectId, milestone.id, assessment);

          // Save to memory cache
          auditCache.set(cacheKey, assessment);

          return assessment;
        } finally {
          inFlightRequests.delete(cacheKey);
        }
      })();
      inFlightRequests.set(cacheKey, auditPromise);
    }

    const assessment = await auditPromise;

    return NextResponse.json({
      success: true,
      assessment,
      milestoneId: milestone.id,
      projectTitle: project.title,
      cached: false,
    });
  } catch (err: any) {
    console.error("AI Verification API Error:", err);
    const isQuotaExceeded =
      err.message?.toLowerCase().includes("quota") ||
      err.message?.includes("429") ||
      err.message?.toLowerCase().includes("resource_exhausted");

    return NextResponse.json(
      {
        error: isQuotaExceeded
          ? "Gemini API usage quota exceeded (HTTP 429). Please wait a moment before trying again."
          : err.message || "Failed to perform AI acceptance check",
        isQuotaExceeded,
      },
      { status: isQuotaExceeded ? 429 : 500 }
    );
  }
}
