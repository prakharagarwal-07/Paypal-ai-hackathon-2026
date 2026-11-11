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
  console.log("   THREE-ACCOUNT STRICT PRIVACY & MULTI-USER WORKFLOW TEST        ");
  console.log("==================================================================");

  const timestamp = Date.now();
  const aliceEmail = `alice_${timestamp}@test.milestoneos.io`;
  const bobEmail = `bob_${timestamp}@test.milestoneos.io`;
  const charlieEmail = `charlie_${timestamp}@test.milestoneos.io`;
  const testPassword = "Password123!Secure";

  // Step 1: Register Account 1 (Alice - Client), Account 2 (Bob - Freelancer), Account 3 (Charlie - Unrelated)
  console.log("\n▶ Step 1: Register 3 Distinct Authenticated Accounts in Supabase");

  const [aliceRes, bobRes, charlieRes] = await Promise.all([
    fetch(`${APP_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: aliceEmail, password: testPassword, name: "Alice Client", role: "client" }),
    }).then((r) => r.json()),
    fetch(`${APP_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: bobEmail, password: testPassword, name: "Bob Freelancer", role: "freelancer" }),
    }).then((r) => r.json()),
    fetch(`${APP_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: charlieEmail, password: testPassword, name: "Charlie Unrelated", role: "client" }),
    }).then((r) => r.json()),
  ]);

  assert(aliceRes.success, "Alice signed up successfully", aliceRes);
  assert(bobRes.success, "Bob signed up successfully", bobRes);
  assert(charlieRes.success, "Charlie signed up successfully", charlieRes);

  const alice = aliceRes.user;
  const bob = bobRes.user;
  const charlie = charlieRes.user;

  console.log("\nAccount 1 (Client):", { id: alice.id, email: alice.email, clientId: alice.clientId });
  console.log("Account 2 (Freelancer):", { id: bob.id, email: bob.email, freelancerId: bob.freelancerId });
  console.log("Account 3 (Unrelated Third Party):", { id: charlie.id, email: charlie.email, clientId: charlie.clientId });

  // Step 2: Alice creates project request targeting Bob
  console.log("\n▶ Step 2: Alice creates project request targeting Bob via Freelancer Code");
  const projectId = `proj_priv_${timestamp}`;

  const createRes = await fetch(`${APP_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": alice.id, "x-user-email": alice.email },
    body: JSON.stringify({
      id: projectId,
      title: "Confidential Enterprise Platform Build",
      description: "Private contract strictly isolated to Alice (Client) and Bob (Freelancer)",
      category: "Full-Stack Development",
      creatorId: alice.id,
      initiatedBy: "client",
      client: {
        id: alice.id,
        name: alice.name,
        email: alice.email,
        milestoneOSId: alice.clientId,
      },
      freelancer: {
        milestoneOSId: bob.freelancerId,
      },
      totalBudget: 1500,
      milestones: [
        {
          id: `ms_${timestamp}_1`,
          title: "System Architecture Design",
          amount: 750,
          status: "not_started",
          acceptanceCriteria: [{ title: "Architecture verified" }],
        },
        {
          id: `ms_${timestamp}_2`,
          title: "Core Service Implementation",
          amount: 750,
          status: "not_started",
          acceptanceCriteria: [{ title: "Unit tests passing" }],
        },
      ],
    }),
  });

  const createData = await createRes.json();
  assert(createData.success, "Alice project creation succeeded", createData);
  const actualProjectId = createData.project?.id || projectId;

  // Step 3: Alice cannot accept her own proposal (Scenario D test)
  console.log("\n▶ Step 3: Verify Proposer Alice CANNOT accept her own proposal");
  const selfAcceptRes = await fetch(`${APP_URL}/api/projects/${actualProjectId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": alice.id, "x-user-email": alice.email },
    body: JSON.stringify({
      action: "accept",
      userId: alice.id,
      userEmail: alice.email,
    }),
  });
  const selfAcceptData = await selfAcceptRes.json();
  assert(selfAcceptRes.status === 403, "Self-acceptance blocked with HTTP 403", selfAcceptData);

  // Step 4: Bob accepts the project proposal
  console.log("\n▶ Step 4: Designated Recipient Bob accepts the project proposal");
  const acceptRes = await fetch(`${APP_URL}/api/projects/${actualProjectId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": bob.id, "x-user-email": bob.email },
    body: JSON.stringify({
      action: "accept",
      userId: bob.id,
      userEmail: bob.email,
    }),
  });
  const acceptData = await acceptRes.json();
  assert(acceptRes.status === 200, "Bob accepted project proposal successfully", acceptData);
  assert(acceptData.project?.status === "active", "Project status is active", acceptData.project?.status);
  assert(acceptData.project?.proposalStatus === "accepted", "Proposal status is accepted", acceptData.project?.proposalStatus);

  // Step 5: Verify in Supabase PostgreSQL directly
  console.log("\n▶ Step 5: Audit Supabase PostgreSQL Record");
  const { data: dbProj, error: dbErr } = await supabase
    .from("projects")
    .select("id, client_id, freelancer_id, client_email, freelancer_email, status, proposal_status, terms_agreed, is_demo")
    .eq("id", actualProjectId)
    .single();

  assert(Boolean(dbProj && !dbErr), "Project found in Supabase PostgreSQL", dbProj);
  if (!dbProj) throw new Error("dbProj is null");
  assert(dbProj.client_id === alice.id, "client_id strictly equals Alice UUID", dbProj.client_id);
  assert(dbProj.freelancer_id === bob.id, "freelancer_id strictly equals Bob UUID", dbProj.freelancer_id);
  assert(dbProj.status === "active", "Supabase status is active", dbProj.status);
  assert(dbProj.proposal_status === "accepted", "Supabase proposal_status is accepted", dbProj.proposal_status);
  assert(dbProj.terms_agreed === true, "Supabase terms_agreed is true", dbProj.terms_agreed);

  // Step 6: Test the 6 Workspace Visibility Cells
  console.log("\n▶ Step 6: Test the 6 Account / Workspace Visibility Matrix");

  // Query API for each account and role
  const queryWorkspace = async (userId: string, userEmail: string, msoId: string, role: "client" | "freelancer") => {
    const res = await fetch(
      `${APP_URL}/api/projects?userId=${encodeURIComponent(userId)}&userEmail=${encodeURIComponent(userEmail)}&milestoneOSId=${encodeURIComponent(msoId)}&role=${role}`
    );
    const data = await res.json();
    const list = data.projects || [];
    return Boolean(list.some((p: any) => p.id === actualProjectId));
  };

  const cell1_AliceClient = await queryWorkspace(alice.id, alice.email, alice.clientId, "client");
  const cell2_AliceFreelancer = await queryWorkspace(alice.id, alice.email, alice.clientId, "freelancer");
  const cell3_BobClient = await queryWorkspace(bob.id, bob.email, bob.freelancerId, "client");
  const cell4_BobFreelancer = await queryWorkspace(bob.id, bob.email, bob.freelancerId, "freelancer");
  const cell5_CharlieClient = await queryWorkspace(charlie.id, charlie.email, charlie.clientId, "client");
  const cell6_CharlieFreelancer = await queryWorkspace(charlie.id, charlie.email, charlie.clientId, "freelancer");

  console.log("\nVisibility Matrix Results:");
  console.log(`  Account 1 (Alice)   — Client View:     ${cell1_AliceClient ? "VISIBLE (Expected)" : "HIDDEN"}`);
  console.log(`  Account 1 (Alice)   — Freelancer View: ${!cell2_AliceFreelancer ? "NOT VISIBLE (Expected)" : "VISIBLE (LEAK!)"}`);
  console.log(`  Account 2 (Bob)     — Client View:     ${!cell3_BobClient ? "NOT VISIBLE (Expected)" : "VISIBLE (LEAK!)"}`);
  console.log(`  Account 2 (Bob)     — Freelancer View: ${cell4_BobFreelancer ? "VISIBLE (Expected)" : "HIDDEN"}`);
  console.log(`  Account 3 (Charlie) — Client View:     ${!cell5_CharlieClient ? "NOT VISIBLE (Expected)" : "VISIBLE (LEAK!)"}`);
  console.log(`  Account 3 (Charlie) — Freelancer View: ${!cell6_CharlieFreelancer ? "NOT VISIBLE (Expected)" : "VISIBLE (LEAK!)"}`);

  assert(cell1_AliceClient === true, "Cell 1: Account 1 Client View is VISIBLE");
  assert(cell2_AliceFreelancer === false, "Cell 2: Account 1 Freelancer View is NOT VISIBLE");
  assert(cell3_BobClient === false, "Cell 3: Account 2 Client View is NOT VISIBLE");
  assert(cell4_BobFreelancer === true, "Cell 4: Account 2 Freelancer View is VISIBLE");
  assert(cell5_CharlieClient === false, "Cell 5: Account 3 Client View is NOT VISIBLE");
  assert(cell6_CharlieFreelancer === false, "Cell 6: Account 3 Freelancer View is NOT VISIBLE");

  // Step 7: Direct API Security Checks
  console.log("\n▶ Step 7: Direct API Security & Access Control Verification");

  // 7a. Charlie attempts direct GET /api/projects/:id
  const charlieDirectRes = await fetch(`${APP_URL}/api/projects/${actualProjectId}?userId=${charlie.id}`);
  assert(charlieDirectRes.status === 404, "Charlie direct project access denied with HTTP 404", charlieDirectRes.status);

  // 7b. Unauthenticated caller attempts direct GET /api/projects/:id
  const unauthDirectRes = await fetch(`${APP_URL}/api/projects/${actualProjectId}`);
  assert(unauthDirectRes.status === 404, "Unauthenticated direct project access denied with HTTP 404", unauthDirectRes.status);

  // 7c. Charlie attempts to query transactions for this project
  const charlieTxRes = await fetch(`${APP_URL}/api/transactions?userId=${charlie.id}&projectId=${actualProjectId}`);
  const charlieTxData = await charlieTxRes.json();
  assert(charlieTxData.transactions?.length === 0, "Charlie gets 0 transactions for Alice/Bob project", charlieTxData.transactions?.length);

  // 7d. Charlie attempts to review/approve milestone
  const charlieReviewRes = await fetch(`${APP_URL}/api/milestones/ms_${timestamp}_1/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: actualProjectId,
      action: "approve",
      userId: charlie.id,
      userEmail: charlie.email,
    }),
  });
  assert(charlieReviewRes.status === 403, "Charlie milestone approval denied with HTTP 403", charlieReviewRes.status);

  // 7e. Charlie attempts to submit deliverable for milestone
  const charlieSubmitRes = await fetch(`${APP_URL}/api/milestones/ms_${timestamp}_1/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: actualProjectId,
      repoUrl: "https://github.com/evil/repo",
      userId: charlie.id,
      userEmail: charlie.email,
    }),
  });
  assert(charlieSubmitRes.status === 403, "Charlie deliverable submission denied with HTTP 403", charlieSubmitRes.status);

  // 7f. Alice (Client) attempts to submit deliverable (only freelancer allowed)
  const aliceSubmitRes = await fetch(`${APP_URL}/api/milestones/ms_${timestamp}_1/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: actualProjectId,
      repoUrl: "https://github.com/alice/repo",
      userId: alice.id,
      userEmail: alice.email,
    }),
  });
  assert(aliceSubmitRes.status === 403, "Alice deliverable submission denied with HTTP 403 (freelancer only)", aliceSubmitRes.status);

  // 7g. Bob (Freelancer) attempts to approve milestone (only client allowed)
  const bobApproveRes = await fetch(`${APP_URL}/api/milestones/ms_${timestamp}_1/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: actualProjectId,
      action: "approve",
      userId: bob.id,
      userEmail: bob.email,
    }),
  });
  assert(bobApproveRes.status === 403, "Bob milestone approval denied with HTTP 403 (client only)", bobApproveRes.status);

  // Step 8: Verify PayPal Captures Intact
  console.log("\n▶ Step 8: Verify PayPal Sandbox Captures Intact in Supabase");
  const { data: genuineTxs, error: txErr } = await supabase
    .from("transactions")
    .select("id, paypal_transaction_id, amount, status")
    .in("paypal_transaction_id", ["90U44122NS995343N", "69K81424J7095031B"]);

  assert(!txErr && genuineTxs && genuineTxs.length >= 2, "Genuine PayPal transactions intact in Supabase", genuineTxs);
  if (!genuineTxs) throw new Error("genuineTxs is null");
  const tx2400 = genuineTxs.find((t) => t.paypal_transaction_id === "90U44122NS995343N");
  const tx100 = genuineTxs.find((t) => t.paypal_transaction_id === "69K81424J7095031B");

  assert(Boolean(tx2400 && Number(tx2400.amount) === 2400), "PayPal $2,400 USD capture 90U44122NS995343N intact", tx2400);
  assert(Boolean(tx100 && Number(tx100.amount) === 100), "PayPal $100 USD capture 69K81424J7095031B intact", tx100);

  console.log("\n==================================================================");
  console.log("   🎉 ALL THREE-ACCOUNT WORKSPACE & PRIVACY TESTS PASSED 100%!    ");
  console.log("==================================================================");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
