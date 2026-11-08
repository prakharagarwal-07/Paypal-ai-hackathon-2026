"use client";

import { useState } from "react";
import { X, ShieldCheck, CheckCircle2, RefreshCw, ArrowRight, ExternalLink, Receipt } from "lucide-react";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import { PayPalIcon } from "./icons";
import { useDashboard } from "@/lib/dashboard-store";

interface PayPalPaymentModalProps {
  project: ProjectContract;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
}

export default function PayPalPaymentModal({
  project,
  milestone,
  isOpen,
  onClose,
}: PayPalPaymentModalProps) {
  const { releasePayPalPayment } = useDashboard();
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptTxId, setReceiptTxId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthorizePayout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const txId = releasePayPalPayment(project.id, milestone.id);
      setIsProcessing(false);
      setReceiptTxId(txId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col transition-all">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-white/10 bg-[#003087]/5 dark:bg-[#003087]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0070BA]/10 text-[#0070BA] dark:text-sky-400">
              <PayPalIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>PayPal Sandbox Checkout</span>
              </h2>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                Orders v2 Escrow Release
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {receiptTxId ? (
            /* COMPLETED RECEIPT */
            <div className="text-center py-4 space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-400/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Payment Completed
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  ${milestone.amount.toLocaleString()}.00 USD
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Disbursed from Escrow Vault to {project.freelancer.name}
                </p>
              </div>

              {/* Receipt Details Box */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 dark:border-white/10 dark:bg-white/5 text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">PayPal Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{receiptTxId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Contract Stage:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Stage 0{milestone.stageNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Recipient Account:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{project.freelancer.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Verification Engine:</span>
                  <span className="text-[#0070BA] dark:text-sky-300 font-semibold">Gemini 2.5 Flash (Audit Passed)</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-2 font-bold">
                  <span>Status:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">COMPLETED & SETTLED</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Close Receipt
              </button>
            </div>
          ) : (
            /* PRE-PAYOUT BREAKDOWN */
            <>
              {/* Sandbox Notice */}
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 dark:bg-[#0070BA]/10 dark:border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0070BA] dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <span className="font-bold">PayPal Sandbox Simulation:</span> Releasing escrow funds initiates the PayPal Orders v2 capture flow, transferring guaranteed funds to the freelancer's account.
                </p>
              </div>

              {/* Milestone Details Card */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 dark:border-white/10 dark:bg-white/5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Authorized Milestone
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Stage 0{milestone.stageNumber}: {milestone.title}
                    </h4>
                  </div>
                  <span className="text-lg font-black text-[#0070BA] dark:text-sky-300 font-mono">
                    ${milestone.amount.toLocaleString()}.00
                  </span>
                </div>

                <div className="divide-y divide-slate-200/80 dark:divide-white/10 text-xs pt-1">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Payer (Client):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{project.client.name}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">Payee (Freelancer):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{project.freelancer.name}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500">PayPal Processing Fee:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">$0.00 USD (Sandbox)</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between font-bold">
                    <span>Total Payout:</span>
                    <span className="font-mono text-base text-slate-900 dark:text-white">${milestone.amount.toLocaleString()}.00 USD</span>
                  </div>
                </div>
              </div>

              {/* Authorize Button */}
              <button
                type="button"
                onClick={handleAuthorizePayout}
                disabled={isProcessing}
                className="w-full btn-gradient-glow py-3.5 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing PayPal Sandbox Capture...</span>
                  </>
                ) : (
                  <>
                    <PayPalIcon className="h-4 w-4" />
                    <span>Authorize & Disburse ${milestone.amount.toLocaleString()} Payout</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
