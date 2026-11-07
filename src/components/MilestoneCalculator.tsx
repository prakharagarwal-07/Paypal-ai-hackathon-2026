"use client";

import { useState } from "react";
import { ShieldCheck, Layers } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function MilestoneCalculator() {
  const [budget, setBudget] = useState(50000);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const symbol = currency === "INR" ? "₹" : "$";
  const rateMultiplier = currency === "INR" ? 1 : 0.012;
  const currentBudget = Math.round(budget * rateMultiplier);

  const milestones = [
    {
      index: 1,
      percent: 25,
      title: "Design & Look",
      desc: "Color schemes, layout sketches, and agreed design previews.",
    },
    {
      index: 2,
      percent: 35,
      title: "Building Main Pages",
      desc: "Working website pages, navigation, and interactive features.",
    },
    {
      index: 3,
      percent: 25,
      title: "Online Payments Setup",
      desc: "PayPal checkout so your customers can buy products or pay you.",
    },
    {
      index: 4,
      percent: 15,
      title: "Testing & Going Live",
      desc: "Final checks, fixing any glitches, and officially launching the site.",
    },
  ];

  return (
    <section id="calculator" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-[#0B0F19]/40 backdrop-blur-sm transition-colors">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <ScrollReveal direction="up" delay={50}>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              See How Your Money Is Protected
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Never pay 100% upfront to someone you just met. Pay step-by-step as real work gets completed and verified.
            </p>
          </div>
        </ScrollReveal>

        {/* Budget Slider Card */}
        <ScrollReveal direction="up" delay={150}>
          <div className="mt-10 mx-auto max-w-xl rounded-3xl border border-slate-200/90 bg-white/95 p-7 dark:border-slate-800 dark:bg-[#131B2E]/95 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Project Budget
              </span>
              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800">
                <button
                  onClick={() => setCurrency("INR")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currency === "INR"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currency === "USD"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                {symbol}{currentBudget.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                split into 4 verified stages
              </span>
            </div>

            <input
              type="range"
              min="20000"
              max="150000"
              step="5000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full mt-6 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="mt-2.5 flex justify-between text-[11px] font-semibold text-slate-400">
              <span>{symbol}{Math.round(20000 * rateMultiplier).toLocaleString()} (Smaller Website)</span>
              <span>{symbol}{Math.round(150000 * rateMultiplier).toLocaleString()} (Full Online Platform)</span>
            </div>
          </div>
        </ScrollReveal>

        {/* 4 Milestones Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m, idx) => {
            const amount = Math.round((currentBudget * m.percent) / 100);
            return (
              <ScrollReveal
                key={m.index}
                direction="up"
                delay={200 + idx * 100}
                className="h-full"
              >
                <div className="h-full rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-md shadow-slate-200/50 hover:shadow-lg hover:border-emerald-400 transition-all dark:border-slate-800 dark:bg-[#131B2E]/90 dark:shadow-none backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-mono dark:bg-emerald-500/20 dark:text-emerald-400">
                        0{m.index}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {m.percent}%
                      </span>
                    </div>

                    <div className="mt-3 text-xl font-black text-slate-900 dark:text-white tabular-nums">
                      {symbol}{amount.toLocaleString()}
                    </div>

                    <h4 className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                      {m.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Paid via PayPal after review</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
