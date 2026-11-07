import { User, Briefcase, Check } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function WhoItsFor() {
  return (
    <section id="benefits" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/[0.03] dark:bg-white/[0.03] backdrop-blur-[2px] transition-colors">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Peace of Mind for Both Sides
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Clients don't get ghosted. Freelancers don't get underpaid.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Card */}
          <ScrollReveal direction="left" delay={150} className="h-full">
            <div className="h-full rounded-3xl border border-sky-200/90 bg-white/90 p-8 shadow-xl shadow-sky-100/50 dark:border-sky-500/20 dark:bg-[#131B2E]/90 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      If You Are Hiring
                    </h3>
                    <span className="text-xs text-sky-700 dark:text-sky-300 font-semibold">
                      For Clients & Business Owners
                    </span>
                  </div>
                </div>

                <ul className="mt-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span><strong>Never pay 100% upfront:</strong> Pay in safe, bite-sized amounts as each stage is finished.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span><strong>No tech skills needed:</strong> AI inspects the work for you and alerts you if anything is missing.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span><strong>You stay in control:</strong> No payment is sent until you look at the work and tap Approve.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-sky-100 dark:border-sky-500/20 text-xs font-bold text-sky-700 dark:text-sky-300">
                ✓ You only pay for real, verified results
              </div>
            </div>
          </ScrollReveal>

          {/* Freelancer Card */}
          <ScrollReveal direction="right" delay={250} className="h-full">
            <div className="h-full rounded-3xl border border-emerald-200/90 bg-white/90 p-8 shadow-xl shadow-emerald-100/50 dark:border-emerald-500/20 dark:bg-[#131B2E]/90 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      If You Are Working
                    </h3>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                      For Freelancers & Contractors
                    </span>
                  </div>
                </div>

                <ul className="mt-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span><strong>Regular cashflow:</strong> Get paid as each milestone is completed instead of waiting months.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span><strong>Protected from scope creep:</strong> Clear agreed checklists prevent clients from demanding free extra work.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span><strong>Fast PayPal payouts:</strong> Money is deposited directly to your PayPal account upon approval.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-emerald-100 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                ✓ Guaranteed payouts for your hard work
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
