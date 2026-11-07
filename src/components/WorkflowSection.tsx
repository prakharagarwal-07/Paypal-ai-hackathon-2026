import { CheckCircle2, ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function WorkflowSection() {
  const steps = [
    {
      step: "01",
      title: "Set Your Milestones",
      desc: "Split the project into smaller, manageable goals with clear prices. No confusion about what is expected.",
      tag: "Clear Scope",
      icon: Sparkles,
      color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    },
    {
      step: "02",
      title: "AI Verifies the Work",
      desc: "When the freelancer submits work, Gemini AI checks it against the agreed checklist and flags missing items.",
      tag: "Objective Proof",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    },
    {
      step: "03",
      title: "Pay Safely via PayPal",
      desc: "The client reviews the AI report and clicks Pay. PayPal captures the transaction securely and deposits it.",
      tag: "Guaranteed Payout",
      icon: CreditCard,
      color: "bg-sky-50 text-[#0070BA] border-sky-200 dark:bg-[#0070BA]/10 dark:text-sky-300 dark:border-[#0070BA]/30",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-[#0E1424]/40 backdrop-blur-sm transition-colors">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              How It Works
            </span>
            <h2 className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Three Simple Steps to Fair Payments
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Freelancers get paid for real progress. Clients only pay for verified work.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <ScrollReveal
                key={s.step}
                direction="up"
                delay={100 + idx * 150}
                className="h-full"
              >
                <div className="h-full rounded-3xl border border-slate-200/90 bg-white/90 p-7 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all dark:border-slate-800/90 dark:bg-[#131B2E]/90 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl font-mono text-sm font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {s.step}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
                        {s.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Transparent & Automated</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
