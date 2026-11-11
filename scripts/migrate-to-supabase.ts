import fs from "fs";
import path from "path";

// 1. Load environment variables from .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
});

async function runMigration() {
  const { getServerSupabase } = await import("../src/server/supabase");
  const supabase = getServerSupabase();
  if (!supabase) {
    console.error("Supabase is not configured in .env.local!");
    process.exit(1);
  }

  const dbPath = path.join(process.cwd(), ".data", "milestoneos_db.json");
  if (!fs.existsSync(dbPath)) {
    console.error("Database file not found at:", dbPath);
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  console.log("=== STARTING MIGRATION TO SUPABASE POSTGRESQL ===");
  console.log(`Source JSON contains: ${db.projects?.length || 0} projects, ${db.transactions?.length || 0} transactions, ${db.notifications?.length || 0} notifications.`);

  // 1. Deduplicate & Clean Projects
  // Ensure the genuine paid milestone for Customer Review System is preserved with isDemo: true
  const projectMap = new Map();
  for (const p of db.projects || []) {
    const existing = projectMap.get(p.id);
    if (!existing) {
      projectMap.set(p.id, p);
    } else {
      // If one version has a paid milestone or capture ID, preserve the paid one!
      const hasPaid = p.milestones?.some((m: any) => m.status === "paid" || m.paypalTransactionId);
      if (hasPaid) {
        projectMap.set(p.id, { ...p, isDemo: p.isDemo ?? existing.isDemo ?? true });
      }
    }
  }

  const projectsToMigrate = Array.from(projectMap.values());
  console.log(`\nMigrating ${projectsToMigrate.length} deduplicated projects to public.projects...`);

  let pSuccess = 0;
  for (const p of projectsToMigrate) {
    const row = {
      id: p.id,
      title: p.title || "Untitled Project",
      description: p.description || "",
      category: p.category || "Full-Stack Development",
      currency: p.currency || "USD",
      total_budget: p.totalBudget || 0,
      total_paid: p.totalPaid || 0,
      escrow_funded: p.escrowFunded || 0,
      escrow_released: p.escrowReleased || 0,
      target_deadline: p.targetDeadline || "TBD",
      status: p.status || "active",
      proposal_status: p.proposalStatus || "accepted",
      terms_agreed: Boolean(p.termsAgreed ?? true),
      client_id: p.clientId || p.client?.id || null,
      freelancer_id: p.freelancerId || p.freelancer?.id || null,
      client_name: p.client?.name || "Client",
      client_email: p.client?.email || "",
      client_company: p.client?.company || null,
      client_mso_id: p.client?.milestoneOSId || null,
      freelancer_name: p.freelancer?.name || "Freelancer",
      freelancer_email: p.freelancer?.email || "",
      freelancer_title: p.freelancer?.title || null,
      freelancer_mso_id: p.freelancer?.milestoneOSId || null,
      initiated_by: p.initiatedBy || "client",
      invitation_token: p.invitationToken || null,
      invitation_status: p.invitationStatus || "active",
      is_demo: Boolean(p.isDemo),
      milestones: p.milestones || [],
      activity_log: p.activityLog || [],
      data: p,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("projects").upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`Failed to migrate project ${p.id} (${p.title}):`, error);
    } else {
      pSuccess++;
    }
  }
  console.log(`✓ Projects migrated: ${pSuccess} / ${projectsToMigrate.length}`);

  // 2. Migrate Transactions (Preserving verified PayPal capture 90U44122NS995343N)
  console.log(`\nMigrating ${db.transactions?.length || 0} transactions to public.transactions...`);
  let tSuccess = 0;
  for (const t of db.transactions || []) {
    const row = {
      id: t.id,
      project_id: t.projectId,
      project_title: t.projectTitle || "",
      milestone_id: t.milestoneId,
      milestone_title: t.milestoneTitle || "",
      payer_id: t.payerId || null,
      payer: t.payer || "",
      payee_id: t.payeeId || null,
      payee: t.payee || "",
      amount: t.amount,
      currency: t.currency || "USD",
      status: t.status || "completed",
      paypal_transaction_id: t.paypalTransactionId,
      paid_at: t.paidAt || new Date().toISOString(),
      is_simulated: Boolean(t.isSimulated),
      is_demo: Boolean(t.isDemo),
      data: t,
    };

    const { error } = await supabase.from("transactions").upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`Failed to migrate transaction ${t.id}:`, error);
    } else {
      tSuccess++;
      if (t.paypalTransactionId === "90U44122NS995343N") {
        console.log(`  ★ VERIFIED: PayPal capture 90U44122NS995343N ($${t.amount} USD) migrated to Supabase!`);
      }
    }
  }
  console.log(`✓ Transactions migrated: ${tSuccess} / ${db.transactions?.length || 0}`);

  // 3. Migrate Notifications
  console.log(`\nMigrating ${db.notifications?.length || 0} notifications to public.notifications...`);
  let nSuccess = 0;
  for (const n of db.notifications || []) {
    const row = {
      id: n.id,
      user_id: n.userId || null,
      project_id: n.projectId || null,
      title: n.title,
      message: n.message,
      type: n.type || "general",
      unread: Boolean(n.unread ?? true),
      is_demo: Boolean(n.isDemo),
      created_at: n.timestamp || "Just now",
    };

    const { error } = await supabase.from("notifications").upsert(row, { onConflict: "id" });
    if (!error) nSuccess++;
  }
  console.log(`✓ Notifications migrated: ${nSuccess} / ${db.notifications?.length || 0}`);

  console.log("\n=== MIGRATION TO SUPABASE COMPLETE ===");
}

runMigration().catch(console.error);
