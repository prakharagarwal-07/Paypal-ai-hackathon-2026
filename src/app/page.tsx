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
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* 
        FIXED FULL-PAGE WEBTHREADS BACKGROUND:
        Restored original vibrant colors & full presence, with glow decreased just by a little!
      */}
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none opacity-80 dark:opacity-90">
        <WebThreads
          colors={["#00E599", "#0070BA", "#38BDF8", "#10B981", "#6366F1"]}
          coreColor="#FFFFFF"
          threadCount={8}
          speed={0.16}
          frequency={4.2}
          spread={0.24}
          position={0.48}
          glow={0.026}
          brightness={0.86}
          thickness={1.1}
          fade={0.12}
          mouseInteraction={true}
          pulseOnClick={true}
        />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Gentle ambient glow */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-gradient-to-tr from-emerald-400/20 via-sky-400/20 to-indigo-500/10 blur-3xl pointer-events-none -z-10" />

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
                  href="#demo"
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

            {/* Clean Interactive Demo Component */}
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
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white/20 dark:bg-transparent backdrop-blur-[1px] transition-colors">
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
