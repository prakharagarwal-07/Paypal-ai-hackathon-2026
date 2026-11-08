"use client";

import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Receipt,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { PayPalIcon } from "./icons";
import { useState } from "react";

interface PaymentsViewProps {
  onOpenPayPal: (project: ProjectContract, milestone: Milestone) => void;
}

export default function PaymentsView({ onOpenPayPal }: PaymentsViewProps) {
  const { projects, transactions, role } = useDashboard();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate totals
  const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0);
  const totalReleased = projects.reduce((sum, p) => sum + p.escrowReleased, 0);
  const totalLocked = totalBudget - totalReleased;

  // Milestones approved for payment / awaiting action
  const approvedAwaitingPayment = projects.flatMap((p) =>
    p.milestones
      .filter((m) => m.status === "payment_pending")
      .map((m) => ({ project: p, milestone: m }))
  );

  const copyTxId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Escrow Vault Summary */}
      <div className="p-6 sm:p-8 rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-sky-50/30 to-white dark:border-blue-500/20 dark:from-[#0D182E] dark:via-[#091124] dark:to-[#070B14] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-400/10 dark:text-sky-300">
              <PayPalIcon className="h-4 w-4" />
              <span>PayPal Sandbox Orders v2 Vault</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Escrow Vault & Payout Ledger
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every milestone contract is backed by PayPal Escrow. Funds are locked at contract signing and released immediately to the freelancer upon criteria satisfaction.
            </p>
          </div>

          {/* Vault breakdown strip */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Escrow Locked
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-[#0070BA] dark:text-sky-300 block mt-0.5">
                ${totalLocked.toLocaleString()} USD
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#131C31] border border-slate-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Disbursed
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                ${totalReleased.toLocaleString()} USD
              </span>
            </div>
          </div>
        </div>

        {/* Sandbox Disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#0070BA] dark:text-sky-400 shrink-0" />
          <span>
            <strong className="text-slate-700 dark:text-slate-300">Demonstration Simulation:</strong> Payouts interact with PayPal's simulated Orders v2 authorization flow generating sandbox receipts. No real currency is transferred.
          </span>
        </div>
      </div>

      {/* 2. Milestones Approved for Payment (Awaiting Action) */}
      {approvedAwaitingPayment.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Approved Milestones Ready for Payout ({approvedAwaitingPayment.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedAwaitingPayment.map(({ project, milestone }) => (
              <div
                key={milestone.id}
                className="p-5 rounded-3xl border border-emerald-300 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-950/20 shadow-xs flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-300">
                    Stage 0{milestone.stageNumber} • {project.title}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {milestone.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-1">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      ${milestone.amount.toLocaleString()} USD
                    </span>
                    <span>•</span>
                    <span>Recipient: {project.freelancer.name}</span>
                  </div>
                </div>

                {role === "client" ? (
                  <button
                    type="button"
                    onClick={() => onOpenPayPal(project, milestone)}
                    className="btn-gradient-glow px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <PayPalIcon className="h-4 w-4" />
                    <span>Release Funds</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                    Awaiting Client Payout
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Transaction History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              PayPal Settlement History ({transactions.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable ledger of milestone releases and sandbox transaction IDs.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Transaction Reference</th>
                  <th className="p-4">Contract & Stage</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Parties</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#0070BA] dark:text-sky-300">
                          {tx.paypalTransactionId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyTxId(tx.paypalTransactionId)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
                          title="Copy ID"
                        >
                          {copiedId === tx.paypalTransactionId ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        PayPal Orders v2 Capture
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[220px]">
                        {tx.milestoneTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[220px]">
                        {tx.projectTitle}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${tx.amount.toLocaleString()}.00 USD
                    </td>

                    <td className="p-4">
                      <div className="text-[11px]">
                        <span className="text-slate-400">To:</span>{" "}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tx.payee}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        From: {tx.payer}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {tx.paidAt}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" />
                        Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
