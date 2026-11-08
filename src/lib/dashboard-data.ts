export interface AcceptanceCriterion {
  id: string;
  title: string;
  description: string;
  status: "passed" | "warning" | "failed" | "pending";
  aiNotes: string;
}

export interface Milestone {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: "paid" | "in_review" | "in_progress" | "upcoming";
  paidAt?: string;
  paypalTransactionId?: string;
  deliverables?: {
    demoUrl?: string;
    githubRepo?: string;
    githubPr?: string;
    loomVideo?: string;
    notes?: string;
    submittedAt?: string;
  };
  aiAudit?: {
    overallScore: number;
    summary: string;
    status: "approved" | "changes_requested" | "pending";
    verifiedAt: string;
    criteria: AcceptanceCriterion[];
    automatedChecks: {
      name: string;
      passed: boolean;
      detail: string;
    }[];
  };
}

export interface ProjectContract {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerAvatar: string;
  totalBudget: number;
  currency: string;
  escrowFunded: number;
  escrowReleased: number;
  createdAt: string;
  status: "active" | "completed";
  milestones: Milestone[];
}

export const INITIAL_PROJECT: ProjectContract = {
  id: "proj_paypal_ai_2026",
  title: "E-Commerce FinTech Web App & PayPal Checkout",
  clientName: "Sarah Chen",
  clientEmail: "sarah.chen@client.demo",
  clientAvatar: "SC",
  freelancerName: "Rohan Verma",
  freelancerEmail: "rohan.verma@dev.demo",
  freelancerAvatar: "RV",
  totalBudget: 4800,
  currency: "USD",
  escrowFunded: 4800,
  escrowReleased: 1200,
  createdAt: "Oct 28, 2026",
  status: "active",
  milestones: [
    {
      id: "ms_01",
      stageNumber: 1,
      title: "UI Architecture & Design System",
      description: "Responsive Next.js application shell, Tailwind styling tokens, dark/light theme, and complete navigation hierarchy.",
      amount: 1200,
      currency: "USD",
      dueDate: "Nov 02, 2026",
      status: "paid",
      paidAt: "Nov 02, 2026",
      paypalTransactionId: "PAYID-MN7642-8921-A",
      deliverables: {
        demoUrl: "https://staging.milestone-store.demo",
        githubRepo: "https://github.com/rohan-dev/ecommerce-paypal-app",
        githubPr: "https://github.com/rohan-dev/ecommerce-paypal-app/pull/1",
        notes: "Completed full component library with WCAG 2.1 AA accessibility and zero layout shift.",
        submittedAt: "Nov 02, 2026 at 4:15 PM",
      },
      aiAudit: {
        overallScore: 98,
        summary: "All 4 acceptance criteria rigorously verified. Design system matches specs, responsive breakpoints functional on mobile/tablet/desktop.",
        status: "approved",
        verifiedAt: "Nov 02, 2026",
        criteria: [
          {
            id: "crit_1_1",
            title: "Responsive Navigation & Theme Switcher",
            description: "Header navigation with theme toggle and mobile hamburger sheet.",
            status: "passed",
            aiNotes: "Verified across 375px, 768px, and 1440px viewport tests.",
          },
          {
            id: "crit_1_2",
            title: "WCAG Accessible Color Contrast",
            description: "All text elements meet 4.5:1 minimum contrast ratio.",
            status: "passed",
            aiNotes: "Automated Axe-core accessibility score: 100/100.",
          },
        ],
        automatedChecks: [
          { name: "Live Staging HTTP 200", passed: true, detail: "Response code 200 OK (218ms)" },
          { name: "TypeScript Strict Check", passed: true, detail: "0 errors across 48 files" },
          { name: "Mobile Viewport Test", passed: true, detail: "Passes 320px - 1920px rendering" },
        ],
      },
    },
    {
      id: "ms_02",
      stageNumber: 2,
      title: "Product Catalog & PayPal Checkout Setup",
      description: "Interactive product catalog with cart state, PayPal Orders v2 SDK client integration, and real-time order creation.",
      amount: 1800,
      currency: "USD",
      dueDate: "Nov 08, 2026",
      status: "in_review",
      deliverables: {
        demoUrl: "https://staging.milestone-store.demo/checkout",
        githubRepo: "https://github.com/rohan-dev/ecommerce-paypal-app",
        githubPr: "https://github.com/rohan-dev/ecommerce-paypal-app/pull/4",
        loomVideo: "https://loom.com/share/paypal-checkout-flow-demo",
        notes: "Integrated PayPal standard buttons with sandbox client ID. Handles order creation and approval callbacks with loading state.",
        submittedAt: "Nov 08, 2026 at 11:30 AM",
      },
      aiAudit: {
        overallScore: 95,
        summary: "Excellent deliverable submission! 4 of 4 acceptance criteria passed. PayPal SDK initializes correctly in sandbox mode and cart calculation matches line items.",
        status: "approved",
        verifiedAt: "Nov 08, 2026 at 11:32 AM",
        criteria: [
          {
            id: "crit_2_1",
            title: "PayPal JS SDK Integration (Sandbox)",
            description: "Renders standard PayPal checkout button loaded from sdk.paypal.com with sandbox credentials.",
            status: "passed",
            aiNotes: "Verified: loads @paypal/react-paypal-js with valid client-id and currency USD.",
          },
          {
            id: "crit_2_2",
            title: "Cart & Price Calculation Precision",
            description: "Item quantities, subtotal, and currency amounts match exactly without floating-point rounding errors.",
            status: "passed",
            aiNotes: "Verified: unit prices and tax computations match down to 2 decimal places.",
          },
          {
            id: "crit_2_3",
            title: "Order Approval Flow & Callback Handling",
            description: "Successful payment triggers onApprove callback and updates UI order confirmation state.",
            status: "passed",
            aiNotes: "Verified: captureOrder endpoint executed cleanly and returns 200 with captured order ID.",
          },
          {
            id: "crit_2_4",
            title: "Error Handling & Cancelled Payment States",
            description: "Graceful cancellation message if user closes the PayPal window or payment fails.",
            status: "passed",
            aiNotes: "Verified: onCancel and onError handlers display friendly inline alerts without crashing.",
          },
        ],
        automatedChecks: [
          { name: "Live Checkout Endpoint", passed: true, detail: "HTTPS URL reachable and responsive (184ms)" },
          { name: "PayPal SDK Script Load", passed: true, detail: "paypal.Buttons detected and operational" },
          { name: "GitHub Pull Request", passed: true, detail: "PR #4 contains 12 commits, +410 / -18 lines" },
          { name: "Automated E2E Checkout Test", passed: true, detail: "Simulated buyer sandbox checkout approved" },
        ],
      },
    },
    {
      id: "ms_03",
      stageNumber: 3,
      title: "Webhook Notifications & PayPal Dispute Handler",
      description: "Server-side PayPal webhook endpoint to capture PAYMENT.CAPTURE.COMPLETED and CHECKOUT.ORDER.APPROVED events with signature verification.",
      amount: 1000,
      currency: "USD",
      dueDate: "Nov 16, 2026",
      status: "in_progress",
    },
    {
      id: "ms_04",
      stageNumber: 4,
      title: "Production Deployment & Security Audit",
      description: "Vercel production deployment, custom domain setup, rate limiting, and complete end-to-end sandbox walkthrough.",
      amount: 800,
      currency: "USD",
      dueDate: "Nov 24, 2026",
      status: "upcoming",
    },
  ],
};
