import Link from "next/link";
import Navbar from "@/components/Navbar";
import SimpleInteractiveDemo from "@/components/SimpleInteractiveDemo";
import WorkflowSection from "@/components/WorkflowSection";
import MilestoneCalculator from "@/components/MilestoneCalculator";
import WhoItsFor from "@/components/WhoItsFor";
import Footer from "@/components/Footer";
import { ArrowRight, ShieldCheck, Sparkles, Wallet, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Gentle ambient glow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-emerald-400/15 via-sky-400/15 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="mx-auto max-w-5xl text-center">
            {/* Friendly Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>PayPal AI Hackathon 2026 Project</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Work completed. <br className="hidden sm:inline" />
              Progress verified. <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-[#0070BA] bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400">
                Payments made with confidence.
              </span>
            </h1>

            {/* Plain English Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              MilestoneOS splits freelance projects into safe milestone payments. AI inspects submitted deliverables against agreed checklists so clients pay with confidence and freelancers get paid on time.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-colors"
              >
                <span>Try Live Demo</span>
              </Link>
            </div>

            {/* Simple Trust Points */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                PayPal Sandbox Integrated
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Gemini AI Acceptance Audit
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Client Retains Full Payment Approval
              </span>
            </div>

            {/* Clean Interactive Demo Component */}
            <div className="mt-12">
              <SimpleInteractiveDemo />
            </div>
          </div>
        </section>

        {/* 3 SIMPLE STEPS */}
        <WorkflowSection />

        {/* INTERACTIVE MILESTONE CALCULATOR */}
        <MilestoneCalculator />

        {/* FOR CLIENTS & FREELANCERS */}
        <WhoItsFor />

        {/* FRIENDLY CLOSING CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-emerald-50/40 dark:border-slate-800 dark:bg-gradient-to-b dark:from-[#0E1424] dark:to-[#06080F]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Ready to Experience MilestoneOS?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Test with pre-configured judge accounts or sign up with your own profile.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-500/25 transition-all"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth?mode=login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <span>Sign In as Demo Judge</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
