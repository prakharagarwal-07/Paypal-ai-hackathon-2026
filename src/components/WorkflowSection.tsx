"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, CreditCard, Sparkles, ArrowRight, X, Check, ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function WorkflowSection() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedStep(null);
      }
    };
    if (selectedStep !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedStep]);

  const steps = [
    {
      step: "01",
      title: "Agree on Stages & Prices",
      tag: "Clear Plan",
      icon: Sparkles,
      color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      description:
        "Instead of paying everything upfront, divide the project into clear stages (like Design, Pages, and Launch) with a fair price for each.",
      details: [
        "Lock in exact deliverables and prices before any work begins.",
        "Eliminates confusing hourly billing and runaway costs.",
        "Both client and freelancer sign off on clear, measurable expectations.",
      ],
    },
    {
      step: "02",
      title: "AI Checks the Finished Work",
      tag: "Automatic Check",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      description:
        "When the freelancer submits their work, our smart assistant scans the files and links against the agreed goals to make sure nothing was missed.",
      details: [
        "Automatically inspects links, designs, and completed files.",
        "Instantly spots if any requirement is incomplete before you pay.",
        "Zero technical knowledge needed—the AI gives you simple, plain-English advice.",
      ],
    },
    {
      step: "03",
      title: "Pay Safely with PayPal",
      tag: "Secure Payment",
      icon: CreditCard,
      color: "bg-sky-50 text-[#0070BA] border-sky-200 dark:bg-[#0070BA]/10 dark:text-sky-300 dark:border-[#0070BA]/30",
      description:
        "Once you're happy with the work, tap Pay. PayPal safely transfers the money. Freelancers get paid on time, and clients only pay for finished work.",
      details: [
        "Official PayPal Checkout integration protects both parties.",
        "Money only transfers when you personally tap Approve.",
        "Instant payment confirmation and permanent digital receipts.",
      ],
    },
  ];

  const activeStepData = selectedStep !== null ? steps[selectedStep] : null;

  // Forward scroll wheel to background window even when hovering directly over the stationary card
  const handlePassThroughWheel = (e: React.WheelEvent) => {
    window.scrollBy({ top: e.deltaY, behavior: "auto" });
  };

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
              No stress, no misunderstandings, and no lost money. Click any box below to see how it works.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Clean Info Boxes (Clean titles only) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            return (
              <ScrollReveal
                key={s.step}
                direction="up"
                delay={100 + idx * 150}
                className="h-full"
              >
                <div
                  onClick={() => setSelectedStep(idx)}
                  className={`group cursor-pointer h-full rounded-3xl border p-7 sm:p-8 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-md flex flex-col justify-between ${
                    selectedStep === idx
                      ? "border-emerald-400 bg-white ring-2 ring-emerald-400/30 dark:bg-[#131B2E]"
                      : "border-slate-200/90 bg-white/90 hover:border-emerald-300 dark:border-slate-800/90 dark:bg-[#131B2E]/90 dark:shadow-none"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedStep(idx);
                    }
                  }}
                >
                  <div>
                    {/* Top Step Number and Tag */}
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl font-mono text-sm font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-500/20 dark:group-hover:text-emerald-400 transition-colors">
                        {s.step}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
                        {s.tag}
                      </span>
                    </div>

                    {/* Big Clean Title */}
                    <h3 className="mt-7 text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {s.title}
                    </h3>
                  </div>

                  {/* Interactive Cue: Click to View Details */}
                  <div className="mt-10 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Click to view details</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* 
        STATIONARY SPOTLIGHT SHOWCASE:
        - Box area stays STATIONARY in the center of the screen.
        - Background page continues to scroll freely up and down!
        - Soft ambient backdrop dims and blurs the background while letting you see it moving.
      */}
      {activeStepData && selectedStep !== null && (
        <>
          {/* 
            Soft Backdrop Veil:
            Dimmable focus layer that DOES NOT BLOCK mouse scrolling.
            Clicks on the backdrop close the spotlight.
          */}
          <div
            onClick={() => setSelectedStep(null)}
            className="fixed inset-0 z-40 bg-slate-950/45 dark:bg-black/60 backdrop-blur-[6px] transition-opacity duration-300 cursor-pointer"
          />

          {/* 
            STATIONARY SPOTLIGHT CONTAINER:
            Remains fixed/stationary in the center of the viewport until closed!
          */}
          <div
            onWheel={handlePassThroughWheel}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-4 sm:px-6 pointer-events-auto"
          >
            {/* Spotlight Card with blurred dark aura container */}
            <div className="relative rounded-3xl border border-slate-700/80 bg-slate-950/90 dark:bg-black/92 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
              {/* Top-Right Quick Dismiss Button */}
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedStep(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                  aria-label="Close"
                >
                  <span>Close</span>
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Side-by-Side Flex Layout */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-7 lg:gap-12">
                {/* 
                  LEFT PANEL: THE ENLARGED WHITE BOX
                  Stationary and prominent
                */}
                <div className="w-full lg:w-[320px] shrink-0 rounded-3xl border border-white/20 bg-white p-7 shadow-2xl dark:border-slate-700 dark:bg-[#131B2E] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl font-mono text-base font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        {activeStepData.step}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${activeStepData.color}`}>
                        {activeStepData.tag}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {activeStepData.title}
                    </h3>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Stage {activeStepData.step} of 03
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Active
                    </span>
                  </div>
                </div>

                {/* 
                  RIGHT SIDE: FREE TEXT (NO BOX CONTAINER)
                  Flies in from the right directly alongside the box!
                */}
                <div
                  key={activeStepData.step}
                  className="animate-free-text flex-1 flex flex-col justify-between space-y-4 text-left py-1"
                >
                  <div>
                    {/* Category Pill */}
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Stage {activeStepData.step} Walkthrough</span>
                    </div>

                    {/* Subheading */}
                    <h4 className="mt-2.5 text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                      {activeStepData.title}
                    </h4>

                    {/* Free Paragraph Text */}
                    <p className="mt-3 text-base sm:text-lg text-slate-100 font-medium leading-relaxed drop-shadow-sm">
                      {activeStepData.description}
                    </p>

                    {/* Free Bullet Points */}
                    <div className="mt-5 space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                        What happens at this stage:
                      </span>
                      {activeStepData.details.map((detail, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-start gap-3 text-sm sm:text-base text-slate-200 drop-shadow-sm"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 shrink-0 mt-0.5">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <span className="leading-snug">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Controls at Bottom */}
                  <div className="pt-5 flex items-center justify-between border-t border-white/10">
                    <div className="flex items-center gap-2">
                      {selectedStep > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedStep(selectedStep - 1)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-emerald-300 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span>Previous</span>
                        </button>
                      )}
                      {selectedStep < steps.length - 1 && (
                        <button
                          type="button"
                          onClick={() => setSelectedStep(selectedStep + 1)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-emerald-300 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                        >
                          <span>Next Stage</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedStep(null)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
