import { User, Briefcase, Check } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function WhoItsFor() {
  return (
    <section id="benefits" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/30 dark:bg-[#0B0F19]/30 backdrop-blur-sm transition-colors">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Fair for Both Sides
            </span>
            <h2 className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Designed for Trust on Both Ends
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              No more client ghosting. No more freelancers delivering incomplete work.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Card flying in from left */}
          <ScrollReveal direction="left" delay={150} className="h-full">
            <div className="h-full rounded-3xl border border-sky-200/90 bg-white/90 p-8 shadow-xl shadow-sky-100/50 dark:border-sky-500/20 dark:bg-[#131B2E]/90 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      For Clients
                    </h3>
                    <span className="text-xs text-sky-700 dark:text-sky-300 font-semibold">
                      Total Payment Control
                    </span>
                  </div>
                </div>

                <ul className="mt-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>Never pay 100% upfront to an unknown freelancer.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>AI automatically highlights missing or incomplete deliverables.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>Release payouts in one click using official PayPal Checkout.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-sky-100 dark:border-sky-500/20 text-xs font-bold text-sky-700 dark:text-sky-300">
                ✓ You retain final decision on every payment
              </div>
            </div>
          </ScrollReveal>

          {/* Freelancer Card flying in from right */}
          <ScrollReveal direction="right" delay={250} className="h-full">
            <div className="h-full rounded-3xl border border-emerald-200/90 bg-white/90 p-8 shadow-xl shadow-emerald-100/50 dark:border-emerald-500/20 dark:bg-[#131B2E]/90 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      For Freelancers
                    </h3>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                      Guaranteed Payout Cashflow
                    </span>
                  </div>
                </div>

                <ul className="mt-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>Get paid regularly as milestones are finished—no more waiting months.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>Clear agreed criteria protect you from endless free revisions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>Instant deposit to your PayPal wallet upon milestone approval.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-emerald-100 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                ✓ Protected by objective criteria verification
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
