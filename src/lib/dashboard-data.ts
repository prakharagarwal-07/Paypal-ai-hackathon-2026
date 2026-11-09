export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "changes_requested"
  | "approved"
  | "paid"
  // Legacy aliases for backward compatibility
  | "under_ai_review"
  | "awaiting_client_approval"
  | "revision_requested"
  | "payment_pending";

export type CriterionStatus =
  | "met"
  | "missing"
  | "needs_manual_review"
  // Legacy aliases
  | "satisfied"
  | "needs_verification"
  | "pending";

export interface AcceptanceCriterion {
  id: string;
  title: string;
  description: string;
  status: CriterionStatus;
  evidence?: string;
  aiNotes?: string;
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
  automatedChecks?: AutomatedCheck[];
  suggestedRevisions?: string[];
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
  githubPr?: string;
  loomVideo?: string;
  notes: string;
  attachments?: DeliverableAttachment[];
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
  totalPaid: number;
  // Aliases for compatibility
  escrowFunded: number;
  escrowReleased: number;
  currency: string;
  createdAt: string;
  targetDeadline: string;
  status: "active" | "completed" | "archived";
  milestones: Milestone[];
  activityLog: ActivityItem[];
}

export function getFriendlyStatus(status: MilestoneStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "paid":
      return {
        label: "Payment Completed",
        badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
      };
    case "approved":
    case "payment_pending":
      return {
        label: "Approved",
        badgeClass: "bg-blue-50 text-[#0070BA] dark:bg-blue-950/40 dark:text-sky-300 border border-blue-200 dark:border-blue-800",
      };
    case "submitted":
    case "under_ai_review":
    case "awaiting_client_approval":
      return {
        label: "Submitted for Review",
        badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
      };
    case "changes_requested":
    case "revision_requested":
      return {
        label: "Changes Requested",
        badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
      };
    case "in_progress":
      return {
        label: "In Progress",
        badgeClass: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border border-slate-200 dark:border-white/10",
      };
    case "not_started":
    default:
      return {
        label: "Not Started",
        badgeClass: "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400 border border-slate-200/60 dark:border-white/5",
      };
  }
}

export function getFriendlyCriterionStatus(status: CriterionStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "met":
    case "satisfied":
      return {
        label: "Met",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
    case "missing":
      return {
        label: "Missing",
        badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
      };
    case "needs_manual_review":
    case "needs_verification":
    default:
      return {
        label: "Needs Manual Review",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
      };
  }
}

export const FREELANCER_OPTIONS = [
  {
    name: "Rohan Verma",
    email: "rohan.verma@dev.demo",
    avatar: "RV",
    title: "Web Developer",
    rating: 4.98,
  },
  {
    name: "Elena Rostova",
    email: "elena.rostova@dev.demo",
    avatar: "ER",
    title: "Software Engineer",
    rating: 4.95,
  },
  {
    name: "Marcus Thorne",
    email: "marcus.t@dev.demo",
    avatar: "MT",
    title: "Frontend Designer",
    rating: 4.92,
  },
];

export const INITIAL_PROJECTS: ProjectContract[] = [
  {
    id: "proj_online_store_2026",
    title: "Online Storefront & PayPal Checkout",
    description: "A custom online store with shopping cart and secure PayPal checkout.",
    category: "Web Development",
    client: {
      name: "Sarah Chen",
      email: "sarah.chen@client.demo",
      avatar: "SC",
      company: "Apex Commerce",
    },
    freelancer: {
      name: "Rohan Verma",
      email: "rohan.verma@dev.demo",
      avatar: "RV",
      title: "Web Developer",
      rating: 4.98,
    },
    totalBudget: 4800,
    totalPaid: 1200,
    escrowFunded: 4800,
    escrowReleased: 1200,
    currency: "USD",
    createdAt: "Oct 28, 2026",
    targetDeadline: "Nov 25, 2026",
    status: "active",
    activityLog: [
      {
        id: "act_101",
        timestamp: "Nov 02, 2026 • 04:30 PM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Paid Milestone 1 ($1,200 USD via PayPal Sandbox)",
        milestoneTitle: "Design & Page Layouts",
      },
      {
        id: "act_102",
        timestamp: "Nov 05, 2026 • 02:15 PM",
        actor: "Rohan Verma",
        actorRole: "freelancer",
        action: "Submitted work for Milestone 2: Shopping Cart & Checkout Flow",
        milestoneTitle: "Shopping Cart & Checkout Flow",
      },
      {
        id: "act_103",
        timestamp: "Nov 05, 2026 • 02:16 PM",
        actor: "MilestoneOS Assistant",
        actorRole: "ai_system",
        action: "Automated work review completed: 3 of 3 requirements met.",
        milestoneTitle: "Shopping Cart & Checkout Flow",
      },
      {
        id: "act_104",
        timestamp: "Nov 07, 2026 • 11:45 AM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Requested changes on Milestone 3: Please include the order number on the email receipt.",
        milestoneTitle: "Order Confirmation & Email Receipts",
      },
    ],
    milestones: [
      {
        id: "ms_01",
        stageNumber: 1,
        title: "Design & Page Layouts",
        description: "Homepage, product catalog, and responsive mobile layouts.",
        amount: 1200,
        currency: "USD",
        dueDate: "Nov 02, 2026",
        status: "paid",
        paidAt: "Nov 02, 2026 at 4:30 PM",
        paypalTransactionId: "PAYID-SBX-109283-A",
        acceptanceCriteria: [
          {
            id: "ac_1_1",
            title: "Clean layout on mobile and desktop",
            description: "Storefront displays smoothly on mobile phones and desktop screens.",
            status: "met",
            evidence: "Verified responsive layouts at 375px and 1280px widths.",
            aiNotes: "Layout is clean with no broken elements.",
          },
          {
            id: "ac_1_2",
            title: "Navigation and product catalog",
            description: "Header navigation, product categories, and search bar work as intended.",
            status: "met",
            evidence: "All category links and product filters functioning.",
            aiNotes: "Product catalog renders correctly.",
          },
        ],
        submissions: [
          {
            id: "sub_1_1",
            version: 1,
            submittedAt: "Nov 02, 2026 at 03:45 PM",
            submittedBy: "Rohan Verma",
            demoUrl: "https://staging.online-storefront.demo",
            githubRepo: "https://github.com/rohan-dev/online-storefront",
            notes: "Completed all homepage and product catalog pages.",
          },
        ],
      },
      {
        id: "ms_02",
        stageNumber: 2,
        title: "Shopping Cart & Checkout Flow",
        description: "Add to cart, quantity adjustments, and PayPal checkout button integration.",
        amount: 1400,
        currency: "USD",
        dueDate: "Nov 12, 2026",
        status: "submitted",
        acceptanceCriteria: [
          {
            id: "ac_2_1",
            title: "Add and remove cart items",
            description: "Customers can add items to cart, adjust quantities, and remove items.",
            status: "met",
            evidence: "Tested cart updates: adding, updating quantities, and removing items works accurately.",
            aiNotes: "Cart state persists properly during checkout.",
          },
          {
            id: "ac_2_2",
            title: "Price & tax calculations",
            description: "Cart automatically calculates subtotal, sales tax, and shipping total.",
            status: "met",
            evidence: "Tax calculation tested on sample orders: total sums correctly.",
            aiNotes: "Math verified on sample orders.",
          },
          {
            id: "ac_2_3",
            title: "PayPal checkout button on payment screen",
            description: "PayPal button opens checkout modal cleanly in test mode.",
            status: "met",
            evidence: "PayPal button loads cleanly and triggers approval popup.",
            aiNotes: "Checkout button connects to PayPal Sandbox.",
          },
        ],
        submissions: [
          {
            id: "sub_2_1",
            version: 1,
            submittedAt: "Nov 05, 2026 at 02:15 PM",
            submittedBy: "Rohan Verma",
            demoUrl: "https://staging.online-storefront.demo/checkout",
            githubRepo: "https://github.com/rohan-dev/online-storefront",
            loomVideo: "https://loom.com/share/cart-checkout-demo",
            notes: "Cart and checkout flow is ready. Tested payment flow with PayPal Sandbox.",
            aiAssessment: {
              overallScore: 96,
              summary: "Automated work review checked the code and staging site. All 3 requirements were met.",
              status: "approved",
              verifiedAt: "Nov 05, 2026 at 02:16 PM",
              isDemonstration: true,
              criteria: [
                {
                  id: "ac_2_1",
                  title: "Add and remove cart items",
                  description: "Customers can add and remove items.",
                  status: "met",
                  evidence: "Cart operations verified on staging site.",
                },
                {
                  id: "ac_2_2",
                  title: "Price & tax calculations",
                  description: "Automatic calculations.",
                  status: "met",
                  evidence: "Total calculations verified.",
                },
                {
                  id: "ac_2_3",
                  title: "PayPal checkout button on payment screen",
                  description: "PayPal button works.",
                  status: "met",
                  evidence: "Button opens sandbox window properly.",
                },
              ],
            },
          },
        ],
        latestAudit: {
          overallScore: 96,
          summary: "Automated review checked the deliverables against milestone requirements. All 3 requirements are met.",
          status: "approved",
          verifiedAt: "Nov 05, 2026 at 02:16 PM",
          isDemonstration: true,
          criteria: [
            {
              id: "ac_2_1",
              title: "Add and remove cart items",
              description: "Customers can add and remove items.",
              status: "met",
              evidence: "Cart operations verified on staging site.",
            },
            {
              id: "ac_2_2",
              title: "Price & tax calculations",
              description: "Automatic calculations.",
              status: "met",
              evidence: "Total calculations verified.",
            },
            {
              id: "ac_2_3",
              title: "PayPal checkout button on payment screen",
              description: "PayPal button works.",
              status: "met",
              evidence: "Button opens sandbox window properly.",
            },
          ],
        },
      },
      {
        id: "ms_03",
        stageNumber: 3,
        title: "Order Confirmation & Email Receipts",
        description: "Order confirmation screen and automated customer email receipt.",
        amount: 1200,
        currency: "USD",
        dueDate: "Nov 18, 2026",
        status: "changes_requested",
        acceptanceCriteria: [
          {
            id: "ac_3_1",
            title: "Order confirmation page",
            description: "Show a clear thank-you page with order number and purchased items.",
            status: "met",
            evidence: "Confirmation page displays items purchased.",
            aiNotes: "Page renders after payment.",
          },
          {
            id: "ac_3_2",
            title: "Email receipt to buyer",
            description: "Send automated email with order number, receipt date, and itemized total.",
            status: "missing",
            evidence: "Email sent, but order number was missing from the subject line and receipt body.",
            aiNotes: "Order number needs to be added.",
          },
        ],
        submissions: [
          {
            id: "sub_3_1",
            version: 1,
            submittedAt: "Nov 06, 2026 at 06:10 PM",
            submittedBy: "Rohan Verma",
            demoUrl: "https://staging.online-storefront.demo/order-success",
            githubRepo: "https://github.com/rohan-dev/online-storefront",
            notes: "Added order confirmation page and basic email receipt flow.",
            revisionRequest: {
              requestedAt: "Nov 07, 2026 at 11:45 AM",
              requestedBy: "Sarah Chen",
              reason: "Please include the order number in the email subject and receipt body so customers can easily reference it.",
            },
          },
        ],
      },
      {
        id: "ms_04",
        stageNumber: 4,
        title: "Final Testing & Launch",
        description: "Cross-device testing and production verification.",
        amount: 1000,
        currency: "USD",
        dueDate: "Nov 25, 2026",
        status: "not_started",
        acceptanceCriteria: [
          {
            id: "ac_4_1",
            title: "Cross-browser testing",
            description: "Tested across Chrome, Safari, and mobile browsers.",
            status: "needs_manual_review",
            evidence: "Awaiting milestone completion.",
          },
          {
            id: "ac_4_2",
            title: "Store launch checklist",
            description: "Storefront ready for live customers.",
            status: "needs_manual_review",
            evidence: "Awaiting milestone completion.",
          },
        ],
        submissions: [],
      },
    ],
  },
  {
    id: "proj_customer_reviews_2026",
    title: "Customer Review & Rating System",
    description: "A review section allowing customers to rate products and leave verified feedback.",
    category: "Features & Add-ons",
    client: {
      name: "Sarah Chen",
      email: "sarah.chen@client.demo",
      avatar: "SC",
      company: "Apex Commerce",
    },
    freelancer: {
      name: "Elena Rostova",
      email: "elena.rostova@dev.demo",
      avatar: "ER",
      title: "Software Engineer",
      rating: 4.95,
    },
    totalBudget: 4400,
    totalPaid: 2000,
    escrowFunded: 4400,
    escrowReleased: 2000,
    currency: "USD",
    createdAt: "Nov 01, 2026",
    targetDeadline: "Dec 10, 2026",
    status: "active",
    activityLog: [
      {
        id: "act_201",
        timestamp: "Nov 04, 2026 • 05:00 PM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Paid Milestone 1 ($2,000 USD via PayPal Sandbox)",
        milestoneTitle: "Review Form & Star Ratings",
      },
      {
        id: "act_202",
        timestamp: "Nov 07, 2026 • 03:20 PM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Approved Milestone 2: Review Display & Helpful Votes. Ready for payment.",
        milestoneTitle: "Review Display & Helpful Votes",
      },
    ],
    milestones: [
      {
        id: "ms_rev_01",
        stageNumber: 1,
        title: "Review Form & Star Ratings",
        description: "Customer rating form with 1-5 star selector, review title, and comments.",
        amount: 2000,
        currency: "USD",
        dueDate: "Nov 04, 2026",
        status: "paid",
        paidAt: "Nov 04, 2026 at 5:00 PM",
        paypalTransactionId: "PAYID-SBX-882319-B",
        acceptanceCriteria: [
          {
            id: "ac_rev_1",
            title: "Interactive star rating",
            description: "Customers can click 1 to 5 stars to rate the product.",
            status: "met",
            evidence: "Tested star rating selector across mobile and desktop.",
          },
        ],
        submissions: [
          {
            id: "sub_rev_1",
            version: 1,
            submittedAt: "Nov 04, 2026 at 02:30 PM",
            submittedBy: "Elena Rostova",
            demoUrl: "https://reviews-system.demo/form-test",
            githubRepo: "https://github.com/elena-ai/product-reviews",
            notes: "Star rating form is ready and connected to the backend.",
          },
        ],
      },
      {
        id: "ms_rev_02",
        stageNumber: 2,
        title: "Review Display & Helpful Votes",
        description: "Display customer reviews on product page with average star rating and helpful voting.",
        amount: 2400,
        currency: "USD",
        dueDate: "Nov 15, 2026",
        status: "approved",
        acceptanceCriteria: [
          {
            id: "ac_rev_2_1",
            title: "Review list display",
            description: "Show list of reviews with date, reviewer name, and rating.",
            status: "met",
            evidence: "Reviews render in clean cards below product description.",
          },
          {
            id: "ac_rev_2_2",
            title: "Average score badge",
            description: "Display aggregate score (e.g. 4.8 out of 5 stars) at the top.",
            status: "met",
            evidence: "Average score calculates dynamically from all approved reviews.",
          },
        ],
        submissions: [
          {
            id: "sub_rev_2",
            version: 1,
            submittedAt: "Nov 07, 2026 at 11:15 AM",
            submittedBy: "Elena Rostova",
            demoUrl: "https://reviews-system.demo/display-test",
            githubRepo: "https://github.com/elena-ai/product-reviews",
            notes: "Completed review display and helpful voting. Ready for client review.",
            aiAssessment: {
              overallScore: 97,
              summary: "Automated work review checked the implementation. All 2 requirements were met.",
              status: "approved",
              verifiedAt: "Nov 07, 2026 at 11:20 AM",
              isDemonstration: true,
              criteria: [
                {
                  id: "ac_rev_2_1",
                  title: "Review list display",
                  description: "Reviews render with date and rating.",
                  status: "met",
                  evidence: "Display verified on demo.",
                },
                {
                  id: "ac_rev_2_2",
                  title: "Average score badge",
                  description: "Displays aggregate score.",
                  status: "met",
                  evidence: "Score calculation verified.",
                },
              ],
            },
          },
        ],
        latestAudit: {
          overallScore: 97,
          summary: "Automated work review checked the implementation. All 2 requirements were met.",
          status: "approved",
          verifiedAt: "Nov 07, 2026 at 11:20 AM",
          isDemonstration: true,
          criteria: [
            {
              id: "ac_rev_2_1",
              title: "Review list display",
              description: "Reviews render with date and rating.",
              status: "met",
              evidence: "Display verified on demo.",
            },
            {
              id: "ac_rev_2_2",
              title: "Average score badge",
              description: "Displays aggregate score.",
              status: "met",
              evidence: "Score calculation verified.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "proj_sub_billing_completed",
    title: "Mobile App & PayPal Subscription Billing",
    description: "Recurring monthly billing integration, automated PDF invoices, and account dashboard for iOS and Android.",
    category: "FinTech & Mobile Development",
    client: {
      name: "Sarah Chen",
      email: "sarah.chen@client.demo",
      avatar: "SC",
      company: "Apex Commerce",
    },
    freelancer: {
      name: "Rohan Verma",
      email: "rohan.verma@dev.demo",
      avatar: "RV",
      title: "Web Developer",
      rating: 4.98,
    },
    totalBudget: 3200,
    totalPaid: 3200,
    escrowFunded: 3200,
    escrowReleased: 3200,
    currency: "USD",
    createdAt: "Oct 01, 2026",
    targetDeadline: "Oct 24, 2026",
    status: "completed",
    activityLog: [
      {
        id: "act_301",
        timestamp: "Oct 01, 2026 • 10:00 AM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Project initiated and contract terms accepted.",
      },
      {
        id: "act_302",
        timestamp: "Oct 07, 2026 • 03:15 PM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Paid Milestone 1 ($1,000 USD via PayPal Sandbox)",
        milestoneTitle: "Subscription Tier Architecture & Database Schema",
      },
      {
        id: "act_303",
        timestamp: "Oct 15, 2026 • 05:40 PM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Paid Milestone 2 ($1,200 USD via PayPal Sandbox)",
        milestoneTitle: "PayPal Subscriptions API Integration & Webhooks",
      },
      {
        id: "act_304",
        timestamp: "Oct 24, 2026 • 11:20 AM",
        actor: "Sarah Chen",
        actorRole: "client",
        action: "Final payment sent ($1,000 USD via PayPal). Project 100% completed!",
        milestoneTitle: "Automated Invoicing & Customer Self-Serve Portal",
      },
    ],
    milestones: [
      {
        id: "ms_sub_01",
        stageNumber: 1,
        title: "Subscription Tier Architecture & Database Schema",
        description: "PostgreSQL schema design for multi-tier monthly plans and customer accounts.",
        amount: 1000,
        currency: "USD",
        dueDate: "Oct 08, 2026",
        status: "paid",
        paidAt: "Oct 07, 2026 at 3:15 PM",
        paypalTransactionId: "PAYID-SBX-782190-A",
        acceptanceCriteria: [
          {
            id: "ac_sub_1_1",
            title: "Database schema for recurring plans",
            description: "Tables for subscriptions, users, and tier permissions created.",
            status: "met",
            evidence: "Schema migrations tested and verified in staging database.",
          },
          {
            id: "ac_sub_1_2",
            title: "Account authentication endpoints",
            description: "API routes for subscriber login and session verification.",
            status: "met",
            evidence: "JWT auth endpoints passed all unit tests.",
          },
        ],
        submissions: [
          {
            id: "sub_sub_1",
            version: 1,
            submittedAt: "Oct 07, 2026 at 01:30 PM",
            submittedBy: "Rohan Verma",
            demoUrl: "https://staging.apex-commerce.demo/billing-api",
            githubRepo: "https://github.com/rohan-dev/subscription-backend",
            notes: "Schema migrations complete and all test suites passing.",
          },
        ],
      },
      {
        id: "ms_sub_02",
        stageNumber: 2,
        title: "PayPal Subscriptions API Integration & Webhooks",
        description: "Integration with PayPal Subscriptions API, plan billing cycles, and automated webhook event handling.",
        amount: 1200,
        currency: "USD",
        dueDate: "Oct 16, 2026",
        status: "paid",
        paidAt: "Oct 15, 2026 at 5:40 PM",
        paypalTransactionId: "PAYID-SBX-782191-B",
        acceptanceCriteria: [
          {
            id: "ac_sub_2_1",
            title: "PayPal recurring billing button",
            description: "Frontend checkout presents recurring monthly subscription authorization.",
            status: "met",
            evidence: "Successfully processed sandbox recurring plans.",
          },
          {
            id: "ac_sub_2_2",
            title: "Webhook event processor",
            description: "Listens for payment capture, failed billing, and subscription cancellations.",
            status: "met",
            evidence: "Simulator webhook payload triggered user tier update correctly.",
          },
        ],
        submissions: [
          {
            id: "sub_sub_2",
            version: 1,
            submittedAt: "Oct 15, 2026 at 03:00 PM",
            submittedBy: "Rohan Verma",
            demoUrl: "https://staging.apex-commerce.demo/subscribe",
            githubRepo: "https://github.com/rohan-dev/subscription-backend",
            notes: "PayPal Sandbox recurring subscription flow fully integrated.",
          },
        ],
      },
      {
        id: "ms_sub_03",
        stageNumber: 3,
        title: "Automated Invoicing & Customer Self-Serve Portal",
        description: "Customer self-service portal to manage subscription, view invoices, and download receipts.",
        amount: 1000,
        currency: "USD",
        dueDate: "Oct 24, 2026",
        status: "paid",
        paidAt: "Oct 24, 2026 at 11:20 AM",
        paypalTransactionId: "PAYID-SBX-782192-C",
        acceptanceCriteria: [
          {
            id: "ac_sub_3_1",
            title: "Self-service billing dashboard",
            description: "Subscribers can view active plan, next billing date, and payment history.",
            status: "met",
            evidence: "Tested billing portal with customer accounts.",
          },
          {
            id: "ac_sub_3_2",
            title: "PDF invoice generation and email receipt",
            description: "Automated invoice receipt generated on successful recurring payment.",
            status: "met",
            evidence: "PDF invoices correctly formatted and delivered.",
          },
        ],
        submissions: [
          {
            id: "sub_sub_3",
            version: 1,
            submittedAt: "Oct 23, 2026 at 04:10 PM",
            submittedBy: "Rohan Verma",
            demoUrl: "https://staging.apex-commerce.demo/portal",
            githubRepo: "https://github.com/rohan-dev/subscription-backend",
            notes: "Final delivery with PDF invoice generator and customer portal.",
          },
        ],
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    timestamp: "10 mins ago",
    title: "Work Submitted for Review",
    message: "Rohan Verma submitted Milestone 2 for 'Online Storefront & PayPal Checkout'.",
    type: "submission",
    unread: true,
    projectId: "proj_online_store_2026",
    milestoneId: "ms_02",
  },
  {
    id: "notif_2",
    timestamp: "2 hours ago",
    title: "Changes Requested",
    message: "Sarah Chen requested updates for Milestone 3 (Order Confirmation & Email Receipts).",
    type: "revision",
    unread: true,
    projectId: "proj_online_store_2026",
    milestoneId: "ms_03",
  },
  {
    id: "notif_3",
    timestamp: "Yesterday",
    title: "Milestone Approved",
    message: "Milestone 2 for 'Customer Review & Rating System' was approved and is ready for payment.",
    type: "approval",
    unread: false,
    projectId: "proj_customer_reviews_2026",
    milestoneId: "ms_rev_02",
  },
  {
    id: "notif_4",
    timestamp: "3 days ago",
    title: "Payment Completed",
    message: "$1,200 USD paid to Rohan Verma via PayPal Sandbox (PAYID-SBX-109283-A).",
    type: "payment",
    unread: false,
    projectId: "proj_online_store_2026",
    milestoneId: "ms_01",
  },
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "tx_101",
    milestoneId: "ms_01",
    milestoneTitle: "Design & Page Layouts",
    projectId: "proj_online_store_2026",
    projectTitle: "Online Storefront & PayPal Checkout",
    amount: 1200,
    currency: "USD",
    paidAt: "Nov 02, 2026 at 4:30 PM",
    paypalTransactionId: "PAYID-SBX-109283-A",
    status: "completed",
    isSimulated: true,
    payer: "Sarah Chen (Apex Commerce)",
    payee: "Rohan Verma",
  },
  {
    id: "tx_102",
    milestoneId: "ms_rev_01",
    milestoneTitle: "Review Form & Star Ratings",
    projectId: "proj_customer_reviews_2026",
    projectTitle: "Customer Review & Rating System",
    amount: 2000,
    currency: "USD",
    paidAt: "Nov 04, 2026 at 5:00 PM",
    paypalTransactionId: "PAYID-SBX-882319-B",
    status: "completed",
    isSimulated: true,
    payer: "Sarah Chen (Apex Commerce)",
    payee: "Elena Rostova",
  },
  {
    id: "tx_103",
    milestoneId: "ms_sub_01",
    milestoneTitle: "Subscription Tier Architecture & Database Schema",
    projectId: "proj_sub_billing_completed",
    projectTitle: "Mobile App & PayPal Subscription Billing",
    amount: 1000,
    currency: "USD",
    paidAt: "Oct 07, 2026 at 3:15 PM",
    paypalTransactionId: "PAYID-SBX-782190-A",
    status: "completed",
    isSimulated: true,
    payer: "Sarah Chen (Apex Commerce)",
    payee: "Rohan Verma",
  },
  {
    id: "tx_104",
    milestoneId: "ms_sub_02",
    milestoneTitle: "PayPal Subscriptions API Integration & Webhooks",
    projectId: "proj_sub_billing_completed",
    projectTitle: "Mobile App & PayPal Subscription Billing",
    amount: 1200,
    currency: "USD",
    paidAt: "Oct 15, 2026 at 5:40 PM",
    paypalTransactionId: "PAYID-SBX-782191-B",
    status: "completed",
    isSimulated: true,
    payer: "Sarah Chen (Apex Commerce)",
    payee: "Rohan Verma",
  },
  {
    id: "tx_105",
    milestoneId: "ms_sub_03",
    milestoneTitle: "Automated Invoicing & Customer Self-Serve Portal",
    projectId: "proj_sub_billing_completed",
    projectTitle: "Mobile App & PayPal Subscription Billing",
    amount: 1000,
    currency: "USD",
    paidAt: "Oct 24, 2026 at 11:20 AM",
    paypalTransactionId: "PAYID-SBX-782192-C",
    status: "completed",
    isSimulated: true,
    payer: "Sarah Chen (Apex Commerce)",
    payee: "Rohan Verma",
  },
];
