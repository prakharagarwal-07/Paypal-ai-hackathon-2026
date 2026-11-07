import Link from "next/link";
import Navbar from "@/components/Navbar";
import HeroVerificationMatrix from "@/components/HeroVerificationMatrix";
import WorkflowSection from "@/components/WorkflowSection";
import MilestoneCalculator from "@/components/MilestoneCalculator";
import FeaturesGrid from "@/components/FeaturesGrid";
import PayPalArchitectureSection from "@/components/PayPalArchitectureSection";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
  Bot,
  Wallet,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle atmospheric glow behind hero */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />

          <div className="mx-auto max-w-7xl">
            {/* Top Pill Announcement */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300 backdrop-blur-md shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">PayPal AI Hackathon 2026</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Gemini 2.5 + PayPal Orders API</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="mt-8 text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                Work completed. <br className="hidden sm:inline" />
                Progress verified. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  Payments made with confidence.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
                The milestone-based platform where freelancers submit deliverables, Gemini AI audits work against locked acceptance criteria, and clients release PayPal payouts with total trust.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/auth?mode=signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 active:scale-[0.98]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-colors"
                >
                  <span>Explore How It Works</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  PayPal Sandbox Integrated
                </span>
                <span className="flex items-center gap-1.5">
                  <Bot className="h-4 w-4 text-sky-400" />
                  Gemini Structured Audits
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  Client-Approved Escrow Releases
                </span>
              </div>
            </div>

            {/* Interactive Hero Verification Matrix */}
            <div className="mt-14 sm:mt-18">
              <HeroVerificationMatrix />
            </div>
          </div>
        </section>

        {/* WORKFLOW 3-STEP SECTION */}
        <WorkflowSection />

        {/* INTERACTIVE MILESTONE CALCULATOR */}
        <MilestoneCalculator />

        {/* DETAILED CAPABILITIES & FEATURES GRID */}
        <FeaturesGrid />

        {/* PAYPAL SANDBOX ARCHITECTURE */}
        <PayPalArchitectureSection />

        {/* CLOSING CONVERSION CTA */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-gradient-to-b from-[#0A0F1D] to-[#06080F]">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-[#0C1326]/90 p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            {/* Background accent */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="h-3.5 w-3.5" />
              Ready for Testing & Judging
            </span>

            <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Transform Project Milestones Into <br className="hidden sm:inline" />
              Verified PayPal Settlements
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Experience the dual workspace for clients and freelancers. Eliminate dispute risks with AI-verified criteria audits and secure PayPal developer checkout.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/auth?mode=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <span>Launch Client or Freelancer Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/auth?mode=login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-colors"
              >
                <span>Sign In with Demo Account</span>
              </Link>
            </div>

            <p className="mt-6 text-[11px] text-slate-500 font-mono">
              Demo accounts pre-configured for PayPal Hackathon Judges • Instant Access
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
