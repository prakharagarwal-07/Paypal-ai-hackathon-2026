import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800/40 bg-slate-50/80 dark:bg-[#06080F]/80 backdrop-blur-md text-slate-500 text-xs py-14 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-white font-bold shadow-sm shadow-blue-500/20">
              <span className="text-sm font-extrabold">M</span>
            </div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">
              Milestone<span className="text-[#0070BA] dark:text-[#38BDF8]">OS</span>
            </span>
            <span className="text-[11px] text-slate-400 ml-2">
              Safe Milestone Payments
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400 font-medium">
            <Link href="/#how-it-works" className="hover:text-[#0070BA] dark:hover:text-white">
              How It Works
            </Link>
            <Link href="/#demo" className="hover:text-[#0070BA] dark:hover:text-white">
              See It In Action
            </Link>
            <Link href="/#calculator" className="hover:text-[#0070BA] dark:hover:text-white">
              Payment Calculator
            </Link>
            <Link href="/#benefits" className="hover:text-[#0070BA] dark:hover:text-white">
              Who It's For
            </Link>
            <Link href="/dashboard" className="text-[#0070BA] dark:text-sky-400 font-bold hover:underline">
              Live Dashboard
            </Link>
            <Link href="/auth?mode=login" className="hover:text-[#0070BA] dark:hover:text-white">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2026 MilestoneOS. Work completed. Progress verified. Payments made with confidence.
          </div>
          <div className="flex items-center gap-2 text-[#0070BA] dark:text-sky-400 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Official PayPal Checkout Integration</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
