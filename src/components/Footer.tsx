import Link from "next/link";
import { ShieldCheck, Heart, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#06080F] text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand & Mission (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                <span className="text-sm font-extrabold tracking-tight">M</span>
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Milestone<span className="text-emerald-400">OS</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Work completed. Progress verified. Payments made with confidence. The intelligent milestone escrow platform integrating Gemini AI evaluation and the PayPal Developer Platform.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <span>PayPal AI Hackathon 2026 Submission</span>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#ai-verification" className="hover:text-white transition-colors">
                  AI Deliverable Audit
                </Link>
              </li>
              <li>
                <Link href="#calculator" className="hover:text-white transition-colors">
                  Milestone Calculator
                </Link>
              </li>
              <li>
                <Link href="#roles" className="hover:text-white transition-colors">
                  Client & Freelancer Roles
                </Link>
              </li>
              <li>
                <Link href="/auth?mode=login" className="hover:text-white transition-colors">
                  Authentication Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack & APIs */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              Integrations
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://developer.paypal.com/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  PayPal Sandbox Orders API
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/gemini-api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  Google Gemini 2.5 API
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://supabase.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  Supabase Database & Auth
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://nextjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  Next.js 16 App Router
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Hackathon & Compliance */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              Hackathon Governance
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li className="text-slate-400">
                Deadline: Nov 12, 2026 (12:00 PM PT)
              </li>
              <li className="text-slate-400">
                License: MIT Open Source
              </li>
              <li className="text-slate-400">
                Environment: PayPal Developer Sandbox
              </li>
              <li className="text-emerald-400">
                Free Tier Compliant
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 MilestoneOS. Open source software built for the PayPal AI Hackathon.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              Designed with precision for clients and builders worldwide.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
