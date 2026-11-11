import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
});

const APP_URL = "http://localhost:3000";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function assert(condition: boolean, message: string, extra?: any) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    if (extra) console.error("Details:", extra);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ [PASS] ${message}`);
}

async function runRealAccountTest() {
  console.log("==================================================================");
  console.log("   PRAKHAR (CLIENT) & ROHAN (FREELANCER) REAL ACCOUNT LIFECYCLE   ");
  console.log("==================================================================");

  // 1. Fetch Real Profiles from Supabase PostgreSQL directly
  console.log("\n▶ Step 1: Audit Live Supabase Profiles");
  const { data: prakharProfile, error: pErr } = await supabase
    .from("profiles")
    .select("*")
    .ilike("email", "%prakhar.agarwal.0710@gmail.com%")
    .single();

  const { data: rohanProfile, error: rErr } = await supabase
    .from("profiles")
    .select("*")
    .ilike("email", "%rohan.verma@craftdev.io%")
    .single();

  assert(Boolean(prakharProfile && !pErr), "Prakhar profile retrieved from Supabase", prakharProfile);
  assert(Boolean(rohanProfile && !rErr), "Rohan profile retrieved from Supabase", rohanProfile);

  console.log("\nPrakhar Profile Mapping:");
  console.log(`  UUID: ${prakharProfile.id}`);
  console.log(`  Email: ${prakharProfile.email}`);
  console.log(`  MilestoneOS ID: ${prakharProfile.milestone_os_id}`);
  console.log(`  Role: ${prakharProfile.role}`);

  console.log("\nRohan Profile Mapping:");
  console.log(`  UUID: ${rohanProfile.id}`);
  console.log(`  Email: ${rohanProfile.email}`);
  console.log(`  MilestoneOS ID: ${rohanProfile.milestone_os_id}`);
  console.log(`  Role: ${rohanProfile.role}`);

  const testAId = `proj_real_test_a_${Date.now()}`;
  const testBId = `proj_real_test_b_${Date.now()}`;

  // ================================================================
  // TEST A: Client Prakhar -> Freelancer Rohan
  // ================================================================
  console.log("\n▶ TEST A: Client Prakhar requests project from Freelancer Rohan (using code FL-2W8L41)");

  // 1. Client creates request
  const createARes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: testAId,
      title: "Real Account Verification Project A",
      description: "Verification of client-to-freelancer workflow with genuine accounts",
      category: "Full-Stack Development",
      creatorId: prakharProfile.id,
      initiatedBy: "client",
      client: {
        id: prakharProfile.id,
        name: prakharProfile.full_name,
        email: prakharProfile.email,
        milestoneOSId: "CL-Q7EWTG",
      },
      freelancer: {
        milestoneOSId: "FL-2W8L41", // Using Rohan's actual freelancer code
      },
      totalBudget: 1200,
      milestones: [
        {
          title: "Milestone A1",
          amount: 600,
          status: "not_started",
          acceptanceCriteria: [{ title: "Scope verification complete" }],
        },
        {
          title: "Milestone A2",
          amount: 600,
          status: "not_started",
          acceptanceCriteria: [{ title: "Integration verified" }],
        },
      ],
    }),
  });

  const createAData = await createARes.json();
  const actualAId = createAData.project?.id || testAId;
  assert(createARes.ok && createAData.success, "Test A.1: Project request created via API", createAData);

  // 2. Verify Supabase record
  const { data: dbProjA } = await supabase.from("projects").select("*").eq("id", actualAId).single();
  assert(
    Boolean(
      dbProjA &&
        dbProjA.client_id === prakharProfile.id &&
        dbProjA.freelancer_id === rohanProfile.id &&
        dbProjA.initiated_by === "client" &&
        dbProjA.status === "awaiting_acceptance" &&
        dbProjA.proposal_status === "awaiting_acceptance"
    ),
    "Test A.2: Supabase stores correct client_id (Prakhar) and freelancer_id (Rohan)",
    { client_id: dbProjA?.client_id, freelancer_id: dbProjA?.freelancer_id, status: dbProjA?.status }
  );

  // 3. Verify Rohan (Freelancer) sees this in Incoming Requests
  const rohanReqRes = await fetch(`${APP_URL}/api/projects?userId=${rohanProfile.id}`);
  const rohanReqData = await rohanReqRes.json();
  const rohanIncoming = (rohanReqData.projects || []).filter(
    (p: any) =>
      (p.status === "awaiting_acceptance" || p.status === "changes_requested") &&
      p.freelancerId === rohanProfile.id &&
      p.initiatedBy === "client"
  );
  assert(
    rohanIncoming.some((p: any) => p.id === actualAId),
    "Test A.3: Project appears in Rohan's Freelancer Incoming Requests"
  );

  // 4. Verify Prakhar DOES NOT see this in Incoming Requests
  const prakharReqRes = await fetch(`${APP_URL}/api/projects?userId=${prakharProfile.id}`);
  const prakharReqData = await prakharReqRes.json();
  const prakharIncoming = (prakharReqData.projects || []).filter(
    (p: any) =>
      (p.status === "awaiting_acceptance" || p.status === "changes_requested") &&
      p.clientId === prakharProfile.id &&
      p.initiatedBy === "freelancer"
  );
  assert(
    !prakharIncoming.some((p: any) => p.id === actualAId),
    "Test A.4: Project does NOT appear in Prakhar's Incoming Proposals (strictly in Sent Requests)"
  );

  // 5. Verify Prakhar cannot self-accept (HTTP 403)
  const prakharAcceptRes = await fetch(`${APP_URL}/api/projects/${actualAId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "accept", userId: prakharProfile.id }),
  });
  assert(prakharAcceptRes.status === 403, "Test A.5: Proposer Prakhar blocked from self-accepting with HTTP 403");

  // 6. Recipient Rohan accepts the project request
  const rohanAcceptRes = await fetch(`${APP_URL}/api/projects/${actualAId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "accept", userId: rohanProfile.id }),
  });
  const rohanAcceptData = await rohanAcceptRes.json();
  assert(rohanAcceptRes.ok && rohanAcceptData.success, "Test A.6: Recipient Rohan successfully accepts contract");

  // 7. Verify atomic update in Supabase
  const { data: dbAcceptedA } = await supabase.from("projects").select("*").eq("id", actualAId).single();
  assert(
    Boolean(
      dbAcceptedA &&
        dbAcceptedA.status === "active" &&
        dbAcceptedA.proposal_status === "accepted" &&
        dbAcceptedA.terms_agreed === true
    ),
    "Test A.7: Supabase atomically transitions project to status='active' and terms_agreed=true"
  );

  // 8. Verify both participants see active contract
  const pActiveRes = await fetch(`${APP_URL}/api/projects?userId=${prakharProfile.id}`);
  const rActiveRes = await fetch(`${APP_URL}/api/projects?userId=${rohanProfile.id}`);
  const pActiveData = await pActiveRes.json();
  const rActiveData = await rActiveRes.json();

  assert(
    (pActiveData.projects || []).some((p: any) => p.id === actualAId && p.status === "active"),
    "Test A.8: Client Prakhar sees active contract in workspace"
  );
  assert(
    (rActiveData.projects || []).some((p: any) => p.id === actualAId && p.status === "active"),
    "Test A.9: Freelancer Rohan sees identical active contract in workspace"
  );

  // ================================================================
  // TEST B: Freelancer Rohan -> Client Prakhar
  // ================================================================
  console.log("\n▶ TEST B: Freelancer Rohan proposes project to Client Prakhar (using code CL-Q7EWTG)");

  // 1. Freelancer creates proposal
  const createBRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: testBId,
      title: "Real Account Verification Project B",
      description: "Verification of freelancer-to-client workflow with genuine accounts",
      category: "Full-Stack Development",
      creatorId: rohanProfile.id,
      initiatedBy: "freelancer",
      freelancer: {
        id: rohanProfile.id,
        name: rohanProfile.full_name,
        email: rohanProfile.email,
        milestoneOSId: "FL-2W8L41",
      },
      client: {
        milestoneOSId: "CL-Q7EWTG", // Using Prakhar's actual client code
      },
      totalBudget: 2000,
      milestones: [
        {
          title: "Milestone B1",
          amount: 1000,
          status: "not_started",
          acceptanceCriteria: [{ title: "Backend API endpoints live" }],
        },
        {
          title: "Milestone B2",
          amount: 1000,
          status: "not_started",
          acceptanceCriteria: [{ title: "Contract verified" }],
        },
      ],
    }),
  });

  const createBData = await createBRes.json();
  const actualBId = createBData.project?.id || testBId;
  assert(createBRes.ok && createBData.success, "Test B.1: Project proposal created via API", createBData);

  // 2. Verify Supabase record
  const { data: dbProjB } = await supabase.from("projects").select("*").eq("id", actualBId).single();
  assert(
    Boolean(
      dbProjB &&
        dbProjB.client_id === prakharProfile.id &&
        dbProjB.freelancer_id === rohanProfile.id &&
        dbProjB.initiated_by === "freelancer" &&
        dbProjB.status === "awaiting_acceptance" &&
        dbProjB.proposal_status === "awaiting_acceptance"
    ),
    "Test B.2: Supabase stores correct client_id (Prakhar) and freelancer_id (Rohan)",
    { client_id: dbProjB?.client_id, freelancer_id: dbProjB?.freelancer_id, status: dbProjB?.status }
  );

  // 3. Verify Client Prakhar sees this in Incoming Proposals
  const pIncomingRes = await fetch(`${APP_URL}/api/projects?userId=${prakharProfile.id}`);
  const pIncomingData = await pIncomingRes.json();
  const pIncoming = (pIncomingData.projects || []).filter(
    (p: any) =>
      (p.status === "awaiting_acceptance" || p.status === "changes_requested") &&
      p.clientId === prakharProfile.id &&
      p.initiatedBy === "freelancer"
  );
  assert(
    pIncoming.some((p: any) => p.id === actualBId),
    "Test B.3: Proposal appears in Prakhar's Client Incoming Proposals"
  );

  // 4. Verify Rohan DOES NOT see this in Incoming Requests
  const rIncomingRes = await fetch(`${APP_URL}/api/projects?userId=${rohanProfile.id}`);
  const rIncomingData = await rIncomingRes.json();
  const rIncoming = (rIncomingData.projects || []).filter(
    (p: any) =>
      (p.status === "awaiting_acceptance" || p.status === "changes_requested") &&
      p.freelancerId === rohanProfile.id &&
      p.initiatedBy === "client"
  );
  assert(
    !rIncoming.some((p: any) => p.id === actualBId),
    "Test B.4: Proposal does NOT appear in Rohan's Incoming Requests (strictly in Sent Proposals)"
  );

  // 5. Verify Rohan cannot self-accept (HTTP 403)
  const rohanSelfAcceptRes = await fetch(`${APP_URL}/api/projects/${actualBId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "accept", userId: rohanProfile.id }),
  });
  assert(rohanSelfAcceptRes.status === 403, "Test B.5: Proposer Rohan blocked from self-accepting with HTTP 403");

  // 6. Recipient Prakhar accepts the proposal
  const prakharAcceptRes2 = await fetch(`${APP_URL}/api/projects/${actualBId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "accept", userId: prakharProfile.id }),
  });
  const prakharAcceptData2 = await prakharAcceptRes2.json();
  assert(prakharAcceptRes2.ok && prakharAcceptData2.success, "Test B.6: Recipient Prakhar successfully accepts contract");

  // 7. Verify atomic update in Supabase
  const { data: dbAcceptedB } = await supabase.from("projects").select("*").eq("id", actualBId).single();
  assert(
    Boolean(
      dbAcceptedB &&
        dbAcceptedB.status === "active" &&
        dbAcceptedB.proposal_status === "accepted" &&
        dbAcceptedB.terms_agreed === true
    ),
    "Test B.7: Supabase atomically transitions project to status='active' and terms_agreed=true"
  );

  // 8. Verify both participants see active contract after acceptance
  const pFinalRes = await fetch(`${APP_URL}/api/projects?userId=${prakharProfile.id}`);
  const rFinalRes = await fetch(`${APP_URL}/api/projects?userId=${rohanProfile.id}`);
  const pFinalData = await pFinalRes.json();
  const rFinalData = await rFinalRes.json();

  assert(
    (pFinalData.projects || []).some((p: any) => p.id === actualBId && p.status === "active"),
    "Test B.8: Client Prakhar sees active contract in workspace"
  );
  assert(
    (rFinalData.projects || []).some((p: any) => p.id === actualBId && p.status === "active"),
    "Test B.9: Freelancer Rohan sees identical active contract in workspace"
  );

  // ================================================================
  // Cleanup test artifacts
  // ================================================================
  console.log("\n🧹 Cleaning up test artifacts...");
  await supabase.from("projects").delete().in("id", [actualAId, actualBId]);
  await supabase.from("milestones").delete().in("project_id", [actualAId, actualBId]);
  await supabase.from("notifications").delete().in("project_id", [actualAId, actualBId]);

  console.log("\n==================================================================");
  console.log("   ALL REAL-ACCOUNT BIDIRECTIONAL TESTS PASSED PERFECTLY (100%)   ");
  console.log("==================================================================");
}

runRealAccountTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
