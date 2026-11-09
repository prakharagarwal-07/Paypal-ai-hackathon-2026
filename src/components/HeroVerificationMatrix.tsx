"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Lock,
  Wallet,
} from "lucide-react";

type ScenarioKey = "pass" | "partial" | "revision";

interface Scenario {
  title: string;
  badge: string;
  badgeColor: string;
  overallScore: number;
  gitCommit: string;
  branch: string;
  deliverablesCount: number;
  aiSummary: string;
  criteria: {
    id: string;
    label: string;
    status: "satisfied" | "warning" | "missing";
    confidence: number;
    explanation: string;
  }[];
  canPay: boolean;
  recommendation: string;
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  pass: {
    title: "Milestone 2: Frontend & PayPal Sandbox Integration",
    badge: "92% AI Verified • Ready for Approval",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    overallScore: 92,
    gitCommit: "commit a9f4e2d",
    branch: "feat/paypal-orders-api",
    deliverablesCount: 4,
    aiSummary:
      "All primary acceptance criteria have been verified against the Next.js frontend code and sandbox route handlers. Unit test suites for checkout routing passed with 94% coverage.",
    criteria: [
      {
        id: "c1",
        label: "Next.js App Router PayPal Orders API Route (/api/paypal/create-order)",
        status: "satisfied",
        confidence: 99,
        explanation: "Server route exists, securely uses server credentials, and handles sandbox intent correctly.",
      },
      {
        id: "c2",
        label: "Client-side PayPal Buttons component with dynamic amount prop (₹15,000)",
        status: "satisfied",
        confidence: 96,
        explanation: "Component renders standard PayPal container with currency validation in place.",
      },
      {
        id: "c3",
        label: "Capture payment endpoint & transaction database recording handler",
        status: "satisfied",
        confidence: 91,
        explanation: "Captures authorization tokens and returns sanitized transaction reference to client.",
      },
      {
        id: "c4",
        label: "Negative test scenario handling (payment decline / window closed)",
        status: "warning",
        confidence: 82,
        explanation: "Basic toast alert implemented; recommended to add persistent retry state for network timeouts.",
      },
    ],
    canPay: true,
    recommendation: "Deliverable satisfies agreed scope. Safe for client release.",
  },
  partial: {
    title: "Milestone 2: Frontend & PayPal Sandbox Integration",
    badge: "68% AI Verified • Missing Deliverables",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    overallScore: 68,
    gitCommit: "commit 38b109e",
    branch: "wip/checkout-ui-draft",
    deliverablesCount: 2,
    aiSummary:
      "Frontend UI layout is complete, but backend capture route and PayPal webhook listeners were not located in the repository PR.",
    criteria: [
      {
        id: "c1",
        label: "Client-side PayPal Buttons component styling & responsive design",
        status: "satisfied",
        confidence: 95,
        explanation: "Visual styling matches agreed Figma specifications on mobile and desktop.",
      },
      {
        id: "c2",
        label: "Server-side Order Capture route (/api/paypal/capture-order)",
        status: "missing",
        confidence: 98,
        explanation: "Endpoint missing. Client-side button currently calls a mock timeout without sandbox capture.",
      },
      {
        id: "c3",
        label: "Webhook listener for PAYMENT.CAPTURE.COMPLETED events",
        status: "missing",
        confidence: 94,
        explanation: "No webhook signature verification route detected in /src/app/api/webhooks.",
      },
      {
        id: "c4",
        label: "Negative test scenario handling",
        status: "warning",
        confidence: 65,
        explanation: "Unhandled exception occurs when checkout popup is dismissed without paying.",
      },
    ],
    canPay: false,
    recommendation: "Hold milestone approval. Request freelancer to implement missing capture route.",
  },
  revision: {
    title: "Milestone 2: Frontend & PayPal Sandbox Integration",
    badge: "41% AI Verified • Major Revisions Required",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    overallScore: 41,
    gitCommit: "commit d20a811",
    branch: "feat/partial-mockups",
    deliverablesCount: 1,
    aiSummary:
      "Submitted deliverable contains static UI mockups only. Core functional requirements (PayPal SDK integration, server routes, acceptance criteria) are not yet implemented.",
    criteria: [
      {
        id: "c1",
        label: "PayPal SDK integration and client-side button triggers",
        status: "missing",
        confidence: 99,
        explanation: "Only a static image placeholder button found. No official SDK loaded.",
      },
      {
        id: "c2",
        label: "Backend order generation & capture API routes",
        status: "missing",
        confidence: 99,
        explanation: "No backend routes authored in this submission.",
      },
      {
        id: "c3",
        label: "Acceptance criteria documentation and test runs",
        status: "missing",
        confidence: 95,
        explanation: "No test suites provided.",
      },
    ],
    canPay: false,
    recommendation: "Reject submission. Issue milestone revision notice to freelancer.",
  },
};

export default function HeroVerificationMatrix() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("pass");
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai-report" | "submission-files">("ai-report");

  const scenario = SCENARIOS[scenarioKey];

  const handleSimulatePayment = () => {
    if (!scenario.canPay) return;
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      setPaidSuccess(true);
    }, 1800);
  };

  const handleResetScenario = (key: ScenarioKey) => {
    setScenarioKey(key);
    setPaidSuccess(false);
    setIsSimulatingPayment(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-slate-800 bg-[#0A0F1D]/90 p-4 sm:p-6 shadow-2xl shadow-black/80 backdrop-blur-2xl">
      {/* Matrix Header & Scenario Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="h-3 w-3" />
              Acceptance Verification Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Milestone #2 of 4 • $1,400 USD
            </span>
          </div>
        </div>

        {/* Scenario Switcher Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <span className="text-slate-400 px-2 hidden lg:inline">Deliverable Scenarios:</span>
          <button
            onClick={() => handleResetScenario("pass")}
            className={`px-2.5 py-1 rounded transition-colors ${
              scenarioKey === "pass"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Verified (92%)
          </button>
          <button
            onClick={() => handleResetScenario("partial")}
            className={`px-2.5 py-1 rounded transition-colors ${
              scenarioKey === "partial"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Missing Work (68%)
          </button>
          <button
            onClick={() => handleResetScenario("revision")}
            className={`px-2.5 py-1 rounded transition-colors ${
              scenarioKey === "revision"
                ? "bg-rose-500 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Revision (41%)
          </button>
        </div>
      </div>

      {/* Main Matrix Body: Left Submission Meta & Right AI Verification Panel */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Freelancer Deliverable Submission Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
              <span className="font-semibold text-slate-300">Freelancer Submission</span>
              <span className="font-mono text-emerald-400">v2.1 Submitted</span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded bg-slate-950/60 p-2 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-sky-400" />
                  Branch
                </span>
                <span className="font-mono text-slate-200 truncate max-w-[150px]">
                  {scenario.branch}
                </span>
              </div>

              <div className="flex items-center justify-between rounded bg-slate-950/60 p-2 border border-slate-800/60">
                <span className="text-slate-400">Git Commit</span>
                <span className="font-mono text-slate-300">{scenario.gitCommit}</span>
              </div>

              <div className="flex items-center justify-between rounded bg-slate-950/60 p-2 border border-slate-800/60">
                <span className="text-slate-400">Escrow Value</span>
                <span className="font-semibold text-white">₹15,000 INR</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Submitted Deliverables
              </span>
              <ul className="mt-1.5 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-1.5 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>/app/api/paypal/create-order/route.ts</span>
                </li>
                <li className="flex items-center gap-1.5 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>/components/PayPalCheckoutModal.tsx</span>
                </li>
                <li className="flex items-center gap-1.5 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>/tests/checkout-flow.spec.ts</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2.5 text-[11px] text-emerald-300 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Funds held in Client balance. Payment releases only upon your verified sign-off.</span>
          </div>
        </div>

        {/* Right Column: AI Verification Matrix & Acceptance Criteria (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div>
            {/* AI Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/20 text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-white">Gemini 2.5 Multi-Modal Audit</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${scenario.badgeColor}`}>
                  {scenario.badge}
                </span>
                <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  Score: {scenario.overallScore}%
                </span>
              </div>
            </div>

            {/* AI Synthesis Summary */}
            <div className="mt-3 rounded-lg bg-slate-950/70 p-3 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-100">AI Evaluation: </span>
              {scenario.aiSummary}
            </div>

            {/* Criteria Checklist */}
            <div className="mt-3 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Acceptance Criteria Verification</span>
                <span>Audit Status</span>
              </div>

              {scenario.criteria.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-lg border border-slate-800/70 bg-slate-950/50 p-2.5 transition-colors hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {item.status === "satisfied" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      )}
                      {item.status === "warning" && (
                        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      )}
                      {item.status === "missing" && (
                        <ShieldAlert className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-medium text-slate-200">
                          {item.label}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                          {item.explanation}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded shrink-0 uppercase tracking-tight ${
                        item.status === "satisfied"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "warning"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer: Decision & PayPal Checkout Trigger */}
          <div className="pt-3 border-t border-slate-800/80">
            {paidSuccess ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span>Payment Captured via PayPal Sandbox!</span>
                </div>
                <p className="mt-1 text-xs text-slate-300 font-mono">
                  TxID: PAYPAL-SBX-ORD-99412 • ₹15,000 transferred to Freelancer Wallet
                </p>
                <div className="mt-2.5 flex items-center justify-center gap-3">
                  <span className="text-[11px] text-slate-400">Milestone 2 status:</span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    COMPLETED & PAID
                  </span>
                  <button
                    onClick={() => setPaidSuccess(false)}
                    className="text-xs text-slate-400 hover:text-white underline ml-2 cursor-pointer"
                  >
                    Test Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Recommendation: </span>
                  {scenario.recommendation}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!scenario.canPay ? (
                    <button
                      onClick={() => alert("Revision Request Sent to Freelancer with Gemini feedback notes!")}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
                    >
                      Request Revisions (AI Assisted)
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => alert("Revision feedback modal triggered.")}
                        className="px-3 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={handleSimulatePayment}
                        disabled={isSimulatingPayment}
                        className="relative flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0070BA] to-[#003087] hover:from-[#0079C1] hover:to-[#0040A8] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-900/30 transition-all active:scale-[0.98] disabled:opacity-60"
                      >
                        {isSimulatingPayment ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Contacting PayPal Sandbox...</span>
                          </>
                        ) : (
                          <>
                            <Wallet className="h-3.5 w-3.5 text-sky-200" />
                            <span>Approve & Release ₹15,000 via PayPal</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
