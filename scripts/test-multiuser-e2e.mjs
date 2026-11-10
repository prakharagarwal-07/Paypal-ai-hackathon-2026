// Comprehensive End-to-End Test for MilestoneOS Multi-User Flow
// 1. Register Account A (Client)
// 2. Register Account B (Freelancer)
// 3. Under Account A: Find Account B by MilestoneOS ID, verify profile details, send proposal
// 4. Under Account B: Verify incoming proposal appears, accept proposal
// 5. Verify project moves to Active for both Account A and Account B
// 6. Verify unrelated Account C cannot see the project

const BASE_URL = "http://localhost:3000";

async function runTest() {
  console.log("=== STARTING MILESTONEOS MULTI-USER E2E VERIFICATION ===");
  const ts = Date.now();

  // 1. Register Account A
  const emailA = `client_alice_${ts}@testmso.local`;
  const nameA = `Alice Client ${ts.toString().slice(-4)}`;
  console.log(`\n[Step 1] Registering Account A: ${emailA}`);

  const resA = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailA,
      password: "Password123!",
      name: nameA,
      role: "both",
    }),
  });
  const dataA = await resA.json();
  if (!resA.ok || !dataA.success) {
    throw new Error(`Failed to register Account A: ${JSON.stringify(dataA)}`);
  }
  const userA = dataA.user;
  console.log(`✓ Account A Registered! ID: ${userA.id}, MilestoneOS ID: ${userA.milestoneOSId}, Name: ${userA.name}`);

  // 2. Register Account B
  const emailB = `freelancer_bob_${ts}@testmso.local`;
  const nameB = `Bob Specialist ${ts.toString().slice(-4)}`;
  console.log(`\n[Step 2] Registering Account B: ${emailB}`);

  const resB = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailB,
      password: "Password123!",
      name: nameB,
      role: "both",
    }),
  });
  const dataB = await resB.json();
  if (!resB.ok || !dataB.success) {
    throw new Error(`Failed to register Account B: ${JSON.stringify(dataB)}`);
  }
  const userB = dataB.user;
  console.log(`✓ Account B Registered! ID: ${userB.id}, MilestoneOS ID: ${userB.milestoneOSId}, Name: ${userB.name}`);

  // 3. Under Account A: Select "Find by User ID" and search Account B's MilestoneOS ID
  console.log(`\n[Step 3a] Account A looks up Account B by MilestoneOS ID: "${userB.milestoneOSId}"`);
  const lookupRes = await fetch(`${BASE_URL}/api/users/lookup?id=${encodeURIComponent(userB.milestoneOSId)}`);
  const lookupData = await lookupRes.json();
  if (!lookupRes.ok || !lookupData.success) {
    throw new Error(`Lookup failed for ${userB.milestoneOSId}: ${JSON.stringify(lookupData)}`);
  }
  console.log(`✓ Real user found in database!`, lookupData.user);
  if (lookupData.user.name !== nameB) {
    throw new Error(`Name mismatch: expected "${nameB}", got "${lookupData.user.name}"`);
  }

  // Test case-insensitivity and whitespace trimming
  console.log(`\n[Step 3b] Testing case-insensitivity and whitespace trimming with: "  ${userB.milestoneOSId.toLowerCase()}  "`);
  const lookupCaseRes = await fetch(`${BASE_URL}/api/users/lookup?id=${encodeURIComponent("  " + userB.milestoneOSId.toLowerCase() + "  ")}`);
  const lookupCaseData = await lookupCaseRes.json();
  if (!lookupCaseRes.ok || !lookupCaseData.success || lookupCaseData.user.id !== userB.id) {
    throw new Error(`Case-insensitive lookup failed: ${JSON.stringify(lookupCaseData)}`);
  }
  console.log(`✓ Case-insensitive and trimmed lookup verified!`);

  // Account A creates a proposal targeting Account B
  console.log(`\n[Step 3c] Account A sends project proposal to Account B`);
  const proposalPayload = {
    title: `Next-Gen SaaS Architecture ${ts.toString().slice(-4)}`,
    description: "Build scalable microservices and payment escrow integration.",
    category: "Full-Stack Development",
    targetDeadline: "Jan 15, 2027",
    clientId: userA.id,
    freelancerId: userB.id,
    client: {
      id: userA.id,
      name: userA.name,
      email: userA.email,
      avatar: userA.name.slice(0, 2).toUpperCase(),
      company: "Acme Ventures",
      milestoneOSId: userA.milestoneOSId,
    },
    freelancer: {
      id: userB.id,
      name: userB.name,
      email: userB.email,
      avatar: userB.name.slice(0, 2).toUpperCase(),
      title: "Senior Full-Stack Engineer",
      rating: 5.0,
      milestoneOSId: userB.milestoneOSId,
    },
    milestones: [
      {
        title: "Milestone 1: Database & Auth Setup",
        description: "Supabase database schema and RLS policies.",
        amount: 2000,
        dueDate: "Dec 01, 2026",
        criteria: ["Database schema created", "RLS policies applied"],
      },
      {
        title: "Milestone 2: Escrow & PayPal Integration",
        description: "PayPal sandbox payment capture and escrow release.",
        amount: 2500,
        dueDate: "Jan 15, 2027",
        criteria: ["PayPal orders capture successfully", "Funds tracked"],
      },
    ],
    initiatedBy: "client",
    status: "awaiting_acceptance",
    proposalStatus: "awaiting_acceptance",
  };

  const createProjRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proposalPayload),
  });
  const createProjData = await createProjRes.json();
  if (!createProjRes.ok || !createProjData.success) {
    throw new Error(`Failed to create project proposal: ${JSON.stringify(createProjData)}`);
  }
  const createdProject = createProjData.project;
  console.log(`✓ Project proposal created! Project ID: ${createdProject.id}, Status: ${createdProject.status}, ProposalStatus: ${createdProject.proposalStatus}`);

  // 4. Under Account B: Verify incoming proposal appears
  console.log(`\n[Step 4a] Fetching projects for Account B as Freelancer:`);
  const bobProjectsRes = await fetch(
    `${BASE_URL}/api/projects?userId=${encodeURIComponent(userB.id)}&milestoneOSId=${encodeURIComponent(userB.milestoneOSId)}&role=freelancer`
  );
  const bobProjectsData = await bobProjectsRes.json();
  if (!bobProjectsRes.ok || !bobProjectsData.success) {
    throw new Error(`Failed to fetch Bob's projects: ${JSON.stringify(bobProjectsData)}`);
  }
  const bobIncoming = bobProjectsData.projects.find((p) => p.id === createdProject.id);
  if (!bobIncoming) {
    throw new Error(`Project ${createdProject.id} was NOT found in Bob's freelancer project list! Available projects: ${JSON.stringify(bobProjectsData.projects)}`);
  }
  console.log(`✓ Incoming proposal found in Account B's workspace! Status: ${bobIncoming.status}, Initiated by: ${bobIncoming.initiatedBy}`);

  // Account B accepts the proposal
  console.log(`\n[Step 4b] Account B accepts the proposal via /api/projects/${createdProject.id}/proposals`);
  const acceptRes = await fetch(`${BASE_URL}/api/projects/${createdProject.id}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "accept" }),
  });
  const acceptData = await acceptRes.json();
  if (!acceptRes.ok || !acceptData.success) {
    throw new Error(`Failed to accept proposal: ${JSON.stringify(acceptData)}`);
  }
  console.log(`✓ Proposal accepted! Server response:`, acceptData.message);

  // 5. Verify project moves to Active for both Account A and Account B
  console.log(`\n[Step 5a] Verifying project is active in Account A's Client workspace:`);
  const aliceProjectsRes = await fetch(
    `${BASE_URL}/api/projects?userId=${encodeURIComponent(userA.id)}&milestoneOSId=${encodeURIComponent(userA.milestoneOSId)}&role=client`
  );
  const aliceProjectsData = await aliceProjectsRes.json();
  const aliceActiveProj = aliceProjectsData.projects.find((p) => p.id === createdProject.id);
  if (!aliceActiveProj || aliceActiveProj.status !== "active") {
    throw new Error(`Project not active for Alice: ${JSON.stringify(aliceActiveProj)}`);
  }
  console.log(`✓ Alice sees project "${aliceActiveProj.title}" as ACTIVE (proposalStatus: ${aliceActiveProj.proposalStatus}, milestone 1 status: ${aliceActiveProj.milestones[0].status})`);

  console.log(`\n[Step 5b] Verifying project is active in Account B's Freelancer workspace:`);
  const bobActiveRes = await fetch(
    `${BASE_URL}/api/projects?userId=${encodeURIComponent(userB.id)}&milestoneOSId=${encodeURIComponent(userB.milestoneOSId)}&role=freelancer`
  );
  const bobActiveData = await bobActiveRes.json();
  const bobActiveProj = bobActiveData.projects.find((p) => p.id === createdProject.id);
  if (!bobActiveProj || bobActiveProj.status !== "active") {
    throw new Error(`Project not active for Bob: ${JSON.stringify(bobActiveProj)}`);
  }
  console.log(`✓ Bob sees project "${bobActiveProj.title}" as ACTIVE (proposalStatus: ${bobActiveProj.proposalStatus})`);

  // 6. Verify an unrelated Account C cannot see this project
  console.log(`\n[Step 6] Registering unrelated Account C and verifying privacy isolation:`);
  const emailC = `unrelated_charlie_${ts}@testmso.local`;
  const resC = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailC,
      password: "Password123!",
      name: `Charlie Unrelated ${ts.toString().slice(-4)}`,
      role: "both",
    }),
  });
  const dataC = await resC.json();
  const userC = dataC.user;
  console.log(`✓ Account C Registered! ID: ${userC.id}, MilestoneOS ID: ${userC.milestoneOSId}`);

  // Query Charlie's client workspace
  const charlieClientRes = await fetch(
    `${BASE_URL}/api/projects?userId=${encodeURIComponent(userC.id)}&milestoneOSId=${encodeURIComponent(userC.milestoneOSId)}&role=client`
  );
  const charlieClientData = await charlieClientRes.json();
  const charlieClientLeak = charlieClientData.projects.find((p) => p.id === createdProject.id);

  // Query Charlie's freelancer workspace
  const charlieFreelancerRes = await fetch(
    `${BASE_URL}/api/projects?userId=${encodeURIComponent(userC.id)}&milestoneOSId=${encodeURIComponent(userC.milestoneOSId)}&role=freelancer`
  );
  const charlieFreelancerData = await charlieFreelancerRes.json();
  const charlieFreelancerLeak = charlieFreelancerData.projects.find((p) => p.id === createdProject.id);

  if (charlieClientLeak || charlieFreelancerLeak) {
    throw new Error(`SECURITY LEAK: Charlie was able to view Alice & Bob's project!`);
  }
  console.log(`✓ Confirmed: Account C has 0 visibility into Alice & Bob's project in either Client or Freelancer workspace!`);

  // Verify direct API access authorization for Charlie
  const charlieDirectRes = await fetch(`${BASE_URL}/api/projects/${createdProject.id}`, {
    headers: {
      "x-user-id": userC.id,
      "x-milestoneos-id": userC.milestoneOSId,
    },
  });
  if (charlieDirectRes.status !== 404) {
    throw new Error(`SECURITY LEAK: Account C was able to access project directly with status ${charlieDirectRes.status}`);
  }
  console.log(`✓ Direct unauthorized access check by Account C correctly rejected with status ${charlieDirectRes.status} (Not Found / Unauthorized)`);

  console.log("\n=======================================================");
  console.log("🎉 ALL MULTI-USER VERIFICATION CHECKS PASSED PERFECTLY!");
  console.log("=======================================================\n");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
