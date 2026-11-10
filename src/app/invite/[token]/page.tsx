"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  Layers,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { ProjectContract, MilestoneOSUser } from "@/lib/dashboard-data";
import ThemeToggle from "@/components/ThemeToggle";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

function InvitePageContent({ params }: InvitePageProps) {
  const { token } = use(params);
  const router = useRouter();

  const {
    role,
    setRole,
    userProfiles,
    projects,
    acceptInvitationByToken,
    showToast,
  } = useDashboard();

  const currentProfile = userProfiles[role];

  const [project, setProject] = useState<ProjectContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [changeFeedback, setChangeFeedback] = useState("");

  useEffect(() => {
    // Lookup project by token in local store first
    const matched = projects.find((p) => p.invitationToken === token);
    if (matched) {
      setProject(matched);
      setLoading(false);
      return;
    }

    // Fallback: fetch from API endpoint
    fetch(`/api/invitations/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
        } else {
          setErrorMsg(data.error || "Invitation not found.");
        }
      })
      .catch((err) => {
        setErrorMsg("Failed to load invitation. Please verify the link.");
      })
      .finally(() => setLoading(false));
  }, [token, projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] flex items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-center space-y-3">
          <div className="h-8 w-8 border-2 border-[#0070BA] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Verifying invitation link...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-center space-y-4 shadow-xl">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Invitation Link Unavailable
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {errorMsg || "This invitation link is invalid, expired, or has been revoked by the sender."}
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isRevoked = project.invitationStatus === "revoked";
  const isClaimed = project.invitationStatus === "claimed" || project.status === "active";
  const isSender =
    project.initiatorMilestoneOSId === currentProfile.milestoneOSId ||
    (project.initiatedBy === role && project.client.email === currentProfile.email);

  const senderRole = project.initiatedBy === "client" ? "Client" : "Freelancer";
  const targetRecipientRole = project.initiatedBy === "client" ? "freelancer" : "client";
  const senderName = project.initiatedBy === "client" ? project.client.name : project.freelancer.name;
  const senderOrg = project.initiatedBy === "client" ? project.client.company : project.freelancer.title;
  const senderId =
    project.initiatorMilestoneOSId ||
    (project.initiatedBy === "client" ? project.client.milestoneOSId : project.freelancer.milestoneOSId);

  const roleMatches = role === targetRecipientRole;

  const handleAccept = () => {
    setIsAccepting(true);
    const result = acceptInvitationByToken(token, {
      name: currentProfile.name,
      email: currentProfile.email,
      avatar: currentProfile.avatar,
      milestoneOSId: currentProfile.milestoneOSId,
      role,
      companyOrTitle: (currentProfile as any).company || (currentProfile as any).title,
    });

    if (result.success) {
      showToast(`Proposal accepted! Project "${project.title}" is now active.`, "success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } else {
      setIsAccepting(false);
      showToast(result.error || "Failed to accept proposal", "warning");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] py-8 px-4 sm:px-6 flex flex-col justify-between">
      {/* Top Navbar */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0070BA] text-white font-bold">
            <span>M</span>
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            Milestone<span className="text-[#0070BA] dark:text-[#38BDF8]">OS</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Main Proposal Card */}
      <div className="max-w-3xl mx-auto w-full bg-white dark:bg-[#0D1527] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-auto">
        {/* Banner */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-transparent dark:from-blue-950/20 dark:via-sky-950/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Private MilestoneOS Agreement Proposal</span>
            </span>

            <span className="text-xs text-slate-500 font-mono">
              Target Deadline: {project.targetDeadline}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-3">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-300">
            <span>
              Proposed by: <strong>{senderName}</strong> ({senderRole})
            </span>
            <span>•</span>
            <span>{senderOrg}</span>
            <span>•</span>
            <span className="font-mono text-slate-500">ID: {senderId || "MSO-VERIFIED"}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Status notices */}
          {isRevoked ? (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900 text-xs">
              This proposal invitation link has been revoked by the sender.
            </div>
          ) : isClaimed ? (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900 text-xs flex items-center justify-between">
              <span>This agreement proposal has already been accepted and activated.</span>
              <Link href="/dashboard" className="font-bold underline">
                View in Dashboard →
              </Link>
            </div>
          ) : isSender ? (
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900 text-xs">
              <strong>You created this invitation link.</strong> To test recipient review and acceptance, open this URL in an incognito window or switch accounts.
            </div>
          ) : !roleMatches ? (
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/30 dark:text-sky-200 dark:border-blue-900 text-xs flex items-center justify-between gap-3">
              <div>
                <span>This proposal was created for a <strong>{targetRecipientRole === "client" ? "Client" : "Freelancer"}</strong>. You are currently in <strong>{role === "client" ? "Client View" : "Freelancer View"}</strong>.</span>
              </div>
              <button
                type="button"
                onClick={() => setRole(targetRecipientRole)}
                className="px-3.5 py-1.5 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer shrink-0"
              >
                Switch to {targetRecipientRole === "client" ? "Client" : "Freelancer"} View
              </button>
            </div>
          ) : null}

          {/* Budget & Milestones Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Budget</span>
              <span className="font-mono font-black text-lg text-slate-900 dark:text-white">
                ${project.totalBudget.toLocaleString()} USD
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Milestone Stages</span>
              <span className="font-mono font-black text-lg text-slate-900 dark:text-white">
                {project.milestones.length} Stages
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Escrow</span>
              <span className="font-bold text-sm text-[#0070BA] dark:text-sky-300 block mt-0.5">
                PayPal Sandbox Protected
              </span>
            </div>
          </div>

          {/* Scope Description */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-400">
              Project Scope & Objective
            </h3>
            <p className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              {project.description}
            </p>
          </div>

          {/* Milestone Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-400">
              Agreed Deliverables by Milestone
            </h3>

            <div className="space-y-3">
              {project.milestones.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      Stage 0{m.stageNumber}: {m.title}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      ${m.amount.toLocaleString()} USD
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {m.description}
                  </p>

                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Acceptance Criteria:
                    </span>
                    {m.acceptanceCriteria.map((c, cIdx) => (
                      <div
                        key={c.id || cIdx}
                        className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-2 rounded-xl"
                      >
                        <span className="text-[#0070BA] font-bold">•</span>
                        <span>{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notice on Acceptance */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0070BA] shrink-0 mt-0.5" />
            <p>
              By clicking <strong>Accept Proposal</strong>, this project is bound to your account (<strong>{currentProfile.name}</strong>, ID: <span className="font-mono font-bold text-slate-900 dark:text-white">{currentProfile.milestoneOSId}</span>). Stage 01 will become active, and payments will be managed through PayPal sandbox escrow.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>

          {!isRevoked && !isClaimed && !isSender && roleMatches && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={isAccepting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isAccepting ? "Activating Contract..." : "Accept Proposal & Activate Contract"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="max-w-3xl mx-auto w-full text-center pt-6 text-[11px] text-slate-400">
        MilestoneOS • Neutral Mutual Agreement & PayPal Escrow Platform
      </div>
    </div>
  );
}

export default function InvitePage(props: InvitePageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] flex items-center justify-center p-4">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0070BA] border-t-transparent" />
            <span>Loading invitation details...</span>
          </div>
        </div>
      }
    >
      <InvitePageContent params={props.params} />
    </Suspense>
  );
}
