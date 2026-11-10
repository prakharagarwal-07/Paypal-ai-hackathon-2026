"use client";

import { ProjectContract, Milestone } from "@/lib/dashboard-data";
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  Receipt,
  User,
  ExternalLink,
  Star,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PayPalIcon } from "./icons";

interface CompletedProjectModalProps {
  project: ProjectContract | null;
  isOpen: boolean;
  onClose: () => void;
  onViewWorkspace: (projectId: string) => void;
  onOpenInvoice?: (project: ProjectContract, milestone: Milestone, transactionId?: string) => void;
}

export default function CompletedProjectModal({
  project,
  isOpen,
  onClose,
  onViewWorkspace,
  onOpenInvoice,
}: CompletedProjectModalProps) {
  if (!isOpen || !project) return null;

  const totalMilestones = project.milestones.length;
  const paidMilestones = project.milestones.filter((m) => m.status === "paid").length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-white/10 bg-gradient-to-r from-emerald-50/70 via-white to-blue-50/50 dark:from-emerald-950/20 dark:via-[#0D1527] dark:to-blue-950/20 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>100% Completed & Fully Paid</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ID: {project.id}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {project.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {project.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* 1. Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                Total Settled
              </span>
              <span className="font-mono text-lg font-black text-emerald-700 dark:text-emerald-300">
                ${project.totalPaid.toLocaleString()} USD
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                100% via PayPal Sandbox
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Milestones
              </span>
              <span className="font-mono text-lg font-black text-slate-900 dark:text-white">
                {paidMilestones}/{totalMilestones}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                All stages approved
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Completion Date
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5 truncate">
                {project.targetDeadline}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                On Schedule
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
                Client Rating
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-black text-base text-amber-700 dark:text-amber-300">5.0</span>
                <div className="flex text-amber-500">
                  {"★★★★★"}
                </div>
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">
                Verified Delivery
              </span>
            </div>
          </div>

          {/* 2. Important Dates & Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#0070BA] dark:text-sky-400" />
              <span>Important Dates & Project Timeline</span>
            </h3>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Project Kickoff</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {project.createdAt}
                </span>
                <span className="text-[11px] text-slate-500">Contract signed & initiated</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Final Delivery Date</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {project.targetDeadline}
                </span>
                <span className="text-[11px] text-slate-500">All deliverables verified</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Final Payment Settlement</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {project.targetDeadline}
                </span>
                <span className="text-[11px] text-slate-500">100% balance cleared</span>
              </div>
            </div>

            {/* Parties */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white dark:border-white/5 dark:bg-[#0D1527] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                  {project.client.avatar}
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Client</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    {project.client.name} • {project.client.company}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center font-bold text-[#0070BA] dark:text-sky-300 text-xs">
                  {project.freelancer.avatar}
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Freelancer</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    {project.freelancer.name} • {project.freelancer.title}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Details of Payments (Core request) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-emerald-500" />
                <span>Payment Details & Milestone Receipts ({project.milestones.length})</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ${project.totalPaid.toLocaleString()} USD Total Paid
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0D1527]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                    <tr>
                      <th className="p-3">Stage / Milestone</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date Paid</th>
                      <th className="p-3">PayPal Transaction ID</th>
                      <th className="p-3 text-right">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {project.milestones.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            Stage 0{m.stageNumber}: {m.title}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                            {m.description}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          ${m.amount.toLocaleString()} USD
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {m.paidAt || m.dueDate}
                        </td>
                        <td className="p-3 font-mono text-[11px] font-medium text-[#0070BA] dark:text-sky-400 whitespace-nowrap">
                          {m.paypalTransactionId || "PAYID-SBX-COMPLETED"}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              <span>Paid</span>
                            </span>
                            {onOpenInvoice && (
                              <button
                                type="button"
                                onClick={() => onOpenInvoice(project, m, m.paypalTransactionId)}
                                className="text-xs text-[#0070BA] dark:text-sky-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="h-3 w-3" />
                                <span>AI Invoice</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 4. Verified Acceptance Criteria & Deliverables */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              <span>Completed Deliverables & Acceptance Checklist</span>
            </h3>

            <div className="space-y-2.5">
              {project.milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/40 dark:border-white/5 dark:bg-white/[0.02] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Stage 0{m.stageNumber}: {m.title}
                    </span>
                    {m.submissions && m.submissions.length > 0 && (
                      m.submissions[0].deliverableLinks && m.submissions[0].deliverableLinks.length > 0 ? (
                        <a
                          href={m.submissions[0].deliverableLinks[0].url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0070BA] dark:text-sky-400 hover:underline"
                        >
                          <span>{m.submissions[0].deliverableLinks[0].title || "Verified Deliverable"}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : m.submissions[0].demoUrl ? (
                        <a
                          href={m.submissions[0].demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0070BA] dark:text-sky-400 hover:underline"
                        >
                          <span>Verified Deliverable Demo</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {m.acceptanceCriteria.map((crit) => (
                      <div
                        key={crit.id}
                        className="flex items-start gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0D1527] p-2 rounded-xl border border-slate-200/60 dark:border-white/5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] font-semibold text-slate-900 dark:text-white">
                            {crit.title}
                          </strong>
                          {crit.description && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                              {crit.description}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onViewWorkspace(project.id);
            }}
            className="px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005a96] cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Open Full Project Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
