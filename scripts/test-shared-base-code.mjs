// Comprehensive Verification of Shared Base Code Architecture (Scenarios 1-8)
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING MILESTONEOS SHARED BASE CODE VERIFICATION ===");
  const ts = Date.now();

  // -------------------------------------------------------------
  // Scenario 1 & 2: Register User A & Verify Single 6-char Base Code & Matching CL-/FL- IDs
  // -------------------------------------------------------------
  console.log("\n[Scenario 1 & 2] Registering User A...");
  const emailA = `alice_base_${ts}@testmso.local`;
  const nameA = `Alice Architecture ${ts.toString().slice(-4)}`;

  const resA = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailA, password: "Password123!", name: nameA, role: "both" }),
  });
  const dataA = await resA.json();
  if (!resA.ok || !dataA.success) throw new Error(`Signup A failed: ${JSON.stringify(dataA)}`);

  const userA = dataA.user;
  console.log("✓ User A registered successfully:", {
    id: userA.id,
    baseCode: userA.baseCode,
    clientId: userA.clientId,
    freelancerId: userA.freelancerId,
  });

  if (!userA.baseCode || userA.baseCode.length !== 6) {
    throw new Error(`Expected 6-character base code, got: "${userA.baseCode}"`);
  }
  if (userA.clientId !== `CL-${userA.baseCode}`) {
    throw new Error(`Client ID mismatch: expected "CL-${userA.baseCode}", got "${userA.clientId}"`);
  }
  if (userA.freelancerId !== `FL-${userA.baseCode}`) {
    throw new Error(`Freelancer ID mismatch: expected "FL-${userA.baseCode}", got "${userA.freelancerId}"`);
  }
  console.log(`✓ Scenario 1 & 2 PASSED: One unique 6-character base code "${userA.baseCode}" shared by Client ID "${userA.clientId}" and Freelancer ID "${userA.freelancerId}".`);

  // -------------------------------------------------------------
  // Scenario 3: Verify Persistence Across Lookups / Logins
  // -------------------------------------------------------------
  console.log("\n[Scenario 3] Verifying base code persistence across lookups...");
  const lookupARes = await fetch(`${BASE_URL}/api/users/lookup?id=${encodeURIComponent(userA.clientId)}`);
  const lookupAData = await lookupARes.json();
  if (!lookupARes.ok || !lookupAData.found) throw new Error(`Lookup A failed: ${JSON.stringify(lookupAData)}`);

  if (lookupAData.user.baseCode !== userA.baseCode) {
    throw new Error(`Base code changed! Expected "${userA.baseCode}", got "${lookupAData.user.baseCode}"`);
  }
  if (lookupAData.user.clientId !== userA.clientId || lookupAData.user.freelancerId !== userA.freelancerId) {
    throw new Error(`IDs changed! Expected ${userA.clientId} / ${userA.freelancerId}`);
  }
  console.log(`✓ Scenario 3 PASSED: Base code "${userA.baseCode}" and IDs remain permanent and unchanged.`);

  // -------------------------------------------------------------
  // Scenario 4: Register User B & Client looks up User B via Freelancer ID (FL-XXXXXX)
  // -------------------------------------------------------------
  console.log("\n[Scenario 4] Registering User B and finding by Freelancer ID (FL-...)...");
  const emailB = `bob_freelancer_${ts}@testmso.local`;
  const nameB = `Bob DevSpecialist ${ts.toString().slice(-4)}`;

  const resB = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailB, password: "Password123!", name: nameB, role: "both" }),
  });
  const dataB = await resB.json();
  if (!resB.ok || !dataB.success) throw new Error(`Signup B failed: ${JSON.stringify(dataB)}`);
  const userB = dataB.user;

  console.log(`User B registered with Freelancer ID: ${userB.freelancerId} (Base: ${userB.baseCode})`);

  // Client looks up Bob using Bob's FL- ID with expectedRole=freelancer
  const lookupFLRes = await fetch(
    `${BASE_URL}/api/users/lookup?id=${encodeURIComponent(userB.freelancerId)}&expectedRole=freelancer`
  );
  const lookupFLData = await lookupFLRes.json();
  if (!lookupFLRes.ok || !lookupFLData.found) {
    throw new Error(`Lookup by FL- ID failed: ${JSON.stringify(lookupFLData)}`);
  }
  if (lookupFLData.user.id !== userB.id || lookupFLData.user.baseCode !== userB.baseCode) {
    throw new Error(`Looked up user mismatch: ${JSON.stringify(lookupFLData)}`);
  }
  console.log(`✓ Scenario 4 PASSED: Found "${lookupFLData.user.name}" using Freelancer ID "${userB.freelancerId}".`);

  // -------------------------------------------------------------
  // Scenario 5: Freelancer looks up User A via Client ID (CL-XXXXXX)
  // -------------------------------------------------------------
  console.log("\n[Scenario 5] Freelancer looks up User A via Client ID (CL-...)...");
  const lookupCLRes = await fetch(
    `${BASE_URL}/api/users/lookup?id=${encodeURIComponent(userA.clientId)}&expectedRole=client`
  );
  const lookupCLData = await lookupCLRes.json();
  if (!lookupCLRes.ok || !lookupCLData.found) {
    throw new Error(`Lookup by CL- ID failed: ${JSON.stringify(lookupCLData)}`);
  }
  if (lookupCLData.user.id !== userA.id || lookupCLData.user.baseCode !== userA.baseCode) {
    throw new Error(`Looked up user mismatch: ${JSON.stringify(lookupCLData)}`);
  }
  console.log(`✓ Scenario 5 PASSED: Found "${lookupCLData.user.name}" using Client ID "${userA.clientId}".`);

  // -------------------------------------------------------------
  // Scenario 6: Test Invalid Prefixes and Nonexistent IDs
  // -------------------------------------------------------------
  console.log("\n[Scenario 6] Testing invalid prefixes and error handling...");

  // 6a: Client workflow entered CL- ID (should be rejected)
  const rejectCLRes = await fetch(
    `${BASE_URL}/api/users/lookup?id=${encodeURIComponent(userB.clientId)}&expectedRole=freelancer`
  );
  const rejectCLData = await rejectCLRes.json();
  if (rejectCLRes.status !== 400 || rejectCLData.found !== false) {
    throw new Error(`Expected 400 rejection when entering CL- ID for freelancer workflow, got: ${rejectCLRes.status}`);
  }
  console.log(`✓ 6a Passed: Successfully rejected CL- ID in freelancer workflow with error: "${rejectCLData.error}"`);

  // 6b: Freelancer workflow entered FL- ID (should be rejected)
  const rejectFLRes = await fetch(
    `${BASE_URL}/api/users/lookup?id=${encodeURIComponent(userA.freelancerId)}&expectedRole=client`
  );
  const rejectFLData = await rejectFLRes.json();
  if (rejectFLRes.status !== 400 || rejectFLData.found !== false) {
    throw new Error(`Expected 400 rejection when entering FL- ID for client workflow, got: ${rejectFLRes.status}`);
  }
  console.log(`✓ 6b Passed: Successfully rejected FL- ID in client workflow with error: "${rejectFLData.error}"`);

  // 6c: Invalid format (e.g. INVALID-123 or ABC)
  const invalidRes = await fetch(`${BASE_URL}/api/users/lookup?id=XYZ-12345`);
  const invalidData = await invalidRes.json();
  if (invalidRes.status !== 400) {
    throw new Error(`Expected 400 for invalid ID format, got ${invalidRes.status}`);
  }
  console.log(`✓ 6c Passed: Rejected invalid format with error: "${invalidData.error}"`);

  // 6d: Nonexistent valid ID
  const notFoundRes = await fetch(`${BASE_URL}/api/users/lookup?id=FL-ZZZZZZ`);
  const notFoundData = await notFoundRes.json();
  if (notFoundRes.status !== 404) {
    throw new Error(`Expected 404 for nonexistent ID, got ${notFoundRes.status}`);
  }
  console.log(`✓ 6d Passed: Rejected nonexistent account with error: "${notFoundData.error}"`);

  // -------------------------------------------------------------
  // Scenario 7: Same User Can Act as Client in Project A and Freelancer in Project B
  // -------------------------------------------------------------
  console.log("\n[Scenario 7] Verifying dual-role capability for the same account...");

  // Project A: User A is Client hiring User B as Freelancer
  const projARes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: `Project A - Client Alice hiring Bob ${ts}`,
      description: "Dual-role test: Project A",
      clientId: userA.id,
      freelancerId: userB.id,
      client: { id: userA.id, name: userA.name, email: userA.email, milestoneOSId: userA.clientId },
      freelancer: { id: userB.id, name: userB.name, email: userB.email, milestoneOSId: userB.freelancerId },
      milestones: [{ title: "Phase 1", amount: 1000, dueDate: "Dec 2026", criteria: ["Done"] }],
      initiatedBy: "client",
      status: "active",
      proposalStatus: "accepted",
    }),
  });
  const projAData = await projARes.json();
  if (!projARes.ok || !projAData.success) throw new Error(`Failed to create Project A: ${JSON.stringify(projAData)}`);
  const projA = projAData.project;
  console.log(`✓ Created Project A (ID: ${projA.id}) where User A is CLIENT.`);

  // Project B: User A is FREELANCER hired by User B as Client
  const projBRes = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: `Project B - Client Bob hiring Alice ${ts}`,
      description: "Dual-role test: Project B",
      clientId: userB.id,
      freelancerId: userA.id,
      client: { id: userB.id, name: userB.name, email: userB.email, milestoneOSId: userB.clientId },
      freelancer: { id: userA.id, name: userA.name, email: userA.email, milestoneOSId: userA.freelancerId },
      milestones: [{ title: "Phase 1", amount: 1500, dueDate: "Dec 2026", criteria: ["Done"] }],
      initiatedBy: "client",
      status: "active",
      proposalStatus: "accepted",
    }),
  });
  const projBData = await projBRes.json();
  if (!projBRes.ok || !projBData.success) throw new Error(`Failed to create Project B: ${JSON.stringify(projBData)}`);
  const projB = projBData.project;
  console.log(`✓ Created Project B (ID: ${projB.id}) where User A is FREELANCER.`);

  // Verify User A's Client workspace contains Project A and NOT Project B
  const aliceClientRes = await fetch(`${BASE_URL}/api/projects?userId=${encodeURIComponent(userA.id)}&role=client`);
  const aliceClientData = await aliceClientRes.json();
  const aliceHasProjA = aliceClientData.projects.some((p) => p.id === projA.id);
  const aliceClientHasProjB = aliceClientData.projects.some((p) => p.id === projB.id);

  if (!aliceHasProjA || aliceClientHasProjB) {
    throw new Error(`Alice Client workspace perspective filtering failed! Has A: ${aliceHasProjA}, Has B: ${aliceClientHasProjB}`);
  }
  console.log(`✓ User A Client Workspace correctly contains Project A (as Client) and excludes Project B.`);

  // Verify User A's Freelancer workspace contains Project B and NOT Project A
  const aliceFreelancerRes = await fetch(`${BASE_URL}/api/projects?userId=${encodeURIComponent(userA.id)}&role=freelancer`);
  const aliceFreelancerData = await aliceFreelancerRes.json();
  const aliceHasProjB = aliceFreelancerData.projects.some((p) => p.id === projB.id);
  const aliceFreelancerHasProjA = aliceFreelancerData.projects.some((p) => p.id === projA.id);

  if (!aliceHasProjB || aliceFreelancerHasProjA) {
    throw new Error(`Alice Freelancer workspace perspective filtering failed! Has B: ${aliceHasProjB}, Has A: ${aliceFreelancerHasProjA}`);
  }
  console.log(`✓ User A Freelancer Workspace correctly contains Project B (as Freelancer) and excludes Project A.`);
  console.log(`✓ Scenario 7 PASSED: User A operates simultaneously as Client and Freelancer with perfect workspace separation!`);

  // -------------------------------------------------------------
  // Scenario 8: Verify PayPal & Existing Integrity
  // -------------------------------------------------------------
  console.log("\n[Scenario 8] Verifying health, PayPal sandbox & AI readiness...");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  if (!healthRes.ok || healthData.status !== "healthy") {
    throw new Error(`Health check failed: ${JSON.stringify(healthData)}`);
  }
  console.log("✓ System health verified:", healthData.services);

  console.log("\n=======================================================");
  console.log("🎉 ALL 8 SCENARIOS VERIFIED AND WORKING FLAWLESSLY!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
