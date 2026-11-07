"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, CreditCard, Sparkles, ArrowRight, X, Check, ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function WorkflowSection() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  // Close on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedStep(null);
      }
    };
    if (selectedStep !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
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
        "Zero technical knowledge needed—the AI gives you simple advice.",
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
              No stress, no misunderstandings, and no lost money. Click any box below to see the details.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Clean Info Boxes (Only Titles & Click to View Prompt) */}
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
                  className="group cursor-pointer h-full rounded-3xl border border-slate-200/90 bg-white/90 p-7 sm:p-8 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.02] hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all duration-300 dark:border-slate-800/90 dark:bg-[#131B2E]/90 dark:shadow-none backdrop-blur-md flex flex-col justify-between"
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

                    {/* Big Clean Title (No small elaborate paragraph) */}
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
        ENLARGED BOX + SIDE FLY-IN TEXT:
        - The whole screen blurs out.
        - The selected box is enlarged on the left.
        - The info text FLIES IN FROM THE FAR RIGHT EDGE OF THE SCREEN to the side of the box!
      */}
      {activeStepData && selectedStep !== null && (
        <div
          onClick={() => setSelectedStep(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md overflow-hidden transition-all duration-300"
        >
          {/* Main Container: Selected Box on the Left, Flying Text on the Right */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-6 max-w-4xl w-full"
          >
            {/* 
              LEFT PANEL: THE ENLARGED BOX
              Stays clean and prominent
            */}
            <div className="w-full lg:w-[340px] shrink-0 rounded-3xl border-2 border-emerald-400/80 bg-white p-7 sm:p-8 shadow-2xl dark:border-emerald-500/80 dark:bg-[#131B2E] flex flex-col justify-between transition-transform duration-300 scale-100">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl font-mono text-base font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    {activeStepData.step}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${activeStepData.color}`}>
                    {activeStepData.tag}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {activeStepData.title}
                </h3>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Active Stage
                </span>
                <span className="text-[11px] text-slate-400">
                  Step {activeStepData.step} of 03
                </span>
              </div>
            </div>

            {/* 
              RIGHT PANEL: THE INFO TEXT
              FLIES ACROSS FROM THE FAR RIGHT EDGE OF THE SCREEN TO THE SIDE OF THE BOX!
            */}
            <div
              key={activeStepData.step}
              className="animate-fly-from-right-edge flex-1 rounded-3xl border border-slate-200/90 bg-white/95 p-7 sm:p-9 shadow-2xl dark:border-slate-800/90 dark:bg-[#131B2E]/95 backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                {/* Header with Title and Close X */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Stage Details
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedStep(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                    aria-label="Close details"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Main Explanation Text */}
                <p className="mt-5 text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {activeStepData.description}
                </p>

                {/* Key Bullet Points */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    What happens at this stage:
                  </h4>
                  <ul className="space-y-3">
                    {activeStepData.details.map((detail, dIdx) => (
                      <li
                        key={dIdx}
                        className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="leading-snug">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation Controls at Bottom */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStep(selectedStep - 1)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </button>
                  )}
                  {selectedStep < steps.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStep(selectedStep + 1)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStep(null)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
