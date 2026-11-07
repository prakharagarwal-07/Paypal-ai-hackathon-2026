"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WebThreadsController from "@/components/WebThreadsController";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Eye,
  EyeOff,
  User,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Check,
} from "lucide-react";

type AuthMode = "login" | "signup";
type UserRole = "client" | "freelancer";

function PayPalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M7.076 21.337H3.45a.75.75 0 0 1-.742-.864L5.61 3.535A.75.75 0 0 1 6.35 2.9h6.814c3.483 0 5.86 1.767 5.485 5.09-.345 3.056-2.52 4.793-5.46 4.793H10.19l-1.09 6.88a.75.75 0 0 1-.741.674h-1.283z"
        fill="#003087"
      />
      <path
        d="M9.19 14.547h2.999c3.085 0 5.372-1.828 5.735-5.044.348-3.08-1.848-4.717-5.082-4.717H7.433a.75.75 0 0 0-.741.635l-2.4 15.25a.75.75 0 0 0 .741.865h3.626l.531-6.989z"
        fill="#0079C1"
        opacity="0.9"
      />
      <path
        d="M10.19 14.547l-1.09 6.88a.75.75 0 0 1-.741.674H4.732a.75.75 0 0 1-.741-.865L5.61 9.487a.75.75 0 0 1 .741-.635h3.839c3.234 0 5.43 1.637 5.082 4.717-.363 3.216-2.65 5.044-5.735 5.044H10.19l-.531 6.989"
        fill="#00457C"
        opacity="0.3"
      />
    </svg>
  );
}

function AuthForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UserRole>("client");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode === "signup" || queryMode === "login") {
      setMode(queryMode);
    }
  }, [searchParams]);

  // Handle Demo Fill
  const fillDemoAccount = (demoRole: UserRole) => {
    setRole(demoRole);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (demoRole === "client") {
      setName("Sarah Chen");
      setEmail("sarah.chen@client.demo");
      setPassword("DemoClientPass2026!");
    } else {
      setName("Rohan Verma");
      setEmail("rohan.verma@dev.demo");
      setPassword("DemoFreelancer2026!");
    }
  };

  // Instant PayPal Sandbox Authentication
  const handlePayPalInstantAuth = () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(
        `Authenticated with PayPal Sandbox (${role === "client" ? "sarah.chen@client.demo" : "rohan.verma@dev.demo"}). Redirecting to workspace...`
      );
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters in length.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify your confirmation.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(
        mode === "login"
          ? `Welcome back, ${name || (role === "client" ? "Sarah" : "Rohan")}! Redirecting to your workspace...`
          : `Account created successfully! Welcome to MilestoneOS.`
      );
    }, 900);
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Glow highlight behind card */}
      <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-[#004C8F]/20 via-[#0070BA]/25 to-[#00A3E0]/20 blur-xl opacity-75 dark:opacity-50 pointer-events-none" />

      {/* Form Card */}
      <div className="relative rounded-3xl border border-white/60 bg-white/85 p-6 sm:p-8 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d1527]/85 dark:shadow-2xl dark:shadow-black/70 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300">
        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100/90 p-1 dark:bg-slate-900/90 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-md font-bold dark:bg-gradient-to-r dark:from-[#004C8F] dark:to-[#0070BA] dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-white text-slate-900 shadow-md font-bold dark:bg-gradient-to-r dark:from-[#004C8F] dark:to-[#0070BA] dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Header Text */}
        <div className="mt-5 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {mode === "login" ? "Welcome Back" : "Join MilestoneOS"}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {mode === "login"
              ? "Access your project milestones and secure PayPal escrow payouts."
              : "Create your free account in seconds with zero upfront risk."}
          </p>
        </div>

        {/* ONE-CLICK PAYPAL LOGIN (Featured for PayPal Hackathon) */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handlePayPalInstantAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-50 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 shadow-sm hover:shadow transition-all hover:scale-[1.01] active:scale-[0.99] dark:border-white/15 dark:bg-[#131c31] dark:text-white dark:hover:bg-[#1a2642] cursor-pointer"
          >
            <PayPalIcon className="h-4 w-4" />
            <span>Continue with PayPal Sandbox</span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            or continue with email
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        </div>

        {/* Instant Sandbox Fast-Fill */}
        <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-3 dark:border-blue-500/20 dark:bg-[#0070BA]/10">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 text-[#0070BA] dark:text-sky-300">
              <Zap className="h-3.5 w-3.5" />
              <span>One-Click Demo Fill:</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-[#0070BA] dark:text-sky-300 font-bold">
              Instant
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("client")}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                role === "client" && email === "sarah.chen@client.demo"
                  ? "border-[#0070BA] bg-white text-slate-950 shadow-sm ring-1 ring-[#0070BA] dark:border-sky-400 dark:bg-[#131c31] dark:text-white"
                  : "border-slate-200 bg-white/80 text-slate-700 hover:text-slate-950 hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                  <User className="h-3.5 w-3.5" />
                  <span>Client</span>
                </span>
                {role === "client" && email === "sarah.chen@client.demo" && (
                  <Check className="h-3 w-3 text-[#0070BA] dark:text-sky-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                Sarah (Hiring)
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("freelancer")}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                role === "freelancer" && email === "rohan.verma@dev.demo"
                  ? "border-[#0070BA] bg-white text-slate-950 shadow-sm ring-1 ring-[#0070BA] dark:border-sky-400 dark:bg-[#131c31] dark:text-white"
                  : "border-slate-200 bg-white/80 text-slate-700 hover:text-slate-950 hover:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Freelancer</span>
                </span>
                {role === "freelancer" && email === "rohan.verma@dev.demo" && (
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                Rohan (Building)
              </span>
            </button>
          </div>
        </div>

        {/* Role Toggle for Signup */}
        {mode === "signup" && (
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setRole("client")}
                className={`cursor-pointer rounded-xl border p-2.5 text-xs transition-all ${
                  role === "client"
                    ? "border-[#0070BA] bg-blue-50/70 text-slate-950 dark:bg-[#0070BA]/20 dark:text-white ring-1 ring-[#0070BA]"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400"
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-slate-900 dark:text-white">
                  <User className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
                  Hire a Freelancer
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Set milestones & pay with PayPal
                </p>
              </div>

              <div
                onClick={() => setRole("freelancer")}
                className={`cursor-pointer rounded-xl border p-2.5 text-xs transition-all ${
                  role === "freelancer"
                    ? "border-[#0070BA] bg-blue-50/70 text-slate-950 dark:bg-[#0070BA]/20 dark:text-white ring-1 ring-[#0070BA]"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400"
                }`}
              >
                <div className="font-bold flex items-center gap-1 text-slate-900 dark:text-white">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  Work as a Freelancer
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Submit work & receive payouts
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/80 bg-white/90 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-4 focus:ring-[#0070BA]/15 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300/80 bg-white/90 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-4 focus:ring-[#0070BA]/15 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be sent to your registered email.")}
                  className="text-[11px] text-[#0070BA] dark:text-sky-400 font-medium hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300/80 bg-white/90 pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-4 focus:ring-[#0070BA]/15 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/80 bg-white/90 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-4 focus:ring-[#0070BA]/15 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white transition-all"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient-glow w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-5 text-center text-xs text-slate-600 dark:text-slate-400">
          {mode === "login" ? (
            <span>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[#0070BA] dark:text-sky-400 font-bold hover:underline cursor-pointer ml-0.5"
              >
                Create one free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[#0070BA] dark:text-sky-400 font-bold hover:underline cursor-pointer ml-0.5"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Floating Trust Verification Badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
          <span>PayPal Escrow Sandbox</span>
        </span>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
          <span>Gemini 2.5 Deliverable Audit</span>
        </span>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Zero Upfront Risk</span>
        </span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="relative min-h-screen bg-[#F8FAFD] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-hidden transition-colors duration-200">
      {/* 
        INTERACTIVE WEB THREADS STUDIO BACKGROUND:
        Renders the exact same glowing luminous web lines with real-time controls,
        presets, mouse interaction, and ripple pulses on the login page!
      */}
      <WebThreadsController />

      {/* AMBIENT FLANK LIGHTING: Softly frames the left and right margins with rich PayPal blue ambiance */}
      <div className="fixed inset-y-0 left-0 w-72 sm:w-96 bg-gradient-to-r from-blue-200/25 via-sky-100/15 to-transparent pointer-events-none z-0 dark:from-blue-900/15 dark:via-sky-950/5 dark:to-transparent" />
      <div className="fixed inset-y-0 right-0 w-72 sm:w-96 bg-gradient-to-l from-sky-200/25 via-blue-100/10 to-transparent pointer-events-none z-0 dark:from-sky-900/15 dark:via-blue-950/5 dark:to-transparent" />

      {/* AMBIENT RADIAL LIGHTING ORBS */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/20 via-sky-500/15 to-teal-400/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-sky-500/15 dark:bg-sky-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-blue-600/15 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* ARCHITECTURAL DOT GRID PATTERN */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-[0.035] dark:opacity-[0.07] bg-[radial-gradient(#0070BA_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Glass Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/60 bg-white/75 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between dark:border-white/10 dark:bg-[#070b14]/75">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-white font-bold shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
            <span className="text-base font-extrabold tracking-tight">M</span>
          </div>
          <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
            Milestone<span className="text-[#0070BA] dark:text-[#38BDF8]">OS</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white hover:border-[#0070BA]/50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Form Center Stage */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16 relative z-10">
        <Suspense
          fallback={
            <div className="text-center text-slate-400 text-sm py-12 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-[#0070BA]" />
              <span>Loading workspace...</span>
            </div>
          }
        >
          <AuthForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-transparent backdrop-blur-md">
        MilestoneOS • Safe Milestone Payments Powered by PayPal & Gemini AI
      </footer>
    </div>
  );
}
