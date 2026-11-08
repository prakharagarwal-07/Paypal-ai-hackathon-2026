"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ClientView from "@/components/dashboard/ClientView";
import FreelancerView from "@/components/dashboard/FreelancerView";
import AuditModal from "@/components/dashboard/AuditModal";
import SubmissionModal from "@/components/dashboard/SubmissionModal";
import NewProjectModal from "@/components/dashboard/NewProjectModal";
import WebThreads from "@/components/WebThreads";
import { INITIAL_PROJECT, ProjectContract, Milestone } from "@/lib/dashboard-data";
import { CheckCircle2, X } from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "freelancer" ? "freelancer" : "client";

  const [role, setRole] = useState<"client" | "freelancer">(initialRole);
  const [project, setProject] = useState<ProjectContract>(INITIAL_PROJECT);

  // Modals state
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [submissionMilestone, setSubmissionMilestone] = useState<Milestone | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Success Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlRole = searchParams.get("role");
    if (urlRole === "client" || urlRole === "freelancer") {
      setRole(urlRole);
    }
  }, [searchParams]);

  // Handle client releasing milestone payout via PayPal
  const handleReleasePayout = (milestoneId: string) => {
    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const txId = `PAYID-SBX-${Math.floor(100000 + Math.random() * 900000)}-X`;

    const updatedMilestones = project.milestones.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          status: "paid" as const,
          paidAt: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          paypalTransactionId: txId,
        };
      }
      return m;
    });

    setProject({
      ...project,
      escrowReleased: project.escrowReleased + milestone.amount,
      milestones: updatedMilestones,
    });

    setIsAuditModalOpen(false);
    setSelectedMilestone(null);

    setToastMessage(
      `$${milestone.amount.toLocaleString()}.00 USD successfully transferred to ${project.freelancerName} via PayPal Sandbox! Transaction ID: ${txId}`
    );

    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  // Handle freelancer submitting deliverables
  const handleSubmitDeliverables = (
    milestoneId: string,
    deliverables: {
      demoUrl: string;
      githubRepo: string;
      githubPr: string;
      loomVideo: string;
      notes: string;
    }
  ) => {
    const updatedMilestones = project.milestones.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          status: "in_review" as const,
          deliverables: {
            ...deliverables,
            submittedAt: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          aiAudit: {
            overallScore: 97,
            summary: "Pre-flight audit passed! Staging URL responded 200 OK and all webhook handler criteria verified.",
            status: "approved" as const,
            verifiedAt: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            criteria: [
              {
                id: "crit_auto_1",
                title: "Live Webhook Endpoint Verification",
                description: "Endpoint accepts signed PayPal webhook POST requests.",
                status: "passed" as const,
                aiNotes: "Verified: returned 200 on simulated PAYMENT.CAPTURE.COMPLETED event.",
              },
              {
                id: "crit_auto_2",
                title: "HMAC Signature Verification",
                description: "Prevents spoofed notifications by checking PayPal cert signature.",
                status: "passed" as const,
                aiNotes: "Verified: valid cryptographic verification logic detected.",
              },
            ],
            automatedChecks: [
              { name: "Live Staging Response", passed: true, detail: "HTTPS 200 OK (164ms)" },
              { name: "GitHub Commits & CI", passed: true, detail: "Passing automated tests" },
            ],
          },
        };
      }
      return m;
    });

    setProject({
      ...project,
      milestones: updatedMilestones,
    });

    setIsSubmissionModalOpen(false);
    setSubmissionMilestone(null);

    setToastMessage(
      `Deliverables submitted successfully! Gemini AI verified 97% match. Your client (${project.clientName}) has been notified to release funds.`
    );

    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  // Handle new project creation
  const handleCreateProject = (newProject: ProjectContract) => {
    setProject(newProject);
    setIsNewProjectModalOpen(false);
    setToastMessage(
      `New contract "${newProject.title}" created and $${newProject.totalBudget.toLocaleString()} funded into PayPal Escrow!`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* 
        SUBTLE AMBIENT WEBTHREADS BACKGROUND:
        Low opacity (35%) so dashboard data is crisp and 100% readable
      */}
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none opacity-35 dark:opacity-25 transition-opacity">
        <WebThreads
          colors={["#0070BA", "#00457C", "#009CDE", "#38BDF8", "#00E599"]}
          coreColor="#FFFFFF"
          lightMode={false}
          threadCount={7}
          speed={0.11}
          frequency={3.5}
          spread={0.24}
          position={0.5}
          glow={0.016}
          brightness={0.7}
          thickness={0.9}
          fade={0.015}
          mouseInteraction={true}
          pulseOnClick={false}
        />
      </div>

      {/* AMBIENT LIGHTING ORBS */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-sky-500/10 to-teal-400/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* DASHBOARD HEADER */}
      <DashboardHeader
        role={role}
        onRoleChange={setRole}
        onNewProjectClick={() => setIsNewProjectModalOpen(true)}
        escrowFunded={project.escrowFunded}
        escrowReleased={project.escrowReleased}
      />

      {/* TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md rounded-2xl border border-emerald-300 bg-white/95 p-4 text-xs shadow-2xl backdrop-blur-xl dark:border-emerald-500/40 dark:bg-[#0D182E]/95 text-slate-900 dark:text-white animate-in slide-in-from-top-4 duration-300 flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <span className="font-bold block text-emerald-700 dark:text-emerald-400">
              PayPal Escrow Update
            </span>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-snug">
              {toastMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 flex-1 px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full">
        {role === "client" ? (
          <ClientView
            project={project}
            onInspectMilestone={(m) => {
              setSelectedMilestone(m);
              setIsAuditModalOpen(true);
            }}
          />
        ) : (
          <FreelancerView
            project={project}
            onOpenSubmission={(m) => {
              setSubmissionMilestone(m);
              setIsSubmissionModalOpen(true);
            }}
            onInspectMilestone={(m) => {
              setSelectedMilestone(m);
              setIsAuditModalOpen(true);
            }}
          />
        )}
      </main>

      {/* AUDIT / INSPECTION MODAL */}
      {selectedMilestone && (
        <AuditModal
          project={project}
          milestone={selectedMilestone}
          isOpen={isAuditModalOpen}
          onClose={() => {
            setIsAuditModalOpen(false);
            setSelectedMilestone(null);
          }}
          onReleasePayout={handleReleasePayout}
          isClientView={role === "client"}
        />
      )}

      {/* FREELANCER SUBMISSION MODAL */}
      {submissionMilestone && (
        <SubmissionModal
          milestone={submissionMilestone}
          isOpen={isSubmissionModalOpen}
          onClose={() => {
            setIsSubmissionModalOpen(false);
            setSubmissionMilestone(null);
          }}
          onSubmitDeliverable={handleSubmitDeliverables}
        />
      )}

      {/* NEW PROJECT CONTRACT MODAL */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* FOOTER */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-transparent backdrop-blur-md">
        MilestoneOS • PayPal AI Hackathon 2026 • Verified Milestones & Secure PayPal Payouts
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFD] dark:bg-[#070B14] text-slate-500 text-xs font-mono">
          Loading MilestoneOS Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
