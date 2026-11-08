"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import NotificationDrawer from "@/components/dashboard/NotificationDrawer";
import ClientOverview from "@/components/dashboard/ClientOverview";
import FreelancerOverview from "@/components/dashboard/FreelancerOverview";
import ProjectWorkspace from "@/components/dashboard/ProjectWorkspace";
import MilestonesView from "@/components/dashboard/MilestonesView";
import AIAuditCenter from "@/components/dashboard/AIAuditCenter";
import PaymentsView from "@/components/dashboard/PaymentsView";

// Modals
import AuditModal from "@/components/dashboard/AuditModal";
import SubmissionModal from "@/components/dashboard/SubmissionModal";
import RevisionRequestModal from "@/components/dashboard/RevisionRequestModal";
import PayPalPaymentModal from "@/components/dashboard/PayPalPaymentModal";
import NewProjectModal from "@/components/dashboard/NewProjectModal";
import EditProjectModal from "@/components/dashboard/EditProjectModal";

import WebThreads from "@/components/WebThreads";
import { CheckCircle2, AlertCircle, X, Sparkles, ShieldCheck } from "lucide-react";

function DashboardInner() {
  const {
    role,
    activeTab,
    activeProject,
    toast,
    hideToast,
  } = useDashboard();

  // Navigation & Drawer states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Modal target states
  const [auditTarget, setAuditTarget] = useState<{
    project: ProjectContract;
    milestone: Milestone;
  } | null>(null);

  const [submissionTarget, setSubmissionTarget] = useState<{
    project: ProjectContract;
    milestone: Milestone;
  } | null>(null);

  const [revisionTarget, setRevisionTarget] = useState<{
    project: ProjectContract;
    milestone: Milestone;
  } | null>(null);

  const [payPalTarget, setPayPalTarget] = useState<{
    project: ProjectContract;
    milestone: Milestone;
  } | null>(null);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#F8FAFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* 
        SUBTLE AMBIENT WEBTHREADS BACKGROUND:
        Low opacity (25%-30%) so all dashboard data is crisp and 100% readable
      */}
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none opacity-30 dark:opacity-20 transition-opacity">
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

      {/* AMBIENT LIGHTING ORB */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/10 via-sky-500/10 to-teal-400/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* SIDEBAR NAVIGATION (Desktop static, mobile slide-over) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
      />

      {/* MAIN CONTENT CONTAINER (Padded left for desktop sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 relative z-10">
        {/* HEADER */}
        <DashboardHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        />

        {/* TOAST FEEDBACK NOTIFICATION */}
        {toast && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md rounded-2xl border border-blue-300 bg-white/95 p-4 text-xs shadow-2xl backdrop-blur-xl dark:border-blue-500/40 dark:bg-[#0D182E]/95 text-slate-900 dark:text-white animate-in slide-in-from-top-4 duration-300 flex items-start gap-3">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-xl text-white shrink-0 ${
                toast.type === "success"
                  ? "bg-emerald-500"
                  : toast.type === "warning"
                  ? "bg-amber-500"
                  : "bg-[#0070BA]"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : toast.type === "warning" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1">
              <span className="font-bold block text-slate-900 dark:text-white">
                MilestoneOS Update
              </span>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={hideToast}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* MAIN BODY AREA */}
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full">
          {activeTab === "overview" && (
            <>
              {role === "client" ? (
                <ClientOverview
                  onOpenAudit={(p, m) => setAuditTarget({ project: p, milestone: m })}
                  onOpenRevision={(p, m) => setRevisionTarget({ project: p, milestone: m })}
                  onOpenPayPal={(p, m) => setPayPalTarget({ project: p, milestone: m })}
                  onOpenNewProject={() => setIsNewProjectModalOpen(true)}
                />
              ) : (
                <FreelancerOverview
                  onOpenSubmission={(p, m) => setSubmissionTarget({ project: p, milestone: m })}
                  onOpenAudit={(p, m) => setAuditTarget({ project: p, milestone: m })}
                />
              )}
            </>
          )}

          {activeTab === "projects" && (
            <ProjectWorkspace
              onOpenAudit={(p, m) => setAuditTarget({ project: p, milestone: m })}
              onOpenSubmission={(p, m) => setSubmissionTarget({ project: p, milestone: m })}
              onOpenRevision={(p, m) => setRevisionTarget({ project: p, milestone: m })}
              onOpenPayPal={(p, m) => setPayPalTarget({ project: p, milestone: m })}
              onOpenEditProject={() => setIsEditProjectModalOpen(true)}
            />
          )}

          {activeTab === "milestones" && (
            <MilestonesView
              onOpenAudit={(p, m) => setAuditTarget({ project: p, milestone: m })}
              onOpenSubmission={(p, m) => setSubmissionTarget({ project: p, milestone: m })}
              onOpenRevision={(p, m) => setRevisionTarget({ project: p, milestone: m })}
              onOpenPayPal={(p, m) => setPayPalTarget({ project: p, milestone: m })}
            />
          )}

          {activeTab === "ai-audits" && (
            <AIAuditCenter
              onOpenAudit={(p, m) => setAuditTarget({ project: p, milestone: m })}
            />
          )}

          {activeTab === "payments" && (
            <PaymentsView
              onOpenPayPal={(p, m) => setPayPalTarget({ project: p, milestone: m })}
            />
          )}
        </main>

        {/* FOOTER */}
        <footer className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-transparent backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              MilestoneOS • PayPal AI Hackathon 2026 • Verified Milestones & Secure PayPal Payouts
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              PayPal Orders v2 Escrow Active
            </span>
          </div>
        </footer>
      </div>

      {/* NOTIFICATION DRAWER */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* AUDIT / INSPECTION MODAL */}
      {auditTarget && (
        <AuditModal
          project={auditTarget.project}
          milestone={auditTarget.milestone}
          isOpen={true}
          onClose={() => setAuditTarget(null)}
          onOpenRevisionModal={() => {
            const t = auditTarget;
            setAuditTarget(null);
            setRevisionTarget(t);
          }}
          onOpenPayPalModal={() => {
            const t = auditTarget;
            setAuditTarget(null);
            setPayPalTarget(t);
          }}
        />
      )}

      {/* SUBMISSION MODAL */}
      {submissionTarget && (
        <SubmissionModal
          project={submissionTarget.project}
          milestone={submissionTarget.milestone}
          isOpen={true}
          onClose={() => setSubmissionTarget(null)}
        />
      )}

      {/* REVISION REQUEST MODAL */}
      {revisionTarget && (
        <RevisionRequestModal
          project={revisionTarget.project}
          milestone={revisionTarget.milestone}
          isOpen={true}
          onClose={() => setRevisionTarget(null)}
        />
      )}

      {/* PAYPAL SANDBOX PAYMENT MODAL */}
      {payPalTarget && (
        <PayPalPaymentModal
          project={payPalTarget.project}
          milestone={payPalTarget.milestone}
          isOpen={true}
          onClose={() => setPayPalTarget(null)}
        />
      )}

      {/* CREATE NEW PROJECT MODAL */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />

      {/* EDIT PROJECT MODAL */}
      {activeProject && (
        <EditProjectModal
          project={activeProject}
          isOpen={isEditProjectModalOpen}
          onClose={() => setIsEditProjectModalOpen(false)}
        />
      )}
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "freelancer" ? "freelancer" : "client";

  return (
    <DashboardProvider initialRole={initialRole}>
      <DashboardInner />
    </DashboardProvider>
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
