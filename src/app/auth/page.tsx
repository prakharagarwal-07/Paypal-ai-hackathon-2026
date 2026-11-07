"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

type AuthMode = "login" | "signup";
type UserRole = "client" | "freelancer";

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
    <div className="w-full max-w-md">
      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#131B2E] dark:shadow-none transition-colors">
        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm font-bold dark:bg-slate-800 dark:text-white"
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
            className={`py-2 rounded-xl transition-all ${
              mode === "signup"
                ? "bg-white text-slate-900 shadow-sm font-bold dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {mode === "login" ? "Welcome Back" : "Join MilestoneOS"}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mode === "login"
              ? "Access your project milestones and payment records."
              : "Create your free account in seconds."}
          </p>
        </div>

        {/* Demo Fast Fill */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Zap className="h-3 w-3" />
              One-Click Demo Fill:
            </span>
            <span>Select Account</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("client")}
              className={`p-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                role === "client"
                  ? "border-sky-400 bg-sky-50 text-sky-900 shadow-sm dark:border-sky-500/50 dark:bg-sky-500/15 dark:text-sky-200"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
              }`}
            >
              <div className="font-bold flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-sky-500" />
                <span>Client</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                Sarah (Hiring)
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("freelancer")}
              className={`p-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                role === "freelancer"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-200"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
              }`}
            >
              <div className="font-bold flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                <span>Freelancer</span>
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
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setRole("client")}
                className={`cursor-pointer rounded-xl border p-2.5 text-xs transition-all ${
                  role === "client"
                    ? "border-sky-500 bg-sky-50 text-sky-900 dark:bg-sky-500/20 dark:text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-sky-500" />
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
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/20 dark:text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
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
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 flex items-start gap-2">
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
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
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
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
                  onClick={() => alert("Password reset link will be sent to your email.")}
                  className="text-[11px] text-[#0070BA] dark:text-sky-400 font-medium hover:underline"
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
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
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
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-1 focus:ring-[#0070BA] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient-glow w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] py-3 text-sm font-bold text-white shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === "login" ? (
            <span>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
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
                className="text-[#0070BA] dark:text-sky-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Bar */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between dark:border-slate-800 dark:bg-[#0B0F19]/80">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-white font-bold shadow-sm shadow-blue-500/20">
            <span className="text-base font-extrabold">M</span>
          </div>
          <span className="font-extrabold text-lg text-slate-900 dark:text-white">
            Milestone<span className="text-[#0070BA] dark:text-[#38BDF8]">OS</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="text-center text-slate-400 text-sm py-12 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-[#0070BA]" />
              <span>Loading...</span>
            </div>
          }
        >
          <AuthForm />
        </Suspense>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        MilestoneOS • Safe Milestone Payments Powered by PayPal
      </footer>
    </div>
  );
}
