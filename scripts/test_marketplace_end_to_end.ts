/**
 * MilestoneOS — End-to-End Universal Marketplace Integration Test Suite
 * Tests full dynamic multi-user lifecycle across real Supabase PostgreSQL persistence.
 */

import { createClient } from "@supabase/supabase-js";

const APP_URL = "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Registered Test Identities
const FREELANCER_ROHAN = {
  id: "253b60b8-a9e0-4d3d-96af-618f78c1bf80",
  email: "rohan.verma@craftdev.io",
  name: "Rohan Verma",
  msoId: "FL-2W8L41",
};

const CLIENT_PRAKHAR = {
  id: "c3adcf39-e878-4021-bf37-ea0a7ad79c22",
  email: "prakhar.agarwal.0710@gmail.com",
  name: "Prakhar Agarwal",
  msoId: "CL-Q7EWTG",
};

const FREELANCER_BOB = {
  id: "790c4626-fe06-42a7-987d-597eb59fed68",
  email: "freelancer_1794348280850@testmso.local",
  name: "Bob Freelancer",
  msoId: "FL-KNCQ3X",
};

const CLIENT_ALICE = {
  id: "129662ee-a85e-4edb-ad66-e127a205ed05",
  email: "client_1794348280850@testmso.local",
  name: "Alice Client",
  msoId: "CL-XADEC8",
};

const STRANGER_CHARLIE = {
  id: "1d335c38-31d3-40b7-8e95-ebca7154765a",
  email: "stranger_1794348280850@testmso.local",
  name: "Charlie Stranger",
  msoId: "CL-WH3ZBJ",
};

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`, details || "");
  }
}

async function runAllTests() {
  console.log("==================================================================");
  console.log("   MILESTONEOS END-TO-END MARKETPLACE INTEGRATION TEST SUITE      ");
  console.log("==================================================================");

  // --------------------------------------------------------------------------
  // SCENARIO A: Freelancer Proposes to Client -> Client Accepts -> Both See Project
  // --------------------------------------------------------------------------
  console.log("\n▶ SCENARIO A: Proposal -> Acceptance -> Mutual Visibility");
  const testAId = `proj_test_scen_a_${Date.now()}`;

  // 1. Freelancer creates proposal to Client
  const createRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: testAId,
      title: "Decentralized Escrow Smart Contracts",
      description: "Automated escrow platform with PayPal release.",
      category: "Full-Stack Development",
      targetDeadline: "Dec 31, 2026",
      initiatedBy: "freelancer",
      clientId: CLIENT_PRAKHAR.id,
      freelancerId: FREELANCER_ROHAN.id,
      client: {
        id: CLIENT_PRAKHAR.id,
        name: CLIENT_PRAKHAR.name,
        email: CLIENT_PRAKHAR.email,
        milestoneOSId: CLIENT_PRAKHAR.msoId,
      },
      freelancer: {
        id: FREELANCER_ROHAN.id,
        name: FREELANCER_ROHAN.name,
        email: FREELANCER_ROHAN.email,
        milestoneOSId: FREELANCER_ROHAN.msoId,
      },
      milestones: [
        {
          id: `ms_a_1_${Date.now()}`,
          stageNumber: 1,
          title: "Contract Architecture",
          amount: 500,
          currency: "USD",
          status: "not_started",
          acceptanceCriteria: [{ title: "Verified code architecture" }],
        },
      ],
    }),
  });

  const createData = await createRes.json();
  const actualAId = createData.project?.id || testAId;
  assert(createRes.ok && createData.success, "1. Freelancer successfully proposes project to Client", createData);

  // Verify in Supabase table
  const { data: dbProjA } = await supabase.from("projects").select("*").eq("id", actualAId).single();
  assert(
    dbProjA &&
      dbProjA.status === "awaiting_acceptance" &&
      dbProjA.client_id === CLIENT_PRAKHAR.id &&
      dbProjA.freelancer_id === FREELANCER_ROHAN.id,
    "2. Supabase stores proposal with correct client_id, freelancer_id and awaiting_acceptance status"
  );

  // 2. Client queries pending projects
  const clientPendingRes = await fetch(
    `${APP_URL}/api/projects?userId=${CLIENT_PRAKHAR.id}&userEmail=${CLIENT_PRAKHAR.email}`
  );
  const clientPendingData = await clientPendingRes.json();
  const foundInClient = clientPendingData.projects?.some((p: any) => p.id === actualAId);
  assert(foundInClient, "3. Recipient Client sees incoming proposal in dashboard query");

  // 3. Client accepts proposal
  const acceptRes = await fetch(`${APP_URL}/api/projects/${actualAId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "accept",
      userId: CLIENT_PRAKHAR.id,
      userEmail: CLIENT_PRAKHAR.email,
    }),
  });
  const acceptData = await acceptRes.json();
  assert(acceptRes.ok && acceptData.success, "4. Client successfully accepts proposal", acceptData);

  // 4. Verify in Supabase table
  const { data: dbAcceptedA } = await supabase.from("projects").select("*").eq("id", actualAId).single();
  assert(
    dbAcceptedA &&
      dbAcceptedA.status === "active" &&
      dbAcceptedA.proposal_status === "accepted" &&
      dbAcceptedA.terms_agreed === true,
    "5. Supabase atomically updates project to status='active' and proposal_status='accepted'"
  );

  // 5. Freelancer queries projects
  const freelancerProjectsRes = await fetch(
    `${APP_URL}/api/projects?userId=${FREELANCER_ROHAN.id}&userEmail=${FREELANCER_ROHAN.email}&role=freelancer`
  );
  const freelancerProjectsData = await freelancerProjectsRes.json();
  const foundInFreelancer = freelancerProjectsData.projects?.some(
    (p: any) => p.id === actualAId && p.status === "active"
  );
  assert(foundInFreelancer, "6. Freelancer sees the accepted project in active projects");

  // 6. Client queries projects
  const clientProjectsRes = await fetch(
    `${APP_URL}/api/projects?userId=${CLIENT_PRAKHAR.id}&userEmail=${CLIENT_PRAKHAR.email}&role=client`
  );
  const clientProjectsData = await clientProjectsRes.json();
  const foundInClientActive = clientProjectsData.projects?.some(
    (p: any) => p.id === actualAId && p.status === "active"
  );
  assert(foundInClientActive, "7. Client sees the identical accepted project in active projects");

  // --------------------------------------------------------------------------
  // SCENARIO B: Distinct Users Bob (FL) & Alice (CL) Complete Lifecycle
  // --------------------------------------------------------------------------
  console.log("\n▶ SCENARIO B: Dynamic Users Bob & Alice Lifecycle");
  const testBId = `proj_test_scen_b_${Date.now()}`;

  const createBRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: testBId,
      title: "Mobile Commerce App",
      description: "React Native eCommerce store.",
      category: "Mobile Development",
      targetDeadline: "Jan 15, 2027",
      initiatedBy: "freelancer",
      clientId: CLIENT_ALICE.id,
      freelancerId: FREELANCER_BOB.id,
      client: {
        id: CLIENT_ALICE.id,
        name: CLIENT_ALICE.name,
        email: CLIENT_ALICE.email,
        milestoneOSId: CLIENT_ALICE.msoId,
      },
      freelancer: {
        id: FREELANCER_BOB.id,
        name: FREELANCER_BOB.name,
        email: FREELANCER_BOB.email,
        milestoneOSId: FREELANCER_BOB.msoId,
      },
      milestones: [
        {
          id: `ms_b_1_${Date.now()}`,
          stageNumber: 1,
          title: "UI Prototype",
          amount: 800,
          currency: "USD",
          status: "not_started",
        },
      ],
    }),
  });
  const createBData = await createBRes.json();
  const actualBId = createBData.project?.id || testBId;

  // Alice accepts
  const acceptBRes = await fetch(`${APP_URL}/api/projects/${actualBId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "accept", userId: CLIENT_ALICE.id, userEmail: CLIENT_ALICE.email }),
  });
  const acceptBData = await acceptBRes.json();
  assert(acceptBRes.ok && acceptBData.success, "8. Alice successfully accepts Bob's proposal", acceptBData);

  // Both see it
  const bobRes = await fetch(`${APP_URL}/api/projects?userId=${FREELANCER_BOB.id}&role=freelancer`);
  const aliceRes = await fetch(`${APP_URL}/api/projects?userId=${CLIENT_ALICE.id}&role=client`);
  const bobData = await bobRes.json();
  const aliceData = await aliceRes.json();
  assert(
    bobData.projects?.some((p: any) => p.id === actualBId && p.status === "active") &&
      aliceData.projects?.some((p: any) => p.id === actualBId && p.status === "active"),
    "9. Both Bob and Alice see the active project on their respective dashboards"
  );

  // --------------------------------------------------------------------------
  // SCENARIO C: Client Rejects Proposal
  // --------------------------------------------------------------------------
  console.log("\n▶ SCENARIO C: Proposal Rejection");
  const testCId = `proj_test_scen_c_${Date.now()}`;
  const createCRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: testCId,
      title: "Scope Too Large Proposal",
      description: "Test rejection",
      category: "Full-Stack Development",
      initiatedBy: "freelancer",
      clientId: CLIENT_PRAKHAR.id,
      freelancerId: FREELANCER_ROHAN.id,
      client: { id: CLIENT_PRAKHAR.id, name: CLIENT_PRAKHAR.name, email: CLIENT_PRAKHAR.email },
      freelancer: { id: FREELANCER_ROHAN.id, name: FREELANCER_ROHAN.name, email: FREELANCER_ROHAN.email },
      milestones: [{ id: `ms_c_${Date.now()}`, stageNumber: 1, title: "Milestone", amount: 1000 }],
    }),
  });
  const createCData = await createCRes.json();
  const actualCId = createCData.project?.id || testCId;

  const rejectRes = await fetch(`${APP_URL}/api/projects/${actualCId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reject", feedback: "Budget out of range", userId: CLIENT_PRAKHAR.id }),
  });
  const rejectData = await rejectRes.json();
  assert(rejectRes.ok && rejectData.success, "10. Client successfully rejects proposal with feedback", rejectData);

  const { data: dbRejected } = await supabase.from("projects").select("status, proposal_status").eq("id", actualCId).single();
  assert(
    dbRejected?.status === "rejected" && dbRejected?.proposal_status === "rejected",
    "11. Supabase database records rejected status"
  );

  // --------------------------------------------------------------------------
  // SCENARIO D: Proposer Attempts to Accept Own Proposal (Security Rejection)
  // --------------------------------------------------------------------------
  console.log("\n▶ SCENARIO D: Security — Proposer Cannot Accept Own Proposal");
  const testDId = `proj_test_scen_d_${Date.now()}`;
  const createDRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: testDId,
      title: "Self-Approval Security Test",
      description: "Test",
      category: "Security",
      initiatedBy: "freelancer",
      clientId: CLIENT_PRAKHAR.id,
      freelancerId: FREELANCER_ROHAN.id,
      client: { id: CLIENT_PRAKHAR.id, name: CLIENT_PRAKHAR.name, email: CLIENT_PRAKHAR.email },
      freelancer: { id: FREELANCER_ROHAN.id, name: FREELANCER_ROHAN.name, email: FREELANCER_ROHAN.email },
      milestones: [{ id: `ms_d_${Date.now()}`, stageNumber: 1, title: "Stage", amount: 200 }],
    }),
  });
  const createDData = await createDRes.json();
  const actualDId = createDData.project?.id || testDId;

  // Rohan attempts to accept his own proposal
  const selfAcceptRes = await fetch(`${APP_URL}/api/projects/${actualDId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "accept",
      userId: FREELANCER_ROHAN.id,
      userEmail: FREELANCER_ROHAN.email,
    }),
  });
  assert(
    selfAcceptRes.status === 403,
    `12. Server rejects self-acceptance attempt with HTTP 403 Forbidden (status: ${selfAcceptRes.status})`
  );

  // --------------------------------------------------------------------------
  // SCENARIO E: Unrelated User Access Denial
  // --------------------------------------------------------------------------
  console.log("\n▶ SCENARIO E: Security — Unrelated User Cannot View or Modify");
  // Charlie attempts to view project A
  const strangerGetRes = await fetch(`${APP_URL}/api/projects/${actualAId}?userId=${STRANGER_CHARLIE.id}`);
  assert(
    strangerGetRes.status === 404 || strangerGetRes.status === 403,
    `13. Unrelated user denied access to private project (status: ${strangerGetRes.status})`
  );

  // Charlie attempts to accept project A
  const strangerAcceptRes = await fetch(`${APP_URL}/api/projects/${actualAId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "accept", userId: STRANGER_CHARLIE.id }),
  });
  assert(
    strangerAcceptRes.status === 403,
    `14. Unrelated user denied ability to accept someone else's proposal (status: ${strangerAcceptRes.status})`
  );

  // --------------------------------------------------------------------------
  // SCENARIO F: Milestone Submission & Review Lifecycle
  // --------------------------------------------------------------------------
  console.log("\n▶ SCENARIO F: Milestone Review Lifecycle");
  const milestoneId = dbAcceptedA.milestones[0].id;

  // Client approves milestone
  const approveRes = await fetch(`${APP_URL}/api/milestones/${milestoneId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: actualAId,
      action: "approve",
      feedback: "Deliverables verified against contract criteria.",
    }),
  });
  const approveData = await approveRes.json();
  assert(approveRes.ok && approveData.success, "15. Client successfully approves milestone", approveData);

  // Verify approved status in Supabase
  const { data: dbApproved } = await supabase.from("projects").select("*").eq("id", actualAId).single();
  assert(
    dbApproved?.milestones?.some((m: any) => m.id === milestoneId && m.status === "approved"),
    "16. Supabase records milestone status as 'approved'"
  );

  // --------------------------------------------------------------------------
  // SCENARIO G: Security — Freelancer Cannot Initiate Payment
  // --------------------------------------------------------------------------
  console.log("\n▶ SCENARIO G: Security — Only Client Can Initiate Payment");
  const payRes = await fetch(`${APP_URL}/api/paypal/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: actualAId,
      milestoneId: milestoneId,
      userId: FREELANCER_ROHAN.id, // Freelancer trying to trigger client payment
    }),
  });
  assert(
    payRes.status === 403,
    `17. Server blocks non-client from creating PayPal payment order (status: ${payRes.status})`
  );

  // --------------------------------------------------------------------------
  // SCENARIO H: Genuine $2,400 Completed PayPal Capture Preservation
  // --------------------------------------------------------------------------
  console.log("\n▶ SCENARIO H: Integrity Check — Preserve Genuine $2,400 Capture");
  const { data: genTx, error: genErr } = await supabase
    .from("transactions")
    .select("*")
    .eq("paypal_transaction_id", "90U44122NS995343N")
    .single();

  assert(
    genTx && genTx.amount === 2400 && genTx.paypal_transaction_id === "90U44122NS995343N",
    "18. Genuine $2,400 PayPal capture (ID: 90U44122NS995343N) is preserved and intact",
    genTx
  );

  // Clean up temporary test projects
  await supabase.from("projects").delete().in("id", [actualAId, actualBId, actualCId, actualDId]);

  console.log("\n==================================================================");
  console.log(`   INTEGRATION TEST RESULTS: ${passedTests} / ${totalTests} PASSED   `);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test Suite Unhandled Exception:", err);
  process.exit(1);
});
