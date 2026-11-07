"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Zap,
} from "lucide-react";

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
      setEmail("sarah.chen@client-enterprise.demo");
      setPassword("DemoClientPass2026!");
    } else {
      setName("Rohan Verma");
      setEmail("rohan.verma@dev-freelance.demo");
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

    // Simulate Auth API Latency for high-polish frontend prototype
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(
        mode === "login"
          ? `Authenticated successfully as ${role === "client" ? "Client" : "Freelancer"}. Ready for Dashboard routing!`
          : `Account created for ${name || "User"} with ${role === "client" ? "Client" : "Freelancer"} role. Supabase session initialized.`
      );
    }, 1200);
  };

  return (
    <div className="w-full max-w-lg">
      {/* Phase 1 Prototype Banner */}
      <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5 text-xs text-sky-300 flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Phase 1 Frontend Prototype: </span>
          Full UI validation & demo profiles are active. Supabase Auth backend will be integrated in Phase 2.
        </div>
      </div>

      {/* Form Glass Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0C1222]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800/90 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === "login"
                ? "bg-slate-800 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
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
            className={`py-2 rounded-lg transition-all ${
              mode === "signup"
                ? "bg-slate-800 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === "login"
              ? "Welcome Back to MilestoneOS"
              : "Launch Your Verified Workspace"}
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            {mode === "login"
              ? "Access your milestones, deliverable audits, and PayPal releases."
              : "Choose your role to get tailored milestone tooling."}
          </p>
        </div>

        {/* Quick Demo Credentials Autofill */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="h-3 w-3" />
              Judge Quick-Fill:
            </span>
            <span>Select Persona</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("client")}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-all ${
                role === "client"
                  ? "border-sky-500/50 bg-sky-500/15 text-sky-200 shadow-sm"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-sky-400" />
                <span>Client Profile</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Sarah Chen (Hiring)
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("freelancer")}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-all ${
                role === "freelancer"
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 shadow-sm"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                <span>Freelancer</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Rohan Verma (Building)
              </span>
            </button>
          </div>
        </div>

        {/* Role Selection Tabs for Signup */}
        {mode === "signup" && (
          <div className="mt-5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Your Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setRole("client")}
                className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${
                  role === "client"
                    ? "border-sky-500 bg-sky-500/15 shadow-sm"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <User className="h-3.5 w-3.5 text-sky-400" />
                  Client
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                  Hire, define milestone criteria, review audits, and pay via PayPal.
                </p>
              </div>

              <div
                onClick={() => setRole("freelancer")}
                className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${
                  role === "freelancer"
                    ? "border-emerald-500 bg-emerald-500/15 shadow-sm"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                  Freelancer
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                  Submit deliverables, get AI criteria feedback, and receive guaranteed payouts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error & Success Feedback Alerts */}
        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be dispatched via Supabase Auth.")}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 py-3 text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In to Workspace" : "Create My Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {mode === "login" ? (
            <span>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Create one now
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
                className="text-emerald-400 font-semibold hover:underline"
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
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar */}
      <header className="w-full border-b border-slate-800/80 bg-[#080B12]/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <span className="text-base font-extrabold tracking-tight">M</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            Milestone<span className="text-emerald-400">OS</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          ← Return to Overview
        </Link>
      </header>

      {/* Main Auth Container with Suspense boundary */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="text-center text-slate-400 text-sm py-12 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Loading secure session...</span>
            </div>
          }
        >
          <AuthForm />
        </Suspense>
      </main>

      {/* Auth Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        MilestoneOS • PayPal AI Hackathon 2026 Sandbox Environment
      </footer>
    </div>
  );
}
