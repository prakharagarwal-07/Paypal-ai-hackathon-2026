"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Wallet,
  Check,
} from "lucide-react";

export default function SimpleInteractiveDemo() {
  const [hasMissingWork, setHasMissingWork] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
    }, 1200);
  };

  const handleReset = () => {
    setIsPaid(false);
    setIsProcessing(false);
  };

  return (
    <div id="demo" className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#131B2E] dark:shadow-black/50 transition-colors">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Demo
          </span>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            Milestone 2: Homepage & PayPal Checkout
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Project: E-Commerce Storefront • Contract Value: ₹50,000
          </p>
        </div>

        {/* Friendly Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-1 rounded-xl dark:bg-slate-900 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setHasMissingWork(false);
              handleReset();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              !hasMissingWork
                ? "bg-white text-emerald-700 shadow-sm font-bold dark:bg-slate-800 dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Work Completed
          </button>
          <button
            type="button"
            onClick={() => {
              setHasMissingWork(true);
              handleReset();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              hasMissingWork
                ? "bg-white text-amber-700 shadow-sm font-bold dark:bg-slate-800 dark:text-amber-400"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Missing Deliverable
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6 space-y-6">
        {/* Checklist */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3">
            What was promised vs. what was submitted:
          </h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Responsive UI on Mobile, Tablet & Desktop
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Product catalog with search and filters
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    hasMissingWork
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  }`}
                >
                  {hasMissingWork ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  PayPal Sandbox Checkout integration & order capture
                </span>
              </div>
              <span
                className={`text-xs font-semibold ${
                  hasMissingWork
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {hasMissingWork ? "Missing in submission" : "Verified"}
              </span>
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div
          className={`rounded-2xl p-4 border transition-colors ${
            hasMissingWork
              ? "bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200"
              : "bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>
              {hasMissingWork
                ? "MilestoneOS AI Advisory: Hold Payment"
                : "MilestoneOS AI Advisory: Ready to Pay"}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed opacity-90">
            {hasMissingWork
              ? "The freelancer submitted the UI, but the PayPal checkout route is missing. We suggest requesting a quick revision before releasing your ₹15,000."
              : "All 3 agreed acceptance criteria are verified in the submitted deliverables. You can confidently release payment to the freelancer."}
          </p>
        </div>

        {/* Payment Action Area */}
        <div className="pt-2">
          {isPaid ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center dark:bg-emerald-500/10 dark:border-emerald-500/30">
              <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                <CheckCircle2 className="h-5 w-5" />
                <span>₹15,000 Paid via PayPal Sandbox!</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Payment captured successfully (Transaction #PAYPAL-SBX-8849). Milestone marked as <strong>Completed</strong>.
              </p>
              <button
                onClick={handleReset}
                className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Reset Demo
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Milestone Payout Amount
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹15,000 INR
                </span>
              </div>

              {hasMissingWork ? (
                <button
                  type="button"
                  onClick={() =>
                    alert("Revision request dispatched to freelancer with AI feedback!")
                  }
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Request Revision from Freelancer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0070BA] to-[#003087] hover:from-[#0079C1] hover:to-[#003D9E] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Contacting PayPal Sandbox...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4" />
                      <span>Approve & Pay ₹15,000 with PayPal</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
