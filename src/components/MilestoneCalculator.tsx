"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, CheckCircle2, TrendingUp, Layers } from "lucide-react";

export default function MilestoneCalculator() {
  const [budget, setBudget] = useState(50000);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const symbol = currency === "INR" ? "₹" : "$";
  const rateMultiplier = currency === "INR" ? 1 : 0.012;
  const currentBudget = Math.round(budget * rateMultiplier);

  const milestones = [
    {
      index: 1,
      percent: 20,
      title: "Architecture & Core UI Prototype",
      desc: "Component design tokens, responsive layouts, data models.",
      verification: "Static code inspection + Figma token matching",
    },
    {
      index: 2,
      percent: 30,
      title: "Frontend Engineering & Integration",
      desc: "API routing, client views, interactive states, error boundaries.",
      verification: "PR diff analysis + Jest test suite coverage (>85%)",
    },
    {
      index: 3,
      percent: 30,
      title: "Backend Services & PayPal Sandbox",
      desc: "Orders API, capture routes, webhooks, database persistence.",
      verification: "Automated endpoint ping + sandbox capture event verification",
    },
    {
      index: 4,
      percent: 20,
      title: "QA, Security & Final Production Handoff",
      desc: "End-to-end integration, performance audit, documentation.",
      verification: "Lighthouse audit (>90) + full test suite pass report",
    },
  ];

  return (
    <section id="calculator" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#090D18]/60">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers className="h-3.5 w-3.5" />
            Interactive Financial Model
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            How MilestoneOS Eliminates Project Risk
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Calculate your milestone tranches. Instead of paying 100% upfront or risking unpaid labor, capital is held securely and unlocked in verified tranches.
          </p>
        </div>

        {/* Budget Control Bar */}
        <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Project Contract Value
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tight tabular-nums">
                  {symbol}{currentBudget.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  divided across 4 verified milestones
                </span>
              </div>
            </div>

            {/* Currency selector & quick presets */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-semibold">
                <button
                  onClick={() => setCurrency("INR")}
                  className={`px-3 py-1 rounded transition-colors ${
                    currency === "INR"
                      ? "bg-emerald-400 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1 rounded transition-colors ${
                    currency === "USD"
                      ? "bg-emerald-400 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="mt-6">
            <input
              type="range"
              min="20000"
              max="200000"
              step="5000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="mt-2 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>{symbol}{Math.round(20000 * rateMultiplier).toLocaleString()} (Small MVP)</span>
              <span>{symbol}{Math.round(100000 * rateMultiplier).toLocaleString()} (Full Web App)</span>
              <span>{symbol}{Math.round(200000 * rateMultiplier).toLocaleString()} (Enterprise Portal)</span>
            </div>
          </div>
        </div>

        {/* Dynamic 4-Milestone Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m) => {
            const milestoneAmount = Math.round((currentBudget * m.percent) / 100);
            return (
              <div
                key={m.index}
                className="relative flex flex-col justify-between rounded-xl border border-slate-800/90 bg-[#0C1222]/80 p-5 transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-emerald-500/5 group"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-xs font-mono font-bold text-slate-300">
                      0{m.index}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {m.percent}% Payout
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-2xl font-black text-white tabular-nums">
                      {symbol}{milestoneAmount.toLocaleString()}
                    </div>
                    <h4 className="mt-1.5 text-sm font-bold text-slate-200 leading-snug">
                      {m.title}
                    </h4>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-medium text-slate-400">
                    <span className="text-slate-500 block uppercase text-[10px] tracking-wider mb-1">
                      AI Verification Check:
                    </span>
                    <span className="text-slate-300 group-hover:text-emerald-300 transition-colors">
                      {m.verification}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk Comparison Comparison Box */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Old Model: 100% Upfront
            </span>
            <div className="mt-2 text-lg font-bold text-white">Client Bears 100% Risk</div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Client pays entire amount before seeing a single line of working code. If freelancer defaults or changes scope, funds are difficult to recover.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Old Model: 100% On Delivery
            </span>
            <div className="mt-2 text-lg font-bold text-white">Freelancer Bears 100% Risk</div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Freelancer works for months without cashflow. Unscrupulous clients can delay sign-off, claim arbitrary bugs, or ghost after receiving code.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 shadow-lg shadow-emerald-500/5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              The MilestoneOS Model
            </span>
            <div className="mt-2 text-lg font-bold text-white">Verified Tranches via PayPal</div>
            <p className="mt-2 text-xs text-emerald-200/80 leading-relaxed">
              Every milestone is small, measurable, AI-audited, and unlocked strictly when agreed acceptance criteria are satisfied through verified PayPal Checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
