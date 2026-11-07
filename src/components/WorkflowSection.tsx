"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ShieldCheck, CreditCard, Sparkles, ArrowRight, X, Check, ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function WorkflowSection() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Background scrolling & panel controls while spotlight panel is open
  useEffect(() => {
    if (selectedStep === null) return;

    // 1. Temporarily disable CSS scroll-smooth while the modal is open so trackpad wheel deltas
    // are applied instantaneously with zero animation fight or freezing
    const htmlEl = document.documentElement;
    const hadScrollSmooth = htmlEl.classList.contains("scroll-smooth");
    if (hadScrollSmooth) {
      htmlEl.classList.remove("scroll-smooth");
    }
    const originalScrollBehavior = htmlEl.style.scrollBehavior;
    htmlEl.style.scrollBehavior = "auto";

    // 2. Wheel event handler: ensures scrolling background works even when hovering directly over the card
    const handleWheel = (e: WheelEvent) => {
      window.scrollBy({
        top: e.deltaY,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
    };

    // 3. Touch events for mobile / touch devices
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diffY = startY - currentY;
      window.scrollBy({
        top: diffY,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
      startY = currentY;
    };

    // 4. Keyboard arrow / page navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedStep(null);
        return;
      }
      if (e.key === "ArrowDown") {
        window.scrollBy({ top: 120, behavior: "instant" as ScrollBehavior });
      } else if (e.key === "ArrowUp") {
        window.scrollBy({ top: -120, behavior: "instant" as ScrollBehavior });
      } else if (e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        window.scrollBy({ top: 400, behavior: "instant" as ScrollBehavior });
      } else if (e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        window.scrollBy({ top: -400, behavior: "instant" as ScrollBehavior });
      }
    };

    // 5. Dismiss when clicking outside the panel (capture phase prevents clicking background links)
    const handleClickCapture = (e: MouseEvent) => {
      if (
        (modalContentRef.current && modalContentRef.current.contains(e.target as Node)) ||
        (closeBtnRef.current && closeBtnRef.current.contains(e.target as Node))
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setSelectedStep(null);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClickCapture, { capture: true });

    return () => {
      if (hadScrollSmooth) {
        htmlEl.classList.add("scroll-smooth");
      }
      htmlEl.style.scrollBehavior = originalScrollBehavior;
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClickCapture, { capture: true });
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

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50/70 dark:bg-white/[0.03] backdrop-blur-[2px] transition-colors">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
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
                  className="group cursor-pointer h-full rounded-3xl border border-slate-200/90 bg-white/90 p-7 sm:p-8 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.02] hover:border-[#0070BA]/50 dark:hover:border-sky-500/40 transition-all duration-300 dark:border-slate-800/90 dark:bg-[#131B2E]/90 dark:shadow-none backdrop-blur-md flex flex-col justify-between"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedStep(idx);
                    }
                  }}
                >
                  <div>
                    {/* Top Step Number */}
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl font-mono text-sm font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 group-hover:bg-blue-50 group-hover:text-[#0070BA] dark:group-hover:bg-[#0070BA]/20 dark:group-hover:text-sky-300 transition-colors">
                        {s.step}
                      </span>
                    </div>

                    {/* Big Clean Title */}
                    <h3 className="mt-7 text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#0070BA] dark:group-hover:text-sky-400 transition-colors">
                      {s.title}
                    </h3>
                  </div>

                  {/* Interactive Cue: Click to View Details */}
                  <div className="mt-10 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#0070BA] dark:text-sky-400 group-hover:translate-x-1 transition-transform">
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
        FULL-SCREEN DARK PANEL SHOWCASE:
        - The dark panel covers the screen and stays 100% still/stationary on the screen until closed.
        - The background page behind the dark panel moves up and down whenever someone scrolls!
        - Left: The enlarged clean white card.
        - Right: The free text flying in from right to left.
        - Top right: Close ✕ button.
        - Bottom: Next Stage → / Done buttons.
        - Clicking outside the central card/text area also closes the panel.
      */}
      {mounted && activeStepData && selectedStep !== null && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 pointer-events-none">
          {/* 
            Dark Blurred Backdrop:
            Renders the full dark focus veil across the screen.
            pointer-events-none lets trackpad/mouse gestures pass straight through
            to the background page for native, buttery-smooth scrolling!
          */}
          <div
            className="absolute inset-0 bg-slate-950/75 dark:bg-black/80 backdrop-blur-md transition-all duration-300 pointer-events-none"
            aria-hidden="true"
          />

          {/* Top-Right Quick Dismiss Button */}
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setSelectedStep(null)}
            className="fixed top-5 right-5 sm:top-8 sm:right-8 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg pointer-events-auto"
            aria-label="Close"
          >
            <span>Close</span>
            <X className="h-4 w-4" />
          </button>

          {/* Central Side-by-Side Content (Stationary on screen) */}
          <div
            ref={modalContentRef}
            className="relative flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-8 lg:gap-14 max-w-4xl w-full pointer-events-auto"
          >
            {/* 
              LEFT PANEL: THE ENLARGED WHITE BOX
              Stationary and prominent
            */}
            <div className="w-full lg:w-[340px] shrink-0 rounded-3xl border border-white/20 bg-white p-7 sm:p-9 shadow-2xl dark:border-slate-700 dark:bg-[#131B2E] flex flex-col justify-between transition-transform duration-300 scale-100">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl font-mono text-base font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    {activeStepData.step}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
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
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  Stage {activeStepData.step} of 03
                </span>

                {/* Subheading */}
                <h4 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
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
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0070BA]/25 text-sky-400 border border-[#0070BA]/40 shrink-0 mt-0.5">
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
                      className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-sky-300 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </button>
                  )}
                  {selectedStep < steps.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStep(selectedStep + 1)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-sky-300 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStep(null)}
                  className="btn-gradient-glow px-5 py-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] text-white text-xs font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
