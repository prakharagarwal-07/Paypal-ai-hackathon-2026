"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract, TransactionRecord } from "@/lib/dashboard-data";
import { CheckCircle2, Clock, Copy, Check, X, FolderGit2, Sparkles, Download, Receipt } from "lucide-react";
import { PayPalIcon } from "./icons";
import { useState } from "react";

interface PaymentsViewProps {
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
  onOpenInvoice?: (project: ProjectContract, milestone: Milestone, transactionId?: string) => void;
}

export default function PaymentsView({ onOpenPayPal, onOpenInvoice }: PaymentsViewProps) {
  const { projects, transactions, role } = useDashboard();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  // 1. Payments to Make (milestones approved and ready for payment)
  const paymentsToMake = projects.flatMap((p) =>
    p.milestones
      .filter((m) => m.status === "approved" || m.status === "payment_pending")
      .map((m) => ({ project: p, milestone: m }))
  );

  const copyTxId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenInvoice = (tx: TransactionRecord) => {
    if (!onOpenInvoice) return;
    const project = projects.find((p) => p.id === tx.projectId) || projects[0];
    const milestone =
      project?.milestones.find((m) => m.title === tx.milestoneTitle) ||
      project?.milestones[0] || {
        id: tx.id,
        stageNumber: 1,
        title: tx.milestoneTitle,
        description: `Delivered milestone under ${tx.projectTitle}`,
        amount: tx.amount,
        currency: tx.currency,
        dueDate: tx.paidAt,
        paidAt: tx.paidAt,
        status: "paid" as const,
        acceptanceCriteria: [],
        submissions: [],
        paypalTransactionId: tx.paypalTransactionId,
      };

    onOpenInvoice(project, milestone, tx.paypalTransactionId);
  };

  return (
    <div className="space-y-8">
      {/* 1. Clear, Simple Heading & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Payments & Transactions
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          View payments made and payments waiting to be completed.
        </p>
      </div>

      {/* SECTION 1: Payments to Make */}
      <div id="payments-to-make" className="space-y-3 scroll-mt-24">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Payments to Make ({paymentsToMake.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Approved milestones waiting for payment release.
          </p>
        </div>

        {paymentsToMake.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
            No payments are waiting to be made right now.
          </div>
        ) : (
          <div className="space-y-3">
            {paymentsToMake.map(({ project, milestone }) => (
              <div
                key={milestone.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 shadow-2xs">
                      <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400" />
                      Project: {project.title}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Freelancer: <strong className="text-slate-700 dark:text-slate-300 font-medium">{project.freelancer.name}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Amount Due</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      ${milestone.amount.toLocaleString()} USD
                    </span>
                  </div>

                  {role === "client" ? (
                    <button
                      type="button"
                      onClick={() => onOpenPayPal(project, milestone)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <PayPalIcon className="h-3.5 w-3.5" />
                      <span>Pay Now</span>
                    </button>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      Awaiting Client Payment
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Transaction History */}
      <div id="transaction-history" className="space-y-3 scroll-mt-24">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Transaction History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A complete record of all completed milestone transactions. Click any transaction to view details.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0D1527] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                <tr>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Project / Milestone</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Settlement Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-mono font-medium text-[#0070BA] dark:text-sky-300">
                      {tx.paypalTransactionId}
                    </td>
                    <td className="p-3.5 text-slate-500">{tx.paidAt}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {tx.milestoneTitle}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Project: {tx.projectTitle}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      ${tx.amount.toLocaleString()} USD
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Completed
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInvoice(tx);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>AI Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1527] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Transaction Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedTx.paypalTransactionId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedTx.paidAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Milestone:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedTx.milestoneTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40">
                  <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400" />
                  {selectedTx.projectTitle}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedTx.payee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sender:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedTx.payer}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Amount Paid:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white">
                  ${selectedTx.amount.toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  const tx = selectedTx;
                  setSelectedTx(null);
                  handleOpenInvoice(tx);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Download AI Settlement Invoice & Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
