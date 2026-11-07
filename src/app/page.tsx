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
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* 
        FIXED FULL-PAGE WEBTHREADS BACKGROUND:
        Stays fixed in the viewport across the ENTIRE landing page as the user scrolls!
      */}
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none opacity-60 dark:opacity-75">
        <WebThreads
          colors={["#00E599", "#0070BA", "#38BDF8", "#10B981", "#6366F1"]}
          coreColor="#FFFFFF"
          threadCount={8}
          speed={0.16}
          frequency={4.2}
          spread={0.24}
          position={0.48}
          glow={0.035}
          brightness={0.82}
          thickness={1.15}
          fade={0.12}
          mouseInteraction={true}
          pulseOnClick={true}
        />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle ambient blur glow */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-gradient-to-tr from-emerald-400/20 via-sky-400/20 to-indigo-500/10 blur-3xl pointer-events-none -z-10" />

          <div className="mx-auto max-w-5xl text-center">
            {/* Friendly Badge flies in */}
            <ScrollReveal direction="down" delay={100}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-white/85 dark:bg-emerald-500/15 dark:border-emerald-500/30 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>PayPal AI Hackathon 2026 Project</span>
              </div>
            </ScrollReveal>

            {/* DYNAMIC SCROLL FLY-IN HERO INTRO TEXT */}
            <div className="mt-6">
              <HeroTextFlyIn />
            </div>

            {/* Plain English Subtitle flies in */}
            <ScrollReveal direction="up" delay={420} distance={28}>
              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed backdrop-blur-[2px]">
                MilestoneOS splits freelance projects into safe milestone payments. AI inspects submitted deliverables against agreed checklists so clients pay with confidence and freelancers get paid on time.
              </p>
            </ScrollReveal>

            {/* Action Buttons fly in */}
            <ScrollReveal direction="up" delay={520} distance={24}>
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

            {/* Trust Badges fly in */}
            <ScrollReveal direction="up" delay={620} distance={20}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  PayPal Sandbox Integrated
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Gemini AI Acceptance Audit
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Client Retains Full Payment Approval
                </span>
              </div>
            </ScrollReveal>

            {/* Clean Interactive Demo Component flies in */}
            <ScrollReveal direction="up" delay={720} distance={40} className="mt-12">
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
            <div className="mx-auto max-w-3xl text-center rounded-3xl border border-emerald-200/80 bg-white/85 p-8 sm:p-12 shadow-xl shadow-emerald-500/5 dark:border-slate-800 dark:bg-[#131B2E]/90 backdrop-blur-md">
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
