import Link from "next/link";
import Navbar from "@/components/Navbar";
import SimpleInteractiveDemo from "@/components/SimpleInteractiveDemo";
import WorkflowSection from "@/components/WorkflowSection";
import MilestoneCalculator from "@/components/MilestoneCalculator";
import WhoItsFor from "@/components/WhoItsFor";
import Footer from "@/components/Footer";
import WebThreadsController from "@/components/WebThreadsController";
import ScrollReveal from "@/components/ScrollReveal";
import HeroTextFlyIn from "@/components/HeroTextFlyIn";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#F8FAFD] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Interactive WebThreads background with live visualizer control panel */}
      <WebThreadsController />

      {/* AMBIENT FLANK LIGHTING: Softly frames the left and right margins, eliminating stark empty whiteness */}
      <div className="fixed inset-y-0 left-0 w-72 sm:w-96 bg-gradient-to-r from-sky-200/20 via-sky-100/10 to-transparent pointer-events-none z-0 dark:from-sky-900/10 dark:via-sky-950/5 dark:to-transparent" />
      <div className="fixed inset-y-0 right-0 w-72 sm:w-96 bg-gradient-to-l from-emerald-200/20 via-teal-100/10 to-transparent pointer-events-none z-0 dark:from-emerald-900/10 dark:via-emerald-950/5 dark:to-transparent" />
      <div className="fixed top-0 inset-x-0 h-40 bg-gradient-to-b from-sky-100/25 via-slate-50/10 to-transparent pointer-events-none z-0 dark:from-sky-950/20 dark:to-transparent" />

      <Navbar />

      <main className="relative z-10 flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Broad, gentle ambient radiance covering widescreen displays */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] max-w-full h-[550px] bg-gradient-to-tr from-emerald-200/35 via-sky-200/30 to-teal-100/25 dark:from-emerald-400/15 dark:via-sky-400/15 dark:to-indigo-500/10 blur-[100px] pointer-events-none -z-10" />

          <div className="mx-auto max-w-5xl text-center">
            {/* DYNAMIC SCROLL FLY-IN HERO INTRO TEXT */}
            <div>
              <HeroTextFlyIn />
            </div>

            {/* Plain English Subtitle that anyone can understand */}
            <ScrollReveal direction="up" delay={420} distance={28}>
              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed backdrop-blur-[2px]">
                MilestoneOS lets you pay freelancers in safe stages. Before any money moves, AI checks that the work matches what was promised—so clients never get burned, and freelancers always get paid on time.
              </p>
            </ScrollReveal>

            {/* Action Buttons */}
            <ScrollReveal direction="up" delay={520} distance={24}>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/auth?mode=signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start for Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/90 bg-white/90 hover:bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 dark:text-white dark:hover:bg-slate-800 transition-colors backdrop-blur-md"
                >
                  <span>See How It Works</span>
                </Link>
              </div>
            </ScrollReveal>

            {/* Trust Points - Clean, Natural Language without AI pill capsules */}
            <ScrollReveal direction="up" delay={620} distance={20}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Secure PayPal Payments
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Automatic Work Review
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Pay Only When Satisfied
                </span>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 1. THREE SIMPLE STEPS (HOW IT WORKS) */}
        <WorkflowSection />

        {/* 2. SEE IT IN ACTION (INTERACTIVE DEMO) - DIRECTLY BELOW HOW IT WORKS */}
        <section id="demo" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-transparent backdrop-blur-[2px] transition-colors">
          <div className="mx-auto max-w-5xl">
            <ScrollReveal direction="up" delay={50}>
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  See It In Action
                </h2>
                <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                  Try this live milestone simulator. Toggle between completed and missing work to see how payments stay protected before any money moves.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={150}>
              <SimpleInteractiveDemo />
            </ScrollReveal>
          </div>
        </section>

        {/* 3. INTERACTIVE MILESTONE CALCULATOR */}
        <MilestoneCalculator />

        {/* 4. FOR CLIENTS & FREELANCERS */}
        <WhoItsFor />

        {/* FRIENDLY CLOSING CTA */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/50 via-teal-50/20 to-transparent dark:bg-white/[0.03] backdrop-blur-[2px] transition-colors">
          <ScrollReveal direction="up" delay={100}>
            <div className="mx-auto max-w-3xl text-center rounded-3xl border border-emerald-200/80 bg-white/85 p-8 sm:p-12 shadow-xl shadow-emerald-500/5 dark:border-slate-800 dark:bg-[#131B2E]/90 backdrop-blur-md">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Ready to Protect Your Next Project?
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                Join clients and freelancers who build and get paid with total confidence.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/auth?mode=signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth?mode=login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <span>Explore Demo Account</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
