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

async function run() {
  console.log("==================================================================");
  console.log("   ROHAN VERMA (SINGLE DEMO IDENTITY) FOUR-SCENARIO WORKFLOW TEST  ");
  console.log("==================================================================");

  const timestamp = Date.now();
  const testPassword = "Password123!Secure";

  // Step 1: Fetch Rohan Profile from Supabase
  console.log("\n▶ Step 1: Verify Single Authentic Rohan Identity in Supabase");
  const { data: rohanProfile, error: rErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", "253b60b8-a9e0-4d3d-96af-618f78c1bf80")
    .single();

  assert(Boolean(rohanProfile && !rErr), "Rohan profile retrieved from Supabase", rohanProfile);
  if (!rohanProfile) throw new Error("Rohan profile null");

  const rohan = {
    id: rohanProfile.id,
    name: rohanProfile.full_name,
    email: rohanProfile.email,
    baseCode: "2W8L41",
    clientId: "CL-2W8L41",
    freelancerId: "FL-2W8L41",
  };

  console.log("Rohan Identity Mapping:");
  console.log(`  UUID: ${rohan.id}`);
  console.log(`  Email: ${rohan.email}`);
  console.log(`  Base Code: ${rohan.baseCode}`);
  console.log(`  Client ID: ${rohan.clientId}`);
  console.log(`  Freelancer ID: ${rohan.freelancerId}`);

  // Step 2: Register genuine Registered Client and Registered Freelancer
  console.log("\n▶ Step 2: Register Genuine Accounts (Client Alpha & Freelancer Beta)");
  const clientEmail = `client_alpha_${timestamp}@test.milestoneos.io`;
  const freelancerEmail = `dev_beta_${timestamp}@test.milestoneos.io`;
  const strangerEmail = `stranger_gamma_${timestamp}@test.milestoneos.io`;

  const [clientRes, freelancerRes, strangerRes] = await Promise.all([
    fetch(`${APP_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: clientEmail, password: testPassword, name: "Alpha Client Org", role: "client" }),
    }).then((r) => r.json()),
    fetch(`${APP_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: freelancerEmail, password: testPassword, name: "Beta Dev Studio", role: "freelancer" }),
    }).then((r) => r.json()),
    fetch(`${APP_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: strangerEmail, password: testPassword, name: "Gamma Stranger", role: "client" }),
    }).then((r) => r.json()),
  ]);

  assert(clientRes.success, "Client Alpha signed up successfully", clientRes);
  assert(freelancerRes.success, "Freelancer Beta signed up successfully", freelancerRes);
  assert(strangerRes.success, "Stranger Gamma signed up successfully", strangerRes);

  const regClient = clientRes.user;
  const regFreelancer = freelancerRes.user;
  const stranger = strangerRes.user;

  console.log("Registered Client Alpha:", { id: regClient.id, email: regClient.email, clientId: regClient.clientId });
  console.log("Registered Freelancer Beta:", { id: regFreelancer.id, email: regFreelancer.email, freelancerId: regFreelancer.freelancerId });
  console.log("Unrelated Stranger Gamma:", { id: stranger.id, email: stranger.email, clientId: stranger.clientId });

  // =========================================================================
  // SCENARIO 1: Registered Client Alpha -> Rohan as Freelancer (FL-2W8L41)
  // =========================================================================
  console.log("\n▶ SCENARIO 1: Registered Client Alpha -> Rohan as Freelancer (FL-2W8L41)");
  const proj1Id = `proj_scen1_${timestamp}`;

  const s1CreateRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": regClient.id },
    body: JSON.stringify({
      id: proj1Id,
      title: "Scenario 1: Client Alpha hires Rohan",
      description: "Testing Registered Client to Rohan as Freelancer",
      category: "Full-Stack Development",
      creatorId: regClient.id,
      initiatedBy: "client",
      client: {
        id: regClient.id,
        name: regClient.name,
        email: regClient.email,
        milestoneOSId: regClient.clientId,
      },
      freelancer: {
        milestoneOSId: rohan.freelancerId, // FL-2W8L41
      },
      totalBudget: 1000,
      milestones: [{ title: "Stage 1", amount: 1000, status: "not_started" }],
    }),
  });

  const s1Data = await s1CreateRes.json();
  assert(s1Data.success, "Scenario 1: Project created successfully", s1Data);
  const actual1Id = s1Data.project?.id || proj1Id;

  // Supabase audit
  const { data: dbProj1 } = await supabase.from("projects").select("*").eq("id", actual1Id).single();
  assert(dbProj1?.client_id === regClient.id, "Scenario 1: Supabase client_id is Client Alpha", dbProj1?.client_id);
  assert(dbProj1?.freelancer_id === rohan.id, "Scenario 1: Supabase freelancer_id is Rohan", dbProj1?.freelancer_id);

  // Rohan Freelancer receives incoming request
  const rohanFIncoming = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=freelancer`).then((r) => r.json());
  assert(
    rohanFIncoming.projects?.some((p: any) => p.id === actual1Id),
    "Scenario 1: Rohan sees incoming request in Freelancer View"
  );

  // Client Alpha cannot self-accept
  const s1SelfAccept = await fetch(`${APP_URL}/api/projects/${actual1Id}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": regClient.id },
    body: JSON.stringify({ action: "accept", userId: regClient.id }),
  });
  assert(s1SelfAccept.status === 403, "Scenario 1: Client Alpha blocked from self-acceptance (HTTP 403)");

  // Rohan accepts in Freelancer View
  const s1Accept = await fetch(`${APP_URL}/api/projects/${actual1Id}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": rohan.id },
    body: JSON.stringify({ action: "accept", userId: rohan.id }),
  });
  const s1AcceptData = await s1Accept.json();
  assert(s1AcceptData.success && s1AcceptData.project?.status === "active", "Scenario 1: Rohan accepts contract");

  // Perspective isolation
  const s1ClientView = await fetch(`${APP_URL}/api/projects?userId=${regClient.id}&role=client`).then((r) => r.json());
  const s1RohanFView = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=freelancer`).then((r) => r.json());
  const s1RohanCView = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=client`).then((r) => r.json());

  assert(s1ClientView.projects?.some((p: any) => p.id === actual1Id), "Scenario 1: Visible in Client Alpha's Client View");
  assert(s1RohanFView.projects?.some((p: any) => p.id === actual1Id), "Scenario 1: Visible in Rohan's Freelancer View");
  assert(!s1RohanCView.projects?.some((p: any) => p.id === actual1Id), "Scenario 1: NOT visible in Rohan's Client View");

  // =========================================================================
  // SCENARIO 2: Rohan as Client (CL-2W8L41) -> Registered Freelancer Beta
  // =========================================================================
  console.log("\n▶ SCENARIO 2: Rohan as Client (CL-2W8L41) -> Registered Freelancer Beta");
  const proj2Id = `proj_scen2_${timestamp}`;

  const s2CreateRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": rohan.id },
    body: JSON.stringify({
      id: proj2Id,
      title: "Scenario 2: Rohan hires Freelancer Beta",
      description: "Testing Rohan as Client to Registered Freelancer",
      category: "Full-Stack Development",
      creatorId: rohan.id,
      initiatedBy: "client",
      client: {
        id: rohan.id,
        name: rohan.name,
        email: rohan.email,
        milestoneOSId: rohan.clientId, // CL-2W8L41
      },
      freelancer: {
        milestoneOSId: regFreelancer.freelancerId,
      },
      totalBudget: 1200,
      milestones: [{ title: "Phase 1", amount: 1200, status: "not_started" }],
    }),
  });

  const s2Data = await s2CreateRes.json();
  assert(s2Data.success, "Scenario 2: Project created successfully", s2Data);
  const actual2Id = s2Data.project?.id || proj2Id;

  // Supabase audit
  const { data: dbProj2 } = await supabase.from("projects").select("*").eq("id", actual2Id).single();
  assert(dbProj2?.client_id === rohan.id, "Scenario 2: Supabase client_id is Rohan", dbProj2?.client_id);
  assert(dbProj2?.freelancer_id === regFreelancer.id, "Scenario 2: Supabase freelancer_id is Freelancer Beta", dbProj2?.freelancer_id);

  // Freelancer Beta receives incoming request
  const betaFIncoming = await fetch(`${APP_URL}/api/projects?userId=${regFreelancer.id}&role=freelancer`).then((r) => r.json());
  assert(
    betaFIncoming.projects?.some((p: any) => p.id === actual2Id),
    "Scenario 2: Freelancer Beta sees incoming request"
  );

  // Rohan cannot self-accept
  const s2SelfAccept = await fetch(`${APP_URL}/api/projects/${actual2Id}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": rohan.id },
    body: JSON.stringify({ action: "accept", userId: rohan.id }),
  });
  assert(s2SelfAccept.status === 403, "Scenario 2: Rohan blocked from self-acceptance (HTTP 403)");

  // Freelancer Beta accepts
  const s2Accept = await fetch(`${APP_URL}/api/projects/${actual2Id}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": regFreelancer.id },
    body: JSON.stringify({ action: "accept", userId: regFreelancer.id }),
  });
  const s2AcceptData = await s2Accept.json();
  assert(s2AcceptData.success && s2AcceptData.project?.status === "active", "Scenario 2: Freelancer Beta accepts contract");

  // Perspective isolation
  const s2RohanCView = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=client`).then((r) => r.json());
  const s2BetaFView = await fetch(`${APP_URL}/api/projects?userId=${regFreelancer.id}&role=freelancer`).then((r) => r.json());
  const s2RohanFView = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=freelancer`).then((r) => r.json());

  assert(s2RohanCView.projects?.some((p: any) => p.id === actual2Id), "Scenario 2: Visible in Rohan's Client View");
  assert(s2BetaFView.projects?.some((p: any) => p.id === actual2Id), "Scenario 2: Visible in Freelancer Beta's Freelancer View");
  assert(!s2RohanFView.projects?.some((p: any) => p.id === actual2Id), "Scenario 2: NOT visible in Rohan's Freelancer View");

  // =========================================================================
  // SCENARIO 3: Registered Freelancer Beta -> Rohan as Client (CL-2W8L41)
  // =========================================================================
  console.log("\n▶ SCENARIO 3: Registered Freelancer Beta -> Rohan as Client (CL-2W8L41)");
  const proj3Id = `proj_scen3_${timestamp}`;

  const s3CreateRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": regFreelancer.id },
    body: JSON.stringify({
      id: proj3Id,
      title: "Scenario 3: Freelancer Beta proposes to Rohan",
      description: "Testing Registered Freelancer proposing to Rohan as Client",
      category: "Full-Stack Development",
      creatorId: regFreelancer.id,
      initiatedBy: "freelancer",
      client: {
        milestoneOSId: rohan.clientId, // CL-2W8L41
      },
      freelancer: {
        id: regFreelancer.id,
        name: regFreelancer.name,
        email: regFreelancer.email,
        milestoneOSId: regFreelancer.freelancerId,
      },
      totalBudget: 1800,
      milestones: [{ title: "Sprint 1", amount: 1800, status: "not_started" }],
    }),
  });

  const s3Data = await s3CreateRes.json();
  assert(s3Data.success, "Scenario 3: Project created successfully", s3Data);
  const actual3Id = s3Data.project?.id || proj3Id;

  // Supabase audit
  const { data: dbProj3 } = await supabase.from("projects").select("*").eq("id", actual3Id).single();
  assert(dbProj3?.client_id === rohan.id, "Scenario 3: Supabase client_id is Rohan", dbProj3?.client_id);
  assert(dbProj3?.freelancer_id === regFreelancer.id, "Scenario 3: Supabase freelancer_id is Freelancer Beta", dbProj3?.freelancer_id);

  // Rohan Client receives incoming proposal
  const rohanCIncoming = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=client`).then((r) => r.json());
  assert(
    rohanCIncoming.projects?.some((p: any) => p.id === actual3Id),
    "Scenario 3: Rohan sees incoming proposal in Client View"
  );

  // Freelancer Beta cannot self-accept
  const s3SelfAccept = await fetch(`${APP_URL}/api/projects/${actual3Id}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": regFreelancer.id },
    body: JSON.stringify({ action: "accept", userId: regFreelancer.id }),
  });
  assert(s3SelfAccept.status === 403, "Scenario 3: Freelancer Beta blocked from self-acceptance (HTTP 403)");

  // Rohan accepts as Client
  const s3Accept = await fetch(`${APP_URL}/api/projects/${actual3Id}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": rohan.id },
    body: JSON.stringify({ action: "accept", userId: rohan.id }),
  });
  const s3AcceptData = await s3Accept.json();
  assert(s3AcceptData.success && s3AcceptData.project?.status === "active", "Scenario 3: Rohan accepts proposal as Client");

  // Perspective isolation
  const s3RohanCView = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=client`).then((r) => r.json());
  const s3BetaFView = await fetch(`${APP_URL}/api/projects?userId=${regFreelancer.id}&role=freelancer`).then((r) => r.json());
  const s3RohanFView = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=freelancer`).then((r) => r.json());

  assert(s3RohanCView.projects?.some((p: any) => p.id === actual3Id), "Scenario 3: Visible in Rohan's Client View");
  assert(s3BetaFView.projects?.some((p: any) => p.id === actual3Id), "Scenario 3: Visible in Freelancer Beta's Freelancer View");
  assert(!s3RohanFView.projects?.some((p: any) => p.id === actual3Id), "Scenario 3: NOT visible in Rohan's Freelancer View");

  // =========================================================================
  // SCENARIO 4: Rohan as Freelancer (FL-2W8L41) -> Registered Client Alpha
  // =========================================================================
  console.log("\n▶ SCENARIO 4: Rohan as Freelancer (FL-2W8L41) -> Registered Client Alpha");
  const proj4Id = `proj_scen4_${timestamp}`;

  const s4CreateRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": rohan.id },
    body: JSON.stringify({
      id: proj4Id,
      title: "Scenario 4: Rohan proposes to Client Alpha",
      description: "Testing Rohan as Freelancer proposing to Registered Client",
      category: "Full-Stack Development",
      creatorId: rohan.id,
      initiatedBy: "freelancer",
      client: {
        milestoneOSId: regClient.clientId,
      },
      freelancer: {
        id: rohan.id,
        name: rohan.name,
        email: rohan.email,
        milestoneOSId: rohan.freelancerId, // FL-2W8L41
      },
      totalBudget: 2200,
      milestones: [{ title: "Deliverable 1", amount: 2200, status: "not_started" }],
    }),
  });

  const s4Data = await s4CreateRes.json();
  assert(s4Data.success, "Scenario 4: Project created successfully", s4Data);
  const actual4Id = s4Data.project?.id || proj4Id;

  // Supabase audit
  const { data: dbProj4 } = await supabase.from("projects").select("*").eq("id", actual4Id).single();
  assert(dbProj4?.client_id === regClient.id, "Scenario 4: Supabase client_id is Client Alpha", dbProj4?.client_id);
  assert(dbProj4?.freelancer_id === rohan.id, "Scenario 4: Supabase freelancer_id is Rohan", dbProj4?.freelancer_id);

  // Client Alpha receives incoming proposal
  const alphaCIncoming = await fetch(`${APP_URL}/api/projects?userId=${regClient.id}&role=client`).then((r) => r.json());
  assert(
    alphaCIncoming.projects?.some((p: any) => p.id === actual4Id),
    "Scenario 4: Client Alpha sees incoming proposal"
  );

  // Rohan cannot self-accept
  const s4SelfAccept = await fetch(`${APP_URL}/api/projects/${actual4Id}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": rohan.id },
    body: JSON.stringify({ action: "accept", userId: rohan.id }),
  });
  assert(s4SelfAccept.status === 403, "Scenario 4: Rohan blocked from self-acceptance (HTTP 403)");

  // Client Alpha accepts
  const s4Accept = await fetch(`${APP_URL}/api/projects/${actual4Id}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": regClient.id },
    body: JSON.stringify({ action: "accept", userId: regClient.id }),
  });
  const s4AcceptData = await s4Accept.json();
  assert(s4AcceptData.success && s4AcceptData.project?.status === "active", "Scenario 4: Client Alpha accepts proposal");

  // Perspective isolation
  const s4ClientView = await fetch(`${APP_URL}/api/projects?userId=${regClient.id}&role=client`).then((r) => r.json());
  const s4RohanFView = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=freelancer`).then((r) => r.json());
  const s4RohanCView = await fetch(`${APP_URL}/api/projects?userId=${rohan.id}&role=client`).then((r) => r.json());

  assert(s4ClientView.projects?.some((p: any) => p.id === actual4Id), "Scenario 4: Visible in Client Alpha's Client View");
  assert(s4RohanFView.projects?.some((p: any) => p.id === actual4Id), "Scenario 4: Visible in Rohan's Freelancer View");
  assert(!s4RohanCView.projects?.some((p: any) => p.id === actual4Id), "Scenario 4: NOT visible in Rohan's Client View");

  // =========================================================================
  // DATA ISOLATION: Unrelated Stranger Gamma
  // =========================================================================
  console.log("\n▶ DATA ISOLATION: Stranger Gamma has ZERO visibility into any of the 4 contracts");
  const strangerCView = await fetch(`${APP_URL}/api/projects?userId=${stranger.id}&role=client`).then((r) => r.json());
  const strangerFView = await fetch(`${APP_URL}/api/projects?userId=${stranger.id}&role=freelancer`).then((r) => r.json());

  const testIds = [actual1Id, actual2Id, actual3Id, actual4Id];
  const cLeaks = (strangerCView.projects || []).filter((p: any) => testIds.includes(p.id));
  const fLeaks = (strangerFView.projects || []).filter((p: any) => testIds.includes(p.id));

  assert(cLeaks.length === 0, "Stranger has 0 leaks in Client View");
  assert(fLeaks.length === 0, "Stranger has 0 leaks in Freelancer View");

  // Direct access denial for Stranger
  const strangerDirect = await fetch(`${APP_URL}/api/projects/${actual1Id}?userId=${stranger.id}`);
  assert(strangerDirect.status === 404, "Stranger direct project access returns 404");

  // =========================================================================
  // INTEGRITY CHECK: Genuine PayPal Captures
  // =========================================================================
  console.log("\n▶ INTEGRITY CHECK: Verify Genuine PayPal Captures are Untouched");
  const { data: genuineTxs } = await supabase
    .from("transactions")
    .select("id, paypal_transaction_id, amount, status")
    .in("paypal_transaction_id", ["90U44122NS995343N", "69K81424J7095031B"]);

  if (!genuineTxs) throw new Error("genuineTxs is null");
  const tx2400 = genuineTxs.find((t) => t.paypal_transaction_id === "90U44122NS995343N");
  const tx100 = genuineTxs.find((t) => t.paypal_transaction_id === "69K81424J7095031B");

  assert(Boolean(tx2400 && Number(tx2400.amount) === 2400), "PayPal $2,400 capture 90U44122NS995343N intact", tx2400);
  assert(Boolean(tx100 && Number(tx100.amount) === 100), "PayPal $100 capture 69K81424J7095031B intact", tx100);

  // Clean up test projects
  console.log("\n🧹 Cleaning up test scenario projects...");
  await supabase.from("projects").delete().in("id", testIds);
  await supabase.from("notifications").delete().in("project_id", testIds);

  console.log("\n==================================================================");
  console.log("   🎉 ALL 4 ROHAN-TO-REGISTERED-ACCOUNT SCENARIOS PASSED 100%!    ");
  console.log("==================================================================");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
