import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100/60 dark:border-slate-800 dark:bg-[#06080F] text-slate-500 text-xs py-12 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold">
              <span className="text-sm font-extrabold">M</span>
            </div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">
              Milestone<span className="text-emerald-500">OS</span>
            </span>
            <span className="text-[11px] text-slate-400 ml-2">
              PayPal AI Hackathon 2026
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400 font-medium">
            <Link href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-white">
              How It Works
            </Link>
            <Link href="#demo" className="hover:text-emerald-600 dark:hover:text-white">
              Live Demo
            </Link>
            <Link href="#calculator" className="hover:text-emerald-600 dark:hover:text-white">
              Calculator
            </Link>
            <Link href="/auth?mode=login" className="hover:text-emerald-600 dark:hover:text-white">
              Sign In
            </Link>
            <a
              href="https://developer.paypal.com/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 dark:hover:text-white inline-flex items-center gap-1"
            >
              PayPal Developer
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2026 MilestoneOS. Open source prototype built for the PayPal AI Hackathon.
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>PayPal Sandbox Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
