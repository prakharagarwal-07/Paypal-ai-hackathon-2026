import {
  ShieldCheck,
  Users,
  Code2,
  Lock,
  FileCheck2,
  HelpCircle,
  Database,
  Terminal,
  Activity,
  Layers,
} from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Users,
      title: "Dual-Role Dedicated Workspaces",
      tag: "Role-Based Clarity",
      desc: "Clients manage projects, define milestones, and approve payouts. Freelancers view exact acceptance checklists, run pre-flight AI audits, and track earnings.",
    },
    {
      icon: Lock,
      title: "Human-In-The-Loop Security",
      tag: "Strict AI Governance",
      desc: "AI never holds custody or executes automatic transfers. Gemini provides structured evaluation and missing-work detection; the human client retains final approval.",
    },
    {
      icon: ShieldCheck,
      title: "Official PayPal Sandbox Architecture",
      tag: "Payments Integration",
      desc: "Built directly on PayPal Orders v2 with server-side capture verification, sandbox buyer accounts, and negative-testing safeguards.",
    },
    {
      icon: FileCheck2,
      title: "Structured Acceptance Audits",
      tag: "Gemini Intelligence",
      desc: "Evaluates multi-modal deliverables (GitHub PRs, test reports, Figma links) and clearly categorizes items into Satisfied, Missing, or Needs Verification.",
    },
    {
      icon: Activity,
      title: "Anti-Dispute Audit Trail",
      tag: "Permanent Proof",
      desc: "Every milestone agreement, deliverable hash, AI report timestamp, and PayPal capture ID is recorded in an immutable project log.",
    },
    {
      icon: Layers,
      title: "API & Webhook Extensibility",
      tag: "Enterprise Architecture",
      desc: "Engineered with modular webhooks and REST endpoints to integrate finance ledgers, CI/CD pipelines, and automated contract validation.",
    },
  ];

  return (
    <section id="ai-verification" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#0A0E1A]">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Code2 className="h-3.5 w-3.5" />
            Architected for Trust & Scale
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Built for Real Freelancers and Serious Clients
          </h2>
          <p className="mt-3 text-base text-slate-400">
            No generic chatbots or vaporware promises. MilestoneOS is designed around the reality of software engineering contracts and financial settlements.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-800/90 bg-[#0C1222]/80 p-6 sm:p-7 transition-all hover:border-slate-700 hover:bg-[#0F172A]/90 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-emerald-400 group-hover:bg-emerald-500/10 transition-colors border border-slate-700/60">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {item.tag}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Roles Comparison Showcase */}
        <div id="roles" className="mt-20 pt-16 border-t border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Client Perspective Card */}
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-400 border border-sky-500/30">
                  Client Experience
                </span>
                <span className="text-xs text-slate-400 font-mono">Control & Quality</span>
              </div>
              <h3 className="mt-4 text-2xl font-extrabold text-white">
                Never Pay for Unfinished or Incomplete Work
              </h3>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                Break projects into manageable milestones. Before approving payments, receive an objective AI audit highlighting verified items and missing deliverables.
              </p>
              <ul className="mt-5 space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Define clear acceptance criteria with AI drafting assistance</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Inspect PR diffs, Figma prototypes, and test coverage</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Pay milestone tranches with one click via PayPal Checkout</span>
                </li>
              </ul>
            </div>

            {/* Freelancer Perspective Card */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  Freelancer Experience
                </span>
                <span className="text-xs text-slate-400 font-mono">Cashflow & Clarity</span>
              </div>
              <h3 className="mt-4 text-2xl font-extrabold text-white">
                Get Paid Rapidly for Real, Completed Progress
              </h3>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                No more working for months without pay or suffering endless subjective revisions. Deliver work against pre-agreed criteria and unlock guaranteed tranches.
              </p>
              <ul className="mt-5 space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Pre-flight AI review catches missing requirements before submission</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Objective criteria shield you from arbitrary scope creep</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Predictable payments deposited via PayPal upon client sign-off</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
