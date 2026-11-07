import { ShieldCheck, Cpu, CreditCard, ArrowRight, CheckCircle, FileCode, CheckCheck, Eye } from "lucide-react";

export default function WorkflowSection() {
  const steps = [
    {
      step: "01",
      icon: Cpu,
      title: "Define Scoped Milestones & Criteria",
      tagline: "Structured from Day One",
      description:
        "The client sets the deliverables, deadlines, and milestone budgets. MilestoneOS uses Gemini to convert vague requirements into objective, testable acceptance criteria before work begins.",
      features: [
        "Unambiguous scope definition prevents scope creep",
        "Clear deliverable checklist agreed upon by both parties",
        "Configured payout amount locked per milestone tranche",
      ],
      codeSnippet: `// Milestone #1 Agreement
{
  "milestone": "Homepage & Responsive Design",
  "acceptanceCriteria": [
    "Figma design tokens matching Tailwind config",
    "Mobile viewport test (<375px) passing",
    "Clean accessibility audit score >= 90"
  ],
  "payout": "₹10,000 INR"
}`,
    },
    {
      step: "02",
      icon: FileCode,
      title: "Deliver & Multi-Modal AI Audit",
      tagline: "Objective Deliverable Inspection",
      description:
        "The freelancer uploads git commit links, screenshots, or build artifacts. MilestoneOS AI audits the deliverables against the locked criteria, categorizing every requirement into Satisfied, Missing, or Needs Verification.",
      features: [
        "Checks code repos, PR diffs, and test suites",
        "Identifies missing features and provides constructive diff notes",
        "Zero subjective arguments: objective criteria comparison",
      ],
      codeSnippet: `// AI Verification Output
{
  "criteriaEvaluated": 3,
  "satisfied": ["Figma tokens synced", "Mobile viewport responsive"],
  "needsVerification": ["Accessibility contrast on dark buttons"],
  "confidenceScore": 92,
  "clientRecommendation": "Ready for client sign-off"
}`,
    },
    {
      step: "03",
      icon: CreditCard,
      title: "Review & Pay via PayPal Sandbox",
      tagline: "Zero-Risk Human-Controlled Payouts",
      description:
        "The client reviews the AI audit report. If satisfied, one click triggers the PayPal Checkout modal. PayPal captures the transaction, verifies payment status, and stamps the milestone as Paid in real time.",
      features: [
        "Human client retains final decision authority at all times",
        "Direct integration with PayPal Orders v2 Sandbox API",
        "Instant immutable receipt and transaction audit trail",
      ],
      codeSnippet: `// PayPal Sandbox Capture Hook
const order = await paypal.createOrder({
  intent: "CAPTURE",
  purchase_units: [{
    reference_id: "milestone_ms_02",
    amount: { currency_code: "INR", value: "15000.00" }
  }]
});
// Milestone status -> "PAID"`,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#080B12]">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            The Verified Workflow
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Three Steps from Contract to PayPal Payout
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            MilestoneOS replaces ambiguous freelancer contracts with an automated, transparent pipeline combining Gemini criteria analysis with PayPal Developer Platform security.
          </p>
        </div>

        {/* Steps Detailed Flow */}
        <div className="mt-16 space-y-12">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isEven = idx % 2 === 1;
            return (
              <div
                key={item.step}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-slate-800 bg-[#0C1222]/60 p-6 sm:p-10 backdrop-blur-xl ${
                  isEven ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Left Description Column */}
                <div className={`lg:col-span-7 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-mono text-sm font-extrabold border border-emerald-500/20">
                      {item.step}
                    </span>
                    <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                      {item.tagline}
                    </span>
                  </div>

                  <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {item.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Code/Terminal Column */}
                <div className={`lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        milestone_step_{item.step}.json
                      </span>
                    </div>
                    <pre className="mt-3 text-slate-300 text-[11px] leading-relaxed overflow-x-auto">
                      <code>{item.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
