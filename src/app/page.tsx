import Link from "next/link";
import Navbar from "@/components/Navbar";
import SimpleInteractiveDemo from "@/components/SimpleInteractiveDemo";
import WorkflowSection from "@/components/WorkflowSection";
import MilestoneCalculator from "@/components/MilestoneCalculator";
import WhoItsFor from "@/components/WhoItsFor";
import Footer from "@/components/Footer";
import WebThreads from "@/components/WebThreads";
import ScrollReveal from "@/components/ScrollReveal";
import HeroTextFlyIn from "@/components/HeroTextFlyIn";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-100/60 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* 
        CALM, SUBTLE FULL-PAGE WEBTHREADS BACKGROUND:
        Tuned down brightness & glow so it remains elegant, ambient, and never overwhelms the text!
      */}
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none opacity-35 dark:opacity-50">
        <WebThreads
          colors={["#059669", "#0070BA", "#0284C7", "#10B981", "#4F46E5"]}
          coreColor="#BAE6FD"
          threadCount={7}
          speed={0.14}
          frequency={3.8}
          spread={0.25}
          position={0.5}
          glow={0.015}
          brightness={0.42}
          thickness={0.9}
          fade={0.22}
          mouseInteraction={true}
          pulseOnClick={true}
        />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Central Contrast Shield: soft ambient diffuser that ensures text is 100% readable */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[720px] h-[460px] bg-white/70 dark:bg-[#0B0F19]/80 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="mx-auto max-w-5xl text-center">
            {/* Friendly Badge */}
            <ScrollReveal direction="down" delay={100}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-white/90 dark:bg-emerald-500/15 dark:border-emerald-500/30 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>PayPal AI Hackathon 2026 Project</span>
              </div>
            </ScrollReveal>

            {/* DYNAMIC SCROLL FLY-IN HERO INTRO TEXT (High Contrast) */}
            <div className="mt-6">
              <HeroTextFlyIn />
            </div>

            {/* Plain English Subtitle with readable frosted glass plate */}
            <ScrollReveal direction="up" delay={420} distance={24}>
              <div className="mt-6 max-w-2xl mx-auto">
                <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-white/75 dark:bg-slate-900/70 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/80 dark:border-slate-800/80 shadow-sm">
                  MilestoneOS splits freelance projects into safe milestone payments. AI inspects submitted deliverables against agreed checklists so clients pay with confidence and freelancers get paid on time.
                </p>
              </div>
            </ScrollReveal>

            {/* Action Buttons */}
            <ScrollReveal direction="up" delay={520} distance={20}>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/auth?mode=signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/90 bg-white/90 hover:bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 dark:text-white dark:hover:bg-slate-800 transition-colors backdrop-blur-md"
                >
                  <span>Try Live Demo</span>
                </Link>
              </div>
            </ScrollReveal>

            {/* Trust Badges */}
            <ScrollReveal direction="up" delay={620} distance={16}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/85 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  PayPal Sandbox Integrated
                </span>
                <span className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/85 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Gemini AI Acceptance Audit
                </span>
                <span className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/85 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Client Retains Full Payment Approval
                </span>
              </div>
            </ScrollReveal>

            {/* Clean Interactive Demo Component */}
            <ScrollReveal direction="up" delay={700} distance={32} className="mt-12">
              <SimpleInteractiveDemo />
            </ScrollReveal>
          </div>
        </section>

        {/* 3 SIMPLE STEPS */}
        <WorkflowSection />

        {/* INTERACTIVE MILESTONE CALCULATOR */}
        <MilestoneCalculator />

        {/* FOR CLIENTS & FREELANCERS */}
        <WhoItsFor />

        {/* FRIENDLY CLOSING CTA */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-emerald-50/50 dark:bg-gradient-to-b dark:from-[#0E1424]/60 dark:to-[#06080F]/80 backdrop-blur-sm">
          <ScrollReveal direction="up" delay={100}>
            <div className="mx-auto max-w-3xl text-center rounded-3xl border border-emerald-200/80 bg-white/90 p-8 sm:p-12 shadow-xl shadow-emerald-500/5 dark:border-slate-800 dark:bg-[#131B2E]/90 backdrop-blur-md">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Ready to Experience MilestoneOS?
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                Test with pre-configured judge accounts or launch your own workspace in seconds.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/auth?mode=signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth?mode=login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <span>Sign In as Demo Judge</span>
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
