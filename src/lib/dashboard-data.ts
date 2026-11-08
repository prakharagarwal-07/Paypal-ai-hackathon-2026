export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "under_ai_review"
  | "awaiting_client_approval"
  | "revision_requested"
  | "approved"
  | "payment_pending"
  | "paid";

export interface AcceptanceCriterion {
  id: string;
  title: string;
  description: string;
  status: "satisfied" | "missing" | "needs_verification" | "pending";
  evidence: string;
  aiNotes: string;
}

export interface AutomatedCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface AIAssessment {
  overallScore: number;
  summary: string;
  status: "approved" | "changes_requested" | "needs_verification";
  verifiedAt: string;
  isDemonstration: boolean;
  criteria: AcceptanceCriterion[];
  automatedChecks: AutomatedCheck[];
  suggestedRevisions: string[];
}

export interface DeliverableAttachment {
  name: string;
  size: string;
  type: string;
}

export interface MilestoneSubmission {
  id: string;
  version: number;
  submittedAt: string;
  submittedBy: string;
  demoUrl: string;
  githubRepo: string;
  githubPr: string;
  loomVideo?: string;
  notes: string;
  attachments: DeliverableAttachment[];
  aiAssessment?: AIAssessment;
  revisionRequest?: {
    requestedAt: string;
    reason: string;
    requestedBy: string;
  };
}

export interface Milestone {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: MilestoneStatus;
  paidAt?: string;
  paypalTransactionId?: string;
  acceptanceCriteria: AcceptanceCriterion[];
  submissions: MilestoneSubmission[];
  latestAudit?: AIAssessment;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: "client" | "freelancer" | "ai_system" | "paypal";
  action: string;
  details?: string;
  milestoneTitle?: string;
}

export interface TransactionRecord {
  id: string;
  milestoneId: string;
  milestoneTitle: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  currency: string;
  paidAt: string;
  paypalTransactionId: string;
  status: "completed" | "pending";
  isSimulated: boolean;
  payer: string;
  payee: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: "submission" | "revision" | "approval" | "payment" | "system";
  unread: boolean;
  projectId?: string;
  milestoneId?: string;
}

export interface ProjectContract {
  id: string;
  title: string;
  description: string;
  category: string;
  client: {
    name: string;
    email: string;
    avatar: string;
    company: string;
  };
  freelancer: {
    name: string;
    email: string;
    avatar: string;
    title: string;
    rating: number;
  };
  totalBudget: number;
  currency: string;
  escrowFunded: number;
  escrowReleased: number;
  createdAt: string;
  targetDeadline: string;
  status: "active" | "completed" | "archived";
  milestones: Milestone[];
  activityLog: ActivityItem[];
}

export const FREELANCER_OPTIONS = [
  {
    name: "Rohan Verma",
    email: "rohan.verma@dev.demo",
    avatar: "RV",
    title: "Senior Full-Stack & PayPal Integrations Engineer",
    rating: 4.98,
  },
  {
    name: "Elena Rostova",
    email: "elena.rostova@dev.demo",
    avatar: "ER",
    title: "AI & Distributed Systems Specialist",
    rating: 4.95,
  },
  {
    name: "Marcus Thorne",
    email: "marcus.t@dev.demo",
    avatar: "MT",
    title: "FinTech Smart Contract & Backend Lead",
    rating: 4.92,
  },
];

export const INITIAL_PROJECTS: ProjectContract[] = [
  {
    id: "proj_paypal_ai_2026",
    title: "E-Commerce FinTech Web App & PayPal Checkout",
    description:
      "Enterprise milestone-based e-commerce platform integrating Next.js 16, TypeScript, PayPal Orders v2 SDK, automated webhook listeners, and instant escrow settlements.",
    category: "FinTech & Payments",
    client: {
      name: "Sarah Chen",
      email: "sarah.chen@client.demo",
      avatar: "SC",
      company: "Apex Global Commerce Ltd.",
    },
    freelancer: {
      name: "Rohan Verma",
      email: "rohan.verma@dev.demo",
      avatar: "RV",
      title: "Senior Full-Stack & PayPal Integrations Engineer",
      rating: 4.98,
    },
    totalBudget: 4800,
    currency: "USD",
    escrowFunded: 4800,
    escrowReleased: 1200,
    createdAt: "Oct 28, 2026",
    targetDeadline: "Nov 25, 2026",
    status: "active",
    activityLog: [
      {
        id: "act_101",
        timestamp: "Nov 02, 2026 • 04:30 PM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Released Milestone 1 Payout via PayPal Sandbox ($1,200 USD)",
        milestoneTitle: "UI Architecture & Design System",
      },
      {
        id: "act_102",
        timestamp: "Nov 05, 2026 • 02:15 PM",
        actor: "Rohan Verma",
        actorRole: "freelancer",
        action: "Submitted Stage 2 Deliverables (PR #4 & Staging URL)",
        milestoneTitle: "Webhook Microservice & HMAC Verification",
      },
      {
        id: "act_103",
        timestamp: "Nov 05, 2026 • 02:16 PM",
        actor: "MilestoneOS AI Auditor",
        actorRole: "ai_system",
        action: "Demonstration AI Audit complete: 94% criteria satisfaction verified",
        milestoneTitle: "Webhook Microservice & HMAC Verification",
      },
      {
        id: "act_104",
        timestamp: "Nov 07, 2026 • 11:45 AM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Requested Revision on Stage 3: Missing idempotency key header on retry queue",
        milestoneTitle: "PayPal Sandbox Vault & Orders v2 Integration",
      },
    ],
    milestones: [
      {
        id: "ms_01",
        stageNumber: 1,
        title: "UI Architecture & Design System",
        description:
          "Modular Next.js application shell, Tailwind CSS design tokens, WCAG 2.1 AA accessible component library, and dual theme support.",
        amount: 1200,
        currency: "USD",
        dueDate: "Nov 02, 2026",
        status: "paid",
        paidAt: "Nov 02, 2026 at 4:30 PM",
        paypalTransactionId: "PAYID-MN7642-8921-A",
        acceptanceCriteria: [
          {
            id: "ac_1_1",
            title: "Accessible Theme & Responsive Grid",
            description: "100% responsive down to 320px viewport with clean contrast ratios.",
            status: "satisfied",
            evidence: "Tested via automated axe-core: 0 accessibility violations, responsive at 320px, 768px, 1280px.",
            aiNotes: "Satisfied: Component library builds cleanly without hydration warnings.",
          },
          {
            id: "ac_1_2",
            title: "Navigation & State Shell",
            description: "Header, breadcrumbs, and persistent state management configured.",
            status: "satisfied",
            evidence: "Verified persistent client layout in app router.",
            aiNotes: "Satisfied: Clean modular component separation.",
          },
        ],
        submissions: [
          {
            id: "sub_1_1",
            version: 1,
            submittedAt: "Nov 02, 2026 at 03:45 PM",
            submittedBy: "Rohan Verma",
            demoUrl: "https://staging.milestone-store.demo",
            githubRepo: "https://github.com/rohan-dev/ecommerce-paypal-app",
            githubPr: "https://github.com/rohan-dev/ecommerce-paypal-app/pull/1",
            notes: "Design system completed with 24 components and full Tailwind CSS token setup.",
            attachments: [{ name: "lighthouse-report.pdf", size: "1.2 MB", type: "application/pdf" }],
            aiAssessment: {
              overallScore: 98,
              summary: "All acceptance criteria verified. Perfect responsive scaling and zero console warnings.",
              status: "approved",
              verifiedAt: "Nov 02, 2026",
              isDemonstration: true,
              criteria: [
                {
                  id: "ac_1_1",
                  title: "Accessible Theme & Responsive Grid",
                  description: "100% responsive down to 320px viewport with clean contrast ratios.",
                  status: "satisfied",
                  evidence: "Zero accessibility violations detected.",
                  aiNotes: "Passing all automated tests.",
                },
              ],
              automatedChecks: [
                { name: "Live Staging Response", passed: true, detail: "HTTPS 200 OK (89ms)" },
                { name: "TypeScript Compile", passed: true, detail: "0 errors in tsc build" },
              ],
              suggestedRevisions: [],
            },
          },
        ],
      },
      {
        id: "ms_02",
        stageNumber: 2,
        title: "Webhook Microservice & HMAC Verification",
        description:
          "Secure Node.js microservice receiving PayPal IPN / Webhooks (PAYMENT.CAPTURE.COMPLETED, CHECKOUT.ORDER.APPROVED) with cryptographic HMAC-SHA256 verification and retry queue.",
        amount: 1400,
        currency: "USD",
        dueDate: "Nov 12, 2026",
        status: "awaiting_client_approval",
        acceptanceCriteria: [
          {
            id: "ac_2_1",
            title: "PayPal Webhook Event Routing",
            description: "Endpoints handle PAYMENT.CAPTURE.COMPLETED and CHECKOUT.ORDER.APPROVED with status 200 OK.",
            status: "satisfied",
            evidence: "POST /api/webhooks/paypal responded 200 OK with event payload simulation.",
            aiNotes: "Verified via simulated event injection.",
          },
          {
            id: "ac_2_2",
            title: "HMAC-SHA256 Cryptographic Verification",
            description: "Validate PAYPAL-AUTH-ALGO, PAYPAL-TRANSMISSION-ID, and PAYPAL-CERT-URL against PayPal root cert.",
            status: "satisfied",
            evidence: "Verified cryptographic signature check logic in src/lib/paypal-verify.ts.",
            aiNotes: "Verified: Rejected forged test payloads with HTTP 400 Bad Signature.",
          },
          {
            id: "ac_2_3",
            title: "Dead Letter Queue & Auto-Retry",
            description: "Failed webhook events are stored with exponential backoff retry mechanism.",
            status: "needs_verification",
            evidence: "Redis queue implemented; recommended manual test under 100 concurrent requests.",
            aiNotes: "Logic present; client should verify Redis connection string in production.",
          },
        ],
        submissions: [
          {
            id: "sub_2_1",
            version: 1,
            submittedAt: "Nov 05, 2026 at 02:15 PM",
            submittedBy: "Rohan Verma",
            demoUrl: "https://staging.milestone-store.demo/webhook-test",
            githubRepo: "https://github.com/rohan-dev/ecommerce-paypal-app",
            githubPr: "https://github.com/rohan-dev/ecommerce-paypal-app/pull/4",
            loomVideo: "https://loom.com/share/webhook-verification-demo",
            notes:
              "Webhook listener is deployed to staging. Implemented HMAC verification using crypto native module and added retry queue via BullMQ.",
            attachments: [
              { name: "webhook-stress-test.log", size: "340 KB", type: "text/plain" },
              { name: "paypal-event-fixtures.json", size: "84 KB", type: "application/json" },
            ],
            aiAssessment: {
              overallScore: 94,
              summary:
                "Demonstration AI Audit (Simulated Gemini 2.5 Flash): 2 of 3 criteria satisfied with high cryptographic integrity. 1 criterion flagged for manual verification (Redis connection latency under peak load).",
              status: "approved",
              verifiedAt: "Nov 05, 2026 at 02:16 PM",
              isDemonstration: true,
              criteria: [
                {
                  id: "ac_2_1",
                  title: "PayPal Webhook Event Routing",
                  description: "Endpoints handle PAYMENT.CAPTURE.COMPLETED with status 200 OK.",
                  status: "satisfied",
                  evidence: "Endpoint /api/webhooks/paypal returned 200 OK in 142ms.",
                  aiNotes: "Passed with realistic payload schema validation.",
                },
                {
                  id: "ac_2_2",
                  title: "HMAC-SHA256 Cryptographic Verification",
                  description: "Validate PAYPAL-AUTH-ALGO against PayPal cert.",
                  status: "satisfied",
                  evidence: "Valid certificate parsing and sha256WithRSAEncryption verified.",
                  aiNotes: "No security vulnerabilities detected in header parser.",
                },
                {
                  id: "ac_2_3",
                  title: "Dead Letter Queue & Auto-Retry",
                  description: "Failed events stored with retry logic.",
                  status: "needs_verification",
                  evidence: "Queue mechanism detected in BullMQ worker.",
                  aiNotes: "Recommend verifying Redis persistence under cluster failover.",
                },
              ],
              automatedChecks: [
                { name: "Live Staging Response", passed: true, detail: "HTTPS 200 OK (142ms latency)" },
                { name: "GitHub Pull Request", passed: true, detail: "PR #4 open with 18 commits and passing CI" },
                { name: "Signature Verification Check", passed: true, detail: "100% pass on 5 authentic test payloads" },
              ],
              suggestedRevisions: [
                "Add idempotency check on PayPal Transmission ID to prevent duplicate database writes on webhook replays.",
              ],
            },
          },
        ],
      },
      {
        id: "ms_03",
        stageNumber: 3,
        title: "PayPal Sandbox Vault & Orders v2 Integration",
        description:
          "Integrate PayPal Orders v2 API with client-side Buttons SDK, server-side /v2/checkout/orders creation, credit card tokenization via PayPal Vault, and instant capture.",
        amount: 1200,
        currency: "USD",
        dueDate: "Nov 18, 2026",
        status: "revision_requested",
        acceptanceCriteria: [
          {
            id: "ac_3_1",
            title: "Server-side Order Authorization",
            description: "Server calls /v2/checkout/orders and returns approve URL without exposing secret keys.",
            status: "satisfied",
            evidence: "Client never accesses PayPal Client Secret; tokens securely generated via server route.",
            aiNotes: "Secure authorization architecture verified.",
          },
          {
            id: "ac_3_2",
            title: "Idempotent Transaction Handling",
            description: "PayPal-Request-Id header sent on all payment requests to prevent accidental double-billing.",
            status: "missing",
            evidence: "PayPal-Request-Id header missing in POST /api/paypal/capture route.",
            aiNotes: "Revision required: Add unique UUID v4 header per order attempt.",
          },
          {
            id: "ac_3_3",
            title: "Order Capture & Receipt Dispatch",
            description: "Order capture updates order state and sends receipt to buyer email.",
            status: "satisfied",
            evidence: "Capture endpoint verified in sandbox mode.",
            aiNotes: "Email dispatch template verified.",
          },
        ],
        submissions: [
          {
            id: "sub_3_1",
            version: 1,
            submittedAt: "Nov 06, 2026 at 06:10 PM",
            submittedBy: "Rohan Verma",
            demoUrl: "https://staging.milestone-store.demo/checkout",
            githubRepo: "https://github.com/rohan-dev/ecommerce-paypal-app",
            githubPr: "https://github.com/rohan-dev/ecommerce-paypal-app/pull/6",
            notes: "Implemented complete Orders v2 API and added PayPal SDK button wrapper.",
            attachments: [{ name: "checkout-flow-screencast.mp4", size: "4.8 MB", type: "video/mp4" }],
            revisionRequest: {
              requestedAt: "Nov 07, 2026 at 11:45 AM",
              requestedBy: "Sarah Chen",
              reason:
                "Please add the PayPal-Request-Id header on order capture attempts to guarantee zero double-billing risk, and add currency validation before opening the PayPal approval modal.",
            },
          },
        ],
      },
      {
        id: "ms_04",
        stageNumber: 4,
        title: "Production Stress Test & Disaster Recovery Runbook",
        description:
          "High-throughput performance audit (10,000 requests/minute), simulated network timeout handling, and PayPal fallback reconciliation runbook.",
        amount: 1000,
        currency: "USD",
        dueDate: "Nov 25, 2026",
        status: "not_started",
        acceptanceCriteria: [
          {
            id: "ac_4_1",
            title: "Load Test Benchmark",
            description: "P99 latency remains under 400ms during 10,000 req/min traffic surge.",
            status: "pending",
            evidence: "Awaiting milestone initiation.",
            aiNotes: "Pending test suite execution.",
          },
          {
            id: "ac_4_2",
            title: "Disaster Recovery Documentation",
            description: "Complete operational runbook for uncaptured orders and reconciliation scripts.",
            status: "pending",
            evidence: "Awaiting milestone initiation.",
            aiNotes: "Runbook markdown template required.",
          },
        ],
        submissions: [],
      },
    ],
  },
  {
    id: "proj_arbitration_engine_2026",
    title: "AI-Powered Freelance Dispute Arbitration Engine",
    description:
      "Decentralized dispute resolution platform analyzing contract deliverables, GitHub commit histories, and client revision logs using Gemini 2.5 Flash to automatically arbitrate milestone escrow claims.",
    category: "AI & LegalTech",
    client: {
      name: "Sarah Chen",
      email: "sarah.chen@client.demo",
      avatar: "SC",
      company: "Apex Global Commerce Ltd.",
    },
    freelancer: {
      name: "Elena Rostova",
      email: "elena.rostova@dev.demo",
      avatar: "ER",
      title: "AI & Distributed Systems Specialist",
      rating: 4.95,
    },
    totalBudget: 6200,
    currency: "USD",
    escrowFunded: 6200,
    escrowReleased: 2000,
    createdAt: "Nov 01, 2026",
    targetDeadline: "Dec 10, 2026",
    status: "active",
    activityLog: [
      {
        id: "act_201",
        timestamp: "Nov 03, 2026 • 10:15 AM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Funded $6,200 into PayPal Escrow Vault",
      },
      {
        id: "act_202",
        timestamp: "Nov 04, 2026 • 05:00 PM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Released Milestone 1 Payout ($2,000 USD via PayPal Sandbox)",
        milestoneTitle: "Evidence Extractor & GitHub Commit Parser",
      },
      {
        id: "act_203",
        timestamp: "Nov 07, 2026 • 03:20 PM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Approved Stage 2: Gemini 2.5 Flash Evaluation Rubric Generator (Awaiting Payout)",
        milestoneTitle: "Gemini 2.5 Flash Evaluation Rubric Generator",
      },
    ],
    milestones: [
      {
        id: "ms_arb_01",
        stageNumber: 1,
        title: "Evidence Extractor & GitHub Commit Parser",
        description:
          "High-performance worker digesting pull request diffs, commit timelines, and Jira issue comments to construct chronological dispute timelines.",
        amount: 2000,
        currency: "USD",
        dueDate: "Nov 04, 2026",
        status: "paid",
        paidAt: "Nov 04, 2026 at 5:00 PM",
        paypalTransactionId: "PAYID-ARB9931-2041-B",
        acceptanceCriteria: [
          {
            id: "ac_arb_1_1",
            title: "Git Diff Chunk Parser",
            description: "Accurately extracts lines modified, files touched, and author attribution.",
            status: "satisfied",
            evidence: "Successfully parsed 1,400 commits with 0 parser exceptions.",
            aiNotes: "High parsing fidelity verified.",
          },
        ],
        submissions: [
          {
            id: "sub_arb_1",
            version: 1,
            submittedAt: "Nov 04, 2026 at 02:30 PM",
            submittedBy: "Elena Rostova",
            demoUrl: "https://arbitration-engine.demo/parser-test",
            githubRepo: "https://github.com/elena-ai/dispute-arbitration-core",
            githubPr: "https://github.com/elena-ai/dispute-arbitration-core/pull/2",
            notes: "Commit parser written with streaming AST analysis for multi-gigabyte repositories.",
            attachments: [],
          },
        ],
      },
      {
        id: "ms_arb_02",
        stageNumber: 2,
        title: "Gemini 2.5 Flash Evaluation Rubric Generator",
        description:
          "Structured prompt pipeline formatting milestone criteria into JSON schemas for Gemini 2.5 Flash with factual citation checking and confidence scoring.",
        amount: 2400,
        currency: "USD",
        dueDate: "Nov 15, 2026",
        status: "payment_pending",
        acceptanceCriteria: [
          {
            id: "ac_arb_2_1",
            title: "Structured JSON Output Schema",
            description: "Gemini response adheres strictly to zod TypeScript validation schema.",
            status: "satisfied",
            evidence: "100 test prompts produced valid RFC 8259 JSON objects.",
            aiNotes: "Verified: Zero schema validation failures.",
          },
          {
            id: "ac_arb_2_2",
            title: "Hallucination Guardrails",
            description: "Arbitration findings include exact line numbers and commit hashes as evidence.",
            status: "satisfied",
            evidence: "All extracted quotes match commit diff chunks byte-for-byte.",
            aiNotes: "Grounding and verification guardrails functioning as specified.",
          },
        ],
        submissions: [
          {
            id: "sub_arb_2",
            version: 1,
            submittedAt: "Nov 07, 2026 at 11:15 AM",
            submittedBy: "Elena Rostova",
            demoUrl: "https://arbitration-engine.demo/gemini-eval",
            githubRepo: "https://github.com/elena-ai/dispute-arbitration-core",
            githubPr: "https://github.com/elena-ai/dispute-arbitration-core/pull/5",
            notes: "Evaluation engine deployed. Tested with 50 mock contract disputes with 97% client approval rate.",
            attachments: [
              { name: "dispute-arbitration-benchmark.pdf", size: "2.1 MB", type: "application/pdf" },
            ],
            aiAssessment: {
              overallScore: 97,
              summary:
                "Demonstration AI Audit: All acceptance criteria satisfied. JSON schemas conform to strict contract guidelines with verifiable commit citations.",
              status: "approved",
              verifiedAt: "Nov 07, 2026 at 11:20 AM",
              isDemonstration: true,
              criteria: [
                {
                  id: "ac_arb_2_1",
                  title: "Structured JSON Output Schema",
                  description: "Gemini response adheres to zod schema.",
                  status: "satisfied",
                  evidence: "100/100 valid schema responses.",
                  aiNotes: "High schema reliability.",
                },
                {
                  id: "ac_arb_2_2",
                  title: "Hallucination Guardrails",
                  description: "Findings cite exact code line numbers.",
                  status: "satisfied",
                  evidence: "Citations verified against Git SHA blobs.",
                  aiNotes: "No ungrounded claims detected.",
                },
              ],
              automatedChecks: [
                { name: "Live Staging Response", passed: true, detail: "HTTPS 200 OK (110ms)" },
                { name: "JSON Schema Validator", passed: true, detail: "100% compliant with Zod schema" },
              ],
              suggestedRevisions: [],
            },
          },
        ],
      },
      {
        id: "ms_arb_03",
        stageNumber: 3,
        title: "Real-Time Payout Disbursal Smart Contracts",
        description:
          "Integration with PayPal Sandbox Payouts v1 API to programmatically disburse funds based on arbitration score thresholds.",
        amount: 1800,
        currency: "USD",
        dueDate: "Dec 05, 2026",
        status: "in_progress",
        acceptanceCriteria: [
          {
            id: "ac_arb_3_1",
            title: "Multi-party Escrow Splitter",
            description: "Splits escrow between client refund and freelancer payout according to arbitration verdict.",
            status: "pending",
            evidence: "Implementation in progress.",
            aiNotes: "Drafting PayPal Payouts batch API integration.",
          },
        ],
        submissions: [],
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    timestamp: "10 mins ago",
    title: "Stage 2 Deliverables Ready",
    message: "Rohan Verma submitted Stage 2 for 'E-Commerce FinTech Web App'. AI scored 94%.",
    type: "submission",
    unread: true,
    projectId: "proj_paypal_ai_2026",
    milestoneId: "ms_02",
  },
  {
    id: "notif_2",
    timestamp: "2 hours ago",
    title: "Revision Requested on Stage 3",
    message: "Sarah Chen requested a revision for Stage 3 (Idempotency key header required).",
    type: "revision",
    unread: true,
    projectId: "proj_paypal_ai_2026",
    milestoneId: "ms_03",
  },
  {
    id: "notif_3",
    timestamp: "Yesterday",
    title: "Milestone Approved for Payout",
    message: "Stage 2 of 'AI Dispute Arbitration Engine' is approved. $2,400 ready for release.",
    type: "approval",
    unread: false,
    projectId: "proj_arbitration_engine_2026",
    milestoneId: "ms_arb_02",
  },
  {
    id: "notif_4",
    timestamp: "3 days ago",
    title: "PayPal Escrow Payout Released",
    message: "$1,200 USD transferred to Rohan Verma via PayPal Sandbox (PAYID-MN7642-8921-A).",
    type: "payment",
    unread: false,
    projectId: "proj_paypal_ai_2026",
    milestoneId: "ms_01",
  },
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "tx_101",
    milestoneId: "ms_01",
    milestoneTitle: "UI Architecture & Design System",
    projectId: "proj_paypal_ai_2026",
    projectTitle: "E-Commerce FinTech Web App & PayPal Checkout",
    amount: 1200,
    currency: "USD",
    paidAt: "Nov 02, 2026 at 4:30 PM",
    paypalTransactionId: "PAYID-MN7642-8921-A",
    status: "completed",
    isSimulated: true,
    payer: "Sarah Chen (Apex Global Commerce)",
    payee: "Rohan Verma",
  },
  {
    id: "tx_102",
    milestoneId: "ms_arb_01",
    milestoneTitle: "Evidence Extractor & GitHub Commit Parser",
    projectId: "proj_arbitration_engine_2026",
    projectTitle: "AI-Powered Freelance Dispute Arbitration Engine",
    amount: 2000,
    currency: "USD",
    paidAt: "Nov 04, 2026 at 5:00 PM",
    paypalTransactionId: "PAYID-ARB9931-2041-B",
    status: "completed",
    isSimulated: true,
    payer: "Sarah Chen (Apex Global Commerce)",
    payee: "Elena Rostova",
  },
];
