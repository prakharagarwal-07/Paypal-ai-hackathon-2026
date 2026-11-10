"use client";

import { useState } from "react";
import { X, CheckCircle2, RefreshCw, Receipt, FolderGit2, Sparkles } from "lucide-react";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import { PayPalIcon } from "./icons";
import { useDashboard } from "@/lib/dashboard-store";

interface PayPalPaymentModalProps {
  project: ProjectContract;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onOpenInvoice?: (project: ProjectContract, milestone: Milestone, transactionId?: string) => void;
}

export default function PayPalPaymentModal({
  project,
  milestone,
  isOpen,
  onClose,
  onOpenInvoice,
}: PayPalPaymentModalProps) {
  const { makePayment } = useDashboard();
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptTxId, setReceiptTxId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const txId = makePayment(project.id, milestone.id);
      setIsProcessing(false);
      setReceiptTxId(txId);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1527] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <PayPalIcon className="h-5 w-5" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              PayPal Checkout
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {receiptTxId ? (
          /* Completed Receipt */
          <div className="text-center py-3 space-y-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
                Payment Completed
              </span>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ${milestone.amount.toLocaleString()}.00 USD
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paid to {project.freelancer.name} via PayPal Sandbox
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{receiptTxId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Milestone:</span>
                <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{milestone.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 truncate max-w-[220px]">
                  <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400 shrink-0" />
                  {project.title}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenInvoice) {
                    onOpenInvoice(project, milestone, receiptTxId || undefined);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#0070BA] hover:from-purple-500 hover:to-[#005a96] text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Download AI Settlement Invoice & Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Pre-Payment Review */
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Milestone:</span>
                <span className="font-bold text-slate-900 dark:text-white">{milestone.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 truncate max-w-[220px]">
                  <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400 shrink-0" />
                  {project.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Freelancer:</span>
                <span className="text-slate-700 dark:text-slate-300">{project.freelancer.name}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="font-bold text-slate-900 dark:text-white">Amount:</span>
                <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                  ${milestone.amount.toLocaleString()}.00 USD
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Funds are securely transferred directly to {project.freelancer.name}&apos;s verified PayPal account.
            </p>

            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <PayPalIcon className="h-4 w-4" />
                  <span>Pay ${milestone.amount.toLocaleString()} with PayPal Sandbox</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
