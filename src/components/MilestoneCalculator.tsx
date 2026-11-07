"use client";

import { useState } from "react";
import { ShieldCheck, Layers } from "lucide-react";

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
      title: "Design & Wireframes",
      desc: "Approved mockups, responsive design tokens, and layout agreement.",
    },
    {
      index: 2,
      percent: 35,
      title: "Core Development",
      desc: "Frontend components, database models, and interactive features.",
    },
    {
      index: 3,
      percent: 25,
      title: "PayPal Integration",
      desc: "Payment button, server orders API, and sandbox checkout tests.",
    },
    {
      index: 4,
      percent: 15,
      title: "Final QA & Handoff",
      desc: "Bug fixes, documentation, deployment, and live handoff.",
    },
  ];

  return (
    <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0B0F19] transition-colors">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <Layers className="h-3.5 w-3.5" />
            Simple Escrow Calculator
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            See How Your Project Is Divided
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Instead of paying 100% upfront or waiting months for payment, money is unlocked step-by-step as real work is verified.
          </p>
        </div>

        {/* Budget Slider Card */}
        <div className="mt-10 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Project Budget
            </span>
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => setCurrency("INR")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  currency === "INR"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  currency === "USD"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                $ USD
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {symbol}{currentBudget.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              across 4 verified milestones
            </span>
          </div>

          <input
            type="range"
            min="20000"
            max="150000"
            step="5000"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full mt-5 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
            <span>{symbol}{Math.round(20000 * rateMultiplier).toLocaleString()} (Small Project)</span>
            <span>{symbol}{Math.round(150000 * rateMultiplier).toLocaleString()} (Full Application)</span>
          </div>
        </div>

        {/* 4 Milestones Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m) => {
            const amount = Math.round((currentBudget * m.percent) / 100);
            return (
              <div
                key={m.index}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 transition-all dark:border-slate-800 dark:bg-[#131B2E] dark:hover:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-mono dark:bg-emerald-500/20 dark:text-emerald-400">
                      0{m.index}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {m.percent}%
                    </span>
                  </div>

                  <div className="mt-3 text-xl font-black text-slate-900 dark:text-white tabular-nums">
                    {symbol}{amount.toLocaleString()}
                  </div>

                  <h4 className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                    {m.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>AI Verified Payout</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
