import {
  ShieldCheck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Server,
  Lock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function PayPalArchitectureSection() {
  const steps = [
    {
      num: "1",
      title: "Client Approves Work",
      desc: "Client reviews Gemini AI audit and triggers milestone settlement.",
    },
    {
      num: "2",
      title: "Server Generates Order",
      desc: "Next.js backend calls PayPal Orders API (/v2/checkout/orders) with currency & milestone ID.",
    },
    {
      num: "3",
      title: "PayPal Checkout Modal",
      desc: "Client authenticates with PayPal Sandbox buyer account and authorizes transaction.",
    },
    {
      num: "4",
      title: "Backend Capture & Verification",
      desc: "Server calls /capture endpoint, validates transaction status == COMPLETED.",
    },
    {
      num: "5",
      title: "Milestone Paid & Stamped",
      desc: "Database updates milestone to PAID and records permanent PayPal capture ID.",
    },
  ];

  return (
    <section id="paypal-workflow" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#080B12]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-[#0070BA]/10 text-[#38BDF8] border border-[#0070BA]/30">
            <CreditCard className="h-3.5 w-3.5" />
            Official PayPal Developer Platform
          </div>
          <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Engineered on PayPal Sandbox & Orders v2
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            PayPal is not a mock button or an afterthought in MilestoneOS. Our architecture implements an end-to-end verified server-side payment lifecycle.
          </p>
        </div>

        {/* 5-Step Visual Flow */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((st, i) => (
            <div
              key={st.num}
              className="relative rounded-xl border border-slate-800 bg-[#0C1222]/90 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0070BA]/20 text-sky-400 font-mono text-xs font-bold border border-[#0070BA]/30">
                    {st.num}
                  </span>
                  {i < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-slate-600 hidden md:inline" />
                  )}
                </div>
                <h4 className="mt-4 text-sm font-bold text-white leading-snug">
                  {st.title}
                </h4>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Architecture Callout Box */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-[#0B1528]/80 to-slate-900/90 p-6 sm:p-8 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  <Server className="h-4 w-4" />
                  Security Standard
                </div>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Server-Side Secret Isolation
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  PayPal Client Secret and Gemini API keys are never bundled in frontend JavaScript. All token handshakes and capture calls occur securely in isolated Next.js Server Components and Route Handlers.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Zero Client Credential Leakage
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  <AlertCircle className="h-4 w-4" />
                  Real Marketplace Notice
                </div>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Escrow & Multiparty Payouts
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Standard PayPal Checkout processes merchant-to-buyer transactions. In MilestoneOS, we model milestone-based holding and document how production scaling utilizes PayPal Multiparty or Payouts API.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span>Documented in RESEARCH.md</span>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle className="h-4 w-4" />
                  Testing Capabilities
                </div>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Negative Scenario Testing
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Supports simulated card declines, insufficient funds, expired authorization windows, and network timeout retries using PayPal Sandbox negative testing headers.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-mono text-sky-400 flex items-center gap-1.5">
                <span>PayPal-Mock-Response: 200 / 422</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
